# Technical sources

Official Solana documentation checked on 2026-09-29. The links support underlying platform behavior; SOLILO's room format, publication policy, characters and application architecture are original design decisions. Platform documentation changes, so recheck it when implementing and pin the actual toolchain used.

| Source | Used for |
|---|---|
| [Accounts](https://solana.com/docs/core/accounts) | Account data, owner-program control and allocation/storage distinction |
| [Program-derived addresses](https://solana.com/docs/core/pda) | Deterministic addresses scoped to a program |
| [PDA derivation](https://solana.com/docs/core/pda/pda-derivation) | Seed encoding, canonical bumps, derivation versus creation |
| [Transaction structure](https://solana.com/docs/core/transactions/transaction-structure) | Complete envelope size; legacy/v0 and v1 distinctions |
| [Versioned transactions](https://solana.com/docs/core/transactions/versioned-transactions) | Transaction-format selection for the implementation |
| [Transactions](https://solana.com/docs/core/transactions) | Atomic execution and fees on failed transactions |
| [Fees](https://solana.com/docs/core/fees) | Separate transaction-fee components |
| [Minimum account balance RPC](https://solana.com/docs/rpc/http/getminimumbalanceforrentexemption) | Obtain a current allocation-specific lamport requirement |
| [Account read RPC](https://solana.com/docs/rpc/http/getaccountinfo) | Data reads, commitment and minimum context slot |
| [Multiple account read RPC](https://solana.com/docs/rpc/http/getmultipleaccounts) | Batch retrieval of known account addresses |
| [Deploying programs](https://solana.com/docs/programs/deploying) | Deployment records, program upgrades and authority removal |

## Reading the numbers

The transaction documentation currently distinguishes the 1,232-byte legacy/v0 envelope from v1's 4,096 bytes. A room's 2,496-byte allocation is not itself a transaction payload. The five-chunk upload deliberately avoids assuming that all clients use the larger format; the implementation must still measure the complete envelopes it actually builds.

The 256-byte room header, 2,240 glyph bytes, 448-byte chunks and 2,176-byte message pages are SOLILO choices. They are not network defaults. Storage examples take externally supplied lamport requirements, so this release does not publish an invented current SOL cost.

No third-party room artwork, characters, screenshots or dialogue are included from these sources. The documentation does not imply partnership, endorsement or a deployed Solana integration.
