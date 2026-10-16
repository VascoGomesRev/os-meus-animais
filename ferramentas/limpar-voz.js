#!/usr/bin/env node
/* Limpa as gravações da família e põe-nas na app, com o ffmpeg.
   Uso:  node ferramentas/limpar-voz.js            → trata tudo o que está em gravacoes/por-tratar/
         node ferramentas/limpar-voz.js --ver      → só mostra o que há por tratar

   Nomes dos ficheiros em gravacoes/por-tratar/ (qualquer formato áudio: m4a, mp3, webm, ogg, wav…):
     <id>-nome.*     → vozes/<id>.mp3          (o nome do animal: «gato»)
     <id>-som.*      → sons/<id>.mp3           (a onomatopeia: «miau»)
   Depois de tratado, o original passa para gravacoes/tratadas/ (assim sabe-se o que falta).

   Passos: mono 48 kHz → corta graves abaixo de 80 Hz (ronco, vento) → RNNoise (rede neural que separa a voz
   do ruído; modelo em ferramentas/modelos/) → redução de ruído FFT → realce ligeiro dos agudos (nitidez) →
   corta o silêncio antes e depois (deixa 60 ms / 150 ms) → compressão suave → volume ao máximo sem distorcer
   (pico a −1 dB) → fades curtos → mp3 mono 44,1 kHz.
   Também mede as sílabas de cada som (onde a boca do animal deve abrir) e guarda-as em sons/silabas.json. */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
const POR_TRATAR = path.join(RAIZ, 'gravacoes', 'por-tratar');
const TRATADAS = path.join(RAIZ, 'gravacoes', 'tratadas');
const MODELO = 'ferramentas/modelos/rnnoise-sh.rnnn';     // caminho relativo: o filtro arnndn não gosta de «C:» no Windows
const SILABAS = path.join(RAIZ, 'sons', 'silabas.json');
const TIPOS = { nome: id => `vozes/${id}.mp3`, som: id => `sons/${id}.mp3` };

const ff = args => execFileSync('ffmpeg', ['-hide_banner', '-y', ...args], { cwd: RAIZ, stdio: ['ignore', 'pipe', 'pipe'] });
const ffLog = args => {                                    // devolve o stderr (onde o ffmpeg escreve as medições)
  try { return execFileSync('ffmpeg', ['-hide_banner', ...args], { cwd: RAIZ, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) + ''; }
  catch (e) { return String(e.stderr || ''); }
};
const medir = (f, filtro) => {
  const r = require('child_process').spawnSync('ffmpeg', ['-hide_banner', '-i', f, '-af', filtro, '-f', 'null', '-'], { cwd: RAIZ, encoding: 'utf8' });
  return r.stderr || '';
};
const duracao = f => {
  const m = medir(f, 'anull').match(/Duration: (\d+):(\d+):([\d.]+)/);
  return m ? (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) : 0;
};
/* troços com voz: [[início, fim], …] em segundos, ignorando estalidos com menos de 80 ms */
function trocosDeVoz(f, limiar, minSil) {
  const log = medir(f, `silencedetect=n=${limiar}dB:d=${minSil}`);
  const total = duracao(f);
  const sil = [];
  let ini = null;
  for (const l of log.split('\n')) {
    let m = l.match(/silence_start: ([\d.]+)/); if (m) ini = +m[1];
    m = l.match(/silence_end: ([\d.]+)/); if (m) { sil.push([ini ?? 0, +m[1]]); ini = null; }
  }
  if (ini !== null) sil.push([ini, total]);
  const voz = [];
  let t = 0;
  for (const [a, b] of sil) { if (a - t > 0.08) voz.push([t, a]); t = b; }
  if (total - t > 0.08) voz.push([t, total]);
  return voz;
}

function listar() {
  if (!fs.existsSync(POR_TRATAR)) return [];
  return fs.readdirSync(POR_TRATAR).filter(n => !n.startsWith('.')).map(n => {
    const m = n.match(/^([a-z0-9]+(?:-[a-z0-9]+)*?)-(nome|som)\.[a-z0-9]+$/i);
    return m ? { ficheiro: n, id: m[1].toLowerCase(), tipo: m[2].toLowerCase() } : { ficheiro: n, erro: true };
  });
}

function tratar({ ficheiro, id, tipo }) {
  const ent = path.join('gravacoes', 'por-tratar', ficheiro);
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'voz-'));
  const limpo = path.join(tmp, 'limpo.wav'), cortado = path.join(tmp, 'cortado.wav');
  // 1. Limpeza (a 48 kHz, que é o que o RNNoise espera)
  ff(['-i', ent, '-ac', '1', '-ar', '48000', '-af',
    `highpass=f=80:p=2,arnndn=m=${MODELO}:mix=0.9,afftdn=nr=10:nf=-50:tn=1,equalizer=f=3500:t=q:w=1.2:g=2.5,highpass=f=80`,
    '-c:a', 'pcm_s16le', limpo]);
  // 2. Onde começa e acaba a voz (o 1.º e o último troço com som)
  const voz = trocosDeVoz(limpo, -38, 0.15);
  if (!voz.length) throw new Error('não encontrei voz (gravação vazia ou muito baixa)');
  const ini = Math.max(0, voz[0][0] - 0.06), fim = Math.min(duracao(limpo), voz[voz.length - 1][1] + 0.15);
  const dur = fim - ini;
  // 3. Corte, compressão suave e fades
  ff(['-i', limpo, '-af',
    `atrim=start=${ini.toFixed(3)}:end=${fim.toFixed(3)},asetpts=PTS-STARTPTS,acompressor=threshold=-22dB:ratio=3:attack=5:release=90:makeup=2,` +
    `afade=t=in:d=0.015,afade=t=out:st=${Math.max(0, dur - 0.08).toFixed(3)}:d=0.08`,
    '-c:a', 'pcm_s16le', cortado]);
  // 4. Volume: pico a −1 dB
  const pico = +((medir(cortado, 'volumedetect').match(/max_volume: (-?[\d.]+) dB/) || [, '0'])[1]);
  const ganho = (-1 - pico).toFixed(1);
  const destino = TIPOS[tipo](id);
  fs.mkdirSync(path.join(RAIZ, path.dirname(destino)), { recursive: true });
  ff(['-i', cortado, '-af', `volume=${ganho}dB`, '-ar', '44100', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '96k', destino]);
  // 5. Sílabas (só para os sons do animal): troços com voz no ficheiro final, para a boca abrir em sincronia
  let silabas = null;
  if (tipo === 'som') silabas = trocosDeVoz(destino, -30, 0.06).map(([a, b]) => [+a.toFixed(2), +(b - a).toFixed(2)]);
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(TRATADAS, { recursive: true });
  fs.renameSync(path.join(POR_TRATAR, ficheiro), path.join(TRATADAS, ficheiro));
  return { destino, dur: duracao(destino), ganho, silabas };
}

const lista = listar();
if (process.argv.includes('--ver')) {
  if (!lista.length) console.log('Nada por tratar em gravacoes/por-tratar/.');
  for (const f of lista) console.log(f.erro ? `?  ${f.ficheiro} (nome não reconhecido: usa <id>-nome ou <id>-som)` : `→  ${f.ficheiro}  (${f.id}, ${f.tipo})`);
  process.exit(0);
}
if (!fs.existsSync(path.join(RAIZ, MODELO))) { console.error('Falta o modelo ' + MODELO); process.exit(1); }
const silabas = fs.existsSync(SILABAS) ? JSON.parse(fs.readFileSync(SILABAS, 'utf8')) : {};
let falhas = 0;
for (const f of lista) {
  if (f.erro) { console.log(`IGNORADO  ${f.ficheiro}: nome não reconhecido (usa <id>-nome ou <id>-som)`); falhas++; continue; }
  try {
    const r = tratar(f);
    if (r.silabas) silabas[f.id] = r.silabas;
    console.log(`OK  ${f.ficheiro} → ${r.destino}  (${r.dur.toFixed(2)} s, ganho ${r.ganho} dB${r.silabas ? ', sílabas ' + JSON.stringify(r.silabas) : ''})`);
  } catch (e) { console.log(`ERRO  ${f.ficheiro}: ${e.message.split('\n')[0]}`); falhas++; }
}
if (!lista.length) console.log('Nada por tratar em gravacoes/por-tratar/.');
fs.writeFileSync(SILABAS, JSON.stringify(Object.fromEntries(Object.entries(silabas).sort()), null, 1) + '\n');
if (lista.length) console.log('\nA seguir: node ferramentas/gerar-creditos.js && node ferramentas/gerar-sw.js && node ferramentas/verificar.js');
process.exit(falhas ? 1 : 0);
