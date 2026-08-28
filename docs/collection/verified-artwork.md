# Verified artwork

The portraits on the site are served with a verification step most galleries skip: the house proves the bytes are right before showing them to you.

## Two sources, one truth

A confirmed Feline's bytes can be produced two ways:

1. **From Bitcoin**, through the project's own Ordinals index, reading the inscription itself.
2. **From the pinned release runtime**, re-drawing the Feline from the frozen seed and recipe.

Because the artwork is deterministic, both produce identical bytes. When the first source cannot answer, during an index rebuild for example, the house redraws the portrait from the release runtime **and serves it only if the bytes hash to the digest recorded at reservation, at the recorded length**. If both sources fail, or either disagrees with the record, the site shows an honest unavailable state instead of a guess.

## Why you can trust the fallback

The fallback is not a cached copy or a backup image folder. It is the same generator, pinned to the same release, producing the same bytes, checked against a digest that was written down before the Feline was ever reserved. A substituted or corrupted portrait cannot pass, because it would not hash to the recorded digest.

Every artwork response names which source answered in an `x-artwork-source` response header, so the claim is inspectable, not rhetorical.

## What fails closed

- A digest mismatch is never served. You either see the verified portrait or an unavailable state, never a maybe.
- Unreleased editions have no digest published and no artwork served, from either source, under any condition.

## Why this exists

On 28 August 2026, the project's Ordinals index was rebuilding and could not serve content. Without the fallback, every portrait on the wall and in every booth would have been a broken frame for the duration. With it, holders kept seeing exactly the bytes they own, each one verified on the way out.

## Next

- [Provenance](provenance.md)
- [How the art is made](how-the-art-is-made.md)
