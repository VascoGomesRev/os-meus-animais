/* Coelho — prado de primavera à beira da horta, com luz da manhã, e a toca num montinho de relva.
   Contrato e regras: REGRAS-ANIMAIS.md. Tudo é desenhado aqui em SVG e animado só a partir de ajudas.relogio.
   Organização:
     1) utilidades (matemática, easing, curvas suaves)
     2) desenho do coelho (cabeça de frente que se vira com «yaw», orelhas geradas a cada quadro como uma fita
        com espessura, corpo de perfil, patas em dois passes: contorno + enchimento, cauda de algodão)
     3) desenho do cenário (céu, moinho, colinas, árvore, cerca, horta com cenouras e couves, flores, ervas) e da toca
     4) ícone do menu (sem gradientes com id)
     5) montar(): rig, poses (dados), tarefas (geradores) no relógio único, salto de coelho por distância,
        comportamentos, acontecimentos raros, ida à toca e volta */
'use strict';
MODULOS.coelho = (() => {
  const NS = 'http://www.w3.org/2000/svg';

  /* ================= 1) Utilidades ================= */
  const PI = Math.PI, RAD = PI / 180;
  const lerp = (a, b, t) => a + (b - a) * t;
  const limita = (v, a, b) => v < a ? a : v > b ? b : v;
  const n = v => Math.round(v * 10) / 10;
  const n3 = v => Math.round(v * 1000) / 1000;
  const suave = t => t * t * (3 - 2 * t);
  const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const esai = t => 1 - Math.pow(1 - t, 3);
  const eentra = t => t * t * t;
  const eseno = t => -(Math.cos(PI * t) - 1) / 2;
  const sino = t => Math.sin(PI * limita(t, 0, 1));          // 0 → 1 → 0
  const janela = (u, a, b) => limita((u - a) / (b - a), 0, 1);  // 0 antes de a, 1 depois de b
  const aleat = (a, b) => a + Math.random() * (b - a);
  const escolhe = v => v[Math.random() * v.length | 0];
  function semente(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  // caminho suave (Catmull-Rom → Bézier) por uma lista de pontos; fechado ou aberto
  function curva(pts, fechado) {
    const N = pts.length, P = i => fechado ? pts[(i + N) % N] : pts[limita(i, 0, N - 1)];
    let d = `M${n(pts[0][0])},${n(pts[0][1])}`;
    const fim = fechado ? N : N - 1;
    for (let i = 0; i < fim; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      d += ` C${n(p1[0] + (p2[0] - p0[0]) / 6)},${n(p1[1] + (p2[1] - p0[1]) / 6)} ${n(p2[0] - (p3[0] - p1[0]) / 6)},${n(p2[1] - (p3[1] - p1[1]) / 6)} ${n(p2[0])},${n(p2[1])}`;
    }
    return fechado ? d + 'Z' : d;
  }
  function catmull(pts, u) {
    const ns = pts.length - 1, s = Math.min(ns - 1e-6, Math.max(0, u) * ns), i = Math.floor(s), t = s - i;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(ns, i + 2)];
    const f = (a, b, c, d) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
    return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
  }

  /* ================= 2) Desenho do coelho ================= */
  // pelo castanho-acinzentado («coelho bravo» de boneco), barriga, focinho e cauda cor de nata
  const COR = { cont: '#5A3A25', pelo: '#C4A386', peloC: '#E6D2BB', peloE: '#8F6D52', nata: '#FFF8EC', nataS: '#E3D3BF', rosa: '#F4AEBF', rosaE: '#DE8199' };
  const ESC = 0.92;                                  // escala do coelho no cenário
  const SPL = 100;                                   // comprimento de referência do tronco (anca → ombro)
  const BR = 52, AB = 54;                            // pata da frente: braço e antebraço
  const CXA = 58, CN = 60, PE = 80;                  // pata de trás: coxa, canela e pé (comprido!)
  const ORELHA_L = 150;                              // comprimento das orelhas

  function defsCoelho(p) {
    return `
    <radialGradient id="${p}pelo" cx=".3" cy=".18" r=".95"><stop offset="0" stop-color="#EBD8C2"/><stop offset=".5" stop-color="#C9A98B"/><stop offset="1" stop-color="#9A7759"/></radialGradient>
    <linearGradient id="${p}pelo-l" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="#DCC4A9"/><stop offset=".6" stop-color="#C09F82"/><stop offset="1" stop-color="#9C7A5D"/></linearGradient>
    <linearGradient id="${p}pelo-esc" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="#AE8E72"/><stop offset="1" stop-color="#7E5F47"/></linearGradient>
    <radialGradient id="${p}coxa" cx=".32" cy=".25" r=".85"><stop offset="0" stop-color="#E8D3BC"/><stop offset=".55" stop-color="#C5A486"/><stop offset="1" stop-color="#94724F"/></radialGradient>
    <radialGradient id="${p}pelo-cab" gradientUnits="userSpaceOnUse" cx="-24" cy="-38" r="120"><stop offset="0" stop-color="#F0E0CC"/><stop offset=".55" stop-color="#CDAE90"/><stop offset="1" stop-color="#A07D60"/></radialGradient>
    <linearGradient id="${p}orelha" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D9BFA4"/><stop offset=".5" stop-color="#C4A386"/><stop offset="1" stop-color="#9E7C60"/></linearGradient>
    <linearGradient id="${p}rosa" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#F9C9D3"/><stop offset=".6" stop-color="#F2A6B8"/><stop offset="1" stop-color="#E3889F"/></linearGradient>
    <radialGradient id="${p}nata" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".65" stop-color="#FFF6E9"/><stop offset="1" stop-color="#E8D8C3"/></radialGradient>
    <radialGradient id="${p}iris" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="#8A5A36"/><stop offset=".55" stop-color="#5A3520"/><stop offset="1" stop-color="#2A160C"/></radialGradient>
    <radialGradient id="${p}nariz" cx=".4" cy=".3" r=".75"><stop offset="0" stop-color="#FFC4D0"/><stop offset="1" stop-color="#E07D95"/></radialGradient>
    <radialGradient id="${p}boca" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#9A3442"/><stop offset="1" stop-color="#561420"/></radialGradient>
    <radialGradient id="${p}sombra"><stop offset="0" stop-color="#2E3A14" stop-opacity=".42"/><stop offset=".6" stop-color="#2E3A14" stop-opacity=".2"/><stop offset="1" stop-color="#2E3A14" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}cauda" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#FBF3E7"/><stop offset="1" stop-color="#DCCBB6"/></radialGradient>
    <clipPath id="${p}clip-tronco"><path d="${TRONCO}"/></clipPath>
    <clipPath id="${p}clip-coxa"><path d="${SEG.coxa}"/></clipPath>
    <clipPath id="${p}clip-olhoE"><ellipse rx="17" ry="20.5"/></clipPath>
    <clipPath id="${p}clip-olhoD"><ellipse rx="17" ry="20.5"/></clipPath>
    <clipPath id="${p}clip-orE"><path class="cl-clipOrE" d=""/></clipPath>
    <clipPath id="${p}clip-orD"><path class="cl-clipOrD" d=""/></clipPath>`;
  }

  /* --- Orelhas: uma «fita» com espessura ao longo de uma linha central que se pode dobrar.
         a = ângulo da base (graus, 0 = para cima, + = sentido dos ponteiros), c = dobra total (graus),
         g = rotação da orelha (1 = concha virada para nós, 0 = de lado, −1 = de costas), k = comprimento relativo --- */
  function orelhaGeo(a, c, g, k) {
    const NSEG = 9, L = ORELHA_L * k / NSEG;
    const larg = .42 + .58 * Math.abs(g);
    const cen = [[0, 0]], ang = [a * RAD];
    let x = 0, y = 0, h = a * RAD;
    for (let i = 1; i <= NSEG; i++) {
      const u = i / NSEG;
      h += c * RAD / NSEG * (.4 + 1.2 * u);            // dobra mais perto da ponta
      x += Math.sin(h) * L; y -= Math.cos(h) * L;
      cen.push([x, y]); ang.push(h);
    }
    const meia = u => 19 * (.66 + .5 * Math.sin(PI * Math.min(1, u * 1.05))) * (u > .78 ? Math.sqrt(Math.max(0, (1 - u) / .22)) * .9 + .1 : 1);
    const lados = (esc, u0, u1, desvio) => {
      const E = [], D = [];
      for (let i = 0; i <= NSEG; i++) {
        const u = i / NSEG; if (u < u0 - 1e-6 || u > u1 + 1e-6) continue;
        const [cx, cy] = cen[i], an = ang[i], nx = Math.cos(an), ny = Math.sin(an);
        const w = meia(u) * esc * larg, dv = desvio * meia(u) * larg;
        E.push([cx - nx * w + nx * dv, cy - ny * w + ny * dv]); D.push([cx + nx * w + nx * dv, cy + ny * w + ny * dv]);
      }
      return { E, D };
    };
    const fora = lados(1, 0, 1, 0);
    const fora_pts = [...fora.E.slice(0, -1), cen[NSEG], ...fora.D.slice(0, -1).reverse()];
    const desvio = g >= 0 ? .1 * (1 - g) : 0;
    const den = lados(.58, .1, .86, desvio);
    const ip = cen[Math.round(NSEG * .92)];
    const den_pts = [...den.E, ip, ...den.D.reverse()];
    const brilho = cen.slice(1, 7).map((p, i) => { const an = ang[i + 1]; const w = meia((i + 1) / NSEG) * larg * .78; return [p[0] - Math.cos(an) * w, p[1] - Math.sin(an) * w]; });
    return { fora: curva(fora_pts, true), dentro: curva(den_pts, true), brilho: curva(brilho, false), ponta: cen[NSEG], ang: ang[NSEG] };
  }

  // pálpebras: c = fecho (0 aberto … 1 fechado), h = olhos contentes (pálpebra de baixo sobe em arco)
  function palpebras(c, h, lado) {
    const cu = Math.max(c, h * .8);
    const y = lerp(-27, 10, cu), cq = lerp(-6, 18, Math.sqrt(cu));
    const inc = 3.5 * Math.sin(PI * Math.min(1, cu * 1.1)) * (1 - h) * (lado === 'D' ? -1 : 1);   // inclina ao contrário do olho (sonolento, não zangado)
    const a = y + inc, b = y - inc;
    const yi = lerp(26, lerp(8, -3, h), Math.max(c * c, h * .95)), ci = lerp(6, -18, h);
    const mid = (a + b) / 4 + cq / 2;
    return {
      sup: `M-22,-28 L22,-28 L22,${n(b)} Q0,${n(y + cq)} -22,${n(a)} Z`,
      cil: `M-17,${n(lerp(a, mid, .38))} Q0,${n((a + b) / 2 * .5 + (y + cq) * .5)} 17,${n(lerp(b, mid, .38))}`,
      inf: `M-22,28 L22,28 L22,${n(yi)} Q0,${n(yi + ci)} -22,${n(yi)} Z`,
      abre: 1 - cu
    };
  }
  // boca: b = abertura (0 … 1); m = mastigar (−1 … 1, desloca o queixo de lado)
  function bocaD(b) {
    const fundo = 40 + 16 * b, w = 8 + 3 * b;
    return `M${-w},36 C-4,34 4,34 ${w},36 C${w},${n(36 + 12 * b)} 4,${n(fundo)} 0,${n(fundo)} C-4,${n(fundo)} ${-w},${n(36 + 12 * b)} ${-w},36 Z`;
  }

  // Cabeça (vista de frente; vira-se deslocando as feições). F = cores (url(#…) ou cores lisas, para o ícone)
  const CAB = 'M0,-60 C34,-60 58,-40 61,-8 C63,12 58,30 48,42 C54,46 58,50 57,55 C49,56 43,55 37,53 C26,60 12,63 0,63 C-12,63 -26,60 -37,53 C-43,55 -49,56 -57,55 C-58,50 -54,46 -48,42 C-58,30 -63,12 -61,-8 C-58,-40 -34,-60 0,-60 Z';
  function cabecaSVG(p, F, icone) {
    const olho = lado => {
      const s = lado === 'E' ? -1 : 1;
      const L = palpebras(0, 0, lado);
      const clip = icone ? '' : ` clip-path="url(#${p}clip-olho${lado})"`;
      return `<g class="cl-olho${lado}" transform="translate(${27 * s},-6)">
        <ellipse rx="19.5" ry="23" fill="${COR.cont}"/>
        <ellipse rx="17" ry="20.5" fill="#FFFDF8"/>
        <g${clip}>
          <g class="cl-iris${lado}">
            <ellipse rx="14.5" ry="17.5" fill="${F.iris}"/>
            <ellipse class="cl-pupila${lado}" rx="9" ry="11" fill="#140A05"/>
            <ellipse rx="14.5" ry="17.5" fill="none" stroke="#2A160C" stroke-width="1.6" opacity=".7"/>
            <circle cx="-5" cy="-7" r="5.8" fill="#FFF"/>
            <circle cx="5.5" cy="7" r="2.6" fill="#FFF" opacity=".85"/>
            <circle cx="-8" cy="3" r="1.4" fill="#FFF" opacity=".6"/>
          </g>
          <path d="M-22,-24 H22 V-8 Q0,-24 -22,-8 Z" fill="#4A2A14" opacity=".14"/>
          ${icone ? '' : `<path class="cl-palpS${lado}" d="${L.sup}" fill="${F.palp}"/>
          <path class="cl-palpI${lado}" d="${L.inf}" fill="${F.palp}"/>
          <path class="cl-cil${lado}" d="${L.cil}" fill="none" stroke="${COR.cont}" stroke-width="3.4" stroke-linecap="round"/>`}
        </g>
        <path d="M${-10 * s},-26 C${-2 * s},-30 ${8 * s},-30 ${16 * s},-26" class="cl-pest${lado}" stroke="${COR.cont}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      </g>`;
    };
    const bigodes = `<path d="M0,-4 C-24,-12 -46,-14 -66,-10 M0,2 C-26,-1 -50,1 -70,8 M0,8 C-22,12 -42,20 -60,30" fill="none" stroke-linecap="round" stroke="#6E4A30" stroke-width="3.2" opacity=".25"/>
      <path d="M0,-4 C-24,-12 -46,-14 -66,-10 M0,2 C-26,-1 -50,1 -70,8 M0,8 C-22,12 -42,20 -60,30" fill="none" stroke-linecap="round" stroke="#FFFCF4" stroke-width="1.7"/>`;
    // tufos de pelo nas bochechas e na testa
    const tufos = 'M-60,30 L-70,36 L-58,38 L-66,46 L-52,44 M60,30 L70,36 L58,38 L66,46 L52,44';
    return `<g class="cl-cab-in">
      <g class="cl-testa">
        <path d="${CAB}" fill="${F.cab}" stroke="${COR.cont}" stroke-width="3.6" stroke-linejoin="round"/>
        <path d="${tufos}" fill="${F.cabS}" stroke="${COR.cont}" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M-40,-46 C-22,-58 10,-60 30,-52" stroke="#FBF0E2" stroke-width="7" fill="none" opacity=".45" stroke-linecap="round"/>
        <path d="M-8,-58 C-6,-48 -4,-40 0,-34 C4,-40 6,-48 8,-58" fill="${F.cabS}" opacity=".55"/>
        <path d="M-56,26 C-40,58 40,58 56,26 C52,44 30,60 0,61 C-30,60 -52,44 -56,26 Z" fill="#7A5A40" opacity=".18"/>
      </g>
      <g class="cl-cara">
        <path d="M-18,-26 C-14,-14 -14,4 -6,14 L6,14 C14,4 14,-14 18,-26 C10,-20 -10,-20 -18,-26 Z" fill="${F.nata}" opacity=".55"/>
        ${olho('E')}${olho('D')}
        <g class="cl-sobr"><path d="M-38,-36 C-32,-41 -24,-42 -16,-39 M38,-36 C32,-41 24,-42 16,-39" stroke="#8C6A4E" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".8"/></g>
        <ellipse cx="-42" cy="24" rx="10" ry="6" fill="#F59AAE" opacity=".38"/><ellipse cx="42" cy="24" rx="10" ry="6" fill="#F59AAE" opacity=".38"/>
      </g>
      <g class="cl-focinho">
        <g class="cl-queixo">
          <ellipse cx="0" cy="49" rx="13" ry="9" fill="${F.nata}" stroke="${COR.nataS}" stroke-width="1.4"/>
          <path class="cl-bocaInt" d="${bocaD(0)}" fill="${F.boca}" stroke="${COR.cont}" stroke-width="1.8" display="none"/>
          <g class="cl-dentes"><path d="M-7.5,33 L7.5,33 L7,45 C7,47.5 5.5,48.5 3.5,48.5 L-3.5,48.5 C-5.5,48.5 -7,47.5 -7,45 Z" fill="#FFFFFF" stroke="#9E8670" stroke-width="1.5"/><path d="M0,34 L0,48" stroke="#B9A48E" stroke-width="1.3"/><path d="M-5,36 L-5,42" stroke="#FFFFFF" stroke-width="1.6" opacity=".9"/></g>
          <path class="cl-erva" d="M0,0" stroke="#5E9A3A" stroke-width="3.2" fill="none" stroke-linecap="round" display="none"/>
        </g>
        <g class="cl-bochechas">
          <ellipse class="cl-bochE" cx="-14" cy="27" rx="17" ry="13" fill="${F.nata}"/>
          <ellipse class="cl-bochD" cx="14" cy="27" rx="17" ry="13" fill="${F.nata}"/>
          <path d="M-29,30 C-23,40 -8,41 0,34 C8,41 23,40 29,30" stroke="${COR.nataS}" stroke-width="1.5" fill="none"/>
          <g fill="#C9A88A"><circle cx="-20" cy="23" r="1.4"/><circle cx="-25" cy="28" r="1.4"/><circle cx="-18" cy="31" r="1.4"/><circle cx="20" cy="23" r="1.4"/><circle cx="25" cy="28" r="1.4"/><circle cx="18" cy="31" r="1.4"/></g>
        </g>
        <g class="cl-nariz">
          <path d="M-9,14 C-10,9 -5,7 0,7 C5,7 10,9 9,14 C7,19 3,22 0,23 C-3,22 -7,19 -9,14 Z" fill="${F.nariz}" stroke="#B9566E" stroke-width="1.6"/>
          <ellipse cx="-3.4" cy="11" rx="3" ry="1.7" fill="#FFE6EC" opacity=".95"/>
          <path d="M-4.5,17.5 C-3,19 -1.5,19 -1,18 M4.5,17.5 C3,19 1.5,19 1,18" stroke="#B9566E" stroke-width="1.2" fill="none"/>
        </g>
        <path class="cl-labio" d="M0,23 L0,31 M0,31 C-3,36 -9,37 -13,33 M0,31 C3,36 9,37 13,33" stroke="${COR.cont}" stroke-width="2.3" fill="none" stroke-linecap="round"/>
        <g class="cl-bigE" transform="translate(-24,27)">${bigodes}</g>
        <g class="cl-bigD" transform="translate(24,27) scale(-1,1)">${bigodes}</g>
      </g>
    </g>`;
  }
  function orelhaSVG(p, lado, F, geo) {
    const g = geo || orelhaGeo(0, 0, 1, 1);
    const clip = F.icone ? '' : ` clip-path="url(#${p}clip-or${lado})"`;
    return `<g class="cl-orelha${lado}">
      <path class="cl-orFora${lado}" d="${g.fora}" fill="${F.orelha}" stroke="${COR.cont}" stroke-width="3.4" stroke-linejoin="round"/>
      ${F.icone ? "" : `<g${clip}><circle class="cl-orPonta${lado}" cx="${n(g.ponta[0])}" cy="${n(g.ponta[1])}" r="26" fill="#7E5C44" opacity=".55"/></g>`}
      <path class="cl-orDentro${lado}" d="${g.dentro}" fill="${F.rosa}"/>
      <path class="cl-orVeia${lado}" d="${g.brilho}" stroke="#FBF1E4" stroke-width="2.4" fill="none" opacity=".6" stroke-linecap="round"/>
    </g>`;
  }

  /* --- Patas: formas dos segmentos (contorno + enchimento em dois passes, sem costuras nas articulações) --- */
  const SEG = {
    braco: 'M-17,0 C-17,-17 17,-17 17,0 L13,52 C13,60 -13,60 -13,52 Z',
    antebraco: 'M-12,0 C-12,-9 12,-9 12,0 L10,54 C10,61 -10,61 -10,54 Z',
    pataF: 'M-12,-9 C-4,-15 14,-14 21,-5 C26,3 21,10 10,10 L-10,10 C-18,9 -19,-4 -12,-9 Z',
    coxa: 'M2,-46 C40,-48 62,-14 60,22 C58,56 36,78 4,78 C-30,78 -56,56 -58,20 C-60,-14 -38,-44 2,-46 Z',
    canela: 'M-14,0 C-14,-10 14,-10 14,0 L11,60 C11,68 -11,68 -11,60 Z',
    pe: 'M-12,-13 C8,-17 50,-15 74,-11 C88,-9 95,1 89,9 C83,14 62,13 40,13 L-6,13 C-18,11 -20,-9 -12,-13 Z'
  };
  function segSVG(p, classe, forma, tom) {
    const longe = tom === 'longe';
    const pelo = forma === 'coxa' ? (longe ? `url(#${p}pelo-esc)` : `url(#${p}coxa)`) : (longe ? `url(#${p}pelo-esc)` : `url(#${p}pelo-l)`);
    const A = `<g class="${classe}"><path d="${SEG[forma]}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7" stroke-linejoin="round"/></g>`;
    let B = `<g class="${classe}"><path d="${SEG[forma]}" fill="${(forma === 'pe' || forma === 'pataF') ? (longe ? '#D9C8B3' : `url(#${p}nata)`) : pelo}"/>`;
    if (forma === 'pe') {
      B += `<path d="M58,-10 C66,-4 70,4 68,12 M72,-9 C79,-3 82,5 80,12" stroke="#BCA68E" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
      B += `<path d="M-6,-12 C14,-15 44,-14 66,-10" stroke="${longe ? '#B39C84' : COR.pelo}" stroke-width="6" fill="none" opacity=".7" stroke-linecap="round"/>`;
      if (!longe) B += `<path d="M2,8 C20,10 50,10 76,9" stroke="#E0CFBB" stroke-width="2.2" fill="none" opacity=".9"/>`;
    } else if (forma === 'pataF') {
      B += `<path d="M10,-6 C13,-1 13,4 12,9 M16,-4 C19,0 19,5 18,9" stroke="#BCA68E" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
    } else if (forma === 'coxa') {
      B += `<g clip-path="url(#${p}clip-coxa)"><path d="M-62,40 C-30,70 30,72 64,40 L64,90 L-62,90 Z" fill="#6E4E36" opacity="${longe ? .15 : .22}"/>
        ${longe ? '' : `<path d="M-40,-28 C-24,-42 6,-46 26,-38" stroke="#F5E8D8" stroke-width="7" fill="none" opacity=".5" stroke-linecap="round"/>
        <path d="M-50,14 C-48,-2 -44,-12 -38,-20 M-30,48 C-36,40 -40,30 -42,20 M44,-10 C50,0 52,10 52,22" stroke="#9A785C" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>`}</g>`;
    } else if (!longe) {
      B += `<path d="M-8,4 C-9,20 -8,36 -6,48" stroke="#E6D3BE" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
    }
    return { A, B: B + '</g>' };
  }
  function pernaFrenteSVG(p, nome, tom) {
    const s = ['braco', 'antebraco', 'pataF'].map(f => segSVG(p, `cl-${nome}-${f === 'pataF' ? 'pata' : f}`, f, tom));
    return `<g class="cl-${nome}">${s.map(x => x.A).join('')}${s.map(x => x.B).join('')}</g>`;
  }
  function pernaTrasSVG(p, nome, tom) {
    const s = ['pe', 'canela', 'coxa'].map(f => segSVG(p, `cl-${nome}-${f}`, f, tom));
    return `<g class="cl-${nome}">${s.map(x => x.A).join('')}${s.map(x => x.B).join('')}</g>`;
  }

  /* --- Tronco (local: anca em 0,0; ombro em SPL,0; costas para −y, barriga para +y) --- */
  const TRONCO = 'M-66,6 C-70,-40 -36,-64 8,-62 C48,-60 84,-58 110,-38 C130,-22 134,12 118,32 C100,52 68,58 36,60 C-6,64 -62,54 -66,6 Z';
  function troncoSVG(p) {
    let tufos = '';
    for (const x of [-40, -14, 12, 38, 64, 90]) tufos += `M${x - 6},-60 C${x - 2},-50 ${x - 4},-42 ${x - 8},-34 M${x + 6},-58 C${x + 8},-50 ${x + 6},-44 ${x + 4},-38 `;
    return `<g class="cl-tronco">
      <path d="${TRONCO}" fill="url(#${p}pelo)" stroke="${COR.cont}" stroke-width="3.6" stroke-linejoin="round"/>
      <g clip-path="url(#${p}clip-tronco)">
        <path d="M-70,30 C-20,62 60,66 140,26 L140,80 L-70,80 Z" fill="url(#${p}nata)" opacity=".9"/>
        <path d="${tufos}" stroke="#A8876B" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/>
        <path d="M-50,-46 C-10,-60 50,-58 100,-42" stroke="#F3E5D3" stroke-width="8" fill="none" opacity=".45" stroke-linecap="round"/>
        <path d="M-60,-30 C-30,-56 30,-60 90,-50" stroke="#8C6A4F" stroke-width="14" fill="none" opacity=".18" stroke-linecap="round"/>
      </g>
    </g>`;
  }
  function peitoSVG(p) {
    return `<g class="cl-peito">
      <path d="M-20,-34 C0,-48 30,-44 40,-16 C48,8 42,32 28,46 L22,40 L16,50 L9,41 L2,51 L-5,42 L-12,48 C-24,24 -36,-8 -20,-34 Z" fill="url(#${p}nata)"/>
      <path d="M28,46 L22,40 L16,50 L9,41 L2,51 L-5,42 L-12,48" fill="none" stroke="${COR.nataS}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M6,-16 C10,-4 10,8 6,20 M18,-14 C24,-2 24,12 18,26" stroke="${COR.nataS}" stroke-width="1.5" fill="none" opacity=".7" stroke-linecap="round"/>
    </g>`;
  }
  // cauda de algodão: bola fofa com tufos
  function caudaSVG(p) {
    let t = '';
    for (let i = 0; i < 11; i++) { const a = i / 11 * 2 * PI; t += `<circle cx="${n(Math.cos(a) * 17)}" cy="${n(Math.sin(a) * 17)}" r="${i % 2 ? 9 : 10.5}"/>`; }
    return `<g class="cl-cauda"><g class="cl-cauda-in">
      <g fill="${COR.cont}" stroke="${COR.cont}" stroke-width="6">${t}<circle r="20"/></g>
      <g fill="url(#${p}cauda)">${t}<circle r="20"/></g>
      <path d="M-14,-6 C-10,-14 -2,-17 6,-15" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M-6,12 C2,16 10,14 16,8" stroke="#D8C6B0" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    </g></g>`;
  }
  // corpo visto de frente: só aparece a meio das viragens (vai alargando enquanto o perfil estreita)
  function frenteSVG(p) {
    return `<g class="cl-frente" display="none">
      <ellipse cx="-44" cy="-36" rx="34" ry="40" fill="url(#${p}coxa)" stroke="${COR.cont}" stroke-width="3.4"/>
      <ellipse cx="44" cy="-36" rx="34" ry="40" fill="url(#${p}coxa)" stroke="${COR.cont}" stroke-width="3.4"/>
      <ellipse cx="-46" cy="-6" rx="20" ry="13" fill="url(#${p}nata)" stroke="${COR.cont}" stroke-width="3"/>
      <ellipse cx="46" cy="-6" rx="20" ry="13" fill="url(#${p}nata)" stroke="${COR.cont}" stroke-width="3"/>
      <path d="M0,-150 C40,-150 62,-110 62,-66 C62,-28 40,-2 0,-2 C-40,-2 -62,-28 -62,-66 C-62,-110 -40,-150 0,-150 Z" fill="url(#${p}pelo)" stroke="${COR.cont}" stroke-width="3.4"/>
      <path d="M0,-128 C24,-128 36,-100 36,-70 C36,-36 22,-14 0,-14 C-22,-14 -36,-36 -36,-70 C-36,-100 -24,-128 0,-128 Z" fill="url(#${p}nata)"/>
      <path d="M-26,-60 L-24,-8 M26,-60 L24,-8" stroke="${COR.cont}" stroke-width="20" stroke-linecap="round"/>
      <path d="M-26,-60 L-24,-8 M26,-60 L24,-8" stroke="#D8C2A8" stroke-width="14" stroke-linecap="round"/>
      <ellipse cx="-22" cy="-5" rx="12" ry="8" fill="url(#${p}nata)" stroke="${COR.cont}" stroke-width="2.6"/>
      <ellipse cx="22" cy="-5" rx="12" ry="8" fill="url(#${p}nata)" stroke="${COR.cont}" stroke-width="2.6"/>
    </g>`;
  }
  const FC = p => ({ cab: `url(#${p}pelo-cab)`, cabS: '#B08E72', palp: `url(#${p}pelo-cab)`, nata: `url(#${p}nata)`, iris: `url(#${p}iris)`, boca: `url(#${p}boca)`, nariz: `url(#${p}nariz)`, orelha: `url(#${p}orelha)`, rosa: `url(#${p}rosa)` });
  function coelhoSVG(p) {
    const F = FC(p);
    return `<g class="cl-sombraG"><ellipse class="cl-sombra" cx="0" cy="0" rx="120" ry="18" fill="url(#${p}sombra)"/></g>
      <g class="cl-corpoClip"><g class="cl-flip">
        ${pernaTrasSVG(p, 'tL', 'longe')}${pernaFrenteSVG(p, 'fL', 'longe')}
        ${troncoSVG(p)}
        ${pernaTrasSVG(p, 'tN', 'perto')}
        <g class="cl-slotCauda">${caudaSVG(p)}</g>
        ${peitoSVG(p)}
        ${pernaFrenteSVG(p, 'fN', 'perto')}
      </g>
      ${frenteSVG(p)}</g>
      <g class="cl-sombraToca"></g>
      <g class="cl-cabClip"><g class="cl-cab">${orelhaSVG(p, 'E', F)}${orelhaSVG(p, 'D', F)}${cabecaSVG(p, F)}</g></g>
      <g class="cl-sombraCab"></g>
      <g class="cl-slotPataF"></g>`;
  }

  /* ================= 3) Cenário: prado de primavera à beira da horta ================= */
  const CHAO = 792;                                  // linha do chão onde o coelho pousa as patas
  const REPOUSO = { x: 676, y: CHAO };
  const T = { cx: 1010, arcoX: 926, plano: 848, xPorta: 770, xDentro: 1000, xEspreita: 972 };   // toca
  const ARCO = 'M842,798 C836,728 866,646 926,642 C988,646 1016,728 1010,798 Z';
  const MONTE = 'M772,808 C780,742 812,668 860,612 C900,566 950,540 1004,538 C1066,536 1122,566 1160,616 C1200,670 1226,744 1238,808 Z';
  const LABIO = 'M820,808 C826,786 852,772 888,770 C910,769 942,769 964,770 C1000,772 1024,786 1032,808 Z';
  const PT = { arvore: [270, 300], moinho: [1330, 420], horta: [300, 690], toca: [926, 720], cerca: [440, 560], ceu: [900, 160] };

  function defsCena() {
    return `
    <linearGradient id="coelho-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7CC0EC"/><stop offset=".55" stop-color="#BFE3F5"/><stop offset="1" stop-color="#FFF4D8"/></linearGradient>
    <radialGradient id="coelho-sol" cx="150" cy="80" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFBE6" stop-opacity="1"/><stop offset=".12" stop-color="#FFF4C4" stop-opacity=".85"/><stop offset=".45" stop-color="#FFF1C9" stop-opacity=".25"/><stop offset="1" stop-color="#FFF1C9" stop-opacity="0"/></radialGradient>
    <linearGradient id="coelho-col1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9D9A4"/><stop offset="1" stop-color="#A3C990"/></linearGradient>
    <linearGradient id="coelho-col2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A8D47E"/><stop offset="1" stop-color="#7DB65C"/></linearGradient>
    <linearGradient id="coelho-prado" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ACB66"/><stop offset=".4" stop-color="#84BD52"/><stop offset="1" stop-color="#5E9C3A"/></linearGradient>
    <radialGradient id="coelho-luzPrado" cx="300" cy="560" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F8FFC8" stop-opacity=".35"/><stop offset="1" stop-color="#F8FFC8" stop-opacity="0"/></radialGradient>
    <radialGradient id="coelho-monte" cx="880" cy="560" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#B7DC7E"/><stop offset=".5" stop-color="#86BE52"/><stop offset="1" stop-color="#4E8A30"/></radialGradient>
    <radialGradient id="coelho-terra" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#B08053"/><stop offset=".6" stop-color="#8A5E38"/><stop offset="1" stop-color="#5E3E22"/></radialGradient>
    <radialGradient id="coelho-buraco" cx="910" cy="790" r="190" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4A2E19"/><stop offset=".45" stop-color="#2C190C"/><stop offset="1" stop-color="#140A04"/></radialGradient>
    <radialGradient id="coelho-sombraToca" cx="900" cy="790" r="175" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#140A04" stop-opacity=".55"/><stop offset=".45" stop-color="#140A04" stop-opacity=".72"/><stop offset=".8" stop-color="#140A04" stop-opacity=".88"/><stop offset="1" stop-color="#140A04" stop-opacity=".95"/></radialGradient>
    <linearGradient id="coelho-madeira" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D6AE7A"/><stop offset=".5" stop-color="#B08452"/><stop offset="1" stop-color="#7E5A34"/></linearGradient>
    <linearGradient id="coelho-madeiraH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9B482"/><stop offset="1" stop-color="#8E673D"/></linearGradient>
    <linearGradient id="coelho-tronco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A47A52"/><stop offset=".45" stop-color="#7E5634"/><stop offset="1" stop-color="#4E331C"/></linearGradient>
    <radialGradient id="coelho-copa" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#A9D872"/><stop offset=".55" stop-color="#6FAE45"/><stop offset="1" stop-color="#3F7A2A"/></radialGradient>
    <radialGradient id="coelho-copa2" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#93C962"/><stop offset=".6" stop-color="#5B9A3A"/><stop offset="1" stop-color="#2F6422"/></radialGradient>
    <linearGradient id="coelho-canteiro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7E5432"/><stop offset="1" stop-color="#9C6C42"/></linearGradient>
    <linearGradient id="coelho-cenoura" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFB45A"/><stop offset=".5" stop-color="#F28A2C"/><stop offset="1" stop-color="#C9631A"/></linearGradient>
    <radialGradient id="coelho-couve" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#E4F5B8"/><stop offset=".5" stop-color="#A8D47A"/><stop offset="1" stop-color="#5E9A42"/></radialGradient>
    <radialGradient id="coelho-couveF" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#B8DE8A"/><stop offset="1" stop-color="#4E8A36"/></radialGradient>
    <linearGradient id="coelho-regador" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9CC6D8"/><stop offset=".45" stop-color="#5E93AE"/><stop offset="1" stop-color="#3A6880"/></linearGradient>
    <radialGradient id="coelho-pedra" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#E4E0D6"/><stop offset=".6" stop-color="#B3AC9E"/><stop offset="1" stop-color="#7E776A"/></radialGradient>
    <radialGradient id="coelho-sombraChao"><stop offset="0" stop-color="#2E3A14" stop-opacity=".4"/><stop offset="1" stop-color="#2E3A14" stop-opacity="0"/></radialGradient>
    <radialGradient id="coelho-vinheta" cx=".45" cy=".42" r=".78"><stop offset=".6" stop-color="#22320E" stop-opacity="0"/><stop offset="1" stop-color="#22320E" stop-opacity=".28"/></radialGradient>
    <clipPath id="coelho-toca"><rect x="-400" y="-400" width="${T.plano + 400}" height="1700"/><path d="${ARCO}"/></clipPath>
    <clipPath id="coelho-clip-monte"><path d="${MONTE}"/></clipPath>
    <clipPath id="coelho-clip-arco"><path d="${ARCO}"/></clipPath>`;
  }

  function nuvemSVG(i, k) {
    return `<g class="cl-nuvem${i}"><g transform="scale(${k})">
      <ellipse cx="4" cy="14" rx="70" ry="14" fill="#D7E9F4"/>
      <circle cx="-38" cy="2" r="22" fill="#FFFFFF"/><circle cx="-8" cy="-14" r="30" fill="#FFFFFF"/><circle cx="28" cy="-6" r="24" fill="#FFFFFF"/><circle cx="54" cy="4" r="15" fill="#FFFFFF"/>
      <ellipse cx="6" cy="8" rx="66" ry="12" fill="#FFFFFF"/>
      <path d="M-56,14 C-20,22 30,22 66,12" stroke="#C3DBEA" stroke-width="3" fill="none" opacity=".8"/>
      <path d="M-26,-22 C-18,-34 -2,-38 10,-34" stroke="#FFFFFF" stroke-width="5" fill="none" opacity=".9" stroke-linecap="round"/>
    </g></g>`;
  }
  function moinhoSVG() {           // moinho português ao longe, com as velas a rodar devagar
    const x = 1330, y = 430;
    let velas = '';
    for (let i = 0; i < 4; i++) velas += `<g transform="rotate(${i * 90})"><path d="M0,0 L0,-62" stroke="#6B5038" stroke-width="2"/><path d="M1,-12 L22,-20 L18,-60 L2,-60 Z" fill="#FFFDF4" stroke="#B8AE9C" stroke-width="1.2"/><path d="M4,-24 L19,-28 M3,-40 L18,-42" stroke="#D6CDBB" stroke-width="1"/></g>`;
    return `<g>
      <path d="M${x - 24},${y + 70} L${x - 17},${y - 12} L${x + 17},${y - 12} L${x + 24},${y + 70} Z" fill="#FBF6EC" stroke="#B9AE9A" stroke-width="1.6"/>
      <path d="M${x + 6},${y - 12} L${x + 17},${y - 12} L${x + 24},${y + 70} L${x + 10},${y + 70} Z" fill="#D8CFC0" opacity=".7"/>
      <path d="M${x - 21},${y - 12} Q${x},${y - 46} ${x + 21},${y - 12} Z" fill="#B85A3A" stroke="#7E3A22" stroke-width="1.4"/>
      <rect x="${x - 5}" y="${y + 42}" width="10" height="28" rx="5" fill="#5B7FA0"/><rect x="${x - 4}" y="${y + 12}" width="8" height="10" rx="2" fill="#5B7FA0"/>
      <g class="cl-velas" transform="translate(${x},${y - 18})">${velas}<circle r="4" fill="#6B5038"/></g>
    </g>`;
  }
  function colinasSVG() {
    let s = `<path d="M0,500 C140,452 300,440 470,470 C640,500 760,450 930,440 C1110,430 1240,470 1400,452 C1490,444 1560,452 1600,460 L1600,620 L0,620 Z" fill="url(#coelho-col1)"/>`;
    // sebes e arvorezinhas ao longe
    const r = semente(31);
    for (let i = 0; i < 26; i++) {
      const x = 20 + i * 62 + r() * 30, yb = 470 + Math.sin(x / 210) * 16 + 18;
      s += `<ellipse cx="${n(x)}" cy="${n(yb)}" rx="${n(16 + r() * 14)}" ry="${n(8 + r() * 6)}" fill="#86B472" opacity=".75"/>`;
    }
    s += moinhoSVG();
    s += `<path d="M0,560 C180,520 360,520 520,540 C700,562 860,520 1040,516 C1220,512 1380,540 1600,520 L1600,640 L0,640 Z" fill="url(#coelho-col2)"/>`;
    for (let i = 0; i < 40; i++) {
      const x = r() * 1600, y = 548 + r() * 40;
      s += `<path d="M${n(x)},${n(y)} l-4,-9 M${n(x)},${n(y)} l1,-11 M${n(x)},${n(y)} l5,-8" stroke="#6DA548" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
    }
    return s;
  }
  function arvoreSVG() {
    const tronco = `<path d="M232,660 C240,600 244,520 238,450 C234,410 220,380 200,356 L214,346 C232,366 246,388 254,414 C262,380 282,350 312,330 L322,344 C292,368 276,400 270,444 C266,520 270,600 284,660 Z" fill="url(#coelho-tronco)" stroke="#4A2E18" stroke-width="2.5"/>
      <path d="M248,640 C252,580 254,520 250,460 M262,600 C264,560 262,520 260,490" stroke="#4E331C" stroke-width="2" fill="none" opacity=".5"/>
      <path d="M240,630 C244,570 246,510 242,456" stroke="#C9A27A" stroke-width="3" fill="none" opacity=".45"/>
      <path d="M210,664 C220,650 236,650 246,660 M268,660 C280,648 298,650 310,664" stroke="#5A3A20" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    const tufo = (x, y, r, g) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${g})"/>`;
    const copa = (i, cls) => `<g class="${cls}">${cls === 'cl-copaT' ?
      tufo(150, 330, 70, 'coelho-copa2') + tufo(370, 320, 76, 'coelho-copa2') + tufo(260, 240, 92, 'coelho-copa2') :
      tufo(190, 300, 74, 'coelho-copa') + tufo(320, 290, 80, 'coelho-copa') + tufo(250, 200, 88, 'coelho-copa') + tufo(170, 220, 56, 'coelho-copa') + tufo(350, 210, 60, 'coelho-copa') + tufo(256, 330, 66, 'coelho-copa')}
      ${cls === 'cl-copaF' ? `<g fill="#C8EC92" opacity=".55"><circle cx="210" cy="180" r="14"/><circle cx="168" cy="210" r="10"/><circle cx="236" cy="150" r="9"/><circle cx="150" cy="276" r="11"/><circle cx="290" cy="186" r="8"/></g>
      <g fill="#2F6422" opacity=".25"><circle cx="330" cy="330" r="20"/><circle cx="380" cy="270" r="16"/><circle cx="290" cy="352" r="14"/></g>
      <g fill="#F7F3FF"><circle cx="196" cy="260" r="4"/><circle cx="300" cy="240" r="4"/><circle cx="240" cy="300" r="3.5"/><circle cx="340" cy="290" r="3.5"/><circle cx="214" cy="190" r="3.5"/><circle cx="270" cy="170" r="4"/><circle cx="170" cy="320" r="3.5"/></g>
      <g fill="#F7B6C8"><circle cx="197" cy="259" r="1.6"/><circle cx="301" cy="239" r="1.6"/><circle cx="271" cy="169" r="1.6"/></g>` : ''}</g>`;
    return `<ellipse cx="262" cy="664" rx="150" ry="20" fill="url(#coelho-sombraChao)"/>${copa(0, 'cl-copaT')}${tronco}${copa(1, 'cl-copaF')}`;
  }
  function cercaSVG() {
    let s = '';
    const yT = 556, yB = 662;
    for (const yr of [584, 624]) s += `<rect x="-10" y="${yr - 9}" width="1620" height="16" rx="3" fill="url(#coelho-madeiraH)" stroke="#6A4A2A" stroke-width="2"/><rect x="-10" y="${yr - 8}" width="1620" height="3" fill="#F2D6A8" opacity=".55"/><rect x="-10" y="${yr + 7}" width="1620" height="4" fill="#3E2A14" opacity=".2"/>`;
    for (let x = 30; x < 1600; x += 140) {
      s += `<path d="M${x - 11},${yB} L${x - 11},${yT + 8} L${x},${yT - 6} L${x + 11},${yT + 8} L${x + 11},${yB} Z" fill="url(#coelho-madeira)" stroke="#6A4A2A" stroke-width="2"/>`;
      s += `<path d="M${x - 6},${yT + 16} L${x - 6},${yB - 6} M${x + 3},${yT + 30} L${x + 3},${yB - 16}" stroke="#7E5A34" stroke-width="1.4" opacity=".55"/><circle cx="${x}" cy="584" r="2.2" fill="#5A4430"/><circle cx="${x}" cy="624" r="2.2" fill="#5A4430"/>`;
      s += `<path d="M${x - 16},${yB + 2} l4,-14 M${x - 10},${yB + 2} l2,-18 M${x + 12},${yB + 2} l-2,-16 M${x + 17},${yB + 2} l-4,-12" stroke="#5E9A3A" stroke-width="2.4" stroke-linecap="round"/>`;
    }
    return s;
  }
  function pradoSVG() {
    let s = `<rect y="600" width="1600" height="300" fill="url(#coelho-prado)"/><rect y="600" width="1600" height="300" fill="url(#coelho-luzPrado)"/>`;
    const r = semente(17);
    for (let i = 0; i < 150; i++) {           // ervinhas no chão (mais pequenas ao longe)
      const y = 660 + r() * 230, x = r() * 1600, k = .5 + (y - 660) / 230;
      const c = r() < .5 ? '#5C9636' : '#A6D46A';
      s += `<path d="M${n(x)},${n(y)} q${n(-3 * k)},${n(-8 * k)} ${n(-5 * k)},${n(-14 * k)} M${n(x)},${n(y)} q${n(1 * k)},${n(-9 * k)} ${n(3 * k)},${n(-16 * k)} M${n(x)},${n(y)} q${n(4 * k)},${n(-6 * k)} ${n(8 * k)},${n(-11 * k)}" stroke="${c}" stroke-width="${n(1.4 + k)}" fill="none" stroke-linecap="round" opacity=".8"/>`;
    }
    // trevos e manchas de luz
    for (let i = 0; i < 18; i++) {
      const x = r() * 1600, y = 700 + r() * 180;
      s += `<g transform="translate(${n(x)},${n(y)})" fill="#4E8A30" opacity=".55"><circle cx="-3" cy="-2" r="3.2"/><circle cx="3" cy="-2" r="3.2"/><circle cx="0" cy="-6" r="3.2"/></g>`;
    }
    return s;
  }
  // flores do prado: papoilas, margaridas e dentes-de-leão (cada uma abana com o vento)
  function florSVG(i, x, y, tipo, k) {
    let cab = '';
    if (tipo === 'papoila') cab = `<g transform="translate(0,-46)"><path d="M0,0 C-14,-4 -18,-16 -8,-20 C-4,-22 0,-18 0,-14 C0,-18 4,-22 8,-20 C18,-16 14,-4 0,0 Z" fill="#E63B2E" stroke="#A8231A" stroke-width="1.2"/><path d="M0,-2 C-10,-2 -16,-10 -12,-16" stroke="#FF8A70" stroke-width="2" fill="none" opacity=".7"/><circle cx="0" cy="-11" r="3.4" fill="#2A1A14"/></g>`;
    else if (tipo === 'margarida') { let p = ''; for (let j = 0; j < 12; j++) p += `<ellipse cx="0" cy="-8" rx="2.8" ry="7" transform="rotate(${j * 30})" fill="#FFFFFF" stroke="#D6D0C4" stroke-width=".8"/>`; cab = `<g transform="translate(0,-40)">${p}<circle r="4.6" fill="#F6C834" stroke="#C99A1A" stroke-width="1"/></g>`; }
    else { let p = ''; for (let j = 0; j < 14; j++) p += `<ellipse cx="0" cy="-6" rx="2.2" ry="6" transform="rotate(${j * 26})" fill="#FFD33A"/>`; cab = `<g transform="translate(0,-36)">${p}<circle r="3.6" fill="#F0B020"/></g>`; }
    const alt = tipo === 'papoila' ? 46 : tipo === 'margarida' ? 40 : 36;
    return `<g transform="translate(${x},${y}) scale(${k})"><g class="cl-flor${i}">
      <path d="M0,0 C2,-${alt * .4} -2,-${alt * .7} 0,-${alt}" stroke="#4E8A30" stroke-width="2.6" fill="none"/>
      <path d="M0,-12 C-8,-16 -12,-14 -14,-10 C-10,-8 -4,-8 0,-12 Z M0,-20 C8,-24 12,-22 14,-18 C10,-16 4,-16 0,-20 Z" fill="#5E9A3A"/>
      ${cab}</g></g>`;
  }
  const FLORES = [
    [470, 640, 'margarida', .8], [560, 652, 'papoila', .8], [700, 646, 'margarida', .7], [1190, 650, 'papoila', .8], [1260, 642, 'dente', .75], [1380, 660, 'margarida', .85], [1480, 650, 'papoila', .8],
    [70, 800, 'papoila', 1.1], [150, 840, 'margarida', 1.2], [520, 830, 'dente', 1.1], [790, 850, 'margarida', 1.2], [1100, 840, 'papoila', 1.2], [1280, 800, 'margarida', 1.1], [1350, 856, 'papoila', 1.25], [1520, 820, 'dente', 1.2], [880, 880, 'papoila', 1.3]
  ];
  // horta: canteiro com duas filas de cenouras (ramas a abanar) e uma fila de couves; regador
  const CENOURAS = [];
  for (let f = 0; f < 2; f++) for (let i = 0; i < 6; i++) CENOURAS.push([96 + i * 72 + f * 30, 690 + f * 34, .82 + f * .1]);
  function cenouraSVG(i, x, y, k) {
    let rama = '';
    for (const [a, l] of [[-34, 44], [-16, 54], [0, 60], [16, 52], [34, 42]]) {
      const ex = Math.sin(a * RAD) * l, ey = -Math.cos(a * RAD) * l;
      rama += `<path d="M0,0 Q${n(ex * .3)},${n(ey * .6)} ${n(ex)},${n(ey)}" stroke="#4E8A30" stroke-width="2.2" fill="none"/>`;
      for (let j = 1; j <= 4; j++) { const u = j / 5, px = ex * u + ex * .1 * (1 - u), py = ey * u * (1 - .05 * u); rama += `<path d="M${n(px)},${n(py)} l-6,-4 M${n(px)},${n(py)} l6,-4" stroke="#6DB043" stroke-width="2" stroke-linecap="round"/>`; }
    }
    return `<g transform="translate(${x},${y}) scale(${k})">
      <ellipse cx="0" cy="6" rx="18" ry="5" fill="#5E3E22" opacity=".45"/>
      <g class="cl-cen${i}"><g class="cl-rama${i}">${rama}</g>
      <path d="M-11,2 C-11,-8 11,-8 11,2 C11,8 6,12 0,13 C-6,12 -11,8 -11,2 Z" fill="url(#coelho-cenoura)" stroke="#A8501A" stroke-width="1.5"/>
      <path d="M-6,-1 L-2,0 M4,-3 L7,-2" stroke="#B85A1E" stroke-width="1.2"/><path d="M-7,-3 C-4,-6 0,-6 3,-6" stroke="#FFD29A" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/></g>
      <path d="M-16,8 C-8,4 8,4 16,8 C10,12 -10,12 -16,8 Z" fill="#8A5E38"/>
    </g>`;
  }
  function couveSVG(x, y, k) {
    let f = '';
    for (let j = 0; j < 7; j++) { const a = -80 + j * 27; f += `<path transform="rotate(${a})" d="M0,0 C-16,-10 -14,-38 0,-44 C14,-38 16,-10 0,0 Z" fill="url(#coelho-couveF)" stroke="#3E7A2A" stroke-width="1.5"/><path transform="rotate(${a})" d="M0,-4 L0,-38 M0,-16 l-7,-6 M0,-16 l7,-6 M0,-28 l-6,-5 M0,-28 l6,-5" stroke="#D8EFB0" stroke-width="1.3" fill="none" opacity=".8"/>`; }
    return `<g transform="translate(${x},${y}) scale(${k})"><ellipse cx="4" cy="6" rx="44" ry="9" fill="#3E2A14" opacity=".3"/>${f}
      <circle cx="0" cy="-14" r="22" fill="url(#coelho-couve)" stroke="#5E9A42" stroke-width="1.6"/>
      <path d="M-14,-10 C-10,-24 6,-30 16,-20 M-18,-2 C-12,-14 10,-16 20,-6" stroke="#8CC05E" stroke-width="2" fill="none"/>
      <path d="M-10,-26 C-4,-32 4,-32 10,-28" stroke="#F4FFE0" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/></g>`;
  }
  function hortaSVG() {
    let s = `<path d="M40,676 C120,664 420,660 560,672 L586,780 C420,796 160,798 18,784 Z" fill="url(#coelho-canteiro)" stroke="#5E3E22" stroke-width="2.5"/>`;
    s += `<path d="M40,676 C120,664 420,660 560,672" stroke="#B48A5E" stroke-width="3" fill="none" opacity=".6"/>`;
    for (const y of [700, 734, 766]) s += `<path d="M${36 - (y - 676) * .2},${y} C180,${y - 8} 420,${y - 8} ${566 + (y - 676) * .2},${y - 2}" stroke="#5E3E22" stroke-width="5" fill="none" opacity=".35"/>`;
    const r = semente(5);
    for (let i = 0; i < 40; i++) s += `<circle cx="${n(50 + r() * 520)}" cy="${n(680 + r() * 100)}" r="${n(1.5 + r() * 2)}" fill="${r() < .5 ? '#C49A6C' : '#5E3E22'}" opacity=".6"/>`;
    CENOURAS.forEach(([x, y, k], i) => { s += cenouraSVG(i, x, y, k); });
    s += couveSVG(110, 776, .9) + couveSVG(260, 782, 1) + couveSVG(410, 778, .95);
    // regador ao lado do canteiro
    s += `<g transform="translate(38,700) scale(.62)"><ellipse cx="0" cy="4" rx="40" ry="8" fill="#2E3A14" opacity=".3"/>
      <path d="M-26,0 L-22,-48 L22,-48 L26,0 Z" fill="url(#coelho-regador)" stroke="#2E5266" stroke-width="2"/>
      <path d="M22,-36 L58,-62 L62,-56 L26,-24 Z" fill="url(#coelho-regador)" stroke="#2E5266" stroke-width="2"/><ellipse cx="62" cy="-61" rx="6" ry="9" transform="rotate(-50 62 -61)" fill="#3A6880" stroke="#2E5266" stroke-width="1.5"/>
      <path d="M-14,-48 C-14,-74 14,-74 14,-48" stroke="#3A6880" stroke-width="5" fill="none"/>
      <path d="M-18,-40 L-15,-6" stroke="#D4ECF6" stroke-width="4" opacity=".6" stroke-linecap="round"/><rect x="-24" y="-50" width="48" height="6" rx="3" fill="#7FB0C8" stroke="#2E5266" stroke-width="1.5"/></g>`;
    return s;
  }
  function ervasFrenteSVG() {       // tufos altos em primeiro plano (nas bordas, sem tapar o coelho)
    const tufos = [[20, 900, 1.5], [110, 906, 1.2], [330, 912, .9], [470, 908, .8], [1180, 910, .9], [1330, 906, 1.2], [1470, 904, 1.5], [1580, 900, 1.3], [700, 918, .7], [960, 918, .7]];
    return tufos.map(([x, y, k], i) => {
      let f = '';
      for (const [a, l, c] of [[-28, 70, '#4E8A30'], [-12, 96, '#6DB043'], [4, 110, '#5C9C38'], [18, 88, '#7CBF4C'], [32, 64, '#4E8A30'], [-40, 50, '#3E7A28']]) {
        const ex = Math.sin(a * RAD) * l, ey = -Math.cos(a * RAD) * l;
        f += `<path d="M-6,0 Q${n(ex * .2)},${n(ey * .55)} ${n(ex * 1.15)},${n(ey)} Q${n(ex * .3 + 6)},${n(ey * .5)} 6,0 Z" fill="${c}"/>`;
      }
      return `<g transform="translate(${x},${y}) scale(${k})"><g class="cl-tufo${i}">${f}<path d="M-2,0 Q0,-50 8,-104" stroke="#B8E080" stroke-width="2" fill="none" opacity=".5"/></g></g>`;
    }).join('');
  }
  function borboletaSVG(i, c1, c2) {
    return `<g class="cl-borb${i}"><g class="cl-borbIn${i}">
      <g class="cl-asaT${i}"><path d="M0,-2 C-6,-20 -26,-26 -30,-12 C-32,-2 -16,4 0,0 Z" fill="${c1}" stroke="#5A3A2A" stroke-width="1.2"/><circle cx="-18" cy="-12" r="4" fill="${c2}"/><circle cx="-26" cy="-14" r="1.8" fill="#FFFFFF" opacity=".8"/>
        <path d="M0,1 C-4,10 -18,18 -22,10 C-24,4 -12,2 0,1 Z" fill="${c1}" stroke="#5A3A2A" stroke-width="1.2"/></g>
      <ellipse cx="0" cy="0" rx="2.6" ry="9" fill="#3A2A20"/><path d="M0,-8 C-2,-14 -6,-18 -8,-20 M0,-8 C2,-14 6,-18 8,-20" stroke="#3A2A20" stroke-width="1" fill="none"/>
      <g class="cl-asaF${i}" transform="scale(-1,1)"><path d="M0,-2 C-6,-20 -26,-26 -30,-12 C-32,-2 -16,4 0,0 Z" fill="${c1}" stroke="#5A3A2A" stroke-width="1.2"/><circle cx="-18" cy="-12" r="4" fill="${c2}"/>
        <path d="M0,1 C-4,10 -18,18 -22,10 C-24,4 -12,2 0,1 Z" fill="${c1}" stroke="#5A3A2A" stroke-width="1.2"/></g>
    </g></g>`;
  }
  function passaroSVG() {            // pisco-de-peito-ruivo
    return `<g class="cl-passaro" display="none"><g class="cl-ave">
      <path d="M-12,-10 L-30,-16 L-28,-4 Z" fill="#7A5A3E"/>
      <ellipse cx="-2" cy="-12" rx="15" ry="11" fill="#9A7856"/>
      <path d="M6,-20 C14,-14 14,-4 6,0 C0,-2 -2,-12 6,-20 Z" fill="#E8783A"/>
      <ellipse cx="0" cy="-5" rx="8" ry="4.5" fill="#F1E6D4"/>
      <g class="cl-ave-cab"><circle cx="9" cy="-21" r="8" fill="#9A7856"/><path d="M8,-15 C14,-17 16,-21 14,-25 C10,-24 8,-20 8,-15 Z" fill="#E8783A"/><circle cx="11" cy="-23" r="1.8" fill="#1D120A"/><circle cx="11.6" cy="-23.6" r=".6" fill="#FFFFFF"/><path d="M16,-22 L22,-20.5 L16,-19 Z" fill="#3A2A1A"/></g>
      <g class="cl-ave-asa"><path d="M-14,-15 C-8,-23 6,-21 8,-12 C2,-8 -8,-9 -14,-15 Z" fill="#7A5A3E" stroke="#5A3D26" stroke-width="1"/><path d="M-9,-15 L1,-14 M-7,-12 L3,-11" stroke="#E5D3B6" stroke-width="1.1"/></g>
      <path d="M-2,-1 L-4,3 M3,-1 L4,3" stroke="#8A5A3A" stroke-width="1.8" stroke-linecap="round"/>
    </g></g>`;
  }
  function joaninhaSVG() {
    return `<path class="cl-caule" d="M478,804 C474,770 482,736 476,700" stroke="#5E9A3A" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M476,712 C466,706 458,708 452,714 C460,718 470,718 476,712 Z" fill="#6DB043"/>
      <g class="cl-joaninha" display="none"><g class="cl-joaIn">
        <g class="cl-joaAsas" opacity="0"><ellipse cx="-9" cy="-2" rx="12" ry="5" fill="#E8F2F8" opacity=".75" transform="rotate(-30)"/><ellipse cx="9" cy="-2" rx="12" ry="5" fill="#E8F2F8" opacity=".75" transform="rotate(30)"/></g>
        <g class="cl-joaCasca"><path d="M-8,0 C-8,-9 8,-9 8,0 C8,7 4,10 0,10 C-4,10 -8,7 -8,0 Z" fill="#E0321E" stroke="#7A1A10" stroke-width="1"/><path d="M0,-6 L0,10" stroke="#3A1A10" stroke-width="1"/>
          <circle cx="-4" cy="0" r="1.8" fill="#1A0E08"/><circle cx="4" cy="3" r="1.8" fill="#1A0E08"/><circle cx="-3" cy="6" r="1.4" fill="#1A0E08"/><circle cx="4" cy="-3" r="1.4" fill="#1A0E08"/><circle cx="-3" cy="-4" r="1.2" fill="#FFFFFF" opacity=".6"/></g>
        <circle cx="0" cy="-8" r="3.6" fill="#1A0E08"/><circle cx="-1.5" cy="-9" r=".8" fill="#FFFFFF"/>
      </g></g>`;
  }
  function migalhasSVG() {             // migalhas de terra (saltam quando o coelho entra, sai ou se sacode)
    let s = '';
    for (let i = 0; i < 14; i++) s += `<circle class="cl-mig${i}" r="${n(2.4 + (i % 4) * 1.2)}" fill="${i % 3 ? '#8A5E38' : '#B08053'}" display="none"/>`;
    return s;
  }

  /* --- Toca: parte de trás (monte, buraco escuro, raízes, pedras, flores) e parte da frente (lábio de terra, ervas) --- */
  function tocaTrasSVG() {
    let s = `<rect x="770" y="520" width="480" height="300" fill="#000" fill-opacity="0"/>`;     // zona de toque da toca
    s += `<ellipse cx="1012" cy="808" rx="250" ry="26" fill="url(#coelho-sombraChao)"/>`;
    s += `<path d="${MONTE}" fill="url(#coelho-monte)" stroke="#3E7A28" stroke-width="3"/>`;
    s += `<g clip-path="url(#coelho-clip-monte)">`;
    s += `<path d="M1060,540 C1140,560 1210,660 1238,808 L1300,808 L1300,500 Z" fill="#2E5A1C" opacity=".22"/>`;
    s += `<path d="M820,700 C850,620 920,566 990,556" stroke="#E2F7B0" stroke-width="12" fill="none" opacity=".25" stroke-linecap="round"/>`;
    const r = semente(41);
    for (let i = 0; i < 60; i++) {
      const x = 790 + r() * 440, y = 560 + r() * 240;
      s += `<path d="M${n(x)},${n(y)} q-3,-7 -4,-12 M${n(x)},${n(y)} q1,-8 3,-13 M${n(x)},${n(y)} q4,-5 7,-9" stroke="${r() < .5 ? '#4E8A30' : '#A8D872'}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".75"/>`;
    }
    // terra à volta da boca da toca
    s += `<path d="M826,806 C818,724 854,628 926,622 C1000,628 1034,724 1026,806 Z" fill="url(#coelho-terra)"/>`;
    s += `<path d="M836,760 C834,700 864,644 926,638" stroke="#C49A6C" stroke-width="4" fill="none" opacity=".6"/>`;
    s += '</g>';
    // relva da silhueta (tufos ao longo do contorno)
    const pts = [[790, 740], [808, 690], [836, 646], [872, 602], [916, 568], [962, 548], [1010, 540], [1058, 546], [1102, 566], [1142, 600], [1176, 646], [1204, 700], [1224, 756]];
    for (const [x, y] of pts) s += `<path d="M${x - 10},${y + 6} l-3,-14 l7,9 l2,-17 l5,15 l5,-12 l1,15 l6,-8 l-3,14 Z" fill="#7CBF4C" stroke="#4E8A30" stroke-width="1.2" stroke-linejoin="round"/>`;
    // pedras e flores no monte
    s += `<ellipse cx="1110" cy="720" rx="26" ry="16" fill="url(#coelho-pedra)" stroke="#6E675A" stroke-width="2"/><path d="M1094,714 C1100,706 1112,704 1122,708" stroke="#F4F0E6" stroke-width="3" fill="none" opacity=".7"/>`;
    s += `<ellipse cx="1150" cy="770" rx="18" ry="11" fill="url(#coelho-pedra)" stroke="#6E675A" stroke-width="2"/>`;
    s += `<ellipse cx="1050" cy="626" rx="12" ry="7" fill="url(#coelho-pedra)" stroke="#6E675A" stroke-width="1.6"/>`;
    s += `<g class="cl-floresMonte">${florSVG(90, 1004, 548, 'margarida', .8)}${florSVG(91, 1080, 572, 'papoila', .75)}${florSVG(92, 960, 562, 'dente', .7)}${florSVG(93, 1170, 650, 'margarida', .8)}</g>`;
    // buraco (interior escuro) com raízes penduradas
    s += `<path d="${ARCO}" fill="url(#coelho-buraco)"/>`;
    s += `<g clip-path="url(#coelho-clip-arco)">
      <path d="M842,700 C860,668 890,650 926,648 C960,650 992,668 1010,700" stroke="#0E0602" stroke-width="22" fill="none" opacity=".5"/>
      <path d="M900,790 C920,770 960,770 990,790" stroke="#5E3E22" stroke-width="6" fill="none" opacity=".4"/></g>`;
    s += `<path d="M842,798 C836,728 866,646 926,642 C988,646 1016,728 1010,798" stroke="#5E3E22" stroke-width="7" fill="none"/>`;
    s += `<path d="M846,780 C842,720 870,654 926,650" stroke="#A47850" stroke-width="2.5" fill="none" opacity=".6"/>`;
    s += `<g class="cl-raizes"><path d="M884,652 C880,670 886,684 880,700 M902,646 C904,662 900,670 904,682 M948,646 C950,664 944,676 950,690 C952,696 948,702 950,708 M972,656 C968,668 972,676 968,686" stroke="#7A5232" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M884,652 C880,670 886,684 880,700 M948,646 C950,664 944,676 950,690" stroke="#C49A6C" stroke-width="1" fill="none" opacity=".6"/></g>`;
    return s;
  }
  function tocaFrenteSVG() {
    let s = `<path d="${LABIO}" fill="url(#coelho-terra)" stroke="#5E3E22" stroke-width="2.5"/>`;
    s += `<path d="M830,800 C840,784 864,776 892,775 C920,774 950,774 972,776" stroke="#C49A6C" stroke-width="3" fill="none" opacity=".7"/>`;
    const r = semente(9);
    for (let i = 0; i < 16; i++) s += `<circle cx="${n(834 + r() * 190)}" cy="${n(784 + r() * 20)}" r="${n(1.8 + r() * 2.6)}" fill="${r() < .5 ? '#5E3E22' : '#C49A6C'}" opacity=".8"/>`;
    s += `<ellipse cx="1012" cy="796" rx="16" ry="10" fill="url(#coelho-pedra)" stroke="#6E675A" stroke-width="1.8"/>`;
    s += `<g class="cl-ervasToca">`;
    for (const [x, y, k, i] of [[822, 810, 1, 0], [1036, 810, 1.1, 1], [866, 812, .7, 2], [990, 812, .75, 3]]) {
      s += `<g transform="translate(${x},${y}) scale(${k})"><g class="cl-ervaT${i}"><path d="M-8,0 Q-14,-24 -20,-40 Q-8,-24 -2,0 Z M-3,0 Q-2,-30 4,-52 Q4,-26 4,0 Z M2,0 Q10,-22 20,-34 Q10,-18 8,0 Z" fill="#6DB043" stroke="#3E7A28" stroke-width="1"/></g></g>`;
    }
    s += `</g>`;
    s += migalhasSVG();
    return s;
  }

  /* ================= 4) Ícone do menu (retrato parado, sem gradientes com id) ================= */
  function iconeSVG() {
    const F = { cab: '#CBAA8C', cabS: '#B08E72', palp: '#CBAA8C', nata: '#FFF8EC', iris: '#4A2A18', boca: '#7A2432', nariz: '#F29AB0', orelha: '#C4A386', rosa: '#F4AEBF', icone: true };
    const gE = orelhaGeo(-12, -14, .95, 1), gD = orelhaGeo(16, 30, .8, 1);
    return `<circle cx="110" cy="110" r="106" fill="#CFEBF6"/>
      <path d="M12,150 C60,130 160,130 208,150 A106,106 0 0 1 12,150 Z" fill="#92C95C"/>
      <circle cx="40" cy="58" r="22" fill="#FFF6C8" opacity=".9"/>
      <g transform="translate(110,206) scale(.62)">
        <path d="M0,-150 C46,-150 70,-108 70,-60 C70,-20 46,0 0,0 C-46,0 -70,-20 -70,-60 C-70,-108 -46,-150 0,-150 Z" fill="#C4A386" stroke="${COR.cont}" stroke-width="4"/>
        <path d="M-50,-110 C-36,-140 0,-148 30,-138" stroke="#E6D2BB" stroke-width="10" fill="none" stroke-linecap="round" opacity=".7"/>
        <path d="M0,-124 C26,-124 38,-96 38,-66 C38,-32 24,-8 0,-8 C-24,-8 -38,-32 -38,-66 C-38,-96 -26,-124 0,-124 Z" fill="#FFF8EC"/>
        <ellipse cx="-28" cy="-6" rx="17" ry="11" fill="#FFF8EC" stroke="${COR.cont}" stroke-width="3"/><ellipse cx="28" cy="-6" rx="17" ry="11" fill="#FFF8EC" stroke="${COR.cont}" stroke-width="3"/>
      </g>
      <g transform="translate(110,124) scale(.6)">
        <g transform="translate(-24,-46)">${orelhaSVG('', 'E', F, gE)}</g><g transform="translate(24,-46)">${orelhaSVG('', 'D', F, gD)}</g>
        ${cabecaSVG('', F, true)}
      </g>
      <g transform="translate(184,196)"><path d="M0,0 C-2,-14 4,-22 0,-34" stroke="#4E8A30" stroke-width="2.4" fill="none"/><g transform="translate(0,-38)"><path d="M0,0 C-12,-4 -15,-14 -7,-17 C-3,-19 0,-15 0,-12 C0,-15 3,-19 7,-17 C15,-14 12,-4 0,0 Z" fill="#E63B2E" stroke="#A8231A" stroke-width="1"/><circle cx="0" cy="-9" r="3" fill="#2A1A14"/></g></g>`;
  }

  /* ================= 5) Poses (dados) ================= */
  // Coordenadas do coelho virado para a direita, com o chão em y = 0 (o «flip» espelha quando está virado para a esquerda).
  const SENTADO = {
    hipX: -40, hipY: -62, spA: -48, spL: 100, corpoSy: 1, cabX: 30, cabY: -30, cabR: 0, cabYaw: .35, pitch: 0, inclina: 0,
    fLx: 56, fLy: 0, fNx: 64, fNy: 0, pfL: 0, pfN: 0, tLx: 22, tLy: 0, tNx: 30, tNy: 0, paL: 0, paN: 0, cauX: 0, cauY: 0, cauR: 0
  };
  const QUATRO = {
    hipX: -50, hipY: -64, spA: -12, spL: 104, corpoSy: 1, cabX: 26, cabY: -6, cabR: 0, pitch: .1, inclina: 0,
    fLx: 96, fLy: 0, fNx: 104, fNy: 0, pfL: 0, pfN: 0, tLx: 18, tLy: 0, tNx: 26, tNy: 0, paL: 0, paN: 0, cauX: 0, cauY: 0, cauR: 0
  };
  const ALERTA = {
    hipX: -26, hipY: -84, spA: -84, spL: 108, corpoSy: .97, cabX: 14, cabY: -36, cabR: 0, pitch: -.08, inclina: 0,
    fLx: 46, fLy: -112, fNx: 54, fNy: -106, pfL: 70, pfN: 70, tLx: 22, tLy: 0, tNx: 30, tNy: 0, paL: 0, paN: 0, cauX: 0, cauY: 6, cauR: 0
  };
  const DEITADO = {
    hipX: -46, hipY: -42, spA: -3, spL: 112, corpoSy: .88, cabX: 30, cabY: 16, cabR: 6, pitch: .25, inclina: 0,
    fLx: 128, fLy: 0, fNx: 136, fNy: 0, pfL: 0, pfN: 0, tLx: 10, tLy: 0, tNx: 18, tNy: 0, paL: 0, paN: 0, cauX: 4, cauY: 6, cauR: 0
  };
  const COMER = { hipX: -42, hipY: -58, spA: -24, spL: 104, cabX: 46, cabY: 58, cabR: 6, pitch: .5, fLx: 72, fNx: 80, fLy: 0, fNy: 0, pfL: 0, pfN: 0 };
  const ESPREITA = {
    hipX: -50, hipY: -54, spA: -8, spL: 100, corpoSy: .94, cabX: 20, cabY: 2, cabR: 0, cabYaw: .5, pitch: 0, inclina: 0,
    fLx: 94, fLy: 0, fNx: 102, fNy: 0, pfL: 0, pfN: 0, tLx: 16, tLy: 0, tNx: 24, tNy: 0, paL: 0, paN: 0, cauX: 0, cauY: 0, cauR: 0
  };
  const ROSTO = { olhos: 1, feliz: 0, pupila: 1, bocaB: 0, mast: 0, erva: 0, bigode: 0, sobr: 0, yawM: 0, cabRm: 0,
    oE: 0, oD: 0, cE: 6, cD: 8, gE: .95, gD: .9, kE: 1, kD: 1, oTras: 0 };

  /* ================= montar() ================= */
  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .4 : 1;          // movimento reduzido: o cenário mexe-se menos
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    const flores = FLORES.map(([x, y, t, k], i) => florSVG(i, x, y, t, k));
    svg.innerHTML = `<defs>${defsCoelho('coelho-')}${defsCena()}</defs>
      <rect width="1600" height="900" fill="url(#coelho-ceu)"/><rect width="1600" height="700" fill="url(#coelho-sol)"/>
      ${[0, 1, 2, 3].map(i => nuvemSVG(i, [1, .75, .9, .6][i])).join('')}
      ${colinasSVG()}${pradoSVG()}${cercaSVG()}${arvoreSVG()}
      ${flores.slice(0, 7).join('')}
      ${hortaSVG()}
      ${joaninhaSVG()}
      ${passaroSVG()}
      <g class="cl-habitat">
        <g class="cl-tocaTras">${tocaTrasSVG()}</g>
        <g class="cl-coelho">${coelhoSVG('coelho-')}</g>
        <g class="cl-tocaFrente">${tocaFrenteSVG()}</g>
      </g>
      ${flores.slice(7).join('')}
      ${borboletaSVG(0, '#FFD54A', '#F08A24')}${borboletaSVG(1, '#B9D8FF', '#6A8FD8')}
      ${ervasFrenteSVG()}
      <rect width="1600" height="900" fill="url(#coelho-vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s), qa = s => Array.from(svg.querySelectorAll(s));
    function poe(el, v) { if (el && el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function poeT(lista, v) { for (const e of lista) poe(e, v); }
    function atr(el, nome, v) { const k = '__' + nome; if (el && el[k] !== v) { el[k] = v; el.setAttribute(nome, v); } }

    // sombra da toca (por cima do corpo, por baixo da cabeça) e slot da pata da frente (por cima da cabeça)
    const sombraToca = document.createElementNS(NS, 'path');
    sombraToca.setAttribute('d', ARCO); sombraToca.setAttribute('fill', 'url(#coelho-sombraToca)');
    sombraToca.setAttribute('pointer-events', 'none'); sombraToca.setAttribute('opacity', '0');
    q('.cl-sombraToca').appendChild(sombraToca);
    const sombraCab = sombraToca.cloneNode(); q('.cl-sombraCab').appendChild(sombraCab);   // escurece a cabeça enquanto está lá dentro

    /* --- referências do rig --- */
    const perna = nome => ({ braco: qa(`.cl-${nome}-braco`), antebraco: qa(`.cl-${nome}-antebraco`), pata: qa(`.cl-${nome}-pata`), coxa: qa(`.cl-${nome}-coxa`), canela: qa(`.cl-${nome}-canela`), pe: qa(`.cl-${nome}-pe`), g: q(`.cl-${nome}`) });
    const orelha = l => ({ g: q('.cl-orelha' + l), fora: q('.cl-orFora' + l), dentro: q('.cl-orDentro' + l), veia: q('.cl-orVeia' + l), ponta: q('.cl-orPonta' + l), clip: q('.cl-clipOr' + l), chave: '', geo: null });
    const R = {
      habitat: q('.cl-habitat'), coelho: q('.cl-coelho'), sombra: q('.cl-sombra'), flip: q('.cl-flip'), slotPataF: q('.cl-slotPataF'),
      corpoClip: q('.cl-corpoClip'), cabClip: q('.cl-cabClip'), sombraToca,
      tronco: q('.cl-tronco'), peito: q('.cl-peito'), frente: q('.cl-frente'), cauda: q('.cl-cauda'), caudaIn: q('.cl-cauda-in'),
      cab: q('.cl-cab'), testa: q('.cl-testa'), cara: q('.cl-cara'), focinho: q('.cl-focinho'), queixo: q('.cl-queixo'), nariz: q('.cl-nariz'),
      bochE: q('.cl-bochE'), bochD: q('.cl-bochD'), bocaInt: q('.cl-bocaInt'), dentes: q('.cl-dentes'), erva: q('.cl-erva'), labio: q('.cl-labio'),
      olhoE: q('.cl-olhoE'), olhoD: q('.cl-olhoD'), irisE: q('.cl-irisE'), irisD: q('.cl-irisD'), pupE: q('.cl-pupilaE'), pupD: q('.cl-pupilaD'),
      palp: ['E', 'D'].map(l => ({ s: q('.cl-palpS' + l), i: q('.cl-palpI' + l), c: q('.cl-cil' + l), pe: q('.cl-pest' + l) })),
      sobr: q('.cl-sobr'), bigE: q('.cl-bigE'), bigD: q('.cl-bigD'),
      orE: orelha('E'), orD: orelha('D'),
      fL: perna('fL'), fN: perna('fN'), tL: perna('tL'), tN: perna('tN'),
      tocaTras: q('.cl-tocaTras'), tocaFrente: q('.cl-tocaFrente'), raizes: q('.cl-raizes'), ervasToca: [0, 1, 2, 3].map(i => q('.cl-ervaT' + i)),
      mig: Array.from({ length: 14 }, (_, i) => q('.cl-mig' + i)),
      nuvens: [0, 1, 2, 3].map(i => q('.cl-nuvem' + i)), velas: q('.cl-velas'), copaF: q('.cl-copaF'), copaT: q('.cl-copaT'),
      flores: FLORES.map((_, i) => q('.cl-flor' + i)), floresMonte: [90, 91, 92, 93].map(i => q('.cl-flor' + i)),
      ramas: CENOURAS.map((_, i) => q('.cl-rama' + i)), cens: CENOURAS.map((_, i) => q('.cl-cen' + i)),
      tufos: Array.from({ length: 10 }, (_, i) => q('.cl-tufo' + i)),
      borb: [0, 1].map(i => ({ g: q('.cl-borb' + i), inn: q('.cl-borbIn' + i), aT: q('.cl-asaT' + i), aF: q('.cl-asaF' + i) })),
      passaro: q('.cl-passaro'), ave: q('.cl-ave'), aveAsa: q('.cl-ave-asa'), aveCab: q('.cl-ave-cab'),
      joaninha: q('.cl-joaninha'), joaIn: q('.cl-joaIn'), joaAsas: q('.cl-joaAsas'), joaCasca: q('.cl-joaCasca'), caule: q('.cl-caule')
    };
    // o slot da pata da frente usa a mesma transformação do corpo (fica por cima da cabeça para lavar a cara)
    const flip2 = document.createElementNS(NS, 'g'); R.slotPataF.appendChild(flip2);
    const slotPataN = R.fN.g.parentNode, depoisPataN = R.fN.g.nextSibling;
    const slotTrasN = R.tN.g.parentNode, depoisTrasN = R.tN.g.nextSibling;

    /* --- estado da pose (todos os números que o desenho lê a cada quadro) --- */
    const P = Object.assign({
      x: REPOUSO.x, y: REPOUSO.y, sx: -1, sobe: 0,
      yawG: 0, pitchG: 0, olharX: 0, olharY: 0, somY: 0, somP: 0, boca: 0, somFecha: 0,
      respA: 1, respF: .55, pataFrente: 0, pataTras: 0, sombraToca: 0, sombraCab: 0, oVento: 0, nariz: 1
    }, SENTADO, ROSTO);
    let modo = 'fora';                    // 'fora' | 'indo' | 'dentro' | 'voltando'
    let reagindo = false;
    let tempo = 0, vivo = true;
    const fase = { resp: 0, nariz: 0, mast: 0, cauda: 0 };
    const cabMundo = [0, 0], cabRot = { r: 0 };
    const recorte = { corpo: false, cab: false };
    function recortar(corpo, cab) {
      if (corpo !== recorte.corpo) { recorte.corpo = corpo; if (corpo) R.corpoClip.setAttribute('clip-path', 'url(#coelho-toca)'); else R.corpoClip.removeAttribute('clip-path'); }
      if (cab !== recorte.cab) { recorte.cab = cab; if (cab) R.cabClip.setAttribute('clip-path', 'url(#coelho-toca)'); else R.cabClip.removeAttribute('clip-path'); }
    }

    /* --- impulsos curtos que se somam à pose (orelhas, nariz, cauda, ervas da toca) --- */
    const impulsos = [];
    const IMP = { twE: 0, twD: 0, giE: 0, giD: 0, nar: 0, cau: 0, toca: 0, big: 0 };
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

    /* --- geometria: do referencial do coelho (virado à direita, chão em y=0) para o cenário --- */
    function paraMundo(px, py, X, Y, sxv) {
      const a = P.inclina * RAD, c = Math.cos(a), s = Math.sin(a);
      const qx = px * c - (py + 80) * s, qy = px * s + (py + 80) * c - 80;
      return [X + qx * sxv * ESC, Y + qy * ESC];
    }
    function ik(J, Tg, l1, l2, dobra) {
      let dx = Tg[0] - J[0], dy = Tg[1] - J[1], d = Math.hypot(dx, dy) || .001;
      const dmax = l1 + l2 - .5, dmin = Math.abs(l1 - l2) + 2;
      const dd = limita(d, dmin, dmax);
      dx *= dd / d; dy *= dd / d;
      const base = Math.atan2(dy, dx);
      const a1 = base + dobra * Math.acos(limita((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1));
      const K1 = [J[0] + l1 * Math.cos(a1), J[1] + l1 * Math.sin(a1)];
      const E = [J[0] + dx, J[1] + dy];
      return { a1, a2: Math.atan2(E[1] - K1[1], E[0] - K1[0]), K: K1, E, falta: d - dd };
    }
    const tr = (x, y, r) => `translate(${n(x)},${n(y)}) rotate(${n(r)})`;
    const medida = { fL: 0, fN: 0, tL: 0, tN: 0 };       // quanto falta à pata para chegar ao alvo (testes)
    function pernaFrente(pp, nome, J, fx, fy, pf) {
      const s = ik(J, [fx - 6, fy - 10], BR, AB, 1);
      medida[nome] = s.falta;
      poeT(pp.braco, tr(J[0], J[1], s.a1 / RAD - 90));
      poeT(pp.antebraco, tr(s.K[0], s.K[1], s.a2 / RAD - 90));
      poeT(pp.pata, tr(s.E[0], s.E[1], pf));
    }
    function pernaTras(pp, nome, J, tx, ty, pa) {
      const a = pa * RAD, dedo = [tx, ty - 13], cal = [dedo[0] - PE * Math.cos(a), dedo[1] - PE * Math.sin(a)];
      const s = ik(J, cal, CXA, CN, -1);
      medida[nome] = s.falta;
      poeT(pp.coxa, tr(J[0], J[1], s.a1 / RAD - 90));
      poeT(pp.canela, tr(s.K[0], s.K[1], s.a2 / RAD - 90));
      poeT(pp.pe, tr(s.E[0], s.E[1], Math.atan2(dedo[1] - s.E[1], dedo[0] - s.E[0]) / RAD));
    }

    /* --- orelhas: só se recalcula a forma quando os números mudam --- */
    function desenharOrelha(o, a, c, g, k) {
      const chave = `${n(a)}|${n(c)}|${n3(g)}|${n3(k)}`;
      if (o.chave === chave) return;
      o.chave = chave;
      const geo = orelhaGeo(a, c, g, k); o.geo = geo;
      atr(o.fora, 'd', geo.fora); atr(o.clip, 'd', geo.fora);
      atr(o.dentro, 'd', geo.dentro); atr(o.veia, 'd', geo.brilho);
      atr(o.dentro, 'opacity', n3(limita(g * 1.4, 0, 1)));
      atr(o.ponta, 'cx', n(geo.ponta[0])); atr(o.ponta, 'cy', n(geo.ponta[1]));
    }
    const baseOr = { E: [0, 0], D: [0, 0] };

    /* --- desenhar: lê P e põe as transformações em todas as peças --- */
    let pataNaFrente = false, trasNaFrente = false;
    function desenhar() {
      const sxv = Math.abs(P.sx) < .02 ? (P.sx < 0 ? -.02 : .02) : P.sx;
      const dir = P.sx < 0 ? -1 : 1;
      const X = P.x, Y = P.y + P.sobe;
      const resp = Math.sin(fase.resp) * P.respA;
      const k = P.spL / SPL, a = P.spA * RAD, ca = Math.cos(a), sa = Math.sin(a);
      const sy = P.corpoSy * (1 + .025 * resp);
      const H0 = P.hipX, H1 = P.hipY - resp * 1.1;
      const loc = (lx, ly) => [H0 + lx * k * ca - ly * sy * sa, H1 + lx * k * sa + ly * sy * ca];

      const fT = `translate(${n(X)},${n(Y)}) scale(${n3(sxv * ESC)},${ESC}) rotate(${n(P.inclina)},0,-80)`;
      poe(R.flip, fT); poe(flip2, fT);
      poe(R.tronco, `translate(${n(H0)},${n(H1)}) rotate(${n(P.spA)}) scale(${n3(k)},${n3(sy)})`);

      // patas (IK: os pés ficam onde a pose manda, o resto dobra-se)
      const jF = loc(90, 30), jT = loc(0, 8);
      pernaFrente(R.fL, 'fL', [jF[0] - 4, jF[1] - 2], P.fLx, P.fLy, P.pfL);
      pernaFrente(R.fN, 'fN', jF, P.fNx, P.fNy, P.pfN);
      pernaTras(R.tL, 'tL', [jT[0] - 4, jT[1] - 3], P.tLx, P.tLy, P.paL);
      pernaTras(R.tN, 'tN', jT, P.tNx, P.tNy, P.paN);
      const pc = loc(112, 14);
      poe(R.peito, `translate(${n(pc[0])},${n(pc[1])}) rotate(${n(P.spA * .45 + 8)}) scale(1,${n3(sy)})`);
      const cc = loc(-60 + P.cauX, -14 + P.cauY);
      const abana = Math.sin(fase.cauda) * 2 + IMP.cau;
      poe(R.cauda, `translate(${n(cc[0])},${n(cc[1])}) rotate(${n(P.spA * .5 + P.cauR + abana * 3)})`);
      poe(R.caudaIn, `translate(0,${n(-abana)}) scale(${n3(1 + .03 * Math.sin(fase.cauda * 1.7))})`);
      const querPataF = P.pataFrente > .5;
      if (querPataF !== pataNaFrente) { pataNaFrente = querPataF; if (querPataF) flip2.appendChild(R.fN.g); else slotPataN.insertBefore(R.fN.g, depoisPataN); }
      const querTrasF = P.pataTras > .5;           // a pata de trás passa para a frente da cabeça (coçar a orelha)
      if (querTrasF !== trasNaFrente) { trasNaFrente = querTrasF; if (querTrasF) flip2.insertBefore(R.tN.g, flip2.firstChild); else slotTrasN.insertBefore(R.tN.g, depoisTrasN); }

      // corpo de frente (só a meio das viragens)
      const w = 1 - Math.abs(P.sx);
      if (w > .03) {
        const S = loc(70, 0), m = paraMundo((H0 + S[0]) / 2, 0, X, Y, sxv);
        const alt = limita((-P.hipY - 30) / 40, .7, 1.25);
        atr(R.frente, 'display', 'inline');
        poe(R.frente, `translate(${n(m[0])},${n(Y)}) scale(${n3(Math.min(1, w * 1.3) * ESC)},${n3(ESC * alt)})`);
        atr(R.frente, 'opacity', n3(limita((1 - Math.abs(P.sx)) / .35, 0, 1)));
      } else atr(R.frente, 'display', 'none');
      // o perfil muito estreito (patas como paus) desvanece a meio da viragem; fica o corpo de frente
      const opPerfil = n3(limita((Math.abs(P.sx) - .12) / .3, 0, 1));
      atr(R.flip, 'opacity', opPerfil); atr(flip2, 'opacity', opPerfil);

      // cabeça
      const ancora = loc(104, -30);
      const pn = [ancora[0] + P.cabX, ancora[1] + P.cabY + P.somY + resp * 1.4];
      const hw = paraMundo(pn[0], pn[1], X, Y, sxv);
      cabMundo[0] = hw[0]; cabMundo[1] = hw[1];
      const rot = (P.cabR + P.inclina) * sxv + P.cabRm;
      cabRot.r = rot;
      poe(R.cab, `translate(${n(hw[0])},${n(hw[1])}) rotate(${n(rot)}) scale(${ESC})`);
      const yaw = limita(P.cabYaw * sxv + P.yawM + P.yawG, -1, 1);
      const pit = limita(P.pitch + P.pitchG + P.somP, -1, 1);
      poe(R.testa, `translate(${n(yaw * 3)},${n(pit * 2)})`);
      poe(R.cara, `translate(${n(yaw * 13)},${n(pit * 7)})`);
      poe(R.focinho, `translate(${n(yaw * 19)},${n(pit * 10)})`);
      poe(R.olhoE, `translate(${n(-27)},-6) scale(${n3(1 - Math.max(0, -yaw) * .22 + Math.max(0, yaw) * .04)},1)`);
      poe(R.olhoD, `translate(27,-6) scale(${n3(1 - Math.max(0, yaw) * .22 + Math.max(0, -yaw) * .04)},1)`);
      // orelhas: base na testa, rodam, dobram e viram a concha
      const tras = -dir * P.oTras, vento = -dir * P.oVento;
      baseOr.E = [-22 - yaw * 9, -46 + pit * 4]; baseOr.D = [22 - yaw * 9, -46 + pit * 4];
      poe(R.orE.g, `translate(${n(baseOr.E[0])},${n(baseOr.E[1])})`);
      poe(R.orD.g, `translate(${n(baseOr.D[0])},${n(baseOr.D[1])})`);
      const gE = limita(P.gE + IMP.giE - Math.max(0, -yaw) * .5 - Math.abs(tras) / 140, -1, 1);
      const gD = limita(P.gD + IMP.giD - Math.max(0, yaw) * .5 - Math.abs(tras) / 140, -1, 1);
      desenharOrelha(R.orE, -12 + P.oE + IMP.twE + tras + vento, -(P.cE) + vento * .5, gE, P.kE);
      desenharOrelha(R.orD, 12 + P.oD + IMP.twD + tras + vento, P.cD + vento * .5, gD, P.kD);
      poe(R.sobr, `translate(0,${n(-P.sobr * 4)})`);
      // olhos: pálpebras, pupilas, olhar
      const fecho = limita(1 - P.olhos * (1 - piscar) + P.somFecha, 0, 1);
      R.palp.forEach((e, i) => { const L = palpebras(fecho, P.feliz, i ? 'D' : 'E');
        atr(e.s, 'd', L.sup); atr(e.i, 'd', L.inf); atr(e.c, 'd', L.cil); atr(e.pe, 'opacity', n3(limita(L.abre * 1.5, 0, 1))); });
      const rp = limita(P.pupila, .6, 1.4);
      atr(R.pupE, 'rx', n(9 * rp)); atr(R.pupD, 'rx', n(9 * rp)); atr(R.pupE, 'ry', n(11 * rp)); atr(R.pupD, 'ry', n(11 * rp));
      poe(R.irisE, `translate(${n(P.olharX * 4.5)},${n(P.olharY * 4.5)})`); poe(R.irisD, `translate(${n(P.olharX * 4.5)},${n(P.olharY * 4.5)})`);
      // nariz a tremer, bigodes, boca a mastigar
      const tw = limita(P.nariz * twNariz + IMP.nar, 0, 1.6);
      poe(R.nariz, `translate(0,${n(-tw * 1.8)}) scale(${n3(1 + tw * .07)},${n3(1 - tw * .08)})`);
      const bg = P.bigode + tw * 4 + IMP.big;
      poe(R.bigE, `translate(-24,27) rotate(${n(bg)})`);
      poe(R.bigD, `translate(24,27) scale(-1,1) rotate(${n(bg)})`);
      const ms = P.mast, mx = ms * Math.sin(fase.mast) * 2.6, my = ms * Math.abs(Math.sin(fase.mast)) * 3;
      poe(R.queixo, `translate(${n(mx)},${n(my)})`);
      poe(R.bochE, `translate(${n(mx * .4)},0) scale(${n3(1 + ms * .05 * Math.sin(fase.mast))},1)`);
      poe(R.bochD, `translate(${n(mx * .4)},0) scale(${n3(1 - ms * .05 * Math.sin(fase.mast))},1)`);
      poe(R.labio, `translate(${n(mx * .5)},${n(my * .3)})`);
      const b = limita(Math.max(P.boca, P.bocaB), 0, 1);
      if (b > .02) { atr(R.bocaInt, 'display', 'inline'); atr(R.bocaInt, 'd', bocaD(b)); poe(R.dentes, `translate(0,${n(-b * 3)})`); }
      else { atr(R.bocaInt, 'display', 'none'); poe(R.dentes, 'translate(0,0)'); }
      if (P.erva > .02) {           // erva na boca, que vai encurtando enquanto mastiga
        const L = 46 * P.erva, ox = Math.sin(fase.mast) * 3 * ms;
        atr(R.erva, 'display', 'inline');
        atr(R.erva, 'd', `M2,42 C${n(10 + L * .3)},${n(46 + ox)} ${n(14 + L * .6)},${n(54 - ox)} ${n(16 + L)},${n(58 + L * .2)} M4,43 C${n(-6 - L * .2)},${n(48)} ${n(-10 - L * .4)},${n(56 + ox)} ${n(-14 - L * .55)},${n(62)}`);
      } else atr(R.erva, 'display', 'none');

      // sombra no chão (some quando o coelho está dentro da toca)
      const xs = X + sxv * ESC * (P.hipX + 30), alto = limita(-P.sobe / 160, 0, 1);
      const dentroToca = X > T.plano + 40 && recorte.corpo;
      const larg = (Math.abs(Math.max(P.fNx, P.fLx) - Math.min(P.tNx, P.tLx) + 80) / 2 + 40) * ESC * (.55 + .45 * Math.abs(P.sx)) * (1 - alto * .4);
      atr(R.sombra, 'opacity', dentroToca ? '0' : n3(1 - alto * .7));
      poe(R.sombra, `translate(${n(xs)},${CHAO}) scale(${n3(larg / 120)},1)`);
      atr(R.sombraToca, 'opacity', n3(limita(P.sombraToca, 0, 1)));
      atr(sombraCab, 'opacity', n3(limita(P.sombraCab, 0, 1)));
    }
    // posição da ponta de uma orelha no cenário (para a borboleta pousar)
    function pontaOrelha(lado) {
      const o = lado === 'E' ? R.orE : R.orD, b = baseOr[lado];
      if (!o.geo) return [cabMundo[0], cabMundo[1] - 150];
      const lx = b[0] + o.geo.ponta[0] * .9, ly = b[1] + o.geo.ponta[1] * .9;
      const r = cabRot.r * RAD, c = Math.cos(r), s = Math.sin(r);
      return [cabMundo[0] + (lx * c - ly * s) * ESC, cabMundo[1] + (lx * s + ly * c) * ESC];
    }

    /* --- piscar, nariz, olhar, tremores de orelhas --- */
    let piscar = 0, twNariz = 0;
    const pisca = { t: aleat(1500, 3500), f: -1, duplo: false };
    function atualizarPiscar(dt) {
      if (pisca.f < 0) {
        pisca.t -= dt; piscar = 0;
        if (pisca.t <= 0) { pisca.f = 0; pisca.duplo = !pisca.duplo && Math.random() < .25; }
        return;
      }
      pisca.f += dt;
      const u = pisca.f / 170;
      piscar = u < .4 ? esai(u / .4) : 1 - eseno(limita((u - .4) / .6, 0, 1));
      if (u >= 1) { piscar = 0; pisca.f = -1; pisca.t = pisca.duplo ? 120 : aleat(2000, 6000) * (modo === 'dentro' ? 1.3 : 1); }
    }
    const nariz = { t: 300, f: 0, dur: 0, rapido: false };
    function atualizarNariz(dt) {        // o nariz treme aos bocadinhos (rajadas de 3–6 tremidelas)
      if (nariz.dur > 0) {
        nariz.f += dt; nariz.dur -= dt;
        twNariz = Math.pow(Math.abs(Math.sin(nariz.f / (nariz.rapido ? 38 : 58))), 1.5) * Math.min(1, nariz.dur / 80);
        if (nariz.dur <= 0) { twNariz = 0; nariz.t = nariz.rapido ? aleat(80, 300) : aleat(500, 2200); }
      } else {
        nariz.t -= dt;
        if (nariz.t <= 0) { nariz.dur = aleat(380, 900); nariz.f = 0; }
      }
    }
    const olhar = { foco: null, t: 0, ax: 0, ay: 0, rapido: false };
    function atualizarOlhar(dt) {
      let ax, ay, ayaw = 0, apit = 0;
      if (olhar.foco) {
        const f = olhar.foco(), dx = f[0] - cabMundo[0], dy = f[1] - cabMundo[1];
        ax = limita(dx / 220, -1, 1); ay = limita(dy / 220, -1, 1);
        ayaw = limita(limita(dx / 400, -.85, .85) - (P.cabYaw * P.sx + P.yawM), -1.2, 1.2);
        apit = limita(dy / 380, -.45, .55);
      } else {
        olhar.t -= dt;
        if (olhar.t <= 0) {
          olhar.t = aleat(700, 2600);
          if (Math.random() < .45) { olhar.ax = 0; olhar.ay = 0; } else { olhar.ax = aleat(-.6, .6); olhar.ay = aleat(-.35, .3); }
        }
        ax = olhar.ax; ay = olhar.ay;
      }
      const kO = 1 - Math.exp(-dt / 55), kC = 1 - Math.exp(-dt / (olhar.rapido ? 80 : 230));
      P.olharX += (ax - P.olharX) * kO; P.olharY += (ay - P.olharY) * kO;
      P.yawG += (ayaw - P.yawG) * kC; P.pitchG += (apit - P.pitchG) * kC;
    }
    const tiques = { orelha: aleat(1800, 4000), giro: aleat(2500, 6000) };
    function atualizarTiques(dt) {
      tiques.orelha -= dt; tiques.giro -= dt;
      if (tiques.orelha <= 0) {             // uma orelha estremece
        tiques.orelha = aleat(1800, 5000);
        const kk = Math.random() < .5 ? 'twE' : 'twD';
        impulso(kk, aleat(-9, 9), aleat(200, 300));
        if (Math.random() < .3) impulso(kk, aleat(-6, 6), 240);
      }
      if (tiques.giro <= 0) {               // uma orelha roda para trás e volta (ouviu alguma coisa)
        tiques.giro = aleat(2500, 7000);
        impulso(Math.random() < .5 ? 'giE' : 'giD', -aleat(.8, 1.5), aleat(700, 1300));
      }
    }

    /* --- tarefas: geradores que avançam com o dt do relógio (uma por faixa; lançar outra na mesma faixa substitui) --- */
    const faixas = new Map();
    function lancar(nome, gen, fim) {
      if (!vivo) return;
      if (nome === 'corpo') { olhar.foco = null; olhar.rapido = false; nariz.rapido = false; }
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
    function* depois(ms, g) { yield* espera(ms); yield* g; }
    // transição de pose em que cada pata que muda de sítio se levanta e pousa (nunca escorrega pelo chão)
    function* transicao(alvo, ms, ease = eio) {
      const ini = {}; for (const k in alvo) ini[k] = P[k];
      const pes = ['tN', 'fL', 'tL', 'fN'].filter(k => alvo[k + 'x'] != null && Math.abs(alvo[k + 'x'] - P[k + 'x']) > 5 && (P[k + 'y'] || 0) > -4 && (alvo[k + 'y'] || 0) > -4);
      yield* durante(ms, u => {
        const e = ease(u);
        for (const k in alvo) P[k] = ini[k] + (alvo[k] - ini[k]) * e;
        pes.forEach((k, i) => {
          const a = pes.length > 1 ? i / (pes.length - 1) * .35 : 0, v = limita((u - a) / .65, 0, 1);
          P[k + 'x'] = lerp(ini[k + 'x'], alvo[k + 'x'], eseno(v));
          P[k + 'y'] = lerp(ini[k + 'y'], alvo[k + 'y'] || 0, v) - (k[0] === 'f' ? 14 : 12) * sino(v);
        });
      });
    }
    // valores por chaves de tempo [[u, v], …] com abrandar entre chaves
    function kf(lista, u) {
      if (u <= lista[0][0]) return lista[0][1];
      for (let i = 1; i < lista.length; i++) if (u <= lista[i][0]) { const [u0, v0] = lista[i - 1], [u1, v1] = lista[i]; return lerp(v0, v1, eseno((u - u0) / (u1 - u0))); }
      return lista[lista.length - 1][1];
    }

    /* --- migalhas de terra --- */
    const migalhas = R.mig.map(el => ({ el, vivo: false, x: 0, y: 0, vx: 0, vy: 0, t: 0 }));
    function largarTerra(x, y, quantas, forca = 1) {
      let k = 0;
      for (const m of migalhas) {
        if (m.vivo) continue;
        m.vivo = true; m.x = x + aleat(-20, 20); m.y = y + aleat(-6, 4); m.vx = aleat(-.18, .18) * forca; m.vy = -aleat(.18, .42) * forca; m.t = 0;
        atr(m.el, 'display', 'inline');
        if (++k >= quantas) break;
      }
    }
    function atualizarMigalhas(dt) {
      for (const m of migalhas) {
        if (!m.vivo) continue;
        m.t += dt; m.vy += .0012 * dt; m.x += m.vx * dt; m.y += m.vy * dt;
        if (m.y > CHAO + 12 || m.t > 1600) { m.vivo = false; atr(m.el, 'display', 'none'); continue; }
        poe(m.el, `translate(${n(m.x)},${n(m.y)})`);
      }
    }

    /* --- salto de coelho (um ciclo): antecipação, as patas de trás empurram juntas, as da frente pousam primeiro,
           e as de trás passam por fora e pousam à frente; corpo estica no ar e encolhe ao aterrar; orelhas atrasam-se.
           Os pés estão presos ao mundo: só mudam de sítio no ar. Começa e acaba na pose QUATRO. --- */
    function* pulo(Lh, ms, alto = 1) {
      const dir = P.sx < 0 ? -1 : 1, x0 = P.x;
      const f0 = { L: QUATRO.fLx, N: QUATRO.fNx }, t0 = { L: QUATRO.tLx, N: QUATRO.tNx };
      yield* durante(ms, u => {
        const s = eio(janela(u, .1, .88)), d = Lh * s;
        P.x = x0 + dir * d * ESC;
        // patas da frente: levantam-se aos 20 %, pousam primeiro (55 %)
        const vf = janela(u, .2, .55), fw = lerp(0, Lh, eio(vf)), fa = 30 * sino(vf) * alto;
        for (const l of ['L', 'N']) { P['f' + l + 'x'] = f0[l] + fw - d + (l === 'L' ? -4 : 0) * sino(vf); P['f' + l + 'y'] = -fa; P['pf' + l] = 30 * sino(vf) - 10 * sino(janela(u, .5, .65)); }
        // patas de trás: o calcanhar levanta (empurrão), voam esticadas para trás e passam à frente (pousam aos 84 %)
        const vt = janela(u, .3, .84);
        const tw_ = vt < .4 ? .06 * vt / .4 : .06 + .94 * eio((vt - .4) / .6);
        const pa = u < .3 ? 75 * eio(janela(u, .1, .3)) : vt < .35 ? lerp(75, 140, eseno(vt / .35)) : lerp(140, 0, eio((vt - .35) / .65));
        for (const l of ['L', 'N']) { P['t' + l + 'x'] = t0[l] + Lh * tw_ - d; P['t' + l + 'y'] = -34 * sino(vt) * alto; P['pa' + l] = pa; }
        P.hipY = kf([[0, -64], [.12, -56], [.3, -96], [.46, -64 - 66 * alto], [.62, -104], [.78, -80], [.9, -60], [1, -64]], u);
        P.spA = kf([[0, -12], [.12, -6], [.3, -26], [.46, -10], [.6, 12], [.76, 4], [.9, -8], [1, -12]], u);
        P.spL = kf([[0, 104], [.12, 98], [.36, 124], [.5, 120], [.7, 92], [.86, 98], [1, 104]], u);
        P.corpoSy = kf([[0, 1], [.12, 1.05], [.36, .94], [.6, .98], [.76, 1.06], [1, 1]], u);
        P.cabY = kf([[0, -6], [.12, 4], [.36, -18], [.6, -2], [.8, 4], [1, -6]], u);
        P.pitch = kf([[0, .1], [.12, .25], [.36, -.15], [.6, .25], [1, .1]], u);
        P.oVento = kf([[0, 0], [.25, 10], [.45, 36], [.66, 22], [.86, -8], [1, 0]], u) * alto;
        P.cauY = kf([[0, 0], [.4, -8], [.8, 4], [1, 0]], u);
      });
      P.oVento = 0;
    }
    function* pulos(xFim, msPulo = 440) {
      const dist = Math.abs(xFim - P.x);
      if (dist < 4) return;
      const nP = Math.max(1, Math.round(dist / (150 * ESC))), Lh = dist / ESC / nP;
      for (let i = 0; i < nP; i++) yield* pulo(Lh, msPulo);
    }
    // vira-se: a cabeça primeiro; o corpo roda em dois saltinhos (no meio fica de frente), sem patas a escorregar
    function* virar(novo, ms = 520) {
      const s0 = P.sx;
      olhar.rapido = true;
      yield* tw({ yawM: novo * .55 - P.cabYaw * s0 }, 160, esai);
      yield* durante(ms, u => {
        const h = u < .5 ? u * 2 : (u - .5) * 2;
        P.sobe = -16 * sino(h);
        P.sx = u < .5 ? lerp(s0, 0, eseno(janela(u, .04, .44))) : lerp(0, novo, eseno(janela(u, .56, .96)));   // só roda no ar
        P.yawM = lerp(novo * .55 - P.cabYaw * s0, 0, eseno(u));
        P.oVento = 8 * sino(h);
      });
      P.sobe = 0; P.yawM = 0; P.oVento = 0; P.sx = novo;
      olhar.rapido = false;
    }

    /* --- comportamentos (fora da toca, sentado virado para a esquerda) --- */
    function* recompor(ms = 380) {
      if (P.pataFrente) { yield* tw({ fNx: SENTADO.fNx, fNy: -30, pfN: 0, fLx: SENTADO.fLx, fLy: -30, pfL: 0 }, 200); P.pataFrente = 0; }
      if (P.tNy < -4 || P.tLy < -4) { yield* tw({ tNx: SENTADO.tNx, tNy: -8, paN: 0, tLx: SENTADO.tLx, tLy: -8, paL: 0 }, 180); P.pataTras = 0; }
      P.pataTras = 0; P.respA = 1;
      yield* transicao(Object.assign({}, SENTADO, { sobe: 0, oVento: 0, cabRm: 0, mast: 0, erva: 0, bocaB: 0, oTras: 0, cE: ROSTO.cE, cD: ROSTO.cD, kE: 1, kD: 1 }), ms);
    }
    function* lavarCara() {
      yield* transicao(Object.assign({}, SENTADO, { hipY: -68, spA: -66, cabY: -34 }), 380);
      P.pataFrente = 1;
      const cx = 52, cy = -156;
      yield* tw({ fNx: cx, fNy: cy, pfN: -40, fLx: cx - 6, fLy: cy + 6, pfL: -40, olhos: .2, pitch: .25, oTras: 10 }, 380);
      for (let i = 0; i < 5; i++) {               // esfrega o focinho com as duas patas
        yield* tw({ fNy: cy - 30, fNx: cx - 4, fLy: cy - 24, cabR: -4, olhos: 0 }, 170);
        yield* tw({ fNy: cy, fNx: cx + 2, fLy: cy + 6, cabR: 2 }, 170);
      }
      // puxa a orelha para baixo com as patas e lava-a
      yield* juntos(tw({ cabR: 18, cE: 70, kE: .92, gE: .4, fNy: cy - 50, fNx: cx - 10, fLy: cy - 40 }, 420), tw({ olhos: .3 }, 300));
      for (let i = 0; i < 3; i++) { yield* tw({ fNy: cy - 30, cE: 90, cabR: 22 }, 220); yield* tw({ fNy: cy - 52, cE: 70, cabR: 18 }, 220); }
      yield* tw({ fNx: SENTADO.fNx, fNy: -40, pfN: 10, fLx: SENTADO.fLx, fLy: -30, pfL: 10, cabR: 0, olhos: 1, pitch: 0, oTras: 0, gE: ROSTO.gE, kE: 1 }, 380);
      impulso('twE', -16, 700, 'onda');
      yield* juntos(tw({ cE: ROSTO.cE }, 500, esai), (function* () { yield* tw({ fNy: 0, fLy: 0, pfN: 0, pfL: 0 }, 160, esai); P.pataFrente = 0; })());
      yield* transicao(Object.assign({}, SENTADO), 300);
    }
    function* alerta() {
      nariz.rapido = true;
      yield* juntos(transicao(Object.assign({}, ALERTA), 520, eio), tw({ oE: 4, oD: -4, gE: 1, gD: 1, kE: 1.06, kD: 1.06, pupila: 1.25, cE: 0, cD: 0 }, 400));
      for (const alvo of [PT.horta, PT.moinho, PT.ceu]) { olhar.foco = () => alvo; yield* espera(aleat(700, 1100)); impulso(Math.random() < .5 ? 'giE' : 'giD', -1.2, 600); }
      olhar.foco = null; nariz.rapido = false;
      yield* juntos(transicao(Object.assign({}, SENTADO), 560, eio), tw({ oE: 0, oD: 0, gE: ROSTO.gE, gD: ROSTO.gD, kE: 1, kD: 1, pupila: 1, cE: ROSTO.cE, cD: ROSTO.cD }, 500));
    }
    function* comer() {                // baixa-se, apanha uma erva e mastiga (a erva vai encurtando)
      yield* transicao(Object.assign({}, SENTADO, COMER), 520);
      nariz.rapido = true;
      yield* espera(300);
      yield* tw({ bocaB: .3 }, 120); P.erva = 1; yield* tw({ bocaB: 0, cabY: COMER.cabY - 14, pitch: .35 }, 160);
      nariz.rapido = false;
      yield* tw({ mast: 1, olhos: .7, cabY: 10, pitch: .15, cabX: 34 }, 380);
      yield* durante(2400, (u, t) => { fase.mast = t / 1000 * 2 * PI * 4.2; P.erva = 1 - u; });
      yield* tw({ mast: 0, erva: 0, olhos: 1 }, 200);
      impulso('nar', 1, 300); impulso('big', 6, 300);
      yield* transicao(Object.assign({}, SENTADO), 420);
    }
    function* bater() {                // bate com as patas de trás no chão («pum!»)
      yield* juntos(transicao(Object.assign({}, QUATRO, { hipY: -70, spA: -16 }), 380), tw({ oE: 6, oD: -6, gE: 1, gD: 1, pupila: 1.25, oTras: -6 }, 300));
      for (let i = 0; i < 2; i++) {
        yield* tw({ tNy: -14, tLy: -14, paN: -16, paL: -16, hipY: -80, spA: -6 }, 160, esai);
        yield* tw({ tNy: 0, tLy: 0, paN: 0, paL: 0, hipY: -66, spA: -14 }, 70, eentra);
        largarTerra(P.x + (P.sx < 0 ? -1 : 1) * ESC * (QUATRO.tNx - 40), CHAO - 4, 4, .7);
        impulso('twE', -10, 260); impulso('twD', 10, 260); impulso('cau', 4, 300);
        yield* espera(260);
      }
      yield* juntos(transicao(Object.assign({}, SENTADO), 460), tw({ oE: 0, oD: 0, gE: ROSTO.gE, gD: ROSTO.gD, pupila: 1, oTras: 0 }, 400));
    }
    function* deitar() {               // deita-se esticado, com as orelhas para trás e os olhos a fechar
      yield* juntos(transicao(Object.assign({}, DEITADO), 900, eio), tw({ oTras: 62, cE: 16, cD: 18, gE: .5, gD: .45, respF: .4 }, 800));
      yield* tw({ olhos: .35, feliz: .3 }, 600);
      yield* espera(900);
      yield* juntos(tw({ bocaB: .7, olhos: 0 }, 420), tw({ cabY: DEITADO.cabY - 8, pitch: -.1 }, 420));
      yield* tw({ bocaB: 0 }, 280); yield* espera(1200);
      yield* tw({ olhos: .1 }, 500); yield* espera(800);
      yield* tw({ olhos: 1, feliz: 0 }, 300);
      impulso('twD', -8, 300);
      yield* juntos(transicao(Object.assign({}, SENTADO), 700, eio), tw({ oTras: 0, cE: ROSTO.cE, cD: ROSTO.cD, gE: ROSTO.gE, gD: ROSTO.gD, respF: .55 }, 600));
    }
    function* binky(forca = 1) {       // salto de alegria com uma torção no ar
      yield* transicao(Object.assign({}, QUATRO), 200);
      yield* tw({ hipY: -54, corpoSy: 1.06, cabY: 4 }, 110, esai);
      const lado = Math.random() < .5 ? -1 : 1;
      yield* durante(620, u => {
        P.sobe = -120 * forca * 4 * u * (1 - u);
        const v = sino(u);
        P.inclina = lado * 22 * Math.sin(u * PI * 2) * forca;
        P.hipY = lerp(-54, -90, v); P.corpoSy = lerp(1.06, .95, v); P.spA = -12 - 10 * Math.sin(u * PI * 2);
        P.tNx = QUATRO.tNx - 70 * v; P.tLx = QUATRO.tLx - 64 * v; P.paN = 150 * v; P.paL = 140 * v; P.tNy = -10 * v; P.tLy = -10 * v;
        P.fNy = -20 * v; P.fLy = -16 * v; P.pfN = 30 * v; P.pfL = 30 * v;
        P.oVento = 30 * Math.sin(u * PI * 3) * forca; P.cabRm = 14 * Math.sin(u * PI * 2) * lado * forca;
        P.feliz = Math.max(P.feliz, v);
      });
      P.sobe = 0; P.inclina = 0; P.cabRm = 0;
      impulso('twE', 14, 500, 'onda'); impulso('twD', -14, 500, 'onda'); impulso('cau', 5, 400);
      yield* juntos(tw({ hipY: -58, corpoSy: 1.07, oVento: 0, tNx: QUATRO.tNx, tLx: QUATRO.tLx, paN: 0, paL: 0, tNy: 0, tLy: 0, fNy: 0, fLy: 0, pfN: 0, pfL: 0 }, 110, esai));
      yield* tw({ hipY: QUATRO.hipY, corpoSy: 1 }, 160);
    }
    function* binkyComp() { yield* binky(1); yield* tw({ feliz: 0 }, 300); yield* transicao(Object.assign({}, SENTADO), 380); }
    function* cocarOrelha() {          // coça a orelha com a pata de trás
      yield* transicao(Object.assign({}, SENTADO, { spA: -58, hipY: -60, cabR: 0 }), 300);
      yield* tw({ tNy: -20, paN: -20 }, 140);
      P.pataTras = 1;
      const lado = P.sx < 0 ? 'D' : 'E';           // a orelha do lado das costas
      yield* juntos(tw({ tNx: -14, tNy: -232, paN: -84, cabR: -12, cabX: 26, olhos: .15, ['o' + lado]: lado === 'E' ? -14 : 14, ['c' + lado]: 30 }, 380), tw({ hipX: -34, spA: -54 }, 300));
      yield* durante(1400, u => { const o = Math.sin(u * PI * 22); P.tNy = -232 - 12 * o; P.paN = -84 + 8 * o; P.cabRm = 2.4 * o; P.respA = 0; });
      P.cabRm = 0; P.respA = 1;
      yield* tw({ tNx: SENTADO.tNx, tNy: -24, paN: -10, cabR: 0, cabX: SENTADO.cabX, olhos: 1, oE: 0, oD: 0, cE: ROSTO.cE, cD: ROSTO.cD, hipX: SENTADO.hipX }, 360);
      P.pataTras = 0;
      yield* tw({ tNy: 0, paN: 0 }, 140, esai);
      impulso('twD', -12, 600, 'onda');
      yield* transicao(Object.assign({}, SENTADO), 260);
    }
    function* olharEmVolta() {
      const alvos = [PT.arvore, PT.moinho, PT.toca, PT.horta, PT.cerca].sort(() => Math.random() - .5).slice(0, 3);
      for (const a of alvos) {
        olhar.foco = () => a;
        const lado = a[0] < cabMundo[0] ? 'giE' : 'giD';
        impulso(lado, -1.4, 900);
        yield* tw({ pupila: 1.15 }, 240);
        yield* espera(aleat(800, 1300));
      }
      olhar.foco = null;
      yield* tw({ pupila: 1 }, 320);
    }
    function* orelhaCai() {            // uma orelha dobra-se, ele inclina a cabeça e volta a pô-la de pé
      const l = Math.random() < .5 ? 'E' : 'D';
      yield* juntos(tw({ ['c' + l]: 95, ['g' + l]: .55, cabR: l === 'E' ? -10 : 10 }, 500, eio), tw({ pupila: 1.2 }, 300));
      yield* espera(900);
      impulso('nar', 1.2, 400);
      yield* tw({ ['c' + l]: -6, cabR: 0 }, 260, esai);
      impulso('tw' + l, l === 'E' ? -14 : 14, 700, 'onda');
      yield* tw({ ['c' + l]: ROSTO['c' + l], ['g' + l]: ROSTO['g' + l], pupila: 1 }, 500);
    }
    // antes de cada comportamento: orelhas, cara e corpo no sítio (se alguma coisa ficou a meio)
    function* repor() {
      const rosto = {}; let muda = false;
      for (const k in ROSTO) if (Math.abs(P[k] - ROSTO[k]) > .02) { rosto[k] = ROSTO[k]; muda = true; }
      const corpo = P.pataFrente || P.pataTras || P.tNy < -2 || P.fNy < -2 || Math.abs(P.hipY - SENTADO.hipY) > 3 || Math.abs(P.spA - SENTADO.spA) > 3;
      if (muda || corpo) yield* juntos(tw(rosto, 240), corpo ? recompor(300) : espera(0));
    }
    const COMPORTAMENTOS = { lavarCara, alerta, comer, bater, deitar, binky: binkyComp, cocarOrelha, olharEmVolta, orelhaCai };
    let ultimoComp = null;
    function* cicloFora() {
      for (;;) {
        yield* espera(aleat(4000, 9000));
        let nome; do nome = escolhe(Object.keys(COMPORTAMENTOS)); while (nome === ultimoComp);
        ultimoComp = nome;
        yield* repor();
        yield* COMPORTAMENTOS[nome]();
      }
    }

    /* --- reações ao toque --- */
    function* reacaoFora() {
      reagindo = true;
      const rosto = tw({ oE: -4, oD: 4, gE: 1, gD: 1, kE: 1.06, kD: 1.06, cE: 2, cD: 2, feliz: 1, olhos: 1, pupila: 1.2, oTras: 0, mast: 0, erva: 0, bocaB: 0 }, 90, esai);
      const corpo = (function* () {
        if (P.pataFrente || P.tNy < -4 || P.sobe < -2 || Math.abs(P.spA - SENTADO.spA) > 14 || Math.abs(P.hipY - SENTADO.hipY) > 12) yield* recompor(260);
        yield* binky(.7);
        yield* transicao(Object.assign({}, SENTADO), 300);
        olhar.foco = () => [cabMundo[0] + (P.sx < 0 ? -40 : 40), cabMundo[1] + 60];
        impulso('nar', 1.4, 500);
        yield* tw({ cabR: -10 }, 220); yield* tw({ cabR: 8 }, 300); yield* tw({ cabR: 0 }, 240);
        olhar.foco = null;
      })();
      yield* juntos(rosto, corpo);
      reagindo = false;
      yield* tw(Object.assign({}, ROSTO), 450);
    }
    function* reacaoDentro() {
      yield* juntos(tw({ cabY: ESPREITA.cabY - 34, cabX: ESPREITA.cabX - 6, oE: -4, oD: 4, gE: 1, gD: 1, kE: 1.08, kD: 1.08, cE: 0, cD: 0, feliz: 1, olhos: 1, pupila: 1.2, oTras: 0 }, 110, esai),
        tw({ sobe: -10 }, 110, esai));
      impulso('twE', -10, 500, 'onda'); impulso('twD', 10, 500, 'onda'); impulso('toca', 1, 700, 'mola');
      olhar.foco = () => [cabMundo[0] - 120, cabMundo[1] + 80];
      yield* tw({ sobe: 0 }, 160, esai);
      for (let i = 0; i < 2; i++) { yield* tw({ cabR: -8 }, 160); yield* tw({ cabR: 8 }, 160); }
      yield* tw({ cabR: 0 }, 140);
      impulso('nar', 1.4, 600);
      yield* espera(500);
      olhar.foco = null;
      yield* tw(Object.assign({}, ROSTO, { cabY: ESPREITA.cabY, cabX: ESPREITA.cabX, cabR: 0 }), 500);
    }
    function* cicloDentro() {          // dentro da toca: respira, mexe as orelhas, pisca devagar, às vezes esconde-se e volta a espreitar
      for (;;) {
        yield* espera(aleat(1800, 3600));
        const r = Math.random();
        if (r < .3) {
          yield* juntos(tw({ cabY: ESPREITA.cabY + 40, kE: .82, kD: .82, oTras: 22, olhos: .6 }, 300, eentra));
          impulso('toca', .8, 600, 'mola');
          yield* espera(aleat(500, 900));
          impulso('nar', 1.5, 500);
          yield* juntos(tw({ cabY: ESPREITA.cabY, kE: 1, kD: 1, oTras: 0, olhos: 1 }, 260, esai));
          impulso('twE', -10, 500, 'onda'); impulso('twD', 10, 500, 'onda');
        } else if (r < .55) { impulso(Math.random() < .5 ? 'giE' : 'giD', -1.5, 1200); yield* espera(600); }
        else if (r < .75) { yield* tw({ olhos: .25 }, 500, eseno); yield* espera(aleat(500, 900)); yield* tw({ olhos: 1 }, 400, eseno); }
        else { olhar.foco = () => escolhe([PT.arvore, PT.horta, PT.ceu]); const f = olhar.foco(); olhar.foco = () => f; yield* espera(1200); olhar.foco = null; }
      }
    }

    /* --- ida à toca: vira-se (cabeça primeiro), salta até à porta, cheira, mergulha de cabeça,
           vira-se lá dentro e fica a espreitar com a cabeça e as orelhas de fora --- */
    function* idaAToca() {
      modo = 'indo'; reagindo = false;
      if (P.pataFrente || P.pataTras || P.tNy < -4 || P.sobe < -2) yield* recompor(200);
      olhar.foco = () => PT.toca; olhar.rapido = true;
      yield* juntos(tw(Object.assign({}, ROSTO, { pupila: 1.2, gE: 1, gD: 1 }), 140, esai), transicao(Object.assign({}, QUATRO), 240));
      olhar.foco = null;
      yield* virar(1, 460);
      olhar.foco = () => PT.toca;
      yield* pulos(T.xPorta, 440);
      // cheira a entrada
      nariz.rapido = true;
      yield* tw({ cabY: 14, cabX: 34, pitch: .35, oTras: -8, hipY: -60 }, 200);
      impulso('nar', 1.5, 300);
      yield* espera(150);
      nariz.rapido = false; olhar.foco = null;
      // mergulha: agacha, orelhas para trás, e entra de cabeça (a frente do monte tapa o que já entrou)
      yield* tw({ hipY: -52, spA: -4, corpoSy: 1.05, oTras: 78, cE: 4, cD: 4, cabY: 6, pitch: .2 }, 130, esai);
      recortar(true, true);
      const x0 = P.x, x1 = T.xDentro;
      yield* durante(520, u => {
        P.x = lerp(x0, x1, eio(u));
        const v = sino(u);
        P.sombraToca = janela(u, .2, .7); P.sombraCab = janela(u, .25, .7);
        P.hipY = -52 - 26 * v; P.spA = -4 + 16 * u; P.spL = 104 + 18 * v; P.corpoSy = lerp(1.05, .92, v);
        P.fNx = lerp(QUATRO.fNx, 140, v); P.fLx = lerp(QUATRO.fLx, 132, v); P.fNy = -12 * v; P.fLy = -10 * v;
        P.tNx = QUATRO.tNx - 50 * v; P.tLx = QUATRO.tLx - 46 * v; P.paN = 120 * v; P.paL = 110 * v; P.tNy = -8 * v; P.tLy = -8 * v;
        P.cauY = -8 * v;
      });
      largarTerra(T.arcoX - 30, CHAO - 10, 8, 1.1);
      impulso('toca', 1.6, 900, 'mola');
      Object.assign(P, { spL: 104, corpoSy: 1, fNy: 0, fLy: 0, tNy: 0, tLy: 0, paN: 0, paL: 0, cauY: 0 });
      // lá dentro: dá a volta e prepara-se para espreitar (cabeça baixa, ainda recortada)
      yield* juntos(virar(-1, 400), tw(Object.assign({}, ESPREITA, { cabY: ESPREITA.cabY + 44, cabYaw: ESPREITA.cabYaw, oTras: 0, kE: .9, kD: .9, cE: 2, cD: 2, x: T.xEspreita, sombraToca: 1 }), 440));
      // espreita: a cabeça sobe e as orelhas saem de cima do monte
      yield* tw({ cabY: ESPREITA.cabY + 6, sombraCab: .45 }, 240, esai);
      recortar(true, false);
      impulso('twE', -16, 600, 'onda'); impulso('twD', 16, 600, 'onda'); impulso('toca', .9, 600, 'mola');
      largarTerra(T.arcoX - 40, CHAO - 26, 4, .6);
      yield* juntos(tw({ cabY: ESPREITA.cabY, kE: 1, kD: 1, cE: ROSTO.cE, cD: ROSTO.cD, feliz: .4, sombraCab: 0 }, 260, esai), tw({ respF: .42 }, 260));
      impulso('nar', 1.2, 400);
      lancar("rosto", tw({ feliz: 0 }, 400));
      modo = 'dentro';
    }
    /* --- volta: as orelhas saem primeiro, salta para fora, sacode-se da terra e regressa ao sítio --- */
    function* saidaDaToca() {
      modo = 'voltando'; reagindo = false;
      olhar.foco = () => [REPOUSO.x - 200, REPOUSO.y - 180];
      yield* tw({ kE: 1.12, kD: 1.12, gE: 1, gD: 1, cE: 0, cD: 0, oE: -4, oD: 4, olhos: 1, feliz: 0, cabY: ESPREITA.cabY - 10, pupila: 1.15 }, 260, esai);
      impulso('nar', 1.4, 300);
      yield* tw(Object.assign({}, QUATRO, { kE: 1, kD: 1, cE: ROSTO.cE, cD: ROSTO.cD }), 200);
      const x0 = P.x;
      yield* juntos(pulo((x0 - 770) / ESC, 480), durante(480, u => { P.sombraToca = 1 - janela(u, .2, .8); }));
      recortar(false, false); P.sombraToca = 0;
      largarTerra(T.arcoX - 60, CHAO - 10, 6, 1);
      impulso('toca', 1.2, 700, 'mola');
      // sacode-se
      yield* durante(620, u => {
        const v = sino(u), o = Math.sin(u * PI * 9);
        P.cabRm = 16 * o * v; P.inclina = 4 * o * v; P.oVento = 26 * o * v; P.olhos = 1 - .8 * v; P.hipY = QUATRO.hipY - 6 * v;
        if (Math.random() < .12) largarTerra(P.x + aleat(-60, 60), CHAO - aleat(60, 120), 1, .8);
      });
      Object.assign(P, { cabRm: 0, inclina: 0, oVento: 0, olhos: 1 });
      olhar.foco = null;
      yield* pulos(REPOUSO.x, 440);
      P.x = REPOUSO.x;
      yield* juntos(transicao(Object.assign({}, SENTADO), 340), tw(Object.assign({}, ROSTO, { respF: .55 }), 340));
      modo = 'fora';
    }

    /* --- «som»: o coelho não tem som, mas se o motor chamar, mexe o nariz e a boca --- */
    function* mexerBoca(ms) {
      yield* durante(ms, u => {
        P.boca = .35 * Math.abs(Math.sin(u * PI * Math.max(2, ms / 160)));
        P.somY = -6 * sino(u); P.somP = -.15 * sino(u);
      });
      P.boca = 0; P.somY = 0; P.somP = 0;
    }

    /* --- cenário vivo --- */
    const borbs = [
      { cx: 520, cy: 420, ax: 250, ay: 110, f1: .11, f2: .23, ph: 0, x: 0, y: 0, px: 0, livre: true, bate: 0 },
      { cx: 1180, cy: 380, ax: 190, ay: 120, f1: .09, f2: .19, ph: 2.1, x: 0, y: 0, px: 0, livre: true, bate: 0 }
    ];
    function posBorb(b, t) { return [b.cx + b.ax * Math.sin(t * b.f1 * 2 * PI + b.ph) + 30 * Math.sin(t * 1.3 + b.ph), b.cy + b.ay * Math.sin(t * b.f2 * 2 * PI + b.ph * 1.3) + 14 * Math.sin(t * 2.1 + b.ph)]; }
    function poeBorb(i, x, y, abre, inc) {
      const b = R.borb[i];
      poe(b.g, `translate(${n(x)},${n(y)})`);
      poe(b.inn, `rotate(${n(inc)})`);
      const s = n3(.15 + .85 * abre);
      poe(b.aT, `scale(${s},1)`); poe(b.aF, `scale(${-s},1)`);
    }
    const cen = { mexe: -1, t: 0 };
    function animarCena(dt) {
      const t = tempo / 1000;
      R.nuvens.forEach((g, i) => {
        const v = [6, 4, 5, 3][i] * calma, x0 = [260, 760, 1220, 1500][i], y = [130, 92, 170, 236][i];
        const x = -200 + ((x0 + 200 + t * v) % 2000);
        poe(g, `translate(${n(x)},${y})`);
      });
      poe(R.velas, `translate(1330,412) rotate(${n(t * 22 * calma)})`);
      poe(R.copaF, `rotate(${n3(1.2 * Math.sin(t * .7) * calma)},258,640)`);
      poe(R.copaT, `rotate(${n3(.9 * Math.sin(t * .7 - .6) * calma)},258,640)`);
      R.flores.forEach((g, i) => poe(g, `rotate(${n3(4 * Math.sin(t * 1.1 + i * .9) * calma)})`));
      R.floresMonte.forEach((g, i) => poe(g, `rotate(${n3(4 * Math.sin(t * 1.2 + i * 1.7) * calma + IMP.toca * 6)})`));
      R.ramas.forEach((g, i) => {
        let a = 3.5 * Math.sin(t * 1.3 + i * .7) * calma;
        if (i === cen.mexe) a += 14 * Math.sin(cen.t / 55) * sino(cen.t / 2200);
        poe(g, `rotate(${n3(a)})`);
      });
      R.tufos.forEach((g, i) => poe(g, `rotate(${n3(3 * Math.sin(t * .9 + i * 1.1) * calma)})`));
      R.ervasToca.forEach((g, i) => poe(g, `rotate(${n3(3 * Math.sin(t * 1.4 + i) * calma + IMP.toca * (i % 2 ? -10 : 10))})`));
      poe(R.raizes, `rotate(${n3(IMP.toca * 2.5)},926,646)`);
      borbs.forEach((b, i) => {
        if (!b.livre) return;
        const [x, y] = posBorb(b, t);
        const inc = limita((x - b.px) * 2.5, -25, 25); b.px = x;
        b.x = x; b.y = y;
        poeBorb(i, x, y, Math.abs(Math.cos(t * 9 + i)), inc);
      });
    }

    /* --- acontecimentos raros (o coelho repara e segue com o olhar) --- */
    function* observar(ev) {
      reagindo = false;
      yield* recompor(300);
      olhar.foco = ev.pos;
      yield* tw({ gE: 1, gD: 1, kE: 1.05, kD: 1.05, pupila: 1.3, cE: 2, cD: 2 }, 260, esai);
      let t = 0, prox = 800;
      nariz.rapido = true;
      while (ev.ativo() && t < 12000) {
        t += yield;
        if (ev.tipo === 'joaninha' && t > 900 && P.cabY < 20) yield* transicao(Object.assign({}, SENTADO, { spA: -30, cabY: 30, cabX: 44, pitch: .45 }), 500);
        if (t > prox) { prox = t + aleat(900, 1600); impulso(Math.random() < .5 ? 'twE' : 'twD', aleat(-10, 10), 300); impulso('nar', 1.2, 300); }
      }
      nariz.rapido = false;
      olhar.foco = null;
      if (ev.tipo === 'cenoura') { yield* tw({ bocaB: .25 }, 150); yield* tw({ bocaB: 0 }, 200); }
      yield* juntos(tw(Object.assign({}, ROSTO), 500), transicao(Object.assign({}, SENTADO), 500));
    }
    const eventos = { prox: aleat(12000, 20000), ultimo: null };
    function iniciarEvento(tipo) {
      const ev = { tipo, x: 0, y: 0, vivo: true };
      ev.pos = () => [ev.x, ev.y];
      ev.ativo = () => ev.vivo;
      const gen = tipo === 'borboleta' ? evBorboleta(ev) : tipo === 'passaro' ? evPassaro(ev) : tipo === 'joaninha' ? evJoaninha(ev) : evCenoura(ev);
      lancar('evento', gen, () => { ev.vivo = false; if (modo === 'dentro' && olhar.foco === ev.pos) olhar.foco = null; });
      if (modo === 'fora' && !reagindo) {
        if (tipo === 'borboleta') lancar('corpo', vigiarBorboleta(ev), () => lancar('corpo', cicloFora()));
        else lancar('corpo', observar(ev), () => lancar('corpo', cicloFora()));
      } else if (modo === 'dentro') { olhar.foco = ev.pos; impulso('giE', -1.2, 800); impulso('nar', 1.2, 400); }
    }
    function atualizarEventos(dt) {
      if (faixas.has('evento')) return;
      eventos.prox -= dt;
      if (eventos.prox > 0) return;
      eventos.prox = aleat(15000, 40000);
      let tipo; do tipo = escolhe(['borboleta', 'passaro', 'joaninha', 'cenoura']); while (tipo === eventos.ultimo);
      eventos.ultimo = tipo;
      iniciarEvento(tipo);
    }
    // a borboleta amarela vem pousar na ponta de uma orelha; o coelho fica vesgo a olhar e abana a orelha
    function* vigiarBorboleta(ev) {
      reagindo = false;
      yield* recompor(300);
      olhar.foco = ev.pos;
      yield* tw({ pupila: 1.25, gD: 1, kD: 1.04, cD: 0 }, 300);
      while (ev.ativo() && !ev.pousada) yield;
      olhar.foco = null;
      if (ev.ativo()) {
        yield* tw({ olharX: .5, olharY: -1, pitch: -.25, cabR: -6, oD: -8, feliz: .25 }, 500, eseno);
        let t = 0; while (ev.ativo() && ev.pousada && t < 2600) { t += yield; P.olharX = .45; P.olharY = -1; }
        if (ev.ativo() && ev.pousada) { ev.sacudida = true; impulso('twD', 22, 700, 'onda'); impulso('nar', 1.5, 400); }
        olhar.foco = ev.pos;
        yield* espera(1200);
      }
      olhar.foco = null;
      yield* tw(Object.assign({}, ROSTO, { cabR: 0, pitch: 0 }), 500);
    }
    function* evBorboleta(ev) {
      const b = borbs[0]; b.livre = false;
      let x = b.x, y = b.y;
      const ir = 2400;
      yield* durante(ir, (u, tt) => {
        const alvo = pontaOrelha('D'), e = eseno(u);
        const qx = lerp(x, alvo[0], e) + 30 * Math.sin(u * PI * 3) * (1 - u), qy = lerp(y, alvo[1] - 6, e) - 50 * sino(u);
        ev.x = qx; ev.y = qy;
        poeBorb(0, qx, qy, Math.abs(Math.cos(tt / 1000 * 10)), 10 * Math.sin(tt / 300));
      });
      ev.pousada = true;
      let t = 0;
      while (!ev.sacudida && t < 6000 && (modo === 'fora')) {
        t += yield;
        const alvo = pontaOrelha('D'); ev.x = alvo[0]; ev.y = alvo[1] - 6;
        poeBorb(0, ev.x, ev.y, .5 + .5 * Math.cos(t / 520), 0);
      }
      ev.pousada = false;
      x = ev.x; y = ev.y;
      const dest = posBorb(b, (tempo + 2200) / 1000);
      yield* durante(2200, (u, tt) => {
        const e = eseno(u);
        ev.x = lerp(x, dest[0], e) + 40 * Math.sin(u * PI * 2); ev.y = lerp(y, dest[1], e) - 90 * sino(u);
        poeBorb(0, ev.x, ev.y, Math.abs(Math.cos(tt / 1000 * 11)), -12 * Math.sin(tt / 260));
      });
      b.livre = true; b.px = ev.x;
    }
    function* evPassaro(ev) {
      const g = R.passaro, pY = 572;
      let dirA = 1;
      const poeAve = (bate, tt) => {
        poe(g, `translate(${n(ev.x)},${n(ev.y)}) scale(${dirA * 1.5},1.5)`);
        poe(R.aveAsa, bate ? `rotate(${n(-35 * Math.sin(tt * .055))},-2,-14) scale(1,${n3(.6 + .4 * Math.abs(Math.cos(tt * .055)))})` : 'rotate(0)');
      };
      atr(g, 'display', 'inline');
      yield* durante(1500, (u, tt) => { const e = esai(u); ev.x = lerp(-40, 400, e); ev.y = lerp(240, pY, e) - 60 * sino(u); poeAve(u < .92, tt); });
      for (let i = 0; i < 3; i++) {             // saltita ao longo da tábua da cerca
        yield* espera(aleat(350, 650));
        const x0 = ev.x;
        yield* durante(230, u => { ev.x = x0 + 22 * u; ev.y = pY - 12 * sino(u); poeAve(false, 0); });
      }
      for (let i = 0; i < 2; i++) { yield* durante(220, u => poe(R.ave, `rotate(${n(26 * sino(u))},0,-4)`)); yield* espera(240); }
      yield* espera(400); dirA = -1; poeAve(false, 0);
      yield* durante(300, u => poe(R.aveCab, `rotate(${n(-14 * sino(u))},9,-18)`));
      yield* espera(700); dirA = 1; poeAve(false, 0);
      yield* espera(400);
      const x1 = ev.x;
      yield* durante(1400, (u, tt) => { ev.x = lerp(x1, 760, eentra(u)); ev.y = lerp(pY, 60, u) - 30 * sino(u); poeAve(true, tt); });
      atr(g, 'display', 'none');
    }
    function* evJoaninha(ev) {        // uma joaninha sobe pelo caule, abre as asas e voa
      const g = R.joaninha, pts = [[478, 804], [475, 780], [478, 752], [480, 730], [477, 712]];
      atr(g, 'display', 'inline'); atr(R.joaAsas, 'opacity', '0');
      yield* durante(4200, (u, tt) => {
        const [x, y] = catmull(pts, u), [x2, y2] = catmull(pts, Math.min(1, u + .02));
        ev.x = x; ev.y = y;
        poe(g, `translate(${n(x)},${n(y)}) rotate(${n(Math.atan2(y2 - y, x2 - x) / RAD + 90)})`);
        poe(R.joaIn, `translate(${n(Math.sin(tt / 90) * .8)},0)`);
      });
      yield* espera(700);
      yield* durante(500, u => poe(R.joaCasca, `scale(${n3(1 + .25 * u)},${n3(1 - .15 * u)})`));
      atr(R.joaAsas, 'opacity', '1');
      const x0 = ev.x, y0 = ev.y;
      yield* durante(2600, (u, tt) => {
        ev.x = x0 - 260 * u + 30 * Math.sin(u * 9); ev.y = y0 - 420 * eentra(u) - 40 * sino(u);
        poe(g, `translate(${n(ev.x)},${n(ev.y)}) rotate(${n(-30 + 10 * Math.sin(tt / 80))})`);
        R.joaAsas.setAttribute('transform', `scale(1,${n3(.4 + .6 * Math.abs(Math.sin(tt / 25)))})`);
      });
      atr(g, 'display', 'none'); poe(R.joaCasca, 'scale(1,1)');
    }
    function* evCenoura(ev) {         // uma rama de cenoura abana e a cenoura espreita da terra
      const i = 9, [x, y, k] = CENOURAS[i];
      ev.x = x; ev.y = y - 30;
      cen.mexe = i; cen.t = 0;
      yield* durante(2200, (u, tt) => { cen.t = tt; poe(R.cens[i], `translate(0,${n(-9 * sino(u * 1.4) * k)})`); });
      cen.mexe = -1;
      yield* espera(500);
      cen.mexe = i; cen.t = 0;
      yield* durante(1400, (u, tt) => { cen.t = tt * 1.5; });
      cen.mexe = -1; poe(R.cens[i], 'translate(0,0)');
      yield* espera(400);
    }

    /* --- relógio único --- */
    let erroMostrado = false;
    function passo(dt) {
      if (!vivo) return;
      try {
        dt = Math.min(dt, 50);
        tempo += dt;
        fase.resp += dt / 1000 * 2 * PI * P.respF;
        fase.cauda += dt / 1000 * 2 * PI * (modo === 'dentro' ? .3 : .6);
        if (!faixas.has('corpo') || P.mast < .01) fase.mast += dt / 1000 * 2 * PI * 4.2;
        atualizarImpulsos(dt);
        atualizarPiscar(dt);
        atualizarNariz(dt);
        atualizarTiques(dt);
        for (const nome of Array.from(faixas.keys())) avancar(nome, dt);
        atualizarOlhar(dt);
        atualizarEventos(dt);
        atualizarMigalhas(dt);
        animarCena(dt);
        desenhar();
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    lancar('corpo', cicloFora());
    desenhar();

    return {
      animal: R.coelho,
      habitat: R.habitat,
      reagir() {
        if (!vivo) return;
        if (modo === 'fora') lancar('corpo', reacaoFora(), () => { reagindo = false; lancar('corpo', cicloFora()); });
        else if (modo === 'dentro') lancar('corpo', reacaoDentro(), () => lancar('corpo', cicloDentro()));
        else { impulso('twE', -10, 300); impulso('twD', 10, 300); }
      },
      fazerSom(ms, silabas) {         // o coelho não tem som (som: false); se for chamado, só mexe o nariz e a boca
        if (!vivo) return;
        impulso('nar', 1.5, 500);
        lancar('boca', mexerBoca(limita(ms || 700, 300, 2500)));
      },
      irAoHabitat() {
        return new Promise(res => {
          if (!vivo || modo !== 'fora') { res(); return; }
          lancar('corpo', idaAToca(), () => { res(); lancar('corpo', cicloDentro()); });
        });
      },
      voltar() {
        return new Promise(res => {
          if (!vivo || modo !== 'dentro') { res(); return; }
          lancar('corpo', saidaDaToca(), () => { res(); lancar('corpo', cicloFora()); });
        });
      },
      destruir() {
        vivo = false;
        faixas.clear();
        impulsos.length = 0;
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola (modo de desenvolvimento)
      _teste: { P, medida, modo: () => modo, evento: iniciarEvento, comportamento: nome => lancar('corpo', (function* () { yield* repor(); yield* COMPORTAMENTOS[nome](); })(), () => lancar('corpo', cicloFora())), pausar: () => lancar('corpo', espera(1e9)), desenhar, recorte }
    };
  }

  return { icone: iconeSVG(), montar };
})();
