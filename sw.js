const CACHE='project70-v5';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(ASSETS);await self.skipWaiting()})());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim()})());
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 const refresh=['document','script','style'].includes(event.request.destination);
 if(refresh){
  event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(event.request);if(response&&response.ok)await cache.put(event.request,response.clone());return response}catch(error){const cached=await cache.match(event.request);if(cached)return cached;if(event.request.mode==='navigate')return cache.match('./index.html');throw error}})());
 }else event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request)));
});
self.addEventListener('push',event=>{let d={title:'Project 70',body:'Your next quest is ready.'};try{d=Object.assign(d,event.data.json())}catch{}event.waitUntil(self.registration.showNotification(d.title,{body:d.body,icon:'./icon.svg',badge:'./icon.svg',data:{url:'./'}}))});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(w=>{for(const c of w){if('focus'in c)return c.focus()}return self.clients.openWindow('./')}))});
