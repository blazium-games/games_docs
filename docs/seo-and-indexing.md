---
title: SEO and indexing
sidebar_position: 2.6
description: Which store pages search engines and AI crawlers may index, how to turn indexing off, and the sitemaps, robots.txt, llms.txt and structured data Blazium Games publishes.
---

# SEO and indexing

Search engines and AI crawlers may index a store page when all of these are true:

- The listing is `public`.
- It isn't marked [adult](./content-rules.md#adult-content).
- **Let search engines and AI crawlers index this page** is ticked on the **Settings** tab (on by default), or `indexable` is `true` over the API or MCP.

The Settings tab says whether the page can be indexed right now. Other pages still reach the listing through links; turning indexing off only asks crawlers to stay away. To hide a listing from people too, make it `invisible` or `draft`.

## What changes when a page isn't indexable

- The store page, its press page, and its tools and mods pages send `<meta name="robots" content="noindex, nofollow">` and an `X-Robots-Tag: noindex` header.
- The listing is left out of every sitemap and llms.txt file.
- The page has no structured data.

## Sitemaps and robots.txt

| URL | Contents |
|---|---|
| `https://blazium.games/sitemap.xml` | The storefront's public pages, every developer profile with an indexable listing, and every indexable store page |
| `https://<you>.blazium.games/sitemap.xml` | Your profile, and your indexable store pages and their press pages |
| `https://blazium.games/robots.txt` | Points to the root sitemap |
| `https://<you>.blazium.games/robots.txt` | Points to your sitemap and the root sitemap, and keeps crawlers off embed pages (`/<game>/embed`) |

Sitemaps list listings whose owner has a verified email and a finished account. The data behind them refreshes every ten minutes, and responses may be cached for up to an hour. `GET https://api.blazium.online/api/v1/public/sitemap` returns the same data as JSON.

## llms.txt

[llms.txt](https://llmstxt.org) files give AI agents a plain-text summary:

- `https://blazium.games/llms.txt` describes the storefront, its APIs, and its MCP servers.
- `https://<you>.blazium.games/llms.txt` lists your indexable listings with a link to each one's summary.
- `https://<you>.blazium.games/<game>/llms.txt` summarizes one indexable listing: type, price, platforms, genres, tags and community tags, generative AI use, content warnings, parent game, and links to the store page, press kit, tools and mods pages, and the listing JSON. It returns 404 for a listing that can't be indexed.

## Structured data

Indexable store pages include [JSON-LD](https://json-ld.org): a `VideoGame` for games, mods and plugins, or a `SoftwareApplication` for everything else, with the tagline, cover image, developer, genres, price, operating systems, player count (games, mods and plugins), tags and community tags as keywords, the review rating when there are reviews, and `isBasedOn` when the parent game is on Blazium Games.
