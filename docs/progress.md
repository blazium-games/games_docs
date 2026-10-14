---
slug: /progress
title: Progress, funnels, and presence
sidebar_label: Progress
sidebar_position: 8
description: Achievements, integer stats, funnel events, rich presence, and who is allowed to write them.
---

# Progress, funnels, and presence

Each achievement, stat, and funnel event names the writers that may change it. A call is refused when the caller's role is not in that list. An empty writer list refuses every write. A new definition defaults to `client`.

| Writer | Who it is |
|---|---|
| `client` | The logged-in player, through the SDK, the Godot plugin, or the engine host. Can only write that player. |
| `game_server` | The studio's official dedicated server, using a game server key. May name any player who owns the game. |
| `private_server` | A community server, using a key with that role. Same ownership check, and only definitions that list this role. |
| `scripted_lobby` | The published Luau pack running on the lobby host, for a player seated in that lobby. |

Removing `client` stops a modified client from granting the stat. The game server key is not the deploy key and not an anticheat key. The secret is returned once.

## Ownership

`GET /api/v1/private/games/{id}/ownership` answers the signed-in session.

- `owned` and `beta_access` match the license.
- `owns_edition` is true when `?edition=` is a SKU slug or kind the player owns, or a lower edition in the existing upgrade order.
- `?listing=` answers a second listing used as DLC. There is no separate DLC relation.

The SDK method is `BlaziumUser()->Ownership(edition, listing)`. The Godot plugin method is `ownership(edition, listing_uid)`.

## Achievements and stats

An achievement unlocks once. A stat is an integer with op `set`, `add`, or `max`. A game can have 100 achievements and 50 stats.

The store page lists the definitions. The library shows that player's unlocks and stat values. A game reads the same rows with `GET /api/v1/private/player/progress?game_id=`. The Godot plugin method is `progress()`. The SDK method is `BlaziumAPI_Progress()`. Unity and Unreal call `Progress()` on the user binding. The answer has `achievements` (`slug`, `name`, `unlocked_at`) and `stats` (`slug`, `name`, `value`).

## Funnels

`session_start`, `session_end`, `boot_ok`, `first_input`, `quit`, and `crash` stay on `POST /api/v1/public/events` with `X-App-Id` and `X-Build-Id`. `RecordStandardEvents` and `record_standard_events` send those six in one call.

Any other name must be a registered funnel. Unknown names are refused. `get_game_analytics` adds an `events` block for registered events: count, unique devices, and a daily series. Pass `build` to limit that series. Visitor and download numbers stay as they are.

## Rich presence

Friends see a status of at most 40 characters beside the game name, and the lobby id the lobby API already returns. It is hidden when activity sharing is off. `presence_writers` defaults to `client`.

A single-player game sets its own status with `set_presence(status)` on the Godot plugin and `BlaziumAPI_SetPresence` on the SDK. Unity and Unreal call `SetPresence`. That call is allowed only when `presence_writers` includes `client`. It does not send a lobby signature.

A scripted lobby does not write presence. `lobby:set_presence(user, status)` notifies that player's connection. The lobby host signs that notice. The launcher, the engine host, or the Godot plugin applies it only when the signature is present and `presence_writers` includes `scripted_lobby`. A client cannot claim the scripted lobby writer by itself.

The Godot plugin also writes as an official server with `server_unlock_achievement`, `server_set_stat`, and `server_record_event`, using the same server key as the SDK. Those calls do not set presence.

## Scripted lobby

The pack calls these on `lobby`. The host performs them. The user must be seated in that lobby.

- `unlock_achievement(user, slug)`
- `set_stat(user, slug, value)`
- `record_event(user, name, fields)`
- `analytics(name)` reads count, unique devices, and the daily totals for one event that lists `scripted_lobby`. An optional build filter uses the same shape. It does not return visitor or download analytics.
- `set_presence(user, status)` only notifies that player.

## MCP and the progress file

These developer tools replace a whole list. Set calls need `mcp:catalog.write`.

`get_achievements`, `set_achievements`, `get_stats`, `set_stats`, `get_funnels`, `set_funnels`, `get_presence_writers`, `set_presence_writers`, `list_server_keys`, `request_server_key`, `revoke_server_key`.

A deploy key can upload the same lists. A section that is present replaces that list. A section that is absent is left as it is. Server keys stay on MCP and the private API.

```bash
chauffeur progress show
chauffeur progress apply --file progress.yml
```

```yaml
spec: progress
achievements:
  - slug: first_win
    name: First win
    writers: [client, game_server]
stats:
  - slug: score
    name: Score
    op: max
    writers: [client]
funnels:
  - name: level_complete
    writers: [client, scripted_lobby]
presence_writers: [client, scripted_lobby]
```
