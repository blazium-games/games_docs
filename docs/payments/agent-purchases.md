---
title: Agent purchases
sidebar_position: 7
description: Let AI agents buy games and donate from your balance, on their own within a limit you choose or with your approval each time.
---

# Agent purchases

AI agents connected through the [MCP server](../mcp/index.md) can buy games and donate for you, but only from your stored balance. You choose how much each agent may spend on its own; anything else waits for your approval.

## Choose what an agent may spend

1. Verify your email.
2. Connect the agent. MCP API keys are listed automatically. An agent connected through OAuth sign-in appears after it calls `get_agent_policy` or tries to buy once.
3. Open [MCP settings](https://blazium.games/settings/mcp) on blazium.games and pick a mode under each agent:

| Mode | What the agent can do on its own |
| --- | --- |
| **Ask me each time** (default) | Nothing. Every purchase and donation waits for your approval. |
| **Unlimited** | Buy and donate with no limit. |
| **Monthly limit** | Spend up to the amount per calendar month (UTC). |
| **Yearly limit** | Spend up to the amount per calendar year (UTC). |
| **One-time limit** | Spend up to the amount in total. Tick **Start over** to give it a fresh budget. |

Limits go up to $1,000. They count each purchase's total, including tax; refunded purchases do not count. Each MCP API key and each OAuth client is a separate agent with its own mode. Only you can change these settings, on the website; agents can read them with `get_agent_policy`.

Agents need a token with `mcp:write` for the whole account. Project-bound tokens cannot buy.

## How an agent buys

1. `quote_purchase` returns the price, tax, and total in cents.
2. The agent tells you the total.
3. `purchase_game` (or `donate_to_game`) with `confirm_total_cents` set to that total and a unique `idempotency_key`.

If the purchase fits the agent's limit, it completes at once. If the total changed since the quote, it is refused with code `4094` and the agent has to quote again. Retrying with the same `idempotency_key` never charges twice.

## Approving a purchase

When the agent is set to **Ask me each time**, or the purchase would go over its limit, the tool returns `approval_required` (code `4214`) instead of buying. You get an email with the amount, the game, a link, and a 6-digit code. Approve in either way:

- open the link (or **MCP settings**, under **Waiting for your approval**) and click **Approve** or **Deny**; or
- read the code to the agent, which sends it with `confirm_approval`.

The agent can check the state with `get_approval`. Once approved, it calls `purchase_game` again with the same `idempotency_key` and total, and the purchase completes. Each approval covers that one purchase only and expires after 30 minutes. If it expires, the next retry sends a fresh email.

## Paying

Agents always pay from the balance. If it is too low (`4020`), the agent can:

- give you a card top-up link from `create_top_up_link`; or
- top up with USDC from its own wallet over x402. See [Adding balance](./top-up.md).

## Codes agents may see

| Code | Meaning |
| --- | --- |
| `4214` | Waiting for your approval (not an error; HTTP 202) |
| `4215` | You denied the request |
| `4216` | Wrong or expired approval code |
| `4095` | The `idempotency_key` was already used for a different purchase |
| `4097` | This approval was already used |
| `4098` | This approval was already decided or expired |
| `4096` | The account email is not verified |
| `4212` | This token can't make purchases (project token, or an unknown agent) |
| `4020` | Not enough balance |
| `4221` | No billing address on file for tax. Top up by card once, or buy on the website |
| `4094` | The total changed; quote again |
| `4082` | Agents cannot pay by card |

## What agents cannot do

Agents cannot pay by card, change their own limits, approve their own requests except with the code you give them, set up payouts, cash out, or request refunds.
