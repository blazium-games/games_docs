---
title: Developer mode
sidebar_position: 1.5
description: Turn on developer mode to create projects, join project teams, and use deploy keys and the developer MCP server.
---

# Developer mode

Every Blazium Games account can play, buy, review, and use the [player MCP](./mcp/player.md). Publishing needs **developer mode**, which you turn on once in your account settings by accepting the developer terms.

## Turn it on

1. Open [Settings](https://blazium.games/settings#developer) and find **Developer mode**.
2. Read the [developer terms](https://blazium.games/terms-of-service#13-developer-terms) and tick the box to accept them.
3. Click **Turn on developer mode**.

The header menu then shows **Dashboard** and **Analytics**, and [New project](https://blazium.games/new) opens the project form. Without developer mode the menu shows **Publish your games** instead, which links to this setting.

Accounts that already owned a project, helped run one as an admin, or held a developer MCP key on September 30, 2026 were switched on automatically. Settings asks them to accept the current terms with **Accept the new terms**, and shows **Turn off developer mode** only after that.

## What needs it

| Action | Without developer mode |
|---|---|
| Creating a project (website, `create_game`, or `POST /api/v1/private/games`) | `4105` |
| Accepting an invite to help run a project | `4105` |
| Creating or rotating a project's deploy keys | `4105` |
| Creating or rotating developer MCP keys, project MCP keys, and signing in to the [developer MCP server](./mcp/index.md) | `4105` |

`4105` is HTTP 403 with `data.error` set to `developer_mode_required` and `data.developer_terms_version` set to the current terms version.

## Turn it off

Click **Turn off developer mode** in the same place. It is refused with `4107` while you own a project or help run one: transfer or delete your projects and leave the teams you help run first. Your earnings and past sales stay on your account.

## Terms versions

The current developer terms are version `2026-09-30`. The version you accepted is stored with your account. When the terms change, Settings asks you to accept the new version with **Accept the new terms**. Turning developer mode on without accepting the current version returns `4106`.

## API

`POST /api/v1/private/account/developer` with `{"enabled": true, "accept_terms": true}` turns it on, and `{"enabled": false}` turns it off. It returns `developer`, `developer_enabled_at`, `developer_terms_version` (what you accepted), and `current_developer_terms_version`. It only works with a website session; MCP tokens are refused.
