import {createRequire} from 'node:module';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {VIEWS,paintScreen} from '../src/render.mjs';
const require=createRequire(import.meta.url);const {createCanvas,GlobalFonts}=require('@napi-rs/canvas');
const root=new URL('../',import.meta.url);GlobalFonts.registerFromPath(fileURLToPath(new URL('assets/fonts/DejaVuSansMono.ttf',root)),'Solilo Mono');
const raw=await readFile(new URL('data/atlas.json',root));const atlas=JSON.parse(raw);await mkdir(new URL('assets/screenshots/',root),{recursive:true});
for(const v of VIEWS){const canvas=createCanvas(1600,1000);paintScreen(canvas.getContext('2d'),v.id,atlas,{selectedRoom:v.room,width:1600,height:1000,step:10});await writeFile(new URL('assets/screenshots/'+v.file,root),canvas.toBuffer('image/png'));console.log(v.file);}
await writeFile(new URL('assets/screenshots/provenance.json',root),JSON.stringify({mode:'scripted-replay',renderer:'src/render.mjs',method:'native canvas export of the same renderer used by the local terminal',width:1600,height:1000,atlasSha256:createHash('sha256').update(raw).digest('hex'),views:VIEWS.map(v=>({view:v.id,file:v.file,selectedRoom:v.room,step:10})),browserScreenshot:false},null,2)+'\n');
