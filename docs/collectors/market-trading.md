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

Repricing is one protocol operation, not a withdrawal followed by a new listing.

1. Open Manage Listing, select your listed order and choose Change price. The desk shows the current price it read from the market.
2. Enter the new price and the proceeds address, then choose Review new price. The desk requests one authoritative ownership challenge for that order and asks your wallet to sign that message. Connecting alone proves nothing.
3. The house builds the replacement ask server-side from the Feline's current confirmed location and opens its continuation page. Sign the replacement's single seller input through Wallet Bridge.
4. Choose Replace the old ask with this one. The gateway retires the old order as replaced and makes the new ask live in one step, under one operation id. The same operation retried returns the same receipt; it never publishes twice.

The old signed ask leaves discovery, but its bytes stay technically spendable until this Feline moves. The desk says so on the continuation page. Only the new ask is offered by the house.

## Withdrawing

Withdrawal is discovery, not cancellation. Removing a listing stops the house showing it; it cannot unpublish a signed artifact that already left the building. Only spending the output makes such an artifact unusable.

The desk requests one authoritative challenge for the selected order and owner. If that service cannot answer, no wallet prompt should open. Sign only the challenge shown by the desk, then check the recorded order state. A lost response is an unknown result until the same operation is checked.

## Buying

Buying keeps Ordex's four named steps, in order: Review, Approve, Node verdict, Send.

Choose one Feline for a single purchase, or several (up to eight) for one atomic batch. A batch needs two small plain-Bitcoin padding outputs per Feline plus funding; Find verified plain Bitcoin selects them from outputs the house has checked. One transaction settles every Feline in the batch or none of them. If one ask can no longer be proved, the whole batch is refused and each refused order is named; nothing is bought as a silent subset. The network fee is paid once for the whole transaction and is not split per Feline.

Keep your payment account and Feline delivery address separate. Find verified plain-Bitcoin outputs through the desk or supply outpoints for the authority to check. Output value alone cannot prove an output is safe to spend.

Review exact purchase saves the operation before requesting its plan. Wallet Bridge asks the appropriate account to sign the required inputs; the node checks the exact transaction; only then does Broadcast become available. No purchase is confirmed merely because a wallet signed or a gateway answered.

## Returning to an operation

Use the saved operation link to resume after a reload, reconnection or signer return. If preparation lost its response, use Retry saved request. An identical retry continues the original operation rather than creating another payment.

If a reply from the market gateway was lost after it recorded a publication, withdrawal or replacement, reopening the operation asks the gateway for its receipt under the same operation id and records the outcome. Nothing is sent twice, and a gateway that never received the request is told so before the same operation is sent once more.

A pending broadcast keeps the same transaction identity while the house checks acceptance. Refresh that operation; do not prepare a second purchase while acceptance is uncertain. A node acknowledgement means sent, and independent chain evidence is needed for confirmed. If a wallet or signing transport is unsupported, the flow must stop with a refusal rather than report success.

## Offers

Funded offers are not available. The house asks the market gateway what it serves before any offer is built; the gateway states that the offer book and its two independent policy signers are not deployed, and the desk reports those exact prerequisites instead of publishing terms nothing can accept or recover. The desk never substitutes a collection root for the scope criterion.

The intended acceptance policy requires two independent signers and an approved expiry-recovery path. Those requirements are not proof of a completed customer workflow:

- **Acceptance** must verify the terms, current ownership, scope, fee bound and node verdict. One policy signer is insufficient.
- **Recovery** must reach an independently verified result through the approved expiry path. Removing offer evidence does not recover locked funds.

Policy signers are part of this design, so it must not be described as trustless. Do not fund an offer until the complete supported flow is available.

The batch limit is eight asks in one atomic transaction; see Buying above.

## Market data you can trust

Floor, volume, and sales come from chain evidence, each with its time range, checkpoint, and freshness. A floor from unverified orders is not shown, and stale market data is never actionable.
