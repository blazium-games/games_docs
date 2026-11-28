---
title: AI Authoring Guide
sidebar_position: 6
description: Instructions, prompt patterns, constraints, validation loop, AGENTS.md pointers, and MCP tools for AI coding agents authoring Scripted API and Scripted Lobby packs.
---

# AI Authoring Guide

AI coding agents (Cursor, Claude Code, Codex) work well on Blazium Scriptable packs when they verify every API against the type definitions and manifest rules, test locally, and let the game owner perform the website-only approvals.

## Authoring guides in the example repositories

Read the repository `AGENTS.md` and type definitions before writing or modifying scripts:

- **Scripted API (`games_sapi`)**: [`AGENTS.md`](https://github.com/blazium-games/scripted_api_examples/blob/master/AGENTS.md) and [`types/sapi.d.luau`](https://github.com/blazium-games/scripted_api_examples/blob/master/types/sapi.d.luau) in `blazium-games/scripted_api_examples`.
- **Scripted Lobbies (`games_slobby`)**: [`AGENTS.md`](https://github.com/blazium-games/scripted_lobby_examples/blob/master/AGENTS.md), [`types/blazium_lobby.d.luau`](https://github.com/blazium-games/scripted_lobby_examples/blob/master/types/blazium_lobby.d.luau), and [`schema/blazium.schema.json`](https://github.com/blazium-games/scripted_lobby_examples/blob/master/schema/blazium.schema.json) in `blazium-games/scripted_lobby_examples`.
- **Installed Cursor plugin skills**: `blazium-games-sapi` and `blazium-games-lobby-pack` in [Cursor plugin](../cursor-plugin.md).

## Hard constraints for agents

1. **Use Luau only**: Scripted API routes are `.luau`/`.lua` files; Scripted Lobby packs allow only `.lua`/`.luau` scripts and an optional `blazium.json` manifest (no TypeScript, Python, GDScript, or AngelScript files).
2. **Respect sandbox exclusions**: `os`, `debug`, `loadstring`, `getfenv`, `setfenv`, `collectgarbage`, and `newproxy` are removed. Use `std.time`, `std.crypto`, `std.random`, `std.validate`, `std.ratelimit`, `std.json`, and `log.*` in Scripted API, and `system.*` / `data.*` / `lobby.*` in Scripted Lobbies.
3. **Declare everything in manifests**:
   - In Scripted API logic files, declare every `uses` bridge (`boards`, `secrets`, `progress`, `items`, `http`, `webhook`, `lobby`), every `data.read` / `data.write` scope (`global`, `channel`, `user`), `http.allow` for external HTTPS hosts, and `signed.secret` for `auth = "signed"`.
   - In Scripted Lobby `blazium.json`, declare `data` (`read`/`write`), `boards`, `uses` (`config`, `secrets`, `sapi`, `http`), and `http.allow`. Do **not** rely on `name`, `version`, `plan`, or `channel` in `blazium.json` — they are ignored and supplied by the platform.
4. **Separate public vs. internal routes**: never let game clients directly award currency, items, or scores unless bounded intentionally (such as `economy/settle`). Use `auth = "service"` or `guard.server(req)` for server-authoritative routes, and `CALL:<action>` with `guard.internal(req)` for intra-pack internal routes like `hub/merge`, `economy/grant`, and `economy/debit`.
5. **Know what MCP and `chauffeur` cannot turn on**:
   - MCP never uploads packs; use `chauffeur sapi publish` and `chauffeur lobby publish` with a deploy key.
   - Turning on the Scripted API (`set_sapi` with `enabled = true`), activating a pack (`activate_sapi_pack`), and bulk data resets (`reset_sapi_data` / `reset_lobby_data` with `confirm`) wait for the **account owner's approval**.
   - Base features (`economy`, `daily`, etc.) and capabilities (`items`, `lobby`, `lobby_data`, etc.) can only be turned **on** by the game owner on the website (`enable_sapi_feature` returns the dashboard URL and prerequisites).
6. **Never hardcode secrets, keys, or real internal hosts**: read secrets via `secrets.get("name")` and use RFC 2606 `.invalid` placeholder hosts in sample configs and tests.
7. **Target public plan tiers (`Free`, `Grow`, `Scale`)**: check capacity limits (`lib.plan`, third-party HTTP limits, pack size, data operations, and room caps) before adding extra loops or calls.

## Prompt templates

### Copy and customize a base Scripted API pack

```text
Copy `base/` (`hub`, `daily`, `economy`, `lib/`) from `blazium-games/scripted_api_examples` into `./sapi/`.
Point luau-lsp at `types/sapi.d.luau`.
Update `economy` or `daily` defaults (or add a `POST:custom/...` action via `lib.router`) while preserving `CALL:merge`.
Write `*.test.luau` unit tests covering the custom route, auth rejection for non-owners, and guest merge.
Run `luau-analyze`, `chauffeur sapi validate --dir ./sapi --plan free`, and `chauffeur sapi test --dir ./sapi`.
```

### Build a Scripted Lobby pack paired with Scripted API

```text
Create a Scripted Lobby pack in `./lobby/` with `blazium.json` (`data.read`, `data.write`, `uses = ["sapi", "config"]`) and `main.luau`.
Implement `_on_lobby_created`, `_can_peer_join`, `_can_peer_action`, `on_action`, an empty `_on_lobby_tick` flush hook, and `_lobby_rpc_register` handlers (using `_lobby_get_current()`) respecting the 20 ms tick/async callback and 50 ms RPC budgets.
Call `sapi.call("economy", { action = "grant", user = peer:get_id(), body = ... }, fn)` asynchronously at match end with an `idempotency_key`.
Validate with `luau-analyze` and `blazium.schema.json`, then publish with `chauffeur lobby publish --dir ./lobby` after checking `get_lobby` and `get_sapi_features`.
```

## Validation loop

Run this loop before and after publishing:

1. **Static type & manifest checks**:
   - Scripted API: `luau-analyze` against [`types/sapi.d.luau`](https://github.com/blazium-games/scripted_api_examples/blob/master/types/sapi.d.luau).
   - Scripted Lobbies: `luau-analyze` + `luau-compile --null` and validate `blazium.json` against [`schema/blazium.schema.json`](https://github.com/blazium-games/scripted_lobby_examples/blob/master/schema/blazium.schema.json) (or `python3 scripts/validate.py` in `scripted_lobby_examples`).
2. **Local validation & tests**:
   ```bash
   chauffeur sapi validate --dir ./sapi --plan free
   chauffeur sapi test --dir ./sapi
   chauffeur sapi dev --dir ./sapi --port 8787
   ```
3. **Publish**:
   ```bash
   chauffeur sapi publish --dir ./sapi --channel beta --activate
   chauffeur lobby publish --dir ./lobby
   ```
4. **Verify live state & telemetry**: check errors, refusals, active packs, and feature switches using MCP or CLI.

## MCP tools for Scriptable Functionality

### Scripted API MCP tools

| Tool | Role |
|---|---|
| `get_sapi`, `set_sapi` | Read Scripted API status/limits/channels/active packs, or toggle `enabled`, `anonymous_enabled`, `allowed_origins` (enabling waits for owner approval) |
| `list_sapi_packs`, `activate_sapi_pack` | Inspect stored packs and activate/roll back a checksum on a channel (`activate_sapi_pack` waits for owner approval) |
| `get_sapi_pack_files`, `get_sapi_file` | Read file list and source code inside a stored pack |
| `get_sapi_features`, `get_sapi_feature_history`, `enable_sapi_feature`, `disable_sapi_feature` | Check feature/capability enablement, request owner enable link, or disable a feature |
| `get_sapi_logs`, `get_sapi_analytics`, `get_sapi_usage`, `get_sapi_audit` | Inspect runtime logs, error/cap metrics, storage usage, and change history |
| `get_sapi_config`, `set_sapi_config`, `list_sapi_secrets`, `set_sapi_secret`, `list_sapi_schedules` | Manage remote config, write-only secrets, and UTC cron schedules |
| `get_sapi_data`, `set_sapi_data`, `delete_sapi_data`, `reset_sapi_data` | Inspect, modify, or bulk-reset `global` / `channel` / `user` data (`reset_sapi_data` supports `dry_run` and requires owner approval with `confirm`) |

### Scripted Lobby MCP tools

| Tool | Role |
|---|---|
| `get_lobby`, `set_lobby` | Inspect lobby settings/active pack status or configure `enabled`, `lobby_type` (`relay`/`scripted`), and `ice_enabled` |
| `get_lobby_data`, `set_lobby_data`, `delete_lobby_data`, `reset_lobby_data` | Read, edit, or bulk-reset `global`, `channel`, `user`, or `lobby` scope data |
| `get_lobby_config`, `set_lobby_config`, `list_lobby_secrets`, `set_lobby_secret` | Manage remote config and write-only secrets for lobby scripts |
| `get_lobby_usage`, `get_lobby_analytics`, `get_lobby_audit` | Inspect lobby data storage against plan limits, cap refusals, TURN usage, and audit log |

See the full schemas and parameter list in [MCP reference](../mcp/reference.md).
