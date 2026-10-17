/* Passarinho — «Os Meus Animais». Contrato e regras: REGRAS-ANIMAIS.md.
   Cena: um jardim com pomar na primavera (luz de cima à esquerda): céu azul com nuvens, colinas e telhados da aldeia ao longe,
   sebe de buxo com uma cerca de madeira, macieira em flor à esquerda, uma cerejeira grande em flor à direita a largar pétalas,
   relva com margaridas, dentes-de-leão e trevos, e um banho de pássaros de pedra com água.
   O animal: um chapim-azul de boneco (boné azul, cara branca com risca escura, babete, peito amarelo, dorso verde,
   asas azuis com barra branca, cauda azul que abana para cima e para baixo, patinhas finas).
   Habitat: o ninho de raminhos entrelaçados, com penas e três ovinhos azuis, num ramo da cerejeira. O passarinho agacha-se,
   salta, voa em arco a bater as asas, abre as asas e a cauda para travar, pousa no ninho (o ramo baixa com uma mola),
   aninha-se e afofa as penas. Camadas: ninho de trás (borda de trás, cova, ovos) → passarinho → ninho da frente (borda da frente).
   Fora do ninho está pousado na borda do banho de pássaros (bebe, toma banho, saltita, debica uma semente…).
   O passarinho é um boneco «2,5D» de elipsoides (corpo, peito, pescoço, cabeça, boné) projetados no ecrã a cada quadro;
   as asas, a cauda, o bico e o topete são peças planas postas no espaço com uma matriz afim.
   Organização:
     1) utilidades (matemática, vetores, projeção, IK, peças planas)
     2) geometria do passarinho (pose → elipses e matrizes no ecrã)
     3) desenho do passarinho (SVG das peças) e ícone do menu
     4) cenário (céu, colinas, aldeia, sebe, cerca, macieira, cerejeira, ninho, relva, banho de pássaros, bichos)
     5) montar(): saltinhos, voo, banho, comportamentos, piar, relógio único */
'use strict';
MODULOS.passarinho = (() => {
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

  // câmara ortogonal ligeiramente de cima (14°). A posição do passarinho guarda-se como (x, gy = y no ecrã do sítio onde
  // está pousado, y = altura acima desse sítio); um ponto (X, Y, Z) do mundo aparece no ecrã em (X, Z·sen − Y·cos).
  const ELEV = 14 * RAD, cE = Math.cos(ELEV), sE = Math.sin(ELEV);
  const VISTA = [0, sE, cE];
  const prof = w => w[1] * sE + w[2] * cE;                  // profundidade (maior = mais perto)
  const ESC = 1.18;                                        // tamanho do boneco (o mundo do passarinho é escalado à volta do sítio onde está pousado)
  const p2 = (c, w) => [c.o[0] + (w[0] - c.o[0]) * ESC, c.Y - ((w[1] - c.o[1]) * cE - (w[2] - c.o[2]) * sE) * c.qy * ESC];
  const pd = (c, v) => [v[0] * ESC, -(v[1] * cE - v[2] * sE) * c.qy * ESC];
  // elipsoide (centro + 3 semi-eixos em 3D) → elipse no ecrã (raiz quadrada simétrica da matriz projetada)
  function elipse(c, centro, eixos) {
    let a = 0, b = 0, d = 0;
    for (const v of eixos) { const x = v[0] * ESC, y = -(v[1] * cE - v[2] * sE) * c.qy * ESC; a += x * x; b += x * y; d += y * y; }
    const m = (a + d) / 2, r = Math.sqrt(Math.max(0, (a - d) * (a - d) / 4 + b * b));
    const s = p2(c, centro);
    return { x: s[0], y: s[1], rx: Math.sqrt(m + r), ry: Math.sqrt(Math.max(.01, m - r)), ang: .5 * Math.atan2(2 * b, a - d) / RAD, z: prof(centro) };
  }
  // referenciais: origem + eixos f (frente), u (cima), s (lado direito do passarinho)
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
  // peça plana (asa, cauda, bico, topete): desenhada em coordenadas locais (x, y) e posta no espaço com os eixos ex e ey.
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
  // brilho do lado da luz (de cima à esquerda), sempre por dentro da elipse
  const LUZ = [-.55, -.835];
  function luzOff(e, f) {
    const a = e.ang * RAD, ca = Math.cos(a), sa = Math.sin(a);
    const lx = LUZ[0] * ca + LUZ[1] * sa, ly = -LUZ[0] * sa + LUZ[1] * ca;
    const ox = lx * f * e.rx, oy = ly * f * e.ry;
    return [ox * ca - oy * sa, ox * sa + oy * ca];
  }
  // círculo como subcaminho (para juntar muitos num só path)
  const circ = (x, y, r) => `M${n(x - r)},${n(y)}a${n(r)},${n(r)} 0 1,0 ${n(2 * r)},0a${n(r)},${n(r)} 0 1,0 ${n(-2 * r)},0`;
  const elip = (x, y, rx, ry) => `M${n(x - rx)},${n(y)}a${n(rx)},${n(ry)} 0 1,0 ${n(2 * rx)},0a${n(rx)},${n(ry)} 0 1,0 ${n(-2 * rx)},0`;

  /* ================= 2) Geometria do passarinho ================= */
  const COR = { cont: '#2A2440', contM: '#14183A', contA: '#2A4A5E', contP: '#3A3A56' };
  const RO = 15.5;                                          // raio do olho
  const LADOS = [['E', -1], ['D', 1]];                      // E = lado esquerdo do passarinho (s < 0), D = direito
  // pose base, pousado: cF/cH/cP/cR = corpo (frente, altura, inclinação, balanço), hx/hy/hz = cabeça em relação ao centro do corpo,
  // hY/hP/hR = rodar a cabeça, cU/cY = cauda (para cima, para o lado), leque = abrir a cauda, a?/bat? = asas (abertura, batida),
  // puff = afofar as penas, sq = achatar, top = topete eriçado, enc = patas encolhidas (no ar)
  const BASE = { cF: 0, cH: 102, cP: 12, cR: 0, hx: 46, hy: 86, hz: 0, hY: 0, hP: 0, hR: 0, cU: 0, cY: 0, leque: 0, aE: 0, aD: 0, batE: 30, batD: 30, puff: 0, sq: 0, top: 0, enc: 0 };
  const NINHADO = Object.assign({}, BASE, { cH: 52, cP: 4, hx: 40, hy: 82, puff: .3, cU: 14 });   // aninhado no ninho: sentado, fofo
  const ROSTO = { abE: 1, abD: 1, feliz: 0, bico: 0, olhosEsc: 1 };
  const CHAVES = Object.keys(BASE);
  const AX_H = [64, 62, 62];                                // cabeça (frente, cima, lado)
  // penas desenhadas à superfície (pequenas escamas): no peito amarelo e no dorso verde
  const PENAS_P = (() => { const v = [], r = semente(23); for (const te of [-.62, -.3, 0, .3]) for (let i = -3; i <= 3; i++) v.push([i * .32 + (r() - .5) * .1, te + (r() - .5) * .08]); return v; })();
  const PENAS_T = (() => { const v = [], r = semente(41); for (const sg of [-1, 1]) for (const te of [.2, .5]) for (let i = 0; i < 5; i++) v.push([sg * (1.3 + i * .38 + r() * .1), te + (r() - .5) * .1]); return v; })();

  // linhas à superfície da cabeça: listas de (longitude, latitude), uma por lado; só os troços virados para nós
  const RISCA = LADOS.map(([, sg]) => Array.from({ length: 13 }, (_, i) => { const u = i / 12; return [sg * lerp(.2, 3.0, u), .02 + .12 * Math.sin(PI * Math.min(1, u * 1.6)) - .14 * u]; }));
  const COLAR = LADOS.map(([, sg]) => Array.from({ length: 12 }, (_, i) => { const u = i / 11; return [sg * lerp(.7, 3.05, u), lerp(-.8, -.3, Math.pow(u, .8))]; }));
  function faixa(c, R, ax, linhas) {
    let d = '';
    for (const pts of linhas) {
      let seg = [];
      const fecha = () => { if (seg.length > 1) d += liso(seg); seg = []; };
      for (const [fi, te] of pts) {
        const cf = Math.cos(fi), sf = Math.sin(fi), ct = Math.cos(te), st = Math.sin(te);
        const Pp = ponto(R, ax[0] * ct * cf, ax[1] * st, ax[2] * ct * sf);
        const N = vn(direcao(R, ct * cf / ax[0], st / ax[1], ct * sf / ax[2]));
        if (vp(N, VISTA) > -.05) seg.push(p2(c, Pp)); else fecha();
      }
      fecha();
    }
    return d || 'M0,0';
  }

  function geometria(P, pes) {
    const can = P.canto || 0;
    const o = [P.x, P.y + P.salto, P.gy / sE];
    const c = { o, Y: P.gy - o[1] * cE, qy: 1 - (P.sq || 0) };
    const h = P.h * RAD, F = [Math.sin(h), 0, Math.cos(h)], U = [0, 1, 0], S = [-Math.cos(h), 0, Math.sin(h)];
    const R0 = ref(o, F, U, S);
    const resp = P._resp || 0, pf = (P.puff || 0) + .25 * can;
    const B = filho(R0, P.cF, P.cH + (P._bob || 0) + 4 * can, 0, P.cP + (P._pb || 0) + 6 * can, 0, P.cR + (P._rl || 0));
    const G = { c, el: {}, z: {}, R0, B, F, S, olho: {} };
    const axT = [90 * (1 + .04 * pf), 82 * (1 + .015 * resp + .08 * pf), 78 * (1 + .02 * resp + .09 * pf)];
    G.el.tronco = elipR(c, B, [0, 0, 0], axT);
    const cP0 = [36, -14, 0], axP = [66 * (1 + .06 * pf), 66 * (1 + .025 * resp + .1 * pf), 70 * (1 + .025 * resp + .1 * pf)];
    G.el.peito = elipR(c, B, cP0, axP);
    // cauda: base (uropígio) e um leque de penas numa peça plana (no plano vertical do corpo) que abana para cima e para baixo
    const T = filho(B, -80, -2, 0, 38 - (P.cU + (P._cu || 0)), P.cY + (P._cw || 0), 0);
    G.el.cauda = elipR(c, T, [-4, 2, 0], [34, 24, 30]);
    G.cauda = plano(c, ponto(T, -10, 0, 0), vk(T.f, -1), vk(T.u, -1), .36);
    G.z.cauda = prof(ponto(T, -70, 0, 0)) - 30;
    // cabeça (presa ao corpo, mas com orientação própria) e o pescoço que a liga ao peito
    const sh = P.somH || 0;
    const Hc = ponto(B, P.hx + (P._hx || 0) - 6 * sh, P.hy + (P._hy || 0) + 8 * sh + 4 * can, P.hz);
    const N0 = ponto(B, 34, 36, 0);
    G.el.pesc = segm(c, N0, vlerp(N0, Hc, .7), 40, 40, 4);
    const Hd = roda(R0, Hc, P.hP + 10 * can + 12 * sh, P.hY, P.hR || 0);
    G.el.cabeca = elipR(c, Hd, [0, 0, 0], AX_H);
    G.el.bone = elipR(c, Hd, [-10, 44, 0], [63, 31, 62]);
    G.H = Hd; G.cab = p2(c, Hc);
    // topete (as penas do boné eriçam-se quando está contente ou espantado)
    const tp = limita(P.top || 0, 0, 1.2);
    G.topete = plano(c, ponto(Hd, -10, 54, 0), vk(vn(direcao(Hd, -.55 - .3 * tp, .85, 0)), .9 + .45 * tp), vk(Hd.f, 1.3), .55);
    // olhos, riscas escuras, babete e bochechas
    for (const [L, sg] of LADOS) {
      const s = sup(c, Hd, [0, 0, 0], AX_H, sg * .6, .14, RO, RO);
      let t1 = s.t1, t2 = vk(s.t2, -1), a = pd(c, t1), b = pd(c, t2);
      if (a[0] < 0) { t1 = vk(t1, -1); a = [-a[0], -a[1]]; }   // x local sempre para a direita do ecrã (os brilhos ficam do lado da luz)
      if (b[1] < 0) { t2 = vk(t2, -1); b = [-b[0], -b[1]]; }
      const ps = p2(c, s.P), k = P.olhosEsc || 1;
      G.olho[L] = { x: ps[0], y: ps[1], vis: s.vis, t1, t2, m: `matrix(${n3(a[0] * k)},${n3(a[1] * k)},${n3(b[0] * k)},${n3(b[1] * k)},${n(ps[0])},${n(ps[1])})` };
    }
    // risca escura do bico pelo olho até à nuca, e o colar que vai da nuca ao babete (linhas desenhadas à superfície da cabeça)
    G.riscas = faixa(c, Hd, AX_H, RISCA); G.colar = faixa(c, Hd, AX_H, COLAR);
    G.babete = sup(c, Hd, [0, 0, 0], AX_H, 0, -.74, 26, 19);
    G.boch = LADOS.map(([, sg]) => sup(c, Hd, [0, 0, 0], AX_H, sg * .78, -.28, 12, 8));
    // bico: curto e pontiagudo; a metade de baixo roda para abrir
    const bico = limita(Math.max(P.bico || 0, P.somB || 0), 0, 1);
    const Bi = roda(Hd, ponto(Hd, 58, -8, 0), -4, 0, 0);
    G.bicoS = plano(c, Bi.o, vk(Bi.f, 1.35), vk(Bi.u, -1.35), .55);
    const Li = filho(Bi, -1, -1, 0, -bico * 34, 0, 0);
    G.bicoI = plano(c, Li.o, vk(Li.f, 1.35), vk(Li.u, -1.35), .5);
    G.bocaAberta = bico;
    G.pontaBico = p2(c, ponto(Bi, 33, -1, 0));
    const pb = ponto(Bi, 16, 0, 0);
    G.zBico = prof(pb) - prof(Hc);
    // penas desenhadas à superfície (pequenas escamas em «U»), só as viradas para nós
    const arco = (R, ce, ax, fi, te, k) => {
      const s = sup(c, R, ce, ax, fi, te, 1, 1);
      if (s.vis < .25) return '';
      const a = p2(c, vs(vs(s.P, vk(s.t1, -k)), vk(s.t2, k * .3))), m = p2(c, vs(s.P, vk(s.t2, -k * .85))), b = p2(c, vs(vs(s.P, vk(s.t1, k)), vk(s.t2, k * .3)));
      return `M${n(a[0])},${n(a[1])}Q${n(m[0])},${n(m[1])} ${n(b[0])},${n(b[1])}`;
    };
    let pp = '', pt = '';
    for (const [fi, te] of PENAS_P) pp += arco(B, cP0, axP, fi, te, 8);
    for (const [fi, te] of PENAS_T) pt += arco(B, [0, 0, 0], axT, fi, te, 9);
    G.penasP = pp; G.penasT = pt;
    // asas: dobradas ao lado do corpo (penas para trás) → abertas (para cima e para fora), com a batida
    G.asa = {};
    for (const [L, sg] of LADOS) {
      const A0 = ponto(B, 26, 30, 64 * sg);
      const a = limita(P['a' + L] + (P.somA || 0), 0, 1), fi = (P['bat' + L] + (P._bf || 0)) * RAD;
      const sF = vn(direcao(B, -1, -.2, -.06 * sg)), cF0 = vn(direcao(B, -.18, -1, 0));
      const sO = vn(direcao(B, -.3, Math.sin(fi), Math.cos(fi) * sg)), cO = vn(direcao(B, -1, -.12, 0));
      const sp = vn(vlerp(sF, sO, a));
      let ch = vlerp(cF0, cO, a); ch = vn(vd(ch, vk(sp, vp(ch, sp))));
      const dv = Math.abs(vp(vx(sp, ch), VISTA));
      G.asa[L] = { m: plano(c, A0, sp, ch, .3), op: a > .3 ? 1 : limita((dv - .08) / .16, 0, 1) };
      G.z['asa' + L] = prof(B.o) + 120 * vp(vk(B.s, sg), VISTA) + 50 * a * Math.max(0, vp(sp, [0, 1, 0]));
    }
    // patas: anca (escondida nas penas) → calcanhar (para trás) → pé; dedos que agarram o poleiro (ou encolhidos no ar)
    for (const [L, sg] of LADOS) {
      const pe = pes[L];
      const Hp = ponto(B, -4, -52, 22 * sg);
      const enc = limita(P.enc || 0, 0, 1);
      const chao = [pe.p[0], pe.p[1] + P.y + P.salto, pe.p[2]];
      const dentro = ponto(B, -14, -80, 18 * sg);
      const heel = vlerp(chao, dentro, enc);
      const ank = vs(heel, [0, 5, 0]);
      const ik = ik2(Hp, ank, 32, 32, vs(vk(F, -1), [0, .2, 0]));
      G.el['coxa' + L] = segm(c, Hp, vlerp(Hp, ik.J, .9), 15, 14, 5);
      G.el['canela' + L] = segm(c, ik.J, ik.E, 4.6, 4.6, 1.5);
      G['calc' + L] = p2(c, heel);
      G['encP' + L] = enc;
      G.z['perna' + L] = -1e5 + prof(heel);
    }
    G.z.corpo = prof(B.o);
    G.z.cabeca = prof(Hc) + 4;
    return G;
  }

  /* ================= 3) Desenho do passarinho ================= */
  // asa (x ao longo da asa, da raiz até à ponta; y para a orla de trás): rémiges escuras com orla azul-clara,
  // coberturas azuis e a barra branca
  const ASA = 'M-6,-8 C20,-20 70,-22 118,-10 C148,-2 168,10 180,22 C170,28 158,29 148,27 C152,37 140,43 128,40 C130,50 116,55 104,50 C104,60 90,63 80,58 C78,66 64,68 56,62 C48,68 32,66 24,58 C10,52 -8,40 -10,18 Z';
  const ASA_REM = 'M148,27 C126,18 108,14 96,12 M128,40 C110,31 98,26 88,24 M104,50 C92,42 84,38 76,36 M80,58 C72,51 64,47 58,45';
  const ASA_ORLA = 'M150,25 C160,22 170,20 176,22 M130,38 C140,36 148,33 152,30 M106,48 C114,47 122,44 126,41 M82,56 C90,56 98,53 102,51';
  const ASA_COB = 'M-6,-8 C20,-20 58,-22 88,-14 C96,6 92,30 80,46 C60,54 36,56 20,52 C6,46 -8,34 -10,18 Z';
  const ASA_BARRA = 'M88,-14 C100,6 98,30 84,48 C78,50 72,51 66,52 C80,34 84,10 76,-16 Z';
  const ASA_COBL = 'M4,10 Q12,19 20,12 Q28,20 36,13 Q44,21 52,12 Q60,20 68,11';
  const ASA_BRILHO = 'M2,-10 C22,-20 48,-22 78,-16';
  // cauda: 5 penas em leque (x para trás, y para baixo)
  const PENA_C = 'M0,-8 C34,-11 94,-13 130,-10 C145,-8 145,8 130,11 C94,13 34,10 0,8 Z';
  const PENA_CR = 'M6,0 L126,0';
  // bico (x para a frente, y para baixo)
  const BICO_S = 'M-4,-9 C6,-10 16,-5 26,1 C17,3 6,3 -4,3 Z';
  const BICO_I = 'M-4,0 C6,1 13,2 21,3 C13,7 4,9 -4,7 Z';
  const BOCA = 'M-4,1 L18,2 L-4,-7 Z';
  // topete: tufo de penas (x para cima/trás, y para a frente)
  const TOPETE = 'M0,-14 C10,-14 22,-10 30,-4 C26,-2 22,-1 20,0 C26,2 30,6 32,10 C24,10 14,8 4,10 C-4,6 -6,-8 0,-14 Z';
  // dedos a agarrar o poleiro (no ecrã; x para a frente): 3 dedos à frente que caem pela frente do poleiro e 1 atrás
  const GARRA = 'M0,0 C6,-1 11,1 13,7 M0,0 C5,1 8,4 9,10 M0,0 C3,2 4,6 3,11 M0,0 C-5,0 -9,2 -10,7';
  const UNHAS = '<circle cx="13" cy="8" r="1.7"/><circle cx="9" cy="11" r="1.7"/><circle cx="3" cy="12" r="1.6"/><circle cx="-10" cy="8" r="1.6"/>';
  const ENCOLHIDO = 'M0,0 C6,0 9,3 7,7 M0,0 C3,2 4,5 1,8 M0,0 C-4,1 -6,3 -5,6';
  const NS_ = 'vector-effect="non-scaling-stroke"';

  function defsPassarinho() {
    return `
    <radialGradient id="passarinho-amarelo" cx=".4" cy=".34" r=".72"><stop offset="0" stop-color="#FFF4A0"/><stop offset=".45" stop-color="#FFDC3C"/><stop offset=".85" stop-color="#F2B01E"/><stop offset="1" stop-color="#D88E18"/></radialGradient>
    <radialGradient id="passarinho-oliva" cx=".4" cy=".32" r=".72"><stop offset="0" stop-color="#D2E482"/><stop offset=".5" stop-color="#9CBA48"/><stop offset=".85" stop-color="#6E8C2C"/><stop offset="1" stop-color="#56701E"/></radialGradient>
    <radialGradient id="passarinho-azul" cx=".42" cy=".3" r=".72"><stop offset="0" stop-color="#9AD4FF"/><stop offset=".45" stop-color="#4499EA"/><stop offset=".85" stop-color="#2166C2"/><stop offset="1" stop-color="#184E9A"/></radialGradient>
    <radialGradient id="passarinho-branco" cx=".4" cy=".34" r=".72"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F2F6FB"/><stop offset="1" stop-color="#C8D4E2"/></radialGradient>
    <radialGradient id="passarinho-marinho" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#46588E"/><stop offset="1" stop-color="#1C2650"/></radialGradient>
    <radialGradient id="passarinho-luz"><stop offset="0" stop-color="#FFFFF4" stop-opacity=".75"/><stop offset=".5" stop-color="#FFFFF4" stop-opacity=".3"/><stop offset="1" stop-color="#FFFFF4" stop-opacity="0"/></radialGradient>
    <radialGradient id="passarinho-sombraPena"><stop offset="0" stop-color="#5A3A10" stop-opacity=".32"/><stop offset=".55" stop-color="#5A3A10" stop-opacity=".14"/><stop offset="1" stop-color="#5A3A10" stop-opacity="0"/></radialGradient>
    <linearGradient id="passarinho-asa" x1="0" y1="0" x2="1" y2=".4"><stop offset="0" stop-color="#6AB2F4"/><stop offset=".5" stop-color="#3A82D8"/><stop offset="1" stop-color="#2560B2"/></linearGradient>
    <linearGradient id="passarinho-remiges" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3E68AE"/><stop offset=".6" stop-color="#2C4C8C"/><stop offset="1" stop-color="#22386E"/></linearGradient>
    <linearGradient id="passarinho-cauda" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4A90E0"/><stop offset=".6" stop-color="#2E64B4"/><stop offset="1" stop-color="#22488A"/></linearGradient>
    <radialGradient id="passarinho-iris" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="#6A4630"/><stop offset=".55" stop-color="#2E1C12"/><stop offset="1" stop-color="#140C08"/></radialGradient>
    <linearGradient id="passarinho-palp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A4C82"/><stop offset="1" stop-color="#24305E"/></linearGradient>
    <linearGradient id="passarinho-bico" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6A6E7E"/><stop offset=".6" stop-color="#3A3C48"/><stop offset="1" stop-color="#26262E"/></linearGradient>
    <radialGradient id="passarinho-perna" cx=".4" cy=".4" r=".7"><stop offset="0" stop-color="#A8B6D8"/><stop offset="1" stop-color="#5E6E98"/></radialGradient>
    <radialGradient id="passarinho-sombra"><stop offset="0" stop-color="#2E3A1A" stop-opacity=".42"/><stop offset=".6" stop-color="#2E3A1A" stop-opacity=".2"/><stop offset="1" stop-color="#2E3A1A" stop-opacity="0"/></radialGradient>
    <clipPath id="passarinho-clip-corpo"><circle class="pa-clipT" r="1"/><circle class="pa-clipP" r="1"/></clipPath>
    <clipPath id="passarinho-clip-cabeca"><circle class="pa-clipH" r="1"/></clipPath>
    <clipPath id="passarinho-clip-olho"><circle r="${RO}"/></clipPath>`;
  }
  const contornoSVG = (nm, o, cor) => `<circle class="pa-${nm}-c" r="1" fill="${cor || COR.cont}" data-o="${o}"/>`;
  const enchSVG = (nm, f, l) => `<circle class="pa-${nm}-e" r="1" fill="${f}"/>` + (l ? `<circle class="pa-${nm}-l" r="1" fill="${l}"/>` : '');
  function olhoSVG(L) {
    return `<g class="pa-olho${L}">
      <circle r="${n(RO + 4.2)}" fill="${COR.contM}" opacity=".9"/>
      <circle r="${n(RO + 2.4)}" fill="#F4F2EC"/>
      <circle r="${RO}" fill="url(#passarinho-iris)"/>
      <g clip-path="url(#passarinho-clip-olho)">
        <g class="pa-iris${L}"><circle r="${n(RO * .84)}" fill="url(#passarinho-iris)"/><circle r="${n(RO * .5)}" fill="#0A0604"/></g>
        <circle cx="${n(-RO * .3)}" cy="${n(-RO * .34)}" r="${n(RO * .33)}" fill="#FFFFFF"/>
        <circle cx="${n(RO * .32)}" cy="${n(RO * .3)}" r="${n(RO * .14)}" fill="#FFFFFF" opacity=".85"/>
        <path class="pa-palpI${L}" fill="#2A386A"/><path class="pa-orlaI${L}" fill="none" stroke="#141C3E" stroke-width="1.6"/>
        <path class="pa-palpS${L}" fill="url(#passarinho-palp)"/><path class="pa-orla${L}" fill="none" stroke="#10163A" stroke-width="2.4" stroke-linecap="round"/>
      </g>
    </g>`;
  }
  function passarinhoSVG() {
    const asa = L => `<g class="pa-g-asa${L}"><g class="pa-asa${L}">
        <path d="${ASA}" fill="url(#passarinho-remiges)" stroke="${COR.contM}" stroke-width="2.4" stroke-linejoin="round" ${NS_}/>
        <path d="${ASA_REM}" fill="none" stroke="#16224A" stroke-width="1.4" stroke-linecap="round" opacity=".7" ${NS_}/>
        <path d="${ASA_ORLA}" fill="none" stroke="#9CCBF4" stroke-width="2.2" stroke-linecap="round" opacity=".8" ${NS_}/>
        <path d="${ASA_COB}" fill="url(#passarinho-asa)" stroke="${COR.contM}" stroke-width="1.8" ${NS_}/>
        <path d="${ASA_BARRA}" fill="#F8FBFF" stroke="#9AB4D4" stroke-width="1" ${NS_}/>
        <path d="${ASA_COBL}" fill="none" stroke="#1E4E9A" stroke-width="1.5" opacity=".75" ${NS_}/>
        <path d="${ASA_BRILHO}" fill="none" stroke="#C4E6FF" stroke-width="3.4" stroke-linecap="round" opacity=".75" ${NS_}/>
      </g></g>`;
    const perna = L => `<g class="pa-g-perna${L}">
        ${contornoSVG('coxa' + L, 2.4)}${contornoSVG('canela' + L, 1.8, COR.contP)}
        <circle class="pa-coxa${L}-e" r="1" fill="#E8D47A"/><circle class="pa-canela${L}-e" r="1" fill="url(#passarinho-perna)"/>
        <g class="pa-pe${L}"><path class="pa-dedos${L}" d="${GARRA}" stroke="${COR.contP}" stroke-width="6.4" fill="none" stroke-linecap="round" ${NS_}/>
          <path class="pa-dedosI${L}" d="${GARRA}" stroke="#8494BC" stroke-width="3.6" fill="none" stroke-linecap="round" ${NS_}/><g class="pa-unhas${L}" fill="#2A2A3A">${UNHAS}</g></g>
      </g>`;
    const penasC = [0, 1, 2, 3, 4].map(i => `<g class="pa-penaC${i}"><path d="${PENA_C}" fill="url(#passarinho-cauda)" stroke="${COR.contM}" stroke-width="1.8" stroke-linejoin="round" ${NS_}/>
        <path d="${PENA_CR}" stroke="#8CC4F4" stroke-width="1.6" opacity=".55" ${NS_}/></g>`);
    const cauda = `<g class="pa-g-cauda"><g class="pa-cauda">${penasC[0]}${penasC[4]}${penasC[1]}${penasC[3]}${penasC[2]}</g></g>`;
    const corpo = `<g class="pa-g-corpo">
        ${contornoSVG('cauda', 2.6)}${contornoSVG('tronco', 3)}${contornoSVG('peito', 3)}${contornoSVG('pesc', 3)}
        ${enchSVG('cauda', 'url(#passarinho-oliva)')}${enchSVG('pesc', 'url(#passarinho-amarelo)')}
        ${enchSVG('tronco', 'url(#passarinho-oliva)', 'url(#passarinho-luz)')}
        <path class="pa-penasT" fill="none" stroke="#5E7A22" stroke-width="1.7" stroke-linecap="round" opacity=".6"/>
        ${enchSVG('peito', 'url(#passarinho-amarelo)', 'url(#passarinho-luz)')}
        <g clip-path="url(#passarinho-clip-corpo)"><ellipse class="pa-sombraT" rx="1" ry="1" fill="url(#passarinho-sombraPena)"/></g>
        <path class="pa-penasP" fill="none" stroke="#D89A1A" stroke-width="1.7" stroke-linecap="round" opacity=".6"/>
      </g>`;
    const cabeca = `<g class="pa-g-cabeca">
        <g class="pa-slotBicoA"></g>
        <g class="pa-topete"><path d="${TOPETE}" fill="url(#passarinho-azul)" stroke="${COR.contM}" stroke-width="2" stroke-linejoin="round" ${NS_}/>
          <path d="M4,-8 C12,-8 20,-6 26,-3" stroke="#B8E0FF" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8" ${NS_}/></g>
        ${contornoSVG('cabeca', 3)}
        ${enchSVG('cabeca', 'url(#passarinho-branco)')}
        <g clip-path="url(#passarinho-clip-cabeca)">
          <ellipse class="pa-babete" rx="1" ry="1" fill="#1E2A58"/>
          <path class="pa-colarL" fill="none" stroke="#1E2A58" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
          <circle class="pa-bone-e" r="1" fill="url(#passarinho-azul)"/>
          <path class="pa-riscas" fill="none" stroke="#1E2A58" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
          <circle class="pa-cabeca-l" r="1" fill="url(#passarinho-luz)"/>
          <g fill="#FF8FA8">${[0, 1].map(i => `<ellipse class="pa-boch${i}" rx="1" ry="1"/>`).join('')}</g>
          ${olhoSVG('E')}${olhoSVG('D')}
        </g>
        <g class="pa-slotBicoF"><g class="pa-bico">
          <g class="pa-bicoI"><path class="pa-boca" d="${BOCA}" fill="#E85A6A" display="none"/><path d="${BICO_I}" fill="#3A3C48" stroke="${COR.contM}" stroke-width="1.8" stroke-linejoin="round" ${NS_}/><ellipse class="pa-semBico" cx="19" cy="2" rx="7" ry="3.8" fill="#3A3428" stroke="#EDE6D2" stroke-width="1.2" display="none" ${NS_}/></g>
          <g class="pa-bicoS"><path d="${BICO_S}" fill="url(#passarinho-bico)" stroke="${COR.contM}" stroke-width="2" stroke-linejoin="round" ${NS_}/>
            <path d="M0,-6 C8,-6 14,-3 20,0" stroke="#A8ACBC" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8" ${NS_}/></g>
        </g></g>
      </g>`;
    return `<g class="pa-passaro">
      <ellipse class="pa-sombra" rx="1" ry="1" fill="url(#passarinho-sombra)"/>
      <g class="pa-partes">${perna('E')}${perna('D')}${asa('E')}${cauda}${corpo}${cabeca}${asa('D')}</g>
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

  /* --- ícone do menu: chapim-azul num raminho de cerejeira em flor, com cores lisas (sem gradientes com id) --- */
  function iconeSVG() {
    const C = COR.cont, M = COR.contM;
    let flores = '';
    for (const [x, y, k] of [[34, 150, 1], [62, 176, .8], [186, 168, .9], [204, 140, .7], [20, 120, .7]]) {
      let p = '';
      for (let i = 0; i < 5; i++) { const a = i / 5 * 2 * PI - PI / 2; p += circ(x + Math.cos(a) * 8 * k, y + Math.sin(a) * 8 * k, 6.5 * k); }
      flores += `<path d="${p}" fill="#FFD2E0" stroke="#E890B0" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="${n(4 * k)}" fill="#F0B030"/>`;
    }
    return `<circle cx="110" cy="110" r="106" fill="#CDEBFF"/>
      <path d="M8,150 C60,136 160,136 212,148 A106,106 0 0 1 8,150 Z" fill="#9CD06A"/>
      <path d="M4,170 C60,160 120,158 216,166" stroke="#6A4630" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M4,170 C60,160 120,158 216,166" stroke="#9A6A48" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${flores}
      <path d="M58,124 C34,118 18,122 8,132 C24,134 40,134 60,132 Z" fill="#2E64B4" stroke="${M}" stroke-width="2"/>
      <path d="M96,160 L92,170 M114,160 L118,170" stroke="${C}" stroke-width="5" stroke-linecap="round"/><path d="M96,160 L92,170 M114,160 L118,170" stroke="#8494BC" stroke-width="2.6" stroke-linecap="round"/>
      <ellipse cx="102" cy="126" rx="48" ry="40" fill="${C}"/><ellipse cx="102" cy="126" rx="45.5" ry="37.5" fill="#9CBA48"/>
      <ellipse cx="118" cy="136" rx="34" ry="30" fill="#FFD83A"/>
      <path d="M58,110 C80,104 110,110 112,130 C100,148 74,152 58,140 Z" fill="#3A82D8" stroke="${M}" stroke-width="2"/>
      <path d="M86,108 C94,118 94,134 84,146" stroke="#F8FBFF" stroke-width="6" fill="none"/>
      <ellipse cx="132" cy="96" rx="34" ry="33" fill="${C}"/><ellipse cx="132" cy="96" rx="31.5" ry="30.5" fill="#FFFFFF"/>
      <path d="M101,90 C104,70 120,62 134,63 C150,64 162,74 163,88 C150,80 118,80 101,90 Z" fill="#3A8FE0" stroke="${M}" stroke-width="1.6"/>
      <path d="M118,64 C122,54 134,52 140,58 C136,60 130,62 126,66 Z" fill="#3A8FE0" stroke="${M}" stroke-width="1.6"/>
      <path d="M104,96 C116,92 130,94 160,96 L160,103 C134,102 118,102 104,104 Z" fill="#1E2A58"/>
      <path d="M118,120 C128,128 142,126 150,116 C142,124 128,126 118,120 Z" fill="#1E2A58" stroke="#1E2A58" stroke-width="6" stroke-linejoin="round"/>
      <path d="M160,96 L178,101 L160,106 Z" fill="#3A3C48" stroke="${M}" stroke-width="1.6" stroke-linejoin="round"/>
      <ellipse cx="146" cy="110" rx="7" ry="4.6" fill="#FF8FA8" opacity=".6"/>
      <circle cx="146" cy="98" r="9" fill="#F4F2EC"/><circle cx="146" cy="98" r="7.4" fill="#2E1C12"/><circle cx="146.6" cy="98.6" r="4" fill="#0A0604"/>
      <circle cx="143.6" cy="95.4" r="2.6" fill="#FFFFFF"/><circle cx="148.6" cy="100.6" r="1.1" fill="#FFFFFF"/>`;
  }

  /* ================= 4) Cenário: jardim e pomar na primavera ================= */
  const TANQUE = { x: 600, y: 610, rx: 168, ry: 34, ax: 142, ay: 24, bx: 155, by: 29 };   // banho de pássaros: borda (fora/dentro) e linha do meio da borda
  const AGUA_Y = TANQUE.y + 3;                               // superfície da água
  const bordaY = x => TANQUE.y + TANQUE.by * Math.sqrt(Math.max(0, 1 - Math.pow((x - TANQUE.x) / TANQUE.bx, 2)));
  const REPOUSO = { x: 732, h: -34 };                       // pousado na borda da frente, à direita
  const BANHO = { x: 612, gy: TANQUE.y + 20 };              // de pé dentro da água
  const NINHO = { x: 1032, y: 500, rx: 128, ry: 31 };       // borda do ninho (centro e raios)
  const NO_NINHO = { x: 1032, gy: 566, h: -22 };            // pés do passarinho aninhado
  const RAMO_X0 = 1400;                                     // onde o ramo do ninho nasce do tronco
  const NUV = [{ x: 140, y: 96, k: 1 }, { x: 720, y: 60, k: .75 }, { x: 1100, y: 236, k: .7 }, { x: 1480, y: 110, k: .9 }];
  const SOL = { x: 262, y: 150 };
  const SEMENTE = { x: 610 };                               // semente de girassol na borda do banho

  function defsCena() {
    return `
    <linearGradient id="passarinho-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5AAEEA"/><stop offset=".45" stop-color="#8CCAF4"/><stop offset=".8" stop-color="#C6E8FC"/><stop offset="1" stop-color="#E8F6FF"/></linearGradient>
    <radialGradient id="passarinho-solBrilho"><stop offset="0" stop-color="#FFFDEA" stop-opacity="1"/><stop offset=".14" stop-color="#FFF6C4" stop-opacity=".8"/><stop offset=".45" stop-color="#FFF2C8" stop-opacity=".25"/><stop offset="1" stop-color="#FFF2C8" stop-opacity="0"/></radialGradient>
    <radialGradient id="passarinho-sol" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#FFFFF6"/><stop offset=".7" stop-color="#FFF6C0"/><stop offset="1" stop-color="#FFE68A"/></radialGradient>
    <linearGradient id="passarinho-serra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CC0D8"/><stop offset="1" stop-color="#B8D6E4"/></linearGradient>
    <linearGradient id="passarinho-colina" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B4D888"/><stop offset=".6" stop-color="#94C46A"/><stop offset="1" stop-color="#7AAE56"/></linearGradient>
    <linearGradient id="passarinho-colina2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A0CC70"/><stop offset="1" stop-color="#76A84A"/></linearGradient>
    <linearGradient id="passarinho-sebe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E9A3A"/><stop offset=".5" stop-color="#3E7A2A"/><stop offset="1" stop-color="#2A5A20"/></linearGradient>
    <linearGradient id="passarinho-relva" gradientUnits="userSpaceOnUse" x1="0" y1="630" x2="0" y2="900"><stop offset="0" stop-color="#9ACE5E"/><stop offset=".4" stop-color="#7EBC48"/><stop offset="1" stop-color="#5A9A34"/></linearGradient>
    <linearGradient id="passarinho-madeira" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D8B286"/><stop offset=".5" stop-color="#B08458"/><stop offset="1" stop-color="#7E5634"/></linearGradient>
    <linearGradient id="passarinho-tronco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8A6650"/><stop offset=".45" stop-color="#6A4838"/><stop offset="1" stop-color="#42281E"/></linearGradient>
    <linearGradient id="passarinho-ramo" gradientUnits="userSpaceOnUse" x1="0" y1="520" x2="0" y2="600"><stop offset="0" stop-color="#9A7660"/><stop offset=".45" stop-color="#6E4C3A"/><stop offset="1" stop-color="#3E2618"/></linearGradient>
    <radialGradient id="passarinho-flor" cx=".36" cy=".3" r=".75"><stop offset="0" stop-color="#FFF4F8"/><stop offset=".45" stop-color="#FFD0E0"/><stop offset=".85" stop-color="#F2A4C2"/><stop offset="1" stop-color="#DE86AA"/></radialGradient>
    <radialGradient id="passarinho-florM" cx=".36" cy=".3" r=".75"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#FCEFF2"/><stop offset="1" stop-color="#E8C8D4"/></radialGradient>
    <radialGradient id="passarinho-folhas" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#A8D46A"/><stop offset=".6" stop-color="#6EA840"/><stop offset="1" stop-color="#4A8030"/></radialGradient>
    <linearGradient id="passarinho-pedra" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#EAE4DA"/><stop offset=".5" stop-color="#C8BEB0"/><stop offset="1" stop-color="#968A7C"/></linearGradient>
    <linearGradient id="passarinho-pedraB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4EEE4"/><stop offset="1" stop-color="#C2B6A6"/></linearGradient>
    <linearGradient id="passarinho-agua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CD8F2"/><stop offset=".5" stop-color="#6AB8E2"/><stop offset="1" stop-color="#4A98CA"/></linearGradient>
    <linearGradient id="passarinho-ninho" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C49A64"/><stop offset=".5" stop-color="#9A7044"/><stop offset="1" stop-color="#6A4828"/></linearGradient>
    <radialGradient id="passarinho-cova" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#4A3020"/><stop offset="1" stop-color="#7A5432"/></radialGradient>
    <radialGradient id="passarinho-ovo" cx=".38" cy=".32" r=".7"><stop offset="0" stop-color="#F0FAFF"/><stop offset=".5" stop-color="#BCE2F2"/><stop offset="1" stop-color="#8CC2DA"/></radialGradient>
    <radialGradient id="passarinho-sombraChao"><stop offset="0" stop-color="#2E4A1A" stop-opacity=".38"/><stop offset="1" stop-color="#2E4A1A" stop-opacity="0"/></radialGradient>
    <radialGradient id="passarinho-gota" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#C8EEFF"/><stop offset="1" stop-color="#7CC4EA"/></radialGradient>
    <radialGradient id="passarinho-vinheta" cx=".5" cy=".46" r=".75"><stop offset=".64" stop-color="#1A3A40" stop-opacity="0"/><stop offset="1" stop-color="#1A3A40" stop-opacity=".2"/></radialGradient>`;
  }

  // flor de cinco pétalas (subcaminhos) e pétala solta de cerejeira (com o chanfro na ponta)
  function flor5(x, y, k, rot) {
    let p = '';
    for (let i = 0; i < 5; i++) { const a = rot + i / 5 * 2 * PI; p += circ(x + Math.cos(a) * 6.4 * k, y + Math.sin(a) * 6.4 * k, 5.4 * k); }
    return p;
  }
  const PETALA = 'M0,7 C-7,2 -6,-6 -1.6,-6.6 L0,-4.4 L1.6,-6.6 C6,-6 7,2 0,7 Z';

  /* --- céu: sol à esquerda, nuvens, andorinhas ao longe --- */
  function nuvemSVG(i) {
    return `<g class="pa-nuvem${i}"><g>
      <ellipse cx="6" cy="14" rx="86" ry="15" fill="#D2E6F4"/>
      <path d="${circ(-48, 2, 25)}${circ(-12, -16, 36)}${circ(30, -6, 30)}${circ(62, 6, 18)}" fill="#FFFFFF"/>
      <ellipse cx="4" cy="9" rx="80" ry="13" fill="#F2F8FC"/>
      <path d="M-62,16 C-24,25 30,25 78,15" stroke="#BCD6EA" stroke-width="4" fill="none" opacity=".8"/>
    </g></g>`;
  }
  function ceuSVG() {
    return `<rect x="-20" y="-20" width="1640" height="680" fill="url(#passarinho-ceu)"/>
      <circle cx="${SOL.x}" cy="${SOL.y}" r="420" fill="url(#passarinho-solBrilho)"/>
      <circle cx="${SOL.x}" cy="${SOL.y}" r="52" fill="url(#passarinho-sol)"/>
      <circle class="pa-solAura" cx="${SOL.x}" cy="${SOL.y}" r="68" fill="#FFFBE0" opacity=".35"/>
      ${NUV.map((c, i) => nuvemSVG(i)).join('')}
      <g opacity=".5" fill="none" stroke="#3A4A6A" stroke-width="2.2" stroke-linecap="round">
        <path class="pa-ave0" d="M-9,0 Q-4,-6 0,0 Q4,-6 9,0"/><path class="pa-ave1" d="M-7,0 Q-3,-5 0,0 Q3,-5 7,0"/>
      </g>`;
  }
  /* --- serra azulada, colinas com campos, a aldeia (casas brancas, telhados de telha e a torre da igreja) e um pomar ao longe --- */
  function longeSVG() {
    const r = semente(13);
    let casas = '', telhados = '', janelas = '';
    const pos = [[330, 486], [372, 492], [410, 482], [560, 478], [598, 488], [640, 480], [690, 490], [880, 484], [920, 476], [962, 488], [1010, 480], [1160, 488], [1204, 480], [1250, 490]];
    for (const [x, y] of pos) {
      const w = 26 + r() * 12, hh = 15 + r() * 6;
      casas += `M${n(x)},${n(y)}h${n(w)}v${n(hh)}h${n(-w)}Z`;
      telhados += `M${n(x - 3)},${n(y)}L${n(x + w / 2)},${n(y - 9 - r() * 3)}L${n(x + w + 3)},${n(y)}Z`;
      janelas += `M${n(x + 5)},${n(y + 5)}h4v5h-4Z M${n(x + w - 9)},${n(y + 5)}h4v5h-4Z`;
    }
    let pomar = '', pomarF = '', pomarT = '';
    for (let i = 0; i < 16; i++) {
      const x = 40 + i * 104 + r() * 30, y = 532 + r() * 8, k = .8 + r() * .4;
      pomarT += `M${n(x)},${n(y)}l0,${n(-16 * k)}`;
      pomar += circ(x, y - 28 * k, 20 * k) + circ(x - 12 * k, y - 20 * k, 12 * k) + circ(x + 13 * k, y - 22 * k, 13 * k);
      for (let j = 0; j < 4; j++) pomarF += circ(x + (r() - .5) * 30 * k, y - 28 * k + (r() - .5) * 22 * k, 3.4 * k);
    }
    return `<path d="M-20,458 C80,430 180,412 300,424 C420,436 500,404 620,414 C700,420 760,438 860,426 C980,410 1060,392 1180,404 C1300,416 1400,398 1500,408 C1560,414 1600,420 1620,422 L1620,540 L-20,540 Z" fill="url(#passarinho-serra)"/>
      <rect x="-20" y="440" width="1640" height="70" fill="#F2FAFF" opacity=".25"/>
      <path d="M-20,500 C140,470 300,466 460,476 C600,486 700,466 840,462 C980,458 1100,478 1240,474 C1380,470 1500,460 1620,466 L1620,600 L-20,600 Z" fill="url(#passarinho-colina)"/>
      <path d="M200,540 C260,506 340,494 420,494 C500,494 560,506 600,520 L620,560 Z M1060,540 C1100,508 1160,494 1240,492 C1320,490 1380,500 1420,512 L1440,560 Z" fill="#A6D07A" opacity=".8"/>
      <path d="M220,520 L600,512 M240,530 L606,524 M1080,522 L1420,508 M1090,534 L1430,522" stroke="#88B65C" stroke-width="2.4" opacity=".7"/>
      <path d="${casas}" fill="#FBF8F2" stroke="#C8C0B4" stroke-width="1"/><path d="${janelas}" fill="#6A7A94"/>
      <path d="${telhados}" fill="#D2704A" stroke="#9A4A2A" stroke-width="1"/>
      <g transform="translate(780,476)"><rect x="-16" y="-14" width="32" height="20" fill="#FBF8F2" stroke="#C8C0B4" stroke-width="1"/><path d="M-18,-14 L0,-26 L18,-14 Z" fill="#D2704A"/>
        <rect x="14" y="-46" width="13" height="52" fill="#FFFDF8" stroke="#C8C0B4" stroke-width="1"/><path d="M12,-46 L20.5,-58 L29,-46 Z" fill="#D2704A"/>
        <rect x="17.5" y="-40" width="6" height="7" rx="3" fill="#6A7A94"/><path d="M20.5,-58 L20.5,-66 M17,-62.5 L24,-62.5" stroke="#6A6A7A" stroke-width="1.6"/>
        <rect x="-4" y="-6" width="8" height="12" rx="4" fill="#8A7A6A"/></g>
      <path d="${pomarT}" stroke="#8A6A50" stroke-width="3"/>
      <path d="${pomar}" fill="#9CC86A"/><path d="${pomarF}" fill="#FFE6EE"/>
      <rect x="-20" y="520" width="1640" height="30" fill="#F4FFF0" opacity=".2"/>`;
  }
  /* --- sebe de buxo ao fundo do jardim, com folhinhas, e uma cerca de madeira à frente (à esquerda) --- */
  function sebeSVG() {
    const r = semente(31);
    let topo = 'M-20,566';
    for (let x = -20; x <= 1640; x += 40) topo += `Q${x + 20},${n(540 + r() * 10)} ${x + 40},${n(562 + r() * 8)}`;
    let f1 = '', f2 = '', f3 = '';
    for (let i = 0; i < 260; i++) {
      const x = -20 + r() * 1660, y = 556 + r() * 96, rr = 4 + r() * 4;
      const d = elip(x, y, rr * 1.3, rr * .8);
      const k = r(); if (k < .4 || y < 572) f1 += d; else if (k < .75) f2 += d; else f3 += d;
    }
    const poste = x => `<path d="M${x},700 L${x},618 L${x + 9},608 L${x + 18},618 L${x + 18},700 Z" fill="url(#passarinho-madeira)" stroke="#5A3E24" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M${x + 5},622 C${x + 4},650 ${x + 7},676 ${x + 5},696" stroke="#7A5434" stroke-width="1.2" fill="none" opacity=".6"/>`;
    let postes = '';
    for (let x = 20; x < 440; x += 92) postes += poste(x);
    for (let x = 1236; x < 1620; x += 96) postes += poste(x);
    return `<path d="${topo} L1640,670 L-20,670 Z" fill="url(#passarinho-sebe)"/>
      <path d="${f3}" fill="#2E6222"/><path d="${f2}" fill="#4E8A32"/><path d="${f1}" fill="#78B04A"/>
      <path d="${topo}" stroke="#9ACC64" stroke-width="3" fill="none" opacity=".6"/>
      <rect x="-20" y="630" width="1640" height="40" fill="#1E4618" opacity=".25"/>
      <ellipse cx="230" cy="702" rx="240" ry="8" fill="url(#passarinho-sombraChao)"/><ellipse cx="1430" cy="702" rx="220" ry="8" fill="url(#passarinho-sombraChao)"/>
      <path d="M0,636 L452,636 M0,672 L452,672 M1226,636 L1640,636 M1226,672 L1640,672" stroke="#5A3E24" stroke-width="11" stroke-linecap="round"/>
      <path d="M0,636 L452,636 M0,672 L452,672 M1226,636 L1640,636 M1226,672 L1640,672" stroke="#C49A6E" stroke-width="7" stroke-linecap="round"/>
      <path d="M0,634 L452,634 M1226,634 L1640,634" stroke="#E8CCA2" stroke-width="2" opacity=".7"/>
      ${postes}`;
  }
  /* --- relva com riscas de cortar, margaridas, dentes-de-leão e trevos --- */
  function relvaSVG() {
    const r = semente(5);
    let erva = '', erva2 = '';
    for (let i = 0; i < 150; i++) {
      const x = r() * 1600, y = 660 + Math.pow(r(), 1.4) * 230, h = 6 + (y - 650) / 18 + r() * 6;
      const d = `M${n(x)},${n(y)} q${n(-1 + r() * 2)},${n(-h * .6)} ${n(-3 + r() * 6)},${n(-h)}`;
      if (r() < .5) erva += d; else erva2 += d;
    }
    let mp = '', mc = '', ms = '';
    for (let i = 0; i < 34; i++) {
      const x = r() * 1600, y = 680 + Math.pow(r(), 1.2) * 150, k = .5 + (y - 670) / 300;
      if (x > 430 && x < 780 && y < 820) continue;          // não tapar o pé do banho
      ms += `M${n(x)},${n(y + 2)}l0,${n(10 * k)}`;
      for (let a = 0; a < 360; a += 30) { const c = Math.cos(a * RAD), s = Math.sin(a * RAD); mp += elip(x + c * 6 * k, y + s * 3.4 * k, 4.4 * k, 1.8 * k); }
      mc += circ(x, y, 2.6 * k);
    }
    let dl = '';
    for (let i = 0; i < 8; i++) { const x = r() * 1600, y = 690 + r() * 140; if (x > 430 && x < 780) continue; dl += circ(x, y, 5 + r() * 2); }
    let trevo = '';
    for (let i = 0; i < 14; i++) { const x = r() * 1600, y = 700 + r() * 160; for (let a = 0; a < 3; a++) { const an = a * 2.1 + .5; trevo += circ(x + Math.cos(an) * 4.5, y + Math.sin(an) * 2.6, 4); } }
    return `<rect x="-20" y="640" width="1640" height="280" fill="url(#passarinho-relva)"/>
      <path d="M-20,700 C300,690 700,706 1000,698 C1300,690 1500,702 1640,696 L1640,740 C1500,746 1300,734 1000,744 C700,752 300,736 -20,746 Z M-20,800 C300,790 700,806 1000,798 C1300,790 1500,802 1640,796 L1640,850 C1500,856 1300,844 1000,854 C700,862 300,846 -20,856 Z" fill="#B4DE78" opacity=".35"/>
      <path d="M-20,650 C400,660 1200,656 1640,652 L1640,672 C1200,676 400,680 -20,670 Z" fill="#5A8A34" opacity=".35"/>
      <path d="${trevo}" fill="#5E9E3A"/>
      <path d="${erva}" stroke="#5E9A38" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="${erva2}" stroke="#A4D468" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="${ms}" stroke="#4E8A30" stroke-width="1.6"/>
      <path d="${mp}" fill="#FFFFFF" stroke="#D8D4E4" stroke-width=".6"/><path d="${mc}" fill="#F6C624"/>
      <path d="${dl}" fill="#FFD21E" stroke="#E0A010" stroke-width="1"/>`;
  }
  /* --- copa em flor: um monte de flores (massa clara, sombra por baixo à direita, florinhas por cima) --- */
  function copaFlor(x, y, rx, ry, sem, branca) {
    const r = semente(sem);
    let massa = '', sombra = '', luz = '', flores = '', miolos = '', folhas = '';
    for (let i = 0; i < 9; i++) { const a = i / 9 * 2 * PI, rr = (.5 + r() * .25) * Math.min(rx, ry); massa += circ(x + Math.cos(a) * rx * .55, y + Math.sin(a) * ry * .5, rr); }
    massa += circ(x, y, Math.min(rx, ry) * .72);
    for (let i = 0; i < 5; i++) { const a = .2 + i / 5 * 1.6, rr = (.3 + r() * .15) * Math.min(rx, ry); sombra += circ(x + Math.cos(a) * rx * .5, y + Math.sin(a) * ry * .5 + ry * .1, rr); }
    for (let i = 0; i < 4; i++) { const a = PI + .4 + i * .45, rr = (.24 + r() * .1) * Math.min(rx, ry); luz += circ(x + Math.cos(a) * rx * .42, y + Math.sin(a) * ry * .42, rr); }
    const N = Math.round(rx * ry / 900);
    for (let i = 0; i < N; i++) {
      const a = r() * 2 * PI, d = Math.sqrt(r()), fx = x + Math.cos(a) * rx * .95 * d, fy = y + Math.sin(a) * ry * .9 * d, k = .75 + r() * .45;
      flores += flor5(fx, fy, k, r() * 2); miolos += circ(fx, fy, 2.2 * k);
    }
    for (let i = 0; i < 7; i++) { const a = r() * 2 * PI, fx = x + Math.cos(a) * rx * .85, fy = y + Math.sin(a) * ry * .8; folhas += `M${n(fx)},${n(fy)}q${n(8 + r() * 6)},${n(-10)} ${n(18)},${n(-2)}q${n(-8)},${n(10)} ${n(-18)},${n(2)}Z`; }
    return `<path d="${massa}" fill="url(#${branca ? 'passarinho-florM' : 'passarinho-flor'})"/>
      <path d="${sombra}" fill="${branca ? '#D8B8C6' : '#E28EB2'}" opacity=".55"/>
      <path d="${folhas}" fill="#7EB04A" stroke="#4E8030" stroke-width="1"/>
      <path d="${luz}" fill="#FFF6FA" opacity=".6"/>
      <path d="${flores}" fill="${branca ? '#FFFFFF' : '#FFE4EE'}" stroke="${branca ? '#E6C4D2' : '#E79AB8'}" stroke-width="1"/>
      <path d="${miolos}" fill="${branca ? '#F2C640' : '#E6607E'}"/>`;
  }
  /* --- macieira em flor à esquerda (flores brancas com rosa) --- */
  function macieiraSVG() {
    return `<ellipse cx="210" cy="706" rx="150" ry="14" fill="url(#passarinho-sombraChao)"/>
      <path d="M168,712 C176,640 166,560 180,480 C188,430 176,400 160,370 L184,362 C200,392 210,420 206,470 C222,430 250,404 282,388 L292,402 C258,426 232,462 220,520 C214,580 222,650 222,712 Z" fill="url(#passarinho-tronco)" stroke="#3A2418" stroke-width="2"/>
      <path d="M182,700 C186,640 178,580 190,520 M200,560 C204,600 202,650 206,700" stroke="#A88470" stroke-width="2" fill="none" opacity=".6"/>
      <g class="pa-copaM0" data-cx="190" data-cy="380"><g>${copaFlor(150, 330, 130, 100, 71, true)}</g></g>
      <g class="pa-copaM1" data-cx="290" data-cy="400"><g>${copaFlor(300, 360, 100, 80, 73, true)}</g></g>`;
  }
  /* --- cerejeira grande à direita: tronco torcido, ramos e copas cor-de-rosa; o ramo do ninho é desenhado a cada quadro --- */
  function cerejeiraTrasSVG() {
    return `<ellipse cx="1430" cy="780" rx="200" ry="18" fill="url(#passarinho-sombraChao)"/>
      <g class="pa-copa0" data-cx="1440" data-cy="300"><g>${copaFlor(1460, 170, 210, 150, 81)}</g></g>
      <g class="pa-copa1" data-cx="1200" data-cy="260"><g>${copaFlor(1190, 130, 150, 104, 83)}</g></g>
      <path d="M1360,790 C1376,700 1366,620 1384,540 C1396,480 1386,420 1360,360 C1340,320 1300,290 1240,240 L1260,226 C1316,268 1356,300 1390,350 C1404,300 1420,250 1460,200 L1480,214 C1446,260 1430,320 1428,380 C1440,440 1446,520 1440,600 C1436,680 1446,740 1470,790 Z" fill="url(#passarinho-tronco)" stroke="#2E1C14" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M1384,770 C1392,700 1386,640 1400,580 M1412,540 C1420,600 1418,680 1430,760 M1396,440 C1404,400 1414,360 1430,320" stroke="#A88470" stroke-width="2.4" fill="none" opacity=".55" stroke-linecap="round"/>
      <path d="M1376,640 C1386,636 1394,644 1392,654 C1384,660 1374,654 1376,640 Z" fill="#2E1C14" opacity=".7"/>
      <path d="M1250,234 C1200,200 1150,186 1100,182 M1180,206 C1170,180 1172,160 1180,140" stroke="#5A3A2A" stroke-width="7" fill="none" stroke-linecap="round"/>
      <g class="pa-copa2" data-cx="1110" data-cy="200"><g>${copaFlor(1110, 170, 110, 80, 85)}</g></g>
      <g class="pa-copa3" data-cx="1540" data-cy="380"><g>${copaFlor(1560, 360, 120, 110, 87)}</g></g>
      <path class="pa-ramo" fill="url(#passarinho-ramo)" stroke="#2E1C14" stroke-width="2" stroke-linejoin="round"/>
      <path class="pa-ramoL" fill="none" stroke="#B8927A" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>
      <path class="pa-raminhos" fill="none" stroke="#4A2E20" stroke-width="5" stroke-linecap="round"/>
      <g class="pa-florRamo"><g>${copaFlor(905, 520, 54, 40, 89)}</g></g>`;
  }
  function cerejeiraFrenteSVG() {
    return `<g class="pa-copa4" data-cx="1330" data-cy="420"><g>${copaFlor(1300, 400, 90, 64, 91)}</g></g>`;
  }
  /* --- ninho: camada de trás (borda de trás, cova escura, penugem e os três ovinhos azuis) --- */
  function ninhoTrasSVG() {
    const { x, y, rx, ry } = NINHO, r = semente(97);
    let ram = '';
    for (let i = 0; i < 26; i++) { const a = PI + r() * PI, a2 = a + .3 + r() * .5, k = 1 + r() * .14; ram += `M${n(x + Math.cos(a) * rx * k)},${n(y + Math.sin(a) * ry * k)} Q${n(x + Math.cos((a + a2) / 2) * rx * 1.2)},${n(y + Math.sin((a + a2) / 2) * ry * 1.4 - 4)} ${n(x + Math.cos(a2) * rx * .96)},${n(y + Math.sin(a2) * ry * .96)}`; }
    let ovSp = '';
    const ovos = [[-34, 6, -14], [0, 10, 6], [34, 4, 18]];
    for (const [dx, dy] of ovos) for (let i = 0; i < 5; i++) ovSp += circ(x + dx + (r() - .5) * 18, y + dy - 4 + (r() - .5) * 14, .9 + r() * .9);
    return `<g class="pa-ninhoT"><g>
      <path d="M${x - rx - 6},${y + 2} C${x - rx},${y - ry - 20} ${x + rx},${y - ry - 20} ${x + rx + 6},${y + 2} Z" fill="url(#passarinho-ninho)" stroke="#4A3018" stroke-width="2"/>
      <path d="${ram}" stroke="#6A4626" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="${ram}" stroke="#D8B47E" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".7" transform="translate(-1,-1.5)"/>
      <ellipse cx="${x}" cy="${y + 4}" rx="${rx - 16}" ry="${ry - 6}" fill="url(#passarinho-cova)"/>
      <path d="M${x - 70},${y + 2} C${x - 60},${y - 6} ${x - 44},${y - 4} ${x - 36},${y + 4} M${x + 40},${y - 2} C${x + 52},${y - 8} ${x + 66},${y - 4} ${x + 72},${y + 4}" stroke="#F4ECE0" stroke-width="5" fill="none" stroke-linecap="round" opacity=".85"/>
      <g class="pa-ovos">
        ${ovos.map(([dx, dy, a]) => `<ellipse cx="${x + dx}" cy="${y + dy - 4}" rx="17" ry="13" transform="rotate(${a},${x + dx},${y + dy - 4})" fill="url(#passarinho-ovo)" stroke="#5A8AA4" stroke-width="1.4"/>`).join('')}
        <path d="${ovSp}" fill="#7A5A4A" opacity=".55"/>
        <path d="M${x - 42},${y - 4} q4,-4 9,-3 M${x - 7},${y - 2} q4,-4 9,-3 M${x + 27},${y - 6} q4,-4 9,-3" stroke="#FFFFFF" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>
      </g>
    </g></g>`;
  }
  /* --- ninho: camada da frente (borda da frente de raminhos entrelaçados, musgo e penas espetadas) --- */
  function ninhoFrenteSVG() {
    const { x, y, rx, ry } = NINHO, r = semente(101);
    let ram = '', ramL = '';
    for (let i = 0; i < 46; i++) {
      const a = r() * PI, a2 = a + (r() < .5 ? 1 : -1) * (.3 + r() * .5), k = .9 + r() * .2, dd = r() * 54;
      const p0 = [x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k + dd * .9], p1 = [x + Math.cos(a2) * rx * (k + .05), y + Math.sin(a2) * ry * k + dd];
      const d = `M${n(p0[0])},${n(p0[1])} Q${n((p0[0] + p1[0]) / 2)},${n((p0[1] + p1[1]) / 2 + 6)} ${n(p1[0])},${n(p1[1])}`;
      if (i % 3) ram += d; else ramL += d;
    }
    let pontas = '';
    for (let i = 0; i < 9; i++) { const a = .15 + r() * 2.8, px = x + Math.cos(a) * rx, py = y + Math.sin(a) * ry + 20 + r() * 26; pontas += `M${n(px)},${n(py)} l${n(Math.cos(a) * (14 + r() * 10))},${n(4 + r() * 10)}`; }
    const borda = `M${x - rx - 6},${y + 2} C${x - rx - 4},${y + ry + 14} ${x + rx + 4},${y + ry + 14} ${x + rx + 6},${y + 2} C${x + rx + 2},${y + ry + 64} ${x + 40},${y + ry + 84} ${x},${y + ry + 84} C${x - 40},${y + ry + 84} ${x - rx - 2},${y + ry + 64} ${x - rx - 6},${y + 2} Z`;
    return `<g class="pa-ninhoF"><g>
      <path d="${borda}" fill="url(#passarinho-ninho)" stroke="#4A3018" stroke-width="2.2"/>
      <path d="M${x - rx - 6},${y + 2} C${x - rx - 4},${y + ry + 14} ${x + rx + 4},${y + ry + 14} ${x + rx + 6},${y + 2}" stroke="#E2C08A" stroke-width="7" fill="none" stroke-linecap="round" opacity=".55"/>
      <path d="${ram}" stroke="#5A3A1E" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="${ramL}" stroke="#DDBA84" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="${pontas}" stroke="#6A4626" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M${x + 30},${y + ry + 70} C${x + 50},${y + ry + 66} ${x + 70},${y + ry + 54} ${x + 80},${y + ry + 38} C${x + 66},${y + ry + 60} ${x + 50},${y + ry + 72} ${x + 30},${y + ry + 70} Z" fill="#8AB84E" opacity=".85"/>
      <path d="${circ(x - 70, y + ry + 30, 9)}${circ(x - 58, y + ry + 40, 7)}${circ(x - 80, y + ry + 18, 6)}" fill="#7EAE48" opacity=".85"/>
      <g class="pa-penaN" transform="translate(${x - 82},${y + 6}) rotate(-38)"><path d="M0,0 C-4,-10 -4,-24 0,-34 C4,-24 5,-10 0,0 Z" fill="#F6F2EA" stroke="#C8BCA8" stroke-width="1"/><path d="M0,0 L0,-32" stroke="#C8BCA8" stroke-width="1"/></g>
      <g transform="translate(${x + 88},${y + 12}) rotate(44)"><path d="M0,0 C-4,-9 -4,-20 0,-28 C4,-20 5,-9 0,0 Z" fill="#E8F0FA" stroke="#A8B8CC" stroke-width="1"/><path d="M0,0 L0,-26" stroke="#A8B8CC" stroke-width="1"/></g>
    </g></g>`;
  }
  /* --- banho de pássaros de pedra: camada de trás (borda de trás, parede de dentro, água com brilhos) e da frente --- */
  function tanqueTrasSVG() {
    const { x, y, rx, ry, ax, ay } = TANQUE;
    return `<ellipse cx="${x + 40}" cy="816" rx="150" ry="16" fill="url(#passarinho-sombraChao)"/>
      <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#passarinho-pedraB)" stroke="#6E6458" stroke-width="2"/>
      <ellipse cx="${x}" cy="${y + 1}" rx="${ax}" ry="${ay}" fill="#A89C8C"/>
      <path class="pa-agua" d="M${x - ax + 4},${AGUA_Y} A${ax - 4},${ay - 4} 0 0 1 ${x + ax - 4},${AGUA_Y} A${ax - 4},${ay - 2} 0 0 1 ${x - ax + 4},${AGUA_Y} Z" fill="url(#passarinho-agua)"/>
      <path d="M${x - ax + 4},${AGUA_Y} A${ax - 4},${ay - 4} 0 0 1 ${x + ax - 4},${AGUA_Y}" stroke="#7A6E60" stroke-width="3" fill="none" opacity=".5"/>
      <ellipse cx="${x - 60}" cy="${AGUA_Y - 8}" rx="40" ry="5" fill="#D4F0FF" opacity=".6"/>
      <g class="pa-brilhos" fill="#FFFFFF">${[0, 1, 2, 3].map(i => `<ellipse class="pa-brilho${i}" rx="1" ry="1" opacity="0"/>`).join('')}</g>
      <g class="pa-ondas" fill="none" stroke="#E8F8FF" stroke-width="2.2">${[0, 1, 2].map(i => `<ellipse class="pa-onda${i}" rx="1" ry="1" opacity="0" vector-effect="non-scaling-stroke"/>`).join('')}</g>
      <circle class="pa-semente" r="1" fill="#3A3428" opacity="0"/>`;
  }
  function tanqueFrenteSVG() {
    const { x, y, rx, ry, ax, ay } = TANQUE;
    const cf = (a, b) => `M${x - a},${y} A${a},${b} 0 0 0 ${x + a},${y}`;
    return `<path d="M${x - 56},676 C${x - 40},720 ${x - 46},770 ${x - 70},798 L${x + 70},798 C${x + 46},770 ${x + 40},720 ${x + 56},676 Z" fill="url(#passarinho-pedra)" stroke="#6E6458" stroke-width="2"/>
      <path d="M${x - 30},690 C${x - 22},730 ${x - 26},764 ${x - 40},790" stroke="#FFFFFF" stroke-width="4" fill="none" opacity=".35" stroke-linecap="round"/>
      <path d="M${x - 96},796 L${x + 96},796 L${x + 104},816 C${x + 60},826 ${x - 60},826 ${x - 104},816 Z" fill="url(#passarinho-pedraB)" stroke="#6E6458" stroke-width="2"/>
      <path d="M${x + 20},740 C${x + 34},736 ${x + 44},744 ${x + 42},756 C${x + 30},760 ${x + 20},752 ${x + 20},740 Z M${x - 80},806 C${x - 60},800 ${x - 44},804 ${x - 40},812 C${x - 56},816 ${x - 72},814 ${x - 80},806 Z" fill="#8AB04E" opacity=".75"/>
      <path d="M${x - ax + 4},${AGUA_Y} A${ax - 4},${ay - 2} 0 0 0 ${x + ax - 4},${AGUA_Y} Z" fill="url(#passarinho-agua)" opacity=".72"/>
      <path d="${cf(rx, ry)} L${x + rx - 22},${y + 40} C${x + 110},${y + 66} ${x - 110},${y + 66} ${x - rx + 22},${y + 40} Z" fill="url(#passarinho-pedra)" stroke="#6E6458" stroke-width="2"/>
      <path d="${cf(rx, ry)} L${x + ax},${y} A${ax},${ay} 0 0 1 ${x - ax},${y} Z" fill="url(#passarinho-pedraB)" stroke="#6E6458" stroke-width="1.6"/>
      <path d="M${x - ax - 12},${y + 10} C${x - 80},${y + ry + 2} ${x + 20},${y + ry + 6} ${x + 70},${y + ry}" stroke="#FFFFFF" stroke-width="4" fill="none" opacity=".55" stroke-linecap="round"/>
      <path d="M${x - 130},${y + 40} C${x - 110},${y + 52} ${x - 90},${y + 56} ${x - 70},${y + 58} M${x + 40},${y + 58} C${x + 70},${y + 54} ${x + 100},${y + 46} ${x + 120},${y + 38}" stroke="#8E8274" stroke-width="2" fill="none" opacity=".6"/>
      <path d="M${x + 96},${y + 26} C${x + 116},${y + 22} ${x + 134},${y + 26} ${x + 140},${y + 34} C${x + 124},${y + 40} ${x + 106},${y + 38} ${x + 96},${y + 26} Z M${x - 150},${y + 18} C${x - 136},${y + 16} ${x - 124},${y + 22} ${x - 122},${y + 30} C${x - 136},${y + 32} ${x - 148},${y + 28} ${x - 150},${y + 18} Z" fill="#8AB04E" opacity=".8"/>`;
  }
  /* --- primeiro plano: tufos de erva, margaridas grandes que baloiçam e um caracol --- */
  function margaridaG(i, x, y, alt, k) {
    let p = '';
    for (let a = 0; a < 360; a += 24) { const c = Math.cos(a * RAD), s = Math.sin(a * RAD); p += `M${n(c * 6 * k)},${n(s * 6 * k)} Q${n((c * 14 - s * 5) * k)},${n((s * 14 + c * 5) * k)} ${n(c * 22 * k)},${n(s * 22 * k)} Q${n((c * 14 + s * 5) * k)},${n((s * 14 - c * 5) * k)} ${n(c * 6 * k)},${n(s * 6 * k)}Z`; }
    return `<g class="pa-marg${i}" transform="translate(${x},${y})"><g>
      <path d="M0,0 C-4,${n(-alt * .4)} 4,${n(-alt * .7)} -2,${-alt}" stroke="#4E8A30" stroke-width="${n(4 * k)}" fill="none" stroke-linecap="round"/>
      <path d="M-1,${n(-alt * .3)} C-20,${n(-alt * .4)} -30,${n(-alt * .3)} -34,${n(-alt * .2)} C-22,${n(-alt * .2)} -10,${n(-alt * .24)} -1,${n(-alt * .26)} Z" fill="#6EA840" stroke="#3E6A26" stroke-width="1.2"/>
      <g transform="translate(-2,${-alt}) rotate(-14) scale(1,.8)">
        <path d="${p}" fill="#FFFFFF" stroke="#C8C4D8" stroke-width="1.2"/>
        <circle r="${n(8 * k)}" fill="#F6C624" stroke="#D89A10" stroke-width="1.2"/><circle cx="${n(-2 * k)}" cy="${n(-2 * k)}" r="${n(3 * k)}" fill="#FFE68A"/>
      </g></g></g>`;
  }
  function primeiroPlanoSVG() {
    const r = semente(55);
    let t1 = '', t2 = '', t3 = '';
    for (let i = 0; i < 90; i++) {
      const x = r() * 1640 - 20, y = 870 + r() * 40, h = 22 + r() * 30, inc = -8 + r() * 16;
      const d = `M${n(x - 3)},${n(y)} Q${n(x + inc * .4)},${n(y - h * .6)} ${n(x + inc)},${n(y - h)} Q${n(x + inc * .3 + 2)},${n(y - h * .55)} ${n(x + 3)},${n(y)} Z`;
      const k = i % 3; if (k === 0) t1 += d; else if (k === 1) t2 += d; else t3 += d;
    }
    return `${margaridaG(0, 330, 900, 120, 1.1)}${margaridaG(1, 380, 910, 90, .9)}${margaridaG(2, 1180, 906, 130, 1.15)}${margaridaG(3, 1250, 912, 96, .95)}${margaridaG(4, 60, 905, 104, 1)}
      <path d="${t1}" fill="#4E8A2E"/><path d="${t2}" fill="#6EA840"/><path d="${t3}" fill="#3E7A26"/>
      <g transform="translate(930,862)"><ellipse cx="4" cy="8" rx="30" ry="5" fill="#2E4A1A" opacity=".3"/>
        <path d="M-26,6 C-24,-2 -10,-2 2,0 L22,2 C30,0 34,-8 30,-14 L34,-22 M28,-14 L26,-24" stroke="#C8A27A" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M-26,6 C-24,-2 -10,-2 2,0 L22,2" stroke="#E8CCA8" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="-4" cy="-12" r="16" fill="#C07A3A" stroke="#7A4420" stroke-width="2"/><path d="M-4,-12 m-9,0 a9,9 0 1,1 9,9 a5,5 0 1,1 -3,-6" stroke="#7A4420" stroke-width="2" fill="none"/>
        <circle cx="34" cy="-23" r="2" fill="#3A2418"/><circle cx="26" cy="-25" r="2" fill="#3A2418"/></g>`;
  }
  /* --- bichos e partículas: borboleta-limão, abelhão, pétalas a cair, gotas de água, penugem --- */
  function bichosSVG() {
    const asaB = sg => `<path d="M0,-2 C${sg * 8},-26 ${sg * 30},-30 ${sg * 32},-14 C${sg * 34},-6 ${sg * 20},0 0,2 Z" fill="#FFF07A" stroke="#B8A030" stroke-width="1.3"/>
      <path d="M0,2 C${sg * 16},2 ${sg * 26},10 ${sg * 18},22 C${sg * 12},26 ${sg * 4},16 0,4 Z" fill="#F8E460" stroke="#B8A030" stroke-width="1.3"/>
      <circle cx="${sg * 18}" cy="-13" r="2.4" fill="#E8902A"/>`;
    const petalas = Array.from({ length: 16 }, (_, i) => `<path class="pa-pet${i}" d="${PETALA}" fill="${i % 3 ? '#FFD2E2' : '#FFF0F6'}" stroke="#E8A2BE" stroke-width="1"/>`).join('');
    const gotas = Array.from({ length: 16 }, (_, i) => `<circle class="pa-gota${i}" r="1" fill="url(#passarinho-gota)" opacity="0"/>`).join('');
    const penugem = Array.from({ length: 3 }, (_, i) => `<g class="pa-penug${i}" display="none"><path d="M0,0 C-5,-8 -4,-18 0,-24 C4,-18 6,-8 0,0 Z" fill="${['#FFE680', '#F6F8FF', '#9CC6F0'][i]}" stroke="#8A8AA0" stroke-width=".8"/></g>`).join('');
    return `<g class="pa-borboleta"><g class="pa-borbIn">
        <g class="pa-borbAsas">${asaB(-1)}${asaB(1)}</g>
        <ellipse cx="0" cy="2" rx="2.4" ry="10" fill="#4A4030"/><circle cx="0" cy="-9" r="3" fill="#4A4030"/>
        <path d="M-1,-11 C-4,-18 -6,-20 -9,-21 M1,-11 C4,-18 6,-20 9,-21" stroke="#4A4030" stroke-width="1.2" fill="none"/>
      </g></g>
      <g class="pa-abelha" display="none"><g class="pa-abIn">
        <g class="pa-abAsas" fill="#EAF6FF" stroke="#9AB4CC" stroke-width="1" opacity=".85"><ellipse cx="-5" cy="-14" rx="7" ry="11" transform="rotate(-20,-5,-14)"/><ellipse cx="6" cy="-14" rx="7" ry="11" transform="rotate(20,6,-14)"/></g>
        <ellipse cx="0" cy="0" rx="17" ry="13" fill="#F6C028" stroke="#3A2A10" stroke-width="1.6"/>
        <path d="M-6,-12 C-9,-4 -9,4 -6,12 M5,-12 C2,-4 2,4 5,12" stroke="#2A2010" stroke-width="5" fill="none"/>
        <circle cx="16" cy="-2" r="7.5" fill="#2A2010"/><circle cx="18.5" cy="-4" r="2.2" fill="#FFFFFF"/><circle cx="19" cy="-3.6" r="1.2" fill="#000"/>
        <path d="M-17,0 L-23,1" stroke="#2A2010" stroke-width="2.4" stroke-linecap="round"/>
      </g></g>
      <g class="pa-petalas" pointer-events="none">${petalas}</g><g class="pa-gotas" pointer-events="none">${gotas}</g>${penugem}`;
  }

  function liso(pts) {
    if (pts.length < 3) return pts.map((p, i) => (i ? 'L' : 'M') + n(p[0]) + ',' + n(p[1])).join('');
    let d = `M${n(pts[0][0])},${n(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; d += `Q${n(pts[i][0])},${n(pts[i][1])} ${n(m[0])},${n(m[1])}`; }
    const u = pts[pts.length - 1];
    return d + `L${n(u[0])},${n(u[1])}`;
  }
  // ramo do ninho: linha do meio (x, y, grossura), do tronco até à ponta; e os raminhos que seguram o ninho e as flores
  const RAMO = [[1410, 516, 34], [1330, 532, 28], [1250, 546, 23], [1160, 557, 19], [1070, 566, 16], [990, 562, 13], [920, 551, 10], [862, 536, 6]];
  const RAMINHOS = [[[1150, 558], [1134, 532], [1122, 512]], [[1002, 561], [988, 536], [970, 512]], [[934, 552], [920, 536], [910, 524]], [[1270, 544], [1262, 512], [1272, 488]]];

  /* ================= 5) montar() ================= */
  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .4 : 1;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.innerHTML = `<defs>${defsPassarinho()}${defsCena()}</defs>
      ${ceuSVG()}${longeSVG()}${sebeSVG()}${relvaSVG()}${macieiraSVG()}${cerejeiraTrasSVG()}
      <g class="pa-habitat"><rect x="902" y="370" width="260" height="260" fill="#000" fill-opacity="0"/>${ninhoTrasSVG()}<g class="pa-slotDentro"></g>${ninhoFrenteSVG()}</g>
      ${cerejeiraFrenteSVG()}
      ${tanqueTrasSVG()}<g class="pa-slotBanho"></g>${tanqueFrenteSVG()}
      <g class="pa-slotFora">${passarinhoSVG()}</g>
      ${primeiroPlanoSVG()}${bichosSVG()}
      <rect width="1600" height="900" fill="url(#passarinho-vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s);
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; el.setAttribute(nome, v); } }
    const ld = f => ({ E: f('E'), D: f('D') });

    /* --- referências --- */
    const RP = {};
    for (const nm of ['cauda', 'tronco', 'peito', 'pesc', 'cabeca', 'bone', 'coxaE', 'canelaE', 'coxaD', 'canelaD']) {
      const c = q(`.pa-${nm}-c`);
      RP[nm] = { c, e: q(`.pa-${nm}-e`), l: q(`.pa-${nm}-l`), o: c && c.hasAttribute('data-o') ? +c.getAttribute('data-o') : 2.4 };
    }
    const R = {
      passaro: q('.pa-passaro'), sombra: q('.pa-sombra'), partes: q('.pa-partes'),
      grupos: { pernaE: q('.pa-g-pernaE'), pernaD: q('.pa-g-pernaD'), asaE: q('.pa-g-asaE'), asaD: q('.pa-g-asaD'), corpo: q('.pa-g-corpo'), cabeca: q('.pa-g-cabeca'), cauda: q('.pa-g-cauda') },
      asa: ld(L => q('.pa-asa' + L)), pe: ld(L => q('.pa-pe' + L)), dedos: ld(L => q('.pa-dedos' + L)), dedosI: ld(L => q('.pa-dedosI' + L)), unhas: ld(L => q('.pa-unhas' + L)),
      clipT: q('.pa-clipT'), clipP: q('.pa-clipP'), clipH: q('.pa-clipH'), sombraT: q('.pa-sombraT'),
      penasP: q('.pa-penasP'), penasT: q('.pa-penasT'), cauda: q('.pa-cauda'), penasC: [0, 1, 2, 3, 4].map(i => q('.pa-penaC' + i)),
      topete: q('.pa-topete'), bico: q('.pa-bico'), slotA: q('.pa-slotBicoA'), slotF: q('.pa-slotBicoF'), bicoS: q('.pa-bicoS'), bicoI: q('.pa-bicoI'), boca: q('.pa-boca'), semBico: q('.pa-semBico'),
      riscas: q('.pa-riscas'), colar: q('.pa-colarL'), babete: q('.pa-babete'), boch: [0, 1].map(i => q('.pa-boch' + i)),
      olho: ld(L => q('.pa-olho' + L)), iris: ld(L => q('.pa-iris' + L)), palpS: ld(L => q('.pa-palpS' + L)), palpI: ld(L => q('.pa-palpI' + L)),
      orla: ld(L => q('.pa-orla' + L)), orlaI: ld(L => q('.pa-orlaI' + L)),
      habitat: q('.pa-habitat'), slotDentro: q('.pa-slotDentro'), slotFora: q('.pa-slotFora'), slotBanho: q('.pa-slotBanho'),
      ninhoT: q('.pa-ninhoT > g'), ninhoF: q('.pa-ninhoF > g'), ramo: q('.pa-ramo'), ramoL: q('.pa-ramoL'), raminhos: q('.pa-raminhos'), florRamo: q('.pa-florRamo > g'),
      nuvens: NUV.map((c, i) => q('.pa-nuvem' + i)), aves: [0, 1].map(i => q('.pa-ave' + i)), aura: q('.pa-solAura'),
      copas: ['pa-copa0', 'pa-copa1', 'pa-copa2', 'pa-copa3', 'pa-copa4', 'pa-copaM0', 'pa-copaM1'].map(c => { const g = q('.' + c); return { g: g.firstElementChild, x: +g.getAttribute('data-cx'), y: +g.getAttribute('data-cy') }; }),
      margs: [0, 1, 2, 3, 4].map(i => q(`.pa-marg${i} > g`)),
      brilhos: [0, 1, 2, 3].map(i => q('.pa-brilho' + i)), ondas: [0, 1, 2].map(i => q('.pa-onda' + i)), semente: q('.pa-semente'),
      borb: q('.pa-borboleta'), borbAsas: q('.pa-borbAsas'), abelha: q('.pa-abelha'), abAsas: q('.pa-abAsas'),
      petalas: Array.from({ length: 16 }, (_, i) => q('.pa-pet' + i)), gotas: Array.from({ length: 16 }, (_, i) => q('.pa-gota' + i)), penug: [0, 1, 2].map(i => q('.pa-penug' + i))
    };
    // a semente fica por cima da borda do banho (camada da frente)
    R.slotFora.before(R.semente);

    /* --- estado --- */
    const P = Object.assign({ x: REPOUSO.x, gy: bordaY(REPOUSO.x), y: 0, h: REPOUSO.h, salto: 0, somB: 0, somH: 0, canto: 0 }, BASE, ROSTO);
    let modo = 'fora';                    // 'fora' | 'indo' | 'dentro' | 'voltando'
    let apoio = 'borda';                  // 'borda' (do banho) | 'agua' | 'ninho' | 'ar'
    let reagindo = false, tempo = 0, vivo = true, dtUlt = 16.7, G = null, salto = null;
    const fase = { resp: 0, voo: 0 };
    const bater = { amp: 0, freq: 5.4 };  // bater de asas contínuo (no voo)
    const cauda = { a: 0, v: 0, prox: 1800 };
    const ramo = { s: 0, v: 0, ult: null };
    const vento = { v: 0 };
    const baseP = () => apoio === 'ninho' ? NINHADO : BASE;
    const pes = { E: { p: [0, 0, 0] }, D: { p: [0, 0, 0] } };
    function neutro(L) { const sg = L === 'E' ? -1 : 1, h = P.h * RAD; return [P.x - Math.cos(h) * 17 * sg + Math.sin(h) * 4, 0, P.gy / sE + Math.sin(h) * 17 * sg + Math.cos(h) * 4]; }
    const queda = x => ramo.s * Math.pow(limita((RAMO_X0 - x) / (RAMO_X0 - NINHO.x), 0, 2.4), 1.5);   // quanto o ramo baixa em x

    /* --- desenhar --- */
    const tfE = e => `translate(${n(e.x)},${n(e.y)}) rotate(${n(e.ang)}) scale(${n(e.rx)},${n(e.ry)})`;
    function aplica(r, e) {
      const t = `translate(${n(e.x)},${n(e.y)}) rotate(${n(e.ang)})`;
      poe(r.e, `${t} scale(${n(e.rx)},${n(e.ry)})`);
      if (r.c) poe(r.c, `${t} scale(${n(e.rx + r.o)},${n(e.ry + r.o)})`);
      if (r.l) { const [ox, oy] = luzOff(e, .26); poe(r.l, `translate(${n(e.x + ox)},${n(e.y + oy)}) rotate(${n(e.ang)}) scale(${n(e.rx * .7)},${n(e.ry * .7)})`); }
    }
    const opV = (m, a, b) => n3(limita((m.vis - a) / b, 0, 1));
    let ordemAtual = '', garraAtual = { E: null, D: null };
    function desenhar() {
      pes.E.p = neutro('E'); pes.D.p = neutro('D');
      G = geometria(P, pes);
      for (const nm in RP) aplica(RP[nm], G.el[nm]);
      poe(R.clipT, tfE(G.el.tronco)); poe(R.clipP, tfE(G.el.peito));
      const hc = G.el.cabeca; poe(R.clipH, `translate(${n(hc.x)},${n(hc.y)}) rotate(${n(hc.ang)}) scale(${n(hc.rx * .99)},${n(hc.ry * .99)})`);
      const t = G.el.tronco;
      poe(R.sombraT, `translate(${n(t.x + 10)},${n(t.y + t.ry * .9)}) rotate(${n(t.ang)}) scale(${n(t.rx * 1.02)},${n(t.ry * .6)})`);
      atr(R.penasP, 'd', G.penasP || 'M0,0'); atr(R.penasT, 'd', G.penasT || 'M0,0');
      // cauda: leque de penas que abre para travar
      poe(R.cauda, G.cauda);
      const lq = 4 + 13 * limita(P.leque || 0, 0, 1.3);
      R.penasC.forEach((el, i) => poe(el, `rotate(${n((i - 2) * lq)})`));
      poe(R.topete, G.topete);
      for (const [L] of LADOS) {
        poe(R.asa[L], G.asa[L].m);
        atr(R.asa[L], 'opacity', n3(G.asa[L].op));
        // dedos: a agarrar o poleiro, ou encolhidos no ar
        const enc = G['encP' + L] > .45, c = G['calc' + L], sh = Math.sin(P.h * RAD);
        if (garraAtual[L] !== enc) { garraAtual[L] = enc; const d = enc ? ENCOLHIDO : GARRA; atr(R.dedos[L], 'd', d); atr(R.dedosI[L], 'd', d); atr(R.unhas[L], 'display', enc ? 'none' : 'inline'); }
        poe(R.pe[L], `translate(${n(c[0])},${n(c[1])}) scale(${n3((sh < 0 ? -1 : 1) * Math.max(.55, Math.abs(sh)) * 1.6)},1.6)`);
      }
      // bico: atrás da cabeça quando aponta para longe
      const slot = G.zBico > -6 ? R.slotF : R.slotA;
      if (R.bico.parentNode !== slot) slot.appendChild(R.bico);
      poe(R.bicoS, G.bicoS); poe(R.bicoI, G.bicoI);
      atr(R.boca, 'display', G.bocaAberta > .05 ? 'inline' : 'none');
      atr(R.riscas, 'd', G.riscas); atr(R.colar, 'd', G.colar);
      poe(R.babete, tfE(G.babete)); atr(R.babete, 'opacity', opV(G.babete, -.1, .25));
      G.boch.forEach((m, i) => { poe(R.boch[i], tfE(m)); atr(R.boch[i], 'opacity', n3(.55 * limita((m.vis - .1) / .25, 0, 1))); });
      desenharOlhos();
      const ordem = Object.keys(G.z).sort((a, b) => G.z[a] - G.z[b]), ch = ordem.join();
      if (ch !== ordemAtual) { ordemAtual = ch; for (const g of ordem) R.partes.appendChild(R.grupos[g]); }
      // sombra na pedra (some quando voa, na água e no ninho)
      const alt = P.y + P.salto, k = 1 - limita(alt / 120, 0, .6);
      poe(R.sombra, `translate(${n(P.x + 10)},${n(P.gy + 3)}) scale(${n(70 * k)},${n(10 * k)})`);
      atr(R.sombra, 'opacity', apoio === 'borda' || apoio === 'ar' ? n3(1 - limita(alt / 50, 0, 1)) : '0');
    }
    function desenharRamo() {
      const s = Math.round(ramo.s * 4) / 4;
      if (ramo.ult === s) return; ramo.ult = s;
      const cima = [], baixo = [], luz = [];
      for (const [x, y, w] of RAMO) { const d = queda(x); cima.push([x, y - w / 2 + d]); baixo.push([x, y + w / 2 + d]); luz.push([x, y - w / 4 + d]); }
      const b = liso(baixo.reverse()).replace('M', 'L');
      atr(R.ramo, 'd', liso(cima) + b + 'Z');
      atr(R.ramoL, 'd', liso(luz.slice(0, -1)));
      atr(R.raminhos, 'd', RAMINHOS.map(pts => liso(pts.map(([x, y]) => [x, y + queda(x)]))).join(''));
      const dn = queda(NINHO.x);
      const tn = `translate(0,${n(dn)}) rotate(${n3(dn * .22)},${NINHO.x},${NINHO.y})`;
      poe(R.ninhoT, tn); poe(R.ninhoF, tn);
      poe(R.florRamo, `translate(0,${n(queda(905))})`);
    }
    function camada(onde) { const alvo = onde === 'dentro' ? R.slotDentro : onde === 'banho' ? R.slotBanho : R.slotFora; if (R.passaro.parentNode !== alvo) alvo.appendChild(R.passaro); }

    /* --- olhos: íris que segue um alvo, pálpebra que desce, olhos contentes --- */
    const olhar = { foco: null, livre: null, t: 0, g: { E: null, D: null } };
    const focar = f => { olhar.foco = f; };
    let piscaV = 0;
    const pisca = { t: aleat(1500, 3500), f: -1, duplo: false };
    function desenharOlhos() {
      const kO = 1 - Math.exp(-dtUlt / 50);
      for (const [L] of LADOS) {
        const o = G.olho[L];
        const vis = o.vis > .05;
        atr(R.olho[L], 'display', vis ? 'inline' : 'none');
        if (!vis) continue;
        poe(R.olho[L], o.m);
        let alvo;
        if (olhar.foco) { const f = olhar.foco(); alvo = vn([f[0] - o.x, -(f[1] - o.y) / cE, 260]); }
        else alvo = vn(vs(vk(G.H.f, .75), vs(vk(VISTA, .6), olhar.livre || [0, 0, 0])));
        olhar.g[L] = olhar.g[L] ? vn(vlerp(olhar.g[L], alvo, kO)) : alvo;
        const g = olhar.g[L];
        let ox = vp(g, o.t1) * RO * .3, oy = vp(g, o.t2) * RO * .3;
        const m = Math.hypot(ox, oy), mx = RO * .24; if (m > mx) { ox *= mx / m; oy *= mx / m; }
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
      const u = pisca.f / 200;
      piscaV = u < .4 ? esai(u / .4) : 1 - eseno(limita((u - .4) / .6, 0, 1));
      if (u >= 1) { piscaV = 0; pisca.f = -1; pisca.t = pisca.duplo ? 130 : aleat(2000, 6000); }
    }
    function atualizarOlharLivre(dt) {
      olhar.t -= dt;
      if (olhar.t > 0) return;
      olhar.t = aleat(700, 2200);
      const r = Math.random();
      if (r < .35) olhar.livre = [0, 0, 2];
      else if (r < .55) olhar.livre = null;
      else olhar.livre = [aleat(-.7, .7), aleat(-.3, .5), 0];
    }

    /* --- partículas: gotas de água (com gravidade), anéis na água e penugem que cai a baloiçar --- */
    const gotas = R.gotas.map(el => ({ el, vivo: false }));
    function gota(x, y, vx, vy, r) {
      const g = gotas.find(g => !g.vivo); if (!g) return;
      Object.assign(g, { x, y, vx, vy, r, vivo: true, sobe: true });
      atr(g.el, 'opacity', '.95');
    }
    function atualizarGotas(dt) {
      const s = dt / 1000;
      for (const g of gotas) {
        if (!g.vivo) continue;
        g.vy += 1400 * s; g.x += g.vx * s; g.y += g.vy * s;
        const naAgua = Math.abs(g.x - TANQUE.x) < TANQUE.ax - 6;
        const fundo = naAgua ? AGUA_Y + 4 : bordaY(limita(g.x, TANQUE.x - TANQUE.bx, TANQUE.x + TANQUE.bx)) + 14;
        if (g.vy > 0 && g.y > fundo) { g.vivo = false; atr(g.el, 'opacity', '0'); if (naAgua && Math.random() < .3) onda(g.x, AGUA_Y + 2, 16, 500); continue; }
        poe(g.el, `translate(${n(g.x)},${n(g.y)}) scale(${n(g.r)})`);
      }
    }
    const ondas = R.ondas.map(el => ({ el, t: 1, dur: 1 }));
    function onda(x, y, r1, dur) {
      const o = ondas.find(o => o.t >= o.dur) || ondas.reduce((a, b) => (a.t / a.dur > b.t / b.dur ? a : b));
      Object.assign(o, { x: limita(x, TANQUE.x - 100, TANQUE.x + 100), y, r1, dur, t: 0 });
    }
    function atualizarOndas(dt) {
      for (const o of ondas) {
        if (o.t >= o.dur) { if (o.el.__opacity !== '0') atr(o.el, 'opacity', '0'); continue; }
        o.t += dt; const u = Math.min(1, o.t / o.dur), r = lerp(4, o.r1, esai(u));
        poe(o.el, `translate(${n(o.x)},${n(o.y)}) scale(${n(r)},${n(r * .24)})`);
        atr(o.el, 'opacity', n3(.8 * (1 - u)));
      }
    }
    const penugem = R.penug.map(el => ({ el, vivo: false }));
    function penugemSolta(x, y, chao) {
      const p = penugem.find(p => !p.vivo); if (!p) return;
      Object.assign(p, { x, y, t: 0, vivo: true, chao: chao || y + 120, ph: aleat(0, 6), fim: 0 });
      atr(p.el, 'display', 'inline'); atr(p.el, 'opacity', '1');
    }
    function atualizarPenugem(dt) {
      for (const p of penugem) {
        if (!p.vivo) continue;
        p.t += dt; const s = p.t / 1000;
        p.y = Math.min(p.chao, p.y + dt * .05);
        const parado = p.y >= p.chao;
        const x = p.x + (parado ? 0 : 20 * Math.sin(s * 2.6 + p.ph)), rot = parado ? 60 : 30 * Math.cos(s * 2.6 + p.ph);
        if (!parado) p.xf = x;
        poe(p.el, `translate(${n(parado ? p.xf : x)},${n(p.y)}) rotate(${n(rot)})`);
        if (parado) { p.fim += dt; atr(p.el, 'opacity', n3(limita(1 - (p.fim - 1500) / 800, 0, 1))); if (p.fim > 2300) { p.vivo = false; atr(p.el, 'display', 'none'); } }
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

    /* --- saltinhos (com as duas patas juntas): agacha-se, salta em arco, encolhe as patas e aterra a achatar; a cauda abana --- */
    function* saltinho(x1, h1, ms, alto) {
      const b = baseP();
      yield* tw({ cH: b.cH - 14, sq: .06 }, 80, esai);
      const x0 = P.x, h0 = P.h;
      salto = { x: x1, h: h1, apoio };
      cauda.v -= 140;
      yield* durante(ms, u => {
        const e = eio(u);
        P.x = lerp(x0, x1, e); P.h = lerp(h0, h1, e);
        P.salto = alto * 4 * u * (1 - u); P.sq = -.05 * sino(u); P.enc = .3 * sino(u);
        P.cH = lerp(b.cH - 14, b.cH, Math.min(1, u * 3)); P.aE = P.aD = .14 * sino(u);
      });
      salto = null; P.salto = 0; P.enc = 0; P.aE = P.aD = 0;
      cauda.v += 230;
      yield* tw({ sq: .07, cH: b.cH - 8 }, 70, esai);
      yield* tw({ sq: 0, cH: b.cH }, 150, eio);
    }
    // salto de um sítio para outro (da borda para a água e da água para a borda): muda de camada a meio
    function* saltarPara(x1, novo, h1, ms, alto) {
      const b = BASE;
      yield* tw({ cH: b.cH - 20, sq: .07 }, 110, esai);
      const x0 = P.x, g0 = P.gy, h0 = P.h, g1 = novo === 'agua' ? BANHO.gy : bordaY(x1);
      salto = { x: x1, h: h1, apoio: novo };
      apoio = 'ar'; let trocou = false;
      cauda.v -= 160;
      yield* durante(ms, u => {
        const e = eio(u);
        P.x = lerp(x0, x1, e); P.gy = lerp(g0, g1, e); P.h = lerp(h0, h1, e); P.y = alto * 4 * u * (1 - u);
        P.enc = .5 * sino(u); P.aE = P.aD = .45 * sino(u); P.batE = P.batD = 30 + 36 * Math.sin(u * PI * 4);
        P.cH = lerp(b.cH - 20, b.cH, Math.min(1, u * 3)); P.sq = -.06 * sino(u);
        if (!trocou && u > .5) { trocou = true; camada(novo === 'agua' ? 'banho' : 'fora'); }
      });
      apoio = novo; salto = null; P.y = 0; P.enc = 0; P.aE = P.aD = 0; P.batE = P.batD = 30;
      cauda.v += 240;
      if (novo === 'agua') { onda(P.x, AGUA_Y + 2, 60, 700); for (let i = 0; i < 6; i++) gota(P.x + aleat(-40, 40), AGUA_Y - 2, aleat(-160, 160), -aleat(200, 380), aleat(2.4, 4)); }
      yield* tw({ sq: .08, cH: b.cH - 10 }, 70, esai);
      yield* tw({ sq: 0, cH: b.cH }, 160, eio);
    }
    function* acabarSalto() {                        // um salto interrompido acaba depressa no sítio para onde ia
      if (!salto) { P.salto = 0; return; }
      const s = salto, x0 = P.x, g0 = P.gy, y0 = P.y, s0 = P.salto, h0 = P.h, g1 = s.apoio === 'agua' ? BANHO.gy : s.apoio === 'ninho' ? NO_NINHO.gy + ramo.s : bordaY(s.x);
      const ia = apoio;
      apoio = 'ar';
      yield* durante(140, u => { const e = eio(u); P.x = lerp(x0, s.x, e); P.gy = lerp(g0, g1, e); P.y = lerp(y0, 0, e); P.salto = lerp(s0, 0, e); P.h = lerp(h0, s.h, e); });
      apoio = s.apoio === 'ar' ? ia : s.apoio; salto = null; P.y = 0; P.salto = 0; P.enc = 0;
      camada(apoio === 'agua' ? 'banho' : apoio === 'ninho' ? 'dentro' : 'fora');
    }

    /* --- extras de cada quadro: respiração, cauda que abana (mola), bater de asas no voo, sítio onde está pousado, ramo --- */
    function atualizarExtras(dt) {
      const t = tempo / 1000, s = Math.min(dt, 34) / 1000;
      P._resp = Math.sin(fase.resp);
      P._bob = 1.4 * P._resp;
      // cauda: mola que abana para cima e para baixo; de vez em quando dá um toque
      cauda.prox -= dt;
      if (cauda.prox <= 0) { cauda.prox = aleat(1400, 3200); cauda.v += aleat(150, 260) * (Math.random() < .5 ? 1 : -.6); }
      const alvoC = 2.5 * Math.sin(t * 1.9) * calma + 1.5 * P._resp;
      cauda.v += ((alvoC - cauda.a) * 320 - cauda.v * 9) * s; cauda.a += cauda.v * s;
      cauda.a = limita(cauda.a, -40, 40);
      P._cu = cauda.a;
      // bater de asas contínuo (no voo)
      fase.voo += dt / 1000 * 2 * PI * bater.freq;
      P._bf = bater.amp * 56 * Math.sin(fase.voo);
      // ramo do ninho: mola (baixa quando o passarinho pousa e baloiça)
      const peso = apoio === 'ninho' ? 5 : 0;
      ramo.v += ((peso - ramo.s) * 200 - ramo.v * 6) * s; ramo.s += ramo.v * s;
      // o sítio onde está pousado
      if (apoio === 'borda') P.gy = bordaY(P.x);
      else if (apoio === 'agua') P.gy = BANHO.gy;
      else if (apoio === 'ninho') P.gy = NO_NINHO.gy + queda(NO_NINHO.x);
    }

    /* --- arrumar antes de ir ou voltar --- */
    function* arrumar(ms) {
      const b = baseP(), alvo = { bico: 0, feliz: 0, abE: 1, abD: 1, olhosEsc: 1 };
      for (const k of CHAVES) if (Math.abs(P[k] - b[k]) > .3) alvo[k] = b[k];
      atr(R.semBico, 'display', 'none');
      yield* tw(alvo, ms, eio);
    }
    function* recompor() {
      yield* acabarSalto();
      if (apoio === 'agua') yield* saltarPara(REPOUSO.x, 'borda', REPOUSO.h, 340, 46);
      if (Math.abs(P.x - REPOUSO.x) > 4 || Math.abs(P.h - REPOUSO.h) > 4) yield* saltinho(REPOUSO.x, REPOUSO.h, 280, 16);
      const dif = {}; let ha = false;
      for (const k of CHAVES) if (Math.abs(P[k] - BASE[k]) > .3) { dif[k] = BASE[k]; ha = true; }
      if (ha) yield* tw(dif, 260);
    }
    function* recomporNinho() {
      const dif = {}; let ha = false;
      for (const k of CHAVES) if (Math.abs(P[k] - NINHADO[k]) > .3) { dif[k] = NINHADO[k]; ha = true; }
      if (Math.abs(P.h - NO_NINHO.h) > 2) { dif.h = NO_NINHO.h; ha = true; }
      if (ha) yield* tw(dif, 260);
    }
    // espera «viva»: a cabeça dá pequenos estalos e olha à volta, como os pássaros fazem
    function* esperaViva(ms) {
      let t = 0, prox = aleat(400, 1200), sub = null;
      const b = baseP();
      while (t < ms) {
        const dt = yield; t += dt; prox -= dt;
        if (sub && sub.next(dt).done) sub = null;
        if (prox <= 0 && !sub) { prox = aleat(600, 1700); sub = tw({ hY: aleat(-30, 30), hR: aleat(-9, 9), hP: b.hP + aleat(-6, 10) }, 70, esai); }
      }
      if (sub) while (!sub.next(16).done);
    }

    /* --- comportamentos na borda do banho --- */
    function* saltitar() {                           // pulinhos com as duas patas, pela borda
      const X = REPOUSO.x, seq = escolhe([[[X - 30, -70], [X - 48, -40]], [[X + 18, 20], [X - 12, -64]], [[X, 40], [X, -84]]]);
      for (const [x, h] of seq) { yield* saltinho(x, h, 250, 22); yield* espera(aleat(160, 420)); }
      yield* saltinho(REPOUSO.x, REPOUSO.h, 260, 18);
    }
    function* estalos() {                            // vira a cabeça aos estalos e olha para nós com um olho
      const b = baseP();
      for (let i = 0; i < 4; i++) {
        const yaw = escolhe([-70, -45, -15, 20, 45, 70]);
        yield* tw({ hY: yaw, hR: yaw / 7 + aleat(-8, 8), hP: b.hP + aleat(-8, 14) }, 60, esai);
        yield* espera(aleat(260, 650));
      }
      const sg = escolhe([-1, 1]);
      focar(() => [800, 450]);
      yield* tw({ hY: limita(P.h - 58 * sg, -95, 95), hR: 22 * sg, hP: 4, olhosEsc: 1.08 }, 70, esai);
      yield* espera(1000);
      yield* tw({ hR: -8 * sg }, 200);
      yield* espera(400);
      focar(null);
      yield* tw({ hY: 0, hR: 0, hP: b.hP, olhosEsc: 1 }, 90, esai);
    }
    function* alisarPenas() {                        // vira a cabeça para trás e alisa as penas da asa com o bico
      const b = baseP(), [L, sg] = escolhe(LADOS);
      yield* tw({ hx: -8, hy: 58, hz: 40 * sg, hY: 145 * sg, hP: -34, hR: -10 * sg, cR: 6 * sg, ['a' + L]: .16, ['bat' + L]: 14 }, 440, eio);
      yield* durante(1300, u => { const w = Math.sin(u * PI * 7); P.hx = -8 + 7 * w; P.hy = 58 - 5 * Math.abs(w); P.bico = .14 + .12 * Math.sin(u * PI * 18); P.hP = -34 + 6 * w; P['a' + L] = .16 + .06 * Math.sin(u * PI * 5); });
      yield* tw({ bico: 0, ['a' + L]: 0, ['bat' + L]: 30 }, 180);
      yield* tw({ hx: b.hx, hy: b.hy, hz: 0, hY: 0, hP: b.hP, hR: 0, cR: 0 }, 460, eio);
      yield* tw({ puff: b.puff + .6 }, 140, esai);
      yield* durante(380, u => { P.cR = 6 * Math.sin(u * PI * 7) * (1 - u); P.puff = b.puff + .6 * (1 - u); });
      if (G && Math.random() < .5) penugemSolta(G.el.tronco.x + aleat(-30, 30), G.el.tronco.y + 30, P.gy + 70);
      P.cR = 0; P.puff = b.puff;
    }
    function* afofar() {                             // afofa-se todo, fecha os olhos de contente e treme
      const b = baseP();
      yield* tw({ puff: 1.1, abE: .5, abD: .5, top: .5, cH: b.cH - 6, hy: b.hy - 6 }, 260, esai);
      yield* espera(800);
      yield* durante(360, u => { P.cR = 5 * Math.sin(u * PI * 12) * (1 - u); });
      cauda.v += 200;
      yield* tw({ puff: b.puff, abE: 1, abD: 1, top: 0, cH: b.cH, hy: b.hy, cR: 0 }, 380, eio);
    }
    function* sacudir(ms, comGotas) {                // sacode-se todo: corpo para um lado, cabeça para o outro, penas eriçadas
      ms = ms || 620;
      const b = baseP();
      yield* tw({ puff: b.puff + .7, aE: .14, aD: .14, top: .6 }, 120, esai);
      let ult = 0;
      yield* durante(ms, (u, t) => {
        const w = Math.sin(u * PI * 9) * (1 - u * .6);
        P.cR = 13 * w; P.hR = -20 * w; P.hY = 18 * Math.sin(u * PI * 9 + 1) * (1 - u); P.cY = -16 * w; P.abE = P.abD = .3;
        cauda.a = 14 * w;
        if (comGotas && G && t - ult > 50) { ult = t; const e = G.el.tronco; gota(e.x + aleat(-60, 60), e.y + aleat(-50, 20), aleat(-260, 260), -aleat(120, 320), aleat(2.2, 3.6)); }
      });
      yield* tw({ cR: 0, hR: 0, hY: 0, cY: 0, puff: b.puff, aE: 0, aD: 0, abE: 1, abD: 1, top: 0 }, 220, eio);
    }
    function* baterAsas() {                          // estica-se e bate as asas (dá um pulinho no ar)
      const b = baseP();
      yield* tw({ cH: b.cH - 10, sq: .04 }, 140, eio);
      yield* tw({ cH: b.cH + 8, sq: 0, cP: 34, aE: 1, aD: 1, batE: 70, batD: 70, leque: .8, top: .4 }, 260, esai);
      for (let i = 0; i < 4; i++) {
        yield* tw({ batE: -14, batD: -14 }, 90, eio);
        if (apoio === 'ninho') ramo.v += 30;
        yield* tw({ batE: 72, batD: 72 }, 120, eio);
      }
      if (G && Math.random() < .5) penugemSolta(G.el.tronco.x + aleat(-40, 40), G.el.tronco.y, P.gy + 80);
      cauda.v += 220;
      yield* tw({ batE: 30, batD: 30, aE: 0, aD: 0, cP: b.cP, cH: b.cH, leque: 0, top: 0 }, 360, eio);
    }
    const semente = { vis: true, fora: 0 };
    function esconderSemente() { atr(R.semBico, 'display', 'none'); }
    // procura a altura da cabeça (hy) com que a ponta do bico chega a alvoY nesta pose; devolve também o x da ponta em relação aos pés
    function poseAlcanca(pose, alvoY) {
      const Q = Object.assign({}, P, pose, { salto: 0, y: 0 });
      let a = -160, b = 120;
      for (let i = 0; i < 16; i++) { const m = (a + b) / 2; Q.hy = m; if (geometria(Q, pes).pontaBico[1] < alvoY) b = m; else a = m; }
      Q.hy = (a + b) / 2;
      return { hy: Q.hy, dx: geometria(Q, pes).pontaBico[0] - Q.x };
    }
    function* debicarSemente() {                     // vê uma semente na borda, olha com um olho, debica, apanha-a e engole
      if (!semente.vis) { yield* estalos(); return; }
      const b = BASE, pose = { cP: -34, hx: 70, hP: -66, hR: 0, hY: 0, cH: b.cH - 8, h: -86 };
      const so = poseAlcanca(pose, bordaY(SEMENTE.x) - 6);
      yield* saltinho(limita(SEMENTE.x - so.dx, SEMENTE.x + 60, REPOUSO.x), -86, 260, 18);
      delete pose.h;
      focar(() => [SEMENTE.x, bordaY(SEMENTE.x)]);
      yield* tw({ hY: 6, hR: 30, hP: -30, hy: b.hy - 10, olhosEsc: 1.1 }, 220, esai);
      yield* espera(600);
      yield* tw({ hR: -16, hY: -4 }, 200);
      yield* espera(300);
      yield* tw({ hx: b.hx + 4, hy: b.hy - 6 }, 120, esai);            // antecipação
      yield* tw(Object.assign({}, pose, { hy: so.hy, bico: .45 }), 170, eentra);
      semente.vis = false; semente.fora = 0; atr(R.semente, 'opacity', '0'); atr(R.semBico, 'display', 'inline');
      yield* tw({ bico: 0 }, 60);
      focar(null);
      yield* tw({ cP: b.cP, hx: 40, hy: b.hy + 8, hP: 34, olhosEsc: 1, cH: b.cH }, 300, esai);
      yield* espera(250);
      for (let i = 0; i < 2; i++) { yield* tw({ hy: b.hy + 14, hP: 44, bico: .25 }, 90); yield* tw({ hy: b.hy + 4, hP: 30, bico: 0 }, 110); }
      atr(R.semBico, 'display', 'none');
      yield* tw({ puff: .3 }, 120); yield* tw({ puff: 0, hx: b.hx, hy: b.hy, hP: b.hP }, 300);
      yield* saltinho(REPOUSO.x, REPOUSO.h, 260, 16);
    }
    function* beber() {                              // vira-se para a água, mete o bico, levanta a cabeça para engolir (duas vezes)
      const b = BASE, pose = { cP: -30, hx: 70, hP: -60, cH: b.cH - 8, h: -96 };
      const so = poseAlcanca(pose, AGUA_Y + 1);
      yield* saltinho(limita(TANQUE.x + 70 - so.dx, TANQUE.x + 60, REPOUSO.x + 10), -96, 260, 18);
      delete pose.h;
      for (let i = 0; i < 2; i++) {
        yield* tw(Object.assign({}, pose, { hy: so.hy, bico: .2 }), 340, eio);
        if (G) onda(G.pontaBico[0], AGUA_Y + 2, 34, 900);
        yield* espera(220);
        yield* tw({ cP: b.cP + 4, hx: 36, hy: b.hy + 10, hP: 46, cH: b.cH, bico: 0 }, 320, esai);
        yield* durante(420, u => { P.hy = b.hy + 10 + 3 * Math.sin(u * PI * 4); });
      }
      yield* tw({ hx: b.hx, hy: b.hy, hP: b.hP }, 260);
      yield* saltinho(REPOUSO.x, REPOUSO.h, 260, 16);
    }
    function* banho() {                              // salta para a água, chapinha com as asas, sai e sacode-se
      yield* saltinho(REPOUSO.x - 16, -80, 240, 16);
      yield* saltarPara(BANHO.x, 'agua', -36, 380, 46);
      yield* tw({ cH: 66, cP: -4, puff: .2 }, 200, eio);
      for (let k = 0; k < 3; k++) {
        let ult = 0, ultO = 0;
        yield* durante(650, (u, t) => {
          P.aE = P.aD = .6 + .2 * Math.sin(u * PI * 3); P.batE = P.batD = 26 + 48 * Math.sin(u * PI * 15);
          P.cR = 8 * Math.sin(u * PI * 6); P.cP = -4 + 12 * Math.sin(u * PI * 5); P.cH = 66 - 8 * sino(u);
          P.hR = -10 * Math.sin(u * PI * 6); cauda.a = 10 * Math.sin(u * PI * 9);
          if (G && t - ult > 34) { ult = t; const sg = Math.random() < .5 ? -1 : 1; gota(P.x + sg * aleat(40, 110), AGUA_Y - aleat(4, 26), sg * aleat(80, 260), -aleat(260, 460), aleat(3.4, 6)); }
          if (t - ultO > 220) { ultO = t; onda(P.x + aleat(-20, 20), AGUA_Y + 3, aleat(60, 90), 800); }
        });
        yield* tw({ aE: 0, aD: 0, batE: 30, batD: 30, cR: 0, hR: 0, cP: -2 }, 160, eio);
        yield* durante(320, u => { P.hR = 16 * Math.sin(u * PI * 4) * (1 - u); });
      }
      yield* saltarPara(REPOUSO.x, 'borda', REPOUSO.h, 380, 52);
      yield* sacudir(700, true);
      yield* afofar();
    }
    function* seguirCom(alvo, ms) {                  // a cabeça e os olhos seguem uma coisa que se mexe
      focar(alvo);
      let t = 0;
      while (t < ms) {
        const dt = yield; t += dt;
        if (!G) continue;
        const p = alvo(), dx = p[0] - G.cab[0], dy = p[1] - G.cab[1];
        const hAbs = limita(dx / 4, -85, 85), yaw = limita(P.h - hAbs, -80, 80), pit = limita(-dy / 5, -40, 40);
        const k = 1 - Math.exp(-dt / 160);
        P.hY += (yaw - P.hY) * k; P.hP += (pit - P.hP) * k; P.hR += (limita(-yaw / 5, -10, 10) - P.hR) * k;
      }
      focar(null);
    }
    function* olharBorboleta() {
      borb.chamar = true;
      yield* seguirCom(() => [borb.x, borb.y], 3600);
      borb.chamar = false;
      yield* tw({ hY: 0, hP: baseP().hP, hR: 0 }, 300);
    }
    function* olharPetala() {                        // segue com os olhos uma pétala a cair
      const p = petalas.find(p => p.estado === 'cai' && p.y < 520 && p.x > 300 && p.x < 1300);
      if (!p) { yield* estalos(); return; }
      yield* seguirCom(() => [p.x, p.y], 2600);
      yield* tw({ hY: 0, hP: baseP().hP, hR: 0 }, 300);
    }
    const COMPORTAMENTOS = { saltitar, estalos, alisarPenas, afofar, sacudir: () => sacudir(), baterAsas, debicarSemente, beber, banho, olharBorboleta, olharPetala };
    let ultimoComp = null;
    function* cicloFora() {
      for (;;) {
        yield* recompor();
        yield* esperaViva(aleat(3500, 8000));
        let nome; do nome = escolhe(Object.keys(COMPORTAMENTOS)); while (nome === ultimoComp);
        ultimoComp = nome;
        yield* COMPORTAMENTOS[nome]();
      }
    }
    /* --- comportamentos no ninho --- */
    function* sonolento() {                          // fecha os olhos devagar, a cabeça descai… e acorda de repente
      yield* tw({ abE: .15, abD: .15, hy: NINHADO.hy - 12, hP: -10, puff: .6 }, 900, eio);
      yield* espera(900);
      yield* tw({ abE: 1, abD: 1, hy: NINHADO.hy, hP: 4, puff: NINHADO.puff, top: .5 }, 120, esai);
      yield* durante(300, u => { P.hR = 10 * Math.sin(u * PI * 4) * (1 - u); });
      yield* tw({ top: 0, hP: 0 }, 200);
    }
    function* ajeitar() {                            // levanta-se um bocadinho, abana-se e volta a aninhar-se
      yield* tw({ cH: NINHADO.cH + 16, cP: 10 }, 220, esai);
      ramo.v -= 40;
      yield* durante(500, u => { P.cR = 8 * Math.sin(u * PI * 4) * (1 - u); });
      yield* tw({ cH: NINHADO.cH, cP: NINHADO.cP, cR: 0 }, 300, eio);
      ramo.v += 70; cauda.v += 180;
    }
    function* estalosNinho() {
      for (let i = 0; i < 4; i++) {
        yield* tw({ hY: escolhe([-60, -30, 0, 30, 60]), hR: aleat(-12, 12), hP: aleat(-4, 14) }, 60, esai);
        yield* espera(aleat(300, 700));
      }
      yield* tw({ hY: 0, hR: 0, hP: 0 }, 90, esai);
    }
    const NINHO_COMP = { estalosNinho, afofar, alisarPenas, sonolento, ajeitar, olharPetala, baterAsas };
    let ultimoDentro = null;
    function* cicloDentro() {
      for (;;) {
        yield* recomporNinho();
        yield* esperaViva(aleat(1300, 2800));
        let nome; do nome = escolhe(Object.keys(NINHO_COMP)); while (nome === ultimoDentro);
        ultimoDentro = nome;
        yield* NINHO_COMP[nome]();
      }
    }

    /* --- reação ao toque: olhos contentes, topete eriçado, pulinho a bater as asas e a cauda a abanar --- */
    function* reacao() {
      reagindo = true;
      atr(R.semBico, 'display', 'none');
      yield* acabarSalto();
      if (apoio === 'agua') camada('banho');
      const b = BASE, s0 = P.salto;
      const rosto = tw({ feliz: .9, top: 1, bico: .3, olhosEsc: 1.12, abE: 1, abD: 1, hx: b.hx, hy: b.hy, hz: 0, hY: limita(P.h * .8, -40, 40), hP: 10, hR: 0, cP: b.cP, cR: 0, cY: 0, puff: .25 }, 90, esai);
      const corpo = (function* () {
        if (s0 < 3) yield* tw({ cH: b.cH - 16, sq: .07, aE: .25, aD: .25 }, 70, esai);
        const c0 = P.cH;
        cauda.v += 300;
        yield* durante(400, u => {
          P.salto = lerp(s0, 0, u) + 34 * 4 * u * (1 - u); P.sq = -.06 * sino(u); P.enc = .3 * sino(u);
          P.aE = P.aD = .2 + .75 * sino(u * 1.1); P.batE = P.batD = 30 + 46 * Math.sin(u * PI * 6);
          P.cH = lerp(c0, b.cH, Math.min(1, u * 3));
        });
        P.salto = 0; P.enc = 0;
        if (apoio === 'agua') { onda(P.x, AGUA_Y + 2, 50, 600); for (let i = 0; i < 4; i++) gota(P.x + aleat(-40, 40), AGUA_Y - 4, aleat(-150, 150), -aleat(200, 340), aleat(2.4, 3.6)); }
        yield* tw({ sq: .08, cH: b.cH - 10, aE: 0, aD: 0, batE: 30, batD: 30 }, 80, esai);
        cauda.v += 220;
        yield* tw({ sq: 0, cH: b.cH }, 180, eio);
      })();
      yield* juntos(rosto, corpo);
      yield* juntos(tw({ bico: 0, hP: b.hP, puff: 0 }, 200), durante(500, u => { P.hR = 10 * Math.sin(u * PI * 3) * (1 - u); }));
      reagindo = false;
      yield* tw(Object.assign({}, ROSTO, { top: 0, hR: 0, hY: 0 }), 360);
    }
    function* reacaoNinho() {                        // no ninho: afofa-se todo, bate as asinhas e abana-se de contente
      reagindo = true;
      const b = NINHADO;
      const rosto = tw({ feliz: .9, top: 1, bico: .3, olhosEsc: 1.12, abE: 1, abD: 1, hx: b.hx, hy: b.hy, hz: 0, hY: limita(P.h, -30, 30), hP: 10, hR: 0 }, 90, esai);
      const corpo = (function* () {
        yield* tw({ cH: b.cH + 14, puff: 1, aE: .4, aD: .4 }, 100, esai);
        ramo.v -= 60; cauda.v += 260;
        yield* durante(460, u => { P.batE = P.batD = 34 + 40 * Math.sin(u * PI * 7); P.cR = 7 * Math.sin(u * PI * 4); P.aE = P.aD = .4 * (1 - u * .5); });
        ramo.v += 90;
        yield* tw({ cH: b.cH, puff: b.puff, aE: 0, aD: 0, batE: 30, batD: 30, cR: 0 }, 260, eio);
      })();
      yield* juntos(rosto, corpo);
      yield* juntos(tw({ bico: 0, hP: 0 }, 200), durante(500, u => { P.hR = 10 * Math.sin(u * PI * 3) * (1 - u); }));
      reagindo = false;
      yield* tw(Object.assign({}, ROSTO, { top: 0, hR: 0, hY: 0 }), 360);
    }

    /* --- som: «piu piu». Em cada sílaba o bico abre, a cabeça dá um impulso para cima e a cauda dá um toque --- */
    function* silaba(ms) {
      cauda.v += 150;
      yield* durante(ms, u => {
        const k = u < .2 ? esai(u / .2) : u < .6 ? 1 : 1 - eseno((u - .6) / .4);
        P.somB = .85 * k; P.somH = Math.sin(PI * Math.min(1, u * 1.2));
      });
      P.somB = 0; P.somH = 0;
    }
    function* rampaCanto(total) {
      yield* durante(120, u => { P.canto = esai(u); });
      yield* espera(Math.max(0, total - 120));
      yield* durante(260, u => { P.canto = 1 - eio(u); });
      P.canto = 0;
    }
    function* cantarSilabas(silabas) {
      const fim = silabas.reduce((m, [a, d]) => Math.max(m, a + d), 0) * 1000;
      const boca = (function* () {
        let t = 0;
        for (const [a, d] of silabas) {
          if (a > t) yield* espera((a - t) * 1000);
          yield* silaba(limita(d * 1000, 90, 900));
          t = a + Math.max(d, .09);
        }
      })();
      yield* juntos(rampaCanto(fim), boca);
    }
    function* cantarMs(ms) {
      const nQ = limita(Math.round(ms / 330), 2, 4), per = ms / nQ;
      const boca = (function* () { for (let i = 0; i < nQ; i++) { yield* silaba(per * .62); if (i < nQ - 1) yield* espera(per * .38); } })();
      yield* juntos(rampaCanto(ms), boca);
    }

    /* --- ida ao ninho: vira-se com um saltinho, agacha-se, salta e voa em arco a bater as asas; por cima do ninho
           endireita o corpo, abre as asas e a cauda para travar, pousa (o ramo baixa), aninha-se e afofa as penas --- */
    function* idaAoNinho() {
      modo = 'indo'; reagindo = false;
      yield* acabarSalto();
      if (apoio === 'agua') yield* saltarPara(REPOUSO.x, 'borda', -10, 320, 44);
      focar(() => [NINHO.x, NINHO.y - 10]);
      yield* juntos(arrumar(160), saltinho(P.x, 64, 260, 14));
      // antecipação: agacha-se, levanta a cauda, abre um pouco as asas e olha para o ninho
      yield* tw({ cH: BASE.cH - 30, sq: .09, cP: 2, cU: 20, aE: .3, aD: .3, batE: 56, batD: 56, hy: BASE.hy - 10, hP: 16, top: .3 }, 220, esai);
      apoio = 'ar';
      const x0 = P.x, g0 = P.gy, h0 = P.h, xA = NO_NINHO.x + 40, yA = 110;
      bater.amp = 1; bater.freq = 5.6; cauda.v -= 200;
      // 1) o salto e o voo em arco
      yield* durante(900, u => {
        const e = eseno(u);
        P.x = lerp(x0, xA, e); P.gy = lerp(g0, NO_NINHO.gy + queda(NO_NINHO.x), e);
        P.y = lerp(0, yA, eio(u)) + 60 * sino(u);
        P.h = lerp(h0, 76, eio(u));
        P.cH = lerp(BASE.cH - 30, BASE.cH, Math.min(1, u * 4)); P.sq = -.07 * sino(u * 3);
        P.enc = limita(u * 5, 0, 1); P.cP = lerp(2, -10, Math.min(1, u * 3)); P.cU = lerp(20, 12, u);
        P.aE = P.aD = limita(.3 + u * 6, 0, 1); P.batE = P.batD = 24;
        P.hy = lerp(BASE.hy - 10, 76, u); P.hx = lerp(BASE.hx, 54, u); P.hP = lerp(16, -2, u); P.top = .3 * (1 - u);
      });
      // 2) travar por cima do ninho e descer lá para dentro
      camada('dentro');
      const x1 = P.x, y1 = P.y, h1 = P.h;
      bater.freq = 3.8;
      yield* durante(440, u => {
        const e = eio(u);
        P.x = lerp(x1, NO_NINHO.x, e); P.gy = NO_NINHO.gy + queda(NO_NINHO.x); P.y = lerp(y1, 0, eseno(u));
        P.h = lerp(h1, NO_NINHO.h, e);
        P.cP = lerp(-10, 42, Math.min(1, u * 2.4)); P.leque = sino(u * 1.1) * 1.2; P.cU = lerp(12, -6, sino(u));
        P.enc = 1 - limita(u * 2, 0, 1); P.batE = P.batD = lerp(24, 40, u); bater.amp = 1 - .4 * u;
        P.hx = lerp(54, NINHADO.hx, u); P.hy = lerp(76, NINHADO.hy, u); P.hP = lerp(-2, 6, u);
      });
      apoio = 'ninho'; P.y = 0; bater.amp = 0; ramo.v += 190; cauda.v += 280;
      yield* tw({ sq: .1, cH: NINHADO.cH + 22, cP: 22, aE: .7, aD: .7, batE: 64, batD: 64, leque: .7 }, 110, esai);
      yield* tw({ aE: 0, aD: 0, batE: 30, batD: 30, leque: 0, sq: 0, cP: NINHADO.cP, cU: NINHADO.cU }, 240, eio);
      // aninha-se: abana-se de um lado para o outro enquanto se senta
      yield* durante(520, u => { P.cR = 9 * Math.sin(u * PI * 4) * (1 - u); P.cH = lerp(NINHADO.cH + 22, NINHADO.cH, eio(u)); P.puff = NINHADO.puff * u; P.hx = NINHADO.hx; P.hy = NINHADO.hy; });
      P.cR = 0; ramo.v += 50;
      modo = 'dentro'; focar(null);
    }
    function* depoisDeAninhar() {                    // afofa as penas, contente
      yield* tw({ puff: 1, abE: .45, abD: .45, top: .4 }, 260, esai);
      yield* espera(500);
      cauda.v += 180;
      yield* tw({ puff: NINHADO.puff, abE: 1, abD: 1, top: 0 }, 420, eio);
    }
    /* --- volta: levanta-se, sacode-se, agacha-se e voa para a borda do banho; trava com as asas e a cauda e pousa --- */
    function* voltaDoNinho() {
      modo = 'voltando'; reagindo = false;
      focar(() => [REPOUSO.x - 30, bordaY(REPOUSO.x) - 120]);
      yield* juntos(arrumar(120), tw({ cH: BASE.cH, puff: 0, cP: BASE.cP, cU: 0 }, 260, eio));
      yield* durante(300, u => { const w = Math.sin(u * PI * 6) * (1 - u); P.cR = 10 * w; P.hR = -14 * w; P.puff = .5 * (1 - u); });
      P.cR = 0; P.hR = 0; P.puff = 0;
      yield* tw({ cH: BASE.cH - 28, sq: .08, cP: 4, cU: 18, aE: .3, aD: .3, batE: 56, batD: 56, h: -56, hP: 10 }, 200, esai);
      apoio = 'ar'; ramo.v -= 150; cauda.v -= 200;
      const x0 = P.x, g0 = P.gy, h0 = P.h, xF = REPOUSO.x, gF = bordaY(REPOUSO.x);
      let trocou = false;
      bater.amp = 1; bater.freq = 5.6;
      yield* durante(760, u => {
        const e = eseno(u);
        P.x = lerp(x0, xF + 24, e); P.gy = lerp(g0, gF, e);
        P.y = lerp(0, 44, u) + 110 * sino(u);
        P.h = lerp(h0, -80, eio(u));
        P.enc = limita(u * 5, 0, 1); P.cP = lerp(4, -10, Math.min(1, u * 3)); P.cH = lerp(BASE.cH - 28, BASE.cH, Math.min(1, u * 4));
        P.aE = P.aD = limita(.3 + u * 6, 0, 1); P.batE = P.batD = 24; P.sq = -.06 * sino(u * 3);
        if (!trocou && u > .2) { trocou = true; camada('fora'); }
      });
      const x1 = P.x, y1 = P.y;
      bater.freq = 3.8;
      yield* durante(300, u => {
        const e = eio(u);
        P.x = lerp(x1, xF, e); P.y = lerp(y1, 0, eseno(u));
        P.cP = lerp(-10, 40, Math.min(1, u * 2.4)); P.leque = sino(u * 1.1) * 1.2; P.enc = 1 - limita(u * 2, 0, 1);
        P.batE = P.batD = lerp(24, 40, u); bater.amp = 1 - .4 * u;
      });
      apoio = 'borda'; P.y = 0; bater.amp = 0; cauda.v += 280;
      yield* tw({ sq: .09, cH: BASE.cH - 14, cP: 22, aE: .5, aD: .5, batE: 60, batD: 60, leque: .6 }, 100, esai);
      yield* tw({ sq: 0, cH: BASE.cH, cP: BASE.cP, aE: 0, aD: 0, batE: 30, batD: 30, leque: 0, cU: 0, hP: 0 }, 220, eio);
      yield* saltinho(REPOUSO.x, REPOUSO.h, 260, 14);
      focar(null);
      modo = 'fora';
    }

    /* --- cenário vivo --- */
    const borb = { x: 360, y: 640, vx: 0, vy: 0, alvo: [360, 640], t: 0, chamar: false };
    const petalas = R.petalas.map((el, i) => ({ el, estado: 'cai', x: 0, y: 0, vy: 0, rot: 0, vr: 0, ph: 0, t: 0, chao: 0, espera: 0 }));
    function largarPetala(p, forte) {
      const daMacieira = !forte && Math.random() < .3;
      Object.assign(p, {
        estado: 'cai', x: daMacieira ? aleat(60, 330) : aleat(940, 1620), y: daMacieira ? aleat(260, 420) : aleat(110, 420),
        vy: aleat(34, 56), vx0: forte ? -aleat(160, 260) : -aleat(8, 26), rot: aleat(0, 360), vr: aleat(-90, 90), ph: aleat(0, 6), t: 0,
        chao: aleat(680, 880), k: aleat(.9, 1.3)
      });
      atr(p.el, 'opacity', '1'); atr(p.el, 'display', 'inline');
    }
    petalas.forEach((p, i) => { largarPetala(p); p.y = aleat(p.y, 760); if (i % 4 === 3) { p.estado = 'espera'; p.espera = aleat(500, 6000); atr(p.el, 'display', 'none'); } });
    function atualizarPetalas(dt) {
      const s = dt / 1000, tt = tempo / 1000;
      for (const p of petalas) {
        if (p.estado === 'espera') { p.espera -= dt; if (p.espera <= 0) largarPetala(p); continue; }
        p.t += dt;
        if (p.estado === 'cai') {
          const vx = p.vx0 - 50 * vento.v + 22 * Math.sin(tt * 1.7 + p.ph);
          p.x += vx * s * calma; p.y += p.vy * s * calma * (1 - .3 * vento.v); p.rot += p.vr * s * (1 + 2 * vento.v);
          p.vx0 *= Math.exp(-s * .6);
          if (p.y >= p.chao) { p.estado = 'chao'; p.t = 0; }
          if (p.x < -40) { p.estado = 'espera'; p.espera = aleat(500, 3000); atr(p.el, 'display', 'none'); continue; }
        } else if (p.estado === 'chao') {
          atr(p.el, 'opacity', n3(limita(1 - (p.t - 3000) / 900, 0, 1)));
          if (p.t > 3900) { p.estado = 'espera'; p.espera = aleat(300, 4000); atr(p.el, 'display', 'none'); continue; }
        }
        const sx = p.estado === 'chao' ? 1 : Math.cos(tt * 3 + p.ph) * .5 + .6;
        poe(p.el, `translate(${n(p.x)},${n(p.y)}) rotate(${n(p.rot % 360)}) scale(${n3(sx * p.k)},${n3(p.k)})`);
      }
    }
    function animarCena(dt) {
      const t = tempo / 1000;
      NUV.forEach((c, i) => { const x = ((c.x + 200 + t * (5 + i * 1.6) * calma) % 2000) - 200; poe(R.nuvens[i], `translate(${n(x)},${c.y}) scale(${c.k})`); });
      R.aves.forEach((a, i) => { const x = ((t * (22 + i * 5) * calma + i * 700) % 2600) - 400, y = 300 + i * 34 + 10 * Math.sin(t * .6 + i); poe(a, `translate(${n(x)},${n(y)}) scale(1,${n3(.55 + .45 * Math.abs(Math.sin(t * 5 + i)))})`); });
      atr(R.aura, 'opacity', n3(.3 + .1 * Math.sin(t * .9)));
      // vento: as copas baloiçam (mais na rajada) e as margaridas abanam
      R.copas.forEach((o, i) => poe(o.g, `rotate(${n3((.6 + 2.4 * vento.v) * Math.sin(t * (.7 + vento.v) + i * 1.9) * calma - 1.6 * vento.v)},${o.x},${o.y + 200})`));
      R.margs.forEach((g, i) => poe(g, `rotate(${n3((2.2 + 5 * vento.v) * Math.sin(t * 1.1 + i * 1.7) * calma)})`));
      // brilhos na água
      R.brilhos.forEach((el, i) => {
        const u = (t * .28 + i * .25) % 1, x = TANQUE.x - 96 + i * 60 + 12 * Math.sin(t * .5 + i * 2), y = AGUA_Y - 8 + (i % 2) * 10;
        poe(el, `translate(${n(x)},${n(y)}) scale(${n(8 + 8 * u)},1.6)`); atr(el, 'opacity', n3(.75 * Math.sin(PI * u)));
      });
      // a semente volta a aparecer (caiu outra da árvore) quando o passarinho não está a olhar
      if (!semente.vis) { semente.fora += dt; if (semente.fora > 9000) { semente.vis = true; atr(R.semente, 'opacity', '1'); } }
      atualizarPetalas(dt);
      // borboleta-limão: passeia pela relva e pelo jardim aos ziguezagues (e vem ver o passarinho quando ele olha)
      borb.t -= dt;
      if (borb.t <= 0) {
        borb.t = aleat(1100, 2400);
        borb.alvo = borb.chamar && G ? [G.cab[0] + escolhe([-1, 1]) * aleat(140, 220), G.cab[1] - aleat(-40, 100)] : [aleat(260, 1300), aleat(420, 760)];
        if (G && Math.hypot(borb.alvo[0] - G.cab[0], borb.alvo[1] - G.cab[1]) < 170) borb.alvo[0] = G.cab[0] + (borb.alvo[0] < G.cab[0] ? -200 : 200);
      }
      const s = dt / 1000, dx = borb.alvo[0] - borb.x, dy = borb.alvo[1] - borb.y;
      borb.vx += (dx * 1.6 - borb.vx * 1.4) * s; borb.vy += (dy * 1.6 - borb.vy * 1.4) * s;
      const vm = Math.hypot(borb.vx, borb.vy); if (vm > 130) { borb.vx *= 130 / vm; borb.vy *= 130 / vm; }
      if (G) for (const [cx, cy, rr] of [[G.cab[0], G.cab[1], 150], [G.el.tronco.x, G.el.tronco.y, 200]]) { const ex = borb.x - cx, ey = borb.y - cy, dd = Math.hypot(ex, ey); if (dd < rr) { borb.vx += ex / (dd || 1) * 1100 * s; borb.vy += ey / (dd || 1) * 1100 * s; } }
      borb.x += borb.vx * s * calma; borb.y += borb.vy * s * calma;
      poe(R.borb, `translate(${n(borb.x)},${n(borb.y + 6 * Math.sin(t * 5.3))}) rotate(${n(limita(borb.vx / 6, -25, 25))}) scale(.8)`);
      poe(R.borbAsas, `scale(${n3(.2 + .8 * Math.abs(Math.cos(t * 15)))},1)`);
    }

    /* --- acontecimentos raros (a cada 15–40 s): um abelhão visita as margaridas; uma rajada de vento faz chover pétalas --- */
    const eventos = { prox: aleat(9000, 15000), ultimo: null };
    function iniciarEvento(tipo) {
      const ev = { tipo, x: -100, y: -100, vivo: true };
      ev.pos = () => [ev.x, ev.y];
      lancar('evento', tipo === 'abelha' ? evAbelha(ev) : evRajada(ev), () => { ev.vivo = false; });
      if (modo === 'fora' && !reagindo) lancar('corpo', observar(ev), () => lancar('corpo', cicloFora()));
      else if (modo === 'dentro' && !reagindo) lancar('corpo', observar(ev), () => lancar('corpo', cicloDentro()));
      return ev;
    }
    function atualizarEventos(dt) {
      if (faixas.has('evento') || modo === 'indo' || modo === 'voltando') return;
      eventos.prox -= dt;
      if (eventos.prox > 0) return;
      eventos.prox = aleat(15000, 40000);
      const tipo = eventos.ultimo === 'abelha' ? 'rajada' : 'abelha';
      eventos.ultimo = tipo;
      iniciarEvento(tipo);
    }
    function* observar(ev) {
      reagindo = false;
      yield* acabarSalto();
      atr(R.semBico, 'display', 'none');
      const b = baseP();
      yield* tw({ olhosEsc: 1.08, top: .5, bico: 0, feliz: 0, hx: b.hx, hy: b.hy, cP: b.cP, cH: b.cH, aE: 0, aD: 0, batE: 30, batD: 30, cR: 0 }, 200, esai);
      let t = 0;
      focar(ev.pos);
      while (ev.vivo && t < 9000) {
        const dt = yield; t += dt;
        if (!G) continue;
        const p = ev.pos(), dx = p[0] - G.cab[0], dy = p[1] - G.cab[1];
        const yaw = limita(P.h - limita(dx / 4, -85, 85), -80, 80), pit = limita(-dy / 6, -30, 35), k = 1 - Math.exp(-dt / 180);
        P.hY += (yaw - P.hY) * k; P.hP += (pit - P.hP) * k;
      }
      focar(null);
      yield* tw({ hY: 0, hP: b.hP, olhosEsc: 1, top: 0 }, 360);
    }
    function* evAbelha(ev) {                         // um abelhão entra pela esquerda, visita duas margaridas, vem ver o passarinho e vai-se embora
      const g = R.abelha;
      atr(g, 'display', 'inline');
      const zumbe = (de, para, ms, alto) => durante(ms, (u, t) => {
        const e = eseno(u);
        ev.x = lerp(de[0], para[0], e) + 8 * Math.sin(t / 90); ev.y = lerp(de[1], para[1], e) - alto * sino(u) + 6 * Math.sin(t / 70);
        poe(g, `translate(${n(ev.x)},${n(ev.y)}) scale(${para[0] < de[0] ? -1 : 1},1)`);
        poe(R.abAsas, `scale(1,${n3(.3 + .7 * Math.abs(Math.sin(t / 18)))})`);
      });
      const paira = (p, ms) => durante(ms, (u, t) => { ev.x = p[0] + 4 * Math.sin(t / 120); ev.y = p[1] + 5 * Math.sin(t / 90); poe(g, `translate(${n(ev.x)},${n(ev.y)})`); poe(R.abAsas, `scale(1,${n3(.3 + .7 * Math.abs(Math.sin(t / 18)))})`); });
      yield* zumbe([-80, 620], [330, 770], 2200, 60);
      yield* paira([330, 770], 900);
      yield* zumbe([330, 770], [940, 470], 2000, 80);
      yield* paira([940, 470], 1000);
      yield* zumbe([940, 470], [1720, 360], 2400, 40);
      atr(g, 'display', 'none');
      yield* espera(300);
    }
    function* evRajada(ev) {                         // uma rajada de vento: as árvores abanam e caem muitas pétalas
      for (const p of petalas) if (p.estado !== 'cai' || p.x > 900) largarPetala(p, true);
      const guia = petalas.reduce((a, b) => (Math.abs(a.x - 1100) < Math.abs(b.x - 1100) ? a : b));
      yield* durante(4200, u => {
        vento.v = u < .15 ? esai(u / .15) : u < .55 ? 1 : 1 - eseno((u - .55) / .45);
        ev.x = guia.x; ev.y = guia.y;
      });
      vento.v = 0;
    }

    /* --- relógio único --- */
    let erroMostrado = false;
    function passo(dt) {
      if (!vivo) return;
      try {
        dt = Math.min(dt, 50);
        tempo += dt; dtUlt = dt;
        fase.resp += dt / 1000 * 2 * PI * (apoio === 'ninho' ? .45 : .6);
        atualizarPiscar(dt);
        atualizarOlharLivre(dt);
        for (const nome of Array.from(faixas.keys())) avancarF(nome, dt);
        atualizarExtras(dt);
        atualizarEventos(dt);
        animarCena(dt);
        desenhar();
        desenharRamo();
        atualizarGotas(dt);
        atualizarOndas(dt);
        atualizarPenugem(dt);
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    poe(R.semente, `translate(${SEMENTE.x},${n(bordaY(SEMENTE.x) - 3)}) rotate(-20) scale(6,3.4)`); atr(R.semente, 'opacity', '1');
    const desligar = relogio.aCada(passo);
    lancar('corpo', cicloFora());
    atualizarExtras(0); animarCena(0); desenhar(); desenharRamo();

    return {
      animal: R.passaro,
      habitat: R.habitat,
      reagir() {
        if (!vivo) return;
        if (modo === 'fora') lancar('corpo', reacao(), () => { reagindo = false; lancar('corpo', cicloFora()); });
        else if (modo === 'dentro') lancar('corpo', reacaoNinho(), () => { reagindo = false; lancar('corpo', cicloDentro()); });
        else { P.top = 1; }
      },
      fazerSom(ms, silabas) {
        if (!vivo) return;
        const fim = () => { P.somB = 0; P.somH = 0; P.canto = 0; };
        if (Array.isArray(silabas) && silabas.length) lancar('boca', cantarSilabas(silabas), fim);
        else lancar('boca', cantarMs(limita(ms || 900, 300, 3000)), fim);
      },
      irAoHabitat() {
        return new Promise(res => {
          if (!vivo || modo !== 'fora') { res(); return; }
          lancar('corpo', idaAoNinho(), () => { res(); lancar('corpo', (function* () { yield* depoisDeAninhar(); yield* cicloDentro(); })()); });
        });
      },
      voltar() {
        return new Promise(res => {
          if (!vivo || modo !== 'dentro') { res(); return; }
          lancar('corpo', voltaDoNinho(), () => { res(); lancar('corpo', cicloFora()); });
        });
      },
      destruir() {
        vivo = false;
        faixas.clear();
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola
      _teste: { P, ramo, cauda, modo: () => modo, apoio: () => apoio, G: () => G, evento: iniciarEvento, desenhar,
        comportamento: nome => lancar('corpo', (COMPORTAMENTOS[nome] || NINHO_COMP[nome])(), () => lancar('corpo', modo === 'dentro' ? cicloDentro() : cicloFora())),
        parar: () => lancar('corpo', (function* () { for (;;) yield; })()) }
    };
  }

  return { icone: iconeSVG(), montar };
})();
