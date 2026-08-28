# Mint in 3 steps

**Goal**: reserve, pay for, and receive one Forked Feline.

**Before you start**

- A Bitcoin address that can receive an inscription. A Taproot address from a wallet that understands Ordinals is the usual choice. See [Supported wallets](../collectors/supported-wallets.md).
- Enough sats to cover the total the site will quote you: the collection price (8,888 sats public, 0 sats with a Knot Heads credit), the live Bitcoin network fee, inscription delivery, and the 1,500-sat service fee.
- You do not need to connect a wallet to see any of this. The full offer, both posted rates, and the live mint status are on the page before any wallet prompt.

## Step 1: open the bar and read the offer

Open [forkedfelines.art/mint](https://forkedfelines.art/mint). The page states whether the house is currently serving, the posted rates, and how many felines remain. If minting is unavailable, the page says so in plain words and no wallet action will be requested from you.

## Step 2: say where the Feline should go

Enter the Bitcoin address that should receive the Feline, or connect a wallet to fill the field for you. Two things happen:

1. The house checks that address against the fixed Knot Heads guest list at block 963,238. Any unused free-mint credits are found and applied automatically.
2. The table card shows which rate your next mint gets.

Connecting a wallet only fills the recipient field and offers an address chooser. It does not authorize a payment, and it is never required: you can type any address you control.

## Step 3: review one exact total, then pay

Choose your quantity and a network fee rate. The house prints a signed quote: collection price, Bitcoin network fee, inscription delivery, and service fee, summed into one exact total. That quote is signed by the server and valid for 15 minutes.

Choose **Pay with Wallet**. Your wallet shows a payment for exactly the quoted total to the address printed on the bill. Approve it if it matches. Nothing else is requested: no message signing, no token approvals, no second transaction.

**Expected result**: the kitchen ticket appears and tracks every real state: payment seen, payment confirmed, inscribing, broadcast, confirmed, served. Each state reflects what actually happened on Bitcoin; the site never animates progress the chain has not made. When the ticket reads SERVED, the Feline is at your address and hangs in [My Booth](../collectors/my-booth.md).

## Common problems

| Problem | What to do |
| --- | --- |
| The quote expired before I paid | Quotes last 15 minutes. Request a fresh one; every component is recalculated and re-signed. Nothing was charged. |
| My wallet rejected the request | Your reservation is unchanged. Choose Pay with Wallet again before the order expires. |
| I closed the browser after paying | Open [My Booth](https://forkedfelines.art/my-booth) and look up your recipient address. Your order and its live state are there. Payment tracking continues on the server whether or not your browser is open. |
| Payment is taking a while | Bitcoin confirmation times vary with the fee rate you chose. See [Payment and confirmation](../help/payment-and-confirmation.md). |

## Next

- Understand exactly what you are approving: [Wallet signing](../collectors/wallet-signing.md)
- Track the order afterwards: [Order status](../collectors/order-status.md)
