/* Pato — «Os Meus Animais». Contrato e regras: REGRAS-ANIMAIS.md.
   Cena: uma quinta portuguesa de manhã, com o sol a vir de cima à esquerda: colinas com vinha e oliveiras, um moinho de vento
   no alto, uma casa caiada com fumo na chaminé, um palheiro de pedra com uma meda de palha, a cerca de madeira, um sobreiro
   e o lago com juncos e tabúas (borboleta, libélula, andorinha e um peixe que salta).
   Habitat: o lago. O pato vai a bambolear até à margem, entra na água e fica a boiar. A água da frente tapa a parte de baixo
   do corpo (camadas: lago → pato → véu de água semitransparente com a cor do lago) e vêem-se as patas a remar através dela.
   O pato é um boneco «2,5D» feito de elipsoides (corpo, peito, cauda, pescoço, cabeça, bico…) projetados no ecrã a cada
   quadro; as asas, as patas palmadas, a poupa e o caracol da cauda são peças planas postas no espaço com uma matriz afim.
   Organização:
     1) utilidades (matemática, vetores, projeção, IK, peças planas)
     2) geometria do pato (pose → elipses e matrizes no ecrã)
     3) desenho do pato (SVG das peças) e ícone do menu
     4) cenário (céu, colinas, moinho, casa, palheiro, cerca, sobreiro, lago, juncos, bichos)
     5) montar(): passos de pato por distância, nadar, comportamentos, véu de água, ondas, gotas, relógio único */
'use strict';
MODULOS.pato = (() => {
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

  // câmara ortogonal ligeiramente de cima (18°). No mundo, x = x do ecrã; um ponto do chão (altura 0) à profundidade z
  // aparece no ecrã em y = z·sen18°. Por isso a posição do pato guarda-se como (x, gy = y do chão no ecrã).
  const ELEV = 18 * RAD, cE = Math.cos(ELEV), sE = Math.sin(ELEV);
  const VISTA = [0, sE, cE];
  const prof = w => w[1] * sE + w[2] * cE;                  // profundidade (maior = mais perto)
  // c = { o: raiz do pato no mundo, Y: y da raiz no ecrã, qy: compressão vertical (à volta da raiz) }
  const p2 = (c, w) => [w[0], c.Y - ((w[1] - c.o[1]) * cE - (w[2] - c.o[2]) * sE) * c.qy];
  const pd = (c, v) => [v[0], -(v[1] * cE - v[2] * sE) * c.qy];
  // elipsoide (centro + 3 semi-eixos em 3D) → elipse no ecrã (raiz quadrada simétrica da matriz projetada)
  function elipse(c, centro, eixos) {
    let a = 0, b = 0, d = 0;
    for (const v of eixos) { const x = v[0], y = -(v[1] * cE - v[2] * sE) * c.qy; a += x * x; b += x * y; d += y * y; }
    const m = (a + d) / 2, r = Math.sqrt(Math.max(0, (a - d) * (a - d) / 4 + b * b));
    const s = p2(c, centro);
    return { x: s[0], y: s[1], rx: Math.sqrt(m + r), ry: Math.sqrt(Math.max(.01, m - r)), ang: .5 * Math.atan2(2 * b, a - d) / RAD, z: prof(centro), wc: centro, wa: eixos };
  }
  // referenciais: origem + eixos f (frente), u (cima), s (lado direito do pato)
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
  // elipsoide à volta de um segmento a→b
  function segm(c, a, b, r1, r2, extra) {
    const A = vk(vd(b, a), .5), L = vl(A) || .001, Ah = vk(A, 1 / L);
    let n1 = vx([0, 1, 0], Ah); if (vl(n1) < .2) n1 = vx([1, 0, 0], Ah); n1 = vn(n1);
    const n2 = vx(Ah, n1);
    return elipse(c, vk(vs(a, b), .5), [vk(Ah, L + (extra || 0)), vk(n1, r1), vk(n2, r2 == null ? r1 : r2)]);
  }
  // ponto à superfície de um elipsoide (longitude fi a partir da frente, latitude te): elipse da mancha, tangentes e se está virado para nós
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
  // IK de 2 segmentos em 3D: raiz R, alvo T, comprimentos l1 e l2; o joelho vai para o lado do «polo»
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
  // peça plana (asa, pé, poupa): desenhada em coordenadas locais (x, y) e posta no espaço com os eixos ex e ey.
  // A projeção ortogonal de um plano é uma matriz afim; largura mínima ~0,34 para nunca ficar um risco.
  function plano(c, origem, ex, ey, minL) {
    const o = p2(c, origem);
    let a = pd(c, ex), b = pd(c, ey);
    const m = minL == null ? .34 : minL;
    let la = Math.hypot(a[0], a[1]);
    if (la < m) { const k = la < 1e-4 ? null : m / la; a = k ? [a[0] * k, a[1] * k] : [-b[1] * m, b[0] * m]; la = m; }
    const px = -a[1] / la, py = a[0] / la, comp = b[0] * px + b[1] * py;
    if (Math.abs(comp) < m) { const k = (comp < 0 ? -m : m) - comp; b = [b[0] + px * k, b[1] + py * k]; }
    return `matrix(${n3(a[0])},${n3(a[1])},${n3(b[0])},${n3(b[1])},${n(o[0])},${n(o[1])})`;
  }
  function liso(pts) {
    if (!pts.length) return '';
    if (pts.length < 3) return pts.map((p, i) => (i ? 'L' : 'M') + n(p[0]) + ',' + n(p[1])).join('');
    let d = `M${n(pts[0][0])},${n(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
      d += `Q${n(pts[i][0])},${n(pts[i][1])} ${n(m[0])},${n(m[1])}`;
    }
    const u = pts[pts.length - 1];
    return d + `L${n(u[0])},${n(u[1])}`;
  }
  // brilho do lado da luz (de cima à esquerda), sempre por dentro da elipse
  const LUZ = [-.55, -.835];
  function luzOff(e, f) {
    const a = e.ang * RAD, ca = Math.cos(a), sa = Math.sin(a);
    const lx = LUZ[0] * ca + LUZ[1] * sa, ly = -LUZ[0] * sa + LUZ[1] * ca;
    const ox = lx * f * e.rx, oy = ly * f * e.ry;
    return [ox * ca - oy * sa, ox * sa + oy * ca];
  }
  function visivel(pts, lim) {                               // o maior troço seguido de pontos virados para nós
    let best = [], cur = [];
    pts.forEach((p, i) => { if (p[2] > lim) cur.push(i); else { if (cur.length > best.length) best = cur; cur = []; } });
    if (cur.length > best.length) best = cur;
    return best;
  }

  /* ================= 2) Geometria do pato ================= */
  const COR = { cont: '#776048', contB: '#A24E10', contO: '#4A3424' };
  const RO = 15.5;                                          // raio do olho
  const SL = 44, ABERTO = 29;                               // comprimento do passo e meia distância entre os pés
  const LADOS = [['E', -1], ['D', 1]];                      // E = lado esquerdo do pato (s < 0), D = direito
  // pose base (de pé, fora de água) e a nadar. cF/cH/cP/cR = corpo (frente, altura, inclinação, balanço),
  // hx/hy/hz = cabeça em relação à base do pescoço, hY/hP/hR = rodar a cabeça, cY/cU = cauda, a?/bat? = asas (abertura, batida)
  const BASE = { cF: 0, cH: 128, cP: 10, cR: 0, hx: 22, hy: 128, hz: 0, hY: 0, hP: -4, hR: 0, cY: 0, cU: 0, aE: 0, aD: 0, batE: 30, batD: 30, puff: 0, sq: 0 };
  const NADAR = Object.assign({}, BASE, { cH: 120, cP: 5, hx: 16, hy: 124 });
  const ROSTO = { abE: 1, abD: 1, feliz: 0, bico: 0, sobr: 0, olhosEsc: 1 };
  const CHAVES = Object.keys(BASE);
  const FLUT = 92;                                          // a boiar: a raiz fica 92 abaixo da água
  // penas à superfície do corpo e do peito (longitude, latitude)
  const PENAS = (() => { const v = [], r = semente(41); for (const sg of [-1, 1]) for (const te of [-.46, -.12, .24]) for (let i = 0; i < 5; i++) v.push([sg * (.5 + i * .5 + r() * .14), te + (r() - .5) * .12]); return v; })();
  const PENAS_P = [[0, -.12], [.42, -.28], [-.42, -.28], [.24, .2], [-.24, .2], [0, -.48], [.72, .06], [-.72, .06], [.5, -.6], [-.5, -.6]];

  function geometria(P, pes) {
    const o = [P.x, P.y + P.salto + (P._boia || 0), P.gy / sE];
    const c = { o, Y: P.gy - o[1] * cE, qy: 1 - (P.sq || 0) };
    const h = P.h * RAD, F = [Math.sin(h), 0, Math.cos(h)], U = [0, 1, 0], S = [-Math.cos(h), 0, Math.sin(h)];
    const R0 = ref(o, F, U, S);
    const resp = P._resp || 0, pf = P.puff || 0;
    const B = filho(R0, P.cF, P.cH + (P._bob || 0), P._lado || 0, P.cP + (P._pb || 0), 0, P.cR + (P._rl || 0));
    const G = { c, el: {}, z: {}, R0, B, F, S, agua: [], olho: {} };
    const axT = [116 * (1 + .03 * pf), 78 * (1 + .012 * resp + .07 * pf), 86 * (1 + .018 * resp + .08 * pf)];
    G.el.tronco = elipR(c, B, [0, 0, 0], axT);
    const cP0 = [58, -6, 0], axP = [64 * (1 + .03 * pf), 60 * (1 + .02 * resp + .07 * pf), 72 * (1 + .025 * resp + .08 * pf)];
    G.el.peito = elipR(c, B, cP0, axP);
    // cauda: um tufo pontiagudo virado para cima, que abana; o caracol (pena enrolada) atrasa-se em relação a ela
    const Tf = filho(B, -84, 14, 0, 32 + P.cU, P.cY + (P._cw || 0), 0);
    G.el.cauda = elipR(c, Tf, [-26, 0, 0], [46 * (1 + .1 * pf), 24, 36 * (1 + .12 * pf)]);
    G.caracol = plano(c, ponto(Tf, -50, 14, 0), vk(Tf.f, -1), vk(Tf.u, -1), .3);
    G.caracolOp = limita((.55 - vp(F, VISTA)) / .25, 0, 1);       // de frente, a cauda fica escondida atrás do corpo
    // pescoço: curva de Bézier da base até à cabeça, feita de 3 elipsoides
    const sh = P.somH || 0;
    const N0 = ponto(B, 74, 34, 0);
    const Hc = vs(N0, direcao(R0, P.hx + (P._hx || 0) + 7 * sh, P.hy + 5 * sh, P.hz));
    const tb = vn(direcao(B, .45, 1, 0)), Lp = vl(vd(Hc, N0));
    const Cn = vs(N0, vk(tb, Lp * .5));
    const bz = t => vs(vs(vk(N0, (1 - t) * (1 - t)), vk(Cn, 2 * (1 - t) * t)), vk(Hc, t * t));
    const q = [0, .33, .64, .9].map(bz);
    G.el.pesc0 = segm(c, q[0], q[1], 34, 34, 18); G.el.pesc1 = segm(c, q[1], q[2], 31.5, 31.5, 18); G.el.pesc2 = segm(c, q[2], q[3], 29, 29, 16);
    // cabeça
    const Hd = roda(R0, Hc, P.hP + 9 * sh, P.hY, P.hR || 0);
    const axH = [52, 49, 45];
    G.el.cabeca = elipR(c, Hd, [0, 0, 0], axH);
    G.H = Hd; G.cab = p2(c, Hc);
    G.tufo = plano(c, ponto(Hd, -6, 46, 0), Hd.f, vk(Hd.u, -1), .3);
    for (const [L, sg] of LADOS) {
      const s = sup(c, Hd, [0, 0, 0], axH, sg * .86, .3, RO, RO);
      let t1 = s.t1, t2 = vk(s.t2, -1), a = pd(c, t1), b = pd(c, t2);
      if (a[0] < 0) { t1 = vk(t1, -1); a = [-a[0], -a[1]]; }   // x local sempre para a direita do ecrã (os brilhos ficam do lado da luz)
      if (b[1] < 0) { t2 = vk(t2, -1); b = [-b[0], -b[1]]; }
      const ps = p2(c, s.P), k = P.olhosEsc || 1;
      G.olho[L] = { x: ps[0], y: ps[1], vis: s.vis, t1, t2, m: `matrix(${n3(a[0] * k)},${n3(a[1] * k)},${n3(b[0] * k)},${n3(b[1] * k)},${n(ps[0])},${n(ps[1])})` };
    }
    G.bochechas = LADOS.map(([, sg]) => sup(c, Hd, [0, 0, 0], axH, sg * 1.2, -.14, 12, 8));
    // bico: metade de cima (larga e achatada), metade de baixo que roda para abrir, boca e língua lá dentro
    const bico = limita(Math.max(P.bico || 0, P.somB || 0), 0, 1);
    const Bi = roda(Hd, Hc, -9, 0, 0);
    const cS = [56, -9, 0], axS = [40, 9.5, 24];
    G.el.bicoS = elipR(c, Bi, cS, axS);
    const Li = filho(Bi, 24, -15, 0, -bico * 34, 0, 0);
    G.el.bicoI = elipR(c, Li, [29, 3, 0], [35, 6.5, 21]);
    G.el.boca = elipR(c, Li, [22, 5 + bico * 3, 0], [28, 2 + bico * 9, 17]);
    G.el.lingua = elipR(c, Li, [15, 6 + bico * 4, 0], [13, 3, 9]);
    G.bocaAberta = bico;
    G.narinas = LADOS.map(([, sg]) => sup(c, Bi, cS, axS, sg * .4, .62, 3.6, 2.3));
    G.unha = sup(c, Bi, cS, axS, 0, .4, 10, 6.5);
    G.risca = [];
    for (let i = 0; i <= 16; i++) {
      const fi = -1.95 + i / 16 * 3.9, te = -.28, ct = Math.cos(te), st = Math.sin(te);
      const w = ponto(Bi, cS[0] + axS[0] * ct * Math.cos(fi), cS[1] + axS[1] * st, cS[2] + axS[2] * ct * Math.sin(fi));
      const N = vn(direcao(Bi, ct * Math.cos(fi) / axS[0], st / axS[1], ct * Math.sin(fi) / axS[2]));
      const s = p2(c, w);
      G.risca.push([s[0], s[1], vp(N, VISTA)]);
    }
    const pb = ponto(Bi, cS[0], cS[1], 0);
    G.zBico = (pb[1] - Hc[1] < -24) ? 99 : prof(pb) - prof(Hc);      // bico virado para baixo: sempre à frente da cabeça
    // penas desenhadas à superfície (pequenas escamas em «U»), só as viradas para nós
    let pp = '';
    const arco = (R, ce, ax, fi, te, k) => {
      const s = sup(c, R, ce, ax, fi, te, 1, 1);
      if (s.vis < .22) return '';
      const a = p2(c, vs(vs(s.P, vk(s.t1, -k)), vk(s.t2, k * .3))), m = p2(c, vs(s.P, vk(s.t2, -k * .85))), b = p2(c, vs(vs(s.P, vk(s.t1, k)), vk(s.t2, k * .3)));
      return `M${n(a[0])},${n(a[1])}Q${n(m[0])},${n(m[1])} ${n(b[0])},${n(b[1])}`;
    };
    for (const [fi, te] of PENAS) pp += arco(B, [0, 0, 0], axT, fi, te, 8);
    for (const [fi, te] of PENAS_P) pp += arco(B, cP0, axP, fi, te, 7);
    G.penas = pp;
    // asas: dobradas ao lado do corpo (penas para trás) → abertas (para cima e para fora), com a batida
    G.asa = {};
    for (const [L, sg] of LADOS) {
      const A0 = ponto(B, 46, 20, 72 * sg);
      const a = limita(P['a' + L] + (P.somA || 0), 0, 1), fi = P['bat' + L] * RAD;
      const sF = vn(direcao(B, -1, .12, -.1 * sg)), cF0 = vn(direcao(B, -.1, -1, 0));
      const sO = vn(direcao(B, -.35, Math.sin(fi), Math.cos(fi) * sg)), cO = vn(direcao(B, -1, -.1, 0));
      const sp = vn(vlerp(sF, sO, a));
      let ch = vlerp(cF0, cO, a); ch = vn(vd(ch, vk(sp, vp(ch, sp))));
      const dv = Math.abs(vp(vx(sp, ch), VISTA));
      G.asa[L] = { m: plano(c, A0, vk(sp, .8), vk(ch, .86), .3), op: a > .3 ? 1 : limita((dv - .1) / .16, 0, 1) };
      // a asa do lado de cá fica sempre à frente do corpo e a do lado de lá atrás; aberta e levantada pode passar à frente da cabeça
      G.z['asa' + L] = prof(B.o) + 120 * vp(vk(B.s, sg), VISTA) + 40 * a * Math.max(0, vp(sp, [0, 1, 0]));
    }
    // patas: anca → joelho (coxa de penas, quase toda escondida) → tornozelo; pé palmado plano
    for (const [L, sg] of LADOS) {
      const pe = pes[L];
      const Hp = ponto(B, -12, -50, 30 * sg);
      const sobe = pe.modo === 'chao' ? P.salto : 0;
      const heel = [pe.p[0], pe.p[1] + sobe, pe.p[2]];
      const tp = (pe.tp + (sobe > 1 ? limita(sobe / 25, 0, 1) * 45 : 0)) * RAD, fh = pe.h * RAD;
      const f0 = [Math.sin(fh), 0, Math.cos(fh)], lat = [-Math.cos(fh), 0, Math.sin(fh)];
      const fx = vn(vs(vk(f0, Math.cos(tp)), [0, -Math.sin(tp), 0])), fy = vk(lat, 1 - .42 * (pe.dobra || 0));
      const ank = vs(vs(heel, [0, 9, 0]), vk(f0, -2));
      const ik = ik2(Hp, ank, 46, 50, vs(F, [0, .1, 0]));
      G.el['coxa' + L] = segm(c, Hp, ik.J, 18, 18, 6);
      G.el['canela' + L] = segm(c, ik.J, ik.E, 7.5, 7.5, 3);
      G['pe' + L] = plano(c, heel, fx, fy, .3);
      G.z['perna' + L] = -1e5 + prof(heel);
      if (heel[1] + 40 < 0 || heel[1] < -2) {
        const q4 = [[-10, -25], [58, -25], [58, 25], [-10, 25]].map(([x, y]) => p2(c, vs(vs(heel, vk(fx, x)), vk(fy, y))));
        G.agua.push({ quad: q4 });
      }
    }
    const corpoSeco = G.el.tronco.wc[1] - Math.abs(G.el.tronco.wa[1][1]) - Math.abs(G.el.tronco.wa[0][1]) > 0;   // as canelas só contam com o corpo fora de água (senão ficam escondidas dentro dele)
    for (const nm of ['tronco', 'peito', 'cauda', 'pesc0', 'pesc1', 'pesc2', 'cabeca', 'bicoS', 'bicoI'].concat(corpoSeco ? ['canelaE', 'canelaD'] : [])) G.agua.push({ e: G.el[nm], linha: nm === 'tronco' || nm === 'peito' });
    G.z.corpo = prof(B.o);
    G.z.cabeca = prof(Hc) + 2;
    return G;
  }

  /* ================= 3) Desenho do pato ================= */
  // asa (x ao longo da asa, da raiz até à ponta; y para a orla de trás), penas recortadas na orla
  const ASA = 'M-8,-4 C8,-26 60,-30 108,-20 C134,-15 152,-6 164,4 C152,10 142,13 130,15 C138,22 128,30 113,30 C118,38 106,45 92,42 C95,51 80,55 68,50 C70,58 52,61 42,54 C40,61 22,61 14,53 C2,47 -9,31 -10,14 Z';
  const ASA_PENAS = 'M130,15 C112,9 96,4 80,1 M113,30 C97,22 84,17 70,13 M92,42 C80,34 66,29 54,25 M68,50 C58,42 48,37 36,33 M42,54 C34,47 26,42 16,38';
  const ASA_COBERT = 'M4,8 Q12,17 20,9 Q28,18 36,10 Q44,19 52,10 Q60,18 68,9 Q76,16 84,6';
  const ASA_BRILHO = 'M2,-8 C20,-20 56,-22 96,-15';
  // pé palmado (x do calcanhar para a ponta dos dedos, y para o lado)
  const PE = 'M-5,-6 L39,-23 Q46,-25 44,-18 Q40,-8 52,-4 Q57,0 52,4 Q40,8 44,18 Q46,25 39,23 L-5,6 Q-11,0 -5,-6 Z';
  const PE_DEDOS = 'M2,0 L48,0 M2,-2 L39,-18 M2,2 L39,18';
  const UNHAS = '<circle cx="43" cy="-20" r="2.6"/><circle cx="54" cy="0" r="2.6"/><circle cx="43" cy="20" r="2.6"/>';
  const TUFO = 'M0,3 C-2,-9 -10,-17 -18,-13 C-24,-10 -20,-3 -14,-6 M6,3 C8,-7 4,-15 -2,-17';
  const CARACOL = 'M0,6 C2,-8 -6,-20 -16,-17 C-24,-14 -21,-4 -13,-7';

  function defsPato() {
    return `
    <radialGradient id="pato-pena"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#FBF8F1"/><stop offset=".93" stop-color="#EEE8DC"/><stop offset="1" stop-color="#E4DCCD"/></radialGradient>
    <radialGradient id="pato-luz"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity=".5"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
    <radialGradient id="pato-sombraPena"><stop offset="0" stop-color="#A89A82" stop-opacity=".45"/><stop offset=".55" stop-color="#B5A88F" stop-opacity=".24"/><stop offset="1" stop-color="#B5A88F" stop-opacity="0"/></radialGradient>
    <radialGradient id="pato-bico" cx=".45" cy=".4" r=".62"><stop offset="0" stop-color="#FFC963"/><stop offset=".55" stop-color="#FBA733"/><stop offset=".9" stop-color="#EE8A1C"/><stop offset="1" stop-color="#D9741A"/></radialGradient>
    <radialGradient id="pato-bicoLuz"><stop offset="0" stop-color="#FFF4D2" stop-opacity=".9"/><stop offset="1" stop-color="#FFF4D2" stop-opacity="0"/></radialGradient>
    <radialGradient id="pato-bicoI"><stop offset="0" stop-color="#F6A03A"/><stop offset=".7" stop-color="#DB7618"/><stop offset="1" stop-color="#B95E12"/></radialGradient>
    <radialGradient id="pato-bocaInt"><stop offset="0" stop-color="#A3443C"/><stop offset="1" stop-color="#5A1A16"/></radialGradient>
    <radialGradient id="pato-perna" cx=".4" cy=".4" r=".7"><stop offset="0" stop-color="#FFB24C"/><stop offset=".6" stop-color="#F08A1E"/><stop offset="1" stop-color="#C9661A"/></radialGradient>
    <linearGradient id="pato-pe" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#EE861A"/><stop offset=".6" stop-color="#FAA640"/><stop offset="1" stop-color="#F7983A"/></linearGradient>
    <linearGradient id="pato-asa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F7F3EB"/><stop offset="1" stop-color="#DFD7C7"/></linearGradient>
    <radialGradient id="pato-esclera" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E6E0D4"/></radialGradient>
    <radialGradient id="pato-iris" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#9A6638"/><stop offset=".5" stop-color="#5A3418"/><stop offset="1" stop-color="#26150A"/></radialGradient>
    <linearGradient id="pato-palp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#ECE5D7"/></linearGradient>
    <radialGradient id="pato-sombra"><stop offset="0" stop-color="#25400F" stop-opacity=".5"/><stop offset=".6" stop-color="#25400F" stop-opacity=".26"/><stop offset="1" stop-color="#25400F" stop-opacity="0"/></radialGradient>
    <radialGradient id="pato-sombraAguaP"><stop offset="0" stop-color="#1A4A5A" stop-opacity=".35"/><stop offset="1" stop-color="#1A4A5A" stop-opacity="0"/></radialGradient>
    <clipPath id="pato-clip-corpo"><circle class="pt-clipT" r="1"/><circle class="pt-clipP" r="1"/></clipPath>
    <clipPath id="pato-clip-cabeca"><circle class="pt-clipH" r="1"/></clipPath>
    <clipPath id="pato-clip-olho"><circle r="${RO}"/></clipPath>`;
  }
  const BRANCOS = ['tronco', 'cauda', 'peito', 'pesc0', 'pesc1', 'pesc2'];
  const contornoSVG = (nm, o, cor) => `<circle class="pt-${nm}-c" r="1" fill="${cor || COR.cont}" data-o="${o}"/>`;
  const enchSVG = (nm, f, l) => `<circle class="pt-${nm}-e" r="1" fill="${f}"/>` + (l ? `<circle class="pt-${nm}-l" r="1" fill="${l}"/>` : '');
  const NS_ = 'vector-effect="non-scaling-stroke"';
  function olhoSVG(L) {
    return `<g class="pt-olho${L}">
      <circle r="${n(RO + 2.2)}" fill="${COR.contO}"/>
      <circle r="${RO}" fill="url(#pato-esclera)"/>
      <g clip-path="url(#pato-clip-olho)">
        <g class="pt-iris${L}"><circle r="${n(RO * .74)}" fill="url(#pato-iris)"/><circle r="${n(RO * .74 - 1)}" fill="none" stroke="#24120A" stroke-width="1.6" opacity=".8"/>
          <circle class="pt-pupila${L}" r="${n(RO * .42)}" fill="#120A05"/></g>
        <circle cx="${n(-RO * .3)}" cy="${n(-RO * .34)}" r="${n(RO * .27)}" fill="#FFFFFF"/>
        <circle cx="${n(RO * .28)}" cy="${n(RO * .3)}" r="${n(RO * .11)}" fill="#FFFFFF" opacity=".85"/>
        <path class="pt-palpI${L}" fill="#F3EEE3"/><path class="pt-orlaI${L}" fill="none" stroke="${COR.cont}" stroke-width="1.8"/>
        <path class="pt-palpS${L}" fill="url(#pato-palp)"/><path class="pt-orla${L}" fill="none" stroke="${COR.cont}" stroke-width="2.6" stroke-linecap="round"/>
      </g>
      <path class="pt-sobr${L}" fill="none" stroke="${COR.cont}" stroke-width="2.8" stroke-linecap="round" opacity=".7"/>
    </g>`;
  }
  function patoSVG() {
    const asa = L => `<g class="pt-g-asa${L}"><g class="pt-asa${L}">
        <path d="${ASA}" fill="url(#pato-asa)" stroke="${COR.cont}" stroke-width="2.6" stroke-linejoin="round" ${NS_}/>
        <path d="${ASA_COBERT}" fill="none" stroke="#DAD1C1" stroke-width="1.6" ${NS_}/>
        <path d="${ASA_PENAS}" fill="none" stroke="#CDC3AF" stroke-width="1.5" stroke-linecap="round" ${NS_}/>
        <path d="${ASA_BRILHO}" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" ${NS_}/>
      </g></g>`;
    const perna = L => `<g class="pt-g-perna${L}">
        ${contornoSVG('coxa' + L, 2.6)}${contornoSVG('canela' + L, 2.4, COR.contB)}
        <circle class="pt-coxa${L}-e" r="1" fill="url(#pato-pena)"/><circle class="pt-canela${L}-e" r="1" fill="url(#pato-perna)"/>
        <g class="pt-pe${L}"><path d="${PE}" fill="url(#pato-pe)" stroke="${COR.contB}" stroke-width="2.4" stroke-linejoin="round" ${NS_}/>
          <path d="${PE_DEDOS}" stroke="#D2731A" stroke-width="2" fill="none" stroke-linecap="round" ${NS_}/><g fill="#7A4518">${UNHAS}</g></g>
      </g>`;
    const corpo = `<g class="pt-g-corpo">
        ${BRANCOS.map(nm => contornoSVG(nm, 3.2)).join('')}
        ${BRANCOS.map(nm => enchSVG(nm, '#FBF8F1', 'url(#pato-luz)')).join('')}
        <g clip-path="url(#pato-clip-corpo)"><ellipse class="pt-sombraT" rx="1" ry="1" fill="url(#pato-sombraPena)"/><ellipse class="pt-sombraP" rx="1" ry="1" fill="url(#pato-sombraPena)"/></g>
        <path class="pt-penas" fill="none" stroke="#D6CCB9" stroke-width="1.7" stroke-linecap="round"/>
        <g class="pt-caracol"><path d="${CARACOL}" stroke="${COR.cont}" stroke-width="9" fill="none" stroke-linecap="round" ${NS_}/><path d="${CARACOL}" stroke="#FFFFFF" stroke-width="5.4" fill="none" stroke-linecap="round" ${NS_}/></g>
      </g>`;
    const cabeca = `<g class="pt-g-cabeca">
        <g class="pt-slotBicoA"></g>
        ${contornoSVG('cabeca', 3.2)}
        <circle class="pt-pesc2b" r="1" fill="#FBF8F1"/>
        ${enchSVG('cabeca', 'url(#pato-pena)', 'url(#pato-luz)')}
        <g clip-path="url(#pato-clip-cabeca)">
          <ellipse class="pt-sombraH" rx="1" ry="1" fill="url(#pato-sombraPena)"/>
          <g fill="#F7A3A8">${LADOS.map(([L]) => `<ellipse class="pt-boch${L}" rx="1" ry="1"/>`).join('')}</g>
          ${olhoSVG('E')}${olhoSVG('D')}
        </g>
        <g class="pt-tufo"><path d="${TUFO}" stroke="${COR.cont}" stroke-width="7.5" fill="none" stroke-linecap="round" ${NS_}/><path d="${TUFO}" stroke="#FFFFFF" stroke-width="4.2" fill="none" stroke-linecap="round" ${NS_}/></g>
        <g class="pt-slotBicoF"><g class="pt-bico">
          ${contornoSVG('bicoI', 2.4, COR.contB)}${contornoSVG('bicoS', 2.6, COR.contB)}
          <circle class="pt-bicoI-e" r="1" fill="url(#pato-bicoI)"/>
          <circle class="pt-boca-e" r="1" fill="url(#pato-bocaInt)" display="none"/>
          <circle class="pt-lingua-e" r="1" fill="#F2878C" display="none"/>
          ${enchSVG('bicoS', 'url(#pato-bico)', 'url(#pato-bicoLuz)')}
          <path class="pt-risca" fill="none" stroke="#B8580E" stroke-width="2.4" stroke-linecap="round"/>
          <ellipse class="pt-unha" rx="1" ry="1" fill="#FFD08A" opacity=".85"/>
          <g fill="#8A3E0C">${LADOS.map(([L]) => `<ellipse class="pt-nar${L}" rx="1" ry="1"/>`).join('')}</g>
        </g></g>
      </g>`;
    return `<g class="pt-pato">
      <ellipse class="pt-sombra" rx="1" ry="1" fill="url(#pato-sombra)"/>
      <g class="pt-partes">${perna('E')}${perna('D')}${asa('E')}${corpo}${cabeca}${asa('D')}</g>
    </g>`;
  }
  // pálpebras no referencial do olho: c = fecho (0 aberto … 1 fechado), f = olhos contentes (pálpebra de baixo em arco)
  function palpebras(c, f) {
    const r = RO, e = r + 4;
    const yS = lerp(-r * 1.02, r * .5, c), bS = r * (.15 + .5 * Math.sin(PI * Math.min(1, c * 1.1)));
    const cl = Math.max(c * .5, f * .62), yI = lerp(r * 1.06, r * .05, cl), bI = r * (.05 + .75 * f);
    return {
      sup: `M${-e},${-e}L${e},${-e}L${e},${n(yS)}Q0,${n(yS + bS)} ${-e},${n(yS)}Z`,
      orla: c > .04 ? `M${n(-r * 1.02)},${n(yS + bS * .04)}Q0,${n(yS + bS)} ${n(r * 1.02)},${n(yS + bS * .04)}` : 'M0,0',
      inf: `M${-e},${e}L${e},${e}L${e},${n(yI)}Q0,${n(yI - bI)} ${-e},${n(yI)}Z`,
      orlaI: f > .05 || c > .5 ? `M${n(-r)},${n(yI - bI * .05)}Q0,${n(yI - bI)} ${n(r)},${n(yI - bI * .05)}` : 'M0,0'
    };
  }

  /* --- ícone do menu: pato branco a boiar, de lado, desenhado com cores lisas (sem gradientes com id) --- */
  function iconeSVG() {
    const C = COR.cont;
    const el = (cx, cy, rx, ry, f, extra) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}"${extra || ''}/>`;
    const contorno = (cx, cy, rx, ry, rot) => el(cx, cy, rx + 2.4, ry + 2.4, C, rot ? ` transform="rotate(${rot},${cx},${cy})"` : '');
    const corpo = (cx, cy, rx, ry, rot, f) => el(cx, cy, rx, ry, f, rot ? ` transform="rotate(${rot},${cx},${cy})"` : '');
    return `<circle cx="110" cy="110" r="106" fill="#CFEAF4"/>
      <path d="M14,132 C60,120 160,120 206,132 A106,106 0 0 1 14,132 Z" fill="#7CBFD0"/>
      <path d="M4,96 C40,84 80,92 110,88 C150,84 180,90 216,96 L216,112 L4,112 Z" fill="#9CCB6A" opacity=".85"/>
      <path d="M150,60 L196,60 L196,98 L150,98 Z" fill="#D9D3C4"/><path d="M144,62 L173,40 L202,62 Z" fill="#C8673A"/>
      <path d="M30,150 C70,141 150,141 190,150" stroke="#E8F7FA" stroke-width="2.6" fill="none" opacity=".75"/>
      <ellipse cx="104" cy="150" rx="86" ry="14" fill="none" stroke="#EFFAFC" stroke-width="2.4" opacity=".7"/>
      ${contorno(58, 112, 26, 15, -32)}${contorno(96, 128, 58, 36)}${contorno(124, 128, 34, 32)}${contorno(140, 92, 17, 26, 18)}${contorno(150, 64, 27, 25)}
      ${contorno(184, 74, 21, 6.5, 6)}
      ${corpo(58, 112, 26, 15, -32, '#F4F0E6')}${corpo(96, 128, 58, 36, 0, '#FBF8F2')}${corpo(124, 128, 34, 32, 0, '#FFFFFF')}${corpo(140, 92, 17, 26, 18, '#FFFFFF')}${corpo(150, 64, 27, 25, 0, '#FFFFFF')}
      ${el(144, 56, 16, 12, '#FFFFFF')}${el(88, 116, 30, 14, '#FFFFFF', ' opacity=".9"')}
      <path d="M58,104 C44,96 40,86 46,80 C52,76 58,82 54,88" stroke="${C}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M58,104 C44,96 40,86 46,80 C52,76 58,82 54,88" stroke="#FFFFFF" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M62,118 C80,100 122,98 142,112 C134,128 104,138 74,132 C66,130 60,124 62,118 Z" fill="#F3EEE4" stroke="${C}" stroke-width="2.2"/>
      <path d="M74,126 Q82,132 90,126 Q98,132 106,126 Q114,132 122,124" stroke="#D6CCB9" stroke-width="1.6" fill="none"/>
      ${el(184, 74, 21, 6.5, '#F6A12F', ' transform="rotate(6,184,74)"')}${el(178, 82, 17, 4.5, '#DD7A1A', ' transform="rotate(10,178,82)"')}
      <path d="M166,78 Q182,82 200,78" stroke="#B8580E" stroke-width="1.8" fill="none" stroke-linecap="round"/><ellipse cx="176" cy="70" rx="2.6" ry="1.6" fill="#8A3E0C"/>
      <circle cx="158" cy="60" r="9.5" fill="${COR.contO}"/><circle cx="158" cy="60" r="8" fill="#FFFFFF"/><circle cx="160" cy="61" r="5.6" fill="#4A2A14"/><circle cx="160" cy="61" r="3" fill="#120A05"/>
      <circle cx="156.4" cy="57.6" r="2.3" fill="#FFFFFF"/><circle cx="162.4" cy="63.4" r="1" fill="#FFFFFF"/>
      <ellipse cx="160" cy="76" rx="7" ry="4.4" fill="#F7A3A8" opacity=".7"/>
      <path d="M148,40 C146,30 138,24 132,28 C128,31 131,36 135,34" stroke="${C}" stroke-width="4.2" fill="none" stroke-linecap="round"/><path d="M148,40 C146,30 138,24 132,28 C128,31 131,36 135,34" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M8,150 C40,142 70,146 100,150 C130,154 170,146 212,150 L212,160 A106,106 0 0 1 8,160 Z" fill="#6AB3C6" opacity=".72"/>
      <path d="M40,154 C70,149 140,149 180,154" stroke="#E8F7FA" stroke-width="2.4" fill="none" opacity=".8"/>`;
  }

  /* ================= 4) Cenário: quinta com lago ================= */
  const REPOUSO = { x: 610, gy: 706, h: 30 };               // o pato de pé no prado
  const MARGEM = 806;                                       // onde a margem do lago cruza o caminho do pato
  const NO_LAGO = { x: 985, gy: 706, h: -34 };              // onde fica a boiar
  const alturaChao = x => x <= MARGEM ? 0 : -Math.min(FLUT, (x - MARGEM) * 1.05);   // a margem desce para dentro de água
  const LAGO = 'M770,578 C900,566 1100,568 1300,572 C1420,574 1520,570 1620,574 L1620,910 L700,910 C735,850 770,790 790,745 C800,722 806,708 806,694 C806,660 792,620 770,578 Z';
  // margem de cá do lago (para saber se uma gota cai na água): x da margem em função do y
  const margemX = y => y < 578 ? 2000 : y < 694 ? lerp(770, 806, Math.sqrt((y - 578) / 116)) : y < 745 ? lerp(806, 790, (y - 694) / 51) : lerp(790, 700, (y - 745) / 165);
  const naAgua = (x, y) => y > 578 && x > margemX(y) + 4;
  const NUV = [{ x: 260, y: 92, k: 1.1 }, { x: 720, y: 54, k: .75 }, { x: 1120, y: 128, k: .95 }, { x: 1480, y: 70, k: .85 }];
  const MOINHO = { x: 318, y: 334 };                         // eixo das velas do moinho
  const CHAMINE = { x: 803, y: 404 };

  function defsCena() {
    return `
    <linearGradient id="pato-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86C6EC"/><stop offset=".55" stop-color="#BDE2F2"/><stop offset="1" stop-color="#F5F1DA"/></linearGradient>
    <radialGradient id="pato-sol"><stop offset="0" stop-color="#FFFDEB" stop-opacity="1"/><stop offset=".2" stop-color="#FFF4C4" stop-opacity=".75"/><stop offset=".55" stop-color="#FFF1C0" stop-opacity=".22"/><stop offset="1" stop-color="#FFF1C0" stop-opacity="0"/></radialGradient>
    <linearGradient id="pato-colinaL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9D7B5"/><stop offset="1" stop-color="#97BF98"/></linearGradient>
    <linearGradient id="pato-colinaM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A6D271"/><stop offset=".6" stop-color="#83BC57"/><stop offset="1" stop-color="#6AA444"/></linearGradient>
    <linearGradient id="pato-colinaM2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#95C762"/><stop offset="1" stop-color="#5E9A3A"/></linearGradient>
    <linearGradient id="pato-prado" gradientUnits="userSpaceOnUse" x1="0" y1="540" x2="0" y2="900"><stop offset="0" stop-color="#A9D46A"/><stop offset=".4" stop-color="#85BC4C"/><stop offset="1" stop-color="#5A9532"/></linearGradient>
    <linearGradient id="pato-agua" gradientUnits="userSpaceOnUse" x1="0" y1="572" x2="0" y2="900"><stop offset="0" stop-color="#CBE8EE"/><stop offset=".3" stop-color="#8FC7D3"/><stop offset=".72" stop-color="#559FB3"/><stop offset="1" stop-color="#3B8299"/></linearGradient>
    <linearGradient id="pato-mgrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".9"/><stop offset=".6" stop-color="#FFFFFF" stop-opacity=".3"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
    <mask id="pato-mreflexo"><rect x="0" y="572" width="1600" height="190" fill="url(#pato-mgrad)"/></mask>
    <linearGradient id="pato-telha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E0814F"/><stop offset=".6" stop-color="#BD5A31"/><stop offset="1" stop-color="#93401F"/></linearGradient>
    <linearGradient id="pato-parede" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F3EEE2"/><stop offset="1" stop-color="#DCD3C1"/></linearGradient>
    <linearGradient id="pato-pedra" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D2CCBD"/><stop offset=".6" stop-color="#B4AD9C"/><stop offset="1" stop-color="#8E8776"/></linearGradient>
    <linearGradient id="pato-madeira" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B98C5E"/><stop offset=".5" stop-color="#94683E"/><stop offset="1" stop-color="#674423"/></linearGradient>
    <linearGradient id="pato-poste" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C29766"/><stop offset=".45" stop-color="#946A40"/><stop offset="1" stop-color="#5E3E1E"/></linearGradient>
    <linearGradient id="pato-palha" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F6DB86"/><stop offset=".55" stop-color="#E0B452"/><stop offset="1" stop-color="#B0842C"/></linearGradient>
    <radialGradient id="pato-copa" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#8FC45C"/><stop offset=".55" stop-color="#55913A"/><stop offset="1" stop-color="#2E6027"/></radialGradient>
    <radialGradient id="pato-copaS" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#86B957"/><stop offset=".6" stop-color="#457E33"/><stop offset="1" stop-color="#24501F"/></radialGradient>
    <radialGradient id="pato-oliveira" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#B5C99A"/><stop offset="1" stop-color="#6F8A5A"/></radialGradient>
    <linearGradient id="pato-tronco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8E7A62"/><stop offset=".5" stop-color="#655440"/><stop offset="1" stop-color="#3E3326"/></linearGradient>
    <linearGradient id="pato-cortica" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D47A48"/><stop offset=".55" stop-color="#B0542C"/><stop offset="1" stop-color="#7A3418"/></linearGradient>
    <linearGradient id="pato-moinho" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#ECE7DA"/><stop offset="1" stop-color="#C9C1AE"/></linearGradient>
    <linearGradient id="pato-junco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9ACB5E"/><stop offset=".5" stop-color="#6EA343"/><stop offset="1" stop-color="#4A7E31"/></linearGradient>
    <linearGradient id="pato-tabua" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A9703F"/><stop offset=".5" stop-color="#7A4A24"/><stop offset="1" stop-color="#4E2D13"/></linearGradient>
    <linearGradient id="pato-lama" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A08560"/><stop offset="1" stop-color="#6E5636"/></linearGradient>
    <radialGradient id="pato-sombraChao"><stop offset="0" stop-color="#24400F" stop-opacity=".42"/><stop offset="1" stop-color="#24400F" stop-opacity="0"/></radialGradient>
    <radialGradient id="pato-gota" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#DDF3F6"/><stop offset="1" stop-color="#8CC7D2"/></radialGradient>
    <radialGradient id="pato-fumo"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".75"/><stop offset=".6" stop-color="#F4F4F2" stop-opacity=".4"/><stop offset="1" stop-color="#F4F4F2" stop-opacity="0"/></radialGradient>
    <radialGradient id="pato-vinheta" cx=".5" cy=".46" r=".75"><stop offset=".62" stop-color="#1E3418" stop-opacity="0"/><stop offset="1" stop-color="#1E3418" stop-opacity=".28"/></radialGradient>
    <linearGradient id="pato-libCorpo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2F7FC4"/><stop offset=".5" stop-color="#5FC3EA"/><stop offset="1" stop-color="#2A6BB0"/></linearGradient>
    <linearGradient id="pato-peixe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7C8C96"/><stop offset=".5" stop-color="#B9C6CC"/><stop offset="1" stop-color="#EEF3F2"/></linearGradient>
    <clipPath id="pato-clip-lago"><path d="${LAGO}"/></clipPath>
    <clipPath id="pato-clip-peixe"><rect class="pt-clipPeixe" x="0" y="0" width="1600" height="600"/></clipPath>`;
  }

  function nuvemSVG(cls, i) {
    return `<g class="${cls}${i}"><g>
      <ellipse cx="0" cy="12" rx="80" ry="16" fill="#D9E8F1"/>
      <circle cx="-46" cy="0" r="26" fill="#FFFFFF"/><circle cx="-12" cy="-18" r="36" fill="#FFFFFF"/><circle cx="28" cy="-8" r="30" fill="#FFFFFF"/><circle cx="60" cy="4" r="18" fill="#FFFFFF"/>
      <ellipse cx="6" cy="8" rx="76" ry="14" fill="#FFFFFF"/>
      <path d="M-62,14 C-24,24 30,24 74,12" stroke="#C8DBE8" stroke-width="4" fill="none" opacity=".8"/>
      <path d="M-30,-30 C-20,-44 4,-48 18,-36" stroke="#FFFFFF" stroke-width="6" fill="none" opacity=".9" stroke-linecap="round"/>
    </g></g>`;
  }
  function ceuSVG() {
    return `<rect width="1600" height="600" fill="url(#pato-ceu)"/>
      <circle cx="210" cy="30" r="600" fill="url(#pato-sol)"/>
      ${NUV.map((c, i) => nuvemSVG('pt-nuvem', i)).join('')}
      <g opacity=".5" fill="none" stroke="#4E6A78" stroke-width="2.2" stroke-linecap="round">
        <path class="pt-ave0" d="M-9,0 Q-4,-6 0,0 Q4,-6 9,0"/><path class="pt-ave1" d="M-7,0 Q-3,-5 0,0 Q3,-5 7,0"/>
      </g>`;
  }
  function moinhoSVG() {                                     // moinho de vento português: torre caiada, chapéu escuro, velas de pano
    const { x, y } = MOINHO;
    let velas = '';
    for (let i = 0; i < 4; i++) {
      velas += `<g transform="rotate(${i * 90})"><path d="M0,0 L0,-84" stroke="#6A4A2A" stroke-width="3.2"/>
        <path d="M2,-14 L2,-82 L30,-70 C26,-50 22,-30 18,-16 Z" fill="#FFFDF2" stroke="#9A8E78" stroke-width="1.4"/>
        <path d="M9,-20 L9,-76 M16,-22 L16,-73" stroke="#D8CFBC" stroke-width="1.2"/>
        <circle cx="0" cy="-84" r="2.4" fill="#B5643A"/></g>`;
    }
    return `<g>
      <ellipse cx="${x + 6}" cy="${y + 78}" rx="40" ry="7" fill="#6E9A70" opacity=".5"/>
      <path d="M${x - 24},${y + 78} L${x - 18},${y + 8} L${x + 18},${y + 8} L${x + 24},${y + 78} Z" fill="url(#pato-moinho)" stroke="#9C9482" stroke-width="1.6"/>
      <path d="M${x - 5},${y + 78} L${x - 5},${y + 60} Q${x},${y + 54} ${x + 5},${y + 60} L${x + 5},${y + 78} Z" fill="#5A7C9E"/>
      <rect x="${x + 6}" y="${y + 30}" width="6" height="9" rx="2" fill="#5A7C9E"/>
      <path d="M${x - 21},${y + 10} L${x},${y - 18} L${x + 21},${y + 10} Z" fill="#6A5442" stroke="#4A3828" stroke-width="1.4"/>
      <path d="M${x - 21},${y + 10} L${x + 21},${y + 10}" stroke="#3A2A1C" stroke-width="3"/>
      <path d="M${x - 15},${y + 4} L${x - 2},${y - 12}" stroke="#8E7860" stroke-width="2" opacity=".7"/>
      <g class="pt-velas" transform="translate(${x},${y})">${velas}<circle r="5" fill="#4A3828"/></g>
    </g>`;
  }
  function colinasLongeSVG() {
    const r = semente(11);
    let arv = '';
    for (let i = 0; i < 40; i++) { const x = r() * 1600, y = 440 + r() * 24; arv += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(3 + r() * 4)}" fill="#7DA982" opacity=".8"/>`; }
    let aldeia = '';
    for (let i = 0; i < 7; i++) {
      const x = 1360 + i * 26 + r() * 6, y = 430 + (i % 3) * 4, w = 18 + r() * 6;
      aldeia += `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="12" fill="#F7F3EA"/><path d="M${n(x - 2)},${n(y)} L${n(x + w / 2)},${n(y - 6)} L${n(x + w + 2)},${n(y)} Z" fill="#D2794A"/>`;
    }
    aldeia += `<rect x="1462" y="406" width="12" height="34" fill="#FBF8F0"/><path d="M1460,406 L1468,394 L1476,406 Z" fill="#C86E42"/><rect x="1466" y="412" width="4" height="6" fill="#7A8A9A"/>`;
    return `<path d="M-20,452 C80,424 200,404 318,410 C430,416 500,440 620,438 C760,434 860,410 1000,414 C1140,418 1240,440 1380,436 C1480,432 1560,420 1620,424 L1620,560 L-20,560 Z" fill="url(#pato-colinaL)"/>
      <rect x="0" y="420" width="1600" height="50" fill="#FFFFFF" opacity=".14"/>
      ${arv}${aldeia}${moinhoSVG()}`;
  }
  function colinasMeioSVG() {
    const r = semente(23);
    let vinha = '';                                           // vinha às riscas numa encosta
    for (let i = 0; i < 12; i++) { const x0 = 930 + i * 20; vinha += `<path d="M${x0},${n(474 + i * .6)} C${x0 + 10},${n(500)} ${x0 + 6},${n(520)} ${x0 + 14},${n(548)}" stroke="#5E8E36" stroke-width="5" stroke-linecap="round" fill="none"/>`; }
    let campo = '';                                           // campo lavrado
    for (let i = 0; i < 8; i++) campo += `<path d="M${380 + i * 4},${490 + i * 7} L${610 - i * 3},${484 + i * 7}" stroke="#A9814E" stroke-width="3" opacity=".7"/>`;
    let oliv = '';
    for (const [x, y, k] of [[180, 506, 1], [250, 498, .8], [540, 470, .7], [1210, 468, .75], [1290, 474, .9], [1555, 470, .8]]) {
      oliv += `<g transform="translate(${x},${y}) scale(${k})"><path d="M-2,0 C-3,-8 -1,-14 0,-18 M0,-12 C3,-16 6,-18 8,-20" stroke="#5A4A36" stroke-width="3" fill="none"/>
        <ellipse cx="0" cy="-26" rx="22" ry="14" fill="url(#pato-oliveira)"/><ellipse cx="-12" cy="-20" rx="12" ry="8" fill="#8EA676"/><ellipse cx="12" cy="-22" rx="11" ry="8" fill="#94AC7C"/><ellipse cx="-4" cy="-32" rx="10" ry="6" fill="#C2D3A8" opacity=".7"/></g>`;
    }
    let cip = '';
    for (const [x, y, h] of [[620, 486, 54], [640, 490, 44], [880, 478, 50]]) cip += `<path d="M${x},${y} C${x - 9},${y - h * .4} ${x - 6},${y - h * .8} ${x},${y - h} C${x + 6},${y - h * .8} ${x + 9},${y - h * .4} ${x},${y} Z" fill="#3E6E36"/><path d="M${x - 2},${y - 6} C${x - 6},${y - h * .5} ${x - 3},${y - h * .8} ${x},${y - h + 4}" stroke="#6A9A52" stroke-width="2" fill="none"/>`;
    let sebe = '';                                            // sebe ao fundo do prado
    for (let x = -20; x < 1640; x += 22 + r() * 12) sebe += `<circle cx="${n(x)}" cy="${n(548 + r() * 6)}" r="${n(13 + r() * 9)}" fill="${r() < .5 ? '#4F8A38' : '#5E9A42'}"/>`;
    return `<path d="M-20,520 C120,486 260,474 420,486 C560,498 640,472 780,464 C920,456 1040,482 1180,478 C1320,474 1460,458 1620,468 L1620,600 L-20,600 Z" fill="url(#pato-colinaM)"/>
      <path d="M900,560 C940,520 980,482 1060,470 C1120,466 1170,476 1200,490 L1220,560 Z" fill="url(#pato-colinaM2)" opacity=".75"/>
      ${vinha}${campo}${oliv}${cip}
      ${casaSVG()}
      <g>${sebe}</g>
      <g fill="#86BE58" opacity=".55">${Array.from({ length: 30 }, (_, i) => `<circle cx="${n(i * 56 + 10)}" cy="${n(540 + (i * 7) % 9)}" r="9"/>`).join('')}</g>`;
  }
  function casaSVG() {                                       // casa caiada com barra azul, telhado de telha e chaminé
    let telhas = '';
    for (let i = 0; i < 9; i++) telhas += `<path d="M${652 + i * 22},${452} Q${663 + i * 22},${446} ${674 + i * 22},${452}" stroke="#8E3E1E" stroke-width="1.6" fill="none" opacity=".7"/>`;
    for (let x = 660; x < 840; x += 11) telhas += `<path d="M${x},${432 + (x - 660) * .0} L${x - 4},${452}" stroke="#A84A26" stroke-width="1.2" opacity=".5"/>`;
    return `<g>
      <ellipse cx="748" cy="514" rx="110" ry="8" fill="#4E7E34" opacity=".45"/>
      <rect x="656" y="452" width="180" height="60" fill="url(#pato-parede)"/>
      <rect x="656" y="500" width="180" height="12" fill="#2F6FB5"/>
      <rect x="656" y="452" width="180" height="5" fill="#C9BFA8" opacity=".7"/>
      <path d="M644,454 L668,430 L826,430 L848,454 Z" fill="url(#pato-telha)" stroke="#7E361A" stroke-width="1.6"/>
      ${telhas}
      <rect x="794" y="402" width="20" height="34" fill="#F7F3EA" stroke="#C9BFA8" stroke-width="1.2"/><rect x="790" y="398" width="28" height="6" fill="#B5532E"/>
      <rect x="733" y="474" width="24" height="38" rx="2" fill="#7A5232"/><path d="M745,476 L745,510" stroke="#5A3A1E" stroke-width="1.4"/>
      <rect x="675" y="470" width="22" height="18" fill="#5A7C9E" stroke="#E7C04A" stroke-width="3"/><path d="M686,470 L686,488 M675,479 L697,479" stroke="#E7C04A" stroke-width="1.6"/>
      <rect x="787" y="470" width="22" height="18" fill="#5A7C9E" stroke="#E7C04A" stroke-width="3"/><path d="M798,470 L798,488 M787,479 L809,479" stroke="#E7C04A" stroke-width="1.6"/>
      <path d="M680,512 C700,506 712,510 726,512" stroke="#6AA444" stroke-width="5" fill="none" stroke-linecap="round"/>
    </g>`;
  }
  function pradoSVG() {
    const r = semente(5);
    let erva = '';
    for (let i = 0; i < 150; i++) {
      const x = r() * 1600, y = 560 + Math.pow(r(), 1.3) * 150, h = 6 + (y - 540) / 18 + r() * 6;
      erva += `<path d="M${n(x)},${n(y)} q${n(-1 + r() * 2)},${n(-h * .6)} ${n(-3 + r() * 6)},${n(-h)}" stroke="${r() < .5 ? '#6FA640' : '#93C45C'}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    }
    let flores = '';
    for (let i = 0; i < 26; i++) {
      const x = 260 + r() * 560, y = 620 + r() * 80, k = .7 + (y - 600) / 200;
      if (Math.abs(x - REPOUSO.x) < 120 && y > 660) continue;
      flores += r() < .65 ? malmequer(x, y, k) : `<circle cx="${n(x)}" cy="${n(y)}" r="${n(2.6 * k)}" fill="#F4D23C"/>`;
    }
    return `<rect x="-20" y="540" width="1640" height="370" fill="url(#pato-prado)"/>
      <path d="M-20,560 C300,552 600,566 900,560 C1200,554 1400,562 1620,558" stroke="#B9DE80" stroke-width="5" fill="none" opacity=".5"/>
      <g fill="#7AB246" opacity=".5"><ellipse cx="300" cy="680" rx="120" ry="16"/><ellipse cx="640" cy="760" rx="160" ry="18"/><ellipse cx="200" cy="820" rx="150" ry="20"/></g>
      ${erva}${flores}`;
  }
  function malmequer(x, y, k) {
    let p = '';
    for (let a = 0; a < 360; a += 40) p += `<ellipse cx="${n(Math.cos(a * RAD) * 4.4 * k)}" cy="${n(Math.sin(a * RAD) * 2.6 * k)}" rx="${n(3 * k)}" ry="${n(1.5 * k)}" transform="rotate(${a},${n(Math.cos(a * RAD) * 4.4 * k)},${n(Math.sin(a * RAD) * 2.6 * k)})" fill="#FFFFFF"/>`;
    return `<g transform="translate(${n(x)},${n(y)})"><path d="M0,0 l0,${n(8 * k)}" stroke="#5E8E36" stroke-width="1.4"/>${p}<ellipse rx="${n(2.4 * k)}" ry="${n(1.7 * k)}" fill="#F2C230"/></g>`;
  }
  function celeiroSVG() {                                    // palheiro de pedra com telhado de telha, porta de madeira e palha no sótão
    const r = semente(71);
    let pedras = '';
    for (let fila = 0; fila < 8; fila++) {
      const y = 458 + fila * 14;
      for (let x = 1152 + (fila % 2) * 12; x < 1426; x += 22 + r() * 8) {
        if (x > 1246 && x < 1334 && y > 480) continue;
        const w = 18 + r() * 8;
        pedras += `<rect x="${n(x)}" y="${n(y)}" width="${n(Math.min(w, 1428 - x))}" height="12" rx="4" fill="${['#C9C3B4', '#B4AD9C', '#D6D0C2', '#A69F8E'][(r() * 4) | 0]}"/>`;
      }
    }
    let telhas = '';
    for (let i = 0; i < 7; i++) { const y = 400 + i * 9; telhas += `<path d="M${n(1290 - (y - 386) * 2.3)},${y} L${n(1290 + (y - 386) * 2.3)},${y}" stroke="#93401F" stroke-width="1.4" opacity=".5"/>`; }
    let palha = '';
    for (let i = 0; i < 14; i++) { const x = 1274 + r() * 32; palha += `<path d="M${n(x)},446 l${n(-6 + r() * 12)},${n(4 + r() * 8)}" stroke="#E8C462" stroke-width="2" stroke-linecap="round"/>`; }
    return `<g>
      <ellipse cx="1300" cy="570" rx="170" ry="9" fill="#3E6A2A" opacity=".45"/>
      <rect x="1150" y="452" width="280" height="118" fill="#9E9786"/>
      ${pedras}
      <rect x="1150" y="452" width="280" height="10" fill="#5E574A" opacity=".35"/>
      <path d="M1134,458 L1290,384 L1446,458 L1436,462 L1290,394 L1144,462 Z" fill="url(#pato-telha)" stroke="#7E361A" stroke-width="2"/>
      <path d="M1158,456 L1290,394 L1422,456 Z" fill="#B4AD9C"/><path d="M1158,456 L1290,394 L1422,456" fill="none" stroke="#6E6656" stroke-width="2"/>
      ${telhas}
      <path d="M1268,414 L1312,414 L1312,446 L1268,446 Z" fill="#3A2A1A"/>${palha}
      <path d="M1268,414 L1312,414" stroke="#7A5232" stroke-width="3"/>
      <rect x="1250" y="484" width="80" height="86" fill="url(#pato-madeira)" stroke="#4A2E14" stroke-width="2"/>
      <path d="M1290,484 L1290,570 M1262,484 L1262,570 M1276,484 L1276,570 M1304,484 L1304,570 M1318,484 L1318,570" stroke="#5E3E1E" stroke-width="1.4" opacity=".6"/>
      <path d="M1252,488 L1288,566 M1288,488 L1252,566 M1292,488 L1328,566 M1328,488 L1292,566" stroke="#6A4626" stroke-width="5" opacity=".85"/>
      <circle cx="1286" cy="528" r="2.4" fill="#2A1A0A"/><circle cx="1294" cy="528" r="2.4" fill="#2A1A0A"/>
      <rect x="1180" y="486" width="16" height="22" fill="#3A2A1A"/><rect x="1384" y="486" width="16" height="22" fill="#3A2A1A"/>
      <path d="M1430,452 L1430,570" stroke="#7A7262" stroke-width="3" opacity=".5"/>
    </g>`;
  }
  function medaSVG() {                                       // meda de palha com o pau ao meio
    const r = semente(83);
    let palhas = '';
    for (let i = 0; i < 40; i++) { const t = r(), x = 1466 + (r() - .5) * 110 * (.3 + t * .7), y = 440 + t * 120; palhas += `<path d="M${n(x)},${n(y)} l${n(-4 + r() * 8)},${n(6 + r() * 6)}" stroke="${r() < .5 ? '#C99A3C' : '#F4D27A'}" stroke-width="1.8" stroke-linecap="round"/>`; }
    return `<g>
      <ellipse cx="1474" cy="568" rx="70" ry="7" fill="#3E6A2A" opacity=".45"/>
      <path d="M1466,396 L1466,440" stroke="#6A4A2A" stroke-width="5" stroke-linecap="round"/>
      <path d="M1410,568 C1408,520 1428,470 1466,436 C1504,470 1524,520 1522,568 Z" fill="url(#pato-palha)" stroke="#9A7228" stroke-width="2"/>
      <path d="M1418,520 C1450,512 1490,512 1516,520 M1426,490 C1452,484 1482,484 1506,490" stroke="#B88E36" stroke-width="2" fill="none" opacity=".7"/>
      ${palhas}
      <path d="M1452,436 C1460,428 1472,428 1480,436 L1466,448 Z" fill="#C99A3C"/>
    </g>`;
  }
  function cercaSVG() {                                      // cerca de madeira atrás do pato
    const r = semente(31);
    const xs = []; for (let x = -10; x <= 760; x += 86) xs.push(x);
    const base = x => 614 - x * .02, topo = x => base(x) - 86;
    let travessas = '';
    for (const yy of [30, 62]) {
      let d = '';
      for (let i = 0; i < xs.length - 1; i++) {
        const a = xs[i], b = xs[i + 1], ya = topo(a) + yy, yb = topo(b) + yy;
        d += `<path d="M${a},${n(ya - 6)} Q${(a + b) / 2},${n((ya + yb) / 2 - 4)} ${b},${n(yb - 6)} L${b},${n(yb + 6)} Q${(a + b) / 2},${n((ya + yb) / 2 + 8)} ${a},${n(ya + 6)} Z" fill="url(#pato-madeira)" stroke="#4E3218" stroke-width="1.6"/>`;
        d += `<path d="M${a + 6},${n(ya - 2)} Q${(a + b) / 2},${n((ya + yb) / 2 - 6)} ${b - 6},${n(yb - 2)}" stroke="#D8B486" stroke-width="1.6" fill="none" opacity=".6"/>`;
      }
      travessas += d;
    }
    let postes = '';
    for (const x of xs) {
      const b = base(x), t = topo(x);
      postes += `<ellipse cx="${x + 10}" cy="${n(b + 2)}" rx="16" ry="4" fill="#2E4A1A" opacity=".35"/>
        <path d="M${x - 8},${n(b)} L${x - 8},${n(t + 6)} Q${x},${n(t - 4)} ${x + 8},${n(t + 6)} L${x + 8},${n(b)} Z" fill="url(#pato-poste)" stroke="#4E3218" stroke-width="1.8"/>
        <path d="M${x - 3},${n(t + 10)} C${x - 4},${n(t + 30)} ${x - 1},${n(t + 50)} ${x - 3},${n(b - 6)}" stroke="#5E3E1E" stroke-width="1.2" fill="none" opacity=".6"/>
        <circle cx="${x}" cy="${n(t + 30)}" r="1.6" fill="#3A2A1A"/><circle cx="${x}" cy="${n(t + 62)}" r="1.6" fill="#3A2A1A"/>`;
    }
    let ervas = '';
    for (let i = 0; i < 60; i++) { const x = -10 + r() * 770, b = base(x) + 2, h = 10 + r() * 14; ervas += `<path d="M${n(x)},${n(b)} q${n(-2 + r() * 4)},${n(-h * .6)} ${n(-4 + r() * 8)},${n(-h)}" stroke="${r() < .5 ? '#5E9636' : '#7FB24A'}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`; }
    return `<g>${travessas}${postes}${ervas}</g>`;
  }
  function sobreiroSVG() {                                   // sobreiro à esquerda (moldura): tronco descortiçado cor de tijolo, copa escura
    const r = semente(19);
    let copa = '';
    const bolas = [[40, 60, 130], [170, 10, 120], [300, 40, 110], [400, -10, 90], [110, 160, 100], [250, 150, 95], [-30, 200, 100], [360, 110, 70]];
    for (const [x, y, rr] of bolas) copa += `<circle cx="${x}" cy="${y}" r="${rr}" fill="url(#pato-copaS)"/>`;
    for (const [x, y, rr] of bolas) copa += `<circle cx="${n(x - rr * .26)}" cy="${n(y - rr * .3)}" r="${n(rr * .45)}" fill="#A0CF6C" opacity=".3"/>`;
    for (let i = 0; i < 46; i++) { const a = r() * 2 * PI, b = bolas[i % bolas.length], d = b[2] * (.75 + r() * .3), x = b[0] + Math.cos(a) * d, y = b[1] + Math.sin(a) * d; copa += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="11" ry="6.5" transform="rotate(${n(r() * 180)},${n(x)},${n(y)})" fill="${r() < .5 ? '#5A9A40' : '#376E2C'}"/>`; }
    let fendas = '';
    for (let i = 0; i < 14; i++) { const x = 92 + r() * 64, y = 220 + r() * 300; fendas += `<path d="M${n(x)},${n(y)} c${n(-3 + r() * 6)},${n(10 + r() * 14)} ${n(-3 + r() * 6)},${n(20 + r() * 20)} ${n(-2 + r() * 4)},${n(34 + r() * 24)}" stroke="#2E261C" stroke-width="${n(2 + r() * 2)}" fill="none" opacity=".6" stroke-linecap="round"/>`; }
    return `<g>
      <ellipse cx="190" cy="704" rx="190" ry="20" fill="url(#pato-sombraChao)"/>
      <path d="M70,712 C58,704 40,708 20,716 C48,696 74,680 86,640 C96,520 96,360 104,180 L166,180 C166,360 168,520 178,640 C190,680 220,700 256,712 C226,708 200,704 182,710 Z" fill="url(#pato-tronco)"/>
      <path d="M86,640 C94,600 96,580 97,560 L172,560 C172,580 174,600 178,640 C190,672 212,690 236,704 C210,700 196,700 182,706 C170,700 120,700 76,708 C60,704 50,706 38,710 C60,694 78,672 86,640 Z" fill="url(#pato-cortica)"/>
      <path d="M97,560 C120,566 150,566 172,560" stroke="#3E3326" stroke-width="3" fill="none"/>
      <path d="M106,600 C108,630 104,660 100,690 M150,590 C152,620 156,650 162,690" stroke="#8A3A18" stroke-width="2.4" fill="none" opacity=".6"/>
      ${fendas}
      <path d="M150,250 C200,220 250,200 320,190 M110,300 C80,260 50,240 10,232" stroke="#4A3A2A" stroke-width="18" fill="none" stroke-linecap="round"/>
      <g class="pt-copa">${copa}</g>
    </g>`;
  }
  function juncoSVG(cls, x, y, alt, inc, tabua, larg) {      // folha de junco (e às vezes uma tabúa)
    const w = larg || 7;
    let s = `<path d="M${-w},0 C${-w * .6},${n(-alt * .5)} ${n(inc * .5 - 1)},${n(-alt * .85)} ${n(inc)},${n(-alt)} C${n(inc * .5 + 2)},${n(-alt * .82)} ${n(w * .7)},${n(-alt * .5)} ${w},0 Z" fill="url(#pato-junco)" stroke="#2F5A22" stroke-width="1.4"/>`;
    if (tabua) s += `<path d="M${n(inc * .2)},${n(-alt * .55)} L${n(inc * .25)},${n(-alt * 1.1)}" stroke="#5E7A3A" stroke-width="3"/>
      <rect x="${n(inc * .22 - 7)}" y="${n(-alt * .84)}" width="14" height="${n(alt * .2)}" rx="7" fill="url(#pato-tabua)" stroke="#3A2010" stroke-width="1.4"/>
      <path d="M${n(inc * .22 - 3)},${n(-alt * .82)} L${n(inc * .22 - 3)},${n(-alt * .67)}" stroke="#C99A64" stroke-width="2" opacity=".6"/>`;
    return `<g class="${cls}" transform="translate(${n(x)},${n(y)})"><g>${s}</g></g>`;
  }
  const JUNCOS = (() => {
    const r = semente(101), v = [];
    for (let i = 0; i < 8; i++) v.push(['L', 776 + r() * 60, 590 + r() * 10, 50 + r() * 50, -10 + r() * 20, i % 3 === 1, 4 + r() * 2]);   // margem de lá, à esquerda
    for (let i = 0; i < 8; i++) v.push(['L', 1080 + r() * 70, 578 + r() * 6, 44 + r() * 40, -10 + r() * 20, i % 3 === 0, 4 + r() * 2]);  // margem de lá, ao meio
    for (let i = 0; i < 12; i++) v.push(['F', 1430 + r() * 190, 906, 230 + r() * 200, -40 + r() * 60, i % 3 === 0, 6 + r() * 3]);       // primeiro plano, à direita
    for (let i = 0; i < 7; i++) v.push(['F', 690 + r() * 80, 908, 80 + r() * 60, -16 + r() * 34, i === 3, 5 + r() * 2]);              // primeiro plano, na margem
    return v;
  })();
  function lagoSVG() {
    const r = semente(9);
    let brilhos = '';
    for (let i = 0, k = 0; i < 60 && k < 26; i++) {
      const y = 584 + Math.pow(r(), 1.3) * 300, x = 800 + r() * 820, w = 10 + r() * 30 * (y - 572) / 260;
      if (x < margemX(y) + 30 || (x > 840 && x < 1160 && y > 640 && y < 820)) continue;
      brilhos += `<ellipse class="pt-br${k}" cx="${n(x)}" cy="${n(y)}" rx="${n(w)}" ry="${n(1 + (y - 572) / 180)}" fill="#F4FFFC" opacity="${n3(.2 + r() * .3)}"/>`; k++;
    }
    let cint = '';
    for (let i = 0; i < 10; i++) { const x = 1170 + r() * 420, y = 600 + r() * 260; cint += `<path class="pt-ci${i}" transform="translate(${n(x)},${n(y)})" d="M0,-6 L1.4,-1.4 L6,0 L1.4,1.4 L0,6 L-1.4,1.4 L-6,0 L-1.4,-1.4 Z" fill="#FFFFFF" opacity="0"/>`; }
    const juncos = JUNCOS.map((j, i) => j[0] === 'L' ? juncoSVG(`pt-junco${i}`, j[1], j[2], j[3], j[4], j[5], j[6]) : '').join('');
    let pedras = '';
    for (let i = 0; i < 9; i++) { const y = 600 + i * 34 + r() * 10, x = margemX(y) - 6 + r() * 8; pedras += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(7 + r() * 8)}" ry="${n(4 + r() * 3)}" fill="${r() < .5 ? '#A49F8E' : '#8A8576'}"/><ellipse cx="${n(x - 2)}" cy="${n(y - 2)}" rx="${n(3 + r() * 3)}" ry="1.4" fill="#E6E2D2" opacity=".6"/>`; }
    const ondas = Array.from({ length: 12 }, (_, i) => `<ellipse class="pt-onda${i}" rx="1" ry="1" fill="none" stroke="#F2FFFB" stroke-width="2.4" opacity="0"/>`).join('');
    const aneisT = Array.from({ length: 8 }, (_, i) => `<path class="pt-anelT${i}" fill="none" stroke="#F2FFFB" stroke-width="3" opacity="0"/>`).join('');
    return `<path d="${LAGO}" fill="url(#pato-agua)"/>
      <g mask="url(#pato-mreflexo)" opacity=".5">
        <g transform="translate(0,${n(572 * 2)}) scale(1,-1)">
          <rect x="1150" y="470" width="280" height="102" fill="#8E8878"/><path d="M1134,472 L1290,410 L1446,472 Z" fill="#B0603A"/><rect x="1250" y="494" width="80" height="78" fill="#6E4C2E"/>
          <path d="M1410,572 C1408,530 1428,486 1466,456 C1504,486 1524,530 1522,572 Z" fill="#CFA74E"/>
          <path d="M770,572 L770,552 C900,546 1100,550 1620,548 L1620,572 Z" fill="#4E8A3A"/>
        </g>
      </g>
      <g opacity=".22">${NUV.map((c, i) => nuvemSVG('pt-refl', i)).join('')}</g>
      <path d="M770,580 C900,568 1100,570 1300,574 C1420,576 1520,572 1620,576" stroke="#3E6A2E" stroke-width="4" fill="none" opacity=".45"/>
      <path d="M776,586 C900,576 1100,578 1300,582 C1420,584 1520,580 1620,584" stroke="#F2FFFB" stroke-width="2" fill="none" opacity=".5"/>
      <path d="M770,578 C792,620 806,660 806,694 C806,708 800,722 790,745 C770,790 735,850 700,910" stroke="url(#pato-lama)" stroke-width="16" fill="none"/>
      <path d="M779,584 C800,624 814,662 814,696 C814,712 808,726 798,750 C778,794 744,852 710,910" stroke="#E2F6F4" stroke-width="2.4" fill="none" opacity=".7"/>
      ${pedras}
      <g class="pt-brilhos">${brilhos}</g><g>${cint}</g>
      <g class="pt-penaLago"><path d="M-16,0 C-8,-7 8,-7 16,-1 C8,2 -8,3 -16,0 Z" fill="#FFFFFF" stroke="#B8AE9C" stroke-width="1"/><path d="M-16,0 L14,-1" stroke="#C9BFAE" stroke-width="1"/></g>
      ${juncos}
      <g clip-path="url(#pato-clip-lago)"><g class="pt-ondas">${ondas}</g><g class="pt-aneisT">${aneisT}</g></g>
      <g clip-path="url(#pato-clip-peixe)"><g class="pt-peixe" display="none"><g>
        <path d="M34,0 C26,-13 0,-17 -18,-9 L-36,-19 C-34,-8 -34,8 -36,19 L-18,9 C0,17 26,13 34,0 Z" fill="url(#pato-peixe)" stroke="#4A5A64" stroke-width="2"/>
        <path d="M2,-14 C8,-23 18,-21 22,-11" fill="#9AAAB2" stroke="#4A5A64" stroke-width="1.6"/>
        <path d="M-6,-7 C0,-2 0,4 -6,8 M4,-9 C10,-3 10,5 4,9" stroke="#7E8E98" stroke-width="1.4" fill="none" opacity=".7"/>
        <circle cx="22" cy="-3" r="4" fill="#FFFFFF" stroke="#2A3238" stroke-width="1"/><circle cx="23" cy="-3" r="2.2" fill="#0E1418"/>
      </g></g></g>`;
  }
  function primeiroPlanoSVG() {
    const r = semente(55);
    const juncos = JUNCOS.map((j, i) => j[0] === 'F' ? juncoSVG(`pt-junco${i}`, j[1], j[2], j[3], j[4], j[5], j[6]) : '').join('');
    let tufos = '';
    for (let i = 0; i < 70; i++) {
      const x = -10 + r() * 700, y = 852 + r() * 52, h = 22 + r() * 30, inc = -8 + r() * 16;
      if (x > margemX(y) - 10) continue;
      tufos += `<path d="M${n(x - 3)},${n(y)} Q${n(x + inc * .4)},${n(y - h * .6)} ${n(x + inc)},${n(y - h)} Q${n(x + inc * .3 + 2)},${n(y - h * .55)} ${n(x + 3)},${n(y)} Z" fill="${['#3F7A26', '#5A9636', '#4A8A2E', '#6EA844'][i % 4]}"/>`;
    }
    let flores = '';
    for (let i = 0; i < 9; i++) { const x = 230 + r() * 420, y = 790 + r() * 60; flores += malmequer(x, y, 1.4 + r() * .4); }
    let dentes = '';
    for (const [x, y] of [[330, 830], [520, 812]]) {
      let f = ''; for (let a = 0; a < 360; a += 24) f += `<path d="M0,0 L${n(Math.cos(a * RAD) * 11)},${n(Math.sin(a * RAD) * 11)}" stroke="#FFFFFF" stroke-width="1.2" opacity=".9"/><circle cx="${n(Math.cos(a * RAD) * 11)}" cy="${n(Math.sin(a * RAD) * 11)}" r="1.6" fill="#FFFFFF"/>`;
      dentes += `<g><path d="M${x},${y} C${x - 2},${y - 20} ${x + 2},${y - 40} ${x},${y - 56}" stroke="#6A9A3E" stroke-width="2.2" fill="none"/><g transform="translate(${x},${y - 60})"><circle r="10" fill="#FFFFFF" opacity=".35"/>${f}<circle r="2.6" fill="#C9B88A"/></g></g>`;
    }
    return `${juncos}${tufos}${flores}${dentes}
      <g transform="translate(470,792) rotate(-14)"><path d="M-22,0 C-10,-9 10,-9 22,-1 C10,3 -10,4 -22,0 Z" fill="#FFFFFF" stroke="#B8AE9C" stroke-width="1.2"/><path d="M-26,1 L20,-1" stroke="#B8AE9C" stroke-width="1.2"/></g>
      <g fill="#8A8576">${[[90, 868, 12], [200, 884, 9], [600, 880, 10]].map(([x, y, rr]) => `<ellipse cx="${x}" cy="${y}" rx="${rr}" ry="${n(rr * .55)}"/><ellipse cx="${x - 2}" cy="${y - 2}" rx="${n(rr * .5)}" ry="1.6" fill="#E2DECF"/>`).join('')}</g>`;
  }
  function bichosSVG() {
    const asaLib = (i, x, y, rx, ry, a) => `<g transform="translate(${x},${y}) rotate(${a})"><ellipse class="pt-asaL${i}" cx="${n(rx * .9)}" cy="0" rx="${rx}" ry="${ry}" fill="#E8F6FF" fill-opacity=".55" stroke="#7FA9C2" stroke-width="1.2"/></g>`;
    const asaB = sg => `<path d="M0,-2 C${sg * 10},-24 ${sg * 30},-28 ${sg * 34},-14 C${sg * 36},-6 ${sg * 22},0 0,2 Z" fill="#F6A43A" stroke="#7A4214" stroke-width="1.4"/>
      <path d="M${sg * 26},-24 C${sg * 32},-24 ${sg * 36},-18 ${sg * 34},-12" stroke="#3A2414" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M0,2 C${sg * 18},2 ${sg * 26},10 ${sg * 20},20 C${sg * 14},26 ${sg * 4},16 0,4 Z" fill="#F8C24E" stroke="#7A4214" stroke-width="1.4"/>
      <circle cx="${sg * 16}" cy="-14" r="3" fill="#FFF3C8"/><circle cx="${sg * 12}" cy="11" r="2.4" fill="#FFF3C8"/>`;
    const gotas = Array.from({ length: 22 }, (_, i) => `<circle class="pt-gota${i}" r="1" fill="url(#pato-gota)" opacity="0"/>`).join('');
    return `<g class="pt-libelula"><g>
        ${asaLib(0, 4, -2, 30, 6, -100)}${asaLib(1, 4, -2, 30, 6, -80)}${asaLib(2, -4, -2, 27, 6, -112)}${asaLib(3, -4, -2, 27, 6, -68)}
        <path d="M-4,0 C-20,1 -40,2 -62,2 L-62,-1 C-40,-2 -20,-3 -4,-3 Z" fill="url(#pato-libCorpo)" stroke="#1E4A7A" stroke-width="1.2"/>
        <path d="M-14,-2 v3 M-24,-2 v3 M-34,-1 v3 M-44,-1 v3 M-54,-1 v3" stroke="#1E4A7A" stroke-width="1.4"/>
        <ellipse cx="2" cy="-1" rx="9" ry="5.5" fill="#3E9A6A" stroke="#1E5A3A" stroke-width="1.2"/>
        <circle cx="12" cy="-2" r="6" fill="#2A70B8" stroke="#163E6A" stroke-width="1.2"/><circle cx="14" cy="-4" r="2" fill="#FFFFFF" opacity=".8"/>
      </g></g>
      <g class="pt-borboleta"><g class="pt-borbIn">
        <g class="pt-borbAsas">${asaB(-1)}${asaB(1)}</g>
        <ellipse cx="0" cy="2" rx="2.6" ry="11" fill="#3A2414"/><circle cx="0" cy="-10" r="3.2" fill="#3A2414"/>
        <path d="M-1,-12 C-4,-20 -6,-22 -9,-23 M1,-12 C4,-20 6,-22 9,-23" stroke="#3A2414" stroke-width="1.2" fill="none"/>
      </g></g>
      <g class="pt-andorinha" display="none"><g class="pt-andIn">
        <path class="pt-andAsa" d="M2,-2 C-8,-20 -26,-34 -46,-38 C-30,-24 -18,-12 -6,0 Z" fill="#1E2A4A" stroke="#0E1428" stroke-width="1.2"/>
        <path d="M-30,0 L-54,-8 L-40,2 L-56,10 Z" fill="#1E2A4A"/>
        <path d="M24,-2 C14,-8 -10,-8 -32,0 C-10,6 12,6 24,2 Z" fill="#24325A" stroke="#0E1428" stroke-width="1.2"/>
        <path d="M18,2 C6,6 -10,6 -24,2 C-8,8 8,8 18,2 Z" fill="#F4EEE2"/>
        <path d="M20,-3 C22,-2 24,-1 26,0" stroke="#B5442A" stroke-width="3" stroke-linecap="round"/><circle cx="17" cy="-3" r="1.6" fill="#FFFFFF"/>
        <path class="pt-andAsa2" d="M2,-2 C-8,-16 -22,-26 -40,-30 C-26,-20 -16,-10 -6,0 Z" fill="#2A3860" stroke="#0E1428" stroke-width="1.2"/>
      </g></g>
      <g class="pt-gotas">${gotas}</g>`;
  }

  /* ================= 5) montar() ================= */
  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .4 : 1;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    const aneisF = Array.from({ length: 8 }, (_, i) => `<path class="pt-anelF${i}" fill="none" stroke="#F2FFFB" stroke-width="3" opacity="0"/>`).join('');
    svg.innerHTML = `<defs>${defsPato()}${defsCena()}</defs>
      ${ceuSVG()}${colinasLongeSVG()}${colinasMeioSVG()}${pradoSVG()}${celeiroSVG()}${medaSVG()}${cercaSVG()}
      <g class="pt-habitat">${lagoSVG()}<rect x="830" y="600" width="350" height="250" fill="#000" fill-opacity="0"/></g>
      ${sobreiroSVG()}
      ${patoSVG()}
      <g class="pt-aguaFrente" pointer-events="none" clip-path="url(#pato-clip-lago)">
        <path class="pt-veu" fill="url(#pato-agua)" opacity=".7"/>
        <path class="pt-linhaAgua" fill="none" stroke="#F4FFFD" stroke-width="2.6" stroke-linecap="round" opacity=".75"/>
        <g>${aneisF}</g>
      </g>
      ${primeiroPlanoSVG()}${bichosSVG()}
      <rect width="1600" height="900" fill="url(#pato-vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s);
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; el.setAttribute(nome, v); } }
    const ld = f => ({ E: f('E'), D: f('D') });

    /* --- referências --- */
    const RP = {};
    for (const nm of ['tronco', 'cauda', 'peito', 'pesc0', 'pesc1', 'pesc2', 'cabeca', 'bicoS', 'bicoI', 'boca', 'lingua', 'coxaE', 'canelaE', 'coxaD', 'canelaD']) {
      const c = q(`.pt-${nm}-c`);
      RP[nm] = { c, e: q(`.pt-${nm}-e`), l: q(`.pt-${nm}-l`), o: c ? +c.getAttribute('data-o') : 0 };
    }
    const R = {
      pato: q('.pt-pato'), sombra: q('.pt-sombra'), partes: q('.pt-partes'),
      grupos: { pernaE: q('.pt-g-pernaE'), pernaD: q('.pt-g-pernaD'), asaE: q('.pt-g-asaE'), asaD: q('.pt-g-asaD'), corpo: q('.pt-g-corpo'), cabeca: q('.pt-g-cabeca') },
      asa: ld(L => q('.pt-asa' + L)), pe: ld(L => q('.pt-pe' + L)),
      clipT: q('.pt-clipT'), clipP: q('.pt-clipP'), clipH: q('.pt-clipH'), sombraT: q('.pt-sombraT'), sombraP: q('.pt-sombraP'), sombraH: q('.pt-sombraH'),
      penas: q('.pt-penas'), caracol: q('.pt-caracol'), tufo: q('.pt-tufo'), pesc2b: q('.pt-pesc2b'),
      bico: q('.pt-bico'), slotA: q('.pt-slotBicoA'), slotF: q('.pt-slotBicoF'), risca: q('.pt-risca'), unha: q('.pt-unha'),
      nar: LADOS.map(([L]) => q('.pt-nar' + L)), boch: LADOS.map(([L]) => q('.pt-boch' + L)),
      olho: ld(L => q('.pt-olho' + L)), iris: ld(L => q('.pt-iris' + L)), palpS: ld(L => q('.pt-palpS' + L)), palpI: ld(L => q('.pt-palpI' + L)),
      orla: ld(L => q('.pt-orla' + L)), orlaI: ld(L => q('.pt-orlaI' + L)), sobr: ld(L => q('.pt-sobr' + L)),
      veu: q('.pt-veu'), linhaAgua: q('.pt-linhaAgua'),
      habitat: q('.pt-habitat'),
      nuvens: NUV.map((c, i) => q('.pt-nuvem' + i)), refl: NUV.map((c, i) => q('.pt-refl' + i)), aves: [q('.pt-ave0'), q('.pt-ave1')],
      velas: q('.pt-velas'), copa: q('.pt-copa'), juncos: JUNCOS.map((j, i) => q(`.pt-junco${i} > g`)),
      brilhos: Array.from({ length: 26 }, (_, i) => q('.pt-br' + i)).filter(Boolean), cint: Array.from({ length: 10 }, (_, i) => q('.pt-ci' + i)),
      penaLago: q('.pt-penaLago'),
      ondas: Array.from({ length: 12 }, (_, i) => q('.pt-onda' + i)), anT: Array.from({ length: 8 }, (_, i) => q('.pt-anelT' + i)), anF: Array.from({ length: 8 }, (_, i) => q('.pt-anelF' + i)),
      gotas: Array.from({ length: 22 }, (_, i) => q('.pt-gota' + i)),
      lib: q('.pt-libelula'), asasL: [0, 1, 2, 3].map(i => q('.pt-asaL' + i)),
      borb: q('.pt-borboleta'), borbAsas: q('.pt-borbAsas'),
      andor: q('.pt-andorinha'), andAsa: q('.pt-andAsa'), andAsa2: q('.pt-andAsa2'),
      peixe: q('.pt-peixe'), clipPeixe: q('.pt-clipPeixe')
    };
    // fumo da chaminé: baforadas que sobem e se desfazem
    const fumo = [];
    { const g = document.createElementNS(NS, 'g'); g.setAttribute('pointer-events', 'none');
      for (let i = 0; i < 6; i++) { const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', '1'); c.setAttribute('fill', 'url(#pato-fumo)'); g.appendChild(c); fumo.push({ el: c, f: i / 6 }); }
      svg.insertBefore(g, q('.pt-habitat')); }
    const cintFase = R.cint.map((_, i) => ({ f: .6 + (i * .37) % .9, ph: i * 1.7 }));

    /* --- estado --- */
    const P = Object.assign({ x: REPOUSO.x, gy: REPOUSO.gy, y: 0, h: REPOUSO.h, salto: 0, somB: 0, somH: 0, somA: 0, somT: 0, agua: 0, molhado: 0 }, BASE, ROSTO);
    let modo = 'fora';                    // 'fora' | 'indo' | 'dentro' | 'voltando'
    let reagindo = false, tempo = 0, vivo = true, dtUlt = 16.7, G = null;
    const fase = { resp: 0 };
    const marcha = { fase: 0, amp: 0, alvoAmp: 0 };
    const remo = { fase: 0, freq: .8, alvo: .8 };
    const cauda = { lag: 0 };
    const baseP = () => P.agua ? NADAR : BASE;
    // pés: no chão (plantados num ponto do mundo) ou livres (a remar, presos ao corpo)
    function neutro(L, frente) {
      const sg = L === 'E' ? -1 : 1, h = P.h * RAD, f = frente || 0;
      const x = P.x + Math.sin(h) * (f - 6) - Math.cos(h) * ABERTO * sg, z = P.gy / sE + Math.cos(h) * (f - 6) + Math.sin(h) * ABERTO * sg;
      return [x, alturaChao(x), z];
    }
    const pes = { E: { p: neutro('E'), h: P.h - 8, tp: 0, dobra: 0, modo: 'chao', ar: false }, D: { p: neutro('D'), h: P.h + 8, tp: 0, dobra: 0, modo: 'chao', ar: false } };

    /* --- desenhar --- */
    const tfE = e => `translate(${n(e.x)},${n(e.y)}) rotate(${n(e.ang)}) scale(${n(e.rx)},${n(e.ry)})`;
    function aplica(r, e) {
      const t = `translate(${n(e.x)},${n(e.y)}) rotate(${n(e.ang)})`;
      poe(r.e, `${t} scale(${n(e.rx)},${n(e.ry)})`);
      if (r.c) poe(r.c, `${t} scale(${n(e.rx + r.o)},${n(e.ry + r.o)})`);
      if (r.l) { const [ox, oy] = luzOff(e, .24); poe(r.l, `translate(${n(e.x + ox)},${n(e.y + oy)}) rotate(${n(e.ang)}) scale(${n(e.rx * .74)},${n(e.ry * .74)})`); }
    }
    const sombraDe = (e, dx, dy, kx, ky) => `translate(${n(e.x + dx)},${n(e.y + dy)}) rotate(${n(e.ang)}) scale(${n(e.rx * kx)},${n(e.ry * ky)})`;
    let ordemAtual = '';
    function desenhar() {
      G = geometria(P, pes);
      for (const nm in RP) aplica(RP[nm], G.el[nm]);
      poe(R.pesc2b, tfE(G.el.pesc2));
      poe(R.clipT, tfE(G.el.tronco)); poe(R.clipP, tfE(G.el.peito));
      const hc = G.el.cabeca; poe(R.clipH, `translate(${n(hc.x)},${n(hc.y)}) rotate(${n(hc.ang)}) scale(${n(hc.rx * .99)},${n(hc.ry * .99)})`);
      const t = G.el.tronco, pe = G.el.peito;
      poe(R.sombraT, sombraDe(t, 12, t.ry * .9, 1.02, .62));
      poe(R.sombraP, sombraDe(pe, 10, pe.ry * .95, .95, .6));
      poe(R.sombraH, sombraDe(hc, 14, hc.ry * .85, .9, .55));
      atr(R.penas, 'd', G.penas || 'M0,0');
      atr(R.caracol, 'opacity', n3(G.caracolOp));
      poe(R.caracol, `${G.caracol} rotate(${n(limita((P._cwTot || 0) - cauda.lag, -40, 40) * 1.4)})`);
      poe(R.tufo, `${G.tufo} rotate(${n(limita(-(P._hx || 0) * 2 - (P.somH || 0) * 12, -30, 30))})`);
      for (const [L] of LADOS) {
        poe(R.asa[L], G.asa[L].m);
        atr(R.asa[L], 'opacity', n3(G.asa[L].op));
        poe(R.pe[L], G['pe' + L]);
      }
      // bico: atrás da cabeça quando aponta para longe
      const slot = G.zBico > 20 ? R.slotF : R.slotA;
      if (R.bico.parentNode !== slot) slot.appendChild(R.bico);
      const ab = G.bocaAberta > .04 ? 'inline' : 'none';
      atr(RP.boca.e, 'display', ab); atr(RP.lingua.e, 'display', G.bocaAberta > .3 ? 'inline' : 'none');
      const ri = visivel(G.risca, .02);
      atr(R.risca, 'd', ri.length > 1 ? liso(ri.map(i => G.risca[i])) : 'M0,0');
      poe(R.unha, tfE(G.unha)); atr(R.unha, 'opacity', n3(limita((G.unha.vis - .05) / .3, 0, 1) * .85));
      G.narinas.forEach((m, i) => { poe(R.nar[i], tfE(m)); atr(R.nar[i], 'opacity', n3(limita((m.vis - .05) / .25, 0, 1))); });
      G.bochechas.forEach((m, i) => { poe(R.boch[i], tfE(m)); atr(R.boch[i], 'opacity', n3(limita((m.vis - .05) / .3, 0, 1) * (.4 + .35 * P.feliz))); });
      desenharOlhos();
      const ordem = Object.keys(G.z).sort((a, b) => G.z[a] - G.z[b]), ch = ordem.join();
      if (ch !== ordemAtual) { ordemAtual = ch; for (const g of ordem) R.partes.appendChild(R.grupos[g]); }
      // sombra no chão (só fora de água)
      const k = 1 - limita(P.salto / 140, 0, .5);
      poe(R.sombra, `translate(${n(P.x + 16)},${n(P.gy + 4)}) scale(${n(150 * k)},${n(30 * k)})`);
      atr(R.sombra, 'opacity', n3(limita(1 + P.y / 30, 0, 1) * (1 - limita(P.salto / 120, 0, .6))));
    }

    /* --- olhos: íris que segue um alvo, pálpebra que desce, olhos contentes, sobrancelha --- */
    const olhar = { foco: null, livre: null, t: 0, g: { E: null, D: null } };
    const focar = f => { olhar.foco = f; };
    function desenharOlhos() {
      const kO = 1 - Math.exp(-dtUlt / 60);
      for (const [L] of LADOS) {
        const o = G.olho[L];
        const vis = o.vis > .04;
        atr(R.olho[L], 'display', vis ? 'inline' : 'none');
        if (!vis) continue;
        poe(R.olho[L], o.m);
        let alvo;
        if (olhar.foco) { const f = olhar.foco(); alvo = vn([f[0] - o.x, -(f[1] - o.y) / cE, 260]); }
        else alvo = vn(vs(vk(G.H.f, .75), vs(vk(VISTA, .55), olhar.livre || [0, 0, 0])));
        olhar.g[L] = olhar.g[L] ? vn(vlerp(olhar.g[L], alvo, kO)) : alvo;
        const g = olhar.g[L];
        let ox = vp(g, o.t1) * RO * .34, oy = vp(g, o.t2) * RO * .34;
        const m = Math.hypot(ox, oy), mx = RO * .3; if (m > mx) { ox *= mx / m; oy *= mx / m; }
        poe(R.iris[L], `translate(${n(ox)},${n(oy)})`);
        const fecho = limita(1 - P['ab' + L] + piscaV, 0, 1);
        const pl = palpebras(fecho, P.feliz);
        atr(R.palpS[L], 'd', pl.sup); atr(R.orla[L], 'd', pl.orla);
        atr(R.palpI[L], 'd', pl.inf); atr(R.orlaI[L], 'd', pl.orlaI);
        const sb = P.sobr || 0, yb = -RO * 1.42 - sb * 5;
        atr(R.sobr[L], 'd', `M${n(-RO * .7)},${n(yb + 3 - sb * 2)}Q0,${n(yb - 4 - sb * 2)} ${n(RO * .7)},${n(yb + 3 - sb * 2)}`);
      }
    }
    let piscaV = 0;
    const pisca = { t: aleat(1500, 3500), f: -1, duplo: false };
    function atualizarPiscar(dt) {
      if (pisca.f < 0) {
        pisca.t -= dt; piscaV = 0;
        if (pisca.t <= 0) { pisca.f = 0; pisca.duplo = !pisca.duplo && Math.random() < .25; }
        return;
      }
      pisca.f += dt;
      const u = pisca.f / 240;
      piscaV = u < .4 ? esai(u / .4) : 1 - eseno(limita((u - .4) / .6, 0, 1));
      if (u >= 1) { piscaV = 0; pisca.f = -1; pisca.t = pisca.duplo ? 140 : aleat(2000, 6000); }
    }
    function atualizarOlharLivre(dt) {
      olhar.t -= dt;
      if (olhar.t > 0) return;
      olhar.t = aleat(800, 2400);
      const r = Math.random();
      if (r < .3) olhar.livre = [0, 0, 2];                  // olha para nós
      else if (r < .5) olhar.livre = null;
      else olhar.livre = [aleat(-.7, .7), aleat(-.3, .4), 0];
    }

    /* --- véu de água: tapa (semitransparente, com a cor do lago) tudo o que está abaixo da superfície.
           Para cada peça que toca na água calcula-se o corte do elipsoide pelo plano da água (uma elipse);
           o véu é a região por baixo do arco da frente desse corte. As peças todas debaixo de água ficam tapadas inteiras. --- */
    function poligonoOrientado(pts) {
      let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q2 = pts[(i + 1) % pts.length]; a += p[0] * q2[1] - q2[0] * p[1]; }
      return a < 0 ? pts.slice().reverse() : pts;
    }
    const caminho = pts => 'M' + pts.map(p => n(p[0]) + ',' + n(p[1])).join('L') + 'Z';
    function atualizarVeu() {
      if (!G) return;
      let d = '', linha = '';
      for (const pt of G.agua) {
        if (pt.quad) { d += caminho(poligonoOrientado(pt.quad)); continue; }
        const e = pt.e, c0 = e.wc, A = e.wa;
        const a = [A[0][1], A[1][1], A[2][1]], la = vl(a);
        if (c0[1] - la >= 0) continue;                                   // toda acima da água
        if (c0[1] + la <= 0) {                                           // toda debaixo de água
          const pts = [], ca = Math.cos(e.ang * RAD), sa = Math.sin(e.ang * RAD);
          for (let i = 0; i < 16; i++) { const t = i / 16 * 2 * PI, x = Math.cos(t) * (e.rx + 2), y = Math.sin(t) * (e.ry + 2); pts.push([e.x + x * ca - y * sa, e.y + x * sa + y * ca]); }
          d += caminho(poligonoOrientado(pts)); continue;
        }
        const dd = -c0[1], an = vk(a, 1 / la), p0 = vk(an, dd / la), r = Math.sqrt(Math.max(0, 1 - dd * dd / (la * la)));
        let e1 = vx(an, [1, 0, 0]); if (vl(e1) < .1) e1 = vx(an, [0, 0, 1]); e1 = vn(e1);
        const e2 = vx(an, e1), pts = [];
        for (let i = 0; i < 24; i++) {
          const t = i / 24 * 2 * PI, p = vs(p0, vs(vk(e1, r * Math.cos(t)), vk(e2, r * Math.sin(t))));
          pts.push([c0[0] + A[0][0] * p[0] + A[1][0] * p[1] + A[2][0] * p[2], (c0[2] + A[0][2] * p[0] + A[1][2] * p[1] + A[2][2] * p[2]) * sE]);
        }
        let iMin = 0, iMax = 0;
        pts.forEach((p, i) => { if (p[0] < pts[iMin][0]) iMin = i; if (p[0] > pts[iMax][0]) iMax = i; });
        const cadeia = passo => { const v = []; for (let i = iMin; ; i = (i + passo + 24) % 24) { v.push(pts[i]); if (i === iMax) break; } return v; };
        const c1 = cadeia(1), c2 = cadeia(-1);
        const media = v => v.reduce((s, p) => s + p[1], 0) / v.length;
        const frente = media(c1) > media(c2) ? c1 : c2;
        const yb = Math.max(...frente.map(p => p[1])) + 160;
        const l = frente[0], u = frente[frente.length - 1];
        d += 'M' + frente.map(p => n(p[0]) + ',' + n(p[1])).join('L') + `L${n(u[0])},${n(yb)}L${n(l[0])},${n(yb)}Z`;
        if (pt.linha && frente.length > 2) linha += liso(frente);
      }
      atr(R.veu, 'd', d || 'M0,0');
      atr(R.linhaAgua, 'd', linha || 'M0,0');
    }

    /* --- ondas: anéis à volta do pato (metade de trás atrás dele, metade da frente por cima do véu) e ondinhas soltas --- */
    const aneis = R.anT.map((el, i) => ({ elT: R.anT[i], elF: R.anF[i], tt: 1, dur: 1, vis: false }));
    function anel(x, y, r0, r1, dur, f, atraso) {
      const o = aneis.find(o => o.tt >= o.dur) || aneis.reduce((a, b) => a.tt / a.dur > b.tt / b.dur ? a : b);
      Object.assign(o, { x, y, r0, r1, dur, f, tt: -(atraso || 0) });
    }
    function atualizarAneis(dt) {
      for (const o of aneis) {
        if (o.tt >= o.dur) { if (o.vis) { atr(o.elT, 'opacity', '0'); atr(o.elF, 'opacity', '0'); o.vis = false; } continue; }
        o.tt += dt; if (o.tt < 0) continue;
        const u = Math.min(1, o.tt / o.dur), r = lerp(o.r0, o.r1, esai(u)), ry = r * sE * 1.05;
        const a = `M${n(o.x - r)},${n(o.y)}A${n(r)},${n(ry)} 0 0 1 ${n(o.x + r)},${n(o.y)}`, b = `M${n(o.x - r)},${n(o.y)}A${n(r)},${n(ry)} 0 0 0 ${n(o.x + r)},${n(o.y)}`;
        const op = n3(o.f * Math.pow(1 - u, 1.2)), w = n(1.2 + 3 * (1 - u));
        atr(o.elT, 'd', a); atr(o.elF, 'd', b); atr(o.elT, 'opacity', op); atr(o.elF, 'opacity', op); atr(o.elT, 'stroke-width', w); atr(o.elF, 'stroke-width', w);
        o.vis = true;
      }
    }
    const ondas = R.ondas.map(el => ({ el, t: 1, dur: 1, vis: false }));
    function onda(x, y, r0, r1, dur, f, atraso) {
      const o = ondas.find(o => o.t >= o.dur) || ondas.reduce((a, b) => a.t / a.dur > b.t / b.dur ? a : b);
      Object.assign(o, { x, y, r0, r1, dur, f, t: -(atraso || 0) });
    }
    function atualizarOndas(dt) {
      for (const o of ondas) {
        if (o.t >= o.dur) { if (o.vis) { atr(o.el, 'opacity', '0'); o.vis = false; } continue; }
        o.t += dt; if (o.t < 0) continue;
        const u = Math.min(1, o.t / o.dur), r = lerp(o.r0, o.r1, esai(u));
        atr(o.el, 'cx', n(o.x)); atr(o.el, 'cy', n(o.y)); atr(o.el, 'rx', n(r)); atr(o.el, 'ry', n(r * .31));
        atr(o.el, 'opacity', n3(o.f * Math.pow(1 - u, 1.3))); atr(o.el, 'stroke-width', n(1 + 2.4 * (1 - u)));
        o.vis = true;
      }
    }
    // gotas (e migalhas de erva quando debica): caem com gravidade; na água fazem uma ondinha
    const gotas = R.gotas.map(el => ({ el, vivo: false }));
    function gota(x, y, vx, vy, r, yChao, cor) {
      const g = gotas.find(g => !g.vivo); if (!g) return;
      Object.assign(g, { x, y, vx, vy, r, yChao, vivo: true });
      atr(g.el, 'fill', cor || 'url(#pato-gota)'); atr(g.el, 'opacity', '.95');
    }
    function salpicar(x, y, quantas, forca, larg) {
      for (let i = 0; i < quantas; i++) { const a = aleat(-1, 1); gota(x + a * (larg || 30), y - aleat(0, 8), a * aleat(80, 240) * forca, -aleat(240, 480) * forca, aleat(3, 6), y + aleat(4, 22)); }
    }
    function atualizarGotas(dt) {
      const s = dt / 1000;
      for (const g of gotas) {
        if (!g.vivo) continue;
        g.vy += 1500 * s; g.x += g.vx * s; g.y += g.vy * s;
        if (g.vy > 0 && g.y > g.yChao) { g.vivo = false; atr(g.el, 'opacity', '0'); if (naAgua(g.x, g.yChao) && g.el.__fill === 'url(#pato-gota)') onda(g.x, g.yChao, 1, 12, 520, .55); continue; }
        poe(g.el, `translate(${n(g.x)},${n(g.y)}) scale(${n(g.r * .85)},${n(g.r * (1 + Math.min(.5, Math.abs(g.vy) / 900)))})`);
      }
    }
    // gotas que saltam das penas (ao sacudir-se ou ao bater as asas molhado)
    function gotasDoCorpo(quantas, forca) {
      if (!G) return;
      for (let i = 0; i < quantas; i++) {
        const e = escolhe([G.el.tronco, G.el.cabeca, G.el.cauda, G.el.peito]), a = aleat(0, 2 * PI);
        const x = e.x + Math.cos(a) * e.rx * .8, y = e.y + Math.sin(a) * e.ry * .7 - 10;
        gota(x, y, Math.cos(a) * aleat(120, 300) * forca, -aleat(150, 420) * forca, aleat(2.5, 5), P.gy + aleat(-10, 30));
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

    /* --- passos de pato (por distância): cada pé fica plantado num ponto do mundo e só se levanta na sua vez;
           no ar, os dedos dobram-se para baixo e a membrana fecha-se; o corpo balança para o lado do pé que está no chão --- */
    const JANELA = { E: 0, D: .5 }, LARG = .44;
    function atualizarPes(avanca, resto) {
      const f = ((marcha.fase % 1) + 1) % 1, h = P.h * RAD, F = [Math.sin(h), 0, Math.cos(h)];
      for (const [L, sg] of LADOS) {
        const pe = pes[L];
        if (pe.modo !== 'chao') continue;
        const w0 = (f - JANELA[L] + 1) % 1, noAr = w0 < LARG;
        if (noAr && !pe.ar) { pe.ar = true; pe.ps = pe.p.slice(); pe.hs = pe.h; }
        if (!pe.ar) continue;
        const w = noAr ? w0 / LARG : 1;
        const falta = avanca ? Math.min(resto, (1 - w) * LARG * 2 * SL) : 0;
        const fr = avanca ? .5 * SL * limita(resto / SL, 0, 1) : 0;
        const a = neutro(L, falta + fr);
        a[0] += 0; pe.alvo = a;
        const e = eio(w);
        pe.p = [lerp(pe.ps[0], a[0], e), lerp(pe.ps[1], a[1], e) + 13 * Math.sin(PI * w), lerp(pe.ps[2], a[2], e)];
        pe.h = lerp(pe.hs, P.h + 8 * sg, w); pe.tp = 55 * Math.sin(PI * w); pe.dobra = Math.sin(PI * w);
        if (!noAr) aterrar(L);
      }
      void F;
    }
    function aterrar(L) {
      const pe = pes[L];
      pe.ar = false; pe.tp = 0; pe.dobra = 0; if (pe.alvo) pe.p = pe.alvo.slice();
      if (pe.p[1] < -1) { const s = [pe.p[0], pe.p[2] * sE]; onda(s[0] + 20, s[1], 4, 34, 700, .6); }
    }
    function* moverPe(L, ms) {                       // um passo isolado até ao sítio de descanso
      const pe = pes[L], sg = L === 'E' ? -1 : 1, ps = pe.p.slice(), hs = pe.h;
      pe.ar = true;
      yield* durante(ms, u => { const a = neutro(L), e = eio(u); pe.alvo = a; pe.p = [lerp(ps[0], a[0], e), lerp(ps[1], a[1], e) + 11 * sino(u), lerp(ps[2], a[2], e)]; pe.h = lerp(hs, P.h + 8 * sg, u); pe.tp = 48 * sino(u); pe.dobra = sino(u); });
      aterrar(L);
    }
    function* assentar(ms) {                         // o último passo acaba e os pés que ficaram longe dão um passo
      for (const [L] of LADOS) if (pes[L].modo === 'chao' && pes[L].ar) yield* moverPe(L, ms || 130);
      for (const [L, sg] of LADOS) {
        const pe = pes[L]; if (pe.modo !== 'chao') continue;
        const a = neutro(L);
        if (Math.hypot(pe.p[0] - a[0], pe.p[2] - a[2]) > 9 || Math.abs(pe.h - (P.h + 8 * sg)) > 14) yield* moverPe(L, 170);
      }
    }
    function* virar(h1, ms, semAssentar) {                        // vira primeiro a cabeça, depois o corpo, a dar passinhos no sítio
      const h0 = P.h, dh = h1 - h0;
      if (Math.abs(dh) < 2) { P.h = h1; return; }
      const lead = limita(dh, -45, 45) * .8, hy0 = P.hY;
      yield* durante(ms * .3, u => { P.hY = lerp(hy0, lead, esai(u)); });
      marcha.alvoAmp = .6;
      let t = 0;
      for (;;) {
        const u = Math.min(1, t / ms);
        P.h = h0 + dh * eio(u); P.hY = lead * (1 - eio(u));
        if (u >= 1) break;
        const dt = yield; t += dt;
        marcha.fase += dt / 330;
        atualizarPes(false, 0);
      }
      marcha.alvoAmp = 0;
      if (!semAssentar) yield* assentar(120);
    }
    function* andar(x1, vel, opc) {                  // anda em linha reta (no x) com o andar bamboleante
      opc = opc || {};
      const x0 = P.x, dist = Math.abs(x1 - x0), sg = Math.sign(x1 - x0) || 1;
      let s = 0;
      marcha.alvoAmp = 1;
      while (s < dist - .01) {
        const dt = yield;
        const v = vel * limita(Math.min((s + 10) / 40, opc.semTravar ? 1 : (dist - s + 6) / 34), .22, 1);
        const ds = Math.min(dist - s, v * dt / 1000); s += ds;
        P.x = x0 + sg * s; P.y = alturaChao(P.x);
        marcha.fase += ds / (2 * SL);
        atualizarPes(true, opc.semTravar ? 1e3 : dist - s);
        if (opc.cada) opc.cada(s / dist);
      }
      if (!opc.semTravar) { marcha.alvoAmp = 0; yield* assentar(); }
    }
    // a nadar: os pés soltam-se do chão e remam presos ao corpo (vêem-se através do véu de água)
    function soltarPes() { for (const [L] of LADOS) { const pe = pes[L]; pe.modo = 'livre'; pe.mix = 0; pe.pFixo = pe.p.slice(); pe.ar = false; } }
    function* pousarPes(ms) {
      const ini = { E: pes.E.p.slice(), D: pes.D.p.slice() };
      for (const [L] of LADOS) { pes[L].modo = 'chao'; pes[L].ar = true; }
      yield* durante(ms, u => { for (const [L, sg] of LADOS) { const a = neutro(L), e = eio(u); pes[L].p = vlerp(ini[L], a, e); pes[L].tp = 30 * (1 - u); pes[L].h = P.h + 8 * sg; pes[L].dobra = .4 * (1 - u); } });
      for (const [L] of LADOS) { pes[L].ar = false; pes[L].p = neutro(L); pes[L].tp = 0; pes[L].dobra = 0; }
    }
    function atualizarRemo(dt) {
      remo.freq += (remo.alvo - remo.freq) * (1 - Math.exp(-dt / 300));
      remo.fase += dt / 1000 * remo.freq;
      const h = P.h * RAD, o = [P.x, P.y + (P._boia || 0), P.gy / sE], F = [Math.sin(h), 0, Math.cos(h)], S = [-Math.cos(h), 0, Math.sin(h)];
      const R0 = ref(o, F, [0, 1, 0], S);
      for (const [L, sg] of LADOS) {
        const pe = pes[L]; if (pe.modo !== 'livre') continue;
        const th = 2 * PI * (remo.fase + (L === 'D' ? .5 : 0)), sn = Math.sin(th);
        const livre = ponto(R0, -14 + 22 * Math.cos(th), 22 + 6 * sn + (P.cH - NADAR.cH) * .6, 27 * sg);
        pe.mix = Math.min(1, (pe.mix || 0) + dt / 260);
        pe.p = pe.mix < 1 ? vlerp(pe.pFixo, livre, eio(pe.mix)) : livre;
        pe.h = P.h + 6 * sg; pe.tp = 38 + 30 * sn; pe.dobra = .5 - .5 * sn;
      }
    }
    function* nadar(x1, vel, opc) {
      opc = opc || {};
      const x0 = P.x, dist = Math.abs(x1 - x0), sg = Math.sign(x1 - x0) || 1;
      let s = 0, ultAnel = 0;
      remo.alvo = 3;
      while (s < dist - .01) {
        const dt = yield;
        const v = vel * limita(Math.min(opc.lancado ? 1 : (s + 10) / 40, (dist - s + 8) / 46), .2, 1);
        const ds = Math.min(dist - s, v * dt / 1000); s += ds;
        P.x = x0 + sg * s;
        ultAnel += dt;
        if (ultAnel > 330) { ultAnel = 0; anel(P.x - sg * 30, P.gy, 70, 150, 1100, .5); }
        if (opc.cada) opc.cada(s / dist);
      }
      remo.alvo = .8;
    }

    /* --- extras de cada quadro: balanço do andar, cauda, respiração, boiar --- */
    function atualizarExtras(dt) {
      marcha.amp += (marcha.alvoAmp - marcha.amp) * (1 - Math.exp(-dt / 140));
      const f = marcha.fase * 2 * PI, a = marcha.amp, t = tempo / 1000;
      P._resp = Math.sin(fase.resp);
      P._rl = 7.5 * a * Math.sin(f);
      P._lado = 4 * a * Math.sin(f);
      P._bob = 3.2 * a * -Math.cos(2 * f) + 1.1 * P._resp;
      P._hx = 3.5 * a * Math.sin(2 * f + 1);
      P._cwTot = -14 * a * Math.sin(f - .7) + 5 * Math.sin(t * 1.7) * calma + (P.somT || 0);
      P._cw = P._cwTot;
      cauda.lag += (P._cwTot - cauda.lag) * (1 - Math.exp(-dt / 110));
      if (P.agua) { P._boia = 2.4 * Math.sin(t * 1.25) * calma; P._pb = 1.4 * Math.sin(t * 1.25 + .9) * calma; }
      else { P._boia = 0; P._pb = 0; }
      atualizarRemo(dt);
    }

    /* --- arrumar antes de ir ou voltar: asas dobradas, bico fechado, cabeça direita --- */
    function* arrumar(ms) {
      const b = baseP(), alvo = { bico: 0, feliz: 0, sobr: 0, abE: 1, abD: 1, salto: 0 };
      for (const k of CHAVES) if (Math.abs(P[k] - b[k]) > .3) alvo[k] = b[k];
      yield* juntos(tw(alvo, ms, eio), P.agua ? espera(0) : assentar(100));
    }
    function* recompor() {
      yield* assentar();
      if (Math.abs(P.x - REPOUSO.x) > 6) { yield* virar(P.x < REPOUSO.x ? 90 : -90, 360); yield* andar(REPOUSO.x, 130); }
      if (Math.abs(P.h - REPOUSO.h) > 3) yield* virar(REPOUSO.h, 380);
      const dif = {}; let ha = false;
      for (const k of CHAVES) if (Math.abs(P[k] - BASE[k]) > .3) { dif[k] = BASE[k]; ha = true; }
      if (ha) yield* tw(dif, 280);
    }

    /* --- comportamentos (no prado) --- */
    function* alisarPenas() {                        // vira a cabeça para trás e alisa as penas da asa com o bico
      const b = baseP(), [L, sg] = escolhe(LADOS);
      yield* tw({ hx: -26, hy: 64, hz: 50 * sg, hY: 140 * sg, hP: -36, hR: -10 * sg, cR: 5 * sg, ['a' + L]: .18, ['bat' + L]: 12 }, 560, eio);
      yield* durante(1500, u => { const w = Math.sin(u * PI * 7); P.hx = -26 + 9 * w; P.hy = 64 - 5 * Math.abs(w); P.bico = .1 + .1 * Math.sin(u * PI * 18); P.hP = -36 + 6 * w; P['a' + L] = .18 + .06 * Math.sin(u * PI * 5); });
      yield* tw({ bico: 0, ['a' + L]: 0, ['bat' + L]: 30 }, 200);
      yield* tw({ hx: b.hx, hy: b.hy, hz: 0, hY: 0, hP: b.hP, hR: 0, cR: 0 }, 520, eio);
      yield* tw({ puff: .6 }, 150, esai);
      yield* durante(380, u => { P.cR = 7 * Math.sin(u * PI * 6) * (1 - u); P.puff = .6 * (1 - u); });
      P.cR = 0; P.puff = 0;
    }
    function* baterAsas() {                          // estica-se, abre as asas e bate-as (na água levanta-se e salpica)
      const b = baseP(), ag = !!P.agua;
      yield* tw({ cH: b.cH - 10, sq: .04, cP: b.cP - 4, sobr: .5 }, 160, eio);
      if (ag) anel(P.x, P.gy, 80, 170, 1000, .7);
      yield* tw({ cH: b.cH + (ag ? 20 : 14), sq: 0, cP: ag ? 30 : 44, hx: 4, hy: 130, hP: 10, aE: 1, aD: 1, batE: 72, batD: 72 }, 300, esai);
      for (let i = 0; i < 4; i++) {
        yield* tw({ batE: -16, batD: -16 }, 120, eio);
        if (ag) { anel(P.x, P.gy, 60, 140, 800, .55); salpicar(P.x - 120, P.gy - 4, 2, .7, 20); salpicar(P.x + 120, P.gy - 2, 2, .7, 20); }
        if (P.molhado > .2) gotasDoCorpo(2, .8);
        yield* tw({ batE: 74, batD: 74 }, 150, eio);
      }
      yield* tw({ batE: 30, batD: 30, aE: 0, aD: 0, cP: b.cP, cH: b.cH, hx: b.hx, hy: b.hy, hP: b.hP, sobr: 0 }, 380, eio);
      if (ag) anel(P.x, P.gy, 90, 180, 1100, .7);
      yield* durante(420, u => { P.cY = 20 * Math.sin(u * PI * 6) * (1 - u); });
      P.cY = 0;
    }
    function* abanarCauda() {
      yield* tw({ feliz: .4 }, 150);
      yield* durante(1000, u => { P.cY = 30 * Math.sin(u * PI * 10) * sino(u * 1.1); P.cR = -3 * Math.sin(u * PI * 10) * sino(u); P.cU = 12 * sino(u); });
      P.cY = 0; P.cR = 0; P.cU = 0;
      yield* tw({ feliz: 0 }, 300);
    }
    function* seguirCom(alvo, ms) {                  // a cabeça e os olhos seguem um bicho que voa
      focar(alvo);
      yield* tw({ sobr: .6 }, 200);
      let t = 0;
      while (t < ms) {
        const dt = yield; t += dt;
        if (!G) continue;
        const p = alvo(), dx = p[0] - G.cab[0], dy = p[1] - G.cab[1];
        const hAbs = limita(dx / 5, -85, 85), yaw = limita(hAbs - P.h, -60, 60), pit = limita(-dy / 5, -25, 40);
        const k = 1 - Math.exp(-dt / 260);
        P.hY += (yaw - P.hY) * k; P.hP += (pit - P.hP) * k; P.hR += (limita(-yaw / 5, -10, 10) - P.hR) * k;
      }
      focar(null);
    }
    function* olharBorboleta() {
      borb.chamar = true;
      yield* seguirCom(() => [borb.x, borb.y], 3800);
      borb.chamar = false;
      const b = baseP();
      yield* tw({ hY: 0, hP: b.hP, hR: 0, sobr: 0 }, 420);
    }
    function* debicar() {                            // debica o chão: vira-se de lado, o pescoço desce e o bico abre e fecha
      yield* virar(78, 320);
      yield* tw({ hx: 66, hy: -70, hP: -60, cP: 0, cF: 4 }, 450, eio);
      for (let i = 0; i < 3; i++) {
        yield* tw({ hy: -84, hx: 70, bico: .3 }, 110, eentra);
        if (G) { const tip = G.el.bicoS; for (let k = 0; k < 3; k++) gota(tip.x + aleat(-12, 20), tip.y + 10, aleat(-90, 90), -aleat(120, 260), aleat(1.6, 2.6), P.gy + aleat(-6, 10), escolhe(['#7DB24A', '#A8D468', '#C9A45A'])); }
        yield* tw({ hy: -66, hx: 66, bico: 0 }, 160, esai);
        yield* espera(aleat(80, 220));
      }
      yield* tw({ hx: BASE.hx, hy: BASE.hy, hP: BASE.hP, cP: BASE.cP, cF: 0 }, 480, eio);
      yield* tw({ hP: 16, hy: BASE.hy + 6 }, 160); yield* tw({ hP: BASE.hP, hy: BASE.hy }, 220);
    }
    function* sacudir(ms) {                          // sacode-se todo: o corpo balança, a cabeça vai ao contrário, as penas eriçam-se
      ms = ms || 650;
      const molh = P.molhado > .2;
      yield* tw({ puff: .7, aE: .14, aD: .14, sobr: .4 }, 130, esai);
      let gt = 0;
      yield* durante(ms, (u, t) => {
        const w = Math.sin(u * PI * 9) * (1 - u * .6);
        P.cR = 16 * w; P.hR = -20 * w; P.hY = 16 * Math.sin(u * PI * 9 + 1) * (1 - u); P.cY = -24 * w; P.puff = .7 * (1 - u * .7);
        P.abE = P.abD = .25;
        if (molh && t - gt > 45) { gt = t; gotasDoCorpo(2, 1); }
      });
      P.molhado = 0;
      yield* tw({ cR: 0, hR: 0, hY: 0, cY: 0, puff: 0, aE: 0, aD: 0, abE: 1, abD: 1, sobr: 0 }, 220, eio);
    }
    function* passear() {                            // dá uns passos até à cerca e volta
      yield* virar(90, 340);
      yield* andar(REPOUSO.x + 80, 110);
      yield* juntos(tw({ hY: -30, hP: 6 }, 300), espera(700));
      yield* tw({ hY: 0, hP: BASE.hP }, 300);
      yield* virar(-90, 460);
      yield* andar(REPOUSO.x, 110);
      yield* virar(REPOUSO.h, 380);
    }
    const COMPORTAMENTOS = { alisarPenas, baterAsas, abanarCauda, olharBorboleta, debicar, sacudir: () => sacudir(), passear };
    let ultimoComp = null;
    function* cicloFora() {
      for (;;) {
        yield* recompor();
        yield* espera(aleat(4000, 9000));
        let nome; do nome = escolhe(Object.keys(COMPORTAMENTOS)); while (nome === ultimoComp);
        ultimoComp = nome;
        yield* COMPORTAMENTOS[nome]();
      }
    }

    /* --- no lago: boia, rema devagar, mergulha a cabeça («rabo para o ar»), sacode-se, bate as asas, nada um bocadinho --- */
    function* mergulhar() {
      yield* tw({ hy: NADAR.hy + 10, hP: 12, sobr: .5 }, 200, esai);
      remo.alvo = 2.5;
      yield* tw({ cP: -66, cH: 66, cF: 14, hx: 54, hy: -62, hP: -42, cU: 26, sobr: 0 }, 460, eio);
      anel(P.x + 60, P.gy, 30, 120, 900, .8); salpicar(P.x + 70, P.gy, 5, .5, 20);
      yield* durante(1300, u => { P.cY = 20 * Math.sin(u * PI * 8); remo.alvo = 4; });
      P.cY = 0;
      yield* tw({ cP: NADAR.cP, cH: NADAR.cH, cF: 0, hx: NADAR.hx, hy: NADAR.hy, hP: NADAR.hP + 10, cU: 0 }, 460, eio);
      remo.alvo = .8;
      anel(P.x + 40, P.gy, 30, 130, 900, .7);
      let gt = 0;
      yield* durante(500, (u, t) => {
        P.hR = 24 * Math.sin(u * PI * 8) * (1 - u); P.hY = 14 * Math.sin(u * PI * 8 + 1) * (1 - u);
        if (t - gt > 60 && G) { gt = t; const hc = G.el.cabeca; gota(hc.x + aleat(-30, 30), hc.y, aleat(-200, 200), -aleat(100, 300), aleat(2.5, 4.5), P.gy + aleat(0, 20)); }
      });
      yield* tw({ hR: 0, hY: 0, hP: NADAR.hP }, 200);
    }
    function* nadarUmPouco() {
      remo.alvo = 2.2;
      yield* juntos(tw({ h: 90 }, 600, eio), (function* () { yield* espera(200); yield* nadar(NO_LAGO.x + 70, 90); })());
      yield* espera(300);
      yield* juntos(tw({ h: -90 }, 700, eio), (function* () { yield* espera(300); yield* nadar(NO_LAGO.x, 90); })());
      yield* tw({ h: NO_LAGO.h }, 500, eio);
      remo.alvo = .8;
    }
    function* olharLibelula() {
      lib.chamar = true;
      yield* seguirCom(() => [lib.x, lib.y], 3200);
      lib.chamar = false;
      yield* tw({ hY: 0, hP: NADAR.hP, hR: 0, sobr: 0 }, 400);
    }
    const NO_LAGO_COMP = { mergulhar, sacudir: () => sacudir(560), baterAsas, alisarPenas, olharLibelula, nadarUmPouco };
    let ultimoDentro = null;
    function* cicloDentro() {
      for (;;) {
        yield* espera(aleat(1300, 2400));
        let nome; do nome = escolhe(Object.keys(NO_LAGO_COMP)); while (nome === ultimoDentro);
        ultimoDentro = nome;
        yield* NO_LAGO_COMP[nome]();
        const dif = {}; for (const k of CHAVES) if (k !== 'h' && Math.abs(P[k] - NADAR[k]) > .3) dif[k] = NADAR[k];
        yield* tw(dif, 250);
      }
    }

    /* --- reação ao toque: olhos contentes, sobrancelhas para cima, salto com as asas a bater e a cauda a abanar --- */
    function* reacao() {
      reagindo = true; marcha.alvoAmp = 0;
      const s0 = P.salto, b = BASE;
      const rosto = tw({ feliz: .85, sobr: 1, bico: .25, olhosEsc: 1.08, abE: 1, abD: 1, hx: b.hx, hy: b.hy, hz: 0, hY: 0, hP: 6, hR: 0, cP: b.cP, cR: 0, cF: 0, cU: 0, puff: 0 }, 90, esai);
      const corpo = (function* () {
        if (s0 < 3) yield* tw({ cH: b.cH - 12, sq: .06, aE: .3, aD: .3 }, 70, esai);
        const c0 = P.cH;
        yield* durante(400, u => {
          P.salto = lerp(s0, 0, u) + 44 * 4 * u * (1 - u); P.sq = -.06 * sino(u);
          P.batE = P.batD = 40 + 42 * Math.sin(u * PI * 6); P.aE = P.aD = .1 + .6 * sino(u * 1.15);
          P.cH = lerp(c0, b.cH, Math.min(1, u * 3)); P.cY = 26 * Math.sin(u * PI * 8);
        });
        P.salto = 0;
        yield* tw({ sq: .08, cH: b.cH - 8, aE: 0, aD: 0, batE: 30, batD: 30 }, 80, esai);
        yield* tw({ sq: 0, cH: b.cH, cY: 0 }, 200, eio);
      })();
      yield* juntos(rosto, corpo, assentar(90));
      yield* juntos(tw({ bico: 0, hP: b.hP }, 160), durante(520, u => { P.cY = 18 * Math.sin(u * PI * 6) * (1 - u); P.hR = 8 * Math.sin(u * PI * 3) * (1 - u); }));
      reagindo = false;
      yield* tw(Object.assign({}, ROSTO, { cY: 0, hR: 0 }), 380);
    }
    function* reacaoAgua() {                         // dentro do lago: levanta-se na água, bate as asas duas vezes e salpica
      reagindo = true;
      const b = NADAR;
      const rosto = tw({ feliz: .85, sobr: 1, bico: .25, olhosEsc: 1.08, abE: 1, abD: 1, hx: b.hx, hy: b.hy, hz: 0, hY: 0, hP: 8, hR: 0, cF: 0, cU: 0, puff: 0 }, 90, esai);
      const corpo = (function* () {
        yield* tw({ cH: b.cH + 18, cP: 26, aE: 1, aD: 1, batE: 70, batD: 70 }, 140, esai);
        anel(P.x, P.gy, 80, 170, 1000, .75);
        for (let i = 0; i < 2; i++) {
          yield* tw({ batE: -14, batD: -14 }, 100, eio);
          salpicar(P.x - 110, P.gy - 4, 3, .7, 20); salpicar(P.x + 110, P.gy - 2, 3, .7, 20); anel(P.x, P.gy, 60, 140, 800, .55);
          yield* tw({ batE: 72, batD: 72 }, 120, eio);
        }
        yield* tw({ cH: b.cH, cP: b.cP, aE: 0, aD: 0, batE: 30, batD: 30 }, 260, eio);
        anel(P.x, P.gy, 90, 190, 1100, .8);
      })();
      yield* juntos(rosto, corpo);
      yield* juntos(tw({ bico: 0, hP: b.hP }, 160), durante(520, u => { P.cY = 20 * Math.sin(u * PI * 6) * (1 - u); }));
      reagindo = false;
      yield* tw(Object.assign({}, ROSTO, { cY: 0, feliz: .25 }), 380);
    }

    /* --- som: «quá quá». Em cada sílaba o bico abre, a cabeça dá um impulso para a frente e a cauda abana --- */
    function* qua(ms) {
      yield* durante(ms, u => {
        const k = u < .18 ? esai(u / .18) : u < .62 ? 1 : 1 - eseno((u - .62) / .38);
        P.somB = .85 * k; P.somH = Math.sin(PI * Math.min(1, u * 1.15)); P.somT = 14 * Math.sin(u * PI * 3) * (1 - u);
      });
      P.somB = 0; P.somH = 0; P.somT = 0;
    }
    function* quaSilabas(silabas) {
      let t = 0;
      for (const [a, d] of silabas) {
        if (a > t) yield* espera((a - t) * 1000);
        yield* qua(limita(d * 1000, 140, 900));
        t = a + Math.max(d, .14);
      }
    }
    function* quaMs(ms) {
      const nQ = limita(Math.round(ms / 420), 1, 4), per = ms / nQ;
      for (let i = 0; i < nQ; i++) { yield* qua(per * .72); yield* espera(per * .28); }
    }

    /* --- ida ao lago: vira-se, vai a bambolear até à margem, entra na água (anéis e salpicos), começa a boiar e a remar,
           nada até ao meio e vira-se para nós; abana a cauda (o lago responde com ondas) --- */
    function* idaAoLago() {
      modo = 'indo'; reagindo = false;
      focar(() => [NO_LAGO.x + 40, NO_LAGO.gy - 30]);
      yield* juntos(arrumar(120), virar(90, 280, true));
      let molhou = false;
      yield* andar(MARGEM + 84, 205, { semTravar: true, cada: () => {
        if (!molhou && P.y < -34) { molhou = true; P.molhado = 1; anel(P.x + 20, P.gy, 70, 200, 1300, .9); anel(P.x + 20, P.gy, 60, 140, 1000, .7, 250); salpicar(P.x + 60, P.gy, 7, .75, 40); }
      } });
      marcha.alvoAmp = 0;
      P.agua = 1; soltarPes();
      yield* juntos(nadar(NO_LAGO.x, 205, { lancado: true }), tw({ cH: NADAR.cH, cP: NADAR.cP, hx: NADAR.hx, hy: NADAR.hy }, 400),
        (function* () { yield* espera(260); yield* virarNaAgua(NO_LAGO.h, 520); })());
      focar(null);
      anel(P.x, P.gy, 90, 200, 1300, .8); anel(P.x, P.gy, 80, 150, 1000, .6, 300);
      modo = 'dentro';
      yield* juntos(tw({ feliz: .3, cP: NADAR.cP + 4 }, 300), durante(450, u => { P.cY = 24 * Math.sin(u * PI * 6) * (1 - u); P.y = -FLUT - 6 * sino(u * 1.4); }));
      P.cY = 0; P.y = -FLUT;
    }
    function* virarNaAgua(h1, ms) {                  // na água vira-se a remar, sem passos (cabeça primeiro)
      const h0 = P.h, dh = h1 - h0, lead = limita(dh, -45, 45) * .7;
      remo.alvo = 3;
      yield* durante(ms, u => { P.h = h0 + dh * eio(limita((u - .15) / .85, 0, 1)); P.hY = lead * Math.sin(PI * Math.min(1, u * 1.1)); });
      P.hY = 0;
    }
    /* --- volta: vira-se para a margem a remar, sai da água a bambolear, sacode-se (gotas) e vai para o sítio --- */
    function* voltaDoLago() {
      modo = 'voltando'; reagindo = false;
      focar(() => [REPOUSO.x - 40, REPOUSO.gy - 90]);
      yield* juntos(arrumar(100), virarNaAgua(-90, 320), (function* () { yield* espera(100); yield* nadar(MARGEM + 80, 260); })());
      anel(P.x, P.gy, 70, 160, 1000, .7);
      yield* pousarPes(130);
      P.agua = 0;
      salpicar(P.x + 50, P.gy, 4, .5, 30);
      // sai da água a bambolear e sacode-se pelo caminho (as gotas saltam das penas)
      yield* juntos(andar(REPOUSO.x, 275), tw({ cH: BASE.cH, cP: BASE.cP, hx: BASE.hx, hy: BASE.hy }, 380), (function* () { yield* espera(420); yield* sacudir(380); })());
      yield* virar(REPOUSO.h, 200);
      focar(null);
      modo = 'fora';
    }

    /* --- cenário vivo --- */
    const lib = { x: 1250, y: 560, de: [1250, 560], para: [1250, 560], t: 0, dur: 1, pairar: 1500, voar: false, esc: 1, escAlvo: 1, by: 560, chamar: false };
    const borb = { x: 430, y: 470, vx: 0, vy: 0, alvo: [430, 470], t: 0, chamar: false };
    function animarCena(dt) {
      const t = tempo / 1000;
      NUV.forEach((c, i) => {
        const x = ((c.x + 200 + t * (4 + i * 1.6) * calma) % 2000) - 200;
        poe(R.nuvens[i], `translate(${n(x)},${c.y}) scale(${c.k})`);
        poe(R.refl[i], `translate(${n(x)},${n(572 + (572 - c.y) * .5)}) scale(${c.k},${n3(-c.k * .4)})`);
      });
      R.aves.forEach((a, i) => { const x = ((t * (16 + i * 3) + i * 140) % 2400) - 300, y = 200 + i * 14 + 6 * Math.sin(t * .7 + i); poe(a, `translate(${n(x)},${n(y)}) scale(1,${n3(.55 + .45 * Math.abs(Math.sin(t * 4 + i)))})`); });
      poe(R.velas, `translate(${MOINHO.x},${MOINHO.y}) rotate(${n(t * 22 * calma % 360)})`);
      poe(R.copa, `rotate(${n3(.6 * Math.sin(t * .6) * calma)},140,300)`);
      R.juncos.forEach((g, i) => { if (g) poe(g, `rotate(${n3((1.2 + (i % 4) * .5) * Math.sin(t * (.7 + (i % 3) * .15) + i * 1.3) * calma)})`); });
      R.brilhos.forEach((b, i) => poe(b, `translate(${n(6 * Math.sin(t * (.5 + (i % 5) * .1) + i) * calma)},0)`));
      R.cint.forEach((c, i) => { const f = cintFase[i]; atr(c, 'opacity', n3(Math.pow(Math.max(0, Math.sin(t * f.f + f.ph)), 12))); });
      poe(R.penaLago, `translate(${n(1250 + 14 * Math.sin(t * .2))},${n(800 + 2 * Math.sin(t * 1.1))}) rotate(${n(6 * Math.sin(t * .5))})`);
      fumo.forEach(f => {
        const u = (f.f + t * .09 * calma) % 1;
        poe(f.el, `translate(${n(CHAMINE.x + 30 * u + 6 * Math.sin(u * 7 + f.f * 9))},${n(CHAMINE.y - 120 * u)}) scale(${n(8 + 26 * u)})`);
        atr(f.el, 'opacity', n3(.85 * Math.sin(PI * u) * (1 - u * .5)));
      });
      // libélula: voa aos repelões por cima do lago e paira
      lib.t += dt;
      if (!lib.voar) {
        if (lib.t > lib.pairar) {
          lib.voar = true; lib.t = 0; lib.de = [lib.x, lib.by];
          lib.para = lib.chamar && G ? [limita(G.cab[0] + escolhe([-1, 1]) * aleat(150, 230), 840, 1400), limita(G.cab[1] - aleat(60, 150), 360, 620)] : [aleat(1120, 1480), aleat(480, 640)];
          lib.dur = aleat(600, 1000); lib.escAlvo = lib.para[0] < lib.x ? -1 : 1;
        }
        lib.y = lib.by + 4 * Math.sin(tempo / 160);
      } else {
        const u = Math.min(1, lib.t / lib.dur), e = eio(u);
        lib.x = lerp(lib.de[0], lib.para[0], e); lib.by = lerp(lib.de[1], lib.para[1], e) - 30 * sino(u); lib.y = lib.by;
        if (u >= 1) { lib.voar = false; lib.t = 0; lib.pairar = aleat(700, 2200); }
      }
      lib.esc += (lib.escAlvo - lib.esc) * (1 - Math.exp(-dt / 60));
      poe(R.lib, `translate(${n(lib.x)},${n(lib.y)}) scale(${n3(lib.esc * .9)},.9) rotate(${n(lib.voar ? -6 : 2 * Math.sin(tempo / 300))})`);
      R.asasL.forEach((a, i) => atr(a, 'ry', n(1.4 + 4.6 * Math.abs(Math.sin(tempo * .11 + i * 1.3)))));
      // borboleta: passeia pelo prado aos ziguezagues (e vem ter com o pato quando ele olha)
      borb.t -= dt;
      if (borb.t <= 0) {
        borb.t = aleat(1100, 2400);
        borb.alvo = borb.chamar && G ? [G.cab[0] + escolhe([-1, 1]) * aleat(110, 190), G.cab[1] - aleat(30, 120)] : [aleat(300, 760), aleat(330, 560)];
        if (G && Math.hypot(borb.alvo[0] - G.cab[0], borb.alvo[1] - G.cab[1]) < 150) borb.alvo[0] = G.cab[0] + (borb.alvo[0] < G.cab[0] ? -170 : 170);
      }
      const s = dt / 1000, dx = borb.alvo[0] - borb.x, dy = borb.alvo[1] - borb.y;
      borb.vx += (dx * 1.6 - borb.vx * 1.4) * s; borb.vy += (dy * 1.6 - borb.vy * 1.4) * s;
      const vm = Math.hypot(borb.vx, borb.vy); if (vm > 140) { borb.vx *= 140 / vm; borb.vy *= 140 / vm; }
      if (G) { const ex = borb.x - G.cab[0], ey = borb.y - G.cab[1], dd = Math.hypot(ex, ey); if (dd < 130) { borb.vx += ex / (dd || 1) * 900 * s; borb.vy += ey / (dd || 1) * 900 * s; } }   // não pousa na cara do pato
      borb.x += borb.vx * s; borb.y += borb.vy * s + 26 * Math.cos(t * 5.3) * s * 6;
      poe(R.borb, `translate(${n(borb.x)},${n(borb.y + 6 * Math.sin(t * 5.3))}) rotate(${n(limita(borb.vx / 6, -25, 25))}) scale(.9)`);
      poe(R.borbAsas, `scale(${n3(.2 + .8 * Math.abs(Math.cos(t * 17)))},1)`);
    }

    /* --- acontecimentos raros (a cada 15–40 s): um peixe salta no lago, uma andorinha passa rente à água --- */
    const eventos = { prox: aleat(9000, 15000), ultimo: null };
    function iniciarEvento(tipo) {
      const ev = { tipo, x: -100, y: -100, vivo: true };
      ev.pos = () => [ev.x, ev.y];
      lancar('evento', tipo === 'peixe' ? evPeixe(ev) : evAndorinha(ev), () => { ev.vivo = false; });
      if (modo === 'fora' && !reagindo) lancar('corpo', observar(ev), () => lancar('corpo', cicloFora()));
      else if (modo === 'dentro' && !reagindo) lancar('corpo', observar(ev), () => lancar('corpo', cicloDentro()));
      return ev;
    }
    function atualizarEventos(dt) {
      if (faixas.has('evento') || modo === 'indo' || modo === 'voltando') return;
      eventos.prox -= dt;
      if (eventos.prox > 0) return;
      eventos.prox = aleat(15000, 40000);
      const tipo = eventos.ultimo === 'peixe' ? 'andorinha' : 'peixe';
      eventos.ultimo = tipo;
      iniciarEvento(tipo);
    }
    function* observar(ev) {
      reagindo = false;
      yield* assentar();
      yield* tw({ sobr: .8, olhosEsc: 1.05, bico: 0, feliz: 0 }, 200, esai);
      let t = 0;
      focar(ev.pos);
      while (ev.vivo && t < 9000) {
        const dt = yield; t += dt;
        if (!G) continue;
        const p = ev.pos(), dx = p[0] - G.cab[0], dy = p[1] - G.cab[1];
        const yaw = limita(limita(dx / 5, -85, 85) - P.h, -60, 60), pit = limita(-dy / 6, -25, 35), k = 1 - Math.exp(-dt / 220);
        P.hY += (yaw - P.hY) * k; P.hP += (pit - P.hP) * k;
      }
      focar(null);
      const b = baseP();
      yield* tw({ hY: 0, hP: b.hP, sobr: 0, olhosEsc: 1 }, 400);
    }
    function* evPeixe(ev) {
      const g = R.peixe, x0 = aleat(1230, 1360), y0 = aleat(640, 700), dx = -aleat(110, 150), alt = aleat(70, 100);
      atr(R.clipPeixe, 'height', n(y0 + 1));
      ev.x = x0; ev.y = y0;
      onda(x0, y0, 3, 26, 700, .7);
      yield* espera(500);
      onda(x0, y0, 4, 46, 1000, .9); salpicar(x0, y0, 6, .7, 14);
      atr(g, 'display', 'inline');
      yield* durante(950, u => {
        const x = x0 + dx * u, y = y0 + 34 - (alt + 34) * 4 * u * (1 - u), vy = -(alt + 34) * 4 * (1 - 2 * u);
        ev.x = x; ev.y = y;
        poe(g, `translate(${n(x)},${n(y)}) scale(-1,1) rotate(${n(Math.atan2(vy, -dx) / RAD)}) rotate(${n(8 * Math.sin(u * PI * 6))})`);
      });
      atr(g, 'display', 'none');
      onda(x0 + dx, y0 + 3, 4, 56, 1100, .9); salpicar(x0 + dx, y0, 9, .85, 16);
      yield* espera(1400);
    }
    function* evAndorinha(ev) {                       // desce em arco, toca na água e sobe para o outro lado
      const g = R.andor;
      const pts = [[1720, 170], [1420, 360], [1180, 600], [980, 630], [700, 470], [380, 260], [-140, 150]];
      atr(g, 'display', 'inline');
      let tocou = false, px = pts[0][0], py = pts[0][1];
      yield* durante(4200, (u, t) => {
        const s = eseno(u) * .35 + u * .65, ns = pts.length - 1, ss = Math.min(ns - 1e-6, s * ns), i = Math.floor(ss), f = ss - i;
        const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2b = pts[i + 1], p3 = pts[Math.min(ns, i + 2)];
        const cr = (a, b, c, d) => .5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (-a + 3 * b - 3 * c + d) * f * f * f);
        const x = cr(p0[0], p1[0], p2b[0], p3[0]), y = cr(p0[1], p1[1], p2b[1], p3[1]);
        const ang = Math.atan2(y - py, x - px) / RAD; px = x; py = y; ev.x = x; ev.y = y;
        if (!tocou && x < 1000) { tocou = true; onda(x, 640, 3, 40, 1000, .8); salpicar(x, 640, 3, .4, 6); }
        poe(g, `translate(${n(x)},${n(y)}) scale(-1,1) rotate(${n(180 - ang)})`);
        const bat = Math.sin(t * .03);
        atr(R.andAsa, 'transform', `scale(1,${n3(.4 + .6 * Math.abs(bat))})`); atr(R.andAsa2, 'transform', `scale(1,${n3(-.3 + .7 * bat)})`);
      });
      atr(g, 'display', 'none');
      yield* espera(500);
    }

    /* --- relógio único --- */
    let erroMostrado = false;
    function passo(dt) {
      if (!vivo) return;
      try {
        dt = Math.min(dt, 50);
        tempo += dt; dtUlt = dt;
        fase.resp += dt / 1000 * 2 * PI * .4;
        atualizarPiscar(dt);
        atualizarOlharLivre(dt);
        for (const nome of Array.from(faixas.keys())) avancarF(nome, dt);
        atualizarExtras(dt);
        atualizarEventos(dt);
        animarCena(dt);
        desenhar();
        atualizarVeu();
        atualizarAneis(dt);
        atualizarOndas(dt);
        atualizarGotas(dt);
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    lancar('corpo', cicloFora());
    atualizarExtras(0); animarCena(0); desenhar(); atualizarVeu();

    return {
      animal: R.pato,
      habitat: R.habitat,
      reagir() {
        if (!vivo) return;
        if (modo === 'fora') lancar('corpo', reacao(), () => { reagindo = false; lancar('corpo', cicloFora()); });
        else if (modo === 'dentro') lancar('corpo', reacaoAgua(), () => { reagindo = false; lancar('corpo', cicloDentro()); });
        else { P.sobr = 1; }
      },
      fazerSom(ms, silabas) {
        if (!vivo) return;
        if (Array.isArray(silabas) && silabas.length) lancar('boca', quaSilabas(silabas), () => { P.somB = 0; P.somH = 0; P.somT = 0; });
        else lancar('boca', quaMs(limita(ms || 800, 300, 3000)), () => { P.somB = 0; P.somH = 0; P.somT = 0; });
      },
      irAoHabitat() {
        return new Promise(res => {
          if (!vivo || modo !== 'fora') { res(); return; }
          lancar('corpo', idaAoLago(), () => { res(); lancar('corpo', cicloDentro()); });
        });
      },
      voltar() {
        return new Promise(res => {
          if (!vivo || modo !== 'dentro') { res(); return; }
          lancar('corpo', voltaDoLago(), () => { res(); lancar('corpo', cicloFora()); });
        });
      },
      destruir() {
        vivo = false;
        faixas.clear();
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola
      _teste: { P, pes, marcha, remo, modo: () => modo, G: () => G, evento: iniciarEvento, desenhar,
        comportamento: nome => lancar('corpo', (COMPORTAMENTOS[nome] || NO_LAGO_COMP[nome])(), () => lancar('corpo', modo === 'dentro' ? cicloDentro() : cicloFora())),
        parar: () => lancar('corpo', (function* () { for (;;) yield; })()) }
    };
  }

  return { icone: iconeSVG(), montar };
})();
