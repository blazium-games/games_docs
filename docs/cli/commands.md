---
title: Commands
sidebar_position: 4
description: Every chauffeur command and flag, with examples.
---

# Commands

Every command also takes the [global flags](./index.md#global-flags) (`--access`, `--secret-stdin`, `--url`, `--upload`, `--json`). `chauffeur <command> --help` prints the same reference, and `chauffeur gendocs --dir <folder>` writes it as Markdown so it always matches your binary.

## Builds and files

### `chauffeur build`

Create builds from a `build.yml` (one `build_id` per platform), with release notes, and optionally upload symbols and store images.

```bash
chauffeur build --asset build.yml [flags]
```

| Flag | Meaning |
|------|---------|
| `--asset` | Path to build.yml (required) |
| `--os`, `--arch`, `--channel` | Replace the file's platforms with this one (`--arch` defaults to `x86_64`) |
| `--app`, `--app-name` | The [app](./configuration.md#apps) the build belongs to, overriding the file. Default: the main app |
| `--engine-version` | Engine version, like `4.3` or `4.3.0-beta.2` |
| `--symbols` | A `.sym` file, a folder of `.sym` files, or a `.zip` to upload for the build (needs a single platform) |

```bash
chauffeur build --asset build.yml
chauffeur build --asset build.yml --os windows --arch x86_64 --symbols build/symbols
chauffeur build --asset build.yml --engine-version 4.3 --json
```

### `chauffeur addfiles`

Zip, checksum and upload one platform's files from an `addfiles.yml`. It adds them to the matching build, or creates the build if none matches. See [Uploads](./uploads.md) for how large files are sent.

```bash
chauffeur addfiles --asset addfiles.yml [flags]
```

| Flag | Meaning |
|------|---------|
| `--asset` | Path to addfiles.yml (required) |
| `--os`, `--arch`, `--channel` | Override the file's platform |
| `--app`, `--app-name` | Override the file's [app](./configuration.md#apps) |
| `--engine-version` | Engine version, used when the build is created |
| `--symbols` | Symbols to upload for the build after the files |

```bash
chauffeur addfiles --asset addfiles.yml
chauffeur addfiles --asset addfiles.yml --os linux --arch arm64 --channel beta
chauffeur addfiles --asset addfiles.yml --symbols build/game.sym --json
```

### `chauffeur genbuild`

Write a starter `build.yml` in the current folder.

| Flag | Meaning |
|------|---------|
| `--version` | Build version (default `0.0.1`, up to 32 characters) |
| `--engine-version` | Engine version |
| `--app`, `--app-name` | Write this [app](./configuration.md#apps) into the file |
| `--images` | Folder of gallery images (PNG, JPEG, GIF, WebP) to add to `media.gallery` |

```bash
chauffeur genbuild --version 1.0.0 --engine-version 4.3 --images art/screenshots
```

### `chauffeur addchangelog`

Append a changelog entry to `build.yml` in the current folder (up to 100 entries).

```bash
chauffeur addchangelog --title "Fixed saves" --description "Saves no longer corrupt on exit."
```

Both `--title` and `--description` are required.

### `chauffeur setfiles`

Write a starter `addfiles.yml` in the current folder.

| Flag | Meaning |
|------|---------|
| `--files` | Folder whose files are all added |
| `--os` | Default `windows` |
| `--arch` | Default `x86_64` |
| `--channel` | Default `stable` |
| `--version` | Default `0.0.1` |
| `--type` | Build type (default `game`) |
| `--engine-version` | Engine version |
| `--app`, `--app-name` | Write this [app](./configuration.md#apps) into the file |
| `--symbols` | Symbols path to record in the file |

```bash
chauffeur setfiles --files build/windows --os windows --arch x86_64 --version 1.0.0
chauffeur setfiles --files build/linux --os linux --symbols build/symbols
```

## Symbols

### `chauffeur symbols`

Upload Breakpad `.sym` files for a build so its crash reports show function names and lines. See [Symbols](./symbols.md).

```bash
chauffeur symbols --build-id <build-id> <file.sym|symbols-folder|symbols.zip>
```

```bash
chauffeur symbols --build-id 5f1c2d3e-0000-4000-8000-000000000000 build/game.sym
chauffeur symbols --build-id "$BLAZIUM_GAMES_BUILD_ID" build/symbols/
```

## Store images

All `media` commands act on the game that owns the deploy key. See [Store images](./media.md) for sizes and rules.

| Command | What it does |
|---------|--------------|
| `chauffeur media list` | Show the cover, thumbnail and gallery with each image's uid |
| `chauffeur media cover <image>` | Replace the cover |
| `chauffeur media thumbnail <image>` | Replace the thumbnail |
| `chauffeur media add <image>... [--position N]` | Add 1 to 10 gallery images, appended or inserted at index `N` (0 is first) |
| `chauffeur media delete <image-uid\|cover\|thumbnail>` | Delete a gallery image, or clear the cover or thumbnail |
| `chauffeur media move <image-uid> --to N` | Move one gallery image to index `N` |
| `chauffeur media order <image-uid>...` | Set the whole gallery order; list every gallery uid once |

```bash
chauffeur media list --json
chauffeur media cover art/cover.png
chauffeur media add shots/*.png --position 0
chauffeur media move 5f1c2d3e-0000-4000-8000-000000000000 --to 2
```

## Game info

### `chauffeur info`

Show the game the deploy key belongs to: name, store URL, visibility, what still blocks a public listing, images, build count, channels, and the service's upload limits. Use it to check a key before a CI run.

```bash
chauffeur info
chauffeur info --json
```

### `chauffeur builds list`

List the game's builds, newest first, with their files and how many symbol files each has.

| Flag | Meaning |
|------|---------|
| `--version` | Only this version (exact match) |
| `--os`, `--arch`, `--channel` | Only this platform or channel |
| `--page` | Page number, 1 to 10,000 (default 1) |
| `--page-size` | Builds per page, 1 to 100 (default 20) |

```bash
chauffeur builds list
chauffeur builds list --os windows --channel beta
chauffeur builds list --version 1.2.0 --json
```

## Scripted lobbies

Turn scripted lobbies on in the game editor, then publish the Luau pack:

```bash
chauffeur lobby publish --dir .
chauffeur lobby list
chauffeur lobby status
```

See [Multiplayer](../multiplayer.md).

## Shell completion

`chauffeur completion bash|zsh|fish|powershell` prints a completion script. For example, `chauffeur completion powershell | Out-String | Invoke-Expression`.

## What chauffeur doesn't do

Promoting builds between channels, rolling back, changing prices and editing store page text happen on the website or through [MCP](../mcp/index.md). A deploy key can't do them.
