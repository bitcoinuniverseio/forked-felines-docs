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

/* 2b. The live-contract check must keep distinguishing its two failures.
   A mismatch is documentation drift and must never publish. Unreachable is a
   runner that could not open a socket, which says nothing about the facts, and
   collapsing the two back into one exit code silently restores the behaviour
   where a network fault blocks correct documentation while the site serves an
   older build. Both happened on 2026-08-29, 66 minutes apart, on two different
   hosted runners, one of which reached the endpoint in the same minute another
   could not. */
{
  const live = readFileSync(join(root, "tools", "check-facts-live.mjs"), "utf8");
  if (!live.includes("EX_TEMPFAIL = 75")) {
    errors.push("tools/check-facts-live.mjs: unreachable must exit 75, distinct from a mismatch");
  }
  if (!/process\.exit\(EX_TEMPFAIL\)/.test(live)) {
    errors.push("tools/check-facts-live.mjs: the unreachable path must exit EX_TEMPFAIL, not 1");
  }
  /* Asserting that EX_TEMPFAIL exists is not enough: what matters is which
     conditions reach it. A 404 means the contract moved, which is the event
     this gate exists to catch, and routing it to the transient exit would
     publish the House Manual against facts nobody compared. Only a missing
     response, a 5xx, or a 429 may be transient. */
  if (!/answeredStatus === null \|\| answeredStatus >= 500 \|\| answeredStatus === 429/.test(live)) {
    errors.push("tools/check-facts-live.mjs: only no-response, 5xx and 429 may exit 75; a 4xx means the contract moved");
  }
  if (!/answeredUnparseable/.test(live)) {
    errors.push("tools/check-facts-live.mjs: a 2xx with an unparseable body must fail as drift, not as unreachable");
  }
  for (const workflow of [".github/workflows/deploy-pages.yml", ".github/workflows/docs-ci.yml"]) {
    const content = readFileSync(join(root, workflow), "utf8");
    if (content.includes("run: node tools/check-facts-live.mjs")) {
      errors.push(`${workflow}: runs the live check bare, so an unreachable endpoint fails the build`);
    }
    if (!content.includes('status" -eq 75')) {
      errors.push(`${workflow}: must treat exit 75 from the live check as a warning that still publishes`);
    }
  }
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

/* 3b. One verification date. The README, the reference page, and the House
   Manual footer all state when the facts were last checked against the live
   contract, and three hand-written copies of one date drift the moment two of
   them are edited and the third is not. */
for (const file of ["README.md", "docs/reference/official-product-facts.md"]) {
  const content = readFileSync(join(root, file), "utf8");
  if (!content.includes(facts.verifiedAt)) {
    errors.push(`${file}: does not state the verification date ${facts.verifiedAt} recorded in facts/facts.json`);
  }
  const otherDates = [...content.matchAll(/\b20\d\d-\d\d-\d\d\b/g)].map(([date]) => date).filter((date) => date !== facts.verifiedAt);
  for (const date of new Set(otherDates)) {
    errors.push(`${file}: states verification date ${date}, but facts/facts.json records ${facts.verifiedAt}`);
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

/* 9. No word is published twice in a row. Markdown wraps prose across source
   lines, so "the exact\nexact bytes" reads as two clean lines in a diff and as
   a defect on the page. Code spans and link targets are replaced with a mark
   that is not whitespace, so two words that were never adjacent on the page
   cannot become a false repeat once what sat between them is removed. */
const removedMarkup = " · ";
const intentionalRepeats = new Set(["had", "that", "so"]);
for (const file of markdownFiles) {
  const prose = readFileSync(file, "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/```[\s\S]*?```/g, "\n\n")
    .replace(/`[^`\n]*`/g, removedMarkup)
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, " $1 ")
    .replace(/https?:\/\/\S+/g, removedMarkup);
  /* A blank line ends a phrase: a heading and the paragraph under it are two
     phrases, even when both open on the same word. */
  for (const phrase of prose.split(/\n[ \t]*\n/)) {
    /* Case-insensitive: "The the" is the same defect as "the the". Only
       whitespace may sit between the two, so "the Bar. Bar staff" is not a
       repeat and neither is "New York, New York". */
    for (const [whole, word] of phrase.matchAll(/\b([A-Za-z][A-Za-z'’]+)[ \t\r\n]+\1\b/gi)) {
      if (intentionalRepeats.has(word.toLowerCase())) continue;
      errors.push(`${relative(root, file)}: duplicated word "${whole.replace(/\s+/g, " ")}"`);
    }
  }
}

if (errors.length) {
  console.error(`publication gate: ${errors.length} problem(s)\n`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}
console.log(`publication gate: OK (${files.length} files scanned, ${markdownFiles.length} Markdown pages)`);
