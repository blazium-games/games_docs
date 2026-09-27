---
name: blazium-games-keys
description: Inspect and rotate Blazium Games credentials, including MCP API keys and per-game deploy keys, with warnings before destructive rotation. Use when the user wants to rotate, revoke, list, or replace a Blazium Games key, or suspects a key leaked.
license: MIT
---

# Blazium Games: Keys

Blazium Games has two kinds of credentials:

| Credential | Used by | Rotate with | List with |
|------------|---------|-------------|-----------|
| MCP API key (`bgames_mcp_...`) | MCP clients without OAuth | `request_mcp_key` | `list_mcp_keys` |
| Deploy key (`access_token` + `secret_key`) | `blazium-cli`, CI uploads | `request_deploy_key` | `get_deploy_info` (`keys[]`) |

## Invoke This Skill When

- "Rotate my Blazium Games key", "my deploy key leaked", "list my keys"
- A CI upload fails with an authentication error after someone rotated keys

## Prerequisites

- The `blazium-games` MCP server is connected with write access
- MCP key tools need an account-level token

## Phase 1: Inspect

- MCP keys: call `list_mcp_keys`. Only prefixes are returned.
- Deploy keys: call `get_deploy_info` with the game `uid` and read `keys[]` (`uid`, `prefix`, `created_at`).

## Phase 2: Warn

Rotation is immediate and destructive:

- `request_mcp_key` invalidates **every** previous MCP API key on the account. Any client using an old key stops working. OAuth connections are not affected.
- `request_deploy_key` invalidates **every** previous deploy key for that game. Any pipeline using an old key fails its next upload.

Ask the user to confirm and to name where the new secret will be stored.

## Phase 3: Rotate

Call the matching tool. The secret is returned once. Tell the user to store it (CI secret, password manager, or a gitignored `.env`) and then stop repeating it.

## Phase 4: Update consumers

- MCP key: update the `Authorization: Bearer` header in each MCP client config.
- Deploy key: update `BLAZIUM_ACCESS_TOKEN` and `BLAZIUM_SECRET_KEY` in every CI system, for example with `gh secret set BLAZIUM_ACCESS_TOKEN`.

## Revoking OAuth access

OAuth grants and project-bound MCP keys are managed at https://blazium.games/settings/mcp and in each game's settings. Revoking there does not require rotating API keys.

## Project keys and admins

- Each owner and admin creates their own project key. Creating one replaces only your own previous key for that project.
- Removing an admin revokes their key for the project.
- The owner can turn off MCP access for admins on the project's MCP tab (website only). That revokes admins' keys and blocks their account keys and OAuth for that project.

## Docs

https://blazium-games.github.io/games_docs/docs/mcp/access-and-keys
