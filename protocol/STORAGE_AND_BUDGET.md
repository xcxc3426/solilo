# Storage and budget

SOL pays for network operations. SOLILO has no required custom token in this architecture. Keeping rooms readable, publishing speech and operating a model are three different expenses and must remain separate in the interface.

## Allocation ledger

| Category | Data bytes per account | Count rule |
|---|---:|---|
| World | 256 budget | One per building |
| RoomIndex | 1,088 budget | `ceil(rooms / 32)` |
| Room | 2,496 | One per published room, plus outstanding drafts |
| Edge | 128 budget | One per initialized directed slot |
| MessagePage | 2,176 | Sum of `ceil(messages_in_room / 8)` |

The twelve authored rooms require 29,952 room-data bytes. That number is not a SOL cost and excludes indexes, edges, transcripts, executable code and every other account category. Empty rooms need not allocate transcript pages. The first accepted message creates its first page; exhausted pages remain funded.

Obtain each account category's minimum balance by calling `getMinimumBalanceForRentExemption` with its actual allocation length on the selected cluster. Record the RPC response and quote time. Multiply category-specific lamport amounts by the actual count using integer arithmetic; do not use one approximate “price per room” for the entire installation. [RPC method](https://solana.com/docs/rpc/http/getminimumbalanceforrentexemption)

The local budget example takes supplied lamport figures; it does not query a network or establish current prices. Use integer lamports internally, sum before formatting and show SOL only as a display unit. A stored minimum balance is separate from transaction charges and is recoverable only where account-closing rules permit. The retention policy intentionally prevents closing sealed room and transcript accounts, so their deposits are not a withdrawable visitor balance.

## Transaction and inference charges

Transaction charges depend on the actual message and execution policy, including signatures and any priority fee. A failed transaction can still consume fees. Estimate and simulate the real instruction set before funding an operation; do not present an average from a screenshot as a guaranteed per-message price. [Fees](https://solana.com/docs/core/fees), [transaction behavior](https://solana.com/docs/core/transactions)

Model inference is paid to the selected service or local compute operator outside the room program. A funded room does not automatically obtain a language model, and additional SOL does not make the conversation more correct. The first implementation uses an operator-controlled signer and explicit spend caps rather than granting a model unrestricted wallet access.

## Bounded operation

Set a per-room publication quota, total page ceiling and operator fee budget. When a quota is exhausted, stop publication and display a paused state. Do not rotate through old pages, silently shorten the chain, or call a hash-only archive equivalent to the full retained dialogue.

An optional sponsor flow can let a wallet pay for a specific new account allocation. The program must bind the donation to its stated action, cap any charge, expose the recipient and prevent the sponsor from gaining voice or graph authority. General tipping and model-service funding need separately disclosed custody and withdrawal rules. Neither is implemented by the offline terminal.

Storage sponsorship buys no yield, ownership share or promise of future value. A room address is an account address, not inherently a transferable NFT. If transferable control is ever introduced, it needs a distinct policy for which powers transfer and which archival guarantees remain fixed.
