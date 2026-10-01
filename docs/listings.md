---
title: Listings and search
sidebar_position: 2
description: Listing types, parent games for tools, mods and plugins, taxonomy fields, community tags, the listing check that must pass before a page goes public, build scan states, similar titles, and how players and agents search the catalog.
---

# Listings and search

A public listing has to describe the game well enough for players and agents to find it and to know what they are installing. You fill in the taxonomy on the **Listing** tab of the edit page (or with the `update_game_taxonomy` MCP tool), and the listing check tells you what is still missing.

Creating listings needs [developer mode](./developer-mode.md). Adult content and the generative AI disclosure follow the [content rules](./content-rules.md), and [SEO and indexing](./seo-and-indexing.md) covers what search engines see.

## Listing types

Pick the type on the **Settings** tab of the edit page, or pass `asset_type` to `create_game` or `update_game`.

| Type | What it is | Parent game |
|---|---|---|
| `game` | A game | None |
| `application` | Standalone software, such as a launcher or music tool | Optional |
| `tool` | A tool or utility for one game, such as a level editor or save manager | Required to go public |
| `mod` | Changes a game's content | Required to go public |
| `plugin` | Extends a game or engine without changing its content | Required to go public |
| `game_asset` | Art, audio or other content for making games | None |
| `dev_asset` | Code, shaders, plugins for engines and other development assets | None |

## Parent games, tools, mods and plugins

Tools, mods and plugins name the game they are for; applications may. The parent is either a game or application on Blazium Games, or an external game with a name and an `https://` link. Set it on the **Settings** tab, or with `parent` on `create_game` and `update_game` (`{"game": "uid-or-vanity"}` or `{"external_name": "...", "external_url": "https://..."}`). A parent that isn't a game or application, the listing itself, an external parent without an https link, or another developer's listing that isn't public returns `4233`. Changing the type to one without a parent drops it.

The parent's store page shows public children in two rows, each item marked **From the developer** (the parent's owner or admins) or **Community**; the full lists split them into **From the developer** and **From the community**:

- **Tools and utilities**: tools and applications. The full list is at `/<game>/tools`.
- **Mods and plugins**: mods and plugins. The full list is at `/<game>/mods`.

The child's page links back under **For**. `GET https://api.blazium.online/api/v1/public/games/{uid}/children?kind=mods` (or `tools`, or empty for both) lists children with `same_creator`, and the listing's `has_mods` and `has_tools` say whether there are any. The player MCP `list_game_addons` tool reads the same list.

### Mod settings

Mods and plugins can add install details, shown on their store page under **Install**: an `install_path` relative to the game folder (for example `mods/my-mod`, no absolute paths or `..`), a `loader` slug such as `bepinex`, and markdown `instructions` up to 8000 characters. Fill them in on the **Mod settings** tab or with the `set_mod_settings` MCP tool. Invalid values return `4234`.

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
| `ai_uses` | Parts made with generative AI: art, audio, code, text, voice, runtime. See [Generative AI disclosure](./content-rules.md#generative-ai-disclosure) |

A value outside these lists returns `4071`.

The tags field on the Listing tab suggests popular tags as you type. `GET https://api.blazium.online/api/v1/public/tags/popular?prefix=co&limit=20` returns the most used tags on public, non-adult listings (up to 50), with a count for each.

## Community tags

Players who own a game and have played it for at least an hour can suggest up to 5 tags for it, from the store page or with the player MCP `suggest_tag` tool. A tag appears under **Players say** on the store page once 3 players suggest it, up to 10 tags, most suggested first. Tags you already set yourself aren't repeated.

You can hide any suggested tag on the **Player tags** tab of the edit page or with the `hide_community_tag` MCP tool, and show it again later. Hiding keeps the votes. Search matches community tags along with your own.

Playtime comes from the play-time heartbeat of the launcher and the game. It will move to playtime verified by the Blazium SDK once that ships.

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
| At least 1 engine | mods, plugins, game assets, dev assets | error |
| A parent game | tools, mods, plugins | error |
| At least 4 gallery images | all | error |
| A cover image (1024x576 to 2048x1152, 16:9) and a thumbnail (960x540 to 1920x1080, 16:9) | all | error |
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

## Launch health

Games that send the [standard events](./crash-reporting.md#standard-events) get a launch health band for each build, recomputed regularly from recent launches:

| Band | Store label | Rule |
|---|---|---|
| `excellent` | Launches reliably | At least 98% of devices sent `boot_ok`, and at most 1% crashed before it |
| `healthy` | Launches well | At least 93% `boot_ok`, at most 3% crash on boot |
| `mixed` | Mixed launch reports | At least 80% `boot_ok`, at most 10% crash on boot |
| `problematic` | Launch problems reported | Below mixed |
| `unrated` | Not enough launch data | Not enough devices have launched it yet |

The store page and search show the band of the newest stable build. The Builds tab shows every build's band and device count; the MCP `get_build_health` tool also returns the raw counts and median session length.

## Shelves

The home page has two shelves. Each shows up to 12 listings in an order that changes daily:

| Shelf | What qualifies |
|---|---|
| `tonight` (Something for tonight) | Public games with a 15-minute session length, a clean stable download for the player's OS, and a newest stable build rated `excellent` or `healthy` |
| `unheard_of` (Unheard of) | Recently published games and applications that pass the listing check, have a clean stable download, and haven't been played on many devices yet. A listing shows for a limited time after its first `boot_ok` |

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
| `asset_type` (or `type`) | `game`, `application`, `tool`, `mod`, `plugin`, `game_asset`, or `dev_asset` |
| `genres`, `tags`, `tone` | Comma-separated. A game matches if it has any of them. `tags` also matches community tags |
| `exclude_warnings` | Comma-separated content warnings. Leaves out listings with any of them |
| `ai_uses` | Comma-separated. Only listings that disclose generative AI for any of them |
| `session_bucket`, `net` | One value each |
| `players` | Only games that support this many players |
| `os`, `arch` | Only games with a clean build for this platform |
| `engine` | Listings made with this engine (`engines`) or declaring compatibility with it |
| `engine_version`, `renderer` | Only listings whose declared compatibility covers this version or renderer |
| `license` | One license kind |
| `authorship` | `human`, `human_agent`, or `agent_heavy`. Filters only; it never changes ranking |
| `sort` | `relevance` (default with `q` or `tags`), `newest` (default otherwise), or `updated` |
| `page`, `page_size` | `page_size` is 1 to 50, default 20 |

Adult listings are left out unless the signed-in player turned on adult content (see [Content rules](./content-rules.md#adult-content)).

Each result has the listing fields, `engines`, `license_kind`, `authorship`, `adult`, `content_warnings`, `ai_uses`, `health` (the launch health band), `scan` (the best scan state across the game's files), `platforms` (clean builds only), `score`, and `matched_tags`.

`GET /api/v1/public/games/{uid}` returns one listing with its taxonomy, made-with fields, `ai_uses`, `community_tags`, `adult`, `indexable`, `parent`, `has_mods` and `has_tools`, launch health, editions (`skus`), license kind, engine compatibility, dependencies (`relations.uses` and `relations.used_by`), `mod_compat` for mods, `mod_settings` for mods and plugins, files, scan states, checksums, similar titles, and newest changelog. `GET /api/v1/public/games/{uid}/relations` returns just the dependencies, license kind, and compatibility.
