/**
 * Refresh the observed-collection snapshot.
 *
 * Reads the public, unauthenticated collection endpoint, records the trait
 * vocabulary and rarity vocabulary actually present in the confirmed editions,
 * and downloads the artwork bytes for the plates hung in the manual's gallery.
 *
 * Two rules make this snapshot safe to publish:
 *
 *  1. Only confirmed editions are read. The endpoint never returns an
 *     unreleased edition, so nothing here can spoil a reveal.
 *  2. Observed counts are never presented as the frozen generator weights.
 *     They are a census of what has been served, and the files this writes
 *     carry the reading date so nobody can mistake one for the other.
 *
 * Run it deliberately, not in CI: the committed snapshot is the published
 * reading, and the publication gate checks the committed artwork against the
 * digests recorded beside it.
 *
 *   node tools/refresh-collection-snapshot.mjs
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PRODUCT = "https://forkedfelines.art";
const COLLECTION = `${PRODUCT}/api/v1/collection`;

/* The plates hung in the gallery. Each one is a confirmed edition chosen to
   show a different corner of the recipe: the first plate served, the widest
   spreads of fur, hat, expression and accessory. Editions only; every other
   fact about a plate is read from the live endpoint, never typed here. */
const PLATE_EDITIONS = [1, 3, 7, 8, 10, 20, 36, 57];

async function readJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return response.json();
}

const collection = await readJson(COLLECTION);
const observedAt = new Date().toISOString();

/* Trait vocabulary: which categories exist and which values have been served.
   Category order follows the order the endpoint itself uses on the first
   entry, which is the generator's own compositing order. */
const categoryOrder = Object.keys(collection.revealed[0]?.traits ?? {});
const tally = new Map(categoryOrder.map((name) => [name, new Map()]));
for (const entry of collection.revealed) {
  for (const [category, value] of Object.entries(entry.traits)) {
    if (!tally.has(category)) {
      tally.set(category, new Map());
      categoryOrder.push(category);
    }
    const values = tally.get(category);
    values.set(value, (values.get(value) ?? 0) + 1);
  }
}

const traits = categoryOrder.map((name) => ({
  category: name,
  valuesObserved: tally.get(name).size,
  values: [...tally.get(name).entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, observed]) => ({ value, observed })),
}));

/* Rarity vocabulary: the tier words the product actually prints, and the
   range of one-in figures each has carried so far. The ranges overlap, so
   this file records them as observations and claims no mapping between the
   tier word and the figure. */
const tierTally = new Map();
for (const entry of collection.revealed) {
  const seen = tierTally.get(entry.rarity) ?? { observed: 0, oneIn: [] };
  seen.observed += 1;
  seen.oneIn.push(entry.rarityOneIn);
  tierTally.set(entry.rarity, seen);
}
const rarityTiers = [...tierTally.entries()]
  .sort((a, b) => Math.min(...a[1].oneIn) - Math.min(...b[1].oneIn))
  .map(([tier, seen]) => ({
    tier,
    observed: seen.observed,
    lowestOneIn: Math.min(...seen.oneIn),
    highestOneIn: Math.max(...seen.oneIn),
  }));

/* Plates: artwork bytes downloaded and hashed here, so the manual can print a
   digest a reader can reproduce against the file it serves. */
const plateDir = join(root, "docs", "assets", "plates");
mkdirSync(plateDir, { recursive: true });
const plates = [];
for (const edition of PLATE_EDITIONS) {
  const entry = collection.revealed.find((candidate) => candidate.edition === edition);
  if (!entry) throw new Error(`edition ${edition} is not confirmed; it cannot be a plate`);
  const response = await fetch(`${PRODUCT}${entry.artworkUrl}`);
  if (!response.ok) throw new Error(`artwork for edition ${edition} answered ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const file = `feline-${edition}.svg`;
  writeFileSync(join(plateDir, file), bytes);
  plates.push({
    edition,
    file,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    artworkSource: response.headers.get("x-artwork-source") ?? null,
    inscriptionId: entry.inscriptionId,
    traits: entry.traits,
    rarity: entry.rarity,
    rarityOneIn: entry.rarityOneIn,
    servedAt: entry.servedAt,
  });
}

const snapshot = {
  note: "A census of confirmed editions read from the public collection endpoint. Observed counts are not the frozen generator weights.",
  observedAt,
  observedFrom: COLLECTION,
  network: collection.network,
  supply: collection.supply,
  revealedCount: collection.revealedCount,
  traitCategories: traits.length,
  traits,
  rarityTiers,
  plates,
};

writeFileSync(join(root, "facts", "collection-observed.json"), `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(
  `collection snapshot: ${collection.revealedCount} confirmed editions, ` +
  `${traits.length} trait categories, ${plates.length} plates downloaded`,
);
