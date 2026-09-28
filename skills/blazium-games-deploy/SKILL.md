---
name: blazium-games-deploy
description: Ship game builds to Blazium Games from CI or the command line. Issues rotated deploy keys, registers a build with blazium-cli or the upload API, uploads the zipped files, and wires the build_id into crash reporting. Use when the user wants to deploy, upload, publish a build, or set up GitHub Actions for Blazium Games.
license: MIT
---

# Blazium Games: Deploy Builds

Register a build, upload its files, and keep the returned `build_id` for crash reporting.

## Invoke This Skill When

- "Deploy my game to Blazium Games", "upload a build", "set up CI for Blazium Games"
- The user has a built game folder and a Blazium Games store page
- A CI job needs `BLAZIUM_ACCESS_TOKEN` / `BLAZIUM_SECRET_KEY`

## Prerequisites

- The `blazium-games` MCP server is connected with write access (see `blazium-games-get-started`)
- A store page exists. If not, run `blazium-games-store-page` first
- The game owner's email is verified. Uploads for an unverified owner fail with code `4096`. Check with `get_account` (`email_verified`); if needed, call `request_email_code`, ask the human for the code, and call `verify_email`. A game admin cannot verify for the owner
- For the CLI path: [blazium-cli](https://github.com/blazium-games/blazium-cli/releases)

## Phase 1: Read deploy info

Call `get_deploy_info` with the game's `uid` or vanity name. It returns (no secrets):

| Field | Use |
|-------|-----|
| `endpoints.upload_build` | `https://api.blazium.online/api/v1/tool/upload/build` |
| `endpoints.crash_ingest` | Crash reporter endpoint |
| `endpoints.events_ingest` | Custom events endpoint |
| `builds[]`, `latest_build_id` | Existing builds and their `build_id` |
| `keys[]` | Prefixes of existing deploy keys |
| `env` | Env var names to set in CI |

## Phase 2: Get deploy credentials

If the user already has an access token and secret stored in CI, skip this phase.

Otherwise **warn first**: `request_deploy_key` immediately invalidates every previous deploy key for that game, which breaks any pipeline still using an old key. After the user confirms, call `request_deploy_key` with the `uid`. It returns `access_token` and `secret_key` once.

Tell the user to store them as CI secrets (for example GitHub Actions secrets `BLAZIUM_ACCESS_TOKEN` and `BLAZIUM_SECRET_KEY`). Do not write them into files that are committed. Do not repeat them after they are stored.

## Phase 3: Upload with blazium-cli (recommended)

`blazium-cli games` reads `BLAZIUM_ACCESS_TOKEN`, `BLAZIUM_SECRET_KEY`, and optionally `BLAZIUM_API_URL` (default `https://api.blazium.online/api/v1`) and `BLAZIUM_UPLOAD_URL` (default `https://uploader.blazium.online/api/v1`).

1. Generate `build.yml` once: `blazium-cli games genbuild --version 1.0.0`
2. Add changelog entries: `blazium-cli games addchangelog --title "..." --description "..."`
3. Register the build: `blazium-cli games build --asset build.yml --os windows --arch x86_64 --channel stable`
4. Generate `addfiles.yml`: `blazium-cli games setfiles --version 1.0.0 --os windows --arch x86_64 --files ./export/windows`
5. Upload files: `blazium-cli games addfiles --asset addfiles.yml`

`addfiles` zips the files, computes the SHA-256 checksum, and uploads to the build that matches version, type, OS, arch, and channel. Run `build` before `addfiles`.

Example `build.yml`:

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

## Phase 3 (alternative): Upload API directly

1. `POST https://api.blazium.online/api/v1/tool/upload/build` with headers `X-Access-Token` and `X-Secret-Key` and JSON:

   ```json
   { "version": "1.0.0", "build_type": "game", "os": "windows", "arch": "x86_64",
     "channel": "stable", "title": "1.0.0", "description": "First release",
     "changelog_items": [{ "title": "Launch", "description": "First public build" }] }
   ```

   The same version, type, OS, arch, and channel update one build instead of creating another. The response includes `build_id`.

2. `POST https://uploader.blazium.online/api/v1/tool/upload/files` (multipart, same headers) with fields `build_id`, `os`, `arch`, `channel`, `checksum` (SHA-256 hex of the zip), and `file` (a `.zip`, max 5 GB). Large uploads can resume with `X-Upload-Session-ID` and `Content-Range`.

| Error code | Meaning |
|------------|---------|
| `4026` | Missing required field on build registration |
| `4038` | Missing build identification on file upload |
| `4039` | Build not found (register it first) |
| `4041` | Missing `channel`, `os`, `arch`, or `checksum` |
| `4042` | File is not a `.zip` |
| `4096` | The project owner must verify their email before uploading |

Uploaded build files are private. Players download them through short-lived links after verifying their email, and paid games also need a license.

## Phase 4: GitHub Actions

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

Check the [blazium-cli releases](https://github.com/blazium-games/blazium-cli/releases) page for the exact asset name for the runner's platform.

## Phase 5: Hand off to crash reporting

Call `list_game_builds` and give the new `build_id` to the crash reporter as `X-Build-Id` (env `BLAZIUM_GAMES_BUILD_ID`). Continue with `blazium-games-crash-reporting`.

## Docs

https://blazium-games.github.io/games_docs/docs/deploy
