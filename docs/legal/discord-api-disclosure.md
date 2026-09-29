---
title: Discord API disclosure
sidebar_position: 5
---

:::note
Canonical version: https://blazium.games/discord-api-disclosure
:::

# Discord API Disclosure

**Effective Date: September 26, 2026**

Blazium Games uses the Discord API only to link Discord to your account and let you log in with it.
This page explains what we access and the commitments we make about it.

## What we access

We request the `identify` and `email` scopes. With them we make one request, to `GET /users/@me`, and read:

- your Discord user ID and username.

Discord also returns your email address, display name, and avatar with your profile. We ignore them: we do not store your Discord email or use it to find your account.
We do not request the `guilds`, `bot`, or messaging scopes.

## How we use it

- **Account linking:** when you are signed in and link Discord at [Linked accounts](https://blazium.games/settings/connections), we attach your Discord user ID to your account.
- **Sign-in:** we look for the account your Discord user ID is linked to. We never match by email, and signing in never links Discord or creates an account.
- **No pre-filling:** we do not copy your Discord name, avatar, or email into your profile or the setup form.

That is the only use. We make one Discord API request per link or sign-in and none after that.

## Our commitments

- We never store your Discord access token. It is used during sign-in or linking and then discarded.
- We never join servers for you, add a bot, or read your servers or messages.
- We never send messages on Discord for you.
- We never store or use your Discord email address.
- We never use Discord data for advertising.
- We never use Discord data to train AI or machine-learning models.
- We never sell Discord data or share it with third parties, except the [subprocessors](./subprocessors.md) that host our service.
- We only keep your Discord user ID and username, so the linked account can log in and the settings page can show which one is linked.
- We will not ask for more scopes without updating this page first.

We also use Discord for internal team communication; this never involves your Discord account.

## Revoking access and deleting data

- Unlink Discord at [Linked accounts](https://blazium.games/settings/connections). After that, Discord can no longer be used to log in to your account.
- Revoke Blazium Games at any time in Discord under **User Settings > Authorized Apps**. This does not unlink Discord here, so unlink it as well if you want to stop Discord sign-in.
- To delete your account and the Discord link, email [privacy@blazium.games](mailto:privacy@blazium.games). We process deletion requests within 30 days. See the [Privacy Policy](https://blazium.games/privacy-policy#6-deleting-your-account) for what deletion covers.

See also the [GitHub API disclosure](./github-api-disclosure.md), the [X API disclosure](./x-api-disclosure.md), [Permissions & Scopes](./permissions.md), and the [Linked accounts and sign-in](../linked-accounts.md) guide.

## Contact

Questions about this disclosure: [privacy@blazium.games](mailto:privacy@blazium.games).
