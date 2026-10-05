---
title: The desktop app
sidebar_position: 6
description: Download the Blazium Games desktop app for Windows to install, update and launch your library.
---

# The desktop app

The Blazium Games desktop app installs, updates and launches the games in your library. It is not Blazium Hub. Hub installs editors.

## Download it

Download the latest Windows setup from the [launcher releases](https://github.com/blazium-games/games_launcher/releases). Windows 10 or 11, 64-bit. The app is `BlaziumGames.exe` under `Blazium Games`.

A Linux package is not in the current release. macOS is not supported.

If `blazium-cli` is already installed, the installer leaves Hub's `blazium://` handler and `hub_remote.json` alone and writes `launcher_remote.json` instead.

## What it does

- **Library**: browse and launch purchased and free games.
- **Friends**: the friends window.
- **Chat**: game chat on `irc.blazium.online` port 6697. See [Game chat](./chat.md).
- **Links**: `blazium://install/<game>`, `blazium://game/<game>`, and `blazium://buy/<game>` open in this app. `blazium://buy` does not install. `blazium://hub` and `blazium://install?version=` stay with Hub.

## For developers

Upload builds with `npm install -g @blazium-games/cli` (`chauffeur`). Source: [blazium-games/games_cli](https://github.com/blazium-games/games_cli). The command has builds for Windows, Linux, and macOS (Apple Silicon and Intel). See the [chauffeur CLI](../cli/index.md).
