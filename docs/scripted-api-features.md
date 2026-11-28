---
title: Scripted API features
sidebar_position: 8.6
description: The ten ready-made Scripted API features, how each one is turned on per game, the calls they answer, and what happens to a call to a feature that is off.
---
# Scripted API features

A Scripted API pack is a folder of Luau files, and a few jobs come up in nearly every game: a daily reward, a lucky wheel, chests, quests, boards, competitions, a wallet, lives, a rank ladder, and one call that starts a session. Blazium has a ready-made script for each of those. Each one answers fixed routes under your game, so a game client and your own scripts can rely on the same names.

A feature only runs after the **game owner** turns it on. Adding the files to a pack does not turn anything on, and a pack can hold files for features that are still off.

## The features

| Feature | What it does | Needs |
|---|---|---|
| `hub` | One call, `GET /v1/{game_uid}/hub/bootstrap`, that starts a session: the server time, and the status of every feature that is on. | |
| `daily` | Daily rewards, streaks and cooldown dispensers. | |
| `wheel` | A weighted lucky-spin wheel. | |
| `chests` | Star and milestone chests. | |
| `quests` | Daily and weekly quests. | |
| `leaderboards` | Period and partitioned leaderboards, with a daily seed, runs and a player profile. | |
| `competitions` | Asynchronous brackets and weekly seasons. | |
| `economy` | Wallets, boosters, cosmetics, upgrades, gacha and run settlement. It moves wallet value, so it is a **sensitive** feature. | |
| `lives` | Lives and energy that refill with the server clock, continues and gifts. | `economy` |
| `meta` | Achievement bounties and rank ladders. | |

Each feature answers sub-paths of its own name:

```text
GET  /v1/{game_uid}/daily/status
POST /v1/{game_uid}/daily/claim
POST /v1/{game_uid}/wheel/spin
POST /v1/{game_uid}/economy/purchase
```

A sub-path is the `action` of the request (`req.action` in Luau). A logic file can also add its own actions next to the ready-made ones, for example `POST /v1/{game_uid}/economy/custom/craft`. Every reply uses the same envelope, `{ "ok": true, "data": { }, "server_time": 1767225600, "state_version": 12 }`, and every answer carries an `X-Blazium-Server-Time` header, so a client can show countdowns without trusting its own clock. A failure is `{ "ok": false, "error": { "key": "...", "message": "..." } }`.

One feature script reaches another with `api.call("economy/grant", body)`, for example `daily` paying out through `economy`. That inner call is not counted again against your plan, and an action only meant for other scripts cannot be called from outside the pack.

## Capabilities

A script can only do what its logic table lists in `uses`. A few of those uses are also switched on per game, because they reach beyond your own data:

| Capability | What it allows | Plan |
|---|---|---|
| `items` | Grant and list platform items for players. Sensitive. | Free |
| `progress` | Write achievements, stats and events. | Free |
| `inbox` | Write to other players' inboxes. Sensitive. | Free |
| `profiles` | Look up player profiles for boards. | Free |
| `lobby` | Call between Scripted API scripts and [scripted lobbies](./multiplayer.md). Sensitive. | Grow |
| `lobby_data` | Lobby scripts keep data in the [lobby data store](./multiplayer.md#lobby-data). Sensitive. | Grow |

Turning a feature on also turns on the capabilities it uses, and `get_sapi_features` lists exactly which.

## Turning a feature on

Open the game in the editor, choose the **Scripted API** tab and use the **Features** panel. Only the owner can turn a feature on, and only from the website while signed in. The panel shows what a feature needs, and a feature that needs another one offers to turn both on. A sensitive feature shows what it can do and asks the owner to confirm first. A feature or capability that needs a paid plan says so and does not turn on until the game has that plan.

A deploy key (`chauffeur`) or an MCP key can see the state and turn a feature **off**, never on. `chauffeur sapi feature enable economy` and `enable_sapi_feature` only print what to ask the owner and the link to use.

A feature that is turned off stops answering at once. Its stored data is kept and its schedules pause. A feature that another enabled feature needs cannot be turned off alone: turn the other one off first, or both in one step with `--cascade`. Staff can turn a feature off for a game that abuses it, and it stays off until staff allow it.

## Games that already run a pack

A game that started before features existed keeps working exactly as it did: nothing is blocked until its owner chooses to manage features. When the owner does, Blazium reads the active packs, turns on the features the pack already provides, and from then on a feature that is off is refused. The panel offers a preview of what would stay on before the change is made.

## A call to a feature that is off

The call is refused before any script runs and without counting against the plan:

```json
{ "ok": false, "error": { "code": 4323, "key": "feature_disabled", "message": "daily is not turned on for this game", "feature": "daily" } }
```

The HTTP status is `403`. See [error codes](./scripted-api-reference.md#error-codes). A script that uses a capability that is off, or calls a feature that is off with `api.call`, raises the same error and names the feature or capability. A call that needs a plan the game does not have answers `402` with the key `plan_limit`.

## Tools

| Job | Command | MCP tool |
|---|---|---|
| See what is on, and what each needs | `chauffeur sapi features` | `get_sapi_features` |
| See who changed it | `chauffeur sapi feature history` | `get_sapi_feature_history` |
| Ask the owner to turn one on | `chauffeur sapi feature enable <feature>` | `enable_sapi_feature` |
| Turn one off | `chauffeur sapi feature disable <feature> [--cascade]` | `disable_sapi_feature` |
| Download the live scripts | `chauffeur sapi pull [checksum\|active\|latest] --dir <path>` | `get_sapi_pack_files`, `get_sapi_file` |

Write the scripts locally, run `chauffeur sapi test`, publish with `chauffeur sapi publish`, and ask the owner to turn the feature on. The local emulator (`chauffeur sapi dev`) runs every feature, so you can test before the owner turns anything on.