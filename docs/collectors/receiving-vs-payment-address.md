# Receiving vs payment address

Two different addresses play two different roles in every mint. Keeping them straight explains almost everything about how the mint behaves.

![Two addresses, two jobs. Any wallet pays the exact total, once, to the payment address printed on the signed bill. The house verifies the payment, inscribes, and delivers the Feline on chain to the receiving address you named, which is also checked read-only against the Knot Heads guest list at block 963,238. The two addresses may be the same but never have to be.](../assets/address-roles.svg)

## The receiving address

The address you enter in the recipient field. It:

- **receives the Feline** when the inscription is delivered;
- **decides holder standing**: it is checked against the Knot Heads snapshot at block 963,238, and any free-mint credits belong to it;
- appears on the signed quote, so you can confirm where delivery will go before paying.

Choose it carefully: it should be an address you control long-term, in a wallet that understands inscriptions. It never needs to hold any funds.

## The payment address

The address printed on the bill, owned by the house. Your payment of the exact quoted total goes there. Which wallet pays is entirely up to you; the house matches the payment by amount and address, not by sender identity.

## They can be different on purpose

This is a feature. Common patterns:

- **Cold storage receiving, hot wallet paying.** The Feline lands in your vault; a daily wallet settles the bill.
- **Snapshot address receiving.** Your Knot Heads credits live on the address that held them at block 963,238; use it as the recipient and pay from anywhere.
- **Gift.** The recipient can be someone else's address. The quote shows exactly where the Feline will go; check it twice, delivery is on-chain and final.

## What never happens

- The house never takes payment from the receiving address.
- Connecting a wallet never moves funds from any address.
- The Feline is never delivered anywhere other than the recipient printed on the signed quote.

## One caution about exchanges

Do not use an exchange deposit address as the **receiving** address: exchanges do not credit inscriptions. Paying **from** an exchange is also risky because you cannot always control the exact amount received after exchange fees; prefer paying from a wallet you control so the total matches the bill to the sat.

## Next

- [Prices and fees](prices-and-fees.md)
- [Wallet signing](wallet-signing.md)
