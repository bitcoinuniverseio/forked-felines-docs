# Remediation and refunds

Forked Felines launched with higher prices than it has today. The remediation program makes early minters whole, once per qualifying Feline, by their own choice. Separately, ordinary refunds cover payments that arrive too late for their order.

## The remediation choice

Under the active contract (`forked-felines.community-remediation/v4`), an eligible participant may choose, **once per qualifying Feline**, either:

- **Five free-mint credits**, usable like any other credits; or
- **A refund of that Feline's original mint price**, paid to the original payment address.

## Who qualifies

You paid a v1 to v3 collection price for a Feline **and** still held that Feline at the remediation snapshot. The site checks this for you: open [forkedfelines.art/remediation](https://forkedfelines.art/remediation), enter the recipient address, and the desk lists each qualifying Feline and its available choice.

## What "original mint price" means

The refund returns the **collection price you paid at mint time** for that Feline. It is never a full checkout refund: Bitcoin network fees, postage, service fees, and any RBF costs were real costs already spent on real transactions, and they are excluded.

## Where money goes

Remediation refunds, and every other refund the house issues, are paid **only to the original payment address**. This is a fraud control: nobody can redirect your refund by asking nicely, including you. If you no longer control the original payment address, contact support before choosing the refund option.

## Ordinary refunds

Outside remediation, one situation produces an automatic refund: your payment confirms **after** the order's reservation already expired. The payment is returned to its source address, and the ticket shows MANAGER AT THE TILL until the refund settles as SETTLED BACK.

## The choice is final

Choosing credits or the refund settles that Feline's remediation permanently. Take your time; there is no deadline pressure and the desk says nothing you cannot re-read.

## If the connection drops

The repaired election flow is prepared for validation; this note does not announce a production rollout. One signed election set has one saved result. An identical authorized retry returns that result, including after the original signing window expires, if the election already committed. A failed transaction leaves the original proof usable until its initial expiry; after expiry, an uncommitted choice needs a fresh signature.

The requested set is all-or-nothing. A conflicting choice or unqualified item must not leave some new elections accepted and others missing. Exactly five credits are created for a qualifying credit election, or one original-price refund obligation. No additional credits or payouts are created to repair a display problem.

After a lost response, reload the ledger before acting again. Read available, reserved and redeemed credits separately. A refund choice means a refund is owed; sent and confirmed are later states. New quotes use the ledger's available credits and still disclose network, delivery and service costs.

If the original payer cannot be attributed unambiguously, the desk must surface that condition. It cannot guess another destination or accept a replacement address.

## Next

- [Community credits](community-credits.md)
- [Getting support](../help/getting-support.md)
