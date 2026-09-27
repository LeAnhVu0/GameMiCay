import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = ['index.html','styles.css','bootstrap.js','game.js','dev-server.mjs','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
let failed = false;
const ok = m => console.log(`OK   ${m}`);
const bad = m => { failed = true; console.error(`FAIL ${m}`); };

for (const f of required) {
  try { await access(path.join(root,f)); ok(`exists: ${f}`); } catch { bad(`missing: ${f}`); }
}

const html = await readFile(path.join(root,'index.html'),'utf8');
for (const ref of ['./styles.css','./bootstrap.js','./game.js']) {
  html.includes(ref) ? ok(`index references ${ref}`) : bad(`index does not reference ${ref}`);
}
for (const id of ['app','top','view','modal','card','toast']) {
  new RegExp(`id=["']${id}["']`).test(html) ? ok(`DOM anchor #${id}`) : bad(`missing DOM anchor #${id}`);
}

const game = await readFile(path.join(root,'game.js'),'utf8');
for (const marker of ['MC2|','function Hc()','function Wn()','function Bt(','function FA(','function xc()']) {
  game.includes(marker) ? ok(`game marker: ${marker}`) : bad(`missing game marker: ${marker}`);
}
if (/api\/copy/.test(game)) bad('copy telemetry still present'); else ok('copy telemetry removed');
if (/Đây là bản sao không chính thức/.test(game)) bad('off-domain replacement page still present'); else ok('off-domain redirect UI removed');

// Parse browser scripts without executing them.
for (const f of ['bootstrap.js','game.js','dev-server.mjs']) {
  const src = await readFile(path.join(root,f),'utf8');
  if (f.endsWith('.mjs')) continue; // node --check is performed by verify scripts below.
  try { new Function(src); ok(`JavaScript parses: ${f}`); } catch(e) { bad(`${f}: ${e.message}`); }
}

if (failed) process.exit(1);
console.log('\nProject static verification passed.');
