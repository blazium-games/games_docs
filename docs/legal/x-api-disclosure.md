---
title: X API disclosure
sidebar_position: 4
---

:::note
Canonical version: https://blazium.games/x-api-disclosure
:::

# X API Disclosure

**Effective Date: September 30, 2026**

Blazium Games uses the X API only to link X to your account and let you log in with it.
This page explains what we access and the commitments we make about it.

## What we access

We request the `users.read` and `tweet.read` scopes. X requires `tweet.read` alongside `users.read` to read your profile; we do not read your posts.
With them we make one request, to `GET /2/users/me`, and read:

- your X user ID and username.

X also returns your display name with your profile. We ignore it.
We do not request `offline.access`, so X gives us no refresh token.

## How we use it

- **Account linking:** when you are signed in and link X at [Linked accounts](https://blazium.games/settings/connections), we attach your X user ID to your account.
- **Sign-in:** we look for the account your X user ID is linked to. If it is linked, you confirm your password and then an authenticator code or an emailed code. X does not provide an email, so a new sign-in asks you to choose a username, email, and password and confirm that inbox before the account is created and X is linked.
- **No pre-filling:** we do not copy your X name, username, or avatar. You type the email yourself.

That is the only use. We make one X API request per link or sign-in and none after that.

## Our commitments

- We never store your X access token. It is used during sign-in or linking and then discarded.
- We never post, like, repost, follow, or send direct messages on X for you.
- We never read your posts, timeline, bookmarks, or direct messages.
- We never use X data for advertising.
- We never use X data to train AI or machine-learning models.
- We never sell X data or share it with third parties, except the [subprocessors](./subprocessors.md) that host our service.
- We only keep your X user ID and username, so the linked account can log in and the settings page can show which one is linked.
- We will not ask for more scopes without updating this page first.

## Revoking access and deleting data

- Unlink X at [Linked accounts](https://blazium.games/settings/connections). After that, X can no longer be used to log in to your account.
- Revoke Blazium Games at any time under [X > Settings > Security and account access > Apps and sessions](https://x.com/settings/connected_apps). This does not unlink X here, so unlink it as well if you want to stop X sign-in.
- To delete your account and the X link, email [privacy@blazium.games](mailto:privacy@blazium.games). We process deletion requests within 30 days. See the [Privacy Policy](https://blazium.games/privacy-policy#6-deleting-your-account) for what deletion covers.

See also the [GitHub API disclosure](./github-api-disclosure.md), the [Discord API disclosure](./discord-api-disclosure.md), [Permissions & Scopes](./permissions.md), and the [Linked accounts and sign-in](../linked-accounts.md) guide.

## Contact

Questions about this disclosure: [privacy@blazium.games](mailto:privacy@blazium.games).
