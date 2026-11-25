---
title: Unity and the native library
sidebar_label: Unity DLL
sidebar_position: 8.2
description: Install the Unity package, place the native DLL, and call init, auth, ownership, achievements, and the dedicated server.
---

# Unity and the native library

The Unity package is [blazium-games/games_unity](https://github.com/blazium-games/games_unity). The package name is `com.blazium.games`, version 2.2.0, for Unity 2021.3. It is MIT licensed. It is a thin binding over the native library in [blazium-games/games_sdk](https://github.com/blazium-games/games_sdk). That library's `BLAZIUM_SDK_VERSION` is `2.2.0`. The standalone calls need 2.2.0; an older library answers `sdk_too_old` to them.

This page is the launcher path. A game that ships outside the launcher (web, mobile, console, or its own store build) signs the player in with `BlaziumPlayerSession` or the SDK's standalone mode instead; see [Sign-in without the launcher](./standalone-sign-in.md). On the launcher path the DLL does not call `api.blazium.online`. `BlaziumAPI_Init` and `BlaziumGameServer_Init` read `game.blaze`, then connect to a running Blazium host over `\\.\pipe\blazium` on Windows, or `$XDG_RUNTIME_DIR/blazium.sock` on Linux (otherwise `/tmp/blazium.sock`). That host is `games_module`, compiled into the Windows and Linux export templates. macOS has no player build of the library. This package does not proxy a Discord activity.

Godot uses [games_plugin](https://github.com/blazium-games/games_plugin) and does not load this library. Unreal uses [games_unreal](https://github.com/blazium-games/games_unreal) and loads the same library from beside the game executable. The short comparison is on [Engines](./engines.md).

## Install the package

Download `com.blazium.games-<version>.tgz` from a [release](https://github.com/blazium-games/games_unity/releases) and install it with Package Manager (**Add package from tarball**), or copy the package into the project as `Packages/com.blazium.games`.

Package Manager can import two samples:

| Sample | What it does |
| --- | --- |
| Client | Calls `BlaziumApi.Init`, reads the logged-on user, creates a lobby with type `public`, sends one bug report, and shuts down. A shipping scene does not shut down in `Start`. |
| Dedicated server | Calls `BlaziumGameServer.Init(27015, "1.0.0")`, `LogOn`, reads the server id and one progress row, and shuts down. |

A push to `master` publishes the UPM tarball. A `templates-*` tag is the engine host, not this library. An `sdk-*` tag publishes the full SDK drop and two player-library zips on that same tag.

## Install the DLL

| Zip | Put this file in `Assets/Plugins/x86_64` |
| --- | --- |
| `redistributable-win64.zip` | `blazium_api64.dll` (the zip also contains `blazium_api64.lib`) |
| `redistributable-linux64.zip` | `libblazium_api.so` |

The SDK drop lays the same binaries out as `redistributable_bin/win64/` and `redistributable_bin/linux64/`. Windows output name is `blazium_api64`. Linux output name is `libblazium_api.so`. The Unity binding loads `blazium_api64` on Windows (`UNITY_EDITOR_WIN`, `UNITY_STANDALONE_WIN`, or `BLAZIUM_WINDOWS`) and `blazium_api` on every other target.

To build the shared library from games_sdk:

```bash
cmake -S . -B build
cmake --build build --config Release
ctest --test-dir build -C Release
```

Binaries are not committed. Ship `blazium_api64.dll` or `libblazium_api.so` next to the game executable, with `game.blaze`. On Windows, link `blazium_api64.lib`. Include `public/` on the header path. Headers are `public/blazium/blazium_api.h` for clients and `public/blazium/blazium_gameserver.h` for dedicated servers.

If the DLL is missing, `BlaziumApi.Init` and `BlaziumGameServer.Init` return `FailedGeneric` and the error `blazium_api64.dll or libblazium_api.so is missing`. Linking the import library makes the operating system refuse to start the process when the DLL is missing.

## Configure `game.blaze`

UTF-8 JSON beside the player executable. The library checks the working directory only when the executable directory has no file. Unity does not write this file. The schema allows no other keys. `game_uid` is the project id on blazium.games, the same value as `BLAZIUM_GAMES_APP_ID`.

```json
{
  "game_uid": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Initialize

Add one `BlaziumTick` to one object. It calls `RunCallbacks` from `Update`. Do not also call `RunCallbacks` every frame.

Do not call `BlaziumApi.Init` and `BlaziumGameServer.Init` in the same process. The second call returns `FailedGeneric` and the error `Do not call client init and dedicated-server init in the same process.`

```csharp
string error;
BlaziumInitResult result = BlaziumApi.Init(out error);
if (result != BlaziumInitResult.OK)
{
    Debug.LogError("Blazium init failed: " + (int)result + " " + error);
    return;
}
```

`BlaziumInitResult` matches `EBlaziumAPIInitResult` in `blazium_api_common.h`.

| Value | Name | When the native library returns it |
| --- | --- | --- |
| 0 | `OK` | Init succeeded |
| 1 | `FailedGeneric` | Any other failure, including a missing DLL or calling both inits in one process |
| 2 | `NoHost` | The launcher is not running |
| 3 | `VersionMismatch` | Defined on the enum. The games_sdk README does not say when this value is returned |
| 4 | `NoConfig` | `game.blaze` is missing |
| 5 | `InvalidConfig` | `game.blaze` does not match `public/blazium/blaze.schema.json` |
| 6 | `NotLoggedOn` | The launcher is running and nobody is logged in |
| 7 | `UnknownGame` | `game_uid` is not a blazium.games project |
| 8 | `NotOwned` | The logged-in user has no active license |

The DLL cannot start a login and does not browse the catalog. After a successful client init, call `BlaziumAPI_RunCallbacks` from the game loop and exit if `BLoggedOn()` becomes false. That call also reports playtime for the signed-in user. `BlaziumTick` is the Unity call. `BlaziumApi.Shutdown` runs only while a client session is open.

`blazium_api.h` says returned C strings stay valid for the last eight calls on the same thread and are cleared by Shutdown. The games_sdk README says string pointers are valid until the next SDK call on this thread. The Unity binding copies the bytes into a managed string before it returns.

## Auth

A client init that returns `OK` still has to have a logged-on user (on the launcher path; a `"mode": "standalone"` game gets `OK` with nobody signed in, then calls `StartLogin` and reads `LoginState`). The client sample shuts down and logs an error when `BlaziumUser.IsLoggedOn()` is false.

| Method | Returns |
| --- | --- |
| `IsLoggedOn()` | Whether the launcher session is logged on. False when no client session is open. |
| `UserUid()` | Account id |
| `DisplayName()` | Display name |
| `AvatarUrl()` | Avatar URL |
| `Username()` | Username |
| `GameUid()` | `game_uid` from `game.blaze` |

`SignInWithSteamTicket(ticket)` returns the library's JSON string. `SteamId()` and `SteamExpires()` return the strings the library last stored for that session. Calls made with no client session open return an empty string.

## Ownership

`BlaziumUser.Ownership(edition, listingUid)` returns the library's JSON string. Both arguments default to an empty string.

## Achievements, stats, and events

| Method | What it sends |
| --- | --- |
| `UnlockAchievement(slug)` | Unlocks that achievement slug |
| `SetStat(slug, value)` | Writes a stat. `value` is a 64-bit integer |
| `RecordEvent(name)` | Records one funnel event |
| `RecordStandardEvents(buildId, deviceUid)` | One batch of launch events with zero times. `deviceUid` defaults to `unity`. It is not a hook for each moment. |
| `Progress()` | Reads unlocks and stat values |
| `SetPresence(status)` | Sets presence when the client may write presence |

## Bugs, patch notices, and items

`ReportBug(message, clientVersion, osName, arch, logText, buildId, screenshotPath)` always calls the in-game report. `buildId` and `screenshotPath` default to empty, and an empty value omits that part. The screenshot path check lives in the engine host, not in the C# wrapper. The service redacts the log before storage.

`BugNotices()` and `AckBugNotices(uidsJson)` read and acknowledge bug notices. `PatchNotices()` and `AckPatchNotices(uidsJson)` do the same for patch notices. `uidsJson` is a JSON string.

`TransferItem` is the player call. `SocketItem`, `UnsocketItem`, `SetItemStats`, and `UseItem` are forwarded to the library. The server still rejects those four on a player session. They need the owner, an accepted admin, or a mint key.

## Tokens for the Scripted API and lobbies

| Method | Returns |
| --- | --- |
| `RequestToken(audience)` | The library's JSON string for `"sapi"` or `"lobby"`: `ok`, `token`, `audience`, `game_uid`, `expires_at` and `expires_in`, or `ok: false` with `code` and `error`. |
| `ForgetTokens()` | Drops held tokens, so the next request asks again. Call it after a `401`. |

The library asks the host for the token and the host asks the platform. The package never mints a token and never sees the login token. A token is for this game and one audience, and it expires within minutes. Failure codes include `bad_audience`, `not_logged_on`, `no_host`, `server_mode`, `user_changed` and `host_too_old` (the engine build is older than tokens). A library older than SDK 2.1.0 returns `sdk_too_old`. `BlaziumSapi` and `BlaziumUnitySapi.Create()` use these calls for you; see [Scripted API](./scripted-api.md#calling-from-a-game). Without a client session, or in a dedicated server, no token is given.

## Lobbies

These return the library's JSON string. The client sample passes `public` to `CreateLobby`.

| Method | Argument |
| --- | --- |
| `CreateLobby(lobbyType)` | Lobby type string |
| `JoinLobby(lobbyId)` | Lobby id |
| `LobbyStatus(lobbyId)` | Lobby id |
| `FetchIce(sessionId)` | Session id |
| `LobbySeat()` | None |
| `LeaveLobby()` | None |

## Dedicated server

`BlaziumGameServer.Init` uses the same `game.blaze` and requires the host process. It confirms the project exists. It does not require a logged-in player or a license, and it does not report playtime.

```csharp
string error;
BlaziumInitResult result = BlaziumGameServer.Init(27015, "1.0.0", out error);
if (result != BlaziumInitResult.OK)
{
    Debug.LogError("Blazium server init failed: " + (int)result + " " + error);
    return;
}
BlaziumGameServer.LogOn();
```

`LogOn` returns whether the call succeeded. `IsLoggedOn`, `ServerId`, `LogOff`, and `Shutdown` follow the server session. `Shutdown` runs only while a server session is open.

`UnlockAchievement`, `SetStat`, `RecordEvent`, and `Progress` on `BlaziumGameServer` take a server key and a user id. Each returns an empty string unless the player is built with `UNITY_SERVER`. The dedicated-server sample calls `Progress("server-key", "player-uid")` as a stand-in for those two strings.

The C API entry for a dedicated server is `BlaziumGameServer_InitEx(port, version, &err)`. Do not call it in the same process as `BlaziumAPI_Init`.
