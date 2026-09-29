---
title: chauffeur CLI
sidebar_position: 1
description: Install chauffeur, the Blazium Games upload tool for builds, debug symbols and store images, and ship a first build in five commands.
---

# chauffeur CLI

`chauffeur` is the Blazium Games upload tool. Everything that sends files to the store goes through it or the [upload API](../deploy.md#2b-upload-with-the-api): builds, per-platform files, Breakpad debug symbols and store page images. The website and the MCP server can list and delete these, but they never upload them.

chauffeur authenticates with the game's [deploy key](./authentication.md), so it runs the same way on your machine and in CI.

## Install

Download the archive for your platform. Each one is a zip with the `chauffeur` binary and a `VERSION` file.

| Platform | Archive |
|----------|---------|
| Windows x86_64 | `https://cdn.blazium.online/tools/chauffeur/windows-amd64/latest/archive/default` |
| Linux x86_64 | `https://cdn.blazium.online/tools/chauffeur/linux-amd64/latest/archive/default` |
| Linux arm64 | `https://cdn.blazium.online/tools/chauffeur/linux-arm64/latest/archive/default` |
| macOS Apple silicon | `https://cdn.blazium.online/tools/chauffeur/darwin-arm64/latest/archive/default` |
| macOS Intel | `https://cdn.blazium.online/tools/chauffeur/darwin-amd64/latest/archive/default` |

To pin a version, replace `latest` with the version number from a `VERSION` file.

Linux and macOS:

```bash
curl -fsSL -o chauffeur.zip https://cdn.blazium.online/tools/chauffeur/linux-amd64/latest/archive/default
unzip -o chauffeur.zip chauffeur && chmod +x chauffeur
./chauffeur --version
```

Windows (PowerShell):

```powershell
Invoke-WebRequest -Uri https://cdn.blazium.online/tools/chauffeur/windows-amd64/latest/archive/default -OutFile chauffeur.zip
Expand-Archive -Force chauffeur.zip .
.\chauffeur.exe --version
```

On macOS, a binary downloaded with a browser may be quarantined. Remove the flag with `xattr -d com.apple.quarantine chauffeur`.

## Quickstart

Get a deploy key from your game's edit page (**Deploy keys** tab) and export it, then:

```bash
export BLAZIUM_ACCESS_TOKEN=...   # from the Deploy keys tab
export BLAZIUM_SECRET_KEY=...

chauffeur info                                              # 1. check the key and see what the listing still needs
chauffeur genbuild --version 1.0.0                          # 2. write build.yml, then edit its title and description
chauffeur build --asset build.yml --os windows --arch x86_64   # 3. register the build with its release notes
chauffeur setfiles --files ./export/windows --os windows --arch x86_64 --version 1.0.0   # 4. write addfiles.yml
chauffeur addfiles --asset addfiles.yml                     # 5. zip and upload the files to that build
```

Add release notes before step 3 with `chauffeur addchangelog --title "Launch" --description "First public build"`. You can skip steps 2 and 3: `addfiles` creates the build itself when none matches, titled after its version and platform.

`build` and `addfiles` print the `build_id` as `BLAZIUM_GAMES_BUILD_ID`. Put it in your game's crash reporter settings (see [Crash reporting](../crash-reporting.md)) and upload the build's [debug symbols](./symbols.md).

The game owner's email must be verified before any upload is accepted.

## Global flags

| Flag | Meaning |
|------|---------|
| `--access` | Deploy key access token; overrides `BLAZIUM_ACCESS_TOKEN` |
| `--secret-stdin` | Read the deploy key secret from the first line of stdin |
| `--secret` | Deploy key secret. Visible to other processes, so chauffeur warns; prefer the environment or `--secret-stdin` |
| `--url` | API base URL; overrides `BLAZIUM_API_URL` (default `https://api.blazium.online/api/v1`) |
| `--upload` | Upload service base URL; overrides `BLAZIUM_UPLOAD_URL` (default `https://uploader.blazium.online/api/v1`) |
| `--json` | Print the result, or the error, as one JSON object on stdout. Progress goes to stderr |
| `--version` | Print the version |

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Usage or validation error. Nothing was sent |
| `2` | The API rejected the request. The message includes the error code and a hint |
| `3` | Network error after retries |

## Next

- [Authentication](./authentication.md): deploy keys and where chauffeur reads them from
- [Configuration](./configuration.md): the `build.yml` and `addfiles.yml` schema
- [Commands](./commands.md): every command and flag
- [Uploads](./uploads.md), [Store images](./media.md), [Symbols](./symbols.md), [CI](./ci.md), [Troubleshooting](./troubleshooting.md)
