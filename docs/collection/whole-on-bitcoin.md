# Whole on Bitcoin

A Forked Feline is not a link to an image. The image is the inscription.

## What is actually on chain

Each Feline is inscribed as a complete SVG document: every path, every color, the entire portrait, as bytes in a Bitcoin inscription delivered to the owner's address. If every server the house runs disappeared tonight, every inscribed Feline would still exist, whole, wherever Bitcoin is archived.

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
