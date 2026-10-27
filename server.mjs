import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const password=process.env.APP_PASSWORD||'', secret=process.env.SESSION_SECRET||'';
if(password.length<12||secret.length<32||password.startsWith('CAMBIA_')||secret.startsWith('CAMBIA_')){
  console.error('Configura APP_PASSWORD (12 caracteres como minimo) y SESSION_SECRET (32 caracteres aleatorios como minimo) en las variables privadas del alojamiento.');
  process.exit(1);
}
const production=process.env.NODE_ENV==='production';
const publicOrigin=process.env.PUBLIC_ORIGIN||process.env.RENDER_EXTERNAL_URL;
if(production&&!publicOrigin?.startsWith('https://')){console.error('En produccion debes configurar PUBLIC_ORIGIN con la direccion HTTPS de tu web.');process.exit(1);}
const root=fileURLToPath(new URL('./public/',import.meta.url));
const passwordDigest=crypto.createHash('sha256').update(password).digest();
const attempts=new Map(),sessionSeconds=8*60*60;
const sign=value=>crypto.createHmac('sha256',secret).update(value).digest('base64url');
const equal=(a,b)=>a.length===b.length&&crypto.timingSafeEqual(a,b);
const cookie=(value,age=sessionSeconds)=>`quiniela_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${production?'; Secure':''}`;
function authenticated(req){try{const c=req.headers.cookie?.split(';').map(s=>s.trim()).find(s=>s.startsWith('quiniela_session='))?.slice(17);if(!c)return false;const [value,signature]=c.split('.');if(!value||!signature||!equal(Buffer.from(signature),Buffer.from(sign(value))))return false;const token=JSON.parse(Buffer.from(value,'base64url').toString());return Number.isFinite(token.exp)&&token.exp>Date.now()&&token.exp<=Date.now()+sessionSeconds*1000+1000;}catch{return false;}}
function sameOrigin(req){const origin=publicOrigin||(production?'https://':'http://')+req.headers.host;return req.headers.origin===new URL(origin).origin;}
function headers(res,nonce){res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');res.setHeader('Cache-Control','private, no-store');res.setHeader('Content-Security-Policy',`default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com${nonce?" 'nonce-"+nonce+"'":''}; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://a.espncdn.com data:; connect-src 'self' https://site.api.espn.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`);}
function loginPage(res,error='',code=200){const nonce=crypto.randomBytes(16).toString('base64');headers(res,nonce);res.writeHead(code,{'Content-Type':'text/html; charset=utf-8'});res.end(`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Entrar · Quiniela Lab</title><style nonce="${nonce}">*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f2f5ed;color:#193d30;font:16px system-ui}main{width:min(420px,90vw);background:white;border:1px solid #dae3d1;border-radius:18px;padding:35px}small{letter-spacing:2px;font-size:11px}h1{font-size:34px;letter-spacing:-1px}p{font-size:14px;line-height:1.7;color:#75826b}label{display:block;font-size:13px;margin-bottom:8px}input,button{width:100%;padding:14px;border-radius:8px;font:inherit}input{border:1px solid #cfdcc5}button{background:#193d30;color:white;border:0;margin-top:15px;cursor:pointer}.error{color:#9a5035}</style><main><small>QUINIELA LAB</small><h1>Tu acceso privado.</h1><p>Entra con la contraseña de esta aplicación.</p>${error?`<p class="error" role="alert">${error}</p>`:''}<form action="/login" method="post"><label for="password">Contraseña</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="1024"><button>Entrar →</button></form></main></html>`);}
async function readBody(req){let result='';for await(const chunk of req){result+=chunk;if(Buffer.byteLength(result)>4096)throw Error('Body too large');}return result;}
const server=http.createServer(async(req,res)=>{
 try{
  headers(res);const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/health'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'text/plain'});return res.end('ok');}
  if(url.pathname==='/login'){
   if(req.method==='GET')return loginPage(res);
   if(req.method!=='POST'){res.writeHead(405);return res.end();}
   if(!sameOrigin(req)){res.writeHead(403);return res.end('Origen no permitido');}
   const ip=process.env.TRUST_PROXY==='true'?String(req.headers['x-forwarded-for']||req.socket.remoteAddress).split(',')[0].trim():req.socket.remoteAddress;
   const now=Date.now();let limit=attempts.get(ip);if(limit&&now-limit.since>15*60*1000){attempts.delete(ip);limit=null;}
   if(limit?.count>=5){res.setHeader('Retry-After','900');return loginPage(res,'Demasiados intentos. Espera 15 minutos para volver a intentarlo.',429);}
   const input=new URLSearchParams(await readBody(req)).get('password')||'';
   const ok=equal(crypto.createHash('sha256').update(input).digest(),passwordDigest);
   if(!ok){attempts.set(ip,{since:limit?.since||now,count:(limit?.count||0)+1});return loginPage(res,'Contraseña incorrecta.',401);}
   attempts.delete(ip);
   const token=Buffer.from(JSON.stringify({exp:now+sessionSeconds*1000,nonce:crypto.randomBytes(16).toString('hex')})).toString('base64url');
   res.setHeader('Set-Cookie',cookie(token+'.'+sign(token)));res.writeHead(303,{Location:'/'});return res.end();
  }
  if(url.pathname==='/logout'&&req.method==='POST'){
   if(!sameOrigin(req)){res.writeHead(403);return res.end();}res.setHeader('Set-Cookie',cookie('',0));res.writeHead(303,{Location:'/login'});return res.end();
  }
  if(!authenticated(req)){res.writeHead(303,{Location:'/login'});return res.end();}
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
  let target=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!target.startsWith(root)){res.writeHead(403);return res.end();}
  try{target=await fs.realpath(target);if(!target.startsWith(await fs.realpath(root)+path.sep)){res.writeHead(403);return res.end();}const content=await fs.readFile(target);const ext=path.extname(target);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'})[ext]||'application/octet-stream'});return res.end(req.method==='HEAD'?undefined:content);}catch{res.writeHead(404);return res.end('No encontrado');}
 }catch{if(!res.headersSent)res.writeHead(400);res.end('Peticion no valida');}
});
setInterval(()=>{for(const [ip,a] of attempts)if(Date.now()-a.since>15*60*1000)attempts.delete(ip);},60000).unref();
server.listen(Number(process.env.PORT)||3000,process.env.HOST||'0.0.0.0',()=>console.log('Quiniela Lab lista en el puerto '+(process.env.PORT||3000)));
