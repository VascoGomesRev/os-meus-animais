/* Cavalo — «Os Meus Animais». Contrato e regras: REGRAS-ANIMAIS.md.
   Cena: o campo aberto do Alentejo / Ribatejo numa manhã de primavera (sol de cima à esquerda): planície com searas douradas
   a ondular, sobreiro com o tronco descortiçado (e o algarismo pintado), oliveiras ao longe, um monte alentejano caiado com
   barra azul, um poste velho com o ninho da cegonha, cerca de madeira, papoilas e malmequeres no primeiro plano.
   Habitat: a cavalariça de madeira com a porta dividida a meio (a porta de cima está aberta) e uma manjedoura de palha.
   O cavalo vai a trote (pares diagonais, cascos presos ao chão), vira-se para a porta, a meia-porta de baixo abre-se, entra
   (camadas: interior → cavalo → parede, ombreiras e meia-porta), a porta fecha-se atrás dele, vira-se lá dentro e põe a
   cabeça e o pescoço de fora por cima da meia-porta, a comer palha da manjedoura.
   O cavalo é um boneco «2,5D» (como a girafa): o tronco é um perfil projetado (estreita ao virar; aparece o peito de frente
   ou a garupa de costas), o pescoço tem 4 segmentos com a crina a ondular com atraso, as 4 patas têm IK no plano da pata,
   a cauda é uma cadeia 3D de 10 pontos e a cabeça é uma vista de frente cujas feições deslizam com o rumo da cabeça.
   Organização: 1) utilidades  2) medidas  3) desenho do cavalo  4) cenário e cavalariça  5) ícone
                6) montar(): estado, desenho por quadro, tarefas, andar a trote, comportamentos, idas e voltas */
'use strict';
MODULOS.cavalo = (() => {
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

  /* ================= 2) Medidas do cavalo (unidades do cavalo = pixels do SVG) ================= */
  const ESC = 1;
  const KZ = .16;                 // quanto a profundidade (z) desce no ecrã: vista ligeiramente de cima
  const CHAO = 780;               // y do chão à profundidade 0
  const HC = 238;                 // altura do centro do tronco
  const N_PESC = 4, LS = 44;      // pescoço: segmentos e comprimento de cada um
  const WN = [112, 96, 84, 76, 70];
  const PESC0 = { u: 112, h: 286 };
  const CAUDA0 = { u: -160, h: 274 };
  const NCA = 10, LCA = 19;       // cauda: pontos e distância entre eles
  const TORNOZELO = 26;           // altura do boleto (a quartela e o casco ficam por baixo)
  // patas: lado 1 = esquerda (virada para nós quando o cavalo olha para a direita); dobra 1 = joelho para a frente
  const PERNAS = [
    { id: 'tE', fr: 0, lado: 1, u: -112, v: 24, h: 200, L1: 104, L2: 76, pu: -112, dobra: -1 },
    { id: 'fE', fr: 1, lado: 1, u: 102, v: 24, h: 180, L1: 86, L2: 76, pu: 104, dobra: 1 },
    { id: 'tD', fr: 0, lado: -1, u: -112, v: -24, h: 200, L1: 104, L2: 76, pu: -112, dobra: -1 },
    { id: 'fD', fr: 1, lado: -1, u: 102, v: -24, h: 180, L1: 86, L2: 76, pu: 104, dobra: 1 }
  ];
  const COR = {
    cont: '#4A230E', pelo: '#A9622C', peloC: '#C98243', peloE: '#7C4119', crina: '#3B2014', crinaC: '#6A4028', crinaE: '#22110A',
    casco: '#2E2420', foc: '#C99068', focE: '#A0704A', malha: '#FFF9EE', boca: '#5A1E26'
  };

  /* ================= 3) Desenho do cavalo ================= */
  function defsCavalo(p) {
    return `
    <radialGradient id="${p}pelo" cx=".38" cy=".28" r=".85"><stop offset="0" stop-color="#D08A4A"/><stop offset=".55" stop-color="#A9622C"/><stop offset="1" stop-color="#7E421A"/></radialGradient>
    <linearGradient id="${p}luzV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9C8" stop-opacity=".3"/><stop offset=".32" stop-color="#FFE9C8" stop-opacity="0"/><stop offset=".64" stop-color="#3A1806" stop-opacity="0"/><stop offset="1" stop-color="#3A1806" stop-opacity=".32"/></linearGradient>
    <linearGradient id="${p}pesc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C47E40"/><stop offset=".45" stop-color="#AB652E"/><stop offset="1" stop-color="#8A4C20"/></linearGradient>
    <linearGradient id="${p}perna" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C27C3E"/><stop offset=".5" stop-color="#A55F2A"/><stop offset="1" stop-color="#7E4318"/></linearGradient>
    <linearGradient id="${p}pernaB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E3E1E"/><stop offset=".5" stop-color="#5A2F15"/><stop offset="1" stop-color="#43220F"/></linearGradient>
    <radialGradient id="${p}joelho" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#B9733A"/><stop offset="1" stop-color="#8A4C20"/></radialGradient>
    <linearGradient id="${p}casco" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5E4A40"/><stop offset=".6" stop-color="#33261F"/><stop offset="1" stop-color="#1E1410"/></linearGradient>
    <radialGradient id="${p}cab" gradientUnits="userSpaceOnUse" cx="-16" cy="-24" r="80"><stop offset="0" stop-color="#D3904F"/><stop offset=".55" stop-color="#AE6830"/><stop offset="1" stop-color="#8A4C20"/></radialGradient>
    <linearGradient id="${p}ponte" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C27E42"/><stop offset=".5" stop-color="#AC662F"/><stop offset="1" stop-color="#8E5024"/></linearGradient>
    <radialGradient id="${p}foc" cx=".4" cy=".3" r=".85"><stop offset="0" stop-color="#E2B48A"/><stop offset=".6" stop-color="#C99068"/><stop offset="1" stop-color="#A26E48"/></radialGradient>
    <radialGradient id="${p}iris" cx=".42" cy=".38" r=".65"><stop offset="0" stop-color="#8A5A34"/><stop offset=".45" stop-color="#4E2A14"/><stop offset="1" stop-color="#1C0D06"/></radialGradient>
    <linearGradient id="${p}orelha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A421C"/><stop offset=".4" stop-color="#A9622C"/><stop offset="1" stop-color="#B8723A"/></linearGradient>
    <linearGradient id="${p}orelhaIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A3020"/><stop offset=".5" stop-color="#C98A78"/><stop offset="1" stop-color="#EBB4A2"/></linearGradient>
    <linearGradient id="${p}crina" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6A4028"/><stop offset=".6" stop-color="#3B2014"/><stop offset="1" stop-color="#26130A"/></linearGradient>
    <radialGradient id="${p}sombra"><stop offset="0" stop-color="#3E2A0C" stop-opacity=".46"/><stop offset=".6" stop-color="#3E2A0C" stop-opacity=".22"/><stop offset="1" stop-color="#3E2A0C" stop-opacity="0"/></radialGradient>
    <clipPath id="${p}olho"><ellipse rx="13.5" ry="15.5"/></clipPath>`;
  }

  /* --- Tronco de perfil (local: u para a frente, y para baixo, origem no centro do tronco a HC de altura) --- */
  const TRONCO = 'M-166,-16 C-170,-58 -138,-80 -100,-78 C-60,-76 0,-66 50,-74 C80,-80 112,-96 140,-80 C164,-64 170,-24 160,14 C152,46 126,66 92,70 C50,74 10,76 -30,74 C-80,72 -124,68 -148,44 C-162,28 -166,8 -166,-16 Z';
  function troncoSVG(p) {
    return `<g class="cv-troncoR">
      <path d="${TRONCO}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="8" stroke-linejoin="round"/>
      <path d="${TRONCO}" fill="url(#${p}pelo)"/>
      <path d="${TRONCO}" fill="url(#${p}luzV)"/>
      <path d="M-150,-40 C-130,-70 -96,-74 -60,-68 C-20,-62 30,-62 60,-72 C90,-84 118,-90 136,-78" stroke="#F2C08A" stroke-width="7" fill="none" opacity=".35" stroke-linecap="round"/>
      <path d="M86,-56 C110,-30 118,10 104,48" stroke="#7A3E16" stroke-width="4" fill="none" opacity=".35" stroke-linecap="round"/>
      <path d="M-96,-66 C-128,-40 -136,4 -118,52" stroke="#7A3E16" stroke-width="4" fill="none" opacity=".3" stroke-linecap="round"/>
      <ellipse cx="-112" cy="-18" rx="44" ry="40" fill="#E2A060" opacity=".22"/>
      <ellipse cx="104" cy="-6" rx="36" ry="40" fill="#E2A060" opacity=".18"/>
      <path d="M-60,64 C-10,72 40,72 80,64" stroke="#6A3412" stroke-width="5" fill="none" opacity=".3" stroke-linecap="round"/>
      <path d="M-20,-30 l6,-4 M10,-24 l7,-3 M-50,-20 l5,-5 M40,-34 l6,-4 M-80,-34 l5,-5 M60,-10 l6,-4 M-30,10 l6,-4 M20,20 l6,-4" stroke="#7A3E16" stroke-width="2" opacity=".16" stroke-linecap="round"/>
    </g>`;
  }
  // peito visto de frente (só a meio das viragens e quando está virado para nós) e garupa vista de trás
  function peitoSVG(p) {
    return `<ellipse rx="64" ry="78" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="8"/>
      <ellipse rx="64" ry="78" fill="url(#${p}pelo)"/><ellipse rx="64" ry="78" fill="url(#${p}luzV)"/>
      <path d="M0,-40 C-4,0 -4,30 0,66" stroke="#7A3E16" stroke-width="4" fill="none" opacity=".35" stroke-linecap="round"/>
      <ellipse cx="-24" cy="-30" rx="22" ry="30" fill="#E8AA6A" opacity=".3"/><ellipse cx="24" cy="-30" rx="20" ry="28" fill="#E8AA6A" opacity=".16"/>`;
  }
  function garupaSVG(p) {
    return `<ellipse rx="70" ry="76" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="8"/>
      <ellipse rx="70" ry="76" fill="url(#${p}pelo)"/><ellipse rx="70" ry="76" fill="url(#${p}luzV)"/>
      <path d="M0,-70 C-3,-20 -3,20 0,70" stroke="#6A3412" stroke-width="5" fill="none" opacity=".4" stroke-linecap="round"/>
      <ellipse cx="-30" cy="-26" rx="28" ry="34" fill="#E8AA6A" opacity=".32"/><ellipse cx="30" cy="-26" rx="26" ry="32" fill="#E8AA6A" opacity=".15"/>`;
  }

  /* --- Pescoço: 4 segmentos (trapézios) com tampas redondas nas juntas e a crina em tufos (ondula com skewX) --- */
  function trapPesc(i, e) {
    const a = WN[i] / 2 + e, b = WN[i + 1] / 2 + e, x0 = -6, x1 = LS + 6;
    if (i === 0) return `M14,${-a} L${x1},${-b} L${x1},${b} L14,${a} C${-16 - e},${n(a * .7)} ${-20 - e},${n(-a * .7)} 14,${-a} Z`;
    return `M${x0},${-a} L${x1},${-b} L${x1},${b} L${x0},${a} Z`;
  }
  function crinaPath(i) {      // tufos que caem para trás (para −x) a partir da borda do pescoço (y = 0); para fora = −y
    let d = '';
    const comp = 30 - i * 3;
    for (let x = -10; x < LS + 6; x += 11) {
      d += `M${n(x + 14)},6 C${n(x + 10)},-8 ${n(x + 2)},${n(-comp * .8)} ${n(x - 8)},${n(-comp)} C${n(x)},${n(-comp * .55)} ${n(x + 4)},-4 ${n(x + 2)},6 Z`;
    }
    return d;
  }
  function pescocoSVG(p) {
    let cont = '', crina = '', disc = '', fill = '';
    for (let i = 0; i < N_PESC; i++) {
      const cr = crinaPath(i);
      const contorno = i === 0 ? `M30,${n(-WN[0] / 2 - 4 + (WN[0] - WN[1]) / 2 * 30 / LS)} L${LS + 6},${-WN[1] / 2 - 4} L${LS + 6},${WN[1] / 2 + 4} L30,${n(WN[0] / 2 + 4 - (WN[0] - WN[1]) / 2 * 30 / LS)} Z` : trapPesc(i, 4);
      cont += `<g class="cv-pc${i}"><path d="${contorno}" fill="${COR.cont}"/></g>`;
      crina += `<g class="cv-pc${i}"><g class="cv-crina${i}"><path d="${cr}" fill="${COR.crinaE}" stroke="${COR.crinaE}" stroke-width="4" stroke-linejoin="round"/>
        <path d="${cr}" fill="url(#${p}crina)"/><path d="M0,-6 C10,-14 20,-16 32,-14" stroke="#8A5A3A" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round"/></g></g>`;
      const tampa = '';
      fill += `<g class="cv-pc${i}"><path d="${trapPesc(i, 0)}" fill="url(#${p}pesc)"/>${tampa}
        <path d="M2,${n(WN[i] * .18)} L${LS},${n(WN[i + 1] * .18)}" stroke="#7A3E16" stroke-width="3" opacity=".22" stroke-linecap="round"/>
        <path class="cv-cc${i}" d="M-8,-11 C10,-14 30,-14 ${LS + 8},-10 L${LS + 8},10 C30,14 10,14 -8,11 Z" fill="url(#${p}crina)" stroke="#22110A" stroke-width="2" opacity="0"/></g>`;
      if (i > 0) {
        cont += `<g class="cv-pj${i}"><circle r="${WN[i] / 2 + 4}" fill="${COR.cont}"/></g>`;
        disc += `<g class="cv-pj${i}"><circle r="${WN[i] / 2}" fill="#A9622C"/></g>`;
      }
    }
    // a crina fica por baixo do pescoço (só os tufos saem pela borda); um 2.º passe de tufos curtos por cima dá volume
    return `<g class="cv-pescoco"><g>${cont}</g><g>${crina}</g><g>${disc}</g><g>${fill}</g></g>`;
  }

  /* --- Patas (cada peça ao longo de +x; contorno primeiro, enchimento depois) --- */
  const capsula = (L, a, b) => `M0,${-a} L${L},${-b} A${b},${b} 0 0 1 ${L},${b} L0,${a} A${a},${a} 0 0 1 0,${-a} Z`;
  const SUP_F = 'M-4,-24 C30,-22 60,-14 86,-11 A11,11 0 0 1 86,11 C60,13 30,20 -4,24 C-20,20 -20,-20 -4,-24 Z';
  const SUP_T = 'M-14,-36 C24,-40 70,-18 104,-11 A11,11 0 0 1 104,11 C70,16 30,40 -10,40 C-36,34 -38,-28 -14,-36 Z';
  const INF = L => capsula(L, 9.5, 8.5);
  // quartela + casco (o boleto fica na origem; o casco aponta para +x = para a frente)
  const CASCO = 'M-10,2 L9,2 C12,10 16,18 20,28 C10,31 -6,31 -14,28 C-14,18 -12,10 -10,2 Z';
  function pernaSVG(p, pe) {
    const fr = pe.fr, sup = fr ? SUP_F : SUP_T, L2 = pe.L2;
    const k = 'cv-' + pe.id;
    const meia = pe.id === 'tE';        // uma meia branca na pata de trás esquerda
    return `<g class="cv-perna ${k}">
      <g class="${k}-sup"><path d="${sup}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="8" stroke-linejoin="round"/></g>
      <g class="${k}-inf"><path d="${INF(L2)}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="8"/></g>
      <g class="${k}-joe"><circle r="${fr ? 12.5 : 12}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="8"/></g>
      <g class="${k}-casco"><path d="${CASCO}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7" stroke-linejoin="round"/></g>
      <g class="${k}-bol"><circle r="11" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="8"/></g>
      <g class="${k}-sup"><path d="${sup}" fill="url(#${p}perna)"/><path d="M6,-12 C30,-12 56,-8 80,-6" stroke="#E6A868" stroke-width="4" fill="none" opacity=".35" stroke-linecap="round"/></g>
      <g class="${k}-inf"><path d="${INF(L2)}" fill="url(#${p}${meia ? 'perna' : 'pernaB'})"/>${meia ? `<path d="${capsula(L2 * .55, 9, 8.5)}" transform="translate(${n(L2 * .45)},0)" fill="#FBF3E4"/>` : ''}
        <path d="M8,-3 L${L2 - 10},-2" stroke="#C08A5A" stroke-width="2.4" opacity=".5" stroke-linecap="round"/></g>
      <g class="${k}-joe"><circle r="${fr ? 12.5 : 12}" fill="url(#${p}joelho)"/></g>
      <g class="${k}-casco"><path d="${CASCO}" fill="url(#${p}casco)"/><path d="M-11,6 C-4,8 4,8 11,6" stroke="${meia ? '#F4E8D6' : '#4A2A18'}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M-9,11 L10,11" stroke="#7A645A" stroke-width="1.8" opacity=".8" stroke-linecap="round"/><path d="M-12,27 C0,29 10,29 19,27" stroke="#14100C" stroke-width="2" fill="none" opacity=".7"/></g>
      <g class="${k}-bol"><circle r="11" fill="${meia ? '#FBF3E4' : '#5E3218'}"/><path d="M-6,4 C-2,7 3,7 7,4" stroke="${meia ? '#D9CDBA' : '#3A1E0E'}" stroke-width="1.8" fill="none"/></g>
    </g>`;
  }
  function sombrasPesSVG(p) {
    return PERNAS.map(pe => `<ellipse class="cv-sp-${pe.id}" rx="26" ry="6.5" fill="url(#${p}sombra)"/>`).join('');
  }
  // cauda: 3 caminhos (contorno, cabelo, madeixas) refeitos a cada quadro a partir da cadeia 3D
  function caudaSVG(p) {
    return `<path class="cv-caudaC" d="" fill="${COR.crinaE}" stroke="${COR.crinaE}" stroke-width="6" stroke-linejoin="round"/>
      <path class="cv-caudaF" d="" fill="url(#${p}crina)"/>
      <path class="cv-caudaM" d="" fill="none" stroke="#7A4A30" stroke-width="2.2" stroke-linecap="round" opacity=".75"/>
      <path class="cv-caudaM2" d="" fill="none" stroke="#1E0E06" stroke-width="2" stroke-linecap="round" opacity=".5"/>`;
  }

  /* --- Cabeça: vista de frente cujas feições deslizam com Y = cos(rumo da cabeça)
         (−1 perfil para a esquerda … 0 de frente … 1 perfil para a direita); F = sen(rumo) (< 0: de costas, a cara esconde-se);
         beta = inclinação do focinho (graus, + para baixo). A cara é comprida: crânio → ponte (com a malha branca) → focinho --- */
  const LF = 88;
  function estadoCabeca(q) {
    const Y = q.Y, aY = Math.abs(Y), b = q.beta * RAD, cb = Math.cos(b), sb = Math.sin(b);
    const t = {}, d = {}, op = {}, a = {};
    const Mx = Y * LF * cb, My = 4 + LF * sb;               // centro do focinho
    a.M = [Mx, My];
    const bx = Mx, by = My + 4, bl = Math.hypot(bx, by);
    const angP = Math.atan2(by, bx) / RAD;
    t.ponte = `translate(0,-4) rotate(${n(angP)})`; a.ponteL = n(Math.max(1, bl));
    // malha branca ao longo da ponte: no meio de frente, na aresta da frente de perfil
    t.malha = `translate(0,${n(-Y * 15)}) scale(1,${n3(1 - .5 * aY)})`;
    t.snip = `translate(${n(Y * 14)},0) scale(${n3(1 - .5 * aY)},1)`;
    const rf = Y * q.beta * .55;
    t.foc = `translate(${n(Mx)},${n(My)}) rotate(${n(rf)})`;
    t.queixo = `translate(${n(Mx - Y * 10 + q.mastX)},${n(My + 21 + q.boca * 24 + q.mastY)}) rotate(${n(rf + q.mastX * 1.5)})`;
    const bcy = My + 22 + q.boca * 11;
    t.bocaInt = `translate(${n(Mx + Y * 5 + q.mastX * .5)},${n(bcy)})`;
    a.bocaRy = n(1 + q.boca * 15); a.bocaRx = n(21 * (1 - .25 * aY));
    t.dentesS = `translate(${n(Mx + Y * 12 + q.mastX * .4)},${n(My + 24)}) rotate(${n(rf * .6)}) scale(${n3(1 - .4 * aY)},1)`;
    t.dentesI = `translate(${n(Y * 4)},-13) scale(${n3(1 - .4 * aY)},1)`;
    op.dentes = n3(passoS(.12, .38, q.boca));
    // boca (linha do sorriso, por baixo do focinho)
    const c1 = [Mx - 16 * (1 - aY) + aY * (Y > 0 ? -6 : -28), My + 15 - (Y < 0 ? 4 : 0) * aY], c2 = [Mx + 16 * (1 - aY) + aY * (Y > 0 ? 28 : 6), My + 15 - (Y > 0 ? 4 : 0) * aY];
    const cc = [(c1[0] + c2[0]) / 2 + Y * 2, My + 20 + q.sorriso * 3];
    d.boca = `M${n(c1[0])},${n(c1[1])} Q${n(cc[0])},${n(cc[1])} ${n(c2[0])},${n(c2[1])}`;
    a.bocaFrente = [Mx + Y * 26 * cb, My + 14 + 6 * sb * aY];
    a.narinas = [Mx + Y * 22 * cb, My - 8];
    // feições presas a uma esfera: ângulo = lado (±) + rumo da cabeça (al)
    const al = Math.asin(limita(Y, -1, 1)) / RAD;
    const sen = g => Math.sin(g * RAD), cosg = g => Math.cos(g * RAD);
    for (const s of [-1, 1]) {
      const k = s < 0 ? 'E' : 'D';
      const gn = s * 34 + al;
      const x = Mx + 19 * sen(gn) + Y * 13 * cb, y = My - 9 - aY * 2 * cb + aY * 7 * sb;
      t['nar' + k] = `translate(${n(x)},${n(y)}) rotate(${n(s * 22 * (1 - aY) + Y * q.beta * .5)}) scale(${n3((.45 + .55 * Math.max(0, cosg(gn))) * (1 + q.nariz * .45))},${n3(1 + q.nariz * .6)})`;
      op['nar' + k] = n3(passoS(.02, .25, cosg(gn)));
      const ge = s * 56 + al, ce = cosg(ge), ex = 36 * sen(ge), sx = .22 + .78 * Math.max(0, ce);
      t['olho' + k] = `translate(${n(ex)},-5) scale(${n3(sx * q.olhoEsc)},${n3(q.olhoEsc)})`;
      op['olho' + k] = ce > .08 ? '1' : '0';
      t['sobr' + k] = `translate(${n(37 * sen(ge + s * 3))},${n(-26 - q.sobr * 5)}) rotate(${n(s * (-8 + q.sobr * 10))}) scale(${n3(sx)},1)`;
      op['sobr' + k] = ce > .12 ? '1' : '0';
      const gc = s * 50 + al;
      t['boch' + k] = `translate(${n(36 * sen(gc))},16) scale(${n3(.3 + .7 * Math.max(0, cosg(gc)))},1)`;
      op['boch' + k] = n3(passoS(.05, .4, cosg(gc)) * .4 * (1 + q.feliz * .7));
      // orelhas em cima do crânio: inclinam para trás (tilt > 0) e rodam (tw: 1 = abertura para a frente, −1 = para trás)
      const go = s * 30 + al, ox = 25 * sen(go);
      const tilt = (s < 0 ? q.oE : q.oD) - q.orelhas;
      const tw = limita(s < 0 ? q.tE : q.tD, -1, 1);
      const rot = s * (12 + Math.max(0, tilt) * .5) * (1 - aY) - Y * tilt;
      const sy = 1 - (1 - aY) * limita(tilt / 70, -.1, .38);
      t['orelha' + k] = `translate(${n(ox)},-33) rotate(${n(rot)}) scale(${n3(.78 + .22 * (1 - aY))},${n3(sy)})`;
      t['orelhaIn' + k] = `scale(${n3(limita(.1 + .9 * tw, .06, 1))},1)`;
      op['orelhaIn' + k] = n3(passoS(-.6, .1, tw));
    }
    t.franja = `translate(${n(Y * 20)},-40) skewX(${n(q.franja)}) scale(${n3(1 - .35 * aY)},1)`;
    t.estrela = `translate(${n(Y * 30)},-18) scale(${n3(1 - .55 * aY)},1)`;
    t.ganache = `translate(${n(-Y * 8)},10) scale(${n3(Y)},1)`; op.ganache = n3(aY * .55);
    // pálpebras: c = fecho, h = olhos contentes («∩»)
    const c = limita(q.fecho, 0, 1), h = limita(q.feliz, 0, 1);
    const ye = lerp(lerp(-11, 11, c), 7, h), cy = lerp(lerp(-27, 18, c), -12, h);
    d.palpS = `M-18,-24 L18,-24 L18,${n(ye)} Q0,${n(cy)} -18,${n(ye)} Z`;
    const yl = lerp(19, 8, h), cyl = lerp(24, -9, h);
    d.palpI = `M-18,24 L18,24 L18,${n(yl)} Q0,${n(cyl)} -18,${n(yl)} Z`;
    const Q = (u, p0, p1, p2) => (1 - u) * (1 - u) * p0 + 2 * u * (1 - u) * p1 + u * u * p2;
    let cil = `M-14.5,${n(Q(.1, ye, cy, ye))} Q0,${n(Q(.5, ye, cy, ye) * 2 - (Q(.1, ye, cy, ye) + Q(.9, ye, cy, ye)) / 2)} 14.5,${n(Q(.9, ye, cy, ye))}`;
    for (const u of [.18, .38, .6, .8]) {
      const x = lerp(-18, 18, u), y = Q(u, ye, cy, ye), vx = x * .55, vy = y - 2;
      const L = Math.hypot(vx, vy) || 1, ux = vx / L, uy = vy / L, comp = 8 * (1 - c * .25);
      cil += ` M${n(x)},${n(y)} q${n(ux * comp * .5 - uy * 2)},${n(uy * comp * .5 + ux * 2)} ${n(ux * comp)},${n(uy * comp)}`;
    }
    d.cil = cil;
    t.iris = `translate(${n(q.olharX * 4.5 + Y * 2)},${n(q.olharY * 4)})`;
    // de costas: a cara (focinho, olhos, boca) esconde-se atrás do crânio
    op.rosto = n3(passoS(-.62, -.34, q.F));
    return { t, d, op, a };
  }

  // cores lisas para o ícone (sem gradientes com id)
  const LISO = { pelo: '#A9622C', cab: '#AE6830', ponte: '#AC662F', foc: '#C99068', iris: '#3E2010', orelha: '#A2602C', orelhaIn: '#D9A090', crina: '#3B2014', luzV: 'none' };
  function cabecaSVG(p, E, icone) {
    const T = k => E.t[k] ? ` transform="${E.t[k]}"` : '';
    const O = k => E.op[k] != null ? ` opacity="${E.op[k]}"` : '';
    const orelha = k => `<g class="cv-orelha${k}"${T('orelha' + k)}>
        <path d="M-11,6 C-13,-10 -7,-26 0,-37 C7,-26 13,-10 11,6 Z" fill="url(#${p}orelha)" stroke="${COR.cont}" stroke-width="3" stroke-linejoin="round"/>
        <g class="cv-orelhaIn${k}"${T('orelhaIn' + k)}${O('orelhaIn' + k)}><path d="M-6,2 C-7.5,-9 -4,-21 0,-29 C4,-21 7.5,-9 6,2 Z" fill="url(#${p}orelhaIn)"/>
          <path d="M-2,-5 C-2,-12 -1,-18 0,-24 M2.5,-5 C2.5,-11 2,-17 1,-22" stroke="#FFF2EA" stroke-width="1.2" fill="none" opacity=".75"/></g>
        <path d="M-7,-3 C-8,-12 -5,-22 0,-31" stroke="#D08A4A" stroke-width="2.4" fill="none" opacity=".45" stroke-linecap="round"/></g>`;
    const olho = k => `<g class="cv-olho${k}"${T('olho' + k)}${O('olho' + k)}>
        <ellipse rx="17" ry="19" fill="#5A2A0C" opacity=".3"/>
        <g${icone ? '' : ` clip-path="url(#${p}olho)"`}>
          <ellipse rx="13.5" ry="15.5" fill="#FFFDF6"/>
          <g class="cv-iris${k}"${T('iris')}><circle cy="1" r="11" fill="url(#${p}iris)"/><circle cy="1" r="11" fill="none" stroke="#120804" stroke-width="1.6"/>
            <ellipse cy="1.5" rx="6.4" ry="5" fill="#0E0603"/><circle cx="-4" cy="-4" r="4.4" fill="#FFFFFF"/><circle cx="4.2" cy="5" r="2" fill="#FFFFFF" opacity=".9"/></g>
          ${icone ? '' : `<path d="M-18,-20 L18,-20 L18,-8 Q0,-22 -18,-8 Z" fill="#3A1806" opacity=".16"/>
          <path class="cv-palpS${k}" d="${E.d.palpS}" fill="url(#${p}cab)"/>
          <path class="cv-palpI${k}" d="${E.d.palpI}" fill="url(#${p}cab)"/>`}
        </g>
        <ellipse rx="13.5" ry="15.5" fill="none" stroke="${COR.cont}" stroke-width="2.6"/>
        <path class="cv-cil${k}" d="${E.d.cil}" fill="none" stroke="#1E0E06" stroke-width="2.6" stroke-linecap="round"/>
      </g>`;
    const nar = k => `<g class="cv-nar${k}"${T('nar' + k)}${O('nar' + k)}><path d="M-7,1 C-7,-4 -2,-6 3,-5 C7,-4 8,0 6,3 C3,6 -5,6 -7,1 Z" fill="#4A2618"/><path d="M-6,-3 C-2,-7 4,-7 7,-3" stroke="#F4D2B0" stroke-width="1.6" fill="none" opacity=".8"/></g>`;
    const dentes = (cl, inv) => `<g class="${cl}"${T(cl === 'cv-dentesS' ? 'dentesS' : 'dentesI')}${O('dentes')}><path d="M-13,${inv ? 0 : 0} L13,0 L12,${inv ? -7 : 7} C6,${inv ? -9 : 9} -6,${inv ? -9 : 9} -12,${inv ? -7 : 7} Z" fill="#FFFBEE" stroke="#C9BBA0" stroke-width="1.2"/>
        <path d="M-6.5,0 L-6.5,${inv ? -7 : 7} M0,0 L0,${inv ? -8 : 8} M6.5,0 L6.5,${inv ? -7 : 7}" stroke="#D2C4A8" stroke-width="1.1"/></g>`;
    const s = `<g class="cv-cab-in">
      ${orelha('E')}${orelha('D')}
      <ellipse rx="47.5" ry="46.5" fill="${COR.cont}"/>
      <g class="cv-rostoC"${O('rosto')}>
        <g class="cv-ponteC"${T('ponte')}><rect class="cv-ponteCr" x="0" y="-33.5" width="${E.a.ponteL}" height="67" rx="33.5" fill="${COR.cont}"/></g>
        <g class="cv-queixoC"${T('queixo')}><ellipse rx="30" ry="18" fill="${COR.cont}"/></g>
        <g class="cv-focC"${T('foc')}><ellipse rx="44" ry="36" fill="${COR.cont}"/></g>
      </g>
      <ellipse rx="44" ry="43" fill="url(#${p}cab)"/>
      <path d="M-30,-28 C-18,-40 4,-44 22,-38" stroke="#E8AE70" stroke-width="7" fill="none" opacity=".45" stroke-linecap="round"/>
      <g class="cv-ganache"${T('ganache')}${O('ganache')}><path d="M24,-8 C30,10 22,28 2,32" stroke="#6A3412" stroke-width="3.5" fill="none" stroke-linecap="round"/></g>
      <g class="cv-rosto"${O('rosto')}>
        <g class="cv-queixo"${T('queixo')}><ellipse rx="26" ry="14.5" fill="url(#${p}foc)"/><path d="M-14,5 C-4,9 6,9 14,4" stroke="${COR.focE}" stroke-width="1.6" fill="none"/>${dentes('cv-dentesI', true)}</g>
        <ellipse class="cv-bocaInt"${T('bocaInt')} rx="${E.a.bocaRx}" ry="${E.a.bocaRy}" fill="${COR.boca}"/>
        <g class="cv-ponte"${T('ponte')}><rect class="cv-ponteR" x="0" y="-30" width="${E.a.ponteL}" height="60" rx="30" fill="url(#${p}ponte)"/>
          <g class="cv-malha"${T('malha')}><rect class="cv-malhaR" x="14" y="-10" width="${Math.max(1, n(E.a.ponteL - 22))}" height="20" rx="10" fill="${COR.malha}"/></g></g>
        <g class="cv-foc"${T('foc')}><ellipse rx="40" ry="31" fill="url(#${p}foc)"/><ellipse cx="-10" cy="-16" rx="16" ry="6.5" fill="#FFFFFF" opacity=".45"/>
          <g class="cv-snip"${T('snip')}><path d="M-12,-28 C-6,-31 6,-31 12,-28 C10,-20 6,-14 0,-12 C-6,-14 -10,-20 -12,-28 Z" fill="${COR.malha}" opacity=".95"/></g>
          <g fill="${COR.focE}" opacity=".7"><circle cx="-20" cy="10" r="1.5"/><circle cx="-13" cy="14" r="1.5"/><circle cx="13" cy="14" r="1.5"/><circle cx="20" cy="10" r="1.5"/></g></g>
        ${dentes('cv-dentesS', false)}
        <path class="cv-boca" d="${E.d.boca}" stroke="${COR.cont}" stroke-width="3" fill="none" stroke-linecap="round"/>
        ${nar('E')}${nar('D')}
        <ellipse class="cv-bochE"${T('bochE')}${O('bochE')} rx="11" ry="6.5" fill="#F29A86"/><ellipse class="cv-bochD"${T('bochD')}${O('bochD')} rx="11" ry="6.5" fill="#F29A86"/>
        ${olho('E')}${olho('D')}
        <path class="cv-sobrE"${T('sobrE')}${O('sobrE')} d="M-9,2 C-4,-3 4,-3 9,1" stroke="#5A2C10" stroke-width="3" fill="none" stroke-linecap="round" stroke-opacity=".7"/>
        <path class="cv-sobrD"${T('sobrD')}${O('sobrD')} d="M-9,1 C-4,-3 4,-3 9,2" stroke="#5A2C10" stroke-width="3" fill="none" stroke-linecap="round" stroke-opacity=".7"/>
        <g class="cv-estrela"${T('estrela')}><path d="M0,-12 C3,-5 6,-2 11,0 C6,2 3,6 0,13 C-3,6 -6,2 -11,0 C-6,-2 -3,-5 0,-12 Z" fill="${COR.malha}"/></g>
      </g>
      <g class="cv-franja"${T('franja')}><path d="M-13,-4 C-15,6 -13,14 -9,22 C-7,14 -5,10 -3,6 C-2,14 0,22 3,28 C4,18 5,12 6,6 C8,12 11,16 14,18 C13,10 13,2 12,-4 Z" fill="${COR.crinaE}" stroke="${COR.crinaE}" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M-13,-4 C-15,6 -13,14 -9,22 C-7,14 -5,10 -3,6 C-2,14 0,22 3,28 C4,18 5,12 6,6 C8,12 11,16 14,18 C13,10 13,2 12,-4 Z" fill="url(#${p}crina)"/><path d="M-9,0 C-10,6 -10,12 -9,18 M1,2 C1,10 2,16 3,22 M8,2 C9,8 11,12 13,15" stroke="#8A5A3A" stroke-width="1.6" fill="none" opacity=".7" stroke-linecap="round"/></g>
    </g>`;
    if (!icone) return s;
    return s.replace(/url\(#[a-z]+-([A-Za-z]+)\)/g, (m, k) => LISO[k] || '#A9622C');
  }

  function cavaloSVG(p) {
    const E = estadoCabeca(CAB0);
    return `<g class="cv-cavalo">
      <g class="cv-corpo">
        <ellipse class="cv-sombra" rx="1" ry="1" fill="url(#${p}sombra)"/>
        ${sombrasPesSVG(p)}
        <g class="cv-pernasTras">${PERNAS.map(pe => pernaSVG(p, pe)).join('')}</g>
        <g class="cv-slotCaudaT"><g class="cv-cauda">${caudaSVG(p)}</g></g>
        <g class="cv-slotPescT"></g>
        <g class="cv-tronco">${troncoSVG(p)}</g>
        <g class="cv-garupa" display="none">${garupaSVG(p)}</g>
        <g class="cv-slotCaudaF"></g>
        <g class="cv-pernasFrente"></g>
        <g class="cv-peito" display="none">${peitoSVG(p)}</g>
      </g>
      <g class="cv-copia" display="none"><path class="cv-sombraDentro" d="${ABERTURA}" fill="#1E1008" opacity="0"/>${meiaPortaSVG(p, 'cv-mpC')}</g>
      <g class="cv-slotPescF"><g class="cv-frente">${pescocoSVG(p)}<g class="cv-cab">${cabecaSVG(p, E)}</g></g></g>
      <g class="cv-copiaManj" display="none">${manjFrenteSVG(p)}</g>
    </g>`;
  }
  const CAB0 = { Y: -.5, F: .8, beta: 52, oE: 0, oD: 0, tE: 1, tD: 1, orelhas: 0, fecho: 0, feliz: 0, sobr: 0, boca: 0, mastX: 0, mastY: 0, olharX: 0, olharY: 0, nariz: 0, sorriso: .4, olhoEsc: 1, franja: 0 };

  /* ================= 4) Cenário: campo do Alentejo / Ribatejo ================= */
  function defsCena(p) {
    return `
    <linearGradient id="${p}ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4E9ADB"/><stop offset=".45" stop-color="#8CC4EC"/><stop offset=".8" stop-color="#CFE7F4"/><stop offset="1" stop-color="#F1EEDC"/></linearGradient>
    <radialGradient id="${p}solBrilho"><stop offset="0" stop-color="#FFFBE6" stop-opacity=".95"/><stop offset=".2" stop-color="#FFF4C8" stop-opacity=".5"/><stop offset=".55" stop-color="#FFF0B8" stop-opacity=".14"/><stop offset="1" stop-color="#FFF0B8" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}sol" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="#FFFFF6"/><stop offset=".7" stop-color="#FFF6CC"/><stop offset="1" stop-color="#FFE9A0"/></radialGradient>
    <linearGradient id="${p}colinaL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B7C29A"/><stop offset="1" stop-color="#C9C79A"/></linearGradient>
    <linearGradient id="${p}colinaM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9B66C"/><stop offset="1" stop-color="#D8BE6A"/></linearGradient>
    <linearGradient id="${p}seara" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2CF6E"/><stop offset=".5" stop-color="#E5B44E"/><stop offset="1" stop-color="#D19A38"/></linearGradient>
    <linearGradient id="${p}prado" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9B85A"/><stop offset=".35" stop-color="#93A548"/><stop offset="1" stop-color="#6F8634"/></linearGradient>
    <linearGradient id="${p}carreiro" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E4C898" stop-opacity="0"/><stop offset=".15" stop-color="#E4C898" stop-opacity=".85"/><stop offset=".85" stop-color="#DDBE8A" stop-opacity=".9"/><stop offset="1" stop-color="#DDBE8A" stop-opacity=".6"/></linearGradient>
    <linearGradient id="${p}cortica" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D2774A"/><stop offset=".45" stop-color="#B4532C"/><stop offset="1" stop-color="#7E3418"/></linearGradient>
    <linearGradient id="${p}casca" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9A8A76"/><stop offset=".4" stop-color="#6E5E4C"/><stop offset="1" stop-color="#433628"/></linearGradient>
    <radialGradient id="${p}copa" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#7E9A48"/><stop offset=".55" stop-color="#55702E"/><stop offset="1" stop-color="#3A5220"/></radialGradient>
    <radialGradient id="${p}oliva" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#B8C49A"/><stop offset=".6" stop-color="#8E9E72"/><stop offset="1" stop-color="#6A7A52"/></radialGradient>
    <linearGradient id="${p}madeira" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A2643A"/><stop offset=".5" stop-color="#8A522C"/><stop offset="1" stop-color="#6E3E20"/></linearGradient>
    <linearGradient id="${p}madeiraV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#94562E"/><stop offset="1" stop-color="#7A4424"/></linearGradient>
    <linearGradient id="${p}porta" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7E8E52"/><stop offset=".5" stop-color="#6E7E46"/><stop offset="1" stop-color="#5A6A38"/></linearGradient>
    <linearGradient id="${p}portaT" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#55643A"/><stop offset="1" stop-color="#6A7A46"/></linearGradient>
    <linearGradient id="${p}interior" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E120A"/><stop offset=".55" stop-color="#3A2614"/><stop offset="1" stop-color="#5A3E20"/></linearGradient>
    <linearGradient id="${p}telha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D2724A"/><stop offset="1" stop-color="#A64A2C"/></linearGradient>
    <linearGradient id="${p}palha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6DA8A"/><stop offset=".6" stop-color="#E2B95A"/><stop offset="1" stop-color="#C69640"/></linearGradient>
    <linearGradient id="${p}pedra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8D2C4"/><stop offset="1" stop-color="#ADA492"/></linearGradient>
    <radialGradient id="${p}sombraArv"><stop offset="0" stop-color="#2E3A10" stop-opacity=".34"/><stop offset=".7" stop-color="#2E3A10" stop-opacity=".14"/><stop offset="1" stop-color="#2E3A10" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}vinheta" cx=".46" cy=".44" r=".78"><stop offset=".62" stop-color="#3A2A0A" stop-opacity="0"/><stop offset="1" stop-color="#3A2A0A" stop-opacity=".26"/></radialGradient>
    <radialGradient id="${p}luzQuente" gradientUnits="userSpaceOnUse" cx="190" cy="150" r="1150"><stop offset="0" stop-color="#FFF4C8" stop-opacity=".2"/><stop offset=".5" stop-color="#FFF0C0" stop-opacity=".05"/><stop offset="1" stop-color="#FFF0C0" stop-opacity="0"/></radialGradient>
    <clipPath id="${p}recorte"><path d="M${AB.x0},${AB.y0} H${AB.x1} V${AB.chao} L${AB.x1 + 40},${AB.chao} L${AB.x1 + 60},900 L${AB.x0 - 60},900 L${AB.x0 - 40},${AB.chao} L${AB.x0},${AB.chao} Z"/></clipPath>
    <clipPath id="${p}recorteAlto"><path d="${ABERTURA_ALTA}"/></clipPath>
    <clipPath id="${p}abertura"><path d="${ABERTURA}"/></clipPath>`;
  }
  function nuvemSVG(i, k) {
    return `<g class="cv-nuvem${i}"><g transform="scale(${k})">
      <ellipse cx="0" cy="12" rx="98" ry="13" fill="#C9DCEA" opacity=".8"/>
      <ellipse cx="-48" cy="0" rx="36" ry="18" fill="#F4F9FC"/><ellipse cx="-6" cy="-10" rx="42" ry="24" fill="#FFFFFF"/><ellipse cx="40" cy="-2" rx="36" ry="17" fill="#F7FBFD"/><ellipse cx="76" cy="6" rx="22" ry="10" fill="#EEF5FA"/>
      <ellipse cx="0" cy="8" rx="94" ry="10" fill="#E8F1F8"/>
      <ellipse cx="-22" cy="-20" rx="24" ry="7" fill="#FFFFFF"/></g></g>`;
  }
  function colinasSVG(p) {
    const rnd = semente(7);
    let s = `<path d="M0,500 C140,474 300,486 460,470 C620,456 780,480 940,468 C1100,456 1260,476 1420,462 C1500,456 1560,460 1600,458 L1600,600 L0,600 Z" fill="url(#${p}colinaL)"/>
      <path d="M0,500 C140,474 300,486 460,470 C620,456 780,480 940,468 C1100,456 1260,476 1420,462" stroke="#DDE4C8" stroke-width="3" fill="none" opacity=".6"/>`;
    // oliveiras muito ao longe (pontos prateados em filas) num só caminho
    let ol = '', tr = '';
    for (let i = 0; i < 70; i++) {
      const x = rnd() * 1600, y = 488 + rnd() * 26, r = 3 + rnd() * 3;
      ol += `M${n(x - r)},${n(y)}a${n(r)},${n(r * .8)} 0 1,0 ${n(2 * r)},0a${n(r)},${n(r * .8)} 0 1,0 ${n(-2 * r)},0Z`;
      tr += `M${n(x)},${n(y)} l0,${n(r * 1.2)}`;
    }
    s += `<path d="${tr}" stroke="#7A7058" stroke-width="1.4"/><path d="${ol}" fill="#97A47E" opacity=".9"/>`;
    s += `<path d="M0,540 C180,520 340,532 520,522 C700,512 860,534 1040,524 C1220,514 1400,532 1600,520 L1600,640 L0,640 Z" fill="url(#${p}colinaM)"/>`;
    // sulcos da lavoura nas colinas do meio
    let su = '';
    for (let i = 0; i < 14; i++) { const y = 532 + i * 4; su += `M${n(rnd() * 400)},${y} C${n(400 + rnd() * 200)},${y - 3} ${n(900 + rnd() * 200)},${y + 3} ${n(1200 + rnd() * 400)},${y - 1} `; }
    s += `<path d="${su}" stroke="#B9A458" stroke-width="1.4" fill="none" opacity=".5"/>`;
    return s;
  }
  function monteSVG() {
    // monte alentejano caiado com barra azul, telhado de telha e chaminé grande
    return `<g transform="translate(1286,512)">
      <ellipse cx="6" cy="2" rx="80" ry="6" fill="#5A6A30" opacity=".25"/>
      <path d="M-62,0 L-62,-34 L20,-34 L20,0 Z" fill="#F8F5EE"/><path d="M20,0 L20,-26 L62,-26 L62,0 Z" fill="#ECE7DC"/>
      <path d="M-68,-33 L-20,-52 L26,-33 Z" fill="#C8643E"/><path d="M-66,-34 L26,-34" stroke="#8E3E22" stroke-width="2"/>
      <path d="M16,-26 L42,-38 L66,-26 Z" fill="#B85A36"/>
      <rect x="-50" y="-66" width="16" height="30" fill="#F8F5EE"/><rect x="-53" y="-70" width="22" height="6" fill="#F8F5EE" stroke="#D8D2C6" stroke-width="1"/>
      <rect x="-47" y="-61" width="3" height="4" fill="#9A9282"/><rect x="-40" y="-61" width="3" height="4" fill="#9A9282"/>
      <rect x="-62" y="-6" width="124" height="6" fill="#2E6CB5"/>
      <rect x="-14" y="-24" width="12" height="18" fill="#3A2A20"/><rect x="-16" y="-26" width="16" height="2.5" fill="#2E6CB5"/><rect x="-16" y="-24" width="2" height="18" fill="#2E6CB5"/><rect x="-2" y="-24" width="2" height="18" fill="#2E6CB5"/>
      <rect x="-44" y="-24" width="9" height="9" fill="#4A5A70"/><rect x="-46" y="-26" width="13" height="13" fill="none" stroke="#2E6CB5" stroke-width="2"/>
      <rect x="34" y="-19" width="8" height="8" fill="#4A5A70"/><rect x="32" y="-21" width="12" height="12" fill="none" stroke="#2E6CB5" stroke-width="2"/>
      <path d="M-62,-34 L-62,0" stroke="#FFFFFF" stroke-width="2" opacity=".8"/></g>`;
  }
  function searaSVG(p) {
    // três faixas de seara dourada; cada faixa ondula (skewX à volta da sua base)
    const rnd = semente(31);
    let s = `<path d="M0,580 C200,566 420,574 640,568 C860,562 1080,574 1300,566 C1420,562 1520,566 1600,564 L1600,680 L0,680 Z" fill="url(#${p}seara)"/>`;
    const faixas = [[584, 612, .6], [606, 640, .85], [632, 676, 1.1]];
    faixas.forEach(([y0, y1, k], i) => {
      let esp = '', esp2 = '';
      for (let j = 0; j < 150; j++) {
        const x = rnd() * 1640 - 20, y = y0 + rnd() * (y1 - y0), h = (8 + rnd() * 8) * k;
        esp += `M${n(x)},${n(y)} q${n(1 * k)},${n(-h * .6)} ${n(2 * k)},${n(-h)}`;
        if (rnd() < .6) esp2 += `M${n(x + 2 * k)},${n(y - h)} q${n(-1.5 * k)},${n(-3 * k)} 0,${n(-6 * k)} q${n(1.5 * k)},${n(3 * k)} 0,${n(6 * k)}`;
      }
      s += `<g class="cv-seara${i}"><path d="${esp}" stroke="${i % 2 ? '#C38E30' : '#B98428'}" stroke-width="${n(1.2 * k)}" fill="none" stroke-linecap="round" opacity=".8"/>
        <path d="${esp2}" fill="#F7DA86" stroke="#D9A846" stroke-width=".8" opacity=".9"/></g>`;
    });
    return s;
  }
  function posteSVG() {
    // poste velho de madeira com o ninho da cegonha (a cegonha está no grupo cv-cegonha, para poder voar)
    let galhos = '';
    const rnd = semente(51);
    for (let i = 0; i < 26; i++) { const a = rnd() * TAU, r = 16 + rnd() * 20; galhos += `M${n(470 + Math.cos(a) * r * .3)},${n(258 + Math.sin(a) * 4)} l${n(Math.cos(a) * r)},${n(Math.sin(a) * 5 - 2)}`; }
    return `<g>
      <path d="M466,612 L468,262 L476,262 L478,612 Z" fill="#7A6450"/><path d="M468,612 L469,262" stroke="#A89480" stroke-width="2"/>
      <path d="M440,300 L506,300" stroke="#6A5440" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="472" cy="610" rx="18" ry="4" fill="#4A5A20" opacity=".3"/>
      <ellipse cx="472" cy="258" rx="40" ry="13" fill="#8A6A40"/><path d="${galhos}" stroke="#6A4E2C" stroke-width="2.2" stroke-linecap="round"/>
      <ellipse cx="472" cy="252" rx="30" ry="6" fill="#B9965E"/><path d="M446,250 C460,246 486,246 500,250" stroke="#E2C890" stroke-width="2" fill="none" opacity=".7"/></g>`;
  }
  function cegonhaSVG() {
    // cegonha-branca: pousada (de pé no ninho) e em voo (asas abertas); o grupo exterior desloca-se
    return `<g class="cv-cegonha"><g class="cv-cgPousada">
        <path d="M-6,0 L-7,22 M4,0 L5,22" stroke="#E0522A" stroke-width="2.6" stroke-linecap="round"/>
        <ellipse cx="0" cy="-12" rx="20" ry="12" fill="#FFFFFF" stroke="#B8BCC4" stroke-width="1.2"/>
        <path d="M-20,-12 C-14,-2 4,2 14,-4 C6,-6 -8,-8 -20,-12 Z" fill="#1E1E24"/>
        <g class="cv-cgCab"><path d="M10,-18 C14,-28 14,-38 12,-46" stroke="#FFFFFF" stroke-width="7" fill="none" stroke-linecap="round"/>
          <circle cx="12" cy="-48" r="6" fill="#FFFFFF" stroke="#C4C8CE" stroke-width="1"/><circle cx="14" cy="-49" r="1.4" fill="#1A1A1A"/>
          <g class="cv-cgBicoS"><path d="M16,-50 L36,-46 L16,-47 Z" fill="#E0522A"/></g><g class="cv-cgBicoI"><path d="M16,-47 L35,-45.5 L16,-45 Z" fill="#C8401E"/></g></g>
      </g>
      <g class="cv-cgVoo" display="none">
        <g class="cv-cgAsa"><path d="M-4,-2 C-14,-26 -40,-30 -62,-22 C-46,-12 -24,-4 -4,2 Z" fill="#FFFFFF" stroke="#B8BCC4" stroke-width="1"/><path d="M-40,-24 C-48,-26 -56,-25 -62,-22 C-54,-18 -46,-16 -38,-14 Z" fill="#1E1E24"/></g>
        <path d="M-30,0 C-10,-6 14,-6 30,-2 C14,4 -10,4 -30,0 Z" fill="#FFFFFF" stroke="#B8BCC4" stroke-width="1"/>
        <path d="M30,-2 L52,-4" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/><circle cx="54" cy="-4" r="4.5" fill="#FFFFFF"/><path d="M57,-5 L74,-3 L57,-2 Z" fill="#E0522A"/>
        <path d="M-30,0 L-50,4 M-30,1 L-50,7" stroke="#E0522A" stroke-width="2" stroke-linecap="round"/>
        <g class="cv-cgAsa2"><path d="M-4,0 C-16,20 -40,24 -60,18 C-44,10 -24,4 -4,-2 Z" fill="#F2F4F6" stroke="#B8BCC4" stroke-width="1"/><path d="M-38,20 C-46,22 -54,21 -60,18 C-52,14 -44,13 -36,12 Z" fill="#1E1E24"/></g>
      </g></g>`;
  }
  function sobreiroSVG(p) {
    const rnd = semente(61);
    let copa = '', luz = '', esc = '';
    const cl = [[250, 430, 110, 56], [150, 470, 70, 40], [350, 470, 76, 42], [210, 400, 70, 36], [300, 410, 66, 34], [100, 500, 46, 26], [390, 506, 50, 26]];
    for (const [x, y, rx, ry] of cl) {
      for (let k = 0; k < 7; k++) {
        const a = rnd() * TAU, d = rnd() * .6, cx = x + Math.cos(a) * rx * d, cy = y + Math.sin(a) * ry * d, r = (.35 + rnd() * .25) * rx;
        copa += `M${n(cx - r)},${n(cy)}a${n(r)},${n(r * .62)} 0 1,0 ${n(2 * r)},0a${n(r)},${n(r * .62)} 0 1,0 ${n(-2 * r)},0Z`;
        if (Math.cos(a) < .2 && Math.sin(a) < .3) luz += `M${n(cx - r * .7)},${n(cy - r * .2)}a${n(r * .5)},${n(r * .25)} 0 1,0 ${n(r)},0a${n(r * .5)},${n(r * .25)} 0 1,0 ${n(-r)},0Z`;
        else esc += `M${n(cx - r * .6)},${n(cy + r * .25)}a${n(r * .6)},${n(r * .25)} 0 1,0 ${n(r * 1.2)},0a${n(r * .6)},${n(r * .25)} 0 1,0 ${n(-r * 1.2)},0Z`;
      }
    }
    return `<g>
      <ellipse cx="290" cy="652" rx="190" ry="20" fill="url(#${p}sombraArv)"/>
      <path d="M232,652 C240,620 244,590 240,560 C236,530 224,510 200,494 L214,486 C236,500 248,512 254,530 C262,508 280,494 304,486 L312,494 C290,506 276,524 272,552 C268,586 272,620 282,652 Z" fill="url(#${p}casca)" stroke="#3A2E22" stroke-width="2.5"/>
      <path d="M236,652 C242,626 246,604 244,584 L276,584 C274,606 276,628 282,652 Z" fill="url(#${p}cortica)"/>
      <path d="M244,584 C252,580 266,580 276,584" stroke="#5A4232" stroke-width="3" fill="none"/>
      <path d="M252,600 l1,40 M262,596 l-1,46 M246,616 l0,26" stroke="#8A3618" stroke-width="2" opacity=".6"/>
      <path d="M254,606 C258,602 264,604 264,610 C264,616 254,618 254,626 L266,626" stroke="#FFFFFF" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
      <path d="M244,566 l6,-8 M262,548 l-6,-10 M250,530 l8,-6 M236,512 l-4,-10" stroke="#3A2E22" stroke-width="2" opacity=".6"/>
      <g class="cv-copaSob"><path d="${copa}" fill="#2E441A" transform="translate(0,6)"/><path d="${copa}" fill="url(#${p}copa)"/>
        <path d="${esc}" fill="#33491C" opacity=".5"/><path d="${luz}" fill="#9EB866" opacity=".5"/></g></g>`;
  }
  function oliveiraSVG(x, y, k) {
    const rnd = semente(71 + x);
    let c = '';
    for (let i = 0; i < 9; i++) { const a = rnd() * TAU, d = rnd() * 26, cx = Math.cos(a) * d * 1.3, cy = -60 + Math.sin(a) * d * .6, r = 14 + rnd() * 10; c += `M${n(cx - r)},${n(cy)}a${n(r)},${n(r * .7)} 0 1,0 ${n(2 * r)},0a${n(r)},${n(r * .7)} 0 1,0 ${n(-2 * r)},0Z`; }
    return `<g transform="translate(${x},${y}) scale(${k})">
      <ellipse cx="10" cy="0" rx="60" ry="8" fill="#2E3A10" opacity=".25"/>
      <path d="M-8,0 C-4,-14 -12,-26 -6,-40 L2,-42 C-2,-28 6,-16 4,-6 C8,-18 14,-30 12,-44 L18,-42 C20,-28 14,-12 10,0 Z" fill="#5E5040" stroke="#3A3026" stroke-width="1.5"/>
      <path d="${c}" fill="#6E7E56" transform="translate(0,4)"/><path d="${c}" fill="url(#cavalo-oliva)"/></g>`;
  }
  function cercaSVG(x0, x1, yb, k) {
    let postes = '', tabuas = '', luz = '';
    for (let x = x0; x <= x1; x += 120 * k) {
      postes += `M${n(x - 6 * k)},${yb} L${n(x - 5 * k)},${n(yb - 70 * k)} L${n(x + 5 * k)},${n(yb - 74 * k)} L${n(x + 6 * k)},${yb} Z`;
      luz += `M${n(x - 3 * k)},${n(yb - 4)} L${n(x - 2.5 * k)},${n(yb - 66 * k)}`;
    }
    tabuas += `M${x0},${n(yb - 56 * k)} L${x1},${n(yb - 58 * k)} L${x1},${n(yb - 48 * k)} L${x0},${n(yb - 46 * k)} Z M${x0},${n(yb - 30 * k)} L${x1},${n(yb - 32 * k)} L${x1},${n(yb - 22 * k)} L${x0},${n(yb - 20 * k)} Z`;
    return `<path d="M${x0},${yb + 3} L${x1},${yb + 3}" stroke="#4A5A20" stroke-width="6" opacity=".25"/>
      <path d="${tabuas}" fill="#9A7650" stroke="#5E4428" stroke-width="2"/><path d="M${x0},${n(yb - 55 * k)} L${x1},${n(yb - 57 * k)} M${x0},${n(yb - 29 * k)} L${x1},${n(yb - 31 * k)}" stroke="#C9A67A" stroke-width="2" opacity=".7"/>
      <path d="${postes}" fill="#86623E" stroke="#4E3820" stroke-width="2"/><path d="${luz}" stroke="#B89268" stroke-width="2" opacity=".8"/>`;
  }
  function pradoSVG(p) {
    const rnd = semente(81);
    let s = `<path d="M0,660 C220,648 460,656 700,650 C940,644 1180,654 1600,646 L1600,900 L0,900 Z" fill="url(#${p}prado)"/>`;
    // carreiro de terra até à cavalariça
    s += `<path d="M120,900 C260,860 420,812 600,792 C760,776 880,778 960,772 L1066,772 C1080,782 1060,800 1010,812 C860,836 640,850 520,900 Z" fill="url(#${p}carreiro)"/>
      <path d="M300,880 C420,840 540,816 680,800 M760,792 C840,786 900,786 950,782" stroke="#C9A878" stroke-width="2" fill="none" opacity=".6"/>`;
    // erva parada: um caminho por cor
    const cores = ['#7E9238', '#A6B656', '#5E7428', '#C2C66A'], cam = cores.map(() => '');
    for (let i = 0; i < 520; i++) {
      const y = 652 + Math.pow(rnd(), .8) * 248, x = rnd() * 1640 - 20, k = .4 + (y - 650) / 250 * 1.1;
      const h = (6 + rnd() * 8) * k, inc = (rnd() - .5) * 6 * k, c = rnd() * 4 | 0;
      cam[c] += `M${n(x)},${n(y)} q${n(inc * .4)},${n(-h * .6)} ${n(inc)},${n(-h)}`;
    }
    s += cam.map((d, i) => `<path d="${d}" stroke="${cores[i]}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".85"/>`).join('');
    // papoilas e malmequeres parados (ao longe pequenos, perto maiores)
    let pap = '', mal = '', cen = '';
    for (let i = 0; i < 70; i++) {
      const y = 660 + rnd() * 230, x = rnd() * 1600, k = .5 + (y - 660) / 230;
      if (x > 560 && x < 1120 && y > 740) continue;
      const r = 4.5 * k;
      if (rnd() < .6) { pap += `M${n(x - r)},${n(y)}a${n(r)},${n(r * .8)} 0 1,0 ${n(2 * r)},0a${n(r)},${n(r * .8)} 0 1,0 ${n(-2 * r)},0Z`; cen += `M${n(x - r * .3)},${n(y)}a${n(r * .3)},${n(r * .3)} 0 1,0 ${n(r * .6)},0a${n(r * .3)},${n(r * .3)} 0 1,0 ${n(-r * .6)},0Z`; }
      else mal += `M${n(x - r * .9)},${n(y)}a${n(r * .9)},${n(r * .55)} 0 1,0 ${n(r * 1.8)},0a${n(r * .9)},${n(r * .55)} 0 1,0 ${n(-r * 1.8)},0Z`;
    }
    s += `<path d="${pap}" fill="#E0302A"/><path d="${mal}" fill="#FFFFFF" opacity=".9"/><path d="${cen}" fill="#2A1A1A"/>`;
    return s;
  }
  // tufo de papoilas que balança (primeiro plano)
  function papoilasSVG(i, x, y, k) {
    const rnd = semente(300 + i);
    let hastes = '', flores = '';
    for (let j = 0; j < 5; j++) {
      const bx = (j - 2) * 9 * k, h = (46 + rnd() * 40) * k, ex = bx + (rnd() - .5) * 20 * k;
      hastes += `M${n(bx)},0 Q${n(bx + (ex - bx) * .3)},${n(-h * .5)} ${n(ex)},${n(-h)}`;
      if (rnd() < .8) flores += `<g transform="translate(${n(ex)},${n(-h)}) scale(${n3(k)})"><path d="M0,0 C-12,-2 -14,-14 -6,-17 C-2,-19 2,-19 6,-17 C14,-14 12,-2 0,0 Z" fill="#E4342C" stroke="#9A1A16" stroke-width="1.2"/>
        <path d="M0,0 C-6,-6 -14,-6 -14,-12 M0,0 C6,-6 14,-6 14,-12" stroke="#F86A5A" stroke-width="1.4" fill="none" opacity=".7"/><circle cx="0" cy="-8" r="3.4" fill="#2A1A1A"/></g>`;
      else flores += `<ellipse cx="${n(ex)}" cy="${n(-h)}" rx="${n(3.5 * k)}" ry="${n(5 * k)}" fill="#6A8A2C"/>`;
    }
    return `<g class="cv-pap${i}" transform="translate(${x},${y})"><g class="cv-papIn"><path d="${hastes}" stroke="#5E7A28" stroke-width="${n(2 * k)}" fill="none" stroke-linecap="round"/>${flores}</g></g>`;
  }
  function ervaFrenteSVG(i, x, y, k, flip) {
    const rnd = semente(200 + i);
    let d = '';
    for (let j = 0; j < 9; j++) {
      const a = (j - 4) * 9 + (rnd() - .5) * 8, h = (50 + rnd() * 46) * k, bx = (j - 4) * 4 * k;
      const ex = bx + Math.sin(a * RAD) * h, ey = -Math.cos(a * RAD) * h;
      d += `M${n(bx - 3 * k)},0 Q${n(bx + ex * .3)},${n(ey * .55)} ${n(ex)},${n(ey)} Q${n(bx + ex * .3 + 4 * k)},${n(ey * .5)} ${n(bx + 3 * k)},0 Z`;
    }
    return `<g class="cv-erva${i}" transform="translate(${x},${y})${flip ? ' scale(-1,1)' : ''}"><g class="cv-ervaIn"><path d="${d}" fill="${i % 2 ? '#6E8A2E' : '#86A038'}" stroke="#4A5E1C" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="#C8D884" stroke-width=".8" opacity=".5"/></g></g>`;
  }
  function andorinhasSVG() {
    return [0, 1, 2].map(i => `<path class="cv-ave${i}" d="M-9,0 Q-4,-5 0,0 Q4,-5 9,0 M0,0 l-3,5 M0,0 l3,5" stroke="#2A2A3A" stroke-width="2" fill="none" stroke-linecap="round"/>`).join('');
  }

  /* --- Cavalariça (habitat): fachada de tábuas com soco de pedra, telhado de telha, porta dividida a meio
         (a de cima aberta encostada à parede; a de baixo abre e fecha), manjedoura de palha à direita da porta --- */
  const PORTA = { x: 1010, z: -90 };                 // plano da porta (profundidade)
  const AB = { x0: 936, x1: 1084, y0: 328, meio: 506, chao: 768 };
  const FACHADA = 'M846,300 L1011,236 L1176,300 L1176,770 L846,770 Z';
  const ABERTURA = `M${AB.x0},${AB.y0} H${AB.x1} V${AB.chao} H${AB.x0} Z`;
  const ABERTURA_ALTA = `M${AB.x0},${AB.y0} H${AB.x1} V${AB.meio} H${AB.x0} Z`;
  const MANJ = { x: 1134, y: 572 };                  // boca da manjedoura (onde o cavalo come)
  function estabTrasSVG(p) {
    const rnd = semente(91);
    let tab = '', palha = '';
    for (let x = AB.x0 + 14; x < AB.x1; x += 22) tab += `M${x},${AB.y0} L${x},700`;
    for (let i = 0; i < 70; i++) { const x = AB.x0 + rnd() * (AB.x1 - AB.x0), y = 700 + rnd() * 66, a = (rnd() - .5) * 2; palha += `M${n(x)},${n(y)} l${n(10 * Math.cos(a))},${n(4 * Math.sin(a) - 2)}`; }
    return `<g clip-path="url(#${p}abertura)">
      <path d="${ABERTURA}" fill="url(#${p}interior)"/>
      <path d="${tab}" stroke="#140A04" stroke-width="2" opacity=".5"/>
      <rect x="${AB.x1 - 46}" y="372" width="26" height="26" fill="#F6E2A0" opacity=".55"/><path d="M${AB.x1 - 33},372 V398 M${AB.x1 - 46},385 H${AB.x1 - 20}" stroke="#2A1A0C" stroke-width="2.5"/>
      <path d="M${AB.x1 - 46},398 L${AB.x0 + 30},700 L${AB.x0 + 70},700 L${AB.x1 - 20},398 Z" fill="#F6E2A0" opacity=".07"/>
      <g transform="translate(962,430)"><path d="M0,0 L80,0 L72,40 L8,40 Z" fill="#3A2412" stroke="#1A0E06" stroke-width="2"/>
        <path d="M2,0 C10,-14 30,-18 40,-10 C52,-20 70,-14 78,0 Z" fill="#B89448"/><path d="M8,0 L14,40 M24,0 L28,40 M40,0 L40,40 M56,0 L52,40 M72,0 L66,40" stroke="#5A3A1C" stroke-width="2.5"/></g>
      <path d="M${AB.x0},700 L${AB.x1},700 L${AB.x1},768 L${AB.x0},768 Z" fill="url(#${p}palha)" opacity=".75"/>
      <path d="${palha}" stroke="#F6DC94" stroke-width="1.6" opacity=".7"/>
      <path d="M${AB.x0},${AB.y0} H${AB.x1} V${AB.y0 + 40} H${AB.x0} Z" fill="#000" opacity=".3"/>
      <path d="M${AB.x0},${AB.y0} V${AB.chao} H${AB.x0 + 18} V${AB.y0} Z" fill="#000" opacity=".25"/></g>`;
  }
  function meiaPortaSVG(p, cls) {
    // meia-porta de baixo em coordenadas locais (dobradiça em x = 0; o desenho vai de x 0 a 148); o motor põe a matriz
    const W = AB.x1 - AB.x0, y0 = AB.meio, y1 = AB.chao - 2;
    let tab = '';
    for (let x = 37; x < W; x += 37) tab += `M${x},${y0 + 8} L${x},${y1}`;
    return `<g class="${cls}">
      <rect x="0" y="${y0}" width="${W}" height="${y1 - y0}" fill="url(#${p}porta)" stroke="#2E3418" stroke-width="2.5"/>
      <path d="${tab}" stroke="#3E4A22" stroke-width="2.5"/>
      <path d="M6,${y0 + 30} L${W - 6},${y1 - 34} M6,${y0 + 30} L${W - 6},${y0 + 30} M6,${y1 - 34} L${W - 6},${y1 - 34}" stroke="#4E5A2C" stroke-width="9" stroke-linecap="round"/>
      <path d="M6,${y0 + 27} L${W - 6},${y0 + 27} M6,${y1 - 37} L${W - 6},${y1 - 37} M8,${y0 + 28} L${W - 8},${y1 - 36}" stroke="#A4B474" stroke-width="2" opacity=".6"/>
      <rect x="-4" y="${y0 - 6}" width="${W + 8}" height="12" rx="3" fill="#5E6E38" stroke="#2E3418" stroke-width="2"/><path d="M0,${y0 - 3} L${W},${y0 - 3}" stroke="#B4C482" stroke-width="2" opacity=".7"/>
      <path d="M-2,${y0 + 30} L22,${y0 + 30} M-2,${y1 - 34} L22,${y1 - 34}" stroke="#2A2A2A" stroke-width="5" stroke-linecap="round"/>
      <rect x="${W - 26}" y="${y0 + 60}" width="18" height="8" rx="2" fill="#3A3A3A"/><circle cx="${W - 12}" cy="${y0 + 64}" r="3.5" fill="#6A6A6A"/>
      <path d="M2,${y0 + 6} L2,${y1}" stroke="#C4D292" stroke-width="2.5" opacity=".5"/></g>`;
  }
  function manjFrenteSVG(p) {
    return `<path d="M1098,574 L1172,574 L1168,604 L1102,604 Z" fill="url(#${p}madeira)" stroke="#3A2010" stroke-width="2.5"/>
      <path d="M1100,588 L1170,588" stroke="#5A3418" stroke-width="2"/><path d="M1100,577 L1170,577" stroke="#C88A5A" stroke-width="2" opacity=".6"/>
      <path d="M1104,576 l-6,-12 M1114,575 l-2,-15 M1126,575 l3,-13 M1140,575 l-4,-16 M1152,575 l5,-12 M1164,576 l6,-10" stroke="#E8C36A" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="1106" cy="595" r="2" fill="#2A1A10"/><circle cx="1164" cy="595" r="2" fill="#2A1A10"/>`;
  }
  function estabFrenteSVG(p) {
    const rnd = semente(101);
    let tab = '', veio = '', pedras = '';
    for (let x = 872; x < 1176; x += 26) {
      if (x > AB.x0 - 16 && x < AB.x1 + 16) { tab += `M${x},${n((x < 1011 ? 300 - (x - 846) / 165 * 64 : 236 + (x - 1011) / 165 * 64) + 2)} L${x},${AB.y0 - 16}`; continue; }
      const yt = x < 1011 ? 300 - (x - 846) / 165 * 64 : 236 + (x - 1011) / 165 * 64;
      tab += `M${x},${n(yt + 2)} L${x},738`;
    }
    for (let i = 0; i < 40; i++) {
      const x = 852 + rnd() * 318, y = 330 + rnd() * 400;
      if (x > AB.x0 - 16 && x < AB.x1 + 16 && y > AB.y0 - 14) continue;
      veio += `M${n(x)},${n(y)} c${n(2)},${n(8)} ${n(-2)},${n(16)} 0,${n(24 + rnd() * 20)}`;
    }
    for (let x = 846; x < 1176; x += 30 + rnd() * 14) pedras += `M${n(x)},740 l0,30 `;
    const nos = [[880, 420], [1140, 470], [1120, 660], [870, 600], [1000, 280]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3" fill="#5A3018"/><ellipse cx="${x}" cy="${y}" rx="9" ry="5" fill="none" stroke="#6A3A1C" stroke-width="1.4"/>`).join('');
    return `<g class="cv-estab">
      <path d="M1176,770 C1230,772 1290,778 1330,786 L1176,786 Z" fill="#2E3A10" opacity=".22"/>
      <path d="${FACHADA} ${ABERTURA}" fill-rule="evenodd" fill="url(#${p}madeiraV)" stroke="#3A2010" stroke-width="3"/>
      <path d="${tab}" stroke="#5A3018" stroke-width="2.4"/>
      <path d="${tab.replace(/M(\d+)/g, (m, x) => 'M' + (+x + 3))}" stroke="#B87A4A" stroke-width="1.4" opacity=".45"/>
      <path d="${veio}" stroke="#6A3A1C" stroke-width="1.6" fill="none" opacity=".6"/>${nos}
      <path d="M846,300 L1011,236 L1176,300 L1176,330 L846,330 Z" fill="#3A1A08" opacity=".22"/>
      <rect x="840" y="738" width="342" height="32" fill="url(#${p}pedra)" stroke="#6A6254" stroke-width="2"/><path d="${pedras} M840,754 L1182,754" stroke="#8A8272" stroke-width="2"/>
      <rect x="846" y="296" width="16" height="444" fill="url(#${p}madeira)" stroke="#3A2010" stroke-width="2"/><rect x="1160" y="296" width="16" height="444" fill="url(#${p}madeira)" stroke="#3A2010" stroke-width="2"/>
      <path d="M816,316 L1011,226 L1206,316" stroke="#7A2E18" stroke-width="30" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M816,312 L1011,222 L1206,312" stroke="url(#${p}telha)" stroke-width="24" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M816,312 L1011,222 L1206,312" stroke="#E8946A" stroke-width="20" stroke-dasharray="3 15" fill="none" opacity=".55"/>
      <path d="M820,322 L1011,234 L1202,322" stroke="#5A2010" stroke-width="3" fill="none" opacity=".5"/>
      <path d="M997,272 C994,292 1000,304 1011,304 C1022,304 1028,292 1025,272" stroke="#8A8E96" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M997,272 C994,292 1000,304 1011,304" stroke="#D8DCE2" stroke-width="2" fill="none" opacity=".8"/>
      <g fill="#3A3A40"><circle cx="997" cy="280" r="1.6"/><circle cx="999" cy="292" r="1.6"/><circle cx="1025" cy="280" r="1.6"/><circle cx="1023" cy="292" r="1.6"/></g>
      <rect x="922" y="316" width="14" height="452" fill="url(#${p}madeira)" stroke="#3A2010" stroke-width="2"/>
      <rect x="1084" y="316" width="14" height="452" fill="url(#${p}madeira)" stroke="#3A2010" stroke-width="2"/>
      <rect x="912" y="312" width="196" height="16" rx="2" fill="url(#${p}madeira)" stroke="#3A2010" stroke-width="2"/>
      <path d="M925,318 L925,766 M914,315 L1106,315" stroke="#D09A68" stroke-width="2" opacity=".6"/>
      <g fill="#2A1A10"><circle cx="929" cy="340" r="2"/><circle cx="929" cy="740" r="2"/><circle cx="1091" cy="340" r="2"/><circle cx="1091" cy="740" r="2"/><circle cx="920" cy="320" r="2"/><circle cx="1100" cy="320" r="2"/></g>
      <path d="M922,330 L852,350 L852,524 L922,504 Z" fill="url(#${p}portaT)" stroke="#2E3418" stroke-width="2.5"/>
      <path d="M904,335 L904,509 M886,340 L886,514 M868,345 L868,519" stroke="#3E4A22" stroke-width="2"/>
      <path d="M918,360 L856,516 M918,358 L856,376 M918,488 L856,506" stroke="#4E5A2C" stroke-width="7" stroke-linecap="round"/>
      <path d="M922,330 L922,504" stroke="#1E2410" stroke-width="3"/>
      <path d="M852,524 L922,504 L926,520 L860,540 Z" fill="#2E3A10" opacity=".2"/>
      <path d="M1102,552 L1168,552 L1172,574 L1098,574 Z" fill="#4A2A14" stroke="#2A160A" stroke-width="2"/>
      <path d="M1100,554 C1110,540 1124,536 1134,544 C1144,534 1160,538 1170,554 Z" fill="url(#${p}palha)" stroke="#A88030" stroke-width="1.5"/>
      <path d="M1108,550 l-4,-10 M1120,546 l2,-12 M1132,546 l-3,-12 M1146,546 l4,-11 M1158,548 l6,-8" stroke="#F6DC94" stroke-width="2" stroke-linecap="round"/>
      <path d="M1098,604 L1104,630 M1172,604 L1166,630" stroke="#3A2010" stroke-width="5" stroke-linecap="round"/>
      ${manjFrenteSVG(p)}
      <g transform="translate(1122,766)"><ellipse cx="4" cy="2" rx="24" ry="5" fill="#2E3A10" opacity=".3"/><path d="M-16,0 L-19,-30 L19,-30 L16,0 Z" fill="#8E949C" stroke="#4A4E54" stroke-width="2"/>
        <path d="M-18,-22 L18,-22 M-17,-8 L17,-8" stroke="#5A5E66" stroke-width="2.5"/><path d="M-12,-28 L-10,-2" stroke="#D2D8DE" stroke-width="3" opacity=".6"/><path d="M-19,-30 C-14,-46 14,-46 19,-30" stroke="#5A5E66" stroke-width="2" fill="none"/></g>
      ${(() => { let d = ''; const r2 = semente(111); for (let i = 0; i < 26; i++) { const x = 900 + r2() * 220, y = 766 + r2() * 14, a = (r2() - .5) * 2.4; d += `M${n(x)},${n(y)} l${n(12 * Math.cos(a))},${n(4 * Math.sin(a))}`; } return `<path d="${d}" stroke="#E9C878" stroke-width="2" stroke-linecap="round" opacity=".9"/>`; })()}
      <g class="cv-mpG">${meiaPortaSVG(p, 'cv-mp')}</g>
    </g>`;
  }

  /* --- Bichos e partículas dos acontecimentos --- */
  function lebreSVG() {
    return `<g class="cv-lebre" display="none"><g class="cv-lebreIn">
      <ellipse cx="0" cy="-12" rx="17" ry="10" fill="#A4805A"/><ellipse cx="-2" cy="-8" rx="12" ry="5" fill="#E6D2B4"/>
      <g class="cv-lebrePT"><path d="M-12,-8 C-20,-6 -22,2 -14,2 L-2,2" fill="#8E6A46"/></g>
      <g class="cv-lebrePF"><path d="M10,-6 L14,2 M6,-6 L8,2" stroke="#8E6A46" stroke-width="3" stroke-linecap="round"/></g>
      <circle cx="15" cy="-20" r="7.5" fill="#A4805A"/><circle cx="18" cy="-21" r="1.6" fill="#1A1008"/><circle cx="22" cy="-18" r="1.4" fill="#5A3A2A"/>
      <g class="cv-lebreOr"><path d="M12,-26 C8,-40 10,-48 14,-50 C17,-44 17,-34 15,-26 Z" fill="#A4805A" stroke="#6A4A2E" stroke-width="1"/><path d="M15,-26 C14,-38 17,-46 21,-47 C23,-40 21,-32 18,-25 Z" fill="#B48E66" stroke="#6A4A2E" stroke-width="1"/></g>
      <circle cx="-17" cy="-15" r="5" fill="#F4ECE0"/></g></g>`;
  }
  function moscaSVG() {
    return `<g class="cv-mosca" display="none"><g transform="scale(1.3)">
      <ellipse class="cv-asaM" cx="-3" cy="-6" rx="7" ry="3.6" fill="#E8F0F8" opacity=".7" stroke="#9AA6B2" stroke-width=".6" transform="rotate(-28)"/>
      <ellipse class="cv-asaM" cx="2" cy="-6" rx="7" ry="3.6" fill="#E8F0F8" opacity=".7" stroke="#9AA6B2" stroke-width=".6" transform="rotate(22)"/>
      <ellipse cx="0" cy="0" rx="6.5" ry="4.3" fill="#2C2A30"/><circle cx="6.5" cy="-1" r="3.6" fill="#3A3640"/><circle cx="8" cy="-2" r="1.7" fill="#B8323A"/></g></g>`;
  }
  function particulasSVG() {
    let s = '';
    for (let i = 0; i < 10; i++) s += `<ellipse class="cv-po${i}" display="none" rx="9" ry="6" fill="#D8BE8E"/>`;
    for (let i = 0; i < 8; i++) s += `<path class="cv-pa${i}" display="none" d="M-7,0 L7,0" stroke="#EBCB78" stroke-width="2.4" stroke-linecap="round"/>`;
    for (let i = 0; i < 6; i++) s += `<circle class="cv-bf${i}" display="none" r="7" fill="#FFFFFF"/>`;
    return s;
  }

  /* ================= 5) Ícone do menu (retrato parado, sem gradientes nem recortes com id) ================= */
  function iconeSVG() {
    const C = COR.cont;
    const E = estadoCabeca(Object.assign({}, CAB0, { Y: -.42, F: .9, beta: 56, feliz: .2, sorriso: 1, tE: .9, tD: .7, oE: -4, oD: 6, franja: -6 }));
    const cab = cabecaSVG('cavalo-', E, true);
    let crinaI = '';
    for (let k = 0; k < 6; k++) { const y = 96 + k * 15, x = 138 + k * 3; crinaI += `M${x - 4},${y} C${x + 10},${y + 2} ${x + 18},${y + 10} ${x + 20},${y + 22} C${x + 12},${y + 16} ${x + 4},${y + 16} ${x - 4},${y + 14} Z`; }
    return `<circle cx="110" cy="110" r="106" fill="#E9C766"/><path d="M4,110 A106,106 0 0 1 216,110 Z" fill="#9CCDEE"/>
      <path d="M8,132 C60,118 150,124 212,128 L214,140 L6,142 Z" fill="#B9C29A"/>
      <g fill="#E0302A"><circle cx="40" cy="170" r="5"/><circle cx="62" cy="186" r="4"/><circle cx="176" cy="178" r="5"/><circle cx="190" cy="160" r="4"/></g>
      <circle cx="110" cy="110" r="106" fill="none" stroke="#D2A848" stroke-width="3"/>
      <path d="M78,214 C84,170 96,130 116,104 L156,104 C164,140 168,180 170,212 A106,106 0 0 1 78,214 Z" fill="${C}" stroke="${C}" stroke-width="7" stroke-linejoin="round"/>
      <path d="M78,214 C84,170 96,130 116,104 L156,104 C164,140 168,180 170,212 A106,106 0 0 1 78,214 Z" fill="#A9622C"/>
      <path d="M100,150 C104,130 112,116 122,108" stroke="#D08A4A" stroke-width="8" fill="none" opacity=".45" stroke-linecap="round"/>
      <path d="${crinaI}" fill="#3B2014" stroke="#22110A" stroke-width="2" stroke-linejoin="round"/>
      <g transform="translate(112,78) scale(.84)">${cab}</g>`;
  }

  /* ================= 6) montar() ================= */
  // Pose de repouso (fora): de pé, a 3/4 virado para a esquerda e para nós, cabeça a olhar para a criança
  const REP = { X: 730, Z: 0, th: PI - .5 };
  const APROX = { x: PORTA.x, z: 74 };               // onde se vira para a porta (de costas, os cascos de trás ficam a y ≤ 805)
  const APROX_E = { x: 830, z: 74 };                 // à esquerda da porta: aqui vira-se (a cabeça e a cauda ficam longe da seta direita)
  const DENTRO = { x: PORTA.x, z: -250 };            // centro do cavalo dentro da cavalariça
  const CORPO0 = { alt: 0, incl: 0, nA: 58, nC: -7, nY: 0, nTh: 0, cTurn: -.5, cB: 52, cRoll: 0, fAbre: 0, fAvanca: 0 };
  const ROSTO0 = { olhos: 1, feliz: 0, oE: 0, oD: 0, tE: 1, tD: 1, orelhas: 0, boca: 0, sobr: 0, nariz: 0, sorriso: .4, olhoEsc: 1 };
  const CAUDA_0 = { cauA: 0, cauAmp: 5, cauVel: .35, cauLado: 0 };
  const PORTA_FORA = { nA: 24, nC: 5, nY: 0, nTh: 0, cTurn: 0, cB: 66, alt: 0, incl: 0, cRoll: 0 };   // cabeça por cima da meia-porta
  const COMER_MANJ = { nA: 6, nC: 5, nY: -.06, nTh: -.62, cTurn: -.3, cB: 84, alt: -4, incl: 0, cRoll: 0 };
  const TROTE = { D: 172, beta: .46, alt: 44, ordem: { tE: 0, fD: 0, tD: .5, fE: .5 } };      // pares diagonais
  const PASSO_ = { D: 118, beta: .68, alt: 28, ordem: { tE: 0, fE: .25, tD: .5, fD: .75 } };  // passo a 4 tempos

  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .4 : 1;
    const p = 'cavalo-';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.innerHTML = `<defs>${defsCavalo(p)}${defsCena(p)}</defs>
      <rect width="1600" height="640" fill="url(#${p}ceu)"/>
      <circle cx="190" cy="150" r="420" fill="url(#${p}solBrilho)"/>
      <circle cx="190" cy="150" r="46" fill="url(#${p}sol)"/>
      <g class="cv-nuvens">${nuvemSVG(0, 1)}${nuvemSVG(1, .7)}${nuvemSVG(2, .85)}${nuvemSVG(3, .55)}</g>
      ${colinasSVG(p)}${monteSVG()}
      <g class="cv-aves">${andorinhasSVG()}</g>
      ${searaSVG(p)}
      ${oliveiraSVG(1480, 650, .9)}${oliveiraSVG(700, 600, .55)}
      ${cercaSVG(-20, 800, 690, 1)}${cercaSVG(1180, 1620, 700, 1)}
      ${posteSVG()}${cegonhaSVG()}
      ${sobreiroSVG(p)}
      ${pradoSVG(p)}
      ${lebreSVG()}
      <g class="cv-habitat">
        <g class="cv-estabTras">${estabTrasSVG(p)}</g>
        <g class="cv-estabFrente">${estabFrenteSVG(p)}</g>
        ${cavaloSVG(p)}
      </g>
      <g class="cv-particulas">${particulasSVG()}</g>
      ${moscaSVG()}
      ${papoilasSVG(0, 120, 896, 1.2)}${papoilasSVG(1, 300, 904, 1)}${papoilasSVG(2, 1300, 900, 1.1)}${papoilasSVG(3, 1500, 892, 1.3)}${papoilasSVG(4, 820, 906, .8)}
      ${ervaFrenteSVG(0, 30, 906, 1.1, false)}${ervaFrenteSVG(1, 200, 912, .9, true)}${ervaFrenteSVG(2, 420, 908, .7, false)}${ervaFrenteSVG(3, 1200, 910, .8, true)}${ervaFrenteSVG(4, 1420, 912, 1.05, false)}${ervaFrenteSVG(5, 1580, 906, .9, true)}${ervaFrenteSVG(6, 1000, 914, .5, false)}
      <rect width="1600" height="900" fill="url(#${p}luzQuente)" pointer-events="none"/>
      <rect width="1600" height="900" fill="url(#${p}vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s), qa = s => Array.from(svg.querySelectorAll(s));
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function poeT(lista, v) { for (const e of lista) poe(e, v); }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; if (v == null) el.removeAttribute(nome); else el.setAttribute(nome, v); } }

    /* --- referências --- */
    const R = {
      habitat: q('.cv-habitat'), cavalo: q('.cv-cavalo'), corpo: q('.cv-corpo'), sombra: q('.cv-sombra'),
      tronco: q('.cv-tronco'), troncoR: q('.cv-troncoR'), peito: q('.cv-peito'), garupa: q('.cv-garupa'),
      pernasTras: q('.cv-pernasTras'), pernasFrente: q('.cv-pernasFrente'),
      cauda: q('.cv-cauda'), slotCT: q('.cv-slotCaudaT'), slotCF: q('.cv-slotCaudaF'),
      caudaC: q('.cv-caudaC'), caudaF: q('.cv-caudaF'), caudaM: q('.cv-caudaM'), caudaM2: q('.cv-caudaM2'),
      frente: q('.cv-frente'), slotPT: q('.cv-slotPescT'), slotPF: q('.cv-slotPescF'),
      pc: Array.from({ length: N_PESC }, (_, i) => qa('.cv-pc' + i)), pj: Array.from({ length: N_PESC }, (_, i) => qa('.cv-pj' + i)),
      crina: Array.from({ length: N_PESC }, (_, i) => q('.cv-crina' + i)), cc: Array.from({ length: N_PESC }, (_, i) => q('.cv-cc' + i)),
      cab: q('.cv-cab'), copia: q('.cv-copia'), sombraDentro: q('.cv-sombraDentro'), copiaManj: q('.cv-copiaManj'), mp: q('.cv-mp'), mpC: q('.cv-mpC'), estab: q('.cv-estab'),
      nuvens: [0, 1, 2, 3].map(i => q('.cv-nuvem' + i)), aves: [0, 1, 2].map(i => q('.cv-ave' + i)),
      searas: [0, 1, 2].map(i => q('.cv-seara' + i)), paps: [0, 1, 2, 3, 4].map(i => q('.cv-pap' + i + ' .cv-papIn')),
      ervas: Array.from({ length: 7 }, (_, i) => q('.cv-erva' + i + ' .cv-ervaIn')), copaSob: q('.cv-copaSob'),
      cg: q('.cv-cegonha'), cgPousada: q('.cv-cgPousada'), cgVoo: q('.cv-cgVoo'), cgCab: q('.cv-cgCab'), cgBicoS: q('.cv-cgBicoS'), cgBicoI: q('.cv-cgBicoI'), cgAsa: q('.cv-cgAsa'), cgAsa2: q('.cv-cgAsa2'),
      lebre: q('.cv-lebre'), lebreIn: q('.cv-lebreIn'), lebrePT: q('.cv-lebrePT'), lebrePF: q('.cv-lebrePF'), lebreOr: q('.cv-lebreOr'),
      mosca: q('.cv-mosca'), asasM: qa('.cv-asaM'),
      po: Array.from({ length: 10 }, (_, i) => q('.cv-po' + i)), pa: Array.from({ length: 8 }, (_, i) => q('.cv-pa' + i)), bf: Array.from({ length: 6 }, (_, i) => q('.cv-bf' + i))
    };
    const H = {};
    for (const k of ['orelhaE', 'orelhaD', 'orelhaInE', 'orelhaInD', 'olhoE', 'olhoD', 'narE', 'narD', 'bochE', 'bochD', 'sobrE', 'sobrD', 'bocaInt', 'dentesS', 'dentesI', 'malha', 'snip', 'franja', 'estrela', 'ganache', 'rosto', 'rostoC'])
      H[k] = q('.cv-' + k);
    H.ponte = [q('.cv-ponteC'), q('.cv-ponte')]; H.foc = [q('.cv-focC'), q('.cv-foc')]; H.queixo = [q('.cv-queixoC'), q('.cv-queixo')];
    H.ponteR = [q('.cv-ponteCr'), q('.cv-ponteR')]; H.malhaR = q('.cv-malhaR'); H.boca = q('.cv-boca');
    H.iris = [q('.cv-irisE'), q('.cv-irisD')];
    H.palp = ['E', 'D'].map(k => ({ s: q('.cv-palpS' + k), i: q('.cv-palpI' + k), c: q('.cv-cil' + k) }));
    const pernaEl = PERNAS.map(pe => ({
      g: q('.cv-' + pe.id), sup: qa(`.cv-${pe.id}-sup`), inf: qa(`.cv-${pe.id}-inf`), joe: qa(`.cv-${pe.id}-joe`), bol: qa(`.cv-${pe.id}-bol`), casco: qa(`.cv-${pe.id}-casco`),
      sombra: q('.cv-sp-' + pe.id)
    }));

    /* --- estado --- */
    const P = Object.assign({ X: REP.X, Z: REP.Z, th: REP.th, nAw: 0, cBw: 0, cTurnG: 0, cBG: 0, olharX: 0, olharY: 0, respA: 1, respF: .24,
      mastX: 0, mastY: 0, somB: 0, somR: 0, somN: 0, crinaAb: 0, pele: 0, porta: 0, franjaV: 0 }, CORPO0, ROSTO0, CAUDA_0);
    let modo = 'fora', reagindo = false, tempo = 0, vivo = true;
    let recortar = false, forcaCab = false;                               // o cavalo está (ou vai estar) para lá do plano da porta
    const fase = { resp: 0, cauda: 0 };
    let cabMundo = [0, 0], cabY = -.5, cabZ = 0, bocaMundo = [0, 0], narMundo = [0, 0], garupaMundo = [0, 0];
    const pes = PERNAS.map(pe => ({ pe, x: 0, z: 0, y: 0, inc: 0 }));
    const peDe = id => pes.find(f => f.pe.id === id);
    function restPe(pe, X, Z, th) {
      const u = pe.pu + (pe.fr ? P.fAvanca : 0), v = pe.v + pe.lado * (pe.fr ? P.fAbre : 0);
      return [X + ESC * (u * Math.cos(th) - v * Math.sin(th)), Z + ESC * (u * Math.sin(th) + v * Math.cos(th))];
    }
    function assentarPes() { for (const f of pes) { const r = restPe(f.pe, P.X, P.Z, P.th); f.x = r[0]; f.z = r[1]; f.y = 0; f.inc = 0; } }
    assentarPes();

    /* --- impulsos curtos (orelhas, cauda, cabeça, porta) --- */
    const impulsos = [];
    const IMP = { twE: 0, twD: 0, flick: 0, cabR: 0, porta: 0, crina: 0, franja: 0 };
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
    // a crina e a franja seguem a cabeça com atraso (mola sobre a velocidade horizontal da cabeça)
    const molaCrina = { x: 0, v: 0, ultimo: null };
    function atualizarCrina(dt) {
      const h = Math.min(dt, 50) / 1000;
      const vel = molaCrina.ultimo == null ? 0 : (cabMundo[0] - molaCrina.ultimo) / Math.max(h, .001);
      molaCrina.ultimo = cabMundo[0];
      molaCrina.v += (-120 * molaCrina.x - 9 * molaCrina.v - limita(vel, -900, 900) * .9) * h;
      molaCrina.x = limita(molaCrina.x + molaCrina.v * h, -30, 30);
    }

    /* --- desenhar: lê P e põe as transformações em todas as peças --- */
    let ordemPernas = '', caudaNaFrente = false, pescocoAtras = false;
    const tr = (x, y, r) => `translate(${n(x)},${n(y)}) rotate(${n(r)})`;
    function desenhar() {
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
      poe(R.troncoR, `scale(1,${n3(1 + .014 * resp)})`);
      atr(R.tronco, 'opacity', n3(passoS(.1, .38, Math.abs(c))));      // de frente/costas o perfil some-se (fica o peito ou a garupa)
      const wF = 1 - passoS(.3, .86, Math.abs(c));
      if (wF > .02 && s > 0) {
        const pc = T(W(112, 0, 242));
        atr(R.peito, 'display', 'inline'); atr(R.garupa, 'display', 'none');
        poe(R.peito, `translate(${n(pc[0])},${n(pc[1])}) scale(${n3(wF * ESC)},${n3(ESC * (1 + .012 * resp))})`);
      } else if (wF > .02) {
        const pg = T(W(-140, 0, 250));
        atr(R.garupa, 'display', 'inline'); atr(R.peito, 'display', 'none');
        poe(R.garupa, `translate(${n(pg[0] + trem)},${n(pg[1])}) scale(${n3(wF * ESC)},${ESC})`);
      } else { atr(R.peito, 'display', 'none'); atr(R.garupa, 'display', 'none'); }
      garupaMundo = T(W(-120, 0, 300));

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

      // pescoço e cabeça atrás do tronco quando está de costas
      const querPT = pescocoAtras ? s < -.12 : s < -.3;
      if (querPT !== pescocoAtras) { pescocoAtras = querPT; (querPT ? R.slotPT : R.slotPF).appendChild(R.frente); }

      // cauda: cadeia 3D a partir da garupa (pendurada, com onda; abana para os lados)
      const querCF = caudaNaFrente ? s < .3 : s < .2;
      if (querCF !== caudaNaFrente) { caudaNaFrente = querCF; (querCF ? R.slotCF : R.slotCT).appendChild(R.cauda); }
      atr(R.cauda, 'opacity', n3(1 - passoS(.5, .78, s)));             // de frente a cauda fica escondida atrás do corpo
      {
        let w = W(CAUDA0.u, 0, CAUDA0.h);
        const pts = [T(w)];
        const bkx = -c, bkz = -s, lvx = -s, lvz = c;
        for (let i = 0; i < NCA; i++) {
          const u = i / (NCA - 1);
          const e = (14 - P.cauA + u * 74 + 3 * Math.sin(fase.cauda * .5 - i * .4)) * RAD;
          const lat = (P.cauAmp * Math.sin(fase.cauda - i * .55) * (.2 + .8 * u) + IMP.flick * u + P.cauLado * (.3 + .7 * u)) * RAD;
          const hc = Math.cos(e), cl = Math.cos(lat), sl = Math.sin(lat);
          w = [w[0] + LCA * ESC * hc * (bkx * cl + lvx * sl), w[1] + LCA * ESC * hc * (bkz * cl + lvz * sl), w[2] - LCA * ESC * Math.sin(e)];
          pts.push(T(w));
        }
        const larg = u => u < .12 ? lerp(7, 9, u / .12) : u < .45 ? lerp(9, 19, (u - .12) / .33) : u < .85 ? lerp(19, 15, (u - .45) / .4) : lerp(15, 3, (u - .85) / .15);
        const esq = [], dir = [], m1 = [], m2 = [];
        for (let i = 0; i <= NCA; i++) {
          const a = pts[Math.max(0, i - 1)], b = pts[Math.min(NCA, i + 1)];
          let nx = -(b[1] - a[1]), ny = b[0] - a[0];
          const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
          const w2 = larg(i / NCA) * ESC, pt = pts[i];
          esq.push([pt[0] + nx * w2, pt[1] + ny * w2]); dir.push([pt[0] - nx * w2, pt[1] - ny * w2]);
          if (i > 1) { m1.push([pt[0] + nx * w2 * .35, pt[1] + ny * w2 * .35]); m2.push([pt[0] - nx * w2 * .45, pt[1] - ny * w2 * .45]); }
        }
        const contorno = curvaPor(esq.concat([[pts[NCA][0] + (pts[NCA][0] - pts[NCA - 1][0]) * .6, pts[NCA][1] + (pts[NCA][1] - pts[NCA - 1][1]) * .6]], dir.reverse()), true);
        atr(R.caudaC, 'd', contorno); atr(R.caudaF, 'd', contorno);
        atr(R.caudaM, 'd', curvaPor(m1, false)); atr(R.caudaM2, 'd', curvaPor(m2, false));
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
      cabZ = w[1];
      const onda = (i) => 5 * Math.sin(tempo * .0017 - i * .8) * calma + P.crinaAb * 26 * Math.sin(tempo * .024 - i * 1.1) + molaCrina.x * (.6 + i * .25) + IMP.crina * (1 + i * .3);
      for (let i = 0; i < N_PESC; i++) {
        const A = pts[i], B = pts[i + 1], len = Math.hypot(B[0] - A[0], B[1] - A[1]) || .01;
        poeT(R.pc[i], `${tr(A[0], A[1], Math.atan2(B[1] - A[1], B[0] - A[0]) / RAD)} scale(${n3(Math.max(.08, len / LS))},${ESC})`);
        const r = (WN[i] + WN[i + 1]) / 4, cg = Math.cos(gam[i]), sgn = cg >= 0 ? 1 : -1, k = Math.max(.4, Math.min(1, Math.abs(cg) * 2.5));
        poe(R.crina[i], `translate(0,${n(-sgn * (r - 3) * k)}) scale(1,${n3(sgn * k)}) skewX(${n(onda(i))})`);
        if (i > 0) poeT(R.pj[i], `translate(${n(A[0])},${n(A[1])}) scale(${ESC})`);
        atr(R.cc[i], 'opacity', n3(passoS(.25, .7, -Math.sin(gam[i]))));
      }

      // cabeça
      const psi = th + P.nTh + (N_PESC - 1) * P.nY + P.cTurn + P.cTurnG;
      const Y = Math.cos(psi), F = Math.sin(psi);
      cabY = Y;
      const top = pts[N_PESC];
      const beta = P.cB + P.cBG + P.cBw - P.somN * 34;
      const hxm = top[0] + ESC * Y * 14, hym = top[1] - ESC * 10;
      cabMundo = [hxm, hym];
      const rot = P.cRoll + P.somR + IMP.cabR;
      poe(R.cab, `translate(${n(hxm)},${n(hym)}) scale(${ESC}) rotate(${n(rot)})`);
      const fecho = limita(1 - P.olhos * (1 - piscar), 0, 1);
      const E = estadoCabeca({ Y, F, beta, oE: P.oE + IMP.twE, oD: P.oD + IMP.twD, tE: P.tE, tD: P.tD, orelhas: P.orelhas + P.somB * 8, fecho, feliz: P.feliz, sobr: P.sobr,
        boca: Math.max(P.boca, P.somB), mastX: P.mastX, mastY: P.mastY, olharX: P.olharX, olharY: P.olharY, nariz: Math.max(P.nariz, P.somB * .8), sorriso: P.sorriso, olhoEsc: P.olhoEsc,
        franja: limita(-molaCrina.x * .8 + IMP.franja + P.crinaAb * 14 * Math.sin(tempo * .026), -30, 30) });
      for (const k of ['orelhaE', 'orelhaD', 'orelhaInE', 'orelhaInD', 'olhoE', 'olhoD', 'narE', 'narD', 'bochE', 'bochD', 'sobrE', 'sobrD', 'bocaInt', 'dentesS', 'dentesI', 'malha', 'snip', 'franja', 'estrela', 'ganache']) poe(H[k], E.t[k]);
      for (const k of ['olhoE', 'olhoD', 'narE', 'narD', 'bochE', 'bochD', 'sobrE', 'sobrD', 'ganache']) atr(H[k], 'opacity', String(E.op[k]));
      atr(H.orelhaInE, 'opacity', n3(E.op.orelhaInE * E.op.rosto)); atr(H.orelhaInD, 'opacity', n3(E.op.orelhaInD * E.op.rosto));
      atr(H.dentesS, 'opacity', String(E.op.dentes)); atr(H.dentesI, 'opacity', String(E.op.dentes));
      atr(H.rosto, 'opacity', String(E.op.rosto)); atr(H.rostoC, 'opacity', String(E.op.rosto)); atr(H.franja, 'opacity', String(E.op.rosto));
      poeT(H.ponte, E.t.ponte); poeT(H.foc, E.t.foc); poeT(H.queixo, E.t.queixo);
      atr(H.ponteR[0], 'width', String(E.a.ponteL)); atr(H.ponteR[1], 'width', String(E.a.ponteL)); atr(H.malhaR, 'width', String(Math.max(1, n(E.a.ponteL - 22))));
      atr(H.boca, 'd', E.d.boca);
      atr(H.bocaInt, 'ry', String(E.a.bocaRy)); atr(H.bocaInt, 'rx', String(E.a.bocaRx));
      poeT(H.iris, E.t.iris);
      H.palp.forEach(e => { atr(e.s, 'd', E.d.palpS); atr(e.i, 'd', E.d.palpI); atr(e.c, 'd', E.d.cil); });
      const rr = rot * RAD, cr = Math.cos(rr), sr = Math.sin(rr);
      const paraMundo = (x, y) => [hxm + ESC * (x * cr - y * sr), hym + ESC * (x * sr + y * cr)];
      bocaMundo = paraMundo(E.a.bocaFrente[0], E.a.bocaFrente[1]);
      narMundo = paraMundo(E.a.narinas[0], E.a.narinas[1]);

      // sombra no chão (a luz vem da esquerda: a sombra cai um pouco para a direita)
      const g0 = T([P.X, P.Z, 0]);
      poe(R.sombra, `translate(${n(g0[0] + 30)},${n(g0[1] + 4)}) scale(${n(ESC * (80 + 130 * Math.abs(c)))},${n(ESC * 26)})`);

      // porta de baixo (real e cópia) e recortes da cavalariça
      const ph = (P.porta * 112 + IMP.porta) * RAD;
      const mp = `matrix(${n3(Math.cos(ph))},${n3(Math.sin(ph) * KZ)},0,1,${AB.x0},0)`;
      poe(R.mp, mp); poe(R.mpC, mp);
      atr(R.corpo, 'clip-path', recortar ? `url(#${p}recorte)` : null);
      atr(R.copia, 'display', recortar ? 'inline' : 'none');
      if (recortar) atr(R.sombraDentro, 'opacity', n3(.42 * passoS(PORTA.z + 60, DENTRO.z, P.Z)));
      atr(R.copiaManj, 'display', recortar ? 'inline' : 'none');
      const cabDentro = recortar && (forcaCab || cabZ < PORTA.z + 8);
      atr(R.frente, 'clip-path', cabDentro ? `url(#${p}${P.porta > .5 ? 'recorte' : 'recorteAlto'})` : null);
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
        const k = Math.random() < .5 ? 'twE' : 'twD';
        impulso(k, aleat(14, 26), aleat(260, 380));
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
          st.f.x = lerp(st.de[0], st.para[0], eseno(v)); st.f.z = lerp(st.de[1], st.para[1], eseno(v)); st.f.y = lerp(st.y0, 0, eseno(v)) + sino(v) * 32 * ESC; st.f.inc = -sino(v) * 26;
          if (v >= 1) { st.feito = true; st.f.y = 0; st.f.inc = 0; }
        }
      });
      P.nTh = 0; P.alt = 0;
    }

    /* --- andar a trote (ou a passo) em linha reta: cada casco planta-se num ponto do mundo (por distância) --- */
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
    function* andarPara(x1, z1, ms, G) {
      const x0 = P.X, z0 = P.Z, dx = x1 - x0, dz = z1 - z0, total = Math.hypot(dx, dz) || 1, ux = dx / total, uz = dz / total;
      const base = pes.map(f => [f.x, f.z]);
      const trote = G === TROTE;
      yield* durante(ms, u => {
        const d = total * perfilAndar(u);
        P.X = x0 + ux * d; P.Z = z0 + uz * d;
        const m = Math.min(suave(limita(u / .14, 0, 1)), suave(limita((1 - u) / .14, 0, 1)));
        pes.forEach((f, i) => {
          const r = pePasso(d, G.ordem[f.pe.id], total, G);
          f.x = base[i][0] + ux * r.F; f.z = base[i][1] + uz * r.F; f.y = r.alt * G.alt * ESC; f.inc = -r.alt * (trote ? 34 : 24);
        });
        const ph = d / G.D * TAU;
        P.alt = (trote ? -6 : -3) * Math.cos(2 * ph) * m;
        P.nAw = (trote ? 4 : 3) * Math.sin(2 * ph + .7) * m;
        P.cBw = -3 * Math.sin(2 * ph + .2) * m;
        P.cauA = (trote ? 10 : 4) * m + 4 * Math.sin(ph) * m;
        if (trote) P.crinaAb = .12 * m;
      });
      P.nAw = 0; P.cBw = 0; P.cauA = 0; P.alt = 0; P.crinaAb = 0;
      const fora = pes.filter(f => { const r = restPe(f.pe, P.X, P.Z, P.th); return Math.hypot(f.x - r[0], f.z - r[1]) > 3 || f.y > .5; });
      if (fora.length) yield* juntos(...fora.map((f, i) => (function* () { yield* espera(i * 50); yield* passo1(f, restPe(f.pe, P.X, P.Z, P.th), 200, 16); })()));
    }

    /* --- partículas: pó dos cascos, palhas, bafo das narinas --- */
    const po = R.po.map(el => ({ el, vivo: false })), pa = R.pa.map(el => ({ el, vivo: false })), bf = R.bf.map(el => ({ el, vivo: false }));
    function soltarPo(x, y, k, forca = 1) {
      for (let i = 0; i < k; i++) {
        const f = po.find(o => !o.vivo); if (!f) return;
        Object.assign(f, { vivo: true, x: x + aleat(-12, 12), y: y + aleat(-3, 3), vx: aleat(-.06, .06) * forca, vy: aleat(-.05, -.015) * forca, t: 0, dur: aleat(600, 1000), s: aleat(.5, 1) });
        atr(f.el, 'display', 'inline');
      }
    }
    function soltarPalha(x, y, k) {
      for (let i = 0; i < k; i++) {
        const f = pa.find(o => !o.vivo); if (!f) return;
        Object.assign(f, { vivo: true, x: x + aleat(-20, 20), y: y + aleat(-4, 4), vx: aleat(-.03, .03), vy: aleat(.01, .04), r: aleat(0, 180), t: 0, chao: aleat(760, 790), fase: aleat(0, 6) });
        atr(f.el, 'display', 'inline'); atr(f.el, 'opacity', '1');
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
        f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy += dt * .00004;
        const u = f.t / f.dur;
        if (u >= 1) { f.vivo = false; atr(f.el, 'display', 'none'); continue; }
        poe(f.el, `translate(${n(f.x)},${n(f.y)}) scale(${n3(f.s * (.5 + u * 1.2))})`); atr(f.el, 'opacity', n3(.6 * (1 - u)));
      }
      for (const f of pa) {
        if (!f.vivo) continue;
        f.t += dt;
        if (f.y < f.chao) {
          f.vy = Math.min(.08, f.vy + dt * .00005);
          f.x += (f.vx + Math.sin(f.t * .005 + f.fase) * .04) * dt; f.y += f.vy * dt; f.r += dt * .2;
          if (f.y >= f.chao) { f.y = f.chao; f.t = 0; f.r = (f.r % 180) * .1; }
          poe(f.el, `translate(${n(f.x)},${n(f.y)}) rotate(${n(f.r + 30 * Math.sin(f.t * .006))})`);
        } else {
          atr(f.el, 'opacity', n3(limita(1 - f.t / 1400, 0, 1)));
          if (f.t > 1400) { f.vivo = false; atr(f.el, 'display', 'none'); }
        }
      }
      for (const f of bf) {
        if (!f.vivo) continue;
        f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt;
        const u = f.t / f.dur;
        if (u >= 1) { f.vivo = false; atr(f.el, 'display', 'none'); continue; }
        poe(f.el, `translate(${n(f.x)},${n(f.y)}) scale(${n3(.4 + u * 1.3)})`); atr(f.el, 'opacity', n3(.55 * (1 - u)));
      }
    }
    // um comportamento interrompido limpa o que criou (mosca, crina a abanar, tremor)
    function limparComportamento() {
      atr(R.mosca, 'display', 'none');
      P.crinaAb = 0; P.pele = 0; P.cauLado = 0; P.cauAmp = CAUDA_0.cauAmp; P.cauVel = CAUDA_0.cauVel;
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
    function* pastar() {                       // baixa o pescoço até à erva, arranca tufos e mastiga
      P.fAvanca = 26;
      yield* juntos(pisarPara([P.th > PI / 2 ? 'fD' : 'fE'], 320), tw({ nA: -58, nC: 4, cB: 84, cTurn: -.1, incl: -.05, alt: -14, oE: 14, oD: 10, tE: .6, tD: .4 }, 1200, eio));
      for (let i = 0; i < 3; i++) {
        yield* tw({ boca: .3, cB: 90 }, 220);
        yield* juntos(tw({ boca: 0, cB: 82, nAw: 6 }, 180, esai), (function* () { yield* espera(120); soltarPo(bocaMundo[0], bocaMundo[1] + 6, 1, .4); })());
        yield* juntos(mastigar(900), tw({ nAw: 0 }, 400));
        if (Math.random() < .5) impulso('flick', 26, 700, 'onda');
      }
      impulso(Math.random() < .5 ? 'twE' : 'twD', 22, 320);
      yield* tw(Object.assign({}, sem(CORPO0, 'fAbre', 'fAvanca'), { oE: 0, oD: 0, tE: 1, tD: 1 }), 1100, eio);
      P.fAvanca = 0;
      yield* pisarPara([P.th > PI / 2 ? 'fD' : 'fE'], 300);
    }
    function* abanarCrina() {                  // sacode o pescoço todo: a crina voa, as orelhas abanam
      yield* tw({ nA: 50, cB: 46, olhos: .7, oE: 20, oD: 20 }, 300);
      yield* durante(1300, (u, t) => {
        const e = sino(u);
        P.crinaAb = e; P.cRoll = 16 * Math.sin(t * .03) * e; P.nAw = 5 * Math.sin(t * .03 + 1) * e; P.olhos = 1 - .9 * e;
        P.oE = 30 * Math.sin(t * .034) * e; P.oD = -30 * Math.sin(t * .034) * e; P.pele = 2.5 * e;
      });
      P.crinaAb = 0; P.pele = 0; P.nAw = 0;
      impulso('crina', 14, 900, 'mola'); impulso('franja', 16, 900, 'mola');
      yield* tw({ cRoll: 0, olhos: 1, oE: 0, oD: 0, nA: CORPO0.nA, cB: CORPO0.cB }, 450);
    }
    function* baterCasco() {                   // levanta a pata da frente e raspa o chão três vezes (sai pó)
      const id = P.th > PI / 2 ? 'fE' : 'fD', f = peDe(id), r0 = restPe(f.pe, P.X, P.Z, P.th);
      const fx = Math.cos(P.th), fz = Math.sin(P.th);
      yield* tw({ cB: 70, cTurn: CORPO0.cTurn + .25, oE: 10, oD: 10, tE: .6, tD: .6 }, 380);
      for (let i = 0; i < 3; i++) {
        yield* durante(240, u => { const e = esai(u); f.x = r0[0] + fx * 22 * e; f.z = r0[1] + fz * 22 * e; f.y = 46 * e; f.inc = -36 * e; P.alt = -3 * e; });
        yield* durante(200, u => { const e = eentra(u); f.x = r0[0] + fx * lerp(22, -10, e); f.z = r0[1] + fz * lerp(22, -10, e); f.y = 46 * (1 - e); f.inc = lerp(-36, 10, e); });
        soltarPo(f.x, CHAO + KZ * f.z - 2, 3, 1);
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
    function* bufar() {                        // levanta a cabeça, alarga as narinas e bufa (sai bafo)
      yield* tw({ nA: 64, cB: 36, cTurn: CORPO0.cTurn - .2, orelhas: 12, tE: 1, tD: 1 }, 500);
      for (let i = 0; i < 2; i++) {
        yield* tw({ nariz: 1, olhos: .8 }, 260, esai);
        soltarBafo(3);
        yield* juntos(tw({ nariz: 0, olhos: 1 }, 300), durante(360, u => { P.cRoll = 7 * Math.sin(u * PI * 3) * (1 - u); P.boca = .14 * sino(u); }));
        yield* espera(260);
      }
      P.cRoll = 0;
      impulso('crina', 12, 800, 'mola');
      yield* tw({ nA: CORPO0.nA, cB: CORPO0.cB, cTurn: CORPO0.cTurn, orelhas: 0, boca: 0 }, 600);
    }
    const PT = { cegonha: [472, 230], monte: [1290, 490], sobreiro: [250, 430], crianca: [700, 600], porta: [1010, 420], ceu: [820, 150], seara: [400, 620] };
    function* rodarOrelhas() {                 // cada orelha roda para um lado (escuta) e os olhos vão atrás
      const alvos = [PT.monte, PT.sobreiro, PT.cegonha, PT.seara].sort(() => Math.random() - .5).slice(0, 3);
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
      impulso('franja', 20, 900, 'mola'); impulso('crina', 10, 800, 'mola');
      yield* tw({ cTurn: CORPO0.cTurn, cRoll: 0, oE: 0, oD: 0, olhos: 1, cB: CORPO0.cB }, 360);
    }
    function* olharCrianca() {                 // vira a cara para nós, inclina-a e pisca os olhos, contente
      yield* tw({ cTurn: PI / 2 - P.th + .08, cB: 62, nA: 52, olhoEsc: 1.08, orelhas: 14, tE: 1, tD: 1, sobr: .6 }, 900, eio);
      yield* tw({ cRoll: 12, sobr: 1 }, 380);
      yield* tw({ olhos: .06, feliz: .5 }, 360, eseno); yield* espera(160); yield* tw({ olhos: 1, feliz: 0 }, 400, eseno);
      yield* juntos(tw({ nariz: .7 }, 240), espera(400)); yield* tw({ nariz: 0 }, 240);
      yield* tw({ cRoll: -10 }, 520);
      impulso('twE', 20, 300); yield* espera(500);
      yield* tw({ cRoll: 0, sorriso: 1 }, 380);
      yield* espera(500);
      yield* tw(Object.assign({}, sem(CORPO0, 'fAbre', 'fAvanca'), { olhoEsc: 1, orelhas: 0, sobr: 0, sorriso: ROSTO0.sorriso }), 900, eio);
    }
    const COMPORTAMENTOS = { pastar, abanarCrina, baterCasco, caudaMoscas, bufar, rodarOrelhas, sacudirCabeca, olharCrianca };
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
      const rosto = tw({ orelhas: 22, oE: 0, oD: 0, tE: 1, tD: 1, feliz: 1, olhos: 1, sobr: .8, sorriso: 1, boca: 0, olhoEsc: 1.06 }, 100, esai);
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

    /* --- dentro: cabeça por cima da meia-porta; come da manjedoura, olha para nós, abana a cabeça --- */
    function* comerManjedoura() {
      yield* tw(Object.assign({}, COMER_MANJ, { oE: 8, oD: 8, olhos: .9 }), 900, eio);
      for (let i = 0; i < 2; i++) {
        yield* tw({ boca: .32, cB: COMER_MANJ.cB + 6 }, 240);
        yield* juntos(tw({ boca: 0, nA: COMER_MANJ.nA + 6, cB: COMER_MANJ.cB - 4 }, 260, esai), (function* () { yield* espera(100); soltarPalha(MANJ.x, MANJ.y - 6, 3); })());
        yield* mastigar(1100);
      }
      yield* juntos(tw(Object.assign({}, PORTA_FORA, { oE: 0, oD: 0, olhos: 1 }), 800, eio), mastigar(800, .8));
      yield* mastigar(900, .8);
    }
    function* olharDaPorta() {
      yield* juntos(tw({ cTurn: aleat(-.5, .5), cB: 54, nA: 30, orelhas: 12, sobr: .5 }, 600, eio), mastigar(600, .6));
      olhar.foco = () => PT.crianca;
      yield* juntos(espera(900), (function* () { yield* espera(300); yield* tw({ olhos: .1, feliz: .4 }, 300, eseno); yield* tw({ olhos: 1, feliz: 0 }, 300, eseno); })());
      olhar.foco = null;
      impulso('twD', 20, 280);
      yield* tw(Object.assign({}, PORTA_FORA, { orelhas: 0, sobr: 0 }), 700, eio);
    }
    function* cicloDentro() {
      for (;;) {
        yield* juntos(espera(aleat(900, 1800)), (function* () { if (Math.random() < .5) { yield* tw({ nariz: .8 }, 250); soltarBafo(2); yield* tw({ nariz: 0 }, 300); } })());
        const r = Math.random();
        if (r < .45) yield* comerManjedoura();
        else if (r < .7) yield* olharDaPorta();
        else if (r < .85) yield* sacudirCabeca();
        else yield* rodarOrelhas();
        yield* tw(PORTA_FORA, 300);
      }
    }
    function* reacaoDentro() {
      impulso('flick', 30, 700, 'onda');
      yield* tw({ orelhas: 20, tE: 1, tD: 1, feliz: .7, olhos: 1, sobr: .8, boca: 0 }, 100, esai);
      yield* tw(Object.assign({}, PORTA_FORA, { nA: 34, cB: 56, orelhas: 20 }), 380, esai);
      olhar.foco = () => PT.crianca;
      yield* durante(800, u => { P.cRoll = 9 * Math.sin(u * PI * 2) * (1 - u * .5); P.nAw = 5 * Math.sin(u * PI * 3) * (1 - u); P.crinaAb = .4 * sino(u); });
      P.nAw = 0; P.crinaAb = 0;
      impulso('porta', 4, 600, 'mola');
      yield* tw({ olhos: .1, feliz: .8, nariz: .6 }, 300, eseno); soltarBafo(2); yield* tw({ olhos: 1, feliz: .3, nariz: 0 }, 300, eseno);
      olhar.foco = null;
      yield* tw(Object.assign({}, PORTA_FORA, { orelhas: 0, feliz: 0, sobr: 0, cRoll: 0 }), 600, eio);
    }

    /* --- ida à cavalariça: vira-se, vai a trote até à porta, vira-se para ela, a meia-porta abre, entra,
           a porta fecha-se, vira-se lá dentro e põe a cabeça de fora --- */
    function* ida() {
      modo = 'indo'; reagindo = false;
      if (P.fAbre > 1 || P.fAvanca > 1) { P.fAbre = 0; P.fAvanca = 0; }
      olhar.foco = () => PT.porta; olhar.rapido = true;
      yield* juntos(recomporPes(150), tw(Object.assign({}, ROSTO0, sem(CORPO0, 'cTurn', 'fAbre', 'fAvanca'), { orelhas: 12 }), 160, esai));
      // vai a trote só até à esquerda da porta (APROX_E) e vira-se lá: a trote até APROX a cabeça passava por baixo da seta direita
      const thA = Math.atan2(APROX_E.z - P.Z, APROX_E.x - P.X);
      yield* juntos(virar(thA, 320), tw({ cTurn: 0, nA: 54 }, 320));
      olhar.rapido = false; olhar.foco = null;
      yield* juntos(andarPara(APROX_E.x, APROX_E.z, 340, TROTE), tw({ nA: 50, cB: 50 }, 340));
      yield* juntos(virar(-PI / 2, 340), tw({ nA: 22, nC: 2, cB: 76, cTurn: 0 }, 340));
      // dá uns passos de lado até à frente da porta; a meia-porta (abre para fora, para a esquerda) só abre quando ele já lá chega
      yield* juntos(andarPara(APROX.x, APROX.z, 420, PASSO_), (function* () { yield* espera(260); yield* tw({ porta: 1, nA: 20, cB: 78 }, 300, eio); })());
      impulso('porta', -6, 500, 'mola');
      recortar = true;
      yield* juntos(andarPara(DENTRO.x, DENTRO.z, 640, PASSO_), tw({ nA: 18, cB: 80 }, 640));
      forcaCab = true;
      // fecha-se a porta e ele vira-se lá dentro (de cabeça alta, para não passar por cima da porta)
      yield* juntos(virar(PI / 2, 500), tw({ nA: 56, nC: -2, cB: 50 }, 260), (function* () { yield* tw({ porta: 0 }, 360, eentra);
        impulso('porta', 7, 700, 'mola'); soltarPalha(1130, 560, 3); soltarPo(1000, 770, 4, .8); })());
      forcaCab = false;
      yield* tw(Object.assign({}, PORTA_FORA, ROSTO0, { orelhas: 14 }), 220, esai);
      impulso('crina', 10, 700, 'mola'); impulso('franja', 14, 700, 'mola');
      modo = 'dentro';
    }
    /* --- volta: recolhe a cabeça, a porta abre, sai a trote de frente, sacode a crina, vira-se e volta --- */
    function* volta() {
      modo = 'voltando'; reagindo = false; forcaCab = false;
      yield* tw(Object.assign({}, ROSTO0, { nA: 62, nC: -2, nY: 0, nTh: 0, cTurn: 0, cB: 50, alt: 0, incl: 0, cRoll: 0, boca: 0 }), 180, eio);
      yield* juntos(tw({ porta: 1 }, 300, eio), espera(200));
      yield* juntos(andarPara(APROX.x, APROX.z, 520, TROTE), tw({ nA: 50, cB: 56, cTurn: -.3 }, 520));
      recortar = false;
      // a porta fecha-se e ele dá uns passos de lado para a esquerda (de frente para nós) antes de se virar:
      // virado para a esquerda em APROX a garupa e a cauda passavam por baixo da seta direita
      yield* juntos(andarPara(APROX_E.x, APROX_E.z, 400, PASSO_), (function* () { yield* tw({ porta: 0 }, 220, eio); impulso('porta', 5, 500, 'mola'); })());
      const thV = PI + Math.atan2(APROX_E.z - REP.Z, APROX_E.x - REP.X);
      yield* juntos(virar(thV, 340), tw({ cTurn: -.55 }, 340, eio),
        durante(340, u => { P.crinaAb = .8 * sino(u); P.cRoll = 10 * Math.sin(u * PI * 4) * sino(u); }));
      P.crinaAb = 0; P.cRoll = 0;
      yield* andarPara(REP.X, REP.Z, 340, TROTE);
      yield* juntos(virar(REP.th, 320), tw(Object.assign({}, CORPO0, ROSTO0), 340));
      impulso('franja', 14, 700, 'mola');
      modo = 'fora';
    }

    /* --- som: «iiihihi» — levanta a cabeça, abre a boca por sílaba e mostra os dentes --- */
    function* somBoca(ms, silabas) {
      let lista = Array.isArray(silabas) && silabas.length ? silabas : null;
      if (!lista) { const s = ms / 1000; lista = [[0, s * .34], [s * .42, s * .14], [s * .6, s * .14], [s * .78, s * .18]]; }
      const fim = Math.max(...lista.map(([a, d]) => a + Math.max(d, .14))) * 1000;
      impulso('crina', 8, 600, 'mola');
      yield* durante(fim + 320, (u, t) => {
        const ts = t / 1000;
        P.somN = t < 180 ? esai(t / 180) : t > fim ? 1 - eseno(limita((t - fim) / 320, 0, 1)) : 1;
        let b = 0, r = 0;
        lista.forEach(([a, d], k) => {
          const v = (ts - a) / Math.max(d, .14);
          if (v < 0 || v > 1) return;
          const ab = v < .15 ? esai(v / .15) : v > .8 ? 1 - eseno((v - .8) / .2) : 1;
          b = Math.max(b, (k ? .8 : 1) * ab);
          r += (k % 2 ? -1 : 1) * 6 * Math.sin(v * PI) + (k === 0 ? 3 * Math.sin(v * PI * 6) : 0);
        });
        P.somB = b; P.somR = r;
      });
      P.somB = 0; P.somR = 0; P.somN = 0;
      soltarBafo(2);
    }

    /* --- cenário vivo e acontecimentos raros --- */
    const cegonha = { voa: false, x: 472, y: 252, bico: 0, prox: aleat(4000, 9000), cab: 0 };
    function animarCena(dt) {
      const t = tempo / 1000;
      R.nuvens.forEach((g, i) => {
        const v = [6, 4, 5, 3][i], y = [110, 190, 240, 150][i], x0 = [300, 900, 1300, 640][i];
        const x = -260 + ((x0 + 260 + t * v * calma) % 2120);
        poe(g, `translate(${n(x)},${y})`);
      });
      R.aves.forEach((g, i) => {
        const a = t * (.5 + i * .07) * calma + i * 2.1;
        poe(g, `translate(${n(720 + Math.cos(a) * (180 + i * 30))},${n(330 + Math.sin(a * 1.3) * 26 + i * 14)}) scale(${n3(.8 + .2 * Math.sin(t * 3 + i))},${n3(.6 + .5 * Math.abs(Math.sin(t * 7 + i)))})`);
      });
      const rajada = .6 + .4 * Math.sin(t * .3);
      R.searas.forEach((g, i) => { const yb = [612, 640, 676][i]; poe(g, `translate(0,${yb}) skewX(${n3((3 * Math.sin(t * .9 - i * .7) + 1.5 * Math.sin(t * 2.1 + i)) * rajada * calma)}) translate(0,${-yb})`); });
      R.paps.forEach((g, i) => poe(g, `rotate(${n3((3 * Math.sin(t * 1.2 + i * 1.3) + 1.2 * Math.sin(t * 2.6 + i)) * rajada * calma)})`));
      R.ervas.forEach((g, i) => poe(g, `rotate(${n3((2.4 * Math.sin(t * 1.1 + i * .9) + 1.4 * Math.sin(t * 2.3 + i * 2)) * rajada * calma)})`));
      poe(R.copaSob, `rotate(${n3((.5 * Math.sin(t * .7) + .25 * Math.sin(t * 1.5)) * calma)},256,560)`);
      // cegonha no ninho: mexe a cabeça e, de vez em quando, bate o bico (glotera)
      if (!cegonha.voa) {
        cegonha.prox -= dt;
        if (cegonha.prox <= 0) { cegonha.bico = 1400; cegonha.prox = aleat(6000, 14000); }
        let ang = 0, ab = 0;
        if (cegonha.bico > 0) { cegonha.bico -= dt; const u = 1 - cegonha.bico / 1400; ang = -50 * sino(u * 1.4); ab = Math.abs(Math.sin(tempo * .05)) * sino(u); }
        else ang = 4 * Math.sin(t * .8);
        poe(R.cg, `translate(${cegonha.x},${cegonha.y})`);
        poe(R.cgCab, `rotate(${n(ang)},10,-18)`);
        poe(R.cgBicoS, `rotate(${n(-8 * ab)},16,-48)`); poe(R.cgBicoI, `rotate(${n(8 * ab)},16,-46)`);
      }
    }
    const eventos = { prox: aleat(9000, 15000), ultimo: null };
    function iniciarEvento(tipo) {
      const ev = { tipo, x: -100, y: -100, vivo: true };
      ev.pos = () => [ev.x, ev.y];
      const gen = { cegonha: evCegonha, lebre: evLebre }[tipo](ev);
      lancar('evento', gen, () => { ev.vivo = false; });
      if (modo === 'fora' && !reagindo) lancar('corpo', observar(ev), () => lancar('corpo', cicloFora()));
      else if (modo === 'dentro') { impulso('twE', 22, 400); impulso('twD', 18, 400); }
    }
    function atualizarEventos(dt) {
      if (faixas.has('evento')) return;
      eventos.prox -= dt;
      if (eventos.prox > 0) return;
      eventos.prox = aleat(15000, 40000);
      if (modo !== 'fora' && modo !== 'dentro') { eventos.prox = 3000; return; }
      const lista = ['cegonha', 'lebre'];
      let tipo; do tipo = escolhe(lista); while (tipo === eventos.ultimo && Math.random() < .7);
      eventos.ultimo = tipo;
      iniciarEvento(tipo);
    }
    function* observar(ev) {
      reagindo = false;
      yield* recompor(380);
      olhar.foco = ev.pos;
      yield* tw({ orelhas: 14, tE: 1, tD: 1, olhoEsc: 1.05 }, 260, esai);
      let t = 0, prox = 900;
      while (ev.vivo && t < 14000) {
        t += yield;
        if (t > prox) {
          prox = t + aleat(1000, 1900);
          if (Math.random() < .5) impulso('flick', 26, 700, 'onda');
          impulso(Math.random() < .5 ? 'twE' : 'twD', 18, 280);
        }
      }
      olhar.foco = null;
      yield* tw({ orelhas: 0, olhoEsc: 1, olhos: 1 }, 500);
    }
    function* evCegonha(ev) {                  // a cegonha levanta voo do ninho, dá uma volta pelo céu e volta
      cegonha.voa = true;
      atr(R.cgPousada, 'display', 'none'); atr(R.cgVoo, 'display', 'inline');
      const pts = [[472, 240], [560, 180], [800, 130], [1100, 150], [1280, 220], [1150, 300], [900, 250], [640, 200], [520, 220], [472, 246]];
      let ant = pts[0];
      yield* durante(11000, (u, tt) => {
        const [x, y] = catmull(pts, eseno(u));
        const dir = x >= ant[0] ? 1 : -1; ant = [x, y];
        ev.x = x; ev.y = y + 6 * Math.sin(tt * .004);
        const bate = u < .12 || u > .88 || Math.sin(tt * .0013) > .55;
        const a = bate ? Math.sin(tt * .016) : .15;
        poe(R.cg, `translate(${n(ev.x)},${n(ev.y)}) scale(${dir * .8},.8)`);
        poe(R.cgAsa, `scale(1,${n3(.3 + .7 * Math.abs(a))})`); poe(R.cgAsa2, `scale(1,${n3(.2 + .5 * Math.abs(a))})`);
      });
      cegonha.voa = false;
      atr(R.cgPousada, 'display', 'inline'); atr(R.cgVoo, 'display', 'none');
      cegonha.bico = 1400;
    }
    function* evLebre(ev) {                    // uma lebre atravessa o campo aos saltos e pára a espreitar
      atr(R.lebre, 'display', 'inline');
      const y0 = 668;
      let x = -40;
      const salto = function* (dist, ms) {
        const xi = x;
        yield* durante(ms, (u, tt) => {
          x = xi + dist * u; ev.x = x; ev.y = y0 - 34 * sino(u);
          poe(R.lebre, `translate(${n(ev.x)},${n(ev.y)}) scale(.9)`);
          poe(R.lebrePT, `rotate(${n(-30 * Math.sin(u * PI * 2))},-8,-4)`); poe(R.lebrePF, `rotate(${n(30 * Math.sin(u * PI * 2))},8,-6)`);
          poe(R.lebreIn, `rotate(${n(-10 * Math.cos(u * PI))})`);
        });
      };
      for (let i = 0; i < 7; i++) yield* salto(62, 330);
      yield* durante(1600, (u, tt) => { poe(R.lebreIn, 'rotate(0)'); poe(R.lebreOr, `rotate(${n(8 * Math.sin(tt * .01))},14,-26)`); ev.y = y0; poe(R.lebre, `translate(${n(x)},${y0}) scale(.9)`); });
      for (let i = 0; i < 18; i++) yield* salto(78, 300);
      atr(R.lebre, 'display', 'none');
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
      animal: R.cavalo,
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
      _teste: { P, pes, modo: () => modo, evento: iniciarEvento, comportamento: nome => lancar('corpo', COMPORTAMENTOS[nome](), () => lancar('corpo', cicloFora())), desenhar, cab: () => cabMundo, boca: () => bocaMundo, cabZ: () => cabZ }
    };
  }

  return { icone: iconeSVG(), montar };
})();
