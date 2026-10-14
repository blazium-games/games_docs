---
sidebar_position: 12
---

# Browser player

A game or application can play in the browser. Upload a web build for Godot, Blazium, or Unreal HTML5 (4.0 through 4.23), then open **Edit project → Web player**.

Pick one web build as the full game. You can pick a different web build as the demo. The player uses the same page rules as the store page: who can see the page, adult content, and whether anonymous play is allowed. Status (released, in development, and the rest) is a badge. It does not hide the player. Hiding the page hides the player.

## Who can play

| Page | Who is offered a player |
| --- | --- |
| Draft | You and accepted admins |
| Owner only | You |
| Link only | Anyone with the link, once the page can be bought or played |
| Public | Anyone, once the page can be bought or played |

| Viewer | Price | What plays |
| --- | --- | --- |
| You or an accepted admin | Any | Full build |
| Signed-in player | Free | Full build. They receive a free license first, and they keep the full build if you later add a price |
| Signed-out visitor | Free, and anonymous downloads are on | Full build, with no license |
| Signed-out visitor | Free, anonymous downloads off | No player. They need to sign in |
| Someone who already has the game | Paid | Full build |
| Everyone else | Paid | The demo, if you set one. Otherwise the buy button |

A paid embed always plays the demo. Adult listings and drafts cannot be embedded. Embed is off until you turn it on, and only a public page can be embedded.

## Upload

Send `os=web` with `web_engine` (`godot`, `blazium`, or `unreal`), `web_version`, and `web_variant`. Godot and Blazium packs contain one `.pck`. An Unreal cook includes `Utility.js`. The version has to be one the player host publishes. The zip download of a paid game still requires a purchase.

## Embed

The store card embed stays the store card. A separate snippet plays the game:

```html
<iframe src="https://GAME_UID.play.blazium.online/" width="960" height="540" sandbox="allow-scripts allow-pointer-lock"></iframe>
```

Replace `GAME_UID` with the game id. Add `allow="fullscreen"` when fullscreen is on.

## Discord activity

The Discord section is on the Web player tab only after the saved browser player is enabled. Turning the browser player off turns Discord hosting off. Hosting can be turned on only while the player is already on. Discord hosting does not follow the embed switch. Adult listings and hidden pages are not offered as a Discord launch, the same way an embed is refused.

Turn hosting on with the Application ID and the Public Key from that Discord application. Both are required. There is no bot token. Enable Activities, check the supported platforms, and leave Application URL Override off in production. For local proxy testing, use a tunnel you reset when you do not own the domain. Do not trust SDK user, guild, or channel fields as proof.

Copy the mappings into the Discord portal. Targets have no `https://`. The shortest prefix, `/`, is last.

| Prefix | Target |
| --- | --- |
| `/blazium/api` | `api.blazium.online` |
| `/blazium/login` | `login.blazium.online` |
| `/blazium/lobby` | `lobby.blazium.online`, only when this game's lobby is on as Relay or Scripted |
| `/` | `{uid}.play.blazium.online` |

There is no mapping for `stun.blazium.online` or `turn.blazium.online`. Leave the TURN switch off for this activity. A threaded web build is not served with COOP or COEP. A paid game plays the demo. A free game with anonymous play plays the full build. A Discord launch does not grant a license. A Discord player still has to sign in and own the game or hold a license before the lobby socket accepts them.

## Plays

Plays are counted beside downloads, not inside them. A play is recorded when someone is offered a session. Later requests for the same session are not new plays. Time is how long the tab was visible. Project Analytics and account Analytics show plays for the last 30 days: total, unique players, anonymous plays, seconds, median session, and full versus demo.
