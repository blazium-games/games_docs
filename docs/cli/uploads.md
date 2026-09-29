---
title: Uploads
sidebar_position: 5
description: How chauffeur sends build files, resumes interrupted uploads, and what happens to a file after it arrives.
---

# Uploads

## Single and chunked uploads

`chauffeur addfiles` zips the listed files and computes the zip's SHA-256 checksum. Then:

- **Up to 64 MB**: one streamed request.
- **Over 64 MB**: an upload session, sent in 16 MB chunks.

Either way chauffeur streams from disk, so memory use stays flat even for a 5 GB file.

In a session, each chunk that fails because of a dropped connection, a rate limit (`429`) or a server error (`5xx`) is retried with exponential backoff, up to 5 tries. If the server says the chunk doesn't continue the upload (`409`), chauffeur resumes from the position the server reports. A session stays open for 6 hours; after that, run the command again.

## Limits

| Limit | Value |
|-------|-------|
| Build file | `.zip` only, up to 5 GB |
| Uploads per game | 60 per hour |
| Chunks per game | 5,000 per hour |
| Open upload sessions per game | 8 |
| Symbol uploads per game | 30 per hour; see [Symbols](./symbols.md) for sizes |
| Store images | See [Store images](./media.md) |

Past a rate limit the API returns `4290` or `4291`. chauffeur retries within a chunk, then stops with exit code `2`; wait and run it again.

## Checksums

chauffeur sends the checksum with the upload, and the server recomputes it from the bytes it received. A mismatch (`4046`) means the file changed during the upload or was corrupted on the way. chauffeur doesn't retry it, because sending the same bytes again won't help.

## After the upload

1. The file is stored privately and queued for a virus scan. Its state is `pending`, then `scanning`.
2. A `clean` file becomes downloadable, and the build's channel moves to it if it's newer. Players see a scan badge on the download button.
3. An `infected` file, or one whose scan fails with an `error`, is removed and listed under **Rejected uploads** on the Builds tab for 30 days.

The Builds tab on the website, `chauffeur builds list`, and MCP `scan_status` all show the scan state. Every file also records how it was uploaded (the first characters of the deploy key, or the website) and its scan history. Anyone can read that record at `GET /api/v1/public/games/{game_uid}/files/{file_uid}/provenance`.

The server also reads the zip's list of files, which powers the [bundle check](../listings.md#bundle-check).
