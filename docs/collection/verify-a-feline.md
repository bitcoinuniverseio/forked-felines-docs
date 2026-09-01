# Verify a Feline

**For**: anyone holding, buying, or simply curious about a Forked Feline, with no trust in this site required.
**Goal**: prove that the artwork shown for an edition is exactly the artwork the house committed to before it was inscribed.

| | |
| --- | --- |
| Chain and network | Bitcoin mainnet |
| Applies to | Any confirmed edition |
| Product contract | `forked-felines.public-product/v5` |
| Costs | Nothing. No wallet, no signature, no transaction |
| Safety | This check is read-only. Nothing on this page asks for a wallet, a signature, a seed phrase, or a payment. If a page claiming to verify Felines asks for any of those, read [What we will never ask](../safety/what-we-will-never-ask.md) |

## What you are proving

That three things agree:

1. the bytes at the inscription on Bitcoin,
2. the digest the house recorded **before** the Feline was reserved, and
3. the picture you were shown.

If all three match, the artwork is what was committed to, and no server had to be believed to establish it. See [Provenance](provenance.md) for why the record is made before reservation rather than after inscription.

## Prerequisites

- A way to compute SHA-256. Every desktop operating system ships one, and the checker below does it inside your own browser.
- The edition number, or the inscription ID, of the Feline you are checking.
- Optionally your own Bitcoin node with an Ordinals index, if you would rather not fetch the bytes from the house at all.

## Steps

1. **Open the Feline's page** at `forkedfelines.art/collection/<edition>`. Note the artwork digest, the byte length, and the inscription ID.
2. **Get the artwork bytes.** Either fetch them from your own node using the inscription ID, or download them from the public artwork endpoint:

   ```bash
   curl -s -o feline.svg \
     https://forkedfelines.art/api/v1/inscriptions/<inscriptionId>/content
   ```

   Fetching from your own node is the stronger check, because it removes the house from the loop entirely. That response also carries an `x-content-sha256` header naming the digest of the body it just sent, which is useful for spotting a mangled download immediately:

   ```bash
   curl -sI \
     https://forkedfelines.art/api/v1/inscriptions/<inscriptionId>/content \
     | grep -i x-content-sha256
   ```

   A header is a convenience, not the proof. The proof is comparing your own hash with the digest printed on the Feline's card.
3. **Check the length.** It must equal the byte length on the card exactly.

   ```bash
   wc -c feline.svg
   ```
4. **Hash the bytes** and compare with the digest on the card, character for character.

   ```bash
   shasum -a 256 feline.svg
   ```

## Expected result

The digest you computed equals the digest on the Feline's card, and the byte length matches. That is the whole proof. The artwork at that inscription is exactly what the house recorded before inscribing, and it cannot be changed afterwards by the house or by anyone else.

## Check it here first

The checker below runs entirely inside your browser. Nothing you drop into it is uploaded, and it works the same on any file, so you can practise on a plate this site serves before checking a Feline of your own.

<!-- component: digest-checker -->

## Common failure states

| What you see | What it means | What to do |
| --- | --- | --- |
| The digests differ | The bytes you hashed are not the bytes that were committed | Re-download without any transformation. A text editor that adds a trailing newline, or a shell that rewrites line endings, changes the bytes and therefore the digest |
| The byte length differs | Same cause, and this is usually the faster tell | Compare the length first; it localizes the problem immediately |
| The artwork endpoint returns `502` | The house could not verify the bytes from either source, so it refused to serve a guess | Your Feline is unaffected; it is on Bitcoin. Fetch from your own node, or try again later. See [Verified artwork](verified-artwork.md) |
| Your node has no such inscription | The inscription ID is wrong, or your node's index has not caught up | Recheck the ID on the Feline's page, then let the index finish |
| The edition has no page | That edition is not confirmed yet | Unreleased editions publish no digest and no artwork, by design |

## Recovery path

Nothing in this check can damage anything: it reads bytes and computes a hash. If a digest genuinely does not match after you have ruled out a transformed download, that is a finding worth reporting. Use the private channel in [Reporting a security problem](../safety/reporting-a-security-problem.md), not a public issue.

## Verifying membership, not just artwork

Proving the artwork is right is a different question from proving an edition belongs to the collection. The application contract defines a published manifest and per-edition Merkle proofs for that second question. Their availability on the live product is recorded in [Public API](../reference/public-api.md), which was checked against the live product on the date printed there.

## Related reference

- [Provenance](provenance.md): the full chain of evidence, and why each link exists
- [Verified artwork](verified-artwork.md): what the house checks before it shows you a portrait
- [Whole on Bitcoin](whole-on-bitcoin.md): why there are bytes to hash at all
- [Public API](../reference/public-api.md): the endpoints used above
