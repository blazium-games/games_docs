---
title: Download analytics
sidebar_position: 2.9
description: How Blazium Games counts downloads of your builds, where they came from, how players had access, refused attempts, and what is and isn't recorded.
---

# Download analytics

Blazium Games is the platform for playing and publishing games, applications, mods, and assets. Every download of one of your build files is recorded, whether it came from the website, the editor asset library, the API, or an agent. Attempts that were refused are recorded too.

You see downloads on your project's **Analytics** page, on the account-wide [Analytics](https://blazium.games/analytics) page, and through the MCP tool `get_game_analytics`. Each covers the last 30 days.

## The downloads block

Game and account analytics include a `downloads` object:

| Field | Meaning |
|---|---|
| `total` | Downloads that went through. |
| `unique_users` | Distinct signed-in accounts among them. |
| `anonymous` | Downloads with no account (see [anonymous downloads](./anonymous-downloads.md)). |
| `licenses_granted` | Downloads that added a free project to someone's library for the first time. |
| `by_source` | `[{ "source", "count" }]`: where the download came from. |
| `by_access` | `[{ "access", "count" }]`: how the downloader had access. |
| `by_client` | `[{ "client", "count" }]`: the program that downloaded. |
| `by_outcome` | `[{ "outcome", "count" }]`: every attempt, including refusals. |
| `by_country` | `[{ "country", "count" }]`: two-letter country codes, where known. |
| `daily` | `[{ "day", "count" }]`: downloads that went through, per UTC day. |

Each entry in `per_game` on the account page also has `downloads`, the 30-day total for that project.

Totals count only downloads that went through (`outcome` `ok`). Refusals appear only under `by_outcome`.

## Sources

| `source` | Meaning |
|---|---|
| `website` | The store page: a signed-in download through the site, or a signed-out link when anonymous downloads are on. |
| `asset_library` | The Godot or Blazium [editor asset library](./editor-asset-library.md). |
| `api` | Any other direct call to the download API, for example a script or launcher. |
| `mcp_player` | An agent using the player MCP server. |
| `mcp_dev` | An agent using the developer MCP server. |

A signed-out download counts as `website` only when the link carries `source=website` and the browser came from a blazium.games page. Otherwise it counts as `api`. Sources are for your reports only. They don't grant or refuse anything, and a determined caller can imitate one.

## Access

| `access` | Meaning |
|---|---|
| `anonymous` | No account; anonymous downloads were on. |
| `owner` | You or an admin of the project. |
| `free` | A signed-in player downloading a free project. |
| `purchase` | A player who bought it. |
| `grant` | A player you gave it to. |
| `key` | A player who redeemed a key or gift link. |
| `bundle` | A player who got it in a bundle. |

## Clients

| `client` | How it is recognized |
|---|---|
| `godot_editor` | User-Agent `GodotEngine/<version>`. The version, such as `4.5.1`, is kept. |
| `blazium_editor` | User-Agent `BlaziumEngine/<version>`. |
| `browser` | A browser User-Agent. |
| `agent` | Agents and scripts that identify themselves, such as the Blazium MCP servers. |
| `other` | Anything else, or no User-Agent. |

## Outcomes

| `outcome` | Meaning |
|---|---|
| `ok` | The file link was handed out. |
| `sign_in_required` | Signed out, and anonymous downloads were off or the project is paid. |
| `payment_required` | Signed in, but they don't own the paid project. |
| `scanning` | The file was still being virus-scanned. |
| `unavailable` | The file link couldn't be created. |

Unknown files aren't recorded. Neither are files the caller can't see, such as a private or adult listing or a channel they aren't in.

## What is recorded

Each attempt stores the file, the build and channel, the account (or none), the source, client, access, and outcome, whether a license was granted, the country, and the host of the referring page (such as `godotengine.org`, never the full address).

**The IP address is never stored.** The country is looked up from it when the request arrives, and only the country is kept.

### Country gaps

A signed-in download on the website is requested by the site's own server for the visitor, so the address belongs to the server. Those downloads have no country. Downloads from the editor, the API, agents, and signed-out website links come straight from the downloader and do have a country.

## Through MCP

`get_game_analytics` and the `blazium-games://games/{uid}/analytics` resource return the same payload as the project's analytics page, including `downloads`. A token needs `mcp:read` or `mcp:analytics.read`. See the [MCP reference](./mcp/reference.md).
