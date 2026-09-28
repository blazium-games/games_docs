---
slug: /mcp
title: MCP for Blazium Games
sidebar_label: Connect
sidebar_position: 1
description: Connect Cursor, VS Code, Claude Code, or any MCP client to the hosted Blazium Games MCP server.
---

# MCP for Blazium Games

The Blazium Games MCP server lets AI agents create and update game pages, read analytics and crash reports, list builds, and issue deploy credentials.

| | |
|---|---|
| Protocol | MCP 2026-07-28, Streamable HTTP |
| Endpoint | `https://mcp.blazium.games/mcp` |
| Auth | OAuth 2.1 with PKCE (no token needed), or an API key sent as a Bearer token |

Manage access at [blazium.games/settings/mcp](https://blazium.games/settings/mcp).

Want an agent to buy, top up, or download games for you as a player? Use the separate [player server](./player.md) at `https://mcp.blazium.games/player`.

:::tip Using Cursor?

Install the [Blazium Games Cursor plugin](../cursor-plugin.md). It adds this server plus skills that walk the agent through store pages, deploys, and crash debugging.

:::

## Option A: OAuth, no token (recommended)

Add the server URL only. Your client discovers the authorization server, opens a Blazium Games sign-in and consent page, and completes PKCE on its own.

- [Add to Cursor](cursor://anysphere.cursor-deeplink/mcp/install?name=blazium-games&config=eyJ1cmwiOiJodHRwczovL21jcC5ibGF6aXVtLmdhbWVzL21jcCJ9)
- [Add to VS Code](vscode:mcp/install?%7B%22name%22%3A%22blazium-games%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fmcp.blazium.games%2Fmcp%22%7D)

Cursor `mcp.json`:

```json
{
  "mcpServers": {
    "blazium-games": {
      "url": "https://mcp.blazium.games/mcp"
    }
  }
}
```

Claude Code:

```bash
claude mcp add --transport http blazium-games https://mcp.blazium.games/mcp
```

On the consent screen you choose what the client may manage:

- **Account**: every project you own or administer.
- **A single project**: only that project.
- **Read-only access**: the client can read but not change anything. Write tools return `403` with code `4031`.

Access renews automatically for 30 days, then the client asks you to sign in again.

## Option B: API key

- **Account key**: create one at [blazium.games/settings/mcp](https://blazium.games/settings/mcp). It covers every project you own or administer.
- **Your key for one project**: create one from the project's edit page, MCP tab. It only controls that project.

Cursor `mcp.json` with a key:

```json
{
  "mcpServers": {
    "blazium-games": {
      "url": "https://mcp.blazium.games/mcp",
      "headers": {
        "Authorization": "Bearer bgames_mcp_YOUR_KEY"
      }
    }
  }
}
```

Other clients send `Authorization: Bearer bgames_mcp_...` on every request to `https://mcp.blazium.games/mcp`.

Never commit a key. Keep it in your client's config or a secret store.

## Next

- [Access and keys](./access-and-keys.md): what account and project access can do, admins, and rotation
- [OAuth and discovery](./oauth.md): OAuth details for client authors
- [Reference](./reference.md): every tool, prompt, and resource
- [Player MCP](./player.md): the player server, its scopes, and player keys
- [Versioning](./versioning.md): what can change and how much notice you get
- [Deploy builds](../deploy.md) and [Crash reporting](../crash-reporting.md)
