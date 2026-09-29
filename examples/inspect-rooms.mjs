import { readFile } from 'node:fs/promises';
import {
  canonicalRoomBytes, splitRoomChunks, reconstructRoom, sha256Hex, validateRoomGraph,
  ROOM_GLYPH_BYTES, ROOM_ACCOUNT_BYTES, MESSAGE_PAGE_BYTES,
} from '../src/codec.mjs';

const atlas = JSON.parse(await readFile(new URL('../data/atlas.json', import.meta.url), 'utf8'));
const graph = validateRoomGraph(atlas.rooms);
console.log('SOLILO / local room reconstruction');
console.log('SCRIPTED REPLAY / no RPC / no deployment');
console.log(`${graph.roomCount} rooms; ${graph.edgeCount} directed exits; every room reachable from ROOM/001.`);
console.log(`Each room: ${ROOM_GLYPH_BYTES} glyph bytes in a specified ${ROOM_ACCOUNT_BYTES}-byte account.`);
console.log(`Each transcript page: ${MESSAGE_PAGE_BYTES} specified bytes, including eight record slots.`);
for (const room of atlas.rooms) {
  const bytes = canonicalRoomBytes(room.ascii);
  const hash = sha256Hex(bytes);
  const chunks = splitRoomChunks(bytes);
  const reconstructed = reconstructRoom([chunks[4], chunks[1], chunks[3], chunks[0], chunks[2]], hash);
  if (!reconstructed.bytes.equals(bytes)) throw new Error(`Room ${room.id} did not round-trip.`);
  console.log(`${String(room.id).padStart(3, '0')}  ${room.name.padEnd(13)}  ${reconstructed.bytes.length} bytes  sha256:${hash.slice(0, 16)}...`);
}
console.log('All rooms reconstructed from five indexed chunks. Digests are content hashes, not transaction IDs.');

