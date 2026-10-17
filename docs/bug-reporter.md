---
title: In-game bug reporter
sidebar_position: 5.2
description: Let a game file a bug with a Blazium login or a Steam session, and deliver it to your webhooks.
---

# In-game bug reporter

The reporter is off until you turn it on for that game. A licensed Blazium player can still file a ticket from the store with `report_bug`. The in-game route is only available when the reporter is on.

## Turn it on

On the listing's **Bug reporter** tab, or with `set_bug_reporter`:

- `enabled`
- `daily_cap`, from 1 to 10000, default 10. The store route and the in-game route share this cap, per game and per reporter.
- up to five `https` webhook URLs. A sixth is rejected. `http://127.0.0.1` is accepted only for a local receiver.

The first time the reporter is turned on, that game gets its own signing key. It is shown in the settings so you can copy it into your receiver. **Refresh signing key** replaces only that game's key. A signature from one game does not verify another game's webhook or screenshot.

`get_bug_reporter` needs `mcp:bugs.read`. `set_bug_reporter` and `update_bug_ticket` need `mcp:bugs.write`. `mcp:crash.read` does not cover these.

## File a report from the game

`POST /api/v1/games/{game_uid}/bugs` accepts a Blazium player JWT or a Steam session for that same game. The body is multipart:

| Field | Limit |
|---|---|
| `message` | required, 4000 characters |
| `client_version`, `os`, `arch`, `build_id` | optional. `build_id` is the fallback when `X-Build-Id` is absent |
| `log` | 512 KiB. Steam ids are redacted before the log leaves the game. The text is stored with the ticket and is not put in the webhook |
| `screenshot` | one PNG, JPEG, or WebP, up to 32 MiB, stored at the size the game sent |

Send `X-App-Id` and `X-Build-Id` with the report, the same headers crash ingest uses. `X-App-Id` is the game uid and must match the path. `X-Build-Id` is that game's build uid. The signed webhook JSON and the Discord embed include `app_id` and `build_id` next to the version.

Over the daily cap returns code `4291`.

The Godot plugin, the Unity package, the Unreal plugin, and the C++ SDK all expose `report_bug`. They send the Blazium JWT, or the Steam session from `sign_in_with_steam_ticket`, and they do not link Steamworks. See [Engines](./engines.md).

## Webhooks

A new report is delivered to every URL. Each URL is posted up to three times with the same signed body, and a 2xx stops the retries. The settings response includes `last_delivery` for each URL: the time, the HTTP status or error, and whether it succeeded.

- A Discord webhook (`https://discord.com/api/webhooks/` or `https://discordapp.com/api/webhooks/`) gets an embed with the game, ticket id, version, and whether a log or screenshot exists. The file is not attached.
- Any other URL gets JSON. The body includes `signature`, an HMAC-SHA1 of the JSON before that field was added, and a time-limited `screenshot_url` when there is an image.

The screenshot URL is signed the same way Spaces signs a private object: base64 HMAC-SHA1 over `GET\n\n\n{expires}\n/{path}`, carried as `Expires` and `Signature`. Your service checks that signature with this game's key and can download the image without a Blazium login. Refreshing the key invalidates older signatures for that game only.

## Notices

When a ticket is marked `fixed` or `unidentified`, the player who filed it can read it from `GET /api/v1/games/{game_uid}/bugs/notices` and acknowledge it with `POST .../notices/ack`. `fixed` means the bug was fixed. `unidentified` means the report could not be pinned down, and it does not say the bug was fixed. A `closed` ticket stays silent. A stable build's changelog uses the same pull: `GET /api/v1/games/{game_uid}/patch/notices` and `POST .../patch/notices/ack`. See [Deploy builds](./deploy.md).
