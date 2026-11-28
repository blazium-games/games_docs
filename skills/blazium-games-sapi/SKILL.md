---
name: blazium-games-sapi
description: Write, test, publish, and run Scripted API Luau logic for a game at sapi.blazium.online, with stored data, leaderboards, schedules, secrets, and remote config.
license: MIT
---

# Scripted API

The Scripted API runs a game's own Luau logic at `https://sapi.blazium.online/v1/{game_uid}/{logic}`, so a game needs no server of its own for scores, rewards, inventory rules, season resets, or webhooks. Guide: https://docs.blazium.games/docs/scripted-api. Every function, header, error code, and limit: https://docs.blazium.games/docs/scripted-api-reference.

## Before you start

1. `get_sapi` shows whether it is on, the plan's limits, the active pack per release channel, and the base URL.
2. If it is off, `set_sapi` with `enabled: true` turns it on after the account owner approves. A deploy key cannot turn it on. Set `anonymous_enabled` only if logic marked `auth = "anonymous"` should run without a signed-in player, and `allowed_origins` only for web pages that call it directly.

## Write a pack

A pack is a folder of `.luau` files. Top-level files are routes (1 to 64 characters of `a-z 0-9 _ -`). Files in folders are modules loaded with `require("lib.name")`. `*.test.luau` files are tests. Each logic file returns a table:

```lua
return {
    auth = "user",                       -- anonymous | user | service | signed
    methods = { "POST" },
    uses = { "boards", "progress" },     -- boards, secrets, progress, items, http, webhook, lobby
    data = { read = { "user" }, write = { "user" } },  -- global, channel, user
    rate = { per_user = 30, window = 60 },
    handler = function(req)
        local best = math.max(data.user:get("best") or 0, req.body.score)
        data.user:set("best", best)
        board("high"):submit(req.body.score)
        return { best = best }
    end,
}
```

- Declare every data scope and `uses` entry the handler touches. Undeclared access raises `not_declared`.
- Validate input with `std.validate(req.body, schema)` and return `{ status = 400, body = ... }` on failure.
- All writes in a request apply together when the handler returns. An error discards them.
- `http` and `webhook` need `http = { allow = { "api.example.com" } }`.
- Progress writes need `scripted_api` in the achievement, stat, or event writers (`set_achievements`, `set_stats`, `set_funnels`).
- Secrets come from `secrets.get(name)` with `"secrets"` in `uses`. Never put a secret value in the pack.

## Features

Ten ready-made features (`hub`, `daily`, `wheel`, `chests`, `quests`, `leaderboards`, `competitions`, `economy`, `lives`, `meta`) answer sub-paths such as `POST /v1/{game_uid}/daily/claim`; the sub-path is `req.action`. A feature runs only after the game owner turns it on from the website. Adding files to a pack turns nothing on.

- `get_sapi_features` lists what is on, what each needs and which are sensitive. `get_sapi_feature_history` shows who changed it.
- `enable_sapi_feature` changes nothing: give the owner the link it returns. Never ask for the owner's password or try to work around it. A deploy key and an MCP key can turn a feature off (`disable_sapi_feature`, with `cascade` for features that need it), never on.
- A call to a feature that is off answers `403` `feature_disabled` (`4323`) before any script runs. Treat it as "ask the owner", not as a bug in the script.
- To edit a live pack, `get_sapi_pack_files` and `get_sapi_file` read it, `chauffeur sapi pull --dir sapi` downloads it, then test and publish again.
- A game that started before features existed keeps running every feature until the owner chooses to manage them.

## Start from the base scripts

Do not write these ten features from scratch. Copy a base script, then adapt it. They live in `base/` of the public repo https://github.com/blazium-games/scripted_api_examples, next to `base/lib/` (`router`, `guard`, `state`, `plan`, `reward`). Reference: https://docs.blazium.games/docs/scriptable/base-scripts.

- Prefer configuration to code: change the feature's config (`daily_config`, `wheel_config`, `economy_config`, and so on) with `set_sapi_config` or `chauffeur sapi config set <name> '<json>'`.
- When you do copy a script, copy `lib/` with it, keep the `CALL:merge` action so guest sign-ins still merge, and add sub-routes such as `actions["POST:custom/craft"]`. Examples: `examples/extend-base-feature`, `examples/custom-feature`.
- `CALL:*` actions are internal. They run through `api.call` inside the pack, and a public HTTP client cannot send them. Server-only routes check `guard.server(req)`.
- `lives` needs `economy`. `economy` is marked sensitive.
- The repo also has `examples/` recipes (submit a score, leaderboards, daily reset, idempotent claim, secrets and config, rate limiting, outbound HTTP, webhooks, progress, items, lobby calls), `payloads/` (envelope, headers, error codes `4300` to `4324`), and `types/sapi.d.luau` for `luau-lsp`. Its `AGENTS.md` and `llms.txt` are the authoring rules: read `AGENTS.md` before you write a pack. Use only globals and methods that appear in `types/sapi.d.luau`.
- In examples, use placeholder hosts that end in `.invalid`, never a real hostname, key, or staff route.

## Limits by plan

| Limit | Free | Grow | Scale |
|---|---|---|---|
| Third-party calls (`api.http`, `webhook.send`, `items.list`) per request | 2 | 4 | 8 |
| Third-party calls per hour | 120 | 5,000 | 50,000 |
| Third-party timeout | 3 s | 5 s | 8 s |
| Third-party response body | 64 KiB | 256 KiB | 1 MiB |
| Internal calls (`api.call`, `lobby.*`) per request | 16 | 64 | 256 |
| Internal calls per hour | 20,000 | 500,000 | 5,000,000 |

Internal calls are counted apart from third-party calls. They are only logged for now, so do not rely on that. `api.call` and `lobby.call` chains stop at 4 levels, and a chain can end with `4324` `deadline_exceeded`. Every other limit (data, rate, time, memory, schedules, boards, logs) is in https://docs.blazium.games/docs/scripted-api-reference#limits. The same third-party and internal numbers apply to lobby scripts (`system.http_request`, `sapi.call`, `sapi.read`).

## Test, then publish

Run these with the game's deploy key configured for chauffeur:

```bash
chauffeur sapi validate --dir sapi --plan free
chauffeur sapi test --dir sapi
chauffeur sapi publish --dir sapi --channel beta --activate
```

How to validate and test, in this order:

1. `validate --plan free` (or `grow`, `scale`) checks the pack against that plan's limits. Validate against the lowest plan the game must run on.
2. `test` runs every `*.test.luau` file, which returns a table of test functions. Use `t.call(target, { user, service, method, body, query })` (`method = "CALL"` for internal actions), `t.clock.set` and `t.clock.advance` for cooldowns and day rollovers, and `t.eq` and `t.ok` to assert. Use a unique player id in each test, because storage persists across tests in one run.
3. `dev` serves the pack locally, which is how you try a route before anything is published.
4. Publish to `beta` with `--activate`, call it, read `get_sapi_logs`, then promote the same checksum to `stable`.

`validate`, `test` and `dev` run the `games_sapi` binary. chauffeur finds it from `--binary`, `SAPI_BINARY`, `PATH`, or its cache, and downloads it on Linux x86_64. Add `*.test.luau` files for every recipe you copy.

`chauffeur sapi dev --dir sapi` serves the pack locally at `http://127.0.0.1:8787/v1/dev/<logic>` with token `dev-user-1` and server key `dev-service`. The emulator is a Linux binary; on Windows run chauffeur in WSL. MCP never uploads a pack.

Promote by activating the same checksum on `stable`: `activate_sapi_pack` with the checksum from `list_sapi_packs`, or `chauffeur sapi activate <checksum> --channel stable`. Over MCP this waits for the owner's approval. Roll back by activating an older checksum. An empty checksum (`none` in chauffeur) stops a channel.

## Run it

- `get_sapi_logs` (filter by `logic`, `level`, `since`/`until`, or the `request_id` from a failed call; logs are stored, and a full page returns `next_cursor` to pass as `cursor` for older lines) and `get_sapi_usage` for storage. `read_only: true` means the game is over a data limit after its plan changed: reads and deletes work, writes return `4308` until the plan is back or data is deleted.
- `get_sapi_data`, `set_sapi_data`, and `delete_sapi_data` change one key at a time. `reset_sapi_data` deletes many: pass `scope` (`global`, `channel` or `user`) and optional `channel`, `user`, `prefix`, with `dry_run` to count first, then `confirm` to delete (the owner approves). `chauffeur sapi data reset` does the same. Deleting all of a game's data is website-only.
- `set_sapi_config` sets remote config (`public: true` serves it at `/v1/{game_uid}/_config`). `set_sapi_secret` stores write-only secrets; no tool returns a value.
- `list_sapi_schedules` shows cron logic and recent runs.
- Lobby scripts have their own data store (`get_lobby_data`, `set_lobby_data`, `reset_lobby_data`, `get_lobby_config`, `list_lobby_secrets`, `get_lobby_usage`; every plan, with larger quotas on Grow and Scale). It is separate from the Scripted API's data. Lobby scripts reach the Scripted API with `sapi.read` and `sapi.call`, and Scripted API logic reaches lobby scripts with `lobby.call`, once the owner turns on the `lobby` capability.

## Calling it

- Godot: the `BlaziumSapi` node, `invoke(logic, args, opts)` (`call_logic` is an alias), with `call_completed` and `call_failed` signals. It sends a short-lived token for the game, never the login session, plus the channel and an `Idempotency-Key`, and retries `429` and `503`.
- Any HTTP client: `Authorization: Bearer <scoped token>` for `auth = "user"` (the SDK or web player requests it; a login session token is not what the Scripted API takes), `X-Sapi-Key` with a game server key (`request_server_key`) for `service`, `X-Blazium-Channel` for the channel, and `Idempotency-Key` on writes that may be retried.
- Unity (`BlaziumUnitySapi.Create()`, `Call` from a coroutine) and Unreal (`UBlaziumSapi::CallLogic`) have clients. They ask the SDK for the token (`BlaziumApi.RequestToken("sapi")`). A browser build asks `POST /blazium/token` on the play origin.
- Discord activities need the `/blazium/sapi` to `sapi.blazium.online` URL mapping.

## Errors

Codes `4300` to `4322` come from the Scripted API. The common ones: `4302` no such logic or no active pack, `4304` sign-in missing, `4307` rate limited (honor `Retry-After`), `4308` over a plan limit, `4310` script error (read the logs for that request id), `4311` time or memory budget, `4317` unknown release channel.
