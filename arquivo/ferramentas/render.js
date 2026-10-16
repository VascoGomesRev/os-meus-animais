#!/usr/bin/env node
/* Converte desenhos (animais e habitats) em PNG para se ver o resultado sem abrir o browser.
   Uso:  node ferramentas/render.js <grupo>            → todos os animais e habitats do grupo
         node ferramentas/render.js cao gato           → só estes ids
   Escreve em originais/render/<id>.png (animal) e originais/render/<id>-habitat.png (habitat). */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const sharp = require('sharp');
const { carregarDados } = require('./dados.js');

const RAIZ = path.resolve(__dirname, '..');
const FUNDO = { casa: '#FFE9C7', quinta: '#BFE6FF', agua: '#9EDCF6', floresta: '#CDE6B5', savana: '#F6DFA4', gelo: '#DDEFF9', ceu: '#CFE8FF', relva: '#D6EFB0' };
const FILTRO = '<filter id="c" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="3" result="d"/><feFlood flood-color="#ffffff"/><feComposite in2="d" operator="in" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';

async function png(interior, fundo, destino) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="440" height="440"><defs>${FILTRO}</defs><rect width="220" height="220" fill="${fundo}"/><g filter="url(#c)">${interior}</g></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(destino);
}

(async () => {
  const { ANIMAIS, DESENHOS, HABITATS } = carregarDados();
  const args = process.argv.slice(2);
  const escolhidos = ANIMAIS.filter(a => args.includes(a.id) || args.includes(a.grupo));
  if (!escolhidos.length) { console.log('Nenhum animal/grupo encontrado em: ' + args.join(' ')); process.exit(1); }
  const dir = path.join(RAIZ, 'originais', 'render');
  fs.mkdirSync(dir, { recursive: true });
  for (const a of escolhidos) {
    const fundo = FUNDO[a.cena] || '#FFE9C7';
    if (DESENHOS[a.id]) { await png(DESENHOS[a.id], fundo, path.join(dir, a.id + '.png')); console.log('animal   ' + a.id + '.png'); }
    else console.log('animal   ' + a.id + ' — SEM DESENHO');
    if (HABITATS[a.id]) { await png(HABITATS[a.id].svg, fundo, path.join(dir, a.id + '-habitat.png')); console.log('habitat  ' + a.id + '-habitat.png (' + HABITATS[a.id].nome + ')'); }
    else console.log('habitat  ' + a.id + ' — SEM HABITAT');
  }
  console.log('PNGs em originais/render/');
})().catch(e => { console.error(e); process.exit(1); });
