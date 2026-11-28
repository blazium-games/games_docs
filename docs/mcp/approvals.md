---
title: Approvals
sidebar_position: 5
description: When an agent has to ask you first, how you answer in your AI client or by email, and the standing choices you can save.
---

# Approvals

Some agent actions need your approval before they happen. You can answer in your AI client, or from the email we send.

## Which actions ask

Actions that need your approval include:
- purchases past your agent spending limit
- donations and pledges
- cash-outs and payout address changes
- rotating or deleting deploy and MCP keys
- promoting a build to stable
- deleting a game or build
- granting a large batch of keys (over 100)
- adding an admin
- creating or changing a project sign-in application
- changing a game's Steam sign-in settings, chat or anticheat bans, and a few others

See the [MCP reference](./reference.md) for each tool.

Your agent spending limit (ask every time, unlimited, or a budget up to $1,000) is set on the website only. An agent can't change it, and neither can an agent turn developer mode on or off.

## Answer in your AI client

When your client uses MCP protocol `2026-07-28` or later and supports the `elicitation` capability, the tool returns an [input-required result](https://modelcontextprotocol.io/specification/2026-07-28/server/tools#input-required-tool-results). Your client shows one prompt with four choices:

| Choice | What it does |
| --- | --- |
| Yes | Allow this one call. |
| No | Refuse this one call. |
| Always yes | Allow this call and save a standing allow for this agent and action. |
| Always no | Refuse this call and save a standing deny for this agent and action. |

The agent repeats the call with your answer. The answer is tied to the exact tool, arguments, and connection it was asked for, and it expires after 15 minutes, so it can't be reused for a different call.

## Answer by email

A client that does not support prompts gets `approval_required` with an approval id and a confirm link, and we email you. You approve or decline from that email or from the website. The agent checks with `get_approval` and tries the call again, with the same `idempotency_key`, once you approve.

## Always ask

Some actions always ask, with no Always yes: cash-out, payout address changes, key changes (rotating or deleting deploy and MCP keys), adding an admin, deleting a game, and creating or changing a project sign-in application. These stay one-time decisions. Your client doesn't show the prompt for them; you answer by the email link or on the website.

## Standing choices

Always yes and Always no are remembered for one agent key and one action. When the action is about one game, that game is part of the choice. A standing choice lasts until you change or remove it, or the agent key is revoked.

- A standing allow skips the approval for that action. It never skips an always-ask action, and it does not skip your spending limit: a purchase past the limit still needs a one-time yes.
- A standing deny always wins. The agent's call is refused with `4213`, "This agent is not allowed to do that."
- See, add, and revoke them at [Settings > Standing choices](https://blazium.games/settings/choices).
- An agent can list them with `list_standing_choices`, save one with `set_standing_choice`, and remove one with `revoke_standing_choice`. It cannot save an allow for an always-ask action.
