# Player server tools

Server: `https://mcp.blazium.games/player`. Scopes: `player:read`, `player:write`, `player:buy`.

## Tools

| Tool | Scope | Purpose |
|------|-------|---------|
| `get_account` | read | Email verification, balances, and what the account may do |
| `request_email_code` | write | Email a verification code to the human |
| `verify_email` | write | Verify the email with the human's code |
| `get_wallet` | read | Balances plus fee and refund rules |
| `list_wallet_transactions` | read | Ledger entries, newest first |
| `get_payment_options` | read | Card and x402 USDC top-up options with fees |
| `create_top_up_link` | buy | Card Checkout link for the human |
| `create_x402_top_up` | buy | x402 payment requirements for a USDC top-up |
| `pay_with_x402` | buy | Submit the signed x402 payment |
| `quote_purchase` | read | Price, tax, and total |
| `purchase_game` | buy | Buy a license from the balance |
| `donate_to_game` | buy | Donate to a free game from the balance |
| `get_approval` | read | State of an approval |
| `confirm_approval` | write | Approve with the human's emailed code |
| `get_library` | read | Owned games, refund windows, play time |
| `get_download_link` | read | 5-minute signed download URL |
| `get_agent_policy` | read | This agent's spending limit |

## Resources

| URI | Contents |
|-----|----------|
| `blazium-games://me` | Account status |
| `blazium-games://wallet` | Stored balance and payment rules |
| `blazium-games://library` | Owned games and licenses |
