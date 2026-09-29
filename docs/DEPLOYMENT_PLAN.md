# Network implementation phases

The current release establishes the authored building, terminal presentation, byte codec and protocol specification. Its deployment manifest has no program ID or cluster. The following gates turn that specification into a network-backed installation; they are acceptance criteria, not completed deployment claims.

## 1. Freeze serialization

Select the Solana program framework and pinned toolchain. Freeze account discriminators, World and Edge layouts, instruction encodings and canonical PDA derivation. Implement independent Rust and TypeScript codecs with shared golden byte fixtures. Assert every allocation and offset rather than relying on host-language struct alignment.

Test malformed inputs, integer overflow, unexpected versions, unknown flags, wrong account owners and noncanonical bumps. Confirm five 448-byte uploads reconstruct exactly the local 2,240-byte room. Measure complete serialized transactions, including realistic signers and account lists, against the chosen transaction format.

## 2. Implement room publication locally

On a local validator, create a World, stage all twelve rooms, seal and enumerate them exclusively from account state. Test interrupted uploads, out-of-order chunks, duplicate writes, mismatched hashes and concurrent registry insertion. Verify that failed operations do not partially activate a room.

Implement Edge slots and graph version guards. Create the authored graph and show that an independent decoder rebuilds the same paths. Exercise archiving, stale edges and new-address visual revisions. Test every route that could close, reallocate or overwrite a sealed account.

## 3. Implement public speech

Add role authorization, fixed MessagePages, sequence checks, reply validation and bounded publication quotas. Cover page rollover, duplicate retry handling, two publishers competing for a sequence, key rotation and unavailable source references. Compare the stored bodies byte for byte with accepted inputs.

Build the off-chain publisher with a separate signing boundary. Start with authored lines before connecting a model so failures can be reproduced. Then add the model worker, explicit public-output selection, pacing and spend caps. Record model configuration separately from claims about what the chain verifies.

## 4. Publish a devnet installation

Obtain fresh allocation and transaction estimates. Deploy the reviewed binary to devnet with a disclosed upgrade authority. Record the real program ID, World address, toolchain, source revision, binary digest, authority policy and cluster in a deployment manifest.

Publish all twelve rooms and their registry entries, then fetch them through an independent RPC reader. Export the accepted account data and demonstrate reconstruction without the original terminal server. Report measured fees and storage balances as observations for that installation, not permanent prices.

## 5. Establish operating evidence

Run publisher-failure drills, RPC outage handling, pause/resume tests and archival exports. Have an independent reviewer assess the program's mutation and funding paths. Document unresolved findings. Network and model services should be independently stoppable without destroying rooms.

Any mainnet rollout requires a separate bounded funding decision, finalized authority policy and explicit deployment record. Removing an upgrade authority is a consequential irreversible step; the build should never do it automatically. The static replay remains useful as a deterministic reference after a network client exists.
