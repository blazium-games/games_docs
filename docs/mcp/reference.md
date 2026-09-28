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
| `update_game` | `uid` (required), `name`, `tagline`, `description`, `visibility` | Update a page. Write |
| `get_game_analytics` | `uid` | Visitor analytics |
| `list_game_crashes` | `uid` | Recent crash reports |
| `get_crash` | `uid`, `crash_id` | One crash report including stack excerpt |
| `request_crash_download` | `uid`, `crash_id`, `kind` | Private download URL for `dump`, `log`, or `stack`, valid for 1 hour |
| `list_mcp_keys` | none | Account key prefixes only. Account only |
| `get_setup` | none | Account, games, public URLs, latest `build_id`. No secrets. Account only |
| `get_deploy_info` | `uid` | Upload, crash, and page URLs, build list, and deploy key prefixes. No secrets |
| `list_game_builds` | `uid` | Builds. `build_id` is the build UID for CI and crash reporters (`X-Build-Id`), not a version string |
| `get_game_build` | `uid`, `build_id` | One build, its files, and crash reporter headers |
| `request_mcp_key` | none | New account key. **Revokes all previous account keys.** Account only, write |
| `request_deploy_key` | `uid` | New upload keys for CLI and CI. **Revokes that project's previous upload keys.** Write |

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
| `4099` | The file is still being scanned |
| `4212` | This token can't make purchases (project token, or a player token without `player:buy`) |
| `4214` | Waiting for the human's approval (HTTP 202, returned as a normal result) |
| `4215` | The human denied the request |
| `4216` | Wrong or expired approval code |
| `4095` | The idempotency key belongs to a different purchase |
| `4097` | The approval was already used |
| `4098` | The approval was already decided or expired |
| `4083` | Website only (payout setup and cash-out) |
