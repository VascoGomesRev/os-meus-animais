/* Galo — «Os Meus Animais». Contrato e regras: REGRAS-ANIMAIS.md.
   Cena: o quintal de uma casa de aldeia do Minho ao amanhecer, com o sol a nascer atrás da serra (luz de cima à esquerda):
   céu rosa e laranja, casa de granito com janelas verdes e sardinheiras, alpendre com parreira, espigueiro, carro de bois,
   horta com couves e regador, muro de pedra, girassóis, galinhas e pintainhos ao longe.
   Habitat: o poleiro em frente à capoeira de madeira. O galo vai a andar com passos de galo (a cabeça avança e recua, a pata
   levanta-se dobrada), agacha-se, bate as asas e esvoaça para o poleiro; agarra o pau com os dedos e o pau baixa ao aterrar.
   Camadas: capoeira e poleiro → galo → paliçada da frente (ripa de cima, estacas e postes com a corda).
   O galo é um boneco «2,5D» feito de elipsoides (corpo, peito, pescoço, cabeça…) projetados no ecrã a cada quadro; a crista,
   as barbelas, o bico, as asas, a cauda de foices e os pés são peças planas postas no espaço com uma matriz afim.
   Organização:
     1) utilidades (matemática, vetores, projeção, IK, peças planas)
     2) geometria do galo (pose → elipses e matrizes no ecrã)
     3) desenho do galo (SVG das peças) e ícone do menu
     4) cenário (céu, serra, casa, alpendre, espigueiro, carro de bois, horta, capoeira, poleiro, paliçada, bichos)
     5) montar(): passos de galo por distância, salto para o poleiro, comportamentos, cantar, relógio único */
'use strict';
MODULOS.galo = (() => {
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

  // câmara ortogonal ligeiramente de cima (18°). Um ponto do chão (altura 0) à profundidade z aparece no ecrã em y = z·sen18°;
  // a posição do galo guarda-se como (x, gy = y do chão no ecrã, y = altura acima desse chão).
  const ELEV = 18 * RAD, cE = Math.cos(ELEV), sE = Math.sin(ELEV);
  const VISTA = [0, sE, cE];
  const prof = w => w[1] * sE + w[2] * cE;                  // profundidade (maior = mais perto)
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
  // referenciais: origem + eixos f (frente), u (cima), s (lado direito do galo)
  const ref = (o, f, u, s) => ({ o, f, u, s });
  const ponto = (R, a, b, c) => [R.o[0] + R.f[0] * a + R.u[0] * b + R.s[0] * c, R.o[1] + R.f[1] * a + R.u[1] * b + R.s[1] * c, R.o[2] + R.f[2] * a + R.u[2] * b + R.s[2] * c];
  const direcao = (R, a, b, c) => [R.f[0] * a + R.u[0] * b + R.s[0] * c, R.f[1] * a + R.u[1] * b + R.s[1] * c, R.f[2] * a + R.u[2] * b + R.s[2] * c];
  // roda os eixos de R (yaw: para o lado direito; pitch: bico para cima; roll: o «cima» deita-se para o lado direito)
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
  // peça plana (asa, crista, cauda, pé): desenhada em coordenadas locais (x, y) e posta no espaço com os eixos ex e ey.
  // A projeção ortogonal de um plano é uma matriz afim; largura mínima para nunca ficar um risco.
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
  // folha pontiaguda no ecrã (pena do pescoço): da base b até à ponta t, com meia largura w
  function folha(b, t, w) {
    const dx = t[0] - b[0], dy = t[1] - b[1], L = Math.hypot(dx, dy) || 1, px = -dy / L * w, py = dx / L * w;
    const mx = b[0] + dx * .42, my = b[1] + dy * .42;
    return `M${n(b[0] - px * .7)},${n(b[1] - py * .7)}Q${n(mx - px * 1.25)},${n(my - py * 1.25)} ${n(t[0])},${n(t[1])}Q${n(mx + px * 1.25)},${n(my + py * 1.25)} ${n(b[0] + px * .7)},${n(b[1] + py * .7)}Z`;
  }
  // pena em foice (cauda): curva cúbica com largura que cresce e afina até à ponta
  function foice(p0, p1, p2b, p3, w0) {
    const pt = t => { const a = 1 - t; return [a * a * a * p0[0] + 3 * a * a * t * p1[0] + 3 * a * t * t * p2b[0] + t * t * t * p3[0], a * a * a * p0[1] + 3 * a * a * t * p1[1] + 3 * a * t * t * p2b[1] + t * t * t * p3[1]]; };
    const E = [], D = [], M = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16, p = pt(t), q = pt(Math.min(1, t + .01)), r = pt(Math.max(0, t - .01));
      const dx = q[0] - r[0], dy = q[1] - r[1], L = Math.hypot(dx, dy) || 1;
      const w = w0 * Math.pow(Math.sin(PI * (.12 + .88 * t)), .8) * (t > .9 ? (1 - t) * 10 * .9 + .1 : 1) * (.55 + .45 * Math.min(1, t * 4));
      E.push([p[0] - dy / L * w, p[1] + dx / L * w]); D.push([p[0] + dy / L * w, p[1] - dx / L * w]); M.push(p);
    }
    const cont = E.concat(D.reverse());
    return { d: 'M' + cont.map(p => n(p[0]) + ',' + n(p[1])).join('L') + 'Z', meio: liso(M.slice(1, 14)) };
  }

  /* ================= 2) Geometria do galo ================= */
  const COR = { cont: '#4A2416', contA: '#8A5A12', contV: '#7A1410', contO: '#3A2214', contC: '#0E1A16' };
  const RO = 12.5;                                          // raio do olho
  const SL = 40, ABERTO = 20;                               // comprimento do passo e meia distância entre os pés
  const LADOS = [['E', -1], ['D', 1]];                      // E = lado esquerdo do galo (s < 0), D = direito
  // pose base de pé: cF/cH/cP/cR = corpo (frente, altura, inclinação, balanço), hx/hy/hz = cabeça em relação à base do pescoço,
  // hY/hP/hR = rodar a cabeça, cY/cU = cauda (para o lado, para cima), a?/bat? = asas (abertura, batida)
  const BASE = { cF: 0, cH: 150, cP: 20, cR: 0, hx: 30, hy: 104, hz: 0, hY: 0, hP: -2, hR: 0, cY: 0, cU: 0, aE: 0, aD: 0, batE: 30, batD: 30, puff: 0, sq: 0 };
  const POLEIRO = Object.assign({}, BASE, { cH: 122, cP: 12, cU: -26, hx: 26, hy: 98 });   // empoleirado: mais agachado, cauda a cair
  const ROSTO = { abE: 1, abD: 1, feliz: 0, bico: 0, sobr: 0, olhosEsc: 1 };
  const CHAVES = Object.keys(BASE);
  // penas desenhadas à superfície do corpo (pequenas escamas)
  const PENAS = (() => { const v = [], r = semente(41); for (const sg of [-1, 1]) for (const te of [-.42, -.08, .26]) for (let i = 0; i < 4; i++) v.push([sg * (.9 + i * .5 + r() * .14), te + (r() - .5) * .12]); return v; })();
  const PENAS_P = [[0, -.1], [.42, -.26], [-.42, -.26], [.24, .22], [-.24, .22], [0, -.46], [.72, .04], [-.72, .04], [.5, -.6], [-.5, -.6]];
  // cauda: foices (local: x para trás, y para baixo), da de trás para a da frente; fase = atraso da onda
  const FOICES = [
    { p: [[0, 0], [-6, -128], [118, -196], [192, -64]], w: 13, cor: 'url(#galo-foice)', f: .9 },
    { p: [[0, 0], [8, -112], [120, -168], [170, -40]], w: 12, cor: 'url(#galo-foice2)', f: .7 },
    { p: [[0, 0], [26, -92], [104, -128], [142, -26]], w: 12, cor: 'url(#galo-foice)', f: .5 },
    { p: [[0, 0], [30, -60], [86, -96], [118, -54]], w: 14, cor: '#16241F', f: .35 },
    { p: [[0, 0], [40, -38], [102, -52], [126, -6]], w: 12, cor: 'url(#galo-foice2)', f: .25 },
    { p: [[0, 0], [38, -6], [86, -8], [104, 26]], w: 10, cor: 'url(#galo-foice)', f: .15 }
  ].map(o => Object.assign(o, foice(o.p[0], o.p[1], o.p[2], o.p[3], o.w)));

  function franja(c, centro, eixo, raio, N, comp, larg, dirF, vis0, R, sementeF) {
    // penas pontiagudas à volta de um anel (pescoço ou dorso) que caem para trás e para baixo
    let e1 = vx(eixo, [0, 0, 1]); if (vl(e1) < .2) e1 = vx(eixo, [1, 0, 0]); e1 = vn(e1);
    const e2 = vx(eixo, e1);
    let d = '', riscas = '';
    for (let i = 0; i < N; i++) {
      const th = (i + .5) / N * 2 * PI, r = vs(vk(e1, Math.cos(th)), vk(e2, Math.sin(th)));
      if (vp(r, VISTA) < vis0) continue;
      const atras = -vp(r, R.f);                                   // 1 = na nuca, -1 = à frente do pescoço
      if (atras < -.25) continue;                                  // à frente (garganta e peito) não há penas compridas
      const L = comp * (.5 + .5 * limita(.35 + atras * .8, 0, 1)) * (1 + .12 * Math.sin(i * 2.3 + sementeF));
      const base = vs(centro, vk(r, raio));
      const dir = vn(vs(vs(vk(r, .5), vk(R.u, -.7)), vk(R.f, dirF)));
      const tip = vs(base, vk(dir, L));
      const b = p2(c, base), t = p2(c, tip);
      d += folha(b, t, larg);
      riscas += `M${n(lerp(b[0], t[0], .15))},${n(lerp(b[1], t[1], .15))}L${n(lerp(b[0], t[0], .7))},${n(lerp(b[1], t[1], .7))}`;
    }
    return { d, riscas };
  }

  function geometria(P, pes) {
    const can = P.canto || 0;
    const o = [P.x, P.y + P.salto, P.gy / sE];
    const c = { o, Y: P.gy - o[1] * cE, qy: 1 - (P.sq || 0) };
    const h = P.h * RAD, F = [Math.sin(h), 0, Math.cos(h)], U = [0, 1, 0], S = [-Math.cos(h), 0, Math.sin(h)];
    const R0 = ref(o, F, U, S);
    const resp = P._resp || 0, pf = (P.puff || 0) + .6 * can;
    const B = filho(R0, P.cF, P.cH + (P._bob || 0) + 6 * can, P._lado || 0, P.cP + 16 * can + (P._pb || 0), 0, P.cR + (P._rl || 0));
    const G = { c, el: {}, z: {}, R0, B, F, S, olho: {} };
    const axT = [86 * (1 + .03 * pf), 60 * (1 + .015 * resp + .06 * pf), 58 * (1 + .02 * resp + .07 * pf)];
    G.el.tronco = elipR(c, B, [0, 0, 0], axT);
    const cP0 = [50, -10, 0], axP = [44 * (1 + .05 * pf), 50 * (1 + .025 * resp + .12 * pf), 46 * (1 + .025 * resp + .12 * pf)];
    G.el.peito = elipR(c, B, cP0, axP);
    G.peitoFrente = G.el.peito.z > G.el.tronco.z;
    // cauda: tufo escuro na base e um leque de foices numa peça plana (no plano do corpo), que abana com onda
    const T = filho(B, -66, 26, 0, -(P.cU + (P._cu || 0)), P.cY + (P._cw || 0), 0);
    G.el.cauda = elipR(c, T, [2, 4, 0], [30, 24, 22]);
    G.cauda = plano(c, ponto(T, -12, 16, 0), vk(T.f, -1), vk(T.u, -1), .36);
    G.z.cauda = prof(ponto(T, -70, 60, 0)) - 20;
    // pescoço: curva de Bézier da base até à cabeça, feita de 3 elipsoides
    const sh = P.somH || 0;
    const N0 = ponto(B, 52, 30, 0);
    const Hc = vs(N0, direcao(R0, P.hx + (P._hx || 0) - 12 * can + 6 * sh, P.hy + (P._hy || 0) + 16 * can + 5 * sh, P.hz));
    const tb = vn(direcao(B, .3, 1, 0)), Lp = vl(vd(Hc, N0));
    const Cn = vs(N0, vk(tb, Lp * .5));
    const bz = t => vs(vs(vk(N0, (1 - t) * (1 - t)), vk(Cn, 2 * (1 - t) * t)), vk(Hc, t * t));
    const q = [0, .33, .64, .92].map(bz);
    G.el.pesc0 = segm(c, q[0], q[1], 34, 34, 16); G.el.pesc1 = segm(c, q[1], q[2], 29, 29, 16); G.el.pesc2 = segm(c, q[2], q[3], 25, 25, 14);
    // penas do pescoço (douradas, a cair sobre os ombros) e do dorso (sobre a base da cauda)
    const eixoP = vn(vd(bz(.42), bz(.12)));
    const fr = franja(c, bz(.24), eixoP, 30, 18, 58 + 8 * pf, 9, -.3, -.3, B, 1);
    G.capa = fr.d; G.capaR = fr.riscas;
    const fr2 = franja(c, ponto(B, -48, 34, 0), vn(direcao(B, -.4, 1, 0)), 34, 12, 44, 8, -.9, -.2, B, 4);
    G.sela = fr2.d; G.selaR = fr2.riscas;
    // cabeça
    const Hd = roda(R0, Hc, P.hP + 20 * can + 6 * sh, P.hY, P.hR || 0);
    const axH = [36, 33, 30];
    G.el.cabeca = elipR(c, Hd, [0, 0, 0], axH);
    G.H = Hd; G.cab = p2(c, Hc);
    G.crista = plano(c, ponto(Hd, -3, 25, 0), Hd.f, vk(Hd.u, -1), .55);
    G.barb = LADOS.map(([, sg]) => plano(c, ponto(Hd, 22, -20, sg * 7), Hd.f, vk(Hd.u, -1), .6));
    G.barbZ = LADOS.map(([, sg]) => vp(vk(Hd.s, sg), VISTA));
    for (const [L, sg] of LADOS) {
      const s = sup(c, Hd, [0, 0, 0], axH, sg * .95, .24, RO, RO);
      let t1 = s.t1, t2 = vk(s.t2, -1), a = pd(c, t1), b = pd(c, t2);
      if (a[0] < 0) { t1 = vk(t1, -1); a = [-a[0], -a[1]]; }   // x local sempre para a direita do ecrã (os brilhos ficam do lado da luz)
      if (b[1] < 0) { t2 = vk(t2, -1); b = [-b[0], -b[1]]; }
      const ps = p2(c, s.P), k = P.olhosEsc || 1;
      G.olho[L] = { x: ps[0], y: ps[1], vis: s.vis, t1, t2, m: `matrix(${n3(a[0] * k)},${n3(a[1] * k)},${n3(b[0] * k)},${n3(b[1] * k)},${n(ps[0])},${n(ps[1])})` };
    }
    G.caras = LADOS.map(([, sg]) => sup(c, Hd, [0, 0, 0], axH, sg * .82, -.12, 20, 17));
    G.lobos = LADOS.map(([, sg]) => sup(c, Hd, [0, 0, 0], axH, sg * 1.62, -.34, 6.5, 8.5));
    // bico: metade de cima curva, metade de baixo que roda para abrir, base redonda amarela
    const bico = limita(Math.max(P.bico || 0, P.somB || 0), 0, 1);
    const Bi = roda(Hd, ponto(Hd, 29, -3, 0), -6, 0, 0);
    G.bicoS = plano(c, Bi.o, vk(Bi.f, 1.25), vk(Bi.u, -1.2), .55);
    const Li = filho(Bi, -1, -4, 0, -bico * 30, 0, 0);
    G.bicoI = plano(c, Li.o, vk(Li.f, 1.25), vk(Li.u, -1.2), .5);
    G.el.bicoB = elipR(c, Hd, [28, -4, 0], [8, 9, 10]);
    G.bocaAberta = bico;
    const pb = ponto(Bi, 16, 0, 0);
    G.zBico = (pb[1] - Hc[1] < -22) ? 99 : prof(pb) - prof(Hc);
    // penas desenhadas à superfície (pequenas escamas em «U»), só as viradas para nós
    let pp = '', ppP = '';
    const arco = (R, ce, ax, fi, te, k) => {
      const s = sup(c, R, ce, ax, fi, te, 1, 1);
      if (s.vis < .22) return '';
      const a = p2(c, vs(vs(s.P, vk(s.t1, -k)), vk(s.t2, k * .3))), m = p2(c, vs(s.P, vk(s.t2, -k * .85))), b = p2(c, vs(vs(s.P, vk(s.t1, k)), vk(s.t2, k * .3)));
      return `M${n(a[0])},${n(a[1])}Q${n(m[0])},${n(m[1])} ${n(b[0])},${n(b[1])}`;
    };
    for (const [fi, te] of PENAS) pp += arco(B, [0, 0, 0], axT, fi, te, 8);
    for (const [fi, te] of PENAS_P) ppP += arco(B, cP0, axP, fi, te, 7);
    G.penas = pp; G.penasP = ppP;
    // asas: dobradas ao lado do corpo (penas para trás) → abertas (para cima e para fora), com a batida
    G.asa = {};
    for (const [L, sg] of LADOS) {
      const A0 = ponto(B, 30, 16, 54 * sg);
      const a = limita(P['a' + L] + (P.somA || 0), 0, 1), fi = P['bat' + L] * RAD;
      const sF = vn(direcao(B, -1, .1, -.1 * sg)), cF0 = vn(direcao(B, -.1, -1, 0));
      const sO = vn(direcao(B, -.35, Math.sin(fi), Math.cos(fi) * sg)), cO = vn(direcao(B, -1, -.1, 0));
      const sp = vn(vlerp(sF, sO, a));
      let ch = vlerp(cF0, cO, a); ch = vn(vd(ch, vk(sp, vp(ch, sp))));
      const dv = Math.abs(vp(vx(sp, ch), VISTA));
      G.asa[L] = { m: plano(c, A0, vk(sp, .74), vk(ch, .78), .3), op: a > .3 ? 1 : limita((dv - .1) / .16, 0, 1) };
      G.z['asa' + L] = prof(B.o) + 110 * vp(vk(B.s, sg), VISTA) + 40 * a * Math.max(0, vp(sp, [0, 1, 0]));
    }
    // patas: anca → jarrete (coxa de penas) → tornozelo (canela amarela com escamas e esporão); dedos planos ou a agarrar o pau
    for (const [L, sg] of LADOS) {
      const pe = pes[L];
      const Hp = ponto(B, -8, -40, 22 * sg);
      const sobe = pe.modo === 'chao' ? P.salto : 0;
      const heel = [pe.p[0], pe.p[1] + sobe, pe.p[2]];
      const tp = (pe.tp + (sobe > 1 ? limita(sobe / 25, 0, 1) * 45 : 0)) * RAD, fh = pe.h * RAD;
      const f0 = [Math.sin(fh), 0, Math.cos(fh)], lat = [-Math.cos(fh), 0, Math.sin(fh)];
      const dob = pe.dobra || 0;
      const fx = vk(vn(vs(vk(f0, Math.cos(tp)), [0, -Math.sin(tp), 0])), 1 - .45 * dob), fy = vk(lat, 1 - .55 * dob);
      const ank = vs(heel, [0, 8, 0]);
      const ik = ik2(Hp, ank, 52, 58, vs(vk(F, -1), [0, .25, 0]));
      G.el['coxa' + L] = segm(c, Hp, vlerp(Hp, ik.J, .9), 22, 21, 7);
      G.el['canela' + L] = segm(c, ik.J, ik.E, 7.5, 7.5, 2);
      G['pe' + L] = plano(c, heel, fx, fy, .3);
      G['calc' + L] = p2(c, heel);
      // escamas e esporão (no ecrã)
      const J = p2(c, ik.J), E = p2(c, ik.E);
      const dx = E[0] - J[0], dy = E[1] - J[1], Ls = Math.hypot(dx, dy) || 1, px = -dy / Ls * 5.5, py = dx / Ls * 5.5;
      let es = '';
      for (let t = .2; t < .95; t += .13) { const x = lerp(J[0], E[0], t), y = lerp(J[1], E[1], t); es += `M${n(x - px)},${n(y - py)}Q${n(x + dx / Ls * 2)},${n(y + dy / Ls * 2)} ${n(x + px)},${n(y + py)}`; }
      G['esc' + L] = es;
      const S0 = vlerp(ik.E, ik.J, .3), Sp = p2(c, S0), St = p2(c, vs(S0, vs(vk(F, -15), [0, -3, 0])));
      G['esp' + L] = `M${n(Sp[0] - dx / Ls * 4)},${n(Sp[1] - dy / Ls * 4)}Q${n(lerp(Sp[0], St[0], .5))},${n(lerp(Sp[1], St[1], .5) + 3)} ${n(St[0])},${n(St[1])}L${n(Sp[0] + dx / Ls * 4)},${n(Sp[1] + dy / Ls * 4)}Z`;
      G.z['perna' + L] = -1e5 + prof(heel);
    }
    G.z.corpo = prof(B.o);
    G.z.cabeca = prof(Hc) + 2;
    return G;
  }

  /* ================= 3) Desenho do galo ================= */
  // asa (x ao longo da asa, da raiz até à ponta; y para a orla de trás): rémiges castanhas, coberturas ruivas e a faixa verde-negra
  const ASA = 'M-8,-4 C8,-26 60,-30 108,-20 C134,-15 152,-6 166,6 C154,12 144,14 132,16 C140,24 128,32 114,31 C118,40 104,46 90,43 C92,53 76,57 64,51 C64,59 48,61 38,55 C34,61 18,59 12,51 C0,45 -10,30 -10,13 Z';
  const ASA_COB = 'M-8,-4 C8,-26 56,-30 92,-22 C98,-2 94,20 82,34 C60,42 34,46 16,44 C2,40 -10,28 -10,13 Z';
  const ASA_FAIXA = 'M76,-22 C90,-4 90,22 76,38 C82,39 90,38 96,36 C104,16 102,-6 94,-22 Z';
  const ASA_PENAS = 'M132,16 C114,10 100,6 90,4 M114,31 C100,24 92,20 84,18 M90,43 C82,37 76,34 70,32 M64,51 C56,44 48,40 40,38';
  const ASA_COBL = 'M2,6 Q10,15 18,8 Q26,16 34,9 Q42,17 50,8 Q58,16 66,7';
  const ASA_BRILHO = 'M2,-8 C20,-20 50,-24 84,-18';
  // crista (x para a frente, y para baixo; a base fica escondida dentro da cabeça)
  const CRISTA = 'M-30,10 C-36,-2 -34,-14 -28,-20 C-30,-30 -24,-38 -16,-34 C-18,-48 -6,-54 0,-42 C2,-58 16,-60 18,-44 C24,-56 36,-52 34,-38 C42,-44 50,-36 42,-24 C48,-22 50,-12 40,-6 C36,2 30,10 22,12 Z';
  const CRISTA_L = 'M-24,-18 C-20,-26 -14,-30 -10,-28 M-2,-36 C2,-44 8,-46 12,-42 M20,-36 C24,-42 30,-42 32,-36';
  const BARB = 'M-5,0 C-15,6 -15,30 -1,35 C13,31 13,8 5,0 Z';
  const BICO_S = 'M-6,-9 C6,-11 20,-6 30,3 C31,6 28,8 26,6 C18,3 8,3 -6,5 Z';
  const BICO_I = 'M-6,0 C6,0 16,1 23,3 C16,8 6,10 -6,8 Z';
  const BOCA = 'M-5,0 L22,2 L-5,-9 Z';
  // pé: 3 dedos para a frente e 1 para trás (x para a frente, y para o lado); a agarrar: dedos a cair pela frente do pau (no ecrã)
  const DEDOS = 'M0,0 L37,0 M0,0 L27,-17 M0,0 L27,17 M0,0 L-14,0';
  const UNHAS = '<circle cx="39" cy="0" r="2.6"/><circle cx="28.5" cy="-18" r="2.4"/><circle cx="28.5" cy="18" r="2.4"/><circle cx="-15.5" cy="0" r="2.2"/>';
  const GARRA = 'M-10,0 C-8,6 -5,11 -8,16 M0,0 C2,7 4,12 1,18 M10,0 C12,6 14,11 11,16';
  const NS_ = 'vector-effect="non-scaling-stroke"';

  function defsGalo() {
    return `
    <radialGradient id="galo-ruivo" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#F08A48"/><stop offset=".5" stop-color="#D2532A"/><stop offset=".85" stop-color="#A63A1C"/><stop offset="1" stop-color="#8A2C14"/></radialGradient>
    <radialGradient id="galo-peito" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#4A6A56"/><stop offset=".5" stop-color="#253A30"/><stop offset="1" stop-color="#141E1A"/></radialGradient>
    <radialGradient id="galo-ouro" cx=".4" cy=".35" r=".72"><stop offset="0" stop-color="#FFE08A"/><stop offset=".45" stop-color="#F6B440"/><stop offset=".85" stop-color="#DE8A22"/><stop offset="1" stop-color="#C06C18"/></radialGradient>
    <radialGradient id="galo-luz"><stop offset="0" stop-color="#FFF6DC" stop-opacity=".8"/><stop offset=".5" stop-color="#FFF6DC" stop-opacity=".35"/><stop offset="1" stop-color="#FFF6DC" stop-opacity="0"/></radialGradient>
    <radialGradient id="galo-luzEsc"><stop offset="0" stop-color="#9FE0C2" stop-opacity=".5"/><stop offset="1" stop-color="#9FE0C2" stop-opacity="0"/></radialGradient>
    <radialGradient id="galo-sombraPena"><stop offset="0" stop-color="#3A1408" stop-opacity=".38"/><stop offset=".55" stop-color="#3A1408" stop-opacity=".18"/><stop offset="1" stop-color="#3A1408" stop-opacity="0"/></radialGradient>
    <linearGradient id="galo-crista" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF6A52"/><stop offset=".5" stop-color="#E8291C"/><stop offset="1" stop-color="#B0160E"/></linearGradient>
    <radialGradient id="galo-barb" cx=".4" cy=".3" r=".75"><stop offset="0" stop-color="#FF6A52"/><stop offset=".6" stop-color="#DE2418"/><stop offset="1" stop-color="#A3140C"/></radialGradient>
    <linearGradient id="galo-bico" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE48A"/><stop offset=".6" stop-color="#F4B834"/><stop offset="1" stop-color="#D08A1A"/></linearGradient>
    <radialGradient id="galo-bicoB" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFE48A"/><stop offset="1" stop-color="#E0A028"/></radialGradient>
    <radialGradient id="galo-perna" cx=".4" cy=".4" r=".7"><stop offset="0" stop-color="#FFE070"/><stop offset=".6" stop-color="#F2B630"/><stop offset="1" stop-color="#C98A1A"/></radialGradient>
    <linearGradient id="galo-asa" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8E4A26"/><stop offset=".6" stop-color="#6E3418"/><stop offset="1" stop-color="#4E2410"/></linearGradient>
    <linearGradient id="galo-asaCob" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E06A3A"/><stop offset=".6" stop-color="#C0401E"/><stop offset="1" stop-color="#962A14"/></linearGradient>
    <linearGradient id="galo-foice" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2E7A62"/><stop offset=".45" stop-color="#1C4A44"/><stop offset=".8" stop-color="#232A52"/><stop offset="1" stop-color="#141A2E"/></linearGradient>
    <linearGradient id="galo-foice2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1E3A30"/><stop offset=".5" stop-color="#2A6A58"/><stop offset="1" stop-color="#1A2440"/></linearGradient>
    <radialGradient id="galo-esclera" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EFE6D6"/></radialGradient>
    <radialGradient id="galo-iris" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#F8B040"/><stop offset=".55" stop-color="#D2701E"/><stop offset="1" stop-color="#7A3410"/></radialGradient>
    <linearGradient id="galo-palp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2705A"/><stop offset="1" stop-color="#D2382A"/></linearGradient>
    <radialGradient id="galo-sombra"><stop offset="0" stop-color="#3E2A12" stop-opacity=".5"/><stop offset=".6" stop-color="#3E2A12" stop-opacity=".25"/><stop offset="1" stop-color="#3E2A12" stop-opacity="0"/></radialGradient>
    <clipPath id="galo-clip-corpo"><circle class="gl-clipT" r="1"/><circle class="gl-clipP" r="1"/></clipPath>
    <clipPath id="galo-clip-cabeca"><circle class="gl-clipH" r="1"/></clipPath>
    <clipPath id="galo-clip-olho"><circle r="${RO}"/></clipPath>`;
  }
  const contornoSVG = (nm, o, cor) => `<circle class="gl-${nm}-c" r="1" fill="${cor || COR.cont}" data-o="${o}"/>`;
  const enchSVG = (nm, f, l) => `<circle class="gl-${nm}-e" r="1" fill="${f}"/>` + (l ? `<circle class="gl-${nm}-l" r="1" fill="${l}"/>` : '');
  function olhoSVG(L) {
    return `<g class="gl-olho${L}">
      <circle r="${n(RO + 2.2)}" fill="${COR.contO}"/>
      <circle r="${RO}" fill="url(#galo-esclera)"/>
      <g clip-path="url(#galo-clip-olho)">
        <g class="gl-iris${L}"><circle r="${n(RO * .76)}" fill="url(#galo-iris)"/><circle r="${n(RO * .76 - 1)}" fill="none" stroke="#5A2408" stroke-width="1.4" opacity=".8"/>
          <circle class="gl-pupila${L}" r="${n(RO * .44)}" fill="#120A05"/></g>
        <circle cx="${n(-RO * .3)}" cy="${n(-RO * .34)}" r="${n(RO * .28)}" fill="#FFFFFF"/>
        <circle cx="${n(RO * .28)}" cy="${n(RO * .3)}" r="${n(RO * .12)}" fill="#FFFFFF" opacity=".85"/>
        <path class="gl-palpI${L}" fill="#E8452E"/><path class="gl-orlaI${L}" fill="none" stroke="${COR.contV}" stroke-width="1.6"/>
        <path class="gl-palpS${L}" fill="url(#galo-palp)"/><path class="gl-orla${L}" fill="none" stroke="${COR.cont}" stroke-width="2.4" stroke-linecap="round"/>
      </g>
      <path class="gl-sobr${L}" fill="none" stroke="#B86A14" stroke-width="3" stroke-linecap="round" opacity=".8"/>
    </g>`;
  }
  function galoSVG() {
    const asa = L => `<g class="gl-g-asa${L}"><g class="gl-asa${L}">
        <path d="${ASA}" fill="url(#galo-asa)" stroke="${COR.cont}" stroke-width="2.4" stroke-linejoin="round" ${NS_}/>
        <path d="${ASA_PENAS}" fill="none" stroke="#3A1A0A" stroke-width="1.4" stroke-linecap="round" opacity=".6" ${NS_}/>
        <path d="${ASA_FAIXA}" fill="#1E3A32"/>
        <path d="${ASA_COB}" fill="url(#galo-asaCob)" stroke="${COR.cont}" stroke-width="1.6" ${NS_}/>
        <path d="${ASA_COBL}" fill="none" stroke="#8A2A12" stroke-width="1.5" ${NS_}/>
        <path d="${ASA_BRILHO}" fill="none" stroke="#FFB27A" stroke-width="3.4" stroke-linecap="round" opacity=".7" ${NS_}/>
      </g></g>`;
    const perna = L => `<g class="gl-g-perna${L}">
        ${contornoSVG('coxa' + L, 2.6)}${contornoSVG('canela' + L, 2.2, COR.contA)}
        <circle class="gl-coxa${L}-e" r="1" fill="url(#galo-ruivo)"/><circle class="gl-canela${L}-e" r="1" fill="url(#galo-perna)"/>
        <path class="gl-esc${L}" fill="none" stroke="#B87C14" stroke-width="1.3" opacity=".8"/>
        <path class="gl-esp${L}" fill="#E8C060" stroke="${COR.contA}" stroke-width="1.6" stroke-linejoin="round"/>
        <g class="gl-pe${L}"><path d="${DEDOS}" stroke="${COR.contA}" stroke-width="10.5" fill="none" stroke-linecap="round" ${NS_}/>
          <path d="${DEDOS}" stroke="#F4BE34" stroke-width="6.6" fill="none" stroke-linecap="round" ${NS_}/><g fill="#5A3A14">${UNHAS}</g></g>
        <g class="gl-garra${L}" display="none"><path d="${GARRA}" stroke="${COR.contA}" stroke-width="8" fill="none" stroke-linecap="round"/>
          <path d="${GARRA}" stroke="#F4BE34" stroke-width="4.6" fill="none" stroke-linecap="round"/>
          <g fill="#5A3A14"><circle cx="-8" cy="16" r="2"/><circle cx="1" cy="18" r="2"/><circle cx="11" cy="16" r="2"/></g></g>
      </g>`;
    const foices = FOICES.map((f, i) => `<g class="gl-foice${i}"><path d="${f.d}" fill="${f.cor}" stroke="${COR.contC}" stroke-width="1.8" stroke-linejoin="round" ${NS_}/>
        <path d="${f.meio}" fill="none" stroke="#7FD8B4" stroke-width="1.6" stroke-linecap="round" opacity=".45" ${NS_}/></g>`).join('');
    const corpo = `<g class="gl-g-corpo">
        ${['cauda', 'tronco', 'peito', 'pesc0', 'pesc1', 'pesc2'].map(nm => contornoSVG(nm, 3, nm === 'cauda' ? COR.contC : COR.cont)).join('')}
        ${enchSVG('cauda', 'url(#galo-peito)', 'url(#galo-luzEsc)')}
        <g class="gl-slotT">${enchSVG('tronco', 'url(#galo-ruivo)', 'url(#galo-luz)')}</g>
        <g class="gl-slotP">${enchSVG('peito', 'url(#galo-peito)', 'url(#galo-luzEsc)')}</g>
        <g clip-path="url(#galo-clip-corpo)"><ellipse class="gl-sombraT" rx="1" ry="1" fill="url(#galo-sombraPena)"/></g>
        <path class="gl-penas" fill="none" stroke="#9A3416" stroke-width="1.7" stroke-linecap="round" opacity=".75"/>
        <path class="gl-penasP" fill="none" stroke="#5E8A72" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>
        <path class="gl-sela" fill="#F0A236" stroke="#B4661A" stroke-width="1.4" stroke-linejoin="round"/>
        <path class="gl-selaR" fill="none" stroke="#C4701C" stroke-width="1.3" opacity=".7"/>
        ${['pesc0', 'pesc1', 'pesc2'].map(nm => enchSVG(nm, 'url(#galo-ouro)')).join('')}
        <path class="gl-capa" fill="#F4AE3C" stroke="#B4661A" stroke-width="1.4" stroke-linejoin="round"/>
        <path class="gl-capaR" fill="none" stroke="#C8741C" stroke-width="1.3" opacity=".75"/>
      </g>`;
    const cauda = `<g class="gl-g-cauda"><g class="gl-cauda">${foices}</g></g>`;
    const barb = i => `<g class="gl-barb${i}"><path d="${BARB}" fill="url(#galo-barb)" stroke="${COR.contV}" stroke-width="1.8" ${NS_}/><path d="M-3,8 C-7,14 -6,22 -2,26" stroke="#FF9A84" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7" ${NS_}/></g>`;
    const cabeca = `<g class="gl-g-cabeca">
        <g class="gl-slotBicoA"></g>
        <g class="gl-slotBarbA"></g>
        <g class="gl-crista"><path d="${CRISTA}" fill="url(#galo-crista)" stroke="${COR.contV}" stroke-width="2.4" stroke-linejoin="round" ${NS_}/>
          <path d="${CRISTA_L}" fill="none" stroke="#FF9C86" stroke-width="2.6" stroke-linecap="round" opacity=".8" ${NS_}/></g>
        ${contornoSVG('cabeca', 3)}
        <circle class="gl-pesc2b" r="1" fill="#F2AE3E"/>
        ${enchSVG('cabeca', 'url(#galo-ouro)', 'url(#galo-luz)')}
        <g clip-path="url(#galo-clip-cabeca)">
          <g fill="#E8452E">${LADOS.map(([L]) => `<ellipse class="gl-cara${L}" rx="1" ry="1"/>`).join('')}</g>
          <g fill="#FFF6EE" stroke="#E8B0A0" stroke-width=".2">${LADOS.map(([L]) => `<ellipse class="gl-lobo${L}" rx="1" ry="1"/>`).join('')}</g>
          ${olhoSVG('E')}${olhoSVG('D')}
        </g>
        <g class="gl-slotBarbF"></g>
        <g class="gl-slotBicoF"><g class="gl-bico">
          ${contornoSVG('bicoB', 2.2, COR.contA)}<circle class="gl-bicoB-e" r="1" fill="url(#galo-bicoB)"/>
          <g class="gl-bicoI"><path class="gl-boca" d="${BOCA}" fill="#8A2018" display="none"/><path d="${BICO_I}" fill="#E8A42A" stroke="${COR.contA}" stroke-width="2" stroke-linejoin="round" ${NS_}/></g>
          <g class="gl-bicoS"><path d="${BICO_S}" fill="url(#galo-bico)" stroke="${COR.contA}" stroke-width="2.2" stroke-linejoin="round" ${NS_}/>
            <path d="M2,-5 C10,-6 18,-3 24,1" stroke="#FFF2C0" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8" ${NS_}/><ellipse cx="6" cy="-3" rx="2.4" ry="1.3" fill="#8A5A12"/></g>
        </g></g>
      </g>`;
    return `<g class="gl-galo">
      <ellipse class="gl-sombra" rx="1" ry="1" fill="url(#galo-sombra)"/>
      <g class="gl-partes">${perna('E')}${perna('D')}${asa('E')}${cauda}${corpo}${cabeca}${asa('D')}</g>
      <g class="gl-barbs">${barb(0)}${barb(1)}</g>
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

  /* --- ícone do menu: galo de lado ao nascer do sol, com cores lisas (sem gradientes com id) --- */
  function iconeSVG() {
    const C = COR.cont;
    return `<circle cx="110" cy="110" r="106" fill="#FFE2B4"/>
      <path d="M4,110 A106,106 0 0 1 216,110 Z" fill="#F9C2B0"/>
      <path d="M14,60 A106,106 0 0 1 206,60 Z" fill="#C9A6D2" opacity=".55"/>
      <circle cx="52" cy="132" r="30" fill="#FFF1C2"/><circle cx="52" cy="132" r="22" fill="#FFD36A"/>
      <path d="M4,136 C40,122 70,128 110,124 C150,120 180,128 216,134 L216,150 L4,150 Z" fill="#A99CC8"/>
      <path d="M8,158 C60,148 160,148 212,158 A106,106 0 0 1 8,158 Z" fill="#C8A06A"/>
      <path d="M86,120 C62,70 30,58 18,92 C34,80 54,88 70,126 Z" fill="#1F4A3E" stroke="${C}" stroke-width="2"/>
      <path d="M88,126 C68,92 42,90 32,116 C46,108 62,114 76,136 Z" fill="#2C6650" stroke="${C}" stroke-width="2"/>
      <path d="M90,132 C78,112 60,114 54,134 C64,130 74,134 82,142 Z" fill="#16241F" stroke="${C}" stroke-width="2"/>
      <path d="M108,164 L104,188 M124,164 L128,188" stroke="${C}" stroke-width="9" stroke-linecap="round"/>
      <path d="M108,164 L104,188 M124,164 L128,188" stroke="#F2B630" stroke-width="5.6" stroke-linecap="round"/>
      <path d="M92,190 L116,190 M118,190 L142,190" stroke="${C}" stroke-width="6" stroke-linecap="round"/><path d="M92,190 L116,190 M118,190 L142,190" stroke="#F2B630" stroke-width="3.4" stroke-linecap="round"/>
      <ellipse cx="110" cy="142" rx="44" ry="31" fill="${C}"/><ellipse cx="110" cy="142" rx="41.5" ry="28.5" fill="#D2562C"/>
      <ellipse cx="138" cy="148" rx="23" ry="25" fill="${C}"/><ellipse cx="138" cy="148" rx="20.5" ry="22.5" fill="#26382E"/>
      <path d="M84,132 C100,120 128,122 136,138 C126,154 100,158 86,150 Z" fill="#B23A1E" stroke="${C}" stroke-width="2"/>
      <path d="M118,128 C124,136 124,146 118,154" stroke="#1E3A32" stroke-width="7" fill="none"/>
      <ellipse cx="138" cy="106" rx="19" ry="30" transform="rotate(14,138,106)" fill="${C}"/><ellipse cx="138" cy="106" rx="16.5" ry="27.5" transform="rotate(14,138,106)" fill="#F2A630"/>
      <path d="M120,112 L114,138 L126,122 L126,146 L134,124 L140,146 L144,122 L150,138 L152,112 Z" fill="#E8901E" stroke="${C}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M128,68 C124,54 132,48 138,58 C138,44 148,42 151,54 C152,42 163,42 163,56 C168,48 176,52 169,66 Z" fill="#E52A1E" stroke="#7A1410" stroke-width="2"/>
      <circle cx="147" cy="79" r="21" fill="${C}"/><circle cx="147" cy="79" r="18.5" fill="#F6B640"/>
      <ellipse cx="154" cy="84" rx="10" ry="9" fill="#E8452E"/><ellipse cx="139" cy="88" rx="3.4" ry="4.4" fill="#FFF6EE"/>
      <path d="M162,74 L182,81 L163,88 Z" fill="#F5B830" stroke="#8A5A12" stroke-width="2" stroke-linejoin="round"/>
      <path d="M157,92 C150,102 154,114 161,112 C168,110 166,100 162,92 Z" fill="#E52A1E" stroke="#7A1410" stroke-width="1.8"/>
      <circle cx="153" cy="76" r="6.6" fill="${COR.contO}"/><circle cx="153" cy="76" r="5.4" fill="#FFFFFF"/><circle cx="154.5" cy="76.5" r="3.6" fill="#C0601A"/><circle cx="154.5" cy="76.5" r="2" fill="#120A05"/>
      <circle cx="152" cy="74.4" r="1.6" fill="#FFFFFF"/>`;
  }

  /* ================= 4) Cenário: quintal de aldeia ao amanhecer ================= */
  const REPOUSO = { x: 660, gy: 730, h: -52 };               // o galo de pé no quintal
  const PAU = { x1: 885, x2: 1180, y: 572, gy: 692 };       // poleiro: pau de x1 a x2, cimo a y (no ecrã), chão por baixo a gy
  const PALT = (PAU.gy - PAU.y) / cE;                       // altura do cimo do pau acima do chão
  const NO_PAU = { x: 1046, h: 34 };                        // onde fica empoleirado
  const DESCOLA = { x: 984, gy: 732 };                      // de onde salta para o poleiro (à frente da paliçada)
  const POUSA = { x: 866, gy: 738 };                        // onde aterra ao descer
  const ZPAU = PAU.gy / sE;
  const NUV = [{ x: 180, y: 120, k: 1 }, { x: 760, y: 70, k: .7 }, { x: 1180, y: 150, k: .9 }, { x: 1500, y: 96, k: .75 }];
  const SOL = { x: 560, y: 414 };
  const CHAMINE = { x: 332, y: 300 };

  function defsCena() {
    return `
    <linearGradient id="galo-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E7CBE"/><stop offset=".28" stop-color="#A792C9"/><stop offset=".52" stop-color="#EFA2B2"/><stop offset=".72" stop-color="#FFBC8C"/><stop offset=".86" stop-color="#FFDDA2"/><stop offset="1" stop-color="#FFF1CC"/></linearGradient>
    <radialGradient id="galo-solBrilho"><stop offset="0" stop-color="#FFFBE6" stop-opacity="1"/><stop offset=".12" stop-color="#FFF0BC" stop-opacity=".85"/><stop offset=".4" stop-color="#FFD39A" stop-opacity=".35"/><stop offset="1" stop-color="#FFC890" stop-opacity="0"/></radialGradient>
    <radialGradient id="galo-sol" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#FFFDF0"/><stop offset=".7" stop-color="#FFF0B0"/><stop offset="1" stop-color="#FFD877"/></radialGradient>
    <linearGradient id="galo-serraL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A493C8"/><stop offset="1" stop-color="#C6A9C8"/></linearGradient>
    <linearGradient id="galo-serraM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9A2C2"/><stop offset="1" stop-color="#D8B9BE"/></linearGradient>
    <linearGradient id="galo-colina" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A4B888"/><stop offset=".6" stop-color="#7FA068"/><stop offset="1" stop-color="#668C52"/></linearGradient>
    <linearGradient id="galo-campo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8CAE62"/><stop offset="1" stop-color="#6A9446"/></linearGradient>
    <linearGradient id="galo-chao" gradientUnits="userSpaceOnUse" x1="0" y1="596" x2="0" y2="900"><stop offset="0" stop-color="#E6C496"/><stop offset=".35" stop-color="#D3AC78"/><stop offset=".75" stop-color="#BB9060"/><stop offset="1" stop-color="#A57A4C"/></linearGradient>
    <linearGradient id="galo-granito" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E4D8CC"/><stop offset=".55" stop-color="#C9BCAE"/><stop offset="1" stop-color="#A59888"/></linearGradient>
    <linearGradient id="galo-telha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8865A"/><stop offset=".6" stop-color="#C55C34"/><stop offset="1" stop-color="#984020"/></linearGradient>
    <linearGradient id="galo-verde" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4FA06A"/><stop offset=".6" stop-color="#2F7A4C"/><stop offset="1" stop-color="#1F5A36"/></linearGradient>
    <linearGradient id="galo-vidro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE0C8"/><stop offset=".45" stop-color="#9AA6CC"/><stop offset="1" stop-color="#4E5A86"/></linearGradient>
    <linearGradient id="galo-madeira" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C4966A"/><stop offset=".5" stop-color="#9A6E44"/><stop offset="1" stop-color="#6E4A28"/></linearGradient>
    <linearGradient id="galo-poste" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C89C6E"/><stop offset=".45" stop-color="#9A6E44"/><stop offset="1" stop-color="#5E3E20"/></linearGradient>
    <linearGradient id="galo-pau" gradientUnits="userSpaceOnUse" x1="0" y1="${PAU.y - 2}" x2="0" y2="${PAU.y + 18}"><stop offset="0" stop-color="#D8AE7E"/><stop offset=".35" stop-color="#B0804E"/><stop offset=".8" stop-color="#7A5230"/><stop offset="1" stop-color="#5A3A1E"/></linearGradient>
    <linearGradient id="galo-capoeira" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A8C8C2"/><stop offset=".6" stop-color="#86ACA6"/><stop offset="1" stop-color="#6A908A"/></linearGradient>
    <linearGradient id="galo-palha" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F8DE8A"/><stop offset=".55" stop-color="#E2B656"/><stop offset="1" stop-color="#B4882E"/></linearGradient>
    <radialGradient id="galo-copa" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#9CC064"/><stop offset=".55" stop-color="#5E9240"/><stop offset="1" stop-color="#36622A"/></radialGradient>
    <radialGradient id="galo-couve" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#D4EAA6"/><stop offset=".55" stop-color="#8EBE6A"/><stop offset="1" stop-color="#4E8A48"/></radialGradient>
    <radialGradient id="galo-couveG" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#9ACB8A"/><stop offset=".6" stop-color="#4E8A62"/><stop offset="1" stop-color="#2E5E44"/></radialGradient>
    <linearGradient id="galo-zinco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E6ECEE"/><stop offset=".5" stop-color="#B4BEC4"/><stop offset="1" stop-color="#7E8A92"/></linearGradient>
    <radialGradient id="galo-girassol" cx=".45" cy=".45" r=".6"><stop offset="0" stop-color="#5A3418"/><stop offset=".7" stop-color="#3E2210"/><stop offset="1" stop-color="#2A160A"/></radialGradient>
    <radialGradient id="galo-sombraChao"><stop offset="0" stop-color="#5A3A1A" stop-opacity=".4"/><stop offset="1" stop-color="#5A3A1A" stop-opacity="0"/></radialGradient>
    <radialGradient id="galo-fumo"><stop offset="0" stop-color="#FFF4F0" stop-opacity=".75"/><stop offset=".6" stop-color="#F6E6E6" stop-opacity=".38"/><stop offset="1" stop-color="#F6E6E6" stop-opacity="0"/></radialGradient>
    <radialGradient id="galo-poeira"><stop offset="0" stop-color="#E8D2AA" stop-opacity=".8"/><stop offset="1" stop-color="#E8D2AA" stop-opacity="0"/></radialGradient>
    <radialGradient id="galo-vinheta" cx=".5" cy=".46" r=".75"><stop offset=".62" stop-color="#3A2030" stop-opacity="0"/><stop offset="1" stop-color="#3A2030" stop-opacity=".26"/></radialGradient>`;
  }

  /* --- céu: gradiente da madrugada, sol a nascer com raios, nuvens cor-de-rosa, aves ao longe --- */
  function nuvemSVG(i) {
    return `<g class="gl-nuvem${i}"><g>
      <ellipse cx="0" cy="12" rx="84" ry="15" fill="#E7A2B4"/>
      <circle cx="-46" cy="0" r="24" fill="#FFD9D2"/><circle cx="-12" cy="-16" r="34" fill="#FFE2D6"/><circle cx="28" cy="-6" r="28" fill="#FFD9D0"/><circle cx="60" cy="6" r="17" fill="#FFD0CA"/>
      <ellipse cx="6" cy="8" rx="78" ry="13" fill="#FFD2CC"/>
      <path d="M-62,15 C-24,24 30,24 76,13" stroke="#D88EA6" stroke-width="4" fill="none" opacity=".7"/>
      <path d="M-32,-26 C-20,-42 4,-46 18,-34" stroke="#FFF4E6" stroke-width="6" fill="none" opacity=".9" stroke-linecap="round"/>
    </g></g>`;
  }
  function ceuSVG() {
    let raios = '';
    for (let i = 0; i < 14; i++) { const a = i / 14 * 2 * PI, b = a + .07; raios += `M${n(Math.cos(a) * 80)},${n(Math.sin(a) * 80)}L${n(Math.cos(a - .05) * 900)},${n(Math.sin(a - .05) * 900)}L${n(Math.cos(b + .05) * 900)},${n(Math.sin(b + .05) * 900)}L${n(Math.cos(b) * 80)},${n(Math.sin(b) * 80)}Z`; }
    let estrelas = '';
    const r = semente(3);
    for (let i = 0; i < 14; i++) { const x = r() * 1600, y = r() * 130; estrelas += `M${n(x)},${n(y)}m-1.6,0a1.6,1.6 0 1,0 3.2,0a1.6,1.6 0 1,0 -3.2,0`; }
    return `<rect width="1600" height="620" fill="url(#galo-ceu)"/>
      <path d="${estrelas}" fill="#FFFFFF" opacity=".45"/>
      <circle cx="${SOL.x}" cy="${SOL.y}" r="560" fill="url(#galo-solBrilho)"/>
      <g class="gl-raios" opacity=".14"><path d="${raios}" fill="#FFF6D8"/></g>
      <circle cx="${SOL.x}" cy="${SOL.y}" r="58" fill="url(#galo-sol)"/>
      <circle cx="${SOL.x}" cy="${SOL.y}" r="74" fill="#FFF3C8" opacity=".35"/>
      ${NUV.map((c, i) => nuvemSVG(i)).join('')}
      <g opacity=".55" fill="none" stroke="#6A4A6E" stroke-width="2.2" stroke-linecap="round">
        <path class="gl-ave0" d="M-9,0 Q-4,-6 0,0 Q4,-6 9,0"/><path class="gl-ave1" d="M-7,0 Q-3,-5 0,0 Q3,-5 7,0"/><path class="gl-ave2" d="M-6,0 Q-3,-4 0,0 Q3,-4 6,0"/>
      </g>`;
  }
  /* --- serra ao longe, colinas com campos, pinheiros, capela e aldeia; milheiral --- */
  function serraSVG() {
    const r = semente(11);
    let pinheiros = '';
    for (const [x, y, k] of [[640, 470, .8], [690, 476, .6], [1020, 462, .9], [1090, 470, .7], [1480, 452, .8], [1540, 460, .6], [40, 470, .7], [110, 476, .9]]) {
      pinheiros += `<g transform="translate(${x},${y}) scale(${k})"><path d="M0,0 L0,-26 M0,-18 L-8,-26" stroke="#5A4A44" stroke-width="3" fill="none"/>
        <ellipse cx="0" cy="-32" rx="26" ry="10" fill="#5E7A58"/><ellipse cx="-6" cy="-36" rx="16" ry="5" fill="#86A070" opacity=".8"/></g>`;
    }
    let casas = '';
    for (let i = 0; i < 7; i++) {
      const x = 1190 + i * 24 + r() * 6, y = 470 + (i % 3) * 5, w = 16 + r() * 6;
      casas += `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="11" fill="#F6E6E0"/><path d="M${n(x - 2)},${n(y)} L${n(x + w / 2)},${n(y - 6)} L${n(x + w + 2)},${n(y)} Z" fill="#D4785A"/>`;
    }
    const capela = `<g transform="translate(860,452)"><rect x="-14" y="-16" width="28" height="18" fill="#FBF0EA"/><path d="M-16,-16 L0,-28 L16,-16 Z" fill="#CE7458"/>
      <rect x="10" y="-40" width="11" height="42" fill="#FFF6F0"/><path d="M8,-40 L15.5,-50 L23,-40 Z" fill="#CE7458"/><rect x="13" y="-34" width="5" height="6" fill="#7A6A8A"/>
      <path d="M15.5,-50 L15.5,-58 M12.5,-55 L18.5,-55" stroke="#6A5A6A" stroke-width="1.6"/><rect x="-4" y="-8" width="7" height="10" fill="#8A7A8A"/></g>`;
    let vinha = '';
    for (let i = 0; i < 11; i++) vinha += `M${300 + i * 22},${n(500 + i * 1.2)} C${305 + i * 22},516 ${300 + i * 22},530 ${308 + i * 22},546`;
    let campo = '';
    for (let i = 0; i < 7; i++) campo += `M${1280 + i * 4},${504 + i * 6} L${1520 - i * 3},${498 + i * 6}`;
    let milho = '';
    for (let i = 0; i < 70; i++) { const x = 1180 + i * 6.2 + r() * 3, b = 600 + r() * 6, h = 34 + r() * 18; milho += `M${n(x)},${n(b)} q${n(-2 + r() * 4)},${n(-h * .6)} ${n(-3 + r() * 6)},${n(-h)} M${n(x)},${n(b - h * .5)} l${n(6 + r() * 4)},${n(-6 - r() * 4)}`; }
    return `<path d="M-20,452 C60,420 140,392 240,402 C330,410 400,380 500,396 C560,404 600,420 660,410 C760,392 840,360 960,372 C1060,382 1120,404 1220,396 C1320,388 1420,372 1520,384 C1570,390 1600,396 1620,400 L1620,520 L-20,520 Z" fill="url(#galo-serraL)"/>
      <path d="M-20,470 C120,446 260,440 400,452 C520,462 600,440 720,438 C860,436 960,458 1100,452 C1240,446 1380,430 1620,440 L1620,530 L-20,530 Z" fill="url(#galo-serraM)"/>
      <rect x="-20" y="430" width="1640" height="60" fill="#FFF0F0" opacity=".22"/>
      <path d="M-20,500 C140,474 300,468 460,480 C600,490 700,470 840,466 C980,462 1100,484 1240,480 C1380,476 1500,464 1620,470 L1620,610 L-20,610 Z" fill="url(#galo-colina)"/>
      <path d="M260,560 C300,520 360,494 440,490 C520,488 570,500 600,516 L620,560 Z" fill="#8CAE6A" opacity=".7"/>
      <path d="M1240,560 C1270,520 1320,500 1400,494 C1480,490 1540,500 1580,512 L1600,560 Z" fill="#9AB874" opacity=".7"/>
      <path d="${vinha}" stroke="#5E8A3E" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="${campo}" stroke="#A8865A" stroke-width="3" opacity=".6"/>
      ${pinheiros}${capela}${casas}
      <rect x="-20" y="486" width="1640" height="36" fill="#FFE8E0" opacity=".18"/>
      <path d="M1170,604 L1170,556 C1300,548 1460,552 1620,550 L1620,604 Z" fill="#7EA250"/>
      <path d="${milho}" stroke="#5E8A34" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
  }
  /* --- muro de pedra seca ao fundo do quintal --- */
  function muroSVG() {
    const r = semente(29);
    let p1 = '', p2 = '', br = '';
    for (let fila = 0; fila < 3; fila++) {
      for (let x = 784 + (fila % 2) * 14; x < 1620; x += 26 + r() * 12) {
        const w = 22 + r() * 12, y = 590 + fila * 11 + r() * 2, hh = 11 + r() * 3;
        const d = `M${n(x + 4)},${n(y)}L${n(x + w - 4)},${n(y)}Q${n(x + w)},${n(y)} ${n(x + w)},${n(y + 4)}L${n(x + w)},${n(y + hh - 3)}Q${n(x + w)},${n(y + hh)} ${n(x + w - 4)},${n(y + hh)}L${n(x + 4)},${n(y + hh)}Q${n(x)},${n(y + hh)} ${n(x)},${n(y + hh - 3)}L${n(x)},${n(y + 4)}Q${n(x)},${n(y)} ${n(x + 4)},${n(y)}Z`;
        if (r() < .5) p1 += d; else p2 += d;
        br += `M${n(x + 4)},${n(y + 2)}L${n(x + w * .6)},${n(y + 2)}`;
      }
    }
    return `<ellipse cx="1200" cy="624" rx="440" ry="8" fill="#6A5A3A" opacity=".3"/>
      <rect x="780" y="588" width="840" height="36" fill="#7E7466"/>
      <path d="${p1}" fill="#C8BCAE"/><path d="${p2}" fill="#AEA292"/>
      <path d="${br}" stroke="#F2E6DA" stroke-width="1.6" opacity=".6" stroke-linecap="round"/>
      <path d="M780,590 C900,584 1100,586 1300,584 C1450,582 1550,586 1620,584" stroke="#7E9A52" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`;
  }
  /* --- casa de granito com janelas verdes, sardinheiras e telhado de telha; cata-vento com um galo --- */
  function casaSVG() {
    const r = semente(7);
    let b1 = '', b2 = '', b3 = '';
    for (let fila = 0; fila < 10; fila++) {
      const y = 414 + fila * 20.4;
      for (let x = 72 + (fila % 2) * 18; x < 420; x += 34 + r() * 14) {
        const w = Math.min(30 + r() * 14, 418 - x); if (w < 8) continue;
        if (x + w > 222 && x < 286 && y > 500) continue;                 // porta
        if ((x + w > 104 && x < 176 || x + w > 314 && x < 386) && y > 450 && y < 520) continue;   // janelas
        const d = `M${n(x + 1)},${n(y + 1)}h${n(w - 2)}v18h${n(-(w - 2))}Z`;
        const k = r(); if (k < .4) b1 += d; else if (k < .75) b2 += d; else b3 += d;
      }
    }
    let telhas = '';
    for (let i = 0; i < 5; i++) { const y = 352 + i * 15, x0 = 100 - (y - 338) * .6, x1 = 390 + (y - 338) * .6; telhas += `M${n(x0)},${y}`; for (let x = x0; x < x1 - 10; x += 18) telhas += `Q${n(x + 9)},${y - 6} ${n(x + 18)},${y}`; }
    let canais = '';
    for (let x = 104; x < 392; x += 18) canais += `M${x},340 L${n(x + (x - 245) * .3)},416`;
    const janela = x => `<g>
      <rect x="${x - 6}" y="450" width="76" height="72" fill="#D8CCBE" stroke="#A89A8A" stroke-width="1.4"/>
      <rect x="${x}" y="456" width="64" height="60" fill="url(#galo-vidro)"/>
      <path d="M${x + 32},456 L${x + 32},516 M${x},486 L${x + 64},486" stroke="#F8F2EA" stroke-width="4"/>
      <path d="M${x + 6},462 L${x + 20},474" stroke="#FFFFFF" stroke-width="3" opacity=".6" stroke-linecap="round"/>
      <rect x="${x - 26}" y="454" width="20" height="64" fill="url(#galo-verde)" stroke="#1A4A2C" stroke-width="1.4"/>
      <rect x="${x + 70}" y="454" width="20" height="64" fill="url(#galo-verde)" stroke="#1A4A2C" stroke-width="1.4"/>
      <path d="M${x - 22},464 h12 M${x - 22},476 h12 M${x - 22},488 h12 M${x - 22},500 h12 M${x + 74},464 h12 M${x + 74},476 h12 M${x + 74},488 h12 M${x + 74},500 h12" stroke="#1E5A36" stroke-width="2"/>
      <rect x="${x - 10}" y="520" width="84" height="7" fill="#E4D8CC" stroke="#A89A8A" stroke-width="1"/>
      ${vaso(x + 14, 520)}${vaso(x + 50, 520)}
    </g>`;
    return `<g>
      <ellipse cx="250" cy="618" rx="220" ry="10" fill="url(#galo-sombraChao)"/>
      <rect x="70" y="412" width="350" height="206" fill="#8E8274"/>
      <path d="${b1}" fill="#D8CCBE"/><path d="${b2}" fill="#C4B6A6"/><path d="${b3}" fill="#E6DCD0"/>
      <path d="M70,412 L96,412 L96,618 L70,618 Z" fill="#F0E4D6" opacity=".5"/>
      <rect x="394" y="412" width="26" height="206" fill="#6E6254" opacity=".35"/>
      ${janela(110)}${janela(320)}
      <rect x="214" y="500" width="80" height="118" fill="#D8CCBE" stroke="#A89A8A" stroke-width="1.4"/>
      <rect x="224" y="510" width="60" height="108" fill="url(#galo-verde)" stroke="#1A4A2C" stroke-width="1.6"/>
      <path d="M239,512 L239,616 M254,512 L254,616 M269,512 L269,616" stroke="#1E5A36" stroke-width="1.6" opacity=".7"/>
      <circle cx="274" cy="566" r="3" fill="#E2B64A"/><rect x="206" y="614" width="96" height="8" fill="#BDB0A0"/>
      <path d="M52,418 L100,338 L390,338 L438,418 Z" fill="url(#galo-telha)" stroke="#7E361A" stroke-width="1.8"/>
      <path d="${canais}" stroke="#A84A26" stroke-width="1.4" opacity=".55"/>
      <path d="${telhas}" stroke="#8E3E1E" stroke-width="1.6" fill="none" opacity=".7"/>
      <path d="M48,418 L442,418" stroke="#7E361A" stroke-width="5" stroke-linecap="round"/>
      <path d="M96,340 L394,340" stroke="#E89A70" stroke-width="3" opacity=".7"/>
      <rect x="318" y="300" width="28" height="44" fill="#C8BAAA" stroke="#8E8274" stroke-width="1.4"/><rect x="314" y="296" width="36" height="7" fill="#A89A8A"/>
      <path d="M322,310 h20 M322,322 h20 M322,334 h20" stroke="#A89A8A" stroke-width="1.2"/>
      <path d="M140,338 L140,282" stroke="#3A3030" stroke-width="2.6"/>
      <path d="M126,300 L154,300 M140,292 L140,308" stroke="#3A3030" stroke-width="1.6"/>
      <g class="gl-catavento" transform="translate(140,280)"><g>
        <path d="M-12,4 C-18,-2 -20,-12 -14,-16 C-12,-8 -8,-4 -4,-4 C-6,-10 -2,-16 4,-16 C4,-20 8,-22 10,-19 C12,-22 16,-20 14,-16 C18,-14 18,-10 14,-8 L18,-6 L14,-4 C14,2 10,6 4,6 L4,10 L-4,10 L-4,6 C-8,6 -10,6 -12,4 Z" fill="#2E2626"/>
      </g></g>
    </g>`;
  }
  function vaso(x, y) {                                       // vaso de barro com sardinheiras vermelhas
    return `<path d="M${x - 9},${y - 14} L${x + 9},${y - 14} L${x + 7},${y} L${x - 7},${y} Z" fill="#C0643A" stroke="#7E361A" stroke-width="1"/>
      <path d="M${x - 14},${y - 16} C${x - 12},${y - 26} ${x - 2},${y - 28} ${x},${y - 20} C${x + 4},${y - 30} ${x + 14},${y - 26} ${x + 14},${y - 16} Z" fill="#4E8A3A"/>
      <path d="M${x - 8},${y - 26}m-5,0a5,5 0 1,0 10,0a5,5 0 1,0 -10,0 M${x + 6},${y - 28}m-5.5,0a5.5,5.5 0 1,0 11,0a5.5,5.5 0 1,0 -11,0 M${x - 1},${y - 34}m-4.5,0a4.5,4.5 0 1,0 9,0a4.5,4.5 0 1,0 -9,0" fill="#E8303A"/>
      <path d="M${x - 9},${y - 28}m-1.5,0a1.5,1.5 0 1,0 3,0a1.5,1.5 0 1,0 -3,0 M${x + 5},${y - 30}m-1.5,0a1.5,1.5 0 1,0 3,0a1.5,1.5 0 1,0 -3,0" fill="#FF9AA0"/>`;
  }
  /* --- alpendre com parreira: esteios de granito, traves de madeira, folhas de videira e cachos de uvas --- */
  function folhaVideira(x, y, s, a) {
    const pts = [[-.2, 0], [-.6, -.1], [-.9, -.45], [-.68, -.52], [-.76, -.86], [-.4, -.76], [-.2, -1.06], [0, -.86], [.2, -1.06], [.4, -.76], [.76, -.86], [.68, -.52], [.9, -.45], [.6, -.1], [.2, 0]];
    const ca = Math.cos(a), sa = Math.sin(a);
    const q = pts.map(([px, py]) => [x + (px * ca - py * sa) * s, y + (px * sa + py * ca) * s]);
    return 'M' + q.map(p => n(p[0]) + ',' + n(p[1])).join('L') + 'Z';
  }
  function cacho(x, y, k) {
    let d = '', b = '';
    const bagos = [[0, 0], [-7, -2], [7, -2], [-4, 7], [4, 7], [0, 14], [-10, -10], [0, -10], [10, -10], [-5, -18], [5, -18]];
    for (const [bx, by] of bagos) { const cx = x + bx * k, cy = y - by * k, rr = 5.2 * k; d += `M${n(cx - rr)},${n(cy)}a${n(rr)},${n(rr)} 0 1,0 ${n(2 * rr)},0a${n(rr)},${n(rr)} 0 1,0 ${n(-2 * rr)},0`; b += `M${n(cx - rr * .5)},${n(cy - rr * .4)}m-1.4,0a1.4,1.4 0 1,0 2.8,0a1.4,1.4 0 1,0 -2.8,0`; }
    return { d, b };
  }
  function alpendreSVG() {
    const r = semente(17);
    const grupos = [[420, 560], [560, 690], [690, 810]];
    let parra = '';
    grupos.forEach(([a, b], gi) => {
      let f1 = '', f2 = '', f3 = '', uv = '', ub = '';
      for (let i = 0; i < 16; i++) {
        const x = a + r() * (b - a), y = 398 + r() * 46, s = 15 + r() * 9, ang = (r() - .5) * 1.4 + (y > 428 ? PI : 0) * .0;
        const d = folhaVideira(x, y + s * .5, s, ang);
        const k = r(); if (k < .35) f1 += d; else if (k < .7) f2 += d; else f3 += d;
      }
      for (let i = 0; i < 2; i++) { const c = cacho(a + 30 + r() * (b - a - 60), 452 + r() * 12, .8 + r() * .3); uv += c.d; ub += c.b; }
      const cx = (a + b) / 2;
      parra += `<g class="gl-parra${gi}" data-cx="${cx}"><g>
        <path d="M${a},${n(432 + r() * 6)} C${a + 40},${446} ${b - 40},${440} ${b},${n(430 + r() * 6)}" stroke="#6A4A2A" stroke-width="3" fill="none"/>
        <path d="${f3}" fill="#3E7A34" stroke="#2A5222" stroke-width="1"/>
        <path d="${uv}" fill="#6A3A7A" stroke="#3E1E4A" stroke-width="1"/><path d="${ub}" fill="#C8A0D8" opacity=".7"/>
        <path d="${f2}" fill="#5E9A3E" stroke="#2E5A24" stroke-width="1"/>
        <path d="${f1}" fill="#8AB84E" stroke="#3E6A2A" stroke-width="1"/>
      </g></g>`;
    });
    const esteio = x => `<path d="M${x - 9},620 L${x - 8},420 L${x + 8},420 L${x + 9},620 Z" fill="url(#galo-granito)" stroke="#8E8274" stroke-width="1.4"/>
      <path d="M${x - 8},470 h16 M${x - 8},530 h16 M${x - 9},580 h18" stroke="#9E9284" stroke-width="1.4"/><ellipse cx="${x + 4}" cy="620" rx="24" ry="5" fill="url(#galo-sombraChao)"/>`;
    return `<g>
      ${esteio(470)}${esteio(770)}
      <path d="M770,620 C760,580 782,540 772,500 C764,470 780,446 774,424" stroke="#5E3E22" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M772,500 C790,490 800,470 798,452" stroke="#5E3E22" stroke-width="4" fill="none" stroke-linecap="round"/>
      <rect x="418" y="416" width="392" height="10" rx="3" fill="url(#galo-madeira)" stroke="#4E3218" stroke-width="1.4"/>
      <path d="M500,421 m-6,-6 h12 v12 h-12 Z M600,421 m-6,-6 h12 v12 h-12 Z M700,421 m-6,-6 h12 v12 h-12 Z" fill="#7A5232" stroke="#4E3218" stroke-width="1"/>
      ${parra}
      <path d="M520,588 L620,588 L620,600 L520,600 Z M528,600 L536,600 L536,618 L528,618 Z M604,600 L612,600 L612,618 L604,618 Z" fill="#BDB0A0" stroke="#8E8274" stroke-width="1.2"/>
    </g>`;
  }
  /* --- espigueiro de granito (canastro) com cruz, sobre pés com mós --- */
  function espigueiroSVG() {
    let ripas = '';
    for (let x = 1268; x < 1546; x += 12) ripas += `M${x},454 L${x},540`;
    const pe = x => `<path d="M${x - 9},628 L${x - 7},562 L${x + 7},562 L${x + 9},628 Z" fill="url(#galo-granito)" stroke="#8E8274" stroke-width="1.2"/>
      <ellipse cx="${x}" cy="558" rx="22" ry="6" fill="#C9BCAE" stroke="#8E8274" stroke-width="1.2"/>`;
    return `<g>
      <ellipse cx="1404" cy="630" rx="190" ry="9" fill="url(#galo-sombraChao)"/>
      ${pe(1276)}${pe(1352)}${pe(1452)}${pe(1532)}
      <rect x="1250" y="544" width="310" height="12" fill="#B9AC9C" stroke="#8E8274" stroke-width="1.2"/>
      <rect x="1252" y="440" width="306" height="106" fill="#5A4E44"/>
      <path d="${ripas}" stroke="#D2C6B8" stroke-width="7"/>
      <path d="${ripas}" stroke="#F0E6DA" stroke-width="2" opacity=".5" transform="translate(-2,0)"/>
      <rect x="1252" y="440" width="16" height="106" fill="url(#galo-granito)"/><rect x="1542" y="440" width="16" height="106" fill="url(#galo-granito)"/>
      <rect x="1398" y="440" width="12" height="106" fill="url(#galo-granito)"/>
      <path d="M1238,444 L1262,404 L1548,404 L1572,444 Z" fill="#C9BCAE" stroke="#8E8274" stroke-width="1.6"/>
      <path d="M1262,404 L1548,404" stroke="#F0E4D6" stroke-width="3"/>
      <path d="M1300,404 L1290,444 M1350,404 L1344,444 M1400,404 L1398,444 M1450,404 L1452,444 M1500,404 L1506,444" stroke="#A89A8A" stroke-width="1.4"/>
      <path d="M1276,404 L1276,362 M1264,376 L1288,376" stroke="#D2C6B8" stroke-width="7" stroke-linecap="round"/>
      <path d="M1276,404 L1276,362 M1264,376 L1288,376" stroke="#8E8274" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".6"/>
      <path d="M1532,404 L1540,372 L1548,404 Z" fill="#D2C6B8" stroke="#8E8274" stroke-width="1.2"/><circle cx="1540" cy="370" r="4" fill="#D2C6B8"/>
    </g>`;
  }
  /* --- carro de bois com rodas maciças e um molho de palha --- */
  function carroSVG() {
    const r = semente(61);
    let palha = '';
    for (let i = 0; i < 30; i++) { const x = 34 + r() * 230, y = 548 + r() * 30; palha += `M${n(x)},${n(y)} l${n(-8 + r() * 16)},${n(-4 - r() * 8)}`; }
    const roda = (x, y) => `<g><circle cx="${x}" cy="${y}" r="56" fill="#5E3E22"/><circle cx="${x}" cy="${y}" r="50" fill="url(#galo-madeira)"/>
      <path d="M${x - 50},${y} L${x + 50},${y} M${x},${y - 50} L${x},${y + 50}" stroke="#5E3E22" stroke-width="2.4" opacity=".6"/>
      <path d="M${x - 30},${y - 14} a14,14 0 0,1 0,28 M${x + 30},${y - 14} a14,14 0 0,0 0,28" fill="#3A2614" opacity=".85"/>
      <circle cx="${x}" cy="${y}" r="10" fill="#4E3218"/><circle cx="${x - 3}" cy="${y - 3}" r="3" fill="#C49A6A"/></g>`;
    return `<g>
      <ellipse cx="150" cy="698" rx="170" ry="12" fill="url(#galo-sombraChao)"/>
      <path d="M-30,628 L60,604" stroke="#6E4A28" stroke-width="10" stroke-linecap="round"/>
      <path d="${palha}" stroke="#E2B656" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M30,580 C60,540 140,530 200,536 C240,540 270,556 272,584 Z" fill="url(#galo-palha)" stroke="#A0782A" stroke-width="1.6"/>
      <path d="M60,560 C110,548 180,546 240,556" stroke="#C49A40" stroke-width="2" fill="none" opacity=".8"/>
      <rect x="20" y="580" width="262" height="22" rx="3" fill="url(#galo-madeira)" stroke="#4E3218" stroke-width="1.6"/>
      <path d="M40,580 L36,544 M90,580 L88,538 M200,580 L202,536 M256,580 L262,548" stroke="#6E4A28" stroke-width="6" stroke-linecap="round"/>
      <path d="M24,591 L278,591" stroke="#5E3E22" stroke-width="1.4" opacity=".6"/>
      ${roda(150, 642)}
    </g>`;
  }
  /* --- chão do quintal: terra batida, ervas, lajes de granito, palha e pedrinhas --- */
  function chaoSVG() {
    const r = semente(5);
    let lajes = '', lajesL = '';
    for (let i = 0; i < 11; i++) {
      const x = 240 + i * 64 + r() * 10, y = 632 + i * 4.6 + r() * 6, w = 48 + r() * 14, hh = 18 + r() * 5;
      lajes += `M${n(x)},${n(y)}Q${n(x + w / 2)},${n(y - 4)} ${n(x + w)},${n(y + 1)}Q${n(x + w + 4)},${n(y + hh / 2)} ${n(x + w - 2)},${n(y + hh)}Q${n(x + w / 2)},${n(y + hh + 4)} ${n(x + 2)},${n(y + hh)}Q${n(x - 4)},${n(y + hh / 2)} ${n(x)},${n(y)}Z`;
      lajesL += `M${n(x + 6)},${n(y + 3)}Q${n(x + w / 2)},${n(y)} ${n(x + w - 8)},${n(y + 3)}`;
    }
    let erva = '', erva2 = '';
    for (let i = 0; i < 130; i++) {
      const x = r() * 1600, y = 606 + Math.pow(r(), 1.6) * 120, h = 5 + (y - 600) / 20 + r() * 6;
      if (x > 860 && x < 1200 && y > 640) continue;
      const d = `M${n(x)},${n(y)} q${n(-1 + r() * 2)},${n(-h * .6)} ${n(-3 + r() * 6)},${n(-h)}`;
      if (r() < .5) erva += d; else erva2 += d;
    }
    let palha = '';
    for (let i = 0; i < 40; i++) { const x = 480 + r() * 1000, y = 700 + r() * 120; if (Math.abs(x - REPOUSO.x) < 110 && y < 760) continue; palha += `M${n(x)},${n(y)} l${n(-9 + r() * 18)},${n(-2 + r() * 4)}`; }
    let pedras = '';
    for (let i = 0; i < 22; i++) { const x = 460 + r() * 1100, y = 690 + r() * 160, rr = 2 + r() * 4; pedras += `M${n(x - rr)},${n(y)}a${n(rr)},${n(rr * .6)} 0 1,0 ${n(2 * rr)},0a${n(rr)},${n(rr * .6)} 0 1,0 ${n(-2 * rr)},0`; }
    return `<rect x="-20" y="596" width="1640" height="320" fill="url(#galo-chao)"/>
      <path d="M-20,600 C200,610 500,604 800,612 C1100,618 1400,606 1620,612 L1620,640 C1400,634 1100,646 800,640 C500,634 200,640 -20,632 Z" fill="#9ABA62" opacity=".55"/>
      <g fill="#8EB05A" opacity=".45"><ellipse cx="560" cy="790" rx="130" ry="16"/><ellipse cx="1180" cy="830" rx="170" ry="18"/><ellipse cx="840" cy="868" rx="140" ry="14"/></g>
      <g fill="#F4E2C2" opacity=".35"><ellipse cx="700" cy="740" rx="160" ry="20"/><ellipse cx="1050" cy="770" rx="120" ry="14"/></g>
      <path d="${lajes}" fill="#CFC4B6" stroke="#9A8E80" stroke-width="1.4"/>
      <path d="${lajesL}" stroke="#F4ECE2" stroke-width="1.8" fill="none" opacity=".7" stroke-linecap="round"/>
      <path d="${erva}" stroke="#6E9A40" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="${erva2}" stroke="#94BC5A" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="${palha}" stroke="#E8C870" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9"/>
      <path d="${pedras}" fill="#9A8C7A"/>`;
  }
  /* --- galinhas e pintainhos ao longe (debicam e saltitam) --- */
  function galinhaSVG(cls, x, y, k, esp) {
    return `<g transform="translate(${x},${y}) scale(${esp ? -k : k},${k})"><g class="${cls}">
      <ellipse cx="4" cy="2" rx="40" ry="6" fill="#5A3A1A" opacity=".25"/>
      <path d="M-6,0 L-8,-18 M8,0 L8,-18" stroke="#D89A2A" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M-34,-40 C-46,-60 -40,-74 -30,-70 C-30,-58 -24,-50 -16,-46 Z" fill="#7A3E1E"/>
      <ellipse cx="0" cy="-34" rx="34" ry="22" fill="#B8642E"/>
      <path d="M-20,-34 C-6,-26 12,-28 20,-38" stroke="#8A4420" stroke-width="2" fill="none"/>
      <g class="${cls}-cab"><path d="M22,-46 C20,-60 28,-72 38,-70 C46,-68 48,-58 42,-48 C38,-40 28,-38 22,-46 Z" fill="#C8763A"/>
        <path d="M32,-74 C32,-80 38,-80 38,-75 C40,-80 46,-78 43,-72 Z" fill="#E2302A"/><path d="M46,-62 L54,-59 L46,-56 Z" fill="#F2B630"/>
        <path d="M42,-54 C40,-48 44,-46 46,-50 Z" fill="#E2302A"/><circle cx="40" cy="-63" r="2.4" fill="#1A0E06"/></g>
    </g></g>`;
  }
  function pintainhoSVG(cls, x, y, k) {
    return `<g class="${cls}" transform="translate(${x},${y}) scale(${k})"><g>
      <ellipse cx="0" cy="1" rx="14" ry="3" fill="#5A3A1A" opacity=".25"/>
      <path d="M-3,0 L-3,-7 M3,0 L3,-7" stroke="#E8962A" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="0" cy="-14" rx="12" ry="10" fill="#FFD84A"/><circle cx="9" cy="-24" r="7.5" fill="#FFE070"/>
      <path d="M15,-25 L21,-23 L15,-21 Z" fill="#F29A2A"/><circle cx="11" cy="-26" r="1.6" fill="#1A0E06"/>
      <path d="M-6,-16 C-2,-12 4,-12 6,-16" stroke="#E8B02A" stroke-width="1.6" fill="none"/>
    </g></g>`;
  }
  function galinhasSVG() {
    return `${galinhaSVG('gl-gal0', 836, 652, .62, true)}${pintainhoSVG('gl-pin0', 778, 660, .9)}${pintainhoSVG('gl-pin1', 806, 670, .85)}${pintainhoSVG('gl-pin2', 872, 664, .9)}
      ${galinhaSVG('gl-gal1', 1222, 650, .55, false)}${pintainhoSVG('gl-pin3', 1262, 658, .8)}${pintainhoSVG('gl-pin4', 1196, 664, .8)}`;
  }
  /* --- horta à esquerda, em primeiro plano: canteiro de terra lavrada, couves e um regador --- */
  function couveSVG(x, y, k) {
    let f = '';
    for (let i = 0; i < 7; i++) { const a = -PI / 2 + (i - 3) * .48, cx = x + Math.cos(a) * 22 * k, cy = y - 18 * k + Math.sin(a) * 14 * k; f += `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(22 * k)}" ry="${n(14 * k)}" transform="rotate(${n(a / RAD + 90)},${n(cx)},${n(cy)})" fill="url(#galo-couveG)" stroke="#2E5E3A" stroke-width="1.2"/>`; }
    return `<g><ellipse cx="${x + 6}" cy="${y + 2}" rx="${n(38 * k)}" ry="${n(8 * k)}" fill="#3A2410" opacity=".35"/>${f}
      <circle cx="${x}" cy="${n(y - 22 * k)}" r="${n(20 * k)}" fill="url(#galo-couve)" stroke="#3E7A44" stroke-width="1.4"/>
      <path d="M${n(x - 12 * k)},${n(y - 26 * k)} C${n(x - 4 * k)},${n(y - 36 * k)} ${n(x + 8 * k)},${n(y - 34 * k)} ${n(x + 14 * k)},${n(y - 24 * k)} M${x},${n(y - 40 * k)} L${x},${n(y - 10 * k)}" stroke="#EAF4CE" stroke-width="${n(2 * k)}" fill="none" opacity=".75"/></g>`;
  }
  function galegaSVG(x, y, k) {                              // couve galega (alta, folhas grandes)
    let f = '';
    for (let i = 0; i < 6; i++) { const yy = y - (40 + i * 18) * k, sg = i % 2 ? 1 : -1, cx = x + sg * 26 * k, cy = yy; f += `<path d="M${x},${n(yy + 6 * k)} C${n(x + sg * 12 * k)},${n(cy - 20 * k)} ${n(cx + sg * 30 * k)},${n(cy - 16 * k)} ${n(cx + sg * 22 * k)},${n(cy + 8 * k)} C${n(cx + sg * 10 * k)},${n(cy + 18 * k)} ${n(x + sg * 6 * k)},${n(cy + 14 * k)} ${x},${n(yy + 6 * k)} Z" fill="url(#galo-couveG)" stroke="#2E5E3A" stroke-width="1.3"/><path d="M${x},${n(yy + 6 * k)} Q${n(x + sg * 20 * k)},${n(cy - 6 * k)} ${n(cx + sg * 18 * k)},${n(cy + 2 * k)}" stroke="#C8E0AA" stroke-width="1.6" fill="none" opacity=".7"/>`; }
    return `<g class="gl-galega" data-x="${x}" data-y="${y}"><g><path d="M${x},${y} L${x},${n(y - 150 * k)}" stroke="#7A9A5A" stroke-width="${n(8 * k)}" stroke-linecap="round"/>${f}</g></g>`;
  }
  function hortaSVG() {
    let sulcos = '';
    for (let i = 0; i < 6; i++) { const y = 752 + i * 26; sulcos += `M-20,${y} C120,${y - 6} 300,${y - 2} ${470 - i * 6},${y + 10}`; }
    return `<path d="M-20,742 C140,730 340,732 480,750 C500,790 498,850 486,910 L-20,910 Z" fill="#8A5E34"/>
      <path d="M-20,742 C140,730 340,732 480,750" stroke="#B48A5A" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="${sulcos}" stroke="#6A4424" stroke-width="5" fill="none" opacity=".7"/>
      <path d="${sulcos}" stroke="#A87A4C" stroke-width="2" fill="none" opacity=".6" transform="translate(0,-4)"/>
      ${galegaSVG(110, 790, 1.25)}${galegaSVG(352, 778, 1.1)}
      ${couveSVG(40, 810, 1)}${couveSVG(196, 804, 1.05)}${couveSVG(300, 846, 1.2)}${couveSVG(130, 872, 1.25)}${couveSVG(420, 816, .95)}
      <g transform="translate(452,760)">
        <ellipse cx="0" cy="40" rx="44" ry="8" fill="#3A2410" opacity=".35"/>
        <path d="M-26,-8 L26,-8 L22,38 L-22,38 Z" fill="url(#galo-zinco)" stroke="#5E6A72" stroke-width="1.8"/>
        <ellipse cx="0" cy="-8" rx="26" ry="6" fill="#C8D0D4" stroke="#5E6A72" stroke-width="1.6"/><ellipse cx="0" cy="-8" rx="20" ry="3.8" fill="#4E5A62"/>
        <path d="M22,10 L60,-26" stroke="#7E8A92" stroke-width="7" stroke-linecap="round"/><path d="M22,10 L60,-26" stroke="#C8D0D4" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="62" cy="-28" rx="7" ry="9" transform="rotate(-40,62,-28)" fill="#A4AEB4" stroke="#5E6A72" stroke-width="1.4"/>
        <path d="M-18,-12 C-18,-38 18,-38 18,-12" stroke="#5E6A72" stroke-width="4" fill="none"/>
        <path d="M-16,0 L-14,30" stroke="#FFFFFF" stroke-width="3" opacity=".6" stroke-linecap="round"/>
        <path d="M-26,8 L26,8 M-24,24 L24,24" stroke="#8A969E" stroke-width="1.4"/>
      </g>`;
  }
  /* --- capoeira de madeira pintada (camada de trás do habitat) e o poleiro, que baixa quando o galo aterra --- */
  function capoeiraSVG() {
    let tabuas = '';
    for (let x = 922; x < 1168; x += 17) tabuas += `M${x},476 L${x},654`;
    let pregos = '';
    for (let x = 914; x < 1168; x += 17) pregos += `M${x},486m-1.6,0a1.6,1.6 0 1,0 3.2,0a1.6,1.6 0 1,0 -3.2,0M${x},644m-1.6,0a1.6,1.6 0 1,0 3.2,0a1.6,1.6 0 1,0 -3.2,0`;
    let rede = '';
    for (let i = 0; i <= 6; i++) rede += `M${934 + i * 10},500 L${934 + i * 10},548 `;
    for (let i = 0; i <= 4; i++) rede += `M934,${500 + i * 12} L994,${500 + i * 12} `;
    let telhas = '';
    for (let i = 0; i < 3; i++) { const y = 446 + i * 9; telhas += `M${896 - i * 2},${y}`; for (let x = 896 - i * 2; x < 1180; x += 16) telhas += `Q${x + 8},${y - 5} ${x + 16},${y}`; }
    return `<ellipse cx="1036" cy="694" rx="190" ry="14" fill="url(#galo-sombraChao)"/>
      <path d="M936,654 L938,684 M1132,654 L1134,684" stroke="#4E3A2E" stroke-width="12"/>
      <path d="M916,654 L914,692 M1156,654 L1158,692" stroke="#6E4A28" stroke-width="13" stroke-linecap="round"/>
      <rect x="905" y="470" width="264" height="186" fill="url(#galo-capoeira)" stroke="#4E6A66" stroke-width="2"/>
      <path d="${tabuas}" stroke="#5E827C" stroke-width="1.8" opacity=".8"/>
      <path d="M1010,600 C1030,590 1060,596 1070,612 C1060,630 1030,632 1012,624 Z M1120,500 C1140,494 1158,500 1160,516 C1150,524 1130,522 1122,514 Z M940,610 C952,604 966,608 968,620 C958,628 944,626 940,618 Z" fill="#B4885A" opacity=".55"/>
      <path d="${pregos}" fill="#4A3A30"/>
      <rect x="930" y="496" width="68" height="56" fill="#3A2A22" stroke="#6E4A28" stroke-width="3"/>
      <path d="${rede}" stroke="#C8CCC8" stroke-width="1.2" opacity=".8"/>
      <path d="M1090,654 L1090,560 Q1118,532 1146,560 L1146,654 Z" fill="#2E201A"/>
      <path d="M1096,654 C1104,640 1124,636 1140,646 L1140,654 Z" fill="#D8B45A"/>
      <path d="M1090,654 L1090,560 Q1118,532 1146,560 L1146,654" fill="none" stroke="#6E4A28" stroke-width="4"/>
      <path d="M892,474 L1182,474 L1176,438 L898,438 Z" fill="url(#galo-telha)" stroke="#7E361A" stroke-width="1.8"/>
      <path d="${telhas}" stroke="#8E3E1E" stroke-width="1.5" fill="none" opacity=".7"/>
      <rect x="888" y="470" width="298" height="9" rx="3" fill="#7A5232" stroke="#4E3218" stroke-width="1.2"/>
      <ellipse class="gl-sombraPau" cx="0" cy="0" rx="1" ry="1" fill="#3A2210" opacity="0"/>
      <path class="gl-pau" fill="url(#galo-pau)" stroke="#4E3218" stroke-width="1.6"/>
      <path class="gl-pauL" fill="none" stroke="#F0CFA0" stroke-width="2" opacity=".7" stroke-linecap="round"/>
      <path class="gl-pauN" fill="none" stroke="#5E3E20" stroke-width="1.6" opacity=".7" stroke-linecap="round"/>`;
  }
  /* --- paliçada em frente à capoeira (camada da frente do habitat): estacas, ripas pregadas e postes com a corda do poleiro --- */
  function palicadaSVG() {
    const r = semente(37);
    let estacas = '', veios = '';
    for (let x = 900; x < 1160; x += 23) {
      const w = 15, t = 586 + r() * 18;
      estacas += `M${x},706 L${x},${n(t + 10)} L${x + w / 2},${n(t)} L${x + w},${n(t + 10)} L${x + w},706 Z`;
      veios += `M${x + 4},${n(t + 16)} C${x + 3},${n(t + 40)} ${x + 6},${n(t + 70)} ${x + 4},700`;
    }
    let ervas = '';
    for (let i = 0; i < 46; i++) { const x = 872 + r() * 316, b = 708, h = 10 + r() * 16; ervas += `M${n(x)},${b} q${n(-2 + r() * 4)},${n(-h * .6)} ${n(-4 + r() * 8)},${n(-h)}`; }
    const poste = (x, w) => `<path d="M${x},710 L${x},552 Q${x + w / 2},538 ${x + w},552 L${x + w},710 Z" fill="url(#galo-poste)" stroke="#4E3218" stroke-width="1.8"/>
      <path d="M${x + 6},560 C${x + 5},600 ${x + 8},640 ${x + 6},700" stroke="#5E3E20" stroke-width="1.4" fill="none" opacity=".6"/>
      <path d="M${x - 2},${PAU.y + 2} L${x + w + 2},${PAU.y + 8} M${x - 2},${PAU.y + 8} L${x + w + 2},${PAU.y + 14} M${x - 2},${PAU.y + 14} L${x + w + 2},${PAU.y + 20}" stroke="#D8C08A" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M${x - 2},${PAU.y + 2} L${x + w + 2},${PAU.y + 8} M${x - 2},${PAU.y + 8} L${x + w + 2},${PAU.y + 14} M${x - 2},${PAU.y + 14} L${x + w + 2},${PAU.y + 20}" stroke="#8A6E3A" stroke-width="1" stroke-linecap="round" opacity=".7" transform="translate(0,1.4)"/>`;
    return `<path d="${estacas}" fill="url(#galo-poste)" stroke="#4E3218" stroke-width="1.6"/>
      <path d="${veios}" stroke="#5E3E20" stroke-width="1.2" fill="none" opacity=".55"/>
      <rect x="884" y="604" width="290" height="13" rx="3" fill="url(#galo-madeira)" stroke="#4E3218" stroke-width="1.6"/>
      <path d="M890,607 L1168,607" stroke="#E2BE8E" stroke-width="2" opacity=".7"/>
      <rect x="884" y="664" width="290" height="12" rx="3" fill="url(#galo-madeira)" stroke="#4E3218" stroke-width="1.6"/>
      <path d="M911,610m-1.8,0a1.8,1.8 0 1,0 3.6,0a1.8,1.8 0 1,0 -3.6,0M980,610m-1.8,0a1.8,1.8 0 1,0 3.6,0a1.8,1.8 0 1,0 -3.6,0M1049,610m-1.8,0a1.8,1.8 0 1,0 3.6,0a1.8,1.8 0 1,0 -3.6,0M1118,610m-1.8,0a1.8,1.8 0 1,0 3.6,0a1.8,1.8 0 1,0 -3.6,0" fill="#3A2A20"/>
      ${poste(870, 26)}${poste(1154, 26)}
      <path d="${ervas}" stroke="#6E9A40" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  }
  /* --- girassóis à direita, em primeiro plano --- */
  function girassolSVG(i, x, y, alt, k) {
    let p = '';
    for (let a = 0; a < 360; a += 22.5) { const c = Math.cos(a * RAD), s = Math.sin(a * RAD); p += `M${n(c * 22 * k)},${n(s * 22 * k)} Q${n((c * 34 - s * 8) * k)},${n((s * 34 + c * 8) * k)} ${n(c * 48 * k)},${n(s * 48 * k)} Q${n((c * 34 + s * 8) * k)},${n((s * 34 - c * 8) * k)} ${n(c * 22 * k)},${n(s * 22 * k)}Z`; }
    return `<g class="gl-girassol${i}" transform="translate(${x},${y})"><g>
      <path d="M0,0 C-6,${n(-alt * .4)} 6,${n(-alt * .7)} -4,${-alt}" stroke="#5E8A34" stroke-width="${n(9 * k)}" fill="none" stroke-linecap="round"/>
      <path d="M-2,${n(-alt * .35)} C-40,${n(-alt * .45)} -60,${n(-alt * .3)} -66,${n(-alt * .2)} C-46,${n(-alt * .2)} -24,${n(-alt * .26)} -2,${n(-alt * .3)} Z M2,${n(-alt * .58)} C40,${n(-alt * .7)} 62,${n(-alt * .58)} 66,${n(-alt * .48)} C46,${n(-alt * .46)} 24,${n(-alt * .5)} 2,${n(-alt * .53)} Z" fill="#6EA040" stroke="#3E6A26" stroke-width="1.4"/>
      <g transform="translate(-4,${-alt}) rotate(-18) scale(.8,1)">
        <path d="${p}" fill="#F8C220" stroke="#C88A10" stroke-width="1.4"/>
        <circle r="${n(24 * k)}" fill="url(#galo-girassol)"/><circle r="${n(16 * k)}" fill="none" stroke="#7A4A20" stroke-width="2" stroke-dasharray="2 4"/>
      </g></g></g>`;
  }
  function primeiroPlanoSVG() {
    const r = semente(55);
    let t1 = '', t2 = '', t3 = '';
    for (let i = 0; i < 80; i++) {
      const x = 470 + r() * 1150, y = 862 + r() * 44, h = 20 + r() * 26, inc = -8 + r() * 16;
      const d = `M${n(x - 3)},${n(y)} Q${n(x + inc * .4)},${n(y - h * .6)} ${n(x + inc)},${n(y - h)} Q${n(x + inc * .3 + 2)},${n(y - h * .55)} ${n(x + 3)},${n(y)} Z`;
      const k = i % 3; if (k === 0) t1 += d; else if (k === 1) t2 += d; else t3 += d;
    }
    let mal = '';
    for (let i = 0; i < 7; i++) {
      const x = 520 + r() * 900, y = 840 + r() * 40, k = 1.2 + r() * .4;
      for (let a = 0; a < 360; a += 40) { const cx = x + Math.cos(a * RAD) * 5 * k, cy = y + Math.sin(a * RAD) * 3 * k; mal += `M${n(cx - 3 * k)},${n(cy)}a${n(3 * k)},${n(1.6 * k)} 0 1,0 ${n(6 * k)},0a${n(3 * k)},${n(1.6 * k)} 0 1,0 ${n(-6 * k)},0`; }
    }
    let papoilas = '';
    for (const [x, y] of [[560, 852], [1340, 848], [1210, 866], [760, 870]]) papoilas += `<path d="M${x},${y + 6} L${x},${y + 30}" stroke="#5E8A34" stroke-width="2"/><circle cx="${x}" cy="${y}" r="9" fill="#E8302A"/><circle cx="${x - 3}" cy="${y - 3}" r="3.4" fill="#FF7A6A" opacity=".8"/><circle cx="${x}" cy="${y}" r="2.6" fill="#2A1410"/>`;
    return `${girassolSVG(0, 1300, 900, 260, 1)}${girassolSVG(1, 1420, 910, 300, 1.1)}${girassolSVG(2, 1540, 906, 236, .95)}
      <path d="${t1}" fill="#4E8A2E"/><path d="${t2}" fill="#6EA840"/><path d="${t3}" fill="#3E7A26"/>
      <path d="${mal}" fill="#FFFFFF"/>

      ${papoilas}
      <g fill="#A89C8C">${[[620, 880, 12], [980, 890, 9], [1120, 872, 14]].map(([x, y, rr]) => `<ellipse cx="${x}" cy="${y}" rx="${rr}" ry="${n(rr * .55)}"/><ellipse cx="${x - 2}" cy="${y - 2}" rx="${n(rr * .5)}" ry="1.6" fill="#EAE2D6"/>`).join('')}</g>
      <g transform="translate(860,850) rotate(-12)"><path d="M-22,0 C-10,-9 10,-9 22,-1 C10,3 -10,4 -22,0 Z" fill="#D2562C" stroke="#8A2C14" stroke-width="1.2"/><path d="M-26,1 L20,-1" stroke="#8A2C14" stroke-width="1.2"/></g>`;
  }
  /* --- bichos e partículas: borboleta, pardal, pintainho que foge, minhoca, migalhas, poeira e penas soltas --- */
  function bichosSVG() {
    const asaB = sg => `<path d="M0,-2 C${sg * 8},-24 ${sg * 28},-28 ${sg * 32},-14 C${sg * 34},-6 ${sg * 20},0 0,2 Z" fill="#FBF8F0" stroke="#8A8478" stroke-width="1.3"/>
      <path d="M${sg * 24},-25 C${sg * 30},-25 ${sg * 34},-18 ${sg * 32},-12 C${sg * 28},-16 ${sg * 24},-20 ${sg * 24},-25 Z" fill="#4A4642"/>
      <path d="M0,2 C${sg * 16},2 ${sg * 24},10 ${sg * 18},20 C${sg * 12},25 ${sg * 4},16 0,4 Z" fill="#F4F0E2" stroke="#8A8478" stroke-width="1.3"/>
      <circle cx="${sg * 16}" cy="-13" r="2.6" fill="#4A4642"/>`;
    const migalhas = Array.from({ length: 18 }, (_, i) => `<circle class="gl-mig${i}" r="1" fill="#C49A5A" opacity="0"/>`).join('');
    const poeira = Array.from({ length: 8 }, (_, i) => `<circle class="gl-po${i}" r="1" fill="url(#galo-poeira)" opacity="0"/>`).join('');
    const penas = Array.from({ length: 3 }, (_, i) => `<g class="gl-pena${i}" display="none"><path d="M-14,0 C-6,-6 6,-6 14,-1 C6,2 -6,3 -14,0 Z" fill="${['#D2562C', '#F2A630', '#1E3A32'][i]}" stroke="#4A2416" stroke-width="1"/><path d="M-17,1 L12,-1" stroke="#4A2416" stroke-width="1"/></g>`).join('');
    return `<g class="gl-borboleta"><g class="gl-borbIn">
        <g class="gl-borbAsas">${asaB(-1)}${asaB(1)}</g>
        <ellipse cx="0" cy="2" rx="2.6" ry="11" fill="#3A3430"/><circle cx="0" cy="-10" r="3.2" fill="#3A3430"/>
        <path d="M-1,-12 C-4,-20 -6,-22 -9,-23 M1,-12 C4,-20 6,-22 9,-23" stroke="#3A3430" stroke-width="1.2" fill="none"/>
      </g></g>
      <g class="gl-pardal" display="none"><g class="gl-pardIn">
        <path class="gl-pardAsa2" d="M-2,-14 C-12,-30 -26,-36 -40,-34 C-28,-24 -16,-14 -6,-8 Z" fill="#7A5A3A" stroke="#3A2414" stroke-width="1.2"/>
        <path d="M-16,-6 L-34,-2 L-32,4 L-14,2 Z" fill="#5A3E26" stroke="#3A2414" stroke-width="1"/>
        <ellipse cx="0" cy="-6" rx="18" ry="11" fill="#B08A5E" stroke="#3A2414" stroke-width="1.4"/>
        <ellipse cx="2" cy="-2" rx="12" ry="6" fill="#E8D8BE"/>
        <circle cx="14" cy="-14" r="8.5" fill="#8A6440" stroke="#3A2414" stroke-width="1.4"/><path d="M8,-20 C12,-24 18,-22 20,-18" stroke="#5A4A44" stroke-width="3" fill="none"/>
        <path d="M21,-14 L28,-12 L21,-10 Z" fill="#3A3030"/><circle cx="16" cy="-15" r="1.8" fill="#120A05"/><path d="M12,-9 C14,-6 18,-6 20,-8" stroke="#2A2020" stroke-width="2" fill="none"/>
        <path class="gl-pardPes" d="M-2,4 L-4,12 M4,4 L4,12" stroke="#8A6A4A" stroke-width="1.8" stroke-linecap="round"/>
        <path class="gl-pardAsa" d="M-4,-10 C-14,-20 -26,-22 -36,-18 C-26,-10 -14,-4 -4,-4 Z" fill="#9A7044" stroke="#3A2414" stroke-width="1.2"/>
        <path d="M-10,-12 L-24,-14 M-12,-8 L-28,-10" stroke="#5A3E26" stroke-width="1.2" class="gl-pardRis"/>
      </g></g>
      ${pintainhoSVG('gl-fujao', -100, -100, 1.1)}
      <g class="gl-minhoca" display="none"><ellipse rx="13" ry="4.5" fill="#6A4A2A"/><path class="gl-minC" fill="none" stroke="#C86A6A" stroke-width="7.5" stroke-linecap="round"/><path class="gl-minE" fill="none" stroke="#F2A0A0" stroke-width="4.6" stroke-linecap="round"/><circle class="gl-minO" r="1.3" fill="#2A1410"/></g>
      <g class="gl-migalhas">${migalhas}</g><g class="gl-poeira">${poeira}</g>${penas}`;
  }

  /* ================= 5) montar() ================= */
  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .4 : 1;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.innerHTML = `<defs>${defsGalo()}${defsCena()}</defs>
      ${ceuSVG()}${serraSVG()}${chaoSVG()}${muroSVG()}${espigueiroSVG()}${casaSVG()}<g class="gl-fumo"></g>${alpendreSVG()}${galinhasSVG()}${carroSVG()}
      <g class="gl-habitat"><rect x="880" y="430" width="300" height="282" fill="#000" fill-opacity="0"/>${capoeiraSVG()}<g class="gl-slotDentro"></g>${palicadaSVG()}</g>
      <g class="gl-slotFora">${galoSVG()}</g>
      ${hortaSVG()}${primeiroPlanoSVG()}${bichosSVG()}
      <rect width="1600" height="900" fill="url(#galo-vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s);
    const qa = s => Array.from(svg.querySelectorAll(s));
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; el.setAttribute(nome, v); } }
    const ld = f => ({ E: f('E'), D: f('D') });

    /* --- referências --- */
    const RP = {};
    for (const nm of ['cauda', 'tronco', 'peito', 'pesc0', 'pesc1', 'pesc2', 'cabeca', 'bicoB', 'coxaE', 'canelaE', 'coxaD', 'canelaD']) {
      const c = q(`.gl-${nm}-c`);
      RP[nm] = { c, e: q(`.gl-${nm}-e`), l: q(`.gl-${nm}-l`), o: c ? +c.getAttribute('data-o') : 0 };
    }
    const R = {
      galo: q('.gl-galo'), sombra: q('.gl-sombra'), partes: q('.gl-partes'),
      grupos: { pernaE: q('.gl-g-pernaE'), pernaD: q('.gl-g-pernaD'), asaE: q('.gl-g-asaE'), asaD: q('.gl-g-asaD'), corpo: q('.gl-g-corpo'), cabeca: q('.gl-g-cabeca'), cauda: q('.gl-g-cauda') },
      slotT: q('.gl-slotT'), slotP: q('.gl-slotP'),
      asa: ld(L => q('.gl-asa' + L)), pe: ld(L => q('.gl-pe' + L)), garra: ld(L => q('.gl-garra' + L)), esc: ld(L => q('.gl-esc' + L)), esp: ld(L => q('.gl-esp' + L)),
      clipT: q('.gl-clipT'), clipP: q('.gl-clipP'), clipH: q('.gl-clipH'), sombraT: q('.gl-sombraT'),
      penas: q('.gl-penas'), penasP: q('.gl-penasP'), capa: q('.gl-capa'), capaR: q('.gl-capaR'), sela: q('.gl-sela'), selaR: q('.gl-selaR'), pesc2b: q('.gl-pesc2b'),
      cauda: q('.gl-cauda'), foices: FOICES.map((f, i) => q('.gl-foice' + i)),
      crista: q('.gl-crista'), barb: [q('.gl-barb0'), q('.gl-barb1')], slotBarbA: q('.gl-slotBarbA'), slotBarbF: q('.gl-slotBarbF'),
      bico: q('.gl-bico'), slotA: q('.gl-slotBicoA'), slotF: q('.gl-slotBicoF'), bicoS: q('.gl-bicoS'), bicoI: q('.gl-bicoI'), boca: q('.gl-boca'),
      cara: LADOS.map(([L]) => q('.gl-cara' + L)), lobo: LADOS.map(([L]) => q('.gl-lobo' + L)),
      olho: ld(L => q('.gl-olho' + L)), iris: ld(L => q('.gl-iris' + L)), palpS: ld(L => q('.gl-palpS' + L)), palpI: ld(L => q('.gl-palpI' + L)),
      orla: ld(L => q('.gl-orla' + L)), orlaI: ld(L => q('.gl-orlaI' + L)), sobr: ld(L => q('.gl-sobr' + L)),
      habitat: q('.gl-habitat'), slotDentro: q('.gl-slotDentro'), slotFora: q('.gl-slotFora'),
      pau: q('.gl-pau'), pauL: q('.gl-pauL'), pauN: q('.gl-pauN'), sombraPau: q('.gl-sombraPau'),
      nuvens: NUV.map((c, i) => q('.gl-nuvem' + i)), aves: [0, 1, 2].map(i => q('.gl-ave' + i)), raios: q('.gl-raios'),
      parra: [0, 1, 2].map(i => q(`.gl-parra${i} > g`)), parraCx: [0, 1, 2].map(i => +q('.gl-parra' + i).getAttribute('data-cx')),
      galegas: qa('.gl-galega').map(g => ({ g: g.firstElementChild, x: +g.getAttribute('data-x'), y: +g.getAttribute('data-y') })),
      girassois: [0, 1, 2].map(i => q(`.gl-girassol${i} > g`)), catavento: q('.gl-catavento > g'),
      gal: [0, 1].map(i => ({ corpo: q('.gl-gal' + i), cab: q(`.gl-gal${i}-cab`) })),
      pin: [0, 1, 2, 3, 4].map(i => q('.gl-pin' + i)),
      borb: q('.gl-borboleta'), borbAsas: q('.gl-borbAsas'),
      pardal: q('.gl-pardal'), pardAsa: q('.gl-pardAsa'), pardAsa2: q('.gl-pardAsa2'), pardIn: q('.gl-pardIn'),
      fujao: q('.gl-fujao'), minhoca: q('.gl-minhoca'), minC: q('.gl-minC'), minE: q('.gl-minE'), minO: q('.gl-minO'),
      mig: Array.from({ length: 18 }, (_, i) => q('.gl-mig' + i)), po: Array.from({ length: 8 }, (_, i) => q('.gl-po' + i)), penaS: [0, 1, 2].map(i => q('.gl-pena' + i))
    };
    R.slotBarbF.appendChild(R.barb[0]); R.slotBarbF.appendChild(R.barb[1]);
    q('.gl-barbs').remove();
    svg.insertBefore(R.fujao, R.habitat);                     // o pintainho que foge passa por trás da paliçada
    const pinBase = R.pin.map(el => { const m = /translate\(([-\d.]+),([-\d.]+)\) scale\(([-\d.]+)\)/.exec(el.getAttribute('transform')); return { x: +m[1], y: +m[2], k: +m[3], f: Math.random() * 6 }; });
    // fumo da chaminé: baforadas que sobem e se desfazem
    const fumo = [];
    { const g = q('.gl-fumo'); g.setAttribute('pointer-events', 'none');
      for (let i = 0; i < 6; i++) { const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', '1'); c.setAttribute('fill', 'url(#galo-fumo)'); g.appendChild(c); fumo.push({ el: c, f: i / 6 }); } }

    /* --- estado --- */
    const P = Object.assign({ x: REPOUSO.x, gy: REPOUSO.gy, y: 0, h: REPOUSO.h, salto: 0, somB: 0, somH: 0, somT: 0, somA: 0, canto: 0, estica: 1, _cOnda: 0 }, BASE, ROSTO);
    let modo = 'fora';                    // 'fora' | 'indo' | 'dentro' | 'voltando'
    let reagindo = false, tempo = 0, vivo = true, dtUlt = 16.7, G = null;
    let noPau = false, voo = false, alvoPau = false;
    const fase = { resp: 0 };
    const marcha = { fase: 0, amp: 0, alvoAmp: 0 };
    const pau = { s: 0, v: 0, ult: null };
    const barb = { a: 0, v: 0, hc: null, vf: 0 };
    const cauda = { ang: FOICES.map(() => 0), lagY: 0 };
    const baseP = () => noPau ? POLEIRO : BASE;
    const sagEm = x => { const u = limita((x - PAU.x1) / (PAU.x2 - PAU.x1), 0, 1); return pau.s * 4 * u * (1 - u); };
    const altPau = x => PALT - sagEm(x) / cE;
    // pés: no chão/no pau (plantados num ponto do mundo) ou livres (no ar, presos ao corpo)
    function neutro(L, frente, paraPau) {
      const sg = L === 'E' ? -1 : 1, h = P.h * RAD, f = frente || 0;
      if (paraPau == null ? noPau : paraPau) { const x = P.x - Math.cos(h) * 15 * sg + Math.sin(h) * 3; return [x, altPau(x), ZPAU]; }
      const x = P.x + Math.sin(h) * (f - 4) - Math.cos(h) * ABERTO * sg, z = P.gy / sE + Math.cos(h) * (f - 4) + Math.sin(h) * ABERTO * sg;
      return [x, 0, z];
    }
    const pes = { E: { p: neutro('E'), h: P.h - 6, tp: 0, dobra: 0, modo: 'chao', ar: false }, D: { p: neutro('D'), h: P.h + 6, tp: 0, dobra: 0, modo: 'chao', ar: false } };

    /* --- desenhar --- */
    const tfE = e => `translate(${n(e.x)},${n(e.y)}) rotate(${n(e.ang)}) scale(${n(e.rx)},${n(e.ry)})`;
    function aplica(r, e) {
      const t = `translate(${n(e.x)},${n(e.y)}) rotate(${n(e.ang)})`;
      poe(r.e, `${t} scale(${n(e.rx)},${n(e.ry)})`);
      if (r.c) poe(r.c, `${t} scale(${n(e.rx + r.o)},${n(e.ry + r.o)})`);
      if (r.l) { const [ox, oy] = luzOff(e, .24); poe(r.l, `translate(${n(e.x + ox)},${n(e.y + oy)}) rotate(${n(e.ang)}) scale(${n(e.rx * .74)},${n(e.ry * .74)})`); }
    }
    const sombraDe = (e, dx, dy, kx, ky) => `translate(${n(e.x + dx)},${n(e.y + dy)}) rotate(${n(e.ang)}) scale(${n(e.rx * kx)},${n(e.ry * ky)})`;
    let ordemAtual = '', peitoAtual = null, barbAtual = '';
    function desenhar() {
      G = geometria(P, pes);
      for (const nm in RP) aplica(RP[nm], G.el[nm]);
      poe(R.pesc2b, tfE(G.el.pesc2));
      poe(R.clipT, tfE(G.el.tronco)); poe(R.clipP, tfE(G.el.peito));
      const hc = G.el.cabeca; poe(R.clipH, `translate(${n(hc.x)},${n(hc.y)}) rotate(${n(hc.ang)}) scale(${n(hc.rx * .99)},${n(hc.ry * .99)})`);
      const t = G.el.tronco;
      poe(R.sombraT, sombraDe(t, 12, t.ry * .9, 1.02, .62));
      if (peitoAtual !== G.peitoFrente) { peitoAtual = G.peitoFrente; if (peitoAtual) R.slotT.after(R.slotP); else R.slotT.before(R.slotP); }
      atr(R.penas, 'd', G.penas || 'M0,0'); atr(R.penasP, 'd', G.penasP || 'M0,0');
      atr(R.capa, 'd', G.capa || 'M0,0'); atr(R.capaR, 'd', G.capaR || 'M0,0');
      atr(R.sela, 'd', G.sela || 'M0,0'); atr(R.selaR, 'd', G.selaR || 'M0,0');
      // cauda: leque de foices, cada uma com o seu atraso (onda)
      poe(R.cauda, G.cauda);
      R.foices.forEach((el, i) => poe(el, `rotate(${n(cauda.ang[i] * (.45 + FOICES[i].f))})`));
      // crista e barbelas (as barbelas abanam com uma mola)
      poe(R.crista, `${G.crista} rotate(${n(limita(-barb.a * .12, -6, 6))},0,10)`);
      G.barb.forEach((m, i) => poe(R.barb[i], `${m} rotate(${n(barb.a * (i ? 1 : .85) + (i ? 4 : -4))})`));
      const bOrd = G.barbZ[0] > G.barbZ[1] ? '10' : '01', slotB = G.zBico > 4 ? R.slotBarbF : R.slotBarbA;
      if (bOrd + (slotB === R.slotBarbF) !== barbAtual) { barbAtual = bOrd + (slotB === R.slotBarbF); for (const c of bOrd) slotB.appendChild(R.barb[+c]); }
      for (const [L] of LADOS) {
        poe(R.asa[L], G.asa[L].m);
        atr(R.asa[L], 'opacity', n3(G.asa[L].op));
        const pe = pes[L], garra = noPau && pe.modo === 'chao' && !pe.ar;
        atr(R.pe[L], 'display', garra ? 'none' : 'inline'); atr(R.garra[L], 'display', garra ? 'inline' : 'none');
        if (garra) { const c = G['calc' + L]; poe(R.garra[L], `translate(${n(c[0])},${n(c[1] - 2)}) scale(${Math.sin(P.h * RAD) < 0 ? -1 : 1},1)`); }
        else poe(R.pe[L], G['pe' + L]);
        atr(R.esc[L], 'd', G['esc' + L]); atr(R.esp[L], 'd', G['esp' + L]);
      }
      // bico: atrás da cabeça quando aponta para longe
      const slot = G.zBico > 4 ? R.slotF : R.slotA;
      if (R.bico.parentNode !== slot) slot.appendChild(R.bico);
      poe(R.bicoS, G.bicoS); poe(R.bicoI, G.bicoI);
      atr(R.boca, 'display', G.bocaAberta > .05 ? 'inline' : 'none');
      G.caras.forEach((m, i) => { poe(R.cara[i], tfE(m)); atr(R.cara[i], 'opacity', n3(limita((m.vis + .1) / .3, 0, 1))); });
      G.lobos.forEach((m, i) => { poe(R.lobo[i], tfE(m)); atr(R.lobo[i], 'opacity', n3(limita((m.vis - .05) / .25, 0, 1))); });
      desenharOlhos();
      const ordem = Object.keys(G.z).sort((a, b) => G.z[a] - G.z[b]), ch = ordem.join();
      if (ch !== ordemAtual) { ordemAtual = ch; for (const g of ordem) R.partes.appendChild(R.grupos[g]); }
      // sombra no chão (mais fraca quando o galo está no ar ou no pau)
      const alt = P.y + P.salto, k = 1 - limita(alt / 300, 0, .5);
      poe(R.sombra, `translate(${n(P.x + 14)},${n(P.gy + 4)}) scale(${n(130 * k)},${n(26 * k)})`);
      atr(R.sombra, 'opacity', n3(1 - limita(alt / 160, 0, .7)));
      // sombra do galo no pau
      const nPau = noPau && !voo ? 1 : 0;
      atr(R.sombraPau, 'opacity', n3(.32 * nPau));
      if (nPau) poe(R.sombraPau, `translate(${n(P.x + 8)},${n(PAU.y + sagEm(P.x) + 5)}) scale(46,5)`);
    }
    function desenharPau() {
      const s = n(pau.s * 2) / 2;
      if (pau.ult === s) return; pau.ult = s;
      const { x1, x2, y } = PAU, xm = (x1 + x2) / 2, c = 2 * s;
      atr(R.pau, 'd', `M${x1},${y} Q${xm},${n(y + c)} ${x2},${y} L${x2},${y + 15} Q${xm},${n(y + 15 + c)} ${x1},${y + 15} Z`);
      atr(R.pauL, 'd', `M${x1 + 4},${y + 4} Q${xm},${n(y + 4 + c)} ${x2 - 4},${y + 4}`);
      let nos = '';
      for (const x of [930, 1004, 1112, 1150]) { const yy = y + 9 + sagEm(x); nos += `M${x - 5},${n(yy)}Q${x},${n(yy - 3)} ${x + 5},${n(yy)}`; }
      atr(R.pauN, 'd', nos);
    }
    function camada(dentro) { const alvo = dentro ? R.slotDentro : R.slotFora; if (R.galo.parentNode !== alvo) alvo.appendChild(R.galo); }

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
        const sb = P.sobr || 0, yb = -RO * 1.4 - sb * 5;
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
      const u = pisca.f / 230;
      piscaV = u < .4 ? esai(u / .4) : 1 - eseno(limita((u - .4) / .6, 0, 1));
      if (u >= 1) { piscaV = 0; pisca.f = -1; pisca.t = pisca.duplo ? 140 : aleat(2000, 6000); }
    }
    function atualizarOlharLivre(dt) {
      olhar.t -= dt;
      if (olhar.t > 0) return;
      olhar.t = aleat(800, 2400);
      const r = Math.random();
      if (r < .3) olhar.livre = [0, 0, 2];
      else if (r < .5) olhar.livre = null;
      else olhar.livre = [aleat(-.7, .7), aleat(-.3, .4), 0];
    }

    /* --- partículas: migalhas de terra (com gravidade), nuvens de pó e penas que caem a baloiçar --- */
    const migs = R.mig.map(el => ({ el, vivo: false }));
    function migalha(x, y, vx, vy, r, yChao, cor) {
      const g = migs.find(g => !g.vivo); if (!g) return;
      Object.assign(g, { x, y, vx, vy, r, yChao, vivo: true });
      atr(g.el, 'fill', cor || '#B48A54'); atr(g.el, 'opacity', '.95');
    }
    function atualizarMigalhas(dt) {
      const s = dt / 1000;
      for (const g of migs) {
        if (!g.vivo) continue;
        g.vy += 1500 * s; g.x += g.vx * s; g.y += g.vy * s;
        if (g.vy > 0 && g.y > g.yChao) { g.vivo = false; atr(g.el, 'opacity', '0'); continue; }
        poe(g.el, `translate(${n(g.x)},${n(g.y)}) scale(${n(g.r)})`);
      }
    }
    const pos = R.po.map(el => ({ el, t: 1, dur: 1 }));
    function poeira(x, y, r0, r1, dur, vx) {
      const o = pos.find(o => o.t >= o.dur) || pos[0];
      Object.assign(o, { x, y, r0, r1, dur, vx: vx || 0, t: 0 });
    }
    function atualizarPoeira(dt) {
      for (const o of pos) {
        if (o.t >= o.dur) { if (o.el.__opacity !== '0') atr(o.el, 'opacity', '0'); continue; }
        o.t += dt; const u = Math.min(1, o.t / o.dur), r = lerp(o.r0, o.r1, esai(u));
        poe(o.el, `translate(${n(o.x + o.vx * u)},${n(o.y - 8 * u)}) scale(${n(r)},${n(r * .55)})`);
        atr(o.el, 'opacity', n3(.85 * (1 - u)));
      }
    }
    const penasS = R.penaS.map(el => ({ el, vivo: false }));
    function penaSolta(x, y) {
      const p = penasS.find(p => !p.vivo); if (!p) return;
      Object.assign(p, { x, y, t: 0, vivo: true, chao: Math.max(y + 60, P.gy + aleat(4, 30)), ph: aleat(0, 6) });
      atr(p.el, 'display', 'inline');
    }
    function atualizarPenas(dt) {
      for (const p of penasS) {
        if (!p.vivo) continue;
        p.t += dt; const s = p.t / 1000;
        p.y = Math.min(p.chao, p.y + dt * .07);
        const parado = p.y >= p.chao;
        const x = p.x + (parado ? 0 : 22 * Math.sin(s * 3 + p.ph)), rot = parado ? 8 : 26 * Math.cos(s * 3 + p.ph);
        if (!parado) p.xf = x;
        poe(p.el, `translate(${n(parado ? p.xf : x)},${n(p.y)}) rotate(${n(rot)})`);
        if (parado) { p.fim = (p.fim || 0) + dt; atr(p.el, 'opacity', n3(limita(1 - (p.fim - 2000) / 800, 0, 1))); if (p.fim > 2800) { p.vivo = false; p.fim = 0; atr(p.el, 'display', 'none'); atr(p.el, 'opacity', '1'); } }
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

    /* --- passos de galo (por distância): cada pé fica plantado num ponto do mundo e só se levanta na sua vez;
           no ar a pata sobe bem alto e os dedos fecham-se; a cabeça fica parada no mundo e depois avança de repente --- */
    const JANELA = { E: 0, D: .5 }, LARG = .42;
    function atualizarPes(avanca, resto) {
      const f = ((marcha.fase % 1) + 1) % 1;
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
        pe.alvo = a;
        const e = eio(w), alto = avanca ? 36 : 14;
        pe.p = [lerp(pe.ps[0], a[0], e), lerp(pe.ps[1], a[1], e) + alto * Math.sin(PI * Math.pow(w, .8)), lerp(pe.ps[2], a[2], e)];
        pe.h = lerp(pe.hs, P.h + 6 * sg, w); pe.tp = (avanca ? 58 : 30) * Math.sin(PI * w); pe.dobra = Math.sin(PI * Math.min(1, w * 1.2));
        if (!noAr) aterrar(L);
      }
    }
    function aterrar(L) {
      const pe = pes[L];
      pe.ar = false; pe.tp = 0; pe.dobra = 0; if (pe.alvo) pe.p = pe.alvo.slice();
    }
    function* moverPe(L, ms) {                       // um passo isolado até ao sítio de descanso
      const pe = pes[L], sg = L === 'E' ? -1 : 1, ps = pe.p.slice(), hs = pe.h;
      pe.ar = true;
      yield* durante(ms, u => { const a = neutro(L), e = eio(u); pe.alvo = a; pe.p = [lerp(ps[0], a[0], e), lerp(ps[1], a[1], e) + 14 * sino(u), lerp(ps[2], a[2], e)]; pe.h = lerp(hs, P.h + 6 * sg, u); pe.tp = 40 * sino(u); pe.dobra = sino(u); });
      aterrar(L);
    }
    function* assentar(ms) {                         // o último passo acaba e os pés que ficaram longe dão um passo
      for (const [L] of LADOS) if (pes[L].modo === 'chao' && pes[L].ar) yield* moverPe(L, ms || 130);
      for (const [L, sg] of LADOS) {
        const pe = pes[L]; if (pe.modo !== 'chao') continue;
        const a = neutro(L);
        if (Math.hypot(pe.p[0] - a[0], pe.p[2] - a[2]) > 8 || Math.abs(pe.h - (P.h + 6 * sg)) > 14) yield* moverPe(L, 170);
      }
    }
    function* virar(h1, ms, semAssentar) {           // vira primeiro a cabeça, depois o corpo, a dar passinhos no sítio
      const h0 = P.h, dh = h1 - h0;
      if (Math.abs(dh) < 2) { P.h = h1; return; }
      const lead = -limita(dh, -45, 45) * .8, hy0 = P.hY;
      yield* durante(ms * .3, u => { P.hY = lerp(hy0, lead, esai(u)); });
      marcha.alvoAmp = .5;
      let t = 0;
      for (;;) {
        const u = Math.min(1, t / ms);
        P.h = h0 + dh * eio(u); P.hY = lead * (1 - eio(u));
        if (u >= 1) break;
        const dt = yield; t += dt;
        marcha.fase += dt / 300;
        atualizarPes(false, 0);
      }
      marcha.alvoAmp = 0;
      if (!semAssentar) yield* assentar(120);
    }
    function* andar(x1, vel, opc) {                  // anda em linha reta (no x) com o passo de galo
      opc = opc || {};
      const x0 = P.x, dist = Math.abs(x1 - x0), sg = Math.sign(x1 - x0) || 1;
      let s = 0;
      marcha.alvoAmp = 1;
      while (s < dist - .01) {
        const dt = yield;
        const v = vel * limita(Math.min((s + 10) / 40, (dist - s + 6) / 34), .22, 1);
        const ds = Math.min(dist - s, v * dt / 1000); s += ds;
        P.x = x0 + sg * s;
        marcha.fase += ds / (2 * SL);
        atualizarPes(true, dist - s);
        if (opc.cada) opc.cada(s / dist);
      }
      marcha.alvoAmp = 0; yield* assentar();
    }
    // no ar: os pés soltam-se e encolhem-se debaixo do corpo (P.estica = 1 → pernas esticadas para pousar)
    function soltarPes() { for (const [L] of LADOS) { const pe = pes[L]; pe.modo = 'livre'; pe.mix = 0; pe.pFixo = pe.p.slice(); pe.ar = false; } }
    function pousarPes() { for (const [L, sg] of LADOS) { const pe = pes[L]; pe.modo = 'chao'; pe.ar = false; pe.p = neutro(L); pe.h = P.h + 6 * sg; pe.tp = 0; pe.dobra = 0; } }
    function atualizarLivres(dt) {
      const h = P.h * RAD, o = [P.x, P.y + P.salto, P.gy / sE], R0 = ref(o, [Math.sin(h), 0, Math.cos(h)], [0, 1, 0], [-Math.cos(h), 0, Math.sin(h)]);
      for (const [L, sg] of LADOS) {
        const pe = pes[L]; if (pe.modo !== 'livre') continue;
        const enc = ponto(R0, -16, P.cH - 96, 14 * sg);
        const est = neutro(L, 0, alvoPau); est[1] = o[1];
        const alvo = vlerp(enc, est, P.estica);
        pe.mix = Math.min(1, (pe.mix || 0) + dt / 150);
        pe.p = pe.mix < 1 ? vlerp(pe.pFixo, alvo, eio(pe.mix)) : alvo;
        pe.h = P.h + 6 * sg; pe.tp = lerp(60, 8, P.estica); pe.dobra = lerp(1, .15, P.estica);
      }
    }

    /* --- extras de cada quadro: andar (balanço e cabeça que avança e recua), respiração, cauda com onda, barbelas, poleiro --- */
    function atualizarExtras(dt) {
      marcha.amp += (marcha.alvoAmp - marcha.amp) * (1 - Math.exp(-dt / 120));
      const f = marcha.fase * 2 * PI, a = marcha.amp, t = tempo / 1000;
      P._resp = Math.sin(fase.resp);
      P._rl = 4 * a * Math.sin(f);
      P._lado = 2.5 * a * Math.sin(f);
      P._bob = 3.4 * a * -Math.cos(2 * f) + 1.2 * P._resp;
      const ph = ((marcha.fase * 2) % 1 + 1) % 1;              // meio ciclo = um passo
      const cab = ph < .62 ? lerp(13, -13, ph / .62) : lerp(-13, 13, eio((ph - .62) / .38));
      P._hx = cab * a; P._hy = -2.5 * a * Math.sin(ph * 2 * PI);
      P._cw = -6 * a * Math.sin(f - .7) + 2.5 * Math.sin(t * 1.3) * calma;
      // cauda: o alvo da onda e as foices que se atrasam uma em relação à outra
      const alvoC = (P.somT || 0) + 3.2 * Math.sin(t * 1.7) * calma + 5 * a * Math.sin(2 * f - 1) + (P._cOnda || 0) + 1.6 * P._resp;
      for (let i = 0; i < cauda.ang.length; i++) { const de = i ? cauda.ang[i - 1] : alvoC; cauda.ang[i] += (de - cauda.ang[i]) * (1 - Math.exp(-dt / (55 + i * 18))); }
      // barbelas: mola puxada pela velocidade da cabeça
      if (G) {
        const hc = G.H.o;
        if (barb.hc && dt > 0) { const v = vk(vd(hc, barb.hc), 1000 / dt), vf = vp(v, G.H.f) * .7 + v[1] * .25 * Math.sign(Math.sin(P.h * RAD) || 1); barb.vf += (vf - barb.vf) * (1 - Math.exp(-dt / 40)); }
        barb.hc = hc.slice();
        const s = dt / 1000, alvo = limita(barb.vf * .06, -38, 38);
        barb.v += ((alvo - barb.a) * 150 - barb.v * 8) * s; barb.a += barb.v * s;
        barb.a = limita(barb.a, -45, 45);
      }
      // poleiro: mola (o pau baixa quando o galo aterra e baloiça um pouco)
      { const s = Math.min(dt, 34) / 1000, k = 260, c = 7, peso = noPau && !voo ? 2.2 : 0;
        pau.v += ((peso - pau.s) * k - pau.v * c) * s; pau.s += pau.v * s; }
      if (noPau && !voo) {
        P.y = altPau(P.x);
        for (const [L] of LADOS) { const pe = pes[L]; if (pe.modo === 'chao' && !pe.ar) pe.p[1] = altPau(pe.p[0]); }
      }
      atualizarLivres(dt);
    }

    /* --- arrumar antes de ir ou voltar: asas dobradas, bico fechado, cabeça direita --- */
    function* arrumar(ms) {
      const b = baseP(), alvo = { bico: 0, feliz: 0, sobr: 0, abE: 1, abD: 1, salto: 0 };
      for (const k of CHAVES) if (Math.abs(P[k] - b[k]) > .3) alvo[k] = b[k];
      yield* juntos(tw(alvo, ms, eio), assentar(100));
    }
    function* recompor() {
      yield* assentar();
      if (Math.abs(P.x - REPOUSO.x) > 6) { yield* virar(P.x < REPOUSO.x ? 90 : -90, 360); yield* andar(REPOUSO.x, 140); }
      if (Math.abs(P.h - REPOUSO.h) > 3) yield* virar(REPOUSO.h, 380);
      const dif = {}; let ha = false;
      for (const k of CHAVES) if (Math.abs(P[k] - BASE[k]) > .3) { dif[k] = BASE[k]; ha = true; }
      if (ha) yield* tw(dif, 280);
    }
    function* recomporPau() {
      const dif = {}; let ha = false;
      for (const k of CHAVES) if (k !== 'h' && Math.abs(P[k] - POLEIRO[k]) > .3) { dif[k] = POLEIRO[k]; ha = true; }
      if (ha) yield* tw(dif, 260);
      if (Math.abs(P.h - NO_PAU.h) > 3) yield* virar(NO_PAU.h, 360);
    }
    const migTerra = () => escolhe(['#9A6E40', '#B48A54', '#C8A46A', '#7E9A48']);

    /* --- comportamentos (no quintal e no pau) --- */
    function* debicar() {                            // debica o chão três vezes (salta terra e grãozinhos)
      const b = baseP();
      yield* tw({ hx: 58, hy: -112, hP: -70, cP: -8, cH: b.cH - 10, cF: 4, puff: 0 }, 420, eio);
      for (let i = 0; i < 3; i++) {
        yield* tw({ hy: -124, hx: 62, bico: .25 }, 90, eentra);
        if (G) { const bc = G.el.bicoB; for (let k = 0; k < 3; k++) migalha(bc.x + aleat(-14, 20), bc.y + 18, aleat(-90, 90), -aleat(120, 240), aleat(1.6, 2.6), P.gy + aleat(-4, 10), migTerra()); }
        yield* tw({ hy: -104, hx: 58, bico: 0 }, 150, esai);
        yield* espera(aleat(60, 200));
      }
      yield* tw({ hx: b.hx, hy: b.hy, hP: b.hP, cP: b.cP, cH: b.cH, cF: 0 }, 460, eio);
      yield* tw({ hP: 14, hy: b.hy + 6 }, 150); yield* tw({ hP: b.hP, hy: b.hy }, 220);
    }
    function* esgaravatar() {                        // esgaravata a terra: uma pata para a frente e raspa para trás (voa terra), depois a outra
      const b = BASE;
      yield* tw({ hP: -26, hy: b.hy - 18, hx: b.hx + 10, cP: b.cP - 6 }, 240);
      const ordem = escolhe([['D', 'E', 'D'], ['E', 'D', 'E']]);
      for (const L of ordem) {
        const pe = pes[L], sg = L === 'E' ? -1 : 1, h = P.h * RAD, F = [Math.sin(h), 0, Math.cos(h)];
        const p0 = neutro(L), A = vs(p0, vk(F, 18)), Bk = vs(p0, vk(F, -34)), ps = pe.p.slice();
        pe.ar = true;
        const peso = { cR: -6 * sg };
        yield* juntos(tw(peso, 140), durante(150, u => { const e = eio(u); pe.p = [lerp(ps[0], A[0], e), 22 * sino(u * .85) + 6 * e, lerp(ps[2], A[2], e)]; pe.tp = 40 * e; pe.dobra = .6 * sino(u); }));
        let ult = 0;
        yield* durante(200, (u, t) => {
          const e = eseno(u); pe.p = [lerp(A[0], Bk[0], e), 6 * (1 - Math.min(1, u * 3)), lerp(A[2], Bk[2], e)]; pe.tp = 40 * (1 - Math.min(1, u * 3)) - 10 * sino(u); pe.dobra = .1;
          if (t - ult > 40 && u > .25) { ult = t; const s = p2(G.c, pe.p); migalha(s[0], s[1] - 4, -F[0] * aleat(160, 320) + aleat(-40, 40), -aleat(160, 320), aleat(1.8, 3.2), P.gy + aleat(-2, 14), migTerra()); }
        });
        { const s = p2(G.c, pe.p); poeira(s[0] - F[0] * 20, s[1], 10, 34, 700, -F[0] * 30); }
        const pm = pe.p.slice();
        yield* durante(150, u => { const e = eio(u), a = neutro(L); pe.p = [lerp(pm[0], a[0], e), 16 * sino(u), lerp(pm[2], a[2], e)]; pe.tp = 30 * sino(u); pe.dobra = .7 * sino(u); });
        aterrar(L); pe.p = neutro(L); pe.ar = false;
      }
      yield* tw({ cR: 0 }, 120);
      // olha para o que descobriu com um olho e debica duas vezes
      const sg = escolhe([-1, 1]);
      yield* tw({ hY: 50 * sg, hR: 22 * sg, hP: -30, hx: 46, hy: 40, sobr: .6 }, 300);
      yield* espera(500);
      for (let i = 0; i < 2; i++) {
        yield* tw({ hY: 0, hR: 0, hx: 58, hy: -118, hP: -70, cP: -6, bico: .25 }, 160, eentra);
        if (G) { const bc = G.el.bicoB; for (let k = 0; k < 2; k++) migalha(bc.x + aleat(-10, 16), bc.y + 16, aleat(-80, 80), -aleat(100, 200), aleat(1.6, 2.4), P.gy + aleat(-4, 8), migTerra()); }
        yield* tw({ hx: 46, hy: 20, hP: -30, bico: 0 }, 180, esai);
      }
      yield* tw({ hx: b.hx, hy: b.hy, hP: b.hP, cP: b.cP, hY: 0, hR: 0, sobr: 0 }, 380);
    }
    function* alisarPenas() {                        // vira a cabeça para trás e alisa as penas da asa com o bico
      const b = baseP(), [L, sg] = escolhe(LADOS);
      yield* tw({ hx: -30, hy: 40, hz: 44 * sg, hY: 140 * sg, hP: -34, hR: -10 * sg, cR: 5 * sg, ['a' + L]: .2, ['bat' + L]: 12 }, 560, eio);
      yield* durante(1400, u => { const w = Math.sin(u * PI * 7); P.hx = -30 + 8 * w; P.hy = 40 - 5 * Math.abs(w); P.bico = .12 + .1 * Math.sin(u * PI * 18); P.hP = -34 + 6 * w; P['a' + L] = .2 + .06 * Math.sin(u * PI * 5); });
      yield* tw({ bico: 0, ['a' + L]: 0, ['bat' + L]: 30 }, 200);
      yield* tw({ hx: b.hx, hy: b.hy, hz: 0, hY: 0, hP: b.hP, hR: 0, cR: 0 }, 520, eio);
      yield* tw({ puff: .6 }, 150, esai);
      yield* durante(380, u => { P.cR = 6 * Math.sin(u * PI * 6) * (1 - u); P.puff = .6 * (1 - u); });
      P.cR = 0; P.puff = 0;
    }
    function* baterAsas() {                          // estica-se, abre as asas e bate-as (no pau, o pau baloiça)
      const b = baseP();
      yield* tw({ cH: b.cH - 10, sq: .04, cP: b.cP - 4, sobr: .5 }, 160, eio);
      yield* tw({ cH: b.cH + 12, sq: 0, cP: 46, hx: 8, hy: 124, hP: 12, aE: 1, aD: 1, batE: 72, batD: 72 }, 300, esai);
      for (let i = 0; i < 4; i++) {
        yield* tw({ batE: -16, batD: -16 }, 110, eio);
        if (noPau) pau.v += 70;
        else if (G) poeira(P.x + aleat(-60, 60), P.gy + 2, 8, 30, 600, aleat(-30, 30));
        yield* tw({ batE: 74, batD: 74 }, 140, eio);
      }
      if (G && Math.random() < .6) penaSolta(G.el.tronco.x + aleat(-40, 40), G.el.tronco.y);
      yield* tw({ batE: 30, batD: 30, aE: 0, aD: 0, cP: b.cP, cH: b.cH, hx: b.hx, hy: b.hy, hP: b.hP, sobr: 0 }, 380, eio);
      yield* durante(420, u => { P._cOnda = 18 * Math.sin(u * PI * 5) * (1 - u); });
      P._cOnda = 0;
    }
    function* inclinarCabeca() {                     // inclina a cabeça e olha para nós com um olho, depois com o outro
      const b = baseP(), sg = escolhe([-1, 1]), h0 = P.h;
      const vira = limita(h0, -70, 70);
      yield* tw({ hY: vira + 30 * sg, hR: 28 * sg, hP: 4, sobr: .8, olhosEsc: 1.06 }, 300, esai);
      focar(() => [800, 300]);
      yield* espera(900);
      yield* tw({ hY: vira - 30 * sg, hR: -24 * sg }, 360, eio);
      yield* espera(700);
      focar(null);
      yield* tw({ hY: 0, hR: 0, hP: b.hP, sobr: 0, olhosEsc: 1 }, 320);
    }
    function* sacudir(ms) {                          // sacode-se todo: corpo balança, cabeça vai ao contrário, penas eriçadas, barbelas a abanar
      ms = ms || 650;
      yield* tw({ puff: .8, aE: .14, aD: .14, sobr: .4 }, 130, esai);
      yield* durante(ms, u => {
        const w = Math.sin(u * PI * 9) * (1 - u * .6);
        P.cR = 14 * w; P.hR = -20 * w; P.hY = 16 * Math.sin(u * PI * 9 + 1) * (1 - u); P.cY = -18 * w; P.puff = .8 * (1 - u * .7); P._cOnda = 14 * w;
        P.abE = P.abD = .25;
        if (noPau) pau.v += 18 * w;
      });
      if (G && Math.random() < .5) penaSolta(G.el.tronco.x + aleat(-30, 30), G.el.tronco.y + 10);
      yield* tw({ cR: 0, hR: 0, hY: 0, cY: 0, puff: 0, aE: 0, aD: 0, abE: 1, abD: 1, sobr: 0, _cOnda: 0 }, 220, eio);
    }
    function* seguirCom(alvo, ms) {                  // a cabeça e os olhos seguem uma coisa que se mexe
      focar(alvo);
      yield* tw({ sobr: .6 }, 200);
      let t = 0;
      while (t < ms) {
        const dt = yield; t += dt;
        if (!G) continue;
        const p = alvo(), dx = p[0] - G.cab[0], dy = p[1] - G.cab[1];
        const hAbs = limita(dx / 5, -85, 85), yaw = limita(P.h - hAbs, -65, 65), pit = limita(-dy / 5, -40, 40);
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
    function* olharMinhoca() {                       // sai uma minhoca da terra; o galo olha com um olho, debica… e ela esconde-se
      const h = P.h * RAD, sg = Math.sin(h) >= 0 ? 1 : -1;
      min.x = P.x + sg * 108; min.y = P.gy + 14; min.sai = 0; min.vis = true; min.t = 0;
      atr(R.minhoca, 'display', 'inline');
      yield* durante(500, u => { min.sai = esai(u); });
      const vira = limita(P.h - sg * 90, -70, 70);
      focar(() => [min.x, min.y - 14 * min.sai]);
      yield* tw({ hY: vira * .8, hR: 26 * sg, hx: 44, hy: 70, hP: -26, sobr: .9, olhosEsc: 1.08 }, 380, esai);
      yield* espera(900);
      yield* tw({ hR: -10 * sg, hY: vira * .5 }, 300);
      yield* espera(400);
      yield* tw({ hx: 52, hy: 90, hP: -14 }, 160, esai);        // antecipação
      yield* juntos(tw({ hx: 74, hy: -110, hP: -72, hY: vira * .3, hR: 0, cP: -8, bico: .35 }, 150, eentra), durante(180, u => { min.sai = 1 - esai(u); }));
      if (G) { const bc = G.el.bicoB; for (let k = 0; k < 4; k++) migalha(bc.x + aleat(-12, 12), bc.y + 16, aleat(-110, 110), -aleat(120, 240), aleat(1.6, 2.6), P.gy + aleat(0, 18), migTerra()); }
      min.vis = false; atr(R.minhoca, 'display', 'none');
      yield* tw({ bico: 0, hx: 50, hy: 40, hP: -10 }, 200, esai);
      // fica espantado e sacode a cabeça
      yield* tw({ sobr: 1, olhosEsc: 1.12 }, 120);
      yield* durante(420, u => { P.hR = 18 * Math.sin(u * PI * 6) * (1 - u); });
      focar(null);
      const b = baseP();
      yield* tw({ hx: b.hx, hy: b.hy, hP: b.hP, hY: 0, hR: 0, cP: b.cP, sobr: 0, olhosEsc: 1 }, 380);
    }
    function* passear() {                            // dá uns passos para a esquerda e volta
      yield* virar(-90, 340);
      yield* andar(REPOUSO.x - 110, 120);
      yield* juntos(tw({ hY: 30, hP: 8 }, 300), espera(700));
      yield* tw({ hY: 0, hP: BASE.hP }, 300);
      yield* virar(90, 460);
      yield* andar(REPOUSO.x, 120);
      yield* virar(REPOUSO.h, 380);
    }
    function* olharEmVolta() {                       // no pau: olha devagar para um lado e para o outro
      const b = POLEIRO;
      for (const a of escolhe([[-60, 40], [50, -50]])) { yield* tw({ hY: a, hP: 6, hR: a / 8 }, 500, eio); yield* espera(aleat(500, 900)); }
      yield* tw({ hY: 0, hP: b.hP, hR: 0 }, 400);
    }
    function* olharGalinhas() {                      // no pau: espreita as galinhas lá em baixo
      yield* seguirCom(() => [836 + 20 * Math.sin(tempo / 900), 610], 2600);
      yield* tw({ hY: 0, hP: POLEIRO.hP, hR: 0, sobr: 0 }, 400);
    }
    function* esticarAsa() {                         // espreguiça uma asa para baixo e para trás
      const [L] = escolhe(LADOS);
      yield* tw({ ['a' + L]: .75, ['bat' + L]: -24, cP: baseP().cP - 6, puff: .3 }, 320, eio);
      yield* espera(500);
      yield* tw({ ['a' + L]: 0, ['bat' + L]: 30, cP: baseP().cP, puff: 0 }, 300, eio);
    }
    const COMPORTAMENTOS = { debicar, esgaravatar, alisarPenas, baterAsas, inclinarCabeca, sacudir: () => sacudir(), olharMinhoca, olharBorboleta, passear };
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
    const NO_PAU_COMP = { olharEmVolta, alisarPenas, baterAsas, sacudir: () => sacudir(560), inclinarCabeca, olharGalinhas, esticarAsa };
    let ultimoDentro = null;
    function* cicloDentro() {
      for (;;) {
        yield* recomporPau();
        yield* espera(aleat(1300, 2600));
        let nome; do nome = escolhe(Object.keys(NO_PAU_COMP)); while (nome === ultimoDentro);
        ultimoDentro = nome;
        yield* NO_PAU_COMP[nome]();
      }
    }

    /* --- reação ao toque: olhos contentes, crista e barbelas a abanar, salto com as asas a bater e a cauda a abanar --- */
    function* reacao() {
      reagindo = true; marcha.alvoAmp = 0;
      const s0 = P.salto, b = BASE;
      const rosto = tw({ feliz: .85, sobr: 1, bico: .25, olhosEsc: 1.1, abE: 1, abD: 1, hx: b.hx, hy: b.hy, hz: 0, hY: limita(P.h, -40, 40), hP: 8, hR: 0, cP: b.cP, cR: 0, cF: 0, cU: 0, puff: 0 }, 90, esai);
      const corpo = (function* () {
        if (s0 < 3) yield* tw({ cH: b.cH - 14, sq: .06, aE: .3, aD: .3 }, 70, esai);
        const c0 = P.cH;
        barb.v += 260;
        yield* durante(420, u => {
          P.salto = lerp(s0, 0, u) + 46 * 4 * u * (1 - u); P.sq = -.06 * sino(u);
          P.batE = P.batD = 40 + 44 * Math.sin(u * PI * 6); P.aE = P.aD = .1 + .7 * sino(u * 1.15);
          P.cH = lerp(c0, b.cH, Math.min(1, u * 3)); P._cOnda = 20 * Math.sin(u * PI * 7);
        });
        P.salto = 0;
        if (G) poeira(P.x, P.gy + 2, 10, 46, 650, 0);
        yield* tw({ sq: .08, cH: b.cH - 10, aE: 0, aD: 0, batE: 30, batD: 30 }, 80, esai);
        yield* tw({ sq: 0, cH: b.cH, _cOnda: 0 }, 200, eio);
      })();
      yield* juntos(rosto, corpo, assentar(90));
      yield* juntos(tw({ bico: 0, hP: b.hP }, 160), durante(520, u => { P._cOnda = 14 * Math.sin(u * PI * 6) * (1 - u); P.hR = 8 * Math.sin(u * PI * 3) * (1 - u); }));
      reagindo = false;
      yield* tw(Object.assign({}, ROSTO, { _cOnda: 0, hR: 0, hY: 0 }), 380);
    }
    function* reacaoPau() {                          // no pau: dá um saltinho, bate as asas e o pau baloiça
      reagindo = true;
      const b = POLEIRO;
      const rosto = tw({ feliz: .85, sobr: 1, bico: .25, olhosEsc: 1.1, abE: 1, abD: 1, hx: b.hx, hy: b.hy, hz: 0, hY: limita(P.h, -40, 40), hP: 8, hR: 0, cF: 0, puff: 0 }, 90, esai);
      const corpo = (function* () {
        yield* tw({ cH: b.cH - 12, sq: .05, aE: .6, aD: .6, batE: 60, batD: 60 }, 80, esai);
        pau.v -= 80; barb.v += 240;
        yield* durante(380, u => {
          P.salto = 26 * 4 * u * (1 - u); P.batE = P.batD = 40 + 44 * Math.sin(u * PI * 6); P.aE = P.aD = .4 + .6 * sino(u);
          P.cH = lerp(b.cH - 12, b.cH, Math.min(1, u * 3)); P._cOnda = 18 * Math.sin(u * PI * 7); P.sq = -.05 * sino(u);
        });
        P.salto = 0; pau.v += 150;
        yield* tw({ sq: .07, cH: b.cH - 8, aE: 0, aD: 0, batE: 30, batD: 30 }, 90, esai);
        yield* tw({ sq: 0, cH: b.cH, _cOnda: 0 }, 220, eio);
      })();
      yield* juntos(rosto, corpo);
      yield* juntos(tw({ bico: 0, hP: b.hP }, 160), durante(500, u => { P._cOnda = 14 * Math.sin(u * PI * 6) * (1 - u); }));
      reagindo = false;
      yield* tw(Object.assign({}, ROSTO, { _cOnda: 0, hY: 0 }), 380);
    }

    /* --- som: «cócórócó». Antes de cantar enche o peito e estica a cabeça para trás; em cada sílaba o bico abre e a cabeça dá um impulso --- */
    function* silaba(ms, ultima) {
      yield* durante(ms, u => {
        const k = u < .16 ? esai(u / .16) : u < (ultima ? .78 : .6) ? 1 : 1 - eseno((u - (ultima ? .78 : .6)) / (ultima ? .22 : .4));
        P.somB = (ultima ? .95 : .78) * k; P.somH = Math.sin(PI * Math.min(1, u * 1.15)) * (ultima ? 1.4 : 1); P.somT = 10 * Math.sin(u * PI * 3) * (1 - u);
      });
      P.somB = 0; P.somH = 0; P.somT = 0;
    }
    function* rampaCanto(total) {
      yield* durante(150, u => { P.canto = esai(u); });
      yield* espera(Math.max(0, total - 150));
      yield* durante(320, u => { P.canto = 1 - eio(u); });
      P.canto = 0;
    }
    function* cantarSilabas(silabas) {
      const fim = silabas.reduce((m, [a, d]) => Math.max(m, a + d), 0) * 1000;
      const boca = (function* () {
        let t = 0;
        for (let i = 0; i < silabas.length; i++) {
          const [a, d] = silabas[i];
          if (a > t) yield* espera((a - t) * 1000);
          yield* silaba(limita(d * 1000, 120, 1400), i === silabas.length - 1);
          t = a + Math.max(d, .12);
        }
      })();
      yield* juntos(rampaCanto(fim), boca);
    }
    function* cantarMs(ms) {
      const nQ = limita(Math.round(ms / 330), 2, 5), per = ms / (nQ + .6);
      const boca = (function* () { for (let i = 0; i < nQ; i++) { const ult = i === nQ - 1; yield* silaba(per * (ult ? 1.4 : .8), ult); if (!ult) yield* espera(per * .2); } })();
      yield* juntos(rampaCanto(ms), boca);
    }

    /* --- ida ao poleiro: vira-se, anda com passos de galo até à paliçada, agacha-se, bate as asas e esvoaça para o pau;
           os dedos agarram o pau, que baixa e baloiça; equilibra-se com as asas e fica empoleirado --- */
    function* idaAoPoleiro() {
      modo = 'indo'; reagindo = false;
      focar(() => [NO_PAU.x + 20, PAU.y - 40]);
      yield* juntos(arrumar(120), virar(90, 300, true));
      yield* andar(DESCOLA.x, 240);
      // antecipação: agacha-se, olha para cima e abre as asas
      yield* tw({ cH: BASE.cH - 30, sq: .07, cP: 32, aE: .45, aD: .45, batE: 60, batD: 60, hy: BASE.hy - 14, hP: 20 }, 190, esai);
      soltarPes(); voo = true; alvoPau = true;
      const x0 = P.x, g0 = P.gy, h0 = P.h, x1 = NO_PAU.x;
      let trocou = false;
      yield* durante(560, u => {
        const e = eseno(u);
        P.x = lerp(x0, x1, e); P.gy = lerp(g0, PAU.gy, e);
        P.y = lerp(0, altPau(x1), eio(u)) + 64 * 4 * u * (1 - u);
        P.h = lerp(h0, NO_PAU.h, eio(limita((u - .2) / .7, 0, 1)));
        P.aE = P.aD = limita(.45 + u * 4, 0, 1); P.batE = P.batD = 30 + 46 * Math.sin(u * PI * 5.5);
        P.estica = u < .22 ? 1 - u / .22 : u > .68 ? eseno((u - .68) / .32) : 0;
        P.cH = lerp(BASE.cH - 30, POLEIRO.cH, Math.min(1, u * 2.5)); P.sq = -.07 * sino(u * 1.2); P.cP = lerp(32, POLEIRO.cP + 6, u);
        P.hy = lerp(BASE.hy - 14, POLEIRO.hy, u); P.hP = lerp(20, 0, u); P._cOnda = -14 * sino(u);
        if (!trocou && u > .45) { trocou = true; camada(true); }
      });
      noPau = true; voo = false; alvoPau = false; pousarPes(); P.estica = 1; P.y = altPau(P.x);
      pau.v += 190; barb.v += 200;
      yield* tw({ sq: .09, cH: POLEIRO.cH - 16, batE: 66, batD: 66 }, 90, esai);
      modo = 'dentro';
      // equilibra-se com as asas e arruma-as; enche o peito, orgulhoso
      for (let i = 0; i < 2; i++) { yield* tw({ batE: -6, batD: -6, sq: 0, cH: POLEIRO.cH }, 90, eio); pau.v += 60; yield* tw({ batE: 62, batD: 62 }, 100, eio); }
      yield* tw({ aE: 0, aD: 0, batE: 30, batD: 30, cP: POLEIRO.cP, _cOnda: 0 }, 220, eio);
      focar(null);
    }
    function* depoisDeAterrar() {                    // já no pau: enche o peito e estica a cabeça, orgulhoso
      yield* tw({ puff: .7, hy: POLEIRO.hy + 14, hP: 16, cP: POLEIRO.cP + 8, feliz: .3 }, 300, esai);
      yield* espera(500);
      yield* tw({ puff: 0, hy: POLEIRO.hy, hP: POLEIRO.hP, cP: POLEIRO.cP, feliz: 0 }, 400, eio);
    }
    /* --- volta: espreguiça uma asa, vira-se para o quintal, agacha-se e salta do pau (bate as asas para travar), aterra e vai para o sítio --- */
    function* voltaDoPoleiro() {
      modo = 'voltando'; reagindo = false;
      focar(() => [REPOUSO.x - 60, REPOUSO.gy - 120]);
      yield* juntos(arrumar(100), tw({ aD: .7, batD: -22, cP: POLEIRO.cP - 6, puff: .3 }, 200, eio));
      yield* juntos(tw({ aD: 0, batD: 30, puff: 0 }, 180, eio), virar(-60, 200, true));
      yield* tw({ cH: POLEIRO.cH - 20, sq: .06, cP: 30, aE: .5, aD: .5, batE: 60, batD: 60 }, 120, esai);
      soltarPes(); voo = true; alvoPau = false; pau.v -= 200;
      const x0 = P.x, g0 = P.gy, y0 = P.y, h0 = P.h;
      let trocou = false;
      noPau = false;
      yield* durante(500, u => {
        const e = eseno(u);
        P.x = lerp(x0, POUSA.x, e); P.gy = lerp(g0, POUSA.gy, e);
        P.y = lerp(y0, 0, eentra(u) * .6 + u * .4) + 34 * 4 * u * (1 - u);
        P.h = lerp(h0, -84, eio(u));
        P.aE = P.aD = 1; P.batE = P.batD = 30 + 44 * Math.sin(u * PI * 5);
        P.estica = u < .2 ? 1 - u / .2 : u > .6 ? eseno((u - .6) / .4) : 0;
        P.cH = lerp(POLEIRO.cH - 20, BASE.cH, Math.min(1, u * 2)); P.cP = lerp(30, BASE.cP, u); P.sq = -.06 * sino(u);
        if (!trocou && u > .22) { trocou = true; camada(false); }
      });
      voo = false; pousarPes(); P.estica = 1; P.y = 0;
      poeira(P.x - 30, P.gy + 2, 10, 44, 700, -30); poeira(P.x + 30, P.gy + 2, 10, 44, 700, 30);
      barb.v += 200;
      yield* tw({ sq: .08, cH: BASE.cH - 14, aE: 0, aD: 0, batE: 30, batD: 30 }, 90, esai);
      yield* juntos(tw({ sq: 0, cH: BASE.cH, cP: BASE.cP, hx: BASE.hx, hy: BASE.hy, hP: BASE.hP }, 200, eio), virar(-90, 180, true));
      yield* andar(REPOUSO.x, 340);
      yield* virar(REPOUSO.h, 200);
      focar(null);
      modo = 'fora';
    }

    /* --- cenário vivo --- */
    const borb = { x: 420, y: 470, vx: 0, vy: 0, alvo: [420, 470], t: 0, chamar: false };
    const min = { x: 0, y: 0, sai: 0, vis: false, t: 0 };
    function animarCena(dt) {
      const t = tempo / 1000;
      NUV.forEach((c, i) => { const x = ((c.x + 200 + t * (4 + i * 1.5) * calma) % 2000) - 200; poe(R.nuvens[i], `translate(${n(x)},${c.y}) scale(${c.k})`); });
      R.aves.forEach((a, i) => { const x = ((t * (14 + i * 3) + i * 160) % 2400) - 300, y = 210 + i * 18 + 6 * Math.sin(t * .7 + i); poe(a, `translate(${n(x)},${n(y)}) scale(1,${n3(.55 + .45 * Math.abs(Math.sin(t * 4 + i)))})`); });
      poe(R.raios, `translate(${SOL.x},${SOL.y}) rotate(${n(t * 2.2 * calma % 360)})`);
      atr(R.raios, 'opacity', n3(.12 + .04 * Math.sin(t * .8)));
      R.parra.forEach((g, i) => poe(g, `rotate(${n3(.7 * Math.sin(t * .8 + i * 1.7) * calma)},${R.parraCx[i]},420)`));
      R.galegas.forEach((o, i) => poe(o.g, `rotate(${n3(1.6 * Math.sin(t * .9 + i * 2) * calma)},${o.x},${o.y})`));
      R.girassois.forEach((g, i) => poe(g, `rotate(${n3(1.4 * Math.sin(t * .7 + i * 1.3) * calma)})`));
      poe(R.catavento, `scale(${n3(Math.cos(t * .35 * calma) * .9 + Math.sign(Math.cos(t * .35 * calma)) * .1)},1)`);
      fumo.forEach(f => {
        const u = (f.f + t * .08 * calma) % 1;
        poe(f.el, `translate(${n(CHAMINE.x + 40 * u + 6 * Math.sin(u * 7 + f.f * 9))},${n(CHAMINE.y - 130 * u)}) scale(${n(8 + 26 * u)})`);
        atr(f.el, 'opacity', n3(.85 * Math.sin(PI * u) * (1 - u * .5)));
      });
      // galinhas a debicar e pintainhos a saltitar
      R.gal.forEach((g, i) => {
        const c = (t * (.55 + i * .13) + i * .4) % 1, d = c < .5 ? sino(c / .5) : 0;
        poe(g.cab, `rotate(${n(52 * d)},24,-46)`); poe(g.corpo, `rotate(${n(8 * d)},0,-10)`);
      });
      R.pin.forEach((el, i) => {
        const b = pinBase[i], c = (t * 1.3 + b.f) % 2.4, hop = c < .6 ? 8 * sino(c / .6) : 0, dx = 12 * Math.sin(t * .4 + b.f);
        poe(el, `translate(${n(b.x + dx)},${n(b.y - hop)}) scale(${b.k * (Math.cos(t * .4 + b.f) < 0 ? -1 : 1)},${b.k})`);
      });
      // borboleta: passeia pela horta e pelo quintal aos ziguezagues (e vem ter com o galo quando ele olha)
      borb.t -= dt;
      if (borb.t <= 0) {
        borb.t = aleat(1100, 2400);
        borb.alvo = borb.chamar && G ? [G.cab[0] + escolhe([-1, 1]) * aleat(110, 190), G.cab[1] - aleat(30, 120)] : [aleat(240, 780), aleat(340, 600)];
        if (G && Math.hypot(borb.alvo[0] - G.cab[0], borb.alvo[1] - G.cab[1]) < 150) borb.alvo[0] = G.cab[0] + (borb.alvo[0] < G.cab[0] ? -170 : 170);
      }
      const s = dt / 1000, dx = borb.alvo[0] - borb.x, dy = borb.alvo[1] - borb.y;
      borb.vx += (dx * 1.6 - borb.vx * 1.4) * s; borb.vy += (dy * 1.6 - borb.vy * 1.4) * s;
      const vm = Math.hypot(borb.vx, borb.vy); if (vm > 140) { borb.vx *= 140 / vm; borb.vy *= 140 / vm; }
      if (G) { const ex = borb.x - G.cab[0], ey = borb.y - G.cab[1], dd = Math.hypot(ex, ey); if (dd < 130) { borb.vx += ex / (dd || 1) * 900 * s; borb.vy += ey / (dd || 1) * 900 * s; } }
      borb.x += borb.vx * s; borb.y += borb.vy * s + 26 * Math.cos(t * 5.3) * s * 6;
      poe(R.borb, `translate(${n(borb.x)},${n(borb.y + 6 * Math.sin(t * 5.3))}) rotate(${n(limita(borb.vx / 6, -25, 25))}) scale(.85)`);
      poe(R.borbAsas, `scale(${n3(.2 + .8 * Math.abs(Math.cos(t * 16)))},1)`);
      // minhoca: sai da terra a serpentear
      if (min.vis) {
        min.t += dt;
        const L = 30 * min.sai, w = Math.sin(min.t / 160) * 6, x = min.x, y = min.y;
        const d = `M${n(x)},${n(y)} Q${n(x + w)},${n(y - L * .5)} ${n(x - w * .5)},${n(y - L)}`;
        poe(R.minhoca, 'translate(0,0)');
        atr(R.minC, 'd', d); atr(R.minE, 'd', d);
        poe(R.minO, `translate(${n(x - w * .5 + 2)},${n(y - L + 1)})`);
        atr(R.minO, 'opacity', min.sai > .5 ? '1' : '0');
        R.minhoca.firstElementChild.setAttribute('cx', n(x)); R.minhoca.firstElementChild.setAttribute('cy', n(y + 2));
      }
    }

    /* --- acontecimentos raros (a cada 15–40 s): um pintainho foge a correr pelo quintal, um pardal pousa na parreira --- */
    const eventos = { prox: aleat(9000, 15000), ultimo: null };
    function iniciarEvento(tipo) {
      const ev = { tipo, x: -100, y: -100, vivo: true };
      ev.pos = () => [ev.x, ev.y];
      lancar('evento', tipo === 'pintainho' ? evPintainho(ev) : evPardal(ev), () => { ev.vivo = false; });
      if (modo === 'fora' && !reagindo) lancar('corpo', observar(ev), () => lancar('corpo', cicloFora()));
      else if (modo === 'dentro' && !reagindo) lancar('corpo', observar(ev), () => lancar('corpo', cicloDentro()));
      return ev;
    }
    function atualizarEventos(dt) {
      if (faixas.has('evento') || modo === 'indo' || modo === 'voltando') return;
      eventos.prox -= dt;
      if (eventos.prox > 0) return;
      eventos.prox = aleat(15000, 40000);
      const tipo = eventos.ultimo === 'pintainho' ? 'pardal' : 'pintainho';
      eventos.ultimo = tipo;
      iniciarEvento(tipo);
    }
    function* observar(ev) {
      reagindo = false;
      if (min.vis) { min.vis = false; atr(R.minhoca, 'display', 'none'); }
      yield* assentar();
      yield* tw({ sobr: .8, olhosEsc: 1.06, bico: 0, feliz: 0, hx: baseP().hx, hy: baseP().hy, cP: baseP().cP, cH: baseP().cH }, 220, esai);
      let t = 0;
      focar(ev.pos);
      while (ev.vivo && t < 9000) {
        const dt = yield; t += dt;
        if (!G) continue;
        const p = ev.pos(), dx = p[0] - G.cab[0], dy = p[1] - G.cab[1];
        const yaw = limita(P.h - limita(dx / 5, -85, 85), -65, 65), pit = limita(-dy / 6, -30, 35), k = 1 - Math.exp(-dt / 220);
        P.hY += (yaw - P.hY) * k; P.hP += (pit - P.hP) * k;
      }
      focar(null);
      const b = baseP();
      yield* tw({ hY: 0, hP: b.hP, sobr: 0, olhosEsc: 1 }, 400);
    }
    function* evPintainho(ev) {                      // um pintainho atravessa o quintal aos saltinhos, a piar, e vai ter com a galinha
      const g = R.fujao, x0 = 300, x1 = 1680, y0 = 688;
      let ult = 0;
      yield* durante(5600, (u, t) => {
        const x = lerp(x0, x1, u), sp = (t / 140) % 1, y = y0 - 8 * u - 7 * Math.abs(Math.sin(PI * sp));
        ev.x = x; ev.y = y - 20;
        poe(g, `translate(${n(x)},${n(y)}) scale(1.1) rotate(${n(4 * Math.sin(t / 70))})`);
        if (t - ult > 320 && x < 880) { ult = t; poeira(x - 10, y0 - 8 * u + 2, 3, 12, 380, -10); }
      });
      poe(g, 'translate(-100,-100)');
      yield* espera(400);
    }
    function* evPardal(ev) {                         // um pardal chega a voar, pousa na trave da parreira, saltita, debica e vai-se embora
      const g = R.pardal;
      atr(g, 'display', 'inline');
      const voar = function* (de, para, ms, alto) {
        yield* durante(ms, (u, t) => {
          const e = eseno(u), x = lerp(de[0], para[0], e), y = lerp(de[1], para[1], e) - alto * sino(u);
          ev.x = x; ev.y = y;
          const esq = para[0] < de[0];
          poe(g, `translate(${n(x)},${n(y)}) scale(${esq ? -1 : 1},1)`);
          const bat = Math.sin(t * .045);
          atr(R.pardAsa, 'transform', `rotate(${n(-40 * bat)},-4,-6)`); atr(R.pardAsa2, 'transform', `rotate(${n(-30 * bat)},-2,-10)`);
        });
        atr(R.pardAsa, 'transform', ''); atr(R.pardAsa2, 'transform', 'rotate(30,-2,-10)');
      };
      yield* voar([1700, 140], [520, 414], 2600, 60);
      // saltita na trave
      for (const dx of [-26, -22, 30]) {
        const x0 = ev.x;
        yield* durante(220, u => { ev.x = x0 + dx * u; ev.y = 414 - 10 * sino(u); poe(g, `translate(${n(ev.x)},${n(ev.y)}) scale(${dx < 0 ? -1 : 1},1)`); });
        yield* espera(aleat(250, 500));
      }
      yield* durante(500, u => { poe(R.pardIn, `rotate(${n(30 * sino(u * 2))},10,0)`); });
      poe(R.pardIn, 'rotate(0)');
      yield* espera(600);
      yield* voar([ev.x, 414], [-140, 180], 2200, 40);
      atr(g, 'display', 'none');
      yield* espera(300);
    }

    /* --- relógio único --- */
    let erroMostrado = false;
    function passo(dt) {
      if (!vivo) return;
      try {
        dt = Math.min(dt, 50);
        tempo += dt; dtUlt = dt;
        fase.resp += dt / 1000 * 2 * PI * (noPau ? .32 : .42);
        atualizarPiscar(dt);
        atualizarOlharLivre(dt);
        for (const nome of Array.from(faixas.keys())) avancarF(nome, dt);
        atualizarExtras(dt);
        atualizarEventos(dt);
        animarCena(dt);
        desenhar();
        desenharPau();
        atualizarMigalhas(dt);
        atualizarPoeira(dt);
        atualizarPenas(dt);
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    lancar('corpo', cicloFora());
    atualizarExtras(0); animarCena(0); desenhar(); desenharPau();

    return {
      animal: R.galo,
      habitat: R.habitat,
      reagir() {
        if (!vivo) return;
        if (min.vis) { min.vis = false; atr(R.minhoca, 'display', 'none'); }
        if (modo === 'fora') lancar('corpo', reacao(), () => { reagindo = false; lancar('corpo', cicloFora()); });
        else if (modo === 'dentro') lancar('corpo', reacaoPau(), () => { reagindo = false; lancar('corpo', cicloDentro()); });
        else { P.sobr = 1; }
      },
      fazerSom(ms, silabas) {
        if (!vivo) return;
        const fim = () => { P.somB = 0; P.somH = 0; P.somT = 0; P.canto = 0; };
        if (Array.isArray(silabas) && silabas.length) lancar('boca', cantarSilabas(silabas), fim);
        else lancar('boca', cantarMs(limita(ms || 1200, 400, 3500)), fim);
      },
      irAoHabitat() {
        return new Promise(res => {
          if (!vivo || modo !== 'fora') { res(); return; }
          if (min.vis) { min.vis = false; atr(R.minhoca, 'display', 'none'); }
          lancar('corpo', idaAoPoleiro(), () => { res(); lancar('corpo', (function* () { yield* depoisDeAterrar(); yield* cicloDentro(); })()); });
        });
      },
      voltar() {
        return new Promise(res => {
          if (!vivo || modo !== 'dentro') { res(); return; }
          lancar('corpo', voltaDoPoleiro(), () => { res(); lancar('corpo', cicloFora()); });
        });
      },
      destruir() {
        vivo = false;
        faixas.clear();
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola
      _teste: { P, pes, pau, marcha, modo: () => modo, noPau: () => noPau, G: () => G, evento: iniciarEvento, desenhar,
        comportamento: nome => lancar('corpo', (COMPORTAMENTOS[nome] || NO_PAU_COMP[nome])(), () => lancar('corpo', modo === 'dentro' ? cicloDentro() : cicloFora())),
        parar: () => lancar('corpo', (function* () { for (;;) yield; })()) }
    };
  }

  return { icone: iconeSVG(), montar };
})();
