# Order states

The order state machine, with the meaning of each state and its ordinary transitions. The kitchen ticket renders these states with house labels. A batch also has an independent fulfillment state for each Feline: the parent order provides context, not proof of every item's delivery.

## States

| State | Ticket label | Meaning | Funds moved? |
| --- | --- | --- | --- |
| `CREATED` | TABLE HELD | Order created; the quoted Felines are reserved while checkout completes | No |
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
| `FAILED_QUARANTINED` | TAKEN TO THE BACK OFFICE | Processing is held pending verified recovery | Read the separate payment evidence |

## What can follow what

Ordinary order transitions must follow this table. Verified typed recovery jobs can resume quarantined orders with eligible causes after checking the payment and inscription evidence. Consumed-payment cases require the guarded operator-wallet funding path. A retry, a race, or a public request cannot bypass these checks.

| From | May become |
| --- | --- |
| `CREATED` | `AWAITING_PAYMENT`, `CANCELLED`, `EXPIRED` |
| `AWAITING_PAYMENT` | `PAYMENT_SEEN`, `CANCELLED`, `EXPIRED` |
| `PAYMENT_SEEN` | `PAYMENT_CONFIRMED`, `AWAITING_PAYMENT`, `FAILED_RECOVERABLE` |
| `PAYMENT_CONFIRMED` | `INSCRIBING`, `REFUND_PENDING`, `FAILED_RECOVERABLE` |
| `INSCRIBING` | `INSCRIPTION_BROADCAST`, `FAILED_RECOVERABLE`, `FAILED_QUARANTINED` |
| `INSCRIPTION_BROADCAST` | `INSCRIPTION_CONFIRMED`, `FAILED_RECOVERABLE`, `FAILED_QUARANTINED` |
| `INSCRIPTION_CONFIRMED` | `DELIVERED`, `FAILED_RECOVERABLE` |
| `DELIVERED` | nothing. Terminal |
| `CANCELLED` | nothing. Terminal |
| `EXPIRED` | `PAYMENT_SEEN`, `REFUND_PENDING` |
| `REFUND_PENDING` | `REFUNDED`, `FAILED_RECOVERABLE` |
| `REFUNDED` | nothing. Terminal |
| `FAILED_RECOVERABLE` | `AWAITING_PAYMENT`, `PAYMENT_CONFIRMED`, `INSCRIBING`, `INSCRIPTION_BROADCAST`, `REFUND_PENDING`, `FAILED_QUARANTINED` |
| `FAILED_QUARANTINED` | No ordinary transition; verified typed recovery can resume eligible causes; consumed-payment cases require an operator wallet |

Two rows explain most of what surprises people:

- **`EXPIRED` can still see a payment.** A reservation that closed unpaid is not the end of the story if your payment turns up afterwards. That is why `EXPIRED` leads to `PAYMENT_SEEN` and then to a refund, rather than to nothing.
- **`FAILED_RECOVERABLE` leads back into the flow.** It is a step that will be retried, not a dead end, and the states it can return to are exactly the steps that can be safely resumed.

## Item state and payment state

A Feline marked **ON HOLD FOR REVIEW** is paused pending verified recovery even if its parent order or another item has progressed. Its traits belong to that edition, and its portrait remains sealed until its own inscription is confirmed.

Payment confirmation is separate from order and item state. **Payment confirmed at last check** and **Unconfirmed at last check** describe the recorded observation at its actual timestamp. They can remain useful historical evidence while fulfillment is held, but do not claim a fresh chain check. Missing trustworthy evidence is reported as unavailable.

Eligible quarantined causes can resume through automatic typed recovery jobs after verification. An original payment consumed by earlier processing requires recovery funded by an operator wallet through the guarded path. The buyer must not pay again. Recovery never authorizes a public retry, duplicate inscription, or changed recipient.

## Guarantees across all states

- **States are read, never invented.** Each transition reflects verified server-side or on-chain reality. The UI cannot advance a state.
- **Supply is consumed at `INSCRIPTION_CONFIRMED`**, not at reservation. A held table is not a confirmation.
- **Credits redeem at `PAYMENT_CONFIRMED`**, release on legitimate expiry, and are never burned by rejections or failures.
- **Refunds go only to the original payment address**, in every state that produces one.
- **Failure states do not authorize another buyer payment**: `FAILED_RECOVERABLE` retries eligible work; `FAILED_QUARANTINED` requires verified recovery, which can run automatically for eligible causes. Consumed-payment cases require an operator wallet. Read payment evidence separately, and do not pay again to release a held Feline.

## Version

State names are part of the application contract and stable. New states may be added; existing names are not reused for different meanings.
