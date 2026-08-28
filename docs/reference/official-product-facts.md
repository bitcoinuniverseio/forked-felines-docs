# Official product facts

The exact facts of Forked Felines, as published by the live product contract. If any page anywhere disagrees with this one, this one and the live endpoint win.

**Source of truth**: `GET https://forkedfelines.art/api/v1/product`, schema `forked-felines.public-product/v5`. Last verified against the live endpoint: **2026-08-28**.

## Collection

| Fact | Value |
| --- | --- |
| Name | Forked Felines |
| Maximum supply | 3,333 |
| Artwork | deterministic SVG, hash-verified, inscribed whole on Bitcoin |
| Relationship | official KNOT HEADS companion collection |

## Pricing (`forked-felines.community-remediation/v4`)

| Fact | Value |
| --- | --- |
| Public collection price | 8,888 sats |
| Community (credited) collection price | 0 sats |
| Initial service fee | 1,500 sats |
| Service fee per accepted RBF bump | 1,500 sats |
| Network and delivery costs | live, itemized separately, payable on every mint |
| Quote validity | 900 seconds (15 minutes) |
| Order reservation window | 3,600 seconds (1 hour) |

## Holder snapshot

| Fact | Value |
| --- | --- |
| Snapshot block height | 963,238 |
| Snapshot block hash | `00000000000000000001608f168db0955f711094794e99bf7a14a7167028ee2a` |
| Eligibility | ownership at that block, fixed forever |
| Entitlement | one free-mint credit per eligible Knot Head |
| KNOT HEAD allowlist size | exactly 1,110 inscriptions |

## Remediation

| Fact | Value |
| --- | --- |
| Eligible | pre-v4 paid, delivered Felines still held by their original order recipient at the fixed remediation snapshot |
| Choice, once per qualifying Feline | five free-mint credits, or a refund of that Feline's original mint price |
| Refund destination | the original payment address, only |
| Excluded from refunds | network, postage, service, and RBF costs |

## Future airdrop

| Fact | Value |
| --- | --- |
| Protocol | BRC 2.0 |
| Snapshot | separately announced after mint-out |
| Eligibility | at least one Knot Head or Forked Feline at that future snapshot |
| Promised about value | nothing |

## Historical pricing versions

v1 (4,440 / 11,000 sats), v2 (8,888 / 16,161 sats), and v3 (22,222 / 33,333 sats) are historical only. Signed quotes issued under them remain verifiable; no active surface advertises them; the remediation program above compensates eligible early minters.

## Verifying this page

```bash
curl -s https://forkedfelines.art/api/v1/product
```

Compare the response fields with the tables above. This documentation's CI performs the same comparison against `facts/facts.json` in this repository.
