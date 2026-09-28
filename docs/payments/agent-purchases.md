---
title: Agent purchases
sidebar_position: 7
description: Let AI agents buy games and donate from your balance, with a monthly limit per agent.
---

# Agent purchases

AI agents connected through the [MCP server](../mcp/index.md) can buy games and donate for you, but only from your stored balance and only within the limits you set.

## Turn it on

Agents cannot spend anything until you allow it.

1. Verify your email.
2. Connect the agent. MCP API keys are listed automatically. An agent connected through OAuth sign-in appears after it calls `get_agent_policy` or tries to buy once.
3. Open [MCP settings](https://blazium.games/settings/mcp) on blazium.games. Under each agent, turn on **Purchases** and set a **monthly limit** (up to $1,000).

Each MCP API key and each OAuth client counts as a separate agent with its own switch and limit. The limit covers purchases and donations in a calendar month (UTC); refunded purchases do not count. Only you can change these settings, on the website; agents can read them with `get_agent_policy`.

Agents need a token with `mcp:write` for the whole account. Project-bound tokens cannot buy.

## How an agent buys

1. `quote_purchase` returns the price, tax, and total in cents.
2. The agent shows you the total and waits for your approval.
3. `purchase_game` (or `donate_to_game`) with `confirm_total_cents` set to the total you approved and a unique `idempotency_key`.

If the total changed since the quote, the purchase is refused with code `4094` and the agent has to ask you again. Retrying with the same `idempotency_key` never charges twice.

## Paying

Agents always pay from the balance. If it is too low (`4020`), the agent can:

- give you a card top-up link from `create_top_up_link`; or
- top up with USDC from its own wallet over x402. See [Adding balance](./top-up.md).

## Errors agents may see

| Code | Meaning |
| --- | --- |
| `4096` | The account email is not verified |
| `4212` | Purchases are turned off for this agent |
| `4213` | The purchase would exceed this agent's monthly limit |
| `4020` | Not enough balance |
| `4221` | No billing address on file for tax. Top up by card once, or buy on the website |
| `4094` | The total changed; confirm again with the human |
| `4082` | Agents cannot pay by card |

## What agents cannot do

Agents cannot pay by card, change their own limits, set up payouts, cash out, or request refunds.
