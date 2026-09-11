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

The cache and availability corrections described below are prepared for application validation. This documentation update does not certify which build is deployed. Follow the response's actual status, freshness and cache headers; do not assume an unavailable authority has an empty result.

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
| `pricing.freeMintServiceFeeSats` | `"0"`: the service fee on an order made entirely of free-mint credits |
| `holderSnapshot.blockHeight` | `963238`, with `permanence: "FIXED"` |
| `settlement.*` | The house's posted mainnet proceeds and service-fee addresses |
| `timing.quoteTtlSeconds` / `orderTtlSeconds` | `900` / `3600` |
| `saleState`, `pricingPhase`, `mode` | The live sale posture |
| `futureAirdrop` | The BRC 2.0 airdrop contract, with no value promises |

Cache: fine to cache briefly; the document changes only when the product genuinely changes.

## GET /api/v1/mint/capacity

The public, cacheable mint status document. Schema `forked-felines.mint-capacity/v2`. This is the endpoint to poll if you want to know whether the house is accepting orders.

The document is a fixed public schema: the network, the mint state, coarse reason codes, freshness timestamps, build identity (`sourceCommitSha`, `buildTimestamp`), the block height, and coarse `worker` and `financial` readiness (a `ready` boolean and a queue level or a short detail). Detailed worker, queue, and provider diagnostics are not in it; they are available only to authenticated administrators. Fields outside the public schema never appear, so nothing can be inferred from their absence.

| Field | Meaning |
| --- | --- |
| `mintState` | `OPEN`, `SOLD_OUT`, `FINISHED`, `PAUSED`, or `UNAVAILABLE` |
| `safeToAcceptOrders` | Conservative global health summary; individual actions use `operations` |
| `operations` | Server-derived readiness and safe reason codes for QUOTE, ORDER, PAYMENT_PREPARATION, PAYMENT_BROADCAST, and CANCEL |
| `reasonCodes` | Coarse global health reasons, for example `BACKUP_RESTORE_VERIFICATION_STALE` |
| `maximumSupply`, `finalSupply` | Supply invariants |
| `intakeChecks`, `processingChecks` | Named dependency checks with `ready` booleans |
| `serverNow` | Server time for interpreting timestamps |
| `blockHeight` | The block height the house currently sees, or `null` |
| `worker`, `financial` | Coarse readiness summaries: `ready`, plus a queue level or a short detail |
| `network`, `sourceCommitSha`, `buildTimestamp` | Which network and which build answered |
| `generatedAt`, `cacheAgeMs` | How fresh the cached document is. While the house refreshes its dependency evidence it keeps answering with the last document it built, so `cacheAgeMs` can reach 60 seconds during a dependency stall; a document older than that is not served and the request answers 503 `CAPACITY_DEADLINE_EXCEEDED` instead |

`GET /api/health/ready` is the load-balancer readiness document and follows the same rule: per-check verdicts, reason codes, release mode, deployment and build identity, and the network are public; raw dependency probes, provider addresses, worker instances, and ledger totals are not.

Polling etiquette: no overlapping requests, honor `Retry-After` on 429 and 503, and use bounded backoff. Structured failures preserve safe reason codes and a request ID. After eight consecutive failures, the official UI returns to its one-minute polling cadence; a longer server retry delay still applies. Every mutation revalidates its operation on the server. See [Status contract](status-contract.md) for payment status and temporary connection failures.

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

Order creation, quoting, payment, and support endpoints are part of the application's own checkout flow, protected by signed quotes and session controls; they are not a public integration surface. Admin and internal endpoints are not documented and reject outside callers; the detailed worker and provider diagnostics behind the public status documents live there. Public blockchain observations can include an owner address; reading an address or a holding grants no authority to mutate it.

## Market reads

The public data platform has listing, sale, offer and statistics reads under `/api/public/v1/market`. Read each answer's checkpoint, freshness and coverage. The existence of an offer endpoint does not prove that funded-offer construction or recovery is supported. Unknown offer counts must not be displayed as zero, and incomplete listing coverage must not be presented as a verified floor.

Sale statistics must come from confirmed settlement on the stated network and range, excluding reorged observations. Volume is an integer sum of sale prices, independent of the number of sales. For example, two sales at 9 and 100 sats have volume 109 sats and highest price 100 sats. A returned empty dataset is distinct from an unavailable authority.

Trading mutations remain inside the application. They require the product's ownership proofs, reviewed economics, Wallet Bridge session, Ordex protocol checks, and Bitcoin node preflight; the public namespace is read-only.

## Fair use

Cache what you can, poll gently, and never present these data as your own mint. If you build something collectors love with this API, tell the house through [support](../help/getting-support.md); we link to good work.

## The public data platform: /api/public/v1

A separate, versioned, read-only namespace for wallets, explorers, markets, researchers, and agents. It is a contract, not a courtesy copy of internal routes.

General behavior:

- Every answer carries a schema version, the network, the authorities behind its facts, the observation time, the checkpoint height and block hash, a freshness verdict, and a request id.
- Lists are keyset paged: `limit` and `cursor` in, `nextCursor` out, empty on the last page. A cursor the server never issued is a `400`, never a silent first page.
- Ownership, history and growing collection manifests can change. These endpoints use bounded caching and revalidation rather than year-long immutable caching. An offline inclusion proof still proves membership in its exact root; it does not prove that root is the latest collection view.
- ETags cover the exact response representation, including its metadata. Send the returned tag in `If-None-Match`; an unchanged representation may return `304`. A changed ownership observation, reorg or manifest must not reuse a validator for different response bytes.
- Summary responses use a thirty-second cache lifetime with revalidation. Address-dependent searches and eligibility answers use `no-store`. Verified immutable artwork bytes remain a separate content-addressed contract.
- No mutation route exists in this namespace.

Endpoints: `collection`, `collection/manifest`, `collection/seal`, `felines`, `felines/{edition}`, `felines/{edition}/proof`, `felines/{edition}/history`, `search`, `activity`, `market/listings`, `market/sales`, `market/offers`, `market/stats`, `airdrop`, `airdrop/eligibility`, and the `events` server-sent stream with `Last-Event-ID` replay.

Use only query parameters documented in the machine contract. The Felines list does not currently provide a trait-filter contract; adding an arbitrary trait parameter does not establish that the response was filtered. Airdrop eligibility uses an uncached POST read and does not create a claim or authorize a transaction.

The machine contract lives in the repository at `docs/public-api.openapi.json` (OpenAPI 3.1). Its server is `https://forkedfelines.art`, the same origin the site is served from. The typed client is `@forked-felines/sdk`; it defaults to that origin, honours an explicit local or test `baseUrl`, and refuses any answer that does not satisfy the contract exactly: a wrong schema version, an unknown network, a malformed authority record, an impossible checkpoint, a freshness that contradicts the observation, a payload field of the wrong type, or a page whose `hasMore` disagrees with its `nextCursor`. Nothing is coerced into plausible data; sat amounts stay decimal strings. Pass `expectedNetwork` to refuse answers from another network. The `ff` CLI (in the same package) answers from a terminal:

```bash
ff collection
ff manifest                          # recomputes the Merkle root locally
ff feline 1234
ff proof 1234 <expected-root>        # verifies the path against a root you supply
ff verify-proof proof.json <root>    # offline, from a saved proof
ff verify-seal seal.json
ff history 1234
ff search <edition-or-inscription>
ff market listings|sales|offers|stats
ff activity
ff airdrop status
ff airdrop eligibility <address>
ff events 10                         # ten events from the stream, then stop
```

Proof and seal verification work offline: `verifyInclusionProofOffline`, `verifyManifestRootOffline` and `verifySealBytesOffline` recompute everything from public bytes with the reviewed collection-proof rules (domain-separated leaves and interior nodes, sides as the proof states them, odd nodes promoted), so nothing depends on trusting the server that answered. The CLI prints only verdicts it computed.
