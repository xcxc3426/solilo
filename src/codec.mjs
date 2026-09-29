/** Local byte rules for SOLILO's published room and transcript specification. */
import { createHash } from 'node:crypto';

export const ROOM_WIDTH = 80;
export const ROOM_HEIGHT = 28;
export const ROOM_GLYPH_BYTES = ROOM_WIDTH * ROOM_HEIGHT;
export const ROOM_HEADER_BYTES = 256;
export const ROOM_ACCOUNT_BYTES = ROOM_HEADER_BYTES + ROOM_GLYPH_BYTES;
export const CHUNK_BYTES = 448;
export const CHUNK_COUNT = 5;
export const MESSAGE_BODY_BYTES = 160;
export const MESSAGE_RECORD_BYTES = 256;
export const MESSAGE_PAGE_CAPACITY = 8;
export const MESSAGE_PAGE_HEADER_BYTES = 128;
export const MESSAGE_PAGE_BYTES = MESSAGE_PAGE_HEADER_BYTES + MESSAGE_PAGE_CAPACITY * MESSAGE_RECORD_BYTES;
export const LAMPORTS_PER_SOL = 1_000_000_000n;

export class FormatError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'FormatError';
    this.code = code;
  }
}

function fail(code, message) {
  throw new FormatError(code, message);
}

function bytesOf(value, label) {
  if (!(value instanceof Uint8Array)) fail('BYTES_REQUIRED', `${label} must be a Uint8Array or Buffer.`);
  return Buffer.from(value);
}

function printable(bytes) {
  for (let i = 0; i < bytes.length; i += 1) {
    if (bytes[i] < 0x20 || bytes[i] > 0x7e) {
      fail('NON_ASCII_GLYPH', `Glyph byte ${i} is outside printable ASCII (0x20..0x7e).`);
    }
  }
}

/** Preserve every space. Only LF row delimiters and one optional final LF are removed. */
export function canonicalRoomBytes(grid) {
  let rows;
  if (typeof grid === 'string') {
    rows = (grid.endsWith('\n') ? grid.slice(0, -1) : grid).split('\n');
  } else if (Array.isArray(grid)) {
    rows = grid;
  } else {
    fail('GRID_REQUIRED', 'A room must be an array of rows or an LF-delimited string.');
  }
  if (rows.length !== ROOM_HEIGHT) fail('ROW_COUNT', `Expected ${ROOM_HEIGHT} rows, got ${rows.length}.`);
  for (let i = 0; i < rows.length; i += 1) {
    if (typeof rows[i] !== 'string') fail('ROW_TYPE', `Row ${i} must be a string.`);
    if (rows[i].length !== ROOM_WIDTH) fail('ROW_WIDTH', `Row ${i} must contain exactly ${ROOM_WIDTH} characters.`);
    if (!/^[\x20-\x7e]{80}$/.test(rows[i])) fail('NON_ASCII_GLYPH', `Row ${i} must contain only printable ASCII.`);
  }
  return Buffer.from(rows.join(''), 'ascii');
}

/** Return 28 untrimmed rows. No newline is stored in the account's glyph region. */
export function decodeRoomBytes(value) {
  const bytes = bytesOf(value, 'Room bytes');
  if (bytes.length !== ROOM_GLYPH_BYTES) fail('GLYPH_LENGTH', `Expected ${ROOM_GLYPH_BYTES} glyph bytes.`);
  printable(bytes);
  const text = bytes.toString('ascii');
  return Array.from({ length: ROOM_HEIGHT }, (_, i) => text.slice(i * ROOM_WIDTH, (i + 1) * ROOM_WIDTH));
}

export function sha256Hex(value) {
  return createHash('sha256').update(bytesOf(value, 'Hash input')).digest('hex');
}

function validDigest(value) {
  if (typeof value !== 'string' || !/^[0-9a-f]{64}$/.test(value)) fail('DIGEST_FORMAT', 'SHA-256 must be 64 lowercase hexadecimal characters.');
}

/** Five indexed upload records. Chunk boundaries may fall inside a display row. */
export function splitRoomChunks(value) {
  const bytes = bytesOf(value, 'Room bytes');
  decodeRoomBytes(bytes);
  return Array.from({ length: CHUNK_COUNT }, (_, index) => {
    const chunk = Buffer.from(bytes.subarray(index * CHUNK_BYTES, (index + 1) * CHUNK_BYTES));
    return { index, offset: index * CHUNK_BYTES, bytes: chunk, sha256: sha256Hex(chunk) };
  });
}

function freezeDraft(expectedHash, chunks) {
  const copy = Object.freeze([...chunks]);
  const receivedMask = copy.reduce((mask, value, i) => value === null ? mask : mask | (1 << i), 0);
  return Object.freeze({ status: 'draft', expectedHash, receivedMask, chunks: copy });
}

/** Immutable reference state, using hex strings so callers cannot mutate stored buffers. */
export function createRoomDraft(expectedHash) {
  validDigest(expectedHash);
  return freezeDraft(expectedHash, Array(CHUNK_COUNT).fill(null));
}

function assertDraft(draft) {
  if (!draft || draft.status !== 'draft') fail('NOT_DRAFT', 'Only a draft room accepts chunks or sealing.');
  validDigest(draft.expectedHash);
  if (!Array.isArray(draft.chunks) || draft.chunks.length !== CHUNK_COUNT) fail('DRAFT_SHAPE', 'Draft must have five indexed chunk slots.');
  for (const chunk of draft.chunks) {
    if (chunk !== null && (typeof chunk !== 'string' || !/^[0-9a-f]{896}$/.test(chunk))) {
      fail('DRAFT_SHAPE', 'Stored chunks must be null or canonical 448-byte hexadecimal strings.');
    }
  }
  const mask = draft.chunks.reduce((m, c, i) => c === null ? m : m | (1 << i), 0);
  if (draft.receivedMask !== mask) fail('DRAFT_BITMAP', 'Received bitmap does not match stored chunk slots.');
}

/** Upload order is arbitrary; an already occupied index is never overwritten. */
export function writeRoomChunk(draft, index, value) {
  assertDraft(draft);
  if (!Number.isInteger(index) || index < 0 || index >= CHUNK_COUNT) fail('CHUNK_INDEX', 'Chunk index must be an integer from 0 to 4.');
  if (draft.chunks[index] !== null) fail('DUPLICATE_CHUNK', `Chunk ${index} has already been written.`);
  const bytes = bytesOf(value, 'Chunk');
  if (bytes.length !== CHUNK_BYTES) fail('CHUNK_LENGTH', `Every chunk must contain exactly ${CHUNK_BYTES} bytes.`);
  printable(bytes);
  const chunks = [...draft.chunks];
  chunks[index] = bytes.toString('hex');
  return freezeDraft(draft.expectedHash, chunks);
}

export function sealRoom(draft) {
  assertDraft(draft);
  if (draft.receivedMask !== 0b11111) fail('MISSING_CHUNK', 'All five chunk indices must be present before sealing.');
  const bytes = Buffer.concat(draft.chunks.map(chunk => Buffer.from(chunk, 'hex')));
  decodeRoomBytes(bytes);
  const digest = sha256Hex(bytes);
  if (digest !== draft.expectedHash) fail('HASH_MISMATCH', 'Canonical room bytes do not match the declared SHA-256.');
  return Object.freeze({ status: 'sealed', layoutHash: digest, byteLength: bytes.length, bytesHex: bytes.toString('hex') });
}

/** Reconstruct only when all five distinct indices and the whole-layout digest agree. */
export function reconstructRoom(chunks, expectedHash) {
  if (!Array.isArray(chunks)) fail('CHUNKS_REQUIRED', 'Chunks must be an array of indexed byte records.');
  let draft = createRoomDraft(expectedHash);
  for (const chunk of chunks) {
    if (!chunk || typeof chunk !== 'object') fail('CHUNK_SHAPE', 'Each chunk needs index and bytes fields.');
    draft = writeRoomChunk(draft, chunk.index, chunk.bytes);
  }
  const sealed = sealRoom(draft);
  const bytes = Buffer.from(sealed.bytesHex, 'hex');
  return { bytes, rows: decodeRoomBytes(bytes), sha256: sealed.layoutHash };
}

function wellFormedUnicode(text) {
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(++i);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
    } else if (code >= 0xdc00 && code <= 0xdfff) return false;
  }
  return true;
}

function safePublicText(text) {
  if (/[\u0000-\u001f\u007f-\u009f]/u.test(text)) {
    fail('MESSAGE_CONTROL', 'Published message bodies cannot contain C0, DEL or C1 terminal control characters.');
  }
}

/** UTF-8 bytes, never model tokens or JavaScript character counts. */
export function encodeMessageBody(text) {
  if (typeof text !== 'string') fail('MESSAGE_TYPE', 'Message body must be a string.');
  if (!wellFormedUnicode(text)) fail('INVALID_UNICODE', 'Unpaired Unicode surrogates are not valid message text.');
  safePublicText(text);
  const bytes = Buffer.from(text, 'utf8');
  if (bytes.length < 1 || bytes.length > MESSAGE_BODY_BYTES) fail('MESSAGE_LENGTH', `Message body must occupy 1..${MESSAGE_BODY_BYTES} UTF-8 bytes.`);
  const padded = Buffer.alloc(MESSAGE_BODY_BYTES);
  bytes.copy(padded);
  return { byteLength: bytes.length, bytes, padded };
}

export function decodeMessageBody(value, byteLength) {
  const padded = bytesOf(value, 'Message body slot');
  if (padded.length !== MESSAGE_BODY_BYTES) fail('BODY_SLOT_LENGTH', 'The body slot must be exactly 160 bytes.');
  if (!Number.isInteger(byteLength) || byteLength < 1 || byteLength > MESSAGE_BODY_BYTES) fail('MESSAGE_LENGTH', 'Recorded body length must be in 1..160.');
  if (padded.subarray(byteLength).some(byte => byte !== 0)) fail('BODY_PADDING', 'Unused body bytes must be zero.');
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(padded.subarray(0, byteLength));
  } catch {
    fail('INVALID_UTF8', 'Message contains an invalid UTF-8 byte sequence.');
  }
  safePublicText(text);
  return text;
}

/** Validate directed graph bounds, identity uniqueness, and optional entry reachability. */
export function validateRoomGraph(rooms, { entryId = 1, expectedRoomCount = 12, requireReachable = true } = {}) {
  if (!Array.isArray(rooms)) fail('ROOMS_REQUIRED', 'Rooms must be an array.');
  if (!Number.isInteger(expectedRoomCount) || expectedRoomCount < 1) fail('EXPECTED_COUNT', 'Expected room count must be a positive integer.');
  if (rooms.length !== expectedRoomCount) fail('ROOM_COUNT', `Expected ${expectedRoomCount} rooms, got ${rooms.length}.`);
  const byId = new Map();
  for (const room of rooms) {
    if (!room || !Number.isSafeInteger(room.id) || room.id < 1) fail('ROOM_ID', 'Room IDs must be positive safe integers.');
    if (byId.has(room.id)) fail('DUPLICATE_ROOM', `Room ${room.id} appears more than once.`);
    byId.set(room.id, room);
  }
  if (!byId.has(entryId)) fail('ENTRY_MISSING', 'Entry room must exist.');
  let edgeCount = 0;
  for (const room of rooms) {
    if (!Array.isArray(room.exits) || room.exits.length > 8) fail('EXIT_COUNT', `Room ${room.id} must have at most eight outgoing edges.`);
    const seen = new Set();
    for (const destination of room.exits) {
      if (!Number.isSafeInteger(destination) || !byId.has(destination)) fail('EDGE_TARGET', `Room ${room.id} has a missing or invalid target.`);
      if (destination === room.id) fail('SELF_EDGE', `Room ${room.id} cannot link to itself.`);
      if (seen.has(destination)) fail('DUPLICATE_EDGE', `Room ${room.id} repeats target ${destination}.`);
      seen.add(destination);
      edgeCount += 1;
    }
  }
  const reached = new Set([entryId]);
  const queue = [entryId];
  for (let i = 0; i < queue.length; i += 1) {
    for (const target of byId.get(queue[i]).exits) {
      if (!reached.has(target)) { reached.add(target); queue.push(target); }
    }
  }
  const unreachableIds = [...byId.keys()].filter(id => !reached.has(id)).sort((a, b) => a - b);
  if (requireReachable && unreachableIds.length) fail('UNREACHABLE_ROOM', `Rooms unreachable from ${entryId}: ${unreachableIds.join(', ')}.`);
  return { roomCount: rooms.length, edgeCount, entryId, reachableIds: [...reached].sort((a, b) => a - b), unreachableIds };
}

export const DEPOSIT_ACCOUNT_KINDS = Object.freeze(['worldRegistry', 'roomIndex', 'room', 'edge', 'messagePage']);

function decimalLamports(value) {
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]*)$/.test(value)) fail('LAMPORT_QUOTE', 'Per-account lamport quotes must be nonnegative canonical decimal strings.');
  return BigInt(value);
}

export function formatSol(lamports) {
  if (typeof lamports !== 'bigint' || lamports < 0n) fail('LAMPORT_VALUE', 'Lamports must be a nonnegative BigInt.');
  return `${lamports / LAMPORTS_PER_SOL}.${String(lamports % LAMPORTS_PER_SOL).padStart(9, '0')}`;
}

/** Sum only caller-supplied rent-exempt account deposits; no network prices are assumed. */
export function estimateDeposits(allocations) {
  if (!Array.isArray(allocations) || !allocations.length) fail('ALLOCATIONS_REQUIRED', 'Supply at least one account allocation and its RPC lamport quote.');
  const seen = new Set();
  let totalLamports = 0n;
  const items = allocations.map(allocation => {
    if (!allocation || !DEPOSIT_ACCOUNT_KINDS.includes(allocation.kind)) fail('ACCOUNT_KIND', 'Use a documented deposit account kind.');
    const { kind, count, bytesPerAccount, lamportsPerAccount } = allocation;
    if (seen.has(kind)) fail('DUPLICATE_ALLOCATION', `Allocation kind ${kind} appears more than once.`);
    seen.add(kind);
    if (!Number.isSafeInteger(count) || count < 0) fail('ACCOUNT_COUNT', 'Account count must be a nonnegative safe integer.');
    if (!Number.isSafeInteger(bytesPerAccount) || bytesPerAccount < 1) fail('ACCOUNT_SIZE', 'Allocated bytes must be a positive safe integer.');
    if (kind === 'room' && bytesPerAccount !== ROOM_ACCOUNT_BYTES) fail('ACCOUNT_SIZE', 'The specified room allocation is 2496 bytes.');
    if (kind === 'messagePage' && bytesPerAccount !== MESSAGE_PAGE_BYTES) fail('ACCOUNT_SIZE', 'The specified message page allocation is 2176 bytes.');
    const perAccount = decimalLamports(lamportsPerAccount);
    const subtotalLamports = BigInt(count) * perAccount;
    totalLamports += subtotalLamports;
    return { kind, count, bytesPerAccount, lamportsPerAccount: perAccount, subtotalLamports };
  });
  return {
    scope: 'provided-account-allocations-only',
    items,
    omittedKinds: DEPOSIT_ACCOUNT_KINDS.filter(kind => !seen.has(kind)),
    totalLamports,
    totalSol: formatSol(totalLamports),
    includesTransactionFees: false,
    includesInferenceCosts: false,
  };
}
