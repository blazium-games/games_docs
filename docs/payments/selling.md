---
title: Selling games
sidebar_position: 2
description: Set a price or accept donations, understand the $0.25 + 8% sale fee, and track sales.
---

# Selling games

## Set a price

Open your game's edit page on blazium.games and go to the **Pricing** tab. Only the owner and accepted game admins can change pricing, and they need a verified email.

- **Price:** $0 (free), or between $0.99 and $500.00.
- **Donations:** free games can accept donations from $1.00 to $500.00. Paid games cannot.

Agents can do the same with the MCP tool `set_game_price` (`price_cents`, `donations_enabled`).

## What you receive

Each sale or donation pays you the price minus the sale fee of **$0.25 + 8%**. The percentage is rounded up to the cent, and the fee never exceeds the price.

| Price | Sale fee | You receive |
| --- | --- | --- |
| $0.99 | $0.33 | $0.66 |
| $4.99 | $0.65 | $4.34 |
| $10.00 | $1.05 | $8.95 |
| $20.00 | $1.85 | $18.15 |

Buyers pay tax and any card fee on top of the price, so those never come out of your share.

## When earnings become available

New earnings are **pending**. They become **available** once the purchase can no longer be refunded: after 7 days, or as soon as the buyer has played for 2 hours. A settlement job moves them every hour. See [Wallet and cash-out](./wallet-and-cash-out.md).

If a purchase is refunded or charged back, its earnings are taken back from your balance and the sale fee is not charged.

## Taxes

Blazium Games collects and remits sales tax on game purchases through Stripe Tax, in the places where it is registered. You receive the price minus the sale fee; tax is never part of your earnings.

## Track sales

The **Sales** button on the edit page lists purchases, donations, refunds, and your net earnings for that game. Agents can read the same list with `list_game_sales`.

## Download access

Buyers of a paid game need a license to download it. You, your game admins, and anyone you grant a license to (through support) can always download. Free games stay downloadable by any verified account.
