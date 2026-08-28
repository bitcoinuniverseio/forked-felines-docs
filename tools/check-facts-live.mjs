/**
 * Compares facts/facts.json with the live public product contract. Run on a
 * schedule and before releases; a mismatch means the product changed and the
 * documentation must be re-verified, page by page, before republishing.
 */
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
  process.exit(1);
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
  console.error(`live facts check: ${errors.length} mismatch(es)\n`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}
console.log(`live facts check: OK against ${facts.productFactsEndpoint}`);
