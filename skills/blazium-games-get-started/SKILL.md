---
name: blazium-games-get-started
description: Connect Cursor to the hosted Blazium Games MCP server, confirm the connection, and route to the right Blazium Games skill. Use when the user mentions Blazium Games for the first time, asks how to connect, or is unsure where to start.
license: MIT
---

# Blazium Games: Get Started

Connect to the hosted Blazium Games MCP server at `https://mcp.blazium.games/mcp`, verify the account, and hand off to the skill that matches the user's goal.

## Invoke This Skill When

- The user says "set up Blazium Games", "connect Blazium Games", or "what can the Blazium Games MCP do?"
- A Blazium Games tool call fails with an authentication error
- The user wants to publish, deploy, or monitor a game on https://blazium.games but has not said which part

## Prerequisites

- A Blazium Games account (sign up at https://blazium.games/signup)
- The `blazium-games` MCP server enabled in Cursor (this plugin ships it in `mcp.json`)

## 1. Connect

The plugin registers the server as:

```json
{
  "mcpServers": {
    "blazium-games": {
      "type": "http",
      "url": "https://mcp.blazium.games/mcp"
    }
  }
}
```

On first use Cursor opens a browser for OAuth. On the consent page the user chooses:

- **Account**: every game they own or admin, plus account tools such as `create_game` and `request_mcp_key`.
- **A single project**: only that game. Account-only tools return `403` with code `4030`.
- **A preset**: **Store page**, **CI**, **Crash triage**, **Keys**, **Money**, **Read-only**, or **Full access**. A tool outside the preset returns `4073`; a write with a read-only token returns `4031`.

For playing and buying as a player, the plugin also ships `blazium-games-player` at `https://mcp.blazium.games/player`, which has its own consent. See the `blazium-games-player` skill.

If OAuth is not possible (headless CI, remote agents), use an API key instead. See [references/auth.md](references/auth.md).

## 2. Verify

1. Call `get_profile`. A username confirms the connection.
2. Call `get_setup` to see the account, games, public URLs, and key prefixes. It never returns secrets.
3. If `get_setup` fails with `4030`, the token is bound to one project. Use `list_games` instead.

| Symptom | Cause | Fix |
|---------|-------|-----|
| `401` / auth prompt loops | Token expired or revoked | Reconnect the server in Cursor Settings > MCP |
| `403` code `4031` | Read-only token | Reconnect without "Read-only access" |
| `403` code `4030` | Project-bound token calling an account-level tool or another game | Reconnect choosing "Account" |
| `403` code `4073` | The preset doesn't cover this tool | Reconnect with a wider preset |
| `approval_required` (`4214`) | The action waits for the account owner | Ask the human to open the emailed link, then retry with the same `idempotency_key` |
| `API 404` on a game | Wrong uid or vanity name | Call `list_games` and use the `uid` |

## 3. Route

| Goal | Skill |
|------|-------|
| Create or edit a store page | `blazium-games-store-page` |
| Ship builds from CI or the CLI | `blazium-games-deploy` |
| Add crash reporting to a game | `blazium-games-crash-reporting` |
| Investigate a crash | `blazium-games-debug-crash` |
| Read visitor analytics | `blazium-games-analytics` |
| Rotate MCP or deploy keys | `blazium-games-keys` |
| Find, review, or play games as a player | `blazium-games-player` |
| Buy a game or donate | `blazium-games-purchases` |

## References

- [references/tools.md](references/tools.md): every tool, its inputs, the access it needs, and what it does
- [references/resources.md](references/resources.md): `blazium-games://` resources and templates
- [references/prompts.md](references/prompts.md): server prompts
- [references/auth.md](references/auth.md): OAuth, API keys, scopes, and project binding
- Full docs: https://blazium-games.github.io/games_docs/docs/mcp
