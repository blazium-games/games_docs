---
sidebar_position: 8
---

# Multiplayer

A Blazium game uses the engine module. A game built on another Godot engine vendors the public `games_plugin` addon and sets `blazium/game/game_uid` to the project id from the editor.

## Sign-in

The game opens a websocket to `wss://login.blazium.online/api/v1/connect` with protocols `blazium` and the project id. It sends `getid`, then `getlogin`, and receives the session token. GitHub, X, Discord, and Steam are the providers a game can turn on.

## Lobby and connections

Turn lobbies on in the game editor. Choose Relay or Scripted. Relay seats players without a pack. Scripted runs a published Luau pack. A separate switch turns TURN and STUN on or off for that game.

Create or join returns only after the player is admitted. The response includes `lobby_url`, `ice_enabled`, and, when TURN is on, `ice_session_id`. Connect to `lobby_url` after that call succeeds. The engine module and the SDK return the response and leave the socket to the game. The `games_plugin` addon opens it.

The lobby socket is `wss://lobby.blazium.online/`. ICE servers come from `https://stun.blazium.online/v1/ice` using `ice_session_id` from that response. Relay uses `turn.blazium.online`. When the TURN switch is off, the game does not request ICE.

## Scripted lobbies

Turn scripted lobbies on in the game editor. Publish the Luau pack with the CLI:

```bash
chauffeur lobby publish --dir .
chauffeur lobby list
chauffeur lobby status
```

Packs are Luau only.
