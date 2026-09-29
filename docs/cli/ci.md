---
title: CI
sidebar_position: 8
description: Run chauffeur in GitHub Actions, GitLab CI or any shell, parse its JSON output, and pass the build_id to your crash reporter.
---

# CI

Store the deploy key as two secrets, `BLAZIUM_ACCESS_TOKEN` and `BLAZIUM_SECRET_KEY`, and expose them as environment variables to the job. Never print them or pass them with `--secret`.

## GitHub Actions

One job per platform, on every `v*` tag:

```yaml
name: Deploy to Blazium Games
on:
  push:
    tags: ["v*"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - { os: windows, arch: x86_64, export: export/windows }
          - { os: linux, arch: x86_64, export: export/linux }
          - { os: macos, arch: universal, export: export/macos }
    env:
      BLAZIUM_ACCESS_TOKEN: ${{ secrets.BLAZIUM_ACCESS_TOKEN }}
      BLAZIUM_SECRET_KEY: ${{ secrets.BLAZIUM_SECRET_KEY }}
      VERSION: ${{ github.ref_name }}
    steps:
      - uses: actions/checkout@v4

      - name: Install chauffeur
        run: |
          curl -fsSL -o chauffeur.zip https://cdn.blazium.online/tools/chauffeur/linux-amd64/latest/archive/default
          unzip -o chauffeur.zip chauffeur && chmod +x chauffeur
          ./chauffeur info

      - name: Register the build
        run: ./chauffeur build --asset build.yml --os ${{ matrix.os }} --arch ${{ matrix.arch }} --json > build.json

      # Export the game into ${{ matrix.export }} here, writing the build_id
      # from build.json into the crash reporter settings first.

      - name: Upload files and symbols
        run: |
          ./chauffeur setfiles --version "${VERSION#v}" --os ${{ matrix.os }} --arch ${{ matrix.arch }} --files ${{ matrix.export }}
          ./chauffeur addfiles --asset addfiles.yml --symbols build/symbols --json > files.json
```

`build.yml` must have the same `version` as the tag (without the `v`) so `addfiles` finds the build that `build` registered. `jq -r '.builds[0].build_id' build.json` reads the `build_id`.

## GitLab CI

Add `BLAZIUM_ACCESS_TOKEN` and `BLAZIUM_SECRET_KEY` as masked, protected CI/CD variables.

```yaml
deploy:
  image: debian:stable-slim
  rules:
    - if: $CI_COMMIT_TAG
  before_script:
    - apt-get update && apt-get install -y curl unzip jq
    - curl -fsSL -o chauffeur.zip https://cdn.blazium.online/tools/chauffeur/linux-amd64/latest/archive/default
    - unzip -o chauffeur.zip chauffeur && chmod +x chauffeur
  script:
    - ./chauffeur setfiles --version "${CI_COMMIT_TAG#v}" --os linux --arch x86_64 --files export/linux
    - ./chauffeur addfiles --asset addfiles.yml --json | tee files.json
    - echo "BLAZIUM_GAMES_BUILD_ID=$(jq -r '.builds[0].build_id' files.json)" >> build.env
  artifacts:
    reports:
      dotenv: build.env
```

## Any shell

```bash
#!/usr/bin/env bash
set -euo pipefail
: "${BLAZIUM_ACCESS_TOKEN:?}" "${BLAZIUM_SECRET_KEY:?}"
version="$1"

./chauffeur setfiles --version "$version" --os linux --arch x86_64 --files export/linux
if ! out=$(./chauffeur addfiles --asset addfiles.yml --json); then
  echo "$out" | jq -r '.error, .hint // empty' >&2
  exit 1
fi
echo "$out" | jq -r '.builds[0].build_id'
```

## JSON output

With `--json`, chauffeur prints exactly one JSON object on stdout; progress and warnings go to stderr.

`build` and `addfiles` print:

```json
{
  "ok": true,
  "builds": [
    {
      "build_id": "5f1c2d3e-0000-4000-8000-000000000000",
      "app_id": "0a1b2c3d-0000-4000-8000-000000000000",
      "os": "windows",
      "arch": "x86_64",
      "channel": "stable",
      "file_uid": "…",
      "checksum": "…",
      "symbols": 3
    }
  ]
}
```

`file_uid` and `checksum` come from `addfiles`, and `symbols` is the number of symbol files uploaded. `build` with media also includes a `media` object.

On failure:

```json
{ "ok": false, "exit_code": 2, "error": "API error [4096]: …", "code": 4096, "status": 403, "hint": "the game owner must verify their email on blazium.games before uploading." }
```

`code`, `status` and `hint` are present for API errors. Check the exit code as well as `ok`; see [exit codes](./index.md#exit-codes).

## Crash reporter IDs

The crash reporter needs the game uid as `X-App-Id` and the build's `build_id` as `X-Build-Id`. Every `build` and `addfiles` run prints them as:

```text
BLAZIUM_GAMES_APP_ID=0a1b2c3d-…
BLAZIUM_GAMES_BUILD_ID=5f1c2d3e-…
```

Register the build before exporting so the export can include its `build_id`: in Blazium Engine, set `application/crash_reporter/app_id` and `build_id` in the export's project settings. Each OS, arch and channel is a separate build with its own `build_id`. See [Crash reporting](../crash-reporting.md).
