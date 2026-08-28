# Knot Heads holder start

**Goal**: use the free-mint credits your Knot Heads earned.

## What you have

Each Knot Head recorded for an address at Bitcoin block 963,238 carries exactly one free-mint credit. A credit sets the collection price of one mint to 0 sats. Bitcoin network, inscription delivery, and service costs are calculated live, shown separately, and remain payable, so a credited mint is not free of Bitcoin's own costs, only of the house's.

Eligibility is the snapshot, nothing else:

- **Held at block 963,238**: eligible, even if the Knot Head moved later.
- **Bought after block 963,238**: not eligible. The snapshot is fixed forever.

## Before you start

The credits belong to the **address that held the Knot Heads at the snapshot**. If your Knot Heads lived on a different address than the one you plan to receive with, use the snapshot address as the recipient, or the house will correctly find no credits.

## Steps

1. Open [forkedfelines.art/mint](https://forkedfelines.art/mint).
2. Enter the address that held your Knot Heads at block 963,238 as the recipient.
3. The table card reports what the guest list found: how many heads, and how many holder-price mints are available.
4. Mint. Credits apply automatically, oldest reservation first. Mints beyond your credit count use the public 8,888-sat price, and the quote always says which rate each mint received before your wallet opens.

## How a credit is spent

A credit is reserved when you start a checkout, released if that order legitimately expires unpaid, and permanently redeemed only when payment reaches the confirmed state. A rejected wallet prompt or an abandoned cart never burns a credit. The KNOT HEADS collection itself is never written to; verification is read-only against the snapshot.

## Verifying standing for the Members' Table

Some member views ask you to prove control of the address rather than just typing it. The wallet signs one short-lived, domain-bound BIP-322 message. That signature proves address control to this site only, costs nothing, and cannot move funds. See [Wallet signing](../collectors/wallet-signing.md).

## Common problems

| Problem | Likely cause |
| --- | --- |
| "No member rate was found for this recipient" | The address you entered is not the address that held Knot Heads at block 963,238. Try the snapshot address. |
| Fewer credits than Knot Heads | Some credits were already redeemed by confirmed mints, or a checkout currently holds them. Expired checkouts release credits automatically. |
| The guest list is stale or unavailable | The house fails closed rather than guess. Wait and retry; nothing was assumed about your holdings. |

## Next

- [Community credits](../collectors/community-credits.md) for the full credit ledger rules
- [Mint in 3 steps](mint-in-3-steps.md)
