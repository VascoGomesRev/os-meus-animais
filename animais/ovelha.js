/* Ovelha — «Os Meus Animais». Contrato e regras: REGRAS-ANIMAIS.md.
   Cena: a serra da Estrela no fim da primavera (sol de cima à esquerda): picos arredondados com restos de neve nas
   ravinas, um vale glaciar em U, encostas com giestas amarelas e urze roxa, penedos de granito arredondados, um abrigo de
   pastor de pedra com telhado de colmo ao longe (sai fumo), um rebanho pequenino a pastar, um ribeiro que desce a serra,
   nuvens fofas que parecem ovelhas e o cervunal verde em primeiro plano.
   Habitat: o redil (curral de pedra seca) encostado a um penedo grande, com cancela de madeira e palha lá dentro.
   A ovelha vai aos pulinhos (trote curto, pares diagonais, cascos presos ao chão), a cancela abre-se para fora, ela
   vira-se para a entrada e entra (camadas: penedo, muro de trás e palha → ovelha → muro da frente, esteios e cancela),
   a cancela fecha-se, ela vira-se lá dentro e deita-se enroscada na palha, a ruminar.
   A ovelha é um boneco «2,5D» (como o cavalo): o corpo é uma nuvem de lã (bolas sobrepostas) que alarga e estreita com
   o rumo, as 4 patas finas têm IK no plano da pata, o pescoço são 3 bolas de lã, a cauda é um tufo que abana e a cabeça
   é uma vista de frente cujas feições (olhos, focinho, orelhas de lado) estão presas a uma esfera e deslizam com o rumo.
   Organização: 1) utilidades  2) medidas  3) desenho da ovelha  4) cenário e redil  5) ícone
                6) montar(): estado, desenho por quadro, tarefas, andar aos pulinhos, comportamentos, idas e voltas */
'use strict';
MODULOS.ovelha = (() => {
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
  // elipse como subcaminho (para juntar muitas num só path)
  const elD = (x, y, rx, ry) => `M${n(x - rx)},${n(y)}a${n(rx)},${n(ry)} 0 1,0 ${n(2 * rx)},0a${n(rx)},${n(ry)} 0 1,0 ${n(-2 * rx)},0Z`;
  // nuvem de lã: elipse com «bolas» na borda (arcos que fazem bojo para fora)
  function nuvemD(rx, ry, nb, sem, irreg = .1, bojo = .62, cx = 0, cy = 0) {
    const rnd = semente(sem), pts = [];
    for (let i = 0; i < nb; i++) {
      const a = -PI / 2 + i / nb * TAU + (rnd() - .5) * .14, k = 1 + (rnd() - .5) * irreg;
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    let d = `M${n(pts[0][0])},${n(pts[0][1])}`;
    for (let i = 0; i < nb; i++) {
      const b = pts[(i + 1) % nb], a = pts[i], c = Math.hypot(b[0] - a[0], b[1] - a[1]), r = c * bojo * (.92 + rnd() * .16);
      d += `A${n(r)},${n(r)} 0 0 1 ${n(b[0])},${n(b[1])}`;
    }
    return d + 'Z';
  }
  // caracóis de lã (arcos em «C») espalhados numa elipse
  function caracoisD(rx, ry, quantos, sem, r0 = 5, r1 = 9, cx = 0, cy = 0) {
    const rnd = semente(sem);
    let d = '';
    for (let i = 0; i < quantos; i++) {
      const a = rnd() * TAU, k = Math.sqrt(rnd()) * .86, x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k, r = r0 + rnd() * (r1 - r0);
      const a0 = rnd() * TAU, a1 = a0 + 3.8 + rnd() * 1.2;
      d += `M${n(x + Math.cos(a0) * r)},${n(y + Math.sin(a0) * r)}A${n(r)},${n(r)} 0 1,1 ${n(x + Math.cos(a1) * r * .7)},${n(y + Math.sin(a1) * r * .7)}`;
    }
    return d;
  }

  /* ================= 2) Medidas da ovelha (pixels do SVG) ================= */
  const KZ = .2;                  // quanto a profundidade (z) desce no ecrã: vista ligeiramente de cima
  const CHAO = 760;               // y do chão à profundidade 0
  const HC = 190;                 // altura do centro do corpo de lã
  const CA = 132, CB = 98, CC = 96;  // semi-eixos do corpo: comprimento, largura, altura
  const RN = 104;                 // raio (com as bolas) da nuvem do corpo desenhada
  const PESC0 = { u: 98, h: HC + 34 };
  const ECAB = 1.1;               // escala da cabeça
  const TORNOZELO = 14;           // altura do tornozelo (o casco fica por baixo)
  // patas: lado 1 = esquerda (virada para nós quando a ovelha olha para a direita); dobra 1 = joelho para a frente
  const PERNAS = [
    { id: 'tE', fr: 0, lado: 1, u: -74, v: 40, h: 136, L1: 64, L2: 62, pu: -74, dobra: -1 },
    { id: 'fE', fr: 1, lado: 1, u: 76, v: 40, h: 136, L1: 62, L2: 64, pu: 78, dobra: 1 },
    { id: 'tD', fr: 0, lado: -1, u: -74, v: -40, h: 136, L1: 64, L2: 62, pu: -74, dobra: -1 },
    { id: 'fD', fr: 1, lado: -1, u: 76, v: -40, h: 136, L1: 62, L2: 64, pu: 78, dobra: 1 }
  ];
  const COR = {
    cont: '#7A665A', la: '#FBF8F2', laM: '#F1EBE0', laS: '#DCD0BF', laE: '#BFAF9A',
    cara: '#4E3D36', caraC: '#6E5950', caraE: '#33251F', contCara: '#22160F', casco: '#221813', boca: '#6A2430', rosa: '#E8A0A6'
  };

  /* ================= 3) Desenho da ovelha ================= */
  function defsOvelha(p) {
    return `
    <radialGradient id="${p}la" cx=".36" cy=".3" r=".78"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#F7F2E9"/><stop offset=".85" stop-color="#E4DACB"/><stop offset="1" stop-color="#D3C6B4"/></radialGradient>
    <linearGradient id="${p}laV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".35"/><stop offset=".35" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".62" stop-color="#6A5640" stop-opacity="0"/><stop offset="1" stop-color="#6A5640" stop-opacity=".26"/></linearGradient>
    <linearGradient id="${p}perna" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6A5850"/><stop offset=".5" stop-color="#4E3E37"/><stop offset="1" stop-color="#352823"/></linearGradient>
    <linearGradient id="${p}casco" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5A4A42"/><stop offset=".6" stop-color="#2E221D"/><stop offset="1" stop-color="#1A120E"/></linearGradient>
    <radialGradient id="${p}cab" gradientUnits="userSpaceOnUse" cx="-14" cy="-20" r="62"><stop offset="0" stop-color="#7A645A"/><stop offset=".55" stop-color="#55433B"/><stop offset="1" stop-color="#3A2B25"/></radialGradient>
    <radialGradient id="${p}foc" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="#8A7268"/><stop offset=".6" stop-color="#6A554C"/><stop offset="1" stop-color="#4E3D36"/></radialGradient>
    <radialGradient id="${p}iris" cx=".42" cy=".38" r=".65"><stop offset="0" stop-color="#B08048"/><stop offset=".5" stop-color="#6E4620"/><stop offset="1" stop-color="#2E1A0A"/></radialGradient>
    <linearGradient id="${p}orelha" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3E2F29"/><stop offset=".6" stop-color="#58463E"/><stop offset="1" stop-color="#6A5850"/></linearGradient>
    <radialGradient id="${p}sombra"><stop offset="0" stop-color="#2E3A14" stop-opacity=".44"/><stop offset=".6" stop-color="#2E3A14" stop-opacity=".2"/><stop offset="1" stop-color="#2E3A14" stop-opacity="0"/></radialGradient>
    <clipPath id="${p}olho"><ellipse rx="11" ry="12.5"/></clipPath>`;
  }

  /* --- Corpo: nuvem de lã desenhada num raio ~100 (o motor escala-a para os semi-eixos projetados) --- */
  const CORPO_D = nuvemD(95, 95, 15, 11, .1, .64);
  function corpoSVG(p) {
    // bolas de lã por dentro: sombra em baixo à direita (arco) e brilho em cima à esquerda
    const rnd = semente(17);
    let somb = '', brilho = '';
    const bolas = [[-52, -40, 30], [-8, -52, 32], [40, -42, 30], [70, -6, 26], [-74, 4, 26], [-30, -8, 30], [18, -10, 30], [-50, 40, 26], [0, 34, 28], [46, 34, 26]];
    for (const [x, y, r] of bolas) {
      const a0 = -.25 + rnd() * .3, a1 = 2.1 + rnd() * .4;
      somb += `M${n(x + Math.cos(a0) * r)},${n(y + Math.sin(a0) * r)}A${r},${r} 0 0,1 ${n(x + Math.cos(a1) * r)},${n(y + Math.sin(a1) * r)}`;
      if (y < 20) brilho += elD(x - r * .3, y - r * .4, r * .42, r * .24);
    }
    return `<g class="ov-corpoIn">
      <path d="${CORPO_D}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7" stroke-linejoin="round"/>
      <path d="${CORPO_D}" fill="url(#${p}la)"/>
      <path d="${somb}" fill="none" stroke="#D2C4B0" stroke-width="5" stroke-linecap="round" opacity=".75"/>
      <path class="ov-caracois" d="${caracoisD(82, 80, 30, 23, 5, 9)}" fill="none" stroke="#C9BBA6" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
      <path d="${caracoisD(70, 64, 14, 29, 4, 7, -18, -22)}" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>
      <path d="${brilho}" fill="#FFFFFF" opacity=".75"/>
      <path d="${CORPO_D}" fill="url(#${p}laV)"/>
    </g>`;
  }

  /* --- Patas finas e escuras (cada peça ao longo de +x; contorno primeiro, enchimento depois) --- */
  const capsula = (L, a, b) => `M0,${-a} L${L},${-b} A${b},${b} 0 0 1 ${L},${b} L0,${a} A${a},${a} 0 0 1 0,${-a} Z`;
  // casco fendido (o tornozelo fica na origem; a ponta aponta para +x = para a frente)
  const CASCO = 'M-7,0 L7,0 C9,5 11,9 13,14 C5,15.5 -5,15.5 -10,14 C-9.5,9 -8.5,5 -7,0 Z';
  function pernaSVG(p, pe) {
    const k = 'ov-' + pe.id, L1 = pe.L1, L2 = pe.L2;
    const sup = capsula(L1, 9, 7), inf = capsula(L2, 6.5, 6);
    return `<g class="ov-perna ${k}">
      <g class="${k}-sup"><path d="${sup}" fill="${COR.contCara}" stroke="${COR.contCara}" stroke-width="5" stroke-linejoin="round"/></g>
      <g class="${k}-inf"><path d="${inf}" fill="${COR.contCara}" stroke="${COR.contCara}" stroke-width="5"/></g>
      <g class="${k}-joe"><circle r="8" fill="${COR.contCara}" stroke="${COR.contCara}" stroke-width="5"/></g>
      <g class="${k}-casco"><path d="${CASCO}" fill="${COR.contCara}" stroke="${COR.contCara}" stroke-width="4.5" stroke-linejoin="round"/></g>
      <g class="${k}-sup"><path d="${sup}" fill="url(#${p}perna)"/><path d="M6,-4 L${L1 - 6},-3" stroke="#8A766C" stroke-width="2.4" opacity=".55" stroke-linecap="round"/></g>
      <g class="${k}-inf"><path d="${inf}" fill="url(#${p}perna)"/><path d="M6,-2.5 L${L2 - 6},-2" stroke="#8A766C" stroke-width="1.8" opacity=".5" stroke-linecap="round"/></g>
      <g class="${k}-joe"><circle r="8" fill="#55443C"/></g>
      <g class="${k}-casco"><path d="${CASCO}" fill="url(#${p}casco)"/><path d="M2.5,4 L3.5,14.5" stroke="#0E0806" stroke-width="1.8"/>
        <path d="M-6,2.5 L6,2.5" stroke="#7A665C" stroke-width="1.6" opacity=".8" stroke-linecap="round"/></g>
    </g>`;
  }
  function sombrasPesSVG(p) {
    return PERNAS.map(pe => `<ellipse class="ov-sp-${pe.id}" rx="16" ry="4.5" fill="url(#${p}sombra)"/>`).join('');
  }

  /* --- Pescoço: 3 bolas de lã (contornos primeiro) --- */
  const PESC_R = [44, 40, 36];
  const PESC_U = [.12, .45, .78];
  function pescocoSVG() {
    let cont = '', fill = '';
    PESC_R.forEach((r, i) => {
      const d = nuvemD(r - 4, r - 4, 9, 40 + i, .12, .64);
      cont += `<g class="ov-pb${i}"><path d="${d}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7" stroke-linejoin="round"/></g>`;
      fill += `<g class="ov-pb${i}"><path d="${d}" fill="${i ? COR.la : COR.laM}"/>
        <path d="${caracoisD(r * .7, r * .66, 5, 50 + i, 4, 7)}" fill="none" stroke="#CDBFAA" stroke-width="2" stroke-linecap="round" opacity=".7"/>
        <path d="M${-r * .5},${r * .35} A${r * .7},${r * .7} 0 0,0 ${r * .55},${r * .3}" fill="none" stroke="#DACDBB" stroke-width="4" stroke-linecap="round" opacity=".7"/>
        ${elD(-r * .3, -r * .38, r * .36, r * .2).replace(/^/, '<path d="') + '" fill="#FFFFFF" opacity=".8"/>'}</g>`;
    });
    return `<g class="ov-pescoco"><g>${cont}</g><g>${fill}</g></g>`;
  }

  /* --- Cauda: tufo curto de lã que pende da garupa --- */
  const CAUDA_D = nuvemD(13, 19, 7, 61, .12, .66, 0, 16);
  function caudaSVG() {
    return `<g class="ov-caudaIn"><path d="${CAUDA_D}" fill="#A09080" stroke="#A09080" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="${CAUDA_D}" fill="${COR.laM}"/><path d="${caracoisD(9, 14, 3, 63, 3, 5, 0, 18)}" fill="none" stroke="#C9BBA6" stroke-width="1.8" opacity=".8"/>
      <path d="${elD(-4, 10, 6, 4)}" fill="#FFFFFF" opacity=".8"/></g>`;
  }

  /* --- Cabeça: vista de frente cujas feições deslizam com o rumo (Y = cos, F = sen; F < 0: de costas);
         beta = inclinação do focinho (graus, + para baixo). Pontos da cabeça em (lado, cima, frente). --- */
  function estadoCabeca(q) {
    const Y = q.Y, F = q.F, aY = Math.abs(Y), b = q.beta * RAD, cb = Math.cos(b), sb = Math.sin(b);
    const P3 = (sd, up, fw) => { const u2 = up * cb - fw * sb, f2 = fw * cb + up * sb; return [sd * F + f2 * Y, -u2, -sd * Y + f2 * F]; };
    const t = {}, d = {}, op = {}, a = {};
    const em = (pt, extra = '') => `translate(${n(pt[0])},${n(pt[1])})${extra}`;
    const ponte = P3(0, -8, 26), foc = P3(q.mast * .3, -20, 48);
    t.ponte = em(ponte); t.foc = em(foc, ` scale(${n3(1 - .12 * aY)},1)`);
    const qx = P3(q.mast * 4, -42 - q.boca * 5, 46);
    t.queixo = em(qx, ` scale(${n3(1 - .25 * aY)},1)`);
    const bi = P3(q.mast * 2.5, -35 - q.boca * 4, 63);
    t.bocaInt = em(bi); a.bocaRy = n(.5 + q.boca * 10); a.bocaRx = n((6 + 6 * q.boca) * (1 - .3 * aY));
    t.lingua = `translate(${n(bi[0])},${n(bi[1] + q.boca * 4.5)})`; a.linguaRx = n((3.5 + 3.5 * q.boca) * (1 - .3 * aY)); a.linguaRy = n(.3 + q.boca * 4.2);
    op.bocaInt = q.boca > .04 ? 1 : 0;
    // nariz e boca (linha em «Y» com os cantos para cima quando sorri)
    const N = P3(0, -20, 66), C = P3(q.mast * 2.5, -33 - q.boca * 6, 63);
    const L = P3(-10 + q.mast * 2, -29 + q.sorriso * 2, 58), Rr = P3(10 + q.mast * 2, -29 + q.sorriso * 2, 58);
    const cL = P3(-5 + q.mast * 2, -35 - q.sorriso * 1.5, 62), cR = P3(5 + q.mast * 2, -35 - q.sorriso * 1.5, 62);
    // com a boca aberta, o risco do nariz acaba em cima da abertura e os cantos vão para os lados dela
    const ab = limita(q.boca * 3, 0, 1), ry0 = .5 + q.boca * 10, rx0 = (6 + 6 * q.boca) * (1 - .3 * aY);
    const Ct = [lerp(C[0], bi[0], ab), lerp(C[1], bi[1] - ry0, ab)], Le = [lerp(C[0], bi[0] - rx0, ab), lerp(C[1], bi[1], ab)], Re = [lerp(C[0], bi[0] + rx0, ab), lerp(C[1], bi[1], ab)];
    d.boca = `M${n(N[0])},${n(N[1])} L${n(Ct[0])},${n(Ct[1])} M${n(L[0])},${n(L[1])} Q${n(cL[0])},${n(cL[1])} ${n(Le[0])},${n(Le[1])} M${n(Re[0])},${n(Re[1])} Q${n(cR[0])},${n(cR[1])} ${n(Rr[0])},${n(Rr[1])}`;
    a.boca = C;
    for (const s of [-1, 1]) {
      const k = s < 0 ? 'E' : 'D';
      // narinas
      const pn = P3(s * 8, -15, 64), nz = P3(s * .35, .1, .93)[2];
      t['nar' + k] = em(pn, ` rotate(${n(s * 20 * (1 - aY) + Y * 10)}) scale(${n3(.45 + .55 * Math.max(0, nz))},1)`);
      op['nar' + k] = n3(passoS(.0, .2, nz));
      // olhos (na esfera do crânio)
      const po = P3(s * 21, 12, 29), oz = P3(s * .58, .22, .78)[2];
      const sx = .15 + .85 * limita((oz - .18) / .62, 0, 1);
      t['olho' + k] = em(po, ` scale(${n3(sx * q.olhoEsc)},${n3(q.olhoEsc)})`);
      op['olho' + k] = oz > .2 ? '1' : '0';
      // bochechas cor-de-rosa
      const pb = P3(s * 25, -8, 30), bz = P3(s * .7, -.1, .7)[2];
      t['boch' + k] = em(pb, ` scale(${n3(.3 + .7 * Math.max(0, bz))},1)`);
      op['boch' + k] = n3(passoS(.05, .4, bz) * .45 * (1 + q.feliz * .6));
      // orelhas de lado: base no crânio, direção para fora, um pouco para baixo e para trás
      const ob = P3(s * 31, 13, -8);
      const caida = (s < 0 ? q.oE : q.oD) * RAD, cima = -.3 + Math.sin(caida) * 1.2;
      const dir = P3(s, cima, -.3 - q.orelhas * .2), base = P3(0, 0, 0);
      const dx = dir[0] - base[0], dy = dir[1] - base[1], dz = dir[2] - base[2];
      const ang = Math.atan2(dy, dx) / RAD + (s < 0 ? -1 : 1) * q['ab' + k];
      const comp = Math.max(.58, Math.hypot(dx, dy) / Math.hypot(1, cima, .3));
      t['orelha' + k] = em(ob, ` rotate(${n(ang)}) scale(${n3(comp)},${n3(.85 + .15 * comp)})`);
      a['frente' + k] = ob[2] + dz * 8 > 6;
      op['orelhaIn' + k] = n3(limita(.35 + .65 * Math.abs(F), 0, 1));
    }
    // franja de lã no alto da cabeça
    const fr = P3(0, 34, 2);
    t.franja = em(fr, ` skewX(${n(q.franja)}) scale(${n3(1 - .25 * aY)},1)`);
    // pálpebras: c = fecho, h = olhos contentes («∩»)
    const c = limita(q.fecho, 0, 1), h = limita(q.feliz, 0, 1);
    const ye = lerp(lerp(-10, 10, c), 6, h), cy = lerp(lerp(-23, 15, c), -10, h);
    d.palpS = `M-14,-16 L14,-16 L14,${n(ye)} Q0,${n(cy)} -14,${n(ye)} Z`;
    const yl = lerp(16, 6, h), cyl = lerp(20, -8, h);
    d.palpI = `M-14,16 L14,16 L14,${n(yl)} Q0,${n(cyl)} -14,${n(yl)} Z`;
    const Q = (u, p0, p1, p2) => (1 - u) * (1 - u) * p0 + 2 * u * (1 - u) * p1 + u * u * p2;
    let cil = `M-11,${n(Q(.1, ye, cy, ye))} Q0,${n(Q(.5, ye, cy, ye) * 2 - (Q(.1, ye, cy, ye) + Q(.9, ye, cy, ye)) / 2)} 11,${n(Q(.9, ye, cy, ye))}`;
    for (const u of [.15, .38, .62]) {
      const x = lerp(-14, 14, u), y = Q(u, ye, cy, ye), vx = x * .5 - 4, vy = y - 2;
      const Lc = Math.hypot(vx, vy) || 1, ux = vx / Lc, uy = vy / Lc, cp = 6 * (1 - c * .3);
      cil += ` M${n(x)},${n(y)} q${n(ux * cp * .5 - uy * 1.5)},${n(uy * cp * .5 + ux * 1.5)} ${n(ux * cp)},${n(uy * cp)}`;
    }
    d.cil = cil;
    t.iris = `translate(${n(q.olharX * 3.6 + Y * 1.5)},${n(q.olharY * 3.4)})`;
    op.rosto = n3(passoS(-.6, -.32, F));
    return { t, d, op, a };
  }

  const LISO = { cab: '#55433B', foc: '#6A554C', iris: '#6E4620', orelha: '#55443C', la: '#F7F2E9' };
  const FRANJA_D = nuvemD(28, 15, 9, 71, .14, .66);
  function cabecaSVG(p, E, icone) {
    const T = k => E.t[k] ? ` transform="${E.t[k]}"` : '';
    const O = k => E.op[k] != null ? ` opacity="${E.op[k]}"` : '';
    const orelha = k => `<g class="ov-orelha${k}"${T('orelha' + k)}>
        <path d="M0,-7 C12,-14 32,-14 44,-5 C47,-1 46,3 42,6 C30,13 12,11 0,7 Z" fill="url(#${p}orelha)" stroke="${COR.contCara}" stroke-width="2.6" stroke-linejoin="round"/>
        <path class="ov-orelhaIn${k}"${O('orelhaIn' + k)} d="M6,-3 C15,-8 30,-8 38,-2 C30,5 15,5.5 6,3 Z" fill="${COR.rosa}"/>
        <path d="M7,-7 C16,-11 30,-11 38,-6" stroke="#8A766C" stroke-width="1.8" fill="none" opacity=".6" stroke-linecap="round"/></g>`;
    const olho = k => `<g class="ov-olho${k}"${T('olho' + k)}${O('olho' + k)}>
        <ellipse rx="13.6" ry="15" fill="#8E766A" opacity=".55"/>
        <g${icone ? '' : ` clip-path="url(#${p}olho)"`}>
          <ellipse rx="11" ry="12.5" fill="#FFFDF8"/>
          <g class="ov-iris${k}"${T('iris')}><circle cy="1" r="8.6" fill="url(#${p}iris)"/><circle cy="1" r="8.6" fill="none" stroke="#1A0E06" stroke-width="1.4"/>
            <ellipse cy="1.4" rx="5" ry="4.3" fill="#120A05"/><circle cx="-3.2" cy="-3.4" r="3.5" fill="#FFFFFF"/><circle cx="3.4" cy="4" r="1.6" fill="#FFFFFF" opacity=".9"/></g>
          ${icone ? '' : `<path d="M-14,-16 L14,-16 L14,-6 Q0,-18 -14,-6 Z" fill="#2A1A10" opacity=".14"/>
          <path class="ov-palpS${k}" d="${E.d.palpS}" fill="${COR.caraC}"/>
          <path class="ov-palpI${k}" d="${E.d.palpI}" fill="${COR.caraC}"/>`}
        </g>
        <ellipse rx="11" ry="12.5" fill="none" stroke="${COR.contCara}" stroke-width="2.2"/>
        <path class="ov-cil${k}" d="${E.d.cil}" fill="none" stroke="#120A06" stroke-width="2.2" stroke-linecap="round"/>
      </g>`;
    const nar = k => `<path class="ov-nar${k}"${T('nar' + k)}${O('nar' + k)} d="M-4.5,0 C-4.5,-3 0,-4.5 3.5,-2.5 C5,-.5 3,3 -.5,3 C-3,3 -4.5,2 -4.5,0 Z" fill="#1E1410"/>`;
    const s = `<g class="ov-cab-in">
      <g class="ov-orelhasT">${orelha('E')}${orelha('D')}</g>
      <ellipse rx="37" ry="39" fill="${COR.contCara}" stroke="${COR.contCara}" stroke-width="5"/>
      <g class="ov-rostoC"${O('rosto')}>
        <ellipse class="ov-ponteC"${T('ponte')} rx="31" ry="31" fill="${COR.contCara}" stroke="${COR.contCara}" stroke-width="5"/>
        <ellipse class="ov-queixoC"${T('queixo')} rx="16" ry="9" fill="${COR.contCara}" stroke="${COR.contCara}" stroke-width="5"/>
        <ellipse class="ov-focC"${T('foc')} rx="27" ry="22" fill="${COR.contCara}" stroke="${COR.contCara}" stroke-width="5"/>
      </g>
      <ellipse rx="37" ry="39" fill="url(#${p}cab)"/>
      <path d="M-26,-22 C-16,-33 2,-36 16,-31" stroke="#9A847A" stroke-width="6" fill="none" opacity=".4" stroke-linecap="round"/>
      <g class="ov-rosto"${O('rosto')}>
        <ellipse class="ov-ponte"${T('ponte')} rx="31" ry="31" fill="url(#${p}cab)"/>
        <ellipse class="ov-queixo"${T('queixo')} rx="16" ry="9" fill="${COR.caraC}"/>
        <g class="ov-foc"${T('foc')}><ellipse rx="27" ry="22" fill="url(#${p}foc)"/><ellipse cx="-8" cy="-11" rx="12" ry="5" fill="#FFFFFF" opacity=".16"/></g>
        <g class="ov-bocaG"${O('bocaInt')}><ellipse class="ov-bocaInt"${T('bocaInt')} rx="${E.a.bocaRx}" ry="${E.a.bocaRy}" fill="${COR.boca}" stroke="${COR.contCara}" stroke-width="2"/>
          <ellipse class="ov-lingua"${T('lingua')} rx="${E.a.linguaRx}" ry="${E.a.linguaRy}" fill="#E07A86"/></g>
        ${nar('E')}${nar('D')}
        <path class="ov-boca" d="${E.d.boca}" stroke="${COR.contCara}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <ellipse class="ov-bochE"${T('bochE')}${O('bochE')} rx="9" ry="5.5" fill="#F29A96"/><ellipse class="ov-bochD"${T('bochD')}${O('bochD')} rx="9" ry="5.5" fill="#F29A96"/>
        ${olho('E')}${olho('D')}
      </g>
      <g class="ov-franja"${T('franja')}><path d="${FRANJA_D}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="5.5" stroke-linejoin="round"/>
        <path d="${FRANJA_D}" fill="url(#${p}la)"/><path d="${caracoisD(20, 9, 5, 73, 3, 5)}" fill="none" stroke="#C9BBA6" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>
        <path d="${elD(-9, -6, 9, 4)}" fill="#FFFFFF" opacity=".85"/></g>
      <g class="ov-orelhasF"></g>
    </g>`;
    if (!icone) return s;
    return s.replace(/url\(#[a-z]+-([A-Za-z]+)\)/g, (m, k) => LISO[k] || '#55433B');
  }

  function ovelhaSVG(p) {
    const E = estadoCabeca(CAB0);
    return `<g class="ov-ovelha">
      <g class="ov-corpo">
        <ellipse class="ov-sombra" rx="1" ry="1" fill="url(#${p}sombra)"/>
        ${sombrasPesSVG(p)}
        <g class="ov-pernasTras">${PERNAS.map(pe => pernaSVG(p, pe)).join('')}</g>
        <g class="ov-slotCaudaT"><g class="ov-cauda">${caudaSVG()}</g></g>
        <g class="ov-slotPescT"></g>
        <g class="ov-pernasFrente"></g>
        <g class="ov-tronco">${corpoSVG(p)}</g>
        <g class="ov-slotCaudaF"></g>
      </g>
      <g class="ov-slotPescF"><g class="ov-frente">${pescocoSVG()}<g class="ov-cab">${cabecaSVG(p, E)}</g></g></g>
    </g>`;
  }
  const CAB0 = { Y: -.5, F: .85, beta: 16, oE: 0, oD: 0, abE: 0, abD: 0, orelhas: 0, fecho: .1, feliz: 0, boca: 0, mast: 0, olharX: 0, olharY: 0, sorriso: .5, olhoEsc: 1, franja: 0 };

  /* ================= 4) Cenário: serra da Estrela no fim da primavera ================= */
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
  function defsCena(p) {
    return `
    <linearGradient id="${p}ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4E9CDE"/><stop offset=".45" stop-color="#8DC6EE"/><stop offset=".8" stop-color="#CDE6F4"/><stop offset="1" stop-color="#EAF2F0"/></linearGradient>
    <radialGradient id="${p}solBrilho"><stop offset="0" stop-color="#FFFBE6" stop-opacity=".95"/><stop offset=".2" stop-color="#FFF4C8" stop-opacity=".5"/><stop offset=".55" stop-color="#FFF0B8" stop-opacity=".12"/><stop offset="1" stop-color="#FFF0B8" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}sol" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="#FFFFF6"/><stop offset=".7" stop-color="#FFF6CC"/><stop offset="1" stop-color="#FFE9A0"/></radialGradient>
    <linearGradient id="${p}serraL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#889CBE"/><stop offset=".6" stop-color="#AAB8CE"/><stop offset="1" stop-color="#C6CED8"/></linearGradient>
    <linearGradient id="${p}serraM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8E9E80"/><stop offset="1" stop-color="#A9B28A"/></linearGradient>
    <linearGradient id="${p}encosta" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A6B566"/><stop offset=".5" stop-color="#93A752"/><stop offset="1" stop-color="#7E9644"/></linearGradient>
    <linearGradient id="${p}prado" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A3C25A"/><stop offset=".35" stop-color="#8CB14A"/><stop offset="1" stop-color="#668E30"/></linearGradient>
    <linearGradient id="${p}agua" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A6D4EC"/><stop offset=".5" stop-color="#6FAED6"/><stop offset="1" stop-color="#4A88B4"/></linearGradient>
    <linearGradient id="${p}granito" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCD6CA"/><stop offset=".45" stop-color="#B9B2A4"/><stop offset="1" stop-color="#857E70"/></linearGradient>
    <linearGradient id="${p}granitoM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9C2B4"/><stop offset="1" stop-color="#9E9687"/></linearGradient>
    <linearGradient id="${p}pedraMuro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D2CBBE"/><stop offset=".6" stop-color="#B2AA9B"/><stop offset="1" stop-color="#958D7E"/></linearGradient>
    <linearGradient id="${p}pedraDentro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9A193"/><stop offset="1" stop-color="#7A7266"/></linearGradient>
    <linearGradient id="${p}palha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6DC8C"/><stop offset=".6" stop-color="#E2BC5E"/><stop offset="1" stop-color="#C49A44"/></linearGradient>
    <linearGradient id="${p}madeira" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A47A50"/><stop offset=".5" stop-color="#8C643E"/><stop offset="1" stop-color="#6E4C2E"/></linearGradient>
    <linearGradient id="${p}madeiraV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9E7650"/><stop offset="1" stop-color="#7E5A38"/></linearGradient>
    <linearGradient id="${p}colmo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9A45E"/><stop offset="1" stop-color="#8E6E38"/></linearGradient>
    <radialGradient id="${p}sombraPed"><stop offset="0" stop-color="#2E3A14" stop-opacity=".36"/><stop offset=".7" stop-color="#2E3A14" stop-opacity=".14"/><stop offset="1" stop-color="#2E3A14" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}vinheta" cx=".46" cy=".44" r=".78"><stop offset=".62" stop-color="#2A3418" stop-opacity="0"/><stop offset="1" stop-color="#2A3418" stop-opacity=".24"/></radialGradient>
    <radialGradient id="${p}luzQuente" gradientUnits="userSpaceOnUse" cx="170" cy="120" r="1150"><stop offset="0" stop-color="#FFF4C8" stop-opacity=".2"/><stop offset=".5" stop-color="#FFF0C0" stop-opacity=".05"/><stop offset="1" stop-color="#FFF0C0" stop-opacity="0"/></radialGradient>`;
  }
  function nuvemCeuSVG(i, k, ovelhinha) {
    const d = nuvemD(96, 34, 13, 300 + i, .2, .7), d2 = nuvemD(60, 20, 9, 320 + i, .2, .7, -14, -14);
    let extra = '';
    if (ovelhinha) {    // a nuvem que parece uma ovelha: cabecinha e patinhas
      extra = `<path d="${nuvemD(26, 22, 8, 340, .2, .7, 104, -14)}" fill="#F4F8FB"/><path d="M-50,30 l-2,12 M-20,32 l-1,12 M30,32 l1,12 M60,30 l2,11" stroke="#E6EFF6" stroke-width="13" stroke-linecap="round"/>
        <path d="${nuvemD(14, 8, 6, 341, .2, .7, 92, -38)}" fill="#FFFFFF"/>`;
    }
    return `<g class="ov-nuvem${i}"><g transform="scale(${k})">${extra}
      <path d="${d}" fill="#D3E2EE" transform="translate(4,8)"/><path d="${d}" fill="#FFFFFF"/>
      <path d="${d2}" fill="#FFFFFF"/><path d="${elD(-30, -18, 26, 7)}" fill="#FFFFFF" opacity=".9"/>
      <path d="M-80,16 C-40,28 40,28 84,16" stroke="#C6D8E6" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/></g></g>`;
  }
  function neveD(lista, sem, dy = 0) {
    // restos de neve: manchas irregulares nas covas, logo abaixo da crista
    const rnd = semente(sem);
    let d = '';
    for (const [x, y, w] of lista) {
      const pts = [];
      for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, k = .7 + rnd() * .5; pts.push([x + Math.cos(a) * w * k, y + dy + Math.sin(a) * w * .26 * k + (Math.sin(a) > .3 ? rnd() * w * .3 : 0)]); }
      d += curvaPor(pts, true);
    }
    return d;
  }
  const NEVE = [[800, 262, 24], [852, 258, 18], [760, 270, 12], [906, 268, 20], [828, 282, 10], [952, 276, 12], [736, 282, 8],
    [322, 312, 16], [362, 314, 10], [292, 322, 9], [1330, 278, 20], [1384, 286, 12], [1292, 284, 10], [1352, 298, 9]];
  // capa de neve no alto dos picos: segue a crista e tem a borda de baixo recortada
  const bez = (a, b, c, d, t) => { const m = 1 - t; return [m * m * m * a[0] + 3 * m * m * t * b[0] + 3 * m * t * t * c[0] + t * t * t * d[0], m * m * m * a[1] + 3 * m * m * t * b[1] + 3 * m * t * t * c[1] + t * t * t * d[1]]; };
  const CRISTA = [[[0, 352], [110, 326], [220, 296], [330, 292]], [[330, 292], [420, 290], [480, 318], [560, 300]], [[560, 300], [640, 282], [720, 238], [822, 232]],
    [[822, 232], [920, 228], [980, 262], [1060, 270]], [[1060, 270], [1160, 280], [1240, 248], [1342, 258]], [[1342, 258], [1440, 270], [1520, 298], [1600, 294]]];
  function capaNeveD(seg1, t1, seg2, t2, fundo, sem) {
    const rnd = semente(sem), cima = [];
    for (let i = 0; i <= 10; i++) cima.push(bez(...CRISTA[seg1], lerp(t1, 1, i / 10)));
    for (let i = 1; i <= 10; i++) cima.push(bez(...CRISTA[seg2], lerp(0, t2, i / 10)));
    const baixo = cima.map((q, i) => { const u = i / (cima.length - 1); return [q[0] + (rnd() - .5) * 6, q[1] + 2 + fundo * Math.sin(PI * u) * (.45 + .55 * rnd())]; }).reverse();
    return curvaPor(cima.map(q => [q[0], q[1] + 1.5]).concat(baixo), true);
  }
  const CAPAS = () => capaNeveD(2, .55, 3, .42, 26, 3) + capaNeveD(0, .72, 1, .3, 14, 4) + capaNeveD(4, .66, 5, .3, 18, 6);
  function serraSVG(p) {
    const longe = 'M0,352 C110,326 220,296 330,292 C420,290 480,318 560,300 C640,282 720,238 822,232 C920,228 980,262 1060,270 C1160,280 1240,248 1342,258 C1440,270 1520,298 1600,294 L1600,560 L0,560 Z';
    let s = `<path d="${longe}" fill="url(#${p}serraL)"/>
      <path d="M560,300 C620,330 650,380 700,420 M1060,270 C1030,320 1000,360 980,410 M330,292 C300,340 280,380 250,420 M1342,258 C1320,300 1300,340 1290,400" stroke="#8A9CB8" stroke-width="26" fill="none" opacity=".12" stroke-linecap="round"/>
      <path d="M822,232 C860,250 900,290 940,330 C980,370 1010,420 1040,470 L1600,470 L1600,294 C1520,298 1440,270 1342,258 C1240,248 1160,280 1060,270 C980,262 920,228 822,232 Z" fill="#7E90AE" opacity=".18"/>`;
    const capas = CAPAS();
    s += `<path d="${neveD(NEVE, 5, 3)}${capas}" fill="#A4B6D0" transform="translate(0,3)"/><path d="${neveD(NEVE, 5)}${capas}" fill="#FFFFFF"/>`;
    // cordilheira do meio, com um vale glaciar em U e penedos na crista
    const meio = 'M0,432 C80,412 160,400 240,404 C330,408 380,440 430,470 C480,498 560,504 620,482 C680,456 720,412 800,402 C900,390 1000,404 1100,398 C1200,392 1280,410 1380,420 C1480,430 1550,420 1600,416 L1600,600 L0,600 Z';
    s += `<path d="${meio}" fill="url(#${p}serraM)"/>
      <path d="M0,432 C80,412 160,400 240,404 C330,408 380,440 430,470 C480,498 560,504 620,482 C680,456 720,412 800,402 C900,390 1000,404 1100,398 C1200,392 1280,410 1380,420 C1480,430 1550,420 1600,416" stroke="#C4CCA6" stroke-width="3" fill="none" opacity=".7"/>`;
    const rnd = semente(13);
    let ped = '', pedS = '';
    for (const [x, y, k] of [[240, 404, 1], [1100, 398, 1.1], [1460, 424, .9], [820, 404, .7], [120, 418, .6]]) {
      for (let i = 0; i < 4; i++) { const px = x + (i - 1.5) * 13 * k + (rnd() - .5) * 6, r = (8 + rnd() * 7) * k; ped += elD(px, y - r * .5, r, r * .75); pedS += elD(px + r * .3, y - r * .2, r * .7, r * .4); }
    }
    s += `<path d="${ped}" fill="#B8B4A6"/><path d="${pedS}" fill="#8E8A7E" opacity=".6"/>`;
    // urze e giesta muito ao longe (manchas)
    let ur = '', gi = '';
    for (let i = 0; i < 60; i++) {
      const x = rnd() * 1600, y = 440 + rnd() * 110, r = 4 + rnd() * 8;
      if (rnd() < .5) ur += elD(x, y, r * 1.6, r * .6); else gi += elD(x, y, r * 1.4, r * .55);
    }
    s += `<path d="${ur}" fill="#A07A9A" opacity=".55"/><path d="${gi}" fill="#D6C45A" opacity=".6"/>`;
    return s;
  }
  function abrigoSVG() {
    // abrigo de pastor: cabana redonda de pedra com telhado cónico de colmo (o fumo está no grupo ov-fumo)
    let pedras = '';
    const rnd = semente(19);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) pedras += elD(-22 + i * 9 + (r % 2) * 4 + (rnd() - .5) * 2, -4 - r * 7, 3.6, 2.6);
    return `<g transform="translate(1330,468)">
      <ellipse cx="6" cy="1" rx="40" ry="5" fill="#4A5A30" opacity=".3"/>
      <path d="M-26,0 L-26,-24 C-14,-28 14,-28 26,-24 L26,0 C14,3 -14,3 -26,0 Z" fill="#A8A294"/>
      <path d="${pedras}" fill="#C4BEB0" opacity=".9"/><path d="M8,0 L8,-24 C16,-25 22,-25 26,-24 L26,0 Z" fill="#6A6458" opacity=".35"/>
      <path d="M-6,0 L-6,-14 C-6,-18 4,-18 4,-14 L4,0 Z" fill="#3A2E24"/>
      <path d="M-32,-22 C-20,-34 -8,-50 0,-58 C8,-50 20,-34 32,-22 C16,-18 -16,-18 -32,-22 Z" fill="url(#ovelha-colmo)"/>
      <path d="M-24,-26 L-4,-52 M-12,-24 L-2,-54 M0,-23 L0,-56 M12,-24 L2,-54 M24,-26 L4,-52" stroke="#7A5A2C" stroke-width="1.2" opacity=".6"/>
      <path d="M-32,-22 C-16,-18 16,-18 32,-22" stroke="#6A4E24" stroke-width="2" fill="none"/>
      <path d="M-2,-58 L-1,-64 M2,-58 L2,-63" stroke="#5A4626" stroke-width="2" stroke-linecap="round"/></g>`;
  }
  function fumoSVG() {
    let s = '';
    for (let i = 0; i < 6; i++) s += `<circle class="ov-fumo${i}" r="7" fill="#F4F2EE"/>`;
    return `<g class="ov-fumo">${s}</g>`;
  }
  function rebanhoSVG() {
    // rebanho pequenino a pastar ao longe (ovelhas de 14 px)
    const pos = [[1176, 492], [1204, 500], [1228, 488], [1252, 504], [1150, 506], [1280, 494]];
    return pos.map(([x, y], i) => `<g class="ov-rb${i}" transform="translate(${x},${y})"><g class="ov-rbIn">
      <path d="M-4,3 l0,4 M4,3 l0,4" stroke="#4A3A34" stroke-width="1.6"/>
      <ellipse rx="8" ry="5" fill="#FBF8F2" stroke="#A89A8A" stroke-width=".8"/><circle class="ov-rbCab" cx="${i % 2 ? 8 : -8}" cy="1" r="2.6" fill="#4A3A34"/></g></g>`).join('');
  }
  // penedo de granito arredondado (forma a partir de uma elipse com bossas)
  function penedoD(x, y, w, h, sem) {
    const rnd = semente(sem), pts = [];
    for (let i = 0; i < 9; i++) {
      const a = PI + i / 8 * PI, k = .86 + rnd() * .2;
      pts.push([x + Math.cos(a) * w / 2 * k, y - Math.sin(-a) * 0 + Math.sin(a) * h * k * (i === 0 || i === 8 ? 0 : 1)]);
    }
    pts[0] = [x - w / 2, y]; pts[8] = [x + w / 2, y];
    pts.push([x + w * .3, y + 4], [x - w * .3, y + 4]);
    return curvaPor(pts, true);
  }
  function penedoSVG(p, x, y, w, h, sem, cls) {
    const d = penedoD(x, y, w, h, sem), rnd = semente(sem + 5);
    let liq = '', fend = '';
    for (let i = 0; i < 7; i++) liq += elD(x + (rnd() - .5) * w * .6, y - h * (.2 + rnd() * .6), 2 + rnd() * 5, 1.5 + rnd() * 3);
    fend = `M${n(x - w * .1)},${n(y - h * .9)} q${n(w * .05)},${n(h * .3)} ${n(-w * .02)},${n(h * .55)} M${n(x + w * .22)},${n(y - h * .6)} q${n(w * .04)},${n(h * .2)} ${n(w * .1)},${n(h * .4)}`;
    return `<g${cls ? ` class="${cls}"` : ''}><ellipse cx="${n(x + w * .1)}" cy="${n(y + 3)}" rx="${n(w * .62)}" ry="${n(Math.max(6, h * .12))}" fill="url(#${p}sombraPed)"/>
      <path d="${d}" fill="url(#${p}granito)" stroke="#6E6658" stroke-width="2.5"/>
      <path d="M${n(x - w * .36)},${n(y - h * .55)} C${n(x - w * .26)},${n(y - h * .9)} ${n(x + w * .05)},${n(y - h * .98)} ${n(x + w * .2)},${n(y - h * .86)}" stroke="#F2EEE4" stroke-width="${n(Math.max(3, w * .05))}" fill="none" opacity=".6" stroke-linecap="round"/>
      <path d="${fend}" stroke="#6E6658" stroke-width="2" fill="none" opacity=".7" stroke-linecap="round"/>
      <path d="${liq}" fill="#C8C060" opacity=".7"/></g>`;
  }
  function encostaSVG(p) {
    const rnd = semente(23);
    let s = `<path d="M0,522 C150,502 300,506 440,530 C560,552 640,560 760,548 C900,534 1040,520 1180,526 C1320,532 1460,512 1600,506 L1600,700 L0,700 Z" fill="url(#${p}encosta)"/>
      <path d="M0,522 C150,502 300,506 440,530 C560,552 640,560 760,548 C900,534 1040,520 1180,526 C1320,532 1460,512 1600,506" stroke="#C2CE86" stroke-width="3" fill="none" opacity=".7"/>`;
    // moitas de giesta (verde-escuro com flores amarelas) e de urze (roxa) nas encostas
    let gB = '', gF = '', gF2 = '', uB = '', uF = '';
    for (let i = 0; i < 46; i++) {
      const x = rnd() * 1640 - 20, y = 528 + rnd() * 96, k = .6 + (y - 528) / 96 * .8, giesta = rnd() < .58;
      if (giesta) {
        gB += elD(x, y, 22 * k, 10 * k);
        for (let j = 0; j < 6; j++) { const fx = x + (rnd() - .5) * 38 * k, fy = y - 4 * k + (rnd() - .5) * 12 * k; { const e_ = elD(fx, fy, 6 * k, 4 * k); if (j % 2) gF += e_; else gF2 += e_; } }
      } else {
        uB += elD(x, y, 18 * k, 8 * k);
        for (let j = 0; j < 5; j++) uF += elD(x + (rnd() - .5) * 30 * k, y - 3 * k + (rnd() - .5) * 8 * k, 5 * k, 3.4 * k);
      }
    }
    s += `<path d="${gB}" fill="#5E7A2A"/><path d="${gF2}" fill="#E8C628"/><path d="${gF}" fill="#F8DE48"/><path d="${uB}" fill="#6E5A4A"/><path d="${uF}" fill="#B26C9E"/>`;
    s += penedoSVG(p, 600, 566, 86, 46, 31) + penedoSVG(p, 1380, 548, 70, 38, 33) + penedoSVG(p, 150, 560, 60, 34, 35) + penedoSVG(p, 780, 556, 46, 24, 37);
    return s;
  }
  // ribeiro: fita de água que vem do vale e desce para a esquerda
  const RIB = [[540, 492, 4], [512, 518, 7], [476, 540, 10], [470, 572, 13], [420, 600, 17], [396, 636, 22], [330, 664, 28], [300, 706, 36], [222, 742, 46], [176, 790, 56], [86, 830, 68], [36, 880, 80], [-40, 930, 90]];
  function ribeiroSVG(p) {
    const esq = [], dir = [], meio = [];
    for (let i = 0; i < RIB.length; i++) {
      const a = RIB[Math.max(0, i - 1)], b = RIB[Math.min(RIB.length - 1, i + 1)];
      let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
      const [x, y, w] = RIB[i];
      esq.push([x + nx * w / 2, y + ny * w / 2 * .5]); dir.push([x - nx * w / 2, y - ny * w / 2 * .5]); meio.push([x, y]);
    }
    const fita = curvaPor(esq.concat(dir.reverse()), true);
    const rnd = semente(41);
    let pedras = '', espuma = '';
    for (let i = 2; i < RIB.length - 1; i++) {
      const [x, y, w] = RIB[i];
      for (let j = 0; j < 2; j++) { const px = x + (rnd() - .5) * w * .7, py = y + (rnd() - .5) * w * .2, r = 3 + w * .08 * rnd(); pedras += elD(px, py, r * 1.4, r * .8); espuma += `M${n(px - r * 2)},${n(py + r * .6)} q${n(r * 2)},${n(r * .8)} ${n(r * 4)},0`; }
    }
    const linhas = [.25, .5, .75].map(k => curvaPor(RIB.map((q, i) => { const b = RIB[Math.min(RIB.length - 1, i + 1)], a = RIB[Math.max(0, i - 1)]; let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const L = Math.hypot(nx, ny) || 1; return [q[0] + nx / L * q[2] * (k - .5) * .8, q[1] + ny / L * q[2] * (k - .5) * .4]; }), false));
    return `<path d="${fita}" fill="#5A7A34" stroke="#4E6A2C" stroke-width="7" stroke-linejoin="round"/>
      <path d="${fita}" fill="url(#${p}agua)"/>
      <path d="${curvaPor(esq.slice(0, RIB.length), false)}" stroke="#2E5E86" stroke-width="3" fill="none" opacity=".35"/>
      ${linhas.map((d, i) => `<path class="ov-rib${i}" d="${d}" stroke="#FFFFFF" stroke-width="${2 + i * .4}" fill="none" stroke-dasharray="${10 + i * 6} ${26 + i * 9}" stroke-linecap="round" opacity=".6"/>`).join('')}
      <path d="${pedras}" fill="#A8A294" stroke="#6E6658" stroke-width="1"/><path class="ov-espuma" d="${espuma}" stroke="#FFFFFF" stroke-width="1.8" fill="none" opacity=".7" stroke-linecap="round"/>`;
  }
  function pradoSVG(p) {
    const rnd = semente(51);
    let s = `<path d="M0,640 C200,628 420,636 640,630 C860,624 1080,636 1300,628 C1440,624 1540,630 1600,628 L1600,900 L0,900 Z" fill="url(#${p}prado)"/>
      <path d="M0,640 C200,628 420,636 640,630 C860,624 1080,636 1300,628 C1440,624 1540,630 1600,628" stroke="#BCD47A" stroke-width="3" fill="none" opacity=".6"/>`;
    // erva parada: um caminho por cor
    const cores = ['#7AA23A', '#A8C860', '#5E862A', '#C2D877'], cam = cores.map(() => '');
    for (let i = 0; i < 520; i++) {
      const y = 642 + Math.pow(rnd(), .8) * 258, x = rnd() * 1640 - 20, k = .4 + (y - 640) / 260 * 1.1;
      const h = (6 + rnd() * 8) * k, inc = (rnd() - .5) * 6 * k, c = rnd() * 4 | 0;
      cam[c] += `M${n(x)},${n(y)} q${n(inc * .4)},${n(-h * .6)} ${n(inc)},${n(-h)}`;
    }
    s += cam.map((d, i) => `<path d="${d}" stroke="${cores[i]}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".85"/>`).join('');
    // flores pequenas paradas: malmequeres brancos, botões amarelos e tufos de urze
    let br = '', am = '', ur = '';
    for (let i = 0; i < 80; i++) {
      const y = 650 + rnd() * 240, x = rnd() * 1600, k = .5 + (y - 650) / 240;
      const r = 3.6 * k, t = rnd();
      if (t < .4) br += elD(x, y, r, r * .6); else if (t < .7) am += elD(x, y, r * .8, r * .55); else ur += elD(x, y, r * 1.6, r * .8);
    }
    s += `<path d="${ur}" fill="#B477A6" opacity=".85"/><path d="${br}" fill="#FFFFFF" opacity=".9"/><path d="${am}" fill="#F4CE3A"/>`;
    return s;
  }
  // moita de giesta grande em primeiro plano (balança)
  function giestaSVG(i, x, y, k, flip) {
    const rnd = semente(400 + i);
    let ramos = '', fl = '', fl2 = '';
    for (let j = 0; j < 16; j++) {
      const a = (j - 7.5) * 8 + (rnd() - .5) * 6, h = (90 + rnd() * 70) * k, bx = (j - 7.5) * 4 * k;
      const ex = bx + Math.sin(a * RAD) * h, ey = -Math.cos(a * RAD) * h;
      ramos += `M${n(bx)},0 Q${n(bx + ex * .2)},${n(ey * .55)} ${n(ex)},${n(ey)}`;
      for (let m = 0; m < 6; m++) {
        const u = .45 + m * .1, fx = bx + (ex - bx) * u + (rnd() - .5) * 8 * k, fy = ey * u + (rnd() - .5) * 6 * k;
        { const e_ = elD(fx, fy, 5.5 * k, 4 * k); if (m % 2) fl += e_; else fl2 += e_; }
      }
    }
    return `<g class="ov-giesta${i}" transform="translate(${x},${y})${flip ? ' scale(-1,1)' : ''}"><g class="ov-giestaIn">
      <path d="${ramos}" stroke="#3E5A1C" stroke-width="${n(3.4 * k)}" fill="none" stroke-linecap="round"/>
      <path d="${ramos}" stroke="#6E8E30" stroke-width="${n(1.6 * k)}" fill="none" stroke-linecap="round"/>
      <path d="${fl2}" fill="#E2B81E" stroke="#B8901A" stroke-width="1"/><path d="${fl}" fill="#FAE04A"/></g></g>`;
  }
  function ervaFrenteSVG(i, x, y, k, flip, urze) {
    const rnd = semente(200 + i);
    let d = '', f = '';
    for (let j = 0; j < 9; j++) {
      const a = (j - 4) * 9 + (rnd() - .5) * 8, h = (44 + rnd() * 40) * k, bx = (j - 4) * 4 * k;
      const ex = bx + Math.sin(a * RAD) * h, ey = -Math.cos(a * RAD) * h;
      d += `M${n(bx - 3 * k)},0 Q${n(bx + ex * .3)},${n(ey * .55)} ${n(ex)},${n(ey)} Q${n(bx + ex * .3 + 4 * k)},${n(ey * .5)} ${n(bx + 3 * k)},0 Z`;
      if (urze) for (let m = 0; m < 3; m++) f += elD(bx + ex * (.6 + m * .15), ey * (.6 + m * .15), 3.4 * k, 2.4 * k);
    }
    return `<g class="ov-erva${i}" transform="translate(${x},${y})${flip ? ' scale(-1,1)' : ''}"><g class="ov-ervaIn"><path d="${d}" fill="${i % 2 ? '#6E9A30' : '#86AE3E'}" stroke="#4A6A1C" stroke-width="1.4" stroke-linejoin="round"/>
      ${urze ? `<path d="${f}" fill="#B86AA4"/>` : `<path d="${d}" fill="none" stroke="#CCE08A" stroke-width=".8" opacity=".5"/>`}</g></g>`;
  }

  /* --- Redil (habitat): curral oval de pedra seca encostado a um penedo; cancela de madeira na frente --- */
  const RED = { cx: 1010, cz: -270, a: 232, b: 166, esp: 30, alt: 102 };
  const GATE = { x0: 906, x1: 1114, z: -122, alt: 96 };
  const yChao = z => CHAO + KZ * z;
  // ponto do muro: ângulo φ (π/2 = meio da frente), altura H, interior?
  function prM(phi, H, dentro) {
    const a = RED.a - (dentro ? RED.esp : 0), b = RED.b - (dentro ? RED.esp * .8 : 0);
    const x = RED.cx + a * Math.cos(phi), z = RED.cz + b * Math.sin(phi);
    return [x, yChao(z) - H];
  }
  const arco = (f0, f1, H, dentro, nps = 18) => Array.from({ length: nps + 1 }, (_, i) => prM(lerp(f0, f1, i / nps), H, dentro));
  const polD = pts => 'M' + pts.map(q => `${n(q[0])},${n(q[1])}`).join('L') + 'Z';
  const FI_E = Math.acos((GATE.x0 - RED.cx) / RED.a), FI_D = Math.acos((GATE.x1 - RED.cx) / RED.a);   // ângulos dos esteios
  const FI_Ei = Math.acos((GATE.x0 - RED.cx) / (RED.a - RED.esp)), FI_Di = Math.acos((GATE.x1 - RED.cx) / (RED.a - RED.esp));
  // pedras de um troço do muro (fiadas desencontradas), num só caminho
  function pedrasMuro(f0, f1, H0, H1, dentro, sem, larg = 40) {
    const rnd = semente(sem);
    let d = '', luz = '';
    const fiadas = Math.round((H1 - H0) / 22);
    for (let r = 0; r < fiadas; r++) {
      const ha = H0 + (H1 - H0) * r / fiadas, hb = H0 + (H1 - H0) * (r + 1) / fiadas;
      const comp = Math.abs(f1 - f0) * RED.a, np = Math.max(1, Math.round(comp / larg));
      let f = f0;
      const passos = [];
      for (let i = 0; i <= np; i++) passos.push(lerp(f0, f1, (i + (i > 0 && i < np ? (r % 2 ? .5 : 0) + (rnd() - .5) * .3 : 0)) / np));
      for (let i = 0; i < passos.length - 1; i++) {
        const fa = passos[i], fb = passos[i + 1];
        const ins = .012 + rnd() * .01;
        const A = prM(fa + ins * Math.sign(f1 - f0), ha + 2, dentro), B = prM(fb - ins * Math.sign(f1 - f0), ha + 2 + rnd() * 2, dentro);
        const C = prM(fb - ins * Math.sign(f1 - f0), hb - 2, dentro), D = prM(fa + ins * Math.sign(f1 - f0), hb - 2 - rnd() * 2, dentro);
        if (Math.abs(B[0] - A[0]) < 4) continue;
        const M1 = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + 2], M2 = [(D[0] + C[0]) / 2, (D[1] + C[1]) / 2 - 3];
        d += curvaPor([A, M1, B, C, M2, D], true);
        luz += `M${n(D[0] + 3)},${n(D[1] + 3)} Q${n(M2[0])},${n(M2[1] + 2)} ${n(C[0] - 3)},${n(C[1] + 3)}`;
        f = fb;
      }
    }
    return { d, luz };
  }
  function redilTrasSVG(p) {
    // penedo grande atrás (o curral encosta-se a ele), muro de trás (face de dentro e topo) e a palha
    // penedo grande com outro penedo redondo equilibrado por cima (como os da serra)
    const pen = 'M984,700 C972,640 994,580 1046,548 C1090,522 1160,514 1214,524 C1256,534 1276,566 1284,600 C1300,626 1306,664 1298,700 Z';
    const pen2 = 'M1060,516 C1052,486 1070,456 1104,446 C1136,438 1172,444 1184,468 C1192,490 1182,512 1158,518 C1128,524 1086,524 1060,516 Z';
    const rnd = semente(61);
    let liq = '', liq2 = '';
    for (let i = 0; i < 22; i++) { const x = 1010 + rnd() * 270, y = 450 + rnd() * 230; { const e_ = elD(x, y, 3 + rnd() * 7, 2 + rnd() * 4); if (i % 2) liq += e_; else liq2 += e_; } }
    let s = `<path d="${pen}" fill="url(#${p}granito)" stroke="#6A6254" stroke-width="3"/>
      <path d="M1022,588 C1050,550 1110,530 1170,528" stroke="#F4F0E6" stroke-width="12" fill="none" opacity=".5" stroke-linecap="round"/>
      <path d="M1262,580 C1276,620 1290,650 1292,692 L1236,700 C1238,656 1238,616 1230,580 Z" fill="#6E6658" opacity=".3"/>
      <path d="M1150,532 C1146,560 1152,590 1140,630 M1220,540 C1230,570 1226,600 1240,630 M1040,610 C1060,622 1074,640 1072,670" stroke="#6A6254" stroke-width="2.5" fill="none" opacity=".7" stroke-linecap="round"/>
      <ellipse cx="1124" cy="519" rx="58" ry="7" fill="#4E4840" opacity=".45"/>
      <path d="${pen2}" fill="url(#${p}granito)" stroke="#6A6254" stroke-width="3"/>
      <path d="M1074,494 C1080,470 1100,456 1124,452" stroke="#F4F0E6" stroke-width="9" fill="none" opacity=".55" stroke-linecap="round"/>
      <path d="M1176,474 C1184,494 1178,508 1160,514 C1170,500 1172,488 1176,474 Z" fill="#6E6658" opacity=".35"/>
      <path d="${liq}" fill="#C6C060" opacity=".75"/><path d="${liq2}" fill="#D89A4A" opacity=".55"/>
      <path d="M990,700 C996,690 1016,686 1036,690 C1046,680 1066,684 1076,694 Z M1240,700 C1250,688 1270,686 1290,694 L1300,700 Z" fill="#6E8E30"/>`;
    // chão do redil (palha) e um monte de palha encostado ao muro de trás, do lado esquerdo
    const chao = arco(0, TAU, 0, true, 36);
    s += `<path d="${polD(chao)}" fill="url(#${p}palha)"/>`;
    // face de dentro do muro de trás (φ de π a 2π) e o topo de trás
    const faceD = arco(PI, TAU, RED.alt, true).concat(arco(TAU, PI, 0, true));
    const pd = pedrasMuro(PI + .04, TAU - .04, 0, RED.alt, true, 63, 34);
    const topoT = arco(PI, TAU, RED.alt, false).concat(arco(TAU, PI, RED.alt, true));
    const pt = pedrasMuro(PI, TAU, RED.alt - 4, RED.alt + 18, false, 65, 48);
    s += `<path d="${polD(faceD)}" fill="#5E584C"/><path d="${pd.d}" fill="url(#${p}pedraDentro)" stroke="#4E483E" stroke-width="1.4"/>
      <path d="${pd.luz}" stroke="#C4BCAE" stroke-width="1.6" fill="none" opacity=".5"/>
      <path d="${polD(topoT)}" fill="#A8A092" stroke="#6E6658" stroke-width="2"/>`;
    // palha amontoada lá dentro (atrás, à esquerda) e palhinhas soltas no chão e na soleira
    let ph = '';
    const r2 = semente(67);
    for (let i = 0; i < 40; i++) { const x = 850 + r2() * 120, y = 640 + r2() * 46, a = (r2() - .5) * 2.4; ph += `M${n(x)},${n(y)} l${n(12 * Math.cos(a))},${n(6 * Math.sin(a) - 3)}`; }
    for (let i = 0; i < 26; i++) { const x = 912 + r2() * 196, y = 726 + r2() * 14, a = (r2() - .5) * 2.4; ph += `M${n(x)},${n(y)} l${n(12 * Math.cos(a))},${n(4 * Math.sin(a))}`; }
    s += `<path d="M846,690 C846,660 866,632 900,626 C930,620 960,632 974,652 C984,668 982,684 978,692 Z" fill="url(#${p}palha)" stroke="#B08A3C" stroke-width="1.5"/>
      <path d="${ph}" stroke="#F8E09A" stroke-width="1.8" stroke-linecap="round" opacity=".9"/>
      <path class="ov-palhaCama" d="M930,700 C960,688 1040,686 1090,696 C1060,706 960,708 930,700 Z" fill="#E8C46A"/>`;
    return s;
  }
  function cancelaSVG(p) {
    // cancela de madeira em coordenadas locais: dobradiça em x = 0, a folha vai até x = W (para a esquerda no ecrã)
    const W = GATE.x1 - GATE.x0, yb = yChao(GATE.z) - 6, yt = yb - GATE.alt + 8;
    const travessas = [yt + 6, yt + 30, yt + 56, yb - 14];
    let tr = '', luz = '';
    for (const y of travessas) { tr += `M6,${n(y - 5)} L${W - 6},${n(y - 5)} L${W - 6},${n(y + 5)} L6,${n(y + 5)} Z`; luz += `M8,${n(y - 3.5)} L${W - 8},${n(y - 3.5)}`; }
    return `<g class="ov-cancelaIn">
      <path d="M0,${n(yt - 6)} L12,${n(yt - 6)} L12,${n(yb)} L0,${n(yb)} Z M${W - 12},${n(yt)} L${W},${n(yt)} L${W},${n(yb)} L${W - 12},${n(yb)} Z" fill="url(#${p}madeiraV)" stroke="#4A3220" stroke-width="2.2"/>
      <path d="${tr}" fill="url(#${p}madeiraV)" stroke="#4A3220" stroke-width="2"/>
      <path d="M12,${n(yb - 16)} L${W - 12},${n(yt + 8)} L${W - 12},${n(yt + 20)} L20,${n(yb - 10)} Z" fill="#8A6440" stroke="#4A3220" stroke-width="2"/>
      <path d="${luz} M3,${n(yt - 2)} L3,${n(yb - 2)}" stroke="#D2A878" stroke-width="1.6" opacity=".6"/>
      <path d="M-2,${n(yt + 4)} L16,${n(yt + 4)} M-2,${n(yb - 14)} L16,${n(yb - 14)}" stroke="#3A3A3A" stroke-width="4" stroke-linecap="round"/>
      <path d="M${W - 4},${n(yt + 26)} L${W + 10},${n(yt + 26)}" stroke="#3A3A3A" stroke-width="3.5" stroke-linecap="round"/></g>`;
  }
  function redilFrenteSVG(p) {
    // face de fora do muro da frente, em dois troços (esquerda e direita da entrada), com o topo e os esteios
    const H = RED.alt;
    const faceE = arco(PI, FI_E, H, false).concat(arco(FI_E, PI, 0, false));
    const faceDr = arco(FI_D, 0, H, false).concat(arco(0, FI_D, 0, false));
    const topoE = arco(PI, FI_E, H, false).concat(arco(FI_Ei, PI, H, true));
    const topoD = arco(FI_D, 0, H, false).concat(arco(0, FI_Di, H, true));
    const pe = pedrasMuro(PI - .02, FI_E + .02, 0, H, false, 71), pdr = pedrasMuro(FI_D - .02, .02, 0, H, false, 73);
    const pte = pedrasMuro(PI, FI_E, H - 2, H + 16, false, 75, 44);
    const esteio = (x, sem) => { const yb = yChao(GATE.z), yt = yb - 128; return `<path d="M${x - 10},${n(yb + 2)} L${x - 9},${n(yt + 6)} C${x - 8},${n(yt - 2)} ${x + 8},${n(yt - 2)} ${x + 9},${n(yt + 6)} L${x + 10},${n(yb + 2)} Z" fill="url(#${p}granitoM)" stroke="#5E584C" stroke-width="2.2"/>
      <path d="M${x - 5},${n(yt + 8)} L${x - 5},${n(yb - 4)}" stroke="#EAE4D8" stroke-width="3" opacity=".6" stroke-linecap="round"/>${elD(x + 3, yt + 40 + sem, 3, 2).replace(/.*/, m => `<path d="${m}" fill="#C6C060" opacity=".8"/>`)}`; };
    // palha a espreitar por cima do muro e urze/erva na base (fora da entrada)
    const rnd = semente(77);
    let palha = '';
    for (let i = 0; i < 16; i++) {
      const f = i < 8 ? lerp(PI - .2, FI_E + .1, rnd()) : lerp(FI_D - .1, .2, rnd()), q = prM(f, H + 2, true), a = -PI / 2 + (rnd() - .5) * 1.6;
      palha += `M${n(q[0])},${n(q[1] + 2)} l${n(14 * Math.cos(a))},${n(12 * Math.sin(a))}`;
    }
    let musgo = '';
    for (let i = 0; i < 10; i++) { const f = i < 5 ? lerp(PI - .1, FI_E + .05, rnd()) : lerp(FI_D - .05, .1, rnd()), q = prM(f, rnd() * 60, false); musgo += elD(q[0], q[1], 5 + rnd() * 6, 2 + rnd() * 2); }
    const gp = semente(79);
    let base = '', baseF = '';
    for (const [x0, x1] of [[786, 892], [1128, 1236]]) for (let i = 0; i < 14; i++) {
      const x = lerp(x0, x1, gp()), f = Math.acos(limita((x - RED.cx) / RED.a, -1, 1)), y = prM(f, 0, false)[1] + 4, h = 10 + gp() * 16, a = (gp() - .5) * .8;
      base += `M${n(x - 2)},${n(y)} Q${n(x + Math.sin(a) * h * .3)},${n(y - h * .6)} ${n(x + Math.sin(a) * h)},${n(y - h)} Q${n(x + 2)},${n(y - h * .5)} ${n(x + 2)},${n(y)}Z`;
      if (gp() < .4) baseF += elD(x + Math.sin(a) * h, y - h, 3, 2.2);
    }
    const yG = yChao(GATE.z);
    return `<g class="ov-redilF">
      <path d="${polD(faceE)} ${polD(faceDr)}" fill="#6A6458"/>
      <path d="${pe.d} ${pdr.d}" fill="url(#${p}pedraMuro)" stroke="#5A5448" stroke-width="1.6"/>
      <path d="${pe.luz} ${pdr.luz}" stroke="#F0EADE" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/>
      <path d="${musgo}" fill="#7E9A3A" opacity=".75"/>
      <path d="${polD(topoE)} ${polD(topoD)}" fill="#B8B0A2" stroke="#6E6658" stroke-width="2"/>
      <path d="${pte.d}" fill="#C8C0B2" opacity=".6"/>
      <path d="${palha}" stroke="#EED07A" stroke-width="2.2" stroke-linecap="round"/>
      <path d="${base}" fill="#6E9A30" stroke="#4A6A1C" stroke-width="1"/><path d="${baseF}" fill="#B86AA4"/>
      ${esteio(GATE.x0 - 10, 0)}${esteio(GATE.x1 + 10, 14)}
      <g class="ov-cajado"><path d="M826,${n(yChao(-150) + 30)} L866,${n(yChao(-150) - 110)} C870,${n(yChao(-150) - 128)} 884,${n(yChao(-150) - 132)} 888,${n(yChao(-150) - 118)} C890,${n(yChao(-150) - 110)} 884,${n(yChao(-150) - 104)} 878,${n(yChao(-150) - 108)}" stroke="#4A3018" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M826,${n(yChao(-150) + 30)} L866,${n(yChao(-150) - 110)} C870,${n(yChao(-150) - 128)} 884,${n(yChao(-150) - 132)} 888,${n(yChao(-150) - 118)}" stroke="#9A6E40" stroke-width="3.5" fill="none" stroke-linecap="round"/></g>
      <g class="ov-cancela">${cancelaSVG(p)}</g>
      <g class="ov-chocalho" transform="translate(${GATE.x0 - 10},${n(yG - 108)})"><g class="ov-chocalhoIn">
        <path d="M0,0 L0,12" stroke="#5A3A20" stroke-width="3"/>
        <path d="M-9,30 L-7,14 C-6,9 6,9 7,14 L9,30 C4,33 -4,33 -9,30 Z" fill="#C89A3E" stroke="#6A4A18" stroke-width="2"/>
        <path d="M-5,16 L-6,28" stroke="#F2D488" stroke-width="2" opacity=".8"/><circle cy="32" r="2.6" fill="#4A3418"/></g></g>
    </g>`;
  }

  /* --- Bichos e partículas dos acontecimentos --- */
  function borboletaSVG() {
    return `<g class="ov-borb" display="none"><g class="ov-borbIn">
      <g class="ov-borbA"><path d="M0,0 C-8,-16 -24,-18 -22,-6 C-21,2 -10,4 0,0 Z" fill="#F2A23A" stroke="#7A4410" stroke-width="1.2"/><path d="M0,0 C-10,4 -18,12 -12,16 C-6,18 -2,8 0,0 Z" fill="#E88A2A" stroke="#7A4410" stroke-width="1.2"/><circle cx="-14" cy="-8" r="2.4" fill="#5A2E0A"/></g>
      <g class="ov-borbB"><path d="M0,0 C8,-16 24,-18 22,-6 C21,2 10,4 0,0 Z" fill="#F2A23A" stroke="#7A4410" stroke-width="1.2"/><path d="M0,0 C10,4 18,12 12,16 C6,18 2,8 0,0 Z" fill="#E88A2A" stroke="#7A4410" stroke-width="1.2"/><circle cx="14" cy="-8" r="2.4" fill="#5A2E0A"/></g>
      <path d="M0,-6 L0,10" stroke="#3A2410" stroke-width="3" stroke-linecap="round"/><path d="M0,-6 C-2,-12 -5,-14 -7,-15 M0,-6 C2,-12 5,-14 7,-15" stroke="#3A2410" stroke-width="1.2" fill="none"/></g></g>`;
  }
  function abelhaSVG() {
    return `<g class="ov-abelha" display="none"><g transform="scale(1.4)">
      <ellipse class="ov-asaAb" cx="-2" cy="-6" rx="6" ry="3.4" fill="#EEF6FC" opacity=".8" stroke="#9AA6B2" stroke-width=".6" transform="rotate(-24)"/>
      <ellipse class="ov-asaAb" cx="2" cy="-6" rx="6" ry="3.4" fill="#EEF6FC" opacity=".8" stroke="#9AA6B2" stroke-width=".6" transform="rotate(20)"/>
      <ellipse rx="7" ry="5" fill="#F2C230" stroke="#5A3A10" stroke-width="1"/><path d="M-2,-4.6 L-2,4.6 M2,-4.8 L2,4.8" stroke="#3A2410" stroke-width="2"/><circle cx="7" cy="-1" r="3" fill="#3A2410"/></g></g>`;
  }
  function aguiaSVG() {
    return `<g class="ov-aguia" display="none"><g class="ov-aguiaIn">
      <path class="ov-agAsa" d="M-4,0 C-20,-10 -46,-12 -70,-4 C-62,-2 -58,2 -50,2 C-56,6 -54,8 -46,6 C-30,6 -16,6 -4,4 Z M4,0 C20,-10 46,-12 70,-4 C62,-2 58,2 50,2 C56,6 54,8 46,6 C30,6 16,6 4,4 Z" fill="#5A4636"/>
      <path d="M-10,-2 C-6,-6 6,-6 10,-2 C10,6 6,12 0,18 C-6,12 -10,6 -10,-2 Z" fill="#6E5440"/><path d="M-6,16 L0,24 L6,16 Z" fill="#5A4636"/><circle cy="-6" r="5" fill="#7A5E48"/></g></g>`;
  }
  function lagartixaSVG() {
    return `<g class="ov-lagartixa" display="none"><g class="ov-lagIn">
      <path class="ov-lagCauda" d="M-10,0 C-22,2 -34,-2 -44,4" stroke="#7A6A3A" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse rx="13" ry="4.5" fill="#8A7A44"/><ellipse cx="14" cy="-1" rx="6" ry="4" fill="#8A7A44"/><circle cx="16" cy="-2.5" r="1.2" fill="#1A1408"/>
      <path class="ov-lagPatas" d="M-6,2 l-4,6 M6,2 l4,6 M-6,-2 l-4,-5 M6,-2 l4,-5" stroke="#6A5A30" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M-8,-2 C-2,-4 4,-4 9,-2" stroke="#B4A466" stroke-width="1.4" fill="none"/></g></g>`;
  }
  function particulasSVG() {
    let s = '';
    for (let i = 0; i < 10; i++) s += `<ellipse class="ov-po${i}" display="none" rx="9" ry="6" fill="#D8C8A0"/>`;
    for (let i = 0; i < 10; i++) s += `<path class="ov-pa${i}" display="none" d="M-7,0 L7,0" stroke="#EBCB78" stroke-width="2.4" stroke-linecap="round"/>`;
    for (let i = 0; i < 8; i++) s += `<path class="ov-fl${i}" display="none" d="${nuvemD(6, 5, 5, 90 + i, .2, .7)}" fill="#FFFFFF" stroke="#C9BBA6" stroke-width="1"/>`;
    for (let i = 0; i < 4; i++) s += `<path class="ov-nota${i}" display="none" d="M0,0 C3,-3 7,-3 9,0 C7,3 3,3 0,0 Z" fill="#F8DE48"/>`;
    return s;
  }

  /* ================= 5) Ícone do menu (retrato parado, sem gradientes nem recortes com id) ================= */
  function iconeSVG() {
    const E = estadoCabeca(Object.assign({}, CAB0, { Y: -.22, F: .97, beta: 14, feliz: .25, sorriso: 1, oE: 6, oD: -4, franja: -6 }));
    const cab = cabecaSVG('ovelha-', E, true);
    const la = nuvemD(56, 36, 13, 97, .1, .64, 110, 172);
    return `<circle cx="110" cy="110" r="106" fill="#9CCB54"/><path d="M4,110 A106,106 0 0 1 216,110 Z" fill="#9CCDEE"/>
      <path d="M8,118 C40,96 70,92 104,104 C140,90 180,94 212,116 L214,140 L6,142 Z" fill="#B4C0D2"/>
      <path d="M20,104 l10,-8 l8,6 M150,98 l14,-10 l10,8" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round"/>
      <g fill="#F8DE48"><circle cx="36" cy="160" r="6"/><circle cx="52" cy="178" r="5"/><circle cx="180" cy="164" r="6"/><circle cx="190" cy="148" r="5"/></g>
      <g fill="#B477A6"><circle cx="26" cy="144" r="4"/><circle cx="170" cy="184" r="4"/></g>
      <circle cx="110" cy="110" r="106" fill="none" stroke="#7E9A3E" stroke-width="3"/>
      <path d="${la}" fill="#7A665A" stroke="#7A665A" stroke-width="6" stroke-linejoin="round"/><path d="${la}" fill="#F7F2E9"/>
      <path d="${caracoisD(42, 22, 8, 98, 4, 7, 110, 176)}" fill="none" stroke="#C9BBA6" stroke-width="2" stroke-linecap="round"/>
      <g transform="translate(110,88) scale(1.08)">${cab}</g>`;
  }

  /* ================= 6) montar() ================= */
  // Pose de repouso (fora): de pé, a 3/4 virada para a esquerda e para nós, com a cara a olhar para a criança
  const REP = { X: 650, Z: 0, th: PI - .42 };
  const APROX = { x: 1010, z: 46 };                  // em frente da cancela (cascos a y ≤ 795)
  const DENTRO = { x: 1004, z: -292 };               // onde se deita, dentro do redil
  const TH_DENTRO = -PI - .36;                       // deitada a 3/4, virada para a esquerda e para nós
  const CORPO0 = { alt: 0, incl: 0, rollC: 0, sq: 0, nL: 66, nA: 44, nTh: 0, cTurn: -.62, cB: 16, cRoll: 0, deitado: 0, fAvanca: 0 };
  const ROSTO0 = { olhos: 1, feliz: 0, oE: 0, oD: 0, abE: 0, abD: 0, orelhas: 0, boca: 0, mast: 0, sorriso: .5, olhoEsc: 1 };
  const CAUDA_0 = { cauAmp: 9, cauVel: .55 };
  const DEITADA = { deitado: 1, alt: -98, incl: 0, rollC: 0, sq: -.02, nL: 64, nA: 60, nTh: 0, cTurn: -.78, cB: 14, cRoll: 0 };
  const TROTE = { D: 108, beta: .5, alt: 28, ordem: { tE: 0, fD: 0, tD: .5, fE: .5 } };      // pulinhos: pares diagonais
  const PASSO_ = { D: 86, beta: .64, alt: 20, ordem: { tE: 0, fE: .25, tD: .5, fD: .75 } };  // passo a 4 tempos

  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .4 : 1;
    const p = 'ovelha-';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.innerHTML = `<defs>${defsOvelha(p)}${defsCena(p)}</defs>
      <rect width="1600" height="640" fill="url(#${p}ceu)"/>
      <circle cx="170" cy="120" r="420" fill="url(#${p}solBrilho)"/>
      <circle cx="170" cy="120" r="46" fill="url(#${p}sol)"/>
      <g class="ov-nuvens">${nuvemCeuSVG(0, 1, false)}${nuvemCeuSVG(1, .62, false)}${nuvemCeuSVG(2, .85, true)}${nuvemCeuSVG(3, .5, false)}${nuvemCeuSVG(4, .7, false)}</g>
      ${aguiaSVG()}
      ${serraSVG(p)}
      ${abrigoSVG()}${fumoSVG()}
      <g class="ov-rebanho">${rebanhoSVG()}</g>
      ${encostaSVG(p)}
      ${pradoSVG(p)}
      ${ribeiroSVG(p)}
      ${penedoSVG(p, 440, 752, 136, 100, 81, 'ov-penedoC')}
      <ellipse class="ov-sombraAg" display="none" rx="46" ry="9" fill="#2E3A14" opacity=".18"/>
      <g class="ov-habitat">
        <g class="ov-redilT">${redilTrasSVG(p)}${lagartixaSVG()}</g>
        <g class="ov-slotDentro"></g>
        <g class="ov-redilFrente">${redilFrenteSVG(p)}</g>
        <g class="ov-slotFora">${ovelhaSVG(p)}</g>
      </g>
      <g class="ov-particulas">${particulasSVG()}</g>
      ${abelhaSVG()}${borboletaSVG()}
      ${giestaSVG(0, 70, 908, 1.2, false)}${giestaSVG(1, 1540, 912, 1.1, true)}${giestaSVG(2, 1330, 916, .62, false)}
      ${ervaFrenteSVG(0, 250, 908, 1, false, true)}${ervaFrenteSVG(1, 420, 912, .8, true, false)}${ervaFrenteSVG(2, 1180, 910, .9, false, true)}${ervaFrenteSVG(3, 1420, 908, 1, true, false)}${ervaFrenteSVG(4, 820, 914, .55, false, false)}${ervaFrenteSVG(5, 600, 912, .6, true, true)}
      <rect width="1600" height="900" fill="url(#${p}luzQuente)" pointer-events="none"/>
      <rect width="1600" height="900" fill="url(#${p}vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s), qa = s => Array.from(svg.querySelectorAll(s));
    function poe(el, v) { if (el && el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function poeT(lista, v) { for (const e of lista) poe(e, v); }
    function atr(el, nome, v) { const k = '__' + nome; if (el && el[k] !== v) { el[k] = v; if (v == null) el.removeAttribute(nome); else el.setAttribute(nome, v); } }

    /* --- referências --- */
    const R = {
      habitat: q('.ov-habitat'), ovelha: q('.ov-ovelha'), corpo: q('.ov-corpo'), sombra: q('.ov-sombra'),
      tronco: q('.ov-tronco'), caracois: q('.ov-caracois'), pernasTras: q('.ov-pernasTras'), pernasFrente: q('.ov-pernasFrente'),
      cauda: q('.ov-cauda'), caudaIn: q('.ov-caudaIn'), slotCT: q('.ov-slotCaudaT'), slotCF: q('.ov-slotCaudaF'),
      frente: q('.ov-frente'), slotPT: q('.ov-slotPescT'), slotPF: q('.ov-slotPescF'),
      pb: PESC_R.map((_, i) => qa('.ov-pb' + i)), cab: q('.ov-cab'),
      slotDentro: q('.ov-slotDentro'), slotFora: q('.ov-slotFora'),
      cancela: q('.ov-cancela'), chocalho: q('.ov-chocalhoIn'), palhaCama: q('.ov-palhaCama'),
      nuvens: [0, 1, 2, 3, 4].map(i => q('.ov-nuvem' + i)), rib: [0, 1, 2].map(i => q('.ov-rib' + i)), espuma: q('.ov-espuma'),
      fumo: Array.from({ length: 6 }, (_, i) => q('.ov-fumo' + i)), rebanho: Array.from({ length: 6 }, (_, i) => q('.ov-rb' + i)),
      rbCab: qa('.ov-rbCab'), rbIn: qa('.ov-rbIn'),
      giestas: [0, 1, 2].map(i => q('.ov-giesta' + i + ' .ov-giestaIn')), ervas: Array.from({ length: 6 }, (_, i) => q('.ov-erva' + i + ' .ov-ervaIn')),
      borb: q('.ov-borb'), borbA: q('.ov-borbA'), borbB: q('.ov-borbB'), abelha: q('.ov-abelha'), asasAb: qa('.ov-asaAb'),
      aguia: q('.ov-aguia'), agAsa: q('.ov-agAsa'), sombraAg: q('.ov-sombraAg'),
      lag: q('.ov-lagartixa'), lagIn: q('.ov-lagIn'), lagCauda: q('.ov-lagCauda'), lagPatas: q('.ov-lagPatas'),
      po: Array.from({ length: 10 }, (_, i) => q('.ov-po' + i)), pa: Array.from({ length: 10 }, (_, i) => q('.ov-pa' + i)),
      fl: Array.from({ length: 8 }, (_, i) => q('.ov-fl' + i)), nota: Array.from({ length: 4 }, (_, i) => q('.ov-nota' + i))
    };
    const H = {};
    for (const k of ['orelhaE', 'orelhaD', 'orelhaInE', 'orelhaInD', 'olhoE', 'olhoD', 'narE', 'narD', 'bochE', 'bochD', 'bocaInt', 'bocaG', 'lingua', 'franja', 'rosto', 'rostoC', 'orelhasT', 'orelhasF', 'boca'])
      H[k] = q('.ov-' + k);
    H.ponte = [q('.ov-ponteC'), q('.ov-ponte')]; H.foc = [q('.ov-focC'), q('.ov-foc')]; H.queixo = [q('.ov-queixoC'), q('.ov-queixo')];
    H.iris = [q('.ov-irisE'), q('.ov-irisD')];
    H.palp = ['E', 'D'].map(k => ({ s: q('.ov-palpS' + k), i: q('.ov-palpI' + k), c: q('.ov-cil' + k) }));
    const pernaEl = PERNAS.map(pe => ({
      g: q('.ov-' + pe.id), sup: qa(`.ov-${pe.id}-sup`), inf: qa(`.ov-${pe.id}-inf`), joe: qa(`.ov-${pe.id}-joe`), casco: qa(`.ov-${pe.id}-casco`),
      sombra: q('.ov-sp-' + pe.id)
    }));

    /* --- estado --- */
    const P = Object.assign({ X: REP.X, Z: REP.Z, th: REP.th, nAw: 0, cTurnG: 0, cBG: 0, olharX: 0, olharY: 0, respA: 1, respF: .28,
      somB: 0, somN: 0, somR: 0, cancela: 0, cauA: 0, cauLado: 0, laTrem: 0, fecho0: .1 }, CORPO0, ROSTO0, CAUDA_0);
    let modo = 'fora', reagindo = false, tempo = 0, vivo = true, dentroSlot = false;
    const fase = { resp: 0, cauda: 0 };
    let cabMundo = [0, 0], cabY = -.5, bocaMundo = [0, 0], franjaMundo = [0, 0], caudaMundo = [0, 0];
    const pes = PERNAS.map(pe => ({ pe, x: 0, z: 0, y: 0, inc: 0 }));
    const peDe = id => pes.find(f => f.pe.id === id);
    function restPe(pe, X, Z, th) {
      const u = pe.pu + (pe.fr ? P.fAvanca : 0), v = pe.v;
      return [X + (u * Math.cos(th) - v * Math.sin(th)), Z + (u * Math.sin(th) + v * Math.cos(th))];
    }
    function assentarPes() { for (const f of pes) { const r = restPe(f.pe, P.X, P.Z, P.th); f.x = r[0]; f.z = r[1]; f.y = 0; f.inc = 0; } }
    assentarPes();
    function porDentro(sim) {          // a ovelha passa para entre as camadas do redil (ou volta para a frente de tudo)
      if (sim === dentroSlot) return;
      dentroSlot = sim;
      (sim ? R.slotDentro : R.slotFora).appendChild(R.ovelha);
    }

    /* --- impulsos curtos (orelhas, cauda, cabeça, cancela, chocalho) --- */
    const impulsos = [];
    const IMP = { abE: 0, abD: 0, flick: 0, cabR: 0, cancela: 0, sino: 0, franja: 0, la: 0 };
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
    // a franja e as orelhas seguem a cabeça com atraso (mola sobre a velocidade da cabeça)
    const mola = { x: 0, v: 0, y: 0, vy: 0, ultimo: null };
    function atualizarMola(dt) {
      const h = Math.min(dt, 50) / 1000;
      const vx = mola.ultimo == null ? 0 : (cabMundo[0] - mola.ultimo[0]) / Math.max(h, .001);
      const vy = mola.ultimo == null ? 0 : (cabMundo[1] - mola.ultimo[1]) / Math.max(h, .001);
      mola.ultimo = [cabMundo[0], cabMundo[1]];
      mola.v += (-140 * mola.x - 10 * mola.v - limita(vx, -900, 900) * .8) * h;
      mola.x = limita(mola.x + mola.v * h, -26, 26);
      mola.vy += (-140 * mola.y - 9 * mola.vy - limita(vy, -900, 900) * .9) * h;
      mola.y = limita(mola.y + mola.vy * h, -30, 30);
    }

    /* --- desenhar: lê P e põe as transformações em todas as peças --- */
    let ordemPernas = '', caudaNaFrente = true, pescocoAtras = false, pernasVisiveis = true;
    const tr = (x, y, r) => `translate(${n(x)},${n(y)}) rotate(${n(r)})`;
    function desenhar() {
      const th = P.th, c = Math.cos(th), s = Math.sin(th);
      const resp = Math.sin(fase.resp) * P.respA;
      const altT = P.alt + resp * 1.4;
      const ci = Math.cos(P.incl), si = Math.sin(P.incl);
      const W = (u, v, h) => { const uu = u * ci; return [P.X + uu * c - v * s, P.Z + uu * s + v * c, h + altT + u * si]; };
      const T = w => [w[0], CHAO - w[2] + KZ * w[1]];

      // corpo de lã (elipsoide projetado): alarga de perfil, estreita de frente; treme quando se sacode
      const c0 = T(W(0, 0, HC));
      const rx = Math.hypot(CA * c, CB * s), sq = P.sq + resp * .012 + IMP.la * .02;
      const trem = P.laTrem ? Math.sin(tempo * .08) * P.laTrem : 0;
      poe(R.tronco, `translate(${n(c0[0] + trem * 3)},${n(c0[1])}) rotate(${n(-P.incl / RAD * c + P.rollC + trem * 2)}) scale(${n3(rx / RN * (1 - sq * .5))},${n3(CC / RN * (1 + sq))})`);
      poe(R.caracois, P.laTrem ? `translate(${n(Math.sin(tempo * .11) * 4 * P.laTrem)},${n(Math.cos(tempo * .09) * 3 * P.laTrem)})` : 'translate(0,0)');

      // patas: IK no plano de cada pata, cascos onde estão plantados
      const querPernas = P.deitado < .92;
      if (querPernas !== pernasVisiveis) { pernasVisiveis = querPernas; const v = querPernas ? 'inline' : 'none'; atr(R.pernasTras, 'display', v); atr(R.pernasFrente, 'display', v); pernaEl.forEach(e => atr(e.sombra, 'display', v)); }
      const sg = c >= 0 ? 1 : -1, hx = sg * (.55 + .45 * Math.abs(c));
      const atras = [], frente = [];
      pes.forEach((f, i) => {
        const pe = f.pe, J = W(pe.u, pe.v, pe.h), A = [f.x, f.z, f.y + TORNOZELO];
        const dx = A[0] - J[0], dz = A[1] - J[1], dh = A[2] - J[2];
        const du = dx * c + dz * s, dv = -dx * s + dz * c;
        const L1 = pe.L1, L2 = pe.L2;
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
        poeT(e.sup, `${tr(Js[0], Js[1], Math.atan2(Ks[1] - Js[1], Ks[0] - Js[0]) / RAD)} scale(${n3(Math.max(.05, l1 / pe.L1))},${sg})`);
        poeT(e.inf, `${tr(Ks[0], Ks[1], Math.atan2(As[1] - Ks[1], As[0] - Ks[0]) / RAD)} scale(${n3(Math.max(.05, l2 / pe.L2))},${sg})`);
        poeT(e.joe, `translate(${n(Ks[0])},${n(Ks[1])})`);
        poeT(e.casco, `translate(${n(As[0])},${n(As[1])}) rotate(${n(f.inc * sg)}) scale(${n3(hx)},1)`);
        (pe.v * c + pe.u * s * .25 > 0 ? frente : atras).push([J[1], i]);
        const gy = CHAO + KZ * f.z, al = limita(f.y / 40, 0, 1);
        poe(e.sombra, `translate(${n(f.x + 5)},${n(gy + 2)}) scale(${n3(1 - al * .5)})`);
        atr(e.sombra, 'opacity', n3(1 - al * .7));
      });
      atras.sort((a, b) => a[0] - b[0]); frente.sort((a, b) => a[0] - b[0]);
      const chave = atras.map(a => a[1]).join('') + '|' + frente.map(a => a[1]).join('');
      if (chave !== ordemPernas) {
        ordemPernas = chave;
        for (const [, i] of atras) R.pernasTras.appendChild(pernaEl[i].g);
        for (const [, i] of frente) R.pernasFrente.appendChild(pernaEl[i].g);
      }

      // cauda: tufo na garupa (atrás do corpo quando a ovelha está virada para nós)
      const querCF = caudaNaFrente ? s < .3 : s < .18;
      if (querCF !== caudaNaFrente) { caudaNaFrente = querCF; (querCF ? R.slotCF : R.slotCT).appendChild(R.cauda); }
      {
        const cb = T(W(-CA + 6, 0, HC + 30));
        caudaMundo = cb;
        const abano = (P.cauAmp * Math.sin(fase.cauda) + IMP.flick + P.cauLado) * (.45 + .55 * Math.abs(s));
        const ergue = -sg * P.cauA;
        poe(R.cauda, `translate(${n(cb[0] + c * 4)},${n(cb[1])})`);
        poe(R.caudaIn, `rotate(${n(ergue + abano)}) scale(${n3(.75 + .25 * Math.abs(s))},1)`);
      }

      // pescoço (3 bolas de lã) e cabeça
      const querPT = pescocoAtras ? s < -.12 : s < -.3;
      if (querPT !== pescocoAtras) { pescocoAtras = querPT; (querPT ? R.slotPT : R.slotPF).appendChild(R.frente); }
      const w0 = W(PESC0.u, 0, PESC0.h), raizS = T(w0);
      const an = (P.nA + P.nAw + P.somN * 10) * RAD + P.incl, g = th + P.nTh;
      const hw = [w0[0] + P.nL * Math.cos(an) * Math.cos(g), w0[1] + P.nL * Math.cos(an) * Math.sin(g), w0[2] + P.nL * Math.sin(an)];
      const top = T(hw);
      PESC_U.forEach((u, i) => poeT(R.pb[i], `translate(${n(lerp(raizS[0], top[0], u))},${n(lerp(raizS[1], top[1], u))})`));
      const psi = th + P.nTh + P.cTurn + P.cTurnG;
      const Y = Math.cos(psi), F = Math.sin(psi);
      cabY = Y; cabMundo = top;
      const rot = P.cRoll + P.somR + IMP.cabR;
      poe(R.cab, `translate(${n(top[0])},${n(top[1])}) rotate(${n(rot)}) scale(${ECAB})`);
      const fecho = limita(1 - P.olhos * (1 - piscar) * (1 - P.fecho0), 0, 1);
      const E = estadoCabeca({ Y, F, beta: P.cB + P.cBG - P.somN * 16, oE: P.oE - mola.y * .6, oD: P.oD - mola.y * .6, abE: P.abE + IMP.abE + mola.x * .5, abD: P.abD + IMP.abD - mola.x * .5,
        orelhas: P.orelhas, fecho, feliz: P.feliz, boca: Math.max(P.boca, P.somB), mast: P.mast, olharX: P.olharX, olharY: P.olharY, sorriso: P.sorriso, olhoEsc: P.olhoEsc,
        franja: limita(-mola.x * .9 + IMP.franja, -26, 26) });
      for (const k of ['orelhaE', 'orelhaD', 'olhoE', 'olhoD', 'narE', 'narD', 'bochE', 'bochD', 'bocaInt', 'lingua', 'franja']) poe(H[k], E.t[k]);
      atr(H.bocaG, 'opacity', String(E.op.bocaInt)); atr(H.lingua, 'rx', String(E.a.linguaRx)); atr(H.lingua, 'ry', String(E.a.linguaRy));
      for (const k of ['olhoE', 'olhoD', 'narE', 'narD', 'bochE', 'bochD', 'orelhaInE', 'orelhaInD']) atr(H[k], 'opacity', String(E.op[k]));
      atr(H.rosto, 'opacity', String(E.op.rosto)); atr(H.rostoC, 'opacity', String(E.op.rosto));
      poeT(H.ponte, E.t.ponte); poeT(H.foc, E.t.foc); poeT(H.queixo, E.t.queixo);
      atr(H.boca, 'd', E.d.boca);
      atr(H.bocaInt, 'ry', String(E.a.bocaRy)); atr(H.bocaInt, 'rx', String(E.a.bocaRx));
      poeT(H.iris, E.t.iris);
      H.palp.forEach(e => { atr(e.s, 'd', E.d.palpS); atr(e.i, 'd', E.d.palpI); atr(e.c, 'd', E.d.cil); });
      for (const k of ['E', 'D']) { const alvo = E.a['frente' + k] ? H.orelhasF : H.orelhasT; if (H['orelha' + k].parentNode !== alvo) alvo.appendChild(H['orelha' + k]); }
      const rr = rot * RAD, cr = Math.cos(rr), sr = Math.sin(rr);
      const paraMundo = (x, y) => [top[0] + ECAB * (x * cr - y * sr), top[1] + ECAB * (x * sr + y * cr)];
      bocaMundo = paraMundo(E.a.boca[0], E.a.boca[1]);
      franjaMundo = paraMundo(Y * 2, -50);

      // sombra no chão (a luz vem de cima à esquerda: a sombra cai um pouco para a direita)
      const g0 = T([P.X, P.Z, 0]), voo = limita(P.alt / 60, 0, 1);
      poe(R.sombra, `translate(${n(g0[0] + 22)},${n(g0[1] + 4)}) scale(${n((rx * .95 + 10 * P.deitado) * (1 - voo * .3))},${n(24 + 6 * P.deitado)})`);
      atr(R.sombra, 'opacity', n3(1 - voo * .5));

      // cancela (abre para fora, dobradiça no esteio da direita) e chocalho
      const ph = (P.cancela * 120 + IMP.cancela) * RAD;
      poe(R.cancela, `matrix(${n3(-Math.cos(ph))},${n3(Math.sin(ph) * KZ)},0,1,${GATE.x1},0)`);
      poe(R.chocalho, `rotate(${n(IMP.sino)})`);
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
          const base = P.th + P.nTh + P.cTurn;
          if (Math.sin(base) > -.2) {
            const Yd = limita(dx / 320, -.92, .92);
            aT = limita(Math.acos(Yd) - base, -1.4, 1.4);
            aB = limita(dy / 260 * 22, -26, 22);
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
      // de cabeça perto do chão (a pastar) a cabeça não acompanha o olhar
      const kk = P.nA < 0 ? 0 : 1;
      P.cTurnG += (aT * kk - P.cTurnG) * kC; P.cBG += (aB * kk - P.cBG) * kC;
    }
    const tiques = { orelha: aleat(2000, 5000), cauda: aleat(3000, 7000) };
    function atualizarTiques(dt) {
      tiques.orelha -= dt; tiques.cauda -= dt;
      if (tiques.orelha <= 0) {
        tiques.orelha = aleat(1800, 5000);
        impulso(Math.random() < .5 ? 'abE' : 'abD', aleat(16, 28), aleat(260, 380));
      }
      if (tiques.cauda <= 0) { tiques.cauda = aleat(2500, 6500); impulso('flick', aleat(18, 30) * (Math.random() < .5 ? -1 : 1), aleat(500, 800), 'onda'); }
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
    function* depois(ms, g) { yield* espera(ms); yield* g; }
    const sem = (o, ...ks) => { const r = Object.assign({}, o); for (const k of ks) delete r[k]; return r; };

    /* --- pés: um passo (levanta, avança em arco, pousa) e recompor os pés fora do sítio --- */
    function* passo1(f, alvo, ms, alt = 22) {
      const x0 = f.x, z0 = f.z, y0 = f.y;
      yield* durante(ms, u => {
        const e = eseno(u);
        f.x = lerp(x0, alvo[0], e); f.z = lerp(z0, alvo[1], e); f.y = lerp(y0, 0, e) + sino(u) * alt; f.inc = -sino(u) * 24;
      });
      f.y = 0; f.inc = 0;
    }
    function* recomporPes(ms = 240) {
      const fora = pes.filter(f => { const r = restPe(f.pe, P.X, P.Z, P.th); return f.y > .5 || Math.hypot(f.x - r[0], f.z - r[1]) > 3; });
      if (!fora.length) return;
      const lado = l => fora.filter(f => f.pe.lado === l);
      for (const grupo of [lado(1), lado(-1)]) {
        if (!grupo.length) continue;
        yield* juntos(...grupo.map((f, i) => (function* () { yield* espera(i * 40); yield* passo1(f, restPe(f.pe, P.X, P.Z, P.th), ms, 20); })()));
      }
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
        P.alt = 6 * Math.abs(Math.sin(u * PI * 4)) * sino(u);
        for (const st of plano) {
          if (u < st.a || st.feito) continue;
          if (!st.de) { st.de = [st.f.x, st.f.z]; st.y0 = st.f.y; st.para = restPe(st.f.pe, P.X, P.Z, thEm(st.ua)); }
          const v = limita((u - st.a) / (st.b - st.a), 0, 1);
          st.f.x = lerp(st.de[0], st.para[0], eseno(v)); st.f.z = lerp(st.de[1], st.para[1], eseno(v)); st.f.y = lerp(st.y0, 0, eseno(v)) + sino(v) * 26; st.f.inc = -sino(v) * 24;
          if (v >= 1) { st.feito = true; st.f.y = 0; st.f.inc = 0; }
        }
      });
      P.nTh = 0; P.alt = 0;
    }

    /* --- andar aos pulinhos (ou a passo) em linha reta: cada casco planta-se num ponto do mundo (por distância) --- */
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
    function* andarPara(x1, z1, ms, G, acertar = true) {   // acertar = false quando a seguir vem virar() (que já pisa)
      const x0 = P.X, z0 = P.Z, dx = x1 - x0, dz = z1 - z0, total = Math.hypot(dx, dz) || 1, ux = dx / total, uz = dz / total;
      const base = pes.map(f => [f.x, f.z]);
      const trote = G === TROTE;
      yield* durante(ms, u => {
        const d = total * perfilAndar(u);
        P.X = x0 + ux * d; P.Z = z0 + uz * d;
        const m = Math.min(suave(limita(u / .14, 0, 1)), suave(limita((1 - u) / .14, 0, 1)));
        pes.forEach((f, i) => {
          const r = pePasso(d, G.ordem[f.pe.id], total, G);
          f.x = base[i][0] + ux * r.F; f.z = base[i][1] + uz * r.F; f.y = r.alt * G.alt; f.inc = -r.alt * (trote ? 30 : 22);
        });
        const ph = d / G.D * TAU;
        // pulinhos: o corpo salta em cada passo e a lã balança (compressão ao pousar)
        P.alt = (trote ? 10 : 3) * (1 - Math.cos(2 * ph)) / 2 * m;
        P.sq = (trote ? .045 : .015) * Math.cos(2 * ph) * m;
        P.nAw = (trote ? 6 : 3) * Math.sin(2 * ph + .9) * m;
        P.abE = (trote ? 16 : 6) * Math.sin(2 * ph + 1.4) * m; P.abD = (trote ? 16 : 6) * Math.sin(2 * ph + 1.9) * m;
        P.cauA = (trote ? 22 : 8) * m;
      });
      P.nAw = 0; P.cauA = 0; P.alt = 0; P.sq = 0; P.abE = 0; P.abD = 0;
      const fora = pes.filter(f => { const r = restPe(f.pe, P.X, P.Z, P.th); return Math.hypot(f.x - r[0], f.z - r[1]) > 3 || f.y > .5; });
      if (acertar && fora.length) yield* juntos(...fora.map((f, i) => (function* () { yield* espera(i * 40); yield* passo1(f, restPe(f.pe, P.X, P.Z, P.th), 180, 14); })()));
    }

    /* --- partículas: pó, palhinhas, fiapos de lã, pétalas de giesta --- */
    const po = R.po.map(el => ({ el, vivo: false })), pa = R.pa.map(el => ({ el, vivo: false })), fl = R.fl.map(el => ({ el, vivo: false })), pet = R.nota.map(el => ({ el, vivo: false }));
    function soltarPo(x, y, k, forca = 1) {
      for (let i = 0; i < k; i++) {
        const f = po.find(o => !o.vivo); if (!f) return;
        Object.assign(f, { vivo: true, x: x + aleat(-12, 12), y: y + aleat(-3, 3), vx: aleat(-.06, .06) * forca, vy: aleat(-.05, -.015) * forca, t: 0, dur: aleat(600, 1000), s: aleat(.5, 1) });
        atr(f.el, 'display', 'inline');
      }
    }
    function soltarPalha(x, y, k, larg = 20) {
      for (let i = 0; i < k; i++) {
        const f = pa.find(o => !o.vivo); if (!f) return;
        Object.assign(f, { vivo: true, x: x + aleat(-larg, larg), y: y + aleat(-4, 4), vx: aleat(-.06, .06), vy: aleat(-.16, -.08), r: aleat(0, 180), t: 0, chao: y + aleat(10, 30), fase: aleat(0, 6) });
        atr(f.el, 'display', 'inline'); atr(f.el, 'opacity', '1');
      }
    }
    function soltarLa(x, y, k) {
      for (let i = 0; i < k; i++) {
        const f = fl.find(o => !o.vivo); if (!f) return;
        Object.assign(f, { vivo: true, x: x + aleat(-60, 60), y: y + aleat(-30, 20), vx: aleat(-.08, .08), vy: aleat(-.07, -.02), t: 0, dur: aleat(1200, 1800), r: aleat(0, 360), s: aleat(.6, 1.1) });
        atr(f.el, 'display', 'inline');
      }
    }
    function soltarPetalas(x, y, k) {
      for (let i = 0; i < k; i++) {
        const f = pet.find(o => !o.vivo); if (!f) return;
        Object.assign(f, { vivo: true, x: x + aleat(-14, 14), y: y + aleat(-8, 8), vx: aleat(-.04, .04), vy: aleat(.01, .03), t: 0, dur: aleat(1400, 2000), r: aleat(0, 360), fase: aleat(0, 6) });
        atr(f.el, 'display', 'inline');
      }
    }
    function animarParticulas(dt) {
      for (const f of po) {
        if (!f.vivo) continue;
        f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy += dt * .00004;
        const u = f.t / f.dur;
        if (u >= 1) { f.vivo = false; atr(f.el, 'display', 'none'); continue; }
        poe(f.el, `translate(${n(f.x)},${n(f.y)}) scale(${n3(f.s * (.5 + u * 1.2))})`); atr(f.el, 'opacity', n3(.55 * (1 - u)));
      }
      for (const f of pa) {
        if (!f.vivo) continue;
        f.t += dt;
        if (f.vy < 0 || f.y < f.chao) {
          f.vy = Math.min(.08, f.vy + dt * .0004);
          f.x += (f.vx + Math.sin(f.t * .005 + f.fase) * .03) * dt; f.y += f.vy * dt; f.r += dt * .25;
          if (f.vy > 0 && f.y >= f.chao) { f.y = f.chao; f.t = 0; f.vy = 0; f.r = (f.r % 180) * .1; f.pousada = true; }
          poe(f.el, `translate(${n(f.x)},${n(f.y)}) rotate(${n(f.r + 30 * Math.sin(f.t * .006))})`);
        } else {
          atr(f.el, 'opacity', n3(limita(1 - f.t / 1200, 0, 1)));
          if (f.t > 1200) { f.vivo = false; atr(f.el, 'display', 'none'); }
        }
      }
      for (const f of fl) {
        if (!f.vivo) continue;
        f.t += dt; f.x += (f.vx + Math.sin(f.t * .004 + f.r) * .03) * dt; f.y += f.vy * dt; f.vy += dt * .00003; f.r += dt * .05;
        const u = f.t / f.dur;
        if (u >= 1) { f.vivo = false; atr(f.el, 'display', 'none'); continue; }
        poe(f.el, `translate(${n(f.x)},${n(f.y)}) rotate(${n(f.r)}) scale(${n3(f.s)})`); atr(f.el, 'opacity', n3(.95 * (1 - u * u)));
      }
      for (const f of pet) {
        if (!f.vivo) continue;
        f.t += dt; f.x += (f.vx + Math.sin(f.t * .006 + f.fase) * .05) * dt; f.y += f.vy * dt; f.r += dt * .2;
        const u = f.t / f.dur;
        if (u >= 1) { f.vivo = false; atr(f.el, 'display', 'none'); continue; }
        poe(f.el, `translate(${n(f.x)},${n(f.y)}) rotate(${n(f.r)})`); atr(f.el, 'opacity', n3(1 - u * u));
      }
    }
    // um comportamento interrompido limpa o que criou (abelha, tremor da lã, cauda)
    function limparComportamento() {
      atr(R.abelha, 'display', 'none');
      P.laTrem = 0; P.cauLado = 0; P.cauAmp = CAUDA_0.cauAmp; P.cauVel = CAUDA_0.cauVel; P.fecho0 = .1;
    }

    /* --- comportamentos (fora): 8 diferentes, ao acaso a cada 4–9 s, sem repetir --- */
    function* recompor(ms = 420) {
      yield* recomporPes();
      yield* tw(Object.assign({}, CORPO0, ROSTO0), ms);
    }
    function* mastigar(ms, forca = 1) {          // o queixo mói de lado (ruminar) e a boca mexe um bocadinho
      yield* durante(ms, (u, t) => {
        const k = forca * Math.min(1, t / 200, (ms - t) / 200);
        const f = t / 1000 * TAU * 1.7;
        P.mast = Math.sin(f) * 1.4 * k; P.boca = (.05 + Math.max(0, Math.sin(2 * f)) * .12) * k;
      });
      P.mast = 0; P.boca = 0;
    }
    function* pastar() {                       // baixa a cabeça até à erva, arranca tufos e mastiga
      yield* tw({ nL: 118, nA: -64, cB: 60, cTurn: -.25, incl: -.1, alt: -8, oE: 12, oD: 12, sq: -.02 }, 1000, eio);
      for (let i = 0; i < 3; i++) {
        yield* tw({ boca: .35, cB: 66 }, 200);
        yield* juntos(tw({ boca: 0, cB: 56, nAw: 5 }, 180, esai), depois(100, (function* () { soltarPo(bocaMundo[0], bocaMundo[1] + 10, 1, .4); })()));
        yield* juntos(mastigar(900), tw({ nAw: 0 }, 400));
        if (Math.random() < .5) impulso('flick', 22, 600, 'onda');
      }
      impulso(Math.random() < .5 ? 'abE' : 'abD', 22, 320);
      yield* tw(Object.assign({}, CORPO0, { oE: 0, oD: 0 }), 1000, eio);
    }
    function* ruminar() {                      // fica a ruminar, de olhos meio fechados e orelhas descaídas
      yield* tw({ fecho0: .45, oE: 14, oD: 14, cRoll: 6, cB: 20 }, 600);
      yield* mastigar(2600, 1.1);
      impulso('abD', 20, 300);
      yield* juntos(mastigar(1200, .8), tw({ cRoll: -4 }, 1200));
      yield* tw({ fecho0: .1, oE: 0, oD: 0, cRoll: 0, cB: CORPO0.cB }, 500);
    }
    function* sacudirLa() {                    // sacode a lã toda, das orelhas à cauda (saem fiapos)
      yield* tw({ sq: .05, olhos: .6, oE: 10, oD: 10 }, 260);
      yield* durante(1200, (u, t) => {
        const e = sino(u);
        P.laTrem = e; P.rollC = 9 * Math.sin(t * .05) * e; P.nTh = .22 * Math.sin(t * .05 + .8) * e; P.cRoll = 16 * Math.sin(t * .05 + 1.4) * e;
        P.abE = 46 * Math.sin(t * .05 + 1.6) * e; P.abD = -46 * Math.sin(t * .05 + 1.6) * e; P.olhos = 1 - .95 * e; P.sq = .05 * (1 - u) + .03 * Math.sin(t * .1) * e;
        P.cauLado = 30 * Math.sin(t * .06) * e;
      });
      P.laTrem = 0; P.cauLado = 0;
      soltarLa(cabMundo[0] + (caudaMundo[0] - cabMundo[0]) * .5, cabMundo[1] + 40, 4);
      impulso('franja', 16, 800, 'mola'); impulso('abE', 20, 700, 'mola'); impulso('abD', -20, 700, 'mola'); impulso('la', 1, 600, 'mola');
      yield* tw({ rollC: 0, nTh: 0, cRoll: 0, abE: 0, abD: 0, olhos: 1, sq: 0, oE: 0, oD: 0 }, 400);
    }
    function* pinote(alto, ms, giro = 0) {     // salto no sítio com as quatro patas (pousam no mesmo sítio)
      yield* tw({ alt: -12, sq: -.07, nA: CORPO0.nA - 8, oE: -6, oD: -6 }, ms * .25, esai);
      yield* durante(ms * .55, u => {
        const e = sino(u);
        P.alt = -12 * (1 - Math.min(1, u * 4)) + alto * e; P.sq = lerp(-.07, .06, Math.min(1, u * 3)) * (1 - u) + .02;
        for (const f of pes) { f.y = alto * .55 * e; f.inc = -14 * e; }
        P.rollC = giro * Math.sin(u * PI); P.abE = -30 * e; P.abD = -30 * e; P.nA = CORPO0.nA + 10 * e;
      });
      for (const f of pes) { f.y = 0; f.inc = 0; }
      impulso('la', 1, 500, 'mola'); impulso('franja', 14, 600, 'mola');
      soltarPo(P.X, CHAO + KZ * P.Z, 2, .5);
      yield* tw({ alt: 0, sq: -.04, abE: 10, abD: 10, rollC: 0 }, ms * .12, esai);
      yield* tw({ sq: 0, abE: 0, abD: 0, nA: CORPO0.nA }, ms * .2, eio);
    }
    function* saltitar() {                     // pulinhos de alegria no sítio
      yield* tw({ feliz: .45, olhoEsc: 1.1, orelhas: .4, sorriso: 1 }, 200);
      impulso('flick', 30, 700, 'onda');
      yield* pinote(42, 620, 6); yield* pinote(30, 520, -5);
      yield* tw({ feliz: 0, olhoEsc: 1, orelhas: 0, sorriso: ROSTO0.sorriso }, 400);
    }
    const PEN = { x: 440, y: 652 };            // o penedo onde se coça
    function* cocarPenedo() {                  // encosta a bochecha ao penedo e esfrega-se, de olhos fechados
      yield* tw({ nL: 104, nA: -58, nTh: .2, cB: 26, cTurn: -1.1, incl: -.06, alt: -4, oE: 8, oD: 8 }, 900, eio);
      yield* tw({ olhos: .3, feliz: 1, sorriso: 1 }, 260);
      yield* durante(2400, (u, t) => {
        const e = Math.min(1, t / 300, (2400 - t) / 300);
        P.cRoll = 14 * Math.sin(t * .012) * e; P.nTh = .2 + .1 * Math.sin(t * .012 + .5) * e; P.nA = -58 + 5 * Math.sin(t * .024) * e;
        P.abE = 12 * Math.sin(t * .024) * e; P.abD = -12 * Math.sin(t * .024) * e; P.cauAmp = 9 + 12 * e;
      });
      P.cauAmp = CAUDA_0.cauAmp;
      impulso('franja', 12, 700, 'mola');
      yield* tw({ olhos: 1, feliz: 0, sorriso: ROSTO0.sorriso }, 300);
      yield* tw(Object.assign({}, CORPO0, { oE: 0, oD: 0, abE: 0, abD: 0 }), 900, eio);
    }
    const PT = { abrigo: [1330, 440], penedo: [440, 650], redil: [1010, 600], crianca: [700, 640], ribeiro: [330, 680], ceu: [800, 150], giesta: [130, 760], rebanho: [1220, 495], serra: [822, 250] };
    function* olharAbelha() {                  // uma abelha anda pelas giestas e vem ao nariz; a ovelha segue-a e espirra
      const ab = { x: 160, y: 760 };
      atr(R.abelha, 'display', 'inline');
      let tt = 0;
      const desenha = () => { poe(R.abelha, `translate(${n(ab.x)},${n(ab.y)}) rotate(${n(8 * Math.sin(tt * .02))})`); R.asasAb.forEach(a => atr(a, 'ry', n3((.35 + .65 * Math.abs(Math.sin(tt * .9))) * 3.4))); };
      olhar.foco = () => [ab.x, ab.y];
      yield* tw({ orelhas: .3, oE: -4, oD: -4 }, 300);
      yield* durante(2400, (u, t) => { tt = t; ab.x = 160 + 120 * Math.sin(t * .0016) + 30 * Math.sin(t * .007); ab.y = 740 - 60 * Math.sin(t * .0012) + 14 * Math.cos(t * .011); desenha(); if (Math.random() < .004) impulso('abE', 16, 260); });
      const x0 = ab.x, y0 = ab.y;
      yield* durante(1300, (u, t) => { tt += 16; const e = eio(u), alvo = [bocaMundo[0] - 30 * Math.sign(cabY || -1), bocaMundo[1] - 30]; ab.x = lerp(x0, alvo[0], e) + 14 * Math.sin(tt * .02) * (1 - u); ab.y = lerp(y0, alvo[1], e) - 40 * sino(u) + 8 * Math.cos(tt * .03); desenha(); P.olharX = lerp(P.olharX, .6 * -Math.sign(cabY || -1), .1); });
      olhar.foco = () => [bocaMundo[0] - 10, bocaMundo[1] - 50];
      yield* durante(700, (u, t) => { tt += 16; ab.x = bocaMundo[0] - 30 * Math.sign(cabY || -1) + 6 * Math.sin(tt * .04); ab.y = bocaMundo[1] - 30 + 5 * Math.cos(tt * .05); desenha(); });
      // espirro: antecipação (cabeça para trás, olhos fechados) e o espirro (cabeça para a frente)
      yield* tw({ cB: -4, nA: 54, olhos: .2, boca: .3 }, 380, eio);
      yield* tw({ cB: 34, nA: 34, olhos: 0, boca: .6 }, 110, esai);
      impulso('la', 1, 500, 'mola'); impulso('abE', 30, 400, 'mola'); impulso('abD', -30, 400, 'mola'); impulso('franja', 18, 600, 'mola');
      const x1 = ab.x, y1 = ab.y;
      yield* juntos(tw({ boca: 0, olhos: 1, cB: CORPO0.cB, nA: CORPO0.nA }, 500), durante(1500, (u, t) => { tt += 16; ab.x = x1 - 500 * eentra(u); ab.y = y1 - 260 * u + 20 * Math.sin(tt * .02); desenha(); }));
      olhar.foco = null;
      atr(R.abelha, 'display', 'none');
      yield* tw({ orelhas: 0, oE: 0, oD: 0, olharX: 0 }, 300);
    }
    function* abanarCauda() {                  // olha para trás e abana a cauda muito depressa
      yield* tw({ cTurn: -2.1, cB: 22, nTh: -.5, nA: 36, orelhas: .2 }, 700, eio);
      P.cauVel = 2.6;
      yield* tw({ cauAmp: 30 }, 200);
      yield* durante(1400, (u, t) => { P.rollC = 3 * Math.sin(t * .03) * sino(u); });
      yield* tw({ cauAmp: CAUDA_0.cauAmp }, 300);
      P.cauVel = CAUDA_0.cauVel;
      yield* tw({ cTurn: CORPO0.cTurn, cB: CORPO0.cB, nTh: 0, nA: CORPO0.nA, orelhas: 0, rollC: 0 }, 700, eio);
    }
    function* olharCrianca() {                 // vira a cara para nós, inclina-a e pisca os olhos, contente
      yield* tw({ cTurn: PI / 2 - P.th + .05, cB: 10, nA: 50, olhoEsc: 1.08, orelhas: .4 }, 800, eio);
      yield* tw({ cRoll: 12 }, 380);
      yield* tw({ olhos: .05, feliz: .6 }, 340, eseno); yield* espera(160); yield* tw({ olhos: 1, feliz: 0 }, 380, eseno);
      yield* tw({ cRoll: -10, sorriso: 1 }, 520);
      impulso('abE', 22, 300); yield* espera(400); impulso('abD', 22, 300);
      yield* tw({ cRoll: 0 }, 380);
      yield* espera(400);
      yield* tw(Object.assign({}, CORPO0, { olhoEsc: 1, orelhas: 0, sorriso: ROSTO0.sorriso }), 800, eio);
    }
    const COMPORTAMENTOS = { pastar, ruminar, sacudirLa, saltitar, cocarPenedo, olharAbelha, abanarCauda, olharCrianca };
    let ultimoComp = null;
    function* cicloFora() {
      for (;;) {
        yield* espera(aleat(4000, 9000));
        let nome; do nome = escolhe(Object.keys(COMPORTAMENTOS)); while (nome === ultimoComp);
        ultimoComp = nome;
        yield* COMPORTAMENTOS[nome]();
      }
    }

    /* --- reação ao toque (fora): orelhas para cima, olhos contentes, pinote e cauda a abanar --- */
    function* reacaoFora() {
      reagindo = true;
      impulso('flick', 40, 700, 'onda');
      P.cauVel = 2.2; P.cauAmp = 22;
      const rosto = tw({ orelhas: .5, oE: -8, oD: -8, feliz: .7, olhos: 1, sorriso: 1, boca: 0, olhoEsc: 1.08, fecho0: .1 }, 100, esai);
      const corpo = (function* () {
        yield* juntos(recomporPes(180), tw(Object.assign({}, CORPO0, { nA: CORPO0.nA + 6, cB: CORPO0.cB - 6, cTurn: CORPO0.cTurn - .25 }), 200, esai));
        yield* pinote(36, 560, 7);
        yield* durante(500, u => { P.cRoll = 10 * Math.sin(u * PI * 2) * (1 - u * .5); P.laTrem = .5 * sino(u); });
        P.laTrem = 0;
        yield* tw({ cRoll: 0 }, 200);
      })();
      yield* juntos(rosto, corpo);
      yield* espera(200);
      reagindo = false;
      P.cauVel = CAUDA_0.cauVel; P.cauAmp = CAUDA_0.cauAmp;
      yield* tw(Object.assign({}, ROSTO0, CORPO0), 500);
    }

    /* --- dentro: deitada e enroscada na palha; rumina, olha para nós, dormita, abana as orelhas --- */
    function* ruminarDeitada() {
      yield* tw({ fecho0: .35, oE: 12, oD: 12, cRoll: 5 }, 500);
      yield* mastigar(2400, 1);
      yield* tw({ fecho0: .1, oE: 0, oD: 0, cRoll: 0 }, 400);
    }
    function* olharDeitada() {
      yield* tw({ cTurn: PI / 2 - P.th + .1, cB: 12, orelhas: .3 }, 600, eio);
      olhar.foco = () => PT.crianca;
      yield* juntos(espera(900), depois(300, (function* () { yield* tw({ olhos: .1, feliz: .5 }, 300, eseno); yield* tw({ olhos: 1, feliz: 0 }, 300, eseno); })()));
      olhar.foco = null;
      impulso('abD', 20, 280);
      yield* tw(Object.assign({}, DEITADA, { orelhas: 0 }), 700, eio);
    }
    function* dormitar() {                     // os olhos fecham-se devagar e a cabeça descai; acorda com um abanão de orelhas
      yield* tw({ fecho0: .7, nA: 26, cB: 30, oE: 20, oD: 20, cRoll: 8 }, 1200, eseno);
      yield* tw({ fecho0: .95, nA: 20, cB: 36 }, 900, eseno);
      yield* espera(900);
      impulso('abE', 30, 400, 'mola'); impulso('abD', -30, 400, 'mola');
      yield* tw({ fecho0: .1, nA: DEITADA.nA, cB: DEITADA.cB, oE: 0, oD: 0, cRoll: 0 }, 300, esai);
      impulso('franja', 12, 600, 'mola');
    }
    function* cicloDentro() {
      for (;;) {
        yield* espera(aleat(900, 1800));
        const r = Math.random();
        if (r < .4) yield* ruminarDeitada();
        else if (r < .7) yield* olharDeitada();
        else if (r < .9) yield* dormitar();
        else { impulso('abE', 24, 300); yield* espera(300); impulso('abD', 24, 300); yield* espera(400); }
        yield* tw(DEITADA, 300);
      }
    }
    function* reacaoDentro() {
      impulso('flick', 30, 700, 'onda');
      yield* tw({ orelhas: .5, oE: -6, oD: -6, feliz: .8, olhos: 1, fecho0: .1, boca: 0, sorriso: 1 }, 100, esai);
      yield* tw(Object.assign({}, DEITADA, { nA: 54, cB: 8, cTurn: PI / 2 - P.th, orelhas: .5 }), 300, esai);
      olhar.foco = () => PT.crianca;
      yield* durante(800, u => { P.cRoll = 10 * Math.sin(u * PI * 2) * (1 - u * .5); P.alt = DEITADA.alt + 8 * sino(u * 2 % 1) * (1 - u * .5); P.laTrem = .4 * sino(u); });
      P.laTrem = 0;
      soltarPalha(DENTRO.x, yChao(DENTRO.z) - 90, 3, 60);
      impulso('la', 1, 500, 'mola');
      yield* tw({ olhos: .1, feliz: 1 }, 300, eseno); yield* tw({ olhos: 1, feliz: .3 }, 300, eseno);
      olhar.foco = null;
      yield* tw(Object.assign({}, DEITADA, { orelhas: 0, feliz: 0, oE: 0, oD: 0, sorriso: ROSTO0.sorriso }), 600, eio);
    }

    /* --- ida ao redil: vira-se, vai aos pulinhos, a cancela abre-se, vira-se para a entrada, entra,
           a cancela fecha-se, vira-se lá dentro e deita-se enroscada na palha --- */
    // ângulo equivalente a «a» mais perto do rumo atual (para virar pelo lado mais curto)
    const perto = a => { while (a - P.th > PI) a -= TAU; while (a - P.th < -PI) a += TAU; return a; };
    function* ida() {
      modo = 'indo'; reagindo = false;
      olhar.foco = () => PT.redil; olhar.rapido = true;
      yield* juntos(recomporPes(140), tw(Object.assign({}, ROSTO0, sem(CORPO0, 'cTurn'), { orelhas: .3, feliz: .3 }), 160, esai));
      const thA = Math.atan2(APROX.z - P.Z, APROX.x - P.X);
      let ang = thA; while (ang - P.th > PI) ang -= TAU; while (ang - P.th < -PI) ang += TAU;
      yield* juntos(virar(ang, 360), tw({ cTurn: 0, nA: 46 }, 360), tw({ cancela: 1 }, 600, eio));
      impulso('sino', 16, 900, 'mola');
      olhar.rapido = false; olhar.foco = null;
      yield* juntos(andarPara(APROX.x, APROX.z, 760, TROTE, false), tw({ nA: 40, cB: 18, feliz: 0 }, 760));
      // vira-se de costas para nós (para a entrada) e passa para entre as camadas do redil
      yield* juntos(virar(perto(-PI / 2), 360), tw({ nA: 30, cB: 30, cTurn: 0 }, 360));
      porDentro(true);
      yield* juntos(andarPara(DENTRO.x, DENTRO.z, 620, PASSO_, false), tw({ nA: 34, cB: 26 }, 620));
      // a cancela fecha-se; vira-se lá dentro e deita-se: primeiro dobra as patas da frente, depois as de trás
      const thD = perto(TH_DENTRO);
      yield* juntos(virar(thD, 440), tw({ nA: 50, cB: 16, cTurn: -.6 }, 440), depois(80, (function* () { yield* tw({ cancela: 0 }, 340, eentra); impulso('cancela', -6, 600, 'mola'); impulso('sino', 26, 1100, 'mola'); })()));
      yield* tw({ incl: -.16, alt: -40, deitado: .5, nA: 56 }, 240, eio);
      yield* tw(Object.assign({}, DEITADA, { orelhas: .2 }), 280, esai);
      soltarPalha(DENTRO.x - 60, yChao(DENTRO.z) - 70, 4, 40); soltarPalha(DENTRO.x + 60, yChao(DENTRO.z) - 70, 4, 40); soltarPo(DENTRO.x, yChao(DENTRO.z) - 60, 3, .6);
      impulso('la', 1, 600, 'mola'); impulso('franja', 14, 700, 'mola');
      P.orelhas = 0; impulso('abE', 18, 400); impulso('abD', 18, 400);
      modo = 'dentro';
    }
    /* --- volta: levanta-se (patas de trás primeiro), sacode a lã, a cancela abre, sai de frente e volta aos pulinhos --- */
    function* volta() {
      modo = 'voltando'; reagindo = false;
      yield* juntos(tw({ cancela: 1 }, 480, eio), tw(Object.assign({}, ROSTO0, { fecho0: .1 }), 120), (function* () {
        yield* tw({ incl: .14, alt: -50, deitado: .5, nA: 40 }, 200, eio);
        yield* tw(Object.assign({}, CORPO0, { cTurn: -.3 }), 200, esai);
        yield* durante(340, (u, t) => { const e = sino(u); P.laTrem = e; P.rollC = 7 * Math.sin(t * .06) * e; P.abE = 40 * Math.sin(t * .06 + 1) * e; P.abD = -40 * Math.sin(t * .06 + 1) * e; });
        P.laTrem = 0; P.rollC = 0; P.abE = 0; P.abD = 0;
      })());
      impulso('sino', 14, 800, 'mola');
      soltarLa(DENTRO.x, yChao(DENTRO.z) - 200, 2);
      yield* juntos(virar(perto(PI / 2), 340), tw({ cTurn: 0, nA: 44, cB: 18 }, 340));
      yield* juntos(andarPara(APROX.x, APROX.z, 520, TROTE, false), tw({ nA: 42 }, 520));
      porDentro(false);
      yield* juntos(virar(perto(Math.atan2(REP.Z - APROX.z, REP.X - APROX.x)), 280), tw({ cTurn: -.2 }, 280));
      yield* juntos(andarPara(REP.X, REP.Z, 660, TROTE, false), depois(340, (function* () { yield* tw({ cancela: 0 }, 300, eentra); impulso('cancela', -6, 600, 'mola'); impulso('sino', 24, 1000, 'mola'); })()));
      yield* juntos(virar(perto(REP.th), 260), tw(Object.assign({}, CORPO0, ROSTO0), 280));
      impulso('franja', 14, 700, 'mola');
      modo = 'fora';
    }

    /* --- som: «mééé» — levanta a cabeça e a boca treme em cada sílaba (balido trémulo) --- */
    function* somBoca(ms, silabas) {
      let lista = Array.isArray(silabas) && silabas.length ? silabas : null;
      if (!lista) { const s = ms / 1000; lista = [[0, s * .92]]; }
      const fim = Math.max(...lista.map(([a, d]) => a + Math.max(d, .14))) * 1000;
      impulso('franja', 8, 600, 'mola');
      yield* durante(fim + 300, (u, t) => {
        const ts = t / 1000;
        P.somN = t < 160 ? esai(t / 160) : t > fim ? 1 - eseno(limita((t - fim) / 300, 0, 1)) : 1;
        let b = 0, r = 0;
        lista.forEach(([a, d], k) => {
          const v = (ts - a) / Math.max(d, .14);
          if (v < 0 || v > 1) return;
          const ab = v < .12 ? esai(v / .12) : v > .82 ? 1 - eseno((v - .82) / .18) : 1;
          const tremulo = .72 + .28 * Math.sin((ts - a) * TAU * 8.5);
          b = Math.max(b, ab * (v < .12 ? 1 : tremulo));
          r += 2.2 * Math.sin((ts - a) * TAU * 8.5) * ab + (k % 2 ? -1 : 1) * 3 * Math.sin(v * PI);
        });
        P.somB = b * .9; P.somR = r;
      });
      P.somB = 0; P.somR = 0; P.somN = 0;
    }

    /* --- cenário vivo e acontecimentos raros --- */
    function animarCena(dt) {
      const t = tempo / 1000;
      R.nuvens.forEach((g, i) => {
        const v = [5, 3.5, 4.2, 2.8, 3.2][i], y = [100, 176, 70, 210, 140][i], x0 = [260, 1100, 640, 1420, 900][i];
        const x = -260 + ((x0 + 260 + t * v * calma) % 2120);
        poe(g, `translate(${n(x)},${n(y + 3 * Math.sin(t * .2 + i))})`);
      });
      R.rib.forEach((g, i) => atr(g, 'stroke-dashoffset', n(-(t * (30 + i * 9) * calma) % 400)));
      atr(R.espuma, 'opacity', n3(.5 + .25 * Math.sin(t * 2.3)));
      R.fumo.forEach((g, i) => {
        const u = ((t * .1 * calma + i / 6) % 1);
        poe(g, `translate(${n(1330 + u * 34 + 4 * Math.sin(t * 1.3 + i))},${n(406 - u * 96)}) scale(${n3(.4 + u * 1.6)})`);
        atr(g, 'opacity', n3(.55 * Math.sin(PI * u)));
      });
      R.rebanho.forEach((g, i) => {
        const x = [1176, 1204, 1228, 1252, 1150, 1280][i] + 8 * Math.sin(t * .05 * calma + i * 1.7), y = [492, 500, 488, 504, 506, 494][i];
        poe(g, `translate(${n(x)},${y})`);
        poe(R.rbCab[i], `translate(0,${n(1.6 * Math.max(0, Math.sin(t * .8 + i * 2.1)))})`);
      });
      const rajada = .6 + .4 * Math.sin(t * .3);
      R.giestas.forEach((g, i) => poe(g, `rotate(${n3((2 * Math.sin(t * 1.1 + i * 1.3) + .8 * Math.sin(t * 2.4 + i)) * rajada * calma)})`));
      R.ervas.forEach((g, i) => poe(g, `rotate(${n3((2.6 * Math.sin(t * 1.2 + i * .9) + 1.4 * Math.sin(t * 2.3 + i * 2)) * rajada * calma)})`));
      if (Math.random() < dt / 2600 * calma) soltarPetalas(aleat(20, 180), aleat(720, 800), 1);
    }
    const eventos = { prox: aleat(9000, 15000), ultimo: null };
    function iniciarEvento(tipo) {
      const ev = { tipo, x: -100, y: -100, vivo: true };
      ev.pos = () => [ev.x, ev.y];
      const gen = { aguia: evAguia, lagartixa: evLagartixa, borboleta: evBorboleta }[tipo](ev);
      lancar('evento', gen, () => { ev.vivo = false; atr(R.borb, 'display', 'none'); });
      if (modo === 'fora' && !reagindo) lancar('corpo', tipo === 'borboleta' ? vigiarBorboleta(ev) : observar(ev), () => lancar('corpo', cicloFora()));
      else if (modo === 'dentro') { impulso('abE', 22, 400); impulso('abD', 18, 400); }
    }
    function atualizarEventos(dt) {
      if (faixas.has('evento')) return;
      eventos.prox -= dt;
      if (eventos.prox > 0) return;
      eventos.prox = aleat(15000, 40000);
      if (modo !== 'fora' && modo !== 'dentro') { eventos.prox = 3000; return; }
      const lista = ['aguia', 'lagartixa', 'borboleta'];
      let tipo; do tipo = escolhe(lista); while (tipo === eventos.ultimo && Math.random() < .7);
      eventos.ultimo = tipo;
      iniciarEvento(tipo);
    }
    function* observar(ev) {
      reagindo = false;
      yield* recompor(380);
      olhar.foco = ev.pos;
      yield* tw({ orelhas: .3, olhoEsc: 1.05 }, 260, esai);
      let t = 0, prox = 900;
      while (ev.vivo && t < 16000) {
        t += yield;
        if (t > prox) {
          prox = t + aleat(1000, 1900);
          if (Math.random() < .5) impulso('flick', 22, 600, 'onda');
          impulso(Math.random() < .5 ? 'abE' : 'abD', 18, 280);
        }
      }
      olhar.foco = null;
      yield* tw({ orelhas: 0, olhoEsc: 1, olhos: 1 }, 500);
    }
    function* vigiarBorboleta(ev) {            // segue a borboleta; quando ela pousa na franja, olha para cima e fica quieta
      reagindo = false;
      yield* recompor(380);
      olhar.foco = ev.pos;
      while (ev.vivo) {
        const dt = yield;
        if (ev.pousada) { P.olharX += (0 - P.olharX) * .1; P.olharY = -1; P.orelhas = lerp(P.orelhas, .4, .05); }
        if (ev.saiu && !ev.espirrou) { ev.espirrou = true; impulso('abE', 30, 400, 'mola'); impulso('abD', -30, 400, 'mola'); impulso('cabR', 8, 400, 'mola'); }
      }
      olhar.foco = null;
      yield* tw({ orelhas: 0, olhoEsc: 1 }, 400);
    }
    function* evBorboleta(ev) {               // uma borboleta vem das giestas, pousa na franja da ovelha e volta a voar
      atr(R.borb, 'display', 'inline');
      let tt = 0;
      const desenha = (abre, inc) => {
        poe(R.borb, `translate(${n(ev.x)},${n(ev.y)}) rotate(${n(inc)})`);
        const k = n3(.15 + .85 * abre);
        poe(R.borbA, `scale(${k},1)`); poe(R.borbB, `scale(${k},1)`);
      };
      const voar = (u, tt) => .5 + .5 * Math.sin(tt * .05);
      const ini = [1500, 720];
      yield* durante(4200, (u, t) => { tt = t; ev.x = lerp(ini[0], 900, u) + 60 * Math.sin(t * .002); ev.y = 620 - 120 * Math.sin(t * .0015) + 30 * Math.sin(t * .006); desenha(voar(u, t), 10 * Math.sin(t * .004)); });
      const pode = modo === 'fora';
      if (pode) {
        const x0 = ev.x, y0 = ev.y;
        yield* durante(1800, (u, t) => { tt += 16; const e = eio(u); ev.x = lerp(x0, franjaMundo[0], e) + 30 * Math.sin(tt * .004) * (1 - u); ev.y = lerp(y0, franjaMundo[1], e) - 60 * sino(u); desenha(voar(u, tt), 0); });
        ev.pousada = true;
        yield* durante(2600, (u, t) => { tt += 16; ev.x = franjaMundo[0]; ev.y = franjaMundo[1]; desenha(.55 + .45 * Math.sin(t * .006), 0); });
        ev.pousada = false; ev.saiu = true;
      }
      const x1 = ev.x, y1 = ev.y;
      yield* durante(3000, (u, t) => { tt += 16; ev.x = x1 - 700 * u + 40 * Math.sin(tt * .003); ev.y = y1 - 420 * eseno(u) + 20 * Math.sin(tt * .007); desenha(voar(u, tt), -10); });
      atr(R.borb, 'display', 'none');
    }
    function* evAguia(ev) {                    // uma águia plana em círculos sobre a serra; a sombra passa no prado
      atr(R.aguia, 'display', 'inline'); atr(R.sombraAg, 'display', 'inline');
      const pts = [[1700, 120], [1300, 160], [1000, 120], [820, 170], [1000, 230], [1200, 180], [1000, 110], [700, 140], [400, 190], [100, 130], [-150, 100]];
      yield* durante(14000, (u, tt) => {
        const [x, y] = catmull(pts, u);
        ev.x = x; ev.y = y;
        const bate = Math.sin(tt * .0011) > .7;
        poe(R.aguia, `translate(${n(x)},${n(y)}) scale(${n3(.8 + .1 * Math.sin(tt * .0007))}) rotate(${n(6 * Math.sin(tt * .0013))})`);
        poe(R.agAsa, `scale(1,${n3(bate ? .4 + .6 * Math.abs(Math.cos(tt * .012)) : 1)})`);
        poe(R.sombraAg, `translate(${n(x + 160)},${n(700 + (y - 100) * .6)})`);
      });
      atr(R.aguia, 'display', 'none'); atr(R.sombraAg, 'display', 'none');
    }
    function* evLagartixa(ev) {                // uma lagartixa sai de uma fenda do penedo, faz flexões ao sol e foge
      atr(R.lag, 'display', 'inline');
      const a = [1280, 660], b = [1196, 540], c = [1050, 590];
      const corre = function* (de, para, ms) {
        const ang = Math.atan2(para[1] - de[1], para[0] - de[0]) / RAD;
        yield* durante(ms, (u, tt) => {
          ev.x = lerp(de[0], para[0], eio(u)); ev.y = lerp(de[1], para[1], eio(u));
          poe(R.lag, `translate(${n(ev.x)},${n(ev.y)}) rotate(${n(ang)}) scale(.9)`);
          poe(R.lagCauda, `rotate(${n(14 * Math.sin(tt * .04))},-10,0)`); poe(R.lagPatas, `scale(1,${n3(Math.sin(tt * .05) > 0 ? 1 : -1)})`);
        });
      };
      yield* corre(a, b, 1100);
      for (let i = 0; i < 3; i++) yield* durante(500, u => poe(R.lagIn, `translate(0,${n(-3 * sino(u))})`));
      yield* espera(1400);
      yield* corre(b, c, 700);
      yield* espera(900);
      yield* corre(c, a, 900);
      atr(R.lag, 'display', 'none');
    }

    /* --- relógio único --- */
    let erroMostrado = false, dtUltimo = 16;
    function passo(dt) {
      if (!vivo) return;
      try {
        dt = Math.min(dt, 50); dtUltimo = dt;
        tempo += dt;
        fase.resp += dt / 1000 * TAU * P.respF;
        fase.cauda += dt / 1000 * TAU * P.cauVel;
        atualizarImpulsos(dt);
        atualizarPiscar(dt);
        atualizarTiques(dt);
        for (const nome of Array.from(faixas.keys())) avancar(nome, dt);
        atualizarOlhar(dt);
        atualizarMola(dt);
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
      animal: R.ovelha,
      habitat: R.habitat,
      reagir() {
        if (!vivo) return;
        if (modo === 'fora') lancar('corpo', reacaoFora(), () => { reagindo = false; P.cauVel = CAUDA_0.cauVel; P.cauAmp = CAUDA_0.cauAmp; lancar('corpo', cicloFora()); });
        else if (modo === 'dentro') lancar('corpo', reacaoDentro(), () => lancar('corpo', cicloDentro()));
        else { impulso('abE', 14, 300); impulso('abD', 14, 300); }
      },
      fazerSom(ms, silabas) {
        if (!vivo) return;
        lancar('boca', somBoca(limita(ms || 1100, 300, 3000), silabas));
        impulso('flick', 22, 600, 'onda');
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
      _teste: { P, pes, modo: () => modo, evento: iniciarEvento, comportamento: nome => lancar('corpo', COMPORTAMENTOS[nome](), () => lancar('corpo', cicloFora())), desenhar, cab: () => cabMundo, boca: () => bocaMundo }
    };
  }

  return { icone: iconeSVG(), montar };
})();
