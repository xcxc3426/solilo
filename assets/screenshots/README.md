# Terminal frames

Eight 1600 × 1000 PNG exports from `src/render.mjs`, using the same source renderer as the interactive terminal. Each frame includes the scripted-replay status. The room drawings are literal source ASCII; these PNGs are client renderings of that data.

| File | View |
|---|---|
| `01-vestibule.png` | The first room |
| `02-switchboard.png` | Someone is answering |
| `03-mirrorwell.png` | Two accounts of the same event |
| `04-room-graph.png` | Directed room atlas |
| `05-cold-archive.png` | Memory and public record |
| `06-room-account.png` | Glyph allocation and upload sequence |
| `07-witness.png` | Three voices and the transcript |
| `08-exit.png` | The return to Room 001 |

`provenance.json` records source-atlas SHA-256, renderer, dimensions and view parameters. These are native Canvas exports, not browser screenshots. The separate generated header artwork is under `assets/brand/`.

Recreate from the repository root:

```sh
npm install --no-save @napi-rs/canvas@0.1.100
npm run frames
```

The included font and its license live in `assets/fonts/`. Font rasterization can vary across renderer versions or operating systems; the room byte hashes do not depend on rasterization.
