---
title: Scripted API
sidebar_position: 8.5
description: Run your own Luau logic for a game at sapi.blazium.online, with stored data, leaderboards, schedules, secrets and remote config, without hosting a server.
---

# Scripted API

The Scripted API runs Luau logic you write for one game. Each top-level file in a pack is an HTTP route:

```text
https://sapi.blazium.online/v1/{game_uid}/{logic}
```

Use it for the parts of a game that need a server but not a dedicated one: score submission, daily rewards, inventory rules, matchmaking queues, season resets, or a webhook from your own tools. Logic can store data per game, per release channel and per player, keep leaderboards, run on a schedule, call allowed HTTPS hosts, and grant achievements, stats and items.

The [Scripted API reference](./scripted-api-reference.md) lists every Luau function, header, error code and limit.

## Turn it on

Open the game in the editor and choose the **Scripted API** tab. Turn it on, and choose whether logic marked `auth = "anonymous"` may run without a signed-in player. Add the browser origins of any web page that calls it directly, such as `https://example.com`. The web player and Discord activities do not need an origin.

Over MCP, `set_sapi` changes the same settings, and turning it on waits for the account owner's approval. A deploy key cannot turn it on.

## Write a pack

A pack is a folder of `.luau` (or `.lua`) files:

```text
my-pack/
  hello.luau          -> /v1/{game_uid}/hello
  submit_score.luau   -> /v1/{game_uid}/submit_score
  daily_reset.luau    -> runs on a schedule
  lib/scores.luau     -> a module, required as "lib.scores"
  scores.test.luau    -> tests, never served
```

Top-level file names become routes and must be 1 to 64 characters of `a-z`, `0-9`, `_` and `-`. Files in folders are modules that logic loads with `require("lib.scores")`. Files ending in `.test.luau` hold tests.

Each logic file returns a table. `handler` gets the request and returns the reply:

```lua
-- hello.luau: GET /v1/{game_uid}/hello?name=Ada
return {
    auth = "anonymous",
    methods = { "GET" },
    handler = function(req)
        return { hello = req.query.name or "world", channel = req.channel }
    end,
}
```

A returned table becomes a `200` JSON body. Return `{ status = 400, body = { error = "..." } }` to choose the status, and add `headers` when needed.

Logic that stores data declares what it reads and writes:

```lua
-- submit_score.luau: POST {"score": 1200}
return {
    auth = "user",
    methods = { "POST" },
    uses = { "boards", "progress" },
    data = { read = { "user" }, write = { "user" } },
    rate = { per_user = 30, window = 60 },
    handler = function(req)
        local ok, err = std.validate(req.body, {
            type = "object",
            fields = { score = { type = "integer", min = 0, max = 1000000000 } },
        })
        if not ok then
            return { status = 400, body = { error = err } }
        end
        local best = data.user:get("best") or 0
        if req.body.score > best then
            data.user:set("best", req.body.score)
        end
        board("high"):submit(req.body.score)
        progress.stat("total_score", req.body.score, { mode = "add" })
        return { best = math.max(best, req.body.score), plays = data.user:incr("plays") }
    end,
}
```

A pack is checked before it is stored: every file must compile, every manifest must use known fields, and the pack must fit the plan. Errors name the file and line.

Point [luau-lsp](https://github.com/JohnnyMorganz/luau-lsp) at `types/sapi.d.luau` from the starter pack for completion and type checks.

## Who can call

The `auth` field of each logic decides who may run it.

| `auth` | Caller |
|---|---|
| `anonymous` | Anyone, when anonymous calls are on for the game. A signed-in player's session is still read when sent. |
| `user` (default) | A signed-in player: `Authorization: Bearer <session token>` from Blazium sign-in. |
| `service` | Your own server, with a game server key in `X-Sapi-Key`. Add `X-Sapi-User` to act for one player. |
| `signed` | A webhook signed with a secret you stored. See [Signed requests](./scripted-api-reference.md#signed-requests). |

A game server key works on every logic. Create one with `request_server_key` over MCP; the secret is returned once. It is not the deploy key.

## Test locally

`chauffeur sapi` runs the same engine on your machine:

```bash
chauffeur sapi validate --dir my-pack --plan free
chauffeur sapi test --dir my-pack
chauffeur sapi dev --dir my-pack --port 8787
```

`validate` checks the pack against a plan's limits. `test` runs every `*.test.luau` file:

```lua
-- scores.test.luau
return {
    first_score_is_best = function()
        local r = t.call("submit_score", { user = "ada", body = { score = 50 } })
        t.eq(r.status, 200)
        t.eq(r.body.best, 50)
    end,
}
```

`dev` serves the folder at `http://127.0.0.1:8787/v1/dev/{logic}` (the game id is `dev`) and reloads when a file changes. Data stays in memory. The token `dev-user-1` signs in as a test player and `X-Sapi-Key: dev-service` acts as a server. `--users users.json` adds players as `{"tokens": {"token": {"id": "u1", "username": "ada"}}}`.

The emulator is the `games_sapi` Linux binary. chauffeur looks for it in `--binary`, `SAPI_BINARY`, `PATH`, and its own cache, and downloads it on Linux x86_64 when none is found. On Windows, run chauffeur inside WSL.

## Publish

Publishing uses the game's [deploy key](./deploy.md):

```bash
chauffeur sapi publish --dir my-pack --channel stable --activate
chauffeur sapi packs
chauffeur sapi activate <checksum> --channel beta
chauffeur sapi activate none --channel beta
```

`publish` zips the folder and uploads it. Without `--activate` the pack is stored but not served. `activate` serves a stored pack on a channel; activating an older checksum is how you roll back. `none` stops a channel. The plan keeps the last few packs (3 on Free) and the active ones.

The **Scripted API** tab and the MCP tools `list_sapi_packs` and `activate_sapi_pack` do the same. MCP never uploads a pack.

## Release channels

Callers choose the channel with the `X-Blazium-Channel` header (or `?channel=`). It defaults to `stable`. Each channel serves its own active pack and has its own channel-scoped data, so `beta` can try new logic on separate data. A channel name the game does not have is refused with `4317`.

`chauffeur sapi data copy --channel stable --to beta` copies one channel's data into another.

## Data

| Scope | In Luau | Holds |
|---|---|---|
| Global | `data.global` | One set of keys for the whole game. |
| Channel | `data.channel` | Keys for the caller's release channel. |
| User | `data.user` | Keys for the signed-in player. |

Each scope has `get`, `get_many`, `set`, `delete`, `incr`, `cas` and `list`. Values are any JSON value. A key may expire after a `ttl` in seconds.

A player can only reach their own user data. Service calls and schedules can open another player's scope with `data.user("player-id")` and another channel's with `data.channel("beta")`.

Every write in a request is applied together when the handler returns. If the handler raises an error, none of its writes are kept. Writes are saved to the database shortly after the request ends. `{ sync = true }` waits for one write to be saved before the request continues.

When a game is over a data limit after its plan ends or is downgraded, data stays readable and deletes work, but writes are refused with `4308` until the plan is back or enough data is deleted. `get_sapi_usage` and `chauffeur sapi usage` show `read_only`.

## Leaderboards, schedules, secrets and config

`board("name")` keeps one score per player with `submit`, `top`, `rank`, `around`, `count` and `reset`. Add `"boards"` to `uses`. Only schedules and service calls can reset a board.

A logic with `schedule = { cron = "0 0 * * *" }` runs on that UTC cron with the `schedule` caller, on the stable channel unless `schedule.channel` says otherwise. A run that is still going is not started twice. Free allows one run an hour at most. `chauffeur sapi schedules run <logic>` runs one now.

Secrets are write-only. Store them on the tab, with `chauffeur sapi secret set <name>` (the value is read from stdin), or with `set_sapi_secret`. Logic reads them with `secrets.get("name")` after adding `"secrets"` to `uses`. Values never appear in logs, and no tool returns them.

Remote config values are JSON values per channel or for every channel. Logic reads them with `config.get("name", default)`. A value marked public is also served to game clients at `GET /v1/{game_uid}/_config`.

## Calling from a game

The Godot addon has a `BlaziumSapi` node. Add it to a scene next to `BlaziumGames`:

```gdscript
@onready var sapi: BlaziumSapi = $BlaziumSapi

func _ready() -> void:
	sapi.call_completed.connect(func(logic, status, body, request_id): print(logic, " ", body))
	sapi.call_failed.connect(func(logic, status, key, message, request_id): push_warning(message))
	sapi.call_logic("submit_score", {"score": 1200})
```

It sends the player's session, the `blazium/sapi/channel` project setting as the channel, and an `Idempotency-Key` on every write. It retries `429` and `503` with backoff and uses the Discord proxy inside a Discord activity. Inside an activity, add the `/blazium/sapi` mapping on the Discord developer portal (see [Web player](./web-player.md)).

Any other client can call the URL directly. Send `Idempotency-Key` on writes you might retry; the same key within 24 hours replays the first answer instead of running the logic again.

The Unity and Unreal packages do not include a Scripted API client yet, because the native SDK does not hand the session token to game code. Call logic marked `anonymous` or `service` from those engines, or from your own server.

## Logs, usage and analytics

`chauffeur sapi logs` and `get_sapi_logs` read recent `log.info` lines and errors, by logic, channel, level or request id. Each reply carries `X-Request-Id`. A script error tells the caller only the request id; the logs have the details.

The **Analytics** page of the game shows Scripted API calls per day, errors, budget hits and the busiest logic. `chauffeur sapi usage` shows stored data against the plan.

## Plans

| | Free | Grow | Scale |
|---|---|---|---|
| Pack size | 256 KiB | 2 MiB | 8 MiB |
| Logic files | 20 | 100 | 250 |
| Packs kept | 3 | 10 | 25 |
| Stored data per game | 50 MiB | 2 GiB | 25 GiB |
| Calls per minute per game | 600 | 6,000 | 30,000 |
| Calls per minute per player | 30 | 120 | 300 |
| Time per call | 250 ms | 1 s | 2.5 s |
| Schedules (shortest interval) | 2 (1 hour) | 10 (5 minutes) | 50 (1 minute) |
| Leaderboards (entries each) | 2 (1,000) | 20 (50,000) | 100 (250,000) |
| Log retention | 1 day | 7 days | 30 days |

The [reference](./scripted-api-reference.md#limits) lists every limit, including per-scope data sizes and outbound calls.

Staff can turn the Scripted API off for a game that abuses it. The tab then shows the reason, and calls return `4306`.
