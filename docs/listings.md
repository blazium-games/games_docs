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
| `authorship` | `human`, `human_agent`, or `agent_heavy`. See [Made with](#made-with) |
| `authorship_credit` | Optional credit line, up to 120 characters |

A value outside these lists returns `4071`.

## Made with

The **Made with** field says who made the game, shown as a label on the store page and in search results:

| Value | Label |
|---|---|
| `human` | Made by people |
| `human_agent` | People with AI agents |
| `agent_heavy` | Mostly AI agents |

It is optional and never affects ranking. `authorship_credit` adds a short plain-text credit, for example "Art by Sam, code with Cursor". Players can filter search by it.

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

## Dependencies, compatibility and license

These are set over the developer MCP (`declare_dependency`, `declare_engine_compat`, `declare_license`; see the [reference](./mcp/reference.md#dependencies-compatibility-and-license)).

- **Dependencies** link your listing to other public listings: it `uses` an asset pack or plugin, `supports` a game or tool (for mods and plugins), or was `made_with` a tool. Your page shows them under **Uses**, and the other listing shows yours under **Used by**. Up to 50 links.
- **Engine compatibility** lists up to 10 engine version ranges, each with an optional renderer and platform. A `max_version` of `4.3` covers `4.3.x`. The store page shows them as **Works with**.
- **License kind** is one of `cc0`, `cc-by`, `cc-by-sa`, `paid`, `source-available`, or `proprietary`, shown as **License**.

## Works with

A mod that `supports` a game is checked against that game's current builds. The check compares the mod's engine compatibility ranges with each build's `engine_version` (set with `chauffeur build --engine-version` or `engine_version` in build.yml), per platform.

| Status | Meaning |
|---|---|
| `compatible` | The build's engine version is inside one of the mod's ranges |
| `incompatible` | The mod has ranges for this engine and platform, and none cover the build |
| `unknown` | The build has no engine version, or the mod has no range for this engine or platform |

A game's overall status is the worst across its platforms. The mod's store page shows it for each supported game's stable build, and `GET /api/v1/public/games/{uid}` returns it as `mod_compat`. The mod's developers can see the stable and beta builds per platform with the MCP `mod_compat` tool or `GET /api/v1/private/games/{uid}/mod-compat`.

## Bundle check

Every uploaded build records a SHA-256 for each file inside its zip. The bundle check compares the files of 1 KB or more in one of your builds against the files of asset packs (game and dev assets) on the store, so you can confirm you have the right to ship what you bundled. It never blocks anything and players never see it.

| Status | Meaning |
|---|---|
| `owned` | The pack is yours |
| `licensed` | You bought a license for it, or it is `cc0` |
| `attribution` | It is `cc-by` or `cc-by-sa`: credit the author |
| `unlicensed` | No license on record. Buy one, or remove the files |

Open **Symbols and bundle check** under a build on the Builds tab, or use the MCP `bundle_check` tool. Each match lists up to 5 of your file paths.

When two different developers upload identical files, staff review it. Your upload is never blocked.

## Launch health

Games that send the [standard events](./crash-reporting.md#standard-events) get a launch health band for each build, recomputed every hour from the last 30 days:

| Band | Store label | Rule |
|---|---|---|
| `excellent` | Launches reliably | At least 98% of devices sent `boot_ok`, and at most 1% crashed before it |
| `healthy` | Launches well | At least 93% `boot_ok`, at most 3% crash on boot |
| `mixed` | Mixed launch reports | At least 80% `boot_ok`, at most 10% crash on boot |
| `problematic` | Launch problems reported | Below mixed |
| `unrated` | Not enough launch data | Fewer than 20 devices |

The store page and search show the band of the newest stable build. The Builds tab shows every build's band and device count; the MCP `get_build_health` tool also returns the raw counts and median session length.

## Shelves

The home page has two shelves. Each shows up to 12 listings in an order that changes daily:

| Shelf | What qualifies |
|---|---|
| `tonight` (Something for tonight) | Public games with a 15-minute session length, a clean stable download for the player's OS, and a newest stable build rated `excellent` or `healthy` |
| `unheard_of` (Unheard of) | Games and applications published in the last 60 days that pass the listing check, have a clean stable download, and have been played on fewer than 50 devices. A listing shows for up to 14 days from its first `boot_ok` |

Both need a verified owner. `GET https://api.blazium.online/api/v1/public/shelves/{shelf}?os=windows` returns a shelf without sign-in, and the player MCP `get_shelf` tool reads it.

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
| `engine` | Listings made with this engine (`engines`) or declaring compatibility with it |
| `engine_version`, `renderer` | Only listings whose declared compatibility covers this version or renderer |
| `license` | One license kind |
| `authorship` | `human`, `human_agent`, or `agent_heavy`. Filters only; it never changes ranking |
| `sort` | `relevance` (default with `q` or `tags`), `newest` (default otherwise), or `updated` |
| `page`, `page_size` | `page_size` is 1 to 50, default 20 |

Each result has the listing fields, `engines`, `license_kind`, `authorship`, `health` (the launch health band), `scan` (the best scan state across the game's files), `platforms` (clean builds only), `score`, and `matched_tags`.

`GET /api/v1/public/games/{uid}` returns one listing with its taxonomy, made-with fields, launch health, editions (`skus`), license kind, engine compatibility, dependencies (`relations.uses` and `relations.used_by`), `mod_compat` for mods, files, scan states, checksums, similar titles, and newest changelog. `GET /api/v1/public/games/{uid}/relations` returns just the dependencies, license kind, and compatibility.
