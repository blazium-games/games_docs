---
title: Player sign-in without the launcher
sidebar_label: Sign-in without the launcher
sidebar_position: 8.1
description: Sign a player in from a web, mobile, console, or desktop game that runs outside the Blazium launcher. One session works for the Scripted API, lobbies, ICE, chat, and your servers.
---

# Player sign-in without the launcher

A game does not need the Blazium launcher to know who its player is. A web game, a phone game, a console game, or a desktop build you ship yourself can sign the player in to a Blazium account, create the account if there is none, and get one session that works for the Scripted API, lobbies, ICE, chat, and your own servers.

The player never types a password into your game. The game shows a link (or a QR code, or a short code for a console). The player opens it on blazium.games, signs in or signs up there, and the game is told it is done.

## How it works

1. The game starts a sign-in for its `game_uid`. `login.blazium.online` answers with a link, a short code, and a secret only the game knows.
2. The game shows the link as a button or QR code. On a console or TV it shows the code and `https://blazium.games/connect` instead. The player enters the code on a phone or computer.
3. The player signs in with GitHub, X, Discord, Steam, or email, or creates an account. If the account has a step left (the terms, a username, an authenticator), the game is told the sign-in is pending and the website finishes it.
4. The game receives the session. It never leaves `login.blazium.online` and `api.blazium.online` over HTTPS, and a different game cannot ask for it.

The sign-in page names the game the player is signing in to. Signing in this way does not sign the player in to the blazium.games website on that device. When the account still owes a step (the terms, a username, the authenticator choice), the browser holds a website session only long enough to finish it, and the "You are signed in" page ends that session again.

## Pick a client

| You ship | Use |
| --- | --- |
| Unity, any platform | `BlaziumPlayerSession` in the `com.blazium.games` package (2.2.0). C# only, no native library. |
| Unreal, any platform | `UBlaziumPlayerSession` in the `BlaziumGames` plugin (2.2.0). The HTTP module only, no native library. |
| Godot | The `blazium_games` addon. It keeps the session and renews it. |
| Native or any other engine on desktop | The SDK in standalone mode (`"mode": "standalone"` in `game.blaze`). |
| A browser game | The sign-in page opens from your play origin. See [Browser player](./web-player.md). |
| Anything else | The HTTP calls below. |

## Unity

```csharp
using Blazium.Games;
using UnityEngine;

public sealed class SignIn : MonoBehaviour
{
    public string GameUid = "550e8400-e29b-41d4-a716-446655440000";
    private BlaziumPlayerSession session;

    private void Start()
    {
        session = BlaziumUnitySignIn.Create(GameUid);
        session.Changed += OnChanged;
        StartCoroutine(Begin());
    }

    private System.Collections.IEnumerator Begin()
    {
        yield return session.Restore();                 // a returning player is signed in again
        if (!session.LoggedOn) yield return session.SignIn();
        if (session.LoggedOn) yield return session.KeepFresh(60f);
    }

    private void OnChanged()
    {
        if (session.State == BlaziumSignInState.Waiting)
            Debug.Log("Open " + session.LoginUrl + " or enter " + session.UserCode + " at " + session.VerificationUrl);
    }
}
```

`BlaziumUnitySignIn.CreateSapi(session)` returns a Scripted API client that uses the session. `session.Get("sapi" | "lobby" | "server", reply)` returns a short-lived token for the service you call. `session.GetChatAccess(reply)` returns the host, port, and a ten minute password for the Blazium IRC server.

The default store is `PlayerPrefs`, which is **not encrypted**. On a phone or console give `BlaziumPlayerSession` a store that uses the Keychain, the Keystore, or protected save data. The package sample `Player sign-in` shows the full flow.

## Unreal

```cpp
UBlaziumPlayerSession* Session = GetGameInstance()->GetSubsystem<UBlaziumPlayerSession>();
Session->Configure(TEXT("550e8400-e29b-41d4-a716-446655440000"));
Session->RestoreSaved();
if (!Session->IsSignedIn())
{
    Session->OnChanged.AddDynamic(this, &AMyActor::HandleSignIn);
    Session->StartSignIn();   // then show GetLoginUrl() and GetUserCode()
}
```

Blueprint exposes the state, the link, the code, the player's name, and Start, Cancel, and Sign out. A token and the session are never Blueprint values. `UBlaziumSapi` uses the session by itself once the player is signed in. The default store is a file under `Saved/Blazium`, which is **not encrypted**; set `LoadSavedSession`, `SaveSession`, and `ClearSavedSession` to protected storage on a phone or console. Add your console platform name to `PlatformAllowList` in `BlaziumGames.uplugin`.

## The SDK in standalone mode

Set `"mode": "standalone"` in `game.blaze`. `persist` keeps the session between runs, protected for the current OS user.

```json
{
  "game_uid": "550e8400-e29b-41d4-a716-446655440000",
  "mode": "standalone",
  "persist": true
}
```

`BlaziumAPI_InitFlat` succeeds with nobody signed in. Call `BlaziumAPI_StartLogin`, then poll `BlaziumAPI_LoginState` once a frame or twice a second. The states are `idle`, `starting`, `waiting` (show `login_url` and `user_code`), `pending` (the website has a step left, named by `gate`), `complete`, `failed`, and `cancelled`. `BlaziumAPI_RunCallbacks` keeps the session fresh. `BlaziumAPI_ExportSession` and `BlaziumAPI_RestoreSession` let your game keep the session in the platform's secure store. A launcher game (`"mode": "launcher"`, the default) behaves as it always did.

## The HTTP calls

Everything above is plain HTTPS, so any engine can do it.

| Call | Meaning |
| --- | --- |
| `POST https://login.blazium.online/api/v1/session` with `{"game_uid": "..."}` | Starts a sign-in. Returns `cid`, `secret`, `login_url`, `user_code`, `verification_url`, `expires_in`. |
| `GET https://login.blazium.online/api/v1/session/{cid}?wait=10&seen=waiting` with `Authorization: Bearer <secret>` | Long-polls. Returns `state`: `waiting`, `pending` (with `gate`), or `complete` (with `jwt`, `user_id`, `display_name`). A 404 means the sign-in ended. |
| `DELETE https://login.blazium.online/api/v1/session/{cid}` with the secret | Gives the sign-in back. |
| `POST https://api.blazium.online/api/v1/public/token/refresh` with the session | Renews the session. Do it in its last third. |
| `POST https://api.blazium.online/api/v1/private/games/{game_uid}/tokens` with `{"audience":"sapi"}` | A short-lived token for one service. Audiences: `sapi`, `lobby`, `server`. |
| `POST https://api.blazium.online/api/v1/private/logout` with the session | Ends the session. |

Renewing the session ends the scoped tokens made with the old one. Ask again after a renewal. A client that caches tokens must drop the cache when the session changes; the Unity and Unreal clients do.

## One session, every service

| Service | What the game sends |
| --- | --- |
| Scripted API (`sapi.blazium.online`) | The `sapi` token. See [Scripted API](./scripted-api.md#tokens). |
| Lobbies and ICE | The `lobby` token on the lobby routes. They return the ticket slobby and ICE use. |
| Chat (Blazium IRC) | `POST /private/irc/token` with the session returns a ten minute password. It needs a username on the account. |
| Your dedicated server or backend | The `server` token. The server calls `POST /api/v1/server/verify-player` with its server key (`X-Server-Key`). Each token works once. |

A player who signed in with Steam and has no Blazium account gets the `sapi` and `lobby` tokens through the Steam session, but has no chat, because chat belongs to an account. See [Steam sign-in](./steam-auth.md).

## What you set

On the game's sign-in settings (the developer MCP tool `set_sign_in_providers`, or the website):

- **Providers**: `github`, `x`, `discord`, `steam`, and `email`. Email and password is off until you turn it on.
- **Web origins**: the `https` origins a web build of your game is served from. A page on any other origin cannot start a sign-in.
- **Return URIs**: where the website may send a player back to after sign-in, such as `https://play.example.com/` or your app's own link. They match exactly.

`get_sign_in_funnel` shows how many sign-ins were opened, needed a step, and finished, per day and per method. It holds counts only.

## Limits and honest notes

- The sign-in pages are in English.
- A device code works once, for the game that started it, and it ends in thirty minutes.
- Sign-in, email codes, and sign-up are rate limited per address and per IP. A shared address (a school, a show floor) can hit the per-IP limit; the limits are set on the service.
- A suspended account gets no session and no tokens.
- The Linux, macOS, and console transports of the native SDK are built on their platform's HTTP stack. Check your platform before you ship; only Windows is exercised by the SDK's own tests.
