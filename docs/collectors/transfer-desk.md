# The Transfer Desk

The parcel counter sends one or several Forked Felines in one exact transaction, where every satoshi is proved before your wallet is ever opened.

## The short version

1. Choose the Felines you currently own.
2. Enter each recipient's Ordinals address.
3. Review the exact transaction: every input, every output, every preserved asset, the fee.
4. Sign through the Wallet Bridge.
5. Read the owned node's verdict.
6. Press Send yourself.

Nothing is broadcast until you press Send, and the bytes sent are the exact bytes the node checked.

## Why mixed outputs are refused, not warned about

An output holding a Feline often holds other things: another inscription, rare sats, a rune balance. The desk classifies everything in every source output before planning. When something cannot be fully interpreted by the owned authorities, the transfer is refused. "Unknown" is never treated as "empty".

When a source output holds several known assets, the plan splits it: each asset lands whole in its own output, in sat order, with sufficient postage. The Feline you are sending lands alone in the recipient's output. Every other asset stays with you, accounted for.

## Fees

Only proven cardinal outputs pay fees. An output carrying any asset is never a fee input. The exact fee is shown before you sign, and the plan proves the target sat cannot enter the fee.

## Recovery

Rejections, expiries, stale sources, mempool conflicts, network switches, closed pages, mobile returns, broadcast ambiguity, and reorgs all have named paths. A stale source never recreates a transfer: the desk revalidates and produces a fresh intent.

## Where things live

| Item | Where |
| --- | --- |
| The desk | `/transfer` |
| Entry points | My Booth and every item page |
| Recovery of an ambiguous send | Support, with your request id |
