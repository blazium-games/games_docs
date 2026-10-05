---
title: Steam API disclosure
sidebar_position: 5.5
---

:::note
Canonical version: https://blazium.games/steam-api-disclosure
:::

# Steam API Disclosure

**Effective Date: October 8, 2026**

Blazium Games uses Steam in three ways: to link a Steam account to yours, to import a game's Steam store page for its developer, and to check Steam sign-ins for games whose developers turn on Steam auth verification.
This page explains what we access in each case and the commitments we make about it.

## Linking Steam

Steam sign-in uses OpenID 2.0. It has no scopes and gives us no access token.

- When you link Steam at [Linked accounts](https://blazium.games/settings/connections), Steam sends you back to us with your Steam ID. We ask Steam to confirm the reply is genuine before we use it.
- We may then read your public Steam name with the Steam Web API's `GetPlayerSummaries`.
- We keep your Steam ID and that name. Steam cannot be used to log in to Blazium Games.

## Importing a game (developers)

A developer can copy a game's Steam store page into a listing. They give us the app ID and their Steamworks Web API key.

- We check with Steam that the key belongs to a publisher of that app (`GetPartnerAppListForWebAPIKey`).
- We read the public store page (`appdetails`), its tags (`IStoreBrowseService/GetItems` and `IStoreService/GetTagList`), and its images from Steam's image servers.
- The key is used for that import and discarded, unless the developer turns on Steam auth verification.

## Steam auth verification (players)

A developer can turn on Steam auth verification for their game. The game then sends us a Steam session ticket when you play.

- We send the ticket to Steam with the developer's key (`AuthenticateUserTicket`). Steam returns your Steam ID, the owner's Steam ID if the game is borrowed through Family Sharing, and whether the account has a VAC or publisher ban.
- We ask Steam whether your account owns the game (`CheckAppOwnership`).
- If the account owns the game and has no publisher ban, we return a session token to the game, valid for 1 hour.
- We keep a session record: your Steam ID, the owner's Steam ID, your Blazium Games account if you linked Steam, when the token expires, whether it was revoked, and your IP address. The record is deleted 30 days after the token expires. The ticket itself is not stored.
- The developer's servers can check the token and ask whether a Steam ID owns the game. They see your Steam ID, whether you own the game, whether Steam reports a VAC ban, and your Blazium Games user ID if you linked Steam.

## Our commitments

- We never store Steam session tickets.
- We never read your Steam library, friends, inventory, or messages, and never act on Steam for you.
- We store a developer's Steamworks Web API key only while Steam auth verification is on, encrypted, and never show it again or make it available to AI agents.
- We never use Steam data for advertising.
- We never use Steam data to train AI or machine-learning models.
- We never sell Steam data or share it with third parties, except the developer of the game you played as described above and the [subprocessors](./subprocessors.md) that host our service.

## Revoking access and deleting data

- Unlink Steam at [Linked accounts](https://blazium.games/settings/connections). Games then no longer learn your Blazium Games account from Steam.
- OpenID gives us no ongoing access, so there is nothing to remove in your Steam settings.
- A game's developer can revoke its session tokens at any time, and turning off Steam auth verification revokes them all.
- To delete your account and the Steam link, email [privacy@blazium.games](mailto:privacy@blazium.games). We process deletion requests within 30 days, and Steam game sessions stop naming your account. See the [Privacy Policy](https://blazium.games/privacy-policy#6-deleting-your-account) for what deletion covers.

See also the [GitHub API disclosure](./github-api-disclosure.md), the [X API disclosure](./x-api-disclosure.md), the [Discord API disclosure](./discord-api-disclosure.md), [Permissions & Scopes](./permissions.md), and the [Steam import](../steam-import.md) and [Steam auth verification](../steam-auth.md) guides.

## Contact

Questions about this disclosure: [privacy@blazium.games](mailto:privacy@blazium.games).

Steam and the Steam logo are trademarks of Valve Corporation. Blazium Games is not affiliated with Valve.
