---
title: Item inventory
---

# Item inventory

Each copy of an item is its own row with a stable id. A stack is only how plain copies of a stackable item are grouped. A unique item can be minted once, cannot be stackable, and stays unique after it is sold, transferred, or used.

Platform types are melee, ranged, armor, jewelry, shield, consumable, material, blueprint, food, and drink. Steam's item, bundle, generator, and playtimegenerator types stay separate.

## Switches

On the game's Steam tab, after Steam auth is on:

- **Inventory** starts off. Turning it on cannot be undone. Existing items stay.
- **Transfers** stays off until inventory is on. Turning it on cannot be undone. The website cannot move items. The game calls TransferItem.

The API and the developer MCP refuse a later off.

## Editing

The editor Items tab lists the name, icon, total minted, and total still in the wild. Definitions, icons, sets, schema, and mint keys are changed with chauffeur or the developer MCP.

```text
chauffeur items create --itemdef 10 --name Relic --platform-type material --unique
chauffeur items icon --itemdef 10 --file icon.png
chauffeur items schema --mode sync
chauffeur items give --itemdef 10 --quantity 1 --request give-1 --to player
chauffeur mint-key create --name live
```

`schema --mode sync` pulls Steam definitions, lets Steam win on a shared itemdef id, then pushes. `overwrite` pushes and replaces the Steam set. `addon` pushes only definitions that are not on Steam yet. A failed call is stored and does not mark the definition synced. None of these modes move player items.

Give takes one item and one quantity, for one handle or email or a list. An unknown recipient fails only that row. The same request id does not give twice. Give does not call Steam.

## Mint keys

A mint key is 128 characters, named, and shown once. The stored value is a hash. It can mint, set instance stats, socket, and unsocket for players of that game. It cannot edit definitions, sync or transfer to Steam, list, or sell, and it is not a progress key.

## Market

The Items section on a game page lists other players' listings. The buyer pays from their balance. Every sale is 5% to Blazium and 10% to the game owner. A $10 sale pays Blazium $0.50, the game $1.00, and the seller $8.50. Games cannot change that. There is no card charge from the Items section. Both the seller and the game owner cash out through the existing payout balance.

Your Inventory page, next to Library, shows items from games you own and items you bought from games you do not own. Grants on a game you do not own stay off that page until you buy one. Socketed items show their attachments and the added stats. Consumable, food, and drink items have a use button.

## Game calls

The C SDK and the Godot plugin expose TransferItem, SocketItem, UnsocketItem, SetItemStats, and UseItem. Transfer takes item ids, or a stackable itemdef id and a count, plus `to_steam` or `to_platform` and a request id. The same request id does not move twice. A failure puts the ids back. An attached item has to be unsocketed before it can move or be listed.
