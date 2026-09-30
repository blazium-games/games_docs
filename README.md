# Blazium Games for Cursor

The official Blazium Games plugin for Cursor, and the source of the [Blazium Games documentation](https://blazium-games.github.io/games_docs/).

The plugin teaches Cursor how to use [Blazium Games](https://blazium.games): create and edit store pages, ship builds from CI, wire up crash reporting, debug crashes, read analytics, and manage keys through the hosted developer MCP server, and find, review, and buy games through the player MCP server.

## Install

Add `blazium-games/games_docs` from **Cursor Settings > Plugins**, then enable **Blazium Games**.

The first time the agent uses a Blazium Games tool, Cursor opens a browser for the Blazium Games sign-in and consent page. No key is stored in the plugin.

Full guide: [Cursor plugin docs](https://blazium-games.github.io/games_docs/docs/cursor-plugin).

## What's included

- The hosted [Blazium Games MCP server](https://blazium-games.github.io/games_docs/docs/mcp) at `https://mcp.blazium.games/mcp` and the [player server](https://blazium-games.github.io/games_docs/docs/mcp/player) at `https://mcp.blazium.games/player` ([mcp.json](mcp.json)).
- Skills, indexed in [SKILL_TREE.md](SKILL_TREE.md):

| Skill | What it does |
|-------|--------------|
| [blazium-games-get-started](skills/blazium-games-get-started/SKILL.md) | Connects the server, verifies the account, and routes to the right skill |
| [blazium-games-store-page](skills/blazium-games-store-page/SKILL.md) | Creates and edits store pages |
| [blazium-games-deploy](skills/blazium-games-deploy/SKILL.md) | Ships builds and symbols from CI or the chauffeur CLI |
| [blazium-games-crash-reporting](skills/blazium-games-crash-reporting/SKILL.md) | Sends crashes and events from a game |
| [blazium-games-debug-crash](skills/blazium-games-debug-crash/SKILL.md) | Triages crashes and maps them to your code |
| [blazium-games-analytics](skills/blazium-games-analytics/SKILL.md) | Summarizes store page traffic |
| [blazium-games-keys](skills/blazium-games-keys/SKILL.md) | Inspects and rotates MCP and deploy keys |
| [blazium-games-player](skills/blazium-games-player/SKILL.md) | Acts as a player: recommendations, catalog search, reviews, bug reports, friends |
| [blazium-games-purchases](skills/blazium-games-purchases/SKILL.md) | Buys games and donates from the balance within spending limits |

## Authentication

- **OAuth (default):** choose your whole account or a single project on the consent page, and a preset such as **CI**, **Crash triage**, or **Read-only**. The player server has its own consent with `player:read`, `player:write`, and `player:buy`.
- **API key:** for headless use, create a key at [blazium.games/settings/mcp](https://blazium.games/settings/mcp) and send it as `Authorization: Bearer bgames_mcp_...`. See [Access and keys](https://blazium-games.github.io/games_docs/docs/mcp/access-and-keys).

Never commit keys to a repository.

## Repository layout

| Path | Contents |
|------|----------|
| `.cursor-plugin/` | Plugin and marketplace manifests |
| `mcp.json` | MCP server config shipped with the plugin |
| `skills/` | Agent skills |
| `docs/`, `src/`, `static/` | Docusaurus documentation site |
| `scripts/check-plugin.mjs` | Validates manifests, skills, links, MCP coverage, and the version and tool counts in the docs |

## Contributing

Pull requests for the docs and plugin are welcome. Report bugs in Blazium Games itself, including the MCP servers, at [blazium-games/support](https://github.com/blazium-games/support/issues).

You need Node.js 22 or newer.

```bash
npm ci
npm start                       # docs site at http://localhost:3000/games_docs/
npm run build                   # production build; fails on broken links
node scripts/check-plugin.mjs   # plugin check (add --offline to skip the live server card)
```

The plugin check fetches the live [developer server card](https://mcp.blazium.games/.well-known/mcp/server-card.json) and [player server card](https://mcp.blazium.games/.well-known/mcp/player-server-card.json) and fails if any tool, prompt, or resource is missing from the skill references or the [MCP reference page](docs/mcp/reference.md) and [Player MCP page](docs/mcp/player.md). It also fails when the server version or tool counts written in `docs/mcp/*.md` differ from the live cards. These checks need network access; `--offline` skips them and still checks manifests, skills and links.

The site itself is static and makes no API calls, so `npm start` works offline.

## Contact

- Support: [blazium.games/support](https://blazium.games/support) or [support@blazium.games](mailto:support@blazium.games)
- Bug reports: [blazium-games/support](https://github.com/blazium-games/support/issues)
- Service status: [status.blazium.games](https://status.blazium.games)
- Privacy: [privacy@blazium.games](mailto:privacy@blazium.games)

## License

[MIT](LICENSE)
