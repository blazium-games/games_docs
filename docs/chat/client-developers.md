---
title: For client developers
sidebar_position: 4
description: Build a chat client or bot for Blazium Games. SASL PLAIN and GAMEAUTH sign-in, the websocket, ISUPPORT, the blazium.games capabilities and message tags, game invites, and every numeric.
---

# For client developers

Blazium Games chat is standard IRC (UnrealIRCd 6) with a few additions for games. Anything a normal IRC client does keeps working; the additions are opt-in.

## Connecting

| Transport | Address |
|---|---|
| TLS | `irc.blazium.online:6697` |
| Websocket (browsers) | `wss://irc.blazium.online:8000`, one IRC line per text frame |

Every connection must sign in before it is let on to the network.

## Signing in

The password is one of two tokens:

- **A chat token** (`bzc_...`) the player made in [Settings > Chat](https://blazium.games/settings/chat). Long-lived; see [IRC clients](./irc-clients.md#get-a-chat-token).
- **A short-lived sign-in token** that works for 10 minutes. BlaziumLauncher and the website get one for the signed-in player. An AI agent gets one from the player MCP tool [`get_chat_connection`](../mcp/player.md#chat), which also returns the host, port, and websocket address.

**SASL PLAIN** (preferred):

```text
CAP LS 302
CAP REQ :sasl blazium.games/tags blazium.games/commands blazium.games/membership
NICK username
USER username 0 * :username
AUTHENTICATE PLAIN
AUTHENTICATE <base64 of "\0username\0token">
CAP END
```

Send `CAP END` after `903`. `904` means the token was refused.

**GAMEAUTH**, for clients without SASL: send `GAMEAUTH <token>` before `NICK` and `USER`. The answer is `1800 <username> :You are now logged in as <username>`, or `1841`/`1846` on failure. Three failures in 30 seconds give `1852` until the window passes. A second login on the same connection gets `1843`.

After sign-in the nick is forced to the account's username, and changing it is refused. Only `PLAIN` is offered as a SASL mechanism.

## ISUPPORT

After registration, `005` includes:

| Token | Meaning |
|---|---|
| `GAMESERVICES=2` | The game chat commands and numerics on this page are available. Version 2 added `GAMEAUTH`, spectating, `GAMES`, `LFGWHO`, `LFGMETA`, the capabilities, and the tags |
| `GAMEVENDOR=blazium.games` | The vendor prefix used by the capabilities and tags |

## Capabilities

| Capability | What it adds |
|---|---|
| `blazium.games/tags` | Messages in game channels carry the `blazium.games/game` and `blazium.games/role` tags |
| `blazium.games/commands` | Turns on `GAMES` |
| `blazium.games/membership` | With `blazium.games/tags`, the server sends you a `TAGMSG` to the channel when you join a game chat and whenever your role in it changes |

## Message tags

| Tag | Value |
|---|---|
| `blazium.games/game` | The game's uid |
| `blazium.games/role` | The sender's role in that game's chat: `owner` (owner and accepted admins), `chat` (voiced), or `spectator` (no voice) |

Example, with `blazium.games/tags`:

```text
@blazium.games/game=550e8400-e29b-41d4-a716-446655440000;blazium.games/role=chat;msgid=...;time=... :alice!alice@... PRIVMSG #g0123456789abcdef :gg
```

The membership `TAGMSG` carries your own role and the game uid:

```text
@blazium.games/role=chat;blazium.games/game=550e8400-e29b-41d4-a716-446655440000 :irc1.blazium.online TAGMSG #g0123456789abcdef
```

Game channels are mode `+A <uid>`, so a client can map a channel back to its game without the tags.

## Game invites

BlaziumLauncher invites a friend to a game with a private message whose text is `PLAY:<game uid>`. The launcher shows a play card instead of the text. Other clients can send and recognise the same text.

## Commands

| Command | Notes |
|---|---|
| `GAMEJOIN <uid>` / `GAMEPART <uid>` | The only way into a game channel. `JOIN` on a game channel fails with `473` "Join game chat with GAMEJOIN" |
| `LFGSUB <uid>` / `LFGUNSUB <uid>` | Spectate (no voice). Up to 10 at once |
| `GAMES [uid]` | Needs `blazium.games/commands` |
| `LFGWHO <uid>` | Members of a game chat you're in |
| `LFGMETA <uid>` | Name, channel, and counts |
| `REGISTER`, `VERIFY` | Answer with `1822` pointers to the website; accounts aren't made over IRC |

User-facing descriptions are on the [Commands](./commands.md) page.

## Numerics

Every numeric is sent as `:<server> <numeric> <your nick> <parameters>`.

| Numeric | Parameters | When |
|---|---|---|
| `1800` | `<username> :You are now logged in as <username>` | GAMEAUTH succeeded |
| `1801` | `<channel> <uid> <role> :Joined game chat` | `GAMEJOIN` |
| `1802` | `<channel> <uid> :Spectating game chat` | `LFGSUB` |
| `1803` | `<uid> :Left game chat` | `GAMEPART`, `LFGUNSUB` |
| `1804` | `<uid> <channel> <users> :<name>` | One per game in `GAMES` |
| `1805` | `<count> :End of GAMES` | End of `GAMES` |
| `1810` | `<uid> <nick> <role> :<account>` | One per member in `LFGWHO` |
| `1811` | `<uid> <count> :End of LFGWHO` | End of `LFGWHO` |
| `1812` | `<uid> <key> :<value>` | `LFGMETA` keys: `name`, `channel`, `users`, `chat`, `spectators`, `listed` (`yes`/`no`), `bound` (`yes`/`no`) |
| `1813` | `<uid> :End of LFGMETA` | End of `LFGMETA` |
| `1822` | `REGISTER :<text>` or `VERIFY :<text>` | `REGISTER` or `VERIFY` |
| `1830` | `<nick> <uid> <role> :is in game chat` | In your own `WHOIS` |
| `1841` | `:Authentication failed` | The token was refused |
| `1842` | `<uid> :No such game chat` | `GAMES <uid>`, `LFGWHO`, `LFGMETA` |
| `1843` | `[<uid>] :...` | Already logged in, or already in that game chat |
| `1844` | `<max> :Too many spectated games` | `LFGSUB` over the limit |
| `1845` | `<uid> :Invalid game id` | Not a uid |
| `1846` | `:That chat token is not valid` | GAMEAUTH with text that isn't a token |
| `1847` | `[<uid>] :Game chat is unavailable right now` | The game service couldn't be reached |
| `1848` | `<uid> :You are not in that game chat` | `LFGWHO`, `LFGUNSUB` |
| `1850` | `<command> <capability> :Capability required for this command` | `GAMES` without `blazium.games/commands` |
| `1851` | `<channel> :Game chat is full on this server` | The game's channel is full on this server |
| `1852` | `:<text>` | Too many login attempts, or a login is already in progress |
| `1860` | `<channel> <server> :Try connecting to this server` | Sent after `1851` with a server that has room |

Numerics `1818`-`1821` are for network operators.

## Notices to expect

| Notice | Meaning |
|---|---|
| "Authenticate before joining game chat" | A game command before sign-in |
| "You cannot join that game chat" | No license with guests off, or banned |
| "You need a license to speak in this game chat" | A message from someone without voice (`404`) |
| "This game chat has closed" | The game's chat was taken down; the channel no longer belongs to a game |
| "License changed" (as a part reason) | Access was re-checked and you're no longer allowed in |

## Good behaviour

- Reconnect with backoff. A rate-limited client (`1852`) should wait at least 30 seconds.
- Don't store short-lived tokens; ask for a new one each time you connect.
- Never log or display a chat token after the player has copied it.
