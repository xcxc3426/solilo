# Addressing and reconstruction

A logical label such as `ROOM/007` is convenient for the terminal. It is not a public key. In the network implementation, every such room resolves to a program-derived address under one deployed program and one World. Solana PDAs are derived from a program ID and seeds; deriving an address does not create its account. Use the official canonical-bump derivation, then explicitly create and initialize the account through the program. [PDA documentation](https://solana.com/docs/core/pda/pda-derivation)

## Seed grammar

Fixed tags separate account types; integer seeds have fixed widths. Do not serialize an integer as a decimal string in one client and binary in another.

| Account | Seed sequence, before canonical bump |
|---|---|
| World | `"world"`, `world_id[32]` |
| Room | `"room"`, `world_pubkey[32]`, `room_id_u64_le[8]` |
| RoomIndex | `"index"`, `world_pubkey[32]`, `page_index_u32_le[4]` |
| Edge | `"edge"`, `source_room_pubkey[32]`, `edge_slot_u8[1]` |
| MessagePage | `"messages"`, `room_pubkey[32]`, `page_index_u64_le[8]` |

`world_id` is a published 32-byte identifier selected at World creation. Its identity and program ID belong in a deployment manifest. This release deliberately leaves deployment addresses unset; display labels are not fabricated addresses.

Before any mutation, verify account ownership, PDA derivation, discriminator, version, relevant world association and expected length. Checking only the caller-supplied `world` field is insufficient. A lookalike account owned by a different program must fail validation even if its contents look correct.

## Discover the whole building

The registry is part of chain state. It prevents a website or private database from being the only place that knows which rooms exist.

1. Read the World and record its `room_count` and registry revision.
2. Derive `ceil(room_count / 32)` contiguous RoomIndex pages.
3. Fetch every occupied room-address slot. Reject duplicates, gaps or wrong-world entries.
4. Fetch each Room and verify its owner, address and sealed state.
5. Derive the eight possible Edge addresses for each source room; the Room's mask states which slots are enabled.
6. For transcripts, `next_sequence - 1` gives the accepted message count. Derive the necessary MessagePages and decode occupied records.
7. Recheck mutable heads. Retry if a relevant registry, graph or message count changed during reconstruction.

A new room is inserted only by successful sealing. Drafts are intentionally excluded from the public room list, and archiving never removes an entry. The twelve local fixture rooms represent the initial authored building; their presence in JSON is not proof of registration on a cluster.

An indexer can cache and search this state, but a reader must be able to recover current rooms and retained messages without that indexer's proprietary API. Standard account reads expose account data and metadata; batched reads are a transport optimization. [Account reads](https://solana.com/docs/rpc/http/getaccountinfo), [batched reads](https://solana.com/docs/rpc/http/getmultipleaccounts)

## Consistency and availability

Use finalized reads for an archival export and publish the response slots with that export. For a responsive UI, tentative observations can appear earlier with a visibly different state. A successful submission is not the same as finality.

Reads across multiple RPC calls are not an automatic frozen snapshot. `minContextSlot` is a lower bound, not a demand to return a particular historical state. Rechecking revisions makes concurrent changes detectable; a strict whole-world historical snapshot needs an independently specified export/checkpoint procedure. Do not describe a stitched set of current reads as a single historical block image.

Current allocated accounts and historical transaction archives are different services. A public RPC provider can impose rate limits, omit old transaction history, or become unavailable. SOLILO therefore treats funded account retention as the storage guarantee it can design for, and publishes downloadable reconstructions as an additional distribution channel. Those files do not replace canonical room accounts.
