---
title: Reference
sidebar_position: 4
description: Every tool, prompt, and resource exposed by the Blazium Games developer MCP server.
---

# Reference

This page covers the developer server at `https://mcp.blazium.games/mcp`. The player server is on [Player MCP](./player.md).

`uid` accepts a game uid or its vanity name. "Account only" means a project-bound token is refused. "Write" means the token needs `mcp:write`.

## Tools

| Tool | Inputs | Notes |
|------|--------|-------|
| `get_profile` | none | Current user. Account only |
| `list_games` | none | Games you own or administer, and pending admin invites |
| `get_game` | `uid` | One game's settings |
| `create_game` | `name` (required), `tagline`, `description`, `visibility`, `asset_type`, `vanity_name` | New game page. Account only, write |
| `update_game` | `uid` (required), `name`, `tagline`, `description`, `visibility` | Update a page. Setting `public` fails with `4225` until the listing check passes. Write |
| `get_game_analytics` | `uid` | Visitor analytics |
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
| `list_crash_groups` | `uid` | Crash reports grouped by cause, busiest first, with counts per build and a `sample_crash_id` for `get_crash` |
| `get_build_provenance` | `uid`, `file_uid` | Uploader, how it was uploaded (`deploy_key` with an 8-character `key_ref`, or `website`), upload time, checksum, and scan history. Never returns a secret |

Crash groups use the top stack frames once a minidump has been stackwalked, and the crash message, app version, and OS before that. Grouping runs every 10 minutes.

### Approvals for risky actions

Over MCP, rotating an account or deploy key, creating an account or game key, promoting to `stable`, and deleting a game or build wait for the account owner. The call returns HTTP 202 with code `4214`, an `approval_id`, and a `confirm_url`, and the owner gets an email with a link and a 6-digit code. Once `get_approval` says `approved` (or after `confirm_approval` with the code), repeat the call with the same `idempotency_key`; without one, the same agent repeating the same action reuses the pending approval. Each approval works once. On the website these actions don't need an approval.

### Scopes

`mcp:read` and `mcp:write` cover every developer tool. OAuth consent can grant narrower scopes instead:

| Scope | Covers |
|-------|--------|
| `mcp:catalog.write` | Game pages, taxonomy, similar titles, media, admins |
| `mcp:build.write` | Builds, channels, deploy info, scan status |
| `mcp:crash.read` | Crash reports, crash groups, crash analysis |
| `mcp:analytics.read` | Visitor analytics and events |
| `mcp:keys.manage` | Deploy keys and MCP keys |
| `mcp:money` | Pricing, sales, wallet, purchases, library, downloads |

Every developer token can read the profile, account, and game pages. A write scope also reads its own group. A call outside the token's scopes returns `4073`, or `4031` if the token has no write scope at all. The consent page offers presets: **Store page** (`mcp:read mcp:catalog.write`), **CI** (`mcp:read mcp:build.write`), **Crash triage** (`mcp:crash.read mcp:analytics.read`), **Keys** (`mcp:read mcp:keys.manage`), **Money** (`mcp:read mcp:money`), **Read-only** (`mcp:read`), and **Full access**.

### Listings

See [Listings and search](../listings.md) for the allowed values and the listing check.

| Tool | Inputs | Notes |
|------|--------|-------|
| `validate_listing` | `uid` | Listing check: `ready`, `errors` (block going public), `warnings`, `passes`, plus the current taxonomy and allowed values |
| `update_game_taxonomy` | `uid` (required), `genres`, `tags`, `tone`, `inputs`, `content_warnings`, `engines`, `session_bucket`, `net`, `players_min`, `players_max` | Only the fields you pass change. Write |
| `set_similar_games` | `uid`, `games` (up to 10 uids or vanity names) | Replaces the similar titles; an empty list clears them. Write |
| `set_media` | `uid`, `kind` (`cover`, `thumbnail`, or `gallery`), `url` | Fetches an https image (PNG, JPEG, GIF, or WebP, up to 2048 px and 10 MB) and sets it. Without `url` it returns the upload route instead. Write |
| `scan_status` | `uid` | Scan state and history of every build file, plus files removed in the last 30 days because their scan failed |

### Account and payments

Amounts are integer US cents. See [Payments](../payments/index.md) for the rules behind these tools.

The wallet, top-up, purchase, donation, `get_agent_policy`, `list_library`, and `get_download_link` tools and the `wallet` and `library` resources are deprecated on this server and removed after 2026-10-28. Use the [player server](./player.md) instead, where `list_library` is `get_library`. See [Versioning](./versioning.md).

| Tool | Inputs | Notes |
|------|--------|-------|
| `get_account` | none | Email verification, balances, and what the account may do. Account only |
| `request_email_code` | none | Emails a verification code to the account owner. Account only, write |
| `verify_email` | `code` | Verifies the email with the code the human received. Account only, write |
| `get_wallet` | none | Credit, pending, and available balances plus fee and refund rules. Account only |
| `list_wallet_transactions` | `limit` (1-200), `before` | Ledger entries, newest first. Account only |
| `get_payment_options` | none | Card top-up and x402 USDC networks with fees. Account only |
| `create_top_up_link` | `amount_cents` | Card Checkout link for the human to add balance. Account only, write |
| `create_x402_top_up` | `amount_cents`, `network` | x402 payment requirements for a USDC top-up. Account only, write |
| `pay_with_x402` | `top_up_id`, `payment_payload` | Submits the signed x402 payment. Credit arrives after settlement. Account only, write |
| `quote_purchase` | `uid`, `kind` (`purchase` or `donation`), `amount_cents` (donations) | Price, tax, and total. Show the total to the human first. Account only, write |
| `purchase_game` | `uid`, `confirm_total_cents`, `idempotency_key` | Buys a license from the balance. Beyond this agent's limit it returns `approval_required`; retry with the same key once approved. Account only, write |
| `donate_to_game` | `uid`, `amount_cents`, `confirm_total_cents`, `idempotency_key` | Donates to a free game from the balance. Account only, write |
| `list_library` | none | Owned games with refund windows and playtime. Account only |
| `get_download_link` | `file_id` | 5-minute signed URL for a build file. Needs a verified email and, for paid games, a license. Account only |
| `set_game_price` | `uid`, `price_cents` (0 or 99-50000), `donations_enabled` | Owners and game admins. Write |
| `list_game_sales` | `uid` | Sales, donations, refunds, and seller earnings |
| `get_agent_policy` | none | This agent's limit mode (`unset`, `unlimited`, `monthly`, `yearly`, `one_time`), limit, and spend in the period. Changed only on the website. Account only |
| `get_approval` | `approval_id` | State of a purchase approval: `pending`, `approved`, `denied`, `expired`, or `used`. Account only |
| `confirm_approval` | `approval_id`, `code` | Approves with the 6-digit code the human read from their email. Account only, write |

Cash-out and payout setup are website-only.

Field values:

- `visibility`: `draft`, `invisible`, or `public`
- `asset_type`: `game`, `application`, `mod`, `game_asset`, or `dev_asset`

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
| `blazium-games://wallet` | Stored balance and payment rules. Account only |
| `blazium-games://library` | Owned games and licenses. Account only |

## Errors

Tool errors return `API <status>: <body>`.

| Code | Meaning |
|------|---------|
| `4010` | Not authenticated |
| `4030` | Not allowed for this game |
| `4031` | Token is read-only |
| `4032` | Token mixes developer (`mcp:*`) and player (`player:*`) scopes |
| `4033` | This route isn't available to this server's tokens (for example a player token on a developer route) |
| `4006` | Build not found |
| `4096` | The account email is not verified |
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
