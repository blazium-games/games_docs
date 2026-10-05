---
title: The desktop app
sidebar_position: 6
description: Download the Blazium Games desktop app for Windows or Linux to install, update and launch your library.
---

# The desktop app

The Blazium Games desktop app installs, updates and launches the games in your library.

## Download it

Install the Windows setup or the Linux package from the [launcher releases](https://github.com/blazium-games/games_launcher/releases). The Windows app is `BlaziumGames.exe` under `Blazium Games`. The Linux package installs under `/opt/blazium-games`.

This app is not Blazium Hub. If `blazium-cli` is already installed, the installer leaves Hub's `blazium://` handler and `hub_remote.json` alone and writes `launcher_remote.json` instead.

Requirements: Windows 10 or 11 (64-bit), or Linux (64-bit). macOS is not supported yet.

## What it does

- **Library**: browse and launch purchased and free games.
- **Friends**: the friends window.
- **Chat**: game chat on `irc.blazium.online` port 6697. See [Game chat](./chat.md).
- **Links**: `blazium://install/<game>`, `blazium://game/<game>`, and `blazium://buy/<game>` open in this app. `blazium://buy` does not install. `blazium://hub` and `blazium://install?version=` stay with Hub.

## For developers

The same page links to the chauffeur command-line tool, which uploads builds. It has builds for Windows, Linux and macOS (Apple Silicon and Intel). See the [chauffeur CLI](../cli/index.md).
