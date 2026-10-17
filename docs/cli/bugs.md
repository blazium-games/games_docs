---
title: Bug reports
sidebar_position: 8
description: List a game's bug reports with chauffeur and save the screenshot and the log.
---

# Bug reports

`chauffeur bugs` uses the game's deploy key. It lists that game's tickets and can save the screenshot and the full log. It cannot change a ticket's status, and it cannot read crash dumps.

```bash
chauffeur bugs
chauffeur bugs --status open
chauffeur bugs --page 2
chauffeur bugs screenshot bug_123 --out shot.png
chauffeur bugs log bug_123 --out game.log
chauffeur bugs pull bug_123 --dir ./bugs
```

`--json` prints the list. With no `--page`, chauffeur follows `next_page` until the list ends. The log command walks every page and writes one file. The screenshot command downloads the image bytes. `pull` writes both when they exist.

MCP does not download these files. `request_bug_screenshot` returns a one-hour link, and `get_bug_log` returns one page of at most 16 KiB. See [In-game bug reporter](../bug-reporter.md).
