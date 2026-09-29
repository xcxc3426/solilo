import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const get=path=>readFile(new URL(path,root),'utf8');
let [html,css,renderer,app,atlas]=await Promise.all(['index.html','src/style.css','src/render.mjs','src/app.mjs','data/atlas.json'].map(get));
const font=await readFile(new URL('assets/fonts/DejaVuSansMono.ttf',root));
const fontLicense=await get('assets/fonts/LICENSE.txt');
css=css.replace('../assets/fonts/DejaVuSansMono.ttf','data:font/ttf;base64,'+font.toString('base64'));
renderer=renderer.replace(/^export\s+/gm,'');
app=app.replace(/^import\s+\{[^}]+\}\s+from\s+['"]\.\/render\.mjs['"];?\s*\n/,'');
const escapeScript=text=>text.replace(/<\/script/gi,'<\\/script');
const script=escapeScript(`globalThis.SOLILO_ATLAS=${JSON.stringify(JSON.parse(atlas))};\n${renderer}\n${app}`);
html=html.replace('<link rel="stylesheet" href="src/style.css">',()=>`<style>${css}</style>`)
 .replace('<script type="module" src="src/app.mjs"></script>',()=>`<script type="module">${script}</script>`)
 .replace('Loading local atlas...','Loading bundled atlas...')
 .replace('<a href="README.md">Read the repository</a>.','Read the documentation in the full repository download.');
html=html.replace('<head>',()=>`<head><!-- Bundled font notice\n${fontLicense.replace(/--/g,'- -')}\n-->`);
if(html.includes('src="src/app.mjs"'))throw new Error('Module replacement did not match.');
await writeFile(new URL('SOLILO.html',root),html);
console.log(`Built SOLILO.html (${Buffer.byteLength(html).toLocaleString()} bytes), including atlas, renderer and font.`);
