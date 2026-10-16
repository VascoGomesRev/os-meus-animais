/* Girafa — «Os Meus Animais». Contrato e regras: REGRAS-ANIMAIS.md.
   Cena: a savana africana ao fim da tarde (sol baixo, à esquerda): monte nevado e colinas azuis ao longe,
   acácias distantes, zebras e um elefante muito ao longe, termiteira, rochas, erva dourada a ondular.
   Habitat: uma acácia alta de copa achatada. A girafa vai lá comer: estica o pescoço, mete a cabeça entre
   as folhas (camadas: ramos e folhas de trás → girafa → folhas da frente), enrola a língua num raminho e puxa.
   A girafa é um boneco «2,5D»: o tronco é um perfil projetado (estreita quando se vira para nós, enquanto
   aparece o peito de frente), o pescoço tem 7 segmentos com a pelagem contínua, as 4 patas têm IK no plano
   da pata e os pés ficam presos ao chão (anda «a passo travado»: as duas patas do mesmo lado quase juntas).
   Organização: 1) utilidades  2) medidas  3) pelagem (manchas)  4) desenho da girafa  5) cenário e acácia
                6) ícone  7) montar(): estado, desenho por quadro, tarefas, comportamentos, idas e voltas */
'use strict';
MODULOS.girafa = (() => {
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
  const pts2d = l => l.map(p => n(p[0]) + ',' + n(p[1])).join(' ');

  /* ================= 2) Medidas da girafa (unidades da girafa; no ecrã × ESC) ================= */
  const ESC = .9;                 // escala da girafa no cenário
  const KZ = .16;                 // quanto a profundidade (z) desce no ecrã: vista ligeiramente de cima
  const CHAO = 786;               // y do chão (profundidade 0) onde a girafa pousa os cascos (no telemóvel vê-se até ~810)
  const HC = 322;                 // altura do centro do tronco
  const N_PESC = 7, LS = 38;      // pescoço: segmentos e comprimento de cada um
  const WN = [86, 74, 65, 58, 52, 47, 43, 40];        // largura do pescoço em cada articulação
  const PESC0 = { u: 100, h: 366 };                   // base do pescoço (à frente da cernelha)
  const CAUDA0 = { u: -144, h: 372 };
  const NCA = 5, LCA = 19, WCA = [11, 9.5, 8.5, 7.5, 6.5];
  const TORNOZELO = 24;           // altura do boleto (o casco fica por baixo)
  // patas: lado 1 = esquerda (virada para nós quando a girafa olha para a direita); dobra 1 = joelho para a frente
  const PERNAS = [
    { id: 'tE', fr: 0, lado: 1, u: -96, v: 21, h: 302, L1: 146, L2: 136, pu: -98, dobra: -1 },
    { id: 'fE', fr: 1, lado: 1, u: 82, v: 21, h: 276, L1: 130, L2: 128, pu: 86, dobra: 1 },
    { id: 'tD', fr: 0, lado: -1, u: -96, v: -21, h: 302, L1: 146, L2: 136, pu: -98, dobra: -1 },
    { id: 'fD', fr: 1, lado: -1, u: 82, v: -21, h: 276, L1: 130, L2: 128, pu: 86, dobra: 1 }
  ];
  const COR = {
    cont: '#5A2C12', rede: '#F6DEAA', redeS: '#E2BD7F', crina: '#8C4A1C', crinaE: '#5C2C10', casco: '#3B2820',
    cab: '#EDBE74', foc: '#F6E0B6', lingua: '#4E3A78', tufo: '#3A2216'
  };

  /* ================= 3) Pelagem: manchas reticuladas (células de Voronoi com uma rede clara entre elas) ================= */
  function cortaPoligono(poly, mx, my, nx, ny) {      // fica com a parte em que (p − m)·n ≤ 0
    const out = [];
    for (let k = 0; k < poly.length; k++) {
      const a = poly[k], b = poly[(k + 1) % poly.length];
      const da = (a[0] - mx) * nx + (a[1] - my) * ny, db = (b[0] - mx) * nx + (b[1] - my) * ny;
      if (da <= 0) out.push(a);
      if ((da <= 0) !== (db <= 0)) { const t = da / (da - db); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    return out;
  }
  function celulas(sitios, caixa, folga) {
    return sitios.map((s, i) => {
      let poly = caixa.slice();
      for (let j = 0; j < sitios.length && poly.length; j++) {
        if (j === i) continue;
        const o = sitios[j], nx = o[0] - s[0], ny = o[1] - s[1], L = Math.hypot(nx, ny) || 1;
        if (L > 160) continue;
        poly = cortaPoligono(poly, (s[0] + o[0]) / 2 - nx / L * folga / 2, (s[1] + o[1]) / 2 - ny / L * folga / 2, nx, ny);
      }
      return poly;
    }).filter(p => p.length > 2);
  }
  function arredondado(poly) {                        // polígono com os cantos arredondados (curvas pelos meios das arestas)
    const m = poly.length;
    const meio = k => { const a = poly[k], b = poly[(k + 1) % m]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
    const s = meio(m - 1);
    let d = `M${n(s[0])},${n(s[1])}`;
    for (let k = 0; k < m; k++) { const v = poly[k], q = meio(k); d += `Q${n(v[0])},${n(v[1])} ${n(q[0])},${n(q[1])}`; }
    return d + 'Z';
  }
  function grelha(x0, y0, x1, y1, passo, rnd, jit = .36) {
    const s = []; let lin = 0;
    for (let y = y0; y <= y1 + 1e-6; y += passo * .86, lin++)
      for (let x = x0 + (lin % 2 ? passo / 2 : 0); x <= x1 + passo * .5; x += passo)
        s.push([x + (rnd() - .5) * passo * jit * 2, y + (rnd() - .5) * passo * jit * 2]);
    return s;
  }
  function manchas(cel, p, filtro) {
    return cel.filter(c => !filtro || filtro(c)).map((c, i) => `<path d="${arredondado(c)}" fill="url(#${p}m${i % 3})"/>`).join('');
  }
  const caixaDe = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

  /* ================= 4) Desenho da girafa ================= */
  function defsGirafa(p) {
    return `
    <radialGradient id="${p}m0" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#D98A42"/><stop offset=".6" stop-color="#BF6A2C"/><stop offset="1" stop-color="#9C4F1E"/></radialGradient>
    <radialGradient id="${p}m1" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#CF7C38"/><stop offset=".6" stop-color="#B15E26"/><stop offset="1" stop-color="#8E461A"/></radialGradient>
    <radialGradient id="${p}m2" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#DE9550"/><stop offset=".6" stop-color="#C77434"/><stop offset="1" stop-color="#A65A24"/></radialGradient>
    <linearGradient id="${p}rede" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCEBC2"/><stop offset=".55" stop-color="#F3D9A2"/><stop offset="1" stop-color="#DDB877"/></linearGradient>
    <linearGradient id="${p}luzV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6DC" stop-opacity=".34"/><stop offset=".3" stop-color="#FFF6DC" stop-opacity="0"/><stop offset=".62" stop-color="#4A2008" stop-opacity="0"/><stop offset="1" stop-color="#4A2008" stop-opacity=".34"/></linearGradient>
    <linearGradient id="${p}luzH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF6DC" stop-opacity=".22"/><stop offset=".35" stop-color="#FFF6DC" stop-opacity="0"/><stop offset=".75" stop-color="#4A2008" stop-opacity="0"/><stop offset="1" stop-color="#4A2008" stop-opacity=".2"/></linearGradient>
    <linearGradient id="${p}pescLuz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6DC" stop-opacity=".3"/><stop offset=".3" stop-color="#FFF6DC" stop-opacity="0"/><stop offset=".66" stop-color="#4A2008" stop-opacity="0"/><stop offset="1" stop-color="#4A2008" stop-opacity=".26"/></linearGradient>
    <linearGradient id="${p}perna" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9B57A"/><stop offset=".45" stop-color="#FBEBC8"/><stop offset="1" stop-color="#E2C48C"/></linearGradient>
    <radialGradient id="${p}joelho" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFF2D6"/><stop offset="1" stop-color="#DDBC84"/></radialGradient>
    <linearGradient id="${p}casco" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6A4C3C"/><stop offset=".6" stop-color="#3B2820"/><stop offset="1" stop-color="#241610"/></linearGradient>
    <radialGradient id="${p}cab" gradientUnits="userSpaceOnUse" cx="-18" cy="-24" r="80"><stop offset="0" stop-color="#FBD99E"/><stop offset=".55" stop-color="#EDBE74"/><stop offset="1" stop-color="#D89E55"/></radialGradient>
    <radialGradient id="${p}foc" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#FFF6E2"/><stop offset=".65" stop-color="#F5DFB2"/><stop offset="1" stop-color="#DFBE86"/></radialGradient>
    <radialGradient id="${p}iris" cx=".42" cy=".38" r=".65"><stop offset="0" stop-color="#8A5A34"/><stop offset=".45" stop-color="#5A3218"/><stop offset="1" stop-color="#22110A"/></radialGradient>
    <linearGradient id="${p}orelhaIn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E9A98E"/><stop offset="1" stop-color="#FBD9C2"/></linearGradient>
    <linearGradient id="${p}orelha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7D18F"/><stop offset="1" stop-color="#D99E57"/></linearGradient>
    <radialGradient id="${p}tufo" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#7A5236"/><stop offset=".6" stop-color="#3E2618"/><stop offset="1" stop-color="#22130B"/></radialGradient>
    <linearGradient id="${p}lingua" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6A55A0"/><stop offset="1" stop-color="#33255A"/></linearGradient>
    <radialGradient id="${p}sombra"><stop offset="0" stop-color="#4A2A0C" stop-opacity=".46"/><stop offset=".6" stop-color="#4A2A0C" stop-opacity=".22"/><stop offset="1" stop-color="#4A2A0C" stop-opacity="0"/></radialGradient>
    <clipPath id="${p}clip-tronco"><path d="${TRONCO}"/></clipPath>
    <clipPath id="${p}clip-peito"><ellipse rx="72" ry="84"/></clipPath>
    <clipPath id="${p}clip-pfs"><path d="${PERNA_SUP_F}"/></clipPath>
    <clipPath id="${p}clip-pts"><path d="${PERNA_SUP_T}"/></clipPath>
    <clipPath id="${p}clip-cranio"><ellipse cx="0" cy="0" rx="43" ry="45"/></clipPath>
    <clipPath id="${p}clip-olho"><ellipse rx="13.5" ry="16"/></clipPath>
    ${Array.from({ length: N_PESC }, (_, i) => `<clipPath id="${p}clip-pc${i}"><path d="${trapPesc(i, 0)}"/></clipPath>`).join('')}`;
  }

  /* --- Tronco de perfil (local: u para a frente, y para baixo, origem no centro do tronco a HC de altura) --- */
  const TRONCO = 'M-150,-6 C-152,-46 -126,-66 -96,-66 C-56,-66 -8,-78 40,-94 C84,-108 120,-94 134,-60 C148,-28 146,20 126,50 C110,72 86,82 58,80 C26,78 -6,70 -40,70 C-80,70 -112,66 -134,46 C-148,32 -150,14 -150,-6 Z';
  function troncoSVG(p) {
    const rnd = semente(21);
    const cel = celulas(grelha(-170, -122, 160, 100, 41, rnd), caixaDe(-200, -150, 190, 130), 6);
    return `<g class="gr-troncoR">
      <path d="${TRONCO}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="9" stroke-linejoin="round"/>
      <path d="${TRONCO}" fill="url(#${p}rede)"/>
      <g clip-path="url(#${p}clip-tronco)">${manchas(cel, p)}
        <path d="${TRONCO}" fill="url(#${p}luzV)"/>
        <path d="M-130,-52 C-90,-70 -30,-74 40,-96 C80,-108 112,-100 126,-80" stroke="#FFF3D2" stroke-width="7" fill="none" opacity=".35" stroke-linecap="round"/>
        <path d="M-120,58 C-70,80 20,86 120,60 L130,110 L-130,110 Z" fill="#4A2008" opacity=".14"/>
        <path d="M-142,10 C-140,40 -120,58 -96,64" stroke="#4A2008" stroke-width="5" fill="none" opacity=".18" stroke-linecap="round"/>
      </g>
    </g>`;
  }
  // peito visto de frente: só aparece a meio das viragens (enquanto o perfil do tronco estreita)
  function peitoSVG(p) {
    const rnd = semente(33);
    const cel = celulas(grelha(-90, -100, 90, 100, 38, rnd), caixaDe(-100, -110, 100, 110), 5.5);
    return `<ellipse rx="72" ry="84" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="9"/>
      <ellipse rx="72" ry="84" fill="url(#${p}rede)"/>
      <g clip-path="url(#${p}clip-peito)">${manchas(cel, p)}<ellipse rx="72" ry="84" fill="url(#${p}luzH)"/><ellipse rx="72" ry="84" fill="url(#${p}luzV)"/></g>`;
  }

  /* --- Pescoço: 7 segmentos com o padrão de um só «pescoço desenrolado» (as manchas continuam de um segmento para o outro) --- */
  const RP = U => { const k = limita(U / LS, 0, N_PESC), i = Math.min(N_PESC - 1, Math.floor(k)); return lerp(WN[i], WN[i + 1], k - i) / 2; };
  function trapPesc(i, e) {   // segmento i no seu referencial (de 0 a LS ao longo de x), alargado e unidades
    const a = WN[i] / 2 + e, b = WN[i + 1] / 2 + e, x0 = -5, x1 = LS + 5;
    if (i === 0) return `M10,${-a} L${x1},${-b} L${x1},${b} L10,${a} C${-14 - e},${n(a * .7)} ${-18 - e},${n(-a * .7)} 10,${-a} Z`;
    return `M${x0},${-a} L${x1},${-b} L${x1},${b} L${x0},${a} Z`;
  }
  const PESC_CEL = (() => {
    const rnd = semente(57), s = [];
    let lin = 0;
    for (let U = -10; U <= N_PESC * LS + 20; U += 27, lin++) {
      const r = RP(U), k = lin % 2;
      s.push([U + (rnd() - .5) * 8, (k ? -.52 : -.12) * r + (rnd() - .5) * 8]);
      s.push([U + 13 + (rnd() - .5) * 8, (k ? .12 : .52) * r + (rnd() - .5) * 8]);
      if (r > 30) s.push([U + (rnd() - .5) * 6, (k ? .62 : -.75) * r]);
    }
    return celulas(s, caixaDe(-30, -60, N_PESC * LS + 40, 60), 5);
  })();
  function crinaPath() {      // tufos curtos e rijos ao longo do segmento
    let d = '';
    for (let x = -7; x < LS + 7; x += 6.5) d += `M${n(x)},-4 Q${n(x + 2)},-14 ${n(x + 5)},-13 Q${n(x + 5)},-8 ${n(x + 6.5)},-4 Z`;
    return d + `M-7,-5 L${LS + 7},-5 L${LS + 7},6 L-7,6 Z`;
  }
  function pescocoSVG(p) {
    let cont = '', crina = '', disc = '', fill = '';
    const cr = crinaPath();
    for (let i = 0; i < N_PESC; i++) {
      const x0 = i * LS - 12, x1 = (i + 1) * LS + 12;
      const cel = PESC_CEL.filter(c => c.some(q => q[0] > x0 && q[0] < x1));
      const a = WN[i] / 2, b = WN[i + 1] / 2;
      const contorno = i === 0 ? `M18,${-lerp(a, b, 18 / LS) - 4.5} L${LS + 5},${-b - 4.5} L${LS + 5},${b + 4.5} L18,${lerp(a, b, 18 / LS) + 4.5} Z` : trapPesc(i, 4.5);
      cont += `<g class="gr-pc${i}"><path d="${contorno}" fill="${COR.cont}"/></g>`;
      crina += `<g class="gr-pc${i}"><g class="gr-crina${i}"><path d="${cr}" fill="${COR.crina}" stroke="${COR.crinaE}" stroke-width="1.6" stroke-linejoin="round"/></g></g>`;
      // o 1.º segmento começa com uma tampa redonda dentro do peito, contornada por uma linha clara (parece uma linha da rede)
      const tampa = i === 0 ? `<path d="M10,${-a} C-14,${-a * .7} -18,${a * .7} 10,${a}" fill="none" stroke="${COR.rede}" stroke-width="3.5" stroke-linecap="round" opacity=".85"/>` : '';
      fill += `<g class="gr-pc${i}"><path d="${trapPesc(i, 0)}" fill="url(#${p}rede)"/>
        <g clip-path="url(#${p}clip-pc${i})"><g transform="translate(${-i * LS},0)">${manchas(cel, p)}</g>
        <path d="${trapPesc(i, 0)}" fill="url(#${p}pescLuz)"/>${tampa}</g></g>`;
      if (i > 0) {
        cont += `<g class="gr-pj${i}"><circle r="${WN[i] / 2 + 4.5}" fill="${COR.cont}"/></g>`;
        disc += `<g class="gr-pj${i}"><circle r="${WN[i] / 2}" fill="${COR.rede}"/></g>`;
      }
    }
    return `<g class="gr-pescoco"><g>${cont}</g><g>${crina}</g><g>${disc}</g><g>${fill}</g>
      <g class="gr-bolo" display="none"><ellipse rx="15" ry="11" fill="${COR.cont}"/><ellipse rx="11.5" ry="8" fill="#E9C68A"/></g></g>`;
  }

  /* --- Patas (cada peça desenhada ao longo de +x; contorno primeiro, enchimento depois) --- */
  const PERNA_SUP_F = 'M0,-17 C30,-18 70,-12 130,-10 A10,10 0 0 1 130,10 C70,11 30,15 0,17 C-12,16 -12,-16 0,-17 Z';
  const PERNA_SUP_T = 'M-8,-28 C26,-36 74,-16 146,-9.5 A9.5,9.5 0 0 1 146,9.5 C96,13 46,34 -2,34 C-26,31 -30,-21 -8,-28 Z';
  const capsula = (L, a, b) => `M0,${-a} L${L},${-b} A${b},${b} 0 0 1 ${L},${b} L0,${a} A${a},${a} 0 0 1 0,${-a} Z`;
  const PERNA_INF = (L) => capsula(L, 9.5, 7.5);
  const CASCO = 'M-11,5 L9,5 C14,11 18,19 19,26 C9,29 -6,29 -12,26 C-13,18 -13,11 -11,5 Z';
  function pernaSVG(p, pe) {
    const fr = pe.fr, sup = fr ? PERNA_SUP_F : PERNA_SUP_T, cl = fr ? 'pfs' : 'pts', L1 = pe.L1, L2 = pe.L2;
    const rnd = semente(fr ? 71 : 83);
    const cel = celulas(grelha(-30, -40, L1 * .78, 40, 23, rnd), caixaDe(-40, -50, L1 * .82, 50), 4);
    const k = 'gr-' + pe.id;
    const sombraF = `<path d="${sup}" fill="url(#${p}luzV)"/>`;
    return `<g class="gr-perna ${k}">
      <g class="${k}-sup"><path d="${sup}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="9" stroke-linejoin="round"/></g>
      <g class="${k}-inf"><path d="${PERNA_INF(L2)}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="9"/></g>
      <g class="${k}-joe"><circle r="${fr ? 12.5 : 11.5}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="9"/></g>
      <g class="${k}-casco"><path d="${CASCO}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="8" stroke-linejoin="round"/></g>
      <g class="${k}-bol"><circle r="9.5" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="9"/></g>
      <g class="${k}-sup"><path d="${sup}" fill="url(#${p}rede)"/><g clip-path="url(#${p}clip-${cl})">${manchas(cel, p, c => c.some(q => q[0] < L1 * .7))}${sombraF}</g></g>
      <g class="${k}-inf"><path d="${PERNA_INF(L2)}" fill="url(#${p}perna)"/><path d="M8,-2 L${L2 - 10},-1" stroke="#FFF8E6" stroke-width="3" opacity=".5" stroke-linecap="round"/></g>
      <g class="${k}-joe"><circle r="${fr ? 12.5 : 11.5}" fill="url(#${p}joelho)"/><path d="M-5,-7 C-2,-9 3,-9 6,-6" stroke="#FFFFFF" stroke-width="2.2" fill="none" opacity=".6" stroke-linecap="round"/></g>
      <g class="${k}-casco"><path d="${CASCO}" fill="url(#${p}casco)"/><path d="M-8,8 L6,8" stroke="#8A6A58" stroke-width="2" opacity=".8" stroke-linecap="round"/><path d="M2,9 L3,27" stroke="#1A0E08" stroke-width="1.6" opacity=".6"/></g>
      <g class="${k}-bol"><circle r="9.5" fill="url(#${p}joelho)"/><path d="M-7,5 C-3,8 3,8 7,5" stroke="#C9A36A" stroke-width="2" fill="none"/></g>
    </g>`;
  }
  function sombrasPesSVG(p) {
    return PERNAS.map(pe => `<ellipse class="gr-sp-${pe.id}" rx="24" ry="6" fill="url(#${p}sombra)"/>`).join('');
  }

  /* --- Cauda: segmentos com onda + borla preta --- */
  function caudaSVG(p) {
    let A = '', B = '';
    for (let i = 0; i < NCA; i++) {
      const w = WCA[i], r = `x="${-w / 2}" y="${-w / 2}" width="${LCA + w}" height="${w}" rx="${w / 2}"`;
      A += `<g class="gr-ca${i}"><rect ${r} fill="${COR.cont}" stroke="${COR.cont}" stroke-width="7"/></g>`;
      B += `<g class="gr-ca${i}"><rect ${r} fill="url(#${p}rede)"/>${i % 2 ? `<rect x="3" y="${-w / 2}" width="10" height="${w}" rx="3" fill="#B6622A" opacity=".85"/>` : ''}</g>`;
    }
    const borla = 'M-4,-6 C10,-11 30,-12 44,-5 C52,-1 52,3 44,6 C30,12 10,11 -4,6 C-8,3 -8,-3 -4,-6 Z';
    A += `<g class="gr-ca${NCA}"><path d="${borla}" fill="${COR.cont}" stroke="${COR.cont}" stroke-width="5"/></g>`;
    B += `<g class="gr-ca${NCA}"><path d="${borla}" fill="#2E1A10"/><path d="M4,-3 C18,-6 30,-6 42,-2 M4,2 C18,4 30,4 42,2" stroke="#6A4630" stroke-width="1.6" fill="none" opacity=".8" stroke-linecap="round"/></g>`;
    return A + B;
  }

  /* --- Cabeça: vista de frente cujas feições deslizam com Y = cos(rumo da cabeça)
         (−1 perfil para a esquerda … 0 de frente … 1 perfil para a direita); beta = inclinação do focinho (graus, + para baixo) --- */
  function estadoCabeca(q) {
    const Y = q.Y, aY = Math.abs(Y), b = q.beta * RAD, cb = Math.cos(b), sb = Math.sin(b);
    const t = {}, d = {}, op = {}, a = {};
    const Mx = Y * 50 * cb, My = 8 + 46 * sb;               // centro do focinho
    a.M = [Mx, My];
    const bx = Mx, by = My + 4, bl = Math.hypot(bx, by);
    t.ponte = `translate(0,-4) rotate(${n(Math.atan2(by, bx) / RAD)})`; a.ponteL = n(Math.max(1, bl));
    const rf = Y * q.beta * .7;
    t.foc = `translate(${n(Mx)},${n(My)}) rotate(${n(rf)})`;
    t.queixo = `translate(${n(Mx - Y * 6 + q.mastX)},${n(My + 19 + q.boca * 13 + q.mastY)}) rotate(${n(rf + q.mastX * 1.5)})`;
    t.bocaInt = `translate(${n(Mx + Y * 3 + q.mastX * .5)},${n(My + 15 + q.boca * 6)})`;
    a.bocaRy = n(1 + q.boca * 10); a.bocaRx = n(14 * (1 - .25 * aY));
    // boca (linha do sorriso)
    const c1 = [Mx - 15 * (1 - aY) + aY * (Y > 0 ? -8 : -25), My + 14 - (Y < 0 ? 4 : 0) * aY], c2 = [Mx + 15 * (1 - aY) + aY * (Y > 0 ? 25 : 8), My + 14 - (Y > 0 ? 4 : 0) * aY];
    const cc = [(c1[0] + c2[0]) / 2 + Y * 2, My + 19 + q.sorriso * 3];
    d.boca = `M${n(c1[0])},${n(c1[1])} Q${n(cc[0])},${n(cc[1])} ${n(c2[0])},${n(c2[1])}`;
    a.labio = [c1, c2];
    a.bocaFrente = [Mx + Y * 24 * cb, My + 12 + 6 * sb * aY];
    a.lingua0 = [lerp(cc[0], a.bocaFrente[0], aY), lerp(My + 16, a.bocaFrente[1], aY)];   // a língua sai do meio da boca (de frente) ou do canto da frente (de perfil)
    // feições presas a uma esfera: ângulo = lado (±) + rumo da cabeça (al); x = R·sen(ângulo), visível enquanto cos(ângulo) > 0
    const al = Math.asin(limita(Y, -1, 1)) / RAD;
    const sen = g => Math.sin(g * RAD), cosg = g => Math.cos(g * RAD);
    for (const s of [-1, 1]) {
      const k = s < 0 ? 'E' : 'D';
      // narinas (na frente do focinho)
      const gn = s * 32 + al;
      const x = Mx + 12 * sen(gn) + Y * 12 * cb, y = My - 8 - aY * 3 * cb + aY * 9 * sb;
      t['nar' + k] = `translate(${n(x)},${n(y)}) rotate(${n(s * 25 * (1 - aY) + Y * q.beta * .6)}) scale(${n3((.45 + .55 * Math.max(0, cosg(gn))) * (1 + q.nariz * .35))},${n3(1 + q.nariz * .5)})`;
      op['nar' + k] = n3(passoS(.02, .25, cosg(gn)));
      // olhos e sobrancelhas: o olho do lado para onde a cabeça se vira encolhe e esconde-se na silhueta
      const ge = s * 40 + al, ce = cosg(ge), ex = 33 * sen(ge), sx = .22 + .78 * Math.max(0, ce);
      t['olho' + k] = `translate(${n(ex)},-7) scale(${n3(sx * q.olhoEsc)},${n3(q.olhoEsc)})`;
      op['olho' + k] = ce > .08 ? '1' : '0';
      t['sobr' + k] = `translate(${n(35 * sen(ge + s * 3))},${n(-28 - q.sobr * 5)}) rotate(${n(s * (-8 + q.sobr * 10))}) scale(${n3(sx)},1)`;
      op['sobr' + k] = ce > .12 ? '1' : '0';
      const gc = s * 48 + al;
      t['boch' + k] = `translate(${n(34 * sen(gc))},15) scale(${n3(.3 + .7 * Math.max(0, cosg(gc)))},1)`;
      op['boch' + k] = n3(passoS(.05, .4, cosg(gc)) * .5 * (1 + q.feliz * .6));
      // orelha: nasce ao lado do crânio e aponta para fora e um pouco para trás (direção 3D projetada)
      const go = s * 78 + al, gd = s * 118 + al, oy = -22;
      const ox = 37 * sen(go), dxo = sen(gd), ang = Math.atan2(-.16 - .12 * (1 - aY), dxo) / RAD;
      const up = (s < 0 ? q.oE : q.oD) + q.orelhas;
      t['orelha' + k] = `translate(${n(ox)},${oy}) rotate(${n(ang - Math.cos(ang * RAD) * up)}) scale(${n3(.55 + .45 * Math.min(1, Math.abs(dxo)))},1)`;
      const gs = s * 28 + al;
      t['osso' + k] = `translate(${n(17 * sen(gs))},-30) rotate(${n(s * (1 - aY) * 9 - Y * (q.beta - 40) * .35)}) scale(${n3(.9 + .1 * Math.max(0, cosg(gs)))})`;
    }
    t.cabMan = `translate(${n(-Y * 9)},0)`;
    // pálpebras: c = fecho, h = olhos contentes
    const c = limita(q.fecho, 0, 1), h = limita(q.feliz, 0, 1);
    // contente: as duas pálpebras juntam-se num arco para cima («∩»), como um olho a sorrir
    const ye = lerp(lerp(-11, 11, c), 7, h), cy = lerp(lerp(-28, 19, c), -12, h);
    d.palpS = `M-18,-24 L18,-24 L18,${n(ye)} Q0,${n(cy)} -18,${n(ye)} Z`;
    const yl = lerp(19, 8, h), cyl = lerp(24, -9, h);
    d.palpI = `M-18,24 L18,24 L18,${n(yl)} Q0,${n(cyl)} -18,${n(yl)} Z`;
    // cílios ao longo da pálpebra de cima
    const Q = (u, p0, p1, p2) => (1 - u) * (1 - u) * p0 + 2 * u * (1 - u) * p1 + u * u * p2;
    const xs = [-14.5, 0, 14.5];
    let cil = `M${xs[0]},${n(Q(.1, ye, cy, ye))} Q0,${n(Q(.5, ye, cy, ye) * 2 - (Q(.1, ye, cy, ye) + Q(.9, ye, cy, ye)) / 2)} ${xs[2]},${n(Q(.9, ye, cy, ye))}`;
    for (const u of [.16, .34, .5, .66, .84]) {
      const x = lerp(-18, 18, u), y = Q(u, ye, cy, ye), vx = x * .55, vy = y - 2;
      const L = Math.hypot(vx, vy) || 1, ux = vx / L, uy = vy / L, comp = (u === .5 ? 6 : 8) * (1 - c * .25);
      cil += ` M${n(x)},${n(y)} q${n(ux * comp * .5 - uy * 2)},${n(uy * comp * .5 + ux * 2)} ${n(ux * comp)},${n(uy * comp)}`;
    }
    d.cil = cil;
    a.abre = 1 - c;
    t.iris = `translate(${n(q.olharX * 4.5 + Y * 2)},${n(q.olharY * 4)})`;
    return { t, d, op, a };
  }

  function cabecaSVG(p, E) {
    const T = k => E.t[k] ? ` transform="${E.t[k]}"` : '';
    const O = k => E.op[k] != null ? ` opacity="${E.op[k]}"` : '';
    const osso = k => `<g class="gr-osso${k}"${T('osso' + k)}>
        <path d="M-7.5,4 L-5.5,-34 C-5.5,-38 5.5,-38 5.5,-34 L7.5,4 Z" fill="url(#${p}orelha)" stroke="${COR.cont}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M-3,-6 L-2.4,-30" stroke="#FFF3D6" stroke-width="2.2" opacity=".6" stroke-linecap="round"/>
        <circle cy="-39" r="10.5" fill="url(#${p}tufo)" stroke="#21120A" stroke-width="2"/>
        <path d="M-7,-41 C-5,-47 -1,-49 3,-48 M-3,-38 C-2,-44 2,-46 6,-44" stroke="#7E5A40" stroke-width="1.6" fill="none" opacity=".8" stroke-linecap="round"/>
        <circle cx="-3.5" cy="-42.5" r="2.6" fill="#FFFFFF" opacity=".35"/></g>`;
    const orelha = k => `<g class="gr-orelha${k}"${T('orelha' + k)}><g class="gr-orelha${k}-in">
        <path d="M-2,-10 C14,-17 36,-15 52,-2 C38,10 16,13 -2,9 C-6,4 -6,-5 -2,-10 Z" fill="url(#${p}orelha)" stroke="${COR.cont}" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M6,-4 C18,-9 34,-8 44,-2 C33,4 18,6 6,4 Z" fill="url(#${p}orelhaIn)"/>
        <path d="M10,0 C20,-2 30,-2 40,-1" stroke="#FFF6EA" stroke-width="1.4" fill="none" opacity=".8"/></g></g>`;
    const olho = k => `<g class="gr-olho${k}"${T('olho' + k)}${O('olho' + k)}>
        <ellipse rx="16.5" ry="19" fill="#A9682E" opacity=".28"/>
        <g clip-path="url(#${p}clip-olho)">
          <ellipse rx="13.5" ry="16" fill="#FFFDF6"/>
          <g class="gr-iris${k}"${T('iris')}><circle cy="1" r="11" fill="url(#${p}iris)"/><circle cy="1" r="11" fill="none" stroke="#1A0B05" stroke-width="1.6"/>
            <circle cy="1" r="5.6" fill="#120804"/><circle cx="-4" cy="-4" r="4.4" fill="#FFFFFF"/><circle cx="4.2" cy="5" r="2" fill="#FFFFFF" opacity=".9"/></g>
          <path d="M-18,-20 L18,-20 L18,-8 Q0,-22 -18,-8 Z" fill="#4A2408" opacity=".14"/>
          <path class="gr-palpS${k}" d="${E.d.palpS}" fill="url(#${p}cab)"/>
          <path class="gr-palpI${k}" d="${E.d.palpI}" fill="url(#${p}cab)"/>
        </g>
        <ellipse class="gr-contOlho${k}" rx="13.5" ry="16" fill="none" stroke="${COR.cont}" stroke-width="2.6"/>
        <path class="gr-cil${k}" d="${E.d.cil}" fill="none" stroke="#2A1408" stroke-width="2.6" stroke-linecap="round"/>
      </g>`;
    const rnd = semente(91);
    const cel = celulas(grelha(-50, -52, 50, 30, 22, rnd), caixaDe(-60, -60, 60, 40), 4).filter(c => {
      const cx = c.reduce((s, q) => s + q[0], 0) / c.length, cy = c.reduce((s, q) => s + q[1], 0) / c.length;
      return (Math.abs(cx) > 20 || cy < -30) && cy < 22;
    });
    const nar = k => `<g class="gr-nar${k}"${T('nar' + k)}${O('nar' + k)}><ellipse rx="5.2" ry="2.4" fill="#6E3A1E"/><path d="M-4,-2.4 C-1,-4.2 2,-4.2 4.6,-2" stroke="#C99A62" stroke-width="1.4" fill="none"/></g>`;
    return `<g class="gr-cab-in">
      ${osso('E')}${osso('D')}${orelha('E')}${orelha('D')}
      <ellipse rx="47.5" ry="49.5" fill="${COR.cont}"/>
      <g class="gr-ponteC"${T('ponte')}><rect class="gr-ponteCr" x="0" y="-30.5" width="${E.a.ponteL}" height="61" rx="30.5" fill="${COR.cont}"/></g>
      <g class="gr-queixoC"${T('queixo')}><ellipse rx="25" ry="15" fill="${COR.cont}"/></g>
      <g class="gr-focC"${T('foc')}><ellipse rx="35.5" ry="31.5" fill="${COR.cont}"/></g>
      <g class="gr-queixo"${T('queixo')}><ellipse rx="21" ry="11.5" fill="url(#${p}foc)"/><path d="M-12,4 C-4,8 6,8 13,3" stroke="#D4AF78" stroke-width="1.6" fill="none"/></g>
      <ellipse class="gr-bocaInt"${T('bocaInt')} rx="${E.a.bocaRx}" ry="${E.a.bocaRy}" fill="#5A1E2A"/>
      <g class="gr-slotLT"></g>
      <ellipse rx="43" ry="45" fill="url(#${p}cab)"/>
      <g clip-path="url(#${p}clip-cranio)"><g class="gr-cabMan"${T('cabMan')}>${manchas(cel, p)}</g>
        <path d="M-30,-30 C-18,-42 4,-46 22,-40" stroke="#FFF2D2" stroke-width="7" fill="none" opacity=".45" stroke-linecap="round"/></g>
      <g class="gr-ponte"${T('ponte')}><rect class="gr-ponteR" x="0" y="-26" width="${E.a.ponteL}" height="52" rx="26" fill="${COR.cab}"/>
        <rect class="gr-ponteL" x="10" y="-20" width="${Math.max(1, E.a.ponteL - 26)}" height="9" rx="4.5" fill="#FFE9BE" opacity=".45"/></g>
      <g class="gr-foc"${T('foc')}><ellipse rx="31" ry="27" fill="url(#${p}foc)"/><ellipse cx="-8" cy="-13" rx="14" ry="6" fill="#FFFFFF" opacity=".5"/>
        <g fill="#D2AA72" opacity=".7"><circle cx="-16" cy="6" r="1.5"/><circle cx="-10" cy="9" r="1.5"/><circle cx="10" cy="9" r="1.5"/><circle cx="16" cy="6" r="1.5"/></g></g>
      <path class="gr-boca" d="${E.d.boca}" stroke="${COR.cont}" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${nar('E')}${nar('D')}
      <ellipse class="gr-bochE"${T('bochE')}${O('bochE')} rx="11" ry="6.5" fill="#F29A86"/><ellipse class="gr-bochD"${T('bochD')}${O('bochD')} rx="11" ry="6.5" fill="#F29A86"/>
      ${olho('E')}${olho('D')}
      <path class="gr-sobrE"${T('sobrE')}${O('sobrE')} d="M-9,2 C-4,-3 4,-3 9,1" stroke="#B0703A" stroke-width="3" fill="none" stroke-linecap="round" stroke-opacity=".8"/>
      <path class="gr-sobrD"${T('sobrD')}${O('sobrD')} d="M-9,1 C-4,-3 4,-3 9,2" stroke="#B0703A" stroke-width="3" fill="none" stroke-linecap="round" stroke-opacity=".8"/>
      <g class="gr-slotLF"></g>
    </g>`;
  }
  function linguaSVG(p) {
    return `<g class="gr-lingua" display="none"><path class="gr-linguaC" d="" fill="none" stroke="#24183E" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="gr-linguaF" d="" fill="none" stroke="url(#${p}lingua)" stroke-width="9.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="gr-linguaB" d="" fill="none" stroke="#9A86C8" stroke-width="2.6" stroke-linecap="round" opacity=".7"/></g>`;
  }

  function girafaSVG(p) {
    const E = estadoCabeca(CAB0);
    return `<g class="gr-girafa">
      <ellipse class="gr-sombra" rx="1" ry="1" fill="url(#${p}sombra)"/>
      ${sombrasPesSVG(p)}
      <g class="gr-pernasTras">${PERNAS.map(pe => pernaSVG(p, pe)).join('')}</g>
      <g class="gr-slotCaudaT"><g class="gr-cauda">${caudaSVG(p)}</g></g>
      <g class="gr-tronco">${troncoSVG(p)}</g>
      <g class="gr-slotCaudaF"></g>
      <g class="gr-pernasFrente"></g>
      <g class="gr-peito" display="none">${peitoSVG(p)}</g>
      ${pescocoSVG(p)}
      <g class="gr-cab">${cabecaSVG(p, E)}</g>
      ${linguaSVG(p)}
    </g>`;
  }
  const CAB0 = { Y: -.5, beta: 42, oE: 0, oD: 0, orelhas: 0, fecho: 0, feliz: 0, sobr: 0, boca: 0, mastX: 0, mastY: 0, olharX: 0, olharY: 0, nariz: 0, sorriso: 0, olhoEsc: 1 };

  /* ================= 5) Cenário: savana ao fim da tarde ================= */
  function defsCena(p) {
    return `
    <linearGradient id="${p}ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FAAD8"/><stop offset=".38" stop-color="#A9CFE2"/><stop offset=".66" stop-color="#F3DCA8"/><stop offset=".86" stop-color="#F6C886"/><stop offset="1" stop-color="#F2B46E"/></linearGradient>
    <radialGradient id="${p}solBrilho"><stop offset="0" stop-color="#FFF7D6" stop-opacity=".95"/><stop offset=".18" stop-color="#FFE9A8" stop-opacity=".55"/><stop offset=".5" stop-color="#FFD98A" stop-opacity=".18"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}sol" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="#FFFFF4"/><stop offset=".7" stop-color="#FFF4C4"/><stop offset="1" stop-color="#FFE59A"/></radialGradient>
    <linearGradient id="${p}monte" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B9C2D9"/><stop offset=".42" stop-color="#A6B2CE"/><stop offset=".6" stop-color="#8E9BBC"/><stop offset="1" stop-color="#8090B2"/></linearGradient>
    <linearGradient id="${p}neve" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#F4F7FC"/><stop offset=".65" stop-color="#D4DDEE"/><stop offset="1" stop-color="#C3CEE4"/></linearGradient>
    <linearGradient id="${p}bruma" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6DDB0" stop-opacity="0"/><stop offset="1" stop-color="#F6DDB0" stop-opacity=".85"/></linearGradient>
    <linearGradient id="${p}planicie" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8CF8E"/><stop offset=".5" stop-color="#E4BE6A"/><stop offset="1" stop-color="#DCAB52"/></linearGradient>
    <linearGradient id="${p}erva" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4B65A"/><stop offset=".45" stop-color="#D9A246"/><stop offset="1" stop-color="#C98C38"/></linearGradient>
    <linearGradient id="${p}terra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D49A48"/><stop offset="1" stop-color="#B9792F"/></linearGradient>
    <linearGradient id="${p}caminho" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F1D49A" stop-opacity="0"/><stop offset=".2" stop-color="#F1D49A" stop-opacity=".75"/><stop offset=".8" stop-color="#EDCB8A" stop-opacity=".75"/><stop offset="1" stop-color="#EDCB8A" stop-opacity="0"/></linearGradient>
    <linearGradient id="${p}termiteira" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#DDA06A"/><stop offset=".45" stop-color="#C47F4A"/><stop offset="1" stop-color="#8E5430"/></linearGradient>
    <linearGradient id="${p}rocha" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E4D6C0"/><stop offset=".5" stop-color="#BBAA92"/><stop offset="1" stop-color="#8A7864"/></linearGradient>
    <linearGradient id="${p}casca" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8C7666"/><stop offset=".35" stop-color="#6A5546"/><stop offset="1" stop-color="#3E2E24"/></linearGradient>
    <radialGradient id="${p}folha" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#B4CC6A"/><stop offset=".55" stop-color="#83A245"/><stop offset="1" stop-color="#58782E"/></radialGradient>
    <radialGradient id="${p}folhaE" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#90AE52"/><stop offset=".6" stop-color="#5F7F32"/><stop offset="1" stop-color="#3E5A22"/></radialGradient>
    <linearGradient id="${p}pratoT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7C9A44"/><stop offset=".6" stop-color="#58772E"/><stop offset="1" stop-color="#3E5A20"/></linearGradient>
    <linearGradient id="${p}pratoM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9D06C"/><stop offset=".45" stop-color="#8CAB48"/><stop offset="1" stop-color="#5E7E30"/></linearGradient>
    <linearGradient id="${p}pratoF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C2D872"/><stop offset=".5" stop-color="#93B24C"/><stop offset="1" stop-color="#668834"/></linearGradient>
    <radialGradient id="${p}ninho" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#E6CB86"/><stop offset=".65" stop-color="#C2A058"/><stop offset="1" stop-color="#8E7034"/></radialGradient>
    <radialGradient id="${p}sombraArv"><stop offset="0" stop-color="#5A3410" stop-opacity=".34"/><stop offset=".7" stop-color="#5A3410" stop-opacity=".16"/><stop offset="1" stop-color="#5A3410" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}vinheta" cx=".46" cy=".44" r=".78"><stop offset=".6" stop-color="#5A2E0A" stop-opacity="0"/><stop offset="1" stop-color="#5A2E0A" stop-opacity=".3"/></radialGradient>
    <radialGradient id="${p}luzQuente" gradientUnits="userSpaceOnUse" cx="230" cy="190" r="1100"><stop offset="0" stop-color="#FFE9B0" stop-opacity=".22"/><stop offset=".5" stop-color="#FFE0A0" stop-opacity=".06"/><stop offset="1" stop-color="#FFE0A0" stop-opacity="0"/></radialGradient>
    <linearGradient id="${p}redemoinho" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9CF9A" stop-opacity="0"/><stop offset=".4" stop-color="#E2C088" stop-opacity=".55"/><stop offset="1" stop-color="#D4AA6A" stop-opacity=".75"/></linearGradient>`;
  }
  function nuvemSVG(i, k) {
    return `<g class="gr-nuvem${i}"><g transform="scale(${k})">
      <ellipse cx="0" cy="10" rx="96" ry="13" fill="#F4CFC0" opacity=".85"/>
      <ellipse cx="-46" cy="0" rx="34" ry="16" fill="#FFF8F0"/><ellipse cx="-6" cy="-8" rx="40" ry="20" fill="#FFFFFF"/><ellipse cx="38" cy="-2" rx="34" ry="15" fill="#FFF8F0"/><ellipse cx="72" cy="5" rx="22" ry="9" fill="#FFF3EA"/>
      <ellipse cx="0" cy="7" rx="92" ry="9" fill="#FCE9DE"/>
      <path d="M-84,11 C-40,17 30,17 92,9" stroke="#E7B8A8" stroke-width="3" fill="none" opacity=".7"/>
      <ellipse cx="-20" cy="-16" rx="22" ry="6" fill="#FFFFFF" opacity=".9"/></g></g>`;
  }
  function monteSVG(p) {
    const neve = 'M436,374 C466,352 496,344 526,341 L690,339 C722,341 750,353 784,374 L764,386 L748,372 L734,394 L712,376 L696,400 L676,378 L656,394 L636,374 L616,390 L594,372 L572,396 L552,374 L530,390 L508,372 L486,388 L464,374 L450,384 Z';
    return `<path d="M150,566 C280,500 370,428 436,374 C466,352 496,344 526,341 L690,339 C722,341 750,353 784,374 C860,426 950,500 1050,566 Z" fill="url(#${p}monte)"/>
      <path d="M560,346 C552,400 520,470 470,540 M612,344 C618,410 608,480 590,560 M660,342 C690,400 720,460 770,540 M700,350 C760,410 840,480 900,546" stroke="#7E8DAE" stroke-width="3" fill="none" opacity=".35"/>
      <path d="M480,380 C430,420 360,480 290,540" stroke="#D4DBEA" stroke-width="5" fill="none" opacity=".35"/>
      <path d="${neve}" fill="url(#${p}neve)"/>
      <path d="M526,341 L690,339 C700,340 708,342 716,344 L540,346 Z" fill="#FFFFFF"/>
      <path d="M640,350 L652,372 M680,352 L688,368 M600,350 L604,366" stroke="#B6C3DC" stroke-width="2.5" opacity=".7"/>
      <rect x="140" y="470" width="920" height="100" fill="url(#${p}bruma)"/>`;
  }
  function colinasSVG() {
    return `<path d="M0,522 C120,480 250,494 380,476 C520,456 640,486 780,468 C920,450 1060,476 1200,456 C1340,438 1480,464 1600,450 L1600,600 L0,600 Z" fill="#9AAFBC"/>
      <path d="M0,524 C120,482 250,496 380,478" stroke="#C3D2D8" stroke-width="3" fill="none" opacity=".6"/>
      <path d="M0,552 C160,524 300,538 460,520 C620,504 760,532 920,516 C1080,500 1240,526 1400,510 C1500,502 1560,512 1600,508 L1600,610 L0,610 Z" fill="#A9B08A"/>
      <path d="M0,552 C160,524 300,538 460,520 C620,504 760,532 920,516 C1080,500 1240,526 1400,510" stroke="#C9CDA6" stroke-width="3" fill="none" opacity=".55"/>`;
  }
  function acaciaLongeSVG(x, y, k, cor) {
    return `<g transform="translate(${x},${y}) scale(${k})" fill="${cor}">
      <path d="M-2,0 L-1.5,-26 L-12,-38 L-10,-40 L0,-30 L8,-42 L10,-40 L2,-26 L2,0 Z"/>
      <ellipse cx="-2" cy="-44" rx="34" ry="7"/><ellipse cx="-14" cy="-47" rx="16" ry="5"/><ellipse cx="12" cy="-46" rx="18" ry="5"/></g>`;
  }
  function zebraSVG(i) {
    return `<g class="gr-zebra${i}"><g class="gr-zebraIn">
      <path d="M-14,-6 L-13,6 M-8,-6 L-9,6 M8,-6 L9,6 M13,-6 L12,6" class="gr-zPernas" stroke="#4A4448" stroke-width="2.4" stroke-linecap="round"/>
      <ellipse cx="0" cy="-11" rx="17" ry="7.5" fill="#F2EEE6"/>
      <path d="M-12,-17 L-10,-5 M-6,-18 L-5,-4 M0,-18 L0,-4 M6,-18 L5,-4 M11,-16 L10,-6" stroke="#3A3438" stroke-width="2.2"/>
      <path d="M14,-14 L22,-26 L28,-24 L20,-10 Z" fill="#F2EEE6"/><path d="M16,-15 L22,-22 M19,-12 L25,-21" stroke="#3A3438" stroke-width="1.8"/>
      <path d="M21,-27 L27,-25" stroke="#3A3438" stroke-width="2"/><path d="M-17,-13 L-22,-4" stroke="#3A3438" stroke-width="1.8"/></g></g>`;
  }
  function elefanteSVG() {
    return `<g class="gr-elefante"><g class="gr-eleIn" fill="#8A8288">
      <g class="gr-ePernas"><rect x="-22" y="-14" width="9" height="20" rx="3"/><rect x="-8" y="-14" width="9" height="20" rx="3"/><rect x="8" y="-14" width="9" height="20" rx="3"/><rect x="20" y="-14" width="9" height="20" rx="3"/></g>
      <ellipse cx="2" cy="-24" rx="30" ry="18"/><ellipse cx="32" cy="-28" rx="13" ry="13"/>
      <path d="M40,-24 C46,-14 46,-2 42,6 L38,5 C40,-2 40,-12 35,-20 Z"/><path d="M24,-36 C14,-38 12,-20 22,-16 Z" fill="#7A7278"/>
      <path d="M-26,-26 C-32,-22 -34,-14 -32,-8" stroke="#8A8288" stroke-width="2" fill="none"/>
      <path d="M-20,-36 C-6,-42 14,-42 26,-38" stroke="#A9A2A6" stroke-width="3" fill="none" opacity=".6"/></g></g>`;
  }
  function planicieSVG(p) {
    const rnd = semente(5);
    let s = `<rect y="540" width="1600" height="110" fill="url(#${p}planicie)"/>`;
    s += acaciaLongeSVG(118, 556, .9, '#8E9677') + acaciaLongeSVG(430, 560, .7, '#97A07F') + acaciaLongeSVG(812, 558, .6, '#99A282') + acaciaLongeSVG(1286, 552, 1, '#8A9372') + acaciaLongeSVG(1500, 562, .75, '#949C7C') + acaciaLongeSVG(960, 552, .5, '#A0A887');
    for (let i = 0; i < 160; i++) {
      const x = rnd() * 1600, y = 548 + rnd() * 92, h = 2 + (y - 540) * .05 + rnd() * 3;
      s += `<path d="M${n(x)},${n(y)} l${n(-1 - rnd())},${n(-h)} M${n(x + 2)},${n(y)} l${n(1 + rnd())},${n(-h * .9)}" stroke="${rnd() < .5 ? '#C99A4C' : '#F2DA9C'}" stroke-width="1.1" opacity=".6"/>`;
    }
    s += `<g class="gr-zebras">${zebraSVG(0)}${zebraSVG(1)}${zebraSVG(2)}</g>${elefanteSVG()}`;
    s += `<g class="gr-redem" display="none" opacity="0"><g class="gr-redemIn">${[0, 1, 2, 3, 4, 5].map(i => `<ellipse class="gr-rd${i}" cx="0" cy="${-i * 14}" rx="${4 + i * 3.2}" ry="${3 + i * .9}" fill="none" stroke="#E7CB92" stroke-width="${3.5 - i * .3}" opacity="${.75 - i * .08}"/>`).join('')}
      <path d="M-4,0 C-10,-30 -6,-56 -18,-84 L20,-84 C8,-56 10,-30 4,0 Z" fill="url(#${p}redemoinho)" opacity=".5"/>
      <ellipse cx="0" cy="2" rx="16" ry="4" fill="#E2C088" opacity=".5"/></g></g>`;
    return s;
  }
  function campoSVG(p) {
    const rnd = semente(13);
    let s = `<path d="M0,604 C200,592 420,600 640,594 C900,588 1180,600 1600,590 L1600,900 L0,900 Z" fill="url(#${p}erva)"/>`;
    // carreiro de terra batida até à acácia
    s += `<path d="M330,900 C420,850 560,812 720,800 C860,790 980,778 1070,768 C1110,763 1150,760 1190,760 L1196,772 C1100,778 980,792 860,808 C700,826 560,856 470,900 Z" fill="url(#${p}caminho)"/>`;
    for (let i = 0; i < 420; i++) {
      const y = 600 + Math.pow(rnd(), .8) * 300, x = rnd() * 1640 - 20, k = .4 + (y - 600) / 300 * 1.1;
      const h = (6 + rnd() * 9) * k, cor = escolhe(['#B98330', '#C99140', '#EFCB7C', '#F6DA92', '#D8A54C', '#A87428']);
      const inc = (rnd() - .5) * 6 * k;
      s += `<path d="M${n(x)},${n(y)} q${n(inc * .4)},${n(-h * .6)} ${n(inc)},${n(-h)} M${n(x + 2 * k)},${n(y)} q${n(-inc * .3 + 2)},${n(-h * .5)} ${n(-inc * .5 + 3 * k)},${n(-h * .8)}" stroke="${cor}" stroke-width="${n(1 + k * .6)}" fill="none" stroke-linecap="round" opacity=".75"/>`;
    }
    for (let i = 0; i < 26; i++) {
      const x = rnd() * 1600, y = 640 + rnd() * 250;
      s += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(2 + rnd() * 3)}" ry="${n(1.2 + rnd() * 1.4)}" fill="#A88A64" opacity=".7"/><ellipse cx="${n(x - .8)}" cy="${n(y - .6)}" rx="${n(1.2 + rnd())}" ry=".8" fill="#E9D6B0" opacity=".7"/>`;
    }
    return s;
  }
  function termiteiraSVG(p) {
    return `<g>
      <ellipse cx="338" cy="702" rx="120" ry="15" fill="url(#${p}sombraArv)"/>
      <path d="M232,700 C240,670 250,640 262,606 C268,586 272,560 282,540 C290,528 300,532 302,546 C306,520 312,486 322,468 C330,456 342,458 344,474 C350,500 352,530 358,556 C362,540 370,530 378,536 C388,548 388,580 398,610 C408,642 418,672 428,700 Z" fill="url(#${p}termiteira)" stroke="#7A4626" stroke-width="2.5"/>
      <path d="M322,468 C316,500 310,560 300,640 M344,476 C348,520 352,600 360,690 M282,544 C276,580 266,640 256,690 M380,540 C386,580 396,640 410,690" stroke="#9E5E34" stroke-width="2.2" fill="none" opacity=".55"/>
      <path d="M326,470 C322,500 318,540 312,580" stroke="#F0C08A" stroke-width="4" fill="none" opacity=".45" stroke-linecap="round"/>
      <ellipse cx="318" cy="602" rx="6" ry="4" fill="#5A3018"/><ellipse cx="372" cy="640" rx="5" ry="3.5" fill="#5A3018"/><ellipse cx="290" cy="660" rx="4.5" ry="3" fill="#5A3018"/>
      <path d="M232,700 C290,708 370,708 428,700" stroke="#7A4626" stroke-width="3" fill="none"/>
      ${[[240, 704], [262, 708], [400, 706], [420, 702]].map(([x, y]) => `<path d="M${x},${y} q-2,-12 -4,-18 M${x + 3},${y} q1,-10 4,-16 M${x + 6},${y} q2,-8 6,-12" stroke="#C99140" stroke-width="2" fill="none" stroke-linecap="round"/>`).join('')}
    </g>`;
  }
  function rochasSVG(p) {
    return `<g>
      <ellipse cx="1478" cy="716" rx="150" ry="16" fill="url(#${p}sombraArv)"/>
      <path d="M1360,716 C1356,690 1372,664 1404,656 C1430,650 1454,662 1462,684 C1470,700 1468,712 1460,716 Z" fill="url(#${p}rocha)" stroke="#6A5A48" stroke-width="2.5"/>
      <path d="M1430,716 C1428,676 1450,640 1494,628 C1534,620 1570,642 1580,680 C1586,700 1584,712 1578,716 Z" fill="url(#${p}rocha)" stroke="#6A5A48" stroke-width="2.5"/>
      <path d="M1520,716 C1522,694 1544,678 1574,680 C1600,682 1612,700 1610,716 Z" fill="url(#${p}rocha)" stroke="#6A5A48" stroke-width="2.5"/>
      <path d="M1462,648 C1480,636 1506,632 1526,636" stroke="#FFF6E6" stroke-width="5" fill="none" opacity=".5" stroke-linecap="round"/>
      <path d="M1374,676 C1384,664 1398,660 1412,660" stroke="#FFF6E6" stroke-width="4" fill="none" opacity=".45" stroke-linecap="round"/>
      <path d="M1500,640 L1508,668 L1500,690 M1404,684 L1416,700" stroke="#6A5A48" stroke-width="2" fill="none" opacity=".7"/>
      ${[[1352, 718], [1420, 720], [1512, 720], [1590, 718]].map(([x, y]) => `<path d="M${x},${y} q-3,-14 -6,-20 M${x + 4},${y} q1,-12 5,-18 M${x + 8},${y} q3,-9 8,-13" stroke="#C99140" stroke-width="2.2" fill="none" stroke-linecap="round"/>`).join('')}
    </g>`;
  }
  function arbustoSVG(x, y, k) {
    return `<g transform="translate(${x},${y}) scale(${k})">
      <ellipse cx="6" cy="2" rx="70" ry="9" fill="#5A3410" opacity=".22"/>
      <circle cx="-30" cy="-18" r="24" fill="#6E7A3A"/><circle cx="4" cy="-30" r="30" fill="#7E8C42"/><circle cx="36" cy="-16" r="22" fill="#66733A"/>
      <circle cx="-8" cy="-38" r="14" fill="#9AA858" opacity=".8"/><circle cx="-34" cy="-26" r="9" fill="#A8B464" opacity=".7"/>
      <g fill="#C9503A"><circle cx="-14" cy="-20" r="3"/><circle cx="20" cy="-30" r="3"/><circle cx="30" cy="-14" r="2.6"/></g></g>`;
  }
  function ervaFrenteSVG(i, x, y, k, flip) {
    const rnd = semente(200 + i);
    let d = '';
    for (let j = 0; j < 9; j++) {
      const a = (j - 4) * 9 + (rnd() - .5) * 8, h = (60 + rnd() * 50) * k, bx = (j - 4) * 4 * k;
      const ex = bx + Math.sin(a * RAD) * h, ey = -Math.cos(a * RAD) * h;
      d += `M${n(bx - 3 * k)},0 Q${n(bx + ex * .3)},${n(ey * .55)} ${n(ex)},${n(ey)} Q${n(bx + ex * .3 + 4 * k)},${n(ey * .5)} ${n(bx + 3 * k)},0 Z`;
    }
    return `<g class="gr-erva${i}" transform="translate(${x},${y})${flip ? ' scale(-1,1)' : ''}"><g class="gr-ervaIn"><path d="${d}" fill="${i % 2 ? '#C58A32' : '#D9A142'}" stroke="#8E5E20" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="#F6D88E" stroke-width=".8" opacity=".6"/></g></g>`;
  }
  function passarosLongeSVG() {
    return [0, 1, 2].map(i => `<path class="gr-ave${i}" d="M-8,0 Q-4,-5 0,0 Q4,-5 8,0" stroke="#4A3A40" stroke-width="2" fill="none" stroke-linecap="round"/>`).join('');
  }

  /* --- Acácia (habitat): tronco, ramos com espinhos, copa achatada em tufos, ninhos de tecelão, raminho que a girafa puxa --- */
  const ARV = { x: 1138, base: 754 };
  const GALHO = { bx: 1240, by: 228, tx: 1182, ty: 178 };    // raminho que a girafa puxa (base fixa, ponta com folhas)
  function cacho(x, y, r, rnd, p, esc) {
    let base = '', luz = '', fol = '';
    const nb = 5 + (rnd() * 3 | 0);
    for (let i = 0; i < nb; i++) {
      const a = i / nb * TAU + rnd(), d = r * (.35 + rnd() * .4), rr = r * (.42 + rnd() * .25);
      const cx = x + Math.cos(a) * d * 1.25, cy = y + Math.sin(a) * d * .55;
      base += `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rr * 1.25)}" ry="${n(rr * .78)}"/>`;
      if (Math.sin(a) < .2) luz += `<ellipse cx="${n(cx - rr * .25)}" cy="${n(cy - rr * .25)}" rx="${n(rr * .75)}" ry="${n(rr * .4)}"/>`;
    }
    for (let i = 0; i < 16; i++) {
      const a = rnd() * TAU, d = Math.sqrt(rnd()) * r, fx = x + Math.cos(a) * d * 1.3, fy = y + Math.sin(a) * d * .6 - 2;
      fol += `M${n(fx - 3)},${n(fy)} l6,${n((rnd() - .5) * 3)}`;
    }
    return `<g fill="${esc ? `url(#${p}folhaE)` : '#4E6B28'}"><g transform="translate(0,6)">${base}</g></g>
      <g fill="url(#${p}${esc ? 'folhaE' : 'folha'})">${base}</g>
      <g fill="${esc ? '#7C9A48' : '#B8D070'}" opacity=".55">${luz}</g>
      <path d="${fol}" stroke="${esc ? '#3E5A22' : '#E2EC9A'}" stroke-width="2" stroke-linecap="round" opacity=".5"/>`;
  }
  // «prato» de folhagem: a copa da acácia é feita de camadas achatadas (topo claro, por baixo escuro, franja de folhinhas)
  const elipseD = (cx, cy, rx, ry) => `M${n(cx - rx)},${n(cy)}a${n(rx)},${n(ry)} 0 1,0 ${n(2 * rx)},0a${n(rx)},${n(ry)} 0 1,0 ${n(-2 * rx)},0Z`;
  function prato(x0, x1, y0, esp, rnd, p, tom) {
    let base = '', luz = '', fol = '', fol2 = '', franja = '';
    const linhas = Math.max(1, Math.round(esp / 16));
    let fundo = y0;
    for (let l = 0; l < linhas; l++) {
      const y = y0 + l * esp / linhas, enc = linhas > 1 ? l / (linhas - 1) : 0;
      const a = x0 + (x1 - x0) * .07 * enc, b = x1 - (x1 - x0) * .07 * enc;
      for (let x = a; x <= b; x += 19 + rnd() * 9) {
        const rx = 20 + rnd() * 13, ry = 11 + rnd() * 6, cy = y + ry + (rnd() - .5) * 6;
        base += elipseD(x, cy, rx, ry);
        fundo = Math.max(fundo, cy + ry);
        if (l === 0 && rnd() < .85) luz += elipseD(x - rx * .22, cy - ry * .38, rx * .62, ry * .34);
        if (l === linhas - 1) for (let k = 0; k < 3; k++) franja += elipseD(x + (rnd() - .5) * rx * 1.4, cy + ry * (.75 + rnd() * .3), 3.5 + rnd() * 2, 2.2 + rnd());
      }
    }
    for (let i = 0; i < (x1 - x0) / 4; i++) {
      const x = x0 + rnd() * (x1 - x0), y = y0 + 4 + rnd() * (fundo - y0 - 4);
      const s = `M${n(x)},${n(y)} l${n(3.5 + rnd() * 3)},${n((rnd() - .5) * 3)}`;
      if (y < y0 + (fundo - y0) * .55) fol += s; else fol2 += s;
    }
    const g = ['pratoT', 'pratoM', 'pratoF'][tom];
    return `<path d="${base}" fill="${tom ? '#41601F' : '#34501A'}" transform="translate(0,7)"/>
      <path d="${base}" fill="url(#${p}${g})"/>
      <path d="${franja}" fill="${tom ? '#4F7026' : '#3E5A1E'}"/>
      <path d="${luz}" fill="${tom ? '#CFE184' : '#93AE52'}" opacity="${tom ? .55 : .4}"/>
      <path d="${fol}" stroke="${tom ? '#EEF5B0' : '#A9C063'}" stroke-width="1.8" stroke-linecap="round" opacity=".5"/>
      <path d="${fol2}" stroke="#2E4616" stroke-width="1.8" stroke-linecap="round" opacity=".35"/>`;
  }
  function ramoSVG(pts, w0, w1, cor) {   // ramo afunilado por uma linha de pontos
    let s = '';
    for (let i = 0; i < pts.length - 1; i++) {
      const w = lerp(w0, w1, i / (pts.length - 1));
      s += `<path d="M${pts[i][0]},${pts[i][1]} L${pts[i + 1][0]},${pts[i + 1][1]}" stroke="${cor}" stroke-width="${n(w)}" stroke-linecap="round"/>`;
    }
    return s;
  }
  function espinhos(pts, rnd) {
    let d = '';
    for (let i = 0; i < pts.length - 1; i++) {
      for (let k = 0; k < 3; k++) {
        const t = rnd(), x = lerp(pts[i][0], pts[i + 1][0], t), y = lerp(pts[i][1], pts[i + 1][1], t);
        const dx = pts[i + 1][0] - pts[i][0], dy = pts[i + 1][1] - pts[i][1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
        d += `M${n(x)},${n(y)} l${n(nx * 8 + dx / L * 3)},${n(ny * 8 + dy / L * 3)} M${n(x)},${n(y)} l${n(-nx * 8 + dx / L * 3)},${n(-ny * 8 + dy / L * 3)}`;
      }
    }
    return `<path d="${d}" stroke="#F4EEDC" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>`;
  }
  const RAMOS = [
    [[1140, 432], [1100, 360], [1050, 300], [990, 258], [920, 236]],
    [[1140, 432], [1150, 360], [1160, 300], [1166, 250], [1172, 214]],
    [[1140, 432], [1190, 370], [1244, 310], [1300, 262], [1352, 236]],
    [[1050, 300], [1040, 262], [1030, 226]],
    [[1244, 310], [1240, 270], [1236, 228]],
    [[990, 258], [948, 210]],
    [[1300, 262], [1290, 222]]
  ];
  function arvoreTrasSVG(p) {
    const rnd = semente(301);
    let s = `<ellipse cx="${ARV.x + 70}" cy="${ARV.base + 10}" rx="260" ry="32" fill="url(#${p}sombraArv)"/>`;
    s += `<g opacity=".55">${[[1150, 768, 30], [1250, 772, 22], [1060, 764, 18], [1330, 768, 14]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r * 2.4}" ry="${r * .35}" fill="#5A3410" opacity=".22"/>`).join('')}</g>`;
    // camada de trás da copa (mais escura, dá profundidade e fica por trás da cabeça da girafa)
    s += `<g class="gr-copaTras">${prato(900, 1345, 124, 66, rnd, p, 0)}${prato(1036, 1232, 166, 50, rnd, p, 0)}</g>`;
    // tronco
    s += `<g class="gr-troncoArv">
      <path d="M${ARV.x - 30},${ARV.base} C${ARV.x - 18},${ARV.base - 20} ${ARV.x - 16},${ARV.base - 60} ${ARV.x - 15},${ARV.base - 120} C${ARV.x - 14},${ARV.base - 200} ${ARV.x - 18},${ARV.base - 270} ${ARV.x - 8},430 L${ARV.x + 12},430 C${ARV.x + 16},${ARV.base - 270} ${ARV.x + 18},${ARV.base - 200} ${ARV.x + 18},${ARV.base - 120} C${ARV.x + 19},${ARV.base - 60} ${ARV.x + 22},${ARV.base - 20} ${ARV.x + 38},${ARV.base} Z" fill="url(#${p}casca)" stroke="#2E2018" stroke-width="2.5"/>
      <path d="M${ARV.x - 8},${ARV.base - 20} C${ARV.x - 6},${ARV.base - 120} ${ARV.x - 8},${ARV.base - 220} ${ARV.x - 4},440" stroke="#A89080" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>
      <path d="M${ARV.x + 6},${ARV.base - 30} C${ARV.x + 8},${ARV.base - 90} ${ARV.x + 4},${ARV.base - 160} ${ARV.x + 8},${ARV.base - 230} M${ARV.x - 2},${ARV.base - 60} l6,-14 M${ARV.x + 2},${ARV.base - 150} l-5,-12 M${ARV.x - 6},${ARV.base - 240} l7,-10" stroke="#3A2A20" stroke-width="2" fill="none" opacity=".6"/>
      <path d="M${ARV.x - 30},${ARV.base} C${ARV.x - 46},${ARV.base + 2} ${ARV.x - 52},${ARV.base + 6} ${ARV.x - 58},${ARV.base + 8} M${ARV.x + 38},${ARV.base} C${ARV.x + 54},${ARV.base + 2} ${ARV.x + 64},${ARV.base + 6} ${ARV.x + 72},${ARV.base + 9}" stroke="#4A382C" stroke-width="7" fill="none" stroke-linecap="round"/>
      ${[[ARV.x - 40, ARV.base + 2], [ARV.x + 46, ARV.base + 4], [ARV.x - 8, ARV.base + 4]].map(([x, y]) => `<path d="M${x},${y} q-2,-14 -5,-20 M${x + 4},${y} q1,-12 5,-18 M${x + 8},${y} q3,-9 8,-13" stroke="#C99140" stroke-width="2.2" fill="none" stroke-linecap="round"/>`).join('')}
    </g>`;
    // ramos com espinhos
    s += `<g class="gr-ramos">${RAMOS.map((r, i) => ramoSVG(r, i < 3 ? 20 : 9, i < 3 ? 7 : 4, '#4A382C')).join('')}
      ${RAMOS.map((r, i) => ramoSVG(r, i < 3 ? 7 : 3, i < 3 ? 2 : 1, '#8C7666')).join('').replace(/stroke="#8C7666"/g, 'stroke="#8C7666" opacity=".55"')}
      ${RAMOS.map(r => espinhos(r, rnd)).join('')}</g>`;
    // camadas do meio: o «chapéu» achatado de cima e duas abas mais baixas (a da esquerda e a da direita);
    // ao centro fica uma «bolsa» onde a girafa mete a cabeça
    s += `<g class="gr-copaMeio">${prato(858, 1396, 90, 54, rnd, p, 1)}${prato(872, 1056, 164, 38, rnd, p, 1)}${prato(1222, 1380, 170, 38, rnd, p, 1)}</g>`;
    s += `<rect x="850" y="96" width="560" height="160" fill="#000" fill-opacity="0"/><rect x="1086" y="250" width="110" height="510" fill="#000" fill-opacity="0"/>`;
    // raminho que a girafa puxa
    const { bx, by, tx, ty } = GALHO, gl = Math.hypot(tx - bx, ty - by), ga = Math.atan2(ty - by, tx - bx) / RAD;
    s += `<g class="gr-galho" transform="translate(${bx},${by})"><g transform="rotate(${n(ga)})">
      <path d="M0,0 C${n(gl * .4)},-6 ${n(gl * .7)},4 ${n(gl)},0" stroke="#4A382C" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M${n(gl * .3)},-2 l-4,-9 M${n(gl * .3)},2 l-4,9 M${n(gl * .6)},-1 l-4,-9 M${n(gl * .6)},2 l-3,9" stroke="#F4EEDC" stroke-width="1.6" stroke-linecap="round"/>
      <g transform="translate(${n(gl - 4)},0)">${cacho(0, 0, 20, semente(77), p, false)}</g>
      <g transform="translate(${n(gl * .5)},-10)">${cacho(0, 0, 13, semente(78), p, false)}</g></g></g>`;
    return s;
  }
  function ninhoSVG(i, x, y) {
    let tec = '';
    for (let k = 0; k < 7; k++) tec += `<path d="M${-14 + k * 1},${-14 + k * 4.5} C-6,${-18 + k * 4.5} 6,${-10 + k * 4.5} 14,${-15 + k * 4.5}" stroke="#8E7034" stroke-width="1.6" fill="none" opacity=".7"/>`;
    return `<g class="gr-ninho${i}" transform="translate(${x},${y})">
      <path d="M0,-30 L0,-14" stroke="#7A5A28" stroke-width="2"/>
      <g class="gr-ninhoIn"><ellipse cx="0" cy="0" rx="16" ry="19" fill="url(#gr-x)"/>${tec}
      <path d="M-6,14 C-8,22 -6,30 0,34 C6,30 8,22 6,14 Z" fill="#B49048" stroke="#7A5A28" stroke-width="1.6"/>
      <ellipse cx="0" cy="32" rx="4" ry="2.5" fill="#3A2810"/>
      <path d="M-10,-10 C-6,-16 2,-17 8,-13" stroke="#FFF2C8" stroke-width="2.4" fill="none" opacity=".55" stroke-linecap="round"/></g></g>`;
  }
  function arvoreFrenteSVG(p) {
    const rnd = semente(401);
    let s = '';
    // tufos da frente: tapam o alto e a nuca da cabeça da girafa quando come (a cara fica à vista)
    s += `<g class="gr-copaFrente">${prato(1024, 1112, 124, 30, rnd, p, 2)}${prato(1196, 1262, 150, 20, rnd, p, 2)}${prato(930, 1004, 200, 20, rnd, p, 2)}${prato(1300, 1370, 214, 16, rnd, p, 2)}</g>`;
    s += `<g class="gr-ninhos">${ninhoSVG(0, 930, 262).replace('url(#gr-x)', `url(#${p}ninho)`)}${ninhoSVG(1, 1318, 266).replace('url(#gr-x)', `url(#${p}ninho)`)}</g>`;
    return s;
  }
  function folhasCairSVG(p) {
    return Array.from({ length: 12 }, (_, i) => `<g class="gr-fc${i}" display="none"><path d="M-5,0 C-3,-3 3,-3 5,0 C3,3 -3,3 -5,0 Z" fill="${i % 3 ? '#8DAA4A' : '#B7CC6E'}" stroke="#4E6B28" stroke-width=".8"/><path d="M-5,0 L-8,0" stroke="#5A4A30" stroke-width="1"/></g>`).join('');
  }
  /* --- Bichos dos acontecimentos raros --- */
  function picaBoiSVG() {
    return `<g class="gr-pb" display="none"><g class="gr-pbIn">
      <path d="M-14,-6 L-30,-2 L-28,-10 Z" fill="#5E4A34"/>
      <ellipse cx="-2" cy="-9" rx="14" ry="9" fill="#8A7050"/><ellipse cx="2" cy="-5" rx="9" ry="5" fill="#D9C49C"/>
      <g class="gr-pbAsa"><path d="M-14,-12 C-6,-20 6,-18 8,-9 C2,-6 -8,-6 -14,-12 Z" fill="#6E5638" stroke="#4A3826" stroke-width="1"/></g>
      <g class="gr-pbCab"><circle cx="10" cy="-17" r="7" fill="#8A7050"/><circle cx="12" cy="-18" r="2.6" fill="#F2D24A"/><circle cx="12" cy="-18" r="1.4" fill="#1A0E08"/>
        <path d="M16,-18 L25,-15.5 L16,-13.5 Z" fill="#E0342A"/><path d="M16,-18 L22,-16.5" stroke="#F2D24A" stroke-width="1.2"/></g>
      <path d="M-2,0 L-4,4 M3,0 L4,4" stroke="#5E4A34" stroke-width="1.8" stroke-linecap="round"/></g></g>`;
  }
  function borboletaSVG() {
    return `<g class="gr-bb" display="none"><g class="gr-bbIn">
      <g class="gr-bbAsaE"><path d="M0,0 C-8,-18 -24,-20 -22,-6 C-21,2 -10,4 0,0 Z" fill="#F08A24" stroke="#2A1A10" stroke-width="1.6"/><path d="M0,1 C-10,4 -16,12 -10,16 C-5,18 -1,10 0,1 Z" fill="#F4A040" stroke="#2A1A10" stroke-width="1.4"/>
        <circle cx="-16" cy="-10" r="1.8" fill="#FFF"/><circle cx="-20" cy="-5" r="1.4" fill="#FFF"/><path d="M-3,-2 L-17,-12" stroke="#2A1A10" stroke-width="1"/></g>
      <g class="gr-bbAsaD"><path d="M0,0 C8,-18 24,-20 22,-6 C21,2 10,4 0,0 Z" fill="#F08A24" stroke="#2A1A10" stroke-width="1.6"/><path d="M0,1 C10,4 16,12 10,16 C5,18 1,10 0,1 Z" fill="#F4A040" stroke="#2A1A10" stroke-width="1.4"/>
        <circle cx="16" cy="-10" r="1.8" fill="#FFF"/><circle cx="20" cy="-5" r="1.4" fill="#FFF"/><path d="M3,-2 L17,-12" stroke="#2A1A10" stroke-width="1"/></g>
      <ellipse cx="0" cy="2" rx="2" ry="8" fill="#2A1A10"/><path d="M-1,-5 C-3,-10 -5,-12 -7,-13 M1,-5 C3,-10 5,-12 7,-13" stroke="#2A1A10" stroke-width="1" fill="none"/></g></g>`;
  }
  function tecelaoSVG() {
    return `<g class="gr-tc" display="none"><g class="gr-tcIn">
      <path d="M-12,-6 L-24,-2 L-22,-10 Z" fill="#C9A21C"/>
      <ellipse cx="-2" cy="-9" rx="12" ry="8.5" fill="#F4D21E"/>
      <g class="gr-tcAsa"><path d="M-12,-12 C-5,-19 6,-17 7,-9 C1,-6 -7,-6 -12,-12 Z" fill="#D4AE1E" stroke="#8A6A10" stroke-width="1"/><path d="M-7,-12 L3,-11" stroke="#6A5A20" stroke-width="1"/></g>
      <circle cx="8" cy="-16" r="6.5" fill="#F4D21E"/><path d="M4,-20 C8,-22 13,-20 14,-15 C11,-12 6,-12 4,-16 Z" fill="#2A1A10"/><circle cx="10" cy="-17" r="1.5" fill="#E04A1A"/>
      <path d="M14,-16 L20,-14 L14,-12 Z" fill="#2A1A10"/>
      <path d="M-2,0 L-3,3 M3,0 L4,3" stroke="#A88A50" stroke-width="1.6"/></g></g>`;
  }
  function moscaSVG() {
    return `<g class="gr-mosca" display="none"><g transform="scale(1.3)">
      <ellipse class="gr-asaM" cx="-3" cy="-6" rx="7" ry="3.6" fill="#E8F0F8" opacity=".7" stroke="#9AA6B2" stroke-width=".6" transform="rotate(-28)"/>
      <ellipse class="gr-asaM" cx="2" cy="-6" rx="7" ry="3.6" fill="#E8F0F8" opacity=".7" stroke="#9AA6B2" stroke-width=".6" transform="rotate(22)"/>
      <ellipse cx="0" cy="0" rx="6.5" ry="4.3" fill="#2C2A30"/><circle cx="6.5" cy="-1" r="3.6" fill="#3A3640"/><circle cx="8" cy="-2" r="1.7" fill="#B8323A"/></g></g>`;
  }

  /* ================= 6) Ícone do menu (retrato parado, sem gradientes nem recortes com id) ================= */
  function iconeSVG() {
    const C = COR.cont;
    const recorta = (poly, conv) => { let r = poly; for (let i = 0; i < conv.length && r.length; i++) { const a = conv[i], b = conv[(i + 1) % conv.length]; r = cortaPoligono(r, a[0], a[1], b[1] - a[1], -(b[0] - a[0])); } return r; };
    // pescoço: trapézio inclinado, com manchas recortadas à mão (geometria, não clipPath)
    const pesc = [[70, 208], [148, 209], [138, 120], [96, 120]];
    const pescD = 'M70,208.2 L96,120 L138,120 L148,209 A106,106 0 0 1 70,208.2 Z';     // a base do pescoço segue o círculo do cartão
    let crinaI = '';
    for (let y = 124; y < 206; y += 7) { const x = 138 + (y - 120) / 89 * 10; crinaI += `M${n(x - 3)},${y} L${n(x + 6)},${y + 2} L${n(x - 1)},${y + 6} Z`; }
    const pescH = pesc.slice().reverse();
    const rnd = semente(17);
    const cel = celulas(grelha(60, 110, 160, 230, 27, rnd), caixaDe(40, 90, 180, 240), 4.5).map(c => recorta(c, pescH)).filter(c => c.length > 2);
    const elipse = (cx, cy, rx, ry, k = 28) => Array.from({ length: k }, (_, i) => [cx + rx * Math.cos(-i / k * TAU), cy + ry * Math.sin(-i / k * TAU)]);
    const cran = elipse(0, 0, 43, 45).reverse();
    const rnd2 = semente(91);
    const celC = celulas(grelha(-50, -52, 50, 30, 22, rnd2), caixaDe(-60, -60, 60, 40), 4).filter(c => {
      const cx = c.reduce((s, q) => s + q[0], 0) / c.length, cy = c.reduce((s, q) => s + q[1], 0) / c.length;
      return (Math.abs(cx) > 20 || cy < -30) && cy < 22;
    }).map(c => recorta(c, cran)).filter(c => c.length > 2);
    const cores = ['#C46F2D', '#B3602A', '#CF7D3A'];
    const E = estadoCabeca(Object.assign({}, CAB0, { Y: -.32, beta: 46, feliz: .25, sorriso: 1 }));
    const T = k => E.t[k] ? ` transform="${E.t[k]}"` : '';
    const olho = k => `<g${T('olho' + k)}><ellipse rx="16.5" ry="19" fill="#A9682E" opacity=".25"/><ellipse rx="13.5" ry="16" fill="#FFFDF6"/>
      <circle cx="${k === 'E' ? -1 : 1}" cy="2" r="10.5" fill="#4A2810"/><circle cx="${k === 'E' ? -1 : 1}" cy="2" r="5.4" fill="#120804"/><circle cx="-4" cy="-3" r="4.2" fill="#FFF"/><circle cx="4" cy="6" r="1.9" fill="#FFF"/>
      <path d="M-13.5,-2 C-12,-14 12,-14 13.5,-2 C11,-17 -11,-17 -13.5,-2 Z" fill="#EDBE74"/>
      <ellipse rx="13.5" ry="16" fill="none" stroke="${C}" stroke-width="2.6"/>
      <path d="M-13,-4 Q0,-17 13,-4 M-11,-8 q-4,-4 -8,-5 M-5,-11 q-2,-5 -4,-8 M5,-11 q2,-5 4,-8 M11,-8 q4,-4 8,-5" stroke="#2A1408" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>`;
    const osso = k => `<g${T('osso' + k)}><path d="M-7.5,4 L-5.5,-34 C-5.5,-38 5.5,-38 5.5,-34 L7.5,4 Z" fill="#E4AE62" stroke="${C}" stroke-width="3"/><circle cy="-39" r="10.5" fill="#3A2216" stroke="#21120A" stroke-width="2"/><circle cx="-3.5" cy="-42.5" r="2.8" fill="#8A6448"/></g>`;
    const orelha = k => `<g${T('orelha' + k)}><path d="M-2,-10 C14,-17 36,-15 52,-2 C38,10 16,13 -2,9 C-6,4 -6,-5 -2,-10 Z" fill="#E9B46A" stroke="${C}" stroke-width="3.2"/><path d="M6,-4 C18,-9 34,-8 44,-2 C33,4 18,6 6,4 Z" fill="#F4C2A6"/></g>`;
    return `<circle cx="110" cy="110" r="106" fill="#F7DFA8"/><path d="M4,110 A106,106 0 0 1 216,110 Z" fill="#BFDDEA" opacity=".85"/>
      <circle cx="110" cy="110" r="106" fill="none" stroke="#E8C27A" stroke-width="3"/>
      <g fill="#7E9A48" opacity=".9"><ellipse cx="176" cy="66" rx="30" ry="9"/><ellipse cx="160" cy="62" rx="14" ry="6"/><ellipse cx="192" cy="63" rx="13" ry="5"/></g><path d="M176,70 L176,112" stroke="#6A5546" stroke-width="3"/>
      <path d="${crinaI}" fill="#8C4A1C" stroke="#5C2C10" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="${pescD}" fill="${C}" stroke="${C}" stroke-width="7" stroke-linejoin="round"/>
      <path d="${pescD}" fill="#F6DEAA"/>
      ${cel.map((c, i) => `<path d="${arredondado(c)}" fill="${cores[i % 3]}"/>`).join('')}
      <path d="M100,126 L80,204" stroke="#FFF4D6" stroke-width="6" opacity=".35" stroke-linecap="round"/>
      <g transform="translate(108,82) scale(.98)">
        ${osso('E')}${osso('D')}${orelha('E')}${orelha('D')}
        <ellipse rx="47.5" ry="49.5" fill="${C}"/>
        <g${T('ponte')}><rect x="0" y="-30.5" width="${E.a.ponteL}" height="61" rx="30.5" fill="${C}"/></g>
        <g${T('foc')}><ellipse rx="35.5" ry="31.5" fill="${C}"/></g>
        <ellipse rx="43" ry="45" fill="#EDBE74"/>
        ${celC.map((c, i) => `<path d="${arredondado(c)}" fill="${cores[i % 3]}" transform="translate(3,0)"/>`).join('')}
        <path d="M-30,-30 C-18,-42 4,-46 22,-40" stroke="#FFF2D2" stroke-width="7" fill="none" opacity=".5" stroke-linecap="round"/>
        <g${T('ponte')}><rect x="0" y="-26" width="${E.a.ponteL}" height="52" rx="26" fill="#EDBE74"/></g>
        <g${T('foc')}><ellipse rx="31" ry="27" fill="#F6E0B6"/><ellipse cx="-8" cy="-13" rx="14" ry="6" fill="#FFFFFF" opacity=".55"/></g>
        <path d="${E.d.boca}" stroke="${C}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <g${T('narE')}><ellipse rx="5.2" ry="2.4" fill="#6E3A1E"/></g><g${T('narD')}><ellipse rx="5.2" ry="2.4" fill="#6E3A1E"/></g>
        <ellipse${T('bochE')} rx="11" ry="6.5" fill="#F29A86" opacity=".5"/><ellipse${T('bochD')} rx="11" ry="6.5" fill="#F29A86" opacity=".5"/>
        ${olho('E')}${olho('D')}
      </g>`;
  }

  /* ================= 7) montar() ================= */
  // Pose de repouso (fora): de pé, a 3/4 virada para a esquerda e para nós, cabeça a olhar para a criança
  const REP = { X: 648, Z: 0, th: PI - .45 };
  const HAB = { X: 958, th: .1 };
  const CORPO0 = { alt: 0, incl: 0, nA: 64, nC: 2.4, nY: 0, nTh: 0, cTurn: -.55, cB: 42, cRoll: 0, fAbre: 0, fAvanca: 0 };
  const ROSTO0 = { olhos: 1, feliz: 0, oE: 0, oD: 0, orelhas: 0, boca: 0, mast: 0, lingua: 0, lCurl: 0, lAng: 0, lAlvo: 0, sobr: 0, nariz: 0, sorriso: .4, olhoEsc: 1 };
  const CAUDA_0 = { cauA: 0, cauAmp: 8, cauVel: .45 };
  const COMER = { alt: 8, incl: .07, nA: 74, nC: 1.6, nY: 0, nTh: 0, cTurn: -.05, cB: -22, cRoll: 0 };

  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .4 : 1;
    const p = 'girafa-';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.innerHTML = `<defs>${defsGirafa(p)}${defsCena(p)}</defs>
      <rect width="1600" height="640" fill="url(#${p}ceu)"/>
      <circle cx="230" cy="190" r="430" fill="url(#${p}solBrilho)"/>
      <circle cx="230" cy="190" r="44" fill="url(#${p}sol)"/>
      <g class="gr-nuvens">${nuvemSVG(0, 1)}${nuvemSVG(1, .7)}${nuvemSVG(2, .85)}${nuvemSVG(3, .55)}</g>
      ${monteSVG(p)}
      <g class="gr-aves">${passarosLongeSVG()}</g>
      ${colinasSVG()}${planicieSVG(p)}${campoSVG(p)}${termiteiraSVG(p)}${rochasSVG(p)}${arbustoSVG(160, 704, 1)}${arbustoSVG(1040, 640, .55)}${arbustoSVG(560, 636, .45)}
      <g class="gr-habitat">
        <g class="gr-arvTras">${arvoreTrasSVG(p)}</g>
        ${tecelaoSVG()}
        ${girafaSVG(p)}
        ${picaBoiSVG()}
        <g class="gr-arvFrente">${arvoreFrenteSVG(p)}</g>
        <g class="gr-folhasCair">${folhasCairSVG(p)}</g>
      </g>
      ${borboletaSVG()}${moscaSVG()}
      ${ervaFrenteSVG(0, 30, 906, 1.1, false)}${ervaFrenteSVG(1, 130, 912, .9, true)}${ervaFrenteSVG(2, 250, 906, .7, false)}${ervaFrenteSVG(3, 1360, 908, .8, true)}${ervaFrenteSVG(4, 1470, 912, 1.05, false)}${ervaFrenteSVG(5, 1575, 906, .9, true)}${ervaFrenteSVG(6, 980, 912, .45, false)}${ervaFrenteSVG(7, 560, 914, .5, true)}
      <rect width="1600" height="900" fill="url(#${p}luzQuente)" pointer-events="none"/>
      <rect width="1600" height="900" fill="url(#${p}vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s), qa = s => Array.from(svg.querySelectorAll(s));
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function poeT(lista, v) { for (const e of lista) poe(e, v); }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; el.setAttribute(nome, v); } }

    /* --- referências --- */
    const R = {
      habitat: q('.gr-habitat'), girafa: q('.gr-girafa'), sombra: q('.gr-sombra'),
      tronco: q('.gr-tronco'), troncoR: q('.gr-troncoR'), peito: q('.gr-peito'),
      pernasTras: q('.gr-pernasTras'), pernasFrente: q('.gr-pernasFrente'),
      cauda: q('.gr-cauda'), slotCT: q('.gr-slotCaudaT'), slotCF: q('.gr-slotCaudaF'),
      ca: Array.from({ length: NCA + 1 }, (_, i) => qa('.gr-ca' + i)),
      pc: Array.from({ length: N_PESC }, (_, i) => qa('.gr-pc' + i)), pj: Array.from({ length: N_PESC }, (_, i) => qa('.gr-pj' + i)),
      crina: Array.from({ length: N_PESC }, (_, i) => q('.gr-crina' + i)), bolo: q('.gr-bolo'),
      cab: q('.gr-cab'), lingua: q('.gr-lingua'), linguaC: q('.gr-linguaC'), linguaF: q('.gr-linguaF'), linguaB: q('.gr-linguaB'),
      slotLT: q('.gr-slotLT'), slotLF: q('.gr-slotLF'),
      nuvens: [0, 1, 2, 3].map(i => q('.gr-nuvem' + i)), aves: [0, 1, 2].map(i => q('.gr-ave' + i)),
      zebras: [0, 1, 2].map(i => q('.gr-zebra' + i)), zPernas: qa('.gr-zPernas'), elefante: q('.gr-elefante'), ePernas: q('.gr-ePernas'),
      ervas: Array.from({ length: 8 }, (_, i) => q('.gr-erva' + i + ' .gr-ervaIn')),
      copaTras: q('.gr-copaTras'), copaMeio: q('.gr-copaMeio'), copaFrente: q('.gr-copaFrente'), ramos: q('.gr-ramos'), galho: q('.gr-galho'),
      ninhos: [0, 1].map(i => q('.gr-ninho' + i + ' .gr-ninhoIn')),
      fc: Array.from({ length: 12 }, (_, i) => q('.gr-fc' + i)),
      pb: q('.gr-pb'), pbIn: q('.gr-pbIn'), pbAsa: q('.gr-pbAsa'), pbCab: q('.gr-pbCab'),
      bb: q('.gr-bb'), bbE: q('.gr-bbAsaE'), bbD: q('.gr-bbAsaD'),
      tc: q('.gr-tc'), tcIn: q('.gr-tcIn'), tcAsa: q('.gr-tcAsa'),
      mosca: q('.gr-mosca'), asasM: qa('.gr-asaM'), redem: q('.gr-redem'), redemIn: q('.gr-redemIn'), rd: [0, 1, 2, 3, 4, 5].map(i => q('.gr-rd' + i))
    };
    const H = {};
    for (const k of ['ossoE', 'ossoD', 'orelhaE', 'orelhaD', 'olhoE', 'olhoD', 'narE', 'narD', 'bochE', 'bochD', 'sobrE', 'sobrD', 'cabMan', 'bocaInt'])
      H[k] = q('.gr-' + k);
    H.ponte = [q('.gr-ponteC'), q('.gr-ponte')]; H.foc = [q('.gr-focC'), q('.gr-foc')]; H.queixo = [q('.gr-queixoC'), q('.gr-queixo')];
    H.ponteR = [q('.gr-ponteCr'), q('.gr-ponteR')]; H.ponteL = q('.gr-ponteL'); H.boca = q('.gr-boca');
    H.iris = [q('.gr-irisE'), q('.gr-irisD')];
    H.palp = ['E', 'D'].map(k => ({ s: q('.gr-palpS' + k), i: q('.gr-palpI' + k), c: q('.gr-cil' + k) }));
    const pernaEl = PERNAS.map(pe => ({
      g: q('.gr-' + pe.id), sup: qa(`.gr-${pe.id}-sup`), inf: qa(`.gr-${pe.id}-inf`), joe: qa(`.gr-${pe.id}-joe`), bol: qa(`.gr-${pe.id}-bol`), casco: qa(`.gr-${pe.id}-casco`),
      sombra: q('.gr-sp-' + pe.id)
    }));

    /* --- estado --- */
    const P = Object.assign({ X: REP.X, Z: REP.Z, th: REP.th, nAw: 0, cBw: 0, cTurnG: 0, cBG: 0, olharX: 0, olharY: 0, respA: 1, respF: .28,
      mastX: 0, mastY: 0, bolo: -1, puxa: 0, somB: 0, somR: 0, lFrente: 0 }, CORPO0, ROSTO0, CAUDA_0);
    let modo = 'fora', reagindo = false, tempo = 0, vivo = true;
    const fase = { resp: 0, cauda: 0, mast: 0 };
    let cabMundo = [0, 0], cabY = -.5, bocaMundo = [0, 0], focMundo = [0, 0];
    const rig = { tm: [1, 0, 0, 1, 0, 0], pesc: [], gam: [] };
    const galho = { a: 0, v: 0, alvo: null };          // ângulo (graus) do raminho e mola
    const pes = PERNAS.map(pe => ({ pe, x: 0, z: 0, y: 0, inc: 0 }));
    const peDe = id => pes.find(f => f.pe.id === id);
    function restPe(pe, X, Z, th) {
      const u = pe.pu + (pe.fr ? P.fAvanca : 0), v = pe.v + pe.lado * (pe.fr ? P.fAbre : 0);
      return [X + ESC * (u * Math.cos(th) - v * Math.sin(th)), Z + ESC * (u * Math.sin(th) + v * Math.cos(th))];
    }
    function assentarPes() { for (const f of pes) { const r = restPe(f.pe, P.X, P.Z, P.th); f.x = r[0]; f.z = r[1]; f.y = 0; f.inc = 0; } }
    assentarPes();

    /* --- impulsos curtos (orelhas, cauda, copa da acácia, ninhos) --- */
    const impulsos = [];
    const IMP = { twE: 0, twD: 0, flick: 0, copa: 0, ninho: 0, cabR: 0 };
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
    let ordemPernas = '', caudaNaFrente = false, linguaNaFrente = false;
    const tr = (x, y, r) => `translate(${n(x)},${n(y)}) rotate(${n(r)})`;
    function desenhar() {
      const th = P.th, c = Math.cos(th), s = Math.sin(th);
      const resp = Math.sin(fase.resp) * P.respA;
      const altT = P.alt + resp * .8;
      const ci = Math.cos(P.incl), si = Math.sin(P.incl);
      const W = (u, v, h) => { const uu = u * ci; return [P.X + ESC * (uu * c - v * s), P.Z + ESC * (uu * s + v * c), ESC * (h + altT + u * si)]; };
      const T = w => [w[0], CHAO - w[2] + KZ * w[1]];

      // tronco (perfil projetado)
      const c0 = T(W(0, 0, HC)), c1 = T(W(1, 0, HC));
      const fx = c1[0] - c0[0], fy = c1[1] - c0[1];
      rig.tm = [fx, fy, 0, ESC, c0[0], c0[1]];
      poe(R.tronco, `matrix(${n3(fx)},${n3(fy)},0,${ESC},${n(c0[0])},${n(c0[1])})`);
      poe(R.troncoR, `scale(1,${n3(1 + .013 * resp)})`);
      const wF = 1 - passoS(.32, .86, Math.abs(c));
      if (wF > .02) {
        const pc = T(W(94, 0, 300));
        atr(R.peito, 'display', 'inline');
        poe(R.peito, `translate(${n(pc[0])},${n(pc[1])}) scale(${n3(wF * ESC)},${n3(ESC * (1 + .012 * resp))})`);
      } else atr(R.peito, 'display', 'none');

      // patas: IK no plano de cada pata, pés onde estão plantados
      const sg = c >= 0 ? 1 : -1, hx = sg * (.55 + .45 * Math.abs(c));
      const atras = [], frente = [];
      pes.forEach((f, i) => {
        const pe = f.pe, J = W(pe.u, pe.v, pe.h), A = [f.x, f.z, f.y + ESC * TORNOZELO];
        const dx = A[0] - J[0], dz = A[1] - J[1], dh = A[2] - J[2];
        const du = dx * c + dz * s, dv = -dx * s + dz * c;
        const L1 = ESC * pe.L1, L2 = ESC * pe.L2;
        const d = Math.hypot(du, dh) || .01, dd = limita(d, Math.abs(L1 - L2) + 2, L1 + L2 - .4);
        const base = Math.atan2(dh, du);
        const a1 = base + pe.dobra * Math.acos(limita((L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd), -1, 1));
        const ku = L1 * Math.cos(a1), kh = L1 * Math.sin(a1), au = du * dd / d, ah = dh * dd / d;
        const fr = pe.L1 / (pe.L1 + pe.L2);
        const K = [J[0] + ku * c - dv * fr * s, J[1] + ku * s + dv * fr * c, J[2] + kh];
        const An = [J[0] + au * c - dv * s, J[1] + au * s + dv * c, J[2] + ah];
        const Js = T(J), Ks = T(K), As = T(An);
        const e = pernaEl[i];
        const l1 = Math.hypot(Ks[0] - Js[0], Ks[1] - Js[1]), l2 = Math.hypot(As[0] - Ks[0], As[1] - Ks[1]);
        poeT(e.sup, `${tr(Js[0], Js[1], Math.atan2(Ks[1] - Js[1], Ks[0] - Js[0]) / RAD)} scale(${n3(l1 / pe.L1)},${n3(ESC * sg)})`);
        poeT(e.inf, `${tr(Ks[0], Ks[1], Math.atan2(As[1] - Ks[1], As[0] - Ks[0]) / RAD)} scale(${n3(l2 / pe.L2)},${n3(ESC * sg)})`);
        poeT(e.joe, `translate(${n(Ks[0])},${n(Ks[1])}) scale(${ESC})`);
        poeT(e.bol, `translate(${n(As[0])},${n(As[1])}) scale(${ESC})`);
        poeT(e.casco, `translate(${n(As[0])},${n(As[1])}) rotate(${n(f.inc * sg)}) scale(${n3(ESC * hx)},${ESC})`);
        const no = pe.v * c + pe.u * s * .25 > 0;
        (no ? frente : atras).push([J[1], i]);
        const gy = CHAO + KZ * f.z, al = limita(f.y / 40, 0, 1);
        poe(e.sombra, `translate(${n(f.x + 6)},${n(gy + 2)}) scale(${n3(ESC * (1 - al * .5))})`);
        atr(e.sombra, 'opacity', n3(1 - al * .7));
      });
      atras.sort((a, b) => a[0] - b[0]); frente.sort((a, b) => a[0] - b[0]);
      const chave = atras.map(a => a[1]).join('') + '|' + frente.map(a => a[1]).join('');
      if (chave !== ordemPernas) {
        ordemPernas = chave;
        for (const [, i] of atras) R.pernasTras.appendChild(pernaEl[i].g);
        for (const [, i] of frente) R.pernasFrente.appendChild(pernaEl[i].g);
      }

      // cauda: base no alto da garupa, pendurada, com onda
      const querCF = s < .32;
      if (querCF !== caudaNaFrente) { caudaNaFrente = querCF; (querCF ? R.slotCF : R.slotCT).appendChild(R.cauda); }
      const cb0 = T(W(CAUDA0.u, 0, CAUDA0.h));
      const bxs = -c;
      let ang = 90 - (24 + P.cauA) * bxs, cx0 = cb0[0], cy0 = cb0[1];
      for (let i = 0; i <= NCA; i++) {
        const u = i / NCA;
        const onda = P.cauAmp * Math.sin(fase.cauda - i * .7) * (.3 + .7 * u) + IMP.flick * u * u;
        const A = (ang + onda * (i ? 1 : .4)) * RAD;
        poeT(R.ca[i], `translate(${n(cx0)},${n(cy0)}) rotate(${n(A / RAD)}) scale(${ESC})`);
        cx0 += LCA * ESC * Math.cos(A); cy0 += LCA * ESC * Math.sin(A);
        ang += 2 * bxs;
      }

      // pescoço
      let w = W(PESC0.u, 0, PESC0.h);
      const pts = [T(w)], gam = [];
      for (let i = 0; i < N_PESC; i++) {
        const a = (P.nA + P.nAw * (1 - i / N_PESC * .5) + i * P.nC) * RAD + P.incl, g = th + P.nTh + i * P.nY;
        gam.push(g);
        const L = ESC * LS;
        w = [w[0] + L * Math.cos(a) * Math.cos(g), w[1] + L * Math.cos(a) * Math.sin(g), w[2] + L * Math.sin(a)];
        pts.push(T(w));
      }
      rig.pesc = pts; rig.gam = gam;
      for (let i = 0; i < N_PESC; i++) {
        const A = pts[i], B = pts[i + 1], len = Math.hypot(B[0] - A[0], B[1] - A[1]) || .01;
        poeT(R.pc[i], `${tr(A[0], A[1], Math.atan2(B[1] - A[1], B[0] - A[0]) / RAD)} scale(${n3(len / LS)},${ESC})`);
        const r = (WN[i] + WN[i + 1]) / 4;
        poe(R.crina[i], `translate(0,${n(-Math.cos(gam[i]) * (r - 1))})`);
        if (i > 0) poeT(R.pj[i], `translate(${n(A[0])},${n(A[1])}) scale(${ESC})`);
      }
      // bolo alimentar a subir pela garganta (ruminar)
      if (P.bolo >= 0) {
        const k = limita(P.bolo, 0, 1) * (N_PESC - .6), i = Math.min(N_PESC - 1, Math.floor(k)), f = k - i;
        const A = pts[i], B = pts[i + 1], x = lerp(A[0], B[0], f), y = lerp(A[1], B[1], f);
        const an = Math.atan2(B[1] - A[1], B[0] - A[0]), r = RP(k * LS) * ESC * .92, sgn = Math.cos(gam[i]);
        atr(R.bolo, 'display', 'inline');
        atr(R.bolo, 'opacity', n3(sino(P.bolo) * 1.4 > 1 ? 1 : sino(P.bolo) * 1.4));
        poe(R.bolo, `translate(${n(x - Math.sin(an) * r * sgn)},${n(y + Math.cos(an) * r * sgn)}) rotate(${n(an / RAD)}) scale(${ESC})`);
      } else atr(R.bolo, 'display', 'none');

      // cabeça
      let psi = th + P.nTh + (N_PESC - 1) * P.nY + P.cTurn + P.cTurnG;
      psi = limita(psi, .04, PI - .04);
      const Y = Math.cos(psi);
      cabY = Y;
      const top = pts[N_PESC];
      const beta = P.cB + P.cBG + P.cBw;
      const hxm = top[0] + ESC * Y * 16, hym = top[1] - ESC * 10;
      cabMundo = [hxm, hym];
      const rot = P.cRoll + P.somR + IMP.cabR;
      poe(R.cab, `translate(${n(hxm)},${n(hym)}) scale(${ESC}) rotate(${n(rot)})`);
      const fecho = limita(1 - P.olhos * (1 - piscar), 0, 1);
      const E = estadoCabeca({ Y, beta, oE: P.oE + IMP.twE, oD: P.oD + IMP.twD, orelhas: P.orelhas + P.somB * 10, fecho, feliz: P.feliz, sobr: P.sobr,
        boca: Math.max(P.boca, P.somB), mastX: P.mastX, mastY: P.mastY, olharX: P.olharX, olharY: P.olharY, nariz: P.nariz, sorriso: P.sorriso, olhoEsc: P.olhoEsc });
      for (const k of ['ossoE', 'ossoD', 'orelhaE', 'orelhaD', 'olhoE', 'olhoD', 'narE', 'narD', 'bochE', 'bochD', 'sobrE', 'sobrD', 'cabMan', 'bocaInt']) poe(H[k], E.t[k]);
      for (const k of ['olhoE', 'olhoD', 'narE', 'narD', 'bochE', 'bochD', 'sobrE', 'sobrD']) atr(H[k], 'opacity', String(E.op[k]));
      poeT(H.ponte, E.t.ponte); poeT(H.foc, E.t.foc); poeT(H.queixo, E.t.queixo);
      atr(H.ponteR[0], 'width', String(E.a.ponteL)); atr(H.ponteR[1], 'width', String(E.a.ponteL)); atr(H.ponteL, 'width', String(Math.max(1, n(E.a.ponteL - 26))));
      atr(H.boca, 'd', E.d.boca);
      atr(H.bocaInt, 'ry', String(E.a.bocaRy)); atr(H.bocaInt, 'rx', String(E.a.bocaRx));
      poeT(H.iris, E.t.iris);
      H.palp.forEach(e => { atr(e.s, 'd', E.d.palpS); atr(e.i, 'd', E.d.palpI); atr(e.c, 'd', E.d.cil); });
      const rr = rot * RAD, cr = Math.cos(rr), sr = Math.sin(rr);
      const paraMundo = (x, y) => [hxm + ESC * (x * cr - y * sr), hym + ESC * (x * sr + y * cr)];
      bocaMundo = paraMundo(E.a.bocaFrente[0], E.a.bocaFrente[1]);
      focMundo = paraMundo(E.a.M[0], E.a.M[1] - 10);
      desenharLingua(E, Y, beta, hxm, hym, rot);

      // sombra no chão (a luz vem da esquerda: a sombra cai um pouco para a direita)
      const g0 = T([P.X, P.Z, 0]);
      poe(R.sombra, `translate(${n(g0[0] + 34)},${n(g0[1] + 4)}) scale(${n(ESC * (70 + 150 * Math.abs(c)))},${n(ESC * 24)})`);
    }

    /* --- língua: cadeia de pontos (livre, ou a ir buscar o raminho e enrolar-se nele) --- */
    function desenharLingua(E, Y, beta, hxm, hym, rot) {
      const L = P.lingua;
      if (L < .02) { atr(R.lingua, 'display', 'none'); return; }
      atr(R.lingua, 'display', 'inline');
      const querF = P.lFrente > .5;
      if (querF !== linguaNaFrente) { linguaNaFrente = querF; (querF ? R.slotLF : R.slotLT).appendChild(R.lingua); }
      const [m0x, m0y] = E.a.lingua0;
      const b = beta * RAD;
      let a = Math.atan2(Math.sin(b) * .9 + (1 - Math.abs(Y)) * .8, Y * Math.cos(b) + (Y >= 0 ? .2 : -.2)) / RAD;   // eixo da cabeça no ecrã (de frente: para baixo)
      const sgY = Y >= 0 ? 1 : -1;
      const livre = [[m0x, m0y]];
      let x = m0x, y = m0y, an = a - sgY * P.lAng;
      for (let i = 0; i < 6; i++) {
        const seg = 9.5 * L * (1 - i * .06);
        an -= sgY * P.lCurl;
        x += Math.cos(an * RAD) * seg; y += Math.sin(an * RAD) * seg;
        livre.push([x, y]);
      }
      let pts = livre;
      if (P.lAlvo > .01 && galho.ponta) {
        // alvo do raminho no referencial da cabeça (inverso de translate·scale·rotate)
        const rr = -rot * RAD, gx = (galho.ponta[0] - hxm) / ESC, gy = (galho.ponta[1] - hym) / ESC;
        const tx = gx * Math.cos(rr) - gy * Math.sin(rr), ty = gx * Math.sin(rr) + gy * Math.cos(rr);
        const alvo = [];
        for (let i = 0; i <= 6; i++) {
          const u = i / 6;
          let px, py;
          if (u <= .62) { const v = u / .62; px = lerp(m0x, tx - 5, v) + Math.sin(v * PI) * -6 * sgY; py = lerp(m0y, ty + 8, v) + Math.sin(v * PI) * 4; }
          else { const v = (u - .62) / .38, ang2 = (90 + v * 250) * RAD * sgY; px = tx + Math.cos(ang2 + PI) * 8; py = ty + Math.sin(ang2) * 8 - 2; }
          alvo.push([px, py]);
        }
        pts = livre.map((q2, i) => [lerp(q2[0], alvo[i][0], P.lAlvo), lerp(q2[1], alvo[i][1], P.lAlvo)]);
      }
      let d = `M${n(pts[0][0])},${n(pts[0][1])}`;
      for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; d += ` Q${n(pts[i][0])},${n(pts[i][1])} ${n(m[0])},${n(m[1])}`; }
      d += ` L${n(pts[pts.length - 1][0])},${n(pts[pts.length - 1][1])}`;
      let db = `M${n(pts[1][0])},${n(pts[1][1] - 2)}`;
      for (let i = 2; i < pts.length - 1; i++) db += ` L${n(pts[i][0])},${n(pts[i][1] - 2.5)}`;
      // a língua vive no referencial da cabeça: põe-se com o mesmo transform
      poe(R.lingua, `translate(${n(hxm)},${n(hym)}) scale(${ESC}) rotate(${n(rot)})`);
      atr(R.linguaC, 'd', d); atr(R.linguaF, 'd', d); atr(R.linguaB, 'd', db);
    }
    // a língua é desenhada no grupo da girafa (por cima da cabeça) ou atrás do focinho
    R.slotLF = R.girafa; R.slotLT = (() => { const g = document.createElementNS(NS, 'g'); R.girafa.insertBefore(g, R.cab); return g; })();
    R.slotLT.appendChild(R.lingua);

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
    const olhar = { foco: null, t: 0, ax: 0, ay: 0, rapido: false, cabeca: true };
    function atualizarOlhar(dt) {
      let ax, ay, aT = 0, aB = 0;
      if (olhar.foco) {
        const f = olhar.foco(), dx = f[0] - cabMundo[0], dy = f[1] - cabMundo[1];
        ax = limita(dx / 200, -1, 1); ay = limita(dy / 200, -1, 1);
        if (olhar.cabeca) {
          const base = P.th + P.nTh + (N_PESC - 1) * P.nY + P.cTurn;
          const Yd = limita(dx / 330, -.92, .92);
          aT = limita(Math.acos(Yd) - base, -1.6, 1.6);
          aB = limita(dy / 260 * 22, -26, 22);
        }
      } else {
        olhar.t -= dt;
        if (olhar.t <= 0) {
          olhar.t = aleat(700, 2600);
          if (Math.random() < .45) { olhar.ax = 0; olhar.ay = 0; } else { olhar.ax = aleat(-.6, .6); olhar.ay = aleat(-.4, .3); }
        }
        ax = olhar.ax; ay = olhar.ay;
      }
      const kO = 1 - Math.exp(-dt / 60), kC = 1 - Math.exp(-dt / (olhar.rapido ? 110 : 260));
      P.olharX += (ax - P.olharX) * kO; P.olharY += (ay - P.olharY) * kO;
      P.cTurnG += (aT - P.cTurnG) * kC; P.cBG += (aB - P.cBG) * kC;
    }
    const tiques = { orelha: aleat(2000, 5000), cauda: aleat(3000, 7000) };
    function atualizarTiques(dt) {
      tiques.orelha -= dt; tiques.cauda -= dt;
      if (tiques.orelha <= 0) {
        tiques.orelha = aleat(1800, 5500);
        const k = Math.random() < .5 ? 'twE' : 'twD';
        impulso(k, aleat(-26, -16), aleat(200, 300));
        if (Math.random() < .35) impulso(k, aleat(-18, -10), 260);
      }
      if (tiques.cauda <= 0) { tiques.cauda = aleat(2500, 7000); impulso('flick', aleat(18, 30) * (Math.random() < .5 ? -1 : 1), aleat(600, 900), 'onda'); }
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
    const sem = (o, ...ks) => { const r = Object.assign({}, o); for (const k of ks) delete r[k]; return r; };

    /* --- pés: um passo (levanta, avança em arco, pousa) e recompor os pés fora do sítio --- */
    function* passo1(f, alvo, ms, alt = 26) {
      const x0 = f.x, z0 = f.z;
      yield* durante(ms, u => {
        const e = eseno(u);
        f.x = lerp(x0, alvo[0], e); f.z = lerp(z0, alvo[1], e); f.y = sino(u) * alt * ESC; f.inc = -sino(u) * 22;
      });
      f.y = 0; f.inc = 0;
    }
    function* recomporPes(ms = 260) {
      const fora = pes.filter(f => { const r = restPe(f.pe, P.X, P.Z, P.th); return f.y > .5 || Math.hypot(f.x - r[0], f.z - r[1]) > 3; });
      if (!fora.length) return;
      const lado = l => fora.filter(f => f.pe.lado === l);
      for (const grupo of [lado(1), lado(-1)]) {
        if (!grupo.length) continue;
        yield* juntos(...grupo.map((f, i) => (function* () { yield* espera(i * 40); yield* passo1(f, restPe(f.pe, P.X, P.Z, P.th), ms, f.y > .5 ? f.y / ESC + 6 : 22); })()));
      }
    }
    // pisar para o sítio que a pose atual pede (patas da frente afastadas, etc.), uma pata de cada vez
    function* pisarPara(ids, ms) {
      for (const id of ids) { const f = peDe(id); yield* passo1(f, restPe(f.pe, P.X, P.Z, P.th), ms, 22); }
    }

    /* --- virar no sítio: o corpo roda, o pescoço adianta-se, as patas pisam aos pares (lado a lado) --- */
    function* virar(th1, ms, X1) {
      const th0 = P.th, X0 = P.X, x1 = X1 == null ? X0 : X1;
      const thEm = u => lerp(th0, th1, eio(limita(u, 0, 1))), XEm = u => lerp(X0, x1, eio(limita(u, 0, 1)));
      const plano = [['tE', 0, .36, .5], ['fE', .05, .41, .5], ['tD', .26, .62, .76], ['fD', .31, .67, .76], ['tE', .5, .86, 1], ['fE', .55, .91, 1], ['tD', .64, .98, 1], ['fD', .68, 1, 1]]
        .map(([id, a, b, ua]) => ({ f: peDe(id), a, b, ua, de: null, para: null, feito: false }));
      const nTh0 = P.nTh;
      yield* durante(ms, u => {
        P.th = thEm(u); P.X = XEm(u);
        P.nTh = nTh0 * (1 - u) + (thEm(u + .22) - P.th) * .9;
        P.alt = CORPO0.alt - 5 * Math.sin(u * PI * 4) ** 2 * sino(u);
        for (const st of plano) {
          if (u < st.a || st.feito) continue;
          if (!st.de) { st.de = [st.f.x, st.f.z]; st.para = restPe(st.f.pe, XEm(st.ua), P.Z, thEm(st.ua)); }
          const v = limita((u - st.a) / (st.b - st.a), 0, 1);
          st.f.x = lerp(st.de[0], st.para[0], eseno(v)); st.f.z = lerp(st.de[1], st.para[1], eseno(v)); st.f.y = sino(v) * 30 * ESC; st.f.inc = -sino(v) * 24;
          if (v >= 1) { st.feito = true; st.f.y = 0; st.f.inc = 0; }
        }
      });
      P.nTh = 0;
    }

    /* --- andar «a passo travado»: as duas patas do mesmo lado quase juntas, pés presos ao chão (por distância) --- */
    const PASSO = { D: 150, beta: .6, ordem: { tE: 0, fE: .07, tD: .5, fD: .57 } };
    function perfilAndar(u, a = .2) {
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
      if (ini >= total - 2) return { F: de, alt: 0 };                 // já não há caminho para este passo: fica (assenta no fim)
      const qq = limita((d - ini) / Math.max(1, Math.min(dHi, total) - ini), 0, 1);   // o último passo acaba quando o corpo pára
      return { F: lerp(de, para, eseno(qq)), alt: de === para ? 0 : Math.sin(PI * qq) };
    }
    function* andar(xFim, ms) {
      const x0 = P.X, dir = Math.sign(xFim - x0) || 1, total = Math.abs(xFim - x0);
      const base = pes.map(f => [f.x, f.z]);
      yield* durante(ms, u => {
        const d = total * perfilAndar(u);
        P.X = x0 + dir * d;
        const m = Math.min(suave(limita(u / .14, 0, 1)), suave(limita((1 - u) / .14, 0, 1)));
        pes.forEach((f, i) => {
          const r = pePasso(d, PASSO.ordem[f.pe.id], total);
          f.x = base[i][0] + dir * r.F; f.z = base[i][1]; f.y = r.alt * 34 * ESC; f.inc = -r.alt * 26;
        });
        const ph = d / PASSO.D * TAU;
        P.alt = -4.5 * Math.cos(2 * ph) * m;
        P.nAw = 5 * Math.sin(2 * ph + .7) * m;          // o pescoço balança para a frente e para trás duas vezes por passada
        P.cBw = -4 * Math.sin(2 * ph + .2) * m;         // a cabeça compensa, para os olhos ficarem quase parados
        P.cauA = 6 * Math.sin(ph) * m;
      });
      P.nAw = 0; P.cBw = 0; P.cauA = 0; P.alt = 0;
      const fora = pes.filter(f => { const r = restPe(f.pe, P.X, P.Z, P.th); return Math.hypot(f.x - r[0], f.z - r[1]) > 3 || f.y > .5; });
      if (fora.length) yield* juntos(...fora.map((f, i) => (function* () { yield* espera(i * 50); yield* passo1(f, restPe(f.pe, P.X, P.Z, P.th), 200, 16); })()));
    }

    /* --- comportamentos (fora): 7 diferentes, ao acaso a cada 4–9 s, sem repetir --- */
    function* recompor(ms = 420) {
      yield* recomporPes();
      yield* tw(Object.assign({}, CORPO0, ROSTO0, { lFrente: 0, bolo: -1, mast: 0, mastX: 0, mastY: 0 }), ms);
      P.bolo = -1;
    }
    function* mastigar(ms, forca = 1) {          // maxilar de lado a lado (a girafa mói as folhas)
      yield* durante(ms, (u, t) => {
        const k = forca * Math.min(1, t / 200, (ms - t) / 200);
        const f = t / 1000 * TAU * 1.7;
        P.mastX = Math.sin(f) * 4.5 * k; P.mastY = (1 - Math.cos(2 * f)) * 1.6 * k; P.boca = .05 * k + Math.max(0, Math.sin(2 * f)) * .08 * k;
        P.nariz = Math.max(0, Math.sin(2 * f + 1)) * .3 * k;
      });
      P.mastX = 0; P.mastY = 0; P.boca = 0; P.nariz = 0;
    }
    function* ruminar() {
      yield* tw({ olhos: .75, oE: -6, oD: -6, cB: 46 }, 400);
      P.bolo = 0;
      yield* juntos(tw({ bolo: 1 }, 1300, eseno), (function* () { yield* espera(900); yield* tw({ boca: .25, nariz: .5 }, 250); yield* tw({ boca: 0, nariz: 0 }, 200); })());
      P.bolo = -1;
      yield* juntos(mastigar(3600), (function* () { yield* espera(1200); yield* tw({ olhos: .45 }, 600); yield* espera(900); yield* tw({ olhos: .8 }, 500); })());
      yield* tw({ olhos: 1, oE: 0, oD: 0, cB: CORPO0.cB }, 400);
    }
    function* olharCrianca() {               // baixa a cabeça para nós, curiosa, e inclina-a
      yield* tw({ nA: 64, nC: -9.5, nTh: -1, cTurn: -.12, cB: 22, incl: -.05, alt: -10, olhoEsc: 1.08, oE: 14, oD: 14, sobr: .6 }, 1200, eio);
      yield* tw({ cRoll: 14, sobr: 1 }, 420);
      yield* tw({ olhos: .06, feliz: .45 }, 380, eseno); yield* espera(160); yield* tw({ olhos: 1, feliz: 0 }, 420, eseno);
      yield* espera(500);
      yield* tw({ cRoll: -12 }, 600);
      impulso('twE', -22, 300); yield* espera(500);
      yield* tw({ cRoll: 0, sorriso: 1 }, 400);
      yield* espera(700);
      yield* tw(Object.assign({}, sem(CORPO0, 'fAbre', 'fAvanca'), { olhoEsc: 1, oE: 0, oD: 0, sobr: 0, sorriso: ROSTO0.sorriso }), 1100, eio);
    }
    function* lamberNariz() {                // a língua comprida sai e limpa as narinas
      yield* tw({ cB: 34, cTurn: -.8, oE: 6, oD: 6 }, 380);
      P.lFrente = 1;
      for (let i = 0; i < 3; i++) {
        yield* tw({ lingua: 1.15, lAng: -22, lCurl: 31, boca: .3, nariz: .6 }, 300, esai);
        yield* tw({ lAng: -8, lCurl: 37 }, 260);
        yield* tw({ lingua: .3, lAng: -40, lCurl: 14, boca: .15, nariz: .2 }, 240, eentra);
      }
      yield* tw({ lingua: 0, lAng: 0, lCurl: 0, boca: 0, nariz: 0 }, 220);
      P.lFrente = 0;
      yield* juntos(mastigar(900, .6), tw({ cB: CORPO0.cB, cTurn: CORPO0.cTurn, oE: 0, oD: 0 }, 600));
    }
    const PT = { arvore: [1110, 200], monte: [600, 360], ceu: [820, 140], crianca: [700, 520], rochas: [1480, 660], termiteira: [330, 520] };
    function* olharEmVolta() {
      const alvos = [PT.arvore, PT.monte, PT.ceu, PT.rochas, PT.termiteira].sort(() => Math.random() - .5).slice(0, 3);
      alvos.push(PT.crianca);
      for (const a of alvos) {
        olhar.foco = () => a;
        yield* tw({ oE: -8, oD: -8 }, 280);
        yield* espera(aleat(900, 1400));
        if (Math.random() < .5) { impulso(Math.random() < .5 ? 'twE' : 'twD', -24, 260); }
      }
      olhar.foco = null;
      yield* tw({ oE: 0, oD: 0 }, 320);
    }
    function* abanarCabeca() {               // uma mosca chateia-a: orelhas a abanar e a cabeça sacode-se
      const ev = { x: cabMundo[0] - 160, y: cabMundo[1] - 80 };
      atr(R.mosca, 'display', 'inline');
      let tt = 0;
      const voar = (u, alvoX, alvoY) => { ev.x = lerp(ev.x, alvoX + 26 * Math.sin(tt * .012), u); ev.y = lerp(ev.y, alvoY + 18 * Math.cos(tt * .017), u); };
      const mosca = () => { poe(R.mosca, `translate(${n(ev.x)},${n(ev.y)}) rotate(${n(10 * Math.sin(tt * .02))})`); R.asasM.forEach(a => atr(a, 'ry', n3((.35 + .65 * Math.abs(Math.sin(tt * .9))) * 3.6))); };
      olhar.foco = () => [ev.x, ev.y]; olhar.cabeca = false;
      yield* durante(1500, (u, t) => { tt = t; voar(.06, cabMundo[0] + 40 * cabY - 30, cabMundo[1] - 50); mosca(); });
      olhar.cabeca = true;
      impulso('twE', -30, 260); impulso('twD', -30, 260);
      yield* durante(700, (u, t) => { tt += 16; voar(.08, cabMundo[0] - 40, cabMundo[1] - 30); mosca(); P.cRoll = 18 * Math.sin(u * PI * 6) * sino(u); P.oE = 20 * Math.sin(u * PI * 8); P.oD = -20 * Math.sin(u * PI * 8); });
      yield* durante(1600, (u, t) => { tt += 16; ev.x += 4; ev.y -= 2.4; mosca(); P.cRoll = 0; P.oE = 0; P.oD = 0; });
      atr(R.mosca, 'display', 'none');
      olhar.foco = null;
      yield* tw({ cRoll: 0, oE: 0, oD: 0 }, 300);
    }
    function* esfregar() {                   // dobra o pescoço para trás e coça a cabeça no dorso
      yield* tw({ nA: 22, nC: 6.5, nY: -.44, nTh: -.6, cTurn: .2, cB: 34, olhos: .6, oE: -10, oD: -10 }, 1300, eio);
      for (let i = 0; i < 4; i++) {
        yield* tw({ nY: -.48, cRoll: 10, olhos: .1, feliz: .4 }, 300, eseno);
        yield* tw({ nY: -.38, cRoll: -4 }, 300, eseno);
      }
      impulso('flick', 26, 700, 'onda');
      yield* tw(Object.assign({}, sem(CORPO0, 'fAbre', 'fAvanca'), { olhos: 1, feliz: 0, oE: 0, oD: 0 }), 1200, eio);
    }
    function* abrirPernas() {               // afasta as patas da frente e baixa-se para cheirar a erva
      P.fAbre = 26; P.fAvanca = 22;
      yield* juntos(pisarPara(['fD', 'fE'], 340), tw({ nA: 52, cB: 54 }, 680));
      yield* tw({ incl: -.17, alt: -28, nA: -30, nC: 6, nTh: -.9, cTurn: .5, cB: 66, oE: 10, oD: 10 }, 1300, eio);
      for (let i = 0; i < 3; i++) { yield* tw({ nariz: 1, cB: 76 }, 200); yield* tw({ nariz: 0, cB: 70 }, 220); }
      impulso('twD', -24, 300);
      yield* espera(400);
      yield* tw({ incl: 0, alt: 0, nA: 52, nC: CORPO0.nC, nTh: 0, cTurn: CORPO0.cTurn, cB: 50, oE: 0, oD: 0 }, 1200, eio);
      P.fAbre = 0; P.fAvanca = 0;
      yield* juntos(pisarPara(['fE', 'fD'], 320), tw({ nA: CORPO0.nA, cB: CORPO0.cB }, 640));
    }
    const COMPORTAMENTOS = { ruminar, olharCrianca, lamberNariz, olharEmVolta, abanarCabeca, esfregar, abrirPernas };
    let ultimoComp = null;
    function* cicloFora() {
      for (;;) {
        yield* espera(aleat(4000, 9000));
        let nome; do nome = escolhe(Object.keys(COMPORTAMENTOS)); while (nome === ultimoComp);
        ultimoComp = nome;
        yield* COMPORTAMENTOS[nome]();
      }
    }

    /* --- reação ao toque (fora): orelhas para cima, olhos contentes, o pescoço dá um balanço, a cauda abana --- */
    function* reacaoFora() {
      reagindo = true;
      impulso('flick', 34, 700, 'onda');
      const rosto = tw({ orelhas: 26, oE: 0, oD: 0, feliz: 1, olhos: 1, sobr: .8, sorriso: 1, boca: 0, lingua: 0, lAlvo: 0, olhoEsc: 1.06 }, 110, esai);
      const corpo = (function* () {
        P.bolo = -1; P.lFrente = 0;
        if (pes.some(f => f.y > .5) || P.fAbre > 1) { P.fAbre = 0; P.fAvanca = 0; }
        yield* juntos(recomporPes(220), tw(Object.assign({}, CORPO0, { nA: CORPO0.nA + 4, cTurn: CORPO0.cTurn - .15 }), 260, esai));
        yield* juntos(
          durante(900, u => { P.nAw = 9 * Math.sin(u * PI * 3) * (1 - u); P.cRoll = 10 * Math.sin(u * PI * 2) * (1 - u * .6); P.alt = -7 * sino(u * 3 % 1) * (1 - u); }),
          (function* () { yield* passo1(peDe(P.th > PI / 2 ? 'fD' : 'fE'), restPe(peDe(P.th > PI / 2 ? 'fD' : 'fE').pe, P.X, P.Z, P.th), 300, 30); })()
        );
        P.nAw = 0;
        olhar.foco = () => [cabMundo[0], cabMundo[1] + 200];
        yield* tw({ cRoll: 8 }, 260); yield* tw({ cRoll: 0 }, 300);
        olhar.foco = null;
      })();
      yield* juntos(rosto, corpo);
      yield* espera(200);
      reagindo = false;
      yield* tw(Object.assign({}, ROSTO0, CORPO0), 500);
    }

    /* --- acácia: raminho com mola, folhas a cair, copa a abanar --- */
    const folhas = R.fc.map(el => ({ el, vivo: false, x: 0, y: 0, vx: 0, vy: 0, r: 0, t: 0, chao: 0, fase: 0 }));
    function largarFolhas(x, y, k) {
      for (let i = 0; i < k; i++) {
        const f = folhas.find(f2 => !f2.vivo); if (!f) return;
        Object.assign(f, { vivo: true, x: x + aleat(-14, 14), y: y + aleat(-8, 8), vx: aleat(-.02, .03), vy: aleat(.02, .05), r: aleat(0, 360), t: 0, chao: aleat(772, 800), fase: aleat(0, 6) });
        atr(f.el, 'display', 'inline'); atr(f.el, 'opacity', '1');
      }
    }
    function animarFolhas(dt) {
      for (const f of folhas) {
        if (!f.vivo) continue;
        f.t += dt;
        if (f.y < f.chao) {
          f.vy = Math.min(.075, f.vy + dt * .00004);
          f.x += (f.vx + Math.sin(f.t * .004 + f.fase) * .05) * dt; f.y += f.vy * dt; f.r += dt * .12;
          if (f.y >= f.chao) { f.y = f.chao; f.t = 0; f.r = 0; }
          poe(f.el, `translate(${n(f.x)},${n(f.y)}) rotate(${n(f.r + 40 * Math.sin(f.t * .006))}) scale(1.3,${n3(.6 + .4 * Math.abs(Math.cos(f.t * .005)))})`);
        } else {
          atr(f.el, 'opacity', n3(limita(1 - f.t / 1500, 0, 1)));
          poe(f.el, `translate(${n(f.x)},${n(f.y)}) scale(1.3,.7)`);
          if (f.t > 1500) { f.vivo = false; atr(f.el, 'display', 'none'); }
        }
      }
    }
    const GL = Math.hypot(GALHO.tx - GALHO.bx, GALHO.ty - GALHO.by), GA = Math.atan2(GALHO.ty - GALHO.by, GALHO.tx - GALHO.bx);
    galho.ponta = [GALHO.tx, GALHO.ty];
    function animarGalho(dt) {
      if (P.puxa > .01) {
        // a ponta segue a boca (com a língua enrolada): o raminho dobra-se para lá, até ao limite
        const alvo = Math.atan2(bocaMundo[1] - 6 - GALHO.by, bocaMundo[0] + 6 - GALHO.bx);
        let da = (alvo - GA) / RAD; da = limita(da, -6, 30);
        galho.a = lerp(galho.a, da * P.puxa, 1 - Math.exp(-dt / 50)); galho.v = 0;
      } else {
        const h = dt / 1000;
        galho.v += (-180 * galho.a - 5 * galho.v) * h; galho.a += galho.v * h;
      }
      const a = GA + galho.a * RAD;
      galho.ponta = [GALHO.bx + Math.cos(a) * (GL - 8), GALHO.by + Math.sin(a) * (GL - 8)];
      poe(R.galho, `translate(${GALHO.bx},${GALHO.by}) rotate(${n(galho.a)})`);
    }

    /* --- comer na acácia: a pose final, e cada dentada (língua enrola o raminho, puxa, o ramo volta para trás) --- */
    function* dentada() {
      olhar.foco = () => galho.ponta; olhar.cabeca = false;
      yield* tw({ nA: COMER.nA + 2, cB: COMER.cB - 6, olhos: .9, oE: -14, oD: -14 }, 380, eio);
      P.lFrente = 1;
      yield* tw({ lingua: 1, lAlvo: 1, boca: .35 }, 420, esai);
      P.puxa = 1;
      yield* tw({ nA: COMER.nA - 7, cB: COMER.cB + 14, alt: COMER.alt - 6, olhos: .55 }, 520, eio);
      impulso('copa', .5, 900, 'mola');
      largarFolhas(galho.ponta[0], galho.ponta[1], 3 + (Math.random() * 3 | 0));
      P.puxa = 0;
      yield* tw({ lAlvo: 0, lingua: .4 }, 180);
      yield* tw({ lingua: 0, boca: 0 }, 160);
      P.lFrente = 0;
      olhar.foco = null; olhar.cabeca = true;
      yield* juntos(mastigar(2200), tw({ nA: COMER.nA, cB: COMER.cB, alt: COMER.alt, olhos: 1, oE: 0, oD: 0 }, 700));
    }
    function* olharEntreDentadas() {         // tira um pouco a cabeça das folhas e olha para nós, a mastigar
      yield* juntos(tw({ nA: 70, nC: 3.5, cB: 26, cTurn: 1, oE: 10, oD: 10, sobr: .5 }, 700, eio), mastigar(700, .8));
      yield* juntos(mastigar(1500, .8), (function* () { yield* espera(500); yield* tw({ olhos: .1, feliz: .4 }, 300, eseno); yield* tw({ olhos: 1, feliz: 0 }, 300, eseno); })());
      impulso('twD', -24, 280);
      yield* tw(Object.assign({}, COMER, { oE: 0, oD: 0, sobr: 0 }), 800, eio);
    }
    function* cicloDentro() {
      for (;;) {
        yield* juntos(mastigar(aleat(1200, 2400)), espera(1));
        const r = Math.random();
        if (r < .5) yield* dentada();
        else if (r < .75) yield* olharEntreDentadas();
        else { impulso('flick', 28, 700, 'onda'); impulso(Math.random() < .5 ? 'twE' : 'twD', -26, 280); yield* mastigar(1500); }
      }
    }
    function* reacaoDentro() {
      impulso('flick', 30, 700, 'onda');
      P.puxa = 0; P.lFrente = 0;
      yield* tw({ lingua: 0, lAlvo: 0, orelhas: 22, feliz: .6, olhos: 1, sobr: .8 }, 100, esai);
      yield* tw({ nA: 66, nC: 4.5, cB: 22, cTurn: 1.05, alt: 0 }, 500, esai);
      olhar.foco = () => [cabMundo[0] - 80, cabMundo[1] + 260]; olhar.cabeca = false;
      yield* juntos(durante(700, u => { P.cRoll = 9 * Math.sin(u * PI * 2) * (1 - u * .5); P.nAw = 5 * Math.sin(u * PI * 3) * (1 - u); }), mastigar(700, .6));
      P.nAw = 0;
      yield* tw({ olhos: .1, feliz: .7 }, 300, eseno); yield* tw({ olhos: 1, feliz: .3 }, 300, eseno);
      yield* mastigar(500, .6);
      olhar.foco = null; olhar.cabeca = true;
      yield* tw(Object.assign({}, COMER, { orelhas: 0, feliz: 0, sobr: 0, cRoll: 0 }), 800, eio);
    }

    /* --- ida à acácia: a cabeça e o pescoço viram-se primeiro, o corpo segue a 3/4, anda, estica-se e come --- */
    function* idaAcacia() {
      modo = 'indo'; reagindo = false;
      P.bolo = -1; P.lFrente = 0; P.puxa = 0;
      if (P.fAbre > 1 || P.fAvanca > 1) { P.fAbre = 0; P.fAvanca = 0; }
      olhar.foco = () => PT.arvore; olhar.rapido = true;
      yield* juntos(recomporPes(180), tw(Object.assign({}, ROSTO0, sem(CORPO0, 'cTurn', 'fAbre', 'fAvanca'), { nA: 56, oE: -10, oD: -10 }), 200, esai));
      yield* juntos(virar(HAB.th, 900, REP.X + 20), tw({ nA: 52, cTurn: 0 }, 900));
      olhar.rapido = false;
      yield* juntos(andar(HAB.X, 1000), tw({ nA: 60, cB: 34 }, 1000));
      olhar.foco = () => galho.ponta;
      yield* tw(Object.assign({}, COMER, { cB: COMER.cB + 12, olhos: 1, oE: -6, oD: -6 }), 560, eio);
      olhar.foco = () => galho.ponta; olhar.cabeca = false;
      impulso('copa', .9, 1100, 'mola'); impulso('ninho', 6, 1400, 'mola');
      largarFolhas(1120, 200, 3);
      P.lFrente = 1;
      yield* tw({ lingua: 1, lAlvo: 1, boca: .35, cB: COMER.cB }, 280, esai);
      P.puxa = 1;
      yield* tw({ nA: COMER.nA - 6, cB: COMER.cB + 12 }, 300, eio);
      largarFolhas(galho.ponta[0], galho.ponta[1], 4);
      P.puxa = 0;
      yield* tw({ lAlvo: 0, lingua: 0, boca: 0, nA: COMER.nA, cB: COMER.cB }, 220);
      P.lFrente = 0;
      olhar.foco = null; olhar.cabeca = true;
      modo = 'dentro';
    }
    /* --- volta: tira a cabeça da copa a mastigar, vira-se e regressa --- */
    function* voltaAcacia() {
      modo = 'voltando'; reagindo = false;
      P.puxa = 0; P.lFrente = 0;
      yield* juntos(tw(Object.assign({}, ROSTO0, { nA: 56, nC: 2.4, cB: 40, alt: 0, incl: 0, cTurn: -.4, cRoll: 0, lingua: 0, lAlvo: 0 }), 380, eio), mastigar(380, .8));
      impulso('copa', .4, 700, 'mola');
      olhar.foco = () => [REP.X - 260, 300]; olhar.rapido = true;
      yield* juntos(virar(PI - .1, 760), mastigar(600, .6));
      olhar.rapido = false;
      yield* andar(REP.X, 860);
      olhar.foco = null;
      yield* juntos(virar(REP.th, 420), tw(Object.assign({}, CORPO0, ROSTO0), 460));
      yield* recomporPes(180);
      modo = 'fora';
    }

    /* --- som (quase não usado: a girafa é calada): mexe a boca e as orelhas --- */
    function* somBoca(ms, silabas) {
      const lista = Array.isArray(silabas) && silabas.length ? silabas : [[0, ms / 1000]];
      let t = 0;
      for (const [a, d] of lista) {
        if (a > t) yield* espera((a - t) * 1000);
        yield* durante(limita(d * 1000, 200, 2000), u => { P.somB = .5 * sino(u); P.somR = 4 * Math.sin(u * PI); });
        t = a + d;
      }
      P.somB = 0; P.somR = 0;
    }

    /* --- cenário vivo e acontecimentos raros --- */
    function animarCena() {
      const t = tempo / 1000;
      R.nuvens.forEach((g, i) => {
        const v = [7, 4.5, 6, 3.5][i], y = [118, 196, 250, 160][i], x0 = [300, 900, 1280, 620][i];
        const x = -260 + ((x0 + 260 + t * v * calma) % 2120);
        poe(g, `translate(${n(x)},${y})`);
      });
      R.aves.forEach((g, i) => {
        const a = t * (.16 + i * .03) * calma + i * 2.1;
        poe(g, `translate(${n(1250 + Math.cos(a) * (70 + i * 18))},${n(300 + Math.sin(a) * 18 + i * 10)}) scale(${n3(.9 + .3 * Math.sin(t * 3 + i))},${n3(.7 + .5 * Math.abs(Math.sin(t * 2.6 + i)))})`);
      });
      // zebras e elefante muito ao longe, muito devagar
      R.zebras.forEach((g, i) => {
        const x = 1520 - ((t * 3.2 * calma + i * 38) % 1900), y = 574 + i * 4;
        poe(g, `translate(${n(x + i * 28)},${y}) scale(-${.62 + i * .04},${.62 + i * .04})`);
      });
      const pernaZ = n(Math.sin(t * 3.4) * 1.6);
      R.zPernas.forEach(z => poe(z, `skewX(${pernaZ})`));
      const xe = 120 + ((t * 2.4 * calma) % 1500);
      poe(R.elefante, `translate(${n(xe)},570) scale(.62)`);
      poe(R.ePernas, `skewX(${n(Math.sin(t * 2.2) * 4)})`);
      // erva da frente a ondular (com rajadas)
      const rajada = .6 + .4 * Math.sin(t * .35);
      R.ervas.forEach((g, i) => poe(g, `rotate(${n3((2.4 * Math.sin(t * 1.1 + i * .9) + 1.4 * Math.sin(t * 2.3 + i * 2)) * rajada * calma)})`));
      // copa da acácia a respirar com o vento + abanão quando a girafa puxa
      const ac = (.35 * Math.sin(t * .7) + .2 * Math.sin(t * 1.3 + 1)) * calma + IMP.copa;
      poe(R.copaMeio, `rotate(${n3(ac)},${ARV.x},430)`); poe(R.copaFrente, `rotate(${n3(ac * 1.2)},${ARV.x},430)`);
      poe(R.copaTras, `rotate(${n3(ac * .7)},${ARV.x},430)`); poe(R.ramos, `rotate(${n3(ac * .5)},${ARV.x},430)`);
      R.ninhos.forEach((g, i) => poe(g, `rotate(${n3(3 * Math.sin(t * .9 + i * 2) * calma + IMP.ninho * (i ? .5 : 1) + ac * 2)},0,-30)`));
    }
    const eventos = { prox: aleat(9000, 15000), ultimo: null };
    function iniciarEvento(tipo) {
      const ev = { tipo, x: -100, y: -100, vivo: true };
      ev.pos = () => [ev.x, ev.y];
      const gen = { picaBoi: evPicaBoi, borboleta: evBorboleta, tecelao: evTecelao, redemoinho: evRedemoinho }[tipo](ev);
      lancar('evento', gen, () => { ev.vivo = false; });
      if (modo === 'fora' && !reagindo) lancar('corpo', observar(ev), () => lancar('corpo', cicloFora()));
      else if (modo === 'dentro') { impulso('twE', -24, 400); impulso('twD', -20, 400); }
    }
    function atualizarEventos(dt) {
      if (faixas.has('evento')) return;
      eventos.prox -= dt;
      if (eventos.prox > 0) return;
      eventos.prox = aleat(15000, 40000);
      const lista = modo === 'fora' ? ['picaBoi', 'borboleta', 'tecelao', 'redemoinho'] : ['tecelao', 'redemoinho'];
      if (modo !== 'fora' && modo !== 'dentro') { eventos.prox = 3000; return; }
      let tipo; do tipo = escolhe(lista); while (tipo === eventos.ultimo && lista.length > 1);
      eventos.ultimo = tipo;
      iniciarEvento(tipo);
    }
    function* observar(ev) {
      reagindo = false;
      yield* recompor(380);
      olhar.foco = ev.pos;
      yield* tw({ oE: -12, oD: -12, olhoEsc: 1.05 }, 260, esai);
      let t = 0, prox = 900;
      while (ev.vivo && t < 14000) {
        t += yield;
        if (t > prox) {
          prox = t + aleat(1000, 1900);
          if (Math.random() < .5) impulso('flick', 26, 700, 'onda');
          impulso(Math.random() < .5 ? 'twE' : 'twD', -22, 280);
          if (ev.tipo === 'picaBoi' && Math.random() < .5) yield* durante(500, u => { P.olhos = 1 - .7 * sino(u); });
        }
      }
      olhar.foco = null;
      yield* tw({ oE: 0, oD: 0, olhoEsc: 1, olhos: 1 }, 500);
    }
    // ponto das costas (u no tronco) e do pescoço (segmento i, lado de trás) no ecrã
    const costas = u => { const y = u < 0 ? lerp(-66, -78, (u + 96) / 96) : lerp(-78, -96, u / 40); const [a, b, c, d, e, f] = rig.tm; return [a * u + c * y + e, b * u + d * y + f]; };
    const nuca = (i, f) => { const A = rig.pesc[i], B = rig.pesc[i + 1]; if (!A) return [0, 0]; const x = lerp(A[0], B[0], f), y = lerp(A[1], B[1], f), an = Math.atan2(B[1] - A[1], B[0] - A[0]), r = (WN[i] + WN[i + 1]) / 4 * ESC, sg = Math.cos(rig.gam[i]); return [x + Math.sin(an) * r * sg, y - Math.cos(an) * r * sg]; };
    function* evPicaBoi(ev) {
      const g = R.pb;
      let dirA = -1;
      const poeAve = (bate, tt, inc = 0) => {
        poe(g, `translate(${n(ev.x)},${n(ev.y)}) scale(${dirA * 1.15},1.15) rotate(${n(inc)})`);
        poe(R.pbAsa, bate ? `rotate(${n(-38 * Math.sin(tt * .05))},-2,-12) scale(1,${n3(.6 + .4 * Math.abs(Math.cos(tt * .05)))})` : 'rotate(0)');
      };
      atr(g, 'display', 'inline');
      const pousos = [() => costas(-40), () => costas(10), () => nuca(1, .5), () => nuca(2, .7)];
      ev.x = 1500; ev.y = 120; dirA = -1;
      const p0 = pousos[0]();
      yield* durante(2200, (u, tt) => { const e = esai(u), alvo = pousos[0](); ev.x = lerp(1500, alvo[0], e); ev.y = lerp(120, alvo[1] - 2, e) - 60 * sino(u); poeAve(u < .93, tt); });
      void p0;
      for (let k = 1; k < pousos.length; k++) {
        for (let j = 0; j < 2; j++) {                 // debica (carraças!)
          yield* durante(260, () => { const a = pousos[k - 1](); ev.x = a[0]; ev.y = a[1] - 2; poe(R.pbCab, `rotate(${n(0)})`); poeAve(false, 0, 0); });
          yield* durante(220, u => { const a = pousos[k - 1](); ev.x = a[0]; ev.y = a[1] - 2; poe(R.pbCab, `rotate(${n(32 * sino(u))},8,-12)`); poeAve(false, 0, 0); });
        }
        yield* espera(aleat(200, 500));
        dirA = pousos[k]()[0] > ev.x ? 1 : -1;
        const de = [ev.x, ev.y];
        yield* durante(380, (u, tt) => { const a = pousos[k](); ev.x = lerp(de[0], a[0], u); ev.y = lerp(de[1], a[1] - 2, u) - 26 * sino(u); poeAve(true, tt); });
      }
      for (let j = 0; j < 3; j++) {
        yield* durante(240, u => { const a = pousos[pousos.length - 1](); ev.x = a[0]; ev.y = a[1] - 2; poe(R.pbCab, `rotate(${n(30 * sino(u))},8,-12)`); poeAve(false, 0, 0); });
        yield* espera(160);
      }
      yield* espera(600);
      dirA = 1;
      const de = [ev.x, ev.y];
      yield* durante(1600, (u, tt) => { ev.x = lerp(de[0], 1700, eentra(u)); ev.y = lerp(de[1], 60, u) - 40 * sino(u); poeAve(true, tt); });
      atr(g, 'display', 'none');
    }
    function* evBorboleta(ev) {
      const g = R.bb;
      atr(g, 'display', 'inline');
      const asas = (tt, rapido) => { const k = rapido ? Math.abs(Math.cos(tt * .03)) : .35 + .65 * Math.abs(Math.cos(tt * .004)); poe(R.bbE, `scale(${n3(.15 + .85 * k)},1)`); poe(R.bbD, `scale(${n3(.15 + .85 * k)},1)`); };
      const ponta = () => { const s = cabY >= 0 ? 1 : -1; return [cabMundo[0] + ESC * (-14 * (1 - Math.abs(cabY)) * s - cabY * 8), cabMundo[1] - ESC * 64]; };
      const ini = [180, 380];
      yield* durante(4200, (u, tt) => {
        const c = cabMundo, pts = [ini, [340, 300], [c[0] - 120, c[1] - 80], [c[0] + 30, c[1] - 150], [c[0] + 110, c[1] - 40], [c[0] + 20, c[1] - 120]];
        const [x, y] = catmull(pts, u);
        ev.x = x + 8 * Math.sin(tt * .01); ev.y = y + 10 * Math.sin(tt * .013);
        poe(g, `translate(${n(ev.x)},${n(ev.y)}) rotate(${n(14 * Math.sin(tt * .006))})`); asas(tt, true);
      });
      const de = [ev.x, ev.y];
      yield* durante(700, (u, tt) => { const a = ponta(); ev.x = lerp(de[0], a[0], eseno(u)); ev.y = lerp(de[1], a[1], eseno(u)) - 10 * sino(u); poe(g, `translate(${n(ev.x)},${n(ev.y)})`); asas(tt, true); });
      // pousada no ossicone: a girafa revira os olhos para cima
      yield* durante(2600, (u, tt) => { const a = ponta(); ev.x = a[0]; ev.y = a[1]; poe(g, `translate(${n(ev.x)},${n(ev.y)}) rotate(${n(-8 * cabY)})`); asas(tt, false); P.olharY = -1; });
      const de2 = [ev.x, ev.y];
      yield* durante(2400, (u, tt) => { ev.x = lerp(de2[0], de2[0] + 500, eentra(u)) + 30 * Math.sin(u * 9); ev.y = lerp(de2[1], 60, u); poe(g, `translate(${n(ev.x)},${n(ev.y)})`); asas(tt, true); });
      atr(g, 'display', 'none');
    }
    function* evTecelao(ev) {
      const g = R.tc, ninho = [930, 296];
      atr(g, 'display', 'inline');
      let dirA = 1;
      const poeAve = (bate, tt, k = 1) => {
        poe(g, `translate(${n(ev.x)},${n(ev.y)}) scale(${n3(dirA * 1.1 * k)},${n3(1.1 * k)})`);
        poe(R.tcAsa, bate ? `rotate(${n(-40 * Math.sin(tt * .055))},-2,-12) scale(1,${n3(.6 + .4 * Math.abs(Math.cos(tt * .055)))})` : 'rotate(0)');
      };
      ev.x = -40; ev.y = 300;
      yield* durante(3000, (u, tt) => { const e = eseno(u); ev.x = lerp(-40, ninho[0] - 10, e); ev.y = lerp(300, ninho[1] + 16, e) - 80 * sino(u) + 10 * Math.sin(tt * .01); poeAve(true, tt); });
      // agarra-se à entrada do ninho e entra
      yield* durante(700, (u, tt) => { ev.x = lerp(ninho[0] - 10, ninho[0], u); ev.y = lerp(ninho[1] + 16, ninho[1] + 6, u); poeAve(u < .5, tt); });
      impulso('ninho', 8, 1500, 'mola');
      yield* durante(500, (u, tt) => { ev.y = ninho[1] + 6 - 22 * u; poeAve(false, tt, 1 - u * .6); });
      atr(g, 'display', 'none');
      yield* espera(2500);
      atr(g, 'display', 'inline'); dirA = -1;
      impulso('ninho', 5, 1200, 'mola');
      yield* durante(2200, (u, tt) => { ev.x = lerp(ninho[0], -60, eentra(u)); ev.y = lerp(ninho[1] + 10, 200, u) - 40 * sino(u); poeAve(true, tt); });
      atr(g, 'display', 'none');
    }
    function* evRedemoinho(ev) {
      atr(R.redem, 'display', 'inline');
      yield* durante(9000, (u, tt) => {
        ev.x = lerp(260, 1350, u); ev.y = 560;
        atr(R.redem, 'opacity', n3(Math.min(1, u * 5, (1 - u) * 5) * .85));
        poe(R.redem, `translate(${n(ev.x)},${ev.y})`);
        poe(R.redemIn, `skewX(${n(8 * Math.sin(tt * .002))})`);
        R.rd.forEach((e, i) => poe(e, `translate(${n(5 * Math.sin(tt * .008 + i))},0) scale(${n3(1 + .15 * Math.sin(tt * .01 + i * 1.3))},1)`));
      });
      atr(R.redem, 'display', 'none');
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
        atualizarImpulsos(dt);
        atualizarPiscar(dt);
        atualizarTiques(dt);
        for (const nome of Array.from(faixas.keys())) avancar(nome, dt);
        atualizarOlhar(dt);
        atualizarEventos(dt);
        animarCena();
        animarGalho(dt);
        animarFolhas(dt);
        desenhar();
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    lancar('corpo', cicloFora());
    desenhar();

    return {
      animal: R.girafa,
      habitat: R.habitat,
      reagir() {
        if (!vivo) return;
        if (modo === 'fora') lancar('corpo', reacaoFora(), () => { reagindo = false; lancar('corpo', cicloFora()); });
        else if (modo === 'dentro') lancar('corpo', reacaoDentro(), () => lancar('corpo', cicloDentro()));
        else { impulso('twE', -14, 300); impulso('twD', -14, 300); }
      },
      fazerSom(ms, silabas) {
        if (!vivo) return;
        lancar('boca', somBoca(limita(ms || 800, 200, 3000), silabas));
        impulso('twE', -16, 300); impulso('twD', -16, 300);
      },
      irAoHabitat() {
        return new Promise(res => {
          if (!vivo || modo !== 'fora') { res(); return; }
          lancar('corpo', idaAcacia(), () => { res(); lancar('corpo', cicloDentro()); });
        });
      },
      voltar() {
        return new Promise(res => {
          if (!vivo || modo !== 'dentro') { res(); return; }
          lancar('corpo', voltaAcacia(), () => { res(); lancar('corpo', cicloFora()); });
        });
      },
      destruir() {
        vivo = false;
        faixas.clear();
        impulsos.length = 0;
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola (modo de desenvolvimento)
      _teste: { P, pes, modo: () => modo, evento: iniciarEvento, comportamento: nome => lancar('corpo', COMPORTAMENTOS[nome](), () => lancar('corpo', cicloFora())), desenhar, cab: () => cabMundo, boca: () => bocaMundo, galho }
    };
  }

  return { icone: iconeSVG(), montar };
})();
