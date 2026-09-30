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

## Editions

A paid listing can sell up to 8 editions, added under **Editions** on the Pricing tab or with the MCP tools `upsert_sku` and `delete_sku`.

| Kind | What the buyer gets |
|---|---|
| `standard` | The game |
| `deluxe` | The game, as a higher tier you describe (soundtrack, art book, extra content you ship in the files) |
| `beta_access` | The game plus the `beta` channel. Once a listing has an active `beta_access` edition, the beta channel is only for buyers of that edition |
| `bundle` | The game plus 1 to 10 of your other listings, each granted as its own license |

Each edition has a name (up to 80 characters), a slug (lowercase letters, digits and dashes, up to 40), a price from $0.99 to $500.00, an optional description, and a sort order.

- **The listing price follows the editions.** It is always the cheapest active edition, donations are turned off, and `set_game_price` returns `4164` while editions exist.
- **Upgrades.** A buyer who owns a cheaper edition pays the difference, at least $0.50. Editions can only be upgraded: a cheaper edition than the one owned returns `4157`, and the same edition is refused as already owned.
- **Buying without naming an edition** buys the cheapest one. Agents pass `sku` (slug or uid) to `quote_purchase` and `purchase_game`.
- **Retiring an edition** (delete, or untick **On sale**) removes it from the store. Buyers keep what they bought, and existing game keys for it still work.

Editions share the same sale fee, refund rules, and earnings schedule as any other sale. `4155` means an edition field is invalid, and `4156` means the listing already has 8.

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

New earnings are **pending**. They become **available** 7 days after the sale, when the refund window closes. The buyer's playtime does not release them sooner. See [Wallet and cash-out](./wallet-and-cash-out.md).

If a purchase is refunded or charged back, its earnings are taken back from your balance and the sale fee is not charged.

## Taxes

Blazium Games collects and remits sales tax on game purchases through Stripe Tax, in the places where it is registered. You receive the price minus the sale fee; tax is never part of your earnings.

## Track sales

The **Sales** button on the edit page lists purchases, donations, refunds, and your net earnings for that game. Agents can read the same list with `list_game_sales`.

## Download access

Buyers of a paid game need a license to download it. You, your game admins, and anyone you grant a license to (through support) can always download. Free games stay downloadable by any verified account.
