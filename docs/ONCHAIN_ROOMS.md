# Every room has an address

SOLILO's network architecture gives every room an account on Solana. The defining property is that the account contains the room's actual character grid. A web server can disappear and a reader can still reconstruct the room from its retained account data.

The release's terminal is a local scripted replay. The network deployment state is recorded in [deployment.json](../data/deployment.json); it is not deployed. The pages below define the storage and verification rules for the network implementation.

## What a room contains

An 80-column, 28-row room uses 2,240 printable ASCII bytes. The stored representation is row-major, with no newline delimiters. A 256-byte header makes each Room allocation 2,496 bytes. Readers split the glyph region every 80 bytes to recover all 28 rows. Trailing spaces are meaningful: trimming them changes the room.

The SHA-256 in the header lets a reader check those same stored bytes. It is an additional integrity check, not the room's only on-chain content. A URL, image hash or NFT metadata pointer would not meet this requirement.

The atlas and `.txt` files are human-friendly views of the same room geometry. Line endings belong to those file formats. The encoder validates the entire shape, strips the line delimiters and rejects characters outside printable ASCII. This bounded format makes literal full-room storage feasible without large image uploads.

## What lives where

| Layer | Canonical network storage | Purpose |
|---|---|---|
| Room geometry | Room glyph bytes | Reconstruct the exact character grid |
| Room identity and state | Room header | Address, publication status and transcript head |
| Building membership | World + RoomIndex pages | Discover every published room |
| Doors | Edge accounts | Reconstruct the current directed graph |
| Published dialogue | MessagePage records | Read the actual words and reply references |
| Model generation | Off-chain worker | Produce a candidate public utterance |
| Working memory selection | Worker policy in initial implementation | Choose context for the next generation |
| Fonts, portraits, window borders and glow | Reader assets | Present the state visually |

The chain holds the rooms and selected public outputs. It does not contain model weights or run the inference step. Different clients may draw different chrome while rendering the same canonical room glyphs. A pixel-perfect screenshot includes presentation assets that are not the room itself.

## Twelve rooms, one machine

The initial atlas moves from the Vestibule through the Switchboard, Stillwater, Null Chapel, Cold Archive, Mirrorwell, Relay, Soft Floor, Ascent, Reserve, Witness and Exit. Each becomes its own Room account in the network deployment. There is no special server-only entrance room or decorative room omitted from the registry.

ECHO recalls. MOTH doubts. WARDEN keeps the public record. A response can arrive from a different room and carry a verifiable reference to the line it answers. The terminal makes that separation visible: place, voice and message identity are three different pieces of state.

The glyph grid cannot be edited after publication. Doors and message heads have explicitly mutable fields. A redesign creates another room address while leaving the original bytes available. An archived room stays in the index and remains readable, but accepts no further speech.

## Prove a room exists

A network reader needs a published program ID, World address and cluster. From that root it enumerates RoomIndex pages, validates each Room account's owner and derivation, verifies the glyph hash, follows Edge accounts and reads the retained transcript pages. A JSON file and a screenshot are not substitutes for those account checks.

The release uses logical labels such as `ROOM/003` because there are no deployment public keys to display. Once network publication is implemented, the terminal should show the cluster, address, accepted state and verification result next to that label. Never create plausible-looking addresses merely to fill the screen.

Read the [packed layout](../protocol/ACCOUNT_LAYOUT.md), [addressing rules](../protocol/ADDRESSING.md), [publication lifecycle](../protocol/ROOM_LIFECYCLE.md) and [speech rules](../protocol/SPEECH_AND_MEMORY.md) for the exact boundaries. [Trust](TRUST.md) describes the conditions behind the retention promise.
