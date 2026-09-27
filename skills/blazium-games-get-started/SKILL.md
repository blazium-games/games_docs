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

- A Blazium Games account (sign up at https://blazium.games/register)
- The `blazium-games` MCP server enabled in Cursor (this plugin ships it in `mcp.json`)

## Phase 1: Connect

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
- **A single project**: only that game. Account-only tools return an error.
- **Read-only access** (checkbox): the token can only read. Write tools return `403` with code `4031`.

If OAuth is not possible (headless CI, remote agents), use an API key instead. See [references/auth.md](references/auth.md).

## Phase 2: Verify

1. Call `get_profile`. A username confirms the connection.
2. Call `get_setup` to see the account, games, public URLs, and key prefixes. It never returns secrets.
3. If `get_setup` fails with "account-level", the token is bound to one project. Use `list_games` instead.

| Symptom | Cause | Fix |
|---------|-------|-----|
| `401` / auth prompt loops | Token expired or revoked | Reconnect the server in Cursor Settings > MCP |
| `403` code `4031` | Read-only token | Reconnect without "Read-only access" |
| "account-level" error | Project-bound token | Reconnect choosing "Account" |
| `API 404` on a game | Wrong uid or vanity name | Call `list_games` and use the `uid` |

## Phase 3: Route

| Goal | Skill |
|------|-------|
| Create or edit a store page | `blazium-games-store-page` |
| Ship builds from CI or the CLI | `blazium-games-deploy` |
| Add crash reporting to a game | `blazium-games-crash-reporting` |
| Investigate a crash | `blazium-games-debug-crash` |
| Read visitor analytics | `blazium-games-analytics` |
| Rotate MCP or deploy keys | `blazium-games-keys` |

## References

- [references/tools.md](references/tools.md): every tool, its inputs, and the API it calls
- [references/resources.md](references/resources.md): `blazium-games://` resources and templates
- [references/prompts.md](references/prompts.md): server prompts
- [references/auth.md](references/auth.md): OAuth, API keys, scopes, and project binding
- Full docs: https://blazium-games.github.io/games_docs/docs/mcp
