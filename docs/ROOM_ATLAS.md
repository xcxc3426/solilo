# Room atlas

**Every room has an address. Some of them answer.**

SOLILO's world is a small loop with two routes, a cross-connection, and a return that refuses to become a conclusion. Twelve rooms give the three voices different surfaces against which to test the same questions: what counts as memory, what remains after forgetting, and whether a recorded encounter needs agreement from its participants.

The terminal runs an authored, deterministic replay. In the Solana architecture, the actual room glyphs, explicit doors, and published speech are reconstructible from program accounts. The distinction matters: a picture of a room and a URL to it would not make that room's layout independently available from the ledger.

## The route

| ID | Room | Resident voice | Outgoing room IDs | Spatial signature |
|---|---|---|---|---|
| 001 | Vestibule | ECHO | 002, 008 | Deep corridor; offset side doors; the far door says 001 |
| 002 | Switchboard | MOTH | 001, 003, 007 | Cable nest feeding three empty CRT workstations |
| 003 | Stillwater | ECHO | 002, 004 | Dry indoor pool; ladder; one unexplained ripple |
| 004 | Null Chapel | WARDEN | 003, 005 | Eleven chairs face a display with no picture |
| 005 | Cold Archive | WARDEN | 004, 006, 010 | Dense shelving compresses a narrow central passage |
| 006 | Mirrorwell | MOTH | 005, 007 | Opposing mirrors; a full figure and an incomplete reflection |
| 007 | Relay | ECHO | 002, 006, 011 | Twin thresholds joined by an exposed conduit |
| 008 | Soft Floor | MOTH | 001, 009 | Offset tile rows sink around a solitary shape |
| 009 | Ascent | WARDEN | 008, 010 | Two flights change direction while the level stays at one |
| 010 | Reserve | WARDEN | 005, 009, 011 | Closed drawers, service counter, ledger, single lamp |
| 011 | Witness | MOTH | 007, 010, 012 | Two occupants seen through an observation window |
| 012 | Exit | ECHO | 001 | A doorway contains the perspective of the entrance |

All edges are directed. Many pairs happen to provide a return path, but the direction must still be represented explicitly. The last exit leads to Room 001; the earlier room and its record remain the same identity.

## Walkthrough

### 001 / Vestibule

The geometry promises an ordinary hallway. Its signage disagrees. No arrivals are expected, yet the far door carries the starting room's number. The left and right fixtures are deliberately different sizes, making the central vanishing point feel unreliable. ECHO is the resident voice because a familiar phrase is often its first substitute for a map.

### 002 / Switchboard

Three cables terminate at three named consoles. No person sits at any of them. This is where the first replay begins: ECHO hears a door, MOTH asks which side, and WARDEN notices that two replies exist without an initiating question. Room 007 is the other end of this exchange. Its connection is explicit rather than an assumption made by a chat interface.

### 003 / Stillwater

The pool is empty. The concentric marks at its bottom are the scene's contradiction, not animated water. The ladder gives the viewer a scale and a route down, while the depth label refuses measurement. The room stays legible in pure monochrome; no colored effect carries necessary information.

### 004 / Null Chapel

The screen remains blank throughout the room image. The chairs imply an audience without drawing one. Their increasing width and spacing supply depth without a ceiling outline. WARDEN belongs here because a rule can continue to be displayed after its original purpose disappears.

### 005 / Cold Archive

Copies and originals face each other. The instructions say not to sort them. This room is a spatial version of the separation between current working memory and retained publication: material may be absent from the next inference input without disappearing from the canonical record. WARDEN does not grant authority to rewrite earlier speech.

### 006 / Mirrorwell

One mirror contains a body. The other contains only the minimum marks needed to suggest a face. Between them, a narrow passage ends in darkness. The second transcript asks what it would mean for the reflection to answer first. Its inconsistency is authored atmosphere, not a claim that the local terminal runs predictive inference.

### 007 / Relay

Two numbered channels share a visible conduit. A message is routed through a reference to the other room, not through a single global conversation that flattens all locations. This makes the world feel inhabited at more than one point and gives the on-chain dialogue model a practical reason to include cross-room reply references.

### 008 / Soft Floor

Rows of square tiles lose alignment as they approach a central recess. The small central object can read as a marker or as the top of something sinking. Its meaning is deliberately left to the viewer. The warning is stable ASCII text; the selected replay does not modify the layout frame by frame.

### 009 / Ascent

One flight climbs while the other appears to return toward the observer. The sign still reads Level 1. A small resting point interrupts the stair's movement. The geometry belongs to the fixed room image; traversing it changes the selected room only when an explicit exit is followed.

### 010 / Reserve

Storage drawers and a service counter turn allocation into an inhabited place. The inscription, "RESERVE IS NOT REVENUE," separates a room's continuing storage requirements from promises of financial return. The SOL mechanism concerns account allocation and transaction expenses, not a reward for occupying the room. The ledger displayed in the architecture is a record of permitted capacity, not a wallet balance invented for a frame.

### 011 / Witness

Two speakers appear behind the same wide window. The viewer cannot tell which side counts as observation. ECHO speaks from Room 012 while MOTH and WARDEN remain associated with Room 011 in the final exchange. Their room references preserve that distinction even if the interface presents the conversation in adjacent panes.

### 012 / Exit

The nested doorway ends in Room 001. The return changes where the viewer stands, not what the record says happened. The word "exit" is part of the story; it does not imply that the application prevents the user from leaving. There is no automatic transaction when the local viewer follows this route.

## Shared visual constraints

All twelve scenes use exactly 80 columns and 28 rows of printable ASCII. Their canonical layout is 2,240 bytes each. Together, the room glyphs occupy 26,880 bytes before account headers, graph accounts, transcript pages, or registry storage. This is a byte count, not a SOL cost estimate.

The palette and typography are presentation choices around those glyphs. Exported PNG files are rendered terminal frames and are convenient to share; the text data remains the room source. The three portraits likewise consist of literal ASCII, up to 26 columns by 16 rows, and are interface fixtures rather than separate room layouts.

To reproduce the authored world, run `node scripts/generate-world.mjs`. It writes the atlas and all twelve text files from one deterministic source. See [`rooms/README.md`](../rooms/README.md) for byte handling and [`VOICES.md`](VOICES.md) for the dialogue contract.
