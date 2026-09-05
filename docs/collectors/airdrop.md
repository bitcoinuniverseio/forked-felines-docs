# The Airdrop Desk

The claims window for the BRC 2.0 airdrop. One page states what exists and refuses to invent what does not.

## Before an official snapshot

Until the release process records an official snapshot, there is no eligibility answer and no number. The page explains the fixed formula and the gates, and eligibility checks return exactly one refusal: the snapshot is not available yet. There is no estimate, no provisional allocation, and no early list.

## The exact formula

For one exact Bitcoin address holding K Knot Heads and F Forked Felines at the announced snapshot:

| Holdings | Allocation |
| --- | --- |
| F = 0 | 1,000,000 x K |
| F > 0 | 10,000,000 x (K + F) |

Addresses are never merged by wallet identity. The snapshot keys on the exact scriptPubKey.

## Claim construction is unavailable

The repaired implementation does not yet have an approved inscription executor. It therefore refuses claim construction before opening a signing wallet. A connected wallet, a claim record or a proof digest is not a spendable claim transaction, and no token deployment or claim success is implied by this guide.

Claims also remain subject to the full gate sequence: all 3,333 Felines minted, the snapshot announced and confirmed, the manifest built and independently rebuilt byte for byte, the deployment manifest signed, and signet claims proven end to end. A future supported claim flow must:

1. Resolve the exact snapshot address and its current release.
2. Verify the leaf, allocation and Merkle proof against that release's verified manifest.
3. Build a real inscription transaction with verified funding, sender script, fees and return outputs.
4. Verify the returned signature against the persisted plan, obtain the node verdict, and require an explicit send.

The one-live-claim-per-leaf rule remains. An existing allocation or claim row does not prove that execution or reorg recovery has been completed. Do not retry by funding a separate transaction while an earlier outcome is uncertain.

## No market copy, ever

The Airdrop Desk shows no token price, no implied value, no exchange links, and no timing promises. Allocation is a formula fact; value is not.
