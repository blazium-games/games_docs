---
title: Wallet and cash-out
sidebar_position: 5
description: How credit, pending, and available balances work, and how developers cash out through Stripe Connect.
---

# Wallet and cash-out

Your [wallet](https://blazium.games/settings/wallet) shows three amounts:

| Balance | Where it comes from | Spend it | Cash it out |
| --- | --- | --- | --- |
| **Credit** | Top-ups and refunds of balance purchases | Yes | No |
| **Pending** | Your sales that can still be refunded | No | No |
| **Available** | Sales past the refund window | Yes | Yes, from $25 |

When you buy from your balance, credit is used first, then available earnings.

Pending earnings become available 7 days after the sale. Playtime can end the buyer's right to a refund sooner, but it never releases earnings early.

If a balance goes negative, for example because a top-up was refunded or disputed, the debt is repaid from your other balance first. Until then it is subtracted from what you can spend and cash out.

The wallet page also lists every transaction: sales, purchases, top-ups, refunds, and cash-outs.

## Set up payouts

Cash-outs are paid through [Stripe Connect](https://stripe.com/connect) Express. For now, payout accounts can only be set up in the United States.

1. On the wallet page choose **Set up payouts**. You are sent to Stripe to confirm your identity and add a bank account. Stripe may ask for tax information (KYC).
2. When you come back, the wallet page shows whether payouts are ready. If Stripe needs more information, choose **Set up payouts** again.
3. **Stripe dashboard** opens your Express dashboard, where you manage your bank account and see payouts.

Payout setup and cash-outs are only available on the website, never through MCP or an agent.

## Cash out

Cash out any amount from $25 of available earnings. The fee is 8% of the amount plus Stripe's payout fee (0.25% + $0.25). The rest is transferred to your Stripe account and paid out to your bank on Stripe's schedule.

| You cash out | 8% fee | Payout fee | Transferred |
| --- | --- | --- | --- |
| $25.00 | $2.00 | $0.32 | $22.68 |
| $100.00 | $8.00 | $0.50 | $91.50 |

If a transfer fails or is reversed, the full amount returns to your available balance and the fee is refunded.

## Chargebacks

If a buyer disputes a card payment, the license is revoked and that sale's earnings are held back from your balance. If the dispute is won, they are restored.

## Partial refunds

If support refunds part of a card payment, the buyer keeps the game and your earnings from that sale shrink in proportion. The Blazium Games fee shrinks the same way.
