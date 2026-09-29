import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {dirname,resolve,relative,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {canonicalRoomBytes,sha256Hex,splitRoomChunks,reconstructRoom,validateRoomGraph,encodeMessageBody} from '../src/codec.mjs';
import {VIEWS} from '../src/render.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=path=>readFile(resolve(root,path));
const json=async path=>JSON.parse(await read(path));
const hash=value=>createHash('sha256').update(value).digest('hex');
const atlasRaw=await read('data/atlas.json');
const atlas=JSON.parse(atlasRaw);
const manifest=await json('data/room-manifest.json');
const provenance=await json('assets/screenshots/provenance.json');
const deployment=await json('data/deployment.json');
assert.equal(atlas.mode,'scripted-replay');
assert.equal(manifest.atlasSha256,hash(atlasRaw),'Manifest is stale. Run npm run generate.');
assert.equal(provenance.atlasSha256,hash(atlasRaw),'Frames are stale. Run npm run frames.');
assert.equal(deployment.deploymentStatus,'not-deployed');
assert.equal(deployment.programId,null);
assert.equal(deployment.roomAccountsOnChain,0);
const graph=validateRoomGraph(atlas.rooms);
for(const room of atlas.rooms){
 const entry=manifest.rooms.find(r=>r.id===room.id);
 assert.ok(entry,`Room ${room.id} missing in manifest`);
 const bytes=canonicalRoomBytes(room.ascii);
 assert.deepEqual(canonicalRoomBytes((await read(entry.source)).toString()),bytes,entry.source);
 assert.equal(sha256Hex(bytes),entry.layoutSha256);
 assert.deepEqual(reconstructRoom(splitRoomChunks(bytes).reverse(),entry.layoutSha256).bytes,bytes);
 assert.equal(bytes.length,2240);
 assert.equal(entry.accountBytes,2496);
}
const roles=new Set(atlas.voices.map(v=>v.id));
let messages=0;
for(const dialogue of atlas.dialogues){
 for(const [index,entry] of dialogue.lines.entries()){
  assert.equal(entry.seq,index+1);
  assert.ok(roles.has(entry.speaker));
  assert.ok(atlas.rooms.some(room=>room.id===entry.roomId));
  encodeMessageBody(entry.text);messages++;
 }
}
assert.equal(VIEWS.length,8);
for(const view of VIEWS){
 const bytes=await read('assets/screenshots/'+view.file);
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(bytes.readUInt32BE(16),1600);
 assert.equal(bytes.readUInt32BE(20),1000);
 assert.ok(provenance.views.some(record=>record.file===view.file&&record.view===view.id));
}
async function list(dir){let found=[];for(const e of await readdir(dir,{withFileTypes:true})){if(['node_modules','.git','output'].includes(e.name))continue;const p=resolve(dir,e.name);found.push(...(e.isDirectory()?await list(p):[p]));}return found;}
const files=await list(root);let links=0;
for(const file of files.filter(f=>extname(f)==='.md')){
 const content=(await readFile(file,'utf8')).replace(/```[\s\S]*?```/g,'');
 const targets=[...content.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map(m=>m[1]);
 targets.push(...[...content.matchAll(/\bsrc="([^"]+)"/g)].map(m=>m[1]));
 for(const target of targets){
  if(/^(?:[a-z]+:|#)/i.test(target))continue;
  const path=decodeURIComponent(target.split('#')[0]);if(!path)continue;
  const resolved=resolve(dirname(file),path);
  assert.ok((await stat(resolved).catch(()=>null))?.isFile(),`Missing link from ${relative(root,file)}: ${target}`);links++;
 }
}
const standalone=(await read('SOLILO.html')).toString();
assert.ok(standalone.includes('globalThis.SOLILO_ATLAS='));
assert.ok(standalone.includes('data:font/ttf;base64,'));
assert.ok(!standalone.includes('src="src/app.mjs"'));
assert.ok(!standalone.includes('href="src/style.css"'));
assert.ok(standalone.includes('Bitstream'));
assert.ok(standalone.includes('SCRIPTED REPLAY'));
const readme=(await read('README.md')).toString();
for(const view of VIEWS)assert.ok(readme.includes('assets/screenshots/'+view.file));
assert.ok(readme.includes('assets/brand/solilo-header.png'));
console.log(`Verified ${graph.roomCount} rooms, ${graph.edgeCount} directed exits, ${messages} dialogue lines, 8 PNGs, ${links} local documentation links and the offline bundle.`);
