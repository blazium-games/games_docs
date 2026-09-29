# Blazium Games MCP tools

All tools call the Blazium Games API on behalf of the connected user. `uid` accepts a game uid or its vanity name. Tools marked **account** need an account-level token (a project token gets `4030`); tools marked **write** need `mcp:write` or the narrower write scope for that tool's group. Tools marked **deprecated** are removed from this server on 2026-10-28; use the player server at `https://mcp.blazium.games/player` instead.

| Tool | Inputs | Access | What it does |
|------|--------|--------|--------------|
| `get_profile` | none | account | Authenticated user profile |
| `get_setup` | none | account | Account, games, public URLs, and key prefixes. No secrets |
| `list_games` | none | | Games the user owns or admins, plus pending admin invites |
| `get_game` | `uid` | | One game's settings and store page fields |
| `create_game` | `name` (required), `tagline`, `description`, `visibility`, `asset_type`, `vanity_name` | account, write | Create a store page |
| `update_game` | `uid` (required), `name`, `tagline`, `description`, `visibility` | write | Update a store page |
| `get_game_analytics` | `uid` | | Visitor analytics: views, unique visitors, countries, actions |
| `list_game_crashes` | `uid` | | Recent crash reports |
| `get_crash` | `uid`, `crash_id` | | One crash with metadata, analysis, and stack availability |
| `request_crash_download` | `uid`, `crash_id`, `kind` (`dump`, `log`, or `stack`; default `dump`) | | Private download URL valid for 1 hour |
| `get_deploy_info` | `uid` | | Upload, crash, and events URLs, recent builds, env var names, deploy key prefixes. No secrets |
| `list_game_builds` | `uid` | | Up to 50 builds. Each `build_id` is the `X-Build-Id` for crash reporters |
| `get_game_build` | `uid`, `build_id` | | One build with its files and crash reporter headers |
| `list_mcp_keys` | none | account | MCP API key prefixes. Secrets are never returned |
| `request_mcp_key` | `idempotency_key` | account, write | Issue a new MCP API key and invalidate every previous one. Waits for the human's approval, then returns the secret once |
| `request_deploy_key` | `uid`, `idempotency_key` | write | Issue a new upload `access_token` and `secret_key` for a game and invalidate the previous ones. Waits for the human's approval, then returns secrets once |
| `list_channels` | `uid` | | Channel pointers (stable, beta, dev, custom), expiry, beta subscribers, and history |
| `promote_build` | `uid`, `channel`, `build_id`, `expires_in_hours`, `idempotency_key` | write | Point a channel at a clean build. `stable` waits for the human's approval |
| `rollback_channel` | `uid`, `channel` | write | Move a channel back to its previous build |
| `list_crash_groups` | `uid` | | Up to 100 crash groups by cause, most recently seen first, with counts per build and a sample crash id |
| `get_build_provenance` | `uid`, `file_uid` | | Uploader, deploy key reference, upload time, checksum, and scan history of a file |
| `list_reviews` | `uid`, `unreplied`, `page` | | Player reviews with the summary (enjoyed, quality average and counts, would play with friends) |
| `reply_to_review` | `uid`, `review_uid`, `text` | write | Public reply to a review; empty text removes it |
| `list_bug_tickets` | `uid`, `status` | | Player bug tickets with counts by status; attachments carry a `crash_id` |
| `update_bug_ticket` | `uid`, `bug_uid`, `status` (`open`, `fixed`, `closed`) | write | Mark a ticket fixed or closed, or reopen it; covered by `mcp:crash.read` |
| `declare_dependency` | `uid`, `target_uid`, `kind`, `remove` | write | Link to another public listing: `uses`, `supports`, or `made_with` |
| `list_dependents` | `uid` | | What a listing uses and which listings use it, plus license kind and compatibility |
| `declare_engine_compat` | `uid`, `compat` | write | Replace the engine version ranges (engine, min/max version, renderer, platform) |
| `declare_license` | `uid`, `license_kind` | write | `cc0`, `cc-by`, `cc-by-sa`, `paid`, `source-available`, or `proprietary` |
| `create_key_pool` | `uid`, `name`, `campaign` | write | A named pool for redeemable game keys |
| `grant_keys` | `uid`, `pool`, `n`, `campaign`, `idempotency_key` | write | Create 1-5000 keys; returns a one-time `csv_url` (1 hour). Over 100 needs the owner's approval |
| `create_gift_link` | `uid`, `pool`, `note` | write | A single-use redeem link for one person, shown once |
| `list_key_pools` | `uid` | | Pools with size, redeemed, unredeemed, and gift link counts |
| `validate_listing` | `uid` | | Listing check (errors block going public), current taxonomy, and allowed values |
| `update_game_taxonomy` | `uid`, `genres`, `tags`, `tone`, `inputs`, `content_warnings`, `engines`, `session_bucket`, `net`, `players_min`, `players_max`, `authorship`, `authorship_credit` | write | Set the taxonomy and the made-with label (`human`, `human_agent`, `agent_heavy`, empty clears; credit up to 120 characters); only passed fields change |
| `set_similar_games` | `uid`, `games` | write | Replace the similar titles (up to 10) |
| `set_media` | `uid`, `kind` (`cover`, `thumbnail`, `gallery`), `url` | write | Set an image from an https URL (PNG, JPEG, GIF, WebP; 2048 px, 10 MB). Without `url` it returns the `chauffeur media` command for local files |
| `scan_status` | `uid` | | Virus-scan state and history per build file, and files removed for failing the scan |

## Builds, health and editions

MCP never uploads files: builds, symbols and store images go through the chauffeur CLI with the game's deploy key.

| Tool | Inputs | Access | What it does |
|------|--------|--------|--------------|
| `get_build_health` | `uid` | | Per-build devices, boot-ok and crash-on-boot counts, median session and band over 30 days (`excellent`, `healthy`, `mixed`, `problematic`, or `unrated` below 20 devices) |
| `list_build_symbols` | `uid`, `build_id` | | Breakpad symbol files for a build, plus the `chauffeur symbols` command |
| `delete_build_symbols` | `uid`, `build_id`, `symbol_uid` | write | Delete one symbol file, or all of them when `symbol_uid` is empty |
| `upload_symbols_info` | `uid`, `build_id` | | The exact `chauffeur symbols` command and limits for a build. Uploads nothing |
| `bundle_check` | `uid`, `build_id` | | Informational: store asset packs found inside the build and whether each is `owned`, `licensed`, `attribution`, or `unlicensed` |
| `mod_compat` | `uid` (a mod), `game` | | The mod's engine compatibility against each supported game's current builds: `compatible`, `incompatible`, or `unknown` |
| `list_skus` | `uid` | | Editions with slug, kind, price, active flag, order, and bundle listings |
| `upsert_sku` | `uid`, `sku_uid`, `slug`, `name`, `description`, `kind`, `price_cents`, `bundle_asset_uids`, `active`, `sort_order` | write | Create an edition, or replace one when `sku_uid` is set. Kinds: `standard`, `deluxe`, `beta_access`, `bundle`. Up to 8; the listed price follows the cheapest active one |
| `delete_sku` | `uid`, `sku_uid` | write | Retire an edition; owners keep it |

## Account and payments

Amounts are integer US cents. Agents pay only from the stored balance, and only after the human approves the quoted total. Workflow: [blazium-games-purchases](../../blazium-games-purchases/SKILL.md).

| Tool | Inputs | Access | What it does |
|------|--------|--------|--------------|
| `get_account` | none | account | Email verification, balances, and what the account may do (publish, upload, download, buy) |
| `request_email_code` | none | account, write | Email a verification code to the human |
| `verify_email` | `code` | account, write | Verify the email with the code the human read from their inbox |
| `get_wallet` | none | account | Credit, pending, and available balances with fee, refund, and cash-out rules. **Deprecated** |
| `list_wallet_transactions` | `limit` (1-200, default 50), `before` | account | Ledger entries, newest first. **Deprecated** |
| `get_payment_options` | none | account | Card top-up link option and x402 USDC networks with fees. **Deprecated** |
| `create_top_up_link` | `amount_cents` (500-50000) | account, write | Card Checkout link for the human; agents cannot pay by card. **Deprecated** |
| `create_x402_top_up` | `amount_cents`, `network` (default Base) | account, write | x402 payment requirements to sign with the agent's own wallet. **Deprecated** |
| `pay_with_x402` | `top_up_id`, `payment_payload` | account, write | Submit the signed payment; credit is added after on-chain settlement. **Deprecated** |
| `quote_purchase` | `uid`, `kind` (`purchase` or `donation`), `amount_cents` (donations) | account, write | Price, tax, and `total_cents` to show the human. **Deprecated** |
| `purchase_game` | `uid`, `confirm_total_cents`, `idempotency_key` | account, write | Buy a license from the balance; beyond the agent's limit returns `approval_required`. **Deprecated** |
| `donate_to_game` | `uid`, `amount_cents`, `confirm_total_cents`, `idempotency_key` | account, write | Donate to a free game from the balance. **Deprecated** |
| `list_library` | none | account | Owned games with refund windows and playtime. **Deprecated** |
| `get_download_link` | `file_id` | account | 5-minute signed URL for a build file; needs a verified email and, for paid games, a license. **Deprecated** |
| `set_game_price` | `uid`, `price_cents` (0 or 99-50000), `donations_enabled` | write | Set price or donations. Owners and game admins only |
| `list_game_sales` | `uid` | | Sales, donations, refunds, and seller earnings for a game you manage |
| `get_agent_policy` | none | account | This agent's limit mode, limit, and spend in the period; only the human changes them, on the website. **Deprecated** |
| `get_approval` | `approval_id` | account | State of a purchase approval |
| `confirm_approval` | `approval_id`, `code` | account, write | Approve with the 6-digit code the human read from their email |

Payout setup and cash-out are website-only.

## Field values

- `visibility`: `draft`, `invisible`, or `public`
- `asset_type`: `game`, `application`, `mod`, `game_asset`, or `dev_asset`
- `build_id`: the build UID (for example `004e044e-...`), not a version string

## Errors

Tool errors come back as `API <status>: <body>`. Common bodies:

| Code | Meaning |
|------|---------|
| `4010` | Not authenticated |
| `4030` | Not allowed: the game isn't yours, or a project token called an account-level tool or another game. Reconnect with **Account** |
| `4031` | Token is read-only |
| `4034` | Buying moved to the player server, or only the project owner can manage admins |
| `4040` | Not found (the message says what) |
| `4090` | Already done: the game is already owned, or the crash has no such file to download |
| `4091` | You can't buy your own game |
| `4092` | The game is free |
| `4093` | The game doesn't accept donations |
| `4006` | Build not found |
| `4096` | Email not verified; use `request_email_code` and `verify_email` |
| `4020` | Not enough balance; top up first |
| `4221` | No billing address for tax; top up by card once or buy on the website |
| `4023` | Buy the game before downloading it |
| `4094` | Total changed since the quote; confirm again with the human |
| `4099` | File still being scanned |
| `4212` | This token can't make purchases |
| `4214` | Waiting for the human's approval (a normal result, not an error) |
| `4215` | The human denied the request |
| `4216` | Wrong or expired approval code |
| `4083` | Website only |
| `4071` | Taxonomy value not allowed |
| `4072` | Similar title isn't a public game, or is this game |
| `4225` | Listing check failed, so the page can't go public. Run `validate_listing` |
| `4073` | The token's scopes don't cover this tool; reconnect with a wider preset |
| `4074` | File isn't on a channel this account can see |
| `4075` | Nothing to roll back to |
| `4226` | Invalid channel name or expiry |
| `4155` | Invalid edition |
| `4156` | The game already has 8 editions |
| `4164` | The price comes from the editions; change them with `upsert_sku` |
