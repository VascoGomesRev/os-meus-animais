/* Coala — «Os Meus Animais». Contrato e regras: REGRAS-ANIMAIS.md.
   Cena: um bosque de eucaliptos australiano ao fim da tarde (sol baixo, à esquerda): céu quente, colinas azuis ao longe,
   eucaliptos claros de casca a descascar, erva seca dourada, folhas e tiras de casca no chão, um tronco caído.
   Habitat: a forquilha de um eucalipto grande. O coala anda até ao tronco, trepa-o abraçado (mãos e pés alternados,
   presos à casca) e instala-se na forquilha, encostado ao tronco de trás e abraçado ao ramo da frente
   (camadas: tronco e ramo de trás → coala → ramo da frente → braços do coala → folhas da frente).
   O coala é um boneco «2,5D»: o corpo é uma pera que se vira (a barriga clara desliza para o lado para onde olha),
   as 4 patas têm IK de 2 segmentos com as mãos e os pés presos ao mundo; a cabeça é uma esfera com as feições
   presas a ela (nariz grande e escuro, olhos pequenos, orelhas enormes e peludas com mola).
   Organização: 1) utilidades  2) medidas  3) desenho do coala  4) cenário e eucalipto  5) ícone
                6) montar(): estado, desenho por quadro, tarefas, comportamentos, idas e voltas */
'use strict';
MODULOS.coala = (() => {
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
  const elipseD = (cx, cy, rx, ry) => `M${n(cx - rx)},${n(cy)}a${n(rx)},${n(ry)} 0 1,0 ${n(2 * rx)},0a${n(rx)},${n(ry)} 0 1,0 ${n(-2 * rx)},0Z`;
  // contorno «peludo»: círculo com pequenos arcos para fora (tufos)
  function felpudo(cx, cy, r, k, alt, rnd, a0 = 0, a1 = TAU) {
    const pts = [];
    for (let i = 0; i <= k; i++) { const a = lerp(a0, a1, i / k); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    let d = `M${n(pts[0][0])},${n(pts[0][1])}`;
    for (let i = 1; i < pts.length; i++) {
      const a = lerp(a0, a1, (i - .5) / k), h = alt * (.7 + .6 * (rnd ? rnd() : .5));
      d += ` Q${n(cx + Math.cos(a) * (r + h))},${n(cy + Math.sin(a) * (r + h))} ${n(pts[i][0])},${n(pts[i][1])}`;
    }
    return d + (a1 - a0 >= TAU - 1e-6 ? 'Z' : '');
  }
  // tubo afunilado ao longo de uma linha de pontos (ramos e troncos), com as bordas suavizadas
  function tubo(pts, w0, w1) {
    const esq = [], dir = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      const w = lerp(w0, w1, i / (pts.length - 1)) / 2;
      esq.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); dir.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
    }
    const lado = l => { let d = ''; for (let i = 1; i < l.length - 1; i++) { const m = [(l[i][0] + l[i + 1][0]) / 2, (l[i][1] + l[i + 1][1]) / 2]; d += ` Q${n(l[i][0])},${n(l[i][1])} ${n(m[0])},${n(m[1])}`; } return d + ` L${n(l[l.length - 1][0])},${n(l[l.length - 1][1])}`; };
    const dr = dir.slice().reverse(), fim = pts[pts.length - 1];
    return `M${n(esq[0][0])},${n(esq[0][1])}` + lado(esq) + ` Q${n(fim[0] + (fim[0] - pts[pts.length - 2][0]) * .15)},${n(fim[1] + (fim[1] - pts[pts.length - 2][1]) * .15)} ${n(dr[0][0])},${n(dr[0][1])}` + lado(dr) + 'Z';
  }

  /* ================= 2) Medidas ================= */
  const ESC = 1;                  // escala do coala no cenário
  const CH = 778;                 // y do chão onde o coala se senta e anda
  const SENT = { x: 690, y: CH - 38, psi: .3, r: 0 };       // sentado no chão, encostado ao tronco caído
  const ANDA_Y = CH - 70;                                   // altura da anca a andar de quatro
  const ARV = { x: 1040, base: 806, forq: 585 };           // eucalipto do habitat (tronco até à forquilha)
  const hwTronco = y => y > 770 ? lerp(56, 74, (y - 770) / 36) : lerp(48, 56, (y - ARV.forq) / (770 - ARV.forq));
  const SUBIR = { x: 960, y0: 732, y1: 640 };               // anca do coala a trepar (do pé do tronco até perto da forquilha)
  const FORQ = { x: 1024, y: 548, psi: -.14, r: -5 };       // sentado na forquilha
  // ramos que saem da forquilha: o de trás (encosto) sobe para a esquerda, o da frente (abraçado) sobe para a direita
  const RAMO_TRAS = [[1030, 600], [1012, 500], [985, 400], [952, 290], [925, 170], [902, 40], [890, -30]];
  const RAMO_FRENTE = [[1040, 652], [1046, 600], [1066, 530], [1088, 450], [1110, 370], [1132, 290], [1160, 190], [1196, 70], [1218, -30]];
  // corpo (local: anca na origem, y para cima negativo; a barriga fica para +x quando o coala se vira para a direita)
  // corpo em forma de pera com o contorno felpudo (pequenos arcos de pelo), mais largo em baixo
  const CORPO = (() => {
    const k = 34, pts = [];
    for (let i = 0; i < k; i++) { const t = -Math.PI / 2 + i / k * 2 * Math.PI, sn = Math.sin(t); pts.push([(84 + 11 * sn - 6 * sn * sn) * Math.cos(t), -73 + 117 * sn]); }
    const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], r = v => Math.round(v * 10) / 10;
    let d = '';
    for (let i = 0; i < k; i++) {
      const a = pts[i], b = pts[(i + 1) % k], c = m(a, b), L = Math.hypot(c[0], c[1] + 73) || 1, h = i % 3 ? 3.2 : 5;
      d += (i ? ' ' : 'M' + r(a[0]) + ',' + r(a[1]) + ' ') + 'Q' + r(c[0] + c[0] / L * h * 2) + ',' + r(c[1] + (c[1] + 73) / L * h * 2) + ' ' + r(b[0]) + ',' + r(b[1]);
    }
    return d + 'Z';
  })();
  // membros: s = lado no ecrã quando o coala está de frente (−1 esquerda); W, f = ombro/anca (lado, frente); ly = altura no corpo
  const MEMBROS = [
    { id: 'pE', braco: 0, s: -1, ly: -18, W: 46, f: 20, L1: 58, L2: 52, a1: 30, b1: 22, a2: 20, b2: 15 },
    { id: 'pD', braco: 0, s: 1, ly: -18, W: 46, f: 20, L1: 58, L2: 52, a1: 30, b1: 22, a2: 20, b2: 15 },
    { id: 'bE', braco: 1, s: -1, ly: -124, W: 52, f: 14, L1: 60, L2: 56, a1: 20, b1: 17, a2: 17, b2: 14 },
    { id: 'bD', braco: 1, s: 1, ly: -124, W: 52, f: 14, L1: 60, L2: 56, a1: 20, b1: 17, a2: 17, b2: 14 }
  ];
  const COR = {
    cont: '#3E3338', pelo: '#A3A2AB', peloE: '#7D7B86', peloC: '#D3D2D8', barriga: '#F1EBE2', nariz: '#2A2326',
    garra: '#2A2224', almofada: '#4A3F44', boca: '#6A2A36'
  };

  /* ================= 3) Desenho do coala ================= */
  function defsCoala(p) {
    return `
    <radialGradient id="${p}corpo" gradientUnits="userSpaceOnUse" cx="-34" cy="-128" r="236"><stop offset="0" stop-color="#D2D1D8"/><stop offset=".5" stop-color="#A6A5AE"/><stop offset="1" stop-color="#76747F"/></radialGradient>
    <radialGradient id="${p}barriga" cx=".42" cy=".3" r=".8"><stop offset="0" stop-color="#FFFCF6"/><stop offset=".6" stop-color="#F0E9DE"/><stop offset="1" stop-color="#D9D0C4"/></radialGradient>
    <radialGradient id="${p}costas" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#4E4A56" stop-opacity=".55"/><stop offset="1" stop-color="#4E4A56" stop-opacity="0"/></radialGradient>
    <linearGradient id="${p}membro" gradientUnits="userSpaceOnUse" x1="0" y1="-24" x2="0" y2="24"><stop offset="0" stop-color="#CBCAD1"/><stop offset=".5" stop-color="#A2A1AA"/><stop offset="1" stop-color="#77757F"/></linearGradient>
    <linearGradient id="${p}mao" gradientUnits="userSpaceOnUse" x1="0" y1="-18" x2="0" y2="18"><stop offset="0" stop-color="#B4B3BB"/><stop offset=".55" stop-color="#8E8C96"/><stop offset="1" stop-color="#666470"/></linearGradient>
    <radialGradient id="${p}cab" gradientUnits="userSpaceOnUse" cx="-26" cy="-34" r="118"><stop offset="0" stop-color="#D8D7DD"/><stop offset=".55" stop-color="#ABAAB3"/><stop offset="1" stop-color="#7F7D88"/></radialGradient>
    <radialGradient id="${p}orelha" cx=".42" cy=".4" r=".65"><stop offset="0" stop-color="#B8B7BF"/><stop offset="1" stop-color="#8A8893"/></radialGradient>
    <radialGradient id="${p}orelhaIn" cx=".5" cy=".5" r=".55"><stop offset="0" stop-color="#C9B9BE"/><stop offset=".55" stop-color="#EDE7E6"/><stop offset="1" stop-color="#FFFFFF"/></radialGradient>
    <radialGradient id="${p}nariz" cx=".36" cy=".26" r=".85"><stop offset="0" stop-color="#6E666B"/><stop offset=".35" stop-color="#3A3236"/><stop offset="1" stop-color="#17121A"/></radialGradient>
    <radialGradient id="${p}iris" cx=".42" cy=".36" r=".7"><stop offset="0" stop-color="#9A6A3E"/><stop offset=".5" stop-color="#5E3A20"/><stop offset="1" stop-color="#24140C"/></radialGradient>
    <radialGradient id="${p}queixo" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DCD6D2"/></radialGradient>
    <radialGradient id="${p}sombra"><stop offset="0" stop-color="#3A2410" stop-opacity=".5"/><stop offset=".6" stop-color="#3A2410" stop-opacity=".22"/><stop offset="1" stop-color="#3A2410" stop-opacity="0"/></radialGradient>
    <clipPath id="${p}clipCorpo"><path d="${CORPO}"/></clipPath>
    <clipPath id="${p}clipOlho"><ellipse rx="11" ry="12.5"/></clipPath>
    <clipPath id="${p}clipTronco"><path clip-rule="evenodd" d="M-20,-20 H1620 V920 H-20 Z ${troncoD()}"/></clipPath>`;
  }
  const capsula = (L, a, b) => `M0,${-a} L${L},${-b} A${b},${b} 0 0 1 ${L},${b} L0,${a} A${a},${a} 0 0 1 0,${-a} Z`;
  const MAO = 'M-6,-15 C8,-21 26,-19 34,-9 C39,-3 39,4 34,10 C26,19 8,20 -6,15 C-12,9 -12,-9 -6,-15 Z';
  const MAO_GARRAS = 'M33,-8 q9,-2 12,3 M37,-1 q9,0 11,5 M35,6 q8,2 9,7 M14,15 q3,8 -1,12 M6,15 q2,8 -2,11';
  const PE = 'M-8,-16 C10,-20 32,-17 43,-8 C48,-2 48,5 43,10 C32,18 10,19 -8,16 C-14,10 -14,-10 -8,-16 Z';
  const PE_GARRAS = 'M42,-7 q9,-1 11,4 M45,0 q9,1 10,6 M41,7 q8,3 8,8 M10,-17 q2,-8 -2,-11';
  function membroSVG(p, m) {
    const k = 'cl-' + m.id, mao = m.braco ? MAO : PE, garras = m.braco ? MAO_GARRAS : PE_GARRAS;
    const s1 = capsula(m.L1, m.a1, m.b1), s2 = capsula(m.L2, m.a2, m.b2);
    // tufos de pelo nos segmentos (riscos claros e escuros ao comprido)
    const pelo1 = `M10,${-m.a1 * .55} q8,-3 14,1 M${m.L1 * .4},${-m.b1 * .6} q8,-3 14,1 M18,${m.a1 * .4} q8,3 14,-1 M${m.L1 * .55},${m.b1 * .45} q8,3 12,-1`;
    const pelo2 = `M8,${-m.a2 * .5} q8,-3 13,1 M${m.L2 * .45},${-m.b2 * .55} q7,-3 12,1`;
    const folha = m.id === 'bD' ? `<g class="cl-folhaMao" display="none"><g class="cl-folhaMaoIn">
        <path d="M0,0 C10,-3 22,-2 34,4" stroke="#6B5A3C" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        <path class="cl-folhaF" d="M6,0 C14,-12 36,-14 56,-4 C40,4 20,8 6,0 Z" fill="#7FA79C" stroke="#3E5E56" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M8,-1 C22,-6 38,-7 54,-4" stroke="#C8DED4" stroke-width="1.2" fill="none" opacity=".8"/>
        <path d="M18,2 C24,10 38,16 50,14 C38,8 28,4 18,2 Z" fill="#5E8A80" stroke="#3E5E56" stroke-width="1.4"/></g></g>` : '';
    return `<g class="cl-membro ${k}">
      <g class="${k}-s1"><path d="${s1}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="6" stroke-linejoin="round"/></g>
      <g class="${k}-s2"><path d="${s2}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="6" stroke-linejoin="round"/></g>
      <g class="${k}-mao"><path d="${mao}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="6" stroke-linejoin="round"/></g>
      <g class="${k}-s1"><path d="${s1}" fill="url(#${p}membro)"/><path d="${pelo1}" stroke="#E2E1E6" stroke-width="2.4" stroke-linecap="round" opacity=".55"/></g>
      <g class="${k}-s2"><path d="${s2}" fill="url(#${p}membro)"/><path d="${pelo2}" stroke="#E2E1E6" stroke-width="2.2" stroke-linecap="round" opacity=".5"/>
        <path d="M${m.L2 - 4},${-m.b2 + 2} q6,-4 9,1 M${m.L2 - 2},${m.b2 - 2} q6,4 9,-1" stroke="#CFCED5" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/></g>
      <g class="${k}-mao"><path d="${mao}" fill="url(#${p}mao)"/>
        <ellipse cx="${m.braco ? 18 : 22}" cy="6" rx="${m.braco ? 11 : 14}" ry="6" fill="${COR.almofada}" opacity=".55"/>
        <path d="${garras}" stroke="${COR.garra}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
        <path d="M2,-9 C10,-14 22,-14 30,-8" stroke="#E2E1E6" stroke-width="2.2" fill="none" opacity=".55" stroke-linecap="round"/>${folha}</g>
    </g>`;
  }
  function corpoSVG(p) {
    const rnd = semente(7);
    // madeixas de pelo no meio do corpo
    let madeixas = '';
    for (let i = 0; i < 18; i++) {
      const x = (rnd() - .5) * 130, y = -160 + rnd() * 180, l = 8 + rnd() * 8, a = (rnd() - .5) * .8 + PI / 2;
      madeixas += `M${n(x)},${n(y)} q${n(Math.cos(a - .6) * l * .6)},${n(Math.sin(a - .6) * l * .6)} ${n(Math.cos(a) * l)},${n(Math.sin(a) * l)}`;
    }
    return `<g class="cl-corpoIn">
      <path d="${CORPO}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7" stroke-linejoin="round"/>
      <path d="${CORPO}" fill="url(#${p}corpo)"/>
      <g clip-path="url(#${p}clipCorpo)">
        <ellipse class="cl-costas" cx="0" cy="-70" rx="70" ry="130" fill="url(#${p}costas)" opacity="0"/>
        <g class="cl-barriga"><ellipse cx="0" cy="-72" rx="50" ry="92" fill="url(#${p}barriga)"/>
          <path d="${felpudo(0, -150, 44, 9, 7, semente(3), PI * .1, PI * .9)}" fill="none" stroke="#FFFFFF" stroke-width="2.4" opacity=".7"/>
          <path d="M-20,-120 q4,8 0,16 M10,-100 q4,8 0,16 M-12,-60 q4,8 0,16 M18,-40 q4,8 0,16 M-4,-20 q4,8 0,14" stroke="#D2C8BA" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/></g>
        <path d="${madeixas}" stroke="#7E7C88" stroke-width="2" fill="none" stroke-linecap="round" opacity=".45"/>
        <path d="M-60,-150 C-76,-110 -84,-60 -80,-10" stroke="#E6E5EA" stroke-width="9" fill="none" opacity=".35" stroke-linecap="round"/>
        <path d="M-90,10 C-50,40 50,40 90,10 L90,60 L-90,60 Z" fill="#4E4A56" opacity=".22"/>
      </g>
    </g>`;
  }

  /* --- Cabeça: esfera com as feições presas (ângulo = lado + rumo da cabeça); beta = cabeça para baixo (graus) --- */
  function estadoCabeca(q) {
    const a = q.yaw, b = q.beta * RAD, sb = Math.sin(b), cb = Math.cos(b);
    const t = {}, d = {}, op = {}, A = {};
    const sen = g => Math.sin(g), co = g => Math.cos(g);
    // nariz: grande, no meio da cara; de perfil sai um pouco para fora da silhueta
    const nx = 58 * sen(a) * (.92 + .08 * cb), ny = 12 + 30 * sb;
    t.nariz = `translate(${n(nx)},${n(ny)}) rotate(${n(sen(a) * 8)}) scale(${n3((.72 + .28 * Math.abs(co(a))) * (1 + q.narizF * .06))},${n3(cb * .12 + .88)})`;
    // boca e queixo por baixo do nariz (o queixo desce quando a boca abre e mexe-se a mastigar)
    const mx = 52 * sen(a) + q.mastX * .6, my = ny + 34 + 4 * cb;
    const ab = limita(q.boca, 0, 1.4);
    t.queixo = `translate(${n(mx + q.mastX)},${n(my + 6 + ab * 14 + q.mastY)}) scale(${n3(.7 + .3 * Math.abs(co(a)))},1)`;
    t.bocaInt = `translate(${n(mx + q.mastX * .5)},${n(my + 2 + ab * 7)}) scale(${n3(.7 + .3 * Math.abs(co(a)))},1)`;
    A.bocaRy = n(.6 + ab * 14); A.bocaRx = n(9 + ab * 7);
    const w = 13 * (.6 + .4 * Math.abs(co(a)));
    d.boca = `M${n(mx - w)},${n(my - 3)} Q${n(mx - w * .5)},${n(my + 3 + q.sorriso * 3)} ${n(mx)},${n(my)} Q${n(mx + w * .5)},${n(my + 3 + q.sorriso * 3)} ${n(mx + w)},${n(my - 3)}`;
    op.boca = ab > .25 ? '0' : '1';
    A.boca = [mx, my + 2];
    for (const s of [-1, 1]) {
      const k = s < 0 ? 'E' : 'D';
      // olhos pequenos e brilhantes
      const ge = s * .52 + a, ce = co(ge), ex = 64 * sen(ge), sx = .2 + .8 * Math.max(0, ce);
      t['olho' + k] = `translate(${n(ex)},${n(-8 + 26 * sb)}) scale(${n3(sx * q.olhoEsc)},${n3(q.olhoEsc)})`;
      op['olho' + k] = ce > .12 ? '1' : '0';
      t['sobr' + k] = `translate(${n(66 * sen(ge + s * .04))},${n(-30 + 24 * sb - q.sobr * 5)}) rotate(${n(s * (10 - q.sobr * 12))}) scale(${n3(sx)},1)`;
      op['sobr' + k] = ce > .18 ? '1' : '0';
      const gc = s * .78 + a;
      t['boch' + k] = `translate(${n(62 * sen(gc))},${n(22 + 20 * sb)}) scale(${n3(.3 + .7 * Math.max(0, co(gc)))},1)`;
      op['boch' + k] = n3(passoS(.05, .4, co(gc)) * .45 * (1 + q.feliz * .7));
      // orelhas enormes: presas aos lados do alto da cabeça, rodam com a mola
      const go = s * 1.08 + a, ox = 72 * sen(go), sxo = .62 + .38 * Math.abs(co(go));
      const up = (s < 0 ? q.oE : q.oD) + q.orelhas;
      t['orelha' + k] = `translate(${n(ox)},${n(-46 + 8 * sb)}) rotate(${n(s * (-14 - up) + q.yaw * 6)}) scale(${n3(sxo)},1)`;
      // tufo da bochecha (pelo que sai para os lados)
      const gt = s * 1.25 + a;
      t['tufo' + k] = `translate(${n(56 * sen(gt))},${n(26 + 6 * sb)}) scale(${n3(.4 + .6 * Math.abs(co(gt)))},1)`;
      op['tufo' + k] = co(gt) > -.2 ? '1' : '0';
    }
    // pálpebras (c = fecho, h = olhos contentes «∩»)
    const c = limita(q.fecho, 0, 1), h = limita(q.feliz, 0, 1);
    // contente: o olho fecha-se todo e fica um arco para cima («∩»); a dormir/piscar: um risco curvo para baixo
    const c2 = Math.max(c, h);
    const ye = lerp(-9.5, 13, c2), cy = lerp(-22, 15, c2);
    d.palpS = `M-15,-16 L15,-16 L15,${n(ye)} Q0,${n(cy)} -15,${n(ye)} Z`;
    d.palpI = 'M-15,16 L15,16 L15,15 Q0,19 -15,15 Z';
    const arco = h > c ? -1 : 1;
    d.risca = arco < 0 ? 'M-11,5 Q0,-9 11,5' : 'M-11,2 Q0,9 11,2';
    A.abre = 1 - c2;
    t.iris = `translate(${n(q.olharX * 3.2 + sen(a) * 1.5)},${n(q.olharY * 3)})`;
    t.testa = `translate(${n(30 * sen(a))},0)`;
    return { t, d, op, A };
  }
  function cabecaSVG(p, E) {
    const T = k => E.t[k] ? ` transform="${E.t[k]}"` : '';
    const O = k => E.op[k] != null ? ` opacity="${E.op[k]}"` : '';
    const orelha = k => {
      const rnd = semente(k === 'E' ? 41 : 43), s = k === 'E' ? -1 : 1;
      return `<g class="cl-orelha${k}"${T('orelha' + k)}><g class="cl-orelha${k}-in">
        <path d="${felpudo(s * 38, -8, 46, 17, 7, rnd)}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="5" stroke-linejoin="round"/>
        <path d="${felpudo(s * 38, -8, 46, 17, 7, semente(k === 'E' ? 41 : 43))}" fill="url(#${p}orelha)"/>
        <path d="${felpudo(s * 42, -8, 34, 15, 8, semente(k === 'E' ? 45 : 47))}" fill="url(#${p}orelhaIn)"/>
        <path d="M${s * 22},-10 q${s * 12},-10 ${s * 26},-6 M${s * 24},2 q${s * 12},-2 ${s * 26},4 M${s * 30},-20 q${s * 10},-4 ${s * 18},2 M${s * 28},12 q${s * 8},6 ${s * 18},6" stroke="#FFFFFF" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".85"/>
        <ellipse cx="${s * 30}" cy="-4" rx="9" ry="12" fill="#B7A3AA" opacity=".55"/></g></g>`;
    };
    const olho = k => `<g class="cl-olho${k}"${T('olho' + k)}${O('olho' + k)}>
        <ellipse rx="14" ry="15.5" fill="#6A6874" opacity=".5"/>
        <g clip-path="url(#${p}clipOlho)">
          <ellipse rx="11" ry="12.5" fill="#F4EEE6"/>
          <g class="cl-iris${k}"${T('iris')}><circle cy="1" r="9.6" fill="url(#${p}iris)"/>
            <ellipse cy="1" rx="3.6" ry="6.4" fill="#0E0806"/><circle cx="-3.6" cy="-3.4" r="3.5" fill="#FFFFFF"/><circle cx="3.6" cy="5" r="1.7" fill="#FFFFFF" opacity=".9"/></g>
          <path d="M-15,-16 L15,-16 L15,-6 Q0,-18 -15,-6 Z" fill="#3A3240" opacity=".18"/>
          <path class="cl-palpS${k}" d="${E.d.palpS}" fill="#9E9DA6"/>
          <path class="cl-palpI${k}" d="${E.d.palpI}" fill="#9E9DA6"/>
        </g>
        <path class="cl-risca${k}" d="${E.d.risca}" fill="none" stroke="${COR.cont}" stroke-width="2.4" stroke-linecap="round"/>
        <ellipse rx="11" ry="12.5" fill="none" stroke="${COR.cont}" stroke-width="2.2"/>
      </g>`;
    // tufos de pelo das bochechas: madeixas claras que saem da silhueta, para os lados e para baixo (ficam atrás da cara)
    const tufo = k => { const s = k === 'E' ? -1 : 1, X = v => n(s * v);
      const d = `M${X(-6)},-26 Q${X(14)},-30 ${X(22)},-20 Q${X(30)},-24 ${X(38)},-18 Q${X(30)},-10 ${X(34)},-4 Q${X(44)},-2 ${X(48)},4 Q${X(36)},8 ${X(36)},14 Q${X(42)},20 ${X(42)},28 Q${X(28)},24 ${X(22)},28 Q${X(12)},34 ${X(-6)},28 Z`;
      return `<g class="cl-tufo${k}"${T('tufo' + k)}${O('tufo' + k)}>
        <path d="${d}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="5" stroke-linejoin="round"/>
        <path d="${d}" fill="#C4C3CA"/>
        <path d="M${X(14)},-14 q${X(10)},-2 ${X(20)},-2 M${X(16)},2 q${X(12)},0 ${X(24)},4 M${X(14)},16 q${X(10)},2 ${X(20)},8" stroke="#FFFFFF" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/></g>`; };
    const rnd = semente(61);
    let madeixas = '';
    for (let i = 0; i < 14; i++) { const x = (rnd() - .5) * 110, y = -58 + rnd() * 50; madeixas += `M${n(x)},${n(y)} q${n(3 + rnd() * 3)},${n(4 + rnd() * 3)} ${n(1 + rnd() * 2)},${n(8 + rnd() * 4)}`; }
    return `<g class="cl-cab-in">
      ${orelha('E')}${orelha('D')}${tufo('E')}${tufo('D')}
      <path d="${felpudo(0, 0, 80, 26, 6, semente(51))}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="4" transform="scale(1,.86)"/>
      <path d="${felpudo(0, 0, 80, 26, 6, semente(51))}" fill="url(#${p}cab)" transform="scale(1,.86)"/>
      <g class="cl-testa"${T('testa')}><path d="${madeixas}" stroke="#7E7C88" stroke-width="2" fill="none" stroke-linecap="round" opacity=".45"/></g>
      <path d="M-50,-40 C-32,-56 -6,-60 18,-56" stroke="#EDECF0" stroke-width="9" fill="none" opacity=".4" stroke-linecap="round"/>
      <ellipse class="cl-bochE"${T('bochE')}${O('bochE')} rx="12" ry="7" fill="#F0A0A6"/><ellipse class="cl-bochD"${T('bochD')}${O('bochD')} rx="12" ry="7" fill="#F0A0A6"/>
      <g class="cl-queixo"${T('queixo')}><path d="${felpudo(0, 0, 19, 10, 4, semente(53), PI * .05, PI * .95)} Q0,-6 ${n(Math.cos(PI * .05) * 19)},${n(Math.sin(PI * .05) * 19)}Z" fill="url(#${p}queixo)" stroke="#8E8C96" stroke-width="1.6"/></g>
      <g class="cl-bocaInt"${T('bocaInt')}><ellipse class="cl-bocaE" rx="${E.A.bocaRx}" ry="${E.A.bocaRy}" fill="${COR.boca}" stroke="${COR.cont}" stroke-width="2"/>
        <ellipse class="cl-lingua" cy="${n(E.A.bocaRy * .45)}" rx="${n(E.A.bocaRx * .6)}" ry="${n(E.A.bocaRy * .45)}" fill="#E07A86"/></g>
      <path class="cl-boca" d="${E.d.boca}" stroke="${COR.cont}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      ${olho('E')}${olho('D')}
      <path class="cl-sobrE"${T('sobrE')}${O('sobrE')} d="M-9,2 C-4,-3 4,-3 9,1" stroke="#5E5C68" stroke-width="3" fill="none" stroke-linecap="round" stroke-opacity=".75"/>
      <path class="cl-sobrD"${T('sobrD')}${O('sobrD')} d="M-9,1 C-4,-3 4,-3 9,2" stroke="#5E5C68" stroke-width="3" fill="none" stroke-linecap="round" stroke-opacity=".75"/>
      <g class="cl-nariz"${T('nariz')}>
        <path d="M-22,-24 C-14,-31 14,-31 22,-24 C29,-10 28,14 17,25 C9,32 -9,32 -17,25 C-28,14 -29,-10 -22,-24 Z" fill="url(#${p}nariz)" stroke="#120E12" stroke-width="2.4"/>
        <path d="M-13,-20 C-6,-24 4,-24 9,-21" stroke="#9A9298" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>
        <ellipse cx="-10" cy="-8" rx="4" ry="9" fill="#8A8288" opacity=".35"/>
        <path class="cl-narinas" d="M-13,16 q4,6 9,4 M13,16 q-4,6 -9,4" stroke="#0A070A" stroke-width="3" fill="none" stroke-linecap="round"/>
      </g>
    </g>`;
  }

  function coalaSVG(p) {
    const E = estadoCabeca(CAB0);
    return `<g class="cl-coala">
      <ellipse class="cl-sombra" rx="1" ry="1" fill="url(#${p}sombra)"/>
      <g class="cl-slotLonge"></g>
      <g class="cl-corpo">${corpoSVG(p)}</g>
      <g class="cl-slotRamo"></g>
      <g class="cl-cab">${cabecaSVG(p, E)}</g>
      <g class="cl-slotPernas"></g>
      <g class="cl-slotBracos">${MEMBROS.map(m => membroSVG(p, m)).join('')}</g>
    </g>`;
  }
  const CAB0 = { yaw: .2, beta: 0, oE: 0, oD: 0, orelhas: 0, fecho: 0, feliz: 0, sobr: 0, boca: 0, mastX: 0, mastY: 0, olharX: 0, olharY: 0, narizF: 0, sorriso: .5, olhoEsc: 1 };

  /* ================= 4) Cenário: bosque de eucaliptos ao fim da tarde ================= */
  function defsCena(p) {
    return `
    <linearGradient id="${p}ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7EB4DA"/><stop offset=".35" stop-color="#B3D3E2"/><stop offset=".62" stop-color="#F4E0BC"/><stop offset=".82" stop-color="#F7CF98"/><stop offset="1" stop-color="#F2B67E"/></linearGradient>
    <radialGradient id="${p}solBrilho"><stop offset="0" stop-color="#FFF8DE" stop-opacity=".95"/><stop offset=".2" stop-color="#FFEAB4" stop-opacity=".5"/><stop offset=".55" stop-color="#FFDDA0" stop-opacity=".16"/><stop offset="1" stop-color="#FFDDA0" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}sol" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="#FFFFF6"/><stop offset=".7" stop-color="#FFF2C8"/><stop offset="1" stop-color="#FFE2A0"/></radialGradient>
    <linearGradient id="${p}colinaL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9B4D2"/><stop offset="1" stop-color="#C6C6D6"/></linearGradient>
    <linearGradient id="${p}colinaM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FA6A6"/><stop offset="1" stop-color="#AFB9A8"/></linearGradient>
    <linearGradient id="${p}bruma" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7E2BC" stop-opacity="0"/><stop offset="1" stop-color="#F7E2BC" stop-opacity=".8"/></linearGradient>
    <linearGradient id="${p}chaoL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDC690"/><stop offset="1" stop-color="#D2AE6C"/></linearGradient>
    <linearGradient id="${p}chao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D3AA62"/><stop offset=".5" stop-color="#C4914C"/><stop offset="1" stop-color="#A9743A"/></linearGradient>
    <linearGradient id="${p}terra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C77A48"/><stop offset="1" stop-color="#A65A32"/></linearGradient>
    ${[['cascaT', 0, 0], ['cascaR', .222, 0], ['cascaF', -.27, 0]].map(([id, tg, dx]) =>
      // casca: claro à esquerda, sombra à direita; o gradiente inclina-se com cada ramo e todos coincidem em y = 600 (sem costuras na forquilha)
      `<linearGradient id="${p}${id}" gradientUnits="userSpaceOnUse" x1="${984 + dx}" y1="0" x2="${1096 + dx}" y2="0" gradientTransform="translate(0,600) skewX(${n3(Math.atan(tg) / RAD)}) translate(0,-600)"><stop offset="0" stop-color="#FBF6EC"/><stop offset=".35" stop-color="#EDE4D4"/><stop offset=".75" stop-color="#C9BCA8"/><stop offset="1" stop-color="#9E907C"/></linearGradient>`).join('')}
    <linearGradient id="${p}cascaL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2ECE2"/><stop offset=".5" stop-color="#E0D6C8"/><stop offset="1" stop-color="#BDB2A2"/></linearGradient>
    <linearGradient id="${p}tira" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B89878"/><stop offset=".5" stop-color="#8E6E52"/><stop offset="1" stop-color="#6A503C"/></linearGradient>
    <linearGradient id="${p}tronco" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9C8A76"/><stop offset=".45" stop-color="#7E6A56"/><stop offset="1" stop-color="#55443A"/></linearGradient>
    <radialGradient id="${p}topo" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#E8CFA6"/><stop offset=".45" stop-color="#C9A67A"/><stop offset=".7" stop-color="#A88660"/><stop offset="1" stop-color="#7A604A"/></radialGradient>
    <radialGradient id="${p}folha" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#A9CBBE"/><stop offset=".55" stop-color="#7FA79C"/><stop offset="1" stop-color="#5A8278"/></radialGradient>
    <radialGradient id="${p}sombraArv"><stop offset="0" stop-color="#4A2C12" stop-opacity=".36"/><stop offset=".7" stop-color="#4A2C12" stop-opacity=".15"/><stop offset="1" stop-color="#4A2C12" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}vinheta" cx=".48" cy=".46" r=".78"><stop offset=".62" stop-color="#4A2A10" stop-opacity="0"/><stop offset="1" stop-color="#4A2A10" stop-opacity=".3"/></radialGradient>
    <radialGradient id="${p}luzQuente" gradientUnits="userSpaceOnUse" cx="210" cy="160" r="1150"><stop offset="0" stop-color="#FFEAB8" stop-opacity=".24"/><stop offset=".5" stop-color="#FFE0A6" stop-opacity=".06"/><stop offset="1" stop-color="#FFE0A6" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}poeira"><stop offset="0" stop-color="#FFF6D8" stop-opacity=".95"/><stop offset="1" stop-color="#FFF6D8" stop-opacity="0"/></radialGradient>
    <clipPath id="${p}clipArv"><path d="${troncoD()} ${tubo(RAMO_TRAS, 92, 34)} ${tubo(RAMO_FRENTE, 98, 30)}"/></clipPath>`;
  }
  function troncoD() {
    const pts = [];
    for (let y = ARV.forq; y <= ARV.base; y += 20) pts.push(y);
    if (pts[pts.length - 1] !== ARV.base) pts.push(ARV.base);
    const esq = pts.map(y => [ARV.x - hwTronco(y) - (y > 780 ? (y - 780) * .9 : 0), y]);
    const dir = pts.map(y => [ARV.x + hwTronco(y) + (y > 780 ? (y - 780) * 1.1 : 0), y]).reverse();
    return 'M' + esq.map(q => n(q[0]) + ',' + n(q[1])).join(' L') + ' L' + dir.map(q => n(q[0]) + ',' + n(q[1])).join(' L') + 'Z';
  }
  function nuvemSVG(i, k) {
    return `<g class="cl-nuvem${i}"><g transform="scale(${k})">
      <ellipse cx="0" cy="10" rx="96" ry="13" fill="#F6D2C2" opacity=".8"/>
      <ellipse cx="-46" cy="0" rx="34" ry="16" fill="#FFF8F0"/><ellipse cx="-6" cy="-9" rx="40" ry="21" fill="#FFFFFF"/><ellipse cx="38" cy="-2" rx="34" ry="15" fill="#FFF8F0"/><ellipse cx="72" cy="5" rx="22" ry="9" fill="#FFF3EA"/>
      <ellipse cx="0" cy="7" rx="92" ry="9" fill="#FCEADF"/>
      <ellipse cx="-20" cy="-17" rx="22" ry="6" fill="#FFFFFF" opacity=".9"/></g></g>`;
  }
  // folha de eucalipto: comprida, em forma de foice, pendurada (local: nasce na origem e desce)
  function folhaD(x, y, L, w, ang, curva) {
    const c = Math.cos(ang), s = Math.sin(ang);
    const P = (u, v) => [x + (v * c - u * s), y + (v * s + u * c)];   // u ao longo da folha (para baixo), v para o lado
    const a = P(0, 0), b1 = P(L * .3, w + curva * .3), b2 = P(L * .75, w * .6 + curva), e = P(L, curva * 1.4), c1 = P(L * .7, -w * .5 + curva * .9), c2 = P(L * .3, -w * .8 + curva * .2);
    return `M${n(a[0])},${n(a[1])} C${n(b1[0])},${n(b1[1])} ${n(b2[0])},${n(b2[1])} ${n(e[0])},${n(e[1])} C${n(c1[0])},${n(c1[1])} ${n(c2[0])},${n(c2[1])} ${n(a[0])},${n(a[1])}Z`;
  }
  function nervuraD(x, y, L, ang, curva) {
    const c = Math.cos(ang), s = Math.sin(ang), P = (u, v) => [x + (v * c - u * s), y + (v * s + u * c)];
    const a = P(L * .05, 0), m = P(L * .5, curva * .6), e = P(L * .9, curva * 1.2);
    return `M${n(a[0])},${n(a[1])} Q${n(m[0])},${n(m[1])} ${n(e[0])},${n(e[1])}`;
  }
  // cacho de folhas pendurado de um raminho (x, y = ponto onde se prende, à volta do qual abana)
  function cachoSVG(cls, x, y, k, rnd, longe) {
    const tons = longe ? ['#93AFA8', '#A8C0B6', '#B9CEC4'] : ['#5E8A80', '#7FA79C', '#A6C6B8'];
    const caules = [];
    let dTwig = '', fol = ['', '', ''], nerv = '';
    const nr = 3 + (rnd() * 2 | 0);
    for (let r = 0; r < nr; r++) {
      const ang = (r - (nr - 1) / 2) * .5 + (rnd() - .5) * .3, L = (50 + rnd() * 40) * k;
      const ex = x + Math.sin(ang) * L * .8, ey = y + Math.cos(ang) * L;
      dTwig += `M${n(x)},${n(y)} Q${n(x + Math.sin(ang) * L * .5)},${n(y + L * .3)} ${n(ex)},${n(ey)}`;
      caules.push([ex, ey, ang]);
      const nf = 4 + (rnd() * 3 | 0);
      for (let i = 0; i < nf; i++) {
        const u = .25 + i / nf * .8, px = lerp(x, ex, u), py = lerp(y, ey, u) - Math.sin(u * PI) * 6;
        const fa = ang + (i % 2 ? 1 : -1) * (.35 + rnd() * .5), FL = (30 + rnd() * 22) * k, FW = (6 + rnd() * 3) * k, cv = (rnd() - .5) * 14 * k;
        const t = rnd() < .4 ? 0 : rnd() < .6 ? 1 : 2;
        fol[t] += folhaD(px, py, FL, FW, -fa, cv);
        if (!longe && rnd() < .7) nerv += nervuraD(px, py, FL, -fa, cv);
      }
      fol[1] += folhaD(ex, ey, (34 + rnd() * 16) * k, 7 * k, -ang, (rnd() - .5) * 10);
    }
    return `<g class="${cls}"><path d="${dTwig}" stroke="${longe ? '#A08E7E' : '#7A5E48'}" stroke-width="${n(2.6 * k)}" fill="none" stroke-linecap="round"/>
      ${longe ? '' : `<path d="${fol[0]}${fol[1]}" fill="#3E5E56" transform="translate(2,4)" opacity=".35"/>`}
      <path d="${fol[0]}" fill="${tons[0]}" stroke="${longe ? 'none' : '#3E5E56'}" stroke-width="1.2"/>
      <path d="${fol[1]}" fill="${longe ? tons[1] : `url(#coala-folha)`}" stroke="${longe ? 'none' : '#3E5E56'}" stroke-width="1.2"/>
      <path d="${fol[2]}" fill="${tons[2]}" stroke="${longe ? 'none' : '#4E7068'}" stroke-width="1.1"/>
      ${nerv ? `<path d="${nerv}" stroke="#D6E6DE" stroke-width="1" fill="none" opacity=".7"/>` : ''}</g>`;
  }
  // manchas de casca a descascar num tronco claro (dentro de um recorte do tronco)
  function manchasCasca(x0, x1, y0, y1, k, rnd) {
    let cinza = '', salmao = '', risco = '';
    for (let i = 0; i < k; i++) {
      const x = lerp(x0, x1, rnd()), y = lerp(y0, y1, rnd()), w = 10 + rnd() * 26, h = 24 + rnd() * 70;
      const d = `M${n(x)},${n(y)} C${n(x + w * .6)},${n(y + h * .1)} ${n(x + w)},${n(y + h * .4)} ${n(x + w * .7)},${n(y + h)} C${n(x + w * .3)},${n(y + h * .8)} ${n(x - w * .2)},${n(y + h * .6)} ${n(x)},${n(y)}Z`;
      if (rnd() < .55) cinza += d; else salmao += d;
    }
    for (let i = 0; i < k * 1.4; i++) { const x = lerp(x0, x1, rnd()), y = lerp(y0, y1, rnd()), h = 16 + rnd() * 40; risco += `M${n(x)},${n(y)} q${n((rnd() - .5) * 6)},${n(h / 2)} ${n((rnd() - .5) * 4)},${n(h)}`; }
    return `<path d="${cinza}" fill="#B3A897" opacity=".75"/><path d="${cinza}" fill="none" stroke="#8C7E6C" stroke-width="1.4" opacity=".6"/>
      <path d="${salmao}" fill="#E7BE9A" opacity=".55"/><path d="${risco}" stroke="#A89A88" stroke-width="1.4" fill="none" opacity=".45" stroke-linecap="round"/>`;
  }
  // tufo de copa ao longe: nuvem de folhagem azul-esverdeada (escuro por baixo, claro do lado do sol) com folhinhas a pender
  function copaLongeSVG(x, y, k, rnd) {
    let base = '', luz = '', fol = '';
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * TAU + rnd(), d = (16 + rnd() * 22) * k, rx = (24 + rnd() * 14) * k, ry = (15 + rnd() * 8) * k;
      const cx = x + Math.cos(a) * d * 1.3, cy = y + Math.sin(a) * d * .7;
      base += elipseD(cx, cy, rx, ry);
      if (Math.sin(a) < .3 && Math.cos(a) < .5) luz += elipseD(cx - rx * .25, cy - ry * .3, rx * .6, ry * .45);
    }
    for (let i = 0; i < 22; i++) { const fx = x + (rnd() - .5) * 110 * k, fy = y + 6 + rnd() * 30 * k; fol += `M${n(fx)},${n(fy)} q${n((rnd() - .5) * 4)},${n(6 * k)} ${n((rnd() - .5) * 6)},${n(12 * k)}`; }
    return `<path d="${base}" fill="#6F8E88" transform="translate(0,${n(6 * k)})" opacity=".8"/><path d="${base}" fill="#8FAAA4"/>
      <path d="${luz}" fill="#B9CEC6" opacity=".75"/><path d="${fol}" stroke="#6F8E88" stroke-width="${n(3 * k)}" fill="none" stroke-linecap="round" opacity=".8"/>`;
  }
  // eucalipto ao longe (plano do meio): tronco claro e esguio, copa de tufos
  const ARV_LONGE = [
    { x: 150, base: 655, w: 34, h: 660, inc: -.03, cachos: [[118, 60, 1], [176, 30, 1.1], [92, 150, .9], [210, 120, .9], [150, 200, .8]] },
    { x: 335, base: 630, w: 22, h: 560, inc: .02, cachos: [[318, 90, .8], [360, 70, .8], [300, 170, .7], [372, 160, .7]] },
    { x: 1290, base: 628, w: 24, h: 560, inc: -.02, cachos: [[1268, 96, .8], [1312, 70, .8], [1256, 176, .7], [1330, 160, .7]] },
    { x: 1478, base: 660, w: 40, h: 680, inc: .03, cachos: [[1446, 40, 1.1], [1510, 20, 1.1], [1420, 140, .9], [1540, 120, .9], [1478, 200, .8]] }
  ];
  function arvLongeSVG(p, a, i, rnd) {
    const topo = a.base - a.h, pts = [[a.x, a.base], [a.x + a.inc * a.h * .3, a.base - a.h * .35], [a.x + a.inc * a.h * .7, a.base - a.h * .7], [a.x + a.inc * a.h, topo]];
    let ramos = '';
    for (const [cx, cy] of a.cachos) ramos += `M${n(a.x + a.inc * (a.base - cy - 40))},${n(cy + 50)} Q${n((cx + a.x) / 2)},${n(cy + 20)} ${cx},${cy}`;
    return `<g>
      <ellipse cx="${a.x + 10}" cy="${a.base + 4}" rx="${a.w * 2}" ry="7" fill="url(#${p}sombraArv)"/>
      <path d="${ramos}" stroke="#D8CCBA" stroke-width="${n(a.w * .3)}" fill="none" stroke-linecap="round"/>
      <path d="${tubo(pts, a.w, a.w * .55)}" fill="url(#${p}cascaL)" opacity=".92"/>
      <path d="M${a.x - a.w * .2},${a.base - 20} L${n(a.x + a.inc * a.h * .6 - a.w * .1)},${n(a.base - a.h * .6)}" stroke="#FFFFFF" stroke-width="${n(a.w * .18)}" opacity=".35" stroke-linecap="round"/>
      ${[0, 1, 2, 3, 4].map(k => `<path d="M${n(a.x + a.w * (rnd() - .6) * .6)},${n(a.base - 40 - rnd() * a.h * .6)} q3,14 0,${n(18 + rnd() * 20)}" stroke="#B0A492" stroke-width="2.4" fill="none" opacity=".5"/>`).join('')}
      <g class="cl-copaL${i}">${a.cachos.map(([cx, cy, k]) => copaLongeSVG(cx, cy, k, rnd)).join('')}</g>
    </g>`;
  }
  function colinasSVG(p) {
    const rnd = semente(19);
    let copas = '';
    for (let i = 0; i < 60; i++) { const x = rnd() * 1640 - 20, y = 520 + Math.sin(x * .006) * 14 + rnd() * 18; copas += elipseD(x, y, 14 + rnd() * 18, 8 + rnd() * 6); }
    let copas2 = '';
    for (let i = 0; i < 46; i++) { const x = rnd() * 1640 - 20, y = 572 + Math.sin(x * .004 + 1) * 10 + rnd() * 14; copas2 += elipseD(x, y, 18 + rnd() * 22, 10 + rnd() * 7); }
    let troncos = '';
    for (let i = 0; i < 30; i++) { const x = rnd() * 1600, y = 580 + rnd() * 20; troncos += `M${n(x)},${n(y)} l${n((rnd() - .5) * 3)},-${n(26 + rnd() * 20)}`; }
    return `<path d="M0,500 C140,454 280,470 420,452 C560,436 700,470 860,452 C1020,432 1160,462 1300,446 C1440,430 1540,452 1600,444 L1600,620 L0,620 Z" fill="url(#${p}colinaL)"/>
      <path d="${copas}" fill="#A2AEC8" opacity=".9"/>
      <path d="M0,502 C140,456 280,472 420,454" stroke="#CCD3E4" stroke-width="3" fill="none" opacity=".6"/>
      <rect x="0" y="470" width="1600" height="120" fill="url(#${p}bruma)"/>
      <path d="M0,560 C180,534 330,550 500,534 C660,520 820,548 980,530 C1140,514 1300,540 1460,526 C1530,520 1580,524 1600,522 L1600,640 L0,640 Z" fill="url(#${p}colinaM)"/>
      <path d="${troncos}" stroke="#D8D6CC" stroke-width="2" opacity=".7"/>
      <path d="${copas2}" fill="#8EA79C"/>
      <path d="${copas2}" fill="#B6C8B8" opacity=".35" transform="translate(-4,-5) scale(1,1)"/>`;
  }
  function chaoSVG(p) {
    const rnd = semente(23);
    let s = `<rect y="600" width="1600" height="70" fill="url(#${p}chaoL)"/>`;
    s += `<path d="M0,628 C220,616 460,626 700,618 C960,610 1220,624 1600,612 L1600,900 L0,900 Z" fill="url(#${p}chao)"/>`;
    // manchas de terra vermelha
    s += `<path d="M380,900 C440,850 560,812 720,800 C840,792 940,800 1000,812 C1040,820 1090,830 1140,840 C1100,860 1020,880 980,900 Z" fill="url(#${p}terra)" opacity=".5"/>`;
    s += `<path d="${elipseD(260, 760, 120, 18)} ${elipseD(1320, 790, 140, 20)} ${elipseD(820, 690, 90, 10)}" fill="#B86A3E" opacity=".28"/>`;
    // erva seca
    let erva = ['', '', ''];
    for (let i = 0; i < 360; i++) {
      const y = 612 + Math.pow(rnd(), .8) * 290, x = rnd() * 1640 - 20, k = .4 + (y - 612) / 290 * 1.1;
      const h = (6 + rnd() * 10) * k, inc = (rnd() - .5) * 7 * k;
      erva[i % 3] += `M${n(x)},${n(y)} q${n(inc * .4)},${n(-h * .6)} ${n(inc)},${n(-h)} M${n(x + 2 * k)},${n(y)} q${n(-inc * .3 + 2)},${n(-h * .5)} ${n(-inc * .5 + 3 * k)},${n(-h * .8)}`;
    }
    s += `<path d="${erva[0]}" stroke="#B5823C" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="${erva[1]}" stroke="#EBCB82" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="${erva[2]}" stroke="#9E8A4A" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".6"/>`;
    // folhas caídas e tiras de casca no chão
    let fs = ['', '', ''], tiras = '';
    for (let i = 0; i < 70; i++) {
      const x = rnd() * 1600, y = 650 + rnd() * 250, k = .6 + (y - 650) / 250 * .8;
      fs[i % 3] += folhaD(x, y, 22 * k, 5 * k, PI / 2 + (rnd() - .5) * 2.6, (rnd() - .5) * 8);
    }
    for (let i = 0; i < 9; i++) {
      const x = rnd() * 1600, y = 700 + rnd() * 180, L = 40 + rnd() * 50, a = (rnd() - .5) * .6;
      tiras += `M${n(x)},${n(y)} c${n(L * .3)},${n(-6 + a * 20)} ${n(L * .7)},${n(6 + a * 20)} ${n(L)},${n(a * 30)} l-2,7 c${n(-L * .3)},${n(4 - a * 10)} ${n(-L * .7)},${n(-6 - a * 10)} ${n(-L + 2)},${n(-a * 30)}Z`;
    }
    s += `<path d="${fs[0]}" fill="#B9874E" stroke="#7E5630" stroke-width=".8"/><path d="${fs[1]}" fill="#C9A06A" stroke="#7E5630" stroke-width=".8"/><path d="${fs[2]}" fill="#A86A40" stroke="#6E4428" stroke-width=".8"/>
      <path d="${tiras}" fill="url(#${p}tira)" stroke="#5A4230" stroke-width="1.2"/>`;
    // pedrinhas e nozes de eucalipto
    for (let i = 0; i < 16; i++) {
      const x = rnd() * 1600, y = 700 + rnd() * 190;
      s += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(3 + rnd() * 3)}" ry="${n(2 + rnd() * 1.5)}" fill="#8E7A62" opacity=".8"/><ellipse cx="${n(x - 1)}" cy="${n(y - 1)}" rx="1.6" ry="1" fill="#E6D6BA" opacity=".8"/>`;
    }
    return s;
  }
  function troncoCaidoSVG(p) {
    // tronco caído atrás do coala (o coala senta-se à frente dele)
    const y0 = 662, y1 = 742, x0 = 432, x1 = 896;
    const rnd = semente(31);
    let riscos = '';
    for (let i = 0; i < 22; i++) { const x = x0 + 40 + rnd() * (x1 - x0 - 60), y = y0 + 10 + rnd() * 60; riscos += `M${n(x)},${n(y)} q${n(14 + rnd() * 20)},${n((rnd() - .5) * 4)} ${n(30 + rnd() * 40)},${n((rnd() - .5) * 3)}`; }
    return `<g>
      <ellipse cx="${(x0 + x1) / 2 + 30}" cy="${y1 + 4}" rx="290" ry="18" fill="url(#${p}sombraArv)"/>
      <path d="M${x0},${y0} C${x0 + 120},${y0 - 6} ${x1 - 140},${y0 - 2} ${x1},${y0 + 4} L${x1 + 8},${y0 + 18} L${x1 - 4},${y0 + 30} L${x1 + 10},${y0 + 46} L${x1 - 2},${y0 + 60} L${x1 + 4},${y1 - 2} C${x1 - 140},${y1 + 4} ${x0 + 120},${y1 + 2} ${x0},${y1} Z" fill="url(#${p}tronco)" stroke="#3E2E24" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="${riscos}" stroke="#4A3828" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/>
      <path d="M${x0 + 40},${y0 + 8} C${x0 + 160},${y0 + 2} ${x1 - 160},${y0 + 4} ${x1 - 30},${y0 + 10}" stroke="#C9B49A" stroke-width="6" fill="none" opacity=".5" stroke-linecap="round"/>
      <ellipse cx="${x0}" cy="${(y0 + y1) / 2}" rx="20" ry="${(y1 - y0) / 2}" fill="url(#${p}topo)" stroke="#3E2E24" stroke-width="2.5"/>
      <path d="${elipseD(x0, (y0 + y1) / 2, 13, 26)} ${elipseD(x0, (y0 + y1) / 2, 7, 14)}" fill="none" stroke="#8A6A4E" stroke-width="1.6" opacity=".8"/>
      <circle cx="${x0}" cy="${(y0 + y1) / 2}" r="2.5" fill="#6A4E38"/>
      ${[[560, 664], [610, 663], [760, 666]].map(([x, y]) => `<path d="M${x},${y} q-4,-8 -2,-14 q6,-2 9,4 q-2,6 -7,10Z" fill="#E9D6A8" stroke="#8E7448" stroke-width="1.2"/>`).join('')}
      <path d="M${x0 + 200},${y1 - 2} q20,-10 40,0 M${x0 + 300},${y1} q16,-8 32,0" stroke="#7E9A5A" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>
    </g>`;
  }
  function tufoErvaSVG(i, x, y, k, flip) {
    const rnd = semente(300 + i);
    let d = '';
    for (let j = 0; j < 11; j++) {
      const a = (j - 5) * 8 + (rnd() - .5) * 8, h = (50 + rnd() * 46) * k, bx = (j - 5) * 3.5 * k;
      const ex = bx + Math.sin(a * RAD) * h, ey = -Math.cos(a * RAD) * h;
      d += `M${n(bx - 2.6 * k)},0 Q${n(bx + ex * .3)},${n(ey * .55)} ${n(ex)},${n(ey)} Q${n(bx + ex * .3 + 3.5 * k)},${n(ey * .5)} ${n(bx + 2.6 * k)},0 Z`;
    }
    return `<g class="cl-erva${i}" transform="translate(${x},${y})${flip ? ' scale(-1,1)' : ''}"><g class="cl-ervaIn"><path d="${d}" fill="${i % 2 ? '#C49A4E' : '#D6B060'}" stroke="#8A6428" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="#F4DC9A" stroke-width=".8" opacity=".6"/></g></g>`;
  }

  /* --- Eucalipto do habitat: tronco claro, casca a descascar, forquilha com dois ramos, cachos de folhas --- */
  const CACHOS_TRAS = [[880, 230, 1.05], [960, 150, 1], [830, 300, .95], [1010, 70, 1.05], [1180, 130, 1], [1260, 180, 1.05], [1330, 140, 1], [905, 380, .9], [1120, 60, 1], [860, 120, 1], [1060, 10, 1.05]];
  const CACHOS_FRENTE = [[1134, 430, .95], [994, 664, .85], [1240, 240, .9]];
  function arvoreTrasSVG(p) {
    const rnd = semente(401);
    let s = `<ellipse cx="${ARV.x + 60}" cy="${ARV.base + 4}" rx="230" ry="26" fill="url(#${p}sombraArv)"/>`;
    // ramos finos que saem dos ramos grandes (para os cachos)
    let galhos = '';
    const prende = [[952, 290, 880, 230], [925, 170, 960, 150], [985, 400, 905, 380], [1012, 500, 830, 300], [902, 40, 1010, 70], [1160, 190, 1180, 130], [1160, 190, 1260, 180], [1196, 70, 1330, 140], [1196, 70, 1120, 60], [925, 170, 860, 120], [902, 40, 1060, 10]];
    for (const [ax, ay, bx, by] of prende) galhos += `M${ax},${ay} Q${n((ax + bx) / 2)},${n(Math.min(ay, by) - 14)} ${bx},${by}`;
    s += `<path d="${galhos}" stroke="#D8CCBA" stroke-width="7" fill="none" stroke-linecap="round"/><path d="${galhos}" stroke="#9E907C" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6" transform="translate(1,2)"/>`;
    s += `<g class="cl-cachosTras">${CACHOS_TRAS.map(([x, y, k], i) => cachoSVG('cl-ct' + i, x, y, k, rnd, false)).join('')}</g>`;
    // tronco e ramo de trás (claros, com casca a descascar)
    // (primeiro os contornos, depois os enchimentos: não há costura entre o tronco e o ramo)
    const tronco = troncoD(), tras = tubo(RAMO_TRAS, 92, 34);
    s += `<path d="${tronco} ${tras}" fill="#7E705E" stroke="#5A4C3E" stroke-width="5" stroke-linejoin="round"/>
      <path d="${tronco}" fill="url(#${p}cascaT)"/><path d="${tras}" fill="url(#${p}cascaR)"/>
      <g clip-path="url(#${p}clipArv)">${manchasCasca(960, 1110, 560, 800, 26, rnd)}${manchasCasca(880, 1050, 40, 560, 22, rnd)}
        <path d="M${ARV.x - 30},790 C${ARV.x - 34},700 ${ARV.x - 30},640 ${ARV.x - 24},600 C1000,520 975,420 945,300 C925,210 908,120 896,20" stroke="#FFFFFF" stroke-width="12" fill="none" opacity=".35" stroke-linecap="round"/>
        <path d="M${ARV.x + 44},800 C${ARV.x + 40},700 ${ARV.x + 40},640 ${ARV.x + 34},600" stroke="#6A5C4C" stroke-width="16" fill="none" opacity=".18" stroke-linecap="round"/></g>
      <path d="M${ARV.x - 74},806 C${ARV.x - 90},808 ${ARV.x - 104},812 ${ARV.x - 116},816 M${ARV.x + 80},806 C${ARV.x + 100},808 ${ARV.x + 118},814 ${ARV.x + 132},818" stroke="#D2C4B0" stroke-width="10" fill="none" stroke-linecap="round"/>`;
    // tiras de casca a descascar penduradas no tronco (abanam ao vento)
    s += `<g class="cl-tira0"><path d="M1004,612 C996,640 1000,668 990,700 C986,712 994,716 998,706 C1006,676 1004,646 1012,616 Z" fill="url(#${p}tira)" stroke="#5A4230" stroke-width="1.4"/></g>`;
    s += `<g class="cl-tira1"><path d="M1080,700 C1088,724 1084,748 1092,770 C1096,778 1090,782 1086,774 C1078,752 1080,726 1072,704 Z" fill="url(#${p}tira)" stroke="#5A4230" stroke-width="1.4"/></g>`;
    // zona de toque do habitat (invisível, por cima do tronco e da forquilha)
    s += `<rect x="900" y="300" width="260" height="510" fill="#000" fill-opacity="0"/>`;
    return s;
  }
  // ramo da frente (o coala abraça-o): desenhado no habitat e repetido dentro do coala quando ele está na árvore
  function ramoFrenteSVG(p, rnd) {
    const d = tubo(RAMO_FRENTE, 98, 30);
    // o contorno não se vê dentro do tronco (o ramo nasce dele); o enchimento continua o gradiente do tronco
    return `<path d="${d}" fill="#7E705E" stroke="#5A4C3E" stroke-width="5" stroke-linejoin="round" clip-path="url(#${p}clipTronco)"/>
      <path d="${d}" fill="url(#${p}cascaF)"/>
      <g clip-path="url(#${p}clipArv)">${manchasCasca(1040, 1200, 20, 600, 18, rnd)}
        <path d="M1034,600 C1050,520 1072,440 1096,360 C1116,290 1140,200 1170,90" stroke="#FFFFFF" stroke-width="10" fill="none" opacity=".35" stroke-linecap="round"/>
        <path d="M1086,606 C1100,530 1120,450 1144,370" stroke="#6A5C4C" stroke-width="14" fill="none" opacity=".16" stroke-linecap="round"/></g>
      <path d="M1008,590 C1020,604 1030,612 1040,626" stroke="#8C7E6C" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>`;
  }
  function arvoreFrenteSVG(p) {
    const rnd = semente(501);
    return `<g class="cl-cachosFrente">${CACHOS_FRENTE.map(([x, y, k], i) => cachoSVG('cl-cf' + i, x, y, k, rnd, false)).join('')}</g>`;
  }
  function folhasCairSVG() {
    return Array.from({ length: 8 }, (_, i) => `<g class="cl-fc${i}" display="none"><path d="${folhaD(0, -12, 26, 6, 0, 4)}" fill="${i % 2 ? '#7FA79C' : '#C9A06A'}" stroke="#3E5E56" stroke-width="1"/></g>`).join('');
  }
  /* --- Bichos dos acontecimentos raros --- */
  function guarda_rioSVG() {   // kookaburra (guarda-rios australiano)
    return `<g class="cl-kk" display="none"><g class="cl-kkIn">
      <path d="M-16,4 L-40,12 L-38,2 L-18,-4 Z" fill="#6A4A30" stroke="#3E2A1A" stroke-width="1.4"/>
      <path d="M-34,10 l-4,-2 M-30,8 l-4,-2" stroke="#E8DCC8" stroke-width="1.4"/>
      <ellipse cx="-2" cy="-4" rx="20" ry="15" fill="#E9DFCC" stroke="#3E2A1A" stroke-width="1.6"/>
      <g class="cl-kkAsa"><path d="M-20,-10 C-10,-22 8,-20 12,-8 C6,-2 -10,0 -20,-10 Z" fill="#6E4E34" stroke="#3E2A1A" stroke-width="1.4"/><path d="M-12,-10 l6,4 M-6,-12 l6,4" stroke="#7FB8D8" stroke-width="2"/></g>
      <g class="cl-kkCab"><circle cx="12" cy="-20" r="12" fill="#F2EAD8" stroke="#3E2A1A" stroke-width="1.6"/>
        <path d="M4,-22 L20,-24" stroke="#5A3E28" stroke-width="3" stroke-linecap="round"/><circle cx="14" cy="-24" r="2.2" fill="#1A120C"/>
        <path d="M2,-30 C8,-34 16,-34 20,-30" stroke="#8A6A4E" stroke-width="3" fill="none"/>
        <g class="cl-kkBico"><path d="M22,-22 L42,-18 L22,-15 Z" fill="#3A3230" stroke="#1A120C" stroke-width="1"/></g>
        <g class="cl-kkBicoI"><path d="M22,-15 L38,-15 L22,-11 Z" fill="#D8C8A8" stroke="#1A120C" stroke-width="1"/></g></g>
      <path d="M-4,10 L-6,18 M4,10 L5,18" stroke="#4A3828" stroke-width="2.4" stroke-linecap="round"/></g></g>`;
  }
  function cangurusSVG() {
    return `<g class="cl-cg" display="none"><g class="cl-cgIn" fill="#B8865A" stroke="#7A5232" stroke-width="1.4" stroke-linejoin="round">
      <path class="cl-cgCauda" d="M-14,-6 C-30,-2 -42,6 -52,12 C-44,4 -30,-6 -16,-12 Z"/>
      <ellipse cx="0" cy="-16" rx="16" ry="20" transform="rotate(20)"/>
      <path class="cl-cgPerna" d="M-6,-6 C0,4 8,8 18,10 L20,14 L2,14 C-6,10 -12,2 -12,-6 Z"/>
      <path d="M8,-26 C14,-22 16,-16 14,-12" fill="none"/>
      <ellipse cx="12" cy="-40" rx="7" ry="9"/><path d="M14,-44 L26,-40 L16,-34 Z"/>
      <path d="M8,-48 L6,-60 L12,-50 Z M13,-48 L14,-60 L17,-48 Z"/>
      <circle cx="16" cy="-42" r="1.4" fill="#1A120C" stroke="none"/></g></g>`;
  }
  function borboletaSVG() {
    return `<g class="cl-bb" display="none"><g class="cl-bbIn">
      <g class="cl-bbAsaE"><path d="M0,0 C-8,-18 -24,-20 -22,-6 C-21,2 -10,4 0,0 Z" fill="#3A8FD8" stroke="#1A2A40" stroke-width="1.6"/><path d="M0,1 C-10,4 -16,12 -10,16 C-5,18 -1,10 0,1 Z" fill="#5AAAE8" stroke="#1A2A40" stroke-width="1.4"/><circle cx="-15" cy="-9" r="2" fill="#FFF"/></g>
      <g class="cl-bbAsaD"><path d="M0,0 C8,-18 24,-20 22,-6 C21,2 10,4 0,0 Z" fill="#3A8FD8" stroke="#1A2A40" stroke-width="1.6"/><path d="M0,1 C10,4 16,12 10,16 C5,18 1,10 0,1 Z" fill="#5AAAE8" stroke="#1A2A40" stroke-width="1.4"/><circle cx="15" cy="-9" r="2" fill="#FFF"/></g>
      <ellipse cx="0" cy="2" rx="2" ry="8" fill="#1A2A40"/><path d="M-1,-5 C-3,-10 -5,-12 -7,-13 M1,-5 C3,-10 5,-12 7,-13" stroke="#1A2A40" stroke-width="1" fill="none"/></g></g>`;
  }
  function catatuasSVG() {   // catatuas brancas ao longe
    return [0, 1, 2].map(i => `<g class="cl-ave${i}"><path d="M-9,0 Q-4,-6 0,0 Q4,-6 9,0" stroke="#FFFFFF" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle r="1.6" fill="#FFF6D0"/></g>`).join('');
  }

  /* ================= 5) Ícone do menu (retrato parado, sem gradientes nem recortes com id) ================= */
  function iconeSVG() {
    const C = COR.cont;
    const E = estadoCabeca(Object.assign({}, CAB0, { yaw: -.12, beta: 4, feliz: .2, sorriso: 1 }));
    const T = k => E.t[k] ? ` transform="${E.t[k]}"` : '';
    const orelha = k => { const s = k === 'E' ? -1 : 1; return `<g${T('orelha' + k)}>
      <path d="${felpudo(s * 38, -8, 46, 17, 7, semente(k === 'E' ? 41 : 43))}" fill="#9C9BA4" stroke="${C}" stroke-width="5"/>
      <path d="${felpudo(s * 42, -8, 34, 15, 8, semente(k === 'E' ? 45 : 47))}" fill="#F4F0EE"/>
      <ellipse cx="${s * 30}" cy="-4" rx="9" ry="12" fill="#C9B6BC"/></g>`; };
    const olho = k => `<g${T('olho' + k)}><ellipse rx="11" ry="12.5" fill="#F4EEE6" stroke="${C}" stroke-width="2.2"/><circle cy="1" r="9" fill="#5E3A20"/><ellipse cy="1" rx="3.4" ry="6" fill="#0E0806"/><circle cx="-3.4" cy="-3.2" r="3.3" fill="#FFF"/><circle cx="3.4" cy="5" r="1.6" fill="#FFF"/>
      <path d="M-11,-3 Q0,-14 11,-3 L11,-14 L-11,-14Z" fill="#9E9DA6"/><path d="M-11,-3 Q0,-14 11,-3" stroke="${C}" stroke-width="2.2" fill="none"/></g>`;
    const rnd = semente(9);
    let fol = '';
    for (let i = 0; i < 9; i++) fol += folhaD(20 + i * 22, 20 + (i % 3) * 8, 34 + rnd() * 10, 7, -.5 + rnd(), (rnd() - .5) * 8);
    return `<circle cx="110" cy="110" r="106" fill="#F6DDB0"/><path d="M4,110 A106,106 0 0 1 216,110 Z" fill="#B9D7E6" opacity=".85"/>
      <path d="M16.5,160 A106,106 0 0 0 203.5,160 Z" fill="#D2AC68" opacity=".7"/>
      <path d="M150,216 C152,170 158,120 170,60 L188,62 C178,120 172,170 172,214 Z" fill="#EDE4D4" stroke="#9E907C" stroke-width="2"/>
      <path d="${fol}" fill="#7FA79C" stroke="#3E5E56" stroke-width="1.2"/>
      <circle cx="110" cy="110" r="106" fill="none" stroke="#D8B680" stroke-width="3"/>
      <path d="M48,214 C46,190 60,168 110,166 C160,168 174,190 172,214 Z" fill="#A3A2AB" stroke="${C}" stroke-width="4"/>
      <path d="M86,214 C84,196 94,182 110,182 C126,182 136,196 134,214 Z" fill="#F1EBE2"/>
      <g transform="translate(110,108) scale(.88)">
        ${orelha('E')}${orelha('D')}
        <path d="${felpudo(0, 0, 80, 26, 6, semente(51))}" fill="#ABAAB3" stroke="${C}" stroke-width="4" transform="scale(1,.86)"/>
        <path d="M-50,-40 C-32,-56 -6,-60 18,-56" stroke="#E4E3E8" stroke-width="9" fill="none" opacity=".6" stroke-linecap="round"/>
        <ellipse${T('bochE')} rx="12" ry="7" fill="#F0A0A6" opacity=".5"/><ellipse${T('bochD')} rx="12" ry="7" fill="#F0A0A6" opacity=".5"/>
        <path d="${E.d.boca}" stroke="${C}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
        ${olho('E')}${olho('D')}
        <g${T('nariz')}><path d="M-22,-24 C-14,-31 14,-31 22,-24 C29,-10 28,14 17,25 C9,32 -9,32 -17,25 C-28,14 -29,-10 -22,-24 Z" fill="#2E272B" stroke="#120E12" stroke-width="2.4"/>
          <path d="M-13,-20 C-6,-24 4,-24 9,-21" stroke="#9A9298" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
          <path d="M-13,16 q4,6 9,4 M13,16 q-4,6 -9,4" stroke="#0A070A" stroke-width="3" fill="none" stroke-linecap="round"/></g>
      </g>`;
  }

  /* ================= 6) montar() ================= */
  const CORPO0 = { r: 0, sy: 1, cy: 0, cr: 0, cb: 4, lean: 0 };
  const ROSTO0 = { olhos: 1, feliz: 0, oE: 0, oD: 0, orelhas: 0, boca: 0, sobr: 0, narizF: 0, sorriso: .5, olhoEsc: 1 };

  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .4 : 1;
    const p = 'coala-';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    const rndA = semente(77), rndR = semente(601);
    svg.innerHTML = `<defs>${defsCoala(p)}${defsCena(p)}</defs>
      <rect width="1600" height="640" fill="url(#${p}ceu)"/>
      <circle cx="210" cy="160" r="440" fill="url(#${p}solBrilho)"/>
      <circle cx="210" cy="160" r="46" fill="url(#${p}sol)"/>
      <g class="cl-nuvens">${nuvemSVG(0, 1)}${nuvemSVG(1, .7)}${nuvemSVG(2, .85)}${nuvemSVG(3, .55)}</g>
      <g class="cl-aves">${catatuasSVG()}</g>
      ${colinasSVG(p)}
      ${cangurusSVG()}
      ${chaoSVG(p)}
      ${ARV_LONGE.map((a, i) => arvLongeSVG(p, a, i, rndA)).join('')}
      ${troncoCaidoSVG(p)}
      <g class="cl-poeiras">${Array.from({ length: 12 }, (_, i) => `<circle class="cl-po${i}" r="${n(2 + (i % 3))}" fill="url(#${p}poeira)"/>`).join('')}</g>
      <g class="cl-habitat">
        <g class="cl-arvTras">${arvoreTrasSVG(p)}<g class="cl-ramoFrente">${ramoFrenteSVG(p, semente(601))}</g></g>
        ${coalaSVG(p)}
        <g class="cl-arvFrente">${arvoreFrenteSVG(p)}</g>
        <g class="cl-folhasCair">${folhasCairSVG()}</g>
        ${guarda_rioSVG()}
      </g>
      ${borboletaSVG()}
      ${tufoErvaSVG(0, 40, 906, 1.1, false)}${tufoErvaSVG(1, 150, 912, .9, true)}${tufoErvaSVG(2, 270, 908, .7, false)}${tufoErvaSVG(3, 1350, 908, .8, true)}${tufoErvaSVG(4, 1470, 912, 1.05, false)}${tufoErvaSVG(5, 1580, 906, .9, true)}${tufoErvaSVG(6, 900, 914, .45, false)}${tufoErvaSVG(7, 520, 914, .5, true)}
      <rect width="1600" height="900" fill="url(#${p}luzQuente)" pointer-events="none"/>
      <rect width="1600" height="900" fill="url(#${p}vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);
    void rndR;

    const q = s => svg.querySelector(s), qa = s => Array.from(svg.querySelectorAll(s));
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function poeT(lista, v) { for (const e of lista) poe(e, v); }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; el.setAttribute(nome, v); } }

    /* --- referências --- */
    const R = {
      habitat: q('.cl-habitat'), coala: q('.cl-coala'), sombra: q('.cl-sombra'),
      corpo: q('.cl-corpo'), corpoIn: q('.cl-corpoIn'), barriga: q('.cl-barriga'), costas: q('.cl-costas'), cab: q('.cl-cab'),
      slotLonge: q('.cl-slotLonge'), slotRamo: q('.cl-slotRamo'), slotPernas: q('.cl-slotPernas'), slotBracos: q('.cl-slotBracos'),
      ramoFrente: q('.cl-ramoFrente'), arvTras: q('.cl-arvTras'),
      folhaMao: q('.cl-folhaMao'), folhaMaoIn: q('.cl-folhaMaoIn'),
      nuvens: [0, 1, 2, 3].map(i => q('.cl-nuvem' + i)), aves: [0, 1, 2].map(i => q('.cl-ave' + i)),
      ervas: Array.from({ length: 8 }, (_, i) => q('.cl-erva' + i + ' .cl-ervaIn')),
      copasL: ARV_LONGE.map((a, i) => q('.cl-copaL' + i)),
      ct: CACHOS_TRAS.map((c, i) => q('.cl-ct' + i)), cf: CACHOS_FRENTE.map((c, i) => q('.cl-cf' + i)),
      tiras: [q('.cl-tira0'), q('.cl-tira1')],
      po: Array.from({ length: 12 }, (_, i) => q('.cl-po' + i)),
      fc: Array.from({ length: 8 }, (_, i) => q('.cl-fc' + i)),
      kk: q('.cl-kk'), kkAsa: q('.cl-kkAsa'), kkCab: q('.cl-kkCab'), kkBico: q('.cl-kkBico'), kkBicoI: q('.cl-kkBicoI'),
      cg: q('.cl-cg'), cgIn: q('.cl-cgIn'), cgPerna: q('.cl-cgPerna'), cgCauda: q('.cl-cgCauda'),
      bb: q('.cl-bb'), bbE: q('.cl-bbAsaE'), bbD: q('.cl-bbAsaD')
    };
    // o ramo da frente repete-se dentro do coala (por cima do corpo, por baixo dos braços) quando ele está na árvore
    const ramoCopia = R.ramoFrente.cloneNode(true);
    ramoCopia.setAttribute('class', 'cl-ramoCopia'); ramoCopia.setAttribute('display', 'none');
    R.slotRamo.appendChild(ramoCopia);
    const H = {};
    for (const k of ['orelhaE', 'orelhaD', 'olhoE', 'olhoD', 'bochE', 'bochD', 'sobrE', 'sobrD', 'tufoE', 'tufoD', 'nariz', 'queixo', 'bocaInt', 'testa'])
      H[k] = q('.cl-' + k);
    H.boca = q('.cl-boca'); H.bocaE = q('.cl-bocaE'); H.lingua = q('.cl-lingua');
    H.iris = [q('.cl-irisE'), q('.cl-irisD')];
    H.palp = ['E', 'D'].map(k => ({ s: q('.cl-palpS' + k), i: q('.cl-palpI' + k), r: q('.cl-risca' + k) }));
    const membroEl = MEMBROS.map(m => ({ g: q('.cl-' + m.id), s1: qa(`.cl-${m.id}-s1`), s2: qa(`.cl-${m.id}-s2`), mao: qa(`.cl-${m.id}-mao`) }));

    /* --- estado --- */
    const P = Object.assign({ x: SENT.x, y: SENT.y, psi: SENT.psi, olharX: 0, olharY: 0, cyG: 0, cbG: 0, respA: 1, respF: .22,
      mastX: 0, mastY: 0, somB: 0, somR: 0, salto: 0, folha: 0, folhaL: 1, ramo: 0, longeClip: 0 }, CORPO0, ROSTO0);
    let modo = 'fora', reagindo = false, tempo = 0, vivo = true;
    const fase = { resp: 0 };
    let cabMundo = [0, 0], bocaMundo = [0, 0], orelhaMundo = [[0, 0], [0, 0]], rotCab = 0;
    // patas: posição no mundo (x, y), ângulo da mão/pé (graus no mundo) e encurtamento (fs, para as que apontam para nós)
    const patas = MEMBROS.map(m => ({ m, x: 0, y: 0, ang: 0, fs: 1, seguir: null }));
    const pataDe = id => patas.find(f => f.m.id === id);

    /* --- poses das patas (onde ficam as mãos e os pés em cada pose do corpo) --- */
    function paraMundo(lx, ly, Q = P) {
      const rr = Q.r * RAD, c = Math.cos(rr), s = Math.sin(rr), X = lx * ESC, Y = ly * ESC * (Q.sy || 1);
      return [Q.x + X * c - Y * s, Q.y + X * s + Y * c];
    }
    function ancora(m, Q = P) {
      const lx = m.s * m.W * Math.cos(Q.psi) + m.f * Math.sin(Q.psi);
      return paraMundo(lx, m.ly, Q);
    }
    function posePatas(nome, Q) {
      const o = {};
      if (nome === 'sentado') {
        const sh = 18 * Math.sin(Q.psi);
        o.pE = [Q.x - 50 + sh, CH + 8, 104, .62]; o.pD = [Q.x + 54 + sh, CH + 8, 76, .62];
        o.bE = [Q.x - 44 + sh * 1.4, Q.y - 30, 100, .82]; o.bD = [Q.x + 50 + sh * 1.4, Q.y - 30, 80, .82];
      } else if (nome === 'anda') {
        const dir = Math.sign(Math.sin(Q.psi)) || 1, a = dir > 0 ? 0 : 180;
        for (const f of patas) {
          const perto = -f.m.s * dir > 0;
          const y = CH + (perto ? 6 : -6);
          o[f.m.id] = [Q.x + dir * (f.m.braco ? 112 : 8) + (perto ? 0 : dir * 10), y, a, 1];
        }
      } else if (nome === 'trepa') {
        const xR = y => ARV.x + hwTronco(y) + 2;
        o.bE = [ARV.x - 6, Q.y - 150, -62, .95]; o.bD = [xR(Q.y - 166), Q.y - 166, -40, .9];
        o.pE = [ARV.x - 18, Q.y + 26, -18, .9]; o.pD = [xR(Q.y + 14), Q.y + 14, 0, .85];
      } else if (nome === 'forquilha') {
        o.bE = [1066, 520, -24, .9]; o.bD = [1114, 494, 196, .9];
        o.pE = [984, 600, 120, .75]; o.pD = [1078, 606, 60, .75];
      }
      return o;
    }
    function assentar(nome, Q = P) { const o = posePatas(nome, Q); for (const f of patas) { const v = o[f.m.id]; f.x = v[0]; f.y = v[1]; f.ang = v[2]; f.fs = v[3]; } }
    assentar('sentado');

    /* --- impulsos curtos (orelhas, folhas, ramos) e mola das orelhas --- */
    const impulsos = [];
    const IMP = { twE: 0, twD: 0, copa: 0, salto: 0, cabR: 0 };
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
    // as orelhas atrasam-se quando a cabeça roda ou se desloca (acompanhamento), e voltam com mola
    const molaO = { a: 0, v: 0, ultRot: 0, ultX: 0, ultY: 0 };
    function atualizarMola(dt) {
      const h = Math.min(dt, 34) / 1000;
      const dRot = rotCab - molaO.ultRot, dY = cabMundo[1] - molaO.ultY, dX = cabMundo[0] - molaO.ultX;
      molaO.ultRot = rotCab; molaO.ultX = cabMundo[0]; molaO.ultY = cabMundo[1];
      if (h <= 0) return;
      const forca = -(dRot * 2.2 + dY * .9 + dX * .25) / h * .06;
      molaO.v += (-160 * molaO.a - 9 * molaO.v) * h + limita(forca, -400, 400) * h * 10;
      molaO.a += molaO.v * h;
      molaO.a = limita(molaO.a, -26, 26);
    }

    /* --- desenhar: lê P e as patas e põe as transformações em todas as peças --- */
    let ordemMembros = '';
    const tr = (x, y, r) => `translate(${n(x)},${n(y)}) rotate(${n(r)})`;
    function ik(A, T, L1, L2, polo) {
      const dx = T[0] - A[0], dy = T[1] - A[1], d = Math.hypot(dx, dy) || .01;
      const dd = limita(d, Math.abs(L1 - L2) + 4, L1 + L2 - .5);
      const base = Math.atan2(dy, dx), off = Math.acos(limita((L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd), -1, 1));
      const K1 = [A[0] + L1 * Math.cos(base + off), A[1] + L1 * Math.sin(base + off)], K2 = [A[0] + L1 * Math.cos(base - off), A[1] + L1 * Math.sin(base - off)];
      const M = [(A[0] + T[0]) / 2, (A[1] + T[1]) / 2];
      const K = ((K1[0] - M[0]) * polo[0] + (K1[1] - M[1]) * polo[1]) >= ((K2[0] - M[0]) * polo[0] + (K2[1] - M[1]) * polo[1]) ? K1 : K2;
      const F = [A[0] + dx / d * dd, A[1] + dy / d * dd];
      return { K, F };
    }
    function desenhar() {
      const resp = Math.sin(fase.resp) * P.respA;
      const sp = Math.sin(P.psi), cp = Math.cos(P.psi);
      const yS = P.y - P.salto;
      const Q = { x: P.x, y: yS, r: P.r, sy: P.sy, psi: P.psi };
      poe(R.corpo, `translate(${n(P.x)},${n(yS)}) rotate(${n(P.r)}) scale(${ESC},${n3(ESC * P.sy)})`);
      poe(R.corpoIn, `translate(0,-60) scale(${n3(1 + .008 * resp)},${n3(1 + .016 * resp)}) translate(0,60)`);
      poe(R.barriga, `translate(${n(40 * sp)},0) scale(${n3(.5 + .5 * Math.abs(cp) + .06)},1)`);
      atr(R.costas, 'opacity', n3(Math.abs(sp) * .9));
      poe(R.costas, `translate(${n(-62 * sp)},0)`);

      // patas: IK de 2 segmentos (o cotovelo dobra para trás e para baixo, o joelho para a frente)
      const rr = P.r * RAD, cr = Math.cos(rr), sr = Math.sin(rr);
      const rodar = (x, y) => [x * cr - y * sr, x * sr + y * cr];
      const perto = [], longe = [];
      patas.forEach((f, i) => {
        const m = f.m, e = membroEl[i];
        if (f.seguir) { const v = f.seguir(); f.x = v[0]; f.y = v[1]; if (v[2] != null) f.ang = v[2]; }
        const A = ancora(m, Q);
        const polo = rodar(m.braco ? m.s * cp * .8 - sp : m.s * cp * .9 + sp * 1.2, m.braco ? .55 : -.6);
        const L1 = m.L1 * ESC, L2 = m.L2 * ESC;
        const { K, F } = ik(A, [f.x, f.y], L1, L2, polo);
        const l1 = Math.hypot(K[0] - A[0], K[1] - A[1]), l2 = Math.hypot(F[0] - K[0], F[1] - K[1]);
        poeT(e.s1, `${tr(A[0], A[1], Math.atan2(K[1] - A[1], K[0] - A[0]) / RAD)} scale(${n3(l1 / m.L1)},${ESC})`);
        poeT(e.s2, `${tr(K[0], K[1], Math.atan2(F[1] - K[1], F[0] - K[0]) / RAD)} scale(${n3(l2 / m.L2)},${ESC})`);
        const vira = Math.cos(f.ang * RAD) < -.05 ? -1 : 1;
        poeT(e.mao, `${tr(F[0], F[1], f.ang)} scale(${n3(ESC * f.fs)},${n3(ESC * vira)})`);
        const z = -m.s * m.W * sp + m.f * cp;
        (z > -12 ? perto : longe).push(i);
      });
      const chave = longe.join('') + '|' + perto.join('') + (P.longeClip > .5 ? 't' : '');
      if (chave !== ordemMembros) {
        ordemMembros = chave;
        for (const i of longe) R.slotLonge.appendChild(membroEl[i].g);
        for (const i of perto) (MEMBROS[i].braco ? (P.longeClip > .5 ? R.slotRamo : R.slotBracos) : R.slotPernas).appendChild(membroEl[i].g);
      }
      atr(R.slotLonge, 'clip-path', P.longeClip > .5 ? `url(#${p}clipTronco)` : 'none');

      // cabeça
      const pesc = paraMundo(10 * sp, -150, Q);
      const rotC = P.r * .32 + P.cr + P.somR + IMP.cabR;
      const rc = rotC * RAD;
      const hx = pesc[0] + Math.sin(rc) * 58 * ESC + P.lean, hy = pesc[1] - Math.cos(rc) * 58 * ESC + P.cb * .35;
      cabMundo = [hx, hy]; rotCab = rotC;
      poe(R.cab, `translate(${n(hx)},${n(hy)}) scale(${ESC}) rotate(${n(rotC)})`);
      const yaw = limita(P.psi * .6 + P.cy + P.cyG, -1.25, 1.25);
      const fecho = limita(1 - P.olhos * (1 - piscar), 0, 1);
      const mola = molaO.a;
      const E = estadoCabeca({ yaw, beta: P.cb + P.cbG, oE: P.oE + IMP.twE + mola, oD: P.oD + IMP.twD - mola, orelhas: P.orelhas + P.somB * 8, fecho, feliz: P.feliz, sobr: P.sobr,
        boca: Math.max(P.boca, P.somB), mastX: P.mastX, mastY: P.mastY, olharX: P.olharX, olharY: P.olharY, narizF: P.narizF, sorriso: P.sorriso, olhoEsc: P.olhoEsc });
      for (const k of ['orelhaE', 'orelhaD', 'olhoE', 'olhoD', 'bochE', 'bochD', 'sobrE', 'sobrD', 'tufoE', 'tufoD', 'nariz', 'queixo', 'bocaInt', 'testa']) poe(H[k], E.t[k]);
      for (const k of ['olhoE', 'olhoD', 'bochE', 'bochD', 'sobrE', 'sobrD', 'tufoE', 'tufoD']) atr(H[k], 'opacity', String(E.op[k]));
      atr(H.boca, 'd', E.d.boca); atr(H.boca, 'opacity', E.op.boca);
      atr(H.bocaE, 'ry', String(E.A.bocaRy)); atr(H.bocaE, 'rx', String(E.A.bocaRx));
      atr(H.lingua, 'cy', String(n(E.A.bocaRy * .45))); atr(H.lingua, 'ry', String(n(E.A.bocaRy * .45))); atr(H.lingua, 'rx', String(n(E.A.bocaRx * .6)));
      poeT(H.iris, E.t.iris);
      H.palp.forEach(e => { atr(e.s, 'd', E.d.palpS); atr(e.i, 'd', E.d.palpI); atr(e.r, 'd', E.d.risca); atr(e.r, 'opacity', E.A.abre < .3 ? '1' : '0'); });
      const crc = Math.cos(rc), src = Math.sin(rc);
      const cabParaMundo = (x, y) => [hx + ESC * (x * crc - y * src), hy + ESC * (x * src + y * crc)];
      bocaMundo = cabParaMundo(E.A.boca[0], E.A.boca[1]);
      orelhaMundo = [cabParaMundo(-70 * Math.cos(yaw), -44), cabParaMundo(70 * Math.cos(yaw), -44)];

      // folha na mão
      atr(R.folhaMao, 'display', P.folha > .02 ? 'inline' : 'none');
      if (P.folha > .02) poe(R.folhaMaoIn, `translate(30,0) rotate(-20) scale(${n3(1.45 * P.folha * P.folhaL)},${n3(1.45 * P.folha)})`);
      atr(ramoCopia, 'display', P.ramo > .5 ? 'inline' : 'none');

      // sombra no chão (a luz vem da esquerda: cai um pouco para a direita); some quando o coala sobe
      const alt = limita((CH - 40 - P.y) / 160, 0, 1);
      poe(R.sombra, `translate(${n(P.x + 26)},${CH + 10}) scale(${n(ESC * (120 + 50 * Math.abs(sp)) * (1 - alt * .3))},${n(ESC * 20)})`);
      atr(R.sombra, 'opacity', n3(1 - alt));
    }

    /* --- piscar, olhar --- */
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
      if (u >= 1) { piscar = 0; pisca.f = -1; pisca.t = pisca.duplo ? 130 : aleat(2000, 6000); }
    }
    const olhar = { foco: null, t: 0, ax: 0, ay: 0, rapido: false, cabeca: true };
    function atualizarOlhar(dt) {
      let ax, ay, aY = 0, aB = 0;
      if (olhar.foco) {
        const f = olhar.foco(), dx = f[0] - cabMundo[0], dy = f[1] - cabMundo[1];
        ax = limita(dx / 160, -1, 1); ay = limita(dy / 160, -1, 1);
        if (olhar.cabeca) {
          const base = P.psi * .6 + P.cy;
          aY = limita(Math.asin(limita(dx / 360, -.9, .9)) - base, -1.1, 1.1);
          aB = limita(dy / 240 * 20, -24, 20);
        }
      } else {
        olhar.t -= dt;
        if (olhar.t <= 0) {
          olhar.t = aleat(700, 2600);
          if (Math.random() < .45) { olhar.ax = 0; olhar.ay = 0; } else { olhar.ax = aleat(-.6, .6); olhar.ay = aleat(-.4, .3); }
        }
        ax = olhar.ax; ay = olhar.ay;
      }
      const kO = 1 - Math.exp(-dt / 60), kC = 1 - Math.exp(-dt / (olhar.rapido ? 120 : 300));
      P.olharX += (ax - P.olharX) * kO; P.olharY += (ay - P.olharY) * kO;
      P.cyG += (aY - P.cyG) * kC; P.cbG += (aB - P.cbG) * kC;
    }
    const tiques = { orelha: aleat(2000, 5000) };
    function atualizarTiques(dt) {
      tiques.orelha -= dt;
      if (tiques.orelha <= 0) {
        tiques.orelha = aleat(1800, 5000);
        const k = Math.random() < .5 ? 'twE' : 'twD';
        impulso(k, aleat(10, 16), aleat(220, 320));
        if (Math.random() < .35) impulso(k, aleat(8, 12), 260);
      }
    }

    /* --- tarefas: geradores que avançam com o dt do relógio (uma por faixa) --- */
    const faixas = new Map();
    function lancar(nome, gen, fim) {
      if (!vivo) return;
      if (nome === 'corpo') { olhar.foco = null; olhar.rapido = false; olhar.cabeca = true; for (const f of patas) f.seguir = null; }
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

    /* --- patas: um passo (levanta, vai em arco, pousa) --- */
    function* passo1(f, alvo, ms, alt = 22, dirArco = [0, -1]) {
      f.seguir = null;
      const x0 = f.x, y0 = f.y, a0 = f.ang, s0 = f.fs;
      let a1 = alvo[2] != null ? alvo[2] : a0; while (a1 - a0 > 180) a1 -= 360; while (a1 - a0 < -180) a1 += 360;
      const s1 = alvo[3] != null ? alvo[3] : s0;
      yield* durante(ms, u => {
        const e = eseno(u), h = sino(u) * alt;
        f.x = lerp(x0, alvo[0], e) + dirArco[0] * h; f.y = lerp(y0, alvo[1], e) + dirArco[1] * h; f.ang = lerp(a0, a1, e); f.fs = lerp(s0, s1, e);
      });
    }
    // levar as patas para uma pose, uma a uma (a ordem e os atrasos dizem quais se mexem primeiro)
    function* patasPara(nome, Q, ms, ordem, atraso = 90, alt = 22) {
      const o = posePatas(nome, Q);
      yield* juntos(...ordem.map((id, i) => (function* () { yield* espera(i * atraso); const f = pataDe(id); yield* passo1(f, o[id], ms, alt); })()));
    }
    // corpo e patas ao mesmo tempo para uma pose nova (as patas pousam onde a pose final as quer)
    function* mudarPose(nome, alvoP, ms, ordem, atraso, alt, ease = eio) {
      const Q = Object.assign({}, P, alvoP);
      yield* juntos(tw(alvoP, ms, ease), patasPara(nome, Q, Math.max(160, ms - atraso * (ordem.length - 1)), ordem, atraso, alt));
    }
    function* repor(ms = 420) {
      yield* tw(Object.assign({}, CORPO0, ROSTO0, { mastX: 0, mastY: 0, salto: 0 }), ms);
      P.folha = 0;
      const o = posePatas('sentado', P);
      const fora = patas.filter(f => Math.hypot(f.x - o[f.m.id][0], f.y - o[f.m.id][1]) > 3);
      if (fora.length) yield* juntos(...fora.map((f, i) => (function* () { yield* espera(i * 60); yield* passo1(f, o[f.m.id], 300, 14); })()));
    }

    /* --- andar de quatro (pares diagonais, patas presas ao chão por distância) --- */
    const PASSO = { D: 104, beta: .56, ordem: { pE: 0, bD: .06, pD: .5, bE: .56 } };
    function perfilAndar(u, a = .2) {
      const tot = 1 - a;
      if (u < a) return (u * u / (2 * a)) / tot;
      if (u > 1 - a) { const w = u - (1 - a); return (a / 2 + (1 - 2 * a) + w - w * w / (2 * a)) / tot; }
      return (a / 2 + (u - a)) / tot;
    }
    function pePasso(d, off, total, D = PASSO.D, beta = PASSO.beta) {
      const x = d / D + off, c = Math.floor(x);
      const plantar = dtd => dtd <= 0 ? 0 : Math.min(dtd + beta * D / 2, total);
      if (x - c < beta) return { F: plantar(D * (c - off)), alt: 0 };
      const dLo = D * (c + beta - off), dHi = D * (c + 1 - off);
      const de = plantar(D * (c - off)), para = plantar(dHi), ini = Math.max(dLo, 0);
      if (ini >= total - 2) return { F: de, alt: 0 };
      const qq = limita((d - ini) / Math.max(1, Math.min(dHi, total) - ini), 0, 1);
      return { F: lerp(de, para, eseno(qq)), alt: de === para ? 0 : Math.sin(PI * qq) };
    }
    function* andar(xFim, ms) {
      const x0 = P.x, dir = Math.sign(xFim - x0) || 1, total = Math.abs(xFim - x0), r0 = P.r;
      const base = patas.map(f => [f.x, f.y]);
      for (const f of patas) f.seguir = null;
      yield* durante(ms, u => {
        const d = total * perfilAndar(u);
        P.x = x0 + dir * d;
        const m = Math.min(suave(limita(u / .14, 0, 1)), suave(limita((1 - u) / .14, 0, 1)));
        patas.forEach((f, i) => {
          const r = pePasso(d, PASSO.ordem[f.m.id], total);
          f.x = base[i][0] + dir * r.F; f.y = base[i][1] - r.alt * 20;
        });
        const ph = d / PASSO.D * TAU;
        P.y = ANDA_Y - 4 * Math.cos(2 * ph) * m;
        P.r = r0 + dir * 3 * Math.sin(2 * ph + .6) * m;      // o corpo balança (a garupa sobe e desce)
        P.cr = -dir * 3 * Math.sin(2 * ph + 1) * m;
        P.cb = 6 + 3 * Math.sin(2 * ph + .3) * m;
      });
      P.r = r0;
      // assentar as patas que ficaram fora do sítio
      const o = posePatas('anda', P);
      const fora = patas.filter(f => Math.hypot(f.x - o[f.m.id][0], f.y - o[f.m.id][1]) > 4);
      if (fora.length) yield* juntos(...fora.map((f, i) => (function* () { yield* espera(i * 50); yield* passo1(f, o[f.m.id], 180, 14); })()));
    }

    /* --- trepar: mão de cá, pé de lá, mão de lá, pé de cá; cada pata presa à casca até chegar a vez dela --- */
    const TREPA = { D: 62, beta: .5, ordem: { bE: 0, pD: .25, bD: .5, pE: .75 } };
    function* trepar(yFim, ms, sobe = true) {
      const y0 = P.y, total = Math.abs(yFim - y0), sg = yFim < y0 ? -1 : 1;
      const base = patas.map(f => [f.x, f.y]);
      for (const f of patas) f.seguir = null;
      const xR = y => ARV.x + hwTronco(y) + 2;
      yield* durante(ms, u => {
        const d = total * perfilAndar(u, .16);
        P.y = y0 + sg * d;
        const m = Math.min(suave(limita(u / .12, 0, 1)), suave(limita((1 - u) / .12, 0, 1)));
        patas.forEach((f, i) => {
          // a descer, a ordem é a contrária (pés primeiro)
          const off = sobe ? TREPA.ordem[f.m.id] : (1 - TREPA.ordem[f.m.id] + .25) % 1;
          const r = pePasso(d, off, total, TREPA.D, TREPA.beta);
          f.y = base[i][1] + sg * r.F;
          const longe = f.m.s > 0;
          const xb = longe ? xR(f.y) : base[i][0];
          f.x = xb - r.alt * (longe ? -6 : 14);          // a pata afasta-se um pouco da casca enquanto muda de sítio
        });
        const ph = d / TREPA.D * TAU;
        P.x = SUBIR.x + 4 * Math.sin(ph) * m;
        P.r = 4 * Math.sin(ph + .5) * m;
        P.cr = -3 * Math.sin(ph + 1.2) * m;
      });
      P.r = 0;
      const o = posePatas('trepa', P);
      const fora = patas.filter(f => Math.hypot(f.x - o[f.m.id][0], f.y - o[f.m.id][1]) > 4);
      if (fora.length) yield* juntos(...fora.map((f, i) => (function* () { yield* espera(i * 60); yield* passo1(f, o[f.m.id], 200, 10, [-1, 0]); })()));
    }

    /* --- comportamentos (fora): 7 diferentes, ao acaso a cada 4–9 s, sem repetir --- */
    function* mastigar(ms, forca = 1) {          // maxilar a mastigar devagar (para cima e para baixo, um pouco de lado)
      yield* durante(ms, (u, t) => {
        const k = forca * Math.min(1, t / 200, (ms - t) / 200);
        const f = t / 1000 * TAU * 1.6;
        P.mastX = Math.sin(f) * 2.4 * k; P.mastY = (1 - Math.cos(2 * f)) * 2.2 * k; P.boca = .06 * k + Math.max(0, Math.sin(2 * f)) * .1 * k;
        P.narizF = Math.max(0, Math.sin(2 * f + 1)) * .5 * k;
      });
      P.mastX = 0; P.mastY = 0; P.boca = 0; P.narizF = 0;
    }
    // a mão leva a folha até à boca (a folha fica presa à mão; a mão segue a boca enquanto a cabeça mexe)
    const maoNaBoca = (f, dx = 18, dy = 14) => () => [bocaMundo[0] + dx, bocaMundo[1] + dy, 200];
    function* maoAte(f, alvo, ms, alt = 20) {   // alvo = função que dá a posição; acaba presa a essa função
      const x0 = f.x, y0 = f.y, a0 = f.ang, s0 = f.fs;
      f.seguir = null;
      yield* durante(ms, u => {
        const e = eseno(u), v = alvo(), h = sino(u) * alt;
        let a1 = v[2] != null ? v[2] : a0; while (a1 - a0 > 180) a1 -= 360; while (a1 - a0 < -180) a1 += 360;
        f.x = lerp(x0, v[0], e); f.y = lerp(y0, v[1], e) - h; f.ang = lerp(a0, a1, e); f.fs = lerp(s0, 1, e);
      });
      f.seguir = alvo;
    }
    function* comerFolha() {                 // apanha uma folha do chão, leva-a à boca e mastiga-a devagar
      const m = pataDe('bD');
      olhar.foco = () => [P.x + 110, CH - 6];
      yield* juntos(tw({ cb: 22, cy: .3, lean: 6 }, 500), passo1(m, [P.x + 104, CH - 4, 70, 1], 600, 20));
      P.folhaL = 1; P.folha = 0;
      yield* tw({ folha: 1 }, 180);
      olhar.foco = null;
      yield* juntos(tw({ cb: 2, cy: .05, lean: 0, oE: -6, oD: -6 }, 600), maoAte(m, maoNaBoca(m), 640, 26));
      for (let i = 0; i < 3; i++) {
        yield* tw({ boca: .4, narizF: .5 }, 160);
        yield* juntos(tw({ folhaL: P.folhaL - .25 }, 260), tw({ boca: 0 }, 260));
        yield* mastigar(1100);
      }
      yield* juntos(tw({ folha: 0 }, 200), mastigar(500, .7));
      const o = posePatas('sentado', P);
      yield* juntos(passo1(m, o.bD, 520, 16), tw({ oE: 0, oD: 0 }, 400), mastigar(900, .6));
      P.folhaL = 1;
    }
    function* cocar() {                      // coça a orelha com a pata (olhos fechados de contente)
      const m = pataDe('bE');
      yield* tw({ cr: -14, cy: .2, cb: 6 }, 380);
      const atras = () => [orelhaMundo[0][0] + 2, orelhaMundo[0][1] + 6, -110];
      yield* maoAte(m, atras, 560, 30);
      yield* juntos(tw({ olhos: .15, feliz: .7, sorriso: 1 }, 260),
        durante(1500, (u, t) => { m.seguir = () => { const v = atras(); return [v[0] + 6 * Math.sin(t * .045), v[1] + 7 * Math.sin(t * .09), -120]; }; P.oE = -10 * Math.abs(Math.sin(t * .045)); }));
      m.seguir = null;
      const o = posePatas('sentado', P);
      yield* juntos(passo1(m, o.bE, 520, 16), tw({ cr: 0, cy: 0, cb: CORPO0.cb, olhos: 1, feliz: 0, sorriso: ROSTO0.sorriso, oE: 0 }, 520));
      impulso('twE', 14, 300);
    }
    function* bocejar() {                    // bocejo enorme: cabeça para trás, boca aberta, olhos fechados, braços esticam
      yield* tw({ cb: -6, olhos: .6, oE: -8, oD: -8 }, 300);
      yield* juntos(tw({ cb: -20, cr: 6, boca: 1.25, olhos: 0, sy: 1.04, orelhas: -14, narizF: .8, sobr: 1 }, 700, eio));
      yield* espera(700);
      yield* tw({ boca: .2, cb: 0, cr: 0, sy: 1, orelhas: 0, narizF: 0, sobr: 0 }, 420);
      yield* tw({ boca: .25 }, 120); yield* tw({ boca: 0 }, 120); yield* tw({ boca: .2 }, 120); yield* tw({ boca: 0 }, 140);
      yield* tw({ olhos: 1, oE: 0, oD: 0 }, 420, eseno);
    }
    function* cabecear() {                   // fica com sono: os olhos fecham, a cabeça descai… e acorda de repente
      yield* tw({ olhos: .55, orelhas: 10, respF: .14 }, 700);
      yield* tw({ olhos: .1, cb: 18, cr: -6, orelhas: 16 }, 1500, eseno);
      yield* tw({ olhos: 0, cb: 26, cr: -9 }, 900, eseno);
      yield* espera(700);
      // acorda: a cabeça sobe de repente, as orelhas abanam, pisca duas vezes
      yield* tw({ cb: -2, cr: 2, olhos: 1, olhoEsc: 1.12, orelhas: -6, sobr: .8, respF: .22 }, 160, esai);
      impulso('twE', 18, 300); impulso('twD', 18, 300); impulso('cabR', 5, 400, 'onda');
      yield* espera(200);
      yield* tw({ olhos: .1 }, 90); yield* tw({ olhos: 1 }, 110); yield* tw({ olhos: .1 }, 90); yield* tw({ olhos: 1 }, 120);
      yield* tw({ cb: CORPO0.cb, cr: 0, olhoEsc: 1, orelhas: 0, sobr: 0 }, 600);
    }
    function* sacudir() {                    // sacode a cabeça: as orelhas felpudas abanam e voltam com mola
      yield* tw({ olhos: .4, cb: 4 }, 200);
      yield* durante(700, u => { P.cr = 16 * Math.sin(u * PI * 6) * sino(u); P.cy = .12 * Math.sin(u * PI * 6 + .5) * sino(u); });
      P.cr = 0; P.cy = 0;
      yield* tw({ olhos: 1 }, 300);
      yield* espera(500);
    }
    function* olharCrianca() {               // inclina-se para nós, curioso, cheira e inclina a cabeça
      olhar.foco = () => [800, 700];
      yield* tw({ lean: 8, cb: 12, olhoEsc: 1.08, oE: 10, oD: 10, sobr: .6, cy: -.25 }, 900);
      for (let i = 0; i < 3; i++) { yield* tw({ narizF: 1 }, 140); yield* tw({ narizF: 0 }, 160); }
      yield* tw({ cr: 14, sobr: 1 }, 420);
      yield* tw({ olhos: .06, feliz: .6 }, 360, eseno); yield* espera(180); yield* tw({ olhos: 1, feliz: 0 }, 400, eseno);
      yield* tw({ cr: -10 }, 600);
      impulso('twE', 14, 300); yield* espera(400);
      olhar.foco = null;
      yield* tw({ lean: 0, cr: 0, cb: CORPO0.cb, olhoEsc: 1, oE: 0, oD: 0, sobr: 0, cy: 0 }, 900);
    }
    function* espreguicar() {                // estica os dois braços para cima e o corpo; depois descai
      const bE = pataDe('bE'), bD = pataDe('bD');
      const cimaE = [P.x - 100, P.y - 222, -120, 1], cimaD = [P.x + 106, P.y - 222, -60, 1];
      yield* juntos(tw({ sy: 1.06, cb: -10, olhos: .2, boca: .6, orelhas: -10 }, 800), passo1(bE, cimaE, 760, 10, [-1, 0]), passo1(bD, cimaD, 760, 10, [1, 0]));
      yield* durante(600, u => { bE.y = cimaE[1] - 6 * sino(u); bD.y = cimaD[1] - 6 * sino(u); });
      const o = posePatas('sentado', Object.assign({}, P, { sy: 1 }));
      yield* juntos(tw({ sy: 1, cb: CORPO0.cb, olhos: 1, boca: 0, orelhas: 0 }, 700), passo1(bE, o.bE, 700, 20, [-1, 0]), passo1(bD, o.bD, 700, 20, [1, 0]));
      impulso('twE', 14, 300); impulso('twD', 14, 300);
    }
    const COMPORTAMENTOS = { comerFolha, cocar, bocejar, cabecear, sacudir, olharCrianca, espreguicar };
    let ultimoComp = null;
    function* cicloFora() {
      for (;;) {
        yield* espera(aleat(4000, 9000));
        let nome; do nome = escolhe(Object.keys(COMPORTAMENTOS)); while (nome === ultimoComp);
        ultimoComp = nome;
        yield* COMPORTAMENTOS[nome]();
      }
    }

    /* --- reação ao toque (fora): orelhas para cima, olhos contentes, um saltinho e um abanão --- */
    function* reacaoFora() {
      reagindo = true;
      P.folha = 0; P.folhaL = 1; P.respF = .22;
      const rosto = tw({ orelhas: -16, oE: 0, oD: 0, feliz: 1, olhos: 1, sobr: .8, sorriso: 1, boca: 0, olhoEsc: 1.08, narizF: 0, mastX: 0, mastY: 0 }, 110, esai);
      const corpo = (function* () {
        // as mãos voltam aos joelhos (se estavam noutro sítio) enquanto se encolhe para saltar
        const o = posePatas('sentado', Object.assign({}, P, CORPO0));
        const fora = patas.filter(f => f.seguir || Math.hypot(f.x - o[f.m.id][0], f.y - o[f.m.id][1]) > 3);
        for (const f of fora) f.seguir = null;
        yield* juntos(tw(Object.assign({}, CORPO0, { sy: .94 }), 200, esai), ...fora.map(f => passo1(f, o[f.m.id], 200, 10)));
        yield* tw({ salto: 18, sy: 1.05 }, 170, esai);
        impulso('twE', 16, 400, 'onda'); impulso('twD', 16, 400, 'onda');
        yield* tw({ salto: 0, sy: .95 }, 170, eentra);
        yield* tw({ sy: 1 }, 160);
        yield* durante(700, u => { P.cr = 10 * Math.sin(u * PI * 2) * (1 - u * .6); P.cy = .1 * Math.sin(u * PI * 2); });
        yield* tw({ cr: 0, cy: 0 }, 200);
      })();
      yield* juntos(rosto, corpo);
      yield* espera(200);
      reagindo = false;
      yield* tw(Object.assign({}, ROSTO0, CORPO0), 500);
    }

    /* --- eucalipto: cachos a abanar, folhas a cair, tiras de casca --- */
    const folhas = R.fc.map(el => ({ el, vivo: false, x: 0, y: 0, vx: 0, vy: 0, r: 0, t: 0, chao: 0, fase: 0 }));
    function largarFolhas(x, y, k) {
      for (let i = 0; i < k; i++) {
        const f = folhas.find(f2 => !f2.vivo); if (!f) return;
        Object.assign(f, { vivo: true, x: x + aleat(-20, 20), y: y + aleat(-10, 10), vx: aleat(-.02, .03), vy: aleat(.02, .05), r: aleat(0, 360), t: 0, chao: aleat(790, 830), fase: aleat(0, 6) });
        atr(f.el, 'display', 'inline'); atr(f.el, 'opacity', '1');
      }
    }
    function animarFolhas(dt) {
      for (const f of folhas) {
        if (!f.vivo) continue;
        f.t += dt;
        if (f.y < f.chao) {
          f.vy = Math.min(.07, f.vy + dt * .00004);
          f.x += (f.vx + Math.sin(f.t * .004 + f.fase) * .05) * dt; f.y += f.vy * dt; f.r += dt * .1;
          if (f.y >= f.chao) { f.y = f.chao; f.t = 0; f.r = 0; }
          poe(f.el, `translate(${n(f.x)},${n(f.y)}) rotate(${n(f.r + 50 * Math.sin(f.t * .006))}) scale(1,${n3(.6 + .4 * Math.abs(Math.cos(f.t * .005)))})`);
        } else {
          atr(f.el, 'opacity', n3(limita(1 - f.t / 1500, 0, 1)));
          poe(f.el, `translate(${n(f.x)},${n(f.y)}) rotate(90) scale(1,.6)`);
          if (f.t > 1500) { f.vivo = false; atr(f.el, 'display', 'none'); }
        }
      }
    }

    /* --- no eucalipto: pose da forquilha, comer uma folha do cacho, dormitar --- */
    function* comerNaArvore() {              // larga o ramo com a mão de lá, apanha uma folha do cacho de cima e mastiga
      const m = pataDe('bD');
      const cacho = [1150, 404];
      olhar.foco = () => cacho;
      yield* juntos(tw({ cy: .35, cb: -6 }, 400), passo1(m, [cacho[0], cacho[1], -60, 1], 640, 20, [1, 0]));
      impulso('copa', 1, 900, 'mola');
      P.folhaL = 1;
      yield* tw({ folha: 1 }, 160);
      olhar.foco = null;
      yield* juntos(tw({ cy: .05, cb: 4 }, 500), maoAte(m, maoNaBoca(m, 20, 16), 560, 16));
      for (let i = 0; i < 3; i++) {
        yield* tw({ boca: .4, narizF: .5 }, 160);
        yield* juntos(tw({ folhaL: P.folhaL - .25 }, 260), tw({ boca: 0 }, 260));
        yield* mastigar(1000);
      }
      yield* tw({ folha: 0 }, 200);
      const o = posePatas('forquilha', P);
      yield* juntos(passo1(m, o.bD, 560, 18), mastigar(1000, .6), tw({ cy: 0, cb: CORPO0.cb }, 500));
      P.folhaL = 1;
    }
    function* dormitar() {                   // encosta a cabeça ao ramo e dormita (respira devagar, orelha a tremer)
      yield* tw({ olhos: .4, orelhas: 12, respF: .14, cr: -12, cb: 16, lean: -6 }, 1200, eseno);
      yield* tw({ olhos: 0, feliz: .3 }, 900, eseno);
      for (let i = 0; i < 3; i++) { yield* espera(aleat(700, 1300)); impulso(Math.random() < .5 ? 'twE' : 'twD', 12, 260); }
      yield* tw({ olhos: .7, feliz: 0, orelhas: 0, respF: .22, cr: 0, cb: CORPO0.cb, lean: 0 }, 700, eseno);
      yield* tw({ olhos: .1 }, 100); yield* tw({ olhos: 1 }, 140);
    }
    function* olharDaArvore() {              // espreita para baixo, para nós, e inclina a cabeça
      olhar.foco = () => [760, 820];
      yield* tw({ cb: 18, oE: 8, oD: 8, sobr: .5 }, 700);
      yield* tw({ cr: 12 }, 400);
      yield* tw({ olhos: .1, feliz: .6 }, 300, eseno); yield* tw({ olhos: 1, feliz: 0 }, 300, eseno);
      yield* espera(600);
      olhar.foco = null;
      yield* tw({ cr: 0, cb: CORPO0.cb, oE: 0, oD: 0, sobr: 0 }, 700);
    }
    function* cicloDentro() {
      let ult = null;
      for (;;) {
        yield* espera(aleat(1200, 2600));
        const lista = [comerNaArvore, dormitar, olharDaArvore, sacudir].filter(f => f !== ult);
        ult = escolhe(lista);
        yield* ult();
      }
    }
    function* reacaoDentro() {               // abraça o ramo com força, olhos contentes, orelhas a abanar (sem sair)
      P.folha = 0; P.folhaL = 1; P.respF = .22;
      const m = pataDe('bD'), o = posePatas('forquilha', P);
      const volta = m.seguir || Math.hypot(m.x - o.bD[0], m.y - o.bD[1]) > 3 ? passo1(m, o.bD, 220, 12) : espera(1);
      yield* juntos(tw({ orelhas: -16, feliz: 1, olhos: 1, sobr: .8, sorriso: 1, boca: 0, olhoEsc: 1.08, lean: 0, cb: 0, cr: 0 }, 110, esai), volta);
      impulso('copa', 1.4, 900, 'mola');
      yield* tw({ salto: 6, sy: 1.04 }, 160, esai);
      impulso('twE', 16, 400, 'onda'); impulso('twD', 16, 400, 'onda');
      yield* tw({ salto: 0, sy: 1 }, 200, eentra);
      yield* durante(800, u => { P.cr = 9 * Math.sin(u * PI * 2) * (1 - u * .5); });
      yield* tw(Object.assign({}, ROSTO0, { cr: 0, cy: 0, cb: CORPO0.cb, sy: 1 }), 500);
    }

    /* --- ida ao eucalipto: vira-se, põe-se de quatro, anda, trepa e instala-se na forquilha --- */
    function* idaArvore() {
      modo = 'indo'; reagindo = false;
      P.folha = 0; P.folhaL = 1; P.respF = .22; P.salto = 0;
      olhar.foco = () => [ARV.x, 560]; olhar.rapido = true;
      yield* tw(Object.assign({}, ROSTO0, { cy: .25, cb: 0, oE: -6, oD: -6, lean: 0, cr: 0, sy: 1 }), 160, esai);
      // inclina-se para a frente e põe-se de quatro (as mãos pousam à frente, os pés vêm para baixo da anca)
      yield* mudarPose('anda', { x: SENT.x + 40, y: ANDA_Y, r: 70, psi: 1.3, cb: 6 }, 480, ['bD', 'bE', 'pE', 'pD'], 60, 26);
      olhar.foco = () => [ARV.x, 600];
      olhar.rapido = false;
      yield* andar(SUBIR.x - 80, 740);
      // levanta-se contra o tronco: as mãos agarram a casca lá em cima, os pés o pé do tronco
      P.longeClip = 1;
      yield* mudarPose('trepa', { x: SUBIR.x, y: SUBIR.y0, r: 0, psi: 1.3, cb: -4 }, 400, ['bE', 'bD', 'pD', 'pE'], 50, 20);
      olhar.foco = () => [ARV.x - 20, 380];
      yield* trepar(SUBIR.y1, 840, true);
      // passa para a forquilha: vira-se para nós, senta-se no meio dos dois ramos e abraça o da frente
      P.ramo = 1;
      olhar.foco = null;
      yield* mudarPose('forquilha', { x: FORQ.x, y: FORQ.y, r: FORQ.r, psi: FORQ.psi, cb: 4 }, 560, ['pE', 'bD', 'bE', 'pD'], 60, 24);
      P.longeClip = 0;
      impulso('copa', 2, 1200, 'mola');
      largarFolhas(1130, 440, 3);
      impulso('twE', 14, 400, 'onda'); impulso('twD', 14, 400, 'onda');
      yield* tw({ sy: .96 }, 100); yield* tw({ sy: 1 }, 160);
      modo = 'dentro';
    }
    /* --- volta: espreguiça-se, desce de costas (a cabeça para cima), põe-se de quatro e volta ao tronco caído --- */
    function* voltaArvore() {
      modo = 'voltando'; reagindo = false;
      P.folha = 0; P.folhaL = 1; P.respF = .22;
      const bE = pataDe('bE'), bD = pataDe('bD');
      yield* juntos(tw(Object.assign({}, ROSTO0, { cb: -8, sy: 1.05, olhos: .3, boca: .5, cr: 0, cy: 0, lean: 0, salto: 0 }), 300, eio),
        passo1(bD, [bD.x + 6, bD.y - 40, -90, 1], 280, 6, [1, 0]));
      P.longeClip = 1;
      yield* mudarPose('trepa', { x: SUBIR.x, y: SUBIR.y1, r: 0, psi: 1.3, cb: 10, sy: 1, olhos: 1, boca: 0 }, 340, ['pD', 'pE', 'bD', 'bE'], 40, 16);
      P.ramo = 0;
      void bE;
      olhar.foco = () => [700, 760];
      yield* trepar(SUBIR.y0, 540, false);
      olhar.foco = () => [SENT.x - 100, 700]; olhar.rapido = true;
      // larga o tronco e põe-se de quatro, virado para a esquerda (vira-se de frente pelo caminho)
      yield* mudarPose('anda', { x: SUBIR.x - 30, y: ANDA_Y, r: -70, psi: -1.3, cb: 6 }, 380, ['bE', 'bD', 'pD', 'pE'], 40, 26);
      P.longeClip = 0;
      olhar.rapido = false;
      yield* andar(SENT.x + 40, 500);
      olhar.foco = null;
      yield* mudarPose('sentado', Object.assign({}, CORPO0, { x: SENT.x, y: SENT.y, psi: SENT.psi }), 320, ['bE', 'bD', 'pE', 'pD'], 30, 18);
      impulso('twE', 14, 400, 'onda'); impulso('twD', 14, 400, 'onda');
      modo = 'fora';
    }

    /* --- som: a boca abre uma vez por sílaba, a cabeça sobe um pouco, as orelhas acompanham --- */
    function* somBoca(ms, silabas) {
      let lista = Array.isArray(silabas) && silabas.length ? silabas : null;
      if (!lista) { const k = Math.max(1, Math.round(ms / 450)), d = ms / 1000 / k; lista = Array.from({ length: k }, (_, i) => [i * d, d * .8]); }
      let t = 0;
      for (const [a, d] of lista) {
        if (a > t) yield* espera((a - t) * 1000);
        yield* durante(limita(d * 1000, 160, 2000), u => { P.somB = .85 * sino(u); P.somR = -5 * Math.sin(u * PI); P.narizF = .6 * sino(u); });
        t = a + d;
      }
      P.somB = 0; P.somR = 0; P.narizF = 0;
    }

    /* --- cenário vivo e acontecimentos raros --- */
    const PO = Array.from({ length: 12 }, (_, i) => ({ x: aleat(150, 1450), y: aleat(150, 700), f: aleat(0, 6), v: aleat(.4, 1) }));
    function animarCena(dt) {
      const t = tempo / 1000;
      R.nuvens.forEach((g, i) => {
        const v = [6, 4, 5.5, 3.2][i], y = [110, 190, 250, 150][i], x0 = [360, 900, 1280, 620][i];
        poe(g, `translate(${n(-260 + ((x0 + 260 + t * v * calma) % 2120))},${y})`);
      });
      R.aves.forEach((g, i) => {
        const a = t * (.12 + i * .025) * calma + i * 2.1;
        poe(g, `translate(${n(560 + Math.cos(a) * (90 + i * 22))},${n(330 + Math.sin(a) * 16 + i * 12)}) scale(${n3(.8 + .3 * Math.sin(t * 3 + i))},${n3(.7 + .5 * Math.abs(Math.sin(t * 2.4 + i)))})`);
      });
      const rajada = .6 + .4 * Math.sin(t * .33);
      R.ervas.forEach((g, i) => poe(g, `rotate(${n3((2.2 * Math.sin(t * 1.1 + i * .9) + 1.2 * Math.sin(t * 2.3 + i * 2)) * rajada * calma)})`));
      R.copasL.forEach((g, i) => { const a = ARV_LONGE[i]; poe(g, `rotate(${n3((.6 * Math.sin(t * .6 + i) + .3 * Math.sin(t * 1.3 + i * 2)) * rajada * calma)},${a.x},${a.base - a.h + 120})`); });
      // cachos do eucalipto: cada um abana à volta do sítio onde se prende (com o abanão quando o coala mexe na árvore)
      const ab = IMP.copa;
      R.ct.forEach((g, i) => { const [x, y] = CACHOS_TRAS[i]; poe(g, `rotate(${n3((2.2 * Math.sin(t * .8 + i * 1.3) + 1.2 * Math.sin(t * 1.7 + i)) * rajada * calma + ab * 3 * (i % 2 ? 1 : -1))},${x},${y})`); });
      R.cf.forEach((g, i) => { const [x, y] = CACHOS_FRENTE[i]; poe(g, `rotate(${n3((2.6 * Math.sin(t * .9 + i * 2.1) + 1.2 * Math.sin(t * 1.9 + i)) * rajada * calma + ab * 4)},${x},${y})`); });
      poe(R.tiras[0], `rotate(${n3((3 * Math.sin(t * 1.2) + 1.5 * Math.sin(t * 2.7)) * rajada * calma + ab * 2)},1008,614)`);
      poe(R.tiras[1], `rotate(${n3((2.4 * Math.sin(t * 1.4 + 1) + 1.2 * Math.sin(t * 3.1)) * rajada * calma)},1076,702)`);
      // pozinho dourado a flutuar na luz do sol
      PO.forEach((o, i) => {
        o.y -= dt * .006 * o.v * calma; o.x += Math.sin(t * .5 + o.f) * .05 * calma;
        if (o.y < 120) { o.y = 720; o.x = aleat(150, 1450); }
        atr(R.po[i], 'opacity', n3(.35 + .35 * Math.sin(t * 1.3 + o.f)));
        poe(R.po[i], `translate(${n(o.x + 14 * Math.sin(t * .4 + o.f))},${n(o.y)})`);
      });
    }
    const eventos = { prox: aleat(9000, 15000), ultimo: null };
    function iniciarEvento(tipo) {
      const ev = { tipo, x: -100, y: -100, vivo: true };
      ev.pos = () => [ev.x, ev.y];
      const gen = { guardaRios: evGuardaRios, canguru: evCanguru, borboleta: evBorboleta }[tipo](ev);
      lancar('evento', gen, () => { ev.vivo = false; });
      if (modo === 'fora' && !reagindo) lancar('corpo', observar(ev), () => lancar('corpo', cicloFora()));
      else if (modo === 'dentro') lancar('corpo', observarDentro(ev), () => lancar('corpo', cicloDentro()));
    }
    function atualizarEventos(dt) {
      if (faixas.has('evento')) return;
      eventos.prox -= dt;
      if (eventos.prox > 0) return;
      if (modo !== 'fora' && modo !== 'dentro') { eventos.prox = 3000; return; }
      eventos.prox = aleat(15000, 40000);
      const lista = ['guardaRios', 'canguru', 'borboleta'];
      let tipo; do tipo = escolhe(lista); while (tipo === eventos.ultimo);
      eventos.ultimo = tipo;
      iniciarEvento(tipo);
    }
    function* observar(ev) {
      reagindo = false;
      yield* repor(360);
      olhar.foco = ev.pos;
      yield* tw({ oE: -10, oD: -10, olhoEsc: 1.08, sobr: .5 }, 260, esai);
      let t = 0, prox = 900;
      while (ev.vivo && t < 14000) {
        t += yield;
        if (t > prox) { prox = t + aleat(1000, 1900); impulso(Math.random() < .5 ? 'twE' : 'twD', 14, 280); }
      }
      olhar.foco = null;
      yield* tw({ oE: 0, oD: 0, olhoEsc: 1, olhos: 1, sobr: 0 }, 500);
    }
    function* observarDentro(ev) {
      P.folha = 0; P.folhaL = 1;
      const m = pataDe('bD'), o = posePatas('forquilha', P);
      yield* juntos(tw(Object.assign({}, ROSTO0, { cr: 0, cy: 0, cb: CORPO0.cb, lean: 0, respF: .22 }), 360), m.seguir || Math.hypot(m.x - o.bD[0], m.y - o.bD[1]) > 3 ? passo1(m, o.bD, 300, 12) : espera(1));
      olhar.foco = ev.pos;
      let t = 0;
      while (ev.vivo && t < 14000) t += yield;
      olhar.foco = null;
    }
    function* evGuardaRios(ev) {             // um guarda-rios pousa no ramo da direita e «ri-se» (bico aberto, cabeça para trás)
      const g = R.kk, pouso = [1262, 214];
      atr(g, 'display', 'inline');
      let dirA = -1;
      const poeAve = (bate, tt) => {
        poe(g, `translate(${n(ev.x)},${n(ev.y)}) scale(${dirA * 1.1},1.1)`);
        poe(R.kkAsa, bate ? `rotate(${n(-40 * Math.sin(tt * .05))},-6,-10) scale(1,${n3(.6 + .4 * Math.abs(Math.cos(tt * .05)))})` : 'rotate(0)');
      };
      yield* durante(2600, (u, tt) => { const e = esai(u); ev.x = lerp(1680, pouso[0], e); ev.y = lerp(80, pouso[1], e) - 60 * sino(u); poeAve(u < .92, tt); });
      impulso('copa', .6, 800, 'mola');
      for (let k = 0; k < 2; k++) {
        yield* espera(500);
        yield* durante(1800, (u, tt) => {
          poe(R.kkCab, `rotate(${n(-24 * sino(u))},10,-14)`);
          const ab = Math.abs(Math.sin(tt * .03)) * sino(u);
          poe(R.kkBico, `rotate(${n(-14 * ab)},22,-18)`); poe(R.kkBicoI, `rotate(${n(10 * ab)},22,-15)`);
          poe(R.kkAsa, `rotate(${n(-8 * ab)},-6,-10)`);
        });
      }
      yield* espera(700);
      dirA = 1;
      yield* durante(1800, (u, tt) => { ev.x = lerp(pouso[0], 1700, eentra(u)); ev.y = lerp(pouso[1], 40, u) - 40 * sino(u); poeAve(true, tt); });
      atr(g, 'display', 'none');
    }
    function* evCanguru(ev) {                // um canguru passa aos saltos ao longe
      const g = R.cg;
      atr(g, 'display', 'inline');
      yield* durante(9000, (u, tt) => {
        const x = lerp(1660, -60, u), salto = Math.abs(Math.sin(tt * .0042));
        ev.x = x; ev.y = 610 - salto * 34;
        poe(g, `translate(${n(x)},${n(ev.y)}) scale(-1.05,1.05)`);
        poe(R.cgPerna, `rotate(${n(-30 * salto)},-6,-4)`); poe(R.cgCauda, `rotate(${n(12 * salto)},-14,-8)`);
      });
      atr(g, 'display', 'none');
    }
    function* evBorboleta(ev) {              // uma borboleta azul dá voltas e pousa no nariz do coala (que fica vesgo e espirra)
      const g = R.bb;
      atr(g, 'display', 'inline');
      const asas = (tt, rapido) => { const k = rapido ? Math.abs(Math.cos(tt * .03)) : .35 + .65 * Math.abs(Math.cos(tt * .004)); poe(R.bbE, `scale(${n3(.15 + .85 * k)},1)`); poe(R.bbD, `scale(${n3(.15 + .85 * k)},1)`); };
      const nariz = () => [cabMundo[0] + 40 * Math.sin(P.psi * .6 + P.cy + P.cyG), cabMundo[1] - 4];
      const ini = [260, 300];
      yield* durante(4200, (u, tt) => {
        const c = cabMundo, pts = [ini, [420, 260], [c[0] - 160, c[1] - 120], [c[0] + 20, c[1] - 170], [c[0] + 140, c[1] - 60], [c[0] + 30, c[1] - 110]];
        const ns = pts.length - 1, s = Math.min(ns - 1e-6, u * ns), i = Math.floor(s), f = s - i;
        const a = pts[Math.max(0, i - 1)], b = pts[i], c2 = pts[i + 1], d = pts[Math.min(ns, i + 2)];
        const cm = (A, B, C, D) => .5 * (2 * B + (-A + C) * f + (2 * A - 5 * B + 4 * C - D) * f * f + (-A + 3 * B - 3 * C + D) * f * f * f);
        ev.x = cm(a[0], b[0], c2[0], d[0]) + 8 * Math.sin(tt * .01); ev.y = cm(a[1], b[1], c2[1], d[1]) + 10 * Math.sin(tt * .013);
        poe(g, `translate(${n(ev.x)},${n(ev.y)}) rotate(${n(14 * Math.sin(tt * .006))})`); asas(tt, true);
      });
      const pousar = modo === 'fora' && !reagindo && faixas.has('corpo');
      if (pousar) {
        const de = [ev.x, ev.y];
        yield* durante(700, (u, tt) => { const a = nariz(); ev.x = lerp(de[0], a[0], eseno(u)); ev.y = lerp(de[1], a[1] - 22, eseno(u)) - 10 * sino(u); poe(g, `translate(${n(ev.x)},${n(ev.y)})`); asas(tt, true); });
        yield* durante(2200, (u, tt) => { const a = nariz(); ev.x = a[0]; ev.y = a[1] - 22; poe(g, `translate(${n(ev.x)},${n(ev.y)})`); asas(tt, false); P.olharX = -.1 * Math.sin(P.psi) ; P.olharY = .6; if (modo === 'fora' && !reagindo) { P.narizF = .4 + .4 * Math.sin(tt * .02); P.sobr = 1; } });
        // atchim!
        if (modo === 'fora' && !reagindo) {
          P.sobr = 0;
          impulso('cabR', 10, 400, 'onda'); impulso('twE', 20, 400, 'onda'); impulso('twD', 20, 400, 'onda');
          P.olhos = 0; P.boca = .5; P.narizF = 1;
        }
        const de2 = [ev.x, ev.y];
        yield* durante(2400, (u, tt) => {
          if (u > .15 && modo === 'fora' && !reagindo && P.olhos < 1) { P.olhos = Math.min(1, P.olhos + .06); P.boca = Math.max(0, P.boca - .04); P.narizF = Math.max(0, P.narizF - .04); }
          ev.x = lerp(de2[0], de2[0] - 600, eentra(u)) + 30 * Math.sin(u * 9); ev.y = lerp(de2[1], 60, u); poe(g, `translate(${n(ev.x)},${n(ev.y)})`); asas(tt, true);
        });
      } else {
        const de2 = [ev.x, ev.y];
        yield* durante(2400, (u, tt) => { ev.x = lerp(de2[0], de2[0] - 600, eentra(u)) + 30 * Math.sin(u * 9); ev.y = lerp(de2[1], 60, u); poe(g, `translate(${n(ev.x)},${n(ev.y)})`); asas(tt, true); });
      }
      atr(g, 'display', 'none');
    }

    /* --- relógio único --- */
    let erroMostrado = false;
    function passo(dt) {
      if (!vivo) return;
      try {
        dt = Math.min(dt, 50);
        tempo += dt;
        fase.resp += dt / 1000 * TAU * P.respF;
        atualizarImpulsos(dt);
        atualizarPiscar(dt);
        atualizarTiques(dt);
        for (const nome of Array.from(faixas.keys())) avancar(nome, dt);
        atualizarOlhar(dt);
        atualizarEventos(dt);
        animarCena(dt);
        animarFolhas(dt);
        desenhar();
        atualizarMola(dt);
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    lancar('corpo', cicloFora());
    desenhar();
    molaO.ultRot = rotCab; molaO.ultX = cabMundo[0]; molaO.ultY = cabMundo[1];

    return {
      animal: R.coala,
      habitat: R.habitat,
      reagir() {
        if (!vivo) return;
        if (modo === 'fora') lancar('corpo', reacaoFora(), () => { reagindo = false; lancar('corpo', cicloFora()); });
        else if (modo === 'dentro') lancar('corpo', reacaoDentro(), () => lancar('corpo', cicloDentro()));
        else { impulso('twE', 12, 300); impulso('twD', 12, 300); }
      },
      fazerSom(ms, silabas) {
        if (!vivo) return;
        lancar('boca', somBoca(limita(ms || 800, 200, 3000), silabas));
        impulso('twE', 12, 300); impulso('twD', 12, 300);
      },
      irAoHabitat() {
        return new Promise(res => {
          if (!vivo || modo !== 'fora') { res(); return; }
          lancar('corpo', idaArvore(), () => { res(); lancar('corpo', cicloDentro()); });
        });
      },
      voltar() {
        return new Promise(res => {
          if (!vivo || modo !== 'dentro') { res(); return; }
          lancar('corpo', voltaArvore(), () => { res(); lancar('corpo', cicloFora()); });
        });
      },
      destruir() {
        vivo = false;
        faixas.clear();
        impulsos.length = 0;
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola (modo de desenvolvimento)
      _teste: { P, patas, modo: () => modo, evento: iniciarEvento, comportamento: nome => lancar('corpo', (COMPORTAMENTOS[nome] || { comerNaArvore, dormitar, olharDaArvore }[nome])(), () => lancar('corpo', modo === 'dentro' ? cicloDentro() : cicloFora())), desenhar, cab: () => cabMundo, boca: () => bocaMundo }
    };
  }

  return { icone: iconeSVG(), montar };
})();
