/* Gato — sala de estar com luz de fim de tarde, gato malhado laranja articulado e cesto de vime.
   Contrato e regras: REGRAS-ANIMAIS.md. Tudo é desenhado aqui em SVG e animado só a partir de ajudas.relogio.
   Organização:
     1) utilidades (matemática, easing)
     2) desenho do gato (cabeça de frente, corpo de perfil, patas em dois passes: contorno + enchimento)
     3) desenho do cenário (parede, janela com vista, cortinas, relógio, estante, soalho, tapete, luz) e do cesto
     4) ícone do menu
     5) montar(): rig, poses (dados), tarefas (geradores) no relógio único, comportamentos, idas e voltas ao cesto */
'use strict';
MODULOS.gato = (() => {
  const NS = 'http://www.w3.org/2000/svg';

  /* ================= 1) Utilidades ================= */
  const PI = Math.PI, RAD = PI / 180;
  const lerp = (a, b, t) => a + (b - a) * t;
  const limita = (v, a, b) => v < a ? a : v > b ? b : v;
  const n = v => Math.round(v * 10) / 10;                 // número curto para atributos
  const n3 = v => Math.round(v * 1000) / 1000;
  const suave = t => t * t * (3 - 2 * t);
  const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const esai = t => 1 - Math.pow(1 - t, 3);
  const eentra = t => t * t * t;
  const eseno = t => -(Math.cos(PI * t) - 1) / 2;
  const sino = t => Math.sin(PI * limita(t, 0, 1));       // 0 → 1 → 0
  const aleat = (a, b) => a + Math.random() * (b - a);
  const escolhe = v => v[Math.random() * v.length | 0];
  function semente(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function catmull(pts, u) {
    const ns = pts.length - 1, s = Math.min(ns - 1e-6, Math.max(0, u) * ns), i = Math.floor(s), t = s - i;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(ns, i + 2)];
    const f = (a, b, c, d) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
    return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
  }

  /* ================= 2) Desenho do gato ================= */
  const COR = { cont: '#6B391C', risca: '#C05E28', riscaF: '#A9521F', sombraBranca: '#D6BCA2' };
  const ESC = 0.9;                       // escala do gato no cenário
  const NC = 8, LC = 30;                 // cauda: segmentos e comprimento de cada um
  const LARG_CAUDA = [31, 30, 29, 28, 27, 27, 27, 29];
  const BR = 84, AB = 78;                // pata da frente: braço e antebraço
  const CXA = 62, CN = 55, MT = 66;      // pata de trás: coxa, canela, metatarso

  function defsGato(p) {
    return `
    <radialGradient id="${p}pelo" cx=".62" cy=".22" r=".85"><stop offset="0" stop-color="#FDCB86"/><stop offset=".5" stop-color="#F3A44F"/><stop offset="1" stop-color="#D2752F"/></radialGradient>
    <linearGradient id="${p}pelo-l" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#FCC37C"/><stop offset=".6" stop-color="#F09D49"/><stop offset="1" stop-color="#D47A33"/></linearGradient>
    <linearGradient id="${p}pelo-esc" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#E4914A"/><stop offset="1" stop-color="#B9672B"/></linearGradient>
    <radialGradient id="${p}pelo-cab" gradientUnits="userSpaceOnUse" cx="-30" cy="-42" r="140"><stop offset="0" stop-color="#FFD597"/><stop offset=".5" stop-color="#F5AA55"/><stop offset="1" stop-color="#D97C34"/></radialGradient>
    <radialGradient id="${p}palpE" gradientUnits="userSpaceOnUse" cx="-30" cy="-42" r="140" gradientTransform="rotate(-8) translate(37,13)"><stop offset="0" stop-color="#FFD597"/><stop offset=".5" stop-color="#F5AA55"/><stop offset="1" stop-color="#D97C34"/></radialGradient>
    <radialGradient id="${p}palpD" gradientUnits="userSpaceOnUse" cx="-30" cy="-42" r="140" gradientTransform="rotate(8) translate(-37,13)"><stop offset="0" stop-color="#FFD597"/><stop offset=".5" stop-color="#F5AA55"/><stop offset="1" stop-color="#D97C34"/></radialGradient>
    <linearGradient id="${p}cauda" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCC47E"/><stop offset=".55" stop-color="#F09D49"/><stop offset="1" stop-color="#CF732F"/></linearGradient>
    <radialGradient id="${p}branco" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".65" stop-color="#FFF6EA"/><stop offset="1" stop-color="#E9D5BF"/></radialGradient>
    <radialGradient id="${p}iris" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#EEF7A0"/><stop offset=".3" stop-color="#C2E265"/><stop offset=".72" stop-color="#78B83A"/><stop offset="1" stop-color="#3D7E22"/></radialGradient>
    <radialGradient id="${p}pupila" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#3B2617"/><stop offset="1" stop-color="#110905"/></radialGradient>
    <linearGradient id="${p}orelha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E27F96"/><stop offset="1" stop-color="#F9C6CF"/></linearGradient>
    <radialGradient id="${p}nariz" cx=".4" cy=".3" r=".75"><stop offset="0" stop-color="#FBB3C0"/><stop offset="1" stop-color="#D96C82"/></radialGradient>
    <radialGradient id="${p}boca" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#9A3442"/><stop offset="1" stop-color="#561420"/></radialGradient>
    <linearGradient id="${p}lingua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7A2B1"/><stop offset="1" stop-color="#E06C83"/></linearGradient>
    <radialGradient id="${p}sombra"><stop offset="0" stop-color="#3A2010" stop-opacity=".42"/><stop offset=".6" stop-color="#3A2010" stop-opacity=".2"/><stop offset="1" stop-color="#3A2010" stop-opacity="0"/></radialGradient>
    ${['braco', 'antebraco', 'coxa', 'canela', 'metatarso'].map(f => `<clipPath id="${p}clip-${f}"><path d="${SEG[f]}"/></clipPath>`).join('')}
    <clipPath id="${p}clip-tronco"><path d="${TRONCO}"/></clipPath>`;
  }

  /* --- Cabeça (vista de frente; nunca é espelhada: vira-se com «yaw», deslocando as feições) --- */
  const CAB = 'M-80,-26 C-80,-66 -44,-84 0,-84 C44,-84 80,-66 80,-26 C82,-8 92,4 104,14 C97,19 93,21 90,23 C98,29 101,35 99,42 C91,42 85,42 80,44 C70,66 40,78 0,78 C-40,78 -70,66 -80,44 C-85,42 -91,42 -99,42 C-101,35 -98,29 -90,23 C-93,21 -97,19 -104,14 C-92,4 -82,-8 -80,-26 Z';
  const OLHO = 'M-26,0 C-26,-15 -14,-25 0,-25 C14,-25 26,-15 26,0 C26,15 14,24 0,24 C-14,24 -26,15 -26,0 Z';
  const ORELHA = 'M-36,10 C-38,-20 -22,-58 -5,-80 C-2,-85 3,-85 6,-80 C24,-56 38,-22 36,10 Z';
  const ORELHA_IN = 'M-24,4 C-25,-20 -14,-48 -2,-66 C10,-48 23,-20 22,4 Z';

  // pálpebras: c = fecho (0 aberto … 1 fechado), h = olhos contentes (0 … 1, pálpebra de baixo sobe em arco)
  //   (lado: 'E' ou 'D'; a pálpebra meio fechada inclina-se ao contrário do olho, para o ar ficar sonolento e não zangado)
  function palpebras(c, h, lado) {
    const cu = Math.max(c, h);
    const yE = lerp(-28, h > .5 ? 3 : 7, cu);
    const cE = yE + lerp(-17, lerp(12, -24, h), Math.sqrt(cu));
    const inc = 7 * Math.sin(PI * Math.min(1, cu * 1.15)) * (1 - h) * (lado === 'D' ? -1 : 1);
    const a = yE + inc, b = yE - inc;                      // y da ponta esquerda (-34) e direita (34)
    const cl = Math.max(c * c, h * .9);
    const yI = lerp(28, lerp(5, -6, h), cl);
    const cI = yI + lerp(15, -16, h);
    const t0 = 8 / 68, k1 = t0 * (1 - t0), k2 = t0 * t0 + (1 - t0) * (1 - t0);
    const ponta = (p0, pc, p2, t) => (1 - t) * (1 - t) * p0 + 2 * t * (1 - t) * pc + t * t * p2;
    return {
      sup: `M-34,-36 L34,-36 L34,${n(b)} Q0,${n(cE)} -34,${n(a)} Z`,
      cil: `M-26,${n(ponta(a, cE, b, t0))} Q0,${n(k1 * a + k2 * cE + k1 * b)} 26,${n(ponta(a, cE, b, 1 - t0))}`,
      inf: `M-34,36 L34,36 L34,${n(yI)} Q0,${n(cI)} -34,${n(yI)} Z`,
      cilI: `M-24,${n(ponta(yI, cI, yI, t0))} Q0,${n(2 * k1 * yI + k2 * cI)} 24,${n(ponta(yI, cI, yI, t0))}`,
      abre: 1 - Math.max(cu, cl * .8)
    };
  }
  // boca: b = abertura (0 … 1), l = língua de fora (0 … 1)
  function bocaD(b, l) {
    const fundo = 38 + 40 * b, w = 15 + 5 * b, yt = fundo - 15 * b - 2, lb = fundo + 2 + 17 * l, lw = 10 + 2 * b;
    return {
      int: `M${-w},33 C-8,30 8,30 ${w},33 C${w},${n(33 + 30 * b)} 10,${n(fundo)} 0,${n(fundo + 1)} C-10,${n(fundo)} ${-w},${n(33 + 30 * b)} ${-w},33 Z`,
      lin: `M${-lw},${n(yt + 4)} C${-lw},${n(yt - 2)} ${lw},${n(yt - 2)} ${lw},${n(yt + 4)} C${lw},${n(lb - 5)} 5,${n(lb)} 0,${n(lb)} C-5,${n(lb)} ${-lw},${n(lb - 5)} ${-lw},${n(yt + 4)} Z`
    };
  }

  function cabecaSVG(p, est) {
    const e = est || {};
    const Lp = lado => palpebras(e.c || 0, e.h || 0, lado);
    const rxP = 3 + 13 * (e.pupila == null ? .35 : e.pupila);
    const olho = lado => {
      const s = lado === 'E' ? -1 : 1;
      let fib = '';
      for (let i = 0; i < 16; i++) { const a = i / 16 * 2 * PI; fib += `M${n(Math.cos(a) * 9)},${n(Math.sin(a) * 9)}L${n(Math.cos(a) * 20)},${n(Math.sin(a) * 20)}`; }
      return `<g class="gt-olho${lado}" transform="translate(${37 * s},-13) rotate(${-8 * s})">
        <clipPath id="${p}clip-olho${lado}"><path d="${OLHO}"/></clipPath>
        <path d="${OLHO}" fill="#F5F2CF"/>
        <g clip-path="url(#${p}clip-olho${lado})">
          <g class="gt-iris${lado}">
            <circle r="23.5" fill="url(#${p}iris)"/>
            <path d="${fib}" stroke="#F4FAC0" stroke-width="1.3" opacity=".45"/>
            <circle r="23.5" fill="none" stroke="#2C5C18" stroke-width="2.4" opacity=".6"/>
            <circle r="13" fill="none" stroke="#E3D35A" stroke-width="3" opacity=".35"/>
            <ellipse class="gt-pupila${lado}" rx="${n(rxP)}" ry="19" fill="url(#${p}pupila)"/>
          </g>
          <path d="M-34,-34 H34 V-10 Q0,-30 -34,-10 Z" fill="#4A2410" opacity=".16"/>
          <circle cx="-8" cy="-10" r="6.8" fill="#FFF"/>
          <circle cx="-15.5" cy="-2" r="2.2" fill="#FFF" opacity=".8"/>
          <circle cx="8.5" cy="9" r="3.4" fill="#FFF" opacity=".85"/>
          <path class="gt-palpS${lado}" d="${Lp(lado).sup}" fill="url(#${p}palp${lado})"/>
          <path class="gt-palpI${lado}" d="${Lp(lado).inf}" fill="url(#${p}palp${lado})"/>
          <path class="gt-cilI${lado}" d="${Lp(lado).cilI}" fill="none" stroke="${COR.cont}" stroke-width="1.8" opacity=".7"/>
          <path class="gt-cil${lado}" d="${Lp(lado).cil}" fill="none" stroke="${COR.cont}" stroke-width="3.8" stroke-linecap="round"/>
        </g>
        <path class="gt-contOlho${lado}" d="${OLHO}" fill="none" stroke="${COR.cont}" stroke-width="2.8"/>
      </g>`;
    };
    const orelha = lado => {
      const s = lado === 'E' ? -1 : 1;
      return `<g class="gt-orelha${lado}" transform="translate(${50 * s},-50) rotate(${16 * s})"><g transform="scale(${-s},1)">
        <path d="${ORELHA}" fill="url(#${p}pelo-l)" stroke="${COR.cont}" stroke-width="3.6" stroke-linejoin="round"/>
        <path d="M-5,-80 C-2,-85 3,-85 6,-80 C10,-74 13,-68 15,-62 C8,-66 -6,-66 -13,-61 C-10,-68 -8,-75 -5,-80 Z" fill="${COR.risca}" opacity=".75"/>
        <path d="${ORELHA_IN}" fill="url(#${p}orelha)"/>
        <path d="M-17,2 C-19,-14 -16,-28 -11,-40 M-5,6 C-6,-12 -3,-30 -1,-46 M7,6 C7,-10 9,-22 12,-32 M15,4 C16,-6 17,-14 19,-20" stroke="#FFF7EC" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".95"/>
        <path d="M-30,2 C-32,-18 -22,-46 -9,-66" stroke="#FFDBA8" stroke-width="2.6" fill="none" opacity=".75" stroke-linecap="round"/>
      </g></g>`;
    };
    const riscasTesta = 'M-6,-86 C-6,-72 -4,-60 0,-50 C4,-60 6,-72 6,-86 Z' +
      'M-30,-84 C-27,-71 -23,-61 -16,-53 C-18,-63 -19,-74 -19,-86 Z M30,-84 C27,-71 23,-61 16,-53 C18,-63 19,-74 19,-86 Z' +
      'M-56,-75 C-48,-66 -42,-60 -34,-57 C-40,-65 -44,-71 -46,-79 Z M56,-75 C48,-66 42,-60 34,-57 C40,-65 44,-71 46,-79 Z' +
      'M-108,13 C-94,11 -83,13 -72,19 C-83,22 -95,21 -106,22 Z M108,13 C94,11 83,13 72,19 C83,22 95,21 106,22 Z' +
      'M-104,32 C-92,31 -83,33 -74,37 C-84,39 -93,38 -102,39 Z M104,32 C92,31 83,33 74,37 C84,39 93,38 102,39 Z';
    const bigodes = `<path d="M-4,-7 C-38,-16 -70,-19 -100,-14 M-4,0 C-40,-3 -74,0 -106,7 M-4,7 C-38,12 -68,22 -96,34" fill="none" stroke-linecap="round" stroke="#7A4A28" stroke-width="3.8" opacity=".28"/>
      <path d="M-4,-7 C-38,-16 -70,-19 -100,-14 M-4,0 C-40,-3 -74,0 -106,7 M-4,7 C-38,12 -68,22 -96,34" fill="none" stroke-linecap="round" stroke="#FFFBF2" stroke-width="2.2"/>`;
    const B = bocaD(0, 0);
    return `<g class="gt-cab-in">
      ${orelha('E')}${orelha('D')}
      <path d="${CAB}" fill="url(#${p}pelo-cab)" stroke="${COR.cont}" stroke-width="3.8" stroke-linejoin="round"/>
      <clipPath id="${p}clip-cab"><path d="${CAB}"/></clipPath>
      <g clip-path="url(#${p}clip-cab)">
        <g class="gt-testa"><path d="${riscasTesta}" fill="${COR.risca}" opacity=".9"/></g>
        <path d="M-104,40 C-60,86 60,86 104,40 L104,90 L-104,90 Z" fill="#B9622A" opacity=".2"/>
        <path d="M-70,-62 C-40,-80 10,-84 40,-76" stroke="#FFE2B0" stroke-width="8" fill="none" opacity=".35" stroke-linecap="round"/>
      </g>
      <g class="gt-focinhoF">
        <path d="M-11,-31 C-5,-36 5,-36 11,-31 C17,-12 44,2 48,26 C51,50 30,66 0,66 C-30,66 -51,50 -48,26 C-44,2 -17,-12 -11,-31 Z" fill="url(#${p}branco)"/>
        <ellipse cx="-56" cy="27" rx="14" ry="7.5" fill="#F3909F" opacity=".4"/><ellipse cx="56" cy="27" rx="14" ry="7.5" fill="#F3909F" opacity=".4"/>
      </g>
      <g class="gt-cara">
        ${olho('E')}${olho('D')}
        <g class="gt-sobr"><path d="M-30,-45 C-34,-57 -41,-65 -50,-73 M-42,-43 C-48,-53 -56,-59 -65,-63 M30,-45 C34,-57 41,-65 50,-73 M42,-43 C48,-53 56,-59 65,-63" stroke="#FFF3E0" stroke-width="1.9" fill="none" stroke-linecap="round" opacity=".95"/></g>
      </g>
      <g class="gt-focinho">
        <g class="gt-queixo"><ellipse cx="0" cy="55" rx="19" ry="11" fill="url(#${p}branco)" stroke="${COR.sombraBranca}" stroke-width="1.5"/></g>
        <path class="gt-bocaInt" d="${B.int}" fill="url(#${p}boca)" stroke="${COR.cont}" stroke-width="2.2" display="none"/>
        <path class="gt-dentes" d="M-13,42 L-9.5,51 L-6,42 Z M6,42 L9.5,51 L13,42 Z" fill="#FFFFFF" opacity="0"/>
        <path class="gt-lingua" d="${B.lin}" fill="url(#${p}lingua)" stroke="#B9506A" stroke-width="1.4" display="none"/>
        <ellipse cx="-17" cy="31" rx="21" ry="15" fill="url(#${p}branco)"/><ellipse cx="17" cy="31" rx="21" ry="15" fill="url(#${p}branco)"/>
        <path d="M-37,35 C-29,46 -9,47 0,40 C9,47 29,46 37,35" stroke="${COR.sombraBranca}" stroke-width="1.6" fill="none"/>
        <g fill="#C79770"><circle cx="-24" cy="27" r="1.6"/><circle cx="-31" cy="31" r="1.6"/><circle cx="-23" cy="35" r="1.6"/><circle cx="24" cy="27" r="1.6"/><circle cx="31" cy="31" r="1.6"/><circle cx="23" cy="35" r="1.6"/></g>
        <path d="M-11,9 C-12,3 -6,0 0,0 C6,0 12,3 11,9 C8,15 3,18 0,20 C-3,18 -8,15 -11,9 Z" fill="url(#${p}nariz)" stroke="#B4566A" stroke-width="1.6"/>
        <ellipse cx="-4" cy="5" rx="3.6" ry="2" fill="#FFE1E7" opacity=".9"/>
        <path d="M0,20 L0,29 M0,29 C-3,35 -11,37 -16,31 M0,29 C3,35 11,37 16,31" stroke="${COR.cont}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <g class="gt-bigE" transform="translate(-30,30)">${bigodes}</g>
        <g class="gt-bigD" transform="translate(30,30) scale(-1,1)">${bigodes}</g>
      </g>
    </g>`;
  }

  /* --- Patas: cada segmento tem uma forma; as patas desenham-se em dois passes (contorno grosso, depois enchimento)
         para o contorno ficar à volta da pata inteira, sem riscos nas articulações. --- */
  const SEG = {
    braco: 'M-27,0 C-27,-27 27,-27 27,0 L20,84 C20,95 -20,95 -20,84 Z',
    antebraco: 'M-20,0 C-20,-14 20,-14 20,0 L16,78 C16,88 -16,88 -16,78 Z',
    pataF: 'M-17,-12 C-8,-19 18,-18 27,-6 C33,4 28,14 12,14 L-14,14 C-23,13 -25,-6 -17,-12 Z',
    coxa: 'M2,-40 C36,-40 56,-10 54,26 C52,60 32,84 4,84 C-26,84 -48,60 -50,28 C-52,-8 -32,-40 2,-40 Z',
    canela: 'M-18,0 C-18,-10 18,-10 18,0 L13,55 C13,65 -13,65 -13,55 Z',
    metatarso: 'M-14,0 C-14,-9 14,-9 14,0 L12,66 C12,74 -12,74 -12,66 Z',
    pataT: 'M-18,-12 C-8,-19 21,-18 30,-6 C36,4 31,14 13,14 L-15,14 C-24,13 -26,-6 -18,-12 Z'
  };
  const RISCAS = {
    braco: ['M-30,24 C-10,19 10,19 30,24 L30,33 C10,28 -10,28 -30,33 Z', 'M-28,52 C-8,47 8,47 28,52 L28,60 C8,55 -8,55 -28,60 Z'],
    antebraco: ['M-24,16 C-8,12 8,12 24,16 L24,23 C8,19 -8,19 -24,23 Z'],
    coxa: ['M-54,4 C-26,-8 22,-10 58,2 L58,12 C22,2 -26,4 -54,16 Z', 'M-54,32 C-24,20 24,20 58,30 L58,39 C24,30 -24,31 -54,43 Z', 'M-48,58 C-20,48 20,48 52,56 L52,64 C20,57 -20,58 -48,68 Z'],
    canela: ['M-20,16 C-6,12 6,12 20,16 L20,23 C6,19 -6,19 -20,23 Z'],
    metatarso: []
  };
  const MEIAS = {
    antebraco: 'M-24,46 L-14,40 L-8,47 L-1,39 L6,46 L13,39 L24,45 L24,100 L-24,100 Z',
    metatarso: 'M-18,26 L-10,20 L-4,27 L3,19 L9,26 L18,21 L18,80 L-18,80 Z'
  };
  function segSVG(p, classe, forma, tom, almof) {
    const longe = tom === 'longe';
    const pelo = longe ? `url(#${p}pelo-esc)` : `url(#${p}pelo-l)`;
    const branco = longe ? '#E6D5C2' : `url(#${p}branco)`;
    const pata = forma === 'pataF' || forma === 'pataT';
    const A = `<g class="${classe}"><path d="${SEG[forma]}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7.5" stroke-linejoin="round"/></g>`;
    let B = `<g class="${classe}"><path d="${SEG[forma]}" fill="${pata ? branco : pelo}"/>`;
    if (!pata) {
      const r = (RISCAS[forma] || []).map(d => `<path d="${d}"/>`).join('');
      const m = MEIAS[forma] ? `<path d="${MEIAS[forma]}" fill="${branco}"/>` : '';
      B += `<g clip-path="url(#${p}clip-${forma})"><g fill="${longe ? COR.riscaF : COR.risca}" opacity=".8">${r}</g>${m}</g>`;
    } else {
      B += `<path d="M9,6 C10,9 10,11 9,14 M18,3 C20,7 20,10 19,13" stroke="#C4A88E" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
      if (!longe) B += `<path d="M-13,-7 C-5,-13 9,-14 19,-8" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`;
      if (almof) B += `<g class="gt-almof" opacity="0"><ellipse cx="6" cy="9" rx="9" ry="4.6" fill="#F193A5"/><circle cx="-6" cy="11" r="3.2" fill="#F193A5"/><circle cx="17" cy="10.5" r="3.2" fill="#F193A5"/><circle cx="25" cy="5" r="2.8" fill="#F193A5"/></g>`;
    }
    return { A, B: B + '</g>' };
  }
  function pernaFrenteSVG(p, nome, tom, almof) {
    const b = segSVG(p, `gt-${nome}-braco`, 'braco', tom);
    const a = segSVG(p, `gt-${nome}-antebraco`, 'antebraco', tom);
    const pa = segSVG(p, `gt-${nome}-pata`, 'pataF', tom, almof);
    return { g1: `<g class="gt-${nome}-g1">${b.A}${b.B}</g>`, g2: `<g class="gt-${nome}-g2">${a.A}${pa.A}${a.B}${pa.B}</g>` };
  }
  function pernaTrasSVG(p, nome, tom) {
    const s = ['metatarso', 'pataT', 'canela', 'coxa'].map(f => segSVG(p, `gt-${nome}-${f === 'pataT' ? 'pata' : f}`, f, tom));
    return `<g class="gt-${nome}">${s.map(x => x.A).join('')}${s.map(x => x.B).join('')}</g>`;
  }

  /* --- Tronco (local: anca em 0,0, ombro em 140,0; costas para cima) --- */
  const TRONCO = 'M-96,-4 C-102,-46 -62,-64 -12,-60 C38,-57 80,-52 122,-56 C172,-62 216,-36 213,8 C211,48 182,76 140,79 C100,83 60,71 20,77 C-30,85 -92,62 -96,-4 Z';
  function troncoSVG(p) {
    let r = '';
    for (const x of [-64, -34, -4, 26, 56, 86, 116, 146]) r += `<path d="M${x - 8},-68 C${x - 3},-46 ${x - 9},-26 ${x - 15},-4 C${x - 5},-24 ${x + 5},-44 ${x + 8},-68 Z"/>`;
    return `<g class="gt-tronco">
      <path d="${TRONCO}" fill="url(#${p}pelo)" stroke="${COR.cont}" stroke-width="3.8" stroke-linejoin="round"/>
      <g clip-path="url(#${p}clip-tronco)">
        <path d="M-110,38 C-40,70 80,64 230,38 L230,100 L-110,100 Z" fill="#FFE4C2" opacity=".7"/>
        <g fill="${COR.risca}" opacity=".85">${r}</g>
        <path d="M-80,-57 C-20,-67 90,-59 190,-57" stroke="${COR.risca}" stroke-width="10" fill="none" opacity=".55"/>
        <path d="M-60,-45 C10,-55 100,-49 170,-47" stroke="#FFE0AE" stroke-width="7" fill="none" opacity=".35" stroke-linecap="round"/>
        <path d="M-100,62 C-40,86 100,86 220,58 L220,100 L-100,100 Z" fill="#9E5222" opacity=".2"/>
      </g>
    </g>`;
  }
  function peitoSVG(p) {
    return `<g class="gt-peito">
      <path d="M-24,-44 C2,-56 38,-48 48,-14 C56,12 48,42 33,60 L27,52 L20,64 L12,53 L4,66 L-4,54 L-12,60 C-24,32 -42,-6 -24,-44 Z" fill="url(#${p}branco)"/>
      <path d="M33,60 L27,52 L20,64 L12,53 L4,66 L-4,54 L-12,60" fill="none" stroke="${COR.sombraBranca}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M6,-20 C10,-6 10,8 6,20 M20,-16 C26,-2 26,14 20,28 M-8,-10 C-6,4 -6,18 -10,30" stroke="${COR.sombraBranca}" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round"/>
    </g>`;
  }
  // corpo visto de frente: só aparece a meio das viragens (vai alargando enquanto o perfil estreita)
  function frenteSVG(p) {
    return `<g class="gt-frente" display="none">
      <g class="gt-frente-pernas">
        <path d="M-54,0 L-8,0 L-12,100 L-50,100 Z M8,0 L54,0 L50,100 L12,100 Z" fill="url(#${p}pelo-l)" stroke="${COR.cont}" stroke-width="3.6"/>
        <path d="M-53,32 L-9,30 L-9,38 L-53,40 Z M9,30 L53,32 L53,40 L9,38 Z" fill="${COR.risca}" opacity=".7"/>
        <path d="M-52,66 L-11,66 L-12,100 L-50,100 Z M11,66 L52,66 L50,100 L12,100 Z" fill="url(#${p}branco)"/>
      </g>
      <g class="gt-frente-patas">
        <ellipse cx="-31" cy="-9" rx="24" ry="12" fill="url(#${p}branco)" stroke="${COR.cont}" stroke-width="3"/>
        <ellipse cx="31" cy="-9" rx="24" ry="12" fill="url(#${p}branco)" stroke="${COR.cont}" stroke-width="3"/>
        <path d="M-36,-12 L-36,-3 M-26,-12 L-26,-3 M26,-12 L26,-3 M36,-12 L36,-3" stroke="#C4A88E" stroke-width="1.8"/>
      </g>
      <ellipse cx="0" cy="34" rx="74" ry="84" fill="url(#${p}pelo)" stroke="${COR.cont}" stroke-width="3.6"/>
      <path d="M-40,-26 C-14,-40 14,-40 40,-26 C52,6 42,44 26,68 L17,58 L8,72 L-2,60 L-12,72 L-21,58 C-40,36 -52,6 -40,-26 Z" fill="url(#${p}branco)"/>
    </g>`;
  }
  function caudaSVG(p) {
    let A = '', B = '';
    for (let i = 0; i < NC; i++) {
      const w = LARG_CAUDA[i], r = `x="${-w / 2}" y="${-w / 2}" width="${LC + w}" height="${w}" rx="${w / 2}"`;
      A += `<g class="gt-c${i}"><rect ${r} fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7.5"/></g>`;
      let det = '';
      if (i % 2 === 1) det += `<rect x="${LC * .35}" y="${-w / 2 + .5}" width="10" height="${w - 1}" rx="4" fill="${COR.risca}" opacity=".9"/>`;
      if (i === NC - 1) det += `<circle cx="${LC}" cy="0" r="${w / 2 - 1.5}" fill="${COR.riscaF}" opacity=".85"/>`;
      if (i === 0) det += `<rect x="${-w / 2}" y="${-w / 2 + 2}" width="${LC + w}" height="5" rx="2.5" fill="#FFE0AE" opacity=".35"/>`;
      B += `<g class="gt-c${i}"><rect ${r} fill="url(#${p}cauda)"/>${det}</g>`;
    }
    return `<g class="gt-cauda">${A}${B}</g>`;
  }
  function gatoSVG(p) {
    const fL = pernaFrenteSVG(p, 'fL', 'longe'), fN = pernaFrenteSVG(p, 'fN', 'perto', true);
    return `<g class="gt-gato">
      <ellipse class="gt-sombra" cx="0" cy="0" rx="120" ry="20" fill="url(#${p}sombra)"/>
      <g class="gt-flip">
        ${pernaTrasSVG(p, 'tL', 'longe')}${fL.g1}${fL.g2}
        <g class="gt-slotCauda">${caudaSVG(p)}</g>
        ${troncoSVG(p)}
        ${pernaTrasSVG(p, 'tN', 'perto')}
        ${fN.g1}<g class="gt-slotPata">${fN.g2}</g>
        ${peitoSVG(p)}
      </g>
      ${frenteSVG(p)}
      <g class="gt-cab">${cabecaSVG(p)}</g>
      <g class="gt-flip2"><g class="gt-slotCaudaF"></g><g class="gt-slotPataF"></g></g>
    </g>`;
  }

  /* ================= 3) Cenário: sala de estar ================= */
  const K = { cx: 1080, base: 814, aroY: 672, rx: 190, ry: 46, brx: 162, bry: 32, chao: 704 };   // cesto (chao = almofada)
  const CHAO = 792;                                 // linha do chão onde o gato pousa as patas
  const REPOUSO = { x: 610, y: CHAO };
  const NOV = { x: 892, y: 842, r: 32 };            // novelo de lã
  const PT = { janela: [370, 300], relogio: [1110, 300], estante: [1350, 420], cesto: [K.cx, K.aroY] };

  function defsCena() {
    return `
    <linearGradient id="gato-parede" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FBEBD0"/><stop offset=".45" stop-color="#F4DFBF"/><stop offset="1" stop-color="#E2C59C"/></linearGradient>
    <radialGradient id="gato-brilho-parede" cx="380" cy="280" r="720" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFF8E6" stop-opacity=".8"/><stop offset=".45" stop-color="#FFF3DA" stop-opacity=".25"/><stop offset="1" stop-color="#FFF3DA" stop-opacity="0"/></radialGradient>
    <pattern id="gato-papel" width="96" height="124" patternUnits="userSpaceOnUse">
      <rect width="48" height="124" fill="#FFFFFF" opacity=".17"/>
      <path d="M24,22 C20,30 22,40 24,46 M24,36 C30,32 34,34 36,30 M24,40 C18,38 15,40 12,37" stroke="#9DB083" stroke-width="1.6" fill="none" opacity=".55"/>
      <g transform="translate(24,20)" opacity=".6"><circle cx="0" cy="-4.5" r="3.6" fill="#E7A7A0"/><circle cx="4.3" cy="-1.4" r="3.6" fill="#E7A7A0"/><circle cx="2.7" cy="3.7" r="3.6" fill="#E7A7A0"/><circle cx="-2.7" cy="3.7" r="3.6" fill="#E7A7A0"/><circle cx="-4.3" cy="-1.4" r="3.6" fill="#E7A7A0"/><circle r="2.4" fill="#F0C35A"/></g>
      <g transform="translate(72,84)" opacity=".45"><circle cx="0" cy="-3.4" r="2.7" fill="#E7A7A0"/><circle cx="3.2" cy="-1" r="2.7" fill="#E7A7A0"/><circle cx="2" cy="2.8" r="2.7" fill="#E7A7A0"/><circle cx="-2" cy="2.8" r="2.7" fill="#E7A7A0"/><circle cx="-3.2" cy="-1" r="2.7" fill="#E7A7A0"/><circle r="1.8" fill="#F0C35A"/></g>
      <circle cx="72" cy="30" r="1.8" fill="#C9A77E" opacity=".4"/><circle cx="24" cy="96" r="1.8" fill="#C9A77E" opacity=".4"/>
    </pattern>
    <linearGradient id="gato-lambril" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C6D2A9"/><stop offset="1" stop-color="#9FAE80"/></linearGradient>
    <linearGradient id="gato-rodape" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF5EA"/><stop offset="1" stop-color="#D8C8B0"/></linearGradient>
    <linearGradient id="gato-chao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#94592D"/><stop offset=".35" stop-color="#B97A43"/><stop offset="1" stop-color="#D49B5D"/></linearGradient>
    <linearGradient id="gato-chao-sombra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3F220E" stop-opacity=".5"/><stop offset="1" stop-color="#3F220E" stop-opacity="0"/></linearGradient>
    <linearGradient id="gato-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7DB9E6"/><stop offset=".6" stop-color="#C2E1F0"/><stop offset="1" stop-color="#FBE7C4"/></linearGradient>
    <radialGradient id="gato-sol"><stop offset="0" stop-color="#FFFCEB" stop-opacity="1"/><stop offset=".35" stop-color="#FFF2C2" stop-opacity=".65"/><stop offset="1" stop-color="#FFF2C2" stop-opacity="0"/></radialGradient>
    <linearGradient id="gato-moldura" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFDF7"/><stop offset="1" stop-color="#D9CCB6"/></linearGradient>
    <linearGradient id="gato-cortina" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5F95A1"/><stop offset=".14" stop-color="#9FCBD1"/><stop offset=".3" stop-color="#6A9FAA"/><stop offset=".47" stop-color="#A9D2D7"/><stop offset=".64" stop-color="#6597A3"/><stop offset=".82" stop-color="#93C2C8"/><stop offset="1" stop-color="#55889A"/></linearGradient>
    <linearGradient id="gato-feixe" gradientUnits="userSpaceOnUse" x1="370" y1="260" x2="720" y2="840"><stop offset="0" stop-color="#FFF5D2" stop-opacity=".3"/><stop offset="1" stop-color="#FFF5D2" stop-opacity=".02"/></linearGradient>
    <radialGradient id="gato-tapete" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#CC5E4A"/><stop offset=".8" stop-color="#A9413A"/><stop offset="1" stop-color="#8E3330"/></radialGradient>
    <linearGradient id="gato-madeira" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A56E43"/><stop offset=".5" stop-color="#8A5630"/><stop offset="1" stop-color="#683D1F"/></linearGradient>
    <linearGradient id="gato-madeira-v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B07A4C"/><stop offset="1" stop-color="#7A4A26"/></linearGradient>
    <radialGradient id="gato-latao" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFF0B0"/><stop offset=".5" stop-color="#E0B54A"/><stop offset="1" stop-color="#9C7420"/></radialGradient>
    <radialGradient id="gato-novelo" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#F7A0B5"/><stop offset=".55" stop-color="#E06283"/><stop offset="1" stop-color="#A93A5B"/></radialGradient>
    <linearGradient id="gato-folha" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#93CC6E"/><stop offset="1" stop-color="#3C7A38"/></linearGradient>
    <linearGradient id="gato-folha2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7DB95E"/><stop offset="1" stop-color="#2F6630"/></linearGradient>
    <linearGradient id="gato-vaso" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E5946A"/><stop offset=".5" stop-color="#C96A3F"/><stop offset="1" stop-color="#9C4D2B"/></linearGradient>
    <radialGradient id="gato-vinheta" cx=".44" cy=".42" r=".78"><stop offset=".58" stop-color="#3A1E0C" stop-opacity="0"/><stop offset="1" stop-color="#3A1E0C" stop-opacity=".3"/></radialGradient>
    <linearGradient id="gato-vime" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E7B46C"/><stop offset=".45" stop-color="#C98E48"/><stop offset="1" stop-color="#8C5A27"/></linearGradient>
    <radialGradient id="gato-vime-n" cx=".4" cy=".3" r=".75"><stop offset="0" stop-color="#F6CF92"/><stop offset=".65" stop-color="#CC914B"/><stop offset="1" stop-color="#97612E"/></radialGradient>
    <linearGradient id="gato-vime-dentro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E3A19"/><stop offset="1" stop-color="#9A6633"/></linearGradient>
    <linearGradient id="gato-vime-sombra" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF1D0" stop-opacity=".22"/><stop offset=".4" stop-color="#FFF1D0" stop-opacity="0"/><stop offset=".7" stop-color="#2E1606" stop-opacity=".12"/><stop offset="1" stop-color="#2E1606" stop-opacity=".45"/></linearGradient>
    <linearGradient id="gato-vime-baixo" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="#2E1606" stop-opacity="0"/><stop offset="1" stop-color="#2E1606" stop-opacity=".35"/></linearGradient>
    <radialGradient id="gato-almofada" cx=".42" cy=".35" r=".7"><stop offset="0" stop-color="#CFE2F2"/><stop offset=".7" stop-color="#95B6D8"/><stop offset="1" stop-color="#7093BA"/></radialGradient>
    <radialGradient id="gato-sombra-chao"><stop offset="0" stop-color="#3A2010" stop-opacity=".45"/><stop offset="1" stop-color="#3A2010" stop-opacity="0"/></radialGradient>
    <clipPath id="gato-vidro"><rect x="246" y="126" width="248" height="286"/></clipPath>
    <clipPath id="gato-caixa-relogio"><rect x="1088" y="250" width="44" height="104" rx="6"/></clipPath>
    <clipPath id="gato-clip-dentro"><ellipse cx="${K.cx}" cy="${K.aroY}" rx="${K.rx - 12}" ry="${K.ry - 8}"/></clipPath>
    <clipPath id="gato-clip-parede"><path d="${paredeCesto()}"/></clipPath>`;
  }

  function paredeSVG() {
    let s = `<rect width="1600" height="620" fill="url(#gato-parede)"/><rect width="1600" height="440" fill="url(#gato-papel)"/>`;
    s += `<rect y="446" width="1600" height="148" fill="url(#gato-lambril)"/>`;
    for (let x = -40; x < 1600; x += 200) s += `<rect x="${x + 22}" y="474" width="156" height="96" rx="4" fill="#000" fill-opacity=".04" stroke="#7F8C63" stroke-width="3" stroke-opacity=".7"/><rect x="${x + 26}" y="478" width="148" height="88" rx="3" fill="none" stroke="#E2EACB" stroke-width="2" opacity=".55"/>`;
    s += `<rect y="434" width="1600" height="16" fill="url(#gato-rodape)"/><rect y="450" width="1600" height="7" fill="#4A3A22" opacity=".16"/><rect y="434" width="1600" height="3" fill="#FFFFFF" opacity=".7"/>`;
    s += `<rect width="1600" height="620" fill="url(#gato-brilho-parede)"/>`;
    s += `<rect y="588" width="1600" height="32" fill="url(#gato-rodape)"/><rect y="588" width="1600" height="4" fill="#FFFFFF" opacity=".75"/><rect y="604" width="1600" height="2" fill="#B9A586" opacity=".6"/><rect y="616" width="1600" height="5" fill="#4A2E18" opacity=".35"/>`;
    return s;
  }

  function nuvemSVG(i, x, y, k) {
    return `<g class="gt-nuvem${i}" transform="translate(${x},${y})"><g transform="scale(${k})">
      <ellipse cx="0" cy="8" rx="46" ry="12" fill="#DCE9F3"/>
      <circle cx="-24" cy="0" r="16" fill="#FFFFFF"/><circle cx="0" cy="-10" r="22" fill="#FFFFFF"/><circle cx="24" cy="-2" r="16" fill="#FFFFFF"/><circle cx="40" cy="4" r="10" fill="#FFFFFF"/>
      <ellipse cx="4" cy="6" rx="44" ry="9" fill="#FFFFFF"/>
      <path d="M-34,10 C-10,16 24,16 46,9" stroke="#C9DCEB" stroke-width="3" fill="none" opacity=".8"/>
    </g></g>`;
  }
  function passaroSVG() {
    return `<g class="gt-passaro" display="none"><g class="gt-ave">
      <path d="M-13,-12 L-28,-17 L-26,-7 Z" fill="#6B4A33"/>
      <ellipse cx="-2" cy="-12" rx="14" ry="10" fill="#9A7350"/>
      <ellipse cx="3" cy="-8" rx="9" ry="6" fill="#EADBC3"/>
      <g class="gt-ave-cab"><circle cx="9" cy="-21" r="7.5" fill="#9A7350"/><path d="M3,-26 C7,-30 13,-29 16,-25 L8,-24 Z" fill="#6B4A33"/><circle cx="11" cy="-22" r="1.7" fill="#1D120A"/><circle cx="11.6" cy="-22.6" r=".6" fill="#FFFFFF"/><path d="M16,-21.5 L22.5,-19.5 L16,-17.5 Z" fill="#E7A33A"/><ellipse cx="9" cy="-16" rx="4.5" ry="2.6" fill="#EADBC3"/></g>
      <g class="gt-ave-asa"><path d="M-13,-15 C-7,-23 6,-21 8,-12 C2,-8 -7,-9 -13,-15 Z" fill="#7A5638" stroke="#5A3D26" stroke-width="1"/><path d="M-8,-15 L2,-14 M-6,-12 L4,-11" stroke="#E5D3B6" stroke-width="1.2"/></g>
      <path d="M-2,-3 L-3,0 M3,-3 L4,0" stroke="#C98A4A" stroke-width="1.8" stroke-linecap="round"/>
    </g></g>`;
  }
  function janelaSVG() {
    let s = `<rect x="238" y="118" width="286" height="330" rx="6" fill="#5A3A1E" opacity=".1"/>`;
    s += `<g clip-path="url(#gato-vidro)">
      <rect x="240" y="120" width="260" height="300" fill="url(#gato-ceu)"/>
      <circle cx="258" cy="138" r="150" fill="url(#gato-sol)"/>
      ${nuvemSVG(0, 300, 170, .9)}${nuvemSVG(1, 440, 210, .7)}${nuvemSVG(2, 560, 150, .8)}
      <path d="M240,330 C290,308 340,318 392,302 C432,290 470,296 500,288 L500,420 L240,420 Z" fill="#B9D0AE"/>
      <path d="M240,350 C280,336 330,344 370,334 C420,324 460,336 500,328 L500,420 L240,420 Z" fill="#97BC83"/>
      <g>
        <rect x="390" y="330" width="62" height="50" fill="#EADBC4"/><path d="M383,334 L421,305 L459,334 Z" fill="#B84E35"/>
        <path d="M393,327 L449,327 M405,318 L437,318" stroke="#94392A" stroke-width="2"/>
        <rect x="400" y="342" width="12" height="13" fill="#88AFCB" stroke="#FFF" stroke-width="1.5"/><rect x="428" y="342" width="12" height="13" fill="#88AFCB" stroke="#FFF" stroke-width="1.5"/>
        <rect x="258" y="322" width="86" height="64" fill="#F4E8D6"/><path d="M249,326 L301,289 L353,326 Z" fill="#C8573A"/>
        <path d="M262,318 L340,318 M274,308 L328,308 M287,299 L315,299" stroke="#9E3F28" stroke-width="2"/>
        <rect x="320" y="290" width="11" height="22" fill="#A9472F"/><rect x="318" y="287" width="15" height="5" fill="#8C3A26"/>
        <rect x="270" y="337" width="17" height="19" fill="#7FA8C9" stroke="#FFF" stroke-width="2"/><rect x="314" y="337" width="17" height="19" fill="#7FA8C9" stroke="#FFF" stroke-width="2"/>
        <rect x="293" y="354" width="15" height="32" fill="#8C5A3C"/><circle cx="305" cy="371" r="1.5" fill="#E8C66A"/>
      </g>
      <g class="gt-arvore">
        <path d="M463,414 C464,390 466,370 468,348 L474,348 C475,370 477,392 480,414 Z" fill="#7A5232"/>
        <circle cx="448" cy="352" r="25" fill="#5A9346"/><circle cx="490" cy="354" r="24" fill="#4E8740"/>
        <circle cx="470" cy="330" r="31" fill="#6FA857"/><circle cx="472" cy="298" r="24" fill="#7DB863"/>
        <circle cx="461" cy="290" r="9" fill="#9ACD7A" opacity=".8"/><circle cx="452" cy="322" r="10" fill="#8CC56E" opacity=".7"/>
      </g>
      <path d="M240,388 C250,376 262,382 272,375 C284,368 294,380 306,372 C318,366 328,378 340,371 C352,365 362,377 374,370 C386,364 396,376 408,370 C420,364 432,376 444,369 C456,364 466,376 478,370 C488,366 494,372 500,370 L500,414 L240,414 Z" fill="#4C873D"/>
      <g fill="#F5A3B5"><circle cx="262" cy="392" r="3"/><circle cx="318" cy="388" r="3"/><circle cx="371" cy="394" r="3"/><circle cx="430" cy="389" r="3"/></g>
      <g fill="#FFFFFF"><circle cx="292" cy="397" r="2.5"/><circle cx="348" cy="391" r="2.5"/><circle cx="402" cy="396" r="2.5"/><circle cx="462" cy="392" r="2.5"/></g>
      <rect x="240" y="400" width="260" height="14" fill="#CFC6B6"/><rect x="240" y="400" width="260" height="3" fill="#EEE7DB"/>
      ${passaroSVG()}
      <path d="M246,262 L332,126 L364,126 L246,312 Z" fill="#FFFFFF" opacity=".16"/>
      <path d="M380,412 L494,262 L494,298 L410,412 Z" fill="#FFFFFF" opacity=".11"/>
    </g>`;
    s += `<path d="M230,110 H510 V428 H230 Z M246,126 V412 H494 V126 Z" fill="url(#gato-moldura)" fill-rule="evenodd" stroke="#B6A88F" stroke-width="2"/>`;
    s += `<path d="M246,126 H494 M246,126 V412" stroke="#8F7F66" stroke-width="3" opacity=".45"/>`;
    s += `<rect x="366" y="126" width="8" height="286" fill="url(#gato-moldura)"/><rect x="246" y="265" width="248" height="8" fill="url(#gato-moldura)"/>`;
    s += `<rect x="372" y="126" width="2" height="286" fill="#9E8E74" opacity=".5"/><rect x="246" y="271" width="248" height="2" fill="#9E8E74" opacity=".5"/>`;
    s += `<rect x="212" y="420" width="316" height="14" rx="3" fill="#FCF7EE"/><rect x="214" y="434" width="312" height="10" fill="#DACDB6"/><rect x="220" y="444" width="300" height="12" fill="#5A3A1E" opacity=".13"/>`;
    // vaso com flores no peitoril
    s += `<g><path d="M452,420 L492,420 L488,396 L456,396 Z" fill="url(#gato-vaso)" stroke="#7A3A1E" stroke-width="2"/><rect x="452" y="392" width="40" height="7" rx="2" fill="#D8784A" stroke="#7A3A1E" stroke-width="2"/>
      <g class="gt-flores"><path d="M466,392 C462,378 458,370 452,362 M472,392 C474,374 478,366 486,358 M470,392 C469,380 470,372 470,364" stroke="#4E8A3E" stroke-width="2.4" fill="none"/>
      <ellipse cx="458" cy="378" rx="7" ry="3.5" fill="#5E9A48" transform="rotate(-30 458 378)"/><ellipse cx="482" cy="374" rx="7" ry="3.5" fill="#5E9A48" transform="rotate(30 482 374)"/>
      ${[[452, 360], [486, 356], [470, 361]].map(([x, y]) => `<g transform="translate(${x},${y})"><circle cx="0" cy="-4" r="4" fill="#E2485A"/><circle cx="3.8" cy="-1.2" r="4" fill="#E2485A"/><circle cx="2.4" cy="3.3" r="4" fill="#E2485A"/><circle cx="-2.4" cy="3.3" r="4" fill="#E2485A"/><circle cx="-3.8" cy="-1.2" r="4" fill="#E2485A"/><circle r="2.2" fill="#FFD25A"/></g>`).join('')}</g></g>`;
    return s;
  }
  function cortinasSVG() {
    const sup = 'M164,92 L278,92 C268,180 246,280 238,330 L204,330 C194,280 174,180 164,92 Z';
    const inf = 'M204,330 L238,330 C254,420 288,520 296,604 C272,610 252,598 230,606 C206,612 182,600 146,606 C156,520 188,420 204,330 Z';
    const pregasSup = 'M190,96 C196,180 208,270 214,328 M222,96 C222,180 221,270 220,328 M252,96 C246,180 234,270 228,328';
    const pregasInf = 'M212,334 C206,420 186,520 172,602 M222,334 C224,430 230,520 236,600 M230,334 C240,420 260,520 270,600';
    const uma = lado => {
      const esp = lado === 'D' ? ' transform="translate(740,0) scale(-1,1)"' : '';
      return `<g${esp}>
        <g class="gt-cort${lado}-inf"><path d="${inf}" fill="url(#gato-cortina)" stroke="#3F6F7C" stroke-width="2.4"/><path d="${pregasInf}" stroke="#3F6F7C" stroke-width="2" fill="none" opacity=".35"/>
          <path d="M146,606 C182,600 206,612 230,606 C252,598 272,610 296,604" stroke="#E7D6A8" stroke-width="4" fill="none"/></g>
        <g class="gt-cort${lado}-sup"><path d="${sup}" fill="url(#gato-cortina)" stroke="#3F6F7C" stroke-width="2.4"/><path d="${pregasSup}" stroke="#3F6F7C" stroke-width="2" fill="none" opacity=".35"/></g>
        <path d="M194,322 C210,314 232,314 248,322 L246,340 C230,332 212,332 196,340 Z" fill="#E9C46B" stroke="#A98632" stroke-width="2"/>
        <path d="M244,336 C250,350 248,364 244,376" stroke="#C9A24C" stroke-width="3" fill="none"/><path d="M238,372 L250,372 L248,392 L240,392 Z" fill="#E9C46B" stroke="#A98632" stroke-width="1.6"/>
      </g>`;
    };
    let aneis = '';
    for (const x of [172, 196, 220, 244, 268, 472, 496, 520, 544, 568]) aneis += `<circle cx="${x}" cy="90" r="6" fill="none" stroke="#B8902E" stroke-width="2.4"/>`;
    return `${uma('E')}${uma('D')}<rect x="148" y="83" width="444" height="9" rx="4.5" fill="url(#gato-latao)" stroke="#8A6420" stroke-width="1.2"/>${aneis}
      <circle cx="146" cy="87.5" r="11" fill="url(#gato-latao)" stroke="#8A6420" stroke-width="1.2"/><circle cx="594" cy="87.5" r="11" fill="url(#gato-latao)" stroke="#8A6420" stroke-width="1.2"/>`;
  }
  function relogioSVG() {
    const cx = 1110, cy = 184;
    let marcas = '';
    for (let i = 0; i < 60; i++) {
      const a = i / 60 * 2 * PI, g = i % 5 === 0, r0 = g ? 35 : 39;
      marcas += `<line x1="${n(cx + Math.sin(a) * r0)}" y1="${n(cy - Math.cos(a) * r0)}" x2="${n(cx + Math.sin(a) * 42)}" y2="${n(cy - Math.cos(a) * 42)}" stroke="#4A3726" stroke-width="${g ? 3 : 1.2}" stroke-linecap="round"/>`;
    }
    return `<g>
      <ellipse cx="${cx + 10}" cy="${cy + 96}" rx="66" ry="150" fill="#3A1E0C" opacity=".1"/>
      <path d="M${cx - 34},236 L${cx + 34},236 L${cx + 30},372 C${cx + 30},384 ${cx - 30},384 ${cx - 30},372 Z" fill="url(#gato-madeira)" stroke="#4A2A14" stroke-width="2.5"/>
      <path d="M${cx - 22},${cy - 60} Q${cx},${cy - 88} ${cx + 22},${cy - 60} Z" fill="url(#gato-madeira)" stroke="#4A2A14" stroke-width="2"/><circle cx="${cx}" cy="${cy - 80}" r="5" fill="url(#gato-latao)"/>
      <circle cx="${cx}" cy="${cy}" r="64" fill="url(#gato-madeira)" stroke="#4A2A14" stroke-width="2.5"/>
      <circle cx="${cx}" cy="${cy}" r="53" fill="url(#gato-latao)" stroke="#8A6420" stroke-width="1.5"/>
      <circle cx="${cx}" cy="${cy}" r="45" fill="#FBF6E8" stroke="#BFA36A" stroke-width="1.5"/>
      ${marcas}
      <rect x="1088" y="250" width="44" height="104" rx="6" fill="#2E1C0E"/>
      <g clip-path="url(#gato-caixa-relogio)"><g class="gt-pendulo">
        <rect x="${cx - 1.6}" y="240" width="3.2" height="84" fill="#C9A44C"/><circle cx="${cx}" cy="330" r="13" fill="url(#gato-latao)" stroke="#8A6420" stroke-width="1.5"/><circle cx="${cx - 4}" cy="326" r="3.5" fill="#FFF6CF" opacity=".8"/>
      </g><path d="M1090,252 L1104,252 L1090,302 Z" fill="#FFFFFF" opacity=".14"/></g>
      <rect x="1088" y="250" width="44" height="104" rx="6" fill="none" stroke="url(#gato-latao)" stroke-width="3"/>
      <g class="gt-ponteiroH"><path d="M${cx - 3.2},${cy + 6} L${cx},${cy - 24} L${cx + 3.2},${cy + 6} Z" fill="#2E2219"/></g>
      <g class="gt-ponteiroM"><path d="M${cx - 2.4},${cy + 8} L${cx},${cy - 36} L${cx + 2.4},${cy + 8} Z" fill="#2E2219"/></g>
      <g class="gt-ponteiroS"><path d="M${cx},${cy + 10} L${cx},${cy - 39}" stroke="#C0392B" stroke-width="1.4"/></g>
      <circle cx="${cx}" cy="${cy}" r="3.6" fill="#C9A44C" stroke="#7A5A1A" stroke-width="1"/>
      <path d="M${cx - 36},${cy - 22} A42,42 0 0 1 ${cx - 6},${cy - 42}" stroke="#FFFFFF" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>
    </g>`;
  }
  function estanteSVG() {
    const r = semente(11);
    const X0 = 1236, X1 = 1476, Y0 = 250, Y1 = 616;
    const cores = ['#C0504D', '#4F81BD', '#9BBB59', '#E8B44C', '#8064A2', '#E07B39', '#5B9AA0', '#D9CDB5', '#3E6C5A', '#B5545C'];
    let s = `<rect x="${X0 + 12}" y="${Y0 + 10}" width="${X1 - X0}" height="${Y1 - Y0 - 6}" fill="#3A1E0C" opacity=".14"/>`;
    s += `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="url(#gato-madeira)" stroke="#4A2A14" stroke-width="2.5"/>`;
    s += `<rect x="${X0 + 14}" y="${Y0 + 14}" width="${X1 - X0 - 28}" height="${Y1 - Y0 - 44}" fill="#4A2B14"/>`;
    const prat = [[Y0 + 14, 350], [362, 452], [464, 556]];
    for (const [a, b] of prat) {
      let x = X0 + 16;
      const fim = X1 - 16;
      let k = 0;
      while (x < fim - 12) {
        k++;
        if (k === 4 && b === 452) {             // pequeno cato num vaso
          s += `<path d="${`M${x + 4},${b} L${x + 30},${b} L${x + 27},${b - 20} L${x + 7},${b - 20} Z`}" fill="url(#gato-vaso)" stroke="#7A3A1E" stroke-width="1.5"/><path d="M${x + 11},${b - 20} C${x + 9},${b - 44} ${x + 25},${b - 44} ${x + 23},${b - 20} Z" fill="#5E9A48" stroke="#386B2E" stroke-width="1.5"/><path d="M${x + 17},${b - 40} L${x + 17},${b - 22}" stroke="#386B2E" stroke-width="1"/><circle cx="${x + 17}" cy="${b - 42}" r="3" fill="#F28AA5"/>`;
          x += 38; continue;
        }
        const w = 13 + r() * 12, h = (b - a - 8) * (.66 + r() * .3), c = cores[(r() * cores.length) | 0];
        if (x + w > fim) break;
        s += `<rect x="${n(x)}" y="${n(b - h)}" width="${n(w)}" height="${n(h)}" rx="1.5" fill="${c}" stroke="#2A1A10" stroke-width="1"/>`;
        s += `<rect x="${n(x + 1.5)}" y="${n(b - h + 6)}" width="${n(w - 3)}" height="3" fill="#FFFFFF" opacity=".35"/><rect x="${n(x + 1.5)}" y="${n(b - 12)}" width="${n(w - 3)}" height="3" fill="#FFFFFF" opacity=".3"/>`;
        s += `<rect x="${n(x + w * .25)}" y="${n(b - h * .62)}" width="${n(w * .5)}" height="${n(h * .2)}" fill="#000" opacity=".12"/><rect x="${n(x)}" y="${n(b - h)}" width="2" height="${n(h)}" fill="#FFFFFF" opacity=".18"/>`;
        x += w + 1;
      }
      s += `<rect x="${X0 + 8}" y="${b}" width="${X1 - X0 - 16}" height="12" fill="url(#gato-madeira-v)" stroke="#4A2A14" stroke-width="1.5"/><rect x="${X0 + 8}" y="${b + 12}" width="${X1 - X0 - 16}" height="5" fill="#000" opacity=".2"/>`;
    }
    s += `<rect x="${X0 + 8}" y="${Y1 - 30}" width="${X1 - X0 - 16}" height="26" fill="url(#gato-madeira-v)" stroke="#4A2A14" stroke-width="1.5"/>`;
    s += `<rect x="${X0 - 6}" y="${Y0 - 10}" width="${X1 - X0 + 12}" height="12" rx="2" fill="url(#gato-madeira-v)" stroke="#4A2A14" stroke-width="2"/>`;
    // moldura com fotografia em cima da estante
    s += `<g transform="rotate(-4 1430 214)"><rect x="1404" y="186" width="52" height="56" rx="3" fill="#D9B46A" stroke="#7A5A1A" stroke-width="2"/><rect x="1411" y="193" width="38" height="42" fill="#BFE0F0"/><path d="M1411,235 L1422,218 L1430,226 L1438,214 L1449,235 Z" fill="#7FB36A"/><circle cx="1440" cy="202" r="4" fill="#FFE27A"/></g>`;
    // vaso com hera a cair
    s += `<path d="M1268,240 L1322,240 L1316,206 L1274,206 Z" fill="url(#gato-vaso)" stroke="#7A3A1E" stroke-width="2"/><rect x="1268" y="200" width="54" height="9" rx="3" fill="#D8784A" stroke="#7A3A1E" stroke-width="2"/>`;
    const folhaHera = (x, y, a, k) => `<path transform="translate(${n(x)},${n(y)}) rotate(${n(a)}) scale(${k})" d="M0,0 C-6,-2 -10,6 -6,12 C-3,16 0,18 0,20 C0,18 3,16 6,12 C10,6 6,-2 0,0 Z" fill="url(#gato-folha)" stroke="#2F6630" stroke-width="1"/>`;
    const hera = (i, x0, pts) => {
      let d = `M${x0},204`; for (const [x, y] of pts) d += ` L${x},${y}`;
      let f = ''; pts.forEach(([x, y], j) => { f += folhaHera(x, y, j % 2 ? 30 : -30, .9 + (j % 3) * .15); });
      return `<g class="gt-hera${i}"><path d="${d}" stroke="#4E8A3E" stroke-width="2.4" fill="none" stroke-linejoin="round"/>${f}</g>`;
    };
    s += hera(0, 1276, [[1264, 214], [1254, 236], [1248, 262], [1246, 290], [1250, 318], [1246, 346]]);
    s += hera(1, 1300, [[1306, 222], [1300, 246], [1306, 270]]);
    s += `${folhaHera(1282, 196, -40, 1.2)}${folhaHera(1296, 192, 0, 1.3)}${folhaHera(1310, 196, 40, 1.2)}`;
    return s;
  }
  function chaoSVG() {
    const r = semente(7);
    const VP = 800, VY = 60, Y0 = 618, Y1 = 900;
    const xA = (xb, y) => VP + (xb - VP) * (y - VY) / (Y1 - VY);
    let s = `<rect y="${Y0}" width="1600" height="${Y1 - Y0}" fill="url(#gato-chao)"/>`;
    const tons = ['#C88A50', '#BF8149', '#CD9256', '#C3864D', '#B97B44', '#CA8D53'];
    for (let i = 0; i < 31; i++) {
      const xa = -1000 + i * 125, xb = xa + 125;
      s += `<path d="M${n(xA(xa, Y0))},${Y0} L${n(xA(xb, Y0))},${Y0} L${xb},${Y1} L${xa},${Y1} Z" fill="${tons[i % 6]}" opacity=".55"/>`;
      for (let k = 0; k < 3; k++) {
        const fx = .15 + r() * .7, ph = r() * 6;
        let d = '';
        for (let j = 0; j <= 8; j++) {
          const y = Y0 + (Y1 - Y0) * j / 8, f = fx + .035 * Math.sin(j * .9 + ph);
          d += (j ? ' L' : 'M') + n(lerp(xA(xa, y), xA(xb, y), f)) + ',' + n(y);
        }
        s += `<path d="${d}" stroke="#8B5530" stroke-width="1.3" fill="none" opacity=".22"/>`;
      }
      const nj = 1 + (r() * 2 | 0);
      for (let j = 0; j < nj; j++) {
        const y = Y0 + 20 + r() * (Y1 - Y0 - 30);
        s += `<path d="M${n(xA(xa, y))},${n(y)} L${n(xA(xb, y))},${n(y)}" stroke="#6E3E20" stroke-width="${n(1 + (y - Y0) / 160)}" opacity=".5"/>`;
      }
      s += `<path d="M${n(xA(xa, Y0))},${Y0} L${xa},${Y1}" stroke="#6A3B1E" stroke-width="2.4" opacity=".6"/><path d="M${n(xA(xa, Y0) + 2)},${Y0} L${xa + 3},${Y1}" stroke="#EBB57A" stroke-width="1.6" opacity=".25"/>`;
    }
    s += `<rect y="${Y0}" width="1600" height="80" fill="url(#gato-chao-sombra)"/>`;
    return s;
  }
  function tapeteSVG() {
    const cx = 640, cy = 814, rx = 335, ry = 62;
    let s = `<ellipse cx="${cx + 10}" cy="${cy + 9}" rx="${rx + 8}" ry="${ry + 7}" fill="#3A1E0C" opacity=".22"/>`;
    for (let k = -7; k <= 7; k++) {
      const yy = cy + k * 7.5, dx = rx * Math.sqrt(Math.max(0, 1 - Math.pow((yy - cy) / ry, 2)));
      s += `<path d="M${n(cx - dx + 3)},${n(yy)} l-17,${n(k * 1.2)} M${n(cx + dx - 3)},${n(yy)} l17,${n(k * 1.2)}" stroke="#F1DDB4" stroke-width="2.4" stroke-linecap="round"/>`;
    }
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#gato-tapete)" stroke="#7A2A26" stroke-width="3"/>`;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx - 18}" ry="${ry - 8}" fill="none" stroke="#EBCB8E" stroke-width="9"/>`;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx - 34}" ry="${ry - 14}" fill="none" stroke="#2F5E6E" stroke-width="7"/>`;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx - 48}" ry="${ry - 19}" fill="none" stroke="#EBCB8E" stroke-width="3.5" stroke-dasharray="14 9"/>`;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="120" ry="23" fill="#2F5E6E"/><ellipse cx="${cx}" cy="${cy}" rx="92" ry="16" fill="#EBCB8E"/><ellipse cx="${cx}" cy="${cy}" rx="58" ry="9" fill="#B5473C"/>`;
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * 2 * PI, x = cx + Math.cos(a) * 210, y = cy + Math.sin(a) * 36;
      s += `<path d="M${n(x - 12)},${n(y)} L${n(x)},${n(y - 4)} L${n(x + 12)},${n(y)} L${n(x)},${n(y + 4)} Z" fill="#EBCB8E" opacity=".9"/>`;
    }
    s += `<ellipse cx="${cx - 60}" cy="${cy - 16}" rx="190" ry="26" fill="#FFFFFF" opacity=".06"/>`;
    return s;
  }
  // luz do sol que entra pela janela: feixe no ar e mancha no chão com a cruz do caixilho
  const LUZ = { A: [330, 642], B: [560, 642], C: [930, 870], D: [640, 870] };
  function noChao(u, v) {
    const { A, B, C, D } = LUZ;
    const perto = [lerp(D[0], C[0], u), lerp(D[1], C[1], u)], longe = [lerp(A[0], B[0], u), lerp(A[1], B[1], u)];
    return [lerp(perto[0], longe[0], v), lerp(perto[1], longe[1], v)];
  }
  function noVidro(u, v) { return [lerp(246, 494, u), lerp(126, 412, v)]; }
  function luzSVG() {
    let s = `<path d="M246,126 L494,126 L930,870 L640,870 L330,642 L246,412 Z" fill="url(#gato-feixe)"/>`;
    for (const [u0, u1] of [[0, .47], [.53, 1]]) for (const [v0, v1] of [[0, .47], [.53, 1]]) {
      const pts = [noChao(u0, v0), noChao(u1, v0), noChao(u1, v1), noChao(u0, v1)];
      s += `<path d="M${pts.map(p => n(p[0]) + ',' + n(p[1])).join(' L')} Z" fill="#FFEAB8" opacity=".3" stroke="#FFEAB8" stroke-width="10" stroke-opacity=".12" stroke-linejoin="round"/>`;
    }
    s += `<g class="gt-poeiras">`;
    for (let i = 0; i < 22; i++) s += `<circle class="gt-p${i}" r="${n(1.4 + (i % 4) * .7)}" fill="#FFF7DC"/>`;
    return s + '</g>';
  }
  function noveloSVG() {
    let fios = '';
    const arcos = ['M-28,-10 C-10,-30 18,-28 30,-8', 'M-30,6 C-12,-12 16,-14 30,8', 'M-22,22 C-8,4 14,2 26,18', 'M-12,-30 C-24,-8 -22,16 -8,30', 'M6,-31 C-8,-8 -6,16 10,30', 'M20,-24 C10,-4 12,14 24,22'];
    arcos.forEach((d, i) => { fios += `<path d="${d}" stroke="${i % 2 ? '#FFC1CF' : '#B8466A'}" stroke-width="${i % 2 ? 2.6 : 2}" fill="none" opacity=".7" stroke-linecap="round"/>`; });
    return `<g class="gt-novelo-sombra"><ellipse cx="0" cy="0" rx="42" ry="9" fill="url(#gato-sombra-chao)"/></g>
      <path class="gt-fio" d="" stroke="#D75478" stroke-width="3" fill="none" stroke-linecap="round"/>
      <g class="gt-novelo"><circle r="${NOV.r}" fill="url(#gato-novelo)" stroke="#8A2E4A" stroke-width="2.5"/>
        <clipPath id="gato-clip-novelo"><circle r="${NOV.r - 1}"/></clipPath>
        <g clip-path="url(#gato-clip-novelo)"><g class="gt-novelo-rot">${fios}</g></g>
        <ellipse cx="-11" cy="-13" rx="10" ry="6" fill="#FFFFFF" opacity=".28" transform="rotate(-30 -11 -13)"/></g>`;
  }
  function moscaSVG() {
    return `<g class="gt-mosca" display="none"><g transform="scale(1.5)">
      <ellipse class="gt-asaM" cx="-3" cy="-6" rx="7" ry="3.6" fill="#E8F0F8" opacity=".7" stroke="#9AA6B2" stroke-width=".6" transform="rotate(-28)"/>
      <ellipse class="gt-asaM" cx="2" cy="-6" rx="7" ry="3.6" fill="#E8F0F8" opacity=".7" stroke="#9AA6B2" stroke-width=".6" transform="rotate(22)"/>
      <ellipse cx="0" cy="0" rx="6.5" ry="4.3" fill="#2C2A30"/><circle cx="6.5" cy="-1" r="3.6" fill="#3A3640"/><circle cx="8" cy="-2" r="1.7" fill="#B8323A"/>
      <path d="M-3,3 L-5,7 M1,4 L0,8 M4,3 L5,7" stroke="#2C2A30" stroke-width=".9"/>
    </g></g>`;
  }
  function plantaSVG() {
    const folha = (i, ang, k, g) => `<g class="gt-folha${i}" transform="rotate(${ang} 150 784)"><g transform="translate(150,784) scale(${k})">
      <path d="M0,0 C4,-60 6,-120 2,-160" stroke="#3E6E2E" stroke-width="5" fill="none"/>
      <path d="M2,-140 C46,-170 64,-250 2,-318 C-58,-250 -42,-170 2,-140 Z" fill="url(#${g})" stroke="#2C5A26" stroke-width="2.5"/>
      <path d="M2,-144 C4,-200 4,-260 2,-312" stroke="#C8E6A0" stroke-width="2.4" fill="none" opacity=".7"/>
      <path d="M3,-180 C18,-196 30,-206 40,-214 M3,-220 C16,-236 26,-246 34,-258 M2,-180 C-14,-196 -26,-206 -36,-214 M2,-220 C-12,-236 -22,-246 -30,-258 M3,-262 C10,-274 16,-282 20,-290 M2,-262 C-6,-274 -12,-282 -16,-290" stroke="#C8E6A0" stroke-width="1.6" fill="none" opacity=".5"/>
    </g></g>`;
    return `<g>
      ${folha(0, -58, .62, 'gato-folha2')}${folha(1, -30, .76, 'gato-folha')}${folha(2, 2, .84, 'gato-folha2')}${folha(3, 30, .72, 'gato-folha')}${folha(4, 56, .58, 'gato-folha2')}
      <ellipse cx="156" cy="904" rx="96" ry="14" fill="#3A1E0C" opacity=".3"/>
      <path d="M78,794 L222,794 L208,910 L92,910 Z" fill="url(#gato-vaso)" stroke="#7A3A1E" stroke-width="3"/>
      <path d="M90,820 L210,820" stroke="#F2A57C" stroke-width="3" opacity=".5"/>
      <rect x="70" y="778" width="160" height="24" rx="6" fill="#D8784A" stroke="#7A3A1E" stroke-width="3"/><rect x="76" y="781" width="148" height="5" rx="2.5" fill="#F4A882" opacity=".7"/>
      <ellipse cx="150" cy="784" rx="70" ry="7" fill="#4A2E1A"/>
    </g>`;
  }

  /* --- Cesto de vime: parte de trás (interior, almofada, aro de trás) e parte da frente (parede tecida, aro da frente) --- */
  function paredeCesto() {
    const { cx, aroY, rx, ry, base, brx, bry } = K, by = base - bry;
    return `M${cx - rx},${aroY} C${cx - rx - 4},${aroY + 46} ${cx - brx - 10},${by - 30} ${cx - brx},${by} A${brx},${bry} 0 0 0 ${cx + brx},${by} C${cx + brx + 10},${by - 30} ${cx + rx + 4},${aroY + 46} ${cx + rx},${aroY} A${rx},${ry} 0 0 1 ${cx - rx},${aroY} Z`;
  }
  function aroSVG(a0, a1, frente) {
    const { cx, aroY, rx, ry } = K;
    const pt = a => [cx + rx * Math.cos(a), aroY + ry * Math.sin(a)];
    const [x0, y0] = pt(a0), [x1, y1] = pt(a1);
    const arco = (dy = 0) => `M${n(x0)},${n(y0 + dy)} A${rx},${ry} 0 0 1 ${n(x1)},${n(y1 + dy)}`;
    let s = `<path d="${arco()}" fill="none" stroke="#6E431B" stroke-width="31" stroke-linecap="round"/>`;
    s += `<path d="${arco()}" fill="none" stroke="url(#gato-vime)" stroke-width="25" stroke-linecap="round"/>`;
    const N = frente ? 34 : 28;
    for (let i = 0; i <= N; i++) {
      const a = lerp(a0, a1, i / N), [x, y] = pt(a);
      const tg = Math.atan2(ry * Math.cos(a), -rx * Math.sin(a)) / RAD;
      s += `<ellipse rx="13.5" ry="7.5" transform="translate(${n(x)},${n(y)}) rotate(${n(tg + 40)})" fill="url(#gato-vime-n)" stroke="#6E431B" stroke-width="1.4"/>`;
    }
    if (frente) s += `<path d="${arco(-8)}" fill="none" stroke="#FFE6B4" stroke-width="3" opacity=".45" stroke-linecap="round"/>`;
    else s += `<path d="${arco(-6)}" fill="none" stroke="#FFE6B4" stroke-width="2" opacity=".25" stroke-linecap="round"/>`;
    return s;
  }
  function cestoTrasSVG() {
    const { cx, aroY, rx, ry } = K;
    let s = `<rect x="${cx - 220}" y="540" width="440" height="296" fill="#000" fill-opacity="0"/>`;     // zona de toque do cesto
    s += `<ellipse cx="${cx}" cy="${aroY}" rx="${rx - 12}" ry="${ry - 8}" fill="url(#gato-vime-dentro)"/>`;
    let tec = '';
    for (let k = 1; k <= 6; k++) tec += `<path d="M${cx - rx + 12},${aroY + k * 9 - 6} A${rx - 12},${ry - 8} 0 0 1 ${cx + rx - 12},${aroY + k * 9 - 6}" stroke="#4A2C10" stroke-width="2" fill="none" opacity=".45"/>`;
    for (let i = 1; i < 18; i++) { const a = PI + i / 18 * PI, x = cx + (rx - 12) * Math.cos(a), y = aroY + (ry - 8) * Math.sin(a); tec += `<path d="M${n(x)},${n(y)} L${n(x * .96 + cx * .04)},${n(y + 60)}" stroke="#3E240C" stroke-width="3" opacity=".35"/>`; }
    s += `<g clip-path="url(#gato-clip-dentro)">${tec}<ellipse cx="${cx}" cy="${aroY - 18}" rx="${rx}" ry="${ry}" fill="#2A1404" opacity=".25"/></g>`;
    s += `<g class="gt-almofada">${almofadaSVG()}</g>`;
    s += aroSVG(PI, 2 * PI, false);
    return s;
  }
  function almofadaSVG() {
    const cx = K.cx, y = K.chao - 14;
    let pontos = '';
    const r = semente(5);
    for (let i = 0; i < 26; i++) { const a = r() * 2 * PI, d = Math.sqrt(r()); pontos += `<circle cx="${n(cx + Math.cos(a) * d * 140)}" cy="${n(y + Math.sin(a) * d * 26)}" r="2.2" fill="#FFFFFF" opacity=".45"/>`; }
    return `<ellipse cx="${cx}" cy="${y + 12}" rx="168" ry="38" fill="#5D80A8"/>
      <ellipse cx="${cx}" cy="${y}" rx="164" ry="35" fill="url(#gato-almofada)"/>
      ${pontos}
      <ellipse cx="${cx}" cy="${y}" rx="152" ry="29" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity=".5" stroke-dasharray="7 6"/>
      <ellipse class="gt-covinha" cx="${cx + 10}" cy="${y + 6}" rx="130" ry="22" fill="#3E6189" opacity="0"/>
      <ellipse cx="${cx - 60}" cy="${y - 12}" rx="60" ry="9" fill="#FFFFFF" opacity=".25"/>`;
  }
  function cestoFrenteSVG() {
    const { cx, aroY, rx, ry, base, brx, bry } = K, by = base - bry;
    const C = 22, R = 6;
    let tec = '';
    for (let c = 0; c <= C; c++) {
      const a = c / C * PI;
      tec += `<path d="M${n(cx + rx * Math.cos(a))},${n(aroY + ry * Math.sin(a))} L${n(cx + brx * Math.cos(a))},${n(by + bry * Math.sin(a))}" stroke="#5E3814" stroke-width="5"/>`;
    }
    for (let r = 0; r < R; r++) {
      const t = (r + .55) / R, ecy = lerp(aroY + 6, by, t), erx = lerp(rx, brx, t), ery = lerp(ry, bry, t);
      for (let c = 0; c <= C; c++) {
        const a = (c + (r % 2 ? .5 : 0)) / C * PI;
        if (a > PI + .01) continue;
        const x = cx + erx * Math.cos(a), y = ecy + ery * Math.sin(a);
        const dx = -erx * Math.sin(a), dy = ery * Math.cos(a);
        const L = Math.max(3, Math.hypot(dx, dy) * (PI / C) * .5 * .96);
        tec += `<ellipse transform="translate(${n(x)},${n(y)}) rotate(${n(Math.atan2(dy, dx) / RAD)})" rx="${n(L)}" ry="8" fill="url(#gato-vime-n)" stroke="#6E431B" stroke-width="1.3"/>`;
      }
    }
    const medalha = `<g class="gt-medalha"><path d="M${cx + 70},${aroY + 40} L${cx + 70},${aroY + 62}" stroke="#7A4A1E" stroke-width="2"/>
      <path transform="translate(${cx + 70},${aroY + 78})" d="M0,14 C-14,4 -20,-4 -16,-11 C-12,-18 -3,-17 0,-10 C3,-17 12,-18 16,-11 C20,-4 14,4 0,14 Z" fill="#E8657A" stroke="#9A2E44" stroke-width="2"/>
      <g transform="translate(${cx + 70},${aroY + 76})" fill="#FFF3E6"><ellipse cx="0" cy="2" rx="4" ry="3.2"/><circle cx="-5" cy="-3" r="1.7"/><circle cx="-1.7" cy="-5.5" r="1.7"/><circle cx="1.7" cy="-5.5" r="1.7"/><circle cx="5" cy="-3" r="1.7"/></g></g>`;
    return `<path d="${paredeCesto()}" fill="url(#gato-vime)" stroke="#5E3814" stroke-width="3"/>
      <g clip-path="url(#gato-clip-parede)">${tec}<rect x="${cx - rx - 10}" y="${aroY}" width="${2 * rx + 20}" height="${base - aroY + 4}" fill="url(#gato-vime-sombra)"/><rect x="${cx - rx - 10}" y="${aroY}" width="${2 * rx + 20}" height="${base - aroY + 4}" fill="url(#gato-vime-baixo)"/></g>
      ${aroSVG(0, PI, true)}${medalha}`;
  }

  /* ================= 4) Ícone do menu (retrato parado: gato a espreitar do cesto) ================= */
  function iconeSVG() {
    const p = 'gato-icone-';
    let tranca = '';
    for (let i = 0; i <= 12; i++) tranca += `<ellipse cx="${n(20 + i * 15)}" cy="${n(196 + Math.sin(i / 12 * PI) * 6)}" rx="10" ry="6" transform="rotate(38 ${n(20 + i * 15)} ${n(196 + Math.sin(i / 12 * PI) * 6)})" fill="url(#${p}vime)" stroke="#6E431B" stroke-width="1.2"/>`;
    return `<defs>${defsGato(p)}<radialGradient id="${p}fundo" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFF6E2"/><stop offset="1" stop-color="#F2D7AE"/></radialGradient>
      <radialGradient id="${p}vime" cx=".4" cy=".3" r=".75"><stop offset="0" stop-color="#F6CF92"/><stop offset=".65" stop-color="#CC914B"/><stop offset="1" stop-color="#97612E"/></radialGradient></defs>
      <circle cx="110" cy="110" r="106" fill="url(#${p}fundo)"/>
      <ellipse cx="110" cy="196" rx="96" ry="22" fill="#5D80A8"/>
      <g transform="translate(110,168) scale(.62)"><ellipse cx="0" cy="20" rx="78" ry="70" fill="url(#${p}pelo)" stroke="${COR.cont}" stroke-width="4"/>
        <path d="M-34,-26 C-12,-38 12,-38 34,-26 C44,4 36,40 22,62 L14,54 L6,66 L-2,55 L-10,66 L-18,54 C-34,34 -44,4 -34,-26 Z" fill="url(#${p}branco)"/></g>
      <g transform="translate(110,104) scale(.74)">${cabecaSVG(p, { pupila: .55 })}</g>
      <g transform="translate(80,186) scale(.8)"><path d="${SEG.pataF}" fill="url(#${p}branco)" stroke="${COR.cont}" stroke-width="3.5"/><path d="M9,6 C10,9 10,11 9,14 M18,3 C20,7 20,10 19,13" stroke="#C4A88E" stroke-width="1.8" fill="none"/></g>
      <g transform="translate(128,186) scale(.8)"><path d="${SEG.pataF}" fill="url(#${p}branco)" stroke="${COR.cont}" stroke-width="3.5"/><path d="M9,6 C10,9 10,11 9,14 M18,3 C20,7 20,10 19,13" stroke="#C4A88E" stroke-width="1.8" fill="none"/></g>
      <path d="M14,198 C60,214 160,214 206,198" stroke="#6E431B" stroke-width="20" fill="none" stroke-linecap="round"/>
      <path d="M14,198 C60,214 160,214 206,198" stroke="#C98E48" stroke-width="15" fill="none" stroke-linecap="round"/>${tranca}`;
  }

  /* ================= 5) Poses (dados) ================= */
  // Coordenadas do gato virado para a direita, com o chão em y = 0 (o «flip» espelha quando está virado para a esquerda).
  const SENTADO = {
    hipX: -30, hipY: -76, spA: -62, spL: 140, corpoSy: 1, cabX: 22, cabY: -78, cabR: 0, cabYaw: .3, pitch: 0,
    fLx: 82, fLy: 0, fNx: 66, fNy: 0, tLx: 30, tLy: 0, tNx: 44, tNy: 0, mtL: 88, mtN: 88, patL: 0, patN: 0, patT: 0,
    cB: -182, cC: 6, cP: 18, cO: 5, cV: .35, cEsc: 1, cBx: -84, cBy: -18, inclina: 0, ombro: 0
  };
  const EM_PE = {
    hipX: -75, hipY: -190, spA: -4, spL: 140, corpoSy: 1, cabX: 72, cabY: -58, cabR: 0, cabYaw: .45, pitch: 0,
    fLx: 50, fLy: 0, fNx: 64, fNy: 0, tLx: -66, tLy: 0, tNx: -54, tNy: 0, mtL: 12, mtN: 12, patL: 0, patN: 0, patT: 0,
    cB: -96, cC: 5, cP: 24, cO: 7, cV: .45, cEsc: 1, cBx: -84, cBy: -18, inclina: 0, ombro: 0
  };
  const AGACHADO = {
    hipX: -72, hipY: -135, spA: 8, spL: 140, corpoSy: 1, cabX: 82, cabY: -22, cabR: 4, cabYaw: .5, pitch: .25,
    fLx: 50, fLy: 0, fNx: 64, fNy: 0, tLx: -66, tLy: 0, tNx: -54, tNy: 0, mtL: 45, mtN: 45, patL: 0, patN: 0,
    cB: -188, cC: -1, cP: 12, cO: 3, cV: .6
  };
  const SALTO = {
    hipX: -90, hipY: -175, spA: -2, spL: 160, corpoSy: .95, cabX: 80, cabY: -55, cabR: -4, pitch: -.1,
    fLx: 150, fLy: -40, fNx: 165, fNy: -28, tLx: -165, tLy: -80, tNx: -150, tNy: -70, mtL: 72, mtN: 70, patL: 30, patN: 30,
    cB: -178, cC: -1, cP: 4, cO: 2
  };
  const ATERRAR_AR = {
    hipX: -80, hipY: -182, spA: 6, spL: 148, corpoSy: .97, cabX: 78, cabY: -50, pitch: .1,
    fLx: 50, fLy: 0, fNx: 64, fNy: 0, tLx: -66, tLy: -18, tNx: -54, tNy: -10, mtL: 40, mtN: 40, patL: -10, patN: -10
  };
  const ATERRAR = { hipY: -150, spA: 4, corpoSy: 1.07, cabY: -42, pitch: .2, mtL: 30, mtN: 30, tLy: 0, tNy: 0, tLx: -66, tNx: -54, fLx: 50, fNx: 64, fLy: 0, fNy: 0, inclina: 0 };
  const ENROLADO = {
    hipX: -55, hipY: -62, spA: 4, spL: 106, corpoSy: 1.14, cabX: 54, cabY: -22, cabR: 16, cabYaw: .2, pitch: .35,
    fLx: 86, fLy: -8, fNx: 98, fNy: -6, tLx: 2, tLy: -4, tNx: 14, tNy: -2, mtL: 88, mtN: 88, patL: 10, patN: 10,
    cB: -198, cC: 2, cP: 20, cO: 1.5, cV: .25, cEsc: -1, cBx: -86, cBy: 20, inclina: 0, ombro: 0
  };
  const PAO = {
    hipX: -62, hipY: -98, spA: 3, spL: 132, corpoSy: 1.08, cabX: 66, cabY: -58, cabR: 0, cabYaw: .35, pitch: .05,
    fLx: 76, fLy: -6, fNx: 92, fNy: -4, patL: 40, patN: 40, tLx: -20, tLy: 0, tNx: -6, tNy: 0, mtL: 86, mtN: 86,
    cB: -178, cC: 0, cP: 12, cO: 2.5, cV: .3, cEsc: -1, cBx: -90, cBy: 30
  };
  const ESPREGUICAR = {
    hipX: -85, hipY: -200, spA: 30, spL: 150, corpoSy: .95, cabX: 70, cabY: 30, cabR: 8, cabYaw: .35, pitch: -.2,
    fLx: 140, fLy: 0, fNx: 155, fNy: 0, patL: -10, patN: -10, tLx: -70, tLy: 0, tNx: -58, tNy: 0, mtL: 8, mtN: 8,
    cB: -80, cC: 4, cP: 20, cO: 3
  };
  const ROSTO = { olhos: 1, feliz: 0, pupila: .35, oE: 0, oD: 0, oEs: 1, oDs: 1, bocaB: 0, lingua: 0, bigode: 0, sobr: 0, almof: 0, yawM: 0, cabRm: 0 };

  /* ================= montar() ================= */
  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .4 : 1;          // movimento reduzido: o cenário mexe-se menos
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.innerHTML = `<defs>${defsGato('gato-')}${defsCena()}</defs>
      ${paredeSVG()}${janelaSVG()}${cortinasSVG()}${relogioSVG()}${estanteSVG()}${chaoSVG()}${tapeteSVG()}${luzSVG()}
      <g class="gt-habitat">
        <ellipse cx="${K.cx + 14}" cy="${K.base + 2}" rx="214" ry="30" fill="url(#gato-sombra-chao)"/>
        <g class="gt-cestoTras">${cestoTrasSVG()}</g>
        ${gatoSVG('gato-')}
        <g class="gt-cestoFrente">${cestoFrenteSVG()}</g>
      </g>
      ${noveloSVG()}${plantaSVG()}${moscaSVG()}
      <rect width="1600" height="900" fill="url(#gato-vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s), qa = s => Array.from(svg.querySelectorAll(s));
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function poeT(lista, v) { for (const e of lista) poe(e, v); }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; el.setAttribute(nome, v); } }

    /* --- referências do rig --- */
    const perna = nome => ({ braco: qa(`.gt-${nome}-braco`), antebraco: qa(`.gt-${nome}-antebraco`), coxa: qa(`.gt-${nome}-coxa`), canela: qa(`.gt-${nome}-canela`), metatarso: qa(`.gt-${nome}-metatarso`), pata: qa(`.gt-${nome}-pata`) });
    const R = {
      habitat: q('.gt-habitat'), gato: q('.gt-gato'), sombra: q('.gt-sombra'), flip: q('.gt-flip'), flip2: q('.gt-flip2'),
      tronco: q('.gt-tronco'), peito: q('.gt-peito'), frente: q('.gt-frente'), frenteP: q('.gt-frente-pernas'), frentePatas: q('.gt-frente-patas'),
      cab: q('.gt-cab'), testa: q('.gt-testa'), cara: q('.gt-cara'), focinhoF: q('.gt-focinhoF'), focinho: q('.gt-focinho'),
      olhoE: q('.gt-olhoE'), olhoD: q('.gt-olhoD'), irisE: q('.gt-irisE'), irisD: q('.gt-irisD'), pupE: q('.gt-pupilaE'), pupD: q('.gt-pupilaD'),
      palp: ['E', 'D'].map(l => ({ s: q('.gt-palpS' + l), i: q('.gt-palpI' + l), c: q('.gt-cil' + l), ci: q('.gt-cilI' + l), o: q('.gt-contOlho' + l) })),
      orelhaE: q('.gt-orelhaE'), orelhaD: q('.gt-orelhaD'), sobr: q('.gt-sobr'), bigE: q('.gt-bigE'), bigD: q('.gt-bigD'),
      queixo: q('.gt-queixo'), bocaInt: q('.gt-bocaInt'), lingua: q('.gt-lingua'), dentes: q('.gt-dentes'), almof: q('.gt-almof'),
      cauda: Array.from({ length: NC }, (_, i) => qa('.gt-c' + i)), caudaG: q('.gt-cauda'),
      slotCauda: q('.gt-slotCauda'), slotCaudaF: q('.gt-slotCaudaF'), slotPata: q('.gt-slotPata'), slotPataF: q('.gt-slotPataF'), fNg2: q('.gt-fN-g2'),
      pL: perna('fL'), pN: perna('fN'), tL: perna('tL'), tN: perna('tN'),
      cestoTras: q('.gt-cestoTras'), cestoFrente: q('.gt-cestoFrente'), almofada: q('.gt-almofada'), covinha: q('.gt-covinha'), medalha: q('.gt-medalha'),
      nuvens: [0, 1, 2].map(i => q('.gt-nuvem' + i)), cortES: q('.gt-cortE-sup'), cortEI: q('.gt-cortE-inf'), cortDS: q('.gt-cortD-sup'), cortDI: q('.gt-cortD-inf'),
      pendulo: q('.gt-pendulo'), pH: q('.gt-ponteiroH'), pM: q('.gt-ponteiroM'), pS: q('.gt-ponteiroS'), arvore: q('.gt-arvore'), flores: q('.gt-flores'),
      poeiras: Array.from({ length: 22 }, (_, i) => q('.gt-p' + i)), folhas: [0, 1, 2, 3, 4].map(i => q('.gt-folha' + i)), hera: [0, 1].map(i => q('.gt-hera' + i)),
      passaro: q('.gt-passaro'), ave: q('.gt-ave'), aveAsa: q('.gt-ave-asa'), aveCab: q('.gt-ave-cab'),
      mosca: q('.gt-mosca'), asasM: qa('.gt-asaM'), novelo: q('.gt-novelo'), noveloRot: q('.gt-novelo-rot'), noveloSombra: q('.gt-novelo-sombra'), fio: q('.gt-fio')
    };

    /* --- estado da pose (todos os números que o desenho lê a cada quadro) --- */
    const P = Object.assign({
      x: REPOUSO.x, y: REPOUSO.y, sx: -1, sobe: 0, afunda: 0,
      yawG: 0, pitchG: 0, olharX: 0, olharY: 0,
      boca: 0, somP: 0, somR: 0, somY: 0, somFecha: 0, respA: 1, respF: .42, pataFrente: 0
    }, SENTADO, ROSTO);
    let modo = 'fora';                    // 'fora' | 'indo' | 'dentro' | 'voltando'
    let dentroCesto = false;              // o gato está apoiado na almofada (abana com o cesto)
    let reagindo = false;
    let tempo = 0, vivo = true;
    const fase = { resp: 0, cauda: 0 };
    const cabMundo = [0, 0];
    const novelo = { x: NOV.x };
    let cestoAng = 0;

    /* --- impulsos curtos que se somam à pose (orelhas, bigodes, ponta da cauda, cesto) --- */
    const impulsos = [];
    const IMP = { twE: 0, twD: 0, twB: 0, flick: 0, cesto: 0 };
    function impulso(chave, amp, dur, tipo) { impulsos.push({ chave, amp, dur, t: 0, tipo: tipo || 'sino' }); }
    function atualizarImpulsos(dt) {
      for (const k in IMP) IMP[k] = 0;
      for (let i = impulsos.length - 1; i >= 0; i--) {
        const m = impulsos[i]; m.t += dt;
        const u = m.t / m.dur;
        if (u >= 1) { impulsos.splice(i, 1); continue; }
        let v;
        if (m.tipo === 'onda') v = Math.sin(u * PI * 3) * (1 - u);                       // abanão (ponta da cauda)
        else if (m.tipo === 'mola') v = Math.exp(-u * 4) * Math.sin(u * PI * 7);          // amortecido (cesto)
        else v = Math.sin(PI * u) * (u < .3 ? 1 : 1 - (u - .3) * .4);                       // sobe e volta
        IMP[m.chave] += m.amp * v;
      }
    }

    /* --- geometria: do referencial do gato (virado à direita, chão em y=0) para o cenário --- */
    function paraMundo(px, py, X, Y, sxv) {
      const a = P.inclina * RAD, c = Math.cos(a), s = Math.sin(a);
      const qx = px * c - (py + 150) * s, qy = px * s + (py + 150) * c - 150;
      return [X + qx * sxv * ESC, Y + qy * ESC];
    }
    function ik(J, T, l1, l2, dobra) {
      let dx = T[0] - J[0], dy = T[1] - J[1], d = Math.hypot(dx, dy) || .001;
      const dmax = l1 + l2 - .5, dmin = Math.abs(l1 - l2) + 2;
      const dd = limita(d, dmin, dmax);
      dx *= dd / d; dy *= dd / d;
      const base = Math.atan2(dy, dx);
      const a1 = base + dobra * Math.acos(limita((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1));
      const K1 = [J[0] + l1 * Math.cos(a1), J[1] + l1 * Math.sin(a1)];
      const E = [J[0] + dx, J[1] + dy];
      return { a1, a2: Math.atan2(E[1] - K1[1], E[0] - K1[0]), K: K1, E };
    }
    const tr = (x, y, r) => `translate(${n(x)},${n(y)}) rotate(${n(r)})`;
    function pernaFrente(pp, J, fx, fy, pat) {
      const s = ik(J, [fx - 4, fy - 14], BR, AB, 1);
      poeT(pp.braco, tr(J[0], J[1], s.a1 / RAD - 90));
      poeT(pp.antebraco, tr(s.K[0], s.K[1], s.a2 / RAD - 90));
      poeT(pp.pata, tr(s.E[0], s.E[1], pat));
    }
    function pernaTras(pp, J, fx, fy, mt) {
      const Pp = [fx - 4, fy - 14], m = mt * RAD;
      const s = ik(J, [Pp[0] - MT * Math.sin(m), Pp[1] - MT * Math.cos(m)], CXA, CN, -1);
      let vx = Pp[0] - s.E[0], vy = Pp[1] - s.E[1]; const vl = Math.hypot(vx, vy) || 1; vx /= vl; vy /= vl;
      const fim = [s.E[0] + MT * vx, s.E[1] + MT * vy];
      poeT(pp.coxa, tr(J[0], J[1], s.a1 / RAD - 90));
      poeT(pp.canela, tr(s.K[0], s.K[1], s.a2 / RAD - 90));
      poeT(pp.metatarso, tr(s.E[0], s.E[1], Math.atan2(vy, vx) / RAD - 90));
      poeT(pp.pata, tr(fim[0], fim[1], P.patT));
    }

    /* --- desenhar: lê P e põe as transformações em todas as peças --- */
    let caudaNaFrente = false, pataNaFrente = false;
    function desenhar() {
      const sxv = Math.abs(P.sx) < .02 ? (P.sx < 0 ? -.02 : .02) : P.sx;
      const X = P.x, Y = P.y + P.sobe + (dentroCesto ? P.afunda : 0);
      const resp = Math.sin(fase.resp) * P.respA;
      const k = P.spL / 140, a = P.spA * RAD, ca = Math.cos(a), sa = Math.sin(a);
      const sy = P.corpoSy * (1 + .022 * resp);
      const H0 = P.hipX, H1 = P.hipY - resp * 1.2;
      const loc = (lx, ly) => [H0 + lx * k * ca - ly * sy * sa, H1 + lx * k * sa + ly * sy * ca];
      const S = loc(140, 0);

      // o gato abana com o cesto quando está lá dentro
      poe(R.gato, dentroCesto ? `rotate(${n3(cestoAng)},${K.cx},${K.base})` : 'translate(0,0)');
      const fT = `translate(${n(X)},${n(Y)}) scale(${n3(sxv * ESC)},${ESC}) rotate(${n(P.inclina)},0,-150)`;
      poe(R.flip, fT); poe(R.flip2, fT);
      poe(R.tronco, `translate(${n(H0)},${n(H1)}) rotate(${n(P.spA)}) scale(${n3(k)},${n3(sy)})`);

      // patas (IK: os pés ficam onde a pose manda, o resto dobra-se)
      const jF = loc(128, 30), jT = loc(0, 16);
      pernaFrente(R.pL, jF, P.fLx, P.fLy, P.patL);
      pernaFrente(R.pN, [jF[0] + 6, jF[1] + 2], P.fNx, P.fNy, P.patN);
      pernaTras(R.tL, jT, P.tLx, P.tLy, P.mtL);
      pernaTras(R.tN, [jT[0] + 4, jT[1] + 2], P.tNx, P.tNy, P.mtN);
      const pc = loc(150, 18);
      poe(R.peito, `translate(${n(pc[0])},${n(pc[1] + P.ombro)}) rotate(${n(P.spA * .4)})`);
      atr(R.almof, 'opacity', n3(P.almof));

      // cauda: cadeia de segmentos com onda (a ponta atrasa-se); cEsc encurta-a em x quando roda à volta do corpo
      let ang = P.cB, [cx0, cy0] = loc(P.cBx, P.cBy);
      for (let i = 0; i < NC; i++) {
        const u = i / (NC - 1);
        if (i > 0) ang += P.cC + P.cP * u * u;
        const onda = P.cO * Math.sin(fase.cauda - i * .55) * (.25 + .75 * u) + IMP.flick * u * u * u;
        const A = (ang + onda) * RAD, dx = Math.cos(A) * P.cEsc, dy = Math.sin(A), f = Math.hypot(dx, dy);
        poeT(R.cauda[i], `translate(${n(cx0)},${n(cy0)}) rotate(${n(Math.atan2(dy, dx) / RAD)}) scale(${n3(Math.max(f, .2))},1)`);
        cx0 += LC * dx; cy0 += LC * dy;
      }
      const querCaudaF = P.cEsc < 0;
      if (querCaudaF !== caudaNaFrente) { caudaNaFrente = querCaudaF; (querCaudaF ? R.slotCaudaF : R.slotCauda).appendChild(R.caudaG); }
      const querPataF = P.pataFrente > .5;
      if (querPataF !== pataNaFrente) { pataNaFrente = querPataF; (querPataF ? R.slotPataF : R.slotPata).appendChild(R.fNg2); }

      // corpo de frente (só a meio das viragens)
      const w = 1 - Math.abs(P.sx);
      if (w > .03) {
        const sw = paraMundo(S[0], S[1] + 10, X, Y, sxv), alt = Math.max(20, (Y - sw[1]) / ESC);
        atr(R.frente, 'display', 'inline');
        poe(R.frente, `translate(${n(sw[0])},${n(sw[1])}) scale(${n3(Math.min(1, w * 1.25) * ESC)},${ESC})`);
        poe(R.frenteP, `scale(1,${n3(alt / 100)})`);
        poe(R.frentePatas, `translate(0,${n(alt)})`);
      } else atr(R.frente, 'display', 'none');

      // cabeça
      const pn = [S[0] + P.cabX, S[1] + P.cabY + P.somY + resp * 1.6];
      const hw = paraMundo(pn[0], pn[1], X, Y, sxv);
      cabMundo[0] = hw[0]; cabMundo[1] = hw[1];
      const rot = (P.cabR + P.inclina) * sxv + P.cabRm + P.somR;
      poe(R.cab, `translate(${n(hw[0])},${n(hw[1])}) rotate(${n(rot)}) scale(${ESC})`);
      const yaw = limita(P.cabYaw * sxv + P.yawM + P.yawG, -1, 1);
      const pit = limita(P.pitch + P.pitchG + P.somP, -1, 1);
      poe(R.testa, `translate(${n(yaw * 8)},${n(pit * 4)})`);
      poe(R.focinhoF, `translate(${n(yaw * 18)},${n(pit * 8)})`);
      poe(R.cara, `translate(${n(yaw * 14)},${n(pit * 7)})`);
      poe(R.focinho, `translate(${n(yaw * 22)},${n(pit * 9)})`);
      poe(R.olhoE, `translate(-37,-13) rotate(8) scale(${n3(1 - Math.max(0, yaw) * .24 + Math.max(0, -yaw) * .05)},1)`);
      poe(R.olhoD, `translate(37,-13) rotate(-8) scale(${n3(1 - Math.max(0, -yaw) * .24 + Math.max(0, yaw) * .05)},1)`);
      poe(R.orelhaE, `translate(${n(-50 - yaw * 6)},${n(-50 - pit * 3)}) rotate(${n(-(16 + P.oE + IMP.twE))}) scale(${n3(P.oEs * (1 - Math.max(0, yaw) * .16))},1)`);
      poe(R.orelhaD, `translate(${n(50 - yaw * 6)},${n(-50 - pit * 3)}) rotate(${n(16 + P.oD + IMP.twD)}) scale(${n3(P.oDs * (1 - Math.max(0, -yaw) * .16))},1)`);
      poe(R.sobr, `translate(0,${n(-P.sobr * 4)})`);
      // olhos: pálpebras, pupilas, olhar
      const fecho = limita(1 - P.olhos * (1 - piscar) + P.somFecha, 0, 1);
      R.palp.forEach((e, i) => { const L = palpebras(fecho, P.feliz, i ? 'D' : 'E');
        atr(e.s, 'd', L.sup); atr(e.i, 'd', L.inf); atr(e.c, 'd', L.cil); atr(e.ci, 'd', L.cilI); atr(e.ci, 'opacity', n3(.7 * (1 - P.feliz))); atr(e.o, 'opacity', n3(limita(L.abre * 1.6, 0, 1))); });
      const rx = n(3 + 13 * P.pupila), ry = n(18 + 3 * P.pupila);
      atr(R.pupE, 'rx', rx); atr(R.pupD, 'rx', rx); atr(R.pupE, 'ry', ry); atr(R.pupD, 'ry', ry);
      const ir = `translate(${n(P.olharX * 6)},${n(P.olharY * 5)})`;
      poe(R.irisE, ir); poe(R.irisD, ir);
      // boca
      const b = limita(Math.max(P.boca, P.bocaB), 0, 1), lg = limita(P.lingua, 0, 1);
      if (b > .01 || lg > .01) {
        const B = bocaD(b, lg);
        atr(R.bocaInt, 'display', 'inline'); atr(R.lingua, 'display', 'inline');
        atr(R.bocaInt, 'd', B.int); atr(R.lingua, 'd', B.lin);
        atr(R.dentes, 'opacity', n3(limita((b - .3) * 2, 0, 1)));
      } else { atr(R.bocaInt, 'display', 'none'); atr(R.lingua, 'display', 'none'); atr(R.dentes, 'opacity', '0'); }
      poe(R.queixo, `translate(0,${n(b * 20)})`);
      const bg = P.bigode + IMP.twB;
      poe(R.bigE, `translate(-30,30) rotate(${n(bg)})`);
      poe(R.bigD, `translate(30,30) scale(-1,1) rotate(${n(bg)})`);

      // sombra no chão
      if (!dentroCesto) {
        const xs = X + sxv * ESC * ((P.hipX + S[0]) / 2), alto = limita((CHAO - Y) / 220, 0, 1);
        const sobreCesto = xs > K.cx - K.rx + 30 && Y < CHAO - 20;
        const larg = (Math.abs(Math.max(P.fNx, P.fLx) - Math.min(P.tNx, P.tLx)) / 2 + 70) * ESC * (.6 + .4 * Math.abs(P.sx)) * (1 - alto * .4);
        atr(R.sombra, 'opacity', sobreCesto ? '0' : n3(1 - alto * .7));
        poe(R.sombra, `translate(${n(xs)},${CHAO}) scale(${n3(larg / 120)},1)`);
      } else atr(R.sombra, 'opacity', '0');

      // cesto: abana e a almofada afunda
      const tc = `rotate(${n3(cestoAng)},${K.cx},${K.base})`;
      poe(R.cestoTras, tc); poe(R.cestoFrente, tc);
      poe(R.almofada, `translate(0,${n(P.afunda * .7)})`);
      atr(R.covinha, 'opacity', n3(limita(P.afunda / 12, 0, 1) * .35));
      poe(R.medalha, `rotate(${n(-cestoAng * 5 + Math.sin(tempo / 900) * 2)},${K.cx + 70},${K.aroY + 40})`);
    }

    /* --- piscar, olhar, tremores de orelhas e bigodes --- */
    let piscar = 0;
    const pisca = { t: aleat(1500, 3500), f: -1, duplo: false };
    function atualizarPiscar(dt) {
      if (pisca.f < 0) {
        pisca.t -= dt; piscar = 0;
        if (pisca.t <= 0) { pisca.f = 0; pisca.duplo = !pisca.duplo && Math.random() < .25; }
        return;
      }
      pisca.f += dt;
      const u = pisca.f / 180;
      piscar = u < .4 ? esai(u / .4) : 1 - eseno(limita((u - .4) / .6, 0, 1));
      if (u >= 1) { piscar = 0; pisca.f = -1; pisca.t = pisca.duplo ? 110 : aleat(2000, 6000) * (modo === 'dentro' ? 1.6 : 1); }
    }
    const olhar = { foco: null, t: 0, ax: 0, ay: 0 };
    function atualizarOlhar(dt) {
      let ax, ay, ayaw = 0, apit = 0;
      if (olhar.foco) {
        const f = olhar.foco(), dx = f[0] - cabMundo[0], dy = f[1] - cabMundo[1];
        ax = limita(dx / 240, -1, 1); ay = limita(dy / 240, -1, 1);
        ayaw = limita(limita(dx / 420, -.85, .85) - (P.cabYaw * P.sx + P.yawM), -1.2, 1.2);
        apit = limita(dy / 380, -.5, .6);
      } else {
        olhar.t -= dt;
        if (olhar.t <= 0) {
          olhar.t = aleat(700, 2600);
          if (Math.random() < .4) { olhar.ax = 0; olhar.ay = 0; } else { olhar.ax = aleat(-.6, .6); olhar.ay = aleat(-.35, .3); }
        }
        ax = olhar.ax; ay = olhar.ay;
      }
      const kO = 1 - Math.exp(-dt / 55), kC = 1 - Math.exp(-dt / (olhar.rapido ? 80 : 230));
      P.olharX += (ax - P.olharX) * kO; P.olharY += (ay - P.olharY) * kO;
      P.yawG += (ayaw - P.yawG) * kC; P.pitchG += (apit - P.pitchG) * kC;
    }
    const tiques = { orelha: aleat(2500, 6000), bigode: aleat(2000, 5000), ponta: aleat(3000, 7000) };
    function atualizarTiques(dt) {
      tiques.orelha -= dt; tiques.bigode -= dt; tiques.ponta -= dt;
      if (tiques.orelha <= 0) {
        tiques.orelha = aleat(2500, 7000);
        const k = Math.random() < .5 ? 'twE' : 'twD';
        impulso(k, aleat(14, 24), aleat(220, 320));
        if (Math.random() < .3) impulso(k, aleat(10, 16), 260);
      }
      if (tiques.bigode <= 0) { tiques.bigode = aleat(2000, 5500); impulso('twB', aleat(-7, 7), 260); }
      if (tiques.ponta <= 0) { tiques.ponta = modo === 'dentro' ? aleat(1800, 4000) : aleat(4000, 9000); impulso('flick', aleat(14, 24) * (Math.random() < .5 ? -1 : 1), aleat(550, 800), 'onda'); }
    }

    /* --- tarefas: geradores que avançam com o dt do relógio (uma por faixa; lançar outra na mesma faixa substitui) --- */
    const faixas = new Map();
    function lancar(nome, gen, fim) {
      if (!vivo) return;
      if (nome === 'corpo') olhar.foco = null;
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
    // transição de pose com passinhos das patas de trás (para levantar, sentar, deitar sem os pés deslizarem)
    //   cada pata que muda de sítio levanta-se e pousa (passos desfasados), em vez de escorregar
    function* transicao(alvo, ms, ease = eio, passos = true) {
      const ini = {}; for (const k in alvo) ini[k] = P[k];
      const pes = passos ? ['tN', 'fL', 'tL', 'fN'].filter(k => alvo[k + 'x'] != null && Math.abs(alvo[k + 'x'] - P[k + 'x']) > 6) : [];
      yield* durante(ms, u => {
        const e = ease(u);
        for (const k in alvo) P[k] = ini[k] + (alvo[k] - ini[k]) * e;
        pes.forEach((k, i) => {
          const a = pes.length > 1 ? i / (pes.length - 1) * .35 : 0, v = limita((u - a) / .65, 0, 1);
          P[k + 'x'] = lerp(ini[k + 'x'], alvo[k + 'x'], eseno(v));
          P[k + 'y'] = lerp(ini[k + 'y'], alvo[k + 'y'] || 0, v) - (k[0] === 'f' ? 15 : 18) * sino(v);
        });
      });
    }
    function* passinhos(ms) {      // patas da frente a pisar alternadamente (para dar a volta sem deslizar)
      yield* durante(ms, u => { P.fNy = -16 * sino(u / .5); P.fLy = -16 * sino((u - .45) / .5); P.patN = -20 * sino(u / .5); P.patL = -20 * sino((u - .45) / .5); });
    }
    const misturar = (A, B, t) => { for (const k in B) P[k] = lerp(A[k] == null ? P[k] : A[k], B[k], t); };
    const copia = keys => { const o = {}; for (const k in keys) o[k] = P[k]; return o; };

    /* --- andar: ciclo de passo verdadeiro em função da distância (patas na diagonal, pés presos ao chão) --- */
    const PASSO = { D: 118, beta: .62, ordem: [['tN', 0], ['fL', .1], ['tL', .5], ['fN', .6]] };
    function perfilAndar(u, a = .22) {
      const tot = 1 - a;
      if (u < a) return (u * u / (2 * a)) / tot;
      if (u > 1 - a) { const w = u - (1 - a); return (a / 2 + (1 - 2 * a) + w - w * w / (2 * a)) / tot; }
      return (a / 2 + (u - a)) / tot;
    }
    function pePasso(d, off, rest, total) {
      const { D, beta } = PASSO;
      const x = d / D + off, c = Math.floor(x), p = x - c;
      const plantar = dtd => dtd <= 0 ? rest : Math.min(dtd + rest + beta * D / 2, total + rest);
      if (p < beta) return { F: plantar(D * (c - off)), alt: 0 };
      const dLo = D * (c + beta - off), dHi = D * (c + 1 - off);
      const de = plantar(D * (c - off)), para = plantar(dHi), ini = Math.max(dLo, 0);
      const qq = limita((d - ini) / Math.max(1, dHi - ini), 0, 1);
      return { F: lerp(de, para, eseno(qq)), alt: de === para && de === total + rest && d >= total - .5 ? 0 : Math.sin(PI * qq) };
    }
    function* andar(xFim, ms) {
      const x0 = P.x, dir = Math.sign(xFim - x0) || 1, total = Math.abs(xFim - x0) / ESC;
      yield* durante(ms, u => {
        const d = total * perfilAndar(u);
        P.x = x0 + dir * d * ESC;
        const m = Math.min(suave(limita(u / .15, 0, 1)), suave(limita((1 - u) / .15, 0, 1)));
        for (const [nome, off] of PASSO.ordem) {
          const r = pePasso(d, off, EM_PE[nome + 'x'], total);
          P[nome + 'x'] = r.F - d;
          P[nome + 'y'] = -r.alt * (nome[0] === 'f' ? 24 : 18);
          if (nome[0] === 't') P['mt' + nome[1]] = EM_PE.mtL + 38 * r.alt; else P['pat' + nome[1]] = 42 * r.alt;
        }
        const ph = d / PASSO.D * 2 * PI;
        P.hipY = EM_PE.hipY - 3.5 * Math.cos(2 * ph) * m;
        P.spA = EM_PE.spA + 1.3 * Math.sin(ph) * m;
        P.cabY = EM_PE.cabY + 3 * Math.cos(2 * ph + .9) * m;
        P.cabR = 2 * Math.sin(ph + .5) * m;
        P.ombro = 3.5 * Math.sin(ph + PI * .6) * m;
        P.cO = EM_PE.cO + 4 * m;
      });
      // assenta as patas que ficaram fora do sítio (passinho curto, sem deslizar)
      const fora = PASSO.ordem.filter(([nm]) => Math.abs(P[nm + 'x'] - EM_PE[nm + 'x']) > 3);
      if (fora.length) {
        const ini = {}; for (const [nm] of fora) ini[nm] = P[nm + 'x'];
        yield* durante(140, u => { fora.forEach(([nm], i) => { const v = limita(u * 1.4 - i * .2, 0, 1); P[nm + 'x'] = lerp(ini[nm], EM_PE[nm + 'x'], eseno(v)); P[nm + 'y'] = -12 * sino(v); }); });
      }
    }
    /* --- salto em arco (antecipação feita antes; aqui: impulso, voo esticado, preparação da aterragem) --- */
    function* salto(x1, y1, altura, ms) {
      const x0 = P.x, y0 = P.y, ini = copia(SALTO);
      const iniA = copia(ATERRAR_AR);
      yield* durante(ms, u => {
        P.x = lerp(x0, x1, u);
        P.y = lerp(y0, y1, u) - altura * 4 * u * (1 - u);
        if (u < .25) misturar(ini, SALTO, esai(u / .25));
        else if (u < .55) misturar(SALTO, SALTO, 1);
        else misturar(Object.assign({}, iniA, SALTO), ATERRAR_AR, eseno((u - .55) / .45));
        P.inclina = u < .5 ? lerp(-14, 0, eseno(u / .5)) : lerp(0, 12, eseno((u - .5) / .5));
        P.cO = 2;
      });
    }

    /* --- comportamentos (fora do cesto, sentado virado para a esquerda) --- */
    function* recompor(ms = 420) {
      if (P.pataFrente) { yield* tw({ fNx: SENTADO.fNx, fNy: -30, patN: 0, almof: 0 }, 200); P.pataFrente = 0; }
      if (P.cEsc < .99) yield* tw({ cEsc: 1, cB: SENTADO.cB, cC: SENTADO.cC, cP: SENTADO.cP }, 280);
      const emPe = P.hipY < -125 || Math.abs(P.spA - SENTADO.spA) > 20;
      yield* transicao(Object.assign({}, SENTADO), ms, eio, emPe);
    }
    function* lamberPata() {
      P.pataFrente = 1;
      yield* tw({ fNx: 84, fNy: -196, patN: -60, cabR: -6, pitch: .35, cabYaw: .55, olhos: .55, almof: 1, oE: 6, oD: 6 }, 560);
      for (let i = 0; i < 4; i++) {
        yield* juntos(tw({ lingua: 1, bocaB: .16, pitch: .45, cabR: -9 }, 150, esai), tw({ fNy: -201 }, 150));
        yield* juntos(tw({ lingua: 0, bocaB: 0, pitch: .3, cabR: -5 }, 180, eentra), tw({ fNy: -196 }, 180));
      }
      for (let i = 0; i < 2; i++) {               // lava a cara: a pata passa pela bochecha até à orelha
        yield* tw({ fNx: 62, fNy: -262, patN: -115, cabR: -16, olhos: 0, oE: 18, oD: 6, pitch: .15 }, 400);
        yield* tw({ fNx: 84, fNy: -198, patN: -60, cabR: -6, olhos: .3, oE: 4, pitch: .35 }, 340);
      }
      yield* tw({ fNx: SENTADO.fNx, fNy: -40, patN: 20, almof: 0, olhos: 1, pitch: 0, cabR: 0, cabYaw: SENTADO.cabYaw, oE: 0, oD: 0 }, 420);
      yield* tw({ fNy: 0, patN: 0 }, 160, esai);
      P.pataFrente = 0;
      impulso('twB', 6, 260);
    }
    function* espreguicar() {
      yield* transicao(Object.assign({}, EM_PE), 460, eio, true);
      yield* juntos(transicao(Object.assign({}, ESPREGUICAR), 700, eio), (function* () { yield* espera(220); yield* tw({ bocaB: .85, olhos: 0, oE: 22, oD: 22, lingua: .3, bigode: 10, sobr: 1 }, 480); })());
      yield* durante(520, u => { P.hipY = ESPREGUICAR.hipY + Math.sin(u * PI * 6) * 1.6; P.cabR = ESPREGUICAR.cabR + Math.sin(u * PI * 4) * 2; });
      yield* tw({ bocaB: 0, lingua: 0, olhos: 1, oE: 0, oD: 0, bigode: 0, sobr: 0 }, 300);
      yield* transicao(Object.assign({}, EM_PE), 460, eio);
      yield* transicao(Object.assign({}, SENTADO), 520, eio, true);
    }
    function* caudaPatas() {          // senta-se com a cauda enrolada à volta das patas
      yield* tw({ cB: -176, cC: 2, cP: 20, cO: 1.5 }, 380);
      yield* tw({ cEsc: -1, cB: -178, cC: 0, cP: 16, cBy: -4 }, 820, eio);
      yield* tw({ olhos: .1, feliz: .25 }, 600, eseno);
      yield* espera(400);
      yield* tw({ olhos: 1, feliz: 0 }, 500, eseno);
      for (let i = 0; i < 3; i++) { yield* espera(aleat(500, 900)); impulso('flick', 16, 600, 'onda'); }
      yield* espera(600);
      yield* tw({ cEsc: 1, cB: SENTADO.cB, cC: SENTADO.cC, cP: SENTADO.cP, cO: SENTADO.cO, cBy: SENTADO.cBy }, 800, eio);
    }
    function* orelhasSom() {          // as orelhas rodam, uma de cada vez, para sons que só ele ouve
      yield* tw({ oD: 28, oDs: .55, yawM: .12 }, 230, esai);
      yield* espera(aleat(500, 900));
      yield* juntos(tw({ oD: 0, oDs: 1 }, 260), tw({ oE: 28, oEs: .55, yawM: -.15 }, 260));
      yield* espera(aleat(500, 900));
      yield* tw({ oE: -6, oEs: 1, oD: -6, yawM: 0, pupila: .55 }, 300);
      olhar.foco = () => PT.relogio;
      yield* espera(1300);
      olhar.foco = null;
      yield* tw({ oE: 0, oD: 0, pupila: .35 }, 320);
    }
    function* bocejo() {
      yield* tw({ pitch: -.45, cabY: SENTADO.cabY - 10, cabR: -4, oE: 10, oD: 10 }, 360);
      yield* juntos(tw({ bocaB: 1, lingua: .25 }, 680, eio), tw({ olhos: 0, oE: 24, oD: 24, bigode: 12, sobr: 1 }, 520));
      yield* espera(450);
      yield* tw({ bocaB: 0, lingua: 0 }, 380, eentra);
      yield* tw({ lingua: .7, bocaB: .08 }, 120); yield* tw({ lingua: 0, bocaB: 0 }, 160);
      yield* durante(420, u => { P.cabR = -4 + 7 * Math.sin(u * PI * 4) * (1 - u); });
      yield* tw({ pitch: 0, cabY: SENTADO.cabY, cabR: 0, olhos: 1, oE: 0, oD: 0, bigode: 0, sobr: 0 }, 420);
    }
    function* lamberOmbro() {
      yield* tw({ cabX: -2, cabY: -50, cabR: -16, cabYaw: -.8, pitch: .5, olhos: .25, oE: 8, oD: 8 }, 520);
      for (let i = 0; i < 5; i++) {
        yield* tw({ cabY: -44, cabR: -20, lingua: 1, bocaB: .14 }, 150, esai);
        yield* tw({ cabY: -53, cabR: -14, lingua: 0, bocaB: 0 }, 190);
      }
      yield* tw({ cabX: SENTADO.cabX, cabY: SENTADO.cabY, cabR: 0, cabYaw: SENTADO.cabYaw, pitch: 0, olhos: 1, oE: 0, oD: 0 }, 500);
    }
    function* pao() {                 // deita-se «em pão», com as patas escondidas
      yield* transicao(Object.assign({}, PAO), 850, eio);
      yield* tw({ olhos: .4, feliz: .25 }, 600);
      yield* espera(1100); impulso('flick', 14, 600, 'onda');
      yield* tw({ olhos: .1 }, 500); yield* espera(700);
      yield* tw({ olhos: .85 }, 400); yield* espera(900);
      yield* transicao(Object.assign({}, SENTADO, { olhos: 1, feliz: 0 }), 760, eio);
    }
    function* piscarLento() {         // «beijinho de gato»: olha para nós e fecha os olhos devagar
      olhar.foco = () => [cabMundo[0], cabMundo[1] + 30];
      yield* tw({ cabR: 6, oE: -4, oD: -4 }, 400);
      yield* tw({ olhos: .05, feliz: .35 }, 700, eseno);
      yield* espera(380);
      yield* tw({ olhos: 1, feliz: 0 }, 560, eseno);
      yield* espera(500);
      olhar.foco = null;
      yield* tw({ cabR: 0, oE: 0, oD: 0 }, 400);
    }
    function* olharEmVolta() {
      const alvos = [PT.janela, PT.relogio, [novelo.x, NOV.y], PT.estante, PT.cesto].sort(() => Math.random() - .5).slice(0, 3);
      for (const a of alvos) {
        olhar.foco = () => a;
        yield* tw({ oE: -6, oD: -6, pupila: .5 }, 260);
        yield* espera(aleat(800, 1300));
      }
      olhar.foco = null;
      yield* tw({ oE: 0, oD: 0, pupila: .35 }, 320);
    }
    const COMPORTAMENTOS = { lamberPata, espreguicar, caudaPatas, orelhasSom, bocejo, lamberOmbro, pao, piscarLento, olharEmVolta };
    let ultimoComp = null;
    function* cicloFora() {
      for (;;) {
        yield* espera(aleat(4000, 9000));
        let nome; do nome = escolhe(Object.keys(COMPORTAMENTOS)); while (nome === ultimoComp);
        ultimoComp = nome;
        yield* COMPORTAMENTOS[nome]();
      }
    }

    /* --- o gato vê um acontecimento raro --- */
    function* observar(ev) {
      reagindo = false;
      olhar.foco = ev.pos;
      yield* juntos(recompor(380), tw({ oE: -10, oD: -10, oEs: 1, oDs: 1, pupila: .95, olhos: 1, feliz: 0, bigode: 8, bocaB: 0, lingua: 0, almof: 0 }, 260, esai));
      let t = 0, prox = 700, patada = false;
      while (ev.ativo() && t < 10000) {
        t += yield;
        if (ev.tipo === 'mosca' && !patada) {
          const [fx, fy] = ev.pos();
          if (Math.hypot(fx - cabMundo[0], fy - cabMundo[1]) < 150) {        // tenta apanhar a mosca com a pata
            patada = true; P.pataFrente = 1;
            yield* tw({ fNx: 120, fNy: -230, patN: -40 }, 180, esai);
            yield* tw({ fNx: 100, fNy: -150, patN: -10 }, 200);
            yield* tw({ fNx: SENTADO.fNx, fNy: 0, patN: 0 }, 260, esai);
            P.pataFrente = 0;
          }
        }
        if (t > prox) {
          prox = t + aleat(900, 1700);
          impulso('flick', 18, 520, 'onda');
          if (ev.tipo === 'passaro' && Math.random() < .65) yield* durante(650, u => { P.bocaB = .1 + .1 * Math.abs(Math.sin(u * PI * 8)); });
          else if (Math.random() < .6) yield* durante(720, u => { P.hipX = SENTADO.hipX + Math.sin(u * PI * 6) * 5 * sino(u); P.cB = SENTADO.cB - 8 * sino(u); });
          P.bocaB = 0; P.hipX = SENTADO.hipX;
        }
      }
      olhar.foco = null;
      yield* tw(Object.assign({}, ROSTO, { cB: SENTADO.cB }), 500);
    }

    /* --- reações ao toque --- */
    function* reacaoFora() {
      reagindo = true;
      const rosto = tw({ oE: -12, oD: -12, oEs: 1, oDs: 1, feliz: 1, olhos: 1, pupila: .55, bigode: 10, sobr: .6, bocaB: 0, lingua: 0, almof: 0, yawM: 0 }, 130, esai);
      const corpo = (function* () {
        if (P.pataFrente || P.cEsc < .99 || P.hipY < -125 || Math.abs(P.spA - SENTADO.spA) > 15 || Math.abs(P.hipX - SENTADO.hipX) > 10) yield* recompor(300);
        yield* juntos(
          tw({ cB: -98, cC: 2, cP: 34, cO: 9, cBy: -18 }, 280, esai),
          (function* () {
            yield* tw({ corpoSy: .93, sobe: 0 }, 90, esai);                       // antecipação
            yield* juntos(tw({ sobe: -34, corpoSy: 1.05 }, 170, esai), tw({ fNy: -10, fLy: -6, tNy: -4, tLy: -4 }, 170));
            yield* juntos(tw({ sobe: 0, corpoSy: .95 }, 170, eentra), tw({ fNy: 0, fLy: 0, tNy: 0, tLy: 0 }, 170));
            impulso('flick', 22, 600, 'onda'); impulso('twE', -8, 300); impulso('twD', -8, 300);
            yield* tw({ corpoSy: 1 }, 140, esai);
          })()
        );
        olhar.foco = () => [cabMundo[0], cabMundo[1] + 20];                   // esfrega a cabeça a olhar para nós
        yield* tw({ cabR: -12, feliz: 0, pupila: .65 }, 220);
        yield* tw({ cabR: 10 }, 320);
        yield* tw({ cabR: 0 }, 260);
        olhar.foco = null;
      })();
      yield* juntos(rosto, corpo);
      yield* espera(250);
      reagindo = false;
      yield* juntos(tw(Object.assign({}, ROSTO), 450), tw({ cB: SENTADO.cB, cC: SENTADO.cC, cP: SENTADO.cP, cO: SENTADO.cO }, 650));
    }
    const ENROLADO_CAB = { cabX: ENROLADO.cabX, cabY: ENROLADO.cabY, cabR: ENROLADO.cabR, pitch: ENROLADO.pitch };
    function* reacaoDentro() {
      impulso('flick', 22, 650, 'onda');
      yield* tw({ cabY: ENROLADO.cabY - 46, cabX: ENROLADO.cabX + 4, cabR: 2, pitch: 0, oE: -10, oD: -10, oEs: 1, oDs: 1, olhos: 1, feliz: .2, pupila: .5 }, 260, esai);
      olhar.foco = () => [cabMundo[0], cabMundo[1] + 20];
      yield* espera(380);
      yield* tw({ olhos: .06, feliz: .5 }, 540, eseno);          // piscar lento
      yield* espera(260);
      yield* tw({ olhos: .9, feliz: .2 }, 440, eseno);
      yield* espera(700);
      impulso('flick', 16, 600, 'onda');
      olhar.foco = null;
      yield* tw(Object.assign({}, ENROLADO_CAB, { olhos: 0, feliz: 0, oE: 8, oD: 8, pupila: .35 }), 900, eio);
    }
    function* cicloDentro() {        // a dormir no cesto: respira, mexe as orelhas, espreita, abana a ponta da cauda
      for (;;) {
        yield* espera(aleat(2500, 5000));
        const r = Math.random();
        if (r < .35) { yield* tw({ olhos: .28 }, 500, eseno); yield* espera(aleat(600, 1100)); yield* tw({ olhos: 0 }, 600, eseno); }
        else if (r < .6) { yield* tw({ respA: 2.2 }, 700, eseno); yield* tw({ respA: 1.4 }, 1100, eseno); }   // suspiro
        else if (r < .8) { impulso('twE', 20, 260); yield* espera(300); impulso('twE', 14, 240); }
        else { yield* durante(700, u => { P.patN = ENROLADO.patN - 18 * Math.abs(Math.sin(u * PI * 3)); P.fNy = ENROLADO.fNy - 4 * Math.abs(Math.sin(u * PI * 3)); }); }  // sonha
      }
    }

    /* --- ida ao cesto: vira-se (cabeça primeiro), anda, agacha, salta, aterra, dá a volta, amassa, enrola-se --- */
    function* idaAoCesto() {
      modo = 'indo'; reagindo = false;
      if (P.pataFrente || P.cEsc < .99) yield* recompor(240);
      olhar.foco = () => PT.cesto; olhar.rapido = true;                       // a cabeça vira-se primeiro
      yield* tw(Object.assign({}, ROSTO, { oE: -10, oD: -10, pupila: .7, cabR: 0 }), 140, esai);
      yield* juntos(transicao(Object.assign({}, EM_PE), 420, eio, true), tw({ sx: 1 }, 420, eio), passinhos(420));
      olhar.rapido = false;
      yield* andar(760, 580);
      olhar.foco = () => [K.cx, K.chao - 30];
      yield* tw(Object.assign({}, AGACHADO), 120, esai);
      yield* durante(130, u => { P.hipX = AGACHADO.hipX + Math.sin(u * PI * 4) * 5; P.cB = AGACHADO.cB + 6 * Math.sin(u * PI * 4); });
      yield* salto(975, K.chao, 150, 380);
      dentroCesto = true;
      impulso('cesto', 2.6, 900, 'mola');
      yield* juntos(tw(Object.assign({}, ATERRAR), 100, esai), tw({ afunda: 11 }, 160, esai));
      yield* transicao(Object.assign({}, EM_PE, { cabY: -30, cabX: 80, pitch: .5 }), 120, eio);
      yield* juntos(tw({ sx: -1, x: 1116 }, 420, eio), passinhos(420), (function* () { yield* espera(100); impulso('cesto', -1.2, 600, 'mola'); })());
      olhar.foco = null;
      yield* tw({ olhos: .35, feliz: .6, oE: 6, oD: 6, pitch: .3, cabY: -40, cabX: 72 }, 120);
      for (const lado of ['N', 'L']) yield* durante(200, u => { P['f' + lado + 'y'] = -14 * sino(u); P['pat' + lado] = -25 * sino(u); P.hipY = EM_PE.hipY + 3 * sino(u); });
      yield* juntos(transicao(Object.assign({}, ENROLADO), 470, eio), tw({ olhos: 0, feliz: 0, oE: 8, oD: 8, pupila: .35 }, 500), tw({ respF: .28, respA: 1.4 }, 500));
      modo = 'dentro';
    }
    /* --- volta: acorda, espreguiça-se, salta para fora, anda até ao sítio e senta-se --- */
    function* saidaDoCesto() {
      modo = 'voltando'; reagindo = false;
      olhar.foco = () => [REPOUSO.x - 200, REPOUSO.y - 260];
      yield* tw({ olhos: 1, feliz: 0, oE: -6, oD: -6, pitch: 0, cabY: ENROLADO.cabY - 40, cabR: 0, pupila: .45, respF: .42, respA: 1 }, 180, esai);
      yield* juntos(transicao(Object.assign({}, EM_PE), 300, eio), tw({ cEsc: 1, cB: -96, cC: 5, cP: 24, cO: 7, cBx: -84, cBy: -18 }, 300));
      yield* juntos(transicao(Object.assign({}, ESPREGUICAR), 360, eio), tw({ bocaB: .8, olhos: 0, oE: 20, oD: 20, lingua: .3 }, 330));
      yield* espera(130);
      yield* juntos(transicao(Object.assign({}, EM_PE), 240, eio), tw({ bocaB: 0, olhos: 1, oE: 0, oD: 0, lingua: 0 }, 220));
      yield* tw(Object.assign({}, AGACHADO), 100, esai);
      P.y += P.afunda; dentroCesto = false;          // passa a afundar só a almofada (sem salto no desenho)
      impulso('cesto', -2.2, 800, 'mola');
      yield* juntos(salto(770, CHAO, 165, 380), tw({ afunda: 0 }, 300));
      yield* tw(Object.assign({}, ATERRAR), 90, esai);
      yield* transicao(Object.assign({}, EM_PE), 80, eio);
      yield* andar(REPOUSO.x, 480);
      olhar.foco = null;
      yield* transicao(Object.assign({}, SENTADO, ROSTO), 330, eio, true);
      modo = 'fora';
    }

    /* --- som: «miau» (abre a meio, abre muito e segura, fecha arredondado), cabeça sobe um pouco --- */
    function* miar(ms) {
      const dentro = modo === 'dentro';
      yield* durante(ms, u => {
        let b;
        if (u < .12) b = .45 * esai(u / .12);
        else if (u < .3) b = lerp(.45, 1, eseno((u - .12) / .18));
        else if (u < .68) b = 1 - .08 * Math.sin((u - .3) / .38 * PI);
        else b = 1 - eseno((u - .68) / .32);
        P.boca = b;
        const c = u < .15 ? esai(u / .15) : u > .8 ? 1 - eseno((u - .8) / .2) : 1;
        P.somP = -.38 * c; P.somY = (dentro ? -30 : -8) * c; P.somFecha = .2 * c * b; P.somR = 0;
      });
      P.boca = 0; P.somP = 0; P.somY = 0; P.somFecha = 0;
    }

    /* um «miau» por sílaba do som gravado, cada um no seu tempo */
    function* miarSilabas(silabas) {
      let t = 0;
      for (const [a, d] of silabas) {
        if (a > t) yield* durante((a - t) * 1000, () => {});
        yield* miar(limita(d * 1000, 250, 2000));
        t = a + d;
      }
    }

    /* --- cenário vivo e acontecimentos raros --- */
    const poeiras = R.poeiras.map((el, i) => {
      const r = semente(100 + i * 7);
      const u = r(), v = r(), s = .1 + r() * .85, w = noVidro(u, v), c = noChao(u, v);
      return { el, x: lerp(w[0], c[0], s), y: lerp(w[1], c[1], s), f1: .15 + r() * .25, f2: .1 + r() * .2, ph: r() * 6.3, sobe: 3 + r() * 6 };
    });
    function animarCena() {
      const t = tempo / 1000;
      R.nuvens.forEach((g, i) => { const base = [300, 440, 560][i], y = [170, 210, 150][i], k = [.9, .7, .8][i]; const x = 200 + ((base - 200 + t * (5 + i * 2) * calma) % 400); poe(g, `translate(${n(x)},${y}) scale(${k})`); });
      const v = Math.sin(t * .55) * calma, v2 = Math.sin(t * .55 - .9) * calma;
      poe(R.cortES, `rotate(${n3(v * .5)},221,92)`); poe(R.cortEI, `rotate(${n3(v2 * 1.6)},221,330)`);
      poe(R.cortDS, `rotate(${n3(-v * .4)},221,92)`); poe(R.cortDI, `rotate(${n3(-v2 * 1.3)},221,330)`);
      poe(R.pendulo, `rotate(${n3(9 * Math.sin(t * PI))},1110,242)`);
      const seg = Math.floor(t) + Math.min(1, (t % 1) * 8);     // ponteiro dos segundos aos saltinhos
      poe(R.pS, `rotate(${n(seg * 6)},1110,184)`);
      poe(R.pM, `rotate(${n(40 + t * .1)},1110,184)`); poe(R.pH, `rotate(${n(130 + t * .0083)},1110,184)`);
      poe(R.arvore, `rotate(${n3(1.4 * Math.sin(t * .8) * calma)},470,414)`);
      poe(R.flores, `rotate(${n3(1.2 * Math.sin(t * .9 + 1) * calma)},470,392)`);
      R.folhas.forEach((g, i) => { const a = [-58, -30, 2, 30, 56][i]; poe(g, `rotate(${n3(a + 1.2 * Math.sin(t * .7 + i * 1.3) * calma)},150,784)`); });
      R.hera.forEach((g, i) => poe(g, `rotate(${n3(1.6 * Math.sin(t * .6 + i * 2) * calma)},${i ? 1300 : 1276},204)`));
      for (const p of poeiras) {
        const x = p.x + 16 * Math.sin(t * p.f1 + p.ph) * calma, y = p.y + 11 * Math.sin(t * p.f2 + p.ph * 1.7) * calma - ((t * p.sobe) % 40) + 20;
        poe(p.el, `translate(${n(x)},${n(y)})`);
        atr(p.el, 'opacity', n3(.25 + .55 * Math.pow(Math.sin(t * .8 + p.ph), 2)));
      }
      // novelo
      const rotN = (novelo.x - NOV.x) / NOV.r / RAD;
      poe(R.novelo, `translate(${n(novelo.x)},${NOV.y})`); poe(R.noveloRot, `rotate(${n(rotN)})`);
      poe(R.noveloSombra, `translate(${n(novelo.x + 6)},${NOV.y + NOV.r})`);
      const bx = novelo.x;
      atr(R.fio, 'd', `M${n(bx + 22)},${NOV.y + 24} C${n(bx + 52)},${NOV.y + 44} ${n(bx + 76)},${NOV.y + 12} ${n(bx + 112)},${NOV.y + 26} S${n((bx + 1050) / 2 + 40)},${NOV.y + 44} 1060,${NOV.y + 30}`);
    }
    const eventos = { prox: aleat(9000, 15000), ultimo: null };
    function iniciarEvento(tipo) {
      const ev = { tipo, x: 0, y: 0, vivo: true };
      ev.pos = () => [ev.x, ev.y];
      ev.ativo = () => ev.vivo;
      const gen = tipo === 'passaro' ? evPassaro(ev) : tipo === 'mosca' ? evMosca(ev) : evNovelo(ev);
      lancar('evento', gen, () => { ev.vivo = false; });
      if (modo === 'fora' && !reagindo) lancar('corpo', observar(ev), () => lancar('corpo', cicloFora()));
      else if (modo === 'dentro') { impulso('twE', 22, 420); impulso('twD', -18, 420); }
    }
    function atualizarEventos(dt) {
      if (faixas.has('evento')) return;
      eventos.prox -= dt;
      if (eventos.prox > 0) return;
      eventos.prox = aleat(15000, 40000);
      let tipo; do tipo = escolhe(['passaro', 'mosca', 'novelo']); while (tipo === eventos.ultimo);
      eventos.ultimo = tipo;
      iniciarEvento(tipo);
    }
    function* evPassaro(ev) {
      const g = R.passaro, pX = 410, pY = 402;
      let dirA = -1;
      const poeAve = (bate, tt) => {
        poe(g, `translate(${n(ev.x)},${n(ev.y)}) scale(${dirA * 1.55},1.55)`);
        poe(R.aveAsa, bate ? `rotate(${n(-35 * Math.sin(tt * .055))},-2,-14) scale(1,${n3(.6 + .4 * Math.abs(Math.cos(tt * .055)))})` : 'rotate(0)');
      };
      atr(g, 'display', 'inline');
      yield* durante(1400, (u, tt) => { const e = esai(u); ev.x = lerp(540, pX, e); ev.y = lerp(170, pY, e) - 40 * sino(u); poeAve(u < .92, tt); });
      for (let i = 0; i < 2; i++) {
        yield* espera(aleat(400, 700));
        const x0 = ev.x;
        yield* durante(240, u => { ev.x = x0 - 14 * u; ev.y = pY - 10 * sino(u); poeAve(false, 0); });
      }
      for (let i = 0; i < 2; i++) {        // debica no parapeito
        yield* durante(220, u => poe(R.ave, `rotate(${n(28 * sino(u))},0,-4)`));
        yield* espera(260);
      }
      yield* espera(500); dirA = 1; poeAve(false, 0);       // olha para o outro lado
      yield* durante(300, u => poe(R.aveCab, `rotate(${n(-14 * sino(u))},9,-18)`));
      yield* espera(700); dirA = -1; poeAve(false, 0);
      yield* espera(500);
      const x1 = ev.x;
      yield* durante(1200, (u, tt) => { ev.x = lerp(x1, 220, eentra(u)); ev.y = lerp(pY, 110, u) - 30 * sino(u); poeAve(true, tt); });
      atr(g, 'display', 'none');
    }
    function* evMosca(ev) {
      const g = R.mosca, c = [cabMundo[0], cabMundo[1]];
      const pts = [[470, 270], [560, 360], [c[0] - 110, c[1] - 120], [c[0] - 20, c[1] - 150], [c[0] + 80, c[1] - 60], [c[0] + 40, c[1] - 200], [820, 260], [1020, 330], [1240, 200], [1700, 120]];
      atr(g, 'display', 'inline');
      yield* durante(7000, (u, tt) => {
        const [x, y] = catmull(pts, eseno(u) * .5 + u * .5);
        ev.x = x + 7 * Math.sin(tt * .021); ev.y = y + 6 * Math.cos(tt * .027);
        poe(g, `translate(${n(ev.x)},${n(ev.y)}) rotate(${n(8 * Math.sin(tt * .01))})`);
        const sc = n3(.35 + .65 * Math.abs(Math.sin(tt * .9)));
        R.asasM.forEach(a => atr(a, 'ry', sc * 3.6));
      });
      atr(g, 'display', 'none');
    }
    function* evNovelo(ev) {
      ev.x = novelo.x; ev.y = NOV.y;
      const x0 = NOV.x;
      yield* durante(1500, u => { novelo.x = x0 + 48 * eseno(u); ev.x = novelo.x; });
      yield* espera(900);
      yield* durante(1300, u => { novelo.x = x0 + 48 * (1 - eseno(u)); ev.x = novelo.x; });
      yield* espera(600);
    }

    /* --- relógio único --- */
    let erroMostrado = false;
    function passo(dt) {
      if (!vivo) return;
      try {
        dt = Math.min(dt, 50);
        tempo += dt;
        fase.resp += dt / 1000 * 2 * PI * P.respF;
        fase.cauda += dt / 1000 * 2 * PI * P.cV;
        atualizarImpulsos(dt);
        cestoAng = IMP.cesto;
        atualizarPiscar(dt);
        atualizarTiques(dt);
        for (const nome of Array.from(faixas.keys())) avancar(nome, dt);
        atualizarOlhar(dt);
        atualizarEventos(dt);
        animarCena();
        desenhar();
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    lancar('corpo', cicloFora());
    desenhar();

    return {
      animal: R.gato,
      habitat: R.habitat,
      reagir() {
        if (!vivo) return;
        if (modo === 'fora') lancar('corpo', reacaoFora(), () => { reagindo = false; lancar('corpo', cicloFora()); });
        else if (modo === 'dentro') lancar('corpo', reacaoDentro(), () => lancar('corpo', cicloDentro()));
        else { impulso('twE', -10, 300); impulso('twD', -10, 300); }
      },
      fazerSom(ms, silabas) {         // silabas = [[início s, duração s], …] medidas no som da app (ferramentas/limpar-voz.js)
        if (!vivo) return;
        if (Array.isArray(silabas) && silabas.length) lancar('boca', miarSilabas(silabas));
        else lancar('boca', miar(limita(ms || 900, 300, 3500)));
      },
      irAoHabitat() {
        return new Promise(res => {
          if (!vivo || modo !== 'fora') { res(); return; }
          lancar('corpo', idaAoCesto(), () => { res(); lancar('corpo', cicloDentro()); });
        });
      },
      voltar() {
        return new Promise(res => {
          if (!vivo || modo !== 'dentro') { res(); return; }
          lancar('corpo', saidaDoCesto(), () => { res(); lancar('corpo', cicloFora()); });
        });
      },
      destruir() {
        vivo = false;
        faixas.clear();
        impulsos.length = 0;
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola (modo de desenvolvimento)
      _teste: { P, modo: () => modo, evento: iniciarEvento, comportamento: nome => lancar('corpo', COMPORTAMENTOS[nome](), () => lancar('corpo', cicloFora())), desenhar }
    };
  }

  return { icone: iconeSVG(), montar };
})();
