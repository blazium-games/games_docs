---
title: Crash reporting
sidebar_position: 5
description: Send crash reports, dumps, logs, and custom events from your game to Blazium Games.
---

# Crash reporting

Games send crashes to `https://api.blazium.online/api/v1/public/crashes`. Reports appear on your game's dashboard and through the MCP tools `list_game_crashes` and `get_crash`.

Crash ingest needs no secret. It identifies the game with two headers:

| Header | Value |
|--------|-------|
| `X-App-Id` | The game uid |
| `X-Build-Id` | The `build_id` of the exact build that crashed (not a version string) |

Get both from `get_deploy_info` (`auth.crash_headers`) or `list_game_builds`. Each version, OS, arch, and channel combination is its own build, so write the matching `build_id` into each exported binary.

## Blazium Engine

Set these in Project Settings under `application/crash_reporter/`:

| Setting | Value |
|---------|-------|
| `enabled` | `true` |
| `upload_mode` | `InEngine`, `Sidecar`, or `Both` |
| `endpoint` | `https://api.blazium.online/api/v1/public/crashes` |
| `app_id` | The game uid |
| `build_id` | The build UID |
| `app_version` | The build version |
| `build_channel` | `stable`, `beta`, and so on |
| `require_user_consent` | `true` (recommended) |
| `privacy_policy_url` | Your privacy policy |

For the sidecar consent UI, place the [crash reporter](https://github.com/blazium-games/blazium_crash_reporter) binary next to the game executable. Nothing is uploaded until the player confirms. Never put secrets in Project Settings.

## Custom reporter

Create the report:

```http
POST https://api.blazium.online/api/v1/public/crashes
X-App-Id: <game uid>
X-Build-Id: <build_id>
Content-Type: application/json

{ "has_dump": true, "has_log": true, "app_name": "My Game", "app_version": "1.0.0",
  "engine_version": "4.8", "os": "windows", "arch": "x86_64",
  "user_message": "It froze on level 3", "anonymous": true, "metadata": {} }
```

The `201` response contains the report `id` and an `uploads` object with a `dump` and/or `log` entry:

| Field | Meaning |
|-------|---------|
| `url` | Single-use upload URL |
| `method` | `PUT` |
| `expires_at` | 24 hours after creation |
| `max_bytes` | 64 MB |
| `filename` | `dump.dmp` or `log.txt` |

Upload each file with `PUT` to its `url`, as the raw body or a multipart `file` part. Each game has a daily limit on upload URLs. Past it, the report is still stored but `uploads` is empty.

| Code | Meaning |
|------|---------|
| `4001` | Invalid JSON body |
| `4010` | Missing `X-App-Id` or `X-Build-Id` |
| `4030` | Unknown app id, or a `build_id` that does not belong to that app |
| `4130` | `metadata` has more than 64 keys (`413`) |
| `4290` | The game reached its daily crash report limit (`429`); try again tomorrow |

## Custom events

```http
POST https://api.blazium.online/api/v1/public/events
X-App-Id: <game uid>
X-Build-Id: <build_id>
Content-Type: application/json

{ "events": [ { "event": "level_complete", "anonymous": true, "device_uid": "<random per install>" } ] }
```

Send up to 100 events per request; more returns `4130` (`413`). The response is `202`. Use a random per-install id, not a hardware identifier.

## Reading crashes

With the MCP server connected, ask your agent to list recent crashes. It uses:

- `list_crash_groups` for reports grouped by cause, most recently seen first (up to 100 groups), with counts per build
- `list_game_crashes` for recent reports
- `list_bug_tickets` for bug reports players filed, with a `crash_id` when they attached a dump or log
- `update_bug_ticket` to mark a player bug report `fixed` or `closed`, or reopen it with `open`
- `get_crash` for metadata, the player's message, and the stack excerpt
- `request_crash_download` with `kind` `stack`, `log`, or `dump` for a private link valid for 1 hour

Reports with a minidump are stackwalked on the server, and grouped by their top stack frames. Until then they are grouped by the crash message, app version, and OS. Grouping runs every 10 minutes, so a new report can take a few minutes to join a group.

In Cursor, the `blazium-games-debug-crash` skill runs this whole flow and maps the stack to your code.
