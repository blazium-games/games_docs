---
title: Troubleshooting
sidebar_position: 6
description: Fix chat problems. Can't sign in, can't join a game's chat, can't talk, the channel is full, chat looks down, or your chat token leaked.
---

# Troubleshooting

## I can't sign in

| What you see | Fix |
|---|---|
| `904` or "SASL authentication failed" | Check the username is your Blazium Games username and the password is your whole chat token. Regenerate it in [Settings > Chat](https://blazium.games/settings/chat) if you're not sure |
| `1841` Authentication failed | Same as above. A revoked or replaced token stops working right away |
| `1852` Too many login attempts | Wait about 30 seconds, then try once with the right token |
| The client hangs after connecting | Turn on TLS for port 6697 and SASL PLAIN. A connection that never signs in is not let on to the network |
| "Set a username before chatting" | Chat needs a username. Set one in your profile first |
| "Your account can't use chat right now" in Settings > Chat | Your account is locked out of chat. Email [support@blazium.games](mailto:support@blazium.games) if you think that's a mistake |

The website and BlaziumLauncher sign you in for you. If they fail, sign out and back in, then try again.

## I can't join a game's chat

- `/join #g...` doesn't work for game channels. Use `/quote GAMEJOIN <game uid>`.
- "You cannot join that game chat" means you don't own the game and the project doesn't allow guests, or you're banned from that channel.
- `1845` means the uid is wrong. Copy the full uid from the game's store page address.
- `1847` means chat couldn't check your access just then. Try again in a minute.

## I'm in the channel but can't talk

"You need a license to speak in this game chat" means one of:

- You don't own the game. Guests can read but not talk; buy the game and you get a voice.
- You joined with `LFGSUB` to spectate. Leave with `LFGUNSUB` and join with `GAMEJOIN` instead.
- The owner or an admin muted you. Mutes last up to 30 days and you can still read.

## "Game chat is full on this server"

The game's channel is busy on the server you landed on. Reconnect to `irc.blazium.online`; the `1860` line names a server with room.

## Chat or commands look down

Check the [status page](https://status.blazium.games). If only **Chat commands** is down, you can still talk; moderation and token disconnects catch up when it's back. If **Game chat** is down on port 8000 only, the website Chat tab is affected, but launcher and IRC clients on 6697 keep working.

During an update you may see a notice that chat maintenance is starting. You stay connected.

## My chat token leaked

Go to [Settings > Chat](https://blazium.games/settings/chat), tick **Disconnect clients using my current token**, and select **Regenerate token**. Everyone using the old token is disconnected right away. **Revoke token** does the same without making a new one.

## Still stuck

See [Get help](../storefront/get-help.md). To report someone breaking the [Chat Rules](../legal/chat-rules.md), see [Something in chat](../storefront/report.md#something-in-chat).
