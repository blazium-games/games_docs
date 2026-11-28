---
title: Scriptable Functionality
sidebar_position: 1
description: Overview of Scripted API and Scripted Lobbies, when to use base scripts as-is, adapt them, or write custom Luau, and the public example repositories.
---

# Scriptable Functionality

Blazium Games lets you run sandboxed **Luau** backend and multiplayer logic for your game without hosting servers:

- **Scripted API (`sapi.blazium.online`)**: per-game HTTPS endpoints and UTC cron schedules for progression, economies, leaderboards, webhooks, and game-server bridges.
- **Scripted Lobbies (`wss://lobby.blazium.online/`)**: per-lobby room callbacks, custom actions, timers, turn control, persistent lobby stores, and asynchronous calls to and from the Scripted API.

Both runtimes share consistent Luau APIs (`data.*`, `board(...)`, `config.get`, `secrets.get`, and JSON helpers) and deploy via the [`chauffeur` CLI](../cli/commands.md) using your game's deploy key.

## Three ways to build

You do not have to write everything from scratch:

1. **Base scripts as-is**: copy the ten ready-made [Scripted API base features](./base-scripts.md) (`hub`, `daily`, `wheel`, `chests`, `quests`, `leaderboards`, `competitions`, `economy`, `lives`, `meta`) and shared `lib/` modules directly into a pack, tune values with remote config (`chauffeur sapi config set`), and ask the game owner to turn on the features you want.
2. **Adapted base scripts**: keep the `lib/` architecture (`lib.router`, `lib.guard`, `lib.state`, `lib.plan`, `lib.reward`) and guest-merge contracts, change built-in defaults, or add your own `actions["POST:custom/..."]` sub-routes alongside the standard ones.
3. **Custom scripts from scratch**: author focused Scripted API routes (`hello.luau`, `submit_score.luau`), cron jobs (`daily_reset.luau`), or a custom [Scripted Lobby pack](./scripted-lobby-scripting.md) (`blazium.json` + `.luau` callbacks) tailored to your game rules.

## Decision table

| What your game needs | Recommended path | Start here |
|---|---|---|
| Daily login streak, lucky wheel, milestone chests, rotating quests, rank meta, or lives | **Base scripts as-is** (configure via remote config) | [Base Scripts](./base-scripts.md) |
| Standard shop, gacha, or run settlement with custom recipes, crafting, or extra routes | **Adapted base scripts** (copy base + add `custom/*` actions or sibling logic) | [Base Scripts](./base-scripts.md#extending-and-customizing) |
| Score submission, webhooks, scheduled resets, custom server validation, or external HTTPS integrations | **Custom Scripted API pack** | [Scripted API Scripting](./scripted-api-scripting.md) |
| Server-authoritative lobby admission, chat filtering, lobby actions, turn timers, or room state | **Scripted Lobby pack** | [Scripted Lobby Scripting](./scripted-lobby-scripting.md) |
| Lobbies that read player currency/progress or award items & coins at match end | **Combined Scripted Lobby + Scripted API** (`sapi.call`, `sapi.read`, `lobby.call`) | [Scripted Lobby Scripting](./scripted-lobby-scripting.md#calling-the-scripted-api) |
| Ready-made JSON request/response contracts or client integration test fixtures | **Payload cookbook** | [Payloads Cookbook](./payloads.md) |
| Using Cursor, Claude Code, or Codex to generate and test packs safely | **AI authoring workflow** | [AI Authoring Guide](./ai-authoring.md) |

## Public example repositories

Both official example repositories contain copy-and-adapt Luau packs, unit test suites, payload JSON fixtures, and `AGENTS.md` authoring guides:

- **Scripted API examples**: [`github.com/blazium-games/scripted_api_examples`](https://github.com/blazium-games/scripted_api_examples) — byte-for-byte mirror of the base features in `base/`, the starter pack plus 16 focused recipes in `examples/`, `payloads/`, and `types/sapi.d.luau` for `luau-lsp`.
- **Scripted Lobby examples**: [`github.com/blazium-games/scripted_lobby_examples`](https://github.com/blazium-games/scripted_lobby_examples) — lobby pack templates (`blazium.json` + `.lua`/`.luau` callbacks), `sapi.*` / `system.http_request` / `lobby.rpc` examples, and lobby payload contracts.

## In this section

- [Base Scripts](./base-scripts.md) — every ready-made feature mapped to routes, state keys, config keys, manifests, and extension patterns.
- [Scripted API Scripting](./scripted-api-scripting.md) — logic files, `req`, response envelopes, bridges, internal-only endpoints, plan limits, testing, and publishing.
- [Scripted Lobby Scripting](./scripted-lobby-scripting.md) — `blazium.json`, lifecycle callbacks, `peer` & `lobby` APIs, data scopes, `sapi.*`, `lobby.rpc.register`, `system.http_request`, limits, and publishing.
- [Payloads Cookbook](./payloads.md) — request, response, error, and lobby action payload examples.
- [AI Authoring Guide](./ai-authoring.md) — prompts, constraints, validation loops, and MCP tool mapping for AI coding agents.

Related platform guides: [Scripted API](../scripted-api.md), [Scripted API features](../scripted-api-features.md), [Scripted API reference](../scripted-api-reference.md), [Multiplayer](../multiplayer.md), [Free, Grow, and Scale](../plans.md), and [chauffeur CLI commands](../cli/commands.md).
