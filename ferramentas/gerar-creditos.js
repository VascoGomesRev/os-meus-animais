#!/usr/bin/env node
/* Junta os créditos dos sons (originais/sons/creditos-*.json, um por grupo de trabalho) num único
   creditos.json na raiz (usado pelo ecrã «Créditos» da área dos pais) e gera o CREDITOS.md.
   Correr depois de acrescentar sons:   node ferramentas/gerar-creditos.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { carregarDados } = require('./dados.js');

const RAIZ = path.resolve(__dirname, '..');
const dir = path.join(RAIZ, 'originais', 'sons');
const { ANIMAIS } = carregarDados();
const nomes = Object.fromEntries(ANIMAIS.map(a => [a.id, a.nome]));
const ordem = Object.fromEntries(ANIMAIS.map((a, i) => [a.id, i]));

let entradas = [];
if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir).sort()) {
  if (!/^creditos-.*\.json$/.test(f)) continue;
  const lista = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  if (!Array.isArray(lista)) throw new Error(f + ' não é um array');
  entradas.push(...lista);
}
// uma entrada por ficheiro (se dois grupos registaram o mesmo, fica a última), só para ficheiros que existem
const porFicheiro = new Map();
for (const e of entradas) if (e.ficheiro && fs.existsSync(path.join(RAIZ, e.ficheiro))) porFicheiro.set(e.ficheiro, e);
entradas = [...porFicheiro.values()].sort((a, b) => (ordem[a.animal] ?? 999) - (ordem[b.animal] ?? 999));

const fontes = [
  { ficheiro: 'fontes/baloo2.woff2', tipo: 'fonte', titulo: 'Baloo 2', autor: 'EkType (Ek Type)', licenca: 'SIL Open Font License 1.1', licencaUrl: 'https://openfontlicense.org/', origem: 'https://fonts.google.com/specimen/Baloo+2' },
  { ficheiro: 'fontes/nunito.woff2', tipo: 'fonte', titulo: 'Nunito', autor: 'Vernon Adams, Cyreal, Jacques Le Bailly', licenca: 'SIL Open Font License 1.1', licencaUrl: 'https://openfontlicense.org/', origem: 'https://fonts.google.com/specimen/Nunito' }
];

fs.writeFileSync(path.join(RAIZ, 'creditos.json'), JSON.stringify([...entradas, ...fontes], null, 1) + '\n');

let md = '# Créditos\n\nSons de animais do [Wikimedia Commons](https://commons.wikimedia.org/), com licenças livres. Cada ficheiro foi cortado para 1–3 s, passado a mono e normalizado em volume.\n\n';
md += '| Animal | Ficheiro na app | Original | Autor | Licença |\n|---|---|---|---|---|\n';
for (const e of entradas) md += `| ${nomes[e.animal] || e.animal} | \`${e.ficheiro}\` | [${e.titulo}](${e.origem}) | ${e.autor} | [${e.licenca}](${e.licencaUrl || e.origem}) |\n`;
md += '\n## Fontes\n\n';
for (const f of fontes) md += `- **${f.titulo}** — ${f.autor} — [${f.licenca}](${f.licencaUrl}) — [${f.origem}](${f.origem}); texto da licença em \`fontes/\`.\n`;
md += '\n## Código e desenhos\n\nO código e os desenhos SVG desta app estão sob a licença MIT (ver `LICENSE`).\n';
fs.writeFileSync(path.join(RAIZ, 'CREDITOS.md'), md);
console.log(`creditos.json: ${entradas.length} sons + ${fontes.length} fontes. CREDITOS.md escrito.`);
