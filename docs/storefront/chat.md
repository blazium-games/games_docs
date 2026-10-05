---
title: Game chat
sidebar_position: 7.5
description: Friend messages and each game's chat run on irc.blazium.online. The launcher uses port 6697. The website Chat tab uses the websocket on port 8000.
---

# Game chat

Friend messages and each game's chat are IRC on `irc.blazium.online`.

The launcher and other player clients connect to port **6697**. The Chat tab on a project's edit page connects to the websocket on port **8000**. A problem on 8000 does not stop people who are already on 6697 from talking.

Guests are off unless the project turns them on. A license lets a player speak. The project owner and accepted admins can speak as operators.

The owner or an accepted admin can ban someone from the channel, or mute them for a set time. A mute can still read. The owner, an accepted admin, and the platform account `blazium` cannot be banned or muted.

Staff commands in the channel (part, drop voice, notices) go through that `blazium` account. Bans and mutes that are already saved still apply if that account is briefly disconnected.
