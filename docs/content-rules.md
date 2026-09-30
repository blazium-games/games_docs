---
title: Content rules
sidebar_position: 2.2
description: When a listing must be marked adult, how players opt in to adult content, content warnings, and the generative AI disclosure.
---

# Content rules

These rules come from the [Terms of Service](https://blazium.games/terms-of-service#14-content-ratings-and-adult-content). This page explains how they work on the store.

## Content warnings

Set every warning that applies on the **Listing** tab or with `update_game_taxonomy`: violence, gore, sexual, nudity, language, drugs, gambling, horror, flashing_lights. They show on the store page, and players can leave out listings with a warning with the content filter on [Browse](https://blazium.games/browse) (for example **no gore**) or `exclude_warnings` in [search](./listings.md#search).

## Adult content

Tick **Adult content (sexual content or nudity)** on the **Settings** tab of the edit page, or with `adult: true` on `create_game` or `update_game`, if it contains sexual content or nudity. Add the matching content warnings too. Other mature themes only need their warnings.

An adult listing:

- Shows only to signed-in players who confirmed they are 18 or older and turned on adult content. Signed-out visitors get a 404 (`4004`); signed-in players who haven't opted in see a page that explains how to turn it on (`4104`, HTTP 403).
- Is left out of search, recommendations, and the tools and mods rows of other games for everyone who hasn't opted in, and out of shelves, friends' activity, popular tags, sitemaps, and llms.txt for everyone. It is never indexed by search engines. See [SEO and indexing](./seo-and-indexing.md).
- Shows an **18+** badge on its store page.

You and your project's admins always see your own adult listings.

Content that sexualizes minors, presents non-consensual sexual acts as real, or is otherwise illegal is never allowed, marked adult or not. We may change a listing's rating or warnings, or unlist it, if it is mislabeled.

### Turning on adult content as a player

Open [Settings](https://blazium.games/settings#adult), find **Adult content**, tick **I am 18 or older, and adult content is legal where I live**, and click **Show adult content**. Without the confirmation the change is refused (`4108`). **Hide adult content** turns it off again.

Over the API: `PUT /api/v1/private/settings/adult` with `{"show": true, "confirm_18": true}`. It returns `show_adult`, `adult_confirmed`, and `sees_adult`.

## Generative AI disclosure

Disclose every part of a listing made with generative AI on the **Listing** tab (**Made with generative AI**) or with `ai_uses` on `update_game_taxonomy`:

| Value | Store page label |
|---|---|
| `art` | Art |
| `audio` | Music and sound |
| `code` | Code |
| `text` | Writing |
| `voice` | Voices |
| `runtime` | Generates content while you play |

The store page lists them under **Generative AI**, and players filter by them with `ai_uses` in [search](./listings.md#search). Leaving the disclosure empty says you used no generative AI for those parts, so it must be honest and complete. It is separate from the [made-with label](./listings.md#made-with), which says who made the game.
