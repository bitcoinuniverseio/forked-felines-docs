# Status contract

How to read the house's health and status surfaces, and what each one does and does not promise.

## The three public surfaces

| Surface | Question it answers |
| --- | --- |
| [forkedfelines.art/status](https://forkedfelines.art/status) | The human status page: what is healthy, in words |
| `GET /api/v1/mint/capacity` | Which mint and payment actions are available, with health and supply facts |
| `GET /api/v1/block` | What block the house clock sees, or an honest OUT OF ORDER |

## Fail-closed, always

Each action requires the evidence needed to perform it safely. A missing or failed safety check closes that action.

- The global health summary includes processing, recovery, and maintenance warnings. The `operations` object says whether quoting, creating an order, preparing payment, broadcasting payment, and cancellation are available individually.
- Existing paid orders continue independently: payment observation and financial recovery run on durable state and an independent reconciler, so a closed front door never strands a paid order.
- A healthy background worker never overrides invalid financial evidence, unexplained funds, or a critical financial watchdog condition.

## The five states of `mintState`

| State | What it means |
| --- | --- |
| `OPEN` | The global mint summary is open; the requested operation must also be ready |
| `PAUSED` | An operator has paused intake, or an emergency stop is engaged. Nothing is wrong with your funds |
| `SOLD_OUT` | Every Feline that can be inscribed has been |
| `FINISHED` | An operator has closed the mint |
| `UNAVAILABLE` | The global summary has an unavailable dependency; check the operation verdict for the action you need |

`safeToAcceptOrders` is a conservative global health flag. The interface follows `operations.QUOTE`, `operations.ORDER`, `operations.PAYMENT_PREPARATION`, `operations.PAYMENT_BROADCAST`, and `operations.CANCEL`. Each has a `ready` verdict and public-safe `reasonCodes`. The server checks the same policy again when an action is submitted. Old browser state cannot authorize a mutation.

An existing reservation does not need new inventory, a new quote, or a newly derived payment address to continue its otherwise safe payment actions. An unrelated maintenance warning can therefore coexist with an available action.

## Reading PAYMENTS

PAYMENTS reports the actual payment preparation and broadcast paths. Both ready is GOOD; one ready is DEGRADED; neither ready is DOWN. Without current operation evidence it is CHECKING. A stale backup verification alone does not change this verdict. A stale reconciler scan still blocks broadcast under the payment safety policy, even when preparation remains available.

## Reading `reasonCodes`

Global `reasonCodes` lists coarse health causes, for example `RELEASE_MODE_READ_ONLY` (the site is deliberately running read-only) or `BACKUP_RESTORE_VERIFICATION_STALE` (the financial backup has not been verified recently enough). Read an operation's own codes to understand why that action is unavailable. Public codes exclude private provider addresses and detailed operator diagnostics.

## What the public documents contain

`/api/v1/mint/capacity` and `/api/health/ready` answer with a fixed public schema: the network, the mint state, coarse reason codes, freshness timestamps, build identity, the block height, and coarse worker and financial readiness. Detailed worker, queue, and provider diagnostics are shown only to authenticated administrators. A public document that says less is not hiding a fault: everything that closes intake still surfaces as a reason code.

## What UNAVAILABLE means for you

- Nothing about your wallet or funds is implicated. It is the house's dependencies being held to a safety bar.
- Anything already paid continues to be tracked and recovered; see [Order states](order-states.md).
- Your checkout enables only the payment actions whose operation verdict is ready. It checks them again on the server before proceeding.

## Temporary connection failures

The interface honors `Retry-After` on 429 and 503 responses and keeps the safe reason code and request ID for diagnostics. It makes one capacity request at a time. After eight failures, fast retries stop and checks continue at the normal one-minute cadence, respecting a longer server retry delay. A recently verified state can survive a connection failure for at most 45 seconds; an explicit operation denial applies immediately. A connection failure is never shown as sold out.

## The block clock

The clock shows the current Bitcoin block height from the house's own infrastructure. If its source is down, it says OUT OF ORDER instead of showing a stale number. The clock is informational; order intake is gated by capacity, not by the clock.
