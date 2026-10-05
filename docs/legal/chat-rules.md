---
title: Chat Rules
sidebar_position: 5.7
---

:::note
Canonical version: https://blazium.games/chat-rules
:::

# Chat Rules

**Effective Date: October 9, 2026**

These rules cover Blazium Games chat: the IRC network at `irc.blazium.online`, the chat on the website, and chat inside games and the Blazium Games app. They are part of the [Terms of Service](https://blazium.games/terms-of-service). If something isn't covered here, the Terms apply.

## 1. The short version

- **Anything legal is allowed.** Talk about what you want, how you want. A game's developers can set stricter rules for their own game's channel.
- **Nothing illegal is allowed.** No illegal content, links, trades, threats, or plans.
- **Never children.** Grooming, sexual content involving minors, and any predatory contact with a child are never allowed.
- **Chat is not logged.** We don't keep transcripts of what you say. Section 5 explains the few things we do keep.

## 2. What is not allowed

- **Anything illegal** under United States law, including fraud, selling stolen accounts or payment details, distributing malware, and threats of violence.
- **Harm to children.** Grooming, sexual content involving minors, asking a minor for images, personal details, or to move to another app, and any other predatory contact with a child. Child sexual abuse material is removed and reported as United States law requires.
- **Doxxing.** Posting someone's private information, such as a home address, phone number, or real name they haven't shared, without their consent.
- **Sharing access.** Posting or trading someone else's chat token, password, or account.
- **Disrupting the network.** Flooding, running bots the channel didn't approve, evading a ban, or attacking other users or the servers. Each IP address can have up to 3 connections.
- **Impersonating** our staff or another person.

## 3. What happens if you break these rules

- A game's developers can ban you from their game's channel, or mute you for a while.
- We can lock your account out of all chat, for a set time or indefinitely, or suspend the account.
- Serious violations, and anything involving harm to a child, can lead to harsher action, up to closing your account and reporting to the authorities where the law requires it.

Moderation decisions are ours, as described in section 17 of the [Terms of Service](https://blazium.games/terms-of-service#17-moderation-is-our-decision).

## 4. Your chat token

- To use your own IRC client, create a chat token in [Settings > Chat](https://blazium.games/settings/chat) and use it as your password with SASL PLAIN. Your username is your Blazium Games username.
- The token is secret. It is shown once, when you create it, and can't be shown again. We keep only a hash of it.
- To get a new one, regenerate it. The old token stops working, and any client signed in with it is disconnected right away. Revoking the token does the same.
- Don't share your token. Anyone who has it can chat as you.

## 5. What we keep

Messages are not logged, and we don't keep chat transcripts. We do keep:

- **Recent channel history in memory.** Each channel keeps its last 50 lines for up to one day in the chat servers' memory, so people who join can catch up. It is never written to disk and is gone when a server restarts.
- **Blocked spam.** If spam filtering blocks a message, the server's log can record the blocked text and who sent it.
- **Connection records.** The chat servers keep a size-capped operational log of connections (account name, IP address, and time). It contains no messages and is overwritten as it fills.
- **Moderation records.** Channel bans, mutes, and chat locks, with who set them, the reason, and when they end.
- **Your token.** A hash of your chat token, when you created it, and when it was last used.

See the [Privacy Policy](https://blazium.games/privacy-policy) for how long account data is kept.

## 6. Reporting

Use the report buttons on the Service, or email [support@blazium.games](mailto:support@blazium.games) with the channel, the usernames involved, and the time. Because chat isn't logged, a screenshot helps. If a child is in danger, contact your local authorities first.

## 7. Changes

We may update these rules. The effective date at the top shows the current version.
