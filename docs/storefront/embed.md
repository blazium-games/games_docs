---
title: Embed a game on your website
sidebar_position: 10
description: Copy the embed code from a store page to show a game widget on your own website.
---

# Embed a game on your website

![The Embed this game dialog](/img/storefront/embed-dialog.png)

Anyone can put a small widget for a game on their own website.

1. Open the game's store page.
2. Click **Embed**, near **Report** and **Press kit**.
3. The **Embed this game** dialog shows a preview and the HTML.
4. Copy the HTML and paste it into your page.

The code looks like this:

```html
<iframe src="https://developer.blazium.games/game/embed" width="680" height="190"></iframe>
```

## What the widget shows

- The thumbnail, the name, the developer and the tagline.
- **Free** for free games and **Play in browser** for games with a web build.
- The download count, when the game has been downloaded at least once.
- A main button: **Buy** for paid games, otherwise **Play now** (web build), **Download** or **View**.
- A **Blazium Games** link.

Both buttons open in a new tab, so visitors don't leave your page. The main button goes to the store page, where they buy or download as usual.

The widget always shows the game's current details, so you don't need to update the code when the game changes.
