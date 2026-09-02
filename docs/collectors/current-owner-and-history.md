# Current owner and chain history

Every Feline item page now shows where the inscription actually is right now: the current outpoint, the confirmation state, and the complete transfer trail since the mint. This is not order history restated. It is the chain, projected.

## What the item page shows

| Section | What it tells you |
| --- | --- |
| Current location | The transaction id and output the Feline sits in today |
| Current owner state | The owner's script, and the derived address when the chain allows one to be derived |
| Transaction history | Every transfer as an append-only event, mempool kept apart from confirmed |
| Verification freshness | Which authority answered, at which block, and how long ago |

A fact the authorities disagree on, or one too old to act on, is shown as unverified. It is never shown as current.

## Watch-only portfolio

My Booth accepts any address, no wallet connection required. You see current holdings, transferred-out history, listed items, offers, sales, and purchases for that address.

A watch-only address can never start a mutation. Sending, listing, and accepting require a proven wallet connection.

## Multi-address portfolios

Collectors who split holdings across addresses can prove each address once with a purpose-bound BIP 322 challenge: the challenge binds the origin, the network, the address, a nonce, and an expiry, so a signature cannot be replayed for another address or another day.

Addresses are proven one at a time, and nothing implies that proven addresses belong to one person. When an inscription transfers away, it leaves your portfolio on the next confirmed observation, not on a guess.

## If the two authorities disagree

The projection follows every spend through owned Bitcoin data and cross-checks the result against the owned Ord authority. A disagreement stops the item's projection, records the exact evidence, and shows the item as unverified until the discrepancy is repaired. It never guesses.
