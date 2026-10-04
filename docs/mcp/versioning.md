---
title: Versioning
sidebar_position: 6
description: How Blazium Games MCP servers and the public API change, and how much notice you get before anything is removed.
---

# Versioning

Both MCP servers report their version in `serverInfo.version` and on their server cards. The public API is under `/api/v1`.

## What can change without notice

- New tools, prompts, resources, and API routes
- New optional inputs
- New fields in results and API responses
- New error codes for new situations

Write clients that ignore fields they don't know.

## What needs 30 days' notice

- Removing or renaming a tool, resource, route, input, or result field
- Making an optional input required
- Changing what an existing field or error code means

Anything scheduled for removal is listed under `deprecations` on the server card with its replacement and the earliest removal date, and the tool description starts with "Deprecated here". It keeps working for at least 30 days after it is first listed.

## Recent additions

Developer and player servers 1.16:

- Interactive views (MCP Apps). Tools a person should see carry `_meta.ui.resourceUri` (and the older `_meta["ui/resourceUri"]`) pointing at a `ui://blazium-games/…` resource served as `text/html;profile=mcp-app`, and both servers advertise the `io.modelcontextprotocol/ui` extension. See [Player tools](./player.md#interactive-views) and the [reference](./reference.md)
- A purchase, donation, key redeem, friend request, or price change runs only when the human clicks in the view. Key-issuing tools, x402 signing, payout setup, and cash-out stay text-only
- The `checkout`, `wallet`, and `library` views leave the developer server with the deprecated buying tools after 2026-10-28
- The servers no longer advertise the deprecated `logging` capability. No tools were added or removed

Developer and player servers 1.15:

- New tools on both servers: `start_payout_setup` and `get_payout_dashboard_link` (Stripe links for the human) and `cash_out` (`amount_cents`). Agents with `player:buy`, `mcp:write`, or `mcp:money` can set up payouts and cash out to the account's own Stripe payout account without approval; the owner is emailed after each agent cash-out. `4083` no longer applies to payouts
- `get_wallet` now returns `payouts` (`connected`, `payouts_ready`), `cash_outs`, and `rules.payout_arrival` (up to 72 business hours) to agents
- Donations are no longer refundable, and purchase results show `refundable_until` as null for donations

Developer and player servers 1.14:

- New developer tools: `get_store_links` and `set_store_links` for the listing's pages on other stores such as Steam, GOG, or Epic Games Store (`4238` for a link on the wrong site). `get_game_details` returns them as `store_links`
- `search_catalog`: several values in one filter match any of them (comma-separate `asset_type`, `session_bucket`, `net`, `os`, and `authorship`), and `exclude_types`, `exclude_genres`, `exclude_tone`, `exclude_tags`, and `exclude_ai_uses` leave listings out. `sort` defaults to best match
- `os` on `search_catalog` and `get_shelf` accepts `ios`
- `get_shelf` takes eight more shelves (`featured`, `new`, `recently_updated`, `made_with_blazium`, `in_development`, `browser_playable`, `community`, `tools_and_assets`) and a `limit` (1-24). Shelf and search results add `has_browser_build` and `has_downloads`

Developer and player servers 1.13:

- New tools: `set_timezone` (sets the human's IANA timezone; `4085` for an unknown name) and `get_security_status` (authenticator on, skipped, or not chosen, and recovery codes left)
- `get_account` returns `legal_acceptance_required`, `legal_changes`, `setup_required`, `authenticator`, and `gate`. Agents send the human to the website to finish those steps (see [Account security](../account-security.md#for-agents-mcp))
- `set_media` returns a structured `limits` object for the slot it was asked about (thumbnail, cover, or screenshots with `max_images`)
- Signing in to approve an agent uses its own `__Host-BG_MCP` cookie on mcp.blazium.games, signed by the MCP server

Developer server 1.12:

- Tools, mods and plugins: `asset_type` gains `tool` and `plugin`; `create_game` and `update_game` accept `parent`, `adult` and `indexable`, and `update_game` accepts `asset_type`
- `update_game_taxonomy` accepts `ai_uses`
- New tools: `set_mod_settings`, `get_press_kit`, `set_press_kit`, and `hide_community_tag`
- Signing in and creating developer, project or deploy keys need [developer mode](../developer-mode.md) on the account (`4105`)

Player server 1.12: `suggest_tag`, `list_game_addons`, and `exclude_warnings` and `ai_uses` on `search_catalog`. Adult listings stay out of search and recommendations unless the player opted in.

Developer server 1.11:

- Editions: `list_skus`, `upsert_sku`, and `delete_sku`. `set_game_price` returns `4164` while a listing has editions
- Builds: `get_build_health`, `list_build_symbols`, `delete_build_symbols`, `upload_symbols_info`, `bundle_check`, and `mod_compat`
- `update_game_taxonomy` accepts `authorship` and `authorship_credit`
- `set_media` returns the `chauffeur media` commands to upload local files (it no longer accepts `url`)

Player server: `get_shelf`, `sku` on `quote_purchase` and `purchase_game`, and `authorship` on `search_catalog`.

## Current deprecations

| Server | What | Replacement | Removed after |
|---|---|---|---|
| Developer (`/mcp`) | Wallet, top-up, purchase, donation, agent policy, library, and download tools, plus the `wallet` and `library` resources | The same tools on the [player server](./player.md); `list_library` becomes `get_library` | 2026-10-28 |
