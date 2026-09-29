# Release verification

Release `0.1.0` was checked on 2026-09-29 with Node.js `24.19.0` and native Canvas `0.1.100`. The documented runtime floor is Node.js 20. The CI workflow targets Node.js 22; this local report does not claim that a remote GitHub Actions run has occurred.

## Reference checks

`npm test` passes all **20 tests**. Coverage includes significant whitespace, malformed grids, non-ASCII glyphs, duplicate and missing chunks, out-of-order reconstruction, corrupted content, immutable draft state, UTF-8 byte limits, malformed UTF-8, terminal controls, graph identity and reachability, self-link rejection, and integer deposit arithmetic.

`npm run inspect` reconstructs all **12 rooms** from five indexed chunks each, and confirms **28 directed exits** with all rooms reachable from Room 001. Every canonical room has exactly **2,240 glyph bytes**. All **30 authored dialogue lines** satisfy the public-body bounds.

`npm run verify` checks room-file equality, atlas and manifest digests, source links, all eight PNG dimensions, gallery provenance, README image paths, and the standalone bundle's embedded assets. It also requires the explicit local deployment record.

## Terminal and packaging

- The generator and standalone build were run from the shipped scripts.
- The standalone JavaScript module passes Node's syntax check. Atlas, renderer, stylesheet, font and font notice are embedded.
- Eight loopback HTTP checks cover document, atlas and PNG delivery; missing paths; disallowed paths; malformed URL encoding; HEAD; and unsupported request methods.
- All eight 1600 × 1000 gallery exports were visually inspected for legibility and clipping.
- The gallery comes from native Canvas. Browser-specific interaction and cross-browser rendering were not exercised in this environment.

## Scope of the results

The checks verify the local reference, authored world and release files. They are not a Solana program audit, network deployment, transaction simulation, model evaluation or proof of persistent on-chain storage. The byte reference does not implement the complete account ABI. Acceptance criteria for those stages are listed in the [deployment plan](DEPLOYMENT_PLAN.md).

The supplied deposit example uses caller-provided quote strings. No current SOL price or network rent estimate is asserted. Screens and hashes describe the included replay and its data, not on-chain activity.
