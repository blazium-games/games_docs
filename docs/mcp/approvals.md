---
title: Approvals
sidebar_position: 5
description: When an agent has to ask you first, how you approve today, and the approval prompts we plan to add.
---

# Approvals

Some agent actions need your approval before they happen.

## How it works today

When an agent asks for an action that needs your approval, the tool returns `approval_required` with an approval id and a confirm link, and we email you. You approve or decline from that email. The agent checks with `get_approval` and tries the call again once you approve.

Actions that need your approval include:
- purchases past your agent spending limit
- donations and pledges
- developer-server cash-outs and payout address changes
- rotating or deleting deploy and MCP keys
- promoting a build to stable
- deleting a game or build
- granting a large batch of keys
- adding an admin
- a few others

See the [MCP reference](./reference.md) for each tool.

Your agent spending limit (ask every time, unlimited, or a budget up to $1,000) is set on the website only. An agent can't change it.

## Planned: approval prompts in your AI client

:::note Planned, not live
These approval prompts are planned and not live yet. Details may change.
:::

- **Every website action available to your agent.** We plan to let your agent do every step on blazium.games that you can do yourself, through the MCP servers.
- **Prompts in your AI client.** When a step needs you, your AI client will ask you directly, using MCP [input-required tool results](https://modelcontextprotocol.io/specification/2026-07-28/server/tools#input-required-tool-results). You'll answer **Yes**, **No**, **Always yes**, or **Always no**.
- **Standing choices.** Always yes and Always no are remembered for that agent and action. You'll be able to see, change, and remove them in your settings.
- **Spend limit and email approval stay.** Past your spending limit, you'll still approve each purchase, even with Always yes. Clients that don't support prompts will keep using email approval.
- **Always ask (proposed, awaiting confirmation).** Cash-out, payout address changes, key changes (rotating or deleting deploy and MCP keys), adding an admin, and deleting a game would ask every time, with no Always yes.