---
title: Player MCP
sidebar_position: 5
description: Connect an agent to your Blazium Games account as a player to search the catalog, check your wallet and library, top up, buy games within your spending limit, and install or launch them through the Blazium launcher.
---

# Player MCP

The player server acts for you as a player. It can search the catalog, see your account, wallet, and library, top up your balance, buy games and donate within the spending limit you set, fetch download links, and hand installs and launches to the Blazium launcher. It cannot touch game pages, builds, crash reports, analytics, or keys; those are on the [developer server](./index.md).

| | Developer server | Player server |
|---|---|---|
| URL | `https://mcp.blazium.games/mcp` | `https://mcp.blazium.games/player` |
| Scopes | `mcp:read`, `mcp:write` | `player:read`, `player:write`, `player:buy` |
| API key prefix | `bgames_mcp_` | `bgames_play_` |
| Server card | `/.well-known/mcp/server-card.json` | `/.well-known/mcp/player-server-card.json` |

A token belongs to exactly one server. A developer key or token is refused by `/player`, and a player key or token is refused by `/mcp`. A token can't hold both `mcp:*` and `player:*` scopes (`4032`).

## Connect with OAuth (recommended)

Add the server to your client with no token:

```json
{
  "mcpServers": {
    "blazium-games-player": {
      "url": "https://mcp.blazium.games/player"
    }
  }
}
```

Your client discovers OAuth from `https://mcp.blazium.games/.well-known/oauth-protected-resource/player` and opens the Blazium Games consent page. There is no project picker. Tick **Allow purchases** only if the agent should buy for you; without it the token has `player:read player:write` and every purchase call returns `4212`. Tick **Read-only access** to grant `player:read` only.

## Connect with a player key

Create a player key at [blazium.games/settings/mcp](https://blazium.games/settings/mcp) under **Player MCP**. Untick **Allow purchases** to create a key without `player:buy`. The key is shown once; send it as `Authorization: Bearer bgames_play_...`. Rotating revokes all your player keys and leaves your developer keys alone.

## Scopes

| Scope | Allows |
|---|---|
| `player:read` | Account, wallet, ledger, payment options, top-up status, quotes, purchase status, library, download links, approvals, agent policy |
| `player:write` | Email verification, play time, confirming an approval with the emailed code |
| `player:buy` | Card and x402 top-ups, `purchase_game`, `donate_to_game` |

A route outside this list returns `4033`. A missing `player:buy` returns `4212`; any other missing scope returns `4031`.

## Spending limits and approval

Purchases always come from your stored balance. Set a limit per agent at [blazium.games/settings/mcp](https://blazium.games/settings/mcp): ask every time, unlimited, monthly, yearly, or a one-time budget. Anything beyond the limit waits for you to approve it by email link or code. See [Agent purchases](../payments/agent-purchases.md).

## Tools

| Tool | Inputs | Scope | Notes |
|------|--------|-------|-------|
| `get_account` | none | read | Email verification, balances, and what the account may do |
| `request_email_code` | none | write | Emails a verification code to you |
| `verify_email` | `code` | write | Verifies your email with the code |
| `get_wallet` | none | read | Credit, pending, and available balances plus fee and refund rules |
| `list_wallet_transactions` | `limit` (1-200), `before` | read | Ledger entries, newest first |
| `get_payment_options` | none | read | Card top-up and x402 USDC networks with fees |
| `create_top_up_link` | `amount_cents` | buy | Card Checkout link for you to add balance |
| `create_x402_top_up` | `amount_cents`, `network` | buy | x402 payment requirements for a USDC top-up |
| `pay_with_x402` | `top_up_id`, `payment_payload` | buy | Submits the signed x402 payment |
| `quote_purchase` | `uid`, `kind`, `amount_cents` | read | Price, tax, and total. The agent shows you the total first |
| `purchase_game` | `uid`, `confirm_total_cents`, `idempotency_key` | buy | Buys a license from your balance. Beyond the limit it returns `approval_required` |
| `donate_to_game` | `uid`, `amount_cents`, `confirm_total_cents`, `idempotency_key` | buy | Donates to a free game from your balance |
| `get_approval` | `approval_id` | read | `pending`, `approved`, `denied`, `expired`, or `used` |
| `confirm_approval` | `approval_id`, `code` | write | Approves with the 6-digit code you read to the agent |
| `get_library` | none | read | Games you own, with refund windows and play time |
| `get_download_link` | `file_id` | read | 5-minute signed URL for a build file |
| `get_agent_policy` | none | read | This agent's limit mode, limit, and spend in the period |
| `search_catalog` | `q`, `asset_type`, `genres`, `tags`, `tone`, `session_bucket`, `net`, `players`, `os`, `arch`, `sort`, `page`, `page_size` | read | Public games with a score, scan state, platforms, and a short reason for each match. See [Listings and search](../listings.md#search) |
| `get_game_details` | `uid` | read | Description, taxonomy, price, files with scan state and checksum, similar titles, and whether you own it |
| `install_build` | `uid`, `build_id`, `os`, `arch` | read | Checks your license and the virus scan, then returns the file checksum, a 5-minute `download_url`, and a `blazium://install/<uid>` link for the launcher. Refuses any file that isn't `clean` |
| `launch_game` | `uid` | read | Returns the `blazium://game/<uid>` link that opens the game in the launcher, and whether you own it and a clean build exists |

`install_build` and `launch_game` never install or run anything on the server or your machine; the agent gives you the `blazium://` link, or your client opens it, and the Blazium launcher does the rest.

## Resources

| URI | Contents |
|-----|----------|
| `blazium-games://me` | Account status, verification, and what the account may do |
| `blazium-games://wallet` | Stored balance and payment rules |
| `blazium-games://library` | Owned games and licenses |

## Moving from the developer server

Until 2026-10-28 the developer server still lists `get_wallet`, `list_wallet_transactions`, `get_payment_options`, `create_top_up_link`, `create_x402_top_up`, `pay_with_x402`, `quote_purchase`, `purchase_game`, `donate_to_game`, `get_agent_policy`, `list_library`, and `get_download_link`, marked deprecated. After that date they are only on `/player`. `list_library` is named `get_library` here. See [Versioning](./versioning.md).
