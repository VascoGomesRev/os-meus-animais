/* Abelha — «Os Meus Animais». Contrato e regras: REGRAS-ANIMAIS.md.
   Cena: uma encosta alentejana/algarvia na primavera (luz de cima à esquerda): céu azul com nuvens e uma cegonha ao longe,
   serra azulada, planície com searas, um monte branco de barra azul e sobreiros pequeninos; mais perto um sobreiro grande
   (tronco descortiçado cor de tijolo, com o número pintado), estevas em flor, rosmaninho, papoilas e malmequeres;
   um muro de pedra solta à direita.
   O animal: uma abelha de boneco, muito redonda (cabeça grande com olhos enormes, antenas com bolinha na ponta, tórax
   peludo, abdómen amarelo com riscas castanhas que seguem a curvatura, ferrão pequenino, 6 patinhas e 4 asas
   transparentes que batem tão depressa que se veem desfocadas). Paira sempre no ar a flutuar (a flutuação faz de
   respiração) e o «andar» é voar em arco.
   Habitat: um cortiço (colmeia tradicional portuguesa: um cilindro de cortiça com tampa e uma pedra por cima) pousado no
   muro, com uma porta grande; lá dentro veem-se os favos de mel e há mel a pingar da soleira. A abelha voa até à porta,
   vira-se de costas, entra (a frente do cortiço tapa-a e o interior escurece), dá a volta lá dentro e fica com a cara à
   porta e as mãozinhas na soleira. Camadas: interior e favos → abelha → frente do cortiço (com o buraco da porta).
   A abelha é um boneco «2,5D» de elipsoides (cabeça, tórax, gola, abdómen) projetados no ecrã a cada quadro; as asas,
   o ferrão e o tufo são peças planas com uma matriz afim; as patas são IK de 2 segmentos.
   Organização:
     1) utilidades (matemática, vetores, projeção, IK, peças planas)
     2) geometria da abelha (pose → elipses, caminhos e matrizes no ecrã)
     3) desenho da abelha (SVG das peças) e ícone do menu
     4) cenário (céu, longe, prado, sobreiros, estevas, rosmaninho, muro, cortiço, malmequer, papoilas, bichos)
     5) montar(): voo, comportamentos, zumbido, ida ao cortiço, relógio único */
'use strict';
MODULOS.abelha = (() => {
  const NS = 'http://www.w3.org/2000/svg';

  /* ================= 1) Utilidades ================= */
  const PI = Math.PI, RAD = PI / 180;
  const lerp = (a, b, t) => a + (b - a) * t;
  const limita = (v, a, b) => v < a ? a : v > b ? b : v;
  const n = v => Math.round(v * 10) / 10;
  const n3 = v => Math.round(v * 1000) / 1000;
  const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const esai = t => 1 - Math.pow(1 - t, 3);
  const eentra = t => t * t * t;
  const eseno = t => -(Math.cos(PI * t) - 1) / 2;
  const sino = t => Math.sin(PI * limita(t, 0, 1));
  const aleat = (a, b) => a + Math.random() * (b - a);
  const escolhe = v => v[Math.random() * v.length | 0];
  function semente(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  // vetores 3D: [x (direita), y (para cima), z (para quem vê)]
  const vs = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const vd = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const vk = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const vp = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const vx = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const vl = a => Math.hypot(a[0], a[1], a[2]);
  const vn = a => { const l = vl(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const vlerp = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

  // câmara ortogonal ligeiramente de cima (12°). O mundo da abelha tem a origem no centro do tórax, que aparece no ecrã
  // em c = (x, y); um ponto (X, Y, Z) aparece em (x + X·ESC, y − (Y·cos − Z·sen)·ESC).
  const ELEV = 12 * RAD, cE = Math.cos(ELEV), sE = Math.sin(ELEV);
  const VISTA = [0, sE, cE];
  const prof = w => w[1] * sE + w[2] * cE;                  // profundidade (maior = mais perto)
  const ESC = 1.45;                                         // tamanho do boneco
  const p2 = (c, w) => [c.x + w[0] * ESC, c.y - (w[1] * cE - w[2] * sE) * ESC];
  const pd = v => [v[0] * ESC, -(v[1] * cE - v[2] * sE) * ESC];
  // elipsoide (centro + 3 semi-eixos em 3D) → elipse no ecrã (raiz quadrada simétrica da matriz projetada)
  function elipse(c, centro, eixos) {
    let a = 0, b = 0, d = 0;
    for (const v of eixos) { const q = pd(v); a += q[0] * q[0]; b += q[0] * q[1]; d += q[1] * q[1]; }
    const m = (a + d) / 2, r = Math.sqrt(Math.max(0, (a - d) * (a - d) / 4 + b * b));
    const s = p2(c, centro);
    return { x: s[0], y: s[1], rx: Math.sqrt(m + r), ry: Math.sqrt(Math.max(.01, m - r)), ang: .5 * Math.atan2(2 * b, a - d) / RAD, z: prof(centro) };
  }
  // referenciais: origem + eixos f (frente), u (cima), s (lado direito da abelha)
  const ref = (o, f, u, s) => ({ o, f, u, s });
  const ponto = (R, a, b, c) => [R.o[0] + R.f[0] * a + R.u[0] * b + R.s[0] * c, R.o[1] + R.f[1] * a + R.u[1] * b + R.s[1] * c, R.o[2] + R.f[2] * a + R.u[2] * b + R.s[2] * c];
  const direcao = (R, a, b, c) => [R.f[0] * a + R.u[0] * b + R.s[0] * c, R.f[1] * a + R.u[1] * b + R.s[1] * c, R.f[2] * a + R.u[2] * b + R.s[2] * c];
  // roda os eixos de R (yaw: para o lado direito; pitch: nariz para cima; roll: o «cima» deita-se para o lado direito)
  function roda(R, o, pitch, yaw, roll) {
    let f = R.f, u = R.u, s = R.s;
    if (yaw) { const y = yaw * RAD, cy = Math.cos(y), sy = Math.sin(y); const f2 = vs(vk(f, cy), vk(s, sy)); s = vd(vk(s, cy), vk(f, sy)); f = f2; }
    if (pitch) { const p = pitch * RAD, cp = Math.cos(p), sp = Math.sin(p); const f2 = vs(vk(f, cp), vk(u, sp)); u = vd(vk(u, cp), vk(f, sp)); f = f2; }
    if (roll) { const r = roll * RAD, cr = Math.cos(r), sr = Math.sin(r); const u2 = vs(vk(u, cr), vk(s, sr)); s = vd(vk(s, cr), vk(u, sr)); u = u2; }
    return ref(o, f, u, s);
  }
  const filho = (R, a, b, c, pitch, yaw, roll) => roda(R, ponto(R, a, b, c), pitch, yaw, roll);
  const elipR = (c, R, centro, ax) => elipse(c, ponto(R, centro[0], centro[1], centro[2]), [vk(R.f, ax[0]), vk(R.u, ax[1]), vk(R.s, ax[2])]);
  // mancha à superfície de um elipsoide (longitude fi a partir da frente, latitude te): elipse, tangentes e se está virada para nós
  function sup(c, R, centro, ax, fi, te, r1, r2) {
    const cf = Math.cos(fi), sf = Math.sin(fi), ct = Math.cos(te), st = Math.sin(te);
    const P = ponto(R, centro[0] + ax[0] * ct * cf, centro[1] + ax[1] * st, centro[2] + ax[2] * ct * sf);
    const t1 = vn(direcao(R, -ax[0] * ct * sf, 0, ax[2] * ct * cf));
    const t2 = vn(direcao(R, -ax[0] * st * cf, ax[1] * ct, -ax[2] * st * sf));
    const N = vn(direcao(R, ct * cf / ax[0], st / ax[1], ct * sf / ax[2]));
    const e = elipse(c, P, [vk(t1, r1), vk(t2, r2 == null ? r1 : r2), vk(N, .01)]);
    e.vis = vp(N, VISTA); e.P = P; e.t1 = t1; e.t2 = t2; e.N = N;
    return e;
  }
  // matriz de uma mancha à superfície (x local para a direita do ecrã, y local para baixo)
  function matrizSup(c, s, kx, ky) {
    let a = pd(s.t1), b = pd(vk(s.t2, -1));
    if (a[0] < 0) a = [-a[0], -a[1]];
    if (b[1] < 0) b = [-b[0], -b[1]];
    const ps = p2(c, s.P);
    return { x: ps[0], y: ps[1], m: `matrix(${n3(a[0] * kx)},${n3(a[1] * kx)},${n3(b[0] * ky)},${n3(b[1] * ky)},${n(ps[0])},${n(ps[1])})` };
  }
  // IK de 2 segmentos em 3D: raiz R, alvo T, comprimentos l1 e l2; a articulação vai para o lado do «polo»
  function ik2(R, T, l1, l2, polo) {
    const d = vd(T, R), L = vl(d) || .001;
    const Lc = limita(L, Math.abs(l1 - l2) + 1, l1 + l2 - .5);
    const dn = vk(d, 1 / L);
    const a = (l1 * l1 - l2 * l2 + Lc * Lc) / (2 * Lc), hh = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    let p = vd(polo, vk(dn, vp(polo, dn)));
    const pl = vl(p);
    p = pl < 1e-4 ? vn(vx(dn, [0, 0, 1])) : vk(p, 1 / pl);
    return { J: vs(R, vs(vk(dn, a), vk(p, hh))), E: vs(R, vk(dn, Lc)) };
  }
  // peça plana (asa, ferrão, tufo): desenhada em coordenadas locais (x, y) e posta no espaço com os eixos ex e ey.
  // A projeção ortogonal de um plano é uma matriz afim; largura mínima para nunca ficar um risco.
  function plano(c, origem, ex, ey, minL) {
    const o = p2(c, origem);
    let a = pd(ex), b = pd(ey);
    const m = minL == null ? .34 : minL;
    let la = Math.hypot(a[0], a[1]);
    if (la < m) { const k = la < 1e-4 ? null : m / la; a = k ? [a[0] * k, a[1] * k] : [-b[1] * m, b[0] * m]; la = m; }
    const px = -a[1] / la, py = a[0] / la, comp = b[0] * px + b[1] * py;
    if (Math.abs(comp) < m) { const k = (comp < 0 ? -m : m) - comp; b = [b[0] + px * k, b[1] + py * k]; }
    return `matrix(${n3(a[0])},${n3(a[1])},${n3(b[0])},${n3(b[1])},${n(o[0])},${n(o[1])})`;
  }
  // brilho do lado da luz (de cima à esquerda), sempre por dentro da elipse
  const LUZ = [-.55, -.835];
  function luzOff(e, f) {
    const a = e.ang * RAD, ca = Math.cos(a), sa = Math.sin(a);
    const lx = LUZ[0] * ca + LUZ[1] * sa, ly = -LUZ[0] * sa + LUZ[1] * ca;
    const ox = lx * f * e.rx, oy = ly * f * e.ry;
    return [ox * ca - oy * sa, ox * sa + oy * ca];
  }
  const circ = (x, y, r) => `M${n(x - r)},${n(y)}a${n(r)},${n(r)} 0 1,0 ${n(2 * r)},0a${n(r)},${n(r)} 0 1,0 ${n(-2 * r)},0`;
  const elip = (x, y, rx, ry) => `M${n(x - rx)},${n(y)}a${n(rx)},${n(ry)} 0 1,0 ${n(2 * rx)},0a${n(rx)},${n(ry)} 0 1,0 ${n(-2 * rx)},0`;
  function liso(pts) {
    if (pts.length < 3) return pts.map((p, i) => (i ? 'L' : 'M') + n(p[0]) + ',' + n(p[1])).join('');
    let d = `M${n(pts[0][0])},${n(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; d += `Q${n(pts[i][0])},${n(pts[i][1])} ${n(m[0])},${n(m[1])}`; }
    const u = pts[pts.length - 1];
    return d + `L${n(u[0])},${n(u[1])}`;
  }
  // círculo «fofo» de raio 1 (pelo): pequenas bossas à volta; escala-se como os círculos das elipses
  function fofo(nb, amp) {
    let d = '';
    for (let i = 0; i < nb; i++) {
      const a0 = i / nb * 2 * PI, a1 = (i + 1) / nb * 2 * PI, am = (a0 + a1) / 2, r0 = 1 - amp, rc = 1 + amp * 1.5;
      if (!i) d += `M${n3(Math.cos(a0) * r0)},${n3(Math.sin(a0) * r0)}`;
      d += `Q${n3(Math.cos(am) * rc)},${n3(Math.sin(am) * rc)} ${n3(Math.cos(a1) * r0)},${n3(Math.sin(a1) * r0)}`;
    }
    return d + 'Z';
  }

  /* ================= 2) Geometria da abelha ================= */
  const COR = { cont: '#4A2A12', risca: '#3E2410' };
  const RO = 21;                                            // raio do olho (mundo)
  const LADOS = [['E', -1], ['D', 1]];                      // E = lado esquerdo da abelha (s < 0), D = direito
  const AX_H = [62, 64, 68];                                // cabeça (frente, cima, lado)
  const PERNAS = [{ fx: 22, l1: 40, l2: 46 }, { fx: 2, l1: 34, l2: 42 }, { fx: -18, l1: 38, l2: 48 }];
  // pose base, no ar: cP/cR = corpo (inclinação, balanço), hx/hy = cabeça em relação ao tórax, hY/hP/hR = rodar a cabeça,
  // aP/aY = abdómen (inclinação, abanar), wA = asas abertas (0 dobradas no dorso), wB = ângulo da batida, zum = desfoque
  // das asas a bater, enc = patas encolhidas, antE/antD/antB/antS = antenas (elevação, dobra, abertura), pf = patas na flor,
  // lavE/lavD/lavU = pata a lavar a antena (e onde vai), acena = acenar, est = espreguiçar, ag = agachar na flor, maos = mãos na soleira
  const BASE = { acB: 0, cP: 4, cR: 0, hx: 0, hy: 0, hY: 0, hP: 0, hR: 0, aP: -14, aY: 0, wA: 1, wB: 40, zum: 1, enc: 0, antE: 0, antD: 0, antB: 0, antS: 0, pf: 0, lavE: 0, lavD: 0, lavU: 0, acena: 0, est: 0, ag: 0, maos: 0, esf: 0 };
  const DENTRO_P = Object.assign({}, BASE, { cP: 0, aP: -6, wA: 0, zum: 0, wB: 40, enc: .2, antE: 4, antD: 4, antS: 12, antB: 66, maos: 1, acB: 1 });   // à porta do cortiço
  const ROSTO = { abE: 1, abD: 1, feliz: 0, boca: 0, olhosEsc: 1, lingua: 0 };
  const CHAVES = Object.keys(BASE);
  const RISCAS_U = [.38, -.06, -.5];                        // riscas ao longo do abdómen (−1 ponta … 1 frente)
  // pelos do tórax (pequenos traços à superfície)
  const PELOS = (() => { const v = [], r = semente(17); for (const te of [-.5, -.15, .2, .55]) for (let i = -4; i <= 4; i++) v.push([i * .36 + (r() - .5) * .14, te + (r() - .5) * .1]); return v; })();

  // riscas: faixas à superfície do abdómen entre dois anéis (só os troços virados para nós), recortadas pela elipse.
  // Um anel todo visível (abdómen visto de topo) dá uma coroa: o anel de dentro vai ao contrário.
  const RISCA_L = .13;
  function riscas(c, A, cA, ax) {
    let d = '';
    const NP = 28;
    const anel = u => { const k = Math.sqrt(Math.max(0, 1 - u * u)), v = []; for (let i = 0; i < NP; i++) { const t = i / NP * 2 * PI; v.push(p2(c, ponto(A, cA[0] + ax[0] * u, ax[1] * k * Math.cos(t), ax[2] * k * Math.sin(t)))); } return v; };
    const P_ = v => v.map((p, i) => (i ? 'L' : 'M') + n(p[0]) + ',' + n(p[1])).join('');
    for (const u0 of RISCAS_U) {
      const k = Math.sqrt(1 - u0 * u0), vis = [];
      for (let i = 0; i < NP; i++) { const t = i / NP * 2 * PI; vis.push(vp(vn(direcao(A, u0 / ax[0], k * Math.cos(t) / ax[1], k * Math.sin(t) / ax[2])), VISTA)); }
      const a = anel(u0 - RISCA_L), b = anel(u0 + RISCA_L);
      if (vis.every(v => v > -.12)) { d += P_(a) + 'Z' + P_(b.slice().reverse()) + 'Z'; continue; }
      let i0 = 0; for (let i = 1; i < NP; i++) if (vis[i] < vis[i0]) i0 = i;   // começa no ponto mais escondido
      let seg = [];
      const fecha = () => { if (seg.length > 1) d += P_(seg.map(i => a[i]).concat(seg.slice().reverse().map(i => b[i]))) + 'Z'; seg = []; };
      for (let j = 0; j <= NP; j++) { const i = (i0 + j) % NP; if (vis[i] > -.12) seg.push(i); else fecha(); }
      fecha();
    }
    return d || 'M0,0';
  }

  function geometria(P) {
    const c = { x: P.x + (P._vx || 0), y: P.y + (P._fl || 0) + (P._vy || 0) - (P.salto || 0) };
    const h = P.h * RAD, F = [Math.sin(h), 0, Math.cos(h)], S = [-Math.cos(h), 0, Math.sin(h)];
    const R0 = ref([0, 0, 0], F, [0, 1, 0], S);
    const resp = P._resp || 0, sh = P.somH || 0, som = P._som || 0;
    const B = roda(R0, [0, 0, 0], P.cP + (P._pv || 0) + (P._pb || 0), 0, P.cR + (P._rv || 0));
    const G = { c, el: {}, z: {}, B, olho: {}, asa: {}, ant: {}, perna: {} };
    // tórax peludo e a gola (mais clara) entre o tórax e a cabeça
    G.el.torax = elipR(c, B, [0, 0, 0], [44, 44 + resp * .8, 46 + resp * .8]);
    G.z.torax = 0;
    G.el.gola = elipR(c, B, [34, 8, 0], [20, 38, 42]);
    G.z.gola = prof(ponto(B, 34, 8, 0));
    // abdómen (com riscas e ponta castanha) e o ferrão
    const A = filho(B, -30, -4, 0, P.aP + (P._ap || 0), P.aY + (P._ay || 0), 0);
    const cA = [-58, 0, 0], axA = [74 + resp * 1.2, 58 + resp * 2, 60 + resp * 2];
    G.el.abd = elipR(c, A, cA, axA);
    G.z.abd = prof(ponto(A, cA[0], 0, 0));
    G.riscas = riscas(c, A, cA, axA);
    G.el.ponta = elipR(c, A, [cA[0] - axA[0] * .92, 0, 0], [10, 20, 21]);
    G.opPonta = n3(limita((vp(vk(A.f, -1), VISTA) + .3) / .3, 0, 1));   // a ponta só se vê quando está virada para nós ou de lado
    G.ferrao = plano(c, ponto(A, cA[0] - axA[0] + 4, -3, 0), vk(A.f, -1), vk(A.u, -1), .45);
    G.z.ferrao = prof(ponto(A, cA[0] - axA[0] - 8, -3, 0));
    G.pelos = '';
    for (const [fi, te] of PELOS) {
      const s = sup(c, B, [0, 0, 0], [44, 44, 46], fi, te, 1, 1);
      if (s.vis < .2) continue;
      const a = p2(c, s.P), b = p2(c, vs(s.P, vs(vk(s.t2, -7), vk(s.t1, 2))));
      G.pelos += `M${n(a[0])},${n(a[1])}L${n(b[0])},${n(b[1])}`;
    }
    // cabeça (presa ao tórax, com orientação própria)
    const Hc = ponto(B, 64 + P.hx, 22 + P.hy + 3 * sh, 0);
    const Hd = roda(B, Hc, P.hP + 8 * sh, P.hY, P.hR);
    G.el.cabeca = elipR(c, Hd, [0, 0, 0], AX_H);
    G.z.cabeca = prof(Hc) + 3;
    G.H = Hd; G.cab = p2(c, Hc);
    G.tufo = plano(c, ponto(Hd, -6, AX_H[1] - 6, 0), vn(direcao(Hd, -.35, 1, 0)), Hd.f, .55);
    // olhos enormes, bochechas e boca (presos à esfera da cabeça)
    for (const [L, sg] of LADOS) {
      // matriz sem cisalhamento (rotação da cabeça + encurtamento): com a câmara de cima, os eixos à superfície da esfera
      // inclinam-se em «V» nos dois olhos e as pálpebras a meio parecem zangadas
      const s = sup(c, Hd, [0, 0, 0], AX_H, sg * .4, .1, RO, RO);
      const k = P.olhosEsc || 1, ps = p2(c, s.P);
      let hx = pd(vk(Hd.s, -1)); if (hx[0] < 0) hx = [-hx[0], -hx[1]];
      const fi = Math.atan2(hx[1], hx[0]), la = Math.hypot(...pd(s.t1)) * k, lb = Math.hypot(...pd(s.t2)) * k * 1.12;
      const cf = Math.cos(fi), sf = Math.sin(fi);
      G.olho[L] = { x: ps[0], y: ps[1], vis: s.vis, t1: s.t1, t2: vk(s.t2, -1), m: `matrix(${n3(cf * la)},${n3(sf * la)},${n3(-sf * lb)},${n3(cf * lb)},${n(ps[0])},${n(ps[1])})` };
    }
    G.boch = LADOS.map(([, sg]) => sup(c, Hd, [0, 0, 0], AX_H, sg * .68, -.3, 13, 9));
    const sb = sup(c, Hd, [0, 0, 0], AX_H, 0, -.36, 1, 1);
    G.boca = { vis: sb.vis, m: matrizSup(c, sb, 1, 1).m };
    // antenas: haste que sobe da cabeça, cotovelo e a parte que vai para a frente, com a bolinha na ponta
    for (const [L, sg] of LADOS) {
      const lon = sg * .3, lat = .78, cl = Math.cos(lat);
      const base = ponto(Hd, AX_H[0] * cl * Math.cos(lon), AX_H[1] * Math.sin(lat), AX_H[2] * cl * Math.sin(lon));
      const e1 = (70 + P['ant' + L] + (P['_aa' + L] || 0)) * RAD, s1 = (34 + P.antS) * RAD * sg;
      const d1 = direcao(Hd, Math.cos(e1) * Math.cos(s1), Math.sin(e1), Math.cos(e1) * Math.sin(s1));
      const j = vs(base, vk(d1, 36));
      const e2 = e1 - (24 + P.antB + (P['_ab' + L] || 0)) * RAD, s2 = s1 * 1.9;
      const d2 = direcao(Hd, Math.cos(e2) * Math.cos(s2), Math.sin(e2), Math.cos(e2) * Math.sin(s2));
      const t = vs(j, vk(d2, 40));
      G.ant[L] = { a: p2(c, base), j: p2(c, j), t: p2(c, t), W: [base, j, t] };
      G.z['ant' + L] = prof(base) + 2;
    }
    // asas: 2 de cada lado (a da frente maior); duas «poses fantasma» que trocam de quadro a quadro dão o desfoque
    const zum = limita(Math.max(P.zum, .85 * som), 0, 1), wj = P._wj || 1;
    for (const [L, sg] of LADOS) {
      const rF = ponto(B, 6, 36, 18 * sg), rT = ponto(B, -12, 32, 18 * sg);
      const a = limita(Math.max(P.wA, .35 * som), 0, 1.4), am = Math.min(1, a);
      const fant = [];
      for (let k = 0; k < 2; k++) {
        const desv = zum * (k ? -34 : 26) * wj;
        const fi = (P.wB + desv) * RAD;
        const sO = vn(direcao(B, -.4 + .3 * Math.max(0, a - 1), Math.sin(fi), Math.cos(fi) * sg));
        const sF = vn(direcao(B, -1, .08, .22 * sg));
        const sp = vn(vlerp(sF, sO, am));
        let ch = vlerp(direcao(B, 0, -.2, sg), direcao(B, -1, 0, 0), am);
        ch = vn(vd(ch, vk(sp, vp(ch, sp))));
        const sp2 = vn(vs(sp, vk(ch, .45)));
        fant.push({ f: plano(c, rF, sp, ch, .26), t: plano(c, rT, sp2, ch, .26) });
        if (!k) G.z['asa' + L] = prof(vs(rF, vk(sp, 55)));
      }
      const vA = limita(a * 4, 0, 1);   // dobradas de todo (dentro do cortiço) ficam escondidas atrás da cabeça
      G.asa[L] = { fant, op0: n3((1 - .5 * zum) * vA), op1: n3(.55 * zum * vA) };
    }
    // patas: 3 de cada lado (IK de 2 segmentos); penduradas no ar, pousadas na flor, a lavar a antena, a acenar ou na soleira
    const enc = limita(P.enc, 0, 1), est = P.est || 0;
    for (const [L, sg] of LADOS) {
      const lst = [];
      for (let i = 0; i < 3; i++) {
        const pp = PERNAS[i], frente = i === 0;
        const lav = frente ? (P['lav' + L] || 0) : 0, ac = frente && L === 'D' ? (P.acena || 0) : 0, lev = Math.max(lav, ac);
        const raiz = ponto(B, pp.fx + 14 * lev, -28 + 10 * lev, 22 * sg);
        const sw = 5 * Math.sin((P._ps || 0) + i * 1.1 + sg);
        let alvo = vlerp(ponto(B, pp.fx + 10 - i * 4 + sw - 10 * est * (i - 1), -88 - 8 * est, (34 + 3 * i + 16 * est) * sg), ponto(B, pp.fx - 16, -48, 24 * sg), enc);
        if (i === 2 && P.esf) alvo = vs(alvo, direcao(B, 12 * Math.sin(P._ef || 0), 0, 0));   // esfregar o pólen
        if (P.pf > 0) { const q = alvo.slice(); q[1] = ((c.y - P.florY) / ESC + q[2] * sE) / cE; alvo = vlerp(alvo, q, P.pf); }
        if (frente && P.maos > 0) { const q = ponto(B, 60, -40, 36 * sg); q[1] = ((c.y - SOL_Y) / ESC + q[2] * sE) / cE; alvo = vlerp(alvo, q, P.maos); }
        if (lav > 0) {
          const [b0, j0, t0] = G.ant[L].W, u = P.lavU;
          const q = u < .5 ? vlerp(b0, j0, u * 2) : vlerp(j0, t0, u * 2 - 1);
          alvo = vlerp(alvo, vs(q, vk(Hd.f, 4)), lav);
        }
        if (ac > 0) { const w = Math.sin(P._acF || 0), bx = P.acB || 0; alvo = vlerp(alvo, ponto(B, lerp(30, 92, bx) + 10 * w * (1 - bx), lerp(40, -16, bx) + 8 * Math.abs(w), (lerp(92, 46, bx) + lerp(8, 14, bx) * w) * sg), ac); }
        const polo = vn(vs(vs(vk(B.s, sg), vk(B.u, .9)), vk(B.f, i === 0 ? .6 : i === 2 ? -.7 : 0)));
        const ik = ik2(raiz, alvo, pp.l1, pp.l2, polo);
        lst.push({ r: p2(c, raiz), j: p2(c, ik.J), e: p2(c, ik.E) });
      }
      G.perna[L] = lst;
      G.z['pernas' + L] = -26 + 50 * vp(vk(B.s, sg), VISTA);
      if (L === 'D') G.z.maos = G.z.cabeca + 7;   // as mãozinhas na soleira (à porta do cortiço) ficam à frente do queixo
      G.z['braco' + L] = (P['lav' + L] || 0) > .3 ? G.z.cabeca + 6 : G.z['pernas' + L] + 4;
    }
    return G;
  }

  /* ================= 3) Desenho da abelha ================= */
  // asas (x ao longo da asa, da raiz até à ponta; y para a orla de trás)
  const ASA_F = 'M0,-6 C24,-24 82,-36 118,-24 C138,-16 140,4 126,16 C102,34 46,34 14,20 C4,14 -2,6 0,-6 Z';
  const ASA_FV = 'M2,0 C40,-8 80,-14 116,-12 M30,-4 C44,6 52,18 54,28 M66,-10 C76,2 86,14 90,26 M10,4 C30,10 50,14 72,17';
  const ASA_FB = 'M8,-12 C32,-24 76,-32 110,-24';
  const ASA_T = 'M0,-4 C18,-14 56,-18 80,-8 C92,-2 90,12 78,18 C56,26 24,22 6,12 C0,8 -2,2 0,-4 Z';
  const ASA_TV = 'M2,1 C30,-2 56,-4 78,-2 M40,-4 C46,6 50,14 50,20';
  // ferrão pequenino de ponta redonda (x para trás, y para baixo), tufo de pelo no alto da cabeça (x para cima, y para a frente)
  const FERRAO = 'M-2,-5 C5,-4 11,-2 15,-1 C18,0 18,2 15,3 C11,4 5,4 -2,4 Z';
  const TUFO = 'M0,-12 C10,-15 21,-10 26,-2 C21,-4 17,-4 15,-2 C21,2 23,8 21,14 C15,8 8,6 2,8 C-4,4 -4,-8 0,-12 Z';
  const FOFO_T = fofo(22, .07), FOFO_G = fofo(16, .12);
  const NS_ = 'vector-effect="non-scaling-stroke"';

  function defsAbelha() {
    return `
    <radialGradient id="abelha-amarelo" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#FFF6B0"/><stop offset=".4" stop-color="#FFD83C"/><stop offset=".82" stop-color="#F0A81E"/><stop offset="1" stop-color="#C87A14"/></radialGradient>
    <radialGradient id="abelha-cabeca" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#FFF8CC"/><stop offset=".45" stop-color="#FFE066"/><stop offset=".85" stop-color="#F4B830"/><stop offset="1" stop-color="#D08C1C"/></radialGradient>
    <radialGradient id="abelha-pelo" cx=".38" cy=".3" r=".75"><stop offset="0" stop-color="#FFEFA8"/><stop offset=".45" stop-color="#F6C440"/><stop offset=".85" stop-color="#D89420"/><stop offset="1" stop-color="#B07018"/></radialGradient>
    <radialGradient id="abelha-gola" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFFCE6"/><stop offset=".6" stop-color="#FFEDA8"/><stop offset="1" stop-color="#EAC460"/></radialGradient>
    <radialGradient id="abelha-luz"><stop offset="0" stop-color="#FFFFF2" stop-opacity=".8"/><stop offset=".5" stop-color="#FFFFF2" stop-opacity=".3"/><stop offset="1" stop-color="#FFFFF2" stop-opacity="0"/></radialGradient>
    <linearGradient id="abelha-asa" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".9"/><stop offset=".5" stop-color="#E4F4FF" stop-opacity=".6"/><stop offset="1" stop-color="#C8E4FA" stop-opacity=".5"/></linearGradient>
    <radialGradient id="abelha-iris" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="#8A5A34"/><stop offset=".55" stop-color="#4A2A14"/><stop offset="1" stop-color="#22120A"/></radialGradient>
    <linearGradient id="abelha-palp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE27A"/><stop offset="1" stop-color="#E8A42A"/></linearGradient>
    <radialGradient id="abelha-bola" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#9A6A44"/><stop offset=".6" stop-color="#4A2C16"/><stop offset="1" stop-color="#2A160A"/></radialGradient>
    <radialGradient id="abelha-polen" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#FFF0A0"/><stop offset=".6" stop-color="#FFB62E"/><stop offset="1" stop-color="#E08A10"/></radialGradient>
    <radialGradient id="abelha-sombra"><stop offset="0" stop-color="#2E3A12" stop-opacity=".38"/><stop offset=".6" stop-color="#2E3A12" stop-opacity=".18"/><stop offset="1" stop-color="#2E3A12" stop-opacity="0"/></radialGradient>
    <clipPath id="abelha-clip-abd"><circle class="ab-clipA" r="1"/></clipPath>
    <clipPath id="abelha-clip-cab"><circle class="ab-clipH" r="1"/></clipPath>
    <clipPath id="abelha-clip-olho"><circle r="${n(RO + 1.2)}"/></clipPath>`;
  }
  function olhoSVG(L) {
    const r = RO;
    return `<g class="ab-olho${L}">
      <circle r="${n(r + 3.4)}" fill="${COR.cont}"/>
      <circle r="${n(r + 1.2)}" fill="#FFFFFF"/>
      <g clip-path="url(#abelha-clip-olho)">
        <g class="ab-iris${L}"><circle r="${n(r * .74)}" fill="url(#abelha-iris)"/><circle r="${n(r * .42)}" fill="#120904"/>
          <circle cx="${n(-r * .24)}" cy="${n(-r * .28)}" r="${n(r * .24)}" fill="#FFFFFF"/><circle cx="${n(r * .24)}" cy="${n(r * .22)}" r="${n(r * .1)}" fill="#FFFFFF" opacity=".9"/></g>
        <path class="ab-palpI${L}" fill="#F8CC4A"/><path class="ab-orlaI${L}" fill="none" stroke="#7A4A18" stroke-width="1.6"/>
        <path class="ab-palpS${L}" fill="url(#abelha-palp)"/><path class="ab-orla${L}" fill="none" stroke="${COR.cont}" stroke-width="2.6" stroke-linecap="round"/>
      </g>
    </g>`;
  }
  function abelhaSVG() {
    const asaF = `<path d="${ASA_F}" fill="url(#abelha-asa)" stroke="#6E86A8" stroke-width="1.6" stroke-linejoin="round" ${NS_}/><path d="${ASA_FV}" fill="none" stroke="#7C92B4" stroke-width="1" opacity=".75" ${NS_}/><path d="${ASA_FB}" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" opacity=".85" ${NS_}/>`;
    const asaT = `<path d="${ASA_T}" fill="url(#abelha-asa)" stroke="#6E86A8" stroke-width="1.4" stroke-linejoin="round" ${NS_}/><path d="${ASA_TV}" fill="none" stroke="#7C92B4" stroke-width="1" opacity=".75" ${NS_}/>`;
    const asa = L => `<g class="ab-g-asa${L}">${[0, 1].map(k => `<g class="ab-fant${k}${L}"><g class="ab-asaT${k}${L}">${asaT}</g><g class="ab-asaF${k}${L}">${asaF}</g></g>`).join('')}</g>`;
    const pernas = (nm, comPolen) => `<g class="ab-g-${nm}">
        <path class="ab-${nm}-c" fill="none" stroke="${COR.cont}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="ab-${nm}-e" fill="none" stroke="#6A4224" stroke-width="5.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="ab-${nm}-l" fill="none" stroke="#B08454" stroke-width="1.8" stroke-linecap="round" opacity=".75"/>
        <path class="ab-${nm}-p" fill="#3A2210"/>
        ${comPolen ? `<g class="ab-${nm}-pol" display="none"><circle r="1" fill="#B8700E"/><circle r=".86" fill="url(#abelha-polen)"/><circle cx="-.3" cy="-.36" r=".26" fill="#FFF8D0" opacity=".85"/></g>` : ''}
      </g>`;
    const antena = L => `<g class="ab-g-ant${L}"><path class="ab-ant${L}-c" fill="none" stroke="${COR.cont}" stroke-width="7" stroke-linecap="round"/><path class="ab-ant${L}-e" fill="none" stroke="#6A4426" stroke-width="3.4" stroke-linecap="round"/>
        <g class="ab-bola${L}"><circle r="12" fill="${COR.cont}"/><circle r="10" fill="url(#abelha-bola)"/><circle cx="-3.4" cy="-3.8" r="3.2" fill="#FFFFFF" opacity=".75"/></g></g>`;
    const torax = `<g class="ab-g-torax">
        <path class="ab-torax-c" d="${FOFO_T}" fill="${COR.cont}"/><path class="ab-torax-e" d="${FOFO_T}" fill="url(#abelha-pelo)"/>
        <path class="ab-pelos" fill="none" stroke="#C07E1A" stroke-width="2" stroke-linecap="round" opacity=".7"/>
        <circle class="ab-torax-l" r="1" fill="url(#abelha-luz)"/>
      </g>`;
    const gola = `<g class="ab-g-gola"><path class="ab-gola-c" d="${FOFO_G}" fill="${COR.cont}" opacity=".85"/><path class="ab-gola-e" d="${FOFO_G}" fill="url(#abelha-gola)"/></g>`;
    const abd = `<g class="ab-g-abd">
        <circle class="ab-abd-c" r="1" fill="${COR.cont}"/><circle class="ab-abd-e" r="1" fill="url(#abelha-amarelo)"/>
        <g clip-path="url(#abelha-clip-abd)">
          <path class="ab-riscas" fill="${COR.risca}"/>
          <circle class="ab-ponta-e" r="1" fill="#4A2C14"/>
          <circle class="ab-abd-l" r="1" fill="url(#abelha-luz)"/>
        </g>
      </g>`;
    const ferrao = `<g class="ab-g-ferrao"><path class="ab-ferrao" d="${FERRAO}" fill="#5A3418" stroke="${COR.cont}" stroke-width="1.4" ${NS_}/></g>`;
    const cabeca = `<g class="ab-g-cabeca">
        <g class="ab-tufo"><path d="${TUFO}" fill="#F6C440" stroke="${COR.cont}" stroke-width="2" stroke-linejoin="round" ${NS_}/><path d="M4,-8 C12,-10 18,-7 22,-3" fill="none" stroke="#FFF2B8" stroke-width="2" stroke-linecap="round" ${NS_}/></g>
        <circle class="ab-cabeca-c" r="1" fill="${COR.cont}"/><circle class="ab-cabeca-e" r="1" fill="url(#abelha-cabeca)"/>
        <g clip-path="url(#abelha-clip-cab)">
          <circle class="ab-cabeca-l" r="1" fill="url(#abelha-luz)"/>
          <g fill="#FF8C9C">${[0, 1].map(i => `<ellipse class="ab-boch${i}" rx="1" ry="1"/>`).join('')}</g>
          <g class="ab-boca"><path class="ab-bocaA" fill="#8A2A22" stroke="${COR.cont}" stroke-width="2.2" stroke-linejoin="round" ${NS_}/><path class="ab-lingua" fill="#F27C8C" stroke="#B84A5A" stroke-width="1" ${NS_}/>
            <path class="ab-bocaL" fill="none" stroke="${COR.cont}" stroke-width="3" stroke-linecap="round" ${NS_}/></g>
          ${olhoSVG('E')}${olhoSVG('D')}
        </g>
      </g>`;
    return `<g class="ab-abelha">
      <ellipse class="ab-sombra" rx="1" ry="1" fill="url(#abelha-sombra)"/>
      <circle class="ab-toque" r="150" fill="#000" fill-opacity="0"/>
      <g class="ab-partes"><g class="ab-g-maos" display="none"><path class="ab-maos-c" fill="${COR.cont}"/><path class="ab-maos-e" fill="#7A4E2A"/><path class="ab-maos-l" fill="#C8986A" opacity=".8"/></g>${asa('E')}${pernas('pernasE', true)}${pernas('bracoE')}${antena('E')}${abd}${ferrao}${torax}${gola}${cabeca}${antena('D')}${pernas('bracoD')}${pernas('pernasD', true)}${asa('D')}</g>
    </g>`;
  }
  // pálpebras no referencial do olho: c = fecho (0 aberto … 1 fechado), f = olhos contentes (pálpebra de baixo em arco)
  function palpebras(c, f) {
    const r = RO + 1.2, e = r + 4;
    const yS = lerp(-r * 1.16, r * .5, c), bS = r * (.3 * c - .42 * Math.sin(PI * Math.min(1, c)));   // a meio: borda em arco «⌒» (em «∪» parece enfadada); fechada: «‿»
    const cl = Math.max(c * .5, f * .62), yI = lerp(r * 1.06, r * .05, cl), bI = r * (.05 + .75 * f);
    return {
      sup: `M${-e},${-e}L${e},${-e}L${e},${n(yS)}Q0,${n(yS + bS)} ${-e},${n(yS)}Z`,
      orla: c > .04 ? `M${n(-r * 1.02)},${n(yS + bS * .04)}Q0,${n(yS + bS)} ${n(r * 1.02)},${n(yS + bS * .04)}` : 'M0,0',
      inf: `M${-e},${e}L${e},${e}L${e},${n(yI)}Q0,${n(yI - bI)} ${-e},${n(yI)}Z`,
      orlaI: f > .05 || c > .5 ? `M${n(-r)},${n(yI - bI * .05)}Q0,${n(yI - bI)} ${n(r)},${n(yI - bI * .05)}` : 'M0,0'
    };
  }
  // boca à superfície da cabeça (x para a direita, y para baixo): sorriso fechado, ou aberta com a língua
  function bocaD(ab, f, lg) {
    const w = 11 + 3 * f, cv = 4 + 5 * f;
    if (ab < .04 && lg < .04) return { linha: `M${n(-w)},-2Q0,${n(-2 + cv * 1.7)} ${n(w)},-2`, aberta: 'M0,0', lingua: 'M0,0' };
    const a = Math.max(ab, lg * .45), fundo = -2 + cv + 16 * a, cima = -2 + cv * .5 - 2 * a;
    const ext = 14 * lg, lw = w * .55;
    return {
      linha: 'M0,0',
      aberta: `M${n(-w)},-2Q0,${n(cima)} ${n(w)},-2Q${n(w * .9)},${n(fundo)} 0,${n(fundo)}Q${n(-w * .9)},${n(fundo)} ${n(-w)},-2Z`,
      lingua: `M${n(-lw)},${n(fundo - 2)}Q${n(-lw)},${n(fundo - 8 * a)} 0,${n(fundo - 8 * a)}Q${n(lw)},${n(fundo - 8 * a)} ${n(lw)},${n(fundo - 2)}L${n(lw * .8)},${n(fundo + ext)}Q0,${n(fundo + ext + 7 * lg)} ${n(-lw * .8)},${n(fundo + ext)}Z`
    };
  }

  /* --- ícone do menu: abelha redonda entre flores, com cores lisas (sem gradientes com id) --- */
  function iconeSVG() {
    const C = COR.cont;
    let lav = '', pap = '';
    for (const [x, y] of [[26, 160], [40, 150], [178, 166], [194, 154]]) lav += elip(x, y, 4, 9);
    for (const [x, y] of [[62, 182], [160, 186]]) pap += circ(x, y, 9);
    return `<circle cx="110" cy="110" r="106" fill="#CFEAFF"/>
      <path d="M6,146 C60,132 160,130 214,142 A106,106 0 0 1 6,146 Z" fill="#9CCC62"/>
      <path d="M26,170 L26,150 M40,170 L40,142 M178,176 L178,158 M194,172 L194,146" stroke="#5E8A3A" stroke-width="2.6"/>
      <path d="${lav}" fill="#7A4CB8"/><path d="${pap}" fill="#E8382E"/><path d="${circ(62, 182, 3)}${circ(160, 186, 3)}" fill="#2A1A20"/>
      <ellipse cx="92" cy="58" rx="20" ry="34" transform="rotate(-26 92 58)" fill="#F4FAFF" stroke="#7A92B4" stroke-width="2.4"/>
      <ellipse cx="118" cy="56" rx="18" ry="32" transform="rotate(18 118 56)" fill="#F4FAFF" stroke="#7A92B4" stroke-width="2.4"/>
      <path d="M30,124 L16,128 L30,132 Z" fill="${C}"/>
      <ellipse cx="80" cy="124" rx="52" ry="40" fill="${C}"/><ellipse cx="80" cy="124" rx="49" ry="37" fill="#FFD23A"/>
      <path d="M50,91 Q42,124 50,157 L64,161 Q56,124 64,88 Z M80,87 Q72,124 80,161 L94,160 Q86,124 94,88 Z" fill="${COR.risca}"/>
      <path d="M34,112 Q31,124 34,136 L38,137 Q35,124 38,111 Z" fill="${COR.risca}"/>
      <ellipse cx="72" cy="104" rx="6" ry="9" fill="#FFF6C0" opacity=".7"/>
      <circle cx="118" cy="118" r="30" fill="${C}"/><circle cx="118" cy="118" r="27.5" fill="#F6C440"/>
      <circle cx="146" cy="104" r="44" fill="${C}"/><circle cx="146" cy="104" r="41.5" fill="#FFE066"/>
      <path d="M136,64 C130,44 120,36 108,34 M160,64 C168,44 178,38 190,38" stroke="${C}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="107" cy="34" r="8" fill="${C}"/><circle cx="191" cy="38" r="8" fill="${C}"/><circle cx="105" cy="32" r="2.4" fill="#FFFFFF"/><circle cx="189" cy="36" r="2.4" fill="#FFFFFF"/>
      <ellipse cx="128" cy="98" rx="13" ry="15" fill="${C}"/><ellipse cx="128" cy="98" rx="11" ry="13" fill="#FFFFFF"/><circle cx="130" cy="100" r="8" fill="#4A2A14"/><circle cx="127" cy="96" r="3" fill="#FFFFFF"/>
      <ellipse cx="162" cy="98" rx="13" ry="15" fill="${C}"/><ellipse cx="162" cy="98" rx="11" ry="13" fill="#FFFFFF"/><circle cx="164" cy="100" r="8" fill="#4A2A14"/><circle cx="161" cy="96" r="3" fill="#FFFFFF"/>
      <ellipse cx="120" cy="120" rx="8" ry="5" fill="#FF8C9C" opacity=".7"/><ellipse cx="174" cy="120" rx="8" ry="5" fill="#FF8C9C" opacity=".7"/>
      <path d="M136,124 Q146,134 156,124" stroke="${C}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  }

  /* ================= 4) Cenário: encosta alentejana na primavera ================= */
  const REPOUSO = { x: 600, y: 514, h: 28 };                // onde a abelha paira
  const FLOR = { x: 772, y: 712 };                          // centro da flor do malmequer (onde pousa)
  const FLOR_BASE = [802, 908];
  const ALT_FLOR = 108;                                     // altura do tórax acima da flor quando pousada
  const LAV = { x: 468, y: 626 };                           // espiga de rosmaninho que ela cheira
  const CHEIRO = { x: 612, y: 590, h: -44 };
  const CORT = { x: 1010, R: 160, ry: 34, yT: 342, yB: 708 };   // cortiço (cilindro)
  const PORTA = { x: 1010, y: 536, rx: 118, ry: 130 };      // porta do cortiço
  const SOL_Y = PORTA.y + PORTA.ry - 24;                    // soleira (onde pousam as mãozinhas)
  const DENTRO = { x: 1010, y: 562, h: 0 };
  const MEL = { x: 1044, y: 668 };                          // onde pinga o mel
  const NUV = [{ x: 120, y: 92, k: 1 }, { x: 700, y: 58, k: .7 }, { x: 1180, y: 214, k: .75 }, { x: 1480, y: 100, k: .9 }];
  const SOL = { x: 232, y: 138 };
  const X0 = CORT.x - CORT.R, X1 = CORT.x + CORT.R;
  const FRENTE_D = `M${X0},${CORT.yT} L${X0},${CORT.yB} A${CORT.R},${CORT.ry} 0 0,0 ${X1},${CORT.yB} L${X1},${CORT.yT} A${CORT.R},${CORT.ry} 0 0,1 ${X0},${CORT.yT} Z`;
  const PORTA_D = elip(PORTA.x, PORTA.y, PORTA.rx, PORTA.ry) + 'Z';

  function defsCena() {
    return `
    <linearGradient id="abelha-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4FA6E8"/><stop offset=".45" stop-color="#86C6F2"/><stop offset=".78" stop-color="#C4E6FA"/><stop offset="1" stop-color="#EEF8FF"/></linearGradient>
    <radialGradient id="abelha-solBrilho"><stop offset="0" stop-color="#FFFDEA" stop-opacity="1"/><stop offset=".14" stop-color="#FFF6C4" stop-opacity=".8"/><stop offset=".45" stop-color="#FFF2C8" stop-opacity=".25"/><stop offset="1" stop-color="#FFF2C8" stop-opacity="0"/></radialGradient>
    <radialGradient id="abelha-sol" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#FFFFF6"/><stop offset=".7" stop-color="#FFF6C0"/><stop offset="1" stop-color="#FFE68A"/></radialGradient>
    <linearGradient id="abelha-serra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CBCD4"/><stop offset="1" stop-color="#BED6E2"/></linearGradient>
    <linearGradient id="abelha-planicie" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D4DC94"/><stop offset="1" stop-color="#B2C66E"/></linearGradient>
    <linearGradient id="abelha-colina" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B4D070"/><stop offset="1" stop-color="#92BA54"/></linearGradient>
    <linearGradient id="abelha-prado" gradientUnits="userSpaceOnUse" x1="0" y1="600" x2="0" y2="900"><stop offset="0" stop-color="#A6CA5E"/><stop offset=".45" stop-color="#86B646"/><stop offset="1" stop-color="#609638"/></linearGradient>
    <linearGradient id="abelha-troncoS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E28048"/><stop offset=".5" stop-color="#C0532A"/><stop offset="1" stop-color="#8A3418"/></linearGradient>
    <linearGradient id="abelha-troncoC" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A89684"/><stop offset=".5" stop-color="#857260"/><stop offset="1" stop-color="#5A4A3C"/></linearGradient>
    <radialGradient id="abelha-copa" cx=".36" cy=".3" r=".75"><stop offset="0" stop-color="#8CB052"/><stop offset=".6" stop-color="#5E8434"/><stop offset="1" stop-color="#3E5E24"/></radialGradient>
    <linearGradient id="abelha-cortico" gradientUnits="userSpaceOnUse" x1="${X0}" y1="0" x2="${X1}" y2="0"><stop offset="0" stop-color="#C6A27C"/><stop offset=".3" stop-color="#B08A64"/><stop offset=".72" stop-color="#8A684A"/><stop offset="1" stop-color="#5A402E"/></linearGradient>
    <radialGradient id="abelha-tampa" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#D8B690"/><stop offset=".6" stop-color="#B08A64"/><stop offset="1" stop-color="#8A6648"/></radialGradient>
    <linearGradient id="abelha-pedra" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D4D0C6"/><stop offset=".6" stop-color="#A8A298"/><stop offset="1" stop-color="#7E786E"/></linearGradient>
    <radialGradient id="abelha-interior" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#6A3E1C"/><stop offset="1" stop-color="#2A140A"/></radialGradient>
    <radialGradient id="abelha-mel" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#FFE88A"/><stop offset=".5" stop-color="#F6B226"/><stop offset="1" stop-color="#C8780C"/></radialGradient>
    <radialGradient id="abelha-escuroV" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#140804" stop-opacity=".05"/><stop offset=".72" stop-color="#140804" stop-opacity=".4"/><stop offset="1" stop-color="#140804" stop-opacity=".92"/></radialGradient>
    <linearGradient id="abelha-muroTopo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A7E6E"/><stop offset="1" stop-color="#6A5E50"/></linearGradient>
    <radialGradient id="abelha-sombraChao"><stop offset="0" stop-color="#2E3A12" stop-opacity=".4"/><stop offset="1" stop-color="#2E3A12" stop-opacity="0"/></radialGradient>
    <radialGradient id="abelha-papoila" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FF7A5A"/><stop offset=".6" stop-color="#E8301E"/><stop offset="1" stop-color="#B41812"/></radialGradient>
    <linearGradient id="abelha-petala" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E6E0EE"/></linearGradient>
    <radialGradient id="abelha-miolo" cx=".4" cy=".3" r=".7"><stop offset="0" stop-color="#FFEC8A"/><stop offset=".6" stop-color="#F6BE22"/><stop offset="1" stop-color="#D08A10"/></radialGradient>
    <radialGradient id="abelha-vinheta" cx=".5" cy=".46" r=".75"><stop offset=".64" stop-color="#2A2A10" stop-opacity="0"/><stop offset="1" stop-color="#2A2A10" stop-opacity=".2"/></radialGradient>
    <clipPath id="abelha-clip-frente"><path d="${FRENTE_D}${PORTA_D}" clip-rule="evenodd"/></clipPath>
    <clipPath id="abelha-clip-cortico"><path d="${FRENTE_D}${elip(CORT.x, CORT.yT, CORT.R, CORT.ry)}"/></clipPath>`;
  }

  /* --- céu: sol, nuvens e uma cegonha que passa devagar --- */
  function nuvemSVG(i) {
    return `<g class="ab-nuvem${i}"><g>
      <ellipse cx="6" cy="14" rx="86" ry="15" fill="#D2E6F4"/>
      <path d="${circ(-48, 2, 25)}${circ(-12, -16, 36)}${circ(30, -6, 30)}${circ(62, 6, 18)}" fill="#FFFFFF"/>
      <ellipse cx="4" cy="9" rx="80" ry="13" fill="#F2F8FC"/>
      <path d="M-62,16 C-24,25 30,25 78,15" stroke="#BCD6EA" stroke-width="4" fill="none" opacity=".8"/>
    </g></g>`;
  }
  function ceuSVG() {
    return `<rect x="-20" y="-20" width="1640" height="680" fill="url(#abelha-ceu)"/>
      <circle cx="${SOL.x}" cy="${SOL.y}" r="420" fill="url(#abelha-solBrilho)"/>
      <circle cx="${SOL.x}" cy="${SOL.y}" r="52" fill="url(#abelha-sol)"/>
      <circle class="ab-solAura" cx="${SOL.x}" cy="${SOL.y}" r="68" fill="#FFFBE0" opacity=".35"/>
      ${NUV.map((c, i) => nuvemSVG(i)).join('')}
      <g class="ab-cegonha"><g transform="scale(.75)">
        <path d="M20,1 L52,5" stroke="#E04A2A" stroke-width="2.6" stroke-linecap="round"/>
        <path class="ab-cegAsaL" d="M-6,-2 C-4,-18 4,-34 18,-42 C22,-28 18,-12 8,0 Z" fill="#D8D8D2" stroke="#3A3A3A" stroke-width="1.2"/>
        <ellipse cx="0" cy="0" rx="24" ry="7" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="1.2"/>
        <path d="M-20,-2 C-30,-5 -38,-5 -46,-3" stroke="#3A3A3A" stroke-width="6.6" fill="none" stroke-linecap="round"/><path d="M-20,-2 C-30,-5 -38,-5 -46,-3" stroke="#FFFFFF" stroke-width="4.4" fill="none" stroke-linecap="round"/>
        <path d="M-47,-3 L-66,2" stroke="#E04A2A" stroke-width="3" stroke-linecap="round"/>
        <g class="ab-cegAsa"><path d="M-6,-1 C-8,-20 2,-40 20,-52 C28,-36 24,-16 10,1 Z" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="1.2"/><path d="M14,-40 C18,-46 20,-50 20,-52 C28,-36 24,-16 10,1 C12,-12 14,-26 14,-40 Z" fill="#2A2A2A"/></g>
      </g></g>`;
  }
  /* --- serra azulada, planície com searas, o monte branco de barra azul e sobreiros pequeninos ao longe --- */
  function longeSVG() {
    const r = semente(7);
    let cp = '', tr = '';
    for (let i = 0; i < 18; i++) {
      const x = 30 + i * 92 + r() * 40, y = 548 + r() * 22, k = .6 + r() * .5;
      if (x > 250 && x < 380) continue;
      tr += `M${n(x)},${n(y)}l${n(2 * k)},${n(-12 * k)}`;
      cp += elip(x + 2 * k, y - 18 * k, 16 * k, 10 * k) + elip(x - 8 * k, y - 14 * k, 9 * k, 7 * k) + elip(x + 12 * k, y - 14 * k, 10 * k, 7 * k);
    }
    return `<path d="M-20,500 C120,470 240,452 380,462 C520,472 600,440 760,446 C900,452 980,476 1120,464 C1260,452 1380,430 1500,440 C1560,446 1600,452 1620,454 L1620,600 L-20,600 Z" fill="url(#abelha-serra)"/>
      <rect x="-20" y="470" width="1640" height="60" fill="#F4FAFF" opacity=".22"/>
      <path d="M-20,536 C160,512 320,506 500,518 C680,530 820,508 1000,504 C1180,500 1320,520 1620,510 L1620,660 L-20,660 Z" fill="url(#abelha-planicie)"/>
      <path d="M120,540 C260,524 380,522 520,530 L540,548 C400,540 260,542 110,556 Z M880,522 C1000,512 1120,512 1240,520 L1250,536 C1130,528 1010,528 890,538 Z M560,540 C640,532 720,530 800,534 L806,546 C730,542 650,544 566,552 Z" fill="#E6D894" opacity=".85"/>
      <path d="M130,548 L530,538 M900,530 L1244,528" stroke="#CDBE74" stroke-width="2" opacity=".7"/>
      <g transform="translate(316,532)">
        <path d="M22,0 L22,-12 L44,-12 L44,0 Z" fill="#FBF9F4" stroke="#C8C0B2" stroke-width="1"/><path d="M21,-12 L46,-12 L44,-16 L23,-16 Z" fill="#D4744C"/>
        <path d="M-34,0 L-34,-18 L22,-18 L22,0 Z" fill="#FFFDF8" stroke="#C8C0B2" stroke-width="1"/>
        <path d="M-37,-18 L-6,-31 L25,-18 Z" fill="#D4744C" stroke="#9A4A2A" stroke-width="1"/>
        <rect x="-34" y="-4" width="78" height="4" fill="#3A6EC0"/>
        <rect x="6" y="-42" width="10" height="20" fill="#FFFDF8" stroke="#C8C0B2" stroke-width="1"/><rect x="5" y="-44" width="12" height="3" fill="#FFFDF8" stroke="#C8C0B2" stroke-width="1"/>
        <rect x="-24" y="-13" width="6" height="9" fill="#3A6EC0"/><rect x="-8" y="-13" width="6" height="6" fill="#3A6EC0"/><rect x="30" y="-9" width="5" height="5" fill="#3A6EC0"/>
      </g>
      <path d="${tr}" stroke="#7A5A3A" stroke-width="2.4"/><path d="${cp}" fill="#6E8A44"/>
      <path d="M-20,598 C200,572 380,568 560,580 C760,592 900,578 1100,572 C1300,566 1460,578 1620,572 L1620,700 L-20,700 Z" fill="url(#abelha-colina)"/>
      <rect x="-20" y="560" width="1640" height="40" fill="#F6FFE8" opacity=".18"/>`;
  }
  /* --- prado da encosta: manchas, pontinhos de flores (rosmaninho, papoilas, malmequeres, margaças) e erva --- */
  function pradoSVG() {
    const r = semente(19);
    let roxo = '', verm = '', amar = '', branco = '', erva = '', erva2 = '';
    for (let i = 0; i < 360; i++) {
      const y = 604 + Math.pow(r(), 1.25) * 296, x = r() * 1640 - 20, k = .45 + (y - 600) / 110;
      const t = r(), d = y > 820 ? elip(x, y, 1.6 * k, 1.1 * k) : circ(x, y, 1.1 * k + r() * k * .4);
      if (t < .3) roxo += d; else if (t < .48) verm += d; else if (t < .8) amar += d; else branco += d;
    }
    for (let i = 0; i < 170; i++) {
      const x = r() * 1640 - 20, y = 640 + Math.pow(r(), 1.2) * 260, hh = 5 + (y - 630) / 16 + r() * 5;
      const d = `M${n(x)},${n(y)}q${n(-1 + r() * 2)},${n(-hh * .6)} ${n(-3 + r() * 6)},${n(-hh)}`;
      if (r() < .5) erva += d; else erva2 += d;
    }
    return `<rect x="-20" y="600" width="1640" height="320" fill="url(#abelha-prado)"/>
      <path d="M-20,640 C300,628 700,646 1000,636 C1300,626 1500,640 1640,634 L1640,672 C1500,678 1300,664 1000,676 C700,686 300,668 -20,680 Z M-20,760 C300,750 700,766 1000,758 C1300,750 1500,762 1640,756 L1640,804 C1500,810 1300,798 1000,808 C700,816 300,800 -20,810 Z" fill="#BEE07E" opacity=".3"/>
      <path d="M-20,700 C300,708 700,696 1000,704 C1300,712 1500,700 1640,706 L1640,724 C1500,718 1300,730 1000,722 C700,714 300,726 -20,718 Z" fill="#5A8A30" opacity=".22"/>
      <path d="${erva}" stroke="#5E9A38" stroke-width="2" fill="none" stroke-linecap="round"/><path d="${erva2}" stroke="#B4DA70" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="${roxo}" fill="#8A5CC8"/><path d="${verm}" fill="#E8382E"/><path d="${amar}" fill="#FFD52E"/><path d="${branco}" fill="#FFFFFF"/>`;
  }
  /* --- copa de sobreiro: massas de folhagem escura com luz à esquerda e folhinhas --- */
  function copaSobreiro(x, y, rx, ry, sem) {
    const r = semente(sem);
    let massa = '', sombra = '', luz = '', folhas = '';
    for (let i = 0; i < 11; i++) { const a = i / 11 * 2 * PI, rr = (.42 + r() * .2) * Math.min(rx, ry); massa += circ(x + Math.cos(a) * rx * .62, y + Math.sin(a) * ry * .5, rr); }
    massa += elip(x, y, rx * .7, ry * .62);
    for (let i = 0; i < 6; i++) { const a = .1 + i / 6 * 1.8, rr = (.26 + r() * .12) * Math.min(rx, ry); sombra += circ(x + Math.cos(a) * rx * .5, y + Math.sin(a) * ry * .45 + ry * .12, rr); }
    for (let i = 0; i < 6; i++) { const a = PI + .25 + i * .42, rr = (.2 + r() * .1) * Math.min(rx, ry); luz += circ(x + Math.cos(a) * rx * .5, y + Math.sin(a) * ry * .5, rr); }
    const N = Math.round(rx * ry / 260);
    for (let i = 0; i < N; i++) { const a = r() * 2 * PI, d = Math.sqrt(r()), fx = x + Math.cos(a) * rx * .95 * d, fy = y + Math.sin(a) * ry * .85 * d; folhas += elip(fx, fy, 4, 2.4); }
    return `<path d="${massa}" fill="url(#abelha-copa)"/><path d="${sombra}" fill="#34501E" opacity=".55"/><path d="${luz}" fill="#A2C462" opacity=".55"/><path d="${folhas}" fill="#B4D274" opacity=".55"/>`;
  }
  /* --- sobreiro grande à esquerda (tronco descortiçado cor de tijolo com o número pintado) e dois mais pequenos à direita --- */
  function sobreirosSVG() {
    return `<ellipse cx="190" cy="712" rx="180" ry="16" fill="url(#abelha-sombraChao)"/>
      <path d="M150,712 C160,650 152,590 162,540 C168,500 150,470 116,438 L134,426 C162,452 178,474 186,500 C196,468 222,444 256,428 L266,442 C236,462 214,490 208,530 C204,590 214,650 224,712 Z" fill="url(#abelha-troncoC)" stroke="#3A2E24" stroke-width="2"/>
      <path d="M168,560 C172,530 168,505 160,490 M196,540 C198,515 206,490 220,470 M182,590 C186,570 184,550 188,532" stroke="#5A4A3C" stroke-width="2.4" fill="none" opacity=".7"/>
      <path d="M150,712 C158,668 156,632 160,600 C178,606 196,594 214,600 C212,640 216,680 224,712 Z" fill="url(#abelha-troncoS)" stroke="#6A2A12" stroke-width="1.6"/>
      <path d="M158,602 C176,608 196,596 216,602" stroke="#5A4A3C" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M166,630 C168,660 166,690 168,708 M204,620 C202,650 206,680 210,706" stroke="#F0A070" stroke-width="2" fill="none" opacity=".6"/>
      <path d="M195,636 C186,634 181,642 182,652 C183,662 191,664 195,658 C197,652 192,647 185,651" stroke="#F6F4EE" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <g class="ab-copa0" data-cx="190" data-cy="520"><g>${copaSobreiro(186, 372, 176, 104, 31)}</g></g>
      <ellipse cx="1390" cy="696" rx="110" ry="10" fill="url(#abelha-sombraChao)"/>
      <path d="M1376,694 C1380,664 1376,640 1384,612 L1396,612 C1400,640 1398,666 1404,694 Z M1380,630 C1362,616 1346,604 1330,600 M1398,624 C1414,610 1430,600 1446,598" fill="url(#abelha-troncoS)" stroke="#5A2A12" stroke-width="2"/>
      <g class="ab-copa1" data-cx="1390" data-cy="640"><g>${copaSobreiro(1390, 566, 116, 56, 37)}</g></g>
      <path d="M1552,690 C1554,670 1552,654 1556,636 L1564,636 C1566,654 1566,670 1570,690 Z" fill="url(#abelha-troncoC)" stroke="#3A2E24" stroke-width="1.6"/>
      <g class="ab-copa2" data-cx="1560" data-cy="660"><g>${copaSobreiro(1562, 604, 82, 42, 41)}</g></g>`;
  }
  /* --- estevas em flor (pétalas brancas com a mancha cor de vinho e o miolo amarelo) --- */
  function estevaSVG(x0, y0, w, hh, sem) {
    const r = semente(sem);
    let massa = '', esc = '', pet = '', manchas = '', miolos = '';
    for (let i = 0; i < 9; i++) { const x = x0 + r() * w, y = y0 + r() * hh * .6, rr = 18 + r() * 16; massa += circ(x, y + 10, rr); }
    for (let i = 0; i < 5; i++) { const x = x0 + r() * w, y = y0 + hh * .5 + r() * hh * .3; esc += circ(x, y + 10, 14 + r() * 8); }
    for (let i = 0; i < 11; i++) {
      const x = x0 + 10 + r() * (w - 20), y = y0 - 8 + r() * hh * .7, k = .8 + r() * .35, rot = r() * 2;
      for (let p = 0; p < 5; p++) {
        const a = rot + p / 5 * 2 * PI, cx = x + Math.cos(a) * 7 * k, cy = y + Math.sin(a) * 6 * k;
        pet += elip(cx, cy, 7 * k, 6.4 * k);
        manchas += circ(x + Math.cos(a) * 4.6 * k, y + Math.sin(a) * 4 * k, 1.9 * k);
      }
      miolos += circ(x, y, 2.8 * k);
    }
    return `<path d="${massa}" fill="#4E7A3E"/><path d="${esc}" fill="#2E5226" opacity=".7"/>
      <path d="${pet}" fill="#FFFFFF" stroke="#D8D2DA" stroke-width=".8"/><path d="${manchas}" fill="#8A1E2E"/><path d="${miolos}" fill="#F6C628"/>`;
  }
  /* --- rosmaninho: hastes, espigas roxas e as «orelhas» lilases no alto --- */
  function rosmaninhoSVG(cls, x, y, k, sem, nE, alt) {
    const r = semente(sem);
    let hastes = '', esp = '', orelhas = '', grao = '', folhas = '';
    for (let i = 0; i < nE; i++) {
      const dx = (i - (nE - 1) / 2) * 13 * k + (r() - .5) * 8 * k, hh = (alt || 90) * k * (.75 + r() * .35), tx = dx * 1.5 + (r() - .5) * 10 * k, ty = -hh;
      hastes += `M${n(dx * .4)},0 Q${n(dx * .9)},${n(ty * .5)} ${n(tx)},${n(ty)}`;
      esp += elip(tx, ty - 9 * k, 5.4 * k, 11 * k);
      for (let g = 0; g < 4; g++) grao += circ(tx + (g % 2 ? 2 : -2) * k, ty - 3 * k - g * 4.6 * k, 1.5 * k);
      orelhas += `M${n(tx - 1 * k)},${n(ty - 18 * k)} C${n(tx - 9 * k)},${n(ty - 26 * k)} ${n(tx - 9 * k)},${n(ty - 34 * k)} ${n(tx - 4 * k)},${n(ty - 36 * k)} C${n(tx)},${n(ty - 30 * k)} ${n(tx)},${n(ty - 24 * k)} ${n(tx - 1 * k)},${n(ty - 18 * k)}Z`;
      orelhas += `M${n(tx + 1 * k)},${n(ty - 18 * k)} C${n(tx + 8 * k)},${n(ty - 24 * k)} ${n(tx + 10 * k)},${n(ty - 32 * k)} ${n(tx + 6 * k)},${n(ty - 34 * k)} C${n(tx + 2 * k)},${n(ty - 28 * k)} ${n(tx)},${n(ty - 24 * k)} ${n(tx + 1 * k)},${n(ty - 18 * k)}Z`;
    }
    for (let i = 0; i < 14; i++) { const fx = (r() - .5) * nE * 16 * k, fy = -r() * 40 * k; folhas += `M${n(fx)},${n(fy)}l${n((r() - .5) * 14 * k)},${n(-10 * k)}`; }
    return `<g class="${cls}" transform="translate(${x},${y})"><g>
      <path d="${folhas}" stroke="#7E9A6A" stroke-width="${n(2.4 * k)}" stroke-linecap="round"/>
      <path d="${hastes}" stroke="#6E8A5A" stroke-width="${n(2.2 * k)}" fill="none" stroke-linecap="round"/>
      <path d="${esp}" fill="#5A2E8A" stroke="#3A1A5E" stroke-width="1"/><path d="${grao}" fill="#8E62C6"/>
      <path d="${orelhas}" fill="#C69AEA" stroke="#8A5CC0" stroke-width="1"/>
    </g></g>`;
  }
  /* --- papoila (caule peludo, folha recortada, quatro pétalas em taça e o miolo escuro); com «botao» é um botão que pode abrir --- */
  function papoilaSVG(cls, x, y, k, alt, botao) {
    const fl = `<ellipse cx="${n(-12 * k)}" cy="${n(-4 * k)}" rx="${n(17 * k)}" ry="${n(13 * k)}" fill="#C41C14"/><ellipse cx="${n(12 * k)}" cy="${n(-4 * k)}" rx="${n(17 * k)}" ry="${n(13 * k)}" fill="#C41C14"/>
        <circle r="${n(7 * k)}" fill="#2A1A20"/><path d="${circ(0, -3 * k, 3 * k)}" fill="#5A4A6A"/>
        <path d="M${n(-26 * k)},${n(-6 * k)} C${n(-26 * k)},${n(12 * k)} ${n(-10 * k)},${n(20 * k)} 0,${n(20 * k)} C${n(10 * k)},${n(20 * k)} ${n(26 * k)},${n(12 * k)} ${n(26 * k)},${n(-6 * k)} C${n(16 * k)},${n(2 * k)} ${n(-16 * k)},${n(2 * k)} ${n(-26 * k)},${n(-6 * k)}Z" fill="url(#abelha-papoila)" stroke="#8A1210" stroke-width="1.2"/>
        <path d="M${n(-18 * k)},${n(4 * k)} C${n(-14 * k)},${n(12 * k)} ${n(-8 * k)},${n(15 * k)} ${n(-2 * k)},${n(16 * k)}" stroke="#FF9A80" stroke-width="${n(2.4 * k)}" fill="none" stroke-linecap="round" opacity=".7"/>
        <path d="M${n(-4 * k)},${n(1 * k)} L${n(-3 * k)},${n(9 * k)} M${n(4 * k)},${n(1 * k)} L${n(3 * k)},${n(9 * k)}" stroke="#1A0A10" stroke-width="${n(1.6 * k)}" opacity=".6"/>`;
    const caule = `<path d="M0,0 C${n(-6 * k)},${n(-alt * .4)} ${n(8 * k)},${n(-alt * .7)} 0,${-alt}" stroke="#4E8A30" stroke-width="${n(3.4 * k)}" fill="none" stroke-linecap="round"/>
      <path d="M-1,${n(-alt * .22)} C${n(-14 * k)},${n(-alt * .3)} ${n(-22 * k)},${n(-alt * .22)} ${n(-30 * k)},${n(-alt * .12)} C${n(-24 * k)},${n(-alt * .16)} ${n(-18 * k)},${n(-alt * .12)} ${n(-14 * k)},${n(-alt * .14)} C${n(-10 * k)},${n(-alt * .12)} ${n(-6 * k)},${n(-alt * .16)} -1,${n(-alt * .18)}Z" fill="#6EA840" stroke="#3E6A26" stroke-width="1"/>`;
    if (!botao) return `<g class="${cls}" transform="translate(${x},${y})"><g>${caule}<g transform="translate(0,${-alt})">${fl}</g></g></g>`;
    return `<g class="${cls}" transform="translate(${x},${y})"><g>${caule}
      <g class="ab-botaoFlor" transform="translate(0,${-alt}) scale(0)">${fl}</g>
      <g class="ab-botao" transform="translate(0,${-alt})"><g class="ab-botaoIn">
        <path d="M0,0 C${n(-10 * k)},${n(-2 * k)} ${n(-12 * k)},${n(-18 * k)} 0,${n(-26 * k)} C${n(12 * k)},${n(-18 * k)} ${n(10 * k)},${n(-2 * k)} 0,0Z" fill="#7AAE4A" stroke="#3E6A26" stroke-width="1.2"/>
        <path d="M0,${n(-2 * k)} C${n(2 * k)},${n(-10 * k)} ${n(2 * k)},${n(-18 * k)} 0,${n(-24 * k)}" stroke="#4E7A2E" stroke-width="1.2" fill="none"/>
        <path d="M${n(-4 * k)},${n(-22 * k)} C${n(-1 * k)},${n(-26 * k)} ${n(1 * k)},${n(-26 * k)} ${n(4 * k)},${n(-22 * k)}" stroke="#E8301E" stroke-width="${n(2.4 * k)}" fill="none" stroke-linecap="round"/>
      </g></g></g></g>`;
  }
  /* --- muro de pedra solta: lajes de xisto em fiadas, topo com lajes vistas de cima, musgo, líquenes, ervas e florinhas --- */
  function muroSVG() {
    const r = semente(43);
    const pedra = (x, y, w, hh) => { const j = () => (r() - .5) * 3; return `M${n(x + 4 + j())},${n(y + j())} Q${n(x + w / 2)},${n(y - 2 + j())} ${n(x + w - 4)},${n(y + j())} Q${n(x + w)},${n(y)} ${n(x + w + j())},${n(y + 5)} L${n(x + w + j())},${n(y + hh - 4)} Q${n(x + w)},${n(y + hh)} ${n(x + w - 5)},${n(y + hh + j())} Q${n(x + w / 2)},${n(y + hh + 2)} ${n(x + 4)},${n(y + hh + j())} Q${n(x)},${n(y + hh)} ${n(x + j())},${n(y + hh - 4)} L${n(x + j())},${n(y + 4)} Q${n(x)},${n(y)} ${n(x + 4)},${n(y)}Z`; };
    let p1 = '', p2_ = '', p3 = '', luz = '', lq = '';
    let fila = 0;
    for (let y = 748; y < 832; y += 21, fila++) {
      let x = 692 + (fila % 2 ? -18 : 0) + r() * 10;
      while (x < 1640) {
        const w = 34 + r() * 56, hh = 15 + r() * 5, d = pedra(x + 2, y + r() * 2, w - 4, hh), t = r();
        if (t < .4) p1 += d; else if (t < .75) p2_ += d; else p3 += d;
        luz += `M${n(x + 6)},${n(y + 2.5)} L${n(x + w - 8)},${n(y + 2)}`;
        if (r() < .18) lq += circ(x + 10 + r() * (w - 20), y + 6 + r() * 8, 2 + r() * 3);
        x += w;
      }
    }
    let t1 = '', t2 = '';
    for (let x = 696; x < 1640;) { const w = 40 + r() * 60, y = 704 + r() * 26; const d = elip(x + w / 2, y, w / 2, 7 + r() * 5); if (r() < .5) t1 += d; else t2 += d; x += w * .8; }
    let erva = '', flores = '';
    for (let i = 0; i < 40; i++) { const x = 700 + r() * 940, y = 700 + r() * 40, hh = 8 + r() * 14; if (x > 820 && x < 1200) continue; erva += `M${n(x)},${n(y)}q${n(-2 + r() * 4)},${n(-hh * .6)} ${n(-4 + r() * 8)},${n(-hh)}`; }
    for (let i = 0; i < 12; i++) { const x = 700 + r() * 940, y = 694 + r() * 34; if (x > 830 && x < 1190) continue; flores += circ(x, y, 3 + r() * 1.5); }
    return `<path d="M700,700 C900,694 1200,690 1640,688 L1640,836 L690,836 L690,760 C688,740 694,716 700,700 Z" fill="#4A4036"/>
      <path d="M696,700 C900,694 1200,690 1640,688 L1640,746 L694,746 Z" fill="url(#abelha-muroTopo)"/>
      <path d="${t1}" fill="#A89C8A"/><path d="${t2}" fill="#8E826E"/>
      <path d="M694,745 L1640,745" stroke="#C8BCA8" stroke-width="3" opacity=".7"/>
      <path d="${p1}" fill="#A69886" stroke="#5A4E40" stroke-width="1.2"/><path d="${p2_}" fill="#8E806C" stroke="#5A4E40" stroke-width="1.2"/><path d="${p3}" fill="#B8A88E" stroke="#5A4E40" stroke-width="1.2"/>
      <path d="${luz}" stroke="#E2D6C0" stroke-width="2" opacity=".55" stroke-linecap="round"/>
      <path d="${lq}" fill="#D8C870" opacity=".75"/>
      <path d="M690,836 L1640,836" stroke="#3A3226" stroke-width="5" opacity=".5"/>
      <path d="${erva}" stroke="#6EA040" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="${flores}" fill="#FFD52E" stroke="#D89A10" stroke-width=".8"/>`;
  }
  /* --- cortiço: camada de trás (sombra no muro, interior escuro, favos de mel dourados, espessura da soleira) --- */
  function corticoTrasSVG() {
    const { x, y, rx, ry } = PORTA, r = semente(61);
    const s = 15, w = Math.sqrt(3) * s;
    let cel = '', tampas = '', brilho = '';
    for (let j = 0, cy = y - ry - 10; cy < y + ry + 10; j++, cy += 1.5 * s) {
      for (let cx = x - rx - 20 + (j % 2 ? w / 2 : 0); cx < x + rx + 20; cx += w) {
        const dx = (cx - x) / (rx + 8), dy = (cy - y) / (ry + 8);
        if (dx * dx + dy * dy > 1) continue;
        let hx = '';
        for (let k = 0; k < 6; k++) { const a = PI / 6 + k * PI / 3; hx += (k ? 'L' : 'M') + n(cx + Math.cos(a) * (s - 2)) + ',' + n(cy + Math.sin(a) * (s - 2)); }
        hx += 'Z';
        if (r() < .3) tampas += hx; else { cel += hx; brilho += `M${n(cx - 6)},${n(cy - 3)}q4,-5 9,-3`; }
      }
    }
    return `<ellipse cx="${CORT.x + 20}" cy="${CORT.yB + 8}" rx="200" ry="30" fill="url(#abelha-sombraChao)"/>
      <ellipse cx="${x}" cy="${y}" rx="${rx + 6}" ry="${ry + 6}" fill="url(#abelha-interior)"/>
      <ellipse cx="${x}" cy="${y + 4}" rx="${rx}" ry="${ry - 4}" fill="#B87414"/>
      <path d="${cel}" fill="url(#abelha-mel)" stroke="#8A5410" stroke-width="1.4"/>
      <path d="${tampas}" fill="#F4D684" stroke="#B88A30" stroke-width="1.4"/>
      <path d="${brilho}" stroke="#FFF6D0" stroke-width="2" fill="none" stroke-linecap="round" opacity=".75"/>
      <ellipse cx="${x}" cy="${y}" rx="${rx + 6}" ry="${ry + 6}" fill="url(#abelha-escuroV)"/>
      <path d="M${x - rx * .86},${n(y + ry * .5)} A${rx},${ry} 0 0,0 ${x + rx * .86},${n(y + ry * .5)} L${x + rx * .84},${n(y + ry * .5 - 6)} A${rx * .96},${ry * .96 - 6} 0 0,1 ${x - rx * .84},${n(y + ry * .5 - 6)} Z" fill="#B8683C" stroke="#5A3018" stroke-width="1.2"/>
      <path d="M${x - 60},${n(y + ry - 6)} C${x - 30},${n(y + ry - 2)} ${x + 30},${n(y + ry - 2)} ${x + 60},${n(y + ry - 6)}" stroke="#D88A5A" stroke-width="2" fill="none" opacity=".6"/>`;
  }
  /* --- cortiço: camada da frente (cortiça rugosa com o buraco da porta, cintas de esparto, mel a escorrer, tampa e pedra) --- */
  function corticoFrenteSVG() {
    const r = semente(67);
    let rachas = '', cristas = '', liquen = '', fissuras = '';
    for (let i = 0; i < 26; i++) {
      const fi = -1.45 + i / 25 * 2.9 + (r() - .5) * .06, x = CORT.x + CORT.R * Math.sin(fi);
      let y = CORT.yT + 20 + r() * 30, d = `M${n(x)},${n(y)}`;
      const yF = CORT.yB + CORT.ry * Math.cos(fi) - 4;
      while (y < yF) { const dy = 22 + r() * 20; y = Math.min(yF, y + dy); d += `L${n(x + (r() - .5) * 6 * Math.cos(fi))},${n(y)}`; }
      rachas += d;
      cristas += `M${n(x + 4 * Math.cos(fi))},${n(CORT.yT + 50 + r() * 60)}l${n((r() - .5) * 3)},${n(60 + r() * 120)}`;
    }
    for (let i = 0; i < 40; i++) { const fi = (r() - .5) * 2.9, x = CORT.x + CORT.R * Math.sin(fi), y = CORT.yT + 40 + r() * 320, w = 8 + r() * 12; fissuras += `M${n(x - w * Math.cos(fi))},${n(y)} q${n(w * Math.cos(fi))},${n(3 + r() * 3)} ${n(2 * w * Math.cos(fi))},0`; }
    for (let i = 0; i < 16; i++) { const fi = (r() - .5) * 2.6, x = CORT.x + CORT.R * Math.sin(fi), y = CORT.yT + 50 + r() * 320; liquen += elip(x, y, (4 + r() * 6) * Math.max(.3, Math.cos(fi)), 3 + r() * 4); }
    const cinta = yb => {
      let tr = '';
      for (let k = 1; k < 30; k++) { const a = k / 30 * PI, cx = CORT.x + CORT.R * Math.cos(a), cy = yb + CORT.ry * Math.sin(a); tr += `M${n(cx - 3 * Math.sin(a))},${n(cy - 5)}L${n(cx + 3 * Math.sin(a))},${n(cy + 5)}`; }
      const arco = `M${X0},${yb} A${CORT.R},${CORT.ry} 0 0,0 ${X1},${yb}`;
      return `<path d="${arco}" stroke="#5A3E1C" stroke-width="15" fill="none"/><path d="${arco}" stroke="#C8A85E" stroke-width="11" fill="none"/>
        <path d="${tr}" stroke="#8A6A30" stroke-width="2" stroke-linecap="round"/><path d="M${X0},${yb - 3} A${CORT.R},${CORT.ry} 0 0,0 ${X1},${yb - 3}" stroke="#F0D894" stroke-width="2" fill="none" opacity=".7"/>`;
    };
    const { x, y, rx, ry } = PORTA;
    const tx = CORT.x, ty = CORT.yT - 16, tR = 178, tRy = 38;
    return `<g clip-path="url(#abelha-clip-frente)">
        <rect x="${X0 - 4}" y="${CORT.yT - 40}" width="${2 * CORT.R + 8}" height="${CORT.yB - CORT.yT + 90}" fill="url(#abelha-cortico)"/>
        <path d="${liquen}" fill="#C8C89A" opacity=".55"/>
        <path d="${cristas}" stroke="#E2C8A0" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>
        <path d="${rachas}" stroke="#4A3020" stroke-width="2.6" fill="none" stroke-linejoin="round" opacity=".8"/>
        <path d="${fissuras}" stroke="#4A3020" stroke-width="1.8" fill="none" opacity=".6"/>
        ${cinta(358)}${cinta(672)}
        <rect x="${X0 - 4}" y="${CORT.yT - 10}" width="${2 * CORT.R + 8}" height="60" fill="#2A1A0E" opacity=".22"/>
        <rect x="${X1 - 60}" y="${CORT.yT - 10}" width="64" height="420" fill="#2A1A0E" opacity=".18"/>
      </g>
      <path d="${FRENTE_D}" fill="none" stroke="#3A2414" stroke-width="2.6"/>
      <ellipse cx="${x}" cy="${y}" rx="${rx + 3}" ry="${ry + 3}" fill="none" stroke="#C47A4E" stroke-width="8"/>
      <ellipse cx="${x}" cy="${y}" rx="${rx + 7}" ry="${ry + 7}" fill="none" stroke="#3A2014" stroke-width="2.4"/>
      <ellipse cx="${x}" cy="${y}" rx="${rx - 1}" ry="${ry - 1}" fill="none" stroke="#5A3018" stroke-width="2"/>
      <path d="M${x - rx + 6},${y - 40} A${rx + 3},${ry + 3} 0 0,1 ${x - 20},${y - ry - 2}" stroke="#E6A47A" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="M${x - 8},${y + ry + 1} C${x + 6},${y + ry - 4} ${x + 24},${y + ry - 4} ${x + 44},${y + ry} C${x + 54},${y + ry + 4} ${x + 50},${y + ry + 12} ${x + 40},${y + ry + 10} C${x + 34},${y + ry + 16} ${x + 26},${y + ry + 10} ${x + 18},${y + ry + 9} C${x + 6},${y + ry + 10} ${x - 6},${y + ry + 8} ${x - 8},${y + ry + 1}Z" fill="url(#abelha-mel)" stroke="#A86A0C" stroke-width="1.2"/>
      <path d="M${x + 4},${y + ry + 2} C${x + 14},${y + ry - 1} ${x + 26},${y + ry - 1} ${x + 36},${y + ry + 1}" stroke="#FFF2B0" stroke-width="2" fill="none" stroke-linecap="round" opacity=".85"/>
      <g class="ab-gotaMel"><path d="M0,-1.2 C.6,-.2 1,.3 1,.7 C1,1.3 .5,1.7 0,1.7 C-.5,1.7 -1,1.3 -1,.7 C-1,.3 -.6,-.2 0,-1.2 Z" fill="url(#abelha-mel)"/><circle cx="-.35" cy=".7" r=".28" fill="#FFF6C8" opacity=".9"/></g>
      <ellipse class="ab-salpico" rx="1" ry="1" fill="#F2AE24" opacity="0"/>
      <g class="ab-tampa"><g>
        <path d="M${tx - tR},${ty} A${tR},${tRy} 0 0,0 ${tx + tR},${ty} L${tx + tR},${ty + 18} A${tR},${tRy} 0 0,1 ${tx - tR},${ty + 18} Z" fill="#7A5A40" stroke="#3A2414" stroke-width="2"/>
        <path d="M${tx - tR + 20},${ty + 24} A${tR},${tRy} 0 0,0 ${tx + 40},${ty + tRy + 16}" stroke="#A8845E" stroke-width="2" fill="none" opacity=".6"/>
        <ellipse cx="${tx}" cy="${ty}" rx="${tR}" ry="${tRy}" fill="url(#abelha-tampa)" stroke="#3A2414" stroke-width="2"/>
        <ellipse cx="${tx}" cy="${ty}" rx="${tR - 30}" ry="${tRy - 7}" fill="none" stroke="#8A6648" stroke-width="1.6" opacity=".5"/>
        <ellipse cx="${tx}" cy="${ty}" rx="${tR - 70}" ry="${tRy - 16}" fill="none" stroke="#8A6648" stroke-width="1.4" opacity=".4"/>
        <path d="M${tx - 150},${ty + 8} q8,-4 18,0 M${tx + 120},${ty + 14} q10,-4 20,0" stroke="#6E8A44" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="${tx + 4}" cy="${ty + 6}" rx="70" ry="14" fill="#3A2414" opacity=".25"/>
        <path d="M${tx - 66},${ty + 2} C${tx - 70},${ty - 16} ${tx - 40},${ty - 30} ${tx},${ty - 30} C${tx + 40},${ty - 32} ${tx + 72},${ty - 18} ${tx + 66},${ty} C${tx + 40},${ty + 12} ${tx - 40},${ty + 12} ${tx - 66},${ty + 2}Z" fill="url(#abelha-pedra)" stroke="#4A463E" stroke-width="2"/>
        <path d="M${tx - 50},${ty - 12} C${tx - 30},${ty - 24} ${tx + 10},${ty - 26} ${tx + 30},${ty - 22}" stroke="#F0ECE4" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
        <path d="M${tx - 66},${ty + 2} C${tx - 40},${ty - 4} ${tx + 30},${ty - 4} ${tx + 66},${ty}" stroke="#6A665E" stroke-width="1.4" fill="none" opacity=".6"/>
      </g></g>`;
  }
  /* --- malmequer grande (onde a abelha pousa): o caule e a cabeça mexem-se a cada quadro --- */
  function petalaD(a, r0, r1, w, sy) {
    const ca = Math.cos(a), sa = Math.sin(a), px = -sa * w, py = ca * w;
    const b = [r0 * ca, r0 * sa], t = [r1 * ca, r1 * sa], m = [(b[0] + t[0]) / 2, (b[1] + t[1]) / 2];
    const P = (x, y) => `${n(x)},${n(y * sy)}`;
    return `M${P(b[0], b[1])} Q${P(m[0] + px, m[1] + py)} ${P(t[0], t[1])} Q${P(m[0] - px, m[1] - py)} ${P(b[0], b[1])}Z`;
  }
  function florSVG() {
    let pt = '', pf = '', pontos = '';
    for (let i = 0; i < 18; i++) { const a = i / 18 * 2 * PI + .1, d = petalaD(a, 12, 60, 9.5, .42); if (Math.sin(a) < 0) pt += d; else pf += d; }
    const r = semente(71);
    for (let i = 0; i < 26; i++) { const a = r() * 2 * PI, d = Math.sqrt(r()); pontos += circ(Math.cos(a) * 17 * d, Math.sin(a) * 7 * d - 2, 1.5); }
    return `<g class="ab-flor">
      <path d="M802,904 C780,880 770,870 752,872 C764,860 784,866 800,886 Z M806,880 C822,856 842,852 856,858 C842,862 826,870 808,892 Z" fill="#5E9A3A" stroke="#2E5A1E" stroke-width="1.2"/>
      <path class="ab-florCaule" fill="none" stroke="#3E7A2A" stroke-width="7" stroke-linecap="round"/>
      <path class="ab-florCauleL" fill="none" stroke="#9ACC64" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
      <g class="ab-florCab">
        <ellipse cx="0" cy="10" rx="20" ry="8" fill="#4E8A30"/>
        <path d="${pt}" fill="#E6E0EC" stroke="#B0A8C0" stroke-width="1.2"/>
        <path d="${pf}" fill="url(#abelha-petala)" stroke="#B0A8C0" stroke-width="1.2"/>
        <ellipse cx="0" cy="2" rx="24" ry="12" fill="#C88A12"/>
        <ellipse cx="0" cy="-1" rx="22" ry="10" fill="url(#abelha-miolo)" stroke="#B87A10" stroke-width="1.4"/>
        <path d="${pontos}" fill="#D8941A"/>
        <ellipse cx="-7" cy="-5" rx="8" ry="3" fill="#FFF6C0" opacity=".7"/>
      </g>
    </g>`;
  }
  /* --- primeiro plano: tufos de erva, papoilas, rosmaninho e o botão de papoila (que abre no acontecimento raro) --- */
  function primeiroPlanoSVG() {
    const r = semente(55);
    let t1 = '', t2 = '', t3 = '', mm = '', mc = '';
    for (let i = 0; i < 90; i++) {
      const x = r() * 1640 - 20, y = 872 + r() * 40, hh = 22 + r() * 30, inc = -8 + r() * 16;
      const d = `M${n(x - 3)},${n(y)} Q${n(x + inc * .4)},${n(y - hh * .6)} ${n(x + inc)},${n(y - hh)} Q${n(x + inc * .3 + 2)},${n(y - hh * .55)} ${n(x + 3)},${n(y)} Z`;
      const k = i % 3; if (k === 0) t1 += d; else if (k === 1) t2 += d; else t3 += d;
    }
    for (let i = 0; i < 9; i++) {
      const x = 40 + r() * 1540, y = 846 + r() * 40; if (x > 700 && x < 860) continue;
      for (let a = 0; a < 360; a += 30) mm += elip(x + Math.cos(a * RAD) * 7, y + Math.sin(a * RAD) * 3.6, 5, 2.2);
      mc += circ(x, y, 3);
    }
    return `${papoilaSVG('ab-pap0', 130, 904, 1.15, 118)}${papoilaSVG('ab-pap1', 1214, 910, 1.2, 104)}${papoilaSVG('ab-pap2', 1470, 902, 1, 132)}
      ${papoilaSVG('ab-pap3', 330, 906, 1.05, 122, true)}
      ${rosmaninhoSVG('ab-ros1', 1350, 908, 1.15, 83, 6, 96)}${rosmaninhoSVG('ab-ros2', 50, 912, 1.05, 89, 5, 90)}
      <path d="${mm}" fill="#FFFFFF" stroke="#D0CCE0" stroke-width=".6"/><path d="${mc}" fill="#F6C624"/>
      <path d="${t1}" fill="#4E8A2E"/><path d="${t2}" fill="#6EA840"/><path d="${t3}" fill="#3E7A26"/>`;
  }
  /* --- bichos e partículas: borboleta, outra abelha ao longe, pólen, brilhos no ar --- */
  function bichosSVG() {
    const asaB = sg => `<path d="M0,-2 C${sg * 8},-26 ${sg * 30},-30 ${sg * 32},-14 C${sg * 34},-6 ${sg * 20},0 0,2 Z" fill="#FFE860" stroke="#B89A20" stroke-width="1.3"/>
      <path d="M${sg * 4},-6 C${sg * 12},-18 ${sg * 22},-20 ${sg * 24},-12 C${sg * 20},-8 ${sg * 12},-6 ${sg * 4},-6Z" fill="#FF9A2E" opacity=".9"/>
      <path d="M0,2 C${sg * 16},2 ${sg * 26},10 ${sg * 18},22 C${sg * 12},26 ${sg * 4},16 0,4 Z" fill="#F6DC50" stroke="#B89A20" stroke-width="1.3"/>`;
    const poeira = Array.from({ length: 16 }, (_, i) => `<circle class="ab-po${i}" r="1" fill="${i % 3 ? '#FFD84A' : '#FFF0A0'}" opacity="0"/>`).join('');
    const brilhos = Array.from({ length: 6 }, (_, i) => `<circle class="ab-bri${i}" r="2.4" fill="#FFFDE8" opacity="0"/>`).join('');
    return `<g class="ab-borboleta" display="none"><g class="ab-borbIn">
        <g class="ab-borbAsas">${asaB(-1)}${asaB(1)}</g>
        <ellipse cx="0" cy="2" rx="2.4" ry="10" fill="#4A4030"/><circle cx="0" cy="-9" r="3" fill="#4A4030"/>
        <path d="M-1,-11 C-4,-18 -6,-20 -9,-21 M1,-11 C4,-18 6,-20 9,-21" stroke="#4A4030" stroke-width="1.2" fill="none"/>
      </g></g>
      <g class="ab-outra" display="none"><g transform="scale(.42)">
        <g class="ab-outraAsas" fill="#F2FAFF" stroke="#8AA0BC" stroke-width="2" opacity=".85"><ellipse cx="-4" cy="-22" rx="12" ry="22" transform="rotate(-24,-4,-22)"/><ellipse cx="10" cy="-20" rx="10" ry="18" transform="rotate(22,10,-20)"/></g>
        <ellipse cx="-12" cy="0" rx="30" ry="22" fill="#FFD23A" stroke="${COR.cont}" stroke-width="3"/>
        <path d="M-24,-20 C-30,-6 -30,6 -24,20 M-8,-22 C-14,-8 -14,8 -8,22" stroke="${COR.risca}" stroke-width="8" fill="none"/>
        <circle cx="22" cy="-4" r="18" fill="#FFE066" stroke="${COR.cont}" stroke-width="3"/><circle cx="28" cy="-7" r="5" fill="${COR.cont}"/><circle cx="29.5" cy="-8.5" r="1.8" fill="#FFF"/>
        <path d="M18,-20 C16,-32 10,-38 4,-40 M28,-20 C32,-32 38,-36 44,-36" stroke="${COR.cont}" stroke-width="3" fill="none"/><circle cx="4" cy="-40" r="4" fill="${COR.cont}"/><circle cx="44" cy="-36" r="4" fill="${COR.cont}"/>
      </g></g>
      <g class="ab-poeira" pointer-events="none">${poeira}</g><g class="ab-brilhos" pointer-events="none">${brilhos}</g>`;
  }

  /* ================= 5) montar() ================= */
  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .4 : 1;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.innerHTML = `<defs>${defsAbelha()}${defsCena()}</defs>
      ${ceuSVG()}${longeSVG()}${pradoSVG()}${sobreirosSVG()}
      ${estevaSVG(1250, 640, 220, 60, 47)}${estevaSVG(250, 680, 150, 50, 53)}
      ${rosmaninhoSVG('ab-ros0', 476, 768, 1.05, 77, 7, 130)}
      ${muroSVG()}
      <g class="ab-habitat"><rect x="${X0 - 20}" y="${CORT.yT - 70}" width="${2 * CORT.R + 40}" height="${CORT.yB - CORT.yT + 110}" fill="#000" fill-opacity="0"/>
        <g class="ab-cortT"><g>${corticoTrasSVG()}</g></g>
        <g class="ab-slotDentro" clip-path="url(#abelha-clip-cortico)"></g>
        <ellipse class="ab-escuroU" cx="${PORTA.x}" cy="${PORTA.y}" rx="${PORTA.rx + 6}" ry="${PORTA.ry + 6}" fill="#1A0C06" opacity="0"/>
        <ellipse class="ab-escuroV" cx="${PORTA.x}" cy="${PORTA.y}" rx="${PORTA.rx + 6}" ry="${PORTA.ry + 6}" fill="url(#abelha-escuroV)" opacity="0"/>
        <g class="ab-cortF"><g>${corticoFrenteSVG()}</g></g>
      </g>
      ${florSVG()}
      <g class="ab-slotFora">${abelhaSVG()}</g>
      ${primeiroPlanoSVG()}${bichosSVG()}
      <rect width="1600" height="900" fill="url(#abelha-vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s);
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; el.setAttribute(nome, v); } }
    const ld = f => ({ E: f('E'), D: f('D') });

    /* --- referências --- */
    const RP = {};
    for (const nm of ['torax', 'gola', 'abd', 'cabeca']) RP[nm] = { c: q(`.ab-${nm}-c`), e: q(`.ab-${nm}-e`), l: q(`.ab-${nm}-l`), o: nm === 'gola' ? 2 : 3 };
    const GRUPOS = ['maos', 'asaE', 'asaD', 'pernasE', 'pernasD', 'bracoE', 'bracoD', 'antE', 'antD', 'abd', 'ferrao', 'torax', 'gola', 'cabeca'];
    const R = {
      abelha: q('.ab-abelha'), sombra: q('.ab-sombra'), toque: q('.ab-toque'), partes: q('.ab-partes'),
      grupos: Object.fromEntries(GRUPOS.map(g => [g, q('.ab-g-' + g)])),
      pernas: Object.fromEntries(['pernasE', 'pernasD', 'bracoE', 'bracoD'].map(g => [g, { c: q(`.ab-${g}-c`), e: q(`.ab-${g}-e`), l: q(`.ab-${g}-l`), p: q(`.ab-${g}-p`), pol: q(`.ab-${g}-pol`) }])),
      fant: ld(L => [0, 1].map(k => ({ g: q(`.ab-fant${k}${L}`), f: q(`.ab-asaF${k}${L}`), t: q(`.ab-asaT${k}${L}`) }))),
      antC: ld(L => q(`.ab-ant${L}-c`)), antE: ld(L => q(`.ab-ant${L}-e`)), bola: ld(L => q('.ab-bola' + L)),
      maosC: q('.ab-maos-c'), maosE: q('.ab-maos-e'), maosL: q('.ab-maos-l'),
      clipA: q('.ab-clipA'), clipH: q('.ab-clipH'), riscas: q('.ab-riscas'), ponta: q('.ab-ponta-e'), ferrao: q('.ab-ferrao'), pelos: q('.ab-pelos'),
      tufo: q('.ab-tufo'), boch: [0, 1].map(i => q('.ab-boch' + i)), boca: q('.ab-boca'), bocaA: q('.ab-bocaA'), bocaL: q('.ab-bocaL'), lingua: q('.ab-lingua'),
      olho: ld(L => q('.ab-olho' + L)), iris: ld(L => q('.ab-iris' + L)), palpS: ld(L => q('.ab-palpS' + L)), palpI: ld(L => q('.ab-palpI' + L)),
      orla: ld(L => q('.ab-orla' + L)), orlaI: ld(L => q('.ab-orlaI' + L)),
      habitat: q('.ab-habitat'), slotDentro: q('.ab-slotDentro'), slotFora: q('.ab-slotFora'), escU: q('.ab-escuroU'), escV: q('.ab-escuroV'),
      cortT: q('.ab-cortT > g'), cortF: q('.ab-cortF > g'), tampa: q('.ab-tampa > g'), gotaMel: q('.ab-gotaMel'), salpico: q('.ab-salpico'),
      flor: q('.ab-flor'), florCab: q('.ab-florCab'), florCaule: q('.ab-florCaule'), florCauleL: q('.ab-florCauleL'),
      nuvens: NUV.map((c, i) => q('.ab-nuvem' + i)), aura: q('.ab-solAura'), cegonha: q('.ab-cegonha'), cegAsa: q('.ab-cegAsa'), cegAsaL: q('.ab-cegAsaL'),
      copas: ['ab-copa0', 'ab-copa1', 'ab-copa2'].map(c => { const g = q('.' + c); return { g: g.firstElementChild, x: +g.getAttribute('data-cx'), y: +g.getAttribute('data-cy') }; }),
      balancos: ['.ab-ros0', '.ab-ros1', '.ab-ros2', '.ab-pap0', '.ab-pap1', '.ab-pap2', '.ab-pap3'].map(s => q(s + ' > g')),
      botao: q('.ab-botao'), botaoIn: q('.ab-botaoIn'), botaoFlor: q('.ab-botaoFlor'),
      borb: q('.ab-borboleta'), borbAsas: q('.ab-borbAsas'), outra: q('.ab-outra'), outraAsas: q('.ab-outraAsas'),
      poeira: Array.from({ length: 16 }, (_, i) => q('.ab-po' + i)), brilhos: Array.from({ length: 6 }, (_, i) => q('.ab-bri' + i))
    };

    /* --- estado --- */
    const P = Object.assign({ x: REPOUSO.x, y: REPOUSO.y, h: REPOUSO.h, salto: 0, somB: 0, somH: 0, polen: 0, florX: FLOR.x, florY: FLOR.y, _acF: 0, _ef: 0 }, BASE, ROSTO);
    let modo = 'fora';                    // 'fora' | 'indo' | 'dentro' | 'voltando'
    let apoio = 'ar';                     // 'ar' | 'flor' | 'dentro'
    let reagindo = false, tempo = 0, vivo = true, dtUlt = 16.7, G = null;
    const fase = { fl: 0, resp: 0 };
    const mov = { x: P.x, y: P.y, vx: 0, vy: 0 };
    const antM = { E: { a: 0, v: 0, b: 0, vb: 0 }, D: { a: 0, v: 0, b: 0, vb: 0 } };
    const asaJ = { j: 1 };
    const somE = { vib: 0 };
    const flor = { s: 0, v: 0 }, pouso = { dx: 0 };
    const cort = { a: 0, v: 0 }, tampa = { y: 0, v: 0 };
    const esc = { u: 0, v: 0 };
    const boing = (L, f) => { antM[L].v += f; };

    /* --- desenhar --- */
    const tfE = e => `translate(${n(e.x)},${n(e.y)}) rotate(${n(e.ang)}) scale(${n(e.rx)},${n(e.ry)})`;
    function aplica(r, e) {
      const t = `translate(${n(e.x)},${n(e.y)}) rotate(${n(e.ang)})`;
      poe(r.e, `${t} scale(${n(e.rx)},${n(e.ry)})`);
      if (r.c) poe(r.c, `${t} scale(${n(e.rx + r.o)},${n(e.ry + r.o)})`);
      if (r.l) { const [ox, oy] = luzOff(e, .3); poe(r.l, `translate(${n(e.x + ox)},${n(e.y + oy)}) rotate(${n(e.ang)}) scale(${n(e.rx * .62)},${n(e.ry * .62)})`); }
    }
    const pt = p => `${n(p[0])},${n(p[1])}`;
    let ordemAtual = '';
    function desenharPernas(nm, lst, polen) {
      const r = R.pernas[nm];
      let d = '', l = '', pes = '';
      for (const p of lst) { d += `M${pt(p.r)}L${pt(p.j)}L${pt(p.e)}`; l += `M${n(p.r[0] - 1)},${n(p.r[1] - 1.5)}L${n(p.j[0] - 1)},${n(p.j[1] - 1.5)}`; pes += circ(p.e[0], p.e[1], 4.6); }
      atr(r.c, 'd', d); atr(r.e, 'd', d); atr(r.l, 'd', l); atr(r.p, 'd', pes);
      if (r.pol) {
        const vis = polen > .04;
        atr(r.pol, 'display', vis ? 'inline' : 'none');
        if (vis) { const p = lst[lst.length - 1], m = [lerp(p.j[0], p.e[0], .45), lerp(p.j[1], p.e[1], .45)]; poe(r.pol, `translate(${pt(m)}) scale(${n((3 + 10 * polen) * ESC)})`); }
      }
    }
    function desenhar() {
      G = geometria(P);
      for (const nm in RP) aplica(RP[nm], G.el[nm]);
      poe(R.clipA, tfE(G.el.abd));
      const hc = G.el.cabeca; poe(R.clipH, `translate(${n(hc.x)},${n(hc.y)}) rotate(${n(hc.ang)}) scale(${n(hc.rx * .99)},${n(hc.ry * .99)})`);
      atr(R.riscas, 'd', G.riscas); poe(R.ponta, tfE(G.el.ponta)); atr(R.ponta, 'opacity', G.opPonta);
      poe(R.ferrao, G.ferrao); atr(R.pelos, 'd', G.pelos || 'M0,0');
      poe(R.tufo, G.tufo);
      // asas: duas poses fantasma por lado
      for (const [L] of LADOS) {
        const a = G.asa[L];
        R.fant[L].forEach((f, k) => {
          const op = k ? a.op1 : a.op0;
          atr(f.g, 'display', op > .02 ? 'inline' : 'none');
          if (op <= .02) return;
          atr(f.g, 'opacity', op); poe(f.f, a.fant[k].f); poe(f.t, a.fant[k].t);
        });
      }
      // patas
      desenharPernas('pernasE', G.perna.E.slice(1), P.polen); desenharPernas('pernasD', G.perna.D.slice(1), P.polen);
      desenharPernas('bracoE', G.perna.E.slice(0, 1)); desenharPernas('bracoD', G.perna.D.slice(0, 1));
      const comMaos = (P.acB || 0) > .5;
      atr(R.grupos.maos, 'display', comMaos ? 'inline' : 'none');
      if (comMaos) {
        let c = '', e = '', l = '';
        for (const [L] of LADOS) { const p = G.perna[L][0].e; c += elip(p[0], p[1] - 2, 11, 9); e += elip(p[0], p[1] - 2, 8.6, 6.8); l += elip(p[0] - 2.4, p[1] - 5, 3.4, 2.2); }
        atr(R.maosC, 'd', c); atr(R.maosE, 'd', e); atr(R.maosL, 'd', l);
      }
      // antenas
      for (const [L] of LADOS) {
        const g = G.ant[L], cx = 2 * g.j[0] - (g.a[0] + g.t[0]) / 2, cy = 2 * g.j[1] - (g.a[1] + g.t[1]) / 2;
        const d = `M${pt(g.a)}Q${n(cx)},${n(cy)} ${pt(g.t)}`;
        atr(R.antC[L], 'd', d); atr(R.antE[L], 'd', d);
        poe(R.bola[L], `translate(${pt(g.t)}) scale(${n3(P.olhosEsc || 1)})`);
      }
      // cara
      G.boch.forEach((m, i) => { poe(R.boch[i], tfE(m)); atr(R.boch[i], 'opacity', n3(.6 * limita((m.vis - .1) / .25, 0, 1))); });
      atr(R.boca, 'display', G.boca.vis > 0 ? 'inline' : 'none');
      if (G.boca.vis > 0) {
        poe(R.boca, G.boca.m);
        const b = bocaD(limita(Math.max(P.boca, P.somB), 0, 1), P.feliz, P.lingua);
        atr(R.bocaL, 'd', b.linha); atr(R.bocaA, 'd', b.aberta); atr(R.lingua, 'd', b.lingua);
      }
      desenharOlhos();
      // ordem por profundidade
      const ordem = Object.keys(G.z).sort((a, b) => G.z[a] - G.z[b]), ch = ordem.join();
      if (ch !== ordemAtual) { ordemAtual = ch; for (const g of ordem) R.partes.appendChild(R.grupos[g]); }
      // sombra no chão (no prado ou no topo do muro) e a zona de toque
      const chaoY = P.x > 700 ? 724 : 776, alt = chaoY - P.y, k = limita(1.15 - alt / 600, .35, 1);
      poe(R.sombra, `translate(${n(P.x + 14)},${chaoY}) scale(${n(96 * k)},${n(13 * k)})`);
      atr(R.sombra, 'opacity', apoio === 'ar' ? n3(.95 * k) : '0');
      const t = G.el.torax; poe(R.toque, `translate(${n(t.x)},${n(t.y - 10)})`);
      atr(R.toque, 'r', apoio === 'dentro' ? '110' : '150');
    }
    function camada(onde) { const alvo = onde === 'dentro' ? R.slotDentro : R.slotFora; if (R.abelha.parentNode !== alvo) alvo.appendChild(R.abelha); }

    /* --- olhos: íris que segue um alvo, pálpebra que desce, olhos contentes --- */
    const olhar = { foco: null, livre: null, t: 0, g: { E: null, D: null } };
    const focar = f => { olhar.foco = f; };
    let piscaV = 0;
    const pisca = { t: aleat(1500, 3500), f: -1, duplo: false };
    function desenharOlhos() {
      const kO = 1 - Math.exp(-dtUlt / 60);
      for (const [L] of LADOS) {
        const o = G.olho[L];
        const vis = o.vis > .05;
        atr(R.olho[L], 'display', vis ? 'inline' : 'none');
        if (!vis) continue;
        poe(R.olho[L], o.m);
        let alvo;
        if (olhar.foco) { const f = olhar.foco(); alvo = vn([f[0] - o.x, -(f[1] - o.y) / cE, 300]); }
        else alvo = vn(vs(vk(G.H.f, .75), vs(vk(VISTA, .6), olhar.livre || [0, 0, 0])));
        olhar.g[L] = olhar.g[L] ? vn(vlerp(olhar.g[L], alvo, kO)) : alvo;
        const g = olhar.g[L];
        let t1 = o.t1, t2 = o.t2;
        if (pd(t1)[0] < 0) t1 = vk(t1, -1);
        if (pd(t2)[1] < 0) t2 = vk(t2, -1);
        let ox = vp(g, t1) * RO * .42, oy = vp(g, t2) * RO * .42;
        const m = Math.hypot(ox, oy), mx = RO * .3; if (m > mx) { ox *= mx / m; oy *= mx / m; }
        poe(R.iris[L], `translate(${n(ox)},${n(oy)})`);
        const fecho = limita(1 - P['ab' + L] + piscaV, 0, 1);
        const pl = palpebras(fecho, P.feliz);
        atr(R.palpS[L], 'd', pl.sup); atr(R.orla[L], 'd', pl.orla);
        atr(R.palpI[L], 'd', pl.inf); atr(R.orlaI[L], 'd', pl.orlaI);
      }
    }
    function atualizarPiscar(dt) {
      if (pisca.f < 0) {
        pisca.t -= dt; piscaV = 0;
        if (pisca.t <= 0) { pisca.f = 0; pisca.duplo = !pisca.duplo && Math.random() < .3; }
        return;
      }
      pisca.f += dt;
      const u = pisca.f / 210;
      piscaV = u < .4 ? esai(u / .4) : 1 - eseno(limita((u - .4) / .6, 0, 1));
      if (u >= 1) { piscaV = 0; pisca.f = -1; pisca.t = pisca.duplo ? 140 : aleat(2000, 6000); }
    }
    function atualizarOlharLivre(dt) {
      olhar.t -= dt;
      if (olhar.t > 0) return;
      olhar.t = aleat(800, 2400);
      const r = Math.random();
      if (r < .4) olhar.livre = [0, 0, 2];
      else if (r < .6) olhar.livre = null;
      else olhar.livre = [aleat(-.7, .7), aleat(-.3, .5), 0];
    }

    /* --- partículas: pólen (sobe e cai devagar) --- */
    const poeira = R.poeira.map(el => ({ el, vivo: false }));
    function soltarPolen(x, y, quantos, forca) {
      for (let i = 0; i < quantos; i++) {
        const p = poeira.find(p => !p.vivo); if (!p) return;
        const a = aleat(-PI, 0), v = aleat(.4, 1) * (forca || 80);
        Object.assign(p, { x: x + aleat(-14, 14), y: y + aleat(-6, 6), vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, vida: aleat(900, 1600), r: aleat(2, 3.8), vivo: true });
      }
    }
    function atualizarPoeira(dt) {
      const s = dt / 1000;
      for (const p of poeira) {
        if (!p.vivo) continue;
        p.t += dt; p.vy += 40 * s; p.vx *= Math.exp(-s * 2); p.vy *= Math.exp(-s * 1.2);
        p.x += p.vx * s; p.y += p.vy * s;
        const u = p.t / p.vida;
        if (u >= 1) { p.vivo = false; atr(p.el, 'opacity', '0'); continue; }
        poe(p.el, `translate(${n(p.x)},${n(p.y)}) scale(${n(p.r)})`); atr(p.el, 'opacity', n3(.95 * (1 - u * u)));
      }
    }

    /* --- tarefas: geradores que avançam com o dt do relógio (uma por faixa; lançar outra na mesma faixa substitui) --- */
    const faixas = new Map();
    function lancar(nome, gen, fim) { if (!vivo) return; faixas.set(nome, { g: gen, fim }); avancarF(nome, 0); }
    function avancarF(nome, dt) {
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

    /* --- voar em arco: a cabeça vira primeiro, depois o corpo; a inclinação vem da velocidade (atualizarExtras) --- */
    function* voar(x1, y1, h1, ms, arco) {
      const x0 = P.x, y0 = P.y, h0 = P.h, dh = h1 - h0, hY0 = P.hY;
      yield* durante(ms, u => {
        const e = eseno(u);
        P.x = lerp(x0, x1, e); P.y = lerp(y0, y1, e) - arco * sino(u);
        const uh = eio(limita(u * 1.6, 0, 1)), uc = eio(limita(u * 1.3 - .3, 0, 1));
        P.h = h0 + dh * uc;
        P.hY = lerp(hY0, 0, uh) + limita(dh * (uc - uh), -55, 55);
      });
      P.h = h1;
    }
    function* virar(h1, ms) {
      const h0 = P.h, dh = h1 - h0, hY0 = P.hY;
      yield* durante(ms, u => {
        const uh = eio(limita(u * 1.6, 0, 1)), uc = eio(limita(u * 1.3 - .3, 0, 1));
        P.h = h0 + dh * uc; P.hY = lerp(hY0, 0, uh) + limita(dh * (uc - uh), -55, 55);
      });
      P.h = h1;
    }
    const tempoVoo = (x, y) => limita(420 + Math.hypot(x - P.x, y - P.y) * 1.5, 500, 1200);

    /* --- extras de cada quadro: flutuar, respirar, inclinar com a velocidade, antenas com mola, asas, flor, cortiço --- */
    function atualizarExtras(dt) {
      const t = tempo / 1000, s = Math.max(.001, Math.min(dt, 34) / 1000);
      const noAr = apoio === 'ar';
      fase.fl += s * 2 * PI * .55;
      fase.resp += s * 2 * PI * (apoio === 'dentro' ? .4 : .5);
      P._fl = noAr ? 7 * Math.sin(fase.fl) * calma : 0;
      P._pb = noAr ? 2.4 * Math.sin(fase.fl - .9) : 0;
      P._resp = Math.sin(fase.resp);
      P._ay = 3 * Math.sin(t * 1.7) * calma;
      P._ap = noAr ? 2.4 * Math.sin(fase.fl + 1.2) : 1.5 * P._resp;
      // inclinação pela velocidade (só no ar): inclina para a frente quando avança, deita-se para o lado nas curvas
      const vxI = (P.x - mov.x) / s, vyI = (P.y - mov.y) / s; mov.x = P.x; mov.y = P.y;
      const kv = 1 - Math.exp(-dt / 140), vx0 = mov.vx, vy0 = mov.vy;
      mov.vx += ((noAr ? limita(vxI, -900, 900) : 0) - mov.vx) * kv; mov.vy += ((noAr ? limita(vyI, -900, 900) : 0) - mov.vy) * kv;
      const hh = P.h * RAD, fr = mov.vx * Math.sin(hh), lado = -mov.vx * Math.cos(hh);
      P._pv = limita(-fr / 20 - mov.vy / 45, -20, 16);
      P._rv = limita(lado / 28, -16, 16);
      // antenas: mola com «onda» (a ponta atrasa-se em relação à base), empurradas pela aceleração
      const ay = (mov.vy - vy0) / s, ax = (mov.vx - vx0) / s;
      for (const [L, sg] of LADOS) {
        const m = antM[L];
        const alvo = 3.5 * Math.sin(t * 1.4 + sg) * calma;
        m.v += ((alvo - m.a) * 150 - m.v * 7) * s + limita(ay / 60 + sg * ax / 120, -40, 40);
        m.a += m.v * s; m.a = limita(m.a, -45, 45);
        m.vb += ((m.a - m.b) * 80 - m.vb * 6) * s; m.b += m.vb * s;
        P['_aa' + L] = m.a; P['_ab' + L] = (m.b - m.a) * 1.4;
      }
      // asas: as duas poses fantasma trocam de lugar a cada quadro
      asaJ.j = -asaJ.j; P._wj = asaJ.j * aleat(.75, 1);
      P._ps = (P._ps || 0) + s * 2.6;
      // zumbido: vibração pequenina
      P._som = somE.vib;
      if (somE.vib > .01) { P._vx = (Math.random() - .5) * 3 * somE.vib; P._vy = (Math.random() - .5) * 3 * somE.vib; } else P._vx = P._vy = 0;
      // flor: mola (verga quando a abelha pousa), e o vento
      const peso = apoio === 'flor' ? 12 + (P.ag || 0) : 0;
      flor.v += ((peso - flor.s) * 160 - flor.v * 7) * s; flor.s += flor.v * s;
      const vF = apoio === 'flor' ? 0 : 3 * Math.sin(t * 1.1) * calma;
      P.florX = FLOR.x + flor.s * .3 + vF; P.florY = FLOR.y + flor.s;
      if (apoio === 'flor') { P.x = P.florX + pouso.dx; P.y = P.florY - ALT_FLOR + (P.ag || 0); }
      // cortiço e tampa: molas (abanam quando a abelha chega)
      cort.v += (-cort.a * 220 - cort.v * 5) * s; cort.a += cort.v * s;
      tampa.v += (-tampa.y * 320 - tampa.v * 8) * s; tampa.y += tampa.v * s;
    }

    /* --- arrumar e recompor --- */
    const normRoll = () => { P.cR = ((P.cR + 180) % 360 + 360) % 360 - 180; };
    function* arrumar(ms, base) {
      const b = base || BASE, alvo = { boca: 0, feliz: 0, abE: 1, abD: 1, olhosEsc: 1, lingua: 0 };
      normRoll();
      for (const k of CHAVES) if (Math.abs(P[k] - b[k]) > .3) alvo[k] = b[k];
      yield* tw(alvo, ms, eio);
    }
    function* descolar() {                           // agacha-se na flor (verga), zumbe e levanta voo
      yield* tw({ ag: 10, zum: 1, wA: 1, wB: 40, esf: 0, cR: 0, hP: 0 }, 200, eio);
      const y0 = P.y;
      apoio = 'ar'; flor.v -= 60;
      yield* juntos(tw({ pf: 0, ag: 0, enc: .3 }, 320), durante(380, u => { P.y = y0 - 70 * esai(u); }));
      yield* tw({ enc: 0 }, 200);
    }
    function* recompor() {
      if (apoio === 'flor') yield* descolar();
      P.salto = 0; normRoll();
      const dif = {}; let ha = false;
      for (const k of CHAVES) if (Math.abs(P[k] - BASE[k]) > .3) { dif[k] = BASE[k]; ha = true; }
      const longe = Math.hypot(P.x - REPOUSO.x, P.y - REPOUSO.y) > 4 || Math.abs(P.h - REPOUSO.h) > 3;
      if (longe) delete dif.hY;
      const gs = [];
      if (ha) gs.push(tw(dif, 300));
      if (longe) { const d = Math.hypot(P.x - REPOUSO.x, P.y - REPOUSO.y); gs.push(voar(REPOUSO.x, REPOUSO.y, REPOUSO.h, tempoVoo(REPOUSO.x, REPOUSO.y), Math.min(40, d * .2))); }
      yield* juntos(...gs);
    }
    // espera «viva»: olha à volta, mexe as antenas, deriva um bocadinho no ar
    function* esperaViva(ms) {
      let t = 0, prox = aleat(600, 1500), sub = null;
      while (t < ms) {
        const dt = yield; t += dt; prox -= dt;
        if (sub && sub.next(dt).done) sub = null;
        if (prox <= 0 && !sub) {
          prox = aleat(900, 2200);
          const r = Math.random();
          if (r < .45) sub = tw({ hY: aleat(-35, 35), hP: aleat(-8, 12), hR: aleat(-10, 10) }, 300, eio);
          else if (r < .7) boing(escolhe(['E', 'D']), aleat(150, 320));
          else if (apoio === 'ar') { const x0 = P.x, y0 = P.y, dx = aleat(-30, 30), dy = aleat(-18, 18); sub = durante(900, u => { const e = sino(u); P.x = x0 + dx * e; P.y = y0 + dy * e; }); }
        }
      }
      if (sub) while (!sub.next(16).done);
    }

    /* --- comportamentos no ar --- */
    function* polen() {                              // voa até ao malmequer, pousa (a flor verga), recolhe pólen e volta
      focar(() => [P.florX, P.florY]);
      yield* voar(P.florX - 18, P.florY - ALT_FLOR - 80, 34, tempoVoo(P.florX - 18, P.florY - 170), 40);
      const x0 = P.x, y0 = P.y;
      yield* juntos(tw({ pf: 1, enc: 0, cP: 8 }, 560, eio), durante(560, u => { const e = eio(u); P.x = lerp(x0, P.florX - 18, e); P.y = lerp(y0, P.florY - ALT_FLOR, e); }));
      apoio = 'flor'; pouso.dx = P.x - P.florX; P.ag = 0; flor.v += 160;
      yield* tw({ zum: 0, wA: .82, wB: 64, cP: 4 }, 220);
      focar(null);
      yield* tw({ hP: -26, hy: -10, feliz: .6, abE: .85, abD: .85 }, 260);
      let ult = 0;
      const p0 = P.polen;
      yield* durante(1800, (u, t) => {
        P.cR = 5 * Math.sin(u * PI * 10); P.aY = 9 * Math.sin(u * PI * 12); P.esf = 1; P._ef = t / 60;
        P.polen = Math.min(1, p0 + .7 * u);
        if (t - ult > 220) { ult = t; soltarPolen(P.florX, P.florY - 6, 2, 60); flor.v += aleat(-30, 30); }
      });
      P.esf = 0;
      yield* tw({ hP: 0, hy: 0, cR: 0, aY: 0, abE: 1, abD: 1 }, 260);
      yield* tw({ hY: -40, hP: -20 }, 260);                  // olha para o pólen nas patas, contente
      yield* espera(500);
      yield* tw({ hY: 0, hP: 0, feliz: 0 }, 260);
      yield* descolar();
    }
    function* danca() {                              // dança das abelhas: um «oito» com o rabo a abanar na corrida do meio
      const C = [REPOUSO.x, REPOUSO.y - 6], RX = 92, RY = 58;
      yield* juntos(voar(C[0] - RX, C[1], 70, 520, 16), tw({ feliz: .7 }, 300));
      for (let k = 0; k < 2; k++) {
        yield* durante(1000, (u, t) => { P.x = lerp(C[0] - RX, C[0] + RX, u); P.y = C[1] + 3 * Math.sin(t / 40); P.aY = 24 * Math.sin(t / 30); P.cR = 6 * Math.sin(t / 30); P.h = 70; });
        P.aY = 0; P.cR = 0;
        const sg = k ? 1 : -1;
        yield* durante(950, u => { const a = PI * eio(u); P.x = C[0] + RX * Math.cos(a); P.y = C[1] + sg * RY * Math.sin(a); P.h = 70 - 140 * Math.sin(PI * u); P.hY = -20 * Math.sin(PI * u); });
      }
      P.hY = 0;
      yield* tw({ feliz: 0 }, 200);
    }
    function* lavarAntenas() {                       // dobra uma antena para baixo e penteia-a com a pata da frente, depois a outra
      yield* tw({ hP: -22, hy: -12, hx: -6, cP: 14 }, 300);
      const ordem = Math.random() < .5 ? ['E', 'D'] : ['D', 'E'];
      for (const L of ordem) {
        yield* tw({ ['ant' + L]: -130, ['lav' + L]: 1, lavU: .55, hY: L === 'E' ? 26 : -26, hR: L === 'E' ? -10 : 10 }, 300, eio);
        for (let i = 0; i < 2; i++) {
          yield* tw({ lavU: 1 }, 380, eio);
          boing(L, 260);
          yield* tw({ lavU: .55 }, 220, eio);
        }
        yield* tw({ ['ant' + L]: 0, ['lav' + L]: 0 }, 280, eio);
        boing(L, 300);
      }
      yield* tw({ hP: 0, hy: 0, hx: 0, hY: 0, hR: 0, cP: BASE.cP }, 300);
      yield* durante(420, u => { P.hR = 10 * Math.sin(u * PI * 6) * (1 - u); });
      P.hR = 0;
    }
    function* cheirar() {                            // vai cheirar o rosmaninho… e espirra!
      focar(() => [LAV.x, LAV.y]);
      yield* voar(CHEIRO.x, CHEIRO.y, CHEIRO.h, tempoVoo(CHEIRO.x, CHEIRO.y), 36);
      yield* tw({ hP: -18, hx: 4, antE: -20, antD: -20, antS: -12 }, 260);
      for (let i = 0; i < 3; i++) { yield* tw({ hx: 12, abE: 0, abD: 0, feliz: .8 }, 140, esai); yield* tw({ hx: 4 }, 170); }
      yield* espera(300);
      yield* tw({ hP: 10, hx: -4, abE: .1, abD: .1, boca: .45 }, 440, eio);   // antecipação: a cabeça vai para trás
      yield* tw({ hP: -24, hx: 14, boca: .9 }, 90, esai);                      // atchim!
      soltarPolen(LAV.x, LAV.y - 20, 8, 110);
      boing('E', 420); boing('D', 380);
      const x0 = P.x;
      yield* durante(320, u => { P.x = x0 + 28 * esai(u); });
      focar(null);
      yield* tw({ boca: 0, hP: 0, hx: 0, abE: 1, abD: 1, feliz: .6, antE: 0, antD: 0, antS: 0, olhosEsc: 1.12 }, 300);
      yield* durante(420, u => { P.hR = 12 * Math.sin(u * PI * 6) * (1 - u); });
      yield* tw({ hR: 0, feliz: 0, olhosEsc: 1 }, 260);
    }
    function* pirueta() {                            // agacha-se no ar e dá uma cambalhota de lado
      const y0 = P.y;
      yield* juntos(durante(220, u => { P.y = y0 + 16 * eio(u); }), tw({ cP: -6, feliz: .5 }, 220));
      const y1 = P.y, dir = escolhe([-1, 1]);
      boing('E', 200); boing('D', 200);
      yield* durante(820, u => { P.y = y1 - 92 * sino(u); P.cR = 360 * dir * eio(u); P.feliz = .5 + .4 * sino(u); });
      P.cR = 0;
      boing('E', 320); boing('D', 300);
      const y2 = P.y;
      yield* juntos(durante(300, u => { P.y = lerp(y2, y0, eio(u)); }), tw({ cP: BASE.cP, feliz: 0 }, 300));
    }
    function* espreguicar() {                        // estica as asas e as patas, boceja… e quase cai!
      const y0 = P.y;
      yield* juntos(tw({ zum: 0, wA: 1.25, wB: 6, est: 1, boca: .9, abE: 0, abD: 0, feliz: .6, cP: 14, antS: 20 }, 700, eio), durante(1200, u => { P.y = y0 + 34 * eio(u); }));
      yield* espera(300);
      yield* tw({ olhosEsc: 1.18, abE: 1, abD: 1, feliz: 0, boca: .4, zum: 1, wA: 1, wB: 40, est: 0, cP: BASE.cP, antS: 0 }, 160, esai);
      boing('E', 360); boing('D', 340);
      const y1 = P.y;
      yield* durante(360, u => { P.y = lerp(y1, y0, esai(u)); });
      yield* tw({ boca: 0, olhosEsc: 1 }, 260);
    }
    function* acenar() {                             // vira-se para nós, sorri e acena com a patinha
      yield* virar(0, 420);
      olhar.livre = [0, 0, 3]; olhar.t = 3000;
      yield* tw({ acena: 1, feliz: .8, hR: 8 }, 260);
      yield* durante(1500, (u, t) => { P._acF = t / 100; P.hR = 8 * Math.sin(t / 300); });
      yield* tw({ acena: 0, feliz: 0, hR: 0 }, 260);
      yield* virar(REPOUSO.h, 420);
    }
    const COMPORTAMENTOS = { polen, danca, lavarAntenas, cheirar, pirueta, espreguicar, acenar };
    let ultimoComp = null;
    function* cicloFora() {
      for (;;) {
        yield* recompor();
        yield* esperaViva(aleat(3500, 7500));
        yield* tw({ hY: 0, hP: 0, hR: 0 }, 200);
        let nome; do nome = escolhe(Object.keys(COMPORTAMENTOS)); while (nome === ultimoComp);
        ultimoComp = nome;
        yield* COMPORTAMENTOS[nome]();
      }
    }

    /* --- comportamentos dentro do cortiço (à porta) --- */
    function* recomporDentro() {
      const dif = {}; let ha = false;
      for (const k of CHAVES) if (Math.abs(P[k] - DENTRO_P[k]) > .3) { dif[k] = DENTRO_P[k]; ha = true; }
      if (ha) yield* tw(dif, 260);
    }
    function* estalosDentro() {
      for (let i = 0; i < 3; i++) { yield* tw({ hY: escolhe([-40, -20, 20, 40]), hR: aleat(-10, 10), hP: aleat(-6, 10) }, 220, eio); yield* espera(aleat(400, 800)); }
      yield* tw({ hY: 0, hR: 0, hP: 0 }, 240);
    }
    function* acenarDentro() {
      olhar.livre = [0, 0, 3]; olhar.t = 3000;
      yield* tw({ acena: 1, feliz: .8 }, 260);
      yield* durante(1300, (u, t) => { P._acF = t / 100; P.hR = 7 * Math.sin(t / 280); });
      yield* tw({ acena: 0, feliz: 0, hR: 0 }, 260);
    }
    function* provarMel() {                          // baixa a cabeça para o mel da soleira e lambe-o com a língua
      focar(() => [MEL.x - 10, MEL.y]);
      yield* tw({ hP: -14, hY: -12, hy: -4 }, 320);
      for (let i = 0; i < 3; i++) { yield* tw({ lingua: 1 }, 160, esai); yield* tw({ lingua: .2 }, 200); }
      focar(null);
      yield* tw({ lingua: 0, hP: 6, hY: 0, hy: 0, feliz: .9, abE: .9, abD: .9 }, 300);
      yield* durante(500, u => { P.hR = 8 * Math.sin(u * PI * 4) * (1 - u); });
      yield* tw({ feliz: 0, abE: 1, abD: 1, hP: 0, hR: 0 }, 300);
    }
    function* sonolento() {
      yield* tw({ abE: .2, abD: .2, hP: -10, antB: 10 }, 900, eio);
      yield* tw({ boca: .8 }, 400); yield* espera(400); yield* tw({ boca: 0 }, 300);
      yield* espera(500);
      yield* tw({ abE: 1, abD: 1, hP: 4, olhosEsc: 1.1, antB: DENTRO_P.antB }, 140, esai);
      boing('E', 300); boing('D', 280);
      yield* tw({ hP: 0, olhosEsc: 1 }, 260);
    }
    function* antenasDentro() {
      yield* tw({ hR: 12, olhosEsc: 1.08 }, 200);
      boing('E', 360); yield* espera(300); boing('D', 360); yield* espera(300);
      yield* tw({ hR: -12 }, 260); boing('E', 300); boing('D', 300); yield* espera(400);
      yield* tw({ hR: 0, olhosEsc: 1 }, 260);
    }
    const DENTRO_COMP = { estalosDentro, acenarDentro, provarMel, sonolento, antenasDentro };
    let ultimoDentro = null;
    function* cicloDentro() {
      for (;;) {
        yield* recomporDentro();
        yield* esperaViva(aleat(1300, 2800));
        let nome; do nome = escolhe(Object.keys(DENTRO_COMP)); while (nome === ultimoDentro);
        ultimoDentro = nome;
        yield* DENTRO_COMP[nome]();
      }
    }

    /* --- reação ao toque: olhos contentes, antenas aos saltos, pulinho no ar com as asas a zumbir --- */
    function* reacao() {
      reagindo = true;
      normRoll();
      const naFlor = apoio === 'flor', s0 = P.salto;
      const rosto = tw({ feliz: .9, olhosEsc: 1.12, abE: 1, abD: 1, boca: .35, lingua: 0, hY: limita(P.h * .8, -40, 40), hP: 6, hR: 0, hx: 0, hy: 0, lavE: 0, lavD: 0, acena: 0, antE: 0, antD: 0, antS: 6, est: 0, cR: 0, aY: 0 }, 100, esai);
      boing('E', 420); boing('D', 380);
      const corpo = (function* () {
        if (naFlor) {
          flor.v += 110;
          yield* tw({ wA: 1, wB: 30 }, 90);
          yield* durante(560, u => { P.cR = 7 * Math.sin(u * PI * 6) * (1 - u); P.aY = 12 * Math.sin(u * PI * 8); P.wB = 40 + 30 * Math.sin(u * PI * 8); });
          yield* tw({ wA: .82, wB: 64, cR: 0, aY: 0 }, 200);
          return;
        }
        if (s0 < 3) yield* tw({ cP: -8, zum: 1, wA: 1 }, 80, esai);
        yield* durante(460, u => { P.salto = lerp(s0, 0, u) + 54 * 4 * u * (1 - u); P.cP = lerp(-8, BASE.cP, u); P.aY = 14 * Math.sin(u * PI * 6); P.wB = 40 + 10 * Math.sin(u * PI * 6); });
        P.salto = 0; P.aY = 0;
        yield* tw({ wB: 40 }, 100);
      })();
      yield* juntos(rosto, corpo);
      yield* juntos(tw({ boca: 0, hP: 0, antS: 0 }, 200), durante(500, u => { P.hR = 10 * Math.sin(u * PI * 3) * (1 - u); }));
      reagindo = false;
      yield* tw(Object.assign({}, ROSTO, { hR: 0, hY: 0 }), 360);
    }
    function* reacaoDentro() {                       // à porta do cortiço: abana-se de contente sem sair
      reagindo = true;
      const rosto = tw({ feliz: .9, olhosEsc: 1.12, abE: 1, abD: 1, boca: .35, lingua: 0, hY: 0, hP: 8, hR: 0, acena: 0 }, 100, esai);
      boing('E', 420); boing('D', 380);
      const corpo = (function* () {
        yield* durante(620, u => { P.cR = 7 * Math.sin(u * PI * 5) * (1 - u); P.salto = 8 * sino(u * 2); P.hy = 4 * Math.sin(u * PI * 4); });
        P.cR = 0; P.salto = 0; P.hy = 0;
      })();
      yield* juntos(rosto, corpo);
      yield* juntos(tw({ boca: 0, hP: 0 }, 200), durante(500, u => { P.hR = 9 * Math.sin(u * PI * 3) * (1 - u); }));
      reagindo = false;
      yield* tw(Object.assign({}, ROSTO, { hR: 0 }), 360);
    }

    /* --- som: «bzzz». Em cada sílaba a boca abre, a cabeça dá um impulso, as asas zumbem e o corpo vibra --- */
    function* silaba(ms) {
      boing('E', 120); boing('D', 110);
      yield* durante(ms, u => {
        const k = u < .15 ? esai(u / .15) : u < .75 ? 1 : 1 - eseno((u - .75) / .25);
        P.somB = .6 * k; P.somH = Math.sin(PI * Math.min(1, u * 1.2)) * .7; somE.vib = k;
      });
      P.somB = 0; P.somH = 0; somE.vib = 0;
    }
    function* zumbirSilabas(silabas) {
      let t = 0;
      for (const [a, d] of silabas) {
        if (a > t) yield* espera((a - t) * 1000);
        yield* silaba(limita(d * 1000, 120, 2400));
        t = a + Math.max(d, .12);
      }
    }
    function* zumbirMs(ms) {
      const nQ = limita(Math.round(ms / 700), 1, 3), per = ms / nQ;
      for (let i = 0; i < nQ; i++) { yield* silaba(per * .8); if (i < nQ - 1) yield* espera(per * .2); }
    }

    /* --- ida ao cortiço: voa até à porta, vira-se de costas, entra (escurece), dá a volta lá dentro e vem pôr a cara à porta --- */
    function* idaAoCortico() {
      modo = 'indo'; reagindo = false;
      if (apoio === 'flor') yield* descolar();
      focar(() => [PORTA.x, PORTA.y]);
      yield* arrumar(160);
      const y0 = P.y;
      yield* juntos(tw({ cP: -8, hY: limita(P.h - 90, -55, 55), antS: -10 }, 220, esai), durante(220, u => { P.y = y0 + 14 * eio(u); }));
      // voo em arco até à frente da porta
      yield* juntos(voar(PORTA.x, PORTA.y - 6, 90, 1000, 70), tw({ cP: BASE.cP, antS: 0 }, 400));
      // vira-se de costas e dobra as asas
      focar(null);
      yield* tw({ h: 180, hY: 0, wA: .3, wB: 60, zum: .5, enc: 1 }, 420, eio);
      // entra: a frente do cortiço tapa-a e o interior escurece; o rabinho abana
      camada('dentro'); apoio = 'dentro';
      const y1 = P.y;
      yield* durante(480, u => { P.y = y1 - 24 * eio(u); esc.u = .9 * eio(u); P.wA = .3 * (1 - u); P.zum = .5 * (1 - u); P.aY = 14 * Math.sin(u * PI * 5); });
      P.aY = 0;
      // dá a volta lá dentro, às escuras
      yield* tw({ h: 360 }, 420, eio);
      P.h = 0;
      // vem até à porta: a cara aparece e as mãozinhas pousam na soleira
      const x2 = P.x, y2 = P.y;
      const alvo = {}; for (const k of CHAVES) alvo[k] = DENTRO_P[k];
      yield* juntos(tw(alvo, 420, eio), durante(420, u => { const e = eio(u); P.x = lerp(x2, DENTRO.x, e); P.y = lerp(y2, DENTRO.y, e); esc.u = .9 * (1 - e); esc.v = .28 * e; }));
      cort.v += 26; tampa.v -= 140; mel.forcar = true; P.polen = 0;
      boing('E', 300); boing('D', 280);
      modo = 'dentro';
    }
    function* depoisDeEntrar() {                     // contente por estar em casa
      yield* tw({ feliz: .9, abE: .92, abD: .92, olhosEsc: 1.06 }, 260, esai);
      yield* espera(500);
      yield* tw({ feliz: 0, abE: 1, abD: 1, olhosEsc: 1 }, 360);
    }
    /* --- volta: sacode-se, larga a soleira, sai pela porta, abre as asas a zumbir e voa em arco até ao sítio dela --- */
    function* saidaDoCortico() {
      modo = 'voltando'; reagindo = false;
      yield* arrumar(140, DENTRO_P);
      yield* durante(320, u => { const w = Math.sin(u * PI * 6) * (1 - u); P.cR = 9 * w; P.hR = -12 * w; });
      P.cR = 0; P.hR = 0;
      boing('E', 300); boing('D', 300);
      yield* tw({ maos: 0, enc: .4, acB: 0 }, 200);
      camada('fora'); apoio = 'ar'; esc.u = 0; esc.v = 0;
      const y0 = P.y;
      yield* juntos(tw({ wA: 1, zum: 1, wB: 40, enc: 0, antS: 0, antB: 0, aP: BASE.aP, cP: BASE.cP }, 280, esai), durante(280, u => { P.y = y0 + 14 * esai(u); }));
      yield* voar(REPOUSO.x, REPOUSO.y, REPOUSO.h, 900, 60);
      modo = 'fora';
    }

    /* --- cenário vivo --- */
    const mel = { fase: 'cresce', t: aleat(0, 2500), y: 0, v: 0, forcar: false };
    function atualizarMel(dt) {
      const s = dt / 1000;
      if (mel.fase === 'cresce') {
        mel.t += dt; const u = limita(mel.t / 4500, 0, 1), k = .35 + .65 * u;
        poe(R.gotaMel, `translate(${MEL.x},${n(MEL.y + 3 * u)}) scale(${n3(4.4 * k)},${n3(4.4 * k + 2.2 * u)})`);
        if (u >= 1 || (mel.forcar && u > .3)) { mel.fase = 'cai'; mel.y = MEL.y + 3 * u; mel.v = 0; mel.forcar = false; }
      } else if (mel.fase === 'cai') {
        mel.v += 1500 * s; mel.y += mel.v * s;
        poe(R.gotaMel, `translate(${MEL.x},${n(mel.y)}) scale(3.8,5.4)`);
        if (mel.y > 744) { mel.fase = 'pinga'; mel.t = 0; poe(R.gotaMel, `translate(${MEL.x},${MEL.y}) scale(.1)`); }
      } else {
        mel.t += dt; const u = limita(mel.t / 900, 0, 1);
        poe(R.salpico, `translate(${MEL.x},748) scale(${n(4 + 8 * esai(u))},${n(2 + 2 * esai(u))})`); atr(R.salpico, 'opacity', n3(.9 * (1 - u)));
        if (u >= 1) { mel.fase = 'cresce'; mel.t = 0; }
      }
    }
    const brilhos = R.brilhos.map((el, i) => ({ el, x: aleat(250, 1350), y: aleat(380, 760), ph: aleat(0, 6), v: aleat(6, 14) }));
    const botao = { ab: 0, t: 0, alvo: 0 };
    function animarCena(dt) {
      const t = tempo / 1000, s = dt / 1000;
      NUV.forEach((c, i) => { const x = ((c.x + 200 + t * (5 + i * 1.6) * calma) % 2000) - 200; poe(R.nuvens[i], `translate(${n(x)},${c.y}) scale(${c.k})`); });
      atr(R.aura, 'opacity', n3(.3 + .1 * Math.sin(t * .9)));
      // cegonha: atravessa o céu devagar, a bater as asas
      const cx = 1800 - ((t * 26 * calma + 600) % 2600), cy = 214 + 18 * Math.sin(t * .4);
      poe(R.cegonha, `translate(${n(cx)},${n(cy)})`);
      const ba = Math.sin(t * 3.2);
      poe(R.cegAsa, `scale(1,${n3(ba)})`); poe(R.cegAsaL, `scale(1,${n3(.8 * ba)})`);
      // vento: copas e flores baloiçam
      R.copas.forEach((o, i) => poe(o.g, `rotate(${n3(.7 * Math.sin(t * .6 + i * 1.9) * calma)},${o.x},${o.y})`));
      R.balancos.forEach((g, i) => poe(g, `rotate(${n3(2.6 * Math.sin(t * 1.1 + i * 1.7) * calma)})`));
      // malmequer: caule e cabeça (que verga com a abelha)
      const tx = P.florX, ty = P.florY, ang = (tx - FLOR.x) * .3 + flor.s * .25;
      poe(R.florCab, `translate(${n(tx)},${n(ty)}) rotate(${n3(ang)}) scale(1.35)`);
      const caule = `M${FLOR_BASE[0]},${FLOR_BASE[1]} C${n(FLOR_BASE[0] - 6)},${n(FLOR_BASE[1] - 90)} ${n(tx + 10)},${n(ty + 90)} ${n(tx)},${n(ty + 10)}`;
      atr(R.florCaule, 'd', caule); atr(R.florCauleL, 'd', caule);
      // brilhos de luz no ar (pólen ao sol)
      brilhos.forEach(b => {
        b.y -= b.v * s * calma; b.x += 6 * Math.sin(t * .7 + b.ph) * s;
        if (b.y < 340) { b.y = aleat(700, 780); b.x = aleat(250, 1350); }
        poe(b.el, `translate(${n(b.x)},${n(b.y)})`); atr(b.el, 'opacity', n3(.55 * Math.max(0, Math.sin(t * 1.3 + b.ph))));
      });
      // cortiço e tampa
      const ca = `rotate(${n3(cort.a)},${CORT.x},${CORT.yB})`;
      poe(R.cortT, ca); poe(R.cortF, ca); poe(R.tampa, `translate(0,${n(tampa.y)})`);
      atr(R.escU, 'opacity', n3(esc.u)); atr(R.escV, 'opacity', n3(esc.v));
      atualizarMel(dt);
      // botão de papoila: abre (acontecimento raro) e volta a fechar devagar
      if (botao.alvo === 1) { botao.t += dt; if (botao.t > 14000) botao.alvo = 0; }
      const vel = botao.alvo ? 1 / 1600 : 1 / 3500;
      botao.ab = limita(botao.ab + (botao.alvo ? 1 : -1) * dt * vel, 0, 1);
      const ea = botao.ab, ov = ea < 1 ? ea + .22 * Math.sin(PI * ea) : 1;
      poe(R.botaoFlor, `translate(0,-122) scale(${n3(ov)})`); atr(R.botaoFlor, 'opacity', n3(limita(ea * 3, 0, 1)));
      poe(R.botaoIn, `rotate(${n(-30 * ea)}) scale(${n3(1 - .6 * ea)}) translate(0,${n(10 * ea)})`); atr(R.botao, 'opacity', n3(1 - limita((ea - .5) * 2, 0, 1)));
    }

    /* --- acontecimentos raros (a cada 15–40 s): uma borboleta, uma papoila que se abre, outra abelha ao longe --- */
    const eventos = { prox: aleat(9000, 15000), i: Math.random() * 3 | 0, desligados: false };
    const TIPOS = ['borboleta', 'papoila', 'outra'];
    function iniciarEvento(tipo) {
      const ev = { tipo, x: -100, y: -100, vivo: true };
      ev.pos = () => [ev.x, ev.y];
      const gen = tipo === 'borboleta' ? evBorboleta(ev) : tipo === 'papoila' ? evPapoila(ev) : evOutra(ev);
      lancar('evento', gen, () => { ev.vivo = false; });
      if (modo === 'fora' && !reagindo) lancar('corpo', observar(ev), () => lancar('corpo', cicloFora()));
      else if (modo === 'dentro' && !reagindo) lancar('corpo', observar(ev), () => lancar('corpo', cicloDentro()));
      return ev;
    }
    function atualizarEventos(dt) {
      if (eventos.desligados || faixas.has('evento') || modo === 'indo' || modo === 'voltando') return;
      eventos.prox -= dt;
      if (eventos.prox > 0) return;
      eventos.prox = aleat(15000, 40000);
      eventos.i = (eventos.i + 1) % TIPOS.length;
      if (TIPOS[eventos.i] === 'papoila' && botao.ab > 0) eventos.i = (eventos.i + 1) % TIPOS.length;
      iniciarEvento(TIPOS[eventos.i]);
    }
    function* observar(ev) {
      reagindo = false;
      const b = modo === 'dentro' ? DENTRO_P : BASE;
      const lim = modo === 'dentro' ? 40 : 75;
      yield* tw({ olhosEsc: 1.1, boca: 0, lingua: 0, feliz: 0, lavE: 0, lavD: 0, acena: 0, est: 0, cR: 0, aY: 0, antE: 0, antD: 0, hx: b.hx, hy: b.hy, cP: b.cP }, 220, esai);
      boing('E', 250); boing('D', 230);
      let t = 0;
      focar(ev.pos);
      while (ev.vivo && t < 9000) {
        const dt = yield; t += dt;
        if (!G) continue;
        const p = ev.pos(), dx = p[0] - G.cab[0], dy = p[1] - G.cab[1];
        const yaw = limita(P.h - limita(dx / 4, -85, 85), -lim, lim), pit = limita(-dy / 6, -25, 30), k = 1 - Math.exp(-dt / 200);
        P.hY += (yaw - P.hY) * k; P.hP += (pit - P.hP) * k;
      }
      focar(null);
      yield* tw({ hY: 0, hP: b.hP, olhosEsc: 1 }, 360);
    }
    function* evBorboleta(ev) {                      // uma borboleta-cleópatra passa aos ziguezagues, pousa no malmequer e vai-se
      atr(R.borb, 'display', 'inline');
      const asas = (t, k) => poe(R.borbAsas, `scale(${n3(.2 + .8 * Math.abs(Math.cos(t / (k || 70))))},1)`);
      const voa = (de, para, ms, alto) => durante(ms, (u, t) => {
        const e = eseno(u);
        ev.x = lerp(de[0], para[0], e) + 14 * Math.sin(t / 260); ev.y = lerp(de[1], para[1], e) - alto * sino(u) + 10 * Math.sin(t / 170);
        poe(R.borb, `translate(${n(ev.x)},${n(ev.y)}) rotate(${n(limita((para[0] - de[0]) / 60, -20, 20))}) scale(.85)`); asas(t);
      });
      const pousa = apoio !== 'flor' && modo === 'fora';
      yield* voa([-80, 420], [360, 300], 2600, 40);
      if (pousa) {
        yield* voa([360, 300], [P.florX + 6, P.florY - 12], 2200, 60);
        yield* durante(1800, (u, t) => { ev.x = P.florX + 6; ev.y = P.florY - 12; poe(R.borb, `translate(${n(ev.x)},${n(ev.y)}) scale(.85)`); poe(R.borbAsas, `scale(${n3(.15 + .85 * Math.abs(Math.cos(t / 500)))},1)`); });
        yield* voa([P.florX + 6, P.florY - 12], [1720, 260], 3200, 120);
      } else yield* voa([360, 300], [1720, 300], 4200, 80);
      atr(R.borb, 'display', 'none');
      yield* espera(200);
    }
    function* evPapoila(ev) {                        // o botão de papoila abre-se
      ev.x = 330; ev.y = 784;
      botao.alvo = 1; botao.t = 0;
      yield* espera(2800);
    }
    function* evOutra(ev) {                          // outra abelha passa ao longe, visita as estevas e segue
      atr(R.outra, 'display', 'inline');
      const voa = (de, para, ms) => durante(ms, (u, t) => {
        const e = eseno(u);
        ev.x = lerp(de[0], para[0], e) + 6 * Math.sin(t / 150); ev.y = lerp(de[1], para[1], e) - 30 * sino(u) + 5 * Math.sin(t / 90);
        poe(R.outra, `translate(${n(ev.x)},${n(ev.y)}) scale(${para[0] < de[0] ? -1 : 1},1)`);
        poe(R.outraAsas, `scale(1,${n3(.3 + .7 * Math.abs(Math.sin(t / 16)))})`);
      });
      yield* voa([1700, 560], [1360, 632], 2600);
      yield* durante(1400, (u, t) => { ev.x = 1360 + 4 * Math.sin(t / 120); ev.y = 632 + 4 * Math.sin(t / 90); poe(R.outra, `translate(${n(ev.x)},${n(ev.y)}) scale(-1,1)`); poe(R.outraAsas, `scale(1,${n3(.3 + .7 * Math.abs(Math.sin(t / 16)))})`); });
      yield* voa([1360, 632], [-80, 560], 5200);
      atr(R.outra, 'display', 'none');
      yield* espera(200);
    }

    /* --- relógio único --- */
    let erroMostrado = false;
    function passo(dt) {
      if (!vivo) return;
      try {
        dt = Math.min(dt, 50);
        tempo += dt; dtUlt = dt;
        atualizarPiscar(dt);
        atualizarOlharLivre(dt);
        for (const nome of Array.from(faixas.keys())) avancarF(nome, dt);
        atualizarExtras(dt);
        atualizarEventos(dt);
        animarCena(dt);
        desenhar();
        atualizarPoeira(dt);
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    lancar('corpo', cicloFora());
    atualizarExtras(16); animarCena(0); desenhar();

    return {
      animal: R.abelha,
      habitat: R.habitat,
      reagir() {
        if (!vivo) return;
        if (modo === 'fora') lancar('corpo', reacao(), () => { reagindo = false; lancar('corpo', cicloFora()); });
        else if (modo === 'dentro') lancar('corpo', reacaoDentro(), () => { reagindo = false; lancar('corpo', cicloDentro()); });
        else { boing('E', 300); boing('D', 300); }
      },
      fazerSom(ms, silabas) {
        if (!vivo) return;
        const fim = () => { P.somB = 0; P.somH = 0; somE.vib = 0; };
        if (Array.isArray(silabas) && silabas.length) lancar('boca', zumbirSilabas(silabas), fim);
        else lancar('boca', zumbirMs(limita(ms || 1200, 400, 3000)), fim);
      },
      irAoHabitat() {
        return new Promise(res => {
          if (!vivo || modo !== 'fora') { res(); return; }
          lancar('corpo', idaAoCortico(), () => { res(); lancar('corpo', (function* () { yield* depoisDeEntrar(); yield* cicloDentro(); })()); });
        });
      },
      voltar() {
        return new Promise(res => {
          if (!vivo || modo !== 'dentro') { res(); return; }
          lancar('corpo', saidaDoCortico(), () => { res(); lancar('corpo', cicloFora()); });
        });
      },
      destruir() {
        vivo = false;
        faixas.clear();
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola
      _teste: { P, modo: () => modo, apoio: () => apoio, G: () => G, evento: iniciarEvento, desenhar, flor, botao,
        semEventos: () => { eventos.desligados = true; },
        comportamento: nome => lancar('corpo', (COMPORTAMENTOS[nome] || DENTRO_COMP[nome])(), () => lancar('corpo', modo === 'dentro' ? cicloDentro() : cicloFora())),
        parar: () => lancar('corpo', (function* () { for (;;) yield; })()) }
    };
  }

  return { icone: iconeSVG(), montar };
})();
