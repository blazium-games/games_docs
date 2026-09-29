---
title: Store images
sidebar_position: 6
description: Upload and arrange a game's cover, thumbnail and gallery with chauffeur media.
---

# Store images

`chauffeur media` manages the store page images of the game that owns the deploy key. The website's Settings and Images tabs can also change them.

## Image rules

| Rule | Value |
|------|-------|
| Formats | PNG, JPEG, GIF, WebP. The type is read from the file's contents, not its extension |
| Size | 512 to 2048 pixels per side |
| File size | Up to 10 MB |
| Gallery | Up to 20 images; up to 10 per `media add` |
| Changes | Up to 60 image changes per game per hour |

chauffeur checks the format and size locally before uploading.

A public listing needs a cover, a thumbnail and at least 4 gallery images to pass the [listing check](../listings.md#listing-check).

## Commands

```bash
chauffeur media list                         # cover, thumbnail and gallery with uids
chauffeur media cover art/cover.png          # replace the cover
chauffeur media thumbnail art/thumb.png      # replace the thumbnail
chauffeur media add shot1.png shot2.png      # append to the gallery
chauffeur media add hero.png --position 0    # insert first; the rest shift down
chauffeur media move <image-uid> --to 2      # move one image
chauffeur media order <uid-3> <uid-1> <uid-2>   # set the whole order
chauffeur media delete <image-uid>           # remove a gallery image
chauffeur media delete thumbnail             # clear the thumbnail (not on public listings)
```

`media order` must list every gallery uid exactly once (`4154` otherwise). Positions start at 0.

## Replace, don't delete, on public listings

A public listing can't clear its cover or thumbnail (`4153`). Upload a replacement with `media cover` or `media thumbnail` instead. Gallery images can be deleted, but a public listing with fewer than 4 fails the listing check. It then stays public for a grace period before becoming link-only.

## From build.yml

`chauffeur build` can set images at the same time as a release:

```yaml
asset:
  media:
    cover: art/cover.png
    thumbnail: art/thumbnail.png
    gallery:
      - art/shot1.png
      - art/shot2.png
```

The cover and thumbnail replace the current ones; gallery images are appended.

## Errors

| Code | Meaning |
|------|---------|
| `4150` | Invalid request; `kind` must be `cover`, `thumbnail` or `gallery` |
| `4151` | Not a PNG, JPEG, GIF or WebP, outside 512 to 2048 px, or over 10 MB |
| `4152` | The gallery already has 20 images; delete one first |
| `4153` | A public listing needs its cover and thumbnail; replace them instead |
| `4154` | The order doesn't list every gallery uid exactly once |
| `4290` | Too many image changes this hour |
