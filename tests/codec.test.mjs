import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  canonicalRoomBytes, decodeRoomBytes, sha256Hex, splitRoomChunks, createRoomDraft,
  writeRoomChunk, sealRoom, reconstructRoom, encodeMessageBody, decodeMessageBody,
  validateRoomGraph, estimateDeposits, formatSol,
  ROOM_GLYPH_BYTES, ROOM_ACCOUNT_BYTES, MESSAGE_PAGE_BYTES,
} from '../src/codec.mjs';

const atlas = JSON.parse(await readFile(new URL('../data/atlas.json', import.meta.url), 'utf8'));
const rows = atlas.rooms[0].ascii;
const canonical = canonicalRoomBytes(rows);
const digest = sha256Hex(canonical);
const chunks = splitRoomChunks(canonical);
const throwsCode = (fn, code) => assert.throws(fn, error => error.code === code);
const copyGraph = () => atlas.rooms.map(room => ({ id: room.id, exits: [...room.exits] }));

test('all 12 room files preserve exact glyphs and significant trailing spaces', async () => {
  assert.equal(atlas.rooms.length, 12);
  assert.deepEqual(atlas.rooms.map(room => room.id), Array.from({ length: 12 }, (_, i) => i + 1));
  for (const room of atlas.rooms) {
    const path = `../rooms/${String(room.id).padStart(3, '0')}-${room.slug}.txt`;
    const file = await readFile(new URL(path, import.meta.url), 'utf8');
    const bytes = canonicalRoomBytes(file);
    assert.equal(bytes.length, 2240);
    assert.deepEqual(bytes, canonicalRoomBytes(room.ascii));
    assert.deepEqual(decodeRoomBytes(bytes), room.ascii);
  }
});

test('canonical bytes omit LF delimiters but preserve every space', () => {
  assert.deepEqual(canonicalRoomBytes(rows.join('\n')), canonical);
  assert.deepEqual(canonicalRoomBytes(`${rows.join('\n')}\n`), canonical);
  const blank = Array(28).fill(' '.repeat(80));
  assert.equal(canonicalRoomBytes(blank).length, 2240);
  assert.ok(canonicalRoomBytes(blank).every(byte => byte === 32));
});

test('bad geometry and extra delimiters fail instead of being silently padded or trimmed', () => {
  throwsCode(() => canonicalRoomBytes(rows.slice(1)), 'ROW_COUNT');
  throwsCode(() => canonicalRoomBytes([rows[0].slice(1), ...rows.slice(1)]), 'ROW_WIDTH');
  throwsCode(() => canonicalRoomBytes(`${rows.join('\n')}\n\n`), 'ROW_COUNT');
  throwsCode(() => canonicalRoomBytes(rows.join('\r\n')), 'ROW_WIDTH');
});

test('room input rejects tabs, non-ASCII glyphs and invalid byte arrays', () => {
  for (const char of ['\t', 'é', '\x7f']) {
    throwsCode(() => canonicalRoomBytes([char + rows[0].slice(1), ...rows.slice(1)]), 'NON_ASCII_GLYPH');
  }
  throwsCode(() => decodeRoomBytes(Buffer.alloc(2240)), 'NON_ASCII_GLYPH');
  throwsCode(() => decodeRoomBytes(Buffer.alloc(2239)), 'GLYPH_LENGTH');
  throwsCode(() => decodeRoomBytes('not bytes'), 'BYTES_REQUIRED');
});

test('chunks cover canonical offsets exactly and round-trip in arbitrary arrival order', () => {
  assert.deepEqual(chunks.map(chunk => chunk.offset), [0, 448, 896, 1344, 1792]);
  assert.ok(chunks.every(chunk => chunk.bytes.length === 448));
  const restored = reconstructRoom([chunks[4], chunks[1], chunks[3], chunks[0], chunks[2]], digest);
  assert.deepEqual(restored.bytes, canonical);
  assert.deepEqual(restored.rows, rows);
});

test('duplicate writes reject even when the second payload is identical', () => {
  const draft = writeRoomChunk(createRoomDraft(digest), 0, chunks[0].bytes);
  throwsCode(() => writeRoomChunk(draft, 0, chunks[0].bytes), 'DUPLICATE_CHUNK');
  throwsCode(() => reconstructRoom([...chunks, chunks[0]], digest), 'DUPLICATE_CHUNK');
});

test('missing chunks and invalid upload bounds cannot be sealed', () => {
  throwsCode(() => reconstructRoom(chunks.slice(0, 4), digest), 'MISSING_CHUNK');
  const draft = createRoomDraft(digest);
  for (const index of [-1, 5, 0.5, '0']) throwsCode(() => writeRoomChunk(draft, index, chunks[0].bytes), 'CHUNK_INDEX');
  throwsCode(() => writeRoomChunk(draft, 0, Buffer.alloc(447, 32)), 'CHUNK_LENGTH');
  throwsCode(() => writeRoomChunk(draft, 0, Buffer.alloc(449, 32)), 'CHUNK_LENGTH');
});

test('incorrect index assignment and one changed printable byte fail the whole-room hash', () => {
  const swapped = chunks.map(chunk => ({ ...chunk }));
  [swapped[0].index, swapped[1].index] = [1, 0];
  throwsCode(() => reconstructRoom(swapped, digest), 'HASH_MISMATCH');
  const changed = chunks.map(chunk => ({ ...chunk, bytes: Buffer.from(chunk.bytes) }));
  changed[2].bytes[0] = changed[2].bytes[0] === 32 ? 33 : 32;
  throwsCode(() => reconstructRoom(changed, digest), 'HASH_MISMATCH');
  throwsCode(() => reconstructRoom(chunks, '0'.repeat(64)), 'HASH_MISMATCH');
});

test('upload state is immutable and sealed rooms refuse further writes', () => {
  let draft = createRoomDraft(digest);
  const first = draft;
  const input = Buffer.from(chunks[0].bytes);
  draft = writeRoomChunk(draft, 0, input);
  input.fill(35);
  assert.equal(first.receivedMask, 0);
  assert.equal(draft.receivedMask, 1);
  assert.equal(draft.chunks[0], chunks[0].bytes.toString('hex'));
  assert.ok(Object.isFrozen(draft));
  assert.ok(Object.isFrozen(draft.chunks));
  for (const chunk of chunks.slice(1)) draft = writeRoomChunk(draft, chunk.index, chunk.bytes);
  const sealed = sealRoom(draft);
  assert.equal(sealed.layoutHash, digest);
  throwsCode(() => writeRoomChunk(sealed, 0, chunks[0].bytes), 'NOT_DRAFT');
  throwsCode(() => sealRoom({ ...draft, receivedMask: 0 }), 'DRAFT_BITMAP');
});

test('hashes and draft records are validated before reconstruction', () => {
  throwsCode(() => createRoomDraft('not a digest'), 'DIGEST_FORMAT');
  throwsCode(() => createRoomDraft(digest.toUpperCase()), 'DIGEST_FORMAT');
  throwsCode(() => sealRoom({ status: 'draft', expectedHash: digest, chunks: [], receivedMask: 0 }), 'DRAFT_SHAPE');
  throwsCode(() => reconstructRoom([null], digest), 'CHUNK_SHAPE');
});

test('message boundaries use UTF-8 bytes, including multi-byte characters', () => {
  assert.equal(encodeMessageBody('x'.repeat(160)).byteLength, 160);
  assert.equal(encodeMessageBody('🜁'.repeat(40)).byteLength, 160);
  assert.equal(encodeMessageBody('é'.repeat(80)).byteLength, 160);
  throwsCode(() => encodeMessageBody('🜁'.repeat(41)), 'MESSAGE_LENGTH');
  throwsCode(() => encodeMessageBody('x'.repeat(161)), 'MESSAGE_LENGTH');
  throwsCode(() => encodeMessageBody(''), 'MESSAGE_LENGTH');
  throwsCode(() => encodeMessageBody('\ud800'), 'INVALID_UNICODE');
  for (const control of ['\x00', '\n', '\t', '\x1b', '\x7f', '\u009b']) {
    throwsCode(() => encodeMessageBody(`text${control}`), 'MESSAGE_CONTROL');
  }
});

test('message decoding rejects malformed UTF-8 and nonzero unused padding', () => {
  const text = 'I remember the door. Do you?';
  const body = encodeMessageBody(text);
  assert.equal(decodeMessageBody(body.padded, body.byteLength), text);
  const altered = Buffer.from(body.padded);
  altered[159] = 1;
  throwsCode(() => decodeMessageBody(altered, body.byteLength), 'BODY_PADDING');
  const invalid = Buffer.alloc(160);
  invalid[0] = 0xc0;
  invalid[1] = 0x80;
  throwsCode(() => decodeMessageBody(invalid, 2), 'INVALID_UTF8');
  const control = Buffer.alloc(160);
  control[0] = 0x1b;
  throwsCode(() => decodeMessageBody(control, 1), 'MESSAGE_CONTROL');
  const bom = encodeMessageBody('\ufeffhello');
  assert.equal(decodeMessageBody(bom.padded, bom.byteLength), '\ufeffhello');
});

test('all authored dialogue bodies meet the public record limit and name existing rooms', () => {
  const ids = new Set(atlas.rooms.map(room => room.id));
  const voices = new Set(atlas.voices.map(voice => voice.id));
  assert.ok(atlas.dialogues.length >= 3);
  for (const dialogue of atlas.dialogues) {
    assert.ok(dialogue.lines.length >= 8);
    const seenSeq = new Set();
    for (const line of dialogue.lines) {
      assert.ok(ids.has(line.roomId));
      assert.ok(voices.has(line.speaker));
      assert.ok(!seenSeq.has(line.seq));
      seenSeq.add(line.seq);
      const body = encodeMessageBody(line.text);
      assert.equal(decodeMessageBody(body.padded, body.byteLength), line.text);
    }
  }
});

test('the actual 12-room directed graph is reachable from the entry', () => {
  const result = validateRoomGraph(atlas.rooms);
  assert.equal(result.roomCount, 12);
  assert.equal(result.reachableIds.length, 12);
  assert.deepEqual(result.unreachableIds, []);
  assert.equal(result.edgeCount, atlas.rooms.reduce((sum, room) => sum + room.exits.length, 0));
});

test('graph rejects duplicate identities, missing entry, and invalid destinations', () => {
  const duplicate = copyGraph();
  duplicate[1].id = duplicate[0].id;
  throwsCode(() => validateRoomGraph(duplicate), 'DUPLICATE_ROOM');
  throwsCode(() => validateRoomGraph(atlas.rooms, { entryId: 100 }), 'ENTRY_MISSING');
  const missing = copyGraph();
  missing[0].exits = [99];
  throwsCode(() => validateRoomGraph(missing), 'EDGE_TARGET');
  throwsCode(() => validateRoomGraph(atlas.rooms.slice(0, 11)), 'ROOM_COUNT');
});

test('graph enforces eight distinct exits and identifies unreachable rooms', () => {
  const duplicate = copyGraph();
  duplicate[0].exits = [2, 2];
  throwsCode(() => validateRoomGraph(duplicate), 'DUPLICATE_EDGE');
  const selfLink = copyGraph();
  selfLink[0].exits = [1];
  throwsCode(() => validateRoomGraph(selfLink), 'SELF_EDGE');
  const excessive = copyGraph();
  excessive[0].exits = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  throwsCode(() => validateRoomGraph(excessive), 'EXIT_COUNT');
  const isolated = copyGraph().map(room => ({ id: room.id, exits: [] }));
  throwsCode(() => validateRoomGraph(isolated), 'UNREACHABLE_ROOM');
  assert.equal(validateRoomGraph(isolated, { requireReachable: false }).unreachableIds.length, 11);
});

test('deposit arithmetic preserves integers larger than JavaScript safe numbers', () => {
  const quote = '9007199254740993';
  const estimate = estimateDeposits([{ kind: 'room', count: 12, bytesPerAccount: 2496, lamportsPerAccount: quote }]);
  assert.equal(estimate.totalLamports, 108086391056891916n);
  assert.equal(estimate.totalSol, '108086391.056891916');
  assert.equal(formatSol(1n), '0.000000001');
  assert.equal(formatSol(0n), '0.000000000');
  assert.equal(estimate.scope, 'provided-account-allocations-only');
  assert.ok(estimate.omittedKinds.includes('worldRegistry'));
  assert.ok(estimate.omittedKinds.includes('roomIndex'));
  assert.ok(estimate.omittedKinds.includes('edge'));
});

test('deposit estimator separates every account category from fees and inference', () => {
  const allocations = [
    { kind: 'worldRegistry', count: 1, bytesPerAccount: 256, lamportsPerAccount: '1' },
    { kind: 'roomIndex', count: 1, bytesPerAccount: 1088, lamportsPerAccount: '2' },
    { kind: 'room', count: 12, bytesPerAccount: 2496, lamportsPerAccount: '3' },
    { kind: 'edge', count: 16, bytesPerAccount: 128, lamportsPerAccount: '4' },
    { kind: 'messagePage', count: 0, bytesPerAccount: 2176, lamportsPerAccount: '5' },
  ];
  const estimate = estimateDeposits(allocations);
  assert.equal(estimate.totalLamports, 103n);
  assert.deepEqual(estimate.omittedKinds, []);
  assert.equal(estimate.includesTransactionFees, false);
  assert.equal(estimate.includesInferenceCosts, false);
});

test('ambiguous or numeric deposit quotes and wrong fixed sizes are rejected', () => {
  const room = { kind: 'room', count: 1, bytesPerAccount: 2496, lamportsPerAccount: '10' };
  for (const quote of [10, '-1', '1.1', '1e9', ' 10', '01']) {
    throwsCode(() => estimateDeposits([{ ...room, lamportsPerAccount: quote }]), 'LAMPORT_QUOTE');
  }
  throwsCode(() => estimateDeposits([{ ...room, bytesPerAccount: 2240 }]), 'ACCOUNT_SIZE');
  throwsCode(() => estimateDeposits([{ ...room, count: 1.5 }]), 'ACCOUNT_COUNT');
  throwsCode(() => estimateDeposits([room, room]), 'DUPLICATE_ALLOCATION');
  throwsCode(() => estimateDeposits([]), 'ALLOCATIONS_REQUIRED');
});

test('fixed allocation sizes agree with the declared room and page capacities', () => {
  assert.equal(ROOM_GLYPH_BYTES, 80 * 28);
  assert.equal(ROOM_ACCOUNT_BYTES, 256 + 2240);
  assert.equal(MESSAGE_PAGE_BYTES, 128 + 8 * 256);
  assert.equal(canonical.length + 256, ROOM_ACCOUNT_BYTES);
});
