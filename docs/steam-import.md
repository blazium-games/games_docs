---
title: Import from Steam
sidebar_position: 2.45
description: Copy a game's Steam store page into a new or existing Blazium Games listing with your Steamworks Web API key.
---

# Import from Steam

If your game is already on Steam, you can copy its store page into a Blazium Games listing instead of filling it in by hand. Everything that has a matching field here comes over: the name and description, genres and tags, release status, images, press kit details, price, content warnings, and a link back to the Steam store page.

You need [developer mode](./developer-mode.md), the game's Steam app ID, and a Steamworks Web API key for the publisher that owns the app.

## Get a Steamworks Web API key

Importing uses a **publisher** Web API key, not a personal Steam Web API key.

1. Sign in to [Steamworks](https://partner.steamgames.com/).
2. Open **Users & Permissions > Manage Groups** and pick a group that has the app.
3. Create a Web API key for the group, or copy its existing one. It is 32 characters, 0-9 and A-F.

Blazium Games asks Steam which apps the key covers before it reads anything. A key that doesn't cover the app is refused with `4241`.

## Import

1. Open [Import from Steam](https://blazium.games/import/steam). It is also on your [Dashboard](https://blazium.games/dashboard) as **Import from Steam**, and on the New project page.
2. Enter the app ID, or paste the store link (`https://store.steampowered.com/app/480/...`).
3. Paste the Web API key.
4. Under **Import into**, choose **A new draft listing**, or a listing you own or help run.
5. Untick any **Parts to import** you want to keep as they are. A new listing always takes the name and description.
6. Tick **Enable Steam auth verification** if your game will use [Steam auth verification](./steam-auth.md). Otherwise the key is used for this import only and is not saved.
7. Click **Preview** to see what would change. Nothing is saved yet.
8. Click **Import**. You land on the listing's **Steam** tab.

A new listing starts as a draft. Check it over, upload builds, and publish it from the Settings tab as usual. Imported images go through the same size checks as uploads; see [Listings](./listings.md).

## What is imported

| Part | Listing fields |
|---|---|
| Name, tagline and description | Name, short description, and the "About this game" text converted to Markdown. |
| Genres, tags, players and inputs | Steam genres and the most used store tags mapped onto platform genres and tags, single-player or multiplayer, local or online play, and keyboard and mouse, gamepad, or VR input. |
| Release status | **Released**, or **In development** while Steam says "Coming soon". |
| Cover, thumbnail and screenshots | Steam's screenshots, resized to the platform sizes, up to the screenshot limit. The first becomes the cover and thumbnail, and screenshots under 1280x720 are skipped. These replace the current images. |
| Press kit release date and website | The release date, website, trailer, and developer and publisher credits on the [press kit](./press-kit.md). |
| Price | The US price, or free. A non-USD or missing price is skipped. |
| Content warnings and adult flag | Steam's mature content descriptors and age gate. |
| Steam store link | The Steam entry in the listing's store links. |

The preview and the result list every field as **imported**, **skipped** (with the reason, such as a value the listing check would refuse), or **not imported**. Languages, system requirements, achievements, and DLC have no field here. Supported operating systems come from the builds you upload. Import each DLC as its own listing.

## Resync and unlink

The listing's **Steam** tab (on the edit page, `/edit/{your-listing}?tab=steam`) shows the linked app and when it was imported and last synced.

- **Resync** runs the import again for the parts you tick. Enter the Web API key, or leave it empty when Steam auth verification is on and the saved key is used.
- **Unlink from Steam** removes the link, turns off Steam auth verification, deletes its keys, and forgets the Web API key. The imported fields stay as they are.

Each Steam app can be linked to one listing. Unlink it there before importing it somewhere else (`4242`).

## Limits

- 60 previews and 10 imports or resyncs per account per day (`4290` past that).
- Only apps that Steam lists as a game can be imported.
- The Web API key is never shown again, never written to logs, and can't be used through MCP. Importing is only on the website.

## API

The website calls these routes with your session. They are refused for MCP tokens.

| Method and path | Body | Returns |
|---|---|---|
| `POST /api/v1/private/steam/import/preview` | `app_id`, `web_api_key`, optional `game_uid` and `groups` | The fields that would change: `imported`, `skipped`, `not_imported`, `screenshots`, and `target`. |
| `POST /api/v1/private/steam/import` | The same, plus `enable_auth` | `game_uid`, `vanity_name`, `created`, the report, and `steam` (the Steam tab settings). |
| `GET /api/v1/private/games/{game_id}/steam` | | The Steam tab settings. `4244` when the listing isn't linked. |
| `POST /api/v1/private/games/{game_id}/steam/resync` | `groups`, optional `web_api_key` | The report and the settings. |
| `DELETE /api/v1/private/games/{game_id}/steam` | | Unlinks the listing. |

`groups` can include `text`, `taxonomy`, `status`, `images`, `press`, `price`, `age`, and `store_link`. Leaving it out imports every part.

## Errors

| Code | HTTP | Meaning |
|---|---|---|
| `4105` | 403 | Turn on [developer mode](./developer-mode.md) first. |
| `4240` | 400 or 422 | The app ID, key, or groups are not valid, Steam has no store page for the app, or the app isn't a game. |
| `4241` | 403 | The key isn't a Steamworks publisher key for this app. |
| `4242` | 409 | Another listing has this app, or this listing is linked to a different app. |
| `4243` | 502 | Steam didn't answer. Try again in a few minutes. |
| `4244` | 404 | The listing isn't linked to Steam. |
| `4290` | 429 | Daily preview or import limit reached. |

What Blazium Games reads from Steam, and what it keeps, is in the [Steam API disclosure](./legal/steam-api-disclosure.md).
