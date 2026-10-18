---
slug: /engines
title: Engines
sidebar_label: Engines
sidebar_position: 8.1
description: Godot, Unity, and Unreal bindings for login, lobbies, bugs, ownership, progress, and the dedicated server.
---

# Engines

A Blazium game uses the engine module. A game on Godot, Unity, or Unreal uses the binding for that engine. All three are MIT licensed.

macOS has no player build of the native library. An `sdk-*` tag publishes the full SDK drop and two player-library zips on that same tag. A `templates-*` tag publishes the engine host, not the player library.

| Zip | Contents |
| --- | --- |
| `redistributable-win64.zip` | `blazium_api64.dll` and `blazium_api64.lib` |
| `redistributable-linux64.zip` | `libblazium_api.so` |

Unity and Unreal copy the library out of those zips. The Godot addon does not load it.

## Godot

The addon is [blazium-games/games_plugin](https://github.com/blazium-games/games_plugin). Download `blazium_games-<version>.zip` from a release, or copy `addons/blazium_games` from the repository. Enable the plugin and set the project setting `blazium/game/game_uid` to the project id.

The addon signs in on the login websocket, then uses that session for the lobby and for peer connections. Sign-in and lobbies are described in [Multiplayer](./multiplayer.md). It talks to Blazium over HTTP. It does not ship the native library.

`server_progress` is the only call that uses `await`. Every other call returns through a signal. `record_standard_events` posts `session_start`, `session_end`, `boot_ok`, `first_input`, `quit`, and `crash` in one request with zero times. It is not a hook for each of those moments.

`transfer_item` is the player call. `socket_item`, `unsocket_item`, `set_item_stats`, and `use_item` fail on a player session. Those need the owner, an accepted admin, or a mint key. Unity and Unreal forward those four to the library, and the server still rejects a player session.

Inside a Discord activity, the addon proxies login, lobby, and API.

## Unity

The package is [blazium-games/games_unity](https://github.com/blazium-games/games_unity). The package name is `com.blazium.games`. Download `com.blazium.games-<version>.tgz` and install it with Package Manager (**Add package from tarball**), or copy the package into the project as `Packages/com.blazium.games`. Package Manager can import the Client and Dedicated server samples.

Put `blazium_api64.dll` or `libblazium_api.so` from the redistributable zip in `Assets/Plugins/x86_64`. Put `game.blaze` beside the built player. Add a `BlaziumTick` component to one object. It calls `RunCallbacks` from `Update`. Do not also call `RunCallbacks` every frame.

Do not call `BlaziumApi.Init` and `BlaziumGameServer.Init` in the same process.

The public `ReportBug` method always sends the in-game report. An empty build id and an empty screenshot path omit those parts. The screenshot path check lives in the engine host, not in the C# wrapper. This package does not proxy a Discord activity.

## Unreal

The plugin is [blazium-games/games_unreal](https://github.com/blazium-games/games_unreal). Copy the `BlaziumGames` folder from `BlaziumGames-<version>.zip` to `Plugins/BlaziumGames` and enable Blazium Games. Windows (`Win64`) and Linux are the supported targets.

Put `blazium_api64.dll` or `libblazium_api.so` from the redistributable zip, and `game.blaze`, beside the game executable. `UBlaziumSubsystem` calls `RunCallbacks` while a session is open. Do not also call it every frame. Blueprint nodes are in the Blazium category.

Do not call client init and dedicated-server init in the same process.

`ReportBug` always sends the in-game report. An empty build id and an empty screenshot path omit those parts. The screenshot path check lives in the engine host, not in the plugin. This plugin does not proxy a Discord activity.

## game.blaze

UTF-8 JSON beside the player executable. Unity and Unreal do not write this file. The Godot addon uses the project setting instead.

```json
{
  "game_uid": "550e8400-e29b-41d4-a716-446655440000"
}
```

`game_uid` is the project id on blazium.games. No other keys are allowed.

The native library talks to the Blazium launcher on the player's machine. The Unity package and the Unreal plugin do not call `api.blazium.online`. Lobby, ICE, Steam ticket, and bug report calls return JSON.

## Bug reports

The short call is `report_bug`. It sends the message, version, OS, architecture, and an optional log. The in-game call is `report_ingame_bug` on the engine and `ReportInGameBug` on the native library. Godot, Unity, and Unreal expose that in-game call as `report_bug` or `ReportBug` when a build id or screenshot path is set. That call sends `X-Build-Id`, the log, and the screenshot. The short call does not.

A screenshot path has to stay under the game user directory (`user://` on Godot) and stops at 32 MiB. The service redacts the log before storage. See [Bug reporter](./bug-reporter.md).

## Shared calls

Godot, Unity, and Unreal share ownership, achievement unlocks, stat writes, funnel events, a progress read of unlocks and stat values, `SetPresence` when the client may write presence, and the patch-note pull described in [Deploy builds](./deploy.md).

The Godot addon also transfers an item. Unity and Unreal export the item calls and the server progress read. `record_standard_events` on all three is one batch with zero times, the same kind of call the native library makes.

Inside a Discord activity, only the Blazium module and the Godot addon open the proxied login, lobby, and API addresses. Unity and Unreal do not. See [Multiplayer](./multiplayer.md).
