---
title: Scripted Lobby Scripting
sidebar_position: 4
description: Complete authoring reference for Scripted Lobby Luau packs — blazium.json, lobby callbacks, peer/lobby objects, data scopes, sapi.call/sapi.read, lobby.rpc.register, host APIs, system.http_request, limits, and publishing.
---

# Scripted Lobby Scripting

A **Scripted Lobby pack** runs sandboxed **Luau** inside `wss://lobby.blazium.online/` for each lobby room of your game. Packs are Luau-only (`.lua` and `.luau` files plus an optional `blazium.json` manifest packed into an uncompressed ZIP; other script languages or file types are rejected).

For general multiplayer setup, TURN/STUN, and client socket connection details, see [Multiplayer](../multiplayer.md).

## `blazium.json` manifest

Place an optional `blazium.json` (up to `16 KiB`) at the root of your lobby pack to declare persistent data scopes, leaderboards, optional capabilities, and allowed outbound HTTPS hosts:

```json
{
  "data": {
    "read": ["global", "channel", "user", "lobby"],
    "write": ["user", "lobby"]
  },
  "boards": ["ranked_duel"],
  "uses": ["config", "secrets", "sapi", "http"],
  "http": {
    "allow": ["api.example.invalid", "*.example.invalid"]
  }
}
```

| Field | Rules |
|---|---|
| `data` | `{ "read": [...], "write": [...] }`. Allowed scopes: `game` (alias for `global`), `global`, `channel`, `user`, `lobby`. `write` grants write access; declare every scope you read in `read` and every scope you write in `write`. |
| `boards` | List of up to `16` leaderboard names (`1`–`64` chars each). |
| `uses` | Any subset of `"config"`, `"secrets"`, `"sapi"`, `"http"`. |
| `http` | `{ "allow": [...] }` with up to `32` hostnames (`api.example.invalid` or `*.example.invalid`, no scheme, port, path, or userinfo). Required whenever `"http"` is listed in `uses`. |

:::note What `blazium.json` does **not** control
`name`, `version`, `plan`, and `channel` are **not** read from `blazium.json`. A lobby's plan and release channel are supplied only by the signed server load request when the lobby starts, so a pack cannot raise its own limits or switch channels.
:::

## Lifecycle and action callbacks

Define global functions in your lobby pack scripts for the callbacks your game handles:

| Callback | Arguments | Behavior & return contract |
|---|---|---|
| `_on_lobby_created` | `(peer, lobby)` | Runs when a player creates a lobby. Return `false` or `{ error = "..." }` to reject creation (`CREATE_REJECTED`). A script error rejects. |
| `_can_peer_join` | `(peer, lobby)` | Runs before admitting a joining player. Return `true` or `nil` to allow; `false` or `{ error = "..." }` rejects (`JOIN_REJECTED`). A script error rejects. |
| `_on_peer_joined` | `(peer, lobby)` | Runs after a peer joins a lobby. |
| `_on_peer_leave` | `(peer, lobby)` | Runs after a peer leaves or disconnects (already removed from `lobby:get_members()`). |
| `_on_host_changed` | `(peer, lobby)` | Runs after `_on_peer_leave` when host transfers (`peer` is the new host; not called when the lobby closes). |
| `_on_lobby_tick` | `(lobby, dt_ms)` | Runs for every scripted lobby on every server tick (`20 ms` execution budget). Also flushes queued broadcasts. |
| `_can_peer_chat` | `(peer, lobby, msg, meta)` | Runs before broadcasting chat (`msg` up to `256` bytes; `meta` JSON up to `2,048` bytes, nested values arrive as `nil`). Only `true` allows (`false`/`nil`/non-boolean rejects with `CHAT_REJECTED`; script errors fail open). |
| `_can_peer_action` | `(peer, lobby, action_id)` | Pre-check before `on_action`. Return `true` to approve, `false`/`nil` to reject (`ACTION_NOT_ALLOWED`), or `{ error, code? }` to return that error. When omitted, only built-in engine ids (`move`, `attack`, `use_item`) continue. |
| `on_action` | `(peer, lobby, args)` | Handles a client `game_action` (`args = { action_id = "...", params = { ... } }`; runs only while lobby state is `in_game`, except `start_game`). Nested objects/arrays in `args.params` arrive as JSON strings (decode with `system.decode_json`). Return a JSON-serializable table or `{ error = "...", code? = "..." }`. |
| `_on_backend_result` | `(body)` | Receives backend result body string (`20 ms` budget). |
| Timer callbacks | `(args)` | Named by `lobby:start_timer(fn_name, delay_sec)`; receives `{ lobby_id = "..." }` with no calling player (`_lobby_get_current()` retrieves the lobby). |

## `peer` and `lobby` objects

### `peer` (`User`)

- `peer:get_id()` — returns the peer's user ID string.
- `peer:get_data(key)` — reads a value from the peer's per-callback handle (`nil` if absent).
- `peer:set_data(key, value)` — stores or deletes (`nil`) a JSON value on the peer handle (`32` keys, `2 KiB` per value, `8 KiB` total; rebuilt each callback, so persist cross-callback player state in `data.user` or `lobby:set_data`).

### `lobby` (`Lobby`)

You receive `lobby` as a callback argument, or retrieve it inside timer and RPC callbacks via `_lobby_get_current()` (note: the server's `lobby` compatibility module is not loaded into user lobby packs).

| Method | Purpose |
|---|---|
| `lobby:broadcast(event, data?)` | Queues a JSON event broadcast to all peers in the lobby. |
| `lobby:set_state(state)` | Sets `"in_lobby"` or `"in_game"` and broadcasts `"state_changed"`. |
| `lobby:get_members()` | Returns an array of connected `peer_id` strings. |
| `lobby:kick(peer_id, reason?)` | Kicks a peer from the lobby. |
| `lobby:ban(peer_id, reason?, duration_sec?)` | Bans a peer (indefinitely if `duration_sec <= 0` or omitted) and kicks them if present. |
| `lobby:is_banned(peer_id)` | Returns `true` if `peer_id` has an active ban in this lobby. |
| `lobby:set_turn_order(peer_ids)` | Sets turn order to an array of connected peer IDs (`turn_owner = peer_ids[1]`). |
| `lobby:rotate_turn_to(peer_id)` | Moves turn ownership to `peer_id` if present in `turn_order`. |
| `lobby:skip_turn(peer_id?)` / `lobby:end_turn()` | Advances to the next turn (`skip_turn(peer_id)` checks current `turn_owner`). |
| `lobby:get_data(key)` / `lobby:set_data(key, value)` | Reads or sets public lobby metadata visible in listings and diffs (`32` keys, `2 KiB` value, `8 KiB` total). |
| `lobby:set_max_players(n)` | Adjusts max players between current peer count and the game's plan cap; broadcasts `"max_players_changed"`. |
| `lobby:start_timer(fn_name, delay_sec)` | Schedules a one-shot global function `fn_name({ lobby_id = ... })` (`0` to `24` hours; up to `32` pending timers per lobby). |
| `lobby:unlock_achievement(peer, slug)` | Unlocks an achievement for a lobby member (written as `scripted_lobby`). |
| `lobby:set_stat(peer, slug, value)` | Sets an integer stat for a lobby member (`scripted_lobby` writer). |
| `lobby:record_event(peer, name, fields?)` | Records a funnel event (fields JSON up to `4 KiB`). |
| `lobby:analytics(name, build?)` | Queries funnel event analytics for the game. |
| `lobby:set_presence(peer, status)` | Queues a rich presence update (`<= 40` runes) for a lobby member (up to `64` notices per flush). |

## Persistent data scopes, boards, config, and secrets

When the `lobby_data` capability is enabled for the game and declared in `blazium.json`, lobby callbacks can use the same persistent store APIs as Scripted API logic (stored separately from Scripted API data):

- **`data.global`** (alias **`data.game`**): game-wide keys across all channels and lobbies.
- **`data.channel`**: keys isolated to the game's active release channel for that lobby.
- **`data.user`** / **`data.user(peer_id)`**: per-player keys, restricted to peers currently in the lobby.
- **`data.lobby`**: keys scoped to the current lobby room; automatically expires **24 hours** (`86,400` seconds) after the last write (shorter explicit `ttl` values are honored; longer `ttl` values are capped at 24 hours).

Every scope exposes `get(key)`, `get_versioned(key)`, `get_many(keys)` (max 100), `set(key, value, { ttl?, sync? })` (other scopes allow `ttl` up to 400 days), `delete(key)`, `incr(key, delta?)`, `cas(key, version, value)`, and `list({ prefix?, after?, limit? })`. All writes in a callback commit atomically when the callback returns cleanly, and are discarded if the script raises an error.

- **`board(name)`**: `submit`, `top`, `rank`, `around`, `count`, `reset` (declare `name` in `blazium.json`'s `boards`).
- **`config.get(name, default)`** (`"config"` in `uses`): reads lobby remote config.
- **`secrets.get(name)`** (`"secrets"` in `uses`): reads write-only lobby secrets.

## Calling the Scripted API

Declare `"sapi"` in `uses` in `blazium.json` (requires the `lobby` capability):

```lua
-- Run a Scripted API logic asynchronously
sapi.call("economy", {
    action = "grant",
    user = peer:get_id(),
    body = { currency = "coins", amount = 50 },
    idempotency_key = "match_" .. match_id .. "_" .. peer:get_id(),
}, function(res)
    if res.ok then
        lobby:broadcast("reward_granted", { user = peer:get_id(), body = res.body })
    end
end)

-- Read a single Scripted API key directly (global, channel, or user)
sapi.read("user", "econ:state", peer:get_id(), function(res)
    if res.ok and res.found then
        -- res.value, res.version
    end
end)
```

- `sapi.call(logic, opts, fn)` (`opts`: `{ action?, body?, user?, idempotency_key? }`, body up to `64 KiB`, `user` must be a lobby member). Always issues a `POST` to `/{logic}/{action}`, so GET-only base actions such as `hub/bootstrap`, `daily/status`, and `wheel/status` return `unknown_action`.
- `sapi.read(scope, key, [user_id,] fn)` (`scope`: `"global"`, `"channel"`, or `"user"`).
- Both run asynchronously off the game thread; `fn(res)` runs back on the game thread with a `20 ms` budget and no calling player, receiving `{ ok, status, error?, body?, found?, value?, version?, code? }`. Broadcasts queued inside async callbacks, timers, or RPC handlers flush on the next lobby callback or `_on_lobby_tick` (defining an empty `function _on_lobby_tick(lobby, dt_ms) end` flushes them on the next tick). Call chains across Scripted API and Scripted Lobbies stop after **4** hops.

## Answering `lobby.call` with `_lobby_rpc_register` (`lobby.rpc.register`)

A Scripted API script (with `"lobby"` in `uses`) can invoke a handler inside a live lobby via `lobby.call(lobby_id, name, body)`. In a user lobby pack, register handlers at load time using the global `_lobby_rpc_register(name, fn)` (which the server's global `lobby` helper wraps as `lobby.rpc.register`):

```lua
_lobby_rpc_register("grant_match_reward", function(body)
    local current = _lobby_get_current()
    if current == nil then
        error({ code = "no_lobby", message = "no lobby context" })
    end
    current:broadcast("rpc_notice", body)
    return { acknowledged = true }
end)
```

- Up to `64` RPC names per lobby pack (`1`–`64` chars of `a-z`, `0-9`, `_`, `-`).
- `fn(body)` receives the JSON body table, runs on the game thread with a **`50 ms`** budget, and returns a JSON-serializable value (or raises `{ code, message }` via `error(...)`; an unknown RPC returns HTTP `404` `unknown_rpc`).

## Host `system` APIs

| Function | Meaning |
|---|---|
| `system.get_time_since_epoch()` | Current Unix timestamp in **milliseconds**. |
| `system.encode_json(value)` | Serializes a Lua table or primitive to a JSON string. |
| `system.decode_json(json_str)` | Parses a JSON string into a Lua value. |
| `system.http_request(req_or_url, fn)` | Asynchronous outbound HTTPS request (details below). |

## `system.http_request`

Declare `"http"` in `uses` and list allowed target hosts in `http.allow` inside `blazium.json`.

### Request shape

Pass either an HTTPS URL string or a table:

```lua
system.http_request({
    url = "https://api.example.invalid/match",
    method = "POST", -- GET (default), POST, PUT, PATCH, DELETE
    headers = {
        ["Authorization"] = "Bearer " .. secrets.get("api_token"),
        ["X-Match"] = match_id,
    },
    body = { winner = peer:get_id() }, -- string or JSON-serializable table (auto-sets Content-Type)
    timeout_ms = 2500,                 -- clamped to plan outbound timeout
}, function(res)
    if res.ok then
        -- res.status, res.body, res.headers, res.json (when Content-Type is JSON)
    else
        -- res.error (network/validation failure) or non-2xx res.status
    end
end)
```

- **HTTPS only**, **no redirects**, **public IP addresses only** (loopback, private, and link-local destinations are blocked).
- **Body limit**: up to `64 KiB`.
- **Allowed request headers** (up to `32` headers, `2,048` bytes per header value): `Accept`, `Accept-Language`, `Authorization`, `Cache-Control`, `Content-Type`, `Idempotency-Key`, `If-*`, and `X-*` (except reserved `X-Blazium*`, `X-Forwarded*`, `X-Real-Ip`).
- **Async callback shape** (`20 ms` budget): `{ ok, status, body, headers, error?, message?, json? }`.

### Error codes

- **Synchronous errors raised at call time**: `http_disabled`, `not_declared`, `not_available`, `feature_disabled`, `over_plan_limit`, `rate_limited`, `busy` (exceeded `128` queued requests globally or `8` in-flight for the lobby), `bad_value`.
- **Asynchronous `res.error` strings passed to `fn(res)`**:

| `res.error` | Cause |
|---|---|
| `bad_url` | Invalid or non-HTTPS URL. |
| `dns_failed` | Hostname failed DNS resolution. |
| `blocked_address` | Host resolved to a private, loopback, or reserved IP. |
| `timeout` | Outbound call exceeded the plan's timeout. |
| `too_large` | Response body exceeded the plan's max response size. |
| `redirect` | Target responded with an HTTP redirect (redirects are disabled). |
| `tls_failed` | TLS certificate or handshake validation failed. |
| `unavailable` | Network or connection failure reaching the remote server. |

A non-2xx HTTP response sets `res.ok = false` with the numeric `res.status` and no `res.error`.

## Limits

### Room, runtime, and execution limits

- **Room capacity**: see [Lobby limits](../plans.md#lobby-limits) (`Free`: 32 lobbies, 4 players/lobby, 2 per host, 4 KiB data, no TURN; `Grow`: 128 lobbies, 16 players, 4 per host, 16 KiB, TURN; `Scale`: 1,024 lobbies, 32 players, 8 per host, 64 KiB, TURN).
- **Execution budgets**: general callbacks run with a 1M instruction / `1 s` / `8 MiB` sandbox ceiling; `_on_lobby_tick`, `sapi.*` async callbacks, `system.http_request` callbacks, and backend callbacks have a `20 ms` budget; `lobby.rpc.register` handlers have a `50 ms` budget.
- **Persistent store**: uses the same per-plan key/value/scope/data-ops ceilings as the Scripted API (`16` / `64` / `128` data ops per callback).

### Third-party HTTP (`system.http_request`) and internal calls (`sapi.call`, `sapi.read`)

| Limit | Free | Grow | Scale |
|---|---|---|---|
| Third-party HTTP calls per callback | 2 | 4 | 8 |
| Third-party HTTP calls per hour | 120 | 5,000 | 50,000 |
| Third-party HTTP timeout | 3 s | 5 s | 8 s |
| Third-party HTTP max response body | 64 KiB | 256 KiB | 1 MiB |
| Internal calls (`sapi.call`, `sapi.read`) per callback* | 16 | 64 | 256 |
| Internal calls per hour* | 20,000 | 500,000 | 5,000,000 |

\* Internal calls (`sapi.call`, `sapi.read`) are counted separately from third-party HTTP calls and are currently tracked in log-only mode without blocking normal games. `get_lobby_usage` lists the allowances (`outbound_per_request`, `internal_per_request`, `internal_per_hour`). `get_lobby_analytics` and the lobby activity panel show `outbound_calls`, `script_internal_calls` and `internal_would_reject`, the number of calls that went over an internal allowance and were only logged.

## Publishing with `chauffeur lobby`

1. Enable scripted lobbies on the game:
   ```bash
   chauffeur lobby set --enabled true --type scripted
   ```
2. Publish the pack directory (must contain `.lua` / `.luau` scripts and optional `blazium.json`):
   ```bash
   chauffeur lobby publish --dir .
   ```
3. Check status, active lobbies, data, config, secrets, usage, analytics, and audit logs:
   ```bash
   chauffeur lobby status
   chauffeur lobby list
   chauffeur lobby analytics
   chauffeur lobby usage
   ```

See [`github.com/blazium-games/scripted_lobby_examples`](https://github.com/blazium-games/scripted_lobby_examples) for complete pack examples and test patterns, and [chauffeur CLI commands → Lobby data](../cli/commands.md#lobby-data) for the full command list.
