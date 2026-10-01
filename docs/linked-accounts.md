---
title: Linked accounts and sign-in
sidebar_position: 6
---

# Linked accounts and sign-in

You can link GitHub, X, and Discord to your Blazium Games account and then use any of them to log in.
Linking is managed at [Settings > Linked accounts](https://blazium.games/settings/connections).

## Before you start

- Signing in with GitHub, X, or Discord does not open a session by itself. You finish with your Blazium Games password and a second step.
- If that service is already linked, you enter your password. With an authenticator app set up, you enter its current code (a recovery code works once). Without one, we email a code immediately, and you can send another 30 seconds later.
- If it is not linked, and GitHub or Discord gives a verified email that already belongs to an account, you enter that account's password. A match links the service, then you do the second step. A wrong password links nothing and creates nothing.
- If it is not linked and there is no matching verified email, you choose a username, email, and password, confirm a code sent to that inbox, then set up an authenticator app or skip it and confirm another emailed code. The account and the link are created only after the inbox code matches. X does not provide an email, so that path always starts with the email you type.
- Each GitHub, X, or Discord account can be linked to only one Blazium Games account.
- Linking from Settings, while you are already signed in, only attaches the service. It does not create an account.

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
3. Enter your Blazium Games password. If the service is not linked yet and its verified email matches an account, that password links it. Otherwise you set a username, email, and password and confirm the code we email.
4. If an authenticator app is set up, enter its current code. If you skip setup, or none is recorded, enter the code we email. You can ask for another code 30 seconds after the last one.

A browser that has verified an emailed code is remembered for 30 days for email-and-password sign-in when no authenticator app is set up. It does not skip the password, an authenticator code, or the second step of a GitHub, X, or Discord sign-in. Authenticator setup, recovery codes, and what happens after sign-in are in [Account security and sign-in](./account-security.md).
A verified email from GitHub or Discord can be shown on the create form and is compared with existing accounts. It is not saved on its own, and we do not copy your name or avatar. X does not provide an email.

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

For each linked account we keep its user ID and username, so it can log in and the settings page can show which one is linked.
A verified email from GitHub or Discord is compared while you sign in and is not saved on its own. X does not provide an email.
We never store access tokens, and we do not copy your name or avatar.

The details for each service:

- [GitHub API disclosure](./legal/github-api-disclosure.md)
- [X API disclosure](./legal/x-api-disclosure.md)
- [Discord API disclosure](./legal/discord-api-disclosure.md)
- [Permissions & Scopes](./legal/permissions.md) for the exact scopes we request

Deleting your Blazium Games account unlinks all of them. See the [Privacy Policy](https://blazium.games/privacy-policy#6-deleting-your-account).

## Troubleshooting

| Message | What it means | What to do |
| --- | --- | --- |
| Confirm your password, or choose a username, email, and password | The service is not linked yet. A verified GitHub or Discord email that matches an account asks for that password. Anything else, including X, asks you to finish a new account. | Enter the matching password, or complete the new account and the emailed code. |
| This *Name* account is linked to another Blazium Games user | The account is already linked to a different Blazium Games account. | Log in to that other account and unlink it there, then try again. |
| Set a password or link another account before unlinking *Name* | It is the only way to log in to an account with no password. | Set a password in Settings, or link another account, then unlink. |
| Missing or invalid OAuth state | The link or login took longer than 15 minutes, or the page was reused or opened in another browser. | Start again from the Link or login button. |
| Could not verify the *Name* account | The other service did not confirm who you are. This is usually temporary on their side. | Try again later. If it keeps happening, email [support@blazium.games](mailto:support@blazium.games). |
| Linking was cancelled, or Sign-in was cancelled | You declined on the other service's approval screen. Nothing was linked or signed in. | Click **Link** or the login button again. |
| The provider did not return a code | The other service sent you back without finishing. | Start again from the Link or login button. |
