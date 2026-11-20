// Service worker: deixa o app funcionando offline (ex.: no celular sem sinal).
// Ao mudar arquivos do app, incremente VERSAO para os aparelhos baixarem a nova versão.
const VERSAO = "cp-v3";
const ARQUIVOS = [
  "./", "./index.html", "./css/style.css", "./icon.svg", "./manifest.webmanifest",
  "./js/app.js", "./js/data/edital.js", "./js/data/cronograma.js", "./js/data/questoes.js", "./js/data/flashcards.js",
];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k)))));
  self.clients.claim();
});
// Rede primeiro (pega atualizações), cache como reserva (offline).
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((r) => { const cp = r.clone(); caches.open(VERSAO).then((c) => c.put(e.request, cp)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
