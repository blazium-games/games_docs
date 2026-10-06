---
title: The desktop app
sidebar_position: 6
description: Download BlaziumLauncher for Windows or Linux to install, update and launch your library.
---

# The desktop app

BlaziumLauncher installs, updates and launches the games in your library. It is not BlaziumHub. BlaziumHub installs editors and lives in `{autopf}\Blazium\Engine`.

## Download it

Both downloads are on the [launcher releases](https://github.com/blazium-games/games_launcher/releases) page.

- **Windows**: the setup (`BlaziumLauncher-Setup-<version>.exe`). Windows 10 or 11, 64-bit. The program is `BlaziumLauncher.exe` under `{autopf}\Blazium\Games`. Shared tools live in `{autopf}\Blazium`.
- **Linux**: the Debian package (`blazium-games_<version>_amd64.deb`), x86_64. Install it with `sudo apt install ./blazium-games_<version>_amd64.deb`. The program is `/opt/blazium/games/BlaziumLauncher`, with a menu entry.

macOS is not supported.

If `blazium-cli` or BlaziumHub is already installed, either installer leaves BlaziumHub's `blazium://` handler and `hub_remote.json` alone and writes `launcher_remote.json` instead. Otherwise BlaziumLauncher registers `blazium://` itself. The Windows setup can also download BlaziumHub into the same folder.

## What it does

- **Library**: browse and launch purchased and free games.
- **Friends**: the friends window.
- **Chat**: friend messages and game chat on `irc.blazium.online` port 6697, one tab per friend and per game. It asks before sending a message or a game invite. See [Chat](../chat/index.md).
- **Links**: `blazium://install/<game>`, `blazium://game/<game>`, and `blazium://buy/<game>` open in BlaziumLauncher. `blazium://buy` does not install. `blazium://hub` and `blazium://install?version=` stay with BlaziumHub.

## For developers

Upload builds with `npm install -g @blazium-games/cli` (`chauffeur`). Source: [blazium-games/games_cli](https://github.com/blazium-games/games_cli). The command has builds for Windows, Linux, and macOS (Apple Silicon and Intel). See the [chauffeur CLI](../cli/index.md).
