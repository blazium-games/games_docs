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

1. On the wallet page choose **Set up payouts with Stripe**. Stripe opens in a new tab, where you confirm your identity and add a bank account. Stripe may ask for tax information (KYC).
2. When you come back, the wallet page shows whether payouts are ready. If Stripe needs more information, choose **Continue payout setup**.
3. **Open Stripe payout dashboard** opens your Express dashboard in a new tab, where you manage your bank account and see payouts.

An AI agent can do the same for you. See [Agent payouts](#agent-payouts).

## Cash out

Cash out any amount from $25 of available earnings. The fee is a flat 8% of the amount plus $0.25. The rest is transferred to your Stripe account and then paid out to your bank.

Payouts are processed on weekdays from 8:00am to 5:00pm Pacific. Stripe verification, tax-form holds, or a Stripe review can add time after a payout is sent.

## USDC

On the wallet page you can choose USD or USDC. USD stays on Stripe Connect and is limited to US accounts. USDC does not need Stripe Connect. It uses the same email check, the same $25 minimum, and the same 8% + $0.25 cash-out fee. You also pay a network estimate of $0.02, twice a typical Base or Solana transfer. The wallet page shows that estimate, and it is taken from the amount sent. The net is converted to USDC one-for-one and capped at 10,000 USDC per cash-out. A larger request is refused.

USDC needs a Base address (`0x` and 40 hex characters) or a Solana address. A new address is checked before anything is sent. Changing the address starts that check over. The address cannot change while a cash-out is pending or while the check is still open. Payouts are processed on weekdays from 8:00am to 5:00pm Pacific. Each cash-out can send at most 10,000 USDC.

| You cash out | 8% fee | Fixed fee | Transferred (USD) |
| --- | --- | --- | --- |
| $25.00 | $2.00 | $0.25 | $22.75 |
| $100.00 | $8.00 | $0.25 | $91.75 |

If a transfer fails or is reversed, the cash-out amount and the fee return to your available balance.

## Agent payouts

An AI agent connected with wallet access can set up payouts and cash out for you. A cash-out from the developer server waits for your email approval; a cash-out with a player key or token does not ask you first:

- Wallet access means a player key or token with `player:buy`, or a developer token with `mcp:write` or `mcp:money`. Read-only and single-project tokens can't.
- `start_payout_setup` and `get_payout_dashboard_link` return a Stripe link for you to open. Your identity, tax, and bank details are only ever entered on Stripe's pages, never through the agent.
- `cash_out` sends available earnings to the payout account on your own Blazium Games account. The same $25 minimum and fees apply. Money can't be sent anywhere else.
- We email you after every cash-out an agent makes, with the amount and the agent's name.
- Your email must be verified first.

To stop an agent, revoke its key or disconnect it in [MCP settings](https://blazium.games/settings/mcp). See [Permissions](../legal/permissions.md#agent-payouts).

## Chargebacks

If a buyer disputes a card payment, the license is revoked and that sale's earnings are held back from your balance. If the dispute is won, they are restored.

## Partial refunds

If support refunds part of a card payment, the buyer keeps the game and your earnings from that sale shrink in proportion. The Blazium Games fee shrinks the same way.
