## BlaziumLauncher

- [BlaziumLauncher](https://blazium.games/app): The desktop launcher installs, updates, and launches your library. It runs on Windows 10 and 11 (64-bit) and on Linux (x86_64, Debian package). macOS and phones are not supported. Guide: [desktop app](https://docs.blazium.games/docs/storefront/desktop-app).

## Skills for agents

- [skill.md](https://blazium.games/skill.md): One page that says which Blazium Games skill to load for which job: store pages, deploys, crash reporting, analytics, keys, engine bindings, the player server, purchases, and the Scripted API.
- [Agent skills index](https://blazium.games/.well-known/agent-skills/index.json): Each skill's name, description, URL, and a sha256 digest of the file served there. Each skill is at `https://blazium.games/.well-known/agent-skills/<name>/SKILL.md`.
- [Cursor plugin](https://docs.blazium.games/docs/cursor-plugin): The same skills with the hosted developer and player MCP servers, for Cursor. Install the skills with `npm install @blazium-games/skills`.

## MCP servers

Call initialize with no token. A new person follows the setup_account prompt: create_account, then confirm_account with the email code. An existing person follows the sign_in prompt: login, then confirm_account when a code is required. Those three tools need no bearer. confirm_account returns that server's first key once (bgames_mcp_ on the developer server, bgames_play_ on the player server) and does not return the website session. A later confirm does not rotate a key that already exists. Send accept_legal, and on the developer server accept_developer_terms, only after the human agrees. The developer server turns developer mode on. The player server leaves the account a player. An authenticator challenge, and choosing or skipping an authenticator, stay on the website. Website signup at https://blazium.games/signup and OAuth consent still work.

- [MCP server](https://mcp.blazium.games/developer): Remote Model Context Protocol server (streamable HTTP) for developers: creating and updating game pages; filling in listing taxonomy, images, and similar titles until the listing check passes; declaring dependencies, engine compatibility, and license; setting prices and donations; editions (standard, deluxe, beta access, bundles) with pay-the-difference upgrades; listing builds, promoting them to channels (stable, beta, dev, custom) and rolling back; build provenance and virus-scan status; per-build launch health; debug symbol listings (symbols are uploaded with the chauffeur CLI, not MCP); bundled store-asset license checks; mod compatibility against each game's current engine version; reading analytics and sales; payout setup and cash-out of earnings to the account's own Stripe payout account (the owner is emailed after each cash-out); crash reports, crash groups, and downloads of dumps, logs, and stack traces; player bug tickets and reviews (reply, mark fixed or closed); redeemable game key pools and gift links; and issuing deploy keys. Risky actions (key rotation, deleting a game, build, or deploy key, promoting to stable, adding an admin, creating over 100 game keys) wait for the owner's approval by email. Tokens can be scoped to one project and to presets (store page, CI, crash triage, keys, money, read-only). Sign in with OAuth 2.1 + PKCE (no token needed) or send an MCP API key (`bgames_mcp_`) as `Authorization: Bearer`. Buying, wallet, and library are only on the player server. A developer token that purchases or tops up gets `4034`.
- [Player MCP server](https://mcp.blazium.games/player): Separate MCP server that acts for a player: `list_articles` and `get_article` read published blog posts (they do not post or delete comments); recommendations with cited reasons, curated shelves (featured, new, recently updated, made with Blazium, in development, browser playable, community, tools and assets, something for tonight, unheard of), catalog search, game details with build scan states and checksums, reviews, taste feedback, bug reports, friends and what they are playing, redeeming game keys and gift links, beta channels, install and launch hand-offs to the Blazium launcher (blazium:// links, clean builds only), account and email verification, wallet, top-ups, buying games and donating from the account balance within per-agent spending limits with human approval beyond them, library, download links, and payout setup and cash-out to the account's own Stripe payout account with `player:buy` (agents never pay by card, and the owner is emailed after each cash-out). Scopes `player:read`, `player:write`, `player:buy`; player keys start with `bgames_play_`.
- [MCP server card](https://mcp.blazium.games/.well-known/mcp/server-card.json): Machine-readable description of the developer server, its authentication, tools, prompts, resources, and deprecations.
- [Player MCP server card](https://mcp.blazium.games/.well-known/mcp/player-server-card.json): Machine-readable description of the player server.
- [MCP documentation](https://docs.blazium.games/docs/mcp): Setup for Cursor, VS Code, Claude Code, and other MCP clients, plus access scopes and OAuth details.
- [OAuth protected resource metadata](https://mcp.blazium.games/.well-known/oauth-protected-resource/developer): RFC 9728 discovery document for the developer MCP endpoint. `https://mcp.blazium.games/mcp` still reaches the same server.
- [Player OAuth protected resource metadata](https://mcp.blazium.games/.well-known/oauth-protected-resource/player): RFC 9728 discovery document for the player endpoint.
- [Player authorization server metadata](https://mcp.blazium.games/.well-known/oauth-authorization-server/player): RFC 8414 discovery document for the player endpoint.
- [Player MCP documentation](https://docs.blazium.games/docs/mcp/player): Player server scopes, keys, and tools.

## Public API

- [Catalog search API](https://api.blazium.online/api/v1/public/search): Public JSON search of listed games. Parameters q, asset_type, genres, tags, tone (comma-separated lists), session_bucket, net, players, os, arch, engine, engine_version, renderer, license, authorship (human, human_agent, agent_heavy), exclude_warnings (content warnings to leave out), ai_uses (art, audio, code, text, voice, runtime; matches any), sort, page, page_size (up to 50). Results include each game's authorship, generative-AI disclosure, content warnings, and launch-health band. Adult listings only appear for signed-in users who confirmed they are 18 or older and opted in. Only builds that passed the virus scan count as platforms.
- [Popular tags API](https://api.blazium.online/api/v1/public/tags/popular): Public JSON list of the most used tags, optional `prefix` and `limit`.
- [Shelves API](https://api.blazium.online/api/v1/public/shelves/featured): Public JSON shelves `featured`, `new`, `recently_updated`, `made_with_blazium`, `in_development`, `browser_playable`, `community`, `tools_and_assets`, `tonight` and `unheard_of`, with optional `os` and `limit` (1 to 24, default 12). Each game says whether it has a browser build (`has_browser_build`) or downloads (`has_downloads`); shelves without their own order rotate daily.
- [OpenAPI description](https://api.blazium.online/api/v1/public/openapi.json): OpenAPI 3.1 document for the public API (also as [YAML](https://api.blazium.online/api/v1/public/openapi.yaml)): health, catalog search, shelves, tags, articles, listings, reviews, press kits, file provenance, downloads, the editor asset library, crash and event ingest, and the build upload entry point.
- [Agent purchases](https://docs.blazium.games/docs/payments/agent-purchases): How agents quote, confirm with the human, and buy from the balance; limits and error codes.
- [chauffeur CLI](https://docs.blazium.games/docs/cli): The command-line uploader for builds, debug symbols, and store media, using the game's deploy key. All build and symbol uploads go through chauffeur or the upload API; the website does not accept them.

## Developer sites and listings

- Developer site llms.txt (`https://<developer>.blazium.games/llms.txt`): Each developer's indexable games, mods and tools, with links to their store pages.
- Listing llms.txt (`https://<developer>.blazium.games/<game>/llms.txt`): A plain-text summary of one listing: type, price, platforms, genres, tags, what players say, content warnings, generative-AI use, parent game, and links.
- Press kits (`https://<developer>.blazium.games/<game>/press`): Factsheet, description, screenshots, quotes, and contacts, with a downloadable zip.
- Mods and tools (`https://<developer>.blazium.games/<game>/mods` and `/tools`): Mods, plugins, tools, and utilities made for a game, from its developer and the community.
- [Sitemap](https://blazium.games/sitemap.xml): The platform's public pages, every published blog post, every indexable store page and developer site; each developer site has its own `/sitemap.xml`. Adult listings, drafts, and listings that opted out of indexing are left out.

## Plans, publishing, and education

- [Pricing](https://blazium.games/pricing): Free to start. Grow is $29 and Scale is $99 per game per month. The sale fee is 8% + $0.25 per sale. A cash-out costs 8% + $0.25 on Free, 7% + $0.25 on Grow, and 6% + $0.25 on Scale. The page also has the quote form for the conversion add-on: Blazium converts your game and sets up hosting, crash reports, and distribution for a one-time fee starting at $24.99, and you keep ownership and your own store accounts. Plans: https://docs.blazium.games/docs/plans.
- [Publishing](https://blazium.games/publishing): Apply with your game. Blazium reviews every title and builds a launch plan around it. Upload once and Blazium deploys and updates the game on every channel.
- [Education](https://blazium.games/education): Programs for schools and students who make and ship a game.

## Blog

- [Blog](https://blazium.games/blog): Published posts, newest first. Each post is at `/blog/{slug}`. A post's second-level headings have stable anchors, so `/blog/{slug}#section-name` links to one section. An anchor is the heading lowercased with everything except letters, digits, and spaces removed, and words joined by hyphens. A repeated heading gets `-2`, `-3`. Editing a heading changes its anchor.
- [Articles list](https://api.blazium.online/api/v1/public/articles): Public JSON, newest first. `limit` is 1 to 50 (default 20). Optional `q` matches the title or description. Each post has `title` (the whole headline), `title_line2` (its second line, when it has one), and `author`.
- [One post](https://api.blazium.online/api/v1/public/articles/pardon-our-dust): That post's title, date, cover, author, and markdown body. Comments are `GET /api/v1/public/articles/{slug}/comments`.
- Player MCP: `list_articles` and `get_article` on `https://mcp.blazium.games/player`. Neither tool posts or deletes a comment.
- CLI: `chauffeur blog` lists posts newest first, and `chauffeur blog show <slug>` prints the title and markdown. Neither needs a deploy key.
- [RSS](https://cdn.blazium.online/articles/rss.xml): The same posts as a feed (`application/rss+xml`). Every page on blazium.games advertises it with a `<link rel="alternate" type="application/rss+xml">` tag.

## Documentation

- [Documentation](https://docs.blazium.games/): Guides for store pages, the MCP servers, deploying builds with the chauffeur CLI, crash reporting, and payments. Short map: https://docs.blazium.games/llms.txt. Full text: https://docs.blazium.games/llms-full.txt.
- [Editions](https://docs.blazium.games/docs/payments/selling): Selling several editions of a game (standard, deluxe, beta access, bundles); owners upgrade by paying the difference.
- [Payments](https://docs.blazium.games/docs/payments): Paid games and donations (sale fee $0.25 + 8%), buying, balance top-ups by card or x402 USDC, cash-outs through Stripe Connect ($25 minimum; Free 8% + $0.25, Grow 7% + $0.25, Scale 6% + $0.25, using the best plan the account owns; payouts take up to 72 business hours to reach the bank; AI agents can set up payouts and cash out), and refunds via support@blazium.games (purchases within 7 days and under 2 hours of play; a refund goes to the account balance and is never sent back to a card; donations are not refundable).
- [Usernames](https://docs.blazium.games/docs/account-security): Names that match a platform address, a brand word, or a look-alike of one cannot be chosen at signup or when renaming; an existing account keeps signing in.

## Legal

- [Privacy Policy](https://blazium.games/privacy-policy): What is collected (including payment data), the 1-year analytics retention, and account deletion.
- [Terms of Service](https://blazium.games/terms-of-service): Terms for using Blazium Games, operated by Divine Games, Inc., including payments, fees, taxes, the account balance, cash-outs, refunds, agent purchases and payouts, developer terms, adult content ratings, generative-AI disclosure, player tags, and copyright (DMCA) notices, which are accepted only through the paid DMCA page, forwarded to the uploader, and reviewed by staff.
- [File a DMCA notice](https://blazium.games/dmca): The only way to send a copyright notice. The fee is $100 plus $100 for each uploader account the links belong to, and it is not refundable. Uploaders see notices about their content in Settings > Copyright notices and over the developer MCP server.
- [Permissions & Scopes](https://blazium.games/permissions): GitHub, X, and Discord sign-in and linking scopes, MCP scopes, agent spending limits, keys, and cookies.
- [GitHub API Disclosure](https://blazium.games/github-api-disclosure): What is read from GitHub and how it is used.
- [X API Disclosure](https://blazium.games/x-api-disclosure): What is read from X and how it is used.
- [Discord API Disclosure](https://blazium.games/discord-api-disclosure): What is read from Discord and how it is used.
- [Steam API Disclosure](https://blazium.games/steam-api-disclosure): What is read from Steam for linking, imports, and Steam auth verification.
- [Chat Rules](https://blazium.games/chat-rules): Anything legal is allowed in chat; nothing illegal and never any harm to children. Breaking the rules can lock an account out of chat, suspend it, or lead to harsher action. Chat is not logged. Players can connect any IRC client with a chat token from Settings > Chat.
- [Subprocessors](https://blazium.games/subprocessors): Third-party services that process data, including Stripe and Coinbase for payments.

## Support

- [Support](https://blazium.games/support): How to get help.
- [Report a bug](https://github.com/blazium-games/support/issues): Public issue tracker for bugs in the website, BlaziumLauncher, MCP servers, and chauffeur CLI.
- [support@blazium.games](mailto:support@blazium.games): Account, payment, refund, and security questions.
- [Service status](https://status.blazium.games): Current status, incidents, and scheduled maintenance.
- [Security contact](https://blazium.games/.well-known/security.txt): How to report a vulnerability (RFC 9116).

## Community

- [Discord](https://blazium.app/chat): Community chat.

## Contacts

- [GitHub Org](https://github.com/blazium-games): Blazium Games GitHub Organization.
- [X/Twitter Profile](https://x.com/BlaziumGames): Blazium Games X/Twitter Profile.
- [YouTube Channel](https://youtube.com/@blazium): Blazium Games YouTube Channel.
- [Blazium Games Team](https://blazium.app/meet-the-team): Blazium Games team.

## More by Blazium

- [Blazium (game engine)](https://blazium.app): Blazium game engine is a free, open-source, community-driven game engine based on Godot 4.4.1, designed for developing 2D and 3D games, cross-platform projects, and XR experiences. It offers power, flexibility, and compatibility with Godot assets while removing compatibility-breaking features.
- [Blazium Games](https://blazium.games): Blazium Games is the First-Stage Storefront.
