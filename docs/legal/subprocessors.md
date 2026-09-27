---
title: Subprocessors
sidebar_position: 4
---

:::note
Canonical version: https://blazium.games/subprocessors
:::

# Subprocessors

**Effective Date: September 26, 2026**

These are the third-party services that process data on behalf of Blazium Games.
We will update this page before adding a new subprocessor.

| Subprocessor | What it does for us | Data involved | Location |
| --- | --- | --- | --- |
| DigitalOcean | App Platform hosting, Managed PostgreSQL, Spaces object storage, and the CDN at `cdn.blazium.online`. | All account, game, analytics, and crash data; uploaded files and builds. | United States |
| GitHub | GitHub sign-in (OAuth), GitHub Actions for our CI, and GitHub Pages for this documentation. | GitHub user ID, login, name, avatar, and email during sign-in. | United States |
| Google Analytics | Site usage statistics. **Only runs if you accept analytics cookies.** | Pages visited, device and browser details, approximate location. | United States |
| Google STUN server | Part of the browser fingerprint used for visit analytics. **Only contacted if you accept analytics cookies.** | Your IP address, as seen by Google's server. | United States |
| Fontshare | Serves the Nunito web font on blazium.games. | Your IP address and browser details, as with any web request. | India / global CDN |
| Discord | Staff alerts: new crash reports (including the player's message) and mail sent to @blazium.games addresses are forwarded to a private staff channel. | Crash report details, email sender, subject, and body. | United States |

## What we run ourselves

These are not subprocessors, because we operate them on our own servers:

- **Mail server:** a self-hosted Postfix server with DKIM signing handles mail to and from @blazium.games.
- **Virus scanning:** uploaded files are scanned with ClamAV.
- **Country lookup:** we turn IP addresses into countries with a local copy of the MaxMind GeoLite2 database. No IP address is sent to MaxMind. This product includes GeoLite2 data created by MaxMind, available from [maxmind.com](https://www.maxmind.com).
- **Logs:** request and error logs are written by our own services.

## Accounts you connect are not subprocessors

If you sign in with GitHub, or link GitHub, X, or Discord at [Linked accounts](https://blazium.games/settings/connections), that service is acting for you, not for us.
What it does with your data is covered by its own privacy policy. We only receive the account's user ID and username (and, for GitHub sign-in, the details in our [GitHub API disclosure](./github-api-disclosure.md)).
See [Permissions & Scopes](./permissions.md) for the exact scopes we request from each one.

## Contact

Questions about subprocessors: [privacy@blazium.games](mailto:privacy@blazium.games).
