---
title: Team and keys
sidebar_position: 16
description: Invite admins to help run a project, create deploy keys for uploads, and give out game keys and gift links.
---

# Team and keys

## Admins

Admins can edit the project, upload builds and manage keys. Only the owner can delete the project or change who may use MCP.

### Invite an admin

1. On the edit page, open the **Admins** tab.
2. Enter a username or user ID in **Add an admin**.
3. Click **Add admin**.

Accepting turns on [developer mode](../developer-mode.md) for the person if it isn't on yet.

### Accept an invite

Invites appear at the top of your Dashboard under **Admin invites**, as "Name invited you to help manage Game". Click **Accept** or **Decline**. If developer mode is off, tick **I accept the developer terms** first; accepting then turns it on. After you accept, the project is in your Dashboard list with the **Admin** badge.

### Remove an admin

On the **Admins** tab, click **Remove** next to their name and confirm. This also revokes their MCP key for the project.

## Deploy keys

A deploy key is two values for one project: an access token and a secret. chauffeur and CI need both.

1. Open the **Deploy keys** tab.
2. Click **New deploy key** and confirm. Creating a new deploy key replaces the previous one. Uploads that used the old key stop working.
3. Copy the secret before you leave the page. It is shown once. It cannot be shown again. The access token is `BLAZIUM_ACCESS_TOKEN`, sent as `X-Access-Token`. It stays on the Deploy keys tab. The secret is `BLAZIUM_SECRET_KEY`, sent as `X-Secret-Key`. The short code in the table is the start of the access token and is not enough to upload.

To remove a key, click **Delete** next to it. Uploads that used it stop working. How to upload is covered in [Deploy](../deploy.md).

## Game keys and gift links

Game keys give the game to someone for free, for press, bundles or giveaways. Each code works once.

1. Open the **Game keys** tab.
2. Create a pool: enter a name such as "Press", optionally a campaign, and click **New pool**.
3. To make keys, enter how many (1 to 5000) and click **Create keys**.
4. Download the CSV straight away. It works once and expires after an hour, because codes are stored in a form we can't read back.

For a single person, click **Gift link** instead. You can add a note in **For (optional)**. The link is shown once, so copy it before leaving the page.

The pool table shows how many keys were created and redeemed. Players use keys and links on the [Redeem](./redeem-a-key.md) page.
