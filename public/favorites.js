const key='ql-favorites-v1';
export function favorites(){try{return JSON.parse(localStorage.getItem(key)||'{}');}catch{return {};}}
export function isFavorite(league,id){return favorites()[league+':'+id]?.active===true;}
export function toggleFavorite(league,m){const all=favorites(),id=league+':'+m.id;all[id]={id,league,matchId:m.id,home:m.home.name,away:m.away.name,kickoff:m.date,active:!all[id]?.active,updatedAt:new Date().toISOString()};localStorage.setItem(key,JSON.stringify(all));window.dispatchEvent(new Event('favorites-changed'));}
export function mergeFavorites(remote){const all=favorites();for(const r of Object.values(remote||{}))if(r?.id&&(!all[r.id]||r.updatedAt>all[r.id].updatedAt))all[r.id]=r;localStorage.setItem(key,JSON.stringify(all));window.dispatchEvent(new Event('favorites-changed'));}
