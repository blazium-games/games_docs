---
title: GitHub API disclosure
sidebar_position: 3
---

:::note
Canonical version: https://blazium.games/github-api-disclosure
:::

# GitHub API Disclosure

**Effective Date: September 26, 2026**

Blazium Games uses the GitHub API only to link GitHub to your account and let you log in with it.
This page explains what we access and the commitments we make about it.

## What we access

We request the `read:user` and `user:email` scopes. With them we read:

- your GitHub user ID and login;
- your primary verified email address, to confirm GitHub has verified it.

GitHub also returns your name and avatar with your profile. We ignore them.

## How we use it

- **Account linking:** when you are signed in and link GitHub at [Linked accounts](https://blazium.games/settings/connections), we attach your GitHub user ID to your account.
- **Sign-in:** we look for the account your GitHub user ID is linked to. We never match by email, and signing in never links GitHub or creates an account.
- **No pre-filling:** we do not copy your GitHub name, avatar, or email into your profile or the setup form.

That is the only use. We do not call the GitHub API again after sign-in or linking.

## Our commitments

- We never store your GitHub access token. It is used during sign-in and then discarded.
- We never write to your repositories or act on GitHub for you.
- We never use GitHub data for advertising.
- We never use GitHub data to train AI or machine-learning models.
- We never sell GitHub data or share it with third parties, except the [subprocessors](./subprocessors.md) that host our service.
- We only keep your GitHub user ID and login, so the linked account can log in and the settings page can show which one is linked.

## Revoking access and deleting data

- Unlink GitHub at [Linked accounts](https://blazium.games/settings/connections). After that, GitHub can no longer be used to log in to your account.
- Revoke Blazium Games at any time under [GitHub > Settings > Applications > Authorized OAuth Apps](https://github.com/settings/applications). This does not unlink GitHub here, so unlink it as well if you want to stop GitHub sign-in.
- To delete your account and the GitHub link, email [privacy@blazium.games](mailto:privacy@blazium.games). We process deletion requests within 30 days. See the [Privacy Policy](https://blazium.games/privacy-policy#6-deleting-your-account) for what deletion covers.

See also the [X API disclosure](./x-api-disclosure.md), the [Discord API disclosure](./discord-api-disclosure.md), [Permissions & Scopes](./permissions.md), and the [Linked accounts and sign-in](../linked-accounts.md) guide.

## Contact

Questions about this disclosure: [privacy@blazium.games](mailto:privacy@blazium.games).
