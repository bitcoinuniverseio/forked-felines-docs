# Public API

The read-only endpoints Forked Felines intentionally exposes to the public. They are unauthenticated, free to read, and safe to build small integrations on. Everything else under `/api/` is private to the application and not a contract.

**Base URL**: `https://forkedfelines.art`

General behavior:

- All responses are JSON with an `x-request-id` header.
- Sat amounts are strings of integer satoshis. No floats, ever.
- Rate limiting applies; on `429`, honor `Retry-After`.
- Public endpoints never require, accept, or reveal wallet credentials.
- Stability: fields are added over time; existing fields are not repurposed. Each payload names its own `schemaVersion` where versioned.

## GET /api/v1/product

The product facts contract. Schema `forked-felines.public-product/v5`.

```bash
curl -s https://forkedfelines.art/api/v1/product
```

Key fields:

| Field | Meaning |
| --- | --- |
| `collection.supply` | Maximum supply, `3333` |
| `pricing.publicMintPriceSats` | `"8888"` |
| `pricing.communityMintPriceSats` | `"0"` |
| `pricing.baseServiceFeeSats` | `"1500"` |
| `pricing.rbfServiceFeeIncrementSats` | `"1500"` |
| `holderSnapshot.blockHeight` | `963238`, with `permanence: "FIXED"` |
| `settlement.*` | The house's posted mainnet proceeds and service-fee addresses |
| `timing.quoteTtlSeconds` / `orderTtlSeconds` | `900` / `3600` |
| `saleState`, `pricingPhase`, `mode` | The live sale posture |
| `futureAirdrop` | The BRC 2.0 airdrop contract, with no value promises |

Cache: fine to cache briefly; the document changes only when the product genuinely changes.

## GET /api/v1/mint/capacity

The public, cacheable mint status document. Schema `forked-felines.mint-capacity/v2`. This is the endpoint to poll if you want to know whether the house is accepting orders.

| Field | Meaning |
| --- | --- |
| `mintState` | `OPEN`, `SOLD_OUT`, `PAUSED`, or `UNAVAILABLE` |
| `safeToAcceptOrders` | The fail-closed boolean the UI obeys |
| `reasonCodes` | Exact, technical reasons when intake is closed |
| `maximumSupply`, `finalSupply` | Supply invariants |
| `intakeChecks`, `processingChecks` | Named dependency checks with `ready` booleans |
| `serverNow` | Server time for interpreting timestamps |

Polling etiquette: no overlapping requests, honor `Retry-After`, use bounded backoff. The official UI does exactly this.

## GET /api/v1/collection

Every confirmed Feline, for rendering a wall honestly.

| Field | Meaning |
| --- | --- |
| `supply` | Maximum supply |
| `revealedCount` | Confirmed felines so far |
| `revealed[]` | One entry per confirmed Feline |
| `revealed[].edition` | Edition number |
| `revealed[].traits` | Trait names and values |
| `revealed[].rarity` / `rarityOneIn` | The frozen generator odds |
| `revealed[].servedAt` | When it was actually served |
| `revealed[].inscriptionId` | The inscription carrying the artwork |
| `revealed[].artworkUrl` | The verified artwork endpoint below |

Unreleased editions never appear, in any state.

## GET /api/v1/collection/manifest

The machine-verifiable collection membership document. Schema `forked-felines.collection-proof/v1`.

| Field | Meaning |
| --- | --- |
| `release.collectionId` / `network` / `supply` | The release identity committed by this document |
| `release.studioCommitSha` | The pinned Studio source commit |
| `entries[]` | Confirmed editions, sorted by edition number |
| `entries[].inscriptionId` | The Bitcoin inscription committed for that edition |
| `entries[].artworkSha256` | SHA-256 of the exact artwork bytes |
| `entries[].recipeSha256` / `manifestSha256` | The frozen recipe and Studio inventory commitments |
| `merkleRoot` | One SHA-256 commitment to the complete published entry list |

The response is cacheable for 60 seconds and is also offered as `forked-felines-collection-manifest.json`.

## GET /api/v1/collection/proof/{edition}

A compact Merkle inclusion proof for one confirmed edition. It contains the edition entry, release identity, root, and each left or right sibling hash needed to recompute that root. An invalid edition returns `400`; an edition absent from the published collection returns `404`.

Do not validate a proof against only the root inside the proof itself. Obtain the expected root independently, such as from a manifest you saved earlier, then verify the path against that root. See [Provenance](../collection/provenance.md) for the complete independent check.

## GET /api/v1/inscriptions/{inscriptionId}/content

The verified artwork bytes for a confirmed Feline: `image/svg+xml`. Bytes are served only after hashing against the digest recorded at reservation; the `x-artwork-source` response header names which verified source answered. Unverifiable content returns `502` rather than a guess.

## GET /api/v1/block

The house block clock: `{ "available": true, "height": 964451, ... }`. When the source is unhealthy, `available` is `false` and no stale height is shown.

## GET /api/v1/fees

The live fee-rate recommendations (sat/vB) the quote flow uses: `economy`, `normal`, `priority`, plus a `source.degraded` flag.

## GET /api/v1/market

The house's current, fail-closed reading of Forked Felines orders from its configured OrDEX authority. The response is never cached.

| Field | Meaning |
| --- | --- |
| `freshness`, `ageMs`, `observedAt` | Whether the reading is current and when it was checked |
| `authorityHeight`, `chainTipHeight`, `blocksBehind` | The exact synchronization evidence behind the reading |
| `verifiersConfigured` | Whether the backend reports its required verifiers configured |
| `listed` | Orders tied to confirmed Forked Felines in this release |
| `orders[].backendActionability` | The backend verdict: `REVIEW_ONLY`, `ACTIONABLE`, or `BLOCKED` |
| `orders[].actionable` / `refusal` | The house's independent per-request verdict and exact refusal code |
| `floorSats` | Lowest currently actionable price, or `null` when no safe floor can be proved |

An order is not presented as actionable unless the signed outpoint still matches the current outpoint, its terms were verified, its observation is current, and the backend itself marked it `ACTIONABLE`. The live backend currently returns review-only evidence, so the desk reports facts without offering a buy action or inventing a floor.

## What is intentionally not public

Order creation, quoting, payment, and support endpoints are part of the application's own checkout flow, protected by signed quotes and session controls; they are not a public integration surface. Admin and internal endpoints are not documented and reject outside callers. Detailed per-address holdings are not exposed through any unauthenticated profiling endpoint, by design.

## Fair use

Cache what you can, poll gently, and never present these data as your own mint. If you build something collectors love with this API, tell the house through [support](../help/getting-support.md); we link to good work.
