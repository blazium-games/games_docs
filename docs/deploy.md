---
title: Deploy builds
sidebar_position: 4
description: Upload game builds, debug symbols, and store images to Blazium Games with the chauffeur CLI, the upload API, or GitHub Actions.
---

# Deploy builds

A deploy has two steps: register a build (version, OS, arch, channel), then upload its files as a zip. Every build gets a `build_id` that crash reporters send as `X-Build-Id`.

Uploads go through the [chauffeur CLI](./cli/index.md) or the upload API with the game's deploy key. The website and MCP can list, promote, and delete builds and symbols, but not upload them.

## 1. Get deploy keys

Deploy keys are an `access_token` and `secret_key` pair for one game. Get them from the game's edit page on [blazium.games](https://blazium.games), or ask an agent to call the MCP tool `request_deploy_key`. Issuing them needs [developer mode](./developer-mode.md) (`4105`).

:::warning

Issuing a new deploy key immediately revokes every previous deploy key for that game. Update your CI secrets right away.

:::

Store them as CI secrets, for example GitHub Actions secrets `BLAZIUM_ACCESS_TOKEN` and `BLAZIUM_SECRET_KEY`. Never commit them.

The MCP tool `get_deploy_info` returns every URL below for your game, plus recent builds and key prefixes. It never returns secrets.

## 2a. Upload with chauffeur

[Install chauffeur](./cli/index.md#install). It reads `BLAZIUM_ACCESS_TOKEN` and `BLAZIUM_SECRET_KEY` from the environment (or `--access` and `--secret-stdin`).

```bash
chauffeur genbuild --version 1.0.0
chauffeur addchangelog --title "Launch" --description "First public build"
chauffeur build --asset build.yml --os windows --arch x86_64
chauffeur setfiles --version 1.0.0 --os windows --arch x86_64 --files ./export/windows
chauffeur addfiles --asset addfiles.yml
```

- `genbuild` writes `build.yml`, and `setfiles` writes `addfiles.yml`.
- `build` registers the build and prints its `build_id` as `BLAZIUM_GAMES_BUILD_ID`. The same version, type, OS, arch, and channel update the existing build.
- `addfiles` reuses the matching build, zips the files, computes a SHA-256 checksum, and uploads them. Files over 64 MB go up in resumable 16 MB chunks.

`build.yml`:

```yaml
version: v1
spec: build
asset:
  title: "1.0.0"
  type: "game"
  description: "First release"
  version: 1.0.0
  engine_version: "4.3"
  platforms:
    - os: windows
      arch: x86_64
      channel: stable
  changelog:
    - title: "Launch"
      description: "First public build"
```

Every command and field is in the [chauffeur CLI](./cli/index.md) section.

## Symbols and store images

chauffeur also uploads the files that aren't builds. MCP can list and delete them but never uploads. Symbols only upload through chauffeur and the deploy key; store images can also be uploaded on the game's edit page on the website.

```bash
chauffeur symbols --build-id "$BLAZIUM_GAMES_BUILD_ID" ./symbols   # Breakpad .sym files
chauffeur media cover art/cover.png
chauffeur media thumbnail art/thumbnail.png
chauffeur media add shots/*.png
```

See [Symbols](./cli/symbols.md) and [Store images](./cli/media.md).

## 2b. Upload with the API

Register the build:

```http
POST https://api.blazium.online/api/v1/tool/upload/build
X-Access-Token: <access_token>
X-Secret-Key: <secret_key>
Content-Type: application/json

{ "version": "1.0.0", "build_type": "game", "os": "windows", "arch": "x86_64",
  "channel": "stable", "title": "1.0.0", "description": "First release",
  "changelog_items": [{ "title": "Launch", "description": "First public build" }] }
```

The response includes `build_id`. Then upload the zip:

```http
POST https://uploader.blazium.online/api/v1/tool/upload/files
X-Access-Token: <access_token>
X-Secret-Key: <secret_key>
Content-Type: multipart/form-data

build_id=<build_id>, os=windows, arch=x86_64, channel=stable,
checksum=<sha256 hex of the zip>, file=@game.zip
```

- `file` must be a `.zip`, up to 5 GB. Folders inside the zip are kept as they are.
- `os` is one of `windows`, `macos`, `linux`, `android`, `ios`, `web`, or `any`. Use `any` with `arch=universal` for files that work everywhere, such as a content pack in its own [app](./cli/configuration.md#apps) (`--app tracks --app-name "Track Pack" --os any`).
- `arch` is one of `x86_64`, `x86`, `arm64`, `arm32`, `arm`, `universal`, `wasm32`, or `wasm`.
- `channel` is lowercase letters, digits, `-`, and `_`, starting with a letter or digit, up to 32 characters.
- `checksum` is the SHA-256 of the zip as 64 hex characters (a `sha256:` prefix is accepted).
- Instead of `build_id`, you can send `build` plus `build_type` and `version`.
- `app` (and optionally `app_name`) on the registration and the upload targets one [app](./cli/configuration.md#apps) of the project, such as a dedicated server. Leave it out for the main app. A `build_id` of another app is refused.
- The game owner must have a verified email before files can be uploaded.

### Chunked uploads

For large or unreliable connections, open a session first:

```http
POST https://uploader.blazium.online/api/v1/tool/upload/sessions
X-Access-Token: <access_token>
X-Secret-Key: <secret_key>
Content-Type: application/x-www-form-urlencoded

filename=game.zip&total_size=<bytes>&checksum=<sha256 hex>&os=windows&arch=x86_64&channel=stable&build_id=<build_id>
```

The `201` response has `session_id`, `expected_size`, `current_size`, and `expires_at` (6 hours). Then send the chunks in order to `/api/v1/tool/upload/files`, each as a multipart `file` part with `X-Upload-Session-ID: <session_id>` and `Content-Range: bytes <start>-<end>/<total_size>`. Each chunk returns `202` with `current_size` until the last one, which finishes the upload like a single request. After a failed chunk, resume from the `current_size` in the error. Each game can have up to 8 open sessions.

Sessions survive restarts of the upload service, so a chunk that fails while the service is being updated can be sent again once it's back. If a chunk gets `4045`, the session has expired or is gone: open a new session and upload from the start. A single request or chunk may take up to 5 minutes plus one second per 512 KB of its size (at most 3 hours) to arrive; use chunks on slow connections.

| Code | Meaning |
|------|---------|
| `4020` / `4021` | Missing `X-Access-Token` or `X-Secret-Key` |
| `4022` / `4023` | Deploy key not found, or revoked |
| `4024` | Deploy key not found or invalid for this game (`401`) |
| `4025` | The request isn't authenticated as a game (`401`) |
| `4026` | Missing or too-long field when registering (`version` up to 32 characters, `title` up to 255, up to 100 changelog items) |
| `4037` | Missing `file`, or a form that could not be read |
| `4038` | Missing build identification |
| `4039` | Build not found; register it first |
| `4041` | Invalid `checksum`, `os`, `arch`, or `channel`, or the file is not a `.zip` |
| `4043` | Larger than 5 GB, or larger than the chunk's `Content-Range` (`413`) |
| `4044` | Missing or invalid `X-Upload-Session-ID` / `Content-Range`, or a chunk that does not continue the session or couldn't be written. When the error has `current_size`, resume from there (`400` or `409`) |
| `4045` | Upload session not found or expired (`404`); open a new session |
| `4046` | Checksum mismatch |
| `4047` | Another chunk for the same session is still uploading (`409`) |
| `4048` | The file record couldn't be created; try again (`500`) |
| `5020` | A symbol file couldn't be stored; try again (`502`) |
| `4096` | The game owner has not verified their email |
| `4290` / `4291` | Too many uploads, chunks, or open sessions for this game (`429`) |

## Channels

Each channel (`stable`, `beta`, `dev`, or your own lowercase name) points at one build, separately for each [app](./cli/configuration.md#apps) of the project. When an upload passes the virus scan, its channel moves to that build if it's newer. Players see the build each channel points at; `beta` only for players who joined the beta on the store page, and `dev` only for you and your game admins.

On the **Builds** tab of your game you can promote a build to a channel, set an expiry, roll a channel back to its previous build, and see the history. Over MCP use `list_channels`, `promote_build`, and `rollback_channel`. Promoting to `stable` over MCP waits for your approval by email.

Every file records how it was uploaded (deploy key reference or website) and its scan history. Players see a short line under the scan badge, and `GET /api/v1/public/games/{game_uid}/files/{file_uid}/provenance` returns the full record.

## GitHub Actions

```yaml
name: Deploy to Blazium Games
on:
  push:
    tags: ["v*"]
jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      BLAZIUM_ACCESS_TOKEN: ${{ secrets.BLAZIUM_ACCESS_TOKEN }}
      BLAZIUM_SECRET_KEY: ${{ secrets.BLAZIUM_SECRET_KEY }}
    steps:
      - uses: actions/checkout@v4
      - name: Install chauffeur
        run: |
          curl -fsSL -o chauffeur.zip https://cdn.blazium.online/tools/chauffeur/linux-amd64/latest/archive/default
          unzip -o chauffeur.zip chauffeur && chmod +x chauffeur
      - name: Register build
        run: ./chauffeur build --asset build.yml --os linux --arch x86_64
      # Export your game into ./export/linux here.
      - name: Upload files
        run: |
          ./chauffeur setfiles --version "${GITHUB_REF_NAME#v}" --os linux --arch x86_64 --files ./export/linux
          ./chauffeur addfiles --asset addfiles.yml
```

For a platform matrix, GitLab CI, and reading the `build_id` from `--json` output, see [CI](./cli/ci.md).

## What you upload is yours to answer for

Only upload builds and assets you have the right to share. If someone sends a copyright or DMCA notice about your content, we forward it to your account email and leave the decision to you: keep it, or delete the build or listing yourself. We don't take content down on your behalf. See [section 17.1 of the Terms](https://blazium.games/terms-of-service#171-copyright-and-dmca-notices).

## Next

Send the new `build_id` from your game's crash reporter. See [Crash reporting](./crash-reporting.md).
