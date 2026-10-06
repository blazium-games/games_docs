---
title: Chat
sidebar_position: 1
description: Friend messages and a chat channel for every game, on IRC at irc.blazium.online. Who can talk, how to get in, spectating, moderation, and what chat keeps.
---

# Chat

Blazium Games chat is IRC on `irc.blazium.online`. It carries two things:

- **Friend messages.** Private messages between accounts. Your nick is always your username, so a message to a friend goes to their username.
- **Game chat.** Every game has its own channel, named like `#g0123456789abcdef`. You get into it with the game's uid, not by typing the channel name.

Chat follows the [Chat Rules](../legal/chat-rules.md): anything legal is allowed, nothing illegal, and never any harm to children. Chat is not logged.

## Ways in

| Where | How it signs you in | Port |
|---|---|---|
| The website | The **Chat** tab on a project's edit page signs you in with a short-lived token | `8000` (websocket, TLS) |
| [BlaziumLauncher](../storefront/desktop-app.md) | Signs you in for you. Chat opens one tab per friend and per game, and asks before it sends | `6697` (TLS) |
| Your own IRC client | Your username and a chat token from [Settings > Chat](https://blazium.games/settings/chat). See [IRC clients](./irc-clients.md) | `6697` (TLS) |
| An AI agent | The [player MCP server](../mcp/player.md#chat) can sign the agent in as you for 10 minutes | `6697` or `8000` |

Every connection signs in to a Blazium Games account. There are no anonymous users, and nobody can take your nick.

## Who can talk in a game's chat

| Who | In the channel | Can talk |
|---|---|---|
| The project owner and accepted admins | Operators (`@`) | Yes |
| Players with a license | Voiced (`+`) | Yes |
| Guests (no license), only when the project allows guests | Joined without voice | No, until they own the game |
| Anyone spectating | Joined without voice | No |

Guests are off unless the project turns them on. Licenses are checked again while you're in the channel, so buying the game gives you a voice, and losing the license takes it away.

## Spectating

Spectating lets you read a game's chat without talking, even if you own the game. You can spectate up to 10 games at once. The access rules are the same as joining: you can only spectate a game you could join. See [Commands](./commands.md#spectate-a-game).

## Moderation

- The project owner and accepted admins can ban someone from the game's channel, or mute them for up to 30 days. A muted player can still read. The owner, accepted admins, and the platform account `blazium` can't be banned or muted. See [Chat for publishers](./for-publishers.md).
- Blazium Games can lock an account out of all chat, for a set time or until lifted, or suspend the account. A lock disconnects the account right away and refuses new sign-ins.
- Bans, mutes, and locks are saved, so they still apply after a reconnect.

## What chat keeps

Messages aren't logged. Each channel keeps its last 50 lines for up to a day in the servers' memory, so people who join can catch up. The [Chat Rules](../legal/chat-rules.md#5-what-we-keep) list everything else that is kept.

## Status

The [status page](https://status.blazium.games) shows two chat components:

- **Game chat**: the chat servers on ports 6697 and 8000. A problem on 8000 doesn't stop people who are already on 6697 from talking.
- **Chat commands**: live moderation and disconnecting a regenerated token. When only this is down, people can still talk. Saved bans still keep people out, and a regenerated or revoked token is still cut off within about a minute. Removing or muting someone who is already in a channel waits until it's back.

Chat updates are rolled out without disconnecting anyone. You may see a short notice from the network before and after.

## In this section

- [IRC clients](./irc-clients.md): chat tokens and setting up HexChat, WeeChat, irssi, and others.
- [Commands](./commands.md): joining, spectating, listing games, and every reply.
- [For client developers](./client-developers.md): sign-in, capabilities, message tags, and numerics.
- [Chat for publishers](./for-publishers.md): guests, admins, bans, and mutes for your game.
- [Troubleshooting](./troubleshooting.md): can't sign in, can't talk, and other problems.
