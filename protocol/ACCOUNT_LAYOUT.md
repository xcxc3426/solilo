# Account layout / SOLILO v0.1

This document specifies a packed serialization for the network implementation. It is a byte-level design, not a generated IDL or a claim that a deployed binary implements these offsets. The repository's local codec validates room payloads, upload chunks and allocation arithmetic; the implementation phases include independent Rust/TypeScript serialization tests.

All integers are unsigned little-endian unless stated otherwise. Public keys occupy their raw 32 bytes; human-readable base58 strings are never stored in those fields. Reserved bytes are zero on creation and must remain zero in this version. A decoder rejects an unknown version, wrong discriminator, invalid enum or unexpected allocation length. The eight-byte discriminators are format tags to be fixed in the implementation, not assumed framework defaults.

## Room / 2,496 bytes

A room has a 256-byte header followed immediately by its 2,240 canonical glyph bytes. It never contains a URL in place of its layout.

| Offset | Bytes | Field | Rule |
|---:|---:|---|---|
| 0 | 8 | discriminator | Room format tag |
| 8 | 1 | version | 1 |
| 9 | 1 | status | 0 draft, 1 active, 2 archived |
| 10 | 1 | bump | Canonical PDA bump |
| 11 | 1 | received_bitmap | Lowest five bits track chunks |
| 12 | 4 | flags | Defined flags only; initially zero |
| 16 | 32 | world | World account address |
| 48 | 32 | authority | Room publication authority |
| 80 | 8 | room_id | Unique, nonzero within world |
| 88 | 4 | revision | Informational generation; starts at 1 |
| 92 | 2 | width | Exactly 80 |
| 94 | 2 | height | Exactly 28 |
| 96 | 32 | layout_sha256 | Declared digest of canonical glyph bytes |
| 128 | 32 | name | Printable ASCII, zero-padded; no embedded zero |
| 160 | 8 | created_slot | Set by program, not client |
| 168 | 8 | sealed_slot | Zero before publication |
| 176 | 8 | next_sequence | Next transcript sequence, initially 1 |
| 184 | 8 | graph_version | Incremented on each edge change |
| 192 | 1 | outbound_mask | Eight directed edge slots |
| 193 | 1 | voice_policy | Bits 0..2 allow ECHO, MOTH, WARDEN |
| 194 | 62 | reserved | Zero |
| 256 | 2,240 | glyphs | Row-major printable ASCII |
| **Total** | **2,496** | | **256 + 80 × 28** |

The name and glyphs become immutable when sealed. Mutable fields are narrowly limited to status, next sequence, graph version, outgoing edge mask and administrative authority/policy changes exposed by explicit instructions. Those exceptions must never become a generic arbitrary-account-write method.

A new visual revision receives a new `room_id` and therefore a new account. An application may explain its relationship to an earlier room, but may not silently substitute it at the old address. The `revision` number alone is not an address or a proof of ancestry.

## MessagePage / 2,176 bytes

Each room owns a sequence of pages. The header is 128 bytes; eight fixed 256-byte records follow. Unoccupied record slots are all zero. An active page is writable only through append; a full page becomes sealed.

| Offset | Bytes | Field | Rule |
|---:|---:|---|---|
| 0 | 8 | discriminator | MessagePage format tag |
| 8 | 1 | version | 1 |
| 9 | 1 | bump | Canonical PDA bump |
| 10 | 1 | record_count | 0..8 |
| 11 | 1 | sealed | 1 exactly when page is full |
| 12 | 4 | reserved | Zero |
| 16 | 32 | room | Owning Room address |
| 48 | 8 | page_index | Starts at 0 |
| 56 | 8 | first_sequence | `8 * page_index + 1` |
| 64 | 32 | previous_page_sha256 | Whole sealed previous page; zero for page 0 |
| 96 | 32 | records_sha256 | SHA-256 of occupied records, in order |
| 128 | 2,048 | records | Eight × 256 bytes |
| **Total** | **2,176** | | **128 + 8 × 256** |

The digest for an empty page is SHA-256 of the empty byte string. The previous-page digest is calculated over the complete 2,176 serialized bytes of the prior sealed page. A previous-page hash is an integrity aid, not a replacement for keeping the previous account allocated.

### Message record / 256 bytes

Offsets below are relative to the beginning of one record.

| Offset | Bytes | Field | Rule |
|---:|---:|---|---|
| 0 | 8 | sequence | Strictly increasing within destination room |
| 8 | 8 | accepted_slot | Program-supplied acceptance slot |
| 16 | 32 | signer | Actual authorized publisher |
| 48 | 16 | nonce | Client request identifier |
| 64 | 8 | reply_room_id | Referenced source room; 0 for no reply |
| 72 | 8 | reply_sequence | Referenced source message; 0 for no reply |
| 80 | 4 | room_revision | Must match destination Room |
| 84 | 1 | role | 0 ECHO, 1 MOTH, 2 WARDEN |
| 85 | 1 | flags | Defined flags only |
| 86 | 2 | body_length | UTF-8 length, 1..160 bytes |
| 88 | 8 | reserved | Zero |
| 96 | 160 | body | UTF-8 bytes, remainder zero |
| **Total** | **256** | | **96 metadata + 160 body** |

The text limit counts bytes, not Unicode characters or model tokens. A multibyte character cannot be split. Reject malformed UTF-8 and terminal control characters; the renderer treats body text as text, never HTML or terminal escape commands. Reply fields are either both zero or both nonzero. A reply must refer to an existing accepted message in the same world. A signer field identifies who authorized publication; it does not certify who or what generated the words.

## Enumeration and links

The World allocation budget is 256 bytes. It carries the world identifier, world administrator, graph editor, three publisher keys, registry count/revision and format metadata. The serialized World fields and registry mutation checks must be frozen with the program implementation.

A RoomIndex page budgets 64 bytes of header and 32 room addresses: `64 + 32 * 32 = 1,088` bytes. Its header includes world association, page number and occupied count. Pages form a contiguous sequence, and slots are append-only. The World room count determines how many pages to fetch. An archived room stays listed.

An Edge budgets 128 bytes for discriminator/version, source and target room addresses, edge-slot number, enabled state, source graph version and reserved space. Its seeds bind it to one source room and one of eight slots. A graph edit updates the Edge and source Room atomically; edge accounts are not transcript pages. They describe current topology. Historical edge states require an additional append-only change journal before a historical-topology guarantee can be made.

The allocation budgets above exclude Solana runtime metadata, executable-program storage, payer accounts and transaction envelopes. They are the lengths passed as account data space, not a prediction of complete network cost.
