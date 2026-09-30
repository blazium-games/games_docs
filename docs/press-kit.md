---
title: Press kit
sidebar_position: 2.4
description: Give journalists and creators a press page and a downloadable zip with your game's facts and images.
---

# Press kit

Every public or invisible listing has a press page at `https://<you>.blazium.games/<game>/press`, linked as **Press kit** from the store page. It shows the facts from your listing plus the press kit you fill in, and offers a zip download with the facts and your store images.

## Fill it in

Open the **Press kit** tab of the edit page, or use the `get_press_kit` and `set_press_kit` MCP tools. Everything is optional.

| Field | Notes |
|---|---|
| Release date | Free text up to 32 characters, for example `2026-11-14` or `Q1 2027` |
| Press contact email | Shown on the press page |
| Website, trailer link | `https://` links |
| History | How the game came to be, markdown, up to 8000 characters |
| Features, awards | Up to 20 each, one per line on the website, up to 200 characters each |
| Links | Up to 20, as `Label | https://...` on the website |
| Quotes | Up to 20, as `Quote | Source | https://...` on the website (the link is optional) |
| Team | Up to 50 credits, as `Name | Role` on the website |

Saving replaces the whole press kit. A link that isn't https, a bad email, or too many entries returns `4235`.

## What the press page shows

Your listing's name, tagline, description, type, status, developer, platforms, cover, thumbnail and gallery, and its newest changelog entries, plus everything above. Placeholder images are left out.

## The zip

`press.zip` holds `factsheet.json` (the same facts as the page) and an `images/` folder with the cover, thumbnail, and gallery. Images over 16 MB, or past 64 MB in total, are left out. It is rate limited to 10 downloads a minute per visitor.

## API

- `GET https://api.blazium.online/api/v1/public/games/{uid}/press`: the factsheet as JSON.
- `GET https://api.blazium.online/api/v1/public/games/{uid}/press.zip`: the zip.
- `GET` and `PUT /api/v1/private/games/{uid}/press`: read and replace the press kit.

Press pages follow the listing: a draft has no press page, an adult listing's press page needs the viewer's [adult opt-in](./content-rules.md#adult-content), and the page is indexed only when the listing is (see [SEO and indexing](./seo-and-indexing.md)).
