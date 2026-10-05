---
title: Discovery files
sidebar_position: 2.7
description: The files machines read to crawl, trust, and find Blazium Games, and the files this site does not publish.
---

# Discovery files

Blazium Games is the platform for playing and publishing games, applications, mods, and assets. The files below tell crawlers, browsers, and agents where the public site, the docs, the APIs, and the MCP servers are.

`llms.txt` is a curated map for agents. It is not a search-ranking file, and publishing it does not grant crawl rights. Google does not use it for ranking. Crawlers follow `robots.txt` and the sitemaps. Share titles for each public page are on [SEO and indexing](./seo-and-indexing.md).

## Crawl

| URL | What it says |
|---|---|
| `https://blazium.games/robots.txt` | `User-agent: *` and `Allow: /`. Disallows the signed-in routes `/settings`, `/login`, `/signup`, `/setup`, `/logout`, `/password`, `/library`, `/friends`, `/redeem`, `/purchase`, `/approve`, `/dashboard`, `/edit`, and `/new`. Home, browse, the desktop app, support, the legal pages, `llms.txt`, `humans.txt`, and the sitemap stay allowed. |
| `https://<you>.blazium.games/robots.txt` | Allows the public developer site and disallows `/<game>/embed`. |
| `https://blazium.games/sitemap.xml` | The platform's public pages, every developer profile with an indexable listing, and every indexable store page. |
| `https://<you>.blazium.games/sitemap.xml` | That developer's profile, and their indexable store pages and press pages. |

## Trust

`https://blazium.games/.well-known/security.txt` is the vulnerability contact for the marketplace (RFC 9116):

- Contact: `mailto:support@blazium.games`
- Contact: [https://github.com/blazium-games/support/security/advisories/new](https://github.com/blazium-games/support/security/advisories/new)
- Policy: [https://github.com/blazium-games/support/security/policy](https://github.com/blazium-games/support/security/policy)
- Canonical: `https://blazium.games/.well-known/security.txt`
- Preferred languages: `en`
- **Expires: `2027-09-29T00:00:00.000Z`.** Renew this date before it passes. Clients are expected to ignore an expired file.

The same contact is in the [security policy](https://github.com/blazium-games/support/blob/main/SECURITY.md). Developer sites do not serve this file.

Also published:

- [Privacy Policy](https://blazium.games/privacy-policy), [Terms of Service](https://blazium.games/terms-of-service), and [Permissions](https://blazium.games/permissions)
- [GitHub](https://blazium.games/github-api-disclosure), [X](https://blazium.games/x-api-disclosure), and [Discord](https://blazium.games/discord-api-disclosure) API disclosures
- [Subprocessors](https://blazium.games/subprocessors)
- [Support](https://blazium.games/support) and [status.blazium.games](https://status.blazium.games/)
- [humans.txt](https://blazium.games/humans.txt)

## Guidance for agents

These files are maps. They do not replace `robots.txt` or the sitemaps.

- `https://blazium.games/llms.txt` describes the platform, its APIs, and its MCP servers.
- `https://<you>.blazium.games/llms.txt` lists that developer's indexable listings.
- `https://<you>.blazium.games/<game>/llms.txt` summarizes one indexable listing.
- [https://docs.blazium.games/llms.txt](https://docs.blazium.games/llms.txt) is a short map of these docs.

There is no training opt-out file. Public pages stay allowed for every user-agent. Naming training crawlers, or publishing a Content-Signal or a text-and-data-mining reservation, would be a separate decision.

The public site does not serve a Markdown twin of every page. The docs map above is the Markdown entry point.

## Developer discovery

`https://blazium.games/.well-known/api-catalog` is an [RFC 9727](https://www.rfc-editor.org/rfc/rfc9727) linkset (`application/linkset+json`). It links to these documents:

- Docs: [https://docs.blazium.games/](https://docs.blazium.games/)
- Status: [https://status.blazium.games/](https://status.blazium.games/)
- [https://blazium.games/llms.txt](https://blazium.games/llms.txt)
- Developer server card: [https://mcp.blazium.games/.well-known/mcp/server-card.json](https://mcp.blazium.games/.well-known/mcp/server-card.json)
- Player server card: [https://mcp.blazium.games/.well-known/mcp/player-server-card.json](https://mcp.blazium.games/.well-known/mcp/player-server-card.json)
- OAuth protected-resource metadata (RFC 9728) for [the developer server](https://mcp.blazium.games/.well-known/oauth-protected-resource/mcp) and [the player server](https://mcp.blazium.games/.well-known/oauth-protected-resource/player)
- The public API's OpenAPI 3.1 description, as the `service-desc` of `https://api.blazium.online/api/v1/public/`: [JSON](https://api.blazium.online/api/v1/public/openapi.json) and [YAML](https://api.blazium.online/api/v1/public/openapi.yaml). Its `service-doc` is the [public API reference](./api-reference.md).
- The [editor asset library](./editor-asset-library.md) repository URL: `https://api.blazium.online/api/v1/public/asset-library`
- Public JSON: [search](https://api.blazium.online/api/v1/public/search) and [sitemap](https://api.blazium.online/api/v1/public/sitemap)

Indexable store pages publish `VideoGame` or `SoftwareApplication` JSON-LD. Profiles publish `ProfilePage` and `Person`.

## Files this site does not publish

- **AsyncAPI.** The website's live updates are not a public interface. The public HTTP API has an [OpenAPI description](./api-reference.md). Signed-in account routes are left out of it; agents use the MCP servers, which publish server cards.
- **ads.txt.** Blazium Games does not sell ad inventory.
- **Apple or Android association files.** The desktop program people can download today is BlaziumLauncher for Windows, installed under the shared Blazium folder, not a mobile app.
- **ai.txt, identity.json, an A2A agent card, or an empty agent card.** Agents call the MCP servers, and those servers already publish server cards. An empty card would claim a protocol this site does not serve.
- **A training opt-out file.** See the guidance section above.
