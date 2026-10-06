---
title: Chat for publishers
sidebar_position: 5
description: Your game's chat channel. Turn guests on or off, who your operators are, and how to ban or mute players from the website or with the developer MCP tools.
---

# Chat for publishers

Every game, app, mod, or asset on Blazium Games can have a chat channel. You don't have to set anything up.

## Your channel

- The channel is created the first time someone joins it. Its name is `#g` followed by 16 characters derived from your project's uid, and it never changes.
- Players reach it from BlaziumLauncher, their own IRC client with `GAMEJOIN <your project's uid>`, or a client that lists games with `GAMES`.
- Your project's name shows in game lists only while its store page is public.
- The **Chat** tab on your project's edit page shows the channel name, and **Connect** signs you in to talk there from the browser.

## Who can talk

| Who | Role |
|---|---|
| You and your accepted [team admins](../storefront/team-and-keys.md#admins) | Operators. You can always talk and can't be banned or muted |
| Players with a license | Voiced. They can talk |
| Guests (no license) | Only when you allow them. They can read, and talk once they own the game |
| The platform account `blazium` | Sits in the channel to carry out bans and mutes. It can't be banned or muted |

Licenses are checked again while players are in the channel, so a player who buys the game gets a voice, and one who loses the license is removed.

## Guests

Guests are off by default. On the **Chat** tab, tick **Let people without a license join** and select **Save**. Turning guests off removes guests who are in the channel at their next access check.

## Bans and mutes

On the **Chat** tab, type a username and pick an action:

| Action | Effect |
|---|---|
| **Ban** | Removes the player from the channel now and keeps them out until you unban them |
| **Unban** | Lifts a ban |
| **Suspend** | Mutes the player for the number of minutes you enter (1 to 43,200, which is 30 days). They can still read |
| **Lift suspension** | Ends a mute early |

**Who cannot talk** lists everyone banned or muted, with when each mute ends. Bans and mutes are saved and still apply after the player reconnects.

The same actions are on the [developer MCP server](../mcp/reference.md#game-chat): `get_game_chat`, `set_chat_guests`, `ban_chat_user`, `unban_chat_user`, `suspend_chat_user`, and `unsuspend_chat_user`.

## What Blazium Games does

Chat follows the [Chat Rules](../legal/chat-rules.md). Blazium Games can lock an account out of all chat or suspend it, on any channel. Reports go to [support@blazium.games](mailto:support@blazium.games); see [Something in chat](../storefront/report.md#something-in-chat).

If your project's chat is taken down, people in the channel see "This game chat has closed".
