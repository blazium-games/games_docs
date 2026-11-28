---
name: blazium-games-lobby-pack
description: Publish a Luau lobby pack with chauffeur and check it on the Scripted lobby tab.
license: MIT
---

# Lobby packs

`chauffeur lobby set` turns the lobby on, chooses `relay` or `scripted`, and switches TURN. Pass at least one of `--enabled`, `--type`, or `--ice`.

`chauffeur lobby publish --dir <path>` packs `.lua` and `.luau` files plus an optional `blazium.json` (up to 16 KiB) into an uncompressed ZIP, refuses any other script language or file type, and uploads through the uploader. `chauffeur lobby list` and `chauffeur lobby status` show the stored packs and the checksum the next lobby loads. The game editor Scripted lobby tab shows the same history. The page does not upload the pack.

A seated pack can call these on `lobby`. The host performs them. The pack never sees the host token.

- `unlock_achievement(user, slug)` and `set_stat(user, slug, value)` write progress when that definition lists `scripted_lobby`.
- `record_event(user, name, fields)` stores one registered funnel event. Slug, event, and status strings that are too long are refused before the call. `fields` is at most 4 KiB.
- `analytics(name)` reads count, unique devices, and the daily totals for one event that lists `scripted_lobby`. An optional build filter uses the same shape. It does not return visitor or download numbers.
- `set_presence(user, status)` only notifies that player's lobby connection. The host signs the notice. The launcher applies it.

## Callbacks

A callback is a global function with one of these exact names. Nothing else is an engine hook. Reference: https://docs.blazium.games/docs/scriptable/scripted-lobby-scripting.

| Callback | Arguments | Result |
|---|---|---|
| `_on_lobby_created`, `_can_peer_join` | `peer, lobby` | `false` or `{ error }` refuses. Anything else allows. A script error refuses. |
| `_on_peer_joined`, `_on_peer_leave` | `peer, lobby` | Ignored. On leave the player is already out of `lobby:get_members()`. |
| `_on_host_changed` | `peer, lobby` | Ignored. `peer` is the new host. Runs after `_on_peer_leave`, and not when the lobby closes. |
| `_on_lobby_tick` | `lobby, dt_ms` | Ignored. Every lobby, every server tick, 20 ms budget. |
| `_can_peer_chat` | `peer, lobby, msg, meta` | Only `true` allows. A script error allows the message. `msg` is at most 256 bytes. |
| `_can_peer_action` | `peer, lobby, action_id` | `true` approves, `false` or `nil` refuses, `{ error, code? }` refuses with that text. When absent, only `move`, `attack` and `use_item` pass. |
| `on_action` | `peer, lobby, args` | A JSON-able table goes back to the client, or `{ error, code? }`. Runs only while the lobby is `in_game` (except `start_game`). Nested `args.params` objects and arrays arrive as JSON strings: use `system.decode_json`. |
| `_on_backend_result` | `body` | Ignored, 20 ms budget. |
| Timer functions | `{ lobby_id }` | Named by `lobby:start_timer(fn_name, delay_sec)`. No player. Use `_lobby_get_current()` for the lobby. |
| `_lobby_rpc_register(name, fn)` handlers | the body table | Return the reply, or `error({ code, message })`. 50 ms budget. |

`begin_turn`, `end_turn` (as a global function), `on_turn_timeout`, and `_can_peer_ready` are NOT engine hooks, and neither are `on_connecting`, `on_authorized` or `on_connected`. A function with those names never runs. To advance a turn, call the Lobby method `lobby:end_turn()` (or `lobby:skip_turn(peer_id)` and `lobby:rotate_turn_to(peer_id)`) from `on_action` or a timer.

Other things that are easy to get wrong:

- Script variables are scratch space. One engine serves every lobby of the pack and an idle engine is dropped, so keep state in `lobby:set_data`, `data.*` or a board. `peer:set_data` does not outlive one callback.
- The `Lobby` handle has no host getter, member count, or lobby id. Keep them in `lobby:set_data`.
- `kick`, `ban`, `is_banned`, `set_turn_order`, `rotate_turn_to` and `skip_turn` take the player id string (`peer:get_id()`). `unlock_achievement`, `set_stat`, `record_event` and `set_presence` take the `peer` handle of the running callback.
- Results of `sapi.call`, `sapi.read`, `system.http_request` and RPC handlers arrive later with no player. Send them out with `lobby:broadcast`, and define an empty `function _on_lobby_tick(lobby, dt_ms) end` so queued broadcasts flush on the next tick.

## blazium.json

The engine reads only these fields:

| Field | Meaning |
|---|---|
| `data` | `{ "read": [...], "write": [...] }` over `game` (same as `global`), `global`, `channel`, `user`, `lobby`. Write implies read. |
| `boards` | Up to 16 leaderboard names, 1 to 64 characters. |
| `uses` | Any of `config`, `secrets`, `sapi`, `http`. |
| `http` | `{ "allow": [...] }`, up to 32 host names (`api.example.invalid` or `*.example.invalid`, no scheme, port, path or userinfo). Required when `uses` has `http`. |

`name`, `version`, `plan` and `channel` are NOT read from the file. The plan and release channel come from the signed load request, so a pack cannot raise its own limits. Anything undeclared raises `not_declared`.

## Outbound HTTP

`system.http_request(url_or_table, fn)` needs `"http"` in `uses` and the host in `http.allow`. It is asynchronous: the answer arrives in `fn(r)` with a 20 ms budget and no calling player. HTTPS only, no redirects, public addresses only, request body up to 64 KiB.

```lua
system.http_request({
    url = "https://api.example.invalid/match",
    method = "POST",                       -- GET (default), POST, PUT, PATCH, DELETE
    headers = { Authorization = "Bearer " .. secrets.get("api_token") },
    body = { winner = peer:get_id() },     -- string or table
    timeout_ms = 2500,
}, function(r)
    -- r = { ok, status, body, headers, json?, error?, message? }
    if r.ok then lobby:broadcast("match_saved", { status = r.status }) end
end)
```

- `r.error` is one of `bad_url`, `dns_failed`, `blocked_address`, `timeout`, `too_large`, `redirect`, `tls_failed`, `unavailable`. A non-2xx answer sets `r.ok = false` and `r.status`, with no `r.error`.
- The call itself raises `http_disabled`, `not_declared`, `bad_value`, `over_plan_limit` or `rate_limited` (also `not_available`, `feature_disabled`, `busy`). Wrap it in `pcall` when a refusal must not fail the callback.
- Per plan, third-party calls per callback are 2 on Free, 4 on Grow, 8 on Scale. Per hour: 120, 5,000, 50,000. Timeout: 3 s, 5 s, 8 s. Response body: 64 KiB, 256 KiB, 1 MiB. Internal calls (`sapi.call`, `sapi.read`) per callback are 16, 64, 256, and per hour 20,000, 500,000, 5,000,000. The internal counts are only logged for now.
- Never put a secret in the pack or in a payload: use `secrets.get` with `"secrets"` in `uses`. Use `.invalid` placeholder hosts in examples.

## Examples and tests

Copy and adapt from the public repo https://github.com/blazium-games/scripted_lobby_examples: `examples/` recipes (join gate, chat filter, custom actions, turn based, host change, tick and timers, data scopes, boards, `sapi.call`, RPC, host APIs, outbound HTTP), `base/` lobbies that sit in front of the base Scripted API logic, `payloads/`, `types/blazium_lobby.d.luau`, and `schema/blazium.schema.json`. Read its `AGENTS.md` before you write a pack. Its `python3 scripts/validate.py` and `python3 scripts/scan_public.py` must pass. A lobby asks and the Scripted API decides and pays, so keep currency and rewards in a Scripted API logic (see the `blazium-games-sapi` skill and https://github.com/blazium-games/scripted_api_examples).

## Lobby data

On every plan a lobby script can keep data in its own store (4 KiB per lobby on Free, 16 KiB on Grow, 64 KiB on Scale), with `data.global`, `data.channel`, `data.user` and `data.lobby`, `board(name)`, `config.get` and `secrets.get`. Declare what it reads and writes in `blazium.json` (`"data": { "read": [...], "write": [...] }`). The store is separate from the Scripted API's data. Reach the Scripted API with `sapi.read(scope, key, user, fn)` and `sapi.call(logic, { action, body, user }, fn)` after adding `"sapi"` to `uses`. The owner turns on the `lobby` and `lobby_data` capabilities for the game first, otherwise calls answer `feature_disabled`. `chauffeur lobby data|config|secret|usage` and the MCP tools `get_lobby_data`, `set_lobby_data`, `get_lobby_config` and `get_lobby_usage` read and change it. Guide: https://docs.blazium.games/docs/multiplayer#lobby-data.