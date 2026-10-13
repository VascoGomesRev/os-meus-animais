/* Carrega os dados da app (scripts clássicos) num contexto isolado, para as ferramentas Node.
   Devolve { ANIMAIS, GRUPOS, DESENHOS, HABITATS, MEDIA_EMBUTIDA, VERSAO }. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.resolve(__dirname, '..');

function ficheirosDeDados() {
  const lista = ['gerado.js', 'animais.js'];
  for (const pasta of ['desenhos', 'habitats']) {          // mesma ordem que o index.html: base primeiro, depois os grupos
    lista.push(pasta + '.js');
    const dir = path.join(RAIZ, pasta);
    if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir).sort()) if (f.endsWith('.js')) lista.push(pasta + '/' + f);
  }
  return lista;
}
function carregarDados() {
  const codigo = ficheirosDeDados().map(f => fs.readFileSync(path.join(RAIZ, f), 'utf8')).join('\n');
  return vm.runInNewContext(codigo + '\n;({ ANIMAIS, GRUPOS, DESENHOS, HABITATS: typeof HABITATS === "undefined" ? {} : HABITATS, MEDIA_EMBUTIDA, VERSAO })', {});
}
module.exports = { carregarDados, ficheirosDeDados, RAIZ };
