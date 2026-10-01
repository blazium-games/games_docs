---
title: Access and keys
sidebar_position: 2
description: Account versus project access, project keys and admins, read-only tokens, and key rotation for the Blazium Games MCP server.
---

# Access and keys

## Access scope

Account access (an account key, or OAuth with **Account**) reaches every project you own or administer. Project access (your project key, or OAuth with one project) reaches only that project:

- `list_games` and `blazium-games://games` return only that project.
- Account-only tools return `403` with code `4030`: `get_profile`, `get_setup`, `list_mcp_keys`, `request_mcp_key`, `create_game`, `get_account`, `request_email_code`, `verify_email`, `set_timezone`, `get_approval`, `confirm_approval`, the deprecated wallet, purchase, and library tools, and the `blazium-games://me`, `wallet`, and `library` resources.
- Everything else for that project works: page details and updates, analytics, crashes, bug tickets, reviews, builds, channels, deploy info, key pools, and `request_deploy_key`. Calls for any other game return `4030`.
- Approvals requested with a project token are approved from the owner's email, since the token can't call `get_approval` or `confirm_approval`.

## Read, write, and narrower scopes

OAuth tokens carry `mcp:read` and `mcp:write`, or narrower scopes per area: `mcp:catalog.write`, `mcp:build.write`, `mcp:crash.read`, `mcp:analytics.read`, `mcp:keys.manage`, and `mcp:money`. The consent page offers presets for them (**Store page**, **CI**, **Crash triage**, **Keys**, **Money**, **Read-only**, **Full access**); see [Scopes](./reference.md#scopes).

- A token without any write scope (for example when you tick **Read-only access**) can only read. Any change returns `403` with code `4031` "This token is read-only".
- A call outside the token's scopes, such as `update_game` with a **CI** token, returns `4073`.

API keys and website sessions have every scope.

## Approvals

Over MCP, rotating an account or deploy key, deleting a deploy key, creating more than 100 game keys at once, adding a project admin, promoting to `stable`, and deleting a game or build wait for the account owner, even with full access. The call returns an `approval` whose `confirm_url` the owner opens (they also get an email with the link and a 6-digit code). Once approved, the agent repeats the call with the same `idempotency_key`. See [Approvals for risky actions](./reference.md#approvals-for-risky-actions).

## Project keys and admins

- There is no shared project key. Each owner and admin creates their own key for a project, so every action is traced to a person.
- Creating a project key replaces only your own previous key for that project. Other admins' keys are never shown or affected.
- Removing an admin from a project revokes their key for it.
- The project owner can turn off MCP access for admins from the project's MCP tab. That immediately revokes the admins' keys for that project and blocks all of their MCP access to it: account keys, project keys, and OAuth. Admins keep normal website access, and the owner's own access is not affected. The switch can only be changed from the website.
- Every MCP call is audit-logged with the user, the key or OAuth grant, and the project.

## Keys and rotation

- Rotating on [blazium.games/settings/mcp](https://blazium.games/settings/mcp), or calling `request_mcp_key`, issues a new account key and revokes all previous account keys. Project keys are not affected.
- Secrets are shown once. Only key prefixes are listed afterwards.
- `request_deploy_key` issues a new `X-Access-Token` and `X-Secret-Key` for CLI and CI, and revokes that project's previous upload keys.

Before rotating, find every place the old key is used (MCP client configs, CI secrets) so you can update them right away.
