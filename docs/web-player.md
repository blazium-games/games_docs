---
sidebar_position: 12
---

# Browser player

A game or application can play in the browser. Upload a web build, then open **Edit project → Web player**. The player hosts Godot and Blazium single-pack shells, Godot and Blazium HTML5, Unreal 4.23, Unreal 5.8 and 5.9 WebGPU, Unity WebGL, and a browser pack for BabylonJS, Cocos, Construct, Defold, Flutter, melonJS, Phaser, PixiJS, PlayCanvas, React, three.js, Kaplay, p5, GDevelop, GameMaker, or a custom page.

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

An embed plays the build marked embed-supported. That build cannot be priced, and the launch does not grant a license. Adult listings and drafts cannot be embedded. Embed is off until you turn it on, and only a public page can be embedded. Turning on **Enable embedded game** refuses a listing price and every build price.

## Upload

Send `os=web` with `web_engine`, `web_version`, and `web_variant`. Add `web_pack` (`browser`, `tiktok`, `douyin`, or `wechat`) and `export_targets` when the pack is checked for another host. A Godot or Blazium `web_nothreads` pack is one `.pck`. An Unreal 4.23 cook includes `Utility.js` and stays on the generated page. Unreal 5.8 and 5.9 WebGPU packs bring their own `index.html`, one `.js`, and one `.wasm`, and they need cross-origin isolation outside Discord, Telegram, and a Playables preview. A Unity WebGL folder needs `index.html`, a `.loader.js`, a `.framework.js` or `.js`, a `.data`, and a `.wasm`. A mini-game pack needs `game.js`, `game.json`, and `project.config.json`, and it is downloaded for TikTok ttmg, Douyin DevTools, or WeChat DevTools. The version has to be one the player host publishes. Unity WebGL and the generic `web` rows accept the publisher's version. The zip download of a paid game still requires a purchase.

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

There is no mapping for `stun.blazium.online` or `turn.blazium.online`. Leave the TURN switch off for this activity. A threaded web build is not served with COOP or COEP. Assign the build that Discord launches. That build cannot be priced, and the launch does not grant a license. A paid game with no assigned build plays its demo. A free game with anonymous play plays the full build. A Discord player still has to sign in and own the game or hold a license before the lobby socket accepts them.

## Telegram Mini App

Telegram is a launch of the same browser pack, not a second profile. Turn it on with the numeric bot id and paste `https://{uid}.play.blazium.online/` into the bot menu or an inline button. No bot token is stored. The page loads `https://telegram.org/js/telegram-web-app.js`, then calls `Telegram.WebApp.ready()` and `Telegram.WebApp.expand()`. games_service checks `initData` with Telegram's published Ed25519 key and the bot id, and rejects `auth_date` older than one hour. That check is not a Blazium sign-in. The play cookie is `SameSite=None` and `Partitioned`. The launch plays the build assigned to Telegram. That build cannot be priced, and the launch does not charge or grant a license. `connect-src` adds `api.blazium.online`, `login.blazium.online`, and `lobby.blazium.online`. There is no URL-mapping proxy. Threaded and WebGPU packs are refused. Adult listings and hidden pages are not offered.

## Other hosts

Playables, Devvit, itch, Newgrounds, Yandex, CrazyGames, Poki, Meta Instant Games, and GameDistribution are checks on a browser pack. YouTube and those portals host the zip. Blazium does not submit it and does not call their ad or purchase APIs. A Playables pack cannot use `.br` or `.gz`, a threaded build, or WebGPU. Devvit files cannot contain an absolute URL. Meta accepts Instant Games SDK 8.0 for Facebook and Messenger. Instagram is not a launch. Facebook Web Games ended. A TikTok, Douyin, or WeChat pack is not played in the browser. The platform DevTool remains the release check.

Each build can have its own price. A demo cannot be priced. A web demo is the browser demo. Any other demo is the downloadable demo. A build marked embeddable, or assigned to a platform, cannot be priced.

## Plays

Plays are counted beside downloads, not inside them. A play is recorded when someone is offered a session. Later requests for the same session are not new plays. Time is how long the tab was visible. Project Analytics and account Analytics show plays for the last 30 days: total, unique players, anonymous plays, seconds, median session, and full versus demo.
