# Payment and confirmation

Why Bitcoin payments take the time they take, what the house does while waiting, and when a fee bump is worth it.

## The honest timeline

1. **You approve the payment.** It enters the mempool, the waiting room of unconfirmed transactions. The ticket reads PAYMENT SEEN.
2. **A miner includes it in a block.** On average blocks arrive every ten minutes, but individual gaps of an hour happen and mean nothing is wrong. Inclusion depends on your fee rate relative to everyone else's.
3. **One confirmation.** The house verifies it independently and the ticket reads BILL SETTLED. The kitchen takes over from here; the inscribing and delivery steps are the house's own transactions, tracked on the same ticket.

## What the fee rate you chose controls

Only step 2. A higher fee rate buys a better place in line for your payment; it does not speed up blocks themselves. The quote showed you the fee-rate options with live numbers when you paid.

## When a bump makes sense

If the fee market rose after you paid, your payment can sit in the mempool below the going rate. The app detects this and can offer a replacement at a higher rate:

- The offer shows the new network cost and the exact 1,500-sat service increment **before** you approve.
- Only an accepted, broadcast replacement costs anything; rejections and failures add nothing.
- Either the original or the replacement confirms, never both, and the mint output is preserved in both.

If you decline a bump, your payment remains valid and will confirm whenever the fee market lets it, or the order will eventually expire and any late-confirming payment is refunded to its source.

## What never needs your attention

Everything after BILL SETTLED. Inscribing, broadcasting, confirming, and delivery are the house's job, with automatic retries, and no step of it can ask you for money. If an internal step fails in a way that needs staff, the ticket says so, and the order is held safely: TAKEN TO THE BACK OFFICE is an assurance, not an alarm.

## Next

- [Order status](../collectors/order-status.md)
- [Troubleshooting](troubleshooting.md)
