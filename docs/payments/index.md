---
slug: /payments
title: Payments on Blazium Games
sidebar_label: Overview
sidebar_position: 1
description: Paid games, donations, stored balances, cash-outs, refunds, and agent purchases on Blazium Games.
---

# Payments on Blazium Games

Blazium Games accounts are free. Developers can sell games or accept donations, and players can buy with a card or from a balance stored on their account. All amounts are in US dollars. Payments are processed by [Stripe](https://stripe.com). Blazium Games is operated by Divine Games, Inc.

## Verify your email first

A verified email address is required to:

- make a game public or upload builds and images;
- download any game, free or paid;
- buy, donate, top up, or cash out;
- let AI agents buy, set up payouts, or cash out for you.

Verify at [blazium.games/settings/verify](https://blazium.games/settings/verify). A code is sent to your account email. Agents can start the same flow with the MCP tools `request_email_code` and `verify_email`, but the code always goes to your inbox.

## Fees at a glance

| When | Who pays | Amount |
| --- | --- | --- |
| A game is sold or a donation is made | Developer (taken from the sale) | $0.25 + 8% of the price |
| A buyer pays by card | Buyer | A card processing fee, shown before you pay |
| A buyer pays from the balance | Buyer | Nothing extra |
| Sales tax | Buyer | Calculated by Stripe Tax where Blazium Games is registered |
| Adding balance by card | Buyer | The card processing fee; no tax |
| Adding balance with USDC (x402) | Buyer | A 1.5% network fee |
| Cashing out earnings | Developer | 8% plus Stripe's payout fee (0.25% + $0.25); up to 72 business hours to reach your bank |

A $10 game sold by card: the buyer pays $10, any tax, and the card fee. Blazium Games keeps $1.05 ($0.25 + $0.80), and the developer's pending earnings grow by $8.95.

## Guides

- [Selling games](./selling.md): prices, donations, the sale fee, and the sales view.
- [Buying games](./buying.md): the Buy button, paying from the balance, your library, and downloads.
- [Adding balance](./top-up.md): card top-ups and USDC over x402.
- [Wallet and cash-out](./wallet-and-cash-out.md): credit, pending and available earnings, Stripe Connect, the $25 minimum, payout timing, and agent payouts.
- [Refunds](./refunds.md): the 7-day and 2-hour rule, non-refundable donations, and how to ask.
- [Agent purchases](./agent-purchases.md): letting AI agents buy from your balance, with per-agent limits.

The [Terms of Service](https://blazium.games/terms-of-service) are the binding version of these rules.
