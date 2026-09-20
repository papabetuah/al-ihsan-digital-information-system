const C="alihsan-tv-dashboard-final-v2";
const A=[
  "./","./index.html","./styles.css","./app.js","./config.js","./manifest.webmanifest",
  "./assets/logo-masjid-final.png","./assets/masjid-hero-clean-final.jpg","./assets/qris-rumah-tahfiz-final.jpg",
  "./assets/dashboard-master.png","./assets/dashboard-master-original.png","./assets/dashboard-master-underlay.png","./assets/dashboard-master-overlay.png",
  "./assets/sholat-master.jpg"
];
self.addEventListener("install",e=>e.waitUntil(
  caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting())
));
self.addEventListener("activate",e=>e.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  if(u.hostname.includes("docs.google.com"))return;
  e.respondWith(
    fetch(e.request,{cache:"no-store"}).then(r=>{
      const x=r.clone();caches.open(C).then(c=>c.put(e.request,x));return r
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html")))
  )
});