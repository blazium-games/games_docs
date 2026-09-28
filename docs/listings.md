---
title: Listings and search
sidebar_position: 2
description: Taxonomy fields, the listing check that must pass before a page goes public, build scan states, similar titles, and how players and agents search the catalog.
---

# Listings and search

A public listing has to describe the game well enough for players and agents to find it and to know what they are installing. You fill in the taxonomy on the **Listing** tab of the edit page (or with the `update_game_taxonomy` MCP tool), and the listing check tells you what is still missing.

## Taxonomy

| Field | Values |
|---|---|
| `genres` | Up to 3 of: action, adventure, arcade, card, casual, fighting, horror, idle, management, platformer, puzzle, racing, rhythm, roguelike, rpg, sandbox, shooter, simulation, sports, stealth, strategy, survival, tower-defense, visual-novel, educational, tool, utility, other |
| `tags` | 3 to 20 free lowercase slugs up to 32 characters, for example `co-op` or `pixel-art`. Spaces and underscores become dashes |
| `tone` | Up to 3 of: cozy, dark, funny, relaxing, tense, wholesome, weird, serious, chaotic |
| `inputs` | keyboard_mouse, gamepad, touch, vr, motion |
| `content_warnings` | violence, gore, sexual, nudity, language, drugs, gambling, horror, flashing_lights |
| `engines` | Up to 5 engine slugs, for example `blazium` or `godot` |
| `session_bucket` | How long one sitting usually lasts: `15m`, `1h`, `3h`, or `endless` |
| `net` | `offline`, `local`, `online`, or `local_online` |
| `players_min`, `players_max` | 1 to 64 |

A value outside these lists returns `4071`.

## Listing check

Changing a page to `public` runs the listing check. If anything in the errors column is missing, the change is refused with HTTP 422, code `4225`, and the full report under `data.lint`. Warnings never block.

| Check | Applies to | Level |
|---|---|---|
| At least 3 tags | all | error |
| At least 1 genre, a session length, a player count, a network mode, and at least 1 input | games | error |
| At least 1 engine | mods, game assets, dev assets | error |
| At least 4 gallery images | all | error |
| A cover image and a thumbnail (not the placeholder) | all | error |
| At least one build that passed the virus scan | all | error |
| A tagline | all | warning |
| Similar titles | all | warning |

Run it any time from the Listing tab, with `GET /api/v1/private/games/{uid}/lint`, or with the `validate_listing` tool.

Pages that were already public on September 28, 2026 have a 30-day grace period. When it ends, a page that still fails the check is switched to `invisible` (reachable by link, left out of search). While a page is public, taxonomy edits that would add new errors are refused.

## Similar titles

List up to 10 public games that players of yours would also like, most similar first. They show on your store page and feed recommendations. A title that isn't public, or your own game, returns `4072`.

## Build scans

Every uploaded file is virus-scanned before it can be downloaded. The scan state shows on the store page next to each download, with the file's SHA-256 checksum, and on the Builds tab of the edit page.

| State | Meaning |
|---|---|
| `clean` | Passed the scan and can be downloaded |
| `scanning` | Waiting for or in the scan |
| `infected` | The scanner found a threat; the file was removed |
| `error` | The scan failed; the file was removed. Upload it again |

The Builds tab also lists files removed in the last 30 days because their scan didn't pass, with the scanner's findings. Only clean files count as a platform in search, and agents can only install clean files.

## Search

`GET https://api.blazium.online/api/v1/public/search` needs no sign-in. The [Browse](https://blazium.games/browse) page and the player MCP `search_catalog` tool use it.

| Parameter | Notes |
|---|---|
| `q` (or `search`) | Free text across name, tagline, and description |
| `asset_type` (or `type`) | `game`, `application`, `mod`, `game_asset`, or `dev_asset` |
| `genres`, `tags`, `tone` | Comma-separated. A game matches if it has any of them |
| `session_bucket`, `net` | One value each |
| `players` | Only games that support this many players |
| `os`, `arch` | Only games with a clean build for this platform |
| `sort` | `relevance` (default with `q` or `tags`), `newest` (default otherwise), or `updated` |
| `page`, `page_size` | `page_size` is 1 to 50, default 20 |

Each result has the listing fields, `scan` (the best scan state across the game's files), `platforms` (clean builds only), `score`, and `matched_tags`.

`GET /api/v1/public/games/{uid}` returns one listing with its taxonomy, files, scan states, checksums, similar titles, and newest changelog.
