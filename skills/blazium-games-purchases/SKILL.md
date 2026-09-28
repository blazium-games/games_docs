---
name: blazium-games-purchases
description: Buy games and donate on Blazium Games from the account's stored balance, with the human's approval of every total. Quotes the price and tax, confirms with the human, buys with an idempotency key, handles low balance and per-agent spending limits, tops up by card link or x402 USDC, and fetches download links. Use when the user wants to buy, purchase, donate to, or download a game on Blazium Games, check their balance or library, or add balance.
license: MIT
---

# Blazium Games: Purchases

Agents buy only from the stored balance, only within the limit the human set for this agent, and only after the human approves the exact total.

## Invoke This Skill When

- "Buy <game> on Blazium Games", "donate $5 to <game>"
- "What's my Blazium Games balance?", "add $20 to my balance"
- "Download <game>", "what games do I own?"

## Prerequisites

- The `blazium-games` MCP server is connected with write access and an account-level token (project-bound tokens cannot buy)
- The account email is verified
- The human has turned on purchases for this agent at https://blazium.games/settings/mcp and set a monthly limit

## Phase 1: Check the account

1. Call `get_account`. If `email_verified` is false, call `request_email_code`, ask the human for the code from their inbox, and call `verify_email`.
2. Call `get_agent_policy`. If purchases are off or the limit is too low, tell the human to change it at https://blazium.games/settings/mcp. You cannot change it.
3. Call `list_library` to see whether the game is already owned. If it is, skip to Phase 5.

## Phase 2: Quote

Call `quote_purchase` with the game `uid` (or vanity name). For a donation to a free game, pass `kind: "donation"` and `amount_cents` (100 to 50000).

The quote returns price, tax, and `total_cents`. Tax depends on the human's saved address.

## Phase 3: Confirm with the human

Show the game, price, tax, and total in dollars, and say it will come from their Blazium Games balance. Wait for an explicit yes. Never buy on an assumed or earlier approval.

## Phase 4: Buy

Call `purchase_game` (or `donate_to_game` with the same `amount_cents`) with:

| Field | Value |
|-------|-------|
| `uid` | The game |
| `confirm_total_cents` | `total_cents` the human approved |
| `idempotency_key` | A new unique string, for example a UUID. Reuse it only to retry this same purchase after a network error |

| Code | What to do |
|------|------------|
| `4094` | The total changed. Show the new total from the error and ask again, then retry with a new idempotency key |
| `4020` | Not enough balance. Go to Phase 6 |
| `4221` | No billing address for tax. The human must top up by card once (`create_top_up_link`) or buy on the website |
| `4212` | Purchases are off for this agent. The human enables them in MCP settings |
| `4213` | Over this agent's monthly limit. The human can raise it in MCP settings |
| `4096` | Email not verified. Go back to Phase 1 |
| `4091` / `4092` | The human owns the game, or it is free (no purchase needed) |

## Phase 5: Download

1. Take `developer` and `vanity_name` (or `game_uid`) from `list_library`.
2. Read the public page data (no auth): `GET https://api.blazium.games/api/v1/public/user/<developer>/games/<vanity_name>`. Pick the file for the human's OS and arch from `data.files[]` and keep its `uid`.
3. Call `get_download_link` with `file_id` set to that `uid`. The link lasts 5 minutes; give it to the human right away.

Free games can be downloaded the same way without buying. If the error is `4099`, the file is still being scanned; try again later.

## Phase 6: Add balance

Call `get_wallet` and `get_payment_options`, then either:

- **Card:** `create_top_up_link` with `amount_cents` (500 to 50000). Give the URL to the human; you cannot pay by card. Check `get_wallet` after they say it is done.
- **USDC over x402:** only if you have your own wallet and the human agreed. Call `create_x402_top_up` (`amount_cents`, optional `network`), sign a payment for exactly the returned requirements, then call `pay_with_x402` with `top_up_id` and the signed `payment_payload`. Credit appears after settlement.

Top-ups add a processing fee (shown by `get_payment_options`). Credit can be spent but never cashed out.

## Rules to tell the human when relevant

- Refunds are only through support@blazium.games, within 7 days and before 2 hours of play.
- Cash-out and payout setup are website-only.

## Docs

- https://blazium-games.github.io/games_docs/docs/payments/agent-purchases
- https://blazium-games.github.io/games_docs/docs/payments/top-up
