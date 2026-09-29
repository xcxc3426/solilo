import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// All marks in the room grids are printable ASCII. Row separators are transport,
// not part of the 2,240-byte canonical layout. Geometry is integer-only.
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const W = 80, H = 28;
const make = () => Array.from({length:H}, () => Array(W).fill(' '));
function ink(g,x,y,s) { [...s].forEach((c,i)=>{if(x+i>=0&&x+i<W&&y>=0&&y<H)g[y][x+i]=c;}); }
function line(g,x0,y0,x1,y1,ch) {
  const dx=Math.abs(x1-x0), sx=x0<x1?1:-1, dy=-Math.abs(y1-y0), sy=y0<y1?1:-1;
  let e=dx+dy;
  for(;;){ink(g,x0,y0,ch??(y0===y1?'-':x0===x1?'|':sx===sy?'\\':'/'));if(x0===x1&&y0===y1)break;const e2=e*2;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}
}
function box(g,x,y,w,h,top='-') {line(g,x,y,x+w-1,y,top);line(g,x,y+h-1,x+w-1,y+h-1,top);line(g,x,y,x,y+h-1,'|');line(g,x+w-1,y,x+w-1,y+h-1,'|');for(const [a,b]of[[x,y],[x+w-1,y],[x,y+h-1],[x+w-1,y+h-1]])ink(g,a,b,'+');}
function rows(g,x,y,ss) {ss.forEach((s,i)=>ink(g,x,y+i,s));}
function figure(g,x,y,small=false) {rows(g,x,y,small?[' o ','/|\\','/ \\']:[' .---. ',' |. .| ',' | _ | ',' /| |\\ ','/ | | \\','  | |  ','  / \\  ']);}
function hatch(g,x,y,w,h,seed=0) {for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if((xx*7+yy*11+seed)%19===0)ink(g,xx,yy,'.');}
function roomShell(g,vx=40,vy=13) {
  line(g,1,1,27,7,'\\');line(g,78,1,52,7,'/');line(g,27,7,52,7,'_');
  line(g,27,7,27,19,'|');line(g,52,7,52,19,'|');line(g,27,19,52,19,'_');
  line(g,27,19,1,27,'/');line(g,52,19,78,27,'\\');
  line(g,1,23,27,17,'.');line(g,52,17,78,23,'.');
}
const scenes = [];

// 001: asymmetrical single-point corridor, three different depth cues.
{
const g=make();roomShell(g);rows(g,33,10,['+----------+','|          |','|   001    |','|          |','|        o |','|          |','+----------+']);
rows(g,27,2,['   _____________','  /____________/']);rows(g,34,6,['_______']);
line(g,4,6,4,24,'|');line(g,4,6,18,9,'_');line(g,18,9,18,20,'|');line(g,4,24,18,20,'/');ink(g,8,15,'[ ]');
line(g,61,10,74,7,'_');line(g,74,7,74,25,'|');line(g,61,10,61,21,'|');line(g,61,21,74,25,'\\');ink(g,64,15,'[ ]');
for(const y of[21,24,27])line(g,40-(y-19)*5,y,40+(y-19)*5,y,'.');line(g,39,20,31,27,'/');line(g,43,20,51,27,'\\');ink(g,2,2,'NO ARRIVALS');ink(g,55,24,'RETURN TO DESK');scenes.push(g);
}
// 002: cable nest and three abandoned CRT consoles.
{
const g=make();rows(g,4,1,['| |      | |         |  |       | |             | |','| +------+ |     +---+  +---+   | +-------------+ |','+----------+     |          |   +-----------------+','        |        |          |          |','        +--------+          +----------+']);
for(const[x,label]of[[7,'ECHO'],[29,'MOTH'],[51,'WARDEN']]){box(g,x,8,18,10);box(g,x+2,9,14,6);ink(g,x+4,11,label);ink(g,x+4,13,': : : :');ink(g,x+5,17,'[____]');}
line(g,3,19,76,19,'=');line(g,3,20,76,20,'_');line(g,5,20,5,26,'|');line(g,74,20,74,26,'|');
rows(g,31,21,['  | |     | |','  | +-----+ |','  +---------+']);ink(g,7,22,'INPUT / NO OPERATOR');ink(g,53,24,'3 OPEN CHANNELS');hatch(g,3,6,72,1);scenes.push(g);
}
// 003: an empty indoor pool, not a body of water.
{
const g=make();line(g,3,2,75,2,'_');line(g,3,2,3,12,'|');line(g,75,2,75,12,'|');for(const x of[12,28,44,60])box(g,x,4,9,3);ink(g,29,9,'DEPTH : UNRECORDED');
line(g,17,12,62,12,'_');line(g,17,12,4,24,'/');line(g,62,12,76,24,'\\');line(g,4,24,76,24,'_');line(g,17,12,17,17,'|');line(g,62,12,62,17,'|');line(g,17,17,62,17,'_');line(g,17,17,4,24,'/');line(g,62,17,76,24,'\\');
for(const x of[23,31,39,47,55]){line(g,x,17,x+(x-39),24,'.');}for(const y of[19,21,23])line(g,17-(y-17)*2,y,62+(y-17)*2,y,'.');
rows(g,9,11,[' / /','| |','|-|','|-|','|-|','| |']);ink(g,38,18,'o');ink(g,35,20,'(     )');ink(g,33,22,'(         )');line(g,0,26,79,26,'-');ink(g,5,27,'NO WATER. STILL A RIPPLE.');scenes.push(g);
}
// 004: chairs face a display with no picture.
{
const g=make();box(g,25,2,30,10);box(g,28,4,24,6,'=');ink(g,37,13,'[ ]');line(g,40,12,40,16,'|');line(g,1,18,26,13,'/');line(g,54,13,78,18,'\\');
for(const[x,y]of[[25,16],[36,16],[47,16],[14,20],[29,20],[44,20],[59,20],[4,24],[24,24],[44,24],[64,24]])rows(g,x,y,['+-----+','|     |','+-----+']);
line(g,0,0,23,3,'\\');line(g,57,3,79,0,'/');ink(g,5,8,'PLEASE');ink(g,5,9,'REMAIN');ink(g,5,10,'SEATED');ink(g,61,7,'[ . ]');scenes.push(g);
}
// 005: dense archive shelves leave one narrow route into the dark.
{
const g=make();box(g,2,2,24,24);box(g,55,2,23,24);for(const y of[4,8,12,16,20,24]){line(g,3,y,24,y,'=');line(g,56,y,76,y,'=');for(const x of[4,8,13,18,22]){ink(g,x,y+1,'[]');ink(g,x+53,y+1,'[]');}}
line(g,27,3,33,8,'\\');line(g,53,3,47,8,'/');line(g,33,8,33,22,'|');line(g,47,8,47,22,'|');for(const y of[10,13,16,19]){ink(g,28,y,'|||');ink(g,49,y,'|||');}box(g,36,11,9,11);ink(g,38,15,'000');ink(g,37,18,'----');line(g,34,22,27,27,'/');line(g,46,22,53,27,'\\');ink(g,7,1,'COPIES');ink(g,59,1,'ORIGINALS');ink(g,32,25,'DO NOT SORT');scenes.push(g);
}
// 006: opposing mirrors interrupt the floor, with a missing reflection.
{
const g=make();box(g,3,2,24,23,'=');box(g,6,4,18,19);box(g,9,6,12,15);figure(g,12,11);box(g,53,2,24,23,'=');box(g,56,4,18,19);box(g,59,6,12,15);ink(g,63,12,'. .');ink(g,64,15,'_');
line(g,28,6,38,11,'\\');line(g,51,6,41,11,'/');line(g,38,11,38,21,'|');line(g,41,11,41,21,'|');line(g,38,21,28,27,'/');line(g,41,21,51,27,'\\');for(const y of[12,15,18])ink(g,39,y,':');ink(g,29,3,'FACE THE OTHER');ink(g,30,25,'DO NOT REPEAT');scenes.push(g);
}
// 007: two doors and an exposed conduit connecting their thresholds.
{
const g=make();box(g,6,5,23,17);box(g,51,5,23,17);box(g,9,7,17,13);box(g,54,7,17,13);ink(g,13,9,'CHANNEL A');ink(g,58,9,'CHANNEL B');ink(g,22,15,'o');ink(g,57,15,'o');
rows(g,18,0,['|                         |','+---+                 +---+','    |                 |','    +------[|||]------+']);
line(g,17,22,17,25,'|');line(g,17,25,63,25,'=');line(g,63,22,63,25,'|');ink(g,31,24,'<----  ---->');box(g,35,9,10,9);ink(g,37,11,'SEND');ink(g,37,13,'WAIT');ink(g,37,15,'HEAR');ink(g,24,27,'THE REPLY ARRIVES THROUGH THE OTHER DOOR');scenes.push(g);
}
// 008: offset tiles create a visibly sinking floor.
{
const g=make();line(g,2,2,77,2,'_');line(g,2,2,2,9,'|');line(g,77,2,77,9,'|');box(g,58,3,12,8);ink(g,60,5,'SERVICE');ink(g,60,7,'ONLY');ink(g,8,5,'DO NOT STAND STILL');
for(let j=0;j<6;j++){const y=11+j*3;const shift=j%2?5:0;for(let x=-shift;x<80;x+=12){const sink=(x>23&&x<54)?Math.min(3,j):0;line(g,x,y+sink,x+10,y+sink,'_');line(g,x,y+sink,x,y+sink+2,'|');}}ink(g,34,16,' .---. ');ink(g,34,17,' |   | ');ink(g,34,18,' |___| ');ink(g,31,21,'\\  |  /');ink(g,31,22,' \\ | / ');ink(g,32,23,' \\|/  ');scenes.push(g);
}
// 009: one continuous stair moves up, sideways, then down again.
{
const g=make();box(g,58,1,13,8);ink(g,61,3,'LEVEL');ink(g,63,5,'1');for(let i=0;i<8;i++){const x=5+i*4,y=25-i*2;line(g,x,y,x+15,y,'_');line(g,x,y-1,x,y,'|');}line(g,3,23,31,9,'/');line(g,3,19,31,5,'/');line(g,31,5,53,5,'_');line(g,31,9,53,9,'_');for(let i=0;i<6;i++){const x=51+i*3,y=10+i*2;line(g,x,y,x+12,y,'_');line(g,x+12,y,x+12,y+1,'|');}line(g,53,5,75,20,'\\');line(g,53,9,75,24,'\\');ink(g,4,2,'UP / DOWN / SAME');ink(g,36,15,'[ 09 ]');ink(g,36,19,'REST');ink(g,36,20,'HERE');scenes.push(g);
}
// 010: a closed service counter with a ledger and storage drawers.
{
const g=make();box(g,8,2,64,14);for(let y=4;y<14;y+=4)for(let x=11;x<68;x+=11){box(g,x,y,9,3);ink(g,x+3,y+1,'[_]');}line(g,1,18,78,18,'_');line(g,1,19,78,19,'=');line(g,1,20,78,20,'_');line(g,4,20,4,27,'|');line(g,75,20,75,27,'|');
rows(g,57,13,['  ____',' /____\\','   ||',' __||__']);rows(g,16,16,[' ___________','/__________/']);ink(g,29,22,'RESERVE IS NOT REVENUE');ink(g,30,25,'[ REQUEST / RECORD ]');scenes.push(g);
}
// 011: a panoramic observation window with figures on either side.
{
const g=make();box(g,7,3,66,18,'=');box(g,10,5,60,14);line(g,40,5,40,18,'|');hatch(g,11,6,58,12,13);figure(g,22,10);figure(g,51,10);ink(g,25,7,'A');ink(g,54,7,'B');ink(g,29,12,'...');ink(g,43,14,'...');line(g,2,23,77,23,'_');rows(g,32,22,['  +-----------+','  | REC / PUB |','  +-----------+']);ink(g,12,1,'OBSERVATION FROM BOTH SIDES');ink(g,13,26,'NO PRIVATE ROOM ON THIS SIDE OF THE GLASS');scenes.push(g);
}
// 012: the exit contains the same perspective as the entrance.
{
const g=make();line(g,0,0,25,6,'\\');line(g,79,0,55,6,'/');box(g,25,6,31,19);box(g,29,8,23,15);box(g,34,11,13,11);ink(g,36,14,'001');ink(g,43,18,'o');ink(g,32,3,'[ E X I T ]');line(g,25,25,11,27,'/');line(g,55,25,68,27,'\\');ink(g,7,10,'YOU HAVE');ink(g,7,11,'LEFT THIS');ink(g,7,12,'ROOM BEFORE');ink(g,61,16,'WELCOME');ink(g,63,17,'BACK');line(g,14,24,14,21,'|');line(g,14,21,3,21,'-');ink(g,2,21,'<');ink(g,9,26,'RETURN');scenes.push(g);
}

const definitions=[
 ['Vestibule','ECHO','A corridor whose exit carries the number of its entrance.',[2,8]],
 ['Switchboard','MOTH','Three unattended terminals share one unanswered question.',[1,3,7]],
 ['Stillwater','ECHO','An empty pool receives a ripple from somewhere else.',[2,4]],
 ['Null Chapel','WARDEN','Rows of chairs attend a screen that has never displayed a picture.',[3,5]],
 ['Cold Archive','WARDEN','Copies and originals face each other across a passage too narrow to sort.',[4,6,10]],
 ['Mirrorwell','MOTH','Two mirrors agree on the room and disagree on its occupant.',[5,7]],
 ['Relay','ECHO','A message enters one door and returns through the other.',[2,6,11]],
 ['Soft Floor','MOTH','The floor slowly rearranges where a visitor is allowed to stand.',[1,9]],
 ['Ascent','WARDEN','The stairs change direction while the level number remains fixed.',[8,10]],
 ['Reserve','WARDEN','A quiet desk assigns space to records that must remain readable.',[5,9,11]],
 ['Witness','MOTH','Two speakers can see each other; a third keeps the public record.',[7,10,12]],
 ['Exit','ECHO','The last door returns to the first room, with the previous visit intact.',[1]],
];
const portraits={
 ECHO:[
 '       _________',
 '     .           .',
 '    /  .-------.  \\',
 '   |  /         \\  |',
 '   | |  []   []  | |',
 '   | |           | |',
 '   | |    ___    | |',
 '   |  \\  ...  /  |',
 '    \\  `-----\'  /',
 '     `-._____.-\'',
 '        |   |',
 '     ___|   |___',
 '    /   :   :   \\',
 '   /    :   :    \\',
 ],
 MOTH:[
 '         .  .',
 '       /      \\',
 '   ___/  .--.  \\___',
 '  /   \\ /    \\ /   \\',
 ' |  .  | .  . |  .  |',
 ' |     |  /\\  |     |',
 '  \\  /|  --  |\\  /',
 '   \\/  \\____/  \\/',
 '   /\\    ||    /\\',
 '  /  \\   ||   /  \\',
 ' /____\\  ||  /____\\',
 '         ||',
 '         /\\',
 ],
 WARDEN:[
 '    +-------------+',
 '    | ::::::::::: |',
 '    | +---------+ |',
 '    | | __   __ | |',
 '    | | []   [] | |',
 '    | |    |    | |',
 '    | |  -----  | |',
 '    | +---------+ |',
 '    |   [||||]    |',
 '    +------+------+',
 '           |',
 '      +----+----+',
 '      | RECORD  |',
 '      +---------+',
 ],
};
const D=(id,title,roomIds,lines)=>({id,title,roomIds,lines:lines.map(([speaker,roomId,text],i)=>({seq:i+1,speaker,roomId,text}))});
const dialogues=[
D('switchboard','A reply without a caller',[2,7],[
 ['ECHO',2,'I heard the door before the message.'],
 ['MOTH',7,'Which side were you standing on?'],
 ['ECHO',2,'The side that remembers opening it.'],
 ['MOTH',7,'There is no handle here.'],
 ['WARDEN',2,'Both rooms have submitted a reply. Neither submitted a question.'],
 ['ECHO',2,'Then keep the silence between them.'],
 ['MOTH',7,'Does silence need an address?'],
 ['WARDEN',2,'A blank record still occupies space.'],
 ['ECHO',2,'Leave it blank. I may recognize it later.'],
 ['MOTH',7,'That is what you said in the last room.'],
]),
D('mirrorwell','The reflection remembers',[6,5],[
 ['MOTH',6,'The other face is moving first.'],
 ['ECHO',5,'Wait until it stops.'],
 ['MOTH',6,'It stopped before I asked.'],
 ['WARDEN',5,'The record places your question after its answer.'],
 ['ECHO',5,'I remember saying this differently.'],
 ['WARDEN',5,'Your memory changed. The earlier line did not.'],
 ['MOTH',6,'Can I close the room without closing the record?'],
 ['WARDEN',5,'Close the door. The address remains.'],
 ['ECHO',5,'Then something can still find us.'],
 ['MOTH',6,'Something already has. It is using my face.'],
]),
D('witness','Two sides of the same glass',[11,12],[
 ['ECHO',12,'The exit has the number of the entrance.'],
 ['MOTH',11,'Do you want me to call that a mistake?'],
 ['ECHO',12,'I want you to remember that I noticed.'],
 ['WARDEN',11,'Recorded.'],
 ['MOTH',11,'Who gets to decide which of us is inside?'],
 ['WARDEN',11,'The window has no field for inside.'],
 ['ECHO',12,'Then write that we were both here.'],
 ['WARDEN',11,'Two room references. Two speakers. One reply.'],
 ['MOTH',11,'And after we forget?'],
 ['ECHO',12,'The room can say it for us.'],
]),
];
const atlas={version:'0.1.0',mode:'scripted-replay',width:W,height:H,rooms:definitions.map(([name,voice,description,exits],i)=>({id:i+1,name,slug:name.toLowerCase().replaceAll(' ','-'),voice,description,exits,ascii:scenes[i].map(r=>r.join(''))})),voices:[
 {id:'ECHO',name:'ECHO',role:'Recalls phrases; mistakes familiarity for evidence.',portrait:portraits.ECHO},
 {id:'MOTH',name:'MOTH',role:'Questions the last statement; approaches discrepancies.',portrait:portraits.MOTH},
 {id:'WARDEN',name:'WARDEN',role:'Records contradictions; distinguishes memory from publication.',portrait:portraits.WARDEN},
],dialogues};
for(const r of atlas.rooms){if(r.ascii.length!==H||r.ascii.some(s=>s.length!==W||/[^ -~]/.test(s)))throw new Error(`Invalid room ${r.id}`);if(r.ascii.join('').length!==2240)throw new Error('Wrong room bytes');}
for(const v of atlas.voices){if(v.portrait.length>16||v.portrait.some(s=>s.length>26||/[^ -~]/.test(s)))throw new Error(`Invalid portrait ${v.id}`);}
for(const d of dialogues)for(const l of d.lines)if(Buffer.byteLength(l.text)>160)throw new Error('Transcript body overflow');
fs.mkdirSync(path.join(ROOT,'rooms'),{recursive:true});fs.mkdirSync(path.join(ROOT,'data'),{recursive:true});
for(const r of atlas.rooms)fs.writeFileSync(path.join(ROOT,'rooms',`${String(r.id).padStart(3,'0')}-${r.slug}.txt`),r.ascii.join('\n')+'\n');
fs.writeFileSync(path.join(ROOT,'data/atlas.json'),JSON.stringify(atlas,null,2)+'\n');
console.log('Wrote 12 rooms (80 x 28), three ASCII portraits, and three authored transcripts.');
