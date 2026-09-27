---
title: Access and keys
sidebar_position: 2
description: Account versus project access, project keys and admins, read-only tokens, and key rotation for the Blazium Games MCP server.
---

# Access and keys

## Access scope

Account access (an account key, or OAuth with **Account**) reaches every project you own or administer. Project access (your project key, or OAuth with one project) reaches only that project:

- `list_games` and `blazium-games://games` return only that project.
- Account-only: `get_profile`, `get_setup`, `list_mcp_keys`, `request_mcp_key`, `create_game`, and `blazium-games://me`.
- Everything else for that project works: page details and updates, analytics, crashes, builds, deploy info, and `request_deploy_key`.

## Read and write

OAuth tokens carry the scopes `mcp:read` and `mcp:write`. A token without `mcp:write` (for example when you tick **Read-only access** on the consent page) can only read. Any change, such as `create_game`, `update_game`, `request_mcp_key`, or `request_deploy_key`, returns `403` with code `4031` "This token is read-only".

API keys and website sessions have both scopes.

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
