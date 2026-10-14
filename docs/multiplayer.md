---
sidebar_position: 8
---

# Multiplayer

A Blazium game uses the engine module. A game built on another Godot engine vendors the public `games_plugin` addon and sets `blazium/game/game_uid` to the project id from the editor. Unity and Unreal games use the packages on [Engines](./engines.md). They call the native library instead of opening these sockets themselves.

## Sign-in

The game opens a websocket to `wss://login.blazium.online/api/v1/connect` with protocols `blazium` and the project id. It sends `getid`, then `getlogin`, and receives the session token. GitHub, X, Discord, and Steam are the providers a game can turn on.

## Lobby and connections

Turn lobbies on in the game editor. Choose Relay or Scripted. Relay seats players without a pack. Scripted runs a published Luau pack. A separate switch turns TURN and STUN on or off for that game.

Create or join returns only after the player is admitted. The response includes `lobby_url`, `ice_enabled`, and, when TURN is on, `ice_session_id`. The module opens the lobby socket after that call succeeds. `lobby_seat` and SDK message 19 report `seated`, `lobby_loading`, or `lobby_failed`. The SDK does not open the socket. The `games_plugin` addon opens its own.

The lobby socket is `wss://lobby.blazium.online/`. ICE servers come from `https://stun.blazium.online/v1/ice` using `ice_session_id` from that response. Relay uses `wss://turn.blazium.online/v1/signal`. When the TURN switch is off, the game does not request ICE. A presence notice on the lobby socket does not replace that ICE fetch. Achievements, stats, funnel events, and that notice are described in [Progress](./progress.md).

Inside a Discord activity, the module and the Godot addon send API calls to `https://{applicationId}.discordsays.com/.proxy/blazium/api` and open `wss://{applicationId}.discordsays.com/.proxy/blazium/login/api/v1/connect` and `wss://{applicationId}.discordsays.com/.proxy/blazium/lobby/` instead of the public hosts. Turn lobbies on as Relay or Scripted, and leave the TURN switch off. Discord does not carry WebRTC. A Discord player still has to sign in and own the game or hold a license before the lobby socket accepts them. Unity and Unreal do not open these sockets.

## Scripted lobbies

Turn scripted lobbies on in the game editor. Publish the Luau pack with the CLI:

```bash
chauffeur lobby publish --dir .
chauffeur lobby list
chauffeur lobby status
```

Packs are Luau only.
