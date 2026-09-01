# Whole on Bitcoin

A Forked Feline is not a link to an image. The image is the inscription.

## What is actually on chain

Each Feline is inscribed as a complete SVG document: every path, every color, the entire portrait, as bytes in a Bitcoin inscription delivered to the owner's address. If every server the house runs disappeared tonight, every inscribed Feline would still exist, whole, wherever Bitcoin is archived.

## The envelope, in detail

The inscription is an ordinary Ordinals envelope with no unusual parts, which is exactly the point. Inside it:

| Field | Value |
| --- | --- |
| Content type | `image/svg+xml`. The artwork's own type, not a wrapper around one |
| Content encoding | `br`. The SVG is Brotli compressed, and decompresses to the exact drawing, byte for byte |
| Body | The whole compressed document, pushed in consecutive chunks. Nothing is truncated and nothing is referenced |
| Delivery | One output carrying the inscription to your receiving address |

Two consequences worth knowing:

- **What a node hands you depends on what you asked for.** An Ordinals index serving inscription content decompresses it for you, so you get the SVG. Reading the raw witness body instead gives you the compressed bytes. The digest published on each Feline's card is of the **decompressed SVG**, which is also what the public artwork endpoint returns and what its `x-content-sha256` header names. See [Verify a Feline](verify-a-feline.md).
- **Compression is not a dependency.** Brotli is a published standard with free implementations everywhere. It saves blockspace; it does not add a party you have to trust.

There is no recursion here. A Feline does not fetch another inscription to render, so it cannot be broken by one going missing or by an index that does not support recursive requests.

## Why SVG

- **It is the original art.** The felines are vector drawings; SVG is their native form, not a compression of it.
- **It is small enough to inscribe whole.** A complete portrait is on the order of tens of kilobytes, practical to carry on chain in full.
- **It renders forever.** SVG is a plain-text open standard; the bytes are human-inspectable and need no proprietary decoder.

## What this rules out

| Common pattern elsewhere | Forked Felines |
| --- | --- |
| Token points at an image URL | No URL. The bytes are on Bitcoin |
| Metadata server describes traits | Traits are derived from the frozen recipe and published with evidence |
| Art "migrates" or "upgrades" later | The inscribed bytes are final. Nobody, including the house, can change them |
| Rendering depends on a company existing | Rendering depends on an SVG viewer existing |

## Seeing it yourself

Every Feline's page links its inscription ID through the designated Forked Felines Ord authority. Your own node will show you the same bytes the house shows you, and the digest of those bytes appears on the Feline's card, so you can check that everyone is talking about the same artwork. See [Provenance](provenance.md).

## Next

- [Verified artwork](verified-artwork.md)
- [Provenance](provenance.md)
