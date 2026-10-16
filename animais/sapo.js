/* Sapo — «Os Meus Animais». Contrato e regras: REGRAS-ANIMAIS.md.
   Cena: um charco na orla de um bosque, de manhã, com o sol a vir de cima à esquerda (árvores, fetos, juncos e tabúas,
   pedra com musgo, tronco caído com um caracol, nenúfares, libelinha, alfaiate na água, nuvens refletidas).
   Habitat: um nenúfar grande com uma flor cor-de-rosa, a boiar no charco (afunda, faz ondas e salpica quando o sapo salta).
   O sapo é um boneco «2,5D» feito de elipsoides: cada peça (corpo, cabeça, papo, olhos, coxas, canelas, pés, dedos…)
   é um elipsoide em 3D projetado no ecrã como uma elipse, a cada quadro. Por isso vira-se de verdade (de lado → de frente
   → de lado), as patas dobram-se com IK e os grupos de peças trocam de ordem conforme a profundidade.
   Organização:
     1) utilidades (matemática, vetores, projeção, IK)
     2) esqueleto e geometria do sapo (dados → elipses no ecrã)
     3) desenho do sapo (SVG das peças) e ícone do menu
     4) cenário (céu, bosque, charco, margem, pedra, tronco, nenúfar, juncos, bichos)
     5) montar(): poses, tarefas (geradores) no relógio único, comportamentos, saltos, língua, coaxar, habitat */
'use strict';
MODULOS.sapo = (() => {
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
  // vetores 3D: [x (direita), y (para cima), z (para quem vê)]
  const vs = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const vd = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const vk = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const vp = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const vx = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const vl = a => Math.hypot(a[0], a[1], a[2]);
  const vn = a => { const l = vl(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const vlerp = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

  // câmara: vista ortogonal ligeiramente de cima (18°), para se ver o chão por baixo dos pés
  const ELEV = 18 * RAD, cE = Math.cos(ELEV), sE = Math.sin(ELEV);
  const VISTA = [0, sE, cE];                               // direção para a câmara
  const ESC = 1.1;                                         // escala do sapo no cenário
  // ctx = { X, Y (ponto do chão por baixo do sapo, no ecrã), k (escala), qx, qy (compressão/estiramento) }
  const p2 = (c, w) => [c.X + w[0] * c.k * c.qx, c.Y - (w[1] * cE - w[2] * sE) * c.k * c.qy];
  const prof = w => w[1] * sE + w[2] * cE;                 // profundidade (maior = mais perto)
  // elipsoide (centro + 3 semi-eixos em 3D) → elipse no ecrã (projeção ortogonal: a sombra de um elipsoide é uma elipse)
  function elipse(c, centro, eixos) {
    let a = 0, b = 0, d = 0;
    for (const v of eixos) {
      const x = v[0] * c.k * c.qx, y = -(v[1] * cE - v[2] * sE) * c.k * c.qy;
      a += x * x; b += x * y; d += y * y;
    }
    const m = (a + d) / 2, r = Math.sqrt(Math.max(0, (a - d) * (a - d) / 4 + b * b));
    const s = p2(c, centro);
    return { x: s[0], y: s[1], rx: Math.sqrt(m + r), ry: Math.sqrt(Math.max(.01, m - r)), ang: .5 * Math.atan2(2 * b, a - d) / RAD, bx: Math.sqrt(a), by: Math.sqrt(d), z: prof(centro) };
  }
  // referenciais: origem + eixos f (frente), u (cima), s (lado direito do sapo)
  const ref = (o, f, u, s) => ({ o, f, u, s });
  const ponto = (R, a, b, c) => [R.o[0] + R.f[0] * a + R.u[0] * b + R.s[0] * c, R.o[1] + R.f[1] * a + R.u[1] * b + R.s[1] * c, R.o[2] + R.f[2] * a + R.u[2] * b + R.s[2] * c];
  const direcao = (R, a, b, c) => [R.f[0] * a + R.u[0] * b + R.s[0] * c, R.f[1] * a + R.u[1] * b + R.s[1] * c, R.f[2] * a + R.u[2] * b + R.s[2] * c];
  function filho(R, a, b, c, pitch, yaw) {                 // pitch: nariz para cima (graus); yaw: para o lado direito do sapo
    let f = R.f, u = R.u, s = R.s;
    if (yaw) { const y = yaw * RAD, cy = Math.cos(y), sy = Math.sin(y); const f2 = vs(vk(f, cy), vk(s, sy)); s = vd(vk(s, cy), vk(f, sy)); f = f2; }
    if (pitch) { const p = pitch * RAD, cp = Math.cos(p), sp = Math.sin(p); const f2 = vs(vk(f, cp), vk(u, sp)); u = vd(vk(u, cp), vk(f, sp)); f = f2; }
    return ref(ponto(R, a, b, c), f, u, s);
  }
  const elipR = (c, R, centro, ax) => elipse(c, ponto(R, centro[0], centro[1], centro[2]), [vk(R.f, ax[0]), vk(R.u, ax[1]), vk(R.s, ax[2])]);
  // elipsoide à volta de um segmento a→b (r1 = largura de lado, r2 = espessura na vertical)
  function segm(c, a, b, r1, r2, extra) {
    const A = vk(vd(b, a), .5), L = vl(A) || .001, Ah = vk(A, 1 / L);
    let n1 = vx([0, 1, 0], Ah); if (vl(n1) < .2) n1 = vx([1, 0, 0], Ah); n1 = vn(n1);
    const n2 = vx(Ah, n1);
    return elipse(c, vk(vs(a, b), .5), [vk(Ah, L + (extra || 0)), vk(n1, r1), vk(n2, r2 == null ? r1 : r2)]);
  }
  // mancha à superfície de um elipsoide (longitude fi a partir da frente, latitude te); devolve a elipse e se está virada para nós
  function sup(c, R, centro, ax, fi, te, r1, r2) {
    const cf = Math.cos(fi), sf = Math.sin(fi), ct = Math.cos(te), st = Math.sin(te);
    const P = ponto(R, centro[0] + ax[0] * ct * cf, centro[1] + ax[1] * st, centro[2] + ax[2] * ct * sf);
    const t1 = vn(direcao(R, -ax[0] * ct * sf, 0, ax[2] * ct * cf));
    const t2 = vn(direcao(R, -ax[0] * st * cf, ax[1] * ct, -ax[2] * st * sf));
    const N = vn(direcao(R, ct * cf / ax[0], st / ax[1], ct * sf / ax[2]));
    const e = elipse(c, P, [vk(t1, r1), vk(t2, r2 == null ? r1 : r2), vk(N, .01)]);
    e.vis = vp(N, VISTA);
    return e;
  }
  // IK de 2 segmentos em 3D: raiz R, alvo T, comprimentos l1 e l2; o joelho/cotovelo vai para o lado do «polo»
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
  // caminho suave por uma lista de pontos 2D (curvas quadráticas pelos pontos médios)
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
  // direção da luz (de cima à esquerda) no referencial de uma elipse rodada → deslocamento do brilho, sempre por dentro
  const LUZ = [-.55, -.835];
  function luzOff(e, f) {
    const a = e.ang * RAD, ca = Math.cos(a), sa = Math.sin(a);
    const lx = LUZ[0] * ca + LUZ[1] * sa, ly = -LUZ[0] * sa + LUZ[1] * ca;
    const ox = lx * f * e.rx, oy = ly * f * e.ry;
    return [ox * ca - oy * sa, ox * sa + oy * ca];
  }

  /* ================= 2) Esqueleto e geometria do sapo ================= */
  const COR = { cont: '#26360E', mancha: '#2F7420', manchaC: '#3E8A2A', boca: '#6E2427', faixa: '#336F22' };
  const DIM = {
    tronco: [112, 80, 108],
    cabeca: { c: [28, 22, 0], ax: [84, 60, 104] },
    bolha: { c: [20, 60, 56], r: 40 }, globo: { c: [29, 66, 60], r: 31 },
    papo: { c: [64, -26, 0], ax: [32, 26, 54] },
    ombro: [58, -30, 50], BR: 52, AB: 62,
    anca: [-78, -20, 62], CX: 96, CN: 92,
    dedosM: [[-58, 24], [-24, 31], [8, 31], [40, 25]],
    dedosP: [[-40, 28], [-19, 38], [1, 47], [21, 56], [42, 38]]
  };
  const RG = DIM.globo.r * ESC, RI = RG * .8;              // raio do globo do olho e da íris (no ecrã)
  // manchas escuras: [longitude, latitude, raio1, raio2]
  const MANCHAS_C = [[1.85, .3, 17, 13], [-1.85, .3, 17, 13], [2.55, .12, 13, 10], [-2.55, .12, 13, 10], [1.25, .6, 15, 11], [-1.25, .6, 15, 11],
    [3.14, .42, 16, 13], [2.2, .78, 12, 9], [-2.2, .78, 12, 9], [.85, .2, 10, 8], [-.85, .2, 10, 8], [2.0, -.25, 10, 8], [-2.0, -.25, 10, 8]];
  const MANCHAS_H = [[0, .78, 11, 8], [.5, .62, 8, 6], [-.5, .62, 8, 6], [1.25, .38, 10, 8], [-1.25, .38, 10, 8]];
  // pintinhas claras (pele granulosa) no dorso e nos flancos
  const PINTAS = (() => { const r = semente(57), v = []; for (let i = 0; i < 26; i++) v.push([(r() < .5 ? -1 : 1) * (.9 + r() * 2.2), -.1 + r() * .9, 3 + r() * 3.5]); return v; })();
  const LADOS = [['E', -1], ['D', 1]];                     // E = esquerdo do sapo (s < 0), D = direito

  // poses: chaves do corpo. cF/cH/cP = corpo (frente, altura, inclinação), hP/hY = cabeça, sq = compressão,
  //   m?f/u/s/a = pulso da mão (frente, cima, lado, inclinação da mão), c?… = calcanhar, d?… = base dos dedos do pé
  //   (mãos e pés no referencial do chão do sapo: enquanto estão pousados não deslizam)
  function sim(o) { const r = {}; for (const k in o) { if (/^[mcd][fusa]$/.test(k)) { r[k[0] + 'E' + k[1]] = o[k]; r[k[0] + 'D' + k[1]] = o[k]; } else r[k] = o[k]; } return r; }
  const SENTADO = sim({ cF: -8, cH: 92, cP: 24, hP: -18, hY: 0, sq: 0, mf: 100, mu: 5, ms: 60, ma: 0, cf: -62, cu: 9, cs: 108, df: 50, du: 6, ds: 124 });
  const CHAVES = Object.keys(SENTADO);

  function geometria(P, X, Y, k) {
    const c = { X, Y, k, qx: 1 + P.sq * .8, qy: 1 - P.sq };
    const h = P.h * RAD, F = [Math.sin(h), 0, Math.cos(h)], U = [0, 1, 0], S = [-Math.cos(h), 0, Math.sin(h)];
    const R0 = ref([0, 0, 0], F, U, S);
    const lean = P.somLean || 0, inc = P.incha || 0;
    const B = filho(R0, P.cF, P.cH + 7 * lean, 0, P.cP + 6 * lean, 0);
    const H = filho(B, 48, 34, 0, P.hP - 5 * lean, -P.hY);
    const G = { c, el: {}, z: {}, olho: {}, F, S, H };
    const resp = P._resp || 0;
    const axT = [112 * (1 + .14 * inc) * (1 + .01 * resp), 80 * (1 + .16 * inc) * (1 + .03 * resp), 108 * (1 + .16 * inc) * (1 + .024 * resp)];
    G.el.tronco = elipR(c, B, [0, 0, 0], axT);
    const hc = DIM.cabeca.c, axH = [84 * (1 + inc * .03), 60 * (1 + inc * .06), 104 * (1 + inc * .08)];
    G.el.cabeca = elipR(c, H, hc, axH);
    G.z.corpo = prof(B.o);
    // papo (saco vocal): pulsa sempre um pouco e incha muito para coaxar
    const kp = limita(Math.max(P.papo || 0, P.somK || 0), 0, 1.3), pul = 1 + .07 * (P._pulso || 0) * (1 - Math.min(1, kp));
    G.kPapo = kp;
    const pc = [64 + 34 * kp, -26 - 16 * kp, 0], pax = [(32 + 56 * kp) * pul, (26 + 50 * kp) * pul, (54 + 50 * kp) * pul];
    G.el.papo = elipR(c, H, pc, pax);
    G.z.papo = prof(ponto(H, pc[0] + pax[0], pc[1], 0)) + 30;
    // olhos
    for (const [L, sg] of LADOS) {
      const afu = limita((P.afunda || 0) + (P['_pisca' + L] || 0) * .45, 0, 1.2), esc = P.olhosEsc || 1;
      const bc = [DIM.bolha.c[0], DIM.bolha.c[1] - afu * 17, DIM.bolha.c[2] * sg], r = DIM.bolha.r * esc;
      G.el['bolha' + L] = elipR(c, H, bc, [r, r * (1 - afu * .24), r]);
      const gw = ponto(H, DIM.globo.c[0], DIM.globo.c[1] - afu * 19, DIM.globo.c[2] * sg), gs = p2(c, gw);
      G.olho[L] = { x: gs[0], y: gs[1], base: vn(direcao(H, .78, .25, .6 * sg)) };
      G.z['olho' + L] = prof(ponto(H, bc[0], bc[1], bc[2]));
    }
    // patas da frente
    for (const [L, sg] of LADOS) {
      const om = ponto(B, DIM.ombro[0], DIM.ombro[1], DIM.ombro[2] * sg);
      const W = ponto(R0, P['m' + L + 'f'], P['m' + L + 'u'], P['m' + L + 's'] * sg);
      const ik = ik2(om, W, DIM.BR, DIM.AB, vs(vk(F, -1), vs(vk(S, .35 * sg), [0, .15, 0])));
      G.el['braco' + L] = segm(c, om, ik.J, 19, 19, 9);
      G.el['antebraco' + L] = segm(c, ik.J, ik.E, 15, 15, 8);
      const a = P['m' + L + 'a'] * RAD;
      const hf = vs(vk(F, Math.cos(a)), vk(U, Math.sin(a))), hu = vd(vk(U, Math.cos(a)), vk(F, Math.sin(a)));
      G.el['palma' + L] = elipse(c, ik.E, [vk(hf, 14), vk(hu, 9), vk(S, 15)]);
      DIM.dedosM.forEach(([ang, len], i) => {
        const d = vs(vk(hf, Math.cos(ang * RAD)), vk(S, sg * Math.sin(ang * RAD)));
        const ponta = vs(ik.E, vk(d, len));
        G.el['dedo' + L + i] = segm(c, vs(ik.E, vk(d, 5)), ponta, 5.5, 4.5, 2);
        G.el['alm' + L + i] = elipse(c, ponta, [vk(d, 6), vk(hu, 4.5), vk(vn(vx(hu, d)), 6)]);
      });
      G.z['braco' + L] = prof(vk(vs(om, W), .5));
      G['mao' + L] = p2(c, ik.E);
    }
    // patas de trás (anca → joelho → calcanhar → pé comprido → 5 dedos com membrana)
    for (const [L, sg] of LADOS) {
      const an = ponto(B, DIM.anca[0], DIM.anca[1], DIM.anca[2] * sg);
      const C = ponto(R0, P['c' + L + 'f'], P['c' + L + 'u'], P['c' + L + 's'] * sg);
      const D = ponto(R0, P['d' + L + 'f'], P['d' + L + 'u'], P['d' + L + 's'] * sg);
      const ik = ik2(an, C, DIM.CX, DIM.CN, vs(F, vs(vk(S, .9 * sg), [0, .25, 0])));
      const Dr = vs(ik.E, vd(D, C));
      G.el['coxa' + L] = segm(c, an, ik.J, 33, 30, 14);
      G.el['canela' + L] = segm(c, ik.J, ik.E, 19, 18, 9);
      G.el['pe' + L] = segm(c, ik.E, Dr, 14, 8, 6);
      const fd = vn(vd(Dr, ik.E)), lado = vk(S, sg);
      const lat = vn(vd(lado, vk(fd, vp(lado, fd)))), cima = vn(vx(lat, fd));
      const web = [], base2 = p2(c, Dr);
      DIM.dedosP.forEach(([ang, len], i) => {
        const d = vn(vs(vk(fd, Math.cos(ang * RAD)), vk(lat, Math.sin(ang * RAD))));
        const ponta = vs(Dr, vk(d, len));
        G.el['dedoP' + L + i] = segm(c, vd(Dr, vk(fd, 4)), ponta, 6, 4, 2);
        G.el['almP' + L + i] = elipse(c, ponta, [vk(d, 6.5), vk(cima, 4.5), vk(vn(vx(cima, d)), 6.5)]);
        web.push(p2(c, vs(Dr, vk(d, len * .8))));
      });
      let w = `M${n(base2[0])},${n(base2[1])}L${n(web[0][0])},${n(web[0][1])}`;
      for (let i = 1; i < web.length; i++) {
        const m = [lerp(base2[0], (web[i - 1][0] + web[i][0]) / 2, .62), lerp(base2[1], (web[i - 1][1] + web[i][1]) / 2, .62)];
        w += `Q${n(m[0])},${n(m[1])} ${n(web[i][0])},${n(web[i][1])}`;
      }
      G['membrana' + L] = w + 'Z';
      G.z['perna' + L] = prof(ik.J);
    }
    // pormenores à superfície (barriga, manchas, bochechas, narinas)
    G.barriga = sup(c, B, [0, 0, 0], axT, 0, -.42, 96, 74);
    G.sombraCab = elipR(c, H, [hc[0] - 4, hc[1] - 10, 0], [axH[0] * .98, axH[1] * .95, axH[2] * .98]);
    G.manchasC = MANCHAS_C.map(m => sup(c, B, [0, 0, 0], axT, m[0], m[1], m[2], m[3]));
    G.pintas = PINTAS.map(m => sup(c, B, [0, 0, 0], axT, m[0], m[1], m[2], m[2] * .85));
    G.manchasH = MANCHAS_H.map(m => sup(c, H, hc, axH, m[0], m[1], m[2], m[3]));
    G.bochechas = LADOS.map(([, sg]) => sup(c, H, hc, axH, 1.02 * sg, -.04, 19, 12));
    G.narinas = LADOS.map(([, sg]) => sup(c, H, hc, axH, .17 * sg, .4, 4.4, 2.8));
    // linhas à superfície: pregas claras do dorso (de trás do olho até às ancas) e a «máscara» escura atrás do olho
    const linhaSup = (R, ce, ax, f0, f1, t0, t1, k) => Array.from({ length: k }, (_, i) => {
      const u = i / (k - 1), fi = lerp(f0, f1, u), te = lerp(t0, t1, u), ct = Math.cos(te), st = Math.sin(te), cf = Math.cos(fi), sf = Math.sin(fi);
      const N = direcao(R, ct * cf / ax[0], st / ax[1], ct * sf / ax[2]), s = p2(c, ponto(R, ce[0] + ax[0] * ct * cf, ce[1] + ax[1] * st, ce[2] + ax[2] * ct * sf));
      return [s[0], s[1], vp(N, VISTA) / vl(N)];
    });
    G.dobras = LADOS.map(([, sg]) => linhaSup(B, [0, 0, 0], axT, 1.0 * sg, 2.75 * sg, .62, .36, 9));
    G.mascaras = LADOS.map(([, sg]) => linhaSup(H, hc, axH, 1.12 * sg, 1.62 * sg, .3, -.06, 6));
    // boca: uma linha à volta da frente da cabeça (só a parte virada para nós), relativa ao centro da cabeça
    const hs = p2(c, ponto(H, hc[0], hc[1], hc[2]));
    G.cab = hs;
    const linha = dte => {
      const pts = [];
      for (let i = 0; i <= 18; i++) {
        const u = -1 + i / 9, fi = u * 1.3, au = Math.abs(u);
        const te = -.2 + (P.sorriso || 0) * .26 * Math.pow(au, 2.4) + .03 * au * au - dte * (1 - au * au);
        const ct = Math.cos(te), st = Math.sin(te), cf = Math.cos(fi), sf = Math.sin(fi);
        const w = ponto(H, hc[0] + axH[0] * ct * cf, hc[1] + axH[1] * st, hc[2] + axH[2] * ct * sf);
        const N = direcao(H, ct * cf / axH[0], st / axH[1], ct * sf / axH[2]);
        const s = p2(c, w);
        pts.push([s[0] - hs[0], s[1] - hs[1], vp(N, VISTA) / vl(N)]);
      }
      return pts;
    };
    G.bocaSup = linha(0);
    G.bocaInf = (P.boca || 0) > .01 ? linha(P.boca * .62) : null;
    G.linguaBase = p2(c, ponto(H, hc[0] + axH[0] * .9, hc[1] - axH[1] * .26, 0));
    return G;
  }
  // a parte visível de uma linha de pontos [x, y, visibilidade]: o maior troço seguido virado para nós
  function visivel(pts, lim) {
    let best = [], cur = [];
    pts.forEach((p, i) => { if (p[2] > lim) cur.push(i); else { if (cur.length > best.length) best = cur; cur = []; } });
    if (cur.length > best.length) best = cur;
    return best;
  }

  /* ================= 3) Desenho do sapo ================= */
  const NOMES = {
    papo: ['papo'],
    bracoE: ['bracoE', 'antebracoE', 'dedoE0', 'dedoE1', 'dedoE2', 'dedoE3', 'almE0', 'almE1', 'almE2', 'almE3', 'palmaE'],
    bracoD: ['bracoD', 'antebracoD', 'dedoD0', 'dedoD1', 'dedoD2', 'dedoD3', 'almD0', 'almD1', 'almD2', 'almD3', 'palmaD'],
    pernaE: ['dedoPE0', 'dedoPE1', 'dedoPE2', 'dedoPE3', 'dedoPE4', 'almPE0', 'almPE1', 'almPE2', 'almPE3', 'almPE4', 'peE', 'canelaE', 'coxaE'],
    pernaD: ['dedoPD0', 'dedoPD1', 'dedoPD2', 'dedoPD3', 'dedoPD4', 'almPD0', 'almPD1', 'almPD2', 'almPD3', 'almPD4', 'peD', 'canelaD', 'coxaD']
  };
  // espessura do contorno (no ecrã) e enchimento de cada tipo de peça
  function estilo(nm, p) {
    if (/^alm/.test(nm)) return { o: 2.4, f: `url(#${p}almof)`, l: null };
    if (/^dedo/.test(nm)) return { o: 2.6, f: `url(#${p}dedo)`, l: null };
    if (nm === 'papo') return { o: 3, f: `url(#${p}papo)`, l: `url(#${p}papo-luz)` };
    if (/^pe/.test(nm)) return { o: 3, f: `url(#${p}pele)`, l: `url(#${p}luz)` };
    return { o: 3.4, f: `url(#${p}pele)`, l: `url(#${p}luz)` };
  }
  const contornoSVG = (nm, o) => `<circle class="sp-${nm}-c" r="1" fill="${COR.cont}" data-o="${o}"/>`;
  const enchSVG = (nm, f, l) => `<circle class="sp-${nm}-e" r="1" fill="${f}"/>` + (l ? `<circle class="sp-${nm}-l" r="1" fill="${l}"/>` : '');
  function parteSVG(nm, p) { const e = estilo(nm, p); return contornoSVG(nm, e.o) + enchSVG(nm, e.f, e.l); }
  const brilhoSVG = nm => `<ellipse class="sp-spec-${nm}" rx="1" ry="1" fill="#FFFFFF" opacity=".55"/>`;

  function defsSapo(p) {
    return `
    <radialGradient id="${p}pele"><stop offset="0" stop-color="#77C646"/><stop offset=".55" stop-color="#62B238"/><stop offset=".86" stop-color="#4C9A2D"/><stop offset="1" stop-color="#3A8226"/></radialGradient>
    <radialGradient id="${p}luz"><stop offset="0" stop-color="#D2F08E" stop-opacity=".95"/><stop offset=".45" stop-color="#B0DE68" stop-opacity=".55"/><stop offset="1" stop-color="#96D058" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}dedo"><stop offset="0" stop-color="#7CC64A"/><stop offset="1" stop-color="#4A952D"/></radialGradient>
    <radialGradient id="${p}almof" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#EEF5B4"/><stop offset=".55" stop-color="#C6DE78"/><stop offset="1" stop-color="#8DB34A"/></radialGradient>
    <radialGradient id="${p}barriga"><stop offset="0" stop-color="#FFFCE4"/><stop offset=".6" stop-color="#F7F0BC"/><stop offset="1" stop-color="#E2D47C"/></radialGradient>
    <linearGradient id="${p}queixo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F9F3C6"/><stop offset=".5" stop-color="#F2E8A8"/><stop offset="1" stop-color="#D8C870"/></linearGradient>
    <radialGradient id="${p}papo" cx=".5" cy=".45" r=".55"><stop offset="0" stop-color="#FFFDEB"/><stop offset=".7" stop-color="#F5EDB4"/><stop offset="1" stop-color="#DCCB76"/></radialGradient>
    <radialGradient id="${p}papo-luz"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".9"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}iris" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFEBA0"/><stop offset=".42" stop-color="#F5C443"/><stop offset=".84" stop-color="#D68F22"/><stop offset="1" stop-color="#9A5A12"/></radialGradient>
    <radialGradient id="${p}esclera" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#FFFCEA"/><stop offset="1" stop-color="#E6DBA6"/></radialGradient>
    <linearGradient id="${p}palp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD25A"/><stop offset=".7" stop-color="#5CA836"/><stop offset="1" stop-color="#4A922C"/></linearGradient>
    <linearGradient id="${p}palpI" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#4E9A30"/><stop offset="1" stop-color="#74BE48"/></linearGradient>
    <radialGradient id="${p}bocaInt" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#A8404A"/><stop offset="1" stop-color="#5A1820"/></radialGradient>
    <linearGradient id="${p}lingua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB2C0"/><stop offset="1" stop-color="#E36A86"/></linearGradient>
    <radialGradient id="${p}sombra"><stop offset="0" stop-color="#1B260C" stop-opacity=".55"/><stop offset=".62" stop-color="#1B260C" stop-opacity=".3"/><stop offset="1" stop-color="#1B260C" stop-opacity="0"/></radialGradient>
    <clipPath id="${p}clip-tronco"><circle class="sp-clipTronco" r="1"/></clipPath>
    <clipPath id="${p}clip-cabeca"><circle class="sp-clipCabeca" r="1"/></clipPath>
    <clipPath id="${p}clip-globo"><circle r="${n(RG)}"/></clipPath>
    ${['E', 'D'].map(L => `<clipPath id="${p}clip-coxa${L}"><circle class="sp-clipCoxa${L}" r="1"/></clipPath><clipPath id="${p}clip-canela${L}"><circle class="sp-clipCanela${L}" r="1"/></clipPath>`).join('')}`;
  }

  function olhoSVG(p, L) {
    let fib = '';
    for (let i = 0; i < 18; i++) { const a = i / 18 * 2 * PI; fib += `M${n(Math.cos(a) * RI * .36)},${n(Math.sin(a) * RI * .36)}L${n(Math.cos(a) * RI * .93)},${n(Math.sin(a) * RI * .93)}`; }
    let pintas = '';
    const r = semente(L === 'E' ? 11 : 23);
    for (let i = 0; i < 9; i++) { const a = r() * 2 * PI, d = RI * (.45 + r() * .45); pintas += `<circle cx="${n(Math.cos(a) * d)}" cy="${n(Math.sin(a) * d)}" r="${n(1 + r() * 1.4)}"/>`; }
    return `<g class="sp-g-olho${L}">${parteSVG('bolha' + L, p)}${brilhoSVG('bolha' + L)}
      <g class="sp-globo${L}">
        <circle r="${n(RG + 3)}" fill="${COR.cont}"/>
        <circle r="${n(RG)}" fill="url(#${p}esclera)"/>
        <g clip-path="url(#${p}clip-globo)">
          <g class="sp-iris${L}">
            <circle r="${n(RI)}" fill="url(#${p}iris)"/>
            <path d="${fib}" stroke="#FFF2BE" stroke-width="1.3" opacity=".5"/>
            <g fill="#8E5414" opacity=".45">${pintas}</g>
            <circle r="${n(RI * .6)}" fill="none" stroke="#FFE27C" stroke-width="2.2" opacity=".35"/>
            <circle r="${n(RI - 1)}" fill="none" stroke="#5E360C" stroke-width="2.6" opacity=".85"/>
            <ellipse class="sp-pupila${L}" rx="${n(RI * .55)}" ry="${n(RI * .3)}" fill="#160F08"/>
          </g>
          <path d="M${n(-RG - 2)},${n(-RG - 2)}H${n(RG + 2)}V${n(-RG * .25)}Q0,${n(-RG * .62)} ${n(-RG - 2)},${n(-RG * .25)}Z" fill="#3A2A08" opacity=".2"/>
          <circle cx="${n(-RG * .33)}" cy="${n(-RG * .36)}" r="${n(RG * .21)}" fill="#FFFFFF"/>
          <circle cx="${n(-RG * .05)}" cy="${n(-RG * .5)}" r="${n(RG * .07)}" fill="#FFFFFF" opacity=".85"/>
          <circle cx="${n(RG * .34)}" cy="${n(RG * .3)}" r="${n(RG * .09)}" fill="#FFFFFF" opacity=".75"/>
          <path class="sp-palpI${L}" fill="url(#${p}palpI)"/>
          <path class="sp-orlaI${L}" fill="none" stroke="${COR.cont}" stroke-width="2" opacity=".7"/>
          <path class="sp-palpS${L}" fill="url(#${p}palp)"/>
          <path class="sp-orla${L}" fill="none" stroke="${COR.cont}" stroke-width="3" stroke-linecap="round"/>
        </g>
      </g></g>`;
  }
  function bracoSVG(p, L) {                // braço e antebraço em dois passes (cotovelo sem costura); dedos, almofadinhas e mão por cima
    const [b, a, ...resto] = NOMES['braco' + L], eb = estilo(b, p), ea = estilo(a, p);
    return `<g class="sp-g-braco${L}">${contornoSVG(b, eb.o)}${contornoSVG(a, ea.o)}${enchSVG(b, eb.f, eb.l)}${enchSVG(a, ea.f, ea.l)}${resto.map(nm => parteSVG(nm, p)).join('')}</g>`;
  }
  function pernaSVG(p, L) {
    const nm = NOMES['perna' + L];
    const dedos = nm.slice(0, 10).map(x => parteSVG(x, p)).join('');
    return `<g class="sp-g-perna${L}">
      <path class="sp-membrana${L}" fill="#5BA638" stroke="${COR.cont}" stroke-width="2.2" stroke-linejoin="round" opacity=".92"/>
      ${dedos}${parteSVG('pe' + L, p)}${parteSVG('canela' + L, p)}
      <g clip-path="url(#${p}clip-canela${L})"><circle class="sp-fc${L}0" r="1" fill="${COR.faixa}" opacity=".7"/></g>
      ${parteSVG('coxa' + L, p)}
      <g clip-path="url(#${p}clip-coxa${L})"><circle class="sp-fx${L}0" r="1" fill="${COR.faixa}" opacity=".72"/><circle class="sp-fx${L}1" r="1" fill="${COR.faixa}" opacity=".72"/><circle class="sp-fx${L}2" r="1" fill="${COR.faixa}" opacity=".6"/></g>
      ${brilhoSVG('coxa' + L)}
    </g>`;
  }
  function corpoSVG(p) {
    return `<g class="sp-g-corpo">
      ${contornoSVG('tronco', 3.6)}${contornoSVG('cabeca', 3.6)}
      ${enchSVG('tronco', `url(#${p}pele)`, `url(#${p}luz)`)}
      <g clip-path="url(#${p}clip-tronco)">
        <circle class="sp-barriga" r="1" fill="url(#${p}barriga)"/>
        <circle class="sp-sombraCab" r="1" fill="#1E3A0E" opacity=".3"/>
      </g>
      <g fill="${COR.manchaC}">${MANCHAS_C.map((m, i) => `<circle class="sp-mC${i}" r="1"/>`).join('')}</g>
      <g fill="#A6DC6C">${PINTAS.map((m, i) => `<circle class="sp-pt${i}" r="1"/>`).join("")}</g>
      ${LADOS.map(([L]) => `<path class="sp-dobra${L}" fill="none" stroke="#B4E27C" stroke-width="4" stroke-linecap="round" opacity=".7"/>`).join('')}
      ${brilhoSVG('tronco')}
      ${enchSVG('cabeca', `url(#${p}pele)`, `url(#${p}luz)`)}
      <g clip-path="url(#${p}clip-cabeca)"><g class="sp-relCab"><path class="sp-queixo" fill="url(#${p}queixo)"/></g></g>
      <g fill="${COR.mancha}">${MANCHAS_H.map((m, i) => `<circle class="sp-mH${i}" r="1"/>`).join('')}</g>
      ${LADOS.map(([L]) => `<path class="sp-masc${L}" fill="none" stroke="#2C6A1E" stroke-width="7" stroke-linecap="round" opacity=".35"/>`).join('')}
      <g fill="#F7909A">${LADOS.map(([L]) => `<circle class="sp-boch${L}" r="1"/>`).join('')}</g>
      <g fill="#203010">${LADOS.map(([L]) => `<circle class="sp-nar${L}" r="1"/>`).join('')}</g>
      ${brilhoSVG('cabeca')}
    </g>`;
  }
  function papoSVG(p) {                    // o papo e a boca (a boca fica por cima do papo quando ele incha)
    return `<g class="sp-g-papo">${parteSVG('papo', p)}
      <path class="sp-papoBrilho" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0"/>
      <path class="sp-papoRugas" fill="none" stroke="#C9B866" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>
      <g class="sp-relCab2">
        <path class="sp-bocaInt" fill="url(#${p}bocaInt)" stroke="${COR.cont}" stroke-width="2.6" stroke-linejoin="round" display="none"/>
        <ellipse class="sp-linguaIn" rx="15" ry="7" fill="#EE8098" display="none"/>
        <path class="sp-labio" fill="none" stroke="#B9E57A" stroke-width="3" stroke-linecap="round" opacity=".65"/>
        <path class="sp-boca" fill="none" stroke="${COR.cont}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </g>`;
  }
  function sapoSVG(p) {
    return `<g class="sp-sapo">
      <ellipse class="sp-sombra" rx="1" ry="1" fill="url(#${p}sombra)"/>
      <g class="sp-partes">
        ${pernaSVG(p, 'E')}${pernaSVG(p, 'D')}${bracoSVG(p, 'E')}${bracoSVG(p, 'D')}${corpoSVG(p)}${papoSVG(p)}${olhoSVG(p, 'E')}${olhoSVG(p, 'D')}
      </g>
      <g class="sp-lingua" display="none">
        <path class="sp-linguaP" fill="url(#${p}lingua)" stroke="#B5455F" stroke-width="2.4" stroke-linejoin="round"/>
        <circle class="sp-linguaPonta" r="12" fill="url(#${p}lingua)" stroke="#B5455F" stroke-width="2.4"/>
        <path class="sp-linguaB" fill="none" stroke="#FFD4DD" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      </g>
    </g>`;
  }
  // pálpebras no referencial do globo do olho: c = fecho (0 aberto … 1 fechado), f = olhos contentes (pálpebra de baixo em arco)
  function palpebras(c, f) {
    const r = RG, e = r + 4;
    const yS = lerp(-r * .9, r * .46, c), bS = r * (.2 + .5 * Math.sin(PI * Math.min(1, c * 1.1)));
    const cl = Math.max(c * .5, f * .66), yI = lerp(r * 1.04, r * .02, cl), bI = r * (.08 + .7 * f);
    return {
      sup: `M${-e},${-e}L${e},${-e}L${e},${n(yS)}Q0,${n(yS + bS)} ${-e},${n(yS)}Z`,
      orla: `M${n(-r * 1.02)},${n(yS + bS * .04)}Q0,${n(yS + bS)} ${n(r * 1.02)},${n(yS + bS * .04)}`,
      inf: `M${-e},${e}L${e},${e}L${e},${n(yI)}Q0,${n(yI - bI)} ${-e},${n(yI)}Z`,
      orlaI: `M${n(-r)},${n(yI - bI * .05)}Q0,${n(yI - bI)} ${n(r)},${n(yI - bI * .05)}`
    };
  }

  /* --- ícone do menu: o mesmo esqueleto, de frente, desenhado com cores lisas (sem gradientes com id) --- */
  function iconeSVG() {
    const P = Object.assign({ x: 0, y: 0, h: -10, sobe: 0, olhosEsc: 1.05, sorriso: 1, boca: 0, papo: .1, afunda: 0, incha: 0, somK: 0, somLean: 0, _resp: 0, _pulso: 0 }, SENTADO, { cP: 22, hP: -14 });
    const G = geometria(P, 110, 196, .5);
    const t = e => `translate(${n(e.x)},${n(e.y)}) rotate(${n(e.ang)})`;
    const el = (e, f, extra = 0, k = 1, op) => `<ellipse cx="0" cy="0" rx="${n(e.rx * k + extra)}" ry="${n(e.ry * k + extra)}" transform="${t(e)}" fill="${f}"${op ? ` opacity="${op}"` : ''}/>`;
    const luzes = e => { const [ox, oy] = luzOff(e, .22), [ox2, oy2] = luzOff(e, .42);
      return `<ellipse rx="${n(e.rx * .74)}" ry="${n(e.ry * .74)}" transform="translate(${n(e.x + ox)},${n(e.y + oy)}) rotate(${n(e.ang)})" fill="#8ED257" opacity=".75"/>` +
        `<ellipse rx="${n(e.rx * .42)}" ry="${n(e.ry * .42)}" transform="translate(${n(e.x + ox2)},${n(e.y + oy2)}) rotate(${n(e.ang)})" fill="#C6EC88" opacity=".7"/>`; };
    const peca = (nm, cor = '#5AA834', luz = true) => { const e = G.el[nm], o = /^(alm|dedo)/.test(nm) ? 1.3 : 1.8; return el(e, COR.cont, o) + el(e, cor) + (luz ? luzes(e) : ''); };
    const grupo = {
      corpo: () => el(G.el.tronco, COR.cont, 1.9) + el(G.el.cabeca, COR.cont, 1.9) + el(G.el.tronco, '#5AA834') + luzes(G.el.tronco) +
        el(G.el.cabeca, '#5AA834') + luzes(G.el.cabeca) +
        (() => { const run = visivel(G.bocaSup, .02).map(i => G.bocaSup[i]); const pts = run.map(q => [q[0] + G.cab[0], q[1] + G.cab[1]]);
          const ch = `M${pts.map(q => n(q[0]) + ',' + n(q[1])).join('L')}`;
          const queixo = `<path d="${ch}L${n(pts[pts.length - 1][0] - 6)},${n(pts[pts.length - 1][1] + 10)}C${n(G.cab[0] + 30)},${n(G.cab[1] + 44)} ${n(G.cab[0] - 30)},${n(G.cab[1] + 44)} ${n(pts[0][0] + 6)},${n(pts[0][1] + 10)}Z" fill="#F4ECB4"/>`;
          return queixo + G.manchasH.map(m => m.vis > .3 ? el(m, COR.mancha, 0, 1, .85) : '').join('') +
            G.bochechas.map(m => el(m, '#F7909A', 0, 1, .55)).join('') + G.narinas.map(m => el(m, '#203010')).join('') +
            `<path d="${ch}" fill="none" stroke="${COR.cont}" stroke-width="2.4" stroke-linecap="round"/>`; })(),
      papo: () => peca('papo', '#F5EDB8', false),
      bracoE: () => NOMES.bracoE.map(x => peca(x, /^alm/.test(x) ? '#E7EDA0' : '#5AA834', !/^(alm|dedo)/.test(x))).join(''),
      bracoD: () => NOMES.bracoD.map(x => peca(x, /^alm/.test(x) ? '#E7EDA0' : '#5AA834', !/^(alm|dedo)/.test(x))).join(''),
      pernaE: () => NOMES.pernaE.map(x => peca(x, /^alm/.test(x) ? '#E7EDA0' : '#5AA834', !/^(alm|dedo)/.test(x))).join(''),
      pernaD: () => NOMES.pernaD.map(x => peca(x, /^alm/.test(x) ? '#E7EDA0' : '#5AA834', !/^(alm|dedo)/.test(x))).join('')
    };
    const olho = L => {
      const o = G.olho[L], r = DIM.globo.r * .5 * 1.05, ri = r * .8;
      return peca('bolha' + L) + `<g transform="translate(${n(o.x)},${n(o.y)})"><circle r="${n(r + 1.6)}" fill="${COR.cont}"/><circle r="${n(r)}" fill="#FFF8DC"/>
        <circle cx="${L === 'E' ? 1.2 : -1.2}" cy="1" r="${n(ri)}" fill="#E9A92F"/><circle cx="${L === 'E' ? 1.2 : -1.2}" cy="1" r="${n(ri * .7)}" fill="#F6C94A"/>
        <ellipse cx="${L === 'E' ? 1.2 : -1.2}" cy="1" rx="${n(ri * .58)}" ry="${n(ri * .34)}" fill="#160F08"/>
        <circle cx="${n(-r * .32)}" cy="${n(-r * .36)}" r="${n(r * .24)}" fill="#FFF"/><circle cx="${n(r * .32)}" cy="${n(r * .3)}" r="${n(r * .1)}" fill="#FFF" opacity=".8"/>
        <path d="M${n(-r * .9)},${n(-r * .5)}Q0,${n(-r * 1.25)} ${n(r * .9)},${n(-r * .5)}" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity=".5"/></g>`;
    };
    grupo.olhoE = () => olho('E'); grupo.olhoD = () => olho('D');
    const ordem = Object.keys(G.z).sort((a, b) => G.z[a] - G.z[b]);
    return `<circle cx="110" cy="110" r="106" fill="#CFEBD9"/>
      <path d="M8,128 C40,112 180,112 212,128 A106,106 0 0 1 8,128 Z" fill="#7FC2C0"/>
      <path d="M30,150 C70,140 150,140 190,150" stroke="#E9F7F2" stroke-width="2.4" fill="none" opacity=".7"/>
      <ellipse cx="112" cy="196" rx="96" ry="22" fill="#3F7E2A"/><ellipse cx="112" cy="192" rx="94" ry="21" fill="#6DB343"/>
      <path d="M112,192 L40,186 M112,192 L70,175 M112,192 L150,175 M112,192 L184,186" stroke="#93CF66" stroke-width="2" opacity=".8"/>
      ${ordem.map(g => grupo[g]()).join('')}
      <g transform="translate(188,184)"><path d="M0,0 C-8,-6 -10,-20 -2,-30 C2,-20 4,-8 0,0 Z" fill="#F6B6CC" stroke="#C25480" stroke-width="1.2"/><path d="M0,0 C-14,-2 -22,-12 -20,-22 C-12,-16 -4,-8 0,0 Z" fill="#F9CBDB" stroke="#C25480" stroke-width="1.2"/><path d="M0,0 C10,-4 16,-14 14,-24 C8,-16 2,-8 0,0 Z" fill="#F4A6C0" stroke="#C25480" stroke-width="1.2"/><circle cy="-6" r="4" fill="#F3C33A"/></g>`;
  }

  /* ================= 4) Cenário: charco na orla do bosque ================= */
  const HORIZ = 492;                                        // linha da margem do lado de lá (onde a água começa)
  const PAD = { cx: 1000, cy: 716, rx: 272, ry: 84 };       // nenúfar grande (habitat)
  const REPOUSO = { x: 625, y: 598, h: 22 };                // o sapo sentado na pedra com musgo
  const BORDA = { x: 737, y: 606 };                         // beira da pedra, de onde salta para o nenúfar
  const NO_PAD = { x: 986, y: 710 };                       // onde fica sentado no nenúfar
  const FLOR = { x: 1182, y: 758 };
  const ARV_L = (() => { const r = semente(7), v = []; for (let x = -40; x < 1680; x += 34 + r() * 30) v.push([n(x), n(420 + r() * 26), n(34 + r() * 34)]); return v; })();
  const ARV_M = (() => { const r = semente(31), v = []; for (let x = -60; x < 1700; x += 62 + r() * 46) v.push([n(x), n(456 + r() * 20), n(48 + r() * 40)]); return v; })();
  const NUV = [{ x: 250, y: 112, k: 1.15 }, { x: 700, y: 64, k: .78 }, { x: 1110, y: 150, k: 1.0 }, { x: 1470, y: 86, k: .9 }];

  function defsCena() {
    return `
    <linearGradient id="sapo-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7EC0EA"/><stop offset=".55" stop-color="#BFE2F1"/><stop offset="1" stop-color="#F1F2D6"/></linearGradient>
    <radialGradient id="sapo-sol"><stop offset="0" stop-color="#FFFDEB" stop-opacity="1"/><stop offset=".2" stop-color="#FFF4C4" stop-opacity=".75"/><stop offset=".55" stop-color="#FFF1C0" stop-opacity=".25"/><stop offset="1" stop-color="#FFF1C0" stop-opacity="0"/></radialGradient>
    <linearGradient id="sapo-copaM" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#78B356"/><stop offset=".6" stop-color="#4E8C42"/><stop offset="1" stop-color="#376B36"/></linearGradient>
    <radialGradient id="sapo-copa" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#9BD267"/><stop offset=".55" stop-color="#5E9F43"/><stop offset="1" stop-color="#2F6230"/></radialGradient>
    <radialGradient id="sapo-copaE" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#8CC85C"/><stop offset=".6" stop-color="#4A8A39"/><stop offset="1" stop-color="#244F25"/></radialGradient>
    <linearGradient id="sapo-tronco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9C774E"/><stop offset=".45" stop-color="#6E4D2C"/><stop offset="1" stop-color="#3E2914"/></linearGradient>
    <linearGradient id="sapo-betula" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFA"/><stop offset=".6" stop-color="#E4DFCF"/><stop offset="1" stop-color="#B4AD98"/></linearGradient>
    <linearGradient id="sapo-pinho" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5E9A58"/><stop offset=".5" stop-color="#3C7344"/><stop offset="1" stop-color="#28543A"/></linearGradient>
    <linearGradient id="sapo-agua" gradientUnits="userSpaceOnUse" x1="0" y1="${HORIZ}" x2="0" y2="900"><stop offset="0" stop-color="#CFE8E2"/><stop offset=".18" stop-color="#9CCDC8"/><stop offset=".5" stop-color="#5FA5A6"/><stop offset="1" stop-color="#2D727C"/></linearGradient>
    <linearGradient id="sapo-mgrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".9"/><stop offset=".55" stop-color="#FFFFFF" stop-opacity=".35"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
    <mask id="sapo-mreflexo"><rect x="0" y="${HORIZ}" width="1600" height="230" fill="url(#sapo-mgrad)"/></mask>
    <linearGradient id="sapo-terra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8DB453"/><stop offset=".35" stop-color="#6E9A3A"/><stop offset="1" stop-color="#3F6626"/></linearGradient>
    <linearGradient id="sapo-lama" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6B5232"/><stop offset="1" stop-color="#47351E"/></linearGradient>
    <radialGradient id="sapo-pedra" cx=".34" cy=".26" r=".85"><stop offset="0" stop-color="#C9C5B4"/><stop offset=".45" stop-color="#9C9888"/><stop offset=".85" stop-color="#6C685C"/><stop offset="1" stop-color="#4E4B42"/></radialGradient>
    <radialGradient id="sapo-musgo" cx=".36" cy=".2" r=".9"><stop offset="0" stop-color="#B5DA62"/><stop offset=".5" stop-color="#7DAE38"/><stop offset="1" stop-color="#4E7F24"/></radialGradient>
    <linearGradient id="sapo-madeira" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A88056"/><stop offset=".45" stop-color="#7A5732"/><stop offset="1" stop-color="#4A321A"/></linearGradient>
    <radialGradient id="sapo-cortada" cx=".45" cy=".45" r=".6"><stop offset="0" stop-color="#F0D6A6"/><stop offset=".6" stop-color="#D3AA72"/><stop offset="1" stop-color="#9A6E3E"/></radialGradient>
    <radialGradient id="sapo-nenufar" cx=".4" cy=".36" r=".7"><stop offset="0" stop-color="#98D262"/><stop offset=".55" stop-color="#63AA3C"/><stop offset="1" stop-color="#3E7E2A"/></radialGradient>
    <radialGradient id="sapo-nenufarP" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#8ACB5A"/><stop offset="1" stop-color="#4C8E33"/></radialGradient>
    <linearGradient id="sapo-petala" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".45" stop-color="#FBD3E1"/><stop offset="1" stop-color="#EC7FA6"/></linearGradient>
    <linearGradient id="sapo-petalaF" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#F8C6D7"/><stop offset=".55" stop-color="#EE95B5"/><stop offset="1" stop-color="#D9567F"/></linearGradient>
    <radialGradient id="sapo-centro" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFF0A0"/><stop offset=".6" stop-color="#F6C93A"/><stop offset="1" stop-color="#D89A1E"/></radialGradient>
    <linearGradient id="sapo-junco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9ACB5E"/><stop offset=".5" stop-color="#6EA343"/><stop offset="1" stop-color="#4A7E31"/></linearGradient>
    <linearGradient id="sapo-juncoF" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6FA548"/><stop offset="1" stop-color="#2F5F25"/></linearGradient>
    <linearGradient id="sapo-tabua" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A9703F"/><stop offset=".5" stop-color="#7A4A24"/><stop offset="1" stop-color="#4E2D13"/></linearGradient>
    <radialGradient id="sapo-sombraChao"><stop offset="0" stop-color="#1F2A10" stop-opacity=".45"/><stop offset="1" stop-color="#1F2A10" stop-opacity="0"/></radialGradient>
    <radialGradient id="sapo-sombraAgua"><stop offset="0" stop-color="#0E3A40" stop-opacity=".45"/><stop offset="1" stop-color="#0E3A40" stop-opacity="0"/></radialGradient>
    <linearGradient id="sapo-raio" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF9DA" stop-opacity=".5"/><stop offset="1" stop-color="#FFF9DA" stop-opacity="0"/></linearGradient>
    <radialGradient id="sapo-gota" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#D9F2F4"/><stop offset="1" stop-color="#8CC7CF"/></radialGradient>
    <radialGradient id="sapo-vinheta" cx=".5" cy=".46" r=".75"><stop offset=".6" stop-color="#14301C" stop-opacity="0"/><stop offset="1" stop-color="#14301C" stop-opacity=".32"/></radialGradient>
    <linearGradient id="sapo-peixe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9822E"/><stop offset=".5" stop-color="#F0B04E"/><stop offset="1" stop-color="#FCE7B0"/></linearGradient>
    <clipPath id="sapo-clip-peixe"><rect class="sp-clipPeixe" x="0" y="0" width="1600" height="600"/></clipPath>
    <linearGradient id="sapo-libCorpo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2F7FC4"/><stop offset=".5" stop-color="#5FC3EA"/><stop offset="1" stop-color="#2A6BB0"/></linearGradient>`;
  }

  function nuvemSVG(cls, i) {
    return `<g class="${cls}${i}"><g>
      <ellipse cx="0" cy="12" rx="80" ry="16" fill="#D7E7F1"/>
      <circle cx="-46" cy="0" r="26" fill="#FFFFFF"/><circle cx="-12" cy="-18" r="36" fill="#FFFFFF"/><circle cx="28" cy="-8" r="30" fill="#FFFFFF"/><circle cx="60" cy="4" r="18" fill="#FFFFFF"/>
      <ellipse cx="6" cy="8" rx="76" ry="14" fill="#FFFFFF"/>
      <path d="M-62,14 C-24,24 30,24 74,12" stroke="#C6DAE8" stroke-width="4" fill="none" opacity=".8"/>
      <path d="M-30,-30 C-20,-44 4,-48 18,-36" stroke="#FFFFFF" stroke-width="6" fill="none" opacity=".9" stroke-linecap="round"/>
    </g></g>`;
  }
  function ceuSVG() {
    return `<rect width="1600" height="${HORIZ + 30}" fill="url(#sapo-ceu)"/>
      <circle cx="150" cy="40" r="560" fill="url(#sapo-sol)"/>
      ${NUV.map((c, i) => nuvemSVG('sp-nuvem', i)).join('')}
      <g class="sp-aves" opacity=".5" fill="none" stroke="#4E6A78" stroke-width="2.2" stroke-linecap="round">
        <path class="sp-ave0" d="M-9,0 Q-4,-6 0,0 Q4,-6 9,0"/><path class="sp-ave1" d="M-7,0 Q-3,-5 0,0 Q3,-5 7,0"/>
      </g>`;
  }
  function pinheiroSVG(x, base, alt, w) {
    let s = `<rect x="${x - 6}" y="${base - 40}" width="12" height="44" fill="#4A321C"/>`;
    for (let i = 0; i < 4; i++) {
      const y0 = base - 30 - i * alt * .22, ww = w * (1 - i * .2), hh = alt * .36;
      s += `<path d="M${x},${n(y0 - hh)} L${n(x + ww / 2)},${n(y0)} Q${x},${n(y0 - 8)} ${n(x - ww / 2)},${n(y0)} Z" fill="url(#sapo-pinho)"/>`;
      s += `<path d="M${x},${n(y0 - hh)} L${n(x - ww / 2)},${n(y0)} Q${n(x - ww * .2)},${n(y0 - 5)} ${x},${n(y0 - 6)} Z" fill="#7FB46A" opacity=".45"/>`;
    }
    return s;
  }
  function betulaSVG(x, base, topo) {
    const r = semente(x | 0);
    let s = `<path d="M${x - 9},${base} C${x - 8},${n(lerp(base, topo, .5))} ${x - 6},${topo + 30} ${x - 3},${topo} L${x + 4},${topo} C${x + 6},${topo + 30} ${x + 9},${n(lerp(base, topo, .5))} ${x + 10},${base} Z" fill="url(#sapo-betula)"/>`;
    for (let y = topo + 14; y < base - 6; y += 12 + r() * 16) s += `<path d="M${n(x - 8 + r() * 4)},${n(y)} l${n(6 + r() * 6)},${n(-1 + r() * 2)}" stroke="#3B3328" stroke-width="${n(2 + r() * 2)}" stroke-linecap="round" opacity=".75"/>`;
    for (let i = 0; i < 7; i++) s += `<circle cx="${n(x + (r() - .5) * 70)}" cy="${n(topo + 10 + (r() - .3) * 60)}" r="${n(14 + r() * 16)}" fill="${i % 2 ? '#A8CF6A' : '#86BA52'}" opacity=".9"/>`;
    return s;
  }
  function samambaiaSVG(x, y, len, ang, k, cor) {          // feto: pé curvo com folíolos dos dois lados
    let s = '', px = 0, py = 0, a = ang * RAD;
    const pts = [];
    for (let i = 0; i <= 14; i++) { pts.push([px, py, a]); px += Math.cos(a) * len / 14; py += Math.sin(a) * len / 14; a += k / 14; }
    s += `<path d="${liso(pts.map(p => [p[0], p[1]]))}" stroke="${cor}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    for (let i = 1; i < 14; i++) {
      const [qx, qy, qa] = pts[i], l = 22 * Math.sin(PI * i / 14) + 6;
      for (const sg of [-1, 1]) {
        const b = qa + sg * 1.1;
        const ex = qx + Math.cos(b) * l, ey = qy + Math.sin(b) * l;
        s += `<path d="M${n(qx)},${n(qy)} Q${n((qx + ex) / 2 + Math.cos(qa) * 5)},${n((qy + ey) / 2 + Math.sin(qa) * 5)} ${n(ex)},${n(ey)} Q${n((qx + ex) / 2 - Math.cos(qa) * 3)},${n((qy + ey) / 2 - Math.sin(qa) * 3)} ${n(qx)},${n(qy)} Z" fill="${cor}"/>`;
      }
    }
    return `<g transform="translate(${x},${y})">${s}</g>`;
  }
  function florestaSVG() {
    const raios = [[60, 560, 130], [250, 760, 110], [430, 960, 90], [610, 1150, 70]].map(([a, b, w], i) =>
      `<path d="M${a},-20 L${a + w},-20 L${b + w * 1.8},${HORIZ + 60} L${b},${HORIZ + 60} Z" fill="url(#sapo-raio)"/>`).join('');
    return `<path d="M0,430 C200,382 380,404 560,388 C760,370 900,398 1080,382 C1260,366 1420,394 1600,376 L1600,${HORIZ + 10} L0,${HORIZ + 10} Z" fill="#AFD0BD"/>
      <g fill="#8DB89A">${ARV_L.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}<rect y="430" width="1600" height="70"/></g>
      <g fill="#A6CDA9" opacity=".6">${ARV_L.filter((_, i) => i % 2).map(([x, y, r]) => `<circle cx="${n(x - r * .25)}" cy="${n(y - r * .3)}" r="${n(r * .55)}"/>`).join('')}</g>
      ${pinheiroSVG(470, HORIZ, 230, 96)}${pinheiroSVG(1262, HORIZ, 220, 92)}${pinheiroSVG(1330, HORIZ, 170, 70)}
      <g>${ARV_M.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#sapo-copaM)"/>`).join('')}</g>
      <g fill="#9CD06E" opacity=".42">${ARV_M.map(([x, y, r]) => `<circle cx="${n(x - r * .28)}" cy="${n(y - r * .34)}" r="${n(r * .5)}"/>`).join('')}</g>
      <g fill="#3B2A18" opacity=".55">${ARV_M.filter((_, i) => i % 3 === 0).map(([x]) => `<rect x="${n(x - 4)}" y="${HORIZ - 34}" width="8" height="38"/>`).join('')}</g>
      ${betulaSVG(880, HORIZ + 2, 330)}${betulaSVG(1168, HORIZ + 2, 300)}
      <g class="sp-raios" opacity=".7">${raios}</g>`;
  }
  function margemLongeSVG() {
    const r = semente(77);
    let erva = '';
    for (let x = 0; x < 1600; x += 7 + r() * 9) {
      const h = 8 + r() * 18, b = HORIZ + 2 + r() * 4;
      erva += `<path d="M${n(x)},${n(b)} q${n(1 + r() * 3)},${n(-h * .6)} ${n(-2 + r() * 6)},${n(-h)}" stroke="${r() < .5 ? '#5C8A3A' : '#7BA84C'}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    }
    let fetos = '';
    for (const [x, a] of [[640, -100], [700, -70], [905, -110], [960, -75], [1405, -105], [1460, -70]]) fetos += samambaiaSVG(x, HORIZ + 4, 60, a, a < -90 ? -1.1 : 1.1, '#5E9444');
    let juncos = '';
    for (let i = 0; i < 26; i++) { const x = 1040 + r() * 160, h = 30 + r() * 46; juncos += `<path d="M${n(x)},${HORIZ + 4} q${n(-2 + r() * 4)},${n(-h * .5)} ${n(-4 + r() * 8)},${n(-h)}" stroke="#4E7F36" stroke-width="3" fill="none" stroke-linecap="round"/>`; }
    return `<path d="M0,${HORIZ - 4} C300,${HORIZ - 8} 700,${HORIZ - 2} 1000,${HORIZ - 6} C1250,${HORIZ - 9} 1450,${HORIZ - 3} 1600,${HORIZ - 6} L1600,${HORIZ + 6} L0,${HORIZ + 6} Z" fill="#4C6A33"/>
      <path d="M0,${HORIZ + 4} C400,${HORIZ + 7} 900,${HORIZ + 3} 1600,${HORIZ + 6}" stroke="#2F4A24" stroke-width="3" fill="none" opacity=".6"/>
      ${fetos}${erva}${juncos}
      <g fill="#8E8A7A"><ellipse cx="820" cy="${HORIZ + 3}" rx="16" ry="6"/><ellipse cx="1110" cy="${HORIZ + 4}" rx="11" ry="5"/><ellipse cx="1520" cy="${HORIZ + 3}" rx="14" ry="5"/></g>`;
  }
  function nenufarD(cx, cy, rx, ry, a1, a2) {               // nenúfar com o corte em «V» entre os ângulos a1 e a2 (graus)
    const p = a => [n(cx + rx * Math.cos(a * RAD)), n(cy + ry * Math.sin(a * RAD))];
    const [x1, y1] = p(a1), [x2, y2] = p(a2), m = p((a1 + a2) / 2);
    const vx = n(lerp(cx, m[0], .08)), vy = n(lerp(cy, m[1], .08));
    return `M${vx},${vy} L${x2},${y2} A${rx},${ry} 0 1 1 ${x1},${y1} Z`;
  }
  function aguaSVG() {
    const r = semente(5);
    let brilhos = '';
    for (let i = 0; i < 30; i++) {
      const y = HORIZ + 12 + Math.pow(r(), 1.4) * 380, x = 620 + r() * 1000, w = 10 + r() * 34 * (y - HORIZ) / 300;
      brilhos += `<ellipse class="sp-br${i}" cx="${n(x)}" cy="${n(y)}" rx="${n(w)}" ry="${n(1 + (y - HORIZ) / 200)}" fill="#F4FFFC" opacity="${n3(.2 + r() * .3)}"/>`;
    }
    let cint = '';
    for (let i = 0; i < 12; i++) {
      const x = 700 + r() * 820, y = HORIZ + 20 + r() * 200;
      cint += `<path class="sp-ci${i}" transform="translate(${n(x)},${n(y)})" d="M0,-6 L1.4,-1.4 L6,0 L1.4,1.4 L0,6 L-1.4,1.4 L-6,0 L-1.4,-1.4 Z" fill="#FFFFFF" opacity="0"/>`;
    }
    const peq = [[742, 548, 34], [868, 526, 24], [1330, 566, 44], [1452, 612, 36], [1118, 600, 28]];
    const pqs = peq.map(([x, y, rr], i) => `<g class="sp-pq${i}"><ellipse cx="${x + 4}" cy="${y + 4}" rx="${rr + 2}" ry="${n(rr * .31 + 2)}" fill="#1E5A5A" opacity=".25"/>
        <path d="${nenufarD(x, y, rr, n(rr * .31), -60 - i * 30, -44 - i * 30)}" fill="url(#sapo-nenufarP)" stroke="#2F6A26" stroke-width="1.6"/>
        <path d="M${x},${y} l${n(-rr * .6)},${n(rr * .12)} M${x},${y} l${n(rr * .5)},${n(rr * .16)} M${x},${y} l${n(rr * .1)},${n(rr * .26)}" stroke="#A6D97A" stroke-width="1.3" opacity=".7"/></g>`).join('');
    const ondas = Array.from({ length: 14 }, (_, i) => `<ellipse class="sp-onda${i}" rx="1" ry="1" fill="none" stroke="#F2FFFB" stroke-width="3" opacity="0"/>`).join('');
    return `<rect y="${HORIZ}" width="1600" height="${900 - HORIZ}" fill="url(#sapo-agua)"/>
      <g mask="url(#sapo-mreflexo)">
        <g transform="translate(0,${n(HORIZ * 1.62)}) scale(1,-.62)" opacity=".62">
          <g fill="#5A9474">${ARV_L.map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}"/>`).join('')}<rect y="430" width="1600" height="70"/></g>
          <g fill="#3E7650">${ARV_M.map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}"/>`).join('')}</g>
          <path d="M470,262 L520,${HORIZ} L420,${HORIZ} Z M1262,272 L1310,${HORIZ} L1214,${HORIZ} Z" fill="#2F5E3E"/>
          <rect x="545" y="318" width="16" height="180" fill="#E8E4D6" opacity=".6"/><rect x="1161" y="300" width="16" height="200" fill="#E8E4D6" opacity=".6"/>
        </g>
      </g>
      <rect y="${HORIZ}" width="1600" height="10" fill="#2E4A2A" opacity=".25"/>
      <g opacity=".22">${NUV.map((c, i) => nuvemSVG('sp-refl', i)).join('')}</g>
      <g class="sp-brilhos">${brilhos}</g>
      <g>${cint}</g>
      ${pqs}
      <g class="sp-ondas">${ondas}</g>
      <g class="sp-alfaiate"><g class="sp-alf-in">
        <ellipse class="sp-alf-c0" rx="7" ry="2" fill="none" stroke="#F2FFFB" stroke-width="1.4" opacity=".7"/>
        <ellipse class="sp-alf-c1" rx="7" ry="2" fill="none" stroke="#F2FFFB" stroke-width="1.4" opacity=".7"/>
        <path d="M-2,0 L-24,6 M-2,0 L-26,-5 M3,0 L22,7 M3,0 L24,-6 M6,0 L14,3 M6,0 L14,-3" stroke="#2A2218" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <ellipse rx="9" ry="2.6" fill="#3A2C1C"/><circle cx="9" cy="0" r="2.2" fill="#3A2C1C"/>
        <path d="M-22,6 l-3,1 M-24,-5 l-3,-1 M22,7 l3,1 M24,-6 l3,-1" stroke="#2A2218" stroke-width="1.2"/>
      </g></g>`;
  }
  function arvoreGrandeSVG() {                               // árvore grande da margem de cá, à esquerda (moldura)
    const r = semente(19);
    let casca = '';
    for (let i = 0; i < 16; i++) { const x = 92 + r() * 70, y = r() * 520; casca += `<path d="M${n(x)},${n(y)} c${n(-3 + r() * 6)},${n(16 + r() * 20)} ${n(-3 + r() * 6)},${n(30 + r() * 30)} ${n(-2 + r() * 4)},${n(50 + r() * 40)}" stroke="#3A2614" stroke-width="${n(2 + r() * 2.5)}" fill="none" opacity=".55" stroke-linecap="round"/>`; }
    let copa = '';
    const bolas = [[-30, 40, 130], [90, -10, 120], [210, 30, 115], [320, -20, 100], [40, 150, 105], [170, 140, 100], [280, 110, 80], [-40, 200, 90], [380, 60, 70]];
    for (const [x, y, rr] of bolas) copa += `<circle cx="${x}" cy="${y}" r="${rr}" fill="url(#sapo-copaE)"/>`;
    for (const [x, y, rr] of bolas) copa += `<circle cx="${n(x - rr * .26)}" cy="${n(y - rr * .3)}" r="${n(rr * .45)}" fill="#A2D46C" opacity=".35"/>`;
    for (let i = 0; i < 40; i++) { const a = r() * 2 * PI, b = bolas[i % bolas.length], d = b[2] * (.75 + r() * .3); copa += `<ellipse cx="${n(b[0] + Math.cos(a) * d)}" cy="${n(b[1] + Math.sin(a) * d)}" rx="12" ry="7" transform="rotate(${n(r() * 180)},${n(b[0] + Math.cos(a) * d)},${n(b[1] + Math.sin(a) * d)})" fill="${r() < .5 ? '#5E9F43' : '#3F7A33'}"/>`; }
    return `<g class="sp-arvoreE">
      <path d="M78,600 C60,590 40,600 20,612 C46,592 70,572 84,540 C92,400 96,220 100,-30 L172,-30 C170,200 168,400 176,540 C190,572 220,590 256,604 C226,600 200,596 182,600 Z" fill="url(#sapo-tronco)"/>
      <path d="M104,-30 C102,200 98,420 92,560" stroke="#C9A578" stroke-width="5" fill="none" opacity=".35"/>
      ${casca}
      <ellipse cx="136" cy="380" rx="10" ry="16" fill="#2E1D0E"/><ellipse cx="134" cy="378" rx="5" ry="9" fill="#120A04"/>
      <path d="M150,200 C190,180 230,170 280,160" stroke="#5A3D22" stroke-width="16" fill="none" stroke-linecap="round"/>
      <g class="sp-copaE">${copa}</g>
    </g>`;
  }
  function ramoSVG() {                                       // ramo pendente no canto de cima à direita
    const r = semente(43);
    let s = `<path d="M1640,-30 C1560,10 1460,40 1330,96" stroke="#5A3D22" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M1500,40 C1470,70 1450,90 1420,130" stroke="#5A3D22" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    for (let i = 0; i < 12; i++) {
      const t = i / 11, x0 = lerp(1600, 1340, t), y0 = lerp(-12, 92, Math.pow(t, 1.2)), len = 90 + r() * 140;
      let fol = `<path d="M0,0 C${n(-6 + r() * 12)},${n(len * .4)} ${n(-8 + r() * 16)},${n(len * .7)} ${n(-4 + r() * 8)},${n(len)}" stroke="#4E7A30" stroke-width="2" fill="none"/>`;
      for (let j = 1; j < 9; j++) { const yy = len * j / 9, sg = j % 2 ? 1 : -1; fol += `<ellipse cx="${n(sg * 7)}" cy="${n(yy)}" rx="9" ry="4.2" transform="rotate(${sg * 55},${n(sg * 7)},${n(yy)})" fill="${r() < .5 ? '#7DB64E' : '#5E9A3C'}"/>`; }
      s += `<g class="sp-fio${i}" transform="translate(${n(x0)},${n(y0)})">${fol}</g>`;
    }
    return `<g class="sp-ramo">${s}</g>`;
  }
  function trevosSVG() {                                     // trevos e folhinhas espalhados pela margem
    const r = semente(87);
    let s = '';
    for (let i = 0; i < 16; i++) {
      const x = 30 + r() * 480, y = 630 + r() * 250, k = .7 + r() * .6;
      s += `<g transform="translate(${n(x)},${n(y)}) scale(${n3(k)},${n3(k * .7)})">${[0, 120, 240].map(a => `<path d="M0,0 C-6,-4 -8,-12 -3,-14 C-1,-15 0,-13 0,-12 C0,-13 1,-15 3,-14 C8,-12 6,-4 0,0 Z" transform="rotate(${a + r() * 20})" fill="${r() < .5 ? '#6FA43F' : '#82B84C'}" stroke="#41702A" stroke-width="1"/>`).join('')}</g>`;
    }
    return s;
  }
  function relvaSVG(x0, x1, yf, alt, nn, sem, cores) {      // tufos de erva ao longo de uma linha
    const r = semente(sem);
    let s = '';
    for (let i = 0; i < nn; i++) {
      const x = lerp(x0, x1, r()), y = yf(x) + r() * 6, h = alt * (.5 + r() * .7), inc = -6 + r() * 12;
      s += `<path d="M${n(x - 2.5)},${n(y)} Q${n(x + inc * .4)},${n(y - h * .6)} ${n(x + inc)},${n(y - h)} Q${n(x + inc * .3 + 1.5)},${n(y - h * .55)} ${n(x + 2.5)},${n(y)} Z" fill="${cores[i % cores.length]}"/>`;
    }
    return s;
  }
  function margemPertoSVG() {
    const r = semente(61);
    const topo = x => x < 380 ? lerp(540, 552, x / 380) : lerp(552, 590, (x - 380) / 240);
    let seixos = '';
    for (let i = 0; i < 18; i++) { const x = 30 + r() * 420, y = 610 + r() * 270; seixos += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(5 + r() * 9)}" ry="${n(3 + r() * 5)}" fill="${r() < .5 ? '#A49F8E' : '#8A8576'}"/><ellipse cx="${n(x - 2)}" cy="${n(y - 2)}" rx="${n(3 + r() * 3)}" ry="1.6" fill="#E2DECF" opacity=".6"/>`; }
    let musgos = '';
    for (let i = 0; i < 9; i++) { const x = 40 + r() * 400, y = 600 + r() * 260; musgos += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(26 + r() * 40)}" ry="${n(8 + r() * 10)}" fill="#86B847" opacity=".5"/>`; }
    let flores = '';
    for (let i = 0; i < 14; i++) {
      const x = 20 + r() * 440, y = topo(x) + 20 + r() * 240, az = r() < .6;
      flores += `<g transform="translate(${n(x)},${n(y)})">${[0, 72, 144, 216, 288].map(a => `<circle cx="${n(Math.cos(a * RAD) * 3.6)}" cy="${n(Math.sin(a * RAD) * 3.6)}" r="3" fill="${az ? '#7FB2F0' : '#FFFFFF'}"/>`).join('')}<circle r="2" fill="#F5D54A"/></g>`;
    }
    const cogumelos = [[312, 596, 1], [338, 602, .75], [96, 640, .9]].map(([x, y, k]) => `<g transform="translate(${x},${y}) scale(${k})">
      <ellipse cx="2" cy="2" rx="16" ry="4" fill="#2A3A14" opacity=".35"/><path d="M-5,0 C-6,-10 -4,-18 -3,-20 L4,-20 C5,-18 6,-10 5,0 Z" fill="#F4EBD6" stroke="#8A7656" stroke-width="1.2"/>
      <path d="M-18,-18 C-16,-34 16,-34 18,-18 C10,-15 -10,-15 -18,-18 Z" fill="#B9733E" stroke="#6E4020" stroke-width="1.4"/><ellipse cx="-6" cy="-27" rx="5" ry="2.5" fill="#E7B184" opacity=".8"/></g>`).join('');
    return `<path d="M-20,540 C120,532 260,538 380,552 C470,562 540,574 600,586 L770,650 C806,690 792,740 756,778 C722,816 696,858 686,910 L-20,910 Z" fill="url(#sapo-terra)"/>
      <path d="M770,650 C806,690 792,740 756,778 C722,816 696,858 686,910" stroke="url(#sapo-lama)" stroke-width="16" fill="none"/>
      <path d="M778,660 C812,698 798,744 762,782 C728,820 702,860 692,910" stroke="#CDE8E2" stroke-width="2.4" fill="none" opacity=".6"/>
      <path d="M-20,546 C120,538 260,544 380,558 C470,568 540,580 600,592" stroke="#5E8434" stroke-width="5" fill="none" opacity=".5"/>
      ${musgos}${seixos}
      ${samambaiaSVG(210, 566, 120, -150, -1.2, '#4F8A38')}${samambaiaSVG(236, 570, 130, -118, -.9, '#5E9A42')}${samambaiaSVG(262, 572, 110, -70, 1.1, '#4F8A38')}${samambaiaSVG(30, 600, 120, -60, 1.2, '#5E9A42')}
      ${troncoCaidoSVG()}
      ${cogumelos}
      ${relvaSVG(0, 620, topo, 26, 120, 3, ['#6E9E3C', '#89B852', '#5C8A30', '#A1C865'])}
      ${relvaSVG(0, 470, x => 640 + (x * 7) % 230, 30, 60, 9, ['#5C8A30', '#77A845', '#4C7A28'])}
      ${relvaSVG(10, 560, x => 610 + (x * 13.7) % 280, 22, 110, 33, ['#6E9E3C', '#5C8A30', '#86B44E', '#4C7A28'])}
      ${trevosSVG()}
      ${flores}`;
  }
  function troncoCaidoSVG() {                                // tronco caído com musgo e um caracol
    const r = semente(13);
    let casca = '';
    for (let i = 0; i < 9; i++) { const x = 20 + i * 32 + r() * 10; casca += `<path d="M${n(x)},-26 C${n(x + 8)},-8 ${n(x - 6)},8 ${n(x + 4)},26" stroke="#4A321A" stroke-width="2.4" fill="none" opacity=".6"/>`; }
    let musgo = '';
    for (let i = 0; i < 16; i++) { const x = 6 + i * 18 + r() * 8; musgo += `<ellipse cx="${n(x)}" cy="${n(-26 + r() * 4)}" rx="${n(10 + r() * 8)}" ry="${n(5 + r() * 4)}" fill="${r() < .5 ? '#8EBD4C' : '#6FA338'}"/>`; }
    return `<g transform="translate(118,550) rotate(3.2)">
      <ellipse cx="160" cy="34" rx="180" ry="12" fill="#22300F" opacity=".35"/>
      <rect x="0" y="-30" width="320" height="60" rx="26" fill="url(#sapo-madeira)" stroke="#3A2614" stroke-width="3"/>
      ${casca}
      <path d="M10,-20 C80,-26 200,-26 300,-20" stroke="#C9A578" stroke-width="5" fill="none" opacity=".35" stroke-linecap="round"/>
      ${musgo}
      <path d="M120,-24 C116,-46 126,-56 140,-62" stroke="#6E4D2C" stroke-width="10" fill="none" stroke-linecap="round"/>
      <ellipse cx="320" cy="0" rx="15" ry="30" fill="url(#sapo-cortada)" stroke="#5A3D22" stroke-width="3"/>
      <ellipse cx="321" cy="0" rx="10" ry="21" fill="none" stroke="#B88A55" stroke-width="1.6"/><ellipse cx="322" cy="0" rx="6" ry="12" fill="none" stroke="#B88A55" stroke-width="1.4"/><ellipse cx="322" cy="0" rx="2.4" ry="4" fill="#9A6E3E"/>
      <g class="sp-caracol"><g class="sp-car-in">
        <path d="M-22,0 C-24,-8 -10,-10 6,-8 C14,-8 20,-6 22,-2 L22,0 Z" fill="#D9C7A0" stroke="#8A7656" stroke-width="1.4"/>
        <g class="sp-car-ant"><path d="M16,-6 C18,-14 20,-18 22,-22 M19,-5 C23,-12 27,-15 30,-18" stroke="#8A7656" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="22" cy="-22" r="2.2" fill="#3A2C1C"/><circle cx="30" cy="-18" r="2.2" fill="#3A2C1C"/></g>
        <circle cx="-6" cy="-14" r="13" fill="#C98A4A" stroke="#7A4E22" stroke-width="1.8"/>
        <path d="M-6,-14 m0,-8 a8,8 0 1 1 -6,10 a5,5 0 1 1 5,-6 a2.5,2.5 0 1 1 -2,3" stroke="#7A4E22" stroke-width="1.6" fill="none"/>
        <ellipse cx="-10" cy="-20" rx="4" ry="2" fill="#F2D2A2" opacity=".8"/>
      </g></g>
    </g>`;
  }
  function pedraSVG() {                                      // pedra grande com musgo, metida na água do lado direito
    const r = semente(29);
    let pintas = '';
    for (let i = 0; i < 40; i++) { const x = 450 + r() * 400, y = 600 + r() * 150; pintas += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(1 + r() * 2.4)}" fill="${r() < .5 ? '#5C594E' : '#D4D0C0'}" opacity=".5"/>`; }
    let mtex = '';
    for (let i = 0; i < 70; i++) { const x = 446 + r() * 404, y = 572 + r() * 70; mtex += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(1.5 + r() * 3)}" fill="${r() < .5 ? '#C8E57A' : '#5E9030'}" opacity=".55"/>`; }
    return `<g class="sp-pedra" transform="translate(-15,0)">
      <path d="M760,752 C800,770 860,766 884,744 C880,770 830,790 770,786 Z" fill="#1E4C50" opacity=".35"/>
      <path d="M420,652 C424,604 476,574 556,566 C636,558 724,560 792,578 C852,594 874,640 862,690 C852,732 792,756 700,760 C600,764 486,756 446,724 C426,706 418,680 420,652 Z" fill="url(#sapo-pedra)" stroke="#3E3B33" stroke-width="3.5"/>
      ${pintas}
      <path d="M520,700 C560,690 600,700 630,724 M700,690 C740,680 790,690 820,670 M600,740 C640,734 690,744 720,752" stroke="#4E4B42" stroke-width="2.4" fill="none" opacity=".55" stroke-linecap="round"/>
      <path d="M470,690 C500,672 540,666 580,672" stroke="#E6E2D2" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>
      <path d="M436,640 C440,606 486,580 556,572 C636,564 726,566 790,584 C830,596 852,616 858,640 C838,632 826,646 806,640 C786,634 770,652 748,644 C722,636 706,656 682,648 C656,640 640,660 612,650 C588,642 566,660 540,648 C516,638 498,656 474,648 C458,642 446,652 436,640 Z" fill="url(#sapo-musgo)"/>
      ${mtex}
      <path d="M470,600 C540,580 640,572 760,584" stroke="#DDF29A" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>
      <path d="M784,748 C812,742 846,722 864,700" stroke="#E8F8F4" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>
      <ellipse class="sp-lambe" cx="826" cy="742" rx="30" ry="6" fill="none" stroke="#F2FFFB" stroke-width="2" opacity=".5"/>
    </g>`;
  }
  function pedraFrenteSVG() {                                // ervas à frente da base da pedra (o sapo fica por trás destas camadas? não: estão em baixo)
    return '<g transform="translate(-15,0)">' + relvaSVG(420, 640, x => x < 520 ? 700 + (x - 420) * .5 : 750 + (x - 520) * .08, 30, 30, 21, ['#5C8A30', '#77A845', '#4C7A28', '#8DBB55']) + '</g>';
  }
  function florSVG() {                                       // nenúfar em flor (rosa), pétalas em perspetiva
    const pet = 'M0,0 C-11,-8 -13,-34 0,-50 C13,-34 11,-8 0,0 Z';
    let fora = '', meio = '', dentro = '';
    for (let i = 0; i < 9; i++) { const a = i / 9 * 360 + 10, ca = Math.cos(a * RAD), sa = Math.sin(a * RAD); fora += `<path d="${pet}" transform="translate(${n(ca * 6)},${n(sa * 2)}) rotate(${n(a + 90)}) scale(1,${n3(.42 + .3 * Math.max(0, -sa))})" fill="url(#sapo-petalaF)" stroke="#B9466E" stroke-width="1.4"/>`; }
    for (let i = 0; i < 7; i++) { const a = -180 + i * 30; meio += `<path d="${pet}" transform="rotate(${n(a + 90)}) scale(.78,${n3(.7 + .25 * Math.sin(-a * RAD))})" fill="url(#sapo-petala)" stroke="#C25480" stroke-width="1.3"/>`; }
    for (let i = 0; i < 5; i++) { const a = -150 + i * 30; dentro += `<path d="${pet}" transform="translate(0,-4) rotate(${n(a + 90)}) scale(.55,.62)" fill="url(#sapo-petala)" stroke="#C25480" stroke-width="1.2"/>`; }
    let est = '';
    for (let i = 0; i < 12; i++) { const a = -170 + i * 15; est += `<path d="M0,-10 l${n(Math.cos(a * RAD) * 12)},${n(Math.sin(a * RAD) * 10 - 4)}" stroke="#E9A21C" stroke-width="2.4" stroke-linecap="round"/>`; }
    return `<g class="sp-flor" transform="translate(${FLOR.x},${FLOR.y})">
      <ellipse cx="6" cy="8" rx="52" ry="12" fill="#1E3A12" opacity=".3"/>
      ${fora}${meio}
      <ellipse cx="0" cy="-10" rx="15" ry="7" fill="url(#sapo-centro)" stroke="#C88A16" stroke-width="1.4"/>${est}
      ${dentro}
      <path d="M-6,-46 C-4,-40 -2,-34 -2,-28" stroke="#FFFFFF" stroke-width="2.4" fill="none" opacity=".7" stroke-linecap="round"/>
    </g>`;
  }
  function nenufarTrasSVG() {
    const { cx, cy, rx, ry } = PAD;
    let veias = '';
    for (let a = -100; a < 250; a += 22) {
      if (a > -140 && a < -102) continue;
      const ex = cx + rx * .92 * Math.cos(a * RAD), ey = cy + ry * .92 * Math.sin(a * RAD);
      veias += `<path d="M${n(cx - 6)},${n(cy - 2)} Q${n(lerp(cx, ex, .55) + 6 * Math.sin(a * RAD))},${n(lerp(cy, ey, .5) - 4)} ${n(ex)},${n(ey)}" stroke="#A9DC78" stroke-width="2" fill="none" opacity=".55"/>`;
    }
    return `<g class="sp-nenufarTras">
      <ellipse cx="${cx + 22}" cy="${cy + 20}" rx="${rx + 14}" ry="${ry + 10}" fill="url(#sapo-sombraAgua)"/>
      <path d="${nenufarD(cx, cy + 8, rx, ry, -138, -104)}" fill="#2B5E20" stroke="${COR.cont}" stroke-width="3"/>
      <path d="${nenufarD(cx, cy, rx, ry, -136, -106)}" fill="url(#sapo-nenufar)" stroke="${COR.cont}" stroke-width="3"/>
      <ellipse cx="${cx - 8}" cy="${cy - 2}" rx="${n(rx * .3)}" ry="${n(ry * .3)}" fill="#B6E482" opacity=".22"/>
      ${veias}
      <path d="M${cx - rx * .9},${cy - ry * .3} A${rx * .92},${ry * .92} 0 0 1 ${cx - rx * .55},${cy - ry * .76}" stroke="#D2F29E" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>
      <path d="M${cx + rx * .1},${cy - ry * .98} A${rx * .98},${ry * .98} 0 0 1 ${cx + rx * .95},${cy - ry * .2}" stroke="#C8EC94" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>
      <g><circle cx="${cx + 120}" cy="${cy - 18}" r="5" fill="url(#sapo-gota)" opacity=".9"/><circle cx="${cx - 150}" cy="${cy + 20}" r="4" fill="url(#sapo-gota)" opacity=".9"/><circle cx="${cx + 160}" cy="${cy + 26}" r="3.4" fill="url(#sapo-gota)" opacity=".9"/></g>    </g>`;
  }
  function nenufarFrenteSVG() {
    const { cx, cy, rx, ry } = PAD;
    return `<g class="sp-nenufarFrente">
      <path class="sp-filme" d="M${cx - rx},${cy + 6} A${rx},${ry} 0 0 0 ${cx + rx},${cy + 6}" stroke="#E8FBF6" stroke-width="5" fill="none" opacity=".35"/>
      ${florSVG()}
    </g>`;
  }
  function juncoSVG(cls, x, y, alt, inc, tabua, larg) {      // folha de junco (e às vezes uma tabúa)
    const w = larg || 7;
    let s = `<path d="M${-w},0 C${-w * .6},${n(-alt * .5)} ${n(inc * .5 - 1)},${n(-alt * .85)} ${n(inc)},${n(-alt)} C${n(inc * .5 + 2)},${n(-alt * .82)} ${n(w * .7)},${n(-alt * .5)} ${w},0 Z" fill="url(#sapo-junco)" stroke="#2F5A22" stroke-width="1.4"/>`;
    if (tabua) s += `<path d="M${n(inc * .2)},${n(-alt * .55)} L${n(inc * .25)},${n(-alt * 1.08)}" stroke="#5E7A3A" stroke-width="3"/>
      <rect x="${n(inc * .22 - 7)}" y="${n(-alt * .82)}" width="14" height="${n(alt * .2)}" rx="7" fill="url(#sapo-tabua)" stroke="#3A2010" stroke-width="1.4"/>
      <path d="M${n(inc * .22 - 3)},${n(-alt * .8)} L${n(inc * .22 - 3)},${n(-alt * .64)}" stroke="#C99A64" stroke-width="2" opacity=".6"/>`;
    return `<g class="${cls}" transform="translate(${x},${y})"><g>${s}</g></g>`;
  }
  const JUNCOS = (() => {
    const r = semente(101), v = [];
    for (let i = 0; i < 9; i++) v.push(['E', 10 + r() * 150, 905, 260 + r() * 220, -30 + r() * 60, i % 3 === 1, 6 + r() * 3]);
    for (let i = 0; i < 12; i++) v.push(['D', 1350 + r() * 260, 900, 300 + r() * 280, -40 + r() * 70, i % 3 === 0, 6 + r() * 3]);
    return v;
  })();
  function primeiroPlanoSVG() {
    const juncos = JUNCOS.map((j, i) => juncoSVG(`sp-junco${i}`, n(j[1]), j[2], n(j[3]), n(j[4]), j[5], n(j[6]))).join('');
    return `<path d="M680,900 C900,884 1300,890 1600,880 L1600,910 L680,910 Z" fill="#1F5A62" opacity=".35"/>
      ${juncos}
      ${samambaiaSVG(-10, 900, 190, -55, .8, '#3F7A30')}${samambaiaSVG(70, 905, 170, -80, .5, '#4F8A38')}${samambaiaSVG(150, 910, 150, -110, -.6, '#3F7A30')}
      ${relvaSVG(0, 330, () => 902, 44, 40, 55, ['#3F6E26', '#55893A', '#2F5A1E'])}
      <g transform="translate(1290,872)"><ellipse rx="70" ry="20" fill="#2E6A2A" stroke="${COR.cont}" stroke-width="2.4"/><ellipse cx="-6" cy="-3" rx="56" ry="13" fill="#5EA03C"/><path d="M-50,-4 L40,-2 M-6,-14 L-2,10" stroke="#9FD472" stroke-width="1.6" opacity=".6"/></g>`;
  }
  function bichosSVG() {
    const asa = (i, x, y, rx, ry, a) => `<g transform="translate(${x},${y}) rotate(${a})"><ellipse class="sp-asa${i}" cx="${n(rx * .9)}" cy="0" rx="${rx}" ry="${ry}" fill="#E8F6FF" fill-opacity=".55" stroke="#7FA9C2" stroke-width="1.2"/></g>`;
    const gotas = Array.from({ length: 18 }, (_, i) => `<circle class="sp-gota${i}" r="1" fill="url(#sapo-gota)" opacity="0"/>`).join('');
    return `<g class="sp-libelinha"><g class="sp-lib-in">
        ${asa(0, 4, -2, 30, 6, -100)}${asa(1, 4, -2, 30, 6, -80)}${asa(2, -4, -2, 27, 6, -112)}${asa(3, -4, -2, 27, 6, -68)}
        <path d="M-4,0 C-20,1 -40,2 -62,2 L-62,-1 C-40,-2 -20,-3 -4,-3 Z" fill="url(#sapo-libCorpo)" stroke="#1E4A7A" stroke-width="1.2"/>
        <path d="M-14,-2 v3 M-24,-2 v3 M-34,-1 v3 M-44,-1 v3 M-54,-1 v3" stroke="#1E4A7A" stroke-width="1.4"/>
        <ellipse cx="2" cy="-1" rx="9" ry="5.5" fill="#3E9A6A" stroke="#1E5A3A" stroke-width="1.2"/>
        <circle cx="12" cy="-2" r="6" fill="#2A70B8" stroke="#163E6A" stroke-width="1.2"/><circle cx="14" cy="-4" r="2" fill="#FFFFFF" opacity=".8"/>
      </g></g>
      <g class="sp-mosca" display="none"><g class="sp-mosca-in">
        <ellipse class="sp-asaM" cx="-3" cy="-8" rx="7" ry="3.6" transform="rotate(-25)" fill="#F2F8FF" fill-opacity=".7" stroke="#8AA0B0" stroke-width="1"/>
        <ellipse class="sp-asaM" cx="3" cy="-8" rx="7" ry="3.6" transform="rotate(25)" fill="#F2F8FF" fill-opacity=".7" stroke="#8AA0B0" stroke-width="1"/>
        <ellipse cx="-2" cy="0" rx="8" ry="5.4" fill="#3A3A42" stroke="#1A1A20" stroke-width="1.2"/>
        <path d="M-7,-1 h8 M-6,2 h7" stroke="#6A6A74" stroke-width="1.2"/>
        <circle cx="6.5" cy="-1" r="4.6" fill="#2E2E36" stroke="#1A1A20" stroke-width="1"/>
        <circle cx="8.5" cy="-2.6" r="2.6" fill="#B23A2A"/><circle cx="9" cy="-3.2" r=".9" fill="#FFFFFF"/>
        <path d="M-4,4 l-3,4 M0,5 l0,4 M4,4 l3,4" stroke="#1A1A20" stroke-width="1.2" stroke-linecap="round"/>
      </g></g>
      <g clip-path="url(#sapo-clip-peixe)"><g class="sp-peixe" display="none"><g class="sp-peixe-in">
        <path d="M34,0 C26,-14 0,-18 -18,-10 L-36,-20 C-34,-8 -34,8 -36,20 L-18,10 C0,18 26,14 34,0 Z" fill="url(#sapo-peixe)" stroke="#7A4A16" stroke-width="2"/>
        <path d="M2,-15 C8,-24 18,-22 22,-12" fill="#E39A3C" stroke="#7A4A16" stroke-width="1.6"/>
        <path d="M-6,-8 C0,-2 0,4 -6,8 M4,-10 C10,-3 10,5 4,10" stroke="#C47A26" stroke-width="1.4" fill="none" opacity=".7"/>
        <circle cx="22" cy="-3" r="4" fill="#FFFFFF" stroke="#4A2A0A" stroke-width="1"/><circle cx="23" cy="-3" r="2.2" fill="#140C04"/>
        <path d="M30,4 q-3,2 -6,1" stroke="#7A4A16" stroke-width="1.4" fill="none"/>
      </g></g></g>
      <g class="sp-folha" display="none"><g class="sp-folha-in">
        <path d="M0,-18 C12,-10 12,10 0,18 C-12,10 -12,-10 0,-18 Z" fill="#D7C14A" stroke="#8A6E1E" stroke-width="1.4"/><path d="M0,-16 L0,22" stroke="#8A6E1E" stroke-width="1.4"/>
      </g></g>
      <g class="sp-gotas">${gotas}</g>`;
  }

  /* ================= 5) Poses (dados) ================= */
  const AGACHADO = Object.assign({}, SENTADO, { cF: -16, cH: 68, cP: 12, hP: -6 });
  const VOO = sim({ cF: -8, cH: 96, cP: 6, hP: -4, hY: 0, sq: -.07, mf: 46, mu: 54, ms: 72, ma: -30, cf: -255, cu: 62, cs: 74, df: -355, du: 68, ds: 80 });
  const ATERRAR = sim({ cF: 0, cH: 84, cP: -10, hP: 6, hY: 0, sq: -.02, mf: 100, mu: 16, ms: 64, ma: 18, cf: -140, cu: 44, cs: 94, df: -46, du: 30, ds: 114 });
  const ORGULHO = Object.assign({}, SENTADO, { cH: 101, cP: 31, hP: -25 });   // sentado todo vaidoso no nenúfar
  const ROSTO = { abE: 1, abD: 1, feliz: 0, pupila: .45, olhosEsc: 1, sorriso: .65, boca: 0, papo: 0, afunda: 0, incha: 0 };
  const MEMBROS = CHAVES.filter(k => /^[mcd][ED][fusa]$/.test(k));
  const agachar = (b, f) => ({ cF: b.cF - 8 * f, cH: b.cH - 24 * f, cP: b.cP - 13 * f, hP: b.hP + 11 * f });

  /* ================= montar() ================= */
  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .4 : 1;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.innerHTML = `<defs>${defsSapo('sapo-')}${defsCena()}</defs>
      ${ceuSVG()}${florestaSVG()}${margemLongeSVG()}${aguaSVG()}
      <g class="sp-habitat">
        <rect x="740" y="560" width="560" height="262" fill="#000" fill-opacity="0"/>
        ${nenufarTrasSVG()}
        <g class="sp-slotNenufar"></g>
        ${nenufarFrenteSVG()}
      </g>
      ${arvoreGrandeSVG()}${margemPertoSVG()}${pedraSVG()}
      <g class="sp-slotPedra">${sapoSVG('sapo-')}</g>
      <g class="sp-pedraFrente">${pedraFrenteSVG()}</g>
      <g class="sp-slotVoo"></g>
      ${primeiroPlanoSVG()}${ramoSVG()}${bichosSVG()}
      <rect width="1600" height="900" fill="url(#sapo-vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s), qa = s => Array.from(svg.querySelectorAll(s));
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; el.setAttribute(nome, v); } }

    /* --- referências do rig --- */
    const RP = {};
    const todas = ['tronco', 'cabeca', 'papo', 'bolhaE', 'bolhaD', ...NOMES.bracoE, ...NOMES.bracoD, ...NOMES.pernaE, ...NOMES.pernaD];
    for (const nm of todas) { const c = q(`.sp-${nm}-c`); RP[nm] = { c, e: q(`.sp-${nm}-e`), l: q(`.sp-${nm}-l`), o: +c.getAttribute('data-o') }; }
    const ESPEC = ['tronco', 'cabeca', 'bolhaE', 'bolhaD', 'coxaE', 'coxaD'];
    const ld = f => ({ E: f('E'), D: f('D') });
    const R = {
      sapo: q('.sp-sapo'), sombra: q('.sp-sombra'), partes: q('.sp-partes'),
      grupos: { corpo: q('.sp-g-corpo'), papo: q('.sp-g-papo'), olhoE: q('.sp-g-olhoE'), olhoD: q('.sp-g-olhoD'), bracoE: q('.sp-g-bracoE'), bracoD: q('.sp-g-bracoD'), pernaE: q('.sp-g-pernaE'), pernaD: q('.sp-g-pernaD') },
      spec: Object.fromEntries(ESPEC.map(nm => [nm, q('.sp-spec-' + nm)])),
      clipTronco: q('.sp-clipTronco'), clipCabeca: q('.sp-clipCabeca'), clipCoxa: ld(L => q('.sp-clipCoxa' + L)), clipCanela: ld(L => q('.sp-clipCanela' + L)),
      barriga: q('.sp-barriga'), sombraCab: q('.sp-sombraCab'), mC: MANCHAS_C.map((m, i) => q('.sp-mC' + i)), mH: MANCHAS_H.map((m, i) => q('.sp-mH' + i)), pt: PINTAS.map((m, i) => q('.sp-pt' + i)),
      boch: LADOS.map(([L]) => q('.sp-boch' + L)), nar: LADOS.map(([L]) => q('.sp-nar' + L)),
      dobra: LADOS.map(([L]) => q('.sp-dobra' + L)), masc: LADOS.map(([L]) => q('.sp-masc' + L)),
      relCab: q('.sp-relCab'), relCab2: q('.sp-relCab2'), queixo: q('.sp-queixo'), bocaInt: q('.sp-bocaInt'), linguaIn: q('.sp-linguaIn'), labio: q('.sp-labio'), boca: q('.sp-boca'),
      papoBrilho: q('.sp-papoBrilho'), papoRugas: q('.sp-papoRugas'),
      globo: ld(L => q('.sp-globo' + L)), iris: ld(L => q('.sp-iris' + L)), pupila: ld(L => q('.sp-pupila' + L)),
      palpS: ld(L => q('.sp-palpS' + L)), palpI: ld(L => q('.sp-palpI' + L)), orla: ld(L => q('.sp-orla' + L)), orlaI: ld(L => q('.sp-orlaI' + L)),
      membrana: ld(L => q('.sp-membrana' + L)), fx: ld(L => [0, 1, 2].map(i => q(`.sp-fx${L}${i}`))), fc: ld(L => q(`.sp-fc${L}0`)),
      lingua: q('.sp-lingua'), linguaP: q('.sp-linguaP'), linguaPonta: q('.sp-linguaPonta'), linguaB: q('.sp-linguaB'),
      slotPedra: q('.sp-slotPedra'), slotNenufar: q('.sp-slotNenufar'), slotVoo: q('.sp-slotVoo'),
      habitat: q('.sp-habitat'), nenTras: q('.sp-nenufarTras'), nenFrente: q('.sp-nenufarFrente'), filme: q('.sp-filme'),
      nuvens: NUV.map((c, i) => q('.sp-nuvem' + i)), refl: NUV.map((c, i) => q('.sp-refl' + i)), aves: [q('.sp-ave0'), q('.sp-ave1')],
      copaE: q('.sp-copaE'), ramo: q('.sp-ramo'), fios: Array.from({ length: 12 }, (_, i) => q('.sp-fio' + i)), raios: q('.sp-raios'),
      juncos: JUNCOS.map((j, i) => q(`.sp-junco${i} > g`)), brilhos: Array.from({ length: 30 }, (_, i) => q('.sp-br' + i)),
      cint: Array.from({ length: 12 }, (_, i) => q('.sp-ci' + i)), pq: Array.from({ length: 5 }, (_, i) => q('.sp-pq' + i)),
      ondas: Array.from({ length: 14 }, (_, i) => q('.sp-onda' + i)), gotas: Array.from({ length: 18 }, (_, i) => q('.sp-gota' + i)),
      alf: q('.sp-alfaiate'), lib: q('.sp-libelinha'), asas: [0, 1, 2, 3].map(i => q('.sp-asa' + i)),
      mosca: q('.sp-mosca'), asasM: qa('.sp-asaM'), peixe: q('.sp-peixe'), clipPeixe: q('.sp-clipPeixe'), folha: q('.sp-folha'),
      caracol: q('.sp-caracol'), carAnt: q('.sp-car-ant'), lambe: q('.sp-lambe')
    };
    const cintFase = R.cint.map((_, i) => ({ f: .6 + (i * .37) % .9, ph: i * 1.7 }));
    const brX = R.brilhos.map(el => +el.getAttribute('cx'));

    /* --- estado da pose (todos os números que o desenho lê a cada quadro) --- */
    const P = Object.assign({ x: REPOUSO.x, y: REPOUSO.y, h: REPOUSO.h, sobe: 0, chao: null, sombraOp: 1, lingua: 0, somK: 0, somLean: 0, respA: 1, respF: .42 }, SENTADO, ROSTO);
    let modo = 'fora';                    // 'fora' | 'indo' | 'dentro' | 'voltando'
    let noPad = false;                    // o sapo está em cima do nenúfar (sobe e desce com ele)
    let reagindo = false, tempo = 0, vivo = true, dtUlt = 16.7, G = null, moscasDentro = 0;
    const fase = { resp: 0, papo: 0 };
    const pad = { dip: 0, v: 0, ang: 0, va: 0, off: 0 };
    const lingua = { alvo: null, curva: .3, onda: 0, ponta: [0, 0] };
    const baseP = () => (modo === 'dentro' || noPad) ? ORGULHO : SENTADO;

    /* --- desenhar: lê P, calcula a geometria e põe as transformações em todas as peças --- */
    const tfE = e => `translate(${n(e.x)},${n(e.y)}) rotate(${n(e.ang)}) scale(${n(e.rx)},${n(e.ry)})`;
    function aplica(r, e) {
      const t = `translate(${n(e.x)},${n(e.y)}) rotate(${n(e.ang)})`;
      poe(r.e, `${t} scale(${n(e.rx)},${n(e.ry)})`);
      poe(r.c, `${t} scale(${n(e.rx + r.o)},${n(e.ry + r.o)})`);
      if (r.l) { const [ox, oy] = luzOff(e, .21); poe(r.l, `translate(${n(e.x + ox)},${n(e.y + oy)}) rotate(${n(e.ang)}) scale(${n(e.rx * .78)},${n(e.ry * .78)})`); }
    }
    function brilho(el, e) {
      const [ox, oy] = luzOff(e, .56), m = Math.min(e.rx, e.ry);
      poe(el, `translate(${n(e.x + ox)},${n(e.y + oy)}) rotate(-32) scale(${n(m * .26)},${n(m * .13)})`);
    }
    const elPt = (e, t, k) => { const a = e.ang * RAD, x = Math.cos(t) * e.rx * k, y = Math.sin(t) * e.ry * k; return [e.x + x * Math.cos(a) - y * Math.sin(a), e.y + x * Math.sin(a) + y * Math.cos(a)]; };
    let ordemAtual = '';
    function desenhar() {
      const X = P.x, Y = P.y + P.sobe + (noPad ? pad.off : 0);
      P._resp = Math.sin(fase.resp) * P.respA; P._pulso = Math.sin(fase.papo);
      P._piscaE = piscaV.E; P._piscaD = piscaV.D;
      G = geometria(P, X, Y, ESC);
      for (const nm in RP) aplica(RP[nm], G.el[nm]);
      for (const nm of ESPEC) brilho(R.spec[nm], G.el[nm]);
      poe(R.clipTronco, tfE(G.el.tronco)); poe(R.clipCabeca, tfE(G.el.cabeca));
      poe(R.barriga, tfE(G.barriga));
      poe(R.sombraCab, tfE(G.sombraCab));
      G.manchasC.forEach((m, i) => { poe(R.mC[i], tfE(m)); atr(R.mC[i], 'opacity', n3(limita((m.vis - .1) / .3, 0, 1) * .8)); });
      G.manchasH.forEach((m, i) => { poe(R.mH[i], tfE(m)); atr(R.mH[i], 'opacity', n3(limita((m.vis - .1) / .3, 0, 1) * .85)); });
      G.pintas.forEach((m, i) => { poe(R.pt[i], tfE(m)); atr(R.pt[i], 'opacity', n3(limita((m.vis - .12) / .3, 0, 1) * .75)); });
      G.bochechas.forEach((m, i) => { poe(R.boch[i], tfE(m)); atr(R.boch[i], 'opacity', n3(limita((m.vis - .05) / .3, 0, 1) * (.42 + .3 * P.feliz))); });
      G.narinas.forEach((m, i) => { poe(R.nar[i], tfE(m)); atr(R.nar[i], 'opacity', n3(limita((m.vis - .05) / .25, 0, 1))); });
      const linhaVis = (el, pts, lim) => { const idx = visivel(pts, lim); atr(el, 'd', idx.length > 1 ? liso(idx.map(i => pts[i])) : 'M0,0'); };
      G.dobras.forEach((p, i) => linhaVis(R.dobra[i], p, .18)); G.mascaras.forEach((p, i) => linhaVis(R.masc[i], p, .15));
      desenharBoca();
      desenharPapo();
      desenharOlhos();
      for (const [L] of LADOS) {
        atr(R.membrana[L], 'd', G['membrana' + L]);
        const cx = G.el['coxa' + L], cn = G.el['canela' + L];
        poe(R.clipCoxa[L], tfE(cx)); poe(R.clipCanela[L], tfE(cn));
        const faixa = (el, e, t, w) => { const a = e.ang * RAD; poe(el, `translate(${n(e.x + Math.cos(a) * t * e.rx)},${n(e.y + Math.sin(a) * t * e.rx)}) rotate(${n(e.ang)}) scale(${n(e.rx * w)},${n(e.ry * 1.15)})`); };
        faixa(R.fx[L][0], cx, -.42, .09); faixa(R.fx[L][1], cx, 0, .1); faixa(R.fx[L][2], cx, .42, .085);
        faixa(R.fc[L], cn, 0, .12);
      }
      // ordem dos grupos pela profundidade (o que está mais perto desenha-se por cima)
      const ordem = Object.keys(G.z).sort((a, b) => G.z[a] - G.z[b]), ch = ordem.join();
      if (ch !== ordemAtual) { ordemAtual = ch; for (const g of ordem) R.partes.appendChild(R.grupos[g]); }
      // sombra no chão (pedra, nenúfar ou água por baixo do salto)
      const chao = (P.chao == null ? P.y : P.chao) + (noPad ? pad.off : 0), alto = limita((chao - Y) / 240, 0, 1);
      poe(R.sombra, `translate(${n(X + 24)},${n(chao + 12)}) scale(${n(215 * (1 - alto * .35))},${n(64 * (1 - alto * .35))})`);
      atr(R.sombra, 'opacity', n3(P.sombraOp * (1 - alto * .7)));
      desenharLingua();
    }
    function desenharBoca() {
      const sup2 = G.bocaSup, idx = visivel(sup2, .04);
      const tr = `translate(${n(G.cab[0])},${n(G.cab[1])})`;
      poe(R.relCab, tr); poe(R.relCab2, tr);
      if (idx.length < 3) { atr(R.boca, 'd', 'M0,0'); atr(R.labio, 'd', 'M0,0'); atr(R.queixo, 'd', 'M0,0'); atr(R.bocaInt, 'display', 'none'); return; }
      const pts = idx.map(i => sup2[i]);
      let d = liso(pts);
      const canto = (i, j) => {                 // covinha no canto da boca (só nos cantos verdadeiros)
        const p = sup2[i], o = sup2[j], dx = p[0] - o[0], dy = p[1] - o[1], l = Math.hypot(dx, dy) || 1, ux = dx / l;
        return `M${n(p[0] - ux * 2)},${n(p[1] + 1)}Q${n(p[0] + ux * 7)},${n(p[1] + 1)} ${n(p[0] + ux * 6)},${n(p[1] - 8)}`;
      };
      if (idx[0] === 0) d += canto(0, 1);
      if (idx[idx.length - 1] === sup2.length - 1) d += canto(sup2.length - 1, sup2.length - 2);
      atr(R.boca, 'd', d);
      atr(R.labio, 'd', liso(pts.map(p => [p[0], p[1] - 4.5])));
      const a = pts[0], b = pts[pts.length - 1];
      atr(R.queixo, 'd', liso(pts) + `L${n(b[0])},${n(b[1] + 170)}L${n(a[0])},${n(a[1] + 170)}Z`);
      if (G.bocaInf) {
        const inf = idx.map(i => G.bocaInf[i]);
        atr(R.bocaInt, 'display', 'inline');
        atr(R.bocaInt, 'd', liso(pts) + liso(inf.slice().reverse()).replace(/^M/, 'L') + 'Z');
        const m = inf[Math.floor(inf.length / 2)], mu = pts[Math.floor(pts.length / 2)];
        atr(R.linguaIn, 'display', P.lingua < .02 ? 'inline' : 'none');
        poe(R.linguaIn, `translate(${n(m[0])},${n(lerp(mu[1], m[1], .7))}) scale(${n3(limita((m[1] - mu[1]) / 16, .2, 1.4))})`);
      } else { atr(R.bocaInt, 'display', 'none'); atr(R.linguaIn, 'display', 'none'); }
    }
    function desenharPapo() {
      const e = G.el.papo, k = Math.min(1, G.kPapo);
      atr(RP.papo.e, 'opacity', n3(1 - .22 * k));
      const a = elPt(e, PI * 1.1, .72), b = elPt(e, PI * 1.32, .78), c = elPt(e, PI * 1.5, .7);
      atr(R.papoBrilho, 'd', `M${n(a[0])},${n(a[1])}Q${n(b[0])},${n(b[1])} ${n(c[0])},${n(c[1])}`);
      atr(R.papoBrilho, 'opacity', n3(limita((k - .15) * 1.2, 0, .85)));
      atr(R.papoBrilho, 'stroke-width', n(2 + 6 * k));
      let rug = '';
      for (const kk of [.45, .65, .85]) { const p1 = elPt(e, PI * .38, kk), p2b = elPt(e, PI * .5, kk + .06), p3 = elPt(e, PI * .62, kk); rug += `M${n(p1[0])},${n(p1[1])}Q${n(p2b[0])},${n(p2b[1])} ${n(p3[0])},${n(p3[1])}`; }
      atr(R.papoRugas, 'd', rug);
      atr(R.papoRugas, 'opacity', n3(.55 * (1 - k)));
    }

    /* --- olhos: cada olho olha para o seu lado (independentes), pálpebras, pupilas, piscar a «afundar» o olho --- */
    const olhar = { E: { foco: null, livre: null, g: null }, D: { foco: null, livre: null, g: null }, t: 0 };
    const focar = f => { olhar.E.foco = f; olhar.D.foco = f; };
    function desenharOlhos() {
      const kO = 1 - Math.exp(-dtUlt / 50);
      for (const [L] of LADOS) {
        const o = G.olho[L], ol = olhar[L];
        poe(R.globo[L], `translate(${n(o.x)},${n(o.y)}) scale(${n3(P.olhosEsc * G.c.qx)},${n3(P.olhosEsc * G.c.qy)})`);
        let alvo;
        if (ol.foco) { const f = ol.foco(); alvo = vn([(f[0] - o.x) / ESC, -(f[1] - o.y) / ESC, 120]); }
        else alvo = ol.livre ? ol.livre(o.base) : o.base;
        const g = vn(vs(vk(o.base, .45), alvo));
        ol.g = ol.g ? vn(vlerp(ol.g, g, kO)) : g;
        const gx = ol.g[0], gy = -(ol.g[1] * cE - ol.g[2] * sE), dz = vp(ol.g, VISTA);
        const ang = Math.atan2(gy, gx) / RAD, fz = limita(.58 + .42 * Math.max(0, dz), .58, 1), off = RG * .55;
        poe(R.iris[L], `translate(${n(gx * off)},${n(gy * off)}) rotate(${n(ang)}) scale(${n3(fz)},1) rotate(${n(-ang)})`);
        atr(R.pupila[L], 'rx', n(RI * (.44 + .2 * P.pupila)));
        atr(R.pupila[L], 'ry', n(RI * (.17 + .36 * P.pupila)));
        const fecho = limita(1 - P['ab' + L] + piscaV[L], 0, 1);
        const pl = palpebras(fecho, Math.max(P.feliz, P.somLean * .5));
        atr(R.palpS[L], 'd', pl.sup); atr(R.orla[L], 'd', pl.orla);
        atr(R.palpI[L], 'd', pl.inf); atr(R.orlaI[L], 'd', pl.orlaI);
      }
    }
    const piscaV = { E: 0, D: 0 };
    const pisca = { t: aleat(1500, 3500), f: -1, quais: 'ED', duplo: false };
    function atualizarPiscar(dt) {
      if (pisca.f < 0) {
        pisca.t -= dt; piscaV.E = piscaV.D = 0;
        if (pisca.t <= 0) { pisca.f = 0; pisca.quais = Math.random() < .15 ? escolhe(['E', 'D']) : 'ED'; pisca.duplo = !pisca.duplo && Math.random() < .25; }
        return;
      }
      pisca.f += dt;
      const u = pisca.f / 260, v = u < .38 ? esai(u / .38) : 1 - eseno(limita((u - .38) / .62, 0, 1));
      piscaV.E = pisca.quais.includes('E') ? v : 0; piscaV.D = pisca.quais.includes('D') ? v : 0;
      if (u >= 1) { piscaV.E = piscaV.D = 0; pisca.f = -1; pisca.t = pisca.duplo ? 130 : aleat(2000, 6000); }
    }
    function atualizarOlharLivre(dt) {         // olhadelas ao acaso; às vezes cada olho vai para um lado (é um sapo!)
      olhar.t -= dt;
      if (olhar.t > 0) return;
      olhar.t = aleat(700, 2400);
      const r = Math.random();
      const desvio = () => { const a = [aleat(-.55, .55), aleat(-.3, .35), 0]; return b => vn(vs(b, a)); };
      if (r < .25) { olhar.E.livre = olhar.D.livre = () => VISTA; }                       // olha para nós
      else if (r < .45) { olhar.E.livre = olhar.D.livre = null; }
      else if (r < .75) { const d = desvio(); olhar.E.livre = olhar.D.livre = d; }
      else { olhar.E.livre = desvio(); olhar.D.livre = desvio(); }                       // olhos independentes
    }

    /* --- língua: comprida, elástica, com uma bolinha pegajosa na ponta --- */
    function desenharLingua() {
      const e = P.lingua;
      if (e < .01 || !lingua.alvo) { atr(R.lingua, 'display', 'none'); return; }
      atr(R.lingua, 'display', 'inline');
      const b = G.linguaBase, t = lingua.alvo();
      const dx = t[0] - b[0], dy = t[1] - b[1], D = Math.hypot(dx, dy) || 1, ux = dx / D, uy = dy / D, px = -uy, py = ux, L = D * e;
      const N = 12, esq = [], dir = [], meio = [];
      for (let i = 0; i <= N; i++) {
        const s = i / N, al = s * L;
        const lat = lingua.curva * L * .2 * sino(s) + lingua.onda * Math.sin(s * PI * 3 - tempo * .04) * 7 * s * (1 - s);
        const cx = b[0] + ux * al + px * lat, cy = b[1] + uy * al + py * lat, w = lerp(9.5, 6, s);
        esq.push([cx + px * w, cy + py * w]); dir.push([cx - px * w, cy - py * w]); meio.push([cx - px * 2.5, cy - py * 2.5]);
      }
      const p = [b[0] + ux * L, b[1] + uy * L];
      lingua.ponta = p;
      atr(R.linguaP, 'd', liso(esq) + liso(dir.reverse()).replace(/^M/, 'L') + 'Z');
      poe(R.linguaPonta, `translate(${n(p[0])},${n(p[1])}) scale(${n3(.8 + .3 * Math.min(1, e))})`);
      atr(R.linguaB, 'd', liso(meio.slice(1, N)));
    }

    /* --- nenúfar: mola (afunda quando o sapo aterra e balança), ondas e gotas --- */
    function atualizarPad(dt) {
      const s = dt / 1000, alvo = noPad ? 7 : 0, ns = Math.max(1, Math.ceil(s / .008)), h = s / ns;
      for (let i = 0; i < ns; i++) {
        pad.v += (-150 * (pad.dip - alvo) - 6.5 * pad.v) * h; pad.dip += pad.v * h;
        pad.va += (-110 * pad.ang - 6 * pad.va) * h; pad.ang += pad.va * h;
      }
      pad.off = pad.dip + Math.sin(tempo / 950) * 1.5 * calma;
      const tp = `translate(0,${n(pad.off)}) rotate(${n3(pad.ang)},${PAD.cx},${PAD.cy})`;
      poe(R.nenTras, tp); poe(R.nenFrente, tp);
      atr(R.filme, 'opacity', n3(.22 + limita(Math.abs(pad.dip) / 13, 0, 1) * .6));
    }
    const ondas = R.ondas.map(el => ({ el, t: 1, dur: 1, vis: false }));
    function onda(x, y, r0, r1, dur, f, atraso) {
      const o = ondas.find(o => o.t >= o.dur) || ondas.reduce((a, b) => a.t / a.dur > b.t / b.dur ? a : b);
      Object.assign(o, { x, y, r0, r1, dur, f, t: -(atraso || 0) });
    }
    function atualizarOndas(dt) {
      for (const o of ondas) {
        if (o.t >= o.dur) { if (o.vis) { atr(o.el, 'opacity', '0'); o.vis = false; } continue; }
        o.t += dt;
        if (o.t < 0) continue;
        const u = Math.min(1, o.t / o.dur), r = lerp(o.r0, o.r1, esai(u));
        atr(o.el, 'cx', n(o.x)); atr(o.el, 'cy', n(o.y)); atr(o.el, 'rx', n(r)); atr(o.el, 'ry', n(r * .31));
        atr(o.el, 'opacity', n3(o.f * Math.pow(1 - u, 1.3))); atr(o.el, 'stroke-width', n(1.2 + 3 * (1 - u)));
        o.vis = true;
      }
    }
    const gotas = R.gotas.map(el => ({ el, vivo: false }));
    function gota(x, y, vx, vy, r, yAgua) {
      const g = gotas.find(g => !g.vivo); if (!g) return;
      Object.assign(g, { x, y, vx, vy, r, yAgua, vivo: true });
      atr(g.el, 'opacity', '.95');
    }
    function salpicar(x, y, quantas, forca, larg) {
      for (let i = 0; i < quantas; i++) {
        const a = aleat(-1, 1), xx = x + a * (larg || 30);
        gota(xx, y - aleat(0, 8), a * aleat(90, 260) * forca, -aleat(240, 520) * forca, aleat(3, 6.5), y + aleat(4, 26));
      }
    }
    function atualizarGotas(dt) {
      const s = dt / 1000;
      for (const g of gotas) {
        if (!g.vivo) continue;
        g.vy += 1500 * s; g.x += g.vx * s; g.y += g.vy * s;
        if (g.vy > 0 && g.y > g.yAgua) { g.vivo = false; atr(g.el, 'opacity', '0'); onda(g.x, g.yAgua, 1, 12, 520, .55); continue; }
        poe(g.el, `translate(${n(g.x)},${n(g.y)}) scale(${n(g.r * .85)},${n(g.r * (1 + Math.min(.5, Math.abs(g.vy) / 900)))})`);
      }
    }
    function moverPara(sitio) {
      const s = sitio === 'nenufar' ? R.slotNenufar : sitio === 'voo' ? R.slotVoo : R.slotPedra;
      if (R.sapo.parentNode !== s) s.appendChild(R.sapo);
    }

    /* --- tarefas: geradores que avançam com o dt do relógio (uma por faixa; lançar outra na mesma faixa substitui) --- */
    const faixas = new Map();
    function lancar(nome, gen, fim) {
      if (!vivo) return;
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
    const copia = () => { const o = {}; for (const k of CHAVES) o[k] = P[k]; return o; };
    const mistura = (A, B, t) => { const o = {}; for (const k of CHAVES) o[k] = lerp(A[k], B[k], t); return o; };
    const aplicaPose = (A, B, t) => { for (const k of CHAVES) P[k] = lerp(A[k], B[k], t); };

    /* --- salto de sapo: agacha (antecipação), as patas de trás esticam-se no ar, o corpo estica,
           as mãos vão à frente para aterrar e as patas dobram-se outra vez (compressão). Trajetória em arco. --- */
    function* salto(o) {
      const fz = o.forca == null ? 1 : o.forca, base = o.pose || baseP();
      if (o.prep) yield* tw(Object.assign(agachar(base, fz), { sq: .05 + .05 * fz }), o.prep, eio);
      const x0 = P.x, y0 = P.y, h0 = P.h, c0 = P.chao == null ? P.y : P.chao;
      const ini = copia(), voo = mistura(base, VOO, fz), ate = mistura(base, ATERRAR, Math.min(1, fz * 1.4));
      if (o.aoDescolar) o.aoDescolar();
      P.sombraOp = o.sombraOp == null ? 1 : o.sombraOp;
      yield* durante(o.ms, u => {
        P.x = lerp(x0, o.x, u);
        P.y = lerp(y0, o.y, u) - o.alt * 4 * u * (1 - u);
        P.chao = lerp(c0, o.chao == null ? o.y : o.chao, u);
        if (o.h != null) P.h = lerp(h0, o.h, eseno(limita((u - .12) / .7, 0, 1)));
        if (u < .22) aplicaPose(ini, voo, esai(u / .22));
        else if (u < .5) aplicaPose(voo, voo, 1);
        else aplicaPose(voo, ate, eseno((u - .5) / .5));
        if (o.durante) o.durante(u);
      });
      P.chao = null; P.sombraOp = 1;
      if (o.aoAterrar) o.aoAterrar();
      yield* tw(Object.assign({}, base, agachar(base, .45 + .45 * fz), { sq: .1 + .1 * fz }), 70 + 35 * fz, esai);
      yield* tw(Object.assign({}, base, { sq: 0 }), 170 + 100 * fz, eio);
    }
    // volta a pôr o sapo direitinho no sítio (depois de uma reação ou de um comportamento interrompido)
    function* recompor() {
      const longe = Math.abs(P.h - REPOUSO.h) > 3 || Math.hypot(P.x - REPOUSO.x, P.y - REPOUSO.y) > 3 || P.chao != null;
      lingua.alvo = null; P.lingua = 0;
      if (longe) yield* salto({ x: REPOUSO.x, y: REPOUSO.y, h: REPOUSO.h, alt: 30, ms: 330, forca: .35, prep: 110, pose: SENTADO });
      const dif = {}; let ha = false;
      for (const k of CHAVES) if (Math.abs(P[k] - SENTADO[k]) > .3) { dif[k] = SENTADO[k]; ha = true; }
      if (ha) yield* tw(dif, 260);
    }
    // antes de ir ou voltar: recolhe a língua, fecha a boca e pousa as patas que estejam no ar
    function* arrumar(ms) {
      const alvo = { lingua: 0, boca: 0, incha: 0, papo: 0, afunda: 0, abE: 1, abD: 1, hY: 0, sobe: 0 }, b = baseP();
      for (const k of MEMBROS) if (Math.abs(P[k] - b[k]) > .3) alvo[k] = b[k];
      let ha = false; for (const k in alvo) if (Math.abs(P[k] - alvo[k]) > .01) ha = true;
      if (ha) yield* tw(alvo, ms, eio);
      lingua.alvo = null;
    }

    /* --- comportamentos (fora, sentado na pedra) --- */
    function* olharEmVolta() {
      const alvos = [() => [lib.x, lib.y], () => [330, 170], () => [PAD.cx, PAD.cy], () => caracolPos(), () => [1320, 280], () => [FLOR.x, FLOR.y - 30], () => [900, 110], () => [alf.x, alf.y]];
      for (let i = 0; i < 3; i++) {
        const a = escolhe(alvos), b = Math.random() < .55 ? a : escolhe(alvos);
        olhar.E.foco = a; olhar.D.foco = b;
        yield* tw({ hY: limita((a()[0] - P.x) / 40, -12, 12), pupila: .6 }, 320);
        yield* espera(aleat(700, 1300));
      }
      focar(null);
      yield* tw({ hY: 0, pupila: ROSTO.pupila }, 320);
    }
    function* saltinhoVirar() {
      const hA = REPOUSO.h + escolhe([-64, -50, 40]);
      yield* salto({ x: REPOUSO.x + (hA < REPOUSO.h ? -10 : 10), y: REPOUSO.y + 2, h: hA, alt: 32, ms: 320, forca: .32, prep: 130, pose: SENTADO });
      focar(() => [P.x + Math.sin(P.h * RAD) * 520, P.y - 140]);
      yield* tw({ pupila: .6 }, 200);
      yield* espera(aleat(900, 1500));
      focar(null);
      yield* salto({ x: REPOUSO.x, y: REPOUSO.y, h: REPOUSO.h, alt: 32, ms: 320, forca: .32, prep: 130, pose: SENTADO });
      yield* tw({ pupila: ROSTO.pupila }, 200);
    }
    function* limparOlho() {
      const [L] = escolhe(LADOS), k = 'm' + L, S0 = SENTADO;
      yield* juntos(tw({ [k + 'f']: 66, [k + 'u']: 150, [k + 's']: 72, [k + 'a']: 78, cP: S0.cP - 4, hP: S0.hP + 7, hY: L === 'E' ? 5 : -5 }, 380, eio), tw({ ['ab' + L]: .05, afunda: .3 }, 300));
      for (let i = 0; i < 3; i++) {
        yield* tw({ [k + 'u']: 170, [k + 'f']: 56 }, 160, eseno);
        yield* tw({ [k + 'u']: 148, [k + 'f']: 72 }, 160, eseno);
      }
      yield* juntos(tw({ [k + 'f']: S0[k + 'f'], [k + 'u']: 34, [k + 's']: S0[k + 's'], [k + 'a']: 0, cP: S0.cP, hP: S0.hP, hY: 0 }, 330, eio), tw({ ['ab' + L]: 1, afunda: 0 }, 300));
      yield* tw({ [k + 'u']: S0[k + 'u'] }, 120, esai);
      pisca.t = 0; pisca.quais = L;
    }
    function* esticarPerna() {
      const [L] = escolhe(LADOS), c = 'c' + L, d = 'd' + L, S0 = SENTADO;
      yield* tw({ cP: S0.cP - 6, cF: S0.cF + 6, [c + 'u']: 30, [d + 'u']: 26 }, 200, esai);
      yield* juntos(tw({ [c + 'f']: -214, [c + 'u']: 26, [c + 's']: 112, [d + 'f']: -306, [d + 'u']: 22, [d + 's']: 108 }, 380, eio), tw({ abE: .55, abD: .55, feliz: .3 }, 380));
      yield* durante(700, u => { P[d + 'u'] = 22 + 6 * Math.sin(u * PI * 8) * sino(u); P[c + 'f'] = -214 - 6 * sino(u); });
      yield* juntos(tw({ [c + 'f']: S0[c + 'f'], [c + 'u']: 30, [c + 's']: S0[c + 's'], [d + 'f']: S0[d + 'f'], [d + 'u']: 26, [d + 's']: S0[d + 's'], cP: S0.cP, cF: S0.cF }, 420, eio), tw({ abE: 1, abD: 1, feliz: 0 }, 400));
      yield* tw({ [c + 'u']: S0[c + 'u'], [d + 'u']: S0[d + 'u'] }, 140, esai);
    }
    function* inchar() {
      yield* tw({ incha: 1, papo: .35, olhosEsc: 1.08, cH: SENTADO.cH + 8, pupila: .7 }, 650, eio);
      yield* espera(700);
      yield* durante(520, u => { P.incha = 1 - eseno(u); P.papo = .35 * (1 - u); P.cH = SENTADO.cH + 8 * (1 - u); P.hY = 4 * Math.sin(u * PI * 6) * (1 - u); });
      yield* tw({ feliz: .55, olhosEsc: 1, pupila: ROSTO.pupila }, 250);
      yield* espera(400);
      yield* tw({ feliz: 0, hY: 0 }, 300);
    }
    function* lamber() {
      if (Math.random() < .55) {                     // lambe o olho com a língua
        const [L] = escolhe(LADOS);
        lingua.alvo = () => [G.olho[L].x, G.olho[L].y + 6];
        lingua.curva = G.olho[L].x < G.linguaBase[0] ? -.9 : .9; lingua.onda = .4;
        yield* tw({ boca: .4 }, 90);
        yield* juntos(tw({ lingua: 1 }, 190, esai), tw({ ['ab' + L]: 0, afunda: .2 }, 170));
        yield* durante(360, u => { lingua.curva = (G.olho[L].x < G.linguaBase[0] ? -1 : 1) * (.9 + .3 * Math.sin(u * PI * 4)); });
        yield* tw({ lingua: 0 }, 180, eentra);
        yield* juntos(tw({ boca: 0 }, 80), tw({ ['ab' + L]: 1, afunda: 0 }, 240));
      } else {                                       // lambe os beiços de um canto ao outro
        let ang = PI;
        lingua.alvo = () => [G.linguaBase[0] + Math.cos(ang) * 64, G.linguaBase[1] + 14 + Math.sin(ang) * 6];
        lingua.curva = .1; lingua.onda = .2;
        yield* tw({ boca: .35 }, 80);
        yield* tw({ lingua: .6 }, 120, esai);
        yield* durante(620, u => { ang = PI * (1 - eseno(u)); });
        yield* tw({ lingua: 0 }, 130, eentra);
        yield* tw({ boca: 0, feliz: .4 }, 100);
        yield* espera(300); yield* tw({ feliz: 0 }, 250);
      }
      lingua.alvo = null;
    }
    function* encolher() {
      yield* tw({ cH: SENTADO.cH - 20, cP: SENTADO.cP - 10, hP: SENTADO.hP + 8, abE: .45, abD: .45, respA: .6, respF: .3 }, 700, eio);
      yield* espera(aleat(1200, 2000));
      yield* tw({ abE: .1, abD: .1 }, 400, eseno); yield* espera(300); yield* tw({ abE: .5, abD: .5 }, 400, eseno);
      yield* espera(500);
      yield* tw({ cH: SENTADO.cH, cP: SENTADO.cP, hP: SENTADO.hP, abE: 1, abD: 1, respA: 1, respF: .42 }, 600, eio);
    }
    function* engolirAr() {
      for (let i = 0; i < 2; i++) { yield* tw({ papo: .45 }, 220, esai); yield* tw({ papo: .05 }, 260, eio); }
      yield* juntos(tw({ afunda: .8, abE: .2, abD: .2 }, 160), tw({ papo: 0 }, 160));
      yield* tw({ afunda: 0, abE: 1, abD: 1 }, 260);
    }
    function* apanharMosca() { if (!faixas.has('evento')) iniciarEvento('mosca'); yield* espera(50); }
    const COMPORTAMENTOS = { olharEmVolta, saltinhoVirar, limparOlho, esticarPerna, inchar, lamber, encolher, engolirAr, apanharMosca };
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

    /* --- língua à mosca: antecipação, boca abre, língua dispara, a mosca cola-se, volta, e engole com os olhos --- */
    function* linguada(alvo, aoApanhar) {
      const b = baseP();
      lingua.alvo = alvo; lingua.curva = (alvo()[0] < G.linguaBase[0] ? -1 : 1) * .25; lingua.onda = 1;
      focar(alvo);
      yield* tw({ cP: b.cP - 6, cH: b.cH - 6, pupila: .98, olhosEsc: 1.07 }, 150, eio);
      yield* tw({ boca: .9 }, 50, esai);
      yield* tw({ lingua: 1.06 }, 85, esai);
      if (aoApanhar) aoApanhar();
      yield* tw({ lingua: 1 }, 45);
      yield* espera(40);
      yield* durante(170, u => { P.lingua = 1 - eentra(u); lingua.onda = 1 - u; });
      P.lingua = 0; lingua.alvo = null;
      yield* tw({ boca: 0 }, 70);
      yield* juntos(tw({ afunda: 1.1, abE: .08, abD: .08, papo: .3 }, 160, esai), tw({ cP: b.cP, cH: b.cH }, 300));
      yield* espera(200);
      yield* tw({ afunda: 0, abE: 1, abD: 1, papo: 0, feliz: .65, sorriso: 1 }, 280, eio);
      focar(null);
      yield* espera(250);
      let ang = PI;                                     // lambe os beiços, satisfeito
      lingua.alvo = () => [G.linguaBase[0] + Math.cos(ang) * 58, G.linguaBase[1] + 12 + Math.sin(ang) * 5]; lingua.curva = .1; lingua.onda = .2;
      yield* tw({ boca: .3 }, 70); yield* tw({ lingua: .55 }, 100, esai);
      yield* durante(420, u => { ang = PI * (1 - eseno(u)); });
      yield* tw({ lingua: 0 }, 110, eentra); lingua.alvo = null;
      yield* tw({ boca: 0, feliz: 0, sorriso: ROSTO.sorriso, pupila: ROSTO.pupila, olhosEsc: 1 }, 420);
    }

    /* --- o sapo vê um acontecimento --- */
    function* observar(ev) {
      reagindo = false;
      focar(ev.pos);
      yield* tw({ pupila: .85, olhosEsc: 1.05, abE: 1, abD: 1, feliz: 0, boca: 0 }, 220, esai);
      let t = 0, tentou = false;
      while (ev.ativo() && t < 12000) {
        const dt = yield; t += dt;
        const p = ev.pos(), dx = p[0] - (G ? G.cab[0] : P.x);
        P.hY += (limita(dx / 30, -14, 14) - P.hY) * (1 - Math.exp(-dt / 300));
        if (ev.tipo === 'mosca' && ev.pronta && !tentou && ev.tPronta > aleat(350, 700)) { tentou = true; yield* linguada(ev.pos, () => { ev.preso = true; }); }
      }
      focar(null);
      yield* tw({ hY: 0, pupila: ROSTO.pupila, olhosEsc: 1 }, 400);
    }

    /* --- reações ao toque: olhos enormes, saltinho, sorriso grande e papo inchado (em menos de 100 ms) --- */
    function* reacao(dentro) {
      reagindo = true;
      const b = baseP();
      const y0 = P.y, yc = P.chao == null ? P.y : P.chao, s0 = P.sobe, alt = dentro ? 30 : 44;
      if (P.chao != null) P.chao = null;
      const rosto = tw({ olhosEsc: 1.16, pupila: .95, sorriso: 1, boca: .5, papo: .45, feliz: 0, abE: 1, abD: 1, afunda: 0, lingua: 0, incha: 0 }, 90, esai);
      const corpo = (function* () {
        if (s0 > -4 && Math.abs(y0 - yc) < 3) yield* tw({ sq: .1, cH: b.cH - 8 }, 70, esai);      // antecipação (só se estiver no chão)
        if (dentro) { pad.v += 70; }
        const ini = copia(), voo = mistura(b, VOO, .22);
        yield* durante(320, u => {
          P.sobe = lerp(s0, 0, u) - alt * 4 * u * (1 - u);
          P.y = lerp(y0, yc, u);
          if (u < .3) aplicaPose(ini, voo, esai(u / .3)); else aplicaPose(voo, b, eseno((u - .3) / .7));
          P.sq = -.08 * sino(u);
        });
        P.sobe = 0; P.y = yc;
        if (dentro) { pad.v += 110; onda(PAD.cx, PAD.cy + 4, PAD.rx + 4, PAD.rx + 70, 900, .6); }
        yield* tw({ sq: .13, cH: b.cH - 7 }, 70, esai);
        yield* tw({ sq: 0, cH: b.cH }, 170, eio);
      })();
      yield* juntos(rosto, corpo);
      lingua.alvo = null;
      yield* juntos(tw({ feliz: .75, olhosEsc: 1.06, papo: .1, boca: 0 }, 200), durante(520, u => { P.hY = 10 * Math.sin(u * PI * 3) * (1 - u); }));
      yield* espera(200);
      reagindo = false;
      yield* tw(Object.assign({}, ROSTO, { hY: 0, sorriso: dentro ? 1 : ROSTO.sorriso, feliz: dentro ? .35 : 0 }), 450);
    }

    /* --- no nenúfar: respira, sobe e desce com a água, pisca, os olhos passeiam, apanha moscas --- */
    function* cicloDentro() {
      for (;;) {
        yield* espera(aleat(1600, 2800));
        const r = Math.random();
        if (r < .3 && moscasDentro < 1 && !faixas.has('evento')) { moscasDentro++; iniciarEvento('mosca'); yield* espera(100); continue; }
        if (r < .5) {                                     // cada olho para seu lado
          olhar.E.foco = () => [PAD.cx - 500, 300]; olhar.D.foco = () => [PAD.cx + 400, 250];
          yield* espera(aleat(800, 1200));
          olhar.E.foco = () => [lib.x, lib.y]; olhar.D.foco = () => [lib.x, lib.y];
          yield* espera(aleat(700, 1000)); focar(null);
        } else if (r < .7) {                              // enche o papo (sem som)
          for (let i = 0; i < 2; i++) { yield* tw({ papo: .5 }, 240, esai); yield* tw({ papo: .05 }, 280, eio); }
          yield* tw({ papo: 0 }, 100);
        } else if (r < .86) {                             // piscar lento e contente
          yield* tw({ abE: .15, abD: .15, feliz: .6 }, 420, eseno); yield* espera(350); yield* tw({ abE: 1, abD: 1, feliz: .35 }, 420, eseno);
        } else {                                          // balança o peso de um lado para o outro (o nenúfar mexe)
          pad.va += 6;
          yield* durante(900, u => { P.hY = 8 * Math.sin(u * PI * 2); P.cP = ORGULHO.cP - 3 * sino(u); });
          P.hY = 0;
        }
      }
    }

    /* --- ida ao nenúfar: vira-se e salta para a beira da pedra, agacha, grande salto em arco, aterra (o nenúfar afunda,
           faz ondas e salpica), vira-se para nós com um saltinho e fica sentado todo vaidoso --- */
    function* idaAoNenufar() {
      modo = 'indo'; reagindo = false; moscasDentro = 0;
      yield* arrumar(140);
      focar(() => [PAD.cx, PAD.cy - 20]);
      yield* tw({ pupila: .8, olhosEsc: 1.05, hY: 6 }, 110, esai);
      yield* salto({ x: BORDA.x, y: BORDA.y, h: 80, alt: 44, ms: 380, forca: .45, prep: 110, pose: SENTADO });
      yield* tw(Object.assign(agachar(SENTADO, 1.15), { sq: .12, hY: 0 }), 230, eio);
      yield* salto({ x: NO_PAD.x, y: NO_PAD.y, h: 72, alt: 178, ms: 630, forca: 1, prep: 0, pose: SENTADO, sombraOp: .35,
        aoDescolar: () => { moverPara('voo'); },
        aoAterrar: () => {
          moverPara('nenufar'); noPad = true; pad.off = 0; pad.dip = 0; pad.v += 240; pad.va += 9;
          onda(PAD.cx, PAD.cy + 4, PAD.rx + 2, PAD.rx + 150, 1500, .95); onda(PAD.cx, PAD.cy + 4, PAD.rx, PAD.rx + 90, 1200, .7, 260); onda(PAD.cx, PAD.cy + 4, PAD.rx, PAD.rx + 50, 900, .5, 560);
          salpicar(PAD.cx - PAD.rx * .85, PAD.cy + 10, 5, .8, 30); salpicar(PAD.cx + PAD.rx * .8, PAD.cy + 18, 5, .8, 30); salpicar(NO_PAD.x, NO_PAD.y + 10, 4, .55, 90);
        } });
      focar(null);
      yield* salto({ x: NO_PAD.x + 6, y: NO_PAD.y, h: -12, alt: 26, ms: 340, forca: .3, prep: 100, pose: ORGULHO, aoAterrar: () => { pad.v += 80; onda(PAD.cx, PAD.cy + 4, PAD.rx + 2, PAD.rx + 60, 900, .5); } });
      yield* tw({ feliz: .45, sorriso: 1, pupila: ROSTO.pupila, olhosEsc: 1 }, 200);
      modo = 'dentro';
    }
    /* --- volta: vira-se para a margem, salta de volta para a pedra (o nenúfar afunda com o impulso) e salta para o sítio --- */
    function* voltaDoNenufar() {
      modo = 'voltando'; reagindo = false;
      yield* arrumar(120);
      focar(() => [BORDA.x - 30, BORDA.y - 40]);
      yield* salto({ x: NO_PAD.x - 4, y: NO_PAD.y, h: -78, alt: 22, ms: 270, forca: .3, prep: 80, pose: ORGULHO, aoAterrar: () => { pad.v += 70; } });
      yield* tw(Object.assign(agachar(ORGULHO, 1.1), { sq: .1, feliz: 0 }), 180, eio);
      yield* salto({ x: BORDA.x, y: BORDA.y, h: -82, alt: 150, ms: 510, forca: 1, prep: 0, pose: SENTADO, sombraOp: .35,
        aoDescolar: () => {
          P.y += pad.off; noPad = false; moverPara('voo'); pad.v += 210; pad.va -= 7;
          onda(PAD.cx, PAD.cy + 4, PAD.rx + 2, PAD.rx + 120, 1300, .85); onda(PAD.cx, PAD.cy + 4, PAD.rx, PAD.rx + 70, 1000, .6, 250);
          salpicar(PAD.cx - PAD.rx * .7, PAD.cy + 16, 5, .7, 40); salpicar(PAD.cx + PAD.rx * .75, PAD.cy + 20, 4, .6, 30);
        },
        aoAterrar: () => { moverPara('pedra'); } });
      yield* salto({ x: REPOUSO.x, y: REPOUSO.y, h: REPOUSO.h, alt: 34, ms: 350, forca: .4, prep: 80, pose: SENTADO });
      focar(null);
      yield* tw(Object.assign({}, ROSTO), 200);
      modo = 'fora';
    }

    /* --- som: «croac». Por sílaba o papo enche-se numa bolha grande e translúcida, a boca fica fechada, o corpo inclina-se --- */
    function* coaxar(ms) {
      yield* durante(ms, u => {
        let k;
        if (u < .26) k = esai(u / .26); else if (u < .74) k = 1 + .06 * Math.sin((u - .26) / .48 * PI * 4); else k = 1 - eseno((u - .74) / .26);
        P.somK = k * 1.02; P.somLean = Math.min(1, k);
      });
      P.somK = 0; P.somLean = 0;
    }
    function* coaxarSilabas(silabas) {
      let t = 0;
      for (const [a, d] of silabas) {
        if (a > t) yield* espera((a - t) * 1000);
        yield* coaxar(limita(d * 1000, 180, 2000));
        t = a + d;
      }
    }
    function* coaxarMs(ms) {                       // som dos pais (sem sílabas medidas): distribui os «croacs» pelo tempo
      const nC = limita(Math.round(ms / 600), 1, 4), per = ms / nC;
      for (let i = 0; i < nC; i++) { yield* coaxar(per * .78); yield* espera(per * .22); }
    }

    /* --- cenário vivo --- */
    const lib = { x: 1240, y: 400, de: [1240, 400], para: [1240, 400], t: 0, dur: 1, pairar: 1500, voar: false, esc: 1, escAlvo: 1, by: 400 };
    const alf = { x: 1150, y: 622, de: 1150, para: 1150, t: 0, dur: 1, espera: 1500, dir: -1 };
    const car = { x: 70, dir: 1, esc: 1 };
    const caracolPos = () => { const a = 3.2 * RAD; return [118 + car.x * Math.cos(a) + 28 * Math.sin(a), 550 + car.x * Math.sin(a) - 28 * Math.cos(a) - 12]; };
    function animarCena(dt) {
      const t = tempo / 1000;
      NUV.forEach((c, i) => {
        const x = ((c.x + 200 + t * (4 + i * 1.6) * calma) % 2000) - 200;
        poe(R.nuvens[i], `translate(${n(x)},${c.y}) scale(${c.k})`);
        poe(R.refl[i], `translate(${n(x)},${n(HORIZ + (HORIZ - c.y) * .62)}) scale(${c.k},${n3(-c.k * .45)})`);
      });
      R.aves.forEach((a, i) => { const x = ((t * (16 + i * 3) + i * 140) % 2400) - 300, y = 190 + i * 14 + 6 * Math.sin(t * .7 + i); poe(a, `translate(${n(x)},${n(y)}) scale(1,${n3(.55 + .45 * Math.abs(Math.sin(t * 4 + i)))})`); });
      poe(R.copaE, `rotate(${n3(.6 * Math.sin(t * .6) * calma)},136,300)`);
      poe(R.ramo, `rotate(${n3(.8 * Math.sin(t * .5 + 1) * calma)},1640,-30)`);
      R.fios.forEach((f, i) => { const x0 = lerp(1600, 1340, i / 11), y0 = lerp(-12, 92, Math.pow(i / 11, 1.2)); poe(f, `translate(${n(x0)},${n(y0)}) rotate(${n3(3 * Math.sin(t * .8 + i * .7) * calma)})`); });
      R.juncos.forEach((g, i) => poe(g, `rotate(${n3((1.2 + (i % 4) * .5) * Math.sin(t * (.7 + (i % 3) * .15) + i * 1.3) * calma)})`));
      atr(R.raios, 'opacity', n3(.55 + .25 * Math.sin(t * .35)));
      R.brilhos.forEach((b, i) => poe(b, `translate(${n(6 * Math.sin(t * (.5 + (i % 5) * .1) + i) * calma)},0)`));
      R.cint.forEach((c, i) => { const f = cintFase[i]; atr(c, 'opacity', n3(Math.pow(Math.max(0, Math.sin(t * f.f + f.ph)), 12))); });
      R.pq.forEach((g, i) => poe(g, `translate(0,${n(1.3 * Math.sin(t * .9 + i * 1.4) * calma)})`));
      poe(R.lambe, `translate(826,742) scale(${n3(1 + .25 * Math.sin(t * 1.3))},1) translate(-826,-742)`);
      // libelinha: voa aos repelões e paira
      lib.t += dt;
      if (!lib.voar) {
        if (lib.t > lib.pairar) { lib.voar = true; lib.t = 0; lib.de = [lib.x, lib.by]; lib.para = [aleat(720, 1460), aleat(300, 540)]; lib.dur = aleat(600, 1100); lib.escAlvo = lib.para[0] < lib.x ? -1 : 1; }
        lib.y = lib.by + 4 * Math.sin(tempo / 160);
      } else {
        const u = Math.min(1, lib.t / lib.dur), e = eio(u);
        lib.x = lerp(lib.de[0], lib.para[0], e); lib.by = lerp(lib.de[1], lib.para[1], e) - 34 * sino(u); lib.y = lib.by;
        if (u >= 1) { lib.voar = false; lib.t = 0; lib.pairar = aleat(800, 2400); }
      }
      lib.esc += (lib.escAlvo - lib.esc) * (1 - Math.exp(-dt / 60));
      poe(R.lib, `translate(${n(lib.x)},${n(lib.y)}) scale(${n3(lib.esc)},1) rotate(${n(lib.voar ? -6 : 2 * Math.sin(tempo / 300))})`);
      R.asas.forEach((a, i) => atr(a, 'ry', n(1.4 + 4.6 * Math.abs(Math.sin(tempo * .11 + i * 1.3)))));
      // alfaiate: desliza na água aos impulsos
      if (alf.espera > 0) {
        alf.espera -= dt;
        if (alf.espera <= 0) {
          alf.de = alf.x; let p = alf.x + alf.dir * aleat(50, 110);
          if (p < 860 || p > 1340) { alf.dir *= -1; p = alf.x + alf.dir * aleat(50, 110); }
          alf.para = p; alf.t = 0; alf.dur = aleat(600, 900);
          onda(alf.x - 22, alf.y + 5, 2, 16, 600, .5); onda(alf.x + 22, alf.y + 6, 2, 16, 600, .5);
        }
      } else {
        alf.t += dt; const u = Math.min(1, alf.t / alf.dur);
        alf.x = lerp(alf.de, alf.para, esai(u)); alf.y = 622 + 6 * Math.sin(alf.x / 90);
        if (u >= 1) alf.espera = aleat(900, 2600);
      }
      poe(R.alf, `translate(${n(alf.x)},${n(alf.y)})`);
      // caracol no tronco caído (muito devagar)
      car.x += car.dir * 2.4 * dt / 1000 * calma;
      if (car.x > 280) car.dir = -1; if (car.x < 40) car.dir = 1;
      car.esc += (car.dir - car.esc) * (1 - Math.exp(-dt / 500));
      poe(R.caracol, `translate(${n(car.x)},-27) scale(${n3(car.esc * .95)},.95)`);
      poe(R.carAnt, `rotate(${n(5 * Math.sin(tempo / 500))},18,-6)`);
    }

    /* --- acontecimentos raros (a cada 15–40 s): mosca (o sapo apanha-a com a língua), peixe a saltar, folha a cair --- */
    const eventos = { prox: aleat(9000, 14000), ultimo: null };
    function iniciarEvento(tipo) {
      const ev = { tipo, x: -100, y: -100, vivo: true, pronta: false, tPronta: 0, preso: false };
      ev.pos = () => [ev.x, ev.y];
      ev.ativo = () => ev.vivo;
      const gen = tipo === 'mosca' ? evMosca(ev) : tipo === 'peixe' ? evPeixe(ev) : evFolha(ev);
      lancar('evento', gen, () => { ev.vivo = false; });
      if (modo === 'fora' && !reagindo) lancar('corpo', observar(ev), () => lancar('corpo', cicloFora()));
      else if (modo === 'dentro') lancar('corpo', observar(ev), () => lancar('corpo', cicloDentro()));
      return ev;
    }
    function atualizarEventos(dt) {
      if (faixas.has('evento') || modo === 'indo' || modo === 'voltando') return;
      eventos.prox -= dt;
      if (eventos.prox > 0) return;
      eventos.prox = aleat(15000, 40000);
      let tipo; do tipo = escolhe(['mosca', 'peixe', 'folha', 'mosca']); while (tipo === eventos.ultimo);
      eventos.ultimo = tipo;
      iniciarEvento(tipo);
    }
    function* evMosca(ev) {
      const g = R.mosca;
      const frente = () => G && Math.abs(G.F[0]) > .4 ? Math.sign(G.F[0]) : (G && G.linguaBase[0] > 800 ? -1 : 1);   // do lado para onde o sapo olha (ou para o meio do ecrã)
      const sitio = () => { const b = G ? G.linguaBase : [P.x, P.y - 150]; return [b[0] + frente() * 175, b[1] - 115]; };
      const de = Math.random() < .5 ? [-80, 160] : [1680, 200];
      const s0 = sitio();
      const pts = [de, [lerp(de[0], s0[0], .35), 120], [lerp(de[0], s0[0], .7), s0[1] + 90], [s0[0] - frente() * 90, s0[1] - 70], s0];
      atr(g, 'display', 'inline');
      let ax = 1;
      const poeM = (x, y, tt) => {
        ax = x < ev.x ? -1 : 1; ev.x = x; ev.y = y;
        poe(g, `translate(${n(x)},${n(y)}) scale(${ax},1) rotate(${n(6 * Math.sin(tt * .02))})`);
        const sc = n3(.3 + .7 * Math.abs(Math.sin(tt * .9)));
        R.asasM.forEach(a => atr(a, 'ry', n(sc * 3.6)));
      };
      yield* durante(3200, (u, tt) => { const [x, y] = catmull(pts, eseno(u) * .6 + u * .4); poeM(x + 8 * Math.sin(tt * .021), y + 7 * Math.cos(tt * .027), tt); });
      ev.pronta = true;
      let t = 0;
      while (!ev.preso && t < 4200) {                  // paira perto da boca do sapo, aos ziguezagues
        const dt = yield; t += dt; ev.tPronta = t;
        const s = sitio();
        poeM(s[0] + 26 * Math.sin(t * .006) + 8 * Math.sin(t * .031), s[1] + 18 * Math.sin(t * .0083 + 1) + 6 * Math.cos(t * .027), t);
      }
      if (ev.preso) {                                   // colada à língua até desaparecer na boca
        while (P.lingua > .14 && lingua.alvo) { yield; poe(g, `translate(${n(lingua.ponta[0])},${n(lingua.ponta[1])}) rotate(30) scale(.9)`); ev.x = lingua.ponta[0]; ev.y = lingua.ponta[1]; }
        atr(g, 'display', 'none');
        yield* espera(1500);
        return;
      }
      const x0 = ev.x, y0 = ev.y, para = [x0 < 800 ? -120 : 1720, 120];
      yield* durante(1600, (u, tt) => poeM(lerp(x0, para[0], eentra(u)), lerp(y0, para[1], u) + 20 * Math.sin(tt * .02), tt));
      atr(g, 'display', 'none');
    }
    function* evPeixe(ev) {
      const g = R.peixe, x0 = aleat(1240, 1380), y0 = aleat(596, 632), dx = -aleat(110, 150), alt = aleat(70, 100);
      atr(R.clipPeixe, 'height', n(y0 + 1));
      ev.x = x0; ev.y = y0;
      onda(x0, y0, 3, 26, 700, .7);
      yield* espera(500);
      onda(x0, y0, 4, 46, 1000, .9); salpicar(x0, y0, 6, .7, 14);
      atr(g, 'display', 'inline');
      yield* durante(950, u => {
        const x = x0 + dx * u, y = y0 + 34 - (alt + 34) * 4 * u * (1 - u) * 1.0, vx = dx, vy = -(alt + 34) * 4 * (1 - 2 * u);
        ev.x = x; ev.y = y;
        poe(g, `translate(${n(x)},${n(y)}) scale(-1,1) rotate(${n(Math.atan2(vy, -vx) / RAD)}) rotate(${n(8 * Math.sin(u * PI * 6))})`);
      });
      atr(g, 'display', 'none');
      onda(x0 + dx, y0 + 3, 4, 56, 1100, .9); salpicar(x0 + dx, y0, 9, .85, 16);
      yield* espera(1400);
    }
    function* evFolha(ev) {
      const g = R.folha, x0 = aleat(1380, 1480), y0 = 150, x1 = aleat(880, 1160), y1 = aleat(560, 612);
      atr(g, 'display', 'inline'); atr(g, 'opacity', '1');
      yield* durante(5200, u => {
        const x = lerp(x0, x1, u) + 46 * Math.sin(u * PI * 3), y = lerp(y0, y1, eseno(u) * .3 + u * .7);
        ev.x = x; ev.y = y;
        poe(g, `translate(${n(x)},${n(y)}) rotate(${n(50 * Math.sin(u * PI * 3.5))}) scale(${n3(.4 + .6 * Math.abs(Math.cos(u * PI * 3)))},1)`);
      });
      onda(x1, y1 + 4, 3, 40, 1200, .8);
      yield* durante(3200, u => { ev.x = x1 - 30 * u; ev.y = y1 + 2 * Math.sin(u * 6); poe(g, `translate(${n(ev.x)},${n(ev.y)}) rotate(70) scale(1,.45)`); atr(g, 'opacity', n3(1 - eentra(u))); });
      atr(g, 'display', 'none');
    }

    /* --- relógio único --- */
    let erroMostrado = false;
    function passo(dt) {
      if (!vivo) return;
      try {
        dt = Math.min(dt, 50);
        tempo += dt; dtUlt = dt;
        fase.resp += dt / 1000 * 2 * PI * P.respF;
        fase.papo += dt / 1000 * 2 * PI * 2.3;
        atualizarPiscar(dt);
        atualizarOlharLivre(dt);
        for (const nome of Array.from(faixas.keys())) avancar(nome, dt);
        atualizarPad(dt);
        atualizarEventos(dt);
        animarCena(dt);
        desenhar();
        atualizarOndas(dt);
        atualizarGotas(dt);
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    lancar('corpo', cicloFora());
    atualizarPad(0); animarCena(0); desenhar();

    return {
      animal: R.sapo,
      habitat: R.habitat,
      reagir() {
        if (!vivo) return;
        if (modo === 'fora') lancar('corpo', reacao(false), () => { reagindo = false; lancar('corpo', cicloFora()); });
        else if (modo === 'dentro') lancar('corpo', reacao(true), () => { reagindo = false; lancar('corpo', cicloDentro()); });
        else { P.olhosEsc = 1.1; }
      },
      fazerSom(ms, silabas) {         // silabas = [[início s, duração s], …] medidas no som da app (ferramentas/limpar-voz.js)
        if (!vivo) return;
        if (Array.isArray(silabas) && silabas.length) lancar('boca', coaxarSilabas(silabas), () => { P.somK = 0; P.somLean = 0; });
        else lancar('boca', coaxarMs(limita(ms || 900, 300, 3500)), () => { P.somK = 0; P.somLean = 0; });
      },
      irAoHabitat() {
        return new Promise(res => {
          if (!vivo || modo !== 'fora') { res(); return; }
          lancar('corpo', idaAoNenufar(), () => { res(); lancar('corpo', cicloDentro()); });
        });
      },
      voltar() {
        return new Promise(res => {
          if (!vivo || modo !== 'dentro') { res(); return; }
          lancar('corpo', voltaDoNenufar(), () => { res(); lancar('corpo', cicloFora()); });
        });
      },
      destruir() {
        vivo = false;
        faixas.clear();
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola (modo de desenvolvimento)
      _teste: { P, pad, lingua, modo: () => modo, G: () => G, evento: iniciarEvento, desenhar, piscar: () => { pisca.t = 0; pisca.f = -1; },
        comportamento: nome => lancar('corpo', COMPORTAMENTOS[nome](), () => lancar('corpo', cicloFora())),
        parar: () => lancar('corpo', (function* () { for (;;) yield; })()) }
    };
  }

  return { icone: iconeSVG(), montar };
})();
