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

const response = await fetch(facts.productFactsEndpoint, { headers: { accept: "application/json" } });
if (!response.ok) {
  console.error(`live check: ${facts.productFactsEndpoint} answered ${response.status}`);
  process.exit(1);
}
const live = await response.json();

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
