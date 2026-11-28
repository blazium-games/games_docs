---
title: Scripted API Scripting
sidebar_position: 3
description: Complete authoring guide for Scripted API Luau packs — logic files, manifest fields, req, response envelopes, bridges, internal-only endpoints, plan limits, testing, and publishing.
---

# Scripted API Scripting

A **Scripted API pack** is a folder of Luau files zipped without compression and served per release channel at `https://sapi.blazium.online/v1/{game_uid}/{logic}` and `https://sapi.blazium.online/v1/{game_uid}/{logic}/{action}`.

For setup, client SDKs, and scoped token acquisition, see [Scripted API](../scripted-api.md) and [Scripted API reference](../scripted-api-reference.md).

## Pack layout

```text
my-pack/
  hello.luau          -> /v1/{game_uid}/hello
  crafting.luau       -> /v1/{game_uid}/crafting and /v1/{game_uid}/crafting/{action}
  daily_reset.luau    -> scheduled UTC cron logic
  lib/helpers.luau    -> shared module: require("lib.helpers")
  crafting.test.luau  -> test suite (excluded from HTTP serving & deployed file count)
```

- Top-level `.luau` / `.lua` filenames become route names (`1`–`64` characters of `a-z`, `0-9`, `_`, `-`).
- Subdirectory files are modules imported via `require("folder.module")` and are not reachable as HTTP routes.
- `*.test.luau` files run only under `chauffeur sapi test` and are ignored by production loaders.
- Use [`types/sapi.d.luau`](https://github.com/blazium-games/scripted_api_examples/blob/master/types/sapi.d.luau) with `luau-lsp` for editor autocompletion and static analysis.

## The manifest table

Every top-level logic file returns a manifest table checked at pack load time:

```lua
return {
    auth = "user", -- "anonymous" | "user" (default) | "service" | "signed"
    methods = { "GET", "POST" },
    uses = { "boards", "progress" },
    data = {
        read = { "global", "user" },
        write = { "user" },
    },
    rate = { per_user = 30, per_ip = 0, window = 60 },
    -- schedule = { cron = "0 0 * * *", channel = "stable" },
    -- http = { allow = { "api.example.invalid", "*.example.invalid" } },
    -- signed = { secret = "webhook_secret" },
    description = "Short description for status listings",
    handler = function(req)
        return { ok = true, data = {} }
    end,
}
```

Unknown manifest keys, unknown `uses` values, or undeclared `data` scopes fail validation before the pack can activate. Setting `data.write` implicitly grants `data.read` for that scope.

## The `req` object

Your `handler(req)` receives:

| Field | Type / contents |
|---|---|
| `req.method` | `"GET"`, `"POST"`, `"PUT"`, `"PATCH"`, `"DELETE"`, or `"CALL"` (internal `api.call` only) |
| `req.logic` | Top-level logic name (for example `"crafting"`) |
| `req.action` | Sub-path after `/{logic}/` (up to 3 lowercase segments, for example `"custom/craft"`), or `""` |
| `req.game`, `req.channel` | Game UID and active release channel (`"stable"`, `"beta"`, and so on) |
| `req.request_id`, `req.ip` | Request correlation ID and client IP string |
| `req.caller` | `"anonymous"`, `"user"`, `"service"`, `"signed"`, `"schedule"`, `"admin"`, `"platform"`, or `"test"` |
| `req.plan` | The game's plan slug (`"free"` on Free, or the tier slug for Grow and Scale) |
| `req.query`, `req.headers` | String maps (header names normalized to lowercase) |
| `req.body`, `req.raw` | Decoded JSON body (when JSON) and raw request body text (max 64 KiB) |
| `req.user` | `{ id, username, avatar_url, owns_game }` when authenticated as a player, or `nil` |

## Response envelopes

- **Plain value or table**: serialized as `200 application/json`.
- **Full reply table**: `{ status = 201, headers = { ["x-custom"] = "1" }, body = ... }` (max 256 KiB response body; string `body` is sent as `text/plain`, table `body` as JSON; allowed custom response headers only).
- **Nothing (`nil`)**: sends HTTP `204`.
- **Canonical pack envelope** (`lib.router`): `{ ok = true, data = ..., server_time = ..., state_version = ... }` on success, `{ ok = false, error = { key = "...", message = "..." } }` on handled validation/domain errors.
- **Platform errors**: status `400`–`504` with `{ ok = false, error = { code = 4300..4324, key = "...", message = "..." } }` (`4323` adds `"feature"`).

## Bridges and host libraries

- **`data.global`, `data.channel`, `data.user`**: `get`, `get_versioned`, `get_many` (up to 100 keys), `set(key, val, { ttl, sync })` (TTL up to 400 days), `delete`, `incr`, `cas`, `list`. Writes commit atomically when `handler` returns normally and roll back if an uncaught error is raised. Service and schedule callers may pass `data.user("id")` or `data.channel("beta")`.
- **`board(name, { channel? })`** *(needs `"boards"`)*: `submit`, `top`, `rank`, `around`, `count`, `reset` (schedules and service calls only).
- **`config.get(name, default)`** and **`secrets.get(name)`** *(needs `"secrets"`)*: channel-aware remote config and write-only secrets (automatically scrubbed from logs).
- **Post-commit async bridges** *(queued and sent after commit, up to 32 per request)*:
  - `progress.unlock`, `progress.stat`, `progress.event` *(needs `"progress"`, requires `scripted_api` writer enabled)*
  - `items.grant` *(needs `"items"`)*; `items.list` *(reads items synchronously)*
  - `webhook.send` *(needs `"webhook"` + `http.allow`)*
- **`api.http(req)`** *(needs `"http"` + `http.allow`)*: synchronous HTTPS-only outbound request (max 64 KiB body, no redirects, public IPs only).
- **`api.call(target, body, opts)`**: calls another logic or `"logic/action"` inside the pack up to **4** levels deep.
- **`lobby.*`** *(needs `"lobby"` capability on Grow or Scale)*: `list()`, `get(id)`, `broadcast(id, event, data)`, `send_user(user, event, data)`, `kick(id, user, { ban_seconds? })`, `set_data(id, key, val)`, `call(id, name, body)` (max 16 KiB payload per bridge message).
- **`std.*` & `log.*`**: `std.time`, `std.crypto`, `std.random`, `std.validate`, `std.ratelimit`, `std.json` / `api.json`, and `log.debug/info/warn/error` (never `os`, `debug`, `loadstring`, `getfenv`, `setfenv`, or `collectgarbage`).

See the full signatures in [Scripted API reference](../scripted-api-reference.md) and focused recipes in [`examples/`](https://github.com/blazium-games/scripted_api_examples/tree/master/examples).

## Internal-only endpoints (`CALL:` and platform callers)

Several endpoints in packs and base scripts are **internal-only and never callable from game clients**:

- **`hub/merge`** (`CALL:merge` / `POST:merge` guarded by `guard.internal`): runs when the platform merges a guest session into a signed-in account, executing `api.call("<feature>/merge", { from, to })` across features inside one atomic transaction. Player tokens get `403` `forbidden`.
- **`economy/grant` and `economy/debit`** (`CALL:grant`, `CALL:debit`): grant or debit currencies and items when called by other pack scripts (such as `daily`, `wheel`, `chests`, `quests`, `lives`, or `meta` via `lib.reward`) or internal platform/service flows. Public HTTP clients cannot send the `CALL` method and are rejected with `404 unknown_action`.
- **Other `CALL:*` actions** (`lives/grant`, `chests/add_stars`, `quests/event`, `competitions/report_match`, `meta/record`, `meta/add_points`, and per-feature `*/merge`): exclusively invoked via `api.call` inside the pack.

For custom internal helpers, either dispatch under `actions["CALL:<action>"]` with `guard.internal(req)` or set `auth = "service"` on a standalone file and check `if req.method ~= "CALL" then ... end`. See [`examples/internal-only`](https://github.com/blazium-games/scripted_api_examples/tree/master/examples/internal-only).

## Limits by plan

### Third-party outbound calls (`api.http`, `webhook.send`, `items.list`)

| Limit | Free | Grow | Scale |
|---|---|---|---|
| Outbound calls per request | 2 | 4 | 8 |
| Outbound calls per hour | 120 | 5,000 | 50,000 |
| Outbound timeout | 3 s | 5 s | 8 s |
| Outbound response body | 64 KiB | 256 KiB | 1 MiB |

### Internal calls (`api.call` and `lobby.*`)

| Limit | Free | Grow | Scale |
|---|---|---|---|
| Internal calls per request | 16 | 64 | 256 |
| Internal calls per hour | 20,000 | 500,000 | 5,000,000 |

Internal calls are counted separately from third-party outbound calls. During the current log-only period, calls exceeding the internal allowances are counted and logged without blocking normal games. Cross-service chains (`api.call` and `lobby.call` / `sapi.call`) are also bounded to a maximum nesting depth of 4 and a request deadline (`4324` `deadline_exceeded`).

All pack, storage, CPU, memory, schedule, leaderboard, and log limits are listed in [Scripted API reference → Limits](../scripted-api-reference.md#limits).

## Testing and publishing with `chauffeur sapi`

1. **Validate locally against a plan**:
   ```bash
   chauffeur sapi validate --dir my-pack --plan free
   ```
2. **Run `*.test.luau` unit tests** (`t.call`, `t.clock.set` / `t.clock.advance`, `t.eq`, `t.ok`):
   ```bash
   chauffeur sapi test --dir my-pack
   ```
3. **Run the local dev emulator** (`http://127.0.0.1:8787/v1/dev/<logic>`):
   ```bash
   chauffeur sapi dev --dir my-pack --port 8787
   ```
4. **Publish and activate** (uses your game's deploy key):
   ```bash
   chauffeur sapi publish --dir my-pack --channel beta --activate
   chauffeur sapi packs
   chauffeur sapi activate <checksum> --channel stable
   ```
5. **Inspect logs, analytics, and stored packs**:
   ```bash
   chauffeur sapi logs --channel beta --since 30m
   chauffeur sapi usage
   chauffeur sapi pull active --dir my-pack --channel stable
   ```

See [chauffeur CLI commands → Scripted API](../cli/commands.md#scripted-api).
