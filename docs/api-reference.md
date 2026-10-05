---
title: Public API reference
sidebar_position: 2.95
description: The OpenAPI description of the public Blazium Games API, how to authenticate, the response envelope, error codes, rate limits, and the endpoints it covers.
---

# Public API reference

Blazium Games is the platform for playing and publishing games, applications, mods, and assets. The public API at `https://api.blazium.online` serves the catalog, the editor asset library, signed-out downloads, game telemetry, and build registration.

## OpenAPI description

The public endpoints are described in OpenAPI 3.1:

- JSON: [https://api.blazium.online/api/v1/public/openapi.json](https://api.blazium.online/api/v1/public/openapi.json)
- YAML: [https://api.blazium.online/api/v1/public/openapi.yaml](https://api.blazium.online/api/v1/public/openapi.yaml)

Load either into Swagger UI, Redocly, Postman, or a client generator. The document is also linked from the [API catalog](./discovery.md#developer-discovery) as `service-desc`.

Signed-in account routes (`/api/v1/private/...`) are used by the website and the MCP servers and are not part of it. Agents should use the [developer](./mcp/index.md) or [player](./mcp/player.md) MCP server instead.

## Authentication

Most public routes need no credentials. The rest take a header:

| Scheme | Header | Used by |
|---|---|---|
| Player key or player OAuth token | `Authorization: Bearer ...` (or the `BLAZIUM_GAMES` header) | Optional on the [editor asset library](./editor-asset-library.md). Needs `player:read`. |
| Deploy key | `X-Access-Token` and `X-Secret-Key` | Build registration. See [Deploy builds](./deploy.md). |
| Game id | `X-App-Id` and `X-Build-Id` | Crash and event ingest. See [Crash reporting](./crash-reporting.md). |
| Steam auth key | `Authorization: Bearer ...` | The `server` routes of [Steam auth verification](./steam-auth.md), from your own servers. |

Player keys start with `bgames_play_` and are created at [blazium.games/settings/mcp](https://blazium.games/settings/mcp). Player OAuth tokens come from `https://mcp.blazium.games/.well-known/oauth-authorization-server/player`. See [Player MCP](./mcp/player.md).

Credentials are always headers. These routes never read cookies.

## Responses

Answers use the Blazium envelope:

```json
{ "success": true, "data": { } }
```

```json
{ "success": false, "error": { "code": 4040, "message": "File not found" } }
```

Some errors add a top-level `data` object. A download that needs a sign-in or a purchase, for example, adds `browse_url` and the price.

The editor asset library is the exception. Its successful answers are the raw objects the Godot and Blazium editors parse, with no envelope. Its errors still use the envelope.

### Common error codes

| Code | HTTP | Meaning |
|---|---|---|
| `4001` | 401 | Sign in to download (or sign in and buy). |
| `4023` | 402 | Buy this game to download it. |
| `4031` | 403 | The token lacks the scope this route needs (`player:read`). |
| `4033` | 403 | This kind of token can't use this route. |
| `4040` | 404 | Not found, or not public. |
| `4099` | 409 | The file is still being virus-scanned. |
| `4130` | 413 | Too many events or metadata keys in one request. |
| `5030` | 503 | The download link couldn't be signed. Try again. |

An invalid or expired token returns `401`. It is never treated as anonymous.

## Rate limits

These limits are per IP address, per minute. Past a limit the answer is `429`.

| Routes | Limit |
|---|---|
| Asset library browsing (`configure`, `asset`, `asset/{asset_id}`) | 300 |
| Asset library download | 60 |
| Signed-out downloads (`/downloads/{file_uid}` and `/redirect`) | 60 |
| OpenAPI document | 120 |
| Press kit zip | 30 |
| Crash reports and events (`POST`) | 60 |

Shelves, tags, the sitemap, mods and tools, and press kits also have overall limits across all callers.

## CORS

The asset library, signed-out downloads, and the OpenAPI document allow any origin (`Access-Control-Allow-Origin: *`), without credentials. A browser tool on any site can call them.

## Endpoints

| Method and path | What it does |
|---|---|
| `GET /health`, `GET /ready` | Liveness and readiness. |
| `GET /api/v1/public/openapi.json`, `.yaml` | The OpenAPI document. |
| `GET /api/v1/public/asset-library/configure` | Editor categories and sign-in details. |
| `GET /api/v1/public/asset-library/asset` | Search editor packages. |
| `GET /api/v1/public/asset-library/asset/{asset_id}` | One editor package. |
| `GET /api/v1/public/asset-library/asset/{asset_id}/download` | Redirect to the package zip. |
| `GET /api/v1/public/downloads/{file_uid}` | A signed link for a file, without an account, when [anonymous downloads](./anonymous-downloads.md) are on. |
| `GET /api/v1/public/downloads/{file_uid}/redirect` | The same, answered with a redirect. |
| `GET /api/v1/public/search` | Catalog search. See [Listings](./listings.md). |
| `GET /api/v1/public/shelves/{kind}` | A home page shelf, such as `new`, `browser_playable`, or `tonight`. `limit` is 1 to 24. See [Shelves](./listings.md#shelves). |
| `GET /api/v1/public/tags/popular` | The most used tags. |
| `GET /api/v1/public/sitemap` | Indexable listings and developers. |
| `GET /api/v1/public/store-rules` | Price limits and fees. |
| `GET /api/v1/public/games/{game_id}` | A listing. |
| `GET /api/v1/public/games/{game_id}/reviews` | Its reviews. |
| `GET /api/v1/public/games/{game_id}/relations` | Its parent, dependencies, and similar titles. |
| `GET /api/v1/public/games/{game_id}/children` | Its mods and tools. |
| `GET /api/v1/public/games/{game_id}/press`, `/press.zip` | Its [press kit](./press-kit.md). |
| `GET /api/v1/public/games/{game_id}/files/{file_uid}/provenance` | Where a build file came from, and its scan state. |
| `GET /api/v1/public/user/{user_id}/games/{game_id}/files` | A listing's public files. |
| `POST /api/v1/public/crashes` | Send a crash report. |
| `POST /api/v1/public/events` | Send game events. |
| `POST /api/v1/tool/upload/build` | Register a build with a deploy key. |
| `POST /api/v1/steam/{game_uid}/auth`, `/refresh` | Trade a Steam session ticket for a session token, or refresh one. See [Steam auth verification](./steam-auth.md). |
| `POST /api/v1/steam/{game_uid}/server/verify`, `/server/revoke` | Check or revoke session tokens with the game's Steam auth key. |
| `GET /api/v1/steam/{game_uid}/server/ownership/{steam_id}` | Ask whether a Steam account owns the game, with the Steam auth key. |

File uploads go to `uploader.blazium.online` and are described in [Deploy builds](./deploy.md) and the [chauffeur CLI](./cli/index.md).
