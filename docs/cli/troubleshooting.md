---
title: Troubleshooting
sidebar_position: 9
description: chauffeur error codes, exit codes, and fixes for common upload problems.
---

# Troubleshooting

chauffeur prints the API's error code with a hint, for example:

```text
API error [4041]: Invalid os
  hint: os, arch, channel, checksum or filename is invalid. os: windows, macos, linux, android, ios, web; ...
```

With `--json` the same information is in `code`, `error` and `hint`.

## Exit codes

| Code | Meaning | What to do |
|------|---------|------------|
| `1` | Usage or validation error; nothing was sent | Fix the flag or YAML value named in the message |
| `2` | The API rejected the request | Look up the code below |
| `3` | Network error after retries | Check connectivity and proxies, then run it again |

## Error codes

| Code | Cause | Fix |
|------|-------|-----|
| `4020` / `4021` | The access token or secret didn't reach the API | Set `BLAZIUM_ACCESS_TOKEN` and `BLAZIUM_SECRET_KEY` in the step that runs chauffeur |
| `4022` / `4023` | The deploy key wasn't found, or was revoked by a newer key | Issue a new key and update your secrets |
| `4025` | The deploy key was rejected: wrong, or replaced by a newer key | Check `BLAZIUM_ACCESS_TOKEN` and `BLAZIUM_SECRET_KEY`, or issue a new key and update your secrets |
| `4026` | A build field is missing or too long | `version` up to 32 characters, `title` 255, `description` 10,000, `changelog` 100 items, `demo_url` an http(s) URL up to 255, `engine_version` like `4.3` |
| `4037` | The upload form couldn't be read | Update chauffeur; the file must come after the form fields |
| `4038` / `4039` | The build is missing or belongs to another game | Pass the `build_id` printed by `chauffeur build` for this game |
| `4041` | Invalid `os`, `arch`, `channel`, checksum or file name | See [platform values](./configuration.md#platform-values); build files must be `.zip` |
| `4043` | Too large | 5 GB per build file, 512 MB per symbol file, 1 GB per symbol upload |
| `4044` | A chunk doesn't continue the upload, or the server couldn't write it | chauffeur resumes from the server's position on its own; if it keeps failing, run the command again |
| `4045` | The upload session expired (6 hours) or wasn't found | chauffeur opens a new session and uploads the file again, up to 3 times; if it still fails, run the command again |
| `4046` | Checksum mismatch | Make sure nothing writes to the files during the upload, then retry |
| `4047` | Another chunk of the same upload is still in progress | Don't run the same upload twice at once; retry when the first finishes |
| `4049` | Not a Breakpad `.sym` file, or a `.zip` with other files | See [Symbols](./symbols.md) |
| `4096` | The game owner's email isn't verified | Verify it at [blazium.games/settings/verify](https://blazium.games/settings/verify) |
| `4150` to `4154` | Store image problems | See [Store images](./media.md#errors) |
| `4166` | A `builds list` filter is invalid | Use the values in [platform values](./configuration.md#platform-values) |
| `4290` | Rate limited | Wait, then run it again. See [limits](./uploads.md#limits) |
| `4291` | Too many open upload sessions (8) | Wait for one to finish or expire |
| `5xx` | Server error | chauffeur retries chunks with backoff; if it still fails, try again later |

## Common problems

**`the deploy key secret is missing`.** `BLAZIUM_SECRET_KEY` isn't set in this shell or CI step. In GitHub Actions, secrets aren't available to workflows from forks.

**The release notes disappeared after `addfiles`.** Older versions of chauffeur registered the build again, which replaced its notes. Update chauffeur, and make sure `build.yml` and `addfiles.yml` use the same `version`, `type`, `os`, `arch` and `channel`.

**`os "darwin" is not supported`.** Update chauffeur; `darwin`, `amd64` and `aarch64` are accepted as `macos`, `x86_64` and `arm64`.

**Uploads through a proxy.** chauffeur honours `HTTPS_PROXY` and `NO_PROXY`. A proxy that buffers whole requests may time out on large chunks; exempt `uploader.blazium.online` if you can.

**An upload failed while the upload service was being updated.** Chunked upload sessions survive restarts of the service. chauffeur retries failed chunks with backoff and carries on from where the server stopped, so a large upload usually finishes on its own. If it gave up, run the same command again.

**A file stays `pending` or `scanning`.** Scans usually finish within minutes, longer for multi-GB files. Check the Builds tab or `chauffeur builds list`. An `infected` or `error` result removes the file and lists it under **Rejected uploads**.

**macOS says the binary can't be opened.** Run `xattr -d com.apple.quarantine chauffeur`.

**Windows SmartScreen warns about the binary.** Choose **More info** and **Run anyway**, or download it with PowerShell as shown in [Install](./index.md#install).
