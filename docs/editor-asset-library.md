---
title: Editor asset library
sidebar_position: 2.8
description: The repository URL Godot and Blazium paste into the AssetLib to list plugins, editor assets, tools, and project templates from Blazium Games, with optional sign-in for licensed downloads.
---

# Editor asset library

Blazium Games is the platform for playing and publishing games, applications, mods, and assets. Godot and Blazium already include an AssetLib tab. Point that tab at Blazium Games and it lists and installs packages with no extra plugin.

In the editor, open **Editor Settings**, then **Asset Library**, and add this repository under `asset_library/available_urls`:

`https://api.blazium.online/api/v1/public/asset-library`

Give it a name such as **Blazium Games**. The editor requests `configure`, `asset`, and `asset/{id}` under that URL, then downloads the file when you choose **Download**. Blazium Hub and other tools can call the same routes.

The old URL, `https://api.blazium.online/asset-library/api`, no longer answers. Replace it with the one above.

The routes are also in the [OpenAPI description](./api-reference.md).

## What shows up

The AssetLib tab lists addons. The project manager lists templates (`type=project`).

| Category id | Category | Listings |
|---|---|---|
| `1` | Plugins | `plugin` |
| `2` | Editor assets | `dev_asset` |
| `3` | Tools | `tool` |
| `4` | Templates | a plugin, editor asset, tool, or game asset whose zip contains `project.godot` |

A package is listed when all of these are true:

- it is public and not adult;
- the owner has verified their email;
- the stable channel has a zip that passed the virus scan;
- it declares Godot or Blazium compatibility, or the build has an engine version, so the editor's version filter can include it. The editor sends its major.minor version and ignores the patch number.

Paid packages are listed too. You buy them on the website, then download them in the editor while signed in. Games, applications, and mods stay on the store page.

Publishing stays on the website and the upload tools.

## Browsing and downloading

Browsing needs no account. Every row says what this caller needs before downloading:

| Field | Meaning |
|---|---|
| `anonymous_download` | `true` when anyone can download the package without signing in. The developer turned on [anonymous downloads](./anonymous-downloads.md). |
| `download_requires` | `none`, `sign_in`, or `purchase`, for this caller. |
| `price_cents`, `currency` | The price. `0` is free. |

Who can download what:

| Caller | Free, anonymous downloads on | Free, anonymous downloads off | Paid |
|---|---|---|---|
| No token | Yes, with no license | `401`, code `4001` | `401`, code `4001` |
| Signed in | Yes, and a free license the first time | Yes, and a free license the first time | Only if you own it; otherwise `402`, code `4023` |
| Owner or admin | Yes | Yes | Yes |

When a caller can't download yet, the package description starts with a note and a link to the store page. A `401` or `402` body also has `data.browse_url`. A paid package's error adds `game_uid`, `price_cents`, and `currency`.

A signed-in caller also sees their own listings, including private ones, and adult listings if their account confirmed they are 18 or older and opted in.

## Signing in

Send a player credential in the `Authorization` header:

```http
Authorization: Bearer bgames_play_...
```

Either credential works:

- **A player key** (starts with `bgames_play_`), created at [blazium.games/settings/mcp](https://blazium.games/settings/mcp).
- **A player OAuth access token** from `https://mcp.blazium.games/.well-known/oauth-authorization-server/player`, for the resource `https://mcp.blazium.games/player`.

The credential needs the `player:read` scope. A token without it gets `403`, code `4031`. An invalid or expired token gets `401`. It is not treated as anonymous. The `BLAZIUM_GAMES` header is accepted as well.

`configure` returns these details so a client can set up sign-in:

```json
{
  "categories": [{ "id": "1", "name": "Plugins", "type": "0" }],
  "login_url": "https://blazium.games/login",
  "auth": {
    "type": "bearer",
    "header": "Authorization",
    "scope": "player:read",
    "keys_url": "https://blazium.games/settings/mcp",
    "authorization_server": "https://mcp.blazium.games/.well-known/oauth-authorization-server/player",
    "resource": "https://mcp.blazium.games/player",
    "signed_in": false
  }
}
```

With a valid token, `signed_in` is `true` and `username` is set.

The stock Godot editor does not send a token yet, so in the editor you see every package and can download those with `anonymous_download: true`. Buy or sign in on the website for the others.

## Routes

Each route is a GET. A successful answer is the raw object the editor parses, with HTTP 200 and no envelope. Errors use the Blazium envelope: `{"success": false, "error": {"code": 4040, "message": "..."}}`. The editor shows any non-200 answer as a failed request.

| Route | What it returns |
|---|---|
| `/api/v1/public/asset-library/configure` | Categories and the `auth` block above. `type=project` returns Templates. Anything else returns Plugins, Editor assets, and Tools. |
| `/api/v1/public/asset-library/asset` | `{ "result", "page", "pages", "page_length", "total", "total_items" }`. `page` is 0-based. `total` and `total_items` are the same count. |
| `/api/v1/public/asset-library/asset/{asset_id}` | One package. An unknown or hidden id returns `404`, code `4040`. |
| `/api/v1/public/asset-library/asset/{asset_id}/download` | Redirects (`302`) to a file link that is valid for five minutes. The editor follows the redirect. |

`asset_id` is numeric. In the JSON, `asset_id`, `author_id`, `category_id`, and `version` are decimal strings.

A package has these fields:

- `cost` is the license name, such as `MIT`, `CC0`, `CC-BY`, `CC-BY-SA`, `Source Available`, `Proprietary`, or `Unknown`.
- `description` is the listing text with BBCode escaped (`[` is sent as `[lb]`), so listing text can't add links or formatting in the editor.
- `download_url` is the download route.
- `download_hash` is the zip's SHA-256 hex, or an empty string when the file has no sha256 checksum.
- `browse_url` is the store page.

The download's other answers are:

- `401` or `402`, as described above;
- `409`, code `4099`, while the build is still being scanned;
- `503`, code `5030`, when the file link can't be signed.

### Search parameters

The list accepts the editor's query:

- `type`, `category`, `support`, `filter`, `user`, `cost`, `godot_version`;
- `max_results`, from 1 to 500 (default 10);
- `page` or `offset`;
- `sort` (`updated`, `name`, `cost`, `rating`) and `reverse`.

Blazium adds `price` (`free` or `paid`). Godot never sends it.

Support values are `official`, `community`, and `testing`, joined with `+`. Packages are community listings. The editor checks Featured and Community by default (`support=official+community`), so they show.

An unknown sort, support, category, or other filter value returns an empty `result` with HTTP 200, because the editor treats any other status as a failure. `filter` is up to 100 characters.

## Caching, limits, and CORS

- **Cache:** answers without a token are `Cache-Control: private, max-age=60`, so a client may reuse them for a minute but shared caches don't keep them. The anonymous catalog refreshes at most once a minute, so a new or changed package can take a minute to appear. Answers with a token are `private, no-store`. Responses vary on `Authorization` and `BLAZIUM_GAMES`.
- **Rate limits:** browsing allows 300 requests a minute per IP address. Downloads allow 60 a minute per IP address. Past either limit the answer is `429`.
- **CORS:** any origin may call these routes (`Access-Control-Allow-Origin: *`). Credentials are never allowed. Sign-in is the header, never a cookie.

## Analytics

Every download attempt is counted in the developer's [download analytics](./download-analytics.md) with the source `asset_library`. The client is read from the User-Agent: `GodotEngine/4.5.1` counts as the Godot editor 4.5.1, and `BlaziumEngine/...` as the Blazium editor.
