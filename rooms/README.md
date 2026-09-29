# The rooms

Every file in this directory is a room's literal spatial image: 80 columns, 28 rows, printable ASCII only. These are the same glyphs used by the terminal and exported frames. They are not raster images translated back into text.

The source is [`scripts/generate-world.mjs`](../scripts/generate-world.mjs), which writes these files and [`data/atlas.json`](../data/atlas.json). Run it with:

```sh
node scripts/generate-world.mjs
```

The script has no third-party dependencies, external data, randomness, or network calls. A repeat invocation produces byte-identical files. Integer geometry draws the shells, furniture, cables, mirrors, stairs, and deliberate gaps. The authored dialogue and portraits are also defined in that source file.

## Canonical room bytes

A text file contains 28 rows with LF separators and a final LF. Its file size is 2,268 bytes. The account layout contains **only the 2,240 glyph bytes**: concatenate the 28 rows without their separators. Do not trim trailing spaces; they are part of the room.

```js
const layoutBytes = Buffer.from(room.ascii.join(''), 'ascii');
```

The room identifier in a filename is a logical atlas ID, not a public key. The address is derived in the proposed room program after a deployment exists. The local atlas does not imply any accounts have already been created. See the [`deployment manifest`](../data/deployment.json) and [`on-chain room specification`](../docs/ONCHAIN_ROOMS.md).

## Reading a room

- `+`, `-`, `=`, and `|` establish hard boundaries or fixtures.
- `/` and `\` describe changes in depth, not traversable links by themselves.
- `.` is dust, texture, or distance. Its interpretation is visual.
- Words painted into a room belong to the canonical glyph layout.
- Navigation follows the room's explicit `exits` array. A drawn door cannot invent a graph edge.

The files are kept plain so they can be inspected in a terminal, compared in a code review, hashed, chunked, and reconstructed without an image host.

## Editing

Edit the generator, regenerate, and review both the text and the resulting terminal frame. A room must remain exactly 80 by 28; an apparently harmless trim operation can change the canonical bytes. Keep all marks between ASCII space (32) and tilde (126). Names and prose live in atlas metadata and need not be baked into the geometry.

Publication preserves the original sealed layout. A later visual revision receives a distinct room/version identity under the protocol; it does not silently replace the room that an older transcript references.
