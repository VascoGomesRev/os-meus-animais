/* Os Meus Animais — lógica da app (sem dependências).
   Ficheiros carregados antes deste, no index.html:
   - gerado.js   → VERSAO e MEDIA_EMBUTIDA (gerado por ferramentas/gerar-sw.js, não editar à mão)
   - animais.js  → ANIMAIS, GRUPOS
   - desenhos.js → DESENHOS e os ajudantes olhos(), bochechas(), sorriso() */
'use strict';

const EMBUTIDO = typeof MEDIA_EMBUTIDA !== 'undefined' ? MEDIA_EMBUTIDA : { fotos: [], sons: [] };
const VERSAO_APP = typeof VERSAO !== 'undefined' ? VERSAO : 'desenvolvimento';

const $ = s => document.querySelector(s);
const guardaLS = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const leLS = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };

/* ---------- IndexedDB: fotos, sons e vozes carregados pelos pais ---------- */
let bd = null;
function abrirBD() {
  return new Promise(res => {
    try {
      const r = indexedDB.open('animais', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('media');
      r.onsuccess = () => { bd = r.result; res(); };
      r.onerror = () => res();
    } catch (e) { res(); }
  });
}
function bdGet(k) {
  return new Promise(res => {
    if (!bd) return res(null);
    try {
      const q = bd.transaction('media').objectStore('media').get(k);
      q.onsuccess = () => res(q.result || null);
      q.onerror = () => res(null);
    } catch (e) { res(null); }
  });
}
function bdSet(k, v) {               // v = null apaga
  return new Promise(res => {
    if (!bd) return res(false);
    try {
      const t = bd.transaction('media', 'readwrite');
      v ? t.objectStore('media').put(v, k) : t.objectStore('media').delete(k);
      t.oncomplete = () => res(true);
      t.onerror = () => res(false);
    } catch (e) { res(false); }
  });
}

/* ---------- Media: o que os pais carregaram tem prioridade sobre o que vem na app ---------- */
const urls = {};      // 'id:tipo' → URL a usar (blob: dos pais, caminho embutido, ou null)
const proprios = {};  // 'id:tipo' → true se veio dos pais (IndexedDB)
function urlEmbutida(id, t) {
  if (t === 'foto' && EMBUTIDO.fotos.includes(id)) return 'fotos/' + id + '.webp';
  if (t === 'som' && EMBUTIDO.sons.includes(id)) return 'sons/' + id + '.mp3';
  return null;
}
async function carregarMedia() {
  for (const a of ANIMAIS) for (const t of ['foto', 'som', 'voz']) {
    const k = a.id + ':' + t;
    const b = await bdGet(k);
    proprios[k] = !!b;
    urls[k] = b ? URL.createObjectURL(b) : urlEmbutida(a.id, t);
  }
}
function definirProprio(k, ficheiro) {      // ficheiro = null → apaga o dos pais e volta ao embutido
  if (urls[k] && urls[k].startsWith('blob:')) URL.revokeObjectURL(urls[k]);
  const [id, t] = k.split(':');
  proprios[k] = !!ficheiro;
  urls[k] = ficheiro ? URL.createObjectURL(ficheiro) : urlEmbutida(id, t);
}

/* ---------- Ordem dos animais ---------- */
let modo = leLS('modo') || 'grupos', ordem = [], pos = 0;
function baralhar(v) {
  v = v.slice();
  for (let i = v.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [v[i], v[j]] = [v[j], v[i]]; }
  return v;
}
function fazerOrdem() { ordem = modo === 'aleatorio' ? baralhar(ANIMAIS) : ANIMAIS.slice(); pos = 0; }

/* ---------- Mostrar o animal atual ---------- */
function mostrar(dir) {
  const a = ordem[pos];
  $('#cena').className = 'cena cena-' + a.cena;
  const f = urls[a.id + ':foto'], img = $('#foto');
  if (f) { img.src = f; img.hidden = false; } else { img.removeAttribute('src'); img.hidden = true; }
  const b = $('#bicho');
  b.className = (f ? 'com-foto ' : '') + (a.cena === 'agua' ? 'nada' : '');
  b.innerHTML = `<svg viewBox="0 0 220 220" aria-hidden="true">${DESENHOS[a.id]}</svg>`;
  b.setAttribute('aria-label', a.nome);
  if (dir) { void b.offsetWidth; b.classList.add(dir > 0 ? 'entrar-dir' : 'entrar-esq'); }
  $('#nome').classList.remove('ver');
}
let ultimaSeta = 0;
function mudar(d) {
  const t = Date.now();
  if (t - ultimaSeta < 450) return;        // debounce das setas
  ultimaSeta = t;
  pararSom();
  pos += d;
  if (pos >= ordem.length) {
    if (modo === 'aleatorio') {            // volta a baralhar, sem repetir o último
      const ult = ordem[ordem.length - 1];
      do { ordem = baralhar(ANIMAIS); } while (ordem.length > 1 && ordem[0] === ult);
    }
    pos = 0;
  }
  if (pos < 0) pos = ordem.length - 1;
  mostrar(d);
}

/* ---------- Voz e som ---------- */
let voz = null, ocupado = false, audioAtual = null, sequencia = 0;
function escolherVoz() {
  try {
    const vs = speechSynthesis.getVoices();
    voz = vs.find(v => v.lang.replace('_', '-').toLowerCase() === 'pt-pt') || null;
    const br = vs.find(v => v.lang.toLowerCase().startsWith('pt'));
    if (!voz && br) voz = br;
    const el = $('#voz-estado');
    if (voz && voz.lang.replace('_', '-').toLowerCase() === 'pt-pt') el.innerHTML = `<span class="feito">Voz de Portugal encontrada:</span> ${voz.name}`;
    else if (voz) el.innerHTML = `<span class="aviso">Só existe voz em português do Brasil (${voz.name}). Instala a voz de Portugal em Definições → Acessibilidade → Saída de texto para voz → Google → Instalar dados de voz → Português (Portugal), ou grava a tua voz abaixo.</span>`;
    else el.innerHTML = `<span class="aviso">Não foi encontrada nenhuma voz em português. Grava a tua voz para cada animal abaixo.</span>`;
  } catch (e) { $('#voz-estado').textContent = 'Este navegador não tem voz sintética. Grava a tua voz abaixo.'; }
}
function falar(t) {
  return new Promise(res => {
    let ok = false; const fim = () => { if (!ok) { ok = true; res(); } };
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(t);
      u.lang = 'pt-PT'; if (voz) u.voice = voz; u.rate = .8; u.pitch = 1.15;
      u.onend = fim; u.onerror = fim;
      speechSynthesis.speak(u);
    } catch (e) { fim(); }
    setTimeout(fim, 2500);
  });
}
function tocar(url) {
  return new Promise(res => {
    let ok = false; const fim = () => { if (!ok) { ok = true; res(); } };
    try { const a = new Audio(url); audioAtual = a; a.onended = fim; a.onerror = fim; a.play().catch(fim); } catch (e) { fim(); }
    setTimeout(fim, 6000);
  });
}
function pararSom() {
  sequencia++;                             // invalida o que estava a tocar
  try { speechSynthesis.cancel(); } catch (e) {}
  if (audioAtual) { try { audioAtual.pause(); } catch (e) {} audioAtual = null; }
  ocupado = false;
}
async function tocarAnimal() {
  if (ocupado) return;
  ocupado = true;
  const meu = ++sequencia;
  const a = ordem[pos], b = $('#bicho'), n = $('#nome');
  n.textContent = a.nome; n.classList.add('ver');
  b.classList.remove('feliz'); void b.offsetWidth; b.classList.add('feliz');
  const v = urls[a.id + ':voz'];
  await (v ? tocar(v) : falar(a.nome));
  if (meu !== sequencia) return;           // entretanto mudou-se de animal
  const s = urls[a.id + ':som'];
  if (a.som && s) {
    b.classList.remove('feliz'); void b.offsetWidth; b.classList.add('feliz');
    await tocar(s);
    if (meu !== sequencia) return;
  }
  setTimeout(() => b.classList.remove('feliz'), 900);
  ocupado = false;
}

/* ---------- Proteção contra toques acidentais ---------- */
['contextmenu', 'dblclick', 'gesturestart', 'selectstart'].forEach(e => document.addEventListener(e, ev => ev.preventDefault(), { passive: false }));
document.addEventListener('touchmove', e => { if (!e.target.closest('#painel')) e.preventDefault(); }, { passive: false });
$('#app').addEventListener('pointerdown', e => {
  if (e.isPrimary === false) return;       // segundo dedo
  if (e.target.closest('.seta,#pais')) return;
  tocarAnimal();
});
$('#ant').addEventListener('pointerdown', e => { e.stopPropagation(); mudar(-1); });
$('#seg').addEventListener('pointerdown', e => { e.stopPropagation(); mudar(1); });

/* ---------- Roda dentada: 2 segundos premida abre a área dos pais ---------- */
let tPais = null, tIni = 0;
function anel(p) { $('#pais').style.setProperty('--p', p); }
$('#pais').addEventListener('pointerdown', e => {
  e.stopPropagation(); tIni = Date.now();
  tPais = setInterval(() => {
    const p = Math.min(100, (Date.now() - tIni) / 20);
    anel(p);
    if (p >= 100) { cancelarPais(); abrirPainel(); }
  }, 50);
});
function cancelarPais() { clearInterval(tPais); tPais = null; anel(0); }
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => $('#pais').addEventListener(ev, cancelarPais));

/* ---------- Área dos pais ---------- */
function marcaOrdem() {
  $('#ord-grupos').setAttribute('aria-pressed', modo === 'grupos');
  $('#ord-aleat').setAttribute('aria-pressed', modo === 'aleatorio');
}
$('#ord-grupos').onclick = () => { modo = 'grupos'; guardaLS('modo', modo); marcaOrdem(); fazerOrdem(); mostrar(); };
$('#ord-aleat').onclick = () => { modo = 'aleatorio'; guardaLS('modo', modo); marcaOrdem(); fazerOrdem(); mostrar(); };
$('#testar-voz').onclick = () => falar('cão');
$('#fechar').onclick = () => { $('#painel').hidden = true; mostrar(); };
function abrirPainel() { pararSom(); escolherVoz(); desenharLista(); $('#painel').hidden = false; }

function desenharLista() {
  const tipos = [['foto', 'Foto', 'image/*'], ['som', 'Som', 'audio/*'], ['voz', 'Voz gravada', 'audio/*']];
  $('#lista').innerHTML = ANIMAIS.map(a => {
    const botoes = tipos.filter(([t]) => t !== 'som' || a.som).map(([t, rot, ac]) => {
      const k = a.id + ':' + t, tem = !!urls[k], teu = !!proprios[k];
      const estado = teu ? '<span class="feito">✓ tua</span> ' : tem ? '<span class="feito">✓ da app</span> ' : '';
      const acao = tem ? 'substituir' : 'carregar';
      let h = `<label class="btn" for="f-${a.id}-${t}">${estado}${rot}: ${acao}<input type="file" id="f-${a.id}-${t}" accept="${ac}" data-k="${k}"></label>`;
      if (teu) h += `<button class="btn" data-apaga="${k}" aria-label="Apagar ${rot} de ${a.nome}">${urlEmbutida(a.id, t) ? 'Repor a da app' : 'Apagar'}</button>`;
      return h;
    }).join('');
    const nota = a.som ? '' : '<span style="font-size:13px;align-self:center">Sem som: diz só o nome</span>';
    return `<div class="linha"><b>${a.nome}</b><div class="acoes">${botoes}${nota}</div></div>`;
  }).join('');
  $('#lista').querySelectorAll('input[type=file]').forEach(i => i.onchange = async () => {
    const f = i.files[0]; if (!f) return;
    await bdSet(i.dataset.k, f); definirProprio(i.dataset.k, f); desenharLista();
  });
  $('#lista').querySelectorAll('[data-apaga]').forEach(b => b.onclick = async () => {
    await bdSet(b.dataset.apaga, null); definirProprio(b.dataset.apaga, null); desenharLista();
  });
}

/* ---------- Service worker: guardar a app para funcionar sem internet ---------- */
let comecou = false;
function estadoOffline(t) { const el = $('#estado-offline'); if (el) el.textContent = t; }
function registarSW() {
  if (!('serviceWorker' in navigator)) { estadoOffline('Este navegador não consegue guardar a app para funcionar sem internet.'); return; }
  const haviaControlador = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('./sw.js').then(reg => {
    const w = reg.installing || reg.waiting;
    if (w) {
      estadoOffline('A guardar os ficheiros para funcionar sem internet…');
      w.addEventListener('statechange', () => {
        if (w.state === 'redundant' && !reg.active) estadoOffline('Não foi possível guardar os ficheiros. Verifica a ligação à internet e volta a abrir a app.');
      });
    }
    reg.addEventListener('updatefound', () => {
      const n = reg.installing; if (!n) return;
      estadoOffline('A descarregar uma versão nova…');
      n.addEventListener('statechange', () => {
        if (n.state === 'activated') estadoOffline('Versão nova instalada ✓ Fecha e volta a abrir a app para a usar.');
        if (n.state === 'redundant') estadoOffline('Pronta para funcionar sem internet ✓');
      });
    });
    return navigator.serviceWorker.ready;
  }).then(() => estadoOffline('Pronta para funcionar sem internet ✓'))
    .catch(() => estadoOffline('Modo sem internet indisponível aqui (a app tem de ser aberta por https ou em localhost).'));
  // Chegou uma versão nova enquanto ainda estamos no ecrã inicial: recarrega para a usar já
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (haviaControlador && !comecou) location.reload(); });
}

/* ---------- Arranque ---------- */
$('#comecar').addEventListener('click', async () => {
  comecou = true;
  $('#inicio').hidden = true;
  try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch (e) {}   // desbloqueia o TTS
  try { await document.documentElement.requestFullscreen({ navigationUI: 'hide' }); } catch (e) {}
  try { await screen.orientation.lock('landscape'); } catch (e) {}
  try { await navigator.wakeLock.request('screen'); } catch (e) {}
  try { await navigator.storage.persist(); } catch (e) {}   // pede ao Android para não apagar o que os pais carregaram
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') { if (navigator.wakeLock) navigator.wakeLock.request('screen').catch(() => {}); }
  else pararSom();
});

(async () => {
  $('#versao').textContent = VERSAO_APP;
  marcaOrdem(); fazerOrdem(); mostrar();
  try { speechSynthesis.onvoiceschanged = escolherVoz; } catch (e) {}
  escolherVoz();
  registarSW();
  await abrirBD(); await carregarMedia(); mostrar();
})();
