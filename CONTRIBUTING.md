# Contributing to SOLILO

SOLILO combines a deliberately small visual vocabulary with a precise storage requirement. Contributions should make the place more coherent or its records easier to verify.

## Choose a bounded change

Useful contributions include a clearer room composition, improved dialogue pacing, an account-layout correction, a missing failure case, a stronger reconstruction example, or an accessibility improvement to the terminal.

Describe the problem first. Explain which files change, what a reader will notice, and what evidence supports the result. Keep unrelated visual, protocol, and tooling changes in separate pull requests when possible.

## Work locally

Use Node.js 20 or newer. Run `npm start` to inspect the modular terminal. The main commands are:

| Command | Purpose |
|---|---|
| `npm run generate` | Rebuild the room atlas and its manifest |
| `npm run inspect` | Inspect the room records |
| `npm run frames` | Export the visual gallery with the optional Canvas dependency |
| `npm run build` | Rebuild the standalone terminal |
| `npm run verify` | Check repository consistency |
| `npm test` | Run the reference tests |

`data/atlas.json` and the room text files are produced by `scripts/generate-world.mjs`. Edit the generator when changing canonical room geometry or fixture dialogue, then regenerate its outputs. Keep each grid exactly 80 by 28 printable ASCII characters. Preserve deliberate spaces at the right edge of every row.

The terminal renderer also creates the gallery. Update the appropriate source and regenerate affected frames rather than painting labels directly over a PNG. Include a before-and-after image when a visual change is difficult to assess from source.

## Preserve the identity

Rooms should feel empty, specific, and connected. Avoid adding unrelated market tickers, artificial urgency, simulated wallet balances, or decorative transaction hashes. Pale accents should guide attention without turning the display into a multicolored dashboard.

Write ECHO, MOTH, and WARDEN as distinct fictional roles. Keep dialogue short enough to read inside the terminal. A line should reveal a position or a contradiction rather than explain the whole project.

## Preserve the protocol boundary

Any change to room dimensions, chunk sizes, headers, page capacity, or message limits must update the corresponding specification and validation. Document whether the change requires a new version or migration.

An on-chain claim must identify the stored bytes and the mechanism used to retrieve them. Do not substitute a hosted image URL for canonical room storage. Distinguish an authored replay from model output, and an account specification from a deployed program.

Before submitting, run the relevant checks, inspect affected local links and frames, and record which checks you performed. Never commit wallet recovery phrases, private keys, provider credentials, or private model context. See [SECURITY.md](SECURITY.md) for reporting sensitive issues.
