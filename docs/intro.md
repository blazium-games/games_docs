---
sidebar_position: 1
---

# Introduction

This is the documentation for [Blazium Games](https://blazium.games). Blazium Games is the platform for playing and publishing games, applications, mods, and assets.

## The platform

Players browse the catalog, keep a library, and use [BlaziumLauncher](./storefront/desktop-app.md) on Windows or Linux. Friend messages and each game's chat are IRC on `irc.blazium.online`; see [Chat](./chat/index.md). Publishers host a profile and a page for each project, with a press kit and lists of mods and tools. Upload builds with `npm install -g @blazium-games/cli` (`chauffeur`).

The files crawlers and agents read — robots.txt, sitemaps, security.txt, the API catalog, and llms.txt — are listed in [Discovery files](./discovery.md).

## Start here

- **[MCP](./mcp/index.md)**: connect Cursor, VS Code, Claude Code, or any MCP client so an AI agent can manage your store pages, builds, channels, analytics, crash reports, bug tickets, reviews, and game keys.
- **[Player MCP](./mcp/player.md)**: let an agent act for you as a player: recommendations, catalog search, reviews, bug reports, friends, and purchases within your spending limits.
- **[Cursor plugin](./cursor-plugin.md)**: the official plugin bundles the MCP server with skills for common workflows.
- **[Deploy builds](./deploy.md)**: upload builds, symbols, and store images with the [chauffeur CLI](./cli/index.md), the API, or GitHub Actions.
- **[Crash reporting](./crash-reporting.md)**: send crashes and events from your game.
- **[Payments](./payments/index.md)**: sell games or take donations, buy games, top up your balance, cash out, refunds, and agent purchases.
- **[Linked accounts and sign-in](./linked-accounts.md)**: link GitHub, X, or Discord, log in with them, and unlink them.
- **[Multiplayer](./multiplayer.md)**: sign-in, lobbies, and peer connections for a game, and how to publish a scripted lobby.
- **[Graphical assets guidelines](./graphical_assets_guidelines.md)**: image sizes for your store page.
- **[Editor asset library](./editor-asset-library.md)**: paste one repository URL into Godot or Blazium so the AssetLib can list and install packages from Blazium Games.
- **[Anonymous downloads](./anonymous-downloads.md)**: let anyone download a free project without an account, and what that gives up.
- **[Download analytics](./download-analytics.md)**: where downloads come from, how players had access, and refused attempts.
- **[Public API reference](./api-reference.md)**: the OpenAPI description, authentication, error codes, and rate limits of the public API.

## Help

- Support: [blazium.games/support](https://blazium.games/support) or [support@blazium.games](mailto:support@blazium.games)
- Bug reports: [blazium-games/support](https://github.com/blazium-games/support/issues)
- Service status: [status.blazium.games](https://status.blazium.games)
- Privacy: [privacy@blazium.games](mailto:privacy@blazium.games)
- Community: [Discord](https://blazium.app/chat)
- Docs and the Cursor plugin: [blazium-games/games_docs](https://github.com/blazium-games/games_docs)
- Skills: [blazium-games/games_skill](https://github.com/blazium-games/games_skill) (`npm install @blazium-games/skills`)
- Launcher: [blazium-games/games_launcher](https://github.com/blazium-games/games_launcher)
- CLI: [blazium-games/games_cli](https://github.com/blazium-games/games_cli) (`npm install -g @blazium-games/cli`)
- Support tracker: [blazium-games/support](https://github.com/blazium-games/support)
