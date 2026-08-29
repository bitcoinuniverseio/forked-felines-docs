# Order status

After you pay, the kitchen ticket tracks your order through real, verified states. This page explains how to read it and what each stage means. The exact state machine is in [Order states](../reference/order-states.md).

## How tracking works

The ticket reads state from the server, which reads it from Bitcoin. Nothing on the ticket is animated, estimated, or invented: a state advances only when the chain, or the kitchen, actually advanced. That is why the ticket sometimes sits still. Stillness means Bitcoin is doing what Bitcoin does, not that something is lost.

## The happy path

| Ticket says | What actually happened | What you do |
| --- | --- | --- |
| TABLE HELD | Your order exists and a feline is reserved | Pay before the reservation expires |
| PAYMENT SEEN | Your payment is in the mempool, unconfirmed | Nothing. Wait for one confirmation |
| BILL SETTLED | Payment confirmed on Bitcoin and independently verified | Nothing |
| IN THE KITCHEN | The inscription is being constructed; the art bytes are re-hashed against the recorded digest first | Nothing |
| OUT FOR SERVICE | The inscription transaction is broadcast | Nothing |
| ORDER UP | The inscription confirmed. This is the moment final supply is consumed | Nothing |
| SERVED | The Feline is at your recipient address | Enjoy the booth |

## If something interrupts

| Ticket says | What actually happened | What you do |
| --- | --- | --- |
| THE BILL WENT COLD | The reservation window closed without a confirmed payment | If you paid after expiry, the payment is refunded to its source. Otherwise, order again whenever you are ready |
| RESERVATION CANCELLED | You cancelled before paying. Nothing was consumed | Mint again any time |
| MANAGER AT THE TILL | A refund is queued | Nothing. It returns to the original payment source |
| DROPPED TRAY. KITCHEN RETRIES. | A step failed and retries automatically. No funds are lost by this state | Nothing |
| TAKEN TO THE BACK OFFICE | The order needs operator attention. It is safe, held, and visible to staff | Nothing. Staff resolve it; funds and felines are held safely |

## Resuming after closing your browser

Order state lives on the server, keyed to your recipient address. Open [My Booth](https://forkedfelines.art/my-booth), enter the recipient address, and your active orders and their live states are there. Days later, from another device, same answer.

## Next

- [Payment and confirmation](../help/payment-and-confirmation.md) for why confirmation takes the time it takes
- [My Booth](my-booth.md)
