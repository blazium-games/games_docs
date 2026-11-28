---
title: Payloads Cookbook
sidebar_position: 5
description: Request, response, error, and internal-call JSON payload examples sourced from the public Blazium Scripted API and Scripted Lobby example repositories.
---

# Payloads Cookbook

This cookbook collects the JSON request, response, error, and internal action payloads from [`payloads/`](https://github.com/blazium-games/scripted_api_examples/tree/master/payloads) in `blazium-games/scripted_api_examples` and the payload contracts in `blazium-games/scripted_lobby_examples`.

Replace `https://sapi.blazium.online`, `<player-token>`, and `<service-key>` with your game's live URL and tokens.

## Standard envelopes

### Base feature success (`lib.router.ok`)

```json
{
  "ok": true,
  "data": {},
  "server_time": 1764300000,
  "state_version": 1
}
```

### Base feature domain error (`lib.router.fail`)

```json
{
  "ok": false,
  "error": {
    "key": "already_claimed",
    "message": "today's reward was already claimed",
    "next_claim_in": 43200
  }
}
```

### Platform error (`4300`–`4324`)

```json
{
  "ok": false,
  "error": {
    "code": 4323,
    "key": "feature_disabled",
    "message": "the economy feature is not enabled for this game",
    "feature": "economy"
  }
}
```

See [`payloads/errors.json`](https://github.com/blazium-games/scripted_api_examples/blob/master/payloads/errors.json) and [Scripted API reference → Error codes](../scripted-api-reference.md#error-codes) for all 25 codes (`4300`–`4324`).

## Session bootstrap and guest merge (`hub`)

Source: [`payloads/routes/hub.json`](https://github.com/blazium-games/scripted_api_examples/blob/master/payloads/routes/hub.json).

**`GET /v1/{game_uid}/hub/bootstrap`** (`Authorization: Bearer <player-token>`):

```json
{
  "ok": true,
  "data": {
    "features": {
      "economy": {
        "wallet": { "coins": 50 },
        "owned": {},
        "boosters": {},
        "equipped": {},
        "upgrades": {},
        "platform_items": []
      },
      "daily": {
        "claimable": true,
        "streak": 0,
        "best": 0,
        "next_streak": 1,
        "next_reward": { "coins": 50 },
        "ladder_index": 1,
        "next_claim_in": 0,
        "dispensers": {
          "free_chest": { "ready": true, "ready_in": 0 }
        }
      }
    },
    "enabled": ["economy", "daily"],
    "absent": ["lives", "wheel", "chests", "quests", "meta", "competitions", "leaderboards"],
    "plan": "free",
    "channel": "stable"
  },
  "server_time": 1764300000
}
```

**Internal `CALL:merge` (`hub/merge`)** (never callable from game clients; player tokens receive `403 forbidden`):

```json
// Request
{ "from": "guest_123", "to": "user_456" }

// Success response
{
  "ok": true,
  "data": {
    "merged": ["economy", "daily"],
    "skipped": ["lives", "wheel", "chests", "quests", "meta", "competitions", "leaderboards"]
  },
  "server_time": 1764300000
}
```

## Progression and retention routes

### `daily` ([`routes/daily.json`](https://github.com/blazium-games/scripted_api_examples/blob/master/payloads/routes/daily.json))

- **`POST /v1/{game_uid}/daily/claim`** (body `{}`):
  ```json
  {
    "ok": true,
    "data": {
      "claimable": false,
      "streak": 1,
      "best": 1,
      "next_streak": 1,
      "next_reward": { "coins": 50 },
      "ladder_index": 1,
      "next_claim_in": 43200,
      "dispensers": { "free_chest": { "ready": true, "ready_in": 0 } },
      "reward": { "coins": 50 },
      "missing": []
    },
    "server_time": 1764300000,
    "state_version": 1
  }
  ```
- **Repeat claim error (`409`)**:
  ```json
  {
    "ok": false,
    "error": {
      "key": "already_claimed",
      "message": "today's reward was already claimed",
      "next_claim_in": 43200
    }
  }
  ```
- **`POST /v1/{game_uid}/daily/dispenser`** (`{ "id": "free_chest" }`): returns `{ "ok": true, "data": { "reward": { "coins": 25 }, "ready_in": 14400 }, ... }` or `409 cooling_down`.

### `wheel` ([`routes/wheel.json`](https://github.com/blazium-games/scripted_api_examples/blob/master/payloads/routes/wheel.json))

- **`POST /v1/{game_uid}/wheel/spin`** (body `{}`):
  ```json
  {
    "ok": true,
    "data": {
      "free_spins": 0,
      "extra_cost": { "gems": 5 },
      "extra_left": 1,
      "slices": [{ "weight": 30, "reward": { "coins": 25 } }],
      "slice": 1,
      "reward": { "coins": 25 },
      "paid": false,
      "missing": []
    },
    "server_time": 1764300000,
    "state_version": 1
  }
  ```
- **Plan cap on extra spins (`403 plan_limit`)**:
  ```json
  {
    "ok": false,
    "error": {
      "key": "plan_limit",
      "message": "no spins left today",
      "limit": 1,
      "limit_key": "extra_spins",
      "upgrade": "https://blazium.games/pricing"
    }
  }
  ```

### `chests`, `quests`, and `meta`

- **`POST /v1/{game_uid}/chests/add_stars`** (`X-Sapi-Key` + `X-Sapi-User`, `{ "stars": 5 }`): returns `{ "stars": 20, "milestones": [...] }` ([`routes/chests.json`](https://github.com/blazium-games/scripted_api_examples/blob/master/payloads/routes/chests.json)).
- **`POST /v1/{game_uid}/chests/claim`** (`{ "milestone": 1 }`): returns `reward` + updated `milestones`, or `409 not_earned` / `already_claimed`.
- **`POST /v1/{game_uid}/quests/progress`** (`X-Sapi-Key` + `X-Sapi-User`, `{ "event": "run_finished", "amount": 1 }`) & **`POST /v1/{game_uid}/quests/claim`** (`{ "id": "play_3" }`) ([`routes/quests.json`](https://github.com/blazium-games/scripted_api_examples/blob/master/payloads/routes/quests.json)).
- **`POST /v1/{game_uid}/meta/claim_bounty`** (`{ "id": "first_win" }`) & **`POST /v1/{game_uid}/meta/sync_rank`** (`{}`): returns `{ "points": 120, "rank": "Silver", "rank_index": 2, "next_rank": "Gold", "next_rank_points": 300, "promoted": true }` ([`routes/meta.json`](https://github.com/blazium-games/scripted_api_examples/blob/master/payloads/routes/meta.json)).

## Leaderboards and competitions

### `leaderboards` ([`routes/leaderboards.json`](https://github.com/blazium-games/scripted_api_examples/blob/master/payloads/routes/leaderboards.json))

1. **`POST /v1/{game_uid}/leaderboards/start_run`** (`{ "board": "main" }`):
   ```json
   {
     "ok": true,
     "data": { "run_ticket": "a1b2c3d4e5f60708", "board": "main", "seed": 3182940211 },
     "server_time": 1764300000,
     "state_version": 1
   }
   ```
2. **`POST /v1/{game_uid}/leaderboards/submit`** (`X-Sapi-Key` + `X-Sapi-User`, `{ "board": "main", "score": 1200, "run_ticket": "a1b2c3d4e5f60708", "details": { "stage": 4 } }`):
   ```json
   {
     "ok": true,
     "data": { "board": "main", "rank": { "rank": 1, "score": 1200 } },
     "server_time": 1764300010,
     "state_version": 2
   }
   ```
   Common errors: `403 forbidden` (player caller), `409 bad_ticket` / `stale`, `422 too_fast` / `score_out_of_range`.

### `competitions` ([`routes/competitions.json`](https://github.com/blazium-games/scripted_api_examples/blob/master/payloads/routes/competitions.json))

- **`POST /v1/{game_uid}/competitions/join`** (`{}`), **`POST /v1/{game_uid}/competitions/report_match`** (`X-Sapi-Key` + `X-Sapi-User`, `{ "match_id": "m_1001", "result": "win" }`), and **`POST /v1/{game_uid}/competitions/claim_season`** (`{ "season": 2916 }`).

## Economy and lives

### `economy` ([`routes/economy.json`](https://github.com/blazium-games/scripted_api_examples/blob/master/payloads/routes/economy.json))

- **`POST /v1/{game_uid}/economy/purchase`** (`{ "item_id": "bomb_pack", "quantity": 1 }`):
  ```json
  {
    "ok": true,
    "data": {
      "wallet": { "coins": 470, "gems": 10 },
      "owned": {},
      "boosters": { "bomb_pack": 3 },
      "equipped": {},
      "upgrades": {}
    },
    "server_time": 1764300000,
    "state_version": 2
  }
  ```
  Failure when short on currency (`402`): `{ "ok": false, "error": { "key": "insufficient_funds", "message": "not enough coins", "currency": "coins" } }`.
- **Internal-only `CALL:grant` / `CALL:debit` (`economy/grant`, `economy/debit`)** (invoked via `api.call`, never callable from clients):
  ```json
  // CALL economy/grant
  { "currency": "coins", "amount": 50 }
  // Response: { "ok": true, "data": { "wallet": { "coins": 540 } }, "server_time": 1764300000 }

  // CALL economy/debit
  { "currency": "coins", "amount": 50 }
  // Response: { "ok": true, "data": { "wallet": { "coins": 490 } }, "server_time": 1764300000 }
  ```

### `lives` ([`routes/lives.json`](https://github.com/blazium-games/scripted_api_examples/blob/master/payloads/routes/lives.json))

- **`POST /v1/{game_uid}/lives/spend`** (`{}`): returns `{ "lives": 4, "max": 5, "unlimited": false, "unlimited_left": 0, "next_in": 1800, "gifts_sent_today": 0 }`, or `402 no_lives` with `"next_in"`.
- **`POST /v1/{game_uid}/lives/gift_send`** (`{ "to": "friend_789" }`): returns `{ "sent": true, "gifts_sent_today": 1 }`, or `400 self_gift` / `403 plan_limit`.

## Lobby actions, RPCs, and callbacks

Scripted lobbies exchange JSON payloads across `on_action`, `_can_peer_chat`, `_lobby_rpc_register`, `sapi.call` / `sapi.read`, and `system.http_request`. Examples below come from [`payloads/`](https://github.com/blazium-games/scripted_lobby_examples/tree/master/payloads) in `blazium-games/scripted_lobby_examples`.

- **Client action & replies ([`callbacks/on_action_args_nested.json`](https://github.com/blazium-games/scripted_lobby_examples/blob/master/payloads/callbacks/on_action_args_nested.json), [`errors/action_replies.json`](https://github.com/blazium-games/scripted_lobby_examples/blob/master/payloads/errors/action_replies.json))**:
  Nested objects and arrays in `params` arrive in Luau as JSON strings (decode with `system.decode_json`). Actions run only while the lobby is `in_game` (except `start_game`):
  ```json
  // Client game_action payload -> args received by on_action(peer, lobby, args)
  {
    "action_id": "post_note",
    "params": {
      "text": "hi",
      "style": "{\"color\":\"red\"}",
      "tags": "[\"a\",\"b\"]"
    }
  }

  // Successful reply envelope sent back to the client
  { "v": 1, "id": "req-1", "ok": true, "err": null, "payload": { "started": true } }

  // Handled error reply when on_action returns { error = "...", code = "bad_text" }
  {
    "v": 1,
    "id": "req-2",
    "ok": false,
    "err": { "code": "bad_text", "msg": "text must be 1 to 140 characters", "is_logical_error": true },
    "payload": null
  }
  ```
- **Chat callback ([`callbacks/can_peer_chat_args.json`](https://github.com/blazium-games/scripted_lobby_examples/blob/master/payloads/callbacks/can_peer_chat_args.json))**:
  `meta` is capped at `2 KiB` and nested objects in `meta` arrive as `nil`:
  ```json
  { "channel": "all", "emote": 3, "loud": false, "style": null }
  ```
- **Lobby RPC ([`rpc/announce.json`](https://github.com/blazium-games/scripted_lobby_examples/blob/master/payloads/rpc/announce.json))**:
  ```json
  // Body passed from lobby.call(lobby_id, "announce", body)
  { "text": "Server restarting soon" }

  // Return value from handler
  { "delivered_to": 4 }

  // Handler error({ code = "bad_text", message = "text must be 1 to 200 characters" }) -> HTTP 400
  ```
- **Callback return from `sapi.call` / `sapi.read` ([`sapi/call_ok.json`](https://github.com/blazium-games/scripted_lobby_examples/blob/master/payloads/sapi/call_ok.json), [`sapi/call_platform_error.json`](https://github.com/blazium-games/scripted_lobby_examples/blob/master/payloads/sapi/call_platform_error.json), [`sapi/read_found.json`](https://github.com/blazium-games/scripted_lobby_examples/blob/master/payloads/sapi/read_found.json))**:
  ```json
  // sapi.call("daily", { action = "claim", user = id }, fn)
  {
    "ok": true,
    "status": 200,
    "body": {
      "ok": true,
      "data": { "claimable": false, "streak": 3, "reward": { "coins": 100 } },
      "server_time": 1767225600,
      "state_version": 7
    }
  }

  // Platform refusal before script execution (code copied to top-level code)
  {
    "ok": false,
    "status": 404,
    "code": "unknown_logic",
    "body": { "ok": false, "error": { "code": "unknown_logic", "message": "no logic named bonus" } }
  }

  // sapi.read("user", "daily:state", peer_id, fn)
  {
    "ok": true,
    "status": 200,
    "found": true,
    "value": { "v": 7, "last": 20454, "streak": 3, "best": 3 },
    "version": 7
  }
  ```
- **Callback return from `system.http_request` ([`sapi/http_ok.json`](https://github.com/blazium-games/scripted_lobby_examples/blob/master/payloads/sapi/http_ok.json), [`sapi/http_error.json`](https://github.com/blazium-games/scripted_lobby_examples/blob/master/payloads/sapi/http_error.json), [`sapi/http_refused.json`](https://github.com/blazium-games/scripted_lobby_examples/blob/master/payloads/sapi/http_refused.json))**:
  ```json
  // Success with JSON content-type
  { "ok": true, "status": 200, "body": "{\"tip\":\"Use the bridge.\"}", "headers": { "content-type": "application/json" }, "json": { "tip": "Use the bridge." } }

  // Transport or policy failure inside callback
  { "ok": false, "status": 0, "body": "", "headers": {}, "error": "timeout", "message": "the request took longer than the allowed time" }

  // Synchronous refusal raised via error(...) before sending (catch with pcall)
  { "ok": false, "code": "not_declared", "message": "host is not in the manifest allow list" }
  ```

See [`blazium-games/scripted_api_examples/payloads`](https://github.com/blazium-games/scripted_api_examples/tree/master/payloads) and [`blazium-games/scripted_lobby_examples/payloads`](https://github.com/blazium-games/scripted_lobby_examples/tree/master/payloads) for every JSON fixture and schema.
