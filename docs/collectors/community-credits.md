# Community credits

The full rules of free-mint credits: where they come from, how they are counted, and exactly when one is spent.

## Where credits come from

1. **The Knot Heads snapshot.** Each Knot Head recorded for an address at Bitcoin block 963,238 carries one free-mint credit. The snapshot is fixed: later transfers change nothing, in either direction.
2. **The remediation program.** Eligible early minters who chose credits over a refund hold five credits per qualifying Feline. See [Remediation and refunds](remediation-and-refunds.md).

A credit sets the collection price of one mint to **0 sats**. Network, delivery, and service costs remain payable on every mint.

## How the count is checked

When you enter a recipient address, the house checks it against a pinned allowlist of exactly 1,110 KNOT HEAD inscriptions, filters the lifetime entitlement ledger for credits already redeemed, and rechecks the selected credits against Bitcoin's confirmed records at quote time. The check is read-only: the KNOT HEADS system itself is never written to.

If the guest list source is stale or unavailable, quotes fail closed rather than guess. An unavailable source is never treated as zero holdings, and never as infinite ones.

## The life of a credit

| Moment | Credit state |
| --- | --- |
| Snapshot recorded, credit unused | Available |
| You start a checkout using it | Reserved, invisible to other checkouts |
| That order legitimately expires unpaid | Released, available again |
| Payment reaches the confirmed state | Permanently redeemed |

A rejected wallet prompt, an abandoned cart, a duplicate click, or a failed broadcast never burns a credit. Only a confirmed payment does.

## Credits are per address, not per person

Credits belong to the address that held the Knot Heads at the snapshot. The house does not merge addresses into identities, so credits cannot be transferred between your own addresses either. Mint with the snapshot address as the recipient to use them.

## Next

- [Knot Heads holder start](../start-here/knot-heads-holder-start.md)
- [Prices and fees](prices-and-fees.md)
