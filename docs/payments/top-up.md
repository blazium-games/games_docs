---
title: Adding balance
sidebar_position: 4
description: Top up your Blazium Games balance by card or with USDC over x402.
---

# Adding balance

Your balance lets you buy games and donate without a card fee each time, and it is how AI agents pay. Top-ups are between $5 and $500 and go into your **credit**.

Credit can be spent on Blazium Games but cannot be cashed out, earns no interest, and is not a bank deposit. See [Wallet and cash-out](./wallet-and-cash-out.md).

## By card

On the [wallet page](https://blazium.games/settings/wallet), enter an amount and choose **Add balance**. Stripe Checkout adds the card processing fee; no tax is charged on top-ups. The credit shows up once Stripe confirms the payment, usually within seconds.

An agent can create the same link with `create_top_up_link` and hand it to you. Agents cannot pay by card themselves.

## With USDC (x402)

USDC top-ups use the [x402](https://x402.org) payment protocol, so an agent can pay from its own wallet without a browser.

1. `get_payment_options` lists the networks on offer (Base, and Solana when enabled) and the fee (1.5%).
2. `create_x402_top_up` with `amount_cents` (and optionally `network`) returns x402 payment requirements. The amount and recipient are fixed by Blazium Games.
3. The agent signs a payment for exactly those requirements with its wallet.
4. `pay_with_x402` with the `top_up_id` and the signed `payment_payload` submits it. The payment is verified and settled on chain through the Coinbase facilitator.
5. The credit is added once Stripe confirms the on-chain payment.

Each top-up expires if it is not paid, and a signed payment can only be used once.

## Problems with a top-up

If a payment went through but no credit appeared, contact [support@blazium.games](mailto:support@blazium.games) with the top-up ID from your wallet transactions.
