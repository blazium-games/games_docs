---
title: GitHub API disclosure
sidebar_position: 3
---

:::note
Canonical version: https://blazium.games/github-api-disclosure
:::

# GitHub API Disclosure

**Effective Date: September 26, 2026**

Blazium Games uses the GitHub API only to let you sign in with GitHub and link GitHub to your account.
This page explains what we access and the commitments we make about it.

## What we access

We request the `read:user` and `user:email` scopes. With them we read:

- your GitHub user ID and login;
- your name and avatar;
- your primary verified email address.

## How we use it

- **Sign-in and sign-up:** we match your GitHub user ID to a Blazium Games account, or start setting up a new one.
- **Account linking:** if you are already signed in, we attach your GitHub user ID to your account.
- **Account setup:** your name and avatar pre-fill the setup form. You can change them.

That is the only use. We do not call the GitHub API again after sign-in.

## Our commitments

- We never store your GitHub access token. It is used during sign-in and then discarded.
- We never write to your repositories or act on GitHub for you.
- We never use GitHub data for advertising.
- We never use GitHub data to train AI or machine-learning models.
- We never sell GitHub data or share it with third parties, except the [subprocessors](./subprocessors.md) that host our service.
- We only keep your GitHub user ID, so you can sign in again.

## Revoking access and deleting data

- Revoke Blazium Games at any time under [GitHub > Settings > Applications > Authorized OAuth Apps](https://github.com/settings/applications). Your Blazium Games account keeps working with email sign-in.
- To delete your account and the GitHub link, email [privacy@blazium.games](mailto:privacy@blazium.games). We process deletion requests within 30 days. See the [Privacy Policy](https://blazium.games/privacy-policy#6-deleting-your-account) for what deletion covers.

## Contact

Questions about this disclosure: [privacy@blazium.games](mailto:privacy@blazium.games).
