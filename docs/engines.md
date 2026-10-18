---
slug: /engines
title: Engines
sidebar_label: Engines
sidebar_position: 8.1
description: Godot, Unity, and Unreal bindings for init, the logged-on user, lobbies, a Steam ticket, and bug reports.
---

# Engines

A Blazium game uses the engine module. A game on Godot, Unity, or Unreal uses the binding for that engine. All three cover init, callbacks, the logged-on user, lobbies, a Steam ticket, and a bug report.

macOS has no player build of the native library. An `sdk-*` tag publishes the full SDK drop and two player-library zips on that same tag: `redistributable-win64.zip` (`blazium_api64.dll` and `blazium_api64.lib`) and `redistributable-linux64.zip` (`libblazium_api.so`). Unity and Unreal copy the library out of those zips. A `templates-*` tag publishes the engine host, not the player library.

The short call is `report_bug`. It sends the message, version, OS, architecture, and an optional log. The in-game call is `report_ingame_bug` on the engine, `ReportInGameBug` on the native library, and the same `report_bug` entry point on Godot, Unity, and Unreal when a build id or screenshot path is set. That call sends `X-Build-Id`, the log, and the screenshot. The short call does not.

## Godot

Copy `addons/blazium_games` into the project, enable the plugin, and set the project setting `blazium/game/game_uid` to the project id. The addon signs in, then uses that session for the lobby and for peer connections. Sign-in and lobbies are described in [Multiplayer](./multiplayer.md).

The addon is [blazium-games/games_plugin](https://github.com/blazium-games/games_plugin).

## Unity

The package name is `com.blazium.games`. Install a release tarball with Package Manager (**Add package from tarball**), or copy the package into the project as `Packages/com.blazium.games`. Package Manager can import the Client and Dedicated server samples.

Put `blazium_api64.dll` or `libblazium_api.so` from `redistributable-win64.zip` or `redistributable-linux64.zip` in `Assets/Plugins/x86_64`. Put `game.blaze` beside the built player. Add a `BlaziumTick` component to one object. It calls `RunCallbacks` from `Update`. Do not also call `RunCallbacks` every frame.

Do not call `BlaziumApi.Init` and `BlaziumGameServer.Init` in the same process.

The package is [blazium-games/games_unity](https://github.com/blazium-games/games_unity).

## Unreal

Copy the `BlaziumGames` folder from a release zip to `Plugins/BlaziumGames` and enable Blazium Games. Windows (`Win64`) and Linux are the supported targets.

Put `blazium_api64.dll` or `libblazium_api.so` from `redistributable-win64.zip` or `redistributable-linux64.zip`, and `game.blaze`, beside the game executable. `UBlaziumSubsystem` calls `RunCallbacks` while a session is open. Do not also call it every frame. Blueprint nodes are in the Blazium category.

Do not call client init and dedicated-server init in the same process.

The plugin is [blazium-games/games_unreal](https://github.com/blazium-games/games_unreal).

## game.blaze

UTF-8 JSON beside the player executable. Unity and Unreal do not write this file.

```json
{
  "game_uid": "550e8400-e29b-41d4-a716-446655440000"
}
```

`game_uid` is the project id on blazium.games. No other keys are allowed.

The native library talks to the Blazium launcher on the player's machine. The Unity package and the Unreal plugin do not call `api.blazium.online`. Lobby, ICE, Steam ticket, and bug report calls return JSON. File a bug with [the in-game reporter](./bug-reporter.md).

Godot, Unity, and Unreal also share ownership, achievement unlocks, stat writes, funnel events, `Progress()` to read unlocks and stat values, `SetPresence` when the client may write presence, and the patch-note pull described in [Deploy builds](./deploy.md).

Inside a Discord activity, only the Blazium module and the Godot addon open the proxied login, lobby, and API addresses. Unity and Unreal do not. See [Multiplayer](./multiplayer.md).
