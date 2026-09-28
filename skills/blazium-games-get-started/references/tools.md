# Blazium Games MCP tools

All tools call the Blazium Games API on behalf of the connected user. `uid` accepts a game uid or its vanity name. Tools marked **account** need an account-level token; tools marked **write** need the `mcp:write` scope.

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
| `request_mcp_key` | none | account, write | Issue a new MCP API key and invalidate every previous one. Returns the secret once |
| `request_deploy_key` | `uid` | write | Issue a new upload `access_token` and `secret_key` for a game and invalidate the previous ones. Returns secrets once |
| `validate_listing` | `uid` | | Listing check (errors block going public), current taxonomy, and allowed values |
| `update_game_taxonomy` | `uid`, `genres`, `tags`, `tone`, `inputs`, `content_warnings`, `engines`, `session_bucket`, `net`, `players_min`, `players_max` | write | Set the taxonomy; only passed fields change |
| `set_similar_games` | `uid`, `games` | write | Replace the similar titles (up to 10) |
| `set_media` | `uid`, `kind` (`cover`, `thumbnail`, `gallery`), `url` | write | Set an image from an https URL (PNG, JPEG, GIF, WebP; 2048 px, 10 MB) |
| `scan_status` | `uid` | | Virus-scan state and history per build file, and files removed for failing the scan |

## Account and payments

Amounts are integer US cents. Agents pay only from the stored balance, and only after the human approves the quoted total. Workflow: [blazium-games-purchases](../../blazium-games-purchases/SKILL.md).

| Tool | Inputs | Access | What it does |
|------|--------|--------|--------------|
| `get_account` | none | account | Email verification, balances, and what the account may do (publish, upload, download, buy) |
| `request_email_code` | none | account, write | Email a verification code to the human |
| `verify_email` | `code` | account, write | Verify the email with the code the human read from their inbox |
| `get_wallet` | none | account | Credit, pending, and available balances with fee, refund, and cash-out rules |
| `list_wallet_transactions` | `limit` (1-200, default 50), `before` | account | Ledger entries, newest first |
| `get_payment_options` | none | account | Card top-up link option and x402 USDC networks with fees |
| `create_top_up_link` | `amount_cents` (500-50000) | account, write | Card Checkout link for the human; agents cannot pay by card |
| `create_x402_top_up` | `amount_cents`, `network` (default Base) | account, write | x402 payment requirements to sign with the agent's own wallet |
| `pay_with_x402` | `top_up_id`, `payment_payload` | account, write | Submit the signed payment; credit is added after on-chain settlement |
| `quote_purchase` | `uid`, `kind` (`purchase` or `donation`), `amount_cents` (donations) | account, write | Price, tax, and `total_cents` to show the human |
| `purchase_game` | `uid`, `confirm_total_cents`, `idempotency_key` | account, write | Buy a license from the balance; beyond the agent's limit returns `approval_required` |
| `donate_to_game` | `uid`, `amount_cents`, `confirm_total_cents`, `idempotency_key` | account, write | Donate to a free game from the balance |
| `list_library` | none | account | Owned games with refund windows and playtime |
| `get_download_link` | `file_id` | account | 5-minute signed URL for a build file; needs a verified email and, for paid games, a license |
| `set_game_price` | `uid`, `price_cents` (0 or 99-50000), `donations_enabled` | write | Set price or donations. Owners and game admins only |
| `list_game_sales` | `uid` | | Sales, donations, refunds, and seller earnings for a game you manage |
| `get_agent_policy` | none | account | This agent's limit mode, limit, and spend in the period; only the human changes them, on the website |
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
| `4030` | Not allowed for this game |
| `4031` | Token is read-only |
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
| `4225` | Listing check failed; the page can't go public yet. Run `validate_listing` |
