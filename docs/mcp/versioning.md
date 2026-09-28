---
title: Versioning
sidebar_position: 6
description: How Blazium Games MCP servers and the public API change, and how much notice you get before anything is removed.
---

# Versioning

Both MCP servers report their version in `serverInfo.version` and on their server cards. The public API is under `/api/v1`.

## What can change without notice

- New tools, prompts, resources, and API routes
- New optional inputs
- New fields in results and API responses
- New error codes for new situations

Write clients that ignore fields they don't know.

## What needs 30 days' notice

- Removing or renaming a tool, resource, route, input, or result field
- Making an optional input required
- Changing what an existing field or error code means

Anything scheduled for removal is listed under `deprecations` on the server card with its replacement and the earliest removal date, and the tool description starts with "Deprecated here". It keeps working for at least 30 days after it is first listed.

## Current deprecations

| Server | What | Replacement | Removed after |
|---|---|---|---|
| Developer (`/mcp`) | Wallet, top-up, purchase, donation, agent policy, library, and download tools, plus the `wallet` and `library` resources | The same tools on the [player server](./player.md); `list_library` becomes `get_library` | 2026-10-28 |
