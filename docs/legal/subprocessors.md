---
title: Subprocessors
sidebar_position: 6
---

:::note
Canonical version: https://blazium.games/subprocessors
:::

# Subprocessors

**Effective Date: September 30, 2026**

These are the third-party services that process data on behalf of Blazium Games.
We will update this page before adding a new subprocessor.

| Subprocessor | What it does for us | Data involved | Location |
| --- | --- | --- | --- |
| DigitalOcean | Cloud hosting, databases, file storage, and content delivery. | All account, game, analytics, and crash data; uploaded files and builds. | United States |
| GitHub | GitHub Actions for our CI, and GitHub Pages for this documentation. Signing in with GitHub is covered below. | Source code and build logs. | United States |
| Google Analytics | Site usage statistics. **Only runs if you accept analytics cookies.** | Pages visited, device and browser details, approximate location. | United States |
| Google STUN server | Part of the browser fingerprint used for visit analytics. **Only contacted if you accept analytics cookies.** | Your IP address, as seen by Google's server. | United States |
| Stripe | Card payments (Checkout), sales tax calculation (Stripe Tax), refunds, disputes, USDC payment records, and payouts to developers through Stripe Connect. | Email address, display name, an internal account ID, billing address, payment details (entered on Stripe's pages, never sent to us), purchase and top-up amounts, and for developers the identity, tax, and bank details Stripe Connect collects. For balance purchases with no billing address, your IP address is used to estimate tax. | United States |
| Coinbase (Developer Platform) | Checks and settles USDC top-ups made with x402. | The signed payment from your wallet, including your wallet address, the amount, and the network. | United States |
| Discord | Internal team communication and operational notifications. | Limited details from support messages, crash reports, and account or payment events. | United States |

## What we run ourselves

These are not subprocessors, because we operate them on our own servers:

- **Mail:** our own mail service handles mail to and from @blazium.games.
- **Virus scanning:** uploaded files are scanned with an open-source malware scanner.
- **Country lookup:** we turn IP addresses into countries with a local copy of the MaxMind GeoLite2 database. No IP address is sent to MaxMind. This product includes GeoLite2 data created by MaxMind, available from [maxmind.com](https://www.maxmind.com).
- **Logs:** request and error logs are written by our own services.
- **Fonts:** the Nunito typeface is a file we serve from blazium.games. Loading a page does not contact a font host.

## Accounts you connect are not subprocessors

When you link GitHub, X, or Discord at [Linked accounts](https://blazium.games/settings/connections), or log in with one of them, that service is acting for you, not for us.
What it does with your data is covered by its own privacy policy. We keep only the account's user ID and username. See our [GitHub API disclosure](./github-api-disclosure.md), [X API disclosure](./x-api-disclosure.md), and [Discord API disclosure](./discord-api-disclosure.md) for what each service returns.
See [Permissions & Scopes](./permissions.md) for the exact scopes we request from each one.

## Contact

Questions about subprocessors: [privacy@blazium.games](mailto:privacy@blazium.games).
