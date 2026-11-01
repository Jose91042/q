import {MODEL_VERSION} from './history-core.js';
import {wilson} from './advanced-model.js';
export function prospectiveEvidence(records,league,bet){
 const band=p=>Math.min(9,Math.floor(p*10)),unique=new Map();
 for(const r of records){if(r.league!==league||r.version!==MODEL_VERSION||r.kind!=='automatic'||r.experimental||r.bet?.key!==bet.key||r.status!=='settled'||typeof r.outcome!=='boolean'||!Number.isFinite(r.p)||r.p<0||r.p>1||band(r.p)!==band(bet.p)||!(Date.parse(r.recordedAt)<Date.parse(r.kickoff)))continue;
 const old=unique.get(r.matchId);if(!old||r.recordedAt<old.recordedAt)unique.set(r.matchId,r);
 }
 const rows=[...unique.values()],n=rows.length,hit=rows.filter(r=>r.outcome).length;
 const interval=wilson(hit,n),mean=n?rows.reduce((s,r)=>s+r.p,0)/n:null;
 return {n,hit,rate:n?hit/n:null,interval,mean,ready:n>=100,score:n>=100?interval[0]:0};
}
const percent=p=>(p*100).toFixed(1).replace('.',',')+' %';
export function reliabilityHtml(v){return `<div class="observed-evidence"><b>${v.ready?'Acierto observado en el seguimiento':'Sin seguimiento suficiente'}</b>${v.n?`<p>${v.hit} de ${v.n} partidos: <b>${percent(v.rate)}</b> cumplido. Intervalo descriptivo del 95 %: ${percent(v.interval[0])}–${percent(v.interval[1])}.</p>`:'<p>Todavía no hay resultados registrados antes de jugar para esta línea y banda de probabilidad.</p>'}<small>Misma competición, mercado, ámbito y banda. ${v.ready?'Muestra de al menos 100 partidos; no certifica el próximo resultado.':'Se exigen 100 partidos distintos para el filtro de seguimiento; no es una certificación estadística.'} Registro del usuario, no auditado externamente.</small></div>`;}
