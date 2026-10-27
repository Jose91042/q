const VERSION='ql-public-v1';
// Only a public offline notice is cached. Protected pages, scripts, statistics,
// credentials and POST responses are always fetched from the network.
self.addEventListener('install',event=>{event.waitUntil(caches.open(VERSION).then(cache=>cache.add('/offline.html')));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ql-public-')&&k!==VERSION).map(k=>caches.delete(k)))),self.clients.claim()]));});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||event.request.mode!=='navigate'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(fetch(event.request).catch(()=>caches.match('/offline.html')));});
