#!/usr/bin/env node
/* Procura sons de animais no Wikimedia Commons (API pública, sem conta) e lista candidatos com licença e autor.
   Não descarrega nada: só consulta. Uso:
     node ferramentas/procurar-commons.js cao "dog bark" gato "cat meow" ...
   Escreve originais/sons/candidatos.json e imprime uma tabela por animal. */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const UA = 'OsMeusAnimais/1.0 (https://github.com/VascoGomesRev/os-meus-animais)';
const API = 'https://commons.wikimedia.org/w/api.php';
const PREF = { 'CC0': 0, 'Public domain': 0, 'CC BY 4.0': 1, 'CC BY 3.0': 1, 'CC BY 2.0': 1, 'CC BY 2.5': 1, 'CC BY-SA 4.0': 2, 'CC BY-SA 3.0': 2, 'CC BY-SA 2.0': 2, 'CC BY-SA 2.5': 2 };

async function pedir(params) {
  const url = API + '?' + new URLSearchParams({ format: 'json', formatversion: '2', ...params });
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' em ' + url);
  return r.json();
}
function limparHtml(s) { return (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }
function duracao(info) {
  const m = (info.metadata || []).find(x => x.name === 'length' || x.name === 'playtime_seconds');
  return m ? Number(m.value) : null;
}

async function procurar(termo) {
  const j = await pedir({
    action: 'query', generator: 'search', gsrnamespace: '6', gsrlimit: '25',
    gsrsearch: termo + ' filetype:audio',
    prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata|metadata',
    iiextmetadatafilter: 'Artist|Credit|LicenseShortName|LicenseUrl|ObjectName|Attribution|ImageDescription'
  });
  const paginas = (j.query && j.query.pages) || [];
  return paginas.map(p => {
    const i = (p.imageinfo || [])[0] || {};
    const e = i.extmetadata || {};
    const lic = limparHtml(e.LicenseShortName && e.LicenseShortName.value);
    return {
      titulo: p.title.replace(/^File:/, ''), pagina: 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(p.title),
      url: i.url, mime: i.mime, kb: Math.round((i.size || 0) / 1024), seg: duracao(i),
      licenca: lic, licencaUrl: limparHtml(e.LicenseUrl && e.LicenseUrl.value),
      autor: limparHtml(e.Attribution ? e.Attribution.value : (e.Artist && e.Artist.value)),
      credito: limparHtml(e.Credit && e.Credit.value), descricao: limparHtml(e.ImageDescription && e.ImageDescription.value).slice(0, 120),
      pref: lic in PREF ? PREF[lic] : 9
    };
  }).filter(c => c.url && /audio|ogg|wav|mp3|flac|opus/i.test(c.mime || ''))
    .sort((a, b) => a.pref - b.pref || (a.seg || 99) - (b.seg || 99));
}

(async () => {
  const args = process.argv.slice(2);
  if (args.length < 2) { console.log('Uso: node ferramentas/procurar-commons.js <id> "<termo de pesquisa>" [<id> "<termo>" ...]'); process.exit(1); }
  const saida = {};
  for (let k = 0; k < args.length; k += 2) {
    const id = args[k], termo = args[k + 1];
    const c = await procurar(termo);
    saida[id] = { termo, candidatos: c };
    console.log(`\n=== ${id}  («${termo}»: ${c.length} ficheiros de áudio) ===`);
    for (const x of c.slice(0, 10)) console.log(`${x.pref}  ${String(x.licenca).padEnd(14)} ${x.seg != null ? (x.seg.toFixed(1) + 's').padStart(7) : '     ?'} ${String(x.kb).padStart(6)} KB  ${x.titulo}  — ${x.autor}`);
    await new Promise(r => setTimeout(r, 500));   // pedidos em série, com pausa (etiqueta da API)
  }
  const dir = path.join(RAIZ, 'originais', 'sons');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'candidatos.json'), JSON.stringify(saida, null, 2));
  console.log('\nLista completa em originais/sons/candidatos.json');
})().catch(e => { console.error(e); process.exit(1); });
