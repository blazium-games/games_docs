---
title: Configuration
sidebar_position: 3
description: The build.yml and addfiles.yml schema for chauffeur, with every key, type, default and limit.
---

# Configuration

chauffeur reads two YAML files. `build.yml` registers builds and their release notes, and can upload symbols and store images. `addfiles.yml` uploads the files of one platform build. `chauffeur genbuild` and `chauffeur setfiles` write starter versions.

Both files start with:

| Key | Value |
|-----|-------|
| `version` | `v1` (the only version) |
| `spec` | `build` or `addfiles` |
| `asset` | The fields below |

Everything is validated locally before chauffeur sends anything; a bad value exits with code `1`.

## Platform values

| Field | Allowed values |
|-------|----------------|
| `os` | `windows`, `macos`, `linux`, `android`, `ios`, `web`. `darwin`, `mac` and `osx` mean `macos`; `win`, `win32` and `win64` mean `windows` |
| `arch` | `x86_64`, `x86`, `arm64`, `arm32`, `arm`, `universal`, `wasm32`, `wasm`. `amd64` and `x64` mean `x86_64`; `aarch64` means `arm64` |
| `channel` | 1 to 32 lowercase letters, digits, `-` or `_`, starting with a letter or digit. Default `stable` |

## Apps

One project can ship more than one app, for example the game plus a dedicated server or a level editor. Each app has its own builds and its own channels, and the store page groups downloads by app ("Download Server for Windows"). Leave `app` out for the project's main app; existing files keep working unchanged.

| Key | Type | Limit and notes |
|-----|------|-----------------|
| `app.id` | string | 1 to 32 lowercase letters, digits or `-`, starting with a letter or digit, for example `server` |
| `app.name` | string | Optional display name on the downloads, up to 80 characters. Needs `app.id` |

`--app` and `--app-name` on `build`, `addfiles`, `genbuild` and `setfiles` set the same values, and on `build` and `addfiles` they override the file. A build is only matched and reused within its own app, and a `build_id` from another app is refused. Clean files of a non-main app are stored as `<game>-<app>-<channel>-<os>-<arch>.zip`.

```yaml
version: v1
spec: addfiles
asset:
  type: game
  version: 1.2.0
  app:
    id: server
    name: Dedicated server
  os: linux
  arch: x86_64
  channel: stable
  files:
    - file: export/server/MyGameServer.x86_64
```

A tool that is its own product, such as a mod manager sold separately, is better as its own [listing](../listings.md#listing-types) of type `tool` with the game as its parent.

## build.yml (`spec: build`)

| Key | Type | Required | Limit and notes |
|-----|------|----------|-----------------|
| `title` | string | yes | Up to 255 characters. Shown as the release title |
| `type` | string | yes | Build type, usually `game`. `asset_type` is an old name for it and prints a warning |
| `description` | string | yes | Up to 10,000 characters |
| `version` | string | yes | Up to 32 characters, for example `1.2.0` |
| `engine_version` | string | no | Blazium or Godot version the build was made with: `4.3`, `4.3.1` or `4.3.0-beta.2`. Used by [mod compatibility](../listings.md#works-with) |
| `platforms` | list | no | Each item has `os` (required), `arch` (default `x86_64`) and `channel`. Each platform becomes its own build with its own `build_id` |
| `os`, `arch`, `channel` | string | no | A single platform, instead of `platforms` |
| `app` | map | no | `id` and `name` of the [app](#apps) the build belongs to. Default: the main app |
| `video` | string | no | Trailer or demo URL: `http` or `https`, up to 255 characters |
| `changelog` | list | no | Up to 100 items, each with `title` and `description` |
| `symbols` | string | no | A `.sym` file, a folder of `.sym` files, or a `.zip`. Needs exactly one platform. See [Symbols](./symbols.md) |
| `media.cover` | string | no | Image path. Replaces the cover |
| `media.thumbnail` | string | no | Image path. Replaces the thumbnail |
| `media.gallery` | list | no | Image paths added to the gallery. With `images`, at most 20 |
| `images` | list | no | Older name for `media.gallery` |

The `--os`, `--arch` and `--channel` flags of `chauffeur build` replace the file's platforms with one, which suits a CI matrix. `--engine-version` and `--symbols` override the file.

Registering the same version, type, app, OS, arch and channel again updates that build: its title, description and changelog are replaced by the file's.

```yaml
version: v1
spec: build
asset:
  title: "1.2.0: Winter update"
  type: game
  description: "Snow levels, controller rebinding, and save fixes."
  version: 1.2.0
  engine_version: "4.3"
  platforms:
    - os: windows
      arch: x86_64
      channel: stable
    - os: linux
      arch: x86_64
      channel: stable
  video: https://www.youtube.com/watch?v=example
  changelog:
    - title: "Snow levels"
      description: "Three new levels in the north."
    - title: "Fixed saves"
      description: "Saves no longer corrupt on exit."
  media:
    cover: art/cover.png
    thumbnail: art/thumbnail.png
    gallery:
      - art/shot1.png
      - art/shot2.png
```

## addfiles.yml (`spec: addfiles`)

| Key | Type | Required | Limit and notes |
|-----|------|----------|-----------------|
| `type` | string | yes | Build type, usually `game` |
| `version` | string | yes | Up to 32 characters |
| `os` | string | yes | See [platform values](#platform-values) |
| `arch` | string | yes | See [platform values](#platform-values) |
| `channel` | string | yes | See [platform values](#platform-values) |
| `app` | map | no | As in build.yml |
| `engine_version` | string | no | As in build.yml. Used only when `addfiles` creates the build |
| `symbols` | string | no | Symbols to upload for this build after the files |
| `files` | list | yes | Each item is `file: <path>`. The files are zipped (up to 5 GB zipped) with their folders kept |

If a build with the same version, type, app, OS, arch and channel exists, for example from `chauffeur build`, the files are added to it and its notes are kept. Otherwise `addfiles` creates the build, titled `<version> <os>/<arch>`.

```yaml
version: v1
spec: addfiles
asset:
  type: game
  version: 1.2.0
  os: windows
  arch: x86_64
  channel: stable
  symbols: build/symbols
  files:
    - file: export/windows/MyGame.exe
    - file: export/windows/MyGame.pck
```

`chauffeur setfiles --files export/windows --os windows --arch x86_64 --version 1.2.0` writes this file with every file in the folder.
