# Public API

The read-only endpoints Forked Felines intentionally exposes to the public. They are unauthenticated, free to read, and safe to build small integrations on. Everything else under `/api/` is private to the application and not a contract.

**Base URL**: `https://forkedfelines.art`

General behavior:

- All responses are JSON with an `x-request-id` header.
- Sat amounts are strings of integer satoshis. No floats, ever.
- Rate limiting applies; on `429`, honor `Retry-After`.
- Public endpoints never require, accept, or reveal wallet credentials.
- Stability: fields are added over time; existing fields are not repurposed. Each payload names its own `schemaVersion` where versioned.

## Every endpoint on this page answers

This page lists what the live product actually serves, and nothing else. Each endpoint below was requested against the live product on **2026-08-29** and returned a real response. An endpoint that is planned, designed, or half-built does not appear here at all, because a reference that mixes the two is worse than no reference.

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
| `mintState` | `OPEN`, `SOLD_OUT`, `FINISHED`, `PAUSED`, or `UNAVAILABLE` |
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

## GET /api/v1/inscriptions/{inscriptionId}/content

The verified artwork bytes for a confirmed Feline: `image/svg+xml`. Bytes are served only after hashing against the digest recorded at reservation. Unverifiable content returns `502` rather than a guess.

The response headers carry the proof, so a client never has to trust the body alone:

| Header | Meaning |
| --- | --- |
| `x-content-sha256` | SHA-256 of the exact bytes in this response. Hash the body yourself and compare |
| `etag` | The same digest, so an ordinary HTTP cache is keyed by artwork identity |
| `x-artwork-source` | Which verified source answered, either the project's own Ordinals index or the pinned release runtime |
| `cache-control` | `public, max-age=31536000, immutable`. Verified artwork bytes never change, so they are cached forever |

An inscription ID that is not 64 hex characters followed by `i` and an index returns `400`. An inscription that is not a confirmed Feline returns `404`.

See [Verify a Feline](../collection/verify-a-feline.md) for the full independent check.

## GET /api/v1/block

The house block clock: `{ "available": true, "height": 964451, ... }`. When the source is unhealthy, `available` is `false` and no stale height is shown.

## GET /api/v1/fees

The live fee-rate recommendations (sat/vB) the quote flow uses: `economy`, `normal`, `priority`, plus a `source.degraded` flag. The answering provider is named by rank, never by address.

## What is intentionally not public

Order creation, quoting, payment, and support endpoints are part of the application's own checkout flow, protected by signed quotes and session controls; they are not a public integration surface. Admin and internal endpoints are not documented and reject outside callers. Detailed per-address holdings are not exposed through any unauthenticated profiling endpoint, by design.

## There is no market endpoint

Forked Felines has no trading surface, so it publishes no order book, no listings, and no floor price. There is nothing to integrate against and nothing planned that this page is holding back. See [What is Forked Felines?](../start-here/what-is-forked-felines.md) for what the product deliberately is not.

If a site shows you a Forked Felines order book, it is a third party's reading of Bitcoin, not a house surface, and none of the checks described here apply to it.

## Fair use

Cache what you can, poll gently, and never present these data as your own mint. If you build something collectors love with this API, tell the house through [support](../help/getting-support.md); we link to good work.
