# Blazium Games MCP tools

All tools call the Blazium Games API on behalf of the connected user. `uid` accepts a game uid or its vanity name. Tools marked **account** need an account-level token; tools marked **write** need the `mcp:write` scope.

| Tool | Inputs | Access | What it does |
|------|--------|--------|--------------|
| `get_profile` | none | account | Authenticated user profile |
| `get_setup` | none | account | Account, games, public URLs, and key prefixes. No secrets |
| `list_games` | none | | Games the user owns or admins, plus pending admin invites |
| `get_game` | `uid` | | One game's settings and store page fields |
| `create_game` | `name` (required), `tagline`, `description`, `visibility`, `asset_type`, `vanity_name` | account, write | Create a store page |
| `update_game` | `uid` (required), `name`, `tagline`, `description`, `visibility` | write | Update a store page |
| `get_game_analytics` | `uid` | | Visitor analytics: views, unique visitors, countries, actions |
| `list_game_crashes` | `uid` | | Recent crash reports |
| `get_crash` | `uid`, `crash_id` | | One crash with metadata, analysis, and stack availability |
| `request_crash_download` | `uid`, `crash_id`, `kind` (`dump`, `log`, or `stack`; default `dump`) | | Private download URL valid for 1 hour |
| `get_deploy_info` | `uid` | | Upload, crash, and events URLs, recent builds, env var names, deploy key prefixes. No secrets |
| `list_game_builds` | `uid` | | Up to 50 builds. Each `build_id` is the `X-Build-Id` for crash reporters |
| `get_game_build` | `uid`, `build_id` | | One build with its files and crash reporter headers |
| `list_mcp_keys` | none | account | MCP API key prefixes. Secrets are never returned |
| `request_mcp_key` | none | account, write | Issue a new MCP API key and invalidate every previous one. Returns the secret once |
| `request_deploy_key` | `uid` | write | Issue a new upload `access_token` and `secret_key` for a game and invalidate the previous ones. Returns secrets once |

## Field values

- `visibility`: `draft`, `invisible`, or `public`
- `asset_type`: `game`, `application`, `mod`, `game_asset`, or `dev_asset`
- `build_id`: the build UID (for example `004e044e-...`), not a version string

## Errors

Tool errors come back as `API <status>: <body>`. Common bodies:

| Code | Meaning |
|------|---------|
| `4010` | Not authenticated |
| `4030` | Not allowed for this game |
| `4031` | Token is read-only |
| `4006` | Build not found |
