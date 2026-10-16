#!/usr/bin/env node
/* Verifica a coerência da app antes de um commit:   node ferramentas/verificar.js
   ERRO  → tem de ser corrigido (o script termina com código 1)
   AVISO → informação (por exemplo, um animal ainda sem foto) */
'use strict';
const fs = require('fs');
const path = require('path');
const { gerar, RAIZ } = require('./gerar-sw.js');
const { carregarDados } = require('./dados.js');

const erros = [], avisos = [];
const erro = m => erros.push(m);
const aviso = m => avisos.push(m);
const ler = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const existe = f => fs.existsSync(path.join(RAIZ, f));

// 1. Dados da app (gerado.js, animais.js e animais/*.js são scripts clássicos: corremos-os num contexto isolado)
let dados = null;
try {
  dados = carregarDados();
} catch (e) { erro('não consegui carregar os ficheiros de dados (gerado.js, animais.js, animais/*.js): ' + e.message); }

if (dados) {
  const { ANIMAIS, GRUPOS, MODULOS, MEDIA_EMBUTIDA } = dados;
  const ids = new Set();
  const html = ler('index.html');
  for (const a of ANIMAIS) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(a.id)) erro(`id inválido «${a.id}» (só minúsculas sem acentos, números e hífen)`);
    if (ids.has(a.id)) erro(`id repetido «${a.id}»`);
    ids.add(a.id);
    if (!a.nome || a.nome !== a.nome.toLowerCase() || /^(o|a|os|as|um|uma) /.test(a.nome)) erro(`${a.id}: nome inválido «${a.nome}» (minúsculas, sem artigo)`);
    if (!(a.grupo in GRUPOS)) erro(`${a.id}: grupo desconhecido «${a.grupo}»`);
    if (typeof a.som !== 'boolean') erro(`${a.id}: «som» tem de ser true ou false`);
    if (!a.habitat || a.habitat !== a.habitat.toLowerCase()) erro(`${a.id}: falta o nome do habitat (minúsculas, sem artigo)`);
    const m = MODULOS[a.id];
    if (!m) erro(`${a.id}: falta o módulo animais/${a.id}.js (MODULOS.${a.id})`);
    else {
      if (typeof m.montar !== 'function') erro(`${a.id}: o módulo não tem montar()`);
      if (typeof m.icone !== 'string' || /<svg[\s>]/i.test(m.icone)) erro(`${a.id}: o ícone tem de ser o interior de um SVG 220×220, sem a tag <svg>`);
      const cod = ler(`animais/${a.id}.js`);
      for (const [, idSvg] of cod.matchAll(/\sid="([^"]+)"/g)) if (!idSvg.startsWith(a.id + '-') && !idSvg.includes('${')) erro(`${a.id}: id SVG «${idSvg}» tem de começar por «${a.id}-»`);
      if (/<(script|image|foreignObject)/i.test(cod)) erro(`${a.id}: o módulo não pode ter <script>, <image> nem <foreignObject>`);
      if (/https?:\/\//.test(cod.replace(/http:\/\/www\.w3\.org\/[^'"`]*/g, ''))) erro(`${a.id}: o módulo não pode ir buscar nada à internet`);
    }
    if (!html.includes(`<script src="animais/${a.id}.js"></script>`)) erro(`${a.id}: falta <script src="animais/${a.id}.js"></script> no index.html`);
    if (a.som && !MEDIA_EMBUTIDA.sons.includes(a.id)) aviso(`${a.id}: tem som característico mas ainda não existe sons/${a.id}.mp3`);
    if (!a.som && MEDIA_EMBUTIDA.sons.includes(a.id)) erro(`${a.id}: som:false mas existe sons/${a.id}.mp3`);
  }
  for (const id of Object.keys(MODULOS)) if (!ids.has(id)) erro(`há um módulo «${id}» que não está em animais.js`);

  // 2. Ficheiros de media: nome e extensão
  for (const [pasta, ext] of [['sons', '.mp3']]) {
    if (!existe(pasta)) continue;
    for (const n of fs.readdirSync(path.join(RAIZ, pasta))) {
      if (n.startsWith('.')) continue;
      if (!n.endsWith(ext)) erro(`${pasta}/${n}: extensão errada (esperava ${ext})`);
      else if (!ids.has(n.slice(0, -ext.length))) erro(`${pasta}/${n}: não corresponde a nenhum animal`);
    }
  }

  // 3. Créditos: cada som embutido tem entrada em creditos.json
  if (existe('creditos.json')) {
    try {
      const cr = JSON.parse(ler('creditos.json'));
      const com = new Set(cr.map(c => c.ficheiro));
      for (const id of MEDIA_EMBUTIDA.sons) if (!com.has(`sons/${id}.mp3`)) erro(`sons/${id}.mp3 sem entrada em creditos.json`);
      for (const c of cr) if (c.ficheiro && !existe(c.ficheiro)) aviso(`creditos.json refere ${c.ficheiro}, que não existe`);
    } catch (e) { erro('creditos.json inválido: ' + e.message); }
  } else if (MEDIA_EMBUTIDA.sons.length) erro('há sons embutidos mas não existe creditos.json');
}

// 4. Manifest e ícones
try {
  const m = JSON.parse(ler('manifest.webmanifest'));
  if (!(m.icons || []).length) erro('manifest: sem ícones');
  for (const ic of m.icons || []) if (!existe(ic.src)) erro(`manifest: ícone em falta ${ic.src}`);
  if (m.display !== 'fullscreen') aviso(`manifest: display é «${m.display}» (esperava fullscreen)`);
  if (m.orientation !== 'landscape') aviso(`manifest: orientation é «${m.orientation}» (esperava landscape)`);
  if (m.lang !== 'pt-PT') aviso(`manifest: lang é «${m.lang}» (esperava pt-PT)`);
} catch (e) { erro('manifest.webmanifest inválido ou em falta: ' + e.message); }

// 5. Fontes referidas no CSS existem
for (const m of ler('index.html').matchAll(/url\("?(fontes\/[^")]+)"?\)/g)) if (!existe(m[1])) erro(`fonte em falta: ${m[1]}`);

// 6. GitHub Pages: sem .nojekyll, o Jekyll ignora ficheiros e pastas que começam por _ ou .
if (!existe('.nojekyll')) erro('falta o ficheiro .nojekyll na raiz (necessário no GitHub Pages)');

// 7. sw.js e gerado.js estão atualizados
try {
  const g = gerar({ escrever: false });
  if (ler('sw.js') !== g.sw || ler('gerado.js') !== g.gerado) erro('sw.js / gerado.js desatualizados — corre: node ferramentas/gerar-sw.js');
} catch (e) { erro('sw.js / gerado.js em falta — corre: node ferramentas/gerar-sw.js'); }

for (const a of avisos) console.log('AVISO  ' + a);
for (const e of erros) console.log('ERRO   ' + e);
console.log(`\n${erros.length} erro(s), ${avisos.length} aviso(s).` + (erros.length ? '' : ' Tudo bem.'));
process.exit(erros.length ? 1 : 0);
