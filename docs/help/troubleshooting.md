# Troubleshooting

The most common situations, what they actually mean, and what to do. Every failure state in the app answers four questions: what happened, whether funds moved, whether your order is safe, and what to do next. This page collects them.

## Wallet problems

| Situation | What it means | What to do |
| --- | --- | --- |
| No wallet detected | The site found no wallet extension in this browser | You do not need one. Type your receiving address manually and pay the bill from any wallet |
| The wallet rejected the request | You (or the wallet) declined. Nothing was sent, nothing was charged, your reservation is unchanged | Choose Pay with Wallet again before the order expires |
| The wallet refuses to prepare a payment from this account | Some wallets protect accounts holding inscriptions or other assets by refusing to spend from them. This refusal protects you | Pay from a clean account, or from a different wallet entirely |
| The connected account changed | Your wallet switched accounts mid-flow | The recipient printed on your quote is unchanged; the quote is the truth. Reopen the recipient card to confirm where delivery goes |
| Wrong network | The wallet is on testnet or another network | Switch the wallet to Bitcoin mainnet and retry |

## Quote and order problems

| Situation | What it means | What to do |
| --- | --- | --- |
| THE BILL WENT COLD (quote expired) | Signed quotes last 15 minutes and this one lapsed | Request a fresh quote. Every component is recalculated and re-signed. Nothing was charged |
| The reservation expired before I paid | The order window closed unpaid | Nothing was consumed and no credit was burned. Order again |
| I paid, but the order had already expired | Your payment confirmed after the window | The payment is refunded to its source automatically. The ticket shows MANAGER AT THE TILL, then SETTLED BACK |
| I clicked pay twice | The app prevents duplicate submissions | Only one payment request exists; check your wallet's pending queue and approve at most one |

## Tracking problems

| Situation | What it means | What to do |
| --- | --- | --- |
| The ticket has not moved in a while | Bitcoin confirmation is not a progress bar; blocks arrive when they arrive | See [Payment and confirmation](payment-and-confirmation.md). The ticket never invents progress |
| I closed the browser mid-mint | Order state lives on the server | Open [My Booth](https://forkedfelines.art/my-booth), look up your recipient address, and resume watching |
| I cannot find my order | Orders are keyed to the recipient address on the quote | Look up the exact recipient address you used, not another address from the same wallet |
| The portrait frame says unavailable | Both artwork sources are momentarily unable to serve verified bytes | Your Feline is unaffected; the inscription is on Bitcoin. The frame returns when a source can serve verified bytes. See [Verified artwork](../collection/verified-artwork.md) |

## Site problems

| Situation | What it means | What to do |
| --- | --- | --- |
| KITCHEN CLOSED / mint unavailable | Minting is disabled or a dependency is unhealthy; intake fails closed | Nothing is wrong with your wallet or funds. Check [house status](https://forkedfelines.art/status) and try later |
| The house clock says OUT OF ORDER | The block source is down, so the clock refuses to show a stale number | Purely informational; ordering is separately gated |
| A page failed to render | Rendering and order state are separate systems | Your reservations, payments, and Felines are unaffected. Reload |

## Still stuck?

Open [Getting support](getting-support.md). Support can read your order's true server-side state, which beats anyone's guess.
