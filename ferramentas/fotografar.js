#!/usr/bin/env node
/* Fotografa o cenário de um animal sem precisar de capturas de ecrã do browser (que falham com a janela escondida).
   Uso:  node ferramentas/fotografar.js        (fica à escuta na porta 3999; Ctrl+C para parar)
   No browser, em http://localhost:3000/?animal=<id>, correr na consola:
     const foto = n => fetch('http://localhost:3999/?n=' + n, { method: 'POST',
       body: new XMLSerializer().serializeToString(document.querySelector('.palco:last-child svg')) }).then(r => r.text());
     relogio.avancar(1000); await foto('repouso'); controlo.irAoHabitat(); relogio.avancar(4000); await foto('habitat');
   Grava originais/fotos/<n>.png com o cenário inteiro (1600×900 reduzido a 800×450). Atenção: mostra o viewBox todo;
   no telemóvel corta-se em cima e em baixo e no tablet dos lados (ver REGRAS-ANIMAIS.md §4).
   Com ?grelha=a,b,c,d junta várias fotos já gravadas numa grelha de 2 colunas em originais/fotos/grelha.jpg. */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = path.resolve(__dirname, '..', 'originais', 'fotos');
const PORTA = Number(process.argv[2]) || 3999;
fs.mkdirSync(DIR, { recursive: true });
const nomeValido = n => /^[a-z0-9-]{1,40}$/i.test(n);

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  const q = new URL(req.url, 'http://localhost').searchParams;
  if (q.get('grelha')) {
    const nomes = q.get('grelha').split(',').filter(nomeValido);
    const comp = nomes.map((n, i) => ({ input: path.join(DIR, n + '.png'), left: (i % 2) * 800, top: Math.floor(i / 2) * 450 }));
    sharp({ create: { width: 1600, height: Math.ceil(nomes.length / 2) * 450, channels: 3, background: '#fff' } })
      .composite(comp).jpeg({ quality: 80 }).toFile(path.join(DIR, 'grelha.jpg'))
      .then(() => res.end('grelha gravada'), e => { res.statusCode = 500; res.end(String(e)); });
    return;
  }
  if (req.method !== 'POST') { res.end('fotografar.js à escuta'); return; }
  const nome = q.get('n') || 'foto';
  if (!nomeValido(nome)) { res.statusCode = 400; res.end('nome inválido'); return; }
  const partes = [];
  req.on('data', d => partes.push(d));
  req.on('end', async () => {
    try {
      let svg = Buffer.concat(partes).toString('utf8');
      if (!/xmlns=/.test(svg)) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      await sharp(Buffer.from(svg)).resize(800).png().toFile(path.join(DIR, nome + '.png'));
      res.end('gravado originais/fotos/' + nome + '.png');
    } catch (e) { res.statusCode = 500; res.end(String(e)); }
  });
}).listen(PORTA, () => console.log('fotografar.js → http://localhost:' + PORTA + '  (fotos em originais/fotos/)'));
