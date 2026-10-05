---
title: Steam auth verification
sidebar_position: 5.5
description: Trade a player's Steam session ticket for a Blazium Games session token that proves they own your game, and check it from your own servers.
---

# Steam auth verification

Steam auth verification lets a Steam build of your game sign players in through Blazium Games. The game sends a Steam session ticket, and Blazium Games checks it with Steam, confirms the player owns the game, and returns a signed session token. Your servers, or any third-party service you run, check that token with the game's **auth key**.

You don't need your own Steamworks Web API key on your servers, and players don't need a Blazium Games account. If a player has [linked Steam](./linked-accounts.md#steam) to their Blazium Games account, the token says which account that is.

## Turn it on

The listing must be linked to its Steam app. Either:

- tick **Enable Steam auth verification** when you [import from Steam](./steam-import.md), or
- open the listing's **Steam** tab, enter the Steamworks Web API key, and click **Turn on**.

Blazium Games keeps the Web API key, encrypted, while this is on, and makes two keys for the listing:

| Key | Where it goes | What it does |
|---|---|---|
| **Auth key** (128 characters) | Your servers only. Never ship it in the game. | Signs session tokens (HS512) and authenticates your servers to Blazium Games. |
| **Ticket key** (`bg_` and 32 hex characters) | The game client. | The identity string the game passes to `GetAuthTicketForWebApi`. Tickets made with any other identity are refused. |

The Steam tab shows the last 4 characters of the auth key. **Show auth key** displays the whole key until your next change on the tab. Owners and admins of the listing can see it; AI agents and MCP tokens can't.

## Sign a player in

In the game, ask Steam for a Web API ticket with the ticket key as the identity, then send it to Blazium Games:

```cpp
// Steamworks SDK
SteamUser()->GetAuthTicketForWebApi("bg_0123456789abcdef0123456789abcdef");
// In the GetTicketForWebApiResponse_t callback, hex-encode m_rgubTicket.
```

```http
POST https://api.blazium.online/api/v1/steam/{game_uid}/auth
Content-Type: application/json

{ "ticket": "140000006a7e..." }
```

The answer:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzUxMiIs...",
    "expires_at": "2026-10-08T19:04:05Z",
    "steam_id": "76561197960287930",
    "family_shared": false,
    "session_uid": "3f0c...",
    "blazium_user_uid": "u_..."
  }
}
```

`blazium_user_uid` is only there when the player linked Steam. A token is issued only when Steam accepts the ticket, the account owns the game, and it has no publisher ban. The game sends the token to your servers, which check it as below.

The exact URLs for your listing are on its Steam tab, under **Endpoints**.

## Refresh a token

Tokens last 1 hour. Before or up to 24 hours after a token expires, the game can swap it for a new one without asking Steam for another ticket:

```http
POST https://api.blazium.online/api/v1/steam/{game_uid}/refresh
Content-Type: application/json

{ "token": "eyJhbGciOiJIUzUxMiIs..." }
```

Ownership is checked again, and the old token is revoked. After 24 hours, or once a token is revoked, the game needs a new ticket.

## Check a token on your servers

Your servers can check a token themselves: verify the HS512 signature with the auth key, then check the claims.

| Claim | Value |
|---|---|
| `iss` | `https://blazium.games` |
| `aud` | `steam:{app_id}` |
| `gid` | The listing's `game_uid`. |
| `sub` | The player's SteamID64. |
| `osid` | The owner's SteamID64 when the game is borrowed through Family Sharing. |
| `own` | `true` |
| `vac` | Whether Steam reported a VAC ban. |
| `buid` | The player's Blazium Games user ID, if they linked Steam. |
| `jti`, `iat`, `exp` | Token ID, issue time, and expiry. |

A local check can't see revocations. To include them, ask Blazium Games, sending the auth key as a Bearer token:

```http
POST https://api.blazium.online/api/v1/steam/{game_uid}/server/verify
Authorization: Bearer <auth key>
Content-Type: application/json

{ "token": "eyJhbGciOiJIUzUxMiIs...", "recheck_ownership": false }
```

The answer has `valid`, `expired`, `revoked`, `claims`, and `blazium_user` (`uid` and `username`) when the player linked Steam. With `recheck_ownership: true` it also asks Steam again and adds `ownership`.

## Revoke tokens and check ownership

```http
POST https://api.blazium.online/api/v1/steam/{game_uid}/server/revoke
Authorization: Bearer <auth key>

{ "jti": "..." }            // one token
{ "steam_id": "7656119..." } // every token for a player
```

```http
GET https://api.blazium.online/api/v1/steam/{game_uid}/server/ownership/{steam_id}
Authorization: Bearer <auth key>
```

The ownership answer has `owns_app`, `permanent`, `owner_steam_id`, and `checked_at`. It doesn't need a session token.

## Rotate keys and turn it off

On the Steam tab:

- **New auth key** makes a new auth key. The old one stops working right away and every session token is revoked.
- **New ticket key** makes a new ticket key. Builds with the old one can't sign in until they're updated.
- **Turn off** revokes every token, deletes both keys, and forgets the Web API key. Turning it on again makes new keys.

If the auth key leaks, make a new one at once, then update your servers.

## Limits

| Routes | Limit |
|---|---|
| `auth` and `refresh` | 60 per minute per IP address, and 1,200 per minute per game. |
| `server/*` | 1,200 per minute per game. Wrong auth keys are limited to 30 per minute per IP address. |

## Errors

| Code | HTTP | Meaning |
|---|---|---|
| `4245` | 404 | Steam auth verification is off for this game. |
| `4246` | 400 or 401 | The ticket isn't hex, or Steam refused it. Make it with the game's ticket key. |
| `4247` | 403 | The Steam account doesn't own the game, or has a publisher ban. |
| `4248` | 401 or 422 | The token isn't valid for this game, or its session ended. |
| `4249` | 401 | Send the game's auth key as a Bearer token. |
| `4240` | 400 | `steam_id` isn't a SteamID64, or revoke got neither `jti` nor `steam_id`. |
| `4243` | 502 | Steam didn't answer, or refused the game's Web API key. Update the key on the Steam tab. |
| `4290` | 429 | Too many requests. |

## What players should know

Each sign-in stores a session record with the player's Steam ID, the owner's Steam ID for Family Sharing, the linked Blazium Games account if any, the token's expiry, and the IP address. Records are deleted 30 days after the token expires. Tickets aren't stored. See the [Steam API disclosure](./legal/steam-api-disclosure.md) and the [Privacy Policy](https://blazium.games/privacy-policy).
