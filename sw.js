/* GERADO por ferramentas/gerar-sw.js — não editar à mão. Para atualizar: node ferramentas/gerar-sw.js
   Service worker da app «Os Meus Animais»: guarda todos os ficheiros na primeira abertura e,
   a partir daí, serve-os da cache (funciona sem internet). Cada ficheiro tem uma revisão (hash);
   numa versão nova só se descarregam os ficheiros cuja revisão mudou. */
'use strict';
var VERSAO = "2026-10-18-b8d79479";
var CACHE = 'animais-precache';
var FICHEIROS = [
 {
  "u": "./",
  "h": "42338b88"
 },
 {
  "u": "animais.js",
  "h": "7969f338"
 },
 {
  "u": "animais/abelha.js",
  "h": "f2344fef"
 },
 {
  "u": "animais/cao.js",
  "h": "e8d71a32"
 },
 {
  "u": "animais/cavalo.js",
  "h": "29f17b45"
 },
 {
  "u": "animais/coala.js",
  "h": "84cb023f"
 },
 {
  "u": "animais/coelho.js",
  "h": "59def928"
 },
 {
  "u": "animais/elefante.js",
  "h": "f9d48701"
 },
 {
  "u": "animais/galo.js",
  "h": "afbe2c83"
 },
 {
  "u": "animais/gato.js",
  "h": "462e82b4"
 },
 {
  "u": "animais/girafa.js",
  "h": "60d7d780"
 },
 {
  "u": "animais/leao.js",
  "h": "f5c9ffd3"
 },
 {
  "u": "animais/macaco.js",
  "h": "c2985a9f"
 },
 {
  "u": "animais/ovelha.js",
  "h": "89372f5f"
 },
 {
  "u": "animais/passarinho.js",
  "h": "b7b31b9f"
 },
 {
  "u": "animais/pato.js",
  "h": "305133f2"
 },
 {
  "u": "animais/peixe.js",
  "h": "821fa6af"
 },
 {
  "u": "animais/porco.js",
  "h": "427bcf81"
 },
 {
  "u": "animais/raposa.js",
  "h": "1e4e73d6"
 },
 {
  "u": "animais/sapo.js",
  "h": "692f22d3"
 },
 {
  "u": "animais/vaca.js",
  "h": "b512748b"
 },
 {
  "u": "animais/zebra.js",
  "h": "a8407c3b"
 },
 {
  "u": "app.js",
  "h": "c4adf0ef"
 },
 {
  "u": "creditos.json",
  "h": "a6049736"
 },
 {
  "u": "fontes/baloo2.woff2",
  "h": "ae196042"
 },
 {
  "u": "fontes/nunito.woff2",
  "h": "76388dbf"
 },
 {
  "u": "icones/icon-192.png",
  "h": "11f59301"
 },
 {
  "u": "icones/icon-512.png",
  "h": "64fc15da"
 },
 {
  "u": "icones/icon-maskable-512.png",
  "h": "afc99c1d"
 },
 {
  "u": "index.html",
  "h": "42338b88"
 },
 {
  "u": "manifest.webmanifest",
  "h": "d8505436"
 },
 {
  "u": "sons/abelha.mp3",
  "h": "9d6caaeb"
 },
 {
  "u": "sons/cao.mp3",
  "h": "af9bdd82"
 },
 {
  "u": "sons/cavalo.mp3",
  "h": "a3cf4c4d"
 },
 {
  "u": "sons/coelho.mp3",
  "h": "0e9ca2d1"
 },
 {
  "u": "sons/elefante.mp3",
  "h": "ea755199"
 },
 {
  "u": "sons/galo.mp3",
  "h": "7c1f4126"
 },
 {
  "u": "sons/gato.mp3",
  "h": "85419617"
 },
 {
  "u": "sons/girafa.mp3",
  "h": "d89a3222"
 },
 {
  "u": "sons/leao.mp3",
  "h": "a28cafa3"
 },
 {
  "u": "sons/macaco.mp3",
  "h": "f76a5499"
 },
 {
  "u": "sons/ovelha.mp3",
  "h": "b27c0a53"
 },
 {
  "u": "sons/passarinho.mp3",
  "h": "181c3e38"
 },
 {
  "u": "sons/pato.mp3",
  "h": "5ee95ec6"
 },
 {
  "u": "sons/peixe.mp3",
  "h": "5db6ac74"
 },
 {
  "u": "sons/porco.mp3",
  "h": "5c416834"
 },
 {
  "u": "sons/sapo.mp3",
  "h": "d2e4ce1b"
 },
 {
  "u": "sons/vaca.mp3",
  "h": "1868d234"
 },
 {
  "u": "sons/zebra.mp3",
  "h": "a3cf4c4d"
 },
 {
  "u": "vozes/abelha.mp3",
  "h": "630cca35"
 },
 {
  "u": "vozes/cao.mp3",
  "h": "0b84c2ed"
 },
 {
  "u": "vozes/cavalo.mp3",
  "h": "62bee6f0"
 },
 {
  "u": "vozes/coala.mp3",
  "h": "1ef8898c"
 },
 {
  "u": "vozes/coelho.mp3",
  "h": "56955798"
 },
 {
  "u": "vozes/elefante.mp3",
  "h": "6aa4749a"
 },
 {
  "u": "vozes/galo.mp3",
  "h": "74b472b0"
 },
 {
  "u": "vozes/gato.mp3",
  "h": "d4e3e33b"
 },
 {
  "u": "vozes/girafa.mp3",
  "h": "b91ae375"
 },
 {
  "u": "vozes/leao.mp3",
  "h": "a3413212"
 },
 {
  "u": "vozes/macaco.mp3",
  "h": "6ce59303"
 },
 {
  "u": "vozes/ovelha.mp3",
  "h": "8a54b09d"
 },
 {
  "u": "vozes/passarinho.mp3",
  "h": "36782492"
 },
 {
  "u": "vozes/pato.mp3",
  "h": "fbad399f"
 },
 {
  "u": "vozes/peixe.mp3",
  "h": "30d3bd51"
 },
 {
  "u": "vozes/porco.mp3",
  "h": "02380f6f"
 },
 {
  "u": "vozes/raposa.mp3",
  "h": "9e1d9cdd"
 },
 {
  "u": "vozes/sapo.mp3",
  "h": "7b6c97ae"
 },
 {
  "u": "vozes/vaca.mp3",
  "h": "c8fc128d"
 },
 {
  "u": "vozes/zebra.mp3",
  "h": "1a43680f"
 },
 {
  "u": "gerado.js",
  "h": "baebc5bf"
 }
];

var RAIZ = new URL('./', self.location.href).href;
var MAPA = {};  // URL do ficheiro (sem query) → URL com a revisão, que é a chave na cache
FICHEIROS.forEach(function (f) {
  var u = new URL(f.u, self.location.href);
  var semQuery = u.href;
  u.searchParams.set('__rev', f.h);
  MAPA[semQuery] = u.href;
});
var REVISOES = Object.keys(MAPA).map(function (k) { return MAPA[k]; });

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.keys().then(function (existentes) {
      var temos = {};
      existentes.forEach(function (r) { temos[r.url] = true; });
      var emFalta = REVISOES.filter(function (rev) { return !temos[rev]; });
      return Promise.all(emFalta.map(function (rev) {
        return fetch(rev).then(function (res) {
          if (!res.ok) throw new Error('Falhou ' + rev + ' (' + res.status + ')');
          return c.put(rev, res);
        });
      }));
    });
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    var validos = {};
    REVISOES.forEach(function (rev) { validos[rev] = true; });
    return c.keys().then(function (chaves) {        // apaga revisões antigas
      return Promise.all(chaves.filter(function (r) { return !validos[r.url]; }).map(function (r) { return c.delete(r); }));
    });
  }).then(function () {
    return caches.keys();                            // apaga caches de esquemas anteriores
  }).then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var u = new URL(e.request.url);
  u.search = ''; u.hash = '';
  var rev = MAPA[u.href];
  if (!rev) return;                                  // não é um ficheiro da app: segue para a rede
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(rev).then(function (r) {
      if (r) return r;
      return fetch(e.request).then(function (res) {  // faltava na cache: vai à rede e guarda
        if (res.ok) c.put(rev, res.clone());
        return res;
      }).catch(function () {
        if (e.request.mode === 'navigate') return c.match(MAPA[RAIZ]);
        return Response.error();
      });
    });
  }));
});
