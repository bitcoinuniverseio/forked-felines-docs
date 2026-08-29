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
   and only the second is a documentation event. */
async function fetchLive() {
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(facts.productFactsEndpoint, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error(`answered ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < 4) await new Promise((resolve) => setTimeout(resolve, attempt * 5_000));
    }
  }
  console.error(`live check: ${facts.productFactsEndpoint} unreachable after 4 attempts: ${lastError}`);
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
