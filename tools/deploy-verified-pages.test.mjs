import test from 'node:test';
import assert from 'node:assert/strict';
import { verifiedRun, verifiedArtifact } from './deploy-verified-pages.mjs';

const sha = 'a'.repeat(40);
const run = { id: 42, head_sha: sha, head_branch: 'develop',
  head_repository: { full_name: 'example/docs' }, event: 'push', status: 'completed', conclusion: 'success' };
test('reuse requires exact SHA and successful trusted develop push', () => {
  assert.equal(verifiedRun(run, 'example/docs', sha), true);
  for (const patch of [{ head_sha: 'b'.repeat(40) }, { head_branch: 'main' },
    { head_repository: { full_name: 'fork/docs' } }, { event: 'pull_request' },
    { status: 'in_progress' }, { conclusion: 'skipped' }, { conclusion: 'failure' }]) {
    assert.equal(verifiedRun({ ...run, ...patch }, 'example/docs', sha), false);
  }
});
test('artifact must be unique, retained, nonempty and bound to the verified run and SHA', () => {
  const artifact = { id: 7, name: 'github-pages', expired: false, size_in_bytes: 100,
    workflow_run: { id: 42, head_sha: sha } };
  assert.equal(verifiedArtifact([artifact], 42, sha).id, 7);
  for (const list of [[], [artifact, artifact], [{ ...artifact, expired: true }],
    [{ ...artifact, size_in_bytes: 0 }], [{ ...artifact, workflow_run: { id: 43, head_sha: sha } }],
    [{ ...artifact, workflow_run: { id: 42, head_sha: 'b'.repeat(40) } }]]) {
    assert.throws(() => verifiedArtifact(list, 42, sha));
  }
});
