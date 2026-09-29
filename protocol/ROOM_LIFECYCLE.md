# Room lifecycle

A room is published as bytes, not as a screenshot location. Its lifecycle separates recoverable upload work from the moment it becomes part of the building.

## Create a draft

`create_room` receives a unique room ID, name, declared layout SHA-256 and voice policy. The program verifies the world administrator or delegated publication authority, derives the Room address, allocates 2,496 bytes and initializes a draft. Width and height are fixed at 80 and 28. A new ID cannot overwrite an existing account.

The room's glyph area starts zeroed, the five-bit received bitmap is clear, and its next transcript sequence is 1. The account is absent from the World registry. The payer covers the actual account-storage minimum and transaction charges; authority and payer need not be the same signer.

## Upload five chunks

`write_chunk` accepts an index from 0 through 4 and exactly 448 bytes. The byte range is `256 + index * 448` through the following 448 bytes in the Room account. Only the room's publication authority may write a draft.

Chunks can arrive out of order. A set bitmap bit cannot be written twice, even with identical bytes; an uploader that loses a response reads the bitmap before retrying. Reject short chunks, oversized chunks, bad indices, non-printable glyphs and any attempt to write outside the fixed layout region. This makes the upload resumable without allowing an already acknowledged part to drift.

The chunk size is deliberately conservative. Solana documentation distinguishes the 1,232-byte legacy/v0 transaction envelope from the 4,096-byte v1 format. SOLILO does not depend on a larger envelope to upload a room. The complete serialized transaction still needs measured size checks with its actual signatures, accounts and instruction overhead; a 448-byte payload alone is not that measurement. [Transaction format](https://solana.com/docs/core/transactions/transaction-structure)

## Seal and register

`seal_room` checks all five bitmap bits, exactly 2,240 printable ASCII bytes and the declared SHA-256. It rejects unexpected flags and validates every account it receives. On success it changes status to active, sets the program-observed seal slot, and appends the Room public key to the next registry slot. Room activation and registry insertion occur in one transaction.

If a new RoomIndex page is required, allocate it in that same bounded operation or pre-create the empty canonical page under program control. The program, rather than the client, chooses the append position. Concurrent seal attempts must resolve through the World count; one retries with the new expected count. A room cannot become active but undiscoverable because a client skipped a second registration call.

After sealing, no instruction can rewrite the name, declared hash or glyphs. A visual change uses a fresh room ID. Draft abandonment can return its storage balance to the defined payer after authority checks, but cancellation cannot close a sealed room.

## Connect rooms

`set_edge` takes a source, one of eight slots, an enabled flag, a destination and an expected source graph version. Both endpoints must belong to the same World and be active when a new link is enabled. The graph editor signs; its authority is separate from the voice publisher.

The program updates the fixed Edge account, source outgoing mask and source graph version together. There is no hidden website-only exit. Edges are directed: a return door needs its own slot. A loop from the Exit back to the Vestibule is valid. Duplicate destinations and self-links should be rejected unless a later version explicitly assigns them a purpose.

A source-room head is a local contention point for edits and speech appends. Reading a World policy does not require making the World writable. Separate room writes can therefore avoid a single global conversation counter, while operations on the same Room are serialized.

## Archive without erasing

`archive_room` stops new speech in the destination and disables navigation into it at the reader policy level. The account, its registry entry and all transcript pages remain allocated. Readers must not follow an enabled edge into an archived target; administrators can subsequently disable stale incoming links. Closing a room means making it quiet, not reclaiming the evidence it held.

Archive is one-way in the first network version. Retention must be backed by program rules and the documented upgrade policy, not only by a user-interface promise. If a future migration changes that rule, it requires explicit disclosure and a new version boundary. See [trust](../docs/TRUST.md).
