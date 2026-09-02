# Public API

The read-only endpoints Forked Felines intentionally exposes to the public. They are unauthenticated, free to read, and safe to build small integrations on. Everything else under `/api/` is private to the application and not a contract.

**Base URL**: `https://forkedfelines.art`

General behavior:

- All responses are JSON with an `x-request-id` header.
- Sat amounts are strings of integer satoshis. No floats, ever.
- Rate limiting applies; on `429`, honor `Retry-After`.
- Public endpoints never require, accept, or reveal wallet credentials.
- Stability: fields are added over time; existing fields are not repurposed. Each payload names its own `schemaVersion` where versioned.

## Release contract

This page lists the public routes shipped by the product. The legacy `/api/v1` reads and the versioned `/api/public/v1` data platform are separate contracts; callers should not translate paths between them. Planned or private routes do not appear here.

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

## Market reads

The public data platform exposes verified listings, confirmed sales, funded offers, and bounded market statistics under `/api/public/v1/market`. Each answer states its checkpoint, freshness, and coverage. A stale listing is not presented as live, and incomplete coverage is never presented as a floor.

Trading mutations remain inside the application. They require the product's ownership proofs, reviewed economics, Wallet Bridge session, Ordex protocol checks, and Bitcoin node preflight; the public namespace is read-only.

## Fair use

Cache what you can, poll gently, and never present these data as your own mint. If you build something collectors love with this API, tell the house through [support](../help/getting-support.md); we link to good work.

## The public data platform: /api/public/v1

A separate, versioned, read-only namespace for wallets, explorers, markets, researchers, and agents. It is a contract, not a courtesy copy of internal routes.

General behavior:

- Every answer carries a schema version, the network, the authorities behind its facts, the observation time, the checkpoint height and block hash, a freshness verdict, and a request id.
- Lists are keyset paged: `limit` and `cursor` in, `nextCursor` out, empty on the last page. A cursor the server never issued is a `400`, never a silent first page.
- Final facts (manifests, proofs, seals, confirmed history) are immutable and ETagged by their own digest. Summaries cache for thirty seconds. Answers that echo a caller-supplied address are never cached.
- No mutation route exists in this namespace.

Endpoints: `collection`, `collection/manifest`, `collection/seal`, `felines`, `felines/{edition}`, `felines/{edition}/proof`, `felines/{edition}/history`, `search`, `activity`, `market/listings`, `market/sales`, `market/offers`, `market/stats`, `airdrop`, `airdrop/eligibility`, and the `events` server-sent stream with `Last-Event-ID` replay.

The machine contract lives in the repository at `docs/public-api.openapi.json` (OpenAPI 3.1). The typed client is `@forked-felines/sdk`, and the `ff` CLI (in the same package) answers from a terminal:

```bash
ff collection
ff feline 1234
ff proof 1234          # fetch the inclusion proof
ff verify-seal seal.json
ff history 1234
ff search <edition-or-inscription>
ff market listings
ff airdrop status
```

Proof and seal verification work offline: `verifyInclusionProofOffline` and `verifySealBytesOffline` recompute everything from public bytes, so nothing depends on trusting the server that answered.
