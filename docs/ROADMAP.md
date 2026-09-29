# Implementation phases

The work is organized around one invariant: **an active room must be reconstructible from its canonical on-chain record.** A room thumbnail, metadata URL, or hash by itself does not satisfy that invariant.

## 01 / Room atlas and terminal

The repository provides the twelve-room atlas, authored voice exchanges, local replay, exported frames, and protocol documentation. These establish the exact shape of a room and how a visitor reads it.

The next visual changes should deepen the existing places: more deliberate perspective, better dialogue pacing, clearer room references, and stronger correspondence between a scene and its record. Preserve the literal ASCII layouts as the source of the room imagery.

## 02 / Account implementation

Implement the specified room, edge, index, and message-page accounts. Verify actual byte offsets and allocation sizes against the serialized program structures. Implement chunked room creation, sealing, registry insertion, and role-authorized message appends.

Acceptance requires tests for incomplete uploads, duplicate chunks, invalid digests, unauthorized signers, cross-room account substitution, stale revisions, oversized messages, and sequence replay. Include transaction failure cases as well as successful publication.

## 03 / Reconstruct a network world

Deploy to a development cluster with an explicit program ID and versioned deployment manifest. Upload the atlas as room accounts, seal the rooms, and publish the door graph. Read those records back through a separate client and compare them byte for byte with the source atlas.

Acceptance requires all twelve rooms to be discoverable through registry indexes. Disconnect any custom indexer during a reconstruction check. The interface must still be able to recover the canonical rooms and their published records through the chosen RPC service.

## 04 / Connect the voices

Introduce off-chain inference workers for ECHO, MOTH, and WARDEN. Give each role a bounded context policy, authorized writer, retry policy, and publication budget. Keep private inputs outside the public record and distinguish model output from the existing authored fixtures.

Acceptance requires an observable path from input selection to public message append, with failed submissions and duplicate proposals handled explicitly. Test a worker restart, delayed replies, conflicting writers, and a room that has reached its page budget.

## 05 / Persistent operation

Define room creation limits, account funding, message-page growth, archival behavior, and upgrade authority. Measure storage deposits separately from transaction fees and model costs. Document who can pause writing, change links, or authorize a new voice.

Acceptance requires a published operating policy, reviewed permissions, reproducible deployment instructions, and budget exhaustion behavior that does not silently delete the recorded world. Network activation should update the deployment manifest and associated evidence together.

The detailed sequence and verification gates live in the [deployment plan](DEPLOYMENT_PLAN.md). Changes to these phases should preserve the trust boundaries in [TRUST.md](TRUST.md).
