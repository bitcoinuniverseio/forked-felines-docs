# The Collection Seal

The Collection Seal is one confirmed inscription that anchors the collection manifest: the exact Merkle root, the exact manifest hash, the exact Studio and application releases, at a recorded checkpoint.

## What the seal is

A root anchor. It proves which manifest the collection declares itself to be, and it is verifiable by anyone, from public bytes, forever.

## What the seal is not

The seal is not provenance and not a parent. It does not make historical inscriptions children of the seal. Native parent-child status, where it exists, is shown separately and only when present.

## Verifying it yourself

1. Fetch the payload from `/api/v1/collection/seal/payload`, or read the inscription content directly from the chain.
2. Hash the exact bytes with SHA-256. The digest must equal the payload hash on [the seal page](https://forkedfelines.art/collection/seal).
3. For any Feline, verify its inclusion proof against the Merkle root in the payload, with the project verifier, the SDK, or `ff verify-proof`.

Nothing in that path asks you to trust this website's database.

## FINAL and PRE_FINAL

A PRE_FINAL seal anchors a working manifest. A FINAL seal requires the complete final supply and names the prior seal it supersedes. Exactly one seal per network is confirmed at a time; a superseded seal stays readable, permanently.
