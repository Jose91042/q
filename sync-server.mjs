const url=process.env.SUPABASE_URL||'',key=process.env.SUPABASE_SECRET_KEY||'';
export const syncConfigured=Boolean(/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)&&key);
export function validateState(data){
 if(!data||!Array.isArray(data.records)||data.records.length>20000||!data.favorites||typeof data.favorites!=='object'||Array.isArray(data.favorites))throw Error('Formato de sincronización no válido.');
 for(const r of data.records){if(typeof r.id!=='string'||r.id.length>500||!['esp.1','uefa.champions'].includes(r.league)||!r.bet||typeof r.bet.key!=='string'||typeof r.bet.label!=='string'||!Number.isFinite(r.p)||r.p<0||r.p>1||!Number.isFinite(Date.parse(r.recordedAt))||!Number.isFinite(Date.parse(r.kickoff))||!['pending','settled','void'].includes(r.status))throw Error('Registro no válido.');}
 const entries=Object.entries(data.favorites);if(entries.length>2000)throw Error('Demasiados favoritos.');
 for(const [id,f] of entries)if(!/^(esp\.1|uefa\.champions):[0-9]+$/.test(id)||f.id!==id||typeof f.active!=='boolean'||!Number.isFinite(Date.parse(f.updatedAt))||Date.parse(f.updatedAt)>Date.now()+60000)throw Error('Favorito no válido.');
 return data;
}
export function mergeCloud(a,b){
 const records=new Map(a.records.map(r=>[r.id,r]));
 for(const r of b.records){const old=records.get(r.id);if(!old){records.set(r.id,r);continue;}
  // Keep the earliest frozen forecast; accept newer settlement metadata separately.
  const first=r.recordedAt<old.recordedAt?r:old,last=(r.settledAt||'')>(old.settledAt||'')?r:old;
  records.set(r.id,{...first,...Object.fromEntries(['status','outcome','actual','result','reason','settledAt','revisions'].filter(k=>k in last).map(k=>[k,last[k]]))});
 }
 const favorites={...a.favorites};for(const [id,f]of Object.entries(b.favorites))if(!favorites[id]||f.updatedAt>favorites[id].updatedAt)favorites[id]=f;
 if(records.size>20000)throw Error('El historial supera el límite de sincronización. Exporta una copia antes de ampliar el almacenamiento.');
 return {records:[...records.values()],favorites};
}
async function db(route,options={}){const r=await fetch(url+'/rest/v1/'+route,{...options,headers:{apikey:key,'Content-Type':'application/json',...(key.startsWith('ey')?{Authorization:'Bearer '+key}:{})},signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('La base de datos no está disponible o falta ejecutar el SQL de instalación.');return r.json();}
export async function readCloud(){const rows=await db('quiniela_sync?id=eq.main&select=version,payload');if(!rows.length)throw Error('Falta inicializar la base de datos.');return rows[0];}
export async function writeCloud(incoming){validateState(incoming);for(let attempt=0;attempt<4;attempt++){const row=await readCloud(),payload=mergeCloud(row.payload,incoming);const saved=await db('rpc/quiniela_sync_cas',{method:'POST',body:JSON.stringify({expected_version:row.version,new_payload:payload})});if(saved)return payload;}throw Error('Otro dispositivo está sincronizando. Vuelve a intentarlo.');}
