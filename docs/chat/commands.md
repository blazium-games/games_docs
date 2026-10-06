---
title: Commands
sidebar_position: 3
description: Join, leave, and spectate game chat by game uid, list games with chat, see who is in a channel, and what every reply and error means.
---

# Commands

Game chat commands take the game's uid, the long id in its store page address, for example `550e8400-e29b-41d4-a716-446655440000`. In most IRC clients, type them with `/quote` in front:

```text
/quote GAMEJOIN 550e8400-e29b-41d4-a716-446655440000
```

You have to be signed in. Before that, the commands answer "Authenticate before joining game chat".

## Join and leave

| Command | What it does | Reply |
|---|---|---|
| `GAMEJOIN <game uid>` | Joins the game's chat. Owners and admins join as operators, licensed players with voice, and guests (when allowed) without voice | `1801 <channel> <uid> <role> :Joined game chat` |
| `GAMEPART <game uid>` | Leaves it | `1803 <uid> :Left game chat` |

`GAMEJOIN` is the only way into a game channel. `/join #g...` is refused with "Join game chat with GAMEJOIN". If you can't join, you get the notice "You cannot join that game chat": you don't own the game and guests are off, or you're banned from it.

## Spectate a game

| Command | What it does | Reply |
|---|---|---|
| `LFGSUB <game uid>` | Joins the game's chat to read only, with no voice, even if you own the game | `1802 <channel> <uid> :Spectating game chat` |
| `LFGUNSUB <game uid>` | Stops spectating and leaves | `1803 <uid> :Left game chat` |

You can spectate up to 10 games at once. You can only spectate a game you could join.

## Find out about games

| Command | What it does | Reply |
|---|---|---|
| `GAMES` | Lists every game that has a chat channel | One `1804 <uid> <channel> <users> :<name>` line per game, then `1805 <count> :End of GAMES` |
| `GAMES <game uid>` | The same line for one game | `1804`, then `1805 1 :End of GAMES` |
| `LFGWHO <game uid>` | Who is in a game chat you're in | One `1810 <uid> <nick> <role> :<account>` line per person, then `1811 <uid> <count> :End of LFGWHO` |
| `LFGMETA <game uid>` | What the server knows about a game chat | `1812 <uid> <key> :<value>` for `name`, `channel`, `users`, `chat`, `spectators`, `listed`, and `bound`, then `1813 <uid> :End of LFGMETA` |
| `WHOIS <your nick>` | Your own WHOIS lists the game chats you're in | `1830 <nick> <uid> <role> :is in game chat` per game |

`GAMES` needs the `blazium.games/commands` capability. Ask for it with `/quote CAP REQ blazium.games/commands`, or see [For client developers](./client-developers.md#capabilities). A game's name shows in `GAMES` only while its store page is public; otherwise the uid is shown in its place.

Roles in replies are `owner` (operators: the owner and accepted admins), `chat` (voiced), and `spectator` (no voice: guests and spectators).

## Everyday IRC

Normal IRC works as usual: private messages to a friend's username, `/me`, `/names`, `/whois`, `/away`, and so on. Recent channel history is shown when you join, so you can catch up.

If a game's chat is taken down, people in its channel see "This game chat has closed".

## Replies and errors

Every reply is a numeric in the 1800 range sent to your nick.

| Numeric | Meaning | What to do |
|---|---|---|
| `1841` | Authentication failed | The token is wrong, expired, revoked, or the account is locked out of chat. Check it, or regenerate it in Settings > Chat |
| `1842` | No such game chat | That game has no chat channel right now: nobody has joined it yet, or its chat was closed. `GAMEJOIN` opens it if you're allowed in |
| `1843` | Already logged in, or already in that game chat | Nothing to do |
| `1844` | Too many spectated games | Stop spectating one with `LFGUNSUB` first (the limit is 10) |
| `1845` | Invalid game id | Use the full uid from the game's store page |
| `1846` | That chat token is not valid | The text you sent isn't shaped like a token. Copy it again |
| `1847` | Game chat (or the game list) is unavailable right now | Try again in a minute. Check the [status page](https://status.blazium.games) |
| `1848` | You are not in that game chat | Join it first |
| `1850` | Capability required for this command | Request the capability named in the reply |
| `1851` | Game chat is full on this server | Reconnect; a `1860` line names a server to try |
| `1852` | Too many login attempts, or a login is already in progress | Wait about 30 seconds and try again |

The full list, with every parameter, is in [For client developers](./client-developers.md#numerics).
