# Player server tools

Server: `https://mcp.blazium.games/player`. Scopes: `player:read`, `player:write`, `player:buy`.

## Tools

| Tool | Scope | Purpose |
|------|-------|---------|
| `get_account` | read | Email verification, balances, and what the account may do |
| `request_email_code` | write | Email a verification code to the human |
| `verify_email` | write | Verify the email with the human's code |
| `get_wallet` | read | Balances plus fee and refund rules |
| `list_wallet_transactions` | read | Ledger entries, newest first |
| `get_payment_options` | read | Card and x402 USDC top-up options with fees |
| `create_top_up_link` | buy | Card Checkout link for the human |
| `create_x402_top_up` | buy | x402 payment requirements for a USDC top-up |
| `pay_with_x402` | buy | Submit the signed x402 payment |
| `quote_purchase` | read | Price, tax, and total |
| `purchase_game` | buy | Buy a license from the balance |
| `donate_to_game` | buy | Donate to a free game from the balance |
| `get_approval` | read | State of an approval |
| `confirm_approval` | write | Approve with the human's emailed code |
| `get_library` | read | Owned games, refund windows, play time |
| `get_download_link` | read | 5-minute signed download URL |
| `get_agent_policy` | read | This agent's spending limit |
| `search_catalog` | read | Search public games, tools, and assets by text, genres, tags, tone, session length, network mode, players, platform, engine and version, renderer, license, and made-with label (`authorship`) |
| `get_shelf` | read | A short curated shelf: `tonight` (short sessions with a healthy, clean build for the human's `os`) or `unheard_of` (recent listings few people have found). The order rotates daily |
| `get_game_details` | read | One listing: taxonomy, price, files with scan state and checksum, similar titles, ownership |
| `install_build` | read | License and scan check, checksum, 5-minute download URL, and a `blazium://install/<uid>` hand-off. Uses the channel the human follows unless `channel` is given. Fails unless the file is clean |
| `launch_game` | read | `blazium://game/<uid>` hand-off link for the launcher |
| `set_channel` | write | Join (`beta`) or leave (`stable`) a game's beta |
| `why_should_i_trust_this` | read | Developer, upload provenance, scan history, checksums, and cautions for the current files. Never claims a file is safe |
| `recommend` | read | Games for right now from `minutes`, `party_size`, `intent`, `like_uid`, and platform. Deterministic; every result has `reasons` citing listing fields. Pass the reasons on instead of inventing your own |
| `why_this` | read | One game against the same inputs: score, reasons, cautions, and the `blockers` that keep it out of `recommend` |
| `write_review` | write | Create, update, or `delete` the human's review of a game they own: `enjoyed` and `quality` (1-5) are separate, plus `would_play_with_friends` and `text`. Only write what the human said |
| `taste_feedback` | write | `more_like` true or false for a game, or `clear` |
| `report_bug` | write | File a bug ticket with the developers (10 per day); `include_dump` / `include_log` return one-time upload URLs |
| `games_friends_play` | read | What friends are playing now, then what they played in the last 14 days; `live_only` skips the recent list |
| `list_friends` | read | Friends with presence, plus incoming and sent requests with their `request_uid` |
| `send_friend_request` | write | Send a request by username (20 per day, verified email). Accepts theirs if they already asked |
| `respond_friend_request` | write | Accept or decline an incoming request |
| `redeem_key` | write | Redeem a game key or gift link the human gave you; a game they already own leaves the key unused |

## Resources

| URI | Contents |
|-----|----------|
| `blazium-games://me` | Account status |
| `blazium-games://wallet` | Stored balance and payment rules |
| `blazium-games://library` | Owned games and licenses |
