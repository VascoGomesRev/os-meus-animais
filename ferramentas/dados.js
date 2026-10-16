/* Carrega os dados da app (scripts clássicos) num contexto isolado, para as ferramentas Node.
   Devolve { ANIMAIS, GRUPOS, MODULOS, MEDIA_EMBUTIDA, VERSAO }.
   Os módulos animais/<id>.js só podem mexer no DOM dentro de montar(), por isso carregam-se aqui sem browser. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.resolve(__dirname, '..');

function ficheirosDeDados() {
  const lista = ['gerado.js', 'animais.js'];               // mesma ordem que o index.html
  const dir = path.join(RAIZ, 'animais');
  if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir).sort()) if (f.endsWith('.js')) lista.push('animais/' + f);
  return lista;
}
function carregarDados() {
  const codigo = ficheirosDeDados().map(f => fs.readFileSync(path.join(RAIZ, f), 'utf8')).join('\n');
  return vm.runInNewContext(codigo + '\n;({ ANIMAIS, GRUPOS, MODULOS, MEDIA_EMBUTIDA, VERSAO })', {});
}
module.exports = { carregarDados, ficheirosDeDados, RAIZ };
