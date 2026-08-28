# Prices and fees

Every cost, what it pays for, and when it can change. All amounts are integer satoshis; the site never uses floating-point Bitcoin values.

## The four components of a mint

| Component | Amount | What it pays for |
| --- | --- | --- |
| Collection price | 8,888 sats public, 0 sats with a Knot Heads credit | The Feline itself |
| Bitcoin network fee | live, set by the fee rate you choose | Miners confirming your payment |
| Inscription delivery | live, shown on the quote | The transaction that inscribes the Feline and delivers it to your address |
| Service fee | 1,500 sats | The house constructing, verifying, and shepherding your inscription |

The signed quote lists each component and one exact total **before your wallet opens**. Nothing is added afterwards.

## The signed quote

When you request a quote, the server calculates every component from the live fee market and signs the result. That signature means:

- the total cannot drift between the page and your wallet;
- the quote is valid for **15 minutes**, then expires;
- an expired quote is never silently reused. You request a fresh one and every component is recalculated and re-signed.

Prices are server-authoritative. The page displays the quote; it never computes one.

## Fee bumps (RBF)

If your payment is stuck below the going fee rate, the app can offer a replacement transaction at a higher rate:

- Each **accepted** bump adds exactly **1,500 sats** to the cumulative service fee, shown before you approve.
- The Bitcoin network fee rises with the fee rate you select, disclosed separately.
- A rejected signature, duplicate click, retry, or failed broadcast adds **nothing**.
- Replacements preserve the mint output and may only add verified asset-free inputs from your wallet, so no inscription you own can be swept in as fee material.

## What holders pay

A Knot Heads free-mint credit sets the **collection price** of one mint to 0 sats. Network, delivery, and service costs remain payable, because those are real Bitcoin costs the house passes through at cost or its posted flat fee. See [Community credits](community-credits.md).

## Historical prices

Earlier pricing versions (v1 through v3) posted different rates. They are historical only: already-signed quotes under them remain verifiable, and the remediation program compensates eligible early minters. The only active contract is `forked-felines.community-remediation/v4`. See [Remediation and refunds](remediation-and-refunds.md).

## Next

- [Wallet signing](wallet-signing.md)
- [Official product facts](../reference/official-product-facts.md)
