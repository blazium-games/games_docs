---
title: Wallet and cash-out
sidebar_position: 5
description: How the player balance works, and how developers collect money with Stripe, PayPal or crypto.
---

# Wallet and cash-out

Blazium is the marketplace. The buyer pays Blazium. Blazium keeps $0.25 + 8% of the price. The rest is the creator's earnings. A game sale, a donation, and a patron charge credit the creator's balance and can be cashed out. A Grow or Scale subscription is charged to the subscriber and is not transferred to an Express account. A top-up becomes credit and can be cashed out at the account's cash-out rate, which is the rate for the best plan the account owns.

## Player balance and developer earnings

Players and developers see different pages. A player has a [Balance](https://blazium.games/settings/wallet) page with the credit from top-ups and refunds, the amount they can spend, and a list of transactions. A player has no earnings, no pending balance, no payouts and no cash-out, and the player MCP server has no payout tools.

A developer account also has an [Earnings](https://blazium.games/dashboard/earnings) page (`/dashboard/earnings`). It holds the pending and available balances, the payout methods, cash-out, and the cash-out history. The Earnings link shows in the account menu once developer mode is on. Someone who is not a developer and opens that address is sent to Balance.

Together the two pages show these balances:

| Balance | Where it comes from | Spend it | Cash it out |
| --- | --- | --- | --- |
| **Credit from a top-up** | Card or USDC top-ups | Yes | Yes, at the account's cash-out rate |
| **Credit from a refund** | Refunds of purchases paid from the balance | Yes | No |
| **Pending** | Your sales that can still be refunded | No | No |
| **Available** | Sales past the refund window, 7 days after the sale | Yes | Yes, from $25, once the refund window ends |

When you buy from your balance, credit is used first, then available earnings.

Pending earnings become available 7 days after the sale, when the refund window closes. Playtime can end the buyer's right to a refund sooner, but it never releases earnings early. Sale earnings can be cashed out once that refund window ends. A top-up can be cashed out at the account's cash-out rate, which is the rate for the best plan the account owns.

If a balance goes negative, for example because a top-up was refunded or disputed, the debt is repaid from your other balance first. Until then it is subtracted from what you can spend and cash out.

Balance lists every purchase, top-up and refund. Earnings lists sales, donations and cash-outs.

## Set up payouts

A project cannot charge money until its owner has a way to collect it. Any one of these is enough: Stripe payouts that are ready, PayPal turned on with an email, or crypto turned on with an address. A price of 0 stays allowed. An existing paid price stays in place and can still be bought. The owner cannot change it to another paid price, turn donations on, add a paid edition, or add a paid patron tier until transfers are active.

## Payout methods

On Earnings a developer chooses how to be paid:

| Method | Setup | How long it can take |
| --- | --- | --- |
| **Stripe** | Stripe-hosted onboarding on a United States account. Cash-outs go to the Express account | Processed on weekdays from 8:00am to 5:00pm Pacific |
| **PayPal** | Turn on **PayPal payouts** and save the PayPal email the money is sent to | Up to **14 business days** |
| **Crypto (USDC)** | Turn on **Crypto payments** (off by default) and save a Base or Solana address | Up to **28 business days** |

A saved PayPal email with PayPal on, or a saved address with crypto on, satisfies the payment requirement the same way a ready Stripe account does. Turn a method off and it stops counting. A cash-out names a method, or uses the account's default. PayPal and crypto cash-outs show a due date. Staff send a PayPal cash-out by hand, and a crypto cash-out is sent as USDC.

Stripe cash-outs are paid through [Stripe Connect](https://stripe.com/connect) Express. Stripe is available for United States accounts. PayPal and crypto do not use Stripe.

## Set up Stripe payouts

1. The owner verifies their email.
2. On Earnings, with USD or USDC selected, choose **Set up payouts with Stripe**. That creates the Express account if needed and opens Stripe-hosted onboarding in a new tab. Identity, tax, and bank details are entered there. Return and refresh land on Earnings.
3. Until payouts are ready, Earnings says to finish setup, or that Stripe is still reviewing after it has accepted the details and transfers are not active yet. **Continue payout setup** opens the hosted form again.
4. When transfers are active, Earnings shows **Open Stripe payout dashboard** and **Cash out**. The Express dashboard is where the creator sees the payout to their bank. Blazium pays Stripe's processing fees and is responsible for a negative balance.

An agent can send you to Earnings. You open Stripe from that page. See [Agent payouts](#agent-payouts).

## Cash out

A creator cashes out available earnings of $25 or more. Sale earnings can be cashed out once that sale's refund window ends, 7 days after the sale. Playtime does not release them sooner. The cash-out fee is 8% + $0.25 on Free, 7% + $0.25 on Grow, or 6% + $0.25 on Scale, from the best plan the account owns, in addition to the $0.25 + 8% kept on the sale. The transfer goes only to the Express account on that same account.

| You cash out | Free fee | Free transferred | Grow fee | Grow transferred | Scale fee | Scale transferred |
| --- | --- | --- | --- | --- | --- | --- |
| $25.00 | $2.25 | $22.75 | $2.00 | $23.00 | $1.75 | $23.25 |
| $100.00 | $8.25 | $91.75 | $7.25 | $92.75 | $6.25 | $93.75 |

Payouts are processed on weekdays from 8:00am to 5:00pm Pacific. Stripe verification, tax-form holds, or a Stripe review can add time after a payout is sent. A refund or dispute stays on Blazium's balance. Stripe does not reverse a transfer that was already sent.

## USDC

On Earnings you can choose USD or USDC. **Set up payouts with Stripe** stays on the page for both. USD is paid through the Express account and is limited to United States accounts. USDC does not use Stripe. It is only paid once **Crypto payments** is on (it is off by default) with an address saved, and a USDC cash-out can take up to 28 business days. It uses the same email check, the same $25 minimum, and the same plan cash-out fee. The net is converted to USDC one-for-one and capped at 10,000 USDC per cash-out. A larger request is refused.

USDC needs a Base address (`0x` and 40 hex characters) or a Solana address. A new address is checked before anything is sent. Changing the address starts that check over. The address cannot change while a cash-out is pending or while the check is still open. Payouts are processed on weekdays from 8:00am to 5:00pm Pacific. Each cash-out can send at most 10,000 USDC.

A USDC cash-out also pays an estimate of the network fee for the chain you chose (Base or Solana). The quote shows it as a separate line next to the platform fee, and it comes out of the amount sent: you receive the cash-out amount minus the platform fee (8%, 7%, or 6% plus $0.25 by plan) minus the network estimate. The estimate is set per chain and can be zero. If the send fails, the cash-out is held and retried after 3, 6, 12, 24, and 48 hours. If it still fails, the amount minus the platform fee returns to your balance.

If a transfer fails or is reversed, the cash-out amount and the fee return to your available balance.

## Agent payouts

Payouts belong to a developer account, so they are on the developer MCP server only. The player server has no payout tools, and a player token that calls a payout route gets `4034`.

- Wallet access means a developer token with `mcp:write` or `mcp:money`. Read-only and single-project tokens can't.
- `start_payout_setup` and `get_payout_dashboard_link` return the Earnings page. You open Stripe from **Set up payouts with Stripe**. Identity, tax, and bank details are entered on Stripe only after you open that page, never through the agent.
- `get_payout_methods` reads the Stripe, PayPal and crypto state. `set_paypal_payouts` and `set_crypto_payouts` turn PayPal or crypto on and save the email or address. Each of those changes asks you first.
- `cash_out` sends available earnings to the payout method you chose on that same account. The same $25 minimum and the account's plan fee apply. The fee is 8% + $0.25 on Free, 7% + $0.25 on Grow, or 6% + $0.25 on Scale, from the best plan the account owns. Every agent cash-out waits for you. Money can't be sent anywhere else.
- We email you after every cash-out an agent makes, with the amount and the agent's name.
- Your email must be verified first.

To stop an agent, revoke its key or disconnect it in [MCP settings](https://blazium.games/settings/mcp). See [Permissions](../legal/permissions.md#agent-payouts).

## Chargebacks

If a buyer disputes a card payment, the license is revoked and that sale's earnings are held back from your balance. If the dispute is won, they are restored.

## Partial refunds

If support refunds part of a card payment, the buyer keeps the game and your earnings from that sale shrink in proportion. The Blazium Games fee shrinks the same way.
