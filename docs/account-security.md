---
title: Account security and sign-in
sidebar_position: 6.5
description: Passwords, the second sign-in step, authenticator apps, recovery codes, accepting changed terms, and what to do when a code doesn't arrive.
---

# Account security and sign-in

Signing in to [blazium.games](https://blazium.games) takes two steps: your password, then a second step. The second step is a code from your authenticator app if you set one up, or otherwise a 6-digit code we email you. For email-and-password sign-in without an authenticator, a browser that verified an emailed code is remembered for 30 days and isn't asked again. An authenticator code, and the second step of a GitHub, X, or Discord sign-in, are asked for every time. Signing in with GitHub, X, or Discord works the same way. See [Linked accounts and sign-in](./linked-accounts.md).

## Passwords

- 10 to 128 characters. A password that matches your email or username is refused.
- Passwords that have appeared in known data breaches are refused. Only the first 5 characters of the password's SHA-1 hash leave our servers for that check (the [Have I Been Pwned](https://haveibeenpwned.com/Passwords) range API), never the password itself.
- Change it at [Settings > Password](https://blazium.games/settings/password). If you forget it, use **Forgot password** on the login page.

### Changing or setting a password

1. Open [Settings > Password](https://blazium.games/settings/password).
2. Enter your current password and the new one. If the account has no password yet (some accounts made through GitHub, X, or Discord), the page says **Set a password** and asks only for the new one.
3. Choose **Email me a code**, then enter the 6-digit code we email you, valid for 10 minutes, and choose **Save password**.

Saving signs out every session, including the one you used, so log in again with the new password.

### Resetting a forgotten password

1. On [blazium.games/password/forgot](https://blazium.games/password/forgot), enter your email and choose **Email me a code**.
2. We email a 6-digit password reset code, valid for 10 minutes. Enter it on the same page, or open **Reset your password** in the email, which takes you back to that page with your email filled in.
3. Choose a new password and select **Reset password**. Your other sessions are signed out.

The page answers the same way whether or not the email has an account, so it never reveals who has one. An account that only signed in through GitHub, X, or Discord and never had a password gets a code too; the reset sets its first password. If no code arrives, check your spam folder for mail from noreply@blazium.games, then use **Send a new code**. A code meant for a password reset doesn't work as a sign-in code.

## After you sign in

Before the site opens, you may be asked to finish up to three things, in this order. Each one takes you to [blazium.games/account/finish](https://blazium.games/account/finish), and when you're done you continue to the page you were going to. **Log out instead** is always there if you want to stop.

1. **Accept changed terms.** If the [Terms of Service or Privacy Policy](./legal/index.md) changed since you last accepted them, you'll see a short summary of each change with a link to the full text. Tick the box and choose **Accept and continue**. If the terms change again while the page is open, you'll be asked to review the newer version instead.
2. **Finish setting up your account.** Accounts created through GitHub, X, or Discord before passwords were required choose a username and a password here. If your email isn't verified yet, we email a code to confirm it.
3. **Choose whether to use an authenticator app.** Set one up (see below) or choose **Skip for now**. Either way, your choice is recorded and you won't be asked again. You can set one up later from settings.

Until these are done, the website's account pages answer with the matching error code (see [Error codes](#error-codes)) and send you back to this page. MCP keys and connected agents keep working; they can see which step is open but never finish it for you.

## Authenticator app

An authenticator app (Google Authenticator, Microsoft Authenticator, 1Password, Authy, or any app that supports time-based codes) shows a new 6-digit code every 30 seconds. Once it is set up, sign-in asks for that code after your password.

### Set it up

1. Choose **Set up an authenticator app**, either during sign-in or at [Settings > Authenticator app](https://blazium.games/settings/authenticator). From settings, or if you signed in more than 15 minutes ago, confirm your password first.
2. Scan the QR code with the app, or type in the secret shown under it.
3. Enter the code the app shows and choose **Turn on the authenticator**.
4. Save the 10 **recovery codes**. They are shown only once. Each works once in place of an authenticator code if you lose your phone.

Each new setup shows a new QR code. An earlier one you didn't finish stops working.

### Skipped it? Set it up again

If you chose **Skip for now** (or turned the authenticator off), [Settings > Authenticator app](https://blazium.games/settings/authenticator) shows the date you skipped it and **Set up an authenticator app again**. That shows a new QR code. Confirm it with a code from the app and you get new recovery codes.

### Replace or turn it off

From [Settings > Authenticator app](https://blazium.games/settings/authenticator):

- **Replace the authenticator** (for example, on a new phone) needs your password and a code from the current app. The old app keeps working until you confirm the new one.
- **Turn off the authenticator** needs your password and a code. Sign-in goes back to emailed codes, your recovery codes stop working, and the choice is recorded as skipped.
- **Generate recovery codes** replaces your recovery codes with 10 new ones.

### Phone not with you? Use an emailed code

Wherever an authenticator code is asked for, you can use an emailed code instead:

- **At sign-in:** choose **Email me a code instead** on the authenticator step.
- **In settings:** choose **Email me a code** before replacing or turning off the authenticator.

The code works for 10 minutes. You can ask for another after 30 seconds. A recovery code works too.

## Signed out once

Session cookies are now limited to the exact site that set them (blazium.games, each developer's store page, and the MCP server each have their own). Everyone was signed out once when this changed. Sign in again and the store pages and MCP connections pick up your session as you visit them. The cookies are listed under [Permissions & Scopes > Cookies](./legal/permissions.md#cookies).

## Your timezone

Your timezone sets when daily limits and reports roll over. New accounts take it from your browser. Change it at [Settings](https://blazium.games/settings). Agents connected over MCP can set it with `set_timezone`, using your timezone, never the timezone of the machine they run on.

## Troubleshooting

**The email with my code didn't arrive.** Check spam and any filters for `@blazium.games`. Wait 30 seconds, then ask for another code. Each new code replaces the last one. Delivery is usually under a minute. If it takes longer, check [status.blazium.games](https://status.blazium.games) for an email delay, or contact [support](https://blazium.games/support).

**The authenticator code is refused.** Make sure your phone's clock is set automatically; codes depend on the time. Each code can be used once, so wait for the next one. Or use a recovery code or an emailed code.

**I lost my phone.** Sign in with a recovery code or an emailed code, then replace the authenticator from settings.

**"Too many attempts".** Wait a minute and try again. Sign-in, signup, and code checks are limited per address and per network.

**I keep being sent back to "Finish signing in".** One of the steps above is still open. Finish it or choose **Log out instead**.

## For agents (MCP)

- `get_account` returns `legal_acceptance_required`, `legal_changes`, `setup_required`, `authenticator` (`on`, `skipped`, or `not_chosen`) and `gate` (the next open step, empty when none).
- `get_security_status` returns the authenticator `state`, `enabled_at`, `skipped_at`, `recovery_codes_left`, and `email_code_alternative`. It only reads.
- Agents never accept terms, finish setup, or set up or skip an authenticator for you. When a step is open, they send you to [blazium.games/account/finish](https://blazium.games/account/finish).

See the [MCP reference](./mcp/reference.md).

## Error codes

| Code | HTTP | Meaning |
| --- | --- | --- |
| `4110` | 403 | Accept the changed Terms of Service and Privacy Policy first (`legal_required`) |
| `4111` | 403 | Finish setting up the account first (`setup_required`) |
| `4112` | 403 | Set up an authenticator app or skip it first (`authenticator_choice_required`) |
| `4085` | 400 | The timezone is not a known IANA name |
| `4096` | 403 | Verify your email first |
| `4290` | 429 | Too many requests; wait a minute |

Only website sessions get `4110`, `4111`, and `4112`. Those responses include the open step in `data`, in the same fields as `get_account`.
