# Changelog

Notable changes to the Forked Felines public documentation. Product changes are reflected here when they change what a collector should know.

## 2026-09-02

### Added

- The Wallet Bridge, current owner and chain history, collector ledger, Transfer Desk, Trading House, Airdrop Desk, Collection Seal, holder rights, and portable proof guides.
- The versioned `/api/public/v1` data platform, including collection manifests, per-edition inclusion proofs, confirmed history, market reads, airdrop status, event replay, the typed SDK, and the `ff` command-line client.

### Changed

- Provenance now explains the collection manifest, per-edition Merkle proof, and seal verification path that replaced the earlier list-only membership check.
- Market documentation now separates verified house reads from third-party claims and never infers a floor from stale or incomplete data.

## 2026-09-01

### Removed from the 2026-09-01 live manual

Three endpoints and one whole page were written against a design rather than the product that was live that day. None had been published to the live manual, so they were removed until the product shipped them. The 2026-09-02 release above supersedes those availability statements.

- **A market desk page**, describing a read-only order book, its actionability checks and its floor logic. On 2026-09-01 the application had no trading surface, served no market endpoint, and returned no answer at `GET /api/v1/market`.
- **`GET /api/v1/collection/manifest` and `GET /api/v1/collection/proof/{edition}`**, documented in [Public API](docs/reference/public-api.md) and used as a verification workflow in [Provenance](docs/collection/provenance.md). Both returned `404` on 2026-09-01, so the manual reverted to the collection listing until the replacement `/api/public/v1` manifest and proof contracts shipped.
- **A verifier command** in [Provenance](docs/collection/provenance.md) referring to a tool in the application repository. There is no such tool.

A reader who follows a documented endpoint into a `404` has lost more than the time: they have lost the reason to believe the next page. Every endpoint on the Public API page now answered when it was checked, and the page says so at the top.

### Added

- **[The plates](docs/collection/the-plates.md)**: eight confirmed Felines hung at full size with a museum catalogue entry each, showing plate, edition, medium, dimensions, byte length, digest, setting odds and inscription. The artwork is the real thing, saved from the public artwork endpoint into this repository, so the digest printed under each frame is the digest of the file the page just served you.
- **[Trait catalogue](docs/collection/trait-catalogue.md)**: what the ten traits decide, and every value that has appeared on a confirmed Feline, with a filter. It states its own two limits on the page: the list is a floor rather than the whole recipe, because unreleased values are deliberately not published, and the tallies are mint progress rather than odds.
- **[Verify a Feline](docs/collection/verify-a-feline.md)**: a task guide for checking artwork against its committed digest, with the command line steps, the failure states, and a checker that computes SHA-256 inside your own browser. Nothing is uploaded, because this site has no server to upload it to.
- **[Traits and odds](docs/collection/traits-and-odds.md)** now explains what a one-in figure means against a maximum supply of 3,333, and records that the tier words overlap in the confirmed Felines published so far, so a tier word cannot be read as a ranking of the figure.
- **[Order states](docs/reference/order-states.md)** now publishes the complete transition table. Two rows explain most of the surprises: an expired reservation can still see a late payment and refund it, and a recoverable failure leads back into the flow rather than out of it.
- **[Whole on Bitcoin](docs/collection/whole-on-bitcoin.md)** now describes the actual inscription envelope, including that the SVG is carried Brotli compressed and that the published digest is of the decompressed drawing. A holder hashing raw witness bytes would otherwise get a digest that correctly fails to match.
- **`docs.manifest.json`**, `llms.txt`, a documentation manifest link and machine-readable copies of the pinned facts, so the central platform and other readers can ingest this repository without scraping it.

### Changed

- **The manual is now a gallery.** New homepage, new typography, artwork plates with proper mattes, catalogue entries set as catalogue entries, and a daylight and after-hours theme that both meet WCAG 2.2 AA. Every page carries a provenance block naming its owning repository, source path, chain, network, lifecycle, product contract and verification date.
- **[Supported wallets](docs/collectors/supported-wallets.md)** stops implying that every listed wallet can pay. The site asks the connected provider what it exposes and labels it from the answer, so the same wallet can be ready for checkout on one machine and address only on another. The page also states which recipient script types are accepted: Taproot and native SegWit yes, legacy and nested SegWit no.
- **[Prices and fees](docs/collectors/prices-and-fees.md)** names the 546 sats of inscription postage as postage rather than fee, since it arrives at your address with the Feline, and records that the commit transaction is funded by the house. Order quantity is 1 to 20, and up to 3 unpaid orders may be held at once.
- **[Status contract](docs/reference/status-contract.md)** lists all five values of `mintState`. `FINISHED` was missing.
- **[My Booth](docs/collectors/my-booth.md)** separates reading a booth from acting on one. Anyone can look up any address; cancelling is authorized by a token held only by the browser that created the order.

### Product facts

- Supply, pricing, holder snapshot, and settlement facts are unchanged.

## 2026-08-29

### Added

- [Stay safe](docs/safety/stay-safe.md) now says which parts of the house are jokes and which are never jokes. The guest book is written by the house, and every card in the product now says so on the card itself, including where a single card is lifted out of the book and set beside an FAQ answer, the portrait wall, or a booth. The portraits on those cards are real published KNOT HEADS inscriptions, which is exactly what made an unlabelled card read as a customer testimonial.

### Changed

- The Knot Heads press claim on the product is now dated. A marketplace position is a reading taken on a day, so the day it was reported travels with it.
- The roadmap no longer says the collection is upcoming before it has read the capacity document. The served page previously told search engines and every first paint that a collection currently minting had not started.
- The expired-order row in [Order status](docs/collectors/order-status.md) no longer tells a visitor to "just order again". The house copy rules ban that word where it would make a money-adjacent act sound trivial, and a reservation that expired is the state where a reader is most likely to be worried about a payment. The product says the same thing, in the same words.

- [The collection wall](docs/collection/collection-wall.md): the wall now arrives hung. Its frames are in the page the server sends, so a search engine, a link preview, and a phone on a slow connection all see the same portraits a browser shows. Previously the wall was fetched only in the browser, and the served page linked to none of the confirmed Felines. A wall that is already hung now stays hung when a refresh fails.
- Every page of the product now carries a proper preview card when its link is shared. Previously only the support page did, so a link pasted into a chat arrived as a bare row of text.
- The holder entitlement is called a **free-mint credit** everywhere. A few product surfaces still used a name from a retired policy; the documentation always used the current one, and now the product agrees with it.

### Publication gate

- An unreachable product endpoint no longer blocks publication. The live-contract check now exits 75 for "could not reach the product" and 1 for "the facts disagree", and only the second stops a publish. A 404 counts as the second: if the contract moves, the endpoint answers, and that is the event this check exists to catch. It stays counted even if the path drops afterwards, so a real 404 cannot be masked by later noise. The two shared an exit code, so a runner that could not open a socket blocked the publication of correct documentation while the site kept serving an older build, which is the worse of the two outcomes. The facts stay guarded either way: they are pinned offline and that check runs first.

- No word may be published twice in a row. Markdown wraps prose across source lines, so a word typed twice reads as two clean lines in a diff and as a defect on the page.
- One verification date. The README, the reference page, and `facts/facts.json` must agree on when the facts were last checked against the live product contract.

### Product facts

- Unchanged. Re-verified against the live `GET /api/v1/product` contract on 2026-08-29.

## 2026-08-28

### Added

- First public release of the House Manual: start-here guides, collector guides, collection and provenance explanations, safety guidance, help, and the public API reference.
- `facts/facts.json`: the machine-checked product facts this documentation is validated against, themselves verified against the live `GET /api/v1/product` contract.
- The documentation site, built from this repository's Markdown and published through GitHub Pages.

### Product facts at first publication

- Maximum supply 3,333; public collection price 8,888 sats; community (credited) price 0 sats; initial service fee 1,500 sats; holder snapshot at Bitcoin block 963,238; pricing contract `forked-felines.community-remediation/v4`.
- Every confirmed Feline has its own page at `forkedfelines.art/collection/<edition>` with traits, frozen odds, a hand-written house note, and full provenance evidence.
- Portraits are served with byte-level verification and a second Universe-operated artwork source that survives index rebuilds.
