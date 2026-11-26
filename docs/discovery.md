---
title: Discovery files
sidebar_position: 2.7
description: The files machines read to crawl, trust, and find Blazium Games, and the files this site does not publish.
---

# Discovery files

Blazium Games is a game publishing platform, with an infrastructure focus. The files below tell crawlers, browsers, and agents where the public site, the docs, the APIs, and the MCP servers are.

`llms.txt` is a curated map for agents. It is not a search-ranking file, and publishing it does not grant crawl rights. Google does not use it for ranking. Crawlers follow `robots.txt` and the sitemaps. Share titles for each public page are on [SEO and indexing](./seo-and-indexing.md).

## Crawl

| URL | What it says |
|---|---|
| `https://blazium.games/robots.txt` | `User-agent: *` and `Allow: /`. Disallows the signed-in routes `/settings`, `/login`, `/signup`, `/setup`, `/logout`, `/password`, `/library`, `/friends`, `/redeem`, `/purchase`, `/approve`, `/dashboard`, `/edit`, and `/new`. Home, browse, the desktop app, support, the legal pages, `llms.txt`, `humans.txt`, and the sitemap stay allowed. |
| `https://<you>.blazium.games/robots.txt` | Allows the public developer site and disallows `/<game>/embed`. |
| `https://blazium.games/sitemap.xml` | The platform's public pages (including `/blog` and each published post), every developer profile with an indexable listing, and every indexable store page. |
| `https://blazium.games/blog` | The blog. Posts are also at `GET https://api.blazium.online/api/v1/public/articles` and `GET https://api.blazium.online/api/v1/public/articles/{slug}`, and in [the RSS file](https://cdn.blazium.online/articles/rss.xml). |
| `https://<you>.blazium.games/sitemap.xml` | That developer's profile, and their indexable store pages and press pages. |

## Trust

`https://blazium.games/.well-known/security.txt` is the vulnerability contact for the publishing platform (RFC 9116):

- Contact: `mailto:support@blazium.games`
- Contact: [https://github.com/blazium-games/support/security/advisories/new](https://github.com/blazium-games/support/security/advisories/new)
- Policy: [https://github.com/blazium-games/support/security/policy](https://github.com/blazium-games/support/security/policy)
- Canonical: `https://blazium.games/.well-known/security.txt`
- Preferred languages: `en`
- **Expires: `2027-09-29T00:00:00.000Z`.** Renew this date before it passes. Clients are expected to ignore an expired file.

The same contact is in the [security policy](https://github.com/blazium-games/support/blob/master/SECURITY.md). Developer sites do not serve this file.

Also published:

- [Privacy Policy](https://blazium.games/privacy-policy), [Terms of Service](https://blazium.games/terms-of-service), and [Permissions](https://blazium.games/permissions)
- [GitHub](https://blazium.games/github-api-disclosure), [X](https://blazium.games/x-api-disclosure), and [Discord](https://blazium.games/discord-api-disclosure) API disclosures
- [Subprocessors](https://blazium.games/subprocessors)
- [Support](https://blazium.games/support) and [status.blazium.games](https://status.blazium.games/)
- [humans.txt](https://blazium.games/humans.txt)

## Guidance for agents

These files are maps. They do not replace `robots.txt` or the sitemaps.

- `https://blazium.games/llms.txt` describes the platform, its APIs, the blog, its agent skills, and its MCP servers. The same connect and sign-in steps are at `https://mcp.blazium.games/llms.txt` and [https://docs.blazium.games/llms.txt](https://docs.blazium.games/llms.txt). The full guides are `https://blazium.games/llms-full.txt`, `https://mcp.blazium.games/llms-full.txt`, and [https://docs.blazium.games/llms-full.txt](https://docs.blazium.games/llms-full.txt). The blog is `https://blazium.games/blog`, the articles API is `https://api.blazium.online/api/v1/public/articles`, and the feed is `https://cdn.blazium.online/articles/rss.xml`.
- `https://blazium.games/skill.md` tells an agent which Blazium Games skill to load for which job. `https://blazium.games/.well-known/agent-skills/index.json` lists each skill with its URL and a sha256 digest of the file served there, and each skill is at `https://blazium.games/.well-known/agent-skills/<name>/SKILL.md`. They are served on the root site only. A developer site answers 404 for them. The sources are the [skills](https://github.com/blazium-games/games_docs/tree/master/skills) in this repository.
- `https://<you>.blazium.games/llms.txt` lists that developer's indexable listings.
- `https://<you>.blazium.games/<game>/llms.txt` summarizes one indexable listing.
- [https://docs.blazium.games/llms.txt](https://docs.blazium.games/llms.txt) is a short map of these docs, starting with the MCP steps.

There is no training opt-out file. Public pages stay allowed for every user-agent. Naming training crawlers, or publishing a Content-Signal or a text-and-data-mining reservation, would be a separate decision.

The public site does not serve a Markdown twin of every page. The docs map above is the Markdown entry point.

## Where these files come from

The root site's `llms.txt`, `llms-full.txt`, `skill.md`, and agent skills index, and the MCP server's `llms.txt` and `llms-full.txt`, are generated from this repository with `node scripts/discovery.mjs`. The docs map `static/llms.txt` is the source of the shared connect steps, the skills are the source of `skill.md` and the index, and `scripts/templates/site-appendix.md` is the part only the root site carries. Each of the other two repositories pins the games_docs commit it was generated from and fails its tests when its files differ from that output. `llms.txt`, `llms-full.txt`, `skill.md`, and `humans.txt` are cached for an hour, so a regenerated file is live within an hour of a deploy.

## Developer discovery

`https://blazium.games/.well-known/api-catalog` is an [RFC 9727](https://www.rfc-editor.org/rfc/rfc9727) linkset (`application/linkset+json`). It links to these documents:

- Docs: [https://docs.blazium.games/](https://docs.blazium.games/)
- Status: [https://status.blazium.games/](https://status.blazium.games/)
- [https://blazium.games/llms.txt](https://blazium.games/llms.txt)
- Agent skills: [skill.md](https://blazium.games/skill.md) as a service-doc, and the [skills index](https://blazium.games/.well-known/agent-skills/index.json) as a describedby.
- Developer server card: [https://mcp.blazium.games/.well-known/mcp/server-card.json](https://mcp.blazium.games/.well-known/mcp/server-card.json)
- Player server card: [https://mcp.blazium.games/.well-known/mcp/player-server-card.json](https://mcp.blazium.games/.well-known/mcp/player-server-card.json)
- OAuth protected-resource metadata (RFC 9728) for [the developer server](https://mcp.blazium.games/.well-known/oauth-protected-resource/mcp) and [the player server](https://mcp.blazium.games/.well-known/oauth-protected-resource/player)
- The public API's OpenAPI 3.1 description, as the `service-desc` of `https://api.blazium.online/api/v1/public/`: [JSON](https://api.blazium.online/api/v1/public/openapi.json) and [YAML](https://api.blazium.online/api/v1/public/openapi.yaml). Its `service-doc` is the [public API reference](./api-reference.md).
- The [editor asset library](./editor-asset-library.md) repository URL: `https://api.blazium.online/api/v1/public/asset-library`
- Public JSON: [search](https://api.blazium.online/api/v1/public/search), [articles](https://api.blazium.online/api/v1/public/articles), and [sitemap](https://api.blazium.online/api/v1/public/sitemap)
- Blog RSS: [https://cdn.blazium.online/articles/rss.xml](https://cdn.blazium.online/articles/rss.xml)

Indexable store pages publish `VideoGame` or `SoftwareApplication` JSON-LD. Profiles publish `ProfilePage` and `Person`.

## Files this site does not publish

- **AsyncAPI.** The website's live updates are not a public interface. The public HTTP API has an [OpenAPI description](./api-reference.md). Signed-in account routes are left out of it; agents use the MCP servers, which publish server cards.
- **ads.txt.** Blazium Games does not sell ad inventory.
- **Apple or Android association files.** The desktop program people can download today is BlaziumLauncher for Windows and Linux, not a mobile app.
- **ai.txt, identity.json, an A2A agent card, or an empty agent card.** Agents call the MCP servers, and those servers already publish server cards. An empty card would claim a protocol this site does not serve.
- **A training opt-out file.** See the guidance section above.
