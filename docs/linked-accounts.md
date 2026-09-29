---
title: Linked accounts and sign-in
sidebar_position: 6
---

# Linked accounts and sign-in

You can link GitHub, X, and Discord to your Blazium Games account and then use any of them to log in.
Linking is managed at [Settings > Linked accounts](https://blazium.games/settings/connections).

## Before you start

- Linking does not create a Blazium Games account. [Create one with email](https://blazium.games/signup) first, then link.
- Each GitHub, X, or Discord account can be linked to only one Blazium Games account.
- Only a linked account can log in. We never match a GitHub, X, or Discord account to yours by email.

## Link an account

1. Log in to [blazium.games](https://blazium.games).
2. Open **Settings > Linked accounts** (also in the header menu as **Linked accounts**).
3. Click **Link** next to GitHub, X, or Discord.
4. Approve Blazium Games on the other service.
5. You return to Linked accounts with "*Name* account linked." The row now shows **Linked as @username** and the date.

A provider marked **Not available** can't be linked.

## Log in with a linked account

1. On the [Log in](https://blazium.games/login) page, or in the header when you are logged out, click **GitHub**, **X**, or **Discord**.
2. Approve Blazium Games on the other service if it asks.
3. If this browser has not verified a sign-in code before, we email you a code. Enter it to finish logging in. A browser that has verified a code is remembered for 30 days.

If your account is already set up, logging in takes you straight to where you were going. It never sends you to account setup and never pre-fills anything from GitHub, X, or Discord.
Only an account that never finished setup is asked to complete it after logging in.

## Unlink an account

1. Open **Settings > Linked accounts**.
2. Click **Unlink** next to the account.

Once unlinked, that account can no longer be used to log in.
If your Blazium Games account has no password, you cannot unlink the last linked account. Set a password or link another account first.

## Revoke access on the other service

You can remove Blazium Games from the other service at any time:

- **GitHub:** [Settings > Applications > Authorized OAuth Apps](https://github.com/settings/applications)
- **X:** [Settings > Security and account access > Apps and sessions](https://x.com/settings/connected_apps)
- **Discord:** **User Settings > Authorized Apps**

Revoking there does not unlink the account here. Unlink it at [Linked accounts](https://blazium.games/settings/connections) as well if you want to stop it logging in.

## What we store

For each linked account we keep only its user ID and username, so it can log in and the settings page can show which one is linked.
We never store access tokens, and we never store or use an email address from these services.

The details for each service:

- [GitHub API disclosure](./legal/github-api-disclosure.md)
- [X API disclosure](./legal/x-api-disclosure.md)
- [Discord API disclosure](./legal/discord-api-disclosure.md)
- [Permissions & Scopes](./legal/permissions.md) for the exact scopes we request

Deleting your Blazium Games account unlinks all of them. See the [Privacy Policy](https://blazium.games/privacy-policy#6-deleting-your-account).

## Troubleshooting

| Message | What it means | What to do |
| --- | --- | --- |
| No Blazium Games account is linked to this *Name* account. Sign in and link it under Settings > Linked accounts. | You tried to log in with an account that is not linked, or that you unlinked. | Log in with your email and password, then link the account. |
| This *Name* account is linked to another Blazium Games user | The account is already linked to a different Blazium Games account. | Log in to that other account and unlink it there, then try again. |
| Set a password or link another account before unlinking *Name* | It is the only way to log in to an account with no password. | Set a password in Settings, or link another account, then unlink. |
| Missing or invalid OAuth state | The link or login took longer than 15 minutes, or the page was reused or opened in another browser. | Start again from the Link or login button. |
| Could not verify the *Name* account | The other service did not confirm who you are. This is usually temporary on their side. | Try again later. If it keeps happening, email [support@blazium.games](mailto:support@blazium.games). |
| Linking was cancelled, or Sign-in was cancelled | You declined on the other service's approval screen. Nothing was linked or signed in. | Click **Link** or the login button again. |
| The provider did not return a code | The other service sent you back without finishing. | Start again from the Link or login button. |
