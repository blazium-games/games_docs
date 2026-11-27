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

### `chauffeur bugs`

List bug reports for this deploy key's game. `--status` keeps one of `open`, `fixed`, `unidentified`, or `closed`. `--page` reads one page; otherwise every `next_page` is followed. The key cannot change status.

```bash
chauffeur bugs
chauffeur bugs screenshot bug_123 --out shot.png
chauffeur bugs log bug_123 --out game.log
chauffeur bugs pull bug_123 --dir ./bugs
```

See [Bug reports](./bugs.md).

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

Turn the lobby on, choose relay or scripted, and switch TURN. Pass at least one of `--enabled`, `--type`, or `--ice`:

```bash
chauffeur lobby set --enabled true --type scripted
chauffeur lobby set --ice false
chauffeur lobby publish --dir .
chauffeur lobby list
chauffeur lobby status
```

See [Multiplayer](../multiplayer.md).

## Scripted API

`chauffeur sapi` publishes and manages [Scripted API](../scripted-api.md) logic for the deploy key's game.

| Command | What it does |
|---------|--------------|
| `chauffeur sapi validate --dir <path> [--plan free]` | Check a pack against a plan's limits with the local engine |
| `chauffeur sapi test --dir <path>` | Run the pack's `*.test.luau` files |
| `chauffeur sapi dev --dir <path> [--port 8787] [--users users.json]` | Serve the pack at `http://127.0.0.1:8787/v1/dev/<logic>` and reload on change |
| `chauffeur sapi publish --dir <path> [--channel stable] [--activate]` | Zip every `.lua` and `.luau` file and upload it as a pack |
| `chauffeur sapi status` | Settings, active pack per channel, and the plan's limits |
| `chauffeur sapi packs` | Stored packs |
| `chauffeur sapi activate <checksum\|none> [--channel stable]` | Serve a stored pack on a channel, roll back, or stop the channel |
| `chauffeur sapi logs [--logic] [--channel] [--level] [--since] [--until] [--cursor] [--request-id] [--limit 200]` | Stored script logs. `--since` and `--until` take a time or how long ago (`30m`, `2h`, `7d`). A full page prints a `next_cursor` for `--cursor` |
| `chauffeur sapi analytics` | Calls, errors, refusals and latency, by logic and by day |
| `chauffeur sapi audit [--limit n] [--before id]` | Every change made to the Scripted API, newest first |
| `chauffeur sapi usage` | Stored data against the plan, and whether writes are blocked |
| `chauffeur sapi config get\|set <name> <json>\|delete <name> [--channel] [--public]` | Remote config values |
| `chauffeur sapi secret list\|set <name>\|delete <name> [--channel] [--from-file]` | Write-only secrets. `set` reads the value from stdin unless `--from-file` is given |
| `chauffeur sapi schedules` and `chauffeur sapi schedules run <logic>` | Scheduled logic, recent runs, and a run now |
| `chauffeur sapi data list\|get\|set\|delete [--scope global\|channel\|user] [--channel] [--user]` | Read and change stored data |
| `chauffeur sapi data export [--out file]` and `chauffeur sapi data import <file>` | Copy a scope to and from JSON |
| `chauffeur sapi data copy --channel <from> --to <to>` | Copy one channel's data into another |
| `chauffeur sapi data reset --scope global\|channel\|user [--channel] [--user] [--prefix] [--dry-run] --confirm <game id>` | Delete every key in a scope, or the keys under a prefix. `--dry-run` counts and changes nothing |
| `chauffeur sapi pull [checksum\|active\|latest] --dir <path> [--channel] [--force]` | Download a stored pack and unpack it for editing. A local file that differs is kept unless `--force` |
| `chauffeur sapi features` | Each [feature and capability](../scripted-api-features.md), and whether it is on for the game |
| `chauffeur sapi feature status\|history` | What the owner has turned on, and who changed it |
| `chauffeur sapi feature disable <feature> [--cascade]` | Turn a feature off. A deploy key can never turn one on |
| `chauffeur sapi feature enable <feature>` | Prints what to ask the game owner and the link they use. It changes nothing |

`validate`, `test` and `dev` run the `games_sapi` binary from `--binary`, `SAPI_BINARY`, `PATH` or chauffeur's cache. On Linux x86_64 chauffeur downloads it when none is found. A value that is not JSON is stored as a string. Secret values are at most 16 KiB; when the deploy secret also comes from stdin (`--secret-stdin`), pass the value with `--from-file`. `data reset` needs `--scope` and `--confirm` with the game's id. A deploy key cannot delete all of a game's data; do that on the website.

```bash
chauffeur sapi test --dir sapi
chauffeur sapi publish --dir sapi --channel beta --activate
chauffeur sapi config set motd '"Double XP this weekend"' --public
printf '%s' "$SHOP_SECRET" | chauffeur sapi secret set shop_hook
chauffeur sapi data get best --scope user --user 5f1c2d3e-0000-4000-8000-000000000000
```

## Progress

`chauffeur progress apply --file progress.yml` replaces each section the file includes: `achievements`, `stats`, `funnels`, and `presence_writers`. A missing section is left as it is. The file starts with `spec: progress`. `chauffeur progress show` prints the current definitions. `--json` works on both. Server keys are not in this file. See [Progress](../progress.md).

## Blog

`chauffeur blog` lists published posts, newest first. `chauffeur blog show <slug>` prints the title and the markdown. Both call the public articles API and do not need a deploy key. `--json` works on both.

```bash
chauffeur blog
chauffeur blog show pardon-our-dust
```

## Patrons

These commands use the signed-in account token (`BLAZIUM_USER_TOKEN` or `--user-token`), not a deploy key.

```bash
chauffeur patron status
chauffeur patron list
chauffeur patron get <username>
chauffeur patron tiers
chauffeur patron tier create --name Supporter --rank 1 --price-cents 500 --billing monthly
chauffeur patron tier update <uid> --name Supporter --price-cents 700 --active true
chauffeur patron tier delete <uid>
chauffeur patron posts
chauffeur patron post create --title Hello --body "A note" --status published --visibility public
chauffeur patron post update <uid> --title Hello --visibility tiers --tier <tier-uid>
chauffeur patron post delete <uid>
```

Rank, billing, and unlock stay fixed after a tier is created. `--active false` hides a tier that still has members.

## Shell completion

`chauffeur completion bash|zsh|fish|powershell` prints a completion script. For example, `chauffeur completion powershell | Out-String | Invoke-Expression`.

## What chauffeur doesn't do

Promoting builds between channels, rolling back builds, changing prices and editing store page text happen on the website or through [MCP](../mcp/index.md). A deploy key can't do them.

## Lobby data

`chauffeur lobby data`, `config`, `secret` and `usage` manage the [lobby data](../multiplayer.md#lobby-data) of a scripted lobby. It is a separate store from `chauffeur sapi data`, and needs the Grow or Scale plan.

| Command | Description |
|---------|-------------|
| `chauffeur lobby data list\|get\|set\|delete [--scope global\|channel\|user\|lobby] [--channel] [--user] [--lobby]` | Read and change stored data |
| `chauffeur lobby data export [--out file]` | Write a scope as JSON |
| `chauffeur lobby data reset --scope global\|channel\|user\|lobby [--dry-run] --confirm <game id>` | Delete many keys. A deploy key cannot delete all of a game's data |
| `chauffeur lobby config get\|set <name> <json>\|delete <name> [--channel] [--public]` | Remote config for lobby scripts |
| `chauffeur lobby secret list\|set <name>\|delete <name> [--channel] [--from-file]` | Write-only secrets, read with `secrets.get` |
| `chauffeur lobby usage` | Stored data against the plan |
| `chauffeur lobby analytics` | Lobbies opened, peaks, joins, requests turned away at the plan's caps, lobby data and script use |
| `chauffeur lobby audit [--limit n] [--before id]` | Every change to lobby data, newest first |
| `chauffeur lobby status` | Active pack, load result and the plan's lobby limits |