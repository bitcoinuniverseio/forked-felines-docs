# The Market: listing, buying, and offers

The house desk uses the Ordex protocol. A listing is a signed seller half; a Bitcoin purchase requires its own verified transaction and chain evidence. Publishing a listing is not a Bitcoin confirmation.

This guide describes the repaired application flow prepared for validation. It is not a production release announcement. Use only actions the live desk makes available; a closed or unavailable action is not an invitation to sign elsewhere.

## Listing a Feline

1. Open the Market and choose List Feline. Connect the wallet that controls the Feline.
2. Select the inscription from your current portfolio. Its owner address is separate from your sale-proceeds address; a payment account is not assumed to own the inscription.
3. Prove the owner address with the short address-control message, then enter the price and proceeds address. Connecting a wallet alone does not prove ownership.
4. Choose Review listing. Keep the saved operation reference and review the exact terms on its continuation page.
5. Sign the seller's required inputs through Wallet Bridge. The gateway result reports publication; current order status must still be read from the market.

## Repricing

Repricing requires the protocol's replacement operation, a proof for the original order and a newly signed listing. The present collector desk does not provide a complete repricing flow. Do not treat editing a local price or withdrawing an old ask as proof that a replacement went live.

## Withdrawing

Withdrawal is discovery, not cancellation. Removing a listing stops the house showing it; it cannot unpublish a signed artifact that already left the building. Only spending the output makes such an artifact unusable.

The desk requests one authoritative challenge for the selected order and owner. If that service cannot answer, no wallet prompt should open. Sign only the challenge shown by the desk, then check the recorded order state. A lost response is an unknown result until the same operation is checked.

## Buying

Buying keeps Ordex's four named steps, in order: Review, Approve, Node verdict, Send.

Keep your payment account and Feline delivery address separate. Find verified plain-Bitcoin outputs through the desk or supply outpoints for the authority to check. Output value alone cannot prove an output is safe to spend.

Review exact purchase saves the operation before requesting its plan. Wallet Bridge asks the appropriate account to sign the required inputs; the node checks the exact transaction; only then does Broadcast become available. No purchase is confirmed merely because a wallet signed or a gateway answered.

## Returning to an operation

Use the saved operation link to resume after a reload, reconnection or signer return. If preparation lost its response, use Retry saved request. An identical retry continues the original operation rather than creating another payment.

A pending broadcast keeps the same transaction identity while the house checks acceptance. Refresh that operation; do not prepare a second purchase while acceptance is uncertain. A node acknowledgement means sent, and independent chain evidence is needed for confirmed. If a wallet or signing transport is unsupported, the flow must stop with a refusal rather than report success.

## Offers

Funded offers are not available in this implementation. The missing construction contract must provide an exact item, collection or trait criterion and verified funding evidence. The desk refuses construction rather than substituting a collection root for that criterion.

The intended acceptance policy requires two independent signers and an approved expiry-recovery path. Those requirements are not proof of a completed customer workflow:

- **Acceptance** must verify the terms, current ownership, scope, fee bound and node verdict. One policy signer is insufficient.
- **Recovery** must reach an independently verified result through the approved expiry path. Removing offer evidence does not recover locked funds.

Policy signers are part of this design, so it must not be described as trustless. Do not fund an offer until the complete supported flow is available.

The planned batch limit is eight asks in one atomic transaction. A complete collector batch flow remains unavailable; buying items separately does not demonstrate atomic batch settlement.

## Market data you can trust

Floor, volume, and sales come from chain evidence, each with its time range, checkpoint, and freshness. A floor from unverified orders is not shown, and stale market data is never actionable.
