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
POST https://api.blazium.games/api/v1/tool/upload/build
X-Access-Token: <access_token>
X-Secret-Key: <secret_key>
Content-Type: application/json

{ "version": "1.0.0", "build_type": "game", "os": "windows", "arch": "x86_64",
  "channel": "stable", "title": "1.0.0", "description": "First release",
  "changelog_items": [{ "title": "Launch", "description": "First public build" }] }
```

The response includes `build_id`. Then upload the zip:

```http
POST https://upload.blazium.games/api/v1/tool/upload/files
X-Access-Token: <access_token>
X-Secret-Key: <secret_key>
Content-Type: multipart/form-data

build_id=<build_id>, os=windows, arch=x86_64, channel=stable,
checksum=<sha256 hex of the zip>, file=@game.zip
```

- `file` must be a `.zip`, up to 5 GB.
- Large uploads can resume with `X-Upload-Session-ID` and `Content-Range`.
- Instead of `build_id`, you can send `build` plus `build_type` and `version`.

| Code | Meaning |
|------|---------|
| `4026` | Missing required field when registering |
| `4038` | Missing build identification |
| `4039` | Build not found; register it first |
| `4041` | Missing `channel`, `os`, `arch`, or `checksum` |
| `4042` | File is not a `.zip` |

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
