---
title: Base Scripts
sidebar_position: 2
description: Reference for the ten Scripted API base feature scripts (hub, daily, wheel, chests, quests, leaderboards, competitions, economy, lives, meta) and shared lib modules.
---

# Base Scripts

The Scripted API includes ten ready-made feature scripts and five shared helper modules under `lib/`. They are mirrored in [`base/`](https://github.com/blazium-games/scripted_api_examples/tree/master/base) in `blazium-games/scripted_api_examples`.

Adding base script files to a pack does **not** turn them on in production. The **game owner** must enable each feature on the game's **Scripted API → Features** tab (see [Scripted API features](../scripted-api-features.md)). Calls to an enabled script whose feature is off return HTTP `403` with error code `4323` (`feature_disabled`).

## Shared `lib/` modules

Subdirectory modules are never exposed as HTTP routes. Logic files import them with `require("lib.<name>")`. Source: [`base/lib/`](https://github.com/blazium-games/scripted_api_examples/tree/master/base/lib).

| Module | Purpose | Key exports |
|---|---|---|
| `lib.router` | Standard JSON envelope and sub-route dispatch | `ok(data, version)`, `fail(status, key, message, extra)`, `bad_request(msg)`, `plan_limit(key, limit, msg)`, `body(req, schema)`, `dispatch(actions)`, `failed(res)` |
| `lib.guard` | Caller authorization and bounds checks | `user(req)`, `internal(req)`, `server(req)`, `count(val, max)`, `merge(req)` |
| `lib.state` | Per-feature state load/save, UTC day/week helpers, guest merge | `load(key, defaults)`, `save(key, value)`, `day(ts)`, `week(ts)`, `config(name, defaults)`, `combine(from, to, spec)`, `merge_user(key, from, to, combine)` |
| `lib.plan` | Plan-aware capacity scaling (`Free`, `Grow`, `Scale`) | `cap(req, feature, name)`, `clamp(req, feature, name, configured)`, `take(req, feature, name, list)` |
| `lib.reward` | Cross-script currency, item, and life payouts/charges | `give(reward_table)` (calls `economy/grant` & `lives/grant`), `charge(cost_table)` (calls `economy/debit`) |

Every base script replies in the canonical `lib.router` envelope:

- Success: `{ "ok": true, "data": { ... }, "server_time": 1764300000, "state_version": 1 }` (`state_version` is omitted when a route does not save user state)
- Failure: `{ "ok": false, "error": { "key": "...", "message": "..." } }`

## Feature map

Actions beginning with `CALL:` are **internal-only** — triggered via `api.call(...)` inside the pack or by internal platform flows (such as guest-to-account merge). External HTTP clients cannot send the `CALL` verb. Server-only HTTP routes enforce `guard.server(req)` (`X-Sapi-Key` + `X-Sapi-User`, schedule, or admin).

| Feature | Public & server HTTP routes | Internal `CALL:` actions | State keys (scope) | Config key | Manifest (`auth`, `uses`, `data`, `rate`) | Example |
|---|---|---|---|---|---|---|
| `hub` | `GET bootstrap`, `POST merge` *(internal-guarded)* | `CALL:merge` | None (fans out via `api.call`) | `hub_config` | `auth = "user"`, `methods = {"GET","POST"}`, `rate = 30/60s` | [`base/hub`](https://github.com/blazium-games/scripted_api_examples/tree/master/base/hub) |
| `daily` | `GET status`, `POST claim`, `POST dispenser` | `CALL:merge` | `daily:state` (`user`) | `daily_config` | `auth = "user"`, `uses = {"progress"}`, `data = rw user`, `rate = 30/60s` | [`base/daily`](https://github.com/blazium-games/scripted_api_examples/tree/master/base/daily) |
| `wheel` | `GET status`, `POST spin` | `CALL:merge` | `wheel:state` (`user`) | `wheel_config` | `auth = "user"`, `uses = {"progress"}`, `data = rw user`, `rate = 20/60s` | [`base/wheel`](https://github.com/blazium-games/scripted_api_examples/tree/master/base/wheel) |
| `chests` | `GET status`, `POST add_stars` *(server by default)*, `POST claim` | `CALL:add_stars`, `CALL:merge` | `chests:state` (`user`) | `chests_config` | `auth = "user"`, `uses = {"progress"}`, `data = rw user`, `rate = 30/60s` | [`base/chests`](https://github.com/blazium-games/scripted_api_examples/tree/master/base/chests) |
| `quests` | `GET status`, `POST progress` *(server only)*, `POST claim` | `CALL:event`, `CALL:merge` | `quests:state` (`user`) | `quests_pool` | `auth = "user"`, `uses = {"progress"}`, `data = rw user`, `rate = 60/60s` | [`base/quests`](https://github.com/blazium-games/scripted_api_examples/tree/master/base/quests) |
| `leaderboards` | `GET top`, `GET around`, `GET profile`, `GET daily_seed`, `POST start_run`, `POST submit` *(server only)* | `CALL:merge` | `lb:state` (`user`), `lb_meta:{board}:{user}` (`channel`) | `leaderboards_config` | `auth = "anonymous"`, `uses = {"boards","progress"}`, `data = rw channel+user`, `rate = 60/60s` (`per_ip = 120`) | [`base/leaderboards`](https://github.com/blazium-games/scripted_api_examples/tree/master/base/leaderboards) |
| `competitions` | `GET status`, `POST join`, `POST report_match` *(server only)*, `POST claim_season` | `CALL:report_match`, `CALL:merge` | `comp:state` (`user`), `comp:{season}:open` & `comp:{season}:g{g}` (`channel`) | `competitions_config` | `auth = "user"`, `uses = {"progress"}`, `data = rw channel+user`, `rate = 30/60s` | [`base/competitions`](https://github.com/blazium-games/scripted_api_examples/tree/master/base/competitions) |
| `economy` *(sensitive)* | `GET state`, `POST purchase`, `POST consume_booster`, `POST equip`, `POST upgrade`, `POST gacha`, `POST settle` | `CALL:grant`, `CALL:debit`, `CALL:merge` | `econ:state` (`user`) | `economy_config` | `auth = "user"`, `uses = {"items","progress"}`, `data = rw user`, `rate = 60/60s` | [`base/economy`](https://github.com/blazium-games/scripted_api_examples/tree/master/base/economy) |
| `lives` *(needs `economy`)* | `GET status`, `POST spend`, `POST refill`, `POST continue`, `POST gift_send`, `POST gift_claim` | `CALL:grant`, `CALL:merge` | `lives:state` (`user`), `gift:{to}:{day}:{from}` (`channel`) | `lives_config` | `auth = "user"`, `uses = {"progress"}`, `data = rw user+channel`, `rate = 60/60s` | [`base/lives`](https://github.com/blazium-games/scripted_api_examples/tree/master/base/lives) |
| `meta` | `GET status`, `POST claim_bounty`, `POST sync_rank` | `CALL:record`, `CALL:add_points`, `CALL:merge` | `meta:state` (`user`) | `meta_config` | `auth = "user"`, `uses = {"progress"}`, `data = rw user`, `rate = 30/60s` | [`base/meta`](https://github.com/blazium-games/scripted_api_examples/tree/master/base/meta) |

## Plan-scaled presets (`lib.plan`)

Every base feature runs its full core loop on **Free**, while **Grow** and **Scale** raise built-in capacity limits via `lib.plan`:

| Feature | Preset | Free | Grow | Scale |
|---|---|---|---|---|
| `daily` | `ladder_days` / `dispensers` | 7 / 2 | 14 / 6 | 30 / 12 |
| `wheel` | `slices` / `extra_spins` | 8 / 1 | 12 / 3 | 16 / 5 |
| `chests` | `tracks` / `milestones` | 1 / 5 | 3 / 10 | 8 / 20 |
| `quests` | `daily_slots` / `weekly_slots` | 3 / 2 | 4 / 3 | 6 / 5 |
| `leaderboards` | `boards` / `details_bytes` | 2 / 128 B | 20 / 512 B | 100 / 1,024 B |
| `competitions` | `concurrent` / `bracket_size` | 1 / 8 | 3 / 32 | 10 / 128 |
| `economy` | `currencies` / `catalog_items` | 2 / 25 | 6 / 100 | 12 / 250 |
| `lives` | `gifts_per_day` / `max_lives` | 5 / 5 | 10 / 10 | 20 / 20 |
| `meta` | `bounties` / `ranks` | 20 / 10 | 50 / 25 | 150 / 50 |

## Per-feature details

### `hub`

- **Routes**: `GET /v1/{game_uid}/hub/bootstrap`, plus internal-guarded `merge` (`CALL:merge`, `POST:merge` restricted by `guard.internal`).
- **Behavior**: `bootstrap` loops over `hub_config.features` (default order: `economy`, `daily`, `lives`, `wheel`, `chests`, `quests`, `meta`, `competitions`, `leaderboards`), skips disabled or uninstalled features, and returns `{ features, enabled, absent, plan, channel }`.
- **Guest merge**: `hub/merge` runs across `MERGE_ORDER` (`economy`, `daily`, `lives`, `wheel`, `chests`, `quests`, `meta`, `competitions`, `leaderboards`) in one atomic request via `api.call("<feature>/merge", { from, to })`. Never callable by player clients.

### `daily`

- **Routes**: `GET status`, `POST claim`, `POST dispenser` (`{ id }`).
- **Behavior**: Tracks `last` UTC day claimed, `streak`, `best`, and per-dispenser timestamps in `daily:state`. Pays rewards through `lib.reward.give` (`economy/grant` + `lives/grant`).
- **Config (`daily_config`)**: `ladder` (reward array), `miss_resets` (`true` by default), `dispensers` (`{ [id] = { cooldown_sec, reward } }`).

### `wheel`

- **Routes**: `GET status`, `POST spin`.
- **Behavior**: Resets `used` and `extra` daily at UTC midnight (`wheel:state`). Uses `std.random.int` for weighted slice rolls; extra spins after `free_per_day` charge `extra_cost` via `lib.reward.charge` (`economy/debit`) up to `plan.cap(req, "wheel", "extra_spins")`.
- **Config (`wheel_config`)**: `slices` (`{ weight, reward }`), `free_per_day`, `extra_cost`.

### `chests`

- **Routes**: `GET status`, `POST add_stars` (`{ stars }`), `POST claim` (`{ milestone }`); `CALL:add_stars`.
- **Behavior**: Accumulates `stars` in `chests:state`, mirrors max `chest_stars` to `progress.stat`, and opens each milestone once. `POST add_stars` requires a server caller (`guard.server`) unless `chests_config.client_add_stars = true` (capped by `client_add_max`).
- **Config (`chests_config`)**: `milestones`, `client_add_stars`, `client_add_max`.

### `quests`

- **Routes**: `GET status`, `POST progress` (`{ event, amount? }`, server-only via `guard.server`), `POST claim` (`{ id }`); `CALL:event`.
- **Behavior**: Seeds `std.random.new(seed):shuffle(...)` with the UTC day and UTC Monday-week number so every player gets the same active quest rotation with no cron job or global writes. State lives in `quests:state`.
- **Config (`quests_pool`)**: array of `{ id, kind = "daily"|"weekly", event, target, reward }`.

### `leaderboards`

- **Routes**: `GET top`, `GET around`, `GET profile`, `GET daily_seed`, `POST start_run`, `POST submit` (server-only via `guard.server`).
- **Behavior**: Uses `board(name)` alongside single-use `run_ticket` anti-cheat validation in `lb:state` (`user` scope) and per-board metadata in `lb_meta:{board}:{user}` (`channel` scope, details clamped by `details_bytes`).
- **Config (`leaderboards_config`)**: `boards` (`{ [name] = { mode, max_score, min_run_sec, require_ticket } }`), `ticket_ttl_sec`.

### `competitions`

- **Routes**: `GET status`, `POST join`, `POST report_match` (server-only via `guard.server`), `POST claim_season`; `CALL:report_match`.
- **Behavior**: Assigns joined players to weekly season brackets up to `bracket_size` using `comp:{season}:open` and `comp:{season}:g{g}` in `channel` scope, plus personal history and match dedup in `comp:state` (`user` scope).
- **Config (`competitions_config`)**: `win`, `draw`, `max_matches_per_day`, `rewards` (`{ rank, reward }`).

### `economy` (sensitive)

- **Routes**: `GET state`, `POST purchase`, `POST consume_booster`, `POST equip`, `POST upgrade`, `POST gacha`, `POST settle`; `CALL:grant`, `CALL:debit`, `CALL:merge`.
- **Behavior**: Manages currencies, owned cosmetics, boosters, equipped slots, exponential upgrades, weighted gacha pools, and capped `settle` run payouts in `econ:state`. Also calls `items.list()` so `state` includes `platform_items`. Marked **sensitive** because it changes wallet/item balances. `CALL:grant` and `CALL:debit` are internal-only.
- **Config (`economy_config`)**: `currencies`, `catalog`, `upgrades`, `gacha`, `settle_max`, `settle_daily`.

### `lives` (requires `economy`)

- **Routes**: `GET status`, `POST spend`, `POST refill`, `POST continue`, `POST gift_send` (`{ to }`), `POST gift_claim`; `CALL:grant`, `CALL:merge`.
- **Behavior**: Computes clock-based regeneration lazily from `n` and `t` in `lives:state` using `std.time.now()` (never a timer loop), and stores expiring heart gifts in `gift:{to}:{day}:{from}` (`channel` scope, TTL `gift_ttl_sec`). Calls `economy/debit` for refills and continues, so `economy` must be enabled too.
- **Config (`lives_config`)**: `max`, `regen_sec`, `refill_cost`, `continue_cost`, `gift_ttl_sec`.

### `meta`

- **Routes**: `GET status`, `POST claim_bounty`, `POST sync_rank`; `CALL:record`, `CALL:add_points`, `CALL:merge`.
- **Behavior**: Keeps stat copies in `meta:state` (since scripts write `progress` but do not read it back) so `claim_bounty` and `sync_rank` can award `lib.reward.give` payouts and rank promotions.
- **Config (`meta_config`)**: `bounties`, `ranks`.

## Extending and customizing

1. **Configuration first (no code edits)**: update `daily_config`, `wheel_config`, `economy_config`, or any other config table with `chauffeur sapi config set <name> '<json>'` or `set_sapi_config` over MCP.
2. **Add custom actions or adjust defaults**: copy the base script and `lib/` modules, keep `CALL:merge` so guest sign-ins keep working, and register new sub-routes such as `actions["POST:custom/craft"]`. See [`examples/extend-base-feature`](https://github.com/blazium-games/scripted_api_examples/tree/master/examples/extend-base-feature).
3. **Add a new sibling feature**: write a new logic file using `lib.router`, `lib.guard`, `lib.state`, and `lib.reward` (`reward.charge` / `reward.give`), and add it to `hub_config.features` if you want it in `hub/bootstrap`. See [`examples/custom-feature`](https://github.com/blazium-games/scripted_api_examples/tree/master/examples/custom-feature).
