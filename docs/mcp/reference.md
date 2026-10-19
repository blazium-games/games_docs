---
title: Reference
sidebar_position: 4
description: Every tool, prompt, and resource exposed by the Blazium Games developer MCP server.
---

# Reference

This page covers the developer server at `https://mcp.blazium.games/developer`. `https://mcp.blazium.games/mcp` still reaches that server. The player server is on [Player MCP](./player.md).

`uid` accepts a game uid or its vanity name. "Account only" means a project-bound token is refused with `4030`. "Write" means the token needs `mcp:write` or the narrower write scope for that tool's group (see [Scopes](#scopes)). "Deprecated" tools are removed on 2026-10-28 (see [Account and payments](#account-and-payments)).

## Tools

| Tool | Inputs | Notes |
|------|--------|-------|
| `get_profile` | none | Current user. Account only |
| `list_games` | none | Games you own or administer, and pending admin invites |
| `get_game` | `uid` | One game's settings |
| `get_lobby` | `uid` | Lobby settings and published packs: enabled, relay or scripted, TURN, the active checksum, and pack history |
| `set_lobby` | `uid` (required), `enabled`, `lobby_type` (`relay` or `scripted`), `ice_enabled` | Only the fields you pass change. Write |
| `create_game` | `name` (required), `tagline`, `description`, `visibility`, `asset_type`, `vanity_name`, `adult`, `indexable`, `parent` | New store page. Tools, mods and plugins need a `parent` before they can go public. Needs [developer mode](../developer-mode.md) (`4105`). Account only, write |
| `update_game` | `uid` (required), `name`, `tagline`, `description`, `visibility`, `asset_type`, `adult`, `indexable`, `parent` | Update a page; only the fields you pass change. Setting `public` fails with `4225` until the listing check passes. An empty `parent` object clears the parent. Write |
| `get_game_analytics` | `uid`, optional `build` | Visitor analytics, the 30-day `downloads` block, and registered funnel events (count, unique devices, daily series). See [Download analytics](../download-analytics.md) and [Progress](../progress.md) |
| `get_web_player` | `uid` | Browser player settings: enabled, full build, demo build, size, embed, Discord activity, and share links |
| `set_web_player` | `uid`, optional `enabled`, `full_build_id`, `demo_build_id`, `width`, `height`, `fullscreen`, `mobile`, `click_to_play`, `hide_branding`, `start_fullscreen`, `embed_enabled`, `embed_domains`, `discord_enabled`, `application_id`, `public_key`, `share_build_id`, `share_enabled` | Chooses the full build, an optional demo, the player size, branding, fullscreen launch, embed settings, and Discord activity hosting. `share_build_id` and `share_enabled` together turn one web build's unlisted link on or off. Hosting stays off unless `discord_enabled` is set, and it still requires the player to be on plus both the application id and the public key. Covered by `mcp:build.write` |
| `get_achievements` | `uid` | Achievement definitions and their writers |
| `set_achievements` | `uid`, `achievements` | Replaces the achievement list. Covered by `mcp:catalog.write` |
| `get_stats` | `uid` | Integer stats, their op, and their writers |
| `set_stats` | `uid`, `stats` | Replaces the stat list. Covered by `mcp:catalog.write` |
| `get_funnels` | `uid` | Registered analytics events and their writers |
| `set_funnels` | `uid`, `funnels` | Replaces the funnel list. Covered by `mcp:catalog.write` |
| `get_presence_writers` | `uid` | Who may set the short presence status |
| `set_presence_writers` | `uid`, `writers` | Replaces that list. Covered by `mcp:catalog.write` |
| `list_server_keys` | `uid` | Game server key prefixes and roles. No secrets |
| `request_server_key` | `uid`, `role` (`game_server` or `private_server`) | Returns the secret once |
| `revoke_server_key` | `uid`, `key_id` | Revokes one game server key |
| `list_items` | `uid`, optional `cursor` | One page of item definitions. `next` is the cursor for the following page. Covered by `mcp:read` |
| `create_item` | `uid`, `itemdef_id`, `name`, optional platform type, stats, sockets | Creates a definition. `unique` is only set here. Covered by `mcp:catalog.write` |
| `update_item` | `uid`, `itemdef_id`, `name` | Edits a definition. `unique` cannot change. Covered by `mcp:catalog.write` |
| `give_items` | `uid`, `itemdef_id`, `quantity`, `request_id`, `recipients` | Gives one item to handles or emails. Covered by `mcp:catalog.write` |
| `list_item_sets` | `uid`, optional `cursor` | One page of named sets. Bonuses are stored, not applied |
| `upsert_item_set` | `uid`, `name`, optional `set_uid`, `pieces`, `bonus` | Covered by `mcp:catalog.write` |
| `sync_item_schema` | `uid`, `mode` (`sync`, `overwrite`, or `addon`) | Updates Steam item definitions. Does not move player items. Covered by `mcp:steam.manage` |
| `set_inventory_flags` | `uid`, `confirm`, optional `inventory`, `transfer` | Turns a switch on. Neither switch can be turned off. Covered by `mcp:steam.manage` |
| `list_mint_keys` | `uid`, optional `cursor` | One page of names and prefixes. Covered by `mcp:keys.manage` |
| `request_mint_key` | `uid`, `name` | Returns the 128-character secret once. It can mint, set stats, socket, unsocket, and use items. A player token cannot |
| `rename_mint_key` | `uid`, `key_id`, `name` | Covered by `mcp:keys.manage` |
| `revoke_mint_key` | `uid`, `key_id` | Covered by `mcp:keys.manage` |
| `list_game_crashes` | `uid` | Recent crash reports |
| `get_crash` | `uid`, `crash_id` | One crash report including stack excerpt |
| `request_crash_download` | `uid`, `crash_id`, `kind` | Private download URL for `dump`, `log`, or `stack`, valid for 1 hour. Covered by `mcp:crash.read` |
| `get_crash_reporter` | `uid` | Reads crash webhooks: enabled, webhook URLs, and that game's signing key. The key is not the bug reporter key. Covered by `mcp:crash.read` |
| `set_crash_reporter` | `uid`, optional `enabled`, `webhooks`, `refresh_signing_key` | Turns crash webhooks on, replaces up to five https URLs, or refreshes the signing key. A refresh returns only the new key. Covered by `mcp:crash.write` |
| `list_mcp_keys` | none | Account key prefixes only. Account only |
| `get_setup` | none | Account, games, public URLs, latest `build_id`. No secrets. Account only |
| `get_deploy_info` | `uid` | Upload, crash, and page URLs, build list, and deploy key prefixes. No secrets |
| `list_game_builds` | `uid` | Builds. `build_id` is the build UID for CI and crash reporters (`X-Build-Id`), not a version string |
| `delete_game_build` | `uid`, `build_id`, optional `idempotency_key` | Deletes one build. The owner approves this. Write |
| `add_game_admin` | `uid`, `invite`, optional `idempotency_key` | Invites an admin. Only the owner can invite, and the owner approves this. Write |
| `remove_game_admin` | `uid`, `admin_id` | Removes an admin. Only the owner can remove one. Write |
| `delete_game` | `uid`, optional `idempotency_key` | Deletes a game the caller owns. The owner approves this. Write |
| `get_account_analytics` | none | Analytics across the signed-in account's games. Account only |
| `get_game_build` | `uid`, `build_id` | One build, its files, and crash reporter headers |
| `request_mcp_key` | `idempotency_key` (optional) | New account key. **Revokes all previous account keys.** Needs the human's approval. Account only, write |
| `request_deploy_key` | `uid`, `idempotency_key` (optional) | New upload keys for CLI and CI. **Revokes that project's previous upload keys.** Needs the human's approval. Write |

### Releases and trust

Every build file belongs to a channel: `stable` (the default), `beta`, `dev`, or your own lowercase name. Each channel points at one build. A clean upload moves its channel forward on its own; `promote_build` and `rollback_channel` move it by hand. Players see the build each channel points at, plus anything uploaded after the last move. `dev` is only visible to the game's owner and admins, and `beta` only to players who joined the beta.

| Tool | Inputs | Notes |
|------|--------|-------|
| `list_channels` | `uid` | Each channel's build, expiry, beta subscriber count, and the last 50 promote, rollback, and upload events |
| `promote_build` | `uid`, `channel`, `build_id`, `expires_in_hours` (0-2160), `idempotency_key` | Points a channel at a build whose files passed the virus scan. `expires_in_hours` hides the channel from players after that. Promoting to `stable` needs the human's approval. Write |
| `rollback_channel` | `uid`, `channel` | Moves the channel back to the build it pointed at before. Nothing is deleted. Write |
| `list_crash_groups` | `uid` | Up to 100 crash groups, most recently seen first, with `first_seen`, `last_seen`, counts per build, and a `sample_crash_id` for `get_crash` |
| `get_build_provenance` | `uid`, `file_uid` | Uploader, how it was uploaded (`deploy_key` with an 8-character `key_ref`, or `website`), upload time, checksum, and scan history. Never returns a secret |

Crash groups use the top stack frames once a minidump has been stackwalked, and the crash message, app version, and OS before that. A new report can take a few minutes to join a group.

### Build health, symbols and bundle check

MCP never uploads files. Symbols and builds are uploaded with the [chauffeur CLI](../cli/index.md) and the game's deploy key. Store images are uploaded with chauffeur or on the game's edit page on the website. These tools read and delete them.

| Tool | Inputs | Notes |
|------|--------|-------|
| `get_build_health` | `uid` | The last 50 builds with `devices`, `boot_ok`, `crash_on_boot`, `median_session_seconds` and `band` over the last 30 days, plus the listing's public band and what each band means. See [Launch health](../listings.md#launch-health) |
| `list_build_symbols` | `uid`, `build_id` | Breakpad symbol files for a build: `module_name`, `debug_id`, `os`, `arch`, `size`, `checksum`, and the `chauffeur symbols` command to upload more |
| `delete_build_symbols` | `uid`, `build_id`, `symbol_uid` (optional) | Deletes one symbol file, or all of the build's symbol files when `symbol_uid` is empty. Write (`mcp:build.write`) |
| `upload_symbols_info` | `uid`, `build_id` | The exact `chauffeur symbols` command for the build, its limits, and a link to [Symbols](../cli/symbols.md). Uploads nothing |
| `bundle_check` | `uid`, `build_id` | Informational. Compares the files inside the build's zip with asset packs sold on the store and reports each match as `owned`, `licensed`, `attribution` (cc-by, credit needed) or `unlicensed`, with sample paths |
| `mod_compat` | `uid` (a mod), `game` (optional) | Compares the mod's [engine compatibility](#dependencies-compatibility-and-license) with the engine version of each supported game's current builds, per channel and platform: `compatible`, `incompatible` or `unknown` |

### Editions

A game can sell up to 8 editions. When it has any active edition, its listed price is the cheapest one and `set_game_price` can't change it (`4164`). Owners upgrade by paying the difference, at least 50 cents. See [Selling](../payments/selling.md#editions).

| Tool | Inputs | Notes |
|------|--------|-------|
| `list_skus` | `uid` | Editions with `slug`, `name`, `kind`, `price_cents`, `active`, `sort_order` and, for bundles, `bundle_asset_uids` |
| `upsert_sku` | `uid`, `sku_uid` (to replace), `slug`, `name`, `description`, `kind`, `price_cents` (99-50000), `bundle_asset_uids`, `active`, `sort_order` (0-100) | `kind` is `standard`, `deluxe`, `beta_access` (also grants the beta channel) or `bundle` (also grants 1 to 10 of your other listings). Without `sku_uid` it creates one. Write (`mcp:money`) |
| `delete_sku` | `uid`, `sku_uid` | Retires an edition. Owners keep it; nobody can buy it any more. Write (`mcp:money`) |

### Player feedback

Players review games they own and file bug tickets from the [player server](./player.md) or the store page.

| Tool | Inputs | Notes |
|------|--------|-------|
| `list_reviews` | `uid`, `unreplied`, `page` | Reviews, newest first, with the summary: `count`, `enjoyed`, `quality_avg`, `quality_counts` (1 to 5), and `would_play_with_friends`. `unreplied` lists only reviews without a reply |
| `get_review_reporter` | `uid` | Reads new-review webhooks: enabled, webhook URLs, and that game's signing key. The key is not the sale, crash, or bug reporter key. Covered by `mcp:read` |
| `set_review_reporter` | `uid`, optional `enabled`, `webhooks`, `refresh_signing_key` | Turns new-review webhooks on, replaces up to five https URLs, or refreshes the signing key. A refresh returns only the new key. Covered by `mcp:catalog.write` |
| `reply_to_review` | `uid`, `review_uid`, `text` | Public reply shown under the review on the store page (up to 2000 characters). Empty text removes it. Write |
| `list_bug_tickets` | `uid`, `status` (`open`, `fixed`, `unidentified`, `closed`), `page` | 50 tickets a page, newest first, with counts by status. Follow `next_page` until it is absent. `has_screenshot` and `has_log` say which files exist. A dump or log also has a `crash_id` for `get_crash` and `request_crash_download` |
| `get_bug_ticket` | `uid`, `bug_uid` | One ticket, including `has_screenshot` and `has_log` |
| `request_bug_screenshot` | `uid`, `bug_uid` | A one-hour `url` for the screenshot. The tool returns the link, not the image |
| `get_bug_log` | `uid`, `bug_uid`, `offset` | One page of the log, at most 16 KiB. Call again with `next_offset` until it is absent |
| `update_bug_ticket` | `uid`, `bug_uid`, `status` (`open`, `fixed`, `unidentified`, or `closed`) | Sets status. Covered by `mcp:bugs.write`. Fixed and unidentified can show an in-game notice. Closed stays silent in the game. |
| `get_bug_reporter` | `uid` | Reads the in-game reporter: enabled, daily cap, webhooks, and that game's signing key. Covered by `mcp:bugs.read` |
| `set_bug_reporter` | `uid`, optional `enabled`, `daily_cap`, `webhooks`, `refresh_signing_key` | Turns the reporter on, sets the cap (1–10000), replaces up to five webhook URLs, or refreshes the signing key. A refresh returns only the new key. Covered by `mcp:bugs.write` |
| `get_steam_auth` | `uid` | Reads whether Steam auth is on, the app id, and whether the Web API key and ticket secret are stored, plus who set each and when. Never returns those secrets. Covered by `mcp:steam.manage` |
| `set_steam_auth` | `uid`, optional `enabled`, `confirm`, `app_id`, `web_api_key`, `ticket_secret` | Writes the app id and the two secrets, and turns auth on when all three are stored. `enabled: false` deletes both secrets only when `confirm` is true. Covered by `mcp:steam.manage` |
| `unlink_steam` | `uid`, `confirm` | Unlinks the game from Steam. `confirm` only after the human agrees. Covered by `mcp:steam.manage` |
| `rotate_steam_key` | `uid`, `confirm` | Replaces the Steam Web API key. The new key is returned once. `confirm` only after the human agrees. Covered by `mcp:steam.manage` |
| `resync_steam` | `uid`, `confirm`, optional `groups`, `web_api_key` | Imports the chosen Steam groups again. `confirm` only after the human agrees. Covered by `mcp:steam.manage` |
| `import_steam_game` | `app_id`, `web_api_key`, `confirm`, optional `groups`, `uid` | Imports a Steam store page into a new or existing listing. `confirm` only after the human agrees. Needs developer mode |
| `set_anonymous_downloads` | `uid`, `enabled`, `confirm_no_license` | Turns anonymous downloads on or off. Turning them on needs `confirm_no_license` after the human agrees, and the game must be free |
| `set_adult_content` | `show`, `confirm_18` | Shows or hides adult listings for this account. Turning them on needs `confirm_18` after the human confirms they are 18 or older |

Only the game's owner and admins can read bug tickets and download their attachments.

### Copyright notices

Paid copyright (DMCA) notices that name the account's content. Notices appear only once the claimant has paid. See [Copyright (DMCA) notices](../storefront/dmca.md#if-a-notice-names-your-content).

| Tool | Inputs | Notes |
|------|--------|-------|
| `list_copyright_notices` | none | Notices about the account's content: `uid`, `reference`, `status` (`open`, `accepted`, `rejected`, `resolved`, `closed`), claimant, company, filing and decision dates, and how many of the account's links each names. `open` counts notices still under review |
| `get_copyright_notice` | `uid` (from `list_copyright_notices`) | One notice: the claimant's name, company and email, the work described, the statements and signature, the account's links it names and whether those listings were disabled, staff messages, the decision, and `reply_to`. Read only; the human replies to staff by email at `reply_to` with the reference in the subject |

### Dependencies, compatibility and license

These show on the store page as **Uses / Used by**, **License** and **Works with**, and players filter [`search_catalog`](./player.md) by them.

| Tool | Inputs | Notes |
|------|--------|-------|
| `declare_dependency` | `uid`, `target_uid`, `kind` (`uses`, `supports`, or `made_with`), `remove` | Links your listing to another public listing: it uses that asset pack or plugin, it's a mod or plugin that supports that game or tool, or it was made with that tool. Up to 50 links. `remove` drops one. Write |
| `list_dependents` | `uid` | What a public listing uses (`uses`) and which public listings declared a link to it (`used_by`), with its `license_kind` and `compat` |
| `declare_engine_compat` | `uid`, `compat` (up to 10 of `engine`, `min_version`, `max_version`, `renderer`, `platform`) | Replaces the list; an empty list clears it. Either version may be empty to leave that end open, and a `max_version` of `4.3` covers `4.3.x`. Write |
| `declare_license` | `uid`, `license_kind` | `cc0`, `cc-by`, `cc-by-sa`, `paid`, `source-available`, or `proprietary`; empty clears it. Write |

### Tools, mods and press

A tool, mod or plugin names the game it is for with `parent` on `create_game` or `update_game`: `{"game": "uid-or-vanity"}` for a game or application on Blazium Games, or `{"external_name": "...", "external_url": "https://..."}` for one that isn't. The parent's store page lists it under **Tools and utilities** or **Mods and plugins**. See [Listings and search](../listings.md#parent-games-tools-mods-and-plugins).

| Tool | Inputs | Notes |
|------|--------|-------|
| `set_mod_settings` | `uid`, `install_path`, `loader`, `instructions` | Mods and plugins only (`4234` otherwise). `install_path` is relative to the game folder (for example `mods/my-mod`), `loader` a lowercase slug such as `bepinex`, `instructions` markdown up to 8000 characters. Replaces all three. Write |
| `get_press_kit` | `uid` | The press kit behind the listing's `/press` page and `press.zip` |
| `set_press_kit` | `uid`, `release_date`, `website_url`, `press_email`, `trailer_url`, `history`, `features`, `awards`, `links`, `quotes`, `credits` | Replaces the whole press kit; fields you leave out are cleared, so read it with `get_press_kit` first. Links must be https. Up to 20 features, awards, links and quotes, 50 credits. See [Press kit](../press-kit.md). Write |
| `hide_community_tag` | `uid`, `tag`, `show` | Hides a player-suggested tag from the store page, or shows it again with `show`. Without `tag` it lists every suggestion with its vote count. See [Community tags](../listings.md#community-tags). Write |
| `get_store_links` | `uid` | The listing's links to its pages on other stores, shown as **Also on**, and every supported store with its allowed hosts |
| `set_store_links` | `uid`, `store_links` (`platform`, `url`) | Replaces every store link; stores you leave out are removed and an empty list clears them, so read them with `get_store_links` first. One per store: `steam`, `gog`, `epic`, `itch`, `humble`, `microsoft`, `playstation`, `nintendo`, `apple`, `google_play`, or `gamejolt`, each an https link on that store's own site (`4238` otherwise). See [Other stores](../listings.md#other-stores). Write |

### Game chat

Each game has an IRC channel on `irc.blazium.online`. The owner and accepted admins moderate it. See [Chat for publishers](../chat/for-publishers.md).

| Tool | Inputs | Notes |
|------|--------|-------|
| `get_game_chat` | `uid` | The channel name (`irc_channel`), whether guests may join (`chat_guests`), and who is banned or muted with when each mute ends |
| `set_chat_guests` | `uid`, `guests` | Lets people without a license join the channel. Guests can read but can't talk until they own the game. Write |
| `ban_chat_user` | `uid`, `username` | Bans a user from the channel until unbanned and removes them right away. The owner, admins, and `blazium` can't be banned. Write |
| `unban_chat_user` | `uid`, `username` | Lifts a ban. Write |
| `suspend_chat_user` | `uid`, `username`, `minutes` (1-43200) | Mutes a user for up to 30 days; they can still read. Write |
| `unsuspend_chat_user` | `uid`, `username` | Lifts a mute. Write |

### Game keys

Keys give a game to someone for free, for press, bundles, or giveaways. Each code works once and adds the game to the redeemer's library (a license with source `key`). Players redeem at [blazium.games/redeem](https://blazium.games/redeem) or with `redeem_key` on the player server. Pools can also be managed on the **Game keys** tab of the project page.

| Tool | Inputs | Notes |
|------|--------|-------|
| `create_key_pool` | `uid`, `name`, `campaign` | A named pool, such as Press or a bundle. Up to 50 per game. Write |
| `grant_keys` | `uid`, `pool`, `n` (1 to 5000), `campaign`, `idempotency_key` | Creates `n` codes. They come back once, as a `csv_url` that can be downloaded one time within an hour; the codes are stored hashed and can't be shown again. More than 100 at once needs the owner's approval (see below). Write |
| `create_gift_link` | `uid`, `pool`, `note` | A single-use `https://blazium.games/redeem/...` link for one person, shown once. Write |
| `list_key_pools` | `uid` | Pools with `size`, `redeemed`, `unredeemed`, and `gift_links` |

### Approvals for risky actions

Over MCP, rotating an account or deploy key, deleting a deploy key, creating more than 100 game keys at once, adding a project admin, promoting to `stable`, and deleting a game or build wait for the account owner, even with full access. The call returns HTTP 202 with `approval_required: true`, code `4214`, `email_sent`, and an `approval` object whose `uid` you pass as `approval_id` and whose `confirm_url` the owner can open. The owner also gets an email with the link and a 6-digit code. Once `get_approval` says `approved` (or after `confirm_approval` with the code), repeat the call with the same `idempotency_key`; without one, the same agent repeating the same action reuses the pending approval. Each approval works once and expires if nobody decides. Project tokens can't use `get_approval` or `confirm_approval` (`4030`), so approve those from the email. On the website these actions don't need an approval.

### Scopes

`mcp:read` and `mcp:write` cover every developer tool except anticheat. OAuth consent can grant narrower scopes instead:

| Scope | Covers |
|-------|--------|
| `mcp:catalog.write` | Game pages, taxonomy, similar titles, lobby settings, achievements, stats, funnels, presence writers, dependencies, engine compatibility, license kind, media, review replies, new-review webhooks, mod settings, press kits, community tags |
| `mcp:build.write` | Builds, channels, deploy info, scan status, symbols, bundle check |
| `mcp:crash.read` | Crash reports, crash groups, crash analysis, and reading the crash webhook setting and signing key |
| `mcp:crash.write` | Changing crash webhooks and refreshing the signing key. Also covers the crash read routes |
| `mcp:bugs.read` | Listing bug tickets and reading the in-game bug reporter |
| `mcp:bugs.write` | Updating bug tickets and changing the in-game bug reporter. Also covers the read routes |
| `mcp:steam.manage` | Reading and changing Steam auth settings. The Web API key and ticket secret can be set and are never returned |
| `mcp:analytics.read` | Visitor analytics and events |
| `mcp:keys.manage` | Deploy keys, MCP keys, game server keys, MCP access for admins, and project admins |
| `mcp:money` | Pricing, editions, sales, sale and refund webhooks, game keys and gift links, wallet, purchases, library, downloads |
| `mcp:anticheat` | Anticheat for one game. Not included in `mcp:read`, `mcp:write`, or **Full access**. See [Anticheat](#anticheat). |

Every developer token can read the profile, account, and game pages. A write scope also reads its own group; the crash and analytics scopes also cover their actions. A call outside the token's scopes returns `4073`, or `4031` if the token has no write scope at all. The consent page offers presets: **Store page** (`mcp:read mcp:catalog.write`), **CI** (`mcp:read mcp:build.write`), **Crash triage** (`mcp:crash.read mcp:crash.write mcp:analytics.read`), **Bugs** (`mcp:bugs.read mcp:bugs.write`), **Steam** (`mcp:steam.manage`), **Keys** (`mcp:read mcp:keys.manage`), **Money** (`mcp:read mcp:money`), **Anticheat** (`mcp:anticheat`), **Read-only** (`mcp:read`), and **Full access**. `mcp:write` covers the bug and Steam scopes. It does not cover anticheat.

### Anticheat

These tools are on the developer server only. Each one needs `mcp:anticheat`. They do nothing for a game until staff have recorded a signed NDA and a signed contract, except `request_anticheat` and a status read. The player server does not have them. What each profile checks is described in [Anticheat](../anticheat.md), without the decision rules.

| Tool | Inputs | Notes |
|------|--------|-------|
| `request_anticheat` | `uid`, contact email, `confirm` | Owner only. `confirm` must be true. Sends the request. A staff member writes to that email. |
| `get_anticheat` | `uid` | Before both signatures, the request status only. After that, the profile and its settings. |
| `update_anticheat` | `uid`, `profile` (`generic`, `platformer`, or `fps`), and the settings for that profile | A setting from the other profile is rejected. Shutting admins out is owner-only. |
| `list_anticheat_keys` | `uid` | Names and prefixes. Never the secret. |
| `create_anticheat_key` | `uid`, name, `confirm` | `confirm` must be true. The secret is returned once, for the dedicated server. |
| `rotate_anticheat_key` | `uid`, key id, `confirm` | `confirm` must be true. The new secret is returned once. |
| `revoke_anticheat_key` | `uid`, key id, `confirm` | `confirm` must be true. |
| `list_anticheat_events` | `uid`, optional origin | Reports for that game. Origin is the client or a server key's name. |
| `list_anticheat_bans`, `ban_anticheat_player`, `unban_anticheat_player` | `uid`, and a player on the ban and unban tools | |
| `list_anticheat_mutes`, `mute_anticheat_player`, `unmute_anticheat_player` | `uid`, and a player on the mute tools | |
| `list_anticheat_notes`, `add_anticheat_note` | `uid` | A note the game's developers keep |
| `enqueue_anticheat_action` | `uid`, action, player id, `confirm` | `confirm` must be true. Asks the dedicated server to warn, mute, kick, or ban, or to take a screenshot. |
| `list_anticheat_audit` | `uid` | Who changed settings, keys, or actions |

### Listings

See [Listings and search](../listings.md) for the allowed values and the listing check.

| Tool | Inputs | Notes |
|------|--------|-------|
| `validate_listing` | `uid` | Listing check: `ready`, `errors` (block going public), `warnings`, `passes`, plus the current taxonomy and allowed values |
| `update_game_taxonomy` | `uid` (required), `genres`, `tags`, `tone`, `inputs`, `content_warnings`, `engines`, `session_bucket`, `net`, `players_min`, `players_max`, `authorship`, `authorship_credit`, `ai_uses` | Only the fields you pass change. `authorship` is the [made-with label](../listings.md#made-with) (`human`, `human_agent`, `agent_heavy`, or empty to clear) and `authorship_credit` an optional credit line up to 120 characters. `ai_uses` is the [generative AI disclosure](../content-rules.md#generative-ai-disclosure) (`art`, `audio`, `code`, `text`, `voice`, `runtime`; an empty list means none). Write |
| `set_similar_games` | `uid`, `games` (up to 10 uids or vanity names) | Replaces the similar titles; an empty list clears them. Write |
| `set_media` | `uid`, `kind` (`cover`, `thumbnail`, or `gallery`) | Returns the matching [`chauffeur media`](../cli/media.md) commands and the image limits (PNG, JPEG, GIF, or WebP, sniffed from the file). Wide images need width/height between 1.70 and 1.85. Thumbnail 1280x720 recommended, 960x540 to 1920x1080, 5 MB. Cover 1024x576 recommended, 1024x576 to 2048x1152, 8 MB. Screenshot 1920x1080 recommended, 1280x720 to 2048x1152, 10 MB. Avatar 256x256 to 512x512, square (0.95 to 1.05), 2 MB, on the account settings page. MCP never uploads images; use chauffeur or the website. Write |
| `scan_status` | `uid` | Scan state and history of every build file, plus files removed in the last 30 days because their scan failed |

### Account and payments

Amounts are integer US cents. See [Payments](../payments/index.md) for the rules behind these tools.

The tools marked **Deprecated** below and the `wallet` and `library` resources are removed from the developer server at the end of 2026-10-28 (UTC), including from servers that are already running. The developer server then lists 145 tools instead of 157. From 2026-10-29 the API also refuses purchases and top-ups made with developer tokens (`4034`). Use the [player server](./player.md) instead, where `list_library` is `get_library`. See [Versioning](./versioning.md).

| Tool | Inputs | Notes |
|------|--------|-------|
| `get_account` | none | Email verification, timezone, balances, what the account may do, and the website sign-in steps still open: `legal_acceptance_required` (with `legal_changes`), `setup_required`, `authenticator` (`on`, `skipped`, or `not_chosen`), and `gate` (empty when none). Send the human to blazium.games/account/finish for an open step. Authenticator setup and skipping it stay on the website. Account only |
| `create_account` | `email`, `password`, optional `username`, `accept_legal`, `accept_developer_terms` | Creates an account. No bearer. Call it after `initialize` and the `setup_account` prompt. Send `accept_legal` and `accept_developer_terms` only after the human agrees. On this server both turn developer mode on. An existing address gets the same answer and is not revealed |
| `login` | `email`, `password` | Emails a sign-in code. No bearer. Follow the `sign_in` prompt. `otp_required` means call `confirm_account`. An authenticator challenge finishes on the website |
| `confirm_account` | `email`, `code` | Exchanges the email code and returns this server's first `bgames_mcp_` key once. No bearer. A later call does not rotate an existing key. Authenticator setup stays on the website |
| `enable_developer_mode` | `accept_terms` | Turns developer mode on. Send `accept_terms` only after the human agrees. Turning it off stays on the website. Account only, write |
| `request_email_code` | none | Emails a verification code to the account owner. Account only, write |
| `verify_email` | `code` | Verifies the email with the code the human received. Account only, write |
| `set_timezone` | `timezone` | Replaces the saved timezone with the human's IANA name. Call it when `get_account` timezone is empty or the human asks to change it. Do not send the machine's timezone. Unknown names return `4085`. Account only, write |
| `get_security_status` | none | Whether an authenticator app protects the account: `state` (`on`, `skipped`, or `not_chosen`), `enabled_at`, `skipped_at`, `recovery_codes_left`, and `email_code_alternative`. Setting up or turning off an authenticator happens only on the website. Account only, read |
| `get_wallet` | none | Credit, pending, and available balances plus fee and refund rules. Account only. **Deprecated** |
| `list_wallet_transactions` | `limit` (1-200), `before` | Ledger entries, newest first. Account only. **Deprecated** |
| `get_payment_options` | none | Card top-up and x402 USDC networks with fees. Account only. **Deprecated** |
| `create_top_up_link` | `amount_cents` | Card Checkout link for the human to add balance. Account only, write. **Deprecated** |
| `create_x402_top_up` | `amount_cents`, `network` | x402 payment requirements for a USDC top-up. Account only, write. **Deprecated** |
| `pay_with_x402` | `top_up_id`, `payment_payload` | Submits the signed x402 payment. Credit arrives after settlement. Account only, write. **Deprecated** |
| `quote_purchase` | `uid`, `kind` (`purchase` or `donation`), `amount_cents` (donations), `sku` (edition uid or slug; empty quotes the cheapest) | Price, tax, and total. Show the total to the human first. Account only, write. **Deprecated** |
| `purchase_game` | `uid`, `confirm_total_cents`, `idempotency_key`, `sku` (the same edition passed to `quote_purchase`) | Buys a license from the balance. Beyond this agent's limit it returns `approval_required`; retry with the same key once approved. Account only, write. **Deprecated** |
| `donate_to_game` | `uid`, `amount_cents`, `confirm_total_cents`, `idempotency_key` | Donates to a free game from the balance. Account only, write. **Deprecated** |
| `list_library` | none | Owned games with refund windows and playtime. Account only. **Deprecated** |
| `get_download_link` | `file_id` | 5-minute signed URL for a build file. Needs a verified email and, for paid games, a license. Account only. **Deprecated** |
| `set_game_price` | `uid`, `price_cents` (0 or 99-50000), `donations_enabled` | Owners and game admins. Write |
| `list_game_sales` | `uid` | Sales, donations, refunds, and seller earnings |
| `get_sale_reporter` | `uid` | Reads sale and refund webhooks: enabled, webhook URLs, and that game's signing key. The key is not the review, crash, or bug reporter key. Covered by `mcp:money` |
| `set_sale_reporter` | `uid`, optional `enabled`, `webhooks`, `refresh_signing_key` | Turns sale and refund webhooks on, replaces up to five https URLs, or refreshes the signing key. A refresh returns only the new key. Covered by `mcp:money` |
| `start_payout_setup` | none | Starts or continues Stripe Connect payout setup and returns a Stripe link for the human, who enters identity, tax, and bank details on Stripe only. Needs a verified email. US only. Account only, money write |
| `get_payout_dashboard_link` | none | One-time Stripe Express dashboard link for the human. `4095` until payout setup has started. Account only, money write |
| `cash_out` | `amount_cents` (at least 2500) | Cashes out available earnings to the account's own Stripe payout account without asking the human; the owner is emailed after each agent cash-out. Fees as on the website. Payouts are processed on weekdays from 8:00am to 5:00pm Pacific. `4095` finish payout setup, `4021` not enough available earnings, `4057` below the minimum. Account only, money write |
| `get_patron_status` | `developer` (optional) | Read-only memberships for the caller: tier, billing, status, period end, whether the 12 hour check is open, and license ids. No card data |
| `list_patrons` | `page` (optional) | Developer only. Usernames, tiers, status, and since |
| `get_patron` | `username` | Developer only. One patron's tier, status, and since |
| `list_tiers` | none | Developer only. Tiers and proposed game links |
| `create_tier` | `name`, `rank`, `price_cents`, `billing`, optional `unlock`, `until` | Developer only. Rank, billing, and unlock stay fixed after create |
| `update_tier` | `uid`, optional `name`, `price_cents`, `active` | Developer only. A new price applies to new pledges. `active` hides or shows the tier |
| `delete_tier` | `uid` | Developer only. Refused while a membership is pending or active |
| `list_posts` | `page` (optional) | Developer only. Drafts and published posts, with `tier_uids` |
| `create_post` | `title`, `body`, `status`, `visibility`, `tier_uids` | Developer only. `visibility` is `public` or `tiers` |
| `update_post` | `uid` plus the create fields | Developer only |
| `delete_post` | `uid` | Developer only. The public page then 404s |
| `get_agent_policy` | none | This agent's limit mode (`unset`, `unlimited`, `monthly`, `yearly`, `one_time`), limit, and spend in the period. Changed only on the website. Account only. **Deprecated** |
| `get_approval` | `approval_id` | State of a purchase approval: `pending`, `approved`, `denied`, `expired`, or `used`. Account only |
| `confirm_approval` | `approval_id`, `code` | Approves with the 6-digit code the human read from their email. Account only, write |

Payout setup and cash-out need `mcp:write` or `mcp:money` and an account-level token; project tokens can't use them. They are not deprecated and stay on both servers. See [Agent payouts](../payments/wallet-and-cash-out.md#agent-payouts).

### Sales and review webhooks

`get_sale_reporter` and `set_sale_reporter` use `mcp:money`. `get_review_reporter` is a catalog read, so `mcp:read` can read it, and `set_review_reporter` needs `mcp:catalog.write`. Each list stores up to five URLs and its own signing key. Refreshing one key does not change the others. A Discord webhook URL receives an embed and no file. Any other https URL receives JSON. `http` is allowed only for localhost. The `signature` is base64 HMAC-SHA1 of the JSON body before that field is added, using that list's key. Each URL is posted up to three times with the same signed body. A 2xx stops the retries. One URL failing does not skip the others, and a failed delivery does not fail the sale, refund, or review. The settings response includes `last_delivery` for each URL.

A paid purchase or donation, after it commits. `purchase_uid` is the idempotency key. `kind` is `purchase` or `donation`. `buyer` is the username only.

```json
{"event":"sale","game_uid":"gme_1","game_name":"Example","purchase_uid":"pur_1","kind":"purchase","price_cents":1000,"sale_fee_cents":105,"seller_net_cents":895,"currency":"usd","buyer":"ada","signature":""}
```

A full refund uses the same event name with `partial` false. A partial Stripe refund sets `partial` true and `refunded_cents` to the amount refunded so far. Top-up refunds are not sent. The staff name is not included. `reason` is omitted when empty.

```json
{"event":"refund","game_uid":"gme_1","game_name":"Example","purchase_uid":"pur_1","kind":"purchase","partial":false,"refunded_cents":1000,"currency":"usd","buyer":"ada","reason":"changed mind","signature":""}
```

A new review only. An edit or a delete does not send.

```json
{"event":"review","game_uid":"gme_1","game_name":"Example","review_uid":"rv_1","enjoyed":true,"quality":4,"would_play_with_friends":true,"text":"Worth it","buyer":"ada","signature":""}
```

Field values:

- `visibility`: `draft` (you and admins), `owner` (only you), `invisible` (anyone with the link), or `public`
- `asset_type`: `game`, `application`, `tool`, `mod`, `plugin`, `game_asset`, `dev_asset`, or `rom`
- `adult`: marks 18+ content. See [Content rules](../content-rules.md#adult-content)
- `indexable`: `false` keeps the store page out of search engines. See [SEO and indexing](../seo-and-indexing.md)

## Prompts

| Prompt | Arguments | Purpose |
|--------|-----------|---------|
| `setup_account` | none | Create an account, confirm the email code, and save the first MCP key. No bearer |
| `sign_in` | none | Sign in with email and, when a code is required, confirm it to get the first MCP key. No bearer |
| `draft_game_page` | `pitch` | Draft a name, tagline, and description from a short pitch |
| `improve_game_copy` | `description` | Rewrite an existing description, keeping the facts |
| `analytics_summary` | `uid` | Summarize recent visitors |
| `bootstrap_game` | `pitch`, `uid` (optional) | Create or update the store page and rotate deploy keys so an agent can ship a build |

## Resources

| URI | Contents |
|-----|----------|
| `blazium-games://me` | Authenticated user. Account only |
| `blazium-games://games` | Games list |
| `blazium-games://games/{uid}` | One game page |
| `blazium-games://games/{uid}/analytics` | Visitor analytics |
| `blazium-games://games/{uid}/crashes` | Crash reports |
| `blazium-games://games/{uid}/deploy` | Non-secret deploy endpoints and key prefixes |
| `blazium-games://games/{uid}/builds` | Builds and crash reporter `build_id` values |
| `blazium-games://wallet` | Stored balance and payment rules. Account only. **Deprecated** |
| `blazium-games://library` | Owned games and licenses. Account only. **Deprecated** |
| `ui://blazium-games/account.html` | Account status, with links to finish sign-in on the website |
| `ui://blazium-games/approval.html` | Approval status, confirm link, and the emailed code |
| `ui://blazium-games/dev-game.html` | Store pages you can edit |
| `ui://blazium-games/analytics.html` | Visitor analytics |
| `ui://blazium-games/sales.html` | Sales, and a price form that saves when you click |
| `ui://blazium-games/crashes.html` | Crash reports and a private download link |
| `ui://blazium-games/checkout.html` | Quote, buy, and donate. **Deprecated** with the buying tools after 2026-10-28 |
| `ui://blazium-games/wallet.html` | Balance and a card top-up link. **Deprecated** after 2026-10-28 |
| `ui://blazium-games/library.html` | Owned games and download links. **Deprecated** after 2026-10-28 |

A host that supports MCP Apps renders these `ui://` resources (`text/html;profile=mcp-app`) beside the tool result. You confirm a price change in the sales view. Card payment happens on the Checkout link. Other hosts keep the text result. Key-issuing tools, payout setup, and cash-out stay text-only.

Template `{uid}` values must be a uid or vanity name made of letters, digits, `-` and `_`. Anything else, including dots or slashes, returns an error instead of calling the API.

## Errors

Tool errors return `API <status>: <body>`. Some low codes (`4040`, `4050`–`4056`, `4090`–`4093`) are reused by different routes, so read the message along with the code.

| Code | Meaning |
|------|---------|
| `4010` | Not authenticated |
| `4030` | Not allowed: the game isn't yours, or a project token called an account-level tool or another game |
| `4031` | Token is read-only |
| `4032` | Token mixes developer (`mcp:*`) and player (`player:*`) scopes |
| `4033` | This route isn't available to this server's tokens (for example a player token on a developer route) |
| `4006` | Build not found |
| `4096` | The account email is not verified |
| `4085` | `set_timezone` got a name that isn't an IANA timezone |
| `4020` | Not enough balance; top up first |
| `4221` | No billing address for tax; top up by card once or buy on the website |
| `4023` | Buy the game before downloading it |
| `4094` | The total changed since the quote; confirm again with the human |
| `4099` | The file is still being scanned, or the build has no clean file to promote |
| `4212` | This token can't make purchases (project token, or a player token without `player:buy`) |
| `4214` | Waiting for the human's approval (HTTP 202, returned as a normal result) |
| `4215` | The human denied the request |
| `4216` | Wrong or expired approval code |
| `4095` | The idempotency key belongs to a different purchase, or payout setup isn't finished (payout tools) |
| `4097` | The approval was already used |
| `4098` | The approval was already decided or expired |
| `4083` | Website only (for example account settings, approval links, or key management) |
| `4071` | A taxonomy value isn't allowed; `validate_listing` lists the allowed values |
| `4072` | A similar title isn't a public game, or is this game |
| `4225` | The listing check failed, so the page can't go public (HTTP 422, report in `data.lint`) |
| `4073` | The token's scopes don't cover this tool |
| `4074` | The file isn't on a channel you can see (for example a beta build when you haven't joined the beta) |
| `4075` | The channel has no earlier build to roll back to |
| `4226` | Invalid channel name or `expires_in_hours` out of range (HTTP 422) |
| `4034` | Buying and top-ups moved to the player server; developer tokens can't buy from 2026-10-29 |
| `4076` | Reviews and bug reports need a copy of the game (bought, or downloaded if it's free) |
| `4077` | You can't review your own game |
| `4227` | Invalid review: `enjoyed` missing, `quality` outside 1 to 5, or text too long (HTTP 422) |
| `4291` | Too many bug reports today (10 per player per day, HTTP 429) |
| `4078` | Already friends, or the friend request was already sent (HTTP 409) |
| `4228` | You can't send a friend request to yourself (HTTP 422) |
| `4292` | Too many friend requests today (20 per day, HTTP 429) |
| `4229` | Invalid dependency: unknown kind, a non-public target, a link to itself, or more than 50 links (HTTP 422) |
| `4230` | Invalid engine compatibility: engine or renderer not a slug, a version without numbers, or `min_version` above `max_version` (HTTP 422) |
| `4231` | Unknown license kind (HTTP 422) |
| `4232` | Invalid key pool request: missing name, more than 50 pools, `n` outside 1 to 5000, or a pool over 100,000 keys (HTTP 422) |
| `4233` | Invalid parent: not a game or application, the listing itself, a type that can't have a parent, or an external parent without a name and https link (HTTP 422) |
| `4234` | Invalid mod settings: not a mod or plugin, an absolute or `..` install path, a loader that isn't a slug, or instructions too long (HTTP 422) |
| `4235` | Invalid press kit: a link that isn't https, a bad email or date, or too many items (HTTP 422) |
| `4236` | Invalid tag, or the player already suggested 5 tags for this game (HTTP 422) |
| `4237` | Play the game for at least an hour before suggesting tags (HTTP 403, `play_seconds` and `needed_seconds` in `data`) |
| `4238` | Invalid store link: an unknown store, a link that isn't https on that store's own site, or a second link for the same store (HTTP 422) |
| `4104` | Adult listing: the viewer hasn't turned on adult content (HTTP 403; signed-out viewers get `4004`) |
| `4105` | Developer mode is off on this account (HTTP 403) |
| `4042` | That key or gift link isn't valid (HTTP 404) |
| `4079` | That key was already redeemed (HTTP 409) |
| `4084` | The player already has this game; the key stays unused (HTTP 409) |
| `4103` | The key CSV was already downloaded or has expired (HTTP 410) |
| `4034` | Also: only the project owner can add admins or remove other admins |
| `4040` | Not found (game, build file, crash, crash group, bug ticket, review, approval, purchase, top-up, key, or user; the message says which) |
| `4043` | Key pool or key export not found |
| `4050` | `price_cents` must be 0 or between 99 and 50000 |
| `4051` | Donations are only available on free games |
| `4052` | Donation `amount_cents` must be between 100 and 50000 |
| `4053` | `kind` must be `purchase` or `donation` |
| `4054` | Only the balance can pay here; card payments go through the store page |
| `4055` | `idempotency_key` is required (up to 100 characters) |
| `4056` | Top-up amount out of range |
| `4080` | The project owner turned off MCP access for admins |
| `4081` | Agent spending limits and MCP access settings can only be changed on the website |
| `4082` | Agents pay from the balance, not by card; or only the owner can change MCP access for admins |
| `4090` | Already done: you already own the game, or the crash has no dump, log, or stackwalk to download |
| `4091` | You can't buy your own game |
| `4092` | The game is free |
| `4093` | The game doesn't accept donations |
| `4100` | The top-up expired; create a new one |
| `4130` | Too many crash metadata keys (64) or analytics events in one request (HTTP 413) |
| `4290` | Too many requests, crash reports for the day, analysis requests, or redeem attempts (HTTP 429) |
| `4155` | Invalid edition: slug, name, kind, price, bundle listings or order (HTTP 422) |
| `4156` | The game already has 8 editions (HTTP 422) |
| `4157` | The player already owns this edition or a higher one (HTTP 409) |
| `4158` | A standard analytics event is missing a field or has one out of range (see [Crash reporting](../crash-reporting.md#standard-events)) |
| `4164` | The price comes from the game's editions; change them with `upsert_sku` instead of `set_game_price` (HTTP 409) |
| `4165` | This game sells beta access as an edition; buy it to join the beta (HTTP 402, editions in `data.skus`) |
| `5030` | A download URL couldn't be signed; try again |
| `5031` | Email codes aren't configured on the server |
| `5032` | Payments, or a sign-in provider, aren't configured on the server |
| `5033` | x402 top-ups aren't configured on the server |
