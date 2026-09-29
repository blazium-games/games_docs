---
title: Deploy builds
sidebar_position: 4
description: Upload game builds to Blazium Games with blazium-cli, the upload API, or GitHub Actions.
---

# Deploy builds

A deploy has two steps: register a build (version, OS, arch, channel), then upload its files as a zip. Every build gets a `build_id` that crash reporters send as `X-Build-Id`.

## 1. Get deploy keys

Deploy keys are an `access_token` and `secret_key` pair for one game. Get them from the game's edit page on [blazium.games](https://blazium.games), or ask an agent to call the MCP tool `request_deploy_key`.

:::warning

Issuing a new deploy key immediately revokes every previous deploy key for that game. Update your CI secrets right away.

:::

Store them as CI secrets, for example GitHub Actions secrets `BLAZIUM_ACCESS_TOKEN` and `BLAZIUM_SECRET_KEY`. Never commit them.

The MCP tool `get_deploy_info` returns every URL below for your game, plus recent builds and key prefixes. It never returns secrets.

## 2a. Upload with blazium-cli

Download [blazium-cli](https://github.com/blazium-games/blazium-cli/releases). It reads `BLAZIUM_ACCESS_TOKEN` and `BLAZIUM_SECRET_KEY` from the environment (or `--access` and `--secret`).

```bash
blazium-cli games genbuild --version 1.0.0
blazium-cli games addchangelog --title "Launch" --description "First public build"
blazium-cli games build --asset build.yml --os windows --arch x86_64 --channel stable
blazium-cli games setfiles --version 1.0.0 --os windows --arch x86_64 --files ./export/windows
blazium-cli games addfiles --asset addfiles.yml
```

- `genbuild` writes `build.yml`, and `setfiles` writes `addfiles.yml`.
- `build` registers the build and prints its `build_id`. The same version, type, OS, arch, and channel update the existing build.
- `addfiles` zips the files, computes a SHA-256 checksum, and uploads them to the matching build. Run `build` first.

`build.yml`:

```yaml
version: v1
spec: build
asset:
  title: "1.0.0"
  type: "game"
  description: "First release"
  version: 1.0.0
  platforms:
    - os: windows
      arch: x86_64
      channel: stable
  changelog:
    - item:
        title: "Launch"
        description: "First public build"
```

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
- `os` is one of `windows`, `macos`, `linux`, `android`, `ios`, or `web`.
- `arch` is one of `x86_64`, `x86`, `arm64`, `arm32`, `arm`, `universal`, `wasm32`, or `wasm`.
- `channel` is lowercase letters, digits, `-`, and `_`, starting with a letter or digit, up to 32 characters.
- `checksum` is the SHA-256 of the zip as 64 hex characters (a `sha256:` prefix is accepted).
- Instead of `build_id`, you can send `build` plus `build_type` and `version`.
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

| Code | Meaning |
|------|---------|
| `4020` / `4021` | Missing `X-Access-Token` or `X-Secret-Key` |
| `4022` / `4023` | Deploy key not found, or revoked |
| `4026` | Missing or too-long field when registering (`version` up to 32 characters, `title` up to 255, up to 100 changelog items) |
| `4037` | Missing `file`, or a form that could not be read |
| `4038` | Missing build identification |
| `4039` | Build not found; register it first |
| `4041` | Invalid `checksum`, `os`, `arch`, or `channel`, or the file is not a `.zip` |
| `4043` | Larger than 5 GB, or larger than the chunk's `Content-Range` (`413`) |
| `4044` | Missing or invalid `X-Upload-Session-ID` / `Content-Range`, or a chunk that does not continue the session |
| `4045` | Upload session not found or expired |
| `4046` | Checksum mismatch |
| `4047` | Another chunk for the same session is still uploading (`409`) |
| `4096` | The game owner has not verified their email |
| `4290` / `4291` | Too many uploads, chunks, or open sessions for this game (`429`) |

## Channels

Each channel (`stable`, `beta`, `dev`, or your own lowercase name) points at one build. When an upload passes the virus scan, its channel moves to that build if it's newer. Players see the build each channel points at; `beta` only for players who joined the beta on the store page, and `dev` only for you and your game admins.

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
      # Export your game into ./export/linux here.
      - name: Install blazium-cli
        run: |
          curl -fsSL -o blazium-cli https://github.com/blazium-games/blazium-cli/releases/latest/download/blazium-cli-linux-x86_64
          chmod +x blazium-cli
      - name: Register build
        run: ./blazium-cli games build --asset build.yml --os linux --arch x86_64 --channel stable
      - name: Upload files
        run: |
          ./blazium-cli games setfiles --version "${GITHUB_REF_NAME#v}" --os linux --arch x86_64 --files ./export/linux
          ./blazium-cli games addfiles --asset addfiles.yml
```

## Next

Send the new `build_id` from your game's crash reporter. See [Crash reporting](./crash-reporting.md).
