#!/usr/bin/env node
/* Servidor local para testar a app no PC, sem instalar nada:   node ferramentas/servir.js [porta]
   Depois abre http://localhost:3000 no Chrome. Ctrl+C para parar. */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const PORTA = Number(process.argv[2]) || 3000;
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.webm': 'audio/webm', '.woff2': 'font/woff2',
  '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8'
};

http.createServer((req, res) => {
  let caminho;
  try { caminho = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch (e) { res.writeHead(400); return res.end(); }
  if (caminho.endsWith('/')) caminho += 'index.html';
  const ficheiro = path.normalize(path.join(RAIZ, caminho));
  if (!ficheiro.startsWith(RAIZ)) { res.writeHead(403); return res.end(); }
  fs.readFile(ficheiro, (err, dados) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Não encontrado: ' + caminho); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(ficheiro).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(dados);
  });
}).listen(PORTA, () => console.log('A servir ' + RAIZ + '\n→ http://localhost:' + PORTA + '/   (Ctrl+C para parar)'));
