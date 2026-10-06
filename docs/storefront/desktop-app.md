---
title: The desktop app
sidebar_position: 6
description: Download BlaziumLauncher for Windows to install, update and launch your library.
---

# The desktop app

BlaziumLauncher installs, updates and launches the games in your library. It is not BlaziumHub. BlaziumHub installs editors and lives in `{autopf}\Blazium\Engine`.

## Download it

Download the latest Windows setup from the [launcher releases](https://github.com/blazium-games/games_launcher/releases). Windows 10 or 11, 64-bit. The program is `BlaziumLauncher.exe` under `{autopf}\Blazium\Games`. Shared tools live in `{autopf}\Blazium`.

A Linux package is not in the current release. macOS is not supported.

If `blazium-cli` is already installed, the installer leaves BlaziumHub's `blazium://` handler and `hub_remote.json` alone and writes `launcher_remote.json` instead. The BlaziumLauncher setup can also download BlaziumHub into the same folder.

## What it does

- **Library**: browse and launch purchased and free games.
- **Friends**: the friends window.
- **Chat**: friend messages and game chat on `irc.blazium.online` port 6697, one tab per friend and per game. It asks before sending a message or a game invite. See [Chat](../chat/index.md).
- **Links**: `blazium://install/<game>`, `blazium://game/<game>`, and `blazium://buy/<game>` open in BlaziumLauncher. `blazium://buy` does not install. `blazium://hub` and `blazium://install?version=` stay with BlaziumHub.

## For developers

Upload builds with `npm install -g @blazium-games/cli` (`chauffeur`). Source: [blazium-games/games_cli](https://github.com/blazium-games/games_cli). The command has builds for Windows, Linux, and macOS (Apple Silicon and Intel). See the [chauffeur CLI](../cli/index.md).
