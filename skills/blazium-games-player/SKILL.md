---
name: blazium-games-player
description: Connect an agent to a Blazium Games account as a player through the player MCP server at mcp.blazium.games/player. Checks the account and email, reads the wallet and library, explains player scopes and spending limits, and routes to purchases or downloads. Use when the user wants an agent to act for them as a player on Blazium Games, set up the player MCP server, or check what they own or can spend.
license: MIT
---

# Blazium Games: Player

The player server acts for one player. It sees the account, wallet, and library, and with `player:buy` it can top up and buy within the human's spending limit. It never touches game pages, builds, or keys; those need the developer server (`blazium-games`, see [get-started](../blazium-games-get-started/SKILL.md)).

## Invoke This Skill When

- "Connect my Blazium Games account as a player", "set up the Blazium Games player server"
- "What games do I own on Blazium Games?", "how much can this agent spend?"
- Before [purchases](../blazium-games-purchases/SKILL.md) when the player server isn't connected yet

## Phase 1: Connect

1. Check whether a `blazium-games-player` server is connected. If not, ask the human to add it:

   ```json
   { "mcpServers": { "blazium-games-player": { "url": "https://mcp.blazium.games/player" } } }
   ```

2. On the consent page the human ticks **Allow purchases** only if you should buy for them. A player key (`bgames_play_...`) from https://blazium.games/settings/mcp works too.
3. A developer key (`bgames_mcp_...`) or developer OAuth token is refused here, and a player token is refused by the developer server. Never try to reuse one for the other.

## Phase 2: Check the account

1. Call `get_account`. If `email_verified` is false, call `request_email_code`, ask the human for the code from their inbox, and call `verify_email`. Downloading and buying need a verified email.
2. Call `get_agent_policy` to see this agent's limit: `unset` (every purchase needs approval), `unlimited`, `monthly`, `yearly`, or `one_time`. Only the human changes it, on the website.
3. Call `get_wallet` for the available balance.

## Phase 3: Route

| The human wants to | Do |
|---|---|
| Buy, donate, or top up | [purchases](../blazium-games-purchases/SKILL.md) |
| See what they own | `get_library` |
| Download a game they own or a free game | Phase 5 of [purchases](../blazium-games-purchases/SKILL.md) |

## Errors

| Code | Meaning |
|------|---------|
| `4212` | The token has no `player:buy`. The human reconnects and ticks **Allow purchases**, or creates a key with purchases allowed |
| `4031` | The token is read-only |
| `4033` | That route isn't available to player tokens. Use the developer server for game management |
| `4032` | The token mixes developer and player scopes. Reconnect |

## References

- [Tools](./references/tools.md)
- https://blazium-games.github.io/games_docs/docs/mcp/player
