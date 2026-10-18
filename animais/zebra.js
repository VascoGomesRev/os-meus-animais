/* Zebra — «Os Meus Animais». Contrato e regras: REGRAS-ANIMAIS.md.
   Cena: a planície africana verde-amarela numa manhã limpa (sol de cima à esquerda): o Kilimanjaro de cume nevado ao fundo,
   acácias de copa achatada ao longe, outras zebras pequeninas a pastar, uma manada de gnus, aves no céu, capim que ondula.
   Habitat: o charco de pó (terra vermelha e seca) debaixo de uma árvore-das-salsichas (Kigelia) grande, com os frutos
   compridos pendurados. A zebra vai a trote, vira-se, deita-se, rebola-se no pó (patas no ar, nuvens de pó, pó que fica no
   pelo e depois cai) e fica deitada à sombra, de cabeça levantada. Camadas: tronco, copa e charco → zebra → ramo baixo com
   frutos e tufos de capim (cópia da frente dentro do grupo da zebra, para o toque continuar a dar reagir()).
   A zebra é um boneco «2,5D» (o esqueleto do cavalo): o tronco é um perfil projetado (estreita ao virar; aparece o peito de
   frente ou a garupa de costas), o pescoço tem 4 segmentos, as 4 patas têm IK no plano da pata, a cauda é uma cadeia 3D de
   10 pontos com borla e a cabeça é uma vista de frente cujas feições deslizam com o rumo da cabeça.
   As riscas são desenhadas no espaço local de cada peça (perfil do tronco, segmentos do pescoço, patas, ponte da cara) e
   recortadas pela própria peça: andam com ela e não «nadam». Na testa e nas bochechas são linhas sobre a esfera do crânio.
   Organização: 1) utilidades  2) medidas  3) desenho da zebra  4) cenário e árvore  5) ícone
                6) montar(): estado, desenho por quadro, tarefas, andar a trote, comportamentos, idas e voltas */
'use strict';
MODULOS.zebra = (() => {
  const NS = 'http://www.w3.org/2000/svg';

  /* ================= 1) Utilidades ================= */
  const PI = Math.PI, TAU = 2 * PI, RAD = PI / 180;
  const lerp = (a, b, t) => a + (b - a) * t;
  const limita = (v, a, b) => v < a ? a : v > b ? b : v;
  const n = v => Math.round(v * 10) / 10;
  const n3 = v => Math.round(v * 1000) / 1000;
  const suave = t => t * t * (3 - 2 * t);
  const passoS = (a, b, x) => suave(limita((x - a) / (b - a), 0, 1));
  const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const esai = t => 1 - Math.pow(1 - t, 3);
  const eentra = t => t * t * t;
  const eseno = t => -(Math.cos(PI * t) - 1) / 2;
  const sino = t => Math.sin(PI * limita(t, 0, 1));
  const aleat = (a, b) => a + Math.random() * (b - a);
  const escolhe = v => v[Math.random() * v.length | 0];
  function semente(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function catmull(pts, u) {
    const ns = pts.length - 1, s = Math.min(ns - 1e-6, Math.max(0, u) * ns), i = Math.floor(s), t = s - i;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(ns, i + 2)];
    const f = (a, b, c, d) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
    return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
  }
  // caminho suave por uma lista de pontos (curvas pelos meios), fechado ou aberto
  function curvaPor(pts, fechar) {
    const m = pts.length;
    if (fechar) {
      const meio = k => { const a = pts[k % m], b = pts[(k + 1) % m]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
      const s = meio(m - 1);
      let d = `M${n(s[0])},${n(s[1])}`;
      for (let k = 0; k < m; k++) { const q = meio(k); d += `Q${n(pts[k][0])},${n(pts[k][1])} ${n(q[0])},${n(q[1])}`; }
      return d + 'Z';
    }
    let d = `M${n(pts[0][0])},${n(pts[0][1])}`;
    for (let i = 1; i < m - 1; i++) { const q = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; d += `Q${n(pts[i][0])},${n(pts[i][1])} ${n(q[0])},${n(q[1])}`; }
    return d + `L${n(pts[m - 1][0])},${n(pts[m - 1][1])}`;
  }

  /* ================= 2) Medidas da zebra (unidades da zebra = pixels do SVG) ================= */
  const ESC = 1;
  const KZ = .16;                 // quanto a profundidade (z) desce no ecrã: vista ligeiramente de cima
  const CHAO = 780;               // y do chão à profundidade 0
  const HC = 232;                 // altura do centro do tronco
  const N_PESC = 4, LS = 44;      // pescoço: segmentos e comprimento de cada um
  const WN = [114, 98, 86, 78, 72];
  const PESC0 = { u: 112, h: 280 };
  const CAUDA0 = { u: -160, h: 268 };
  const NCA = 10, LCA = 17;       // cauda: pontos e distância entre eles
  const TORNOZELO = 24;           // altura do boleto (a quartela e o casco ficam por baixo)
  // patas: lado 1 = esquerda (virada para nós quando a zebra olha para a direita); dobra 1 = joelho para a frente
  const PERNAS = [
    { id: 'tE', fr: 0, lado: 1, u: -112, v: 24, h: 196, L1: 102, L2: 74, pu: -112, dobra: -1 },
    { id: 'fE', fr: 1, lado: 1, u: 102, v: 24, h: 176, L1: 84, L2: 74, pu: 104, dobra: 1 },
    { id: 'tD', fr: 0, lado: -1, u: -112, v: -24, h: 196, L1: 102, L2: 74, pu: -112, dobra: -1 },
    { id: 'fD', fr: 1, lado: -1, u: 102, v: -24, h: 176, L1: 84, L2: 74, pu: 104, dobra: 1 }
  ];
  const COR = {
    cont: '#3A2B25', pelo: '#FAF7F0', peloE: '#DCD4C8', risca: '#2A211E', riscaC: '#4A3C36',
    crina: '#2A211E', crinaC: '#F1ECE2', crinaE: '#1E1714',
    casco: '#2A2220', foc: '#3E3330', focE: '#5E504A', boca: '#5A1E26', po: '#C9946A'
  };

  // faixa (risca) ao longo de uma linha central suave: largura w0 → w1, pontas afiladas
  function faixa(pts, w0, w1, pontaI = .12, pontaF = .12) {
    const N = 14, c = [];
    for (let i = 0; i <= N; i++) c.push(catmull(pts, i / N));
    const esq = [], dir = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, a = c[Math.max(0, i - 1)], b = c[Math.min(N, i + 1)];
      let nx = -(b[1] - a[1]), ny = b[0] - a[0];
      const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
      const k = Math.min(1, pontaI > 0 ? t / pontaI : 1, pontaF > 0 ? (1 - t) / pontaF : 1);
      const w = lerp(w0, w1, t) / 2 * (.25 + .75 * Math.sqrt(Math.max(0, k)));
      esq.push([c[i][0] + nx * w, c[i][1] + ny * w]); dir.push([c[i][0] - nx * w, c[i][1] - ny * w]);
    }
    return curvaPor(esq.concat(dir.reverse()), true);
  }

  /* ================= 3) Desenho da zebra ================= */
  // perfil do tronco (local: u para a frente, y para baixo, origem no centro do tronco a HC de altura)
  const TRONCO = 'M-166,-16 C-170,-58 -138,-80 -100,-78 C-60,-76 0,-68 50,-74 C80,-80 112,-96 140,-80 C164,-64 170,-24 160,14 C152,46 126,66 92,70 C50,74 10,76 -30,74 C-80,72 -124,68 -148,44 C-162,28 -166,8 -166,-16 Z';
  // partes de cima das patas (para recortar as riscas)
  const SUP_F = 'M-4,-24 C30,-22 60,-14 86,-11 A11,11 0 0 1 86,11 C60,13 30,20 -4,24 C-20,20 -20,-20 -4,-24 Z';
  const SUP_T = 'M-14,-36 C24,-40 70,-18 104,-11 A11,11 0 0 1 104,11 C70,16 30,40 -10,40 C-36,34 -38,-28 -14,-36 Z';
  function defsZebra(p) {
    return `
    <radialGradient id="${p}pelo" cx=".38" cy=".26" r=".9"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F8F4EC"/><stop offset="1" stop-color="#DDD5C9"/></radialGradient>
    <linearGradient id="${p}luzV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".22"/><stop offset=".3" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".62" stop-color="#3A2A20" stop-opacity="0"/><stop offset="1" stop-color="#3A2A20" stop-opacity=".26"/></linearGradient>
    <linearGradient id="${p}pesc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#F7F3EB"/><stop offset="1" stop-color="#E4DDD1"/></linearGradient>
    <linearGradient id="${p}casco" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5E5450"/><stop offset=".6" stop-color="#302826"/><stop offset="1" stop-color="#1A1412"/></linearGradient>
    <radialGradient id="${p}cab" gradientUnits="userSpaceOnUse" cx="-16" cy="-24" r="84"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F7F3EB"/><stop offset="1" stop-color="#DCD4C8"/></radialGradient>
    <linearGradient id="${p}ponte" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F0E8"/><stop offset=".5" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E8E2D8"/></linearGradient>
    <radialGradient id="${p}foc" cx=".4" cy=".3" r=".85"><stop offset="0" stop-color="#6A5C56"/><stop offset=".55" stop-color="#3E3330"/><stop offset="1" stop-color="#241C1A"/></radialGradient>
    <radialGradient id="${p}iris" cx=".42" cy=".38" r=".65"><stop offset="0" stop-color="#7A5034"/><stop offset=".45" stop-color="#4A2A16"/><stop offset="1" stop-color="#180C06"/></radialGradient>
    <linearGradient id="${p}orelha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2DCD2"/><stop offset=".5" stop-color="#FBF8F2"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient>
    <linearGradient id="${p}orelhaIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6A5A54"/><stop offset=".5" stop-color="#C8B4AA"/><stop offset="1" stop-color="#EEDDD4"/></linearGradient>
    <radialGradient id="${p}sombra"><stop offset="0" stop-color="#4A3014" stop-opacity=".46"/><stop offset=".6" stop-color="#4A3014" stop-opacity=".22"/><stop offset="1" stop-color="#4A3014" stop-opacity="0"/></radialGradient>
    <clipPath id="${p}olho"><ellipse rx="13.5" ry="15.5"/></clipPath>
    <clipPath id="${p}cTronco"><path d="${TRONCO}"/></clipPath>
    <clipPath id="${p}cPeito"><ellipse rx="64" ry="78"/></clipPath>
    <clipPath id="${p}cGarupa"><ellipse rx="70" ry="76"/></clipPath>
    <clipPath id="${p}cSupF"><path d="${SUP_F}"/></clipPath>
    <clipPath id="${p}cSupT"><path d="${SUP_T}"/></clipPath>
    <clipPath id="${p}cCab"><ellipse rx="44" ry="43"/></clipPath>
    <clipPath id="${p}cPonte"><rect class="zb-cPonteR" x="0" y="-30" width="80" height="60" rx="30"/></clipPath>
    ${[0, 1, 2, 3].map(i => `<clipPath id="${p}cCrina${i}"><path d="${crinaPath(i)}"/></clipPath>`).join('')}`;
  }

  /* --- riscas do tronco (perfil), do peito (de frente) e da garupa (de costas) --- */
  function riscasTronco() {
    let d = '';
    // risca do dorso (ao longo da linha das costas)
    d += faixa([[-168, -66], [-130, -82], [-90, -84], [-40, -78], [10, -74], [60, -82], [110, -98], [146, -88]], 15, 13, .05, .05);
    // barriga: verticais, a acabar numa risca comprida por baixo
    for (const x0 of [-38, -14, 10, 34, 58]) d += faixa([[x0 + 6, -104], [x0 + 2, -40], [x0 - 3, 20], [x0 - 4, 62], [x0 + 6, 80]], 13, 6, .02, .2);
    d += faixa([[-110, 76], [-50, 70], [20, 72], [90, 66], [130, 52]], 9, 7, .25, .25);
    // espádua: inclinadas para trás em baixo (continuam as do pescoço)
    for (const x0 of [84, 108, 132, 156]) d += faixa([[x0 + 18, -112], [x0 + 6, -50], [x0 - 6, 10], [x0 - 18, 78]], 12, 8, .02, .15);
    // anca: arcos à volta do quadril (de verticais nas costas a horizontais atrás)
    const C = [-196, -112];
    for (const r of [80, 104, 128]) {
      const pts = [];
      for (let k = 0; k <= 6; k++) { const a = lerp(-.05, 1.62, k / 6); pts.push([C[0] + r * Math.cos(a), C[1] + r * Math.sin(a)]); }
      d += faixa(pts, 13, 12, .02, .02);
    }
    // anca de baixo: riscas quase horizontais que seguem para a coxa
    d += faixa([[-176, 30], [-140, 34], [-104, 44], [-80, 58]], 12, 8, .02, .25);
    d += faixa([[-170, 56], [-136, 60], [-104, 72]], 11, 7, .02, .3);
    return d;
  }
  function troncoSVG(p) {
    return `<g class="zb-troncoR">
      <path d="${TRONCO}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7" stroke-linejoin="round"/>
      <path d="${TRONCO}" fill="url(#${p}pelo)"/>
      <g clip-path="url(#${p}cTronco)"><path d="${riscasTronco()}" fill="${COR.risca}"/>
        <g class="zb-poCorpo">${[[-110, -40, 54, 36], [-40, 30, 60, 32], [40, -30, 50, 36], [100, 20, 44, 40], [-140, 30, 40, 44], [10, 66, 80, 22]].map(([x, y, rx, ry], i) => `<ellipse class="zb-poC${i}" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${p}poeira)" opacity="0"/>`).join('')}</g></g>
      <path d="${TRONCO}" fill="url(#${p}luzV)"/>
      <path d="M-150,-42 C-130,-70 -96,-74 -60,-68 C-20,-62 30,-62 60,-72 C90,-84 118,-90 136,-78" stroke="#FFFFFF" stroke-width="7" fill="none" opacity=".22" stroke-linecap="round"/>
      <ellipse cx="-112" cy="-18" rx="44" ry="40" fill="#FFFFFF" opacity=".1"/>
    </g>`;
  }
  function peitoSVG(p) {
    let r = '';
    for (let k = -3; k <= 3; k++) r += faixa([[k * 15, -84], [k * 19, -20], [k * 21, 30], [k * 17, 84]], 9, 7, .02, .02);
    r += faixa([[-70, 50], [0, 66], [70, 50]], 9, 9, .1, .1);
    return `<ellipse rx="64" ry="78" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7"/>
      <ellipse rx="64" ry="78" fill="url(#${p}pelo)"/>
      <g clip-path="url(#${p}cPeito)"><path d="${r}" fill="${COR.risca}"/></g>
      <ellipse rx="64" ry="78" fill="url(#${p}luzV)"/><ellipse cx="-24" cy="-30" rx="22" ry="30" fill="#FFFFFF" opacity=".16"/>`;
  }
  function garupaSVG(p) {
    let r = faixa([[0, -90], [0, -40], [0, -6]], 12, 10, .02, .2);
    for (const y0 of [-56, -30, -4, 22, 48, 74]) for (const s of [-1, 1]) r += faixa([[s * 8, y0 + 18], [s * 34, y0 + 4], [s * 62, y0 - 6], [s * 80, y0 - 10]], 10, 9, .1, .02);
    return `<ellipse rx="70" ry="76" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7"/>
      <ellipse rx="70" ry="76" fill="url(#${p}pelo)"/>
      <g clip-path="url(#${p}cGarupa)"><path d="${r}" fill="${COR.risca}"/></g>
      <ellipse rx="70" ry="76" fill="url(#${p}luzV)"/>
      <path d="M0,-70 C-3,-20 -3,20 0,70" stroke="#2A1E18" stroke-width="3" fill="none" opacity=".3" stroke-linecap="round"/>`;
  }

  /* --- Pescoço: 4 segmentos (trapézios) com tampas redondas nas juntas; riscas em cada segmento (2 por segmento, com o
         intervalo branco em cima da junta: o padrão continua de um segmento para o outro) e crina curta e eriçada às riscas --- */
  const RISCAS_P = [[5, 16], [26, 37]];           // x das riscas dentro de cada segmento (0…LS)
  function trapPesc(i, e) {
    const a = WN[i] / 2 + e, b = WN[i + 1] / 2 + e, x0 = -6, x1 = LS + 6;
    if (i === 0) return `M14,${-a} L${x1},${-b} L${x1},${b} L14,${a} C${-16 - e},${n(a * .7)} ${-20 - e},${n(-a * .7)} 14,${-a} Z`;
    return `M${x0},${-a} L${x1},${-b} L${x1},${b} L${x0},${a} Z`;
  }
  function riscasPesc(i) {
    const w = x => lerp(WN[i] / 2, WN[i + 1] / 2, (x + 6) / (LS + 12)) - .5;
    let d = '';
    for (const [x1, x2] of RISCAS_P) {
      // ligeiramente em V: a risca encosta-se para a frente no meio do pescoço e volta atrás nas bordas
      const pts = [];
      for (let k = 0; k <= 6; k++) { const v = lerp(-1, 1, k / 6); pts.push([x1 + 3 * (1 - v * v) + v * 2, w(x1) * v * 1.04]); }
      for (let k = 6; k >= 0; k--) { const v = lerp(-1, 1, k / 6); pts.push([x2 + 3 * (1 - v * v) + v * 2 - (Math.abs(v) > .7 ? 1.5 : 0), w(x2) * v * 1.04]); }
      d += 'M' + pts.map(q => `${n(q[0])},${n(q[1])}`).join(' L') + 'Z';
    }
    return d;
  }
  function crinaPath(i) {      // crina curta e direita: base dentro do pescoço (y = 6), pontas para fora (−y), em dentes
    const H = 25 - i * 1.6;
    let d = `M-9,8 L-9,${n(-H * .7)}`;
    for (let x = -9, k = 0; x < LS + 9; x += 5.5, k++) d += ` Q${n(x + 1.2)},${n(-H - 4 - (k % 2) * 2)} ${n(x + 2.75)},${n(-H - (k % 3) * 1.6)} Q${n(x + 4.2)},${n(-H + 3)} ${n(x + 5.5)},${n(-H + 1 - (k % 2))}`;
    return d + ` L${LS + 9},8 Z`;
  }
  function pescocoSVG(p) {
    let cont = '', crina = '', disc = '', fill = '';
    for (let i = 0; i < N_PESC; i++) {
      const cr = crinaPath(i);
      const contorno = i === 0 ? `M30,${n(-WN[0] / 2 - 3.5 + (WN[0] - WN[1]) / 2 * 30 / LS)} L${LS + 6},${-WN[1] / 2 - 3.5} L${LS + 6},${WN[1] / 2 + 3.5} L30,${n(WN[0] / 2 + 3.5 - (WN[0] - WN[1]) / 2 * 30 / LS)} Z` : trapPesc(i, 3.5);
      cont += `<g class="zb-pc${i}"><path d="${contorno}" fill="${COR.cont}"/></g>`;
      // crina: contorno escuro, pelo claro e as riscas do pescoço a continuar pela crina (recortadas pela crina)
      const bandas = RISCAS_P.map(([a, b]) => `M${a + 1},10 L${b + 1},10 L${b + 4},-40 L${a + 4},-40 Z`).join('');
      crina += `<g class="zb-pc${i}"><g class="zb-crina${i}"><path d="${cr}" fill="${COR.crinaE}" stroke="${COR.crinaE}" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="${cr}" fill="${COR.crinaC}"/><g clip-path="url(#${p}cCrina${i})"><path d="${bandas}" fill="${COR.risca}"/>
        <path d="M-12,${n(-27 + i * 1.6)} L${LS + 12},${n(-27 + i * 1.6)}" stroke="${COR.crinaE}" stroke-width="10" opacity=".85"/></g></g></g>`;
      fill += `<g class="zb-pc${i}"><path d="${trapPesc(i, 0)}" fill="url(#${p}pesc)"/><path d="${riscasPesc(i)}" fill="${COR.risca}"/>
        <path d="M2,${n(WN[i] * .2)} L${LS},${n(WN[i + 1] * .2)}" stroke="#3A2A20" stroke-width="6" opacity=".08" stroke-linecap="round"/>
        <path class="zb-cc${i}" d="M-8,-11 C10,-14 30,-14 ${LS + 8},-10 L${LS + 8},10 C30,14 10,14 -8,11 Z" fill="${COR.crina}" stroke="#14100E" stroke-width="2" opacity="0"/></g>`;
      if (i > 0) {
        cont += `<g class="zb-pj${i}"><circle r="${WN[i] / 2 + 3.5}" fill="${COR.cont}"/></g>`;
        disc += `<g class="zb-pj${i}"><circle r="${WN[i] / 2}" fill="#F5F1E9"/></g>`;
      }
    }
    return `<g class="zb-pescoco"><g>${cont}</g><g>${crina}</g><g>${disc}</g><g>${fill}</g></g>`;
  }

  /* --- Patas (cada peça ao longo de +x; contorno primeiro, enchimento depois). Riscas horizontais = faixas de x fixo --- */
  const capsula = (L, a, b) => `M0,${-a} L${L},${-b} A${b},${b} 0 0 1 ${L},${b} L0,${a} A${a},${a} 0 0 1 0,${-a} Z`;
  const INF = L => capsula(L, 9.5, 8.5);
  // quartela + casco (o boleto fica na origem; o casco aponta para +x = para a frente)
  const CASCO = 'M-10,2 L9,2 C12,10 16,18 20,28 C10,31 -6,31 -14,28 C-14,18 -12,10 -10,2 Z';
  function bandasInf(L) {      // faixas na canela, cada vez mais finas e juntas para baixo
    let d = '';
    const xs = [[4, 11], [17, 23], [29, 34], [39, 43.5], [48, 52], [56, 59.5], [63, 66]];
    for (const [a, b] of xs) {
      const A = a / 76 * L, B = b / 76 * L, wa = lerp(9.5, 8.5, A / L) + .5, wb = lerp(9.5, 8.5, B / L) + .5;
      d += `M${n(A + 1.5)},${n(-wa)} L${n(B + 1.5)},${n(-wb)} L${n(B - 1.5)},${n(wb)} L${n(A - 1.5)},${n(wa)} Z`;
    }
    return d;
  }
  function bandasSup(fr) {
    let d = '';
    const xs = fr ? [[-18, -8], [2, 12], [21, 31], [40, 49], [58, 66], [74, 81], [87, 93]] : [[-36, -25], [-14, -3], [7, 17], [27, 36], [46, 54], [64, 72], [82, 89], [98, 104]];
    for (const [a, b] of xs) d += `M${a + 4},-50 L${b + 4},-50 L${b - 4},50 L${a - 4},50 Z`;
    return d;
  }
  function pernaSVG(p, pe) {
    const fr = pe.fr, sup = fr ? SUP_F : SUP_T, L2 = pe.L2;
    const k = 'zb-' + pe.id;
    return `<g class="zb-perna ${k}">
      <g class="${k}-sup"><path d="${sup}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7" stroke-linejoin="round"/></g>
      <g class="${k}-inf"><path d="${INF(L2)}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7"/></g>
      <g class="${k}-joe"><circle r="${fr ? 12.5 : 12}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7"/></g>
      <g class="${k}-casco"><path d="${CASCO}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="6" stroke-linejoin="round"/></g>
      <g class="${k}-bol"><circle r="11" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7"/></g>
      <g class="${k}-sup"><path d="${sup}" fill="${COR.pelo}"/><g clip-path="url(#${p}${fr ? 'cSupF' : 'cSupT'})"><path d="${bandasSup(fr)}" fill="${COR.risca}"/></g>
        <path d="${sup}" fill="url(#${p}luzV)" opacity=".6"/></g>
      <g class="${k}-inf"><path d="${INF(L2)}" fill="${COR.pelo}"/><path d="${bandasInf(L2)}" fill="${COR.risca}"/>
        <path d="M8,-4 L${L2 - 10},-3" stroke="#FFFFFF" stroke-width="2.2" opacity=".35" stroke-linecap="round"/></g>
      <g class="${k}-joe"><circle r="${fr ? 12.5 : 12}" fill="${COR.pelo}"/><path d="M-11,-4 C-4,-7 4,-7 11,-4 L11,3 C4,0 -4,0 -11,3 Z" fill="${COR.risca}"/></g>
      <g class="${k}-casco"><path d="${CASCO}" fill="url(#${p}casco)"/><path d="M-11,6 C-4,8 4,8 11,6" stroke="#4A3C36" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M-9,12 L10,12" stroke="#7A6C66" stroke-width="1.8" opacity=".8" stroke-linecap="round"/><path d="M-12,27 C0,29 10,29 19,27" stroke="#0E0A08" stroke-width="2" fill="none" opacity=".7"/></g>
      <g class="${k}-bol"><circle r="11" fill="#2E2522"/><path d="M-6,-5 C-2,-8 3,-8 7,-5" stroke="#6A5A54" stroke-width="1.8" fill="none"/></g>
    </g>`;
  }
  function sombrasPesSVG(p) {
    return PERNAS.map(pe => `<ellipse class="zb-sp-${pe.id}" rx="26" ry="6.5" fill="url(#${p}sombra)"/>`).join('');
  }
  // cauda: contorno, pelo branco às riscas (traços postos a cada quadro) e a borla escura na ponta
  function caudaSVG(p) {
    return `<path class="zb-caudaC" d="" fill="${COR.crinaE}" stroke="${COR.crinaE}" stroke-width="5" stroke-linejoin="round"/>
      <path class="zb-caudaF" d="" fill="${COR.pelo}"/>
      <path class="zb-caudaR" d="" fill="none" stroke="${COR.risca}" stroke-width="5"/>
      <path class="zb-caudaB" d="" fill="${COR.crina}"/>
      <path class="zb-caudaM" d="" fill="none" stroke="#5A4A44" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>`;
  }

  /* --- Cabeça: vista de frente cujas feições deslizam com Y = cos(rumo da cabeça)
         (−1 perfil para a esquerda … 0 de frente … 1 perfil para a direita); F = sen(rumo) (< 0: de costas, a cara esconde-se);
         beta = inclinação do focinho (graus, + para baixo). A cara é comprida: crânio → ponte (riscas em V) → focinho escuro.
         Riscas da testa e das bochechas: linhas sobre a esfera do crânio (só os troços virados para nós) --- */
  const LF = 86;
  const RCX = 44, RCY = 43;
  // riscas do crânio: listas de pontos (longitude λ, latitude φ) em radianos; λ = 0 no meio da testa
  const RISCAS_TESTA = [-.4, -.14, .12, .38].map(l0 => Array.from({ length: 6 }, (_, k) => {
    const f = lerp(1.3, .18, k / 5); return [l0 * lerp(1.1, .6, k / 5) - .01, f];
  }));
  const RISCAS_FACE = [];
  for (const s of [-1, 1]) for (const [a, b] of [[.7, .5], [.92, .22], [1.12, -.06]]) {
    RISCAS_FACE.push(Array.from({ length: 7 }, (_, k) => { const u = k / 6; return [s * (a + u * .5), b - u * .8]; }));
  }
  function linhaEsfera(lista, al, sb) {
    let d = '';
    for (const L of lista) {
      let aberto = false;
      for (const [l, f] of L) {
        const g = l + al, vis = Math.cos(f) * Math.cos(g);
        const x = RCX * Math.cos(f) * Math.sin(g), y = -RCY * Math.sin(f) + 6 * sb * Math.cos(f) * Math.cos(g);
        if (vis > .04) { d += `${aberto ? 'L' : 'M'}${n(x)},${n(y)}`; aberto = true; } else aberto = false;
      }
    }
    return d || 'M0,0';
  }
  function estadoCabeca(q) {
    const Y = q.Y, aY = Math.abs(Y), b = q.beta * RAD, cb = Math.cos(b), sb = Math.sin(b);
    const t = {}, d = {}, op = {}, a = {};
    const Mx = Y * LF * cb, My = 4 + LF * sb;               // centro do focinho
    a.M = [Mx, My];
    const bx = Mx, by = My + 4, bl = Math.hypot(bx, by);
    const angP = Math.atan2(by, bx) / RAD;
    t.ponte = `translate(0,-4) rotate(${n(angP)})`; a.ponteL = n(Math.max(1, bl));
    // riscas em V na ponte (no espaço da ponte: x ao longo da cara, y de lado); o bico do V aponta para o focinho
    {
      let r = '';
      for (let x0 = 12; x0 < bl - 30; x0 += 10.5) {
        const w = 5.2, pts = [];
        for (let k = 0; k <= 6; k++) { const v = lerp(-1, 1, k / 6); pts.push([x0 + 7 * (1 - Math.abs(v)), v * 31]); }
        for (let k = 6; k >= 0; k--) { const v = lerp(-1, 1, k / 6); pts.push([x0 + w + 7 * (1 - Math.abs(v)), v * 31]); }
        r += 'M' + pts.map(q2 => `${n(q2[0])},${n(q2[1])}`).join(' L') + 'Z';
      }
      d.riscasPonte = r || 'M0,0';
    }
    const rf = Y * q.beta * .55;
    t.foc = `translate(${n(Mx)},${n(My)}) rotate(${n(rf)})`;
    t.queixo = `translate(${n(Mx - Y * 10 + q.mastX)},${n(My + 21 + q.boca * 24 + q.mastY)}) rotate(${n(rf + q.mastX * 1.5)})`;
    const bcy = My + 21 + q.boca * 12;
    t.bocaInt = `translate(${n(Mx + Y * 5 + q.mastX * .5)},${n(bcy)})`;
    a.bocaRy = n(1.2 + q.boca * 15); a.bocaRx = n(20 * (1 - .25 * aY));
    t.lingua = `translate(${n(Mx + Y * 6 + q.mastX * .5)},${n(bcy + q.boca * 7)}) scale(${n3((1 - .3 * aY) * .9)},${n3(limita(q.boca * 1.6, .05, 1))})`;
    op.lingua = q.boca > .1 ? '1' : '0';
    t.dentesS = `translate(${n(Mx + Y * 10 + q.mastX * .4)},${n(bcy - a.bocaRy + 1)}) rotate(${n(rf * .6)}) scale(${n3(1 - .4 * aY)},1)`;
    t.dentesI = `translate(${n(Y * 4)},-13) scale(${n3(1 - .4 * aY)},1)`;
    op.dentes = n3(passoS(.12, .38, q.boca));
    // boca (linha do sorriso, no fundo do focinho)
    const c1 = [Mx - 16 * (1 - aY) + aY * (Y > 0 ? -6 : -28), My + 17 - (Y < 0 ? 4 : 0) * aY], c2 = [Mx + 16 * (1 - aY) + aY * (Y > 0 ? 28 : 6), My + 17 - (Y > 0 ? 4 : 0) * aY];
    const cc = [(c1[0] + c2[0]) / 2 + Y * 2, My + 21 + q.sorriso * 3];
    d.boca = `M${n(c1[0])},${n(c1[1])} Q${n(cc[0])},${n(cc[1])} ${n(c2[0])},${n(c2[1])}`;
    a.bocaFrente = [Mx + Y * 26 * cb, My + 14 + 6 * sb * aY];
    a.narinas = [Mx + Y * 22 * cb, My - 8];
    // feições presas a uma esfera: ângulo = lado (±) + rumo da cabeça (al)
    const al = Math.asin(limita(Y, -1, 1)) / RAD;
    const sen = g => Math.sin(g * RAD), cosg = g => Math.cos(g * RAD);
    d.testa = linhaEsfera(RISCAS_TESTA, al * RAD, sb);
    d.face = linhaEsfera(RISCAS_FACE, al * RAD, sb);
    for (const s of [-1, 1]) {
      const k = s < 0 ? 'E' : 'D';
      const gn = s * 34 + al;
      const x = Mx + 19 * sen(gn) + Y * 13 * cb, y = My - 9 - aY * 2 * cb + aY * 7 * sb;
      t['nar' + k] = `translate(${n(x)},${n(y)}) rotate(${n(s * 22 * (1 - aY) + Y * q.beta * .5)}) scale(${n3((.45 + .55 * Math.max(0, cosg(gn))) * (1 + q.nariz * .45))},${n3(1 + q.nariz * .6)})`;
      op['nar' + k] = n3(passoS(.02, .25, cosg(gn)));
      const ge = s * 54 + al, ce = cosg(ge), ex = 32 * sen(ge), sx = .16 + .84 * Math.max(0, ce) ** 1.3;
      t['olho' + k] = `translate(${n(ex)},-6) scale(${n3(sx * q.olhoEsc)},${n3(q.olhoEsc)})`;
      op['olho' + k] = ce > .08 ? '1' : '0';
      t['sobr' + k] = `translate(${n(37 * sen(ge + s * 3))},${n(-28 - q.sobr * 5)}) rotate(${n(s * (-8 + q.sobr * 10))}) scale(${n3(sx)},1)`;
      op['sobr' + k] = ce > .12 ? '1' : '0';
      const gc = s * 50 + al;
      t['boch' + k] = `translate(${n(36 * sen(gc))},17) scale(${n3(.3 + .7 * Math.max(0, cosg(gc)))},1)`;
      op['boch' + k] = n3(passoS(.05, .4, cosg(gc)) * .4 * (1 + q.feliz * .7));
      // orelhas em cima do crânio: inclinam para trás (tilt > 0) e rodam (tw: 1 = abertura para a frente, −1 = para trás)
      const go = s * 32 + al, ox = 27 * sen(go);
      const tilt = (s < 0 ? q.oE : q.oD) - q.orelhas;
      const tw = limita(s < 0 ? q.tE : q.tD, -1, 1);
      const rot = s * (16 + Math.max(0, tilt) * .5) * (1 - aY) - Y * tilt;
      const sy = 1 - (1 - aY) * limita(tilt / 70, -.1, .38);
      t['orelha' + k] = `translate(${n(ox)},-32) rotate(${n(rot)}) scale(${n3(.8 + .2 * (1 - aY))},${n3(sy)})`;
      t['orelhaIn' + k] = `scale(${n3(limita(.1 + .9 * tw, .06, 1))},1)`;
      op['orelhaIn' + k] = n3(passoS(-.6, .1, tw));
    }
    t.franja = `translate(${n(Y * 18)},-38) skewX(${n(q.franja)}) scale(${n3(1 - .35 * aY)},1)`;
    t.ganache = `translate(${n(-Y * 8)},10) scale(${n3(Y)},1)`; op.ganache = n3(aY * .55);
    // pálpebras: c = fecho, h = olhos contentes («∩»)
    const c = limita(q.fecho, 0, 1), h = limita(q.feliz, 0, 1);
    const ye = lerp(lerp(-11, 11, c), 7, h), cy = lerp(lerp(-27, 18, c), -12, h);
    d.palpS = `M-18,-24 L18,-24 L18,${n(ye)} Q0,${n(cy)} -18,${n(ye)} Z`;
    const yl = lerp(19, 8, h), cyl = lerp(24, -9, h);
    d.palpI = `M-18,24 L18,24 L18,${n(yl)} Q0,${n(cyl)} -18,${n(yl)} Z`;
    const Q = (u, p0, p1, p2) => (1 - u) * (1 - u) * p0 + 2 * u * (1 - u) * p1 + u * u * p2;
    let cil = `M-14.5,${n(Q(.1, ye, cy, ye))} Q0,${n(Q(.5, ye, cy, ye) * 2 - (Q(.1, ye, cy, ye) + Q(.9, ye, cy, ye)) / 2)} 14.5,${n(Q(.9, ye, cy, ye))}`;
    for (const u of [.1, .28, .46, .64, .82, .96]) {
      const x = lerp(-18, 18, u), y = Q(u, ye, cy, ye), vx = x * .6, vy = y - 3;
      const L = Math.hypot(vx, vy) || 1, ux = vx / L, uy = vy / L, comp = 11.5 * (1 - c * .25) * (u > .9 || u < .15 ? .75 : 1);
      cil += ` M${n(x)},${n(y)} q${n(ux * comp * .5 - uy * 2.5)},${n(uy * comp * .5 + ux * 2.5)} ${n(ux * comp)},${n(uy * comp)}`;
    }
    d.cil = cil;
    t.iris = `translate(${n(q.olharX * 4.5 + Y * 2)},${n(q.olharY * 4)})`;
    // de costas: a cara (focinho, olhos, boca) esconde-se atrás do crânio
    op.rosto = n3(passoS(-.62, -.34, q.F));
    return { t, d, op, a };
  }

  // cores lisas para o ícone (sem gradientes com id)
  const LISO = { pelo: '#FAF7F0', cab: '#F8F4EC', ponte: '#FAF6EE', foc: '#3E3330', iris: '#3E2010', orelha: '#F4F0E8', orelhaIn: '#D8C6BC', luzV: 'none', pesc: '#F8F4EC' };
  const ORELHA = 'M-14,8 C-19,-10 -11,-34 0,-47 C11,-34 19,-10 14,8 Z';
  function cabecaSVG(p, E, icone) {
    const T = k => E.t[k] ? ` transform="${E.t[k]}"` : '';
    const O = k => E.op[k] != null ? ` opacity="${E.op[k]}"` : '';
    const orelha = k => `<g class="zb-orelha${k}"${T('orelha' + k)}>
        <path d="${ORELHA}" fill="url(#${p}orelha)" stroke="${COR.cont}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M-13.5,-12 C-6,-15.5 6,-15.5 13.5,-12 L12.8,-4 C6,-7.5 -6,-7.5 -12.8,-4 Z" fill="${COR.risca}"/>
        <g class="zb-orelhaIn${k}"${T('orelhaIn' + k)}${O('orelhaIn' + k)}><path d="M-8,4 C-10,-9 -6,-26 0,-36 C6,-26 10,-9 8,4 Z" fill="url(#${p}orelhaIn)"/>
          <path d="M-5,0 C-6,-9 -4,-18 -2,-26 M0,2 C0,-8 0,-18 0,-30 M5,0 C6,-9 4,-18 2,-26" stroke="#FFFFFF" stroke-width="1.6" fill="none" opacity=".9" stroke-linecap="round"/></g>
        <path d="M-8.5,-32 C-5,-38 -2,-43 0,-47 C2,-43 5,-38 8.5,-32 C4,-34.5 -4,-34.5 -8.5,-32 Z" fill="${COR.risca}"/>
        <path d="M-9,-6 C-10,-16 -6,-28 -1,-38" stroke="#FFFFFF" stroke-width="2.4" fill="none" opacity=".6" stroke-linecap="round"/></g>`;
    const olho = k => `<g class="zb-olho${k}"${T('olho' + k)}${O('olho' + k)}>
        <ellipse rx="19" ry="21" fill="#2A211E" opacity=".55"/>
        <g${icone ? '' : ` clip-path="url(#${p}olho)"`}>
          <ellipse rx="13.5" ry="15.5" fill="#FFFDF6"/>
          <g class="zb-iris${k}"${T('iris')}><circle cy="1" r="11.2" fill="url(#${p}iris)"/><circle cy="1" r="11.2" fill="none" stroke="#120804" stroke-width="1.6"/>
            <ellipse cy="1.5" rx="6.6" ry="5.4" fill="#0E0603"/><circle cx="-4" cy="-4" r="4.6" fill="#FFFFFF"/><circle cx="4.2" cy="5" r="2.1" fill="#FFFFFF" opacity=".9"/></g>
          ${icone ? '' : `<path d="M-18,-20 L18,-20 L18,-8 Q0,-22 -18,-8 Z" fill="#3A2A20" opacity=".14"/>
          <path class="zb-palpS${k}" d="${E.d.palpS}" fill="#F2EEE6"/>
          <path class="zb-palpI${k}" d="${E.d.palpI}" fill="#F2EEE6"/>`}
        </g>
        <ellipse rx="13.5" ry="15.5" fill="none" stroke="#1E1714" stroke-width="2.6"/>
        <path class="zb-cil${k}" d="${E.d.cil}" fill="none" stroke="#14100E" stroke-width="2.6" stroke-linecap="round"/>
      </g>`;
    const nar = k => `<g class="zb-nar${k}"${T('nar' + k)}${O('nar' + k)}><path d="M-7,1 C-7,-4 -2,-6 3,-5 C7,-4 8,0 6,3 C3,6 -5,6 -7,1 Z" fill="#100A08"/><path d="M-6,-3 C-2,-7 4,-7 7,-3" stroke="#8A7A74" stroke-width="1.6" fill="none" opacity=".9"/></g>`;
    const dentes = (cl, inv) => `<g class="${cl}"${T(cl === 'zb-dentesS' ? 'dentesS' : 'dentesI')}${O('dentes')}><path d="M-12,0 L12,0 L11,${inv ? -6 : 6} C6,${inv ? -8 : 8} -6,${inv ? -8 : 8} -11,${inv ? -6 : 6} Z" fill="#FFFBEE" stroke="#C9BBA0" stroke-width="1.2"/>
        <path d="M-6,0 L-6,${inv ? -6 : 6} M0,0 L0,${inv ? -7 : 7} M6,0 L6,${inv ? -6 : 6}" stroke="#D2C4A8" stroke-width="1.1"/></g>`;
    const franja = 'M-13,6 C-13,-2 -12,-8 -10,-16 L-6,-6 C-5,-12 -3,-18 0,-23 L2,-8 C4,-14 7,-18 10,-20 L9,-6 C11,-9 13,-12 15,-13 L13,6 Z';
    const s = `<g class="zb-cab-in">
      ${orelha('E')}${orelha('D')}
      <ellipse rx="${RCX + 3.5}" ry="${RCY + 3.5}" fill="${COR.cont}"/>
      <g class="zb-rostoC"${O('rosto')}>
        <g class="zb-ponteC"${T('ponte')}><rect class="zb-ponteCr" x="0" y="-33.5" width="${E.a.ponteL}" height="67" rx="33.5" fill="${COR.cont}"/></g>
        <g class="zb-queixoC"${T('queixo')}><ellipse rx="29.5" ry="17.5" fill="${COR.cont}"/></g>
        <g class="zb-focC"${T('foc')}><ellipse rx="43.5" ry="35.5" fill="${COR.cont}"/></g>
      </g>
      <ellipse rx="${RCX}" ry="${RCY}" fill="url(#${p}cab)"/>
      <g${icone ? '' : ` clip-path="url(#${p}cCab)"`}>
        <path class="zb-testa" d="${E.d.testa}" stroke="${COR.risca}" stroke-width="3.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="zb-face" d="${E.d.face}" stroke="${COR.risca}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <path d="M-30,-28 C-18,-40 4,-44 22,-38" stroke="#FFFFFF" stroke-width="6" fill="none" opacity=".4" stroke-linecap="round"/>
      <g class="zb-ganache"${T('ganache')}${O('ganache')}><path d="M24,-8 C30,10 22,28 2,32" stroke="#2A211E" stroke-width="3.5" fill="none" stroke-linecap="round"/></g>
      <g class="zb-rosto"${O('rosto')}>
        <g class="zb-queixo"${T('queixo')}><ellipse rx="26" ry="14" fill="#4A3E3A"/><path d="M-14,5 C-4,9 6,9 14,4" stroke="#6E605A" stroke-width="1.6" fill="none"/>${dentes('zb-dentesI', true)}</g>
        <g class="zb-ponte"${T('ponte')}><rect class="zb-ponteR" x="0" y="-30" width="${E.a.ponteL}" height="60" rx="30" fill="url(#${p}ponte)"/>
          <g${icone ? '' : ` clip-path="url(#${p}cPonte)"`}><path class="zb-riscasPonte" d="${E.d.riscasPonte}" fill="${COR.risca}"/></g></g>
        <g class="zb-foc"${T('foc')}><ellipse rx="40" ry="31" fill="url(#${p}foc)"/><ellipse cx="-12" cy="-15" rx="15" ry="6" fill="#FFFFFF" opacity=".2"/>
          <g fill="#7A6A64" opacity=".7"><circle cx="-20" cy="10" r="1.4"/><circle cx="-13" cy="14" r="1.4"/><circle cx="13" cy="14" r="1.4"/><circle cx="20" cy="10" r="1.4"/></g></g>
        <ellipse class="zb-bocaInt"${T('bocaInt')} rx="${E.a.bocaRx}" ry="${E.a.bocaRy}" fill="${COR.boca}"/>
        <g class="zb-lingua"${T('lingua')}${O('lingua')}><ellipse cy="-2" rx="12" ry="7" fill="#E07A8A"/><path d="M0,-7 L0,2" stroke="#B85A6A" stroke-width="1.4"/></g>
        ${dentes('zb-dentesS', false)}
        <path class="zb-boca" d="${E.d.boca}" stroke="#14100E" stroke-width="3" fill="none" stroke-linecap="round"/>
        ${nar('E')}${nar('D')}
        <ellipse class="zb-bochE"${T('bochE')}${O('bochE')} rx="11" ry="6.5" fill="#F29A96"/><ellipse class="zb-bochD"${T('bochD')}${O('bochD')} rx="11" ry="6.5" fill="#F29A96"/>
        ${olho('E')}${olho('D')}
        <path class="zb-sobrE"${T('sobrE')}${O('sobrE')} d="M-9,2 C-4,-3 4,-3 9,1" stroke="#2A211E" stroke-width="3" fill="none" stroke-linecap="round" stroke-opacity=".75"/>
        <path class="zb-sobrD"${T('sobrD')}${O('sobrD')} d="M-9,1 C-4,-3 4,-3 9,2" stroke="#2A211E" stroke-width="3" fill="none" stroke-linecap="round" stroke-opacity=".75"/>
      </g>
      <g class="zb-franja"${T('franja')}><path d="${franja}" fill="${COR.crinaC}" stroke="${COR.crinaE}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M-11,-8 L-9,-15 L-7,-8 M-2,-10 L0,-22 L1.5,-10 M6,-9 L9,-19 L9,-9" stroke="${COR.crinaE}" stroke-width="3" fill="none" stroke-linejoin="round"/></g>
    </g>`;
    if (!icone) return s;
    return s.replace(/url\(#[a-z]+-([A-Za-z]+)\)/g, (m, k) => LISO[k] || '#FAF7F0');
  }

  function zebraSVG(p) {
    const E = estadoCabeca(CAB0);
    return `<g class="zb-zebra">
      <g class="zb-sombras"><ellipse class="zb-sombra" rx="1" ry="1" fill="url(#${p}sombra)"/>${sombrasPesSVG(p)}</g>
      <g class="zb-rolo">
        <g class="zb-corpo">
          <g class="zb-pernasTras">${PERNAS.map(pe => pernaSVG(p, pe)).join('')}</g>
          <g class="zb-slotCaudaT"><g class="zb-cauda">${caudaSVG(p)}</g></g>
          <g class="zb-slotPescT"></g>
          <g class="zb-tronco">${troncoSVG(p)}</g>
          <g class="zb-garupa" display="none">${garupaSVG(p)}</g>
          <g class="zb-slotCaudaF"></g>
          <g class="zb-pernasFrente"></g>
          <g class="zb-peito" display="none">${peitoSVG(p)}</g>
        </g>
        <g class="zb-slotPescF"><g class="zb-frente">${pescocoSVG(p)}<g class="zb-cab">${cabecaSVG(p, E)}</g></g></g>
      </g>
      <g class="zb-copia" display="none">${arvFrenteSVG(p)}</g>
    </g>`;
  }
  const CAB0 = { Y: -.5, F: .8, beta: 52, oE: 0, oD: 0, tE: 1, tD: 1, orelhas: 0, fecho: 0, feliz: 0, sobr: 0, boca: 0, mastX: 0, mastY: 0, olharX: 0, olharY: 0, nariz: 0, sorriso: .4, olhoEsc: 1.12, franja: 0 };

  /* ================= 4) Cenário: planície africana de manhã, com o Kilimanjaro ================= */
  const SOL = { x: 186, y: 142 };
  const POCA = { cx: 1090, cy: 770, rx: 240, ry: 46 };          // charco de pó (no ecrã)
  const ARV = { x: 1300, y: 748 };                               // base do tronco da Kigelia
  function defsCena(p) {
    return `
    <linearGradient id="${p}ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4F98D8"/><stop offset=".42" stop-color="#8EC3EA"/><stop offset=".72" stop-color="#CFE3EC"/><stop offset="1" stop-color="#F6E9C8"/></linearGradient>
    <radialGradient id="${p}solBrilho"><stop offset="0" stop-color="#FFFBE6" stop-opacity=".95"/><stop offset=".2" stop-color="#FFF2C4" stop-opacity=".5"/><stop offset=".55" stop-color="#FFEBB0" stop-opacity=".14"/><stop offset="1" stop-color="#FFEBB0" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}sol" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="#FFFFF4"/><stop offset=".7" stop-color="#FFF4C4"/><stop offset="1" stop-color="#FFE29A"/></radialGradient>
    <linearGradient id="${p}kili" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A9B4CE"/><stop offset=".5" stop-color="#97A2C0"/><stop offset="1" stop-color="#7E89A8"/></linearGradient>
    <linearGradient id="${p}kiliV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".7" stop-color="#E8E4D8" stop-opacity=".35"/><stop offset="1" stop-color="#F2E8CC" stop-opacity=".75"/></linearGradient>
    <linearGradient id="${p}neve" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F2F6FC"/><stop offset="1" stop-color="#C8D4EA"/></linearGradient>
    <linearGradient id="${p}longe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CBCB8E"/><stop offset="1" stop-color="#C2C27A"/></linearGradient>
    <linearGradient id="${p}meio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D2C46A"/><stop offset="1" stop-color="#BDB458"/></linearGradient>
    <linearGradient id="${p}prado" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B6B456"/><stop offset=".4" stop-color="#9EA848"/><stop offset="1" stop-color="#7E9238"/></linearGradient>
    <radialGradient id="${p}poca" cx=".42" cy=".4" r=".62"><stop offset="0" stop-color="#D8A272"/><stop offset=".7" stop-color="#C88E5E"/><stop offset="1" stop-color="#B07A4C" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}sombraArv"><stop offset="0" stop-color="#3A2A10" stop-opacity=".34"/><stop offset=".7" stop-color="#3A2A10" stop-opacity=".18"/><stop offset="1" stop-color="#3A2A10" stop-opacity="0"/></radialGradient>
    <linearGradient id="${p}casca" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A8A090"/><stop offset=".45" stop-color="#857C6C"/><stop offset="1" stop-color="#5A5246"/></linearGradient>
    <radialGradient id="${p}copa" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#6E9A3E"/><stop offset=".55" stop-color="#4C7428"/><stop offset="1" stop-color="#34521C"/></radialGradient>
    <linearGradient id="${p}fruto" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B8AC86"/><stop offset=".45" stop-color="#9A8C64"/><stop offset="1" stop-color="#6E6244"/></linearGradient>
    <radialGradient id="${p}poeira"><stop offset="0" stop-color="#CC9C6C" stop-opacity=".9"/><stop offset=".55" stop-color="#D2A272" stop-opacity=".55"/><stop offset="1" stop-color="#D4A676" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}vinheta" cx=".46" cy=".44" r=".78"><stop offset=".62" stop-color="#3A2A0A" stop-opacity="0"/><stop offset="1" stop-color="#3A2A0A" stop-opacity=".24"/></radialGradient>
    <radialGradient id="${p}luzQuente" gradientUnits="userSpaceOnUse" cx="${SOL.x}" cy="${SOL.y}" r="1150"><stop offset="0" stop-color="#FFF0C0" stop-opacity=".22"/><stop offset=".5" stop-color="#FFECC0" stop-opacity=".05"/><stop offset="1" stop-color="#FFECC0" stop-opacity="0"/></radialGradient>`;
  }
  function nuvemSVG(i, k) {
    return `<g class="zb-nuvem${i}"><g transform="scale(${k})">
      <ellipse cx="0" cy="12" rx="98" ry="12" fill="#D6E2EA" opacity=".8"/>
      <ellipse cx="-48" cy="0" rx="36" ry="17" fill="#F6FAFC"/><ellipse cx="-6" cy="-9" rx="42" ry="22" fill="#FFFFFF"/><ellipse cx="40" cy="-2" rx="36" ry="16" fill="#F8FBFD"/><ellipse cx="76" cy="6" rx="22" ry="9" fill="#F0F5F8"/>
      <ellipse cx="0" cy="8" rx="94" ry="9" fill="#FFF6E4" opacity=".8"/>
      <ellipse cx="-22" cy="-18" rx="24" ry="6" fill="#FFFFFF"/></g></g>`;
  }
  // Kilimanjaro: montanha larga de cume achatado e nevado (luz da esquerda: encosta da direita mais escura) e o Mawenzi
  function kiliSVG(p) {
    const base = 'M-80,560 C60,530 170,450 270,372 C310,342 350,318 396,312 L520,308 C566,310 604,326 646,352 C690,380 724,398 756,404 L772,382 L786,392 L798,370 L812,388 L826,384 C860,412 900,440 960,474 C1040,516 1120,540 1220,560 Z';
    const neve = 'M300,350 C336,326 362,316 396,312 L520,308 C566,310 600,324 640,348 C626,354 612,346 598,356 C586,364 576,350 562,360 C552,368 544,356 532,364 C526,384 518,392 512,372 C502,360 494,374 484,366 C476,386 468,398 462,376 C454,364 446,372 438,368 C430,388 420,396 416,374 C408,364 398,376 388,368 C378,380 370,386 364,372 C354,362 344,376 334,370 C324,380 316,384 310,370 C306,362 302,358 300,350 Z';
    return `<path d="${base}" fill="url(#${p}kili)"/>
      <path d="M520,308 C566,310 604,326 646,352 C690,380 724,398 756,404 L772,382 L786,392 L798,370 L812,388 L826,384 C860,412 900,440 960,474 C1040,516 1120,540 1220,560 L760,560 C700,500 640,430 520,308 Z" fill="#6E7898" opacity=".35"/>
      <path d="M270,372 C300,350 340,330 380,330 M600,350 C640,372 680,394 720,404" stroke="#C4CCE0" stroke-width="3" fill="none" opacity=".6"/>
      <path d="${neve}" fill="url(#${p}neve)"/>
      <path d="M772,382 L786,392 L798,370 L812,388 L804,392 L796,382 L788,398 Z" fill="#F2F6FC" opacity=".9"/>
      <path d="M330,346 C360,330 380,324 404,322 M440,320 L500,318" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".9"/>
      <path d="${base}" fill="url(#${p}kiliV)"/>
      <path d="M-80,520 C200,500 500,512 800,500 C1100,488 1400,504 1700,496 L1700,540 L-80,540 Z" fill="#F4ECD6" opacity=".45"/>`;
  }
  function acaciaSVG(x, y, k, cor) {
    return `<g transform="translate(${x},${y}) scale(${k})"><path d="M-2,0 L-1,-22 L-12,-34 M1,-20 L10,-34 M-1,-24 L0,-36" stroke="${cor}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M-40,-36 C-30,-48 30,-50 42,-38 C34,-32 -30,-30 -40,-36 Z" fill="${cor}"/></g>`;
  }
  function planiciesSVG(p) {
    const rnd = semente(17);
    let s = `<path d="M-20,548 C200,538 420,544 640,538 C860,532 1080,542 1300,536 C1460,532 1560,536 1620,534 L1620,640 L-20,640 Z" fill="url(#${p}longe)"/>`;
    // acácias de copa achatada ao longe
    s += [[120, 560, .9], [560, 552, .55], [880, 556, .7], [1480, 560, .8], [1010, 550, .45], [300, 552, .5]].map(([x, y, k]) => acaciaSVG(x, y, k, '#6E7448')).join('');
    let ef = '';
    for (let i = 0; i < 60; i++) { const x = rnd() * 1640 - 20, y = 552 + rnd() * 30; ef += `M${n(x)},${n(y)} l${n(4 + rnd() * 6)},0`; }
    s += `<path d="${ef}" stroke="#A9A866" stroke-width="2" opacity=".6"/>`;
    s += `<path d="M-20,592 C180,580 380,590 600,584 C820,578 1040,592 1260,584 C1420,578 1540,584 1620,582 L1620,700 L-20,700 Z" fill="url(#${p}meio)"/>`;
    return s;
  }
  // zebras pequeninas ao longe (a pastar) e gnus (silhuetas escuras)
  function zebrinhaSVG(i, x, y, k, flip) {
    return `<g transform="translate(${x},${y}) scale(${flip ? -k : k},${k})"><ellipse cx="0" cy="-2" rx="34" ry="5" fill="#5A5A2A" opacity=".25"/>
      <path d="M-20,-14 L-22,0 M-14,-14 L-13,0 M14,-14 L15,0 M20,-14 L19,0" stroke="#2A2220" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M-26,-26 C-26,-34 -16,-36 0,-35 C14,-34 22,-34 24,-28 C26,-20 20,-14 6,-13 C-8,-12 -24,-14 -26,-20 Z" fill="#FAF6EE" stroke="#3A2B25" stroke-width="1.6"/>
      <path d="M-18,-35 L-20,-14 M-10,-35 L-11,-13 M-2,-35 L-3,-13 M6,-35 L5,-13 M14,-34 L13,-14" stroke="#2A2220" stroke-width="2.4"/>
      <path d="M-26,-28 C-30,-24 -31,-18 -30,-10" stroke="#2A2220" stroke-width="2" fill="none"/>
      <g class="zb-zbC${i}"><path d="M20,-32 C28,-28 32,-18 34,-8 L40,-6 C40,-12 36,-24 28,-34 Z" fill="#FAF6EE" stroke="#3A2B25" stroke-width="1.6"/>
        <path d="M26,-30 L22,-26 M30,-22 L26,-20 M33,-14 L29,-13" stroke="#2A2220" stroke-width="2"/><ellipse cx="38" cy="-6" rx="4" ry="3" fill="#2A2220"/>
        <path d="M22,-34 L18,-40 M25,-34 L24,-41" stroke="#3A2B25" stroke-width="2.2" stroke-linecap="round"/></g></g>`;
  }
  function gnuSVG(cls, x, y, k, flip) {
    return `<g class="${cls}" transform="translate(${x},${y}) scale(${flip ? -k : k},${k})"><g class="${cls}In">
      <ellipse cx="0" cy="-1" rx="30" ry="4" fill="#5A5A2A" opacity=".25"/>
      <g class="zb-gnuPT"><path d="M-16,-14 L-18,0 M-10,-14 L-9,0" stroke="#3A3430" stroke-width="3.2" stroke-linecap="round"/></g>
      <g class="zb-gnuPF"><path d="M12,-14 L13,0 M18,-14 L17,0" stroke="#3A3430" stroke-width="3.2" stroke-linecap="round"/></g>
      <path d="M-22,-24 C-22,-30 -12,-32 2,-34 C10,-38 18,-40 22,-34 C24,-26 20,-16 12,-14 L-16,-13 C-22,-14 -24,-18 -22,-24 Z" fill="#4E4844"/>
      <path d="M-24,-26 C-28,-22 -28,-16 -27,-10" stroke="#2E2A26" stroke-width="2.4" fill="none"/>
      <path d="M20,-36 C26,-30 30,-22 32,-12 L37,-12 C36,-20 32,-30 26,-38 Z" fill="#4E4844"/><path d="M28,-24 L26,-16 M31,-18 L29,-12" stroke="#2E2A26" stroke-width="2"/>
      <path d="M20,-38 C16,-44 18,-46 22,-44 M24,-38 C28,-44 30,-44 28,-40" stroke="#2E2A26" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M12,-38 L10,-30 M16,-39 L14,-32" stroke="#2E2A26" stroke-width="1.6"/></g></g>`;
  }
  function ervaSVG(p) {
    const rnd = semente(81);
    let s = `<path d="M-20,662 C220,650 460,658 700,652 C940,646 1180,656 1620,648 L1620,900 L-20,900 Z" fill="url(#${p}prado)"/>`;
    // carreiro de terra batida até ao charco
    s += `<path d="M220,900 C380,858 520,820 700,800 C820,788 880,784 900,780 L1010,782 C960,800 860,826 760,850 C680,870 640,884 600,900 Z" fill="#CFA878" opacity=".55"/>`;
    // capim parado: um caminho por cor
    const cores = ['#8E9A3A', '#B8B85A', '#6E8030', '#D2C66E'], cam = cores.map(() => '');
    for (let i = 0; i < 560; i++) {
      const y = 652 + Math.pow(rnd(), .8) * 248, x = rnd() * 1640 - 20, k = .4 + (y - 650) / 250 * 1.1;
      if (Math.hypot((x - POCA.cx) / POCA.rx, (y - POCA.cy) / POCA.ry) < 1) continue;
      const h = (8 + rnd() * 10) * k, inc = (rnd() - .5) * 6 * k, c = rnd() * 4 | 0;
      cam[c] += `M${n(x)},${n(y)} q${n(inc * .4)},${n(-h * .6)} ${n(inc)},${n(-h)}`;
    }
    s += cam.map((d, i) => `<path d="${d}" stroke="${cores[i]}" stroke-width="1.7" fill="none" stroke-linecap="round" opacity=".85"/>`).join('');
    // florinhas amarelas e pedrinhas
    let fl = '', pd = '';
    for (let i = 0; i < 50; i++) {
      const y = 664 + rnd() * 226, x = rnd() * 1600, k = .5 + (y - 660) / 230, r = 3.4 * k;
      if (Math.hypot((x - POCA.cx) / (POCA.rx + 40), (y - POCA.cy) / (POCA.ry + 20)) < 1) continue;
      if (rnd() < .65) fl += `M${n(x - r)},${n(y)}a${n(r)},${n(r * .8)} 0 1,0 ${n(2 * r)},0a${n(r)},${n(r * .8)} 0 1,0 ${n(-2 * r)},0Z`;
      else pd += `M${n(x - r)},${n(y)}a${n(r)},${n(r * .6)} 0 1,0 ${n(2 * r)},0a${n(r)},${n(r * .6)} 0 1,0 ${n(-2 * r)},0Z`;
    }
    s += `<path d="${fl}" fill="#F2C832"/><path d="${pd}" fill="#B0A08A" opacity=".8"/>`;
    return s;
  }
  // faixas de capim alto que ondulam (plano do meio)
  function capimSVG() {
    const rnd = semente(31);
    let s = '';
    [[600, 628, .7], [640, 668, .9]].forEach(([y0, y1, k], i) => {
      let d = '';
      for (let j = 0; j < 150; j++) {
        const x = rnd() * 1640 - 20, y = y0 + rnd() * (y1 - y0), h = (12 + rnd() * 12) * k;
        if (x > 860 && x < 1360 && i === 1) continue;
        d += `M${n(x)},${n(y)} q${n(2 * k)},${n(-h * .6)} ${n(4 * k)},${n(-h)}`;
      }
      s += `<g class="zb-capim${i}"><path d="${d}" stroke="${i ? '#A8A040' : '#B8AE52'}" stroke-width="${n(1.6 * k)}" fill="none" stroke-linecap="round" opacity=".85"/></g>`;
    });
    return s;
  }
  function ervaFrenteSVG(i, x, y, k, flip) {
    const rnd = semente(200 + i);
    let d = '';
    for (let j = 0; j < 9; j++) {
      const a = (j - 4) * 9 + (rnd() - .5) * 8, h = (50 + rnd() * 46) * k, bx = (j - 4) * 4 * k;
      const ex = bx + Math.sin(a * RAD) * h, ey = -Math.cos(a * RAD) * h;
      d += `M${n(bx - 3 * k)},0 Q${n(bx + ex * .3)},${n(ey * .55)} ${n(ex)},${n(ey)} Q${n(bx + ex * .3 + 4 * k)},${n(ey * .5)} ${n(bx + 3 * k)},0 Z`;
    }
    return `<g class="zb-erva${i}" transform="translate(${x},${y})${flip ? ' scale(-1,1)' : ''}"><g class="zb-ervaIn"><path d="${d}" fill="${i % 2 ? '#9AA040' : '#B4AE4E'}" stroke="#5E6420" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="#E2DC90" stroke-width=".8" opacity=".55"/></g></g>`;
  }
  function avesSVG() {
    return [0, 1, 2, 3].map(i => `<path class="zb-ave${i}" d="M-9,0 Q-4,-5 0,0 Q4,-5 9,0" stroke="#3A3A44" stroke-width="2" fill="none" stroke-linecap="round"/>`).join('');
  }

  /* --- Árvore-das-salsichas (Kigelia) e charco de pó (habitat). Trás: sombra, charco, tronco, copa e frutos;
         frente: o ramo baixo com folhas e três frutos e os tufos de capim (repetidos dentro do grupo da zebra) --- */
  function frutoSVG(cls, x, y, L, k) {
    // fruto comprido pendurado num pé fino; roda à volta do ponto onde está preso
    return `<g class="zb-fruto ${cls}" transform="translate(${x},${y})"><g class="zb-frutoIn"><path d="M0,0 L0,${L}" stroke="#5A4A30" stroke-width="2"/>
      <g transform="translate(0,${L}) scale(${k})"><path d="M-9,4 C-11,20 -10,44 -6,56 C-3,62 3,62 6,56 C10,44 11,20 9,4 C6,-1 -6,-1 -9,4 Z" fill="url(#zebra-fruto)" stroke="#4A3E26" stroke-width="2"/>
        <path d="M-5,8 C-6,22 -6,38 -3,50" stroke="#D8CEA8" stroke-width="2.4" fill="none" opacity=".6" stroke-linecap="round"/>
        <path d="M-2,14 l3,1 M1,26 l3,1 M-3,36 l3,1 M2,44 l2,1" stroke="#5E5236" stroke-width="1.4" opacity=".7"/></g></g></g>`;
  }
  const FRUTOS_TRAS = [[1180, 338, 70, 1], [1240, 330, 110, .9], [1340, 352, 60, 1.05], [1420, 340, 96, .9], [1490, 366, 50, .85], [1120, 360, 54, .8], [1380, 322, 130, .95]];
  const FRUTOS_FRENTE = [[990, 442, 78, .95], [1050, 432, 116, 1.05], [1112, 428, 56, .85]];
  function copaPath(lista, seed, achatar) {
    const rnd = semente(seed);
    let copa = '', luz = '', esc = '';
    for (const [x, y, rx, ry] of lista) {
      for (let k = 0; k < 7; k++) {
        const a = rnd() * TAU, d = rnd() * .6, cx = x + Math.cos(a) * rx * d, cy = y + Math.sin(a) * ry * d, r = (.35 + rnd() * .25) * rx;
        copa += `M${n(cx - r)},${n(cy)}a${n(r)},${n(r * achatar)} 0 1,0 ${n(2 * r)},0a${n(r)},${n(r * achatar)} 0 1,0 ${n(-2 * r)},0Z`;
        if (Math.cos(a) < .2 && Math.sin(a) < .3) luz += `M${n(cx - r * .7)},${n(cy - r * .2)}a${n(r * .5)},${n(r * .22)} 0 1,0 ${n(r)},0a${n(r * .5)},${n(r * .22)} 0 1,0 ${n(-r)},0Z`;
        else esc += `M${n(cx - r * .6)},${n(cy + r * .25)}a${n(r * .6)},${n(r * .22)} 0 1,0 ${n(r * 1.2)},0a${n(r * .6)},${n(r * .22)} 0 1,0 ${n(-r * 1.2)},0Z`;
      }
    }
    return { copa, luz, esc };
  }
  function arvTrasSVG(p) {
    const rnd = semente(91);
    // charco de pó: terra vermelha seca com gretas, pedrinhas e marcas de cascos
    let gretas = '', pedras = '';
    for (let i = 0; i < 18; i++) {
      const a = rnd() * TAU, r = .2 + rnd() * .6, x = POCA.cx + Math.cos(a) * POCA.rx * r, y = POCA.cy + Math.sin(a) * POCA.ry * r;
      gretas += `M${n(x)},${n(y)} l${n(8 + rnd() * 12)},${n((rnd() - .5) * 6)} l${n(6 + rnd() * 8)},${n((rnd() - .5) * 6)}`;
    }
    for (let i = 0; i < 16; i++) { const a = rnd() * TAU, r = .3 + rnd() * .7, x = POCA.cx + Math.cos(a) * POCA.rx * r, y = POCA.cy + Math.sin(a) * POCA.ry * r * .9, q = 2 + rnd() * 3; pedras += `M${n(x - q)},${n(y)}a${n(q)},${n(q * .6)} 0 1,0 ${n(2 * q)},0a${n(q)},${n(q * .6)} 0 1,0 ${n(-2 * q)},0Z`; }
    const { copa, luz, esc } = copaPath([[1260, 250, 190, 80], [1080, 300, 110, 52], [1440, 270, 140, 64], [1200, 190, 120, 50], [1370, 190, 110, 46], [960, 352, 70, 34], [1540, 330, 80, 40]], 61, .6);
    const flores = [[1010, 410], [1150, 330], [1300, 352], [1460, 352], [1220, 300]].map(([x, y]) => `<path d="M${x},${y} c-4,6 -4,12 0,14 c4,-2 4,-8 0,-14 Z" fill="#8A1E2A" stroke="#4A0E14" stroke-width="1"/>`).join('');
    return `<g class="zb-arvTras">
      <ellipse cx="1190" cy="776" rx="360" ry="62" fill="url(#${p}sombraArv)"/>
      <ellipse cx="${POCA.cx}" cy="${POCA.cy}" rx="${POCA.rx + 26}" ry="${POCA.ry + 12}" fill="#B88A5A" opacity=".45"/>
      <ellipse cx="${POCA.cx}" cy="${POCA.cy}" rx="${POCA.rx}" ry="${POCA.ry}" fill="url(#${p}poca)"/>
      <path d="${gretas}" stroke="#9A6A42" stroke-width="1.6" fill="none" opacity=".7" stroke-linecap="round"/>
      <path d="${pedras}" fill="#A88A6A"/>
      <path d="M${POCA.cx - POCA.rx + 30},${POCA.cy - 18} C${POCA.cx - 100},${POCA.cy - 40} ${POCA.cx + 100},${POCA.cy - 42} ${POCA.cx + POCA.rx - 40},${POCA.cy - 20}" stroke="#E6BC8E" stroke-width="3" fill="none" opacity=".6"/>
      <g class="zb-poCharco" opacity="0"><ellipse cx="${POCA.cx}" cy="${POCA.cy - 6}" rx="${POCA.rx * .7}" ry="${POCA.ry * .7}" fill="#E2B88A" opacity=".5"/></g>
      <path d="M${ARV.x - 40},${ARV.y} C${ARV.x - 30},${ARV.y - 120} ${ARV.x - 36},${ARV.y - 230} ${ARV.x - 30},${ARV.y - 300} C${ARV.x - 70},${ARV.y - 340} ${ARV.x - 180},${ARV.y - 330} ${ARV.x - 260},${ARV.y - 312} L${ARV.x - 262},${ARV.y - 296} C${ARV.x - 180},${ARV.y - 304} ${ARV.x - 90},${ARV.y - 300} ${ARV.x - 52},${ARV.y - 270} C${ARV.x - 46},${ARV.y - 240} ${ARV.x - 40},${ARV.y - 120} ${ARV.x - 52},${ARV.y} Z" fill="#6E665A"/>
      <path d="M${ARV.x - 46},${ARV.y + 4} C${ARV.x - 34},${ARV.y - 90} ${ARV.x - 30},${ARV.y - 220} ${ARV.x - 22},${ARV.y - 330} C${ARV.x - 40},${ARV.y - 400} ${ARV.x - 110},${ARV.y - 450} ${ARV.x - 200},${ARV.y - 470} L${ARV.x - 192},${ARV.y - 484} C${ARV.x - 100},${ARV.y - 466} ${ARV.x - 30},${ARV.y - 430} ${ARV.x},${ARV.y - 380} C${ARV.x + 30},${ARV.y - 430} ${ARV.x + 100},${ARV.y - 470} ${ARV.x + 190},${ARV.y - 480} L${ARV.x + 196},${ARV.y - 466} C${ARV.x + 110},${ARV.y - 450} ${ARV.x + 50},${ARV.y - 400} ${ARV.x + 24},${ARV.y - 330} C${ARV.x + 30},${ARV.y - 220} ${ARV.x + 36},${ARV.y - 90} ${ARV.x + 52},${ARV.y + 4} Z" fill="url(#${p}casca)" stroke="#3E382E" stroke-width="2.5"/>
      <path d="M${ARV.x - 18},${ARV.y - 20} C${ARV.x - 14},${ARV.y - 120} ${ARV.x - 12},${ARV.y - 220} ${ARV.x - 6},${ARV.y - 320}" stroke="#C4BCAA" stroke-width="4" fill="none" opacity=".5"/>
      <path d="M${ARV.x + 10},${ARV.y - 60} c6,-10 4,-24 -2,-30 M${ARV.x - 20},${ARV.y - 180} c8,-6 10,-16 6,-24 M${ARV.x + 14},${ARV.y - 260} c-4,-8 -2,-18 4,-24" stroke="#4E463A" stroke-width="2" fill="none" opacity=".6"/>
      <path d="M${ARV.x - 52},${ARV.y + 4} C${ARV.x - 70},${ARV.y + 8} ${ARV.x - 90},${ARV.y + 10} ${ARV.x - 104},${ARV.y + 12} M${ARV.x + 52},${ARV.y + 4} C${ARV.x + 72},${ARV.y + 6} ${ARV.x + 90},${ARV.y + 10} ${ARV.x + 104},${ARV.y + 12}" stroke="#6E665A" stroke-width="7" stroke-linecap="round"/>
      <g class="zb-copa"><path d="${copa}" fill="#2A4012" transform="translate(0,8)"/><path d="${copa}" fill="url(#${p}copa)"/>
        <path d="${esc}" fill="#2E4816" opacity=".5"/><path d="${luz}" fill="#9CC060" opacity=".55"/>${flores}</g>
      ${FRUTOS_TRAS.map(([x, y, L, k], i) => frutoSVG('zb-ft' + i, x, y, L, k)).join('')}
    </g>`;
  }
  function arvFrenteSVG(p) {
    const { copa, luz } = copaPath([[1030, 428, 60, 24], [1100, 420, 54, 22], [978, 440, 34, 17]], 71, .55);
    return `<g class="zb-arvFrente">
      <path d="M1180,420 C1120,426 1060,428 1000,436 C980,439 960,442 944,446" stroke="#4E463A" stroke-width="13" fill="none" stroke-linecap="round"/>
      <path d="M1180,418 C1120,424 1060,426 1000,434 C980,437 962,440 946,443" stroke="#9A9282" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="M1040,430 C1030,418 1024,408 1026,396 M984,440 C972,434 966,426 964,414" stroke="#4E463A" stroke-width="6" fill="none" stroke-linecap="round"/>
      <g class="zb-ramoFolhas"><path d="${copa}" fill="#2A4012" transform="translate(0,6)"/><path d="${copa}" fill="url(#${p}copa)"/><path d="${luz}" fill="#9CC060" opacity=".55"/></g>
      ${FRUTOS_FRENTE.map(([x, y, L, k], i) => frutoSVG('zb-ff' + i, x, y, L, k)).join('')}
      ${ervaFrenteSVG(10, 905, 814, 1.2, false)}${ervaFrenteSVG(11, 1000, 824, 1.45, true)}${ervaFrenteSVG(12, 1125, 820, 1.3, false)}${ervaFrenteSVG(13, 1235, 814, 1.25, true)}${ervaFrenteSVG(14, 1062, 830, 1.05, false)}${ervaFrenteSVG(15, 955, 832, 1, true)}${ervaFrenteSVG(16, 1180, 830, 1.1, false)}
    </g>`;
  }

  /* --- Bichos e partículas dos acontecimentos --- */
  function bufagoSVG() {
    // búfago-de-bico-vermelho: pássaro castanho que pousa nas costas da zebra e lhe come as carraças
    return `<g class="zb-bufago" display="none"><g class="zb-bfIn">
      <g class="zb-bfPousado"><path d="M-3,0 L-4,8 M3,0 L4,8" stroke="#C8783A" stroke-width="2" stroke-linecap="round"/>
        <path d="M-16,-6 C-14,-14 -4,-18 6,-16 C12,-15 14,-10 12,-4 C8,2 -8,2 -16,-6 Z" fill="#8A6A48" stroke="#4A3420" stroke-width="1.3"/>
        <path d="M-16,-6 L-28,-2 L-26,-8 Z" fill="#6E5236"/><path d="M-10,-12 C-4,-15 2,-15 6,-12" stroke="#A88660" stroke-width="2" fill="none"/>
        <g class="zb-bfCab"><circle cx="10" cy="-18" r="6.5" fill="#8A6A48" stroke="#4A3420" stroke-width="1.3"/><circle cx="12" cy="-19" r="2.2" fill="#F2C832"/><circle cx="12.3" cy="-19" r="1.1" fill="#1A1008"/>
          <path d="M15,-19 L25,-17 L15,-15 Z" fill="#D8302A"/></g></g>
      <g class="zb-bfVoo" display="none"><path d="M-14,0 C-6,-5 6,-5 14,-1 C6,3 -6,3 -14,0 Z" fill="#8A6A48" stroke="#4A3420" stroke-width="1.2"/>
        <circle cx="16" cy="-2" r="5" fill="#8A6A48"/><path d="M20,-2 L28,-1 L20,0 Z" fill="#D8302A"/>
        <g class="zb-bfAsa"><path d="M-2,-2 C-8,-16 -22,-20 -30,-14 C-22,-8 -12,-4 -2,0 Z" fill="#6E5236" stroke="#4A3420" stroke-width="1"/></g></g>
    </g></g>`;
  }
  function moscaSVG() {
    return `<g class="zb-mosca" display="none"><g transform="scale(1.3)">
      <ellipse class="zb-asaM" cx="-3" cy="-6" rx="7" ry="3.6" fill="#E8F0F8" opacity=".7" stroke="#9AA6B2" stroke-width=".6" transform="rotate(-28)"/>
      <ellipse class="zb-asaM" cx="2" cy="-6" rx="7" ry="3.6" fill="#E8F0F8" opacity=".7" stroke="#9AA6B2" stroke-width=".6" transform="rotate(22)"/>
      <ellipse cx="0" cy="0" rx="6.5" ry="4.3" fill="#2C2A30"/><circle cx="6.5" cy="-1" r="3.6" fill="#3A3640"/><circle cx="8" cy="-2" r="1.7" fill="#B8323A"/></g></g>`;
  }
  function particulasSVG(p) {
    let s = '';
    for (let i = 0; i < 18; i++) s += `<circle class="zb-po${i}" display="none" r="22" fill="url(#${p}poeira)"/>`;
    for (let i = 0; i < 6; i++) s += `<circle class="zb-bf${i}" display="none" r="6" fill="#FFFFFF"/>`;
    return s;
  }

  /* ================= 5) Ícone do menu (retrato parado, sem gradientes nem recortes com id) ================= */
  function iconeSVG() {
    const C = COR.cont;
    const E = estadoCabeca(Object.assign({}, CAB0, { Y: -.22, F: .95, beta: 56, feliz: .2, sorriso: 1, tE: .9, tD: .7, oE: -4, oD: 6, franja: -4, olhoEsc: 1.15 }));
    const cab = cabecaSVG('zebra-', E, true);
    // pescoço com riscas e crina eriçada às riscas
    let riscas = '', crina = '', bandas = '';
    const Lp = t => [lerp(116, 80, t), lerp(104, 214, t)], Rp = t => [lerp(156, 170, t), lerp(104, 212, t)];
    for (const t of [.1, .25, .4, .55, .7, .85]) { const a = Lp(t), b = Lp(t + .07), c = Rp(t + .13), d = Rp(t + .06); riscas += `M${n(a[0])},${n(a[1])} L${n(d[0])},${n(d[1])} L${n(c[0])},${n(c[1])} L${n(b[0])},${n(b[1])} Z`; }
    for (let k = 0; k < 9; k++) { const x = 136 + k * 4.4, y = 98 + k * 12.5; crina += `${k ? 'L' : 'M'}${n(x + 8)},${n(y - 6)} L${n(x + 20)},${n(y)}`; }
    for (let k = 0; k < 9; k += 2) { const x = 136 + k * 4.4, y = 98 + k * 12.5; bandas += `M${n(x)},${n(y)} L${n(x + 22)},${n(y + 2)} L${n(x + 22)},${n(y + 9)} L${n(x)},${n(y + 8)} Z`; }
    return `<circle cx="110" cy="110" r="106" fill="#D8C870"/><path d="M4,110 A106,106 0 0 1 216,110 Z" fill="#9CCAEC"/>
      <path d="M30,118 C60,96 80,84 100,82 L124,82 C140,84 160,98 186,118 Z" fill="#A4AEC8"/><path d="M84,90 C92,84 100,82 108,82 L118,82 C126,84 132,88 136,92 C126,94 118,90 110,94 C100,90 92,94 84,90 Z" fill="#FFFFFF"/>
      <path d="M8,124 C60,114 150,118 212,122 L214,140 L6,142 Z" fill="#B8B65A"/>
      <circle cx="110" cy="110" r="106" fill="none" stroke="#B8A048" stroke-width="3"/>
      <path d="M78,214 C84,170 96,130 116,104 L156,104 C164,140 168,180 170,212 A106,106 0 0 1 78,214 Z" fill="${C}" stroke="${C}" stroke-width="7" stroke-linejoin="round"/>
      <path d="M78,214 C84,170 96,130 116,104 L156,104 C164,140 168,180 170,212 A106,106 0 0 1 78,214 Z" fill="#FAF7F0"/>
      <path d="${riscas}" fill="#2A211E"/>
      <path d="M136,98 ${crina.slice(1)} L178,206 L170,212 L150,110 Z" fill="#F1ECE2" stroke="#1E1714" stroke-width="3" stroke-linejoin="round"/>
      <path d="${bandas}" fill="#2A211E"/>
      <g transform="translate(112,78) scale(.84)">${cab}</g>`;
  }

  /* ================= 6) montar() ================= */
  // Pose de repouso (fora): de pé, a 3/4 virada para a esquerda e para nós, cabeça a olhar para a criança
  const REP = { X: 690, Z: 0, th: PI - .5 };
  const DEIT = { X: 1080, Z: -40, th: PI - .22 };    // onde se deita, no charco de pó, à sombra (cabeça para a esquerda)
  const ALT_DEIT = -110;
  const CORPO0 = { alt: 0, incl: 0, nA: 58, nC: -7, nY: 0, nTh: 0, cTurn: -.85, cB: 52, cRoll: 0, fAbre: 0, fAvanca: 0 };
  const ROSTO0 = { olhos: 1, feliz: 0, oE: 0, oD: 0, tE: 1, tD: 1, orelhas: 0, boca: 0, sobr: 0, nariz: 0, sorriso: .4, olhoEsc: 1.12 };
  const CAUDA_0 = { cauA: 0, cauAmp: 5, cauVel: .35, cauLado: 0 };
  const DEITADO = { alt: ALT_DEIT, incl: 0, nA: 46, nC: -5, nY: 0, nTh: 0, cTurn: -.4, cB: 56, cRoll: 0 };
  const TROTE = { D: 168, beta: .46, alt: 42, ordem: { tE: 0, fD: 0, tD: .5, fE: .5 } };      // pares diagonais

  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .4 : 1;
    const p = 'zebra-';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.innerHTML = `<defs>${defsZebra(p)}${defsCena(p)}</defs>
      <rect width="1600" height="640" fill="url(#${p}ceu)"/>
      <circle cx="${SOL.x}" cy="${SOL.y}" r="420" fill="url(#${p}solBrilho)"/>
      <circle cx="${SOL.x}" cy="${SOL.y}" r="46" fill="url(#${p}sol)"/>
      <g class="zb-nuvens">${nuvemSVG(0, .9)}${nuvemSVG(1, .62)}${nuvemSVG(2, .78)}${nuvemSVG(3, .5)}</g>
      ${kiliSVG(p)}
      <g class="zb-aves">${avesSVG()}</g>
      ${planiciesSVG(p)}
      <g class="zb-zebrinhas">${zebrinhaSVG(0, 250, 596, .5, false)}${zebrinhaSVG(1, 318, 604, .56, true)}${zebrinhaSVG(2, 404, 592, .46, false)}</g>
      <g class="zb-gnus">${gnuSVG('zb-gn0', 1420, 588, .5, true)}${gnuSVG('zb-gn1', 1484, 594, .55, false)}${gnuSVG('zb-gn2', 1540, 586, .45, true)}${gnuSVG('zb-gn3', 720, 590, .42, false)}</g>
      <g class="zb-manada" display="none">${Array.from({ length: 9 }, (_, i) => i % 4 === 2 ? `<g class="zb-mg${i}">${zebrinhaSVG(9 + i, 0, 0, .44, true)}</g>` : gnuSVG('zb-mg' + i, 0, 0, .46, true)).join('')}
        <g class="zb-mgPo">${[0, 1, 2, 3].map(i => `<ellipse cx="${i * 90 + 40}" cy="-6" rx="60" ry="14" fill="#E2C89A" opacity=".35"/>`).join('')}</g></g>
      ${capimSVG()}
      ${ervaSVG(p)}
      <g class="zb-habitat">
        ${arvTrasSVG(p)}
        ${zebraSVG(p)}
        ${arvFrenteSVG(p)}
      </g>
      <g class="zb-particulas">${particulasSVG(p)}</g>
      ${moscaSVG()}${bufagoSVG()}
      ${ervaFrenteSVG(0, 30, 906, 1.1, false)}${ervaFrenteSVG(1, 200, 912, .9, true)}${ervaFrenteSVG(2, 420, 908, .7, false)}${ervaFrenteSVG(3, 1340, 910, .8, true)}${ervaFrenteSVG(4, 1470, 912, 1.05, false)}${ervaFrenteSVG(5, 1590, 906, .9, true)}${ervaFrenteSVG(6, 780, 914, .5, false)}
      <rect width="1600" height="900" fill="url(#${p}luzQuente)" pointer-events="none"/>
      <rect width="1600" height="900" fill="url(#${p}vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s), qa = s => Array.from(svg.querySelectorAll(s));
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function poeT(lista, v) { for (const e of lista) poe(e, v); }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; if (v == null) el.removeAttribute(nome); else el.setAttribute(nome, v); } }

    /* --- referências --- */
    const R = {
      habitat: q('.zb-habitat'), zebra: q('.zb-zebra'), corpo: q('.zb-corpo'), rolo: q('.zb-rolo'), sombra: q('.zb-sombra'),
      tronco: q('.zb-tronco'), troncoR: q('.zb-troncoR'), peito: q('.zb-peito'), garupa: q('.zb-garupa'),
      pernasTras: q('.zb-pernasTras'), pernasFrente: q('.zb-pernasFrente'),
      cauda: q('.zb-cauda'), slotCT: q('.zb-slotCaudaT'), slotCF: q('.zb-slotCaudaF'),
      caudaC: q('.zb-caudaC'), caudaF: q('.zb-caudaF'), caudaR: q('.zb-caudaR'), caudaB: q('.zb-caudaB'), caudaM: q('.zb-caudaM'),
      frente: q('.zb-frente'), slotPT: q('.zb-slotPescT'), slotPF: q('.zb-slotPescF'),
      pc: Array.from({ length: N_PESC }, (_, i) => qa('.zb-pc' + i)), pj: Array.from({ length: N_PESC }, (_, i) => qa('.zb-pj' + i)),
      crina: Array.from({ length: N_PESC }, (_, i) => q('.zb-crina' + i)), cc: Array.from({ length: N_PESC }, (_, i) => q('.zb-cc' + i)),
      cab: q('.zb-cab'), copia: q('.zb-copia'), arvFrente: q('.zb-habitat > .zb-arvFrente'),
      poC: Array.from({ length: 6 }, (_, i) => q('.zb-poC' + i)), poCharco: q('.zb-poCharco'),
      nuvens: [0, 1, 2, 3].map(i => q('.zb-nuvem' + i)), aves: [0, 1, 2, 3].map(i => q('.zb-ave' + i)),
      capim: [0, 1].map(i => q('.zb-capim' + i)), ervas: qa('.zb-ervaIn').map(el => [el, +el.parentNode.getAttribute('class').replace(/D/g, '')]), copa: q('.zb-copa'), ramoFolhas: qa('.zb-ramoFolhas'),
      ft: FRUTOS_TRAS.map((_, i) => q('.zb-ft' + i + ' .zb-frutoIn')), ff: FRUTOS_FRENTE.map((_, i) => qa('.zb-ff' + i + ' .zb-frutoIn')),
      zbC: [0, 1, 2].map(i => q('.zb-zbC' + i)), gn: [0, 1, 2, 3].map(i => q('.zb-gn' + i + 'In')),
      manada: q('.zb-manada'), mg: Array.from({ length: 9 }, (_, i) => q('.zb-mg' + i)), mgPo: q('.zb-mgPo'),
      bufago: q('.zb-bufago'), bfIn: q('.zb-bfIn'), bfPousado: q('.zb-bfPousado'), bfVoo: q('.zb-bfVoo'), bfCab: q('.zb-bfCab'), bfAsa: q('.zb-bfAsa'),
      mosca: q('.zb-mosca'), asasM: qa('.zb-asaM'),
      po: Array.from({ length: 18 }, (_, i) => q('.zb-po' + i)), bf: Array.from({ length: 6 }, (_, i) => q('.zb-bf' + i))
    };
    const H = {};
    for (const k of ['orelhaE', 'orelhaD', 'orelhaInE', 'orelhaInD', 'olhoE', 'olhoD', 'narE', 'narD', 'bochE', 'bochD', 'sobrE', 'sobrD', 'bocaInt', 'lingua', 'dentesS', 'dentesI', 'franja', 'ganache', 'rosto', 'rostoC', 'testa', 'face', 'riscasPonte'])
      H[k] = q('.zb-' + k);
    H.ponte = [q('.zb-ponteC'), q('.zb-ponte')]; H.foc = [q('.zb-focC'), q('.zb-foc')]; H.queixo = [q('.zb-queixoC'), q('.zb-queixo')];
    H.ponteR = [q('.zb-ponteCr'), q('.zb-ponteR'), q('.zb-cPonteR')]; H.boca = q('.zb-boca');
    H.iris = [q('.zb-irisE'), q('.zb-irisD')];
    H.palp = ['E', 'D'].map(k => ({ s: q('.zb-palpS' + k), i: q('.zb-palpI' + k), c: q('.zb-cil' + k) }));
    const pernaEl = PERNAS.map(pe => ({
      g: q('.zb-' + pe.id), sup: qa(`.zb-${pe.id}-sup`), inf: qa(`.zb-${pe.id}-inf`), joe: qa(`.zb-${pe.id}-joe`), bol: qa(`.zb-${pe.id}-bol`), casco: qa(`.zb-${pe.id}-casco`),
      sombra: q('.zb-sp-' + pe.id)
    }));

    /* --- estado --- */
    const P = Object.assign({ X: REP.X, Z: REP.Z, th: REP.th, nAw: 0, cBw: 0, cTurnG: 0, cBG: 0, olharX: 0, olharY: 0, respA: 1, respF: .24,
      mastX: 0, mastY: 0, somB: 0, somR: 0, somN: 0, crinaAb: 0, pele: 0, franjaV: 0,
      rola: 0, solto: 0, pedal: 0, poCorpo: 0, deitado: 0 }, CORPO0, ROSTO0, CAUDA_0);
    let modo = 'fora', reagindo = false, tempo = 0, vivo = true, copiaVisivel = false;
    const fase = { resp: 0, cauda: 0, pedal: 0 };
    let cabMundo = [0, 0], cabY = -.5, bocaMundo = [0, 0], narMundo = [0, 0], garupaMundo = [0, 0], dorsoMundo = [0, 0], centroMundo = [0, 0];
    const pes = PERNAS.map(pe => ({ pe, x: 0, z: 0, y: 0, inc: 0 }));
    const peDe = id => pes.find(f => f.pe.id === id);
    function restPe(pe, X, Z, th) {
      const u = pe.pu + (pe.fr ? P.fAvanca : 0), v = pe.v + pe.lado * (pe.fr ? P.fAbre : 0);
      return [X + ESC * (u * Math.cos(th) - v * Math.sin(th)), Z + ESC * (u * Math.sin(th) + v * Math.cos(th))];
    }
    // cascos dobrados por baixo do corpo quando está deitada (escondidos pelos tufos de capim da frente)
    function restDeitado(pe, X = P.X, Z = P.Z, th = P.th) {
      const u = pe.fr ? pe.u - 12 : pe.u - 40, v = pe.v * 1.25, c = Math.cos(th), s = Math.sin(th);
      return [X + u * c - v * s, Z + u * s + v * c];
    }
    function assentarPes() { for (const f of pes) { const r = restPe(f.pe, P.X, P.Z, P.th); f.x = r[0]; f.z = r[1]; f.y = 0; f.inc = 0; } }
    assentarPes();

    /* --- impulsos curtos (orelhas, cauda, cabeça, crina) --- */
    const impulsos = [];
    const IMP = { twE: 0, twD: 0, flick: 0, cabR: 0, crina: 0, franja: 0, fruto: 0 };
    function impulso(chave, amp, dur, tipo) { impulsos.push({ chave, amp, dur, t: 0, tipo: tipo || 'sino' }); }
    function atualizarImpulsos(dt) {
      for (const k in IMP) IMP[k] = 0;
      for (let i = impulsos.length - 1; i >= 0; i--) {
        const m = impulsos[i]; m.t += dt;
        const u = m.t / m.dur;
        if (u >= 1) { impulsos.splice(i, 1); continue; }
        let v;
        if (m.tipo === 'onda') v = Math.sin(u * PI * 3) * (1 - u);
        else if (m.tipo === 'mola') v = Math.exp(-u * 4) * Math.sin(u * PI * 7);
        else v = Math.sin(PI * u) * (u < .3 ? 1 : 1 - (u - .3) * .4);
        IMP[m.chave] += m.amp * v;
      }
    }
    // a crina (curta) e a franja seguem a cabeça com um pequeno atraso
    const molaCrina = { x: 0, v: 0, ultimo: null };
    function atualizarCrina(dt) {
      const h = Math.min(dt, 50) / 1000;
      const vel = molaCrina.ultimo == null ? 0 : (cabMundo[0] - molaCrina.ultimo) / Math.max(h, .001);
      molaCrina.ultimo = cabMundo[0];
      molaCrina.v += (-140 * molaCrina.x - 10 * molaCrina.v - limita(vel, -900, 900) * .5) * h;
      molaCrina.x = limita(molaCrina.x + molaCrina.v * h, -16, 16);
    }

    /* --- desenhar: lê P e põe as transformações em todas as peças --- */
    let ordemPernas = '', caudaNaFrente = false, pescocoAtras = false;
    const tr = (x, y, r) => `translate(${n(x)},${n(y)}) rotate(${n(r)})`;
    const T = w => [w[0], CHAO - w[2] + KZ * w[1]];
    const Pv = v => [v[0], KZ * v[1] - v[2]];
    const pint = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    function desenhar() {
      const th = P.th, c = Math.cos(th), s = Math.sin(th);
      const resp = Math.sin(fase.resp) * P.respA;
      const altT = P.alt + resp * .9;
      // eixos do corpo: eu (para a frente), ev (para o lado), eh (para cima); inclinação e rebolar à volta do eixo comprido
      const ci = Math.cos(P.incl), si = Math.sin(P.incl), cr = Math.cos(P.rola), sr = Math.sin(P.rola);
      const eu = [c * ci, s * ci, si], ev0 = [-s, c, 0], eh0 = [-c * si, -s * si, ci];
      const ev = [ev0[0] * cr + eh0[0] * sr, ev0[1] * cr + eh0[1] * sr, ev0[2] * cr + eh0[2] * sr];
      const eh = [-ev0[0] * sr + eh0[0] * cr, -ev0[1] * sr + eh0[1] * cr, -ev0[2] * sr + eh0[2] * cr];
      const C = [P.X, P.Z, ESC * (HC + altT)];
      const W = (u, v, h) => { const hh = h - HC; return [C[0] + ESC * (u * eu[0] + v * ev[0] + hh * eh[0]), C[1] + ESC * (u * eu[1] + v * ev[1] + hh * eh[1]), C[2] + ESC * (u * eu[2] + v * ev[2] + hh * eh[2])]; };

      // tronco (perfil projetado) + tremor da pele; a rebolar, o perfil achata-se até 0,42 e vira-se ao contrário
      const c0 = T(C);
      centroMundo = c0;
      const fu = Pv(eu), fh = Pv(eh);
      let gx = -fh[0], gy = -fh[1];
      if (Math.abs(gy) < .42) gy = (eh[2] >= 0 ? 1 : -1) * .42;
      const trem = P.pele ? Math.sin(tempo * .09) * P.pele : 0;
      poe(R.tronco, `matrix(${n3(fu[0] * ESC)},${n3(fu[1] * ESC)},${n3(gx * ESC)},${n3(gy * ESC)},${n(c0[0] + trem)},${n(c0[1])})`);
      poe(R.troncoR, `scale(1,${n3(1 + .014 * resp)})`);
      atr(R.tronco, 'opacity', n3(passoS(.1, .38, Math.abs(c))));      // de frente/costas o perfil some-se (fica o peito ou a garupa)
      const wF = 1 - passoS(.3, .86, Math.abs(c));
      if (wF > .02 && s > 0) {
        const pc = T(W(112, 0, 236));
        atr(R.peito, 'display', 'inline'); atr(R.garupa, 'display', 'none');
        poe(R.peito, `translate(${n(pc[0])},${n(pc[1])}) scale(${n3(wF * ESC)},${n3(ESC * (1 + .012 * resp))})`);
      } else if (wF > .02) {
        const pg = T(W(-140, 0, 244));
        atr(R.garupa, 'display', 'inline'); atr(R.peito, 'display', 'none');
        poe(R.garupa, `translate(${n(pg[0] + trem)},${n(pg[1])}) scale(${n3(wF * ESC)},${ESC})`);
      } else { atr(R.peito, 'display', 'none'); atr(R.garupa, 'display', 'none'); }
      garupaMundo = T(W(-120, 0, 294));
      dorsoMundo = T(W(-34, 0, HC + 70));
      for (let i = 0; i < 6; i++) atr(R.poC[i], 'opacity', n3(P.poCorpo * [.7, .6, .65, .55, .6, .5][i]));

      // patas: IK no plano de cada pata (no espaço do corpo); cascos plantados no chão ou soltos (a rebolar)
      const sg = c >= 0 ? 1 : -1, hx = sg * (.55 + .45 * Math.abs(c)), sgL = sg * (eh[2] >= 0 ? 1 : -1);
      const atras = [], frente = [];
      pes.forEach((f, i) => {
        const pe = f.pe, J = W(pe.u, pe.v, pe.h);
        let A = [f.x, f.z, f.y + ESC * TORNOZELO];
        if (P.solto > .001) {
          const ph = fase.pedal + (pe.fr ? 0 : PI * .8) + (pe.lado > 0 ? 0 : PI * .5);
          const o = pe.fr ? [34 + Math.sin(ph) * 22 * P.pedal, pe.lado * 10, -104 + Math.cos(ph) * 16 * P.pedal] : [-24 + Math.sin(ph) * 22 * P.pedal, pe.lado * 10, -118 + Math.cos(ph) * 16 * P.pedal];
          const Af = [J[0] + ESC * (o[0] * eu[0] + o[1] * ev[0] + o[2] * eh[0]), J[1] + ESC * (o[0] * eu[1] + o[1] * ev[1] + o[2] * eh[1]), J[2] + ESC * (o[0] * eu[2] + o[1] * ev[2] + o[2] * eh[2])];
          A = [lerp(A[0], Af[0], P.solto), lerp(A[1], Af[1], P.solto), lerp(A[2], Af[2], P.solto)];
        }
        const Dw = [A[0] - J[0], A[1] - J[1], A[2] - J[2]];
        const du = pint(Dw, eu), dv = pint(Dw, ev), dh = pint(Dw, eh);
        const L1 = ESC * pe.L1, L2 = ESC * pe.L2;
        const d = Math.hypot(du, dh) || .01, dd = limita(d, Math.abs(L1 - L2) + 2, L1 + L2 - .4);
        const base = Math.atan2(dh, du);
        const a1 = base + pe.dobra * Math.acos(limita((L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd), -1, 1));
        const ku = L1 * Math.cos(a1), kh = L1 * Math.sin(a1), au = du * dd / d, ah = dh * dd / d;
        const fr = pe.L1 / (pe.L1 + pe.L2);
        const K = [0, 1, 2].map(j => J[j] + ku * eu[j] + dv * fr * ev[j] + kh * eh[j]);
        const An = [0, 1, 2].map(j => J[j] + au * eu[j] + dv * ev[j] + ah * eh[j]);
        const Js = T(J), Ks = T(K), As = T(An);
        const e = pernaEl[i];
        const l1 = Math.hypot(Ks[0] - Js[0], Ks[1] - Js[1]), l2 = Math.hypot(As[0] - Ks[0], As[1] - Ks[1]);
        poeT(e.sup, `${tr(Js[0], Js[1], Math.atan2(Ks[1] - Js[1], Ks[0] - Js[0]) / RAD)} scale(${n3(Math.max(.05, l1 / pe.L1))},${n3(ESC * sgL)})`);
        const ang2 = Math.atan2(As[1] - Ks[1], As[0] - Ks[0]) / RAD;
        poeT(e.inf, `${tr(Ks[0], Ks[1], ang2)} scale(${n3(Math.max(.05, l2 / pe.L2))},${n3(ESC * sgL)})`);
        poeT(e.joe, `translate(${n(Ks[0])},${n(Ks[1])}) scale(${ESC})`);
        poeT(e.bol, `translate(${n(As[0])},${n(As[1])}) scale(${ESC})`);
        const incC = lerp(f.inc * sg, ang2 - 90, P.solto);
        poeT(e.casco, `translate(${n(As[0])},${n(As[1])}) rotate(${n(incC)}) scale(${n3(ESC * hx)},${ESC})`);
        const no = pe.v * ev[1] + pe.u * eu[1] * .25 > 0;
        (no ? frente : atras).push([J[1], i]);
        const gy0 = CHAO + KZ * f.z, al = limita(f.y / 40, 0, 1);
        poe(e.sombra, `translate(${n(f.x + 6)},${n(gy0 + 2)}) scale(${n3(ESC * (1 - al * .5))})`);
        atr(e.sombra, 'opacity', n3((1 - al * .7) * (1 - P.solto) * (1 - P.deitado)));
      });
      atras.sort((a, b) => a[0] - b[0]); frente.sort((a, b) => a[0] - b[0]);
      const chave = atras.map(a => a[1]).join('') + '|' + frente.map(a => a[1]).join('');
      if (chave !== ordemPernas) {
        ordemPernas = chave;
        for (const [, i] of atras) R.pernasTras.appendChild(pernaEl[i].g);
        for (const [, i] of frente) R.pernasFrente.appendChild(pernaEl[i].g);
      }

      // pescoço e cabeça atrás do tronco quando está de costas
      const querPT = pescocoAtras ? s < -.12 : s < -.3;
      if (querPT !== pescocoAtras) { pescocoAtras = querPT; (querPT ? R.slotPT : R.slotPF).appendChild(R.frente); }

      // cauda: cadeia 3D a partir da garupa (pendurada, com onda; abana para os lados); borla escura na ponta
      const querCF = caudaNaFrente ? s < .3 : s < .2;
      if (querCF !== caudaNaFrente) { caudaNaFrente = querCF; (querCF ? R.slotCF : R.slotCT).appendChild(R.cauda); }
      atr(R.cauda, 'opacity', n3(1 - passoS(.5, .78, s)));             // de frente a cauda fica escondida atrás do corpo
      {
        let w = W(CAUDA0.u, 0, CAUDA0.h);
        const pts = [T(w)];
        const bkx = -c, bkz = -s, lvx = -s, lvz = c;
        const chao = P.deitado * 60;                                     // deitada, a cauda pousa no chão (fica mais «deitada»)
        for (let i = 0; i < NCA; i++) {
          const u = i / (NCA - 1);
          const e = (14 - P.cauA - chao * u * .9 + u * 74 + 3 * Math.sin(fase.cauda * .5 - i * .4)) * RAD;
          const lat = (P.cauAmp * Math.sin(fase.cauda - i * .55) * (.2 + .8 * u) + IMP.flick * u + P.cauLado * (.3 + .7 * u)) * RAD;
          const hc = Math.cos(e), cl = Math.cos(lat), sl = Math.sin(lat);
          w = [w[0] + LCA * ESC * hc * (bkx * cl + lvx * sl), w[1] + LCA * ESC * hc * (bkz * cl + lvz * sl), Math.max(4, w[2] - LCA * ESC * Math.sin(e))];
          pts.push(T(w));
        }
        const larg = u => u < .1 ? lerp(6.5, 5, u / .1) : u < .55 ? lerp(5, 4.2, (u - .1) / .45) : u < .8 ? lerp(4.2, 13, (u - .55) / .25) : lerp(13, 2.5, (u - .8) / .2);
        const esq = [], dir = [], m1 = [];
        let riscas = '';
        for (let i = 0; i <= NCA; i++) {
          const a = pts[Math.max(0, i - 1)], b = pts[Math.min(NCA, i + 1)];
          let nx = -(b[1] - a[1]), ny = b[0] - a[0];
          const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
          const w2 = larg(i / NCA) * ESC, pt = pts[i];
          esq.push([pt[0] + nx * w2, pt[1] + ny * w2]); dir.push([pt[0] - nx * w2, pt[1] - ny * w2]);
          if (i >= 1 && i <= 5) { const pm = [(pt[0] + a[0]) / 2, (pt[1] + a[1]) / 2]; riscas += `M${n(pm[0] + nx * w2)},${n(pm[1] + ny * w2)} L${n(pm[0] - nx * w2)},${n(pm[1] - ny * w2)}`; }
          if (i > 5) m1.push([pt[0] + nx * w2 * .3, pt[1] + ny * w2 * .3]);
        }
        const ponta = [pts[NCA][0] + (pts[NCA][0] - pts[NCA - 1][0]) * .7, pts[NCA][1] + (pts[NCA][1] - pts[NCA - 1][1]) * .7];
        const contorno = curvaPor(esq.concat([ponta], dir.slice().reverse()), true);
        atr(R.caudaC, 'd', contorno); atr(R.caudaF, 'd', contorno); atr(R.caudaR, 'd', riscas);
        atr(R.caudaB, 'd', curvaPor(esq.slice(5).concat([ponta], dir.slice(5).reverse()), true));
        atr(R.caudaM, 'd', curvaPor(m1, false));
      }

      // pescoço
      let w = W(PESC0.u, 0, PESC0.h);
      const pts = [T(w)], gam = [];
      for (let i = 0; i < N_PESC; i++) {
        const a = (P.nA + P.nAw * (1 - i / N_PESC * .5) + i * P.nC + P.somN * 8) * RAD + P.incl, g = th + P.nTh + i * P.nY;
        gam.push(g);
        const L = ESC * LS;
        w = [w[0] + L * Math.cos(a) * Math.cos(g), w[1] + L * Math.cos(a) * Math.sin(g), w[2] + L * Math.sin(a)];
        pts.push(T(w));
      }
      const onda = i => 1.5 * Math.sin(tempo * .002 - i * .8) * calma + P.crinaAb * 9 * Math.sin(tempo * .03 - i * 1.1) + molaCrina.x * (.4 + i * .15) + IMP.crina * (1 + i * .2);
      for (let i = 0; i < N_PESC; i++) {
        const A = pts[i], B = pts[i + 1], len = Math.hypot(B[0] - A[0], B[1] - A[1]) || .01;
        poeT(R.pc[i], `${tr(A[0], A[1], Math.atan2(B[1] - A[1], B[0] - A[0]) / RAD)} scale(${n3(Math.max(.08, len / LS))},${ESC})`);
        const r = (WN[i] + WN[i + 1]) / 4, cg = Math.cos(gam[i]), sgn = cg >= 0 ? 1 : -1, k = Math.max(.4, Math.min(1, Math.abs(cg) * 2.5));
        poe(R.crina[i], `translate(0,${n(-sgn * (r - 2) * k)}) scale(1,${n3(sgn * k)}) skewX(${n(onda(i))})`);
        if (i > 0) poeT(R.pj[i], `translate(${n(A[0])},${n(A[1])}) scale(${ESC})`);
        atr(R.cc[i], 'opacity', n3(passoS(.25, .7, -Math.sin(gam[i]))));
      }

      // cabeça
      const psi = th + P.nTh + (N_PESC - 1) * P.nY + P.cTurn + P.cTurnG;
      const Y = Math.cos(psi), F = Math.sin(psi);
      cabY = Y;
      const top = pts[N_PESC];
      const beta = P.cB + P.cBG + P.cBw - P.somN * 22;
      const hxm = top[0] + ESC * Y * 14, hym = top[1] - ESC * 10;
      cabMundo = [hxm, hym];
      const rot = P.cRoll + P.somR + IMP.cabR;
      poe(R.cab, `translate(${n(hxm)},${n(hym)}) scale(${ESC}) rotate(${n(rot)})`);
      const fecho = limita(1 - P.olhos * (1 - piscar), 0, 1);
      const E = estadoCabeca({ Y, F, beta, oE: P.oE + IMP.twE, oD: P.oD + IMP.twD, tE: P.tE, tD: P.tD, orelhas: P.orelhas + P.somB * 8, fecho, feliz: P.feliz, sobr: P.sobr,
        boca: Math.max(P.boca, P.somB), mastX: P.mastX, mastY: P.mastY, olharX: P.olharX, olharY: P.olharY, nariz: Math.max(P.nariz, P.somB * .8), sorriso: P.sorriso, olhoEsc: P.olhoEsc,
        franja: limita(-molaCrina.x * .8 + IMP.franja + P.crinaAb * 10 * Math.sin(tempo * .026), -20, 20) });
      for (const k of ['orelhaE', 'orelhaD', 'orelhaInE', 'orelhaInD', 'olhoE', 'olhoD', 'narE', 'narD', 'bochE', 'bochD', 'sobrE', 'sobrD', 'bocaInt', 'lingua', 'dentesS', 'dentesI', 'franja', 'ganache']) poe(H[k], E.t[k]);
      for (const k of ['olhoE', 'olhoD', 'narE', 'narD', 'bochE', 'bochD', 'sobrE', 'sobrD', 'ganache', 'lingua']) atr(H[k], 'opacity', String(E.op[k]));
      atr(H.orelhaInE, 'opacity', n3(E.op.orelhaInE * E.op.rosto)); atr(H.orelhaInD, 'opacity', n3(E.op.orelhaInD * E.op.rosto));
      atr(H.dentesS, 'opacity', String(E.op.dentes)); atr(H.dentesI, 'opacity', String(E.op.dentes));
      atr(H.rosto, 'opacity', String(E.op.rosto)); atr(H.rostoC, 'opacity', String(E.op.rosto)); atr(H.franja, 'opacity', String(E.op.rosto));
      poeT(H.ponte, E.t.ponte); poeT(H.foc, E.t.foc); poeT(H.queixo, E.t.queixo);
      for (const el of H.ponteR) atr(el, 'width', String(E.a.ponteL));
      atr(H.riscasPonte, 'd', E.d.riscasPonte); atr(H.testa, 'd', E.d.testa); atr(H.face, 'd', E.d.face);
      atr(H.boca, 'd', E.d.boca);
      atr(H.bocaInt, 'ry', String(E.a.bocaRy)); atr(H.bocaInt, 'rx', String(E.a.bocaRx));
      poeT(H.iris, E.t.iris);
      H.palp.forEach(e => { atr(e.s, 'd', E.d.palpS); atr(e.i, 'd', E.d.palpI); atr(e.c, 'd', E.d.cil); });
      const rr = rot * RAD, crr = Math.cos(rr), srr = Math.sin(rr);
      const paraMundo = (x, y) => [hxm + ESC * (x * crr - y * srr), hym + ESC * (x * srr + y * crr)];
      bocaMundo = paraMundo(E.a.bocaFrente[0], E.a.bocaFrente[1]);
      narMundo = paraMundo(E.a.narinas[0], E.a.narinas[1]);

      // sombra no chão (a luz vem da esquerda: a sombra cai um pouco para a direita); deitada, a sombra alarga
      const g0 = T([P.X, P.Z, 0]);
      poe(R.sombra, `translate(${n(g0[0] + 24)},${n(g0[1] + 4)}) scale(${n(ESC * (80 + 130 * Math.abs(c) + 40 * P.deitado))},${n(ESC * (26 + 10 * P.deitado))})`);

      // cópia da frente da árvore (ramo, frutos, capim) dentro do grupo da zebra quando ela está no habitat
      atr(R.copia, 'display', copiaVisivel ? 'inline' : 'none');
      atr(R.arvFrente, 'display', copiaVisivel ? 'none' : 'inline');
    }

    /* --- piscar, olhar, tiques --- */
    let piscar = 0;
    const pisca = { t: aleat(1500, 3500), f: -1, duplo: false };
    function atualizarPiscar(dt) {
      if (pisca.f < 0) {
        pisca.t -= dt; piscar = 0;
        if (pisca.t <= 0) { pisca.f = 0; pisca.duplo = !pisca.duplo && Math.random() < .25; }
        return;
      }
      pisca.f += dt;
      const u = pisca.f / 220;
      piscar = u < .4 ? esai(u / .4) : 1 - eseno(limita((u - .4) / .6, 0, 1));
      if (u >= 1) { piscar = 0; pisca.f = -1; pisca.t = pisca.duplo ? 120 : aleat(2000, 6000); }
    }
    const olhar = { foco: null, t: 0, ax: 0, ay: 0, rapido: false, cabeca: true };
    function atualizarOlhar(dt) {
      let ax, ay, aT = 0, aB = 0;
      if (olhar.foco) {
        const f = olhar.foco(), dx = f[0] - cabMundo[0], dy = f[1] - cabMundo[1];
        ax = limita(dx / 200, -1, 1); ay = limita(dy / 200, -1, 1);
        if (olhar.cabeca) {
          const base = P.th + P.nTh + (N_PESC - 1) * P.nY + P.cTurn;
          if (Math.sin(base) > -.2) {
            const Yd = limita(dx / 330, -.92, .92);
            aT = limita(Math.acos(Yd) - base, -1.4, 1.4);
            aB = limita(dy / 260 * 22, -24, 22);
          }
        }
      } else {
        olhar.t -= dt;
        if (olhar.t <= 0) {
          olhar.t = aleat(700, 2600);
          if (Math.random() < .45) { olhar.ax = 0; olhar.ay = 0; } else { olhar.ax = aleat(-.6, .6); olhar.ay = aleat(-.4, .3); }
        }
        ax = olhar.ax; ay = olhar.ay;
      }
      const kO = 1 - Math.exp(-dt / 60), kC = 1 - Math.exp(-dt / (olhar.rapido ? 110 : 260));
      P.olharX += (ax - P.olharX) * kO; P.olharY += (ay - P.olharY) * kO;
      P.cTurnG += (aT - P.cTurnG) * kC; P.cBG += (aB - P.cBG) * kC;
    }
    const tiques = { orelha: aleat(2000, 5000), cauda: aleat(3000, 7000) };
    function atualizarTiques(dt) {
      tiques.orelha -= dt; tiques.cauda -= dt;
      if (tiques.orelha <= 0) {
        tiques.orelha = aleat(1800, 5000);
        impulso(Math.random() < .5 ? 'twE' : 'twD', aleat(14, 26), aleat(260, 380));
      }
      if (tiques.cauda <= 0) { tiques.cauda = aleat(2500, 6500); impulso('flick', aleat(20, 34) * (Math.random() < .5 ? -1 : 1), aleat(600, 900), 'onda'); }
    }

    /* --- tarefas: geradores que avançam com o dt do relógio (uma por faixa) --- */
    const faixas = new Map();
    function lancar(nome, gen, fim) {
      if (!vivo) return;
      if (nome === 'corpo') { olhar.foco = null; olhar.rapido = false; olhar.cabeca = true; limparComportamento(); }
      faixas.set(nome, { g: gen, fim });
      avancar(nome, 0);
    }
    function avancar(nome, dt) {
      const f = faixas.get(nome); if (!f) return;
      let r;
      try { r = f.g.next(dt); } catch (e) { if (faixas.get(nome) === f) faixas.delete(nome); console.error(e); return; }
      if (r.done && faixas.get(nome) === f) { faixas.delete(nome); if (f.fim) f.fim(); }
    }
    function* espera(ms) { let t = 0; while (t < ms) t += yield; }
    function* durante(ms, f) { let t = 0; for (;;) { const u = ms > 0 ? Math.min(1, t / ms) : 1; f(u, t); if (u >= 1) return; t += yield; } }
    function* tw(alvo, ms, ease = eio) {
      const ini = {}; for (const k in alvo) ini[k] = P[k];
      yield* durante(ms, u => { const e = ease(u); for (const k in alvo) P[k] = ini[k] + (alvo[k] - ini[k]) * e; });
    }
    function* juntos(...gs) { let dt = 0; let vivas = gs; for (;;) { vivas = vivas.filter(g => !g.next(dt).done); if (!vivas.length) return; dt = yield; } }
    const sem = (o, ...ks) => { const r = Object.assign({}, o); for (const k of ks) delete r[k]; return r; };

    /* --- pés: um passo (levanta, avança em arco, pousa) e recompor os pés fora do sítio --- */
    function* passo1(f, alvo, ms, alt = 26) {
      const x0 = f.x, z0 = f.z, y0 = f.y;
      yield* durante(ms, u => {
        const e = eseno(u);
        f.x = lerp(x0, alvo[0], e); f.z = lerp(z0, alvo[1], e); f.y = lerp(y0, 0, e) + sino(u) * alt * ESC; f.inc = -sino(u) * 26;
      });
      f.y = 0; f.inc = 0;
    }
    function* recomporPes(ms = 260) {
      const fora = pes.filter(f => { const r = restPe(f.pe, P.X, P.Z, P.th); return f.y > .5 || Math.hypot(f.x - r[0], f.z - r[1]) > 3; });
      if (!fora.length) return;
      const lado = l => fora.filter(f => f.pe.lado === l);
      for (const grupo of [lado(1), lado(-1)]) {
        if (!grupo.length) continue;
        yield* juntos(...grupo.map((f, i) => (function* () { yield* espera(i * 40); yield* passo1(f, restPe(f.pe, P.X, P.Z, P.th), ms, 24); })()));
      }
    }
    function* pisarPara(ids, ms) {
      for (const id of ids) { const f = peDe(id); yield* passo1(f, restPe(f.pe, P.X, P.Z, P.th), ms, 24); }
    }

    /* --- virar no sítio: o pescoço adianta-se, o corpo roda, as patas pisam aos pares diagonais --- */
    function* virar(th1, ms) {
      const th0 = P.th;
      const thEm = u => lerp(th0, th1, eio(limita(u, 0, 1)));
      const plano = [['tE', 0, .34, .5], ['fD', .02, .36, .5], ['tD', .24, .6, .76], ['fE', .26, .62, .76], ['tE', .5, .84, 1], ['fD', .52, .86, 1], ['tD', .64, .98, 1], ['fE', .66, 1, 1]]
        .map(([id, a, b, ua]) => ({ f: peDe(id), a, b, ua, de: null, para: null, feito: false }));
      const nTh0 = P.nTh;
      yield* durante(ms, u => {
        P.th = thEm(u);
        P.nTh = nTh0 * (1 - u) + (thEm(u + .22) - P.th) * .9;
        P.alt = -5 * Math.sin(u * PI * 4) ** 2 * sino(u);
        for (const st of plano) {
          if (u < st.a || st.feito) continue;
          if (!st.de) { st.de = [st.f.x, st.f.z]; st.y0 = st.f.y; st.para = restPe(st.f.pe, P.X, P.Z, thEm(st.ua)); }
          const v = limita((u - st.a) / (st.b - st.a), 0, 1);
          st.f.x = lerp(st.de[0], st.para[0], eseno(v)); st.f.z = lerp(st.de[1], st.para[1], eseno(v)); st.f.y = lerp(st.y0, 0, eseno(v)) + sino(v) * 30 * ESC; st.f.inc = -sino(v) * 26;
          if (v >= 1) { st.feito = true; st.f.y = 0; st.f.inc = 0; }
        }
      });
      P.nTh = 0; P.alt = 0;
    }

    /* --- andar a trote em linha reta: cada casco planta-se num ponto do mundo (por distância) --- */
    function perfilAndar(u, a = .18) {
      const tot = 1 - a;
      if (u < a) return (u * u / (2 * a)) / tot;
      if (u > 1 - a) { const w = u - (1 - a); return (a / 2 + (1 - 2 * a) + w - w * w / (2 * a)) / tot; }
      return (a / 2 + (u - a)) / tot;
    }
    function pePasso(d, off, total, G) {
      const { D, beta } = G;
      const x = d / D + off, c = Math.floor(x), pp = x - c;
      const plantar = dtd => dtd <= 0 ? 0 : Math.min(dtd + beta * D / 2, total);
      if (pp < beta) return { F: plantar(D * (c - off)), alt: 0 };
      const dLo = D * (c + beta - off), dHi = D * (c + 1 - off);
      const de = plantar(D * (c - off)), para = plantar(dHi), ini = Math.max(dLo, 0);
      if (ini >= total - 2) return { F: de, alt: 0 };
      const qq = limita((d - ini) / Math.max(1, Math.min(dHi, total) - ini), 0, 1);
      return { F: lerp(de, para, eseno(qq)), alt: de === para ? 0 : Math.sin(PI * qq) };
    }
    function* andarPara(x1, z1, ms, G, pozinho) {
      const x0 = P.X, z0 = P.Z, dx = x1 - x0, dz = z1 - z0, total = Math.hypot(dx, dz) || 1, ux = dx / total, uz = dz / total;
      const base = pes.map(f => [f.x, f.z]);
      const noAr = pes.map(() => false);
      yield* durante(ms, u => {
        const d = total * perfilAndar(u);
        P.X = x0 + ux * d; P.Z = z0 + uz * d;
        const m = Math.min(suave(limita(u / .14, 0, 1)), suave(limita((1 - u) / .14, 0, 1)));
        pes.forEach((f, i) => {
          const r = pePasso(d, G.ordem[f.pe.id], total, G);
          f.x = base[i][0] + ux * r.F; f.z = base[i][1] + uz * r.F; f.y = r.alt * G.alt * ESC; f.inc = -r.alt * 34;
          const ar = r.alt > .02;
          if (noAr[i] && !ar && pozinho && Math.hypot((f.x - POCA.cx) / POCA.rx, (CHAO + KZ * f.z - POCA.cy) / POCA.ry) < 1.1) soltarPo(f.x, CHAO + KZ * f.z - 4, 1, .6, .7);
          noAr[i] = ar;
        });
        const ph = d / G.D * TAU;
        P.alt = -6 * Math.cos(2 * ph) * m;
        P.nAw = 4 * Math.sin(2 * ph + .7) * m;
        P.cBw = -3 * Math.sin(2 * ph + .2) * m;
        P.cauA = 10 * m + 4 * Math.sin(ph) * m;
        P.crinaAb = .1 * m;
      });
      P.nAw = 0; P.cBw = 0; P.cauA = 0; P.alt = 0; P.crinaAb = 0;
      const fora = pes.filter(f => { const r = restPe(f.pe, P.X, P.Z, P.th); return Math.hypot(f.x - r[0], f.z - r[1]) > 3 || f.y > .5; });
      if (fora.length) yield* juntos(...fora.map((f, i) => (function* () { yield* espera(i * 50); yield* passo1(f, restPe(f.pe, P.X, P.Z, P.th), 200, 16); })()));
    }

    /* --- deitar (joelhos da frente primeiro, depois a traseira) e levantar (traseira primeiro) --- */
    function* deitar(ms) {
      const ini = pes.map(f => [f.x, f.z]), alvo = pes.map(f => restDeitado(f.pe));
      const cau0 = P.cauA;
      yield* durante(ms, u => {
        const a = eio(limita(u / .55, 0, 1)), b = eio(limita((u - .3) / .7, 0, 1));
        P.incl = -.18 * a * (1 - b);
        P.alt = ALT_DEIT * (.45 * a + .55 * b);
        P.deitado = b;
        pes.forEach((f, i) => { const w = f.pe.fr ? a : b; f.x = lerp(ini[i][0], alvo[i][0], w); f.z = lerp(ini[i][1], alvo[i][1], w); f.y = sino(w) * 8; f.inc = 0; });
        P.cauA = lerp(cau0, 0, b);
      });
      P.incl = 0; P.deitado = 1;
      soltarPo(P.X - 60, CHAO + KZ * P.Z, 3, .8, 1.2); soltarPo(P.X + 70, CHAO + KZ * P.Z, 3, .8, 1.2);
    }
    function* levantar(ms) {
      const ini = pes.map(f => [f.x, f.z]), alt0 = P.alt;
      const alvo = pes.map(f => restPe(f.pe, P.X, P.Z, P.th));
      yield* durante(ms, u => {
        const a = eio(limita(u / .55, 0, 1)), b = eio(limita((u - .35) / .65, 0, 1));
        P.incl = .16 * a * (1 - b);
        P.alt = alt0 * (1 - .55 * a - .45 * b);
        P.deitado = 1 - a;
        pes.forEach((f, i) => { const w = f.pe.fr ? b : a; f.x = lerp(ini[i][0], alvo[i][0], w); f.z = lerp(ini[i][1], alvo[i][1], w); f.y = sino(w) * 10; f.inc = 0; });
      });
      P.incl = 0; P.alt = 0; P.deitado = 0;
      for (const f of pes) f.y = 0;
    }
    /* --- rebolar no pó: de lado → patas no ar (barriga para cima) a esfregar as costas → volta; nuvens de pó
           (o perfil passa pelo «fino» por baixo de uma nuvem de pó) --- */
    function* rebolar(ms, vezes = 1) {
      const pChao = () => [centroMundo[0], CHAO + KZ * P.Z - 4];
      yield* tw({ solto: 1, olhos: .3, feliz: .8, sorriso: 1, nA: 14, cB: 70, oE: 20, oD: 20 }, ms * .16, eio);
      for (let k = 0; k < vezes; k++) {
        let nuvem = false;
        yield* durante(ms * .3, u => {
          P.rola = PI * .92 * eio(u); P.pedal = .6 + .4 * u; P.cRoll = -34 * sino(u); P.alt = ALT_DEIT - 16 * sino(u);
          if (!nuvem && u > .3) { nuvem = true; const [x, y] = pChao(); soltarPo(x, y - 30, 7, 1.3, 1.8); }
        });
        // costas no chão: esfrega-se, patas a pedalar no ar
        yield* durante(ms * .3, (u, t) => {
          P.rola = PI * .92 + .16 * Math.sin(t * .02); P.pedal = 1;
          P.alt = ALT_DEIT - 4 * Math.abs(Math.sin(t * .02));
          if (Math.random() < .12) { const [x, y] = pChao(); soltarPo(x + aleat(-120, 120), y, 1, .9, 1); }
        });
        P.poCorpo = 1;
        nuvem = false;
        yield* durante(ms * .3, u => {
          P.rola = PI * .92 * (1 - eio(u)); P.pedal = 1 - .6 * u; P.cRoll = 30 * sino(u); P.alt = ALT_DEIT - 16 * sino(u);
          if (!nuvem && u > .55) { nuvem = true; const [x, y] = pChao(); soltarPo(x, y - 30, 7, 1.3, 1.8); }
        });
      }
      P.rola = 0; P.cRoll = 0; P.alt = ALT_DEIT;
      yield* tw({ solto: 0, pedal: 0 }, ms * .14, eio);
      atr(R.poCharco, 'opacity', '1');
    }

    /* --- partículas: pó (cascos, rebolar, sacudir) e bafo das narinas --- */
    const po = R.po.map(el => ({ el, vivo: false })), bf = R.bf.map(el => ({ el, vivo: false }));
    function soltarPo(x, y, k, forca = 1, tam = 1) {
      for (let i = 0; i < k; i++) {
        const f = po.find(o => !o.vivo); if (!f) return;
        Object.assign(f, { vivo: true, x: x + aleat(-16, 16) * tam, y: y + aleat(-4, 4), vx: aleat(-.07, .07) * forca, vy: aleat(-.06, -.015) * forca, t: 0, dur: aleat(800, 1400) * (.7 + .3 * tam), s: aleat(.6, 1.1) * tam });
        atr(f.el, 'display', 'inline');
      }
    }
    function soltarBafo(k) {
      for (let i = 0; i < k; i++) {
        const f = bf.find(o => !o.vivo); if (!f) return;
        const dir = cabY >= 0 ? 1 : -1;
        Object.assign(f, { vivo: true, x: narMundo[0] + aleat(-4, 4), y: narMundo[1] + aleat(0, 8), vx: dir * aleat(.04, .1) * (Math.abs(cabY) + .2), vy: aleat(.01, .05), t: 0, dur: aleat(600, 900) });
        atr(f.el, 'display', 'inline');
      }
    }
    function animarParticulas(dt) {
      for (const f of po) {
        if (!f.vivo) continue;
        f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy += dt * .00003; f.vx *= .995;
        const u = f.t / f.dur;
        if (u >= 1) { f.vivo = false; atr(f.el, 'display', 'none'); continue; }
        poe(f.el, `translate(${n(f.x)},${n(f.y)}) scale(${n3(f.s * (.6 + u * 1.6))})`); atr(f.el, 'opacity', n3(.9 * (1 - u) * Math.min(1, u * 8)));
      }
      for (const f of bf) {
        if (!f.vivo) continue;
        f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt;
        const u = f.t / f.dur;
        if (u >= 1) { f.vivo = false; atr(f.el, 'display', 'none'); continue; }
        poe(f.el, `translate(${n(f.x)},${n(f.y)}) scale(${n3(.4 + u * 1.3)})`); atr(f.el, 'opacity', n3(.5 * (1 - u)));
      }
      // o pó no pelo vai caindo devagar; o charco remexido assenta
      if (P.poCorpo > 0) P.poCorpo = Math.max(0, P.poCorpo - dt / 14000);
    }
    // um comportamento interrompido limpa o que criou (mosca, crina a abanar, tremor, patas no ar)
    function limparComportamento() {
      atr(R.mosca, 'display', 'none');
      P.crinaAb = 0; P.pele = 0; P.cauLado = 0; P.cauAmp = CAUDA_0.cauAmp; P.cauVel = CAUDA_0.cauVel; P.pedal = 0;
    }

    /* --- comportamentos (fora): 8 diferentes, ao acaso a cada 4–9 s, sem repetir --- */
    function* recompor(ms = 420) {
      yield* recomporPes();
      yield* tw(Object.assign({}, CORPO0, ROSTO0, { mastX: 0, mastY: 0, crinaAb: 0 }), ms);
    }
    function* mastigar(ms, forca = 1) {          // o maxilar mói (de lado e para baixo); os beiços mexem
      yield* durante(ms, (u, t) => {
        const k = forca * Math.min(1, t / 200, (ms - t) / 200);
        const f = t / 1000 * TAU * 1.9;
        P.mastX = Math.sin(f) * 4 * k; P.mastY = (1 - Math.cos(2 * f)) * 1.8 * k; P.boca = .06 * k + Math.max(0, Math.sin(2 * f)) * .1 * k;
      });
      P.mastX = 0; P.mastY = 0; P.boca = 0;
    }
    function* pastar() {                       // baixa o pescoço até ao capim, arranca tufos e mastiga
      P.fAvanca = 26;
      yield* juntos(pisarPara([P.th > PI / 2 ? 'fD' : 'fE'], 320), tw({ nA: -58, nC: 4, cB: 84, cTurn: -.1, incl: -.05, alt: -14, oE: 14, oD: 10, tE: .6, tD: .4 }, 1200, eio));
      for (let i = 0; i < 3; i++) {
        yield* tw({ boca: .3, cB: 90 }, 220);
        yield* juntos(tw({ boca: 0, cB: 82, nAw: 6 }, 180, esai), (function* () { yield* espera(120); soltarPo(bocaMundo[0], bocaMundo[1] + 6, 1, .4, .5); })());
        yield* juntos(mastigar(900), tw({ nAw: 0 }, 400));
        if (Math.random() < .5) impulso('flick', 26, 700, 'onda');
      }
      impulso(Math.random() < .5 ? 'twE' : 'twD', 22, 320);
      yield* tw(Object.assign({}, sem(CORPO0, 'fAbre', 'fAvanca'), { oE: 0, oD: 0, tE: 1, tD: 1 }), 1100, eio);
      P.fAvanca = 0;
      yield* pisarPara([P.th > PI / 2 ? 'fD' : 'fE'], 300);
    }
    function* abanarCrina() {                  // sacode o pescoço e a cabeça: a crina eriça-se, as orelhas abanam, a pele treme
      yield* tw({ nA: 50, cB: 46, olhos: .7, oE: 20, oD: 20 }, 300);
      yield* durante(1200, (u, t) => {
        const e = sino(u);
        P.crinaAb = e; P.cRoll = 16 * Math.sin(t * .03) * e; P.nAw = 5 * Math.sin(t * .03 + 1) * e; P.olhos = 1 - .9 * e;
        P.oE = 30 * Math.sin(t * .034) * e; P.oD = -30 * Math.sin(t * .034) * e; P.pele = 2.5 * e;
      });
      P.crinaAb = 0; P.pele = 0; P.nAw = 0;
      impulso('crina', 6, 900, 'mola'); impulso('franja', 12, 900, 'mola');
      if (P.poCorpo > .05) { soltarPo(centroMundo[0], centroMundo[1] - 40, 4, .8, 1.2); P.poCorpo *= .5; }
      yield* tw({ cRoll: 0, olhos: 1, oE: 0, oD: 0, nA: CORPO0.nA, cB: CORPO0.cB }, 450);
    }
    function* baterCasco() {                   // levanta a pata da frente e raspa o chão três vezes (sai pó)
      const id = P.th > PI / 2 ? 'fE' : 'fD', f = peDe(id), r0 = restPe(f.pe, P.X, P.Z, P.th);
      const fx = Math.cos(P.th), fz = Math.sin(P.th);
      yield* tw({ cB: 70, cTurn: CORPO0.cTurn + .25, oE: 10, oD: 10, tE: .6, tD: .6 }, 380);
      for (let i = 0; i < 3; i++) {
        yield* durante(240, u => { const e = esai(u); f.x = r0[0] + fx * 22 * e; f.z = r0[1] + fz * 22 * e; f.y = 44 * e; f.inc = -36 * e; P.alt = -3 * e; });
        yield* durante(200, u => { const e = eentra(u); f.x = r0[0] + fx * lerp(22, -10, e); f.z = r0[1] + fz * lerp(22, -10, e); f.y = 44 * (1 - e); f.inc = lerp(-36, 10, e); });
        soltarPo(f.x, CHAO + KZ * f.z - 2, 2, .8, .8);
        impulso('cabR', 3, 200);
        yield* durante(120, u => { f.x = r0[0] + fx * lerp(-10, -16, u); f.z = r0[1] + fz * lerp(-10, -16, u); f.y = 0; f.inc = 10 * (1 - u); });
      }
      yield* passo1(f, r0, 260, 18);
      P.alt = 0;
      yield* tw({ cB: CORPO0.cB, cTurn: CORPO0.cTurn, oE: 0, oD: 0, tE: 1, tD: 1 }, 400);
    }
    function* caudaMoscas() {                  // uma mosca pousa na garupa: a cauda dá chicotadas e a pele treme
      const ev = { x: garupaMundo[0] - 200, y: garupaMundo[1] - 140 };
      atr(R.mosca, 'display', 'inline');
      let tt = 0;
      const voar = (k, ax, ay) => { ev.x = lerp(ev.x, ax + 22 * Math.sin(tt * .013), k); ev.y = lerp(ev.y, ay + 14 * Math.cos(tt * .017), k); };
      const mosca = () => { poe(R.mosca, `translate(${n(ev.x)},${n(ev.y)}) rotate(${n(10 * Math.sin(tt * .02))})`); R.asasM.forEach(a => atr(a, 'ry', n3((.35 + .65 * Math.abs(Math.sin(tt * .9))) * 3.6))); };
      olhar.foco = () => [ev.x, ev.y];
      yield* durante(1400, (u, t) => { tt = t; voar(.05, garupaMundo[0], garupaMundo[1] - 30); mosca(); });
      for (let i = 0; i < 3; i++) {
        const lado = i % 2 ? -1 : 1;
        yield* durante(420, (u, t) => { tt += 16; voar(.06, garupaMundo[0] + lado * 30, garupaMundo[1] - 50); mosca(); P.cauLado = 70 * lado * sino(u); P.cauA = 26 * sino(u); P.pele = 3 * sino(u); });
      }
      P.cauLado = 0; P.cauA = 0; P.pele = 0;
      olhar.foco = null;
      impulso('twE', 24, 300);
      yield* durante(1400, () => { tt += 16; ev.x += 4; ev.y -= 3; mosca(); });
      atr(R.mosca, 'display', 'none');
      yield* tw({ cauA: 0 }, 200);
    }
    function* zurrar() {                       // levanta a cabeça, abre a boca três vezes («i-ha-ha»), as orelhas para trás
      yield* tw({ nA: 64, cB: 34, cTurn: CORPO0.cTurn - .2, oE: 16, oD: 16, tE: .3, tD: .3 }, 500);
      for (let i = 0; i < 3; i++) {
        yield* tw({ boca: i ? .55 : .75, nariz: .8, olhos: .55 }, 160, esai);
        yield* juntos(tw({ boca: .08, nariz: .2, olhos: 1 }, 220), durante(380, u => { P.cRoll = 6 * Math.sin(u * PI * 2) * (1 - u); }));
      }
      soltarBafo(3);
      P.cRoll = 0;
      impulso('crina', 6, 800, 'mola');
      yield* tw({ nA: CORPO0.nA, cB: CORPO0.cB, cTurn: CORPO0.cTurn, oE: 0, oD: 0, tE: 1, tD: 1, boca: 0, nariz: 0 }, 600);
    }
    const PT = { kili: [430, 320], arvore: [1250, 300], zebrinhas: [330, 580], gnus: [1480, 570], crianca: [700, 600], poca: [1090, 740], ceu: [820, 150] };
    function* rodarOrelhas() {                 // cada orelha roda para um lado (escuta) e os olhos vão atrás
      const alvos = [PT.kili, PT.arvore, PT.zebrinhas, PT.gnus].sort(() => Math.random() - .5).slice(0, 3);
      for (const a of alvos) {
        const dir = a[0] > cabMundo[0] ? 1 : -1;
        yield* tw(dir > 0 ? { tD: 1, tE: -.6, oD: -6, oE: 18 } : { tE: 1, tD: -.6, oE: -6, oD: 18 }, 280);
        olhar.foco = () => a; olhar.cabeca = Math.random() < .6;
        yield* espera(aleat(800, 1300));
        impulso(dir > 0 ? 'twD' : 'twE', 18, 260);
      }
      olhar.foco = null; olhar.cabeca = true;
      yield* tw({ tE: -.8, tD: -.8, oE: 22, oD: 22 }, 300); yield* espera(400);
      yield* tw({ tE: 1, tD: 1, oE: 0, oD: 0 }, 360);
    }
    function* sacudirCabeca() {                // abana a cabeça de um lado para o outro, depressa
      yield* tw({ cB: 44, olhos: .6 }, 200);
      yield* durante(900, (u, t) => {
        const e = sino(u);
        P.cTurn = CORPO0.cTurn + .45 * Math.sin(t * .03) * e; P.cRoll = 12 * Math.sin(t * .03 + .6) * e; P.crinaAb = .7 * e;
        P.oE = 26 * e; P.oD = 26 * e; P.olhos = 1 - .85 * e;
      });
      P.crinaAb = 0;
      impulso('franja', 16, 900, 'mola'); impulso('crina', 6, 800, 'mola');
      yield* tw({ cTurn: CORPO0.cTurn, cRoll: 0, oE: 0, oD: 0, olhos: 1, cB: CORPO0.cB }, 360);
    }
    function* olharCrianca() {                 // vira a cara para nós, inclina-a e pisca os olhos, contente
      yield* tw({ cTurn: PI / 2 - P.th + .08, cB: 62, nA: 52, olhoEsc: 1.2, orelhas: 14, tE: 1, tD: 1, sobr: .6 }, 900, eio);
      yield* tw({ cRoll: 12, sobr: 1 }, 380);
      yield* tw({ olhos: .06, feliz: .5 }, 360, eseno); yield* espera(160); yield* tw({ olhos: 1, feliz: 0 }, 400, eseno);
      yield* juntos(tw({ nariz: .7 }, 240), espera(400)); yield* tw({ nariz: 0 }, 240);
      yield* tw({ cRoll: -10 }, 520);
      impulso('twE', 20, 300); yield* espera(500);
      yield* tw({ cRoll: 0, sorriso: 1 }, 380);
      yield* espera(500);
      yield* tw(Object.assign({}, sem(CORPO0, 'fAbre', 'fAvanca'), { olhoEsc: ROSTO0.olhoEsc, orelhas: 0, sobr: 0, sorriso: ROSTO0.sorriso }), 900, eio);
    }
    const COMPORTAMENTOS = { pastar, abanarCrina, baterCasco, caudaMoscas, zurrar, rodarOrelhas, sacudirCabeca, olharCrianca };
    let ultimoComp = null;
    function* cicloFora() {
      for (;;) {
        yield* espera(aleat(4000, 9000));
        let nome; do nome = escolhe(Object.keys(COMPORTAMENTOS)); while (nome === ultimoComp);
        ultimoComp = nome;
        yield* COMPORTAMENTOS[nome]();
      }
    }

    /* --- reação ao toque (fora): orelhas espetadas, olhos contentes, levanta uma pata e sacode a cabeça --- */
    function* reacaoFora() {
      reagindo = true;
      impulso('flick', 36, 700, 'onda');
      const rosto = tw({ orelhas: 22, oE: 0, oD: 0, tE: 1, tD: 1, feliz: 1, olhos: 1, sobr: .8, sorriso: 1, boca: 0, olhoEsc: 1.2 }, 100, esai);
      const corpo = (function* () {
        if (pes.some(f => f.y > .5) || P.fAvanca > 1 || P.fAbre > 1) { P.fAbre = 0; P.fAvanca = 0; }
        yield* juntos(recomporPes(200), tw(Object.assign({}, CORPO0, { nA: CORPO0.nA + 8, cB: CORPO0.cB - 10, cTurn: CORPO0.cTurn - .2 }), 220, esai));
        const id = P.th > PI / 2 ? 'fE' : 'fD';
        yield* juntos(
          durante(900, u => { P.nAw = 8 * Math.sin(u * PI * 3) * (1 - u); P.cRoll = 10 * Math.sin(u * PI * 2) * (1 - u * .6); P.alt = -6 * sino(u * 3 % 1) * (1 - u); P.crinaAb = .5 * sino(u); }),
          (function* () { const f = peDe(id); yield* passo1(f, restPe(f.pe, P.X, P.Z, P.th), 380, 44); })()
        );
        P.nAw = 0; P.crinaAb = 0;
        impulso('franja', 14, 700, 'mola');
        yield* tw({ cRoll: 6 }, 240); yield* tw({ cRoll: 0 }, 280);
      })();
      yield* juntos(rosto, corpo);
      yield* espera(200);
      reagindo = false;
      yield* tw(Object.assign({}, ROSTO0, CORPO0), 500);
    }

    /* --- dentro: deitada à sombra; dormita, sacode moscas, pasta deitada, olha para nós, rebola outra vez --- */
    const DEIT_ROSTO = Object.assign({}, DEITADO, ROSTO0);
    function* dormitar() {
      yield* tw({ olhos: .2, nA: 30, cB: 70, orelhas: 8, oE: 14, oD: 14 }, 900, eseno);
      yield* durante(1800, (u, t) => { P.cBw = 4 * Math.sin(t * .004); P.respA = 1.6; });
      P.cBw = 0; P.respA = 1;
      impulso('twD', 26, 300);
      yield* tw({ olhos: 1, nA: DEITADO.nA, cB: DEITADO.cB, orelhas: 0, oE: 0, oD: 0 }, 300, esai);
      yield* espera(300);
    }
    function* moscaDeitada() {
      const ev = { x: cabMundo[0] - 160, y: cabMundo[1] - 120 };
      atr(R.mosca, 'display', 'inline');
      let tt = 0;
      const mosca = () => { poe(R.mosca, `translate(${n(ev.x)},${n(ev.y)}) rotate(${n(10 * Math.sin(tt * .02))})`); R.asasM.forEach(a => atr(a, 'ry', n3((.35 + .65 * Math.abs(Math.sin(tt * .9))) * 3.6))); };
      olhar.foco = () => [ev.x, ev.y]; olhar.cabeca = false;
      yield* durante(1600, (u, t) => { tt = t; ev.x = lerp(ev.x, cabMundo[0] + 40 * Math.sin(t * .006), .04); ev.y = lerp(ev.y, cabMundo[1] - 50 + 20 * Math.cos(t * .008), .04); mosca(); });
      yield* juntos(durante(700, (u, t) => { tt += 16; ev.x += 1; ev.y -= .5; mosca(); P.cRoll = 14 * Math.sin(u * PI * 3) * (1 - u); P.oE = 30 * sino(u); P.oD = -24 * sino(u); P.pele = 2 * sino(u); }),
        (function* () { impulso('flick', 40, 800, 'onda'); yield* espera(1); })());
      P.cRoll = 0; P.oE = 0; P.oD = 0; P.pele = 0;
      olhar.foco = null; olhar.cabeca = true;
      yield* durante(1200, () => { tt += 16; ev.x += 5; ev.y -= 3; mosca(); });
      atr(R.mosca, 'display', 'none');
    }
    function* pastarDeitada() {
      yield* tw({ nA: 0, nC: 2, cB: 86, cTurn: -.2, oE: 10, oD: 10, tE: .6, tD: .6 }, 900, eio);
      for (let i = 0; i < 2; i++) { yield* tw({ boca: .3, cB: 90 }, 200); yield* tw({ boca: 0, cB: 84 }, 180, esai); yield* mastigar(900); }
      yield* juntos(tw(Object.assign({}, DEITADO, { oE: 0, oD: 0, tE: 1, tD: 1 }), 800, eio), mastigar(800, .7));
    }
    function* olharDeitada() {
      yield* tw({ cTurn: PI / 2 - P.th + .1, cB: 60, nA: 50, orelhas: 12, sobr: .5, olhoEsc: 1.2 }, 700, eio);
      olhar.foco = () => PT.crianca;
      yield* tw({ cRoll: 10 }, 400);
      yield* tw({ olhos: .1, feliz: .6 }, 300, eseno); yield* tw({ olhos: 1, feliz: 0 }, 300, eseno);
      yield* espera(500);
      olhar.foco = null;
      impulso('twE', 20, 280);
      yield* tw(Object.assign({}, DEITADO, { orelhas: 0, sobr: 0, cRoll: 0, olhoEsc: ROSTO0.olhoEsc }), 700, eio);
    }
    function* rebolarOutraVez() {
      yield* rebolar(1300, 1);
      yield* tw(DEIT_ROSTO, 400);
    }
    function* cicloDentro() {
      for (;;) {
        yield* espera(aleat(900, 1800));
        const r = Math.random();
        if (r < .24) yield* dormitar();
        else if (r < .44) yield* moscaDeitada();
        else if (r < .62) yield* pastarDeitada();
        else if (r < .82) yield* olharDeitada();
        else yield* rebolarOutraVez();
        yield* tw(DEITADO, 300);
      }
    }
    function* reacaoDentro() {                 // deitada: levanta a cabeça, orelhas para cima, olhos contentes, abana-se no pó
      impulso('flick', 34, 700, 'onda');
      P.solto = 0; P.pedal = 0;
      yield* tw({ rola: 0, orelhas: 20, tE: 1, tD: 1, feliz: .8, olhos: 1, sobr: .8, boca: 0, olhoEsc: 1.2 }, 100, esai);
      yield* tw(Object.assign({}, DEITADO, { nA: 56, cB: 50, cTurn: PI / 2 - P.th + .1, orelhas: 20 }), 300, esai);
      olhar.foco = () => PT.crianca;
      yield* durante(800, u => { P.cRoll = 9 * Math.sin(u * PI * 2) * (1 - u * .5); P.nAw = 5 * Math.sin(u * PI * 3) * (1 - u); P.rola = .1 * Math.sin(u * PI * 4) * (1 - u); P.crinaAb = .4 * sino(u); });
      P.nAw = 0; P.crinaAb = 0; P.rola = 0;
      soltarPo(centroMundo[0] - 60, CHAO + KZ * P.Z - 4, 2, .7, .9);
      yield* tw({ olhos: .1, feliz: .9, nariz: .6 }, 300, eseno); soltarBafo(2); yield* tw({ olhos: 1, feliz: .3, nariz: 0 }, 300, eseno);
      olhar.foco = null;
      yield* tw(Object.assign({}, DEIT_ROSTO, { feliz: 0, sobr: 0, cRoll: 0 }), 600, eio);
    }

    /* --- ida ao charco: vira-se, vai a trote, vira-se para nós, deita-se, rebola-se no pó e fica deitada à sombra --- */
    function* ida() {
      modo = 'indo'; reagindo = false;
      if (P.fAbre > 1 || P.fAvanca > 1) { P.fAbre = 0; P.fAvanca = 0; }
      olhar.foco = () => PT.poca; olhar.rapido = true;
      yield* juntos(recomporPes(140), tw(Object.assign({}, ROSTO0, sem(CORPO0, 'cTurn', 'fAbre', 'fAvanca'), { orelhas: 12 }), 140, esai));
      const thA = Math.atan2(DEIT.Z - P.Z, DEIT.X - P.X);
      yield* juntos(virar(thA, 360), tw({ cTurn: 0, nA: 52 }, 360));
      olhar.rapido = false; olhar.foco = null;
      yield* juntos(andarPara(DEIT.X, DEIT.Z, 680, TROTE, true), tw({ nA: 48, cB: 52 }, 680));
      copiaVisivel = true;
      yield* juntos(virar(DEIT.th, 400), tw({ nA: 40, cB: 66, cTurn: 0 }, 400));
      yield* juntos(deitar(480), tw(Object.assign({}, DEITADO, { nA: 30, cB: 66, cTurn: 0, olhos: .8 }), 480));
      yield* rebolar(1150, 1);
      yield* tw(Object.assign({}, DEIT_ROSTO, { orelhas: 12, feliz: .4 }), 260, esai);
      impulso('crina', 6, 700, 'mola'); impulso('franja', 12, 700, 'mola'); impulso('fruto', 1, 1200, 'mola');
      modo = 'dentro';
      yield* tw({ feliz: 0, orelhas: 0 }, 300);
    }
    /* --- volta: levanta-se (traseira primeiro), sacode o pó, volta a trote e vira-se --- */
    function* volta() {
      modo = 'voltando'; reagindo = false;
      P.solto = 0; P.pedal = 0; P.rola = 0;
      yield* juntos(levantar(560), tw(Object.assign({}, ROSTO0, sem(CORPO0, 'alt', 'incl', 'fAbre', 'fAvanca'), { cTurn: -.2 }), 560));
      // sacode-se: a pele treme, a crina eriça, o pó sai em nuvem
      yield* durante(460, u => {
        P.pele = 4 * sino(u); P.crinaAb = .9 * sino(u); P.cRoll = 12 * Math.sin(u * PI * 4) * sino(u); P.oE = 24 * sino(u); P.oD = 24 * sino(u);
        if (Math.random() < .35) soltarPo(centroMundo[0] + aleat(-150, 150), centroMundo[1] + aleat(-80, 20), 1, 1, 1.1);
      });
      P.pele = 0; P.crinaAb = 0; P.cRoll = 0; P.oE = 0; P.oD = 0; P.poCorpo = 0;
      copiaVisivel = false;
      atr(R.poCharco, 'opacity', '0');
      yield* juntos(andarPara(REP.X, REP.Z, 720, TROTE, true), tw({ cTurn: -.3 }, 720));
      yield* juntos(virar(REP.th, 340), tw(Object.assign({}, CORPO0, ROSTO0), 360));
      impulso('franja', 14, 700, 'mola');
      modo = 'fora';
    }

    /* --- som: o «ladrar» da zebra — levanta a cabeça, abre a boca por sílaba e mostra os dentes --- */
    function* somBoca(ms, silabas) {
      let lista = Array.isArray(silabas) && silabas.length ? silabas : null;
      if (!lista) { const k = Math.max(2, Math.round(ms / 380)), d = ms / 1000 / k; lista = Array.from({ length: k }, (_, i) => [i * d, d * .7]); }
      const fim = Math.max(...lista.map(([a, d]) => a + Math.max(d, .14))) * 1000;
      impulso('crina', 5, 600, 'mola');
      yield* durante(fim + 320, (u, t) => {
        const ts = t / 1000;
        P.somN = t < 180 ? esai(t / 180) : t > fim ? 1 - eseno(limita((t - fim) / 320, 0, 1)) : 1;
        let b = 0, r = 0;
        lista.forEach(([a, d], k) => {
          const v = (ts - a) / Math.max(d, .14);
          if (v < 0 || v > 1) return;
          const ab = v < .15 ? esai(v / .15) : v > .8 ? 1 - eseno((v - .8) / .2) : 1;
          b = Math.max(b, (k ? .8 : 1) * ab);
          r += (k % 2 ? -1 : 1) * 6 * Math.sin(v * PI);
        });
        P.somB = b; P.somR = r;
      });
      P.somB = 0; P.somR = 0; P.somN = 0;
      soltarBafo(2);
    }

    /* --- cenário vivo e acontecimentos raros --- */
    function animarCena(dt) {
      const t = tempo / 1000;
      R.nuvens.forEach((g, i) => {
        const v = [6, 4, 5, 3][i], y = [110, 200, 250, 160][i], x0 = [300, 900, 1300, 640][i];
        const x = -260 + ((x0 + 260 + t * v * calma) % 2120);
        poe(g, `translate(${n(x)},${y})`);
      });
      R.aves.forEach((g, i) => {
        const a = t * (.4 + i * .06) * calma + i * 1.7;
        poe(g, `translate(${n(760 + Math.cos(a) * (260 + i * 30))},${n(300 + Math.sin(a * 1.3) * 30 + i * 12)}) scale(${n3(.8 + .2 * Math.sin(t * 3 + i))},${n3(.6 + .5 * Math.abs(Math.sin(t * 7 + i)))})`);
      });
      const rajada = .6 + .4 * Math.sin(t * .3);
      R.capim.forEach((g, i) => { const yb = [628, 668][i]; poe(g, `translate(0,${yb}) skewX(${n3((3 * Math.sin(t * .9 - i * .7) + 1.5 * Math.sin(t * 2.1 + i)) * rajada * calma)}) translate(0,${-yb})`); });
      R.ervas.forEach(([g, i]) => poe(g, `rotate(${n3((2.4 * Math.sin(t * 1.1 + i * .9) + 1.4 * Math.sin(t * 2.3 + i * 2)) * rajada * calma)})`));
      poe(R.copa, `rotate(${n3((.4 * Math.sin(t * .7) + .2 * Math.sin(t * 1.5)) * calma)},1290,420)`);
      poeT(R.ramoFolhas, `rotate(${n3((.8 * Math.sin(t * .8 + 1) + .4 * Math.sin(t * 1.7)) * calma)},1180,420)`);
      R.ft.forEach((g, i) => poe(g, `rotate(${n3((3 * Math.sin(t * .9 + i * 1.3) + 1.5 * Math.sin(t * 1.9 + i)) * rajada * calma)})`));
      R.ff.forEach((l, i) => poeT(l, `rotate(${n3((3 * Math.sin(t * .85 + i * 1.7) + 1.5 * Math.sin(t * 2 + i)) * rajada * calma + IMP.fruto * 8 * (i % 2 ? -1 : 1))})`));
      // zebras ao longe a pastar (a cabeça desce e sobe) e gnus a mexer-se devagar
      R.zbC.forEach((g, i) => { const k = Math.max(0, Math.sin(t * .5 + i * 2.1)); poe(g, `rotate(${n(-34 * passoS(.2, .6, k))},22,-32)`); });
      R.gn.forEach((g, i) => poe(g, `translate(${n(8 * Math.sin(t * .12 + i * 1.9))},0) rotate(${n(4 * Math.max(0, Math.sin(t * .6 + i)))},22,-10)`));
    }
    const eventos = { prox: aleat(9000, 15000), ultimo: null };
    function iniciarEvento(tipo) {
      if (tipo === 'bufago' && (modo !== 'fora' || reagindo)) tipo = 'manada';
      const ev = { tipo, x: -100, y: -100, vivo: true };
      ev.pos = () => [ev.x, ev.y];
      const gen = { bufago: evBufago, manada: evManada }[tipo](ev);
      lancar('evento', gen, () => { ev.vivo = false; limparEvento(); });
      if (modo === 'fora' && !reagindo) lancar('corpo', observar(ev), () => lancar('corpo', cicloFora()));
      else if (modo === 'dentro') { impulso('twE', 22, 400); impulso('twD', 18, 400); }
    }
    function limparEvento() {
      atr(R.bufago, 'display', 'none'); atr(R.manada, 'display', 'none');
    }
    function atualizarEventos(dt) {
      if (faixas.has('evento')) return;
      eventos.prox -= dt;
      if (eventos.prox > 0) return;
      eventos.prox = aleat(15000, 40000);
      if (modo !== 'fora' && modo !== 'dentro') { eventos.prox = 3000; return; }
      const lista = modo === 'fora' ? ['bufago', 'manada'] : ['manada'];
      let tipo; do tipo = escolhe(lista); while (lista.length > 1 && tipo === eventos.ultimo && Math.random() < .7);
      eventos.ultimo = tipo;
      iniciarEvento(tipo);
    }
    function* observar(ev) {
      reagindo = false;
      yield* recompor(380);
      olhar.foco = ev.pos;
      yield* tw({ orelhas: 14, tE: 1, tD: 1, olhoEsc: 1.18 }, 260, esai);
      let t = 0, prox = 900;
      while (ev.vivo && t < 16000) {
        t += yield;
        if (t > prox) {
          prox = t + aleat(1000, 1900);
          if (Math.random() < .5) impulso('flick', 26, 700, 'onda');
          impulso(Math.random() < .5 ? 'twE' : 'twD', 18, 280);
          if (ev.tipo === 'bufago' && ev.pousado && Math.random() < .5) { P.pele = 0; impulso('cabR', 4, 300); }
        }
        P.pele = ev.tipo === 'bufago' && ev.pousado ? 1.2 * Math.max(0, Math.sin(t * .004)) : 0;
      }
      P.pele = 0;
      olhar.foco = null;
      yield* tw({ orelhas: 0, olhoEsc: ROSTO0.olhoEsc, olhos: 1 }, 500);
    }
    function* evBufago(ev) {                   // um búfago chega a voar, pousa no dorso da zebra, bica as carraças e vai-se embora
      atr(R.bufago, 'display', 'inline');
      atr(R.bfPousado, 'display', 'none'); atr(R.bfVoo, 'display', 'inline');
      const dir = () => (Math.cos(P.th) >= 0 ? 1 : -1);
      const p0 = [-60, 180], p1 = [dorsoMundo[0] - 260, dorsoMundo[1] - 200];
      yield* durante(2200, (u, t) => {
        const alvo = [dorsoMundo[0], dorsoMundo[1] - 4];
        const [x, y] = catmull([p0, p1, [alvo[0] - 80, alvo[1] - 70], alvo], eseno(u));
        ev.x = x; ev.y = y;
        poe(R.bufago, `translate(${n(x)},${n(y)}) scale(${n3(.95 * (x < alvo[0] ? 1 : -1))},.95)`);
        poe(R.bfAsa, `scale(1,${n3(.25 + .75 * Math.abs(Math.sin(t * .03)))})`);
      });
      atr(R.bfVoo, 'display', 'none'); atr(R.bfPousado, 'display', 'inline');
      ev.pousado = true;
      impulso('twE', 20, 300);
      // fica pousado enquanto a zebra estiver fora e quieta; se ela reage ou vai ao charco, o búfago assusta-se e voa
      for (let t = 0; t < 5200 && modo === 'fora' && !reagindo; t += yield) {
        ev.x = dorsoMundo[0]; ev.y = dorsoMundo[1] - 4;
        poe(R.bufago, `translate(${n(ev.x)},${n(ev.y)}) scale(${n3(.95 * -dir())},.95)`);
        const bica = Math.max(0, Math.sin(t * .012)) ** 3 * (Math.sin(t * .0021) > -.3 ? 1 : 0);
        poe(R.bfCab, `rotate(${n(46 * bica)},8,-12)`);
      }
      ev.pousado = false;
      atr(R.bfPousado, 'display', 'none'); atr(R.bfVoo, 'display', 'inline');
      const q0 = [ev.x, ev.y];
      yield* durante(2000, (u, t) => {
        ev.x = q0[0] + 900 * eentra(u) + 60 * u; ev.y = q0[1] - 380 * esai(u);
        poe(R.bufago, `translate(${n(ev.x)},${n(ev.y)}) scale(.95,.95)`);
        poe(R.bfAsa, `scale(1,${n3(.25 + .75 * Math.abs(Math.sin(t * .03)))})`);
      });
      atr(R.bufago, 'display', 'none');
    }
    function* evManada(ev) {                   // uma manada de gnus (e duas zebras) atravessa a planície ao longe, a levantar pó
      atr(R.manada, 'display', 'inline');
      const pos = R.mg.map((_, i) => [i * 54 + (i % 3) * 14, (i % 2) * 8 - (i % 3) * 4]);
      const pernas = R.mg.map(g => Array.from(g.querySelectorAll('.zb-gnuPT, .zb-gnuPF')));
      yield* durante(17000, (u, t) => {
        const x0 = 1700 - 2200 * u;
        ev.x = x0 + 200; ev.y = 586;
        R.mg.forEach((g, i) => {
          const bob = Math.abs(Math.sin(t * .012 + i)) * 3;
          poe(g, `translate(${n(x0 + pos[i][0])},${n(584 + pos[i][1] - bob)})`);
          pernas[i].forEach((pg, k) => poe(pg, `rotate(${n(18 * Math.sin(t * .012 + i + k * PI))},${k ? 15 : -13},-14)`));
        });
        poe(R.mgPo, `translate(${n(x0 + 40)},${n(588)})`);
        atr(R.mgPo, 'opacity', n3(.6 + .3 * Math.sin(t * .003)));
      });
      atr(R.manada, 'display', 'none');
    }

    /* --- relógio único --- */
    let erroMostrado = false;
    function passo(dt) {
      if (!vivo) return;
      try {
        dt = Math.min(dt, 50);
        tempo += dt;
        fase.resp += dt / 1000 * TAU * P.respF;
        fase.cauda += dt / 1000 * TAU * P.cauVel;
        fase.pedal += dt / 1000 * TAU * 2.4 * P.pedal;
        atualizarImpulsos(dt);
        atualizarPiscar(dt);
        atualizarTiques(dt);
        for (const nome of Array.from(faixas.keys())) avancar(nome, dt);
        atualizarOlhar(dt);
        atualizarCrina(dt);
        atualizarEventos(dt);
        animarCena(dt);
        animarParticulas(dt);
        desenhar();
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    lancar('corpo', cicloFora());
    desenhar();

    return {
      animal: R.zebra,
      habitat: R.habitat,
      reagir() {
        if (!vivo) return;
        if (modo === 'fora') lancar('corpo', reacaoFora(), () => { reagindo = false; lancar('corpo', cicloFora()); });
        else if (modo === 'dentro') lancar('corpo', reacaoDentro(), () => lancar('corpo', cicloDentro()));
        else { impulso('twE', 14, 300); impulso('twD', 14, 300); }
      },
      fazerSom(ms, silabas) {
        if (!vivo) return;
        lancar('boca', somBoca(limita(ms || 1200, 300, 3000), silabas));
        impulso('flick', 24, 600, 'onda');
      },
      irAoHabitat() {
        return new Promise(res => {
          if (!vivo || modo !== 'fora') { res(); return; }
          lancar('corpo', ida(), () => { res(); lancar('corpo', cicloDentro()); });
        });
      },
      voltar() {
        return new Promise(res => {
          if (!vivo || modo !== 'dentro') { res(); return; }
          lancar('corpo', volta(), () => { res(); lancar('corpo', cicloFora()); });
        });
      },
      destruir() {
        vivo = false;
        faixas.clear();
        impulsos.length = 0;
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola (modo de desenvolvimento)
      _teste: { P, pes, modo: () => modo, evento: iniciarEvento, comportamento: nome => lancar('corpo', ({ ...COMPORTAMENTOS, dormitar, moscaDeitada, pastarDeitada, olharDeitada, rebolarOutraVez })[nome](), () => lancar('corpo', modo === 'dentro' ? cicloDentro() : cicloFora())),
        semEventos() { eventos.prox = 1e12; faixas.delete('evento'); limparEvento(); }, desenhar, cab: () => cabMundo, boca: () => bocaMundo, dorso: () => dorsoMundo }
    };
  }

  return { icone: iconeSVG(), montar };
})();