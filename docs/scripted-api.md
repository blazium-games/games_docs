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
| `user` (default) | A signed-in player: `Authorization: Bearer <token>`. The token is a short-lived one for this game that the SDK or the web player requests for the signed-in player. See [Tokens](#tokens). |
| `service` | Your own server, with a game server key in `X-Sapi-Key`. Add `X-Sapi-User` to act for one player. |
| `signed` | A webhook signed with a secret you stored. See [Signed requests](./scripted-api-reference.md#signed-requests). |

A game server key works on every logic. Create one with `request_server_key` over MCP; the secret is returned once. It is not the deploy key.

### Tokens

A game never sends the player's login session to the Scripted API. It sends a scoped token: an HS256 token for one audience (`sapi`) and one game, which expires after 10 minutes by default (the platform can set 1 to 15 minutes). The SDK and the web player ask for it. They never create one themselves, and a scoped token cannot be used to ask for another.

| Where the game runs | How the token is requested |
|---|---|
| Godot addon, signed in | `BlaziumGames.request_scoped_token("sapi")` posts the login session to `POST /api/v1/private/games/{game id}/tokens` and keeps the answer until shortly before it expires. |
| Unity and Unreal, native build | `BlaziumApi.RequestToken("sapi")` in the SDK asks the engine host, which asks the platform. The SDK hands game code the scoped token and never the login token. |
| Browser (Godot web, Unity WebGL) | `POST /blazium/token` on the play origin, with `{"audience":"sapi"}`. See [Web player](./web-player.md#scripted-api-and-lobbies-in-the-browser). |

The request body is `{"audience":"sapi"}` or `{"audience":"lobby"}`. A reply carries `token`, `audience`, `game_uid`, `expires_at` and `expires_in`, and is never cached. Only a plain login session can ask. These are refused:

| Status | Meaning |
|---|---|
| `400` | The audience is not `sapi` or `lobby`, or the body is not JSON. |
| `403` | The caller is not a plain login session (an MCP key, an OAuth token or another scoped token), or the player neither owns the game nor holds a license. |
| `404` | No such game. |
| `409` (`4097`) | The game's Scripted API (or lobby, for the `lobby` audience) is off, or staff turned it off. |
| `429` | More than 30 requests a minute for one player. |
| `503` (`5031`) | Staff turned scoped tokens off for the platform. |

A token for `lobby` opens that game's lobby routes and nothing else, and a `sapi` token does not open the lobby. A token for another game is refused with `4034`.

A token stops working when the login session it came from is signed out or expired, the player is banned, or the player changes their password, even before its own expiry. A call that gets `401` asks for a new token once and tries again.

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

### Reset data in bulk

`chauffeur sapi data reset` and the MCP tool `reset_sapi_data` delete many keys in one call. Start with a dry run, which counts what would go and changes nothing:

```bash
chauffeur sapi data reset --scope channel --channel beta --prefix temp/ --dry-run <game id>
chauffeur sapi data reset --scope channel --channel beta --prefix temp/ --confirm <game id>
```

| Option | Meaning |
|---|---|
| `--scope global` | Every key of the game's global scope. |
| `--scope channel` | The keys of one release channel (`--channel`). Without `--channel`, every channel. |
| `--scope user` | The keys of one player (`--user`). Without `--user`, every player; a prefix is not allowed then. |
| `--prefix` | Only keys that start with this text. |
| `--dry-run` | Count only. The reply is the same shape, and nothing is deleted or audited. |
| `--confirm` | Required to delete. Give the game's id. |

`--scope` is required. The reply is `ok`, `dry_run`, `scope`, `keys`, `bytes`, `users` and `channels`. A real reset is a destructive action: it goes through the same approval as deleting a secret and is written to the game's audit log as `data.reset`. A dry run needs no approval. chauffeur and MCP always name a scope. A request with no scope purges the whole game, including its stored logs, and a deploy key is refused for it. Over MCP, `reset_sapi_data` takes `uid`, `scope`, `channel`, `user`, `prefix`, `dry_run` and `confirm`, and needs `dry_run` or `confirm`.

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
	sapi.invoke("submit_score", {"score": 1200})
```

`invoke(logic, args, opts)` is the call. `call_logic` is kept as an alias, because `call` is already a built-in GDScript method. `opts` takes `method` (`POST` by default, or `GET`, `PUT`, `PATCH`, `DELETE`) and `anonymous` (send no token).

It sends a [scoped token](#tokens) for this game, never the login session, the `blazium/sapi/channel` project setting as the channel, and an `Idempotency-Key` on every write. It retries `429` and `503` with backoff, asks for a fresh token once after a `401`, and uses the Discord proxy inside a Discord activity. Inside an activity, add the `/blazium/sapi` mapping on the Discord developer portal (see [Web player](./web-player.md)). In a browser game it gets the token from the play origin.

Unity and Unreal have the same client. In Unity, run it from a coroutine:

```csharp
var sapi = BlaziumUnitySapi.Create();
var result = new BlaziumSapiResult();
yield return sapi.Call("submit_score", "POST", "{\"score\":1200}", result);
```

`Channel` and `MaxRetries` are fields of `BlaziumSapi`. A native build asks the host through the SDK (`BlaziumApi.RequestToken("sapi")`), and a WebGL build asks `POST /blazium/token`. Unreal has the Blueprint node `UBlaziumSapi::CallLogic(Logic, Method, BodyJson, bAnonymous)` with `OnSuccess` and `OnFailure`. Both retry a `429` or `503` with the same `Idempotency-Key` and ask for a fresh token once after a `401`. The native SDK needs library version 2.1.0 or newer (an older library fails with `sdk_too_old` in Unity) and a Blazium engine build that can request tokens (an older build fails with `host_too_old`).

Any other client can call the URL directly. Send `Idempotency-Key` on writes you might retry; the same key within 24 hours replays the first answer instead of running the logic again.

## Logs, usage and analytics

`chauffeur sapi logs` and `get_sapi_logs` read `log.info` lines and errors, by logic, channel, level or request id. Each reply carries `X-Request-Id`. A script error tells the caller only the request id; the logs have the details.

Lines are stored in the database, so they survive a restart and a move of the game between servers. A plan keeps a number of lines per game for its retention (1,000 lines for 1 day on Free, 20,000 for 7 days on Grow, 100,000 for 30 days on Scale), and older lines are removed. Add `--since` and `--until` (a time, or for chauffeur how long ago, such as `30m`, `2h` or `7d`) to read a window. A page is at most 1,000 lines, oldest first. When it is full, the reply has a `next_cursor`: pass it as `--cursor` (`cursor` over MCP) to read the lines before it. Lines that were queued while the database was down or slow can be dropped, and the service counts them. The whole-game purge removes the stored logs as well.

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
