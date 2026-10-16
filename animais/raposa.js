/* Raposa — «Os Meus Animais». Contrato e regras: REGRAS-ANIMAIS.md.
   Cena: um bosque de outono ao fim da tarde (luz dourada de cima à esquerda a entrar entre as árvores), com carvalhos,
   castanheiros e bétulas, raios de luz, folhas a cair a rodopiar, tapete de folhas, cogumelos, bolotas, um tronco com
   musgo, fetos, um pisco no tronco e árvores ao longe na névoa. O habitat é a toca entre as raízes de um carvalho velho.
   A raposa é um boneco «2,5D» (como o cão): um esqueleto 3D simples projetado no ecrã em cada quadro — tronco, pescoço,
   cabeça feita de elipsoides (crânio, bochechas, focinho, maxilar, nariz) ordenados pela profundidade, orelhas planas
   projetadas com uma matriz afim (vê-se a parte de dentro ou as costas pretas), 4 patas de 3 segmentos com IK e passos
   presos ao chão, e uma cauda farfalhuda de 7 segmentos com onda. Entra na toca por camadas: as peças que estão para lá
   da boca da toca são recortadas pela silhueta do carvalho (com a boca da toca aberta). */
'use strict';
MODULOS.raposa = (() => {
  /* =====================================================================================
     1. Utilidades
     ===================================================================================== */
  const NS = 'http://www.w3.org/2000/svg';
  const PI = Math.PI, TAU = 2 * PI, GRAU = 180 / PI;
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const passo = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const sinoide = t => 0.5 - 0.5 * Math.cos(PI * clamp(t, 0, 1));           // abranda no início e no fim
  const janela = (t, a, b, c, d) => passo(a, b, t) * (1 - passo(c, d, t));  // sobe entre a–b e desce entre c–d
  const rnd = (a, b) => a + Math.random() * (b - a);
  const n1 = x => Math.round(x * 10) / 10;
  const n3 = x => Math.round(x * 1000) / 1000;
  const angDif = (a, b) => { let d = (b - a) % TAU; if (d > PI) d -= TAU; if (d < -PI) d += TAU; return d; };
  function semente(s) {                       // gerador aleatório com semente (o cenário sai sempre igual)
    return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function mola(s, alvo, w, dt) {             // mola criticamente amortecida, solução exata (estável com qualquer dt)
    const e = Math.exp(-w * dt), d = s.x - alvo, k = (s.v + w * d) * dt;
    s.x = alvo + (d + k) * e; s.v = (s.v - w * k) * e;
  }
  function molaElastica(s, alvo, k, c, dt) {  // mola com balanço (orelhas, fetos da toca)
    const n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n;
    for (let i = 0; i < n; i++) { s.v += (k * (alvo - s.x) - c * s.v) * h; s.x += s.v * h; }
  }
  function bezier(p, t) {
    const m = 1 - t;
    return [m * m * m * p[0][0] + 3 * m * m * t * p[1][0] + 3 * m * t * t * p[2][0] + t * t * t * p[3][0],
            m * m * m * p[0][1] + 3 * m * m * t * p[1][1] + 3 * m * t * t * p[2][1] + t * t * t * p[3][1]];
  }
  function caminho(p) {                       // curva de Bézier percorrida a velocidade constante (pelo comprimento)
    const N = 48, ac = [0]; let ant = bezier(p, 0);
    for (let i = 1; i <= N; i++) { const q = bezier(p, i / N); ac.push(ac[i - 1] + Math.hypot(q[0] - ant[0], q[1] - ant[1])); ant = q; }
    const tot = ac[N];
    const tDe = s => { const alvo = clamp(s, 0, 1) * tot; let i = 1; while (i < N && ac[i] < alvo) i++; const f = (alvo - ac[i - 1]) / Math.max(1e-6, ac[i] - ac[i - 1]); return (i - 1 + f) / N; };
    return {
      pos: s => bezier(p, tDe(s)),
      rumo: s => { const t = tDe(s), a = bezier(p, Math.max(0, t - 0.01)), b = bezier(p, Math.min(1, t + 0.01)); return Math.atan2(b[1] - a[1], b[0] - a[0]); }
    };
  }
  // Contorno «fofo» (tufos de pelo) à volta de uma elipse: tufos em forma de chama, ligeiramente varridos
  function fofo(cx, cy, rx, ry, n, amp, fase, varre) {
    const pt = (a, k) => `${n1(cx + rx * k * Math.cos(a))},${n1(cy + ry * k * Math.sin(a))}`;
    let d = `M${pt(fase, 1)}`;
    for (let i = 1; i <= n; i++) {
      const a0 = fase + (i - 1) / n * TAU, a1 = fase + i / n * TAU, am = (a0 + a1) / 2 + varre * (a1 - a0);
      d += `Q${pt(a0 + 0.55 * (am - a0), 1 + amp * 0.2)} ${pt(am, 1 + amp)}Q${pt(am + 0.3 * (a1 - am), 1 + amp * 0.1)} ${pt(a1, 1)}`;
    }
    return d + 'Z';
  }

  /* =====================================================================================
     2. Medidas e poses da raposa
     ===================================================================================== */
  const YB = 750;            // y do chão no plano da boca da toca (profundidade 0)
  const KZ = 0.18;           // quanto a profundidade (z) mexe no y do ecrã: vista ligeiramente de cima
  const HC = 140;            // altura do centro do tronco quando está em pé
  const R = 58;              // raio do crânio
  const REP = { x: 545, z: 112, th: 0.35 };     // sítio de descanso no bosque (virada a 3/4 para a direita)
  const TOCA = { x: 1000, z: -140 };             // centro da boca da toca e profundidade onde se deita lá dentro
  const MONTE = { x: 380, z: 206 };              // monte de folhas onde espreita o rato
  const CO = '#4A1E0C';                          // contorno castanho-avermelhado escuro
  const NSS = 'vector-effect="non-scaling-stroke"';
  const LC = 26, CW = [14, 22, 30, 34, 33, 28, 19];   // cauda: comprimento e meia-largura de cada segmento
  // Patas: frente/trás, lado (v > 0 = lado virado para nós quando olha para a direita), segmentos e par diagonal
  const PERNAS = [
    { frente: true, v: 24, L: [46, 52, 24], par: 0 },
    { frente: true, v: -24, L: [46, 52, 24], par: 1 },
    { frente: false, v: 28, L: [48, 50, 38], par: 1 },
    { frente: false, v: -28, L: [48, 50, 38], par: 0 },
  ];
  // Pose base (em pé). Todas as outras só dizem o que muda.
  const EM_PE = {
    alt: 0, incl: 0, cabU: 40, cabH: 84, cabYaw: 0.42, cabNod: 0.04, cabRoll: 0,
    dobraF: 0.86, dobraT: 0.66, fixF: 0, fixT: 0, pFU: 8, pTU: 28, pTV: 0, pFH: 0, pTH: 0, cruz: 0,
    cauElev: -1.25, cauCurl: 0.3, cauAmp: 0.16, cauVel: 0.7, cauLado: 0,
    orelhas: 0, achatar: 0, rodaE: 0, rodaD: 0, fecho: 0, feliz: 0, esc: 1, dilata: 0,
    boca: 0, lingua: 0, lambe: 0, nariz: 0, resp: 1, respVel: 0.28, enrolar: 0
  };
  const SENTADO = { alt: -42, incl: 0.55, cabU: 30, cabH: 80, dobraF: 0.9, dobraT: 0.4, fixT: 1, pTU: 40, pTV: 4, cauElev: -1.1, cauCurl: 0.04, cauAmp: 0.05, cauVel: 0.5 };
  const DEITADO = { alt: -88, incl: 0, cabU: 30, cabH: -14, cabNod: 0.1, dobraF: 0.85, dobraT: 0.38, fixF: 1, fixT: 1, pFU: 46, pTU: 34, pTV: 20, cruz: 0.5, cauElev: -0.7, cauCurl: 0.02, cauAmp: 0.04, cauVel: 0.5, respVel: 0.2 };
  const AGACHADO = { alt: -64, incl: -0.05, cabU: 44, cabH: 22, cabNod: 0.22, dobraF: 0.6, dobraT: 0.5, cauElev: -0.32, cauCurl: 0.04, cauAmp: 0.08 };
  const VENIA = { alt: -24, incl: -0.42, cabU: 50, cabH: 34, cabNod: -0.05, dobraF: 0.86, fixF: 1, pFU: 66, cauElev: 0.3, cauCurl: 0.12, cauAmp: 0.32, cauVel: 1.5, feliz: 0.4 };
  const CHAVES = Object.keys(EM_PE);
  const OMEGA = { fecho: 40, boca: 26, orelhas: 12, achatar: 12, rodaE: 10, rodaD: 10, feliz: 14, cabYaw: 7, cauVel: 4, cauAmp: 5, cauLado: 4, resp: 4, respVel: 3, lingua: 12, esc: 12, dilata: 8, nariz: 14, lambe: 18, fixF: 12, fixT: 12, cruz: 6, cabU: 10, cabH: 10, incl: 8 };
  const misturar = (A, pose, w) => { if (w > 0) for (const k in pose) A[k] = lerp(A[k], pose[k], w); };

  /* =====================================================================================
     3. Desenho da raposa — gradientes, patas, cauda, tronco, cabeça
     ===================================================================================== */
  function defsRaposa(u) {
    return `<linearGradient id="${u}pelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB062"/><stop offset=".5" stop-color="#F08838"/><stop offset="1" stop-color="#CC6026"/></linearGradient>
<linearGradient id="${u}perna" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FAA458"/><stop offset=".55" stop-color="#E57A34"/><stop offset="1" stop-color="#BC5822"/></linearGradient>
<radialGradient id="${u}coxa" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#FFB466"/><stop offset=".6" stop-color="#EE8338"/><stop offset="1" stop-color="#C25A24"/></radialGradient>
<linearGradient id="${u}meia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E27A36"/><stop offset=".28" stop-color="#A84C22"/><stop offset=".52" stop-color="#3C2219"/><stop offset="1" stop-color="#22120C"/></linearGradient>
<linearGradient id="${u}preto" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5A3A2C"/><stop offset=".5" stop-color="#2E1A12"/><stop offset="1" stop-color="#170B06"/></linearGradient>
<radialGradient id="${u}pata" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#5C3E30"/><stop offset=".6" stop-color="#2A1710"/><stop offset="1" stop-color="#150A06"/></radialGradient>
<radialGradient id="${u}cabeca" cx=".38" cy=".3" r=".78"><stop offset="0" stop-color="#FFC27A"/><stop offset=".55" stop-color="#F28A3A"/><stop offset="1" stop-color="#C95F26"/></radialGradient>
<radialGradient id="${u}laranja" cx=".36" cy=".28" r=".8"><stop offset="0" stop-color="#FFC07A"/><stop offset=".6" stop-color="#F08838"/><stop offset="1" stop-color="#C85E26"/></radialGradient>
<radialGradient id="${u}branco" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#FBF3E8"/><stop offset="1" stop-color="#E4CFB8"/></radialGradient>
<radialGradient id="${u}peito" cx=".45" cy=".25" r=".85"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#FAF0E2"/><stop offset="1" stop-color="#E2CBB0"/></radialGradient>
<linearGradient id="${u}orelha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C0F09"/><stop offset=".42" stop-color="#2E1912"/><stop offset=".6" stop-color="#94401A"/><stop offset=".8" stop-color="#E07834"/><stop offset="1" stop-color="#F29048"/></linearGradient>
<linearGradient id="${u}orelhaIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1610"/><stop offset=".55" stop-color="#5E3226"/><stop offset="1" stop-color="#8C5040"/></linearGradient>
<radialGradient id="${u}iris" cx=".5" cy=".62" r=".62"><stop offset="0" stop-color="#FFE07A"/><stop offset=".5" stop-color="#F2A42C"/><stop offset=".85" stop-color="#B8620E"/><stop offset="1" stop-color="#6E3608"/></radialGradient>
<radialGradient id="${u}nariz" cx=".35" cy=".28" r=".8"><stop offset="0" stop-color="#6E5248"/><stop offset=".45" stop-color="#2A1A14"/><stop offset="1" stop-color="#0E0604"/></radialGradient>
<radialGradient id="${u}lingua" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#F8A6B2"/><stop offset="1" stop-color="#D9566F"/></radialGradient>
<radialGradient id="${u}bocaIn" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#8E2A30"/><stop offset="1" stop-color="#4A1016"/></radialGradient>
<linearGradient id="${u}cauda" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFB466"/><stop offset=".5" stop-color="#EE8436"/><stop offset="1" stop-color="#B85020"/></linearGradient>
<linearGradient id="${u}caudaPonta" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EE8436"/><stop offset=".42" stop-color="#C9692E"/><stop offset=".62" stop-color="#F4D2B2"/><stop offset=".8" stop-color="#FFF8EE"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient>
<linearGradient id="${u}caudaBranca" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F7EFE6"/><stop offset="1" stop-color="#D9C6B2"/></linearGradient>
<radialGradient id="${u}sombra"><stop offset="0" stop-color="#3A200C" stop-opacity=".5"/><stop offset=".6" stop-color="#3A200C" stop-opacity=".24"/><stop offset="1" stop-color="#3A200C" stop-opacity="0"/></radialGradient>
<clipPath id="${u}olho"><ellipse rx="13" ry="14.5"/></clipPath>`;
  }
  // Cores: com gradientes (no cenário) ou lisas (no ícone, que não deve usar ids)
  function cores(u) {
    const g = k => `url(#${u}${k})`;
    if (u) return { cabeca: g('cabeca'), laranja: g('laranja'), branco: g('branco'), orelha: g('orelha'), orelhaIn: g('orelhaIn'), iris: g('iris'), nariz: g('nariz'), lingua: g('lingua'), bocaIn: g('bocaIn'), peito: g('peito') };
    return { cabeca: '#F08A3A', laranja: '#EF8838', branco: '#FFF8EE', orelha: '#E07834', orelhaIn: '#4A281E', iris: '#EFA02C', nariz: '#221410', lingua: '#EE7E92', bocaIn: '#6A1A22', peito: '#FFF8EE' };
  }

  // Uma pata: 3 camadas (contorno por baixo de tudo → as articulações não mostram costuras; pelo; sombra do lado longe)
  function svgPerna(u, frente) {
    // [largura em cima, largura em baixo, comprimento]: segmentos afunilados (cápsulas)
    const segs = frente ? [[30, 17, 46], [16, 12, 52], [12.5, 11, 24]] : [[0, 0, 48], [19, 12, 50], [12.5, 11, 38]];
    const capsula = (a, b, L, e) => { const ra = a / 2 + e, rb = b / 2 + e; return `<path d="M${n1(-ra)},0 C${n1(-ra)},${n1(-ra * 1.33)} ${n1(ra)},${n1(-ra * 1.33)} ${n1(ra)},0 L${n1(rb)},${L} C${n1(rb)},${n1(L + rb * 1.33)} ${n1(-rb)},${n1(L + rb * 1.33)} ${n1(-rb)},${L}Z"/>`; };
    const forma = (i, e) => (!frente && i === 0)
      ? `<path d="M${n1(-27 - e)},${n1(8)} C${n1(-30 - e)},${n1(-30 - e)} ${n1(26 + e)},${n1(-32 - e)} ${n1(28 + e)},${n1(4)} C${n1(30 + e)},${n1(40)} ${n1(14 + e)},${n1(58 + e)} ${n1(2)},${n1(60 + e)} C${n1(-12 - e)},${n1(60 + e)} ${n1(-25 - e)},${n1(42)} ${n1(-27 - e)},${n1(8)}Z"/>`
      : capsula(segs[i][0], segs[i][1], segs[i][2], e);
    const enche = i => (i === 0 ? (frente ? 'perna' : 'coxa') : i === 1 ? 'meia' : 'preto');
    const detalhe = i => {
      if (i === 0 && !frente) return `<path d="M-24,36 C-14,52 2,58 18,54" fill="none" stroke="#B9531F" stroke-width="3" stroke-linecap="round" opacity=".55"/><path d="M-18,-12 C-8,-22 8,-24 18,-16" fill="none" stroke="#FFD09A" stroke-width="3" stroke-linecap="round" opacity=".6"/><path d="M22,26 C27,36 26,48 20,56" fill="none" stroke="#B9531F" stroke-width="2.5" stroke-linecap="round" opacity=".45"/>`;
      if (i === 0) return `<path d="M-8,30 C-14,40 -14,50 -10,58" fill="none" stroke="#B9531F" stroke-width="2.6" stroke-linecap="round" opacity=".5"/><path d="M5,-6 C8,10 8,28 5,44" fill="none" stroke="#FFD09A" stroke-width="2.6" stroke-linecap="round" opacity=".5"/>`;
      if (i === 1) return `<path d="M${segs[1][0] * 0.16},4 L${segs[1][0] * 0.16},${segs[1][2] - 4}" stroke="#F7B27A" stroke-width="2.6" stroke-linecap="round" opacity=".35"/>`;
      return `<path d="M${segs[2][0] * 0.14},2 L${segs[2][0] * 0.14},${segs[2][2] - 4}" stroke="#7A5444" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>`;
    };
    let c = '', f = '', s = '';
    for (let i = 0; i < 3; i++) {
      c += `<g class="g${i}">${forma(i, 3)}</g>`;
      f += `<g class="g${i}" fill="url(#${u}${enche(i)})">${forma(i, 0)}${detalhe(i)}</g>`;
      s += `<g class="g${i}">${forma(i, 0)}</g>`;
    }
    c += `<g class="g3"><g class="pe"><ellipse rx="16.5" ry="10.3"/></g></g>`;
    f += `<g class="g3"><g class="pe"><ellipse rx="13.5" ry="7.6" fill="url(#${u}pata)"/><ellipse cx="-5" cy="-4" rx="8" ry="2.6" fill="#8A6A5A" opacity=".55"/>
<g class="dl" fill="none" stroke="#6E4E40" stroke-width="2" stroke-linecap="round"><path d="M4,-6 C6,-1 6,3 5,7"/><path d="M10,-5 C12,-1 12,3 11,6"/></g>
<g class="df" fill="none" stroke="#6E4E40" stroke-width="2" stroke-linecap="round"><path d="M-5,-3 C-6,1 -6,4 -5,8"/><path d="M5,-3 C6,1 6,4 5,8"/></g>
<g class="al" opacity="0" fill="#5E3E36"><path d="M-7,4 C-8,-2 8,-2 7,4 C5,8 -5,8 -7,4Z"/><circle cx="-9" cy="-4" r="2.6"/><circle cx="-3" cy="-7" r="2.6"/><circle cx="3" cy="-7" r="2.6"/><circle cx="9" cy="-4" r="2.6"/></g></g></g>`;
    s += `<g class="g3"><g class="pe"><ellipse rx="13.5" ry="7.6"/></g></g>`;
    return `<g fill="${CO}">${c}</g><g>${f}</g><g class="sb" fill="#3A1406" opacity="0">${s}</g>`;
  }

  // Cauda farfalhuda: 7 segmentos «fofos» (contorno de todos por baixo, depois o pelo) e o tufo branco da ponta
  function svgCauda(u) {
    let c = '', f = '';
    CW.forEach((w, i) => {
      const d = fofo(0, LC / 2, w, LC / 2 + w * 0.45, 8, 0.15, i * 0.7, 0.22);
      c += `<g class="k${i}"><path d="${d}" stroke="${CO}" stroke-width="7" stroke-linejoin="round"/></g>`;
      const enche = i < 5 ? 'cauda' : i === 5 ? 'caudaPonta' : 'caudaBranca';
      const risco = i < 5 ? `<path d="M${n1(-w * 0.45)},2 C${n1(-w * 0.55)},${LC * 0.4} ${n1(-w * 0.4)},${LC * 0.8} ${n1(-w * 0.2)},${LC + 4}" fill="none" stroke="#FFD29C" stroke-width="2.6" stroke-linecap="round" opacity=".55"/>
<path d="M${n1(w * 0.5)},0 C${n1(w * 0.62)},${LC * 0.35} ${n1(w * 0.55)},${LC * 0.7} ${n1(w * 0.35)},${LC + 6}" fill="none" stroke="#9E4418" stroke-width="2.6" stroke-linecap="round" opacity=".5"/>
<path d="M${n1(w * 0.08)},4 C${n1(w * 0.15)},${LC * 0.45} ${n1(w * 0.05)},${LC * 0.8} ${n1(-w * 0.05)},${LC + 2}" fill="none" stroke="#C25E26" stroke-width="2" stroke-linecap="round" opacity=".4"/>`
        : `<path d="M${n1(w * 0.42)},4 C${n1(w * 0.5)},${LC * 0.45} ${n1(w * 0.4)},${LC * 0.8} ${n1(w * 0.25)},${LC + 4}" fill="none" stroke="#CDB59C" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>`;
      f += `<g class="k${i}"><path d="${d}" fill="url(#${u}${enche})"/>${risco}</g>`;
    });
    const tufo = 'M-14,-4 C-18,8 -12,20 -4,30 C-3,24 0,22 2,32 C4,24 8,22 11,26 C16,14 16,4 12,-4Z';
    c += `<g class="k7"><path d="${tufo}" stroke="${CO}" stroke-width="7" stroke-linejoin="round"/></g>`;
    f += `<g class="k7"><path d="${tufo}" fill="#FFFDF8"/><path d="M-2,4 C-4,12 -3,18 -1,24" fill="none" stroke="#D6C2AC" stroke-width="2" stroke-linecap="round"/></g>`;
    return `<g fill="${CO}">${c}</g><g>${f}</g>`;
  }

  const TRONCO_D = 'M-124,-6 C-126,-40 -98,-56 -62,-54 C-26,-52 16,-58 56,-57 C98,-56 128,-36 130,-6 C132,24 116,48 88,55 C62,61 36,50 8,46 C-26,42 -62,54 -94,48 C-116,42 -122,20 -124,-6Z';
  function svgTronco(u) {
    const tufo = (x, y, c) => `<path d="M${x + 8},${y - 2} C${x + 4},${y + 8} ${x - 6},${y + 15} ${x - 14},${y + 13} C${x - 8},${y + 9} ${x - 6},${y + 4} ${x - 6},${y - 2}" fill="${c}" stroke="${CO}" stroke-width="2.6" stroke-linejoin="round" ${NSS}/>`;
    return `<g class="trM"><g class="trR">
<path d="${TRONCO_D}" fill="url(#${u}pelo)" stroke="${CO}" stroke-width="5" stroke-linejoin="round" ${NSS}/>
<path d="M-112,-36 C-90,-56 -40,-54 0,-55 C40,-57 84,-58 110,-44 C84,-46 42,-45 0,-44 C-42,-43 -86,-41 -112,-36Z" fill="#A9431A" opacity=".55"/>
<path d="M-60,40 C-30,36 -4,38 14,44 C44,52 70,56 96,50 C112,42 124,24 127,4 C126,28 108,48 84,54 C58,60 34,50 8,46 C-20,43 -44,44 -60,40Z" fill="#FFF4E6"/>
<path d="M98,-30 C120,-18 133,6 128,30 C120,48 102,56 84,55 C96,38 104,8 98,-30Z" fill="url(#${u}peito)"/>
<ellipse cx="-10" cy="-38" rx="70" ry="9" fill="#FFD6A0" opacity=".5"/>
<g fill="none" stroke-linecap="round" ${NSS}>
<path d="M66,-28 C78,-12 80,8 72,24" stroke="#C45E26" stroke-width="3" opacity=".6"/>
<path d="M-70,-30 C-88,-12 -90,10 -80,26" stroke="#B9531F" stroke-width="3" opacity=".55"/>
<path d="M-34,-28 C-22,-34 -8,-34 4,-30" stroke="#FFD09A" stroke-width="2.5" opacity=".8"/>
<path d="M18,-22 C30,-27 42,-26 52,-20" stroke="#FFD09A" stroke-width="2.5" opacity=".8"/>
<path d="M-40,6 C-30,14 -16,16 -4,14" stroke="#C45E26" stroke-width="2.5" opacity=".45"/>
<path d="M-100,10 C-104,22 -100,34 -92,40" stroke="#B9531F" stroke-width="2.5" opacity=".5"/>
</g>${tufo(96, 50, '#FFF4E6')}${tufo(64, 52, '#FFF4E6')}${tufo(16, 44, '#FFF4E6')}${tufo(-58, 46, '#F7A25A')}${tufo(-94, 44, '#F7A25A')}<path d="M126,6 C136,12 138,22 132,30 C138,32 138,42 128,46 C130,50 124,56 116,54" fill="#FFF4E6" stroke="${CO}" stroke-width="3" stroke-linejoin="round" ${NSS}/><path d="M-122,4 C-132,8 -134,16 -128,22 C-134,26 -132,34 -122,34" fill="#F7A25A" stroke="${CO}" stroke-width="3" stroke-linejoin="round" ${NSS}/>
</g></g>`;
  }
  function svgPeito(u) {
    return `<g class="ptM"><path class="ptC" d="M0,-56 C38,-56 60,-32 60,0 C60,34 40,58 0,60 C-40,58 -60,34 -60,0 C-60,-32 -38,-56 0,-56Z" fill="url(#${u}pelo)" stroke="${CO}" stroke-width="5" ${NSS}/>
<path d="M-36,-42 C-20,-52 20,-52 36,-42 C52,-12 50,24 30,48 L22,40 L14,56 L5,44 L-4,58 L-12,44 L-22,52 C-46,28 -52,-12 -36,-42Z" fill="url(#${u}peito)"/>
<g fill="none" stroke="#DCC2A6" stroke-width="2.5" stroke-linecap="round" ${NSS}><path d="M-15,-20 C-11,-6 -13,6 -19,18"/><path d="M13,-18 C9,-4 11,8 17,20"/><path d="M0,-6 C2,6 0,18 -3,28"/></g></g>`;
  }
  function svgGarupa(u) {
    return `<g class="gaM"><path class="gaC" d="M0,-50 C38,-55 64,-28 62,6 C60,38 36,56 0,52 C-36,56 -60,38 -62,6 C-64,-28 -38,-55 0,-50Z" fill="url(#${u}pelo)" stroke="${CO}" stroke-width="5" ${NSS}/>
<path d="M0,8 C1,22 2,36 0,50" fill="none" stroke="${CO}" stroke-width="3" opacity=".4" ${NSS}/>
<path d="M-44,18 C-36,38 -20,48 -6,47" fill="none" stroke="#FFE8D0" stroke-width="7" stroke-linecap="round" opacity=".75" ${NSS}/><path d="M44,18 C36,38 20,48 6,47" fill="none" stroke="#FFE8D0" stroke-width="7" stroke-linecap="round" opacity=".75" ${NSS}/>
<path d="M-24,-40 C-10,-46 10,-46 24,-40" fill="none" stroke="#A9431A" stroke-width="8" stroke-linecap="round" opacity=".5" ${NSS}/>
<ellipse cx="-14" cy="-32" rx="28" ry="7" fill="#FFD6A0" opacity=".45"/></g>`;
  }
  function svgPescoco(u) {
    return `<g class="pcM"><rect x="-33" y="-20" width="66" height="128" rx="30" fill="url(#${u}perna)"/><path d="M-33,22 L-33,90 M33,22 L33,90" fill="none" stroke="${CO}" stroke-width="5" stroke-linecap="round" ${NSS}/>
<g class="garg"><path d="M-22,0 C-30,30 -30,64 -22,100 C-6,110 10,110 22,100 C28,64 26,30 16,0Z" fill="url(#${u}peito)"/>
<path d="M-8,30 C-10,50 -9,70 -6,88" fill="none" stroke="#DCC2A6" stroke-width="2.4" stroke-linecap="round" ${NSS}/></g>
<path d="M-20,10 C-23,30 -22,50 -17,70" fill="none" stroke="#FFD09A" stroke-width="3" stroke-linecap="round" opacity=".5" ${NSS}/></g>`;
  }

  /* ---------- Cabeça: elipsoides projetados (elipses exatas) e feições coladas à esfera do crânio ---------- */
  const dirE = (lam, el, r) => [r * Math.cos(el) * Math.cos(lam), r * Math.cos(el) * Math.sin(lam), r * Math.sin(el)];
  const ELIPS = ['masc', 'boc0', 'boc1', 'topo', 'foc', 'nar', 'queixo', 'int', 'lin'];
  function estadoCabeca(p) {
    const cf = Math.cos(p.phi), sf = Math.sin(p.phi), cn = Math.cos(p.nu), sn = Math.sin(p.nu);
    // (frente, lado, cima) da cabeça → (x, y) no ecrã e profundidade z (z > 0 = mais perto de nós)
    const pr = (f, l, w) => { const ff = f * cn + w * sn, uu = -f * sn + w * cn, x = ff * cf - l * sf, z = ff * sf + l * cf; return [x, -uu + KZ * z, z]; };
    const t = {}, op = {}, z = {};
    // Elipsoide (centro e semi-eixos em unidades de R, inclinado 'pitch' para baixo) → matriz que leva o círculo de raio 1
    // à elipse projetada (raiz quadrada simétrica: o brilho do gradiente fica sempre em cima à esquerda)
    const elip = (k, c, ax, pitch) => {
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const a = pr(cp * ax[0] * R, 0, -sp * ax[0] * R), b = pr(0, ax[1] * R, 0), d = pr(sp * ax[2] * R, 0, cp * ax[2] * R);
      const s11 = a[0] * a[0] + b[0] * b[0] + d[0] * d[0], s12 = a[0] * a[1] + b[0] * b[1] + d[0] * d[1], s22 = a[1] * a[1] + b[1] * b[1] + d[1] * d[1];
      const s = Math.sqrt(Math.max(0, s11 * s22 - s12 * s12)), tt = Math.sqrt(s11 + s22 + 2 * s) || 1;
      const o = pr(c[0] * R, c[1] * R, c[2] * R);
      t[k] = `matrix(${n3((s11 + s) / tt)},${n3(s12 / tt)},${n3(s12 / tt)},${n3((s22 + s) / tt)},${n1(o[0])},${n1(o[1])})`;
      z[k] = o[2];
    };
    const boca = clamp(p.boca, 0, 1.3), jaw = 0.08 + boca * 0.6;
    const H = [0.4, 0, -0.36];                            // dobradiça do maxilar
    const rp = (off, a) => { const c = Math.cos(a), s = Math.sin(a); return [H[0] + off[0] * c + off[2] * s, off[1], H[2] - off[0] * s + off[2] * c]; };
    elip('masc', [0.36, 0, -0.5], [0.52, 0.62, 0.46], 0);
    elip('boc0', [0.1, 0.7, -0.46], [0.42, 0.42, 0.4], 0);
    elip('boc1', [0.1, -0.7, -0.46], [0.42, 0.42, 0.4], 0);
    elip('topo', [0.98, 0, -0.04], [0.74, 0.23, 0.18], 0.2);
    elip('foc', [1.06, 0, -0.21], [0.74, 0.28, 0.19], 0.12);
    const nz = 1 + 0.1 * p.nariz;
    elip('nar', [1.76, 0, -0.15 + 0.015 * p.nariz], [0.13 * nz, 0.17 * nz, 0.12], 0.1);
    elip('queixo', rp([0.6, 0, -0.01], jaw), [0.64, 0.21, 0.085], jaw);
    elip('int', rp([0.6, 0, 0.05], jaw * 0.5), [0.62, 0.18, 0.04 + 0.14 * boca], jaw * 0.5);
    const lb = clamp(p.lambe, 0, 1), lg = clamp(p.lingua, 0, 1);
    const cL = rp([0.56 + 0.2 * lg, 0, 0.05], jaw), cLb = [1.5, 0, -0.3];
    elip('lin', [lerp(cL[0], cLb[0], lb), 0, lerp(cL[2], cLb[2], lb)], [lerp(0.3 + 0.22 * lg, 0.24, lb), 0.13, 0.055], lerp(jaw + 0.1 * lg, -0.9, lb));
    z.masc -= 0.12 * R; z.int -= 0.3 * R; z.lin += lb > 0.3 ? 0.3 * R : -0.2 * R; z.queixo -= 0.08 * R; z.topo += 0.04 * R; z.nar += 0.3 * R;
    op.int = passo(0.04, 0.16, boca); op.lin = (boca > 0.12 || lb > 0.05) ? 1 : 0;
    // olhos (colados à esfera; o de lá encolhe e desaparece atrás do crânio)
    for (let i = 0; i < 2; i++) {
      const s = i ? -1 : 1;
      const q = pr(...dirE(0.45 * s, 0.17, 0.9 * R)), zn = q[2] / (0.9 * R), fs = zn > 0.03 ? Math.pow(zn, 0.55) : 0;
      t['olho' + i] = `translate(${n1(q[0])},${n1(q[1])}) scale(${n3(fs * p.esc)},${n3(p.esc)})`;
      z['olho' + i] = q[2] + 0.18 * R;
      t['iris' + i] = `translate(${n1(p.olhoX)},${n1(p.olhoY)})`;
      t['pup' + i] = `scale(${n3(1 + 0.6 * p.dilata)},${n3(1 + 0.12 * p.dilata)})`;
      t['psup' + i] = `translate(0,${n1(lerp(-25, 15, clamp(p.fecho, 0, 1)))})`;
      t['pinf' + i] = `translate(0,${n1(lerp(27, 4, clamp(p.feliz, 0, 1)))})`;
    }
    // orelhas: triângulos planos com base na esfera; rodam (concha para fora), abrem e deitam-se para trás
    const rotW = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), v[2]];
    const rotF = (v, a) => [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)];
    const rotL = (v, a) => [v[0] * Math.cos(a) - v[2] * Math.sin(a), v[1], v[0] * Math.sin(a) + v[2] * Math.cos(a)];
    for (let i = 0; i < 2; i++) {
      const s = i ? -1 : 1;
      const rho = (i ? p.rodaD : p.rodaE) + p.orDin[i] * 0.012 - 0.1 * p.orelhas;
      const sig = 0.34 - 0.1 * p.orelhas + 0.4 * p.achatar + p.orDin[i] * 0.004;
      const bet = 0.1 - 0.14 * p.orelhas + 1.0 * p.achatar;
      const ori = v => rotL(rotF(rotW(v, s * rho), -s * sig), bet);
      const ax = ori([0, 0, 1]), wd = ori([0, 1, 0]), nm = ori([1, 0, 0]);
      const base = pr(...dirE(1.22 * s, 0.8, 0.84 * R)), c1 = pr(...wd), c2a = pr(...ax), c2 = [-c2a[0], -c2a[1]];
      let L2 = Math.hypot(c2[0], c2[1]);
      if (L2 < 0.5) { const k = 0.5 / Math.max(L2, 1e-3); c2[0] *= k; c2[1] *= k; L2 = 0.5; if (!(Math.abs(c2[0]) + Math.abs(c2[1]) > 0.01)) { c2[0] = 0; c2[1] = -0.5; } }
      const pu = [c2[1] / L2, -c2[0] / L2], pc = (c1[0] * c2[1] - c1[1] * c2[0]) / L2, alvo = (pc >= 0 ? 1 : -1) * Math.max(Math.abs(pc), 0.34);
      c1[0] += pu[0] * (alvo - pc); c1[1] += pu[1] * (alvo - pc);
      z['or' + i] = base[2] - 0.42 * R;
      t['or' + i] = `matrix(${n3(c1[0])},${n3(c1[1])},${n3(c2[0])},${n3(c2[1])},${n1(base[0])},${n1(base[1])})`;
      op['orF' + i] = passo(-0.1, 0.3, pr(...nm)[2]);
    }
    // ordem de desenho: orelhas sempre atrás do crânio; o resto atrás ou à frente dele conforme a profundidade
    z.cranio = -0.12 * R;
    const ordem = ELIPS.concat(['or0', 'or1', 'cranio', 'olho0', 'olho1']).filter(k => k !== 'int' && k !== 'lin').sort((a, b) => z[a] - z[b]);
    ordem.splice(ordem.indexOf('queixo') + 1, 0, 'int', 'lin');   // o interior da boca e a língua ficam por cima do maxilar e por baixo do focinho
    const nar = pr(1.76 * R, 0, -0.15 * R);
    return { t, op, z, ordem, nar };
  }

  function svgCabeca(u, E, icone) {
    const C = cores(u);
    const T = k => (E.t[k] ? ` transform="${E.t[k]}"` : '');
    const O = k => (E.op[k] !== undefined ? ` opacity="${n3(E.op[k])}"` : '');
    const tufosBoc = lado => { let d = ''; const pt = (a, k) => `${n3(lado * k * Math.cos(a))},${n3(k * Math.sin(a))}`; const N = 14; for (let i = 0; i <= N; i++) { const a = -PI / 2 + i / N * TAU; if (i === 0) { d = `M${pt(a, 1)}`; continue; } const a0 = a - TAU / N, am = (a0 + a) / 2, tufo = a > 1.25 && a < 3.75; d += tufo ? `Q${pt(a0 + 0.2, 1.08)} ${pt(am + 0.12, 1.3)}Q${pt(am + 0.2, 1.06)} ${pt(a, 1)}` : `Q${pt(am, 1.03)} ${pt(a, 1)}`; } return d + 'Z'; };
    const it = {};
    const orelha = i => `<g class="hp hp-or${i}"${T('or' + i)}>
<path d="M-27,8 C-31,-20 -15,-56 -2,-77 Q0,-80 2,-77 C15,-56 31,-20 27,8 C10,14 -10,14 -27,8Z" fill="${C.orelha}" stroke="${CO}" stroke-width="3.6" stroke-linejoin="round" ${NSS}/>
${icone ? '<path d="M-15,-44 C-9,-58 -5,-68 -2,-77 Q0,-80 2,-77 C5,-68 9,-58 15,-44 C6,-40 -6,-40 -15,-44Z" fill="#2A160E"/>' : ''}<g class="orF"${O('orF' + i)}><path d="M-19,4 C-22,-18 -11,-46 -1,-62 Q0,-64 1,-62 C11,-46 22,-18 19,4 C8,8 -8,8 -19,4Z" fill="${C.orelhaIn}"/>
<path d="M-19,5 C-20,-4 -18,-12 -14,-18 C-12,-10 -10,-8 -8,-12 C-8,-22 -5,-30 -1,-36 C0,-26 2,-22 4,-24 C6,-30 9,-34 12,-36 C11,-26 12,-20 15,-16 C17,-10 19,-2 19,5 C8,9 -8,9 -19,5Z" fill="#FFF4E6" opacity=".92"/><path d="M-12,2 C-12,-6 -10,-10 -8,-12 M2,2 C1,-8 2,-16 4,-22 M10,2 C10,-6 11,-12 13,-18" fill="none" stroke="#D8BCA4" stroke-width="2" stroke-linecap="round" ${NSS}/>
<path d="M-24,6 C-20,-14 -12,-34 -4,-52" fill="none" stroke="#F6A666" stroke-width="2.6" stroke-linecap="round" opacity=".7" ${NSS}/></g></g>`;
    it.or0 = orelha(0); it.or1 = orelha(1);
    it.cranio = `<g class="hp hp-cranio"><path d="M0,-${R * 0.93} C${R * 0.62},-${R * 0.93} ${R * 1.05},-${R * 0.56} ${R * 1.05},0 C${R * 1.05},${R * 0.6} ${R * 0.6},${R * 0.97} 0,${R * 0.97} C-${R * 0.6},${R * 0.97} -${R * 1.05},${R * 0.6} -${R * 1.05},0 C-${R * 1.05},-${R * 0.56} -${R * 0.62},-${R * 0.93} 0,-${R * 0.93}Z" fill="${C.cabeca}" stroke="${CO}" stroke-width="4.5" stroke-linejoin="round"/>
<ellipse cx="-20" cy="-34" rx="20" ry="10" fill="#FFE2B8" opacity=".5" transform="rotate(-24 -20 -34)"/>
<path d="M-30,-40 C-24,-46 -16,-48 -8,-48 M10,-48 C18,-48 26,-44 32,-38" fill="none" stroke="#C65E24" stroke-width="2.6" stroke-linecap="round" opacity=".55"/></g>`;
    const elipse = (k, fill, stroke, extra) => `<g class="hp hp-${k}"${T(k)}${O(k)}><circle r="1" fill="${fill}" stroke="${stroke}" stroke-width="3" ${NSS}/>${extra || ''}</g>`;
    const bochecha = k => `<g class="hp hp-${k}"${T(k)}><path d="${tufosBoc(k === 'boc0' ? 1 : -1)}" fill="${C.branco}" stroke="#7A4A30" stroke-width="2.6" stroke-linejoin="round" ${NSS}/></g>`;
    it.masc = `<g class="hp hp-masc"${T('masc')}><circle r="1" fill="${C.branco}"/><ellipse cy="-.35" rx=".7" ry=".25" fill="#FFFFFF" opacity=".5"/></g>`;
    it.boc0 = bochecha('boc0'); it.boc1 = bochecha('boc1');
    it.topo = elipse('topo', C.laranja, 'none', `<ellipse cx="-.25" cy="-.35" rx=".5" ry=".25" fill="#FFE2B8" opacity=".55"/>`);
    it.foc = elipse('foc', C.branco, '#7A4A30', `<ellipse cx="-.3" cy="-.35" rx=".45" ry=".22" fill="#fff" opacity=".7"/>`);
    it.nar = elipse('nar', C.nariz, '#0E0604', `<ellipse cx="-.3" cy="-.4" rx=".42" ry=".22" fill="#fff" opacity=".75"/><ellipse cx=".35" cy="-.45" rx=".14" ry=".1" fill="#fff" opacity=".5"/>`);
    it.queixo = elipse('queixo', C.branco, '#7A4A30');
    it.int = elipse('int', C.bocaIn, '#3A0C10');
    it.lin = elipse('lin', C.lingua, '#A8384F', `<path d="M-.7,0 L.7,0" stroke="#C24763" stroke-width="2" ${NSS}/>`);
    const olho = i => {
      const di = i ? -1 : 1;              // lado de dentro do olho (para o focinho)
      const clip = icone ? '' : ` clip-path="url(#${u}olho)"`;
      const palp = icone ? '' : `<g class="psup"${T('psup' + i)}><path d="M-20,-60 L20,-60 L20,${-2 - 4 * di} C8,${5 - 2 * di} -8,${5 + 2 * di} -20,${-2 + 4 * di}Z" fill="#E98A3E"/><path d="M-15,${-1 + 3 * di} C-6,${5 + 2 * di} 6,${5 - 2 * di} 15,${-1 - 3 * di}" fill="none" stroke="#2A1206" stroke-width="3.2" stroke-linecap="round"/></g>
<g class="pinf"${T('pinf' + i)}><path d="M-20,60 L20,60 L20,2 C10,-8 -10,-8 -20,2Z" fill="#FBEFE2"/><path d="M-14,-1 C-6,-6 6,-6 14,-1" fill="none" stroke="#B88A6E" stroke-width="2" opacity=".9"/></g>`;
      return `<g class="hp hp-olho${i}"${T('olho' + i)}><g transform="scale(.86)">
<path d="M${-di * 12},-6 C${-di * 15},-7 ${-di * 18},-8 ${-di * 20},-10 C${-di * 17},-11 ${-di * 13},-12 ${-di * 10},-11Z" fill="#2A1206"/>
<path d="M${di * 10},8 C${di * 13},12 ${di * 15},16 ${di * 16},21" fill="none" stroke="#3A1A0C" stroke-width="3.4" stroke-linecap="round" opacity=".8"/>
<ellipse rx="17" ry="18" fill="#B4501C" opacity=".22"/>
<g${clip}><ellipse rx="13" ry="14.5" fill="#FFFDF5"/>
<g class="iris"${T('iris' + i)}><circle r="11" fill="${C.iris}"/><circle r="11" fill="none" stroke="#7A3A08" stroke-width="1.4"/><g class="pup"${T('pup' + i)}><ellipse rx="3.8" ry="7.8" fill="#140904"/></g>
<circle cx="-4" cy="-5" r="3.8" fill="#fff"/><circle cx="4.2" cy="4.6" r="1.8" fill="#fff" opacity=".9"/></g>
<ellipse cy="-11" rx="14" ry="6" fill="#5A2A10" opacity=".2"/>
<ellipse rx="13" ry="14.5" fill="none" stroke="#2A1206" stroke-width="${icone ? 3 : 4.6}"/>${palp}</g></g></g>`;
    };
    it.olho0 = olho(0); it.olho1 = olho(1);
    return E.ordem.map(k => it[k]).join('');
  }

  // Ordem inicial das peças (depois é reordenada em cada quadro pela profundidade)
  function svgRaposa(u, E) {
    const pt = (nome, c) => `<g class="pt" data-p="${nome}">${c}</g>`;
    return `<g class="raposa">${pt('sombra', `<ellipse class="sombra" rx="1" ry="1" fill="url(#${u}sombra)"/>`)}
${PERNAS.map((p, i) => pt('perna' + i, svgPerna(u, p.frente))).join('')}
${pt('cauda', svgCauda(u))}${pt('pescoco', svgPescoco(u))}${pt('tronco', svgTronco(u))}${pt('garupa', svgGarupa(u))}${pt('peito', svgPeito(u))}
${pt('cabeca', `<g class="cab">${svgCabeca(u, E, false)}</g>`)}</g>`;
  }

  const CAB0 = { phi: 0.95, nu: 0.04, boca: 0, lingua: 0, lambe: 0, feliz: 0, fecho: 0, esc: 1, dilata: 0, orelhas: 0, achatar: 0, rodaE: 0, rodaD: 0, orDin: [0, 0], olhoX: 0, olhoY: 0, nariz: 0 };

  /* ---------- Ícone do menu (parado, sem gradientes com id): retrato da cabeça com o peito branco ---------- */
  function gerarIcone() {
    const E = estadoCabeca(Object.assign({}, CAB0, { phi: PI / 2 - 0.38, nu: 0.08, boca: 0.22, feliz: 0.2, esc: 1.08, orelhas: 0.3, olhoX: 1.2, olhoY: 1 }));
    let folhas = '';
    for (const [x, y, r, c] of [[34, 70, -30, '#E8742A'], [182, 60, 40, '#D9531E'], [24, 140, 20, '#F2A83A'], [196, 132, -50, '#C8401C'], [60, 30, 70, '#F6C453'], [160, 26, -10, '#E8742A']]) {
      folhas += `<g transform="translate(${x},${y}) rotate(${r})"><path d="M0,-11 C8,-8 10,2 0,12 C-10,2 -8,-8 0,-11Z" fill="${c}" stroke="#8A3A14" stroke-width="1.5"/><path d="M0,-9 L0,10" stroke="#8A3A14" stroke-width="1.2"/></g>`;
    }
    return `<circle cx="110" cy="112" r="100" fill="#F7D79A"/><circle cx="80" cy="76" r="62" fill="#FFF0C8" opacity=".55"/>
<path d="M17.5,150 Q110,132 202.5,150 A100,100 0 0 1 17.5,150Z" fill="#C8682A" opacity=".55"/>${folhas}
<g transform="translate(110,190) scale(.86,.5)"><path d="M0,-56 C38,-56 60,-32 60,0 C60,34 40,58 0,60 C-40,58 -60,34 -60,0 C-60,-32 -38,-56 0,-56Z" fill="#EE8436" stroke="${CO}" stroke-width="5"/><path d="M-36,-42 C-20,-52 20,-52 36,-42 C52,-12 50,24 30,48 L22,40 L14,56 L5,44 L-4,58 L-12,44 L-22,52 C-46,28 -52,-12 -36,-42Z" fill="#FFF8EE"/></g>
<g transform="translate(112,122) rotate(-4) scale(.92)">${svgCabeca('', E, true)}</g>`;
  }

  /* =====================================================================================
     4. Cenário — bosque de outono, carvalho com a toca, bichos dos acontecimentos
     ===================================================================================== */
  // Boca da toca (o fundo da boca é a raiz da frente) e silhueta do carvalho com o montículo das raízes
  const BOCA_D = 'M872,750 C866,684 884,600 936,554 C966,528 1034,526 1066,552 C1118,596 1136,682 1130,750 C1092,740 1046,734 1000,736 C956,734 910,740 872,750Z';
  const SILHUETA_D = 'M892,-20 C888,120 878,300 866,400 C856,470 840,530 812,580 C790,620 770,690 760,762 C790,778 830,790 880,792 L1130,792 C1200,790 1260,780 1296,762 C1278,700 1240,630 1200,585 C1162,540 1144,480 1136,410 C1124,300 1116,140 1112,-20Z';
  const LABIO_D = 'M872,750 C910,740 956,734 1000,736 C1046,734 1092,740 1130,750 L1148,774 C1092,766 1040,762 1000,764 C956,762 904,766 850,774Z';
  const RAMO_Y = x => 292 - (904 - x) * 0.12 + 10 * Math.sin((904 - x) / 90);   // cimo do ramo do esquilo
  const PALETA = ['#E8742A', '#D9531E', '#F2A83A', '#C8401C', '#B5651D', '#F6C453', '#9C4A1C', '#E58B2E'];
  const FOLHA_D = 'M0,-7 C6,-5 7,2 0,8 C-7,2 -6,-5 0,-7Z';
  const CARVALHO_D = 'M0,-9 C3,-9 3,-6 5,-6 C8,-6 6,-2 8,-1 C10,1 6,3 6,5 C6,8 2,7 0,10 C-2,7 -6,8 -6,5 C-6,3 -10,1 -8,-1 C-6,-2 -8,-6 -5,-6 C-3,-6 -3,-9 0,-9Z';

  function defsCena(u) {
    return `<linearGradient id="${u}ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE3AE"/><stop offset=".35" stop-color="#F4C985"/><stop offset=".62" stop-color="#E6AC6A"/><stop offset="1" stop-color="#D49458"/></linearGradient>
<radialGradient id="${u}sol"><stop offset="0" stop-color="#FFFCEA"/><stop offset=".22" stop-color="#FFEDB2" stop-opacity=".75"/><stop offset="1" stop-color="#FFE3A0" stop-opacity="0"/></radialGradient>
<linearGradient id="${u}nevoa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCE6BC" stop-opacity="0"/><stop offset=".5" stop-color="#FCE6BC" stop-opacity=".75"/><stop offset="1" stop-color="#F0C890" stop-opacity="0"/></linearGradient>
<linearGradient id="${u}chao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D49A5C"/><stop offset=".22" stop-color="#BE7A3E"/><stop offset=".6" stop-color="#A2602C"/><stop offset="1" stop-color="#844A20"/></linearGradient>
<linearGradient id="${u}casca" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A27650"/><stop offset=".3" stop-color="#835A38"/><stop offset=".7" stop-color="#5E3D24"/><stop offset="1" stop-color="#3E2716"/></linearGradient>
<linearGradient id="${u}raiz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9C7048"/><stop offset=".5" stop-color="#77502F"/><stop offset="1" stop-color="#4E321C"/></linearGradient>
<radialGradient id="${u}interior" cx=".5" cy=".92" r=".9"><stop offset="0" stop-color="#5A3820"/><stop offset=".45" stop-color="#2A180C"/><stop offset="1" stop-color="#110904"/></radialGradient>
<linearGradient id="${u}sombraToca" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140A04" stop-opacity=".6"/><stop offset=".3" stop-color="#140A04" stop-opacity=".2"/><stop offset=".6" stop-color="#140A04" stop-opacity="0"/></linearGradient>
<linearGradient id="${u}musgo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8C25A"/><stop offset=".6" stop-color="#7E9A3C"/><stop offset="1" stop-color="#5A7428"/></linearGradient>
<linearGradient id="${u}betula" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFDF8"/><stop offset=".55" stop-color="#EAE2D6"/><stop offset="1" stop-color="#B8AA98"/></linearGradient>
<linearGradient id="${u}castanho" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8A6244"/><stop offset=".5" stop-color="#5E3E28"/><stop offset="1" stop-color="#3A2416"/></linearGradient>
<linearGradient id="${u}raio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6D0" stop-opacity=".95"/><stop offset=".55" stop-color="#FFF0C0" stop-opacity=".45"/><stop offset="1" stop-color="#FFE9B0" stop-opacity="0"/></linearGradient>
<linearGradient id="${u}tronco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9C7A5A"/><stop offset=".5" stop-color="#76563C"/><stop offset="1" stop-color="#523A26"/></linearGradient>
<linearGradient id="${u}topo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2D6A6"/><stop offset=".5" stop-color="#D9B07A"/><stop offset="1" stop-color="#A8784A"/></linearGradient>
<radialGradient id="${u}cogumelo" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FF7A5C"/><stop offset=".55" stop-color="#E23A26"/><stop offset="1" stop-color="#A81A12"/></radialGradient>
<radialGradient id="${u}chapeu" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#D8A06A"/><stop offset=".6" stop-color="#A86A3A"/><stop offset="1" stop-color="#74441E"/></radialGradient>
<radialGradient id="${u}luzChao"><stop offset="0" stop-color="#FFF2C4" stop-opacity=".55"/><stop offset="1" stop-color="#FFF2C4" stop-opacity="0"/></radialGradient>
<radialGradient id="${u}somb"><stop offset="0" stop-color="#3A200C" stop-opacity=".45"/><stop offset="1" stop-color="#3A200C" stop-opacity="0"/></radialGradient>
<radialGradient id="${u}cisco"><stop offset="0" stop-color="#FFFBE8" stop-opacity="1"/><stop offset="1" stop-color="#FFF2C0" stop-opacity="0"/></radialGradient>
<clipPath id="${u}bocaIn"><path d="${BOCA_D}"/></clipPath>
<clipPath id="${u}recorte"><path clip-rule="evenodd" d="M-400,-400H2000V1300H-400Z ${SILHUETA_D} ${BOCA_D}"/></clipPath>`;
  }

  // ---- peças do cenário ----
  function folhaSolta(x, y, s, r, cor, achata, carvalho) {
    return `<path d="${carvalho ? CARVALHO_D : FOLHA_D}" transform="translate(${n1(x)},${n1(y)}) rotate(${n1(r)}) scale(${n3(s)},${n3(s * achata)})" fill="${cor}" stroke="#7A3412" stroke-width="${n3(1 / s)}" stroke-opacity=".5"/>`;
  }
  function tronquinho(x, base, w, topo, cor, op, ramos, rng) {   // tronco ao longe (névoa)
    let s = `<path d="M${n1(x - w * 0.42)},${topo} C${n1(x - w * 0.45)},${n1(lerp(topo, base, 0.6))} ${n1(x - w * 0.5)},${n1(base - 30)} ${n1(x - w * 0.8)},${base} L${n1(x + w * 0.8)},${base} C${n1(x + w * 0.5)},${n1(base - 30)} ${n1(x + w * 0.45)},${n1(lerp(topo, base, 0.6))} ${n1(x + w * 0.42)},${topo}Z" fill="${cor}" opacity="${op}"/>`;
    for (let k = 0; k < ramos; k++) {
      const y = lerp(topo + 40, base - 160, rng()), lado = rng() < 0.5 ? -1 : 1, L = 40 + rng() * 70;
      s += `<path d="M${n1(x)},${n1(y + 20)} Q${n1(x + lado * L * 0.5)},${n1(y)} ${n1(x + lado * L)},${n1(y - L * 0.6)}" fill="none" stroke="${cor}" stroke-width="${n1(w * 0.22)}" stroke-linecap="round" opacity="${op}"/>`;
    }
    return s;
  }
  function copa(cx, cy, r, rng, cores, meta, classe) {   // tufo de folhagem (vários círculos de cor) que balança
    let s = `<g class="${classe}" data-x="${cx}" data-y="${cy}">`;
    for (let i = 0; i < 9; i++) {
      const a = rng() * TAU, d = rng() * r * 0.75, rr = r * (0.35 + rng() * 0.35);
      s += `<circle cx="${n1(cx + Math.cos(a) * d)}" cy="${n1(cy + Math.sin(a) * d * 0.7)}" r="${n1(rr)}" fill="${cores[i % cores.length]}"/>`;
    }
    for (let i = 0; i < 7; i++) { const a = rng() * TAU, d = rng() * r * 0.9; s += `<circle cx="${n1(cx + Math.cos(a) * d - r * 0.15)}" cy="${n1(cy + Math.sin(a) * d * 0.6 - r * 0.2)}" r="${n1(r * (0.12 + rng() * 0.12))}" fill="#FFE2A0" opacity=".45"/>`; }
    meta.copas.push({ x: cx, y: cy, f: rng() * 6 });
    return s + '</g>';
  }
  function betula(x, base, w, rng) {
    let s = `<path d="M${x - w * 0.48},-20 L${x - w * 0.5},${base - 20} C${x - w * 0.62},${base - 6} ${x - w * 0.9},${base} ${x - w},${base + 4} L${x + w},${base + 4} C${x + w * 0.9},${base} ${x + w * 0.62},${base - 6} ${x + w * 0.5},${base - 20} L${x + w * 0.48},-20Z" fill="url(#U_betula)" stroke="#6E6052" stroke-width="2.5"/>`;
    for (let y = 10; y < base - 30; y += 26 + rng() * 34) {
      const lado = rng() < 0.5 ? -1 : 1, L = w * (0.3 + rng() * 0.5), x0 = x + lado * w * 0.5;
      s += `<path d="M${n1(x0)},${n1(y)} q${n1(-lado * L * 0.5)},${n1(-3 - rng() * 3)} ${n1(-lado * L)},${n1(1 + rng() * 3)} q${n1(lado * L * 0.4)},${n1(3)} ${n1(lado * L)},${n1(3 + rng() * 2)}Z" fill="#2E2620"/>`;
      if (rng() < 0.5) s += `<path d="M${n1(x - w * 0.3 + rng() * w * 0.5)},${n1(y + 12)} h${n1(4 + rng() * 8)}" stroke="#4A4038" stroke-width="2" stroke-linecap="round"/>`;
    }
    s += `<path d="M${x - w * 0.3},0 L${x - w * 0.32},${base - 20}" stroke="#fff" stroke-width="${n1(w * 0.18)}" opacity=".5"/>`;
    return s;
  }
  function cogumeloVermelho(x, y, e, rot) {
    return `<g transform="translate(${x},${y}) rotate(${rot || 0}) scale(${e})"><ellipse cy="3" rx="26" ry="6" fill="#3A200C" opacity=".3"/>
<path d="M-7,2 C-8,-14 -6,-26 -5,-34 L5,-34 C6,-26 8,-14 7,2Z" fill="#FBF4E6" stroke="#6E4A34" stroke-width="2"/><path d="M-9,-22 C-4,-18 4,-18 9,-22 L8,-17 C3,-14 -3,-14 -8,-17Z" fill="#F2E6D2" stroke="#6E4A34" stroke-width="1.5"/>
<path d="M-28,-34 C-28,-56 28,-56 28,-34 C18,-30 -18,-30 -28,-34Z" fill="url(#U_cogumelo)" stroke="#6A1A10" stroke-width="2.5"/>
<g fill="#FFF8EE" stroke="#C9B8A0" stroke-width=".8"><ellipse cx="-14" cy="-42" rx="4" ry="3"/><ellipse cx="2" cy="-48" rx="4.5" ry="3"/><ellipse cx="15" cy="-40" rx="3.5" ry="2.6"/><ellipse cx="-4" cy="-38" rx="3" ry="2.2"/><ellipse cx="22" cy="-35" rx="2.4" ry="1.8"/><ellipse cx="-22" cy="-36" rx="2.4" ry="1.8"/></g>
<path d="M-18,-44 C-12,-50 -4,-52 4,-52" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".5"/></g>`;
  }
  function cogumeloCastanho(x, y, e, rot) {
    return `<g transform="translate(${x},${y}) rotate(${rot || 0}) scale(${e})"><path d="M-5,2 C-6,-8 -4,-16 -3,-22 L3,-22 C4,-16 6,-8 5,2Z" fill="#F4E8D6" stroke="#6E4A34" stroke-width="1.8"/>
<path d="M-18,-20 C-16,-36 16,-36 18,-20 C10,-17 -10,-17 -18,-20Z" fill="url(#U_chapeu)" stroke="#4A2A14" stroke-width="2"/><path d="M-10,-28 C-6,-32 0,-33 4,-32" fill="none" stroke="#F2D2A8" stroke-width="2" stroke-linecap="round" opacity=".7"/></g>`;
  }
  function bolota(x, y, e, rot) {
    return `<g transform="translate(${x},${y}) rotate(${rot || 0}) scale(${e})"><ellipse cx="1" cy="9" rx="9" ry="2.5" fill="#3A200C" opacity=".3"/><ellipse cy="2" rx="7" ry="9" fill="#C68A3A" stroke="#5A3414" stroke-width="1.6"/><ellipse cx="-2.5" cy="0" rx="2" ry="4" fill="#F2C47A" opacity=".7"/>
<path d="M-8.5,-3 C-9,-11 9,-11 8.5,-3 C4,-1 -4,-1 -8.5,-3Z" fill="#8A6038" stroke="#4A2A10" stroke-width="1.5"/><path d="M-6,-6 L6,-6 M-7,-3.5 L7,-3.5 M-4,-8.5 L-2,-3 M0,-9 L1,-3 M4,-8.5 L4,-3" stroke="#5E3A1A" stroke-width=".9"/><path d="M0,-10 L1,-14" stroke="#4A2A10" stroke-width="2" stroke-linecap="round"/></g>`;
  }
  function feto(x, y, e, flip, meta, classe) {   // feto com várias folhas (frondes) em leque
    let s = `<g class="${classe}" data-x="${x}" data-y="${y}"><g transform="translate(${x},${y}) scale(${flip * e},${e})">`;
    const frondes = [[-70, 1], [-45, 1.1], [-20, 1.2], [5, 1.05], [30, 0.9], [-95, 0.7]];
    frondes.forEach(([ang, L], j) => {
      const comp = 150 * L, cor = j % 2 ? '#7E9A3A' : '#9AB24A', cor2 = j % 2 ? '#C69A3A' : '#B28A30';
      let f = `<g transform="rotate(${ang})"><path d="M0,0 C${n1(comp * 0.1)},${n1(-comp * 0.5)} ${n1(comp * 0.35)},${n1(-comp * 0.85)} ${n1(comp * 0.55)},${n1(-comp)}" fill="none" stroke="#5A6A22" stroke-width="3" stroke-linecap="round"/>`;
      for (let k = 1; k < 11; k++) {
        const t = k / 11, p = bezier([[0, 0], [comp * 0.1, -comp * 0.5], [comp * 0.35, -comp * 0.85], [comp * 0.55, -comp]], t), w = 26 * (1 - t * 0.8) * L;
        f += `<path d="M${n1(p[0])},${n1(p[1])} q${n1(-w * 0.6)},${n1(-w * 0.2)} ${n1(-w)},${n1(-w * 0.55)} q${n1(w * 0.55)},${n1(w * 0.05)} ${n1(w)},${n1(w * 0.45)}Z" fill="${k > 8 && j === 5 ? cor2 : cor}" stroke="#4A5A1A" stroke-width="1"/>`;
        f += `<path d="M${n1(p[0])},${n1(p[1])} q${n1(w * 0.6)},${n1(-w * 0.35)} ${n1(w * 0.9)},${n1(-w * 0.8)} q${n1(-w * 0.35)},${n1(w * 0.25)} ${n1(-w * 0.9)},${n1(w * 0.8)}Z" fill="${k > 8 && j === 5 ? cor2 : cor}" stroke="#4A5A1A" stroke-width="1"/>`;
      }
      s += f + '</g>';
    });
    meta.fetos.push({ x, y, f: rnd(0, 6) });
    return s + '</g></g>';
  }

  function cenaFundo(u, rng, meta) {
    let s = `<rect x="-10" y="-10" width="1620" height="920" fill="url(#${u}ceu)"/><circle cx="230" cy="40" r="560" fill="url(#${u}sol)"/>`;
    // folhagem distante desfocada
    for (let i = 0; i < 26; i++) { const x = rng() * 1640 - 20, y = 40 + rng() * 260, r = 60 + rng() * 90; s += `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r)}" fill="${['#EDB46E', '#E8A35E', '#F2C47E', '#DE9A5C'][i % 4]}" opacity="${n3(0.35 + rng() * 0.25)}"/>`; }
    // troncos ao longe, em duas camadas de névoa
    for (let i = 0; i < 13; i++) { const x = 40 + i * 122 + rng() * 60; s += tronquinho(x, 560, 14 + rng() * 10, -20, '#C49C78', n3(0.4 + rng() * 0.15), 2, rng); }
    s += `<rect x="-10" y="330" width="1620" height="300" fill="url(#${u}nevoa)"/>`;
    for (let i = 0; i < 9; i++) { const x = 90 + i * 180 + rng() * 80; s += tronquinho(x, 575, 22 + rng() * 12, -20, '#A07A5C', n3(0.55 + rng() * 0.15), 3, rng); }
    // castanheiro e bétula à esquerda, tronco e bétula à direita (plano médio)
    s += `<path d="M262,-20 C268,200 266,420 258,600 C236,622 214,632 196,640 L352,640 C334,630 318,620 310,600 C302,420 300,200 306,-20Z" fill="url(#${u}castanho)" stroke="#3A2416" stroke-width="2.5"/>`;
    for (let k = 0; k < 9; k++) { const x = 268 + k * 4.5; s += `<path d="M${x},${10 + k * 37} C${x + 4},${120 + k * 30} ${x - 3},${300 + k * 10} ${x + 2},${560}" fill="none" stroke="#2E1C10" stroke-width="2" opacity=".4"/>`; }
    s += `<path d="M266,0 C270,200 268,420 262,600" stroke="#B48A62" stroke-width="5" fill="none" opacity=".5"/>`;
    s += betula(132, 648, 24, rng);
    s += `<path d="M1312,-20 C1318,200 1316,420 1308,606 C1288,624 1270,632 1254,640 L1398,640 C1382,630 1368,620 1360,606 C1352,420 1350,200 1356,-20Z" fill="url(#${u}castanho)" stroke="#3A2416" stroke-width="2.5"/>`;
    for (let k = 0; k < 8; k++) { const x = 1318 + k * 4.6; s += `<path d="M${x},${20 + k * 40} C${x + 4},${130 + k * 30} ${x - 3},${300 + k * 12} ${x + 2},${570}" fill="none" stroke="#2E1C10" stroke-width="2" opacity=".4"/>`; }
    s += betula(1496, 652, 21, rng);
    // ramos dos troncos do plano médio para a copa
    s += `<g fill="none" stroke="#4A3020" stroke-linecap="round"><path d="M284,150 C240,110 200,90 150,40" stroke-width="10"/><path d="M290,260 C340,220 380,200 430,150" stroke-width="9"/><path d="M1334,180 C1380,130 1420,110 1470,60" stroke-width="10"/><path d="M1330,300 C1290,260 1250,240 1200,200" stroke-width="8"/></g>`;
    // copa de outono por cima de tudo (tufos que balançam)
    const cs = [['#E8742A', '#F2A83A', '#D9531E', '#F6C453'], ['#C8401C', '#E58B2E', '#D9531E', '#F2A83A'], ['#F6C453', '#F2A83A', '#E8742A', '#FFD978']];
    const tufos = [[60, 30, 120], [200, 70, 110], [360, 20, 120], [470, 120, 90], [1180, 120, 100], [1260, 30, 130], [1420, 70, 120], [1560, 30, 110], [130, 170, 80], [1500, 190, 80]];
    tufos.forEach(([x, y, r], i) => { s += copa(x, y, r, rng, cs[i % 3], meta, 'cn-copa'); });
    // raios de luz (por baixo da copa, a atravessar o bosque)
    s += `<g class="cn-raios" pointer-events="none">`;
    for (const [x0, w0, x1, w1, op] of [[120, 70, 620, 190, 0.5], [330, 50, 900, 150, 0.4], [520, 80, 1180, 220, 0.42], [40, 40, 330, 120, 0.35], [760, 46, 1420, 170, 0.32]]) {
      s += `<path class="cn-raio" d="M${x0},-10 L${x0 + w0},-10 L${x1 + w1},900 L${x1},900Z" fill="url(#${u}raio)" opacity="${op}" data-op="${op}"/>`;
    }
    s += `</g>`;
    return s;
  }

  function cenaChao(u, rng, meta) {
    let s = `<path d="M-10,552 C240,542 520,558 800,550 C1080,543 1340,556 1610,546 V910 H-10Z" fill="url(#${u}chao)"/>`;
    s += `<path d="M-10,552 C240,542 520,558 800,550 C1080,543 1340,556 1610,546 V585 C1300,594 1000,580 800,588 C500,596 240,582 -10,590Z" fill="#F6D7A0" opacity=".35"/>`;
    // manchas de luz no chão onde os raios batem
    for (const [x, y, rx] of [[640, 700, 200], [960, 640, 160], [330, 610, 110], [1330, 660, 150]]) s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${n1(rx * 0.22)}" fill="url(#${u}luzChao)"/>`;
    // tapete de folhas (mais pequenas e achatadas ao longe)
    for (let i = 0; i < 430; i++) {
      const k = Math.pow(rng(), 0.75), y = 556 + k * 350, e = 0.45 + k * 1.15, x = rng() * 1660 - 30;
      s += folhaSolta(x, y, e, rng() * 360, PALETA[Math.floor(rng() * PALETA.length)], 0.5, rng() < 0.3);
    }
    // tronco caído com musgo (à esquerda)
    s += `<ellipse cx="250" cy="716" rx="190" ry="16" fill="url(#${u}somb)"/>
<path d="M78,664 C76,644 92,636 120,636 L386,630 C398,640 402,690 388,704 L118,712 C92,712 80,690 78,664Z" fill="url(#${u}tronco)" stroke="#3A2416" stroke-width="3"/>
<path d="M110,646 C180,640 300,636 380,634 M100,666 C200,660 300,658 394,656 M104,688 C200,684 300,682 392,680" fill="none" stroke="#4A3222" stroke-width="2.5" opacity=".55"/>
<path d="M120,642 C200,638 300,636 380,634" fill="none" stroke="#C8A27A" stroke-width="3" opacity=".5"/>
<ellipse cx="388" cy="668" rx="20" ry="37" fill="url(#${u}topo)" stroke="#3A2416" stroke-width="3"/><ellipse cx="388" cy="668" rx="13" ry="25" fill="none" stroke="#9A6C40" stroke-width="2"/><ellipse cx="388" cy="668" rx="6.5" ry="13" fill="none" stroke="#9A6C40" stroke-width="2"/>
<path d="M86,650 C100,630 140,626 170,632 C190,620 230,622 250,630 C280,618 330,620 360,628 C372,626 380,630 382,636 C330,640 200,644 90,660Z" fill="url(#${u}musgo)" stroke="#4A5A1A" stroke-width="1.5"/>`;
    for (let i = 0; i < 16; i++) { const x = 100 + rng() * 270; s += `<circle cx="${n1(x)}" cy="${n1(634 - rng() * 6)}" r="${n1(3 + rng() * 4)}" fill="${rng() < 0.5 ? '#B8D06A' : '#8EAA44'}"/>`; }
    s += cogumeloCastanho(150, 640, 0.6, -6) + cogumeloCastanho(170, 642, 0.45, 8) + cogumeloCastanho(330, 634, 0.5, 4);
    // hera e erva ao pé do tronco
    for (let i = 0; i < 10; i++) { const x = 90 + i * 30; s += `<path d="M${x},712 q${n1(rng() * 6 - 3)},-10 ${n1(rng() * 8 - 4)},-${n1(14 + rng() * 10)}" stroke="#7E8A32" stroke-width="2.4" fill="none" stroke-linecap="round"/>`; }
    // cogumelos vermelhos com pintas, castanhos e bolotas
    s += cogumeloVermelho(270, 778, 0.95, -4) + cogumeloVermelho(318, 790, 0.6, 6) + cogumeloCastanho(240, 784, 0.7, -10);
    s += cogumeloCastanho(1240, 642, 0.55, 0) + cogumeloCastanho(1262, 646, 0.4, 10);
    s += bolota(560, 792, 1, 30) + bolota(1192, 790, 1.1, -20) + bolota(800, 806, 1, 70) + bolota(722, 770, 0.8, -40);
    // fetos do plano médio
    s += feto(1250, 718, 0.7, -1, meta, 'cn-feto') + feto(60, 760, 0.75, 1, meta, 'cn-feto');
    // monte de folhas (parte de trás) onde espreita o rato
    const my = YB + KZ * MONTE.z;
    s += `<ellipse cx="${MONTE.x}" cy="${my + 6}" rx="86" ry="13" fill="url(#${u}somb)"/>`;
    for (let i = 0; i < 26; i++) { const a = rng() * PI, x = MONTE.x + Math.cos(a) * 62 * rng(), y = my - 6 - Math.sin(a) * 26 * rng(); s += folhaSolta(x, y, 1.6 + rng() * 0.6, rng() * 360, PALETA[i % PALETA.length], 0.7, rng() < 0.35); }
    return s;
  }

  function cenaToca(u, rng, meta) {
    let s = `<rect x="820" y="470" width="360" height="330" fill="#000" fill-opacity="0"/>`;   // zona de toque da toca
    // tronco e montículo das raízes (luz da esquerda)
    s += `<path d="${SILHUETA_D}" fill="url(#${u}casca)" stroke="${CO}" stroke-width="4" stroke-linejoin="round"/>`;
    s += `<path d="M900,-20 C896,120 888,300 876,400 C866,470 846,530 822,576 C846,540 862,494 882,440 C904,360 914,200 918,-20Z" fill="#C49C70" opacity=".45"/>`;
    s += `<path d="M1112,-20 C1116,140 1124,300 1136,410 C1144,480 1162,540 1200,585 C1170,560 1140,520 1124,470 C1104,400 1094,200 1092,-20Z" fill="#2A180C" opacity=".35"/>`;
    // sulcos da casca
    for (let i = 0; i < 18; i++) {
      const x = 904 + i * 11.5 + rng() * 4, y0 = -20 + rng() * 40, y1 = 360 + rng() * 120, w = 3 + rng() * 3;
      let d = `M${n1(x)},${n1(y0)}`;
      for (let y = y0 + 40; y < y1; y += 40) d += ` Q${n1(x + (rng() - 0.5) * 12)},${n1(y - 20)} ${n1(x + (rng() - 0.5) * 6 + (y > 380 ? (x - 1000) * 0.12 : 0))},${n1(y)}`;
      s += `<path d="${d}" fill="none" stroke="#3A2414" stroke-width="${n1(w)}" stroke-linecap="round" opacity=".6"/><path d="${d}" fill="none" stroke="#B48A62" stroke-width="1.6" stroke-linecap="round" opacity=".45" transform="translate(-4,0)"/>`;
    }
    // nós e um buraquinho
    s += `<ellipse cx="1052" cy="230" rx="16" ry="24" fill="#5A3A22" stroke="#2E1C10" stroke-width="3"/><ellipse cx="1052" cy="230" rx="7" ry="12" fill="#2E1C10"/><path d="M1040,206 C1048,200 1060,202 1066,212" fill="none" stroke="#B48A62" stroke-width="2.5" opacity=".6"/>`;
    s += `<ellipse cx="934" cy="120" rx="10" ry="15" fill="#5A3A22" stroke="#2E1C10" stroke-width="2.5"/>`;
    // musgo na base do tronco e em cima das raízes
    s += `<path d="M812,580 C836,556 852,536 868,500 C872,524 864,560 846,590 C830,620 806,650 790,680 C782,650 792,610 812,580Z" fill="url(#${u}musgo)" stroke="#4A5A1A" stroke-width="1.5" opacity=".9"/>`;
    s += `<path d="M1200,585 C1180,566 1160,540 1146,500 C1142,524 1150,560 1170,592 C1190,624 1222,660 1250,700 C1252,668 1230,616 1200,585Z" fill="url(#${u}musgo)" stroke="#4A5A1A" stroke-width="1.5" opacity=".85"/>`;
    // raízes grossas a espalharem-se pelo chão
    const raiz = (p, w0, w1, musgo) => {   // tubo afunilado ao longo de uma curva, com bossas, brilho do lado da luz e musgo por cima
      const N = 20, cima = [], baixo = [], meio = [];
      for (let i = 0; i <= N; i++) {
        const t = i / N, a = bezier(p, t), b = bezier(p, Math.min(1, t + 0.01)), c = bezier(p, Math.max(0, t - 0.01));
        let nx = -(b[1] - c[1]), ny = b[0] - c[0]; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
        if (ny > 0) { nx = -nx; ny = -ny; }
        const w = lerp(w0, w1, Math.pow(t, 0.75)) / 2 * (1 + 0.09 * Math.sin(t * 19 + w0));
        cima.push([a[0] + nx * w, a[1] + ny * w]); baixo.push([a[0] - nx * w, a[1] - ny * w]); meio.push([a[0] + nx * w * 0.45, a[1] + ny * w * 0.45, a[0] - nx * w * 0.5, a[1] - ny * w * 0.5]);
      }
      const pl = v => v.map(q => n1(q[0]) + ',' + n1(q[1])).join(' L');
      let r = `<path d="M${pl(cima)} L${pl(baixo.slice().reverse())}Z" fill="url(#${u}raiz)" stroke="${CO}" stroke-width="3.5" stroke-linejoin="round"/>`;
      r += `<path d="M${meio.slice(0, N - 2).map(q => n1(q[0]) + ',' + n1(q[1])).join(' L')}" fill="none" stroke="#C49C70" stroke-width="${n1(w0 * 0.14)}" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>`;
      r += `<path d="M${meio.slice(1, N - 1).map(q => n1(q[2]) + ',' + n1(q[3])).join(' L')}" fill="none" stroke="#3A2414" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>`;
      if (musgo) r += `<path d="M${pl(cima.slice(1, Math.round(N * musgo)))}" fill="none" stroke="#9AB24A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>`;
      return r;
    };
    s += raiz([[884, 556], [846, 640], [772, 722], [684, 778]], 78, 14, 0.7) + raiz([[864, 688], [838, 730], [802, 770], [748, 798]], 44, 10, 0);
    s += raiz([[1116, 556], [1154, 640], [1232, 722], [1326, 774]], 78, 14, 0.7) + raiz([[1138, 688], [1168, 730], [1208, 770], [1264, 800]], 44, 10, 0);
    // boca da toca: interior escuro, parede do fundo com raizinhas, cama de folhas secas
    s += `<path d="${BOCA_D}" fill="url(#${u}interior)"/><g clip-path="url(#${u}bocaIn)">`;
    for (let i = 0; i < 9; i++) { const x = 900 + i * 26 + rng() * 10; s += `<path d="M${n1(x)},528 C${n1(x - 6 + rng() * 12)},${n1(560 + rng() * 20)} ${n1(x - 8 + rng() * 16)},${n1(590 + rng() * 30)} ${n1(x - 4 + rng() * 8)},${n1(610 + rng() * 40)}" fill="none" stroke="#6A4628" stroke-width="${n1(2 + rng() * 2)}" stroke-linecap="round" opacity=".7"/>`; }
    for (let i = 0; i < 12; i++) s += `<ellipse cx="${n1(900 + rng() * 200)}" cy="${n1(600 + rng() * 80)}" rx="${n1(6 + rng() * 10)}" ry="${n1(3 + rng() * 4)}" fill="#3E2614" opacity=".6"/>`;
    s += `<path d="M880,750 C900,712 950,702 1000,702 C1050,702 1100,712 1124,750Z" fill="#6A4422" opacity=".85"/>`;
    for (let i = 0; i < 34; i++) { const x = 890 + rng() * 220, y = 708 + rng() * 40; s += folhaSolta(x, y, 0.9 + rng() * 0.5, rng() * 360, ['#9C5A2A', '#B8702E', '#8A4A20', '#C68A3A'][i % 4], 0.6, rng() < 0.3); }
    s += `<path d="${BOCA_D}" fill="none" stroke="#0E0603" stroke-width="16" opacity=".55"/></g>`;
    s += `<path d="${BOCA_D}" fill="none" stroke="${CO}" stroke-width="4" stroke-linejoin="round"/>`;
    s += `<path d="M880,690 C878,640 898,590 940,560 C970,540 1030,538 1060,556" fill="none" stroke="#B48A62" stroke-width="4" stroke-linecap="round" opacity=".55"/>`;
    // raiz da frente (lábio da toca) com musgo
    s += `<path d="${LABIO_D}" fill="url(#${u}raiz)" stroke="${CO}" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M880,752 C920,742 960,738 1000,740 C1040,738 1090,744 1124,752" fill="none" stroke="#9AB24A" stroke-width="6" stroke-linecap="round" opacity=".85"/>
<path d="M870,762 C930,754 1060,752 1136,764" fill="none" stroke="#4A2E18" stroke-width="2.5" opacity=".6"/>`;
    // folhas acumuladas nas raízes, cogumelos e um feto pequeno (este abana quando a raposa chega)
    for (let i = 0; i < 40; i++) { const lado = i % 2 ? 1 : -1, x = 1000 + lado * (150 + rng() * 170), y = 748 + rng() * 40; s += folhaSolta(x, y, 1.2 + rng() * 0.6, rng() * 360, PALETA[i % PALETA.length], 0.55, rng() < 0.35); }
    s += `<g class="cn-cogToca" data-x="1188" data-y="742">${cogumeloCastanho(1176, 742, 0.9, -8)}${cogumeloCastanho(1200, 748, 0.65, 10)}${cogumeloCastanho(1160, 752, 0.5, -16)}</g>`;
    s += feto(812, 760, 0.42, 1, meta, 'cn-fetoToca');
    s += bolota(1110, 778, 1, 20) + bolota(880, 784, 0.9, -60);
    return s;
  }

  // ramo do carvalho por onde corre o esquilo
  function svgRamo(u, rng, meta) {
    let d1 = '', d2 = '';
    for (let x = 904; x >= 640; x -= 8) { const y = RAMO_Y(x), w = lerp(5, 22, (x - 640) / 264); d1 += `${x === 904 ? 'M' : 'L'}${x},${n1(y - 2)}`; d2 = `L${x},${n1(y + w)}` + d2; }
    let s = `<path d="${d1}${d2.replace(/^L/, 'L')}Z" fill="url(#${u}tronco)" stroke="${CO}" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<path d="${d1}" fill="none" stroke="#C8A27A" stroke-width="2.5" opacity=".6"/>`;
    s += `<g fill="none" stroke="#5A3A22" stroke-linecap="round"><path d="M760,${n1(RAMO_Y(760) + 4)} q-20,-30 -40,-44" stroke-width="5"/><path d="M690,${n1(RAMO_Y(690) + 2)} q-14,24 -40,30" stroke-width="4"/><path d="M820,${n1(RAMO_Y(820) + 6)} q10,-26 30,-38" stroke-width="4"/></g>`;
    s += copa(706, 232, 52, rng, ['#E8742A', '#F2A83A', '#D9531E', '#F6C453'], meta, 'cn-copa');
    s += copa(632, 300, 44, rng, ['#C8401C', '#E58B2E', '#F2A83A'], meta, 'cn-copa');
    s += copa(862, 236, 40, rng, ['#F6C453', '#E8742A', '#F2A83A'], meta, 'cn-copa');
    return s;
  }

  // Bichos dos acontecimentos e da vida do bosque
  function svgRato() {
    return `<g class="ev-rato" pointer-events="none" transform="translate(-300,-300)"><g class="rt-c">
<path class="rt-cauda" d="M-14,4 C-30,8 -40,0 -46,-10" fill="none" stroke="#C49A8A" stroke-width="2.6" stroke-linecap="round"/>
<ellipse cy="-2" rx="16" ry="12" fill="#9C8070" stroke="#4A3428" stroke-width="2"/><ellipse cx="2" cy="3" rx="10" ry="6" fill="#E8D8C8"/>
<g class="rt-cab"><ellipse cx="14" cy="-10" rx="11" ry="9" fill="#A88A7A" stroke="#4A3428" stroke-width="2"/>
<circle cx="7" cy="-20" r="6.5" fill="#A88A7A" stroke="#4A3428" stroke-width="1.8"/><circle cx="7" cy="-20" r="3.8" fill="#F2B0B8"/><circle cx="16" cy="-20" r="5.5" fill="#A88A7A" stroke="#4A3428" stroke-width="1.8"/><circle cx="16" cy="-20" r="3.2" fill="#F2B0B8"/>
<circle cx="17" cy="-11" r="2.6" fill="#140A06"/><circle cx="17.8" cy="-11.8" r=".9" fill="#fff"/><circle class="rt-nariz" cx="25" cy="-8" r="2.4" fill="#E87A8A"/>
<g stroke="#5A4438" stroke-width=".8" fill="none"><path d="M24,-8 l9,-3 M24,-7 l10,1 M24,-6 l8,4"/></g></g></g></g>`;
  }
  function svgEsquilo() {
    return `<g class="ev-esq" pointer-events="none" transform="translate(-300,-300)"><g class="eq-c">
<g class="eq-cauda"><path d="M8,-10 C24,-12 36,-28 32,-48 C28,-66 10,-70 2,-60 C12,-58 18,-48 14,-36 C10,-26 2,-20 -4,-16Z" fill="#C0582A" stroke="#5A2410" stroke-width="2.2"/><path d="M24,-30 C28,-42 24,-54 14,-60" fill="none" stroke="#E8945A" stroke-width="3" stroke-linecap="round" opacity=".7"/></g>
<g class="eq-pt"><path d="M4,-4 L10,6" stroke="#8A3A16" stroke-width="5" stroke-linecap="round"/></g>
<ellipse cx="-4" cy="-10" rx="14" ry="10" fill="#C8602E" stroke="#5A2410" stroke-width="2"/><ellipse cx="-8" cy="-6" rx="8" ry="5" fill="#F4DCC0"/>
<g class="eq-pf"><path d="M-12,-4 L-16,6" stroke="#8A3A16" stroke-width="4" stroke-linecap="round"/></g>
<g class="eq-cab"><circle cx="-18" cy="-20" r="9" fill="#C8602E" stroke="#5A2410" stroke-width="2"/><path d="M-16,-28 L-14,-38 L-10,-28Z" fill="#B04E22" stroke="#5A2410" stroke-width="1.6" stroke-linejoin="round"/>
<circle cx="-21" cy="-21" r="2.4" fill="#140A06"/><circle cx="-21.6" cy="-21.8" r=".8" fill="#fff"/><circle cx="-27" cy="-17" r="1.8" fill="#3A1A0C"/><path d="M-26,-14 C-22,-12 -18,-13 -16,-15" fill="none" stroke="#F4DCC0" stroke-width="2.4"/></g>
<g class="eq-bolota"><ellipse cx="-24" cy="-8" rx="4.5" ry="5.5" fill="#C68A3A" stroke="#5A3414" stroke-width="1.2"/><path d="M-29,-10 C-29,-15 -19,-15 -19,-10Z" fill="#8A6038" stroke="#4A2A10" stroke-width="1"/></g></g></g>
<g class="ev-bolota" pointer-events="none" transform="translate(-300,-300)"><g class="bl-r"><ellipse cy="1" rx="6" ry="7.5" fill="#C68A3A" stroke="#5A3414" stroke-width="1.5"/><ellipse cx="-2" cy="0" rx="1.6" ry="3.4" fill="#F2C47A" opacity=".7"/><path d="M-7,-3 C-7,-10 7,-10 7,-3 C3,-1.5 -3,-1.5 -7,-3Z" fill="#8A6038" stroke="#4A2A10" stroke-width="1.3"/><path d="M0,-8 L1,-11" stroke="#4A2A10" stroke-width="1.8" stroke-linecap="round"/></g></g>`;
  }
  function svgOurico() {
    let espinhos = '';
    for (let i = 0; i < 26; i++) {
      const a = PI * (0.05 + 0.9 * i / 25), x = -6 + Math.cos(a) * -30, y = -6 - Math.sin(a) * 22, L = 12 + (i % 3) * 3;
      espinhos += `<path d="M${n1(x)},${n1(y)} l${n1(-Math.cos(a) * L * -1 * 0.4 - 4)},${n1(-Math.sin(a) * L)}" stroke="${i % 2 ? '#5A4030' : '#7A5A42'}" stroke-width="3" stroke-linecap="round"/><path d="M${n1(x - Math.cos(a) * -L * 0.4 - 4)},${n1(y - Math.sin(a) * L)} l-1,-2" stroke="#E8D8C0" stroke-width="2.4" stroke-linecap="round"/>`;
    }
    return `<g class="ev-our" pointer-events="none" transform="translate(-300,-300)"><ellipse class="ou-s" cy="2" rx="38" ry="6" fill="#3A200C" opacity=".25"/><g class="ou-c">
<g class="ou-p1"><path d="M-14,-2 l-2,6" stroke="#3A2618" stroke-width="5" stroke-linecap="round"/></g><g class="ou-p2"><path d="M12,-2 l2,6" stroke="#3A2618" stroke-width="5" stroke-linecap="round"/></g>
<path d="M-38,-4 C-40,-30 -10,-40 12,-34 C28,-28 32,-12 28,-2 Z" fill="#6E5038" stroke="#3A2416" stroke-width="2.4"/>${espinhos}
<path d="M14,-20 C26,-22 36,-16 44,-8 C40,-2 30,0 18,-2 C14,-8 12,-14 14,-20Z" fill="#E8CFA8" stroke="#5A3A22" stroke-width="2"/><circle cx="44" cy="-8" r="3.4" fill="#1A0E08"/><circle cx="27" cy="-14" r="2.4" fill="#1A0E08"/><circle cx="27.6" cy="-14.8" r=".8" fill="#fff"/>
<path d="M18,-26 C16,-30 20,-32 22,-28" fill="#B89070" stroke="#5A3A22" stroke-width="1.5"/>
<g transform="translate(-6,-40) rotate(-20)"><path d="${CARVALHO_D}" fill="#D9531E" stroke="#7A2A10" stroke-width="1" transform="scale(1.4)"/></g></g></g>`;
  }
  function svgPisco() {
    return `<g class="cn-pisco" pointer-events="none" transform="translate(-300,-300)"><g class="pc-c">
<path class="pc-cauda" d="M-10,-6 L-24,-10 L-22,-2 Z" fill="#6E5A44" stroke="#3A2A1C" stroke-width="1.5"/>
<ellipse cy="-9" rx="12" ry="10" fill="#8A7458" stroke="#3A2A1C" stroke-width="1.8"/><path d="M2,-16 C10,-14 12,-4 6,2 C0,2 -2,-8 2,-16Z" fill="#E8682A"/>
<g class="pc-asa"><path d="M-8,-12 C-2,-14 4,-12 4,-6 C-2,-4 -8,-6 -8,-12Z" fill="#6E5A44" stroke="#3A2A1C" stroke-width="1.4"/></g>
<g class="pc-cab"><circle cx="7" cy="-17" r="7" fill="#8A7458" stroke="#3A2A1C" stroke-width="1.6"/><path d="M5,-14 C9,-15 13,-13 13,-9 C9,-8 6,-10 5,-14Z" fill="#E8682A"/><circle cx="9" cy="-19" r="1.6" fill="#111"/><path d="M13,-17 L18,-16 L13,-14.5Z" fill="#3A2A1C"/></g>
<path d="M-2,0 L-3,5 M3,0 L3,5" stroke="#5A4A3A" stroke-width="1.5"/></g></g>`;
  }
  // camadas da frente (só se veem com a raposa lá dentro): sombra da toca, raizinhas penduradas e folhas no lábio
  function svgTocaFrente(u, rng) {
    let s = `<g class="tocaFrente" pointer-events="none" opacity="0"><path d="${BOCA_D}" fill="url(#${u}sombraToca)"/><g class="raizinhas">`;
    for (const [x, L] of [[936, 46], [962, 64], [1018, 52], [1046, 38], [1074, 30], [984, 34]]) {
      const y0 = 545 + Math.abs(x - 1000) * 0.18;
      s += `<path d="M${x},${n1(y0)} C${x - 4},${n1(y0 + L * 0.4)} ${x + 6},${n1(y0 + L * 0.7)} ${x + 1},${n1(y0 + L)}" fill="none" stroke="#5A3A20" stroke-width="3" stroke-linecap="round"/><path d="M${x + 1},${n1(y0 + L)} l3,6" stroke="#7A5434" stroke-width="2" stroke-linecap="round"/>`;
    }
    s += `</g>`;
    for (let i = 0; i < 9; i++) { const x = 900 + i * 25 + rng() * 10, y = 744 + Math.abs(x - 1000) * 0.03 + rng() * 6; s += folhaSolta(x, y, 1.3 + rng() * 0.4, rng() * 360, PALETA[i % PALETA.length], 0.55, i % 3 === 0); }
    return s + '</g>';
  }
  // parte da frente do monte de folhas (tapa o rato e o focinho da raposa quando mergulha)
  function svgMonteFrente(rng) {
    const my = YB + KZ * MONTE.z;
    let s = `<g class="monteFrente" pointer-events="none">`;
    for (let i = 0; i < 30; i++) { const a = rng() * PI, rr = Math.sqrt(rng()), x = MONTE.x + Math.cos(a) * 70 * rr, y = my + 4 - Math.sin(a) * 18 * rr; s += folhaSolta(x, y, 1.7 + rng() * 0.6, rng() * 360, PALETA[(i * 3) % PALETA.length], 0.65, rng() < 0.35); }
    return s + '</g>';
  }
  function svgPrimeiroPlano(u, rng, meta) {
    let s = feto(-30, 905, 1.25, 1, meta, 'cn-feto') + feto(1630, 905, 1.2, -1, meta, 'cn-feto');
    s += cogumeloVermelho(1430, 852, 1.1, 8) + cogumeloCastanho(1472, 860, 1.1, -6) + bolota(170, 860, 1.4, 20);
    return s;
  }

  /* =====================================================================================
     5. Montagem e animação
     ===================================================================================== */
  let contagem = 0;
  function montar(raiz, ajudas) {
    const relogio = ajudas && ajudas.relogio;
    const reduzido = !!(ajudas && ajudas.reduzido);
    const AMB = reduzido ? 0.3 : 1;
    const u = 'raposa-' + (++contagem) + '-';
    const rng = semente(20261017);
    const meta = { copas: [], fetos: [] };
    const E0 = estadoCabeca(CAB0);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('aria-hidden', 'true');
    let pfSvg = '', caemSvg = '', ciscosSvg = '';
    for (let i = 0; i < 28; i++) pfSvg += `<path class="pf" d="${i % 3 ? FOLHA_D : CARVALHO_D}" fill="${PALETA[i % PALETA.length]}" stroke="#7A3412" stroke-width=".9" opacity="0" transform="translate(-100,-100)"/>`;
    for (let i = 0; i < 11; i++) caemSvg += `<g class="fc" transform="translate(-100,-100)"><g class="fcR"><g transform="scale(1.7)"><path d="${i % 3 ? FOLHA_D : CARVALHO_D}" fill="${PALETA[(i * 3) % PALETA.length]}" stroke="#7A3412" stroke-width=".7"/><path d="M0,-6 L0,8" stroke="#8A3A14" stroke-width=".7" opacity=".7"/></g></g></g>`;
    for (let i = 0; i < 18; i++) ciscosSvg += `<circle class="cisco" r="${n1(2 + rng() * 3.5)}" fill="url(#${u}cisco)" opacity="0"/>`;
    svg.innerHTML = (`<defs>${defsCena(u)}${defsRaposa(u)}</defs>${cenaFundo(u, rng, meta)}${cenaChao(u, rng, meta)}${svgPisco()}${svgOurico()}
<g class="habitat">${cenaToca(u, rng, meta)}</g>${svgRamo(u, rng, meta)}${svgRato()}${svgRaposa(u, E0)}${svgMonteFrente(rng)}${svgTocaFrente(u, rng)}${svgEsquilo()}
<g class="particulas" pointer-events="none">${pfSvg}</g>${svgPrimeiroPlano(u, rng, meta)}<g class="caem" pointer-events="none">${caemSvg}</g><g class="ciscos" pointer-events="none">${ciscosSvg}</g>`).replace(/U_/g, u);
    raiz.appendChild(svg);
    const q = s => svg.querySelector(s), qq = s => Array.from(svg.querySelectorAll(s));

    /* ---------- referências da raposa ---------- */
    const raposaG = q('.raposa'), habitat = q('.habitat'), tocaFrente = q('.tocaFrente');
    const partes = {};
    for (const g of raposaG.children) partes[g.getAttribute('data-p')] = { el: g, z: 0, gz: 0, recorte: false };
    const pernasEl = PERNAS.map((p, i) => {
      const camadas = Array.from(partes['perna' + i].el.children);
      return {
        seg: [0, 1, 2, 3].map(k => camadas.map(c => c.querySelector('.g' + k))),
        pe: camadas.map(c => c.querySelector('.pe')),
        dl: camadas[1].querySelector('.dl'), df: camadas[1].querySelector('.df'), al: camadas[1].querySelector('.al'), sb: camadas[2]
      };
    });
    const caudaEl = [0, 1, 2, 3, 4, 5, 6, 7].map(k => Array.from(partes.cauda.el.querySelectorAll('.k' + k)));
    const el = {
      sombra: q('.sombra'), trM: q('.trM'), trR: q('.trR'), ptM: q('.ptM'), ptC: q('.ptC'), gaM: q('.gaM'), gaC: q('.gaC'),
      pcM: q('.pcM'), garg: q('.garg'), cab: q('.cab')
    };
    const hp = {};
    for (const g of el.cab.children) hp[g.getAttribute('class').split(' ')[1].slice(3)] = g;
    const cabT = {}, cabO = { int: hp.int, lin: hp.lin };
    for (const k of ['or0', 'or1', 'olho0', 'olho1'].concat(ELIPS)) cabT[k] = hp[k];
    for (let i = 0; i < 2; i++) {
      const o = hp['olho' + i];
      cabT['iris' + i] = o.querySelector('.iris'); cabT['pup' + i] = o.querySelector('.pup'); cabT['psup' + i] = o.querySelector('.psup'); cabT['pinf' + i] = o.querySelector('.pinf');
      cabO['orF' + i] = hp['or' + i].querySelector('.orF');
    }
    const tr = (e, v) => { if (e._t !== v) { e._t = v; e.setAttribute('transform', v); } };
    const opa = (e, v) => { v = n3(v); if (e._o !== v) { e._o = v; e.setAttribute('opacity', v); } };
    let ordemCab = '';
    function aplicarCabeca(E) {
      for (const k in E.t) tr(cabT[k], E.t[k]);
      for (const k in E.op) opa(cabO[k], E.op[k]);
      const ch = E.ordem.join();
      if (ch !== ordemCab) { ordemCab = ch; for (const k of E.ordem) el.cab.appendChild(hp[k]); }
    }

    /* ---------- referências do cenário ---------- */
    const cn = {
      copas: qq('.cn-copa'), fetos: qq('.cn-feto'), raios: qq('.cn-raio'), fetoToca: q('.cn-fetoToca'), cogToca: q('.cn-cogToca'),
      pisco: q('.cn-pisco'), pcC: q('.pc-c'), pcCab: q('.pc-cab'), pcAsa: q('.pc-asa'), pcCauda: q('.pc-cauda'),
      our: q('.ev-our'), ouC: q('.ou-c'), ouP1: q('.ou-p1'), ouP2: q('.ou-p2'),
      rato: q('.ev-rato'), rtC: q('.rt-c'), rtCab: q('.rt-cab'), rtCauda: q('.rt-cauda'), rtNariz: q('.rt-nariz'),
      esq: q('.ev-esq'), eqC: q('.eq-c'), eqCab: q('.eq-cab'), eqCauda: q('.eq-cauda'), eqPf: q('.eq-pf'), eqPt: q('.eq-pt'), eqBolota: q('.eq-bolota'),
      bolota: q('.ev-bolota'), blR: q('.ev-bolota .bl-r'),
      pf: qq('.pf'), caem: qq('.fc'), ciscos: qq('.cisco')
    };
    const metaCopas = cn.copas.map(e => ({ x: +e.getAttribute('data-x'), y: +e.getAttribute('data-y'), f: rnd(0, 6) }));
    const metaFetos = cn.fetos.map(e => ({ x: +e.getAttribute('data-x'), y: +e.getAttribute('data-y'), f: rnd(0, 6) }));

    /* ---------- estado ---------- */
    const S = {}, V = {};
    for (const k of CHAVES) { S[k] = { x: EM_PE[k], v: 0 }; V[k] = EM_PE[k]; }
    S.th = { x: REP.th, v: 0 };
    const SX = { x: REP.x, v: 0 }, SZ = { x: REP.z, v: 0 }, SH = { x: 0, v: 0 };
    let X = REP.x, Z = REP.z, TH = REP.th, ct = Math.cos(TH), st = Math.sin(TH);
    let tempo = 0, modo = 'fora', tocaModo = false, destruido = false;
    let saltoH = 0, saltoAlvo = 0, sacX = 0, bob = 0, cabBob = { x: 0, v: 0 }, respFase = 0, cauFase = 0, ladoCauda = 1;
    let cabPos = [X + 120, YB + KZ * Z - 290], narizPos = [X + 180, YB - 260], cabVel = 0, ultCab = null;
    const orD = [{ x: 0, v: 0 }, { x: 0, v: 0 }], olhos = { x: { x: 0, v: 0 }, y: { x: 0, v: 0 } }, abano = { x: 0, v: 0 };
    let olhoAlvo = [0, 0];
    const pes = PERNAS.map(p => { const gx = X + (p.frente ? 76 : -72) * ct - p.v * st, gz = Z + (p.frente ? 76 : -72) * st + p.v * ct; return { gx, gz, h: 0, sw: false, t: 0, dur: 0.22, fx: gx, fz: gz, lift: 8 }; });
    let quieto = 0, velX = 0, velZ = 0, velTh = 0, antX = X, antZ = Z, antTh = TH;
    const esp = { i: -1, w: 0, u: 0, v: 0, h: 0 };   // pata «especial» (coçar a orelha)
    const ctl = { x: null, z: null, th: null, thAlvo: null };   // um comportamento pode mandar na posição

    /* ---------- piscar e orelhas ---------- */
    const pisca = { prox: rnd(1.5, 4), t: -1, duplo: false };
    const curvaPisca = t => (t < 0 ? 0 : t < 0.06 ? t / 0.06 : t < 0.09 ? 1 : t < 0.18 ? 1 - (t - 0.09) / 0.09 : 0);
    function piscar(dt) {
      if (pisca.t < 0) { pisca.prox -= dt; if (pisca.prox <= 0) { pisca.t = 0; pisca.duplo = Math.random() < 0.25; } return 0; }
      pisca.t += dt;
      let v = curvaPisca(pisca.t);
      if (pisca.duplo) v = Math.max(v, curvaPisca(pisca.t - 0.24));
      if (pisca.t > (pisca.duplo ? 0.45 : 0.2)) { pisca.t = -1; pisca.prox = rnd(2, 6); }
      return v;
    }
    let tremor = rnd(2, 6);                     // espasmo de orelha ocasional (a raposa ouve tudo)
    function espasmoOrelha(dt) { tremor -= dt; if (tremor <= 0) { tremor = rnd(2, 7); orD[Math.random() < 0.5 ? 0 : 1].v += (Math.random() < 0.5 ? -1 : 1) * rnd(260, 420); } }

    /* ---------- olhar ---------- */
    const sac = { t: 1, x: 0, y: 0, alvo: null };
    function olharPara(A, alvo, lim) {
      let phd, ox, oy;
      if (alvo) {
        const dx = alvo.x - cabPos[0], dy = alvo.y - cabPos[1];
        phd = PI / 2 - clamp(dx / 330, -1, 1) * 1.3;
        A.cabNod += clamp(dy / 480, -0.35, 0.45);
        ox = clamp(dx / 140, -1, 1) * 4; oy = clamp(dy / 160, -1, 1) * 3.5;
      } else { phd = lerp(TH, PI / 2, 0.5); ox = sac.x; oy = sac.y; }
      A.cabYaw = clamp(angDif(TH, phd), -lim, lim);
      olhoAlvo = [ox, oy];
    }
    function saccades(dt) {
      sac.t -= dt;
      if (sac.t <= 0) {
        sac.t = rnd(0.8, 3);
        if (Math.random() < 0.6) { sac.x = rnd(-1.2, 1.2); sac.y = rnd(-1, 1); sac.alvo = null; }
        else {
          const f = cn.caem.map((e, i) => caem[i]).filter(c => c.ativa && !c.chao && c.y > 150 && c.y < 620);   // às vezes segue uma folha a cair
          sac.alvo = f.length && Math.random() < 0.6 ? f[Math.floor(Math.random() * f.length)] : Math.random() < 0.5 ? { x: rnd(300, 1300), y: rnd(160, 420) } : { x: rnd(350, 1300), y: rnd(600, 760) };
        }
      }
    }
    const alvoVivo = a => (a && a.x !== undefined ? { x: a.x, y: a.y } : null);

    /* ---------- comportamentos ociosos (no bosque) ---------- */
    const ladoPerto = () => (ct >= 0 ? 2 : 3);   // pata de trás do lado da câmara
    const folhaEsp = { ativa: false, t: 0, x: 0, y: 0, x0: 0, y0: 0, presa: false, solta: false, vy: 0, chao: 0, rot: 0 };
    const ACOES = {
      sentar: { dur: 6, aplicar(A, t) {        // senta-se com a cauda enrolada à volta das patas
        const w = janela(t, 0, 0.7, 5.2, 6);
        misturar(A, SENTADO, w);
        A.cauLado = 2.35 * janela(t, 0.4, 1.4, 4.8, 5.7); A.cauElev = lerp(A.cauElev, -1.25, w);
        A.cabYaw += 0.35 * Math.sin(t * 1.1) * janela(t, 1.2, 1.8, 4.4, 5);
        A.feliz = 0.3 * janela(t, 2, 2.5, 4, 4.6); A.fecho = Math.max(A.fecho, 0.3 * janela(t, 2.2, 2.6, 3.6, 4.2));
      } },
      ouvir: { dur: 3.8, aplicar(A, t) {       // ouve um barulho: roda uma orelha, depois a outra, e inclina a cabeça
        A.rodaE = 1.0 * janela(t, 0.1, 0.3, 1.2, 1.5) - 0.35 * janela(t, 1.5, 1.7, 3.2, 3.6);
        A.rodaD = 1.0 * janela(t, 0.9, 1.1, 2.0, 2.3);
        A.cabRoll += 0.3 * janela(t, 1.7, 2.1, 3.0, 3.5); A.cabYaw += 0.4 * janela(t, 0.2, 0.6, 1.3, 1.7) - 0.25 * janela(t, 1.3, 1.7, 2.7, 3.1);
        A.orelhas = 0.5 * janela(t, 0, 0.3, 3.2, 3.8); A.esc = 1 + 0.08 * janela(t, 1.7, 2.1, 3.0, 3.5); A.dilata = 0.4 * janela(t, 0.2, 0.5, 3.0, 3.6);
      } },
      cheirar: { dur: 4.6, olhar: false, aplicar(A, t) {   // segue um cheiro no chão: cabeça baixa e alguns passos
        const w = janela(t, 0, 0.5, 4.0, 4.6);
        A.cabU = lerp(A.cabU, 62, w); A.cabH = lerp(A.cabH, -74, w); A.cabNod += 0.9 * w; A.incl -= 0.1 * w; A.alt -= 8 * w;
        A.cabYaw = lerp(0.6, 0.1 + 0.45 * Math.sin(t * 2.1), w); A.nariz = w; A.orelhas = 0.4 * w; olhoAlvo = [2 * w, 4 * w];
        A.cauElev = lerp(A.cauElev, -0.25, w); A.cauAmp = lerp(A.cauAmp, 0.3, w); A.cauVel = lerp(A.cauVel, 1.4, w);
        const d = 70 * sinoide((t - 0.5) / 2.0) * (1 - sinoide((t - 2.9) / 1.4));
        ctl.x = REP.x + d * Math.cos(REP.th); ctl.z = REP.z + d * Math.sin(REP.th);
      } },
      cocar: { dur: 3.6, aplicar(A, t) {       // senta-se e coça a orelha com a pata de trás
        misturar(A, SENTADO, janela(t, 0, 0.45, 3.1, 3.55));
        const wl = janela(t, 0.5, 0.8, 2.4, 2.75), i = ladoPerto(), f = Math.sin(t * TAU * 7.5) * passo(0.75, 0.9, t) * (1 - passo(2.25, 2.4, t));
        esp.i = i; esp.w = wl; esp.u = 34 + f * 8; esp.v = PERNAS[i].v * 1.3; esp.h = 150 + f * 9;
        A.cabRoll += -0.36 * wl * Math.sign(ct || 1); A.cabH -= 30 * wl; A.cabU -= 20 * wl; A.cabYaw += 0.15 * wl;
        A.fecho = Math.max(A.fecho, 0.75 * wl); A.boca = 0.2 * wl; A.feliz = 0.5 * wl; A.achatar = 0.3 * wl; A.cauAmp = 0.1;
        if (wl > 0.5 && Math.abs(f) > 0.95) orD[0].v += 40 * Math.sign(f);
      } },
      bocejar: { dur: 3.0, olhar: false, aplicar(A, t) {
        const w = janela(t, 0, 0.3, 1.6, 2.0);
        A.cabYaw = lerp(0.6, 0.95, janela(t, 0, 0.3, 2.4, 3.0)); olhoAlvo = [0, 0];
        A.cabNod -= 0.42 * w; A.cabH += 10 * w;
        A.boca = 1.15 * janela(t, 0.2, 0.95, 1.45, 1.85); A.fecho = Math.max(A.fecho, 0.95 * janela(t, 0.3, 0.7, 1.45, 1.8));
        A.lingua = 0.3 * janela(t, 0.5, 0.9, 1.4, 1.8); A.achatar = 0.45 * w;
        A.cabRoll += 0.12 * Math.sin((t - 1.9) * TAU * 5) * janela(t, 1.9, 2.0, 2.3, 2.5);
        A.lambe = janela(t, 2.35, 2.5, 2.7, 2.9); A.boca = Math.max(A.boca, 0.15 * A.lambe);
      } },
      espreguicar: { dur: 4.4, aplicar(A, t) {   // vénia com as patas da frente esticadas e depois estica as de trás
        const w1 = janela(t, 0, 0.6, 1.9, 2.4);
        misturar(A, VENIA, w1);
        A.boca = Math.max(A.boca, 0.55 * janela(t, 0.6, 1.0, 1.5, 1.9)); A.fecho = Math.max(A.fecho, 0.85 * janela(t, 0.7, 1.0, 1.5, 1.8)); A.achatar = 0.45 * w1;
        const w2 = janela(t, 2.5, 3.0, 3.6, 4.2);
        A.incl += 0.1 * w2; A.alt -= 12 * w2; A.fixT = Math.max(A.fixT, w2); A.pTU = lerp(A.pTU, -36, w2); A.cabH -= 10 * w2; A.cauElev += 0.5 * w2; A.fecho = Math.max(A.fecho, 0.5 * w2);
      } },
      lamberCauda: { dur: 5, olhar: false, aplicar(A, t) {   // traz a cauda para a frente e lambe-a
        const w = janela(t, 0, 0.8, 4.2, 5);
        misturar(A, SENTADO, w);
        A.cauLado = 3.1 * w; A.cauElev = lerp(A.cauElev, -1.05, w); A.cauAmp = 0.03;
        const wc = janela(t, 0.6, 1.3, 3.9, 4.6);
        A.cabYaw = lerp(0.6, 1.75, wc); A.cabH -= 70 * wc; A.cabU -= 18 * wc; A.cabNod += 0.55 * wc; A.cabRoll += 0.15 * wc;
        const lb = janela(t, 1.4, 1.55, 1.7, 1.85) + janela(t, 2.0, 2.15, 2.3, 2.45) + janela(t, 2.6, 2.75, 2.9, 3.05) + janela(t, 3.2, 3.35, 3.5, 3.65);
        A.boca = Math.max(A.boca, 0.3 * lb); A.lingua = Math.max(A.lingua, 0.9 * lb); A.fecho = Math.max(A.fecho, 0.6 * janela(t, 1.3, 1.5, 3.6, 3.9));
        olhoAlvo = [0, 3];
      } },
      deitar: { dur: 6.5, aplicar(A, t) {      // deita-se um bocadinho com a cabeça nas patas
        const w = janela(t, 0, 0.9, 5.4, 6.4);
        misturar(A, DEITADO, w); A.cauLado = 1.7 * w;
        A.fecho = Math.max(A.fecho, 0.55 * janela(t, 1.5, 2.2, 4.2, 4.8)); A.cabYaw += 0.25 * Math.sin(t * 0.9) * w;
        A.rodaE = 0.9 * janela(t, 2.6, 2.75, 3.1, 3.3);
      } },
      folha: { dur: 5.6, olhar: false, aplicar(A, t) {   // segue uma folha a cair e apanha-a com a boca
        const f = folhaEsp;
        if (!f.ativa && t < 0.2) iniciarFolhaEsp();
        if (f.ativa && !f.presa) olharPara(A, { x: f.x, y: f.y }, 1.3);
        else if (f.ativa) { A.cabYaw = 0.75; olhoAlvo = [1, 1]; }
        const lunge = janela(t, 2.35, 2.62, 2.8, 3.2);
        A.cabU += 22 * lunge; A.cabH += 12 * lunge; A.alt -= 16 * janela(t, 1.9, 2.25, 2.4, 2.55);
        A.orelhas = Math.max(A.orelhas, 0.8 * janela(t, 0.3, 0.8, 2.9, 3.5)); A.dilata = 0.8 * janela(t, 0.3, 0.8, 2.6, 3.0); A.esc = 1 + 0.08 * janela(t, 0.3, 0.8, 2.6, 3.0);
        A.boca = Math.max(0.75 * janela(t, 2.3, 2.42, 2.56, 2.66), 0.14 * janela(t, 2.62, 2.7, 4.0, 4.1), 0.45 * janela(t, 4.05, 4.15, 4.35, 4.5));
        A.feliz = 0.6 * janela(t, 2.9, 3.2, 4.6, 5.2); A.cauAmp = lerp(A.cauAmp, 0.5, janela(t, 2.8, 3.1, 4.6, 5.2)); A.cauVel = lerp(A.cauVel, 2.6, janela(t, 2.8, 3.1, 4.6, 5.2));
        if (t > 2.4 && !this.pulo) { this.pulo = true; if (!salto.ativo) { salto.ativo = true; salto.t = 0; salto.aterrou = false; salto.alt = 30; } }
        if (t < 0.1) this.pulo = false;
      } }
    };
    // Caçar o rato (só com o acontecimento do rato): vira-se, agacha-se, salta bem alto e mergulha de focinho nas folhas
    const CACAR = { dur: 7.4, olhar: false, aplicar(A, t, dt) {
      const c = caca;
      if (t < 0.05 || !c.ini) { c.ini = true; c.x0 = X; c.z0 = Z; c.th0 = TH; c.ang = Math.atan2(MONTE.z - Z, MONTE.x - X); c.queda = false; c.salto = false; c.saiu = false; }
      const alvoRato = { x: MONTE.x, y: YB + KZ * MONTE.z - 18 };
      // 1) vira-se para o rato (cabeça primeiro) e espreita
      const k1 = sinoide((t - 0.15) / 0.8), th = c.th0 + angDif(c.th0, c.ang) * k1;
      // 2) aproxima-se agachada, rabo a abanar
      const k2 = sinoide((t - 1.0) / 1.2), d2 = 16 * k2;
      let x = c.x0 + Math.cos(c.ang) * d2, z = c.z0 + Math.sin(c.ang) * d2;
      const lx = MONTE.x - Math.cos(c.ang) * 126, lz = MONTE.z - Math.sin(c.ang) * 126;   // onde aterra o corpo
      const agacha = janela(t, 0.9, 1.4, 2.42, 2.55);
      misturar(A, AGACHADO, agacha);
      A.cabH = lerp(A.cabH, 6, agacha); A.cabU = lerp(A.cabU, 56, agacha); A.cauElev = lerp(A.cauElev, -0.15, agacha); A.cauAmp = lerp(A.cauAmp, 0.02, agacha);
      A.alt -= 14 * janela(t, 2.2, 2.4, 2.5, 2.56);                     // antecipação
      const abana = janela(t, 1.8, 2.0, 2.3, 2.45);
      A.incl += 0.04 * Math.sin(t * TAU * 5) * abana; A.alt += 3 * Math.sin(t * TAU * 5) * abana;
      A.orelhas = Math.max(A.orelhas, janela(t, 0.1, 0.4, 4.6, 5.2)); A.dilata = janela(t, 0.2, 0.5, 3.4, 4.2); A.esc = 1 + 0.08 * janela(t, 0.2, 0.5, 3.3, 3.8);
      if (t < 2.5) olharPara(A, alvoRato, 1.2);
      // 3) salto em arco (sobe de nariz no ar, desce de nariz para baixo)
      const k3 = clamp((t - 2.5) / 0.8, 0, 1), voo = t >= 2.5 && t < 3.3;
      saltoAlvo = voo ? 165 * Math.pow(Math.sin(PI * k3), 0.85) : 0;
      if (t >= 2.5) { const s = sinoide(k3); x = lerp(c.x0 + Math.cos(c.ang) * 16, lx, s); z = lerp(c.z0 + Math.sin(c.ang) * 16, lz, s); }
      if (voo && !c.salto) { c.salto = true; orD[0].v -= 200; orD[1].v += 200; }
      const wv = janela(t, 2.45, 2.55, 3.25, 3.32);
      A.incl = lerp(A.incl, lerp(0.5, -1.0, passo(0.15, 0.85, k3)), wv);
      A.fixF = Math.max(A.fixF, wv); A.fixT = Math.max(A.fixT, wv);
      A.pFU = lerp(A.pFU, lerp(20, 54, passo(0.4, 0.9, k3)), wv); A.pFH = lerp(A.pFH, lerp(36, 0, passo(0.45, 0.95, k3)), wv);
      A.pTU = lerp(A.pTU, -34, wv); A.pTH = lerp(A.pTH, 22, wv);
      A.cabNod += lerp(-0.3, 0.9, passo(0.2, 0.9, k3)) * wv; A.cabU = lerp(A.cabU, 64, wv); A.cabH = lerp(A.cabH, 30, wv);
      A.cauElev = lerp(A.cauElev, 0.1, wv); A.cauCurl = lerp(A.cauCurl, 0.08, wv); A.achatar = 0;
      // 4) focinho enterrado nas folhas, rabo e cauda no ar
      const wf = janela(t, 3.28, 3.34, 4.15, 4.6);
      if (t >= 3.3 && !c.queda) { c.queda = true; soltarFolhas(MONTE.x, YB + KZ * MONTE.z - 14, 16, 1.4, 60); orD[0].v += 300; orD[1].v -= 300; }
      A.incl = lerp(A.incl, -0.82, wf); A.alt = lerp(A.alt, -40, wf); A.fixF = Math.max(A.fixF, wf); A.pFU = lerp(A.pFU, 54, wf); A.pFH = lerp(A.pFH, 0, wf);
      A.cabNod = lerp(A.cabNod, 1.1, wf); A.cabH = lerp(A.cabH, -40, wf); A.cabU = lerp(A.cabU, 60, wf); A.fecho = Math.max(A.fecho, wf);
      A.cauElev = lerp(A.cauElev, 1.0, wf); A.cauAmp = lerp(A.cauAmp, 0.55, wf); A.cauVel = lerp(A.cauVel, 3.2, wf); A.cauCurl = lerp(A.cauCurl, 0.1, wf);
      // 5) tira a cabeça: o rato fugiu! inclina a cabeça, sacode as folhas e volta ao sítio
      const wp = janela(t, 4.3, 4.6, 5.0, 5.4);
      A.cabRoll += 0.34 * wp; A.esc = Math.max(A.esc, 1 + 0.1 * wp); A.orelhas = Math.max(A.orelhas, wp);
      if (t > 4.2 && t < 5.4) olharPara(A, ev.ativo && ev.ativo.tipo === 'rato' && ev.ativo.alvo ? ev.ativo.alvo : { x: 200, y: 780 }, 1.3);
      const ab = janela(t, 5.2, 5.28, 5.75, 5.95), osc = Math.sin((t - 5.2) * TAU * 7);
      A.cabRoll += osc * 0.45 * ab; sacX = osc * 8 * ab; A.fecho = Math.max(A.fecho, 0.85 * ab); A.cauAmp = lerp(A.cauAmp, 0.8, ab); A.cauVel = lerp(A.cauVel, 7, ab);
      if (ab > 0.3) { orD[0].v += osc * 1600 * dt; orD[1].v += osc * 1600 * dt; }
      if (t > 5.3 && !c.saiu) { c.saiu = true; soltarFolhas(cabPos[0], cabPos[1] + 20, 8, 1.2, 50); }
      if (t < 5.95) { ctl.x = x; ctl.z = z; ctl.th = th; } else ctl.thAlvo = REP.th;
    } };
    const caca = { ini: false };
    const fora = { acao: null, nome: '', t: 0, prox: 2.5, ultima: '' };
    function escolherAcao() {
      const nomes = Object.keys(ACOES).filter(n => n !== fora.ultima);
      const n = nomes[Math.floor(Math.random() * nomes.length)];
      fora.acao = ACOES[n]; fora.nome = n; fora.ultima = n; fora.t = 0; ladoCauda = ct >= 0 ? 1 : -1;
    }
    function comportamentoFora(dt, A) {
      const evA = interesse();
      if (evA && fora.acao && fora.nome !== 'cacar') { fora.acao = null; fora.prox = 3; }
      esp.i = -1; esp.w = 0; abanoAlvo = 0; ctl.x = null; ctl.z = null; ctl.th = null; ctl.thAlvo = null; sacX = 0;
      if (fora.acao) { fora.t += dt; fora.acao.aplicar(A, fora.t, dt); if (fora.t >= fora.acao.dur) { fora.acao = null; fora.prox = rnd(1.2, 3.2); if (fora.nome === 'cacar') caca.ini = false; } }
      else if (!evA && !reacao.ativa) { fora.prox -= dt; if (fora.prox <= 0) escolherAcao(); }
      A.alt += Math.sin(tempo * 0.9) * 1.2;
      let thAlvo = ctl.thAlvo !== null ? ctl.thAlvo : REP.th;
      if (evA && !fora.acao) {
        if (evA.x < cabPos[0] - 200) thAlvo = 1.25; else if (evA.x > cabPos[0] + 420) thAlvo = 0.1;
        A.orelhas = Math.max(A.orelhas, 0.6); A.cauVel = Math.max(A.cauVel, 1.6); A.cauAmp = Math.max(A.cauAmp, 0.3); A.esc = Math.max(A.esc, 1.05); A.dilata = Math.max(A.dilata, 0.3);
        if (ev.ativo && ev.ativo.cheirar) { const w = ev.ativo.cheirar; A.cabH -= 70 * w; A.cabU += 20 * w; A.nariz = w; A.incl -= 0.08 * w; }
      }
      if (ctl.x !== null) { X = ctl.x; Z = ctl.z; SX.x = X; SX.v = 0; SZ.x = Z; SZ.v = 0; }
      else { mola(SX, REP.x, 2.4, dt); mola(SZ, REP.z, 2.4, dt); X = SX.x; Z = SZ.x; }
      if (ctl.th !== null) { S.th.x = ctl.th; S.th.v = 0; TH = ctl.th; }
      else { mola(S.th, S.th.x + angDif(S.th.x, thAlvo), 2.6, dt); mola(abano, abanoAlvo, 18, dt); TH = S.th.x + abano.x; }
      if (!(fora.acao && fora.acao.olhar === false)) {
        const yawAcao = A.cabYaw - EM_PE.cabYaw;
        olharPara(A, alvoVivo(evA) || alvoVivo(sac.alvo), 1.3);
        A.cabYaw += fora.acao ? yawAcao : 0;
      }
    }
    let abanoAlvo = 0;

    /* ---------- dentro da toca ---------- */
    const ACOES_DENTRO = {
      suspiro: { dur: 2.4, aplicar(A, t) { const w = janela(t, 0, 0.8, 1.2, 2.2); A.resp = lerp(A.resp, 3.2, janela(t, 0, 0.6, 0.8, 1.6)); A.fecho = Math.max(A.fecho, 0.7 * w); A.cabH -= 5 * janela(t, 0.8, 1.2, 1.8, 2.4); A.achatar = 0.2 * w; } },
      levantar: { dur: 2.8, aplicar(A, t) { const w = janela(t, 0, 0.35, 2.3, 2.8); A.cabH += 30 * w; A.cabNod -= 0.2 * w; A.cabYaw += 0.55 * Math.sin(t * 2.2) * w; A.orelhas = 0.5 * w; A.cruz = lerp(A.cruz, 0.2, w); } },
      orelhas: { dur: 2.2, aplicar(A, t) { A.rodaE = 1.0 * janela(t, 0, 0.2, 0.8, 1.1); A.rodaD = 1.0 * janela(t, 0.7, 0.9, 1.6, 1.9); A.orelhas = 0.3 * janela(t, 0, 0.2, 1.8, 2.2); olhoAlvo = [3 * Math.sin(t * 2), 0]; } },
      cauda: { dur: 1.8, aplicar(A, t) { const w = janela(t, 0, 0.1, 1.4, 1.8); A.cauAmp = 0.22 * w; A.cauVel = 2.2; A.feliz = 0.3 * w; A.cauLado -= 0.25 * w * Math.abs(Math.sin(t * TAU)); } },
      lamber: { dur: 1.3, aplicar(A, t) { A.lambe = janela(t, 0.1, 0.25, 0.45, 0.6) + janela(t, 0.65, 0.77, 0.9, 1.05); A.boca = 0.12 * A.lambe; A.cabH += 6 * janela(t, 0, 0.2, 1.0, 1.3); } },
      aninhar: { dur: 3.6, aplicar(A, t) { const w = janela(t, 0, 0.7, 2.8, 3.6); A.cauLado += 0.35 * w; A.cabH -= 6 * w; A.cabYaw -= 0.4 * w; A.cabNod += 0.15 * w; A.fecho = Math.max(A.fecho, 0.9 * janela(t, 0.5, 0.9, 2.6, 3.0)); A.achatar = 0.3 * w; } }
    };
    const dentro = { acao: null, t: 0, prox: 2, ultima: '' };
    function comportamentoDentro(dt, A) {
      misturar(A, DEITADO, 1);
      A.cauLado = 3.0; A.cauElev = -0.75; A.achatar = 0.12;
      const evA = interesse();
      if (!reacao.ativa && !som.ativo) {
        if (dentro.acao) { dentro.t += dt; dentro.acao.aplicar(A, dentro.t); if (dentro.t >= dentro.acao.dur) { dentro.acao = null; dentro.prox = rnd(2, 4.5); } }
        else { dentro.prox -= dt; if (dentro.prox <= 0) { const ns = Object.keys(ACOES_DENTRO).filter(n => n !== dentro.ultima); const n = ns[Math.floor(Math.random() * ns.length)]; dentro.acao = ACOES_DENTRO[n]; dentro.ultima = n; dentro.t = 0; } }
      }
      if (evA) { A.cabH += 20; A.orelhas = Math.max(A.orelhas, 0.5); A.achatar = 0; A.cauAmp = 0.12; A.cauVel = 2; }
      X = TOCA.x; Z = TOCA.z; TH = PI / 2; ladoCauda = 1;
      const y0 = A.cabYaw;
      olharPara(A, alvoVivo(evA) || alvoVivo(sac.alvo), 0.75);
      if (dentro.acao) A.cabYaw += y0 - EM_PE.cabYaw;
    }

    /* ---------- reagir (toque) e ganir ---------- */
    const reacao = { ativa: false, t: 0 };
    const salto = { ativo: false, t: 0, alt: 34 };
    function camadaReacao(dt, A, D) {
      let h = 0;
      if (salto.ativo) {
        salto.t += dt; const t = salto.t;
        D.alt -= 16 * janela(t, 0, 0.05, 0.08, 0.13) + 11 * janela(t, 0.43, 0.47, 0.5, 0.64);
        D.incl += 0.08 * janela(t, 0.1, 0.18, 0.3, 0.44);
        h = (t > 0.1 && t < 0.44) ? salto.alt * Math.sin(PI * (t - 0.1) / 0.34) : 0;
        if (t > 0.44 && !salto.aterrou) { salto.aterrou = true; orD[0].v -= 160; orD[1].v += 160; }
        if (t > 0.7) salto.ativo = false;
      }
      saltoH = Math.max(h, SH.x);
      if (!reacao.ativa) return;
      reacao.t += dt; const t = reacao.t, w = janela(t, 0, 0.05, 1.0, 1.45);
      A.orelhas = lerp(A.orelhas, 1, w); A.achatar = lerp(A.achatar, 0, w); A.feliz = lerp(A.feliz, 0.9, w); A.esc = lerp(A.esc, 1.08, w); A.dilata = lerp(A.dilata, 0.5, w);
      A.boca = Math.max(A.boca, 0.28 * w); A.lingua = Math.max(A.lingua, 0.25 * w);
      A.cauVel = lerp(A.cauVel, 4.2, w); A.cauAmp = lerp(A.cauAmp, modo === 'dentro' ? 0.25 : 0.6, w);
      if (modo === 'dentro') { A.cabH += 34 * w; A.cabNod -= 0.2 * w; A.cabRoll += 0.12 * Math.sin(t * TAU * 2.5) * w; A.cruz = lerp(A.cruz, 0.2, w); }
      else { A.cauElev = lerp(A.cauElev, 0.1, w); A.cabRoll += 0.1 * Math.sin(t * TAU * 3) * w; }
      if (t > 1.45) reacao.ativa = false;
    }
    let som = { ativo: false, t: 0, lat: [], fim: 0 };
    function camadaSom(dt, A, D) {
      if (!som.ativo) return;
      som.t += dt;
      let env = 0, pre = 0;
      som.lat.forEach(l => {
        const tb = som.t - l.a;
        if (tb > -0.14 && tb < 0) pre = Math.max(pre, passo(-0.14, -0.03, tb));
        if (tb >= 0 && tb < l.d + 0.1) {
          const e = tb < 0.04 ? tb / 0.04 : tb < l.d * 0.7 ? 1 : 1 - (tb - l.d * 0.7) / (l.d * 0.3 + 0.1);
          env = Math.max(env, clamp(e, 0, 1));
          if (!l.k) { l.k = true; orD[0].v += 220; orD[1].v -= 220; }
        }
      });
      const wSom = janela(som.t, 0, 0.12, som.fim - 0.1, som.fim + 0.25);
      D.boca = Math.max(D.boca, env * 0.9);
      D.cabU += env * 8 - pre * 4; D.cabH += env * 12 + pre * 2; D.cabNod += -env * 0.38 + pre * 0.12; D.alt -= env * 3;
      A.achatar = Math.max(A.achatar, 0.28 * env); A.orelhas = Math.max(A.orelhas, 0.3 * wSom * (1 - env)); 
      A.cauVel = Math.max(A.cauVel, 2.4); A.cauAmp = Math.max(A.cauAmp, 0.3 * wSom); A.fecho = Math.max(A.fecho, 0.35 * env);
      if (modo === 'dentro') { A.cabH += 26 * wSom; A.cabNod -= 0.1 * wSom; }
      if (som.t > som.fim + 0.3) som.ativo = false;
    }

    /* ---------- ida para a toca e volta ---------- */
    let seq = null;
    function correrIda(dt, A, D) {
      seq.T += dt; const T = seq.T;
      A.cauVel = 1.5; A.cauAmp = 0.2; A.cauElev = -0.3; A.cauCurl = 0.1;
      A.orelhas = 0.7 * janela(T, 0, 0.2, 1.3, 1.7);
      D.alt -= 9 * janela(T, 0.02, 0.12, 0.2, 0.36);
      if (T < 0.25) { TH = seq.th0; A.cabYaw = lerp(0.6, -0.3, passo(0, 0.2, T)); olhoAlvo = [4, 0]; }
      else if (T < 1.45) {
        const s = sinoide((T - 0.25) / 1.2), p = seq.cam.pos(s), rumo = seq.cam.rumo(clamp(s, 0.02, 0.98));
        X = p[0]; Z = p[1];
        TH = seq.th0 + angDif(seq.th0, rumo) * passo(0.2, 0.55, T);
        seq.thFim = TH;
        A.cabYaw = 0.1 - 0.35 * passo(1.0, 1.4, T); olhoAlvo = [3, 1.5];
      } else {
        const k = sinoide((T - 1.45) / 0.4);
        TH = seq.thFim + angDif(seq.thFim, -PI / 2) * k; X = lerp(seq.xFim, TOCA.x, k); Z = lerp(seq.zFim, 196, k);
        A.cabYaw = -0.45 * janela(T, 1.4, 1.55, 1.7, 1.9); olhoAlvo = [0, 2];
      }
      if (T < 1.45) { seq.xFim = X; seq.zFim = Z; }
      const cheira = janela(T, 1.25, 1.4, 1.6, 1.8);
      A.cabNod += 0.35 * cheira; A.cabH -= 40 * cheira; A.cabU += 14 * cheira; A.nariz = cheira;
      misturar(A, AGACHADO, passo(1.5, 1.85, T) * (1 - passo(3.05, 3.4, T)));
      A.achatar = 0.5 * janela(T, 1.75, 1.95, 2.9, 3.2);
      if (T > 1.8) Z = lerp(196, -165, sinoide((T - 1.8) / 0.9));
      tocaModo = T >= 1.8;
      if (T > 2.6) TH = lerp(-PI / 2, PI / 2, sinoide((T - 2.6) / 0.5));
      A.enrolar = janela(T, 2.45, 2.65, 3.05, 3.3); A.cabU -= 24 * A.enrolar;
      if (T > 3.0) Z = lerp(-165, TOCA.z, sinoide((T - 3.0) / 0.45));
      misturar(A, DEITADO, passo(3.0, 3.5, T));
      ladoCauda = 1; A.cauLado = 3.0 * passo(3.0, 3.55, T); A.cauElev = lerp(A.cauElev, -0.75, passo(3.0, 3.5, T));
      if (T > 3.1) olhoAlvo = [0, 0];
      if (!seq.e1 && T > 2.3) { seq.e1 = true; mexerToca(0.6); }
      if (!seq.e2 && T > 3.4) { seq.e2 = true; mexerToca(1.2); soltarFolhas(1000, 556, 3, 0.4, 220); soltarFolhas(1000, 744, 7, 0.8, 120); }
      if (!seq.pisco && T > 0.6) { seq.pisco = true; espantarPisco(); }
      A.resp = lerp(A.resp, 2.8, janela(T, 3.45, 3.55, 3.65, 3.8)); A.fecho = Math.max(A.fecho, 0.5 * janela(T, 3.45, 3.55, 3.65, 3.8));
      if (T >= 3.75) {
        modo = 'dentro'; seq = null; tocaModo = true; dentro.acao = null; dentro.prox = rnd(1.5, 3);
        const r = resolverIda; resolverIda = null; if (r) r();
        if (pendenteVolta) { pendenteVolta = false; iniciarVolta(); }
      }
    }
    function correrVolta(dt, A, D) {
      seq.T += dt; const T = seq.T;
      misturar(A, AGACHADO, passo(0.05, 0.35, T) * (1 - passo(0.8, 1.05, T)));
      misturar(A, DEITADO, 1 - passo(0.05, 0.35, T));
      ladoCauda = 1; A.cauLado = 3.0 * (1 - passo(0.05, 0.4, T)); A.cauElev = -0.35; A.cauCurl = 0.1;
      A.orelhas = 0.8 * janela(T, 0, 0.15, 0.9, 1.2); A.feliz = 0.35 * janela(T, 0, 0.2, 0.8, 1.1); A.cauVel = 1.6; A.cauAmp = 0.25;
      if (T < 1.55) {
        X = TOCA.x; TH = PI / 2;
        Z = lerp(TOCA.z, 196, sinoide((T - 0.22) / 0.7));
        olhoAlvo = [0, 0]; A.cabYaw = 0;
      }
      tocaModo = T < 0.95;
      // espreguiça-se (vénia rápida) e sacode as folhas do pelo
      misturar(A, VENIA, janela(T, 0.88, 1.02, 1.12, 1.26));
      const ab = janela(T, 1.2, 1.26, 1.48, 1.6), osc = Math.sin((T - 1.2) * TAU * 7);
      A.cabRoll += osc * 0.45 * ab; sacX = osc * 8 * ab; A.fecho = Math.max(A.fecho, 0.85 * ab); A.cauAmp = lerp(A.cauAmp, 0.8, ab); A.cauVel = lerp(A.cauVel, 7, ab);
      if (ab > 0.3) { orD[0].v += osc * 1600 * dt; orD[1].v += osc * 1600 * dt; }
      if (!seq.p1 && T > 1.22) { seq.p1 = true; soltarFolhas(X, YB + KZ * Z - 150, 10, 1.3, 70); }
      if (!seq.e1 && T > 0.4) { seq.e1 = true; mexerToca(0.7); }
      if (T >= 1.55) {
        if (T < 1.8) { const k = sinoide((T - 1.55) / 0.25); TH = PI / 2 + angDif(PI / 2, seq.rumo0) * k; X = TOCA.x; Z = 196; A.cabYaw = 0.5 * janela(T, 1.5, 1.6, 1.75, 1.9); }
        else {
          const s = sinoide((T - 1.8) / 0.88), p = seq.cam.pos(s), rumo = seq.cam.rumo(clamp(s, 0.02, 0.98));
          X = p[0]; Z = p[1];
          if (T < 2.66) { TH = seq.rumo0 + angDif(seq.rumo0, rumo) * passo(1.8, 1.95, T); seq.thFim = TH; A.cabYaw = 0.3 * passo(1.8, 1.95, T); olhoAlvo = [-3, 1]; }
          else { const k = sinoide((T - 2.66) / 0.32); TH = seq.thFim + angDif(seq.thFim, REP.th) * k; olharPara(A, null, 1.2); }
        }
      }
      if (T >= 2.98) {
        modo = 'fora'; seq = null; tocaModo = false; sacX = 0;
        TH = Math.atan2(Math.sin(TH), Math.cos(TH)); S.th.x = TH; S.th.v = 0; SX.x = X; SX.v = 0; SZ.x = Z; SZ.v = 0; fora.acao = null; fora.prox = rnd(2, 4);
        const r = resolverVolta; resolverVolta = null; if (r) r();
        if (pendenteIda) { pendenteIda = false; iniciarIda(); }
      }
    }
    let resolverIda = null, resolverVolta = null, pendenteIda = false, pendenteVolta = false;
    function iniciarIda() {
      fora.acao = null; caca.ini = false; reacao.ativa = false; salto.ativo = false; saltoAlvo = 0; esp.i = -1; sacX = 0;
      seq = { T: 0, th0: TH, thFim: TH, xFim: X, zFim: Z, cam: caminho([[X, Z], [X + 110, Z + 50], [880, 226], [968, 206]]) };
      modo = 'indo';
    }
    function iniciarVolta() {
      reacao.ativa = false; dentro.acao = null;
      seq = { T: 0, cam: caminho([[TOCA.x, 196], [880, 220], [REP.x + 130, REP.z + 50], [REP.x, REP.z]]) };
      seq.rumo0 = PI / 2 + angDif(PI / 2, seq.cam.rumo(0.02));
      modo = 'voltando';
    }

    /* ---------- toca: feto e cogumelos abanam, folhas caem ---------- */
    const fetoT = { x: 0, v: 0 }, cogT = { x: 0, v: 0 };
    function mexerToca(f) { fetoT.v += 70 * f; cogT.v -= 40 * f; }

    /* ---------- folhas soltas (mergulho, sacudidela, chegada à toca) ---------- */
    const parts = cn.pf.map(e => ({ e, vida: 1, dur: 1, x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, e2: 1, fase: 0 }));
    function soltarFolhas(x, y, n, forca, larg) {
      let k = 0;
      for (const p of parts) {
        if (p.vida < p.dur) continue;
        const a = rnd(PI * 1.1, PI * 1.9);
        p.x = x + rnd(-larg, larg) * 0.5; p.y = y + rnd(-8, 8); p.vx = Math.cos(a) * rnd(60, 160) * forca; p.vy = Math.sin(a) * rnd(120, 260) * forca;
        p.vida = 0; p.dur = rnd(1.4, 2.2); p.r = rnd(0, 360); p.vr = rnd(-400, 400); p.e2 = rnd(1.4, 2.1); p.fase = rnd(0, 6); p.chao = YB + KZ * rnd(60, 220);
        if (++k >= n) break;
      }
    }
    function atualizarFolhas(dt) {
      for (const p of parts) {
        if (p.vida >= p.dur) { if (p.e._o !== 0) opa(p.e, 0); continue; }
        p.vida += dt;
        if (p.y < p.chao) {
          p.vx *= Math.exp(-1.8 * dt); p.vy = Math.min(p.vy + 420 * dt, 90); p.vy *= Math.exp(-0.6 * dt);
          p.x += (p.vx + 40 * Math.sin(p.vida * 5 + p.fase)) * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        }
        const k = p.vida / p.dur;
        tr(p.e, `translate(${n1(p.x)},${n1(p.y)}) rotate(${n1(p.r)}) scale(${n3(p.e2 * Math.cos(p.vida * 6 + p.fase))},${n3(p.e2)})`);
        opa(p.e, passo(0, 0.05, k) * (1 - passo(0.75, 1, k)));
      }
    }

    /* ---------- folha especial (a raposa apanha-a com a boca) ---------- */
    function iniciarFolhaEsp() {
      const f = folhaEsp; f.ativa = true; f.t = 0; f.presa = false; f.solta = false; f.vy = 0; f.rot = 0;
      f.x0 = narizPos[0] + 90; f.y0 = 140; f.x = f.x0; f.y = f.y0; f.chao = YB + KZ * (REP.z + 40);
    }
    function atualizarFolhaEsp(dt) {
      const f = folhaEsp, e = cn.caem[0], m = caem[0];
      if (!f.ativa) return;
      f.t += dt; m.ativa = false;
      const T = 2.6;
      if (!f.presa && f.t < T) {
        const k = f.t / T, tx = narizPos[0] + 6, ty = narizPos[1] + 2;
        f.x = lerp(f.x0, tx, sinoide(k)) + 34 * Math.sin(f.t * 2.4) * (1 - k); f.y = lerp(f.y0, ty, k * k * 0.4 + k * 0.6); f.rot = 40 * Math.sin(f.t * 2.4);
        if (f.t > 2.45) { const w = passo(2.45, 2.6, f.t); f.x = lerp(f.x, tx, w); f.y = lerp(f.y, ty, w); }
      } else if (f.t < 4.15) { f.presa = true; f.x = narizPos[0] + 2; f.y = narizPos[1] + 6; f.rot = -70; }
      else {
        if (!f.solta) { f.solta = true; f.vy = 20; }
        if (f.y < f.chao) { f.vy = Math.min(f.vy + 300 * dt, 70); f.y += f.vy * dt; f.x += 20 * Math.sin(f.t * 3) * dt; f.rot += 120 * dt; }
      }
      const op = 1 - passo(6.5, 7.5, f.t);
      tr(e, `translate(${n1(f.x)},${n1(f.y)}) rotate(${n1(f.rot)})`); tr(e.firstChild, `scale(${n3(f.presa && !f.solta ? 0.9 : Math.cos(f.t * 4) * 0.9 + 0.1)},1)`); opa(e, op);
      if (f.t > 7.5) { f.ativa = false; m.ativa = false; m.t = rnd(2, 5); tr(e, 'translate(-100,-100)'); }
    }

    /* ---------- acontecimentos raros: rato no monte de folhas, esquilo com a bolota, ouriço ---------- */
    const ev = { ativo: null, prox: rnd(12, 18), ordem: [] };
    function interesse() { return ev.ativo && ev.ativo.alvo; }
    const EVENTOS = {
      rato(e) {
        const t = e.t, my = YB + KZ * MONTE.z;
        let x = MONTE.x + 6, y = my - 8, sobe = 0, dir = 1, cab = 0, corre = 0;
        if (t < 3.0) { sobe = passo(0, 0.5, t); cab = 18 * Math.sin(t * 2.6) * passo(0.6, 0.9, t); dir = Math.sin(t * 0.9) > 0.3 ? -1 : 1; }
        else if (t < 4.0) sobe = 1 - passo(3.0, 3.12, t);
        else if (t < 6.2) { const k = (t - 4.0) / 2.2; x = lerp(MONTE.x - 70, -80, passo(0, 1, k)); y = my + 4; sobe = 1; dir = -1; corre = 1; }
        else { e.fim = true; return; }
        if (t > 0.5 && !e.chamou) { e.chamou = true; if (modo === 'fora' && !seq) { fora.acao = CACAR; fora.nome = 'cacar'; fora.t = 0; caca.ini = false; reacao.ativa = false; espantarPisco(); } }
        const pulo = corre ? Math.abs(Math.sin(t * 22)) * 5 : 0;
        tr(cn.rato, `translate(${n1(x)},${n1(y + (1 - sobe) * 30 - pulo)}) scale(${dir * 1.15},1.15)`);
        tr(cn.rtCab, `rotate(${n1(cab)} 10 -8)`); tr(cn.rtCauda, `rotate(${n1(corre ? 10 * Math.sin(t * 22) : 6 * Math.sin(t * 3))} -14 4)`);
        tr(cn.rtNariz, `translate(0,${n1(Math.sin(t * 40) * 0.8)})`);
        e.alvo = sobe > 0.3 ? { x, y: y - 14 } : { x: MONTE.x, y: my - 10 };
      },
      esquilo(e) {
        const t = e.t; let x, y, rot = 0, dir = -1, corre = 0, sentado = 0, comBolota = true;
        if (t < 1.4) { const k = sinoide(t / 1.4); x = 898; y = lerp(80, RAMO_Y(898) - 4, k); rot = -80 * (1 - passo(0.8, 1, k)); corre = 1; }
        else if (t < 3.0) { const k = sinoide((t - 1.4) / 1.6); x = lerp(898, 800, k); y = RAMO_Y(x) - 4; corre = 1; }
        else if (t < 6.2) { x = 800; y = RAMO_Y(800) - 4; sentado = 1; comBolota = t < 5.0; }
        else if (t < 8.4) { const k = sinoide((t - 6.2) / 2.2); x = lerp(800, 898, passo(0, 0.55, k)); y = k < 0.55 ? RAMO_Y(x) - 4 : lerp(RAMO_Y(898) - 4, 40, passo(0.55, 1, k)); rot = k > 0.55 ? -80 : 0; dir = 1; corre = 1; }
        else { x = -300; y = -300; }
        const passos = corre ? Math.sin(t * 26) : 0;
        tr(cn.esq, `translate(${n1(x)},${n1(y - (corre ? Math.abs(passos) * 3 : 0))}) rotate(${n1(rot)}) scale(${dir * -1.45},1.45)`);
        tr(cn.eqCab, `rotate(${n1(sentado ? 10 * Math.sin(t * 9) * (t < 5 ? 1 : 0) - (t > 5 ? 22 : 0) : 0)} -14 -18)`);
        tr(cn.eqCauda, `rotate(${n1(corre ? 12 * passos : 6 * Math.sin(t * 2) + (t > 4.2 && t < 4.5 ? 20 : 0))} 4 -12)`);
        tr(cn.eqPf, `rotate(${n1(corre ? 40 * passos : -20)} -12 -4)`); tr(cn.eqPt, `rotate(${n1(corre ? -40 * passos : 0)} 4 -4)`);
        tr(cn.eqC, `rotate(${n1(sentado ? -14 : 0)})`); opa(cn.eqBolota, comBolota ? 1 : 0);
        // a bolota cai do ramo, salta e rola no chão
        const b = e.b || (e.b = { x: 0, y: 0, vy: 0, vx: 0, r: 0, ativa: false });
        if (t >= 5.0 && !b.ativa && !b.feito) { b.ativa = true; b.feito = true; b.x = 800 - 35; b.y = RAMO_Y(800) - 16; b.vy = 0; b.vx = 30; b.chao = YB + KZ * 150; b.saltos = 0; }
        if (b.ativa) {
          const dt = e.dt; b.vy += 900 * dt; b.y += b.vy * dt; b.x += b.vx * dt; b.r += b.vx * dt * 6;
          if (b.y > b.chao) { b.y = b.chao; b.vy = -b.vy * 0.38; b.vx *= 0.6; b.saltos++; if (b.saltos > 3) { b.vy = 0; b.vx *= 0.9; } }
          tr(cn.bolota, `translate(${n1(b.x)},${n1(b.y)})`); tr(cn.blR, `rotate(${n1(b.r)})`); opa(cn.bolota, 1 - passo(12, 13, t));
        }
        e.alvo = (t > 5.0 && t < 11) ? { x: b.x, y: b.y } : (x > 0 ? { x, y: y - 20 } : null);
        e.cheirar = janela(t, 6.6, 7.2, 10, 10.8);
        if (t > 13) { e.fim = true; tr(cn.bolota, 'translate(-300,-300)'); }
      },
      ourico(e) {
        const t = e.t, y = 712;
        let x;
        if (t < 7.5) x = lerp(1480, 720, t / 7.5); else if (t < 9.5) x = 720; else if (t < 16.5) x = lerp(720, -90, (t - 9.5) / 7); else { e.fim = true; return; }
        const anda = t < 7.5 || t > 9.5, fase = t * TAU * 3.2;
        tr(cn.our, `translate(${n1(x)},${y}) scale(-1.25,1.25)`);
        tr(cn.ouC, `translate(0,${n1(anda ? -Math.abs(Math.sin(fase)) * 2.5 : 0)}) rotate(${n1(anda ? 1.5 * Math.sin(fase) : 3 * Math.sin(t * 5) * janela(t, 7.6, 7.8, 9.2, 9.4))})`);
        tr(cn.ouP1, `translate(${n1(anda ? 4 * Math.sin(fase) : 0)},0)`); tr(cn.ouP2, `translate(${n1(anda ? -4 * Math.sin(fase) : 0)},0)`);
        e.alvo = { x, y: y - 20 };
      }
    };
    function esconderEvento(tipo) { const g = tipo === 'rato' ? cn.rato : tipo === 'esquilo' ? cn.esq : cn.our; tr(g, 'translate(-300,-300)'); }
    function atualizarEventos(dt) {
      if (!ev.ativo) {
        ev.prox -= dt;
        if (ev.prox <= 0 && modo !== 'indo' && modo !== 'voltando' && !(fora.acao && fora.nome === 'cacar')) {
          if (!ev.ordem.length) ev.ordem = ['rato', 'esquilo', 'ourico'].sort(() => Math.random() - 0.5);
          ev.ativo = { tipo: ev.ordem.pop(), t: 0, alvo: null, fim: false };
        }
        return;
      }
      const e = ev.ativo; e.t += dt; e.dt = dt; EVENTOS[e.tipo](e);
      if (e.fim) { esconderEvento(e.tipo); ev.ativo = null; ev.prox = rnd(15, 30) * (reduzido ? 1.6 : 1); }
    }

    /* ---------- pisco no tronco caído ---------- */
    const TOPO_TRONCO = x => 636 - (x - 120) * 0.022;
    const pisco = { estado: 'pousado', t: 0, x: 240, prox: rnd(1, 3), salto: 0, dx: 0, cab: 0 };
    function espantarPisco() { if (pisco.estado === 'pousado') { pisco.estado = 'foge'; pisco.t = 0; } }
    function atualizarPisco(dt) {
      const p = pisco; p.t += dt;
      let x = p.x, y = TOPO_TRONCO(p.x), bat = 0, rot = 0, dir = p.dx < 0 ? -1 : 1, bica = 0;
      if (p.estado === 'pousado') {
        p.prox -= dt;
        if (p.prox <= 0) { p.prox = rnd(1.2, 3.5); if (Math.random() < 0.6) { p.salto = 0.25; p.dx = (p.x > 300 ? -1 : p.x < 150 ? 1 : (Math.random() < 0.5 ? -1 : 1)) * rnd(20, 45); } else p.bica = 0.5; }
        if (p.salto > 0) { p.salto -= dt; const k = 1 - p.salto / 0.25; p.x += p.dx * dt / 0.25; y = TOPO_TRONCO(p.x) - 10 * Math.sin(PI * clamp(k, 0, 1)); x = p.x; }
        if (p.bica > 0) { p.bica -= dt; bica = Math.sin(PI * (1 - p.bica / 0.5) * 2) > 0 ? 40 : 0; }
        if (modo === 'indo' || (fora.acao && fora.nome === 'cacar')) espantarPisco();
      } else if (p.estado === 'foge') {
        const k = p.t / 1.6; x = p.x - 260 * p.t; y = TOPO_TRONCO(p.x) - 240 * p.t * (1 - k * 0.3); bat = Math.sin(p.t * TAU * 9); rot = 20; dir = -1;
        if (p.t > 1.8) { p.estado = 'longe'; p.t = 0; p.espera = rnd(12, 20); }
      } else if (p.estado === 'longe') {
        x = -300; y = -300;
        if (p.t > p.espera && modo !== 'indo' && modo !== 'voltando' && !(fora.acao && fora.nome === 'cacar')) { p.estado = 'volta'; p.t = 0; }
      } else if (p.estado === 'volta') {
        const k = sinoide(p.t / 2.2), pos = bezier([[-60, 300], [80, 260], [180, 520], [240, TOPO_TRONCO(240)]], k); x = pos[0]; y = pos[1]; bat = k < 0.97 ? Math.sin(p.t * TAU * 8) : 0; rot = -10 * (1 - k); dir = 1;
        if (p.t > 2.2) { p.estado = 'pousado'; p.t = 0; p.x = 240; }
      }
      tr(cn.pisco, `translate(${n1(x)},${n1(y)}) rotate(${n1(rot)}) scale(${dir * 1.15},1.15)`);
      tr(cn.pcAsa, `rotate(${n1(bat ? -40 + bat * 50 : 0)} -6 -12)`); tr(cn.pcCab, `rotate(${n1(bica + (Math.sin(p.t * 1.7) > 0.8 ? -15 : 0))} 4 -12)`);
      tr(cn.pcCauda, `rotate(${n1(8 * Math.max(0, Math.sin(p.t * 5)) * (p.estado === 'pousado' ? 1 : 0))} -10 -6)`);
    }

    /* ---------- cenário vivo: copas, fetos, raios de luz, ciscos no ar, folhas a cair ---------- */
    const caem = cn.caem.map(() => ({ ativa: false, t: rnd(0.5, 8), x: 0, y: 0, chao: 0, vida: 0, fase: 0, sw: 0, vel: 0, espera: 0 }));
    const ciscos = cn.ciscos.map(() => ({ x: rnd(100, 1300), y: rnd(80, 700), f: rnd(0, 6), v: rnd(4, 10) }));
    function atualizarCena(dt) {
      const a = AMB;
      cn.copas.forEach((e, i) => { const m = metaCopas[i]; tr(e, `rotate(${n1(1.3 * a * Math.sin(tempo * 0.6 + m.f) + 0.5 * a * Math.sin(tempo * 1.7 + m.f))} ${m.x} ${m.y + 60})`); });
      cn.fetos.forEach((e, i) => { const m = metaFetos[i]; tr(e, `rotate(${n1(2.2 * a * Math.sin(tempo * 0.9 + m.f) + 0.8 * a * Math.sin(tempo * 2.3 + m.f))} ${m.x} ${m.y})`); });
      cn.raios.forEach((e, i) => { const b = +e.getAttribute('data-op'); opa(e, b * (0.72 + 0.28 * Math.sin(tempo * (0.25 + i * 0.07) + i * 1.7))); });
      molaElastica(fetoT, 0, 60, 3, dt); molaElastica(cogT, 0, 160, 6, dt);
      tr(cn.fetoToca, `rotate(${n1(fetoT.x + 2 * a * Math.sin(tempo * 1.1))} 812 760)`);
      tr(cn.cogToca, `rotate(${n1(cogT.x * 0.15)} 1188 752)`);
      ciscos.forEach((c, i) => {
        c.y -= c.v * dt * 0.6; c.x += (c.v * 0.8 + 6 * Math.sin(tempo * 0.5 + c.f)) * dt; if (c.y < 60 || c.x > 1500) { c.y = rnd(300, 760); c.x = rnd(80, 1200); }
        tr(cn.ciscos[i], `translate(${n1(c.x)},${n1(c.y)})`); opa(cn.ciscos[i], (0.35 + 0.35 * Math.sin(tempo * 1.3 + c.f * 3)) * a);
      });
      caem.forEach((c, i) => {
        if (i === 0 && folhaEsp.ativa) return;
        const e = cn.caem[i];
        if (!c.ativa) { c.t -= dt * (reduzido ? 0.5 : 1); if (c.t <= 0) { c.ativa = true; c.chao = 0; c.vida = 0; c.x = rnd(60, 1540); c.y = rnd(-30, 160); c.fase = rnd(0, 6); c.sw = rnd(28, 55); c.vel = rnd(38, 60); c.fundo = rnd(600, 860); c.r = rnd(0, 360); } return; }
        c.vida += dt;
        if (!c.chao) {
          c.y += c.vel * dt; c.x += (Math.cos(c.vida * 1.9 + c.fase) * c.sw * 1.9 + 10) * dt;
          if (c.y >= c.fundo) { c.chao = 1; c.espera = rnd(2, 4); }
          tr(e, `translate(${n1(c.x)},${n1(c.y)}) rotate(${n1(c.r + 50 * Math.sin(c.vida * 1.9 + c.fase))})`);
          tr(e.firstChild, `scale(${n3(Math.cos(c.vida * 2.6 + c.fase))},1)`); opa(e, 1);
        } else {
          c.espera -= dt; tr(e.firstChild, 'scale(1,.55)'); opa(e, clamp(c.espera, 0, 1));
          if (c.espera <= 0) { c.ativa = false; c.t = rnd(1, 6); tr(e, 'translate(-100,-100)'); }
        }
      });
      atualizarPisco(dt);
    }

    /* ---------- passos (pés presos ao chão) ---------- */
    const pref = new Array(4), estica = [0, 0, 0, 0];
    function predizer(px, pz, lead) {
      const a = velTh * lead, dx = px - X, dz = pz - Z, ca = Math.cos(a), sa = Math.sin(a);
      return [X + dx * ca - dz * sa + velX * lead, Z + dx * sa + dz * ca + velZ * lead];
    }
    function atualizarPassos(dt, ombro, anca) {
      const vel = Math.hypot(velX, velZ), girar = Math.abs(velTh), andar = vel > 6 || girar > 0.25;
      for (let i = 0; i < 4; i++) {
        const p = PERNAS[i], at = p.frente ? ombro : anca, uu = at[0] + (p.frente ? 6 : -4);
        pref[i] = [X + uu * ct - p.v * st, Z + uu * st + p.v * ct];
      }
      const livre = i => (esp.i === i ? esp.w : (PERNAS[i].frente ? V.fixF : V.fixT)) < 0.15;
      const dur = clamp(0.24 - vel * 0.0003, 0.14, 0.24), lift = andar ? 11 + vel * 0.03 : 7;
      const algum = pes.some(p => p.sw);
      quieto = andar ? 0 : quieto + dt;
      if (!algum && saltoH < 0.5) {
        let melhor = -1, erroM = 0;
        for (const par of [0, 1]) {
          let erro = 0;
          for (let i = 0; i < 4; i++) if (PERNAS[i].par === par && livre(i)) { const t = predizer(pref[i][0], pref[i][1], dur * 0.5); erro = Math.max(erro, Math.hypot(pes[i].gx - t[0], pes[i].gz - t[1])); }
          if (erro > erroM) { erroM = erro; melhor = par; }
        }
        const lim = andar ? 15 : 7;
        if (melhor >= 0 && erroM > lim && (andar || quieto > 0.25)) {
          for (let i = 0; i < 4; i++) if (PERNAS[i].par === melhor && livre(i)) { const p = pes[i]; p.sw = true; p.t = 0; p.fx = p.gx; p.fz = p.gz; p.dur = dur; p.lift = lift; }
        }
      }
      for (let i = 0; i < 4; i++) {
        const p = pes[i], pn = PERNAS[i], at = pn.frente ? ombro : anca;
        if (p.sw || !livre(i) || saltoH > 0.5) continue;
        const dx = p.gx - X, dz = p.gz - Z, fu = dx * ct + dz * st;
        if (Math.hypot(fu - at[0], 14 - at[1]) > 0.95 * (pn.L[0] + pn.L[1] + pn.L[2]) || Math.abs(fu - at[0]) > 66) { p.sw = true; p.t = 0; p.fx = p.gx; p.fz = p.gz; p.dur = Math.min(dur, 0.17); p.lift = lift; }
      }
      bob = 0;
      for (let i = 0; i < 4; i++) {
        const p = pes[i];
        if (!p.sw) continue;
        p.t += dt / p.dur;
        const k = Math.min(1, p.t), alvo = predizer(pref[i][0], pref[i][1], p.dur * (1 - k) + p.dur * 0.5), e = sinoide(k);
        p.gx = lerp(p.fx, alvo[0], e); p.gz = lerp(p.fz, alvo[1], e); p.h = p.lift * Math.sin(PI * k);
        bob = Math.max(bob, Math.sin(PI * k) * clamp(vel / 250, 0, 1) * 6);
        if (p.t >= 1) { p.sw = false; p.h = 0; p.gx = alvo[0]; p.gz = alvo[1]; }
      }
    }

    /* ---------- geometria: projetar e desenhar a raposa ---------- */
    const P = (uu, v, h) => [X + sacX + uu * ct - v * st, YB + KZ * (Z + uu * st + v * ct) - h - saltoH];
    function segmento(els, A, B, L0) {
      const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy);
      const t = `translate(${n1(A[0])},${n1(A[1])}) rotate(${n1(Math.atan2(-dx, dy) * GRAU)}) scale(1,${n3(Math.max(0.05, len / L0))})`;
      for (const e of els) tr(e, t);
      return Math.atan2(-dx, dy) * GRAU;
    }
    function ik2(au, ah, tu, th, a, b, s) {
      let du = tu - au, dh = th - ah, d = Math.hypot(du, dh);
      const dmax = (a + b) * 0.995, dmin = Math.abs(a - b) + 1;
      const k = d > dmax ? dmax / d : d < dmin ? dmin / Math.max(d, 1e-3) : 1;
      du *= k; dh *= k; d = Math.hypot(du, dh);
      const A = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1)), base = Math.atan2(dh, du), ang = base + s * A;
      return [au + a * Math.cos(ang), ah + a * Math.sin(ang), au + du, ah + dh];
    }
    function desenhar(dt) {
      ct = Math.cos(TH); st = Math.sin(TH);
      const cb = Math.cos(V.incl), sb = Math.sin(V.incl), hc = HC + V.alt + bob, fl = 0.9 * (1 - 0.32 * V.enrolar);   // enrolar: encolhe o corpo para se virar na toca
      const loc = (pu, ph) => [pu * fl * cb - ph * sb, hc + pu * fl * sb + ph * cb];
      const ombro = loc(70, -18), anca = loc(-72, -22), pesc = loc(92, 30), cauR = loc(-116, 14), peitoP = loc(106, -4), garP = loc(-112, 0);
      const br = Math.sin(respFase) * V.resp;
      atualizarPassos(dt, ombro, anca);
      const zz = (uu, v) => uu * st + v * ct;
      // tronco (desenho de lado, achatado de frente; luz sempre de cima)
      const cw = (ct >= 0 ? 1 : -1) * Math.max(Math.abs(ct), 0.42), fr = 1 - Math.min(Math.abs(ct), 0.42) / 0.42;
      const ma = cw * cb * fl, mc = cw * sb * (1 - fr), mb = (KZ * st * cb - sb) * (1 - fr) * fl, md = KZ * st * sb + cb;
      tr(el.trM, `matrix(${n3(ma)},${n3(mb)},${n3(mc)},${n3(md)},${n1(X + sacX)},${n1(YB + KZ * Z - hc - saltoH)})`);
      tr(el.trR, `scale(${n3(1 + 0.004 * br)},${n3((1 + 0.02 * br) * 0.9)})`);
      partes.tronco.z = 0; partes.tronco.gz = Z;
      // peito e garupa vistos de frente/de trás
      const pp = P(peitoP[0], 0, peitoP[1]), sxp = passo(0.3, 0.95, st);
      const deit = clamp(-V.alt / 88, 0, 1) * V.fixF;
      tr(el.ptM, `translate(${n1(pp[0])},${n1(pp[1] - 20 * deit)}) scale(${n3(Math.pow(sxp, 0.85))},${n3((1 + 0.022 * br + Math.max(0, V.incl) * 0.35) * (1 - 0.45 * deit))})`);
      opa(el.ptM, passo(0, 0.08, sxp));
      if (el.ptC._so !== n3(passo(0.5, 0.85, st))) { el.ptC._so = n3(passo(0.5, 0.85, st)); el.ptC.setAttribute('stroke-opacity', el.ptC._so); }
      partes.peito.z = zz(peitoP[0], 0) + 1; partes.peito.gz = Z + zz(peitoP[0], 0);
      const pg = P(garP[0], 0, garP[1]), sxg = passo(0.2, 0.95, -st);
      opa(el.gaM, passo(0, 0.08, sxg));
      tr(el.gaM, `translate(${n1(pg[0])},${n1(pg[1])}) scale(${n3(Math.pow(sxg, 0.85))},1)`);
      if (el.gaC._so !== n3(passo(0.5, 0.85, -st))) { el.gaC._so = n3(passo(0.5, 0.85, -st)); el.gaC.setAttribute('stroke-opacity', el.gaC._so); }
      partes.garupa.z = zz(garP[0], 0) + 1; partes.garupa.gz = Z + zz(garP[0], 0);
      // pescoço (com a garganta branca do lado da frente) e cabeça
      mola(cabBob, -bob * 1.2, 16, dt);
      const hu = pesc[0] + V.cabU, hh = pesc[1] + V.cabH + br * 1.6 + cabBob.x;
      const pn = P(pesc[0], 0, pesc[1]), ph = P(hu, 0, hh);
      const angP = segmento([el.pcM], pn, ph, 100);
      const cxa = Math.cos(angP / GRAU);
      opa(el.garg, passo(-0.35, 0.15, st)); tr(el.garg, `translate(${n1(clamp(ct, -1, 1) * 13 * (cxa < 0 ? -1 : 1))},0) scale(${n3(0.75 + 0.25 * Math.abs(st))},1)`);
      partes.pescoco.z = zz(pesc[0], 0) - 1; partes.pescoco.gz = Z + zz(pesc[0], 0);
      const roll = V.cabRoll;
      tr(el.cab, `translate(${n1(ph[0])},${n1(ph[1])}) rotate(${n1(roll * GRAU)})`);
      partes.cabeca.z = zz(hu, 0) + 45; partes.cabeca.gz = Z + zz(hu, 0);
      if (ultCab) { const vx = (ph[0] - ultCab[0]) / Math.max(dt, 1e-3); cabVel = lerp(cabVel, vx, 1 - Math.exp(-dt * 12)); }
      ultCab = ph; cabPos = ph;
      for (let i = 0; i < 2; i++) molaElastica(orD[i], clamp(-cabVel * 0.05, -24, 24), 150, 7, dt);
      // cabeça (feições)
      mola(olhos.x, olhoAlvo[0], 30, dt); mola(olhos.y, olhoAlvo[1], 30, dt);
      const fecho = Math.max(V.fecho, piscarV);
      const E = estadoCabeca({ phi: TH + V.cabYaw, nu: V.cabNod, boca: Math.max(V.boca, Dboca), lingua: V.lingua, lambe: V.lambe, feliz: V.feliz, fecho, esc: V.esc, dilata: V.dilata, orelhas: V.orelhas, achatar: V.achatar, rodaE: V.rodaE, rodaD: V.rodaD, orDin: [orD[0].x, orD[1].x], olhoX: olhos.x.x, olhoY: olhos.y.x, nariz: V.nariz * Math.sin(tempo * TAU * 7) });
      aplicarCabeca(E);
      const cr = Math.cos(roll), sr = Math.sin(roll);
      narizPos = [ph[0] + E.nar[0] * cr - E.nar[1] * sr, ph[1] + E.nar[0] * sr + E.nar[1] * cr];
      // patas
      for (let i = 0; i < 4; i++) {
        const pn2 = PERNAS[i], pe = pes[i], at = pn2.frente ? ombro : anca, L = pn2.L, els = pernasEl[i];
        let w = pn2.frente ? V.fixF : V.fixT, fx = pe.gx, fz = pe.gz, fh = pe.h;
        if (esp.i === i) w = Math.max(w, esp.w);
        if (w > 0.001) {
          let tu, tv, th;
          if (pn2.frente) { tu = ombro[0] + V.pFU; tv = pn2.v * (1 - 0.85 * V.cruz) - Math.sign(pn2.v) * V.cruz * 10; th = V.pFH; }
          else { tu = anca[0] + V.pTU; tv = pn2.v + Math.sign(pn2.v) * V.pTV; th = V.pTH; }
          if (esp.i === i) { const k = esp.w; tu = lerp(tu, esp.u, k); tv = lerp(tv, esp.v, k); th = lerp(th, esp.h, k); }
          const wx = X + tu * ct - tv * st, wz = Z + tu * st + tv * ct, dd = Math.hypot(pe.gx - wx, pe.gz - wz);
          fx = lerp(fx, wx, w); fz = lerp(fz, wz, w); fh = lerp(fh, th, w);
          if (w < 0.98 && dd > 6 && saltoH < 1) fh += Math.sin(PI * w) * Math.min(14, dd * 0.4);   // a pata levanta-se e pousa, não desliza
          if (w > 0.98) { pe.gx = fx; pe.gz = fz; pe.h = 0; pe.sw = false; }
        }
        const dx = fx - X, dz = fz - Z, fu = dx * ct + dz * st, fv = -dx * st + dz * ct, fhh = fh + 12 + saltoH * 0.2;
        const Lr = (L[1] + L[2]) * (pn2.frente ? V.dobraF : V.dobraT);
        const r1 = ik2(at[0], at[1], fu, fhh, L[0], Lr, pn2.frente ? -1 : 1), j1 = [r1[0], r1[1]];
        const r = ik2(j1[0], j1[1], fu, fhh, L[1], L[2], pn2.frente ? 1 : -1);
        estica[i] = Math.hypot(fu - at[0], fhh - at[1]) / (L[0] + L[1] + L[2]);
        const A = P(at[0], pn2.v, at[1]), B = P(j1[0], lerp(pn2.v, fv, 0.35), j1[1]), C = P(r[0], lerp(pn2.v, fv, 0.7), r[1]), Dp = P(r[2], fv, r[3]);
        B[0] -= sacX * 0.4; C[0] -= sacX * 0.75; Dp[0] -= sacX;
        segmento(els.seg[0], A, B, L[0]); segmento(els.seg[1], B, C, L[1]); segmento(els.seg[2], C, Dp, L[2]);
        const sgc = ct >= 0 ? 1 : -1, ergue = clamp(fh / 10, 0, 1);
        const tPata = `translate(${n1(Dp[0])},${n1(Dp[1])}) rotate(${n1(sgc * ergue * (esp.i === i ? 40 : 14))})`;
        for (const e of els.seg[3]) tr(e, tPata);
        const tPe = `scale(${n3(sgc * (0.8 + 0.2 * Math.abs(ct)))},1)`;
        for (const e of els.pe) tr(e, tPe);
        opa(els.dl, Math.abs(ct)); opa(els.df, Math.max(0, st));
        opa(els.al, pn2.frente ? 0 : clamp(-st * 1.6 - 0.6, 0, 1) * clamp(fh / 5, 0, 1) + (esp.i === i ? esp.w * 0.9 : 0));
        opa(els.sb, clamp(-(pn2.v * ct) / 30, 0, 1) * 0.32);
        partes['perna' + i].z = zz(Math.max(at[0], pn2.frente ? fu + 10 : at[0]), pn2.v) + (pn2.frente && V.cruz > 0.5 ? (i === 0 ? 2 : -2) : 0);
        partes['perna' + i].gz = Z + zz(at[0], pn2.v);
      }
      // cauda (onda: a ponta atrasa-se em relação à base; pode enrolar-se para o lado da câmara)
      let tu = cauR[0], tv = 0, th = cauR[1], ant = P(tu, tv, th), ang = 0, zMax = zz(tu, tv);
      const N = CW.length;
      for (let k = 0; k < N; k++) {
        const fase = cauFase - k * 0.55;
        const wv = ladoCauda * V.cauLado * Math.pow((k + 1) / N, 0.6) + V.cauAmp * Math.sin(fase) * (0.35 + 0.65 * k / (N - 1));
        const e = V.cauElev + V.incl * (1 - k / N) + k * V.cauCurl + 0.22 * V.cauAmp * Math.sin(fase + 1.2);
        tu += -Math.cos(e) * Math.cos(wv) * LC; tv += Math.cos(e) * Math.sin(wv) * LC; th = Math.max(CW[k] * 0.8, th + Math.sin(e) * LC);
        const cur = P(tu, tv, th);
        ang = segmento(caudaEl[k], ant, cur, LC);
        ant = cur; zMax = Math.max(zMax, zz(tu, tv));
      }
      for (const e of caudaEl[7]) tr(e, `translate(${n1(ant[0])},${n1(ant[1])}) rotate(${n1(ang)})`);
      partes.cauda.z = zMax + 2; partes.cauda.gz = Z + zz(cauR[0], 0);
      // sombra no chão
      const sh = P(0, 0, -saltoH);
      tr(el.sombra, `translate(${n1(sh[0])},${n1(YB + KZ * Z)}) scale(${n1((124 * Math.abs(ct) + 72 * Math.abs(st) + 26 + (V.alt < -60 ? 16 : 0)) * (1 - saltoH / 260))},${n1((14 + 9 * Math.abs(st)) * (1 - saltoH / 260))})`);
      opa(el.sombra, 1 - saltoH / 220);
      partes.sombra.z = -1e4; partes.sombra.gz = Z;
      ordenarERecortar();
    }
    const recorte = `url(#${u}recorte)`;
    let ordemAtual = '';
    function ordenarERecortar() {
      const lista = Object.keys(partes).sort((a, b) => partes[a].z - partes[b].z);
      const chave = lista.join();
      if (chave !== ordemAtual) { ordemAtual = chave; for (const k of lista) raposaG.appendChild(partes[k].el); }
      for (const k of lista) {
        const p = partes[k], r = tocaModo && p.gz < 0;
        if (r !== p.recorte) { p.recorte = r; if (r) p.el.setAttribute('clip-path', recorte); else p.el.removeAttribute('clip-path'); }
      }
    }

    /* ---------- quadro a quadro ---------- */
    let piscarV = 0, Dboca = 0;
    function quadro(ms) {
      if (destruido) return;
      const dt = Math.min(ms, 50) / 1000;
      if (!(dt > 0)) return;
      tempo += dt;
      atualizarCena(dt); atualizarEventos(dt); atualizarFolhas(dt); atualizarFolhaEsp(dt); saccades(dt); espasmoOrelha(dt);
      const A = Object.assign({}, EM_PE), D = { alt: 0, incl: 0, cabU: 0, cabH: 0, cabNod: 0, boca: 0 };
      saltoAlvo = 0;
      if (modo === 'fora') comportamentoFora(dt, A);
      else if (modo === 'indo') correrIda(dt, A, D);
      else if (modo === 'dentro') comportamentoDentro(dt, A);
      else if (modo === 'voltando') correrVolta(dt, A, D);
      mola(SH, saltoAlvo, saltoAlvo > SH.x ? 40 : 30, dt); if (SH.x < 0) SH.x = 0;
      camadaReacao(dt, A, D); camadaSom(dt, A, D);
      piscarV = piscar(dt);
      for (const k of CHAVES) { mola(S[k], A[k], OMEGA[k] || 9, dt); V[k] = S[k].x; }
      V.alt += D.alt; V.incl += D.incl; V.cabU += D.cabU; V.cabH += D.cabH; V.cabNod += D.cabNod; Dboca = D.boca;
      respFase += dt * TAU * V.respVel; cauFase += dt * TAU * V.cauVel;
      const kv = 1 - Math.exp(-dt * 14);
      velX = lerp(velX, (X - antX) / dt, kv); velZ = lerp(velZ, (Z - antZ) / dt, kv); velTh = lerp(velTh, angDif(antTh, TH) / dt, kv);
      antX = X; antZ = Z; antTh = TH;
      opa(tocaFrente, modo === 'dentro' ? 1 : modo === 'indo' && seq ? passo(2.1, 2.7, seq.T) : modo === 'voltando' && seq ? 1 - passo(0.3, 0.75, seq.T) : 0);
      desenhar(dt);
    }
    quadro(16);
    const desligar = relogio ? relogio.aCada(quadro) : () => {};

    return {
      animal: raposaG,
      habitat,
      reagir() {
        if (destruido || modo === 'indo' || modo === 'voltando') return;
        reacao.ativa = true; reacao.t = 0;
        orD[0].v -= 160; orD[1].v += 160;
        if (modo === 'fora') {
          if (fora.nome !== 'cacar' || !fora.acao) { fora.acao = null; fora.prox = rnd(2.5, 4.5); esp.i = -1; }
          if (!salto.ativo && !reduzido && !(fora.acao && fora.nome === 'cacar')) { salto.ativo = true; salto.t = 0; salto.aterrou = false; salto.alt = 34; }
        } else dentro.acao = null;
      },
      fazerSom(ms, silabas) {         // silabas = [[início s, duração s], …] medidas no som da app (ferramentas/limpar-voz.js)
        if (destruido) return;
        ms = Number(ms) || 1500;
        let lat;
        if (Array.isArray(silabas) && silabas.length) lat = silabas.map(([a, d]) => ({ a: +a || 0, d: Math.min(0.4, Math.max(0.08, +d || 0.2)), k: false }));
        else { const s = ms / 1000, n = clamp(Math.round(s / 0.55), 1, 5); lat = []; for (let i = 0; i < n; i++) lat.push({ a: 0.05 + i * s / n, d: Math.min(0.3, s / n * 0.55), k: false }); }
        som = { ativo: true, t: 0, lat, fim: lat[lat.length - 1].a + lat[lat.length - 1].d };
        if (modo === 'fora' && !(fora.acao && fora.nome === 'cacar')) { fora.acao = null; fora.prox = Math.max(fora.prox, 2.5); }
      },
      irAoHabitat() {
        return new Promise(res => {
          if (destruido) return;
          if (modo === 'dentro') return res();
          const antes = resolverIda; resolverIda = () => { if (antes) antes(); res(); };
          if (modo === 'fora') iniciarIda(); else if (modo === 'voltando') pendenteIda = true;
        });
      },
      voltar() {
        return new Promise(res => {
          if (destruido) return;
          if (modo === 'fora') return res();
          const antes = resolverVolta; resolverVolta = () => { if (antes) antes(); res(); };
          if (modo === 'dentro') iniciarVolta(); else if (modo === 'indo') pendenteVolta = true;
        });
      },
      // só para testes na consola (modo de desenvolvimento): forçar um comportamento ou um acontecimento
      _teste: {
        acao(n) { if (ACOES[n] && modo === 'fora') { fora.acao = ACOES[n]; fora.nome = n; fora.t = 0; ladoCauda = ct >= 0 ? 1 : -1; } else if (ACOES_DENTRO[n] && modo === 'dentro') { dentro.acao = ACOES_DENTRO[n]; dentro.t = 0; } },
        evento(n) { if (!ev.ativo && EVENTOS[n]) ev.ativo = { tipo: n, t: 0, alvo: null, fim: false }; },
        semEventos() { ev.prox = 1e9; },
        estado: () => ({ modo, X, Z, TH, acao: fora.nome, pes: pes.map(p => p.sw), estica: estica.map(n3), pesG: pes.map(p => [n1(p.gx), n1(p.gz), p.sw ? 1 : 0]), fix: [n3(V.fixF), n3(V.fixT)], nariz: narizPos.map(n1), cab: cabPos.map(n1) })
      },
      destruir() { destruido = true; try { desligar(); } catch (e) { /* nada */ } }
    };
  }

  return { icone: gerarIcone(), montar };
})();
