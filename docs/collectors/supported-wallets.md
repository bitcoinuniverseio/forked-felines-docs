# Supported wallets

The mint works with any Bitcoin wallet in two ways: a connected wallet for convenience, or any address you control with no connection at all.

## Wallets with a connect button

| Wallet | Kind |
| --- | --- |
| UniSat | Browser extension for Bitcoin and Ordinals |
| Xverse | Bitcoin wallet with Ordinals support |
| OKX Wallet | Multi-chain wallet with a Bitcoin provider |
| Leather | Bitcoin and Stacks wallet extension |
| Wizz | Bitcoin wallet for Ordinals and Atomicals |
| Universe | The Bitcoin Universe wallet |

Connecting does three things and nothing more: it reads the addresses your wallet chooses to expose, fills the recipient field, and lets the wallet present the payment for approval later. **Connecting never authorizes a payment.** Every payment is its own explicit approval in your wallet, for one printed total.

## Why a connected wallet may still say "address only"

The site does not decide what a wallet can do from its name. It asks the connected provider what it actually exposes, and labels the wallet from the answer. Paying directly needs all of: a public key, transaction signing, and a way to establish which coins are safe to spend. A wallet that connects but does not offer all of that is labelled **address only**: it can fill the recipient field, and you settle the bill from somewhere else.

This is a per-build, per-account fact, not a per-brand one. The same wallet can be ready for direct checkout on one machine and address only on another, and the label on the page is the truth for the wallet you are actually holding.

## No wallet connection at all

Type any Bitcoin address you control into the recipient field. You can then settle the quoted bill from anywhere: a hardware wallet, an exchange withdrawal you control precisely, a different wallet on another machine. The house cares that the exact total arrives at the quoted payment address; it does not care which wallet sends it. See [Receiving vs payment address](receiving-vs-payment-address.md) before paying from an exchange, and prefer a wallet you fully control.

## Choosing a receiving address

The mint accepts these script types as the recipient, and no others:

| Address form | Accepted |
| --- | --- |
| Taproot, `bc1p...` | Yes, and the usual choice |
| Native SegWit, `bc1q...` | Yes |
| Legacy, `1...` | No |
| Nested SegWit, `3...` | No |

A rejected script type is reported as its own message, distinct from an address that is simply malformed, so you can tell "this address is not typed correctly" from "this kind of address cannot receive a Feline".

Beyond the script type:

- Prefer an Ordinals-aware wallet, so your Feline is easy to see and safe from accidental spending.
- Avoid exchange deposit addresses. Exchanges do not credit inscriptions and the Feline may be unrecoverable.
- Avoid addresses whose wallet treats all UTXOs as spendable coins; an unaware wallet can spend the sat carrying your Feline as ordinary change.

## If your wallet refuses to help

Some wallets refuse operations on accounts that hold other assets, to protect them. That refusal is correct behavior, not a bug. Use a clean account for paying, or type the recipient address manually and pay from another wallet.

## Next

- [Wallet signing](wallet-signing.md): exactly what each prompt asks and authorizes
- [Mint in 3 steps](../start-here/mint-in-3-steps.md)
