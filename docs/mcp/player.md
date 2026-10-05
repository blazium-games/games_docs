---
title: Player MCP
sidebar_position: 5
description: Connect an agent to your Blazium Games account as a player to get recommendations with reasons, search the catalog, review games and report bugs, check your wallet and library, top up, buy games within your spending limit, cash out earnings, and install or launch them through the Blazium launcher.
---

# Player MCP

The player server acts for you as a player. It can recommend games and say why, search the catalog, review games you own and report bugs, see your account, wallet, and library, top up your balance, buy games and donate within the spending limit you set, set up payouts and cash out your earnings, fetch download links, and hand installs and launches to the Blazium launcher. It cannot touch game pages, builds, crash reports, analytics, or keys; those are on the [developer server](./index.md).

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

Your client discovers OAuth from `https://mcp.blazium.games/.well-known/oauth-protected-resource/player` (authorization server metadata at `/.well-known/oauth-authorization-server/player`) and opens the Blazium Games consent page, which lists what the player tools can do. There is no project picker. Tick **Allow purchases** only if the agent should buy for you; without it the token has `player:read player:write` and every purchase call returns `4212`. Tick **Read-only access** to grant `player:read` only.

## Connect with a player key

Create a player key at [blazium.games/settings/mcp](https://blazium.games/settings/mcp) under **Player MCP**. Untick **Allow purchases** to create a key without `player:buy`. The key is shown once; send it as `Authorization: Bearer bgames_play_...`. Rotating revokes all your player keys and leaves your developer keys alone.

## Scopes

| Scope | Allows |
|---|---|
| `player:read` | Account, wallet, ledger, payment options, top-up status, quotes, purchase status, library, download links, approvals, agent policy, the files you can see for a game, recommendations, your review, friends and what they're playing |
| `player:write` | Email verification, play time, confirming an approval with the emailed code, joining or leaving a beta, reviews, tag suggestions, taste feedback, bug reports, friend requests, presence and activity sharing |
| `player:buy` | Card and x402 top-ups, `purchase_game`, `donate_to_game`, payout setup and `cash_out` |

A route outside this list returns `4033`. A missing `player:buy` returns `4212`; any other missing scope returns `4031`.

## Spending limits and approval

Purchases always come from your stored balance. Set a limit per agent at [blazium.games/settings/mcp](https://blazium.games/settings/mcp): ask every time, unlimited, monthly, yearly, or a one-time budget. Anything beyond the limit waits for you to approve it by email link or code. See [Agent purchases](../payments/agent-purchases.md).

## Payouts and cash-out

With `player:buy` an agent can also start payout setup, open your Stripe payout dashboard, and cash out your available earnings, without asking first. Stripe links are for you to open; your identity, tax, and bank details are only entered on Stripe. Money only goes to the payout account on your own account, we email you after each agent cash-out, and a payout can take up to 72 business hours to reach your bank. See [Agent payouts](../payments/wallet-and-cash-out.md#agent-payouts).

## Tools

| Tool | Inputs | Scope | Notes |
|------|--------|-------|-------|
| `get_account` | none | read | Email verification, timezone, balances, what the account may do, and the website sign-in steps still open (`legal_acceptance_required`, `legal_changes`, `setup_required`, `authenticator`, `gate`) |
| `request_email_code` | none | write | Emails a verification code to you |
| `verify_email` | `code` | write | Verifies your email with the code |
| `set_timezone` | `timezone` | write | Sets your IANA timezone, replacing the saved one. The agent uses your zone, not the machine it is running on |
| `get_security_status` | none | read | Whether an authenticator app protects your account, and how many recovery codes are left |
| `get_wallet` | none | read | Credit, pending, and available balances, fee and refund rules, payout status, and recent cash-outs |
| `list_wallet_transactions` | `limit` (1-200), `before` | read | Ledger entries, newest first |
| `get_payment_options` | none | read | Card top-up and x402 USDC networks with fees |
| `create_top_up_link` | `amount_cents` | buy | Card Checkout link for you to add balance |
| `create_x402_top_up` | `amount_cents`, `network` | buy | x402 payment requirements for a USDC top-up |
| `pay_with_x402` | `top_up_id`, `payment_payload` | buy | Submits the signed x402 payment |
| `quote_purchase` | `uid`, `kind`, `amount_cents`, `sku` | read | Price, tax, and total. The agent shows you the total first. `sku` is an edition uid or slug from `get_game_details`; empty quotes the cheapest edition, and owners of a cheaper edition are quoted the upgrade price |
| `purchase_game` | `uid`, `confirm_total_cents`, `idempotency_key`, `sku` | buy | Buys a license (or an edition upgrade) from your balance, with the same `sku` as the quote. Beyond the limit it returns `approval_required` |
| `donate_to_game` | `uid`, `amount_cents`, `confirm_total_cents`, `idempotency_key` | buy | Donates to a free game from your balance |
| `get_approval` | `approval_id` | read | `pending`, `approved`, `denied`, `expired`, or `used` |
| `confirm_approval` | `approval_id`, `code` | write | Approves with the 6-digit code you read to the agent |
| `get_library` | none | read | Games you own, with refund windows and play time |
| `get_download_link` | `file_id` | read | 5-minute signed URL for a build file |
| `get_agent_policy` | none | read | This agent's limit mode, limit, and spend in the period |
| `start_payout_setup` | none | buy | Starts or continues Stripe payout setup and returns a link for you |
| `get_payout_dashboard_link` | none | buy | One-time link to your Stripe Express dashboard (`4095` until setup has started) |
| `cash_out` | `amount_cents` | buy | Cashes out available earnings ($25 minimum) to your own payout account; you're emailed after each one |
| `search_catalog` | `q`, `asset_type`, `genres`, `tags`, `tone`, `ai_uses`, `exclude_types`, `exclude_genres`, `exclude_tone`, `exclude_tags`, `exclude_warnings`, `exclude_ai_uses`, `session_bucket`, `net`, `players`, `os`, `arch`, `engine`, `engine_version`, `renderer`, `license`, `authorship`, `sort`, `page`, `page_size` | read | Public games, tools, mods, and assets with a score, scan state, platforms, made-with label, content warnings, AI disclosure, launch-health band, and a short reason for each match. Several values in one filter match any of them (comma-separate `asset_type`, `session_bucket`, `net`, `os`, and `authorship`); the `exclude_` filters leave out listings with any of their values. `sort` is `relevance` (default, best match), `newest`, or `updated`. Adult listings appear only if you turned on adult content. See [Listings and search](../listings.md#search) |
| `list_game_addons` | `uid`, `kind` (`mods`, `tools`, or empty for both), `limit` (1-100) | read | Mods and plugins, or tools and applications, made for a game. `same_creator` marks the ones from the game's own developer |
| `suggest_tag` | `uid`, `tag`, `remove` | write | Suggests a tag for a game you own and have played for at least an hour (`4237` before that); `remove` withdraws it. Up to 5 per game. Without `tag` it returns your suggestions and whether you may suggest. See [Community tags](../listings.md#community-tags) |
| `get_shelf` | `kind`, `os`, `limit` (1-24, default 12) | read | A home page shelf of listings with a clean download for `os`: `featured`, `new`, `recently_updated`, `made_with_blazium`, `in_development`, `browser_playable`, `community`, `tools_and_assets`, `tonight` (short sessions with a healthy build), or `unheard_of` (recent listings few people have found). Each listing says whether it plays in the browser (`has_browser_build`) or downloads (`has_downloads`). Shelves without their own order rotate daily. See [Shelves](../listings.md#shelves) |
| `get_game_details` | `uid` | read | Description, taxonomy, price, editions (`skus`), made-with label, launch health, license kind, engine compatibility, what it uses and what uses it, files with scan state and checksum, similar titles, `store_links` to its pages on other stores, and whether you own it |
| `install_build` | `uid`, `build_id`, `os`, `arch`, `channel` | read | Checks your license and the virus scan, then returns the file checksum, a 5-minute `download_url`, and a `blazium://install/<uid>` link for the launcher. Uses the channel you follow unless you pass `stable` or `beta`. Refuses any file that isn't `clean` |
| `launch_game` | `uid` | read | Returns the `blazium://game/<uid>` link that opens the game in the launcher, and whether you own it and a clean build exists |
| `set_channel` | `uid`, `channel` (`stable` or `beta`) | write | Joins or leaves a game's beta. Beta builds then show up in `get_game_details` and `install_build` |
| `why_should_i_trust_this` | `uid` | read | The developer, how each current file was uploaded, its scan history and checksum, and anything worth a second look (a file that isn't clean, no scan history, a beta build). It never calls a file safe; a clean scan only means no known malware was found |
| `recommend` | `intent`, `minutes`, `party_size`, `like_uid`, `os`, `arch`, `asset_type`, `include_owned`, `limit` (1-10) | read | Games for right now, each with the `reasons` it was picked and any `cautions`. See [Recommendations](#recommendations) |
| `why_this` | `uid`, `intent`, `minutes`, `party_size`, `like_uid`, `os`, `arch` | read | One game scored against the same inputs: reasons, cautions, and the `blockers` that keep it out of `recommend` |
| `write_review` | `uid`, `enjoyed`, `quality` (1-5), `would_play_with_friends`, `text`, `delete` | write | Creates or updates your review of a game you own. One review per game; `delete` removes it |
| `taste_feedback` | `uid`, `more_like`, `clear` | write | More (`true`) or less (`false`) like this game in `recommend`. `clear` removes it |
| `report_bug` | `uid`, `message`, `build_id`, `os`, `arch`, `include_dump`, `include_log` | write | Files a bug ticket with the developers. `include_dump` and `include_log` return one-time upload URLs (`PUT`, 24 hours) |
| `games_friends_play` | `live_only` | read | What your friends are playing now, then what they played in the last 14 days, with store links. See [Friends](#friends) |
| `list_friends` | none | read | Friends with their presence (playing, online, offline) and pending requests with their `request_uid` |
| `send_friend_request` | `username` | write | Sends a friend request. If that person already asked you, it accepts theirs |
| `respond_friend_request` | `request_uid`, `accept` | write | Accepts or declines an incoming request |
| `redeem_key` | `code` | write | Redeems a game key (`XXXXX-XXXXX-XXXXX-XXXXX`) or a gift link (the whole link or the code at its end) and adds the game to your library. If you already own it, the key stays unused (`4084`) |

Games list the channels you can join in `get_game_details` (`channels`). A beta download link for a game whose beta you haven't joined returns `4074`.

`install_build` and `launch_game` never install or run anything on the server or your machine; the agent gives you the `blazium://` link, or your client opens it, and the Blazium Games launcher does the rest. `blazium://install/<uid>` and `blazium://game/<uid>` go to that launcher on port 39220. `blazium://buy/<uid>` opens the store page and does not install. `blazium://hub` and `blazium://install?version=` stay with Hub. Chat links (`blazium://chat` and `blazium://friends`) open the launcher too. Game chat itself is IRC on `irc.blazium.online` port 6697.

## Recommendations

`recommend` gives the same answer for the same inputs; no model picks the games. It only considers public listings of one `asset_type` (`game` unless you pass another) with a clean build for your platform (when you pass `os`), leaves out adult listings unless you turned on adult content at [blazium.games/settings](https://blazium.games/settings#adult), and skips games you own or already liked unless you pass `include_owned`. Each game is scored in this order:

1. **Session fit**: its session length (`15m`, `1h`, `3h`, or endless) against the `minutes` you have.
2. **Friends**: a friend playing it right now, or else friends who own it. Only friends who share their activity count.
3. **Intent**: words from `intent` matched against the listing's genres, tags, tone, name, tagline, and description. When you give an intent, a game that matches none of its words is left out.
4. **Taste**: tags and genres shared with games you liked (`taste_feedback` more like, a review where you enjoyed it, an hour or more of play time, or `like_uid`), and titles the developer lists as similar to them.
5. **Reviews**: enough reviews, with most reviewers saying they enjoyed it.
6. **Crashes**: games with many recent crash reports rank lower and get a caution.
7. **Freshness**: a small, capped boost for recently updated listings. It never counts as a reason on its own.

Every result lists `reasons`, each naming the listing field it matched. A game with nothing to cite is left out rather than padded in. `party_size` keeps only games that support that many players. Games you marked less like this never appear. `why_this` explains any one game, including why it was left out.

## Reviews and bug reports

You can review and report bugs for games you own: games you bought, and free games you've downloaded (a free game counts once you download it, and stops counting if it later gets a price). You need a verified email, and developers can't review their own games (`4077`). Enjoyed and quality are separate: a well-made game you didn't enjoy can be quality 5 and enjoyed "no". Reviews appear on the store page, where the developer can reply. Review text is never used for ranking; `recommend` only counts whether reviewers enjoyed the game.

A bug report goes to the game's developers, up to 10 per day (`4291`). Attached dumps and logs can only be downloaded by the game's developers and our staff.

## Friends

Add friends by username from the agent or at [blazium.games/friends](https://blazium.games/friends). You need a verified email to send requests, and you can send up to 20 a day (`4292`). Sending a request to someone who already asked you makes you friends right away. Adding yourself returns `4228`, and asking someone you're already friends with or already asked returns `4078`.

Friends see whether you're online and which game you're playing, plus the public games you played in the last 14 days. "Playing" comes from the play-time heartbeat your launcher or game sends, and lasts 10 minutes after the last one; there is no separate presence tool. Unlisted and draft games are never shown. Turn off **Activity sharing** on the friends page to hide all of it; you then also drop out of your friends' recommendations.

## Interactive views

A host that supports MCP Apps shows an interactive view beside the tool result. You confirm a purchase, donation, key redeem, or friend request in that view. A card top-up opens a Checkout link for you to pay. Payout setup and cash-out stay text-only tools. A host without MCP Apps keeps the text result. Each view is a `ui://` resource served as `text/html;profile=mcp-app`.

## Resources

| URI | Contents |
|-----|----------|
| `blazium-games://me` | Account status, verification, and what the account may do |
| `blazium-games://wallet` | Stored balance and payment rules |
| `blazium-games://library` | Owned games and licenses |
| `ui://blazium-games/checkout.html` | Quote, buy, and donate. The purchase runs when you click |
| `ui://blazium-games/game.html` | Game information and trust checks |
| `ui://blazium-games/results.html` | Search, recommendations, shelves, add-ons, and what friends are playing |
| `ui://blazium-games/wallet.html` | Balance, ledger, spending limit, and a card top-up link |
| `ui://blazium-games/approval.html` | Approval status, confirm link, and the emailed code |
| `ui://blazium-games/library.html` | Owned games, redeem, and download links |
| `ui://blazium-games/handoff.html` | `blazium://` hand-off for the Windows launcher |
| `ui://blazium-games/account.html` | Verification, timezone, and links to finish sign-in on the website |
| `ui://blazium-games/feedback.html` | Reviews, bug reports, taste, and tag suggestions |
| `ui://blazium-games/friends.html` | Friends and requests |

## Moving from the developer server

Until 2026-10-28 the developer server still lists `get_wallet`, `list_wallet_transactions`, `get_payment_options`, `create_top_up_link`, `create_x402_top_up`, `pay_with_x402`, `quote_purchase`, `purchase_game`, `donate_to_game`, `get_agent_policy`, `list_library`, and `get_download_link`, marked deprecated. At the end of that day they disappear from `/mcp`, even on a server that is already running, and are only on `/player`; purchases or top-ups made with a developer token then return `4034`. `list_library` is named `get_library` here. See [Versioning](./versioning.md).
