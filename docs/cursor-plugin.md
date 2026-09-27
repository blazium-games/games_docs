---
title: Cursor plugin
sidebar_position: 3
description: Install the official Blazium Games plugin for Cursor, which bundles the hosted MCP server and agent skills.
---

# Cursor plugin

The official Blazium Games plugin for Cursor teaches the agent how to use Blazium Games. It bundles:

- The hosted [Blazium Games MCP server](./mcp/index.md) at `https://mcp.blazium.games/mcp`, connected with OAuth, so no key is stored in the plugin.
- Skills that walk the agent through store pages, deploys, crash reporting, crash debugging, analytics, and key rotation.

Source: [github.com/blazium-games/games_docs](https://github.com/blazium-games/games_docs) (MIT).

## Install

1. Open **Cursor Settings > Plugins**.
2. Add `blazium-games/games_docs`.
3. Enable the **Blazium Games** plugin.
4. Ask the agent something like "Connect to Blazium Games and list my games". Cursor opens a browser for the Blazium Games sign-in and consent page the first time.

If you only want the MCP server without skills, use [Add to Cursor](cursor://anysphere.cursor-deeplink/mcp/install?name=blazium-games&config=eyJ1cmwiOiJodHRwczovL21jcC5ibGF6aXVtLmdhbWVzL21jcCJ9) instead.

## Skills

| Skill | What it does |
|-------|--------------|
| `blazium-games-get-started` | Connects the server, verifies the account, and routes to the right skill |
| `blazium-games-store-page` | Creates and edits store pages |
| `blazium-games-deploy` | Ships builds from CI or the CLI ([Deploy builds](./deploy.md)) |
| `blazium-games-crash-reporting` | Wires crash reports and events into a game ([Crash reporting](./crash-reporting.md)) |
| `blazium-games-debug-crash` | Triages crashes and maps them to your code |
| `blazium-games-analytics` | Summarizes store page traffic |
| `blazium-games-keys` | Inspects and rotates MCP and deploy keys ([Access and keys](./mcp/access-and-keys.md)) |

The skill index is [SKILL_TREE.md](https://github.com/blazium-games/games_docs/blob/master/SKILL_TREE.md).

## Using an API key instead of OAuth

For environments where a browser sign-in is not possible, override the server in your own `~/.cursor/mcp.json`:

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

Create the key at [blazium.games/settings/mcp](https://blazium.games/settings/mcp). Never commit it.

## Read-only use

Tick **Read-only access** on the consent page to let the agent read analytics, crashes, and builds without being able to change pages or rotate keys.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| The agent says the server needs authentication | Open Cursor Settings > MCP and reconnect `blazium-games` |
| `403` with code `4031` | The connection is read-only. Reconnect without **Read-only access** |
| "account-level" error | The connection is bound to one project. Reconnect and choose **Account** |
| Skills do not appear | Check the plugin is enabled in Cursor Settings > Plugins |
