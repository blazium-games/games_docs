---
title: OAuth and discovery
sidebar_position: 3
description: OAuth 2.1, PKCE, dynamic client registration, and discovery endpoints for the Blazium Games MCP server.
---

# OAuth and discovery

This page is for MCP client authors. If you use Cursor, VS Code, or Claude Code, the [Connect](./index.md) page is all you need.

## OAuth details

- PKCE `S256` is required, and the `code_verifier` must be 43 to 128 unreserved characters (RFC 7636). `resource` is optional; when sent it must be `https://mcp.blazium.games/mcp` or `https://mcp.blazium.games` (or `https://mcp.blazium.games/player` for the player server) (RFC 8707).
- Access tokens last one hour. The token response includes a refresh token, rotated on every use, so clients renew without asking you to sign in again. Rotation keeps the original 30-day expiry: after 30 days the user signs in again.
- Each refresh token works once. Presenting a spent one revokes every token from that sign-in, so a stolen refresh token stops working as soon as either party uses it.
- Authorization codes work once and expire after 10 minutes.
- The consent page is protected against cross-site requests: Allow and Deny only work from the page itself.
- Scopes: `mcp:read`, `mcp:write`, and the narrower `mcp:catalog.write`, `mcp:build.write`, `mcp:crash.read`, `mcp:analytics.read`, `mcp:keys.manage`, and `mcp:money` (see [Scopes](./reference.md#scopes)). `mcp:read mcp:write` is granted when the client asks for none, unless the user ticks **Read-only access** or picks a preset on the consent page. The player server uses `player:read`, `player:write`, and `player:buy`.
- Authorization responses include `iss` (RFC 9207). Errors and Deny are sent back to the client as `error=...` (RFC 6749).
- Dynamic Client Registration (RFC 7591) at `https://mcp.blazium.games/oauth/register` accepts https redirects, loopback `http://127.0.0.1` and `http://localhost` on any port, and app schemes such as `cursor://` and `vscode://` (RFC 8252). Public clients use `none`; confidential clients may use `client_secret_post` or `client_secret_basic`.
- Client ID Metadata Documents (an https `client_id`) are supported; only the document's `redirect_uris` are accepted.
- Loopback redirect URIs also work without registering a client.
- Unauthenticated `/mcp` calls return `401` with `WWW-Authenticate` naming the resource metadata and scopes; a rejected token adds `error="invalid_token"`.

## Discovery

Clients and agents can find the server without any configuration:

- MCP server card: [`https://mcp.blazium.games/.well-known/mcp/server-card.json`](https://mcp.blazium.games/.well-known/mcp/server-card.json) (also `https://mcp.blazium.games/.well-known/mcp.json`, and redirected from `https://blazium.games/.well-known/mcp.json`).
- Protected resource metadata (RFC 9728): `https://mcp.blazium.games/.well-known/oauth-protected-resource/mcp`.
- Authorization server metadata (RFC 8414): `https://mcp.blazium.games/.well-known/oauth-authorization-server` (also `/.well-known/openid-configuration`). The path-suffixed forms `/.well-known/oauth-authorization-server/mcp` and `/player` also work; as RFC 8414 requires, they report the suffixed URL as `issuer` and set `authorization_response_iss_parameter_supported` to `false`.
- Player server: `https://mcp.blazium.games/.well-known/mcp/player-server-card.json`, `https://mcp.blazium.games/.well-known/oauth-protected-resource/player`, and `https://mcp.blazium.games/.well-known/oauth-authorization-server/player`.
- [llms.txt](https://blazium.games/llms.txt) lists the server for AI agents.

The server card is generated from the running server, so it always matches the [reference](./reference.md).
