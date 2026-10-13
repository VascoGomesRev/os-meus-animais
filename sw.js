/* GERADO por ferramentas/gerar-sw.js — não editar à mão. Para atualizar: node ferramentas/gerar-sw.js
   Service worker da app «Os Meus Animais»: guarda todos os ficheiros na primeira abertura e,
   a partir daí, serve-os da cache (funciona sem internet). Cada ficheiro tem uma revisão (hash);
   numa versão nova só se descarregam os ficheiros cuja revisão mudou. */
'use strict';
var VERSAO = "2026-10-13-564b012b";
var CACHE = 'animais-precache';
var FICHEIROS = [
 {
  "u": "./",
  "h": "145f0bdf"
 },
 {
  "u": "animais.js",
  "h": "f4171154"
 },
 {
  "u": "app.js",
  "h": "a1b4bb99"
 },
 {
  "u": "creditos.json",
  "h": "23bc9efe"
 },
 {
  "u": "desenhos.js",
  "h": "f22e637d"
 },
 {
  "u": "desenhos/aves.js",
  "h": "f3f354df"
 },
 {
  "u": "desenhos/casa.js",
  "h": "45011656"
 },
 {
  "u": "desenhos/floresta.js",
  "h": "795d76d2"
 },
 {
  "u": "desenhos/gelo.js",
  "h": "526c661f"
 },
 {
  "u": "desenhos/insetos.js",
  "h": "a8a04e31"
 },
 {
  "u": "desenhos/mar.js",
  "h": "7fdbe7ac"
 },
 {
  "u": "desenhos/quinta.js",
  "h": "161eb3d4"
 },
 {
  "u": "desenhos/selva.js",
  "h": "717599a4"
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
  "h": "4029fe3e"
 },
 {
  "u": "habitats/casa.js",
  "h": "836230e4"
 },
 {
  "u": "habitats/floresta.js",
  "h": "2cf4472e"
 },
 {
  "u": "habitats/gelo.js",
  "h": "391eb399"
 },
 {
  "u": "habitats/insetos.js",
  "h": "79bd823a"
 },
 {
  "u": "habitats/mar.js",
  "h": "484ac947"
 },
 {
  "u": "habitats/quinta.js",
  "h": "705100c8"
 },
 {
  "u": "habitats/selva.js",
  "h": "cd2bc00b"
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
  "h": "145f0bdf"
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
  "u": "sons/baleia.mp3",
  "h": "41518340"
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
  "u": "sons/cobra.mp3",
  "h": "6582285b"
 },
 {
  "u": "sons/coruja.mp3",
  "h": "ff203983"
 },
 {
  "u": "sons/elefante.mp3",
  "h": "093dc9e5"
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
  "u": "sons/galinha.mp3",
  "h": "ea8d1675"
 },
 {
  "u": "sons/galo.mp3",
  "h": "d5ec71e7"
 },
 {
  "u": "sons/ganso.mp3",
  "h": "22f946f5"
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
  "u": "sons/javali.mp3",
  "h": "6e5f78cc"
 },
 {
  "u": "sons/leao.mp3",
  "h": "2acbd737"
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
  "u": "sons/ovelha.mp3",
  "h": "45d73a3b"
 },
 {
  "u": "sons/papagaio.mp3",
  "h": "99b7b34b"
 },
 {
  "u": "sons/passaro.mp3",
  "h": "7738f279"
 },
 {
  "u": "sons/pato.mp3",
  "h": "af2a53d1"
 },
 {
  "u": "sons/pavao.mp3",
  "h": "186de1e8"
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
  "u": "sons/porco.mp3",
  "h": "5dd75f91"
 },
 {
  "u": "sons/porquinho-da-india.mp3",
  "h": "c45b492c"
 },
 {
  "u": "sons/rato.mp3",
  "h": "852de1b9"
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
  "h": "d4b8bdbc"
 },
 {
  "u": "gerado.js",
  "h": "07c64258"
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
