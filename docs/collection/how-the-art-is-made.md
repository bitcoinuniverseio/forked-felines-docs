# How the art is made

Every Forked Feline is hand-drawn art assembled by a deterministic generator. This page explains what that means and why it matters to a collector.

## Hand-drawn parts, frozen recipe

The artists drew every fur, expression, hat, prop, table setting, and background as vector art. A generator combines those parts into complete portraits according to a **recipe**: the full list of traits, their artwork, and the weight (the probability) each one carries.

Before the first Feline was ever drawn, the recipe was frozen and its digest recorded. So was a single **seed**. From then on, the collection is pure arithmetic: seed plus recipe determines every one of the 3,333 felines, in order, forever.

## Deterministic means checkable

"Deterministic" is a promise you can test. Given the same seed and the same recipe, the generator produces byte-identical SVG output every time. The house uses this constantly:

- At reservation time, it records the digest of the exact bytes that will be inscribed.
- At inscription time, it re-generates the artwork and refuses to inscribe if a single byte differs from the record.
- At serving time, whenever a portrait is displayed from the fallback source, the bytes are re-hashed against the recorded digest first. See [Verified artwork](verified-artwork.md).

## Nothing about you affects the draw

Your wallet, your timing, and your fee rate have no influence on which art the next edition carries. The felines were determined when the seed was frozen; minting reveals them in order. There is no randomized purchase outcome, no reroll, and no gacha mechanic anywhere in the product.

## Unreleased art stays private

Only felines confirmed on Bitcoin appear on the wall, in the API, or anywhere public. The remaining editions exist as arithmetic, not as published images, and the studio never releases a directory of pre-rendered artwork. This protects the reveal for every future minter.

## Next

- [Whole on Bitcoin](whole-on-bitcoin.md)
- [Traits and odds](traits-and-odds.md)
