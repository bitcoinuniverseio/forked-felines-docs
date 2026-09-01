# Status contract

How to read the house's health and status surfaces, and what each one does and does not promise.

## The three public surfaces

| Surface | Question it answers |
| --- | --- |
| [forkedfelines.art/status](https://forkedfelines.art/status) | The human status page: what is healthy, in words |
| `GET /api/v1/mint/capacity` | Is the house safe to accept new orders, and if not, exactly why |
| `GET /api/v1/block` | What block the house clock sees, or an honest OUT OF ORDER |

## Fail-closed, always

The design principle across all of them: **degradation closes intake rather than degrading truth**.

- If the Bitcoin, Ordinals, inscription, refund, relay, worker, reconciler, watchdog, or backup layer is unhealthy, `mintState` reports it and new orders stop.
- Existing paid orders continue independently: payment observation and financial recovery run on durable state and an independent reconciler, so a closed front door never strands a paid order.
- A healthy background worker never overrides an unsafe dependency. There is no "mostly ready".

## The five states of `mintState`

| State | What it means |
| --- | --- |
| `OPEN` | New orders are being accepted |
| `PAUSED` | An operator has paused intake, or an emergency stop is engaged. Nothing is wrong with your funds |
| `SOLD_OUT` | Every Feline that can be inscribed has been |
| `FINISHED` | An operator has closed the mint |
| `UNAVAILABLE` | A dependency is unhealthy, so the house stopped intake rather than guess |

Read `safeToAcceptOrders` rather than inferring from the word: it is the single boolean the interface itself obeys, and it fails closed.

## Reading `reasonCodes`

When `mintState` is not `OPEN`, `reasonCodes` lists exact causes, for example `RELEASE_MODE_READ_ONLY` (the site is deliberately running read-only) or dependency codes naming an unhealthy authority. They are technical strings meant to be precise rather than pretty, and they are the same codes the operators read.

## What UNAVAILABLE means for you

- Nothing about your wallet or funds is implicated. It is the house's dependencies being held to a safety bar.
- Anything already paid continues to be tracked and recovered; see [Order states](order-states.md).
- No wallet action will be requested from you while the kitchen is closed.

## The block clock

The clock shows the current Bitcoin block height from the house's own infrastructure. If its source is down, it says OUT OF ORDER instead of showing a stale number. The clock is informational; order intake is gated by capacity, not by the clock.
