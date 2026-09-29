---
title: Symbols
sidebar_position: 7
description: Generate Breakpad symbol files for a Blazium or Godot export and upload them with chauffeur so crash reports show function names and lines.
---

# Symbols

A crash dump from a release build only has memory addresses. Breakpad symbol files (`.sym`) map those addresses back to function names, source files and line numbers. Upload them for a build and every crash from that build is stackwalked with them.

Symbols are private. Only the game's owner and admins can list or delete them: on the **Builds** tab (open **Symbols and bundle check** under a build) or with MCP `list_build_symbols` and `delete_build_symbols`. Uploading is only possible with chauffeur and the game's deploy key.

## 1. Build with debug information

The binary you ship can be stripped, but you need the debug information from the same build to make symbols:

- **Windows**: the `.pdb` written next to the `.exe` by an export template built with debug symbols.
- **Linux and Android**: an unstripped binary, or the separate debug file (`.debug`) from `strip --only-keep-debug`.
- **macOS and iOS**: the `.dSYM` bundle.

For Blazium and Godot, use export templates built with debug symbols (for example `debug_symbols=yes`, and `separate_debug_symbols=yes` to keep them out of the shipped binary). Symbols must come from the exact binary you ship; a rebuild of the same source won't match.

## 2. Make .sym files

Use `dump_syms`. Mozilla's version runs on every desktop OS and reads PDB, ELF and Mach-O files:

```bash
cargo install dump_syms
```

```bash
# Windows (from the .pdb or the .exe next to it)
dump_syms MyGame.pdb > symbols/MyGame.sym

# Linux
dump_syms MyGame.x86_64 > symbols/MyGame.sym

# macOS
dump_syms MyGame.app/Contents/MacOS/MyGame.dSYM > symbols/MyGame.sym
```

Each file must start with a Breakpad `MODULE` line, like `MODULE windows x86_64 3F2A...1 MyGame.pdb`. chauffeur checks this before uploading.

## 3. Upload

After `chauffeur build` or `chauffeur addfiles` prints the `build_id`:

```bash
chauffeur symbols --build-id "$BLAZIUM_GAMES_BUILD_ID" symbols/
```

The path can be one `.sym` file, a folder (searched recursively for `.sym` files, which chauffeur zips for you), or a `.zip` of `.sym` files.

You can also upload them in the same run as the build, with `--symbols symbols/` on `build` (single platform) or `addfiles`, or `symbols:` in the YAML file.

MCP `upload_symbols_info` returns the exact command for a build, and the Builds tab shows it too.

## Limits

| Limit | Value |
|-------|-------|
| One `.sym` file | 512 MB |
| Files per upload | 200 |
| Unzipped size per upload | 2 GB |
| Upload size | 1 GB |
| Uploads per game | 30 per hour |
| Symbol OS | `windows`, `linux`, `mac`, `ios`, `android` (from the `MODULE` line) |

Uploading a symbol file with the same module and debug id again replaces it.

## Errors

| Code | Meaning |
|------|---------|
| `4038` / `4039` | The `build_id` is missing, or isn't a build of this deploy key's game |
| `4043` | A file or the upload is over its size limit |
| `4049` | Not a Breakpad `.sym` file (no `MODULE` line), an unsupported OS, or a `.zip` with something else inside |
| `4290` | Too many symbol uploads this hour |

## Delete

On the Builds tab, open **Symbols and bundle check** under the build and use **Delete** or **Delete all symbols**. Over MCP, `delete_build_symbols` removes one file when you pass a `symbol_uid`, or all of the build's files without one.
