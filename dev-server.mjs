import http from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(ROOT, '.local-data');
const DB_FILE = path.join(DATA_DIR, 'mock-api.json');
const PORT = Number(process.env.PORT || 8080);
const MAX_BODY = 128 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.svg': 'image/svg+xml'
};

const emptyDb = () => ({ leaderboard: {}, challenge: {}, prank: {} });
let db = emptyDb();
try { db = { ...emptyDb(), ...JSON.parse(await readFile(DB_FILE, 'utf8')) }; } catch {}

async function persist() {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function json(res, status, value) {
  const body = JSON.stringify(value);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}

async function bodyJson(req) {
  let size = 0, chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw Object.assign(new Error('body too large'), { status: 413 });
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('invalid json'), { status: 400 }); }
}

function safeName(value) { return String(value || 'Tiệm Mì Cay').replace(/[<>]/g, '').slice(0, 26) || 'Tiệm Mì Cay'; }
function today() { return new Date().toISOString().slice(0, 10); }
function weekKey(day = today()) {
  const d = new Date(`${day}T00:00:00Z`), wd = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - wd);
  return d.toISOString().slice(0, 10);
}
function rankEntries(entries, valueKey, limit = 30) {
  return Object.values(entries).sort((a,b) => Number(b[valueKey]||0) - Number(a[valueKey]||0) || Number(a.t||0)-Number(b.t||0)).slice(0, limit);
}

async function apiLeaderboard(req, res) {
  if (req.method === 'POST') {
    const p = await bodyJson(req);
    if (!p.id || !Number.isFinite(Number(p.profit))) return json(res, 400, { error: 'Dữ liệu bảng xếp hạng không hợp lệ' });
    db.leaderboard[p.id] = {
      id: String(p.id).slice(0, 32), name: safeName(p.name), profit: Number(p.profit),
      day: Number(p.day)||1, served: Number(p.served)||0, lv: Number(p.lv)||1,
      rate: Number(p.rate)||0, t: Number(p.t)||Date.now()
    };
    await persist();
  }
  return json(res, 200, { top: rankEntries(db.leaderboard, 'profit') });
}

function challengeState(id, day) {
  const key = `${day}:${id}`;
  return db.challenge[key] ||= { attempts: 0, best: 0, scores: [], tokens: [] };
}
function challengeBoard(day) {
  const prefix = `${day}:`;
  const rows = Object.entries(db.challenge).filter(([k]) => k.startsWith(prefix)).map(([k,v]) => ({
    id: k.slice(prefix.length), name: safeName(v.name), s: Number(v.best)||0, b: Number(v.served)||0
  })).filter(x => x.s > 0).sort((a,b)=>b.s-a.s);
  return rows;
}
function challengeWeekBoard(day) {
  const wk = weekKey(day), totals = new Map();
  for (const [key, value] of Object.entries(db.challenge)) {
    const sep = key.indexOf(':'); if (sep < 0) continue;
    const d = key.slice(0, sep), id = key.slice(sep+1);
    if (weekKey(d) !== wk || !value.best) continue;
    const cur = totals.get(id) || { id, name: safeName(value.name), s: 0, b: 0 };
    cur.s += Number(value.best)||0; cur.b += Number(value.served)||0; totals.set(id, cur);
  }
  return [...totals.values()].sort((a,b)=>b.s-a.s);
}

async function apiChallenge(req, res, url) {
  const day = today();
  if (req.method === 'GET') {
    const id = String(url.searchParams.get('id') || '');
    const meState = challengeState(id || 'anonymous', day);
    const top = challengeBoard(day), wtop = challengeWeekBoard(day);
    const rank = id ? Math.max(0, top.findIndex(x=>x.id===id)+1) : 0;
    const wrank = id ? Math.max(0, wtop.findIndex(x=>x.id===id)+1) : 0;
    return json(res, 200, {
      day, top, wtop, total: top.length, wtotal: wtop.length, cups: {},
      me: { left: Math.max(0, 3-meState.attempts), best: meState.best||0, rank,
            wbest: wtop.find(x=>x.id===id)?.s||0, wrank }
    });
  }
  const p = await bodyJson(req), id = String(p.id || '');
  if (!id) return json(res, 400, { error: 'Thiếu mã quán' });
  const state = challengeState(id, p.day || day);
  if (p.op === 'start') {
    if (state.attempts >= 3) return json(res, 429, { error: 'Hôm nay đã hết lượt thi' });
    state.attempts++;
    const token = crypto.randomBytes(12).toString('hex'); state.tokens.push(token); await persist();
    return json(res, 200, { token, day, n: state.attempts });
  }
  if (p.op === 'end') {
    if (!state.tokens.includes(String(p.token||''))) return json(res, 400, { error: 'Lượt thi không hợp lệ' });
    state.name = safeName(p.name); state.best = Math.max(Number(state.best)||0, Number(p.score)||0);
    state.served = Math.max(Number(state.served)||0, Number(p.served)||0); await persist();
    const top = challengeBoard(p.day || day), rank = top.findIndex(x=>x.id===id)+1;
    return json(res, 200, { rank: Math.max(1,rank), total: top.length, best: state.best });
  }
  return json(res, 400, { error: 'Operation không hỗ trợ' });
}

function prankState(id) { return db.prank[id] ||= { sentDay: '', sent: [], inbox: [], off: false }; }
async function apiPrank(req, res, url) {
  if (req.method === 'GET') {
    const id = String(url.searchParams.get('id') || ''), s = prankState(id), d=today();
    if (s.sentDay !== d) { s.sentDay=d; s.sent=[]; }
    const near = rankEntries(db.leaderboard, 'profit', 8).filter(x=>x.id!==id).slice(0,4).map((x,i)=>({id:x.id,name:x.name,lv:x.lv||1,rank:i+1}));
    await persist(); return json(res,200,{left:Math.max(0,3-s.sent.length),sent:s.sent,near});
  }
  const p=await bodyJson(req), id=String(p.id||p.from||'');
  if (p.op === 'send') {
    const from=prankState(String(p.from||'')), to=prankState(String(p.to||'')), d=today();
    if (from.sentDay!==d) { from.sentDay=d; from.sent=[]; }
    if (from.sent.length>=3) return json(res,429,{error:'Hôm nay đã hết lượt gửi'});
    if (!p.to || p.to===p.from) return json(res,400,{error:'Mã quán không hợp lệ'});
    from.sent.push(String(p.to));
    if (!to.off) to.inbox.push({ f:String(p.from), n:safeName(db.leaderboard[p.from]?.name||'Quán bạn'), k:String(p.k||'mac') });
    await persist(); return json(res,200,{name:safeName(db.leaderboard[p.to]?.name||'quán bạn')});
  }
  if (p.op === 'take') {
    const s=prankState(id); s.off=!!p.off; const gifts=s.off?[]:s.inbox.splice(0,6); if(s.off)s.inbox=[]; await persist();
    return json(res,200,{gifts});
  }
  return json(res,400,{error:'Operation không hỗ trợ'});
}

async function apiAi(req,res) {
  const p=await bodyJson(req), stars=Math.max(1,Math.min(5,Math.round(Number(p.s)||3)));
  const q=String(p.q||'').trim();
  const replies = stars>=4
    ? ['Cảm ơn quán nha, tô mì lần này ngon lắm!', 'Vị rất ổn, lần sau mình ghé tiếp nha 🌶️']
    : stars<=2 ? ['Quán xem lại món giúp mình nha, lần này chưa đúng ý lắm.', 'Mình mong lần sau quán làm chuẩn hơn một chút.']
    : ['Cảm ơn quán đã phản hồi, mình sẽ ghé thử lại.', 'Ổn nha, mong lần sau món còn ngon hơn nữa!'];
  return json(res,200,{reply:q ? replies[(q.length+stars)%replies.length] : replies[0], stars});
}

async function serveStatic(req,res,url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname='/index.html';
  const filePath=path.resolve(ROOT,'.'+pathname);
  if (!filePath.startsWith(ROOT+path.sep)) return json(res,403,{error:'forbidden'});
  try {
    const st=await stat(filePath); if(!st.isFile()) throw new Error('not file');
    const ext=path.extname(filePath).toLowerCase();
    res.writeHead(200,{'Content-Type':MIME[ext]||'application/octet-stream','Cache-Control':'no-cache'});
    createReadStream(filePath).pipe(res);
  } catch { res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}); res.end('Not found'); }
}

const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,`http://${req.headers.host||'localhost'}`);
  try {
    if(url.pathname==='/api/lb') return await apiLeaderboard(req,res);
    if(url.pathname==='/api/chal') return await apiChallenge(req,res,url);
    if(url.pathname==='/api/prank') return await apiPrank(req,res,url);
    if(url.pathname==='/api/ai') return await apiAi(req,res);
    return await serveStatic(req,res,url);
  } catch(error) {
    console.error(error); return json(res,error.status||500,{error:error.message||'server error'});
  }
});
server.listen(PORT,'127.0.0.1',()=>console.log(`Tiệm Mì Cay local: http://127.0.0.1:${PORT}`));
