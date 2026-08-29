/**
 * Compares facts/facts.json with the live public product contract. Run on a
 * schedule and before releases; a mismatch means the product changed and the
 * documentation must be re-verified, page by page, before republishing.
 *
 * Two failures live here and they are not the same event:
 *
 *   exit 1   the endpoint answered and the facts disagree. Documentation
 *            drift. Never publish. Re-verify the pages, then update facts.
 *   exit 75  the endpoint could not be reached at all. Nothing was learned
 *            about the facts in either direction.
 *
 * They used to share exit 1, which meant a runner that could not open a
 * socket blocked the publication of documentation that was correct, while
 * the site went on serving an older build. That is strictly worse than
 * publishing. The facts are not unguarded while the endpoint is
 * unreachable: check-docs.mjs pins every one of them offline and runs
 * first in both workflows.
 *
 * 75 is EX_TEMPFAIL from sysexits.h, which is what it means here.
 */
const EX_TEMPFAIL = 75;
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const facts = JSON.parse(readFileSync(join(root, "facts", "facts.json"), "utf8"));

/* The product answers from one origin; a runner's route to it can flake.
   Bounded retries separate "the network hiccuped" from "the facts moved",
   and only the second is a documentation event.

   Three different things used to land in one catch and leave as one exit
   code, which hid the case this gate exists for. A 404 is not a network
   fault: if the contract is renamed, moved, or version-bumped out from
   under the documentation, the endpoint answers, and reporting that as
   unreachable would publish the House Manual against facts nobody
   compared. So the decision is made on what the last attempt actually
   observed:

     no response at all      transient   nothing was learned
     5xx                     transient   it answered and is having a bad
                                         time; a deploy window looks like this
     429                     transient   rate limited, not moved
     any other 4xx           drift       the contract is not where the
                                         documentation says it is
     2xx, unparseable body   drift       it answered and it is not a contract

   The last attempt wins, with one exception. A 4xx that is not 429 is
   sticky: once the product has told us the contract is not there, later
   attempts dropping the path cannot unsay it. Without that clause a real
   404 followed by three refused connections exits 75 and publishes, which
   is the gate's core case being masked by noise.

   The exception is decided by the asymmetry rather than by likelihood.
   Wrongly exiting 1 costs a blocked publish: visible, recoverable, one
   re-run. Wrongly exiting 75 costs a silent publish against a contract
   nobody compared. Where the two costs are that lopsided, be wrong in the
   direction someone notices.

   The counter-argument, recorded because it is the thing that would
   change this: if some intermediary in front of the product answered 404
   while transiently failing, a healthy deploy would block a publish for
   no reason. Nothing in this path is known to do that. A container swap
   surfaces as 502 or 503, and a 404 from this endpoint means the route is
   genuinely not registered, which is the persistent condition rather than
   the transient one. Ordering never matters among no-response, 5xx and
   429, because all three answer 75 regardless. */
async function fetchLive() {
  let lastError;
  /* null means the product never answered on the most recent attempt. */
  let answeredStatus = null;
  let answeredUnparseable = false;
  /* Sticky: set by any attempt that saw the contract missing, never cleared. */
  let contractMissingStatus = null;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const pause = async () => {
      if (attempt < 4) await new Promise((resolve) => setTimeout(resolve, attempt * 5_000));
    };

    let response;
    try {
      response = await fetch(facts.productFactsEndpoint, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      lastError = error;
      answeredStatus = null;
      answeredUnparseable = false;
      await pause();
      continue;
    }

    answeredStatus = response.status;
    answeredUnparseable = false;
    if (response.status >= 400 && response.status < 500 && response.status !== 429) {
      contractMissingStatus ??= response.status;
    }

    if (!response.ok) {
      lastError = new Error(`answered ${response.status}`);
      await pause();
      continue;
    }

    try {
      return await response.json();
    } catch (error) {
      lastError = error;
      answeredUnparseable = true;
      await pause();
    }
  }

  const transient = answeredStatus === null || answeredStatus >= 500 || answeredStatus === 429;
  const endpoint = facts.productFactsEndpoint;

  if (contractMissingStatus !== null) {
    console.error(`live check: ${endpoint} answered ${contractMissingStatus} on at least one of 4 attempts`);
    console.error("live check: MISMATCH. The contract is not where the documentation says it is. Do not publish: find where it moved and update facts/facts.json.");
    process.exit(1);
  }

  if (answeredUnparseable) {
    console.error(`live check: ${endpoint} answered ${answeredStatus} with a body that is not JSON: ${lastError}`);
    console.error("live check: MISMATCH. It answered and it is not serving the contract, so the documented facts could not be compared to anything.");
    process.exit(1);
  }

  if (!transient) {
    console.error(`live check: ${endpoint} answered ${answeredStatus} on every one of 4 attempts`);
    console.error("live check: MISMATCH. The contract is not where the documentation says it is. Do not publish: find where it moved and update facts/facts.json.");
    process.exit(1);
  }

  /* Deliberately not a wider retry budget. Widening it trades a visible
     failure for a slower one and still fails whenever the path is out for
     longer than whatever number was chosen. */
  const reason = answeredStatus === null ? `unreachable after 4 attempts: ${lastError}` : `answered ${answeredStatus} after 4 attempts`;
  console.error(`live check: ${endpoint} ${reason}`);
  console.error("live check: UNREACHABLE, not a mismatch. The documented facts were not"
    + " compared, and nothing here suggests they moved.");
  process.exit(EX_TEMPFAIL);
}
const live = await fetchLive();

const errors = [];
const expect = (label, actual, wanted) => {
  if (actual !== wanted) errors.push(`${label}: live ${JSON.stringify(actual)} != documented ${JSON.stringify(wanted)}`);
};

expect("schemaVersion", live.schemaVersion, facts.schemaVersion);
expect("pricing.version", live.pricing?.version, facts.pricingVersion);
expect("collection.supply", live.collection?.supply, facts.maximumSupply);
expect("pricing.publicMintPriceSats", live.pricing?.publicMintPriceSats, String(facts.publicMintPriceSats));
expect("pricing.communityMintPriceSats", live.pricing?.communityMintPriceSats, String(facts.communityMintPriceSats));
expect("pricing.baseServiceFeeSats", live.pricing?.baseServiceFeeSats, String(facts.baseServiceFeeSats));
expect("pricing.rbfServiceFeeIncrementSats", live.pricing?.rbfServiceFeeIncrementSats, String(facts.rbfServiceFeeIncrementSats));
expect("holderSnapshot.blockHeight", live.holderSnapshot?.blockHeight, facts.holderSnapshotBlockHeight);
expect("timing.quoteTtlSeconds", live.timing?.quoteTtlSeconds, facts.quoteTtlSeconds);
expect("timing.orderTtlSeconds", live.timing?.orderTtlSeconds, facts.orderTtlSeconds);

if (errors.length) {
  console.error(`live facts check: MISMATCH, the live contract disagrees with facts/facts.json in ${errors.length} place(s)\n`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}
console.log(`live facts check: OK against ${facts.productFactsEndpoint}`);
