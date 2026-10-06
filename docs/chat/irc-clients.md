---
title: IRC clients
sidebar_position: 2
description: Use HexChat, WeeChat, irssi, or any IRC client with Blazium Games chat. Create a chat token, set up SASL PLAIN, and sign in without SASL with GAMEAUTH.
---

# IRC clients

Any IRC client that does TLS and SASL PLAIN works: HexChat, WeeChat, irssi, Textual, KVIrc, and others. You sign in with your Blazium Games username and a **chat token**.

## Get a chat token

1. Open [Settings > Chat](https://blazium.games/settings/chat).
2. Select **Create token**.
3. Copy the token (it starts with `bzc_`). It is shown once and can't be shown again.

Settings > Chat also shows the start of your current token, when you made it, and when it was last used. It never shows the whole token again.

| Action | What happens |
|---|---|
| **Regenerate token** | Makes a new token. Tick **Disconnect clients using my current token** first. The old token stops working and every client signed in with it is disconnected right away |
| **Revoke token** | Removes the token and disconnects every client signed in with it. Your account keeps working on the website and in the launcher |

You can create, regenerate, or revoke up to 10 times an hour. An AI agent on the [player MCP server](../mcp/player.md#chat) can do the same, but only when you ask, and the token is shown once in that answer.

**Keep it secret.** Anyone with your token can chat as you. If it leaks, or you lose it, regenerate it.

## Client settings

| Setting | Value |
|---|---|
| Server | `irc.blazium.online` |
| Port | `6697`, TLS on |
| Sign-in | SASL PLAIN |
| Username / nick | Your Blazium Games username |
| Password | Your chat token |

Your nick is always your username. The network sets it when you sign in, and `/nick` to anything else is refused with "Your nickname is your Blazium username".

## Set up a client

**irssi**

```text
/network add -sasl_username YOUR_USERNAME -sasl_password YOUR_TOKEN -sasl_mechanism PLAIN blazium
/server add -tls -network blazium irc.blazium.online 6697
/connect blazium
```

**WeeChat**

```text
/server add blazium irc.blazium.online/6697 -tls
/set irc.server.blazium.sasl_mechanism plain
/set irc.server.blazium.sasl_username YOUR_USERNAME
/set irc.server.blazium.sasl_password YOUR_TOKEN
/connect blazium
```

**HexChat:** add a network with server `irc.blazium.online/6697`, tick **Use SSL for all the servers on this network**, set **Login method** to **SASL (username + password)**, and enter your username and token.

**Textual, KVIrc, and others:** turn on TLS, pick SASL PLAIN (sometimes called "SASL username and password"), and use the settings above.

After you connect, join a game's chat with `/quote GAMEJOIN <game uid>`. The [Commands](./commands.md) page lists the rest.

## Clients without SASL

Bots and small clients that can't do SASL can send `GAMEAUTH <chat token>` as their first line, before `NICK` and `USER`:

```text
GAMEAUTH bzc_yourtoken
NICK anything
USER bot 0 * :My bot
```

A good login answers `1800 <username> :You are now logged in as <username>`, and the network sets your nick to your username. A wrong token answers `1841` (or `1846` if it isn't shaped like a token). After 3 failed tries in 30 seconds you get `1852` and have to wait before trying again. A connection that never signs in is not let on to the network.

## Making an account over IRC

Accounts are made and verified on the website, not over IRC. `REGISTER` and `VERIFY` only answer with a pointer to [blazium.games](https://blazium.games) and how to sign in.
