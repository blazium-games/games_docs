---
title: Sign in with a project's application
sidebar_position: 3.2
description: A project registers an OAuth application so its players can sign in, or create a Blazium account, and link it.
---

# Sign in with a project's application

An OAuth application lets a project's players sign in, or create a Blazium account, and link it. The application has a client id and a secret. The player's platform sends both. This is not the MCP server at `mcp.blazium.games`, and it is not Steam auth. A token from this flow cannot call MCP or spend money.

One application is included. Another one needs Premium at $29 a month on that project. Business includes that. After a downgrade, the first application stays usable. Extra applications stay listed and paused, and their authorize requests fail until the project is Premium or Business again.

Create one on the project's **Sign-in** tab, or with `list_oauth_apps` and `create_oauth_app`. The secret is shown once. Copy it before you leave the page. It cannot be shown again.

## What the player agrees to share

The consent page names the project and the application.

- Always: the account's user id, the username when one is set, and the avatar URL when one is set.
- Email only when the application has email turned on and the request includes the `email` scope. An unverified email is not released. The page says so.

The player can revoke a link from **Settings > Linked apps**. Revoking deletes that application's tokens for that account. Blazium does not give the developer a list of every linked player's email.

## URLs

| Step | URL |
|---|---|
| Authorize | `https://blazium.games/oauth/authorize` |
| Token | `https://api.blazium.online/api/v1/oauth/token` |
| User info | `https://api.blazium.online/api/v1/oauth/userinfo` |
| Discovery | `https://blazium.games/.well-known/oauth-authorization-server` |

`state` is required and echoed. PKCE `S256` is required, and the client secret is required. Redirect URLs are matched exactly: `https`, or `http://127.0.0.1` and `http://localhost` with a port. No wildcards. One to eight URLs, each up to 512 characters. The name the player sees is 1 to 64 characters.

Codes work once and expire after 10 minutes. Access tokens expire after 1 hour. Refresh tokens rotate and keep a 30-day family. The token endpoint answers with `error` and `error_description`. `userinfo` accepts only an access token from this flow.

The owner on a website session creates, changes, rotates, and deletes immediately. An agent, or an admin who is not the owner, waits for the owner's approval.
