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

## GitHub sign-in

Scopes requested: `read:user` and `user:email`.

### Why we need it
- To let you sign in or sign up with your GitHub account, and to link GitHub to an existing account.
- We read your GitHub user ID, login, name, avatar, and your primary verified email address.

### What we store
- Your GitHub user ID, so we can recognize you next time.
- Your name and avatar are only used to pre-fill account setup; you can change them.
- The GitHub access token is used once during sign-in and is never stored.

### We will never
- Write to your repositories, issues, or any other GitHub data.
- Act on GitHub on your behalf.
- Ask for more scopes without updating this page first.

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
| `BG_NEXT` | Returns you to the page you came from after GitHub sign-in. | 15 minutes | No |
| `BG_SETUP` | Finishes account setup after a first GitHub sign-in. | 15 minutes | No |
| `BG_CONSENT` | Remembers your cookie banner choice. | 1 year | No |
| `_ga`, `_ga_*` | Google Analytics. | Up to 2 years (set by Google) | Yes |

Game pages also keep a visit session ID in your browser's session storage. It is cleared when you close the tab.

You can change your choice at any time with **Cookie settings** in the blazium.games footer. Declining removes the Google Analytics cookies.

## Revoking access

- **GitHub:** remove Blazium Games under [GitHub > Settings > Applications > Authorized OAuth Apps](https://github.com/settings/applications).
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
