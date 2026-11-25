---
title: Scripted API reference
sidebar_position: 8.6
description: Every Scripted API header, logic table field, Luau function, error code and plan limit.
---

# Scripted API reference

How to write, test and publish a pack is on [Scripted API](./scripted-api.md). This page lists what a pack and its callers can use.

## Requests

```text
{METHOD} https://sapi.blazium.online/v1/{game_uid}/{logic}
```

Inside a Discord activity the same path is under `https://{applicationId}.discordsays.com/.proxy/blazium/sapi`. The request body is at most 64 KiB. A JSON body is decoded into `req.body`. Any other body is in `req.raw`.

| Header | Meaning |
|---|---|
| `Authorization: Bearer <token>` | A player's Blazium session. Required by `auth = "user"`. |
| `X-Sapi-Key` | A game server key. Runs any logic as the `service` caller. |
| `X-Sapi-User` | With `X-Sapi-Key`, the player id the call acts for (at most 64 characters). |
| `X-Sapi-Timestamp`, `X-Sapi-Nonce`, `X-Sapi-Signature` | A [signed request](#signed-requests). |
| `X-Blazium-Channel` | Release channel. `?channel=` works too. Default `stable`. |
| `Idempotency-Key` | Replays the first answer for the same game, logic, caller and key for 24 hours. |

Every answer carries `X-Request-Id`. A replayed answer adds `Idempotent-Replayed: true`. `429` and most `503` answers carry `Retry-After` in seconds.

Browsers may call from the origins listed in the game's settings. Other origins get no `Access-Control-Allow-Origin` header. The web player and Discord proxy are same-origin and need no entry.

`GET /v1/{game_uid}/_config` returns the public remote config values for a channel as `{ "ok": true, "channel": "stable", "config": { } }`. It needs no sign-in and is cached for 30 seconds.

## Signed requests

Logic with `auth = "signed"` names a secret: `signed = { secret = "shop_hook" }`. Store that secret for every channel. The caller sends:

| Header | Value |
|---|---|
| `X-Sapi-Timestamp` | Unix seconds, within 5 minutes of now |
| `X-Sapi-Nonce` | 8 to 128 characters, never reused |
| `X-Sapi-Signature` | Lowercase hex HMAC-SHA256 of the string below, keyed with the secret |

```text
{timestamp}\n{nonce}\n{METHOD}\n/v1/{game_uid}/{logic}\n{body}
```

The path has no query string. A repeated nonce is refused.

## Logic table

| Field | Type | Meaning |
|---|---|---|
| `handler` | function | Required. Called with the request; returns the reply. |
| `auth` | string | `anonymous`, `user` (default), `service` or `signed`. |
| `methods` | list | Any of `GET`, `POST`, `PUT`, `PATCH`, `DELETE`. Default `GET` and `POST`. |
| `data` | table | `{ read = { ... }, write = { ... } }` with `global`, `channel` and `user`. Write implies read. |
| `uses` | list | `boards`, `secrets`, `progress`, `items`, `http`, `webhook`. |
| `rate` | table | `{ per_user = 30, per_ip = 0, window = 60 }`. Zero means no extra limit. Window 1 to 86400 seconds. |
| `schedule` | table | `{ cron = "*/15 * * * *", channel = "stable" }`. Five-field cron in UTC. |
| `http` | table | `{ allow = { "api.example.com", "*.example.com" } }`. Required by `uses` `http` or `webhook`. |
| `signed` | table | `{ secret = "name" }`. Required by `auth = "signed"`. |
| `description` | string | Shown in the pack list. |

An unknown field, scope, use or method fails validation.

## The request

| Field | Meaning |
|---|---|
| `req.method`, `req.logic`, `req.game`, `req.channel`, `req.request_id`, `req.ip` | The call. |
| `req.caller` | `anonymous`, `user`, `service`, `signed`, `schedule`, `admin` or `test`. |
| `req.plan` | `free`, `premium` or `business`. |
| `req.query`, `req.headers` | Strings. Header names are lowercase. |
| `req.body`, `req.raw` | Decoded JSON and the raw text. |
| `req.user` | `{ id, username, avatar_url, owns_game }` for a signed-in player, or `nil`. |

## The reply

A returned table or value becomes a `200` JSON body. A table with a numeric `status` is a full reply: `{ status = 201, headers = { ["x-thing"] = "1" }, body = { ... } }`. A string `body` is sent as text. Returning nothing sends `204`.

## Data

`data.global`, `data.channel` and `data.user` each have:

| Method | Meaning |
|---|---|
| `get(key)` | The value, or `nil`. |
| `get_versioned(key)` | The value and its version number. |
| `get_many(keys)` | Up to 100 keys at once, as a table. |
| `set(key, value, { ttl = seconds, sync = true })` | Store a JSON value. `ttl` up to 400 days. |
| `delete(key)` | Remove a key. |
| `incr(key, delta)` | Add to a number (default 1) and return it. |
| `cas(key, version, value)` | Set only if the version still matches; returns whether it did. |
| `list({ prefix, after, limit })` | Rows of `{ key, value }` in key order, and the key to continue after. |

Keys are 1 to 128 characters of letters, digits and `_ - . : /`. `data.user("id")` and `data.channel("beta")` open another player's or channel's scope, for service calls and schedules only.

## Leaderboards

`board(name, { channel = "beta" })` needs `"boards"` in `uses`. Without `channel` it uses the caller's channel.

| Method | Meaning |
|---|---|
| `submit(score, { user, mode })` | Record a score. `mode` is `best` (default), `lowest`, `latest` or `sum`. `user` is for service calls. |
| `top(n, { offset, ascending })` | Ranked `{ rank, user, score }` entries. |
| `rank(user)` | One entry, or `nil`. |
| `around(user, n)` | Entries around a player. |
| `count()` | Number of entries. |
| `reset()` | Clear the board. Schedules and service calls only. |

## Platform

| Function | Needs | Meaning |
|---|---|---|
| `secrets.get(name)` | `secrets` | The value for the channel, or for every channel. Never logged. |
| `config.get(name, default)` | | A remote config value. |
| `progress.unlock(slug, { user })` | `progress` | Unlock an achievement as the `scripted_api` writer. |
| `progress.stat(slug, value, { user, mode })` | `progress` | `mode` is `set`, `add`, `max` or `min`. |
| `progress.event(name, fields, { user })` | `progress` | A funnel event. Fields up to 4 KiB. |
| `items.grant(item, quantity, { user })` | `items` | Give 1 to 1000 of an item definition. |
| `items.list({ user })` | `items` | The player's items. |
| `webhook.send(url, body, { secret, headers })` | `webhook` | POST to an allowed host. `secret` signs it. |
| `api.http(request)` | `http` | An HTTPS call to an allowed host. Returns `{ ok, status, body, headers, json, error }`. |
| `api.call(logic, body, { method, query })` | | Run another logic in the pack, nested up to 4 deep. |

`progress`, `items.grant` and `webhook.send` are sent after the handler returns without an error. Without `user` they act for the signed-in player. Achievements, stats and events must list `scripted_api` among their [writers](./progress.md).

A signed webhook carries `X-Blazium-Timestamp`, `X-Blazium-Game` and `X-Blazium-Signature`, the lowercase hex HMAC-SHA256 of `{timestamp}.{body}` keyed with the secret.

## Standard library

| Name | Contents |
|---|---|
| `std.time` | `now`, `now_ms`, `date`, `iso`, `start_of_day`, `start_of_week`, `start_of_month`, `add_days`. UTC. |
| `std.crypto` | `sha256`, `hmac_sha256`, `uuid`, `random_hex`, `equal` (constant time), `base64_encode`, `base64_decode`. |
| `std.random` | `int`, `float`, and `new(seed)` for a repeatable generator with `int`, `float`, `pick` and `shuffle`. |
| `std.validate(value, schema)` | Returns `true` or `false` and a message. Schemas use `type`, `optional`, `enum`, `min`, `max`, `min_len`, `max_len`, `items`, `fields` and `extra`. |
| `std.ratelimit(key, limit, window_sec)` | `true` while under the limit. |
| `std.json`, `api.json` | `encode` and `decode`. |
| `log.debug`, `log.info`, `log.warn`, `log.error` | A message and optional fields, kept per the plan's log retention. |
| `api.game`, `api.channel`, `api.plan`, `api.request_id` | The current call. |

`os`, `debug`, `loadstring`, `getfenv`, `setfenv` and `collectgarbage` are removed. There is no file access, and the network is reached only through `api.http` and `webhook.send`.

## Errors in Luau

A failing platform call raises a table `{ ok = false, code, message, scope }`. Catch it with `pcall`:

```lua
local ok, err = pcall(function()
    data.user:set("inventory", inv)
end)
if not ok and type(err) == "table" and err.code == "over_plan_limit" then
    return { status = 402, body = { error = "storage is full" } }
end
```

An uncaught `over_plan_limit`, `forbidden`, `unauthorized`, `rate_limited`, `db_unavailable` or unknown channel becomes the matching HTTP error below. Anything else becomes `4310`, and only the request id is shown to the caller. If the handler fails, none of its data writes are kept.

## Error codes

Errors use `{ "ok": false, "error": { "code": 4307, "key": "rate_limited", "message": "..." } }`.

| Code | Key | HTTP | Meaning |
|---|---|---|---|
| `4300` | `bad_request` | 400 | The request is malformed. |
| `4301` | `unknown_game` | 404 | No such game. |
| `4302` | `unknown_logic` | 404 | No such logic, or no pack is active on the channel. |
| `4303` | `method_not_allowed` | 405 | The logic's `methods` do not include this one. |
| `4304` | `unauthorized` | 401 | Missing or invalid session or key. |
| `4305` | `forbidden` | 403 | The caller cannot reach that data. |
| `4306` | `game_disabled` | 403 | The Scripted API is off, or staff turned it off. |
| `4307` | `rate_limited` | 429 | Over a game, player, address or logic rate. |
| `4308` | `over_plan_limit` | 402 | Over a plan limit, or writes are blocked while over a data limit. |
| `4309` | `pack_loading` | 503 | The pack is loading or failed to load. |
| `4310` | `script_error` | 500 | The logic raised an error. See the logs. |
| `4311` | `budget_exceeded` | 402 | The logic ran past its time or memory budget. |
| `4312` | `body_too_large` | 413 | The body is over 64 KiB. |
| `4313` | `db_unavailable` | 503 | Data could not be loaded. Try again. |
| `4314` | `lease_held` | 503 | The game's data is moving between servers. Try again. |
| `4315` | `signature_invalid` | 401 | A signed request did not verify. |
| `4316` | `anonymous_disabled` | 401 | Anonymous calls are off for the game. |
| `4317` | `channel_unknown` | 400 | The game has no such release channel. |
| `4318` | `idempotency_conflict` | 409 | A request with this `Idempotency-Key` is still running. |
| `4319` | `internal` | 500 | Server error. |
| `4320` | `conflict` | 409 | Data kept changing during the request. Try again. |
| `4321` | `not_found` | 404 | No such route. |
| `4322` | `service_unavailable` | 503 | Busy, restarting, or sign-in cannot be checked. Try again. |

The same codes come back through `api.blazium.online` when the website, chauffeur or MCP reach the Scripted API for you.

## Limits

| Limit | Free | Grow | Scale |
|---|---|---|---|
| Value size | 4 KiB | 32 KiB | 128 KiB |
| Global data | 256 KiB, 250 keys | 4 MiB, 4,000 keys | 16 MiB, 16,000 keys |
| Data per channel | 256 KiB, 250 keys | 2 MiB, 2,000 keys | 8 MiB, 8,000 keys |
| Channels with data | 2 | 8 | 25 |
| Data per player | 16 KiB, 32 keys | 128 KiB, 200 keys | 512 KiB, 1,000 keys |
| Stored data per game | 50 MiB | 2 GiB | 25 GiB |
| Calls per minute per game | 600 | 6,000 | 30,000 |
| Calls per minute per player | 30 | 120 | 300 |
| Calls running at once | 4 | 16 | 48 |
| Data operations per call | 16 | 64 | 128 |
| Time per call | 250 ms | 1 s | 2.5 s |
| Memory per call | 2 MiB | 8 MiB | 16 MiB |
| Outbound calls per call | 2 | 4 | 8 |
| Outbound calls per hour | 120 | 5,000 | 50,000 |
| Outbound timeout | 3 s | 5 s | 8 s |
| Outbound response | 64 KiB | 256 KiB | 1 MiB |
| Pack size | 256 KiB | 2 MiB | 8 MiB |
| Logic files | 20 | 100 | 250 |
| Packs kept | 3 | 10 | 25 |
| Schedules | 2 | 10 | 50 |
| Shortest schedule interval | 1 hour | 5 minutes | 1 minute |
| Secrets | 5 | 25 | 100 |
| Config values | 50 | 500 | 2,000 |
| Leaderboards | 2 | 20 | 100 |
| Entries per leaderboard | 1,000 | 50,000 | 250,000 |
| Log lines kept | 1,000 | 20,000 | 100,000 |
| Log retention | 1 day | 7 days | 30 days |

A pack that is over the plan's pack, file or schedule limits is refused when it is published. When a plan ends, stored data stays readable and deletable, and writes are refused with `4308` while the game is over a data limit.
