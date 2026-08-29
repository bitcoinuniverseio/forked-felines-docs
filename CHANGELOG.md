# Changelog

Notable changes to the Forked Felines public documentation. Product changes are reflected here when they change what a collector should know.

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
