/* Elefante — «Os Meus Animais». Contrato e regras: REGRAS-ANIMAIS.md.
   Cena: a savana africana de manhã (sol ainda baixo, à esquerda, ar fresco): o Kilimanjaro com neve ao longe e uma faixa
   de nuvem à cintura, bruma, colinas azuladas, girafas muito ao longe, um embondeiro à esquerda, erva alta dourada e
   verde a ondular, poeira a brilhar na luz, um bando de aves e uma garça-boieira junto ao poço.
   Habitat: um poço de água lamacenta. O elefante vai a passo pesado, entra até aos joelhos (camadas: margem e água de
   trás → elefante → cópia da água recortada pela linha de água do elefante), faz ondas e toma banho: enche a tromba
   e esguicha água por cima das costas.
   O elefante é um boneco «2,5D» (como a girafa): o tronco é um perfil projetado que estreita quando se vira para nós
   enquanto aparece o peito de frente; as 4 patas têm IK e os pés ficam presos ao chão (andar em sequência lateral);
   a cabeça é uma esfera com as feições a deslizar; as orelhas são planos 3D presos a uma dobradiça (abanam de verdade);
   a tromba é uma cadeia 3D de 12 segmentos no plano da cara, desenhada como um tubo contínuo (contorno e enchimento).
   Organização: 1) utilidades  2) medidas  3) desenho do elefante  4) cenário e poço  5) ícone
                6) montar(): estado, desenho por quadro, água e partículas, tarefas, comportamentos, idas e voltas */
'use strict';
MODULOS.elefante = (() => {
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
  const elipseD = (cx, cy, rx, ry) => `M${n(cx - rx)},${n(cy)}a${n(rx)},${n(ry)} 0 1,0 ${n(2 * rx)},0a${n(rx)},${n(ry)} 0 1,0 ${n(-2 * rx)},0Z`;
  // curva suave por uma lista de pontos (meios das arestas com quadráticas)
  function liso(q, mover) {
    let s = mover ? `M${n(q[0][0])},${n(q[0][1])}` : '';
    for (let i = 1; i < q.length - 1; i++) { const m0 = (q[i][0] + q[i + 1][0]) / 2, m1 = (q[i][1] + q[i + 1][1]) / 2; s += `Q${n(q[i][0])},${n(q[i][1])} ${n(m0)},${n(m1)}`; }
    const u = q[q.length - 1];
    return s + `L${n(u[0])},${n(u[1])}`;
  }

  /* ================= 2) Medidas do elefante (unidades do elefante; no ecrã × ESC) ================= */
  const ESC = 1.02;               // escala do elefante no cenário
  const KZ = .18;                 // quanto a profundidade (z) desce no ecrã: vista ligeiramente de cima
  const CHAO = 772;               // y do chão (profundidade 0)
  const HC = 196;                 // altura do centro do tronco
  const TORN = 22;                // altura do tornozelo (o pé redondo fica por baixo)
  // patas: lado 1 = esquerda (virada para nós quando o elefante olha para a direita); as duas dobram com a articulação para a frente
  const PERNAS = [
    { id: 'tE', fr: 0, lado: 1, u: -90, v: 31, h: 150, L1: 66, L2: 64, pu: -92 },
    { id: 'fE', fr: 1, lado: 1, u: 80, v: 31, h: 150, L1: 66, L2: 64, pu: 82 },
    { id: 'tD', fr: 0, lado: -1, u: -90, v: -31, h: 150, L1: 66, L2: 64, pu: -92 },
    { id: 'fD', fr: 1, lado: -1, u: 80, v: -31, h: 150, L1: 66, L2: 64, pu: 82 }
  ];
  const CAB = { u: 148, h: 270 }, RC = 80;            // centro da cabeça e raio do crânio
  const CAUDA0 = { u: -147, h: 238 }, NCA = 6, LCA = 12, WCA = [8.5, 8, 7.5, 7, 6.5, 6];
  const NT = 12;                                       // segmentos da tromba
  const TLEN = (() => { const w = Array.from({ length: NT }, (_, i) => 1 - .42 * i / (NT - 1)); const s = w.reduce((a, b) => a + b, 0); return w.map(x => x / s * 214); })();
  const TWID = Array.from({ length: NT + 1 }, (_, i) => i === 0 ? 27 : lerp(24.5, 8.5, Math.pow((i - 1) / (NT - 1), .9)));   // a base alarga-se para dentro da cara
  const POCO = { cx: 1028, cy: 777, rx: 232, ry: 58 }; // poço (no ecrã)
  const PROF = 46;                                     // fundura máxima (px) onde as patas se enterram
  const COR = { cont: '#4B4250', tromba: '#A4A9B7', unha: '#EFE6D2', tufo: '#3E3640', rosa: '#E9A9B2' };
  const ORELHA = 'M0,-60 C28,-78 84,-82 112,-54 C132,-32 130,8 114,34 C100,56 78,68 62,90 C56,100 42,104 35,94 C28,82 20,66 0,50 C-6,20 -6,-30 0,-60 Z';
  const ORELHA_IN = 'M12,-46 C38,-60 80,-62 100,-42 C114,-24 112,6 100,26 C88,44 70,56 58,74 C52,82 44,84 40,76 C34,64 26,52 12,40 C8,16 8,-24 12,-46 Z';
  const TRONCO = 'M-152,2 C-154,-48 -124,-84 -76,-94 C-34,-102 18,-110 66,-106 C108,-102 134,-72 138,-30 C141,10 126,52 94,72 C62,92 -46,94 -90,80 C-130,66 -151,42 -152,2 Z';
  const COSTAS = 'M-150,-20 C-146,-62 -118,-88 -76,-96 C-34,-104 18,-112 66,-108 C100,-104 122,-88 132,-62 C100,-80 40,-86 -10,-80 C-60,-74 -110,-58 -150,-20 Z';

  /* ================= 3) Desenho do elefante ================= */
  function defsElefante(p) {
    return `
    <radialGradient id="${p}pele" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#C6CAD5"/><stop offset=".55" stop-color="#A3A8B6"/><stop offset="1" stop-color="#7C8193"/></radialGradient>
    <linearGradient id="${p}luzV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".26"/><stop offset=".32" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".6" stop-color="#2E2440" stop-opacity="0"/><stop offset="1" stop-color="#2E2440" stop-opacity=".34"/></linearGradient>
    <linearGradient id="${p}luzH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".18"/><stop offset=".38" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".72" stop-color="#2E2440" stop-opacity="0"/><stop offset="1" stop-color="#2E2440" stop-opacity=".22"/></linearGradient>
    <linearGradient id="${p}perna" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A7F91"/><stop offset=".5" stop-color="#A2A7B5"/><stop offset="1" stop-color="#BEC2CD"/></linearGradient>
    <radialGradient id="${p}joelho" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#B9BDC9"/><stop offset="1" stop-color="#959AAA"/></radialGradient>
    <radialGradient id="${p}pe" cx=".36" cy=".25" r=".85"><stop offset="0" stop-color="#B7BBC7"/><stop offset=".6" stop-color="#9499A9"/><stop offset="1" stop-color="#767B8C"/></radialGradient>
    <radialGradient id="${p}cab" gradientUnits="userSpaceOnUse" cx="-28" cy="-36" r="128"><stop offset="0" stop-color="#CFD3DD"/><stop offset=".55" stop-color="#A9AEBC"/><stop offset="1" stop-color="#858A9B"/></radialGradient>
    <radialGradient id="${p}foc" cx=".42" cy=".2" r=".85"><stop offset="0" stop-color="#B6BBC7"/><stop offset=".55" stop-color="#AAAFBC"/><stop offset="1" stop-color="#A3A8B6"/></radialGradient>
    <linearGradient id="${p}palp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B8BCC8"/><stop offset="1" stop-color="#999EAD"/></linearGradient>
    <radialGradient id="${p}iris" cx=".42" cy=".38" r=".65"><stop offset="0" stop-color="#8A5E3C"/><stop offset=".45" stop-color="#55331C"/><stop offset="1" stop-color="#21120A"/></radialGradient>
    <linearGradient id="${p}orelhaFora" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B2B6C3"/><stop offset=".6" stop-color="#9A9FAE"/><stop offset="1" stop-color="#808596"/></linearGradient>
    <radialGradient id="${p}orelhaIn" cx=".3" cy=".4" r=".8"><stop offset="0" stop-color="#F6CFCF"/><stop offset=".6" stop-color="#E8AEB5"/><stop offset="1" stop-color="#D2939E"/></radialGradient>
    <radialGradient id="${p}tufo" cx=".35" cy=".35" r=".75"><stop offset="0" stop-color="#6A5E6C"/><stop offset="1" stop-color="#2E2630"/></radialGradient>
    <radialGradient id="${p}sombra"><stop offset="0" stop-color="#3E3018" stop-opacity=".46"/><stop offset=".6" stop-color="#3E3018" stop-opacity=".22"/><stop offset="1" stop-color="#3E3018" stop-opacity="0"/></radialGradient>
    <linearGradient id="${p}trombaG" class="el-trG" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="60"><stop offset="0" stop-color="#AEB3C0" stop-opacity="0"/><stop offset=".42" stop-color="#ADB2BF"/><stop offset="1" stop-color="#A3A8B6"/></linearGradient>
    <linearGradient id="${p}trombaC" class="el-trGC" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="60"><stop offset="0" stop-color="${COR.cont}" stop-opacity="0"/><stop offset=".45" stop-color="${COR.cont}" stop-opacity="0"/><stop offset=".8" stop-color="${COR.cont}"/><stop offset="1" stop-color="${COR.cont}"/></linearGradient>
    <clipPath id="${p}clip-tronco"><path d="${TRONCO}"/></clipPath>
    <clipPath id="${p}clip-peito"><ellipse rx="104" ry="98"/></clipPath>
    <clipPath id="${p}clip-cranio"><ellipse rx="${RC}" ry="${RC + 3}"/></clipPath>
    <clipPath id="${p}clip-olho"><ellipse rx="13.5" ry="16"/></clipPath>`;
  }

  /* --- Tronco de perfil (local: u para a frente, y para baixo, origem no centro do tronco a HC de altura) --- */
  function troncoSVG(p) {
    return `<g class="el-troncoR">
      <path d="${TRONCO}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="8" stroke-linejoin="round"/>
      <path d="${TRONCO}" fill="url(#${p}pele)"/>
      <g clip-path="url(#${p}clip-tronco)">
        <path d="${TRONCO}" fill="url(#${p}luzV)"/>
        <path d="M-122,-74 C-80,-96 0,-106 70,-102" stroke="#F2F4F8" stroke-width="8" fill="none" opacity=".4" stroke-linecap="round"/>
        <path d="M-130,-40 C-138,-10 -136,22 -124,46 M-112,-62 C-122,-30 -122,4 -112,34 M96,-58 C104,-30 104,0 96,30 M110,-40 C116,-14 114,12 106,36" stroke="#6E7385" stroke-width="2.4" fill="none" opacity=".45" stroke-linecap="round"/>
        <path d="M-62,70 C-20,80 30,78 72,62 M50,50 C64,60 80,60 92,50 M-106,48 C-92,60 -76,62 -62,56" stroke="#6E7385" stroke-width="2.2" fill="none" opacity=".4" stroke-linecap="round"/>
        <path d="M-40,-20 C-30,-26 -18,-26 -8,-20 M10,4 C20,-2 32,-2 42,4 M-80,10 C-72,4 -62,4 -54,10" stroke="#8B90A0" stroke-width="2" fill="none" opacity=".4" stroke-linecap="round"/>
        <path d="M-130,50 C-80,86 40,92 120,52 L130,110 L-140,110 Z" fill="#2E2440" opacity=".12"/>
        <path class="el-poT" d="${COSTAS}" fill="#B48C62" opacity="0"/>
        <path class="el-molhT" d="${TRONCO}" fill="#4A5470" opacity="0"/>
        <path class="el-brilhoT" d="M-110,-70 C-70,-90 -10,-98 40,-96 M-60,-50 C-40,-56 -20,-58 0,-56 M20,-70 C40,-74 60,-74 80,-70" stroke="#FFFFFF" stroke-width="4" fill="none" opacity="0" stroke-linecap="round"/>
      </g>
    </g>`;
  }
  // peito visto de frente: só aparece a meio das viragens (enquanto o perfil do tronco estreita)
  function peitoSVG(p) {
    return `<ellipse rx="104" ry="98" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="8"/>
      <ellipse rx="104" ry="98" fill="url(#${p}pele)"/>
      <g clip-path="url(#${p}clip-peito)"><ellipse rx="104" ry="98" fill="url(#${p}luzH)"/><ellipse rx="104" ry="98" fill="url(#${p}luzV)"/>
        <path d="M-72,48 C-30,64 30,64 72,48 M-56,68 C-20,80 20,80 56,68 M-84,-6 C-90,20 -86,40 -76,58 M84,-6 C90,20 86,40 76,58" stroke="#6E7385" stroke-width="2.2" fill="none" opacity=".42" stroke-linecap="round"/>
        <path d="M-70,-54 C-40,-80 30,-86 64,-66" stroke="#F2F4F8" stroke-width="8" fill="none" opacity=".35" stroke-linecap="round"/>
        <path class="el-poP" d="M-96,-36 C-60,-104 60,-104 96,-36 C50,-66 -50,-66 -96,-36 Z" fill="#B48C62" opacity="0"/>
        <ellipse class="el-molhP" rx="104" ry="98" fill="#4A5470" opacity="0"/></g>`;
  }

  /* --- Patas (cada peça desenhada ao longo de +x; contorno primeiro, enchimento depois) --- */
  const capsula = (L, a, b) => `M0,${-a} L${L},${-b} A${b},${b} 0 0 1 ${L},${b} L0,${a} A${a},${a} 0 0 1 0,${-a} Z`;
  const PE = 'M-31,-6 C-33,4 -35,12 -34,17 C-33,21 -22,22.5 0,22.5 C22,22.5 33,21 34,17 C35,12 33,4 31,-6 Z';
  function pernaSVG(p, pe) {
    const k = 'el-' + pe.id, L1 = pe.L1, L2 = pe.L2;
    const sup = capsula(L1, 31, 27), inf = capsula(L2, 27, 25);
    const rugas = [.42, .58, .74].map(f => `M${n(L2 * f)},-23 Q${n(L2 * f + 4)},0 ${n(L2 * f)},23`).join(' ');
    return `<g class="el-perna ${k}">
      <g class="${k}-sup"><path d="${sup}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7" stroke-linejoin="round"/></g>
      <g class="${k}-inf"><path d="${inf}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7"/></g>
      <g class="${k}-joe"><circle r="27" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7"/></g>
      <g class="${k}-pe"><path d="${PE}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7" stroke-linejoin="round"/></g>
      <g class="${k}-sup"><path d="${sup}" fill="url(#${p}perna)"/><path d="M14,-12 L${L1 - 6},-10" stroke="#E8EBF1" stroke-width="5" opacity=".3" stroke-linecap="round"/></g>
      <g class="${k}-inf"><path d="${inf}" fill="url(#${p}perna)"/><path d="${rugas}" stroke="#6C7183" stroke-width="2" fill="none" opacity=".45" stroke-linecap="round"/>
        <path d="M6,-11 L${L2 - 12},-10" stroke="#E8EBF1" stroke-width="4" opacity=".28" stroke-linecap="round"/></g>
      <g class="${k}-joe"><circle r="27" fill="url(#${p}joelho)"/><path d="M-12,-14 C-4,-19 6,-19 13,-13 M-14,4 C-6,9 6,9 14,4" stroke="#6C7183" stroke-width="2" fill="none" opacity=".4" stroke-linecap="round"/></g>
      <g class="${k}-pe"><path d="${PE}" fill="url(#${p}pe)"/><path d="M-30,18 C-15,22 15,22 30,18" stroke="#CFC7BA" stroke-width="2.4" fill="none" opacity=".8"/>
        ${[0, 1, 2].map(j => `<ellipse class="${k}-unha${j}" cy="14" rx="6.5" ry="5.2" fill="${COR.unha}" stroke="#8E8676" stroke-width="1.4"/>`).join('')}
        <path class="el-lamaPe" d="M-34,8 C-20,4 20,4 34,8 L34,17 C33,21 22,22.5 0,22.5 C-22,22.5 -33,21 -34,17 Z" fill="#6B4E36" opacity="0"/></g>
    </g>`;
  }
  function sombrasPesSVG(p) {
    return PERNAS.map(pe => `<ellipse class="el-sp-${pe.id}" rx="34" ry="8" fill="url(#${p}sombra)"/>`).join('');
  }

  /* --- Cauda: segmentos com onda + tufo de pelos --- */
  function caudaSVG(p) {
    let A = '', B = '';
    for (let i = 0; i < NCA; i++) {
      const w = WCA[i], r = `x="${-w / 2}" y="${-w / 2}" width="${LCA + w}" height="${w}" rx="${w / 2}"`;
      A += `<g class="el-ca${i}"><rect ${r} fill="${COR.cont}" stroke="${COR.cont}" stroke-width="6"/></g>`;
      B += `<g class="el-ca${i}"><rect ${r} fill="#9CA1B0"/>${i % 2 ? `<path d="M3,${-w / 2 + 1} L4,${w / 2 - 1}" stroke="#7A7F90" stroke-width="1.3"/>` : ''}</g>`;
    }
    const tufo = 'M-3,-6 C8,-10 22,-10 32,-3 C37,0 36,5 30,7 C20,11 6,10 -3,6 C-6,3 -6,-3 -3,-6 Z';
    A += `<g class="el-ca${NCA}"><path d="${tufo}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="4"/></g>`;
    B += `<g class="el-ca${NCA}"><path d="${tufo}" fill="url(#${p}tufo)"/><path d="M2,-3 C14,-6 24,-5 34,-1 M2,2 C14,4 24,5 32,5 M8,-6 C14,-8 20,-8 26,-6" stroke="#7A6E7A" stroke-width="1.4" fill="none" opacity=".85" stroke-linecap="round"/></g>`;
    return A + B;
  }

  /* --- Cabeça: esfera vista com as feições a deslizar com Y = cos(rumo da cabeça)
         (−1 perfil para a esquerda … 0 de frente … 1 perfil para a direita); beta = inclinação (graus, + para baixo).
         As orelhas são planos presos a uma dobradiça na esfera: a direção da aba (para trás e para fora, ângulo «ang»)
         é projetada em 3D; vê-se a face de dentro (rosa) ou a de fora (cinzenta) conforme a normal. --- */
  function estadoCabeca(q) {
    const Y = q.Y, aY = Math.abs(Y), b = q.beta * RAD, cb = Math.cos(b), sb = Math.sin(b);
    const t = {}, d = {}, op = {}, a = {};
    const al = Math.asin(limita(Y, -1, 1)) / RAD;
    const sen = g => Math.sin(g * RAD), cosg = g => Math.cos(g * RAD);
    const Mx = Y * 40 * cb, My = 18 + 26 * sb;               // massa da cara (onde nasce a tromba)
    t.foc = `translate(${n(Mx)},${n(My)})`;
    a.B = [Y * 46 * cb, My + 4];                             // base da tromba
    const bx = Y * 34 * cb, by = My + 40;                     // boca, por baixo da tromba
    t.bocaInt = `translate(${n(bx + Y * 4)},${n(by + 3 + q.boca * 7)})`;
    a.bocaRy = n(1 + q.boca * 10); a.bocaRx = n(10 * (1 - .3 * aY) + 3);
    t.queixo = `translate(${n(bx - Y * 2 + q.mastX)},${n(by + 11 + q.boca * 13 + q.mastY)})`;
    const c1 = [bx - 13 * (1 - aY) - aY * (Y > 0 ? 12 : 2), by + 1], c2 = [bx + 13 * (1 - aY) + aY * (Y > 0 ? 2 : 12), by + 1];
    const cc = [(c1[0] + c2[0]) / 2, by + 6 + q.sorriso * 4];
    d.boca = `M${n(c1[0])},${n(c1[1])} Q${n(cc[0])},${n(cc[1])} ${n(c2[0])},${n(c2[1])}`;
    a.boca = [bx, by + 6];
    t.rugas = `translate(${n(Y * 22)},${n(-sb * 6)})`;
    t.cabelo = `translate(${n(-Y * 8)},${-RC - 1}) rotate(${n(q.cabelo)})`;
    for (const s of [1, -1]) {                                // s = 1: lado esquerdo do elefante (E)
      const k = s > 0 ? 'E' : 'D';
      const ge = al - s * 40, ce = cosg(ge), ex = 60 * sen(ge), sx = .22 + .78 * Math.max(0, ce), ey = -12 - 5 * sb;
      const es = q.olhoEsc * .82;
      t['olho' + k] = `translate(${n(ex)},${n(ey)}) scale(${n3(sx * es)},${n3(es)})`;
      op['olho' + k] = ce > .08 ? '1' : '0';
      t['sobr' + k] = `translate(${n(61 * sen(ge - s * 3))},${n(ey - 20 - q.sobr * 5)}) rotate(${n(s * (8 - q.sobr * 10))}) scale(${n3(sx)},1)`;
      op['sobr' + k] = ce > .12 ? '1' : '0';
      const gc = al - s * 56;
      t['boch' + k] = `translate(${n(64 * sen(gc))},${n(ey + 27)}) scale(${n3(.3 + .7 * Math.max(0, cosg(gc)))},1)`;
      op['boch' + k] = n3(passoS(.05, .4, cosg(gc)) * .5 * (1 + q.feliz * .6));
      // orelha
      const go = al - s * 104, ox = 72 * sen(go), oy = -16;
      const ang = limita(30 + (s > 0 ? q.oE : q.oD) + q.orelhas, 4, 88) * RAD, ps = q.psi;
      const dx = -Math.cos(ang) * Math.cos(ps) - s * Math.sin(ang) * Math.sin(ps);
      const dz = -Math.cos(ang) * Math.sin(ps) + s * Math.sin(ang) * Math.cos(ps);
      let e1 = dx;
      const fora = ox >= 0 ? 1 : -1;
      if (cosg(go) < 0 && e1 * fora < .34) e1 = fora * .34;   // a orelha de trás nunca aponta para dentro da cabeça
      else if (Math.abs(e1) < .34) e1 = (e1 < 0 ? -1 : 1) * .34;   // nunca fica um risco
      t['orelha' + k] = `matrix(${n3(e1)},${n3(KZ * dz)},0,1,${n(ox)},${oy})`;
      a['frente' + k] = cosg(go);
      a['dentro' + k] = Math.sin(ang) * Math.sin(ps) - s * Math.cos(ang) * Math.cos(ps);
    }
    // pálpebras: c = fecho, h = olhos contentes (arco «∩»)
    const c = limita(q.fecho, 0, 1), h = limita(q.feliz, 0, 1);
    const ye = lerp(lerp(-11, 11, c), 7, h), cy = lerp(lerp(-28, 19, c), -12, h);
    d.palpS = `M-18,-24 L18,-24 L18,${n(ye)} Q0,${n(cy)} -18,${n(ye)} Z`;
    const yl = lerp(19, 8, h), cyl = lerp(24, -9, h);
    d.palpI = `M-18,24 L18,24 L18,${n(yl)} Q0,${n(cyl)} -18,${n(yl)} Z`;
    const Q = (u, p0, p1, p2) => (1 - u) * (1 - u) * p0 + 2 * u * (1 - u) * p1 + u * u * p2;
    let cil = `M-14.5,${n(Q(.1, ye, cy, ye))} Q0,${n(Q(.5, ye, cy, ye) * 2 - (Q(.1, ye, cy, ye) + Q(.9, ye, cy, ye)) / 2)} 14.5,${n(Q(.9, ye, cy, ye))}`;
    for (const u of [.12, .3, .5, .7, .88]) {
      const x = lerp(-18, 18, u), y = Q(u, ye, cy, ye), vx = x * .6, vy = y - 2;
      const L = Math.hypot(vx, vy) || 1, ux = vx / L, uy = vy / L, comp = (u === .5 ? 7 : 9.5) * (1 - c * .25);
      cil += ` M${n(x)},${n(y)} q${n(ux * comp * .5 - uy * 2)},${n(uy * comp * .5 + ux * 2)} ${n(ux * comp)},${n(uy * comp)}`;
    }
    d.cil = cil;
    t.iris = `translate(${n(q.olharX * 4.5 + Y * 2)},${n(q.olharY * 4)})`;
    return { t, d, op, a };
  }

  function orelhaSVG(p, k) {
    return `<g class="el-orelha${k}"><g class="el-orelha${k}-fora">
        <path d="${ORELHA}" fill="url(#${p}orelhaFora)" stroke="${COR.cont}" stroke-width="3.4" stroke-linejoin="round"/>
        <path d="M6,-30 C30,-40 60,-42 84,-30 M8,-6 C36,-10 66,-6 92,4 M8,18 C30,22 52,34 66,56 M50,-36 C62,-24 70,-6 72,10" stroke="#767B8C" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>
        <path d="M20,-62 C50,-74 92,-70 110,-46" stroke="#EEF0F5" stroke-width="5" fill="none" opacity=".45" stroke-linecap="round"/>
        <path d="M2,-50 C-2,-20 -2,20 2,46" stroke="#6E7385" stroke-width="5" fill="none" opacity=".3" stroke-linecap="round"/>
        <path class="el-orelhaM" d="${ORELHA}" fill="#4A5470" opacity="0"/>
      </g><g class="el-orelha${k}-dentro" display="none">
        <path d="${ORELHA}" fill="url(#${p}orelhaFora)" stroke="${COR.cont}" stroke-width="3.4" stroke-linejoin="round"/>
        <path d="${ORELHA_IN}" fill="url(#${p}orelhaIn)"/>
        <path d="M16,-24 C38,-32 62,-32 82,-24 M16,0 C42,-2 66,4 88,14 M18,20 C36,26 50,38 58,56" stroke="#CF8592" stroke-width="1.8" fill="none" opacity=".6" stroke-linecap="round"/>
        <path d="M10,-38 C16,-10 16,20 10,40" stroke="#9A7E8C" stroke-width="6" fill="none" opacity=".3" stroke-linecap="round"/>
        <path class="el-orelhaM" d="${ORELHA}" fill="#4A5470" opacity="0"/>
      </g></g>`;
  }

  function cabecaSVG(p, E) {
    const T = k => E.t[k] ? ` transform="${E.t[k]}"` : '';
    const O = k => E.op[k] != null ? ` opacity="${E.op[k]}"` : '';
    const olho = k => `<g class="el-olho${k}"${T('olho' + k)}${O('olho' + k)}>
        <ellipse rx="18" ry="20.5" fill="#6E7384" opacity=".3"/>
        <path d="M-17,15 C-9,23 9,23 17,15 M-12,22 C-5,27 5,27 12,22" stroke="#6C7183" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>
        <g clip-path="url(#${p}clip-olho)">
          <ellipse rx="13.5" ry="16" fill="#FFFDF8"/>
          <g class="el-iris${k}"${T('iris')}><circle cy="1" r="10.5" fill="url(#${p}iris)"/><circle cy="1" r="10.5" fill="none" stroke="#1A0E08" stroke-width="1.5"/>
            <circle cy="1" r="5.4" fill="#120A06"/><circle cx="-3.8" cy="-3.8" r="4.2" fill="#FFFFFF"/><circle cx="4" cy="5" r="1.9" fill="#FFFFFF" opacity=".9"/></g>
          <path d="M-18,-20 L18,-20 L18,-8 Q0,-22 -18,-8 Z" fill="#2E2440" opacity=".14"/>
          <path class="el-palpS${k}" d="${E.d.palpS}" fill="url(#${p}palp)"/>
          <path class="el-palpI${k}" d="${E.d.palpI}" fill="url(#${p}palp)"/>
        </g>
        <ellipse rx="13.5" ry="16" fill="none" stroke="${COR.cont}" stroke-width="2.6"/>
        <path class="el-cil${k}" d="${E.d.cil}" fill="none" stroke="#2A2230" stroke-width="2.6" stroke-linecap="round"/>
      </g>`;
    return `<g class="el-cab-in">
      <g class="el-orelhasTras">${orelhaSVG(p, 'E')}${orelhaSVG(p, 'D')}</g>
      <ellipse rx="${RC + 4}" ry="${RC + 7}" fill="${COR.cont}"/>
      <g class="el-focC"${T('foc')}><ellipse rx="44" ry="47" fill="${COR.cont}"/></g>
      <ellipse rx="${RC}" ry="${RC + 3}" fill="url(#${p}cab)"/>
      <g clip-path="url(#${p}clip-cranio)">
        <g class="el-rugas"${T('rugas')}><path d="M-34,-50 C-16,-56 16,-56 34,-50 M-26,-38 C-12,-43 12,-43 26,-38 M-20,-63 C-8,-67 8,-67 20,-63" stroke="#7A7F90" stroke-width="2.2" fill="none" opacity=".5" stroke-linecap="round"/></g>
        <path d="M-52,-44 C-38,-66 -8,-76 22,-70" stroke="#F2F4F8" stroke-width="9" fill="none" opacity=".42" stroke-linecap="round"/>
        <path class="el-poC" d="M-62,-48 C-42,-88 42,-88 62,-48 C30,-64 -30,-64 -62,-48 Z" fill="#B48C62" opacity="0"/>
        <ellipse class="el-molhC" rx="${RC}" ry="${RC + 3}" fill="#4A5470" opacity="0"/>
      </g>
      <g class="el-foc"${T('foc')}><ellipse rx="40" ry="43" fill="url(#${p}foc)"/>
        <path d="M-22,-8 C-10,-12 10,-12 22,-8 M-17,4 C-8,1 8,1 17,4" stroke="#7A7F90" stroke-width="1.8" fill="none" opacity=".35" stroke-linecap="round"/></g>
      <g class="el-queixoC"${T('queixo')}><ellipse rx="22" ry="13" fill="${COR.cont}"/></g>
      <ellipse class="el-bocaInt"${T('bocaInt')} rx="${E.a.bocaRx}" ry="${E.a.bocaRy}" fill="#7C3446"/>
      <g class="el-queixo"${T('queixo')}><ellipse rx="18.5" ry="9.5" fill="#B4A2AC"/><path d="M-10,2 C-4,5 4,5 10,2" stroke="#8E7E88" stroke-width="1.4" fill="none"/></g>
      <path class="el-boca" d="${E.d.boca}" stroke="${COR.cont}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <ellipse class="el-bochE"${T('bochE')}${O('bochE')} rx="12" ry="7" fill="#F09AA4"/><ellipse class="el-bochD"${T('bochD')}${O('bochD')} rx="12" ry="7" fill="#F09AA4"/>
      ${olho('E')}${olho('D')}
      <path class="el-sobrE"${T('sobrE')}${O('sobrE')} d="M-9,2 C-4,-3 4,-3 9,1" stroke="#5E6274" stroke-width="3" fill="none" stroke-linecap="round" stroke-opacity=".75"/>
      <path class="el-sobrD"${T('sobrD')}${O('sobrD')} d="M-9,1 C-4,-3 4,-3 9,2" stroke="#5E6274" stroke-width="3" fill="none" stroke-linecap="round" stroke-opacity=".75"/>
      <g class="el-cabelo"${T('cabelo')}><path d="M-6,2 C-10,-6 -16,-10 -21,-10 M-2,2 C-4,-8 -4,-15 -9,-21 M2,2 C4,-8 6,-15 3,-23 M6,2 C10,-6 15,-12 21,-14" stroke="#5A5060" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>
      <g class="el-orelhasFrente"></g>
    </g>`;
  }

  /* --- Tromba: cadeia 3D no plano da cara (φ: 0 = para a frente, 90 = para baixo, −90 = para cima, 180 = para trás;
         ρ roda esse plano à volta do eixo da cara, para a tromba baloiçar de lado) --- */
  function cadeiaTromba(B, psi, rot, st, fase, imp, esc) {
    const F0 = Math.cos(psi), F1 = Math.sin(psi), S0 = -Math.sin(psi), S1 = Math.cos(psi);
        const rr = rot * RAD * .85, cr = Math.cos(rr), sr = Math.sin(rr);
    const pts = [[B[0], B[1]]], dirs = [];
    let x = B[0], y = B[1];
    for (let i = 0; i < NT; i++) {
      const u = (i + .5) / NT;
      const ph = (st.tA + st.tC * Math.pow(u, st.tE) + st.tW * Math.sin(fase - u * 2.6) * u + imp * u * u) * RAD;
      const rho = (st.tR + (st.tRc || 0) * u) * RAD, sr0 = Math.sin(rho), cr0 = Math.cos(rho);   // o plano da tromba também pode torcer ao longo dela (curva em «S» vista de frente)
      const cf = Math.cos(ph), sf = Math.sin(ph);
      const dx = cf * F0 + sf * sr0 * S0, dz = cf * F1 + sf * sr0 * S1, dh = -sf * cr0;
      const sx = dx, sy = KZ * dz - dh, L = TLEN[i] * esc;
      x += (sx * cr - sy * sr) * L; y += (sx * sr + sy * cr) * L;
      pts.push([x, y]); dirs.push([dx, dz, dh]);
    }
    return { pts, dirs };
  }
  // tubo afunilado por uma linha de pontos: devolve o caminho e os dois lados (para brilhos e rugas)
  function tubo(pts, ws, extra) {
    const m = pts.length, Ls = [], Rs = [], tg = [];
    let tx0 = 0, ty0 = 1;
    for (let i = 0; i < m; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(m - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty);
      if (l > .3) { tx /= l; ty /= l; tx0 = tx; ty0 = ty; } else { tx = tx0; ty = ty0; }
      const w = ws[i] + extra(i);
      Ls.push([pts[i][0] - ty * w, pts[i][1] + tx * w]); Rs.push([pts[i][0] + ty * w, pts[i][1] - tx * w]); tg.push([tx, ty]);
    }
    const u = m - 1, k = (ws[u] + extra(u)) * 1.35, tl = tg[u];
    const d = liso(Ls, true) + `C${n(Ls[u][0] + tl[0] * k)},${n(Ls[u][1] + tl[1] * k)} ${n(Rs[u][0] + tl[0] * k)},${n(Rs[u][1] + tl[1] * k)} ${n(Rs[u][0])},${n(Rs[u][1])}` + liso(Rs.slice().reverse(), false) + 'Z';
    return { d, Ls, Rs, tg };
  }
  function trombaSVG(p) {
    return `<g class="el-tromba">
      <path class="el-trC" fill="url(#${p}trombaC)"/>
      <path class="el-trF" fill="url(#${p}trombaG)"/>
      <path class="el-trS" fill="none" stroke="#5F6476" stroke-width="7" stroke-linecap="round" opacity=".24"/>
      <path class="el-trL" fill="none" stroke="#F2F4F8" stroke-width="5" stroke-linecap="round" opacity=".4"/>
      <path class="el-trR" fill="none" stroke="#6C7082" stroke-width="1.8" stroke-linecap="round" opacity=".6"/>
      <path class="el-trM" fill="#4A5470" opacity="0"/>
      <path class="el-trP" fill="#B48C62" opacity="0"/>
      <g class="el-trPonta" display="none"><ellipse rx="1" ry="1" fill="#5A4652"/><ellipse cx="-.36" rx=".22" ry=".3" fill="#1E151C"/><ellipse cx=".36" rx=".22" ry=".3" fill="#1E151C"/></g>
    </g>`;
  }
  function punhadoSVG() {             // punhado de erva na ponta da tromba
    return `<g class="el-punhado" display="none"><g class="el-punhadoIn">
      <path d="M0,0 C-6,-10 -14,-18 -22,-22 M0,0 C-2,-12 -4,-22 -10,-30 M0,0 C4,-12 6,-22 4,-32 M0,0 C6,-8 14,-16 22,-18 M0,0 C-8,-4 -18,-6 -26,-4" stroke="#7E9A3A" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M0,0 C-3,-9 -8,-16 -14,-22 M0,0 C3,-10 4,-18 2,-26" stroke="#C9B05A" stroke-width="2.4" fill="none" stroke-linecap="round"/></g></g>`;
  }

  function elefanteSVG(p) {
    const E = estadoCabeca(Object.assign({}, CAB_EST0));
    return `<g class="el-elefante">
      <ellipse class="el-sombra" rx="1" ry="1" fill="url(#${p}sombra)"/>
      ${sombrasPesSVG(p)}
      <g class="el-pernas">${PERNAS.map(pe => pernaSVG(p, pe)).join('')}</g>
      <g class="el-slotCaudaT"><g class="el-cauda">${caudaSVG(p)}</g></g>
      <g class="el-tronco">${troncoSVG(p)}</g>
      <g class="el-slotCaudaF"></g>
      <g class="el-peito" display="none">${peitoSVG(p)}</g>
      <g class="el-cab">${cabecaSVG(p, E)}</g>
      ${trombaSVG(p)}
      ${punhadoSVG()}
    </g>`;
  }
  const CAB_EST0 = { Y: -.5, psi: 2.09, beta: 8, oE: 0, oD: 0, orelhas: 0, fecho: 0, feliz: 0, sobr: 0, boca: 0, mastX: 0, mastY: 0, olharX: 0, olharY: 0, sorriso: .5, olhoEsc: 1, cabelo: 0 };

  /* ================= 4) Cenário: savana de manhã ================= */
  const SOL = { x: 282, y: 168 };
  function defsCena(p) {
    return `
    <linearGradient id="${p}ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#78B4E6"/><stop offset=".4" stop-color="#ABD3EE"/><stop offset=".66" stop-color="#E9EDE2"/><stop offset=".84" stop-color="#FBE6C6"/><stop offset="1" stop-color="#F8D9AE"/></linearGradient>
    <radialGradient id="${p}solBrilho"><stop offset="0" stop-color="#FFFBE8" stop-opacity=".95"/><stop offset=".16" stop-color="#FFF2C4" stop-opacity=".55"/><stop offset=".5" stop-color="#FFEBB4" stop-opacity=".16"/><stop offset="1" stop-color="#FFEBB4" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}sol" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="#FFFFFA"/><stop offset=".7" stop-color="#FFF8D8"/><stop offset="1" stop-color="#FFEDB0"/></radialGradient>
    <linearGradient id="${p}monte" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B3BEDA"/><stop offset=".4" stop-color="#9DABCD"/><stop offset=".62" stop-color="#8A99BE"/><stop offset="1" stop-color="#7A8AB0"/></linearGradient>
    <linearGradient id="${p}monte2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A7B4D2"/><stop offset="1" stop-color="#8E9DC2"/></linearGradient>
    <linearGradient id="${p}neve" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#F6F8FD"/><stop offset=".7" stop-color="#D8E0F0"/><stop offset="1" stop-color="#C4CFE6"/></linearGradient>
    <linearGradient id="${p}bruma" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F2EA" stop-opacity="0"/><stop offset=".6" stop-color="#F4F0E4" stop-opacity=".75"/><stop offset="1" stop-color="#F2EAD6" stop-opacity=".9"/></linearGradient>
    <linearGradient id="${p}planicie" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCD3A0"/><stop offset=".5" stop-color="#D4C27E"/><stop offset="1" stop-color="#C9B066"/></linearGradient>
    <linearGradient id="${p}erva" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D2B65E"/><stop offset=".4" stop-color="#C9A84E"/><stop offset="1" stop-color="#B48E3C"/></linearGradient>
    <linearGradient id="${p}terra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9B57C"/><stop offset="1" stop-color="#C39A60"/></linearGradient>
    <radialGradient id="${p}lama" cx=".5" cy=".45" r=".55"><stop offset="0" stop-color="#6E5038"/><stop offset=".7" stop-color="#8A6A4A"/><stop offset="1" stop-color="#A88A60" stop-opacity="0"/></radialGradient>
    <linearGradient id="${p}agua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9C7C4"/><stop offset=".3" stop-color="#83A79E"/><stop offset=".75" stop-color="#5F8578"/><stop offset="1" stop-color="#4C6E60"/></linearGradient>
    <linearGradient id="${p}reflexo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4F1F2" stop-opacity=".8"/><stop offset="1" stop-color="#E4F1F2" stop-opacity="0"/></linearGradient>
    <linearGradient id="${p}casca" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D2B49A"/><stop offset=".35" stop-color="#B08E74"/><stop offset=".75" stop-color="#8A6A54"/><stop offset="1" stop-color="#6A4E3E"/></linearGradient>
    <radialGradient id="${p}folha" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#B0C866"/><stop offset=".55" stop-color="#7F9E40"/><stop offset="1" stop-color="#557228"/></radialGradient>
    <linearGradient id="${p}rocha" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8DCC8"/><stop offset=".5" stop-color="#C0AE94"/><stop offset="1" stop-color="#8E7C66"/></linearGradient>
    <radialGradient id="${p}sombraArv"><stop offset="0" stop-color="#4A3410" stop-opacity=".32"/><stop offset=".7" stop-color="#4A3410" stop-opacity=".14"/><stop offset="1" stop-color="#4A3410" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}gota" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#D6ECF0"/><stop offset="1" stop-color="#8FB8C0"/></radialGradient>
    <radialGradient id="${p}poeira"><stop offset="0" stop-color="#D8B888" stop-opacity=".75"/><stop offset=".6" stop-color="#D2B080" stop-opacity=".35"/><stop offset="1" stop-color="#D2B080" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}cisco"><stop offset="0" stop-color="#FFF8DC" stop-opacity=".95"/><stop offset="1" stop-color="#FFF8DC" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}vinheta" cx=".48" cy=".46" r=".78"><stop offset=".62" stop-color="#3A2A10" stop-opacity="0"/><stop offset="1" stop-color="#3A2A10" stop-opacity=".26"/></radialGradient>
    <radialGradient id="${p}luzManha" gradientUnits="userSpaceOnUse" cx="${SOL.x}" cy="${SOL.y}" r="1150"><stop offset="0" stop-color="#FFF4D0" stop-opacity=".24"/><stop offset=".45" stop-color="#FFEFC8" stop-opacity=".07"/><stop offset="1" stop-color="#FFEFC8" stop-opacity="0"/></radialGradient>
    <clipPath id="${p}clipAgua"><rect class="el-clipAgua" x="0" y="779" width="1600" height="300"/></clipPath>`;
  }
  function ceuSVG(p) {
    let raios = '';
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 + 8) * RAD, b = a + 5.5 * RAD, L = 1200;
      raios += `<path d="M${SOL.x},${SOL.y} L${n(SOL.x + Math.cos(a) * L)},${n(SOL.y + Math.sin(a) * L)} L${n(SOL.x + Math.cos(b) * L)},${n(SOL.y + Math.sin(b) * L)} Z"/>`;
    }
    return `<rect width="1600" height="700" fill="url(#${p}ceu)"/>
      <circle cx="${SOL.x}" cy="${SOL.y}" r="500" fill="url(#${p}solBrilho)"/>
      <g class="el-raios" fill="#FFF6DA" opacity=".07">${raios}</g>
      <circle cx="${SOL.x}" cy="${SOL.y}" r="50" fill="url(#${p}sol)"/>
      <g class="el-nuvens">${nuvemSVG(0, 1)}${nuvemSVG(1, .7)}${nuvemSVG(2, .85)}${nuvemSVG(3, .55)}</g>`;
  }
  function nuvemSVG(i, k) {
    return `<g class="el-nuvem${i}"><g transform="scale(${k})">
      <ellipse cx="0" cy="12" rx="98" ry="13" fill="#E9DCE6" opacity=".85"/>
      <ellipse cx="-48" cy="0" rx="34" ry="17" fill="#FFFDFB"/><ellipse cx="-8" cy="-10" rx="42" ry="22" fill="#FFFFFF"/><ellipse cx="38" cy="-2" rx="34" ry="16" fill="#FFFDFB"/><ellipse cx="74" cy="6" rx="22" ry="9" fill="#FBF6F4"/>
      <ellipse cx="0" cy="8" rx="94" ry="9" fill="#F4ECF0"/>
      <path d="M-86,12 C-40,18 30,18 94,10" stroke="#D9C8D6" stroke-width="3" fill="none" opacity=".7"/>
      <ellipse cx="-24" cy="-18" rx="22" ry="6" fill="#FFFFFF" opacity=".95"/></g></g>`;
  }
  function monteSVG(p) {
    const neve = 'M612,372 C640,352 690,340 760,338 C820,337 870,342 904,356 C920,362 934,370 946,380 L932,388 L920,380 L912,402 L896,384 L884,410 L868,388 L852,404 L836,384 L820,412 L804,388 L788,400 L772,382 L756,406 L740,386 L724,398 L708,380 L690,402 L676,382 L660,394 L646,378 L630,388 Z';
    return `<path d="M380,592 C420,540 450,486 468,452 L480,432 L488,444 L498,424 L510,440 L520,430 C540,470 570,520 610,592 Z" fill="url(#${p}monte2)"/>
      <path d="M486,450 L494,470 M506,446 L512,476" stroke="#E6ECF6" stroke-width="3" opacity=".7"/>
      <path d="M250,600 C360,540 480,460 570,402 C600,384 616,372 640,358 C690,340 760,336 830,338 C880,340 912,352 944,372 C1030,428 1140,510 1290,600 Z" fill="url(#${p}monte)"/>
      <path d="M700,350 C690,410 660,480 610,560 M770,344 C776,420 770,500 756,580 M840,346 C870,410 900,480 950,560 M900,360 C960,420 1040,500 1110,580" stroke="#7A89AE" stroke-width="3" fill="none" opacity=".35"/>
      <path d="M600,392 C540,440 460,500 380,560" stroke="#D6DEEC" stroke-width="5" fill="none" opacity=".4"/>
      <path d="${neve}" fill="url(#${p}neve)"/>
      <path d="M640,358 C690,342 760,338 830,340 C870,342 896,350 912,358 C860,350 760,346 660,358 Z" fill="#FFFFFF"/>
      <path d="M720,356 L728,378 M800,350 L806,372 M860,356 L866,372" stroke="#B8C6E0" stroke-width="2.5" opacity=".7"/>
      <g class="el-faixa" opacity=".85">
        <ellipse cx="560" cy="478" rx="150" ry="11" fill="#FFFFFF" opacity=".8"/><ellipse cx="680" cy="470" rx="110" ry="13" fill="#FFFFFF" opacity=".9"/>
        <ellipse cx="820" cy="482" rx="160" ry="12" fill="#FFFFFF" opacity=".78"/><ellipse cx="980" cy="474" rx="120" ry="10" fill="#FFFFFF" opacity=".7"/>
        <ellipse cx="700" cy="488" rx="260" ry="7" fill="#EEE8F0" opacity=".7"/></g>
      <rect x="200" y="500" width="1150" height="110" fill="url(#${p}bruma)"/>`;
  }
  function avesSVG() {
    return [0, 1, 2, 3, 4].map(i => `<path class="el-ave${i}" d="M-9,0 Q-4.5,-6 0,0 Q4.5,-6 9,0" stroke="#4A4048" stroke-width="2.2" fill="none" stroke-linecap="round"/>`).join('');
  }
  function colinasSVG() {
    return `<path d="M0,560 C130,536 260,550 400,540 C540,530 660,556 800,546 C940,536 1080,552 1220,538 C1360,526 1480,546 1600,536 L1600,640 L0,640 Z" fill="#9DB1BA"/>
      <path d="M0,562 C130,538 260,552 400,542" stroke="#C6D4DA" stroke-width="3" fill="none" opacity=".6"/>
      <path d="M0,588 C160,566 320,580 480,568 C640,556 780,580 940,570 C1100,560 1260,580 1420,568 C1500,562 1560,566 1600,564 L1600,650 L0,650 Z" fill="#AEB792"/>
      <path d="M0,588 C160,566 320,580 480,568 C640,556 780,580 940,570 C1100,560 1260,580 1420,568" stroke="#CFD2AE" stroke-width="3" fill="none" opacity=".55"/>`;
  }
  function acaciaLongeSVG(x, y, k, cor) {
    return `<g transform="translate(${x},${y}) scale(${k})" fill="${cor}">
      <path d="M-2,0 L-1.5,-26 L-12,-38 L-10,-40 L0,-30 L8,-42 L10,-40 L2,-26 L2,0 Z"/>
      <ellipse cx="-2" cy="-44" rx="34" ry="7"/><ellipse cx="-14" cy="-47" rx="16" ry="5"/><ellipse cx="12" cy="-46" rx="18" ry="5"/></g>`;
  }
  function girafaLongeSVG(i) {
    return `<g class="el-gl${i}"><g fill="#9A8A70">
      <g class="el-glPernas"><path d="M-9,0 L-8,-16 M-5,0 L-5,-16 M6,0 L6,-17 M10,0 L9,-17" stroke="#9A8A70" stroke-width="2.2" stroke-linecap="round"/></g>
      <path d="M-12,-15 C-12,-22 -4,-24 4,-24 C10,-24 13,-21 13,-16 C8,-13 -6,-12 -12,-15 Z"/>
      <path d="M8,-22 L18,-44 L22,-43 L14,-20 Z"/><path d="M17,-46 L26,-44 L26,-41 L18,-41 Z"/><path d="M18,-46 L18,-50 M21,-46 L21,-50" stroke="#9A8A70" stroke-width="1.6"/></g></g>`;
  }
  function planicieSVG(p) {
    const rnd = semente(7);
    let s = `<rect y="590" width="1600" height="100" fill="url(#${p}planicie)"/>`;
    s += acaciaLongeSVG(470, 604, .7, '#98A07E') + acaciaLongeSVG(1120, 600, .9, '#8E9776') + acaciaLongeSVG(1430, 606, .6, '#9CA483') + acaciaLongeSVG(760, 602, .45, '#A2A988');
    let pa = '', pb = '';
    for (let i = 0; i < 140; i++) {
      const x = rnd() * 1600, y = 596 + rnd() * 80, h = 2 + (y - 590) * .05 + rnd() * 3;
      const seg = `M${n(x)},${n(y)} l${n(-1 - rnd())},${n(-h)} M${n(x + 2)},${n(y)} l${n(1 + rnd())},${n(-h * .9)} `;
      if (rnd() < .5) pa += seg; else pb += seg;
    }
    s += `<path d="${pa}" stroke="#BBA058" stroke-width="1.1" opacity=".6"/><path d="${pb}" stroke="#E8DCA4" stroke-width="1.1" opacity=".6"/>`;
    // manada de gnus muito ao longe (pontinhos)
    for (let i = 0; i < 9; i++) s += `<ellipse cx="${n(1250 + i * 13 + rnd() * 6)}" cy="${n(616 + rnd() * 4)}" rx="4" ry="2.4" fill="#7E7262" opacity=".7"/>`;
    s += `<g class="el-girafasLonge">${girafaLongeSVG(0)}${girafaLongeSVG(1)}</g>`;
    return s;
  }
  const TUFO = { x: n(668 + ESC * 168 * Math.cos(PI - .5)), y: n(CHAO + KZ * (40 + ESC * 168 * Math.sin(PI - .5))) };
  const TERRA = { x: n(668 + ESC * (150 * Math.cos(PI - .5) + 30 * Math.sin(PI - .5))), y: n(CHAO + KZ * (40 + ESC * (150 * Math.sin(PI - .5) - 30 * Math.cos(PI - .5)))) };
  function capimSVG(i, x, y, k, cor) {    // tufo de erva alta (abana ao vento)
    const rnd = semente(500 + i);
    let d = '';
    for (let j = 0; j < 11; j++) {
      const a = (j - 5) * 7 + (rnd() - .5) * 8, h = (50 + rnd() * 50) * k, bx = (j - 5) * 3 * k;
      const ex = bx + Math.sin(a * RAD) * h, ey = -Math.cos(a * RAD) * h;
      d += `M${n(bx - 2.4 * k)},0 Q${n(bx + ex * .3)},${n(ey * .55)} ${n(ex)},${n(ey)} Q${n(bx + ex * .3 + 3 * k)},${n(ey * .5)} ${n(bx + 2.4 * k)},0 Z`;
    }
    return `<g class="el-capim${i}" transform="translate(${x},${y})"><g class="el-capimIn"><path d="${d}" fill="${cor}" stroke="#8A6A24" stroke-width="1.1" stroke-linejoin="round" opacity=".95"/>
      <path d="${d}" fill="none" stroke="#F4E2A0" stroke-width=".7" opacity=".5"/></g></g>`;
  }
  const CAPINS = [[60, 690, .9, '#C9A646'], [150, 676, .7, '#A9B04C'], [330, 680, .75, '#CDA94A'], [610, 676, .6, '#B4B250'], [700, 668, .55, '#D2B254'],
    [1250, 690, .8, '#C7A444'], [1330, 676, .7, '#A7AE4A'], [1480, 690, .95, '#CFA846'], [1560, 680, .7, '#B0B04C'], [1120, 676, .5, '#D0B050'], [410, 700, .8, '#9EAA48']];
  function campoSVG(p) {
    const rnd = semente(13);
    let s = `<path d="M0,654 C200,642 420,650 640,644 C900,638 1180,650 1600,640 L1600,900 L0,900 Z" fill="url(#${p}erva)"/>`;
    // manchas verdes (a erva nova da manhã)
    for (let i = 0; i < 16; i++) { const x = rnd() * 1600, y = 680 + rnd() * 200; s += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(60 + rnd() * 90)}" ry="${n(10 + rnd() * 12)}" fill="${rnd() < .5 ? '#A7AC4C' : '#B9B656'}" opacity=".45"/>`; }
    // terra batida onde o elefante costuma estar e o carreiro até ao poço
    s += `<path d="M390,820 C430,778 520,760 640,756 C720,754 790,752 840,744 C900,736 960,732 1000,734 L1000,760 C940,766 880,778 820,786 C720,800 600,812 520,840 C470,858 420,860 390,820 Z" fill="url(#${p}terra)" opacity=".75"/>`;
    const tufos = {};
    for (let i = 0; i < 380; i++) {
      const y = 650 + Math.pow(rnd(), .8) * 250, x = rnd() * 1640 - 20, k = .4 + (y - 650) / 250 * 1.1;
      if (x > 440 && x < 900 && y > 750 && y < 830 && rnd() < .8) continue;    // a terra batida tem pouca erva
      const h = (7 + rnd() * 10) * k, cor = escolhe(['#B1893A', '#C7A048', '#EAD08A', '#F2DE9A', '#9EA848', '#8A9A3E']);
      const inc = (rnd() - .5) * 6 * k;
      const ch = cor + '|' + (Math.round((1 + k * .6) * 2) / 2);   // juntar por cor e espessura: menos elementos no SVG
      tufos[ch] = (tufos[ch] || '') + `M${n(x)},${n(y)} q${n(inc * .4)},${n(-h * .6)} ${n(inc)},${n(-h)} M${n(x + 2 * k)},${n(y)} q${n(-inc * .3 + 2)},${n(-h * .5)} ${n(-inc * .5 + 3 * k)},${n(-h * .8)} `;
    }
    for (const ch in tufos) { const [cor, w] = ch.split('|'); s += `<path d="${tufos[ch]}" stroke="${cor}" stroke-width="${w}" fill="none" stroke-linecap="round" opacity=".75"/>`; }
    for (let i = 0; i < 22; i++) {
      const x = rnd() * 1600, y = 690 + rnd() * 200;
      s += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(2 + rnd() * 3)}" ry="${n(1.2 + rnd() * 1.4)}" fill="#A08A66" opacity=".7"/><ellipse cx="${n(x - .8)}" cy="${n(y - .6)}" rx="${n(1.2 + rnd())}" ry=".8" fill="#EEDDB8" opacity=".7"/>`;
    }
    s += CAPINS.map((c, i) => capimSVG(i, ...c)).join('');
    // tufo de erva verde que o elefante arranca (perto das patas da frente)
    s += `<ellipse cx="${TERRA.x}" cy="${TERRA.y + 2}" rx="30" ry="7" fill="#B48A58" opacity=".55"/>
      <ellipse cx="${TUFO.x + 4}" cy="${TUFO.y + 3}" rx="26" ry="5" fill="#5A3A10" opacity=".22"/>
      <g class="el-tufo" transform="translate(${TUFO.x},${TUFO.y})"><g class="el-tufoIn">
        <path d="M-16,0 C-18,-10 -22,-18 -28,-22 C-20,-20 -14,-12 -12,0 Z M-9,0 C-10,-14 -12,-24 -16,-32 C-8,-26 -5,-14 -5,0 Z M-3,0 C-3,-14 -1,-26 2,-36 C4,-24 3,-12 2,0 Z M4,0 C6,-12 10,-22 16,-28 C12,-18 9,-8 8,0 Z M10,0 C14,-8 20,-14 28,-16 C20,-10 16,-4 14,0 Z" fill="#7F9E3C" stroke="#4E6A24" stroke-width="1.2" stroke-linejoin="round"/>
        <path d="M-6,0 C-6,-10 -8,-18 -10,-24 M5,0 C7,-8 10,-14 13,-19" stroke="#B9D06A" stroke-width="1.3" fill="none" opacity=".8"/></g></g>`;
    return s;
  }
  function embondeiroSVG(p) {
    const rnd = semente(61);
    const ramos = [
      [[180, 400], [150, 350], [118, 314], [86, 296]], [[186, 400], [176, 340], [168, 292], [160, 252]],
      [[214, 398], [226, 340], [240, 294], [252, 262]], [[240, 400], [276, 352], [314, 322], [352, 310]],
      [[150, 350], [130, 312], [126, 280]], [[276, 352], [290, 312], [304, 284]], [[118, 314], [84, 268]], [[314, 322], [350, 276]]
    ];
    const ramo = (r, w0, w1, cor, op) => r.slice(0, -1).map((q, i) => `<path d="M${q[0]},${q[1]} L${r[i + 1][0]},${r[i + 1][1]}" stroke="${cor}" stroke-width="${n(lerp(w0, w1, i / (r.length - 1)))}" stroke-linecap="round"${op ? ` opacity="${op}"` : ''}/>`).join('');
    let s = `<ellipse cx="270" cy="748" rx="210" ry="22" fill="url(#${p}sombraArv)"/>`;
    s += ramos.map((r, i) => ramo(r, i < 4 ? 40 : 15, i < 4 ? 10 : 4, '#6A4E3E')).join('');
    s += ramos.map((r, i) => ramo(r, i < 4 ? 16 : 6, i < 4 ? 3 : 1.5, '#C8A88E', .45)).join('');
    // tronco em forma de garrafa
    s += `<path d="M104,748 C122,690 112,620 118,560 C124,500 142,450 166,414 L176,396 C188,384 236,384 248,396 L258,414 C282,450 298,500 302,560 C308,620 298,690 318,748 Z" fill="url(#${p}casca)" stroke="#4E3828" stroke-width="2.5"/>
      <path d="M150,730 C146,660 148,580 162,500 C168,460 176,430 186,410" stroke="#EAD6C2" stroke-width="7" fill="none" opacity=".4" stroke-linecap="round"/>
      <path d="M200,740 C198,660 202,560 210,470 M240,736 C246,660 250,580 246,480 M170,700 C166,640 168,590 174,540 M274,720 C282,650 284,590 278,520" stroke="#6A4E3E" stroke-width="2.2" fill="none" opacity=".5"/>
      <path d="M120,690 C150,684 180,686 206,692 M126,610 C160,604 196,606 226,614 M136,530 C170,526 210,528 240,534 M230,660 C254,654 276,656 296,662" stroke="#6A4E3E" stroke-width="1.8" fill="none" opacity=".35"/>
      <ellipse cx="230" cy="600" rx="9" ry="14" fill="#4E3828" opacity=".7"/><path d="M222,592 C226,586 234,586 238,592" stroke="#E2CCB4" stroke-width="2" fill="none" opacity=".6"/>
      <path d="M104,748 C70,750 50,752 36,756 M318,748 C350,750 372,754 386,758" stroke="#5A4232" stroke-width="8" fill="none" stroke-linecap="round"/>`;
    // folhagem esparsa e frutos pendurados
    const folhas = [[86, 290, 26], [126, 276, 22], [160, 246, 28], [252, 256, 26], [304, 278, 22], [352, 304, 28], [84, 262, 18], [350, 270, 20], [200, 300, 18]];
    s += folhas.map(([x, y, r]) => {
      let b = '';
      for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + rnd(), d = r * .5; b += `<ellipse cx="${n(x + Math.cos(a) * d * 1.3)}" cy="${n(y + Math.sin(a) * d * .6)}" rx="${n(r * .55)}" ry="${n(r * .36)}"/>`; }
      return `<g fill="#4E6A24" transform="translate(0,4)">${b}</g><g fill="url(#${p}folha)">${b}</g><ellipse cx="${x - r * .3}" cy="${y - r * .3}" rx="${r * .4}" ry="${r * .18}" fill="#C8DC80" opacity=".5"/>`;
    }).join('');
    s += `<g class="el-frutos">${[[132, 320], [270, 330], [330, 334]].map(([x, y], i) => `<g class="el-fruto${i}" transform="translate(${x},${y})"><path d="M0,0 L0,18" stroke="#6A4E3E" stroke-width="1.6"/><ellipse cy="28" rx="7" ry="11" fill="#A89870" stroke="#6A5A3E" stroke-width="1.4"/><ellipse cx="-2" cy="24" rx="2.5" ry="4" fill="#E6DCBC" opacity=".6"/></g>`).join('')}</g>`;
    s += `<g class="el-ervaArv">${[[96, 752], [130, 756], [290, 754], [330, 758]].map(([x, y]) => `<path d="M${x},${y} q-2,-14 -5,-20 M${x + 4},${y} q1,-12 5,-18 M${x + 8},${y} q3,-9 8,-13" stroke="#B7983E" stroke-width="2.2" fill="none" stroke-linecap="round"/>`).join('')}</g>`;
    return `<g>${s}</g>`;
  }
  function rochasSVG(p) {
    return `<g>
      <ellipse cx="1470" cy="708" rx="150" ry="15" fill="url(#${p}sombraArv)"/>
      <path d="M1352,708 C1348,684 1364,660 1394,652 C1420,646 1444,658 1452,678 C1460,694 1458,704 1450,708 Z" fill="url(#${p}rocha)" stroke="#6A5A48" stroke-width="2.5"/>
      <path d="M1420,708 C1418,670 1440,636 1484,624 C1524,616 1560,638 1570,676 C1576,696 1574,704 1568,708 Z" fill="url(#${p}rocha)" stroke="#6A5A48" stroke-width="2.5"/>
      <path d="M1514,708 C1516,688 1538,672 1568,674 C1594,676 1606,694 1604,708 Z" fill="url(#${p}rocha)" stroke="#6A5A48" stroke-width="2.5"/>
      <path d="M1452,644 C1470,632 1496,628 1516,632 M1366,670 C1376,658 1390,654 1404,654" stroke="#FFF8EA" stroke-width="5" fill="none" opacity=".5" stroke-linecap="round"/>
      <path d="M1490,636 L1498,662 L1490,684 M1396,676 L1408,692" stroke="#6A5A48" stroke-width="2" fill="none" opacity=".7"/>
      <g transform="translate(1540,630) scale(.6)"><circle cx="-30" cy="-18" r="24" fill="#6E7A3A"/><circle cx="4" cy="-30" r="30" fill="#7E8C42"/><circle cx="36" cy="-16" r="22" fill="#66733A"/><circle cx="-8" cy="-38" r="14" fill="#9AA858" opacity=".8"/></g>
      ${[[1344, 710], [1412, 712], [1506, 712], [1584, 710]].map(([x, y]) => `<path d="M${x},${y} q-3,-14 -6,-20 M${x + 4},${y} q1,-12 5,-18 M${x + 8},${y} q3,-9 8,-13" stroke="#B7983E" stroke-width="2.2" fill="none" stroke-linecap="round"/>`).join('')}
    </g>`;
  }
  function garcaSVG() {                 // garça-boieira (branca, bico amarelo)
    return `<g class="el-garca"><g class="el-garcaIn">
      <ellipse class="el-garcaSombra" cx="2" cy="1" rx="14" ry="3" fill="#3E3018" opacity=".25"/>
      <g class="el-garcaPernas"><path class="el-gpE" d="M-2,-14 L-4,0" stroke="#B49A3A" stroke-width="2" stroke-linecap="round"/><path class="el-gpD" d="M3,-14 L5,0" stroke="#A88E34" stroke-width="2" stroke-linecap="round"/></g>
      <path d="M-16,-22 L-26,-16 L-14,-18 Z" fill="#EDEAE0"/>
      <ellipse cx="0" cy="-22" rx="14" ry="9" fill="#FFFFFF" stroke="#B8B2A4" stroke-width="1.2"/>
      <g class="el-garcaAsa"><path d="M-12,-24 C-4,-32 8,-30 10,-22 C2,-18 -6,-18 -12,-24 Z" fill="#F4F1EA" stroke="#B8B2A4" stroke-width="1"/></g>
      <g class="el-garcaCab"><path d="M8,-26 C12,-32 12,-38 9,-42" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="10" cy="-43" r="5.5" fill="#FFFFFF" stroke="#B8B2A4" stroke-width="1"/><path d="M8,-47 C12,-49 15,-47 15,-44" fill="#F2D38A" stroke="none"/>
        <path d="M14,-44 L24,-42 L14,-40 Z" fill="#F2B832" stroke="#C08A18" stroke-width=".8"/><circle cx="12" cy="-44" r="1.3" fill="#2A1E10"/></g></g></g>`;
  }
  function borboletaSVG() {
    return `<g class="el-bb" display="none"><g class="el-bbIn">
      <g class="el-bbAsaE"><path d="M0,0 C-8,-18 -24,-20 -22,-6 C-21,2 -10,4 0,0 Z" fill="#6FB8E8" stroke="#1E2A40" stroke-width="1.6"/><path d="M0,1 C-10,4 -16,12 -10,16 C-5,18 -1,10 0,1 Z" fill="#9AD0F0" stroke="#1E2A40" stroke-width="1.4"/>
        <circle cx="-16" cy="-10" r="1.8" fill="#FFF"/><circle cx="-20" cy="-5" r="1.4" fill="#FFF"/></g>
      <g class="el-bbAsaD"><path d="M0,0 C8,-18 24,-20 22,-6 C21,2 10,4 0,0 Z" fill="#6FB8E8" stroke="#1E2A40" stroke-width="1.6"/><path d="M0,1 C10,4 16,12 10,16 C5,18 1,10 0,1 Z" fill="#9AD0F0" stroke="#1E2A40" stroke-width="1.4"/>
        <circle cx="16" cy="-10" r="1.8" fill="#FFF"/><circle cx="20" cy="-5" r="1.4" fill="#FFF"/></g>
      <ellipse cx="0" cy="2" rx="2" ry="8" fill="#1E2A40"/><path d="M-1,-5 C-3,-10 -5,-12 -7,-13 M1,-5 C3,-10 5,-12 7,-13" stroke="#1E2A40" stroke-width="1" fill="none"/></g></g>`;
  }

  /* --- Poço (habitat): margem de lama, água com reflexos, papiros; a água repete-se por cima do elefante,
         recortada abaixo da linha de água (clipPath com um retângulo que segue o elefante) --- */
  const NOND = 14;
  function aguaSVG(p, k) {
    const { cx, cy, rx, ry } = POCO, rnd = semente(k === 't' ? 41 : 41);
    let brilhos = '';
    for (let i = 0; i < 16; i++) {
      const a = rnd() * TAU, r = Math.sqrt(rnd()) * .85, x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r, L = 10 + rnd() * 26;
      brilhos += `M${n(x - L / 2)},${n(y)} L${n(x + L / 2)},${n(y)} `;
    }
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${p}agua)"/>
      <path d="M${cx - rx * .86},${cy - ry * .32} C${cx - rx * .5},${cy - ry * .82} ${cx + rx * .5},${cy - ry * .82} ${cx + rx * .86},${cy - ry * .32} C${cx + rx * .4},${cy - ry * .5} ${cx - rx * .4},${cy - ry * .5} ${cx - rx * .86},${cy - ry * .32} Z" fill="url(#${p}reflexo)" opacity=".55"/>
      <ellipse cx="${cx - 60}" cy="${cy + 10}" rx="${rx * .5}" ry="${ry * .3}" fill="#7A6A44" opacity=".16"/>
      <path d="M${cx + 40},${cy - 30} C${cx + 90},${cy - 34} ${cx + 140},${cy - 26} ${cx + 170},${cy - 20}" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>
      <g class="el-brilhos${k}"><path d="${brilhos}" stroke="#F4FAFA" stroke-width="2.2" stroke-linecap="round" opacity=".5"/></g>
      ${Array.from({ length: NOND }, (_, i) => `<ellipse class="el-onda${k}${i}" rx="1" ry="1" fill="none" stroke="#EEF8F6" stroke-width="2" opacity="0"/>`).join('')}`;
  }
  function papiroSVG(i, x, y, h, inc) {
    const tx = Math.sin(inc * RAD) * h, ty = -Math.cos(inc * RAD) * h;
    let raios = '';
    for (let k = 0; k < 11; k++) { const a = (-160 + k * 14) * RAD; raios += `M${n(tx)},${n(ty)} q${n(Math.cos(a) * 10)},${n(Math.sin(a) * 6 - 4)} ${n(Math.cos(a) * 22)},${n(Math.sin(a) * 14 + 4)} `; }
    return `<g class="el-papiro${i}" transform="translate(${x},${y})"><g class="el-papiroIn">
      <path d="M0,0 Q${n(tx * .3)},${n(ty * .5)} ${n(tx)},${n(ty)}" stroke="#6E8A34" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="${raios}" stroke="#86A23E" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="${raios}" stroke="#C4D676" stroke-width=".8" fill="none" opacity=".7"/></g></g>`;
  }
  function pocoTrasSVG(p) {
    const { cx, cy, rx, ry } = POCO, rnd = semente(88);
    let pegadas = '';
    for (const [x, y] of [[838, 750], [876, 766], [808, 772], [1240, 760], [1214, 808], [878, 812]]) pegadas += `<ellipse cx="${x}" cy="${y}" rx="15" ry="5.5" fill="#4E3826" opacity=".55"/><path d="M${x - 14},${y - 2} C${x - 6},${y - 7} ${x + 6},${y - 7} ${x + 14},${y - 2}" stroke="#B49A74" stroke-width="1.6" fill="none" opacity=".6"/>`;
    let pedras = '';
    for (let i = 0; i < 9; i++) { const a = PI + .15 + i / 8 * (PI - .3), x = cx + Math.cos(a) * (rx + 26), y = cy + Math.sin(a) * (ry + 11) - 2, r = 5 + rnd() * 6; pedras += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(r * 1.4)}" ry="${n(r * .8)}" fill="#A4927A" stroke="#6E5E4A" stroke-width="1.4"/><ellipse cx="${n(x - r * .3)}" cy="${n(y - r * .3)}" rx="${n(r * .6)}" ry="${n(r * .25)}" fill="#E6D8C2" opacity=".6"/>`; }
    return `<g class="el-pocoTras">
      <ellipse cx="${cx}" cy="${cy + 6}" rx="${rx + 70}" ry="${ry + 28}" fill="url(#${p}lama)"/>
      <ellipse cx="${cx}" cy="${cy + 3}" rx="${rx + 22}" ry="${ry + 9}" fill="#6A4E36"/>
      <ellipse cx="${cx}" cy="${cy + 1}" rx="${rx + 8}" ry="${ry + 3}" fill="#54402C"/>
      ${pegadas}${pedras}
      ${papiroSVG(0, 1200, 724, 92, -8)}${papiroSVG(1, 1218, 728, 112, 4)}${papiroSVG(2, 1236, 730, 84, 14)}${papiroSVG(3, 830, 726, 70, -14)}
      <path d="M1176,728 q-3,-16 -8,-24 M1182,728 q0,-18 4,-26 M1230,732 q4,-14 10,-20 M806,728 q-4,-14 -10,-20 M816,728 q2,-14 6,-22" stroke="#7E9A38" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      ${aguaSVG(p, 't')}
    </g>`;
  }
  function pocoFrenteSVG(p) {
    const { cx, cy, rx, ry } = POCO;
    const arco = (k, e) => `M${n(cx - (rx + e))},${cy} A${n(rx + e)},${n(ry + e * k)} 0 0 0 ${n(cx + rx + e)},${cy}`;
    return `<g class="el-pocoFrente">
      <g clip-path="url(#${p}clipAgua)"><g opacity=".86">${aguaSVG(p, 'f')}</g></g>
      <g class="el-aneis">${PERNAS.map((_, i) => `<path class="el-anel${i}" d="" stroke="#F2FAF8" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0"/>`).join('')}</g>
      <path d="${arco(.4, 0)} L${cx + rx + 12},${cy} A${rx + 12},${ry + 7} 0 0 1 ${cx - rx - 12},${cy} Z" fill="#5E4630"/>
      <path d="${arco(.4, 2)}" stroke="#2E5248" stroke-width="2.5" fill="none" opacity=".5"/>
      <path d="${arco(.55, 13)}" stroke="#A88A64" stroke-width="3" fill="none" opacity=".55"/>
      ${[[850, 836], [960, 842], [1130, 832], [1190, 818]].map(([x, y]) => `<path d="M${x},${y} q-3,-14 -7,-20 M${x + 4},${y} q1,-14 5,-22 M${x + 8},${y} q4,-10 9,-14" stroke="#86A23E" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join('')}
    </g>`;
  }
  function ervaFrenteSVG(i, x, y, k, flip) {
    const rnd = semente(200 + i);
    let d = '';
    for (let j = 0; j < 10; j++) {
      const a = (j - 4.5) * 8 + (rnd() - .5) * 8, h = (70 + rnd() * 60) * k, bx = (j - 4.5) * 4 * k;
      const ex = bx + Math.sin(a * RAD) * h, ey = -Math.cos(a * RAD) * h;
      d += `M${n(bx - 3 * k)},0 Q${n(bx + ex * .3)},${n(ey * .55)} ${n(ex)},${n(ey)} Q${n(bx + ex * .3 + 4 * k)},${n(ey * .5)} ${n(bx + 3 * k)},0 Z`;
    }
    const cor = ['#C9963A', '#9AA444', '#D8A846', '#88A040'][i % 4];
    return `<g class="el-erva${i}" transform="translate(${x},${y})${flip ? ' scale(-1,1)' : ''}"><g class="el-ervaIn"><path d="${d}" fill="${cor}" stroke="#7A5A1E" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="#F4DC96" stroke-width=".8" opacity=".55"/>
      ${i % 3 === 0 ? `<g transform="translate(${n(10 * k)},${n(-100 * k)})"><circle r="5" fill="#F2E8C8"/><circle r="2.2" fill="#E0A830"/></g>` : ''}</g></g>`;
  }
  const ERVAS = [[30, 908, 1.1, false], [140, 912, .9, true], [270, 906, .7, false], [1330, 908, .8, true], [1450, 912, 1.05, false], [1570, 906, .95, true], [1240, 914, .5, false], [700, 916, .42, true]];

  /* ================= 5) Ícone do menu (retrato parado, sem gradientes nem recortes com id) ================= */
  function iconeSVG() {
    const C = COR.cont;
    const E = estadoCabeca(Object.assign({}, CAB_EST0, { Y: .34, psi: Math.acos(.34), beta: 4, feliz: .2, sorriso: 1, orelhas: 22, olhoEsc: 1.1 }));
    const T = k => E.t[k] ? ` transform="${E.t[k]}"` : '';
    const hc = [110, 104], k = .55;
    const B = [hc[0] + k * E.a.B[0], hc[1] + k * E.a.B[1]];
    const { pts } = cadeiaTromba(B, Math.acos(.34), 0, { tA: 82, tC: -190, tE: 2.4, tR: 0, tW: 0 }, 0, 0, k * .85);
    const ws = TWID.map(w => w * k);
    const tb = tubo(pts, ws, () => 0), tc = tubo(pts.slice(1), ws.slice(1), i => Math.min(2.2, 1 + i * .6));
    const olho = q => `<g${T('olho' + q)}${E.op['olho' + q] === '0' ? ' opacity="0"' : ''}><ellipse rx="13.5" ry="16" fill="#FFFDF8"/>
      <circle cx="1" cy="2" r="10.5" fill="#4A2C18"/><circle cx="1" cy="2" r="5.4" fill="#120A06"/><circle cx="-3" cy="-3" r="4.2" fill="#FFF"/><circle cx="4.5" cy="6" r="1.9" fill="#FFF"/>
      <path d="M-13.5,-2 C-12,-14 12,-14 13.5,-2 C11,-17 -11,-17 -13.5,-2 Z" fill="#A9AEBC"/>
      <ellipse rx="13.5" ry="16" fill="none" stroke="${C}" stroke-width="2.6"/>
      <path d="M-13,-4 Q0,-17 13,-4 M-11,-8 q-4,-4 -8,-5 M-5,-11 q-2,-5 -4,-8 M5,-11 q2,-5 4,-8 M11,-8 q4,-4 8,-5" stroke="#2A2230" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>`;
    const orelha = q => `<g${T('orelha' + q)}><path d="${ORELHA}" fill="#A2A7B5" stroke="${C}" stroke-width="3.4" stroke-linejoin="round"/><path d="${ORELHA_IN}" fill="#EBB0B8"/>
      <path d="M16,-24 C38,-32 62,-32 82,-24 M16,0 C42,-2 66,4 88,14" stroke="#CF8592" stroke-width="1.8" fill="none" opacity=".6"/></g>`;
    return `<circle cx="110" cy="110" r="106" fill="#F2DFA8"/><path d="M4,110 A106,106 0 0 1 216,110 Z" fill="#BFDDF0" opacity=".85"/>
      <path d="M40,104 C70,80 90,66 104,62 C120,60 140,72 168,104 Z" fill="#9FAECF" opacity=".8"/><path d="M90,70 C98,64 112,62 120,66 L114,74 L106,70 L98,76 Z" fill="#FFFFFF"/>
      <circle cx="110" cy="110" r="106" fill="none" stroke="#E2C27A" stroke-width="3"/>
      <path d="M52,206 C50,174 72,152 110,150 C148,152 170,174 168,206 Z" fill="#9BA0AF" stroke="${C}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M70,176 C84,166 100,162 118,164" stroke="#E8EBF1" stroke-width="6" fill="none" opacity=".4" stroke-linecap="round"/>
      <g transform="translate(${hc[0]},${hc[1]}) scale(${k})">
        ${orelha('E')}${orelha('D')}
        <ellipse rx="${RC + 4}" ry="${RC + 7}" fill="${C}"/>
        <g${T('foc')}><ellipse rx="44" ry="47" fill="${C}"/></g>
        <ellipse rx="${RC}" ry="${RC + 3}" fill="#A9AEBC"/>
        <path d="M-52,-44 C-38,-66 -8,-76 22,-70" stroke="#F2F4F8" stroke-width="9" fill="none" opacity=".5" stroke-linecap="round"/>
        <g${T('foc')}><ellipse rx="40" ry="43" fill="#A4A9B7"/></g>
        <g${T('queixo')}><ellipse rx="22" ry="13" fill="${C}"/><ellipse rx="18.5" ry="9.5" fill="#B4A2AC"/></g>
        <path d="${E.d.boca}" stroke="${C}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <ellipse${T('bochE')} rx="12" ry="7" fill="#F09AA4" opacity=".55"/><ellipse${T('bochD')} rx="12" ry="7" fill="#F09AA4" opacity=".55"/>
        ${olho('E')}${olho('D')}
        <g${T('cabelo')}><path d="M-6,2 C-10,-6 -16,-10 -21,-10 M-2,2 C-4,-8 -4,-15 -9,-21 M2,2 C4,-8 6,-15 3,-23 M6,2 C10,-6 15,-12 21,-14" stroke="#5A5060" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>
      </g>
      <path d="${tc.d}" fill="${C}"/><path d="${tb.d}" fill="${COR.tromba}"/>
      <path d="${liso(tb.Ls.map((q, i) => [lerp(pts[i][0], q[0], .5), lerp(pts[i][1], q[1], .5)]), true)}" stroke="#F2F4F8" stroke-width="4" fill="none" opacity=".45" stroke-linecap="round"/>`;
  }

  /* ================= 6) montar() ================= */
  // Repouso (fora): de pé, a 3/4 virado para a esquerda e para nós, à frente do poço; o poço fica atrás, à direita
  const REP = { X: 668, Z: 40, th: PI - .5 };
  const HAB = { X: 962, Z: -36, th: 1.3 };
  const TH_IDA = Math.atan2(HAB.Z - REP.Z, HAB.X - REP.X), TH_VOLTA = Math.atan2(REP.Z - HAB.Z, REP.X - HAB.X);
  const CORPO0 = { alt: 0, incl: 0, lat: 0, balanco: 0, cTurn: -.55, cB: 8, cBaixa: 0, cAv: 0, cRoll: 0 };
  const ROSTO0 = { olhos: 1, feliz: 0, sobr: 0, boca: 0, sorriso: .5, olhoEsc: 1, oE: 0, oD: 0, orelhas: 0 };
  const TROMBA0 = { tA: 80, tC: -100, tE: 2.3, tR: 0, tRc: 0, tW: 5, tAlvo: 0 };
  const TR_SOM = { tA: -30, tC: -75, tE: 1.25, tR: 16, tRc: -44 };              // a «trombeta»: tromba bem levantada
  const TR_ESGUICHO = { tA: -40, tC: -118, tE: 1, tR: -34, tRc: 0, tW: 2 };
  const TR_FONTE = { tA: -58, tC: -30, tE: 1.4, tR: 24, tRc: -56, tW: 2 };
  const TR_AGUA = { tA: 93, tC: 14, tE: 1.5, tR: 0, tRc: 0, tW: 2 };
  const DENTRO0 = { alt: 0, incl: 0, lat: 0, balanco: 0, cTurn: -.1, cB: 6, cBaixa: 0, cAv: 0, cRoll: 0 };
  const TROMBA_D = { tA: 84, tC: -72, tE: 2.2, tR: 0, tRc: 0, tW: 5, tAlvo: 0 };
  const CAUDA_0 = { cauA: 0, cauAmp: 9, cauVel: .5 };

  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .4 : 1;
    const p = 'elefante-';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.innerHTML = `<defs>${defsElefante(p)}${defsCena(p)}</defs>
      ${ceuSVG(p)}
      ${monteSVG(p)}
      <g class="el-aves">${avesSVG()}</g>
      ${colinasSVG()}${planicieSVG(p)}${campoSVG(p)}${embondeiroSVG(p)}${rochasSVG(p)}
      <g class="el-slotGarca">${garcaSVG()}</g>
      <g class="el-habitat">
        ${pocoTrasSVG(p)}
        <rect x="790" y="560" width="440" height="290" fill="#000" fill-opacity="0"/>
        ${elefanteSVG(p)}
        ${pocoFrenteSVG(p)}
      </g>
      <g class="el-particulas">
        ${Array.from({ length: 30 }, () => `<ellipse class="el-po" rx="1" ry="1" fill="url(#${p}poeira)" opacity="0"/>`).join('')}
        ${Array.from({ length: 56 }, () => `<ellipse class="el-gota" rx="1" ry="1" fill="url(#${p}gota)" stroke="#7FA8B0" stroke-width=".12" opacity="0"/>`).join('')}
      </g>
      ${borboletaSVG()}
      <g class="el-slotTopo"></g>
      ${ERVAS.map((e, i) => ervaFrenteSVG(i, ...e)).join('')}
      <g class="el-ciscos">${Array.from({ length: 16 }, (_, i) => `<circle class="el-cisco${i}" r="${n(2 + (i % 4) * .9)}" fill="url(#${p}cisco)"/>`).join('')}</g>
      <rect width="1600" height="900" fill="url(#${p}luzManha)" pointer-events="none"/>
      <rect width="1600" height="900" fill="url(#${p}vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s), qa = s => Array.from(svg.querySelectorAll(s));
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function poeT(lista, v) { for (const e of lista) poe(e, v); }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; el.setAttribute(nome, v); } }

    /* --- referências --- */
    const R = {
      habitat: q('.el-habitat'), elefante: q('.el-elefante'), sombra: q('.el-sombra'),
      tronco: q('.el-tronco'), troncoR: q('.el-troncoR'), peito: q('.el-peito'), pernas: q('.el-pernas'),
      cauda: q('.el-cauda'), slotCT: q('.el-slotCaudaT'), slotCF: q('.el-slotCaudaF'),
      ca: Array.from({ length: NCA + 1 }, (_, i) => qa('.el-ca' + i)),
      cab: q('.el-cab'), orelhasTras: q('.el-orelhasTras'), orelhasFrente: q('.el-orelhasFrente'),
      trC: q('.el-trC'), trF: q('.el-trF'), trS: q('.el-trS'), trL: q('.el-trL'), trR: q('.el-trR'), trM: q('.el-trM'), trP: q('.el-trP'), trPonta: q('.el-trPonta'), trG: q('.el-trG'), trGC: q('.el-trGC'),
      punhado: q('.el-punhado'), punhadoIn: q('.el-punhadoIn'),
      molh: qa('.el-molhT, .el-molhP, .el-molhC, .el-orelhaM'), brilhoT: q('.el-brilhoT'), po: qa('.el-poT, .el-poP, .el-poC'),
      lamaPe: qa('.el-lamaPe'),
      nuvens: [0, 1, 2, 3].map(i => q('.el-nuvem' + i)), raios: q('.el-raios'), faixa: q('.el-faixa'), aves: [0, 1, 2, 3, 4].map(i => q('.el-ave' + i)),
      gl: [0, 1].map(i => q('.el-gl' + i)), glPernas: qa('.el-glPernas'),
      capins: CAPINS.map((_, i) => q('.el-capim' + i + ' .el-capimIn')), ervas: ERVAS.map((_, i) => q('.el-erva' + i + ' .el-ervaIn')),
      frutos: [0, 1, 2].map(i => q('.el-fruto' + i)), papiros: [0, 1, 2, 3].map(i => q('.el-papiro' + i + ' .el-papiroIn')),
      brilhos: [q('.el-brilhost'), q('.el-brilhosf')], tufo: q('.el-tufoIn'),
      clipAgua: q('.el-clipAgua'), aneis: PERNAS.map((_, i) => q('.el-anel' + i)),
      ondas: Array.from({ length: NOND }, (_, i) => [q('.el-ondat' + i), q('.el-ondaf' + i)]),
      gotas: qa('.el-gota'), pos: qa('.el-po'), ciscos: Array.from({ length: 16 }, (_, i) => q('.el-cisco' + i)),
      garca: q('.el-garca'), garcaIn: q('.el-garcaIn'), garcaCab: q('.el-garcaCab'), garcaAsa: q('.el-garcaAsa'), garcaSombra: q('.el-garcaSombra'), gpE: q('.el-gpE'), gpD: q('.el-gpD'),
      slotGarca: q('.el-slotGarca'), slotTopo: q('.el-slotTopo'),
      bb: q('.el-bb'), bbE: q('.el-bbAsaE'), bbD: q('.el-bbAsaD')
    };
    const H = {};
    for (const k of ['olhoE', 'olhoD', 'bochE', 'bochD', 'sobrE', 'sobrD', 'bocaInt', 'rugas', 'cabelo', 'orelhaE', 'orelhaD']) H[k] = q('.el-' + k);
    H.foc = [q('.el-focC'), q('.el-foc')]; H.queixo = [q('.el-queixoC'), q('.el-queixo')]; H.boca = q('.el-boca');
    H.iris = [q('.el-irisE'), q('.el-irisD')];
    H.palp = ['E', 'D'].map(k => ({ s: q('.el-palpS' + k), i: q('.el-palpI' + k), c: q('.el-cil' + k) }));
    H.faces = ['E', 'D'].map(k => ({ fora: q(`.el-orelha${k}-fora`), dentro: q(`.el-orelha${k}-dentro`) }));
    const pernaEl = PERNAS.map(pe => ({
      g: q('.el-' + pe.id), sup: qa(`.el-${pe.id}-sup`), inf: qa(`.el-${pe.id}-inf`), joe: qa(`.el-${pe.id}-joe`), pe: qa(`.el-${pe.id}-pe`),
      unhas: [0, 1, 2].map(j => q(`.el-${pe.id}-unha${j}`)), sombra: q('.el-sp-' + pe.id), Js: null, Ks: null, As: null
    }));

    /* --- estado --- */
    const P = Object.assign({ X: REP.X, Z: REP.Z, th: REP.th, cTurnG: 0, cBG: 0, olharX: 0, olharY: 0, respA: 1, respF: .22,
      afunda: 0, mastX: 0, mastY: 0, somB: 0, somR: 0, somT: 0, tEnche: -1, tEncheA: 0, molhado: 0, po: 0, lama: 0, cabelo: 0 }, CORPO0, ROSTO0, TROMBA0, CAUDA_0);
    let modo = 'fora', reagindo = false, tempo = 0, vivo = true;
    const fase = { resp: 0, cauda: 0, tromba: 0, orelhas: 0 };
    let cabMundo = [0, 0], cabY = -.5, bocaMundo = [0, 0], ponta = [0, 0], pontaDir = [0, 1], pontaW = 9;
    const rig = { tm: [1, 0, 0, 1, 0, 0] };
    let alvoTromba = null;                                 // função que devolve o ponto (ecrã) que a ponta da tromba procura
    const pes = PERNAS.map(pe => ({ pe, x: 0, z: 0, y: 0, inc: 0, prof: 0, noAr: false }));
    const peDe = id => pes.find(f => f.pe.id === id);
    function restPe(pe, X, Z, th) {
      const u = pe.pu, v = pe.v;
      return [X + ESC * (u * Math.cos(th) - v * Math.sin(th)), Z + ESC * (u * Math.sin(th) + v * Math.cos(th))];
    }
    function assentarPes() { for (const f of pes) { const r = restPe(f.pe, P.X, P.Z, P.th); f.x = r[0]; f.z = r[1]; f.y = 0; f.inc = 0; } }
    assentarPes();
    // fundura do poço num ponto do chão (x, z)
    function prof(x, z) {
      const sy = CHAO + KZ * z, r = Math.hypot((x - POCO.cx) / POCO.rx, (sy - POCO.cy) / POCO.ry);
      return PROF * (1 - passoS(.5, 1, r));
    }
    const dentroPoco = (x, y) => Math.hypot((x - POCO.cx) / POCO.rx, (y - POCO.cy) / POCO.ry) < .97;

    /* --- impulsos curtos (orelhas, cauda, tromba, cabeça, tufo) --- */
    const impulsos = [];
    const IMP = { twE: 0, twD: 0, flick: 0, tromba: 0, cabR: 0, tufo: 0 };
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

    /* --- desenhar: lê P e põe as transformações em todas as peças --- */
    let ordemPernas = '', caudaNaFrente = false, thUnhas = 99;
    const frenteOrelha = { E: null, D: null }, dentroOrelha = { E: null, D: null };
    const tr = (x, y, r) => `translate(${n(x)},${n(y)}) rotate(${n(r)})`;
    const T = w => [w[0], CHAO - w[2] + KZ * w[1]];
    function desenhar() {
      const th = P.th, c = Math.cos(th), s = Math.sin(th);
      const resp = Math.sin(fase.resp) * P.respA;
      const altT = P.alt - P.afunda + resp * .7;
      const ci = Math.cos(P.incl), si = Math.sin(P.incl);
      const W = (u, v, h) => { const uu = u * ci, vv = v + P.lat; return [P.X + ESC * (uu * c - vv * s), P.Z + ESC * (uu * s + vv * c), ESC * (h + altT + u * si)]; };

      // tronco (perfil projetado) e peito de frente
      const c0 = T(W(0, 0, HC)), c1 = T(W(1, 0, HC));
      const fx = c1[0] - c0[0], fy = c1[1] - c0[1];
      rig.tm = [fx, fy, 0, ESC, c0[0], c0[1]];
      poe(R.tronco, `matrix(${n3(fx)},${n3(fy)},0,${ESC},${n(c0[0])},${n(c0[1])})`);
      poe(R.troncoR, `rotate(${n3(P.balanco)}) scale(1,${n3(1 + .014 * resp)})`);
      const wF = 1 - passoS(.3, .84, Math.abs(c));
      if (wF > .02) {
        const pc = T(W(96, 0, 200));
        atr(R.peito, 'display', 'inline');
        poe(R.peito, `translate(${n(pc[0])},${n(pc[1])}) rotate(${n3(P.balanco)}) scale(${n3(wF * ESC)},${n3(ESC * (1 + .012 * resp))})`);
      } else atr(R.peito, 'display', 'none');

      // patas: IK no plano de cada pata, pés onde estão plantados (enterrados no lodo do poço)
      const ordem = [];
      pes.forEach((f, i) => {
        const pe = f.pe, J = W(pe.u, pe.v, pe.h);
        f.prof = prof(f.x, f.z);
        const A = [f.x, f.z, f.y - f.prof + ESC * TORN];
        const dx = A[0] - J[0], dz = A[1] - J[1], dh = A[2] - J[2];
        const du = dx * c + dz * s, dv = -dx * s + dz * c;
        const L1 = ESC * pe.L1, L2 = ESC * pe.L2;
        const d = Math.hypot(du, dh) || .01, dd = limita(d, Math.abs(L1 - L2) + 2, L1 + L2 - .4);
        const base = Math.atan2(dh, du);
        const a1 = base + Math.acos(limita((L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd), -1, 1));
        const ku = L1 * Math.cos(a1), kh = L1 * Math.sin(a1), au = du * dd / d, ah = dh * dd / d;
        const fr = pe.L1 / (pe.L1 + pe.L2);
        const K = [J[0] + ku * c - dv * fr * s, J[1] + ku * s + dv * fr * c, J[2] + kh];
        const An = [J[0] + au * c - dv * s, J[1] + au * s + dv * c, J[2] + ah];
        const Js = T(J), Ks = T(K), As = T(An);
        const e = pernaEl[i];
        e.Js = Js; e.Ks = Ks; e.As = As;
        const l1 = Math.hypot(Ks[0] - Js[0], Ks[1] - Js[1]), l2 = Math.hypot(As[0] - Ks[0], As[1] - Ks[1]);
        poeT(e.sup, `${tr(Js[0], Js[1], Math.atan2(Ks[1] - Js[1], Ks[0] - Js[0]) / RAD)} scale(${n3(l1 / pe.L1)},${ESC})`);
        poeT(e.inf, `${tr(Ks[0], Ks[1], Math.atan2(As[1] - Ks[1], As[0] - Ks[0]) / RAD)} scale(${n3(l2 / pe.L2)},${ESC})`);
        poeT(e.joe, `translate(${n(Ks[0])},${n(Ks[1])}) scale(${ESC})`);
        poeT(e.pe, `translate(${n(As[0])},${n(As[1])}) rotate(${n(f.inc * (c >= 0 ? 1 : -1))}) scale(${ESC})`);
        ordem.push([J[1], i]);
        const gy = CHAO + KZ * f.z, al = limita(f.y / 40, 0, 1), naAgua = f.prof > 3;
        poe(e.sombra, `translate(${n(f.x + 8)},${n(gy + 3)}) scale(${n3(ESC * (1 - al * .5))})`);
        atr(e.sombra, 'opacity', naAgua ? '0' : n3(1 - al * .7));
      });
      ordem.sort((a, b) => a[0] - b[0]);
      const chave = ordem.map(a => a[1]).join('');
      if (chave !== ordemPernas) { ordemPernas = chave; for (const [, i] of ordem) R.pernas.appendChild(pernaEl[i].g); }
      // unhas: três por pé, presas à frente do pé redondo (só as viradas para nós)
      if (Math.abs(th - thUnhas) > .01) {
        thUnhas = th;
        [-38, 0, 38].forEach((dg, j) => {
          const g = th + dg * RAD, vis = Math.sin(g), x = 25 * Math.cos(g);
          pernaEl.forEach(e => { const u = e.unhas[j]; atr(u, 'cx', String(n(x))); atr(u, 'rx', String(n(6.5 * (.35 + .65 * Math.max(0, vis))))); atr(u, 'opacity', vis > -.12 ? '1' : '0'); });
        });
      }

      // cauda: base no alto da garupa, pendurada, com onda
      const querCF = s < .3;
      if (querCF !== caudaNaFrente) { caudaNaFrente = querCF; (querCF ? R.slotCF : R.slotCT).appendChild(R.cauda); }
      const cb0 = T(W(CAUDA0.u, 0, CAUDA0.h));
      const bxs = -c;
      let ang = 90 - (14 + P.cauA) * bxs, cx0 = cb0[0], cy0 = cb0[1];
      for (let i = 0; i <= NCA; i++) {
        const u = i / NCA;
        const onda = P.cauAmp * Math.sin(fase.cauda - i * .7) * (.3 + .7 * u) + IMP.flick * u * u;
        const A = (ang + onda * (i ? 1 : .4)) * RAD;
        poeT(R.ca[i], `translate(${n(cx0)},${n(cy0)}) rotate(${n(A / RAD)}) scale(${ESC})`);
        cx0 += LCA * ESC * Math.cos(A); cy0 += LCA * ESC * Math.sin(A);
        ang += 1.5 * bxs;
      }

      // cabeça
      let psi = th + P.cTurn + P.cTurnG;
      psi = limita(psi, .05, PI - .05);
      const Y = Math.cos(psi);
      cabY = Y;
      const hc = T(W(CAB.u + P.cAv, 0, CAB.h - P.cBaixa));
      cabMundo = hc;
      const rot = P.cRoll + P.somR + IMP.cabR;
      poe(R.cab, `translate(${n(hc[0])},${n(hc[1])}) scale(${ESC}) rotate(${n(rot)})`);
      const fecho = limita(1 - P.olhos * (1 - piscar), 0, 1);
      const abano = 5 * Math.sin(fase.orelhas) * calma;
      const E = estadoCabeca({ Y, psi, beta: P.cB + P.cBG, oE: P.oE + IMP.twE + abano, oD: P.oD + IMP.twD + abano * .8, orelhas: P.orelhas + P.somB * 26, fecho, feliz: P.feliz, sobr: P.sobr,
        boca: Math.max(P.boca, P.somB), mastX: P.mastX, mastY: P.mastY, olharX: P.olharX, olharY: P.olharY, sorriso: P.sorriso, olhoEsc: P.olhoEsc, cabelo: P.cabelo + 6 * Math.sin(tempo / 700) });
      for (const k of ['olhoE', 'olhoD', 'bochE', 'bochD', 'sobrE', 'sobrD', 'bocaInt', 'rugas', 'cabelo', 'orelhaE', 'orelhaD']) poe(H[k], E.t[k]);
      for (const k of ['olhoE', 'olhoD', 'bochE', 'bochD', 'sobrE', 'sobrD']) atr(H[k], 'opacity', String(E.op[k]));
      poeT(H.foc, E.t.foc); poeT(H.queixo, E.t.queixo);
      atr(H.boca, 'd', E.d.boca);
      atr(H.bocaInt, 'ry', String(E.a.bocaRy)); atr(H.bocaInt, 'rx', String(E.a.bocaRx));
      poeT(H.iris, E.t.iris);
      H.palp.forEach(e => { atr(e.s, 'd', E.d.palpS); atr(e.i, 'd', E.d.palpI); atr(e.c, 'd', E.d.cil); });
      ['E', 'D'].forEach((k, i) => {
        // com folga (histerese) para não piscar entre as duas camadas/faces quando a cabeça está mesmo no limite
        const cf = E.a['frente' + k], cd = E.a['dentro' + k];
        const fr = frenteOrelha[k] == null ? cf > 0 : frenteOrelha[k] ? cf > -.06 : cf > .06;
        const de = dentroOrelha[k] == null ? cd > -.2 : dentroOrelha[k] ? cd > -.26 : cd > -.14;
        if (fr !== frenteOrelha[k]) { frenteOrelha[k] = fr; (fr ? R.orelhasFrente : R.orelhasTras).appendChild(H['orelha' + k]); }
        if (de !== dentroOrelha[k]) { dentroOrelha[k] = de; atr(H.faces[i].dentro, 'display', de ? 'inline' : 'none'); atr(H.faces[i].fora, 'display', de ? 'none' : 'inline'); }
      });
      const rr = rot * RAD, cr = Math.cos(rr), sr = Math.sin(rr);
      const paraMundo = (x, y) => [hc[0] + ESC * (x * cr - y * sr), hc[1] + ESC * (x * sr + y * cr)];
      bocaMundo = paraMundo(E.a.boca[0], E.a.boca[1]);
      desenharTromba(paraMundo(E.a.B[0], E.a.B[1]), psi, rot);

      // sombra no chão (a luz vem da esquerda: a sombra cai um pouco para a direita); na água quase não se vê
      const g0 = T([P.X, P.Z, 0]);
      poe(R.sombra, `translate(${n(g0[0] + 30)},${n(g0[1] + 4)}) scale(${n(ESC * (90 + 120 * Math.abs(c)))},${n(ESC * 26)})`);
      atr(R.sombra, 'opacity', n3(1 - passoS(2, 20, P.afunda) * .7));

      // linha de água do elefante: a cópia da água por cima dele só se vê abaixo desta linha
      const Wl = CHAO + KZ * P.Z;
      atr(R.clipAgua, 'y', String(n(Wl)));
      pernaEl.forEach((e, i) => {
        const f = pes[i], anel = R.aneis[i];
        let A = e.Ks, B = e.As;
        if (A[1] > Wl) { A = e.Js; B = e.Ks; }
        if (f.prof > 4 && A[1] <= Wl && B[1] >= Wl) {
          const t = (Wl - A[1]) / Math.max(1, B[1] - A[1]), x = lerp(A[0], B[0], t), rx = 33 * ESC, ry = 7;
          e.anelX = x;
          atr(anel, 'd', `M${n(x - rx)},${n(Wl)} A${rx},${ry} 0 0 0 ${n(x + rx)},${n(Wl)}`);
          atr(anel, 'opacity', n3(limita((f.prof - 4) / 12, 0, 1) * (.55 + .2 * Math.sin(tempo / 300 + i))));
        } else { e.anelX = null; atr(anel, 'opacity', '0'); }
      });
      // pele molhada e pó nas costas
      const mo = n3(P.molhado * .3);
      for (const el of R.molh) atr(el, 'opacity', mo);
      atr(R.brilhoT, 'opacity', n3(P.molhado * .55));
      const po = n3(P.po * .36);
      for (const el of R.po) atr(el, 'opacity', po);
      for (const el of R.lamaPe) atr(el, 'opacity', n3(P.lama * .8));
    }

    /* --- tromba: cadeia, alvo (a ponta procura um ponto), enchimento (uma bossa que sobe), tubo --- */
    function desenharTromba(B, psi, rot) {
      const k = P.somT;
      const st = { tA: lerp(P.tA, TR_SOM.tA, k) + (P.cB + P.cBG) * .5, tC: lerp(P.tC, TR_SOM.tC, k), tE: lerp(P.tE, TR_SOM.tE, k), tR: lerp(P.tR, TR_SOM.tR, k), tRc: lerp(P.tRc, TR_SOM.tRc, k), tW: P.tW };
      const { pts, dirs } = cadeiaTromba(B, psi, rot, st, fase.tromba, IMP.tromba, ESC);
      if (P.tAlvo > .01 && alvoTromba) {
        const a = alvoTromba(), ex = a[0] - pts[NT][0], ey = a[1] - pts[NT][1];
        for (let i = 1; i <= NT; i++) { const w = Math.pow(i / NT, 1.5) * P.tAlvo; pts[i][0] += ex * w; pts[i][1] += ey * w; }
      }
      const ws = TWID.map((w, i) => {
        let f = 1;
        if (P.tEnche >= 0) f += .42 * P.tEncheA * Math.exp(-Math.pow((i / NT - P.tEnche) / .09, 2));
        return w * ESC * f;
      });
      const t = tubo(pts, ws, () => 0), tc = tubo(pts, ws, i => Math.min(2.8, i * 1.1));
      atr(R.trC, 'd', tc.d); atr(R.trF, 'd', t.d);
      // a cor da base da tromba é a da cara (não se vê a costura); escurece um pouco para a ponta
      for (const g of [R.trG, R.trGC]) { atr(g, 'x1', String(n(pts[0][0]))); atr(g, 'y1', String(n(pts[0][1]))); atr(g, 'x2', String(n(pts[3][0]))); atr(g, 'y2', String(n(pts[3][1] + .01))); }
      atr(R.trM, 'd', P.molhado > .02 ? t.d : ''); atr(R.trM, 'opacity', n3(P.molhado * .3));
      atr(R.trP, 'd', P.po > .02 ? t.d : ''); atr(R.trP, 'opacity', n3(P.po * .25));
      // lado da luz (cima à esquerda) e da sombra
      const tm = t.tg[NT >> 1], luz = (-tm[1]) * -.6 + tm[0] * -.8 > 0;
      const L = [], S = [], m = pts.length;
      for (let i = 3; i < m - 1; i++) {
        const a = luz ? t.Ls[i] : t.Rs[i], b = luz ? t.Rs[i] : t.Ls[i];
        L.push([lerp(pts[i][0], a[0], .52), lerp(pts[i][1], a[1], .52)]); S.push([lerp(pts[i][0], b[0], .6), lerp(pts[i][1], b[1], .6)]);
      }
      atr(R.trL, 'd', liso(L, true)); atr(R.trS, 'd', liso(S, true));
      // rugas (anéis) ao longo da tromba
      let rugas = '';
      for (let i = 2; i < m - 1; i++) {
        const sl = Math.hypot(pts[i + 1][0] - pts[i - 1][0], pts[i + 1][1] - pts[i - 1][1]);
        if (sl < 8) continue;
        const a = t.Ls[i], b = t.Rs[i], g = t.tg[i], w = ws[i] * .35;
        rugas += `M${n(lerp(pts[i][0], a[0], .8))},${n(lerp(pts[i][1], a[1], .8))} Q${n(pts[i][0] + g[0] * w)},${n(pts[i][1] + g[1] * w)} ${n(lerp(pts[i][0], b[0], .8))},${n(lerp(pts[i][1], b[1], .8))} `;
      }
      atr(R.trR, 'd', rugas);
      // ponta (as narinas só se veem quando a ponta está virada para nós)
      ponta = pts[NT]; pontaDir = t.tg[NT]; pontaW = ws[NT];
      const dn = dirs[NT - 1], face = limita(dn[1] * 1.1 + Math.max(0, dn[2]) * .25, 0, 1);
      if (face > .14) {
        atr(R.trPonta, 'display', 'inline');
        const an = Math.atan2(pontaDir[1], pontaDir[0]) / RAD + 90, w = pontaW * .82;
        poe(R.trPonta, `translate(${n(ponta[0] + pontaDir[0] * pontaW * .55)},${n(ponta[1] + pontaDir[1] * pontaW * .55)}) rotate(${n(an)}) scale(${n3(w)},${n3(w * face)})`);
      } else atr(R.trPonta, 'display', 'none');
      if (punhado.vis) poe(R.punhado, `translate(${n(ponta[0] + pontaDir[0] * 6)},${n(ponta[1] + pontaDir[1] * 6)}) rotate(${n(Math.atan2(pontaDir[1], pontaDir[0]) / RAD - 90)})`);
    }
    const punhado = { vis: false };
    function mostrarPunhado(v) { punhado.vis = v; atr(R.punhado, 'display', v ? 'inline' : 'none'); }

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
      const u = pisca.f / 230;
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
          const base = P.th + P.cTurn;
          const Yd = limita(dx / 360, -.9, .9);
          aT = limita(Math.acos(Yd) - base, -1.5, 1.5);
          aB = limita(dy / 260 * 18, -18, 18);
        }
      } else {
        olhar.t -= dt;
        if (olhar.t <= 0) {
          olhar.t = aleat(700, 2600);
          if (Math.random() < .45) { olhar.ax = 0; olhar.ay = 0; } else { olhar.ax = aleat(-.6, .6); olhar.ay = aleat(-.4, .3); }
        }
        ax = olhar.ax; ay = olhar.ay;
      }
      const kO = 1 - Math.exp(-dt / 60), kC = 1 - Math.exp(-dt / (olhar.rapido ? 120 : 280));
      P.olharX += (ax - P.olharX) * kO; P.olharY += (ay - P.olharY) * kO;
      P.cTurnG += (aT - P.cTurnG) * kC; P.cBG += (aB - P.cBG) * kC;
    }
    const tiques = { orelha: aleat(2000, 5000), cauda: aleat(3000, 7000), tromba: aleat(1500, 4000) };
    function atualizarTiques(dt) {
      tiques.orelha -= dt; tiques.cauda -= dt; tiques.tromba -= dt;
      if (tiques.orelha <= 0) {
        tiques.orelha = aleat(1800, 5000);
        const k = Math.random() < .5 ? 'twE' : 'twD';
        impulso(k, aleat(18, 30), aleat(380, 520));
        if (Math.random() < .4) impulso(k === 'twE' ? 'twD' : 'twE', aleat(14, 24), 460);
      }
      if (tiques.cauda <= 0) { tiques.cauda = aleat(2500, 6500); impulso('flick', aleat(20, 34) * (Math.random() < .5 ? -1 : 1), aleat(600, 900), 'onda'); }
      if (tiques.tromba <= 0) { tiques.tromba = aleat(1600, 4200); impulso('tromba', aleat(-22, -12), aleat(500, 800)); }   // a ponta da tromba fareja
    }

    /* --- água: ondas (cópia de trás e da frente), gotas, poeira --- */
    const ondas = R.ondas.map(els => ({ els, t: 1, dur: 1, vis: false }));
    function onda(x, y, r0, r1, dur, f, atraso) {
      const o = ondas.find(o2 => o2.t >= o2.dur) || ondas.reduce((a, b) => a.t / a.dur > b.t / b.dur ? a : b);
      Object.assign(o, { x, y, r0, r1, dur, f, t: -(atraso || 0) });
    }
    function atualizarOndas(dt) {
      for (const o of ondas) {
        if (o.t >= o.dur) { if (o.vis) { for (const el of o.els) atr(el, 'opacity', '0'); o.vis = false; } continue; }
        o.t += dt;
        if (o.t < 0) continue;
        const u = Math.min(1, o.t / o.dur), r = lerp(o.r0, o.r1, esai(u));
        for (const el of o.els) {
          atr(el, 'cx', String(n(o.x))); atr(el, 'cy', String(n(o.y))); atr(el, 'rx', String(n(r))); atr(el, 'ry', String(n(r * .28)));
          atr(el, 'opacity', n3(o.f * Math.pow(1 - u, 1.3))); atr(el, 'stroke-width', String(n(1.2 + 2.6 * (1 - u))));
        }
        o.vis = true;
      }
    }
    const gotas = R.gotas.map(el => ({ el, vivo: false }));
    function gota(x, y, vx, vy, r, yFim) {
      const g = gotas.find(g2 => !g2.vivo); if (!g) return;
      Object.assign(g, { x, y, vx, vy, r, yFim, vivo: true });
      atr(g.el, 'opacity', '.95');
    }
    function salpicar(x, y, quantas, forca, larg) {
      for (let i = 0; i < quantas; i++) {
        const a = aleat(-1, 1), xx = x + a * (larg || 24);
        gota(xx, y - aleat(0, 6), a * aleat(80, 220) * forca, -aleat(220, 460) * forca, aleat(3, 6), y + aleat(-6, 14));
      }
    }
    function atualizarGotas(dt) {
      const s = dt / 1000;
      for (const g of gotas) {
        if (!g.vivo) continue;
        g.vy += 1400 * s; g.x += g.vx * s; g.y += g.vy * s;
        if (g.vy > 0 && g.y > g.yFim) {
          g.vivo = false; atr(g.el, 'opacity', '0');
          if (dentroPoco(g.x, g.yFim)) onda(g.x, g.yFim, 1, 14, 560, .55);
          continue;
        }
        poe(g.el, `translate(${n(g.x)},${n(g.y)}) rotate(${n(Math.atan2(g.vy, g.vx) / RAD)}) scale(${n(g.r * (1 + Math.min(.6, Math.hypot(g.vx, g.vy) / 900)))},${n(g.r * .82)})`);
      }
    }
    const nuvensPo = R.pos.map(el => ({ el, vivo: false }));
    function poeira(x, y, vx, vy, r, dur, cai) {
      const g = nuvensPo.find(g2 => !g2.vivo); if (!g) return;
      Object.assign(g, { x, y, vx, vy, r, dur, t: 0, cai: cai || 0, vivo: true });
    }
    function nuvemPo(x, y, k, forca) {
      for (let i = 0; i < k; i++) poeira(x + aleat(-14, 14), y - aleat(0, 6), aleat(-40, 40) * forca, -aleat(10, 40) * forca, aleat(10, 18), aleat(800, 1300));
    }
    function atualizarPoeira(dt) {
      const s = dt / 1000;
      for (const g of nuvensPo) {
        if (!g.vivo) continue;
        g.t += dt;
        const u = g.t / g.dur;
        if (u >= 1) { g.vivo = false; atr(g.el, 'opacity', '0'); continue; }
        g.vy += g.cai * s; g.vx *= Math.exp(-s * 1.5); g.vy *= Math.exp(-s * (g.cai ? .4 : 1.5));
        g.x += g.vx * s; g.y += g.vy * s;
        const r = g.r * (1 + u * 1.6);
        atr(g.el, 'opacity', n3(Math.min(1, u * 6) * (1 - u) * .9));
        poe(g.el, `translate(${n(g.x)},${n(g.y)}) scale(${n(r)},${n(r * .72)})`);
      }
    }
    // um pé pousou: na água faz salpicos e ondas; em terra levanta pó
    function pousou(f) {
      const sy = CHAO + KZ * f.z;
      if (f.prof > 3) {
        salpicar(f.x, CHAO + KZ * P.Z, 5 + (Math.random() * 3 | 0), .75, 18);
        onda(f.x, CHAO + KZ * P.Z, 18, 70, 1100, .8); onda(f.x, CHAO + KZ * P.Z, 10, 46, 900, .6, 160);
        P.lama = Math.min(1, P.lama + .25);
      } else nuvemPo(f.x, sy, 3, .7);
    }

    /* --- tarefas: geradores que avançam com o dt do relógio (uma por faixa) --- */
    const faixas = new Map();
    function lancar(nome, gen, fim) {
      if (!vivo) return;
      if (nome === 'corpo') {
        olhar.foco = null; olhar.rapido = false; olhar.cabeca = true;
        if (alvoTromba) { const a = alvoTromba(); alvoTromba = () => a; }      // o alvo antigo fica parado: a tromba solta-se suavemente
        P.tEnche = -1; P.tEncheA = 0; mostrarPunhado(false);
        if (R.bb.__seguro) R.bb.__seguro = false;
      }
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

    /* --- pés: um passo (levanta, avança em arco, pousa) e recompor os pés fora do sítio --- */
    function* passo1(f, alvo, ms, alt = 24) {
      const x0 = f.x, z0 = f.z;
      yield* durante(ms, u => {
        const e = eseno(u);
        f.x = lerp(x0, alvo[0], e); f.z = lerp(z0, alvo[1], e); f.y = sino(u) * alt * ESC; f.inc = -sino(u) * 10;
      });
      f.y = 0; f.inc = 0;
      pousou(f);
    }
    function* recomporPes(ms = 280) {
      const fora = pes.filter(f => { const r = restPe(f.pe, P.X, P.Z, P.th); return f.y > .5 || Math.hypot(f.x - r[0], f.z - r[1]) > 3; });
      if (!fora.length) return;
      yield* juntos(...fora.map((f, i) => (function* () { yield* espera(i * 90); yield* passo1(f, restPe(f.pe, P.X, P.Z, P.th), ms, f.y > .5 ? f.y / ESC + 6 : 20); })()));
    }

    /* --- virar no sítio: o corpo roda, a cabeça adianta-se, as patas pisam uma a uma --- */
    function* virar(th1, ms) {
      const th0 = P.th;
      const thEm = u => lerp(th0, th1, eio(limita(u, 0, 1)));
      const plano = [['tE', 0, .3, .45], ['fE', .1, .4, .5], ['tD', .25, .55, .7], ['fD', .35, .65, .8], ['tE', .5, .8, 1], ['fE', .58, .88, 1], ['tD', .66, .94, 1], ['fD', .72, 1, 1]]
        .map(([id, a, b, ua]) => ({ f: peDe(id), a, b, ua, de: null, para: null, feito: false }));
      const ct0 = P.cTurn;
      yield* durante(ms, u => {
        P.th = thEm(u);
        P.cTurn = ct0 * (1 - u) + (thEm(u + .2) - P.th) * .9;
        P.alt = -4 * Math.sin(u * PI * 4) ** 2 * sino(u);
        P.balanco = 1.5 * Math.sin(u * PI * 4) * sino(u);
        for (const st of plano) {
          if (u < st.a || st.feito) continue;
          if (!st.de) { st.de = [st.f.x, st.f.z]; st.para = restPe(st.f.pe, P.X, P.Z, thEm(st.ua)); }
          const v = limita((u - st.a) / (st.b - st.a), 0, 1);
          st.f.x = lerp(st.de[0], st.para[0], eseno(v)); st.f.z = lerp(st.de[1], st.para[1], eseno(v)); st.f.y = sino(v) * 26 * ESC; st.f.inc = -sino(v) * 10;
          if (v >= 1) { st.feito = true; st.f.y = 0; st.f.inc = 0; pousou(st.f); }
        }
      });
      P.alt = 0; P.balanco = 0;
    }

    /* --- andar em sequência lateral (trás-esq., frente-esq., trás-dir., frente-dir.), pés presos ao chão (por distância) --- */
    const PASSO = { D: 100, beta: .7, ordem: { tE: 0, fE: .25, tD: .5, fD: .75 } };
    function perfilAndar(u, a = .2) {
      const tot = 1 - a;
      if (u < a) return (u * u / (2 * a)) / tot;
      if (u > 1 - a) { const w = u - (1 - a); return (a / 2 + (1 - 2 * a) + w - w * w / (2 * a)) / tot; }
      return (a / 2 + (u - a)) / tot;
    }
    function pePasso(d, off, total) {
      const { D, beta } = PASSO;
      const x = d / D + off, c = Math.floor(x), pp = x - c;
      const plantar = dtd => dtd <= 0 ? 0 : Math.min(dtd + beta * D / 2, total);
      if (pp < beta) return { F: plantar(D * (c - off)), alt: 0 };
      const dLo = D * (c + beta - off), dHi = D * (c + 1 - off);
      const de = plantar(D * (c - off)), para = plantar(dHi), ini = Math.max(dLo, 0);
      if (ini >= total - 2) return { F: de, alt: 0 };
      const qq = limita((d - ini) / Math.max(1, Math.min(dHi, total) - ini), 0, 1);
      return { F: lerp(de, para, eseno(qq)), alt: de === para ? 0 : Math.sin(PI * qq) };
    }
    function* andar(X1, Z1, ms) {
      const X0 = P.X, Z0 = P.Z, total = Math.hypot(X1 - X0, Z1 - Z0), ux = (X1 - X0) / (total || 1), uz = (Z1 - Z0) / (total || 1);
      const base = pes.map(f => [f.x, f.z]);
      yield* durante(ms, u => {
        const d = total * perfilAndar(u);
        P.X = X0 + ux * d; P.Z = Z0 + uz * d;
        const m = Math.min(suave(limita(u / .12, 0, 1)), suave(limita((1 - u) / .12, 0, 1)));
        pes.forEach((f, i) => {
          const r = pePasso(d, PASSO.ordem[f.pe.id], total);
          f.x = base[i][0] + ux * r.F; f.z = base[i][1] + uz * r.F; f.y = r.alt * 24 * ESC; f.inc = -r.alt * 10;
          const ar = r.alt > .03;
          if (f.noAr && !ar) pousou(f);
          f.noAr = ar;
        });
        const ph = d / PASSO.D * TAU;
        P.alt = (-5 - 3.2 * (1 - Math.cos(4 * ph)) / 2) * m;       // anda com os joelhos um pouco dobrados e assenta o peso em cada pisada
        P.lat = 3.5 * Math.sin(ph) * m;                              // o corpo balança de um lado para o outro
        P.balanco = 1.6 * Math.sin(ph + .5) * m;
        P.cBaixa = 4 * (1 - Math.cos(4 * ph + .7)) / 2 * m;         // a cabeça acena a cada passo
        P.cauA = 8 * Math.sin(ph) * m;
        P.tR = 12 * Math.sin(ph - .8) * m;                           // e a tromba baloiça
      });
      P.alt = 0; P.lat = 0; P.balanco = 0; P.cBaixa = 0; P.cauA = 0; P.tR = 0;
      pes.forEach(f => { if (f.noAr) { f.noAr = false; } });
      const fora = pes.filter(f => { const r = restPe(f.pe, P.X, P.Z, P.th); return Math.hypot(f.x - r[0], f.z - r[1]) > 3 || f.y > .5; });
      if (fora.length) yield* juntos(...fora.map((f, i) => (function* () { yield* espera(i * 60); yield* passo1(f, restPe(f.pe, P.X, P.Z, P.th), 200, 14); })()));
    }

    /* --- comportamentos (fora): 8 diferentes, ao acaso a cada 4–9 s, sem repetir; cada um começa por repor a cara --- */
    function* recompor(ms = 420) {
      yield* recomporPes();
      yield* tw(Object.assign({}, CORPO0, ROSTO0, TROMBA0), ms);
    }
    function* mastigar(ms, forca = 1) {
      yield* durante(ms, (u, t) => {
        const k = forca * Math.min(1, t / 200, (ms - t) / 200);
        const f = t / 1000 * TAU * 1.6;
        P.mastX = Math.sin(f) * 3 * k; P.mastY = (1 - Math.cos(2 * f)) * 2 * k; P.boca = .08 * k + Math.max(0, Math.sin(2 * f)) * .12 * k;
      });
      P.mastX = 0; P.mastY = 0; P.boca = 0;
    }
    function* abanarOrelhas() {             // abana as orelhas grandes para se refrescar
      yield* tw(Object.assign({}, ROSTO0, { olhos: .75, cB: 4 }), 320);
      yield* durante(2800, (u, t) => {
        const k = sino(u) ** .5, f = Math.sin(t / 1000 * TAU * 1.5);
        P.orelhas = (24 + 28 * f) * k; P.cRoll = 2.5 * f * k; P.tR = 6 * f * k; P.olhos = 1 - .35 * k;
      });
      yield* tw({ orelhas: 0, cRoll: 0, tR: 0, olhos: 1, cB: CORPO0.cB }, 420);
    }
    function* balancarTromba() {            // a tromba baloiça como um pêndulo, a ponta atrasa-se
      yield* tw(Object.assign({}, ROSTO0, { tA: 88, tC: -46, tE: 2, tW: 4 }), 450);
      yield* durante(3600, (u, t) => {
        const k = sino(u) ** .6, f = Math.sin(t / 1000 * TAU * .7);
        P.tR = 32 * f * k; P.cRoll = -4 * f * k; P.lat = 2.5 * f * k; P.tW = 4 + 10 * k; P.oE = 6 * f * k; P.oD = -6 * f * k;
      });
      yield* tw(Object.assign({}, TROMBA0, { cRoll: 0, lat: 0, oE: 0, oD: 0 }), 600);
    }
    function* comerErva() {                 // a tromba enrola-se no tufo de erva, arranca e leva à boca
      const tufo = [TUFO.x, TUFO.y - 16];
      olhar.foco = () => tufo; olhar.cabeca = false;
      yield* tw(Object.assign({}, ROSTO0, { cB: 22, cBaixa: 24, cAv: 8, alt: -7, incl: -.05, tA: 86, tC: 18, tE: 1.6, tW: 2, olhos: .92, oE: 8, oD: 8 }), 800);
      alvoTromba = () => tufo;
      yield* tw({ tAlvo: 1, tC: 34 }, 420);
      for (let i = 0; i < 2; i++) { yield* tw({ cBaixa: 16 }, 200); impulso('tufo', 1, 400, 'mola'); yield* tw({ cBaixa: 24 }, 200); }
      impulso('tufo', 1.6, 700, 'mola');
      tufoCorte = Math.min(.55, tufoCorte + .3);
      mostrarPunhado(true);
      const sobe = [tufo[0] + 6, tufo[1] - 60];
      alvoTromba = () => sobe;
      yield* tw({ cBaixa: 8, cB: 12, alt: -2, incl: 0, tC: 80 }, 420);
      alvoTromba = () => bocaMundo;
      olhar.foco = null; olhar.cabeca = true;
      yield* tw({ tA: 72, tC: 200, tE: 1.05, cBaixa: 0, cB: 4, alt: 0, olhos: .7 }, 650);
      mostrarPunhado(false);
      yield* juntos(mastigar(1900), (function* () { yield* espera(300); yield* tw({ tAlvo: 0, tA: TROMBA0.tA, tC: TROMBA0.tC, tE: TROMBA0.tE, tW: TROMBA0.tW, olhos: .55, feliz: .4 }, 800); yield* tw({ olhos: 1, feliz: 0 }, 400); })());
      yield* tw(Object.assign({}, CORPO0, { oE: 0, oD: 0 }), 500);
    }
    function* atirarPo() {                  // aspira pó do chão e atira-o para as costas (protetor solar dos elefantes!)
      const terra = [TERRA.x, TERRA.y - 4];
      olhar.foco = () => terra; olhar.cabeca = false;
      yield* tw(Object.assign({}, ROSTO0, { cB: 22, cBaixa: 22, cAv: 6, alt: -6, incl: -.04, tA: 88, tC: 14, tE: 1.6, tW: 2 }), 750);
      alvoTromba = () => terra;
      yield* tw({ tAlvo: 1 }, 380);
      for (let i = 0; i < 2; i++) { nuvemPo(terra[0], terra[1] + 4, 3, .5); yield* tw({ cBaixa: 16, tR: 8 }, 230); yield* tw({ cBaixa: 22, tR: -6 }, 230); }
      P.tEnche = 1; P.tEncheA = .7;
      yield* tw({ tEnche: .1, tR: 0 }, 450, eseno);
      P.tEnche = -1;
      alvoTromba = () => terra;
      olhar.foco = null; olhar.cabeca = true;
      yield* tw({ tAlvo: 0, cB: -4, cBaixa: -2, cAv: 0, alt: -3, incl: .02, cTurn: .05, tA: -22, tC: -136, tE: 1, olhos: .35, orelhas: 12 }, 700, eio);
      // sopra o pó por cima das costas
      let acc = 0;
      yield* durante(520, (u, t) => {
        acc += 1;
        if (acc % 2 === 0) {
          const v = aleat(260, 420);
          poeira(ponta[0], ponta[1], pontaDir[0] * v + aleat(-40, 40), pontaDir[1] * v + aleat(-40, 20), aleat(9, 15), aleat(1000, 1500), 420);
        }
        P.po = Math.max(P.po, u * .9);
      });
      impulso('flick', 30, 700, 'onda'); impulso('twE', 26, 420); impulso('twD', 26, 420);
      yield* espera(350);
      yield* tw(Object.assign({}, TROMBA0, CORPO0, { olhos: 1, orelhas: 0 }), 850);
    }
    function* levantarTromba() {            // levanta a tromba bem alto, orelhas abertas (como na trombeta, mas calado)
      yield* tw(Object.assign({}, ROSTO0), 200);
      yield* tw({ alt: -6, incl: .04, cB: -8, tA: -10, tC: -40, tE: 1.4, orelhas: 10 }, 380, eio);
      yield* tw({ alt: -4, incl: .05, cB: -14, tA: -34, tC: -78, tE: 1.25, orelhas: 34, olhoEsc: 1.08, sobr: .8, boca: .45 }, 420, esai);
      yield* durante(900, u => { P.tW = 5 + 6 * Math.sin(u * PI * 3); P.orelhas = 34 + 6 * Math.sin(u * PI * 4); });
      impulso('flick', 26, 700, 'onda');
      yield* tw({ boca: 0, sobr: 0, olhoEsc: 1 }, 300);
      yield* tw(Object.assign({}, CORPO0, TROMBA0, { orelhas: 0 }), 900, eio);
    }
    function* cocarPerna() {                // coça uma perna da frente com o pé da outra
      const fa = pes.filter(f => f.pe.fr).sort((a, b) => b.z - a.z);
      const pe = fa[0], outra = fa[1];
      yield* tw(Object.assign({}, ROSTO0, { lat: -6 }), 400);
      const x0 = pe.x, z0 = pe.z;
      const alvo = [outra.x + (pe.x - outra.x) * .25, outra.z + (pe.z - outra.z) * .45];   // o pé passa por diante da outra perna
      yield* durante(450, u => { const e = eseno(u); pe.x = lerp(x0, alvo[0], e); pe.z = lerp(z0, alvo[1], e); pe.y = (20 + 20 * e) * ESC + sino(u) * 8; pe.inc = -14 * e; });
      yield* tw({ olhos: .25, feliz: .7, sorriso: 1, tA: 66, tC: -140, tE: 1.8, orelhas: 8 }, 300);
      yield* durante(2200, (u, t) => { pe.y = (40 + 22 * (1 - Math.cos(t / 1000 * TAU * 1.8)) / 2) * ESC; pe.inc = -14 + 6 * Math.sin(t / 1000 * TAU * 1.8); P.balanco = .8 * Math.sin(t / 1000 * TAU * 1.8); P.cauAmp = 16; });
      impulso('flick', 28, 700, 'onda');
      yield* juntos(passo1(pe, restPe(pe.pe, P.X, P.Z, P.th), 420, 30), tw(Object.assign({}, ROSTO0, TROMBA0, { lat: 0, balanco: 0, cauAmp: CAUDA_0.cauAmp }), 500));
    }
    function* abanarCauda() {               // olha para trás por cima do ombro e abana a cauda
      olhar.cabeca = false;
      yield* tw(Object.assign({}, ROSTO0, { cTurn: -1.95, cB: 14, cRoll: -6, oE: 10, oD: 10 }), 750, eio);
      yield* durante(2200, (u, t) => { P.cauAmp = 9 + 26 * sino(u); P.cauVel = .5 + 1.1 * sino(u); P.cauA = 12 * Math.sin(t / 1000 * TAU * 1.4) * sino(u); });
      impulso('twE', 24, 400); impulso('twD', 24, 400);
      yield* tw({ olhos: .1, feliz: .4 }, 260, eseno); yield* tw({ olhos: 1, feliz: 0 }, 300, eseno);
      yield* tw(Object.assign({}, CORPO0, CAUDA_0, { oE: 0, oD: 0 }), 800, eio);
    }
    function* olharCrianca() {              // vira a cabeça para nós, inclina-a e acena com a ponta da tromba
      olhar.cabeca = false;
      yield* tw(Object.assign({}, ROSTO0, { cTurn: PI / 2 - P.th + .05, cB: 10, olhoEsc: 1.08, orelhas: 16, sobr: .6 }), 900, eio);
      yield* tw({ cRoll: 10, sobr: 1, tA: 62, tC: -150, tE: 1.8 }, 450);
      yield* tw({ olhos: .06, feliz: .5 }, 360, eseno); yield* espera(140); yield* tw({ olhos: 1, feliz: 0 }, 400, eseno);
      yield* durante(1100, u => { P.tW = 5 + 14 * sino(u); fase.tromba += .05; });
      yield* tw({ cRoll: -8, sorriso: 1 }, 500);
      impulso('twE', 22, 400);
      yield* espera(500);
      yield* tw(Object.assign({}, CORPO0, TROMBA0, { olhoEsc: 1, orelhas: 0, sobr: 0, sorriso: ROSTO0.sorriso }), 1000, eio);
    }
    const COMPORTAMENTOS = { abanarOrelhas, balancarTromba, comerErva, atirarPo, levantarTromba, cocarPerna, abanarCauda, olharCrianca };
    let ultimoComp = null;
    function* cicloFora() {
      for (;;) {
        yield* espera(aleat(4000, 9000));
        let nome; do nome = escolhe(Object.keys(COMPORTAMENTOS)); while (nome === ultimoComp);
        ultimoComp = nome;
        yield* COMPORTAMENTOS[nome]();
      }
    }

    /* --- reação ao toque (fora): orelhas abertas, olhos contentes, tromba a enrolar para cima, abanão e uma patada --- */
    function* reacaoFora() {
      reagindo = true;
      impulso('flick', 36, 700, 'onda');
      mostrarPunhado(false);
      const rosto = tw({ orelhas: 34, oE: 0, oD: 0, feliz: 1, olhos: 1, sobr: .8, sorriso: 1, boca: .25, olhoEsc: 1.06, tAlvo: 0, tA: 40, tC: -150, tE: 1.6, tW: 6, tR: 0 }, 110, esai);
      const corpo = (function* () {
        yield* juntos(recomporPes(220), tw(Object.assign({}, CORPO0, { cB: 0, alt: -5 }), 160, esai));
        const fr = pes.filter(f => f.pe.fr).sort((a, b) => b.z - a.z)[0];
        yield* juntos(
          durante(900, u => { P.cRoll = 8 * Math.sin(u * PI * 3) * (1 - u); P.lat = 3 * Math.sin(u * PI * 3) * (1 - u); P.alt = -5 * (1 - u) * (.6 + .4 * Math.cos(u * PI * 6)); P.cauVel = 1.6; }),
          passo1(fr, restPe(fr.pe, P.X, P.Z, P.th), 360, 30)
        );
        P.cauVel = CAUDA_0.cauVel;
        yield* tw({ cRoll: 6, alt: 0 }, 240); yield* tw({ cRoll: 0 }, 260);
      })();
      yield* juntos(rosto, corpo);
      yield* espera(150);
      reagindo = false;
      yield* tw(Object.assign({}, ROSTO0, CORPO0, TROMBA0), 600);
    }

    /* --- dentro do poço: banho (encher a tromba e esguichar), fonte, beber, patinhar --- */
    function* encher() {                    // mete a ponta na água e aspira (uma bossa sobe pela tromba)
      const linha = () => CHAO + KZ * P.Z;
      yield* tw(Object.assign({}, { cBaixa: 14, cB: 16, tAlvo: 0, olhos: .85 }, TR_AGUA), 650, eio);
      onda(ponta[0], linha(), 6, 50, 900, .8); salpicar(ponta[0], linha(), 3, .4, 8);
      P.tEnche = 1; P.tEncheA = .9;
      yield* durante(950, (u, t) => { P.tEnche = 1 - u * .95; if (t % 300 < 17) onda(ponta[0], linha(), 4, 26, 600, .5); });
      P.tEnche = -1;
    }
    function* esguichar() {                 // por cima das costas
      yield* encher();
      yield* tw(Object.assign({}, { cBaixa: -4, cB: -6, cTurn: -.5, olhos: .5, orelhas: 10 }, TR_ESGUICHO), 650, eio);
      yield* jato(1000, 600, 14);
      yield* tw(Object.assign({}, DENTRO0, TROMBA_D, ROSTO0), 800, eio);
    }
    function* fonte() {                     // para cima, a água chove à volta da cabeça
      yield* encher();
      yield* tw(Object.assign({}, { cBaixa: -6, cB: -10, olhoEsc: 1.06, orelhas: 18 }, TR_FONTE), 600, eio);
      yield* jato(800, 680, 18);
      yield* tw(Object.assign({}, DENTRO0, TROMBA_D, ROSTO0), 800, eio);
    }
    function* jato(ms, vel, abre) {         // a água sai da ponta da tromba, com olhos fechados de contente
      let acc = 0;
      yield* durante(ms, (u, t) => {
        acc += 16.7;
        while (acc > 26) {
          acc -= 26;
          const a = Math.atan2(pontaDir[1], pontaDir[0]) + aleat(-abre, abre) * RAD, v = vel * aleat(.75, 1.1);
          gota(ponta[0] + pontaDir[0] * 8, ponta[1] + pontaDir[1] * 8, Math.cos(a) * v, Math.sin(a) * v, aleat(3, 6.5), CHAO + KZ * P.Z + aleat(-30, 40));
        }
        P.molhado = Math.max(P.molhado, u);
        P.feliz = .8 * sino(u * 1.2); P.olhos = 1 - .8 * sino(u * 1.2);
        P.tW = 3 + 3 * Math.sin(t / 60);
      });
      P.feliz = 0; P.olhos = 1;
      impulso('twE', 26, 420); impulso('twD', 26, 420); impulso('flick', 26, 700, 'onda');
    }
    function* beber() {                     // enche a tromba e leva-a à boca
      yield* encher();
      alvoTromba = () => bocaMundo;
      yield* tw({ cBaixa: 0, cB: 4, tA: 72, tC: 205, tE: 1.05, tAlvo: .85, olhos: .8 }, 750, eio);
      P.tEnche = .05; P.tEncheA = .7;
      yield* juntos(tw({ tEnche: .9 }, 600), tw({ boca: .35 }, 300));
      P.tEnche = -1;
      yield* juntos(mastigar(800, .5), tw({ olhos: .4, feliz: .5 }, 400));
      yield* tw(Object.assign({}, DENTRO0, TROMBA_D, ROSTO0), 800, eio);
    }
    function* patinhar() {                  // levanta uma pata dentro de água e pisa com força
      const fr = pes.filter(f => f.pe.fr).sort((a, b) => b.z - a.z)[0];
      yield* tw({ olhoEsc: 1.06, orelhas: 12, tA: 60, tC: -120 }, 300);
      for (let i = 0; i < 2; i++) {
        const r = restPe(fr.pe, P.X, P.Z, P.th);
        yield* durante(300, u => { fr.y = sino(u * .5) * 44 * ESC * (u < .5 ? 1 : 1); fr.y = eseno(u) * 44 * ESC; P.alt = -2 * u; P.lat = -3 * u; });
        yield* durante(160, u => { fr.y = (1 - eentra(u)) * 44 * ESC; fr.x = r[0]; fr.z = r[1]; });
        fr.y = 0;
        const wl = CHAO + KZ * P.Z;
        salpicar(fr.x, wl, 14, 1.1, 30); onda(fr.x, wl, 20, 110, 1300, .9); onda(fr.x, wl, 10, 70, 1000, .7, 200);
        P.molhado = Math.max(P.molhado, .5);
        impulso('twE', 30, 400); impulso('twD', 30, 400);
        yield* tw({ feliz: .8, olhos: .3, alt: 0, lat: 0 }, 250); yield* tw({ feliz: 0, olhos: 1 }, 300);
      }
      yield* tw(Object.assign({}, DENTRO0, TROMBA_D, ROSTO0), 600);
    }
    function* orelhasDentro() {             // abana as orelhas e salpica água
      yield* durante(2000, (u, t) => {
        const k = sino(u) ** .5, f = Math.sin(t / 1000 * TAU * 1.7);
        P.orelhas = (24 + 26 * f) * k; P.cRoll = 2 * f * k;
        if (P.molhado > .3 && f > .95) salpicar(cabMundo[0] + (Math.random() < .5 ? -1 : 1) * 110 * ESC, cabMundo[1] + 20, 2, .5, 10);
      });
      yield* tw({ orelhas: 0, cRoll: 0 }, 400);
    }
    function* cicloDentro() {
      for (;;) {
        yield* espera(aleat(500, 1400));
        const r = Math.random();
        if (r < .38) yield* esguichar();
        else if (r < .56) yield* fonte();
        else if (r < .72) yield* beber();
        else if (r < .88) yield* patinhar();
        else yield* orelhasDentro();
      }
    }
    function* reacaoDentro() {              // contente: orelhas abertas e um esguicho rápido para o ar
      mostrarPunhado(false);
      impulso('flick', 32, 700, 'onda');
      yield* tw({ orelhas: 30, feliz: .8, olhos: 1, sobr: .8, sorriso: 1, tAlvo: 0, tA: -50, tC: -40, tE: 1.4, tR: -22, tRc: 50, cB: -6, cBaixa: -2, olhoEsc: 1.06 }, 120, esai);
      yield* jato(420, 560, 22);
      yield* durante(600, u => { P.cRoll = 7 * Math.sin(u * PI * 2) * (1 - u * .5); });
      yield* tw(Object.assign({}, DENTRO0, TROMBA_D, ROSTO0), 700, eio);
    }

    /* --- ida ao poço: vira-se (a cabeça primeiro), anda a passo pesado, entra na água e vira-se para nós --- */
    function* idaPoco() {
      modo = 'indo'; reagindo = false;
      mostrarPunhado(false);
      olhar.foco = () => [POCO.cx, POCO.cy - 60]; olhar.rapido = true;
      yield* juntos(recomporPes(160), tw(Object.assign({}, ROSTO0, TROMBA0, CORPO0, { cTurn: -1.2, oE: 8, oD: 8 }), 220, esai));
      yield* juntos(virar(TH_IDA, 950), tw({ cTurn: 0, orelhas: 6 }, 950));
      olhar.foco = null; olhar.rapido = false;
      yield* juntos(andar(HAB.X, HAB.Z, 1700), tw({ cB: 14, tA: 84, tC: -70 }, 1700));
      impulso('twE', 28, 450); impulso('twD', 28, 450);
      yield* juntos(virar(HAB.th, 650), tw(Object.assign({}, DENTRO0, TROMBA_D, ROSTO0, { feliz: .6, olhos: .6 }), 650));
      yield* tw({ feliz: 0, olhos: 1 }, 200);
      modo = 'dentro';
    }
    /* --- volta: sacode-se (cai água), vira-se para nós e regressa ao sítio --- */
    function* voltaPoco() {
      modo = 'voltando'; reagindo = false;
      mostrarPunhado(false);
      yield* tw(Object.assign({}, TROMBA_D, ROSTO0, { cBaixa: 0, cB: 6 }), 120);
      yield* durante(420, u => {
        P.lat = 6 * Math.sin(u * PI * 6) * sino(u); P.cRoll = 9 * Math.sin(u * PI * 6 + .6) * sino(u); P.orelhas = 30 * sino(u); P.tR = 20 * Math.sin(u * PI * 6 + 1.2) * sino(u);
        if (P.molhado > .2 && Math.random() < .5) salpicar(P.X + aleat(-120, 120), CHAO + KZ * P.Z - aleat(120, 260), 1, .7, 10);
      });
      P.lat = 0; P.tR = 0;
      yield* juntos(virar(TH_VOLTA, 620), tw(Object.assign({}, CORPO0, ROSTO0, TROMBA0, { cTurn: -.3 }), 620));
      yield* andar(REP.X, REP.Z, 1300);
      yield* juntos(virar(REP.th, 380), tw(Object.assign({}, CORPO0, ROSTO0, TROMBA0), 380));
      yield* recomporPes(160);
      modo = 'fora';
    }

    /* --- som: a «trombeta» levanta a tromba; a boca abre uma vez por sílaba; orelhas abertas --- */
    function* somTrombeta(ms, silabas) {
      let lista = Array.isArray(silabas) && silabas.length ? silabas : null;
      if (!lista) { const k = Math.max(1, Math.round(ms / 700)), d = ms / 1000 / k; lista = Array.from({ length: k }, (_, i) => [i * d, d * .8]); }
      const fim = Math.max(ms / 1000, ...lista.map(([a, d]) => a + d));
      let t = 0;
      yield* juntos(tw({ somT: 1 }, 180, esai), (function* () {
        for (const [a, d] of lista) {
          if (a > t) yield* espera((a - t) * 1000);
          yield* durante(limita(d * 1000, 160, 2200), u => { P.somB = .55 * Math.pow(sino(u), .6); P.somR = -5 * Math.sin(u * PI); });
          t = a + d;
        }
        if (fim > t) yield* espera((fim - t) * 1000);
      })());
      P.somB = 0; P.somR = 0;
      yield* tw({ somT: 0 }, 450, eio);
    }

    /* --- cenário vivo e acontecimentos raros --- */
    let tufoCorte = 0;
    const garca = { x: 1196, y: 734, dir: -1, evento: false, alvo: 1150, pausa: 0, picar: 0, tp: 0 };
    function poeGarca(x, y, dir, voa, tt, bico) {
      poe(R.garca, `translate(${n(x)},${n(y)})`);
      poe(R.garcaIn, `scale(${dir},1)`);
      poe(R.garcaCab, `rotate(${n(bico * 55)},8,-26)`);
      poe(R.garcaAsa, voa ? `rotate(${n(-46 * Math.sin(tt * .045))},-2,-24) scale(1,${n3(.5 + .5 * Math.abs(Math.cos(tt * .045)))})` : 'rotate(0)');
      atr(R.garcaSombra, 'opacity', voa ? '0' : '.25');
    }
    function animarGarca(dt) {
      if (garca.evento) return;
      garca.tp += dt;
      if (garca.pausa > 0) {
        garca.pausa -= dt;
        garca.picar = Math.max(0, garca.picar - dt);
        const b = garca.picar > 0 ? sino(1 - garca.picar / 420) : 0;
        poeGarca(garca.x, garca.y, garca.dir, false, 0, b);
        if (garca.pausa <= 0 || (garca.picar <= 0 && Math.random() < dt / 1600)) { if (garca.pausa > 0) garca.picar = 420; }
        if (garca.pausa <= 0) garca.alvo = aleat(1140, 1250);
        return;
      }
      const dx = garca.alvo - garca.x;
      if (Math.abs(dx) < 2) { garca.pausa = aleat(1500, 4000); garca.picar = 420; return; }
      garca.dir = dx > 0 ? 1 : -1;
      garca.x += garca.dir * Math.min(Math.abs(dx), dt * .028);
      const pa = Math.sin(garca.tp * .012);
      poe(R.gpE, `rotate(${n(pa * 16)},-2,-14)`); poe(R.gpD, `rotate(${n(-pa * 16)},3,-14)`);
      poeGarca(garca.x, garca.y - Math.abs(pa) * 1.5, garca.dir, false, 0, .08 * Math.abs(pa));
    }
    function animarCena(dt) {
      const t = tempo / 1000;
      R.nuvens.forEach((g, i) => {
        const v = [6, 4, 5.2, 3.2][i], y = [112, 210, 268, 152][i], x0 = [420, 980, 1320, 700][i];
        const x = -260 + ((x0 + 260 + t * v * calma) % 2120);
        poe(g, `translate(${n(x)},${y})`);
      });
      poe(R.raios, `rotate(${n3(4 * Math.sin(t * .05) * calma)},${SOL.x},${SOL.y})`);
      atr(R.raios, 'opacity', n3(.06 + .025 * Math.sin(t * .4)));
      poe(R.faixa, `translate(${n(26 * Math.sin(t * .06) * calma)},${n(2 * Math.sin(t * .11))})`);
      // bando de aves em «V» a atravessar o céu devagar
      const ciclo = (t * calma + 12) % 46, xb = 1750 - ciclo * 48;
      R.aves.forEach((g, i) => {
        const fila = Math.ceil(i / 2) * (i % 2 ? 1 : -1);
        const x = xb + Math.abs(fila) * 26, y = 236 + fila * 14 + Math.sin(t * 1.1 + i) * 3;
        poe(g, `translate(${n(x)},${n(y)}) scale(${n3(.9 + .25 * Math.sin(t * 3 + i))},${n3(.6 + .6 * Math.abs(Math.sin(t * 4.2 + i * .7)))})`);
      });
      // girafas muito ao longe, muito devagar
      R.gl.forEach((g, i) => {
        const x = 1500 - ((t * 3 * calma + i * 60) % 1800), y = 622 + i * 5;
        poe(g, `translate(${n(x + i * 34)},${y}) scale(${-.8 - i * .1},${.8 + i * .1})`);
      });
      const pz = n(Math.sin(t * 3) * 2);
      R.glPernas.forEach(z => poe(z, `skewX(${pz})`));
      // erva a ondular com rajadas de vento
      const rajada = .6 + .4 * Math.sin(t * .33);
      R.capins.forEach((g, i) => poe(g, `rotate(${n3((2.2 * Math.sin(t * 1.0 + i * .9) + 1.2 * Math.sin(t * 2.1 + i * 2)) * rajada * calma)})`));
      R.ervas.forEach((g, i) => poe(g, `rotate(${n3((2.4 * Math.sin(t * 1.1 + i * .9) + 1.3 * Math.sin(t * 2.3 + i * 2)) * rajada * calma)})`));
      R.papiros.forEach((g, i) => poe(g, `rotate(${n3((2.6 * Math.sin(t * .9 + i * 1.3) + 1 * Math.sin(t * 2 + i)) * rajada * calma)})`));
      R.frutos.forEach((g, i) => poe(g.firstChild ? g : g, `translate(${[132, 270, 330][i]},${[320, 330, 334][i]}) rotate(${n3(4 * Math.sin(t * 1.2 + i * 2) * rajada * calma)})`));
      // reflexos a tremeluzir na água
      const bx = n(4 * Math.sin(t * .8)), bo = n3(.4 + .2 * Math.sin(t * 1.7));
      R.brilhos.forEach(g => { poe(g, `translate(${bx},0)`); atr(g, 'opacity', bo); });
      // ciscos de poeira a brilhar na luz do sol
      R.ciscos.forEach((c, i) => {
        const a = t * (.05 + (i % 5) * .012) * calma + i * 1.7;
        const x = 260 + ((i * 97 + t * (6 + i % 3) * calma) % 760), y = 260 + (i * 53 % 420) + 22 * Math.sin(a * 3);
        poe(c, `translate(${n(x)},${n(y)})`);
        atr(c, 'opacity', n3(.25 + .55 * Math.max(0, Math.sin(t * .7 + i * 2.1))));
      });
      // tufo de erva: abana quando é puxado e volta a crescer devagar
      tufoCorte = Math.max(0, tufoCorte - dt / 60000);
      poe(R.tufo, `rotate(${n3(IMP.tufo * 10 + Math.sin(t * 1.3) * 1.5 * rajada)}) scale(1,${n3(1 - tufoCorte + IMP.tufo * .06)})`);
      animarGarca(dt);
    }
    // ponto das costas (u no tronco) no ecrã
    const costas = u => { const y = u < -40 ? lerp(-86, -100, (u + 120) / 80) : lerp(-100, -108, (u + 40) / 100); const [a, b, c, d, e, f] = rig.tm; return [a * u + c * y + e, b * u + d * y + f]; };
    const eventos = { prox: aleat(9000, 15000), ultimo: null };
    function iniciarEvento(tipo) {
      const ev = { tipo, x: -100, y: -100, vivo: true };
      ev.pos = () => [ev.x, ev.y];
      const gen = { garca: evGarca, borboleta: evBorboleta }[tipo](ev);
      lancar('evento', gen, () => { ev.vivo = false; });
      if (modo === 'fora' && !reagindo) lancar('corpo', observar(ev), () => lancar('corpo', cicloFora()));
      else if (modo === 'dentro') { impulso('twE', 24, 400); impulso('twD', 20, 400); }
    }
    function atualizarEventos(dt) {
      if (faixas.has('evento')) return;
      eventos.prox -= dt;
      if (eventos.prox > 0) return;
      eventos.prox = aleat(15000, 40000);
      if (modo !== 'fora' && modo !== 'dentro') { eventos.prox = 3000; return; }
      const lista = modo === 'fora' ? ['garca', 'borboleta'] : ['borboleta'];   // dentro do poço o elefante está de frente: as costas não se veem
      let tipo; do tipo = escolhe(lista); while (tipo === eventos.ultimo && lista.length > 1 && Math.random() < .7);
      eventos.ultimo = tipo;
      iniciarEvento(tipo);
    }
    function* observar(ev) {
      reagindo = false;
      yield* recompor(380);
      olhar.foco = ev.pos;
      yield* tw({ oE: 12, oD: 12, olhoEsc: 1.05 }, 260, esai);
      if (ev.tipo === 'borboleta') yield* tw({ tA: 52, tC: -168, tE: 1.7, tW: 1.5 }, 700);   // ergue a ponta da tromba à frente dos olhos
      let t = 0, prox = 900;
      while (ev.vivo && t < 15000) {
        t += yield;
        if (ev.tipo === 'borboleta' && ev.pousada) { olhar.foco = () => ponta; P.olharX = limita(P.olharX, -1, 1); }
        if (t > prox) {
          prox = t + aleat(1000, 1900);
          if (Math.random() < .5) impulso('flick', 26, 700, 'onda');
          impulso(Math.random() < .5 ? 'twE' : 'twD', 22, 380);
        }
      }
      olhar.foco = null;
      yield* tw(Object.assign({}, TROMBA0, { oE: 0, oD: 0, olhoEsc: 1, olhos: 1 }), 600);
    }
    function* evGarca(ev) {                 // a garça-boieira vem pousar nas costas do elefante, debica e volta
      garca.evento = true;
      R.slotTopo.appendChild(R.garca);
      const de = [garca.x, garca.y];
      ev.x = de[0]; ev.y = de[1];
      const sitio = () => costas(-60);
      let dir = sitio()[0] < de[0] ? -1 : 1;
      yield* durante(300, (u, tt) => { ev.y = de[1] - 6 * sino(u); poeGarca(ev.x, ev.y, dir, u > .5, tt, 0); });
      yield* durante(2300, (u, tt) => { const a = sitio(), e = eseno(u); ev.x = lerp(de[0], a[0], e); ev.y = lerp(de[1], a[1], e) - 140 * sino(u); poeGarca(ev.x, ev.y, dir, u < .94, tt, 0); });
      for (let k = 0; k < 4 && modo === 'fora'; k++) {           // se o elefante se puser a andar, a garça vai-se logo embora
        const uu = -60 + k * 12;
        yield* durante(aleat(500, 800), u => { const a = costas(uu); ev.x = a[0]; ev.y = a[1]; poeGarca(ev.x, ev.y, dir, false, 0, sino(u * 2 % 1) * (k % 2 ? 1 : .6)); });
        if (k === 1) { dir = -dir; impulso('flick', 30, 700, 'onda'); }
      }
      yield* espera(400);
      const d2 = [ev.x, ev.y], volta = [aleat(1150, 1240), 734];
      dir = volta[0] > d2[0] ? 1 : -1;
      yield* durante(2200, (u, tt) => { const e = eseno(u); ev.x = lerp(d2[0], volta[0], e); ev.y = lerp(d2[1], volta[1], e) - 120 * sino(u); poeGarca(ev.x, ev.y, dir, u < .94, tt, 0); });
      garca.x = volta[0]; garca.y = volta[1]; garca.dir = dir; garca.pausa = 1500;
      R.slotGarca.appendChild(R.garca);
      garca.evento = false;
    }
    function* evBorboleta(ev) {             // uma borboleta azul dá voltas e pousa na ponta da tromba; a tromba sacode-a
      const g = R.bb;
      atr(g, 'display', 'inline');
      const asas = (tt, rapido) => { const k = rapido ? Math.abs(Math.cos(tt * .03)) : .35 + .65 * Math.abs(Math.cos(tt * .004)); poe(R.bbE, `scale(${n3(.15 + .85 * k)},1)`); poe(R.bbD, `scale(${n3(.15 + .85 * k)},1)`); };
      const ini = [260, 300];
      yield* durante(4200, (u, tt) => {
        const c = cabMundo, pts = [ini, [420, 360], [c[0] - 140, c[1] - 110], [c[0] + 40, c[1] - 170], [c[0] + 130, c[1] - 30], [ponta[0] - 40, ponta[1] - 60]];
        const [x, y] = catmull(pts, u);
        ev.x = x + 8 * Math.sin(tt * .01); ev.y = y + 10 * Math.sin(tt * .013);
        poe(g, `translate(${n(ev.x)},${n(ev.y)}) rotate(${n(14 * Math.sin(tt * .006))})`); asas(tt, true);
      });
      const de = [ev.x, ev.y];
      yield* durante(700, (u, tt) => { const a = [ponta[0], ponta[1] - 8]; ev.x = lerp(de[0], a[0], eseno(u)); ev.y = lerp(de[1], a[1], eseno(u)) - 10 * sino(u); poe(g, `translate(${n(ev.x)},${n(ev.y)})`); asas(tt, true); });
      ev.pousada = true;
      yield* durante(2400, (u, tt) => { ev.x = ponta[0]; ev.y = ponta[1] - 8; poe(g, `translate(${n(ev.x)},${n(ev.y)})`); asas(tt, false); });
      ev.pousada = false;
      impulso('tromba', -40, 500, 'mola');
      const de2 = [ev.x, ev.y];
      yield* durante(2400, (u, tt) => { ev.x = lerp(de2[0], de2[0] - 520, eentra(u)) + 30 * Math.sin(u * 9); ev.y = lerp(de2[1], 80, u); poe(g, `translate(${n(ev.x)},${n(ev.y)})`); asas(tt, true); });
      atr(g, 'display', 'none');
    }

    /* --- relógio único --- */
    let erroMostrado = false, ondaLeve = 0;
    function passo(dt) {
      if (!vivo) return;
      try {
        dt = Math.min(dt, 50);
        tempo += dt;
        fase.resp += dt / 1000 * TAU * P.respF;
        fase.cauda += dt / 1000 * TAU * P.cauVel;
        fase.tromba += dt / 1000 * TAU * .45;
        fase.orelhas += dt / 1000 * TAU * .32;
        atualizarImpulsos(dt);
        atualizarPiscar(dt);
        atualizarTiques(dt);
        for (const nome of Array.from(faixas.keys())) avancar(nome, dt);
        atualizarOlhar(dt);
        atualizarEventos(dt);
        // o corpo afunda tanto quanto as patas (média), devagar
        const alvoAf = pes.reduce((s, f) => s + prof(f.x, f.z), 0) / pes.length / ESC;
        P.afunda += (alvoAf - P.afunda) * (1 - Math.exp(-dt / 160));
        // seca-se ao sol e o pó vai caindo; a água lava o pó
        if (modo === 'fora') P.molhado = Math.max(0, P.molhado - dt / 14000);
        P.po = Math.max(0, P.po - dt / 30000 - P.molhado * dt / 3000);
        if (P.afunda < 5) P.lama = Math.max(0, P.lama - dt / 20000);
        // ondinhas à volta das patas enquanto está na água
        ondaLeve -= dt;
        if (ondaLeve <= 0) {
          ondaLeve = aleat(500, 900);
          const e = pernaEl[Math.random() * 4 | 0];
          if (e.anelX != null) onda(e.anelX, CHAO + KZ * P.Z, 26, 64, 1500, .45);
        }
        animarCena(dt);
        atualizarOndas(dt);
        atualizarGotas(dt);
        atualizarPoeira(dt);
        desenhar();
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    lancar('corpo', cicloFora());
    desenhar();

    return {
      animal: R.elefante,
      habitat: R.habitat,
      reagir() {
        if (!vivo) return;
        if (modo === 'fora') lancar('corpo', reacaoFora(), () => { reagindo = false; lancar('corpo', cicloFora()); });
        else if (modo === 'dentro') lancar('corpo', reacaoDentro(), () => lancar('corpo', cicloDentro()));
        else { impulso('twE', 20, 300); impulso('twD', 20, 300); }
      },
      fazerSom(ms, silabas) {
        if (!vivo) return;
        lancar('boca', somTrombeta(limita(ms || 900, 200, 4000), silabas));
        impulso('twE', 16, 300); impulso('twD', 16, 300);
      },
      irAoHabitat() {
        return new Promise(res => {
          if (!vivo || modo !== 'fora') { res(); return; }
          lancar('corpo', idaPoco(), () => { res(); lancar('corpo', cicloDentro()); });
        });
      },
      voltar() {
        return new Promise(res => {
          if (!vivo || modo !== 'dentro') { res(); return; }
          lancar('corpo', voltaPoco(), () => { res(); lancar('corpo', cicloFora()); });
        });
      },
      destruir() {
        vivo = false;
        faixas.clear();
        impulsos.length = 0;
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola (modo de desenvolvimento)
      _teste: { P, pes, modo: () => modo, evento: iniciarEvento, comportamento: nome => lancar('corpo', COMPORTAMENTOS[nome](), () => lancar('corpo', cicloFora())),
        dentro: nome => lancar('corpo', ({ esguichar, fonte, beber, patinhar, orelhasDentro })[nome](), () => lancar('corpo', cicloDentro())),
        parar: () => lancar('corpo', (function* () { for (;;) yield; })()), desenhar, cab: () => cabMundo, ponta: () => ponta, boca: () => bocaMundo }
    };
  }

  return { icone: iconeSVG(), montar };
})();
