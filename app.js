/* Os Meus Animais — motor da app (sem dependências).
   Ficheiros carregados antes deste, no index.html:
   - gerado.js       → VERSAO e MEDIA_EMBUTIDA (gerado por ferramentas/gerar-sw.js, não editar à mão)
   - animais.js      → ANIMAIS, GRUPOS, MODULOS
   - animais/<id>.js → MODULOS.<id>: o cenário, o animal, o habitat e todas as animações (ver REGRAS-ANIMAIS.md)
   Este ficheiro trata do resto: toques, nome escrito, voz, sons, setas, menu, favoritos e área dos pais. */
'use strict';

const EMBUTIDO = Object.assign({ sons: [], vozes: [], silabas: {} }, typeof MEDIA_EMBUTIDA !== 'undefined' ? MEDIA_EMBUTIDA : {});
const VERSAO_APP = typeof VERSAO !== 'undefined' ? VERSAO : 'desenvolvimento';
const TEMPO_NO_HABITAT = 7000;           // ms que o animal fica no habitat antes de voltar sozinho

const $ = s => document.querySelector(s);
const guardaLS = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const leLS = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const espera = ms => new Promise(r => setTimeout(r, ms));

/* Modo de desenvolvimento: ?animal=<id> abre logo esse animal, sem ecrã inicial nem service worker,
   e deixa o controlo do animal em window.controlo (para testar animações na consola). */
const PARAMS = new URLSearchParams(location.search);
const DEV = PARAMS.get('animal');

/* ---------- Relógio único das animações: todos os módulos animam a partir daqui (nunca com setTimeout,
   CSS ou element.animate), para tudo andar ao mesmo ritmo, parar quando a app está escondida e, nos testes,
   se poder avançar o tempo à mão com relogio.avancar(ms) (window.relogio em modo de desenvolvimento). ---------- */
const relogio = (() => {
  const subs = new Set();
  let raf = 0, ultimo = 0, manual = false;
  const correr = dt => { for (const f of [...subs]) { try { f(dt); } catch (e) { console.error(e); subs.delete(f); } } };
  function quadro(ts) {
    raf = subs.size ? requestAnimationFrame(quadro) : 0;
    const dt = ultimo ? Math.min(50, ts - ultimo) : 16.7;   // no máximo 50 ms por quadro: depois de uma pausa não dá saltos
    ultimo = ts;
    if (!manual) correr(dt);
  }
  return {
    aCada(f) {                             // f(dt em ms) é chamada a cada quadro; devolve a função que a desliga
      subs.add(f);
      if (!raf) { ultimo = 0; raf = requestAnimationFrame(quadro); }
      return () => subs.delete(f);
    },
    avancar(ms) { manual = true; for (let t = 0; t < ms; t += 1000 / 60) correr(1000 / 60); },   // só para testes
    automatico() { manual = false; ultimo = 0; }
  };
})();
if (DEV) window.relogio = relogio;

/* ---------- IndexedDB: sons e vozes carregados pelos pais ---------- */
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
  if (t === 'som' && EMBUTIDO.sons.includes(id)) return 'sons/' + id + '.mp3';
  if (t === 'voz' && EMBUTIDO.vozes.includes(id)) return 'vozes/' + id + '.mp3';   // nome gravado pela família
  return null;
}
async function carregarMedia() {
  for (const a of ANIMAIS) for (const t of ['som', 'voz']) {
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
let grupoAtivo = null;                     // null = todos os animais; senão a chave do grupo escolhido no menu
const prontos = () => ANIMAIS.filter(a => MODULOS[a.id]);   // só os que já têm módulo
function baralhar(v) {
  v = v.slice();
  for (let i = v.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [v[i], v[j]] = [v[j], v[i]]; }
  return v;
}
function animaisAtivos() {
  if (grupoAtivo === 'favoritos') return prontos().filter(a => favoritos.has(a.id));
  return grupoAtivo ? prontos().filter(a => a.grupo === grupoAtivo) : prontos();
}
function fazerOrdem() { const base = animaisAtivos(); ordem = modo === 'aleatorio' ? baralhar(base) : base.slice(); pos = 0; }

/* ---------- Favoritos: roda dentada premida 2 s e largada marca ou desmarca ---------- */
const favoritos = new Set((leLS('favoritos') || '').split(',').filter(Boolean));
function guardarFavoritos() { guardaLS('favoritos', [...favoritos].join(',')); }
function mostrarCoracao() {
  const a = ordem[pos], c = $('#coracao');
  c.style.setProperty('--f', a && favoritos.has(a.id) ? 1 : 0);
  c.style.setProperty('--p', 0);
}
function alternarFavorito() {
  const a = ordem[pos]; if (!a) return;
  if (favoritos.has(a.id)) favoritos.delete(a.id); else favoritos.add(a.id);
  guardarFavoritos();
  const c = $('#coracao');
  mostrarCoracao();
  c.classList.remove('pulso'); void c.offsetWidth; c.classList.add('pulso');
  if (favoritos.has(a.id)) chuvaDeCoracoes();
  try { navigator.vibrate && navigator.vibrate(40); } catch (e) {}
}
function chuvaDeCoracoes() {                 // corações a subir do animal quando fica favorito
  const alvo = controlo && controlo.animal;
  const r = alvo ? alvo.getBoundingClientRect() : { left: innerWidth * .3, top: innerHeight * .3, width: innerWidth * .4, height: innerHeight * .5 };
  for (let i = 0; i < 9; i++) {
    const h = document.createElement('div');
    h.className = 'coracao-voa';
    h.style.left = (r.left + r.width * (0.2 + Math.random() * 0.6)) + 'px';
    h.style.top = (r.top + r.height * (0.3 + Math.random() * 0.4)) + 'px';
    h.style.setProperty('--dx', ((Math.random() - 0.5) * 120).toFixed(0) + 'px');
    h.style.animationDelay = (i * 90) + 'ms';
    h.style.fontSize = (22 + Math.random() * 22) + 'px';
    h.textContent = '❤';
    $('#app').appendChild(h);
    setTimeout(() => h.remove(), 1800);
  }
}

/* ---------- Menu de grupos (só aparecem os grupos que já têm animais; «Todos» só com 2 ou mais grupos) ---------- */
function iconeDe(id) { return `<svg viewBox="0 0 220 220" aria-hidden="true">${(MODULOS[id] && MODULOS[id].icone) || ''}</svg>`; }
function desenharMenu() {
  const lista = prontos();
  const grupos = Object.keys(GRUPOS).filter(g => lista.some(a => a.grupo === g));
  const ultimo = lista.length ? lista[lista.length - 1].id : '';
  $('#grupos').innerHTML = grupos.map(g =>
    `<button class="grupo" data-grupo="${g}">${iconeDe(lista.find(a => a.grupo === g).id)}<b>${GRUPOS[g]}</b></button>`).join('') +
    (grupos.length > 1 ? `<button class="grupo todos" data-grupo="">${iconeDe(ultimo)}<b>Todos</b></button>` : '') +
    `<button class="grupo favoritos" data-grupo="favoritos" ${favoritos.size ? '' : 'hidden'}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.6-9.3-9A5.3 5.3 0 0 1 12 6.2a5.3 5.3 0 0 1 9.3 5.8C19 16.4 12 21 12 21z" fill="#E8457A"/></svg><b>Favoritos</b></button>`;
  $('#grupos').querySelectorAll('.grupo').forEach(b => b.addEventListener('pointerup', () => escolherGrupo(b.dataset.grupo || null)));
}
function escolherGrupo(g) {
  if (g === 'favoritos' && !favoritos.size) return;
  grupoAtivo = g;
  pararSom();
  fazerOrdem(); mostrar();
  $('#menu').hidden = true;
}
function abrirMenu() { pararSom(); $('#nome').classList.remove('ver'); desenharMenu(); $('#menu').hidden = false; }

/* ---------- Mostrar o animal atual: monta o módulo do animal num palco novo ---------- */
let controlo = null, palcoAtual = null, estado = 'fora';   // estado: 'fora' | 'indo' | 'dentro' | 'voltando'
let temporizadorHabitat = null;
function mostrar(dir) {
  const a = ordem[pos];
  pararSom();
  pararVolta();
  const velho = palcoAtual, velhoControlo = controlo;
  const palco = document.createElement('div');
  palco.className = 'palco';
  $('#palcos').appendChild(palco);
  palcoAtual = palco; controlo = null; estado = 'fora';
  if (a && MODULOS[a.id]) {
    try { controlo = MODULOS[a.id].montar(palco, { relogio, reduzido: matchMedia('(prefers-reduced-motion: reduce)').matches }); }
    catch (e) { console.error('Falhou montar ' + a.id, e); }
  }
  if (DEV) window.controlo = controlo;
  palco.setAttribute('aria-label', a ? a.nome : '');
  if (velho) {
    if (dir) palco.animate([{ opacity: 0, transform: `translateX(${dir * 12}%)` }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.2,.9,.3,1)' });
    const saida = velho.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-(dir || 0) * 12}%)` }], { duration: 400, easing: 'ease-in', fill: 'forwards' });
    saida.finished.catch(() => {}).then(() => {
      try { velhoControlo && velhoControlo.destruir(); } catch (e) {}
      velho.remove();
    });
  }
  $('#nome').classList.remove('ver');
  mostrarCoracao();
}

/* ---------- Habitat: o animal vai lá, fica, e volta (sozinho ao fim de um tempo, ou quando se toca outra vez).
   O habitat não tem nome escrito nem dito: só o animal tem nome. ---------- */
async function irAoHabitat() {
  if (!controlo || estado !== 'fora') return;
  const c = controlo;
  pararSom();
  estado = 'indo';
  $('#nome').classList.remove('ver');
  try { await c.irAoHabitat(); } catch (e) { console.error(e); }
  if (c !== controlo) return;
  estado = 'dentro';
  agendarVolta();
}
function agendarVolta() {                 // conta pelo relógio das animações: pára com a app escondida e nos testes com relogio.avancar
  pararVolta();
  let t = 0;
  temporizadorHabitat = relogio.aCada(dt => { t += dt; if (t >= TEMPO_NO_HABITAT) { pararVolta(); voltarDoHabitat(); } });
}
function pararVolta() { if (temporizadorHabitat) { temporizadorHabitat(); temporizadorHabitat = null; } }
async function voltarDoHabitat() {
  pararVolta();
  if (!controlo || estado !== 'dentro') return;
  const c = controlo;
  estado = 'voltando';
  try { await c.voltar(); } catch (e) { console.error(e); }
  if (c === controlo) estado = 'fora';
}

let ultimaSeta = 0;
function mudar(d) {
  const t = Date.now();
  if (t - ultimaSeta < 500) return;        // debounce das setas
  ultimaSeta = t;
  pos += d;
  if (pos >= ordem.length) {
    if (modo === 'aleatorio') {            // volta a baralhar, sem repetir o último
      const ult = ordem[ordem.length - 1];
      do { ordem = baralhar(animaisAtivos()); } while (ordem.length > 1 && ordem[0] === ult);
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
function tocar(url, aoComecar) {           // aoComecar(duraçãoEmMs) é chamado quando o som começa mesmo a tocar
  return new Promise(res => {
    let ok = false; const fim = () => { if (!ok) { ok = true; res(); } };
    try {
      const a = new Audio(url); audioAtual = a;
      a.onended = fim; a.onerror = fim;
      if (aoComecar) a.addEventListener('playing', () => aoComecar(isFinite(a.duration) ? a.duration * 1000 : 1500), { once: true });
      a.play().catch(fim);
    } catch (e) { fim(); }
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
  if (ocupado || !controlo || estado === 'indo' || estado === 'voltando') return;
  ocupado = true;
  const meu = ++sequencia, a = ordem[pos], c = controlo, n = $('#nome');
  if (estado === 'dentro') pararVolta();
  n.textContent = a.nome; n.classList.add('ver');
  try { c.reagir(); } catch (e) { console.error(e); }
  const v = urls[a.id + ':voz'];
  await (v ? tocar(v) : falar(a.nome));
  if (meu !== sequencia) return;           // entretanto mudou-se de animal
  const s = urls[a.id + ':som'];
  if (a.som && s) {
    await espera(220);                     // pausa curta entre o nome e o som («gato»… «miau!»)
    if (meu !== sequencia) return;
    const silabas = proprios[a.id + ':som'] ? null : EMBUTIDO.silabas[a.id] || null;   // onde a boca abre (só nos sons da app)
    await tocar(s, ms => { if (meu === sequencia) try { c.fazerSom(ms, silabas); } catch (e) { console.error(e); } });
    if (meu !== sequencia) return;
  }
  setTimeout(() => { if (meu === sequencia) n.classList.remove('ver'); }, 900);
  if (estado === 'dentro') agendarVolta();
  ocupado = false;
}

/* ---------- Proteção contra toques acidentais ---------- */
['contextmenu', 'dblclick', 'gesturestart', 'selectstart'].forEach(e => document.addEventListener(e, ev => ev.preventDefault(), { passive: false }));
document.addEventListener('touchmove', e => { if (!e.target.closest('#painel')) e.preventDefault(); }, { passive: false });
$('#app').addEventListener('pointerdown', e => {
  if (e.isPrimary === false) return;       // segundo dedo
  if (e.target.closest('.seta,#pais,#casa-btn')) return;
  const noHabitat = controlo && controlo.habitat && controlo.habitat.contains(e.target);
  const noAnimal = controlo && controlo.animal && controlo.animal.contains(e.target);
  if (noHabitat && !noAnimal) {
    if (estado === 'fora') irAoHabitat();
    else if (estado === 'dentro') voltarDoHabitat();
    return;
  }
  tocarAnimal();                           // no animal ou em qualquer outro sítio do cenário
});
$('#casa-btn').addEventListener('pointerdown', e => { e.stopPropagation(); abrirMenu(); });
$('#ant').addEventListener('pointerdown', e => { e.stopPropagation(); mudar(-1); });
$('#seg').addEventListener('pointerdown', e => { e.stopPropagation(); mudar(1); });

/* ---------- Roda dentada: premida 2 s e largada → favorito; premida 3 s → área dos pais ---------- */
let tPais = null, tIni = 0;
function anel(p) { $('#pais').style.setProperty('--p', p); }
$('#pais').addEventListener('pointerdown', e => {
  e.stopPropagation(); tIni = Date.now();
  tPais = setInterval(() => {
    const ms = Date.now() - tIni;
    $('#coracao').style.setProperty('--p', Math.min(100, ms / 20));              // coração enche nos primeiros 2 s
    anel(ms < 2000 ? 0 : Math.min(100, (ms - 2000) / 10));                       // anel da roda enche dos 2 aos 3 s
    if (ms >= 3000) { cancelarPais(); abrirPainel(); }
  }, 50);
});
function cancelarPais(largou) {
  const ms = Date.now() - tIni;
  clearInterval(tPais); tPais = null; anel(0);
  $('#coracao').style.setProperty('--p', 0);
  if (largou && ms >= 2000 && ms < 3000) alternarFavorito();
}
$('#pais').addEventListener('pointerup', () => { if (tPais) cancelarPais(true); });
['pointerleave', 'pointercancel'].forEach(ev => $('#pais').addEventListener(ev, () => { if (tPais) cancelarPais(false); }));

/* ---------- Área dos pais ---------- */
function marcaOrdem() {
  $('#ord-grupos').setAttribute('aria-pressed', modo === 'grupos');
  $('#ord-aleat').setAttribute('aria-pressed', modo === 'aleatorio');
}
$('#ord-grupos').onclick = () => { modo = 'grupos'; guardaLS('modo', modo); marcaOrdem(); fazerOrdem(); mostrar(); };
$('#ord-aleat').onclick = () => { modo = 'aleatorio'; guardaLS('modo', modo); marcaOrdem(); fazerOrdem(); mostrar(); };
$('#testar-voz').onclick = () => falar('cão');
$('#fechar').onclick = () => { $('#painel').hidden = true; mostrar(); };
function abrirPainel() { pararSom(); escolherVoz(); desenharLista(); mostrarCreditos(); $('#painel').hidden = false; }

async function mostrarCreditos() {
  const el = $('#creditos');
  try {
    const nomes = Object.fromEntries(ANIMAIS.map(a => [a.id, a.nome]));
    const lista = (await fetch('creditos.json').then(r => r.ok ? r.json() : [])).filter(c => nomes[c.animal]);
    if (!lista.length) { el.textContent = 'Ainda sem sons embutidos.'; return; }
    const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    el.innerHTML = '<ul style="padding-left:18px;margin:0">' + lista.map(c =>
      `<li><b>${esc(nomes[c.animal])}</b> (${esc(c.tipo)}): «${esc(c.titulo)}», ${esc(c.autor)}, <a href="${esc(c.licencaUrl || c.origem)}" target="_blank" rel="noopener">${esc(c.licenca)}</a> — <a href="${esc(c.origem)}" target="_blank" rel="noopener">origem</a>${c.alteracoes ? ' (' + esc(c.alteracoes) + ')' : ''}</li>`).join('') + '</ul>';
  } catch (e) { el.textContent = 'Não foi possível ler os créditos.'; }
}

function desenharLista() {
  const tipos = [['som', 'Som', 'audio/*'], ['voz', 'Voz gravada', 'audio/*']];
  $('#lista').innerHTML = ANIMAIS.map(a => {
    const botoes = tipos.filter(([t]) => t !== 'som' || a.som).map(([t, rot, ac]) => {
      const k = a.id + ':' + t, tem = !!urls[k], teu = !!proprios[k];
      const estadoTxt = teu ? '<span class="feito">✓ tua</span> ' : tem ? '<span class="feito">✓ da app</span> ' : '';
      const acao = tem ? 'substituir' : 'carregar';
      let h = `<label class="btn" for="f-${a.id}-${t}">${estadoTxt}${rot}: ${acao}<input type="file" id="f-${a.id}-${t}" accept="${ac}" data-k="${k}"></label>`;
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
  if (DEV) {                               // em desenvolvimento tira o service worker, para se ver sempre a versão mais recente
    navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(() => {});
    estadoOffline('Modo de desenvolvimento: sem service worker.');
    return;
  }
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
      const n = reg.installing; if (!n || !haviaControlador) return;   // na 1.ª instalação não é uma atualização
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
  $('#menu').hidden = false;
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
  desenharMenu();
  marcaOrdem(); fazerOrdem();
  if (DEV) {
    comecou = true;
    const i = ordem.findIndex(a => a.id === DEV);
    if (i >= 0) pos = i;
    $('#inicio').hidden = true;
  }
  mostrar();
  try { speechSynthesis.onvoiceschanged = escolherVoz; } catch (e) {}
  escolherVoz();
  registarSW();
  await abrirBD(); await carregarMedia();
})();
