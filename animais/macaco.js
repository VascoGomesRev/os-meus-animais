/* Macaco — «Os Meus Animais». Contrato e regras: REGRAS-ANIMAIS.md.
   Cena: uma selva tropical com luz de cima à esquerda a atravessar a névoa: árvores enormes com raízes de contraforte,
   folhas gigantes, lianas penduradas, uma cascata ao fundo com bruma, flores (hibiscos, helicónias, orquídeas),
   borboletas e, de vez em quando, um tucano que vem pousar num ramo. O habitat é um ramo alto de uma árvore com folhagem
   densa (e um cacho de bananas): o macaco salta, agarra a liana, balança-se até lá e senta-se no ramo, com as folhas da
   frente a taparem-lhe as pernas (camadas: folhagem de trás → macaco → folhagem da frente).
   O macaco é um boneco articulado de frente: tronco em pera com barriga clara, cabeça redonda com a máscara em coração
   (as feições deslizam numa esfera quando a cabeça roda, como no gato), orelhas redondas de lado, braços e pernas compridos
   com IK de 2 segmentos (mãos e pés com dedos, abertos ou fechados), e uma cauda de 13 segmentos com onda que se enrola na
   ponta — e que se enrola no ramo quando ele se pendura de cabeça para baixo. */
'use strict';
MODULOS.macaco = (() => {
  /* =====================================================================================
     1. Utilidades
     ===================================================================================== */
  const NS = 'http://www.w3.org/2000/svg';
  const PI = Math.PI, TAU = 2 * PI, GRAU = 180 / PI;
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const passo = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const sinoide = t => 0.5 - 0.5 * Math.cos(PI * clamp(t, 0, 1));
  const janela = (t, a, b, c, d) => passo(a, b, t) * (1 - passo(c, d, t));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const n1 = x => Math.round(x * 10) / 10;
  const n3 = x => Math.round(x * 1000) / 1000;
  const lerp2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  const bez2 = (a, c, b, t) => { const m = 1 - t; return [m * m * a[0] + 2 * m * t * c[0] + t * t * b[0], m * m * a[1] + 2 * m * t * c[1] + t * t * b[1]]; };
  function semente(s) {
    return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function mola(s, alvo, w, dt) {             // mola criticamente amortecida, solução exata
    const e = Math.exp(-w * dt), d = s.x - alvo, k = (s.v + w * d) * dt;
    s.x = alvo + (d + k) * e; s.v = (s.v - w * k) * e;
  }
  function molaElastica(s, alvo, k, c, dt) {  // mola com balanço (ramo, folhas)
    const n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n;
    for (let i = 0; i < n; i++) { s.v += (k * (alvo - s.x) - c * s.v) * h; s.x += s.v * h; }
  }
  // cápsula afunilada ao longo de +y (largura a em cima, b em baixo, comprimento L; e = folga para o contorno)
  function capsula(a, b, L, e) {
    const ra = a / 2 + e, rb = b / 2 + e;
    return `<path d="M${n1(-ra)},0 C${n1(-ra)},${n1(-ra * 1.33)} ${n1(ra)},${n1(-ra * 1.33)} ${n1(ra)},0 L${n1(rb)},${L} C${n1(rb)},${n1(L + rb * 1.33)} ${n1(-rb)},${n1(L + rb * 1.33)} ${n1(-rb)},${L}Z"/>`;
  }

  /* =====================================================================================
     2. Medidas, sítios e poses
     ===================================================================================== */
  const ESC = 1.35;                       // escala do boneco (desenhado em unidades locais)
  const CO = '#3B200E';                   // contorno castanho escuro quente
  const CHAO_Y = 778;                     // chão onde o macaco se senta
  const REP = { x: 560, y: CHAO_Y - 22 }; // bacia do macaco sentado no chão
  const LP = { x: 760, y: -160 }, LL = 560;   // pivô da liana (fora do ecrã) e comprimento até à mão de baixo
  const TRONCO_X = 1240;                  // tronco da árvore do habitat (o ramo dobra aqui)
  const RAMO_Y = x => 488 + (TRONCO_X - x) * 0.028 + 4 * Math.sin((TRONCO_X - x) / 60);   // cimo do ramo
  const RAMO_E = x => lerp(14, 40, clamp((x - 880) / (TRONCO_X - 880), 0, 1));            // espessura do ramo
  const ASS = { x: 1098, y: RAMO_Y(1098) - 22 };   // bacia sentado no ramo
  const PILHA = { x: 716, y: 782 };       // bananas caídas no chão
  const CACHO = { x: 976, y: RAMO_Y(976) };
  const POUSO = { x: 336, y: 247 };       // ramo onde pousa o tucano
  const SHO = [[-40, -82], [40, -82]], HIP = [[-20, -2], [20, -2]], CAB = [0, -146], CAU0 = [16, 6];
  const BR = [60, 58], PN = [42, 40];
  const NC = 13, LC = 15;
  const CW = Array.from({ length: NC + 1 }, (_, k) => lerp(11, 6.2, k / NC));
  const gripW = (a, l) => [LP.x + (l + 17) * Math.sin(a), LP.y + (l + 17) * Math.cos(a)];   // pulso de quem agarra a liana

  // Pose base (sentado no chão, mãos pousadas nos pés). As outras só dizem o que muda.
  const SENTADO = {
    incl: 0, sq: 0, cabX: 0, cabY: 0, cabRoll: 0, cabYaw: 0, cabNod: 0,
    m0x: -84, m0y: 12, m1x: 84, m1y: 12, m0r: 0.2, m1r: 0.2, fecha0: 0, fecha1: 0, mw0: 0, mw1: 0,
    p0x: -44, p0y: 20, p1x: 44, p1y: 20, pr0: 0.1, pr1: 0.1, pw0: 0, pw1: 0,
    cauBase: 0.3, cauDobra: -1.0, cauPonta: -3.4, cauAmp: 0.12, cauVel: 0.3, cauEnrola: 0, ancora: 0,
    fecho: 0, feliz: 0, boca: 0, sorriso: 0.55, sobr: 0, franze: 0, esc: 1, dilata: 0, vesgo: 0,
    resp: 1, respVel: 0.3
  };
  const NO_RAMO = { p0x: -22, p0y: 78, p1x: 22, p1y: 78, pr0: 1.15, pr1: 1.15, m0x: -60, m0y: 16, m1x: 58, m1y: 14, m0r: 0.6, m1r: 0.6, cauBase: 1.3, cauDobra: 0.45, cauPonta: -3.1, cauAmp: 0.16 };
  const PENDURADO = { incl: 0, p0x: -16, p0y: 74, p1x: 16, p1y: 74, pr0: 1.3, pr1: 1.3, cauBase: -1.2, cauDobra: 0.3, cauPonta: -0.6, cauAmp: 0.05 };
  const CHAVES = Object.keys(SENTADO);
  const OMEGA = { fecho: 40, boca: 28, feliz: 14, sorriso: 12, fecha0: 26, fecha1: 26, cabYaw: 8, cabNod: 9, mw0: 14, mw1: 14, pw0: 14, pw1: 14, m0x: 11, m0y: 11, m1x: 11, m1y: 11, vesgo: 8, ancora: 7, cauEnrola: 6 };
  const misturar = (A, pose, w) => { if (w > 0) for (const k in pose) A[k] = lerp(A[k], pose[k], w); };

  /* =====================================================================================
     3. Desenho do macaco
     ===================================================================================== */
  function defsMacaco(u) {
    return `<radialGradient id="${u}pelo" cx=".35" cy=".28" r=".85"><stop offset="0" stop-color="#C08852"/><stop offset=".55" stop-color="#8E5A32"/><stop offset="1" stop-color="#5A341A"/></radialGradient>
<linearGradient id="${u}peloL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B07A48"/><stop offset=".55" stop-color="#875230"/><stop offset="1" stop-color="#5A341A"/></linearGradient>
<radialGradient id="${u}cabeca" cx=".36" cy=".28" r=".8"><stop offset="0" stop-color="#C99460"/><stop offset=".55" stop-color="#93603A"/><stop offset="1" stop-color="#5A341A"/></radialGradient>
<radialGradient id="${u}mascara" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#FDE8D0"/><stop offset=".6" stop-color="#F2CBA2"/><stop offset="1" stop-color="#DAA67C"/></radialGradient>
<radialGradient id="${u}focinho" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#FFF0DE"/><stop offset=".6" stop-color="#F4D2AC"/><stop offset="1" stop-color="#DDAA80"/></radialGradient>
<radialGradient id="${u}barriga" cx=".42" cy=".3" r=".8"><stop offset="0" stop-color="#F6DAB8"/><stop offset=".65" stop-color="#E6B88E"/><stop offset="1" stop-color="#C9946A"/></radialGradient>
<radialGradient id="${u}pele" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#E8B68C"/><stop offset=".6" stop-color="#CC9470"/><stop offset="1" stop-color="#A06C48"/></radialGradient>
<radialGradient id="${u}orelhaIn" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#F7D0B0"/><stop offset=".7" stop-color="#DEA580"/><stop offset="1" stop-color="#B98060"/></radialGradient>
<radialGradient id="${u}iris" cx=".5" cy=".62" r=".62"><stop offset="0" stop-color="#B07434"/><stop offset=".6" stop-color="#6E3C16"/><stop offset="1" stop-color="#2E1608"/></radialGradient>
<radialGradient id="${u}bocaIn" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#9A3036"/><stop offset="1" stop-color="#4A1016"/></radialGradient>
<linearGradient id="${u}banana" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF19A"/><stop offset=".5" stop-color="#F8D040"/><stop offset="1" stop-color="#D49E1E"/></linearGradient>
<radialGradient id="${u}sombra"><stop offset="0" stop-color="#14240C" stop-opacity=".5"/><stop offset=".6" stop-color="#14240C" stop-opacity=".22"/><stop offset="1" stop-color="#14240C" stop-opacity="0"/></radialGradient>
<clipPath id="${u}olho"><ellipse rx="10" ry="12"/></clipPath>`;
  }
  function cores(u) {
    const g = k => `url(#${u}${k})`;
    if (u) return { cabeca: g('cabeca'), mascara: g('mascara'), focinho: g('focinho'), orelhaIn: g('orelhaIn'), iris: g('iris'), bocaIn: g('bocaIn'), banana: g('banana') };
    return { cabeca: '#93603A', mascara: '#F4CEA6', focinho: '#F8DDBC', orelhaIn: '#E6B08A', iris: '#6E3C16', bocaIn: '#7A2028', banana: '#F6CC40' };
  }

  /* ---------- cabeça: feições presas a uma esfera (deslizam e encolhem quando roda) ---------- */
  const MASC_D = 'M0,-24 C6,-38 20,-45 34,-39 C50,-31 53,-9 47,10 C41,30 25,46 0,50 C-25,46 -41,30 -47,10 C-53,-9 -50,-31 -34,-39 C-20,-45 -6,-38 0,-24Z';
  const ORDEM_CAB = ['or0', 'or1', 'tufo', 'cranio', 'cara', 'foc', 'olho0', 'olho1'];
  function estadoCabeca(p) {
    const t = {}, op = {};
    const yaw = p.yaw, ny = 16 * Math.sin(p.nod);
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1, sx = Math.sin(s * 1.72 + yaw);
      t['or' + i] = `translate(${n1(61 * sx)},${n1(-6 + ny * 0.25)}) scale(${n3(0.7 + 0.3 * Math.abs(sx))},1)`;
    }
    t.tufo = `translate(${n1(12 * Math.sin(yaw))},0)`;
    t.cara = `translate(${n1(40 * Math.sin(yaw))},${n1(ny * 0.8)}) scale(${n3(0.78 + 0.22 * Math.cos(yaw))},1)`;
    t.foc = `translate(${n1(62 * Math.sin(yaw))},${n1(ny * 1.15)}) scale(${n3(0.8 + 0.2 * Math.cos(yaw))},1)`;
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1, l = s * 0.36 + yaw, z = Math.cos(l), fs = z > 0.05 ? Math.pow(z, 0.6) : 0;
      t['olho' + i] = `translate(${n1(56 * Math.sin(l))},${n1(-12 + ny)}) scale(${n3(fs * p.esc)},${n3(p.esc)})`;
      const vx = -s * p.vesgo * 3.6;
      t['iris' + i] = `translate(${n1(clamp(p.olhoX * 3.2 + vx, -4.2, 4.2))},${n1(clamp(p.olhoY * 3 + p.vesgo * 1.5, -3.6, 3.6))})`;
      t['pup' + i] = `scale(${n3(1 + 0.45 * p.dilata)})`;
      t['psup' + i] = `translate(0,${n1(lerp(-17, 13, clamp(p.fecho, 0, 1)))})`;
      t['pinf' + i] = `translate(0,${n1(lerp(17, 3, clamp(p.feliz, 0, 1)))})`;
      t['sob' + i] = `translate(0,${n1(-4 * p.sobr)}) rotate(${n1(s * 12 * p.franze)})`;
    }
    const b = clamp(p.boca, 0, 1.2);
    t.bocaG = `translate(0,27) scale(${n3(0.55 + 0.4 * b + 0.25 * clamp(p.sorriso, 0, 1))},${n3(Math.max(0.01, b))})`;
    op.bocaG = b > 0.03 ? 1 : 0;
    t.queixo = `translate(0,${n1(9 * b)})`;
    const so = clamp(p.sorriso, -0.5, 1.2);
    const dS = `M-14,${n1(25 - 2 * so)} Q0,${n1(25 + 11 * so - 5 * b)} 14,${n1(25 - 2 * so)}`;
    return { t, op, dS };
  }
  function svgCabeca(u, E, icone) {
    const C = cores(u);
    const T = k => (E.t[k] ? ` transform="${E.t[k]}"` : '');
    const it = {};
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1;
      it['or' + i] = `<g class="hp hp-or${i}"${T('or' + i)}><circle r="23" fill="${C.cabeca}" stroke="${CO}" stroke-width="3"/><circle cx="${-s * 3}" cy="1" r="14.5" fill="${C.orelhaIn}"/>
<path d="M${-s * 11},-4 C${-s * 7},-11 ${s * 2},-12 ${s * 6},-6" fill="none" stroke="#A86E4C" stroke-width="2.4" stroke-linecap="round"/><path d="M${-s * 5},5 C${-s * 2},9 ${s * 3},8 ${s * 5},3" fill="none" stroke="#A86E4C" stroke-width="2" stroke-linecap="round" opacity=".7"/></g>`;
    }
    it.tufo = `<g class="hp hp-tufo"${T('tufo')}><path d="M-18,-50 C-18,-64 -12,-72 -4,-78 C-5,-70 -2,-66 2,-64 C4,-72 10,-77 18,-78 C13,-70 13,-62 16,-52Z" fill="${C.cabeca}" stroke="${CO}" stroke-width="3" stroke-linejoin="round"/></g>`;
    it.cranio = `<g class="hp hp-cranio"><path d="M-55,4 L-65,10 L-56,15 L-63,23 L-52,25 L-57,33 L-46,32 L-40,20Z M55,4 L65,10 L56,15 L63,23 L52,25 L57,33 L46,32 L40,20Z" fill="${C.cabeca}" stroke="${CO}" stroke-width="2.6" stroke-linejoin="round"/>
<circle r="58" fill="${C.cabeca}" stroke="${CO}" stroke-width="3.2"/>
<ellipse cx="-22" cy="-36" rx="20" ry="10" fill="#E2B080" opacity=".45" transform="rotate(-28 -22 -36)"/>
<path d="M-30,-46 C-24,-52 -16,-55 -8,-55 M10,-55 C18,-55 26,-51 32,-45 M-44,-30 C-48,-24 -50,-16 -50,-8" fill="none" stroke="#6A4022" stroke-width="2.4" stroke-linecap="round" opacity=".55"/></g>`;
    it.cara = `<g class="hp hp-cara"${T('cara')}><path d="${MASC_D}" fill="${C.mascara}" stroke="#B57A50" stroke-width="2.2"/>
<ellipse cx="-31" cy="16" rx="9" ry="6" fill="#F08A7A" opacity=".38"/><ellipse cx="31" cy="16" rx="9" ry="6" fill="#F08A7A" opacity=".38"/>
<path d="M-38,-30 C-30,-38 -20,-40 -12,-36" fill="none" stroke="#FFF6EA" stroke-width="3" stroke-linecap="round" opacity=".7"/></g>`;
    it.foc = `<g class="hp hp-foc"${T('foc')}><ellipse cy="22" rx="30" ry="20" fill="${C.focinho}" stroke="#B57A50" stroke-width="2.2"/>
<g class="queixo"${T('queixo')}><path d="M-16,36 C-10,43 10,43 16,36 C10,39 -10,39 -16,36Z" fill="#E9BC94"/></g>
<g class="bocaG"${T('bocaG')} opacity="${E.op.bocaG}"><ellipse cy="6" rx="11" ry="7" fill="${C.bocaIn}" stroke="#4A1A10" stroke-width="1.6"/><ellipse cy="9" rx="6.5" ry="3.4" fill="#EE8094"/><path d="M-7,0.5 L7,0.5 L6,3 L-6,3Z" fill="#FFFDF5"/></g>
<path class="sorr" d="${E.dS}" fill="none" stroke="#5A2A14" stroke-width="2.6" stroke-linecap="round"/>
<ellipse cx="-10" cy="12" rx="10" ry="5" fill="#FFFFFF" opacity=".45"/>
<ellipse cx="-5.5" cy="15" rx="2.8" ry="2" fill="#5A2E1A" transform="rotate(-20 -5.5 15)"/><ellipse cx="5.5" cy="15" rx="2.8" ry="2" fill="#5A2E1A" transform="rotate(20 5.5 15)"/></g>`;
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1;
      const clip = icone ? '' : ` clip-path="url(#${u}olho)"`;
      const palp = icone ? '' : `<g class="psup"${T('psup' + i)}><path d="M-14,-40 L14,-40 L14,-2 C6,3 -6,3 -14,-2Z" fill="#EFC39A"/><path d="M-11,-1 C-4,3 4,3 11,-1" fill="none" stroke="#4A2410" stroke-width="2.4" stroke-linecap="round"/></g>
<g class="pinf"${T('pinf' + i)}><path d="M-14,40 L14,40 L14,4 C6,-3 -6,-3 -14,4Z" fill="#F4D2AE"/><path d="M-9,3 C-4,0 4,0 9,3" fill="none" stroke="#C08A64" stroke-width="1.6"/></g>`;
      it['olho' + i] = `<g class="hp hp-olho${i}"${T('olho' + i)}><ellipse rx="13.5" ry="15.5" fill="#B9805A" opacity=".22"/>
<g${clip}><ellipse rx="10" ry="12" fill="#FFFDF7"/>
<g class="iris"${T('iris' + i)}><circle r="7.6" fill="${C.iris}"/><g class="pup"${T('pup' + i)}><circle r="4" fill="#120804"/></g><circle cx="-2.6" cy="-3" r="2.6" fill="#fff"/><circle cx="2.6" cy="2.8" r="1.2" fill="#fff" opacity=".9"/></g>
${palp}</g><ellipse rx="10" ry="12" fill="none" stroke="#3A1A08" stroke-width="2.6"/>
<g class="sob"${T('sob' + i)}><path d="M-9,-20 Q${-s * 2},-28 9,-21" fill="none" stroke="#6A3C1E" stroke-width="3" stroke-linecap="round"/></g></g>`;
    }
    return ORDEM_CAB.map(k => it[k]).join('');
  }

  /* ---------- tronco (pera com barriga clara e tufos de pelo nos lados) ---------- */
  const TRONCO_D = 'M0,-110 C30,-110 47,-90 50,-62 C56,-28 57,0 42,14 C28,25 -28,25 -42,14 C-57,0 -56,-28 -50,-62 C-47,-90 -30,-110 0,-110Z';
  const BARRIGA_D = 'M0,-80 C22,-80 36,-56 37,-30 C38,-2 24,16 0,17 C-24,16 -38,-2 -37,-30 C-36,-56 -22,-80 0,-80Z';
  function svgTronco(u) {
    let tufos = '';
    for (const [x, y, s] of [[-50, -64, -1], [-54, -38, -1], [-55, -12, -1], [50, -64, 1], [54, -38, 1], [55, -12, 1], [-30, 18, -1], [30, 18, 1]]) {
      tufos += `<path d="M${x},${y - 8} L${x + s * 8},${y - 1} L${x},${y + 7}Z" fill="#8E5A32" stroke="${CO}" stroke-width="2.6" stroke-linejoin="round"/>`;
    }
    return `<g class="tronco">${tufos}<path d="${TRONCO_D}" fill="url(#${u}pelo)" stroke="${CO}" stroke-width="3.4" stroke-linejoin="round"/>
<path d="M38,-84 C52,-54 54,-12 40,12 C46,-16 46,-52 30,-88Z" fill="#2E1808" opacity=".22"/>
<ellipse cx="-24" cy="-88" rx="17" ry="8" fill="#DDA26C" opacity=".45" transform="rotate(-32 -24 -88)"/>
<path d="${BARRIGA_D}" fill="url(#${u}barriga)" stroke="#B88058" stroke-width="2"/>
<g fill="none" stroke="#C4936C" stroke-width="2" stroke-linecap="round" opacity=".8"><path d="M-16,-58 C-12,-52 -12,-46 -15,-40"/><path d="M14,-56 C10,-50 10,-44 13,-38"/><path d="M-22,-20 C-18,-14 -18,-8 -21,-2"/><path d="M20,-18 C16,-12 16,-6 19,0"/><path d="M-3,-30 C-1,-27 1,-27 3,-30"/></g>
<path d="M-26,-70 C-18,-77 -8,-80 2,-80" fill="none" stroke="#FFF2DE" stroke-width="3" stroke-linecap="round" opacity=".6"/>
<g fill="none" stroke="#5A341A" stroke-width="2.2" stroke-linecap="round" opacity=".5"><path d="M-44,-80 C-40,-86 -34,-90 -28,-92"/><path d="M44,-76 C46,-66 48,-56 48,-46"/></g></g>`;
  }

  /* ---------- mãos e pés ---------- */
  function svgMao(u) {   // mão direita, dedos para +y, polegar para −x
    let dedos = '';
    [[-5.6, 9], [-1.9, 11], [1.9, 11], [5.6, 9]].forEach(([x, L]) => { dedos += `<path d="M${n1(x - 2.7)},16 L${n1(x - 2.7)},${16 + L} C${n1(x - 2.7)},${19.5 + L} ${n1(x + 2.7)},${19.5 + L} ${n1(x + 2.7)},${16 + L} L${n1(x + 2.7)},16Z"/>`; });
    const pele = `url(#${u}pele)`;
    return `<g class="aberta"><g fill="${pele}" stroke="${CO}" stroke-width="2">${dedos}<g transform="translate(-8,6) rotate(38)">${capsula(5.6, 5, 10, 0)}</g></g>
<path d="M-9,-2 C-12,6 -12,14 -9,19 C-4,23 4,23 9,19 C12,14 12,6 9,-2Z" fill="${pele}" stroke="${CO}" stroke-width="2.2"/>
<path d="M-4,10 C-2,13 2,13 4,10" fill="none" stroke="#8A5A3A" stroke-width="1.4" opacity=".7"/></g>
<g class="punho" opacity="0"><path d="M-10,0 C-13,8 -12,18 -7,22 C-2,25 6,25 10,21 C13,16 13,6 10,0Z" fill="${pele}" stroke="${CO}" stroke-width="2.2"/>
<path d="M-8,13 C-4,16 4,16 9,13 M-8,18 C-4,21 4,21 8,18" fill="none" stroke="#7A4A2E" stroke-width="1.6" stroke-linecap="round"/>
<path d="M-11,8 C-15,12 -13,18 -7,17" fill="${pele}" stroke="${CO}" stroke-width="2" stroke-linejoin="round"/></g>
<ellipse cy="-1" rx="11.5" ry="5.5" fill="url(#${u}peloL)" stroke="${CO}" stroke-width="2"/>`;
  }
  function svgPe(u) {    // pé direito, dedos para +x, calcanhar no tornozelo
    const pele = `url(#${u}pele)`;
    let dedos = '';
    [[-1.5, 7], [2, 8], [5.5, 7.5]].forEach(([y, L]) => { dedos += `<g transform="translate(24,${y}) rotate(-90)">${capsula(5, 4.6, L, 0)}</g>`; });
    return `<g fill="${pele}" stroke="${CO}" stroke-width="2">${dedos}<g transform="translate(12,-5) rotate(-140)">${capsula(6, 5, 11, 0)}</g></g>
<path d="M-7,-9 C-11,-2 -9,7 0,9 L23,9 C29,8 30,1 26,-3 C20,-7 8,-11 -7,-9Z" fill="${pele}" stroke="${CO}" stroke-width="2.2"/>
<path d="M4,5 C10,7 16,7 21,5" fill="none" stroke="#8A5A3A" stroke-width="1.4" opacity=".7"/>
<ellipse cx="-2" cy="-6" rx="10" ry="6.5" fill="url(#${u}peloL)" stroke="${CO}" stroke-width="2"/>`;
  }
  // um membro: contorno de todos os segmentos por baixo (sem costuras nas articulações), pelo por cima, extremidade
  function svgMembro(u, segs, ext) {
    let c = '', f = '';
    segs.forEach(([a, b, L], i) => {
      c += `<g class="s${i}">${capsula(a, b, L, 3)}</g>`;
      f += `<g class="s${i}">${capsula(a, b, L, 0)}<path d="M${n1(-a * 0.2)},4 C${n1(-a * 0.24)},${n1(L * 0.4)} ${n1(-b * 0.24)},${n1(L * 0.7)} ${n1(-b * 0.18)},${L - 2}" fill="none" stroke="#C99262" stroke-width="2.2" stroke-linecap="round" opacity=".55"/><path d="M${n1(a * 0.28)},${n1(L * 0.3)} l${n1(a * 0.12)},5 M${n1(b * 0.2)},${n1(L * 0.65)} l${n1(b * 0.14)},5" fill="none" stroke="#4E2C14" stroke-width="1.8" stroke-linecap="round" opacity=".5"/></g>`;
    });
    return `<g fill="${CO}">${c}</g><g fill="url(#${u}peloL)">${f}</g><g class="ext">${ext}</g>`;
  }
  function svgCauda(u) {
    let c = '', f = '';
    for (let k = 0; k < NC; k++) {
      c += `<g class="k${k}">${capsula(CW[k], CW[k + 1], LC, 2.6)}</g>`;
      f += `<g class="k${k}">${capsula(CW[k], CW[k + 1], LC, 0)}<path d="M${n1(-CW[k] * 0.2)},1 L${n1(-CW[k] * 0.2)},${LC - 1}" stroke="#C99262" stroke-width="2" stroke-linecap="round" opacity=".5"/></g>`;
    }
    return `<g fill="${CO}">${c}</g><g fill="url(#${u}peloL)">${f}</g>`;
  }
  // banana (aponta para −y, base em 0,0): fruta que encolhe com as dentadas, 3 tiras de casca e a base
  function svgBanana(u, icone) {
    const fill = icone ? '#F6CC40' : `url(#${u}banana)`;
    const tira = (cls, d) => `<g class="${cls}"><path d="${d}" fill="${fill}" stroke="#8A5A10" stroke-width="1.6" stroke-linejoin="round"/></g>`;
    return `<g class="bn-fruta"><path d="M-5.2,-13 C-6.2,-26 -4.6,-37 0,-45 C4.6,-37 6.2,-26 5.2,-13Z" fill="#FFF4D2" stroke="#C9AE72" stroke-width="1.5"/><path d="M-2,-18 C-2.4,-26 -1.6,-33 0,-38" fill="none" stroke="#E8D49A" stroke-width="1.4"/></g>
${tira('bn-t0', 'M-7,-14 C-8,-27 -5,-38 -0.5,-47 L0.6,-46 C-1.6,-36 -2.6,-26 -2.4,-14Z')}${tira('bn-t1', 'M7,-14 C8,-27 5,-38 0.5,-47 L-0.6,-46 C1.6,-36 2.6,-26 2.4,-14Z')}${tira('bn-t2', 'M-2.6,-14 C-2.8,-26 -1.8,-37 0,-47 C1.8,-37 2.8,-26 2.6,-14Z')}
<path d="M-7,0 C-8,-6 -8,-10 -7,-14 L7,-14 C8,-10 8,-6 7,0 C4,3 -4,3 -7,0Z" fill="${fill}" stroke="#8A5A10" stroke-width="1.8"/>
<path d="M-4,-12 C-4.5,-8 -4.5,-4 -4,-1" fill="none" stroke="#FFF6C0" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
<path d="M-1.6,1.5 L-1.6,6 L1.6,6 L1.6,1.5Z" fill="#5A3A10"/>`;
  }
  function svgMacaco(u, E) {
    const BRACO = [[26, 20, BR[0]], [20, 15, BR[1]]], PERNA = [[30, 24, PN[0]], [24, 18, PN[1]]];
    return `<g class="macaco"><ellipse class="mc-sombra" rx="1" ry="1" fill="url(#${u}sombra)"/>
<g class="mc-cauda">${svgCauda(u)}</g>
${svgTronco(u)}<g class="mc-perna0">${svgMembro(u, PERNA, svgPe(u))}</g><g class="mc-perna1">${svgMembro(u, PERNA, svgPe(u))}</g>
<g class="mc-cab">${svgCabeca(u, E, false)}</g>
<g class="mc-braco0">${svgMembro(u, BRACO, svgMao(u))}</g><g class="mc-braco1">${svgMembro(u, BRACO, svgMao(u))}</g>
<g class="mc-banana" opacity="0">${svgBanana(u, false)}<g fill="url(#${u}pele)" stroke="${CO}" stroke-width="1.8"><path d="M-9,-3 C-13,0 -12,6 -8,6 C-6,6 -6,2 -7,-2Z"/><path d="M9,-6 C13,-4 13,2 9,3 C7,3 7,-1 8,-5Z"/><path d="M9,0 C13,2 12,8 8,8 C6,8 6,4 7,0Z"/></g></g></g>`;
  }
  const CAB0 = { yaw: 0, nod: 0, fecho: 0, feliz: 0, boca: 0, sorriso: 0.55, sobr: 0, franze: 0, esc: 1, dilata: 0, olhoX: 0, olhoY: 0, vesgo: 0 };

  /* ---------- ícone do menu (parado, sem gradientes com id): cabeça do macaco entre folhas, com uma banana ---------- */
  function gerarIcone() {
    const E = estadoCabeca(Object.assign({}, CAB0, { yaw: 0.1, nod: 0.06, feliz: 0.3, boca: 0.3, sorriso: 1, sobr: 0.4, esc: 1.08, olhoX: 0.3, olhoY: 0.25 }));
    let folhas = '';
    for (const [x, y, r, c] of [[30, 66, -150, '#4E9A3E'], [190, 60, -30, '#3E8436'], [22, 150, 160, '#5FAE48'], [198, 150, 20, '#4E9A3E'], [70, 196, 120, '#3E8436'], [150, 198, 60, '#5FAE48']]) {
      folhas += `<g transform="translate(${x},${y}) rotate(${r})"><path d="M0,0 C10,-14 34,-14 46,0 C34,14 10,14 0,0Z" fill="${c}" stroke="#1E4A1E" stroke-width="2"/><path d="M2,0 L42,0" stroke="#B8E08A" stroke-width="1.6"/></g>`;
    }
    return `<circle cx="110" cy="112" r="100" fill="#C4E6A8"/><circle cx="80" cy="76" r="60" fill="#EAF8D8" opacity=".6"/>${folhas}
<path d="M17.5,150 Q110,134 202.5,150 A100,100 0 0 1 17.5,150Z" fill="#6AA84E" opacity=".5"/>
<g transform="translate(110,114) scale(1.2)">${svgCabeca('', E, true)}</g>
<g transform="translate(168,196) rotate(24) scale(1.25)">${svgBanana('', true)}</g>`;
  }

  /* =====================================================================================
     4. Cenário — selva, cascata, árvores, liana, ramo do habitat, bichos
     ===================================================================================== */
  function defsCena(u) {
    return `<linearGradient id="${u}ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4F4D4"/><stop offset=".35" stop-color="#BFE0B4"/><stop offset=".7" stop-color="#8CC292"/><stop offset="1" stop-color="#5E9C74"/></linearGradient>
<radialGradient id="${u}sol"><stop offset="0" stop-color="#FFFCE6"/><stop offset=".25" stop-color="#F8F6CC" stop-opacity=".7"/><stop offset="1" stop-color="#F0F4C0" stop-opacity="0"/></radialGradient>
<linearGradient id="${u}nevoa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF6EC" stop-opacity="0"/><stop offset=".5" stop-color="#EAF6EC" stop-opacity=".7"/><stop offset="1" stop-color="#EAF6EC" stop-opacity="0"/></linearGradient>
<linearGradient id="${u}rocha" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A4B4A0"/><stop offset=".5" stop-color="#7E907C"/><stop offset="1" stop-color="#5A6C5C"/></linearGradient>
<linearGradient id="${u}agua" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2FCFF"/><stop offset=".5" stop-color="#C6EAF4"/><stop offset="1" stop-color="#94CCDE"/></linearGradient>
<radialGradient id="${u}lago" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#D6F2F6"/><stop offset=".6" stop-color="#9ED2DC"/><stop offset="1" stop-color="#78B4BE"/></radialGradient>
<linearGradient id="${u}tronco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9C7C58"/><stop offset=".35" stop-color="#7A5C3E"/><stop offset=".75" stop-color="#55402A"/><stop offset="1" stop-color="#3A2A1A"/></linearGradient>
<linearGradient id="${u}ramo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A88660"/><stop offset=".45" stop-color="#7A5C3E"/><stop offset="1" stop-color="#46321E"/></linearGradient>
<linearGradient id="${u}chao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E8C3E"/><stop offset=".3" stop-color="#55742E"/><stop offset=".7" stop-color="#3E5A22"/><stop offset="1" stop-color="#2C4218"/></linearGradient>
<linearGradient id="${u}chaoLonge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A2C69A"/><stop offset="1" stop-color="#7AA470"/></linearGradient>
<linearGradient id="${u}musgo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8D060"/><stop offset=".6" stop-color="#78A43C"/><stop offset="1" stop-color="#557A28"/></linearGradient>
<linearGradient id="${u}liana" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A89A52"/><stop offset=".5" stop-color="#7A6E36"/><stop offset="1" stop-color="#4E4620"/></linearGradient>
<linearGradient id="${u}raio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFBE0" stop-opacity=".9"/><stop offset=".55" stop-color="#FAF6D0" stop-opacity=".4"/><stop offset="1" stop-color="#F4F0C0" stop-opacity="0"/></linearGradient>
<radialGradient id="${u}somb"><stop offset="0" stop-color="#14240C" stop-opacity=".45"/><stop offset="1" stop-color="#14240C" stop-opacity="0"/></radialGradient>
<radialGradient id="${u}bruma"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".85"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>`;
  }
  // folha grande ao longo de +x (nervura central e laterais), rodada e posta no sítio
  function folha(x, y, L, W, ang, cor, nerv) {
    const d = `M0,0 C${n1(L * 0.18)},${n1(-W)} ${n1(L * 0.72)},${n1(-W * 0.92)} ${n1(L)},0 C${n1(L * 0.72)},${n1(W * 0.92)} ${n1(L * 0.18)},${n1(W)} 0,0Z`;
    let v = `M2,0 Q${n1(L * 0.5)},${n1(-W * 0.06)} ${n1(L * 0.95)},0`;
    for (let k = 1; k < 6; k++) { const xk = L * k / 6.4; v += ` M${n1(xk)},0 q${n1(L * 0.07)},${n1(-W * 0.42)} ${n1(L * 0.15)},${n1(-W * 0.62)} M${n1(xk)},0 q${n1(L * 0.07)},${n1(W * 0.42)} ${n1(L * 0.15)},${n1(W * 0.62)}`; }
    return `<g transform="translate(${n1(x)},${n1(y)}) rotate(${n1(ang)})"><path d="${d}" fill="${cor}" stroke="#1E441C" stroke-width="2"/><path d="${v}" fill="none" stroke="${nerv || '#B4DC86'}" stroke-width="1.6" stroke-linecap="round" opacity=".65"/><path d="M${n1(L * 0.12)},${n1(-W * 0.45)} C${n1(L * 0.35)},${n1(-W * 0.85)} ${n1(L * 0.6)},${n1(-W * 0.8)} ${n1(L * 0.8)},${n1(-W * 0.4)}" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity=".18"/></g>`;
  }
  const VERDES = ['#5FA84A', '#4E9440', '#3E7E36', '#72B852', '#2F6A2E', '#68AE4C'];
  function moita(x, y, n, L0, L1, a0, a1, rng, cls, cores, extra) {   // tufo de folhas grandes em leque, que balança
    let s = `<g class="${cls}" data-x="${x}" data-y="${y}">`;
    for (let i = 0; i < n; i++) {
      const a = lerp(a0, a1, n > 1 ? i / (n - 1) : 0.5) + (rng() - 0.5) * 12, L = lerp(L0, L1, rng());
      s += folha(x + (rng() - 0.5) * 16, y + (rng() - 0.5) * 8, L, L * (0.22 + rng() * 0.1), a, (cores || VERDES)[Math.floor(rng() * (cores || VERDES).length)]);
    }
    return s + (extra || '') + '</g>';
  }
  function fronde(x, y, L, ang, cor, rng) {   // folha de palmeira: talo curvo com folíolos finos
    let s = `<g transform="translate(${x},${y}) rotate(${ang})"><path d="M0,0 Q${n1(L * 0.5)},${n1(-L * 0.18)} ${L},${n1(L * 0.08)}" fill="none" stroke="#3E6A24" stroke-width="3.5" stroke-linecap="round"/>`;
    for (let k = 1; k < 16; k++) {
      const t = k / 16, px = L * t, py = -L * 0.18 * 2 * t * (1 - t) * 2 + L * 0.08 * t * t, w = 34 * (1 - t * 0.6);
      s += `<path d="M${n1(px)},${n1(py)} q${n1(w * 0.3)},${n1(-w * 0.5)} ${n1(w * 0.75)},${n1(-w * 0.9)} q${n1(-w * 0.2)},${n1(w * 0.6)} ${n1(-w * 0.75)},${n1(w * 0.9)}Z" fill="${cor}" stroke="#2A4E1A" stroke-width="1"/>`;
      s += `<path d="M${n1(px)},${n1(py)} q${n1(w * 0.3)},${n1(w * 0.45)} ${n1(w * 0.7)},${n1(w * 0.85)} q${n1(-w * 0.25)},${n1(-w * 0.5)} ${n1(-w * 0.7)},${n1(-w * 0.85)}Z" fill="${cor}" stroke="#2A4E1A" stroke-width="1"/>`;
    }
    return s + '</g>';
  }
  function hibisco(x, y, r, rot, cor, cor2) {
    let s = `<g transform="translate(${x},${y}) rotate(${rot})">`;
    for (let k = 0; k < 5; k++) s += `<ellipse cx="0" cy="${n1(-r * 0.55)}" rx="${n1(r * 0.42)}" ry="${n1(r * 0.6)}" transform="rotate(${k * 72})" fill="${cor}" stroke="#8A1A20" stroke-width="1.6"/>`;
    s += `<circle r="${n1(r * 0.28)}" fill="${cor2}"/><path d="M0,0 L${n1(r * 0.5)},${n1(-r * 0.62)}" stroke="#F8E060" stroke-width="2.4" stroke-linecap="round"/><circle cx="${n1(r * 0.5)}" cy="${n1(-r * 0.62)}" r="2.6" fill="#FFE040"/>`;
    for (let k = 0; k < 5; k++) s += `<path d="M0,0 L0,${n1(-r * 0.75)}" transform="rotate(${k * 72 + 36})" stroke="#FFFFFF" stroke-width="1.4" opacity=".35"/>`;
    return s + '</g>';
  }
  function heliconia(x, y, e, rot) {
    let s = `<g transform="translate(${x},${y}) rotate(${rot}) scale(${e})"><path d="M0,0 C2,-40 -2,-80 4,-130" fill="none" stroke="#4E7A2A" stroke-width="4" stroke-linecap="round"/>`;
    for (let k = 0; k < 6; k++) {
      const yy = -20 - k * 19, lado = k % 2 ? 1 : -1;
      s += `<path d="M${n1(1 + k * 0.4)},${yy} C${lado * 10},${yy - 2} ${lado * 30},${yy - 10} ${lado * 36},${yy - 22} C${lado * 22},${yy - 16} ${lado * 10},${yy - 12} ${n1(1 + k * 0.4)},${yy - 10}Z" fill="${k % 3 === 2 ? '#F6B030' : '#E8402A'}" stroke="#8A1A10" stroke-width="1.6"/><path d="M${lado * 34},${yy - 21} l${lado * 2},-3" stroke="#F8E060" stroke-width="3" stroke-linecap="round"/>`;
    }
    return s + '</g>';
  }
  function orquidea(x, y, e) {
    let s = `<g transform="translate(${x},${y}) scale(${e})">`;
    for (let k = 0; k < 5; k++) s += `<ellipse cy="-8" rx="5" ry="9" transform="rotate(${k * 72})" fill="#F4A6D6" stroke="#A8407A" stroke-width="1.2"/>`;
    return s + `<path d="M-4,0 C-6,8 6,8 4,0Z" fill="#C83A8A" stroke="#7A1A50" stroke-width="1"/><circle r="2.4" fill="#FFE070"/></g>`;
  }
  function bromelia(x, y, e) {
    let s = `<g transform="translate(${x},${y}) scale(${e})">`;
    for (let k = 0; k < 9; k++) { const a = -160 + k * 17.5; s += `<path d="M0,0 Q${n1(Math.cos(a / GRAU) * 18)},${n1(Math.sin(a / GRAU) * 18 - 6)} ${n1(Math.cos(a / GRAU) * 34)},${n1(Math.sin(a / GRAU) * 34)}" fill="none" stroke="${k % 2 ? '#5E9A3A' : '#7AB44A'}" stroke-width="6" stroke-linecap="round"/>`; }
    return s + `<path d="M-6,-2 L0,-22 L6,-2Z" fill="#E8402A" stroke="#8A1A10" stroke-width="1.4"/></g>`;
  }
  function bananaChao(u, x, y, r, cls) {
    return `<g class="${cls}" transform="translate(${x},${y}) rotate(${r})"><path d="M-22,0 C-14,-10 10,-12 24,-4 C26,-2 24,2 20,1 C8,-4 -10,-2 -20,5 C-24,6 -25,2 -22,0Z" fill="url(#${u}banana)" stroke="#8A5A10" stroke-width="2"/><path d="M-16,0 C-6,-6 8,-7 18,-3" fill="none" stroke="#FFF6C0" stroke-width="1.8" stroke-linecap="round" opacity=".8"/><path d="M24,-4 l4,-1" stroke="#5A3A10" stroke-width="3" stroke-linecap="round"/><path d="M-22,1 l-3,2" stroke="#3A2A10" stroke-width="3" stroke-linecap="round"/></g>`;
  }

  function cenaFundo(u, rng, meta) {
    let s = `<rect x="-10" y="-10" width="1620" height="920" fill="url(#${u}ceu)"/><circle cx="240" cy="30" r="560" fill="url(#${u}sol)"/>`;
    // troncos e copas ao longe, na névoa
    for (let i = 0; i < 17; i++) { const x = 20 + i * 100 + rng() * 40, w = 7 + rng() * 7, t = 160 + rng() * 80; s += `<path d="M${n1(x - w)},600 L${n1(x - w * 0.6)},${n1(t)} L${n1(x + w * 0.6)},${n1(t)} L${n1(x + w)},600Z" fill="#A6CCAE" opacity=".6"/>`; }
    for (let i = 0; i < 36; i++) { const x = rng() * 1660 - 30, y = 60 + rng() * 230, r = 50 + rng() * 80; s += `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r)}" fill="${['#BFDFC4', '#B2D6B8', '#C8E4C8', '#A8CEAE'][i % 4]}" opacity="${n3(0.55 + rng() * 0.3)}"/>`; }
    s += `<rect x="-10" y="250" width="1620" height="320" fill="url(#${u}nevoa)"/>`;
    for (let i = 0; i < 11; i++) { const x = 60 + i * 150 + rng() * 60, w = 12 + rng() * 9; s += `<path d="M${n1(x - w)},640 C${n1(x - w * 0.7)},420 ${n1(x - w * 0.6)},250 ${n1(x - w * 0.5)},80 L${n1(x + w * 0.5)},80 C${n1(x + w * 0.6)},250 ${n1(x + w * 0.7)},420 ${n1(x + w)},640Z" fill="#7EA88A" opacity=".7"/>`; }
    for (let i = 0; i < 24; i++) { const x = rng() * 1660 - 30, y = 20 + rng() * 170, r = 60 + rng() * 70; s += `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r)}" fill="${['#8CBC94', '#80B28A', '#96C49C'][i % 3]}" opacity="${n3(0.75 + rng() * 0.2)}"/>`; }
    // raios de luz vindos de cima à esquerda
    s += `<g class="cn-raios" pointer-events="none">`;
    for (const [x0, w0, x1, w1, op] of [[150, 70, 560, 180, 0.42], [380, 50, 860, 140, 0.32], [620, 80, 1180, 200, 0.34], [60, 40, 300, 110, 0.3], [900, 46, 1440, 160, 0.26]]) {
      s += `<path class="cn-raio" d="M${x0},-10 L${x0 + w0},-10 L${x1 + w1},900 L${x1},900Z" fill="url(#${u}raio)" opacity="${op}" data-op="${op}"/>`;
    }
    s += `</g>`;
    // cascata: falésia com plantas, água com riscos que correm, lago com espuma e bruma
    s += `<path d="M206,650 C210,520 220,400 236,300 C246,246 266,212 304,203 C334,197 364,199 394,202 C432,205 462,222 478,262 C498,322 502,462 510,650Z" fill="url(#${u}rocha)" stroke="#4E5E4E" stroke-width="2.5"/>`;
    s += `<g fill="none" stroke="#56685A" stroke-width="2.5" stroke-linecap="round" opacity=".55"><path d="M236,330 C250,326 262,330 272,340"/><path d="M226,440 C244,434 262,440 276,452"/><path d="M450,300 C462,310 470,326 474,344"/><path d="M462,420 C476,430 484,446 488,466"/><path d="M240,540 C256,532 274,536 288,548"/></g>`;
    for (let i = 0; i < 14; i++) { const x = 250 + i * 17 + rng() * 8, y = 204 + Math.abs(x - 360) * 0.08; s += `<circle cx="${n1(x)}" cy="${n1(y - 4)}" r="${n1(10 + rng() * 10)}" fill="${['#6EA45A', '#5E944E', '#7EB466'][i % 3]}"/>`; }
    for (const [x, y] of [[238, 360], [470, 330], [480, 480], [230, 500]]) s += `<ellipse cx="${x}" cy="${y}" rx="18" ry="9" fill="#6E9E58" opacity=".85"/>`;
    s += `<path d="M318,206 C316,320 312,450 306,594 L418,594 C412,450 406,320 404,206Z" fill="url(#${u}agua)" opacity=".95"/>`;
    for (let i = 0; i < 8; i++) {
      const x = 324 + i * 10.5 + rng() * 4;
      s += `<path class="cn-agua" d="M${n1(x)},210 C${n1(x - 1)},350 ${n1(x - 3 - (x - 362) * 0.1)},470 ${n1(x - 5 - (x - 362) * 0.14)},590" fill="none" stroke="#FFFFFF" stroke-width="${n1(2.5 + rng() * 3)}" stroke-linecap="round" stroke-dasharray="${n1(30 + rng() * 40)} ${n1(40 + rng() * 50)}" opacity="${n3(0.45 + rng() * 0.35)}" data-v="${n1(160 + rng() * 120)}"/>`;
    }
    s += `<path d="M318,206 C330,200 390,200 404,206" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity=".8"/>`;
    s += `<path d="M-10,600 C200,590 420,604 700,596 C980,588 1300,604 1610,594 V720 H-10Z" fill="url(#${u}chaoLonge)"/>`;
    s += `<ellipse cx="362" cy="610" rx="130" ry="20" fill="url(#${u}lago)" stroke="#6AA4AE" stroke-width="2"/>`;
    for (let i = 0; i < 7; i++) s += `<ellipse class="cn-espuma" cx="${n1(316 + i * 15)}" cy="${n1(598 + (i % 2) * 4)}" rx="${n1(12 + rng() * 8)}" ry="5" fill="#FFFFFF" opacity=".85"/>`;
    for (let i = 0; i < 9; i++) s += `<circle class="cn-bruma" r="1" fill="url(#${u}bruma)" opacity="0"/>`;
    s += `<rect x="-10" y="500" width="1620" height="170" fill="url(#${u}nevoa)" opacity=".8"/>`;
    // pássaros ao longe
    for (let i = 0; i < 3; i++) s += `<path class="cn-ave" d="M-8,0 Q-4,-5 0,0 Q4,-5 8,0" fill="none" stroke="#4E6A56" stroke-width="2.2" stroke-linecap="round" transform="translate(-100,-100)"/>`;
    meta.aves = 3;
    return s;
  }

  function cenaMeio(u, rng, meta) {
    let s = '';
    // arbustos do plano médio (atrás do macaco)
    s += moita(200, 690, 7, 120, 170, -170, -20, rng, 'cn-moita');
    s += moita(470, 700, 6, 110, 160, -160, -40, rng, 'cn-moita');
    s += moita(780, 690, 7, 120, 180, -165, -15, rng, 'cn-moita');
    s += moita(1010, 700, 6, 110, 160, -160, -30, rng, 'cn-moita');
    s += moita(1460, 690, 7, 130, 180, -170, -20, rng, 'cn-moita');
    s += `<g class="cn-moita" data-x="640" data-y="700">${fronde(640, 700, 190, -150, '#5E9E40', rng)}${fronde(640, 700, 180, -40, '#4E8E38', rng)}${fronde(640, 700, 150, -95, '#6AAE4A', rng)}</g>`;
    s += heliconia(860, 700, 1, -4) + heliconia(890, 706, 0.8, 10) + hibisco(268, 640, 20, 10, '#E8343A', '#FFD040') + hibisco(1080, 660, 18, -20, '#F25A8A', '#FFE070') + hibisco(1500, 640, 22, 30, '#E8343A', '#FFD040');
    // árvore grande da esquerda (raízes de contraforte, musgo, bromélia, ramo do tucano)
    s += `<path d="M40,-20 C52,200 60,420 52,600 C40,640 10,680 -20,720 L270,720 C236,690 206,660 196,620 C186,440 184,220 196,-20Z" fill="url(#${u}tronco)" stroke="#2E2014" stroke-width="3"/>`;
    s += `<path d="M120,600 C110,640 90,690 60,724 L92,724 C110,690 124,650 130,610Z M170,610 C190,650 220,690 262,722 L230,724 C204,700 184,660 170,620Z" fill="#4A3622" opacity=".6"/>`;
    for (let k = 0; k < 9; k++) { const x = 70 + k * 14; s += `<path d="M${x},${-10 + k * 20} C${x + 6},${160 + k * 20} ${x - 4},${360 + k * 10} ${x + 3},${600 - k * 4}" fill="none" stroke="#2E2014" stroke-width="2.2" opacity=".35"/>`; }
    s += `<path d="M66,0 C74,200 76,420 70,600" fill="none" stroke="#C4A27E" stroke-width="5" opacity=".35"/>`;
    s += `<path d="M48,300 C60,280 90,276 110,290 C96,300 70,304 48,320Z M182,420 C170,404 150,400 132,410 C148,422 166,426 186,440Z" fill="url(#${u}musgo)" opacity=".9"/>`;
    s += `<path d="M186,236 C240,232 290,240 340,250 C370,256 400,258 428,252" fill="none" stroke="#4A3422" stroke-width="16" stroke-linecap="round"/><path d="M192,230 C240,226 290,234 340,244 C372,250 400,252 426,247" fill="none" stroke="#9C7C58" stroke-width="4" stroke-linecap="round" opacity=".6"/>`;
    s += moita(430, 250, 5, 70, 100, -60, 60, rng, 'cn-moita');
    s += bromelia(150, 370, 1) + orquidea(196, 520, 1.1) + orquidea(210, 540, 0.9);
    // tronco da árvore do habitat (à direita)
    s += `<path d="M1222,-20 C1230,200 1232,420 1224,600 C1210,646 1180,690 1140,728 L1460,728 C1414,690 1384,650 1374,600 C1366,420 1366,200 1372,-20Z" fill="url(#${u}tronco)" stroke="#2E2014" stroke-width="3"/>`;
    s += `<path d="M1290,600 C1280,644 1256,690 1220,728 L1254,728 C1280,694 1296,650 1300,610Z M1344,610 C1362,654 1392,694 1430,726 L1398,728 C1372,704 1354,664 1344,620Z" fill="#4A3622" opacity=".6"/>`;
    for (let k = 0; k < 9; k++) { const x = 1240 + k * 14; s += `<path d="M${x},${-10 + k * 16} C${x + 6},${180 + k * 14} ${x - 4},${380 + k * 8} ${x + 3},${610 - k * 4}" fill="none" stroke="#2E2014" stroke-width="2.2" opacity=".35"/>`; }
    s += `<path d="M1236,0 C1244,200 1246,420 1240,600" fill="none" stroke="#C4A27E" stroke-width="5" opacity=".35"/>`;
    s += `<path d="M1226,620 C1250,600 1290,598 1320,612 C1290,622 1256,630 1226,648Z" fill="url(#${u}musgo)" opacity=".9"/>` + bromelia(1360, 640, 1.1) + orquidea(1366, 300, 1);
    // lianas penduradas (balançam)
    for (const [x, L, f] of [[96, 520, 0], [262, 380, 1], [1172, 300, 2], [1500, 560, 3], [1420, 260, 4]]) {
      let d = `M0,0`, folhas = '';
      for (let y = 40; y <= L; y += 40) d += ` Q${n1(10 * Math.sin(y / 60 + f))},${y - 20} ${n1(6 * Math.sin(y / 45 + f))},${y}`;
      for (let y = 60; y < L; y += 55 + rng() * 30) { const lado = rng() < 0.5 ? -1 : 1; folhas += `<path d="M${n1(6 * Math.sin(y / 45 + f))},${n1(y)} c${lado * 8},-8 ${lado * 22},-6 ${lado * 26},4 c${-lado * 10},6 ${-lado * 20},4 ${-lado * 26},-4Z" fill="${VERDES[Math.floor(rng() * 4)]}" stroke="#1E441C" stroke-width="1.4"/>`; }
      s += `<g class="cn-liana" data-x="${x}" data-y="-20" data-f="${f}"><g transform="translate(${x},-20)"><path d="${d}" fill="none" stroke="#4E4620" stroke-width="7" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#9A8C4A" stroke-width="2.5" stroke-linecap="round" opacity=".7" transform="translate(-1.5,0)"/>${folhas}</g></g>`;
    }
    meta.nada = 0;
    return s;
  }

  function cenaChao(u, rng) {
    let s = `<path d="M-10,700 C200,690 420,706 700,698 C980,690 1250,706 1610,694 V910 H-10Z" fill="url(#${u}chao)"/>`;
    s += `<path d="M-10,700 C200,690 420,706 700,698 C980,690 1250,706 1610,694 V722 C1250,734 980,718 700,726 C420,734 200,718 -10,728Z" fill="#9CC060" opacity=".4"/>`;
    for (const [x, y, rx] of [[560, 790, 190], [880, 740, 140], [300, 760, 110]]) s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${n1(rx * 0.16)}" fill="#E8F4B0" opacity=".18"/>`;
    // folhas caídas, ervas e pedrinhas (mais pequenas ao longe)
    for (let i = 0; i < 140; i++) {
      const k = Math.pow(rng(), 0.8), y = 708 + k * 200, e = 0.5 + k * 1.1, x = rng() * 1660 - 30;
      if (rng() < 0.55) s += `<path d="M0,-${n1(8 * e)} C${n1(4 * e)},-${n1(4 * e)} ${n1(4 * e)},${n1(3 * e)} 0,${n1(7 * e)} C-${n1(4 * e)},${n1(3 * e)} -${n1(4 * e)},-${n1(4 * e)} 0,-${n1(8 * e)}Z" transform="translate(${n1(x)},${n1(y)}) rotate(${n1(rng() * 360)}) scale(1,.55)" fill="${['#7A9A3A', '#9AA840', '#6E8A30', '#B49A48', '#8A7A34'][Math.floor(rng() * 5)]}" opacity=".9"/>`;
      else s += `<path d="M${n1(x)},${n1(y)} q${n1((rng() - 0.5) * 6)},-${n1(8 * e)} ${n1((rng() - 0.5) * 10)},-${n1((10 + rng() * 8) * e)}" stroke="${['#7EA43C', '#5E8A2E', '#9AC050'][Math.floor(rng() * 3)]}" stroke-width="${n1(1.6 * e)}" fill="none" stroke-linecap="round"/>`;
    }
    for (const [x, y, r] of [[420, 790, 16], [760, 800, 12], [1010, 760, 18], [1180, 790, 14], [300, 830, 20]]) s += `<ellipse cx="${x}" cy="${y + r * 0.4}" rx="${r * 1.3}" ry="${r * 0.35}" fill="#1E3010" opacity=".3"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${n1(r * 0.7)}" fill="#8E9886" stroke="#4E5848" stroke-width="2"/><ellipse cx="${x - r * 0.3}" cy="${y - r * 0.3}" rx="${n1(r * 0.4)}" ry="${n1(r * 0.2)}" fill="#C4CCB8" opacity=".6"/><path d="M${x - r},${y - 2} C${x - r * 0.5},${y - r * 0.8} ${x + r * 0.2},${y - r * 0.8} ${x + r * 0.6},${y - r * 0.5}" fill="none" stroke="#8AB44A" stroke-width="4" stroke-linecap="round" opacity=".8"/>`;
    // pilha de bananas caídas ao lado do macaco
    s += `<ellipse cx="${PILHA.x}" cy="${PILHA.y + 6}" rx="40" ry="7" fill="url(#${u}somb)"/>`;
    s += bananaChao(u, PILHA.x - 10, PILHA.y, -8, 'bc bc0') + bananaChao(u, PILHA.x + 14, PILHA.y + 3, 12, 'bc bc1') + bananaChao(u, PILHA.x + 2, PILHA.y - 8, -2, 'bc bc2');
    return s;
  }

  // habitat — parte de trás: zona de toque, folhagem densa, ramo (dobra à volta do tronco) e cacho de bananas
  function cenaHabitatTras(u, rng, meta) {
    let s = `<rect x="900" y="250" width="290" height="330" fill="#000" fill-opacity="0"/>`;
    const escuros = ['#3E7E36', '#2F6A2E', '#4E9440', '#2A5E2A'];
    s += `<g class="hb-tras" data-x="1100" data-y="440">`;
    s += moita(1180, 300, 6, 120, 170, -200, -60, rng, 'hb-m', escuros) + moita(1060, 330, 6, 110, 160, -190, -30, rng, 'hb-m', escuros);
    s += moita(1210, 420, 5, 110, 150, -230, -110, rng, 'hb-m', VERDES) + moita(980, 420, 6, 100, 150, -200, -40, rng, 'hb-m', VERDES);
    s += moita(1120, 410, 5, 90, 130, -170, -10, rng, 'hb-m', escuros);
    s += hibisco(1160, 360, 17, 15, '#F25A8A', '#FFE070') + orquidea(1010, 380, 1.1) + orquidea(1028, 396, 0.9) + hibisco(1222, 442, 15, -10, '#E8343A', '#FFD040');
    s += `</g>`;
    // ramo
    let top = '', bot = '';
    for (let x = TRONCO_X + 10; x >= 884; x -= 8) { top += `${x === TRONCO_X + 10 ? 'M' : 'L'}${x},${n1(RAMO_Y(x))}`; bot = `L${x},${n1(RAMO_Y(x) + RAMO_E(x))}` + bot; }
    const pontaY = RAMO_Y(884) + RAMO_E(884) / 2;
    s += `<g class="hb-ramo">`;
    s += `<path d="${top} C874,${n1(RAMO_Y(884))} 868,${n1(pontaY + 8)} 884,${n1(RAMO_Y(884) + RAMO_E(884))}${bot.replace(/^L/, 'L')}Z" fill="url(#${u}ramo)" stroke="#2E2014" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<path d="${top}" fill="none" stroke="#C8A67E" stroke-width="3" opacity=".55" transform="translate(0,3)"/>`;
    for (let i = 0; i < 9; i++) { const x = 900 + i * 36 + rng() * 10, y = RAMO_Y(x) + RAMO_E(x) * (0.35 + rng() * 0.4); s += `<path d="M${n1(x)},${n1(y)} q14,${n1(-2 + rng() * 4)} 28,${n1(-1 + rng() * 2)}" fill="none" stroke="#3A2818" stroke-width="2" stroke-linecap="round" opacity=".5"/>`; }
    s += `<path d="M1000,${n1(RAMO_Y(1000) + 2)} C1040,${n1(RAMO_Y(1040) - 3)} 1110,${n1(RAMO_Y(1110) - 3)} 1180,${n1(RAMO_Y(1180) + 1)}" fill="none" stroke="#8AB848" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
    s += `<path d="M904,${n1(RAMO_Y(904) + 4)} q-22,-26 -24,-52" fill="none" stroke="#4A3422" stroke-width="5" stroke-linecap="round"/>` + moita(880, 400, 4, 60, 90, -140, -20, rng, 'hb-m', VERDES);
    // cacho de bananas (as bananas crescem para cima) e a flor roxa pendurada
    const cx = CACHO.x, cy = CACHO.y + 10;
    s += `<path d="M${cx},${n1(cy)} C${cx + 4},${n1(cy + 20)} ${cx + 2},${n1(cy + 50)} ${cx + 6},${n1(cy + 92)}" fill="none" stroke="#5E7A2A" stroke-width="6" stroke-linecap="round"/>`;
    s += `<path d="M${cx + 6},${n1(cy + 90)} C${cx - 6},${n1(cy + 100)} ${cx - 4},${n1(cy + 122)} ${cx + 6},${n1(cy + 130)} C${cx + 16},${n1(cy + 122)} ${cx + 18},${n1(cy + 100)} ${cx + 6},${n1(cy + 90)}Z" fill="#8A2A5A" stroke="#4A1030" stroke-width="2"/><path d="M${cx + 2},${n1(cy + 100)} C${cx},${n1(cy + 110)} ${cx + 2},${n1(cy + 118)} ${cx + 5},${n1(cy + 124)}" fill="none" stroke="#C45A8A" stroke-width="2" opacity=".7"/>`;
    meta.cacho = [];
    [[-16, 30, -28], [-6, 26, -10], [6, 26, 8], [18, 30, 26], [-12, 54, -24], [2, 50, -4], [14, 52, 18]].forEach(([dx, dy, r], k) => {
      const x = cx + dx + dy * 0.05, y = cy + dy;
      meta.cacho.push({ x, y, r });
      s += `<g class="hb-ban" transform="translate(${n1(x)},${n1(y)}) rotate(${r}) scale(1.25)"><path d="M-6,0 C-8,-12 -6,-24 -1,-34 C1,-35 3,-34 3,-32 C0,-22 0,-11 6,0 C3,3 -3,3 -6,0Z" fill="url(#${u}banana)" stroke="#8A5A10" stroke-width="1.8"/><path d="M-3,-4 C-4,-14 -3,-22 0,-29" fill="none" stroke="#FFF6C0" stroke-width="1.4" stroke-linecap="round" opacity=".8"/><path d="M0,-33 l1,-3" stroke="#5A3A10" stroke-width="2.4" stroke-linecap="round"/></g>`;
    });
    s += `</g>`;
    return s;
  }
  // habitat — parte da frente (tapa as pernas e a barriga do macaco sentado no ramo)
  function svgHabitatFrente(u, rng) {
    let s = `<g class="hb-frente" pointer-events="none">`;
    s += moita(1024, 500, 3, 100, 130, 105, 150, rng, 'hb-f', VERDES) + moita(1172, 502, 3, 100, 130, 30, 75, rng, 'hb-f', VERDES);
    s += moita(1066, 506, 2, 66, 80, -70, -40, rng, 'hb-f', ['#72B852', '#5FA84A']) + moita(1138, 508, 2, 66, 80, -150, -110, rng, 'hb-f', ['#68AE4C', '#5FA84A']);
    s += moita(1210, 498, 3, 90, 120, 20, 100, rng, 'hb-f', VERDES) + moita(950, 502, 3, 80, 110, 80, 150, rng, 'hb-f', VERDES);
    let d = '', fl = '';
    for (let x = 960; x <= 1220; x += 20) { const y = RAMO_Y(x) + RAMO_E(x) * 0.6 + 14 * Math.sin((x - 960) / 40); d += `${d ? 'L' : 'M'}${x},${n1(y)}`; if ((x / 20) % 2 === 0) fl += `<path d="M${x},${n1(y)} c-6,8 -2,20 6,22 c4,-8 2,-18 -6,-22Z" fill="${VERDES[(x / 20) % 4]}" stroke="#1E441C" stroke-width="1.4"/>`; }
    s += `<path d="${d}" fill="none" stroke="#4E6A24" stroke-width="3.5" stroke-linecap="round"/>${fl}`;
    return s + '</g>';
  }

  // liana grande (o macaco agarra-a): roda à volta do pivô; desenhada a apontar para baixo a partir do pivô
  function svgLiana(u, rng) {
    let d = 'M0,0', folhas = '';
    for (let y = 40; y <= LL + 80; y += 40) d += ` Q${n1(5 * Math.sin(y / 50))},${y - 20} ${n1(3 * Math.sin(y / 37))},${y}`;
    for (let y = 300; y < LL + 70; y += 38 + rng() * 22) { const lado = rng() < 0.5 ? -1 : 1; folhas += `<path d="M0,${n1(y)} c${lado * 8},-9 ${lado * 24},-7 ${lado * 28},4 c${-lado * 10},7 ${-lado * 22},5 ${-lado * 28},-4Z" fill="${VERDES[Math.floor(rng() * 4)]}" stroke="#1E441C" stroke-width="1.4"/>`; }
    return `<g class="liana" pointer-events="none"><path d="${d}" fill="none" stroke="#3E3816" stroke-width="12" stroke-linecap="round"/><path d="${d}" fill="none" stroke="url(#${u}liana)" stroke-width="8" stroke-linecap="round"/>
<path d="${d}" fill="none" stroke="#C8BC72" stroke-width="2" stroke-linecap="round" opacity=".6" transform="translate(-2,0)"/>
<path d="M0,${LL + 70} c-12,10 -10,26 4,28 c10,-2 10,-14 2,-18" fill="none" stroke="#5A5020" stroke-width="5" stroke-linecap="round"/>${folhas}</g>`;
  }
  function svgBorboleta(cls, c1, c2, e) {
    const asa = s => `<g class="bf-asa${s > 0 ? 'D' : 'E'}"><path d="M0,-2 C${s * 10},-22 ${s * 30},-24 ${s * 30},-8 C${s * 30},2 ${s * 14},4 0,0Z" fill="${c1}" stroke="#1A1A2A" stroke-width="1.6"/><path d="M0,1 C${s * 14},4 ${s * 22},14 ${s * 16},22 C${s * 8},24 ${s * 2},14 0,2Z" fill="${c2}" stroke="#1A1A2A" stroke-width="1.6"/><circle cx="${s * 20}" cy="-12" r="3" fill="#FFFFFF" opacity=".8"/><path d="M${s * 4},-4 C${s * 14},-14 ${s * 22},-16 ${s * 27},-10" fill="none" stroke="#1A1A2A" stroke-width="1.2" opacity=".5"/></g>`;
    return `<g class="${cls}" pointer-events="none" transform="translate(-200,-200)"><g class="bf-c" transform="scale(${e})">${asa(-1)}${asa(1)}<ellipse rx="2.6" ry="11" fill="#2A1A10"/><path d="M-1,-10 C-3,-16 -6,-19 -8,-20 M1,-10 C3,-16 6,-19 8,-20" fill="none" stroke="#2A1A10" stroke-width="1.2" stroke-linecap="round"/></g></g>`;
  }
  function svgTucano() {
    return `<g class="ev-tuc" pointer-events="none" transform="translate(-300,-300)"><g class="tc-c">
<path d="M-10,-18 C-22,-6 -30,8 -36,24 L-26,26 C-20,12 -12,0 -2,-10Z" fill="#14141C" stroke="#000" stroke-width="1.5"/>
<ellipse cx="-4" cy="-32" rx="18" ry="24" fill="#1C1C26" stroke="#000" stroke-width="2"/><path d="M-14,-46 C-8,-52 2,-52 8,-46" fill="none" stroke="#5A5A70" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
<ellipse cx="-8" cy="-11" rx="7" ry="4" fill="#E8322A"/>
<ellipse cx="8" cy="-44" rx="10" ry="12" fill="#FFF2B8" stroke="#C8B060" stroke-width="1.5"/>
<g class="tc-asa"><path d="M-14,-44 C-2,-46 6,-36 4,-20 C-6,-14 -16,-20 -20,-30 C-20,-38 -18,-42 -14,-44Z" fill="#26263A" stroke="#000" stroke-width="1.6"/><path d="M-12,-36 C-6,-32 -2,-26 0,-20" fill="none" stroke="#4A4A66" stroke-width="1.6"/></g>
<g class="tc-cab"><circle cx="8" cy="-58" r="13" fill="#1C1C26" stroke="#000" stroke-width="2"/>
<g class="tc-bicoB"><path d="M18,-54 C34,-52 50,-50 60,-50 C52,-46 34,-44 18,-48Z" fill="#E8722A" stroke="#6A2A08" stroke-width="1.6"/></g>
<path d="M17,-66 C34,-70 54,-64 64,-54 C58,-50 44,-52 18,-52Z" fill="#F8B826" stroke="#6A2A08" stroke-width="1.8"/><path d="M50,-62 C56,-60 61,-57 64,-54 C60,-52 56,-52 52,-53Z" fill="#E8322A"/><path d="M20,-64 C30,-67 40,-66 48,-63" fill="none" stroke="#FFE490" stroke-width="2" stroke-linecap="round"/>
<circle cx="12" cy="-60" r="6" fill="#4CC2EE" stroke="#1A6A8A" stroke-width="1.2"/><circle cx="12.6" cy="-60" r="2.8" fill="#0A0A10"/><circle cx="13.6" cy="-61" r="1" fill="#fff"/></g>
<path d="M-4,-8 L-6,2 M4,-8 L4,2" stroke="#6A7A8A" stroke-width="2.6" stroke-linecap="round"/></g></g>`;
  }
  function svgCascaVoa(u) {
    const f = `url(#${u}banana)`;
    return `<g class="ev-casca" pointer-events="none" transform="translate(-300,-300)" opacity="0"><g transform="scale(${ESC})">
<path d="M-7,-14 C-14,-10 -18,0 -16,8 C-12,2 -9,-6 -6,-12Z" fill="${f}" stroke="#8A5A10" stroke-width="1.6"/><path d="M7,-14 C14,-10 18,0 16,8 C12,2 9,-6 6,-12Z" fill="${f}" stroke="#8A5A10" stroke-width="1.6"/><path d="M-2.6,-14 C-3,-6 -1,2 1,8 C3,2 3,-6 2.6,-14Z" fill="${f}" stroke="#8A5A10" stroke-width="1.6"/>
<path d="M-7,0 C-8,-6 -8,-10 -7,-14 L7,-14 C8,-10 8,-6 7,0 C4,3 -4,3 -7,0Z" fill="${f}" stroke="#8A5A10" stroke-width="1.8"/><path d="M-1.6,1.5 L-1.6,6 L1.6,6 L1.6,1.5Z" fill="#5A3A10"/></g></g>`;
  }
  function svgPrimeiroPlano(u, rng) {
    let s = moita(-20, 920, 6, 170, 240, -80, -10, rng, 'cn-pp') + moita(90, 930, 4, 140, 190, -110, -50, rng, 'cn-pp');
    s += moita(1630, 920, 6, 170, 240, -170, -100, rng, 'cn-pp') + moita(1520, 935, 4, 140, 190, -140, -80, rng, 'cn-pp');
    s += `<g class="cn-pp" data-x="1440" data-y="900">${heliconia(1440, 900, 1.25, 8)}</g>` + `<g class="cn-pp" data-x="200" data-y="900">${hibisco(214, 846, 24, 20, '#E8343A', '#FFD040')}</g>`;
    // folhas penduradas do topo (molduram a selva)
    s += moita(-30, -30, 5, 160, 220, 20, 80, rng, 'cn-pp') + moita(1630, -30, 5, 160, 220, 100, 160, rng, 'cn-pp');
    return s;
  }

  /* =====================================================================================
     5. Montagem e animação
     ===================================================================================== */
  let contagem = 0;
  function montar(raiz, ajudas) {
    const relogio = ajudas && ajudas.relogio;
    const reduzido = !!(ajudas && ajudas.reduzido);
    const AMB = reduzido ? 0.3 : 1;
    const u = 'macaco-' + (++contagem) + '-';
    const rng = semente(20261017);
    const meta = {};
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('aria-hidden', 'true');
    let pf = '';
    for (let i = 0; i < 22; i++) pf += `<path class="pf" d="M0,-7 C5,-5 6,2 0,8 C-6,2 -5,-5 0,-7Z" fill="${VERDES[i % VERDES.length]}" stroke="#1E441C" stroke-width=".8" opacity="0" transform="translate(-100,-100)"/>`;
    svg.innerHTML = `<defs>${defsCena(u)}${defsMacaco(u)}</defs>${cenaFundo(u, rng, meta)}${cenaMeio(u, rng, meta)}${cenaChao(u, rng)}
<g class="habitat">${cenaHabitatTras(u, rng, meta)}</g>${svgTucano()}<g class="liana-p">${svgLiana(u, rng)}</g>
${svgMacaco(u, estadoCabeca(CAB0))}${svgHabitatFrente(u, rng)}${svgCascaVoa(u)}
${svgBorboleta('bf bf-azul', '#3FA2F2', '#2A6AD8', 1.25)}${svgBorboleta('bf bf-amarela', '#FFD23F', '#F8A824', 0.85)}${svgBorboleta('bf bf-laranja', '#FF8A3D', '#E8502A', 0.8)}
<g class="particulas" pointer-events="none">${pf}</g>${svgPrimeiroPlano(u, rng)}`;
    raiz.appendChild(svg);
    const q = s => svg.querySelector(s), qq = s => Array.from(svg.querySelectorAll(s));
    const tr = (e, v) => { if (e._t !== v) { e._t = v; e.setAttribute('transform', v); } };
    const opa = (e, v) => { v = n3(v); if (e._o !== v) { e._o = v; e.setAttribute('opacity', v); } };

    /* ---------- referências do macaco ---------- */
    const macacoG = q('.macaco'), habitat = q('.habitat');
    const membro = g => {
      const cam = Array.from(g.children);
      return { s0: [cam[0].querySelector('.s0'), cam[1].querySelector('.s0')], s1: [cam[0].querySelector('.s1'), cam[1].querySelector('.s1')], ext: cam[2], aberta: cam[2].querySelector('.aberta'), punho: cam[2].querySelector('.punho') };
    };
    let cabAtras = false; const bracosG = [q('.mc-braco0'), q('.mc-braco1')];
    const bracos = [membro(bracosG[0]), membro(bracosG[1])], pernas = [membro(q('.mc-perna0')), membro(q('.mc-perna1'))];
    const caudaEl = Array.from({ length: NC }, (_, k) => qq('.mc-cauda .k' + k));
    const el = { sombra: q('.mc-sombra'), tronco: q('.tronco'), cab: q('.mc-cab'), banana: q('.mc-banana') };
    const hp = {};
    for (const g of el.cab.children) hp[g.getAttribute('class').split(' ')[1].slice(3)] = g;
    const cabT = {}, cabO = {};
    for (const k of ORDEM_CAB) if (k !== 'cranio') cabT[k] = hp[k];
    for (let i = 0; i < 2; i++) {
      const o = hp['olho' + i];
      cabT['iris' + i] = o.querySelector('.iris'); cabT['pup' + i] = o.querySelector('.pup'); cabT['psup' + i] = o.querySelector('.psup'); cabT['pinf' + i] = o.querySelector('.pinf'); cabT['sob' + i] = o.querySelector('.sob');
    }
    cabT.bocaG = hp.foc.querySelector('.bocaG'); cabT.queixo = hp.foc.querySelector('.queixo'); cabO.bocaG = cabT.bocaG;
    const sorrEl = hp.foc.querySelector('.sorr');
    function aplicarCabeca(E) {
      for (const k in E.t) tr(cabT[k], E.t[k]);
      for (const k in E.op) opa(cabO[k], E.op[k]);
      if (sorrEl._d !== E.dS) { sorrEl._d = E.dS; sorrEl.setAttribute('d', E.dS); }
    }
    const banEl = { fruta: el.banana.querySelector('.bn-fruta'), t: [0, 1, 2].map(k => el.banana.querySelector('.bn-t' + k)) };

    /* ---------- referências do cenário ---------- */
    const cn = {
      moitas: qq('.cn-moita'), pp: qq('.cn-pp'), lianas: qq('.cn-liana'), raios: qq('.cn-raio'), agua: qq('.cn-agua'), espuma: qq('.cn-espuma'), bruma: qq('.cn-bruma'), aves: qq('.cn-ave'),
      liana: q('.liana'), ramo: q('.hb-ramo'), tras: q('.hb-tras'), frente: q('.hb-frente'), hbM: qq('.hb-m'), hbF: qq('.hb-f'), cacho: qq('.hb-ban'), pilha: qq('.bc'),
      tuc: q('.ev-tuc'), tcC: q('.tc-c'), tcAsa: q('.tc-asa'), tcCab: q('.tc-cab'), tcBico: q('.tc-bicoB'), casca: q('.ev-casca'),
      bf: qq('.bf'), pf: qq('.pf')
    };
    const metaDe = e => ({ x: +e.getAttribute('data-x'), y: +e.getAttribute('data-y'), f: rnd(0, 6) });
    const mMoitas = cn.moitas.map(metaDe), mPP = cn.pp.map(metaDe), mLianas = cn.lianas.map(metaDe), mHbM = cn.hbM.map(metaDe), mHbF = cn.hbF.map(metaDe);
    const aguaV = cn.agua.map(e => +e.getAttribute('data-v'));

    /* ---------- estado ---------- */
    const S = {}, V = {};
    for (const k of CHAVES) { S[k] = { x: SENTADO[k], v: 0 }; V[k] = SENTADO[k]; }
    const SPX = { x: REP.x, v: 0 }, SPY = { x: REP.y, v: 0 }, SROT = { x: 0, v: 0 }, SY = { x: 0, v: 0 };
    let PX = REP.x, PY = REP.y, ROT = 0, BX = PX, BY = PY;
    let tempo = 0, modo = 'fora', destruido = false, respFase = 0, cauFase = 0, saltoAlvo = 0;
    let cabPos = [REP.x, REP.y - 200], narizPos = [REP.x, REP.y - 180], bocaPos = [REP.x, REP.y - 170], cabVel = 0, ultCab = null;
    const mp = [[0, 0], [0, 0]], pp = [[0, 0], [0, 0]], ikB = [{}, {}], ikP = [{}, {}];
    const maoPos = [[0, 0], [0, 0]], maoAng = [0, 0];
    const olhos = { x: { x: 0, v: 0 }, y: { x: 0, v: 0 } };
    let olhoAlvo = [0, 0];
    const alvo = { x: REP.x, y: REP.y, rot: 0 };
    const cauLag = { x: 0, v: 0 };
    const ancora = { x: 0, y: 0, k: 1 };
    let pendurado = false;
    const maoMundo = (A, i, x, y, w) => { mp[i][0] = x; mp[i][1] = y; A['mw' + i] = w; };
    const peMundo = (A, i, x, y, w) => { pp[i][0] = x; pp[i][1] = y; A['pw' + i] = w; };

    /* ---------- piscar ---------- */
    const pisca = { prox: rnd(1.5, 4), t: -1, duplo: false };
    const curvaPisca = t => (t < 0 ? 0 : t < 0.06 ? t / 0.06 : t < 0.09 ? 1 : t < 0.18 ? 1 - (t - 0.09) / 0.09 : 0);
    function piscar(dt) {
      if (pisca.t < 0) { pisca.prox -= dt; if (pisca.prox <= 0) { pisca.t = 0; pisca.duplo = Math.random() < 0.25; } return 0; }
      pisca.t += dt;
      let v = curvaPisca(pisca.t);
      if (pisca.duplo) v = Math.max(v, curvaPisca(pisca.t - 0.24));
      if (pisca.t > (pisca.duplo ? 0.45 : 0.2)) { pisca.t = -1; pisca.prox = rnd(2, 6); }
      return v;
    }

    /* ---------- olhar ---------- */
    const sac = { t: 1, x: 0, y: 0, alvo: null };
    function olharPara(A, a, lim) {
      if (!a) { olhoAlvo = [sac.x, sac.y]; return; }
      const dx = a.x - cabPos[0], dy = a.y - cabPos[1];
      A.cabYaw = clamp(dx / 420, -1, 1) * lim; A.cabNod += clamp(dy / 500, -0.5, 0.6) * 0.6;
      olhoAlvo = [clamp(dx / 150, -1, 1), clamp(dy / 150, -1, 1)];
    }
    function saccades(dt) {
      sac.t -= dt;
      if (sac.t <= 0) {
        sac.t = rnd(0.8, 3);
        if (Math.random() < 0.55) { sac.x = rnd(-1, 1); sac.y = rnd(-0.8, 0.8); sac.alvo = null; }
        else sac.alvo = Math.random() < 0.6 ? borbs[Math.floor(Math.random() * borbs.length)] : { x: rnd(300, 1300), y: rnd(150, 700) };
      }
    }
    const vivo = a => (a && a.x !== undefined ? { x: a.x, y: a.y } : null);

    /* ---------- banana (na mão, a descascar, a comer, casca a voar) ---------- */
    const ban = { vis: false, mao: 1, tiras: [0, 0, 0], fruta: 1, comer: 0, dir: 0, pilha: -1, cacho: -1, volta: 0 };
    const casca = { ativa: false, x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, t: 0, chao: CHAO_Y };
    const pilhaVolta = [0, 0, 0], cachoVolta = cn.cacho.map(() => 0);
    function pegarBanana(mao, origem, k) {
      ban.vis = true; ban.mao = mao; ban.tiras = [0, 0, 0]; ban.fruta = 1; ban.comer = 0;
      if (origem === 'pilha') { ban.pilha = k; opa(cn.pilha[k], 0); pilhaVolta[k] = -1; }
      else { ban.cacho = k; opa(cn.cacho[k], 0); cachoVolta[k] = -1; }
    }
    function largarBanana(atirar) {   // fim do comportamento ou interrupção: a casca voa (ou a banana desaparece) e a fruta volta ao sítio mais tarde
      if (!ban.vis) return;
      if (atirar) {
        const f = fistPos(ban.mao);
        Object.assign(casca, { ativa: true, x: f[0], y: f[1], vx: atirar[0], vy: atirar[1], r: 0, vr: atirar[0] > 0 ? 540 : -540, t: 0, chao: f[1] < 600 && f[0] > 880 ? CHAO_Y + 6 : CHAO_Y + 10 });
      }
      ban.vis = false;
      if (ban.pilha >= 0) { pilhaVolta[ban.pilha] = 5; ban.pilha = -1; }
      if (ban.cacho >= 0) { cachoVolta[ban.cacho] = 6; ban.cacho = -1; }
    }
    function atualizarBanana(dt) {
      pilhaVolta.forEach((t, k) => { if (t > 0) { pilhaVolta[k] = t - dt; if (pilhaVolta[k] <= 0) pilhaVolta[k] = 0; } opa(cn.pilha[k], pilhaVolta[k] === 0 ? 1 : pilhaVolta[k] < 0 ? 0 : clamp(1 - pilhaVolta[k], 0, 1)); });
      cachoVolta.forEach((t, k) => { if (t > 0) { cachoVolta[k] = t - dt; if (cachoVolta[k] <= 0) cachoVolta[k] = 0; } opa(cn.cacho[k], cachoVolta[k] === 0 ? 1 : cachoVolta[k] < 0 ? 0 : clamp(1 - cachoVolta[k], 0, 1)); });
      if (casca.ativa) {
        casca.t += dt;
        if (casca.y < casca.chao) { casca.vy += 1100 * dt; casca.x += casca.vx * dt; casca.y += casca.vy * dt; casca.r += casca.vr * dt; if (casca.y >= casca.chao) { casca.y = casca.chao; casca.r = 0; casca.pousou = casca.t; } }
        tr(cn.casca, `translate(${n1(casca.x)},${n1(casca.y)}) rotate(${n1(casca.r)})`);
        opa(cn.casca, casca.pousou ? 1 - passo(casca.pousou + 2.5, casca.pousou + 3.5, casca.t) : 1);
        if (casca.pousou && casca.t > casca.pousou + 3.5) { casca.ativa = false; casca.pousou = 0; tr(cn.casca, 'translate(-300,-300)'); }
      }
    }
    const fistPos = i => { const a = (maoAng[i] + (i ? 1 : -1) * V['m' + i + 'r'] * GRAU) / GRAU; return [maoPos[i][0] - 13 * ESC * Math.sin(a), maoPos[i][1] + 13 * ESC * Math.cos(a)]; };
    function desenharBanana(rotU) {
      if (!ban.vis) { opa(el.banana, 0); return; }
      opa(el.banana, 1);
      const f = fistPos(ban.mao);
      let ang = rotU + (ban.mao ? 0.18 : -0.18);
      if (ban.comer > 0.001) { const da = Math.atan2(bocaPos[0] - f[0], -(bocaPos[1] - f[1])); ang = lerp(ang, ang + ((da - ang + 3 * PI) % TAU - PI), ban.comer); }
      tr(el.banana, `translate(${n1(f[0])},${n1(f[1])}) rotate(${n1(ang * GRAU)}) scale(${ESC})`);
      tr(banEl.t[0], `rotate(${n1(-165 * ban.tiras[0])} -7 -14)`);
      tr(banEl.t[1], `rotate(${n1(165 * ban.tiras[1])} 7 -14)`);
      tr(banEl.t[2], `translate(0,-14) scale(1,${n3(1 - 1.75 * ban.tiras[2])}) translate(0,14)`);
      tr(banEl.fruta, `translate(0,-13) scale(1,${n3(Math.max(0.02, ban.fruta))}) translate(0,13)`);
      opa(banEl.fruta, ban.fruta > 0.03 ? 1 : 0);
    }
    // rotina comum de comer uma banana: h = mão que segura, o = mão que descasca; tempos em segundos
    function rotinaBanana(A, t, cfg) {
      const h = cfg.mao, o = 1 - h, sh = h ? 1 : -1, so = -sh;
      // 1) estender o braço e apanhar
      const wA = janela(t, 0.05, cfg.tPega, cfg.tPega + 0.15, cfg.tPega + 0.7);
      maoMundo(A, h, cfg.pega[0], cfg.pega[1], wA);
      A['fecha' + h] = t > cfg.tPega - 0.1 ? 1 : 0;
      if (t >= cfg.tPega && !cfg.feito.pegou) { cfg.feito.pegou = true; pegarBanana(h, cfg.origem, cfg.k); }
      A.incl += cfg.inclina * wA;
      if (t < cfg.tPega + 0.3) olharPara(A, { x: cfg.pega[0], y: cfg.pega[1] }, 0.6);
      // 2) segurar à frente do peito
      const wS = passo(cfg.tPega + 0.1, cfg.tPega + 0.7, t) * (1 - passo(cfg.tAtira, cfg.tAtira + 0.35, t));
      A['m' + h + 'x'] = lerp(A['m' + h + 'x'], sh * 30, wS); A['m' + h + 'y'] = lerp(A['m' + h + 'y'], -64, wS); A['m' + h + 'r'] = lerp(A['m' + h + 'r'], -0.6, wS);
      // 3) descascar: a outra mão vai à ponta e puxa cada tira para baixo
      const f = ban.vis ? fistPos(h) : [0, 0];
      const ponta = [f[0] + sh * 6, f[1] - 58];
      let wO = 0;
      cfg.tiras.forEach((t0, k) => {
        const tt = (t - t0) / cfg.dTira;
        if (tt > -0.6 && tt < 1.4) {
          const w = janela(tt, -0.6, -0.1, 1.0, 1.4); wO = Math.max(wO, w);
          const desce = sinoide((tt - 0.2) / 0.8), lado = k === 0 ? -1 : k === 1 ? 1 : 0;
          const p = [lerp(ponta[0], f[0] + lado * 22 + so * 4, desce), lerp(ponta[1] + 6, f[1] + 6, desce)];
          maoMundo(A, o, p[0], p[1], w);
          if (tt > 0.2) ban.tiras[k] = Math.max(ban.tiras[k], clamp(desce, 0, 1));
          A['fecha' + o] = tt > 0.05 && tt < 1 ? 1 : 0;
        }
      });
      if (t > cfg.tiras[0] - 0.4 && t < cfg.tComer) { olhoAlvo = [0.3 * sh, 0.9]; A.cabNod += 0.25; A.sorriso = 0.8; A.sobr = 0.3; }
      // 4) comer: a banana aponta para a boca; abre a boca antes de cada dentada e mastiga
      const wC = janela(t, cfg.tComer, cfg.tComer + 0.4, cfg.tAtira - 0.4, cfg.tAtira);
      ban.comer = wC;
      if (wC > 0.001) {
        const len = (16 + 31 * ban.fruta) * ESC, dirx = sh * 0.45, diry = 0.9;
        let perto = 0;
        cfg.dentadas.forEach(tb => { perto = Math.max(perto, janela(t, tb - 0.35, tb - 0.05, tb + 0.05, tb + 0.3)); });
        const d = len + (1 - perto) * 26;
        maoMundo(A, h, bocaPos[0] + dirx * d - sh * 6, bocaPos[1] + diry * d, wC);
        let ab = 0, mast = 0;
        cfg.dentadas.forEach((tb, k) => {
          ab = Math.max(ab, janela(t, tb - 0.3, tb - 0.12, tb - 0.04, tb));
          mast = Math.max(mast, janela(t, tb + 0.05, tb + 0.15, tb + 0.6, tb + 0.75));
          if (t >= tb && !cfg.feito['d' + k]) { cfg.feito['d' + k] = true; ban.fruta = Math.max(0, 1 - (k + 1) / cfg.dentadas.length); }
        });
        A.boca = Math.max(A.boca, 0.75 * ab + 0.22 * mast * (0.5 + 0.5 * Math.sin(t * TAU * 5)));
        A.feliz = Math.max(A.feliz, 0.7 * mast); A.fecho = Math.max(A.fecho, 0.35 * mast); A.sorriso = lerp(A.sorriso, 1, wC); A.cabNod -= 0.08 * wC;
        olhoAlvo = [0.2 * sh, 0.6];
      }
      // 5) atirar a casca por cima do ombro
      const wT = janela(t, cfg.tAtira, cfg.tAtira + 0.3, cfg.tAtira + 0.55, cfg.tAtira + 0.9);
      A['m' + h + 'x'] = lerp(A['m' + h + 'x'], sh * 78, wT); A['m' + h + 'y'] = lerp(A['m' + h + 'y'], -160, wT); 
      A['mw' + h] *= 1 - wT;
      if (t >= cfg.tAtira + 0.4 && !cfg.feito.atirou) { cfg.feito.atirou = true; ban.comer = 0; largarBanana(cfg.atira); }
      if (cfg.feito.atirou) A['fecha' + h] = 0;
      // 6) esfregar a barriga, contente
      const wB = janela(t, cfg.tAtira + 0.8, cfg.tAtira + 1.1, cfg.fim - 0.5, cfg.fim);
      if (wB > 0.001) { A['m' + o + 'x'] = lerp(A['m' + o + 'x'], 12 * Math.cos(t * TAU * 1.2) - so * 4, wB); A['m' + o + 'y'] = lerp(A['m' + o + 'y'], -34 + 8 * Math.sin(t * TAU * 1.2), wB); A['mw' + o] *= 1 - wB; A.feliz = Math.max(A.feliz, 0.8 * wB); A.sorriso = 1; A['m' + o + 'r'] = lerp(A['m' + o + 'r'], 1.2, wB); }
    }
    function cfgBananaChao() {
      const k = [0, 1, 2].find(i => pilhaVolta[i] === 0);
      return { mao: 1, origem: 'pilha', k: k === undefined ? 0 : k, pega: [PILHA.x - 4, PILHA.y - 18], tPega: 0.85, inclina: 0.22, tiras: [1.8, 2.5, 3.2], dTira: 0.55, tComer: 4.0, dentadas: [4.6, 5.4, 6.2], tAtira: 6.9, atira: [300, -520], fim: 8.8, feito: {} };
    }
    function cfgBananaCacho() {
      const livres = cachoVolta.map((t, k) => (t === 0 ? k : -1)).filter(k => k >= 0);
      const k = livres.length ? livres[livres.length - 1] : 0, b = meta.cacho[k];
      return { mao: 0, origem: 'cacho', k, pega: [b.x + 2, b.y - 8], tPega: 0.7, inclina: -0.12, tiras: [1.3, 1.8, 2.3], dTira: 0.4, tComer: 2.9, dentadas: [3.4, 4.1], tAtira: 4.6, atira: [-260, -300], fim: 6.0, feito: {} };
    }

    /* ---------- comportamentos ociosos no chão ---------- */
    const ACOES = {
      cocar: { dur: 3.4, aplicar(A, t) {        // coça o alto da cabeça, intrigado
        const w = janela(t, 0, 0.5, 2.7, 3.3), f = Math.sin(t * TAU * 4.5) * janela(t, 0.6, 0.8, 2.4, 2.7);
        A.m1x = lerp(A.m1x, 54 + 5 * f, w); A.m1y = lerp(A.m1y, -186 + 3 * Math.abs(f), w); A.m1r = lerp(A.m1r, 0.4 + 0.25 * f, w); A.fecha1 = 0; A.mw1 *= 1 - w;
        A.cabRoll = lerp(A.cabRoll, 0.16, w); A.cabX += 4 * w; A.cabYaw -= 0.22 * w; A.sobr = 0.9 * w; A.franze = 0.7 * w;
        A.boca = Math.max(A.boca, 0.16 * janela(t, 1, 1.3, 2.3, 2.6)); A.sorriso = lerp(A.sorriso, -0.1, w); A.incl -= 0.05 * w;
        olhoAlvo = [-0.5 * w, -0.9 * w];
      } },
      banana: { dur: 8.8, iniciar() { this.cfg = cfgBananaChao(); }, aplicar(A, t) { rotinaBanana(A, t, this.cfg); }, parar() { largarBanana(null); } },
      peito: { dur: 3.6, aplicar(A, t) {         // bate no peito e depois bate palmas
        const w1 = janela(t, 0, 0.3, 1.9, 2.2), bat = t * TAU * 2.6;
        for (let i = 0; i < 2; i++) {
          const s = i ? 1 : -1, h = Math.max(0, Math.sin(bat + i * PI));
          A['m' + i + 'x'] = lerp(A['m' + i + 'x'], s * (18 + 18 * h), w1); A['m' + i + 'y'] = lerp(A['m' + i + 'y'], -70 + 4 * h, w1); A['fecha' + i] = w1 > 0.3 ? 1 : 0; A['m' + i + 'r'] = lerp(A['m' + i + 'r'], -0.9, w1);
        }
        A.boca = Math.max(A.boca, w1 * (0.35 + 0.35 * Math.abs(Math.sin(bat)))); A.sorriso = lerp(A.sorriso, 0.1, w1); A.cabNod -= 0.25 * w1; A.sobr = 0.6 * w1; A.sq += 0.03 * w1 * Math.abs(Math.sin(bat));
        const w2 = janela(t, 2.0, 2.25, 3.2, 3.55);
        let sep = 1;
        for (const tc of [2.4, 2.75, 3.1]) sep = Math.min(sep, 1 - janela(t, tc - 0.14, tc - 0.02, tc + 0.02, tc + 0.14));
        for (let i = 0; i < 2; i++) { const s = i ? 1 : -1; A['m' + i + 'x'] = lerp(A['m' + i + 'x'], s * (10 + 26 * sep), w2); A['m' + i + 'y'] = lerp(A['m' + i + 'y'], -104, w2); A['m' + i + 'r'] = lerp(A['m' + i + 'r'], 0.9, w2); if (w2 > 0.3) A['fecha' + i] = 0; }
        A.feliz = Math.max(A.feliz, 0.85 * w2); A.sorriso = lerp(A.sorriso, 1, w2); A.boca = Math.max(A.boca, 0.4 * w2);
      } },
      borboleta: { dur: 7.6, olhar: false, iniciar() { this.fugiu = false; azul.guia = { x: azul.x, y: azul.y }; azul.pousada = false; }, parar() { soltarAzul(); },
        aplicar(A, t, dt) {                      // a borboleta azul pousa-lhe no nariz, fica vesgo, espirra e tenta apanhá-la
          const g = azul.guia;
          if (!g) return;
          if (t < 2.4) { const k = sinoide(t / 2.4), alvoB = [cabPos[0] + 40 * Math.sin(t * 3), cabPos[1] - 110 + 20 * Math.cos(t * 2.3)]; g.x = lerp(g.x, alvoB[0], 1 - Math.exp(-dt * (1 + 3 * k))); g.y = lerp(g.y, alvoB[1], 1 - Math.exp(-dt * (1 + 3 * k))); azul.pousada = false; }
          else if (t < 4.5) { const k = sinoide((t - 2.4) / 0.6); g.x = lerp(g.x, narizPos[0], k); g.y = lerp(g.y, narizPos[1] - 12, k); azul.pousada = k > 0.95; }
          else { if (!this.fugiu) { this.fugiu = true; soltarAzul(); azul.fuga = 1.6; } }
          if (t < 4.5) olharPara(A, { x: g.x, y: g.y }, 0.6);
          A.sobr = Math.max(A.sobr, 0.6 * janela(t, 0.3, 0.8, 4.2, 4.5)); A.dilata = 0.6 * janela(t, 0.3, 0.8, 4.3, 4.6); A.boca = Math.max(A.boca, 0.14 * janela(t, 0.5, 1, 2.4, 2.8));
          const wv = janela(t, 2.8, 3.1, 4.25, 4.45);
          A.vesgo = wv; A.cabY += 4 * wv; A.sorriso = lerp(A.sorriso, -0.2, wv); A.boca = Math.max(A.boca, 0.22 * wv); olhoAlvo = lerp2(olhoAlvo, [0, 0.4], wv);
          // espirro: cabeça para trás e depois para a frente
          const ant = janela(t, 4.0, 4.35, 4.42, 4.5), esp = janela(t, 4.45, 4.52, 4.7, 5.0);
          A.cabNod += -0.3 * ant + 0.45 * esp; A.cabY += -6 * ant + 6 * esp; A.fecho = Math.max(A.fecho, ant * 0.7 + esp); A.boca = Math.max(A.boca, 0.5 * ant + 0.9 * janela(t, 4.45, 4.5, 4.58, 4.7)); A.sq += 0.06 * ant - 0.06 * esp;
          // tenta apanhá-la com uma palmada no ar (falha) e olha para as mãos vazias
          const wc = janela(t, 5.0, 5.3, 5.5, 5.8), sep = 1 - janela(t, 5.3, 5.42, 5.5, 5.7);
          for (let i = 0; i < 2; i++) { const s = i ? 1 : -1; A['m' + i + 'x'] = lerp(A['m' + i + 'x'], s * (12 + 34 * sep) + 20, wc); A['m' + i + 'y'] = lerp(A['m' + i + 'y'], -178, wc); A['m' + i + 'r'] = lerp(A['m' + i + 'r'], 0.8, wc); }
          if (wc > 0.001) { olharPara(A, { x: azul.x, y: azul.y }, 0.5); A.sobr = 1; }
          const wm = janela(t, 5.8, 6.1, 7.0, 7.5);
          for (let i = 0; i < 2; i++) { const s = i ? 1 : -1; A['m' + i + 'x'] = lerp(A['m' + i + 'x'], s * 26, wm); A['m' + i + 'y'] = lerp(A['m' + i + 'y'], -86, wm); A['m' + i + 'r'] = lerp(A['m' + i + 'r'], -1.6, wm); }
          if (wm > 0.001) { olhoAlvo = lerp2(olhoAlvo, [0, 1], wm); A.cabNod += 0.3 * wm; A.sobr = Math.max(A.sobr, 0.9 * wm); A.franze = 0.5 * wm; A.boca = Math.max(A.boca, 0.18 * wm); A.sorriso = lerp(A.sorriso, 0, wm); A.cabRoll += 0.12 * wm; }
        } },
      catar: { dur: 5.6, aplicar(A, t) {         // cata-se: levanta o braço e procura no pelo, leva os dedos à boca
        const w = janela(t, 0, 0.6, 4.9, 5.6);
        A.m0x = lerp(A.m0x, -88, w); A.m0y = lerp(A.m0y, -164, w); A.m0r = lerp(A.m0r, 0.3, w);
        A.cabYaw = lerp(A.cabYaw, -0.5, w); A.cabNod += 0.3 * w; A.cabRoll -= 0.08 * w; olhoAlvo = lerp2(olhoAlvo, [-1, 0.6], w); A.incl -= 0.06 * w;
        const wp = janela(t, 0.5, 0.9, 3.2, 3.5), f = Math.sin(t * TAU * 1.6);
        A.m1x = lerp(A.m1x, -44 + 8 * f, wp); A.m1y = lerp(A.m1y, -104 + 6 * Math.cos(t * TAU * 1.6), wp); A.m1r = lerp(A.m1r, 1.1, wp);
        A.fecha1 = wp > 0.5 && Math.sin(t * TAU * 3.2) > 0.2 ? 1 : 0;
        const wb = janela(t, 3.4, 3.75, 4.5, 4.9);
        if (wb > 0.001) { maoMundo(A, 1, bocaPos[0] + 22, bocaPos[1] + 28, wb); A.fecha1 = 1; A.boca = Math.max(A.boca, 0.25 * Math.max(0, Math.sin((t - 3.8) * TAU * 4)) * wb); A.feliz = 0.5 * wb; A.cabYaw = lerp(A.cabYaw, 0, wb); A.cabNod -= 0.2 * wb; }
        A.sobr = 0.3 * w;
      } },
      espreguicar: { dur: 3.8, aplicar(A, t) {   // espreguiça-se com os braços no ar e boceja
        const w = janela(t, 0, 0.6, 2.4, 3.1);
        A.m0x = lerp(A.m0x, -60, w); A.m0y = lerp(A.m0y, -196, w); A.m1x = lerp(A.m1x, 60, w); A.m1y = lerp(A.m1y, -196, w); A.m0r = lerp(A.m0r, 0, w); A.m1r = lerp(A.m1r, 0, w); A.mw0 *= 1 - w; A.mw1 *= 1 - w;
        A.sq += 0.07 * w; A.cabNod -= 0.32 * w; A.cabRoll += 0.08 * Math.sin(t * 2) * w;
        A.boca = Math.max(A.boca, 1.0 * janela(t, 0.5, 1.1, 1.8, 2.3)); A.fecho = Math.max(A.fecho, 0.95 * janela(t, 0.6, 0.9, 1.9, 2.3)); A.sorriso = lerp(A.sorriso, 0.1, w);
        const ab = janela(t, 2.9, 3.0, 3.3, 3.5); A.cabRoll += 0.25 * Math.sin((t - 2.9) * TAU * 6) * ab; A.cauAmp = lerp(A.cauAmp, 0.4, ab);
      } }
    };
    const fora = { acao: null, nome: '', t: 0, prox: 2.5, ultima: '' };
    function escolherAcao(n) {
      if (!n) { const nomes = Object.keys(ACOES).filter(k => k !== fora.ultima); n = nomes[Math.floor(Math.random() * nomes.length)]; }
      fora.acao = ACOES[n]; fora.nome = n; fora.ultima = n; fora.t = 0;
      if (fora.acao.iniciar) fora.acao.iniciar();
    }
    function pararAcao() {
      if (fora.acao && fora.acao.parar) fora.acao.parar();
      fora.acao = null;
      if (dentro.acao && dentro.acao.parar) dentro.acao.parar();
      dentro.acao = null;
    }
    function comportamentoFora(dt, A) {
      const evA = interesse();
      if (evA && fora.acao && (fora.nome === 'catar' || fora.nome === 'cocar' || fora.nome === 'espreguicar')) { pararAcao(); fora.prox = 3; }
      alvo.x = REP.x; alvo.y = REP.y; alvo.rot = 0;
      A.cauAmp += 0.04 * Math.sin(tempo * 0.4);
      if (fora.acao) { fora.t += dt; fora.acao.aplicar(A, fora.t, dt); if (fora.t >= fora.acao.dur) { pararAcao(); fora.prox = rnd(1.2, 3.2); } }
      else if (!evA && !reacao.ativa) { fora.prox -= dt; if (fora.prox <= 0) escolherAcao(); }
      // de vez em quando bate com os dedos dos pés
      A.pr1 += 0.12 * Math.max(0, Math.sin(tempo * 7)) * janela((tempo % 11), 6, 6.3, 8, 8.3);
      if (!(fora.acao && fora.acao.olhar === false) && !(fora.acao && fora.nome === 'banana')) {
        const y0 = A.cabYaw;
        olharPara(A, vivo(evA) || vivo(sac.alvo), 0.6);
        if (fora.acao) A.cabYaw += y0;
        if (evA && !fora.acao) { A.sobr = Math.max(A.sobr, 0.6); A.dilata = Math.max(A.dilata, 0.4); A.boca = Math.max(A.boca, 0.12); A.sorriso = 0.2; }
      }
    }

    /* ---------- no ramo (dentro do habitat) ---------- */
    const ACOES_DENTRO = {
      pernas: { dur: 3.6, aplicar(A, t) {       // balança as pernas e olha em volta, contente
        const w = janela(t, 0, 0.4, 3.0, 3.6);
        A.p0y -= 16 * Math.max(0, Math.sin(t * TAU * 1.1)) * w; A.p1y -= 16 * Math.max(0, Math.sin(t * TAU * 1.1 + PI)) * w;
        A.p0x += 6 * Math.sin(t * TAU * 1.1) * w; A.p1x += 6 * Math.sin(t * TAU * 1.1 + PI) * w;
        A.cabRoll += 0.08 * Math.sin(t * TAU * 0.55) * w; A.sorriso = lerp(A.sorriso, 1, w); A.feliz = 0.3 * w; A.cauAmp = lerp(A.cauAmp, 0.3, w);
      } },
      banana: { dur: 6.0, iniciar() { this.cfg = cfgBananaCacho(); }, aplicar(A, t) { rotinaBanana(A, t, this.cfg); }, parar() { largarBanana(null); } },
      pendurar: { dur: 6.4, olhar: false, aplicar(A, t) {   // pendura-se pela cauda, de cabeça para baixo, e baloiça
        const w = janela(t, 0.5, 1.5, 4.9, 5.9), ang = 0.16 * Math.sin((t - 1.4) * TAU * 0.45) * passo(1.3, 1.8, t);
        const wPrep = janela(t, 0, 0.5, 0.8, 1.2);
        maoMundo(A, 0, ASS.x - 66, RAMO_Y(ASS.x - 66) - 14, wPrep); maoMundo(A, 1, ASS.x + 58, RAMO_Y(ASS.x + 58) - 14, wPrep);
        A.incl += 0.15 * wPrep; A.sq -= 0.05 * wPrep;
        alvo.rot = -PI * w + ang * w;
        A.cauEnrola = w; A.ancora = passo(0.6, 1.4, t) * (1 - passo(4.9, 5.7, t));
        misturar(A, PENDURADO, w);
        A.incl = lerp(A.incl, 0.5, w); A.cabY += 14 * w;
        // braços pendurados (para baixo no mundo = para cima no tronco) e acena
        const ac = Math.sin(t * TAU * 2.2) * janela(t, 2.2, 2.5, 3.8, 4.2);
        A.m0x = lerp(A.m0x, -52, w); A.m0y = lerp(A.m0y, -186, w); A.m1x = lerp(A.m1x, 58 + 18 * ac, w); A.m1y = lerp(A.m1y, -176 + 10 * ac, w); A.m0r = lerp(A.m0r, 0, w); A.m1r = lerp(A.m1r, 0.3 * ac, w);
        peMundo(A, 0, ancora.x - 30, RAMO_Y(ancora.x - 30) + 6, w * 0.9); peMundo(A, 1, ancora.x + 28, RAMO_Y(ancora.x + 28) + 4, w * 0.9);
        A.feliz = 0.6 * w; A.sorriso = lerp(A.sorriso, 1, w); A.boca = Math.max(A.boca, 0.3 * w); A.cauAmp = 0;
        olhoAlvo = [0, -0.6 * w];
        pendurado = w > 0.5;
      }, parar() { pendurado = false; } },
      cocar: ACOES.cocar,
      espreguicar: ACOES.espreguicar
    };
    const dentro = { acao: null, nome: '', t: 0, prox: 0.8, ultima: '', primeira: true };
    function comportamentoDentro(dt, A) {
      misturar(A, NO_RAMO, 1);
      maoMundo(A, 0, ASS.x - 96, RAMO_Y(ASS.x - 96) - 8, 1); maoMundo(A, 1, ASS.x + 92, RAMO_Y(ASS.x + 92) - 8, 1);
      alvo.x = ASS.x; alvo.y = ASS.y; alvo.rot = 0;
      ancora.x = ASS.x + 4; ancora.y = RAMO_Y(ASS.x + 4) + RAMO_E(ASS.x + 4) + 6; ancora.k = 0;
      pendurado = false;
      if (dentro.acao) { dentro.t += dt; dentro.acao.aplicar(A, dentro.t, dt); if (dentro.t >= dentro.acao.dur) { const a = dentro.acao; dentro.acao = null; if (a.parar) a.parar(); dentro.prox = rnd(1.2, 2.5); } }
      else if (!reacao.ativa && !som.ativo) {
        dentro.prox -= dt;
        if (dentro.prox <= 0) {
          let n = dentro.primeira ? 'banana' : null; dentro.primeira = false;
          if (!n) { const ns = Object.keys(ACOES_DENTRO).filter(k => k !== dentro.ultima); n = ns[Math.floor(Math.random() * ns.length)]; }
          dentro.acao = ACOES_DENTRO[n]; dentro.nome = n; dentro.ultima = n; dentro.t = 0; if (dentro.acao.iniciar) dentro.acao.iniciar();
        }
      }
      if (!(dentro.acao && (dentro.acao.olhar === false || dentro.nome === 'banana'))) { const y0 = A.cabYaw; olharPara(A, vivo(interesse()) || vivo(sac.alvo), 0.5); if (dentro.acao) A.cabYaw += y0; }
      A.cauAmp += 0.05 * Math.sin(tempo * 0.5);
    }

    /* ---------- reagir (toque) e o som ---------- */
    const reacao = { ativa: false, t: 0 };
    function camadaReacao(dt, A) {
      saltoAlvo = 0;
      if (!reacao.ativa) return;
      reacao.t += dt; const t = reacao.t, w = janela(t, 0, 0.06, 0.95, 1.35);
      A.feliz = lerp(A.feliz, 0.95, w); A.boca = Math.max(A.boca, 0.55 * w); A.sorriso = lerp(A.sorriso, 1.1, w); A.sobr = lerp(A.sobr, 0.9, w); A.esc = lerp(A.esc, 1.08, w);
      A.cauAmp = lerp(A.cauAmp, 0.45, w); A.cauVel = lerp(A.cauVel, 1.8, w); A.vesgo = 0;
      if (pendurado) { A.m1x = lerp(A.m1x, 70 + 20 * Math.sin(t * TAU * 3), w); A.m1y = lerp(A.m1y, -150, w); return; }
      for (let i = 0; i < 2; i++) { const s = i ? 1 : -1; A['m' + i + 'x'] = lerp(A['m' + i + 'x'], s * (98 + 8 * Math.sin(t * TAU * 3 + i)), w); A['m' + i + 'y'] = lerp(A['m' + i + 'y'], -168, w); A['mw' + i] *= 1 - w; A['m' + i + 'r'] = lerp(A['m' + i + 'r'], 0, w); A['fecha' + i] = 0; }
      if (modo === 'fora') {
        const h = (t > 0.1 && t < 0.5 ? Math.sin(PI * (t - 0.1) / 0.4) : 0) * 44 + (t > 0.62 && t < 0.9 ? Math.sin(PI * (t - 0.62) / 0.28) : 0) * 18;
        saltoAlvo = reduzido ? 0 : h;
        A.sq += -0.1 * janela(t, 0, 0.05, 0.08, 0.12) + 0.08 * (h > 2 ? 1 : 0) - 0.08 * janela(t, 0.48, 0.52, 0.56, 0.66);
        A.p0y -= h * 0.25; A.p1y -= h * 0.25;
      } else {
        const h = (t > 0.08 && t < 0.4 ? Math.sin(PI * (t - 0.08) / 0.32) : 0) * 22;
        saltoAlvo = reduzido ? 0 : h;
        if (t > 0.4 && !reacao.aterrou) { reacao.aterrou = true; ramoB.v += 40; abanarHabitat(0.6); }
      }
    }
    let som = { ativo: false, t: 0, lat: [], fim: 0 };
    function camadaSom(dt, A) {
      if (!som.ativo) return;
      som.t += dt;
      let env = 0, pre = 0, idx = 0, bate = 0;
      som.lat.forEach((l, k) => {
        const tb = som.t - l.a;
        if (tb > -0.14 && tb < 0) pre = Math.max(pre, passo(-0.14, -0.03, tb));
        if (tb >= 0 && tb < l.d + 0.1) {
          const e = tb < 0.04 ? tb / 0.04 : tb < l.d * 0.7 ? 1 : 1 - (tb - l.d * 0.7) / (l.d * 0.3 + 0.1);
          if (clamp(e, 0, 1) > env) { env = clamp(e, 0, 1); idx = k; }
          bate = Math.max(bate, janela(tb, -0.08, 0, 0.06, 0.16));
        }
      });
      const wSom = janela(som.t, 0, 0.12, som.fim - 0.05, som.fim + 0.3);
      A.boca = Math.max(A.boca, 0.12 * wSom + env * 0.85); A.sorriso = lerp(A.sorriso, 0.1, wSom * (0.3 + 0.7 * env)); A.sobr = Math.max(A.sobr, 0.7 * wSom);
      A.cabNod += -0.2 * env + 0.08 * pre; A.cabY -= 5 * env; A.feliz = Math.min(A.feliz, 0.4);
      if (!pendurado) {
        for (let i = 0; i < 2; i++) {
          const s = i ? 1 : -1, h = (idx % 2 === i ? bate : 0);
          A['m' + i + 'x'] = lerp(A['m' + i + 'x'], s * (20 + 16 * (1 - h)), wSom); A['m' + i + 'y'] = lerp(A['m' + i + 'y'], -70, wSom); A['mw' + i] *= 1 - wSom; A['m' + i + 'r'] = lerp(A['m' + i + 'r'], -0.9, wSom); if (wSom > 0.3) A['fecha' + i] = 1;
        }
      }
      if (som.t > som.fim + 0.35) som.ativo = false;
    }

    /* ---------- liana: pêndulo livre; durante o balanço é o macaco que manda ---------- */
    const lia = { a: 0.02, v: 0, presa: false, antA: 0.02 };
    function atualizarLiana(dt) {
      if (!lia.presa) { const n = Math.max(1, Math.ceil(dt / 0.01)), h = dt / n; for (let i = 0; i < n; i++) { lia.v += (-8.2 * Math.sin(lia.a) - 0.45 * lia.v + 0.02 * Math.sin(tempo * 0.7) * AMB) * h; lia.a += lia.v * h; } }
      else { lia.v = (lia.a - lia.antA) / Math.max(dt, 1e-3); }
      lia.antA = lia.a;
      tr(cn.liana, `translate(${LP.x},${LP.y}) rotate(${n1(-lia.a * GRAU * 10) / 10})`);
    }
    // corpo pendurado na liana (ângulo a); puxa = 0 braços esticados … 1 braços dobrados (sobe o corpo)
    function pendLiana(a, puxa) {
      const g = gripW(a, LL), ux = Math.sin(a), uy = Math.cos(a), d = ESC * (lerp(104, 58, puxa) + 82);
      return { x: g[0] + ux * d, y: g[1] + uy * d, rot: -a + 0.1 * lia.v };
    }
    function agarrarLiana(A, w) { const a = lia.a; const g0 = gripW(a, LL), g1 = gripW(a, LL - 40); maoMundo(A, 0, g0[0], g0[1], w); maoMundo(A, 1, g1[0], g1[1], w); if (w > 0.6) { A.fecha0 = 1; A.fecha1 = 1; } }

    /* ---------- ida para o habitat: salta, agarra a liana, balança-se e aterra no ramo ---------- */
    let seq = null;
    const ARCOS = [[0, 0.32, 0.9, 1.25, 'sai'], [0.32, -0.36, 1.25, 1.95, 'si'], [-0.36, 0.5, 1.95, 2.66, 'si']];
    function anguloIda(T, a0) {
      for (const [x0, x1, t0, t1, tipo] of ARCOS) {
        if (T <= t1) { const k = clamp((T - t0) / (t1 - t0), 0, 1); const e = tipo === 'sai' ? Math.sin(k * PI / 2) : sinoide(k); return lerp(x0 === 0 ? a0 : x0, x1, e); }
      }
      return 0.5;
    }
    const PE_RAMO = x => [x, RAMO_Y(x) - 6];
    function correrIda(dt, A) {
      seq.T += dt; const T = seq.T;
      A.cauAmp = 0.1; A.cauVel = 0.6;
      const lagN = clamp(lia.v / 2.2, -1, 1);
      cauLag.x = lerp(cauLag.x, -0.6 * lagN, 1 - Math.exp(-dt * 6));
      if (T < 0.45) {                                         // 1) olha para a liana e agacha-se (antecipação)
        const k = passo(0, 0.4, T);
        PX = REP.x; PY = REP.y + 10 * k; ROT = -0.08 * k;
        A.incl = 0.12 * k; A.sq = -0.08 * k;
        olharPara(A, { x: gripW(lia.a, LL)[0], y: gripW(lia.a, LL)[1] }, 0.6); A.sobr = 0.6; A.dilata = 0.5;
        for (let i = 0; i < 2; i++) { const s = i ? 1 : -1; A['m' + i + 'x'] = s * 58 - 16; A['m' + i + 'y'] = 4; }
      } else if (T < 0.9) {                                   // 2) salto em arco até à liana
        const k = (T - 0.45) / 0.45, s = lerp(k, sinoide(k), 0.4);
        if (!seq.sx) { seq.sx = PX; seq.sy = PY; }
        const fim = pendLiana(lia.a, 0.2), c = [(seq.sx + fim.x) / 2 - 30, Math.min(seq.sy, fim.y) - 150];
        const p = bez2([seq.sx, seq.sy], c, [fim.x, fim.y], s);
        PX = p[0]; PY = p[1]; ROT = lerp(-0.08, fim.rot, s) + 0.18 * Math.sin(PI * s);
        A.sq = 0.1 * Math.sin(PI * k);
        agarrarLiana(A, passo(0.2, 0.9, k));
        A.p0y = lerp(18, 50, k); A.p1y = lerp(18, 50, k); A.p0x = -30; A.p1x = 30;
        A.boca = 0.3; A.sorriso = 1; A.feliz = 0.3;
        olharPara(A, { x: gripW(lia.a, LL)[0], y: gripW(lia.a, LL)[1] }, 0.5);
        seq.a0 = lia.a;
      } else if (T < 2.5) {                                   // 3) balança-se (bombeia com as pernas e sobe com os braços no fim)
        if (!lia.presa) { lia.presa = true; lia.antA = lia.a; seq.a0 = lia.a; abanarLiana(); }
        lia.a = anguloIda(T, seq.a0);
        const puxa = passo(2.05, 2.45, T) + 0.2 * (1 - passo(0.9, 1.3, T));
        const b = pendLiana(lia.a, puxa); PX = b.x; PY = b.y; ROT = b.rot;
        agarrarLiana(A, 1);
        const pump = clamp(lia.v / 2, -1, 1);
        A.p0x = -18 + 34 * pump; A.p1x = 18 + 34 * pump; A.p0y = 64 - 24 * Math.abs(pump); A.p1y = 64 - 24 * Math.abs(pump); A.pr0 = 0.9; A.pr1 = 0.9;
        A.sq = 0.05; A.cabNod -= 0.1; A.boca = 0.35 + 0.25 * Math.abs(pump); A.sorriso = 1; A.feliz = 0.4; A.sobr = 0.5;
        olharPara(A, { x: ASS.x, y: ASS.y - 60 }, 0.4);
        cauLag.x = lerp(cauLag.x, -0.9 * pump, 1 - Math.exp(-dt * 5));
        A.cauBase = 1.5; A.cauDobra = 0.6; A.cauPonta = -2.2;
      } else if (T < 2.95) {                                  // 4) larga a liana e voa até ao ramo
        if (lia.presa) { lia.presa = false; seq.rx = PX; seq.ry = PY; seq.rr = ROT; }
        const k = (T - 2.5) / 0.45, s = lerp(k, sinoide(k), 0.3);
        const fim = [1092, PE_RAMO(1092)[1] - ESC * 76 - 4], c = [seq.rx + 10, Math.min(seq.ry, fim[1]) - 70];
        const p = bez2([seq.rx, seq.ry], c, fim, s);
        PX = p[0]; PY = p[1]; ROT = lerp(seq.rr, 0, sinoide(k)) - 0.25 * Math.sin(PI * k);
        A.mw0 = 0; A.mw1 = 0;
        for (let i = 0; i < 2; i++) { const sg = i ? 1 : -1; A['m' + i + 'x'] = sg * 84; A['m' + i + 'y'] = -130; A['fecha' + i] = 0; }
        A.p0y = lerp(30, 76, passo(0.4, 1, k)); A.p1y = A.p0y; A.p0x = -24; A.p1x = 24; A.pr0 = 0.3; A.pr1 = 0.3;
        A.sq = 0.06 * Math.sin(PI * k); A.boca = 0.5; A.sorriso = 1; A.feliz = 0.5;
        olharPara(A, { x: 1092, y: RAMO_Y(1092) }, 0.4);
      } else {                                                // 5) aterra (encolhe), o ramo dobra e senta-se com as pernas para fora
        if (!seq.aterrou) { seq.aterrou = true; ramoB.v += 70; abanarHabitat(1.2); soltarFolhas(1092, 470, 8, 1, 120); }
        const k = clamp((T - 2.95) / 0.75, 0, 1);
        const de = [1092, PE_RAMO(1092)[1] - ESC * 76 - 4];
        const agacha = janela(T, 2.95, 3.05, 3.15, 3.35);
        const senta = sinoide((T - 3.2) / 0.45);
        PX = lerp(de[0], ASS.x, senta); PY = lerp(de[1] + 26 * agacha, ASS.y, senta); ROT = 0;
        A.sq = -0.14 * agacha;
        const wpe = 1 - passo(3.3, 3.6, T);
        peMundo(A, 0, PE_RAMO(1060)[0], PE_RAMO(1060)[1], wpe); peMundo(A, 1, PE_RAMO(1124)[0], PE_RAMO(1124)[1], wpe);
        misturar(A, NO_RAMO, senta);
        for (let i = 0; i < 2; i++) { const sg = i ? 1 : -1; A['m' + i + 'x'] = sg * 86; A['m' + i + 'y'] = -40; }
        maoMundo(A, 0, ASS.x - 96, RAMO_Y(ASS.x - 96) - 8, senta); maoMundo(A, 1, ASS.x + 92, RAMO_Y(ASS.x + 92) - 8, senta);
        A.feliz = 0.6 * (1 - k); A.sorriso = 1; A.boca = 0.3 * (1 - k);
        if (k >= 1) {
          modo = 'dentro'; seq = null; sincronizar(); dentro.acao = null; dentro.prox = 0.6; dentro.primeira = true;
          const r = resolverIda; resolverIda = null; if (r) r();
          if (pendenteVolta) { pendenteVolta = false; iniciarVolta(); }
        }
      }
      if (seq && T > 2.95) { PY += (TRONCO_X - PX) * ramoB.x / GRAU; }
    }

    /* ---------- volta: sacode-se, salta para a liana, balança-se para o lado e cai sentado no chão ---------- */
    function correrVolta(dt, A) {
      seq.T += dt; const T = seq.T;
      A.cauAmp = 0.1;
      const de = [1092, PE_RAMO(1092)[1] - ESC * 76 - 4];
      if (T < 0.75) {                                         // 1) levanta-se no ramo, sacode-se e agacha-se
        const k = sinoide(T / 0.4);
        PX = lerp(seq.x0, de[0], k); PY = lerp(seq.y0, de[1], k) + 14 * janela(T, 0.5, 0.7, 0.75, 0.8); ROT = lerp(seq.r0, 0, k) + 0.1 * Math.sin(T * TAU * 6) * janela(T, 0.3, 0.38, 0.5, 0.56);
        A.sq = -0.08 * janela(T, 0.5, 0.7, 0.75, 0.8);
        peMundo(A, 0, PE_RAMO(1060)[0], PE_RAMO(1060)[1], passo(0.1, 0.35, T)); peMundo(A, 1, PE_RAMO(1124)[0], PE_RAMO(1124)[1], passo(0.1, 0.35, T));
        for (let i = 0; i < 2; i++) { const sg = i ? 1 : -1; A['m' + i + 'x'] = sg * 86; A['m' + i + 'y'] = -30; }
        A.fecho = Math.max(A.fecho, 0.8 * janela(T, 0.3, 0.36, 0.5, 0.56));
        olharPara(A, { x: gripW(lia.a, LL)[0], y: gripW(lia.a, LL)[1] }, 0.6);
        // a liana vem ter com ele
        if (T > 0.2) { if (!lia.presa) { lia.presa = true; seq.la = lia.a; lia.antA = lia.a; } lia.a = lerp(seq.la, 0.16, sinoide((T - 0.2) / 0.85)); }
      } else if (T < 1.1) {                                   // 2) salta e agarra a liana
        lia.a = lerp(seq.la, 0.16, sinoide((T - 0.2) / 0.85));
        const k = (T - 0.75) / 0.35, s = lerp(k, sinoide(k), 0.4);
        if (!seq.sx) { seq.sx = PX; seq.sy = PY; }
        const fim = pendLiana(lia.a, 0.25), c = [(seq.sx + fim.x) / 2, Math.min(seq.sy, fim.y) - 60];
        const p = bez2([seq.sx, seq.sy], c, [fim.x, fim.y], s);
        PX = p[0]; PY = p[1]; ROT = lerp(0, fim.rot, s);
        agarrarLiana(A, passo(0.15, 0.85, k));
        A.p0y = 50; A.p1y = 50; A.boca = 0.3; A.sorriso = 1;
      } else if (T < 1.85) {                                  // 3) balança-se para a esquerda
        const k = (T - 1.1) / 0.75;
        lia.a = lerp(0.16, -0.36, sinoide(k));
        const b = pendLiana(lia.a, 0.25 * (1 - k)); PX = b.x; PY = b.y; ROT = b.rot;
        agarrarLiana(A, 1);
        const pump = clamp(lia.v / 2, -1, 1);
        A.p0x = -18 + 34 * pump; A.p1x = 18 + 34 * pump; A.p0y = 64 - 20 * Math.abs(pump); A.p1y = A.p0y; A.pr0 = 0.9; A.pr1 = 0.9;
        A.boca = 0.4; A.sorriso = 1; A.feliz = 0.4;
        cauLag.x = lerp(cauLag.x, -0.9 * pump, 1 - Math.exp(-dt * 5));
        A.cauBase = 1.5; A.cauDobra = 0.6; A.cauPonta = -2.2;
        olharPara(A, { x: REP.x, y: REP.y }, 0.4);
      } else if (T < 2.4) {                                   // 4) larga e cai
        if (lia.presa) { lia.presa = false; seq.rx = PX; seq.ry = PY; seq.rr = ROT; }
        const k = (T - 1.85) / 0.55, s = k * k * 0.6 + k * 0.4;
        const fim = [REP.x, CHAO_Y - 8 - ESC * 76], c = [lerp(seq.rx, fim[0], 0.5), Math.min(seq.ry, fim[1]) - 40];
        const p = bez2([seq.rx, seq.ry], c, fim, s);
        PX = p[0]; PY = p[1]; ROT = lerp(seq.rr, 0, sinoide(k));
        A.mw0 = 0; A.mw1 = 0;
        for (let i = 0; i < 2; i++) { const sg = i ? 1 : -1; A['m' + i + 'x'] = sg * 84; A['m' + i + 'y'] = -140; A['fecha' + i] = 0; }
        A.p0y = 76; A.p1y = 76; A.p0x = -26; A.p1x = 26; A.pr0 = 0.4; A.pr1 = 0.4; A.boca = 0.5; A.sorriso = 1;
      } else {                                                // 5) aterra e senta-se
        if (!seq.aterrou) { seq.aterrou = true; soltarFolhas(REP.x, CHAO_Y - 10, 6, 0.7, 120); }
        const k = clamp((T - 2.4) / 0.6, 0, 1), ag = janela(T, 2.4, 2.48, 2.56, 2.72), senta = sinoide((T - 2.5) / 0.4);
        PX = REP.x; PY = lerp(CHAO_Y - 8 - ESC * 76 + 24 * ag, REP.y, senta); ROT = 0;
        A.sq = -0.14 * ag;
        const wpe = 1 - passo(2.6, 2.9, T);
        peMundo(A, 0, REP.x - 40, CHAO_Y + 2, wpe); peMundo(A, 1, REP.x + 40, CHAO_Y + 2, wpe);
        for (let i = 0; i < 2; i++) { const sg = i ? 1 : -1; A['m' + i + 'x'] = lerp(sg * 90, SENTADO['m' + i + 'x'], senta); A['m' + i + 'y'] = lerp(-20, SENTADO['m' + i + 'y'], senta); }
        A.feliz = 0.5 * (1 - k); A.sorriso = 1;
        if (k >= 1) {
          modo = 'fora'; seq = null; sincronizar(); fora.acao = null; fora.prox = rnd(2, 4);
          const r = resolverVolta; resolverVolta = null; if (r) r();
          if (pendenteIda) { pendenteIda = false; iniciarIda(); }
        }
      }
      if (seq && T < 0.75) PY += (TRONCO_X - PX) * ramoB.x / GRAU;
    }
    function sincronizar() { SPX.x = PX; SPX.v = 0; SPY.x = PY; SPY.v = 0; SROT.x = ROT; SROT.v = 0; lia.presa = false; }
    let resolverIda = null, resolverVolta = null, pendenteIda = false, pendenteVolta = false;
    function iniciarIda() {
      pararAcao(); reacao.ativa = false; som.ativo = false; largarBanana(null); soltarAzul();
      seq = { T: 0 }; modo = 'indo'; pendurado = false;
    }
    function iniciarVolta() {
      pararAcao(); reacao.ativa = false; largarBanana(null); pendurado = false;
      seq = { T: 0, x0: BX, y0: BY, r0: ROT };
      S.ancora.x = 0; S.ancora.v = 0; S.cauEnrola.x = 0; S.cauEnrola.v = 0;
      modo = 'voltando';
    }

    /* ---------- habitat: ramo que dobra, folhas que abanam ---------- */
    const ramoB = { x: 0, v: 0 }, folhaT = { x: 0, v: 0 }, lianaT = { x: 0, v: 0 };
    function abanarHabitat(f) { folhaT.v += 60 * f; }
    function abanarLiana() { lianaT.v += 30; }

    /* ---------- folhas soltas ---------- */
    const parts = cn.pf.map(e => ({ e, vida: 1, dur: 1, x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, e2: 1, fase: 0, chao: 0 }));
    function soltarFolhas(x, y, n, forca, larg) {
      let k = 0;
      for (const p of parts) {
        if (p.vida < p.dur) continue;
        const a = rnd(PI * 1.1, PI * 1.9);
        p.x = x + rnd(-larg, larg) * 0.5; p.y = y + rnd(-8, 8); p.vx = Math.cos(a) * rnd(60, 160) * forca; p.vy = Math.sin(a) * rnd(100, 220) * forca;
        p.vida = 0; p.dur = rnd(1.8, 2.8); p.r = rnd(0, 360); p.vr = rnd(-300, 300); p.e2 = rnd(1.4, 2.2); p.fase = rnd(0, 6); p.chao = CHAO_Y + rnd(0, 60);
        if (++k >= n) break;
      }
    }
    function atualizarFolhas(dt) {
      for (const p of parts) {
        if (p.vida >= p.dur) { if (p.e._o !== 0) opa(p.e, 0); continue; }
        p.vida += dt;
        if (p.y < p.chao) { p.vx *= Math.exp(-1.6 * dt); p.vy = Math.min(p.vy + 400 * dt, 80); p.x += (p.vx + 36 * Math.sin(p.vida * 4 + p.fase)) * dt; p.y += p.vy * dt; p.r += p.vr * dt; }
        const k = p.vida / p.dur;
        tr(p.e, `translate(${n1(p.x)},${n1(p.y)}) rotate(${n1(p.r)}) scale(${n3(p.e2 * Math.cos(p.vida * 5 + p.fase))},${n3(p.e2)})`);
        opa(p.e, passo(0, 0.05, k) * (1 - passo(0.75, 1, k)));
      }
    }

    /* ---------- borboletas (a azul é a que pousa no nariz) ---------- */
    const borbs = cn.bf.map((e, i) => ({ e, c: e.firstChild, aE: e.querySelector('.bf-asaE'), aD: e.querySelector('.bf-asaD'), x: 0, y: 0, f: rnd(0, 6), fase: rnd(0, 6), dir: 1, guia: null, peso: 0, pousada: false, fuga: 0,
      cx: [880, 290, 1290][i], cy: [300, 520, 640][i], rx: [380, 130, 150][i], ry: [150, 110, 90][i], vel: [0.07, 0.1, 0.12][i] }));
    const azul = borbs[0];
    function soltarAzul() { if (azul.guia) { azul.livreDe = { x: azul.x, y: azul.y }; azul.peso = 1; } azul.guia = null; azul.pousada = false; }
    function atualizarBorboletas(dt) {
      for (const b of borbs) {
        const t = tempo * b.vel * TAU;
        let x = b.cx + b.rx * Math.sin(t + b.f) * Math.cos(t * 0.37 + b.f * 2), y = b.cy + b.ry * Math.sin(t * 0.73 + b.f * 1.3) + 10 * Math.sin(tempo * 7 + b.f);
        if (b.guia) { x = b.guia.x; y = b.guia.y; }
        else if (b.peso > 0) {
          if (b.fuga > 0) { b.fuga -= dt; b.livreDe.x += 140 * dt; b.livreDe.y -= 170 * dt; }
          b.peso = Math.max(0, b.peso - dt / 2.5); const w = sinoide(b.peso); x = lerp(x, b.livreDe.x, w); y = lerp(y, b.livreDe.y, w);
        }
        const vx = (x - b.x) / Math.max(dt, 1e-3);
        if (Math.abs(vx) > 8) b.dir = lerp(b.dir, vx > 0 ? 1 : -1, 1 - Math.exp(-dt * 6));
        b.x = x; b.y = y;
        b.fase += dt * TAU * (b.pousada ? 0.8 : 8.5);
        const ab = b.pousada ? 0.55 + 0.45 * Math.cos(b.fase) : 0.12 + 0.88 * Math.abs(Math.cos(b.fase));
        tr(b.e, `translate(${n1(x)},${n1(y)}) rotate(${n1(b.pousada ? 0 : 14 * b.dir + 6 * Math.sin(tempo * 3 + b.f))})`);
        tr(b.aE, `scale(${n3(ab)},1)`); tr(b.aD, `scale(${n3(ab)},1)`);
      }
    }

    /* ---------- acontecimento raro: o tucano vem pousar no ramo da árvore da esquerda ---------- */
    const ev = { ativo: null, prox: rnd(14, 22) };
    function interesse() { return ev.ativo && ev.ativo.alvo; }
    function atualizarEventos(dt) {
      if (!ev.ativo) {
        ev.prox -= dt;
        if (ev.prox <= 0 && modo !== 'indo' && modo !== 'voltando') ev.ativo = { t: 0, alvo: null };
        return;
      }
      const e = ev.ativo; e.t += dt; const t = e.t;
      let x, y, voa = 0, cab = 0, bico = 0, rot = 0, dir = 1;
      if (t < 3) { const k = sinoide(t / 3), p = bez2([-140, 90], [120, 40], [POUSO.x, POUSO.y], k); x = p[0]; y = p[1] - 30 * Math.sin(PI * k); voa = k < 0.94 ? 1 : 0; rot = -10 * (1 - k); }
      else if (t < 9) { x = POUSO.x; y = POUSO.y; const tt = t - 3; cab = 14 * Math.sin(tt * 1.3) * passo(0.6, 1.2, tt) + (tt > 2 && tt < 2.6 ? -20 : 0); bico = 22 * janela(tt, 3.2, 3.3, 3.5, 3.6) + 22 * janela(tt, 3.7, 3.8, 4.0, 4.1); dir = tt > 4.8 ? 1 : (tt > 1.5 && tt < 3 ? -1 : 1); y -= Math.abs(Math.sin(tt * 1.6)) * 2 * (tt < 1 ? 1 : 0); }
      else if (t < 12.5) { const k = sinoide((t - 9) / 3.5), p = bez2([POUSO.x, POUSO.y], [700, 60], [1760, 40], k); x = p[0]; y = p[1]; voa = 1; rot = -8; }
      else { tr(cn.tuc, 'translate(-300,-300)'); ev.ativo = null; ev.prox = rnd(18, 32) * (reduzido ? 1.6 : 1); return; }
      const bat = voa ? Math.sin(t * TAU * 5.5) : 0;
      tr(cn.tuc, `translate(${n1(x)},${n1(y)}) rotate(${n1(rot)}) scale(${n3(dir * 1.25)},1.25)`);
      tr(cn.tcAsa, `rotate(${n1(voa ? -50 + 60 * bat : 0)} -6 -40)`);
      tr(cn.tcCab, `rotate(${n1(cab)} 8 -50)`); tr(cn.tcBico, `rotate(${n1(bico)} 18 -51)`);
      e.alvo = { x, y: y - 50 };
    }

    /* ---------- cenário vivo ---------- */
    const brumas = cn.bruma.map(() => ({ t: rnd(0, 3), dur: rnd(2.5, 4), x: 0 }));
    const aves = cn.aves.map((e, i) => ({ x: -100 - i * 60, y: 120 + i * 30, v: rnd(30, 45), f: rnd(0, 6) }));
    function atualizarCena(dt) {
      const a = AMB;
      cn.moitas.forEach((e, i) => { const m = mMoitas[i]; tr(e, `rotate(${n1(1.4 * a * Math.sin(tempo * 0.8 + m.f) + 0.5 * a * Math.sin(tempo * 2.1 + m.f))} ${m.x} ${m.y})`); });
      cn.pp.forEach((e, i) => { const m = mPP[i]; tr(e, `rotate(${n1(1.8 * a * Math.sin(tempo * 0.6 + m.f) + 0.6 * a * Math.sin(tempo * 1.7 + m.f))} ${m.x} ${m.y})`); });
      cn.lianas.forEach((e, i) => { const m = mLianas[i]; tr(e, `rotate(${n1(1.2 * a * Math.sin(tempo * 0.5 + m.f))} ${m.x} ${m.y})`); });
      cn.raios.forEach((e, i) => { const b = +e.getAttribute('data-op'); opa(e, b * (0.7 + 0.3 * Math.sin(tempo * (0.22 + i * 0.07) + i * 1.7))); });
      cn.agua.forEach((e, i) => { const v = n1(-(tempo * aguaV[i]) % 400); if (e._d !== v) { e._d = v; e.setAttribute('stroke-dashoffset', v); } });
      cn.espuma.forEach((e, i) => tr(e, `translate(${n1(316 + i * 15)},${n1(600 + (i % 2) * 4)}) scale(${n3(1 + 0.18 * Math.sin(tempo * 3 + i * 1.3))},${n3(1 + 0.25 * Math.sin(tempo * 3.6 + i))}) translate(${n1(-(316 + i * 15))},${n1(-(600 + (i % 2) * 4))})`));
      brumas.forEach((b, i) => {
        b.t += dt; if (b.t > b.dur) { b.t = 0; b.dur = rnd(2.5, 4); b.x = rnd(-60, 60); }
        const k = b.t / b.dur;
        tr(cn.bruma[i], `translate(${n1(362 + b.x + 30 * k * Math.sign(b.x))},${n1(596 - 90 * k)}) scale(${n1(22 + 40 * k)})`); opa(cn.bruma[i], 0.55 * a * Math.sin(PI * k));
      });
      aves.forEach((b, i) => { b.x += b.v * dt; if (b.x > 1700) { b.x = -80; b.y = rnd(90, 200); } tr(cn.aves[i], `translate(${n1(b.x)},${n1(b.y + 6 * Math.sin(tempo * 0.8 + b.f))}) scale(${n3(1)},${n3(0.6 + 0.4 * Math.abs(Math.sin(tempo * 4 + b.f)))})`); });
      molaElastica(ramoB, 0, 90, 5, dt); molaElastica(folhaT, 0, 70, 4, dt); molaElastica(lianaT, 0, 40, 3, dt);
      tr(cn.ramo, `rotate(${n3(ramoB.x + 0.25 * a * Math.sin(tempo * 0.9))} ${TRONCO_X} 482)`);
      tr(cn.frente, `rotate(${n3(ramoB.x + 0.25 * a * Math.sin(tempo * 0.9))} ${TRONCO_X} 482)`);
      cn.hbM.forEach((e, i) => { const m = mHbM[i]; tr(e, `rotate(${n1(1.2 * a * Math.sin(tempo * 0.7 + m.f) + folhaT.x * 0.06 * Math.sin(m.f * 3))} ${m.x} ${m.y})`); });
      cn.hbF.forEach((e, i) => { const m = mHbF[i]; tr(e, `rotate(${n1(1.5 * a * Math.sin(tempo * 0.9 + m.f) + folhaT.x * 0.1 * Math.cos(m.f * 2))} ${m.x} ${m.y})`); });
    }

    /* ---------- geometria: IK e desenho do macaco ---------- */
    function ik(A, B, a, b, pref, mem) {
      let dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy);
      const dmax = (a + b) * 0.998, dmin = Math.abs(a - b) + 2;
      if (d < 1e-3) { dx = pref[0]; dy = pref[1]; d = 1; }
      if (d > dmax) { dx *= dmax / d; dy *= dmax / d; d = dmax; } else if (d < dmin) { dx *= dmin / d; dy *= dmin / d; d = dmin; }
      const base = Math.atan2(dy, dx), k = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
      const e1 = [A[0] + a * Math.cos(base + k), A[1] + a * Math.sin(base + k)], e2 = [A[0] + a * Math.cos(base - k), A[1] + a * Math.sin(base - k)];
      const mx = A[0] + dx / 2, my = A[1] + dy / 2;
      const d1 = (e1[0] - mx) * pref[0] + (e1[1] - my) * pref[1], d2 = (e2[0] - mx) * pref[0] + (e2[1] - my) * pref[1];
      let s = d1 >= d2 ? 1 : -1;
      if (mem.s && mem.s !== s && Math.abs(d1 - d2) < 5) s = mem.s;
      mem.s = s;
      return { E: s > 0 ? e1 : e2, B: [A[0] + dx, A[1] + dy] };
    }
    function seg(els, A, B, L0) {
      const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy), ang = Math.atan2(-dx, dy) * GRAU;
      const t = `translate(${n1(A[0])},${n1(A[1])}) rotate(${n1(ang)}) scale(${ESC},${n3(Math.max(0.05, len / L0))})`;
      for (const e of els) tr(e, t);
      return ang;
    }
    function desenhar(dt) {
      const br = Math.sin(respFase) * V.resp;
      const cL = Math.cos(ROT), sL = Math.sin(ROT);
      // cauda (relativa à bacia); pendurado, a cauda enrola-se no ramo e é ela que segura o corpo
      const rel = [[ESC * (CAU0[0] * cL - CAU0[1] * sL), ESC * (CAU0[0] * sL + CAU0[1] * cL)]];
      let ang = 0, ex = 0;
      for (let k = 0; k < NC; k++) {
        const s = (k + 1) / NC, fase = cauFase - k * 0.5;
        const normal = ROT + V.cauBase + V.cauDobra * Math.pow(s, 0.6) + V.cauPonta * Math.pow(s, 2.6) + V.cauAmp * Math.sin(fase) * (0.3 + 0.7 * s) + cauLag.x * (1 - 0.5 * s);
        ex = k < 1 ? -PI / 2 : ex + (k < 10 ? 0.8 : 0.25);
        ang = lerp(normal, ex, V.cauEnrola);
        const p = rel[k];
        rel.push([p[0] + Math.cos(ang) * LC * ESC, p[1] + Math.sin(ang) * LC * ESC]);
      }
      let bx = PX, by = PY - SY.x;
      if (V.ancora > 0.001) { const r = rel[ancora.k]; bx = lerp(bx, ancora.x - r[0], V.ancora); by = lerp(by, ancora.y - r[1], V.ancora); }
      BX = bx; BY = by;
      for (let k = 0; k < NC; k++) seg(caudaEl[k], [bx + rel[k][0], by + rel[k][1]], [bx + rel[k + 1][0], by + rel[k + 1][1]], LC);
      // tronco
      const rotU = ROT + V.incl, cU = Math.cos(rotU), sU = Math.sin(rotU), sqx = 1 - 0.4 * V.sq, sqy = 1 + V.sq;
      const Wl = (x, y) => [bx + ESC * (x * cL - y * sL), by + ESC * (x * sL + y * cL)];
      const Wu = (x, y) => { x *= sqx; y *= sqy; return [bx + ESC * (x * cU - y * sU), by + ESC * (x * sU + y * cU)]; };
      tr(el.tronco, `translate(${n1(bx)},${n1(by)}) rotate(${n1(rotU * GRAU)}) scale(${n3(ESC * sqx * (1 + 0.008 * br))},${n3(ESC * sqy * (1 + 0.018 * br))})`);
      // cabeça
      const hc = Wu(CAB[0] + V.cabX, CAB[1] + V.cabY - 1.5 * br), rc = rotU + V.cabRoll;
      tr(el.cab, `translate(${n1(hc[0])},${n1(hc[1])}) rotate(${n1(rc * GRAU)}) scale(${ESC})`);
      if (ultCab) { const vx = (hc[0] - ultCab[0]) / Math.max(dt, 1e-3); cabVel = lerp(cabVel, vx, 1 - Math.exp(-dt * 12)); }
      ultCab = hc; cabPos = hc;
      mola(olhos.x, olhoAlvo[0], 28, dt); mola(olhos.y, olhoAlvo[1], 28, dt);
      const E = estadoCabeca({ yaw: V.cabYaw, nod: V.cabNod, fecho: V.fecho, feliz: V.feliz, boca: V.boca, sorriso: V.sorriso, sobr: V.sobr, franze: V.franze, esc: V.esc, dilata: V.dilata, olhoX: olhos.x.x, olhoY: olhos.y.x, vesgo: V.vesgo });
      aplicarCabeca(E);
      const cr = Math.cos(rc), sr = Math.sin(rc), ny = 16 * Math.sin(V.cabNod) * 1.15, fx = 62 * Math.sin(V.cabYaw);
      const Wc = (x, y) => [hc[0] + ESC * (x * cr - y * sr), hc[1] + ESC * (x * sr + y * cr)];
      narizPos = Wc(fx, 14 + ny); bocaPos = Wc(fx, 30 + ny);
      // braços (mãos no referencial do tronco, ou presas a um ponto do mundo)
      for (let i = 0; i < 2; i++) {
        const side = i ? 1 : -1, b = bracos[i];
        const Sh = Wu(SHO[i][0], SHO[i][1] - 1.2 * br);
        let H = Wu(V['m' + i + 'x'], V['m' + i + 'y']);
        const w = clamp(V['mw' + i], 0, 1); if (w > 0.001) H = lerp2(H, mp[i], w);
        const r = ik(Sh, H, BR[0] * ESC, BR[1] * ESC, [side * 0.7 * cU - 0.7 * sU, side * 0.7 * sU + 0.7 * cU], ikB[i]);
        seg(b.s0, Sh, r.E, BR[0]); const a2 = seg(b.s1, r.E, r.B, BR[1]);
        maoPos[i] = r.B; maoAng[i] = a2;
        tr(b.ext, `translate(${n1(r.B[0])},${n1(r.B[1])}) rotate(${n1(a2 + side * V['m' + i + 'r'] * GRAU)}) scale(${side * ESC},${ESC})`);
        const fe = V['fecha' + i] > 0.5 ? 1 : 0; opa(b.aberta, 1 - fe); opa(b.punho, fe);
      }
      // pernas
      for (let i = 0; i < 2; i++) {
        const side = i ? 1 : -1, p = pernas[i];
        const Hp = Wl(HIP[i][0], HIP[i][1]);
        let F = Wl(V['p' + i + 'x'], V['p' + i + 'y']);
        const w = clamp(V['pw' + i], 0, 1); if (w > 0.001) F = lerp2(F, pp[i], w);
        const r = ik(Hp, F, PN[0] * ESC, PN[1] * ESC, [side * cL + 0.7 * sL, side * sL - 0.7 * cL], ikP[i]);
        seg(p.s0, Hp, r.E, PN[0]); seg(p.s1, r.E, r.B, PN[1]);
        tr(p.ext, `translate(${n1(r.B[0])},${n1(r.B[1])}) rotate(${n1((ROT + side * V['pr' + i]) * GRAU)}) scale(${side * ESC},${ESC})`);
      }
      // braços por trás da cabeça quando as duas mãos estão lá em cima (agarrado à liana, a espreguiçar)
      const atras = maoPos[0][1] < hc[1] + 40 && maoPos[1][1] < hc[1] + 40 && Math.abs(ROT) < 1.6;
      if (atras !== cabAtras) { cabAtras = atras; if (atras) macacoG.insertBefore(el.cab, bracosG[1].nextSibling); else macacoG.insertBefore(el.cab, bracosG[0]); }
      desenharBanana(rotU);
      // sombra no chão ou no ramo
      const noRamo = bx > 860 && bx < 1250 && by < 640;
      const sup = noRamo ? RAMO_Y(bx) + 4 : CHAO_Y + 4, alt = Math.max(0, sup - (by + 22));
      const k = clamp(1 - alt / 260, 0, 1);
      tr(el.sombra, `translate(${n1(bx)},${n1(sup)}) scale(${n1((noRamo ? 70 : 100) * (0.5 + 0.5 * k))},${n1((noRamo ? 9 : 16) * (0.5 + 0.5 * k))})`);
      opa(el.sombra, pendurado ? 0 : k);
    }

    /* ---------- quadro a quadro ---------- */
    function quadro(ms) {
      if (destruido) return;
      const dt = Math.min(ms, 50) / 1000;
      if (!(dt > 0)) return;
      tempo += dt;
      atualizarCena(dt); atualizarEventos(dt); atualizarFolhas(dt); atualizarBorboletas(dt); saccades(dt);
      if (!lia.presa) atualizarLiana(dt);
      const A = Object.assign({}, SENTADO);
      if (modo === 'fora') comportamentoFora(dt, A);
      else if (modo === 'indo') correrIda(dt, A);
      else if (modo === 'dentro') comportamentoDentro(dt, A);
      else if (modo === 'voltando') correrVolta(dt, A);
      if (lia.presa) atualizarLiana(dt);
      camadaReacao(dt, A); camadaSom(dt, A);
      const pisc = piscar(dt);
      for (const k of CHAVES) { mola(S[k], A[k], OMEGA[k] || 10, dt); V[k] = S[k].x; }
      V.fecho = Math.max(V.fecho, pisc);
      mola(SY, saltoAlvo, saltoAlvo > SY.x ? 34 : 24, dt);
      if (modo === 'fora' || modo === 'dentro') {
        mola(SPX, alvo.x, 6, dt); mola(SPY, alvo.y, 6, dt); mola(SROT, alvo.rot, 4.5, dt);
        PX = SPX.x; PY = SPY.x; ROT = SROT.x;
        if (modo === 'dentro') PY += (TRONCO_X - PX) * ramoB.x / GRAU;
        cauLag.x = lerp(cauLag.x, 0, 1 - Math.exp(-dt * 3));
      }
      respFase += dt * TAU * V.respVel; cauFase += dt * TAU * V.cauVel;
      atualizarBanana(dt);
      desenhar(dt);
    }
    quadro(16);
    const desligar = relogio ? relogio.aCada(quadro) : () => {};

    return {
      animal: macacoG,
      habitat,
      reagir() {
        if (destruido || modo === 'indo' || modo === 'voltando') return;
        reacao.ativa = true; reacao.t = 0; reacao.aterrou = false;
        if (modo === 'fora') { pararAcao(); fora.prox = rnd(2.5, 4.5); }
        else if (!(dentro.acao && dentro.nome === 'pendurar')) { if (dentro.acao && dentro.acao.parar) dentro.acao.parar(); dentro.acao = null; dentro.prox = rnd(1.5, 2.5); }
      },
      fazerSom(ms, silabas) {
        if (destruido) return;
        ms = Number(ms) || 1500;
        let lat;
        if (Array.isArray(silabas) && silabas.length) lat = silabas.map(([a, d]) => ({ a: +a || 0, d: Math.min(0.4, Math.max(0.08, +d || 0.2)) }));
        else { const s = ms / 1000, n = clamp(Math.round(s / 0.4), 1, 6); lat = []; for (let i = 0; i < n; i++) lat.push({ a: 0.05 + i * s / n, d: Math.min(0.28, s / n * 0.55) }); }
        som = { ativo: true, t: 0, lat, fim: lat[lat.length - 1].a + lat[lat.length - 1].d };
        if (modo === 'fora') { pararAcao(); fora.prox = Math.max(fora.prox, 2.5); }
      },
      irAoHabitat() {
        return new Promise(res => {
          if (destruido) return;
          if (modo === 'dentro') return res();
          const antes = resolverIda; resolverIda = () => { if (antes) antes(); res(); };
          if (modo === 'fora') iniciarIda(); else if (modo === 'voltando') pendenteIda = true;
        });
      },
      voltar() {
        return new Promise(res => {
          if (destruido) return;
          if (modo === 'fora') return res();
          const antes = resolverVolta; resolverVolta = () => { if (antes) antes(); res(); };
          if (modo === 'dentro') iniciarVolta(); else if (modo === 'indo') pendenteVolta = true;
        });
      },
      // só para testes na consola: forçar um comportamento ou o tucano, ver o estado
      _teste: {
        acao(n) { if (modo === 'fora' && ACOES[n]) { pararAcao(); escolherAcao(n); } else if (modo === 'dentro' && ACOES_DENTRO[n]) { pararAcao(); dentro.acao = ACOES_DENTRO[n]; dentro.nome = n; dentro.t = 0; if (dentro.acao.iniciar) dentro.acao.iniciar(); } },
        evento() { if (!ev.ativo) ev.ativo = { t: 0, alvo: null }; },
        semEventos() { ev.prox = 1e9; },
        semAcoes() { fora.prox = 1e9; dentro.prox = 1e9; },
        estado: () => ({ modo, PX: n1(PX), PY: n1(PY), BX: n1(BX), BY: n1(BY), ROT: n3(ROT), acao: fora.acao ? fora.nome : dentro.acao ? dentro.nome : '', maos: maoPos.map(p => p.map(n1)), lia: n3(lia.a), cab: cabPos.map(n1), boca: bocaPos.map(n1) })
      },
      destruir() { destruido = true; try { desligar(); } catch (e) { /* nada */ } }
    };
  }

  return { icone: gerarIcone(), montar };
})();
