# Wallet signing

Every prompt the site can cause your wallet to show, what each one authorizes, and what none of them can do.

## The payment approval

When you choose **Pay with Wallet**, your wallet shows one Bitcoin transaction:

- **Amount**: exactly the signed quote's total. Compare it to the bill on screen.
- **Destination**: the payment address printed on the bill.
- **Authorizes**: sending that amount, once. Nothing else.

If the amount or address in your wallet differs from the bill, reject it. The real request never differs.

## The fee-bump approval

If you accept an offered fee bump, your wallet shows a **replacement** of your still-unconfirmed payment at a higher fee rate. It spends the same coins as the original (plus, at most, verified asset-free inputs), so only one of the two transactions can ever confirm. You are never double-charged: the outputs preserve the mint payment, and the new costs were itemized before the prompt.

## The ownership signature (BIP-322)

Member views that prove address control ask for a **message signature**, not a transaction:

- It is one short-lived, domain-bound, network-bound BIP-322 message naming this site.
- It proves you control the address, to this site, briefly.
- It costs nothing, touches no funds, and cannot be replayed elsewhere: the message binds the domain, so a signature for forkedfelines.art is useless to any other site.

## What no prompt will ever request

- Your seed phrase or private key, in any form, ever.
- A token approval, delegation, or "permit".
- A transaction whose amount is not on a bill you have already read.
- A signature on a blank, hex-only, or unexplained message.
- An "unlock", "sync", "validate", or "migration" transaction. These words in a wallet prompt mean someone is stealing from you.

If you see any of these while using the site, stop and read [What we will never ask](../safety/what-we-will-never-ask.md).

## Rejections are safe

Rejecting any prompt is always safe. Your reservation stays held until it expires on its own schedule, no credit is burned, no fee is charged, and you can retry from the same order.

## Next

- [Order status](order-status.md): what happens after you approve
- [Stay safe](../safety/stay-safe.md)
