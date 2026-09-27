---
title: Permissions & Scopes
sidebar_position: 2
---

:::note
Canonical version: https://blazium.games/permissions
:::

# Permissions & Scopes

**Effective Date: September 26, 2026**

This page lists every permission Blazium Games asks for, why we need it, and what we will never do with it.
It sits alongside our [Privacy Policy](https://blazium.games/privacy-policy), [GitHub API disclosure](./github-api-disclosure.md) and [Subprocessors](./subprocessors.md).

## Linked accounts and sign-in

You can link GitHub, X, and Discord from [Linked accounts](https://blazium.games/settings/connections) and then use any of them to log in.

- Only a linked account can log in. We never match a GitHub, X, or Discord account to yours by email, and signing in never links an account for you.
- Once you unlink an account, it can no longer be used to log in.
- If your account has no password, you must keep at least one account linked.
- Linking does not create a Blazium Games account. Create one with email first.
- After a linked account proves who you are, we still email you a sign-in code unless you have already verified that browser.
- If your account is already set up, signing in never sends you to account setup and never pre-fills anything from GitHub, X, or Discord.

## GitHub

Scopes requested: `read:user` and `user:email`.

### Why we need it
- To link GitHub to your account and let you log in with it.
- We read your GitHub user ID, login, and your primary verified email address. GitHub must report a verified email or sign-in and linking stop; we do not store the email or use it to find your account.

### What we store
- Your GitHub user ID and login, so we can recognize the linked account and show which one is linked.
- The GitHub access token is used once during sign-in or linking and is never stored.

### We will never
- Write to your repositories, issues, or any other GitHub data.
- Act on GitHub on your behalf.
- Ask for more scopes without updating this page first.

## X

Scopes requested: `users.read` and `tweet.read`. X requires `tweet.read` alongside `users.read` to read your profile; we do not read your posts.

### What we store
- Your X user ID and username. Nothing else.
- The X access token is used once during sign-in or linking and is never stored. We do not request offline access, so we get no refresh token.

### We will never
- Post, like, repost, follow, or send messages on X for you.
- Read your posts, timeline, or direct messages.

## Discord

Scopes requested: `identify` and `email`.

### What we store
- Your Discord user ID and username. Nothing else.
- Discord returns your email address with the `email` scope. We read it but do not store it or use it to find your account.
- The Discord access token is used once during sign-in or linking and is never stored.

### We will never
- Join servers, read your servers or messages, or send messages for you.

## MCP access (OAuth)

AI tools such as Cursor, VS Code, and Claude Code connect to the Blazium Games MCP server at `https://mcp.blazium.games/mcp`.
When you approve a tool, it gets a token with one or both of these scopes:

| Scope | Allows |
| --- | --- |
| `mcp:read` | Reading your games, builds, analytics, crash reports, and setup details. |
| `mcp:write` | Creating and updating game pages and issuing deploy keys, in addition to everything `mcp:read` allows. |

### Why we need it
- So your AI tool can manage your store pages and read your game's data without you pasting passwords.

### How it is limited
- The consent screen has a **Read-only access** option. Tick it and the tool only gets `mcp:read`; any attempt to change data is refused.
- A token is either for your whole account or for a single game (project). A project token is refused for any other game.
- Access tokens last 1 hour. Refresh tokens last 30 days, each refresh issues a new one, and they stop working if your account is deleted.
- Every request made with an MCP key or token is recorded in an audit log (key, game, method, and path).

### We will never
- Accept a read-only token for a change.
- Share your keys or tokens with third parties.

## Keys

- **MCP keys** (account keys and project keys) are shown once when you create them and are stored only as a hash. You can rotate them at [blazium.games/settings/mcp](https://blazium.games/settings/mcp) or on a game's MCP tab; rotating invalidates the previous key.
- **Deploy keys** let blazium-cli or CI upload builds for one game. Issuing a new deploy key invalidates the previous one.

## Cookies

Sign-in cookies are always on because the site does not work without them. Analytics cookies are only set if you accept them in the cookie banner.

| Cookie | Purpose | Lifetime | Needs consent |
| --- | --- | --- | --- |
| `BG_T` | Your signed-in session. | 7 days | No |
| `BG_UD` | Your display name, username, and avatar for the header. | 7 days | No |
| `BG_DEV` | Remembers a browser that verified an emailed sign-in code. Survives logout. | 30 days | No |
| `BG_NEXT` | Returns you to the page you came from after logging in with GitHub, X, or Discord. | 15 minutes | No |
| `BG_SETUP` | Finishes setup for an account that never completed it, after logging in with a linked account. | 15 minutes | No |
| `BG_CONSENT` | Remembers your cookie banner choice. | 1 year | No |
| `_ga`, `_ga_*` | Google Analytics. | Up to 2 years (set by Google) | Yes |

Game pages also keep a visit session ID in your browser's session storage. It is cleared when you close the tab.

You can change your choice at any time with **Cookie settings** in the blazium.games footer. Declining removes the Google Analytics cookies.

## Revoking access

- **Linked accounts:** unlink GitHub, X, or Discord at [blazium.games/settings/connections](https://blazium.games/settings/connections). An unlinked account can no longer log in. If you have no password, the last linked account cannot be removed until you set one or link another.
- Removing Blazium Games in the other service's settings does not unlink it here. Unlink it at [blazium.games/settings/connections](https://blazium.games/settings/connections) to stop it logging in.
- **GitHub:** remove Blazium Games under [GitHub > Settings > Applications > Authorized OAuth Apps](https://github.com/settings/applications).
- **X:** remove Blazium Games under [X > Settings > Security and account access > Apps and sessions](https://x.com/settings/connected_apps).
- **Discord:** remove Blazium Games under Discord **User Settings > Authorized Apps**.
- **MCP keys and tokens:** rotate keys at [blazium.games/settings/mcp](https://blazium.games/settings/mcp). OAuth access tokens expire after 1 hour and refresh tokens after 30 days; all of them stop working when your account is deleted.
- **Everything:** email [privacy@blazium.games](mailto:privacy@blazium.games) to delete your account. See the [Privacy Policy](https://blazium.games/privacy-policy#6-deleting-your-account).

## For developers: how scopes behave

These are the responses your MCP client, script, or CI job will see.

| Situation | HTTP status | Error code | Message |
| --- | --- | --- | --- |
| A token without `mcp:write` makes anything other than a `GET` or `HEAD` request (for example `create_game`, `update_game`, `request_deploy_key`, `request_mcp_key`) | 403 | 4031 | This token is read-only |
| A project token is used for a different game | 403 | 4030 | This token is limited to one project |
| The game's owner turned off MCP access for admins, and an admin's token is used on it | 403 | 4080 | The project owner has turned off MCP access for admins |
| The token expired, or the account was deleted | 401 | 4003 or 4007 | Invalid or expired authentication token, or User account not found |

- Account MCP keys and website sessions carry both scopes. OAuth tokens carry what the user approved.
- The MCP tools that only read (`get_game`, `list_games`, `get_game_analytics`, `list_game_crashes`, `get_deploy_info`, and so on) work with a read-only token.
- `request_mcp_key` and `list_mcp_keys` need an account-level token, not a project token.

### Deploy keys

- A deploy key is an `access_token` and `secret_key` pair for one game. blazium-cli reads them from `BLAZIUM_ACCESS_TOKEN` and `BLAZIUM_SECRET_KEY`.
- `request_deploy_key` returns the secret once and invalidates every previous deploy key for that game, so update your CI secrets right away.
- Deploy keys can only register builds, upload build files, and upload build images. They cannot edit the store page text or settings, and they cannot read analytics or crash reports.
- See [Deploy builds](../deploy.md) and [Access and keys](../mcp/access-and-keys.md).
