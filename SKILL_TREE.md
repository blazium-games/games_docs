# Blazium Games Skill Tree

## Start Here

New to Blazium Games in Cursor? Start with [blazium-games-get-started](skills/blazium-games-get-started/SKILL.md). It connects the MCP server, verifies your account, and routes you to the right skill.

## Skills

| Skill | Use it to | Key tools |
|-------|-----------|-----------|
| [blazium-games-get-started](skills/blazium-games-get-started/SKILL.md) | Connect, verify, and pick a workflow | `get_profile`, `get_setup` |
| [blazium-games-store-page](skills/blazium-games-store-page/SKILL.md) | Create or edit a store page, set a price or donations | `create_game`, `update_game`, `set_game_price` |
| [blazium-games-deploy](skills/blazium-games-deploy/SKILL.md) | Ship builds from CI or the CLI | `get_deploy_info`, `request_deploy_key`, `list_game_builds` |
| [blazium-games-crash-reporting](skills/blazium-games-crash-reporting/SKILL.md) | Send crashes and events from a game | `get_deploy_info`, `list_game_builds`, `get_game_build` |
| [blazium-games-debug-crash](skills/blazium-games-debug-crash/SKILL.md) | Triage and fix crashes | `list_game_crashes`, `get_crash`, `request_crash_download` |
| [blazium-games-analytics](skills/blazium-games-analytics/SKILL.md) | Summarize page traffic | `get_game_analytics` |
| [blazium-games-keys](skills/blazium-games-keys/SKILL.md) | Inspect and rotate credentials | `list_mcp_keys`, `request_mcp_key`, `request_deploy_key` |
| [blazium-games-player](skills/blazium-games-player/SKILL.md) | Connect the player server, check the account, wallet, library, and spending limit | `get_account`, `get_library`, `get_agent_policy` |
| [blazium-games-purchases](skills/blazium-games-purchases/SKILL.md) | Buy, donate, top up, and download with the human's approval | `quote_purchase`, `purchase_game`, `get_wallet` |

## Typical paths

- **New game:** get-started, store-page, deploy, crash-reporting
- **Sell a game:** store-page (verify email, set a price), deploy
- **Buy a game:** player, purchases
- **Existing game, new build:** deploy, crash-reporting
- **Players report crashes:** debug-crash
- **Leaked key:** keys

## References

- [Tools](skills/blazium-games-get-started/references/tools.md)
- [Resources](skills/blazium-games-get-started/references/resources.md)
- [Prompts](skills/blazium-games-get-started/references/prompts.md)
- [Authentication](skills/blazium-games-get-started/references/auth.md)
