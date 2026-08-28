/**
 * The publication gate. Everything here must pass before the House Manual
 * builds or publishes: em dashes, stale facts, broken links, missing images,
 * missing alt text, and any term that belongs to the private side of the
 * house. Fails loudly, lists everything, fixes nothing.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (["node_modules", ".git", "_site"].includes(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

const textExtensions = /\.(md|json|yml|yaml|mjs|js|css|svg|html|txt)$/;
const files = [...walk(root)].filter((file) => textExtensions.test(file));
const markdownFiles = files.filter((file) => file.endsWith(".md"));

/* 1. Not one em dash anywhere a person can read. */
const emDash = String.fromCharCode(0x2014);
for (const file of files) {
  const content = readFileSync(file, "utf8");
  if (content.includes(emDash)) {
    const line = content.slice(0, content.indexOf(emDash)).split("\n").length;
    errors.push(`${relative(root, file)}:${line}: em dash. Use a period, comma, colon, semicolon, or parentheses.`);
  }
}

/* 2. The facts file is pinned; drift here is a product event, not a docs edit. */
const facts = JSON.parse(readFileSync(join(root, "facts", "facts.json"), "utf8"));
const pinned = {
  schemaVersion: "forked-felines.public-product/v5",
  pricingVersion: "forked-felines.community-remediation/v4",
  maximumSupply: 3333,
  publicMintPriceSats: 8888,
  communityMintPriceSats: 0,
  baseServiceFeeSats: 1500,
  rbfServiceFeeIncrementSats: 1500,
  holderSnapshotBlockHeight: 963238,
  knotHeadsAllowlistSize: 1110,
  quoteTtlSeconds: 900,
  orderTtlSeconds: 3600,
};
for (const [key, value] of Object.entries(pinned)) {
  if (facts[key] !== value) errors.push(`facts/facts.json: ${key} is ${JSON.stringify(facts[key])}, expected ${JSON.stringify(value)}`);
}

/* 3. Required fact tokens in the pages that state them. */
const requiredCopy = new Map([
  ["README.md", ["3,333", "8,888", "1,500", "963,238", "community-remediation/v4", "forkedfelines.art"]],
  ["docs/reference/official-product-facts.md", ["3,333", "8,888", "1,500", "963,238", "1,110", "public-product/v5", "community-remediation/v4", "BRC 2.0"]],
  ["docs/collectors/prices-and-fees.md", ["8,888", "1,500", "15 minutes"]],
  ["docs/collectors/community-credits.md", ["963,238", "1,110", "0 sats"]],
  ["docs/start-here/what-is-forked-felines.md", ["3,333", "8,888", "963,238"]],
  ["docs/collection/knot-heads-relationship.md", ["963,238", "1,110", "BRC 2.0"]],
]);
for (const [file, tokens] of requiredCopy) {
  const content = readFileSync(join(root, file), "utf8");
  for (const token of tokens) {
    if (!content.includes(token)) errors.push(`${file}: missing required fact token "${token}"`);
  }
}

/* 4. Stale prices may only appear beside the word "historical" on the same page. */
const historicalOnly = ["11,000", "16,161", "22,222", "33,333", "4,440"];
for (const file of markdownFiles) {
  const content = readFileSync(file, "utf8");
  for (const price of historicalOnly) {
    if (content.includes(price) && !/historical/i.test(content)) {
      errors.push(`${relative(root, file)}: states retired price ${price} without marking it historical`);
    }
  }
}

/* 5. Private-side terms and secret shapes never publish. */
const privateTerms = [
  /PowerVPS/i, /Hostinger/i, /Netcup/i, /srv747890/, /hstgr/i, /Fulcrum/i,
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
  /127\.0\.0\.1:\d+/, /localhost:\d+/,
  /universe-indexer/i, /universe-linux/i, /universe-win/i, /universe-runner/i,
  /ghp_[A-Za-z0-9]{20,}/, /github_pat_[A-Za-z0-9_]{20,}/,
  /AKIA[0-9A-Z]{16}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\b(xprv|tprv)[a-km-zA-HJ-NP-Z1-9]{20,}\b/,
  /\bK00[0-9A-Za-z/+]{20,}\b/,
  /forked-felines-studio/, /forked-felines-art\b/, /release inventory/i,
  /\bcop_[a-z_]+\b/, /FORKED_FELINES_[A-Z_]+=/,
  /\bredis:\/\//i, /\bpostgres(?:ql)?:\/\//i,
  /\/etc\/forked-felines/, /\/etc\/universe/, /ProgramData/,
];
for (const file of files) {
  if (file.includes("tools") && file.endsWith("check-docs.mjs")) continue;
  const content = readFileSync(file, "utf8");
  for (const pattern of privateTerms) {
    const match = content.match(pattern);
    if (match) errors.push(`${relative(root, file)}: private term or secret shape "${match[0]}" must not publish`);
  }
}

/* 6. The word the workspace retired. */
for (const file of markdownFiles) {
  const content = readFileSync(file, "utf8");
  if (/canonical/i.test(content)) errors.push(`${relative(root, file)}: uses the retired word "canonical"; say "authoritative", "the record", or name the source`);
}

/* 7. Relative links resolve; anchors point at real headings; images exist with alt text. */
function headingsOf(file) {
  const content = readFileSync(file, "utf8");
  return [...content.matchAll(/^#{1,6}\s+(.+)$/gm)].map(([, text]) =>
    text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-"));
}
for (const file of markdownFiles) {
  const content = readFileSync(file, "utf8");
  const dir = dirname(file);
  for (const [, alt, target] of content.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
    if (!alt.trim()) errors.push(`${relative(root, file)}: image ${target} has no alt text`);
    if (!/^https?:/.test(target) && !existsSync(join(dir, target.split("#")[0]))) {
      errors.push(`${relative(root, file)}: image ${target} does not exist`);
    }
  }
  for (const [whole, , target] of content.matchAll(/(^|[^!])\[[^\]]*\]\(([^)]+)\)/gm)) {
    if (/^(https?:|mailto:)/.test(target)) continue;
    const [pathPart, anchor] = target.split("#");
    const destination = pathPart ? join(dir, pathPart) : file;
    if (pathPart && !existsSync(destination)) {
      errors.push(`${relative(root, file)}: broken link ${target}`);
      continue;
    }
    if (anchor && destination.endsWith(".md") && !headingsOf(destination).includes(anchor)) {
      errors.push(`${relative(root, file)}: anchor #${anchor} not found in ${pathPart || "this page"}`);
    }
    void whole;
  }
}

/* 8. Sat amounts read as integers with separators, never decimals. */
for (const file of markdownFiles) {
  const content = readFileSync(file, "utf8");
  const badSats = content.match(/\b\d+\.\d+\s?sats?\b/);
  if (badSats) errors.push(`${relative(root, file)}: "${badSats[0]}" uses a decimal sat amount; sats are integers`);
}

if (errors.length) {
  console.error(`publication gate: ${errors.length} problem(s)\n`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}
console.log(`publication gate: OK (${files.length} files scanned, ${markdownFiles.length} Markdown pages)`);
