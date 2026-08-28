# Order states

The complete order state machine, with the exact meaning of each state and what can follow it. The kitchen ticket in the app renders these states with house labels; this page is the technical truth underneath.

## States

| State | Ticket label | Meaning | Funds moved? |
| --- | --- | --- | --- |
| `CREATED` | TABLE HELD | Order created; one feline reserved while checkout completes | No |
| `AWAITING_PAYMENT` | PAYMENT EXPECTED | Reservation waiting for Pay with Wallet | No |
| `PAYMENT_SEEN` | PAYMENT SEEN | Payment observed in the mempool, unconfirmed | In flight |
| `PAYMENT_CONFIRMED` | BILL SETTLED | Payment confirmed on Bitcoin and independently verified | Yes |
| `INSCRIBING` | IN THE KITCHEN | Inscription being constructed; artwork bytes re-hashed against the recorded digest first | Yes |
| `INSCRIPTION_BROADCAST` | OUT FOR SERVICE | Inscription transaction broadcast, awaiting confirmation | Yes |
| `INSCRIPTION_CONFIRMED` | ORDER UP | Inscription confirmed; final supply is consumed at this moment | Yes |
| `DELIVERED` | SERVED | The Feline is at the recipient address | Yes |
| `CANCELLED` | RESERVATION CANCELLED | Cancelled before payment; nothing consumed | No |
| `EXPIRED` | THE BILL WENT COLD | Reservation window closed without a confirmed payment | Refunded if paid late |
| `REFUND_PENDING` | MANAGER AT THE TILL | A refund is queued | Return in flight |
| `REFUNDED` | SETTLED BACK | Refund transaction completed | Returned |
| `FAILED_RECOVERABLE` | DROPPED TRAY. KITCHEN RETRIES. | A step failed and retries automatically; no funds are lost by this state | Unchanged |
| `FAILED_QUARANTINED` | TAKEN TO THE BACK OFFICE | Needs operator attention; safe, held, and visible to staff | Held safely |

## Guarantees across all states

- **States are read, never invented.** Each transition reflects verified server-side or on-chain reality. The UI cannot advance a state.
- **Supply is consumed at `INSCRIPTION_CONFIRMED`**, not at reservation. A held table is not a confirmation.
- **Credits redeem at `PAYMENT_CONFIRMED`**, release on legitimate expiry, and are never burned by rejections or failures.
- **Refunds go only to the original payment address**, in every state that produces one.
- **Failure states are safe by construction**: `FAILED_RECOVERABLE` retries without you; `FAILED_QUARANTINED` freezes the order where staff must look at it. Neither loses funds, and neither asks anything of you.

## Version

State names are part of the application contract and stable. New states may be added; existing names are not reused for different meanings.
