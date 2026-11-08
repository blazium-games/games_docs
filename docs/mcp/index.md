---
slug: /mcp
title: MCP for Blazium Games
sidebar_label: Connect
sidebar_position: 1
description: Connect Cursor, VS Code, Claude Code, or any MCP client to the hosted Blazium Games MCP server.
---

# MCP for Blazium Games

Blazium Games is a game publishing platform, with an infrastructure focus. The developer MCP server lets AI agents create and update pages for those projects, ship and promote builds, fill in press kits, link pages on other stores, read analytics, crash reports, reviews, bug tickets, and copyright notices, moderate game chat, manage game keys, set up payouts and cash out earnings, and issue deploy credentials. Version 1.23.0 has 214 developer tools and 99 player tools. A project can register sign-in applications with list_oauth_apps and the create, update, rotate, and delete tools. Buying, wallet, and library are only on the player server. A developer token that purchases or tops up gets `4034`.

No token is required to connect. Call `initialize`, then `prompts/get` for `setup_account` or `sign_in`. The prompt list, tool list, and resource list are readable with no token. A call that needs an account names that prompt, or `elevate_session` when a key already exists. Do not set Authorization and do not call the server with Python. The developer server turns developer mode on when the human has agreed to the developer terms. The player server leaves the account a player. An existing player turns developer mode on later with `enable_developer_mode` on the developer server. Builds, images, and symbol files stay on the chauffeur CLI. MCP never uploads files.

Signing in to the developer server and creating developer, project or deploy keys need [developer mode](../developer-mode.md) on your account; without it they return `4105`. The player server works for every account.

| | |
|---|---|
| Protocol | MCP 2026-07-28, Streamable HTTP |
| Endpoint | `https://mcp.blazium.games/developer` |
| Auth | No token to connect. The connection is logged in only after sign-in succeeds, or after `elevate_session`. OAuth 2.1 with PKCE still works when the client opens the consent page |

`https://mcp.blazium.games/mcp` still reaches this same server.

Manage access at [blazium.games/settings/mcp](https://blazium.games/settings/mcp).

Want an agent to buy, top up, or download games for you as a player? Use the separate [player server](./player.md) at `https://mcp.blazium.games/player`.

:::tip Using Cursor?

Install the [Blazium Games Cursor plugin](../cursor-plugin.md). It adds this server plus skills that walk the agent through store pages, deploys, and crash debugging.

:::

## Sign up and sign in

Call `initialize` with no token. `tools/list`, `prompts/list`, `prompts/get`, `resources/list`, and `resources/templates/list` are readable with no token. Then follow one prompt:

- `setup_account` for a new person. Call `create_account`, then `confirm_account` with the email code.
- `sign_in` for a person who already has an account. Call `login`, then `confirm_account` when the answer is `otp_required`.

`create_account` shows Continue or Generate only when the call has no password. Generate shows a 20-character password. `login` never offers Generate. A password already on either call skips the form. The checkbox "Do not return this password. I will copy it." keeps it out of the agent result. Do not invent a password. When `create_account` or `set_timezone` has no timezone, the person gets Enter a timezone or Use this machine. A timezone already on the call skips that form. Use this machine is the only time the agent may send the machine's IANA zone. If the account still has none after sign-in, call `set_timezone` before `create_game`.

Send `accept_legal` and `accept_developer_terms` only after the human agrees. On this server both turn developer mode on. An existing address gets the same answer and is not revealed. The connection becomes logged in only after sign-in succeeds. A wrong password, a code still required, or a rejected code leaves it logged out. `confirm_account` elevates once the code is accepted and returns this server's first `bgames_mcp_` key once. It does not return the website session. A later call does not rotate a key that already exists. A later connection calls `elevate_session`. Do not set Authorization and do not call the server with Python. An authenticator challenge, and choosing or skipping an authenticator, stay on the website.

Website signup at [blazium.games/signup](https://blazium.games/signup) still works. OAuth consent, below, still works when the client opens the website.

## Option A: OAuth, no token (recommended)

Add the server URL only. Your client discovers the authorization server, opens a Blazium Games sign-in and consent page, and completes PKCE on its own.

- [Add to Cursor](cursor://anysphere.cursor-deeplink/mcp/install?name=blazium-games&config=eyJ1cmwiOiJodHRwczovL21jcC5ibGF6aXVtLmdhbWVzL21jcCJ9)
- [Add to VS Code](vscode:mcp/install?%7B%22name%22%3A%22blazium-games%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fmcp.blazium.games%2Fmcp%22%7D)

Cursor `mcp.json`:

```json
{
  "mcpServers": {
    "blazium-games": {
      "url": "https://mcp.blazium.games/developer"
    }
  }
}
```

Claude Code:

```bash
claude mcp add --transport http blazium-games https://mcp.blazium.games/developer
```

On the consent screen you choose what the client may manage:

- **Account**: every project you own or administer.
- **A single project**: only that project. Account-level tools (profile, account, keys, setup, creating games, payments) return `403` with code `4030`.
- **What it may do**: a preset such as **Store page**, **CI**, **Crash triage**, **Keys**, **Money**, **Read-only**, or **Full access**. See [Scopes](./reference.md#scopes). Read-only write calls return `403` with code `4031`.

Access renews automatically for 30 days from when you approved it, then the client asks you to sign in again. Each renewal replaces the refresh token; if an old one is ever used again, the whole chain is revoked and the client has to ask you again.

## Option B: API key

- **Account key**: create one at [blazium.games/settings/mcp](https://blazium.games/settings/mcp). It covers every project you own or administer.
- **Your key for one project**: create one from the project's edit page, MCP tab. It only controls that project.

Cursor `mcp.json` with a key:

```json
{
  "mcpServers": {
    "blazium-games": {
      "url": "https://mcp.blazium.games/developer",
      "headers": {
        "Authorization": "Bearer bgames_mcp_YOUR_KEY"
      }
    }
  }
}
```

A pasted client config may contain `Authorization: Bearer bgames_mcp_...`. The agent does not set that header. It calls `elevate_session` with the saved key. Do not call the server with Python.

Never commit a key. Keep it in your client's config or a secret store.

## Next

- [Access and keys](./access-and-keys.md): what account and project access can do, admins, and rotation
- [OAuth and discovery](./oauth.md): OAuth details for client authors
- [Reference](./reference.md): every tool, prompt, and resource
- [Player MCP](./player.md): the player server, its scopes, and player keys
- [Versioning](./versioning.md): what can change and how much notice you get
- [Deploy builds](../deploy.md) and [Crash reporting](../crash-reporting.md)
