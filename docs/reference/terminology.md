# Terminology

The words this documentation and the app use, defined once.

| Term | Definition |
| --- | --- |
| **Feline** | One Forked Felines inscription: a complete SVG artwork inscribed on Bitcoin and delivered to an address |
| **Edition** | A Feline's number, 1 through at most 3,333 |
| **Inscription** | Data written into a Bitcoin transaction under the Ordinals convention; a Feline is one |
| **Inscription ID** | The permanent identifier of an inscription, derived from the transaction that created it |
| **Recipient / receiving address** | The Bitcoin address that receives the Feline and determines holder standing |
| **Payment address** | The house address printed on a signed quote where the exact total is paid |
| **Signed quote** | A server-signed, 15-minute price document itemizing every cost of a mint into one exact total |
| **Collection price** | The price of the Feline itself: 8,888 sats public, 0 sats with a credit |
| **Service fee** | The house's flat 1,500-sat fee per mint, plus 1,500 sats per accepted RBF bump |
| **Free-mint credit** | The right to one 0-sat collection price mint, from the Knot Heads snapshot or remediation |
| **Snapshot** | The fixed record of Knot Heads ownership at Bitcoin block 963,238 |
| **Kitchen ticket** | The live order tracker; each state reflects verified reality |
| **Held table** | An unpaid reservation; supply is only consumed when an inscription confirms |
| **Mempool** | Bitcoin's waiting room of unconfirmed transactions |
| **Confirmation** | Inclusion of a transaction in a Bitcoin block |
| **RBF (replace-by-fee)** | Replacing an unconfirmed payment with a higher-fee version; at most one of the two confirms |
| **BIP-322** | The Bitcoin message-signing standard used to prove address control without moving funds |
| **Taproot address** | A `bc1p...` Bitcoin address; the usual home for inscriptions |
| **Seed (artwork)** | The frozen input from which every Feline is deterministically drawn. Unrelated to a wallet seed phrase |
| **Seed phrase (wallet)** | Your wallet's recovery words. Never shared with anyone, including the house |
| **Recipe** | The frozen definition of every trait, its artwork, and its generator weight |
| **Digest** | A SHA-256 hash committing to exact bytes; the artwork digest is recorded before reservation |
| **Whole on Bitcoin** | The complete artwork bytes live in the inscription itself, with no external references |
| **My Booth** | The per-address ownership view: Felines, orders, credits, standing, support |
| **Pairing card** | A shareable image of a Feline beside a Knot Head held at the same address |
| **Remediation** | The v4 program compensating eligible early minters, by choice of credits or an original mint-price refund |
| **Fail closed** | When a dependency is unhealthy, the house stops intake rather than guessing |
