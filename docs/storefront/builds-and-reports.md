---
title: Builds and reports
sidebar_position: 17
description: Manage release channels, roll back a build, read launch health, and use the analytics, crash and sales pages for a project.
---

# Builds and reports

## Builds

Builds are uploaded with a [deploy key](./team-and-keys.md#deploy-keys), from your CI or the [chauffeur CLI](../cli/index.md). The website doesn't take uploads. See [Deploy](../deploy.md).

Every upload is scanned for viruses. The **Builds** tab lists each build with its version, platform, channel, scan result and launch health.

### Release channels

A clean upload moves its channel forward:

- **stable** is what every player gets.
- **beta** is shown to players who join the beta.
- **dev** is only for you and your admins.

To change what a channel offers:

- **Promote**: pick a build, a channel and how many hours until it expires (0 means never), then click **Promote**.
- **Roll back**: returns a channel to its previous build. Players stop seeing the current one, but it isn't deleted.

**Delete** removes a build's files, so players can no longer download it.

Each build can also have debug symbols, uploaded with the chauffeur CLI, and a check for store assets bundled inside it. Open **Symbols and bundle check** under a build. Crash reports are covered in [Crash reporting](../crash-reporting.md).

### Launch health

Launch health shows how reliably the current build starts for players, based on the last 30 days:

| Badge | Meaning |
|---|---|
| **Launches reliably** | At least 98% of launches reached the game, and at most 1% crashed on start. |
| **Launches well** | At least 93% reached the game, and at most 3% crashed on start. |
| **Mixed launch reports** | At least 80% reached the game, and at most 10% crashed on start. |
| **Launch problems reported** | Many launches crashed or never reached the game. |
| **Not enough launch data** | Fewer than 20 players launched the current build. |

Players see it on the store page, and games with launch problems are marked in Browse.

## Analytics

Open **Analytics** from the project's Dashboard card or the bar at the top of the edit page. For the last 30 days it shows visitors, views, actions, countries and downloads. **Download JSON** saves the numbers.

The downloads section splits downloads by where they came from, how players had access, which client they used, and why downloads were refused. See [Download analytics](../download-analytics.md).

**All analytics** on the Dashboard adds up every project.

## Crashes

**Crashes** lists reports from builds that include the crash reporter, with the severity, platform, version and message. **Dump**, **Log** and **Stack trace** download the files; each link works for an hour. See [Crash reporting](../crash-reporting.md).

## Sales

**Sales** shows sales and donations, gross revenue, platform fees and your earnings, then a list of each sale. Earnings become available after the refund window ends. Refunded and disputed sales are counted separately. See [Selling](../payments/selling.md) and [Wallet and cash out](../payments/wallet-and-cash-out.md).
