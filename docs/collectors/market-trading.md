# The Market: listing, buying, and offers

The house desk is a complete trading product built on the Ordex protocol. Every order is a signed seller half, verified against Bitcoin before it is offered, and settled only by the chain.

## Listing a Feline

1. Open the Market and choose List, or start from My Booth.
2. The desk proves you currently own the Feline and reads its exact outpoint.
3. Enter an exact price and an expiry. Seller proceeds, the marketplace fee, the creator royalty, and network assumptions are shown before anything is signed.
4. Sign the seller half through the Wallet Bridge. The half commits your input and your payment output and nothing else.
5. The desk publishes through Ordex, re-reads the live order, and shows it on the Market, the item page, and My Booth.

## Repricing

Repricing is a protocol operation, not a database edit. The old ask leaves the book as REPLACED and the freshly signed one goes live in a single step. Two live asks for one Feline and one seller cannot exist.

## Withdrawing

Withdrawal is discovery, not cancellation. Removing a listing stops the house showing it; it cannot unpublish a signed artifact that already left the building. Only spending the output makes such an artifact unusable.

## Buying

Buying keeps Ordex's four named steps, in order: Review, Approve, Node verdict, Send.

The desk fetches the live artifact, re-proves the seller's ownership, classifies every one of your funding and padding outputs, and shows the exact economics: seller proceeds, marketplace fee, royalty, network fee, padding, your total. Your wallet signs; the node answers about the exact bytes; then an explicit Send exists. Only the preflighted bytes are ever broadcast.

## Offers

Offers come in three scopes: one exact item, the whole collection, or one trait value. A collection or trait offer binds to a confirmed collection root, so acceptance is provable against a fixed manifest.

A posted offer is one Taproot output you funded whose address commits to the exact terms:

- **Acceptance** requires two independent policy signers, each proving the terms, the ownership, the scope, the fee bound, and the node verdict on its own authority. Neither signer can spend alone.
- **Recovery** is yours alone after the expiry height: one signature returns the whole output.

The honest trust statement: before expiry, the two signers together could spend the offer outside these rules, so an offer is not trustless. Forked Felines never holds your private key, and after expiry you recover alone.

## Market data you can trust

Floor, volume, and sales come from chain evidence, each with its time range, checkpoint, and freshness. A floor from unverified orders is not shown, and stale market data is never actionable.
