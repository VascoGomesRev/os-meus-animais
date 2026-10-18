/* Terra — «Os Meus Animais», grupo «Elementos». Contrato e regras: REGRAS-ANIMAIS.md (§2 e §11).
   Cena: uma horta numa manhã de primavera no Minho (sol de cima à esquerda). Céu azul com nuvens, duas andorinhas, a serra
   azulada ao longe e colinas com socalcos (muros de pedra e fiadas de vinha), uma capelinha, carvalhos, uma casa de granito
   com telhado de telha e fumo na chaminé, e um espigueiro sobre pés com mós. À frente, o muro de pedra da horta com musgo,
   o carrinho de mão cheio de terra, canteiros dos lados com couves galegas, repolhos e alfaces (com uma borboleta branca),
   o regador, o ancinho e a pá espetados na terra, e um pisco pousado no cabo da pá (é ele quem nota os acontecimentos).
   A terra é a personagem (sem cara): uma leira grande de terra escura acabada de cavar, vista ligeiramente de cima, com
   sulcos, torrões, migalhas, pedrinhas, raízes e rebentos; e, num corte à frente (como num livro infantil), as camadas da
   terra — húmus escuro, terra castanha, barro cor de ocre e pedras — com minhocas a andar nos seus túneis, a toca da
   toupeira, sementes a germinar com raízes, raízes das couves e das alfaces e um carreiro de formigas.
   Nunca parada: as minhocas andam com ondas do corpo (estica e encolhe), migalhas rolam pelas pontas da leira, os rebentos
   tremem, a toupeira respira e fareja, as formigas vão e vêm.
   Variações ociosas (4–9 s): uma minhoca sai à superfície e volta a entrar, um torrão rola e desfaz-se, um rebento cresce e
   abre as duas folhinhas, um escaravelho atravessa a leira, a toupeira espreita na toca.
   Reações ao toque (alternadas): a terra «salta» (torrões e migalhas pulam e caem com pó), uma minhoca grande sai e
   estica-se, um rebento brota de repente. Acontecimentos raros (15–40 s): um melro pousa e puxa uma minhoca (que lhe escapa),
   um caracol atravessa a leira, a toupeira faz um montinho de terra.
   Organização:
     1) utilidades (matemática, curvas, percursos)
     2) geometria da leira e do corte
     3) ícone do menu
     4) cenário (céu, serra, socalcos, casa, espigueiro, muro, chão, carrinho, couves, alfaces, regador, ferramentas)
     5) a terra: superfície da leira, corte com as camadas, bichos e rebentos
     6) montar(): estado, tarefas (variações, reações, acontecimentos), partículas, desenho por quadro, relógio único */
'use strict';
MODULOS.terra = (() => {
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
  const eseno = t => -(Math.cos(PI * t) - 1) / 2;
  const sino = t => Math.sin(PI * limita(t, 0, 1));
  const aleat = (a, b) => a + Math.random() * (b - a);
  const escolhe = v => v[Math.random() * v.length | 0];
  function semente(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  // sobe depressa até a (fração 0–1) e desce devagar até ao fim
  const envelope = (u, a) => u < a ? esai(u / a) : 1 - eio((u - a) / (1 - a));
  // fração de uma fase [a, b] do tempo u (0–1)
  const fase = (u, a, b) => limita((u - a) / (b - a), 0, 1);
  // elipse como subcaminho (para juntar muitas num só path)
  const elip = (cx, cy, rx, ry) => `M${n(cx - rx)},${n(cy)}a${n(rx)},${n(ry)} 0 1,0 ${n(2 * rx)},0a${n(rx)},${n(ry)} 0 1,0 ${n(-2 * rx)},0Z`;
  // curva suave fechada por pontos (Catmull-Rom → Bézier)
  function curvaFechada(p) {
    const m = p.length;
    let d = 'M' + n(p[0][0]) + ',' + n(p[0][1]);
    for (let i = 0; i < m; i++) {
      const a = p[(i + m - 1) % m], b = p[i], c = p[(i + 1) % m], e = p[(i + 2) % m];
      d += 'C' + n(b[0] + (c[0] - a[0]) / 6) + ',' + n(b[1] + (c[1] - a[1]) / 6) + ' ' + n(c[0] - (e[0] - b[0]) / 6) + ',' + n(c[1] - (e[1] - b[1]) / 6) + ' ' + n(c[0]) + ',' + n(c[1]);
    }
    return d + 'Z';
  }
  // mancha irregular (torrões, pedras, copas)
  function blobD(cx, cy, rx, ry, r, k = 9, irr = .18) {
    const p = [];
    for (let i = 0; i < k; i++) { const a = i / k * TAU, f = 1 + (r() - .5) * 2 * irr; p.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]); }
    return curvaFechada(p);
  }
  // linha suave por pontos (curvas pelos meios)
  function linhaPor(pts) {
    const m = pts.length;
    if (m < 2) return 'M0,0';
    let d = `M${n(pts[0][0])},${n(pts[0][1])}`;
    for (let i = 1; i < m - 1; i++) d += `Q${n(pts[i][0])},${n(pts[i][1])} ${n((pts[i][0] + pts[i + 1][0]) / 2)},${n((pts[i][1] + pts[i + 1][1]) / 2)}`;
    return d + `L${n(pts[m - 1][0])},${n(pts[m - 1][1])}`;
  }
  function catmull(pts, u) {
    const ns = pts.length - 1, s = Math.min(ns - 1e-6, Math.max(0, u) * ns), i = Math.floor(s), t = s - i;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(ns, i + 2)];
    const f = (a, b, c, d) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
    return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
  }
  // percurso: curva suave reamostrada com o comprimento acumulado (minhocas, formigas, toupeira)
  function percurso(ctrl, N = 90) {
    const pts = [];
    for (let i = 0; i <= N; i++) pts.push(catmull(ctrl, i / N));
    const L = [0];
    for (let i = 1; i <= N; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, L, total: L[N] };
  }
  function noPercurso(P, s) {
    s = limita(s, 0, P.total);
    let a = 0, b = P.L.length - 1;
    while (b - a > 1) { const m = (a + b) >> 1; if (P.L[m] <= s) a = m; else b = m; }
    const t = (s - P.L[a]) / ((P.L[b] - P.L[a]) || 1), p = P.pts[a], q = P.pts[b];
    return [lerp(p[0], q[0], t), lerp(p[1], q[1], t), Math.atan2(q[1] - p[1], q[0] - p[0])];
  }

  /* ================= 2) Geometria da leira e do corte ================= */
  const CHAO = 676;                                   // beira do corte nos lados (chão da horta)
  const LCX = 800, LMEIA = 400, LX0 = LCX - LMEIA, LX1 = LCX + LMEIA;
  // perfil da leira em x: um «estádio» com as pontas redondas (superelipse)
  function eL(x) { const u = Math.abs(x - LCX) / LMEIA; return u >= 1 ? 0 : Math.pow(1 - Math.pow(u, 4), .25); }
  const ondaL = x => Math.sin(PI * limita((x - LX0) / (LX1 - LX0), 0, 1));
  // beira da frente da leira (= linha de cima do corte) e beira de trás (com torrões irregulares)
  const topo = x => CHAO - 34 * eL(x) - 6 * ondaL(x) * eL(x);
  const tras = x => CHAO - 148 * eL(x) + (2.5 * Math.sin(x / 21) + 1.6 * Math.sin(x / 8.3 + 1)) * eL(x);
  const prof = v => v * (1.35 - .35 * v);             // perspetiva: as filas de trás ficam mais juntas
  // ponto da superfície da leira: x e profundidade v (0 = beira da frente, 1 = beira de trás)
  const sup = (x, v) => lerp(topo(x), tras(x), prof(v)) - 6 * Math.sin(PI * v) * eL(x);
  const esc = v => 1 - .4 * v;                        // escala das coisas pousadas, com a profundidade
  // limites das camadas do corte
  const B1 = x => 714 + 6 * Math.sin(x / 90 + .5) + 4 * Math.sin(x / 37);
  const B2 = x => 792 + 8 * Math.sin(x / 140 + 1) + 4 * Math.sin(x / 53 + 2);
  const B3 = x => 860 + 6 * Math.sin(x / 120 + 2) + 3 * Math.sin(x / 41);

  // túneis das minhocas (no corte) e o seu comprimento
  const MINHOCAS = [
    { c: [[738, 700], [790, 690], [846, 712], [902, 738], [960, 732], [1012, 752]], len: 82, w: 9, vel: 16 },
    { c: [[1002, 792], [1050, 770], [1100, 782], [1150, 760], [1196, 774]], len: 70, w: 8, vel: 13 },
    { c: [[470, 704], [522, 714], [578, 700], [632, 718], [690, 706]], len: 66, w: 7.5, vel: 14 },
    { c: [[150, 742], [204, 762], [262, 750], [324, 774], [372, 760]], len: 64, w: 7.5, vel: 12 }
  ];
  // túnel da toupeira, câmara e chaminé (que ela cava no montinho)
  const TUNEL = [[296, 780], [380, 784], [462, 774], [540, 764], [610, 756], [672, 748]];
  const CAMARA = { x: 704, y: 744, r: 30 };
  const MONTE = { x: 704 };                           // o montinho fica na beira, por cima da câmara
  // carreiro das formigas (lado direito, debaixo das alfaces)
  const FORMIGAS = [[1214, 694], [1240, 706], [1268, 724], [1300, 728], [1326, 744], [1340, 760]];
  // rebentos: na beira da frente (ligados às sementes do corte) e mais atrás na leira
  const REBENTOS = [
    { x: 588, v: 0, k: 1.5, g: 1, h: 1, sem: 0 }, { x: 872, v: 0, k: 1.5, g: 0, h: .75, sem: 1 }, { x: 1064, v: 0, k: 1.45, g: 0, h: .5, sem: 2 },
    { x: 668, v: .62, k: 1.05, g: 1, h: .9, sem: -1 }, { x: 960, v: .7, k: 1, g: 0, h: .7, sem: -1 }, { x: 776, v: .36, k: 1.2, g: 1, h: .85, sem: -1 }
  ];
  // buracos das minhocas à superfície
  const BURACO_P = { x: 724, v: .44 }, BURACO_G = { x: 912, v: .2 };
  // torrões que mexem (dois rolam pelas pontas, todos saltam)
  const TORROES = [
    { x: 556, v: .5, r: 18, rolo: [[556, 0], [538, 6], [516, 18], [500, 0]] },
    { x: 1044, v: .56, r: 17, rolo: [[1044, 0], [1066, 8], [1090, 24], [1104, 0]] },
    { x: 830, v: .66, r: 15, rolo: null }
  ];
  // pá e pisco
  const PA = { x: 1142, v: .45, topo: 432 };

  /* ================= 3) Ícone do menu (sem gradientes com id) ================= */
  function iconeSVG() {
    const R = 106, C = 110;
    const meia = y => Math.sqrt(Math.max(0, R * R - (y - C) * (y - C)));
    // região do círculo abaixo de uma linha ondulada que começa e acaba no círculo
    const abaixo = (y0, amp, f) => {
      const xl = C - meia(y0), xr = C + meia(y0);
      let d = `M${n(xl)},${y0}`;
      for (let i = 1; i <= 6; i++) { const x = lerp(xl, xr, i / 6), xm = lerp(xl, xr, (i - .5) / 6); d += `Q${n(xm)},${n(y0 + amp * Math.sin(i * 1.7 + f))} ${n(x)},${y0}`; }
      return d + `A${R},${R} 0 ${y0 < C ? 1 : 0} 1 ${n(xl)},${y0}Z`;
    };
    const linha = y => `M${n(C - meia(y) + 2)},${y}L${n(C + meia(y) - 2)},${y}`;
    const r = semente(7);
    let migalhas = '', pedras = '', manchas = '';
    for (let i = 0; i < 30; i++) { const x = 46 + r() * 128, y = 124 + r() * 22; if (y > 120 + 30 * Math.pow((x - 110) / 80, 2)) migalhas += `M${n(x)},${n(y)}h.01`; }
    for (let i = 0; i < 9; i++) pedras += elip(40 + r() * 140, 188 + r() * 12, 4 + r() * 4, 3 + r() * 2);
    for (let i = 0; i < 40; i++) manchas += `M${n(30 + r() * 160)},${n(152 + r() * 30)}h.01`;
    return `<circle cx="110" cy="110" r="106" fill="#A8DAF4"/>
      <circle cx="56" cy="54" r="28" fill="#FFF6C8" opacity=".7"/><circle cx="56" cy="54" r="16" fill="#FFE27A"/>
      <g fill="#FFFFFF"><ellipse cx="146" cy="48" rx="24" ry="9"/><ellipse cx="136" cy="42" rx="12" ry="9"/><ellipse cx="154" cy="42" rx="10" ry="7"/></g>
      <path d="${abaixo(92, 5, 0)}" fill="#8CC060"/>
      <path d="${linha(100)}${linha(108)}" stroke="#C4BCA8" stroke-width="2.4"/>
      <path d="${abaixo(114, 0, 0)}" fill="#B4AA98"/>
      <path d="M12,120 h196 M18,126 h184" stroke="#8E8474" stroke-width="1.4" opacity=".7"/>
      <path d="${abaixo(130, 0, 0)}" fill="#8A7A4E"/>
      <path d="M24,152 C30,124 60,112 110,112 C160,112 190,124 196,152 Z" fill="#4E3019" stroke="#2A180C" stroke-width="2"/>
      <path d="M40,138 C70,128 150,128 180,138 M52,126 C80,119 140,119 168,126" stroke="#8A6040" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M40,142 C70,132 150,132 180,142 M52,130 C80,123 140,123 168,130" stroke="#1E1008" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="${migalhas}" stroke="#9A6E46" stroke-width="3" stroke-linecap="round"/>
      <path d="M60,124 a8,6 0 1,0 16,0 a8,6 0 1,0 -16,0 M150,128 a7,5 0 1,0 14,0 a7,5 0 1,0 -14,0" fill="#6A4428" stroke="#2A180C" stroke-width="1.4"/>
      <path d="${abaixo(148, 2.5, 1)}" fill="#3C2414"/>
      <path d="${abaixo(166, 4, 2)}" fill="#7A4E2C"/>
      <path d="${abaixo(186, 3, 3)}" fill="#B07A42"/>
      <path d="${abaixo(200, 2, 4)}" fill="#8E7C66"/>
      <path d="${manchas}" stroke="#2A180C" stroke-width="2.6" stroke-linecap="round" opacity=".55"/>
      <path d="${pedras}" fill="#CEC4B4" stroke="#6E6458" stroke-width="1.2"/>
      <path d="M124,148 C122,154 126,158 122,166 M124,154 l-6,5 M123,160 l5,4" stroke="#F2E6C8" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <ellipse cx="124" cy="150" rx="6" ry="4" fill="#EED8A4" stroke="#8A6A3A" stroke-width="1.2"/>
      <path d="M124,146 C124,134 126,124 124,112" stroke="#4E7A2A" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M124,146 C124,134 126,124 124,112" stroke="#A8D46A" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M124,112 C116,100 100,100 96,106 C102,114 116,116 124,112 Z M124,112 C132,100 148,100 152,106 C146,114 132,116 124,112 Z" fill="#8CC84E" stroke="#4E7A2A" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M70,178 C84,168 96,186 112,176 C126,168 136,170 148,180" stroke="#8A3A3A" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M70,178 C84,168 96,186 112,176 C126,168 136,170 148,180" stroke="#E07E82" stroke-width="6.4" fill="none" stroke-linecap="round"/>
      <path d="M80,172 l1,5 M88,172 l-1,5 M100,178 l-1,5 M108,176 l-2,5 M120,170 l1,5 M136,172 l-1,5" stroke="#9A4A4C" stroke-width="1.2" opacity=".7"/>
      <path d="M112,176 C118,172 122,170 128,170" stroke="#F0A8A0" stroke-width="7" fill="none" stroke-linecap="round"/>
      <circle cx="110" cy="110" r="106" fill="none" stroke="#7A5A3A" stroke-width="3"/>`;
  }

  /* ================= 4) Cenário ================= */
  function defs() {
    return `
    <linearGradient id="terra-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4E9EE2"/><stop offset=".45" stop-color="#86C2EE"/><stop offset=".8" stop-color="#C8E6F4"/><stop offset="1" stop-color="#EEF2E2"/></linearGradient>
    <radialGradient id="terra-solBrilho"><stop offset="0" stop-color="#FFFBE0" stop-opacity=".95"/><stop offset=".2" stop-color="#FFF4C4" stop-opacity=".5"/><stop offset=".6" stop-color="#FFF0B8" stop-opacity=".12"/><stop offset="1" stop-color="#FFF0B8" stop-opacity="0"/></radialGradient>
    <radialGradient id="terra-sol" cx=".42" cy=".4" r=".62"><stop offset="0" stop-color="#FFFFF4"/><stop offset=".7" stop-color="#FFF2B4"/><stop offset="1" stop-color="#FFE07E"/></radialGradient>
    <linearGradient id="terra-serra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8EA8C6"/><stop offset="1" stop-color="#B6C8D6"/></linearGradient>
    <linearGradient id="terra-colinaL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A2C48A"/><stop offset="1" stop-color="#B6CE9E"/></linearGradient>
    <linearGradient id="terra-colinaA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9ACA66"/><stop offset=".6" stop-color="#82B652"/><stop offset="1" stop-color="#6E9E44"/></linearGradient>
    <linearGradient id="terra-colinaB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8CC05C"/><stop offset=".6" stop-color="#76AA48"/><stop offset="1" stop-color="#62903C"/></linearGradient>
    <linearGradient id="terra-granito" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E6DCCE"/><stop offset=".6" stop-color="#CABEAE"/><stop offset="1" stop-color="#A49888"/></linearGradient>
    <linearGradient id="terra-telha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D0764A"/><stop offset="1" stop-color="#A04C28"/></linearGradient>
    <linearGradient id="terra-verde" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3E8A5A"/><stop offset="1" stop-color="#25603C"/></linearGradient>
    <linearGradient id="terra-vidro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C8E4F4"/><stop offset=".5" stop-color="#7EA8C4"/><stop offset="1" stop-color="#4E6E88"/></linearGradient>
    <linearGradient id="terra-muro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8E8676"/><stop offset="1" stop-color="#6A6252"/></linearGradient>
    <linearGradient id="terra-chao" gradientUnits="userSpaceOnUse" x1="0" y1="586" x2="0" y2="680"><stop offset="0" stop-color="#8C8A52"/><stop offset=".45" stop-color="#8A7446"/><stop offset="1" stop-color="#6E5232"/></linearGradient>
    <linearGradient id="terra-sup" gradientUnits="userSpaceOnUse" x1="430" y1="540" x2="1120" y2="690"><stop offset="0" stop-color="#6E4A2C"/><stop offset=".45" stop-color="#4E301A"/><stop offset="1" stop-color="#341F10"/></linearGradient>
    <linearGradient id="terra-pontaE" gradientUnits="userSpaceOnUse" x1="400" y1="0" x2="500" y2="0"><stop offset="0" stop-color="#A27450" stop-opacity=".55"/><stop offset="1" stop-color="#A27450" stop-opacity="0"/></linearGradient>
    <linearGradient id="terra-pontaD" gradientUnits="userSpaceOnUse" x1="1090" y1="0" x2="1200" y2="0"><stop offset="0" stop-color="#140A04" stop-opacity="0"/><stop offset="1" stop-color="#140A04" stop-opacity=".55"/></linearGradient>
    <linearGradient id="terra-camA" gradientUnits="userSpaceOnUse" x1="0" y1="640" x2="0" y2="720"><stop offset="0" stop-color="#47301C"/><stop offset=".25" stop-color="#3A2414"/><stop offset="1" stop-color="#33200F"/></linearGradient>
    <linearGradient id="terra-camB" gradientUnits="userSpaceOnUse" x1="0" y1="708" x2="0" y2="800"><stop offset="0" stop-color="#5E3A20"/><stop offset=".3" stop-color="#6E4527"/><stop offset="1" stop-color="#7C502E"/></linearGradient>
    <linearGradient id="terra-camC" gradientUnits="userSpaceOnUse" x1="0" y1="784" x2="0" y2="866"><stop offset="0" stop-color="#946236"/><stop offset=".3" stop-color="#A66E3C"/><stop offset="1" stop-color="#B88248"/></linearGradient>
    <linearGradient id="terra-camD" gradientUnits="userSpaceOnUse" x1="0" y1="850" x2="0" y2="900"><stop offset="0" stop-color="#8A7660"/><stop offset="1" stop-color="#6A5C4C"/></linearGradient>
    <linearGradient id="terra-luzCorte" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1600" y2="0"><stop offset="0" stop-color="#FFF0D0" stop-opacity=".14"/><stop offset=".4" stop-color="#FFF0D0" stop-opacity="0"/><stop offset=".62" stop-color="#140A04" stop-opacity="0"/><stop offset="1" stop-color="#140A04" stop-opacity=".22"/></linearGradient>
    <linearGradient id="terra-beira" gradientUnits="userSpaceOnUse" x1="0" y1="640" x2="0" y2="700"><stop offset="0" stop-color="#140A04" stop-opacity=".5"/><stop offset="1" stop-color="#140A04" stop-opacity="0"/></linearGradient>
    <radialGradient id="terra-sombra"><stop offset="0" stop-color="#2A1A0A" stop-opacity=".5"/><stop offset=".6" stop-color="#2A1A0A" stop-opacity=".2"/><stop offset="1" stop-color="#2A1A0A" stop-opacity="0"/></radialGradient>
    <radialGradient id="terra-po"><stop offset="0" stop-color="#C8A27A" stop-opacity=".6"/><stop offset=".55" stop-color="#B89068" stop-opacity=".26"/><stop offset="1" stop-color="#B89068" stop-opacity="0"/></radialGradient>
    <radialGradient id="terra-fumo"><stop offset="0" stop-color="#F4F2EE" stop-opacity=".85"/><stop offset=".6" stop-color="#E4E4E2" stop-opacity=".4"/><stop offset="1" stop-color="#E4E4E2" stop-opacity="0"/></radialGradient>
    <radialGradient id="terra-torrao" cx=".34" cy=".3" r=".75"><stop offset="0" stop-color="#8A6040"/><stop offset=".5" stop-color="#5A3A22"/><stop offset="1" stop-color="#2E1C0E"/></radialGradient>
    <radialGradient id="terra-pedra" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#E2DACE"/><stop offset=".55" stop-color="#ACA092"/><stop offset="1" stop-color="#6E6458"/></radialGradient>
    <radialGradient id="terra-couve" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#D2EAB4"/><stop offset=".6" stop-color="#94C478"/><stop offset="1" stop-color="#5E9A56"/></radialGradient>
    <radialGradient id="terra-couveG" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#86BE70"/><stop offset=".65" stop-color="#4E8A4C"/><stop offset="1" stop-color="#3A6E3C"/></radialGradient>
    <radialGradient id="terra-alface" cx=".45" cy=".35" r=".7"><stop offset="0" stop-color="#EEF8A8"/><stop offset=".5" stop-color="#B8DC66"/><stop offset="1" stop-color="#7EB040"/></radialGradient>
    <linearGradient id="terra-madeira" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C49464"/><stop offset=".5" stop-color="#A07448"/><stop offset="1" stop-color="#76522E"/></linearGradient>
    <linearGradient id="terra-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5EA06A"/><stop offset=".5" stop-color="#3E7A4A"/><stop offset="1" stop-color="#28563A"/></linearGradient>
    <linearGradient id="terra-zinco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E4EAEE"/><stop offset=".5" stop-color="#B4BEC4"/><stop offset="1" stop-color="#7E8A92"/></linearGradient>
    <linearGradient id="terra-ferro" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#DCE0E2"/><stop offset=".5" stop-color="#9AA2A8"/><stop offset="1" stop-color="#5E666C"/></linearGradient>
    <radialGradient id="terra-toupeira" cx=".42" cy=".28" r=".8"><stop offset="0" stop-color="#77717F"/><stop offset=".55" stop-color="#433D4A"/><stop offset="1" stop-color="#25212A"/></radialGradient>
    <radialGradient id="terra-melro" cx=".42" cy=".3" r=".8"><stop offset="0" stop-color="#52525C"/><stop offset=".55" stop-color="#202026"/><stop offset="1" stop-color="#0C0C10"/></radialGradient>
    <radialGradient id="terra-escaravelho" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#B8F07A"/><stop offset=".45" stop-color="#3EA04A"/><stop offset="1" stop-color="#14502A"/></radialGradient>
    <radialGradient id="terra-concha" cx=".36" cy=".34" r=".72"><stop offset="0" stop-color="#F6DCA4"/><stop offset=".55" stop-color="#C8904E"/><stop offset="1" stop-color="#7E4E24"/></radialGradient>
    <radialGradient id="terra-montinho" cx=".4" cy=".25" r=".85"><stop offset="0" stop-color="#7A5232"/><stop offset=".55" stop-color="#4E301A"/><stop offset="1" stop-color="#2E1C0E"/></radialGradient>
    <radialGradient id="terra-camara" cx=".5" cy=".62" r=".6"><stop offset="0" stop-color="#3A2414"/><stop offset="1" stop-color="#1A0E06"/></radialGradient>
    <radialGradient id="terra-semente" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#FAEED0"/><stop offset="1" stop-color="#C8A46A"/></radialGradient>
    <radialGradient id="terra-luzSol" gradientUnits="userSpaceOnUse" cx="190" cy="110" r="1400"><stop offset="0" stop-color="#FFF4C8" stop-opacity=".22"/><stop offset=".5" stop-color="#FFF0C0" stop-opacity=".05"/><stop offset="1" stop-color="#FFF0C0" stop-opacity="0"/></radialGradient>
    <radialGradient id="terra-vinheta" cx=".5" cy=".48" r=".8"><stop offset=".66" stop-color="#1A120A" stop-opacity="0"/><stop offset="1" stop-color="#1A120A" stop-opacity=".26"/></radialGradient>`;
  }

  /* --- céu: sol, nuvens e andorinhas --- */
  function nuvemSVG(i, k) {
    return `<g class="tr-nuvem${i}"><g transform="scale(${k})">
      <ellipse cx="0" cy="14" rx="100" ry="13" fill="#C6DDEE" opacity=".7"/>
      <ellipse cx="-50" cy="0" rx="38" ry="19" fill="#F2F8FC"/><ellipse cx="-8" cy="-12" rx="44" ry="26" fill="#FFFFFF"/><ellipse cx="38" cy="-2" rx="38" ry="19" fill="#F6FAFD"/><ellipse cx="78" cy="7" rx="24" ry="11" fill="#ECF4FA"/>
      <ellipse cx="0" cy="9" rx="96" ry="10" fill="#E6F0F8"/><ellipse cx="-26" cy="-24" rx="24" ry="7" fill="#FFFFFF"/></g></g>`;
  }
  function andorinhaSVG(i) {
    return `<g class="tr-andorinha${i}"><g class="tr-andAsas"><path d="M0,0 C-8,-10 -22,-14 -32,-8 C-20,-8 -10,-3 -2,4 Z M0,0 C8,-10 22,-14 32,-8 C20,-8 10,-3 2,4 Z" fill="#23284A"/></g>
      <path d="M-3,2 L0,-8 L3,2 L5,16 L1,8 L-1,8 L-5,16 Z" fill="#1A1E3A"/><circle cx="0" cy="-7" r="3.2" fill="#23284A"/><path d="M-2,-4 h4" stroke="#C8503A" stroke-width="1.6"/></g>`;
  }
  function ceuSVG() {
    return `<rect width="1600" height="600" fill="url(#terra-ceu)"/>
      <circle class="tr-solBrilho" cx="190" cy="110" r="380" fill="url(#terra-solBrilho)"/>
      <circle cx="190" cy="110" r="52" fill="url(#terra-sol)"/>
      <g class="tr-nuvens">${nuvemSVG(0, 1)}${nuvemSVG(1, .7)}${nuvemSVG(2, .9)}${nuvemSVG(3, .6)}${nuvemSVG(4, .8)}</g>
      ${andorinhaSVG(0)}${andorinhaSVG(1)}`;
  }

  /* --- serra, colinas com socalcos (muros e vinha), capela e carvalhos --- */
  const cumeA = x => 450 - 74 * Math.pow(Math.sin(PI * limita((x + 80) / 1060, 0, 1)), 1.3);
  const cumeB = x => 456 - 70 * Math.pow(Math.sin(PI * limita((x - 620) / 1080, 0, 1)), 1.3);
  function socalcos(cume, y0, k, sem) {
    const r = semente(sem);
    let muros = '', vinha = '', luz = '';
    for (let i = 0; i < k; i++) {
      const Y = y0 + i * 17, fase = r() * 6;
      let dentro = false, d = '';
      for (let x = -20; x <= 1620; x += 12) {
        const y = Y + 5 * Math.sin(x / 140 + fase) + i * 2 * Math.sin(x / 400);
        if (y > cume(x) + 7) {
          d += (dentro ? 'L' : 'M') + n(x) + ',' + n(y);
          if (x % 24 === 0) vinha += `M${n(x)},${n(y - 4)}l0,-7`;
          dentro = true;
        } else dentro = false;
      }
      muros += d;
      luz += d;
    }
    return { muros, vinha, luz };
  }
  function carvalhoD(x, y, k, r) {
    let d = '';
    for (let i = 0; i < 5; i++) d += blobD(x + (r() - .5) * 30 * k, y - 18 * k - r() * 18 * k, (14 + r() * 10) * k, (11 + r() * 7) * k, r, 9, .2);
    return d;
  }
  function longeSVG() {
    let serra = 'M-20,420';
    for (let x = -20; x <= 1620; x += 40) serra += `L${x},${n(392 - 26 * Math.sin(x / 210 + .6) - 14 * Math.sin(x / 83 + 2) - 10 * Math.sin(x / 37))}`;
    serra += 'L1620,520L-20,520Z';
    let colA = `M-20,${n(cumeA(-20))}`, colB = `M600,${n(cumeB(600))}`;
    for (let x = 0; x <= 1620; x += 20) { colA += `L${x},${n(cumeA(x))}`; if (x >= 600) colB += `L${x},${n(cumeB(x))}`; }
    colA += 'L1620,560L-20,560Z'; colB += 'L1620,560L600,560Z';
    const sA = socalcos(cumeA, 394, 7, 3), sB = socalcos(cumeB, 400, 7, 5);
    const r = semente(31);
    let copas = '', luzes = '', troncos = '';
    for (const [x, y, k] of [[64, 470, 1.4], [590, 476, 1.1], [940, 470, 1.2], [1530, 466, 1.4], [1210, 470, .9], [380, 430, .8]]) {
      copas += carvalhoD(x, y, k, r);
      luzes += blobD(x - 8 * k, y - 34 * k, 12 * k, 8 * k, r, 8, .2);
      troncos += `M${n(x - 2.5 * k)},${y + 6}L${n(x - 2 * k)},${n(y - 14 * k)}L${n(x + 2 * k)},${n(y - 14 * k)}L${n(x + 2.5 * k)},${y + 6}Z`;
    }
    // capelinha caiada no alto da colina da direita
    const cx = 1040, cy = cumeB(1040) + 2;
    const capela = `<g><path d="M${cx - 16},${cy} L${cx - 16},${cy - 20} L${cx + 14},${cy - 20} L${cx + 14},${cy} Z" fill="#F8F4EA" stroke="#9A9284" stroke-width="1"/>
      <path d="M${cx - 19},${cy - 19} L${cx - 1},${cy - 31} L${cx + 17},${cy - 19} Z" fill="#C8643E"/>
      <path d="M${cx + 6},${cy - 20} L${cx + 6},${cy - 40} L${cx + 16},${cy - 40} L${cx + 16},${cy - 20} Z" fill="#F2EEE4" stroke="#9A9284" stroke-width="1"/>
      <path d="M${cx + 5},${cy - 40} L${cx + 11},${cy - 47} L${cx + 17},${cy - 40} Z" fill="#B8B0A2"/><path d="M${cx + 11},${cy - 47} l0,-6 M${cx + 8.5},${cy - 50} h5" stroke="#6A6258" stroke-width="1.2"/>
      <path d="M${cx - 3},${cy} l0,-9 q3,-3 6,0 l0,9 Z" fill="#6A5A4A"/><circle cx="${cx + 11}" cy="${cy - 33}" r="2.2" fill="#5A5248"/></g>`;
    return `<path d="${serra}" fill="url(#terra-serra)"/>
      <path d="M150,372 C190,362 230,360 280,352 M1180,366 C1240,354 1290,356 1340,366" stroke="#CAD6E2" stroke-width="3" fill="none" opacity=".7"/>
      <path d="M-20,440 C140,424 300,434 460,428 C620,422 760,436 920,430 C1080,424 1240,436 1400,428 C1500,424 1560,428 1620,426 L1620,560 L-20,560 Z" fill="url(#terra-colinaL)"/>
      <path d="${colA}" fill="url(#terra-colinaA)"/>
      <path d="${sA.luz}" stroke="#B8DC88" stroke-width="7" fill="none" opacity=".35" transform="translate(0,-4)"/>
      <path d="${sA.muros}" stroke="#5E7A3A" stroke-width="3" fill="none" transform="translate(0,3.5)" opacity=".6"/><path d="${sA.muros}" stroke="#C8BEA8" stroke-width="4.4" fill="none" stroke-linejoin="round"/>
      <path d="${sA.vinha}" stroke="#4E7A30" stroke-width="4.4" stroke-linecap="round"/>
      <path d="${colB}" fill="url(#terra-colinaB)"/>
      <path d="${sB.luz}" stroke="#AED47E" stroke-width="7" fill="none" opacity=".35" transform="translate(0,-4)"/>
      <path d="${sB.muros}" stroke="#56723A" stroke-width="3" fill="none" transform="translate(0,3.5)" opacity=".6"/><path d="${sB.muros}" stroke="#C2B8A2" stroke-width="4.4" fill="none" stroke-linejoin="round"/>
      <path d="${sB.vinha}" stroke="#476E2C" stroke-width="4.4" stroke-linecap="round"/>
      ${capela}
      <path d="${troncos}" fill="#5E4630"/><path d="${copas}" fill="#4A7A30" stroke="#36602A" stroke-width="1.2"/><path d="${luzes}" fill="#86B456" opacity=".7"/>`;
  }

  /* --- casa de granito (à esquerda, atrás do muro) com janelas verdes e chaminé --- */
  function casaSVG() {
    const r = semente(7);
    let b1 = '', b2 = '', b3 = '';
    for (let fila = 0; fila < 4; fila++) {
      const y = 444 + fila * 19;
      for (let x = 96 + (fila % 2) * 16; x < 404; x += 30 + r() * 12) {
        const w = Math.min(28 + r() * 12, 402 - x); if (w < 8) continue;
        if ((x + w > 130 && x < 192) || (x + w > 300 && x < 362)) if (y < 500) continue;   // janelas
        if (x + w > 222 && x < 270) continue;                                              // porta
        const d = `M${n(x + 1)},${n(y + 1)}h${n(w - 2)}v17h${n(-(w - 2))}Z`;
        const k = r(); if (k < .4) b1 += d; else if (k < .75) b2 += d; else b3 += d;
      }
    }
    let telhas = '';
    for (let i = 0; i < 4; i++) { const y = 396 + i * 13, x0 = 114 - (y - 384) * .7, x1 = 380 + (y - 384) * .7; telhas += `M${n(x0)},${y}`; for (let x = x0; x < x1 - 10; x += 16) telhas += `Q${n(x + 8)},${y - 5} ${n(x + 16)},${y}`; }
    const janela = x => `<rect x="${x - 4}" y="452" width="62" height="50" fill="#D8CCBE" stroke="#A89A8A" stroke-width="1.2"/>
      <rect x="${x}" y="456" width="54" height="42" fill="url(#terra-vidro)"/>
      <path d="M${x + 27},456 L${x + 27},498 M${x},477 L${x + 54},477" stroke="#F8F2EA" stroke-width="3.4"/>
      <path d="M${x + 5},461 L${x + 16},470" stroke="#FFFFFF" stroke-width="2.4" opacity=".6" stroke-linecap="round"/>
      <rect x="${x - 20}" y="454" width="16" height="48" fill="url(#terra-verde)" stroke="#1A4A2C" stroke-width="1.2"/>
      <rect x="${x + 58}" y="454" width="16" height="48" fill="url(#terra-verde)" stroke="#1A4A2C" stroke-width="1.2"/>
      <path d="M${x - 17},462 h10 M${x - 17},472 h10 M${x - 17},482 h10 M${x - 17},492 h10 M${x + 61},462 h10 M${x + 61},472 h10 M${x + 61},482 h10 M${x + 61},492 h10" stroke="#1E5A36" stroke-width="1.6"/>
      <path d="M${x - 6},502 h66" stroke="#E4D8CC" stroke-width="5"/>
      <path d="M${x + 6},500 c2,-10 10,-12 12,-2 c2,-10 12,-10 12,0 c2,-8 10,-8 12,0" fill="#4E8A3A"/><path d="${elip(x + 12, 492, 4.5, 4.5)}${elip(x + 26, 490, 5, 5)}${elip(x + 40, 492, 4.5, 4.5)}" fill="#E8303A"/>`;
    return `<g>
      <rect x="92" y="438" width="314" height="80" fill="#8E8274"/>
      <path d="${b1}" fill="#D8CCBE"/><path d="${b2}" fill="#C4B6A6"/><path d="${b3}" fill="#E6DCD0"/>
      <path d="M92,438 L114,438 L114,518 L92,518 Z" fill="#F4EADC" opacity=".5"/>
      <rect x="384" y="438" width="22" height="80" fill="#5E5244" opacity=".35"/>
      ${janela(140)}${janela(310)}
      <rect x="216" y="466" width="60" height="52" fill="#D8CCBE" stroke="#A89A8A" stroke-width="1.2"/>
      <rect x="224" y="474" width="44" height="44" fill="url(#terra-verde)" stroke="#1A4A2C" stroke-width="1.4"/>
      <path d="M235,476 L235,518 M246,476 L246,518 M257,476 L257,518" stroke="#1E5A36" stroke-width="1.4" opacity=".7"/>
      <path d="M72,444 L114,384 L384,384 L426,444 Z" fill="url(#terra-telha)" stroke="#7E361A" stroke-width="1.8"/>
      <path d="${telhas}" stroke="#8E3E1E" stroke-width="1.6" fill="none" opacity=".7"/>
      <path d="M68,444 L430,444" stroke="#7E361A" stroke-width="5" stroke-linecap="round"/>
      <path d="M114,386 L384,386" stroke="#EE9C72" stroke-width="3" opacity=".7"/>
      <rect x="326" y="350" width="26" height="40" fill="#C8BAAA" stroke="#8E8274" stroke-width="1.4"/><rect x="322" y="346" width="34" height="7" fill="#A89A8A"/>
      <path d="M330,360 h18 M330,371 h18 M330,382 h18" stroke="#A89A8A" stroke-width="1.2"/>
    </g>`;
  }

  /* --- espigueiro de granito (à direita, atrás do muro) com cruz e pináculo, sobre pés com mós --- */
  function espigueiroSVG() {
    let ripas = '';
    for (let x = 1290; x < 1478; x += 10) ripas += `M${x},446 L${x},494`;
    const pe = x => `<path d="M${x - 7},516 L${x - 5},502 L${x + 5},502 L${x + 7},516 Z" fill="url(#terra-granito)" stroke="#8E8274" stroke-width="1"/>
      <ellipse cx="${x}" cy="500" rx="16" ry="4.5" fill="#CEC2B4" stroke="#8E8274" stroke-width="1"/>`;
    return `<g>
      ${pe(1290)}${pe(1350)}${pe(1420)}${pe(1474)}
      <rect x="1272" y="490" width="220" height="9" fill="#B9AC9C" stroke="#8E8274" stroke-width="1"/>
      <rect x="1274" y="438" width="216" height="54" fill="#5A4E44"/>
      <path d="${ripas}" stroke="#D2C6B8" stroke-width="5.4"/><path d="${ripas}" stroke="#F2E8DC" stroke-width="1.6" opacity=".5" transform="translate(-1.5,0)"/>
      <rect x="1274" y="438" width="13" height="54" fill="url(#terra-granito)"/><rect x="1477" y="438" width="13" height="54" fill="url(#terra-granito)"/><rect x="1377" y="438" width="10" height="54" fill="url(#terra-granito)"/>
      <path d="M1262,442 L1282,410 L1482,410 L1502,442 Z" fill="#CABEB0" stroke="#8E8274" stroke-width="1.4"/>
      <path d="M1282,410 L1482,410" stroke="#F2E6D8" stroke-width="2.6"/>
      <path d="M1318,410 L1310,442 M1356,410 L1352,442 M1394,410 L1394,442 M1432,410 L1436,442 M1468,410 L1476,442" stroke="#A89A8A" stroke-width="1.2"/>
      <path d="M1292,410 L1292,378 M1283,388 L1301,388" stroke="#D2C6B8" stroke-width="6" stroke-linecap="round"/>
      <path d="M1472,410 L1478,386 L1484,410 Z" fill="#D2C6B8" stroke="#8E8274" stroke-width="1"/><circle cx="1478" cy="384" r="3.4" fill="#D2C6B8"/>
    </g>`;
  }

  /* --- muro de pedra da horta (granito, com musgo e fetos) --- */
  function muroSVG() {
    const r = semente(29);
    let p1 = '', p2 = '', p3 = '', br = '';
    for (let fila = 0; fila < 4; fila++) {
      for (let x = -30 + (fila % 2) * 18; x < 1630; x += 30 + r() * 16) {
        const w = 24 + r() * 16, y = 514 + fila * 18.5 + r() * 2, hh = 15 + r() * 3;
        const d = `M${n(x + 5)},${n(y)}L${n(x + w - 5)},${n(y)}Q${n(x + w)},${n(y)} ${n(x + w)},${n(y + 5)}L${n(x + w)},${n(y + hh - 4)}Q${n(x + w)},${n(y + hh)} ${n(x + w - 5)},${n(y + hh)}L${n(x + 5)},${n(y + hh)}Q${n(x)},${n(y + hh)} ${n(x)},${n(y + hh - 4)}L${n(x)},${n(y + 5)}Q${n(x)},${n(y)} ${n(x + 5)},${n(y)}Z`;
        const k = r(); if (k < .4) p1 += d; else if (k < .75) p2 += d; else p3 += d;
        br += `M${n(x + 5)},${n(y + 2.5)}L${n(x + w * .6)},${n(y + 2.5)}`;
      }
    }
    let musgo = '';
    for (let x = -20; x < 1630; x += 18 + r() * 30) musgo += blobD(x, 514 + r() * 3, 12 + r() * 16, 4 + r() * 3, r, 8, .3);
    let fetos = '';
    for (const x of [470, 1110, 1580, 30]) for (let i = -3; i <= 3; i++) fetos += `M${x},586 q${i * 5},-14 ${i * 11},-${18 - Math.abs(i) * 2}`;
    return `<rect x="-20" y="512" width="1640" height="78" fill="url(#terra-muro)"/>
      <path d="${p1}" fill="#C8BEB0"/><path d="${p2}" fill="#B0A494"/><path d="${p3}" fill="#D6CCBE"/>
      <path d="${br}" stroke="#F4EADE" stroke-width="1.6" opacity=".6" stroke-linecap="round"/>
      <path d="${musgo}" fill="#7EA048"/><path d="${musgo}" fill="#A4C466" transform="translate(-2,-2) scale(1,1)" opacity=".45"/>
      <path d="${fetos}" stroke="#5E8E36" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  }

  /* --- chão da horta (entre o muro e a beira do corte), canteiros dos lados e sombra da leira --- */
  function chaoSVG() {
    const r = semente(5);
    let erva = '', erva2 = '', pedras = '';
    for (let i = 0; i < 150; i++) {
      const x = r() * 1640 - 20, y = 590 + Math.pow(r(), 1.3) * 84, h = 4 + (y - 586) / 14 + r() * 5;
      if (x > LX0 - 10 && x < LX1 + 10 && y > tras(x) - 6) continue;
      const d = `M${n(x)},${n(y)} q${n(-1 + r() * 2)},${n(-h * .6)} ${n(-3 + r() * 6)},${n(-h)}`;
      if (r() < .5) erva += d; else erva2 += d;
    }
    for (let i = 0; i < 26; i++) { const x = r() * 1600, y = 600 + r() * 70; if (x > LX0 - 20 && x < LX1 + 20) continue; pedras += elip(x, y, 2 + r() * 3.5, 1.5 + r() * 2); }
    // canteiros dos lados: terra cavada mais clara, com regos
    const canteiro = (x0, x1) => {
      let d = `M${x0},${CHAO + 2} C${x0},640 ${x0 + 20},634 ${x0 + 40},632 L${x1 - 30},630 C${x1 - 10},632 ${x1},642 ${x1},${CHAO + 2} Z`;
      let regos = '';
      for (let i = 0; i < 3; i++) { const y = 640 + i * 12; regos += `M${x0 + 20 + i * 6},${y} C${(x0 + x1) / 2},${y - 3} ${x1 - 40},${y + 2} ${x1 - 16 - i * 4},${y}`; }
      return { d, regos };
    };
    const cE = canteiro(-20, 392), cD = canteiro(1214, 1620);
    return `<path d="M-20,586 L1620,586 L1620,${CHAO + 4} L-20,${CHAO + 4} Z" fill="url(#terra-chao)"/>
      <path d="M-20,588 C300,594 600,590 900,594 C1200,598 1400,590 1620,592 L1620,604 C1300,610 900,602 600,606 C300,610 100,604 -20,604 Z" fill="#9CB862" opacity=".5"/>
      <path d="${cE.d}${cD.d}" fill="#5A3A20"/>
      <path d="${cE.regos}${cD.regos}" stroke="#3A2412" stroke-width="2.6" fill="none" opacity=".7"/>
      <path d="${cE.regos}${cD.regos}" stroke="#8A6040" stroke-width="1.4" fill="none" opacity=".6" transform="translate(0,-2.5)"/>
      <path d="${erva}" stroke="#6E9A40" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="${erva2}" stroke="#96BE5C" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="${pedras}" fill="#A89C8A"/>
      <ellipse cx="1214" cy="650" rx="70" ry="22" fill="url(#terra-sombra)"/>`;
  }

  /* --- carrinho de mão (à direita, encostado ao muro), cheio de terra com um saco --- */
  function carrinhoSVG() {
    const r = semente(43);
    let migas = '';
    for (let i = 0; i < 26; i++) migas += `M${n(1350 + r() * 110)},${n(540 + r() * 26)}h.01`;
    return `<g>
      <ellipse cx="1430" cy="664" rx="150" ry="13" fill="url(#terra-sombra)"/>
      <path d="M1470,622 L1486,664 M1430,622 L1418,664" stroke="#3A4A3E" stroke-width="6" stroke-linecap="round"/>
      <path d="M1360,620 L1590,592" stroke="#7A5230" stroke-width="9" stroke-linecap="round"/>
      <path d="M1332,572 C1350,540 1400,524 1450,528 C1486,530 1510,546 1516,562 C1460,570 1380,576 1332,572 Z" fill="#4E301A" stroke="#24140A" stroke-width="1.6"/><path d="M1360,548 C1390,532 1430,530 1460,536" stroke="#8A6040" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="M1460,540 C1470,516 1500,512 1510,530 L1516,560 L1462,562 Z" fill="#C8B086" stroke="#8A7450" stroke-width="1.4"/><path d="M1472,530 q10,-6 22,0" stroke="#8A7450" stroke-width="1.2" fill="none"/>
      <path d="${migas}" stroke="#7A5232" stroke-width="3" stroke-linecap="round"/>
      <path d="M1326,568 L1520,560 L1494,626 L1358,630 Z" fill="url(#terra-metal)" stroke="#1E3A28" stroke-width="2" stroke-linejoin="round"/>
      <path d="M1330,572 L1516,564" stroke="#9AD0A0" stroke-width="2.6" opacity=".7" stroke-linecap="round"/>
      <path d="M1352,590 L1500,584 M1360,608 L1494,604" stroke="#2A5038" stroke-width="1.4" opacity=".7"/>
      <path d="M1376,582 C1384,590 1386,602 1380,616" stroke="#A8DCAE" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>
      <path d="M1356,620 L1324,642" stroke="#5E3E22" stroke-width="7" stroke-linecap="round"/>
      <circle cx="1318" cy="644" r="26" fill="#2E2A28" stroke="#141210" stroke-width="2"/><circle cx="1318" cy="644" r="15" fill="url(#terra-ferro)" stroke="#3A3E42" stroke-width="1.6"/>
      <path d="M1318,629 L1318,659 M1303,644 L1333,644 M1307,633 L1329,655 M1329,633 L1307,655" stroke="#5E666C" stroke-width="1.6"/><circle cx="1318" cy="644" r="4" fill="#3A3E42"/>
      <path d="M1298,630 a26,26 0 0,1 22,-12" stroke="#6E6862" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="1586" cy="592" rx="9" ry="6" fill="#5E3E22"/>
    </g>`;
  }

  /* --- couves galegas, repolhos e alfaces dos canteiros dos lados --- */
  function galegaSVG(i, x, y, k) {
    let f = '';
    for (let j = 0; j < 6; j++) {
      const yy = y - (34 + j * 16) * k, sg = j % 2 ? 1 : -1, cx = x + sg * 24 * k, cy = yy;
      f += `<path d="M${x},${n(yy + 6 * k)} C${n(x + sg * 12 * k)},${n(cy - 20 * k)} ${n(cx + sg * 30 * k)},${n(cy - 16 * k)} ${n(cx + sg * 22 * k)},${n(cy + 8 * k)} C${n(cx + sg * 10 * k)},${n(cy + 18 * k)} ${n(x + sg * 6 * k)},${n(cy + 14 * k)} ${x},${n(yy + 6 * k)} Z" fill="url(#terra-couveG)" stroke="#2E5E3A" stroke-width="1.3"/>
        <path d="M${x},${n(yy + 6 * k)} Q${n(x + sg * 20 * k)},${n(cy - 6 * k)} ${n(cx + sg * 18 * k)},${n(cy + 2 * k)}" stroke="#C8E0AA" stroke-width="1.6" fill="none" opacity=".75"/>`;
    }
    const topoY = y - 136 * k;
    f += `<path d="M${x},${n(topoY + 14 * k)} C${n(x - 16 * k)},${n(topoY)} ${n(x - 6 * k)},${n(topoY - 16 * k)} ${x},${n(topoY - 18 * k)} C${n(x + 6 * k)},${n(topoY - 16 * k)} ${n(x + 16 * k)},${n(topoY)} ${x},${n(topoY + 14 * k)} Z" fill="#6EAA5A" stroke="#2E5E3A" stroke-width="1.2"/>`;
    return `<g class="tr-galega${i}"><ellipse cx="${x + 8}" cy="${y + 2}" rx="${n(30 * k)}" ry="${n(6 * k)}" fill="#2A1A0A" opacity=".35"/>
      <path d="M${x},${y} L${x},${n(topoY)}" stroke="#7A9A5A" stroke-width="${n(7 * k)}" stroke-linecap="round"/><path d="M${x - 1.5 * k},${y} L${n(x - 1.5 * k)},${n(topoY + 10)}" stroke="#B4CC92" stroke-width="${n(2 * k)}" stroke-linecap="round" opacity=".7"/>${f}</g>`;
  }
  function repolhoSVG(x, y, k) {
    let f = '';
    for (let i = 0; i < 7; i++) {
      const a = -PI / 2 + (i - 3) * .5, cx = x + Math.cos(a) * 24 * k, cy = y - 16 * k + Math.sin(a) * 14 * k;
      f += `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(23 * k)}" ry="${n(13 * k)}" transform="rotate(${n(a / RAD + 90)},${n(cx)},${n(cy)})" fill="url(#terra-couveG)" stroke="#2E5E3A" stroke-width="1.2"/>`;
    }
    return `<g><ellipse cx="${x + 8}" cy="${y + 2}" rx="${n(40 * k)}" ry="${n(8 * k)}" fill="#2A1A0A" opacity=".35"/>${f}
      <circle cx="${x}" cy="${n(y - 22 * k)}" r="${n(21 * k)}" fill="url(#terra-couve)" stroke="#3E7A44" stroke-width="1.4"/>
      <path d="M${n(x - 13 * k)},${n(y - 27 * k)} C${n(x - 4 * k)},${n(y - 38 * k)} ${n(x + 8 * k)},${n(y - 36 * k)} ${n(x + 15 * k)},${n(y - 25 * k)} M${x},${n(y - 42 * k)} L${x},${n(y - 10 * k)}" stroke="#EEF6D4" stroke-width="${n(2 * k)}" fill="none" opacity=".8"/></g>`;
  }
  function alfaceSVG(x, y, k, sem) {
    const r = semente(sem);
    const camada = (rx, ry, dy, cor, contorno) => `<path d="${blobD(x, y - dy * k, rx * k, ry * k, r, 16, .12)}" fill="${cor}" stroke="${contorno}" stroke-width="1.3"/>`;
    let nervuras = '';
    for (let i = 0; i < 7; i++) { const a = PI + i / 6 * PI; nervuras += `M${x},${n(y - 14 * k)}L${n(x + Math.cos(a) * 30 * k)},${n(y - 14 * k + Math.sin(a) * 18 * k)}`; }
    return `<g><ellipse cx="${x + 8}" cy="${y + 2}" rx="${n(42 * k)}" ry="${n(8 * k)}" fill="#2A1A0A" opacity=".35"/>
      ${camada(40, 16, 10, '#6EA43A', '#3E6E22')}${camada(32, 15, 18, 'url(#terra-alface)', '#4E8A2A')}
      <path d="${nervuras}" stroke="#E8F4BE" stroke-width="1.4" opacity=".55"/>
      ${camada(20, 12, 26, '#D2EC8A', '#6EA43A')}${camada(10, 7, 32, '#F2FAC2', '#9AC85A')}</g>`;
  }
  function hortasSVG() {
    return `${galegaSVG(0, 96, 670, 1.15)}${galegaSVG(1, 252, 666, 1)}
      ${repolhoSVG(28, 682, .9)}${repolhoSVG(170, 686, 1.1)}${repolhoSVG(318, 686, .95)}
      ${alfaceSVG(1248, 684, 1, 3)}${alfaceSVG(1338, 688, 1.1, 5)}${alfaceSVG(1428, 684, .95, 7)}${alfaceSVG(1514, 688, 1.05, 9)}${alfaceSVG(1598, 684, .9, 11)}`;
  }
  // regador de zinco (à esquerda, entre as couves e a leira)
  function regadorSVG() {
    return `<g transform="translate(372,674)">
      <ellipse cx="4" cy="2" rx="34" ry="6" fill="#2A1A0A" opacity=".35"/>
      <path d="M-20,-44 L20,-44 L17,0 L-17,0 Z" fill="url(#terra-zinco)" stroke="#5E6A72" stroke-width="1.8"/>
      <ellipse cx="0" cy="-44" rx="20" ry="5" fill="#C8D0D4" stroke="#5E6A72" stroke-width="1.5"/><ellipse cx="0" cy="-44" rx="15" ry="3.2" fill="#4E5A62"/>
      <path d="M17,-12 L46,-40" stroke="#7E8A92" stroke-width="6" stroke-linecap="round"/><path d="M17,-12 L46,-40" stroke="#C8D0D4" stroke-width="2.6" stroke-linecap="round"/>
      <ellipse cx="48" cy="-42" rx="6" ry="8" transform="rotate(-40,48,-42)" fill="#A4AEB4" stroke="#5E6A72" stroke-width="1.3"/>
      <path d="M-14,-46 C-14,-68 14,-68 14,-46" stroke="#5E6A72" stroke-width="3.6" fill="none"/>
      <path d="M-12,-36 L-11,-6" stroke="#FFFFFF" stroke-width="3" opacity=".6" stroke-linecap="round"/>
      <path d="M-19,-30 L19,-30 M-18,-16 L18,-16" stroke="#8A969E" stroke-width="1.2"/>
      <path d="M-17,0 Q-6,-6 0,0" fill="#4E301A"/></g>`;
  }
  // ancinho espetado na ponta esquerda da leira (dentes enterrados) e pá espetada na ponta direita (o pisco pousa no cabo)
  function ancinhoSVG() {
    const bx = 456, by = sup(456, .55);
    let dentes = '';
    for (let i = -5; i <= 5; i++) dentes += `M${n(bx + i * 7)},${n(by - 8 + i * .7)} l.6,10`;
    return `<g>
      <path d="M${n(bx + 2)},${n(by - 10)} L406,360" stroke="#5E3E22" stroke-width="8" stroke-linecap="round"/>
      <path d="M${n(bx + 2)},${n(by - 10)} L406,360" stroke="#C49464" stroke-width="3" stroke-linecap="round" transform="translate(-1.8,0)"/>
      <path d="${dentes}" stroke="#4E565C" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M${n(bx - 40)},${n(by - 12)} L${n(bx + 40)},${n(by - 5)}" stroke="#3E464C" stroke-width="6" stroke-linecap="round"/>
      <path d="M${n(bx - 38)},${n(by - 14)} L${n(bx + 30)},${n(by - 8)}" stroke="#A8B0B6" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M${n(bx - 46)},${n(by + 2)} C${n(bx - 30)},${n(by - 6)} ${n(bx + 30)},${n(by - 2)} ${n(bx + 46)},${n(by + 6)} C${n(bx + 20)},${n(by + 8)} ${n(bx - 20)},${n(by + 6)} ${n(bx - 46)},${n(by + 2)} Z" fill="#4E301A"/>
    </g>`;
  }
  function paSVG() {
    const bx = PA.x, by = sup(PA.x, PA.v), tx = PA.x + 6, ty = PA.topo;
    const r = semente(77);
    let migas = '';
    for (let i = 0; i < 10; i++) migas += `M${n(bx - 22 + r() * 44)},${n(by - 2 + r() * 8)}h.01`;
    return `<g>
      <ellipse cx="${bx + 20}" cy="${n(by + 4)}" rx="30" ry="7" fill="#140A04" opacity=".35"/>
      <g>
      <path d="M${bx - 18},${n(by - 34)} Q${bx - 18},${n(by - 42)} ${bx - 8},${n(by - 42)} L${bx + 8},${n(by - 42)} Q${bx + 18},${n(by - 42)} ${bx + 18},${n(by - 34)} L${bx + 16},${n(by + 6)} L${bx - 16},${n(by + 6)} Z" fill="url(#terra-ferro)" stroke="#3A3E42" stroke-width="2" stroke-linejoin="round"/>
      <path d="M${bx - 10},${n(by - 34)} L${bx - 9},${n(by - 2)}" stroke="#FFFFFF" stroke-width="3.4" opacity=".6" stroke-linecap="round"/>
      <path d="M${bx + 9},${n(by - 32)} L${bx + 9},${n(by - 4)}" stroke="#4E565C" stroke-width="1.6" opacity=".6" stroke-linecap="round"/>
      <path d="M${bx - 6},${n(by - 41)} L${bx - 4},${n(by - 54)} L${bx + 4},${n(by - 54)} L${bx + 6},${n(by - 41)} Z" fill="#6E767C" stroke="#3A3E42" stroke-width="1.4"/></g>
      <path d="M${bx - 26},${n(by + 6)} C${bx - 22},${n(by - 6)} ${bx - 10},${n(by - 4)} ${bx},${n(by - 2)} C${bx + 10},${n(by - 5)} ${bx + 22},${n(by - 6)} ${bx + 27},${n(by + 6)} Z" fill="#4E301A" stroke="#24140A" stroke-width="1.4"/>
      <path d="${migas}" stroke="#8A6040" stroke-width="3" stroke-linecap="round"/>
      <path d="M${bx},${n(by - 52)} L${tx},${ty + 22}" stroke="#5E3E22" stroke-width="8" stroke-linecap="round"/>
      <path d="M${bx},${n(by - 52)} L${tx},${ty + 22}" stroke="#C8986A" stroke-width="3" stroke-linecap="round" transform="translate(-1.8,0)"/>
      <path d="M${tx - 13},${ty} Q${tx},${ty - 8} ${tx + 13},${ty} L${tx + 3},${ty + 22} L${tx - 3},${ty + 22} Z" fill="none" stroke="#5E3E22" stroke-width="5" stroke-linejoin="round"/>
      <path d="M${tx - 15},${ty} L${tx + 15},${ty}" stroke="#7A5230" stroke-width="6" stroke-linecap="round"/><path d="M${tx - 13},${ty - 1.6} L${tx + 8},${ty - 1.6}" stroke="#D4A474" stroke-width="2" stroke-linecap="round"/>
    </g>`;
  }

  /* --- bichos do cenário: pisco (no cabo da pá), borboleta da couve, fumo da chaminé --- */
  function piscoSVG() {
    return `<g class="tr-pisco"><g class="tr-piscoCorpo">
      <path class="tr-piscoCauda" d="M10,-14 L31,-27 L34,-20 L14,-8 Z" fill="#7A5A3A" stroke="#4A3420" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M-4,-6 L-5,1 M3,-6 L4,1 M-9,1 h8 M0,1 h8" stroke="#6A4A30" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="2" cy="-17" rx="15.5" ry="12.5" fill="#8C6E4A" stroke="#4A3420" stroke-width="1.6"/>
      <path d="M-12,-13 C-10,-4 6,-3 13,-10 C6,-8 -4,-8 -12,-13 Z" fill="#EEE8DC"/>
      <path d="M-13,-25 C-17,-17 -13,-9 -4,-7 C-1,-12 -3,-20 -5,-27 Z" fill="#EC7C3C"/>
      <g class="tr-piscoAsa"><path d="M-2,-25 C10,-27 19,-21 17,-12 C9,-12 1,-16 -2,-25 Z" fill="#6E5234" stroke="#4A3420" stroke-width="1.2"/><path d="M3,-21 q6,1 10,6 M5,-17 q4,1 7,3" stroke="#A88A62" stroke-width="1.1" fill="none"/></g>
      <g class="tr-piscoCab">
        <circle cx="-8" cy="-31" r="10" fill="#8C6E4A" stroke="#4A3420" stroke-width="1.6"/>
        <path d="M-17.6,-33 C-17,-24 -11,-20 -3,-22 C-6,-26 -7,-31 -6,-37 C-10,-38.5 -15,-37 -17.6,-33 Z" fill="#EE8040"/>
        <circle cx="-11" cy="-33" r="2.7" fill="#120A06"/><circle cx="-11.9" cy="-34" r=".95" fill="#FFFFFF"/>
        <ellipse class="tr-piscoPalp" cx="-11" cy="-33" rx="3" ry="3" fill="#8C6E4A" transform="translate(0,-36) scale(1,.001) translate(0,36)"/>
        <path d="M-17,-32 L-23.5,-31 L-17,-28.6 Z" fill="#3A2A1E"/>
      </g></g></g>`;
  }
  function borboletaSVG() {
    const asa = s => `<g class="tr-asa${s < 0 ? 'E' : 'D'}"><path d="M0,0 C${s * 6},-16 ${s * 22},-20 ${s * 24},-8 C${s * 24},0 ${s * 12},2 0,0 Z M0,1 C${s * 12},2 ${s * 18},10 ${s * 12},14 C${s * 6},16 ${s * 2},8 0,1 Z" fill="#FBFBF4" stroke="#9A9A8A" stroke-width="1"/>
      <path d="M${s * 16},-16 C${s * 22},-16 ${s * 25},-12 ${s * 24},-8 C${s * 20},-10 ${s * 17},-12 ${s * 16},-16 Z" fill="#3A3A3A"/><circle cx="${s * 14}" cy="-6" r="2" fill="#3A3A3A"/></g>`;
    return `<g class="tr-borboleta">${asa(-1)}${asa(1)}<ellipse cx="0" cy="2" rx="1.8" ry="7" fill="#4A4A40"/><path d="M-1,-5 q-3,-6 -6,-8 M1,-5 q3,-6 6,-8" stroke="#4A4A40" stroke-width="1" fill="none"/></g>`;
  }

  /* ================= 5) A terra: superfície, corte, bichos e rebentos ================= */
  // contorno de um pedaço da superfície da leira entre xa e xb (frente e trás)
  function pedacoSup(xa, xb, abaixo) {
    let d = '';
    for (let x = xa; x <= xb + .01; x += 5) d += (d ? 'L' : 'M') + n(x) + ',' + n(topo(x) + abaixo);
    for (let x = xb; x >= xa - .01; x -= 5) d += 'L' + n(x) + ',' + n(tras(x));
    return d + 'Z';
  }
  function superficieSVG() {
    const r = semente(53);
    // sulcos (regos escuros) e camalhões (cristas claras), a seguir a curva da leira
    let regos = '', cristas = '', cristasF = '';
    for (let k = 1; k <= 7; k++) {
      const v = k / 8, meia = LMEIA * (.9 - .02 * k), fs = r() * 6;
      let dr = '', dc = '';
      for (let x = LCX - meia; x <= LCX + meia; x += 10) {
        const y = sup(x, v) + 1.5 * Math.sin(x / 17 + fs);
        dr += (dr ? 'L' : 'M') + n(x) + ',' + n(y);
        dc += (dc ? 'L' : 'M') + n(x) + ',' + n(sup(x, v + .055) + 1.2 * Math.sin(x / 13 + fs));
      }
      regos += dr;
      if (k % 2) cristas += dc; else cristasF += dc;
    }
    // torrões parados, migalhas, pedrinhas, raízes arrancadas e buracos de minhoca
    let corpos = '', luzes = '', sombras = '', escuros = '';
    for (let i = 0; i < 60; i++) {
      const v = r(), x = LCX + (r() * 2 - 1) * LMEIA * .93;
      if (eL(x) < .55) continue;
      if (TORROES.some(t => Math.abs(t.x - x) < 26 && Math.abs(t.v - v) < .12)) continue;
      const y = sup(x, v), s = esc(v) * (4 + r() * 9);
      corpos += blobD(x, y - s * .45, s, s * .72, r, 8, .26);
      luzes += blobD(x - s * .25, y - s * .7, s * .55, s * .32, r, 7, .2);
      sombras += elip(x + s * .45, y + s * .12, s * 1.05, s * .32);
      if (r() < .4) escuros += elip(x + s * .2, y - s * .2, s * .35, s * .2);
    }
    // na beira de trás, torrões a fazer a silhueta irregular
    for (let x = LX0 + 30; x < LX1 - 30; x += 22 + r() * 22) { const s = 4 + r() * 5; corpos += blobD(x, tras(x) + 2, s * 1.3, s, r, 8, .25); luzes += blobD(x - s * .3, tras(x) - s * .2, s * .6, s * .35, r, 7, .2); }
    const migas = ['', '', ''];
    for (let i = 0; i < 320; i++) {
      const v = r(), x = LCX + (r() * 2 - 1) * LMEIA * .97;
      if (eL(x) < .3) continue;
      migas[i % 3] += `M${n(x)},${n(sup(x, v) - r() * 2)}h.01`;
    }
    let pedras = '', pedrasL = '';
    for (let i = 0; i < 16; i++) {
      const v = r(), x = LCX + (r() * 2 - 1) * LMEIA * .85, s = esc(v) * (2.5 + r() * 3.5), y = sup(x, v);
      pedras += blobD(x, y - s * .4, s * 1.2, s * .8, r, 7, .2); pedrasL += elip(x - s * .35, y - s * .7, s * .45, s * .25);
    }
    let raizes = '';
    for (let i = 0; i < 9; i++) {
      const v = .1 + r() * .8, x = LCX + (r() * 2 - 1) * LMEIA * .8, y = sup(x, v), s = esc(v);
      raizes += `M${n(x)},${n(y)} c${n(4 * s)},${n(-6 * s)} ${n(10 * s)},${n(-4 * s)} ${n(12 * s)},${n(-10 * s)} M${n(x + 6 * s)},${n(y - 4 * s)} q${n(4 * s)},${n(2 * s)} ${n(7 * s)},${n(1 * s)}`;
    }
    const buraco = (x, v, k) => { const y = sup(x, v), s = esc(v) * k; return elip(x, y, 6 * s, 2.6 * s); };
    let buracos = buraco(BURACO_P.x, BURACO_P.v, 1) + buraco(BURACO_G.x, BURACO_G.v, 1.6) + buraco(560, .78, 1) + buraco(1010, .34, 1.1);
    let dejetos = '';
    for (const [x, v] of [[548, .7], [1020, .4], [700, .82]]) { const y = sup(x, v), s = esc(v); dejetos += `M${n(x - 5 * s)},${n(y)}q${n(2 * s)},${n(-5 * s)} ${n(5 * s)},${n(-4 * s)}q${n(4 * s)},${n(1 * s)} ${n(5 * s)},${n(4 * s)}M${n(x - 2 * s)},${n(y - 4 * s)}q${n(2 * s)},${n(-4 * s)} ${n(4 * s)},${n(-1 * s)}`; }
    return `<path d="${pedacoSup(LX0, LX1, 14)}" fill="url(#terra-sup)" stroke="#24140A" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="${pedacoSup(LX0, 500, 14)}" fill="url(#terra-pontaE)"/>
      <path d="${pedacoSup(1090, LX1, 14)}" fill="url(#terra-pontaD)"/>
      <path d="${regos}" stroke="#1C1008" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="${cristas}" stroke="#8A6040" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".75"/>
      <path d="${cristasF}" stroke="#7A5232" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="${buracos}" fill="#0E0804"/>
      <path d="${sombras}" fill="#140A04" opacity=".45"/>
      <path d="${corpos}" fill="#5E3E24" stroke="#2A180C" stroke-width="1.2"/>
      <path d="${escuros}" fill="#3A2414" opacity=".7"/>
      <path d="${luzes}" fill="#9A6E48" opacity=".85"/>
      <path d="${dejetos}" stroke="#6A4628" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="${migas[0]}" stroke="#24140A" stroke-width="3.4" stroke-linecap="round"/>
      <path d="${migas[1]}" stroke="#7A5232" stroke-width="2.8" stroke-linecap="round"/>
      <path d="${migas[2]}" stroke="#A8805A" stroke-width="2.2" stroke-linecap="round"/>
      <path d="${pedras}" fill="#A89E92" stroke="#5E564C" stroke-width="1"/><path d="${pedrasL}" fill="#E2DCD2" opacity=".85"/>
      <path d="${raizes}" stroke="#D8C49C" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  }

  /* --- corte: camadas da terra com pedras, raízes, túneis e sementes --- */
  function faixa(fTopo, passo) {
    let d = '';
    for (let x = -20; x <= 1620; x += passo) d += (d ? 'L' : 'M') + n(x) + ',' + n(fTopo(x));
    return d + 'L1620,920L-20,920Z';
  }
  function linhaF(f, passo) { let d = ''; for (let x = -20; x <= 1620; x += passo) d += (d ? 'L' : 'M') + n(x) + ',' + n(f(x)); return d; }
  function corteSVG() {
    const r = semente(71);
    // pontinhos de textura em cada camada (dois tons por camada)
    const pts = Array.from({ length: 8 }, () => '');
    for (let i = 0; i < 900; i++) {
      const x = r() * 1640 - 20, y = 640 + r() * 262;
      if (y < topo(x) + 3) continue;
      const cam = y < B1(x) ? 0 : y < B2(x) ? 1 : y < B3(x) ? 2 : 3;
      pts[cam * 2 + (r() < .5 ? 0 : 1)] += `M${n(x)},${n(y)}h.01`;
    }
    const corPts = [['#20120A', '#5E3E24'], ['#4A2C18', '#946840'], ['#7A4E28', '#D09C62'], ['#54483C', '#B4A894']];
    // pedras: miúdas na terra castanha, médias no barro, grandes em baixo
    let pB = '', pC = '', pD = '', pL = '', pS = '';
    const pedra = (x, y, rx, ry, alvo) => {
      const d = blobD(x, y, rx, ry, r, 8, .2);
      if (alvo === 0) pB += d; else if (alvo === 1) pC += d; else pD += d;
      pL += elip(x - rx * .3, y - ry * .4, rx * .45, ry * .28);
      pS += elip(x + rx * .2, y + ry * .75, rx * .9, ry * .3);
    };
    for (let i = 0; i < 26; i++) { const x = r() * 1640 - 20, y = lerp(B1(x) + 8, B2(x) - 6, r()); pedra(x, y, 3 + r() * 4, 2.4 + r() * 3, 0); }
    for (let i = 0; i < 34; i++) { const x = r() * 1640 - 20, y = lerp(B2(x) + 8, B3(x) - 6, r()); pedra(x, y, 5 + r() * 8, 4 + r() * 5, 1); }
    for (let i = 0; i < 22; i++) { const x = i * 76 + r() * 40 - 20, y = B3(x) + 12 + r() * 26; pedra(x, y, 12 + r() * 16, 8 + r() * 9, 2); }
    // raízes: das couves e das alfaces (lados) e raizinhas finas debaixo da beira
    let raizes = '', raizinhas = '';
    const raiz = (x, y, L, abre, k) => {
      for (let i = 0; i < k; i++) {
        const a = PI / 2 + (i - (k - 1) / 2) * abre, l = L * (.6 + r() * .5);
        const ex = x + Math.cos(a) * l, ey = y + Math.sin(a) * l;
        raizes += `M${n(x)},${n(y)} Q${n(x + Math.cos(a) * l * .5 + (r() - .5) * 14)},${n(y + Math.sin(a) * l * .5)} ${n(ex)},${n(ey)}`;
        for (let j = 0; j < 3; j++) { const u = .35 + j * .22, px = lerp(x, ex, u), py = lerp(y, ey, u), s = r() < .5 ? -1 : 1; raizinhas += `M${n(px)},${n(py)} q${n(s * 5)},${n(3)} ${n(s * 10)},${n(8 + r() * 6)}`; }
      }
    };
    for (const [x, L] of [[96, 90], [252, 80], [28, 50], [170, 62], [318, 56]]) raiz(x, CHAO + 4, L, .38, 5);
    for (const x of [1248, 1338, 1428, 1514, 1598]) raiz(x, CHAO + 4, 46, .45, 5);
    for (let x = -10; x < 1620; x += 9 + r() * 14) { if (x > LX0 + 10 && x < LX1 - 10 && r() < .55) continue; const y = topo(x) + 2; raizinhas += `M${n(x)},${n(y)} q${n((r() - .5) * 8)},${n(6 + r() * 6)} ${n((r() - .5) * 6)},${n(10 + r() * 14)}`; }
    // túneis das minhocas (rasto mais escuro)
    let rastos = '';
    for (const m of MINHOCAS) { const P = percurso(m.c, 40); rastos += linhaPor(P.pts); }
    // túnel e câmara da toupeira (forrados de terra mais clara, por dentro escuros)
    const tunel = linhaPor(percurso(TUNEL, 30).pts);
    // carreiro e câmara das formigas, com ovos
    const formigas = linhaPor(percurso(FORMIGAS, 30).pts);
    let ovos = '';
    for (let i = 0; i < 9; i++) ovos += elip(1336 + (i % 4) * 5 - 6 + (i > 3 ? 2 : 0), 766 + (i > 3 ? -4 : 0) + (i > 7 ? -4 : 0), 2.6, 1.8);
    // conchinha antiga enterrada no barro
    const concha = `<g transform="translate(540,830) rotate(-20)"><circle r="9" fill="#E8DCC4" stroke="#8A7A62" stroke-width="1.2"/><path d="M0,0 m-6,0 a6,6 0 1,1 6,6 a4,4 0 1,1 -3,-4 a2,2 0 1,1 2,2" stroke="#9A8A72" stroke-width="1.2" fill="none"/></g>`;
    // sementes a germinar (as dos rebentos da beira)
    let sementes = '', caules = '';
    for (const rb of REBENTOS) if (rb.sem >= 0) {
      const y = topo(rb.x) + 46;
      sementes += `<g transform="translate(${rb.x + 3},${n(y)}) rotate(-18)"><ellipse rx="9" ry="6" fill="url(#terra-semente)" stroke="#8A6A3A" stroke-width="1.4"/><path d="M-7,-1 Q0,3 7,-1" stroke="#A8844E" stroke-width="1.2" fill="none"/><ellipse cx="-3" cy="-2.5" rx="3" ry="1.5" fill="#FFFFFF" opacity=".55"/></g>`;
      caules += `M${rb.x + 1},${n(y - 5)} C${rb.x - 3},${n(y - 20)} ${rb.x + 3},${n(y - 34)} ${rb.x},${n(topo(rb.x) + 1)}`;
    }
    return `<path d="${faixa(topo, 5)}" fill="url(#terra-camA)"/>
      <path d="${faixa(B1, 20)}" fill="url(#terra-camB)"/>
      <path d="${faixa(B2, 20)}" fill="url(#terra-camC)"/>
      <path d="${faixa(B3, 20)}" fill="url(#terra-camD)"/>
      <path d="${linhaF(B1, 20)}${linhaF(B2, 20)}${linhaF(B3, 20)}" stroke="#1E1008" stroke-width="2.4" fill="none" opacity=".28"/>
      ${pts.map((d, i) => `<path d="${d}" stroke="${corPts[i >> 1][i & 1]}" stroke-width="${i & 1 ? 2.6 : 3.2}" stroke-linecap="round" opacity=".7"/>`).join('')}
      <path d="${pS}" fill="#1E1008" opacity=".25"/>
      <path d="${pB}" fill="#8A7A66" stroke="#4A3A2A" stroke-width="1"/>
      <path d="${pC}" fill="#B4A890" stroke="#6A5A44" stroke-width="1.2"/>
      <path d="${pD}" fill="url(#terra-pedra)" stroke="#5E564C" stroke-width="1.6"/>
      <path d="${pL}" fill="#F2ECE2" opacity=".6"/>
      <ellipse cx="930" cy="852" rx="54" ry="26" fill="url(#terra-pedra)" stroke="#5E564C" stroke-width="2"/><path d="M896,842 C910,832 936,830 952,836" stroke="#F4EEE4" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>
      ${concha}
      <path d="${rastos}" stroke="#1E1008" stroke-width="15" fill="none" stroke-linecap="round" opacity=".32"/>
      <path d="${tunel}" stroke="#8A603A" stroke-width="50" fill="none" stroke-linecap="round"/>
      <circle cx="${CAMARA.x}" cy="${CAMARA.y}" r="${CAMARA.r + 4}" fill="#8A603A"/>
      <path d="${tunel}" stroke="#24140A" stroke-width="42" fill="none" stroke-linecap="round"/>
      <circle cx="${CAMARA.x}" cy="${CAMARA.y}" r="${CAMARA.r}" fill="url(#terra-camara)"/>
      <path class="tr-chamine" d="" fill="#24140A" stroke="#8A603A" stroke-width="4" opacity="0"/>
      <path d="${tunel}" stroke="#4A2E1A" stroke-width="12" fill="none" stroke-linecap="round" transform="translate(0,14)" opacity=".7"/>
      <path d="M${CAMARA.x - 24},${CAMARA.y + 18} Q${CAMARA.x},${CAMARA.y + 30} ${CAMARA.x + 24},${CAMARA.y + 18}" stroke="#4A2E1A" stroke-width="8" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="M${CAMARA.x - 14},${CAMARA.y + 22} q8,-6 14,-2 q6,-6 14,0" stroke="#C8B488" stroke-width="2" fill="none" opacity=".6"/>
      <path d="${formigas}" stroke="#8A603A" stroke-width="13" fill="none" stroke-linecap="round"/><path d="${formigas}" stroke="#2A180C" stroke-width="9" fill="none" stroke-linecap="round"/>
      <ellipse cx="1338" cy="764" rx="18" ry="11" fill="#2A180C" stroke="#8A603A" stroke-width="2.4"/><path d="${ovos}" fill="#F6F0DE" stroke="#C8BC9A" stroke-width=".8"/>
      <path d="${raizes}" stroke="#E6D6B4" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <path d="${raizinhas}" stroke="#CDB68C" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".85"/>
      <path d="${caules}" stroke="#E8E2B4" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${sementes}
      <path d="${faixa(topo, 5)}" fill="url(#terra-luzCorte)"/>
      <path d="${linhaF(topo, 5)}L1620,700L-20,700Z" fill="url(#terra-beira)" opacity=".45"/>`;
  }
  // beira do corte: lábio claro e as ervas que pendem por cima (nos lados), em grupos que abanam
  function beiraSVG() {
    const tufos = (x0, x1, sem) => {
      const r = semente(sem);
      let d = '', luz = '';
      for (let x = x0; x < x1; x += 4 + r() * 7) {
        const b = topo(x) + 1, h = 8 + r() * 16, inc = (r() - .5) * 18, cai = r() < .35;
        if (cai) d += `M${n(x - 2)},${n(b)}Q${n(x + inc * .5)},${n(b + h * .3)} ${n(x + inc)},${n(b + h * .7)}Q${n(x + inc * .5 + 2)},${n(b + h * .2)} ${n(x + 2)},${n(b)}Z`;
        else d += `M${n(x - 2.4)},${n(b)}Q${n(x + inc * .4)},${n(b - h * .6)} ${n(x + inc)},${n(b - h)}Q${n(x + inc * .4 + 2.4)},${n(b - h * .5)} ${n(x + 2.4)},${n(b)}Z`;
        if (r() < .4 && !cai) luz += `M${n(x + inc * .5)},${n(b - h * .55)}Q${n(x + inc * .8)},${n(b - h * .8)} ${n(x + inc)},${n(b - h)}`;
      }
      return { d, luz };
    };
    const e = tufos(-20, 404, 11), d = tufos(1196, 1620, 13);
    // tufos pequenos de erva daninha na beira da leira
    const m = tufos(LX0 + 40, LX0 + 70, 17), m2 = tufos(LX1 - 80, LX1 - 56, 19);
    return `<path d="${linhaF(topo, 5)}" stroke="#7A5234" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="${linhaF(topo, 5)}" stroke="#B88A5E" stroke-width="1.6" fill="none" transform="translate(0,-1.6)" opacity=".8"/>
      <g class="tr-ervaE"><path d="${e.d}" fill="#6EA03A"/><path d="${e.luz}" stroke="#B8DC80" stroke-width="1.4" fill="none" opacity=".8"/></g>
      <g class="tr-ervaD"><path d="${d.d}" fill="#6EA03A"/><path d="${d.luz}" stroke="#B8DC80" stroke-width="1.4" fill="none" opacity=".8"/></g>
      <path d="${m.d}${m2.d}" fill="#7AAE42"/>`;
  }

  // minhoca: cinco paths (contorno, corpo, cinta, anéis, brilho) refeitos a cada quadro
  function minhocaSVG(cls) {
    return `<g class="${cls}"><path class="tr-mContorno" stroke="#7E3236" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="tr-mCorpo" stroke="#DA767C" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="tr-mCinta" stroke="#ECA49A" fill="none" stroke-linecap="round"/>
      <path class="tr-mAneis" stroke="#9A444A" stroke-width="1.1" fill="none" opacity=".55"/>
      <path class="tr-mBrilho" stroke="#FAC4BE" fill="none" stroke-linecap="round" opacity=".75" transform="translate(-.8,-1.6)"/></g>`;
  }
  function toupeiraSVG() {
    let pelo = '';
    for (let i = 0; i < 9; i++) { const a = PI + .3 + i * .28; pelo += `M${n(Math.cos(a) * 30)},${n(Math.sin(a) * 16)} l${n(Math.cos(a) * 4)},${n(Math.sin(a) * 3)}`; }
    return `<g class="tr-toupeira"><g class="tr-toupCorpo">
      <path d="M-34,-4 q-10,-2 -15,4" stroke="#E8A0A4" stroke-width="4.4" fill="none" stroke-linecap="round"/>
      <ellipse cx="-20" cy="17" rx="9" ry="4.5" fill="#EFA2A8" stroke="#A85A62" stroke-width="1.2"/>
      <ellipse cx="0" cy="0" rx="38" ry="21" fill="url(#terra-toupeira)" stroke="#16121A" stroke-width="2"/>
      <path d="${pelo}" stroke="#2A2630" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M-26,-13 C-10,-21 10,-21 24,-14" stroke="#9A94A6" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>
      <g class="tr-toupCab" transform="translate(26,1)">
        <ellipse cx="6" cy="0" rx="19" ry="15" fill="url(#terra-toupeira)" stroke="#16121A" stroke-width="2"/>
        <path d="M-2,-12 C6,-16 16,-14 22,-8" stroke="#9A94A6" stroke-width="2.4" fill="none" opacity=".55" stroke-linecap="round"/>
        <g class="tr-toupFocinho"><path d="M18,-5 C26,-7 34,-4 39,-1 C35,4 26,6 18,5 Z" fill="#F2A8AE" stroke="#A85A62" stroke-width="1.4"/>
          <ellipse cx="38.5" cy="-1" rx="3.6" ry="4.2" fill="#E27C88" stroke="#A85A62" stroke-width="1"/><circle cx="39.4" cy="-2" r="1" fill="#7A2A36"/><circle cx="38" cy="1" r=".9" fill="#7A2A36"/>
          <path d="M30,-4 l12,-7 M31,-1 l13,-2 M30,2 l12,5" stroke="#E8E2EA" stroke-width=".9" opacity=".8"/></g>
        <circle cx="12" cy="-6" r="2" fill="#0A0608"/><circle cx="11.4" cy="-6.7" r=".75" fill="#FFFFFF"/>
      </g>
      <g class="tr-toupMao" transform="translate(30,15)"><path d="M-7,-4 C1,-9 12,-7 15,1 C13,8 2,10 -7,6 Z" fill="#F2A8AE" stroke="#A85A62" stroke-width="1.3"/>
        <path d="M14,-3 l6,-1.5 M15,1 l6,0 M14,5 l6,1.5" stroke="#F6EEDE" stroke-width="2.2" stroke-linecap="round"/></g>
    </g></g>`;
  }
  function formigaSVG(i) {
    return `<g class="tr-formiga${i}"><path d="M-3,-1 l-2,-4 M-3,1 l-2,4 M0,-1 l0,-5 M0,1 l0,5 M3,-1 l2,-4 M3,1 l2,4 M8,-1 l4,-4" stroke="#140A06" stroke-width="1" fill="none"/>
      <path d="${elip(-6, 0, 4, 2.8)}${elip(0, 0, 2.4, 1.8)}${elip(5, 0, 2.6, 2.2)}" fill="#1E120C"/><circle cx="-7" cy="-1" r="1.2" fill="#8A6A5A" opacity=".7"/></g>`;
  }
  // rebento: caule (contorno e enchimento), duas folhinhas e a casca da semente
  function rebentoSVG(i) {
    return `<g class="tr-rebento${i}"><path class="tr-rbSombra" fill="#140A04" opacity=".35"/>
      <path class="tr-rbCauleC" stroke="#4E7A2A" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path class="tr-rbCaule" stroke="#AED872" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <path class="tr-rbFolhas" fill="#8CCA4E" stroke="#4E7A2A" stroke-width="1.2" stroke-linejoin="round"/>
      <path class="tr-rbNervura" stroke="#D8F0A8" stroke-width="1" fill="none" opacity=".8"/>
      <path class="tr-rbCasca" fill="#C8A46A" stroke="#7A5A30" stroke-width="1"/></g>`;
  }
  function torraoSVG(i, rr) {
    const r = semente(200 + i);
    let migas = '';
    for (let k = 0; k < 6; k++) migas += `M${n((r() - .5) * rr * 1.4)},${n((r() - .7) * rr)}h.01`;
    return `<g class="tr-torrao${i}"><ellipse class="tr-trSombra" cx="${n(rr * .4)}" cy="${n(rr * .5)}" rx="${n(rr * 1.15)}" ry="${n(rr * .38)}" fill="#140A04" opacity=".45"/>
      <g class="tr-trCorpo"><path d="${blobD(0, 0, rr, rr * .8, r, 9, .22)}" fill="url(#terra-torrao)" stroke="#24140A" stroke-width="1.3"/>
      <path d="${blobD(-rr * .3, -rr * .32, rr * .45, rr * .28, r, 7, .2)}" fill="#A87C54" opacity=".8"/>
      <path d="${migas}" stroke="#2A180C" stroke-width="2.4" stroke-linecap="round"/></g></g>`;
  }
  function escaravelhoSVG() {
    return `<g class="tr-escaravelho" display="none"><g class="tr-escDentro">
      <ellipse cx="3" cy="7" rx="20" ry="7" fill="#140A04" opacity=".35"/>
      <path class="tr-escPernasA" d="M12,-6 L17,-13 L22,-15 M3,7 L4,14 L1,19 M-6,-8 L-11,-14 L-18,-16" stroke="#120E18" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <path class="tr-escPernasB" d="M12,6 L17,13 L22,15 M3,-7 L4,-14 L1,-19 M-6,8 L-11,14 L-18,16" stroke="#120E18" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M22,-2 q5,-4 10,-9 M22,2 q5,4 10,9" stroke="#120E18" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="20" cy="0" rx="4.6" ry="4.2" fill="#1E4A2A"/>
      <ellipse cx="13" cy="0" rx="6.4" ry="8" fill="#2E8A40" stroke="#0E2A14" stroke-width="1.2"/><path d="M11,-5 C13,-6 15,-5 16,-3" stroke="#D8FFA0" stroke-width="1.4" fill="none" opacity=".6" stroke-linecap="round"/>
      <ellipse cx="-4" cy="0" rx="14" ry="10.5" fill="url(#terra-escaravelho)" stroke="#0E0A14" stroke-width="1.4"/>
      <path d="M8,0 L-18,0" stroke="#0E0A14" stroke-width="1.3"/>
      <path d="M2,-6.5 C-4,-8.5 -10,-7.5 -14,-4" stroke="#F0FFC0" stroke-width="2.4" fill="none" opacity=".75" stroke-linecap="round"/>
          </g></g>`;
  }
  function caracolSVG() {
    return `<path class="tr-rasto" d="" stroke="#EAF2F6" stroke-width="3" fill="none" stroke-linecap="round" opacity="0"/>
      <g class="tr-caracol" display="none"><g class="tr-caracolDentro">
      <ellipse cx="0" cy="1" rx="30" ry="4" fill="#140A04" opacity=".3"/>
      <path class="tr-caracolPe" d="" fill="#CDBEA4" stroke="#7A6A54" stroke-width="1.4"/>
      <path class="tr-caracolAnt" d="" stroke="#B8A88E" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path class="tr-caracolOlhos" d="" fill="#3A2E24"/>
      <circle cx="6" cy="-18" r="16" fill="url(#terra-concha)" stroke="#6A4420" stroke-width="1.6"/>
      <path d="M6,-18 m-10,0 a10,10 0 1,1 10,10 a7,7 0 1,1 -6,-7 a4,4 0 1,1 4,4" stroke="#7E4E24" stroke-width="1.6" fill="none"/>
      <path d="M-4,-28 C0,-33 8,-34 13,-31" stroke="#FFF2D0" stroke-width="2.4" fill="none" opacity=".75" stroke-linecap="round"/>
    </g></g>`;
  }
  function melroSVG() {
    return `<g class="tr-melro" display="none"><g class="tr-melroCorpo">
      <path d="M-16,-26 L-52,-38 L-53,-28 L-14,-17 Z" fill="#141418" stroke="#000000" stroke-width="1.2" stroke-linejoin="round"/>
      <path class="tr-melroPernas" d="M-2,-14 L-4,0 M6,-14 L7,0 M-9,0 h9 M2,0 h10" stroke="#5E4026" stroke-width="2.4" stroke-linecap="round"/>
      <g class="tr-melroAsaTras"><path d="M-4,-34 C-14,-60 -30,-74 -46,-70 C-36,-58 -26,-44 -12,-30 Z" fill="#18181E" stroke="#000000" stroke-width="1.2"/></g>
      <ellipse cx="0" cy="-25" rx="26" ry="15" transform="rotate(-12,0,-25)" fill="url(#terra-melro)" stroke="#000000" stroke-width="1.6"/>
      <path d="M-8,-36 C2,-40 12,-38 16,-32" stroke="#6A6A78" stroke-width="2.4" fill="none" opacity=".6" stroke-linecap="round"/>
      <g class="tr-melroAsa"><path d="M-16,-32 C-2,-40 16,-36 18,-25 C8,-20 -6,-18 -24,-22 Z" fill="#1E1E24" stroke="#000000" stroke-width="1"/>
        <path d="M-12,-26 C-2,-28 6,-28 12,-26 M-16,-23 C-6,-24 2,-23 8,-21" stroke="#3E3E48" stroke-width="1.2" fill="none"/></g>
      <g class="tr-melroCab">
        <circle cx="20" cy="-39" r="11.5" fill="url(#terra-melro)" stroke="#000000" stroke-width="1.6"/>
        <circle cx="24" cy="-42" r="3.6" fill="#120A06" stroke="#F2B12E" stroke-width="1.8"/><circle cx="23.2" cy="-43" r="1" fill="#FFFFFF"/>
        <path class="tr-melroBico" d="M29,-43 L44,-40 L29,-36 Z" fill="#F4B02C" stroke="#A8701A" stroke-width="1" stroke-linejoin="round"/>
      </g></g></g>`;
  }
  function terraSVG() {
    const torroes = TORROES.map((t, i) => torraoSVG(i, t.r)).join('');
    return `<g class="tr-terra">
      <rect x="400" y="470" width="800" height="410" fill="#000000" fill-opacity="0"/>
      <g class="tr-sup">${superficieSVG()}</g>
      ${ancinhoSVG()}${paSVG()}
      <g class="tr-corte">${corteSVG()}
        ${MINHOCAS.map((m, i) => minhocaSVG('tr-minhoca' + i)).join('')}
        <path class="tr-raizes" d="" stroke="#F2E8CC" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        ${Array.from({ length: 4 }, (_, i) => formigaSVG(i)).join('')}
        ${toupeiraSVG()}
      </g>
      ${beiraSVG()}
      <g class="tr-vivos">
        <path class="tr-monte" d="" fill="url(#terra-montinho)" stroke="#24140A" stroke-width="1.8"/>
        <path class="tr-monteMigas" d="" stroke="#8A6040" stroke-width="2.6" stroke-linecap="round"/>
        <g class="tr-focinho" opacity="0"><path d="M-8,4 C-8,-6 -4,-14 0,-16 C4,-14 8,-6 8,4 Z" fill="#F2A8AE" stroke="#A85A62" stroke-width="1.3"/>
          <ellipse cx="0" cy="-15" rx="4.4" ry="3.4" fill="#E27C88"/><path d="M-12,2 C-16,-4 -18,-8 -14,-10 M12,2 C16,-4 18,-8 14,-10" stroke="#F2A8AE" stroke-width="5" fill="none" stroke-linecap="round"/>
          <path d="M-16,-10 l-3,-3 M-14,-11 l-1,-4 M16,-10 l3,-3 M14,-11 l1,-4" stroke="#F6EEDE" stroke-width="1.6" stroke-linecap="round"/></g>
        ${minhocaSVG('tr-minhocaP')}<path class="tr-labioP" fill="#4A2E1A"/>
        ${REBENTOS.map((_, i) => rebentoSVG(i)).join('')}
        ${torroes}
        ${escaravelhoSVG()}
        ${caracolSVG()}
        ${minhocaSVG('tr-minhocaG')}<path class="tr-labioG" fill="#4A2E1A"/>
        ${minhocaSVG('tr-minhocaM')}<ellipse class="tr-buracoM" rx="7" ry="3" fill="#0E0804" opacity="0"/>
        ${melroSVG()}
      </g>
    </g>`;
  }

  /* ================= 6) montar() ================= */
  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .45 : 1;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    const N_PO = 12, N_FUMO = 7;
    svg.innerHTML = `<defs>${defs()}</defs>
      ${ceuSVG()}${longeSVG()}${casaSVG()}
      <g class="tr-fumos">${Array.from({ length: N_FUMO }, () => '<circle r="12" fill="url(#terra-fumo)" opacity="0"/>').join('')}</g>
      ${espigueiroSVG()}${muroSVG()}${chaoSVG()}${carrinhoSVG()}
      ${terraSVG()}
      ${hortasSVG()}${regadorSVG()}
      <g class="tr-orvalho">${Array.from({ length: 7 }, () => '<path d="M0,-6 Q0,0 6,0 Q0,0 0,6 Q0,0 -6,0 Q0,0 0,-6 Z" fill="#FFFFFF" opacity="0"/>').join('')}</g>
      ${piscoSVG()}${borboletaSVG()}
      <g class="tr-pos" pointer-events="none">${Array.from({ length: N_PO }, () => '<circle r="1" fill="url(#terra-po)" opacity="0"/>').join('')}</g>
      <g pointer-events="none"><path class="tr-miga0" fill="#3A2414" stroke="#1E1008" stroke-width=".8"/><path class="tr-miga1" fill="#7A5232" stroke="#3A2414" stroke-width=".8"/><path class="tr-miga2" fill="#B48C62" stroke="#5A3A20" stroke-width=".8"/></g>
      <rect width="1600" height="900" fill="url(#terra-luzSol)" pointer-events="none"/>
      <rect width="1600" height="900" fill="url(#terra-vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s), qa = s => Array.from(svg.querySelectorAll(s));
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; el.setAttribute(nome, v); } }
    const minhocaEl = g => ({ g, contorno: g.querySelector('.tr-mContorno'), corpo: g.querySelector('.tr-mCorpo'), cinta: g.querySelector('.tr-mCinta'), aneis: g.querySelector('.tr-mAneis'), brilho: g.querySelector('.tr-mBrilho') });

    const R = {
      terra: q('.tr-terra'), sup: q('.tr-sup'), vivos: q('.tr-vivos'), chamine: q('.tr-chamine'), raizes: q('.tr-raizes'),
      monte: q('.tr-monte'), monteMigas: q('.tr-monteMigas'), focinho: q('.tr-focinho'),
      minhocas: MINHOCAS.map((_, i) => minhocaEl(q('.tr-minhoca' + i))),
      minP: minhocaEl(q('.tr-minhocaP')), minG: minhocaEl(q('.tr-minhocaG')), minM: minhocaEl(q('.tr-minhocaM')),
      labioP: q('.tr-labioP'), labioG: q('.tr-labioG'), buracoM: q('.tr-buracoM'),
      formigas: [0, 1, 2, 3].map(i => q('.tr-formiga' + i)),
      toup: q('.tr-toupeira'), toupCorpo: q('.tr-toupCorpo'), toupCab: q('.tr-toupCab'), toupFocinho: q('.tr-toupFocinho'), toupMao: q('.tr-toupMao'),
      rebentos: REBENTOS.map((_, i) => { const g = q('.tr-rebento' + i); return { g, sombra: g.querySelector('.tr-rbSombra'), cauleC: g.querySelector('.tr-rbCauleC'), caule: g.querySelector('.tr-rbCaule'), folhas: g.querySelector('.tr-rbFolhas'), nervura: g.querySelector('.tr-rbNervura'), casca: g.querySelector('.tr-rbCasca') }; }),
      torroes: TORROES.map((_, i) => { const g = q('.tr-torrao' + i); return { g, sombra: g.querySelector('.tr-trSombra'), corpo: g.querySelector('.tr-trCorpo') }; }),
      esc: q('.tr-escaravelho'), escDentro: q('.tr-escDentro'), pernasA: q('.tr-escPernasA'), pernasB: q('.tr-escPernasB'),
      caracol: q('.tr-caracol'), caracolDentro: q('.tr-caracolDentro'), caracolPe: q('.tr-caracolPe'), caracolAnt: q('.tr-caracolAnt'), caracolOlhos: q('.tr-caracolOlhos'), rasto: q('.tr-rasto'),
      melro: q('.tr-melro'), melroCorpo: q('.tr-melroCorpo'), melroCab: q('.tr-melroCab'), melroAsa: q('.tr-melroAsa'), melroAsaTras: q('.tr-melroAsaTras'), melroPernas: q('.tr-melroPernas'),
      pisco: q('.tr-pisco'), piscoCorpo: q('.tr-piscoCorpo'), piscoCab: q('.tr-piscoCab'), piscoPalp: q('.tr-piscoPalp'), piscoCauda: q('.tr-piscoCauda'), piscoAsa: q('.tr-piscoAsa'),
      borboleta: q('.tr-borboleta'), asaE: q('.tr-asaE'), asaD: q('.tr-asaD'),
      nuvens: [0, 1, 2, 3, 4].map(i => q('.tr-nuvem' + i)), andorinhas: [0, 1].map(i => q('.tr-andorinha' + i)), andAsas: qa('.tr-andAsas'),
      solBrilho: q('.tr-solBrilho'), fumos: Array.from(q('.tr-fumos').children), galegas: [0, 1].map(i => q('.tr-galega' + i)),
      ervaE: q('.tr-ervaE'), ervaD: q('.tr-ervaD'), orvalho: Array.from(q('.tr-orvalho').children),
      pos: Array.from(q('.tr-pos').children), migas: [0, 1, 2].map(i => q('.tr-miga' + i))
    };

    /* --- estado --- */
    let tempo = 0, vivo = true;
    // valores suavizados (S) que seguem os alvos (A) que as tarefas somam em cada quadro
    const S = { salto: 0, minP: 0, minG: 0, toup: 0, sobe: 0, fareja: 0, agita: 0, tremor: 0, cavar: 0 };
    const tarefas = [];       // { tipo: 'ocioso' | 'reacao' | 'raro', nome, t, dur, f(u, A, dt), fim }
    const migalhas = [];      // { x, y, vx, vy, yc, r, c, t, vida }
    const pos = R.pos.map(el => ({ el, vivo: false, x: 0, y: 0, r0: 0, r1: 0, t: 0, dur: 1, op: 0 }));
    const minhocas = MINHOCAS.map((m, i) => { const P = percurso(m.c); return { P, len: m.len, w: m.w, vel: m.vel, s: m.len + aleat(10, P.total - m.len - 10), dir: Math.random() < .5 ? 1 : -1, fase: aleat(0, TAU), pausa: 0, el: R.minhocas[i] }; });
    const formigas = (() => { const P = percurso(FORMIGAS, 50); return R.formigas.map((el, i) => ({ el, P, s: P.total * (i + .5) / 4, dir: i % 2 ? 1 : -1, vel: aleat(16, 26), pausa: 0 })); })();
    const PT = percurso(TUNEL, 50);
    const rebentos = REBENTOS.map((rb, i) => {
      const y = rb.v === 0 ? topo(rb.x) + 1 : sup(rb.x, rb.v);
      return { ...rb, y, gAlvo: rb.g, hAlvo: rb.h, hv: 0, ph: aleat(0, TAU), aberto: rb.g > .5 ? aleat(0, 20000) : 0, vida: aleat(26000, 40000), dg: -1, dh: -1, el: R.rebentos[i], boing: 0 };
    });
    const torroes = TORROES.map((t, i) => ({ ...t, y: sup(t.x, t.v), dx: 0, dy: 0, ry: 0, vy: 0, rot: 0, sc: 1, modo: 'parado', espera: 0, el: R.torroes[i] }));
    const montinho = { H: 0, alvo: 0, cavado: 0, pop: 0 };
    const pisco = { olhar: -20, olharAlvo: -20, alvo: null, proxOlhar: 1500, pisca: 0, proxPisca: 2000, tPisca: -1, salto: 0, tSalto: -1, asa: 0, cauda: 0, proxCauda: 3000, tCauda: -1 };
    const fumos = R.fumos.map((el, i) => ({ el, idade: i / N_FUMO * 4200 }));

    /* --- tarefas: cada uma soma a sua parte aos alvos A em cada quadro (nunca deixa nada partido se for cortada) --- */
    function tarefa(tipo, nome, dur, f, fim) { const k = { tipo, nome, t: 0, dur, f, fim }; tarefas.push(k); return k; }
    function correrTarefas(dt, A) {
      for (let i = 0; i < tarefas.length; i++) {
        const k = tarefas[i];
        k.t += dt;
        const u = Math.min(1, k.t / k.dur);
        k.f(u, A, dt);
        if (u >= 1) { tarefas.splice(i--, 1); if (k.fim) k.fim(); }
      }
    }
    const ha = (tipo, nome) => tarefas.some(k => k.tipo === tipo && (!nome || k.nome === nome));

    /* --- partículas: migalhas (com gravidade, saltam um pouco e param) e nuvens de pó --- */
    function migalha(x, y, vx, vy, r, yc, vida) {
      if (migalhas.length > 260) migalhas.shift();
      migalhas.push({ x, y, vx, vy, yc, r, c: Math.random() * 3 | 0, t: 0, vida: vida || aleat(1400, 2600), parada: false });
    }
    function po(x, y, r0, r1, dur, op) {
      const p = pos.find(o => !o.vivo) || pos.reduce((a, b) => a.t / a.dur > b.t / b.dur ? a : b);
      Object.assign(p, { vivo: true, x, y, r0, r1, dur, op, t: 0 });
    }
    function chuvaMigalhas(x, y, k, forca, abre) {
      for (let i = 0; i < k; i++) migalha(x + aleat(-6, 6), y - 2, aleat(-abre, abre), -aleat(forca * .4, forca), aleat(2, 4.2), y + aleat(-3, 4));
    }
    function atualizarParticulas(dt) {
      const s = dt / 1000, d = ['', '', ''];
      for (let i = migalhas.length - 1; i >= 0; i--) {
        const m = migalhas[i];
        m.t += dt;
        if (m.t >= m.vida) { migalhas.splice(i, 1); continue; }
        if (!m.parada) {
          m.vy += 1500 * s; m.x += m.vx * s; m.y += m.vy * s;
          if (m.y >= m.yc && m.vy > 0) { m.y = m.yc; if (m.vy > 140) { m.vy *= -.32; m.vx *= .55; } else { m.vy = 0; m.vx *= Math.max(0, 1 - 9 * s); if (Math.abs(m.vx) < 4) m.parada = true; } }
        }
        const f = 1 - passoS(.75, 1, m.t / m.vida);
        if (f > .05) d[m.c] += elip(m.x, m.y, m.r * f, m.r * .8 * f);
      }
      for (let c = 0; c < 3; c++) atr(R.migas[c], 'd', d[c] || 'M0,0');
      for (const p of pos) {
        if (!p.vivo) { atr(p.el, 'opacity', 0); continue; }
        p.t += dt;
        const u = p.t / p.dur;
        if (u >= 1) { p.vivo = false; atr(p.el, 'opacity', 0); continue; }
        p.y -= 8 * s;
        poe(p.el, `translate(${n(p.x)},${n(p.y)}) scale(${n(lerp(p.r0, p.r1, esai(u)))},${n(lerp(p.r0, p.r1, esai(u)) * .6)})`);
        atr(p.el, 'opacity', n3(p.op * Math.min(1, u / .1) * Math.pow(1 - u, 1.4)));
      }
    }
    // migalhas que rolam sozinhas pelas pontas da leira (a terra nunca está parada)
    let proxMiga = 400;
    function migasSoltas(dt) {
      proxMiga -= dt;
      if (proxMiga > 0) return;
      proxMiga = aleat(350, 900) / calma;
      const lado = Math.random() < .5 ? -1 : 1, x = LCX + lado * aleat(352, 392), v = aleat(.15, .75), y = sup(x, v);
      migalha(x, y - 2, lado * aleat(25, 70), -aleat(10, 60), aleat(1.3, 2.6), Math.min(CHAO - 3, y + aleat(12, 28)), aleat(2200, 3400));
    }

    /* --- minhocas: estica e encolhe (ondas do corpo) e anda pelo túnel; às vezes pára e volta para trás --- */
    function pontosMinhoca(m, agita) {
      const pts = [], L = m.len * (1 + .1 * Math.sin(m.fase));
      const amp = 1.2 + 3 * agita;
      for (let a = m.s - L; a <= m.s + .01; a += 3.5) {
        const [x, y, ang] = noPercurso(m.P, a);
        const o = amp * Math.sin(a * .11 - m.fase * 1.3);
        pts.push([x - Math.sin(ang) * o, y + Math.cos(ang) * o]);
      }
      return pts;
    }
    function desenharMinhoca(o, pts, w, frente) {
      if (pts.length < 2) { atr(o.g, 'display', 'none'); return; }
      atr(o.g, 'display', 'inline');
      const d = linhaPor(pts);
      atr(o.contorno, 'd', d); atr(o.corpo, 'd', d); atr(o.brilho, 'd', d);
      atr(o.contorno, 'stroke-width', n(w + 2.6)); atr(o.corpo, 'stroke-width', n(w)); atr(o.brilho, 'stroke-width', n(w * .3));
      const m = pts.length;
      // cinta (clitelo) a um terço da cabeça
      const c0 = frente ? Math.floor(m * .62) : Math.floor(m * .22), c1 = frente ? Math.floor(m * .76) : Math.floor(m * .36);
      atr(o.cinta, 'd', m > 6 ? linhaPor(pts.slice(c0, c1 + 1)) : 'M0,0'); atr(o.cinta, 'stroke-width', n(w + 1.2));
      let an = '';
      for (let i = 1; i < m - 1; i += 2) {
        const p = pts[i], a = pts[i - 1], b = pts[i + 1];
        let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
        const k = w * .42;
        an += `M${n(p[0] - ty * k)},${n(p[1] + tx * k)}L${n(p[0] + ty * k)},${n(p[1] - tx * k)}`;
      }
      atr(o.aneis, 'd', an || 'M0,0');
    }
    function atualizarMinhocas(dt) {
      const s = dt / 1000, ag = S.agita;
      for (const m of minhocas) {
        const vel = m.vel * (1 + 2.2 * ag) * calma;
        m.fase += s * (3.2 + 6 * ag) * calma;
        if (m.pausa > 0) m.pausa -= dt;
        else {
          m.s += m.dir * vel * s * (.55 + .45 * Math.sin(m.fase));
          if (m.s > m.P.total - 2) { m.s = m.P.total - 2; m.dir = -1; m.pausa = aleat(400, 1600); }
          if (m.s < m.len + 2) { m.s = m.len + 2; m.dir = 1; m.pausa = aleat(400, 1600); }
          if (Math.random() < s * .08) { m.dir *= -1; m.pausa = aleat(300, 900); }
        }
        desenharMinhoca(m.el, pontosMinhoca(m, ag), m.w * (1 - .06 * Math.sin(m.fase)), true);
      }
    }
    // minhoca que sai de um buraco da superfície: linha que sobe e se dobra (k = 0–1 fora)
    function pontosSaida(x, y, Lmax, k, t, inc, w) {
      const L = Lmax * k;
      if (L < 2) return [];
      const N = Math.max(3, Math.ceil(L / 4)), ds = L / N, pts = [[x, y + w * .3]];
      let ang = -PI / 2 + inc * .25, px = x, py = y + w * .3;
      for (let i = 1; i <= N; i++) {
        const q = i / N;
        ang += (inc * 1.6 + .5 * Math.sin(t * 3.2 - q * 3)) * ds / Math.max(30, L);
        px += Math.cos(ang) * ds; py += Math.sin(ang) * ds;
        pts.push([px, py]);
      }
      return pts;
    }
    function labio(el, x, y, rx) { atr(el, 'd', `M${n(x - rx)},${n(y)}Q${n(x)},${n(y + rx * .55)} ${n(x + rx)},${n(y)}Q${n(x)},${n(y + rx * .2)} ${n(x - rx)},${n(y)}Z`); }

    /* --- toupeira: respira e fareja; espreita na câmara; sobe pela chaminé para fazer o montinho --- */
    const toupBase = (() => { const [x, y, a] = noPercurso(PT, PT.total - 66); return { x, y, a: a / RAD }; })();
    function desenharToupeira(t) {
      const P0 = toupBase, P1 = { x: 690, y: 742, a: -10 }, P2 = { x: 706, y: 706, a: -78 };
      let x = lerp(P0.x, P1.x, S.toup), y = lerp(P0.y, P1.y, S.toup), a = lerp(P0.a, P1.a, S.toup);
      x = lerp(x, P2.x, S.sobe); y = lerp(y, P2.y, S.sobe); a = lerp(a, P2.a, S.sobe);
      const resp = 1 + .025 * Math.sin(t * 2.6);
      poe(R.toup, `translate(${n(x)},${n(y)}) rotate(${n(a)})`);
      poe(R.toupCorpo, `scale(${n3(1 + .01 * Math.sin(t * 2.6))},${n3(resp)})`);
      const far = .4 + S.fareja;
      poe(R.toupCab, `translate(26,1) rotate(${n(-14 * S.toup * (1 - S.sobe) + 2 * Math.sin(t * 1.3))})`);
      poe(R.toupFocinho, `rotate(${n(far * 7 * Math.sin(t * (8 + 10 * S.fareja)))},18,0)`);
      poe(R.toupMao, `translate(30,15) rotate(${n(S.cavar * 26 * Math.sin(t * 16) + 6 * Math.sin(t * 1.7))})`);
    }

    /* --- rebentos: caule em gancho (g = 0) ou direito com as duas folhinhas abertas (g = 1) --- */
    function desenharRebento(rb) {
      const g = rb.g, h = Math.max(.05, rb.h), Hs = 32 * h;
      const P3 = [lerp(9, 0, g) * h, lerp(-Hs * .55, -Hs, g)], P2 = [lerp(4, 0, g) * h, lerp(-Hs * .98, -Hs * .8, g)], P1 = [0, -Hs * .45];
      const caule = `M0,0C${n(P1[0])},${n(P1[1])} ${n(P2[0])},${n(P2[1])} ${n(P3[0])},${n(P3[1])}`;
      atr(rb.el.caule, 'd', caule); atr(rb.el.cauleC, 'd', caule);
      const Lf = lerp(7, 15, g) * Math.min(1, .6 + h * .5), Wf = Lf * .5;
      let fol = '', ner = '';
      for (const [a0, a1] of [[100, 200], [76, -20]]) {
        const a = lerp(a0, a1, eseno(g)) * RAD, dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
        const p = P3, e = [p[0] + dx * Lf, p[1] + dy * Lf];
        fol += `M${n(p[0])},${n(p[1])}C${n(p[0] + dx * Lf * .3 + nx * Wf)},${n(p[1] + dy * Lf * .3 + ny * Wf)} ${n(p[0] + dx * Lf * .95 + nx * Wf * .7)},${n(p[1] + dy * Lf * .95 + ny * Wf * .7)} ${n(e[0])},${n(e[1])}C${n(p[0] + dx * Lf * .95 - nx * Wf * .7)},${n(p[1] + dy * Lf * .95 - ny * Wf * .7)} ${n(p[0] + dx * Lf * .3 - nx * Wf)},${n(p[1] + dy * Lf * .3 - ny * Wf)} ${n(p[0])},${n(p[1])}Z`;
        ner += `M${n(p[0] + dx * 2)},${n(p[1] + dy * 2)}L${n(p[0] + dx * Lf * .8)},${n(p[1] + dy * Lf * .8)}`;
      }
      atr(rb.el.folhas, 'd', fol); atr(rb.el.nervura, 'd', ner);
      const cas = 1 - limita(g * 2.5, 0, 1);
      atr(rb.el.casca, 'd', cas > .02 ? elip(P3[0] + 2 * h, P3[1] + 3, 5.5 * cas, 4 * cas) : 'M0,0');
      atr(rb.el.sombra, 'd', elip(4, 1, 6 + 8 * g * h, 2));
    }
    function atualizarRebentos(dt, t) {
      const s = dt / 1000;
      let abertos = rebentos.filter(r => r.gAlvo > .5).length;
      let raizes = '';
      for (const rb of rebentos) {
        // um rebento aberto há muito tempo volta devagarinho a gancho, quando há muitos abertos
        if (rb.gAlvo > .5) { rb.aberto += dt; if (rb.aberto > rb.vida && abertos > 3 && rb.boing <= 0) { rb.gAlvo = 0; rb.hAlvo = .55; rb.vg = .1; abertos--; } }
        const vg = rb.vg || .5;
        rb.g += limita(rb.gAlvo - rb.g, -vg * s, vg * s);
        rb.hv += ((rb.hAlvo - rb.h) * 140 - rb.hv * 9) * s;
        rb.h += rb.hv * s;
        rb.boing = Math.max(0, rb.boing - dt / 1400);
        if (Math.abs(rb.g - rb.dg) > .004 || Math.abs(rb.h - rb.dh) > .004) { rb.dg = rb.g; rb.dh = rb.h; desenharRebento(rb); }
        const trem = (1.6 * Math.sin(t * 2.3 + rb.ph) + .9 * Math.sin(t * 5.9 + rb.ph * 2)) * calma + (S.tremor + rb.boing) * 10 * Math.sin(t * 17 + rb.ph);
        poe(rb.el.g, `translate(${n(rb.x)},${n(rb.y)}) rotate(${n(trem)}) scale(${n3(rb.k * (1 + .55 * esai(rb.boing)))})`);
        if (rb.sem >= 0) {   // raiz da semente no corte: cresce com o rebento
          const sx = rb.x + 3, sy = topo(rb.x) + 50, L = 16 + 36 * rb.g * Math.min(1, rb.h);
          raizes += `M${n(sx)},${n(sy)} C${n(sx + 4)},${n(sy + L * .3)} ${n(sx - 5)},${n(sy + L * .7)} ${n(sx + 1)},${n(sy + L)}`;
          for (let j = 1; j <= 3; j++) { const yy = sy + L * j / 4, sg = j % 2 ? 1 : -1; raizes += `M${n(sx + sg)},${n(yy)} q${n(sg * 4)},2 ${n(sg * (5 + 4 * rb.g))},${n(6 + 3 * rb.g)}`; }
        }
      }
      atr(R.raizes, 'd', raizes);
    }

    /* --- torrões que mexem: parados, no ar (salto), a rolar, desfeitos e a voltar --- */
    function atualizarTorroes(dt, t) {
      const s = dt / 1000;
      for (const tr of torroes) {
        if (tr.modo === 'ar') {
          tr.vy += 1500 * s; tr.dy += tr.vy * s; tr.rot += tr.vr * s;
          if (tr.dy >= 0 && tr.vy > 0) {
            tr.dy = 0;
            if (tr.vy > 200) { tr.vy *= -.28; chuvaMigalhas(tr.x + tr.dx, tr.y, 4, 160, 70); }
            else { tr.vy = 0; tr.modo = 'parado'; }
          }
        } else if (tr.modo === 'desfeito') {
          tr.espera -= dt;
          if (tr.espera <= 0) { tr.modo = 'volta'; tr.sc = 0; tr.dx = 0; tr.dy = 0; tr.ry = 0; tr.rot = 0; }
        } else if (tr.modo === 'volta') {
          tr.sc = Math.min(1, tr.sc + dt / 2500);
          if (tr.sc >= 1) tr.modo = 'parado';
        }
        const vis = tr.modo !== 'desfeito';
        atr(tr.el.g, 'display', vis ? 'inline' : 'none');
        if (!vis) continue;
        const sq = tr.modo === 'parado' ? 1 + .02 * Math.sin(t * 1.4 + tr.x) : 1;
        poe(tr.el.g, `translate(${n(tr.x + tr.dx)},${n(tr.y + tr.ry - tr.r * .5 * esc(tr.v))}) scale(${n3(esc(tr.v) * tr.sc)})`);
        poe(tr.el.corpo, `translate(0,${n(tr.dy / esc(tr.v))}) rotate(${n(tr.rot)}) scale(1,${n3(sq)})`);
        atr(tr.el.sombra, 'opacity', n3(.45 / (1 + Math.abs(tr.dy) * .04)));
      }
    }

    /* --- bichos à superfície: escaravelho, caracol, melro --- */
    const bicho = { esc: null, caracol: null, melro: null };
    function poeEscaravelho(x, v, ang, fasePerna) {
      const y = sup(x, v), k = esc(v) * 1.75;
      poe(R.esc, `translate(${n(x)},${n(y - 3 * k)}) scale(${n3(k)},${n3(k * .62)}) rotate(${n(ang)})`);
      const a = 2.6 * Math.sin(fasePerna);
      poe(R.pernasA, `translate(${n(a)},0)`); poe(R.pernasB, `translate(${n(-a)},0)`);
      poe(R.escDentro, `translate(0,${n(.6 * Math.abs(Math.sin(fasePerna)))})`);
    }
    function poeCaracol(x, v, t, estica, op) {
      const y = sup(x, v), k = esc(v) * 1.75;
      poe(R.caracol, `translate(${n(x)},${n(y)}) scale(${n3(k)})`);
      atr(R.caracol, 'opacity', n3(op));
      const e = 1 + .12 * estica;
      const pe = `M${n(-30 * e)},0 C${n(-33 * e)},-6 ${n(-28 * e)},-14 ${n(-20 * e)},-14 L-6,-12 C10,-12 22,-8 24,0 Z`;
      atr(R.caracolPe, 'd', pe);
      const hx = -24 * e, a1 = -2.1 + .2 * Math.sin(t * 2.1), a2 = -1.7 + .2 * Math.sin(t * 1.7 + 1), L1 = 16 + 2 * Math.sin(t * 3), L2 = 13 + 2 * Math.sin(t * 2.6 + 2);
      const t1 = [hx + Math.cos(a1) * L1, -11 + Math.sin(a1) * L1], t2 = [hx + 6 + Math.cos(a2) * L2, -11 + Math.sin(a2) * L2];
      atr(R.caracolAnt, 'd', `M${n(hx)},-11 Q${n(hx - 4)},-20 ${n(t1[0])},${n(t1[1])} M${n(hx + 6)},-11 Q${n(hx + 4)},-18 ${n(t2[0])},${n(t2[1])} M${n(hx - 3)},-6 l-4,-1`);
      atr(R.caracolOlhos, 'd', elip(t1[0], t1[1], 2.6, 2.6) + elip(t2[0], t2[1], 2.2, 2.2));
    }
    // ponta do bico do melro no ecrã (para a minhoca lhe ficar presa)
    const melro = { x: -100, y: 200, rot: 0, cab: 0, sx: 1, voo: false, asa: 0, k: 1.3 };
    function bicoMelro() {
      const m = melro, c = Math.cos(m.cab * RAD), s = Math.sin(m.cab * RAD);
      let px = 43 - 14, py = -40 + 34;                    // ponta do bico em volta do pescoço (14,-34)
      let bx = 14 + px * c - py * s, by = -34 + px * s + py * c;
      const cr = Math.cos(m.rot * RAD), sr = Math.sin(m.rot * RAD);
      const qx = bx * cr - by * sr, qy = bx * sr + by * cr;
      return [m.x + qx * m.k * m.sx, m.y + qy * m.k];
    }
    function poeMelro() {
      const m = melro;
      poe(R.melro, `translate(${n(m.x)},${n(m.y)}) scale(${n3(m.k * m.sx)},${n3(m.k)})`);
      poe(R.melroCorpo, `rotate(${n(m.rot)})`);
      poe(R.melroCab, `rotate(${n(m.cab)},14,-34)`);
      atr(R.melroAsaTras, 'display', m.voo ? 'inline' : 'none');
      atr(R.melroPernas, 'display', m.voo ? 'none' : 'inline');
      poe(R.melroAsa, m.voo ? `rotate(${n(-40 * m.asa)},-4,-32)` : 'rotate(0)');
      poe(R.melroAsaTras, `rotate(${n(30 * m.asa)},-4,-34)`);
    }

    /* --- variações ociosas (4–9 s) --- */
    const VARIACOES = {
      minhoca() {                                    // uma minhoca sai à superfície, olha à volta e volta a entrar
        tarefa('ocioso', 'minhoca', 4600, (u, A) => {
          A.minP += u < .2 ? eseno(u / .2) : u < .78 ? 1 - .15 * sino((u - .2) / .58) : 1 - eseno((u - .78) / .22);
        });
      },
      torrao() {                                     // um torrão rola por uma ponta da leira e desfaz-se em migalhas
        const livres = torroes.filter(t => t.rolo && t.modo === 'parado');
        if (!livres.length) return VARIACOES.rebento();
        const tr = escolhe(livres), P = tr.rolo.map(([x, dy], i) => [x, i === 0 ? tr.y : i === tr.rolo.length - 1 ? Math.min(CHAO - 6, topo(x) - 3) : sup(x, tr.v) + dy]);
        tr.modo = 'rola';
        let px = tr.x;
        tarefa('ocioso', 'torrao', 2300, u => {
          if (tr.modo !== 'rola') return;
          const w = eio(Math.min(1, u / .8)), [x, y] = catmull(P, w);
          tr.dx = x - tr.x; tr.ry = y - tr.y; tr.dy = -2 * Math.abs(Math.sin(w * PI * 3)) * (1 - w);
          tr.rot += (x - px) / tr.r / RAD * .8; px = x;
          if (u >= .8 && tr.modo === 'rola') {
            tr.modo = 'desfeito'; tr.espera = aleat(8000, 12000);
            chuvaMigalhas(x, y + 2, 26, 260, 130);
            for (let i = 0; i < 10; i++) migalha(x + aleat(-8, 8), y - aleat(0, 8), aleat(-60, 60), -aleat(20, 120), aleat(1.6, 3.4), Math.min(CHAO - 2, y + aleat(2, 10)), aleat(2600, 4200));
            po(x, y - 4, 8, 30, 900, .6);
          }
        }, () => { if (tr.modo === 'rola') { tr.modo = 'parado'; tr.dx = 0; tr.dy = 0; tr.ry = 0; } });
      },
      rebento() {                                    // um rebento cresce um pouco e abre as duas folhinhas
        const fechados = rebentos.filter(r => r.gAlvo < .5);
        const rb = fechados.length ? escolhe(fechados) : escolhe(rebentos);
        rb.gAlvo = 1; rb.hAlvo = Math.min(1.1, Math.max(rb.hAlvo + .25, .95)); rb.vg = .45; rb.aberto = 0;
        tarefa('ocioso', 'rebento', 3000, (u, A) => { A.tremor += .05 * sino(u); });
        chuvaMigalhas(rb.x, rb.y, 4, 120, 40);
      },
      escaravelho() {                                // um escaravelho atravessa a leira
        const d = escolhe([-1, 1]), x0 = LCX - d * 360, x1 = LCX + d * 330, v0 = aleat(.45, .62);
        atr(R.esc, 'display', 'inline'); bicho.esc = { x: x0, v: v0 };
        let fp = 0;
        tarefa('ocioso', 'escaravelho', 8200, (u, A, dt) => {
          const w = u < .45 ? u / .45 * .45 : u < .55 ? .45 : u;      // pára a meio para «cheirar»
          const x = lerp(x0, x1, w), v = v0 + .1 * Math.sin(w * PI * 2);
          const ang = (d > 0 ? 0 : 180) + 14 * Math.cos(w * PI * 2) * d;
          if (!(u > .45 && u < .55)) fp += dt / 1000 * 22;
          bicho.esc.x = x; bicho.esc.v = v;
          poeEscaravelho(x, v, ang, fp);
        }, () => { atr(R.esc, 'display', 'none'); bicho.esc = null; });
      },
      toupeira() {                                   // a toupeira vai à câmara e espreita, a farejar
        if (ha('raro', 'montinho')) return VARIACOES.minhoca();
        tarefa('ocioso', 'toupeira', 4200, (u, A) => {
          const e = u < .25 ? eseno(u / .25) : u < .75 ? 1 : 1 - eseno((u - .75) / .25);
          A.toup += e; A.fareja += .8 * e * (.6 + .4 * Math.sin(u * 30)); A.cavar += .4 * sino(fase(u, .3, .6));
        });
      }
    };
    const NOMES_V = Object.keys(VARIACOES);
    const ocioso = { prox: aleat(2500, 4000), ultimo: null, ligado: true };
    function agendarOcioso(dt) {
      if (!ocioso.ligado) return;
      ocioso.prox -= dt;
      if (ocioso.prox > 0 || ha('ocioso')) return;
      ocioso.prox = aleat(4000, 9000);
      let nome; do nome = escolhe(NOMES_V); while (nome === ocioso.ultimo);
      ocioso.ultimo = nome;
      VARIACOES[nome]();
    }

    /* --- reações ao toque (alternadas) --- */
    const REACOES = {
      salto() {                                      // a terra «salta»: torrões e migalhas pulam e voltam a cair com pó
        for (let i = 0; i < 80; i++) {
          const x = LCX + aleat(-.92, .92) * LMEIA; if (eL(x) < .5) continue;
          const v = aleat(0, 1), y = sup(x, v);
          migalha(x, y - 1, aleat(-80, 80), -aleat(300, 620) * (1 - .3 * v), aleat(2.2, 4.8) * esc(v), y, aleat(1500, 2400));
        }
        for (const tr of torroes) if (tr.modo === 'parado' || tr.modo === 'ar') { tr.modo = 'ar'; tr.vy = -aleat(380, 520); tr.vr = aleat(-200, 200); }
        for (let i = 0; i < 7; i++) { const x = LCX + aleat(-320, 320); po(x, sup(x, aleat(.1, .8)), 14, aleat(50, 80), aleat(1000, 1500), .8); }
        tarefa('reacao', 'salto', 1400, (u, A) => {
          A.salto += u < .12 ? esai(u / .12) : u < .3 ? 1 - 1.3 * eseno((u - .12) / .18) : -.3 * (1 - eseno((u - .3) / .7));
          A.agita += envelope(u, .1); A.tremor += .8 * envelope(u, .1); A.fareja += .8 * envelope(u, .1);
        });
        piscoSalta();
      },
      minhoca() {                                    // uma minhoca grande sai do buraco e estica-se para cima, a abanar
        const x = BURACO_G.x, y = sup(x, BURACO_G.v);
        chuvaMigalhas(x, y, 20, 380, 110);
        po(x, y - 4, 10, 50, 900, .75);
        tarefa('reacao', 'minhoca', 1900, (u, A) => {
          A.minG += u < .08 ? esai(u / .08) : u < .8 ? 1 + .06 * Math.sin(u * 40) : 1 - eseno((u - .8) / .2);
          A.agita += .5 * envelope(u, .1); A.tremor += .3 * envelope(u, .1);
        });
        piscoSalta();
      },
      rebento() {                                    // um rebento brota de repente (com migalhas a saltar) e abre as folhas
        const frente = rebentos.filter(r => r.sem >= 0);
        const fechados = frente.filter(r => r.gAlvo < .5);
        const rb = fechados.length ? escolhe(fechados) : escolhe(frente);
        rb.gAlvo = 1; rb.vg = 3.2; rb.aberto = 0; rb.boing = 1;
        rb.hAlvo = 1.15; rb.hv = 16;
        for (const o of rebentos) if (o !== rb) o.boing = Math.max(o.boing, .35);
        chuvaMigalhas(rb.x, rb.y, 26, 460, 140);
        po(rb.x, rb.y - 4, 10, 56, 1000, .8);
        tarefa('reacao', 'rebento', 1500, (u, A) => { A.tremor += .7 * envelope(u, .1); A.agita += .4 * envelope(u, .1); }, () => { rb.hAlvo = 1; });
        piscoSalta();
      }
    };
    const NOMES_R = Object.keys(REACOES);
    let ultimaReacao = null;
    function reagir(nome) {
      for (let i = tarefas.length - 1; i >= 0; i--) if (tarefas[i].tipo === 'reacao') { const k = tarefas.splice(i, 1)[0]; if (k.fim) k.fim(); }
      if (!nome) { do nome = escolhe(NOMES_R); while (nome === ultimaReacao); }
      ultimaReacao = nome;
      REACOES[nome]();
    }

    /* --- pisco: olha para o que se mexe, pisca, abana a cauda; salta com o toque --- */
    function piscoSalta() { pisco.tSalto = 0; }
    function piscoOlhaPara(x, y) { pisco.alvo = [x, y]; }
    function atualizarPisco(dt, t) {
      const p = pisco, px = PA.x + 6, py = PA.topo - 3;
      // para onde olhar: o acontecimento, um bicho que passa, ou ao acaso pela leira
      let alvo = p.alvo;
      if (!alvo) {
        if (bicho.esc) alvo = [bicho.esc.x, sup(bicho.esc.x, bicho.esc.v)];
        else if (S.minP > .3) alvo = [BURACO_P.x, sup(BURACO_P.x, BURACO_P.v) - 30];
        else if (S.toup > .3) alvo = [CAMARA.x, CAMARA.y];
      }
      p.proxOlhar -= dt;
      if (alvo) {
        const ang = Math.atan2(alvo[1] - (py - 31), alvo[0] - (px - 8)) / RAD;
        let rel = ang - 180; while (rel < -180) rel += 360; while (rel > 180) rel -= 360;
        p.olharAlvo = limita(rel, -48, 28);
      } else if (p.proxOlhar <= 0) { p.proxOlhar = aleat(1400, 4200); p.olharAlvo = escolhe([-34, -26, -14, 0, 10, -40]); }
      p.olhar += (p.olharAlvo - p.olhar) * (1 - Math.exp(-dt / 110));
      p.proxPisca -= dt;
      if (p.proxPisca <= 0) { p.proxPisca = aleat(2000, 5500); p.tPisca = 0; if (Math.random() < .25) p.proxPisca = 260; }
      if (p.tPisca >= 0) { p.tPisca += dt; p.pisca = sino(p.tPisca / 160); if (p.tPisca >= 160) { p.tPisca = -1; p.pisca = 0; } }
      p.proxCauda -= dt;
      if (p.proxCauda <= 0) { p.proxCauda = aleat(1800, 4500); p.tCauda = 0; }
      if (p.tCauda >= 0) { p.tCauda += dt; p.cauda = sino(p.tCauda / 260) * 1; if (p.tCauda >= 260) { p.tCauda = -1; p.cauda = 0; } }
      let sy = 0, asa = 0;
      if (p.tSalto >= 0) {
        p.tSalto += dt;
        const u = p.tSalto / 620;
        sy = -16 * sino(u) * calma; asa = Math.sin(u * PI * 7) * sino(u);
        if (u >= 1) p.tSalto = -1;
      }
      poe(R.pisco, `translate(${px},${n(py + sy)}) scale(1.3)`);
      poe(R.piscoCorpo, `translate(0,0) scale(${n3(1 + .02 * Math.sin(t * 3.4))},${n3(1 + .03 * Math.sin(t * 3.4))})`);
      poe(R.piscoCab, `rotate(${n(p.olhar)},-6,-24)`);
      poe(R.piscoCauda, `rotate(${n(-22 * p.cauda)},12,-12)`);
      poe(R.piscoAsa, `rotate(${n(-40 * asa)},-1,-24)`);
      poe(R.piscoPalp, `translate(0,-36) scale(1,${n3(Math.max(.001, p.pisca))}) translate(0,36)`);
    }

    /* --- acontecimentos raros (15–40 s) --- */
    const EVENTOS = {
      melro() {                                      // um melro pousa, puxa uma minhoca (que escapa), cai sentado e vai-se embora
        const xP = 760, ida = [[-90, 220], [180, 250], [440, 330], [640, 450], [xP - 10, sup(xP, .5) - 36], [xP, sup(xP, .5)]];
        let buraco = null, px = -90;
        atr(R.melro, 'display', 'inline');
        bicho.melro = melro;
        tarefa('raro', 'melro', 9000, (u, A, dt) => {
          const T = u * 9000, m = melro, t = tempo / 1000;
          m.sx = 1;
          if (T < 1500) {                              // chega a voar
            const w = eio(T / 1500), [x, y] = catmull(ida, w);
            m.rot = limita((y - m.y) * 1.4, -20, 25) * .5 + (x - px) * 0; px = x;
            m.x = x; m.y = y; m.voo = true; m.asa = Math.sin(t * 22) * (1 - .6 * w); m.cab = 0;
          } else if (T < 1800) {                       // aterra e dobra as asas
            m.voo = false; m.x = xP; m.y = sup(xP, .5) + 3 * sino(fase(T, 1500, 1800)); m.rot = -6 * sino(fase(T, 1500, 1800));
          } else if (T < 2700) {                       // dois saltinhos para a frente
            const w = fase(T, 1800, 2700), salto = Math.abs(Math.sin(w * PI * 2));
            m.x = xP + 46 * eseno(w); m.y = sup(m.x, .5) - 16 * salto; m.rot = -4 * salto; m.cab = 6 * Math.sin(w * PI * 4);
          } else if (T < 3100) {                       // debica
            const w = eseno(fase(T, 2700, 3100));
            m.x = xP + 46; m.y = sup(m.x, .5); m.rot = 18 * w; m.cab = 30 * w;
            if (!buraco && w > .95) { const b = bicoMelro(); buraco = [b[0], sup(b[0], .48)]; chuvaMigalhas(buraco[0], buraco[1], 6, 160, 50); }
          } else if (T < 4500) {                       // puxa a minhoca para trás; a minhoca estica
            const w = fase(T, 3100, 4500), e = eseno(w);
            m.x = xP + 46 - 26 * e + 2 * Math.sin(w * 40) * e; m.y = sup(m.x, .5); m.rot = lerp(18, -14, e); m.cab = lerp(30, -6, e);
          } else if (T < 5200) {                       // a minhoca escapa: o melro cai sentado para trás
            const w = fase(T, 4500, 5200);
            m.x = xP + 20 - 12 * esai(w); m.y = sup(m.x, .5) + 4 * sino(w); m.rot = -26 * sino(w * .8) - 6 * (1 - w); m.cab = -10 * sino(w);
            if (T - dt < 4500) { chuvaMigalhas(buraco[0], buraco[1], 10, 260, 80); po(m.x - 10, m.y, 8, 34, 800, .5); piscoSalta(); }
          } else if (T < 6400) {                       // abana a cabeça, espantado
            const w = fase(T, 5200, 6400);
            m.x = xP + 8; m.y = sup(m.x, .5); m.rot = -4 * (1 - w); m.cab = 16 * Math.sin(w * PI * 6) * (1 - w) - 8 * w;
          } else {                                     // vai-se embora a voar para a esquerda
            const w = fase(T, 6400, 9000), e = eseno(Math.min(1, w * 1.1));
            const sai = [[xP + 8, sup(xP + 8, .5)], [xP - 60, sup(xP, .5) - 80], [420, 260], [120, 120], [-140, 60]];
            const [x, y] = catmull(sai, e);
            m.sx = -1; m.x = x; m.y = y; m.voo = w > .02; m.asa = Math.sin(t * 22); m.rot = -12 * sino(w * 2); m.cab = 0;
          }
          poeMelro();
          piscoOlhaPara(m.x, m.y - 30);
          // minhoca presa ao bico (sai do buraco, estica, escapa)
          let pts = [];
          if (buraco && T >= 3000 && T < 4650) {
            const b = bicoMelro(), k = T < 4500 ? 1 : 1 - (T - 4500) / 150;
            const mx = lerp(buraco[0], b[0], .5), my = Math.max(buraco[1], b[1]) + 8 - 10 * Math.sin(T * .02);
            for (let i = 0; i <= 12; i++) {
              const q = i / 12 * k, a = [lerp(buraco[0], mx, q), lerp(buraco[1], my, q)], c = [lerp(mx, b[0], q), lerp(my, b[1], q)];
              pts.push([lerp(a[0], c[0], q), lerp(a[1], c[1], q)]);
            }
          }
          desenharMinhoca(R.minM, pts, 6.5, false);
          if (buraco) { poe(R.buracoM, `translate(${n(buraco[0])},${n(buraco[1])})`); atr(R.buracoM, 'opacity', n3(T < 7000 ? Math.min(1, (T - 2900) / 200) : 1 - (T - 7000) / 2000)); }
        }, () => { atr(R.melro, 'display', 'none'); bicho.melro = null; pisco.alvo = null; desenharMinhoca(R.minM, [], 6, false); atr(R.buracoM, 'opacity', 0); });
      },
      caracol() {                                    // um caracol atravessa a leira devagarinho e deixa um rasto a brilhar
        const x0 = 1100, x1 = 520, v = .3;
        atr(R.caracol, 'display', 'inline');
        tarefa('raro', 'caracol', 21000, (u, A) => {
          const t = tempo / 1000, w = fase(u, .03, .9), x = lerp(x0, x1, w) - 3 * Math.sin(t * 1.6);
          const op = Math.min(1, u / .04) * (1 - fase(u, .9, .97));
          poeCaracol(x, v, t, Math.sin(t * 1.6), op);
          let d = '';
          for (let xx = x0 - 20; xx >= x + 22; xx -= 12) d += (d ? 'L' : 'M') + n(xx) + ',' + n(sup(xx, v) - 1);
          atr(R.rasto, 'd', d || 'M0,0');
          atr(R.rasto, 'opacity', n3(.55 * (1 - fase(u, .9, 1)) * (.8 + .2 * Math.sin(t * 3))));
          piscoOlhaPara(x, sup(x, v) - 10);
        }, () => { atr(R.caracol, 'display', 'none'); atr(R.rasto, 'opacity', 0); pisco.alvo = null; });
      },
      montinho() {                                   // a toupeira sobe pela chaminé e faz um montinho de terra na beira
        tarefa('raro', 'montinho', 8000, (u, A) => {
          const T = u * 8000;
          A.toup += T < 1400 ? eseno(T / 1400) : T < 6600 ? 1 : 1 - eseno(fase(T, 6600, 7600));
          A.sobe += T < 1400 ? 0 : T < 2800 ? eseno(fase(T, 1400, 2800)) : T < 5600 ? 1 : 1 - eseno(fase(T, 5600, 6800));
          A.cavar += T > 1200 && T < 3600 ? 1 : 0; A.fareja += T > 3400 && T < 5000 ? 1 : .3;
          montinho.cavado = Math.max(montinho.cavado, T < 1400 ? 0 : eseno(fase(T, 1400, 3000)));
          if (T > 2200 && T < 3600) { montinho.alvo = Math.max(montinho.alvo, 36 * eseno(fase(T, 2200, 3400))); if (Math.random() < .3) { const y = topo(MONTE.x) - montinho.H; migalha(MONTE.x + aleat(-10, 10), y, aleat(-90, 90), -aleat(80, 220), aleat(1.5, 3), topo(MONTE.x) - aleat(0, 6) + aleat(-2, 4), aleat(2000, 3000)); } }
          montinho.pop = T < 3400 ? 0 : T < 3700 ? esai(fase(T, 3400, 3700)) : T < 5000 ? 1 : 1 - eseno(fase(T, 5000, 5400));
          piscoOlhaPara(MONTE.x, topo(MONTE.x) - 30);
        }, () => { montinho.pop = 0; pisco.alvo = null; montinho.tapar = true; });
      }
    };
    const NOMES_E = Object.keys(EVENTOS);
    const raro = { prox: aleat(15000, 22000), ultimo: null, ligado: true };
    function agendarRaro(dt) {
      if (!raro.ligado || ha('raro')) return;
      raro.prox -= dt;
      if (raro.prox > 0) return;
      raro.prox = aleat(15000, 40000);
      let nome; do nome = escolhe(NOMES_E); while (nome === raro.ultimo);
      raro.ultimo = nome;
      EVENTOS[nome]();
    }
    function atualizarMontinho(dt) {
      const m = montinho, s = dt / 1000;
      if (!ha('raro', 'montinho')) m.alvo = Math.max(0, m.alvo - s * 1.6);          // assenta devagar (~20 s)
      m.H += (m.alvo - m.H) * Math.min(1, s * 6);
      if (m.tapar && !ha('raro', 'montinho')) { m.cavado = Math.max(0, m.cavado - s * .25); if (m.cavado <= 0) m.tapar = false; }
      const x0 = MONTE.x, b = topo(x0);
      if (m.H > .5) {
        const H = m.H, W = 26 + H * 1.2;
        let d = `M${n(x0 - W)},${n(b + 2)}`;
        for (let i = 1; i <= 12; i++) { const q = i / 12 * 2 - 1, y = b + 2 - H * Math.pow(Math.max(0, 1 - q * q), .8) + (i % 2 ? 1.6 : -1) * Math.min(1, H / 10); d += `L${n(x0 + q * W)},${n(y)}`; }
        atr(R.monte, 'd', d + 'Z');
        const r = semente(91);
        let mg = '';
        for (let i = 0; i < 14; i++) { const q = r() * 1.6 - .8, y = b - H * Math.pow(1 - q * q, .8) * r(); mg += `M${n(x0 + q * W)},${n(y)}h.01`; }
        atr(R.monteMigas, 'd', mg);
      } else { atr(R.monte, 'd', 'M0,0'); atr(R.monteMigas, 'd', 'M0,0'); }
      // chaminé no corte (cavada pela toupeira; tapa-se aos poucos)
      if (m.cavado > .01) {
        const yb = CAMARA.y - 14, yt = lerp(yb, b + 4, m.cavado);
        atr(R.chamine, 'd', `M${x0 - 14},${yb} L${x0 - 14},${n(yt + 10)} Q${x0},${n(yt - 4)} ${x0 + 14},${n(yt + 10)} L${x0 + 14},${yb} Z`);
        atr(R.chamine, 'opacity', n3(Math.min(1, m.cavado * 3)));
      } else atr(R.chamine, 'opacity', 0);
      const pop = m.pop;
      atr(R.focinho, 'opacity', pop > .01 ? 1 : 0);
      if (pop > .01) poe(R.focinho, `translate(${x0},${n(b - m.H + 6 - 10 * pop)}) rotate(${n(8 * Math.sin(tempo / 90) * pop)}) scale(${n3(.4 + .6 * pop)})`);
    }

    /* --- cenário vivo --- */
    function animarCena(dt, t) {
      R.nuvens.forEach((g, i) => {
        const y = [96, 170, 70, 226, 130][i], x0 = [300, 724, 1148, 1572, 1996][i], v = [8, 7.4, 8.6, 7.8, 8.2][i] * calma;
        poe(g, `translate(${n(-260 + ((x0 + 260 + t * v) % 2120))},${n(y + 4 * Math.sin(t * .1 + i))})`);
      });
      R.andorinhas.forEach((g, i) => {
        const a = t * (.22 + i * .05) * calma + i * 2.6, c = [[520, 200], [1150, 240]][i], rx = [220, 180][i];
        const x = c[0] + Math.cos(a) * rx, y = c[1] + Math.sin(a * 1.7) * 40 + 20 * Math.sin(a * .7);
        poe(g, `translate(${n(x)},${n(y)}) rotate(${n(-Math.sin(a) * 18)}) scale(${n3(.8 - .1 * i)})`);
        poe(R.andAsas[i], `scale(1,${n3(.7 + .35 * Math.sin(t * (9 + i)))})`);
      });
      atr(R.solBrilho, 'opacity', n3(.9 + .1 * Math.sin(t * .8)));
      // fumo da chaminé da casa
      for (const f of fumos) {
        f.idade += dt;
        if (f.idade > 4200) f.idade -= 4200;
        const u = f.idade / 4200;
        poe(f.el, `translate(${n(339 + 70 * u * u + 8 * Math.sin(u * 7 + t))},${n(344 - 120 * u)}) scale(${n3(.5 + 1.8 * u)})`);
        atr(f.el, 'opacity', n3(.85 * sino(Math.min(1, u * 1.4)) * (1 - u)));
      }
      // couves galegas e ervas da beira a abanar com a aragem
      R.galegas.forEach((g, i) => { const x = [96, 252][i], y = [670, 666][i]; poe(g, `rotate(${n3((1.2 * Math.sin(t * .9 + i * 2) + .5 * Math.sin(t * 2.3 + i)) * calma)},${x},${y})`); });
      const sk = n3((2 * Math.sin(t * 1.1) + .8 * Math.sin(t * 2.7)) * calma + S.tremor * 6 * Math.sin(t * 15));
      poe(R.ervaE, `translate(0,${CHAO}) skewX(${sk}) translate(0,${-CHAO})`);
      poe(R.ervaD, `translate(0,${CHAO}) skewX(${n3(sk * .8 + Math.sin(t * 1.4))}) translate(0,${-CHAO})`);
      // orvalho a brilhar nas couves e nas alfaces
      const ORV = [[86, 590], [266, 600], [170, 642], [1250, 650], [1340, 646], [1430, 652], [1520, 652]];
      R.orvalho.forEach((el, i) => {
        const o = Math.pow(Math.max(0, Math.sin(t * (.9 + i * .13) + i * 1.9)), 6);
        poe(el, `translate(${ORV[i][0]},${ORV[i][1]}) scale(${n3(.4 + .8 * o)})`);
        atr(el, 'opacity', n3(o * .9));
      });
      // borboleta branca a voltear sobre as couves
      const bx = 220 + 150 * Math.sin(t * .31 * calma) + 40 * Math.sin(t * .83), by = 548 + 40 * Math.sin(t * .47 * calma + 1) + 12 * Math.sin(t * 2.1);
      poe(R.borboleta, `translate(${n(bx)},${n(by)}) rotate(${n(10 * Math.sin(t * .6))}) scale(.95)`);
      const ab = Math.abs(Math.cos(t * 13));
      poe(R.asaE, `scale(${n3(.2 + .8 * ab)},1)`); poe(R.asaD, `scale(${n3(.2 + .8 * ab)},1)`);
      // formigas no carreiro
      for (const f of formigas) {
        if (f.pausa > 0) f.pausa -= dt;
        else {
          f.s += f.dir * f.vel * dt / 1000 * calma;
          if (f.s > f.P.total - 4 || f.s < 4) { f.dir *= -1; f.s = limita(f.s, 4, f.P.total - 4); f.pausa = aleat(300, 1200); }
          if (Math.random() < dt / 1000 * .2) f.pausa = aleat(200, 700);
        }
        const [x, y, a] = noPercurso(f.P, f.s);
        poe(f.el, `translate(${n(x)},${n(y)}) rotate(${n(a / RAD + (f.dir < 0 ? 180 : 0))}) scale(.9)`);
      }
    }

    /* --- relógio único --- */
    let erroMostrado = false;
    function passo(dt) {
      if (!vivo) return;
      try {
        dt = Math.min(dt, 50);
        tempo += dt;
        const t = tempo / 1000;
        const A = { salto: 0, minP: 0, minG: 0, toup: 0, sobe: 0, fareja: 0, agita: 0, tremor: 0, cavar: 0 };
        correrTarefas(dt, A);
        agendarOcioso(dt);
        agendarRaro(dt);
        const k = 1 - Math.exp(-dt / 40), kl = 1 - Math.exp(-dt / 160);
        S.salto += (A.salto - S.salto) * (1 - Math.exp(-dt / 28));
        S.minP += (limita(A.minP, 0, 1) - S.minP) * k;
        S.minG += (limita(A.minG, 0, 1.1) - S.minG) * (1 - Math.exp(-dt / 30));
        S.toup += (limita(A.toup, 0, 1) - S.toup) * kl;
        S.sobe += (limita(A.sobe, 0, 1) - S.sobe) * kl;
        S.fareja += (limita(A.fareja, 0, 1.4) - S.fareja) * k;
        S.agita += (limita(A.agita, 0, 1.4) - S.agita) * k;
        S.tremor += (limita(A.tremor, 0, 1.2) - S.tremor) * k;
        S.cavar += (limita(A.cavar, 0, 1) - S.cavar) * k;
        // a leira «respira» muito pouco e estica para cima no salto
        const sal = S.salto * calma;
        const tr = `translate(${LCX},660) scale(${n3(1 - .015 * sal)},${n3(1 + .12 * sal + .004 * Math.sin(t * 1.2))}) translate(${-LCX},-660)`;
        poe(R.sup, tr); poe(R.vivos, tr);
        poe(R.terra, `translate(0,${n(-8 * Math.max(0, sal))})`);
        migasSoltas(dt);
        atualizarMinhocas(dt);
        // minhoca pequena (variação) e minhoca grande (reação) à superfície
        { const x = BURACO_P.x, y = sup(x, BURACO_P.v), w = 7 * esc(BURACO_P.v);
          desenharMinhoca(R.minP, pontosSaida(x, y, 40, S.minP, t * 1.3, .7 * Math.sin(t * 1.7), w), w, false); labio(R.labioP, x, y + .5, 7.5 * esc(BURACO_P.v)); }
        { const x = BURACO_G.x, y = sup(x, BURACO_G.v), w = 13;
          desenharMinhoca(R.minG, pontosSaida(x, y, 120, S.minG, t * 2.2, 1.2 * Math.sin(t * 6.5), w), w, false); labio(R.labioG, x, y + .5, 12); }
        desenharToupeira(t);
        atualizarRebentos(dt, t);
        atualizarTorroes(dt, t);
        atualizarMontinho(dt);
        animarCena(dt, t);
        atualizarPisco(dt, t);
        atualizarParticulas(dt);
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    passo(16.7);

    return {
      animal: R.terra,
      habitat: null,
      reagir() { if (vivo) reagir(); },
      fazerSom() {},                                 // os elementos não têm som (só a gravação do nome)
      irAoHabitat: () => Promise.resolve(),
      voltar: () => Promise.resolve(),
      destruir() {
        vivo = false;
        tarefas.length = 0; migalhas.length = 0;
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola (modo de desenvolvimento)
      _teste: {
        S, montinho, rebentos, torroes,
        variacao: nome => VARIACOES[nome](),
        reacao: nome => reagir(nome),
        evento: nome => EVENTOS[nome](),
        semEventos() { raro.ligado = false; },
        semVariacoes() { ocioso.ligado = false; },
        estado: () => ({ migalhas: migalhas.length, tarefas: tarefas.map(k => k.nome), elementos: svg.querySelectorAll('*').length })
      }
    };
  }

  return { icone: iconeSVG(), montar };
})();
