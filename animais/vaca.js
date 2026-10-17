/* Vaca — «Os Meus Animais». Contrato e regras: REGRAS-ANIMAIS.md.
   Cena: um lameiro de montanha do Norte / dos Açores numa manhã fresca (sol de cima à esquerda): prado muito verde,
   muros de pedra solta, sebes de hortênsias azuis e lilases, colinas em socalcos com criptomérias, uma casinha caiada
   com fumo na chaminé, a serra azulada com nevoeiro leve e um riacho que desce em curva até ao primeiro plano.
   Habitat: o curral de pedra (granito) com telhado de colmo, a porta larga com ombreiras e verga de pedra, uma cancela
   de madeira e feno no chão. A vaca vai a passo calmo (4 tempos, cascos presos ao chão), vira-se para a porta, a cancela
   abre, entra (camadas: interior → vaca → feno da frente e cancela; as ombreiras ficam de fora pelo recorte), vira-se lá
   dentro, a cancela fecha e baloiça, deita-se no feno (primeiro os joelhos da frente, depois a traseira) e rumina.
   A vaca é um boneco «2,5D» (como o cavalo): tronco de perfil projetado com as malhas recortadas, peito e garupa vistos
   de frente e de costas, pescoço de 3 segmentos com a barbela e o chocalho (com molas), úbere com mola, 4 patas com IK,
   cauda de 10 pontos com tufo, cabeça vista de frente cujas feições deslizam com o rumo da cabeça.
   Organização: 1) utilidades  2) medidas  3) desenho da vaca  4) cenário e curral  5) ícone
                6) montar(): estado, desenho por quadro, tarefas, andar a passo, comportamentos, idas e voltas */
'use strict';
MODULOS.vaca = (() => {
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
  const elipse = (cx, cy, rx, ry) => `M${n(cx - rx)},${n(cy)}a${n(rx)},${n(ry)} 0 1,0 ${n(2 * rx)},0a${n(rx)},${n(ry)} 0 1,0 ${n(-2 * rx)},0Z`;
  function rr(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    return `M${n(x + r)},${n(y)}H${n(x + w - r)}Q${n(x + w)},${n(y)} ${n(x + w)},${n(y + r)}V${n(y + h - r)}Q${n(x + w)},${n(y + h)} ${n(x + w - r)},${n(y + h)}H${n(x + r)}Q${n(x)},${n(y + h)} ${n(x)},${n(y + h - r)}V${n(y + r)}Q${n(x)},${n(y)} ${n(x + r)},${n(y)}Z`;
  }

  /* ================= 2) Medidas da vaca (unidades da vaca = pixels do SVG) ================= */
  const ESC = 1;
  const KZ = .16;                 // quanto a profundidade (z) desce no ecrã: vista ligeiramente de cima
  const CHAO = 780;               // y do chão à profundidade 0
  const HC = 205;                 // altura do centro do tronco
  const N_PESC = 3, LS = 40;      // pescoço curto e grosso: segmentos e comprimento de cada um
  const WN = [126, 114, 102, 92];
  const PESC0 = { u: 138, h: 232 };
  const CAUDA0 = { u: -168, h: 274 };
  const NCA = 10, LCA = 16;       // cauda: pontos e distância entre eles
  const TORNOZELO = 24;           // altura do boleto (o casco fica por baixo)
  // patas: lado 1 = esquerda (virada para nós quando a vaca olha para a direita); dobra 1 = joelho para a frente
  const PERNAS = [
    { id: 'tE', fr: 0, lado: 1, u: -120, v: 30, h: 188, L1: 90, L2: 78, pu: -120, dobra: -1 },
    { id: 'fE', fr: 1, lado: 1, u: 112, v: 30, h: 168, L1: 76, L2: 72, pu: 114, dobra: 1 },
    { id: 'tD', fr: 0, lado: -1, u: -120, v: -30, h: 188, L1: 90, L2: 78, pu: -120, dobra: -1 },
    { id: 'fD', fr: 1, lado: -1, u: 112, v: -30, h: 168, L1: 76, L2: 72, pu: 114, dobra: 1 }
  ];
  const COR = { cont: '#3B2B24', malha: '#2B2422', boca: '#7A2E3A' };

  /* ================= 3) Desenho da vaca ================= */
  // tronco de perfil (local: u para a frente, y para baixo, origem no centro do tronco a HC de altura)
  const TRONCO = 'M-176,-34 C-180,-66 -162,-88 -132,-87 C-110,-86 -100,-78 -78,-78 C-30,-78 30,-80 80,-78 C118,-77 144,-74 160,-58 C178,-40 182,-4 174,26 C166,58 140,78 102,82 C52,87 -10,90 -60,86 C-110,82 -150,70 -166,42 C-176,22 -176,-6 -176,-34 Z';
  const MALHAS = 'M36,-92 C70,-98 112,-86 124,-60 C136,-30 116,-4 86,-2 C60,0 42,-18 32,-40 C24,-60 16,-86 36,-92 Z ' +
    'M-74,-94 C-40,-98 2,-94 12,-70 C22,-48 6,-18 -26,-12 C-58,-6 -82,-26 -86,-52 C-90,-72 -90,-90 -74,-94 Z ' +
    'M-196,-64 C-172,-74 -140,-66 -130,-40 C-120,-14 -134,16 -158,22 C-178,26 -194,8 -198,-20 Z ' +
    'M-30,62 C-8,48 26,50 38,66 C48,82 28,98 -2,98 C-28,98 -42,78 -30,62 Z ' +
    'M98,24 C108,16 124,18 128,28 C132,40 120,48 108,46 C96,44 90,32 98,24 Z';
  function defsVaca(p) {
    return `
    <radialGradient id="${p}pelo" cx=".36" cy=".26" r=".9"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F3EFE8"/><stop offset="1" stop-color="#D6CEC2"/></radialGradient>
    <linearGradient id="${p}luzV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".22"/><stop offset=".3" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".62" stop-color="#3A2A22" stop-opacity="0"/><stop offset="1" stop-color="#3A2A22" stop-opacity=".26"/></linearGradient>
    <linearGradient id="${p}pesc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#F3EEE7"/><stop offset="1" stop-color="#DCD4C8"/></linearGradient>
    <linearGradient id="${p}perna" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#EEE8DF"/><stop offset="1" stop-color="#D2C9BC"/></linearGradient>
    <radialGradient id="${p}joelho" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E0D8CD"/></radialGradient>
    <linearGradient id="${p}casco" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6E5E56"/><stop offset=".6" stop-color="#40342E"/><stop offset="1" stop-color="#29201C"/></linearGradient>
    <radialGradient id="${p}cab" gradientUnits="userSpaceOnUse" cx="-18" cy="-24" r="86"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F3EFE8"/><stop offset="1" stop-color="#D8D0C4"/></radialGradient>
    <linearGradient id="${p}ponte" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#ECE6DD"/></linearGradient>
    <radialGradient id="${p}foc" cx=".42" cy=".3" r=".85"><stop offset="0" stop-color="#FDD8D8"/><stop offset=".6" stop-color="#F3AAB1"/><stop offset="1" stop-color="#D8848E"/></radialGradient>
    <radialGradient id="${p}iris" cx=".42" cy=".36" r=".66"><stop offset="0" stop-color="#7E4E2C"/><stop offset=".45" stop-color="#3E2214"/><stop offset="1" stop-color="#120804"/></radialGradient>
    <linearGradient id="${p}corno" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FBF4E0"/><stop offset=".6" stop-color="#E8D6AC"/><stop offset="1" stop-color="#B49464"/></linearGradient>
    <linearGradient id="${p}orelhaIn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E48C98"/><stop offset="1" stop-color="#F8C2C8"/></linearGradient>
    <radialGradient id="${p}ubere" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#FDCDD2"/><stop offset=".6" stop-color="#F0A4AE"/><stop offset="1" stop-color="#CF7E8A"/></radialGradient>
    <linearGradient id="${p}sino" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F6D06A"/><stop offset=".45" stop-color="#CC962E"/><stop offset="1" stop-color="#7E561A"/></linearGradient>
    <radialGradient id="${p}sombra"><stop offset="0" stop-color="#1E3A10" stop-opacity=".44"/><stop offset=".6" stop-color="#1E3A10" stop-opacity=".2"/><stop offset="1" stop-color="#1E3A10" stop-opacity="0"/></radialGradient>
    <clipPath id="${p}olho"><ellipse rx="14" ry="16.5"/></clipPath>
    <clipPath id="${p}cranio"><ellipse rx="49" ry="43"/></clipPath>
    <clipPath id="${p}troncoClip"><path d="${TRONCO}"/></clipPath>
    <clipPath id="${p}peitoClip"><ellipse rx="70" ry="80"/></clipPath>
    <clipPath id="${p}garupaClip"><ellipse rx="76" ry="82"/></clipPath>`;
  }
  function troncoSVG(p) {
    return `<g class="vc-troncoR">
      <path d="${TRONCO}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="8" stroke-linejoin="round"/>
      <path d="${TRONCO}" fill="url(#${p}pelo)"/>
      <g clip-path="url(#${p}troncoClip)"><path d="${MALHAS}" fill="${COR.malha}"/>
        <path d="M44,-80 C70,-84 100,-76 110,-60 M-66,-82 C-40,-86 -10,-82 0,-68 M-184,-50 C-166,-58 -146,-52 -140,-38" stroke="#6A5E58" stroke-width="5" fill="none" opacity=".55" stroke-linecap="round"/></g>
      <path d="${TRONCO}" fill="url(#${p}luzV)"/>
      <path d="M-150,-72 C-124,-82 -98,-72 -70,-72 C-20,-72 40,-74 90,-72 C118,-70 140,-64 152,-52" stroke="#FFFFFF" stroke-width="6" fill="none" opacity=".45" stroke-linecap="round"/>
      <path d="M-132,-84 C-128,-70 -126,-60 -130,-48" stroke="#8A7E72" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>
      <path d="M100,-50 C120,-24 124,12 108,50" stroke="#8A7E72" stroke-width="3.5" fill="none" opacity=".3" stroke-linecap="round"/>
      <path d="M-50,70 C0,78 50,78 90,70" stroke="#8A7E72" stroke-width="4" fill="none" opacity=".3" stroke-linecap="round"/>
      <path d="M20,-20 C24,0 22,20 18,40 M40,-16 C44,4 42,24 38,42 M0,-14 C4,6 2,26 -2,44" stroke="#8A7E72" stroke-width="2.4" fill="none" opacity=".16" stroke-linecap="round"/>
    </g>`;
  }
  // peito visto de frente (a meio das viragens, quando está virada para nós) e garupa vista de trás
  function peitoSVG(p) {
    return `<ellipse rx="70" ry="80" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="8"/>
      <ellipse rx="70" ry="80" fill="url(#${p}pelo)"/>
      <g clip-path="url(#${p}peitoClip)"><path d="M-84,-50 C-62,-78 -18,-76 -8,-44 C2,-12 -28,10 -58,6 C-80,2 -96,-24 -84,-50 Z M40,40 C56,30 76,36 80,52 C82,70 62,80 48,72 C34,64 30,48 40,40 Z" fill="${COR.malha}"/></g>
      <ellipse rx="70" ry="80" fill="url(#${p}luzV)"/>
      <path d="M0,-44 C-4,0 -4,34 0,70" stroke="#8A7E72" stroke-width="3.5" fill="none" opacity=".35" stroke-linecap="round"/>`;
  }
  function garupaSVG(p) {
    return `<ellipse rx="76" ry="82" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="8"/>
      <ellipse rx="76" ry="82" fill="url(#${p}pelo)"/>
      <g clip-path="url(#${p}garupaClip)"><path d="M8,-96 C40,-100 84,-74 88,-34 C92,-4 62,10 40,-4 C18,-18 -4,-56 8,-96 Z M-80,20 C-62,10 -40,18 -38,38 C-36,58 -60,66 -76,56 Z" fill="${COR.malha}"/></g>
      <ellipse rx="76" ry="82" fill="url(#${p}luzV)"/>
      <path d="M0,-74 C-3,-20 -3,24 0,74" stroke="#8A7E72" stroke-width="4" fill="none" opacity=".35" stroke-linecap="round"/>
      <path d="M-40,-70 C-30,-80 -14,-82 -6,-76 M40,-70 C30,-80 14,-82 6,-76" stroke="#8A7E72" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>`;
  }

  /* --- Patas (cada peça ao longo de +x; contorno primeiro, enchimento depois) --- */
  const capsula = (L, a, b) => `M0,${-a} L${L},${-b} A${b},${b} 0 0 1 ${L},${b} L0,${a} A${a},${a} 0 0 1 0,${-a} Z`;
  const supF = L => `M-4,-27 C${n(L * .35)},-25 ${n(L * .7)},-16 ${L},-12.5 A12.5,12.5 0 0 1 ${L},12.5 C${n(L * .7)},15 ${n(L * .35)},22 -4,27 C-22,22 -22,-22 -4,-27 Z`;
  const supT = L => `M-16,-42 C${n(L * .25)},-46 ${n(L * .65)},-21 ${L},-12.5 A12.5,12.5 0 0 1 ${L},12.5 C${n(L * .65)},18 ${n(L * .3)},44 -12,44 C-42,38 -44,-32 -16,-42 Z`;
  const INF = L => capsula(L, 11, 10);
  // casco fendido (o boleto fica na origem; o casco aponta para +x = para a frente)
  const CASCO = 'M-12,2 L11,2 C14,9 17,15 20,23 C10,26 -6,26 -15,23 C-15,15 -14,8 -12,2 Z';
  function pernaSVG(p, pe) {
    const fr = pe.fr, sup = fr ? supF(pe.L1) : supT(pe.L1), L2 = pe.L2, k = 'vc-' + pe.id;
    const malha = pe.id === 'tE' ? `<path d="M6,-34 C30,-40 56,-26 58,-8 C60,10 40,20 22,14 C6,8 -6,-22 6,-34 Z" fill="${COR.malha}"/>`
      : pe.id === 'fD' ? `<path d="M20,-14 C34,-18 50,-12 52,-2 C54,8 40,14 28,10 C18,6 12,-8 20,-14 Z" fill="${COR.malha}"/>` : '';
    return `<g class="vc-perna ${k}">
      <g class="${k}-sup"><path d="${sup}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="8" stroke-linejoin="round"/></g>
      <g class="${k}-inf"><path d="${INF(L2)}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="8"/></g>
      <g class="${k}-joe"><circle r="${fr ? 13.5 : 13}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="8"/></g>
      <g class="${k}-casco"><path d="${CASCO}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="6" stroke-linejoin="round"/></g>
      <g class="${k}-bol"><circle r="11.5" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="8"/></g>
      <g class="${k}-sup"><path d="${sup}" fill="url(#${p}perna)"/>${malha}<path d="M6,-14 C${n(pe.L1 * .35)},-14 ${n(pe.L1 * .65)},-9 ${n(pe.L1 - 6)},-7" stroke="#FFFFFF" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/></g>
      <g class="${k}-inf"><path d="${INF(L2)}" fill="url(#${p}perna)"/><path d="M8,-4 L${L2 - 10},-3" stroke="#FFFFFF" stroke-width="2.6" opacity=".6" stroke-linecap="round"/></g>
      <g class="${k}-joe"><circle r="${fr ? 13.5 : 13}" fill="url(#${p}joelho)"/></g>
      <g class="${k}-casco"><path d="${CASCO}" fill="url(#${p}casco)"/><path d="M4,4 C5,12 6,18 7,25" stroke="#1A1210" stroke-width="2" fill="none"/><path d="M-12,6 C-4,8 4,8 12,6" stroke="#8A7A70" stroke-width="2" fill="none" opacity=".8"/></g>
      <g class="${k}-bol"><circle r="11.5" fill="#F2EDE6"/><path d="M-7,4 C-2,7 3,7 8,4" stroke="#CFC6B9" stroke-width="1.8" fill="none"/></g>
    </g>`;
  }
  // úbere (pendurado por baixo da barriga, atrás do tronco: o tronco tapa-lhe a base)
  function ubereSVG(p) {
    const tetas = [-20, -7, 7, 20].map(x => `M${x - 4},26 C${x - 5},34 ${x - 4},41 ${x},42 C${x + 4},41 ${x + 5},34 ${x + 4},26 Z`).join(' ');
    const U = 'M-34,-12 C-38,14 -26,34 0,35 C26,34 38,14 34,-12 Z';
    return `<g class="vc-ubere"><path d="${tetas}" fill="#E8909C" stroke="${COR.cont}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="${U}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="5"/><path d="${U}" fill="url(#${p}ubere)"/>
      <path d="M0,4 C0,14 0,24 0,32" stroke="#C47480" stroke-width="2" fill="none" opacity=".6"/>
      <ellipse cx="-14" cy="8" rx="9" ry="6" fill="#FFFFFF" opacity=".4"/></g>`;
  }
  // cauda: corda refeita a cada quadro a partir da cadeia 3D, com o tufo na ponta
  function caudaSVG() {
    return `<path class="vc-caudaC" d="M0,0" fill="none" stroke="${COR.cont}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="vc-caudaF" d="M0,0" fill="none" stroke="#F4F0EA" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
      <g class="vc-tufo"><path d="M-4,-7 C8,-12 24,-12 36,-3 C40,0 40,3 36,5 C24,13 8,12 -4,7 Z" fill="${COR.malha}" stroke="${COR.cont}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M6,-3 C16,-5 26,-4 34,0 M6,3 C16,5 24,5 32,3" stroke="#6A5E58" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`;
  }

  /* --- Pescoço: 3 segmentos (trapézios) com tampas redondas nas juntas, a coleira de couro e as rugas --- */
  function trapPesc(i, e) {
    const a = WN[i] / 2 + e, b = WN[i + 1] / 2 + e, x0 = -6, x1 = LS + 6;
    if (i === 0) return `M14,${-a} L${x1},${-b} L${x1},${b} L14,${a} C${-18 - e},${n(a * .7)} ${-22 - e},${n(-a * .7)} 14,${-a} Z`;
    return `M${x0},${-a} L${x1},${-b} L${x1},${b} L${x0},${a} Z`;
  }
  function pescocoSVG(p) {
    let cont = '', disc = '', fill = '';
    for (let i = 0; i < N_PESC; i++) {
      const contorno = i === 0 ? `M30,${n(-WN[0] / 2 - 4 + (WN[0] - WN[1]) / 2 * 30 / LS)} L${LS + 6},${-WN[1] / 2 - 4} L${LS + 6},${WN[1] / 2 + 4} L30,${n(WN[0] / 2 + 4 - (WN[0] - WN[1]) / 2 * 30 / LS)} Z` : trapPesc(i, 4);
      cont += `<g class="vc-pc${i}"><path d="${contorno}" fill="${COR.cont}"/></g>`;
      let extra = '';
      if (i === 1) {
        const x = LS * .55, b = (WN[1] + WN[2]) / 4 + 1;
        extra = `<path d="M${n(x - 7)},${n(-b)} L${n(x + 7)},${n(-b)} L${n(x + 3)},${n(b)} L${n(x - 11)},${n(b)} Z" fill="#8A5A2E" stroke="#4A2E16" stroke-width="2"/>
          <path d="M${n(x - 2)},${n(-b + 4)} L${n(x - 5)},${n(b - 4)}" stroke="#C8925A" stroke-width="1.4" stroke-dasharray="3 3"/>`;
      }
      if (i === 2) extra = `<path d="M10,-22 C16,-8 16,8 10,22 M20,-18 C25,-6 25,6 20,18" stroke="#BFB5A8" stroke-width="2.4" fill="none" opacity=".7" stroke-linecap="round"/>`;
      fill += `<g class="vc-pc${i}"><path d="${trapPesc(i, 0)}" fill="url(#${p}pesc)"/>${extra}</g>`;
      if (i > 0) {
        cont += `<g class="vc-pj${i}"><circle r="${WN[i] / 2 + 4}" fill="${COR.cont}"/></g>`;
        disc += `<g class="vc-pj${i}"><circle r="${WN[i] / 2}" fill="#F3EEE7"/></g>`;
      }
    }
    return `<g class="vc-pescoco"><g>${cont}</g><g>${disc}</g><g>${fill}</g></g>`;
  }
  function sinoSVG(p) {
    return `<g class="vc-sino">
      <path d="M-5,-6 L5,-6 L4,11 L-4,11 Z" fill="#7A4E26" stroke="#3E2610" stroke-width="2"/>
      <path d="M-10,9 L10,9 C11,19 14,30 18,38 L-18,38 C-14,30 -11,19 -10,9 Z" fill="url(#${p}sino)" stroke="#5E3E10" stroke-width="2.4" stroke-linejoin="round"/>
      <ellipse cy="38" rx="18" ry="4.5" fill="#A87424" stroke="#5E3E10" stroke-width="2"/>
      <circle class="vc-badalo" cy="43" r="4.5" fill="#5A3A10"/>
      <path d="M-5,13 C-6,21 -9,29 -12,35" stroke="#FFF2C0" stroke-width="2.2" fill="none" opacity=".75" stroke-linecap="round"/></g>`;
  }

  /* --- Cabeça: vista de frente cujas feições deslizam com Y = cos(rumo da cabeça)
         (−1 perfil para a esquerda … 0 de frente … 1 perfil para a direita); F = sen(rumo) (< 0: de costas, a cara esconde-se);
         beta = inclinação do focinho (graus, + para baixo). Crânio branco → ponte → focinho rosa grande --- */
  const LF = 54;
  const CORNO = 'M-7,5 C2,2 12,-3 17,-13 C20,-20 19,-27 15,-29 C12,-23 8,-15 -2,-9 Z';
  const ORELHA = 'M-4,-10 C10,-17 30,-16 44,-6 C47,-3 47,2 43,4 C29,11 10,12 -4,9 Z';
  const ORELHA_IN = 'M6,-5 C16,-9 28,-8 38,-3 C30,4 17,6 6,4 Z';
  const MANCHA_CAB = 'M-24,-26 C-6,-36 20,-32 30,-14 C38,2 30,22 10,28 C-8,32 -24,20 -30,2 C-34,-10 -32,-20 -24,-26 Z';
  const TOPETE = 'M-17,8 C-21,-2 -14,-12 -7,-9 C-6,-17 4,-19 8,-11 C14,-16 22,-8 19,2 C22,6 20,10 16,10 Z';
  function estadoCabeca(q) {
    const Y = q.Y, aY = Math.abs(Y), b = q.beta * RAD, cb = Math.cos(b), sb = Math.sin(b);
    const t = {}, d = {}, op = {}, a = {};
    const Mx = Y * LF * cb, My = 6 + LF * sb;               // centro do focinho
    const bx = Mx, by = My + 6;
    t.ponte = `translate(0,-6) rotate(${n(Math.atan2(by, bx) / RAD)})`; a.ponteL = n(Math.max(1, Math.hypot(bx, by)));
    const rf = Y * q.beta * .45, kf = 1 - .2 * aY;
    t.foc = `translate(${n(Mx)},${n(My)}) rotate(${n(rf)}) scale(${n3(kf)},1)`;
    t.queixo = `translate(${n(Mx - Y * 8 + q.mastX)},${n(My + 21 + q.boca * 22 + q.mastY)}) rotate(${n(rf + q.mastX * 2)}) scale(${n3(1 - .3 * aY)},1)`;
    t.bocaInt = `translate(${n(Mx + Y * 4 + q.mastX * .5)},${n(My + 22 + q.boca * 10)})`;
    a.bocaRy = n(1 + q.boca * 15); a.bocaRx = n(24 * (1 - .3 * aY));
    // linha da boca (por baixo do focinho)
    const c1 = [Mx - 20 * (1 - aY) + aY * (Y > 0 ? -4 : -30), My + 17 - (Y < 0 ? 4 : 0) * aY], c2 = [Mx + 20 * (1 - aY) + aY * (Y > 0 ? 30 : 4), My + 17 - (Y > 0 ? 4 : 0) * aY];
    const cc = [(c1[0] + c2[0]) / 2 + Y * 2 + q.mastX * .8, My + 22 + q.sorriso * 3];
    d.boca = `M${n(c1[0] + q.mastX * .4)},${n(c1[1])} Q${n(cc[0])},${n(cc[1])} ${n(c2[0] + q.mastX * .4)},${n(c2[1])}`;
    a.bocaFrente = [Mx + Y * 30 * cb, My + 18];
    a.narinas = [Mx + Y * 22 * cb, My - 6];
    a.focTopo = [Mx + Y * 6, My - 26];
    // feições presas a uma esfera: ângulo = lado (±) + rumo da cabeça (al)
    const al = Math.asin(limita(Y, -1, 1)) / RAD;
    const sen = g => Math.sin(g * RAD), cosg = g => Math.cos(g * RAD);
    const ca = Math.sqrt(Math.max(0, 1 - Y * Y));
    for (const s of [-1, 1]) {
      const k = s < 0 ? 'E' : 'D';
      const gn = s * 30 + al;
      t['nar' + k] = `translate(${n(Mx + 21 * sen(gn) * kf + Y * 8)},${n(My - 5)}) rotate(${n(s * 18 * (1 - aY) + Y * q.beta * .4)}) scale(${n3((.45 + .55 * Math.max(0, cosg(gn))) * (1 + q.nariz * .4))},${n3(1 + q.nariz * .5)})`;
      op['nar' + k] = n3(passoS(.02, .25, cosg(gn)));
      const ge = s * 58 + al, ce = cosg(ge), ex = 38 * sen(ge), sx = .22 + .78 * Math.max(0, ce);
      t['olho' + k] = `translate(${n(ex)},-10) scale(${n3(sx * q.olhoEsc)},${n3(q.olhoEsc)})`;
      op['olho' + k] = ce > .08 ? '1' : '0';
      t['iris' + k] = `translate(${n(q.olharX * 4.5 + Y * 2 - s * q.vesgo * 4.5)},${n(q.olharY * 4 + q.vesgo * 1.5)})`;
      t['sobr' + k] = `translate(${n(39 * sen(ge + s * 3))},${n(-33 - q.sobr * 5)}) rotate(${n(s * (-8 + q.sobr * 10))}) scale(${n3(sx)},1)`;
      op['sobr' + k] = ce > .12 ? '1' : '0';
      const gc = s * 52 + al;
      t['boch' + k] = `translate(${n(42 * sen(gc))},14) scale(${n3(.3 + .7 * Math.max(0, cosg(gc)))},1)`;
      op['boch' + k] = n3(passoS(.05, .4, cosg(gc)) * .45 * (1 + q.feliz * .7));
      // cornos pequenos no alto do crânio
      const gh = s * 34 + al;
      t['corno' + k] = `translate(${n(31 * sen(gh))},-34) scale(${n3(s * (1 - .35 * aY))},1)`;
      // orelhas para o lado (planas): encurtam e caem quando apontam para a câmara
      const go = s * 52 + al, flap = s < 0 ? q.oE : q.oD;
      const rot = 14 + (1 - ca) * 26 - q.orelhas + flap;
      t['orelha' + k] = `translate(${n(46 * sen(go))},-14) rotate(${n(s * rot)}) scale(${n3(s * Math.max(.36, ca))},1)`;
    }
    const gp = 50 + al;
    t.mancha = `translate(${n(40 * sen(gp))},-14) scale(${n3(.3 + .7 * Math.max(0, cosg(gp)))},1)`;
    t.topete = `translate(${n(Y * 24)},-40) scale(${n3(1 - .45 * aY)},1)`;
    // pálpebras: c = fecho, h = olhos contentes («∩»)
    const c = limita(q.fecho, 0, 1), h = limita(q.feliz, 0, 1);
    const ye = lerp(lerp(-13, 12, c), 8, h), cy = lerp(lerp(-30, 19, c), -13, h);
    d.palpS = `M-19,-26 L19,-26 L19,${n(ye)} Q0,${n(cy)} -19,${n(ye)} Z`;
    const yl = lerp(20, 9, h), cyl = lerp(25, -10, h);
    d.palpI = `M-19,25 L19,25 L19,${n(yl)} Q0,${n(cyl)} -19,${n(yl)} Z`;
    const Q = (u, p0, p1, p2) => (1 - u) * (1 - u) * p0 + 2 * u * (1 - u) * p1 + u * u * p2;
    let cil = `M-15.5,${n(Q(.1, ye, cy, ye))} Q0,${n(Q(.5, ye, cy, ye) * 2 - (Q(.1, ye, cy, ye) + Q(.9, ye, cy, ye)) / 2)} 15.5,${n(Q(.9, ye, cy, ye))}`;
    for (const u of [.12, .3, .7, .88]) {
      const x = lerp(-19, 19, u), y = Q(u, ye, cy, ye), vx = x * .7, vy = y - 4;
      const L = Math.hypot(vx, vy) || 1, ux = vx / L, uy = vy / L, comp = (6 + 7 * Math.abs(u - .5) * 2) * (1 - c * .3);
      cil += ` M${n(x)},${n(y)} q${n(ux * comp * .5 - uy * 2)},${n(uy * comp * .5 + ux * 2)} ${n(ux * comp)},${n(uy * comp)}`;
    }
    d.cil = cil;
    // língua: sai da boca e sobe até às narinas
    const L = q.lingua * 36, tx = q.linguaX * 16 * (1 - aY) + Y * 16;
    d.lingua = `M-9,2 C-10,${n(-L * .45)} ${n(tx - 11)},${n(-L)} ${n(tx)},${n(-L - 3)} C${n(tx + 11)},${n(-L)} 10,${n(-L * .45)} 9,2 Z`;
    t.lingua = `translate(${n(Mx + Y * 14 + q.mastX * .5)},${n(My + 20)}) rotate(${n(rf * .5)})`;
    op.lingua = q.lingua > .03 ? '1' : '0';
    // de costas: a cara (focinho, olhos, boca) esconde-se atrás do crânio
    op.rosto = n3(passoS(-.62, -.34, q.F));
    return { t, d, op, a };
  }

  // cores lisas para o ícone (sem gradientes com id)
  const LISO = { cab: '#FBF8F2', ponte: '#FFFFFF', foc: '#F2A8AF', iris: '#3A2014', corno: '#EADBB4', orelhaIn: '#EFA2AC', sino: '#D9A040' };
  function cabecaSVG(p, E, icone) {
    const T = k => E.t[k] ? ` transform="${E.t[k]}"` : '';
    const O = k => E.op[k] != null ? ` opacity="${E.op[k]}"` : '';
    const corno = k => `<g class="vc-corno${k}"${T('corno' + k)}><path d="${CORNO}" fill="url(#${p}corno)" stroke="${COR.cont}" stroke-width="2.6" stroke-linejoin="round"/><path d="M3,-5 C9,-9 13,-14 15,-21" stroke="#FFFFFF" stroke-width="1.8" fill="none" opacity=".75" stroke-linecap="round"/></g>`;
    const orelha = k => `<g class="vc-orelha${k}"${T('orelha' + k)}><path d="${ORELHA}" fill="${COR.malha}" stroke="${COR.cont}" stroke-width="2.6" stroke-linejoin="round"/><path d="${ORELHA_IN}" fill="url(#${p}orelhaIn)"/>
        <path d="M10,-1 C20,-3 28,-3 35,-1" stroke="#FFFFFF" stroke-width="1.3" fill="none" opacity=".55" stroke-linecap="round"/><path d="M2,-8 C14,-13 28,-13 38,-6" stroke="#6A5E58" stroke-width="2" fill="none" opacity=".7" stroke-linecap="round"/></g>`;
    const olho = (k, palp) => `<g class="vc-olho${k}"${T('olho' + k)}${O('olho' + k)}>
        <ellipse rx="18" ry="20.5" fill="#3A2A22" opacity=".14"/>
        <g${icone ? '' : ` clip-path="url(#${p}olho)"`}>
          <ellipse rx="14" ry="16.5" fill="#FFFDF6"/>
          <g class="vc-iris${k}"${T('iris' + k)}><circle cy="1" r="12" fill="url(#${p}iris)"/><circle cy="1" r="12" fill="none" stroke="#0E0603" stroke-width="1.4"/>
            <ellipse cy="1.5" rx="7" ry="5.6" fill="#0A0503"/><circle cx="-4.5" cy="-4.5" r="4.8" fill="#FFFFFF"/><circle cx="4.6" cy="5.2" r="2.1" fill="#FFFFFF" opacity=".9"/></g>
          ${icone ? '' : `<path d="M-19,-22 L19,-22 L19,-9 Q0,-24 -19,-9 Z" fill="#3A2A22" opacity=".12"/>
          <path class="vc-palpS${k}" d="${E.d.palpS}" fill="${palp}"/><path class="vc-palpI${k}" d="${E.d.palpI}" fill="${palp}"/>`}
        </g>
        <ellipse rx="14" ry="16.5" fill="none" stroke="${COR.cont}" stroke-width="2.6"/>
        <path class="vc-cil${k}" d="${E.d.cil}" fill="none" stroke="#1E120C" stroke-width="2.4" stroke-linecap="round"/></g>`;
    const nar = k => `<g class="vc-nar${k}"${T('nar' + k)}${O('nar' + k)}><path d="M-8,0 C-8,-6 -2,-8 4,-7 C9,-5 9,1 6,5 C2,8 -6,6 -8,0 Z" fill="#8E3C4C"/><path d="M-4,0 C-3,-3 1,-4 4,-3" stroke="#5A1E2A" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M-7,-6 C-2,-10 5,-10 9,-5" stroke="#FFE4E4" stroke-width="1.6" fill="none" opacity=".85" stroke-linecap="round"/></g>`;
    const s = `<g class="vc-cab-in">
      ${corno('E')}${corno('D')}
      <g class="vc-orelhasT">${orelha('E')}${orelha('D')}</g>
      <ellipse rx="52.5" ry="46.5" fill="${COR.cont}"/>
      <g class="vc-rostoC"${O('rosto')}>
        <g class="vc-ponteC"${T('ponte')}><rect class="vc-ponteCr" x="0" y="-36" width="${E.a.ponteL}" height="72" rx="36" fill="${COR.cont}"/></g>
        <g class="vc-queixoC"${T('queixo')}><ellipse rx="31" ry="16.5" fill="${COR.cont}"/></g>
        <g class="vc-focC"${T('foc')}><ellipse rx="49.5" ry="33.5" fill="${COR.cont}"/></g>
      </g>
      <ellipse rx="50" ry="44" fill="url(#${p}cab)"/>
      <path d="M-34,-26 C-20,-38 4,-42 24,-36" stroke="#FFFFFF" stroke-width="7" fill="none" opacity=".7" stroke-linecap="round"/>
      <g class="vc-rosto"${O('rosto')}>
        <g class="vc-queixo"${T('queixo')}><ellipse rx="28" ry="13.5" fill="#F7B9BF"/><path d="M-15,5 C-5,9 5,9 15,4" stroke="#D88A94" stroke-width="1.6" fill="none"/></g>
        <ellipse class="vc-bocaInt"${T('bocaInt')} rx="${E.a.bocaRx}" ry="${E.a.bocaRy}" fill="${COR.boca}"/>
        <g class="vc-ponte"${T('ponte')}><rect class="vc-ponteR" x="0" y="-33" width="${E.a.ponteL}" height="66" rx="33" fill="url(#${p}ponte)"/></g>
        <g${icone ? '' : ` clip-path="url(#${p}cranio)"`}><g class="vc-mancha"${T('mancha')}><path d="${MANCHA_CAB}" fill="${COR.malha}"/><path d="M-16,-22 C-4,-28 12,-26 20,-16" stroke="#6A5E58" stroke-width="3.5" fill="none" opacity=".6" stroke-linecap="round"/></g></g>
        <g class="vc-topete"${T('topete')}><path d="${TOPETE}" fill="#FFFFFF" stroke="${COR.cont}" stroke-width="2.4" stroke-linejoin="round"/><path d="M-10,0 C-10,-5 -6,-7 -3,-5 M2,-2 C2,-8 7,-9 10,-6" stroke="#CFC6B9" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>
        <g class="vc-foc"${T('foc')}><ellipse rx="46" ry="30" fill="url(#${p}foc)"/><ellipse cx="-12" cy="-16" rx="18" ry="6" fill="#FFFFFF" opacity=".45"/>
          <g fill="#C8707E" opacity=".55"><circle cx="-26" cy="12" r="1.6"/><circle cx="-18" cy="17" r="1.6"/><circle cx="-30" cy="4" r="1.4"/><circle cx="18" cy="17" r="1.6"/><circle cx="26" cy="12" r="1.6"/><circle cx="30" cy="4" r="1.4"/></g></g>
        ${nar('E')}${nar('D')}
        <g class="vc-linguaG"${T('lingua')}${O('lingua')}><path class="vc-lingua" d="${E.d.lingua}" fill="#E8708A" stroke="#A8384E" stroke-width="2" stroke-linejoin="round"/></g>
        <path class="vc-boca" d="${E.d.boca}" stroke="#9A4A58" stroke-width="3" fill="none" stroke-linecap="round"/>
        <ellipse class="vc-bochE"${T('bochE')}${O('bochE')} rx="11" ry="6.5" fill="#F7A0AA"/><ellipse class="vc-bochD"${T('bochD')}${O('bochD')} rx="11" ry="6.5" fill="#F7A0AA"/>
        ${olho('E', `url(#${p}cab)`)}${olho('D', COR.malha)}
        <path class="vc-sobrE"${T('sobrE')}${O('sobrE')} d="M-9,2 C-4,-3 4,-3 9,1" stroke="#9A8C80" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path class="vc-sobrD"${T('sobrD')}${O('sobrD')} d="M-9,1 C-4,-3 4,-3 9,2" stroke="#7A6E68" stroke-width="3" fill="none" stroke-linecap="round"/>
      </g>
      <g class="vc-orelhasF"></g>
    </g>`;
    if (!icone) return s;
    return s.replace(/url\(#vaca-([A-Za-z]+)\)/g, (m, k) => LISO[k] || '#FBF8F2');
  }
  const CAB0 = { Y: .58, F: .8, beta: 50, oE: 0, oD: 0, orelhas: 0, fecho: 0, feliz: 0, sobr: 0, boca: 0, mastX: 0, mastY: 0, olharX: 0, olharY: 0, vesgo: 0, nariz: 0, sorriso: .5, olhoEsc: 1, lingua: 0, linguaX: 0 };

  function vacaSVG(p) {
    const E = estadoCabeca(CAB0);
    return `<g class="vc-vaca">
      <g class="vc-corpo">
        <ellipse class="vc-sombra" rx="1" ry="1" fill="url(#${p}sombra)"/>
        ${PERNAS.map(pe => `<ellipse class="vc-sp-${pe.id}" rx="24" ry="6" fill="url(#${p}sombra)"/>`).join('')}
        <g class="vc-pernasTras">${PERNAS.map(pe => pernaSVG(p, pe)).join('')}</g>
        <g class="vc-slotCaudaT"><g class="vc-cauda">${caudaSVG()}</g></g>
        <g class="vc-slotPescT"></g>
        ${ubereSVG(p)}
        <g class="vc-tronco">${troncoSVG(p)}</g>
        <g class="vc-garupa" display="none">${garupaSVG(p)}</g>
        <g class="vc-slotCaudaF"></g>
        <g class="vc-pernasFrente"></g>
        <g class="vc-peito" display="none">${peitoSVG(p)}</g>
      </g>
      <g class="vc-slotPescF"><g class="vc-frente">
        <path class="vc-barbelaC" d="M0,0" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7" stroke-linejoin="round"/><path class="vc-barbela" d="M0,0" fill="#F3EEE7"/>
        ${pescocoSVG(p)}${sinoSVG(p)}<g class="vc-cab">${cabecaSVG(p, E)}</g></g></g>
      <g class="vc-copia" display="none"><path class="vc-sombraDentro" d="${ABERTURA}" fill="#140C06" opacity="0"/><g class="vc-fenoC">${fenoFrenteSVG(p)}</g>${cancelaSVG(p, 'vc-cancelaC')}</g>
    </g>`;
  }

  /* ================= 4) Cenário: lameiro de montanha ================= */
  const serraY = x => 452 - 40 * Math.exp(-(((x - 600) / 260) ** 2)) - 58 * Math.exp(-(((x - 1260) / 240) ** 2)) + 8 * Math.sin(x * .012);
  const monteY = x => 496 + 14 * Math.sin(x * .0045 + .8) + 10 * Math.sin(x * .011 + 2.1) - 30 * Math.exp(-(((x - 1240) / 200) ** 2)) - 18 * Math.exp(-(((x - 420) / 170) ** 2));
  function perfil(f, y1) { const pts = []; for (let x = -40; x <= 1640; x += 40) pts.push([x, f(x)]); return curvaPor(pts, false) + `L1640,${y1} L-40,${y1} Z`; }
  // riacho: linha do meio e meia largura em função do y
  const rioCx = y => 262 - (y - 636) * .62 + 34 * Math.sin((y - 636) * .021);
  const rioW = y => 7 + (y - 636) * .38;
  const naAgua = (x, y, m = 4) => y > 630 && Math.abs(x - rioCx(y)) < rioW(y) + m;
  const PEDRA_RA = [n(rioCx(762) - rioW(762) * .42), 762];
  const CHAMINE = [1357, n(monteY(1338) + 30 - 50)];

  function defsCena(p) {
    return `
    <linearGradient id="${p}ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5AA2DC"/><stop offset=".45" stop-color="#94C8EC"/><stop offset=".78" stop-color="#D2EAF4"/><stop offset="1" stop-color="#EAF3EC"/></linearGradient>
    <radialGradient id="${p}solBrilho"><stop offset="0" stop-color="#FFFBE6" stop-opacity=".95"/><stop offset=".2" stop-color="#FFF4C8" stop-opacity=".5"/><stop offset=".55" stop-color="#FFF0B8" stop-opacity=".12"/><stop offset="1" stop-color="#FFF0B8" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}sol" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="#FFFFF6"/><stop offset=".7" stop-color="#FFF6CC"/><stop offset="1" stop-color="#FFE9A0"/></radialGradient>
    <linearGradient id="${p}serra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8CAAC0"/><stop offset=".5" stop-color="#A6C0CE"/><stop offset="1" stop-color="#C2D6DA"/></linearGradient>
    <linearGradient id="${p}monteL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8CBC6A"/><stop offset="1" stop-color="#6EA64E"/></linearGradient>
    <linearGradient id="${p}lameiro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8CCC52"/><stop offset=".35" stop-color="#70B83E"/><stop offset="1" stop-color="#4C9628"/></linearGradient>
    <linearGradient id="${p}agua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8DCF0"/><stop offset=".5" stop-color="#6CB4DC"/><stop offset="1" stop-color="#4A94C4"/></linearGradient>
    <linearGradient id="${p}pedra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D4D0C6"/><stop offset="1" stop-color="#9C978C"/></linearGradient>
    <linearGradient id="${p}granito" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DAD6CC"/><stop offset=".6" stop-color="#BEB9AE"/><stop offset="1" stop-color="#9E998E"/></linearGradient>
    <linearGradient id="${p}colmo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EACF88"/><stop offset=".55" stop-color="#CFA758"/><stop offset="1" stop-color="#9E7A3A"/></linearGradient>
    <linearGradient id="${p}interior" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C140C"/><stop offset=".55" stop-color="#34261A"/><stop offset="1" stop-color="#4E3A22"/></linearGradient>
    <linearGradient id="${p}madeira" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B49C7A"/><stop offset=".5" stop-color="#937C5C"/><stop offset="1" stop-color="#6E5A40"/></linearGradient>
    <linearGradient id="${p}feno" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4DA8C"/><stop offset=".6" stop-color="#DDB75E"/><stop offset="1" stop-color="#B89040"/></linearGradient>
    <radialGradient id="${p}copa" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#78B04E"/><stop offset=".55" stop-color="#4E8A34"/><stop offset="1" stop-color="#2E6020"/></radialGradient>
    <linearGradient id="${p}casca" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8E8270"/><stop offset=".45" stop-color="#6A5E4C"/><stop offset="1" stop-color="#433A2C"/></linearGradient>
    <radialGradient id="${p}nevoa"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".78"/><stop offset=".6" stop-color="#FFFFFF" stop-opacity=".34"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}sombraArv"><stop offset="0" stop-color="#1E400E" stop-opacity=".34"/><stop offset=".7" stop-color="#1E400E" stop-opacity=".14"/><stop offset="1" stop-color="#1E400E" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}vinheta" cx=".46" cy=".44" r=".78"><stop offset=".62" stop-color="#1A3010" stop-opacity="0"/><stop offset="1" stop-color="#1A3010" stop-opacity=".24"/></radialGradient>
    <radialGradient id="${p}luzQuente" gradientUnits="userSpaceOnUse" cx="190" cy="150" r="1150"><stop offset="0" stop-color="#FFF4C8" stop-opacity=".18"/><stop offset=".5" stop-color="#FFF0C0" stop-opacity=".04"/><stop offset="1" stop-color="#FFF0C0" stop-opacity="0"/></radialGradient>
    <clipPath id="${p}recorte"><path d="M${AB.x0},${AB.y0} H${AB.x1} V${AB.chao} L${AB.x1 + 40},${AB.chao} L${AB.x1 + 60},900 L${AB.x0 - 60},900 L${AB.x0 - 40},${AB.chao} L${AB.x0},${AB.chao} Z"/></clipPath>
    <clipPath id="${p}recorteDentro"><path d="${ABERTURA}"/></clipPath>`;
  }
  function nuvemSVG(i, k) {
    return `<g class="vc-nuvem${i}"><g transform="scale(${k})">
      <ellipse cx="0" cy="12" rx="98" ry="13" fill="#C6DAEA" opacity=".8"/>
      <ellipse cx="-48" cy="0" rx="36" ry="18" fill="#F4F9FC"/><ellipse cx="-6" cy="-10" rx="42" ry="24" fill="#FFFFFF"/><ellipse cx="40" cy="-2" rx="36" ry="17" fill="#F7FBFD"/><ellipse cx="76" cy="6" rx="22" ry="10" fill="#EEF5FA"/>
      <ellipse cx="0" cy="8" rx="94" ry="10" fill="#E6F0F8"/></g></g>`;
  }
  function nevoaSVG(p, lista) {
    return lista.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${p}nevoa)"/>`).join('');
  }
  function casaSVG() {
    // casinha caiada com cunhais de basalto e chaminé (Açores); o fumo é animado à parte
    const y = n(monteY(1338) + 30);
    return `<g transform="translate(1338,${y})">
      <ellipse cx="4" cy="1" rx="44" ry="4" fill="#3E5A2A" opacity=".3"/>
      <path d="M-30,0 L-30,-24 L30,-24 L30,0 Z" fill="#F8F6F0"/><path d="M-28,0 L-28,-24 M28,0 L28,-24" stroke="#3A3A3A" stroke-width="4"/>
      <path d="M-35,-23 L0,-40 L35,-23 Z" fill="#C25A36"/><path d="M-34,-23 L34,-23" stroke="#7E3418" stroke-width="2"/>
      <rect x="14" y="-50" width="9" height="20" fill="#F0EEE8" stroke="#3A3A3A" stroke-width="1.5"/>
      <rect x="-8" y="-17" width="9" height="17" fill="#3A5A8A"/><rect x="-22" y="-18" width="8" height="8" fill="#3A5A8A"/><rect x="11" y="-18" width="8" height="8" fill="#3A5A8A"/></g>`;
  }
  function colinasSVG(p) {
    const rnd = semente(7);
    let s = `<path d="${perfil(serraY, 640)}" fill="url(#${p}serra)"/>`;
    s += `<g class="vc-nevoa0">${nevoaSVG(p, [[260, 448, 300, 26], [760, 440, 320, 22], [1300, 420, 300, 26]])}</g>`;
    s += `<path d="${perfil(monteY, 660)}" fill="url(#${p}monteL)"/>`;
    // socalcos: muretes ao longo da encosta, com hortênsias em fila
    let soc = '', socL = '', hort = '', cr = '', crL = '';
    for (let k = 1; k <= 6; k++) {
      const pts = [], ptsL = [], dy = k * 14 + k * k * .7;
      for (let x = -40; x <= 1640; x += 40) { const y = monteY(x) + dy; pts.push([x, y]); ptsL.push([x, y - 2.4]); }
      soc += curvaPor(pts, false); socL += curvaPor(ptsL, false);
      for (let j = 0; j < 16; j++) { const x = rnd() * 1640 - 20, r = 2 + rnd() * 1.8 + k * .2; hort += elipse(x, monteY(x) + dy - 3, r, r * .8); }
    }
    s += `<path d="${socL}" stroke="#CDE6B0" stroke-width="1.6" fill="none" opacity=".7"/><path d="${soc}" stroke="#5E8248" stroke-width="2.4" fill="none" opacity=".7"/><path d="${hort}" fill="#7E9CE0" opacity=".85"/>`;
    // criptomérias nas cristas
    for (let i = 0; i < 20; i++) {
      const x = 30 + rnd() * 1540, y = monteY(x) + 4 + rnd() * 10, h = 22 + rnd() * 28, w = h * .28;
      cr += `M${n(x - w)},${n(y)} L${n(x)},${n(y - h)} L${n(x + w)},${n(y)} Z`;
      crL += `M${n(x - w)},${n(y)} L${n(x)},${n(y - h)} L${n(x - w * .1)},${n(y)} Z`;
    }
    s += `<path d="${cr}" fill="#3A6644"/><path d="${crL}" fill="#5A885A"/>`;
    s += casaSVG();
    s += `<g class="vc-nevoa1">${nevoaSVG(p, [[140, 540, 260, 18], [640, 548, 280, 16], [1200, 530, 300, 20]])}</g>`;
    return s;
  }
  function hortensiasSVG(i, x0, x1, yb, k) {
    // sebe de hortênsias: folhagem em dois verdes e bolas de flores azuis, lilases e azul-claras com florzinhas
    const rnd = semente(40 + i);
    let fo = '', foL = '', flo = '';
    const bolas = ['', '', ''], luz = ['', '', ''];
    for (let x = x0; x < x1; x += 16 * k) {
      const r = (16 + rnd() * 8) * k, y = yb - r * .6 - rnd() * 6 * k;
      fo += elipse(x, y, r, r * .72);
      if (rnd() < .55) foL += elipse(x - r * .25, y - r * .3, r * .55, r * .32);
    }
    for (let x = x0 + 12 * k; x < x1 - 8 * k; x += (22 + rnd() * 14) * k) {
      const r = (10 + rnd() * 5) * k, y = yb - (22 + rnd() * 18) * k, c = rnd() * 3 | 0;
      bolas[c] += elipse(x, y, r, r * .9);
      luz[c] += elipse(x - r * .28, y - r * .3, r * .55, r * .45);
      for (let j = 0; j < 4; j++) { const a = rnd() * TAU, d = rnd() * r * .7; flo += elipse(x + Math.cos(a) * d, y + Math.sin(a) * d * .9, 1.4 * k, 1.4 * k); }
    }
    const CB = ['#5C82D8', '#8C78D0', '#86AEEC'], CL = ['#8EAAF0', '#B4A2E8', '#BCD4FA'];
    return `<g class="vc-hort${i}"><g class="vc-hortIn"><path d="${fo}" fill="#3A7034"/><path d="${foL}" fill="#5E9446"/>
      ${bolas.map((d, c) => d ? `<path d="${d}" fill="${CB[c]}"/><path d="${luz[c]}" fill="${CL[c]}" opacity=".8"/>` : '').join('')}
      <path d="${flo}" fill="#EEF2FF" opacity=".85"/></g></g>`;
  }
  function muroSVG(p) {
    // muro de pedra solta (duas fiadas) com musgo; o riacho sai por um bueiro
    const rnd = semente(21);
    let pe = '', luz = '', mus = '';
    for (const [y0, h0] of [[600, 18], [617, 21]]) {
      let x = -30 + rnd() * 20;
      while (x < 1640) {
        const w = 24 + rnd() * 22, h = h0 + (rnd() - .5) * 4, y = y0 + (rnd() - .5) * 3;
        if (!(x + w > 238 && x < 288 && y0 > 610)) {
          pe += rr(x, y, w, h, 6);
          luz += `M${n(x + 4)},${n(y + 3)} q${n(w * .3)},-1.5 ${n(w * .6)},0`;
          if (rnd() < .18) mus += elipse(x + w * .3, y + h - 3, w * .3, 3.5);
        }
        x += w + 2;
      }
    }
    return `<path d="M-20,598 L1620,598 L1620,640 L-20,640 Z" fill="#66625A"/>
      <path d="M240,640 L240,624 C246,612 278,612 286,624 L286,640 Z" fill="#26302A"/>
      <path d="${pe}" fill="url(#${p}pedra)" stroke="#5A564C" stroke-width="1.2"/>
      <path d="${luz}" stroke="#F0ECE2" stroke-width="1.6" fill="none" opacity=".7" stroke-linecap="round"/>
      <path d="${mus}" fill="#6E9A3A" opacity=".8"/>
      <path d="M-20,640 L1620,640" stroke="#2E4A18" stroke-width="5" opacity=".3"/>`;
  }
  function arvoreSVG(p) {
    // amieiro à beira do riacho
    const rnd = semente(61);
    let copa = '', luz = '', esc = '';
    const cl = [[150, 430, 120, 70], [70, 480, 70, 46], [240, 470, 80, 50], [110, 380, 74, 44], [200, 390, 70, 42], [40, 530, 46, 30], [270, 530, 52, 30]];
    for (const [x, y, rx, ry] of cl) {
      for (let k = 0; k < 7; k++) {
        const a = rnd() * TAU, d = rnd() * .6, cx = x + Math.cos(a) * rx * d, cy = y + Math.sin(a) * ry * d, r = (.35 + rnd() * .25) * rx;
        copa += elipse(cx, cy, r, r * .62);
        if (Math.cos(a) < .2 && Math.sin(a) < .3) luz += elipse(cx - r * .2, cy - r * .2, r * .5, r * .25);
        else esc += elipse(cx, cy + r * .25, r * .6, r * .25);
      }
    }
    return `<g>
      <ellipse cx="176" cy="648" rx="150" ry="16" fill="url(#${p}sombraArv)"/>
      <path d="M128,650 C136,620 140,590 136,560 C132,530 120,510 96,494 L110,486 C132,500 144,512 150,530 C158,508 176,494 200,486 L208,494 C186,506 172,524 168,552 C164,586 168,620 178,650 Z" fill="url(#${p}casca)" stroke="#3A2E22" stroke-width="2.5"/>
      <path d="M140,640 C144,610 146,586 144,566 M160,640 C158,616 158,596 160,574" stroke="#2E2418" stroke-width="2" fill="none" opacity=".5"/>
      <path d="M136,640 C140,612 142,590 140,570" stroke="#B8AC96" stroke-width="3" fill="none" opacity=".5"/>
      <g class="vc-copa"><path d="${copa}" fill="#24501A" transform="translate(0,6)"/><path d="${copa}" fill="url(#${p}copa)"/>
        <path d="${esc}" fill="#2E5A1E" opacity=".5"/><path d="${luz}" fill="#A8D070" opacity=".5"/></g></g>`;
  }
  function riachoSVG(p) {
    const esq = [], dir = [], meio = [], mE = [], mD = [];
    for (let y = 636; y <= 912; y += 12) {
      const c = rioCx(y), w = rioW(y);
      esq.push([c - w, y]); dir.push([c + w, y]); meio.push([c, y]); mE.push([c - w * .55, y + 4]); mD.push([c + w * .5, y - 3]);
    }
    const agua = curvaPor(dir.concat(esq.slice().reverse()), true);
    const linhas = curvaPor(meio, false) + curvaPor(mE, false) + curvaPor(mD, false);
    // pedras no leito e poldras
    const pedras = [[rioCx(700) + rioW(700) * .35, 700, 12, 6], [PEDRA_RA[0], PEDRA_RA[1], 22, 9], [rioCx(842) + rioW(842) * .3, 842, 20, 9]];
    const yP = 808;
    for (const u of [-.62, -.05, .55]) pedras.push([rioCx(yP) + rioW(yP) * u, yP + u * 6, 17, 7]);
    let pd = '', pl = '', esp = '';
    for (const [x, y, rx, ry] of pedras) {
      pd += elipse(x, y, rx, ry); pl += elipse(x - rx * .25, y - ry * .35, rx * .5, ry * .35);
      esp += `M${n(x - rx - 6)},${n(y + ry * .6)} q${n(rx + 6)},${n(ry * .9)} ${n(2 * rx + 12)},0`;
    }
    return `<path d="${curvaPor(esq, false)} ${curvaPor(dir, false)}" stroke="#3E6A22" stroke-width="10" fill="none" opacity=".45" stroke-linecap="round"/>
      <path d="${agua}" fill="url(#${p}agua)"/>
      <path d="${curvaPor(esq, false)} ${curvaPor(dir, false)}" stroke="#2E6A8E" stroke-width="2.5" fill="none" opacity=".6"/>
      <path class="vc-ondas" d="${linhas}" stroke="#E8F8FF" stroke-width="2.4" fill="none" stroke-dasharray="16 30" opacity=".55" stroke-linecap="round"/>
      <path class="vc-brilhos" d="${linhas}" stroke="#FFFFFF" stroke-width="3.4" fill="none" stroke-dasharray="3 70" opacity=".9" stroke-linecap="round"/>
      <path d="${esp}" stroke="#FFFFFF" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round"/>
      <path d="${pd}" fill="url(#${p}pedra)" stroke="#5E5A50" stroke-width="1.6"/><path d="${pl}" fill="#F2EEE6" opacity=".7"/>`;
  }
  function lameiroSVG(p) {
    const rnd = semente(81);
    let s = `<path d="M-20,636 C300,630 600,640 900,632 C1200,626 1400,634 1620,630 L1620,900 L-20,900 Z" fill="url(#${p}lameiro)"/>`;
    s += `<path d="M420,700 C600,680 820,690 980,700 C900,730 600,740 420,700 Z" fill="#A8DC6C" opacity=".35"/>`;
    // carreiro de lama até ao curral, com pegadas de cascos
    s += `<path d="M520,812 C680,800 860,786 960,776 L1080,772 C1096,782 1060,796 1000,802 C860,818 700,828 560,834 Z" fill="#8E7E4E" opacity=".32"/>`;
    let peg = '';
    for (let i = 0; i < 9; i++) { const u = i / 8, x = 600 + u * 420, y = 822 - u * 40 + (i % 2 ? 6 : -4); peg += elipse(x, y, 5, 2.6) + elipse(x + 8, y, 5, 2.6); }
    s += `<path d="${peg}" fill="#5E5030" opacity=".35"/>`;
    // erva parada: um caminho por cor (fora da água)
    const cores = ['#5E9E30', '#8ACC4E', '#4A8424', '#A8D86A'], cam = cores.map(() => '');
    for (let i = 0; i < 560; i++) {
      const y = 640 + Math.pow(rnd(), .8) * 262, x = rnd() * 1640 - 20;
      if (naAgua(x, y, 8)) continue;
      const k = .4 + (y - 640) / 260 * 1.1, h = (7 + rnd() * 9) * k, inc = (rnd() - .5) * 6 * k, c = rnd() * 4 | 0;
      cam[c] += `M${n(x)},${n(y)} q${n(inc * .4)},${n(-h * .6)} ${n(inc)},${n(-h)}`;
    }
    s += cam.map((d, i) => `<path d="${d}" stroke="${cores[i]}" stroke-width="1.7" fill="none" stroke-linecap="round" opacity=".85"/>`).join('');
    // botões-de-ouro, trevos brancos e cor-de-rosa
    let am = '', br = '', ro = '';
    for (let i = 0; i < 90; i++) {
      const y = 650 + rnd() * 240, x = rnd() * 1600, k = .5 + (y - 650) / 240;
      if (naAgua(x, y, 10) || (x > 520 && x < 1120 && y > 760)) continue;
      const r = 4 * k, c = rnd();
      if (c < .45) am += elipse(x, y, r, r * .8); else if (c < .8) br += elipse(x, y, r * .9, r * .7); else ro += elipse(x, y, r * .8, r * .7);
    }
    s += `<path d="${am}" fill="#F6D23A" stroke="#C49A10" stroke-width=".6"/><path d="${br}" fill="#FFFFFF" opacity=".9"/><path d="${ro}" fill="#E89AC4"/>`;
    return s;
  }
  function fetoSVG(i, x, y, k, flip) {
    const rnd = semente(500 + i);
    let d = '', fol = '';
    for (let j = 0; j < 5; j++) {
      const a = (-60 + j * 30 + (rnd() - .5) * 10) * RAD, L = (60 + rnd() * 30) * k;
      const ex = Math.sin(a) * L, ey = -Math.cos(a) * L * .8, cx = ex * .4, cy = ey * 1.05 - 10 * k;
      d += `M0,0 Q${n(cx)},${n(cy)} ${n(ex)},${n(ey)}`;
      for (let m = 1; m < 9; m++) {
        const u = m / 9, px = 2 * (1 - u) * u * cx + u * u * ex, py = 2 * (1 - u) * u * cy + u * u * ey, l = (1 - u) * 12 * k + 3;
        fol += `M${n(px)},${n(py)} l${n(-l * .7)},${n(-l * .35)} M${n(px)},${n(py)} l${n(l * .7)},${n(-l * .35)}`;
      }
    }
    return `<g class="vc-feto${i}" transform="translate(${x},${y})${flip ? ' scale(-1,1)' : ''}"><g class="vc-fetoIn"><path d="${d}" stroke="#2E5E1E" stroke-width="${n(2.4 * k)}" fill="none" stroke-linecap="round"/><path d="${fol}" stroke="#5E9A34" stroke-width="${n(3 * k)}" fill="none" stroke-linecap="round"/></g></g>`;
  }
  function ervaFrenteSVG(i, x, y, k, flip) {
    const rnd = semente(200 + i);
    let d = '';
    for (let j = 0; j < 9; j++) {
      const a = (j - 4) * 9 + (rnd() - .5) * 8, h = (50 + rnd() * 46) * k, bx = (j - 4) * 4 * k;
      const ex = bx + Math.sin(a * RAD) * h, ey = -Math.cos(a * RAD) * h;
      d += `M${n(bx - 3 * k)},0 Q${n(bx + ex * .3)},${n(ey * .55)} ${n(ex)},${n(ey)} Q${n(bx + ex * .3 + 4 * k)},${n(ey * .5)} ${n(bx + 3 * k)},0 Z`;
    }
    return `<g class="vc-erva${i}" transform="translate(${x},${y})${flip ? ' scale(-1,1)' : ''}"><g class="vc-ervaIn"><path d="${d}" fill="${i % 2 ? '#4E9428' : '#66AE34'}" stroke="#2E5E16" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="#C8EE90" stroke-width=".8" opacity=".5"/></g></g>`;
  }

  /* --- Curral (habitat): parede de granito, telhado de colmo, porta larga com ombreiras e verga, cancela de madeira --- */
  const PORTA = { x: 1006, z: -90 };                 // plano da porta (profundidade)
  const AB = { x0: 914, x1: 1098, y0: 406, cancela: 646, chao: 768 };
  const FACHADA = 'M806,392 L1182,392 L1182,770 L806,770 Z';
  const ABERTURA = `M${AB.x0},${AB.y0} H${AB.x1} V${AB.chao} H${AB.x0} Z`;
  function fenoFrenteSVG(p) {
    // monte de feno à frente, por trás da cancela (igual no fundo do curral e na cópia por cima da vaca)
    const rnd = semente(131);
    let pal = '', palE = '';
    for (let i = 0; i < 44; i++) {
      const x = AB.x0 + 6 + rnd() * (AB.x1 - AB.x0 - 12), y = 712 + rnd() * 52, a = (rnd() - .5) * 2.2, L = 8 + rnd() * 8;
      const seg = `M${n(x)},${n(y)} l${n(L * Math.cos(a))},${n(L * Math.sin(a) - 2)}`;
      if (i % 3) pal += seg; else palE += seg;
    }
    return `<path d="M${AB.x0},${AB.chao} L${AB.x0},716 C${AB.x0 + 24},698 ${AB.x0 + 60},712 ${AB.x0 + 92},698 C${AB.x0 + 120},688 ${AB.x0 + 150},704 ${AB.x1},710 L${AB.x1},${AB.chao} Z" fill="url(#${p}feno)" stroke="#A8802E" stroke-width="1.5"/>
      <path d="${palE}" stroke="#A8802E" stroke-width="1.8" stroke-linecap="round" opacity=".8"/><path d="${pal}" stroke="#FAE6A8" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>`;
  }
  function cancelaSVG(p, cls) {
    // cancela em coordenadas locais (dobradiça em x = 0); o motor põe a matriz que a abre para fora
    const W = AB.x1 - AB.x0, c = AB.cancela, b = AB.chao - 2;
    const rails = [c, c + 34, c + 68, b - 18].map(y => `M0,${y} L${W},${y} L${W},${y + 16} L0,${y + 16} Z`).join(' ');
    return `<g class="${cls}">
      <path d="${rails}" fill="url(#${p}madeira)" stroke="#4A3A28" stroke-width="2"/>
      <path d="M0,${c + 2.5} L${W},${c + 2.5} M0,${c + 36.5} L${W},${c + 36.5} M0,${c + 70.5} L${W},${c + 70.5} M0,${b - 15.5} L${W},${b - 15.5}" stroke="#E2D2B2" stroke-width="1.6" opacity=".7"/>
      <path d="M30,${c + 9} l40,1 M90,${c + 43} l50,-1 M40,${c + 77} l36,1 M100,${b - 9} l44,0" stroke="#6A5640" stroke-width="1.4" opacity=".6"/>
      <path d="M10,${b - 6} L${W - 14},${c + 10} L${W - 14},${c + 26} L24,${b - 4} Z" fill="url(#${p}madeira)" stroke="#4A3A28" stroke-width="2"/>
      <path d="M-2,${c - 8} L10,${c - 8} L10,${b} L-2,${b} Z M${W - 12},${c - 8} L${W},${c - 8} L${W},${b} L${W - 12},${b} Z" fill="url(#${p}madeira)" stroke="#4A3A28" stroke-width="2"/>
      <path d="M1,${c - 6} L1,${b - 2} M${W - 10},${c - 6} L${W - 10},${b - 2}" stroke="#E2D2B2" stroke-width="1.6" opacity=".7"/>
      <path d="M-6,${c + 8} L24,${c + 8} M-6,${b - 10} L24,${b - 10}" stroke="#2E2A26" stroke-width="5" stroke-linecap="round"/>
      <rect x="${W - 24}" y="${c + 40}" width="16" height="7" rx="2" fill="#3A3632"/><circle cx="${W - 6}" cy="${c + 52}" r="4" fill="none" stroke="#3A3632" stroke-width="2"/>
    </g>`;
  }
  function estabTrasSVG(p) {
    const rnd = semente(91);
    let ped = '', pal = '';
    for (let y = AB.y0 + 8; y < 690; y += 30) for (let x = AB.x0 - 10 + rnd() * 20; x < AB.x1; x += 44 + rnd() * 16) ped += rr(x, y + (rnd() - .5) * 4, 36 + rnd() * 12, 24, 6);
    for (let i = 0; i < 40; i++) { const x = AB.x0 + rnd() * (AB.x1 - AB.x0), y = 696 + rnd() * 20, a = (rnd() - .5) * 2; pal += `M${n(x)},${n(y)} l${n(10 * Math.cos(a))},${n(4 * Math.sin(a) - 2)}`; }
    let rack = '';
    for (let x = AB.x0 + 14; x < AB.x1 - 8; x += 14) rack += `M${x},532 L${x - 4},572`;
    return `<g clip-path="url(#${p}recorteDentro)">
      <path d="${ABERTURA}" fill="url(#${p}interior)"/>
      <path d="${ped}" fill="#5E4C36" opacity=".35"/>
      <rect x="${AB.x1 - 54}" y="438" width="28" height="24" fill="#F6E2A0" opacity=".6"/><path d="M${AB.x1 - 40},438 V462 M${AB.x1 - 54},450 H${AB.x1 - 26}" stroke="#2A1A0C" stroke-width="2.5"/>
      <path d="M${AB.x1 - 54},462 L${AB.x0 + 20},696 L${AB.x0 + 70},696 L${AB.x1 - 26},462 Z" fill="#F6E2A0" opacity=".07"/>
      <path d="M${AB.x0 + 4},526 C${AB.x0 + 40},508 ${AB.x1 - 60},510 ${AB.x1 - 4},526 L${AB.x1 - 4},534 L${AB.x0 + 4},534 Z" fill="#C8A452"/>
      <path d="${rack}" stroke="#2E1E10" stroke-width="3"/><path d="M${AB.x0 + 4},532 L${AB.x1 - 4},532 M${AB.x0 + 4},574 L${AB.x1 - 4},574" stroke="#4A3220" stroke-width="5"/>
      <path d="M${AB.x0},692 L${AB.x1},692 L${AB.x1},768 L${AB.x0},768 Z" fill="url(#${p}feno)" opacity=".65"/>
      <path d="${pal}" stroke="#F6DC94" stroke-width="1.6" opacity=".7"/>
      ${fenoFrenteSVG(p)}
      <path d="M${AB.x0},${AB.y0} H${AB.x1} V${AB.y0 + 44} H${AB.x0} Z" fill="#000" opacity=".3"/>
      <path d="M${AB.x0},${AB.y0} V${AB.chao} H${AB.x0 + 16} V${AB.y0} Z" fill="#000" opacity=".22"/></g>`;
  }
  function telhadoSVG(p) {
    const rnd = semente(141);
    const forma = 'M786,404 C790,378 824,340 872,314 C930,286 1066,284 1110,310 C1150,336 1178,376 1196,404 C1140,420 850,420 786,404 Z';
    let fios = '', fiosL = '', franja = 'M786,404';
    for (let i = 0; i < 46; i++) {
      const u = i / 45, xb = 790 + u * 402, yb = 410 - 6 * Math.sin(u * PI);
      const xt = 890 + u * 200 + (rnd() - .5) * 10, yt = 302 + 20 * Math.abs(u - .5) * 2 + rnd() * 6;
      const seg = `M${n(xb)},${n(yb)} Q${n((xb + xt) / 2 + (rnd() - .5) * 10)},${n((yb + yt) / 2)} ${n(xt)},${n(yt)}`;
      if (i % 2) fios += seg; else fiosL += seg;
    }
    for (let x = 786; x < 1194; x += 9) { const w = Math.sin((x - 786) / 408 * PI); franja += ` L${n(x + 4.5)},${n(418 + rnd() * 6 - 4 * w)} L${n(x + 9)},${n(408 - 4 * w)}`; }
    return `<path d="M806,404 L1182,404 L1182,430 L806,430 Z" fill="#2A2418" opacity=".28"/>
      <path d="${forma}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="6" stroke-linejoin="round"/>
      <path d="${franja}" fill="none" stroke="#7A5A26" stroke-width="5" stroke-linejoin="round"/>
      <path d="${forma}" fill="url(#${p}colmo)"/>
      <path d="${fios}" stroke="#A88440" stroke-width="2" fill="none" opacity=".7"/>
      <path d="${fiosL}" stroke="#F6E0A0" stroke-width="1.5" fill="none" opacity=".75"/>
      <path d="${franja}" fill="none" stroke="#D8B468" stroke-width="2" stroke-linejoin="round"/>
      <path d="M842,356 C940,342 1060,340 1152,354 M804,388 C940,374 1080,374 1182,388" stroke="#7A5A26" stroke-width="3.5" fill="none" opacity=".75"/>
      <path d="M884,310 C960,288 1040,288 1098,308" stroke="#7E5E2A" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M960,330 c14,-6 30,-4 40,4 c-12,6 -28,6 -40,-4 Z M1110,360 c12,-4 24,0 30,8 c-12,4 -22,2 -30,-8 Z M900,372 c10,-4 22,-2 28,6 c-10,4 -20,2 -28,-6 Z" fill="#7E9E48" opacity=".6"/>
      <path d="M810,382 C836,350 876,320 930,302" stroke="#FFF2C4" stroke-width="5" fill="none" opacity=".45" stroke-linecap="round"/>`;
  }
  function estabFrenteSVG(p) {
    const rnd = semente(101);
    let ped = '', luz = '', som = '', mus = '', liq = '';
    let y = 404;
    while (y < 766) {
      const h = Math.min(30 + rnd() * 10, 770 - y);
      let x = 796 + rnd() * 14;
      while (x < 1182) {
        const w = 40 + rnd() * 34, x0 = Math.max(808, x), x1 = Math.min(1180, x + w);
        const vao = x1 > AB.x0 - 30 && x0 < AB.x1 + 30;
        if (!vao && x1 - x0 > 10 && h > 8) {
          ped += rr(x0 + 1.5, y + 1.5, x1 - x0 - 3, h - 3, 7);
          luz += `M${n(x0 + 7)},${n(y + 4.5)} L${n(x1 - 9)},${n(y + 4.5)}`;
          som += `M${n(x0 + 7)},${n(y + h - 4)} L${n(x1 - 6)},${n(y + h - 4)}`;
          if (rnd() < .16) mus += elipse(x0 + (x1 - x0) * .3, y + h - 4, (x1 - x0) * .28, 4);
          if (rnd() < .25) liq += elipse(x0 + (x1 - x0) * rnd(), y + 6 + rnd() * (h - 12), 3 + rnd() * 3, 2 + rnd() * 2);
        }
        x += w;
      }
      y += h;
    }
    // ombreiras e verga em blocos grandes
    let omb = '', ombL = '';
    let yy = AB.y0 + 4;
    let alt = 0;
    while (yy < AB.chao - 4) {
      const h = Math.min(56 + rnd() * 30, AB.chao - yy), sai = alt++ % 2 ? 10 : 0;
      omb += rr(AB.x0 - 30 - sai, yy, 30 + sai, h - 2, 5) + rr(AB.x1, yy, 30 + sai, h - 2, 5);
      ombL += `M${AB.x0 - 26 - sai},${n(yy + 4)} L${AB.x0 - 26 - sai},${n(yy + h - 8)} M${AB.x1 + 4},${n(yy + 4)} L${AB.x1 + 4},${n(yy + h - 8)}`;
      yy += h;
    }
    const lixo = (() => { let d = ''; const r2 = semente(111); for (let i = 0; i < 26; i++) { const x = 890 + r2() * 240, yv = 768 + r2() * 14, a = (r2() - .5) * 2.4; d += `M${n(x)},${n(yv)} l${n(12 * Math.cos(a))},${n(4 * Math.sin(a))}`; } return d; })();
    return `<g class="vc-estab">
      <path d="M1182,770 C1240,772 1300,778 1340,786 L1182,788 Z" fill="#1E3A10" opacity=".22"/>
      <path d="${FACHADA} ${ABERTURA}" fill-rule="evenodd" fill="#7A756A" stroke="${COR.cont}" stroke-width="2.5"/>
      <path d="${ped}" fill="url(#${p}granito)"/>
      <path d="${som}" stroke="#6A655A" stroke-width="2.4" opacity=".55" stroke-linecap="round"/>
      <path d="${luz}" stroke="#F4F0E6" stroke-width="2" opacity=".7" stroke-linecap="round"/>
      <path d="${mus}" fill="#6E9A3E" opacity=".75"/><path d="${liq}" fill="#D8D49A" opacity=".7"/>
      <path d="${omb}" fill="url(#${p}granito)" stroke="#5E594E" stroke-width="2"/>
      <path d="${ombL}" stroke="#F4F0E6" stroke-width="2.4" opacity=".6" stroke-linecap="round"/>
      <path d="${rr(AB.x0 - 44, 380, AB.x1 - AB.x0 + 88, 30, 6)}" fill="url(#${p}granito)" stroke="#5E594E" stroke-width="2"/>
      <path d="M${AB.x0 - 38},386 L${AB.x1 + 38},386" stroke="#F4F0E6" stroke-width="2.4" opacity=".7" stroke-linecap="round"/>
      <path d="M${AB.x0 - 30},406 L${AB.x1 + 30},406" stroke="#4A463E" stroke-width="2" opacity=".5"/>
      <path d="${rr(AB.x0 - 14, 764, AB.x1 - AB.x0 + 28, 12, 4)}" fill="#A8A398" stroke="#5E594E" stroke-width="1.6"/>
      ${telhadoSVG(p)}
      <path d="M1136,768 L1166,470 M1160,476 L1150,440 M1166,470 L1166,436 M1172,478 L1182,444 M1150,462 L1180,468" stroke="#5E4A30" stroke-width="4" stroke-linecap="round"/>
      <path d="M1137,764 L1164,476" stroke="#B89A70" stroke-width="1.6" opacity=".7"/>
      <path d="${lixo}" stroke="#E9C878" stroke-width="2" stroke-linecap="round" opacity=".9"/>
      <g class="vc-cancelaG">${cancelaSVG(p, 'vc-cancela')}</g>
    </g>`;
  }

  /* --- Bichos e partículas dos acontecimentos --- */
  function gaivotasSVG() {
    return [0, 1].map(i => `<path class="vc-gaivota${i}" d="M-14,0 Q-7,-7 0,0 Q7,-7 14,0" stroke="#5A6470" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join('');
  }
  function fumoSVG() { return [0, 1, 2].map(i => `<circle class="vc-fumo${i}" r="7" fill="#EEF2F4" opacity="0"/>`).join(''); }
  function alveolaSVG() {
    // alvéola-cinzenta (abana a cauda): a origem fica nos pés
    return `<g class="vc-alv" display="none"><g class="vc-alvIn">
      <g class="vc-alvCauda"><path d="M-8,-12 L-32,-16 L-32,-11 L-8,-8 Z" fill="#2A2A2E"/><path d="M-30,-15.5 L-30,-11.5" stroke="#FFFFFF" stroke-width="1.6"/></g>
      <path d="M-1,-6 L-2,0 M4,-6 L5,0" stroke="#2A2A2E" stroke-width="1.4"/>
      <ellipse cx="0" cy="-13" rx="11" ry="7" fill="#9AA0A8"/>
      <path d="M-4,-9 C2,-7 8,-9 11,-13 C8,-7 2,-5 -5,-6 Z" fill="#F4E27A"/>
      <path d="M3,-17 C6,-15 10,-15 12,-17 L12,-11 C8,-9 4,-10 3,-13 Z" fill="#1E1E22"/>
      <circle cx="11" cy="-21" r="6" fill="#F4F4F4"/><path d="M6,-25 C9,-28 14,-28 17,-25 L16,-23 C13,-25 9,-25 6,-23 Z" fill="#6E747C"/>
      <circle cx="13" cy="-21.5" r="1.4" fill="#111111"/><path d="M16.5,-20.5 L22,-20 L16.5,-19 Z" fill="#222222"/>
      <g class="vc-alvAsa"><path d="M-6,-15 C-2,-19 8,-19 6,-13 C2,-11 -4,-12 -6,-15 Z" fill="#5E646C"/></g>
    </g></g>`;
  }
  function raSVG() {
    return `<g class="vc-ra" display="none"><g class="vc-raIn">
      <ellipse cx="0" cy="2" rx="16" ry="4" fill="#1E3A1A" opacity=".3"/>
      <path d="M-14,0 C-16,-8 -10,-14 0,-14 C10,-14 16,-8 14,0 Z" fill="#5E9A3A" stroke="#2E5A1E" stroke-width="1.6"/>
      <path d="M-8,-9 C-4,-11 4,-11 8,-9" stroke="#8ACC5A" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse class="vc-raPapo" cx="4" cy="-3" rx="6" ry="4" fill="#E6E8A0" opacity=".9"/>
      <circle cx="-5" cy="-14" r="4.2" fill="#6EAA44" stroke="#2E5A1E" stroke-width="1.4"/><circle cx="7" cy="-14" r="4.2" fill="#6EAA44" stroke="#2E5A1E" stroke-width="1.4"/>
      <circle cx="-5" cy="-14.5" r="2" fill="#1A1A10"/><circle cx="7" cy="-14.5" r="2" fill="#1A1A10"/>
      <path d="M-14,0 C-20,2 -22,0 -18,-4 M14,0 C20,2 22,0 18,-4" stroke="#2E5A1E" stroke-width="2" fill="none" stroke-linecap="round"/></g></g>
      <ellipse class="vc-anel" display="none" rx="1" ry="1" fill="none" stroke="#F0FAFF" stroke-width="2.4"/>`;
  }
  function borboletaSVG() {
    return `<g class="vc-borb" display="none">
      <g class="vc-borbA1"><path d="M0,0 C-6,-14 -20,-18 -22,-8 C-23,-2 -12,2 0,0 Z M0,0 C-10,4 -16,12 -10,15 C-5,17 -1,8 0,0 Z" fill="#F6C83A" stroke="#9A6A10" stroke-width="1.2"/><circle cx="-13" cy="-8" r="2.2" fill="#E07A20"/></g>
      <g class="vc-borbA2"><path d="M0,0 C6,-14 20,-18 22,-8 C23,-2 12,2 0,0 Z M0,0 C10,4 16,12 10,15 C5,17 1,8 0,0 Z" fill="#FADA5A" stroke="#9A6A10" stroke-width="1.2"/><circle cx="13" cy="-8" r="2.2" fill="#E07A20"/></g>
      <path d="M0,-6 L0,8" stroke="#3A2A1A" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M0,-6 C-2,-12 -5,-14 -7,-15 M0,-6 C2,-12 5,-14 7,-15" stroke="#3A2A1A" stroke-width="1" fill="none"/></g>`;
  }
  function moscaSVG() {
    return `<g class="vc-mosca" display="none"><g transform="scale(1.3)">
      <ellipse class="vc-asaM" cx="-3" cy="-6" rx="7" ry="3.6" fill="#E8F0F8" opacity=".7" stroke="#9AA6B2" stroke-width=".6" transform="rotate(-28)"/>
      <ellipse class="vc-asaM" cx="2" cy="-6" rx="7" ry="3.6" fill="#E8F0F8" opacity=".7" stroke="#9AA6B2" stroke-width=".6" transform="rotate(22)"/>
      <ellipse cx="0" cy="0" rx="6.5" ry="4.3" fill="#2C2A30"/><circle cx="6.5" cy="-1" r="3.6" fill="#3A3640"/><circle cx="8" cy="-2" r="1.7" fill="#B8323A"/></g></g>`;
  }
  function particulasSVG() {
    let s = '';
    for (let i = 0; i < 10; i++) s += `<path class="vc-pa" display="none" d="M-7,0 L7,0" stroke="#EBCB78" stroke-width="2.4" stroke-linecap="round"/>`;
    for (let i = 0; i < 6; i++) s += `<path class="vc-er" display="none" d="M-5,0 Q0,-3 5,0" stroke="#4E9428" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    for (let i = 0; i < 8; i++) s += `<ellipse class="vc-po" display="none" rx="9" ry="6" fill="#CDBE8E"/>`;
    for (let i = 0; i < 8; i++) s += `<circle class="vc-gt" display="none" r="3.2" fill="#E8F6FF"/>`;
    return s;
  }

  /* ================= 5) Ícone do menu (retrato parado, sem gradientes nem recortes com id) ================= */
  function iconeSVG() {
    const C = COR.cont;
    const E = estadoCabeca(Object.assign({}, CAB0, { Y: -.28, F: .96, beta: 50, sorriso: 1, oE: 2, oD: -2 }));
    const cab = cabecaSVG('vaca-', E, true);
    return `<circle cx="110" cy="110" r="106" fill="#86C854"/><path d="M4,110 A106,106 0 0 1 216,110 Z" fill="#A6D6F2"/>
      <path d="M4.3,124 C50,100 100,108 140,100 C170,94 196,104 215.8,116 A106,106 0 0 1 207.3,152 L12.7,152 A106,106 0 0 1 4.3,124 Z" fill="#A2C892"/>
      <path d="M7.8,138 C60,130 150,134 214.1,130 A106,106 0 0 1 207.3,152 L12.7,152 A106,106 0 0 1 7.8,138 Z" fill="#74B44A"/>
      <g fill="#6E8FE0"><circle cx="26" cy="146" r="9"/><circle cx="42" cy="142" r="8"/><circle cx="180" cy="144" r="9"/><circle cx="196" cy="149" r="8"/></g>
      <g fill="#A08AD8"><circle cx="34" cy="153" r="7"/><circle cx="188" cy="154" r="7"/></g>
      <circle cx="110" cy="110" r="106" fill="none" stroke="#5E9A3A" stroke-width="3"/>
      <path d="M58,198 C64,170 78,146 90,128 L132,128 C144,146 156,170 162,198 A106,106 0 0 1 58,198 Z" fill="${C}" stroke="${C}" stroke-width="7" stroke-linejoin="round"/>
      <path d="M58,198 C64,170 78,146 90,128 L132,128 C144,146 156,170 162,198 A106,106 0 0 1 58,198 Z" fill="#FBF8F2"/>
      <path d="M134,148 C148,158 156,176 160,198 C142,200 130,188 127,172 C126,162 128,152 134,148 Z" fill="${COR.malha}"/>
      <path d="M78,166 C98,178 124,178 144,166 L146,178 C124,190 98,190 76,178 Z" fill="#8A5A2E" stroke="#3E2610" stroke-width="2"/>
      <g transform="translate(111,174) scale(.85)"><path d="M-10,9 L10,9 C11,19 14,30 18,38 L-18,38 C-14,30 -11,19 -10,9 Z" fill="#D9A040" stroke="#5E3E10" stroke-width="2.4" stroke-linejoin="round"/>
        <ellipse cy="38" rx="18" ry="4.5" fill="#A87424" stroke="#5E3E10" stroke-width="2"/><circle cy="43" r="4.5" fill="#5A3A10"/><path d="M-5,13 C-6,21 -9,29 -12,35" stroke="#FFF2C0" stroke-width="2.2" fill="none" opacity=".75" stroke-linecap="round"/></g>
      <g transform="translate(110,94) scale(.92)">${cab}</g>`;
  }

  /* ================= 6) montar() ================= */
  // Pose de repouso (fora): de pé, a 3/4 virada para a direita e para nós, a cara a olhar para a criança
  const REP = { X: 590, Z: 0, th: .62 };
  const APROX = { x: 975, z: 80 };                   // onde se vira para a porta (cascos a y ≤ 812)
  const DENTRO = { x: 932, z: -262, th: PI / 2 - .4 };
  const ENTRADA = { x: PORTA.x, z: -250 };           // fim do passo pela porta (depois vira-se e chega-se para a esquerda)
  const ALT_DEIT = -122;                             // o tronco desce até à barriga tocar no feno
  const CORPO0 = { alt: 0, incl: 0, nA: 24, nC: -7, nY: 0, nTh: 0, cTurn: .66, cB: 50, cRoll: 0, fAbre: 0, fAvanca: 0 };
  const ROSTO0 = { olhos: 1, feliz: 0, oE: 0, oD: 0, orelhas: 0, boca: 0, sobr: 0, nariz: 0, sorriso: .5, olhoEsc: 1, lingua: 0, linguaX: 0, vesgo: 0 };
  const CAUDA_0 = { cauA: 0, cauAmp: 5, cauVel: .3, cauLado: 0 };
  const DEITADO = { nA: 42, nC: -6, nY: 0, nTh: 0, cTurn: PI / 2 - DENTRO.th - .12, cB: 42, cRoll: 0 };
  const PASSO = { D: 150, beta: .7, alt: 22, ordem: { tE: 0, fE: .25, tD: .5, fD: .75 } };   // passo a 4 tempos
  const HORT = [[0, -20, 380, 604, .9], [1, 520, 860, 604, .9], [2, 1180, 1620, 604, .9], [3, 1320, 1660, 904, 2.5]];

  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .4 : 1;
    const p = 'vaca-';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.innerHTML = `<defs>${defsVaca(p)}${defsCena(p)}</defs>
      <rect width="1600" height="660" fill="url(#${p}ceu)"/>
      <circle cx="190" cy="150" r="420" fill="url(#${p}solBrilho)"/>
      <circle cx="190" cy="150" r="46" fill="url(#${p}sol)"/>
      <g class="vc-nuvens">${nuvemSVG(0, 1)}${nuvemSVG(1, .7)}${nuvemSVG(2, .85)}${nuvemSVG(3, .55)}</g>
      <g class="vc-gaivotas">${gaivotasSVG()}</g>
      ${colinasSVG(p)}
      <g class="vc-fumos">${fumoSVG()}</g>
      ${HORT.slice(0, 3).map(h => hortensiasSVG(...h)).join('')}
      ${muroSVG(p)}
      ${alveolaSVG()}
      ${lameiroSVG(p)}
      ${riachoSVG(p)}
      ${arvoreSVG(p)}
      ${raSVG()}
      ${fetoSVG(0, 196, 690, .7, false)}${fetoSVG(1, 236, 880, 1.1, true)}
      <g class="vc-habitat">
        <g class="vc-estabTras">${estabTrasSVG(p)}</g>
        <g class="vc-estabFrente">${estabFrenteSVG(p)}</g>
        ${vacaSVG(p)}
      </g>
      ${borboletaSVG()}${moscaSVG()}
      <g class="vc-particulas">${particulasSVG()}</g>
      ${hortensiasSVG(...HORT[3])}
      ${ervaFrenteSVG(0, 30, 906, 1.1, false)}${ervaFrenteSVG(1, 330, 912, .9, true)}${ervaFrenteSVG(2, 520, 908, .7, false)}${ervaFrenteSVG(3, 1180, 910, .8, true)}${ervaFrenteSVG(4, 820, 914, .55, false)}${ervaFrenteSVG(5, 1600, 900, .9, true)}
      <rect width="1600" height="900" fill="url(#${p}luzQuente)" pointer-events="none"/>
      <rect width="1600" height="900" fill="url(#${p}vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s), qa = s => Array.from(svg.querySelectorAll(s));
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function poeT(lista, v) { for (const e of lista) poe(e, v); }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; if (v == null) el.removeAttribute(nome); else el.setAttribute(nome, v); } }

    /* --- referências --- */
    const R = {
      habitat: q('.vc-habitat'), vaca: q('.vc-vaca'), corpo: q('.vc-corpo'), sombra: q('.vc-sombra'),
      tronco: q('.vc-tronco'), troncoR: q('.vc-troncoR'), peito: q('.vc-peito'), garupa: q('.vc-garupa'),
      pernasTras: q('.vc-pernasTras'), pernasFrente: q('.vc-pernasFrente'), ubere: q('.vc-ubere'),
      cauda: q('.vc-cauda'), slotCT: q('.vc-slotCaudaT'), slotCF: q('.vc-slotCaudaF'), caudaC: q('.vc-caudaC'), caudaF: q('.vc-caudaF'), tufo: q('.vc-tufo'),
      frente: q('.vc-frente'), slotPT: q('.vc-slotPescT'), slotPF: q('.vc-slotPescF'),
      pc: Array.from({ length: N_PESC }, (_, i) => qa('.vc-pc' + i)), pj: Array.from({ length: N_PESC }, (_, i) => qa('.vc-pj' + i)),
      barbela: q('.vc-barbela'), barbelaC: q('.vc-barbelaC'), sino: q('.vc-sino'), badalo: q('.vc-badalo'),
      cab: q('.vc-cab'), orelhasT: q('.vc-orelhasT'), orelhasF: q('.vc-orelhasF'),
      copia: q('.vc-copia'), fenoC: q('.vc-fenoC'), sombraDentro: q('.vc-sombraDentro'), cancela: q('.vc-cancela'), cancelaC: q('.vc-cancelaC'),
      nuvens: [0, 1, 2, 3].map(i => q('.vc-nuvem' + i)), gaivotas: [0, 1].map(i => q('.vc-gaivota' + i)),
      nevoa: [q('.vc-nevoa0'), q('.vc-nevoa1')], fumo: [0, 1, 2].map(i => q('.vc-fumo' + i)),
      ondas: q('.vc-ondas'), brilhos: q('.vc-brilhos'), copa: q('.vc-copa'),
      horts: HORT.map(h => q('.vc-hort' + h[0] + ' .vc-hortIn')), ervas: Array.from({ length: 6 }, (_, i) => q('.vc-erva' + i + ' .vc-ervaIn')),
      fetos: [0, 1].map(i => q('.vc-feto' + i + ' .vc-fetoIn')),
      alv: q('.vc-alv'), alvIn: q('.vc-alvIn'), alvCauda: q('.vc-alvCauda'), alvAsa: q('.vc-alvAsa'),
      ra: q('.vc-ra'), raIn: q('.vc-raIn'), raPapo: q('.vc-raPapo'), anel: q('.vc-anel'),
      borb: q('.vc-borb'), borbA1: q('.vc-borbA1'), borbA2: q('.vc-borbA2'), mosca: q('.vc-mosca'), asasM: qa('.vc-asaM')
    };
    const H = {};
    const CHAVES_T = ['cornoE', 'cornoD', 'orelhaE', 'orelhaD', 'mancha', 'topete', 'narE', 'narD', 'bochE', 'bochD', 'olhoE', 'olhoD', 'irisE', 'irisD', 'sobrE', 'sobrD', 'bocaInt'];
    const CHAVES_OP = ['olhoE', 'olhoD', 'narE', 'narD', 'bochE', 'bochD', 'sobrE', 'sobrD'];
    for (const k of CHAVES_T) H[k] = q('.vc-' + k);
    H.rosto = q('.vc-rosto'); H.rostoC = q('.vc-rostoC'); H.lingua = q('.vc-linguaG'); H.linguaP = q('.vc-lingua');
    H.ponte = [q('.vc-ponteC'), q('.vc-ponte')]; H.foc = [q('.vc-focC'), q('.vc-foc')]; H.queixo = [q('.vc-queixoC'), q('.vc-queixo')];
    H.ponteR = [q('.vc-ponteCr'), q('.vc-ponteR')]; H.boca = q('.vc-boca');
    H.palp = ['E', 'D'].map(k => ({ s: q('.vc-palpS' + k), i: q('.vc-palpI' + k), c: q('.vc-cil' + k) }));
    const pernaEl = PERNAS.map(pe => ({
      g: q('.vc-' + pe.id), sup: qa(`.vc-${pe.id}-sup`), inf: qa(`.vc-${pe.id}-inf`), joe: qa(`.vc-${pe.id}-joe`), bol: qa(`.vc-${pe.id}-bol`), casco: qa(`.vc-${pe.id}-casco`),
      sombra: q('.vc-sp-' + pe.id)
    }));

    /* --- estado --- */
    const P = Object.assign({ X: REP.X, Z: REP.Z, th: REP.th, nAw: 0, cBw: 0, cTurnG: 0, cBG: 0, olharX: 0, olharY: 0, respA: 1, respF: .2,
      mastX: 0, mastY: 0, somB: 0, somR: 0, somN: 0, pele: 0, porta: 0, ubereW: 0 }, CORPO0, ROSTO0, CAUDA_0);
    let modo = 'fora', reagindo = false, tempo = 0, vivo = true;
    let recortar = false;                                   // a vaca está (ou vai estar) para lá do plano da porta
    const fase = { resp: 0, cauda: 0 };
    let cabMundo = [0, 0], cabY = .5, bocaMundo = [0, 0], narMundo = [0, 0], focMundo = [0, 0], garupaMundo = [0, 0];
    const pes = PERNAS.map(pe => ({ pe, x: 0, z: 0, y: 0, inc: 0 }));
    const peDe = id => pes.find(f => f.pe.id === id);
    function restPe(pe, X, Z, th) {
      const u = pe.pu + (pe.fr ? P.fAvanca : 0), v = pe.v + pe.lado * (pe.fr ? P.fAbre : 0);
      return [X + ESC * (u * Math.cos(th) - v * Math.sin(th)), Z + ESC * (u * Math.sin(th) + v * Math.cos(th))];
    }
    // cascos dobrados por baixo do corpo quando está deitada (escondidos pelo feno e pela cancela)
    function restDeitado(pe) {
      const u = pe.fr ? 64 : -70, v = pe.v * 1.5, c = Math.cos(P.th), s = Math.sin(P.th);
      return [P.X + u * c - v * s, P.Z + u * s + v * c];
    }
    function assentarPes() { for (const f of pes) { const r = restPe(f.pe, P.X, P.Z, P.th); f.x = r[0]; f.z = r[1]; f.y = 0; f.inc = 0; } }
    assentarPes();

    /* --- impulsos curtos (orelhas, cauda, cabeça, cancela, chocalho) --- */
    const impulsos = [];
    const IMP = { twE: 0, twD: 0, flick: 0, cabR: 0, porta: 0, sino: 0 };
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
    // molas: o chocalho e o úbere baloiçam quando o ponto onde estão presos muda de velocidade
    const molaS = { a: 0, v: 0, ultimo: null, vf: 0 }, molaU = { a: 0, v: 0, ultimo: null, vf: 0 };
    function molaPasso(m, x, dt, K, C, G, lim) {
      const h = Math.min(dt, 50) / 1000;
      if (h <= 0) return;
      if (m.ultimo == null) { m.ultimo = x; m.vf = 0; }
      const vel = (x - m.ultimo) / h; m.ultimo = x;
      m.vf += (vel - m.vf) * (1 - Math.exp(-h / .18));
      m.v += (-K * m.a - C * m.v - limita(vel - m.vf, -1500, 1500) * G) * h;
      m.a = limita(m.a + m.v * h, -lim, lim);
    }

    /* --- desenhar: lê P e põe as transformações em todas as peças --- */
    let ordemPernas = '', caudaNaFrente = false, pescocoAtras = false, orelhaFrente = null;
    const tr = (x, y, r) => `translate(${n(x)},${n(y)}) rotate(${n(r)})`;
    function desenhar(dt = 0) {
      const th = P.th, c = Math.cos(th), s = Math.sin(th);
      const resp = Math.sin(fase.resp) * P.respA;
      const altT = P.alt + resp * .9;
      const ci = Math.cos(P.incl), si = Math.sin(P.incl);
      const W = (u, v, h) => { const uu = u * ci; return [P.X + ESC * (uu * c - v * s), P.Z + ESC * (uu * s + v * c), ESC * (h + altT + u * si)]; };
      const T = w => [w[0], CHAO - w[2] + KZ * w[1]];

      // tronco (perfil projetado) + tremor da pele
      const c0 = T(W(0, 0, HC)), c1 = T(W(1, 0, HC));
      const fx = c1[0] - c0[0], fy = c1[1] - c0[1];
      const trem = P.pele ? Math.sin(tempo * .09) * P.pele : 0;
      poe(R.tronco, `matrix(${n3(fx)},${n3(fy)},0,${ESC},${n(c0[0] + trem)},${n(c0[1])})`);
      poe(R.troncoR, `scale(1,${n3(1 + .016 * resp)})`);
      atr(R.tronco, 'opacity', n3(passoS(.1, .38, Math.abs(c))));      // de frente/costas o perfil some-se (fica o peito ou a garupa)
      const wF = 1 - passoS(.3, .86, Math.abs(c));
      if (wF > .02 && s > 0) {
        const pc = T(W(124, 0, HC + 4));
        atr(R.peito, 'display', 'inline'); atr(R.garupa, 'display', 'none');
        poe(R.peito, `translate(${n(pc[0])},${n(pc[1])}) scale(${n3(wF * ESC)},${n3(ESC * (1 + .012 * resp))})`);
      } else if (wF > .02) {
        const pg = T(W(-150, 0, HC + 12));
        atr(R.garupa, 'display', 'inline'); atr(R.peito, 'display', 'none');
        poe(R.garupa, `translate(${n(pg[0] + trem)},${n(pg[1])}) scale(${n3(wF * ESC)},${ESC})`);
      } else { atr(R.peito, 'display', 'none'); atr(R.garupa, 'display', 'none'); }
      garupaMundo = T(W(-120, 0, HC + 70));

      // patas: IK no plano de cada pata, cascos onde estão plantados
      const sg = c >= 0 ? 1 : -1, hx = sg * (.55 + .45 * Math.abs(c));
      const atras = [], frente = [];
      pes.forEach((f, i) => {
        const pe = f.pe, J = W(pe.u, pe.v, pe.h), A = [f.x, f.z, f.y + ESC * TORNOZELO];
        const dx = A[0] - J[0], dz = A[1] - J[1], dh = A[2] - J[2];
        const du = dx * c + dz * s, dv = -dx * s + dz * c;
        const L1 = ESC * pe.L1, L2 = ESC * pe.L2;
        const d = Math.hypot(du, dh) || .01, dd = limita(d, Math.abs(L1 - L2) + 2, L1 + L2 - .4);
        const base = Math.atan2(dh, du);
        const a1 = base + pe.dobra * Math.acos(limita((L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd), -1, 1));
        const ku = L1 * Math.cos(a1), kh = L1 * Math.sin(a1), au = du * dd / d, ah = dh * dd / d;
        const fr = pe.L1 / (pe.L1 + pe.L2);
        const K = [J[0] + ku * c - dv * fr * s, J[1] + ku * s + dv * fr * c, J[2] + kh];
        const An = [J[0] + au * c - dv * s, J[1] + au * s + dv * c, J[2] + ah];
        const Js = T(J), Ks = T(K), As = T(An);
        const e = pernaEl[i];
        const l1 = Math.hypot(Ks[0] - Js[0], Ks[1] - Js[1]), l2 = Math.hypot(As[0] - Ks[0], As[1] - Ks[1]);
        poeT(e.sup, `${tr(Js[0], Js[1], Math.atan2(Ks[1] - Js[1], Ks[0] - Js[0]) / RAD)} scale(${n3(Math.max(.05, l1 / pe.L1))},${n3(ESC * sg)})`);
        poeT(e.inf, `${tr(Ks[0], Ks[1], Math.atan2(As[1] - Ks[1], As[0] - Ks[0]) / RAD)} scale(${n3(Math.max(.05, l2 / pe.L2))},${n3(ESC * sg)})`);
        poeT(e.joe, `translate(${n(Ks[0])},${n(Ks[1])}) scale(${ESC})`);
        poeT(e.bol, `translate(${n(As[0])},${n(As[1])}) scale(${ESC})`);
        poeT(e.casco, `translate(${n(As[0])},${n(As[1])}) rotate(${n(f.inc * sg)}) scale(${n3(ESC * hx)},${ESC})`);
        const no = pe.v * c + pe.u * s * .25 > 0;
        (no ? frente : atras).push([J[1], i]);
        const gy = CHAO + KZ * f.z, al = limita(f.y / 40, 0, 1);
        poe(e.sombra, `translate(${n(f.x + 6)},${n(gy + 2)}) scale(${n3(ESC * (1 - al * .5))})`);
        atr(e.sombra, 'opacity', n3(1 - al * .7));
      });
      atras.sort((a, b) => a[0] - b[0]); frente.sort((a, b) => a[0] - b[0]);
      const chave = atras.map(a => a[1]).join('') + '|' + frente.map(a => a[1]).join('');
      if (chave !== ordemPernas) {
        ordemPernas = chave;
        for (const [, i] of atras) R.pernasTras.appendChild(pernaEl[i].g);
        for (const [, i] of frente) R.pernasFrente.appendChild(pernaEl[i].g);
      }

      // úbere com mola (e balanço do andar)
      {
        const a = T(W(-84, 0, HC - 70));
        molaPasso(molaU, a[0], dt, 90, 6, 1.2, 22);
        poe(R.ubere, `translate(${n(a[0])},${n(a[1])}) rotate(${n(molaU.a + P.ubereW)}) scale(${n3(.78 + .22 * Math.abs(c))},${n3(1 + .02 * resp)})`);
      }

      // pescoço e cabeça atrás do tronco quando está de costas
      const querPT = pescocoAtras ? s < -.12 : s < -.3;
      if (querPT !== pescocoAtras) { pescocoAtras = querPT; (querPT ? R.slotPT : R.slotPF).appendChild(R.frente); }

      // cauda: cadeia 3D a partir do alto da garupa (pendurada, com onda; abana para os lados) e tufo na ponta
      const querCF = caudaNaFrente ? s < .3 : s < .2;
      if (querCF !== caudaNaFrente) { caudaNaFrente = querCF; (querCF ? R.slotCF : R.slotCT).appendChild(R.cauda); }
      atr(R.cauda, 'opacity', n3(1 - passoS(.5, .78, s)));             // de frente a cauda fica escondida atrás do corpo
      {
        let w = W(CAUDA0.u, 0, CAUDA0.h);
        const pts = [T(w)];
        const bkx = -c, bkz = -s, lvx = -s, lvz = c;
        for (let i = 0; i < NCA; i++) {
          const u = i / (NCA - 1);
          const e = (48 - P.cauA + u * 40 + 3 * Math.sin(fase.cauda * .5 - i * .4)) * RAD;
          const lat = (P.cauAmp * Math.sin(fase.cauda - i * .55) * (.2 + .8 * u) + IMP.flick * u + P.cauLado * (.3 + .7 * u)) * RAD;
          const hc = Math.cos(e), cl = Math.cos(lat), sl = Math.sin(lat);
          w = [w[0] + LCA * ESC * hc * (bkx * cl + lvx * sl), w[1] + LCA * ESC * hc * (bkz * cl + lvz * sl), w[2] - LCA * ESC * Math.sin(e)];
          pts.push(T(w));
        }
        const d = curvaPor(pts, false);
        atr(R.caudaC, 'd', d); atr(R.caudaF, 'd', d);
        const a = pts[NCA - 1], b = pts[NCA];
        poe(R.tufo, `translate(${n(b[0])},${n(b[1])}) rotate(${n(Math.atan2(b[1] - a[1], b[0] - a[0]) / RAD)})`);
      }

      // pescoço
      let w = W(PESC0.u, 0, PESC0.h);
      const pts = [T(w)];
      for (let i = 0; i < N_PESC; i++) {
        const a = (P.nA + P.nAw * (1 - i / N_PESC * .5) + i * P.nC + P.somN * 10) * RAD + P.incl, g = th + P.nTh + i * P.nY;
        const L = ESC * LS;
        w = [w[0] + L * Math.cos(a) * Math.cos(g), w[1] + L * Math.cos(a) * Math.sin(g), w[2] + L * Math.sin(a)];
        pts.push(T(w));
      }
      for (let i = 0; i < N_PESC; i++) {
        const A = pts[i], B = pts[i + 1], len = Math.hypot(B[0] - A[0], B[1] - A[1]) || .01;
        poeT(R.pc[i], `${tr(A[0], A[1], Math.atan2(B[1] - A[1], B[0] - A[0]) / RAD)} scale(${n3(Math.max(.08, len / LS))},${ESC})`);
        if (i > 0) poeT(R.pj[i], `translate(${n(A[0])},${n(A[1])}) scale(${ESC})`);
      }
      // a «baixo» do pescoço no ecrã (garganta): perpendicular ao pescoço virada para +y
      let gx = -(pts[N_PESC][1] - pts[0][1]), gyv = pts[N_PESC][0] - pts[0][0];
      const gl = Math.hypot(gx, gyv);
      if (gyv < 0) { gx = -gx; gyv = -gyv; }
      const kg = limita(gl / 70, 0, 1);
      gx = gl ? gx / gl * kg : 0; gyv = (gl ? gyv / gl : 1) * kg + (1 - kg);
      // chocalho preso à coleira, com mola
      {
        const A = pts[1], B = pts[2], r = (WN[2] / 2 - 4) * ESC, m = .55;
        const ax = lerp(A[0], B[0], m) + gx * r, ay = lerp(A[1], B[1], m) + gyv * r + (1 - kg) * 14;
        molaPasso(molaS, ax, dt, 70, 4.5, 2.4, 50);
        const ang = molaS.a + IMP.sino;
        poe(R.sino, `translate(${n(ax)},${n(ay)}) rotate(${n(ang)}) scale(${ESC})`);
        poe(R.badalo, `translate(${n(limita(-molaS.v * .03, -6, 6))},0)`);
      }
      // barbela: pele que pende da garganta até ao peito
      {
        const r2 = (WN[N_PESC] / 2 - 8) * ESC;
        const H0 = [pts[N_PESC][0] + gx * r2, pts[N_PESC][1] + gyv * r2];
        const C0 = T(W(150, 0, HC - 26));
        const mx = (H0[0] + C0[0]) / 2, my = (H0[1] + C0[1]) / 2;
        const sag = (24 + 3 * resp) * ESC, sw = molaS.a * .4;
        const dBarb = `M${n(H0[0])},${n(H0[1])} Q${n(mx + sw)},${n(my + sag)} ${n(C0[0])},${n(C0[1])} Q${n(mx)},${n(my - 16)} ${n(H0[0])},${n(H0[1])} Z`;
        atr(R.barbela, 'd', dBarb); atr(R.barbelaC, 'd', dBarb);
      }

      // cabeça
      const psi = th + P.nTh + (N_PESC - 1) * P.nY + P.cTurn + P.cTurnG;
      const Y = Math.cos(psi), F = Math.sin(psi);
      cabY = Y;
      const top = pts[N_PESC];
      const beta = P.cB + P.cBG + P.cBw - P.somN * 28;
      const hxm = top[0] + ESC * Y * 12, hym = top[1] - ESC * 8;
      cabMundo = [hxm, hym];
      const rot = P.cRoll + P.somR + IMP.cabR;
      poe(R.cab, `translate(${n(hxm)},${n(hym)}) scale(${ESC}) rotate(${n(rot)})`);
      const fecho = limita(1 - P.olhos * (1 - piscar) + .3 * P.somN * P.somB, 0, 1);
      const E = estadoCabeca({ Y, F, beta, oE: P.oE + IMP.twE, oD: P.oD + IMP.twD, orelhas: P.orelhas - P.somN * 8, fecho, feliz: P.feliz, sobr: P.sobr,
        boca: Math.max(P.boca, P.somB * .9), mastX: P.mastX, mastY: P.mastY, olharX: P.olharX, olharY: P.olharY, vesgo: P.vesgo,
        nariz: Math.max(P.nariz, P.somB * .7), sorriso: P.sorriso, olhoEsc: P.olhoEsc, lingua: P.lingua, linguaX: P.linguaX });
      for (const k of CHAVES_T) poe(H[k], E.t[k]);
      for (const k of CHAVES_OP) atr(H[k], 'opacity', String(E.op[k]));
      atr(H.rosto, 'opacity', String(E.op.rosto)); atr(H.rostoC, 'opacity', String(E.op.rosto));
      poeT(H.ponte, E.t.ponte); poeT(H.foc, E.t.foc); poeT(H.queixo, E.t.queixo);
      atr(H.ponteR[0], 'width', String(E.a.ponteL)); atr(H.ponteR[1], 'width', String(E.a.ponteL));
      atr(H.boca, 'd', E.d.boca);
      atr(H.bocaInt, 'ry', String(E.a.bocaRy)); atr(H.bocaInt, 'rx', String(E.a.bocaRx));
      H.palp.forEach(e => { atr(e.s, 'd', E.d.palpS); atr(e.i, 'd', E.d.palpI); atr(e.c, 'd', E.d.cil); });
      atr(H.lingua, 'opacity', E.op.lingua);
      if (P.lingua > .03) { poe(H.lingua, E.t.lingua); atr(H.linguaP, 'd', E.d.lingua); }
      // a orelha do lado de cá passa à frente do crânio quando a cabeça está de perfil
      const querOF = Y > .55 ? 'E' : Y < -.55 ? 'D' : null;
      if (querOF !== orelhaFrente) {
        orelhaFrente = querOF;
        for (const k of ['E', 'D']) (k === querOF ? R.orelhasF : R.orelhasT).appendChild(H['orelha' + k]);
      }
      const rr2 = rot * RAD, cr = Math.cos(rr2), sr = Math.sin(rr2);
      const paraMundo = (x, y) => [hxm + ESC * (x * cr - y * sr), hym + ESC * (x * sr + y * cr)];
      bocaMundo = paraMundo(E.a.bocaFrente[0], E.a.bocaFrente[1]);
      narMundo = paraMundo(E.a.narinas[0], E.a.narinas[1]);
      focMundo = paraMundo(E.a.focTopo[0], E.a.focTopo[1]);

      // sombra no chão (a luz vem da esquerda: a sombra cai um pouco para a direita)
      const g0 = T([P.X, P.Z, 0]);
      poe(R.sombra, `translate(${n(g0[0] + 30)},${n(g0[1] + 4)}) scale(${n(ESC * (90 + 130 * Math.abs(c)))},${n(ESC * 28)})`);

      // cancela (real e cópia) e recortes do curral
      const ph = (P.porta * 108 + IMP.porta) * RAD;
      const mp = `matrix(${n3(Math.cos(ph))},${n3(Math.sin(ph) * KZ)},0,1,${AB.x0},0)`;
      poe(R.cancela, mp); poe(R.cancelaC, mp);
      const clip = recortar ? `url(#${p}${P.Z < PORTA.z - 110 ? 'recorteDentro' : 'recorte'})` : null;
      atr(R.corpo, 'clip-path', clip); atr(R.frente, 'clip-path', clip);
      atr(R.copia, 'display', recortar ? 'inline' : 'none');
      if (recortar) {
        atr(R.sombraDentro, 'opacity', n3(.18 * passoS(PORTA.z + 40, DENTRO.z, P.Z)));
        atr(R.fenoC, 'display', P.Z < -190 ? 'inline' : 'none');      // o feno só tapa as patas quando já estão para lá dele
      }
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
      const u = pisca.f / 240;
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
      const kO = 1 - Math.exp(-dt / 60), kC = 1 - Math.exp(-dt / (olhar.rapido ? 110 : 280));
      P.olharX += (ax - P.olharX) * kO; P.olharY += (ay - P.olharY) * kO;
      P.cTurnG += (aT - P.cTurnG) * kC; P.cBG += (aB - P.cBG) * kC;
    }
    const tiques = { orelha: aleat(2000, 5000), cauda: aleat(3000, 7000) };
    function atualizarTiques(dt) {
      tiques.orelha -= dt; tiques.cauda -= dt;
      if (tiques.orelha <= 0) {
        tiques.orelha = aleat(1800, 5000);
        impulso(Math.random() < .5 ? 'twE' : 'twD', aleat(-26, -14), aleat(260, 380));
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
    const base = () => modo === 'dentro' ? DEITADO : sem(CORPO0, 'fAbre', 'fAvanca');

    /* --- pés: um passo (levanta, avança em arco, pousa) e recompor os pés fora do sítio --- */
    function* passo1(f, alvo, ms, alt = 22) {
      const x0 = f.x, z0 = f.z, y0 = f.y;
      yield* durante(ms, u => {
        const e = eseno(u);
        f.x = lerp(x0, alvo[0], e); f.z = lerp(z0, alvo[1], e); f.y = lerp(y0, 0, e) + sino(u) * alt * ESC; f.inc = -sino(u) * 22;
      });
      f.y = 0; f.inc = 0;
    }
    function* recomporPes(ms = 280) {
      const fora = pes.filter(f => { const r = restPe(f.pe, P.X, P.Z, P.th); return f.y > .5 || Math.hypot(f.x - r[0], f.z - r[1]) > 3; });
      if (!fora.length) return;
      const lado = l => fora.filter(f => f.pe.lado === l);
      for (const grupo of [lado(1), lado(-1)]) {
        if (!grupo.length) continue;
        yield* juntos(...grupo.map((f, i) => (function* () { yield* espera(i * 40); yield* passo1(f, restPe(f.pe, P.X, P.Z, P.th), ms, 20); })()));
      }
    }
    function* pisarPara(ids, ms) {
      for (const id of ids) { const f = peDe(id); yield* passo1(f, restPe(f.pe, P.X, P.Z, P.th), ms, 20); }
    }

    /* --- virar no sítio: a cabeça adianta-se, o corpo roda, as patas pisam aos pares --- */
    function* virar(th1, ms) {
      const th0 = P.th;
      const thEm = u => lerp(th0, th1, eio(limita(u, 0, 1)));
      const plano = [['tE', 0, .34, .5], ['fD', .02, .36, .5], ['tD', .24, .6, .76], ['fE', .26, .62, .76], ['tE', .5, .84, 1], ['fD', .52, .86, 1], ['tD', .64, .98, 1], ['fE', .66, 1, 1]]
        .map(([id, a, b, ua]) => ({ f: peDe(id), a, b, ua, de: null, para: null, feito: false }));
      const nTh0 = P.nTh;
      yield* durante(ms, u => {
        P.th = thEm(u);
        P.nTh = nTh0 * (1 - u) + (thEm(u + .22) - P.th) * .9;
        P.alt = -4 * Math.sin(u * PI * 4) ** 2 * sino(u);
        for (const st of plano) {
          if (u < st.a || st.feito) continue;
          if (!st.de) { st.de = [st.f.x, st.f.z]; st.para = restPe(st.f.pe, P.X, P.Z, thEm(st.ua)); }
          const v = limita((u - st.a) / (st.b - st.a), 0, 1);
          st.f.x = lerp(st.de[0], st.para[0], eseno(v)); st.f.z = lerp(st.de[1], st.para[1], eseno(v)); st.f.y = sino(v) * 26 * ESC; st.f.inc = -sino(v) * 22;
          if (v >= 1) { st.feito = true; st.f.y = 0; st.f.inc = 0; }
        }
      });
      P.nTh = 0; P.alt = 0;
    }

    /* --- andar a passo em linha reta: cada casco planta-se num ponto do mundo (por distância) --- */
    function perfilAndar(u, a = .2) {
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
    function* andarPara(x1, z1, ms, G, assentar = true) {
      const x0 = P.X, z0 = P.Z, dx = x1 - x0, dz = z1 - z0, total = Math.hypot(dx, dz) || 1, ux = dx / total, uz = dz / total;
      const base0 = pes.map(f => [f.x, f.z]);
      yield* durante(ms, u => {
        const d = total * perfilAndar(u);
        P.X = x0 + ux * d; P.Z = z0 + uz * d;
        const m = Math.min(suave(limita(u / .14, 0, 1)), suave(limita((1 - u) / .14, 0, 1)));
        pes.forEach((f, i) => {
          const r = pePasso(d, G.ordem[f.pe.id], total, G);
          f.x = base0[i][0] + ux * r.F; f.z = base0[i][1] + uz * r.F; f.y = r.alt * G.alt * ESC; f.inc = -r.alt * 22;
        });
        const ph = d / G.D * TAU;
        P.alt = -3 * Math.cos(2 * ph) * m;
        P.nAw = 4 * Math.sin(2 * ph + .7) * m;          // a cabeça acena a cada passo
        P.cBw = -3 * Math.sin(2 * ph + .2) * m;
        P.cauLado = 10 * Math.sin(ph) * m;
        P.ubereW = 7 * Math.sin(ph + .5) * m;
      });
      P.nAw = 0; P.cBw = 0; P.alt = 0; P.cauLado = 0; P.ubereW = 0;
      const fora = pes.filter(f => { const r = restPe(f.pe, P.X, P.Z, P.th); return Math.hypot(f.x - r[0], f.z - r[1]) > 3 || f.y > .5; });
      if (assentar && fora.length) yield* juntos(...fora.map((f, i) => (function* () { yield* espera(i * 50); yield* passo1(f, restPe(f.pe, P.X, P.Z, P.th), 200, 14); })()));
    }
    /* --- deitar (joelhos da frente primeiro, depois a traseira) e levantar (traseira primeiro) --- */
    function* deitar(ms) {
      const ini = pes.map(f => [f.x, f.z]), alvo = pes.map(f => restDeitado(f.pe));
      const cau0 = P.cauA;
      yield* durante(ms, u => {
        const a = eio(limita(u / .55, 0, 1)), b = eio(limita((u - .3) / .7, 0, 1));
        P.incl = -.18 * a * (1 - b);
        P.alt = ALT_DEIT * (.45 * a + .55 * b);
        pes.forEach((f, i) => { const w = f.pe.fr ? a : b; f.x = lerp(ini[i][0], alvo[i][0], w); f.z = lerp(ini[i][1], alvo[i][1], w); f.y = sino(w) * 8; f.inc = 0; });
        P.cauA = lerp(cau0, 16, b);
      });
      P.incl = 0;
      soltar('pa', P.X - 40, 700, 4, { vy: -.18 }); soltar('pa', P.X + 50, 702, 3, { vy: -.16 }); soltar('po', P.X, 736, 4);
    }
    function* levantar(ms, th1, x1 = P.X) {
      const ini = pes.map(f => [f.x, f.z]), th0 = P.th, alt0 = P.alt, cau0 = P.cauA, x0 = P.X;
      const alvo = pes.map(f => restPe(f.pe, x1, P.Z, th1));
      yield* durante(ms, u => {
        P.X = lerp(x0, x1, eio(u));
        const a = eio(limita(u / .55, 0, 1)), b = eio(limita((u - .35) / .65, 0, 1));
        P.incl = -.2 * a * (1 - b);
        P.alt = alt0 * (1 - .55 * a - .45 * b);
        P.th = lerp(th0, th1, eio(u));
        pes.forEach((f, i) => { const w = f.pe.fr ? b : a; f.x = lerp(ini[i][0], alvo[i][0], w); f.z = lerp(ini[i][1], alvo[i][1], w); f.y = sino(w) * 10; f.inc = 0; });
        P.cauA = lerp(cau0, 0, a);
      });
      P.incl = 0; P.alt = 0; P.th = th1; P.cauA = 0;
      for (const f of pes) f.y = 0;
    }

    /* --- partículas: palhas, ervas arrancadas, pó, gotas de água --- */
    const parts = [];
    for (const tipo of ['pa', 'er', 'po', 'gt']) qa('.vc-' + tipo).forEach(el => parts.push({ el, tipo, vivo: false }));
    function soltar(tipo, x, y, k, o = {}) {
      for (let i = 0; i < k; i++) {
        const f = parts.find(e => e.tipo === tipo && !e.vivo); if (!f) return;
        Object.assign(f, { vivo: true, x: x + aleat(-14, 14), y: y + aleat(-4, 4), vx: aleat(-.06, .06) + (o.vx || 0), vy: aleat(-.05, 0) + (o.vy || 0), r: aleat(0, 180), t: 0,
          chao: o.chao || y + aleat(20, 60), pousada: false, fase: aleat(0, 6), dur: tipo === 'po' ? aleat(600, 1000) : 900 });
        atr(f.el, 'display', 'inline'); atr(f.el, 'opacity', '1');
      }
    }
    function animarParticulas(dt) {
      for (const f of parts) {
        if (!f.vivo) continue;
        f.t += dt;
        if (f.tipo === 'po') {
          f.x += f.vx * dt; f.y += f.vy * dt * .5;
          const u = f.t / f.dur;
          if (u >= 1) { f.vivo = false; atr(f.el, 'display', 'none'); continue; }
          poe(f.el, `translate(${n(f.x)},${n(f.y)}) scale(${n3(.5 + u * 1.3)})`); atr(f.el, 'opacity', n3(.5 * (1 - u)));
        } else if (f.tipo === 'gt') {
          f.vy += dt * .0012; f.x += f.vx * dt; f.y += f.vy * dt;
          if (f.y > f.chao) { f.vivo = false; atr(f.el, 'display', 'none'); continue; }
          poe(f.el, `translate(${n(f.x)},${n(f.y)})`);
        } else if (!f.pousada) {
          f.vy = Math.min(.09, f.vy + dt * .0004);
          f.x += (f.vx + Math.sin(f.t * .005 + f.fase) * .04) * dt; f.y += f.vy * dt; f.r += dt * .2;
          if (f.y >= f.chao && f.vy > 0) { f.y = f.chao; f.pousada = true; f.t = 0; f.r = (f.r % 180) * .1; }
          poe(f.el, `translate(${n(f.x)},${n(f.y)}) rotate(${n(f.r + 30 * Math.sin(f.t * .006))})`);
        } else {
          atr(f.el, 'opacity', n3(limita(1 - f.t / 1200, 0, 1)));
          if (f.t > 1200) { f.vivo = false; atr(f.el, 'display', 'none'); }
        }
      }
    }
    // um comportamento interrompido limpa o que criou (mosca, borboleta, língua, tremor)
    function limparComportamento() {
      atr(R.mosca, 'display', 'none'); atr(R.borb, 'display', 'none');
      P.pele = 0; P.cauLado = 0; P.cauAmp = CAUDA_0.cauAmp; P.cauVel = CAUDA_0.cauVel; P.vesgo = 0; P.lingua = 0; P.mastX = 0; P.mastY = 0;
    }

    /* --- comportamentos: 8 diferentes fora, ao acaso a cada 4–9 s, sem repetir --- */
    function* recompor(ms = 420) {
      yield* recomporPes();
      yield* tw(Object.assign({}, CORPO0, ROSTO0, { mastX: 0, mastY: 0 }), ms);
    }
    function* mastigar(ms, forca = 1) {          // ruminar: o maxilar mói de lado
      yield* durante(ms, (u, t) => {
        const k = forca * Math.min(1, t / 250, (ms - t) / 250);
        const f = t / 1000 * TAU * 1.4;
        P.mastX = Math.sin(f) * 6 * k; P.mastY = (1 - Math.cos(2 * f)) * 1.4 * k; P.boca = .04 * k + Math.max(0, Math.sin(2 * f)) * .06 * k;
      });
      P.mastX = 0; P.mastY = 0; P.boca = 0;
    }
    function* pastar() {                       // baixa o pescoço até à erva, arranca tufos e mastiga
      P.fAvanca = 22;
      yield* juntos(pisarPara(['fE'], 320), tw({ nA: -58, nC: -6, cB: 86, cTurn: .12, incl: -.06, alt: -12, oE: 10, oD: 10 }, 1300, eio));
      for (let i = 0; i < 3; i++) {
        yield* tw({ boca: .3, cB: 90 }, 220);
        yield* juntos(tw({ boca: 0, cB: 82, nAw: 6 }, 200, esai), (function* () { yield* espera(120); soltar('er', bocaMundo[0], bocaMundo[1] + 4, 2, { chao: bocaMundo[1] + 40 }); })());
        yield* juntos(mastigar(1000), tw({ nAw: 0 }, 400));
        if (Math.random() < .5) impulso('flick', 26, 700, 'onda');
      }
      impulso(Math.random() < .5 ? 'twE' : 'twD', -22, 320);
      yield* tw(Object.assign({}, base(), { oE: 0, oD: 0 }), 1200, eio);
      P.fAvanca = 0;
      yield* pisarPara(['fE'], 300);
    }
    function* ruminar() {                      // olhos meio fechados, contente, o maxilar a moer de lado
      const B = base();
      yield* tw({ olhos: .62, feliz: .3, orelhas: -6, cTurn: B.cTurn + .12, cB: B.cB + 4, sorriso: .9 }, 600);
      yield* juntos(mastigar(4200, 1), (function* () { yield* espera(1800); impulso('twE', -16, 300); yield* espera(900); impulso('flick', 22, 700, 'onda'); })());
      yield* tw({ olhos: 1, feliz: 0, orelhas: 0, cTurn: B.cTurn, cB: B.cB, sorriso: ROSTO0.sorriso }, 600);
    }
    function* abanarOrelhas() {                // abana as orelhas depressa (e o chocalho tilinta)
      const B = base();
      yield* tw({ olhos: .85, cB: B.cB - 4 }, 200);
      yield* durante(1500, (u, t) => {
        const e = sino(u);
        P.oE = 34 * Math.sin(t * .04) * e; P.oD = -34 * Math.sin(t * .04 + .8) * e;
        P.cRoll = 7 * Math.sin(t * .022) * e; P.olhos = 1 - .45 * e;
      });
      impulso('sino', 14, 800, 'mola');
      yield* tw({ oE: 0, oD: 0, cRoll: 0, olhos: 1, cB: B.cB }, 400);
    }
    function* lamberFocinho() {                // a língua sai e lambe uma narina e depois a outra
      const B = base();
      yield* tw({ cB: B.cB - 6, olhos: .8 }, 300);
      for (const lado of [-1, 1]) {
        yield* tw({ boca: .3 }, 160);
        yield* durante(760, u => { const e = sino(u); P.lingua = e; P.linguaX = lado * (.3 + .7 * e); P.boca = .3 + .1 * e; P.vesgo = .55 * e; });
        P.lingua = 0; P.vesgo = 0;
        yield* tw({ boca: 0 }, 160);
      }
      impulso('twD', -14, 300);
      yield* tw({ cB: B.cB, olhos: 1, linguaX: 0 }, 300);
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
        yield* durante(440, () => { tt += 16; voar(.06, garupaMundo[0] + lado * 30, garupaMundo[1] - 50); mosca(); });
        yield* durante(420, u => { tt += 16; voar(.06, garupaMundo[0] + lado * 30, garupaMundo[1] - 50); mosca(); P.cauLado = 70 * lado * sino(u); P.cauA = 30 * sino(u); P.pele = 3 * sino(u); });
      }
      P.cauLado = 0; P.cauA = 0; P.pele = 0;
      olhar.foco = null;
      impulso('twE', 24, 300);
      yield* durante(1400, () => { tt += 16; ev.x += 4; ev.y -= 3; mosca(); });
      atr(R.mosca, 'display', 'none');
    }
    function* borboleta() {                    // uma borboleta vem à cabeça, pousa no focinho (vesga!) e um espirro manda-a embora
      const b = { x: -40, y: 240, a: 0 };
      atr(R.borb, 'display', 'inline');
      const pinta = abre => { poe(R.borb, `translate(${n(b.x)},${n(b.y)}) rotate(${n(b.a)}) scale(1.5)`); const f = n3(.15 + .85 * abre); poe(R.borbA1, `scale(${f},1)`); poe(R.borbA2, `scale(${f},1)`); };
      olhar.foco = () => [b.x, b.y]; olhar.cabeca = true;
      yield* tw({ orelhas: 10, olhoEsc: 1.06 }, 300);
      const c0 = cabMundo.slice();
      const pts = [[-40, 240], [200, 300], [c0[0] - 240, c0[1] - 150], [c0[0] - 70, c0[1] - 170], [c0[0] + 80, c0[1] - 90], [focMundo[0] + 10, focMundo[1] - 40]];
      yield* durante(4200, (u, t) => { const [x, y] = catmull(pts, eseno(u)); b.a = limita((x - b.x) * 3, -25, 25); b.x = x; b.y = y + 8 * Math.sin(t * .006); pinta(Math.abs(Math.sin(t * .03))); });
      yield* durante(500, (u, t) => { b.x = lerp(b.x, focMundo[0], .25); b.y = lerp(b.y, focMundo[1] - 2, .25); b.a = 0; pinta(Math.abs(Math.sin(t * .02))); });
      olhar.cabeca = false; olhar.foco = () => focMundo;
      yield* durante(1900, (u, t) => { b.x = focMundo[0]; b.y = focMundo[1] - 2; pinta(.5 + .5 * Math.cos(t * .004)); P.vesgo = Math.min(1, t / 300); P.nariz = .35 * Math.max(0, Math.sin(t * .012)); P.sobr = .6; });
      yield* tw({ nariz: 1, olhos: .3 }, 260);
      impulso('cabR', -10, 400); impulso('sino', 20, 900, 'mola');
      P.vesgo = 0;
      const sx = b.x, sy = b.y;
      olhar.foco = () => [b.x, b.y]; olhar.cabeca = true;
      yield* juntos(tw({ nariz: 0, olhos: 1, sobr: 0 }, 300), durante(3200, (u, t) => { b.x = sx + 900 * u * u + 60 * Math.sin(t * .004); b.y = sy - 380 * esai(u) + 20 * Math.sin(t * .007); b.a = 20; pinta(Math.abs(Math.sin(t * .035))); }));
      atr(R.borb, 'display', 'none');
      olhar.foco = null;
      yield* tw(Object.assign({}, base(), { orelhas: 0, olhoEsc: 1, vesgo: 0, sobr: 0 }), 600);
    }
    function* mugirLeve() {                    // um «muu» baixinho, sem som: levanta a cabeça e abre a boca devagar
      const B = base();
      yield* tw({ nA: B.nA + 8, cB: B.cB - 16, cTurn: B.cTurn - .1, orelhas: -6 }, 500);
      impulso('sino', 10, 800, 'mola');
      yield* durante(1400, u => { const e = u < .45 ? eseno(u / .45) : u > .75 ? 1 - eseno((u - .75) / .25) : 1; P.boca = .55 * e; P.nariz = .4 * e; P.olhos = 1 - .4 * e; });
      P.boca = 0; P.nariz = 0;
      yield* tw({ nA: B.nA, cB: B.cB, cTurn: B.cTurn, orelhas: 0, olhos: 1 }, 500);
    }
    const PT = { crianca: [800, 640], porta: [1006, 520], casa: [1338, 450], arvore: [150, 430], riacho: [200, 760], muro: [330, 590] };
    const gaivotaPos = [[0, 0], [0, 0]];
    function* olharEmVolta() {                 // olha para a casa, a árvore, o riacho e uma gaivota, com as orelhas atrás
      const alvos = [() => PT.casa, () => PT.arvore, () => PT.riacho, () => gaivotaPos[0]].sort(() => Math.random() - .5).slice(0, 3);
      for (const a of alvos) {
        const dir = a()[0] > cabMundo[0] ? 1 : -1;
        olhar.foco = a; olhar.cabeca = Math.random() < .7;
        impulso(dir > 0 ? 'twD' : 'twE', -18, 300);
        yield* espera(aleat(900, 1400));
      }
      olhar.foco = null; olhar.cabeca = true;
      yield* tw({ orelhas: 6 }, 300); yield* tw({ orelhas: 0 }, 400);
    }
    function* sonolento() {                    // os olhos fecham devagar, a cabeça descai… e acorda com as orelhas
      const B = base();
      yield* tw({ olhos: .35, orelhas: -8, cB: B.cB + 10, nA: B.nA - 8 }, 1200, eseno);
      yield* tw({ olhos: .08 }, 900, eseno);
      yield* espera(700);
      impulso('twD', -22, 300); impulso('sino', 8, 600, 'mola');
      yield* tw({ olhos: 1, orelhas: 6, cB: B.cB, nA: B.nA, olhoEsc: 1.05 }, 300, esai);
      yield* tw({ orelhas: 0, olhoEsc: 1 }, 400);
    }
    function* olharCrianca() {                 // vira a cara para nós, inclina-a e pisca os olhos, contente
      yield* tw({ cTurn: PI / 2 - P.th + .04, cB: 56, nA: 28, olhoEsc: 1.08, orelhas: 10, sobr: .6 }, 900, eio);
      yield* tw({ cRoll: 12, sobr: 1 }, 380);
      yield* tw({ olhos: .06, feliz: .5 }, 360, eseno); yield* espera(160); yield* tw({ olhos: 1, feliz: 0 }, 400, eseno);
      yield* juntos(tw({ nariz: .7 }, 240), espera(400)); yield* tw({ nariz: 0 }, 240);
      yield* tw({ cRoll: -10 }, 520);
      impulso('twE', -20, 300); impulso('sino', 10, 700, 'mola'); yield* espera(500);
      yield* tw({ cRoll: 0, sorriso: 1 }, 380);
      yield* espera(500);
      yield* tw(Object.assign({}, base(), { olhoEsc: 1, orelhas: 0, sobr: 0, sorriso: ROSTO0.sorriso }), 900, eio);
    }
    const COMPORTAMENTOS = { pastar, ruminar, caudaMoscas, abanarOrelhas, lamberFocinho, borboleta, mugirLeve, olharCrianca };
    const COMP_DENTRO = { ruminar, abanarOrelhas, lamberFocinho, mugirLeve, sonolento, olharEmVolta };
    let ultimoComp = null;
    function* cicloFora() {
      for (;;) {
        yield* espera(aleat(4000, 9000));
        let nome; do nome = escolhe(Object.keys(COMPORTAMENTOS)); while (nome === ultimoComp);
        ultimoComp = nome;
        yield* COMPORTAMENTOS[nome]();
      }
    }

    /* --- reação ao toque (fora): orelhas para cima, olhos contentes, cara para nós, um pulinho e o chocalho --- */
    function* reacaoFora() {
      reagindo = true;
      impulso('flick', 40, 700, 'onda'); impulso('sino', 26, 1000, 'mola');
      const rosto = tw({ orelhas: 18, oE: 0, oD: 0, feliz: 1, olhos: 1, sobr: .8, sorriso: 1, boca: 0, olhoEsc: 1.08, lingua: 0, vesgo: 0 }, 100, esai);
      const corpo = (function* () {
        if (pes.some(f => f.y > .5) || P.fAvanca > 1 || P.fAbre > 1) { P.fAbre = 0; P.fAvanca = 0; }
        yield* juntos(recomporPes(200), tw(Object.assign({}, CORPO0, { nA: CORPO0.nA + 10, cB: CORPO0.cB - 12, cTurn: PI / 2 - P.th }), 240, esai));
        yield* durante(900, u => { P.alt = -9 * sino((u * 2) % 1) * (1 - u * .5); P.cRoll = 9 * Math.sin(u * PI * 2) * (1 - u * .5); P.nAw = 6 * Math.sin(u * PI * 4) * (1 - u); });
        P.nAw = 0; P.alt = 0;
        yield* tw({ cRoll: 0 }, 220);
      })();
      yield* juntos(rosto, corpo);
      yield* espera(200);
      reagindo = false;
      yield* tw(Object.assign({}, ROSTO0, CORPO0), 500);
    }
    function* cicloDentro() {
      for (;;) {
        yield* espera(aleat(1200, 2600));
        let nome; do nome = escolhe(Object.keys(COMP_DENTRO)); while (nome === ultimoComp);
        ultimoComp = nome;
        yield* COMP_DENTRO[nome]();
        yield* tw(DEITADO, 300);
      }
    }
    function* reacaoDentro() {                 // deitada no feno: levanta a cabeça, orelhas para cima, olhos contentes
      impulso('sino', 22, 900, 'mola'); impulso('flick', 30, 700, 'onda');
      yield* tw({ orelhas: 18, feliz: .8, olhos: 1, sobr: .8, boca: 0, lingua: 0, vesgo: 0, mastX: 0, mastY: 0 }, 100, esai);
      yield* tw(Object.assign({}, DEITADO, { nA: DEITADO.nA + 12, cB: DEITADO.cB - 10 }), 300, esai);
      olhar.foco = () => [cabMundo[0] - 30, 780];
      yield* durante(900, u => { P.cRoll = 10 * Math.sin(u * PI * 2) * (1 - u * .5); P.nAw = 5 * Math.sin(u * PI * 3) * (1 - u); });
      P.nAw = 0;
      impulso('porta', 3, 600, 'mola'); soltar('pa', P.X, 700, 2, { vy: -.15 });
      yield* tw({ olhos: .1, feliz: .9 }, 260, eseno); yield* tw({ olhos: 1, feliz: .3 }, 300, eseno);
      olhar.foco = null;
      yield* tw(Object.assign({}, DEITADO, { orelhas: 0, feliz: 0, sobr: 0, cRoll: 0 }), 600, eio);
    }

    /* --- ida ao curral: vira-se, vai a passo até à porta, vira-se para ela, a cancela abre, entra, vira-se lá dentro,
           a cancela fecha e baloiça, deita-se no feno --- */
    function* ida() {
      modo = 'indo'; reagindo = false;
      if (P.fAbre > 1 || P.fAvanca > 1) { P.fAbre = 0; P.fAvanca = 0; }
      olhar.foco = () => PT.porta; olhar.rapido = true;
      yield* juntos(recomporPes(140), tw(Object.assign({}, ROSTO0, sem(CORPO0, 'cTurn', 'fAbre', 'fAvanca'), { orelhas: 10 }), 140, esai));
      const thA = Math.atan2(APROX.z - P.Z, APROX.x - P.X);
      yield* juntos(virar(thA, 280), tw({ cTurn: 0, nA: 20 }, 280));
      olhar.rapido = false; olhar.foco = null;
      yield* juntos(andarPara(APROX.x, APROX.z, 980, PASSO, false), tw({ nA: 18, cB: 58 }, 980));
      const thP = Math.atan2(ENTRADA.z - P.Z, ENTRADA.x - P.X);
      yield* juntos(virar(thP, 460), tw({ porta: 1 }, 440, eio), tw({ nA: 6, nC: -4, cB: 72, cTurn: 0 }, 460));
      impulso('porta', -6, 500, 'mola');
      recortar = true;
      yield* juntos(andarPara(ENTRADA.x, ENTRADA.z, 700, PASSO, false), tw({ nA: 4, cB: 74 }, 700));
      yield* juntos(virar(DENTRO.th, 480), tw({ X: DENTRO.x, Z: DENTRO.z }, 300), tw({ nA: 30, nC: -6, cB: 50, cTurn: DEITADO.cTurn }, 480), (function* () { yield* tw({ porta: 0 }, 380, eentra);
        impulso('porta', 8, 800, 'mola'); soltar('pa', AB.x0 + 40, 690, 3, { vy: -.2, vx: -.05 }); soltar('po', 1000, 772, 3); })());
      yield* juntos(deitar(600), tw(Object.assign({}, DEITADO, ROSTO0, { orelhas: 8 }), 600));
      impulso('twE', -16, 400); impulso('sino', 12, 800, 'mola');
      modo = 'dentro';
    }
    /* --- volta: levanta-se (traseira primeiro), a cancela abre, sai de frente, abana a cabeça, vira-se e volta --- */
    function* volta() {
      modo = 'voltando'; reagindo = false;
      yield* juntos(levantar(520, PI / 2, PORTA.x), tw(Object.assign({}, ROSTO0, { nA: 22, nC: -6, nY: 0, nTh: 0, cTurn: 0, cB: 56, cRoll: 0, boca: 0, mastX: 0, mastY: 0 }), 520),
        (function* () { yield* espera(220); yield* tw({ porta: 1 }, 300, eio); })());
      yield* juntos(andarPara(PORTA.x, APROX.z, 640, PASSO, false), tw({ nA: 20, cB: 54, cTurn: .2 }, 640));
      recortar = false;
      const thV = Math.atan2(REP.Z - P.Z, REP.X - P.X) + TAU;
      yield* juntos(virar(thV, 380), tw({ porta: 0 }, 380, eio), (function* () { yield* espera(260); impulso('porta', 5, 500, 'mola'); })(),
        durante(380, u => { P.cRoll = 12 * Math.sin(u * PI * 3) * sino(u); P.oE = 20 * sino(u); P.oD = 20 * sino(u); }));
      impulso('sino', 18, 900, 'mola');
      P.cRoll = 0; P.oE = 0; P.oD = 0;
      yield* andarPara(REP.X, REP.Z, 820, PASSO, false);
      yield* juntos(virar(REP.th, 500), tw(Object.assign({}, CORPO0, ROSTO0), 500));
      P.th = REP.th;
      modo = 'fora';
    }

    /* --- som: «muuu» — levanta a cabeça, estica o focinho e abre a boca devagar por sílaba --- */
    function* somBoca(ms, silabas) {
      let lista = Array.isArray(silabas) && silabas.length ? silabas : null;
      if (!lista) { const s = ms / 1000; lista = [[0, s * .92]]; }
      const fim = Math.max(...lista.map(([a, d]) => a + Math.max(d, .2))) * 1000;
      impulso('sino', 12, 900, 'mola');
      yield* durante(fim + 420, (u, t) => {
        const ts = t / 1000;
        P.somN = t < 380 ? eseno(t / 380) : t > fim ? 1 - eseno(limita((t - fim) / 420, 0, 1)) : 1;
        let b = 0, r = 0;
        lista.forEach(([a, d], k) => {
          const D = Math.max(d, .2), v = (ts - a) / D;
          if (v < 0 || v > 1) return;
          const ab = v < .45 ? eseno(v / .45) : v > .78 ? 1 - eseno((v - .78) / .22) : 1;
          b = Math.max(b, (k ? .85 : 1) * ab);
          r += (k % 2 ? -1 : 1) * 4 * Math.sin(v * PI);
        });
        P.somB = b; P.somR = r;
      });
      P.somB = 0; P.somR = 0; P.somN = 0;
    }

    /* --- cenário vivo e acontecimentos raros --- */
    function animarCena() {
      const t = tempo / 1000;
      R.nuvens.forEach((g, i) => {
        const v = [6, 4, 5, 3][i], y = [110, 190, 236, 150][i], x0 = [300, 900, 1300, 640][i];
        poe(g, `translate(${n(-260 + ((x0 + 260 + t * v * calma) % 2120))},${y})`);
      });
      R.gaivotas.forEach((g, i) => {
        const x = i ? 1720 - ((t * 20 * calma + 900) % 1840) : -120 + ((t * 26 * calma + 300) % 1840), y = i ? 300 + 18 * Math.sin(t * .5 + 1) : 236 + 24 * Math.sin(t * .4);
        gaivotaPos[i] = [x, y];
        const bate = Math.sin(t * .7 + i * 2) > .2;
        poe(g, `translate(${n(x)},${n(y)}) scale(${i ? -.9 : 1},${n3(bate ? .45 + .6 * Math.abs(Math.sin(t * 5 + i)) : .8)})`);
      });
      R.nevoa.forEach((g, i) => { poe(g, `translate(${n((30 * Math.sin(t * .05 + i * 2) + 20 * Math.sin(t * .11 + i)) * calma)},0)`); atr(g, 'opacity', n3(.75 + .25 * Math.sin(t * .2 + i * 1.7))); });
      R.fumo.forEach((g, i) => {
        const f = (t * .16 + i / 3) % 1;
        poe(g, `translate(${n(CHAMINE[0] + 22 * f + 4 * Math.sin(t + i))},${n(CHAMINE[1] - 70 * f)}) scale(${n3(.5 + 1.6 * f)})`);
        atr(g, 'opacity', n3(.6 * (1 - f) * Math.min(1, f * 6)));
      });
      atr(R.ondas, 'stroke-dashoffset', String(n(-t * 34 * calma)));
      atr(R.brilhos, 'stroke-dashoffset', String(n(-t * 52 * calma)));
      const rajada = .6 + .4 * Math.sin(t * .3);
      R.horts.forEach((g, i) => { const h = HORT[i]; poe(g, `rotate(${n3((1.2 * Math.sin(t * .8 + i * 1.3) + .5 * Math.sin(t * 1.9 + i)) * rajada * calma)},${n((h[1] + h[2]) / 2)},${h[3]})`); });
      poe(R.copa, `rotate(${n3((.6 * Math.sin(t * .7) + .3 * Math.sin(t * 1.5)) * calma)},150,600)`);
      R.ervas.forEach((g, i) => poe(g, `rotate(${n3((2.4 * Math.sin(t * 1.1 + i * .9) + 1.4 * Math.sin(t * 2.3 + i * 2)) * rajada * calma)})`));
      R.fetos.forEach((g, i) => poe(g, `rotate(${n3((2 * Math.sin(t * .9 + i * 1.7) + 1 * Math.sin(t * 2.1 + i)) * rajada * calma)})`));
    }
    const eventos = { prox: aleat(9000, 15000), ultimo: null };
    function iniciarEvento(tipo) {
      const ev = { tipo, x: -100, y: -100, vivo: true };
      ev.pos = () => [ev.x, ev.y];
      const gen = { alveola: evAlveola, ra: evRa }[tipo](ev);
      lancar('evento', gen, () => { ev.vivo = false; });
      if (modo === 'fora' && !reagindo) lancar('corpo', observar(ev), () => lancar('corpo', cicloFora()));
      else if (modo === 'dentro') { impulso('twE', -22, 400); impulso('twD', -18, 400); }
    }
    function atualizarEventos(dt) {
      if (faixas.has('evento')) return;
      eventos.prox -= dt;
      if (eventos.prox > 0) return;
      eventos.prox = aleat(15000, 40000);
      if (modo !== 'fora' && modo !== 'dentro') { eventos.prox = 3000; return; }
      const lista = ['alveola', 'ra'];
      let tipo; do tipo = escolhe(lista); while (tipo === eventos.ultimo && Math.random() < .7);
      eventos.ultimo = tipo;
      iniciarEvento(tipo);
    }
    function* observar(ev) {
      reagindo = false;
      yield* recompor(380);
      olhar.foco = ev.pos;
      yield* tw({ orelhas: 12, olhoEsc: 1.05 }, 260, esai);
      let t = 0, prox = 900;
      while (ev.vivo && t < 14000) {
        t += yield;
        if (t > prox) {
          prox = t + aleat(1000, 1900);
          if (Math.random() < .5) impulso('flick', 26, 700, 'onda');
          impulso(Math.random() < .5 ? 'twE' : 'twD', -18, 280);
        }
      }
      olhar.foco = null;
      yield* tw({ orelhas: 0, olhoEsc: 1, olhos: 1 }, 500);
    }
    function* evAlveola(ev) {                  // uma alvéola pousa no muro, dá pulinhos a abanar a cauda e vai-se embora
      atr(R.alv, 'display', 'inline');
      const voo = function* (pts, ms) {
        const dir = pts[pts.length - 1][0] >= pts[0][0] ? 1 : -1;
        yield* durante(ms, (u, t) => {
          const [x, y] = catmull(pts, eseno(u));
          ev.x = x; ev.y = y;
          poe(R.alv, `translate(${n(x)},${n(y)}) scale(${dir * .9},.9)`);
          poe(R.alvAsa, `translate(0,-15) scale(1,${n3(Math.sin(t * .05) * 1.8)}) translate(0,15)`);
        });
        poe(R.alvAsa, 'translate(0,0)');
      };
      yield* voo([[-40, 300], [120, 380], [250, 520], [330, 600]], 2600);
      let x = 330;
      for (let i = 0; i < 4; i++) {
        yield* durante(700, (u, t) => { poe(R.alvCauda, `rotate(${n(14 * Math.sin(t * .03))},-8,-10)`); ev.x = x; ev.y = 600; poe(R.alv, `translate(${n(x)},600) scale(.9,.9)`); });
        if (i === 2) yield* durante(600, u => poe(R.alvIn, `rotate(${n(28 * sino(u * 2 % 1))},8,-6)`));
        poe(R.alvIn, 'rotate(0)');
        const x0 = x; x += 22;
        yield* durante(260, u => { ev.x = lerp(x0, x, u); ev.y = 600 - 14 * sino(u); poe(R.alv, `translate(${n(ev.x)},${n(ev.y)}) scale(.9,.9)`); });
      }
      yield* voo([[x, 600], [x + 120, 480], [700, 300], [1100, 180], [1720, 120]], 3600);
      atr(R.alv, 'display', 'none');
    }
    function* evRa(ev) {                       // uma rã salta do riacho para uma pedra, coaxa (papo) e mergulha
      const pedra = [PEDRA_RA[0], PEDRA_RA[1] - 4];
      const anel = function* (x, y, ms) {
        atr(R.anel, 'display', 'inline');
        yield* durante(ms, u => { poe(R.anel, `translate(${n(x)},${n(y)})`); atr(R.anel, 'rx', n(4 + 34 * esai(u))); atr(R.anel, 'ry', n(2 + 10 * esai(u))); atr(R.anel, 'opacity', n3(.9 * (1 - u))); });
        atr(R.anel, 'display', 'none');
      };
      const salto = function* (de, para, ms, alt) {
        yield* durante(ms, u => { ev.x = lerp(de[0], para[0], u); ev.y = lerp(de[1], para[1], u) - alt * sino(u); poe(R.ra, `translate(${n(ev.x)},${n(ev.y)}) scale(.9)`); poe(R.raIn, `rotate(${n(-18 * Math.cos(u * PI))})`); });
        poe(R.raIn, 'rotate(0)');
      };
      const agua = [pedra[0] - 46, pedra[1] + 30];
      atr(R.ra, 'display', 'inline');
      soltar('gt', agua[0], agua[1], 4, { vy: -.35, chao: agua[1] + 6 });
      yield* juntos(salto(agua, pedra, 600, 44), anel(agua[0], agua[1] + 4, 900));
      for (let i = 0; i < 3; i++) {
        yield* durante(520, u => poe(R.raPapo, `translate(4,-3) scale(${n3(1 + 1.3 * sino(u))}) translate(-4,3)`));
        yield* espera(420);
      }
      yield* espera(900);
      const fim = [pedra[0] - 30, pedra[1] + 44];
      yield* salto(pedra, fim, 620, 46);
      atr(R.ra, 'display', 'none');
      soltar('gt', fim[0], fim[1], 6, { vy: -.4, chao: fim[1] + 8 });
      yield* anel(fim[0], fim[1] + 2, 1000);
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
        atualizarImpulsos(dt);
        atualizarPiscar(dt);
        atualizarTiques(dt);
        for (const nome of Array.from(faixas.keys())) avancar(nome, dt);
        atualizarOlhar(dt);
        atualizarEventos(dt);
        animarCena();
        animarParticulas(dt);
        desenhar(dt);
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    lancar('corpo', cicloFora());
    animarCena();
    desenhar();

    return {
      animal: R.vaca,
      habitat: R.habitat,
      reagir() {
        if (!vivo) return;
        if (modo === 'fora') lancar('corpo', reacaoFora(), () => { reagindo = false; lancar('corpo', cicloFora()); });
        else if (modo === 'dentro') lancar('corpo', reacaoDentro(), () => lancar('corpo', cicloDentro()));
        else { impulso('twE', -14, 300); impulso('twD', -14, 300); impulso('sino', 10, 600, 'mola'); }
      },
      fazerSom(ms, silabas) {
        if (!vivo) return;
        lancar('boca', somBoca(limita(ms || 1400, 300, 3000), silabas));
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
      _teste: { P, pes, modo: () => modo, evento: iniciarEvento, desenhar, cab: () => cabMundo, boca: () => bocaMundo,
        comportamento: nome => lancar('corpo', (COMPORTAMENTOS[nome] || COMP_DENTRO[nome])(), () => lancar('corpo', modo === 'dentro' ? cicloDentro() : cicloFora())) }
    };
  }

  return { icone: iconeSVG(), montar };
})();
