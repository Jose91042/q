export function quality(match,ctx,family='goals',now=Date.now()){
 const fields=family==='corners'?['hc','ac']:family==='sot'?['hst','ast']:['hg','ag'];
 const past=ctx.matches.filter(m=>m.done&&Date.parse(m.date)<Math.min(now,Date.parse(match.date)));
 const teams=['home','away'].map(side=>{
  const games=past.filter(m=>m.home.id===match[side].id||m.away.id===match[side].id).slice(-10);
  const covered=games.filter(m=>fields.every(f=>Number.isFinite(m[f])&&m[f]>=0));
  return {name:match[side].name,n:games.length,covered:covered.length,last:games.at(-1)?.date};
 });
 const age=now-Date.parse(ctx.fetched),fresh=!ctx.cached&&Number.isFinite(age)&&age>=-60000&&age<=3600000;
 const enough=teams.every(t=>t.covered>=5&&t.covered/Math.max(1,t.n)>=.8&&now-Date.parse(t.last)<=30*86400000);
 return {fresh,teams,ok:fresh&&enough,reason:!fresh?'Actualiza la fuente: copia guardada o consulta de más de una hora.':!enough?'Muestra insuficiente, incompleta o demasiado antigua para recomendar este mercado.':'Fuente reciente y cobertura mínima completa. Esto no demuestra acierto futuro.'};
}
export function matchLineup(summary){
 const rosters=summary.rosters||[];
 const published=rosters.length===2&&rosters.every(t=>(t.roster||[]).filter(p=>p.starter===true).length===11);
 return {published,players:rosters.flatMap(t=>(t.roster||[]).map(p=>({id:String(p.athlete?.id),name:p.athlete?.displayName,team:t.team?.displayName,starter:p.starter===true}))),injuries:Array.isArray(summary.injuries)?summary.injuries:null};
}
export function minutesOf(p){const s=p.stats?.find(s=>['minutesPlayed','minutes'].includes(s.name));return s&&Number.isFinite(s.value)&&s.value>=0?s.value:null;}
export function mountQuality(ctx){const el=document.querySelector('#data-quality');if(!el)return;const past=ctx.matches.filter(m=>m.done&&Date.parse(m.date)<Date.now());el.textContent=`ESPN · consulta ${new Date(ctx.fetched).toLocaleString('es-ES')} · ${ctx.cached?'COPIA GUARDADA':'consulta en línea'} · partidos con estadística completa: `+[['goles','hg','ag'],['córners','hc','ac'],['a puerta','hst','ast']].map(([n,a,b])=>`${n} ${past.filter(m=>Number.isFinite(m[a])&&Number.isFinite(m[b])).length}/${past.length}`).join(' · ')+'. Las recomendaciones exigen consulta de menos de una hora, cinco partidos válidos por equipo y al menos 80 % de cobertura en sus últimos diez.';}
