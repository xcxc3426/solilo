import { readFile, writeFile } from 'node:fs/promises';
import {
  canonicalRoomBytes, sha256Hex, splitRoomChunks, validateRoomGraph, encodeMessageBody,
  ROOM_WIDTH, ROOM_HEIGHT, ROOM_GLYPH_BYTES, ROOM_ACCOUNT_BYTES,
  MESSAGE_PAGE_BYTES, MESSAGE_RECORD_BYTES, MESSAGE_BODY_BYTES,
} from '../src/codec.mjs';

const root = new URL('../', import.meta.url);
const atlasBytes = await readFile(new URL('data/atlas.json', root));
const atlas = JSON.parse(atlasBytes.toString('utf8'));
if (atlas.width !== ROOM_WIDTH || atlas.height !== ROOM_HEIGHT) throw new Error('Atlas dimensions differ from canonical room dimensions.');
const graph = validateRoomGraph(atlas.rooms);
if (atlas.rooms.some((room, index) => room.id !== index + 1)) throw new Error('Atlas rooms must be ordered 1..12.');
const rooms = [];
for (const room of atlas.rooms) {
  const source = `rooms/${String(room.id).padStart(3, '0')}-${room.slug}.txt`;
  const fileGrid = await readFile(new URL(source, root), 'utf8');
  const bytes = canonicalRoomBytes(room.ascii);
  if (!bytes.equals(canonicalRoomBytes(fileGrid))) throw new Error(`Room file differs from atlas: ${source}`);
  rooms.push({
    id: room.id,
    name: room.name,
    source,
    exits: [...room.exits],
    glyphBytes: bytes.length,
    accountBytes: ROOM_ACCOUNT_BYTES,
    layoutSha256: sha256Hex(bytes),
    chunks: splitRoomChunks(bytes).map(({ index, offset, bytes: chunkBytes, sha256 }) => ({
      index, offset, byteLength: chunkBytes.length, sha256,
    })),
  });
}
const transcripts = atlas.dialogues.map(dialogue => ({
  id: dialogue.id,
  messages: dialogue.lines.map(line => ({
    replaySequence: line.seq,
    roomId: line.roomId,
    speaker: line.speaker,
    bodyBytes: encodeMessageBody(line.text).byteLength,
    bodySha256: sha256Hex(Buffer.from(line.text, 'utf8')),
  })),
}));
const manifest = {
  format: 'solilo-room-manifest/1',
  version: atlas.version,
  mode: atlas.mode,
  atlasSource: 'data/atlas.json',
  atlasSha256: sha256Hex(atlasBytes),
  dimensions: { width: ROOM_WIDTH, height: ROOM_HEIGHT },
  glyphEncoding: 'printable-ascii-row-major-without-line-delimiters',
  canonicalGlyphBytesPerRoom: ROOM_GLYPH_BYTES,
  allocationBytes: { room: ROOM_ACCOUNT_BYTES, messagePage: MESSAGE_PAGE_BYTES, messageRecord: MESSAGE_RECORD_BYTES, messageBody: MESSAGE_BODY_BYTES },
  graph,
  rooms,
  transcripts,
};
await writeFile(new URL('data/room-manifest.json', root), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Manifest: ${rooms.length} rooms, ${graph.edgeCount} edges, ${transcripts.reduce((n, d) => n + d.messages.length, 0)} authored messages.`);
