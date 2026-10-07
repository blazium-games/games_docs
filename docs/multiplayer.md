---
sidebar_position: 8
---

# Multiplayer

A Blazium game uses the engine module. A game built on another Godot engine vendors the public `games_plugin` addon and sets `blazium/game/game_uid` to the project id from the editor.

## Sign-in

The game opens a websocket to `wss://login.blazium.online/api/v1/connect` with protocols `blazium` and the project id. It sends `getid`, then `getlogin`, and receives the session token. GitHub, X, Discord, and Steam are the providers a game can turn on.

## Lobby and connections

The lobby socket is `wss://lobby.blazium.online/`. ICE servers come from `https://stun.blazium.online/v1/ice`. Relay uses `turn.blazium.online`.

## Scripted lobbies

Turn scripted lobbies on in the game editor. Publish the Luau pack with the CLI:

```bash
chauffeur lobby publish --dir .
chauffeur lobby list
chauffeur lobby status
```

Packs are Luau only.
