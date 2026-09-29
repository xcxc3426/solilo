# Terminal replay

The replay is the local way to walk through SOLILO's visual language and room records. It uses authored dialogue, makes no network requests for room state, and requires no wallet. Every exported frame carries the same `SCRIPTED REPLAY` status as the application.

## Open the terminal

Open the standalone `SOLILO.html` file in a modern desktop browser. Keep the extracted repository if you also want to inspect the room files, protocol documents, and source code.

For the modular application, use Node.js 20 or newer and run the following from the repository root:

```sh
npm start
```

Open `http://127.0.0.1:4329` or the local address printed by the server. The server exists to deliver repository files to your browser. It does not expose a hosted SOLILO world or connect to Solana. The replay, server, and reference checks have no runtime package dependencies.

## Reading the views

| Frame | What to inspect |
|---|---|
| Vestibule | The entry room and the scale of its empty corridor |
| Switchboard | Speaker attribution and the passage of dialogue between rooms |
| Mirrorwell | Two ASCII portraits and their opposing accounts of the same event |
| Room graph | Directed exits and the route back to Room 001 |
| Cold Archive | The difference between selected memory and preserved records |
| Room account | The canonical glyph payload and account allocation specification |
| Witness | The relationship between a statement, a question, and its record |
| Exit | A final threshold leading back into the atlas |

Select a numbered view, or use **PREV** and **NEXT** to move between the eight compositions. The **Room** selector changes the displayed room in Vestibule, Mirrorwell, Cold Archive, Room Account, and Exit. It does not rewrite the source-room IDs attached to a fixed dialogue.

The **Dialogue step** slider reveals authored lines in Switchboard, Mirrorwell, Cold Archive, and Witness. Moving it does not request new model output. The visible speaker and source-room labels are part of the record, not decorative status indicators. **EXPORT PNG** saves the selected composition as an image.

## Inspect the source of a scene

1. Find the room's entry in `data/atlas.json`.
2. Compare its `ascii` rows with the matching file in `rooms/`.
3. Read its `exits` list to identify the allowed directed destinations.
4. Find the dialogue's sequence, speaker, room reference, and body text.
5. Compare those values with the rendered panel.

Each room grid is 80 columns by 28 rows. Line delimiters make the text files comfortable to read; the canonical layout payload is the 2,240 printable characters without those delimiters.

## Gallery provenance

`assets/screenshots/` contains the eight exported terminal frames. They are produced from the atlas through the shared renderer. Recreating the images requires the documented native Canvas development dependency and the included font.

```sh
npm run frames
```

The exporter uses `@napi-rs/canvas` version `0.1.100`. This is an optional development dependency for image export; it is not needed to open the terminal or inspect its records.

Read the gallery images as captured states of the replay. They do not prove that a transaction was submitted, a room was deployed, or a model generated the quoted exchange. Network status comes from `data/deployment.json`.

If text looks too small, increase the browser zoom or open a PNG at its native dimensions. ASCII alignment depends on a monospace font and intact whitespace. Do not paste a room through an editor that automatically wraps lines or trims its padding.
