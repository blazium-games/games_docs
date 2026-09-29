---
name: blazium-games-crash-reporting
description: Send crash reports and custom events from a game to Blazium Games. Configures the Blazium Engine crash reporter or a custom HTTP reporter with X-App-Id and X-Build-Id, and verifies reports arrive. Use when the user wants crash reporting, crash dumps, error telemetry, or gameplay events for a Blazium Games project.
license: MIT
---

# Blazium Games: Crash Reporting

Wire a game to `POST https://api.blazium.online/api/v1/public/crashes` so crashes show up in `list_game_crashes`.

## Invoke This Skill When

- "Add crash reporting", "send crash dumps to Blazium Games", "why aren't my crashes showing up?"
- The user wants custom gameplay or telemetry events
- A build was just deployed and needs its `build_id` wired in

## Prerequisites

- The `blazium-games` MCP server is connected
- At least one registered build (see `blazium-games-deploy`)

## Phase 1: Resolve identity

1. Call `get_deploy_info` with the game `uid`. Read `auth.crash_headers`:
   - `X-App-Id`: the game uid
   - `X-Build-Id`: the latest build's `build_id`
2. If the user ships several platforms or channels, call `list_game_builds` and pick the `build_id` matching the exact version, OS, arch, and channel. Every combination is its own build.

`X-Build-Id` is a build UID, never a version string. Crash ingest needs no secret, so these values are safe to ship inside the game.

## Phase 2: Blazium Engine games

Set these in Project Settings under `application/crash_reporter/`:

| Setting | Value |
|---------|-------|
| `enabled` | `true` |
| `upload_mode` | `InEngine`, `Sidecar`, or `Both` |
| `endpoint` | `https://api.blazium.online/api/v1/public/crashes` |
| `app_id` | the game uid (`X-App-Id`) |
| `build_id` | the build UID (`X-Build-Id`) |
| `app_version` | the build version |
| `build_channel` | `stable`, `beta`, etc. |
| `require_user_consent` | `true` (recommended) |
| `privacy_policy_url` | `https://blazium.games/privacy-policy` or your own |

For the sidecar UI, place the [crash_reporter](https://github.com/blazium-games/blazium_crash_reporter) binary next to the game executable. Never put secrets in Project Settings.

In CI, write `build_id` into the project before exporting, so each exported binary reports against its own build.

## Phase 2 (alternative): Custom reporter

1. Create the report:

   ```http
   POST https://api.blazium.online/api/v1/public/crashes
   X-App-Id: <game uid>
   X-Build-Id: <build_id>
   Content-Type: application/json

   { "has_dump": true, "has_log": true, "app_name": "My Game", "app_version": "1.0.0",
     "engine_version": "4.8", "os": "windows", "arch": "x86_64",
     "user_message": "It froze on level 3", "anonymous": true, "metadata": {} }
   ```

   The response is `201` with `id` and an `uploads` object containing `dump` and/or `log` entries: `url`, `method` (`PUT`), `expires_at` (24 hours), `max_bytes` (64 MB), and `filename` (`dump.dmp` or `log.txt`).

2. Upload each file to its `url` with `PUT`, sending the raw bytes (or a multipart `file` part). Each URL works once.

| Error code | Meaning |
|------------|---------|
| `4001` | Invalid JSON body |
| `4010` | Missing `X-App-Id` or `X-Build-Id` |
| `4030` | Unknown app id, or a `build_id` that doesn't belong to that app. Use the `build_id` from `list_game_builds`, not a version string |
| `4130` | `metadata` has more than 64 keys (`413`) |
| `4290` | The game hit its daily crash report limit (`429`); retry tomorrow |

Past the daily upload limit the report is still stored but `uploads` is empty.

## Phase 3: Custom events (optional)

```http
POST https://api.blazium.online/api/v1/public/events
X-App-Id: <game uid>
X-Build-Id: <build_id>
Content-Type: application/json

{ "events": [ { "event": "level_complete", "anonymous": true, "device_uid": "<random per install>" } ] }
```

Up to 100 events per request (more returns `4130`); the response is `202`. Use a random per-install id, not hardware identifiers.

## Phase 4: Verify

1. Trigger a test crash (or send the JSON above with `curl`).
2. Call `list_game_crashes` and confirm the new report and its `build_id`.
3. Hand off to `blazium-games-debug-crash` to read it.

If nothing arrives, check that `X-Build-Id` belongs to this game (`get_game_build`) and that the endpoint is the `crash_ingest` URL from `get_deploy_info`.

## Docs

https://blazium-games.github.io/games_docs/docs/crash-reporting
