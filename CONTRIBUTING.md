# Contributing to the House Manual

Thank you for improving the documentation. This repository holds the official public docs for Forked Felines; corrections, clarity fixes, and better explanations are all welcome.

## What belongs here

- Fixes to wrong, stale, or unclear documentation.
- Better wording, structure, or examples for existing pages.
- Broken link and typo fixes.

## What does not belong here

- **Product support.** If your order, wallet, or Feline needs help, use the in-app [support desk](https://forkedfelines.art/support), where the team can see your order. Issues here cannot.
- **Security reports.** Use the private process in [SECURITY.md](SECURITY.md), never a public issue.
- **New product facts.** Prices, supply, snapshots, and policies come from the product contract, not from pull requests. A docs PR cannot change the product.

## Making a change

1. Fork, branch, edit the Markdown under `docs/` (or `README.md`).
2. Keep the house style:
   - Facts first, in plain words. House voice is a light layer, never a replacement for an instruction.
   - No em dashes anywhere. Use a period, comma, colon, semicolon, or parentheses.
   - Sat amounts are integers with thousands separators: 8,888 sats.
   - Say "just" and "simply" never, when money or signatures are involved.
3. Run the checks locally if you can: `node site/build.mjs && node tools/check-docs.mjs`.
4. Open a pull request using the template. CI must pass: build, facts, links, no em dashes, no private terms.

## Review

Maintainers listed in [CODEOWNERS](CODEOWNERS) review every change. Factual changes are verified against the live product contract before merge. The documentation site republishes automatically from `main`.

## License and attribution

By contributing you agree your contribution is licensed under this repository's terms (see the copyright notice in the README).
