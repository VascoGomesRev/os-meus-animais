/* GERADO por ferramentas/gerar-sw.js — não editar à mão. Para atualizar: node ferramentas/gerar-sw.js
   Service worker da app «Os Meus Animais»: guarda todos os ficheiros na primeira abertura e,
   a partir daí, serve-os da cache (funciona sem internet). Cada ficheiro tem uma revisão (hash);
   numa versão nova só se descarregam os ficheiros cuja revisão mudou. */
'use strict';
var VERSAO = "2026-10-18-fe76dd94";
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
  "h": "9603e247"
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
  "h": "c27a5150"
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
  "h": "c0a71058"
 },
 {
  "u": "sons/cao.mp3",
  "h": "e2c9cf77"
 },
 {
  "u": "sons/cavalo.mp3",
  "h": "d6a457ee"
 },
 {
  "u": "sons/coelho.mp3",
  "h": "e5abb406"
 },
 {
  "u": "sons/elefante.mp3",
  "h": "6220df9b"
 },
 {
  "u": "sons/galo.mp3",
  "h": "53d82f39"
 },
 {
  "u": "sons/gato.mp3",
  "h": "325347b6"
 },
 {
  "u": "sons/girafa.mp3",
  "h": "df1831cf"
 },
 {
  "u": "sons/leao.mp3",
  "h": "417f8135"
 },
 {
  "u": "sons/macaco.mp3",
  "h": "f2698c60"
 },
 {
  "u": "sons/ovelha.mp3",
  "h": "94ffc82c"
 },
 {
  "u": "sons/passarinho.mp3",
  "h": "a9ca321e"
 },
 {
  "u": "sons/pato.mp3",
  "h": "adf20827"
 },
 {
  "u": "sons/peixe.mp3",
  "h": "bba757e1"
 },
 {
  "u": "sons/porco.mp3",
  "h": "88587c8c"
 },
 {
  "u": "sons/sapo.mp3",
  "h": "416942bc"
 },
 {
  "u": "sons/vaca.mp3",
  "h": "5648f7b8"
 },
 {
  "u": "sons/zebra.mp3",
  "h": "d6a457ee"
 },
 {
  "u": "vozes/abelha.mp3",
  "h": "32c8e329"
 },
 {
  "u": "vozes/cao.mp3",
  "h": "2c045154"
 },
 {
  "u": "vozes/cavalo.mp3",
  "h": "707d0041"
 },
 {
  "u": "vozes/coala.mp3",
  "h": "27cd5c4d"
 },
 {
  "u": "vozes/coelho.mp3",
  "h": "2fe9b1ef"
 },
 {
  "u": "vozes/elefante.mp3",
  "h": "158c9664"
 },
 {
  "u": "vozes/galo.mp3",
  "h": "62fa8d59"
 },
 {
  "u": "vozes/gato.mp3",
  "h": "3284d1c8"
 },
 {
  "u": "vozes/girafa.mp3",
  "h": "11a778d8"
 },
 {
  "u": "vozes/leao.mp3",
  "h": "eed736ef"
 },
 {
  "u": "vozes/macaco.mp3",
  "h": "1c924247"
 },
 {
  "u": "vozes/ovelha.mp3",
  "h": "59b24c7c"
 },
 {
  "u": "vozes/passarinho.mp3",
  "h": "c77d72c2"
 },
 {
  "u": "vozes/pato.mp3",
  "h": "883f419a"
 },
 {
  "u": "vozes/peixe.mp3",
  "h": "43d7d2c8"
 },
 {
  "u": "vozes/porco.mp3",
  "h": "cafa53f8"
 },
 {
  "u": "vozes/raposa.mp3",
  "h": "e6746dad"
 },
 {
  "u": "vozes/sapo.mp3",
  "h": "d2f99249"
 },
 {
  "u": "vozes/vaca.mp3",
  "h": "0f7dfc76"
 },
 {
  "u": "vozes/zebra.mp3",
  "h": "b5009300"
 },
 {
  "u": "gerado.js",
  "h": "36523f83"
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
