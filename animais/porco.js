/* Porco — «Os Meus Animais». Contrato e regras: REGRAS-ANIMAIS.md.
   Cena: o pátio de uma quinta portuguesa ao meio-dia (sol alto, à esquerda): céu limpo com nuvens, colinas douradas do
   Alentejo com sobreiros e uma aldeia branca ao longe, um muro de pedra caiado com barra azul e girassóis por trás,
   uma pocilga de madeira com telhado de telha e cata-vento, uma cerca de madeira com o poste de coçar, a gamela,
   palha no chão de terra batida, abelhas nos girassóis.
   Habitat: a poça de lama junto à pocilga. O porco vai a trote, entra na lama, deita-se e rebola-se (salpicos, manchas de
   lama que ficam no corpo e depois secam e caem) e fica de barriga para o ar, feliz, a mexer as patas. Camadas: margem e
   lama de trás → porco → cópia da lama recortada pela linha da lama do porco (véu) e a borda da frente.
   O porco é um boneco «2,5D»: o tronco é um elipsoide 3D (rumo, inclinação e rebolar à volta do eixo comprido)
   projetado numa elipse (raiz quadrada simétrica da matriz projetada: o brilho não roda); as manchas de lama e a barriga
   estão desenhadas na superfície e só se veem do lado virado para nós; as 4 patas têm IK no plano do corpo, com os cascos
   presos ao chão (trote em pares diagonais, por distância) ou soltos no ar (deitado); a cabeça é uma esfera com as
   feições a deslizar, o focinho é um cilindro com disco e duas narinas, as orelhas são planos 3D caídos para a frente;
   a cauda é uma hélice 3D (saca-rolhas) que roda.
   Organização: 1) utilidades  2) medidas  3) desenho do porco  4) cenário e poça  5) ícone
                6) montar(): estado, desenho por quadro, lama e partículas, tarefas, comportamentos, idas e voltas */
'use strict';
MODULOS.porco = (() => {
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
  function catmull(pts, u) {
    const ns = pts.length - 1, s = Math.min(ns - 1e-6, Math.max(0, u) * ns), i = Math.floor(s), t = s - i;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(ns, i + 2)];
    const f = (a, b, c, d) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
    return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
  }
  // curva suave por uma lista de pontos (meios das arestas com quadráticas); fechada = volta ao início
  function liso(q, mover) {
    let s = mover ? `M${n(q[0][0])},${n(q[0][1])}` : '';
    for (let i = 1; i < q.length - 1; i++) { const m0 = (q[i][0] + q[i + 1][0]) / 2, m1 = (q[i][1] + q[i + 1][1]) / 2; s += `Q${n(q[i][0])},${n(q[i][1])} ${n(m0)},${n(m1)}`; }
    const u = q[q.length - 1];
    return s + `L${n(u[0])},${n(u[1])}`;
  }
  function lisoFechado(q) {
    const m = q.length, mid = i => [(q[i][0] + q[(i + 1) % m][0]) / 2, (q[i][1] + q[(i + 1) % m][1]) / 2];
    let s = `M${n(mid(m - 1)[0])},${n(mid(m - 1)[1])}`;
    for (let i = 0; i < m; i++) { const b = mid(i); s += `Q${n(q[i][0])},${n(q[i][1])} ${n(b[0])},${n(b[1])}`; }
    return s + 'Z';
  }
  // vetores 3D (mundo: x para a direita, z para nós, h para cima)
  const soma = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const esc3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const pint = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const vet = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const unit = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  // elipse com a matriz simétrica E = [[p,q],[q,r]] (= M·Mᵀ): eixos e ângulo, ou a raiz quadrada simétrica
  function eixos(p, q, r) {
    const m = (p + r) / 2, d = Math.sqrt(Math.max(0, ((p - r) / 2) ** 2 + q * q));
    return { rx: Math.sqrt(Math.max(1e-6, m + d)), ry: Math.sqrt(Math.max(1e-6, m - d)), ang: .5 * Math.atan2(2 * q, p - r) / RAD };
  }
  function raizSim(p, q, r) {
    const s = Math.sqrt(Math.max(1e-9, p * r - q * q)), t = Math.sqrt(p + r + 2 * s);
    return [(p + s) / t, q / t, q / t, (r + s) / t];
  }
  const mat = (S, c) => `matrix(${n3(S[0])},${n3(S[1])},${n3(S[2])},${n3(S[3])},${n(c[0])},${n(c[1])})`;

  /* ================= 2) Medidas do porco (unidades do porco; no ecrã × ESC) ================= */
  const ESC = 1.3;                // escala do porco no cenário
  const KZ = .18;                 // quanto a profundidade (z) desce no ecrã: vista ligeiramente de cima
  const CHAO = 742;               // y do chão (profundidade 0)
  const TA = 104, TB = 72, TC = 74;   // semi-eixos do tronco (comprido, largo, alto)
  const HC = 106;                 // altura do centro do tronco, de pé
  const TORN = 10;                // altura do tornozelo (o casco fica por baixo)
  // patas: lado +1 = v positivo (o lado virado para nós quando o porco olha para a direita); kd = sentido do joelho
  const PERNAS = [
    { id: 'fA', fr: 1, lado: 1, u: 58, v: 38, h: -38, L1: 32, L2: 30, pu: 62, kd: 1 },
    { id: 'fB', fr: 1, lado: -1, u: 58, v: -38, h: -38, L1: 32, L2: 30, pu: 62, kd: 1 },
    { id: 'tA', fr: 0, lado: 1, u: -60, v: 38, h: -40, L1: 32, L2: 30, pu: -60, kd: -1 },
    { id: 'tB', fr: 0, lado: -1, u: -60, v: -38, h: -40, L1: 32, L2: 30, pu: -60, kd: -1 }
  ];
  const CAB = { u: 96, h: 20 }, RC = 56;              // ponto da cabeça no tronco e raio do crânio
  const FOC = { b: 37, L: 20, rx: 26, ry: 21 };       // focinho: distância da base ao centro da cabeça, comprimento e raios do disco
  const CAUDA0 = { u: -TA + 6, h: 22 };
  const LAMA = { cx: 1030, cy: 760, rx: 218, ry: 54 }; // poça (no ecrã)
  const PROF = 14;                                     // fundura da lama (unidades) onde os cascos se enterram
  const COR = { cont: '#8A3C48', pele: '#F4A8B4', clara: '#FFD7DE', escura: '#D98090', casco: '#7A5048', lamaM: '#5A3A22', lamaS: '#B8996F' };
  const CASCO = 'M-9.5,-4 C-10.5,3 -10.5,8 -9.5,12 C-7,13.4 -3.5,13.4 -1,12 L0,6.5 L1,12 C3.5,13.4 7,13.4 9.5,12 C10.5,8 10.5,3 9.5,-4 Z';
  const ORELHA = 'M0,-17 C14,-21 32,-16 44,-3 C47,1 46,6 42,9 C30,15 14,17 0,15 C-3,6 -3,-8 0,-17 Z';
  const ORELHA_IN = 'M4,-12 C16,-15 30,-11 39,-2 C41,1 40,4 37,6 C27,10 15,12 4,10 C2,4 2,-6 4,-12 Z';

  /* ================= 3) Desenho do porco ================= */
  function defsPorco(p) {
    return `
    <radialGradient id="${p}pele" cx=".38" cy=".3" r=".82"><stop offset="0" stop-color="#FFDCE2"/><stop offset=".5" stop-color="#F7B0BC"/><stop offset="1" stop-color="#DC8494"/></radialGradient>
    <linearGradient id="${p}luzV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".22"/><stop offset=".3" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".62" stop-color="#7A2A3C" stop-opacity="0"/><stop offset="1" stop-color="#7A2A3C" stop-opacity=".26"/></linearGradient>
    <linearGradient id="${p}perna" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBC6CF"/><stop offset=".5" stop-color="#F2A6B2"/><stop offset="1" stop-color="#D88594"/></linearGradient>
    <radialGradient id="${p}joelho" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#FBC2CB"/><stop offset="1" stop-color="#E799A6"/></radialGradient>
    <linearGradient id="${p}casco" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A4766A"/><stop offset=".6" stop-color="#7C5249"/><stop offset="1" stop-color="#5E3C36"/></linearGradient>
    <radialGradient id="${p}cab" gradientUnits="userSpaceOnUse" cx="-20" cy="-26" r="86"><stop offset="0" stop-color="#FFDFE5"/><stop offset=".55" stop-color="#F7B2BE"/><stop offset="1" stop-color="#E0899A"/></radialGradient>
    <radialGradient id="${p}papada" cx=".45" cy=".3" r=".75"><stop offset="0" stop-color="#F8B9C3"/><stop offset="1" stop-color="#DE8798"/></radialGradient>
    <radialGradient id="${p}focD" cx=".4" cy=".34" r=".72"><stop offset="0" stop-color="#FFD3DA"/><stop offset=".7" stop-color="#F6AAB7"/><stop offset="1" stop-color="#E58F9F"/></radialGradient>
    <linearGradient id="${p}focL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F9BCC6"/><stop offset="1" stop-color="#E08C9C"/></linearGradient>
    <linearGradient id="${p}palp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F9BDC7"/><stop offset="1" stop-color="#E699A7"/></linearGradient>
    <radialGradient id="${p}iris" cx=".42" cy=".38" r=".65"><stop offset="0" stop-color="#7A5236"/><stop offset=".45" stop-color="#4A2C18"/><stop offset="1" stop-color="#1E100A"/></radialGradient>
    <linearGradient id="${p}orelhaFora" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FAC0CA"/><stop offset=".6" stop-color="#F0A0AE"/><stop offset="1" stop-color="#D88292"/></linearGradient>
    <radialGradient id="${p}orelhaIn" cx=".3" cy=".4" r=".8"><stop offset="0" stop-color="#F8A6B4"/><stop offset=".6" stop-color="#EC8798"/><stop offset="1" stop-color="#D86F82"/></radialGradient>
    <radialGradient id="${p}sombra"><stop offset="0" stop-color="#4A2E14" stop-opacity=".44"/><stop offset=".6" stop-color="#4A2E14" stop-opacity=".2"/><stop offset="1" stop-color="#4A2E14" stop-opacity="0"/></radialGradient>
    <clipPath id="${p}clipTronco"><ellipse class="pc-clipT" rx="1" ry="1"/></clipPath>
    <clipPath id="${p}clipCab"><ellipse rx="${RC}" ry="${RC - 2}"/></clipPath>
    <clipPath id="${p}clipOlho"><ellipse rx="13.5" ry="16"/></clipPath>`;
  }

  /* --- Patas (cada peça desenhada ao longo de +x; contorno numa camada, enchimento noutra) --- */
  const capsula = (L, a, b) => `M0,${-a} L${L},${-b} A${b},${b} 0 0 1 ${L},${b} L0,${a} A${a},${a} 0 0 1 0,${-a} Z`;
  function pernaPecas(pe) {
    return { sup: capsula(pe.L1, pe.fr ? 19 : 23, 12.5), inf: capsula(pe.L2, 11.5, 10) };
  }
  function pernaContSVG(pe) {
    const k = 'pc-' + pe.id, { sup, inf } = pernaPecas(pe);
    return `<g class="${k}-c">
      <g class="${k}-sup"><path d="${sup}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="5.5" stroke-linejoin="round"/></g>
      <g class="${k}-inf"><path d="${inf}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="5.5"/></g>
      <g class="${k}-joe"><circle r="12" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="5.5"/></g>
      <g class="${k}-pe"><path d="${CASCO}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="4.5" stroke-linejoin="round"/></g></g>`;
  }
  function pernaEnchSVG(p, pe) {
    const k = 'pc-' + pe.id, { sup, inf } = pernaPecas(pe);
    return `<g class="${k}-f">
      <g class="${k}-sup"><path d="${sup}" fill="url(#${p}perna)"/><path d="M8,-8 L${pe.L1 - 6},-6" stroke="#FFE6EA" stroke-width="4" opacity=".4" stroke-linecap="round"/></g>
      <g class="${k}-inf"><path d="${inf}" fill="url(#${p}perna)"/><path d="M5,-5 L${pe.L2 - 8},-4.5" stroke="#FFE6EA" stroke-width="3" opacity=".35" stroke-linecap="round"/>
        <path class="pc-lamaPerna" d="M${pe.L2 * .35},-9.5 L${pe.L2},-8 A8,8 0 0 1 ${pe.L2},8 L${pe.L2 * .35},9.5 Q${pe.L2 * .25},4 ${pe.L2 * .4},0 Q${pe.L2 * .22},-5 ${pe.L2 * .35},-9.5 Z" fill="${COR.lamaM}" opacity="0"/></g>
      <g class="${k}-joe"><circle r="12" fill="url(#${p}joelho)"/></g>
      <g class="${k}-pe"><path d="${CASCO}" fill="url(#${p}casco)"/><path d="M-7,-1 C-6,4 -6,8 -5.5,10.5" stroke="#C49A8C" stroke-width="1.6" fill="none" opacity=".7" stroke-linecap="round"/>
        <path d="M0,6.5 L0,12" stroke="#3E2622" stroke-width="1.4"/><path d="M-9.5,-4 C-3,-1 3,-1 9.5,-4" stroke="#E8A9B4" stroke-width="2.2" fill="none"/>
        <path class="pc-lamaCasco" d="${CASCO}" fill="${COR.lamaM}" opacity="0"/></g>
    </g>`;
  }

  /* --- Tronco: elipse (matriz posta a cada quadro) e o que está desenhado na superfície (barriga, manchas de lama) --- */
  const NMT = 16;                 // manchas de lama no tronco
  function troncoContSVG() { return `<ellipse class="pc-trC" rx="1" ry="1" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7"/>`; }
  function troncoEnchSVG(p) {
    return `<ellipse class="pc-trF" rx="1" ry="1" fill="url(#${p}pele)"/>
      <g clip-path="url(#${p}clipTronco)">
        <path class="pc-barriga" fill="#FFD3DA" opacity=".85"/>
        <path class="pc-barrigaL" fill="none" stroke="#E992A2" stroke-width="2" opacity=".5"/>
        <ellipse class="pc-trL" rx="1" ry="1" fill="url(#${p}luzV)"/>
        <g class="pc-trU"><path d="M-.66,-.5 C-.42,-.8 .06,-.9 .42,-.8" stroke="#FFF2F4" stroke-width="9" fill="none" opacity=".45" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
          <path d="M-.5,-.62 l-.04,-.08 M-.36,-.7 l-.02,-.09 M-.2,-.76 l0,-.09 M-.04,-.79 l.02,-.09 M.12,-.79 l.03,-.08 M.28,-.76 l.04,-.08 M-.62,-.42 l-.06,-.06 M.44,-.7 l.05,-.07" stroke="#C97080" stroke-width="1.4" fill="none" opacity=".55" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
          <path d="M.55,.35 C.62,.15 .64,-.05 .6,-.25 M.66,.3 C.72,.12 .73,-.04 .7,-.2" stroke="#D27C8D" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round" vector-effect="non-scaling-stroke"/></g>
        <g class="pc-manchasT">${Array.from({ length: NMT }, (_, i) => `<ellipse class="pc-mt${i}" rx="1" ry="1" fill="${COR.lamaM}" opacity="0"/>`).join('')}</g>
        <ellipse class="pc-trMolh" rx="1" ry="1" fill="#6A4028" opacity="0"/>
      </g>`;
  }

  /* --- Cauda em saca-rolhas (caminho posto a cada quadro) --- */
  function caudaSVG() {
    return `<g class="pc-cauda"><path class="pc-cauC" fill="none" stroke="${COR.cont}" stroke-width="${n(8.5 * ESC)}" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="pc-cauF" fill="none" stroke="#F3A5B2" stroke-width="${n(5 * ESC)}" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="pc-cauL" fill="none" stroke="#FFDDE3" stroke-width="${n(1.6 * ESC)}" stroke-linecap="round" opacity=".8"/></g>`;
  }

  /* --- Cabeça: esfera com as feições a deslizar. Y = cos(rumo da cabeça): −1 perfil para a esquerda … 0 de frente …
         1 perfil para a direita; beta = inclinação (graus, + para baixo). Eixos da cabeça (x direita, y baixo, z para nós):
         F (para a frente), Up (para cima), Lat (lado esquerdo do porco quando está de frente). --- */
  function estadoCabeca(q) {
    const Y = limita(q.Y, -1, 1), al = Math.asin(Y), b = q.beta * RAD;
    const sa = Math.sin(al), ca = Math.cos(al), sb = Math.sin(b), cb = Math.cos(b);
    const F = [cb * sa, sb, cb * ca], Up = [sb * sa, -cb, sb * ca], Lat = [ca, 0, -sa];
    const t = {}, d = {}, op = {}, a = {}, el = {};
    // focinho: cilindro curto com um disco à frente
    const fs = 1 + q.focoS * .14, compF = FOC.L * fs;
    const b3 = soma(esc3(F, FOC.b), esc3(Up, -9)), f3 = soma(b3, esc3(F, compF));
    const B = [b3[0], b3[1] - q.focoS * 2], Fr = [f3[0], f3[1] - q.focoS * 3];
    let cx = ca; if (Math.abs(cx) < .16) cx = cx < 0 ? -.16 : .16;
    const M = [cx * FOC.rx * fs, 0, -Up[0] * FOC.ry * fs, -Up[1] * FOC.ry * fs];   // colunas: (M0,M1) e (M2,M3)
    const E = eixos(M[0] * M[0] + M[2] * M[2], M[0] * M[1] + M[2] * M[3], M[1] * M[1] + M[3] * M[3]);
    a.focE = E; a.focB = B; a.focF = Fr; a.focM = M;
    t.focB = `translate(${n(B[0])},${n(B[1])}) rotate(${n(E.ang)})`;
    t.focF = `translate(${n(Fr[0])},${n(Fr[1])}) rotate(${n(E.ang)})`;
    const D = [Fr[0] - B[0], Fr[1] - B[1]], lD = Math.hypot(D[0], D[1]);
    if (lD > .5) {
      const nr = [-D[1] / lD, D[0] / lD], w0 = M[0] * nr[0] + M[1] * nr[1], w1 = M[2] * nr[0] + M[3] * nr[1], lw = Math.hypot(w0, w1) || 1;
      const pp = [(M[0] * w0 + M[2] * w1) / lw, (M[1] * w0 + M[3] * w1) / lw];
      d.focL = `M${n(B[0] + pp[0])},${n(B[1] + pp[1])} L${n(Fr[0] + pp[0])},${n(Fr[1] + pp[1])} L${n(Fr[0] - pp[0])},${n(Fr[1] - pp[1])} L${n(B[0] - pp[0])},${n(B[1] - pp[1])} Z`;
    } else d.focL = 'M0,0';
    const face = cb * ca;
    op.narinas = n3(passoS(.04, .26, face));
    const nf = 1 + q.narinas * .4;
    for (const s of [1, -1]) {
      const k = s > 0 ? 'D' : 'E', lx = s * .38, ly = .1;
      const c = [Fr[0] + M[0] * lx + M[2] * ly, Fr[1] + M[1] * lx + M[3] * ly];
      t['narina' + k] = mat([M[0] * .15 * nf, M[1] * .15 * nf, M[2] * .29 * nf, M[3] * .29 * nf], c);
    }
    t.focBrilho = mat([M[0] * .34, M[1] * .34, M[2] * .16, M[3] * .16], [Fr[0] + M[0] * -.32 + M[2] * -.55, Fr[1] + M[1] * -.32 + M[3] * -.55]);
    a.ponta = [Fr[0] + M[2] * .2, Fr[1] + M[3] * .2];
    // boca, por baixo do focinho
    const yb = Math.max(B[1], Fr[1]) + FOC.ry * cb * .92 + 4, xb = (B[0] + Fr[0]) / 2 + Y * 4;
    const w = 14 * (.45 + .55 * Math.abs(ca)) + 4;
    const c1 = [xb - w - 12 * Math.max(0, Y), yb - 2 - q.sorriso * 3], c2 = [xb + w + 12 * Math.max(0, -Y), yb - 2 - q.sorriso * 3];
    d.boca = `M${n(c1[0])},${n(c1[1])} Q${n(xb)},${n(yb + 4 + q.sorriso * 4 + q.boca * 4)} ${n(c2[0])},${n(c2[1])}`;
    t.bocaInt = `translate(${n(xb + Y * 3)},${n(yb + 2 + q.boca * 6)})`;
    a.bocaRy = n(.6 + q.boca * 10); a.bocaRx = n(w * .55 + 2 + q.boca * 2);
    t.lingua = `translate(${n(xb + Y * 3)},${n(yb + 3 + q.boca * 11)}) scale(${n3(w / 18)},${n3(limita(q.boca * 1.4, 0, 1))})`;
    t.queixo = `translate(${n(xb + Y * 2 + q.mastX)},${n(yb + 6 + q.boca * 12 + q.mastY)}) scale(${n3((1 - .3 * Math.abs(Y)) * (.6 + q.boca * .5))},${n3(.35 + q.boca * .9)})`;
    a.boca = [xb, yb + 4];
    // olhos, sobrancelhas, bochechas
    for (const s of [1, -1]) {
      const k = s > 0 ? 'E' : 'D';
      const ge = al - s * 33 * RAD, ce = Math.cos(ge), ex = 50 * Math.sin(ge), sx = .22 + .78 * Math.max(0, ce);
      const ey = -15 * cb + 44 * Math.max(0, ce) * sb;
      const es = q.olhoEsc * .74;
      t['olho' + k] = `translate(${n(ex)},${n(ey)}) scale(${n3(sx * es)},${n3(es)})`;
      op['olho' + k] = ce > .08 ? '1' : '0';
      t['sobr' + k] = `translate(${n(51 * Math.sin(ge - s * 2 * RAD))},${n(ey - 17 - q.sobr * 4)}) rotate(${n(s * (10 - q.sobr * 12))}) scale(${n3(sx)},1)`;
      op['sobr' + k] = ce > .12 ? '1' : '0';
      const gc = al - s * 52 * RAD, cc = Math.cos(gc);
      t['boch' + k] = `translate(${n(54 * Math.sin(gc))},${n(ey + 22 + 30 * Math.max(0, cc) * sb)}) scale(${n3(.3 + .7 * Math.max(0, cc))},1)`;
      op['boch' + k] = n3(passoS(.05, .4, cc) * .55 * (1 + q.feliz * .5));
      // orelha: plano 3D preso no alto da cabeça, caído para a frente
      const base = esc3(unit(soma(soma(esc3(Lat, .56 * s), esc3(Up, .74)), esc3(F, .22))), RC * .9);
      const ele = (q.orelhas + (s > 0 ? q.oE : q.oD)) * RAD;
      const e1 = unit(soma(soma(esc3(Up, .1 + Math.sin(ele) * 1.1), esc3(Lat, s * (.62 + .15 * Math.sin(ele)))), esc3(F, .6 - Math.sin(ele) * .3)));
      const nn = unit(soma(soma(esc3(F, .45), esc3(Up, .75)), esc3(Lat, -.25 * s)));
      const e2 = unit(vet(nn, e1));
      let u1 = [e1[0], e1[1]], u2 = [e2[0] * s, e2[1] * s];
      let lu = Math.hypot(u1[0], u1[1]) || 1e-3;
      if (lu < .55) {                        // orelha virada para nós: encurta, mas cai para fora e para baixo (nunca um «corno»)
        const w = lu / .55, fx = s * ca * .9 + sa * .6;
        const dx = lerp(fx, u1[0] / lu, w), dy = lerp(.55, u1[1] / lu, w), l = Math.hypot(dx, dy) || 1;
        u1 = [dx / l * .55, dy / l * .55]; lu = .55;
      }
      const pr = [-u1[1] / lu, u1[0] / lu], wv = u2[0] * pr[0] + u2[1] * pr[1];
      if (Math.abs(wv) < .78) { const ww = (wv < 0 ? -1 : 1) * .78 - wv; u2 = [u2[0] + pr[0] * ww, u2[1] + pr[1] * ww]; }
      t['orelha' + k] = `matrix(${n3(u1[0] * 1.22)},${n3(u1[1] * 1.22)},${n3(u2[0] * 1.22)},${n3(u2[1] * 1.22)},${n(base[0])},${n(base[1])})`;
      el['frente' + k] = base[2];
      el['dentro' + k] = nn[2] + .05;
    }
    // pálpebras: c = fecho, h = olhos contentes (arco «∩»)
    const c = limita(q.fecho, 0, 1), h = limita(q.feliz, 0, 1);
    const ye = lerp(lerp(-11, 11, c), 7, h), cy = lerp(lerp(-28, 19, c), -12, h);
    d.palpS = `M-18,-24 L18,-24 L18,${n(ye)} Q0,${n(cy)} -18,${n(ye)} Z`;
    const yl = lerp(19, 8, h), cyl = lerp(24, -9, h);
    d.palpI = `M-18,24 L18,24 L18,${n(yl)} Q0,${n(cyl)} -18,${n(yl)} Z`;
    const Q = (u, p0, p1, p2) => (1 - u) * (1 - u) * p0 + 2 * u * (1 - u) * p1 + u * u * p2;
    let cil = `M-14.5,${n(Q(.1, ye, cy, ye))} Q0,${n(Q(.5, ye, cy, ye) * 2 - (Q(.1, ye, cy, ye) + Q(.9, ye, cy, ye)) / 2)} 14.5,${n(Q(.9, ye, cy, ye))}`;
    for (const u of [.15, .5, .85]) {
      const x = lerp(-18, 18, u), y = Q(u, ye, cy, ye), vx = x * .6, vy = y - 2;
      const L = Math.hypot(vx, vy) || 1, ux = vx / L, uy = vy / L, comp = 8 * (1 - c * .25);
      cil += ` M${n(x)},${n(y)} q${n(ux * comp * .5 - uy * 2)},${n(uy * comp * .5 + ux * 2)} ${n(ux * comp)},${n(uy * comp)}`;
    }
    d.cil = cil;
    t.iris = `translate(${n(q.olharX * 4.5 + Y * 2)},${n(q.olharY * 4)})`;
    // papada (liga a cabeça ao corpo), cabelo e manchas de lama na cabeça
    t.papada = `translate(${n(-Y * 16)},${n(26 + 6 * sb)}) scale(${n3(1 - .15 * Math.abs(Y))},1)`;
    t.cabelo = `translate(${n(-Y * 6 + 8 * sa * sb)},${n(-RC + 2 + 10 * sb)}) rotate(${n(q.cabelo)})`;
    [[-50, -26, 13], [30, 4, 10], [62, -18, 9]].forEach(([g, y, r], i) => {
      const gg = al + g * RAD, cg = Math.cos(gg);
      t['mc' + i] = `translate(${n(RC * .9 * Math.sin(gg))},${n(y + 20 * Math.max(0, cg) * sb)}) scale(${n3(r * (.25 + .75 * Math.max(0, cg)))},${r})`;
      op['mc' + i] = cg;
    });
    return { t, d, op, a, el };
  }

  function orelhaSVG(p, k) {
    return `<g class="pc-orelha${k}"><g class="pc-orelha${k}-fora">
        <path d="${ORELHA}" fill="url(#${p}orelhaFora)" stroke="${COR.cont}" stroke-width="2.8" stroke-linejoin="round"/>
        <path d="M6,-8 C18,-11 30,-7 38,0 M6,4 C16,6 28,6 36,4" stroke="#D68494" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round"/>
        <path d="M6,-15 C18,-18 30,-14 40,-5" stroke="#FFE4E9" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>
      </g><g class="pc-orelha${k}-dentro" display="none">
        <path d="${ORELHA}" fill="url(#${p}orelhaFora)" stroke="${COR.cont}" stroke-width="2.8" stroke-linejoin="round"/>
        <path d="${ORELHA_IN}" fill="url(#${p}orelhaIn)"/>
        <path d="M8,-6 C18,-8 28,-5 35,0 M8,3 C17,5 26,5 33,3" stroke="#C8607A" stroke-width="1.4" fill="none" opacity=".55" stroke-linecap="round"/>
      </g></g>`;
  }

  function cabecaSVG(p, E) {
    const T = k => E.t[k] ? ` transform="${E.t[k]}"` : '';
    const O = k => E.op[k] != null ? ` opacity="${E.op[k]}"` : '';
    const fe = E.a.focE;
    const olho = k => `<g class="pc-olho${k}"${T('olho' + k)}${O('olho' + k)}>
        <ellipse rx="18" ry="20.5" fill="#D9808F" opacity=".25"/>
        <g clip-path="url(#${p}clipOlho)">
          <ellipse rx="13.5" ry="16" fill="#FFFDF8"/>
          <g class="pc-iris${k}"${T('iris')}><circle cy="1" r="10.5" fill="url(#${p}iris)"/><circle cy="1" r="10.5" fill="none" stroke="#1A0E08" stroke-width="1.5"/>
            <circle cy="1" r="5.6" fill="#120A06"/><circle cx="-3.8" cy="-3.8" r="4.4" fill="#FFFFFF"/><circle cx="4" cy="5" r="2" fill="#FFFFFF" opacity=".9"/></g>
          <path d="M-18,-20 L18,-20 L18,-8 Q0,-22 -18,-8 Z" fill="#7A2A3C" opacity=".14"/>
          <path class="pc-palpS${k}" d="${E.d.palpS}" fill="url(#${p}palp)"/>
          <path class="pc-palpI${k}" d="${E.d.palpI}" fill="url(#${p}palp)"/>
        </g>
        <ellipse rx="13.5" ry="16" fill="none" stroke="${COR.cont}" stroke-width="2.6"/>
        <path class="pc-cil${k}" d="${E.d.cil}" fill="none" stroke="#4A1E28" stroke-width="2.6" stroke-linecap="round"/>
      </g>`;
    const elipse = (cls, extra) => `<ellipse class="${cls}" rx="${n(fe.rx)}" ry="${n(fe.ry)}"${extra}/>`;
    return `<g class="pc-cab-in">
      <g class="pc-orelhasTras">${orelhaSVG(p, 'E')}${orelhaSVG(p, 'D')}</g>
      <g class="pc-papadaC"${T('papada')}><ellipse rx="46" ry="31" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="6"/></g>
      <ellipse rx="${RC + 3}" ry="${RC + 1}" fill="${COR.cont}"/>
      <path class="pc-focLC" d="${E.d.focL}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="6" stroke-linejoin="round"/>
      <g class="pc-focBC"${T('focB')}>${elipse('pc-focBCe', ` fill="${COR.cont}" stroke="${COR.cont}" stroke-width="6"`)}</g>
      <g class="pc-focFC"${T('focF')}>${elipse('pc-focFCe', ` fill="${COR.cont}" stroke="${COR.cont}" stroke-width="6"`)}</g>
      <g class="pc-papada"${T('papada')}><ellipse rx="46" ry="31" fill="url(#${p}papada)"/><path d="M-30,14 C-14,24 14,24 30,14 M-22,22 C-8,28 8,28 22,22" stroke="#C86E80" stroke-width="1.8" fill="none" opacity=".5" stroke-linecap="round"/></g>
      <ellipse rx="${RC}" ry="${RC - 2}" fill="url(#${p}cab)"/>
      <g clip-path="url(#${p}clipCab)">
        <path d="M-40,-30 C-28,-48 -6,-56 16,-52" stroke="#FFF2F4" stroke-width="8" fill="none" opacity=".45" stroke-linecap="round"/>
        <g class="pc-rugas"><path d="M-12,-40 C-6,-43 6,-43 12,-40 M-8,-33 C-3,-35 3,-35 8,-33" stroke="#D9808F" stroke-width="1.8" fill="none" opacity=".55" stroke-linecap="round"/></g>
        ${[0, 1, 2].map(i => `<ellipse class="pc-mc${i}" rx="1" ry="1" fill="${COR.lamaM}" opacity="0"/>`).join('')}
        <ellipse class="pc-cabMolh" rx="${RC}" ry="${RC - 2}" fill="#6A4028" opacity="0"/>
      </g>
      <ellipse class="pc-bochE"${T('bochE')}${O('bochE')} rx="11" ry="7" fill="#F27C92"/><ellipse class="pc-bochD"${T('bochD')}${O('bochD')} rx="11" ry="7" fill="#F27C92"/>
      ${olho('E')}${olho('D')}
      <path class="pc-sobrE"${T('sobrE')}${O('sobrE')} d="M-8,2 C-4,-3 4,-3 8,1" stroke="#C86E80" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <path class="pc-sobrD"${T('sobrD')}${O('sobrD')} d="M-8,1 C-4,-3 4,-3 8,2" stroke="#C86E80" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <ellipse class="pc-bocaInt"${T('bocaInt')} rx="${E.a.bocaRx}" ry="${E.a.bocaRy}" fill="#7C2A3A"/>
      <g class="pc-lingua"${T('lingua')}><ellipse cy="-1" rx="9" ry="5" fill="#F06A84"/></g>
      <g class="pc-queixo"${T('queixo')}><ellipse rx="15" ry="6.5" fill="#EE9AA8"/></g>
      <path class="pc-boca" d="${E.d.boca}" stroke="${COR.cont}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path class="pc-focL" d="${E.d.focL}" fill="url(#${p}focL)"/>
      <g class="pc-focB"${T('focB')}>${elipse('pc-focBe', ` fill="#E99AA8"`)}</g>
      <g class="pc-focF"${T('focF')}>${elipse('pc-focFe', ` fill="url(#${p}focD)" stroke="#D07586" stroke-width="1.6"`)}</g>
      <ellipse class="pc-focBrilho"${T('focBrilho')} rx="1" ry="1" fill="#FFFFFF" opacity=".5"/>
      <g class="pc-narinas"${O('narinas')}><ellipse class="pc-narinaE"${T('narinaE')} rx="1" ry="1" fill="#8A2E44"/><ellipse class="pc-narinaD"${T('narinaD')} rx="1" ry="1" fill="#8A2E44"/></g>
      <g class="pc-focTerra"${T('focF')}>${elipse('pc-focTe', ` fill="#6E4A2C" opacity="0"`)}</g>
      <g class="pc-cabelo"${T('cabelo')}><path d="M-4,2 C-7,-4 -11,-7 -15,-8 M-1,2 C-2,-6 -2,-11 -5,-15 M2,2 C3,-6 5,-11 3,-16 M5,2 C8,-4 12,-8 16,-9" stroke="#D9808F" stroke-width="2" fill="none" stroke-linecap="round"/></g>
      <g class="pc-orelhasFrente"></g>
    </g>`;
  }
  const CAB_EST0 = { Y: -.62, beta: 6, oE: 0, oD: 0, orelhas: 0, fecho: 0, feliz: 0, sobr: 0, boca: 0, mastX: 0, mastY: 0, olharX: 0, olharY: 0, sorriso: .6, olhoEsc: 1, cabelo: 0, focoS: 0, narinas: 0 };

  function porcoSVG(p) {
    const E = estadoCabeca(Object.assign({}, CAB_EST0));
    return `<g class="pc-porco">
      <ellipse class="pc-sombra" rx="1" ry="1" fill="url(#${p}sombra)"/>
      ${PERNAS.map(pe => `<ellipse class="pc-sp-${pe.id}" rx="16" ry="5" fill="url(#${p}sombra)"/>`).join('')}
      <g class="pc-slotCaudaT"><g class="pc-caudaG">${caudaSVG()}</g></g>
      <g class="pc-contornos"><g class="pc-pernasC">${PERNAS.map(pernaContSVG).join('')}</g>${troncoContSVG()}</g>
      <g class="pc-pernasTras">${PERNAS.map(pe => pernaEnchSVG(p, pe)).join('')}</g>
      ${troncoEnchSVG(p)}
      <g class="pc-pernasFrente"></g>
      <g class="pc-slotCaudaF"></g>
      <g class="pc-cab">${cabecaSVG(p, E)}</g>
    </g>`;
  }

  /* ================= 4) Cenário: pátio da quinta ao meio-dia ================= */
  const SOL = { x: 262, y: 104 };
  const GAM = { x: 414, y: 772 };       // gamela (centro da borda da frente)
  const POSTE = { x: 806, y: 736 };     // poste de coçar (base)
  function defsCena(p) {
    return `
    <linearGradient id="${p}ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4C9DE6"/><stop offset=".45" stop-color="#86C0EE"/><stop offset=".8" stop-color="#C9E4F4"/><stop offset="1" stop-color="#E8F3F2"/></linearGradient>
    <radialGradient id="${p}solBrilho"><stop offset="0" stop-color="#FFFDF0" stop-opacity=".95"/><stop offset=".18" stop-color="#FFF6CC" stop-opacity=".5"/><stop offset=".55" stop-color="#FFF2C0" stop-opacity=".12"/><stop offset="1" stop-color="#FFF2C0" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}sol" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#FFFBE0"/><stop offset="1" stop-color="#FFF1B0"/></radialGradient>
    <linearGradient id="${p}monteLonge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8C2B6"/><stop offset="1" stop-color="#C2D2BE"/></linearGradient>
    <linearGradient id="${p}monte" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2CB82"/><stop offset=".6" stop-color="#D4B868"/><stop offset="1" stop-color="#C6A85A"/></linearGradient>
    <linearGradient id="${p}cal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#FBF8F2"/><stop offset="1" stop-color="#EDE6DA"/></linearGradient>
    <linearGradient id="${p}calV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A7A68" stop-opacity=".22"/><stop offset=".18" stop-color="#8A7A68" stop-opacity="0"/><stop offset=".85" stop-color="#8A7A68" stop-opacity="0"/><stop offset="1" stop-color="#8A7A68" stop-opacity=".18"/></linearGradient>
    <linearGradient id="${p}terra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8B886"/><stop offset=".5" stop-color="#CFAA74"/><stop offset="1" stop-color="#C29A62"/></linearGradient>
    <linearGradient id="${p}madeira" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C08E5E"/><stop offset=".5" stop-color="#A8784A"/><stop offset="1" stop-color="#8A5E38"/></linearGradient>
    <linearGradient id="${p}telha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9663C"/><stop offset=".7" stop-color="#B85A32"/><stop offset="1" stop-color="#9E4A28"/></linearGradient>
    <linearGradient id="${p}escuro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E1E14"/><stop offset="1" stop-color="#4A3220"/></linearGradient>
    <radialGradient id="${p}copa" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#8A9C48"/><stop offset=".6" stop-color="#5F7230"/><stop offset="1" stop-color="#435422"/></radialGradient>
    <radialGradient id="${p}miolo" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#8A5A26"/><stop offset=".6" stop-color="#5E3A16"/><stop offset="1" stop-color="#3E240C"/></radialGradient>
    <radialGradient id="${p}lamaG" cx=".42" cy=".4" r=".62"><stop offset="0" stop-color="#7E5636"/><stop offset=".7" stop-color="#6A462A"/><stop offset="1" stop-color="#583820"/></radialGradient>
    <radialGradient id="${p}halo" cx=".5" cy=".45" r=".55"><stop offset="0" stop-color="#6A4A2E"/><stop offset=".7" stop-color="#8A6640" stop-opacity=".7"/><stop offset="1" stop-color="#A88458" stop-opacity="0"/></radialGradient>
    <linearGradient id="${p}reflexo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8E6EE" stop-opacity=".55"/><stop offset="1" stop-color="#D8E6EE" stop-opacity="0"/></linearGradient>
    <radialGradient id="${p}gota" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#A27A52"/><stop offset=".55" stop-color="#6E4A2C"/><stop offset="1" stop-color="#4E321C"/></radialGradient>
    <radialGradient id="${p}poeira"><stop offset="0" stop-color="#CDA878" stop-opacity=".7"/><stop offset=".6" stop-color="#C8A270" stop-opacity=".32"/><stop offset="1" stop-color="#C8A270" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}sombraObj"><stop offset="0" stop-color="#4A3014" stop-opacity=".34"/><stop offset=".7" stop-color="#4A3014" stop-opacity=".14"/><stop offset="1" stop-color="#4A3014" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}luzSol" gradientUnits="userSpaceOnUse" cx="${SOL.x}" cy="${SOL.y}" r="1250"><stop offset="0" stop-color="#FFF6D6" stop-opacity=".2"/><stop offset=".5" stop-color="#FFF2D0" stop-opacity=".05"/><stop offset="1" stop-color="#FFF2D0" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}vinheta" cx=".48" cy=".46" r=".78"><stop offset=".64" stop-color="#3A2410" stop-opacity="0"/><stop offset="1" stop-color="#3A2410" stop-opacity=".24"/></radialGradient>
    <clipPath id="${p}clipLama"><rect class="pc-clipLama" x="0" y="770" width="1600" height="300"/></clipPath>`;
  }
  function nuvemSVG(i, k) {
    return `<g class="pc-nuvem${i}"><g transform="scale(${k})">
      <ellipse cx="0" cy="12" rx="96" ry="13" fill="#DCE8F2" opacity=".9"/>
      <ellipse cx="-46" cy="0" rx="34" ry="18" fill="#FFFFFF"/><ellipse cx="-6" cy="-12" rx="42" ry="24" fill="#FFFFFF"/><ellipse cx="40" cy="-2" rx="34" ry="17" fill="#FFFFFF"/><ellipse cx="74" cy="6" rx="22" ry="10" fill="#F6FAFD"/>
      <ellipse cx="0" cy="8" rx="92" ry="9" fill="#EEF4FA"/>
      <path d="M-84,12 C-40,19 30,19 92,10" stroke="#C6D8E8" stroke-width="3" fill="none" opacity=".8"/>
      <ellipse cx="-22" cy="-22" rx="22" ry="6" fill="#FFFFFF"/></g></g>`;
  }
  function ceuSVG(p) {
    return `<rect width="1600" height="640" fill="url(#${p}ceu)"/>
      <circle cx="${SOL.x}" cy="${SOL.y}" r="420" fill="url(#${p}solBrilho)"/>
      <circle cx="${SOL.x}" cy="${SOL.y}" r="44" fill="url(#${p}sol)"/>
      <g class="pc-nuvens">${nuvemSVG(0, .9)}${nuvemSVG(1, .62)}${nuvemSVG(2, .75)}${nuvemSVG(3, .5)}</g>
      <g class="pc-aves">${[0, 1, 2].map(i => `<path class="pc-ave${i}" d="M-8,0 Q-4,-5 0,0 Q4,-5 8,0" stroke="#4A4A58" stroke-width="2" fill="none" stroke-linecap="round"/>`).join('')}</g>`;
  }
  // sobreiro: tronco torcido, cortiça tirada em baixo (cor de tijolo) com o algarismo do ano pintado a branco
  // elipse como subcaminho (para juntar várias da mesma cor lisa num só path: menos elementos)
  const elipseD = (cx, cy, rx, ry) => `M${n(cx - rx)},${n(cy)} a${n(rx)},${n(ry)} 0 1 0 ${n(2 * rx)},0 a${n(rx)},${n(ry)} 0 1 0 ${n(-2 * rx)},0Z`;
  function sobreiroSVG(x, y, k, longe, num) {
    const rnd = semente(Math.round(x * 7 + y));
    if (longe) {
      let c = '';
      for (let i = 0; i < 6; i++) { const cx = (rnd() - .5) * 70, cy = -46 - rnd() * 22, rx = 20 + rnd() * 14, ry = 12 + rnd() * 8; c += elipseD(cx, cy, rx, ry); }
      return `<g transform="translate(${x},${y}) scale(${k})"><path d="M-4,0 L-3,-40 L-14,-52 M3,0 L4,-38 L16,-50" stroke="#6E6A52" stroke-width="5" fill="none"/><path fill="#7C8A5C" d="${c}"/></g>`;
    }
    let copa = '', copaD = '', luz = '';
    for (let i = 0; i < 9; i++) {
      const cx = (rnd() - .5) * 150, cy = -118 - rnd() * 52 + Math.abs(cx) * .25, rx = 30 + rnd() * 18, ry = 20 + rnd() * 10;
      copa += `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}"/>`; copaD += elipseD(cx, cy, rx, ry);
      if (i % 2 === 0) luz += elipseD(cx - rx * .3, cy - ry * .35, rx * .45, ry * .3);
    }
    return `<g transform="translate(${x},${y}) scale(${k})">

      <path d="M-14,0 C-12,-30 -18,-56 -36,-84 M-10,-50 C6,-70 30,-86 54,-98 M12,0 C10,-34 16,-60 6,-96 M-30,-76 C-50,-90 -66,-98 -84,-104" stroke="#5A3E2A" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M-18,0 C-17,-12 -16,-24 -14,-34 L12,-34 C13,-22 13,-10 14,0 Z" fill="#B4532A" stroke="#6E321A" stroke-width="2"/>
      <path d="M-14,-34 C-6,-37 4,-37 12,-34" stroke="#7A5A42" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${num ? `<path d="M-6,-24 L4,-24 L-2,-10" stroke="#FFFFFF" stroke-width="2.4" fill="none" opacity=".85"/>` : ''}
      <path fill="#3E4E1E" transform="translate(0,6)" d="${copaD}"/><g fill="url(#${p0}copa)">${copa}</g><path fill="#A6B860" opacity=".55" d="${luz}"/>
    </g>`;
  }
  const p0 = 'porco-';
  function colinasSVG(p) {
    let casas = '';
    [[1176, 506, 18, 12], [1196, 502, 14, 14], [1214, 507, 20, 11], [1236, 503, 16, 13], [1256, 508, 18, 10], [1150, 510, 14, 9]].forEach(([x, y, w, h]) => {
      casas += `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="#FBFAF6"/><path d="M${x - 1},${y - h} L${x + w / 2},${y - h - 6} L${x + w + 1},${y - h} Z" fill="#C8744A"/><rect x="${x + w * .4}" y="${y - h * .55}" width="3" height="4" fill="#5A6A8A"/>`;
    });
    casas += `<rect x="1226" y="474" width="9" height="30" fill="#FFFFFF"/><path d="M1224,474 L1230.5,464 L1237,474 Z" fill="#C8744A"/><rect x="1228.5" y="479" width="4" height="5" fill="#4A5A7A"/>`;
    return `<path d="M0,520 C120,498 240,506 380,494 C520,482 640,500 780,492 C940,484 1080,476 1220,488 C1360,500 1480,486 1600,492 L1600,640 L0,640 Z" fill="url(#${p}monteLonge)"/>
      <path d="M0,520 C120,498 240,506 380,494 C520,482 640,500 780,492" stroke="#D6E2D6" stroke-width="3" fill="none" opacity=".6"/>
      <g>${casas}</g>
      ${sobreiroSVG(330, 520, .5, true)}${sobreiroSVG(660, 512, .42, true)}${sobreiroSVG(930, 506, .46, true)}${sobreiroSVG(1420, 506, .4, true)}
      <path d="M0,560 C140,540 300,552 460,540 C620,528 760,548 920,540 C1080,532 1240,548 1400,536 C1500,530 1560,534 1600,532 L1600,660 L0,660 Z" fill="url(#${p}monte)"/>
      <path d="M0,560 C140,540 300,552 460,540 C620,528 760,548 920,540 C1080,532 1240,548 1400,536" stroke="#F0DE9E" stroke-width="3" fill="none" opacity=".7"/>
      <path d="M40,600 C200,590 380,594 560,586 M700,590 C860,582 1020,590 1200,580 M100,620 C300,612 500,616 700,608" stroke="#C09A50" stroke-width="2" fill="none" opacity=".45"/>
      ${sobreiroSVG(150, 600, .62, false, true)}${sobreiroSVG(1500, 584, .7, false, false)}${sobreiroSVG(780, 572, .36, false, false)}`;
  }
  // girassol: haste, folhas, pétalas em duas coroas e o miolo com sementes
  function girassolSVG(i, x, yb, alt, r, vira) {
    const rnd = semente(300 + i);
    const hx = (rnd() - .5) * 14, hy = -alt;
    let pa = '', pb = '';
    for (let k = 0; k < 18; k++) {
      const a = k / 18 * TAU, a2 = a + PI / 18, L = r * (1.55 + rnd() * .2), w = r * .2;
      const pet = (ang, LL, ww) => { const c = Math.cos(ang), s = Math.sin(ang), x0 = c * r * .8, y0 = s * r * .8, x1 = c * LL, y1 = s * LL, px = -s * ww, py = c * ww;
        return `M${n(x0 + px)},${n(y0 + py)} Q${n((x0 + x1) / 2 + px * 1.3)},${n((y0 + y1) / 2 + py * 1.3)} ${n(x1)},${n(y1)} Q${n((x0 + x1) / 2 - px * 1.3)},${n((y0 + y1) / 2 - py * 1.3)} ${n(x0 - px)},${n(y0 - py)} Z`; };
      pa += pet(a2, L * .92, w * 1.1); pb += pet(a, L, w);
    }
    const folha = (y, s) => `M${n(hx * (y / hy))},${n(y)} C${n(s * 18)},${n(y - 22)} ${n(s * 46)},${n(y - 14)} ${n(s * 52)},${n(y + 6)} C${n(s * 34)},${n(y + 10)} ${n(s * 14)},${n(y + 6)} ${n(hx * (y / hy))},${n(y)} Z`;
    let sem = '';
    for (let k = 0; k < 3; k++) sem += `<circle r="${n(r * (.25 + k * .2))}" fill="none" stroke="#2E1A08" stroke-width="2" stroke-dasharray="2 3" opacity=".55"/>`;
    return `<g class="pc-gir${i}" transform="translate(${x},${yb})"><g class="pc-girIn">
      <path d="M0,0 Q${n(hx * .2)},${n(hy * .5)} ${n(hx)},${n(hy)}" stroke="#4E7A2C" stroke-width="${n(r * .22)}" fill="none" stroke-linecap="round"/>
      <path d="M1,0 Q${n(hx * .2 + 1)},${n(hy * .5)} ${n(hx + 1)},${n(hy)}" stroke="#86B04C" stroke-width="${n(r * .07)}" fill="none" opacity=".7"/>
      <path d="${folha(hy * .45, -1)} ${folha(hy * .66, 1)}" fill="#5E8E34" stroke="#3A5E1E" stroke-width="1.5"/>
      <path d="M${n(hx * .45 - 6)},${n(hy * .45 - 4)} L${n(-40)},${n(hy * .45 - 6)} M${n(hx * .66 + 6)},${n(hy * .66 - 4)} L40,${n(hy * .66 - 4)}" stroke="#9CC468" stroke-width="1.4" opacity=".6"/>
      <g class="pc-girCab" transform="translate(${n(hx)},${n(hy)}) scale(${vira},1)">
        <path d="${pa}" fill="#E8A21C" stroke="#B4740E" stroke-width="1.2"/>
        <path d="${pb}" fill="#FFCC2E" stroke="#C88A12" stroke-width="1.2"/>
        <circle r="${n(r)}" fill="url(#${p0}miolo)" stroke="#3E240C" stroke-width="2"/>${sem}
        <ellipse cx="${n(-r * .3)}" cy="${n(-r * .35)}" rx="${n(r * .35)}" ry="${n(r * .18)}" fill="#C08A4A" opacity=".45"/></g>
    </g></g>`;
  }
  const GIRASSOIS = [[40, 690, 190, 30, .9], [118, 690, 228, 34, .86], [205, 690, 176, 28, .92], [292, 690, 214, 32, .88], [382, 690, 186, 27, .9],
    [818, 690, 196, 29, .88], [902, 690, 222, 33, .9], [968, 690, 180, 26, .86]];
  function muroSVG(p) {
    const rnd = semente(21);
    let pedras = '';
    for (let i = 0; i < 16; i++) {
      const x = 30 + rnd() * 930, y = 612 + rnd() * 50, rx = 9 + rnd() * 14, ry = 6 + rnd() * 6;
      pedras += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rx)}" ry="${n(ry)}" fill="#C9C0B0" stroke="#9A8E7C" stroke-width="1.4" opacity=".75"/><path d="M${n(x - rx * .6)},${n(y - ry * .3)} q${n(rx * .5)},${n(-ry * .5)} ${n(rx)},0" stroke="#F2EEE6" stroke-width="1.6" fill="none" opacity=".7"/>`;
    }
    let fendas = '';
    for (let i = 0; i < 7; i++) { const x = 60 + rnd() * 880, y = 610 + rnd() * 40; fendas += `M${n(x)},${n(y)} l${n(rnd() * 8 - 4)},${n(8 + rnd() * 8)} l${n(rnd() * 8 - 4)},${n(6 + rnd() * 6)} `; }
    return `<g>
      <rect x="-10" y="598" width="1006" height="94" fill="url(#${p}cal)"/>
      <rect x="-10" y="598" width="1006" height="94" fill="url(#${p}calV)"/>
      ${pedras}
      <path d="${fendas}" stroke="#A8998A" stroke-width="1.3" fill="none" opacity=".7"/>
      <path d="M-10,598 L996,598 L996,612 L-10,612 Z" fill="#8A7A68" opacity=".18"/>
      <path d="M-14,586 C200,582 600,584 1000,584 L1000,600 L-14,600 Z" fill="#E6DCCB" stroke="#9A8A74" stroke-width="2"/>
      <path d="M-14,587 C200,583 600,585 1000,585" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".8"/>
      <rect x="-10" y="668" width="1006" height="24" fill="#2F6CB4"/><rect x="-10" y="668" width="1006" height="3" fill="#1E4C8A"/>
      <path d="M40,674 l14,0 M300,680 l20,0 M620,676 l12,0 M860,682 l18,0" stroke="#5A8ED0" stroke-width="2" opacity=".6"/>
      <rect x="988" y="584" width="12" height="108" fill="#D8CEBE"/>
      <path d="M-10,692 L1000,692" stroke="#5E4A34" stroke-width="2" opacity=".5"/>
      <path d="M0,692 C200,698 500,696 1000,698 L1000,704 L0,704 Z" fill="#4A3014" opacity=".14"/>
    </g>`;
  }
  // pocilga de madeira com telhado de telha (canudo), porta com palha e cata-vento
  function pocilgaSVG(p) {
    const x0 = 1000, x1 = 1446, yTop = 560, yB = 712, rnd = semente(33);
    let tabuas = '', veios = '';
    for (let x = x0, i = 0; x < x1; x += 28, i++) {
      const cor = ['#B3835A', '#A0734C', '#BB8D62', '#A87A50'][i % 4];
      tabuas += `<rect x="${x}" y="${yTop}" width="28" height="${yB - yTop}" fill="${cor}"/>`;
      veios += `M${x + 6 + rnd() * 6},${yTop + 6} q${n(rnd() * 4 - 2)},${n(40 + rnd() * 20)} ${n(rnd() * 4 - 2)},${n(120)} M${x + 16 + rnd() * 6},${yTop + 20} q${n(rnd() * 4 - 2)},30 0,${n(60 + rnd() * 40)} `;
    }
    let telhas = '', luzT = '';
    const nc = 18;
    for (let k = 0; k <= nc; k++) {
      const xb = 978 + k * (490 / nc), xt = 1016 + k * (414 / nc);
      telhas += `M${n(xt - 9)},476 L${n(xb - 12)},570 Q${n(xb)},${578} ${n(xb + 12)},570 L${n(xt + 9)},476 Z `;
      luzT += `M${n(xt - 3)},480 L${n(xb - 5)},566 `;
    }
    return `<g>
      <ellipse cx="1220" cy="716" rx="270" ry="14" fill="url(#${p}sombraObj)"/>
      ${tabuas}
      <path d="${veios}" stroke="#7A5232" stroke-width="1.2" fill="none" opacity=".5"/>
      <path d="M${x0},${yTop + 4} L${x1},${yTop + 4}" stroke="#4A3018" stroke-width="10" opacity=".25"/>
      <rect x="${x0}" y="618" width="${x1 - x0}" height="12" fill="#8A5E38" stroke="#5A3A20" stroke-width="1.5"/>
      <rect x="${x0 - 8}" y="${yTop}" width="18" height="${yB - yTop + 2}" fill="url(#${p}madeira)" stroke="#5A3A20" stroke-width="2"/>
      <rect x="${x1 - 10}" y="${yTop}" width="18" height="${yB - yTop + 2}" fill="url(#${p}madeira)" stroke="#5A3A20" stroke-width="2"/>
      ${[1040, 1100, 1160, 1380, 1420].map(x => `<circle cx="${x}" cy="624" r="2" fill="#3A2A1E"/>`).join('')}
      <rect x="1238" y="592" width="118" height="120" fill="url(#${p}escuro)"/>
      <path d="M1238,712 C1250,690 1270,684 1290,692 C1310,680 1336,684 1356,700 L1356,712 Z" fill="#D8B44E"/>
      <path d="M1246,708 l10,-14 M1262,706 l4,-16 M1280,708 l-6,-14 M1300,704 l8,-14 M1320,708 l-4,-16 M1338,706 l6,-12" stroke="#F4D878" stroke-width="2" stroke-linecap="round"/>
      <rect x="1232" y="586" width="130" height="10" fill="#8A5E38" stroke="#5A3A20" stroke-width="1.5"/>
      <path d="M1356,600 L1408,612 L1408,714 L1356,712 Z" fill="#B8885C" stroke="#5A3A20" stroke-width="2"/>
      <path d="M1370,604 L1370,712 M1386,607 L1386,713 M1358,640 L1406,650 M1358,688 L1406,694" stroke="#7A5232" stroke-width="2" opacity=".7"/>
      <path d="${telhas}" fill="url(#${p}telha)" stroke="#7A3A1C" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="${luzT}" stroke="#E8946A" stroke-width="2.4" opacity=".55" stroke-linecap="round"/>
      <path d="M1000,500 L1440,500 M990,526 L1452,526 M984,550 L1460,550" stroke="#7A3A1C" stroke-width="1.6" opacity=".55"/>
      <path d="M1008,474 L1424,474" stroke="#A54A26" stroke-width="12" stroke-linecap="round"/><path d="M1012,470 L1420,470" stroke="#D87A4E" stroke-width="3" opacity=".7" stroke-linecap="round"/>
      <ellipse cx="1100" cy="540" rx="26" ry="8" fill="#7E8A3A" opacity=".55"/><ellipse cx="1330" cy="514" rx="20" ry="6" fill="#7E8A3A" opacity=".5"/>
      <g transform="translate(1406,712)"><path d="M-18,0 L-15,-36 L15,-36 L18,0 Z" fill="#AEB4BA" stroke="#5E646A" stroke-width="2"/><path d="M-16,-28 L16,-28 M-17,-12 L17,-12" stroke="#7E848A" stroke-width="2"/><ellipse cy="-36" rx="15" ry="4" fill="#5E646A"/><path d="M-12,-34 C-6,-56 6,-56 12,-34" stroke="#6E747A" stroke-width="2" fill="none"/><path d="M-12,-30 L-11,-4" stroke="#E6EAEE" stroke-width="3" opacity=".6"/></g>
      <g transform="translate(1110,470)"><path d="M0,0 L0,-62" stroke="#3E3A36" stroke-width="3"/><circle cy="-62" r="4" fill="#C8A040"/>
        <path d="M-12,-40 L12,-40 M0,-46 L0,-34" stroke="#3E3A36" stroke-width="1.6"/>
        <g class="pc-cata" transform="translate(0,-70)"><g class="pc-cataIn">
          <path d="M-34,0 L26,0" stroke="#2E2A26" stroke-width="2.6"/><path d="M26,-6 L38,0 L26,6 Z" fill="#2E2A26"/><path d="M-34,0 L-42,-8 L-30,-1 M-34,0 L-42,8 L-30,1" stroke="#2E2A26" stroke-width="2.2" fill="none"/>
          <path d="M-14,-4 C-14,-14 -2,-18 8,-16 C14,-15 18,-12 20,-8 L24,-9 L22,-5 C22,-2 20,0 18,-1 L-12,-1 C-15,-1 -16,-3 -14,-4 Z" fill="#2E2A26"/>
          <path d="M-6,-1 L-6,4 M12,-1 L12,4 M-14,-8 c-4,-2 -5,2 -2,3" stroke="#2E2A26" stroke-width="2" fill="none"/></g></g></g>
    </g>`;
  }
  // cerca de madeira até ao poste de coçar (o último poste, mais grosso e polido onde o porco se coça)
  function cercaSVG(p) {
    const postes = [[34, 704], [190, 710], [346, 716], [502, 722], [658, 728]];
    const ate = POSTE;
    const travessa = (dy, w) => `M-10,${704 - dy} L${ate.x},${ate.y - dy}`;
    let s = `<path d="${travessa(66)} ${travessa(30)}" stroke="#6E4A2A" stroke-width="14" stroke-linecap="round"/>
      <path d="${travessa(66)} ${travessa(30)}" stroke="#B4865A" stroke-width="10" stroke-linecap="round"/>
      <path d="M-10,${704 - 69} L${ate.x},${ate.y - 69} M-10,${704 - 33} L${ate.x},${ate.y - 33}" stroke="#DDB688" stroke-width="2.5" opacity=".7"/>`;
    for (const [x, y] of postes) {
      s += `<ellipse cx="${x + 6}" cy="${y + 2}" rx="20" ry="5" fill="url(#${p}sombraObj)"/>
        <path d="M${x - 8},${y} L${x - 7},${y - 92} L${x},${y - 98} L${x + 7},${y - 92} L${x + 8},${y} Z" fill="url(#${p}madeira)" stroke="#5A3A20" stroke-width="2"/>
        <path d="M${x - 3},${y - 86} L${x - 3},${y - 6}" stroke="#E2BC8E" stroke-width="2" opacity=".6"/><circle cx="${x}" cy="${y - 66}" r="1.8" fill="#3A2A1E"/><circle cx="${x}" cy="${y - 30}" r="1.8" fill="#3A2A1E"/>`;
    }
    const { x, y } = ate;
    s += `<ellipse cx="${x + 10}" cy="${y + 3}" rx="30" ry="7" fill="url(#${p}sombraObj)"/>
      <g class="pc-poste"><path d="M${x - 14},${y} C${x - 15},${y - 60} ${x - 13},${y - 120} ${x - 12},${y - 148} L${x},${y - 156} L${x + 12},${y - 148} C${x + 13},${y - 120} ${x + 15},${y - 60} ${x + 14},${y} Z" fill="url(#${p}madeira)" stroke="#5A3A20" stroke-width="2.4"/>
      <path d="M${x - 6},${y - 140} C${x - 7},${y - 100} ${x - 7},${y - 50} ${x - 6},${y - 8} M${x + 5},${y - 130} C${x + 6},${y - 90} ${x + 5},${y - 50} ${x + 6},${y - 14}" stroke="#7A5232" stroke-width="1.4" fill="none" opacity=".6"/>
      <ellipse cx="${x - 2}" cy="${y - 52}" rx="9" ry="26" fill="#E2BC8E" opacity=".55"/></g>
      <path d="M${x - 9},${y - 12} q-6,-14 -12,-18 M${x - 4},${y - 4} q-2,-16 -6,-22 M${x + 10},${y - 6} q6,-12 12,-16" stroke="#7E9A3A" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    return `<g class="pc-cerca">${s}</g>`;
  }
  const TUFOS = [[60, 706, .8], [250, 714, .7], [430, 720, .6], [590, 728, .7], [930, 700, .6], [1470, 716, .9], [1560, 720, .8]];
  function chaoSVG(p) {
    const rnd = semente(13);
    let s = `<path d="M0,690 C300,694 700,692 1000,696 L1600,700 L1600,900 L0,900 Z" fill="url(#${p}terra)"/>`;
    for (let i = 0; i < 12; i++) { const x = rnd() * 1600, y = 740 + rnd() * 150; s += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(70 + rnd() * 110)}" ry="${n(10 + rnd() * 12)}" fill="${rnd() < .5 ? '#C59C66' : '#DEC296'}" opacity=".45"/>`; }
    // palha espalhada (juntar por cor: menos elementos)
    const palha = { '#E8CC70': '', '#C9A448': '', '#F4E2A0': '' };
    for (let i = 0; i < 150; i++) {
      const x = rnd() * 1600, y = 700 + Math.pow(rnd(), .9) * 200, a = rnd() * PI, L = 8 + rnd() * 14 * (.6 + (y - 700) / 200);
      if (Math.hypot((x - LAMA.cx) / (LAMA.rx + 40), (y - LAMA.cy) / (LAMA.ry + 20)) < 1) continue;
      const k = escolhe(Object.keys(palha));
      palha[k] += `M${n(x)},${n(y)} l${n(Math.cos(a) * L)},${n(Math.sin(a) * L * .35)} `;
    }
    for (const k in palha) s += `<path d="${palha[k]}" stroke="${k}" stroke-width="2" stroke-linecap="round" opacity=".85"/>`;
    // pedrinhas
    for (let i = 0; i < 16; i++) {
      const x = rnd() * 1600, y = 712 + rnd() * 180;
      if (Math.hypot((x - LAMA.cx) / (LAMA.rx + 30), (y - LAMA.cy) / (LAMA.ry + 16)) < 1) continue;
      s += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(3 + rnd() * 4)}" ry="${n(2 + rnd() * 1.6)}" fill="#A08870"/><ellipse cx="${n(x - 1)}" cy="${n(y - 1)}" rx="${n(1.5 + rnd() * 1.5)}" ry=".9" fill="#F0E2CA" opacity=".8"/>`;
    }
    // ervas junto ao muro e à cerca
    let e1 = '', e2 = '';
    for (let i = 0; i < 90; i++) {
      const x = rnd() * 1600, y = 694 + rnd() * 18, h = 6 + rnd() * 12, inc = (rnd() - .5) * 8;
      const seg = `M${n(x)},${n(y)} q${n(inc * .4)},${n(-h * .6)} ${n(inc)},${n(-h)} `;
      if (rnd() < .5) e1 += seg; else e2 += seg;
    }
    s += `<path d="${e1}" stroke="#7E9A3A" stroke-width="2" fill="none" stroke-linecap="round"/><path d="${e2}" stroke="#A8B84E" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    s += TUFOS.map(([x, y, k], i) => `<g class="pc-tufo${i}" transform="translate(${x},${y})"><g class="pc-tufoIn"><path d="M-8,0 q-4,-${n(16 * k)} -10,-${n(24 * k)} M-3,0 q-1,-${n(20 * k)} -4,-${n(30 * k)} M2,0 q2,-${n(18 * k)} 6,-${n(28 * k)} M7,0 q5,-${n(12 * k)} 12,-${n(18 * k)}" stroke="#6E8E30" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      ${i % 2 ? '' : `<g transform="translate(-4,-${n(30 * k)})"><circle r="4" fill="#FFFFFF" stroke="#D8D0C0" stroke-width=".8"/><circle r="1.8" fill="#F2C230"/></g>`}</g></g>`).join('');
    // um trilho de pegadas de porco até à lama
    for (const [x, y] of [[742, 756], [776, 764], [812, 754], [846, 774], [1262, 758], [1284, 776], [1252, 790]]) s += `<path d="M${x - 4},${y} q-3,-5 0,-8 q2,3 1,8 Z M${x + 1},${y} q3,-5 0,-8 q-2,3 -1,8 Z" fill="#8A6A44" opacity=".6"/>`;
    return s;
  }
  // gamela de madeira (em frente ao porco) com milho e bocados de maçã
  function gamelaSVG(p) {
    const { x, y } = GAM;
    return `<g class="pc-gamela">
      <ellipse cx="${x + 12}" cy="${y + 12}" rx="110" ry="14" fill="url(#${p}sombraObj)"/>
      <path d="M${x - 92},${y - 30} L${x + 92},${y - 30} L${x + 84},${y + 6} L${x - 84},${y + 6} Z" fill="#8A5E38" stroke="#4E321C" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M${x - 84},${y - 30} C${x - 40},${y - 42} ${x + 40},${y - 42} ${x + 84},${y - 30} C${x + 40},${y - 22} ${x - 40},${y - 22} ${x - 84},${y - 30} Z" fill="#3E2614"/>
      <g class="pc-racao"><path d="M${x - 74},${y - 31} C${x - 40},${y - 40} ${x + 40},${y - 40} ${x + 74},${y - 31} C${x + 40},${y - 26} ${x - 40},${y - 26} ${x - 74},${y - 31} Z" fill="#E2B846"/>
        ${[[-56, -33], [-40, -36], [-24, -32], [-8, -35], [8, -33], [24, -36], [40, -32], [56, -34], [-48, -30], [-16, -30], [16, -30], [48, -30]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="2.6" fill="#F6D45A" stroke="#B48A1E" stroke-width=".8"/>`).join('')}
        <path d="M${x - 30},${y - 36} l8,-2 l2,6 l-8,1 Z M${x + 30},${y - 34} l7,-3 l3,6 l-7,2 Z" fill="#E8F0C0" stroke="#C83A2A" stroke-width="1.6"/></g>
      <path d="M${x - 90},${y - 28} L${x - 84},${y + 4} L${x - 66},${y + 4} L${x - 70},${y - 28} Z M${x + 90},${y - 28} L${x + 84},${y + 4} L${x + 66},${y + 4} L${x + 70},${y - 28} Z" fill="#6E4628" opacity=".6"/>
      <path d="M${x - 86},${y - 18} L${x + 86},${y - 18}" stroke="#4E321C" stroke-width="1.4" opacity=".6"/>
      <path d="M${x - 80},${y - 26} L${x + 80},${y - 26}" stroke="#C49064" stroke-width="2.4" opacity=".7"/>
      <path d="M${x - 50},${y - 30} L${x - 48},${y + 6} M${x + 50},${y - 30} L${x + 48},${y + 6}" stroke="#5A5A5E" stroke-width="5"/><path d="M${x - 51},${y - 28} L${x - 49},${y + 4}" stroke="#A8A8AE" stroke-width="1.4"/>
      <path d="M${x - 88},${y + 6} L${x - 88},${y + 12} L${x - 68},${y + 12} L${x - 68},${y + 6} M${x + 88},${y + 6} L${x + 88},${y + 12} L${x + 68},${y + 12} L${x + 68},${y + 6}" fill="#6E4628" stroke="#4E321C" stroke-width="1.6"/>
    </g>`;
  }

  /* --- Poça de lama (habitat): margem molhada, lama com reflexos do céu; a lama repete-se por cima do porco,
         recortada abaixo da linha da lama (clipPath com um retângulo que segue o porco) --- */
  function lamaSVG(p, k) {
    const { cx, cy, rx, ry } = LAMA, rnd = semente(41);
    let brilhos = '', remoinhos = '';
    for (let i = 0; i < 12; i++) {
      const a = rnd() * TAU, r = Math.sqrt(rnd()) * .8, x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r, L = 8 + rnd() * 22;
      brilhos += `M${n(x - L / 2)},${n(y)} L${n(x + L / 2)},${n(y)} `;
    }
    for (let i = 0; i < 7; i++) {
      const a = rnd() * TAU, r = Math.sqrt(rnd()) * .7, x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r, L = 20 + rnd() * 30;
      remoinhos += `M${n(x - L / 2)},${n(y)} q${n(L / 2)},${n(-6 - rnd() * 4)} ${n(L)},0 `;
    }
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${p}lamaG)"/>
      <path d="M${cx - rx * .8},${cy - ry * .36} C${cx - rx * .45},${cy - ry * .84} ${cx + rx * .45},${cy - ry * .84} ${cx + rx * .8},${cy - ry * .36} C${cx + rx * .4},${cy - ry * .52} ${cx - rx * .4},${cy - ry * .52} ${cx - rx * .8},${cy - ry * .36} Z" fill="url(#${p}reflexo)" opacity=".5"/>
      <path d="${remoinhos}" stroke="#4A2E18" stroke-width="2" fill="none" opacity=".4" stroke-linecap="round"/>
      <path d="M${cx + 30},${cy - 32} C${cx + 80},${cy - 36} ${cx + 130},${cy - 28} ${cx + 160},${cy - 22}" stroke="#F4F0EA" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>
      <g class="pc-brilhos${k}"><path d="${brilhos}" stroke="#F2EAE0" stroke-width="2.2" stroke-linecap="round" opacity=".45"/></g>
      <path d="M${cx - 120},${cy + 10} l10,-3 M${cx + 90},${cy + 22} l12,2 M${cx - 30},${cy - 20} l9,3" stroke="#E2C066" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>`;
  }
  function lamaTrasSVG(p) {
    const { cx, cy, rx, ry } = LAMA, rnd = semente(88);
    let pedras = '';
    for (let i = 0; i < 8; i++) { const a = PI + .2 + i / 7 * (PI - .4), x = cx + Math.cos(a) * (rx + 22), y = cy + Math.sin(a) * (ry + 10) - 2, r = 4 + rnd() * 5; pedras += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(r * 1.4)}" ry="${n(r * .8)}" fill="#9A8670" stroke="#6A5844" stroke-width="1.3"/><ellipse cx="${n(x - r * .3)}" cy="${n(y - r * .3)}" rx="${n(r * .6)}" ry="${n(r * .25)}" fill="#E6D8C2" opacity=".6"/>`; }
    return `<g class="pc-lamaTras">
      <ellipse cx="${cx}" cy="${cy + 6}" rx="${rx + 66}" ry="${ry + 26}" fill="url(#${p}halo)"/>
      <ellipse cx="${cx}" cy="${cy + 3}" rx="${rx + 18}" ry="${ry + 8}" fill="#6A4A2E"/>
      <ellipse cx="${cx}" cy="${cy + 1}" rx="${rx + 6}" ry="${ry + 3}" fill="#523620"/>
      ${pedras}
      <path d="M${cx - 200},${cy - 50} q-3,-14 -7,-20 M${cx - 194},${cy - 50} q1,-14 5,-22 M${cx + 180},${cy - 54} q4,-14 9,-20 M${cx + 172},${cy - 54} q-1,-16 -4,-24" stroke="#7E9A38" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      ${lamaSVG(p, 't')}
    </g>`;
  }
  const NBOL = 6, NANEL = 6;
  function lamaFrenteSVG(p) {
    const { cx, cy, rx, ry } = LAMA;
    const arco = (e, k) => `M${n(cx - (rx + e))},${cy} A${n(rx + e)},${n(ry + e * k)} 0 0 0 ${n(cx + rx + e)},${cy}`;
    let torroes = '';
    const rnd = semente(66);
    for (let i = 0; i < 11; i++) { const a = .25 + i / 10 * (PI - .5), x = cx + Math.cos(a) * (rx + 6), y = cy + Math.sin(a) * (ry + 4), r = 6 + rnd() * 7; torroes += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(r * 1.5)}" ry="${n(r * .7)}" fill="#6E4C2E"/><ellipse cx="${n(x - r * .4)}" cy="${n(y - r * .3)}" rx="${n(r * .7)}" ry="${n(r * .22)}" fill="#A88458" opacity=".7"/>`; }
    return `<g class="pc-lamaFrente">
      <g clip-path="url(#${p}clipLama)">${lamaSVG(p, 'f')}</g>
      <path class="pc-anelCorpo" d="" stroke="#8E6A44" stroke-width="5" fill="none" stroke-linecap="round" opacity="0"/>
      <path class="pc-anelCorpoE" d="" stroke="#3E2414" stroke-width="2" fill="none" stroke-linecap="round" opacity="0"/>
      <g class="pc-aneis">${Array.from({ length: NANEL }, (_, i) => `<ellipse class="pc-anel${i}" rx="1" ry="1" fill="none" stroke="#9A7650" stroke-width="2" opacity="0"/>`).join('')}</g>
      <g class="pc-bolhas">${Array.from({ length: NBOL }, (_, i) => `<g class="pc-bolha${i}" opacity="0"><circle r="1" fill="#6E4A2C" stroke="#4A2E18" stroke-width=".12"/><circle cx="-.35" cy="-.4" r=".28" fill="#E8D2B4" opacity=".8"/></g>`).join('')}</g>
      <path d="${arco(0, .4)} L${cx + rx + 12},${cy} A${rx + 12},${ry + 7} 0 0 1 ${cx - rx - 12},${cy} Z" fill="#5A3C22"/>
      <path d="${arco(2, .4)}" stroke="#3A2414" stroke-width="2.5" fill="none" opacity=".5"/>
      ${torroes}
      <path d="${arco(14, .55)}" stroke="#B49068" stroke-width="3" fill="none" opacity=".5"/>
      ${[[860, 818], [990, 824], [1130, 818], [1210, 800]].map(([x, y]) => `<path d="M${x},${y} q-3,-14 -7,-20 M${x + 4},${y} q1,-14 5,-22 M${x + 8},${y} q4,-10 9,-14" stroke="#7E9A38" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join('')}
    </g>`;
  }
  // erva e flores do primeiro plano (abanam ao vento)
  function ervaFrenteSVG(i, x, y, k, flip) {
    const rnd = semente(200 + i);
    let d = '';
    for (let j = 0; j < 9; j++) {
      const a = (j - 4) * 9 + (rnd() - .5) * 8, h = (60 + rnd() * 50) * k, bx = (j - 4) * 4 * k;
      const ex = bx + Math.sin(a * RAD) * h, ey = -Math.cos(a * RAD) * h;
      d += `M${n(bx - 3 * k)},0 Q${n(bx + ex * .3)},${n(ey * .55)} ${n(ex)},${n(ey)} Q${n(bx + ex * .3 + 4 * k)},${n(ey * .5)} ${n(bx + 3 * k)},0 Z`;
    }
    const cor = ['#7E9E3A', '#93AE44', '#6E9032', '#A2B64C'][i % 4];
    const flor = i % 2 === 0 ? `<g transform="translate(${n(8 * k)},${n(-96 * k)})"><path d="M0,0 L0,${n(60 * k)}" stroke="#5E7E2A" stroke-width="2"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(j => `<ellipse cx="${n(Math.cos(j * PI / 4) * 7)}" cy="${n(Math.sin(j * PI / 4) * 7)}" rx="5" ry="2.6" transform="rotate(${j * 45},${n(Math.cos(j * PI / 4) * 7)},${n(Math.sin(j * PI / 4) * 7)})" fill="#FFFFFF" stroke="#D8D0C2" stroke-width=".8"/>`).join('')}<circle r="4.2" fill="#F2BE2C" stroke="#C8901A" stroke-width="1"/></g>` : '';
    return `<g class="pc-erva${i}" transform="translate(${x},${y})${flip ? ' scale(-1,1)' : ''}"><g class="pc-ervaIn"><path d="${d}" fill="${cor}" stroke="#4E6A22" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="#D4E49A" stroke-width=".8" opacity=".5"/>${flor}</g></g>`;
  }
  const ERVAS = [[20, 908, 1.05, false], [130, 912, .85, true], [250, 906, .6, false], [1360, 910, .75, true], [1470, 912, 1, false], [1580, 906, .9, true], [700, 914, .38, false]];
  function abelhaSVG(i) {
    return `<g class="pc-abelha${i}"><g class="pc-abelhaIn">
      <g class="pc-abelhaAsas"><ellipse cx="-2" cy="-7" rx="5" ry="7" fill="#FFFFFF" opacity=".75" stroke="#9AA8B8" stroke-width=".8"/><ellipse cx="4" cy="-6" rx="4" ry="6" fill="#FFFFFF" opacity=".65" stroke="#9AA8B8" stroke-width=".8"/></g>
      <ellipse rx="8" ry="5.5" fill="#F4C21E" stroke="#3A2A10" stroke-width="1.4"/><path d="M-2,-5 L-2,5 M3,-5 L3,5" stroke="#2A1E0C" stroke-width="2.4"/><circle cx="8" cy="-1" r="3.4" fill="#2A1E0C"/><path d="M-8,0 L-11,0" stroke="#2A1E0C" stroke-width="1.6"/></g></g>`;
  }
  function borboletaSVG() {
    return `<g class="pc-bb" display="none"><g class="pc-bbIn">
      <g class="pc-bbAsaE"><path d="M0,0 C-8,-18 -24,-20 -22,-6 C-21,2 -10,4 0,0 Z" fill="#FFFDF4" stroke="#6A6458" stroke-width="1.4"/><path d="M0,1 C-10,4 -16,12 -10,16 C-5,18 -1,10 0,1 Z" fill="#F6F2E2" stroke="#6A6458" stroke-width="1.2"/><circle cx="-14" cy="-9" r="2.4" fill="#4A4640"/></g>
      <g class="pc-bbAsaD"><path d="M0,0 C8,-18 24,-20 22,-6 C21,2 10,4 0,0 Z" fill="#FFFDF4" stroke="#6A6458" stroke-width="1.4"/><path d="M0,1 C10,4 16,12 10,16 C5,18 1,10 0,1 Z" fill="#F6F2E2" stroke="#6A6458" stroke-width="1.2"/><circle cx="14" cy="-9" r="2.4" fill="#4A4640"/></g>
      <ellipse cx="0" cy="2" rx="1.8" ry="8" fill="#3A3630"/><path d="M-1,-5 C-3,-10 -5,-12 -7,-13 M1,-5 C3,-10 5,-12 7,-13" stroke="#3A3630" stroke-width="1" fill="none"/></g></g>`;
  }

  /* ================= 5) Ícone do menu (retrato parado, sem gradientes nem recortes com id) ================= */
  function iconeSVG() {
    const C = COR.cont;
    const E = estadoCabeca(Object.assign({}, CAB_EST0, { Y: .12, beta: 4, feliz: .15, sorriso: 1, olhoEsc: 1.12, orelhas: 10 }));
    const T = k => E.t[k] ? ` transform="${E.t[k]}"` : '';
    const fe = E.a.focE;
    const olho = q => `<g${T('olho' + q)}${E.op['olho' + q] === '0' ? ' opacity="0"' : ''}><ellipse rx="13.5" ry="16" fill="#FFFDF8"/>
      <circle cx="1" cy="2" r="10.5" fill="#4A2C18"/><circle cx="1" cy="2" r="5.6" fill="#120A06"/><circle cx="-3" cy="-3" r="4.4" fill="#FFF"/><circle cx="4.5" cy="6" r="2" fill="#FFF"/>
      <path d="M-13.5,-2 C-12,-14 12,-14 13.5,-2 C11,-17 -11,-17 -13.5,-2 Z" fill="#F4B0BC"/>
      <ellipse rx="13.5" ry="16" fill="none" stroke="${C}" stroke-width="2.6"/>
      <path d="M-13,-4 Q0,-17 13,-4 M-10,-8 q-4,-4 -7,-5 M10,-8 q4,-4 7,-5" stroke="#4A1E28" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>`;
    const orelha = q => `<g${T('orelha' + q)}><path d="${ORELHA}" fill="#F3A8B5" stroke="${C}" stroke-width="2.8" stroke-linejoin="round"/>${E.el['dentro' + q] > 0 ? `<path d="${ORELHA_IN}" fill="#EC8798"/>` : ''}</g>`;
    const el = (tr, f, s) => `<g${T(tr)}><ellipse rx="${n(fe.rx)}" ry="${n(fe.ry)}" fill="${f}"${s || ''}/></g>`;
    return `<circle cx="110" cy="110" r="106" fill="#D9B886"/><path d="M4,110 A106,106 0 0 1 216,110 Z" fill="#9CCBEE"/>
      <path d="M8,96 C40,86 70,92 110,86 C150,80 180,90 212,88 L214,110 L6,110 Z" fill="#DCC27E"/>
      <path d="M6,110 L214,110 L214,120 L6,120 Z" fill="#FBF8F2"/><path d="M6,118 L214,118 L214,124 L6,124 Z" fill="#2F6CB4"/>
      <circle cx="110" cy="110" r="106" fill="none" stroke="#B48A56" stroke-width="3"/>
      <path d="M44,212 C40,170 68,146 110,144 C152,146 180,170 176,212 Z" fill="#F4A8B4" stroke="${C}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M64,170 C80,158 98,154 116,156" stroke="#FFE2E7" stroke-width="6" fill="none" opacity=".6" stroke-linecap="round"/>
      <g transform="translate(110,104) scale(1.12)">
        ${E.el.frenteE <= 0 ? orelha('E') : ''}${E.el.frenteD <= 0 ? orelha('D') : ''}
        <g${T('papada')}><ellipse rx="46" ry="31" fill="#EE9EAC" stroke="${C}" stroke-width="5"/></g>
        <ellipse rx="${RC + 3}" ry="${RC + 1}" fill="${C}"/>
        <ellipse rx="${RC}" ry="${RC - 2}" fill="#F6AFBB"/>
        <path d="M-40,-30 C-28,-48 -6,-56 16,-52" stroke="#FFF2F4" stroke-width="8" fill="none" opacity=".55" stroke-linecap="round"/>
        <ellipse${T('bochE')} rx="11" ry="7" fill="#F27C92" opacity=".55"/><ellipse${T('bochD')} rx="11" ry="7" fill="#F27C92" opacity=".55"/>
        ${olho('E')}${olho('D')}
        <path d="${E.d.boca}" stroke="${C}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        ${el('focF', '#F7B8C3', ` stroke="${C}" stroke-width="3"`)}
        <ellipse${T('focBrilho')} rx="1" ry="1" fill="#FFFFFF" opacity=".6"/>
        <ellipse${T('narinaE')} rx="1" ry="1" fill="#8A2E44"/><ellipse${T('narinaD')} rx="1" ry="1" fill="#8A2E44"/>
        ${E.el.frenteE > 0 ? orelha('E') : ''}${E.el.frenteD > 0 ? orelha('D') : ''}
      </g>`;
  }

  /* ================= 6) montar() ================= */
  // Repouso (fora): de pé, a 3/4 virado para a esquerda e para nós, perto da gamela; a poça fica à direita, junto à pocilga
  const REP = { X: 650, Z: 30, th: PI - .45 };
  const HAB = { X: 1012, Z: 92, th: .16 };
  const TH_IDA = Math.atan2(HAB.Z - REP.Z, HAB.X - REP.X), TH_VOLTA = TAU + Math.atan2(REP.Z - HAB.Z, REP.X - HAB.X);
  const CORPO0 = { alt: 0, incl: 0, rola: 0, lat: 0, jig: 0, cTurn: -.35, cB: 6, cBaixa: 0, cAv: 0, cRoll: 0, solto: 0, pose: 0, pedal: 0 };
  const ROSTO0 = { olhos: 1, feliz: 0, sobr: 0, boca: 0, sorriso: .6, olhoEsc: 1, oE: 0, oD: 0, orelhas: 0, focoS: 0, narinas: 0 };
  const CAUDA_0 = { cauAmp: 1, cauVel: .55, cauEnr: 1, cauA: 0 };
  const DEITADO = { alt: -(HC - TC) - 2, incl: 0, rola: 2.2, lat: 0, jig: 0, cTurn: 1.12, cB: 2, cBaixa: 4, cAv: 2, cRoll: -16, solto: 1, pose: 1, pedal: .35 };

  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .4 : 1;
    const p = 'porco-';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.innerHTML = `<defs>${defsPorco(p)}${defsCena(p)}</defs>
      ${ceuSVG(p)}
      ${colinasSVG(p)}
      <g class="pc-girassois">${GIRASSOIS.map((g, i) => girassolSVG(i, ...g)).join('')}</g>
      ${muroSVG(p)}${pocilgaSVG(p)}${chaoSVG(p)}${cercaSVG(p)}
      <g class="pc-salpicos">${Array.from({ length: 14 }, (_, i) => `<ellipse class="pc-salp${i}" rx="1" ry="1" fill="#6A462A" opacity="0"/>`).join('')}</g>
      <g class="pc-habitat">
        ${lamaTrasSVG(p)}
        <rect x="790" y="600" width="390" height="250" fill="#000" fill-opacity="0"/>
        ${porcoSVG(p)}
        ${lamaFrenteSVG(p)}
      </g>
      ${gamelaSVG(p)}
      <g class="pc-particulas">
        ${Array.from({ length: 18 }, () => `<ellipse class="pc-po" rx="1" ry="1" fill="url(#${p}poeira)" opacity="0"/>`).join('')}
        ${Array.from({ length: 34 }, () => `<ellipse class="pc-gota" rx="1" ry="1" fill="url(#${p}gota)" opacity="0"/>`).join('')}
        ${Array.from({ length: 8 }, () => `<circle class="pc-milho" r="3" fill="#F2CC4A" stroke="#B48A1E" stroke-width=".8" opacity="0"/>`).join('')}
      </g>
      <g class="pc-abelhas">${abelhaSVG(0)}${abelhaSVG(1)}</g>
      ${borboletaSVG()}
      ${ERVAS.map((e, i) => ervaFrenteSVG(i, ...e)).join('')}
      <rect width="1600" height="900" fill="url(#${p}luzSol)" pointer-events="none"/>
      <rect width="1600" height="900" fill="url(#${p}vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s), qa = s => Array.from(svg.querySelectorAll(s));
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function poeT(lista, v) { for (const e of lista) poe(e, v); }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; el.setAttribute(nome, v); } }

    /* --- referências --- */
    const R = {
      habitat: q('.pc-habitat'), porco: q('.pc-porco'), sombra: q('.pc-sombra'),
      trC: q('.pc-trC'), trF: q('.pc-trF'), trL: q('.pc-trL'), trU: q('.pc-trU'), trMolh: q('.pc-trMolh'), clipT: q('.pc-clipT'),
      barriga: q('.pc-barriga'), barrigaL: q('.pc-barrigaL'), mt: Array.from({ length: NMT }, (_, i) => q('.pc-mt' + i)),
      pernasTras: q('.pc-pernasTras'), pernasFrente: q('.pc-pernasFrente'),
      cauda: q('.pc-caudaG'), cauP: [q('.pc-cauC'), q('.pc-cauF'), q('.pc-cauL')], slotCT: q('.pc-slotCaudaT'), slotCF: q('.pc-slotCaudaF'),
      cab: q('.pc-cab'), orelhasTras: q('.pc-orelhasTras'), orelhasFrente: q('.pc-orelhasFrente'),
      lamaPerna: qa('.pc-lamaPerna'), lamaCasco: qa('.pc-lamaCasco'),
      nuvens: [0, 1, 2, 3].map(i => q('.pc-nuvem' + i)), aves: [0, 1, 2].map(i => q('.pc-ave' + i)),
      gir: GIRASSOIS.map((_, i) => q('.pc-gir' + i + ' .pc-girIn')), girCab: GIRASSOIS.map((_, i) => q('.pc-gir' + i + ' .pc-girCab')),
      tufos: TUFOS.map((_, i) => q('.pc-tufo' + i + ' .pc-tufoIn')), ervas: ERVAS.map((_, i) => q('.pc-erva' + i + ' .pc-ervaIn')),
      cata: q('.pc-cataIn'), brilhos: [q('.pc-brilhost'), q('.pc-brilhosf')],
      clipLama: q('.pc-clipLama'), anelCorpo: q('.pc-anelCorpo'), anelCorpoE: q('.pc-anelCorpoE'),
      aneis: Array.from({ length: NANEL }, (_, i) => q('.pc-anel' + i)), bolhas: Array.from({ length: NBOL }, (_, i) => q('.pc-bolha' + i)),
      salp: Array.from({ length: 14 }, (_, i) => q('.pc-salp' + i)),
      gotas: qa('.pc-gota'), pos: qa('.pc-po'), milho: qa('.pc-milho'),
      abelhas: [0, 1].map(i => q('.pc-abelha' + i)), abelhaIn: [0, 1].map(i => q('.pc-abelha' + i + ' .pc-abelhaIn')), abelhaAsas: [0, 1].map(i => q('.pc-abelha' + i + ' .pc-abelhaAsas')),
      bb: q('.pc-bb'), bbE: q('.pc-bbAsaE'), bbD: q('.pc-bbAsaD'), racao: q('.pc-racao'), poste: q('.pc-poste')
    };
    const H = {};
    for (const k of ['olhoE', 'olhoD', 'bochE', 'bochD', 'sobrE', 'sobrD', 'bocaInt', 'lingua', 'queixo', 'cabelo', 'orelhaE', 'orelhaD', 'focBrilho', 'narinaE', 'narinaD', 'narinas', 'focL', 'focLC', 'boca', 'cabMolh', 'focTerra']) H[k] = q('.pc-' + k);
    H.papada = [q('.pc-papadaC'), q('.pc-papada')];
    H.focB = [q('.pc-focBC'), q('.pc-focB')]; H.focF = [q('.pc-focFC'), q('.pc-focF'), q('.pc-focTerra')];
    H.focEl = qa('.pc-focBCe, .pc-focFCe, .pc-focBe, .pc-focFe, .pc-focTe'); H.focTe = q('.pc-focTe');
    H.iris = [q('.pc-irisE'), q('.pc-irisD')];
    H.palp = ['E', 'D'].map(k => ({ s: q('.pc-palpS' + k), i: q('.pc-palpI' + k), c: q('.pc-cil' + k) }));
    H.faces = ['E', 'D'].map(k => ({ fora: q(`.pc-orelha${k}-fora`), dentro: q(`.pc-orelha${k}-dentro`) }));
    H.mc = [0, 1, 2].map(i => q('.pc-mc' + i));
    const pernaEl = PERNAS.map(pe => ({
      f: q(`.pc-${pe.id}-f`), sup: qa(`.pc-${pe.id}-sup`), inf: qa(`.pc-${pe.id}-inf`), joe: qa(`.pc-${pe.id}-joe`), pe: qa(`.pc-${pe.id}-pe`),
      sombra: q('.pc-sp-' + pe.id), frente: null
    }));

    /* --- estado --- */
    const P = Object.assign({ X: REP.X, Z: REP.Z, th: REP.th, cTurnG: 0, cBG: 0, olharX: 0, olharY: 0, respA: 1, respF: .28,
      afunda: 0, mastX: 0, mastY: 0, somB: 0, somR: 0, somF: 0, cabelo: 0, oBal: 0,
      molhado: 0, lamaPes: 0, lamaPesSeca: 0, lamaCab: 0, lamaCabIdade: 0, terra: 0 }, CORPO0, ROSTO0, CAUDA_0);
    let modo = 'fora', reagindo = false, tempo = 0, vivo = true;
    const fase = { resp: 0, cauda: 0, pedal: 0 };
    let cabMundo = [0, 0], pontaMundo = [0, 0], bocaMundo = [0, 0], centroMundo = [0, 0];
    const pes = PERNAS.map(pe => ({ pe, x: 0, z: 0, y: 0, inc: 0, prof: 0, noAr: false }));
    const peDe = id => pes.find(f => f.pe.id === id);
    function restPe(pe, X, Z, th) {
      const u = pe.pu, v = pe.v;
      return [X + ESC * (u * Math.cos(th) - v * Math.sin(th)), Z + ESC * (u * Math.sin(th) + v * Math.cos(th))];
    }
    function assentarPes() { for (const f of pes) { const r = restPe(f.pe, P.X, P.Z, P.th); f.x = r[0]; f.z = r[1]; f.y = 0; f.inc = 0; } }
    assentarPes();
    // fundura da lama num ponto do chão (x, z), em px
    function prof(x, z) {
      const sy = CHAO + KZ * z, r = Math.hypot((x - LAMA.cx) / LAMA.rx, (sy - LAMA.cy) / LAMA.ry);
      return PROF * ESC * (1 - passoS(.55, 1, r));
    }
    const dentroLama = (x, y) => Math.hypot((x - LAMA.cx) / LAMA.rx, (y - LAMA.cy) / LAMA.ry) < .96;

    /* --- manchas de lama na superfície do tronco (pontos fixos do elipsoide) --- */
    const rndM = semente(77);
    const manchas = Array.from({ length: NMT }, (_, i) => {
      const a = rndM() * TAU, h = lerp(-.95, .75, Math.pow(rndM(), .8)), r = Math.sqrt(1 - h * h);
      const s = [Math.cos(a) * r * (.5 + .5 * rndM()), Math.sin(a) * r, h], u = unit(s);
      const pt = [TA * u[0], TB * u[1], TC * u[2]], nb = unit([u[0] / TA, u[1] / TB, u[2] / TC]);
      let t1 = vet(nb, [0, 0, 1]); if (Math.hypot(...t1) < .2) t1 = vet(nb, [1, 0, 0]); t1 = unit(t1);
      const t2 = vet(nb, t1);
      return { pt, nb, t1, t2, r1: 10 + rndM() * 9, r2: 7 + rndM() * 6, alfa: 0, idade: 0, cor: '' };
    });

    /* --- impulsos curtos (orelhas, cauda, cabeça, poste) --- */
    const impulsos = [];
    const IMP = { twE: 0, twD: 0, flick: 0, cabR: 0, poste: 0, foc: 0 };
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

    /* --- desenhar: lê P e põe as transformações em todas as peças --- */
    const T = w => [w[0], CHAO - w[2] + KZ * w[1]];
    const Pv = w => [w[0], KZ * w[1] - w[2]];
    const vis = w => (w[1] + KZ * w[2]) / 1.016;
    const tr = (x, y, r) => `translate(${n(x)},${n(y)}) rotate(${n(r)})`;
    let caudaNaFrente = false;
    const frenteOrelha = { E: null, D: null }, dentroOrelha = { E: null, D: null };
    let corpo = null;   // última geometria do tronco (para o anel de lama)
    function desenhar() {
      const th = P.th, ct = Math.cos(th), st = Math.sin(th);
      const ci = Math.cos(P.incl), si = Math.sin(P.incl), cr = Math.cos(P.rola), sr = Math.sin(P.rola);
      const eu = [ct * ci, st * ci, si], ev0 = [-st, ct, 0], eh0 = [-ct * si, -st * si, ci];
      const ev = soma(esc3(ev0, cr), esc3(eh0, sr)), eh = soma(esc3(ev0, -sr), esc3(eh0, cr));
      const resp = Math.sin(fase.resp) * P.respA;
      const C = [P.X + ESC * P.lat * ev0[0], P.Z + ESC * P.lat * ev0[1], ESC * (HC + P.alt + resp * .6) - P.afunda];
      const B = (u, v, h) => [u * eu[0] + v * ev[0] + h * eh[0], u * eu[1] + v * ev[1] + h * eh[1], u * eu[2] + v * ev[2] + h * eh[2]];
      const W = (u, v, h) => { const b = B(u, v, h); return [C[0] + ESC * b[0], C[1] + ESC * b[1], C[2] + ESC * b[2]]; };

      // tronco: elipsoide projetado
      const sB = 1 + .012 * resp, sC = 1 + .016 * resp + .035 * P.jig;
      const a1 = Pv(esc3(eu, ESC * TA)), a2 = Pv(esc3(ev, ESC * TB * sB)), a3 = Pv(esc3(eh, ESC * TC * sC));
      const pp = a1[0] * a1[0] + a2[0] * a2[0] + a3[0] * a3[0], qq = a1[0] * a1[1] + a2[0] * a2[1] + a3[0] * a3[1], rr = a1[1] * a1[1] + a2[1] * a2[1] + a3[1] * a3[1];
      const c0 = T(C);
      centroMundo = c0;
      const tm = mat(raizSim(pp, qq, rr), c0);
      poe(R.trF, tm); poe(R.clipT, tm); poe(R.trL, tm); poe(R.trU, tm); poe(R.trMolh, tm);
      const Ex = eixos(pp, qq, rr);
      atr(R.trC, 'rx', String(n(Ex.rx))); atr(R.trC, 'ry', String(n(Ex.ry))); poe(R.trC, tr(c0[0], c0[1], Ex.ang));
      corpo = { pp, qq, rr, c0 };
      atr(R.trMolh, 'opacity', n3(P.molhado * .22));

      // barriga: a parte do elipsoide abaixo do plano h0 (só a que está virada para nós)
      {
        const h0 = -.4, k = Math.sqrt(1 - h0 * h0), NB = 24, pts = [], vv = [];
        for (let i = 0; i < NB; i++) {
          const t = i / NB * TAU, c = Math.cos(t), s = Math.sin(t);
          pts.push(T(W(TA * k * c, TB * sB * k * s, TC * sC * h0)));
          vv.push(vis(B(k * c / TA, k * s / TB, h0 / TC)) > 0);
        }
        const nv = vv.filter(Boolean).length;
        let d = '', dl = '';
        if (nv === NB) { d = lisoFechado(pts); }
        else if (nv > 1) {
          let i0 = 0; while (!(vv[i0] && !vv[(i0 + NB - 1) % NB])) i0++;
          const arco = []; for (let j = 0; j < NB && vv[(i0 + j) % NB]; j++) arco.push(pts[(i0 + j) % NB]);
          const dc = Pv(esc3(eh, -1)), ld = Math.hypot(dc[0], dc[1]), dir = ld > .05 ? [dc[0] / ld * 400, dc[1] / ld * 400] : [0, 400];
          const a = arco[0], b = arco[arco.length - 1];
          d = liso(arco, true) + `L${n(b[0] + dir[0])},${n(b[1] + dir[1])} L${n(a[0] + dir[0])},${n(a[1] + dir[1])} Z`;
          dl = arco.length > 2 ? liso(arco, true) : '';
        }
        atr(R.barriga, 'd', d || 'M0,0'); atr(R.barrigaL, 'd', dl || 'M0,0');
      }
      // manchas de lama no tronco
      for (let i = 0; i < NMT; i++) {
        const m = manchas[i], el = R.mt[i];
        if (m.alfa <= .01) { atr(el, 'opacity', '0'); continue; }
        const f = vis(B(...m.nb));
        const o = m.alfa * passoS(.02, .22, f);
        atr(el, 'opacity', n3(o));
        if (o <= .01) continue;
        const pw = W(m.pt[0], m.pt[1] * sB, m.pt[2] * sC), t1 = Pv(esc3(B(...m.t1), ESC * m.r1)), t2 = Pv(esc3(B(...m.t2), ESC * m.r2));
        poe(el, mat([t1[0], t1[1], t2[0], t2[1]], T(pw)));
        const sec = Math.round(passoS(4000, 11000, m.idade) * 12) / 12;
        const cor = sec < .5 ? (sec < .25 ? COR.lamaM : '#6E4C30') : (sec < .75 ? '#8E7050' : COR.lamaS);
        if (m.cor !== cor) { m.cor = cor; atr(el, 'fill', cor); }
      }

      // patas: IK no plano do corpo; cascos presos ao chão (enterrados na lama) ou soltos no ar
      pes.forEach((f, i) => {
        const pe = f.pe, J = W(pe.u, pe.v, pe.h), e = pernaEl[i];
        f.prof = prof(f.x, f.z);
        let A = [f.x, f.z, f.y - f.prof + ESC * TORN];
        if (P.solto > .001) {
          const dob = pe.fr ? [24, pe.lado * 4, -22] : [-22, pe.lado * 4, -22];
          const cima = pe.fr ? [24, pe.lado * 10, -56] : [-22, pe.lado * 10, -55];
          const ph = fase.pedal + (pe.fr ? 0 : PI) + (pe.lado > 0 ? 0 : PI * .5);
          const du = lerp(dob[0], cima[0], P.pose) + Math.sin(ph) * 10 * P.pedal, dv = lerp(dob[1], cima[1], P.pose), dh = lerp(dob[2], cima[2], P.pose) + Math.cos(ph) * 8 * P.pedal;
          const b = B(du, dv, dh), Af = [J[0] + ESC * b[0], J[1] + ESC * b[1], J[2] + ESC * b[2]];
          A = [lerp(A[0], Af[0], P.solto), lerp(A[1], Af[1], P.solto), lerp(A[2], Af[2], P.solto)];
        }
        const Dw = [A[0] - J[0], A[1] - J[1], A[2] - J[2]];
        const du = pint(Dw, eu), dv = pint(Dw, ev), dh = pint(Dw, eh);
        const L1 = ESC * pe.L1, L2 = ESC * pe.L2;
        const d = Math.hypot(du, dh) || .01, dd = limita(d, ESC * 16, L1 + L2 - .4);
        const base = Math.atan2(dh, du);
        const a1 = base + pe.kd * Math.acos(limita((L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd), -1, 1));
        const ku = L1 * Math.cos(a1), kh = L1 * Math.sin(a1), au = du * dd / d, ah = dh * dd / d, fr = pe.L1 / (pe.L1 + pe.L2);
        const K = [J[0] + ku * eu[0] + dv * fr * ev[0] + kh * eh[0], J[1] + ku * eu[1] + dv * fr * ev[1] + kh * eh[1], J[2] + ku * eu[2] + dv * fr * ev[2] + kh * eh[2]];
        const An = [J[0] + au * eu[0] + dv * ev[0] + ah * eh[0], J[1] + au * eu[1] + dv * ev[1] + ah * eh[1], J[2] + au * eu[2] + dv * ev[2] + ah * eh[2]];
        const Js = T(J), Ks = T(K), As = T(An);
        const l1 = Math.hypot(Ks[0] - Js[0], Ks[1] - Js[1]), l2 = Math.hypot(As[0] - Ks[0], As[1] - Ks[1]);
        const ang2 = Math.atan2(As[1] - Ks[1], As[0] - Ks[0]) / RAD;
        poeT(e.sup, `${tr(Js[0], Js[1], Math.atan2(Ks[1] - Js[1], Ks[0] - Js[0]) / RAD)} scale(${n3(Math.max(.05, l1 / pe.L1))},${ESC})`);
        poeT(e.inf, `${tr(Ks[0], Ks[1], ang2)} scale(${n3(Math.max(.05, l2 / pe.L2))},${ESC})`);
        poeT(e.joe, `translate(${n(Ks[0])},${n(Ks[1])}) scale(${ESC})`);
        poeT(e.pe, `translate(${n(As[0])},${n(As[1])}) rotate(${n(ang2 - 90 + f.inc * (Math.cos(th) >= 0 ? 1 : -1) * (1 - P.solto))}) scale(${ESC})`);
        // à frente ou atrás do tronco, conforme a anca está virada para nós
        const fv = vis(unit(B(pe.u / (TA * TA), pe.v / (TB * TB), pe.h / (TC * TC))));
        const fr2 = e.frente == null ? fv > .1 : e.frente ? fv > .04 : fv > .16;
        if (fr2 !== e.frente) { e.frente = fr2; (fr2 ? R.pernasFrente : R.pernasTras).appendChild(e.f); }
        const gy = CHAO + KZ * f.z, al = limita(f.y / 30, 0, 1);
        poe(e.sombra, `translate(${n(f.x + 6)},${n(gy + 2)}) scale(${n3(ESC * (1 - al * .5))})`);
        atr(e.sombra, 'opacity', f.prof > 2 || P.solto > .3 ? '0' : n3(1 - al * .7));
      });
      const lp = n3(P.lamaPes * .85);
      for (const el of R.lamaPerna) atr(el, 'opacity', lp);
      for (const el of R.lamaCasco) atr(el, 'opacity', lp);
      const corPe = P.lamaPesSeca > .5 ? COR.lamaS : COR.lamaM;
      if (R.lamaPerna[0].__cor !== corPe) { for (const el of R.lamaPerna.concat(R.lamaCasco)) { el.__cor = corPe; el.setAttribute('fill', corPe); } }

      // cauda em saca-rolhas: hélice 3D presa à garupa, roda e abana
      const querCF = vis(esc3(eu, -1)) > .12;
      if (querCF !== caudaNaFrente) { caudaNaFrente = querCF; (querCF ? R.slotCF : R.slotCT).appendChild(R.cauda); }
      {
        const sw = (P.cauA + 16 * P.cauAmp * Math.sin(fase.cauda * .5) + IMP.flick) * RAD;
        const ax = unit([-.6 * Math.cos(sw), .6 * Math.sin(sw), .8]), b1 = unit(vet(ax, [0, 0, 1])), b2 = vet(ax, b1);
        const enr = P.cauEnr, L = 30 * (1.25 - .35 * enr), base = [CAUDA0.u, 0, CAUDA0.h], pts = [];
        const f0 = fase.cauda * 2.2, r0 = 7 * enr;
        for (let j = 0; j <= 16; j++) {
          const s = j / 16, r = 7 * enr * (1 - .35 * s), fi = f0 + s * TAU * 2.1;
          const o = [b1[0] * Math.cos(fi) + b2[0] * Math.sin(fi), b1[1] * Math.cos(fi) + b2[1] * Math.sin(fi), b1[2] * Math.cos(fi) + b2[2] * Math.sin(fi)];
          const o0 = [b1[0] * Math.cos(f0) + b2[0] * Math.sin(f0), b1[1] * Math.cos(f0) + b2[1] * Math.sin(f0), b1[2] * Math.cos(f0) + b2[2] * Math.sin(f0)];
          const pb = [base[0] + ax[0] * L * s + o[0] * r - o0[0] * r0 * (1 - s), base[1] + ax[1] * L * s + o[1] * r - o0[1] * r0 * (1 - s), base[2] + ax[2] * L * s + o[2] * r - o0[2] * r0 * (1 - s)];
          pts.push(T(W(...pb)));
        }
        const dC = liso(pts, true);
        for (const el of R.cauP) atr(el, 'd', dC);
      }

      // cabeça
      let psi = th + P.cTurn + P.cTurnG;
      psi = limita(psi, .05, PI - .05);
      const Y = Math.cos(psi);
      const hw = W(CAB.u + P.cAv, 0, CAB.h);
      const hc = T([hw[0], hw[1], hw[2] - ESC * P.cBaixa]);
      cabMundo = hc;
      const rot = P.cRoll + P.somR + IMP.cabR;
      poe(R.cab, `translate(${n(hc[0])},${n(hc[1])}) scale(${ESC}) rotate(${n(rot)})`);
      const fecho = limita(1 - P.olhos * (1 - piscar), 0, 1);
      const E = estadoCabeca({ Y, beta: P.cB + P.cBG, oE: P.oE + IMP.twE, oD: P.oD + IMP.twD, orelhas: P.orelhas + P.oBal + P.somB * 18, fecho, feliz: P.feliz, sobr: P.sobr,
        boca: Math.max(P.boca, P.somB), mastX: P.mastX, mastY: P.mastY, olharX: P.olharX, olharY: P.olharY, sorriso: P.sorriso, olhoEsc: P.olhoEsc,
        cabelo: P.cabelo + 6 * Math.sin(tempo / 700), focoS: P.focoS + P.somF + IMP.foc, narinas: P.narinas + P.somF * .8 });
      for (const k of ['olhoE', 'olhoD', 'bochE', 'bochD', 'sobrE', 'sobrD', 'bocaInt', 'lingua', 'queixo', 'cabelo', 'orelhaE', 'orelhaD', 'focBrilho', 'narinaE', 'narinaD']) poe(H[k], E.t[k]);
      for (const k of ['olhoE', 'olhoD', 'bochE', 'bochD', 'sobrE', 'sobrD', 'narinas']) atr(H[k], 'opacity', String(E.op[k]));
      poeT(H.papada, E.t.papada); poeT(H.focB, E.t.focB); poeT(H.focF, E.t.focF);
      const fe = E.a.focE, rxs = String(n(fe.rx)), rys = String(n(fe.ry));
      for (const el of H.focEl) { atr(el, 'rx', rxs); atr(el, 'ry', rys); }
      atr(H.focL, 'd', E.d.focL); atr(H.focLC, 'd', E.d.focL);
      atr(H.boca, 'd', E.d.boca);
      atr(H.bocaInt, 'ry', String(E.a.bocaRy)); atr(H.bocaInt, 'rx', String(E.a.bocaRx));
      atr(H.lingua, 'display', Math.max(P.boca, P.somB) > .14 ? 'inline' : 'none');
      atr(H.focTe, 'opacity', n3(P.terra * .5));
      poeT(H.iris, E.t.iris);
      H.palp.forEach(e => { atr(e.s, 'd', E.d.palpS); atr(e.i, 'd', E.d.palpI); atr(e.c, 'd', E.d.cil); });
      ['E', 'D'].forEach((k, i) => {
        const cf = E.el['frente' + k], cd = E.el['dentro' + k];
        const fr = frenteOrelha[k] == null ? cf > 0 : frenteOrelha[k] ? cf > -4 : cf > 4;
        const de = dentroOrelha[k] == null ? cd > 0 : dentroOrelha[k] ? cd > -.06 : cd > .06;
        if (fr !== frenteOrelha[k]) { frenteOrelha[k] = fr; (fr ? R.orelhasFrente : R.orelhasTras).appendChild(H['orelha' + k]); }
        if (de !== dentroOrelha[k]) { dentroOrelha[k] = de; atr(H.faces[i].dentro, 'display', de ? 'inline' : 'none'); atr(H.faces[i].fora, 'display', de ? 'none' : 'inline'); }
      });
      const corC = P.lamaCabIdade > 7000 ? COR.lamaS : COR.lamaM;
      H.mc.forEach((el, i) => {
        const o = P.lamaCab * passoS(.05, .3, E.op['mc' + i]);
        atr(el, 'opacity', n3(o)); if (o > .01) poe(el, E.t['mc' + i]);
        if (el.__cor !== corC) { el.__cor = corC; el.setAttribute('fill', corC); }
      });
      atr(H.cabMolh, 'opacity', n3(P.molhado * .2));
      const rr2 = rot * RAD, crr = Math.cos(rr2), srr = Math.sin(rr2);
      const paraMundo = (x, y) => [hc[0] + ESC * (x * crr - y * srr), hc[1] + ESC * (x * srr + y * crr)];
      pontaMundo = paraMundo(E.a.ponta[0], E.a.ponta[1]);
      bocaMundo = paraMundo(E.a.boca[0], E.a.boca[1]);

      // sombra no chão (o sol do meio-dia está alto e à esquerda: sombra curta, um pouco para a direita)
      const g0 = T([C[0], C[1], 0]), dei = passoS(.2, 1, P.solto);
      poe(R.sombra, `translate(${n(g0[0] + 12)},${n(g0[1] + 3)}) scale(${n(ESC * (64 + 50 * Math.abs(ct) + 30 * dei))},${n(ESC * (20 + 8 * dei))})`);
      atr(R.sombra, 'opacity', n3((1 - passoS(2, 12, P.afunda) * .8) * (1 - limita(P.alt / 40, 0, .5))));

      // linha da lama do porco: a cópia da lama por cima dele só se vê abaixo desta linha
      const Wl = CHAO + KZ * P.Z + 3;
      atr(R.clipLama, 'y', String(n(Wl)));
      const afu = passoS(3, 9, P.afunda);
      if (afu > .01 && P.solto > .3) {
        const dy = Wl - c0[1], det = pp * rr - qq * qq, disc = qq * qq * dy * dy - rr * (pp * dy * dy - det);
        if (disc > 0) {
          const x1 = c0[0] + (qq * dy - Math.sqrt(disc)) / rr, x2 = c0[0] + (qq * dy + Math.sqrt(disc)) / rr, rx = (x2 - x1) / 2 + 8;
          const dA = `M${n(x1 - 8)},${n(Wl)} A${n(rx)},10 0 0 0 ${n(x2 + 8)},${n(Wl)}`;
          atr(R.anelCorpo, 'd', dA); atr(R.anelCorpoE, 'd', `M${n(x1 - 2)},${n(Wl + 1)} A${n(rx - 6)},6 0 0 0 ${n(x2 + 2)},${n(Wl + 1)}`);
          atr(R.anelCorpo, 'opacity', n3(afu * .9)); atr(R.anelCorpoE, 'opacity', n3(afu * .5));
        } else { atr(R.anelCorpo, 'opacity', '0'); atr(R.anelCorpoE, 'opacity', '0'); }
      } else { atr(R.anelCorpo, 'opacity', '0'); atr(R.anelCorpoE, 'opacity', '0'); }
      eixosAgora = { eu, ev, eh, B };
    }
    let eixosAgora = null;
    // põe lama nas manchas que estão viradas para baixo (a tocar na lama) ou ao acaso, com força k
    function enlamear(k) {
      if (!eixosAgora) return;
      for (const m of manchas) {
        const nw = eixosAgora.B(...m.nb);
        if (nw[2] < -.3 || Math.random() < k * .12) { m.alfa = Math.min(1, m.alfa + .5 + k * .5); m.idade = 0; }
      }
    }

    /* --- piscar, olhar, tiques --- */
    let piscar = 0;
    const pisca = { t: aleat(1500, 3500), f: -1, duplo: false };
    function atualizarPiscar(dt) {
      if (pisca.f < 0) {
        pisca.t -= dt; piscar = 0;
        if (pisca.t <= 0) { pisca.f = 0; pisca.duplo = !pisca.duplo && Math.random() < .25; }
        return;
      }
      pisca.f += dt;
      const u = pisca.f / 220;
      piscar = u < .4 ? esai(u / .4) : 1 - eseno(limita((u - .4) / .6, 0, 1));
      if (u >= 1) { piscar = 0; pisca.f = -1; pisca.t = pisca.duplo ? 120 : aleat(2000, 6000); }
    }
    const olhar = { foco: null, t: 0, ax: 0, ay: 0, rapido: false, cabeca: true, abelha: 0 };
    function atualizarOlhar(dt) {
      let ax, ay, aT = 0, aB = 0;
      let foco = olhar.foco;
      if (!foco && olhar.abelha > 0 && modo === 'fora' && !reagindo) { olhar.abelha -= dt; const i = olhar.abelhaI; foco = () => abelhas[i].pos; }
      if (foco) {
        const f = foco(), dx = f[0] - cabMundo[0], dy = f[1] - cabMundo[1];
        ax = limita(dx / 200, -1, 1); ay = limita(dy / 200, -1, 1);
        if (olhar.cabeca) {
          const base = P.th + P.cTurn;
          const Yd = limita(dx / 360, -.9, .9);
          aT = limita(Math.acos(Yd) - base, -1.2, 1.2) * (modo === 'dentro' ? .4 : 1);
          aB = limita(dy / 260 * 18, -18, 18);
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
      P.cTurnG += (aT - P.cTurnG) * kC; P.cBG += (aB - P.cBG) * kC;
    }
    const tiques = { orelha: aleat(2000, 5000), cauda: aleat(3000, 7000), foc: aleat(1500, 4000), abelha: aleat(8000, 14000) };
    function atualizarTiques(dt) {
      tiques.orelha -= dt; tiques.cauda -= dt; tiques.foc -= dt; tiques.abelha -= dt;
      if (tiques.orelha <= 0) {
        tiques.orelha = aleat(1800, 5000);
        const k = Math.random() < .5 ? 'twE' : 'twD';
        impulso(k, aleat(14, 24), aleat(320, 460));
        if (Math.random() < .4) impulso(k === 'twE' ? 'twD' : 'twE', aleat(12, 20), 400);
      }
      if (tiques.cauda <= 0) { tiques.cauda = aleat(2500, 6500); impulso('flick', aleat(20, 34) * (Math.random() < .5 ? -1 : 1), aleat(600, 900), 'onda'); }
      if (tiques.foc <= 0) { tiques.foc = aleat(1600, 4200); impulso('foc', aleat(.6, 1), aleat(260, 380), 'mola'); }   // o focinho fareja
      if (tiques.abelha <= 0) { tiques.abelha = aleat(9000, 16000); olhar.abelha = aleat(1600, 2600); olhar.abelhaI = Math.random() < .5 ? 0 : 1; }
    }

    /* --- lama: gotas, salpicos no chão, anéis, bolhas; poeira; milho --- */
    const aneis = R.aneis.map(el => ({ el, t: 1, dur: 1, vis: false }));
    function anel(x, y, r0, r1, dur, f, atraso) {
      const o = aneis.find(o2 => o2.t >= o2.dur) || aneis.reduce((a, b) => a.t / a.dur > b.t / b.dur ? a : b);
      Object.assign(o, { x, y, r0, r1, dur, f, t: -(atraso || 0) });
    }
    function atualizarAneis(dt) {
      for (const o of aneis) {
        if (o.t >= o.dur) { if (o.vis) { atr(o.el, 'opacity', '0'); o.vis = false; } continue; }
        o.t += dt;
        if (o.t < 0) continue;
        const u = Math.min(1, o.t / o.dur), r = lerp(o.r0, o.r1, esai(u));
        atr(o.el, 'cx', String(n(o.x))); atr(o.el, 'cy', String(n(o.y))); atr(o.el, 'rx', String(n(r))); atr(o.el, 'ry', String(n(r * .26)));
        atr(o.el, 'opacity', n3(o.f * Math.pow(1 - u, 1.3))); atr(o.el, 'stroke-width', String(n(1.2 + 2.4 * (1 - u))));
        o.vis = true;
      }
    }
    const salpicos = R.salp.map(el => ({ el, t: 0, vivo: false }));
    function salpico(x, y, r) {
      const s = salpicos.find(a => !a.vivo) || salpicos.reduce((a, b) => a.t > b.t ? a : b);
      Object.assign(s, { t: 0, vivo: true });
      atr(s.el, 'cx', String(n(x))); atr(s.el, 'cy', String(n(y))); atr(s.el, 'rx', String(n(r * 1.6))); atr(s.el, 'ry', String(n(r * .6)));
    }
    function atualizarSalpicos(dt) {
      for (const s of salpicos) {
        if (!s.vivo) continue;
        s.t += dt;
        if (s.t > 9000) { s.vivo = false; atr(s.el, 'opacity', '0'); continue; }
        atr(s.el, 'opacity', n3(.75 * (1 - passoS(3000, 9000, s.t))));
        atr(s.el, 'fill', s.t > 2500 ? '#9A7A52' : '#6A462A');
      }
    }
    const gotas = R.gotas.map(el => ({ el, vivo: false }));
    function gota(x, y, vx, vy, r, yFim) {
      const g = gotas.find(g2 => !g2.vivo); if (!g) return;
      Object.assign(g, { x, y, vx, vy, r, yFim, vivo: true });
      atr(g.el, 'opacity', '.95');
    }
    function salpicar(x, y, quantas, forca, larg) {
      for (let i = 0; i < quantas; i++) {
        const a = aleat(-1, 1), xx = x + a * (larg || 24);
        gota(xx, y - aleat(0, 6), a * aleat(80, 240) * forca, -aleat(220, 480) * forca, aleat(3, 6.5), y + aleat(-4, 26));
      }
    }
    function atualizarGotas(dt) {
      const s = dt / 1000;
      for (const g of gotas) {
        if (!g.vivo) continue;
        g.vy += 1400 * s; g.x += g.vx * s; g.y += g.vy * s;
        if (g.vy > 0 && g.y > g.yFim) {
          g.vivo = false; atr(g.el, 'opacity', '0');
          if (dentroLama(g.x, g.yFim)) anel(g.x, g.yFim, 1, 12, 520, .6); else salpico(g.x, g.yFim, g.r * .9);
          continue;
        }
        poe(g.el, `translate(${n(g.x)},${n(g.y)}) rotate(${n(Math.atan2(g.vy, g.vx) / RAD)}) scale(${n(g.r * (1 + Math.min(.6, Math.hypot(g.vx, g.vy) / 900)))},${n(g.r * .8)})`);
      }
    }
    const nuvensPo = R.pos.map(el => ({ el, vivo: false }));
    function poeira(x, y, vx, vy, r, dur) {
      const g = nuvensPo.find(g2 => !g2.vivo); if (!g) return;
      Object.assign(g, { x, y, vx, vy, r, dur, t: 0, vivo: true });
    }
    function nuvemPo(x, y, k, forca) {
      for (let i = 0; i < k; i++) poeira(x + aleat(-12, 12), y - aleat(0, 6), aleat(-40, 40) * forca, -aleat(10, 40) * forca, aleat(8, 14), aleat(700, 1200));
    }
    function atualizarPoeira(dt) {
      const s = dt / 1000;
      for (const g of nuvensPo) {
        if (!g.vivo) continue;
        g.t += dt;
        const u = g.t / g.dur;
        if (u >= 1) { g.vivo = false; atr(g.el, 'opacity', '0'); continue; }
        g.vx *= Math.exp(-s * 1.5); g.vy *= Math.exp(-s * 1.5);
        g.x += g.vx * s; g.y += g.vy * s;
        const r = g.r * (1 + u * 1.5);
        atr(g.el, 'opacity', n3(Math.min(1, u * 6) * (1 - u) * .9));
        poe(g.el, `translate(${n(g.x)},${n(g.y)}) scale(${n(r)},${n(r * .7)})`);
      }
    }
    const milhos = R.milho.map(el => ({ el, vivo: false }));
    function migalha(x, y) {
      const g = milhos.find(m => !m.vivo); if (!g) return;
      Object.assign(g, { x, y, vx: aleat(-90, 90), vy: -aleat(120, 260), yFim: GAM.y - 30 + aleat(-4, 4), vivo: true });
      atr(g.el, 'opacity', '1');
    }
    function atualizarMilho(dt) {
      const s = dt / 1000;
      for (const g of milhos) {
        if (!g.vivo) continue;
        g.vy += 1300 * s; g.x += g.vx * s; g.y += g.vy * s;
        if (g.vy > 0 && g.y > g.yFim) { g.vivo = false; atr(g.el, 'opacity', '0'); continue; }
        poe(g.el, `translate(${n(g.x)},${n(g.y)})`);
      }
    }
    const bolhas = R.bolhas.map(el => ({ el, t: 0, dur: 0, vivo: false }));
    let bolhaProx = aleat(800, 2000);
    function bolha(x, y, r) {
      const b = bolhas.find(a => !a.vivo); if (!b) return;
      Object.assign(b, { x, y, r: r || aleat(4, 9), t: 0, dur: aleat(900, 1600), vivo: true });
    }
    function atualizarBolhas(dt) {
      bolhaProx -= dt * calma;
      if (bolhaProx <= 0) {
        bolhaProx = aleat(700, 2200);
        const a = aleat(.15, PI - .15), r = Math.sqrt(Math.random()) * .8;
        const x = LAMA.cx + Math.cos(a) * LAMA.rx * r, y = LAMA.cy + Math.sin(a) * LAMA.ry * r * .9;
        const linha = CHAO + KZ * P.Z + 3, perto = P.afunda > 2 && Math.abs(x - centroMundo[0]) < 230;
        if (!perto || y > linha + 4) bolha(x, y);
      }
      for (const b of bolhas) {
        if (!b.vivo) continue;
        b.t += dt;
        const u = b.t / b.dur;
        if (u >= 1) { b.vivo = false; atr(b.el, 'opacity', '0'); anel(b.x, b.y, b.r * .8, b.r * 3, 500, .5); continue; }
        const r = b.r * (.2 + .8 * esai(Math.min(1, u * 1.4)));
        atr(b.el, 'opacity', '.95');
        poe(b.el, `translate(${n(b.x)},${n(b.y - r * .55)}) scale(${n(r)},${n(r * .75)})`);
      }
    }
    // um casco pousou: na lama faz salpicos e anéis; em terra levanta pó
    function pousou(f) {
      const sy = CHAO + KZ * f.z;
      if (f.prof > 3) {
        salpicar(f.x, sy, 4 + (Math.random() * 3 | 0), .6, 12);
        anel(f.x, sy, 10, 40, 800, .7);
        P.lamaPes = Math.min(1, P.lamaPes + .3); P.lamaPesSeca = 0;
      } else nuvemPo(f.x, sy, 2, .6);
    }

    /* --- tarefas: geradores que avançam com o dt do relógio (uma por faixa) --- */
    const faixas = new Map();
    function lancar(nome, gen, fim) {
      if (!vivo) return;
      if (nome === 'corpo') { olhar.foco = null; olhar.rapido = false; olhar.cabeca = true; }
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

    /* --- cascos: um passo (levanta, avança em arco, pousa) e recompor os cascos fora do sítio --- */
    function* passo1(f, alvo, ms, alt = 18) {
      const x0 = f.x, z0 = f.z, y0 = f.y;
      yield* durante(ms, u => {
        const e = eseno(u);
        f.x = lerp(x0, alvo[0], e); f.z = lerp(z0, alvo[1], e); f.y = lerp(y0, 0, e) + sino(u) * alt * ESC; f.inc = -sino(u) * 14;
      });
      f.y = 0; f.inc = 0;
      pousou(f);
    }
    function* recomporPes(ms = 240) {
      const fora = pes.filter(f => { const r = restPe(f.pe, P.X, P.Z, P.th); return f.y > .5 || Math.hypot(f.x - r[0], f.z - r[1]) > 3; });
      if (!fora.length) return;
      yield* juntos(...fora.map((f, i) => (function* () { yield* espera(i * 70); yield* passo1(f, restPe(f.pe, P.X, P.Z, P.th), ms, f.y > .5 ? f.y / ESC + 6 : 16); })()));
    }

    /* --- virar no sítio: a cabeça adianta-se, o corpo roda, as patas pisam uma a uma --- */
    function* virar(th1, ms) {
      const th0 = P.th;
      const thEm = u => lerp(th0, th1, eio(limita(u, 0, 1)));
      const plano = [['tA', 0, .3, .45], ['fB', .08, .38, .5], ['tB', .22, .52, .7], ['fA', .32, .62, .8], ['tA', .5, .78, 1], ['fB', .56, .84, 1], ['tB', .64, .92, 1], ['fA', .7, 1, 1]]
        .map(([id, a, b, ua]) => ({ f: peDe(id), a, b, ua, de: null, para: null, feito: false }));
      const ct0 = P.cTurn;
      yield* durante(ms, u => {
        P.th = thEm(u);
        P.cTurn = ct0 * (1 - u) + (thEm(u + .22) - P.th) * .9;
        P.alt = -2.5 * Math.sin(u * PI * 4) ** 2 * sino(u);
        P.lat = 1.5 * Math.sin(u * PI * 4) * sino(u);
        for (const s of plano) {
          if (u < s.a || s.feito) continue;
          if (!s.de) { s.de = [s.f.x, s.f.z]; s.para = restPe(s.f.pe, P.X, P.Z, thEm(s.ua)); }
          const v = limita((u - s.a) / (s.b - s.a), 0, 1);
          s.f.x = lerp(s.de[0], s.para[0], eseno(v)); s.f.z = lerp(s.de[1], s.para[1], eseno(v)); s.f.y = sino(v) * 18 * ESC; s.f.inc = -sino(v) * 12;
          if (v >= 1) { s.feito = true; s.f.y = 0; s.f.inc = 0; pousou(s.f); }
        }
      });
      P.alt = 0; P.lat = 0;
    }

    /* --- trote em pares diagonais (frente-A com trás-B, frente-B com trás-A), cascos presos ao chão (por distância) --- */
    const PASSO = { D: 112, beta: .5, ordem: { fA: 0, tB: 0, fB: .5, tA: .5 } };
    function perfilAndar(u, a = .18) {
      const tot = 1 - a;
      if (u < a) return (u * u / (2 * a)) / tot;
      if (u > 1 - a) { const w = u - (1 - a); return (a / 2 + (1 - 2 * a) + w - w * w / (2 * a)) / tot; }
      return (a / 2 + (u - a)) / tot;
    }
    function pePasso(d, off, total) {
      const { D, beta } = PASSO;
      const x = d / D + off, c = Math.floor(x), pp = x - c;
      const plantar = dtd => dtd <= 0 ? 0 : Math.min(dtd + beta * D / 2, total);
      if (pp < beta) return { F: plantar(D * (c - off)), alt: 0 };
      const dLo = D * (c + beta - off), dHi = D * (c + 1 - off);
      const de = plantar(D * (c - off)), para = plantar(dHi), ini = Math.max(dLo, 0);
      if (ini >= total - 2) return { F: de, alt: 0 };
      const qq = limita((d - ini) / Math.max(1, Math.min(dHi, total) - ini), 0, 1);
      return { F: lerp(de, para, eseno(qq)), alt: de === para ? 0 : Math.sin(PI * qq) };
    }
    function* andar(X1, Z1, ms, trote = true) {
      const X0 = P.X, Z0 = P.Z, total = Math.hypot(X1 - X0, Z1 - Z0), ux = (X1 - X0) / (total || 1), uz = (Z1 - Z0) / (total || 1);
      const base = pes.map(f => [f.x, f.z]);
      yield* durante(ms, u => {
        const d = total * perfilAndar(u);
        P.X = X0 + ux * d; P.Z = Z0 + uz * d;
        const m = Math.min(suave(limita(u / .12, 0, 1)), suave(limita((1 - u) / .12, 0, 1))) * (trote ? 1 : .4);
        pes.forEach((f, i) => {
          const r = pePasso(d, PASSO.ordem[f.pe.id], total);
          f.x = base[i][0] + ux * r.F; f.z = base[i][1] + uz * r.F; f.y = r.alt * 17 * ESC; f.inc = -r.alt * 16;
          const ar = r.alt > .03;
          if (f.noAr && !ar) pousou(f);
          f.noAr = ar;
        });
        const ph = d / PASSO.D * TAU;
        P.alt = (-1.5 + 5 * Math.abs(Math.sin(ph))) * m;            // salta um pouco em cada par de passos
        P.jig = -Math.sin(2 * ph - 1) * m;                             // a barriga balança atrasada
        P.lat = 1.6 * Math.sin(ph) * m;
        P.cBaixa = 3 * Math.cos(2 * ph + .6) * m;
        P.oBal = 16 * Math.sin(2 * ph - 1.4) * m;                      // as orelhas abanam a cada passo
        P.cauA = 12 * Math.sin(ph) * m;
      });
      P.alt = 0; P.jig = 0; P.lat = 0; P.cBaixa = 0; P.oBal = 0; P.cauA = 0;
      pes.forEach(f => { f.noAr = false; });
      const fora = pes.filter(f => { const r = restPe(f.pe, P.X, P.Z, P.th); return Math.hypot(f.x - r[0], f.z - r[1]) > 3 || f.y > .5; });
      if (fora.length) yield* juntos(...fora.map((f, i) => (function* () { yield* espera(i * 50); yield* passo1(f, restPe(f.pe, P.X, P.Z, P.th), 170, 12); })()));
    }

    /* --- comportamentos (fora): 8 diferentes, ao acaso a cada 4–9 s, sem repetir; cada um começa por repor a cara --- */
    function* recompor(ms = 380) {
      yield* recomporPes();
      yield* tw(Object.assign({}, CORPO0, ROSTO0, CAUDA_0), ms);
    }
    function* mastigar(ms, forca = 1) {
      yield* durante(ms, (u, t) => {
        const k = forca * Math.min(1, t / 160, (ms - t) / 160);
        const f = t / 1000 * TAU * 2.4;
        P.mastX = Math.sin(f) * 2.5 * k; P.mastY = (1 - Math.cos(2 * f)) * 1.6 * k; P.boca = .1 * k + Math.max(0, Math.sin(2 * f)) * .18 * k;
      });
      P.mastX = 0; P.mastY = 0; P.boca = 0;
    }
    function* fucar() {                     // fuça o chão com o focinho: a terra salta e o focinho fica sujo
      const chao = () => [pontaMundo[0], CHAO + KZ * (P.Z + 70)];
      olhar.foco = chao; olhar.cabeca = false;
      yield* tw(Object.assign({}, ROSTO0, { cTurn: -1.5, cB: 48, cBaixa: 57, cAv: 8, incl: -.16, alt: -8, olhos: .9, orelhas: -10 }), 650);
      let acc = 0;
      yield* durante(2600, (u, t) => {
        const f = Math.sin(t / 1000 * TAU * 2.2);
        P.cAv = 8 + 8 * f; P.cBaixa = 57 + 3 * Math.abs(f); P.cB = 48 + 4 * f; P.focoS = .3 + .4 * Math.max(0, f); P.narinas = .5 + .5 * Math.max(0, -f);
        P.cauAmp = 1.6; P.terra = Math.min(1, P.terra + .0006 * 16);
        acc += 16.7;
        if (acc > 180 && f > .3) {
          acc = 0;
          const pm = pontaMundo;
          for (let i = 0; i < 2; i++) poeira(pm[0] + aleat(-8, 8), pm[1] + 6, aleat(-60, 60), -aleat(40, 90), aleat(6, 10), aleat(500, 900));
          gota(pm[0], pm[1] + 4, aleat(-160, 160), -aleat(160, 300), aleat(2, 3.4), pm[1] + aleat(6, 18));
        }
      });
      P.focoS = 0; P.narinas = 0;
      yield* tw({ cTurn: -1.1, cB: 4, cBaixa: -4, cAv: 0, incl: 0, alt: 0, orelhas: 6, olhos: .6, feliz: .4 }, 500);
      yield* juntos(mastigar(1200), tw({ feliz: .7, olhos: .4 }, 400));
      impulso('twE', 20, 400); impulso('twD', 20, 400);
      yield* tw(Object.assign({}, CORPO0, ROSTO0), 500);
    }
    function* comerGamela() {               // baixa a cabeça para dentro da gamela e come o milho, contente
      const alvo = [GAM.x + 30, GAM.y - 36];
      olhar.foco = () => alvo; olhar.cabeca = false;
      yield* tw(Object.assign({}, ROSTO0, { cTurn: .05, cB: 42, cBaixa: 40, cAv: 26, incl: -.12, alt: -5, olhos: .85, orelhas: -8 }), 700);
      let acc = 0;
      yield* durante(3200, (u, t) => {
        const f = Math.sin(t / 1000 * TAU * 2.6);
        P.cBaixa = 40 + 4 * Math.max(0, f); P.cB = 42 + 3 * f; P.boca = .15 + .2 * Math.max(0, f); P.mastX = 2 * f;
        P.cauAmp = 2.2; P.cauVel = 1.4; P.feliz = .5 * sino(u * 1.2); P.olhos = 1 - .6 * sino(u * 1.2);
        acc += 16.7;
        if (acc > 320) { acc = 0; migalha(pontaMundo[0] + aleat(-10, 10), Math.min(pontaMundo[1], GAM.y - 32)); }
      });
      impulso('twE', 22, 380); impulso('twD', 22, 380);
      yield* tw({ cB: 2, cBaixa: -2, cAv: 0, incl: 0, alt: 0, boca: 0, mastX: 0, olhos: .5, feliz: .6, cTurn: CORPO0.cTurn }, 500);
      yield* juntos(mastigar(1300), tw({ feliz: .8, olhos: .3, sorriso: 1 }, 400));
      yield* tw(Object.assign({}, CORPO0, ROSTO0, CAUDA_0), 500);
    }
    function* cocarPoste() {                // recua até ao poste e coça a garupa nele, de olhos fechados
      const tras = [P.X - Math.cos(P.th) * 26, P.Z - Math.sin(P.th) * 26];
      yield* tw(Object.assign({}, ROSTO0), 200);
      yield* andar(tras[0], tras[1], 700, false);
      yield* tw({ olhos: .2, feliz: .9, sorriso: 1, orelhas: -6, cB: -2 }, 350);
      yield* durante(2800, (u, t) => {
        const f = Math.sin(t / 1000 * TAU * 1.6), k = sino(u) ** .4;
        P.alt = (-4 + 5 * f) * k; P.rola = .07 * f * k; P.lat = -2 * k; P.incl = .03 * f * k; P.cRoll = 5 * f * k; P.jig = .6 * f * k;
        P.cauAmp = 2; P.cauVel = 1.2; P.oE = 10 * f * k; P.oD = -10 * f * k;
        IMP.poste = 0; postePuxa = 1.2 * f * k;
      });
      postePuxa = 0;
      yield* tw({ alt: 0, rola: 0, lat: 0, incl: 0, cRoll: 0, jig: 0, oE: 0, oD: 0 }, 300);
      yield* tw({ olhos: 1, feliz: 0 }, 250);
      yield* andar(REP.X, REP.Z, 700, false);
      yield* tw(Object.assign({}, CORPO0, ROSTO0, CAUDA_0), 300);
    }
    function* abanarOrelhas() {             // sacode a cabeça e as orelhas batem
      yield* tw(Object.assign({}, ROSTO0, { olhos: .4, cB: 2 }), 260);
      yield* durante(1100, (u, t) => {
        const k = sino(u) ** .5, f = Math.sin(t / 1000 * TAU * 4.2);
        P.cTurnG = .32 * f * k; P.cRoll = 9 * f * k; P.oE = 26 * Math.sin(t / 1000 * TAU * 4.2 - .8) * k; P.oD = -26 * Math.sin(t / 1000 * TAU * 4.2 - .8) * k; P.lat = 1.5 * f * k;
        P.olhos = 1 - .8 * k;
      });
      if (P.lamaCab > .2) salpicar(cabMundo[0], cabMundo[1] - 40, 4, .5, 30);
      impulso('foc', 1.2, 380, 'mola');
      yield* tw({ oE: 0, oD: 0, cRoll: 0, lat: 0, olhos: 1, cB: CORPO0.cB }, 360);
    }
    function* sentar() {                    // senta-se (as patas de trás vêm para a frente), olha à volta e levanta-se
      yield* tw(Object.assign({}, ROSTO0), 200);
      const ta = peDe('tA'), tb = peDe('tB');
      const fw = (f, k) => { const r = restPe(f.pe, P.X, P.Z, P.th); return [r[0] + Math.cos(P.th) * k, r[1] + Math.sin(P.th) * k]; };
      yield* juntos(passo1(ta, fw(ta, 34), 300, 12), (function* () { yield* espera(140); yield* passo1(tb, fw(tb, 34), 300, 12); })(), tw({ alt: -4 }, 440));
      yield* tw({ incl: .44, alt: -40, cB: -6, cTurn: -.2, cauEnr: 1.2, jig: .6 }, 650, eio);
      yield* tw({ jig: 0 }, 200);
      olhar.cabeca = false;
      yield* tw({ cTurn: -.9, cB: -10 }, 600); yield* espera(500);
      yield* tw({ cTurn: .25, cB: -4 }, 800); yield* espera(500);
      yield* tw({ olhos: .1, feliz: .5 }, 250, eseno); yield* tw({ olhos: 1, feliz: 0 }, 300, eseno);
      yield* tw({ incl: 0, alt: -2, cB: CORPO0.cB, cTurn: CORPO0.cTurn, cauEnr: 1 }, 600, eio);
      yield* juntos(passo1(ta, restPe(ta.pe, P.X, P.Z, P.th), 280, 12), (function* () { yield* espera(120); yield* passo1(tb, restPe(tb.pe, P.X, P.Z, P.th), 280, 12); })(), tw({ alt: 0 }, 400));
    }
    function* farejar() {                   // levanta o focinho e fareja o ar
      olhar.cabeca = false;
      yield* tw(Object.assign({}, ROSTO0, { cB: -26, cBaixa: -10, cAv: 6, orelhas: 16, olhoEsc: 1.04, sobr: .5 }), 500);
      yield* durante(2400, (u, t) => {
        const f = Math.sin(t / 1000 * TAU * 3.4), g = Math.sin(t / 1000 * TAU * .7);
        P.narinas = .6 + .6 * Math.max(0, f); P.focoS = .25 * Math.max(0, f); P.cTurnG = .25 * g; P.cB = -26 + 4 * Math.sin(t / 1000 * TAU * 1.3);
        P.olhos = .75;
      });
      impulso('foc', 1.4, 400, 'mola'); impulso('twE', 20, 380); impulso('twD', 20, 380);
      yield* tw({ narinas: 0, focoS: 0, olhos: 1, sobr: 0 }, 200);
      yield* tw(Object.assign({}, CORPO0, ROSTO0), 600);
    }
    function* abanarCauda() {               // olha para trás por cima do ombro e a cauda roda depressa
      olhar.cabeca = false;
      yield* tw(Object.assign({}, ROSTO0, { cTurn: -2.25, cB: 14, cRoll: 6, orelhas: 6 }), 700, eio);
      yield* durante(2000, u => { P.cauVel = .55 + 2.4 * sino(u); P.cauAmp = 1 + 1.6 * sino(u); P.feliz = .4 * sino(u); });
      impulso('twE', 22, 380); impulso('twD', 22, 380);
      yield* tw({ olhos: .1, feliz: .5 }, 240, eseno); yield* tw({ olhos: 1, feliz: 0 }, 280, eseno);
      yield* tw(Object.assign({}, CORPO0, CAUDA_0, ROSTO0), 700, eio);
    }
    function* olharCrianca() {              // vira a cabeça para nós, inclina-a e mexe o focinho
      olhar.cabeca = false;
      yield* tw(Object.assign({}, ROSTO0, { cTurn: PI / 2 - P.th + .05, cB: 6, olhoEsc: 1.08, orelhas: 12, sobr: .6 }), 800, eio);
      yield* tw({ cRoll: 12, sobr: 1, sorriso: 1 }, 400);
      yield* tw({ olhos: .06, feliz: .6 }, 340, eseno); yield* espera(140); yield* tw({ olhos: 1, feliz: 0 }, 380, eseno);
      for (let i = 0; i < 3; i++) { impulso('foc', 1.2, 260, 'mola'); yield* espera(300); }
      yield* tw({ cRoll: -8 }, 500);
      impulso('twE', 22, 380);
      yield* espera(400);
      yield* tw(Object.assign({}, CORPO0, ROSTO0), 900, eio);
    }
    const COMPORTAMENTOS = { fucar, comerGamela, cocarPoste, abanarOrelhas, sentar, farejar, abanarCauda, olharCrianca };
    let ultimoComp = null, postePuxa = 0;
    function* cicloFora() {
      // um coçar no poste interrompido (toque) não deixa o poste torto nem o porco encostado a ele
      postePuxa = 0;
      if (Math.hypot(P.X - REP.X, P.Z - REP.Z) > 3) yield* andar(REP.X, REP.Z, 700, false);
      for (;;) {
        yield* espera(aleat(4000, 9000));
        let nome; do nome = escolhe(Object.keys(COMPORTAMENTOS)); while (nome === ultimoComp);
        ultimoComp = nome;
        yield* COMPORTAMENTOS[nome]();
      }
    }

    /* --- reação ao toque (fora): orelhas para cima, olhos contentes, um saltinho de alegria e a cauda a rodar --- */
    function* reacaoFora() {
      reagindo = true;
      impulso('flick', 36, 700, 'onda');
      const rosto = tw({ orelhas: 26, oE: 0, oD: 0, feliz: 1, olhos: 1, sobr: .8, sorriso: 1, boca: .3, olhoEsc: 1.06, cauVel: 2.6, cauAmp: 2 }, 100, esai);
      const corpo = (function* () {
        yield* juntos(recomporPes(200), tw(Object.assign({}, CORPO0, { alt: -6, jig: .5 }), 140, esai));
        const pos = pes.map(f => [f.x, f.z]);
        yield* durante(420, u => {
          const s = sino(u);
          P.alt = -6 + 32 * s; P.jig = -1 + 2 * u;
          pes.forEach((f, i) => { f.x = pos[i][0]; f.z = pos[i][1]; f.y = Math.max(0, 32 * s - 8) * ESC * .8; });
        });
        pes.forEach(f => { f.y = 0; pousou(f); });
        yield* tw({ alt: -7, jig: 1 }, 110, esai);
        yield* durante(500, u => { P.alt = -7 * (1 - u); P.jig = Math.cos(u * PI * 3) * (1 - u); P.cRoll = 6 * Math.sin(u * PI * 2) * (1 - u); });
      })();
      yield* juntos(rosto, corpo);
      yield* espera(150);
      reagindo = false;
      yield* tw(Object.assign({}, ROSTO0, CORPO0, CAUDA_0), 600);
    }

    /* --- dentro da lama: rebolar, pedalar, suspirar, soprar bolhas --- */
    function* rebolar() {                   // rebola-se de um lado para o outro: salpicos e mais lama no corpo
      yield* tw({ olhos: .2, feliz: .9, sorriso: 1 }, 200);
      for (let i = 0; i < 2; i++) {
        yield* tw({ rola: 1.45, pose: .55, pedal: .8, cRoll: -6 }, 420, eio);
        salpicar(centroMundo[0] - 40, CHAO + KZ * P.Z, 7, .9, 70); enlamear(.6); anel(centroMundo[0], CHAO + KZ * P.Z + 6, 30, 140, 900, .7);
        yield* tw({ rola: 2.9, pose: 1, pedal: .6, cRoll: -22 }, 520, eio);
        salpicar(centroMundo[0] + 30, CHAO + KZ * P.Z, 7, .9, 70); enlamear(.6);
        P.lamaCab = 1; P.lamaCabIdade = 0;
      }
      yield* tw(Object.assign({}, DEITADO, { olhos: .5, feliz: .7 }), 600, eio);
      yield* tw({ olhos: 1, feliz: .3 }, 300);
    }
    function* pedalar() {                   // de barriga para o ar, mexe as patas no ar
      yield* tw({ pedal: 1, feliz: .7, olhos: .3 }, 300);
      yield* durante(2200, u => { P.cRoll = DEITADO.cRoll + 5 * Math.sin(u * PI * 4); P.cauVel = 1.6; });
      yield* tw({ pedal: DEITADO.pedal, feliz: .3, olhos: 1, cRoll: DEITADO.cRoll, cauVel: CAUDA_0.cauVel }, 400);
    }
    function* suspirar() {                  // um suspiro de contente, olhos fechados
      yield* tw({ olhos: .1, feliz: .8, sorriso: 1, orelhas: -10 }, 500);
      yield* durante(1600, u => { P.respA = 1 + 3.5 * sino(u); P.jig = .8 * sino(u); });
      yield* tw({ olhos: 1, feliz: .3, orelhas: 0 }, 600);
    }
    function* soprarBolhas() {              // mete o focinho na lama e sopra bolhas
      yield* tw({ cBaixa: 16, cB: 28, cRoll: -6, olhos: .6 }, 500);
      for (let i = 0; i < 3; i++) {
        impulso('foc', 1, 240, 'mola');
        bolha(pontaMundo[0] + aleat(-6, 6), Math.max(pontaMundo[1] + 4, CHAO + KZ * P.Z + 6), aleat(6, 10));
        yield* espera(380);
      }
      yield* tw({ cBaixa: DEITADO.cBaixa, cB: DEITADO.cB, cRoll: DEITADO.cRoll, olhos: 1, feliz: .6 }, 500);
      impulso('twE', 22, 380); impulso('twD', 22, 380);
      yield* tw({ feliz: .3 }, 300);
    }
    function* cicloDentro() {
      for (;;) {
        yield* espera(aleat(900, 2000));
        const r = Math.random();
        if (r < .3) yield* rebolar();
        else if (r < .55) yield* pedalar();
        else if (r < .8) yield* suspirar();
        else yield* soprarBolhas();
      }
    }
    function* reacaoDentro() {              // contente: abana-se na lama, patas a pedalar depressa, orelhas a bater
      impulso('flick', 32, 700, 'onda');
      yield* tw({ feliz: 1, olhos: 1, sobr: .8, sorriso: 1, boca: .3, pedal: 1.4, orelhas: 16, olhoEsc: 1.06 }, 100, esai);
      yield* durante(700, u => {
        P.rola = DEITADO.rola + .28 * Math.sin(u * PI * 4) * (1 - u * .5); P.cRoll = DEITADO.cRoll + 8 * Math.sin(u * PI * 4);
        if (u > .2 && Math.random() < .25) salpicar(centroMundo[0] + aleat(-120, 120), CHAO + KZ * P.Z, 1, .7, 20);
      });
      enlamear(.3);
      yield* tw(Object.assign({}, DEITADO, { feliz: .4, boca: 0, sobr: 0, olhoEsc: 1, orelhas: 0 }), 600, eio);
    }

    /* --- ida à lama: vira-se (a cabeça primeiro), vai a trote, entra na lama, deita-se e rebola-se --- */
    function* idaLama() {
      modo = 'indo'; reagindo = false;
      olhar.foco = () => [LAMA.cx, LAMA.cy - 40]; olhar.rapido = true;
      yield* juntos(recomporPes(150), tw(Object.assign({}, ROSTO0, CORPO0, CAUDA_0, { cTurn: -1.1, orelhas: 10, feliz: .3 }), 200, esai));
      yield* juntos(virar(TH_IDA, 650), tw({ cTurn: 0 }, 650));
      olhar.foco = null; olhar.rapido = false;
      yield* juntos(andar(HAB.X, HAB.Z, 1150), tw({ cB: 10, cauVel: 1.6, cauAmp: 1.6 }, 1150));
      // deita-se: dobra as patas, a barriga assenta na lama (splash)
      yield* tw({ alt: DEITADO.alt, cB: 12, olhos: .8, jig: .5 }, 380, eentra);
      salpicar(centroMundo[0], CHAO + KZ * P.Z, 14, 1.1, 90); anel(centroMundo[0], CHAO + KZ * P.Z + 6, 30, 170, 1100, .9); anel(centroMundo[0], CHAO + KZ * P.Z + 6, 20, 110, 900, .7, 160);
      P.lamaPes = 1; P.lamaPesSeca = 0;
      impulso('twE', 26, 400); impulso('twD', 26, 400);
      // rebola-se para o lado de lá e fica de barriga para o ar
      yield* tw({ solto: 1, rola: 1.2, pose: .3, jig: 0, feliz: .8, olhos: .3, cTurn: .7, cRoll: -8 }, 380, eio);
      salpicar(centroMundo[0] - 30, CHAO + KZ * P.Z, 8, .9, 80); enlamear(.5);
      yield* tw({ rola: 2.75, pose: 1, pedal: .9, cTurn: DEITADO.cTurn, cRoll: -22, cBaixa: DEITADO.cBaixa }, 420, eio);
      salpicar(centroMundo[0] + 30, CHAO + KZ * P.Z, 8, .9, 80); enlamear(.6); P.lamaCab = 1; P.lamaCabIdade = 0;
      yield* tw(Object.assign({}, DEITADO, { feliz: .8, olhos: .4, cauVel: 1.2 }), 350, eio);
      modo = 'dentro';
      yield* tw({ feliz: .3, olhos: 1, cauVel: CAUDA_0.cauVel, cauAmp: 1 }, 150);   // curto: a ida fica abaixo dos 4 s mesmo a meio de um passo
    }
    /* --- volta: rebola para ficar de pé, sacode a lama, vira-se e volta a trote --- */
    function* voltaLama() {
      modo = 'voltando'; reagindo = false;
      assentarPes();
      yield* tw({ rola: 0, pose: 0, pedal: 0, cTurn: .2, cRoll: 0, cBaixa: 0, cB: 8, olhos: 1, feliz: 0, boca: 0 }, 340, eio);
      salpicar(centroMundo[0], CHAO + KZ * P.Z, 8, .9, 80);
      yield* tw({ solto: 0, alt: 0, jig: .6 }, 280, esai);
      P.molhado = 1;
      yield* durante(360, u => {
        P.rola = .16 * Math.sin(u * PI * 6) * sino(u); P.lat = 3 * Math.sin(u * PI * 6) * sino(u); P.cRoll = 10 * Math.sin(u * PI * 6 + .6) * sino(u); P.orelhas = 20 * sino(u);
        P.jig = Math.sin(u * PI * 6 + 1) * sino(u);
        if (Math.random() < .55) salpicar(centroMundo[0] + aleat(-130, 130), centroMundo[1] - aleat(0, 70), 1, .8, 10);
      });
      P.rola = 0; P.lat = 0; P.jig = 0;
      yield* juntos(virar(TH_VOLTA, 440), tw(Object.assign({}, CORPO0, ROSTO0, { cTurn: .3 }), 480));
      yield* andar(REP.X, REP.Z, 880);
      yield* juntos(virar(REP.th, 360), tw(Object.assign({}, CORPO0, ROSTO0, CAUDA_0), 360));
      P.th = REP.th;
      yield* recomporPes(140);
      modo = 'fora';
    }

    /* --- som: «oinc oinc» — a boca abre e o focinho empurra-se uma vez por sílaba --- */
    function* somOinc(ms, silabas) {
      let lista = Array.isArray(silabas) && silabas.length ? silabas : null;
      if (!lista) { const k = Math.max(1, Math.round(ms / 450)), d = ms / 1000 / k; lista = Array.from({ length: k }, (_, i) => [i * d, d * .75]); }
      const fim = Math.max(ms / 1000, ...lista.map(([a, d]) => a + d));
      let t = 0;
      for (const [a, d] of lista) {
        if (a > t) yield* espera((a - t) * 1000);
        impulso(Math.random() < .5 ? 'twE' : 'twD', 16, 260);
        yield* durante(limita(d * 1000, 140, 1600), u => { const s = Math.pow(sino(u), .6); P.somB = .6 * s; P.somF = 1.1 * s; P.somR = -5 * Math.sin(u * PI); });
        t = a + d;
      }
      P.somB = 0; P.somF = 0; P.somR = 0;
      if (fim > t) yield* espera((fim - t) * 1000);
    }

    /* --- cenário vivo e acontecimentos raros --- */
    const abelhas = [0, 1].map(i => ({ pos: [i ? 900 : 200, 480], cx: i ? 890 : 210, cy: 500, rx: i ? 90 : 170, ry: 40, f: i * 2.1, v: i ? .55 : .42, evento: false }));
    function animarAbelha(i, dt) {
      const a = abelhas[i];
      if (a.evento) return;
      a.f += dt / 1000 * a.v * calma;
      const x = a.cx + a.rx * Math.sin(a.f) + 14 * Math.sin(a.f * 5.3), y = a.cy + a.ry * Math.sin(a.f * 2) + 8 * Math.sin(a.f * 7.1);
      const dir = Math.cos(a.f) >= 0 ? 1 : -1;
      a.pos = [x, y];
      poe(R.abelhas[i], `translate(${n(x)},${n(y)})`); poe(R.abelhaIn[i], `scale(${dir},1)`);
      poe(R.abelhaAsas[i], `scale(1,${n3(.3 + .7 * Math.abs(Math.sin(tempo * .09 + i)))})`);
    }
    function animarCena(dt) {
      const t = tempo / 1000;
      R.nuvens.forEach((g, i) => {
        const v = [5, 3.5, 4.4, 2.8][i], y = [128, 216, 300, 170][i], x0 = [460, 1060, 1360, 760][i];
        const x = -240 + ((x0 + 240 + t * v * calma) % 2080);
        poe(g, `translate(${n(x)},${y})`);
      });
      const ciclo = (t * calma + 20) % 52, xb = -60 + ciclo * 38;
      R.aves.forEach((g, i) => {
        const x = xb - i * 30, y = 330 + i * 12 + Math.sin(t * 1.3 + i) * 4;
        poe(g, `translate(${n(x)},${n(y)}) scale(${n3(.8 + .2 * Math.sin(t * 3 + i))},${n3(.5 + .6 * Math.abs(Math.sin(t * 4.6 + i * .7)))})`);
      });
      const vento = .6 + .4 * Math.sin(t * .31);
      R.gir.forEach((g, i) => poe(g, `rotate(${n3((1.6 * Math.sin(t * .8 + i * .9) + .8 * Math.sin(t * 1.9 + i * 2)) * vento * calma)})`));
      R.girCab.forEach((g, i) => { const c = GIRASSOIS[i]; poe(g, `translate(${n(g.__hx == null ? (g.__hx = Number(g.getAttribute('transform').match(/translate\(([-\d.]+)/)[1])) : g.__hx)},${-c[2]}) rotate(${n3(3 * Math.sin(t * .6 + i))}) scale(${n3(c[4] + .04 * Math.sin(t * .4 + i * 1.3))},1)`); });
      R.tufos.forEach((g, i) => poe(g, `rotate(${n3((3 * Math.sin(t * 1.1 + i * .9) + 1.4 * Math.sin(t * 2.3 + i * 2)) * vento * calma)})`));
      R.ervas.forEach((g, i) => poe(g, `rotate(${n3((2.4 * Math.sin(t * 1.0 + i * .9) + 1.2 * Math.sin(t * 2.2 + i * 2)) * vento * calma)})`));
      // cata-vento: vira devagar com o vento (a seta encurta quando aponta para nós)
      const ang = 1.2 * Math.sin(t * .13) + .5 * Math.sin(t * .37);
      poe(R.cata, `scale(${n3(Math.cos(ang))},1)`);
      // reflexos a tremeluzir na lama
      const bx = n(3 * Math.sin(t * .7)), bo = n3(.35 + .15 * Math.sin(t * 1.5));
      R.brilhos.forEach(g => { poe(g, `translate(${bx},0)`); atr(g, 'opacity', bo); });
      animarAbelha(0, dt); animarAbelha(1, dt);
      poe(R.poste, `rotate(${n3(postePuxa)},${POSTE.x},${POSTE.y})`);
    }
    const eventos = { prox: aleat(12000, 20000), ultimo: null };
    function iniciarEvento(tipo) {
      const ev = { tipo, x: -100, y: -100, vivo: true };
      ev.pos = () => [ev.x, ev.y];
      const gen = { borboleta: evBorboleta, abelha: evAbelha }[tipo](ev);
      lancar('evento', gen, () => { ev.vivo = false; });
      if (modo === 'fora' && !reagindo) lancar('corpo', observar(ev), () => lancar('corpo', cicloFora()));
      else if (modo === 'dentro') { impulso('twE', 20, 400); impulso('twD', 18, 400); olhar.foco = ev.pos; }
    }
    function atualizarEventos(dt) {
      if (faixas.has('evento')) return;
      eventos.prox -= dt;
      if (eventos.prox > 0) return;
      eventos.prox = aleat(15000, 40000);
      if (modo !== 'fora' && modo !== 'dentro') { eventos.prox = 3000; return; }
      const lista = modo === 'fora' ? ['borboleta', 'abelha'] : ['abelha'];   // a borboleta pousa no focinho: só cá fora
      let tipo; do tipo = escolhe(lista); while (tipo === eventos.ultimo && lista.length > 1 && Math.random() < .7);
      eventos.ultimo = tipo;
      iniciarEvento(tipo);
    }
    function* observar(ev) {
      reagindo = false;
      yield* recompor(320);
      olhar.foco = ev.pos;
      yield* tw({ orelhas: 10, olhoEsc: 1.05 }, 260, esai);
      let t = 0, prox = 900, espirrou = false;
      while (ev.vivo && t < 16000) {
        t += yield;
        if (ev.pousada) { olhar.cabeca = false; P.olharX += (-Y_vesgo() - P.olharX) * .2; }
        if (ev.espirro && !espirrou) {
          espirrou = true;
          yield* tw({ olhos: .2, focoS: .6, narinas: 1, cB: -14, sobr: .9 }, 260, eentra);
          impulso('cabR', -14, 360, 'mola'); impulso('twE', 34, 420); impulso('twD', 34, 420); impulso('foc', 2, 420, 'mola');
          for (let i = 0; i < 5; i++) poeira(pontaMundo[0] + aleat(-6, 6), pontaMundo[1], aleat(-120, 120), aleat(-60, 20), aleat(5, 8), 600);
          yield* tw({ olhos: 1, focoS: 0, narinas: 0, cB: CORPO0.cB, sobr: 0 }, 300, esai);
          olhar.cabeca = true;
        }
        if (t > prox) { prox = t + aleat(1000, 1900); if (Math.random() < .5) impulso('flick', 26, 700, 'onda'); impulso(Math.random() < .5 ? 'twE' : 'twD', 20, 360); }
      }
      olhar.foco = null; olhar.cabeca = true;
      yield* tw(Object.assign({}, ROSTO0, { olhoEsc: 1 }), 500);
    }
    const Y_vesgo = () => 0;               // os dois olhos olham para o focinho (ficam no meio)
    function* evBorboleta(ev) {             // uma borboleta branca dá voltas, pousa no focinho e o porco espirra
      const g = R.bb;
      atr(g, 'display', 'inline');
      const asas = (tt, rapido) => { const k = rapido ? Math.abs(Math.cos(tt * .03)) : .35 + .65 * Math.abs(Math.cos(tt * .004)); poe(R.bbE, `scale(${n3(.15 + .85 * k)},1)`); poe(R.bbD, `scale(${n3(.15 + .85 * k)},1)`); };
      const ini = [250, 330];
      yield* durante(4200, (u, tt) => {
        const c = cabMundo, pts = [ini, [380, 400], [c[0] - 130, c[1] - 120], [c[0] + 60, c[1] - 160], [c[0] + 110, c[1] - 30], [pontaMundo[0] - 30, pontaMundo[1] - 50]];
        const [x, y] = catmull(pts, u);
        ev.x = x + 8 * Math.sin(tt * .01); ev.y = y + 10 * Math.sin(tt * .013);
        poe(g, `translate(${n(ev.x)},${n(ev.y)}) rotate(${n(14 * Math.sin(tt * .006))})`); asas(tt, true);
      });
      const de = [ev.x, ev.y];
      yield* durante(600, (u, tt) => { const a = [pontaMundo[0], pontaMundo[1] - 14]; ev.x = lerp(de[0], a[0], eseno(u)); ev.y = lerp(de[1], a[1], eseno(u)) - 10 * sino(u); poe(g, `translate(${n(ev.x)},${n(ev.y)})`); asas(tt, true); });
      ev.pousada = true;
      yield* durante(1800, (u, tt) => { ev.x = pontaMundo[0]; ev.y = pontaMundo[1] - 14; poe(g, `translate(${n(ev.x)},${n(ev.y)})`); asas(tt, false); });
      ev.pousada = false; ev.espirro = true;
      yield* espera(260);
      const de2 = [ev.x, ev.y];
      yield* durante(2400, (u, tt) => { ev.x = lerp(de2[0], de2[0] - 480, eentra(u)) + 30 * Math.sin(u * 9); ev.y = lerp(de2[1], 120, u); poe(g, `translate(${n(ev.x)},${n(ev.y)})`); asas(tt, true); });
      atr(g, 'display', 'none');
    }
    function* evAbelha(ev) {                // uma abelha deixa os girassóis e vem zumbir à volta da cabeça do porco
      const i = Math.random() < .5 ? 0 : 1, a = abelhas[i];
      a.evento = true;
      const de = a.pos.slice();
      const voo = (u, tt, pts) => { const [x, y] = catmull(pts, u); ev.x = x + 6 * Math.sin(tt * .02); ev.y = y + 6 * Math.sin(tt * .027); a.pos = [ev.x, ev.y];
        poe(R.abelhas[i], `translate(${n(ev.x)},${n(ev.y)})`); poe(R.abelhaAsas[i], `scale(1,${n3(.3 + .7 * Math.abs(Math.sin(tt * .09)))})`); };
      yield* durante(5200, (u, tt) => {
        const c = cabMundo;
        voo(u, tt, [de, [c[0] - 140, c[1] - 140], [c[0] + 90, c[1] - 120], [c[0] + 110, c[1] + 10], [c[0] - 60, c[1] - 60], [c[0] - 10, c[1] - 150], [c[0] + 160, c[1] - 90], de]);
        poe(R.abelhaIn[i], `scale(${Math.cos(tt * .004) > 0 ? 1 : -1},1)`);
      });
      a.evento = false;
    }

    /* --- relógio único --- */
    let erroMostrado = false;
    function passo(dt) {
      if (!vivo) return;
      try {
        dt = Math.min(dt, 50);
        tempo += dt;
        fase.resp += dt / 1000 * TAU * P.respF;
        fase.cauda += dt / 1000 * TAU * P.cauVel;
        fase.pedal += dt / 1000 * TAU * .9 * (1 + P.pedal);
        atualizarImpulsos(dt);
        atualizarPiscar(dt);
        atualizarTiques(dt);
        for (const nome of Array.from(faixas.keys())) avancar(nome, dt);
        atualizarOlhar(dt);
        atualizarEventos(dt);
        // o corpo afunda na lama (deitado mais, de pé tanto como os cascos)
        const alvoAf = P.solto > .3 || P.alt < -20 ? prof(P.X, P.Z) * .9 : pes.reduce((s, f) => s + prof(f.x, f.z), 0) / pes.length * .6;
        P.afunda += (alvoAf - P.afunda) * (1 - Math.exp(-dt / 160));
        // a lama seca ao sol e vai caindo; dentro da lama fica sempre molhada
        const naLama = P.afunda > 4;
        for (const m of manchas) {
          if (m.alfa <= 0) continue;
          if (naLama && modo !== 'voltando') { m.idade = 0; continue; }
          m.idade += dt;
          if (m.idade > 15000 && modo === 'fora') m.alfa = Math.max(0, m.alfa - dt / 10000);
        }
        if (naLama) { P.lamaCabIdade = 0; P.lamaPesSeca = 0; }
        else {
          P.lamaCabIdade += dt; P.molhado = Math.max(0, P.molhado - dt / 6000);
          if (P.lamaCabIdade > 15000 && modo === 'fora') P.lamaCab = Math.max(0, P.lamaCab - dt / 10000);
          P.lamaPesSeca = Math.min(1, P.lamaPesSeca + dt / 9000);
          if (P.lamaPesSeca >= 1 && modo === 'fora') P.lamaPes = Math.max(0, P.lamaPes - dt / 16000);
        }
        if (modo === 'fora') P.terra = Math.max(0, P.terra - dt / 20000);
        animarCena(dt);
        atualizarAneis(dt);
        atualizarGotas(dt);
        atualizarSalpicos(dt);
        atualizarPoeira(dt);
        atualizarMilho(dt);
        atualizarBolhas(dt);
        desenhar();
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    lancar('corpo', cicloFora());
    desenhar();

    return {
      animal: R.porco,
      habitat: R.habitat,
      reagir() {
        if (!vivo) return;
        if (modo === 'fora') lancar('corpo', reacaoFora(), () => { reagindo = false; lancar('corpo', cicloFora()); });
        else if (modo === 'dentro') lancar('corpo', reacaoDentro(), () => lancar('corpo', cicloDentro()));
        else { impulso('twE', 20, 300); impulso('twD', 20, 300); }
      },
      fazerSom(ms, silabas) {
        if (!vivo) return;
        lancar('boca', somOinc(limita(ms || 900, 200, 4000), silabas));
      },
      irAoHabitat() {
        return new Promise(res => {
          if (!vivo || modo !== 'fora') { res(); return; }
          lancar('corpo', idaLama(), () => { res(); lancar('corpo', cicloDentro()); });
        });
      },
      voltar() {
        return new Promise(res => {
          if (!vivo || modo !== 'dentro') { res(); return; }
          lancar('corpo', voltaLama(), () => { res(); lancar('corpo', cicloFora()); });
        });
      },
      destruir() {
        vivo = false;
        faixas.clear();
        impulsos.length = 0;
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola (modo de desenvolvimento)
      _teste: { P, pes, manchas, modo: () => modo, evento: iniciarEvento, comportamento: nome => lancar('corpo', COMPORTAMENTOS[nome](), () => lancar('corpo', cicloFora())),
        dentro: nome => lancar('corpo', ({ rebolar, pedalar, suspirar, soprarBolhas })[nome](), () => lancar('corpo', cicloDentro())),
        parar: () => lancar('corpo', (function* () { for (;;) yield; })()), desenhar, cab: () => cabMundo, ponta: () => pontaMundo, boca: () => bocaMundo }
    };
  }

  return { icone: iconeSVG(), montar };
})();
