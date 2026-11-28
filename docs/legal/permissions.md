---
title: Permissions & Scopes
sidebar_position: 2
---

:::note
Canonical version: https://blazium.games/permissions
:::

# Permissions & Scopes

**Effective Date: November 28, 2026**

This page lists every permission Blazium Games asks for, why we need it, and what we will never do with it.
It sits alongside our [Privacy Policy](https://blazium.games/privacy-policy), [Subprocessors](./subprocessors.md), and the API disclosures for [GitHub](./github-api-disclosure.md), [X](./x-api-disclosure.md), [Discord](./discord-api-disclosure.md), and [Steam](./steam-api-disclosure.md).

## Linked accounts and sign-in

You can link GitHub, X, and Discord from [Linked accounts](https://blazium.games/settings/connections) and then use any of them to log in.

- Signing in with GitHub, X, or Discord always continues on Blazium Games. A provider proof alone does not log you in.
- If the service is already linked, you enter your password, then an authenticator code if you have set one up, or an emailed code if you have not. You can send another emailed code 30 seconds after the last one. A remembered browser does not skip this step.
- If it is not linked and a verified GitHub or Discord email matches an existing account, you enter that account's password. A match links the service. A wrong password links nothing and creates nothing.
- If it is not linked and there is no matching verified email, you set a username, email, and password, confirm a code sent to that inbox, then set up an authenticator app or skip it and confirm another emailed code. X does not provide an email, so that path always starts with the email you type. The account is created only after the inbox code matches.
- Linking while you are already signed in, at Linked accounts, only attaches the service. It does not create an account.
- Once you unlink an account, it can no longer be used to log in.
- If your account has no password, you must keep at least one account linked.

## Project sign-in

A project can register an OAuth application so its players can sign in, or create a Blazium account, and link it. One application is included on Free. Another one needs Grow ($29/mo per game); Scale includes it.

A linked app receives the account's user id, the username when one is set, and the avatar URL when one is set. Email is shared only when that application has email turned on, the request includes the email scope, and the email is verified. An unverified email is not released. The token cannot call MCP or spend money.

You can revoke a link from [Linked apps](https://blazium.games/settings/apps). Revoking deletes that application's tokens for your account. The developer does not get a list of every linked player's email.

## GitHub

Scopes requested: `read:user` and `user:email`.

### Why we need it
- To link GitHub to your account and let you log in with it.
- We read your GitHub user ID, login, and your primary email address. A verified email is compared with existing accounts during sign-in and can be shown on the create form. We do not store it on its own. If GitHub does not report a verified email, you type an email instead. Sign-in and linking still continue.

### What we store
- Your GitHub user ID and login, so we can recognize the linked account and show which one is linked.
- The GitHub access token is used once during sign-in or linking and is never stored.

### We will never
- Write to your repositories, issues, or any other GitHub data.
- Act on GitHub on your behalf.
- Ask for more scopes without updating this page first.

Details: [GitHub API disclosure](./github-api-disclosure.md).

## X

Scopes requested: `users.read` and `tweet.read`. X requires `tweet.read` alongside `users.read` to read your profile; we do not read your posts.

### Why we need it
- To link X to your account and let you log in with it.
- We make one request to X's `/2/users/me` and read your X user ID and username. X also returns your display name, which we ignore.

### What we store
- Your X user ID and username. Nothing else.
- The X access token is used once during sign-in or linking and is never stored. We do not request offline access, so we get no refresh token.

### We will never
- Post, like, repost, follow, or send messages on X for you.
- Read your posts, timeline, or direct messages.
- Ask for more scopes without updating this page first.

Details: [X API disclosure](./x-api-disclosure.md).

## Discord

Scopes requested: `identify` and `email`.

### Why we need it
- To link Discord to your account and let you log in with it.
- We make one request to Discord's `/users/@me` and read your Discord user ID and username. If Discord marks your email verified, we compare it during sign-in and do not store it on its own. An unverified or missing email is ignored.

### What we store
- Your Discord user ID and username. Nothing else.
- Discord includes your email address, display name, and avatar in its reply. We do not store the email, and we do not copy the display name or avatar. A verified email is compared during sign-in only.
- The Discord access token is used once during sign-in or linking and is never stored.

### We will never
- Join servers, read your servers or messages, or send messages for you.
- Ask for more scopes without updating this page first.

Details: [Discord API disclosure](./discord-api-disclosure.md).

## Steam

Steam sign-in uses OpenID 2.0, which has no scopes and gives us no access token.

### Why we need it
- To link Steam to your account, so games that use Steam auth verification can tell their servers which Blazium Games account you are. Steam cannot be used to log in here.
- Steam returns your Steam ID, and we ask Steam to confirm the reply is genuine. We may then read your public Steam name.

### What we store
- Your Steam ID and public Steam name. Nothing else.

### We will never
- Read your Steam library or friends list.
- Read your Steam inventory, or change it, except to grant an item you asked to move to Steam for a game whose developer turned transfers on.

Details: [Steam API disclosure](./steam-api-disclosure.md).

## MCP access (OAuth)

AI tools such as Cursor, VS Code, and Claude Code connect to one of two Blazium Games MCP servers. The developer server at `https://mcp.blazium.games/developer` manages your games. `https://mcp.blazium.games/mcp` still reaches that server. The player server at `https://mcp.blazium.games/player` acts for you as a player.
When you approve a tool, it gets a token for one server only, with one or more of that server's scopes. A token never holds scopes for both servers, and neither server accepts the other's tokens or keys.

| Scope | Server | Allows |
| --- | --- | --- |
| `mcp:read` | Developer | Reading your games, builds, analytics, crash reports, setup details, balance, and library. |
| `mcp:write` | Developer | Creating and updating game pages, setting prices, issuing deploy keys, and (until October 28, 2026) buying from your balance within the limits you set, in addition to everything `mcp:read` allows. |
| `mcp:catalog.write` | Developer | Changing game pages (text, taxonomy, similar titles, dependencies, engine compatibility, license kind, images, admins) and replying to player reviews. Reads of your profile and games are always included. |
| `mcp:build.write` | Developer | Managing builds and release channels, and reading deploy info and scan status. |
| `mcp:crash.read` | Developer | Reading crash reports and crash groups, running crash analysis, and reading the crash webhook setting and that game's signing key. |
| `mcp:crash.write` | Developer | Changing crash webhooks and refreshing that game's signing key. Also covers the crash read routes. |
| `mcp:bugs.read` | Developer | Reading player bug tickets and the in-game bug reporter settings, including that game's signing key. |
| `mcp:bugs.write` | Developer | Updating bug tickets and changing the in-game bug reporter. |
| `mcp:steam.manage` | Developer | Setting a game's Steam app id, Web API key, and ticket secret, and turning Steam auth on or off. The Web API key and ticket secret can be replaced but are never shown back. |
| `mcp:analytics.read` | Developer | Reading visitor analytics and custom events. |
| `mcp:keys.manage` | Developer | Listing and rotating deploy keys and MCP keys. |
| `mcp:money` | Developer | Pricing, sales, game keys and gift links, wallet, library, and downloads. |
| `mcp:anticheat` | Developer | Requesting anticheat for a game you own, and, after an NDA and a contract are signed, reading that game's anticheat reports and managing its server keys. Not included in `mcp:read` or `mcp:write`. |
| `player:read` | Player | Reading your account, balance, wallet history, quotes, library, approvals, download links, the builds you can see, your reviews, recommendations, and your friends and what they're playing. |
| `player:write` | Player | Verifying your email, recording play time, confirming an approval with the code you give the tool, joining or leaving a game's beta, writing or deleting your reviews, "more/less like this" feedback, filing bug reports, sending and answering friend requests, setting your presence and activity sharing, and redeeming game keys. |
| `player:buy` | Player | Topping up and buying games or donating from your balance within the limits you set. Granted only if you tick **Allow purchases**. |

### Why we need it
- So your AI tool can manage your store pages and read your game's data without you pasting passwords.

### How it is limited
- The consent screen has a **Read-only access** option. Tick it and the tool only gets `mcp:read` (or `player:read`); any attempt to change data is refused.
- On the developer server you can pick a narrower preset on the consent screen (store page, CI, crash triage, keys, money, or read-only), so the tool only gets the scopes that job needs.
- On the player server the tool can't buy unless you tick **Allow purchases**.
- Over MCP, rotating or creating MCP and deploy keys, deleting a deploy key, promoting a build to stable, deleting a game or build, creating more than 100 game keys at once, and adding a project admin wait until you approve them by the emailed link or code, even with full access.
- A token is either for your whole account or for a single game (project). A project token is refused (error 4030) for any other game and for account-level actions: your profile, balance, wallet, library, account analytics, MCP keys, creating games, and buying.
- Access tokens last 1 hour. Refresh tokens last 30 days from when you approved the tool. Each refresh issues a new refresh token and the old one stops working; if an old one is used again, the whole chain is revoked and the tool has to ask you again. All of them stop working if your account is deleted.
- Every tool call made with an MCP key or token is recorded in an activity log: the tool, the game, the outcome, the timing, the client name, and a redacted summary of the arguments (secrets, codes, webhook URLs and emails are blanked, and typed text is kept only as a length; results are not stored). The API requests behind it (key, game, method, and path) are recorded too. You can read and download your own log, and you can end every AI tool's access with **Sign out of all AI tools**. Calls are kept for 30 days.

### We will never
- Accept a read-only token for a change.
- Share your keys or tokens with third parties.

## Agent spending

AI tools connected through MCP can buy games and send donations for you, but only if you allow it.

### How it is limited
- Every agent starts on **Ask me each time**: each purchase or donation waits until you approve it by the emailed link or code. Each MCP API key and each OAuth-connected app is a separate agent with its own setting.
- At [MCP settings](https://blazium.games/settings/mcp) you can let an agent spend on its own: unlimited, or up to a monthly, yearly, or one-time limit (up to $1,000, UTC periods). Anything beyond the limit waits for your approval. Agents cannot change their own limits.
- An approval covers one purchase, for the amount shown, and expires after 30 minutes.
- The limit counts each purchase's total, including tax. Refunded purchases stop counting.
- Buying needs a player token with `player:buy`, or until October 28, 2026 a developer token with `mcp:write` for your whole account. Read-only and single-game (project) tokens can never buy (error 4030).
- From October 28, 2026 the developer server no longer buys: its buying tools are removed and direct requests get error 4034. Use the player server instead.
- Agents pay only from your account balance, never by card. They cannot request refunds unless Blazium staff turn MCP refunds on for your account, and each request then waits for your approval.
- Your email must be verified before agents can buy.
- Each agent purchase is recorded with the agent that made it, and shows in your wallet transactions and library.

### We will never
- Let an agent charge your card.
- Let an agent spend beyond the limit you set without your approval.
- Let an agent send your earnings anywhere except the payout account on your own account.

## Agent payouts

An agent can send you to Balance. A cash-out always waits until you approve it, including a player key.

- Wallet access means a player token with `player:buy`, or a developer token with `mcp:write` or `mcp:money`. Read-only and single-game (project) tokens cannot.
- `start_payout_setup` and `get_payout_dashboard_link` return the Balance page. You open Stripe from Set up payouts with Stripe. Identity, tax, and bank details are entered on Stripe only after you open that page, and they never pass through the agent or us.
- An agent can ask to cash out available earnings of $25 or more. The cash-out fee is 8% + $0.25 on Free, 7% + $0.25 on Grow ($29/mo per game), or 6% + $0.25 on Scale ($99/mo per game), from the best plan that account owns. You approve each cash-out, including when the agent used a player key. The transfer goes only to the Express account on that same account.
- We email you after every cash-out an agent makes, with the amount and the agent's name.
- Your email must be verified before agents can set up payouts or cash out.
- Payouts are processed on weekdays from 8:00am to 5:00pm Pacific.
- To stop an agent, revoke its key or disconnect it at [/settings/mcp](https://blazium.games/settings/mcp).

## Keys

- **MCP keys** (account keys and project keys) are shown once when you create them and are stored only as a hash. You can rotate them at [/settings/mcp](https://blazium.games/settings/mcp) or on a game's MCP tab; rotating invalidates the previous key.
- **Player keys** (starting `bgames_play_`) work only on the player server. They are shown once, stored only as a hash, and rotated at [/settings/mcp](https://blazium.games/settings/mcp) separately from MCP keys.
- **Deploy keys** are two values for one project: an access token and a secret. chauffeur and CI need both. The access token stays on the Deploy keys tab. The secret is shown once. Creating a new deploy key replaces the previous one. Uploads that used the old key stop working. They can also list that game's bug reports and download their screenshot and log. They cannot read crash dumps or change a ticket's status.
- **Steamworks Web API keys** that developers enter to import a game from Steam are used for that import and discarded. With Steam auth verification on, the key is stored encrypted, never shown again, and never available to AI agents.
- **Steam auth keys** (128 characters) sign a game's Steam session tokens and let its servers call Blazium Games. They are stored encrypted, can be shown to the game's owner and admins on its Steam tab, and are never available to AI agents. Making a new one revokes every session token.

## Cookies

Sign-in cookies are always on because the site does not work without them. They are HTTPS-only, hidden from page scripts, and `SameSite=Lax`, so other sites can't make signed-in requests with them. Cookies whose names start with `__Host-` belong to the exact host that set them: no other blazium.games site, including people's profile and project sites, can read or replace them. Analytics cookies are only set if you accept them in the cookie banner.

| Cookie | Purpose | Lifetime | Needs consent |
| --- | --- | --- | --- |
| `__Host-BG_T` | Your signed-in session on blazium.games. | 7 days | No |
| `__Host-BG_UD` | Your display name, username, and avatar for the header. | 7 days | No |
| `__Host-BG_STORE` | A separate session for store pages on other blazium.games hosts. It can buy and use your library, but cannot change account settings. It is handed over through a one-time code that works once, for 60 seconds. | 7 days | No |
| `__Host-BG_CSRF` | A random value that every form on the site must echo back, so another site cannot submit forms as you. | 7 days | No |
| `__Host-BG_DEV` | Remembers a browser that verified an emailed sign-in code, for email-and-password sign-in when no authenticator app is set up. Survives logout. It does not skip an authenticator code. | 30 days | No |
| `__Host-BG_NEXT` | Returns you to the page you came from after logging in with GitHub, X, or Discord. | 15 minutes | No |
| `__Host-BG_STATE` | Ties a GitHub, X, or Discord sign-in, or a Steam link, to the browser that started it. | 15 minutes | No |
| `__Host-BG_SETUP` | Finishes setup for an email account that has not completed it. | 15 minutes | No |
| `__Host-BG_ENROLL` | Carries a sign-in until you finish your password and a second step. | 15 minutes | No |
| `__Host-BG_FACTOR` | Finishes authenticator setup, then shows recovery codes once. | 15 minutes | No |
| `BG_IN` | Tells other blazium.games hosts that you are signed in, so store pages know to fetch their own session. It is set for the whole blazium.games domain and holds no credential. | 7 days | No |
| `BG_CONSENT` | Remembers your cookie banner choice. | 1 year | No |
| `__Host-BG_MCP` | On mcp.blazium.games only: a pass that lets you approve an AI agent's access. It can only read your account and project list, is signed by the MCP server, and is not your blazium.games session. Signing out of blazium.games ends it. | 7 days | No |
| `_ga`, `_ga_*` | Google Analytics. | Up to 2 years (set by Google) | Yes |

Game pages also keep a visit session ID in your browser's session storage. It is cleared when you close the tab.

You can change your choice at any time with **Cookie settings** in the site footer. Declining removes the Google Analytics cookies.

## Revoking access

- **Linked accounts:** unlink GitHub, X, or Discord at [/settings/connections](https://blazium.games/settings/connections). An unlinked account can no longer log in. If you have no password, the last linked account cannot be removed until you set one or link another.
- Removing Blazium Games in the other service's settings does not unlink it here. Unlink it at [/settings/connections](https://blazium.games/settings/connections) to stop it logging in.
- **GitHub:** remove Blazium Games under [GitHub > Settings > Applications > Authorized OAuth Apps](https://github.com/settings/applications).
- **X:** remove Blazium Games under [X > Settings > Security and account access > Apps and sessions](https://x.com/settings/connected_apps).
- **Discord:** remove Blazium Games under Discord **User Settings > Authorized Apps**.
- **Steam:** OpenID gives Blazium Games no ongoing access, so there is nothing to remove on Steam. Unlink it at [/settings/connections](https://blazium.games/settings/connections).
- **Agent spending:** set any agent back to **Ask me each time** at [MCP settings](https://blazium.games/settings/mcp).
- **MCP keys and tokens:** rotate keys at [/settings/mcp](https://blazium.games/settings/mcp). OAuth access tokens expire after 1 hour and refresh tokens after 30 days; all of them stop working when your account is deleted.
- **Everything:** email [privacy@blazium.games](mailto:privacy@blazium.games) to delete your account. See the [Privacy Policy](https://blazium.games/privacy-policy#6-deleting-your-account).
