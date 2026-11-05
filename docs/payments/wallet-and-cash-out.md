---
title: Wallet and cash-out
sidebar_position: 5
description: How credit, pending, and available balances work, and how developers cash out through Stripe Connect.
---

# Wallet and cash-out

Blazium is the marketplace. The buyer pays Blazium. Blazium keeps $0.25 + 8% of the price. The rest is the creator's earnings. A game sale, a donation, and a patron charge credit the creator's balance and can be cashed out. A Premium or Business subscription is charged to the subscriber and is not transferred to an Express account. A top-up becomes credit and cannot be cashed out.

Your [Balance](https://blazium.games/settings/wallet) page shows three amounts:

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

A project cannot charge money until its owner has finished payout setup. A price of 0 stays allowed. An existing paid price stays in place and can still be bought. The owner cannot change it to another paid price, turn donations on, add a paid edition, or add a paid patron tier until transfers are active.

Cash-outs are paid through [Stripe Connect](https://stripe.com/connect) Express. Stripe is available for United States accounts. USDC does not use Stripe.

1. The owner verifies their email.
2. On Balance, with USD or USDC selected, choose **Set up payouts with Stripe**. That creates the Express account if needed and opens Stripe-hosted onboarding in a new tab. Identity, tax, and bank details are entered there. Return and refresh land on Balance.
3. Until payouts are ready, Balance says to finish setup, or that Stripe is still reviewing after it has accepted the details and transfers are not active yet. **Continue payout setup** opens the hosted form again.
4. When transfers are active, Balance shows **Open Stripe payout dashboard** and **Cash out**. The Express dashboard is where the creator sees the payout to their bank. Blazium pays Stripe's processing fees and is responsible for a negative balance.

An agent can send you to Balance. You open Stripe from that page. See [Agent payouts](#agent-payouts).

## Cash out

A creator cashes out available earnings of $25 or more. The cash-out fee is 8% + $0.25, 7% + $0.25, or 6% + $0.25, from the best plan that account owns. The transfer goes only to the Express account on that same account.

Payouts are processed on weekdays from 8:00am to 5:00pm Pacific. Stripe verification, tax-form holds, or a Stripe review can add time after a payout is sent. A refund or dispute stays on Blazium's balance. Stripe does not reverse a transfer that was already sent.

## USDC

On Balance you can choose USD or USDC. **Set up payouts with Stripe** stays on the page for both. USD is paid through the Express account and is limited to United States accounts. USDC does not use Stripe. It uses the same email check, the same $25 minimum, and the same plan cash-out fee. You also pay a network estimate of $0.02, twice a typical Base or Solana transfer. Balance shows that estimate, and it is taken from the amount sent. The net is converted to USDC one-for-one and capped at 10,000 USDC per cash-out. A larger request is refused.

USDC needs a Base address (`0x` and 40 hex characters) or a Solana address. A new address is checked before anything is sent. Changing the address starts that check over. The address cannot change while a cash-out is pending or while the check is still open. Payouts are processed on weekdays from 8:00am to 5:00pm Pacific. Each cash-out can send at most 10,000 USDC.

The Free examples below use 8%. Premium is 7% + $0.25, and Business is 6% + $0.25.

| You cash out (Free) | Fee | Fixed fee | Transferred (USD) |
| --- | --- | --- | --- |
| $25.00 | $2.00 | $0.25 | $22.75 |
| $100.00 | $8.00 | $0.25 | $91.75 |

If a transfer fails or is reversed, the cash-out amount and the fee return to your available balance.

## Agent payouts

An agent can send you to Balance. Every agent cash-out waits for you, including a player key.

- Wallet access means a player key or token with `player:buy`, or a developer token with `mcp:write` or `mcp:money`. Read-only and single-project tokens can't.
- `start_payout_setup` and `get_payout_dashboard_link` return the Balance page. You open Stripe from **Set up payouts with Stripe**. Identity, tax, and bank details are entered on Stripe only after you open that page, never through the agent.
- `cash_out` sends available earnings to the Express account on that same account. The same $25 minimum and the account's plan fee apply. The fee is the rate from `get_wallet`: 8%, 7%, or 6%, plus $0.25. Money can't be sent anywhere else.
- We email you after every cash-out an agent makes, with the amount and the agent's name.
- Your email must be verified first.

To stop an agent, revoke its key or disconnect it in [MCP settings](https://blazium.games/settings/mcp). See [Permissions](../legal/permissions.md#agent-payouts).

## Chargebacks

If a buyer disputes a card payment, the license is revoked and that sale's earnings are held back from your balance. If the dispute is won, they are restored.

## Partial refunds

If support refunds part of a card payment, the buyer keeps the game and your earnings from that sale shrink in proportion. The Blazium Games fee shrinks the same way.
