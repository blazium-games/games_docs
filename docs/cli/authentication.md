---
title: Authentication
sidebar_position: 2
description: How chauffeur authenticates with a game's deploy key, where it reads the key from, and how to rotate it.
---

# Authentication

chauffeur uses the game's **deploy key**: an `access_token` and `secret_key` pair that can upload to one game and nothing else. It sends them as the `X-Access-Token` and `X-Secret-Key` headers, over HTTPS only.

## Deploy keys and MCP keys

| | Deploy key | MCP key |
|---|---|---|
| Used by | chauffeur, CI, the upload API | Agents through the MCP server |
| Scope | Upload builds, symbols and store images for one game; read that game's info and builds | Manage store pages, read analytics and crashes, and more, depending on scopes |
| Can upload files | Yes | No |
| Issued on | The game's edit page, **Deploy keys** tab, or MCP `request_deploy_key` | Settings, or MCP `request_mcp_key` |

An MCP key can't upload, and a deploy key can't change the store page's text, price or channels.

## Where chauffeur reads the key

Flags win over environment variables, and environment variables win over the defaults.

| Setting | Flag | Environment variable | Default |
|---------|------|----------------------|---------|
| Access token | `--access` | `BLAZIUM_ACCESS_TOKEN` | none |
| Secret key | `--secret-stdin` or `--secret` | `BLAZIUM_SECRET_KEY` | none |
| API URL | `--url` | `BLAZIUM_API_URL` | `https://api.blazium.online/api/v1` |
| Upload URL | `--upload` | `BLAZIUM_UPLOAD_URL` | `https://uploader.blazium.online/api/v1` |

Service URLs must use `https` (plain `http` is allowed only for `localhost`) and can't contain a user name or password.

### Passing the secret

- **Environment variable** (recommended in CI): set `BLAZIUM_SECRET_KEY` from your CI's secret store.
- **stdin**: `--secret-stdin` reads the first line of stdin, which keeps the secret out of the process list and shell history:

  ```bash
  pass show blazium/deploy-secret | chauffeur --secret-stdin info
  ```

- **`--secret`**: works, but any user on the machine can read command-line arguments, so chauffeur prints a warning. Avoid it on shared machines and in CI logs.

chauffeur never prints the secret, including in error messages and `--json` output.

## Rotating the key

Issue a new deploy key on the **Deploy keys** tab or with MCP `request_deploy_key`. The new key replaces every previous deploy key for that game at once, so update your CI secrets right away. Over MCP, rotation waits for the owner's approval by email.

Rotate the key if it may have leaked, when someone with access leaves the project, or on a schedule.

## Checking a key

```bash
chauffeur info
```

prints the game the key belongs to, its store URL, what still blocks a public listing, and the upload limits. A rejected key exits with code `2` and error `4025`.

The game owner's email must be verified before uploads are accepted (`4096`).
