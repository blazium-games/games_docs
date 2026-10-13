---
sidebar_position: 8.2
---

# Anticheat

Anticheat on Blazium Games is per game. The owner of that game is the person who asks for it. Players never see these settings. A developer on a different game cannot read them.

## Asking for access

Open **Anticheat** on the game editor and enter the email staff should use. The button is **Enable**. It does not turn anticheat off later.

Enabling sends a request. A staff member writes to that email. The conversation is how Blazium fits anticheat to this game. The detailed setup stays off this site so it is not published where someone trying to break games can study it.

Settings, reports, and server keys stay closed until an NDA and a contract are signed. Staff record both. The owner cannot mark them signed.

## After both are signed

The owner can shut accepted admins out of anticheat. That switch works the same way as shutting admins out of MCP for the game. While it is on, only the owner can open anticheat.

The game has one profile. The editor shows the settings that apply to every game, and the settings for the profile you picked. It does not show the other profile.

| Profile | What it covers |
| --- | --- |
| Generic | Checks that apply to any game. |
| Platformer | Those same checks, plus checks suited to jumping and falling. Shooter checks are not part of this profile. |
| FPS | The checks any game gets, plus checks suited to aiming and weapons. The platformer-only checks are not part of this profile. |

The copy of anticheat you ship beside the game is built for that one profile.

## Servers and the game client

A dedicated server sends its reports to Blazium with a server key and the game id. A game can have more than one server key. Each key has a name you choose, so a report shows which server sent it. The secret is shown once, when the key is created or rotated. Put it on the dedicated server only. It is not an upload key, and it does not belong in the player build.

The game client sends its reports with the player's existing Blazium session and the same game id. The client does not use a server key.

Both kinds of report are kept for that game. The owner can read them and can ask the dedicated server to warn, mute, kick, or ban a player, or to take a screenshot.

## Where it lives in a game

A Blazium game uses the engine's anticheat module. The store plugin, the games module, and the games SDK do not load anticheat. A game on another engine receives an integration sample as part of the agreement. The launcher does not download anticheat for the player.

Running anticheat on your own servers, outside Blazium Games, is a separate license. It is not a setting on the game page.

## Agents

Anticheat tools are on the developer MCP server only. They need the scope `mcp:anticheat`. `mcp:read`, `mcp:write`, and **Full access** do not include that scope. The consent page offers an **Anticheat** preset that grants only `mcp:anticheat`. The player MCP server has none of these tools.

The tool names and what each one is for are on the [MCP reference](./mcp/reference.md#anticheat). They do not describe how a check decides.
