#!/usr/bin/env node
/* Gera os ícones PNG da app a partir do desenho do cão (desenhos.js), com o pacote «sharp».
   Uma vez, na pasta ferramentas:  npm install        Depois:  node ferramentas/gerar-icones.js
   O ícone «maskable» tem fundo até às bordas e o cão dentro da zona segura (círculo com 80 % do tamanho),
   porque o Android recorta os ícones em várias formas. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const sharp = require('sharp');

const RAIZ = path.resolve(__dirname, '..');
const { DESENHOS } = vm.runInNewContext(fs.readFileSync(path.join(RAIZ, 'desenhos.js'), 'utf8') + '\n;({ DESENHOS })', {});
const FUNDO = '#FFE9C7';
// Contorno branco tipo autocolante (na app é feito pelo CSS; aqui usamos um filtro SVG)
const FILTRO = '<filter id="c" x="-20%" y="-20%" width="140%" height="140%">' +
  '<feMorphology in="SourceAlpha" operator="dilate" radius="4" result="d"/>' +
  '<feFlood flood-color="#ffffff"/><feComposite in2="d" operator="in" result="b"/>' +
  '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';

function svg({ raio, escala }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="1024" height="1024">
  <defs>${FILTRO}</defs>
  <rect width="220" height="220" rx="${raio}" fill="${FUNDO}"/>
  <g filter="url(#c)" transform="translate(110 116) scale(${escala}) translate(-110 -110)">${DESENHOS.cao}</g>
</svg>`;
}
async function png(texto, tamanho, nome) {
  await sharp(Buffer.from(texto)).resize(tamanho, tamanho).png().toFile(path.join(RAIZ, 'icones', nome));
  console.log('escrito icones/' + nome);
}
(async () => {
  const normal = svg({ raio: 40, escala: 0.9 });     // cantos arredondados
  const maskable = svg({ raio: 0, escala: 0.68 });   // fundo até às bordas; cão dentro da zona segura
  await png(normal, 192, 'icon-192.png');
  await png(normal, 512, 'icon-512.png');
  await png(maskable, 512, 'icon-maskable-512.png');
})().catch(e => { console.error(e); process.exit(1); });
