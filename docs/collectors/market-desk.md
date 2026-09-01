# The market desk

The [Forked Felines market desk](https://forkedfelines.art/market) is a read-only view of orders the house can connect to confirmed Felines in the frozen Studio release. It is an evidence display, not a promise of price, liquidity, or future value.

## What the desk checks

For every reading, the server asks its configured OrDEX authority for the order book and validation evidence, reads the current chain tip from the designated Ord authority, and limits the result to inscription IDs already confirmed in the Forked Felines collection.

An order can be called actionable only when all of these are true:

- the seller's signed outpoint is structurally valid;
- the current outpoint exactly matches the signed outpoint;
- the order terms were verified;
- the per-order observation is current and synchronized;
- the backend verdict is `ACTIONABLE`.

If any check is absent or stale, the order carries a refusal reason. If the market authority cannot answer, the desk closes instead of serving an old order book.

## Why the floor may say "not quoted"

The floor is calculated only from actionable orders. Review-only, blocked, stale, moved, or unverifiable orders never contribute to it. If no order passes every check, the truthful floor is `null`, shown as **not quoted**.

The current backend supplies review-only evidence. Until it can prove actionability under the full protocol rules, the desk shows market state without a buy button.

## Safety

An order appearing in a third-party interface does not make it valid here. Verify the exact inscription, price in integer satoshis, signed outpoint, current ownership, and transaction terms at the time you act. Forked Felines is a collectible, not an investment, and the house makes no floor or liquidity promise.

For machine-readable evidence, see the [`GET /api/v1/market`](../reference/public-api.md#get-apiv1market) contract.
