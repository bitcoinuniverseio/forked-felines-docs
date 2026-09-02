# Cross-device signing

Every mutation in the house runs through one signing bridge with the same rules, whether you sign on the same device, on your phone, or with a hardware wallet.

## Same device

The extension signs directly. The exact transaction is shown before the wallet prompt; nothing prompts on page load.

## Phone and wallet in-app browsers

The desk creates a signing session bound to one exact action, renders an opaque QR, and your phone opens the same action in your wallet's in-app browser. You sign exactly the artifact you reviewed; the desktop resumes automatically when the verified answer arrives, and shows whether it did.

The QR carries an opaque handle only. No secret, no transaction, and no key material ever enters it, and a session can be answered exactly once.

## Hardware and manual PSBT

Downloads: `.psbt` file, base64, hex where supported, and an animated BC-UR code. Imports: file, paste, or BC-UR scan. The exact artifact hash is checked before and after signing, and a different transaction, a missing signature, an extra input, a changed amount, or a replayed session is refused.

## Expiry and replay

Every signing session expires. Every return is consumed once. An account switch or a network switch between review and return fails safely.
