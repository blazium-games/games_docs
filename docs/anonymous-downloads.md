---
title: Anonymous downloads
sidebar_position: 2.85
description: A per-project setting that lets anyone download a free project's files, and play its web build and demo, without an account.
---

# Anonymous downloads

Blazium Games is a game publishing platform, with an infrastructure focus. Normally a visitor signs in before downloading, and the first download of a free project adds it to their library with a free license.

Anonymous downloads is a setting on each project. When it is on, anyone can download the project's public files without an account, and a signed-out visitor can play the web build and the web demo with no license:

- from the store page, where signed-out visitors get a direct download link;
- from the Godot or Blazium [editor asset library](./editor-asset-library.md), which doesn't sign in;
- from the public API, `GET /api/v1/public/downloads/{file_uid}` (see the [API reference](./api-reference.md)).

Signed-in players still download the usual way and still get a free license.

## What you give up

Read this before turning it on. The website shows the same list and asks you to confirm it.

- **No license or library entry.** Anonymous downloads and anonymous play don't add the project to anyone's library, so the visitor doesn't own it on Blazium Games.
- **The web build and the demo play with no account.** A signed-out visitor on the store page starts the full web build when that build can play, and the web demo when it cannot. Turning the setting off stops new play sessions. Embed, Discord, and Telegram are unchanged.
- **You can't see who downloaded.** Anonymous downloads are counted in [download analytics](./download-analytics.md), with the source, client, and country, but not tied to an account.
- **No update notices.** Anonymous downloaders don't hear about new versions through their library.
- **Problems can't be followed up.** A failed or broken anonymous download has no account to contact.
- **Downloaded files can't be taken back.** Turning the setting off stops new anonymous downloads. Files already downloaded stay with whoever has them.
- **No price or editions while it is on.** See below.

## Free projects only

Anonymous downloads only work on free projects:

- You can't turn it on while the project has a price or an active edition (error `4113`).
- While it is on, setting a price or adding an edition is refused (error `4114`). Turn it off first.
- Adult and non-public listings are never served anonymously, even with the setting on.
- Files that are still being virus-scanned aren't served (error `4099`).

## Turning it on or off

The owner or an accepted admin turns it on from the website, or an agent does it after the human agrees.

1. Open your project's editor on blazium.games and go to the **Settings** tab.
2. Under **Anonymous downloads**, choose **Turn on anonymous downloads**.
3. Read the list, tick **I understand downloads will not be tied to an account**, and choose **Turn on**.

**Turn off anonymous downloads** on the same tab switches it off after a confirmation. Turning it off needs no extra confirm.

An agent reads `anonymous_downloads` from `get_game`, tells the human that signed-out visitors can download the files and play the web build and the demo with no license, and calls `set_anonymous_downloads` only after the human agrees. The call is `PUT /api/v1/private/games/{game_id}/anonymous-downloads` with `{"enabled": true, "confirm_no_license": true}`. Turning it on without `confirm_no_license` returns `400`, code `4109`. The tool needs `mcp:write`. A paid game or a game with an edition returns `4113`. Setting a price while it is on returns `4114`. After a successful call, `get_game` shows `anonymous_downloads: true`.

## Signed-out download routes

These routes answer for any file in the project's public channels:

| Route | Answer |
|---|---|
| `GET /api/v1/public/downloads/{file_uid}` | `{"success": true, "data": {"url", "expires_at", "expires_in", "filename", "checksum", "game_uid"}}`. The link is valid for five minutes. |
| `GET /api/v1/public/downloads/{file_uid}/redirect` | A `302` to the same link. The store page links here. |

The file uid is in the listing's `files`. When the setting is off, or the project is paid, both routes return `401`, code `4001`, with `data.browse_url`. An unknown, private, or adult file returns `404`, code `4040`. Both routes allow 60 requests a minute per IP address. Every attempt is recorded in download analytics, including refusals.
