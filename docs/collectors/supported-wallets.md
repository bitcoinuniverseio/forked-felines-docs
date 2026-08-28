# Supported wallets

The mint works with any Bitcoin wallet in two ways: a connected wallet for convenience, or any address you control with no connection at all.

## Wallets with a connect button

| Wallet | What connecting does |
| --- | --- |
| UniSat | Fills the recipient field, offers your addresses, and can pay the bill |
| Xverse | Same |
| OKX Wallet | Same |
| Leather | Same |
| Wizz | Same |
| Universe | Same |

Connecting does three things and nothing more: it reads the addresses your wallet chooses to expose, fills the recipient field, and lets the wallet present the payment for approval later. **Connecting never authorizes a payment.** Every payment is its own explicit approval in your wallet, for one printed total.

## No wallet connection at all

Type any Bitcoin address you control into the recipient field. You can then settle the quoted bill from anywhere: a hardware wallet, an exchange withdrawal you control precisely, a different wallet on another machine. The house cares that the exact total arrives at the quoted payment address; it does not care which wallet sends it. See [Receiving vs payment address](receiving-vs-payment-address.md) before paying from an exchange, and prefer a wallet you fully control.

## Choosing a receiving address

- Prefer a **Taproot (bc1p) or native SegWit (bc1q) address from an Ordinals-aware wallet**, so your Feline is easy to see and safe from accidental spending.
- Avoid exchange deposit addresses. Exchanges do not credit inscriptions and the Feline may be unrecoverable.
- Avoid addresses whose wallet treats all UTXOs as spendable coins; an unaware wallet can spend the sat carrying your Feline as ordinary change.

## If your wallet refuses to help

Some wallets refuse operations on accounts that hold other assets, to protect them. That refusal is correct behavior, not a bug. Use a clean account for paying, or type the recipient address manually and pay from another wallet.

## Next

- [Wallet signing](wallet-signing.md): exactly what each prompt asks and authorizes
- [Mint in 3 steps](../start-here/mint-in-3-steps.md)
