import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

export function verifiedRun(run, repository, sha) {
  return run.head_sha === sha && run.head_branch === 'develop' &&
    run.head_repository?.full_name === repository && run.event === 'push' &&
    run.status === 'completed' && run.conclusion === 'success';
}

export function verifiedArtifact(artifacts, runId, sha) {
  const matches = artifacts.filter(a => a.name === 'github-pages');
  if (matches.length !== 1) throw new Error('Expected one Pages artifact');
  const artifact = matches[0];
  if (artifact.expired || !(artifact.size_in_bytes > 0) ||
      artifact.workflow_run?.id !== runId || artifact.workflow_run?.head_sha !== sha) {
    throw new Error('Pages artifact provenance or retention check failed');
  }
  return artifact;
}

async function main() {
  const { GITHUB_REPOSITORY: repository, GITHUB_SHA: sha, GITHUB_REF: ref,
    GITHUB_TOKEN: token, GITHUB_API_URL: api = 'https://api.github.com' } = process.env;
  if (ref !== 'refs/heads/main' || !/^[a-f0-9]{40}$/.test(sha ?? '') || !token) {
    throw new Error('Publishing requires an authenticated main checkout');
  }
  const base = `/repos/${repository}`;
  async function request(path, body) {
    const response = await fetch(`${api}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`GitHub request failed: ${response.status} ${path}`);
    return response.json();
  }
  const branch = await request(`${base}/branches/main`);
  if (branch.commit.sha !== sha) throw new Error('Main advanced; refuse stale publication');
  const runs = await request(`${base}/actions/workflows/docs-ci.yml/runs?branch=develop&event=push&head_sha=${sha}&status=success&per_page=100`);
  const run = runs.workflow_runs.find(r => verifiedRun(r, repository, sha));
  if (!run) throw new Error('No successful exact-SHA develop CI; build and verify there first');
  const jobs = await request(`${base}/actions/runs/${run.id}/jobs?per_page=100`);
  for (const name of ['verify', 'facts-live']) {
    if (!jobs.jobs.some(j => j.name === name && j.conclusion === 'success')) {
      throw new Error(`Required CI job did not succeed: ${name}`);
    }
  }
  const { artifacts } = await request(`${base}/actions/runs/${run.id}/artifacts?per_page=100`);
  const artifact = verifiedArtifact(artifacts, run.id, sha);
  console.log(`Reusing verified Pages artifact ${artifact.id} from ${run.html_url}`);
  const oidc = await fetch(process.env.ACTIONS_ID_TOKEN_REQUEST_URL, {
    headers: { Authorization: `Bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}` },
    signal: AbortSignal.timeout(30000),
  });
  if (!oidc.ok) throw new Error(`OIDC request failed: ${oidc.status}`);
  const { value: oidcToken } = await oidc.json();
  if (!oidcToken) throw new Error('OIDC token missing');
  const deployment = await request(`${base}/pages/deployments`, {
    artifact_id: artifact.id, pages_build_version: sha, oidc_token: oidcToken,
  });
  const id = deployment.id || deployment.status_url?.split('/').pop();
  if (!id) throw new Error('Pages returned no deployment identifier');
  console.log(`Pages deployment ${id} created for ${sha}`);
  for (let i = 0; i < 100; i++) {
    await delay(5000);
    const status = await request(`${base}/pages/deployments/${encodeURIComponent(id)}`);
    if (status.status === 'succeed') {
      if (process.env.GITHUB_OUTPUT && deployment.page_url) {
        appendFileSync(process.env.GITHUB_OUTPUT, `page_url=${deployment.page_url}\n`);
      }
      console.log('Pages deployment succeeded');
      return;
    }
    if (['deployment_failed', 'deployment_content_failed', 'deployment_cancelled', 'deployment_lost'].includes(status.status)) {
      throw new Error(`Pages deployment failed: ${status.status}`);
    }
  }
  throw new Error(`Pages deployment ${id} remains pending; inspect it before retrying`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
