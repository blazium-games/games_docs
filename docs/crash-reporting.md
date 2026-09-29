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

## Standard events

Six event names have fixed meanings. Send them from every build and your listing gets a [launch health band](./listings.md#launch-health), and new games can appear on the [Unheard of shelf](./listings.md#shelves).

| Event | When | Fields |
|-------|------|--------|
| `session_start` | The game process started | |
| `boot_ok` | The first frame of the main menu or first scene rendered | `device_uid` (required), `ms` since start (optional, 0 to 600000) |
| `first_input` | The player's first key, click or touch | `ms` since start (optional, 0 to 600000) |
| `session_end` | The game is closing normally | `seconds` played this session (required, whole number 0 to 86400) |
| `quit` | The player chose to quit | |
| `crash` | Sent by the crash reporter, or on the next launch after an unclean exit | `device_uid` (required) |

If any standard event in a request has a missing or out-of-range field, the whole request is refused with `4158` and the message names the event's index. Other event names are stored as custom events.

A `crash` before a device's first `boot_ok` counts as a crash on boot. Health counts devices, so send the same random `device_uid` from every event of one install.

A Blazium or Godot autoload can send them:

```gdscript
extends Node

const ENDPOINT := "https://api.blazium.online/api/v1/public/events"
const APP_ID := "<game uid>"
const BUILD_ID := "<build_id>"

var _device_uid := ""
var _started_ms := 0
var _input_sent := false

func _ready() -> void:
	_started_ms = Time.get_ticks_msec()
	_device_uid = _load_device_uid()
	_send("session_start")
	await get_tree().process_frame
	_send("boot_ok", {"ms": _elapsed_ms()})

func _input(event: InputEvent) -> void:
	if _input_sent or not (event is InputEventKey or event is InputEventMouseButton or event is InputEventScreenTouch or event is InputEventJoypadButton):
		return
	_input_sent = true
	_send("first_input", {"ms": _elapsed_ms()})

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_CLOSE_REQUEST:
		_send("session_end", {"seconds": _session_seconds()})

func quit_game() -> void:
	_send("quit")
	_send("session_end", {"seconds": _session_seconds()})
	get_tree().quit()

func _elapsed_ms() -> int:
	return mini(Time.get_ticks_msec() - _started_ms, 600000)

func _session_seconds() -> int:
	return mini((Time.get_ticks_msec() - _started_ms) / 1000, 86400)

func _load_device_uid() -> String:
	var path := "user://device_uid"
	if FileAccess.file_exists(path):
		return FileAccess.get_file_as_string(path).strip_edges()
	var uid := Crypto.new().generate_random_bytes(16).hex_encode()
	FileAccess.open(path, FileAccess.WRITE).store_string(uid)
	return uid

func _send(name: String, fields := {}) -> void:
	var ev := {"event": name, "anonymous": true, "device_uid": _device_uid}
	ev.merge(fields)
	var http := HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(func(_r, _c, _h, _b): http.queue_free())
	http.request(ENDPOINT, ["Content-Type: application/json", "X-App-Id: " + APP_ID, "X-Build-Id: " + BUILD_ID],
		HTTPClient.METHOD_POST, JSON.stringify({"events": [ev]}))
```

Set `BUILD_ID` for each export (see [CI](./cli/ci.md#crash-reporter-ids)). Requests sent while the window is closing may not finish; set `get_tree().auto_accept_quit = false` and quit after the request completes if you need every `session_end`. Ask players for consent where your privacy policy requires it.

## Symbols

Reports with a minidump are stackwalked with the Breakpad symbols uploaded for their build. Without symbols, stacks only show addresses. Upload them with `chauffeur symbols`; see [Symbols](./cli/symbols.md).

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
