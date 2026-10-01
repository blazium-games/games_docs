---
title: Reference
sidebar_position: 4
description: Every tool, prompt, and resource exposed by the Blazium Games developer MCP server.
---

# Reference

This page covers the developer server at `https://mcp.blazium.games/mcp`. The player server is on [Player MCP](./player.md).

`uid` accepts a game uid or its vanity name. "Account only" means a project-bound token is refused with `4030`. "Write" means the token needs `mcp:write` or the narrower write scope for that tool's group (see [Scopes](#scopes)). "Deprecated" tools are removed on 2026-10-28 (see [Account and payments](#account-and-payments)).

## Tools

| Tool | Inputs | Notes |
|------|--------|-------|
| `get_profile` | none | Current user. Account only |
| `list_games` | none | Games you own or administer, and pending admin invites |
| `get_game` | `uid` | One game's settings |
| `create_game` | `name` (required), `tagline`, `description`, `visibility`, `asset_type`, `vanity_name`, `adult`, `indexable`, `parent` | New store page. Tools, mods and plugins need a `parent` before they can go public. Needs [developer mode](../developer-mode.md) (`4105`). Account only, write |
| `update_game` | `uid` (required), `name`, `tagline`, `description`, `visibility`, `asset_type`, `adult`, `indexable`, `parent` | Update a page; only the fields you pass change. Setting `public` fails with `4225` until the listing check passes. An empty `parent` object clears the parent. Write |
| `get_game_analytics` | `uid` | Visitor analytics and the 30-day `downloads` block (see [Download analytics](../download-analytics.md)) |
| `list_game_crashes` | `uid` | Recent crash reports |
| `get_crash` | `uid`, `crash_id` | One crash report including stack excerpt |
| `request_crash_download` | `uid`, `crash_id`, `kind` | Private download URL for `dump`, `log`, or `stack`, valid for 1 hour |
| `list_mcp_keys` | none | Account key prefixes only. Account only |
| `get_setup` | none | Account, games, public URLs, latest `build_id`. No secrets. Account only |
| `get_deploy_info` | `uid` | Upload, crash, and page URLs, build list, and deploy key prefixes. No secrets |
| `list_game_builds` | `uid` | Builds. `build_id` is the build UID for CI and crash reporters (`X-Build-Id`), not a version string |
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
| `reply_to_review` | `uid`, `review_uid`, `text` | Public reply shown under the review on the store page (up to 2000 characters). Empty text removes it. Write |
| `list_bug_tickets` | `uid`, `status` (`open`, `fixed`, `closed`) | Tickets, newest first, with counts by status. A ticket with an attached dump or log has a `crash_id` for `get_crash` and `request_crash_download` |
| `update_bug_ticket` | `uid`, `bug_uid`, `status` (`open`, `fixed`, or `closed`) | Marks a ticket fixed or closed, or reopens it with `open`. Covered by `mcp:crash.read` |

Only the game's owner and admins can read bug tickets and download their attachments.

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

`mcp:read` and `mcp:write` cover every developer tool. OAuth consent can grant narrower scopes instead:

| Scope | Covers |
|-------|--------|
| `mcp:catalog.write` | Game pages, taxonomy, similar titles, dependencies, engine compatibility, license kind, media, review replies, mod settings, press kits, community tags |
| `mcp:build.write` | Builds, channels, deploy info, scan status, symbols, bundle check |
| `mcp:crash.read` | Crash reports, crash groups, crash analysis, bug tickets, including `update_bug_ticket` |
| `mcp:analytics.read` | Visitor analytics and events |
| `mcp:keys.manage` | Deploy keys, MCP keys, MCP access for admins, and project admins |
| `mcp:money` | Pricing, editions, sales, game keys and gift links, wallet, purchases, library, downloads |

Every developer token can read the profile, account, and game pages. A write scope also reads its own group; the crash and analytics scopes also cover their actions. A call outside the token's scopes returns `4073`, or `4031` if the token has no write scope at all. The consent page offers presets: **Store page** (`mcp:read mcp:catalog.write`), **CI** (`mcp:read mcp:build.write`), **Crash triage** (`mcp:crash.read mcp:analytics.read`), **Keys** (`mcp:read mcp:keys.manage`), **Money** (`mcp:read mcp:money`), **Read-only** (`mcp:read`), and **Full access**.

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

The tools marked **Deprecated** below and the `wallet` and `library` resources are removed from the developer server at the end of 2026-10-28 (UTC), including from servers that are already running. The developer server then lists 60 tools instead of 72. From 2026-10-29 the API also refuses purchases and top-ups made with developer tokens (`4034`). Use the [player server](./player.md) instead, where `list_library` is `get_library`. See [Versioning](./versioning.md).

| Tool | Inputs | Notes |
|------|--------|-------|
| `get_account` | none | Email verification, timezone, balances, what the account may do, and the website sign-in steps still open: `legal_acceptance_required` (with `legal_changes`), `setup_required`, `authenticator` (`on`, `skipped`, or `not_chosen`), and `gate` (empty when none). Send the human to blazium.games/account/finish for an open step; never accept terms, finish setup, or set up or skip an authenticator for them. Account only |
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
| `get_agent_policy` | none | This agent's limit mode (`unset`, `unlimited`, `monthly`, `yearly`, `one_time`), limit, and spend in the period. Changed only on the website. Account only. **Deprecated** |
| `get_approval` | `approval_id` | State of a purchase approval: `pending`, `approved`, `denied`, `expired`, or `used`. Account only |
| `confirm_approval` | `approval_id`, `code` | Approves with the 6-digit code the human read from their email. Account only, write |

Cash-out and payout setup are website-only.

Field values:

- `visibility`: `draft`, `invisible`, or `public`
- `asset_type`: `game`, `application`, `tool`, `mod`, `plugin`, `game_asset`, or `dev_asset`
- `adult`: marks 18+ content. See [Content rules](../content-rules.md#adult-content)
- `indexable`: `false` keeps the store page out of search engines. See [SEO and indexing](../seo-and-indexing.md)

## Prompts

| Prompt | Arguments | Purpose |
|--------|-----------|---------|
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
| `4095` | The idempotency key belongs to a different purchase |
| `4097` | The approval was already used |
| `4098` | The approval was already decided or expired |
| `4083` | Website only (payout setup and cash-out) |
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
