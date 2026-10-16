#!/usr/bin/env node
/* Gera dois ficheiros a partir do que existe na pasta da app:
   - sw.js     → service worker: guarda todos os ficheiros para a app funcionar sem internet
   - gerado.js → VERSAO (data + hash do conteúdo) e MEDIA_EMBUTIDA (sons em sons/, vozes gravadas em vozes/ e sílabas dos sons)
   Correr sempre que se altere um ficheiro da app, antes do commit:   node ferramentas/gerar-sw.js
   Cada ficheiro leva a sua «revisão» (hash do conteúdo), por isso uma atualização só descarrega
   no telemóvel os ficheiros que mudaram. */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RAIZ = path.resolve(__dirname, '..');
const PASTAS_MEDIA = ['icones', 'fontes', 'sons', 'vozes', 'animais'];
const TOPO = /\.(html|js|webmanifest|json)$/i;        // ficheiros da raiz que entram na cache
const MEDIA = /\.(png|mp3|woff2|js)$/i;               // ficheiros das subpastas que entram na cache
const GERADOS = new Set(['sw.js', 'gerado.js']);       // saídas deste script

const ler = f => { try { return fs.readFileSync(path.join(RAIZ, f), 'utf8'); } catch (e) { return null; } };
const hashDe = buf => crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);

const MODELO_SW = `/* GERADO por ferramentas/gerar-sw.js — não editar à mão. Para atualizar: node ferramentas/gerar-sw.js
   Service worker da app «Os Meus Animais»: guarda todos os ficheiros na primeira abertura e,
   a partir daí, serve-os da cache (funciona sem internet). Cada ficheiro tem uma revisão (hash);
   numa versão nova só se descarregam os ficheiros cuja revisão mudou. */
'use strict';
var VERSAO = "__VERSAO__";
var CACHE = 'animais-precache';
var FICHEIROS = __FICHEIROS__;

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
`;

function listarFicheiros() {
  const lista = [];
  for (const e of fs.readdirSync(RAIZ, { withFileTypes: true }))
    if (e.isFile() && TOPO.test(e.name) && !GERADOS.has(e.name)) lista.push(e.name);
  for (const p of PASTAS_MEDIA) {
    const dir = path.join(RAIZ, p);
    if (!fs.existsSync(dir)) continue;
    for (const e of fs.readdirSync(dir, { withFileTypes: true }))
      if (e.isFile() && MEDIA.test(e.name)) lista.push(p + '/' + e.name);
  }
  return lista.sort();
}
function idsEm(pasta, ext) {
  const dir = path.join(RAIZ, pasta);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(n => n.toLowerCase().endsWith(ext)).map(n => n.slice(0, -ext.length)).sort();
}

function gerar({ escrever = true } = {}) {
  const lista = listarFicheiros();
  const entradas = [];
  let tamanho = 0;
  for (const f of lista) {
    const buf = fs.readFileSync(path.join(RAIZ, f));
    tamanho += buf.length;
    entradas.push({ u: f, h: hashDe(buf) });
  }
  // Versão: data de hoje + hash de todas as revisões. Se nada mudou, mantém a versão (e a data) anterior.
  const hashGlobal = hashDe(entradas.map(e => e.u + ':' + e.h).join('\n'));
  const anterior = (ler('gerado.js') || '').match(/VERSAO = "([^"]+)"/);
  const versao = anterior && anterior[1].endsWith('-' + hashGlobal) ? anterior[1] : new Date().toISOString().slice(0, 10) + '-' + hashGlobal;

  const silabas = JSON.parse(ler('sons/silabas.json') || '{}');   // escrito por ferramentas/limpar-voz.js
  const media = { sons: idsEm('sons', '.mp3'), vozes: idsEm('vozes', '.mp3'), silabas };
  const gerado = '/* GERADO por ferramentas/gerar-sw.js — não editar à mão. Para atualizar: node ferramentas/gerar-sw.js */\n' +
    'const VERSAO = "' + versao + '";\n' +
    'const MEDIA_EMBUTIDA = ' + JSON.stringify(media) + ';\n';

  const indice = entradas.find(e => e.u === 'index.html');
  const paraCache = [
    { u: './', h: indice ? indice.h : '0' },   // a página de arranque (start_url)
    ...entradas,
    { u: 'gerado.js', h: hashDe(gerado) }
  ];
  const sw = MODELO_SW.replace('__VERSAO__', versao).replace('__FICHEIROS__', JSON.stringify(paraCache, null, 1));

  let mudou = false;
  if (escrever) {
    if (ler('gerado.js') !== gerado) { fs.writeFileSync(path.join(RAIZ, 'gerado.js'), gerado); mudou = true; }
    if (ler('sw.js') !== sw) { fs.writeFileSync(path.join(RAIZ, 'sw.js'), sw); mudou = true; }
  }
  return { versao, ficheiros: paraCache, media, tamanho, mudou, sw, gerado };
}

module.exports = { gerar, listarFicheiros, RAIZ };

if (require.main === module) {
  const r = gerar();
  console.log('Versão da app:       ' + r.versao);
  console.log('Ficheiros na cache:  ' + r.ficheiros.length + ' (' + (r.tamanho / 1024 / 1024).toFixed(2) + ' MB)');
  console.log('Sons embutidos:      ' + r.media.sons.length);
  console.log(r.mudou ? 'sw.js e gerado.js atualizados.' : 'sw.js e gerado.js já estavam atualizados.');
}
