const CACHE = 'mp-emprestimo-v4';
const FILES = [
  '/Mateus/consulta.html',
  '/Mateus/manifest.json',
  '/Mateus/icon-192.png',
  '/Mateus/icon-512.png'
];

// Instala e cacheia só arquivos estáticos (NÃO o index.html)
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(FILES);
    }).catch(function(){})
  );
  self.skipWaiting();
});

// Limpa caches antigos
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// index.html sempre busca da rede (nunca do cache)
self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  
  // index.html: sempre da rede para ter data atualizada
  if (url.includes('index.html') || url.endsWith('/Mateus/') || url.endsWith('/Mateus')) {
    e.respondWith(
      fetch(e.request).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }
  
  // Outros arquivos: cache primeiro
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(response) {
        return caches.open(CACHE).then(function(cache) {
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});
