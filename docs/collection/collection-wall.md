# The collection wall

The wall at [forkedfelines.art/collection](https://forkedfelines.art/collection) is the gallery of every Feline confirmed on Bitcoin so far, hung in the house's own frames.

## What hangs on the wall

Only **confirmed** felines. The wall's count is the real number of inscriptions that exist; it is not a countdown, a projection, or a marketing number. Unreleased editions never appear, in any form.

## Finding a Feline

- **Filters**: trait filters grouped by trait name, each value showing its real count among served felines. Filters stack, and the tally line always states how many frames match.
- **Sorting**: by edition, by arrival, and by the frozen odds.
- **Search by edition**: jump straight to a number.
- **Newly arrived**: what confirmed since your last visit, remembered only by your own browser.

## Every Feline has its own page

Each frame links to `forkedfelines.art/collection/<edition>`: a server-rendered page with the full portrait, traits, frozen odds, the house's hand-written note, and the complete provenance evidence. The link is stable and shareable; sharing it shows a proper preview and never requires a wallet.

## The house notes

Each Feline's card carries a short note in the house's voice, selected deterministically from hand-written lines by the Feline's actual traits. The same Feline reads the same note forever. Notes are decoration under the facts: they never claim rarity, history, or value.

## Honest states

- The wall arrives hung. The frames are in the page the server sends, so the portraits and their links are there
  before any JavaScript runs, and a search engine, a link preview, and a phone on a slow connection all see the
  same wall you see.
- If the listing cannot be read at all, the wall says so at the same measurements as the loaded wall, so nothing
  jumps. A wall that is already hung stays hung; a failed refresh only costs it freshness.
- If artwork cannot be verified and served, the frame says unavailable rather than guessing. See [Verified artwork](verified-artwork.md).

## Next

- [Traits and odds](traits-and-odds.md)
- [Provenance](provenance.md)
