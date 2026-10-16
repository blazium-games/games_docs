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

A mint key is 128 characters, named, and shown once. The stored value is a hash. It can mint, set instance stats, socket, unsocket, and use items for players of that game. It cannot edit definitions, sync or transfer to Steam, list, or sell, and it is not a progress key. A player session cannot do those things. The game owner or an accepted admin can, on routes that name the player.

## Market

The Items section on a game page lists other players' listings, one page at a time. The lowest price is $0.03 and the highest is $100,000. At $0.03 the split is one cent for Blazium, one cent for the game, and one cent for the seller. Above that, Blazium keeps 5% and the game keeps 10%, and each of those two shares is at least one cent. A $10 sale pays Blazium $0.50, the game $1.00, and the seller $8.50. Games cannot change that. The buyer pays from their balance. There is no card charge from the Items section. Seller and game earnings settle from pending to available, then both cash out through the existing payout balance. A seller can cancel a listing that is still pending.

Your Inventory page, next to Library, shows items from games you own and items you bought from games you do not own. Each game name links to that game. Grants on a game you do not own stay off that page until you buy one. Socketed items show their attachments and the added stats. Players cannot use, socket, or unsocket items from the website.

## Game calls

The C SDK and the Godot plugin expose TransferItem. SocketItem, UnsocketItem, SetItemStats, and UseItem return an error and do not call the API. A player can move an item to Steam only: the game has inventory and transfers on, the player holds a license, they have logged in to that game at least once with the linked Steam account, and the definition is already on Steam. `to_platform` is refused. The same request id does not move twice. A failure leaves the item on Blazium Games. An attached item has to be unsocketed by the owner, an accepted admin, or a mint key before it can move or be listed. List commands take `--cursor` and print `next`.
