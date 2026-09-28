---
name: blazium-games-store-page
description: Create or update a Blazium Games store page. Drafts the name, tagline, and description from a pitch, creates the page as a draft, updates copy, sets a price or donations, and changes visibility. Use when the user wants to create a game page, write store copy, rename a game, price a game, accept donations, or publish a page on Blazium Games.
license: MIT
---

# Blazium Games: Store Page

Create and edit the public page at `https://<username>.blazium.games/<vanity_name>`.

## Invoke This Skill When

- "Create a Blazium Games page for my game", "write my store description"
- "Make my game public", "change the tagline"
- "Sell my game for $4.99", "let players donate"
- The `bootstrap_game` prompt needs a page to exist

## Prerequisites

- The `blazium-games` MCP server is connected with write access
- Creating a page needs an account-level token (a project-bound token can only edit its own game)
- Going public, setting a price, and uploading need the owner's email verified. Check with `get_account`; if `email_verified` is false, call `request_email_code`, ask the human for the code from their inbox, then call `verify_email`. Updates that set `visibility` to `public` fail with code `4096` until then

## Phase 1: Find or create

1. Call `list_games`. If a game matches the user's project, use its `uid` and go to Phase 3.
2. Otherwise draft copy. Use the `draft_game_page` prompt with a short `pitch`, or write:
   - `name`
   - `tagline`: one line
   - `description`: markdown, two short paragraphs, facts only
3. Confirm the copy with the user.

## Phase 2: Create

Call `create_game`:

| Field | Notes |
|-------|-------|
| `name` | Required |
| `tagline` | One line |
| `description` | Markdown |
| `visibility` | Start with `draft`. Options: `draft`, `invisible`, `public` |
| `asset_type` | `game`, `application`, `mod`, `game_asset`, or `dev_asset` |
| `vanity_name` | URL slug, lowercase with dashes |

Keep the returned `uid`.

## Phase 3: Update

Call `update_game` with `uid` and any of `name`, `tagline`, `description`, `visibility`. To polish existing copy, run the `improve_game_copy` prompt with the current description first.

Before switching to `public`, confirm with the user and make sure the owner is verified. `invisible` keeps the page reachable by link but out of listings.

## Phase 4: Price or donations (optional)

Call `set_game_price` with `uid` and:

| Field | Notes |
|-------|-------|
| `price_cents` | `0` for free, or `99` to `50000` ($0.99 to $500) |
| `donations_enabled` | Free games only. Donations are $1 to $500 |

Tell the user what they will receive before setting it: each sale or donation pays the price minus $0.25 + 8% (a $10 game pays $8.95). Earnings unlock after 7 days or 2 hours of the buyer's play, and cash-out (8% plus Stripe's payout fee, $25 minimum) is on the website. Paid games can only be downloaded by buyers. Sales are listed by `list_game_sales`.

Details: https://blazium-games.github.io/games_docs/docs/payments/selling

## Phase 5: Verify

Call `get_game` and give the user the page URL (`page_url` from `get_deploy_info`, or `https://<owner>.blazium.games/<vanity_name>`).

Images, videos, and changelogs are managed on the website or through builds (`blazium-games-deploy`). Image sizes: https://blazium-games.github.io/games_docs/docs/graphical_assets_guidelines

## Docs

https://blazium-games.github.io/games_docs/docs/mcp/reference
