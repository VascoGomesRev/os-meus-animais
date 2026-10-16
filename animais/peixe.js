/* Peixe — «Os Meus Animais». Contrato e regras: REGRAS-ANIMAIS.md.
   Cena: um recife de coral ao sol, debaixo de água. A luz vem de cima à esquerda (superfície a ondular, raios de sol,
   luz cáustica a dançar na areia), água de turquesa a azul-escuro, areia com ondulações, conchas, estrela-do-mar e seixos,
   corais (cérebro, ramificado, leque), algas e sargaços a ondular, bolhas a subir, plâncton, um cardume ao longe.
   Habitat: uma anémona grande em cima de uma rocha, com dezenas de tentáculos moles (camadas: tentáculos de trás → peixe →
   tentáculos da frente). Os tentáculos afastam-se quando o peixe chega e depois envolvem-no.
   O peixe (tipo peixe-palhaço) é um boneco «2,5D»: o corpo são três elipsoides em 3D (cabeça+tronco, traseira e pedúnculo)
   ligados em cadeia e dobrados em onda (a onda vai da cabeça para a cauda); barbatanas planas em 3D (cauda, dorsais, anal,
   peitorais e pélvicas) projetadas a cada quadro; olhos esféricos salientes; faixas brancas desenhadas como tiras na superfície.
   Por isso vira-se de verdade (de lado → de frente → do outro lado), sem espelhar.
   Organização:
     1) utilidades (matemática, vetores, projeção)
     2) geometria do peixe (pose → elipses e caminhos no ecrã)
     3) desenho do peixe (SVG) e ícone do menu
     4) cenário (água, luz, recife, areia, anémona, bichos)
     5) montar(): pose, tarefas no relógio único, nado, comportamentos, acontecimentos, habitat, som */
'use strict';
MODULOS.peixe = (() => {
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

  // câmara: vista ortogonal quase de lado, um pouco de cima (10°), para a onda do corpo se ver também na vertical
  const ELEV = 10 * RAD, cE = Math.cos(ELEV), sE = Math.sin(ELEV);
  const VISTA = [0, sE, cE];
  const ESC = 1.0;
  const p2 = (c, w) => [c.X + w[0] * c.k * c.qx, c.Y - (w[1] * cE - w[2] * sE) * c.k * c.qy];
  const pd = (c, v) => [v[0] * c.k * c.qx, -(v[1] * cE - v[2] * sE) * c.k * c.qy];   // direção projetada
  const prof = w => w[1] * sE + w[2] * cE;
  function elipse(c, centro, eixos) {
    let a = 0, b = 0, d = 0;
    for (const v of eixos) {
      const x = v[0] * c.k * c.qx, y = -(v[1] * cE - v[2] * sE) * c.k * c.qy;
      a += x * x; b += x * y; d += y * y;
    }
    const m = (a + d) / 2, r = Math.sqrt(Math.max(0, (a - d) * (a - d) / 4 + b * b));
    const s = p2(c, centro);
    return { x: s[0], y: s[1], rx: Math.sqrt(m + r), ry: Math.sqrt(Math.max(.01, m - r)), ang: .5 * Math.atan2(2 * b, a - d) / RAD, z: prof(centro) };
  }
  const ref = (o, f, u, s) => ({ o, f, u, s });
  const ponto = (R, a, b, c) => [R.o[0] + R.f[0] * a + R.u[0] * b + R.s[0] * c, R.o[1] + R.f[1] * a + R.u[1] * b + R.s[1] * c, R.o[2] + R.f[2] * a + R.u[2] * b + R.s[2] * c];
  const direcao = (R, a, b, c) => [R.f[0] * a + R.u[0] * b + R.s[0] * c, R.f[1] * a + R.u[1] * b + R.s[1] * c, R.f[2] * a + R.u[2] * b + R.s[2] * c];
  function filho(R, a, b, c, pitch, yaw) {                 // pitch: nariz para cima (graus); yaw: para o lado s
    let f = R.f, u = R.u, s = R.s;
    if (yaw) { const y = yaw * RAD, cy = Math.cos(y), sy = Math.sin(y); const f2 = vs(vk(f, cy), vk(s, sy)); s = vd(vk(s, cy), vk(f, sy)); f = f2; }
    if (pitch) { const p = pitch * RAD, cp = Math.cos(p), sp = Math.sin(p); const f2 = vs(vk(f, cp), vk(u, sp)); u = vd(vk(u, cp), vk(f, sp)); f = f2; }
    return ref(ponto(R, a, b, c), f, u, s);
  }
  function rolar(R, ang) {                                 // rodar à volta do eixo da frente (inclinar de lado)
    if (!ang) return R;
    const a = ang * RAD, ca = Math.cos(a), sa = Math.sin(a);
    return ref(R.o, R.f, vs(vk(R.u, ca), vk(R.s, sa)), vd(vk(R.s, ca), vk(R.u, sa)));
  }
  const elipR = (c, R, centro, ax) => elipse(c, ponto(R, centro[0], centro[1], centro[2]), [vk(R.f, ax[0]), vk(R.u, ax[1]), vk(R.s, ax[2])]);
  // ponto e normal à superfície de um elipsoide (longitude fi a partir da frente, latitude te)
  function superf(R, ce, ax, fi, te) {
    const cf = Math.cos(fi), sf = Math.sin(fi), ct = Math.cos(te), st = Math.sin(te);
    return { P: ponto(R, ce[0] + ax[0] * ct * cf, ce[1] + ax[1] * st, ce[2] + ax[2] * ct * sf), N: vn(direcao(R, ct * cf / ax[0], st / ax[1], ct * sf / ax[2])) };
  }
  // mancha à superfície (elipse achatada no plano tangente) e se está virada para nós
  function sup(c, R, ce, ax, fi, te, r1, r2) {
    const cf = Math.cos(fi), sf = Math.sin(fi), ct = Math.cos(te), st = Math.sin(te);
    const { P, N } = superf(R, ce, ax, fi, te);
    const t1 = vn(direcao(R, -ax[0] * ct * sf, 0, ax[2] * ct * cf));
    const t2 = vn(direcao(R, -ax[0] * st * cf, ax[1] * ct, -ax[2] * st * sf));
    const e = elipse(c, P, [vk(t1, r1), vk(t2, r2 == null ? r1 : r2), vk(N, .01)]);
    e.vis = vp(N, VISTA);
    return e;
  }
  // caminho suave por uma lista de pontos 2D (curvas quadráticas pelos pontos médios)
  function liso(pts, fechar) {
    if (!pts.length) return '';
    if (pts.length < 3) return pts.map((p, i) => (i ? 'L' : 'M') + n(p[0]) + ',' + n(p[1])).join('');
    if (fechar) {
      const m0 = [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2];
      let d = `M${n(m0[0])},${n(m0[1])}`;
      for (let i = 1; i <= pts.length; i++) {
        const a = pts[i % pts.length], b = pts[(i + 1) % pts.length];
        d += `Q${n(a[0])},${n(a[1])} ${n((a[0] + b[0]) / 2)},${n((a[1] + b[1]) / 2)}`;
      }
      return d + 'Z';
    }
    let d = `M${n(pts[0][0])},${n(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
      d += `Q${n(pts[i][0])},${n(pts[i][1])} ${n(m[0])},${n(m[1])}`;
    }
    const u = pts[pts.length - 1];
    return d + `L${n(u[0])},${n(u[1])}`;
  }
  function envolver(p) {                                   // envolver convexo (cadeia monótona)
    p = p.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = [];
    for (const q of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  }
  const poli = pts => pts.length ? 'M' + pts.map(p => n(p[0]) + ',' + n(p[1])).join('L') : '';
  // a luz vem de cima, um pouco da esquerda: deslocamento do brilho dentro de uma elipse rodada
  const LUZ = [-.35, -.94];
  function luzOff(e, f) {
    const a = e.ang * RAD, ca = Math.cos(a), sa = Math.sin(a);
    const lx = LUZ[0] * ca + LUZ[1] * sa, ly = -LUZ[0] * sa + LUZ[1] * ca;
    const ox = lx * f * e.rx, oy = ly * f * e.ry;
    return [ox * ca - oy * sa, ox * sa + oy * ca];
  }
  // os maiores troços seguidos de pontos visíveis ([x, y, vis]) de uma linha
  function trocos(pts, lim) {
    const v = []; let cur = [];
    for (const p of pts) { if (p[2] > lim) cur.push(p); else { if (cur.length > 1) v.push(cur); cur = []; } }
    if (cur.length > 1) v.push(cur);
    return v;
  }

  /* ================= 2) Geometria do peixe ================= */
  const COR = { cont: '#2A1408', laranja: '#FF8A2A', escuro: '#1E140F' };
  const AX_A = [96, 74, 56], AX_B = [56, 50, 38], AX_C = [32, 26, 16];
  const CB = [-36, 0, 0], CC = [-22, 0, 0];
  const RE = 25;                                           // raio do globo do olho
  const LADOS = [['E', 1], ['D', -1]];                     // E = lado s (virado para nós quando nada para a direita)
  // faixas brancas: [segmento, centro x, meia largura, curva para a frente]
  const FAIXAS = [['A', 27, 12, 10], ['A', -48, 15, 13], ['C', -16, 7, 4]];

  function geometria(P, X, Y, k) {
    const c = { X, Y, k, qx: 1 + P.sq * .6, qy: 1 - P.sq };
    const h = P.psi * RAD;
    const F0 = [Math.cos(h), 0, Math.sin(h)], S0 = [-Math.sin(h), 0, Math.cos(h)];
    let A = filho(ref([0, 0, 0], F0, [0, 1, 0], S0), 0, 0, 0, P.pit, P._b0 || 0);
    A = rolar(A, P.rol);
    const resp = P._resp || 0, inf = P.infla || 0;
    const axA = [AX_A[0] * (1 + .006 * resp), AX_A[1] * (1 + .012 * resp + .05 * inf), AX_A[2] * (1 + .02 * resp + .08 * inf)];
    const RB = filho(A, -38, -2, 0, 0, P._b1 || 0);
    const RC = filho(RB, -76, 1, 0, 0, P._b2 || 0);
    const RT = filho(RC, -44, 0, 0, 0, P._b3 || 0);
    const G = { c, A, RB, RC, RT, axA, el: {}, fin: {}, olho: {}, F: A.f, S: A.s };
    G.el.A = elipR(c, A, [0, 0, 0], axA);
    G.el.B = elipR(c, RB, CB, AX_B);
    G.el.C = elipR(c, RC, CC, AX_C);
    const pj = w => p2(c, w);

    // barbatana caudal: leque arredondado com raios; a parte de fora atrasa-se (dobra mais)
    {
      const N = 11, esp = P.leque || 1, fl = Math.tan((P._b4 || 0) * RAD), borda = [], raios = [];
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1), fi = lerp(-64, 64, u) * RAD * esp;
        const r = 70 + 9 * Math.abs(Math.sin(fi)) - 3 * Math.cos(fi * 3);
        const x = -r * Math.cos(fi), y = r * Math.sin(fi) * 1.05;
        const z = -x * fl * Math.pow(r / 75, 2) * .7;
        borda.push(pj(ponto(RT, x, y, z)));
        if (i < N - 1) {                                   // recorte entre raios (orla «franjada»)
          const fm = lerp(-64, 64, (i + .5) / (N - 1)) * RAD * esp, rm = r - 5;
          const xm = -rm * Math.cos(fm), ym = rm * Math.sin(fm) * 1.05;
          borda.push(pj(ponto(RT, xm, ym, -xm * fl * Math.pow(rm / 75, 2) * .7)));
        }
        const b0 = pj(ponto(RT, -4, y * .12, 0)), b1 = pj(ponto(RT, x * .92, y * .92, z * .85));
        raios.push([b0, b1]);
      }
      const base = [pj(ponto(RT, 10, -17, 0)), ...borda, pj(ponto(RT, 10, 17, 0))];
      G.fin.cauda = { d: liso(base, true), raios: raios.map(r => `M${n(r[0][0])},${n(r[0][1])}L${n(r[1][0])},${n(r[1][1])}`).join('') };
    }
    // dorsal da frente (espinhosa) na cabeça/tronco e dorsal mole na traseira; anal por baixo da traseira
    const topoA = x => axA[1] * Math.sqrt(Math.max(0, 1 - (x / axA[0]) * (x / axA[0])));
    const topoB = x => AX_B[1] * Math.sqrt(Math.max(0, 1 - ((x - CB[0]) / AX_B[0]) * ((x - CB[0]) / AX_B[0])));
    const crista = .75 + .35 * (P.crista || 0), ond = P._ondF || 0;
    {
      const pts = [], raios = [];
      const xs = [44, 36, 26, 16, 6, -4, -14, -24, -34, -44, -54, -62];
      pts.push(pj(ponto(A, 50, topoA(50) - 10, 0)));
      xs.forEach((x, i) => {
        const pico = i % 2 === 0, hh = (pico ? 25 : 16) * crista * (1 - Math.pow(Math.abs((x + 6) / 70), 3) * .45) + 2 * Math.sin(ond + i * .7);
        const p = pj(ponto(A, x - 3, topoA(x) - 6 + hh, 0));
        pts.push(p);
        if (pico) raios.push([pj(ponto(A, x + 2, topoA(x) - 8, 0)), p]);
      });
      pts.push(pj(ponto(A, -70, topoA(-70) - 10, 0)));
      for (let x = -66; x <= 50; x += 12) pts.push(pj(ponto(A, x, topoA(x) - 22, 0)));
      G.fin.dorsal1 = { d: poli(pts) + 'Z', raios: raios.map(r => `M${n(r[0][0])},${n(r[0][1])}L${n(r[1][0])},${n(r[1][1])}`).join('') };
    }
    const lobo = (R, x0, x1, base, alt, sinal, nR) => {    // barbatana mole em forma de lóbulo arredondado
      const borda = [], raios = [];
      for (let i = 0; i <= 12; i++) {
        const u = i / 12, x = lerp(x0, x1, u);
        const hh = alt * Math.pow(Math.sin(PI * Math.pow(u, .8)), .75) * crista + 2.5 * Math.sin(ond * 1.3 + u * 4);
        const pb = base(x);
        borda.push(pj(ponto(R, x - hh * .35, pb + sinal * hh, 0)));
        if (i > 0 && i < 12 && i % Math.round(12 / nR) === 0) raios.push([pj(ponto(R, x + 3, pb - sinal * 4, 0)), borda[borda.length - 1]]);
      }
      const ins = [];
      for (let i = 12; i >= 0; i -= 3) { const x = lerp(x0, x1, i / 12); ins.push(pj(ponto(R, x, base(x) - sinal * 14, 0))); }
      return { d: liso(borda.concat(ins), true), raios: raios.map(r => `M${n(r[0][0])},${n(r[0][1])}L${n(r[1][0])},${n(r[1][1])}`).join('') };
    };
    G.fin.dorsal2 = lobo(RB, 6, -78, x => topoB(x) - 5, 40, 1, 5);
    G.fin.anal = lobo(RB, -4, -72, x => -topoB(x) + 5, 34, -1, 4);

    // barbatanas aos pares: peitorais (remam) e pélvicas (debaixo da barriga)
    for (const [L, sg] of LADOS) {
      // peitoral
      const th = (P.pAng + (P.pAmp || 0) * Math.sin(P._pFase + (sg > 0 ? 0 : .5))) * RAD;
      const base = ponto(A, -2, -16, sg * axA[2] * .84);
      let d1 = vs(vk(A.f, -Math.cos(th)), vk(A.s, sg * Math.sin(th)));
      d1 = vn(vs(d1, vk(A.u, -.28)));
      const d2 = vn(vd(A.u, vk(d1, vp(A.u, d1))));
      const tw = (P.pAmp || 0) / 24 * .22 * Math.cos(P._pFase + (sg > 0 ? 0 : .5));
      const borda = [], raios = [];
      const pb = pj(base);
      for (let i = 0; i <= 8; i++) {
        const fi = lerp(-50, 56, i / 8) * RAD, L2 = 38 + 8 * Math.cos(fi * 1.5);
        const dir = vs(vk(d1, Math.cos(fi)), vk(d2, Math.sin(fi)));
        const q = vs(vs(base, vk(dir, L2)), vk(A.s, sg * tw * L2 * Math.sin(fi) * .5));
        const pq = pj(q);
        borda.push(pq);
        if (i % 2 === 0) raios.push(`M${n(pb[0])},${n(pb[1])}L${n(lerp(pb[0], pq[0], .9))},${n(lerp(pb[1], pq[1], .9))}`);
      }
      const r1 = pj(vs(base, vk(d2, -7))), r2 = pj(vs(base, vk(d2, 7)));
      G.fin['peit' + L] = { d: liso([r1, ...borda, r2], true), raios: raios.join(''), z: vp(vk(A.s, sg), VISTA) };
      // pélvica
      const bp = ponto(A, 30, -axA[1] * .82, sg * 12);
      const e1 = vn(vs(vs(vk(A.f, -.75), vk(A.u, -.6)), vk(A.s, sg * .3)));
      const e2 = vn(vx(e1, A.s));
      const pvb = pj(bp), pv = [];
      for (let i = 0; i <= 6; i++) {
        const fi = lerp(-30, 40, i / 6) * RAD, L2 = 36 - 10 * Math.abs(fi - .1);
        pv.push(pj(vs(bp, vk(vs(vk(e1, Math.cos(fi)), vk(e2, Math.sin(fi))), L2 * (1 + .1 * (P.crista || 0))))));
      }
      G.fin['pelv' + L] = { d: liso([pj(vs(bp, vk(A.f, 7))), ...pv, pj(vs(bp, vk(A.f, -7)))], true), raios: `M${n(pvb[0])},${n(pvb[1])}L${n(pv[3][0])},${n(pv[3][1])}`, z: vp(vk(A.s, sg), VISTA) };
    }

    // olhos: globos esféricos meio enterrados na cabeça (uma esfera projeta-se sempre num círculo)
    for (const [L, sg] of LADOS) {
      const s = superf(A, [0, 0, 0], axA, .9 * sg, .33);
      const ce = vs(s.P, vk(s.N, RE * .34));
      const q = pj(ce);
      G.olho[L] = { x: q[0], y: q[1], w: ce, N: s.N, vis: vp(s.N, VISTA) };
    }
    // boca: linha do sorriso (fechada) e anel redondo (aberta), virado um pouco para nós (licença de desenho animado)
    {
      const nariz = ponto(A, axA[0] * .985, -9, 0);
      G.nariz = pj(nariz);
      const Nm = vn(vs(A.f, [0, 0, .62]));
      const e1 = vn(vx(Nm, A.u)), e2 = vn(vx(e1, Nm));
      const r = 3 + 12 * (P.boca || 0), anel = [], anelL = [];
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * 2 * PI;
        anel.push(pj(vs(nariz, vs(vk(e1, Math.cos(a) * r * 1.05), vk(e2, Math.sin(a) * r)))));
        anelL.push(pj(vs(nariz, vs(vk(e1, Math.cos(a) * (r + 5.5) * 1.05), vk(e2, Math.sin(a) * (r + 6.5))))));
      }
      G.bocaAnel = anel; G.bocaLabio = anelL;
      const sorr = [];
      for (let i = 0; i <= 14; i++) {
        const fi = lerp(-.7, .7, i / 14), te = -.15 + (.1 + .14 * (P.sorriso || 0)) * fi * fi * 2;
        const s = superf(A, [0, 0, 0], axA, fi, te);
        const q = pj(s.P);
        sorr.push([q[0], q[1], vp(s.N, VISTA)]);
      }
      G.sorriso = sorr;
    }
    // opérculo (tampa das guelras): arco que respira; bochechas; narinas
    G.guelras = LADOS.map(([, sg]) => {
      const pts = [];
      for (let i = 0; i <= 9; i++) {
        const te = lerp(-.62, .5, i / 9), fi = sg * (1.06 + .2 * Math.cos(te * 2.2) - .06 * (P._guelra || 0) * Math.cos(te * 2));
        const s = superf(A, [0, 0, 0], axA, fi, te), q = pj(s.P);
        pts.push([q[0], q[1], vp(s.N, VISTA)]);
      }
      return pts;
    });
    G.bochechas = LADOS.map(([, sg]) => sup(c, A, [0, 0, 0], axA, sg * 1.1, -.22, 14, 9));
    G.narinas = LADOS.map(([, sg]) => sup(c, A, [0, 0, 0], axA, sg * .5, .2, 2.8, 2.2));
    G.brilhosA = [[.3, .62, 26, 9], [-.5, .66, 20, 7], [-1.1, .62, 14, 5]].map(m => sup(c, A, [0, 0, 0], axA, m[0], m[1], m[2], m[3]));
    // faixas brancas: tiras na superfície entre duas «costuras» curvas; só os quadriláteros virados para nós
    G.faixas = FAIXAS.map(([sgm, x0, w, cv]) => {
      const R = sgm === 'A' ? A : RC, ce = sgm === 'A' ? [0, 0, 0] : CC, ax = sgm === 'A' ? axA : AX_C;
      const K = 22, a1 = [], a2 = [];
      for (let i = 0; i <= K; i++) {
        const t = i / K * 2 * PI, ct = Math.cos(t), st = Math.sin(t);
        for (const [arr, sx] of [[a1, -1], [a2, 1]]) {
          const xs = limita(x0 + sx * w + cv * ct * ct - cv * .4, -ax[0] * .995, ax[0] * .995);
          const q = Math.sqrt(1 - (xs / ax[0]) * (xs / ax[0]));
          const y = ax[1] * q * st, z = ax[2] * q * ct;
          const Pw = ponto(R, ce[0] + xs, ce[1] + y, ce[2] + z), N = vn(direcao(R, xs / (ax[0] * ax[0]), y / (ax[1] * ax[1]), z / (ax[2] * ax[2])));
          const s = pj(Pw);
          arr.push([s[0], s[1], vp(N, VISTA)]);
        }
      }
      let d = '';
      for (let i = 0; i < K; i++) {
        if (a1[i][2] + a1[i + 1][2] + a2[i][2] + a2[i + 1][2] <= -.02) continue;
        d += `M${n(a1[i][0])},${n(a1[i][1])}L${n(a1[i + 1][0])},${n(a1[i + 1][1])}L${n(a2[i + 1][0])},${n(a2[i + 1][1])}L${n(a2[i][0])},${n(a2[i][1])}Z`;
      }
      const bordas = trocos(a1, -.01).concat(trocos(a2, -.01)).map(t => liso(t)).join('');
      return { d, bordas };
    });
    // silhueta do corpo: envolver convexo da cabeça+tronco e da traseira (sem «cintura» entre os dois elipsoides)
    {
      const pts = [];
      const amostra = (e, m) => { const a = e.ang * RAD, ca = Math.cos(a), sa = Math.sin(a);
        for (let i = 0; i < m; i++) { const t = i / m * 2 * PI, x = Math.cos(t) * e.rx, y = Math.sin(t) * e.ry; pts.push([e.x + x * ca - y * sa, e.y + x * sa + y * ca]); } };
      amostra(G.el.A, 36); amostra(G.el.B, 24);
      G.casco = liso(envolver(pts), true);
    }
    return G;
  }

  /* ================= 3) Desenho do peixe ================= */
  const RG = RE * ESC, RI = RG * .7;
  function defsPeixe(p) {
    return `
    <radialGradient id="${p}corpo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FF9C3C"/><stop offset=".6" stop-color="#FF8526"/><stop offset=".88" stop-color="#EE6614"/><stop offset="1" stop-color="#D2500C"/></radialGradient>
    <radialGradient id="${p}luz"><stop offset="0" stop-color="#FFD9A0" stop-opacity=".95"/><stop offset=".5" stop-color="#FFC27A" stop-opacity=".5"/><stop offset="1" stop-color="#FFB060" stop-opacity="0"/></radialGradient>
    <linearGradient id="${p}faixa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F6FAFC"/><stop offset="1" stop-color="#C9D9E6"/></linearGradient>
    <linearGradient id="${p}barb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFA24A"/><stop offset=".6" stop-color="#FF8A2E"/><stop offset="1" stop-color="#F27420"/></linearGradient>
    <linearGradient id="${p}barbP" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB466" stop-opacity=".95"/><stop offset="1" stop-color="#FF8A2E" stop-opacity=".8"/></linearGradient>
    <radialGradient id="${p}esclera" cx=".4" cy=".36" r=".72"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".75" stop-color="#F3F1EC"/><stop offset="1" stop-color="#CFCBC2"/></radialGradient>
    <radialGradient id="${p}iris" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#3A2010"/><stop offset=".55" stop-color="#5E3416"/><stop offset=".85" stop-color="#8A5220"/><stop offset="1" stop-color="#3A1E0A"/></radialGradient>
    <linearGradient id="${p}palp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFA548"/><stop offset=".75" stop-color="#F57B22"/><stop offset="1" stop-color="#DA6214"/></linearGradient>
    <linearGradient id="${p}palpI" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#F07420"/><stop offset="1" stop-color="#FF9A42"/></linearGradient>
    <radialGradient id="${p}bocaInt" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#9A2E28"/><stop offset="1" stop-color="#4A1210"/></radialGradient>
    <clipPath id="${p}clip-globo"><circle r="${n(RG)}"/></clipPath>`;
  }
  const corpoC = (nm, o) => `<circle class="px-${nm}-c" r="1" fill="${COR.escuro}" data-o="${o}"/>`;
  const corpoE = (nm, p) => `<circle class="px-${nm}-e" r="1" fill="url(#${p}corpo)"/><circle class="px-${nm}-l" r="1" fill="url(#${p}luz)"/>`;
  const barbSVG = (nm, p, grad) => `<g class="px-g-${nm}"><path class="px-${nm}" fill="url(#${p}${grad || 'barb'})" stroke="${COR.escuro}" stroke-width="4" stroke-linejoin="round"/>
      <path class="px-${nm}R" fill="none" stroke="#FFD3A0" stroke-width="1.6" stroke-linecap="round" opacity=".7"/></g>`;
  const faixaSVG = (i, p) => `<path class="px-f${i}" fill="url(#${p}faixa)" stroke="#FAFCFD" stroke-width=".8" stroke-linejoin="round"/><path class="px-fb${i}" fill="none" stroke="${COR.escuro}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  function olhoSVG(p, L) {
    let fib = '';
    for (let i = 0; i < 16; i++) { const a = i / 16 * 2 * PI; fib += `M${n(Math.cos(a) * RI * .62)},${n(Math.sin(a) * RI * .62)}L${n(Math.cos(a) * RI * .92)},${n(Math.sin(a) * RI * .92)}`; }
    return `<g class="px-olho${L}"><g class="px-globo${L}">
      <circle r="${n(RG + 3.4)}" fill="${COR.escuro}"/>
      <circle r="${n(RG)}" fill="url(#${p}esclera)"/>
      <g clip-path="url(#${p}clip-globo)">
        <g class="px-iris${L}">
          <circle r="${n(RI)}" fill="url(#${p}iris)"/>
          <path d="${fib}" stroke="#B87A3A" stroke-width="1.2" opacity=".45"/>
          <circle class="px-pupila${L}" r="${n(RI * .6)}" fill="#0E0805"/>
        </g>
        <path d="M${n(-RG - 2)},${n(-RG - 2)}H${n(RG + 2)}V${n(-RG * .3)}Q0,${n(-RG * .7)} ${n(-RG - 2)},${n(-RG * .3)}Z" fill="#5A3010" opacity=".16"/>
        <circle cx="${n(-RG * .3)}" cy="${n(-RG * .34)}" r="${n(RG * .24)}" fill="#FFFFFF"/>
        <circle cx="${n(RG * .02)}" cy="${n(-RG * .52)}" r="${n(RG * .08)}" fill="#FFFFFF" opacity=".9"/>
        <circle cx="${n(RG * .34)}" cy="${n(RG * .3)}" r="${n(RG * .1)}" fill="#FFFFFF" opacity=".7"/>
        <path class="px-palpI${L}" fill="url(#${p}palpI)"/>
        <path class="px-orlaI${L}" fill="none" stroke="${COR.escuro}" stroke-width="2.2" opacity=".75"/>
        <path class="px-palpS${L}" fill="url(#${p}palp)"/>
        <path class="px-orla${L}" fill="none" stroke="${COR.escuro}" stroke-width="3.2" stroke-linecap="round"/>
      </g>
      <circle r="${n(RG + 1.6)}" fill="none" stroke="${COR.escuro}" stroke-width="3.4"/>
    </g></g>`;
  }
  function peixeSVG(p) {
    return `<g class="px-peixe">
      <g class="px-tras">${barbSVG('peitD', p, 'barbP')}${barbSVG('pelvD', p)}${olhoSVG(p, 'D')}</g>
      <g class="px-caudaTras">${barbSVG('cauda', p)}</g>${barbSVG('dorsal2', p)}${barbSVG('dorsal1', p)}${barbSVG('anal', p)}
      ${corpoC('C', 3)}<path class="px-cascoC" fill="none" stroke="${COR.escuro}" stroke-width="7.6" stroke-linejoin="round"/>
      ${corpoE('C', p)}${faixaSVG(2, p)}
      <path class="px-casco" fill="url(#${p}corpo)"/>
      <circle class="px-A-l" r="1" fill="url(#${p}luz)"/>
      <g fill="#FFE2B8">${[0, 1, 2].map(i => `<ellipse class="px-brA${i}" rx="1" ry="1" opacity=".5"/>`).join('')}</g>
      ${LADOS.map(([L]) => `<path class="px-guelra${L}" fill="none" stroke="#B9440E" stroke-width="3.4" stroke-linecap="round"/><path class="px-guelraL${L}" fill="none" stroke="#FFC48A" stroke-width="2" stroke-linecap="round" opacity=".6"/>`).join('')}
      ${faixaSVG(0, p)}${faixaSVG(1, p)}
      <g fill="#FF6F8E">${LADOS.map(([L]) => `<circle class="px-boch${L}" r="1"/>`).join('')}</g>
      <g fill="#5A2208">${LADOS.map(([L]) => `<circle class="px-nar${L}" r="1"/>`).join('')}</g>
      <ellipse class="px-specA" rx="1" ry="1" fill="#FFFFFF" opacity=".55"/>
      <g class="px-boca">
        <path class="px-labio" fill="#FFB27E" stroke="${COR.escuro}" stroke-width="2.6" stroke-linejoin="round"/>
        <path class="px-bocaInt" fill="url(#${p}bocaInt)" stroke="#5A1A10" stroke-width="1.4"/>
        <path class="px-sorriso" fill="none" stroke="${COR.escuro}" stroke-width="3.4" stroke-linecap="round"/>
      </g>
      <g class="px-caudaFrente"></g>
      <g class="px-frente">${barbSVG('pelvE', p)}${barbSVG('peitE', p, 'barbP')}${olhoSVG(p, 'E')}</g>
    </g>`;
  }
  // pálpebras no referencial do globo: c = fecho (0 aberto … 1 fechado), f = olhos contentes (pálpebra de baixo em arco)
  function palpebras(c, f) {
    const r = RG, e = r + 4;
    const yS = lerp(-r * 1.02, r * .5, c), bS = r * (.18 + .5 * Math.sin(PI * Math.min(1, c * 1.1)));
    const cl = Math.max(c * .5, f * .62), yI = lerp(r * 1.06, r * .05, cl), bI = r * (.06 + .72 * f);
    return {
      sup: `M${-e},${-e}L${e},${-e}L${e},${n(yS)}Q0,${n(yS + bS)} ${-e},${n(yS)}Z`,
      orla: c < .02 ? 'M0,0' : `M${n(-r * 1.02)},${n(yS + bS * .04)}Q0,${n(yS + bS)} ${n(r * 1.02)},${n(yS + bS * .04)}`,
      inf: `M${-e},${e}L${e},${e}L${e},${n(yI)}Q0,${n(yI - bI)} ${-e},${n(yI)}Z`,
      orlaI: cl < .03 ? 'M0,0' : `M${n(-r)},${n(yI - bI * .05)}Q0,${n(yI - bI)} ${n(r)},${n(yI - bI * .05)}`
    };
  }

  /* --- ícone do menu: o mesmo modelo, a três quartos, com cores lisas (sem gradientes com id) --- */
  function iconeSVG() {
    const P = { psi: 28, pit: 4, rol: 0, sq: 0, boca: 0, sorriso: 1, crista: .4, leque: 1.05, pAng: 40, pAmp: 0, _pFase: 0, _b0: 0, _b1: 6, _b2: 12, _b3: 14, _b4: 8, _ondF: 0, _resp: 0 };
    const G = geometria(P, 124, 104, .5);
    const t = e => `translate(${n(e.x)},${n(e.y)}) rotate(${n(e.ang)})`;
    const el = (e, f, extra = 0, k = 1, op) => `<ellipse rx="${n(e.rx * k + extra)}" ry="${n(e.ry * k + extra)}" transform="${t(e)}" fill="${f}"${op ? ` opacity="${op}"` : ''}/>`;
    const luz = e => { const [ox, oy] = luzOff(e, .25), [ox2, oy2] = luzOff(e, .48);
      return `<ellipse rx="${n(e.rx * .72)}" ry="${n(e.ry * .72)}" transform="translate(${n(e.x + ox)},${n(e.y + oy)}) rotate(${n(e.ang)})" fill="#FFA448" opacity=".85"/>` +
        `<ellipse rx="${n(e.rx * .38)}" ry="${n(e.ry * .38)}" transform="translate(${n(e.x + ox2)},${n(e.y + oy2)}) rotate(${n(e.ang)})" fill="#FFC88A" opacity=".75"/>`; };
    const barb = (f, cor) => `<path d="${f.d}" fill="${cor || '#FF9A3E'}" stroke="${COR.escuro}" stroke-width="2.2" stroke-linejoin="round"/><path d="${f.raios}" stroke="#FFD3A0" stroke-width="1" opacity=".7" fill="none"/>`;
    const olho = L => {
      const o = G.olho[L], r = RG * .5;
      return `<g transform="translate(${n(o.x)},${n(o.y)})"><circle r="${n(r + 1.8)}" fill="${COR.escuro}"/><circle r="${n(r)}" fill="#FFFFFF"/>
        <circle cx="${L === 'E' ? 2.4 : 1}" cy="1.2" r="${n(r * .7)}" fill="#5E3416"/><circle cx="${L === 'E' ? 2.4 : 1}" cy="1.2" r="${n(r * .44)}" fill="#0E0805"/>
        <circle cx="${n(-r * .3)}" cy="${n(-r * .34)}" r="${n(r * .26)}" fill="#FFF"/><circle cx="${n(r * .34)}" cy="${n(r * .3)}" r="${n(r * .1)}" fill="#FFF" opacity=".8"/>
        <path d="M${n(-r * 1.05)},${n(-r * .55)}Q0,${n(-r * 1.25)} ${n(r * 1.05)},${n(-r * .55)}" fill="none" stroke="${COR.escuro}" stroke-width="1.6"/></g>`;
    };
    const sorr = trocos(G.sorriso, .02).map(tr => `<path d="${liso(tr)}" fill="none" stroke="${COR.escuro}" stroke-width="1.8" stroke-linecap="round"/>`).join('');
    const tent = (x, y, a, l, cor) => { const r = a * RAD, x2 = x + Math.sin(r) * l, y2 = y - Math.cos(r) * l;
      return `<path d="M${n(x)},${n(y)}Q${n(x + Math.sin(r) * l * .5 + 6)},${n(y - Math.cos(r) * l * .5)} ${n(x2)},${n(y2)}" stroke="#7A2550" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M${n(x)},${n(y)}Q${n(x + Math.sin(r) * l * .5 + 6)},${n(y - Math.cos(r) * l * .5)} ${n(x2)},${n(y2)}" stroke="${cor}" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="${n(x2)}" cy="${n(y2)}" r="4.6" fill="#FFD6EA" stroke="#7A2550" stroke-width="1.4"/>`; };
    let tras = '', frente = '';
    for (let i = 0; i < 7; i++) tras += tent(66 + i * 15, 194, -30 + i * 10, 34 + (i % 3) * 6, '#C2558E');
    for (let i = 0; i < 5; i++) frente += tent(76 + i * 17, 202, -24 + i * 12, 22 + (i % 2) * 6, '#E37CB2');
    return `<circle cx="110" cy="110" r="106" fill="#2F9FC8"/>
      <path d="M70,12 L100,6 L150,170 L100,180 Z" fill="#BFF0F4" opacity=".2"/><path d="M128,6 L150,10 L188,150 L160,160 Z" fill="#BFF0F4" opacity=".14"/>
      <path d="M8,150 C40,140 70,148 110,144 C150,140 180,146 212,150 A106,106 0 0 1 8,150 Z" fill="#E9CF8E"/>
      <path d="M40,176 C60,171 90,176 120,172 M120,188 C140,183 160,186 176,184" stroke="#CDAE6A" stroke-width="2" fill="none"/>
      <ellipse cx="110" cy="202" rx="52" ry="12" fill="#7A6A70"/><ellipse cx="110" cy="196" rx="48" ry="9" fill="#B05C8A"/>
      ${tras}
      ${barb(G.fin.peitD, '#FFB466')}${barb(G.fin.pelvD)}${G.olho.D.vis > 0 ? '' : olho('D')}
      ${barb(G.fin.cauda)}${barb(G.fin.dorsal2)}${barb(G.fin.dorsal1)}${barb(G.fin.anal)}
      ${el(G.el.C, COR.escuro, 1.5)}<path d="${G.casco}" fill="none" stroke="${COR.escuro}" stroke-width="3.8"/>
      ${el(G.el.C, '#FF8A2A')}${luz(G.el.C)}<path d="${G.faixas[2].d}" fill="#FFFFFF" stroke="#FFFFFF" stroke-width=".6"/><path d="${G.faixas[2].bordas}" fill="none" stroke="${COR.escuro}" stroke-width="1.8"/>
      <path d="${G.casco}" fill="#FF8A2A"/>${luz(G.el.A)}
      ${G.faixas.slice(0, 2).map(f => `<path d="${f.d}" fill="#FFFFFF" stroke="#FFFFFF" stroke-width=".6"/><path d="${f.bordas}" fill="none" stroke="${COR.escuro}" stroke-width="1.8"/>`).join('')}
      ${G.bochechas.filter(b => b.vis > .1).map(b => el(b, '#FF6F8E', 0, 1, .5)).join('')}
      ${sorr}
      ${barb(G.fin.pelvE)}${barb(G.fin.peitE, '#FFB466')}${olho('E')}${G.olho.D.vis > 0 ? olho('D') : ''}
      ${frente}
      <circle cx="60" cy="60" r="5" fill="none" stroke="#FFFFFF" stroke-width="1.6" opacity=".8"/><circle cx="52" cy="40" r="3.4" fill="none" stroke="#FFFFFF" stroke-width="1.4" opacity=".7"/><circle cx="62" cy="24" r="2.4" fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity=".6"/>`;
  }

  /* ================= 4) Cenário: recife de coral ao sol ================= */
  const AREIA = 706;                                        // linha da areia (mais ou menos)
  const ANEM = { x: 1000, y: 668, rx: 150, ry: 32 };        // disco da anémona (habitat)
  const REPOUSO = { x: 652, y: 468, psi: 26 };               // o peixe a pairar em água aberta
  const DENTRO = { x: 972, y: 592, psi: 146, pit: 10 };      // aninhado na anémona, a espreitar para a esquerda
  // tentáculos: anel, ângulo no disco, comprimento, largura, cor
  const TENT = (() => {
    const r = semente(91), v = [];
    const aneis = [[.97, 18, 96, 18], [.66, 12, 112, 17], [.3, 7, 122, 16]];
    aneis.forEach(([rr, nA, L, w], ai) => {
      for (let i = 0; i < nA; i++) {
        const a = (i + (ai % 2) * .5) / nA * 2 * PI + .12, sa = Math.sin(a), ca = Math.cos(a);
        const tras = sa < -.05 || ai === 2;
        const Lr = (tras ? L + 18 : L * (.85 + .1 * (1 - sa))) * (.85 + r() * .3);
        v.push({
          bx: ANEM.x + ANEM.rx * rr * ca, by: ANEM.y + ANEM.ry * rr * sa, z: sa * rr,
          a0: ca * rr * (tras ? 30 : 48) + (r() - .5) * 16, L: Lr, w: w * (.9 + r() * .2),
          ph: r() * 2 * PI, f: .8 + r() * .5, tras,
          cor: tras ? escolhe(['#B65590', '#A94C86', '#C0629A']) : escolhe(['#E58CBE', '#EC9CC8', '#DE7FB4']),
          ponta: tras ? 'url(#peixe-pontaT)' : 'url(#peixe-ponta)'
        });
      }
    });
    v.sort((a, b) => a.z - b.z);
    return v;
  })();
  const PLANCTO = (() => { const r = semente(5), v = []; for (let i = 0; i < 34; i++) v.push([r() * 1600, 60 + r() * 760, .8 + r() * 1.8, r() * 6.28]); return v; })();
  const CARDUME = (() => { const r = semente(17), v = []; for (let i = 0; i < 18; i++) v.push([(r() - .5) * 170, (r() - .5) * 70, .7 + r() * .45, r() * 6.28]); return v; })();

  function defsCena() {
    return `
    <linearGradient id="peixe-agua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FE6EE"/><stop offset=".22" stop-color="#4CC3D8"/><stop offset=".55" stop-color="#2591C2"/><stop offset=".85" stop-color="#1A6FA6"/><stop offset="1" stop-color="#155F92"/></linearGradient>
    <radialGradient id="peixe-sol"><stop offset="0" stop-color="#FFFBE0" stop-opacity=".95"/><stop offset=".3" stop-color="#E8FFF8" stop-opacity=".45"/><stop offset="1" stop-color="#E8FFF8" stop-opacity="0"/></radialGradient>
    <linearGradient id="peixe-raio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4FFF8" stop-opacity=".55"/><stop offset=".6" stop-color="#DFFBF6" stop-opacity=".18"/><stop offset="1" stop-color="#DFFBF6" stop-opacity="0"/></linearGradient>
    <linearGradient id="peixe-sup" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6FFFC"/><stop offset="1" stop-color="#A6EEF2" stop-opacity=".2"/></linearGradient>
    <linearGradient id="peixe-longe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4FA6C8"/><stop offset="1" stop-color="#3A8DB8"/></linearGradient>
    <linearGradient id="peixe-longe2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3F95BC"/><stop offset="1" stop-color="#2D7BA8"/></linearGradient>
    <linearGradient id="peixe-areia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9D7A2"/><stop offset=".35" stop-color="#E3C98E"/><stop offset="1" stop-color="#C9A86A"/></linearGradient>
    <radialGradient id="peixe-rocha" cx=".36" cy=".22" r=".85"><stop offset="0" stop-color="#A897A6"/><stop offset=".45" stop-color="#7D6B82"/><stop offset=".85" stop-color="#55465E"/><stop offset="1" stop-color="#3E3248"/></radialGradient>
    <radialGradient id="peixe-rochaE" cx=".4" cy=".25" r=".85"><stop offset="0" stop-color="#6F7F84"/><stop offset=".6" stop-color="#4C5A63"/><stop offset="1" stop-color="#2F3A44"/></radialGradient>
    <radialGradient id="peixe-cerebro" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#F7C47E"/><stop offset=".55" stop-color="#E2985A"/><stop offset="1" stop-color="#A9612E"/></radialGradient>
    <linearGradient id="peixe-esponja" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFC25A"/><stop offset=".5" stop-color="#F29A2E"/><stop offset="1" stop-color="#B9661C"/></linearGradient>
    <radialGradient id="peixe-disco" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#FCE2C8"/><stop offset=".6" stop-color="#F0B49A"/><stop offset="1" stop-color="#C8708A"/></radialGradient>
    <linearGradient id="peixe-coluna" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E07A92"/><stop offset=".5" stop-color="#C2506E"/><stop offset="1" stop-color="#86304E"/></linearGradient>
    <radialGradient id="peixe-sombra"><stop offset="0" stop-color="#3A4A3A" stop-opacity=".42"/><stop offset=".6" stop-color="#3A4A3A" stop-opacity=".2"/><stop offset="1" stop-color="#3A4A3A" stop-opacity="0"/></radialGradient>
    <radialGradient id="peixe-bolha" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".05"/><stop offset=".72" stop-color="#E8FFFF" stop-opacity=".18"/><stop offset=".92" stop-color="#FFFFFF" stop-opacity=".75"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".2"/></radialGradient>
    <radialGradient id="peixe-ponta" cx=".42" cy=".32" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".45" stop-color="#FFDDEE"/><stop offset="1" stop-color="#F0A0C8"/></radialGradient>
    <radialGradient id="peixe-pontaT" cx=".42" cy=".32" r=".7"><stop offset="0" stop-color="#F8DCEC"/><stop offset=".5" stop-color="#E6AACB"/><stop offset="1" stop-color="#C47AA6"/></radialGradient>
    <radialGradient id="peixe-vinheta" cx=".5" cy=".45" r=".78"><stop offset=".62" stop-color="#062A48" stop-opacity="0"/><stop offset="1" stop-color="#062A48" stop-opacity=".38"/></radialGradient>
    <radialGradient id="peixe-campanula" cx=".45" cy=".35" r=".7"><stop offset="0" stop-color="#FFF0F8" stop-opacity=".95"/><stop offset=".6" stop-color="#F0B4DE" stop-opacity=".8"/><stop offset="1" stop-color="#B86AC0" stop-opacity=".85"/></radialGradient>
    <linearGradient id="peixe-kelp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8DB54A"/><stop offset=".5" stop-color="#6A9636"/><stop offset="1" stop-color="#3F6A24"/></linearGradient>
    <linearGradient id="peixe-kelpE" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5E8A34"/><stop offset="1" stop-color="#2C4E1E"/></linearGradient>
    <linearGradient id="peixe-alga" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E0625A"/><stop offset="1" stop-color="#9A2E3A"/></linearGradient>
    <radialGradient id="peixe-carapaca" cx=".4" cy=".3" r=".75"><stop offset="0" stop-color="#9DB57A"/><stop offset=".6" stop-color="#6E8A50"/><stop offset="1" stop-color="#46603A"/></radialGradient>
    <radialGradient id="peixe-carang" cx=".4" cy=".3" r=".75"><stop offset="0" stop-color="#FF8A5C"/><stop offset=".6" stop-color="#E65A34"/><stop offset="1" stop-color="#A83A1E"/></radialGradient>
    <clipPath id="peixe-clip-areia"><path d="M0,${AREIA}C200,${AREIA - 10} 420,${AREIA + 8} 640,${AREIA}S1100,${AREIA - 6} 1300,${AREIA + 4}S1520,${AREIA - 4} 1600,${AREIA}V900H0Z"/></clipPath>`;
  }
  // rede de luz cáustica (linhas onduladas entre pontos de uma grelha torta)
  function causticas(sem, x0, y0, w, h, passo) {
    const r = semente(sem), cols = Math.ceil(w / passo) + 1, lins = Math.ceil(h / (passo * .55)) + 1, P = [];
    for (let j = 0; j < lins; j++) for (let i = 0; i < cols; i++) P.push([x0 + i * passo + (r() - .5) * passo * .7 + (j % 2) * passo * .5, y0 + j * passo * .55 + (r() - .5) * passo * .3]);
    let d = '';
    const lig = (a, b) => { const mx = (a[0] + b[0]) / 2 + (r() - .5) * passo * .35, my = (a[1] + b[1]) / 2 + (r() - .5) * passo * .2; d += `M${n(a[0])},${n(a[1])}Q${n(mx)},${n(my)} ${n(b[0])},${n(b[1])}`; };
    for (let j = 0; j < lins; j++) for (let i = 0; i < cols; i++) {
      const p = P[j * cols + i];
      if (i < cols - 1) lig(p, P[j * cols + i + 1]);
      if (j < lins - 1) lig(p, P[(j + 1) * cols + i]);
    }
    return d;
  }
  function aguaSVG() {
    let raios = '';
    [[120, 70, .9], [330, 110, .7], [560, 60, 1], [760, 130, .6], [990, 80, .8], [1230, 100, .55], [1430, 70, .5]].forEach(([x, w, o], i) => {
      raios += `<path class="px-raio${i}" d="M${x},-20 L${x + w},-20 L${x + w + 330},900 L${x + 260},900 Z" fill="url(#peixe-raio)" opacity="${o}"/>`;
    });
    let ondas = '';
    for (let x = -200; x < 1800; x += 100) ondas += `Q${x + 25},${n(30 + 6)} ${x + 50},30 T${x + 100},30 `;
    return `<rect width="1600" height="900" fill="url(#peixe-agua)"/>
      <circle cx="260" cy="-80" r="560" fill="url(#peixe-sol)"/>
      <g class="px-sup"><path d="M-200,0 V30 ${ondas} L1800,0 Z" fill="url(#peixe-sup)" opacity=".65"/>
        <path d="M-200,30 ${ondas}" fill="none" stroke="#F4FFFF" stroke-width="3" opacity=".55"/>
        <path d="M-160,44 ${ondas.replace(/,30/g, ',44')}" fill="none" stroke="#DFFFFF" stroke-width="2" opacity=".3"/></g>
      <g class="px-raios">${raios}</g>`;
  }
  function longeSVG() {
    // recife ao longe (silhuetas azuladas) e algas compridas ao longe
    let algas = '';
    [[90, 640, 260], [690, 660, 200], [1180, 650, 240], [1530, 640, 280], [330, 650, 170]].forEach(([x, y, h], i) => {
      algas += `<g class="px-algaL${i}" transform="translate(${x},${y})"><path d="M-6,0 C-20,${-h * .3} 18,${-h * .55} -4,${-h} C-10,${-h * .6} -32,${-h * .3} -6,0 Z M4,0 C20,${-h * .25} -8,${-h * .5} 16,${-h * .8} C8,${-h * .5} 26,${-h * .25} 4,0Z" fill="#3E92B4" opacity=".75"/></g>`;
    });
    let peixes = '';
    CARDUME.forEach(([x, y, k], i) => {
      peixes += `<g class="px-pc${i}" transform="translate(${n(x)},${n(y)})"><g class="px-pci${i}"><path d="M${n(12 * k)},0 C${n(6 * k)},${n(-6 * k)} ${n(-8 * k)},${n(-6 * k)} ${n(-12 * k)},0 L${n(-19 * k)},${n(-5 * k)} L${n(-17 * k)},0 L${n(-19 * k)},${n(5 * k)} L${n(-12 * k)},0 C${n(-8 * k)},${n(6 * k)} ${n(6 * k)},${n(6 * k)} ${n(12 * k)},0Z" fill="#9FD3E4"/><path d="M${n(10 * k)},${n(-1 * k)} C${n(4 * k)},${n(-4 * k)} ${n(-6 * k)},${n(-4 * k)} ${n(-11 * k)},${n(-1 * k)}" stroke="#E6F8FF" stroke-width="1.2" fill="none" opacity=".8"/></g></g>`;
    });
    return `<path d="M0,560 C60,540 120,470 210,500 C270,520 300,470 360,488 C420,505 470,560 540,560 L560,700 L0,700Z" fill="url(#peixe-longe)" opacity=".8"/>
      <path d="M1040,560 C1100,520 1160,470 1240,480 C1310,490 1350,440 1420,450 C1500,462 1560,510 1600,500 L1600,700 L1040,700Z" fill="url(#peixe-longe)" opacity=".8"/>
      <path d="M500,610 C580,590 640,560 720,580 C800,598 860,560 940,575 C1000,586 1050,600 1080,620 L1080,700 L500,700Z" fill="url(#peixe-longe)" opacity=".55"/>
      <g fill="#5AAFCF" opacity=".55"><circle cx="190" cy="520" r="34"/><circle cx="236" cy="532" r="22"/><circle cx="1300" cy="478" r="30"/><circle cx="1360" cy="470" r="18"/><circle cx="780" cy="580" r="26"/></g>
      ${algas}
      <g class="px-tartaruga" display="none" opacity=".62">${tartarugaSVG()}</g>
      <g class="px-cardume">${peixes}</g>
      <path d="M0,620 C80,600 160,610 240,628 C320,646 380,620 460,640 L480,720 L0,720Z" fill="url(#peixe-longe2)" opacity=".85"/>
      <path d="M1120,630 C1200,610 1280,628 1360,616 C1440,604 1520,626 1600,612 L1600,720 L1120,720Z" fill="url(#peixe-longe2)" opacity=".85"/>`;
  }
  function tartarugaSVG() {                 // tartaruga marinha (vista de lado, a nadar para a direita), tingida de azul pela distância
    return `<g class="px-tart">
      <g class="px-barbTT"><path d="M-40,8 C-62,14 -78,30 -84,42 C-64,40 -46,28 -34,18Z" fill="#7E9A72" stroke="#3E5240" stroke-width="2"/></g>
      <g class="px-barbFT"><path d="M30,10 C40,30 30,62 6,86 C0,62 8,30 18,12Z" fill="#7E9A72" stroke="#3E5240" stroke-width="2"/></g>
      <path d="M58,-6 C78,-14 98,-8 102,4 C100,14 84,18 66,12Z" fill="#9AB088" stroke="#3E5240" stroke-width="2.2"/>
      <circle cx="88" cy="-1" r="3.2" fill="#1E2A20"/><circle cx="87" cy="-2.2" r="1.1" fill="#FFF"/>
      <path d="M90,8 Q95,9 99,6" stroke="#3E5240" stroke-width="1.6" fill="none"/>
      <ellipse cx="0" cy="0" rx="66" ry="36" fill="url(#peixe-carapaca)" stroke="#3E5240" stroke-width="2.6"/>
      <path d="M-20,-30 L-6,-12 L18,-14 L30,-30 M-6,-12 L-14,10 L10,14 L18,-14 M-14,10 L-42,6 M10,14 L38,8 M-44,-18 L-20,-30 M30,-30 L52,-14" stroke="#4E6A40" stroke-width="2" fill="none" opacity=".75"/>
      <path d="M-62,8 C-30,30 30,30 64,8" stroke="#D8D2A0" stroke-width="5" fill="none" opacity=".6"/>
      <ellipse cx="-14" cy="-18" rx="26" ry="9" fill="#D6E6B8" opacity=".35"/>
      <g class="px-barbFP"><path d="M26,6 C46,24 44,56 24,80 C16,58 14,30 12,10Z" fill="#8EA884" stroke="#3E5240" stroke-width="2"/></g>
    </g>`;
  }
  function areiaSVG() {
    const r = semente(43);
    let seixos = '';
    for (let i = 0; i < 26; i++) {
      const x = r() * 1600, y = AREIA + 40 + r() * 150, s = 4 + r() * 9;
      if (x > 800 && x < 1190 && y < 860) continue;
      const c = escolhe(['#B9A27A', '#9C8E7E', '#C9B898', '#8A8070', '#D6C6A8']);
      seixos += `<ellipse cx="${n(x)}" cy="${n(y + s * .5)}" rx="${n(s * 1.1)}" ry="${n(s * .35)}" fill="#8A6E40" opacity=".3"/><ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(s)}" ry="${n(s * .65)}" fill="${c}" stroke="#6E5A3C" stroke-width="1.2"/><ellipse cx="${n(x - s * .3)}" cy="${n(y - s * .25)}" rx="${n(s * .35)}" ry="${n(s * .18)}" fill="#FFF8E0" opacity=".55"/>`;
    }
    let rip = '';
    for (let j = 0; j < 9; j++) { const y = AREIA + 22 + j * 20 + j * j * 1.2; rip += `M${-20 + (j % 3) * 30},${n(y)} ` + Array.from({ length: 18 }, (_, i) => `q45,${(i % 2 ? 7 : -7) - 2} 95,${i % 3 - 1}`).join(' ') + ' '; }
    // concha de vieira, búzio, estrela-do-mar
    let leque = '';
    for (let i = 0; i < 9; i++) { const a = (-70 + i * 17.5) * RAD; leque += `M0,0 L${n(Math.sin(a) * 30)},${n(-Math.cos(a) * 30)} `; }
    const estrela = (() => { let d = ''; for (let i = 0; i < 10; i++) { const a = i / 10 * 2 * PI - PI / 2, rr = i % 2 ? 11 : 32; d += (i ? 'L' : 'M') + n(Math.cos(a) * rr) + ',' + n(Math.sin(a) * rr * .62); } return d + 'Z'; })();
    let pintasE = ''; for (let i = 0; i < 5; i++) { const a = i / 5 * 2 * PI - PI / 2; for (let j = 1; j < 4; j++) pintasE += `<circle cx="${n(Math.cos(a) * j * 7)}" cy="${n(Math.sin(a) * j * 7 * .62)}" r="${n(2.6 - j * .4)}"/>`; }
    return `<g class="px-areia"><path d="M0,${AREIA}C200,${AREIA - 10} 420,${AREIA + 8} 640,${AREIA}S1100,${AREIA - 6} 1300,${AREIA + 4}S1520,${AREIA - 4} 1600,${AREIA}V900H0Z" fill="url(#peixe-areia)"/>
      <path d="${rip}" fill="none" stroke="#C7A86C" stroke-width="3" opacity=".55" stroke-linecap="round"/>
      <path d="${rip}" fill="none" stroke="#FFF2CC" stroke-width="1.6" opacity=".45" transform="translate(0,-3)"/>
      <g clip-path="url(#peixe-clip-areia)" opacity=".5"><path class="px-caust0" fill="none" stroke="#FFFBE0" stroke-width="4" stroke-linecap="round"/><path class="px-caust1" fill="none" stroke="#FFFFF0" stroke-width="2.6" stroke-linecap="round" opacity=".8"/></g>
      ${seixos}
      <g transform="translate(700,842) rotate(-8)"><ellipse cx="2" cy="6" rx="36" ry="8" fill="#7A5E30" opacity=".3"/><path d="M-30,-6 C-32,-30 32,-30 30,-6 L8,6 L-8,6Z" fill="#F7B9A0" stroke="#A85E48" stroke-width="2"/><path d="${leque}" transform="translate(0,4) scale(1,.95)" stroke="#D88A70" stroke-width="2" fill="none"/><path d="M-10,6 L-14,12 L14,12 L10,6Z" fill="#E89C84" stroke="#A85E48" stroke-width="1.6"/><path d="M-20,-18 C-10,-26 10,-26 20,-18" stroke="#FFF0E6" stroke-width="2.4" fill="none" opacity=".7"/></g>
      <g transform="translate(560,866) rotate(14)"><ellipse cx="0" cy="8" rx="30" ry="6" fill="#7A5E30" opacity=".3"/><path d="M-26,4 C-28,-12 -8,-20 10,-14 C24,-10 30,0 22,6 C10,12 -14,12 -26,4Z" fill="#F4DDB8" stroke="#9A7650" stroke-width="2"/><path d="M-20,2 C-14,-8 2,-12 12,-8 M-14,6 C-8,-2 6,-4 14,0 M22,6 L32,10 L24,0" stroke="#B88E62" stroke-width="1.8" fill="none"/><ellipse cx="-6" cy="-8" rx="10" ry="3" fill="#FFF8EE" opacity=".6"/></g>
      <g transform="translate(372,820) rotate(-16)"><ellipse cx="4" cy="10" rx="34" ry="8" fill="#7A5E30" opacity=".28"/><path d="${estrela}" fill="#F0703A" stroke="#9A3A18" stroke-width="2.4" stroke-linejoin="round"/><g fill="#FFC890" opacity=".85">${pintasE}</g><path d="M-6,-10 L-2,-16" stroke="#FFE0C0" stroke-width="2" opacity=".6"/></g>
      <g transform="translate(1388,806)"><ellipse cx="0" cy="8" rx="26" ry="6" fill="#7A5E30" opacity=".3"/><path d="M-22,4 C-22,-10 22,-10 22,4 C12,10 -12,10 -22,4Z" fill="#8E7AA0" stroke="#4E3E60" stroke-width="2"/><path d="M-22,4 C-12,-2 12,-2 22,4" stroke="#4E3E60" stroke-width="1.6" fill="none"/><path d="M-14,-4 Q0,-10 14,-4" stroke="#D6C6E6" stroke-width="2" fill="none" opacity=".6"/></g>
      <ellipse class="px-sombra" rx="1" ry="1" fill="url(#peixe-sombra)"/>
      <g class="px-carang" display="none">${caranguejoSVG()}</g>
    </g>`;
  }
  function caranguejoSVG() {
    let pernas = '';
    for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) pernas += `<g class="px-pernaC" data-s="${sg}" data-i="${i}" transform="translate(${sg * (14 + i * 7)},${4 + i * 2})"><path d="M0,0 L${sg * 14},-8 L${sg * 24},10" fill="none" stroke="#A83A1E" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M0,0 L${sg * 14},-8 L${sg * 24},10" fill="none" stroke="#F06A3E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    const pinca = sg => `<g class="px-pinca${sg > 0 ? 'D' : 'E'}" transform="translate(${sg * 26},-6)"><path d="M0,0 L${sg * 14},-14" stroke="#A83A1E" stroke-width="6" stroke-linecap="round"/><path d="M0,0 L${sg * 14},-14" stroke="#F06A3E" stroke-width="3.4" stroke-linecap="round"/>
      <g transform="translate(${sg * 16},-18)"><path d="M0,4 C${sg * 4},-14 ${sg * 20},-14 ${sg * 18},-2 L${sg * 8},-4 L${sg * 14},4 C${sg * 8},10 ${sg * 2},10 0,4Z" fill="url(#peixe-carang)" stroke="#8A2A14" stroke-width="2"/></g></g>`;
    return `<ellipse cx="0" cy="18" rx="34" ry="6" fill="#7A5E30" opacity=".3"/>${pernas}${pinca(-1)}${pinca(1)}
      <ellipse cx="0" cy="0" rx="28" ry="17" fill="url(#peixe-carang)" stroke="#8A2A14" stroke-width="2.4"/>
      <path d="M-18,-6 Q0,-14 18,-6" stroke="#FFC0A0" stroke-width="2.4" fill="none" opacity=".6"/>
      <g class="px-olhosC"><path d="M-7,-14 L-9,-26 M7,-14 L9,-26" stroke="#8A2A14" stroke-width="3" stroke-linecap="round"/><circle cx="-9" cy="-28" r="5" fill="#FFF" stroke="#2A1408" stroke-width="1.6"/><circle cx="9" cy="-28" r="5" fill="#FFF" stroke="#2A1408" stroke-width="1.6"/><circle class="px-pupC" cx="-8" cy="-28" r="2.6" fill="#1A0E06"/><circle class="px-pupC" cx="10" cy="-28" r="2.6" fill="#1A0E06"/></g>
      <path d="M-6,6 Q0,10 6,6" stroke="#6A1E0E" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  }
  function recifeSVG() {
    // coral-cérebro (à esquerda), coral ramificado, gorgónia (leque) à direita, esponjas-tubo, ervas marinhas
    const r = semente(29);
    let sulcos = '';
    for (let j = 0; j < 7; j++) {
      const y = -52 + j * 15, w = 92 * Math.sqrt(Math.max(0, 1 - Math.pow((y + 6) / 64, 2)));
      let d = `M${n(-w)},${n(y)}`;
      for (let x = -w; x < w; x += 16) d += ` q8,${j % 2 ? 7 : -7} 16,0`;
      sulcos += `<path d="${d}" fill="none" stroke="#9A5428" stroke-width="3" opacity=".6"/><path d="${d}" fill="none" stroke="#FFD8A0" stroke-width="1.4" opacity=".55" transform="translate(-1,-3)"/>`;
    }
    const ramo = (x, y, a, l, prof, s) => {
      if (prof > 3 || l < 12) return '';
      const x2 = x + Math.sin(a * RAD) * l, y2 = y - Math.cos(a * RAD) * l;
      let o = `M${n(x)},${n(y)}L${n(x2)},${n(y2)}`;
      o += ramo(x2, y2, a - 22 - s() * 14, l * .72, prof + 1, s) + ramo(x2, y2, a + 18 + s() * 14, l * .7, prof + 1, s);
      return o;
    };
    const s1 = semente(3), ramos = ramo(0, 0, -8, 52, 0, s1) + ramo(0, 0, 24, 44, 1, s1) + ramo(-10, 0, -40, 40, 1, s1);
    const pontas = []; ramos.replace(/L(-?[\d.]+),(-?[\d.]+)/g, (m, x, y) => { pontas.push([+x, +y]); return m; });
    // gorgónia: rede de ramos finos
    const s2 = semente(77);
    const leque = ramo(0, 0, -30, 70, 0, s2) + ramo(0, 0, 0, 86, 0, s2) + ramo(0, 0, 30, 72, 0, s2) + ramo(0, 0, -55, 52, 1, s2) + ramo(0, 0, 55, 52, 1, s2);
    let rede = '';
    for (let i = 0; i < 30; i++) { const a = (-70 + r() * 140) * RAD, d1 = 40 + r() * 120, d2 = d1 + 12 + r() * 20, b = a + (r() - .5) * .4; rede += `M${n(Math.sin(a) * d1)},${n(-Math.cos(a) * d1)}L${n(Math.sin(b) * d2)},${n(-Math.cos(b) * d2)}`; }
    let ervas = '';
    const tufo = (x, y, k, cor, cl) => { let d = ''; for (let i = 0; i < 7; i++) { const a = (-30 + i * 10 + (r() - .5) * 8), l = (40 + r() * 40) * k, ar = a * RAD; d += `M${x + i * 3 - 9},${y} Q${n(x + i * 3 - 9 + Math.sin(ar) * l * .4)},${n(y - l * .6)} ${n(x + i * 3 - 9 + Math.sin(ar) * l)},${n(y - l)}`; } return `<g class="${cl}"><path d="${d}" stroke="${cor}" stroke-width="5" stroke-linecap="round" fill="none"/><path d="${d}" stroke="#B8E07A" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".5"/></g>`; };
    ervas += tufo(620, 724, 1, '#4E8A3A', 'px-erva0') + tufo(760, 718, .8, '#5A9A40', 'px-erva1') + tufo(1215, 724, .9, '#4E8A3A', 'px-erva2') + tufo(150, 726, 1.1, '#4E8A3A', 'px-erva3');
    return `<g class="px-recife">
      <g transform="translate(236,716)"><ellipse cx="6" cy="10" rx="110" ry="16" fill="#5A4A2A" opacity=".35"/>
        <path d="M-96,6 C-100,-40 -60,-68 0,-70 C60,-68 100,-40 96,6 C60,16 -60,16 -96,6Z" fill="url(#peixe-cerebro)" stroke="#7A4220" stroke-width="3"/>${sulcos}
        <ellipse cx="-34" cy="-46" rx="30" ry="10" fill="#FFE8C0" opacity=".35"/></g>
      <g transform="translate(470,716)"><ellipse cx="0" cy="6" rx="60" ry="10" fill="#5A4A2A" opacity=".3"/>
        <path d="${ramos}" stroke="#8A6A30" stroke-width="15" stroke-linecap="round" fill="none"/>
        <path d="${ramos}" stroke="#E6CC72" stroke-width="10" stroke-linecap="round" fill="none"/>
        <path d="${ramos}" stroke="#FFF0B0" stroke-width="3" stroke-linecap="round" fill="none" opacity=".55" transform="translate(-2,-1)"/>
        <g fill="#FFF3C8">${pontas.map(p => `<circle cx="${n(p[0])}" cy="${n(p[1])}" r="5"/>`).join('')}</g></g>
      <g class="px-gorgonia" transform="translate(1296,764)"><ellipse cx="0" cy="4" rx="40" ry="8" fill="#3A2A3A" opacity=".3"/>
        <path d="${leque}" stroke="#5E2A78" stroke-width="7" stroke-linecap="round" fill="none"/>
        <path d="${leque}${rede}" stroke="#A65CC8" stroke-width="3.6" stroke-linecap="round" fill="none"/>
        <path d="${rede}" stroke="#D49AEC" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".7"/></g>
      <g transform="translate(1448,770)"><ellipse cx="0" cy="6" rx="56" ry="10" fill="#3A2A1A" opacity=".3"/>
        ${[[-26, 70, 15], [0, 104, 17], [26, 82, 14], [44, 50, 11]].map(([x, h, w]) => `<path d="M${x - w},0 L${x - w + 3},${-h} L${x + w - 3},${-h} L${x + w},0Z" fill="url(#peixe-esponja)" stroke="#8A4A12" stroke-width="2.4"/><ellipse cx="${x}" cy="${-h}" rx="${w - 3}" ry="5.5" fill="#6A3008" stroke="#8A4A12" stroke-width="2"/><path d="M${x - w + 5},${-h + 10} L${x - w + 6},-8" stroke="#FFE0A0" stroke-width="3" opacity=".55" stroke-linecap="round"/>`).join('')}</g>
      ${ervas}
    </g>`;
  }
  function anemonaTrasSVG() {
    // rocha (com algas calcárias cor-de-rosa e cracas), coluna e disco da anémona, tentáculos de trás
    const r = semente(61);
    let cracas = '';
    for (let i = 0; i < 14; i++) { const x = 850 + r() * 300, y = 730 + r() * 140; cracas += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(3 + r() * 4)}" fill="#C8BCC8" stroke="#5E4E66" stroke-width="1.4"/><circle cx="${n(x)}" cy="${n(y)}" r="1.4" fill="#4A3A52"/>`; }
    let crosta = '';
    for (let i = 0; i < 8; i++) { const x = 850 + r() * 300, y = 720 + r() * 150; crosta += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(10 + r() * 22)}" ry="${n(5 + r() * 9)}" fill="#E890B0" opacity=".55"/>`; }
    let estrias = '';
    for (let i = 0; i < 24; i++) { const a = i / 24 * 2 * PI; estrias += `M${n(ANEM.x + Math.cos(a) * 20)},${n(ANEM.y + Math.sin(a) * 4)}L${n(ANEM.x + Math.cos(a) * ANEM.rx * .95)},${n(ANEM.y + Math.sin(a) * ANEM.ry * .95)}`; }
    return `<g class="px-anemTras">
      <ellipse cx="1004" cy="884" rx="230" ry="22" fill="#5A4A2A" opacity=".35"/>
      <path d="M812,900 C800,820 830,742 892,712 C950,684 1060,680 1118,706 C1176,734 1196,820 1188,900Z" fill="url(#peixe-rocha)" stroke="#3A2C42" stroke-width="3.6"/>
      <path d="M850,770 C870,736 910,716 960,708" stroke="#D8C8D8" stroke-width="5" fill="none" opacity=".45" stroke-linecap="round"/>
      ${crosta}${cracas}
      <path d="M1120,760 C1140,800 1150,840 1146,890 M880,800 C870,830 868,860 872,890" stroke="#3A2C42" stroke-width="2.4" fill="none" opacity=".4"/>
      <path d="M886,${ANEM.y + 4} C890,${ANEM.y + 40} 900,${ANEM.y + 52} 930,712 L1080,712 C1104,${ANEM.y + 50} 1112,${ANEM.y + 36} 1114,${ANEM.y + 4}Z" fill="url(#peixe-coluna)" stroke="#6A1E3A" stroke-width="3"/>
      <ellipse class="px-disco" cx="${ANEM.x}" cy="${ANEM.y}" rx="${ANEM.rx}" ry="${ANEM.ry}" fill="url(#peixe-disco)" stroke="#8A3058" stroke-width="3"/>
      <path d="${estrias}" stroke="#D88AA0" stroke-width="2" opacity=".6"/>
      <ellipse cx="${ANEM.x}" cy="${ANEM.y}" rx="16" ry="5" fill="#9A3A5A" stroke="#6A1E3A" stroke-width="2"/>
      <g class="px-tentTras">${TENT.filter(t => t.tras).map(tentSVG).join('')}</g>
    </g>`;
  }
  function tentSVG(t) {
    const i = TENT.indexOf(t);
    return `<g class="px-t${i}"><path class="px-tc${i}" fill="${t.cor}" stroke="#6E1E4A" stroke-width="2.6" stroke-linejoin="round"/>
      <path class="px-tl${i}" fill="none" stroke="#FFE2F0" stroke-width="${n(t.w * .28)}" stroke-linecap="round" opacity="${t.tras ? .25 : .45}"/>
      <ellipse class="px-tp${i}" rx="1" ry="1" fill="${t.ponta}" stroke="#7A2A56" stroke-width="${n3(2.2 / (t.w * .62))}"/></g>`;
  }
  function anemonaFrenteSVG() { return `<g class="px-anemFrente">${TENT.filter(t => !t.tras).map(tentSVG).join('')}</g>`; }
  function primeiroPlanoSVG() {
    let bolhas = '';
    for (let i = 0; i < 8; i++) bolhas += `<circle class="px-bs${i}" r="1" fill="url(#peixe-bolha)" stroke="#EFFFFF" stroke-width=".12" />`;
    let pl = '';
    PLANCTO.forEach((p, i) => { pl += `<circle class="px-pl${i}" r="${n(p[2])}" fill="#F4FFF0" opacity="${n3(.35 + (i % 3) * .15)}"/>`; });
    return `<g class="px-bolhasS">${bolhas}</g><g class="px-plancto">${pl}</g>
      <g class="px-alforreca" display="none">
        <path class="px-alfT" fill="none" stroke="#E7B6E2" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>
        <path class="px-alfB" fill="url(#peixe-campanula)" stroke="#B66AB0" stroke-width="2.4"/>
        <path class="px-alfO" fill="none" stroke="#F7D0EE" stroke-width="3" opacity=".8"/>
        <path class="px-alfR" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".55"/>
      </g>`;
  }
  function frenteSVG() {
    let kelp = '';
    for (let i = 0; i < 5; i++) kelp += `<path class="px-kelp${i}" fill="url(#peixe-${i < 3 ? 'kelp' : 'alga'})" stroke="${i < 3 ? '#2E4E1A' : '#6A1A26'}" stroke-width="2.6" stroke-linejoin="round"/><path class="px-kelpN${i}" fill="none" stroke="${i < 3 ? '#C8E68A' : '#FFB0A0'}" stroke-width="2" opacity=".5"/>`;
    return `<g class="px-kelp">${kelp}</g>
      <path d="M-20,900 C-20,840 10,800 70,796 C130,792 190,830 214,900Z" fill="url(#peixe-rochaE)" stroke="#1E262E" stroke-width="3"/>
      <path d="M20,820 C40,806 70,800 100,804" stroke="#9AB0B4" stroke-width="4" fill="none" opacity=".4" stroke-linecap="round"/>
      <path d="M1440,900 C1450,860 1490,840 1540,842 C1580,844 1610,864 1620,900Z" fill="url(#peixe-rochaE)" stroke="#1E262E" stroke-width="3"/>
      <rect width="1600" height="900" fill="url(#peixe-vinheta)" pointer-events="none"/>`;
  }

  /* ================= 5) montar() ================= */
  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .4 : 1;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    let efeitos = '';
    for (let i = 0; i < 16; i++) efeitos += `<g class="px-b${i}" display="none"><circle r="1" fill="url(#peixe-bolha)" stroke="#F2FFFF" stroke-width=".07"/><ellipse cx="-.36" cy="-.4" rx=".24" ry=".13" fill="#FFFFFF" opacity=".85" transform="rotate(-35,-.36,-.4)"/><path d="M.5,.45 A.7,.7 0 0 1 -.1,.68" fill="none" stroke="#FFFFFF" stroke-width=".07" opacity=".6"/></g>`;
    for (let i = 0; i < 6; i++) efeitos += `<circle class="px-pop${i}" r="1" fill="none" stroke="#F2FFFF" stroke-width="2" display="none"/>`;
    svg.innerHTML = `<defs>${defsPeixe('peixe-')}${defsCena()}</defs>
      ${aguaSVG()}${longeSVG()}${areiaSVG()}${recifeSVG()}${primeiroPlanoSVG()}
      <g class="px-habitat">
        <rect x="812" y="470" width="360" height="430" fill="#000" fill-opacity="0"/>
        ${anemonaTrasSVG()}
        <g class="px-slotDentro"></g>
        ${anemonaFrenteSVG()}
      </g>
      <g class="px-slotFora">${peixeSVG('peixe-')}</g>
      <g class="px-anel" display="none"><ellipse rx="1" ry="1" fill="none" stroke="#E8FFFF" stroke-width=".26" opacity=".45"/><ellipse rx="1" ry="1" fill="none" stroke="#FFFFFF" stroke-width=".07" opacity=".9"/><path d="M-.8,-.55 A1,1 0 0 1 .3,-.98" fill="none" stroke="#FFFFFF" stroke-width=".1" stroke-linecap="round"/></g>
      <g class="px-efeitos">${efeitos}</g>
      ${frenteSVG()}`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s);
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; el.setAttribute(nome, v); } }

    /* --- referências --- */
    const ld = f => ({ E: f('E'), D: f('D') });
    const corpo = nm => ({ c: q(`.px-${nm}-c`), e: q(`.px-${nm}-e`), l: q(`.px-${nm}-l`), o: +q(`.px-${nm}-c`).getAttribute('data-o') });
    const barb = nm => ({ g: q('.px-g-' + nm), d: q('.px-' + nm), r: q(`.px-${nm}R`) });
    const R = {
      peixe: q('.px-peixe'), tras: q('.px-tras'), frente: q('.px-frente'), caudaTras: q('.px-caudaTras'), caudaFrente: q('.px-caudaFrente'), boca: q('.px-boca'),
      C: corpo('C'), casco: q('.px-casco'), cascoC: q('.px-cascoC'), luzA: q('.px-A-l'),
      barbs: { cauda: barb('cauda'), dorsal1: barb('dorsal1'), dorsal2: barb('dorsal2'), anal: barb('anal'), peitE: barb('peitE'), peitD: barb('peitD'), pelvE: barb('pelvE'), pelvD: barb('pelvD') },
      faixas: [0, 1, 2].map(i => ({ d: q('.px-f' + i), b: q('.px-fb' + i) })),
      brA: [0, 1, 2].map(i => q('.px-brA' + i)), specA: q('.px-specA'),
      guelra: ld(L => q('.px-guelra' + L)), guelraL: ld(L => q('.px-guelraL' + L)), boch: ld(L => q('.px-boch' + L)), nar: ld(L => q('.px-nar' + L)),
      labio: q('.px-labio'), bocaInt: q('.px-bocaInt'), sorriso: q('.px-sorriso'),
      olho: ld(L => q('.px-olho' + L)), globo: ld(L => q('.px-globo' + L)), iris: ld(L => q('.px-iris' + L)), pupila: ld(L => q('.px-pupila' + L)),
      palpS: ld(L => q('.px-palpS' + L)), palpI: ld(L => q('.px-palpI' + L)), orla: ld(L => q('.px-orla' + L)), orlaI: ld(L => q('.px-orlaI' + L)),
      slotFora: q('.px-slotFora'), slotDentro: q('.px-slotDentro'), habitat: q('.px-habitat'), sombra: q('.px-sombra'), disco: q('.px-disco'),
      tent: TENT.map((t, i) => ({ c: q('.px-tc' + i), l: q('.px-tl' + i), p: q('.px-tp' + i) })),
      sup: q('.px-sup'), raios: Array.from({ length: 7 }, (_, i) => q('.px-raio' + i)), caust: [q('.px-caust0'), q('.px-caust1')],
      algasL: Array.from({ length: 5 }, (_, i) => q('.px-algaL' + i)), ervas: Array.from({ length: 4 }, (_, i) => q('.px-erva' + i)), gorgonia: q('.px-gorgonia'),
      cardume: q('.px-cardume'), pc: CARDUME.map((_, i) => q('.px-pc' + i)), pci: CARDUME.map((_, i) => q('.px-pci' + i)),
      bs: Array.from({ length: 8 }, (_, i) => q('.px-bs' + i)), pl: PLANCTO.map((_, i) => q('.px-pl' + i)),
      kelp: Array.from({ length: 5 }, (_, i) => q('.px-kelp' + i)), kelpN: Array.from({ length: 5 }, (_, i) => q('.px-kelpN' + i)),
      bolhas: Array.from({ length: 16 }, (_, i) => q('.px-b' + i)), pops: Array.from({ length: 6 }, (_, i) => q('.px-pop' + i)), anel: q('.px-anel'),
      tart: q('.px-tartaruga'), tartG: q('.px-tart'), tBarbF: q('.px-barbFT'), tBarbP: q('.px-barbFP'), tBarbT: q('.px-barbTT'),
      carang: q('.px-carang'), pernasC: Array.from(svg.querySelectorAll('.px-pernaC')), pincaE: q('.px-pincaE'), pincaD: q('.px-pincaD'), olhosC: q('.px-olhosC'),
      alf: q('.px-alforreca'), alfB: q('.px-alfB'), alfO: q('.px-alfO'), alfR: q('.px-alfR'), alfT: q('.px-alfT')
    };
    R.caust[0].setAttribute('d', causticas(11, -160, AREIA - 30, 1920, 260, 74));
    R.caust[1].setAttribute('d', causticas(23, -160, AREIA - 30, 1920, 260, 58));

    /* --- estado da pose --- */
    const ROSTO = { boca: 0, sorriso: .6, olhosEsc: 1, pupila: 1, feliz: 0, fecho: 0, crista: 0, leque: 1, infla: 0 };
    const P = Object.assign({ x: REPOUSO.x, y: REPOUSO.y, psi: REPOUSO.psi, pit: 0, rol: 0, sq: 0, nado: 0, agita: 0, curva: 0, remar: 0, flut: 1, somB: 0, somPit: 0, pAng: 40, pAmp: 20 }, ROSTO);
    let modo = 'fora', dentro = false, tempo = 0, vivo = true, G = null, reagindo = false;
    const fase = { cauda: 0, peit: 0, resp: 0, ond: 0, flut: 0 };
    const olhar = { foco: null, vagar: [0, 0], tVagar: 0 };
    const focar = f => { olhar.foco = f; };
    const pisca = { t: 0, prox: aleat(2000, 5000), duplo: false, v: 0 };
    const anem = { part: 0, abraco: 0, mexe: 0, vMexe: 0, cara: 0 };
    let ordemLado = '';

    /* --- desenhar o peixe --- */
    const tfE = e => `translate(${n(e.x)},${n(e.y)}) rotate(${n(e.ang)}) scale(${n(e.rx)},${n(e.ry)})`;
    function aplica(r, e) {
      const t = `translate(${n(e.x)},${n(e.y)}) rotate(${n(e.ang)})`;
      poe(r.e, `${t} scale(${n(e.rx)},${n(e.ry)})`);
      poe(r.c, `${t} scale(${n(e.rx + r.o)},${n(e.ry + r.o)})`);
      const [ox, oy] = luzOff(e, .26);
      poe(r.l, `translate(${n(e.x + ox)},${n(e.y + oy)}) rotate(${n(e.ang)}) scale(${n(e.rx * .74)},${n(e.ry * .7)})`);
    }
    function desenharPeixe() {
      const fl = P.flut * calma;
      const X = P.x + 2 * Math.sin(fase.flut * .5) * fl, Y = P.y + 6 * Math.sin(fase.flut) * fl;
      P._resp = Math.sin(fase.resp); P._guelra = Math.max(0, Math.sin(fase.resp + .6));
      P._pFase = fase.peit; P._ondF = fase.ond;
      const amp = (.22 + .78 * P.nado) * (ajudas.reduzido ? .7 : 1) + P.agita, fc = fase.cauda;
      P._b0 = -amp * 3.5 * Math.sin(fc + .4);
      P._b1 = amp * 9 * Math.sin(fc) + P.curva * 14;
      P._b2 = amp * 16 * Math.sin(fc - .9) + P.curva * 20;
      P._b3 = amp * 22 * Math.sin(fc - 1.8) + P.curva * 12;
      P._b4 = amp * 18 * Math.sin(fc - 2.6);
      P.pAng = lerp(44, 12, P.nado) + 10 * P.remar;
      P.pAmp = lerp(24, 6, P.nado) * (1 + .5 * P.remar);
      const pitB = P.pit, Pd = Object.create(P);
      Pd.pit = pitB + 2.2 * Math.sin(fase.flut + 1) * fl + P.somPit;
      const bocaR = .1 * Math.max(0, Math.sin(fase.resp + 1.1)) * (1 - P.nado);
      Pd.boca = limita(P.boca + P.somB + bocaR, 0, 1.2);
      G = geometria(Pd, X, Y, ESC);
      aplica(R.C, G.el.C); atr(R.casco, 'd', G.casco); atr(R.cascoC, 'd', G.casco);
      { const e = G.el.A, [ox, oy] = luzOff(e, .26); poe(R.luzA, `translate(${n(e.x + ox)},${n(e.y + oy)}) rotate(${n(e.ang)}) scale(${n(e.rx * .74)},${n(e.ry * .7)})`); }
      for (const nm in R.barbs) { const b = R.barbs[nm], f = G.fin[nm]; atr(b.d, 'd', f.d); atr(b.r, 'd', f.raios); }
      G.faixas.forEach((f, i) => { atr(R.faixas[i].d, 'd', f.d || 'M0,0'); atr(R.faixas[i].b, 'd', f.bordas || 'M0,0'); });
      G.brilhosA.forEach((m, i) => { poe(R.brA[i], tfE(m)); atr(R.brA[i], 'opacity', n3(limita((m.vis - .1) / .3, 0, 1) * .45)); });
      { const e = G.el.A, [ox, oy] = luzOff(e, .58), m = Math.min(e.rx, e.ry); poe(R.specA, `translate(${n(e.x + ox)},${n(e.y + oy)}) rotate(${n(e.ang - 14)}) scale(${n(m * .3)},${n(m * .1)})`); }
      LADOS.forEach(([L], i) => {
        const tr = trocos(G.guelras[i], .06);
        atr(R.guelra[L], 'd', tr.length ? tr.map(t => liso(t)).join('') : 'M0,0');
        atr(R.guelraL[L], 'd', tr.length ? tr.map(t => liso(t.map(p => [p[0] + 3, p[1] - 1]))).join('') : 'M0,0');
        const b = G.bochechas[i]; poe(R.boch[L], tfE(b)); atr(R.boch[L], 'opacity', n3(limita((b.vis - .05) / .3, 0, 1) * (.35 + .35 * P.feliz)));
        const nr = G.narinas[i]; poe(R.nar[L], tfE(nr)); atr(R.nar[L], 'opacity', n3(limita((nr.vis - .1) / .2, 0, 1) * .8));
      });
      // boca
      const bt = Pd.boca;
      if (bt > .07) {
        atr(R.labio, 'display', 'inline'); atr(R.bocaInt, 'display', 'inline');
        atr(R.labio, 'd', liso(G.bocaLabio, true)); atr(R.bocaInt, 'd', liso(G.bocaAnel, true));
      } else { atr(R.labio, 'display', 'none'); atr(R.bocaInt, 'display', 'none'); }
      const tr = trocos(G.sorriso, .03);
      atr(R.sorriso, 'd', tr.length ? tr.map(t => liso(t)).join('') : 'M0,0');
      atr(R.sorriso, 'opacity', n3(limita(1 - (bt - .05) * 4, 0, 1)));
      desenharOlhos();
      // lado de cá / lado de lá: barbatanas pares e olhos trocam de camada
      const lado = (G.fin.peitE.z > 0 ? 'E' : 'D') + (G.olho.E.vis > -.02 ? 1 : 0) + (G.olho.D.vis > -.02 ? 1 : 0);
      if (lado !== ordemLado) {
        ordemLado = lado;
        const perto = G.fin.peitE.z > 0 ? 'E' : 'D', longe = perto === 'E' ? 'D' : 'E';
        R.tras.appendChild(R.barbs['peit' + longe].g); R.tras.appendChild(R.barbs['pelv' + longe].g);
        R.frente.appendChild(R.barbs['pelv' + perto].g); R.frente.appendChild(R.barbs['peit' + perto].g);
        for (const L of [longe, perto]) (G.olho[L].vis > -.02 ? R.frente : R.tras).appendChild(R.olho[L]);
      }
      // de costas: a boca esconde-se e a cauda passa para a frente do corpo
      const frontal = vp(G.A.f, VISTA);
      atr(R.boca, 'opacity', n3(limita((frontal + .3) / .3, 0, 1)));
      const cf = frontal < -.25 ? R.caudaFrente : R.caudaTras;
      if (R.barbs.cauda.g.parentNode !== cf) cf.appendChild(R.barbs.cauda.g);
      // sombra na areia (só fora da anémona)
      const alt = limita((760 - Y) / 500, 0, 1);
      poe(R.sombra, `translate(${n(X - 10)},${n(752 + 4 * (1 - alt))}) scale(${n(160 * (1 + alt * .3))},${n(18 * (1 + alt * .2))})`);
      atr(R.sombra, 'opacity', n3(dentro || P.x > 790 && P.y > 520 ? 0 : (1 - alt * .6) * .9));
    }
    function desenharOlhos() {
      const c = G.c, up = pd(c, G.A.u), rot = Math.atan2(up[0], -up[1]) / RAD;
      for (const [L] of LADOS) {
        const o = G.olho[L];
        const esc = P.olhosEsc;
        poe(R.globo[L], `translate(${n(o.x)},${n(o.y)}) rotate(${n(rot)}) scale(${n3(esc)})`);
        // para onde olha: um ponto do ecrã (com profundidade para a frente) ou para quem vê
        let g;
        if (olhar.foco) {
          const f = olhar.foco();
          g = vn(vd([(f[0] - c.X) / c.k, -(f[1] - c.Y) / c.k, 260], o.w));
        } else g = vn([olhar.vagar[0], olhar.vagar[1], 1]);
        const dn = vp(g, o.N);
        if (dn < .35) g = vn(vs(g, vk(o.N, .35 - dn)));
        const off = pd(c, vk(g, RE * .5)), fs = Math.max(.4, vp(g, VISTA));
        const ang = Math.atan2(off[1], off[0]) / RAD;
        // a rotação do globo também roda o deslocamento: desfaz
        const a2 = (ang - rot) * RAD, ol = Math.hypot(off[0], off[1]) / esc;
        poe(R.iris[L], `translate(${n(Math.cos(a2) * ol)},${n(Math.sin(a2) * ol)}) rotate(${n(ang - rot)}) scale(${n3(fs)},1)`);
        atr(R.pupila[L], 'r', n(RI * .6 * P.pupila));
        const p = palpebras(limita(Math.max(pisca.v, P.fecho), 0, 1), P.feliz);
        atr(R.palpS[L], 'd', p.sup); atr(R.orla[L], 'd', p.orla); atr(R.palpI[L], 'd', p.inf); atr(R.orlaI[L], 'd', p.orlaI);
      }
    }
    function atualizarPiscar(dt) {
      pisca.t += dt;
      if (pisca.t > pisca.prox) {
        const u = (pisca.t - pisca.prox) / 170;
        pisca.v = sino(u);
        if (u >= 1) {
          pisca.v = 0; pisca.t = 0;
          if (!pisca.duplo && Math.random() < .25) { pisca.duplo = true; pisca.prox = 120; } else { pisca.duplo = false; pisca.prox = aleat(2000, 6000); }
        }
      }
      olhar.tVagar -= dt;
      if (olhar.tVagar < 0) { olhar.tVagar = aleat(900, 2600); olhar.alvoV = Math.random() < .5 ? [0, 0] : [aleat(-.35, .35), aleat(-.2, .25)]; }
      if (olhar.alvoV) for (let i = 0; i < 2; i++) olhar.vagar[i] += (olhar.alvoV[i] - olhar.vagar[i]) * (1 - Math.exp(-dt / 90));
    }

    /* --- anémona: cada tentáculo é um tubo que afina, com a ponta redonda; balança com a corrente,
           afasta-se do peixe quando ele chega e depois abraça-o --- */
    function desenharAnemona() {
      const t = tempo / 1000, fx = P.x - 20, fy = P.y;
      TENT.forEach((te, i) => {
        const rr = R.tent[i];
        const dx = te.bx - fx, dy = te.by - (fy + 40);
        const inf = Math.exp(-(dx * dx) / (175 * 175) - (dy * dy) / (150 * 150));
        const lado = limita(dx / 90, -1, 1);
        let empurra = anem.part * inf * lado * 46 - anem.abraco * inf * lado * 16 + anem.mexe * inf * lado * 22;
        if (!te.tras && anem.cara > 0 && G) {                 // deixa a cara à vista (olho e boca)
          const cx = G.olho.E.x * .5 + G.nariz[0] * .5, cy = G.olho.E.y * .5 + G.nariz[1] * .5;
          const ddx = te.bx + Math.sin(te.a0 * RAD) * te.L * .6 - cx, ddy = te.by - te.L * .6 - cy;
          const ki = Math.exp(-(ddx * ddx + ddy * ddy) / (95 * 95));
          empurra += anem.cara * ki * (ddx < 0 ? -1 : 1) * 38;
        }
        const enc = 1 - .2 * anem.part * inf;
        let x = te.bx, y = te.by;
        const L = te.L * enc, seg = L / 5;
        const pts = [[x, y]];
        let ang = 0;
        for (let j = 1; j <= 5; j++) {
          const s = j / 5;
          ang = te.a0 + empurra * (.4 + .6 * s) + (6 + 6 * s) * Math.sin(t * te.f * 1.3 + te.ph - s * 2.1) * calma + 5 * Math.sin(t * .45 + te.bx * .004) * s * calma
            + anem.abraco * inf * 10 * Math.sin(t * 1.6 + te.ph) * s;
          x += Math.sin(ang * RAD) * seg; y -= Math.cos(ang * RAD) * seg * (te.tras ? 1 : .92);
          pts.push([x, y]);
        }
        const esq = [], dir = [];
        for (let j = 0; j <= 5; j++) {
          const a = pts[Math.max(0, j - 1)], b = pts[Math.min(5, j + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
          const w = te.w * (1 - .32 * j / 5) * .5 * (j === 0 ? 1.15 : 1);
          esq.push([pts[j][0] - ty / l * w, pts[j][1] + tx / l * w]); dir.push([pts[j][0] + ty / l * w, pts[j][1] - tx / l * w]);
        }
        const u = pts[5], a4 = pts[4], tx = u[0] - a4[0], ty = u[1] - a4[1], l = Math.hypot(tx, ty) || 1;
        atr(rr.c, 'd', liso(esq.concat([[u[0] + tx / l * te.w * .3, u[1] + ty / l * te.w * .3]], dir.reverse())) + 'Z');
        atr(rr.l, 'd', liso(pts.slice(1, 5).map((p, j) => [p[0] - te.w * .18, p[1] - te.w * .05])));
        const pr = te.w * .62;
        poe(rr.p, `translate(${n(u[0] + tx / l * pr * .5)},${n(u[1] + ty / l * pr * .5)}) rotate(${n(ang)}) scale(${n(pr)},${n(pr * 1.18)})`);
      });
    }

    /* --- cenário vivo --- */
    const cardume = { x: 1250, y: 300, dir: -1, esc: [], t: 0 };
    CARDUME.forEach(() => cardume.esc.push(-1));
    const bolhasS = Array.from({ length: 8 }, (_, i) => ({ y: 806 - i * 100, ph: i * 1.3, r: 4 + (i % 4) * 2 }));
    const plancto = PLANCTO.map(p => ({ x: p[0], y: p[1], ph: p[3], vivo: true, t: 0 }));
    const KELP = [[40, 910, 640, 34, 0], [100, 920, 520, 30, 1.2], [160, 915, 380, 26, 2.1], [1500, 912, 300, 26, .6], [1560, 916, 380, 30, 1.7]];
    function animarCena(dt) {
      const t = tempo / 1000;
      poe(R.sup, `translate(${n(-((t * 18 * calma) % 100))},0)`);
      R.raios.forEach((r, i) => { atr(r, 'opacity', n3((.45 + .35 * Math.sin(t * (.25 + i * .04) + i * 1.7)) * (i % 2 ? .7 : 1))); poe(r, `rotate(${n3(1.4 * Math.sin(t * .2 + i) * calma)},${150 + i * 210},0)`); });
      poe(R.caust[0], `translate(${n(22 * Math.sin(t * .31) * calma)},${n(6 * Math.sin(t * .23))})`);
      poe(R.caust[1], `translate(${n(-26 * Math.sin(t * .27 + 1) * calma)},${n(-5 * Math.cos(t * .21))})`);
      R.algasL.forEach((a, i) => poe(a, `translate(${[90, 690, 1180, 1530, 330][i]},${[640, 660, 650, 640, 650][i]}) rotate(${n3(3 * Math.sin(t * .5 + i * 1.3) * calma)})`));
      R.ervas.forEach((a, i) => poe(a, `rotate(${n3(2.5 * Math.sin(t * .8 + i * 2) * calma)},${[620, 760, 1215, 150][i]},720)`));
      poe(R.gorgonia, `translate(1296,764) rotate(${n3(2.2 * Math.sin(t * .55) * calma)}) skewX(${n3(2 * Math.sin(t * .55 + .6) * calma)})`);
      // cardume ao longe: vai e vem, e vira-se todo junto (cada peixinho com um pequeno atraso)
      cardume.x += cardume.dir * 26 * dt / 1000 * calma;
      if (cardume.x < 160) cardume.dir = 1; if (cardume.x > 1440) cardume.dir = -1;
      cardume.y = 300 + 40 * Math.sin(t * .17) + 20 * Math.sin(t * .41);
      poe(R.cardume, `translate(${n(cardume.x)},${n(cardume.y)})`);
      CARDUME.forEach((c, i) => {
        const atraso = (c[0] * cardume.dir + 85) / 170;
        cardume.esc[i] += (cardume.dir - cardume.esc[i]) * (1 - Math.exp(-dt / (220 + atraso * 500)));
        const e = cardume.esc[i];
        poe(R.pc[i], `translate(${n(c[0] + 8 * Math.sin(t * .9 + c[3]))},${n(c[1] + 6 * Math.sin(t * 1.1 + c[3]))})`);
        poe(R.pci[i], `scale(${n3(e)},1) rotate(${n(3 * Math.sin(t * 6 + c[3]))})`);
      });
      // bolhas de um respiradouro na areia
      bolhasS.forEach((b, i) => {
        b.y -= (60 + b.r * 6) * dt / 1000;
        if (b.y < 40) { b.y = 806; b.r = 3 + Math.random() * 6; }
        const x = 1392 + 10 * Math.sin(b.y / 40 + b.ph) + (806 - b.y) * .05, k = b.r * (1 + (806 - b.y) / 1600);
        poe(R.bs[i], `translate(${n(x)},${n(b.y)}) scale(${n(k)},${n(k * (.92 + .08 * Math.sin(t * 9 + i)))})`);
      });
      // plâncton a flutuar
      plancto.forEach((p, i) => {
        if (!p.vivo) { p.t += dt; if (p.t > 4000) { p.vivo = true; p.x = Math.random() * 1600; p.y = 80 + Math.random() * 700; atr(R.pl[i], 'display', 'inline'); } return; }
        p.x += (6 + 4 * Math.sin(t * .3 + p.ph)) * dt / 1000 * calma; p.y += 3 * Math.sin(t * .5 + p.ph) * dt / 1000;
        if (p.x > 1620) p.x = -20;
        poe(R.pl[i], `translate(${n(p.x + 5 * Math.sin(t * .7 + p.ph))},${n(p.y)})`);
      });
      // sargaços e algas da frente: fitas com bordos ondulados
      KELP.forEach(([bx, by, h, w, ph], i) => {
        const pts = [], N = 9;
        for (let j = 0; j <= N; j++) {
          const s = j / N, sw = (14 * s + 26 * s * s) * Math.sin(t * .7 + ph - s * 1.8) * calma;
          pts.push([bx + sw + (i < 3 ? 30 : -24) * s * s, by - h * s]);
        }
        const esq = [], dir = [];
        pts.forEach((p, j) => {
          const s = j / N, ww = w * (.35 + .65 * Math.sin(PI * Math.min(1, s * 1.15 + .08))) * (1 + .12 * Math.sin(j * 2.3 + t * 1.2));
          esq.push([p[0] - ww * .5, p[1]]); dir.push([p[0] + ww * .5, p[1]]);
        });
        atr(R.kelp[i], 'd', liso(esq.concat(dir.reverse()), true));
        atr(R.kelpN[i], 'd', liso(pts.slice(0, N)));
      });
    }

    /* --- bolhas do peixe (som, reação, comportamentos): sobem a abanar, crescem e rebentam --- */
    const bolhas = R.bolhas.map(el => ({ el, vivo: false }));
    const pops = R.pops.map(el => ({ el, t: 1, x: 0, y: 0, r: 0 }));
    function bolha(x, y, r, o = {}) {
      const b = bolhas.find(b => !b.vivo) || bolhas[0];
      Object.assign(b, { vivo: true, x, y, r0: r, r, t: 0, vida: o.vida || aleat(1400, 2200), vy: o.vy || aleat(70, 110), vx: o.vx || 0, ph: Math.random() * 6.28, cresce: o.cresce == null ? .6 : o.cresce });
      atr(b.el, 'display', 'inline');
      return b;
    }
    function rebentar(b) {
      b.vivo = false; atr(b.el, 'display', 'none');
      const p = pops.find(p => p.t >= 1) || pops[0];
      Object.assign(p, { t: 0, x: b.x, y: b.y, r: b.r });
      atr(p.el, 'display', 'inline');
    }
    function atualizarBolhas(dt) {
      const s = dt / 1000;
      for (const b of bolhas) {
        if (!b.vivo) continue;
        b.t += dt;
        const u = b.t / b.vida;
        b.vx *= Math.exp(-dt / 300);
        b.x += (b.vx + 22 * Math.cos(b.t / 170 + b.ph)) * s; b.y -= b.vy * s * Math.min(1, b.t / 200 + .3);
        b.r = b.r0 * (1 + b.cresce * u);
        const w = 1 + .1 * Math.sin(b.t / 60 + b.ph);
        poe(b.el, `translate(${n(b.x)},${n(b.y)}) scale(${n(b.r * w)},${n(b.r / w)})`);
        if (u >= 1 || b.y < 30) rebentar(b);
      }
      for (const p of pops) {
        if (p.t >= 1) continue;
        p.t = Math.min(1, p.t + dt / 220);
        poe(p.el, `translate(${n(p.x)},${n(p.y)}) scale(${n(p.r * (1 + .9 * esai(p.t)))})`);
        atr(p.el, 'opacity', n3(1 - p.t)); atr(p.el, 'stroke-width', n3(2.2 / (p.r * (1 + .9 * p.t)) * 6));
        if (p.t >= 1) atr(p.el, 'display', 'none');
      }
    }
    const boca = () => G ? G.nariz : [P.x + 90, P.y];

    /* --- tarefas: geradores que avançam com o dt do relógio (uma por faixa; lançar outra na mesma faixa substitui) --- */
    const faixas = new Map();
    function lancar(nome, gen, fim) { if (!vivo) return; faixas.set(nome, { g: gen, fim }); avancar(nome, 0); }
    function avancar(nome, dt) {
      const f = faixas.get(nome); if (!f) return;
      let r;
      try { r = f.g.next(dt); } catch (e) { if (faixas.get(nome) === f) faixas.delete(nome); console.error(e); return; }
      if (r.done && faixas.get(nome) === f) { faixas.delete(nome); if (f.fim) f.fim(); }
    }
    function* espera(ms) { let t = 0; while (t < ms) t += yield; }
    function* durante(ms, f) { let t = 0; for (;;) { const u = ms > 0 ? Math.min(1, t / ms) : 1; f(u, t); if (u >= 1) return; t += yield; } }
    function* tw(alvo, ms, ease = eio, obj = P) {
      const ini = {}; for (const k in alvo) ini[k] = obj[k];
      yield* durante(ms, u => { const e = ease(u); for (const k in alvo) obj[k] = ini[k] + (alvo[k] - ini[k]) * e; });
    }
    function* juntos(...gs) { let dt = 0, vivas = gs; for (;;) { vivas = vivas.filter(g => !g.next(dt).done); if (!vivas.length) return; dt = yield; } }

    /* --- nadar por um caminho: o corpo aponta para onde vai (vira-se de verdade, passando de frente),
           a cauda bate mais depressa quando vai rápido, o nariz sobe e desce com o caminho --- */
    const PSI_D = 24, PSI_E = 156;
    function* nadar(o) {
      const pts = [[P.x, P.y], ...o.pts];
      const ms = o.ms, forca = o.nado == null ? 1 : o.nado, ease = o.ease || eio;
      let px = P.x, py = P.y;
      yield* durante(ms, (u, t) => {
        const [x, y] = catmull(pts, ease(u));
        const dtv = Math.max(1, t - (P._tPrev || 0)); P._tPrev = t;
        const vx = (x - px) / dtv * 1000, vy = (y - py) / dtv * 1000; px = x; py = y;
        P.x = x; P.y = y;
        const vel = Math.hypot(vx, vy), k = 1 - Math.exp(-dtUlt / 150);
        let alvo = P.psi;
        if (Math.abs(vx) > 40) alvo = vx > 0 ? PSI_D : PSI_E;
        if (o.psi != null && u > (o.virarEm || .78)) alvo = o.psi;
        const psi0 = P.psi;
        P.psi += (alvo - P.psi) * k;
        P.curva += (limita(-(P.psi - psi0) / Math.max(1, dtUlt) * 6, -1, 1) - P.curva) * (1 - Math.exp(-dtUlt / 90));
        const pa = vel > 30 ? limita(Math.atan2(-vy, Math.abs(vx)) / RAD * .55, -32, 32) * (P.psi > 90 ? 1 : 1) : (o.pit || 0);
        P.pit += (pa - P.pit) * (1 - Math.exp(-dtUlt / 200));
        P.nado = limita(forca * Math.min(1, vel / 420) + .15 * forca, 0, 1);
        P.flut = 1 - P.nado;
        if (o.cada) o.cada(u);
      });
      P._tPrev = 0;
    }
    function* virar(psi, ms, o = {}) {
      const p0 = P.psi;
      yield* durante(ms, u => {
        const e = eio(u), ant = P.psi;
        P.psi = lerp(p0, psi, e);
        P.curva = limita(-(P.psi - ant) / Math.max(1, dtUlt) * 6, -1, 1);
        P.nado = .35 * sino(u) + (o.nado || 0);
        P.x += (o.dx || 0) * dtUlt / ms; P.y += (o.dy || 0) * dtUlt / ms;
      });
      P.curva = 0;
    }
    // limpa o que um comportamento interrompido possa ter deixado (anel de bolhas, olhar preso)
    function limpar() { atr(R.anel, 'display', 'none'); focar(null); P.agita = 0; }
    // volta direitinho ao sítio de pairar, com a cara neutra
    function* recompor() {
      limpar();
      P.psi = ((P.psi % 360) + 360) % 360; if (P.psi > 270) P.psi -= 360;
      const longe = Math.hypot(P.x - REPOUSO.x, P.y - REPOUSO.y);
      if (longe > 8) {
        const meio = [(P.x + REPOUSO.x) / 2, (P.y + REPOUSO.y) / 2 - Math.min(60, longe * .25)];
        yield* nadar({ pts: [meio, [REPOUSO.x, REPOUSO.y]], ms: limita(longe * 4, 600, 1500), nado: .6, psi: REPOUSO.psi });
      }
      const alvo = Object.assign({ psi: REPOUSO.psi, pit: 0, rol: 0, sq: 0, nado: 0, agita: 0, curva: 0, remar: 0, flut: 1, x: REPOUSO.x, y: REPOUSO.y }, ROSTO);
      let ha = false; for (const k in alvo) if (Math.abs(P[k] - alvo[k]) > .01) ha = true;
      if (ha) yield* tw(alvo, 420);
    }
    function* arrumar(ms) {
      const alvo = Object.assign({ rol: 0, sq: 0, agita: 0, remar: 0, curva: 0 }, ROSTO);
      yield* tw(alvo, ms);
    }

    /* --- comportamentos (fora, a pairar em água aberta) --- */
    function* dardo() {                              // arranque rápido e travagem com as barbatanas abertas
      const dir = Math.random() < .6 ? 1 : -1;
      if (dir < 0) yield* virar(PSI_E, 520);
      yield* tw({ x: P.x - dir * 14, sq: .08, crista: .6, pAng: 0 }, 220, eio);
      yield* nadar({ pts: [[P.x + dir * 90, P.y - 18], [P.x + dir * 170, P.y - 6]], ms: 480, nado: 1, ease: esai });
      yield* juntos(tw({ remar: 1, crista: 1, sq: -.04, nado: 0, flut: 1 }, 260, esai), tw({ x: P.x + dir * 22 }, 380, esai));
      yield* espera(500);
      yield* tw({ remar: 0, crista: 0, sq: 0 }, 400);
      yield* espera(300);
    }
    function* mordiscar() {                          // um pedacinho de plâncton passa: segue-o com os olhos, vai lá e abocanha
      const i = plancto.findIndex(p => p.vivo), p = plancto[i];
      const dir = Math.random() < .5 ? 1 : -1;
      p.x = REPOUSO.x + dir * 250; p.y = REPOUSO.y - aleat(40, 110);
      focar(() => [p.x, p.y]);
      yield* tw({ pupila: 1.2, olhosEsc: 1.06 }, 300);
      yield* espera(700);
      if (dir < 0) yield* virar(PSI_E, 500);
      const off = () => [G.nariz[0] - P.x, G.nariz[1] - P.y];
      const o = off();
      yield* nadar({ pts: [[p.x - o[0] - dir * 40, p.y - o[1] + 10], [p.x - o[0] - dir * 8, p.y - o[1]]], ms: 900, nado: .7 });
      yield* tw({ boca: 1, crista: .5 }, 90, esai);
      p.vivo = false; p.t = 0; atr(R.pl[i], 'display', 'none');
      yield* tw({ boca: 0 }, 110, eentra);
      focar(null);
      for (let k = 0; k < 2; k++) { yield* tw({ boca: .35 }, 120); yield* tw({ boca: 0 }, 130); }
      yield* tw({ feliz: .7, sorriso: 1, crista: 0 }, 260);
      yield* espera(500);
      yield* tw({ feliz: 0, sorriso: ROSTO.sorriso, pupila: 1, olhosEsc: 1 }, 300);
    }
    function* olharCrianca() {                       // vira-se de frente para quem está a ver e acena com as barbatanas
      yield* virar(90, 650);
      olhar.alvoV = [0, 0]; olhar.tVagar = 3000;
      yield* tw({ olhosEsc: 1.1, sorriso: 1, feliz: .25, remar: 1, crista: .6 }, 300);
      yield* durante(1600, u => { P.rol = 8 * Math.sin(u * PI * 4) * sino(u); });
      yield* tw({ feliz: 0, remar: 0, olhosEsc: 1, crista: 0, sorriso: ROSTO.sorriso }, 300);
      yield* virar(REPOUSO.psi, 650);
    }
    function* cambalhota() {                         // uma volta completa no sítio (looping)
      const cx = P.x + 10, cy = P.y - 80, Rr = 80;
      yield* tw({ sq: .07, crista: .7 }, 180);
      yield* durante(1500, u => {
        const th = eio(u) * 2 * PI;
        P.x = cx + Rr * Math.sin(th); P.y = cy + Rr * Math.cos(th);
        P.pit = th / RAD; P.nado = .9 * sino(u) + .1; P.flut = 0; P.sq = 0;
      });
      P.pit = 0;
      yield* tw({ feliz: .6, crista: 0, nado: 0, flut: 1 }, 260);
      yield* espera(400);
      yield* tw({ feliz: 0 }, 300);
    }
    function* anelDeBolhas() {                       // enche as bochechas e sopra um anel de bolhas
      yield* tw({ infla: 1, boca: 0, sorriso: 0, olhosEsc: 1.08 }, 500, eio);
      yield* espera(250);
      const b0 = boca().slice();
      atr(R.anel, 'display', 'inline');
      let ax = b0[0], ay = b0[1];
      const dirx = Math.cos(P.psi * RAD);
      focar(() => [ax, ay]);
      yield* juntos(tw({ infla: 0, boca: .55 }, 160, esai), durante(2600, u => {
        ax = b0[0] + dirx * 120 * esai(Math.min(1, u * 2)) + 10 * Math.sin(u * 9); ay = b0[1] - 260 * u;
        const r = 8 + 46 * esai(u);
        poe(R.anel, `translate(${n(ax)},${n(ay)}) rotate(${n(6 * Math.sin(u * 12))}) scale(${n(r)},${n(r * .32)})`);
        atr(R.anel, 'opacity', n3(Math.min(1, u * 8) * (1 - eentra(u))));
      }), (function* () { yield* espera(200); yield* tw({ boca: 0, feliz: .6, sorriso: 1 }, 300); })());
      atr(R.anel, 'display', 'none');
      focar(null);
      yield* tw({ feliz: 0, sorriso: ROSTO.sorriso, olhosEsc: 1 }, 300);
    }
    function* perseguirBolha() {                     // uma bolhinha sobe da areia: vai atrás dela e rebenta-a com o nariz
      const b = bolha(REPOUSO.x + aleat(-140, 160), 740, 10, { vy: 60, vida: 9000, cresce: .3 });
      focar(() => [b.x, b.y]);
      yield* tw({ pupila: 1.2, olhosEsc: 1.08, crista: .5 }, 300);
      yield* durante(1500, () => { P.pit += (limita((P.y - b.y) / 8, -25, 25) - P.pit) * .05; });
      const off = () => [G.nariz[0] - P.x, G.nariz[1] - P.y];
      if ((b.x - P.x) * Math.cos(P.psi * RAD) < 0) yield* virar(b.x < P.x ? PSI_E : PSI_D, 450);
      let t = 0;
      while (b.vivo && t < 2500) {
        const dt = yield; t += dt;
        const o = off(), tx = b.x - o[0], ty = b.y - o[1] - 4, k = 1 - Math.exp(-dt / 260);
        const vx = (tx - P.x) * k;
        P.x += vx; P.y += (ty - P.y) * k; P.nado = limita(Math.abs(vx) / 6, .2, 1); P.flut = 0;
        P.pit += (limita((P.y - ty) / 3, -30, 30) - P.pit) * .1;
        if (Math.hypot(G.nariz[0] - b.x, G.nariz[1] - b.y) < b.r + 6) break;
      }
      if (b.vivo) rebentar(b);
      focar(null);
      yield* juntos(tw({ olhosEsc: 1.2, crista: 1, boca: .3, nado: 0, flut: 1 }, 80, esai));
      pisca.prox = 0; pisca.t = 1;
      yield* espera(300);
      yield* tw({ olhosEsc: 1, crista: 0, boca: 0, feliz: .5, pupila: 1 }, 300);
      yield* espera(300);
      yield* tw({ feliz: 0 }, 250);
    }
    function* abanar() {                             // abana-se todo, contente
      yield* tw({ crista: .8, feliz: .5 }, 200);
      yield* durante(900, u => { P.agita = .9 * sino(u); P.rol = 10 * Math.sin(u * PI * 6) * sino(u); P.y = REPOUSO.y - 10 * sino(u); });
      P.agita = 0; P.rol = 0;
      bolha(boca()[0], boca()[1] - 4, 5, { vx: 40 * Math.cos(P.psi * RAD) });
      yield* tw({ crista: 0, feliz: 0 }, 300);
    }
    const COMPORTAMENTOS = { dardo, mordiscar, olharCrianca, cambalhota, anelDeBolhas, perseguirBolha, abanar };
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

    /* --- dentro da anémona: respira, olha à volta, aconchega-se, boceja, deita uma bolhinha --- */
    function* cicloDentro() {
      for (;;) {
        yield* espera(aleat(1600, 3000));
        const r = Math.random();
        if (r < .25) {                                  // olha à volta
          const alvos = [() => [500, 380], () => [cardume.x, cardume.y], () => [700, 820], () => [1380, 300]];
          for (let i = 0; i < 2; i++) { focar(escolhe(alvos)); yield* espera(aleat(700, 1100)); }
          focar(null);
        } else if (r < .45) {                           // aconchega-se: abana-se e os tentáculos fazem-lhe festas
          anem.vMexe += 2.2;
          yield* durante(800, u => { P.agita = .5 * sino(u); P.y = DENTRO.y + 6 * sino(u); });
          P.agita = 0;
          yield* tw({ feliz: .7 }, 250); yield* espera(500); yield* tw({ feliz: .3 }, 300);
        } else if (r < .62) {                           // bocejo
          yield* tw({ boca: 1.1, fecho: .55, crista: .8, pit: DENTRO.pit + 6 }, 700, eio);
          yield* espera(400);
          yield* tw({ boca: 0, fecho: 0, crista: 0, pit: DENTRO.pit }, 500, eio);
        } else if (r < .8) {                            // bolhinha
          yield* tw({ boca: .5 }, 120);
          bolha(boca()[0], boca()[1], 5, { vx: -30 });
          yield* tw({ boca: 0 }, 160);
          focar(() => { const b = bolhas.find(b => b.vivo); return b ? [b.x, b.y] : [800, 300]; });
          yield* espera(1200); focar(null);
        } else {                                        // piscar lento e contente
          yield* tw({ fecho: .85, feliz: .6 }, 450, eseno); yield* espera(350); yield* tw({ fecho: 0, feliz: .3 }, 450, eseno);
        }
      }
    }

    /* --- ida à anémona: antecipação, nada em arco por cima da anémona, vira-se (passando de frente),
           os tentáculos abrem-se, enfia-se a abanar e os tentáculos fecham-se à volta dele --- */
    function* idaAnemona() {
      modo = 'indo'; reagindo = false; limpar();
      focar(() => [ANEM.x, ANEM.y - 40]);
      yield* juntos(arrumar(160), tw({ pupila: 1.1 }, 160));
      if (P.psi > 90) yield* virar(PSI_D, 380);
      yield* tw({ x: P.x - 12, sq: .07, crista: .7 }, 170, eio);
      const alto = [DENTRO.x + 10, DENTRO.y - 128];
      yield* nadar({ pts: [[P.x + 120, P.y - 70], [lerp(P.x, alto[0], .7), alto[1] - 70], alto], ms: 1250, nado: 1, psi: 90, virarEm: .7,
        cada: u => { anem.part = limita((u - .45) / .4, 0, 1); } });
      focar(null);
      yield* juntos(virar(DENTRO.psi, 480, { dy: 18, nado: .2 }), tw({ sq: 0, crista: .4 }, 300));
      dentro = true; R.slotDentro.appendChild(R.peixe);
      yield* juntos(durante(820, u => { P.agita = .55 * sino(u); }), tw({ x: DENTRO.x, y: DENTRO.y, pit: DENTRO.pit, flut: .4, nado: 0 }, 820, eio),
        (function* () { yield* espera(350); yield* juntos(tw({ part: .25, abraco: 1, cara: 1 }, 600, eio, anem)); })());
      P.agita = 0;
      anem.vMexe += 2.5;
      yield* tw({ feliz: .45, sorriso: 1, crista: 0 }, 260);
      modo = 'dentro';
    }
    /* --- volta: espreita, sai disparado, dá uma volta em arco e regressa ao sítio --- */
    function* voltaAnemona() {
      modo = 'voltando'; reagindo = false; limpar();
      yield* arrumar(140);
      focar(() => [REPOUSO.x, REPOUSO.y]);
      yield* juntos(tw({ y: DENTRO.y - 22, pit: DENTRO.pit + 8, olhosEsc: 1.08 }, 300, eio), tw({ part: 1, abraco: 0, cara: 0 }, 320, eio, anem));
      focar(null);
      let fora = false;
      yield* nadar({ pts: [[DENTRO.x - 50, DENTRO.y - 150], [760, 380], [560, 450], [REPOUSO.x - 30, REPOUSO.y + 6], [REPOUSO.x, REPOUSO.y]], ms: 1900, nado: 1, psi: REPOUSO.psi, virarEm: .86,
        cada: u => {
          if (!fora && P.y < DENTRO.y - 110) { fora = true; dentro = false; R.slotFora.appendChild(R.peixe); }
          anem.part = 1 - limita((u - .2) / .4, 0, 1);
        } });
      if (!fora) { dentro = false; R.slotFora.appendChild(R.peixe); }
      anem.part = 0; anem.vMexe += 1.2;
      yield* tw({ olhosEsc: 1, flut: 1, nado: 0, pit: 0, psi: REPOUSO.psi }, 260);
      modo = 'fora';
    }

    /* --- reação ao toque: olhos grandes, sorriso, crista em pé, bolhas e uma pirueta (em menos de 100 ms) --- */
    function* reacao(noHabitat) {
      reagindo = true; limpar();
      P.psi = ((P.psi % 360) + 360) % 360; if (P.psi > 270) P.psi -= 360;
      const b = boca();
      for (let i = 0; i < 3; i++) bolha(b[0] + aleat(-6, 6), b[1] - i * 6, aleat(4, 8), { vx: aleat(-40, 40), vy: aleat(90, 140) });
      const rosto = tw({ olhosEsc: 1.18, pupila: 1.15, sorriso: 1, boca: .45, crista: 1, feliz: 0, fecho: 0, leque: 1.15 }, 90, esai);
      if (noHabitat) {
        anem.vMexe += 3;
        const y0 = DENTRO.y;
        yield* juntos(rosto, durante(700, u => { P.y = y0 - 34 * sino(u); P.agita = .7 * sino(u); P.rol = 9 * Math.sin(u * PI * 4); }));
        P.agita = 0; P.rol = 0; P.y = y0;
      } else {
        const psi0 = P.psi, y0 = P.y;
        yield* juntos(rosto, durante(620, u => {
          P.psi = psi0 + 360 * eio(limita((u - .08) / .8, 0, 1));
          P.y = y0 - 46 * sino(u); P.sq = -.06 * sino(u); P.nado = .6 * sino(u); P.flut = 0;
        }));
        P.psi = psi0; P.y = y0; P.sq = 0;
        yield* juntos(tw({ feliz: .8, boca: 0, olhosEsc: 1.05, crista: .3, leque: 1 }, 200), durante(500, u => { P.agita = .45 * sino(u); }));
        P.agita = 0;
      }
      yield* espera(250);
      reagindo = false;
      yield* tw(Object.assign({}, ROSTO, { sorriso: noHabitat ? 1 : ROSTO.sorriso, feliz: noHabitat ? .35 : 0, rol: 0, nado: 0, flut: noHabitat ? .4 : 1 }), 400);
    }

    /* --- som: «blub blub». Por sílaba a boca abre-se redonda, sai uma bolha que sobe, cresce e rebenta lá em cima --- */
    function* blub(ms) {
      const b = boca();
      bolha(b[0] + Math.cos(P.psi * RAD) * 10, b[1] - 4, 7, { vy: 120, vida: 1900, cresce: 1.1, vx: Math.cos(P.psi * RAD) * 50 });
      yield* durante(ms, u => {
        const k = u < .3 ? esai(u / .3) : u < .7 ? 1 : 1 - eseno((u - .7) / .3);
        P.somB = k; P.somPit = 6 * k;
      });
      P.somB = 0; P.somPit = 0;
    }
    function* blubSilabas(silabas) {
      let t = 0;
      for (const [a, d] of silabas) {
        if (a > t) yield* espera((a - t) * 1000);
        yield* blub(limita(d * 1000, 140, 1500));
        t = a + d;
      }
    }
    function* blubMs(ms) {
      const nB = limita(Math.round(ms / 550), 1, 5), per = ms / nB;
      for (let i = 0; i < nB; i++) { yield* blub(per * .7); yield* espera(per * .3); }
    }

    /* --- o peixe vê um acontecimento: segue-o com os olhos e inclina-se para ele --- */
    function* observar(ev) {
      focar(ev.pos);
      yield* tw({ pupila: 1.15, olhosEsc: 1.07, crista: .5 }, 260, esai);
      const pit0 = P.pit;
      let t = 0;
      while (ev.vivo && t < 16000) {
        const dt = yield; t += dt;
        const p = ev.pos();
        P.pit += (pit0 + limita((P.y - p[1]) / 25, -12, 12) - P.pit) * (1 - Math.exp(-dt / 400));
      }
      focar(null);
      yield* tw({ pit: pit0, pupila: 1, olhosEsc: 1, crista: 0 }, 400);
    }

    /* --- acontecimentos raros (a cada 15–40 s): tartaruga ao longe, caranguejo na areia, alforreca a subir --- */
    const eventos = { prox: aleat(9000, 14000), ultimo: null };
    function iniciarEvento(tipo) {
      const ev = { tipo, x: -200, y: -200, vivo: true };
      ev.pos = () => [ev.x, ev.y];
      const gen = tipo === 'tartaruga' ? evTartaruga(ev) : tipo === 'caranguejo' ? evCaranguejo(ev) : evAlforreca(ev);
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
      let tipo; do tipo = escolhe(['tartaruga', 'caranguejo', 'alforreca']); while (tipo === eventos.ultimo);
      eventos.ultimo = tipo;
      iniciarEvento(tipo);
    }
    function* evTartaruga(ev) {
      const dir = Math.random() < .5 ? 1 : -1, x0 = dir > 0 ? -160 : 1760, x1 = dir > 0 ? 1760 : -160;
      atr(R.tart, 'display', 'inline');
      yield* durante(17000, (u, t) => {
        ev.x = lerp(x0, x1, u); ev.y = 330 - 30 * Math.sin(u * PI) + 8 * Math.sin(t / 900);
        poe(R.tart, `translate(${n(ev.x)},${n(ev.y)}) scale(${dir * .8},.8) rotate(${n(3 * Math.sin(t / 900 + 1))})`);
        const b = Math.sin(t / 700);
        poe(R.tBarbF, `rotate(${n(-28 * b)},22,10)`); poe(R.tBarbP, `rotate(${n(-22 * b - 6)},16,8)`); poe(R.tBarbT, `rotate(${n(12 * b)},-38,14)`);
      });
      atr(R.tart, 'display', 'none');
    }
    function* evCaranguejo(ev) {
      atr(R.carang, 'display', 'inline');
      const y = 838, xs = 560;
      const anda = function* (xa, xb, ms) {
        yield* durante(ms, (u, t) => {
          ev.x = lerp(xa, xb, eseno(u)); ev.y = y - 30;
          poe(R.carang, `translate(${n(ev.x)},${n(y - 2 * Math.abs(Math.sin(t / 70)))})`);
          R.pernasC.forEach((p, i) => { const s = +p.dataset.s, k = +p.dataset.i; p.setAttribute('transform', `translate(${s * (14 + k * 7)},${4 + k * 2}) rotate(${n(s * 14 * Math.sin(t / 60 + k * 2 + (s > 0 ? 1 : 0)))})`); });
        });
      };
      yield* anda(-60, xs, 4200);
      // pára, levanta as pinças e acena; os olhos espreitam para o peixe
      yield* durante(2400, (u, t) => {
        const a = sino(u) * (20 + 14 * Math.sin(t / 110));
        poe(R.pincaE, `translate(-26,-6) rotate(${n(a)})`); poe(R.pincaD, `translate(26,-6) rotate(${n(-a)})`);
        poe(R.olhosC, `translate(0,${n(-3 * sino(u))})`);
      });
      yield* anda(xs, -80, 4200);
      atr(R.carang, 'display', 'none');
    }
    function* evAlforreca(ev) {
      atr(R.alf, 'display', 'inline');
      const x0 = aleat(1220, 1300);
      yield* durante(15000, (u, t) => {
        const ciclo = (t % 1600) / 1600, puxa = ciclo < .3 ? esai(ciclo / .3) : 1 - eseno((ciclo - .3) / .7);
        ev.x = x0 - 160 * u + 14 * Math.sin(t / 1300); ev.y = 960 - 1100 * u - 20 * puxa;
        const sx = 1 - .16 * puxa, sy = 1 + .14 * puxa;
        poe(R.alf, `translate(${n(ev.x)},${n(ev.y)}) rotate(${n(-8 + 5 * Math.sin(t / 900))}) scale(1.25)`);
        atr(R.alfB, 'd', `M${n(-44 * sx)},0 C${n(-46 * sx)},${n(-58 * sy)} ${n(46 * sx)},${n(-58 * sy)} ${n(44 * sx)},0 Q${n(33 * sx)},9 ${n(22 * sx)},3 Q${n(11 * sx)},10 0,4 Q${n(-11 * sx)},10 ${n(-22 * sx)},3 Q${n(-33 * sx)},9 ${n(-44 * sx)},0Z`);
        atr(R.alfR, 'd', `M${n(-26 * sx)},${n(-30 * sy)} Q${n(-14 * sx)},${n(-44 * sy)} ${n(4 * sx)},${n(-44 * sy)}`);
        let o = '', tt = '';
        for (let k = 0; k < 3; k++) { const bx = (-12 + k * 12) * sx; o += `M${n(bx)},4 q${n(8 * Math.sin(t / 300 + k))},18 ${n(2 * Math.sin(t / 250 + k))},36 q${n(-8 * Math.sin(t / 280 + k))},16 0,30`; }
        for (let k = 0; k < 6; k++) { const bx = (-38 + k * 15) * sx; tt += `M${n(bx)},2 q${n(10 * Math.sin(t / 400 + k))},30 0,${n(60 + 10 * puxa)} t0,${n(60 - 10 * puxa)} t0,50`; }
        atr(R.alfO, 'd', o); atr(R.alfT, 'd', tt);
      });
      atr(R.alf, 'display', 'none');
    }

    /* --- relógio único --- */
    let erroMostrado = false, dtUlt = 16.7;
    function passo(dt) {
      if (!vivo) return;
      try {
        dt = Math.min(dt, 50); dtUlt = dt;
        tempo += dt;
        const s = dt / 1000;
        fase.cauda += s * 2 * PI * (1.0 + 2.4 * P.nado + 3 * P.agita) * (ajudas.reduzido ? .8 : 1);
        fase.peit += s * 2 * PI * (1.7 + 1.3 * P.remar + .6 * P.nado);
        fase.resp += s * 2 * PI * .5;
        fase.ond += s * 2 * PI * .7;
        fase.flut += s * 2 * PI * .16;
        atualizarPiscar(dt);
        for (const nome of Array.from(faixas.keys())) avancar(nome, dt);
        atualizarEventos(dt);
        // a anémona mexe-se como uma mola quando o peixe se aconchega
        anem.vMexe -= anem.mexe * 40 * s; anem.vMexe *= Math.exp(-dt / 500); anem.mexe += anem.vMexe * s * 6;
        animarCena(dt);
        desenharPeixe();
        desenharAnemona();
        atualizarBolhas(dt);
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    lancar('corpo', cicloFora());
    animarCena(0); desenharPeixe(); desenharAnemona();

    return {
      animal: R.peixe,
      habitat: R.habitat,
      reagir() {
        if (!vivo) return;
        if (modo === 'fora') lancar('corpo', reacao(false), () => { reagindo = false; lancar('corpo', cicloFora()); });
        else if (modo === 'dentro') lancar('corpo', reacao(true), () => { reagindo = false; lancar('corpo', cicloDentro()); });
        else P.olhosEsc = 1.1;
      },
      fazerSom(ms, silabas) {        // silabas = [[início s, duração s], …] medidas no som da app (ferramentas/limpar-voz.js)
        if (!vivo) return;
        const fim = () => { P.somB = 0; P.somPit = 0; };
        if (Array.isArray(silabas) && silabas.length) lancar('boca', blubSilabas(silabas), fim);
        else lancar('boca', blubMs(limita(ms || 900, 300, 3500)), fim);
      },
      irAoHabitat() {
        return new Promise(res => {
          if (!vivo || modo !== 'fora') { res(); return; }
          lancar('corpo', idaAnemona(), () => { res(); lancar('corpo', cicloDentro()); });
        });
      },
      voltar() {
        return new Promise(res => {
          if (!vivo || modo !== 'dentro') { res(); return; }
          lancar('corpo', voltaAnemona(), () => { res(); lancar('corpo', cicloFora()); });
        });
      },
      destruir() {
        vivo = false;
        faixas.clear();
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola (modo de desenvolvimento)
      _teste: { P, anem, modo: () => modo, G: () => G, evento: iniciarEvento, bolha,
        comportamento: nome => lancar('corpo', COMPORTAMENTOS[nome](), () => lancar('corpo', cicloFora())),
        parar: () => lancar('corpo', (function* () { for (;;) yield; })()) }
    };
  }

  return { icone: iconeSVG(), montar };
})();
