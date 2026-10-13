/* GERADO por ferramentas/gerar-sw.js — não editar à mão. Para atualizar: node ferramentas/gerar-sw.js
   Service worker da app «Os Meus Animais»: guarda todos os ficheiros na primeira abertura e,
   a partir daí, serve-os da cache (funciona sem internet). Cada ficheiro tem uma revisão (hash);
   numa versão nova só se descarregam os ficheiros cuja revisão mudou. */
'use strict';
var VERSAO = "2026-10-13-15feb6bc";
var CACHE = 'animais-precache';
var FICHEIROS = [
 {
  "u": "./",
  "h": "40292d29"
 },
 {
  "u": "animais.js",
  "h": "df03df11"
 },
 {
  "u": "app.js",
  "h": "e6bfaa6c"
 },
 {
  "u": "creditos.json",
  "h": "baea435c"
 },
 {
  "u": "desenhos.js",
  "h": "f22e637d"
 },
 {
  "u": "desenhos/aves.js",
  "h": "067f15f4"
 },
 {
  "u": "desenhos/casa.js",
  "h": "2443511c"
 },
 {
  "u": "desenhos/floresta.js",
  "h": "3402bfc5"
 },
 {
  "u": "desenhos/gelo.js",
  "h": "9faaae27"
 },
 {
  "u": "desenhos/insetos.js",
  "h": "83684f88"
 },
 {
  "u": "desenhos/mar.js",
  "h": "8bb42bcf"
 },
 {
  "u": "desenhos/quinta.js",
  "h": "c676b2a9"
 },
 {
  "u": "desenhos/selva.js",
  "h": "3e235f44"
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
  "u": "habitats.js",
  "h": "1d5d8857"
 },
 {
  "u": "habitats/aves.js",
  "h": "db6b9b00"
 },
 {
  "u": "habitats/casa.js",
  "h": "eb98f61f"
 },
 {
  "u": "habitats/floresta.js",
  "h": "3873015c"
 },
 {
  "u": "habitats/gelo.js",
  "h": "07c5f191"
 },
 {
  "u": "habitats/insetos.js",
  "h": "b418e789"
 },
 {
  "u": "habitats/mar.js",
  "h": "9db6c3c5"
 },
 {
  "u": "habitats/quinta.js",
  "h": "fbf736e4"
 },
 {
  "u": "habitats/selva.js",
  "h": "6675942a"
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
  "h": "40292d29"
 },
 {
  "u": "manifest.webmanifest",
  "h": "d8505436"
 },
 {
  "u": "sons/abelha.mp3",
  "h": "7f723c65"
 },
 {
  "u": "sons/aguia.mp3",
  "h": "1d55dc97"
 },
 {
  "u": "sons/andorinha.mp3",
  "h": "08a151d7"
 },
 {
  "u": "sons/arara.mp3",
  "h": "f667ea0f"
 },
 {
  "u": "sons/baleia.mp3",
  "h": "41518340"
 },
 {
  "u": "sons/beluga.mp3",
  "h": "d88f5617"
 },
 {
  "u": "sons/bode.mp3",
  "h": "d5145d78"
 },
 {
  "u": "sons/burro.mp3",
  "h": "75c54419"
 },
 {
  "u": "sons/cabra.mp3",
  "h": "3223c523"
 },
 {
  "u": "sons/cachalote.mp3",
  "h": "bee88902"
 },
 {
  "u": "sons/cao.mp3",
  "h": "69877e72"
 },
 {
  "u": "sons/cavalo.mp3",
  "h": "804cf874"
 },
 {
  "u": "sons/cegonha.mp3",
  "h": "c1d7e60c"
 },
 {
  "u": "sons/chimpanze.mp3",
  "h": "a01ca5b4"
 },
 {
  "u": "sons/cigarra.mp3",
  "h": "df69c273"
 },
 {
  "u": "sons/cobra.mp3",
  "h": "6582285b"
 },
 {
  "u": "sons/codorniz.mp3",
  "h": "83706dc7"
 },
 {
  "u": "sons/cordeiro.mp3",
  "h": "ac5df6f5"
 },
 {
  "u": "sons/coruja.mp3",
  "h": "ff203983"
 },
 {
  "u": "sons/corvo.mp3",
  "h": "e53227d5"
 },
 {
  "u": "sons/cuco.mp3",
  "h": "22d9864e"
 },
 {
  "u": "sons/elefante.mp3",
  "h": "093dc9e5"
 },
 {
  "u": "sons/faisao.mp3",
  "h": "a787a130"
 },
 {
  "u": "sons/falcao.mp3",
  "h": "42c4ee91"
 },
 {
  "u": "sons/foca.mp3",
  "h": "c43e4ef2"
 },
 {
  "u": "sons/gafanhoto.mp3",
  "h": "5d278f36"
 },
 {
  "u": "sons/gaivota.mp3",
  "h": "8e4a90ce"
 },
 {
  "u": "sons/galinha-da-india.mp3",
  "h": "91786dd5"
 },
 {
  "u": "sons/galinha.mp3",
  "h": "ea8d1675"
 },
 {
  "u": "sons/galo.mp3",
  "h": "d5ec71e7"
 },
 {
  "u": "sons/ganso.mp3",
  "h": "f445358c"
 },
 {
  "u": "sons/gato.mp3",
  "h": "44a15c5b"
 },
 {
  "u": "sons/golfinho.mp3",
  "h": "97ced9cd"
 },
 {
  "u": "sons/grilo.mp3",
  "h": "ee81ae98"
 },
 {
  "u": "sons/hiena.mp3",
  "h": "1a066266"
 },
 {
  "u": "sons/jacare.mp3",
  "h": "df66ca40"
 },
 {
  "u": "sons/javali.mp3",
  "h": "6e5f78cc"
 },
 {
  "u": "sons/leao.mp3",
  "h": "2acbd737"
 },
 {
  "u": "sons/leitao.mp3",
  "h": "86b1bb35"
 },
 {
  "u": "sons/lobo.mp3",
  "h": "ff152219"
 },
 {
  "u": "sons/macaco.mp3",
  "h": "8886f945"
 },
 {
  "u": "sons/melro.mp3",
  "h": "bf896ecb"
 },
 {
  "u": "sons/mocho.mp3",
  "h": "f744b986"
 },
 {
  "u": "sons/orca.mp3",
  "h": "d49692cf"
 },
 {
  "u": "sons/ovelha.mp3",
  "h": "45d73a3b"
 },
 {
  "u": "sons/papagaio.mp3",
  "h": "99b7b34b"
 },
 {
  "u": "sons/pardal.mp3",
  "h": "964d27db"
 },
 {
  "u": "sons/passaro.mp3",
  "h": "7738f279"
 },
 {
  "u": "sons/pato.mp3",
  "h": "5e7d236d"
 },
 {
  "u": "sons/pavao.mp3",
  "h": "186de1e8"
 },
 {
  "u": "sons/pega.mp3",
  "h": "81ba5108"
 },
 {
  "u": "sons/perdiz.mp3",
  "h": "9cf86b1e"
 },
 {
  "u": "sons/periquito.mp3",
  "h": "f510183c"
 },
 {
  "u": "sons/peru.mp3",
  "h": "4a5b7ce2"
 },
 {
  "u": "sons/pica-pau.mp3",
  "h": "5d39b6fa"
 },
 {
  "u": "sons/pinguim.mp3",
  "h": "920fc378"
 },
 {
  "u": "sons/pinto.mp3",
  "h": "c2c24844"
 },
 {
  "u": "sons/pomba.mp3",
  "h": "9b6170f4"
 },
 {
  "u": "sons/ponei.mp3",
  "h": "11d0672e"
 },
 {
  "u": "sons/porco.mp3",
  "h": "5dd75f91"
 },
 {
  "u": "sons/porquinho-da-india.mp3",
  "h": "c45b492c"
 },
 {
  "u": "sons/potro.mp3",
  "h": "9dfdcf46"
 },
 {
  "u": "sons/ra.mp3",
  "h": "d78f4e5e"
 },
 {
  "u": "sons/rato.mp3",
  "h": "852de1b9"
 },
 {
  "u": "sons/rouxinol.mp3",
  "h": "ceb0e9b3"
 },
 {
  "u": "sons/sapo.mp3",
  "h": "e64eec59"
 },
 {
  "u": "sons/tigre.mp3",
  "h": "735585b4"
 },
 {
  "u": "sons/urso.mp3",
  "h": "7c06088d"
 },
 {
  "u": "sons/vaca.mp3",
  "h": "8f708ad2"
 },
 {
  "u": "sons/vespa.mp3",
  "h": "b09a1a1d"
 },
 {
  "u": "sons/zangao.mp3",
  "h": "6a1fca02"
 },
 {
  "u": "gerado.js",
  "h": "e571d037"
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
