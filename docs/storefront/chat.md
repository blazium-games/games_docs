---
title: Game chat
sidebar_position: 7.5
description: Friend messages and each game's chat run on IRC at irc.blazium.online. Use the website, the launcher, or any IRC client with a chat token from Settings > Chat.
---

# Game chat

Friend messages and each game's chat are IRC on `irc.blazium.online`. Chat follows the [Chat Rules](../legal/chat-rules.md): anything legal is allowed, nothing illegal, and never any harm to children. Chat is not logged.

## Ways to connect

- **The website.** The Chat tab on a project's edit page signs you in for you, over the websocket on port **8000**.
- **The launcher** and other player clients connect to port **6697** with TLS.
- **Your own IRC client** (HexChat, WeeChat, irssi, Textual, and others), with a chat token.

A problem on 8000 doesn't stop people who are already on 6697 from talking.

## Use your own IRC client

1. Open [Settings > Chat](https://blazium.games/settings/chat) and select **Create token**.
2. Copy the token. It is shown once and can't be shown again.
3. Set up your client:

| Setting | Value |
|---|---|
| Server | `irc.blazium.online` |
| Port | `6697`, TLS on |
| Sign-in | SASL PLAIN |
| Username / nick | Your Blazium Games username |
| Password | Your chat token (starts with `bzc_`) |

Your nick is always your username; the network sets it for you after sign-in.

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

### Join a game's channel

Game channels have names like `#g0123456789abcdef`. Join one by the game's uid:

```text
/quote GAMEJOIN 550e8400-e29b-41d4-a716-446655440000
```

`GAMEPART <game uid>` leaves it. Type `/RULES` to read the rules.

### Keep your token secret

Anyone with your token can chat as you. If it leaks, or you lose it, go to Settings > Chat and **Regenerate token**. The old token stops working and every client signed in with it is disconnected right away. **Revoke token** does the same without making a new one.

An AI agent connected to the [player MCP server](../mcp/player.md) can also check your token status and, when you ask it to, create or revoke a token.

## Who can talk

Guests are off unless the project turns them on. A license lets a player speak. Guests can read but stay silent until they own the game. The project owner and accepted admins speak as operators.

## Moderation

- The owner or an accepted admin can ban someone from the game's channel, or mute them for up to 30 days. A muted player can still read. The owner, accepted admins, and the platform account `blazium` can't be banned or muted.
- Blazium Games can lock an account out of all chat, for a set time or until lifted, or suspend the account. A lock disconnects the account right away.
- Bans, mutes, and locks are saved, so they still apply after a reconnect.

## What chat keeps

Messages aren't logged. Each channel keeps its last 50 lines for up to a day in the servers' memory so people who join can catch up. The [Chat Rules](../legal/chat-rules.md#5-what-we-keep) list everything else that is kept.

## Status

The [status page](https://status.blazium.games) shows **Game chat** (ports 6697 and 8000) and **Chat commands**, which covers live moderation and disconnecting a regenerated token.
