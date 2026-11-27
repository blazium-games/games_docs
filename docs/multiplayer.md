---
sidebar_position: 8
---

# Multiplayer

A Blazium game uses the engine module. A game built on another Godot engine vendors the public `games_plugin` addon and sets `blazium/game/game_uid` to the project id from the editor. Unity and Unreal games use the packages on [Engines](./engines.md). They call the native library instead of opening these sockets themselves.

## Sign-in

The game opens a websocket to `wss://login.blazium.online/api/v1/connect` with protocols `blazium` and the project id. It sends `getid`, then `getlogin`, and receives the session token. GitHub, X, Discord, and Steam are the providers a game can turn on, and email and password is a fifth that is off until the developer turns it on. A game with no websocket (a phone, a console, an engine client) starts the same sign-in over HTTPS and polls for the result, and the player can enter a short code at `https://blazium.games/connect` instead of opening a link. See [Sign-in without the launcher](./standalone-sign-in.md).

## Lobby and connections

Turn lobbies on in the game editor. Choose Relay or Scripted. Relay seats players without a pack. Scripted runs a published Luau pack. A separate switch turns TURN and STUN on or off for that game.

Create or join returns only after the player is admitted. The response includes `lobby_url`, `ice_enabled`, and, when TURN is on, `ice_session_id`. The module opens the lobby socket after that call succeeds. `lobby_seat` and SDK message 19 report `seated`, `lobby_loading`, or `lobby_failed`. The SDK does not open the socket. The `games_plugin` addon opens its own.

A game that cannot hold the login session, such as a browser game, can create, join, and read the status of a lobby with a scoped token for the `lobby` audience instead. A player who signed in without the launcher gets one from the session (see [Sign-in without the launcher](./standalone-sign-in.md)). It asks for one the same way as for the [Scripted API](./scripted-api.md#tokens) and sends it as `Authorization: Bearer <token>`. The token opens these lobby routes for its own game only. Any other route, and another game's lobby, refuses it, and a `sapi` token is not accepted here. The player must still own the game or hold a license, and the lobby must be on.

The lobby socket is `wss://lobby.blazium.online/`. ICE servers come from `https://stun.blazium.online/v1/ice` using `ice_session_id` from that response. Relay uses `wss://turn.blazium.online/v1/signal`. When the TURN switch is off, the game does not request ICE. A presence notice on the lobby socket does not replace that ICE fetch. Achievements, stats, funnel events, and that notice are described in [Progress](./progress.md).

Inside a Discord activity, the module and the Godot addon send API calls to `https://{applicationId}.discordsays.com/.proxy/blazium/api` and open `wss://{applicationId}.discordsays.com/.proxy/blazium/login/api/v1/connect` and `wss://{applicationId}.discordsays.com/.proxy/blazium/lobby/` instead of the public hosts. Turn lobbies on as Relay or Scripted, and leave the TURN switch off. Discord does not carry WebRTC. A Discord player still has to sign in and own the game or hold a license before the lobby socket accepts them. Unity and Unreal do not open these sockets. A Telegram Mini App uses `api.blazium.online`, `login.blazium.online`, and `lobby.blazium.online` directly. The same sign-in and license rule applies before the lobby socket accepts them. STUN and TURN are not offered.

## Scripted lobbies

Turn scripted lobbies on in the game editor. Publish the Luau pack with the CLI:

```bash
chauffeur lobby publish --dir .
chauffeur lobby list
chauffeur lobby status
```

Packs are Luau only.

## Lobby data

On every plan a scripted lobby can keep data that outlives the lobby, in its own store. Free has a small quota (4 KiB per lobby); Grow and Scale raise it (16 KiB and 64 KiB), see [Lobby limits](./plans.md#lobby-limits). It is separate from the [Scripted API](./scripted-api.md)'s data: a key written in one is not visible in the other. Lobby scripts use the same names as Scripted API logic, so code moves between them:

| Luau | What it is |
|---|---|
| `data.global`, `data.channel`, `data.user` | Keys for the whole game, one release channel, or one player. |
| `data.lobby` | Keys that belong to one lobby and go away with it. |
| `board(name)` | A leaderboard kept by the lobby service. |
| `config.get(name, default)`, `secrets.get(name)` | Remote config and write-only secrets for lobby scripts. |

List what the script uses in its `blazium.json`: `"data": { "read": ["user"], "write": ["user", "lobby"] }`, and `"uses"` for `secrets` and `sapi`. The writes of one callback apply together when it returns, and are dropped if it raises an error. A script that reads data the lobby has not loaded gets `data_unavailable`.

To use the other store, a lobby script lists `"sapi"` in `uses` and calls `sapi.read(scope, key, user, fn)` to read one Scripted API value, or `sapi.call(logic, { action, body, user }, fn)` to run a Scripted API logic for a player in the lobby. Both are asynchronous, and `fn` receives `{ ok, status, body, error }`. A Scripted API logic with `"lobby"` in `uses` reaches back with `lobby.call`, `lobby.broadcast` and the other [lobby functions](./scripted-api-reference.md#platform). Calls between the two are not counted against the plan again. Both need the `lobby` and `lobby_data` [capabilities](./scripted-api-features.md#capabilities), which the owner turns on per game.

Read and change lobby data from the terminal with `chauffeur lobby data`, `lobby config`, `lobby secret` and `lobby usage` (see [commands](./cli/commands.md#lobby-data)), or with `get_lobby_data`, `set_lobby_data` and the other [lobby data tools](./mcp/reference.md#lobby-data) over MCP. A reset of a whole scope needs `--confirm` with the game's id, and over MCP waits for the owner's approval.