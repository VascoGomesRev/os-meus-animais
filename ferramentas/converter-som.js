#!/usr/bin/env node
/* Converte um som original em sons/<id>.mp3 (mono, 1–3 s, volume normalizado, fades), com o ffmpeg.
   Uso:  node ferramentas/converter-som.js <id> <ficheiro original> [inicio em s] [duracao em s]
   Ex.:  node ferramentas/converter-som.js cao originais/sons/cao.ogg 0.4 2.2
   Sem inicio/duracao usa do início até 3 s. A duração máxima é 3 s. */
'use strict';
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
const [id, original, inicioArg, duracaoArg] = process.argv.slice(2);
if (!id || !original) { console.log('Uso: node ferramentas/converter-som.js <id> <ficheiro original> [inicio] [duracao]'); process.exit(1); }
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) { console.log('id inválido: ' + id); process.exit(1); }
const entrada = path.resolve(RAIZ, original);
if (!fs.existsSync(entrada)) { console.log('não existe: ' + entrada); process.exit(1); }

const inicio = Number(inicioArg) || 0;
const duracao = Math.min(Number(duracaoArg) || 3, 3);
const fim = inicio + duracao;
const saida = path.join(RAIZ, 'sons', id + '.mp3');
fs.mkdirSync(path.dirname(saida), { recursive: true });

// atrim corta; asetpts repõe o tempo a zero; loudnorm iguala o volume entre animais; afade suaviza início e fim
const filtro = `atrim=start=${inicio}:end=${fim},asetpts=PTS-STARTPTS,loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.05,afade=t=out:st=${Math.max(0, duracao - 0.15).toFixed(2)}:d=0.15`;
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', entrada, '-af', filtro, '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-q:a', '4', saida], { stdio: 'inherit' });
const seg = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', saida]).toString().trim();
console.log(`escrito sons/${id}.mp3 — ${Number(seg).toFixed(2)} s, ${(fs.statSync(saida).size / 1024).toFixed(0)} KB`);
