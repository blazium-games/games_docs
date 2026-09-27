---
name: blazium-games-store-page
description: Create or update a Blazium Games store page. Drafts the name, tagline, and description from a pitch, creates the page as a draft, updates copy, and changes visibility. Use when the user wants to create a game page, write store copy, rename a game, or publish a page on Blazium Games.
license: MIT
---

# Blazium Games: Store Page

Create and edit the public page at `https://<username>.blazium.games/<vanity_name>`.

## Invoke This Skill When

- "Create a Blazium Games page for my game", "write my store description"
- "Make my game public", "change the tagline"
- The `bootstrap_game` prompt needs a page to exist

## Prerequisites

- The `blazium-games` MCP server is connected with write access
- Creating a page needs an account-level token (a project-bound token can only edit its own game)

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

Before switching to `public`, confirm with the user. `invisible` keeps the page reachable by link but out of listings.

## Phase 4: Verify

Call `get_game` and give the user the page URL (`page_url` from `get_deploy_info`, or `https://<owner>.blazium.games/<vanity_name>`).

Images, videos, and changelogs are managed on the website or through builds (`blazium-games-deploy`). Image sizes: https://blazium-games.github.io/games_docs/docs/graphical_assets_guidelines

## Docs

https://blazium-games.github.io/games_docs/docs/mcp/reference
