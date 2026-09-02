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

## Claiming

Claims open only after the full gate sequence: all 3,333 Felines minted, the snapshot announced and confirmed, the manifest built and independently rebuilt byte for byte, the deployment manifest signed, and signet claims proven end to end. When the window is live:

1. Enter the exact address that held the allocation.
2. The desk locates your leaf in the manifest, verifies the Merkle proof, and shows your exact allocation, the snapshot, and the proof, downloadable.
3. Start the claim: one transaction, inscribed from the snapshot address itself, authorized by the module deriving the sender from that exact script.
4. Sign through the Wallet Bridge, read the node verdict, send.

One live claim per leaf. A replayed claim fails. A claim that reorgs releases the leaf to try again.

## No market copy, ever

The Airdrop Desk shows no token price, no implied value, no exchange links, and no timing promises. Allocation is a formula fact; value is not.
