# Blazium Games MCP resources

Resources return JSON. `{uid}` accepts a game uid or vanity name.

## Resources

| URI | Name | Contents |
|-----|------|----------|
| `blazium-games://me` | `me` | Authenticated user (account tokens only) |
| `blazium-games://games` | `games` | Games list |
| `blazium-games://wallet` | `wallet` | Stored balance and payment rules (account tokens only). **Deprecated**: removed from this server after 2026-10-28; use the player server |
| `blazium-games://library` | `library` | Owned games and licenses (account tokens only). **Deprecated**: removed from this server after 2026-10-28; use the player server |

## Resource templates

| URI template | Name | Contents |
|--------------|------|----------|
| `blazium-games://games/{uid}` | `game` | One game page |
| `blazium-games://games/{uid}/analytics` | `game-analytics` | Visitor analytics for a game |
| `blazium-games://games/{uid}/crashes` | `game-crashes` | Crash reports for a game |
| `blazium-games://games/{uid}/deploy` | `game-deploy` | Non-secret deploy endpoints and key prefixes |
| `blazium-games://games/{uid}/builds` | `game-builds` | Uploaded builds and crash reporter build_ids |
