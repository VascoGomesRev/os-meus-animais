/* Leão — «Os Meus Animais». Contrato e regras: REGRAS-ANIMAIS.md.
   Cena: savana africana dourada ao fim da tarde (erva alta amarela, acácias ao longe, céu quente, montanha enevoada)
   com um «kopje» à direita: um monte de grandes rochas de granito com uma caverna baixa onde o leão se deita.
   O leão é um boneco «2,5D» (como o cão e a raposa): esqueleto simples em 3D projetado em cada quadro, patas presas
   ao chão enquanto anda, cabeça feita de elipsoides (focinho claro, almofadas dos bigodes, nariz rosado) e uma juba
   de madeixas presas a dois anéis 3D à volta da cabeça: cada madeixa acompanha a cabeça com atraso («onda») e incha
   quando ruge. A cauda tem 9 segmentos e uma borla escura na ponta. Entra na caverna por camadas: as peças que estão
   para lá da parede de rocha são recortadas e só se veem pela boca da caverna; deita-se com a cabeça e a juba de fora. */
'use strict';
MODULOS.leao = (() => {
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
  function molaElastica(s, alvo, k, c, dt) {  // mola com balanço (orelhas, juba, ervas da caverna)
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
     2. Medidas e poses do leão
     ===================================================================================== */
  const YB = 750;            // y do chão no plano da boca da caverna (profundidade 0)
  const KZ = 0.18;           // quanto a profundidade (z) mexe no y do ecrã: vista ligeiramente de cima
  const HC = 158;            // altura do centro do tronco quando está em pé
  const R = 58;              // raio do crânio
  const REP = { x: 565, z: 112, th: 0.3 };      // sítio de descanso na savana (virado a 3/4 para a direita)
  const CAV = { x: 1012, z: -112 };              // centro da boca da caverna e profundidade onde se deita lá dentro
  const CO = '#5A2C10';                          // contorno castanho quente
  const NSS = 'vector-effect="non-scaling-stroke"';
  const LC = 21, CW = [10.5, 10, 9.5, 9, 8.6, 8.2, 7.8, 7.5, 7.2];   // cauda: comprimento e meia-largura de cada segmento
  const NJN = 10, NJT = 20, NJF = 16;           // madeixas da juba: nuca (mais escura), anel de trás (escuro) e anel da frente (claro)
  // Patas: frente/trás, lado (v > 0 = lado virado para nós quando olha para a direita), segmentos e par diagonal
  const PERNAS = [
    { frente: true, v: 30, L: [54, 58, 26], par: 0 },
    { frente: true, v: -30, L: [54, 58, 26], par: 1 },
    { frente: false, v: 34, L: [56, 56, 40], par: 1 },
    { frente: false, v: -34, L: [56, 56, 40], par: 0 },
  ];
  // Pose base (em pé). Todas as outras só dizem o que muda.
  const EM_PE = {
    alt: 0, incl: 0, cabU: 40, cabH: 86, cabYaw: 0.45, cabNod: 0.04, cabRoll: 0,
    dobraF: 0.86, dobraT: 0.66, fixF: 0, fixT: 0, pFU: 8, pTU: 28, pTV: 0, pFH: 0, pTH: 0, cruz: 0,
    cauElev: -1.4, cauCurl: 0.2, cauAmp: 0.16, cauVel: 0.55, cauLado: 0,
    orelhas: 0, achatar: 0, fecho: 0, feliz: 0, esc: 1, dilata: 0, vesgo: 0,
    boca: 0, lingua: 0, lambe: 0, nariz: 0, resp: 1, respVel: 0.24, enrolar: 0, fofo: 0, jAmp: 3
  };
  const SENTADO = { alt: -46, incl: 0.55, cabU: 30, cabH: 84, dobraF: 0.9, dobraT: 0.4, fixT: 1, pTU: 42, pTV: 4, cauElev: -1.05, cauCurl: 0.12, cauAmp: 0.1, cauVel: 0.5 };
  const DEITADO = { alt: -92, incl: 0, cabU: 34, cabH: 18, cabNod: 0.06, dobraF: 0.85, dobraT: 0.38, fixF: 1, fixT: 1, pFU: 54, pTU: 36, pTV: 22, cruz: 0.3, cauElev: -0.7, cauCurl: 0.06, cauAmp: 0.06, cauVel: 0.45, respVel: 0.19 };
  const AGACHADO = { alt: -66, incl: -0.04, cabU: 46, cabH: 8, cabNod: 0.3, dobraF: 0.6, dobraT: 0.5, cauElev: -0.6, cauCurl: 0.12, cauAmp: 0.08 };
  const VENIA = { alt: -26, incl: -0.42, cabU: 52, cabH: 30, cabNod: -0.05, dobraF: 0.86, fixF: 1, pFU: 72, cauElev: -0.2, cauCurl: 0.3, cauAmp: 0.3, cauVel: 1.2, feliz: 0.3 };
  const CHAVES = Object.keys(EM_PE);
  const OMEGA = { fecho: 40, boca: 22, orelhas: 12, achatar: 12, feliz: 14, cabYaw: 7, cauVel: 4, cauAmp: 5, cauLado: 4, resp: 4, respVel: 3, lingua: 12, esc: 12, dilata: 8, vesgo: 9, nariz: 14, lambe: 18, fixF: 12, fixT: 12, cruz: 6, cabU: 10, cabH: 10, incl: 8, fofo: 10, jAmp: 7 };
  const misturar = (A, pose, w) => { if (w > 0) for (const k in pose) A[k] = lerp(A[k], pose[k], w); };

  /* =====================================================================================
     3. Desenho do leão — gradientes, patas, cauda, tronco, cabeça com juba
     ===================================================================================== */
  function defsLeao(u) {
    return `<linearGradient id="${u}pelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6CB7C"/><stop offset=".5" stop-color="#E6AA55"/><stop offset="1" stop-color="#C4863A"/></linearGradient>
<linearGradient id="${u}perna" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F4C676"/><stop offset=".55" stop-color="#DFA150"/><stop offset="1" stop-color="#B97A33"/></linearGradient>
<radialGradient id="${u}coxa" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#F8CF82"/><stop offset=".6" stop-color="#E4A754"/><stop offset="1" stop-color="#BE7F36"/></radialGradient>
<radialGradient id="${u}pata" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#FFF2D6"/><stop offset=".6" stop-color="#F2D29C"/><stop offset="1" stop-color="#D4A86A"/></radialGradient>
<radialGradient id="${u}cabeca" cx=".38" cy=".3" r=".78"><stop offset="0" stop-color="#FCD892"/><stop offset=".55" stop-color="#EDB461"/><stop offset="1" stop-color="#C98B3E"/></radialGradient>
<radialGradient id="${u}focinho" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#FFE6B4"/><stop offset=".6" stop-color="#F6CB86"/><stop offset="1" stop-color="#DDA460"/></radialGradient>
<radialGradient id="${u}creme" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#FFF3DC"/><stop offset="1" stop-color="#E9CFA2"/></radialGradient>
<radialGradient id="${u}peito" cx=".45" cy=".25" r=".85"><stop offset="0" stop-color="#FFF4DC"/><stop offset=".7" stop-color="#F7DCAA"/><stop offset="1" stop-color="#DEB078"/></radialGradient>
<radialGradient id="${u}iris" cx=".5" cy=".62" r=".62"><stop offset="0" stop-color="#FFE6A0"/><stop offset=".5" stop-color="#E9A93C"/><stop offset=".85" stop-color="#A9661A"/><stop offset="1" stop-color="#6A3A10"/></radialGradient>
<radialGradient id="${u}nariz" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FBC4CA"/><stop offset=".5" stop-color="#E88E99"/><stop offset="1" stop-color="#B85A68"/></radialGradient>
<radialGradient id="${u}lingua" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#F8A6B2"/><stop offset="1" stop-color="#D9566F"/></radialGradient>
<radialGradient id="${u}bocaIn" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#9A3036"/><stop offset="1" stop-color="#561418"/></radialGradient>
<linearGradient id="${u}pescoco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C87A36"/><stop offset=".55" stop-color="#A45A26"/><stop offset="1" stop-color="#7A3E18"/></linearGradient>
<radialGradient id="${u}borla" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#8E5228"/><stop offset=".6" stop-color="#5E3014"/><stop offset="1" stop-color="#3C1C08"/></radialGradient>
<radialGradient id="${u}sombra"><stop offset="0" stop-color="#4A2A0C" stop-opacity=".5"/><stop offset=".6" stop-color="#4A2A0C" stop-opacity=".24"/><stop offset="1" stop-color="#4A2A0C" stop-opacity="0"/></radialGradient>
<clipPath id="${u}olho"><ellipse rx="14" ry="15.5"/></clipPath>`;
  }
  // Cores: com gradientes (no cenário) ou lisas (no ícone, que não deve usar ids)
  function cores(u) {
    const g = k => `url(#${u}${k})`;
    if (u) return { cabeca: g('cabeca'), focinho: g('focinho'), creme: g('creme'), iris: g('iris'), nariz: g('nariz'), lingua: g('lingua'), bocaIn: g('bocaIn') };
    return { cabeca: '#EDB461', focinho: '#F6CB86', creme: '#FFF3DC', iris: '#E9A93C', nariz: '#E88E99', lingua: '#EE7E92', bocaIn: '#6A1A22' };
  }

  // Uma pata: 3 camadas (contorno por baixo de tudo → as articulações não mostram costuras; pelo; sombra do lado longe)
  function svgPerna(u, frente) {
    // [largura em cima, largura em baixo, comprimento]: segmentos afunilados (cápsulas)
    const segs = frente ? [[38, 25, 54], [25, 21, 58], [22, 21, 26]] : [[0, 0, 56], [25, 19, 56], [21, 20, 40]];
    const capsula = (a, b, L, e) => { const ra = a / 2 + e, rb = b / 2 + e; return `<path d="M${n1(-ra)},0 C${n1(-ra)},${n1(-ra * 1.33)} ${n1(ra)},${n1(-ra * 1.33)} ${n1(ra)},0 L${n1(rb)},${L} C${n1(rb)},${n1(L + rb * 1.33)} ${n1(-rb)},${n1(L + rb * 1.33)} ${n1(-rb)},${L}Z"/>`; };
    const forma = (i, e) => (!frente && i === 0)
      ? `<path d="M${n1(-33 - e)},${n1(8)} C${n1(-36 - e)},${n1(-36 - e)} ${n1(32 + e)},${n1(-38 - e)} ${n1(34 + e)},${n1(4)} C${n1(36 + e)},${n1(46)} ${n1(17 + e)},${n1(68 + e)} ${n1(2)},${n1(70 + e)} C${n1(-15 - e)},${n1(70 + e)} ${n1(-31 - e)},${n1(50)} ${n1(-33 - e)},${n1(8)}Z"/>`
      : capsula(segs[i][0], segs[i][1], segs[i][2], e);
    const enche = i => (i === 0 ? (frente ? 'perna' : 'coxa') : 'perna');
    const detalhe = i => {
      if (i === 0 && !frente) return `<path d="M-28,42 C-17,60 2,66 20,62" fill="none" stroke="#B9782E" stroke-width="3" stroke-linecap="round" opacity=".55"/><path d="M-22,-14 C-10,-26 10,-28 22,-18" fill="none" stroke="#FFE2A6" stroke-width="3" stroke-linecap="round" opacity=".6"/><path d="M26,30 C31,42 30,56 23,64" fill="none" stroke="#B9782E" stroke-width="2.5" stroke-linecap="round" opacity=".45"/>`;
      if (i === 0) return `<path d="M-10,34 C-16,44 -16,56 -12,64" fill="none" stroke="#B9782E" stroke-width="2.6" stroke-linecap="round" opacity=".5"/><path d="M7,-6 C10,12 10,30 7,48" fill="none" stroke="#FFE2A6" stroke-width="2.6" stroke-linecap="round" opacity=".5"/>`;
      return `<path d="M${n1(segs[i][0] * 0.16)},4 L${n1(segs[i][0] * 0.16)},${segs[i][2] - 4}" stroke="#FFE0A0" stroke-width="2.6" stroke-linecap="round" opacity=".4"/>`;
    };
    let c = '', f = '', s = '';
    for (let i = 0; i < 3; i++) {
      c += `<g class="g${i}">${forma(i, 3.2)}</g>`;
      f += `<g class="g${i}" fill="url(#${u}${enche(i)})">${forma(i, 0)}${detalhe(i)}</g>`;
      s += `<g class="g${i}">${forma(i, 0)}</g>`;
    }
    c += `<g class="g3"><g class="pe"><ellipse rx="25" ry="15.5"/></g></g>`;
    f += `<g class="g3"><g class="pe"><ellipse rx="22" ry="12.5" fill="url(#${u}pata)"/><ellipse cx="-7" cy="-6" rx="10" ry="3.4" fill="#fff" opacity=".55"/>
<g class="dl" fill="none" stroke="${CO}" stroke-width="2.4" stroke-linecap="round"><path d="M6,-9 C8,-3 8,3 7,9"/><path d="M14,-7 C16,-2 16,4 15,8"/></g>
<g class="df" fill="none" stroke="${CO}" stroke-width="2.4" stroke-linecap="round"><path d="M-7,-4 C-8,1 -8,5 -7,10"/><path d="M7,-4 C8,1 8,5 7,10"/></g>
<g class="al" opacity="0" fill="#7A4A3E"><path d="M-9,5 C-11,-3 11,-3 9,5 C7,10 -7,10 -9,5Z"/><circle cx="-12" cy="-6" r="3.4"/><circle cx="-4" cy="-9" r="3.4"/><circle cx="4" cy="-9" r="3.4"/><circle cx="12" cy="-6" r="3.4"/></g></g></g>`;
    s += `<g class="g3"><g class="pe"><ellipse rx="22" ry="12.5"/></g></g>`;
    return `<g fill="${CO}">${c}</g><g>${f}</g><g class="sb" fill="#4A1E06" opacity="0">${s}</g>`;
  }

  // Cauda fina de 9 segmentos (contorno de todos por baixo, depois o pelo) com a borla escura e farta na ponta
  function svgCauda(u) {
    let c = '', f = '';
    CW.forEach((w, i) => {
      c += `<g class="k${i}"><rect x="${n1(-w - 3)}" y="${n1(-w - 3)}" width="${n1(2 * w + 6)}" height="${n1(LC + 2 * w + 6)}" rx="${n1(w + 3)}"/></g>`;
      f += `<g class="k${i}"><rect x="${n1(-w)}" y="${n1(-w)}" width="${n1(2 * w)}" height="${n1(LC + 2 * w)}" rx="${n1(w)}"/><path d="M${n1(-w * 0.4)},0 L${n1(-w * 0.4)},${LC}" stroke="#FFE2A6" stroke-width="2.4" stroke-linecap="round" opacity=".5"/></g>`;
    });
    const d = fofo(0, 16, 15, 21, 9, 0.28, 0.4, 0.25);
    c += `<g class="k9"><path d="${d}" stroke="${CO}" stroke-width="7" stroke-linejoin="round"/></g>`;
    f += `<g class="k9"><path d="${d}" fill="url(#${u}borla)"/><path d="M-6,4 C-9,14 -7,24 -2,32" fill="none" stroke="#B0703C" stroke-width="2.6" stroke-linecap="round" opacity=".7"/><path d="M5,8 C7,16 6,24 3,30" fill="none" stroke="#2A1206" stroke-width="2" stroke-linecap="round" opacity=".6"/></g>`;
    return `<g fill="${CO}">${c}</g><g fill="url(#${u}perna)">${f}</g>`;
  }

  const TRONCO_D = 'M-146,-6 C-149,-48 -116,-68 -72,-66 C-30,-64 20,-70 66,-69 C116,-68 152,-44 154,-6 C156,30 136,58 104,66 C72,72 42,60 8,56 C-30,52 -72,64 -110,56 C-138,50 -144,24 -146,-6Z';
  function svgTronco(u) {
    const tufo = (x, y, c) => `<path d="M${x + 8},${y - 2} C${x + 4},${y + 8} ${x - 6},${y + 15} ${x - 14},${y + 13} C${x - 8},${y + 9} ${x - 6},${y + 4} ${x - 6},${y - 2}" fill="${c}" stroke="${CO}" stroke-width="2.6" stroke-linejoin="round" ${NSS}/>`;
    return `<g class="trM"><g class="trR">
<path d="${TRONCO_D}" fill="url(#${u}pelo)" stroke="${CO}" stroke-width="5" stroke-linejoin="round" ${NSS}/>
<path d="M-132,-38 C-106,-62 -46,-60 0,-61 C46,-63 98,-64 130,-48 C98,-50 48,-49 0,-48 C-48,-47 -100,-46 -132,-38Z" fill="#B9782E" opacity=".5"/>
<path d="M-74,46 C-36,42 -4,44 16,50 C50,58 82,62 112,56 C130,46 144,26 148,4 C146,32 126,56 98,62 C68,68 40,58 8,54 C-24,51 -52,52 -74,46Z" fill="url(#${u}peito)"/>
<ellipse cx="-12" cy="-44" rx="82" ry="10" fill="#FFE4AA" opacity=".5"/>
<g fill="none" stroke-linecap="round" ${NSS}>
<path d="M76,-32 C90,-14 92,8 84,26" stroke="#C48434" stroke-width="3" opacity=".55"/>
<path d="M-82,-34 C-102,-14 -104,12 -92,30" stroke="#B9782E" stroke-width="3" opacity=".5"/>
<path d="M-40,-32 C-26,-38 -10,-38 4,-34" stroke="#FFE2A6" stroke-width="2.5" opacity=".8"/>
<path d="M22,-26 C36,-31 50,-30 62,-24" stroke="#FFE2A6" stroke-width="2.5" opacity=".8"/>
<path d="M-46,8 C-34,16 -18,18 -4,16" stroke="#C48434" stroke-width="2.5" opacity=".4"/>
<path d="M-118,12 C-122,24 -118,38 -110,44" stroke="#B9782E" stroke-width="2.5" opacity=".5"/>
</g>${tufo(110, 58, '#FFF0D2')}${tufo(76, 60, '#FFF0D2')}${tufo(24, 52, '#FFF0D2')}${tufo(-60, 54, '#F2C47A')}${tufo(-100, 52, '#F2C47A')}
</g></g>`;
  }
  function svgPeito(u) {
    return `<g class="ptM"><path class="ptC" d="M0,-62 C42,-62 66,-36 66,0 C66,38 44,64 0,66 C-44,64 -66,38 -66,0 C-66,-36 -42,-62 0,-62Z" fill="url(#${u}pelo)" stroke="${CO}" stroke-width="5" ${NSS}/>
<path d="M-38,-40 C-22,-50 22,-50 38,-40 C54,-10 52,26 32,52 L22,44 L14,60 L5,48 L-4,62 L-12,48 L-22,56 C-48,30 -54,-10 -38,-40Z" fill="url(#${u}peito)"/>
<g fill="none" stroke="#DDBA86" stroke-width="2.5" stroke-linecap="round" ${NSS}><path d="M-16,-18 C-12,-4 -14,8 -20,20"/><path d="M14,-16 C10,-2 12,10 18,22"/><path d="M0,-4 C2,8 0,20 -3,30"/></g></g>`;
  }
  function svgGarupa(u) {
    return `<g class="gaM"><path class="gaC" d="M0,-56 C42,-61 70,-30 68,6 C66,42 40,62 0,58 C-40,62 -66,42 -68,6 C-70,-30 -42,-61 0,-56Z" fill="url(#${u}pelo)" stroke="${CO}" stroke-width="5" ${NSS}/>
<path d="M0,8 C1,24 2,40 0,56" fill="none" stroke="${CO}" stroke-width="3" opacity=".4" ${NSS}/>
<path d="M-48,20 C-40,42 -22,52 -6,52" fill="none" stroke="#FFEACB" stroke-width="7" stroke-linecap="round" opacity=".7" ${NSS}/><path d="M48,20 C40,42 22,52 6,52" fill="none" stroke="#FFEACB" stroke-width="7" stroke-linecap="round" opacity=".7" ${NSS}/>
<path d="M-26,-44 C-10,-50 10,-50 26,-44" fill="none" stroke="#B9782E" stroke-width="8" stroke-linecap="round" opacity=".45" ${NSS}/>
<ellipse cx="-16" cy="-36" rx="30" ry="7" fill="#FFE4AA" opacity=".45"/></g>`;
  }
  // Pescoço coberto de juba (castanho), com madeixas soltas nos dois lados
  function svgPescoco(u) {
    let tufos = '';
    for (let i = 0; i < 5; i++) {
      const y = 4 + i * 22;
      tufos += `<path d="M-46,${y} C-60,${y + 8} -62,${y + 20} -54,${y + 30} C-52,${y + 22} -48,${y + 18} -42,${y + 18}Z" fill="#B8692C" stroke="${CO}" stroke-width="3" stroke-linejoin="round" ${NSS}/>`;
      tufos += `<path d="M46,${y + 10} C60,${y + 18} 62,${y + 30} 54,${y + 40} C52,${y + 32} 48,${y + 28} 42,${y + 28}Z" fill="#8E4A1E" stroke="${CO}" stroke-width="3" stroke-linejoin="round" ${NSS}/>`;
    }
    return `<g class="pcM">${tufos}<rect x="-48" y="-24" width="96" height="136" rx="44" fill="url(#${u}pescoco)" stroke="${CO}" stroke-width="5" ${NSS}/>
<g fill="none" stroke-linecap="round" ${NSS}><path d="M-24,4 C-30,30 -30,60 -22,92" stroke="#E39A4E" stroke-width="4" opacity=".6"/><path d="M-4,10 C-8,40 -6,70 0,100" stroke="#6E3414" stroke-width="3" opacity=".45"/><path d="M18,0 C14,30 16,60 22,90" stroke="#D08A46" stroke-width="3" opacity=".45"/></g></g>`;
  }

  /* ---------- Cabeça: elipsoides projetados, feições coladas à esfera do crânio e juba em dois anéis 3D ---------- */
  const dirE = (lam, el, r) => [r * Math.cos(el) * Math.cos(lam), r * Math.cos(el) * Math.sin(lam), r * Math.sin(el)];
  const ELIPS = ['foc', 'boc0', 'boc1', 'nar', 'queixo', 'int', 'lin'];
  // Anéis da juba: [prefixo, n.º de madeixas, centro para trás da cara (×R), raio (×R), peso da direção «para trás», atraso]
  const ANEIS = [['jN', NJN, -1.0, 0.72, 1.2, 0.3], ['jT', NJT, -0.5, 1.16, 0.95, 0.22], ['jF', NJF, -0.06, 0.95, 0.5, 0.1]];
  const MADEIXA = (W, L) => `M${n1(-W)},0 C${n1(-W)},${n1(L * 0.55)} ${n1(-W * 0.72)},${n1(L * 0.98)} ${n1(W * 0.1)},${n1(L)} C${n1(W * 0.78)},${n1(L * 0.95)} ${n1(W)},${n1(L * 0.5)} ${n1(W)},0 C${n1(W)},${n1(-W * 0.8)} ${n1(-W)},${n1(-W * 0.8)} ${n1(-W)},0Z`;
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
    const boca = clamp(p.boca, 0, 1.4), jaw = 0.05 + boca * 0.58;
    const H = [0.46, 0, -0.5];                            // dobradiça do maxilar
    const rp = (off, a) => { const c = Math.cos(a), s = Math.sin(a); return [H[0] + off[0] * c + off[2] * s, off[1], H[2] - off[0] * s + off[2] * c]; };
    elip('foc', [0.62, 0, -0.08], [0.5, 0.36, 0.28], 0.3);
    elip('boc0', [0.8, 0.27, -0.38], [0.4, 0.36, 0.31], 0);
    elip('boc1', [0.8, -0.27, -0.38], [0.4, 0.36, 0.31], 0);
    const nz = 1 + 0.08 * p.nariz;
    elip('nar', [1.1, 0, -0.12 + 0.012 * p.nariz], [0.16 * nz, 0.27 * nz, 0.15], 0.4);
    elip('queixo', rp([0.42, 0, -0.03], jaw), [0.44, 0.3, 0.14], jaw);
    elip('int', rp([0.42, 0, 0.06], jaw * 0.5), [0.44, 0.28, 0.05 + 0.22 * boca], jaw * 0.5);
    const lb = clamp(p.lambe, 0, 1), lg = clamp(p.lingua, 0, 1);
    const cL = rp([0.38 + 0.22 * lg, 0, 0.06], jaw), cLb = [1.0, 0, -0.62];
    elip('lin', [lerp(cL[0], cLb[0], lb), 0, lerp(cL[2], cLb[2], lb)], [lerp(0.28 + 0.2 * lg, 0.2, lb), 0.17, 0.06], lerp(jaw + 0.1 * lg, -1.0, lb));
    z.int -= 0.3 * R; z.lin += lb > 0.3 ? 0.3 * R : -0.2 * R; z.queixo -= 0.1 * R; z.nar += 0.35 * R; z.foc -= 0.04 * R;
    op.int = passo(0.04, 0.16, boca); op.lin = (boca > 0.12 || lb > 0.05) ? 1 : 0;
    // olhos (colados à esfera; o de lá encolhe e desaparece atrás do crânio)
    for (let i = 0; i < 2; i++) {
      const s = i ? -1 : 1;
      const q = pr(...dirE(0.5 * s, 0.27, 0.9 * R)), zn = q[2] / (0.9 * R), fs = zn > 0.03 ? Math.pow(zn, 0.55) : 0;
      t['olho' + i] = `translate(${n1(q[0])},${n1(q[1])}) scale(${n3(fs * p.esc)},${n3(p.esc)})`;
      z['olho' + i] = q[2] + 0.2 * R;
      t['iris' + i] = `translate(${n1(p.olhoX + s * p.vesgo * 4.5)},${n1(p.olhoY + p.vesgo * 1.5)})`;
      t['pup' + i] = `scale(${n3(1 + 0.35 * p.dilata)})`;
      t['psup' + i] = `translate(0,${n1(lerp(-28, 15, clamp(p.fecho, 0, 1)))})`;
      t['pinf' + i] = `translate(0,${n1(lerp(30, 5, clamp(p.feliz, 0, 1)))})`;
    }
    // juba: cada madeixa nasce num anel 3D à volta da cabeça e aponta para fora (e um pouco para trás); acompanha a cabeça
    // com atraso (lx, ly) e tem uma onda que dá a volta ao anel
    const J = p.juba, tras = pr(-1, 0, 0);
    for (const [pre, n, f0, rr, kb, kl] of ANEIS) {
      const c = pr(f0 * R, 0, 0);
      z[pre] = c[2] - 0.15 * R;
      for (let i = 0; i < n; i++) {
        const a = (i + (pre === 'jF' ? 0.5 : 0)) / n * TAU;
        const q = pr(f0 * R, rr * R * Math.cos(a), rr * R * Math.sin(a));
        let dx = (q[0] - c[0]) / (rr * R) + kb * tras[0], dy = (q[1] - c[1]) / (rr * R) + kb * tras[1];
        const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
        const cruz = dx * J.ly - dy * J.lx;
        const ang = Math.atan2(-dx, dy) * GRAU + J.amp * Math.sin(J.fase - a * 2 + (pre === 'jF' ? 0.8 : 0)) + clamp(cruz * 1.6, -40, 40) * (pre === 'jT' ? 1 : 0.7);
        const sl = (1 + J.fofo * 0.32) * (1 + 0.06 * Math.sin(J.fase * 0.8 + i * 1.7)), sw = 1 + J.fofo * 0.14;
        t[pre + i] = `translate(${n1(q[0] + J.lx * kl)},${n1(q[1] + J.ly * kl)}) rotate(${n1(ang)}) scale(${n3(sw)},${n3(sl)})`;
      }
    }
    // orelhas redondas: planas, com a base na esfera; deitam-se para trás
    const rotW = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), v[2]];
    const rotF = (v, a) => [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)];
    const rotL = (v, a) => [v[0] * Math.cos(a) - v[2] * Math.sin(a), v[1], v[0] * Math.sin(a) + v[2] * Math.cos(a)];
    for (let i = 0; i < 2; i++) {
      const s = i ? -1 : 1;
      const rho = p.orDin[i] * 0.012 - 0.1 * p.orelhas;
      const sig = 0.55 - 0.12 * p.orelhas + 0.35 * p.achatar + p.orDin[i] * 0.004;
      const bet = 0.05 - 0.14 * p.orelhas + 0.9 * p.achatar;
      const ori = v => rotL(rotF(rotW(v, s * rho), -s * sig), bet);
      const ax = ori([0, 0, 1]), wd = ori([0, 1, 0]), nm = ori([1, 0, 0]);
      const base = pr(...dirE(1.0 * s, 0.9, 0.86 * R)), c1 = pr(...wd), c2a = pr(...ax), c2 = [-c2a[0], -c2a[1]];
      let L2 = Math.hypot(c2[0], c2[1]);
      if (L2 < 0.5) { const k = 0.5 / Math.max(L2, 1e-3); c2[0] *= k; c2[1] *= k; L2 = 0.5; if (!(Math.abs(c2[0]) + Math.abs(c2[1]) > 0.01)) { c2[0] = 0; c2[1] = -0.5; } }
      const pu = [c2[1] / L2, -c2[0] / L2], pc = (c1[0] * c2[1] - c1[1] * c2[0]) / L2, alvo = (pc >= 0 ? 1 : -1) * Math.max(Math.abs(pc), 0.4);
      c1[0] += pu[0] * (alvo - pc); c1[1] += pu[1] * (alvo - pc);
      z['or' + i] = Math.max(z.jN, z.jT, z.jF) + 0.01 * R;
      t['or' + i] = `matrix(${n3(c1[0])},${n3(c1[1])},${n3(c2[0])},${n3(c2[1])},${n1(base[0])},${n1(base[1])})`;
      op['orF' + i] = passo(-0.1, 0.3, pr(...nm)[2]);
    }
    // ordem de desenho: juba e orelhas atrás do crânio (à frente dele só quando o leão está de costas)
    z.cranio = -0.12 * R;
    const ordem = ELIPS.concat(['jN', 'jT', 'jF', 'or0', 'or1', 'cranio', 'olho0', 'olho1']).filter(k => k !== 'int' && k !== 'lin').sort((a, b) => z[a] - z[b]);
    ordem.splice(ordem.indexOf('queixo') + 1, 0, 'int', 'lin');   // o interior da boca e a língua ficam por cima do maxilar e por baixo do focinho
    const nar = pr(1.18 * R, 0, -0.16 * R);
    return { t, op, z, ordem, nar };
  }

  function svgCabeca(u, E, icone) {
    const C = cores(u);
    const T = k => (E.t[k] ? ` transform="${E.t[k]}"` : '');
    const O = k => (E.op[k] !== undefined ? ` opacity="${n3(E.op[k])}"` : '');
    const it = {};
    // juba: contornos de todas as madeixas por baixo, depois o pelo (as madeixas do mesmo anel fundem-se numa só massa)
    const juba = (pre, n, W, L, cor, claro, escuro) => {
      let c = '', f = '';
      for (let i = 0; i < n; i++) {
        const w = W * (1 + 0.12 * Math.sin(i * 2.3)), l = L * (1 + 0.14 * Math.sin(i * 1.7 + 1));
        c += `<path class="m${i}" d="${MADEIXA(w + 3.4, l + 3.6)}"${T(pre + i)}/>`;
        f += `<g class="m${i}"${T(pre + i)}><path d="${MADEIXA(w, l)}" fill="${cor}"/><path d="M${n1(-w * 0.4)},${n1(l * 0.06)} C${n1(-w * 0.5)},${n1(l * 0.4)} ${n1(-w * 0.28)},${n1(l * 0.66)} ${n1(w * 0.04)},${n1(l * 0.86)}" fill="none" stroke="${claro}" stroke-width="2.6" stroke-linecap="round" opacity=".75"/><path d="M${n1(w * 0.42)},${n1(l * 0.1)} C${n1(w * 0.5)},${n1(l * 0.4)} ${n1(w * 0.36)},${n1(l * 0.62)} ${n1(w * 0.16)},${n1(l * 0.8)}" fill="none" stroke="${escuro}" stroke-width="2.2" stroke-linecap="round" opacity=".55"/></g>`;
      }
      return `<g class="hp hp-${pre}"><g fill="${CO}">${c}</g><g>${f}</g></g>`;
    };
    it.jN = juba('jN', NJN, 22, 52, '#94481C', '#C47C3C', '#5A260C');
    it.jT = juba('jT', NJT, 23, 58, '#A85A24', '#D48A44', '#6A3010');
    it.jF = juba('jF', NJF, 17, 40, '#CC7C36', '#F2B062', '#8A4618');
    const orelha = i => `<g class="hp hp-or${i}"${T('or' + i)}>
<path d="M-21,5 C-25,-14 -15,-31 0,-31 C15,-31 25,-14 21,5 C8,10 -8,10 -21,5Z" fill="${icone ? '#E2A452' : C.cabeca}" stroke="${CO}" stroke-width="3.4" stroke-linejoin="round" ${NSS}/>
<g class="orF"${O('orF' + i)}><path d="M-13,3 C-15,-9 -9,-21 0,-21 C9,-21 15,-9 13,3 C5,6 -5,6 -13,3Z" fill="#8A4E2C"/><path d="M-12,4 C-12,-2 -10,-6 -7,-8 C-6,-3 -3,-2 -1,-6 C0,-2 3,-1 5,-5 C7,-1 10,0 12,4 C4,7 -4,7 -12,4Z" fill="#FFF0D6" opacity=".9"/></g>
<path d="M-17,-6 C-14,-20 -6,-27 3,-28" fill="none" stroke="#FFE2A6" stroke-width="2.6" stroke-linecap="round" opacity=".6" ${NSS}/></g>`;
    it.or0 = orelha(0); it.or1 = orelha(1);
    it.cranio = `<g class="hp hp-cranio"><path d="M0,-${n1(R * 0.94)} C${n1(R * 0.64)},-${n1(R * 0.94)} ${n1(R * 1.04)},-${n1(R * 0.58)} ${n1(R * 1.04)},0 C${n1(R * 1.04)},${n1(R * 0.6)} ${n1(R * 0.62)},${n1(R * 0.98)} 0,${n1(R * 0.98)} C-${n1(R * 0.62)},${n1(R * 0.98)} -${n1(R * 1.04)},${n1(R * 0.6)} -${n1(R * 1.04)},0 C-${n1(R * 1.04)},-${n1(R * 0.58)} -${n1(R * 0.64)},-${n1(R * 0.94)} 0,-${n1(R * 0.94)}Z" fill="${C.cabeca}" stroke="${CO}" stroke-width="4.5" stroke-linejoin="round"/>
<ellipse cx="-20" cy="-32" rx="20" ry="10" fill="#FFEBBE" opacity=".5" transform="rotate(-24 -20 -32)"/>
<path d="M-8,-50 C-6,-44 -6,-38 -8,-32 M2,-52 C3,-46 3,-40 2,-34 M12,-50 C13,-45 13,-40 12,-35" fill="none" stroke="#C48434" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>
<path d="M-${n1(R * 0.98)},16 C-${n1(R * 1.12)},24 -${n1(R * 1.1)},36 -${n1(R * 0.96)},40 C-${n1(R * 1.06)},46 -${n1(R * 1.0)},56 -${n1(R * 0.84)},54" fill="#F6CE88" stroke="${CO}" stroke-width="3" stroke-linejoin="round"/>
<path d="M${n1(R * 0.98)},16 C${n1(R * 1.12)},24 ${n1(R * 1.1)},36 ${n1(R * 0.96)},40 C${n1(R * 1.06)},46 ${n1(R * 1.0)},56 ${n1(R * 0.84)},54" fill="#DDA45A" stroke="${CO}" stroke-width="3" stroke-linejoin="round"/></g>`;
    const elipse = (k, fill, stroke, sw, extra) => `<g class="hp hp-${k}"${T(k)}${O(k)}><circle r="1" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${NSS}/>${extra || ''}</g>`;
    it.foc = elipse('foc', C.focinho, 'none', 0, `<ellipse cx="-.3" cy="-.45" rx=".42" ry=".2" fill="#FFF4DA" opacity=".65"/>`);
    const bigodes = lado => `<g fill="#A0703E"><circle cx="${n1(lado * 0.35)}" cy=".05" r=".09"/><circle cx="${n1(lado * 0.1)}" cy=".22" r=".09"/><circle cx="${n1(lado * 0.4)}" cy=".38" r=".09"/><circle cx="${n1(lado * 0.58)}" cy=".15" r=".08"/></g>
<g fill="none" stroke="#8A5A32" stroke-width="1.4" stroke-linecap="round" opacity=".6"><path d="M${n1(lado * 0.6)},.05 C${n1(lado * 1.2)},-.2 ${n1(lado * 1.7)},-.25 ${n1(lado * 2.2)},-.15" ${NSS}/><path d="M${n1(lado * 0.62)},.25 C${n1(lado * 1.2)},.22 ${n1(lado * 1.7)},.3 ${n1(lado * 2.1)},.45" ${NSS}/></g>`;
    it.boc0 = elipse('boc0', C.creme, '#9A6A40', 2.4, `<ellipse cx="-.25" cy="-.45" rx=".4" ry=".2" fill="#fff" opacity=".8"/>${bigodes(-1)}`);
    it.boc1 = elipse('boc1', C.creme, '#9A6A40', 2.4, `<ellipse cx="-.25" cy="-.45" rx=".4" ry=".2" fill="#fff" opacity=".8"/>${bigodes(1)}`);
    it.nar = `<g class="hp hp-nar"${T('nar')}><path d="M-1,-.62 C-.6,-1 .6,-1 1,-.62 C1.05,-.15 .38,.62 0,.82 C-.38,.62 -1.05,-.15 -1,-.62Z" fill="${C.nariz}" stroke="#8A3A46" stroke-width="2.2" stroke-linejoin="round" ${NSS}/>
<path d="M0,.8 L0,1.7" stroke="#8A5A3A" stroke-width="2.2" stroke-linecap="round" ${NSS}/><ellipse cx="-.32" cy="-.5" rx=".36" ry=".17" fill="#fff" opacity=".8"/><path d="M-.62,-.08 C-.48,.08 -.3,.1 -.2,.02 M.62,-.08 C.48,.08 .3,.1 .2,.02" fill="none" stroke="#9A4452" stroke-width="2" stroke-linecap="round" ${NSS}/></g>`;
    it.queixo = elipse('queixo', C.creme, '#9A6A40', 2.4);
    it.int = elipse('int', C.bocaIn, '#3A0C10', 2.4);
    it.lin = elipse('lin', C.lingua, '#A8384F', 2.2, `<path d="M-.7,0 L.7,0" stroke="#C24763" stroke-width="2" ${NSS}/>`);
    const olho = i => {
      const di = i ? -1 : 1;              // lado de dentro do olho (para o focinho)
      const clip = icone ? '' : ` clip-path="url(#${u}olho)"`;
      const palp = icone ? '' : `<g class="psup"${T('psup' + i)}><path d="M-22,-62 L22,-62 L22,${-2 - 3 * di} C9,${5 - 2 * di} -9,${5 + 2 * di} -22,${-2 + 3 * di}Z" fill="${C.cabeca}"/><path d="M-16,${-1 + 2 * di} C-6,${5 + 2 * di} 6,${5 - 2 * di} 16,${-1 - 2 * di}" fill="none" stroke="#3A1A06" stroke-width="3.2" stroke-linecap="round"/></g>
<g class="pinf"${T('pinf' + i)}><path d="M-22,62 L22,62 L22,2 C10,-8 -10,-8 -22,2Z" fill="#FFF0D4"/><path d="M-15,-1 C-6,-6 6,-6 15,-1" fill="none" stroke="#C49A6A" stroke-width="2" opacity=".9"/></g>`;
      return `<g class="hp hp-olho${i}"${T('olho' + i)}>
<ellipse cx="${n1(di * 2)}" cy="9" rx="19" ry="16" fill="#FFF3DC" opacity=".85"/>
<path d="M-12,-21 C-5,-25 5,-25 12,-22" fill="none" stroke="#D08A3E" stroke-width="4" stroke-linecap="round" opacity=".6"/>
<g${clip}><ellipse rx="14" ry="15.5" fill="#FFFDF5"/>
<g class="iris"${T('iris' + i)}><circle r="11.6" fill="${C.iris}"/><circle r="11.6" fill="none" stroke="#7A3A08" stroke-width="1.4"/><g class="pup"${T('pup' + i)}><circle r="5.6" fill="#140904"/></g>
<circle cx="-4.2" cy="-5" r="4" fill="#fff"/><circle cx="4.4" cy="4.6" r="1.9" fill="#fff" opacity=".9"/></g>
<ellipse cy="-12" rx="15" ry="6" fill="#5A2A10" opacity=".18"/>
<ellipse rx="14" ry="15.5" fill="none" stroke="#3A1A06" stroke-width="${icone ? 3 : 4.4}"/>${palp}</g></g>`;
    };
    it.olho0 = olho(0); it.olho1 = olho(1);
    return E.ordem.map(k => it[k]).join('');
  }

  // Ordem inicial das peças (depois é reordenada em cada quadro pela profundidade)
  function svgLeao(u, E) {
    const pt = (nome, c) => `<g class="pt" data-p="${nome}">${c}</g>`;
    return `<g class="leao">${pt('sombra', `<ellipse class="sombra" rx="1" ry="1" fill="url(#${u}sombra)"/>`)}
${PERNAS.map((p, i) => pt('perna' + i, svgPerna(u, p.frente))).join('')}
${pt('cauda', svgCauda(u))}${pt('pescoco', svgPescoco(u))}${pt('tronco', svgTronco(u))}${pt('garupa', svgGarupa(u))}${pt('peito', svgPeito(u))}
${pt('cabeca', `<g class="cab">${svgCabeca(u, E, false)}</g>`)}${pt('sombraCav', `<path d="${BOCA_D}" fill="url(#${u}sombraCav)" pointer-events="none"/>`)}</g>`;
  }

  const JUBA0 = { lx: 0, ly: 0, fase: 0, amp: 3, fofo: 0 };
  const CAB0 = { phi: 0.95, nu: 0.04, boca: 0, lingua: 0, lambe: 0, feliz: 0, fecho: 0, esc: 1, dilata: 0, vesgo: 0, orelhas: 0, achatar: 0, orDin: [0, 0], olhoX: 0, olhoY: 0, nariz: 0, juba: JUBA0 };

  /* ---------- Ícone do menu (parado, sem gradientes com id): retrato da cabeça com a juba ---------- */
  function gerarIcone() {
    const E = estadoCabeca(Object.assign({}, CAB0, { phi: PI / 2 - 0.16, nu: 0.06, boca: 0.24, feliz: 0.25, esc: 1.1, orelhas: 0.3, olhoX: 1.2, olhoY: 1, juba: { lx: 0, ly: 0, fase: 1, amp: 0, fofo: 0.05 } }));
    let erva = '';
    for (let i = 0; i < 14; i++) { const x = 22 + i * 13.5, h = 18 + (i * 37) % 16; erva += `<path d="M${x},196 q${(i % 2 ? 3 : -3)},${-h * 0.6} ${(i % 2 ? 6 : -4)},${-h}" fill="none" stroke="${i % 3 ? '#C98A2E' : '#E8B24A'}" stroke-width="3" stroke-linecap="round"/>`; }
    return `<circle cx="110" cy="112" r="100" fill="#F8C878"/><circle cx="72" cy="70" r="40" fill="#FFEAB0" opacity=".8"/><circle cx="72" cy="70" r="22" fill="#FFF6D8"/>
<path d="M14,150 C40,140 60,146 80,142 C110,136 150,146 206,140 A100,100 0 0 1 14,150Z" fill="#D9A04A"/>
<path d="M150,128 C160,118 186,118 196,126" fill="none" stroke="#8A5A3A" stroke-width="3"/><path d="M172,124 L172,140" stroke="#8A5A3A" stroke-width="3"/>${erva}
<g transform="translate(110,112) scale(.64)">${svgCabeca('', E, true)}</g>`;
  }

  /* =====================================================================================
     4. Cenário — savana ao fim da tarde, kopje com a caverna, bichos dos acontecimentos
     ===================================================================================== */
  // Boca da caverna (o fundo da boca é a laje da frente), silhueta da rocha grande e laje da entrada
  const BOCA_D = 'M870,752 C864,680 884,596 940,556 C978,528 1046,528 1084,556 C1140,596 1160,680 1154,752 C1104,744 1056,740 1012,742 C966,740 918,744 870,752Z';
  const SILHUETA_D = 'M736,786 C722,700 738,606 786,536 C836,462 920,418 1012,414 C1112,410 1204,452 1254,522 C1300,592 1314,694 1300,786 C1206,806 830,806 736,786Z';
  const LABIO_D = 'M870,752 C918,744 966,740 1012,742 C1056,740 1104,744 1154,752 L1176,778 C1112,770 1060,766 1012,768 C962,766 912,770 848,778Z';
  const TOPO_D = 'M872,440 C860,390 880,330 940,308 C990,290 1060,292 1102,318 C1144,344 1150,400 1132,446 C1060,460 950,460 872,440Z';
  const TOCA_SUR = { x: 300, y: 790 };                     // toca da suricata (à esquerda, à frente)

  function defsCena(u) {
    return `<linearGradient id="${u}ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EE9A5C"/><stop offset=".3" stop-color="#F6BC76"/><stop offset=".55" stop-color="#FBD89C"/><stop offset=".62" stop-color="#FDE8BE"/></linearGradient>
<radialGradient id="${u}sol"><stop offset="0" stop-color="#FFFBE6"/><stop offset=".18" stop-color="#FFEBB0" stop-opacity=".85"/><stop offset=".5" stop-color="#FFD890" stop-opacity=".3"/><stop offset="1" stop-color="#FFD890" stop-opacity="0"/></radialGradient>
<linearGradient id="${u}montanha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9958C"/><stop offset="1" stop-color="#E8B898"/></linearGradient>
<linearGradient id="${u}nevoa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDE6BC" stop-opacity="0"/><stop offset=".6" stop-color="#FDE6BC" stop-opacity=".7"/><stop offset="1" stop-color="#FDE6BC" stop-opacity=".2"/></linearGradient>
<linearGradient id="${u}campo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9BE68"/><stop offset=".35" stop-color="#E0AA4C"/><stop offset="1" stop-color="#C08534"/></linearGradient>
<radialGradient id="${u}areia" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#F3D8A2"/><stop offset=".7" stop-color="#E8C48A"/><stop offset="1" stop-color="#E8C48A" stop-opacity="0"/></radialGradient>
<linearGradient id="${u}rocha" x1="0" y1="0" x2="1" y2=".3"><stop offset="0" stop-color="#F2D6AA"/><stop offset=".35" stop-color="#D2AA80"/><stop offset=".75" stop-color="#9C765A"/><stop offset="1" stop-color="#6E4E3C"/></linearGradient>
<linearGradient id="${u}rocha2" x1="0" y1="0" x2="1" y2=".3"><stop offset="0" stop-color="#D8B48A"/><stop offset=".5" stop-color="#AE8664"/><stop offset="1" stop-color="#76563E"/></linearGradient>
<radialGradient id="${u}interior" cx=".5" cy=".9" r=".9"><stop offset="0" stop-color="#6A4630"/><stop offset=".45" stop-color="#36221A"/><stop offset="1" stop-color="#160C08"/></radialGradient>
<linearGradient id="${u}sombraCav" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#160A04" stop-opacity=".65"/><stop offset=".35" stop-color="#160A04" stop-opacity=".22"/><stop offset=".65" stop-color="#160A04" stop-opacity="0"/></linearGradient>
<linearGradient id="${u}sombraRocha" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5A3418" stop-opacity=".42"/><stop offset="1" stop-color="#5A3418" stop-opacity="0"/></linearGradient>
<linearGradient id="${u}tronco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8E6A4E"/><stop offset=".5" stop-color="#6A4A34"/><stop offset="1" stop-color="#4A3222"/></linearGradient>
<radialGradient id="${u}copa" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#B2B260"/><stop offset=".6" stop-color="#7E8A3E"/><stop offset="1" stop-color="#5A6A2C"/></radialGradient>
<linearGradient id="${u}termiteira" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#DDA46A"/><stop offset=".5" stop-color="#B87C4A"/><stop offset="1" stop-color="#875432"/></linearGradient>
<radialGradient id="${u}somb"><stop offset="0" stop-color="#4A2A0C" stop-opacity=".45"/><stop offset="1" stop-color="#4A2A0C" stop-opacity="0"/></radialGradient>
<radialGradient id="${u}poeira"><stop offset="0" stop-color="#EED5A6" stop-opacity=".95"/><stop offset="1" stop-color="#EED5A6" stop-opacity="0"/></radialGradient>
<radialGradient id="${u}cisco"><stop offset="0" stop-color="#FFFBE0" stop-opacity="1"/><stop offset="1" stop-color="#FFE8A0" stop-opacity="0"/></radialGradient>
<clipPath id="${u}bocaIn"><path d="${BOCA_D}"/></clipPath>
<clipPath id="${u}rochaIn"><path d="${SILHUETA_D}"/></clipPath>
<clipPath id="${u}tocaSur"><path d="M180,520 H420 V${TOCA_SUR.y} H${TOCA_SUR.x + 27} A27,9 0 0 1 ${TOCA_SUR.x - 27},${TOCA_SUR.y} H180Z"/></clipPath>
<clipPath id="${u}recorte"><path clip-rule="evenodd" d="M-400,-400H2000V1300H-400Z ${SILHUETA_D} ${BOCA_D}"/></clipPath>`;
  }

  // ---- peças do cenário ----
  function acacia(x, base, e, cor, op, classe, meta) {   // acácia de copa chata (silhueta ao longe ou árvore com volume)
    const s = (dx, dy) => `${n1(x + dx * e)},${n1(base + dy * e)}`;
    let r = `<g opacity="${op}"><path d="M${s(-4, 0)} C${s(-3, -40)} ${s(-10, -80)} ${s(-34, -112)} L${s(-28, -116)} C${s(-6, -90)} ${s(0, -70)} ${s(2, -60)} C${s(8, -84)} ${s(26, -104)} ${s(44, -116)} L${s(48, -110)} C${s(26, -94)} ${s(10, -70)} ${s(6, -40)} L${s(6, 0)}Z" fill="${cor}"/>`;
    r += `<g class="${classe}" data-x="${x}" data-y="${n1(base - 112 * e)}"><path d="M${s(-96, -112)} C${s(-90, -134)} ${s(-50, -142)} ${s(-10, -138)} C${s(30, -146)} ${s(80, -140)} ${s(104, -120)} C${s(80, -108)} ${s(30, -112)} ${s(0, -110)} C${s(-40, -106)} ${s(-80, -104)} ${s(-96, -112)}Z" fill="${cor}"/></g></g>`;
    if (meta) meta.copas.push({ x, y: base - 112 * e, f: rnd(0, 6) });
    return r;
  }
  function nuvem(x, y, e) {
    return `<g class="cn-nuvem" transform="translate(${x},${y}) scale(${e})"><ellipse cx="0" cy="0" rx="150" ry="13" fill="#FFE6C4" opacity=".7"/><ellipse cx="-40" cy="-9" rx="80" ry="11" fill="#FFF2DC" opacity=".75"/><ellipse cx="60" cy="8" rx="90" ry="8" fill="#F4B485" opacity=".45"/></g>`;
  }

  function cenaFundo(u, rng, meta) {
    let s = `<rect width="1600" height="900" fill="url(#${u}ceu)"/>`;
    // sol baixo à esquerda e raios que rodam devagar (luz de cima à esquerda)
    s += `<circle cx="300" cy="360" r="420" fill="url(#${u}sol)"/><g class="cn-raios" opacity=".16">`;
    for (let i = 0; i < 12; i++) { const a = i * 30; s += `<path d="M300,360 L${n1(300 + 520 * Math.cos((a - 3) / GRAU))},${n1(360 + 520 * Math.sin((a - 3) / GRAU))} L${n1(300 + 520 * Math.cos((a + 3) / GRAU))},${n1(360 + 520 * Math.sin((a + 3) / GRAU))}Z" fill="#FFF3C0"/>`; }
    s += `</g><circle cx="300" cy="360" r="66" fill="#FFF0C4" opacity=".75"/><circle class="cn-sol" cx="300" cy="360" r="52" fill="#FFF8E0"/>`;
    // nuvens finas cor-de-rosa
    for (const [x, y, e, v] of [[620, 150, 1, 5], [1180, 110, 1.2, 7], [1460, 230, 0.8, 4], [140, 200, 0.9, 6]]) { s += nuvem(x, y, e); meta.nuvens.push({ x, y, e, v }); }
    // aves ao longe (planam devagar)
    for (let i = 0; i < 3; i++) { s += `<path class="cn-ave" d="M-14,0 Q-7,-7 0,0 Q7,-7 14,0" fill="none" stroke="#6A4434" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(-100,-100)"/>`; meta.aves.push({ x: 200 + i * 520, y: 190 + i * 30, f: i * 1.7, v: 14 + i * 5 }); }
    // montanha enevoada com neve no cimo
    s += `<path d="M380,530 C470,500 560,450 640,412 C668,398 690,392 712,394 C736,392 756,398 782,412 C860,452 960,500 1060,530Z" fill="url(#${u}montanha)" opacity=".75"/>`;
    s += `<path d="M640,412 C668,398 690,392 712,394 C736,392 756,398 782,412 C768,420 756,414 744,424 C732,416 720,426 706,418 C694,428 682,418 668,426 C660,418 650,420 640,412Z" fill="#FFF4EA" opacity=".85"/>`;
    s += `<rect x="0" y="440" width="1600" height="110" fill="url(#${u}nevoa)"/>`;
    // colinas ao longe (dois planos) e acácias pequenas no horizonte
    s += `<path d="M-20,540 C120,512 260,520 400,508 C560,496 700,520 860,512 C1020,504 1180,486 1340,500 C1460,510 1540,500 1620,506 L1620,560 L-20,560Z" fill="#DCA67C" opacity=".8"/>`;
    s += `<path d="M-20,552 C160,536 320,544 520,532 C720,522 900,540 1100,530 C1300,522 1460,536 1620,528 L1620,570 L-20,570Z" fill="#D29A68"/>`;
    for (const [x, b, e] of [[150, 540, 0.42], [430, 534, 0.32], [880, 530, 0.36], [1250, 524, 0.3], [1530, 530, 0.4]]) s += acacia(x, b, e, '#9A6A4E', 0.75, 'cn-acL', null);
    s += `<g class="ev-gazelas" pointer-events="none">${svgGazelas()}</g>`;
    // campo de erva da savana (plano médio)
    s += `<path d="M-20,560 C200,548 420,556 640,550 C880,544 1120,556 1360,548 C1460,546 1540,550 1620,548 L1620,920 L-20,920Z" fill="url(#${u}campo)"/>`;
    let d1 = '', d2 = '', d3 = '';
    for (let i = 0; i < 300; i++) {
      const y = 556 + Math.pow(rng(), 1.4) * 170, x = rng() * 1640 - 20, h = 6 + (y - 550) * 0.12 + rng() * 6, k = rng();
      const p = `M${n1(x)},${n1(y)}q${n1(rng() * 4 - 2)},${n1(-h * 0.6)} ${n1(rng() * 8 - 4)},${n1(-h)}`;
      if (k < 0.4) d1 += p; else if (k < 0.75) d2 += p; else d3 += p;
    }
    s += `<path d="${d1}" fill="none" stroke="#C08530" stroke-width="2" stroke-linecap="round" opacity=".7"/><path d="${d2}" fill="none" stroke="#F6D888" stroke-width="2" stroke-linecap="round" opacity=".8"/><path d="${d3}" fill="none" stroke="#A9702A" stroke-width="2" stroke-linecap="round" opacity=".55"/>`;
    // arbustos redondos
    for (const [x, y, r] of [[640, 582, 26], [700, 590, 18], [1420, 584, 24], [120, 600, 30]]) s += `<ellipse cx="${x}" cy="${y + r * 0.7}" rx="${r * 1.3}" ry="${r * 0.25}" fill="#8A5A2A" opacity=".3"/><path d="${fofo(x, y, r * 1.2, r * 0.75, 9, 0.18, 0.3, 0.1)}" fill="#8C8A3E" stroke="#5E5A28" stroke-width="2"/><ellipse cx="${x - r * 0.35}" cy="${y - r * 0.3}" rx="${r * 0.5}" ry="${r * 0.25}" fill="#B9B464" opacity=".6"/>`;
    // acácia grande à esquerda (com ninhos de tecelão pendurados) e outra à direita
    s += acaciaGrande(u, 222, 612, 1, meta) + acaciaGrande(u, 1478, 580, 0.55, meta);
    return s;
  }
  function acaciaGrande(u, x, base, e, meta) {
    const s = (dx, dy) => `${n1(x + dx * e)},${n1(base + dy * e)}`;
    let r = `<ellipse cx="${n1(x + 30 * e)}" cy="${n1(base + 4 * e)}" rx="${n1(120 * e)}" ry="${n1(12 * e)}" fill="#6A4418" opacity=".25"/>`;
    r += `<path d="M${s(-12, 0)} C${s(-8, -80)} ${s(-24, -160)} ${s(-80, -238)} L${s(-66, -246)} C${s(-26, -196)} ${s(-6, -160)} ${s(0, -130)} C${s(10, -176)} ${s(46, -226)} ${s(96, -252)} L${s(104, -240)} C${s(56, -210)} ${s(24, -160)} ${s(16, -90)} L${s(16, 0)}Z" fill="url(#${u}tronco)" stroke="#3E2A1C" stroke-width="${n1(3 * e)}" stroke-linejoin="round"/>`;
    r += `<path d="M${s(-6, -10)} C${s(-4, -70)} ${s(-12, -130)} ${s(-50, -200)}" fill="none" stroke="#B49274" stroke-width="${n1(3 * e)}" opacity=".5"/>`;
    const camada = (dy, w, h, cor, sw) => `<path d="M${s(-w, dy)} C${s(-w + 10, dy - h)} ${s(-w * 0.4, dy - h * 1.3)} ${s(0, dy - h * 1.2)} C${s(w * 0.4, dy - h * 1.35)} ${s(w - 10, dy - h)} ${s(w, dy)} C${s(w * 0.6, dy + h * 0.45)} ${s(-w * 0.6, dy + h * 0.45)} ${s(-w, dy)}Z" fill="${cor}" stroke="#4A5222" stroke-width="${n1(sw * e)}" stroke-linejoin="round"/>`;
    r += `<g class="cn-copa" data-x="${x}" data-y="${n1(base - 240 * e)}">` + camada(-238, 200, 30, `url(#${u}copa)`, 3) + camada(-270, 150, 26, `url(#${u}copa)`, 3) + camada(-296, 90, 18, '#9EA452', 2.5);
    r += `<path d="M${s(-150, -258)} C${s(-110, -280)} ${s(-60, -286)} ${s(-20, -282)}" fill="none" stroke="#C9C47A" stroke-width="${n1(5 * e)}" stroke-linecap="round" opacity=".7"/>`;
    if (e > 0.8) for (const [nx, ny, ph] of [[-120, -226, 0], [-40, -222, 2], [60, -228, 4]]) {
      r += `<g class="cn-ninho" data-x="${n1(x + nx * e)}" data-y="${n1(base + ny * e)}" data-f="${ph}"><path d="M${s(nx, ny)} l0,14" stroke="#5A4A22" stroke-width="2"/><path d="${fofo(x + nx * e, base + (ny + 30) * e, 13, 17, 8, 0.2, 0, 0.3)}" fill="#C2A462" stroke="#6A5428" stroke-width="2"/><ellipse cx="${n1(x + nx * e)}" cy="${n1(base + (ny + 42) * e)}" rx="5" ry="4" fill="#4A3418"/><path d="M${n1(x + nx * e - 8)},${n1(base + (ny + 22) * e)} q8,6 16,0" fill="none" stroke="#E6CF8E" stroke-width="2" opacity=".7"/></g>`;
    }
    r += '</g>';
    meta.copas.push({ x, y: base - 240 * e, f: rnd(0, 6) });
    return r;
  }

  function cenaChao(u, rng, meta) {
    // terra batida onde o leão descansa e caminho até à caverna
    let s = `<ellipse cx="760" cy="790" rx="620" ry="96" fill="url(#${u}areia)"/>`;
    // tufos de erva alta (parados; um só path por cor)
    let a = '', b = '', c = '';
    const tufo = (x, y, h, n) => { let r1 = '', r2 = ''; for (let k = 0; k < n; k++) { const dx = (k - n / 2) * 4, hh = h * (0.6 + rng() * 0.5), cv = (rng() - 0.5) * 18; const p = `M${n1(x + dx)},${n1(y)}q${n1(cv * 0.3)},${n1(-hh * 0.55)} ${n1(cv)},${n1(-hh)}`; if (k % 2) r1 += p; else r2 += p; } return [r1, r2]; };
    for (let i = 0; i < 26; i++) {
      const x = rng() * 1620 - 10, y = 640 + rng() * 60;
      if (x > 360 && x < 1330 && y > 655) continue;   // não tapar a zona do leão nem da caverna
      const [r1, r2] = tufo(x, y, 34 + rng() * 26, 7); a += r1; b += r2;
    }
    for (let i = 0; i < 70; i++) { const x = 300 + rng() * 1050, y = 700 + rng() * 100, h = 5 + rng() * 6; c += `M${n1(x)},${n1(y)}q${n1(rng() * 3 - 1.5)},${n1(-h * 0.6)} ${n1(rng() * 5 - 2.5)},${n1(-h)}`; }
    s += `<path d="${a}" fill="none" stroke="#C58A32" stroke-width="3" stroke-linecap="round"/><path d="${b}" fill="none" stroke="#F2CC72" stroke-width="3" stroke-linecap="round"/><path d="${c}" fill="none" stroke="#C99A58" stroke-width="2" stroke-linecap="round" opacity=".6"/>`;
    // pedrinhas soltas
    for (let i = 0; i < 10; i++) { const x = 340 + rng() * 980, y = 742 + rng() * 70, r = 3 + rng() * 5; s += `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(r * 1.4)}" ry="${n1(r)}" fill="${rng() < 0.5 ? '#C2A07A' : '#D8BC94'}" stroke="#8A6A4A" stroke-width="1.4"/>`; }
    // termiteira à direita (fora da zona do leão)
    s += `<ellipse cx="1478" cy="718" rx="70" ry="10" fill="#6A4418" opacity=".25"/><path d="M1420,718 C1424,680 1436,640 1446,600 C1452,570 1462,548 1468,520 C1472,540 1476,556 1484,566 C1488,544 1494,530 1500,516 C1504,548 1508,590 1518,630 C1526,664 1534,694 1540,718Z" fill="url(#${u}termiteira)" stroke="#6A3E22" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<g fill="#6A3E22" opacity=".55"><ellipse cx="1462" cy="640" rx="5" ry="7"/><ellipse cx="1500" cy="676" rx="6" ry="8"/><ellipse cx="1484" cy="596" rx="4" ry="5"/></g><path d="M1446,700 C1450,650 1458,600 1468,540" fill="none" stroke="#F0C08A" stroke-width="4" stroke-linecap="round" opacity=".5"/>`;
    // toca da suricata (montículo de terra com o buraco)
    const { x, y } = TOCA_SUR;
    s += `<ellipse cx="${x + 10}" cy="${y + 10}" rx="70" ry="12" fill="#6A4418" opacity=".22"/><path d="M${x - 62},${y + 8} C${x - 50},${y - 14} ${x - 20},${y - 20} ${x},${y - 20} C${x + 24},${y - 20} ${x + 54},${y - 12} ${x + 66},${y + 8} C${x + 30},${y + 16} ${x - 30},${y + 16} ${x - 62},${y + 8}Z" fill="#D6A86E" stroke="#8A5E36" stroke-width="2.5"/>`;
    s += `<ellipse cx="${x}" cy="${y}" rx="27" ry="9" fill="#3A2214"/><path d="M${x - 27},${y} A27,9 0 0 0 ${x + 27},${y}" fill="none" stroke="#F2CE96" stroke-width="2.5" opacity=".7"/>`;
    return s;
  }

  // Kopje: rochas de granito com a caverna (habitat). Luz da esquerda: lado esquerdo claro, direito escuro
  function cenaKopje(u, rng, meta) {
    let s = `<rect x="800" y="400" width="440" height="400" fill="#000" fill-opacity="0"/>`;   // zona de toque da caverna
    // sombra projetada para a direita e rocha de trás
    s += `<path d="M1260,790 C1380,792 1500,786 1560,770 C1520,750 1420,742 1290,746Z" fill="url(#${u}sombraRocha)"/>`;
    s += `<path d="M1180,790 C1170,720 1180,640 1222,594 C1262,552 1336,548 1378,590 C1420,636 1428,720 1414,790Z" fill="url(#${u}rocha2)" stroke="#5A3A28" stroke-width="3.5"/>`;
    s += `<path d="M1236,600 C1260,574 1320,566 1356,590" fill="none" stroke="#F2D6AA" stroke-width="4" stroke-linecap="round" opacity=".5"/>`;
    // pedra de cima (equilibrada) com erva seca e o lagarto
    s += `<ellipse cx="1010" cy="444" rx="140" ry="16" fill="#3A2214" opacity=".3"/>`;
    s += `<path d="${TOPO_D}" fill="url(#${u}rocha)" stroke="#5A3A28" stroke-width="3.5" stroke-linejoin="round"/>`;
    s += `<path d="M900,360 C920,326 960,308 1010,304" fill="none" stroke="#FFF0D0" stroke-width="5" stroke-linecap="round" opacity=".55"/><path d="M1060,330 C1090,350 1100,380 1096,420" fill="none" stroke="#6E4E3C" stroke-width="3" stroke-linecap="round" opacity=".5"/>`;
    s += `<g class="cn-ervaT" data-x="1120" data-y="330"><path d="M1108,332 q-4,-20 -12,-30 M1114,330 q0,-24 4,-36 M1120,331 q6,-18 16,-26 M1126,334 q10,-12 20,-14" fill="none" stroke="#C99640" stroke-width="3" stroke-linecap="round"/></g>`;
    meta.ervasT.push({ x: 1120, y: 332, f: 1 });
    // rocha grande com a caverna
    s += `<path d="${SILHUETA_D}" fill="url(#${u}rocha)" stroke="#5A3A28" stroke-width="4" stroke-linejoin="round"/><g clip-path="url(#${u}rochaIn)">`;
    s += `<path d="M760,560 C800,488 880,440 980,428 C900,456 840,500 800,580 C780,620 770,680 768,740 C752,680 748,610 760,560Z" fill="#FFF0D0" opacity=".38"/>`;
    s += `<path d="M1300,520 C1260,470 1200,436 1130,424 C1200,460 1240,520 1250,600 C1258,680 1250,740 1240,790 L1320,790Z" fill="#4A3020" opacity=".3"/>`;
    s += `<path d="M736,700 C860,690 960,700 1012,700 C1080,700 1180,694 1300,700 L1300,800 L736,800Z" fill="#4A3020" opacity=".12"/>`;
    // fendas e manchas de líquen
    for (const d of ['M1180,470 C1196,520 1192,560 1210,610', 'M830,520 C850,540 852,580 842,620', 'M1230,640 C1214,680 1222,720 1208,770', 'M960,440 C964,470 956,490 962,520']) s += `<path d="${d}" fill="none" stroke="#5A3A28" stroke-width="3" stroke-linecap="round" opacity=".55"/><path d="${d}" fill="none" stroke="#FFF0D0" stroke-width="2" stroke-linecap="round" opacity=".4" transform="translate(-3,1)"/>`;
    let lq1 = '', lq2 = '';
    for (let i = 0; i < 26; i++) { const x = 760 + rng() * 520, y = 450 + rng() * 300; if (x > 860 && x < 1170 && y > 520) continue; const r = 3 + rng() * 6; const p = `M${n1(x - r)},${n1(y)}a${n1(r)},${n1(r * 0.7)} 0 1 0 ${n1(2 * r)},0a${n1(r)},${n1(r * 0.7)} 0 1 0 ${n1(-2 * r)},0`; if (rng() < 0.55) lq1 += p; else lq2 += p; }
    s += `<path d="${lq1}" fill="#E8A040" opacity=".55"/><path d="${lq2}" fill="#B8B870" opacity=".5"/></g>`;
    // boca da caverna: interior escuro, parede do fundo, cama de erva seca
    s += `<path d="${BOCA_D}" fill="url(#${u}interior)"/><g clip-path="url(#${u}bocaIn)">`;
    for (let i = 0; i < 7; i++) { const x = 900 + i * 36 + rng() * 10; s += `<path d="M${n1(x)},540 C${n1(x - 8 + rng() * 16)},${n1(580 + rng() * 20)} ${n1(x - 10 + rng() * 20)},${n1(620 + rng() * 30)} ${n1(x - 4 + rng() * 8)},${n1(650 + rng() * 30)}" fill="none" stroke="#5E3E2A" stroke-width="${n1(2 + rng() * 2)}" stroke-linecap="round" opacity=".7"/>`; }
    s += `<path d="M880,752 C900,712 960,700 1012,700 C1064,700 1120,712 1144,752Z" fill="#7A5430" opacity=".85"/>`;
    let pa = '';
    for (let i = 0; i < 46; i++) { const x = 890 + rng() * 240, y = 708 + rng() * 40, L = 10 + rng() * 14, an = (rng() - 0.5) * 0.8; pa += `M${n1(x)},${n1(y)}l${n1(L * Math.cos(an))},${n1(L * Math.sin(an))}`; }
    s += `<path d="${pa}" fill="none" stroke="#D8B060" stroke-width="2.2" stroke-linecap="round" opacity=".75"/>`;
    s += `<path d="${BOCA_D}" fill="none" stroke="#0E0603" stroke-width="18" opacity=".55"/></g>`;
    s += `<path d="${BOCA_D}" fill="none" stroke="#4A2C1A" stroke-width="4" stroke-linejoin="round"/>`;
    s += `<path d="M884,690 C882,640 902,590 944,562 C976,542 1040,540 1070,556" fill="none" stroke="#FFF0D0" stroke-width="4" stroke-linecap="round" opacity=".5"/>`;
    // laje da frente (degrau da caverna)
    s += `<path d="${LABIO_D}" fill="url(#${u}rocha2)" stroke="#5A3A28" stroke-width="3.5" stroke-linejoin="round"/><path d="M880,752 C930,744 970,742 1012,744 C1060,742 1110,746 1150,754" fill="none" stroke="#FFF0D0" stroke-width="3" stroke-linecap="round" opacity=".55"/>`;
    // pedras pequenas à volta da base
    for (const [x, y, rx, ry] of [[760, 776, 34, 22], [1288, 782, 40, 24], [1220, 792, 22, 13], [812, 794, 20, 11]]) s += `<ellipse cx="${x + 6}" cy="${y + ry * 0.7}" rx="${rx}" ry="${ry * 0.35}" fill="#3A2214" opacity=".25"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${u}rocha2)" stroke="#5A3A28" stroke-width="3"/><ellipse cx="${x - rx * 0.35}" cy="${y - ry * 0.4}" rx="${rx * 0.4}" ry="${ry * 0.2}" fill="#FFF0D0" opacity=".45"/>`;
    // tufos de erva aos cantos da entrada (abanam quando o leão chega)
    for (const [x, y] of [[858, 772], [1170, 776], [1312, 790], [742, 790]]) { s += `<g class="cn-ervaC" data-x="${x}" data-y="${y}"><path d="M${x - 12},${y} q-6,-22 -16,-34 M${x - 6},${y} q-2,-30 2,-44 M${x},${y} q4,-26 14,-38 M${x + 6},${y} q10,-16 22,-22" fill="none" stroke="#B9822E" stroke-width="3.2" stroke-linecap="round"/><path d="M${x - 9},${y} q-4,-18 -6,-30 M${x + 3},${y} q6,-22 6,-34" fill="none" stroke="#F2CC72" stroke-width="2.8" stroke-linecap="round"/></g>`; meta.ervasC.push({ x, y, f: rnd(0, 6) }); }
    return s;
  }

  // Bichos dos acontecimentos e da vida da savana
  function svgGazelas() {
    let s = '';
    for (let i = 0; i < 5; i++) {
      s += `<g class="gz" transform="translate(-300,-300)"><g class="gzC"><g class="gzP" stroke="#6A4022" stroke-width="2.2" stroke-linecap="round"><path d="M-9,2 L-12,13 M-6,2 L-4,13 M8,2 L6,13 M11,2 L14,13"/></g>
<path d="M-14,-4 C-14,-10 -4,-12 6,-11 C12,-11 16,-8 16,-3 C16,2 10,4 0,4 C-8,4 -14,2 -14,-4Z" fill="#C98A4A" stroke="#6A4022" stroke-width="1.5"/><path d="M-12,0 C-4,2 6,2 14,-1" fill="none" stroke="#3A2416" stroke-width="2"/><path d="M-11,2 C-2,4 8,4 13,1" fill="none" stroke="#FFF6E8" stroke-width="2"/>
<path d="M13,-8 L19,-17 L24,-15 L18,-6Z" fill="#C98A4A" stroke="#6A4022" stroke-width="1.4"/><path d="M19,-17 C18,-24 19,-28 21,-30 M21,-16 C21,-23 23,-27 25,-28" fill="none" stroke="#3A2416" stroke-width="1.5"/><path d="M-14,-5 L-18,-1" stroke="#3A2416" stroke-width="2.2" stroke-linecap="round"/></g></g>`;
    }
    return s;
  }
  function svgSuricata(u) {
    return `<g clip-path="url(#${u}tocaSur)"><g class="ev-sur" pointer-events="none" transform="translate(${TOCA_SUR.x},${TOCA_SUR.y + 120})"><g class="sr-c">
<path d="M10,-6 C22,-4 30,4 34,14" fill="none" stroke="#7A5434" stroke-width="5" stroke-linecap="round"/>
<path d="M-15,8 C-19,-24 -15,-52 -8,-66 C-2,-74 8,-74 13,-66 C19,-52 21,-24 17,8Z" fill="#CDA67A" stroke="#6A4628" stroke-width="2.5"/>
<path d="M-7,6 C-9,-20 -6,-46 0,-60 C6,-46 9,-20 7,6Z" fill="#EFD9B4"/>
<g stroke="#8A6040" stroke-width="2" stroke-linecap="round" opacity=".6"><path d="M-14,-34 L-10,-32 M-15,-24 L-11,-22 M-15,-14 L-11,-12 M16,-34 L12,-32 M17,-24 L13,-22"/></g>
<path d="M-11,-48 C-15,-42 -14,-36 -8,-34 M11,-48 C15,-42 14,-36 8,-34" fill="none" stroke="#B48A5E" stroke-width="5" stroke-linecap="round"/>
<g class="sr-cab"><path d="M-12,-74 C-14,-90 -6,-100 2,-100 C10,-100 16,-92 14,-80 C13,-74 8,-68 3,-66 C-4,-66 -10,-68 -12,-74Z" fill="#D2AC80" stroke="#6A4628" stroke-width="2.5"/>
<circle cx="-12" cy="-88" r="4" fill="#3A2416"/><circle cx="13" cy="-88" r="4" fill="#3A2416"/>
<ellipse cx="-4" cy="-86" rx="4.5" ry="3.6" fill="#2A160C"/><ellipse cx="8" cy="-86" rx="4.5" ry="3.6" fill="#2A160C"/><circle cx="-3" cy="-87" r="1.4" fill="#fff"/><circle cx="9" cy="-87" r="1.4" fill="#fff"/>
<path d="M0,-75 C1,-71 4,-71 5,-75Z" fill="#2A160C"/><path d="M-1,-70 C1,-68 4,-68 6,-70" fill="none" stroke="#6A4628" stroke-width="1.5" stroke-linecap="round"/></g></g></g></g>`;
  }
  function svgBorboleta() {
    const asa = c => `<path d="M0,0 C8,-26 34,-30 30,-8 C28,2 14,4 0,0Z" fill="${c}" stroke="#7A4A0A" stroke-width="2"/><path d="M0,0 C10,6 24,10 18,22 C10,28 2,14 0,0Z" fill="${c}" stroke="#7A4A0A" stroke-width="2"/><circle cx="20" cy="-14" r="4.5" fill="#F29A2A"/><circle cx="12" cy="12" r="3" fill="#F29A2A"/>`;
    return `<g class="ev-borb" pointer-events="none" transform="translate(-300,-300)"><g class="bb-d">${asa('#FFF2A0')}</g><g class="bb-e" transform="scale(-1,1)">${asa('#FFEA88')}</g><ellipse rx="3.4" ry="13" fill="#4A2810"/><path d="M-1,-12 C-4,-21 -8,-23 -10,-25 M1,-12 C4,-21 8,-23 10,-25" stroke="#4A2810" stroke-width="1.6" fill="none"/></g>`;
  }
  // Lagarto agama (cabeça cor de laranja, corpo azul) na pedra de cima: faz «flexões» com a cabeça
  function svgAgama() {
    return `<g class="cn-agama" pointer-events="none" transform="translate(1040,306)"><g class="ag-c">
<path d="M-14,-2 C-30,0 -46,4 -60,12" fill="none" stroke="#3A5AA8" stroke-width="5" stroke-linecap="round"/><path d="M-30,0 C-40,2 -50,6 -60,12" fill="none" stroke="#E2B04A" stroke-width="2" stroke-linecap="round" opacity=".7"/>
<path d="M-8,0 L-12,8 M6,0 L10,8" stroke="#2A3A70" stroke-width="3" stroke-linecap="round"/>
<path d="M-18,-4 C-16,-10 6,-11 12,-6 C14,-2 10,2 -2,2 C-12,2 -18,1 -18,-4Z" fill="#4A6CC0" stroke="#22305E" stroke-width="2"/>
<g class="ag-cab"><path d="M8,-8 C14,-14 26,-13 28,-7 C28,-3 20,-1 10,-2Z" fill="#F07A2A" stroke="#8A3A10" stroke-width="2"/><circle cx="20" cy="-9" r="1.8" fill="#1A0A04"/></g></g></g>`;
  }
  // primeiro plano: tufos de erva alta que abanam (cantos de baixo, fora da zona do leão)
  function svgPrimeiroPlano(rng, meta) {
    let s = '';
    for (const [x, y, e] of [[40, 900, 1.3], [130, 905, 1.1], [220, 910, 0.9], [1380, 910, 0.9], [1470, 900, 1.2], [1570, 905, 1.3], [560, 925, 0.8], [980, 930, 0.8], [1200, 922, 0.75], [20, 760, 0.8]]) {
      let a = '', b = '';
      for (let k = 0; k < 9; k++) { const dx = (k - 4) * 7 * e, h = (60 + rng() * 50) * e, cv = (rng() - 0.5) * 40 * e; const p = `M${n1(x + dx)},${y}q${n1(cv * 0.3)},${n1(-h * 0.55)} ${n1(cv)},${n1(-h)}`; if (k % 2) a += p; else b += p; }
      s += `<g class="cn-erva" data-x="${x}" data-y="${y}"><path d="${a}" fill="none" stroke="#B37A28" stroke-width="${n1(5 * e)}" stroke-linecap="round"/><path d="${b}" fill="none" stroke="#EEC468" stroke-width="${n1(4.4 * e)}" stroke-linecap="round"/></g>`;
      meta.ervas.push({ x, y, f: rnd(0, 6) });
    }
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
    const u = 'leao-' + (++contagem) + '-';
    const rng = semente(20261018);
    const meta = { nuvens: [], aves: [], copas: [], ervas: [], ervasC: [], ervasT: [] };
    const E0 = estadoCabeca(CAB0);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('aria-hidden', 'true');
    let poeiraSvg = '', seixosSvg = '', ciscosSvg = '';
    for (let i = 0; i < 12; i++) poeiraSvg += `<circle class="poeira" r="10" fill="url(#${u}poeira)" opacity="0"/>`;
    for (let i = 0; i < 3; i++) seixosSvg += `<g class="seixo" transform="translate(-100,-100)"><ellipse rx="${7 - i}" ry="${5.5 - i}" fill="#C9A47E" stroke="#5A3A28" stroke-width="2"/><ellipse cx="-2" cy="-2" rx="2.5" ry="1.4" fill="#FFF0D0" opacity=".7"/></g>`;
    for (let i = 0; i < 14; i++) ciscosSvg += `<circle class="cisco" r="${n1(2 + rng() * 3)}" fill="url(#${u}cisco)" opacity="0"/>`;
    svg.innerHTML = `<defs>${defsCena(u)}${defsLeao(u)}</defs>${cenaFundo(u, rng, meta)}${cenaChao(u, rng, meta)}
<g class="habitat">${cenaKopje(u, rng, meta)}</g>${svgAgama()}${svgLeao(u, E0)}${svgSuricata(u)}${svgBorboleta()}
<g class="particulas" pointer-events="none">${poeiraSvg}${seixosSvg}</g>${svgPrimeiroPlano(rng, meta)}<g class="ciscos" pointer-events="none">${ciscosSvg}</g>`;
    raiz.appendChild(svg);
    const q = s => svg.querySelector(s), qq = s => Array.from(svg.querySelectorAll(s));

    /* ---------- referências do leão ---------- */
    const leaoG = q('.leao'), habitat = q('.habitat'), cavFrente = q('[data-p="sombraCav"]');
    const partes = {};
    for (const g of leaoG.children) partes[g.getAttribute('data-p')] = { el: g, z: 0, gz: 0, recorte: false };
    const pernasEl = PERNAS.map((p, i) => {
      const camadas = Array.from(partes['perna' + i].el.children);
      return {
        seg: [0, 1, 2, 3].map(k => camadas.map(c => c.querySelector('.g' + k))),
        pe: camadas.map(c => c.querySelector('.pe')),
        dl: camadas[1].querySelector('.dl'), df: camadas[1].querySelector('.df'), al: camadas[1].querySelector('.al'), sb: camadas[2]
      };
    });
    const caudaEl = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => Array.from(partes.cauda.el.querySelectorAll('.k' + k)));
    const el = {
      sombra: q('.sombra'), trM: q('.trM'), trR: q('.trR'), ptM: q('.ptM'), ptC: q('.ptC'), gaM: q('.gaM'), gaC: q('.gaC'),
      pcM: q('.pcM'), cab: q('.cab')
    };
    const hp = {};
    for (const g of el.cab.children) hp[g.getAttribute('class').split(' ')[1].slice(3)] = g;
    const cabT = {}, cabO = { int: [hp.int], lin: [hp.lin] };
    for (const k of ['or0', 'or1', 'olho0', 'olho1'].concat(ELIPS)) cabT[k] = [hp[k]];
    for (const [pre, n] of ANEIS) {
      const cont = hp[pre].children[0].children, ench = hp[pre].children[1].children;
      for (let i = 0; i < n; i++) cabT[pre + i] = [cont[i], ench[i]];
    }
    for (let i = 0; i < 2; i++) {
      const o = hp['olho' + i];
      cabT['iris' + i] = [o.querySelector('.iris')]; cabT['pup' + i] = [o.querySelector('.pup')]; cabT['psup' + i] = [o.querySelector('.psup')]; cabT['pinf' + i] = [o.querySelector('.pinf')];
      cabO['orF' + i] = [hp['or' + i].querySelector('.orF')];
    }
    const tr = (e, v) => { if (e._t !== v) { e._t = v; e.setAttribute('transform', v); } };
    const opa = (e, v) => { v = n3(v); if (e._o !== v) { e._o = v; e.setAttribute('opacity', v); } };
    let ordemCab = '';
    function aplicarCabeca(E) {
      for (const k in E.t) for (const e of cabT[k]) tr(e, E.t[k]);
      for (const k in E.op) for (const e of cabO[k]) opa(e, E.op[k]);
      const ch = E.ordem.join();
      if (ch !== ordemCab) { ordemCab = ch; for (const k of E.ordem) el.cab.appendChild(hp[k]); }
    }

    /* ---------- referências do cenário ---------- */
    const cn = {
      nuvens: qq('.cn-nuvem'), aves: qq('.cn-ave'), copas: qq('.cn-copa'), ninhos: qq('.cn-ninho'), raios: q('.cn-raios'),
      ervas: qq('.cn-erva'), ervasC: qq('.cn-ervaC'), ervasT: qq('.cn-ervaT'),
      agama: q('.cn-agama'), agC: q('.ag-c'), agCab: q('.ag-cab'),
      sur: q('.ev-sur'), srC: q('.sr-c'), srCab: q('.sr-cab'), gazelas: qq('.gz'), gzP: qq('.gzP'),
      borb: q('.ev-borb'), bbD: q('.bb-d'), bbE: q('.bb-e'),
      poeira: qq('.poeira'), seixos: qq('.seixo'), ciscos: qq('.cisco')
    };
    const metaCopas = cn.copas.map(e => ({ x: +e.getAttribute('data-x'), y: +e.getAttribute('data-y'), f: rnd(0, 6) }));
    const metaNinhos = cn.ninhos.map(e => ({ x: +e.getAttribute('data-x'), y: +e.getAttribute('data-y'), f: +e.getAttribute('data-f') }));

    /* ---------- estado ---------- */
    const S = {}, V = {};
    for (const k of CHAVES) { S[k] = { x: EM_PE[k], v: 0 }; V[k] = EM_PE[k]; }
    S.th = { x: REP.th, v: 0 };
    const SX = { x: REP.x, v: 0 }, SZ = { x: REP.z, v: 0 };
    let X = REP.x, Z = REP.z, TH = REP.th, ct = Math.cos(TH), st = Math.sin(TH);
    let tempo = 0, modo = 'fora', cavModo = false, destruido = false;
    let saltoH = 0, sacX = 0, bob = 0, cabBob = { x: 0, v: 0 }, respFase = 0, cauFase = 0, ladoCauda = 1, jubaFase = 0;
    let cabPos = [X + 140, YB + KZ * Z - 300], narizPos = [X + 200, YB - 280], cabVel = 0, cabVelY = 0, ultCab = null;
    const orD = [{ x: 0, v: 0 }, { x: 0, v: 0 }], olhos = { x: { x: 0, v: 0 }, y: { x: 0, v: 0 } };
    const jub = { x: { x: 0, v: 0 }, y: { x: 0, v: 0 } };   // atraso da juba (mola com balanço)
    let olhoAlvo = [0, 0];
    const pes = PERNAS.map(p => { const gx = X + (p.frente ? 82 : -80) * ct - p.v * st, gz = Z + (p.frente ? 82 : -80) * st + p.v * ct; return { gx, gz, h: 0, sw: false, t: 0, dur: 0.24, fx: gx, fz: gz, lift: 8 }; });
    let quieto = 0, velX = 0, velZ = 0, velTh = 0, antX = X, antZ = Z, antTh = TH;
    const esp = { i: -1, w: 0, u: 0, v: 0, h: 0 };   // pata «especial» (lamber a pata)
    const ctl = { x: null, z: null, th: null };     // um comportamento pode mandar na posição

    /* ---------- piscar e orelhas ---------- */
    const pisca = { prox: rnd(1.5, 4), t: -1, duplo: false };
    const curvaPisca = t => (t < 0 ? 0 : t < 0.07 ? t / 0.07 : t < 0.1 ? 1 : t < 0.2 ? 1 - (t - 0.1) / 0.1 : 0);
    function piscar(dt) {
      if (pisca.t < 0) { pisca.prox -= dt; if (pisca.prox <= 0) { pisca.t = 0; pisca.duplo = Math.random() < 0.25; } return 0; }
      pisca.t += dt;
      let v = curvaPisca(pisca.t);
      if (pisca.duplo) v = Math.max(v, curvaPisca(pisca.t - 0.26));
      if (pisca.t > (pisca.duplo ? 0.48 : 0.22)) { pisca.t = -1; pisca.prox = rnd(2, 6); }
      return v;
    }
    let tremor = rnd(3, 7);                     // espasmo de orelha ocasional
    function espasmoOrelha(dt) { tremor -= dt; if (tremor <= 0) { tremor = rnd(3, 8); orD[Math.random() < 0.5 ? 0 : 1].v += (Math.random() < 0.5 ? -1 : 1) * rnd(200, 340); } }

    /* ---------- olhar ---------- */
    const sac = { t: 1, x: 0, y: 0, alvo: null };
    function olharPara(A, alvo, lim) {
      let phd, ox, oy;
      if (alvo) {
        const dx = alvo.x - cabPos[0], dy = alvo.y - cabPos[1];
        phd = PI / 2 - clamp(dx / 340, -1, 1) * 1.3;
        A.cabNod += clamp(dy / 500, -0.35, 0.4);
        ox = clamp(dx / 140, -1, 1) * 4; oy = clamp(dy / 160, -1, 1) * 3.5;
      } else { phd = lerp(TH, PI / 2, 0.55); ox = sac.x; oy = sac.y; }
      A.cabYaw = clamp(angDif(TH, phd), -lim, lim);
      olhoAlvo = [ox, oy];
    }
    function saccades(dt) {
      sac.t -= dt;
      if (sac.t <= 0) {
        sac.t = rnd(0.8, 3);
        if (Math.random() < 0.6) { sac.x = rnd(-1.2, 1.2); sac.y = rnd(-1, 1); sac.alvo = null; }
        else {
          const r = Math.random();
          sac.alvo = r < 0.3 ? aves[Math.floor(Math.random() * aves.length)] : r < 0.45 ? agama : r < 0.75 ? { x: rnd(300, 1300), y: rnd(160, 420) } : { x: rnd(350, 1300), y: rnd(600, 760) };
        }
      }
    }
    const alvoVivo = a => (a && a.x !== undefined ? { x: a.x, y: a.y } : null);

    /* ---------- comportamentos ociosos (na savana) ---------- */
    const ACOES = {
      sentar: { dur: 5.6, aplicar(A, t) {        // senta-se, olha à volta, cauda à volta das patas
        const w = janela(t, 0, 0.7, 4.9, 5.6);
        misturar(A, SENTADO, w);
        A.cauLado = 1.8 * janela(t, 0.5, 1.4, 4.4, 5.2);
        A.cabYaw += 0.4 * Math.sin(t * 1.1) * janela(t, 1.2, 1.8, 4.0, 4.6);
        A.feliz = 0.3 * janela(t, 2, 2.5, 3.8, 4.4); A.cauAmp = lerp(A.cauAmp, 0.25, w); A.cauVel = lerp(A.cauVel, 1.1, w);
      } },
      bocejar: { dur: 3.6, olhar: false, aplicar(A, t) {   // bocejo enorme, com a juba a inchar
        const w = janela(t, 0, 0.35, 2.0, 2.5);
        A.cabYaw = lerp(EM_PE.cabYaw, 1.0, janela(t, 0, 0.4, 2.8, 3.4)); olhoAlvo = [0, 0];
        A.cabNod -= 0.5 * w; A.cabH += 14 * w; A.cabU -= 6 * w;
        A.boca = 1.35 * janela(t, 0.25, 1.05, 1.7, 2.15); A.fecho = Math.max(A.fecho, 0.95 * janela(t, 0.35, 0.8, 1.7, 2.1));
        A.lingua = 0.35 * janela(t, 0.6, 1.0, 1.6, 2.0); A.achatar = 0.5 * w; A.fofo = 0.25 * w; A.jAmp = 3 + 4 * w;
        A.cabRoll += 0.12 * Math.sin((t - 2.2) * TAU * 5) * janela(t, 2.2, 2.3, 2.6, 2.8);
        A.lambe = janela(t, 2.75, 2.9, 3.1, 3.3); A.boca = Math.max(A.boca, 0.16 * A.lambe);
      } },
      lamberPata: { dur: 5.6, olhar: false, aplicar(A, t) {   // senta-se, levanta a pata da frente e lambe-a
        misturar(A, SENTADO, janela(t, 0, 0.6, 5.0, 5.6));
        const wl = janela(t, 0.7, 1.2, 4.2, 4.8), i = ct >= 0 ? 0 : 1;
        esp.i = i; esp.w = wl; esp.u = 120; esp.v = PERNAS[i].v * 0.5; esp.h = 168 + 5 * Math.sin(t * TAU * 1.7) * passo(1.3, 1.5, t);
        A.cabYaw = lerp(A.cabYaw, 0.15, wl); A.cabNod += 0.5 * wl; A.cabH -= 66 * wl; A.cabU += 4 * wl;
        const lb = janela(t, 1.4, 1.55, 1.7, 1.85) + janela(t, 1.95, 2.1, 2.25, 2.4) + janela(t, 2.5, 2.65, 2.8, 2.95) + janela(t, 3.05, 3.2, 3.35, 3.5) + janela(t, 3.6, 3.75, 3.9, 4.05);
        A.boca = Math.max(A.boca, 0.34 * lb); A.lingua = Math.max(A.lingua, 0.95 * lb); A.fecho = Math.max(A.fecho, 0.7 * janela(t, 1.3, 1.5, 4.0, 4.3));
        olhoAlvo = [1, 4];
      } },
      rebolar: { dur: 6.4, aplicar(A, t) {     // deita-se e esperneia de patas no ar, a rebolar a cabeça
        const w = janela(t, 0, 0.9, 5.4, 6.4);
        misturar(A, DEITADO, w);
        const wr = janela(t, 1.0, 1.5, 4.6, 5.2), f = t * TAU * 1.3;
        A.pFH = lerp(A.pFH, 84 + 26 * Math.sin(f), wr); A.pFU = lerp(A.pFU, 66, wr); A.cruz = lerp(A.cruz, 0, wr);
        A.pTH = lerp(A.pTH, 58 + 22 * Math.sin(f + 1.8), wr); A.pTU = lerp(A.pTU, 20, wr);
        A.alt -= 8 * wr; A.incl += 0.07 * Math.sin(f * 0.5) * wr;
        A.cabRoll += 0.65 * Math.sin(f * 0.5) * wr; A.cabNod -= 0.2 * wr; A.cabH -= 8 * wr; A.cabYaw += 0.3 * wr;
        A.feliz = Math.max(A.feliz, 0.85 * wr); A.boca = Math.max(A.boca, 0.3 * wr); A.lingua = Math.max(A.lingua, 0.3 * wr);
        A.cauAmp = lerp(A.cauAmp, 0.5, wr); A.cauVel = lerp(A.cauVel, 1.8, wr); A.jAmp = 3 + 8 * wr;
      } },
      abanarJuba: { dur: 2.8, aplicar(A, t) {   // abana a cabeça e a juba voa (sai pó)
        const w = janela(t, 0.1, 0.3, 1.9, 2.3), osc = Math.sin((t - 0.1) * TAU * 3.6);
        A.cabYaw += 0.45 * osc * w; A.cabRoll += 0.22 * osc * w; A.fecho = Math.max(A.fecho, 0.85 * w); A.achatar = 0.4 * w; A.jAmp = 3 + 22 * w; A.fofo = 0.2 * w;
        if (w > 0.5 && !this.p) { this.p = true; soltarPoeira(cabPos[0], cabPos[1] + 30, 6, 0.8); }
        if (t < 0.1) this.p = false;
        A.feliz = 0.4 * janela(t, 2.2, 2.4, 2.6, 2.8);
        if (w > 0.3) { orD[0].v += osc * 900 * (1 / 60); orD[1].v += osc * 900 * (1 / 60); }
      } },
      esfinge: { dur: 7, aplicar(A, t) {        // deita-se como uma esfinge, de cabeça erguida, e pisca devagar
        const w = janela(t, 0, 1.0, 6.0, 7.0);
        misturar(A, DEITADO, w);
        A.cabH = lerp(A.cabH, 56, w); A.cabU = lerp(A.cabU, 44, w); A.cruz = lerp(A.cruz, 0, w); A.pFU = lerp(A.pFU, 72, w); A.cabNod -= 0.08 * w;
        A.cabYaw = lerp(A.cabYaw, 1.05, janela(t, 0.8, 1.6, 5.4, 6.2));
        A.fecho = Math.max(A.fecho, 0.6 * janela(t, 2.4, 3.0, 4.2, 4.8)); A.feliz = 0.3 * janela(t, 2.4, 3.0, 4.2, 4.8);
        A.cauAmp = 0.2 * w; A.cauLado = 1.2 * w;
      } },
      espreguicar: { dur: 4.4, aplicar(A, t) {   // vénia com as patas da frente esticadas e depois estica as de trás
        const w1 = janela(t, 0, 0.6, 1.9, 2.4);
        misturar(A, VENIA, w1);
        A.boca = Math.max(A.boca, 0.7 * janela(t, 0.6, 1.0, 1.5, 1.9)); A.fecho = Math.max(A.fecho, 0.85 * janela(t, 0.7, 1.0, 1.5, 1.8)); A.achatar = 0.4 * w1;
        const w2 = janela(t, 2.5, 3.0, 3.6, 4.2);
        A.incl += 0.1 * w2; A.alt -= 12 * w2; A.fixT = Math.max(A.fixT, w2); A.pTU = lerp(A.pTU, -40, w2); A.cabH -= 10 * w2; A.fecho = Math.max(A.fecho, 0.5 * w2);
      } },
      cheirar: { dur: 4.6, olhar: false, aplicar(A, t) {   // cheira o chão e dá uns passos
        const w = janela(t, 0, 0.5, 4.0, 4.6);
        A.cabU = lerp(A.cabU, 62, w); A.cabH = lerp(A.cabH, -60, w); A.cabNod += 0.85 * w; A.incl -= 0.08 * w; A.alt -= 6 * w;
        A.cabYaw = lerp(0.5, 0.1 + 0.45 * Math.sin(t * 2.1), w); A.nariz = w; olhoAlvo = [2 * w, 4 * w];
        const d = 64 * sinoide((t - 0.5) / 2.0) * (1 - sinoide((t - 2.9) / 1.4));
        ctl.x = REP.x + d * Math.cos(REP.th); ctl.z = REP.z + d * Math.sin(REP.th);
      } }
    };
    const fora = { acao: null, nome: '', t: 0, prox: 2.5, ultima: '' };
    function escolherAcao() {
      const nomes = Object.keys(ACOES).filter(n => n !== fora.ultima);
      const n = nomes[Math.floor(Math.random() * nomes.length)];
      fora.acao = ACOES[n]; fora.nome = n; fora.ultima = n; fora.t = 0; ladoCauda = ct >= 0 ? 1 : -1;
    }
    function comportamentoFora(dt, A) {
      const evA = interesse();
      if (evA && fora.acao) { fora.acao = null; fora.prox = 3; }
      esp.i = -1; esp.w = 0; ctl.x = null; ctl.z = null; ctl.th = null; sacX = 0;
      if (fora.acao) { fora.t += dt; fora.acao.aplicar(A, fora.t, dt); if (fora.t >= fora.acao.dur) { fora.acao = null; fora.prox = rnd(1.5, 3.5); } }
      else if (!evA && !reacao.ativa) { fora.prox -= dt; if (fora.prox <= 0) escolherAcao(); }
      A.alt += Math.sin(tempo * 0.8) * 1.2;
      let thAlvo = REP.th;
      if (evA) {
        if (evA.x < cabPos[0] - 220) thAlvo = 1.15; else if (evA.x > cabPos[0] + 420) thAlvo = 0.12;
        A.orelhas = Math.max(A.orelhas, 0.6); A.cauVel = Math.max(A.cauVel, 1.4); A.cauAmp = Math.max(A.cauAmp, 0.3); A.esc = Math.max(A.esc, 1.05); A.dilata = Math.max(A.dilata, 0.4);
      }
      if (ctl.x !== null) { X = ctl.x; Z = ctl.z; SX.x = X; SX.v = 0; SZ.x = Z; SZ.v = 0; }
      else { mola(SX, REP.x, 2.4, dt); mola(SZ, REP.z, 2.4, dt); X = SX.x; Z = SZ.x; }
      mola(S.th, S.th.x + angDif(S.th.x, thAlvo), 2.4, dt); TH = S.th.x;
      if (!(fora.acao && fora.acao.olhar === false)) {
        const yawAcao = A.cabYaw - EM_PE.cabYaw;
        olharPara(A, alvoVivo(evA) || alvoVivo(sac.alvo), 1.3);
        A.cabYaw += fora.acao ? yawAcao : 0;
      }
    }

    /* ---------- dentro da caverna ---------- */
    const ACOES_DENTRO = {
      suspiro: { dur: 2.4, aplicar(A, t) { const w = janela(t, 0, 0.8, 1.2, 2.2); A.resp = lerp(A.resp, 3.2, janela(t, 0, 0.6, 0.8, 1.6)); A.fecho = Math.max(A.fecho, 0.7 * w); A.cabH -= 6 * janela(t, 0.8, 1.2, 1.8, 2.4); A.feliz = 0.2 * w; } },
      levantar: { dur: 2.8, aplicar(A, t) { const w = janela(t, 0, 0.35, 2.3, 2.8); A.cabH += 24 * w; A.cabNod -= 0.15 * w; A.cabYaw += 0.55 * Math.sin(t * 2.2) * w; A.orelhas = 0.5 * w; } },
      bocejo: { dur: 2.8, aplicar(A, t) { const w = janela(t, 0, 0.3, 1.6, 2.0); A.cabNod -= 0.22 * w; A.cabH += 10 * w; A.boca = 1.15 * janela(t, 0.2, 0.9, 1.4, 1.8); A.fecho = Math.max(A.fecho, 0.95 * janela(t, 0.3, 0.7, 1.4, 1.7)); A.achatar = 0.4 * w; A.fofo = 0.2 * w; A.lambe = janela(t, 2.1, 2.25, 2.45, 2.65); } },
      cauda: { dur: 1.8, aplicar(A, t) { const w = janela(t, 0, 0.1, 1.4, 1.8); A.cauAmp = 0.3 * w; A.cauVel = 2.2; A.feliz = 0.3 * w; } },
      lamber: { dur: 1.4, aplicar(A, t) { A.lambe = janela(t, 0.1, 0.25, 0.45, 0.6) + janela(t, 0.65, 0.77, 0.9, 1.05); A.boca = 0.12 * A.lambe; A.cabH += 4 * janela(t, 0, 0.2, 1.1, 1.4); } },
      juba: { dur: 2.2, aplicar(A, t) { const w = janela(t, 0.1, 0.3, 1.4, 1.8), osc = Math.sin((t - 0.1) * TAU * 3.4); A.cabYaw += 0.3 * osc * w; A.cabRoll += 0.15 * osc * w; A.fecho = Math.max(A.fecho, 0.8 * w); A.jAmp = 3 + 16 * w; } }
    };
    const dentro = { acao: null, t: 0, prox: 2, ultima: '' };
    function comportamentoDentro(dt, A) {
      misturar(A, DEITADO, 1);
      A.cabH = 30; A.cauLado = 1.6; A.cauElev = -1.25;
      const evA = interesse();
      if (!reacao.ativa && !som.ativo) {
        if (dentro.acao) { dentro.t += dt; dentro.acao.aplicar(A, dentro.t); if (dentro.t >= dentro.acao.dur) { dentro.acao = null; dentro.prox = rnd(2, 4.5); } }
        else { dentro.prox -= dt; if (dentro.prox <= 0) { const ns = Object.keys(ACOES_DENTRO).filter(n => n !== dentro.ultima); const n = ns[Math.floor(Math.random() * ns.length)]; dentro.acao = ACOES_DENTRO[n]; dentro.ultima = n; dentro.t = 0; } }
      }
      if (evA) { A.cabH += 16; A.orelhas = Math.max(A.orelhas, 0.5); A.cauAmp = 0.15; A.cauVel = 2; }
      X = CAV.x; Z = CAV.z; TH = PI / 2; ladoCauda = 1;
      const y0 = A.cabYaw;
      olharPara(A, alvoVivo(evA) || alvoVivo(sac.alvo), 0.75);
      if (dentro.acao) A.cabYaw += y0 - EM_PE.cabYaw;
    }

    /* ---------- reagir (toque) e rugir ---------- */
    const reacao = { ativa: false, t: 0 };
    const salto = { ativo: false, t: 0, alt: 26 };
    function camadaReacao(dt, A, D) {
      let h = 0;
      if (salto.ativo) {
        salto.t += dt; const t = salto.t;
        D.alt -= 16 * janela(t, 0, 0.05, 0.08, 0.13) + 12 * janela(t, 0.43, 0.47, 0.5, 0.64);
        D.incl += 0.07 * janela(t, 0.1, 0.18, 0.3, 0.44);
        h = (t > 0.1 && t < 0.44) ? salto.alt * Math.sin(PI * (t - 0.1) / 0.34) : 0;
        if (t > 0.44 && !salto.aterrou) { salto.aterrou = true; orD[0].v -= 160; orD[1].v += 160; jub.y.v += 260; }
        if (t > 0.7) salto.ativo = false;
      }
      saltoH = h;
      if (!reacao.ativa) return;
      reacao.t += dt; const t = reacao.t, w = janela(t, 0, 0.05, 1.0, 1.45);
      A.orelhas = lerp(A.orelhas, 1, w); A.achatar = lerp(A.achatar, 0, w); A.feliz = lerp(A.feliz, 0.9, w); A.esc = lerp(A.esc, 1.08, w); A.dilata = lerp(A.dilata, 0.5, w);
      A.boca = Math.max(A.boca, 0.3 * w); A.lingua = Math.max(A.lingua, 0.25 * w); A.fofo = Math.max(A.fofo, 0.3 * w); A.jAmp = Math.max(A.jAmp, 3 + 7 * w);
      A.cauVel = lerp(A.cauVel, 3.2, w); A.cauAmp = lerp(A.cauAmp, modo === 'dentro' ? 0.3 : 0.55, w);
      if (modo === 'dentro') { A.cabH += 26 * w; A.cabNod -= 0.2 * w; A.cabRoll += 0.12 * Math.sin(t * TAU * 2.5) * w; }
      else { A.cauElev = lerp(A.cauElev, -0.5, w); A.cabRoll += 0.1 * Math.sin(t * TAU * 3) * w; }
      if (t > 1.45) reacao.ativa = false;
    }
    let som = { ativo: false, t: 0, lat: [], fim: 0 };
    function camadaSom(dt, A, D) {
      if (!som.ativo) return;
      som.t += dt;
      let env = 0, pre = 0;
      som.lat.forEach(l => {
        const tb = som.t - l.a;
        if (tb > -0.16 && tb < 0) pre = Math.max(pre, passo(-0.16, -0.03, tb));
        if (tb >= 0 && tb < l.d + 0.12) {
          const e = tb < 0.05 ? tb / 0.05 : tb < l.d * 0.75 ? 1 : 1 - (tb - l.d * 0.75) / (l.d * 0.25 + 0.12);
          env = Math.max(env, clamp(e, 0, 1));
          if (!l.k) { l.k = true; orD[0].v += 180; orD[1].v -= 180; jub.y.v -= 200; }
        }
      });
      const wSom = janela(som.t, 0, 0.12, som.fim - 0.1, som.fim + 0.25);
      D.boca = Math.max(D.boca, env * 1.15);
      D.cabU += env * 6 - pre * 4; D.cabH += env * 10 + pre * 2; D.cabNod += -env * 0.3 + pre * 0.12; D.alt -= env * 2;
      A.fofo = Math.max(A.fofo, 0.42 * env + 0.1 * wSom); A.jAmp = Math.max(A.jAmp, 3 + 9 * env); A.achatar = Math.max(A.achatar, 0.25 * env);
      A.fecho = Math.max(A.fecho, 0.45 * env); A.feliz = Math.max(A.feliz, 0.35 * wSom); A.lingua = Math.max(A.lingua, 0.3 * env);
      A.cauVel = Math.max(A.cauVel, 1.8); A.cauAmp = Math.max(A.cauAmp, 0.3 * wSom);
      if (modo === 'dentro') { A.cabH += 20 * wSom; A.cabNod -= 0.08 * wSom; }
      if (som.t > som.fim + 0.3) som.ativo = false;
    }

    /* ---------- ida para a caverna e volta ---------- */
    const ZF = 200;   // profundidade à frente da caverna
    let seq = null;
    function correrIda(dt, A, D) {
      seq.T += dt; const T = seq.T;
      A.cauVel = 1.2; A.cauAmp = 0.22; A.cauElev = -0.9;
      A.orelhas = 0.6 * janela(T, 0, 0.2, 1.3, 1.7);
      D.alt -= 9 * janela(T, 0.02, 0.12, 0.2, 0.36);
      if (T < 0.25) { TH = seq.th0; A.cabYaw = lerp(EM_PE.cabYaw, -0.2, passo(0, 0.2, T)); olhoAlvo = [4, 0]; }
      else if (T < 1.5) {
        const s = sinoide((T - 0.25) / 1.25), p = seq.cam.pos(s), rumo = seq.cam.rumo(clamp(s, 0.02, 0.98));
        X = p[0]; Z = p[1];
        TH = seq.th0 + angDif(seq.th0, rumo) * passo(0.2, 0.55, T);
        seq.thFim = TH;
        A.cabYaw = 0.1 - 0.3 * passo(1.0, 1.4, T); olhoAlvo = [3, 1.5];
      } else {
        const k = sinoide((T - 1.5) / 0.4);
        TH = seq.thFim + angDif(seq.thFim, -PI / 2) * k; X = lerp(seq.xFim, CAV.x, k); Z = lerp(seq.zFim, ZF, k);
        A.cabYaw = -0.4 * janela(T, 1.45, 1.6, 1.75, 1.95); olhoAlvo = [0, 2];
      }
      if (T < 1.5) { seq.xFim = X; seq.zFim = Z; }
      misturar(A, AGACHADO, passo(1.55, 1.9, T) * (1 - passo(3.05, 3.4, T)));
      if (T > 1.85) Z = lerp(ZF, -160, sinoide((T - 1.85) / 0.9));
      cavModo = T >= 1.85;
      if (T > 2.6) TH = lerp(-PI / 2, PI / 2, sinoide((T - 2.6) / 0.5));
      A.enrolar = janela(T, 2.45, 2.65, 3.05, 3.3); A.cabU -= 24 * A.enrolar;
      if (T > 3.0) Z = lerp(-160, CAV.z, sinoide((T - 3.0) / 0.45));
      misturar(A, DEITADO, passo(3.0, 3.5, T)); A.cabH = lerp(A.cabH, 30, passo(3.0, 3.5, T));
      ladoCauda = 1; A.cauLado = 1.6 * passo(3.0, 3.55, T); A.cauElev = lerp(A.cauElev, -1.25, passo(3.0, 3.5, T));
      if (T > 3.1) olhoAlvo = [0, 0];
      if (!seq.e1 && T > 2.3) { seq.e1 = true; mexerCaverna(0.6); }
      if (!seq.e2 && T > 3.4) { seq.e2 = true; mexerCaverna(1.2); soltarPoeira(CAV.x, 748, 7, 1); soltarSeixos(); }
      A.resp = lerp(A.resp, 2.8, janela(T, 3.45, 3.55, 3.65, 3.8)); A.fecho = Math.max(A.fecho, 0.5 * janela(T, 3.45, 3.55, 3.65, 3.8));
      if (T >= 3.75) {
        modo = 'dentro'; seq = null; cavModo = true; dentro.acao = null; dentro.prox = rnd(1.5, 3);
        const r = resolverIda; resolverIda = null; if (r) r();
        if (pendenteVolta) { pendenteVolta = false; iniciarVolta(); }
      }
    }
    function correrVolta(dt, A, D) {
      seq.T += dt; const T = seq.T;
      misturar(A, AGACHADO, passo(0.05, 0.35, T) * (1 - passo(0.8, 1.05, T)));
      misturar(A, DEITADO, 1 - passo(0.05, 0.35, T));
      ladoCauda = 1; A.cauLado = 1.6 * (1 - passo(0.05, 0.4, T)); A.cauElev = -0.9;
      A.orelhas = 0.8 * janela(T, 0, 0.15, 0.9, 1.2); A.feliz = 0.35 * janela(T, 0, 0.2, 0.8, 1.1); A.cauVel = 1.4; A.cauAmp = 0.25;
      if (T < 1.55) {
        X = CAV.x; TH = PI / 2;
        Z = lerp(CAV.z, ZF, sinoide((T - 0.22) / 0.7));
        olhoAlvo = [0, 0]; A.cabYaw = 0;
      }
      cavModo = T < 0.95;
      // espreguiça-se (vénia rápida) e abana a juba
      misturar(A, VENIA, janela(T, 0.88, 1.02, 1.12, 1.26));
      const ab = janela(T, 1.2, 1.26, 1.48, 1.6), osc = Math.sin((T - 1.2) * TAU * 6);
      A.cabYaw += osc * 0.35 * ab; A.cabRoll += osc * 0.2 * ab; A.fecho = Math.max(A.fecho, 0.85 * ab); A.jAmp = 3 + 22 * ab; A.fofo = 0.2 * ab;
      if (ab > 0.3) { orD[0].v += osc * 1400 * dt; orD[1].v += osc * 1400 * dt; }
      if (!seq.p1 && T > 1.22) { seq.p1 = true; soltarPoeira(X, YB + KZ * Z - 230, 7, 0.9); }
      if (!seq.e1 && T > 0.4) { seq.e1 = true; mexerCaverna(0.7); }
      if (T >= 1.55) {
        if (T < 1.8) { const k = sinoide((T - 1.55) / 0.25); TH = PI / 2 + angDif(PI / 2, seq.rumo0) * k; X = CAV.x; Z = ZF; A.cabYaw = 0.5 * janela(T, 1.5, 1.6, 1.75, 1.9); }
        else {
          const s = sinoide((T - 1.8) / 0.88), p = seq.cam.pos(s), rumo = seq.cam.rumo(clamp(s, 0.02, 0.98));
          X = p[0]; Z = p[1];
          if (T < 2.66) { TH = seq.rumo0 + angDif(seq.rumo0, rumo) * passo(1.8, 1.95, T); seq.thFim = TH; A.cabYaw = 0.3 * passo(1.8, 1.95, T); olhoAlvo = [-3, 1]; }
          else { const k = sinoide((T - 2.66) / 0.32); TH = seq.thFim + angDif(seq.thFim, REP.th) * k; olharPara(A, null, 1.2); }
        }
      }
      if (T >= 2.98) {
        modo = 'fora'; seq = null; cavModo = false; sacX = 0;
        TH = Math.atan2(Math.sin(TH), Math.cos(TH)); S.th.x = TH; S.th.v = 0; SX.x = X; SX.v = 0; SZ.x = Z; SZ.v = 0; fora.acao = null; fora.prox = rnd(2, 4);
        const r = resolverVolta; resolverVolta = null; if (r) r();
        if (pendenteIda) { pendenteIda = false; iniciarIda(); }
      }
    }
    let resolverIda = null, resolverVolta = null, pendenteIda = false, pendenteVolta = false;
    function iniciarIda() {
      fora.acao = null; reacao.ativa = false; salto.ativo = false; esp.i = -1; sacX = 0;
      if (ev.ativo && ev.ativo.tipo === 'borboleta') ev.ativo.largar = true;
      seq = { T: 0, th0: TH, thFim: TH, xFim: X, zFim: Z, cam: caminho([[X, Z], [X + 120, Z + 50], [880, ZF + 30], [966, ZF + 8]]) };
      modo = 'indo';
    }
    function iniciarVolta() {
      reacao.ativa = false; dentro.acao = null;
      seq = { T: 0, cam: caminho([[CAV.x, ZF], [890, ZF + 26], [REP.x + 140, REP.z + 50], [REP.x, REP.z]]) };
      seq.rumo0 = PI / 2 + angDif(PI / 2, seq.cam.rumo(0.02));
      modo = 'voltando';
    }

    /* ---------- caverna: ervas abanam, pó e pedrinhas ---------- */
    const ervaC = { x: 0, v: 0 };
    function mexerCaverna(f) { ervaC.v += 80 * f; }
    const particulas = cn.poeira.map(e => ({ e, vida: 1, dur: 1, x: 0, y: 0, vx: 0, vy: 0, r: 10 }));
    function soltarPoeira(x, y, n, forca) {
      let k = 0;
      for (const p of particulas) {
        if (p.vida < p.dur) continue;
        const a = rnd(PI * 1.05, PI * 1.95);
        p.x = x + rnd(-70, 70); p.y = y + rnd(-8, 8); p.vx = Math.cos(a) * rnd(30, 90) * forca; p.vy = Math.sin(a) * rnd(20, 50) * forca; p.vida = 0; p.dur = rnd(0.8, 1.4); p.r = rnd(8, 16);
        if (++k >= n) break;
      }
    }
    function atualizarPoeira(dt) {
      for (const p of particulas) {
        if (p.vida >= p.dur) { if (p.e._o !== 0) opa(p.e, 0); continue; }
        p.vida += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.exp(-2.2 * dt); p.vy = p.vy * Math.exp(-2.2 * dt) - 6 * dt;
        const k = p.vida / p.dur;
        tr(p.e, `translate(${n1(p.x)},${n1(p.y)}) scale(${n3((p.r / 10) * (0.6 + k * 1.2))})`); opa(p.e, 0.75 * (1 - k) * passo(0, 0.1, k));
      }
    }
    const seixos = cn.seixos.map(e => ({ e, ativo: false, x: 0, y: 0, vx: 0, vy: 0, r: 0, t: 0, chao: 0 }));
    function soltarSeixos() {
      seixos.forEach((s, i) => { s.ativo = true; s.t = 0; s.x = 1150 + i * 26; s.y = 470 + i * 10; s.vx = 50 + i * 25; s.vy = -40; s.r = 0; s.chao = 786 + i * 6; });
    }
    function atualizarSeixos(dt) {
      for (const s of seixos) {
        if (!s.ativo) continue;
        s.t += dt; s.vy += 900 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.r += s.vx * dt * 5;
        if (s.y > s.chao) { s.y = s.chao; s.vy = -Math.abs(s.vy) * 0.35; s.vx *= 0.6; }
        tr(s.e, `translate(${n1(s.x)},${n1(s.y)}) rotate(${n1(s.r)})`); opa(s.e, 1 - passo(2.2, 2.8, s.t));
        if (s.t > 2.8) { s.ativo = false; tr(s.e, 'translate(-100,-100)'); }
      }
    }

    /* ---------- acontecimentos raros: suricata que espreita, gazelas ao longe, borboleta no nariz ---------- */
    const ev = { ativo: null, prox: rnd(12, 18), ordem: [] };
    function interesse() { return ev.ativo && ev.ativo.alvo; }
    const EVENTOS = {
      suricata(e) {
        const t = e.t, { x, y } = TOCA_SUR;
        // altura acima do buraco (0 = escondida, 120 = de pé) e rotação da cabeça
        const sobe = 70 * passo(0, 0.5, t) * (1 - passo(1.9, 2.0, t)) + 120 * passo(1.9, 2.3, t) * (1 - passo(5.4, 5.65, t)) + 66 * janela(t, 6.4, 6.8, 8.4, 8.7);
        const cab = 22 * Math.sin(t * 2.4) * janela(t, 0.5, 0.8, 1.7, 1.9) + 18 * Math.sin(t * 1.6 + 1) * janela(t, 2.4, 2.8, 5.0, 5.3) + 26 * Math.sin(t * 3) * janela(t, 6.8, 7.0, 8.2, 8.4);
        if (t > 9.2) { e.fim = true; return; }
        tr(cn.sur, `translate(${x},${n1(y + 120 - sobe)})`);
        tr(cn.srCab, `rotate(${n1(cab)} 1 -72)`); tr(cn.srC, `rotate(${n1(2 * Math.sin(t * 1.3))} 0 8)`);
        e.alvo = sobe > 20 ? { x, y: y + 30 - sobe } : null;
      },
      gazelas(e) {
        const t = e.t;
        cn.gazelas.forEach((g, i) => {
          const x = 1720 + i * 46 + (i % 2) * 20 - t * 170, f = t * 5.2 + i * 1.3, salto = Math.abs(Math.sin(f)), y = 552 + (i % 3) * 7 - salto * 16;
          tr(g, `translate(${n1(x)},${n1(y)}) scale(-1,1)`); tr(cn.gzP[i], `translate(0,2) scale(1,${n3(1 - 0.55 * salto)}) translate(0,-2)`);
        });
        const xl = 1720 - t * 170;
        if (xl < -200) { e.fim = true; return; }
        e.alvo = xl < 1640 && xl > -40 ? { x: xl, y: 540 } : null;
      },
      borboleta(e) {
        const t = e.t;
        if (e.fase === undefined) { e.fase = 0; e.pode = modo === 'fora' && !seq; e.t0 = 0; }
        let x, y, pousada = false;
        const cx = cabPos[0], cy = cabPos[1];
        if (e.fase === 0) {                                     // chega da direita a esvoaçar
          const s = sinoide(t / 3.5); [x, y] = bezier([[1700, 240], [1400, 160], [cx + 300, cy - 200], [cx + 90, cy - 110]], s); x += 26 * Math.sin(t * 3.1); y += 20 * Math.sin(t * 4.3);
          if (t > 3.5) { e.fase = 1; e.t0 = t; }
        } else if (e.fase === 1) {                              // dá voltas à cabeça do leão
          const k = t - e.t0; x = cx + 90 * Math.cos(k * 1.8) + 10; y = cy - 100 + 36 * Math.sin(k * 2.6);
          if (k > 2.6) { e.fase = (e.pode && modo === 'fora' && !seq && !e.largar) ? 2 : 4; e.t0 = t; e.x0 = x; e.y0 = y; }
        } else if (e.fase === 2) {                              // pousa no nariz
          const k = (t - e.t0) / 0.7; x = lerp(e.x0, narizPos[0], sinoide(k)); y = lerp(e.y0, narizPos[1] - 10, sinoide(k)) - 30 * Math.sin(PI * clamp(k, 0, 1));
          if (k >= 1) { e.fase = 3; e.t0 = t; }
        } else if (e.fase === 3) {                              // fica no nariz e o leão fica vesgo… até espirrar
          const k = t - e.t0; x = narizPos[0]; y = narizPos[1] - 10; pousada = true;
          e.vesgo = passo(0, 0.4, k);
          if (k > 2.6 || e.largar || modo !== 'fora') { e.fase = 4; e.t0 = t; e.x0 = x; e.y0 = y; e.espirrar = k > 2.6 && modo === 'fora'; }
        } else {                                                // vai-se embora para cima, à esquerda (o leão espirra)
          const k4 = t - e.t0, k = k4 / 3.6;
          x = lerp(e.x0, -120, sinoide(k)) + 40 * Math.sin(t * 3) * passo(0, 0.1, k); y = lerp(e.y0, 120, sinoide(k)) + 30 * Math.sin(t * 4) * passo(0, 0.1, k) - 40 * Math.sin(PI * clamp(k4 / 0.5, 0, 1));
          e.vesgo = e.vesgo ? Math.max(0, 1 - k4 * 5) : 0; e.espirro = e.espirrar ? janela(k4, 0, 0.12, 0.3, 0.75) : 0;
          if (k >= 1) { e.fim = true; return; }
        }
        const bat = pousada ? 0.55 + 0.45 * Math.cos(t * TAU * 0.8) : Math.abs(Math.cos(t * TAU * 6));
        tr(cn.borb, `translate(${n1(x)},${n1(y)}) rotate(${pousada ? 0 : n1(12 * Math.sin(t * 5))}) scale(.8)`);
        tr(cn.bbD, `scale(${n3(0.15 + 0.85 * bat)},1)`); tr(cn.bbE, `scale(${n3(-(0.15 + 0.85 * bat))},1)`);
        e.alvo = { x, y };
      }
    };
    // efeito da borboleta na cara: vesgo enquanto está no nariz e um espirro quando ela parte
    function camadaEvento(A, D) {
      const e = ev.ativo;
      if (!e || e.tipo !== 'borboleta' || modo !== 'fora') return;
      if (e.vesgo) { A.vesgo = Math.max(A.vesgo, e.vesgo); A.esc = Math.max(A.esc, 1 + 0.06 * e.vesgo); olhoAlvo = [0, 2.5 * e.vesgo]; }
      const s = e.espirro || 0;
      if (s > 0) { D.cabNod += 0.35 * s; D.cabH -= 12 * s; D.boca = Math.max(D.boca, 0.45 * s); A.fecho = Math.max(A.fecho, s); A.nariz = Math.max(A.nariz, s); A.jAmp = Math.max(A.jAmp, 3 + 14 * s); }
    }
    function esconderEvento(tipo) {
      if (tipo === 'suricata') tr(cn.sur, `translate(${TOCA_SUR.x},${TOCA_SUR.y + 120})`);
      else if (tipo === 'gazelas') cn.gazelas.forEach(g => tr(g, 'translate(-300,-300)'));
      else tr(cn.borb, 'translate(-300,-300)');
    }
    function atualizarEventos(dt) {
      if (!ev.ativo) {
        ev.prox -= dt;
        if (ev.prox <= 0 && modo !== 'indo' && modo !== 'voltando') {
          if (!ev.ordem.length) ev.ordem = ['suricata', 'gazelas', 'borboleta'].sort(() => Math.random() - 0.5);
          ev.ativo = { tipo: ev.ordem.pop(), t: 0, alvo: null, fim: false };
        }
        return;
      }
      const e = ev.ativo; e.t += dt; EVENTOS[e.tipo](e);
      if (e.fim) { esconderEvento(e.tipo); ev.ativo = null; ev.prox = rnd(15, 30) * (reduzido ? 1.6 : 1); }
    }

    /* ---------- cenário vivo: nuvens, aves, copas, ninhos, ervas, lagarto, ciscos de luz ---------- */
    const aves = meta.aves.map(m => ({ x: m.x, y: m.y, m }));
    const agama = { x: 1040, y: 296, t: 0, prox: rnd(2, 5), flexoes: 0, anda: 0, dx: 0 };
    const ciscos = cn.ciscos.map(() => ({ x: rnd(100, 1400), y: rnd(150, 760), f: rnd(0, 6), v: rnd(4, 10) }));
    function atualizarAgama(dt) {
      const g = agama; g.prox -= dt;
      if (g.prox <= 0) { g.prox = rnd(3, 7); if (Math.random() < 0.6) g.flexoes = 1.2; else { g.anda = 0.6; g.dx = (g.x > 1030 ? -1 : 1) * rnd(20, 40); } }
      let dy = 0, cab = 0;
      if (g.flexoes > 0) { g.flexoes -= dt; dy = -3.5 * Math.max(0, Math.sin((1.2 - g.flexoes) * TAU * 2.5)); cab = -12 * Math.max(0, Math.sin((1.2 - g.flexoes) * TAU * 2.5)); }
      if (g.anda > 0) { g.anda -= dt; g.x += g.dx * dt / 0.6; }
      const vira = g.dx < 0 && g.anda > 0 ? -1 : 1;
      g.y = 296 + Math.pow((g.x - 1010) / 95, 2) * 18;
      tr(cn.agama, `translate(${n1(g.x)},${n1(g.y - 6)}) scale(${vira},1)`); tr(cn.agC, `translate(0,${n1(dy)})`); tr(cn.agCab, `rotate(${n1(cab)} 10 -4)`);
    }
    function atualizarCena(dt) {
      const a = AMB;
      cn.nuvens.forEach((e, i) => { const m = meta.nuvens[i]; m.x += m.v * dt * (reduzido ? 0.4 : 1); if (m.x > 1800) m.x = -260; tr(e, `translate(${n1(m.x)},${m.y}) scale(${m.e})`); });
      tr(cn.raios, `rotate(${n1(tempo * 1.6 * a)} 300 360)`);
      aves.forEach((b, i) => { const m = b.m; m.x += m.v * dt; if (m.x > 1750) m.x = -150; b.x = m.x; b.y = m.y + 12 * Math.sin(tempo * 0.4 + m.f); const asa = 0.4 + 0.6 * Math.abs(Math.sin(tempo * (Math.sin(tempo * 0.3 + i) > 0.6 ? 5 : 1.1) + i)); tr(cn.aves[i], `translate(${n1(b.x)},${n1(b.y)}) scale(1,${n3(asa)})`); });
      cn.copas.forEach((e, i) => { const m = metaCopas[i]; tr(e, `rotate(${n1(0.9 * a * Math.sin(tempo * 0.6 + m.f) + 0.4 * a * Math.sin(tempo * 1.7 + m.f))} ${m.x} ${m.y + 100})`); });
      cn.ninhos.forEach((e, i) => { const m = metaNinhos[i]; tr(e, `rotate(${n1(5 * a * Math.sin(tempo * 1.2 + m.f) + 2 * a * Math.sin(tempo * 2.9 + m.f))} ${m.x} ${m.y})`); });
      cn.ervas.forEach((e, i) => { const m = meta.ervas[i]; tr(e, `rotate(${n1(3.5 * a * Math.sin(tempo * 1.1 + m.f) + 1.5 * a * Math.sin(tempo * 2.6 + m.f))} ${m.x} ${m.y})`); });
      molaElastica(ervaC, 0, 70, 3, dt);
      cn.ervasC.forEach((e, i) => { const m = meta.ervasC[i]; tr(e, `rotate(${n1(ervaC.x * (i % 2 ? -1 : 1) + 3 * a * Math.sin(tempo * 1.3 + m.f))} ${m.x} ${m.y})`); });
      cn.ervasT.forEach((e, i) => { const m = meta.ervasT[i]; tr(e, `rotate(${n1(4 * a * Math.sin(tempo * 1.5 + m.f) + ervaC.x * 0.5)} ${m.x} ${m.y})`); });
      ciscos.forEach((c, i) => {
        c.y -= c.v * dt * 0.6; c.x += (c.v * 0.8 + 6 * Math.sin(tempo * 0.5 + c.f)) * dt; if (c.y < 100 || c.x > 1500) { c.y = rnd(400, 780); c.x = rnd(80, 1300); }
        tr(cn.ciscos[i], `translate(${n1(c.x)},${n1(c.y)})`); opa(cn.ciscos[i], (0.35 + 0.35 * Math.sin(tempo * 1.3 + c.f * 3)) * a);
      });
      atualizarAgama(dt);
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
      const dur = clamp(0.26 - vel * 0.0003, 0.15, 0.26), lift = andar ? 12 + vel * 0.03 : 7;
      const algum = pes.some(p => p.sw);
      quieto = andar ? 0 : quieto + dt;
      if (!algum && saltoH < 0.5) {
        let melhor = -1, erroM = 0;
        for (const par of [0, 1]) {
          let erro = 0;
          for (let i = 0; i < 4; i++) if (PERNAS[i].par === par && livre(i)) { const t = predizer(pref[i][0], pref[i][1], dur * 0.5); erro = Math.max(erro, Math.hypot(pes[i].gx - t[0], pes[i].gz - t[1])); }
          if (erro > erroM) { erroM = erro; melhor = par; }
        }
        const lim = andar ? 16 : 7;
        if (melhor >= 0 && erroM > lim && (andar || quieto > 0.25)) {
          for (let i = 0; i < 4; i++) if (PERNAS[i].par === melhor && livre(i)) { const p = pes[i]; p.sw = true; p.t = 0; p.fx = p.gx; p.fz = p.gz; p.dur = dur; p.lift = lift; }
        }
      }
      for (let i = 0; i < 4; i++) {
        const p = pes[i], pn = PERNAS[i], at = pn.frente ? ombro : anca;
        if (p.sw || !livre(i) || saltoH > 0.5) continue;
        const dx = p.gx - X, dz = p.gz - Z, fu = dx * ct + dz * st;
        if (Math.hypot(fu - at[0], 14 - at[1]) > 0.95 * (pn.L[0] + pn.L[1] + pn.L[2]) || Math.abs(fu - at[0]) > 72) { p.sw = true; p.t = 0; p.fx = p.gx; p.fz = p.gz; p.dur = Math.min(dur, 0.18); p.lift = lift; }
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

    /* ---------- geometria: projetar e desenhar o leão ---------- */
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
      const cb = Math.cos(V.incl), sb = Math.sin(V.incl), hc = HC + V.alt + bob, fl = 0.9 * (1 - 0.3 * V.enrolar);   // enrolar: encolhe o corpo para se virar na caverna
      const loc = (pu, ph) => [pu * fl * cb - ph * sb, hc + pu * fl * sb + ph * cb];
      const ombro = loc(84, -20), anca = loc(-86, -24), pesc = loc(108, 34), cauR = loc(-138, 18), peitoP = loc(126, -4), garP = loc(-132, 0);
      const br = Math.sin(respFase) * V.resp;
      atualizarPassos(dt, ombro, anca);
      const zz = (uu, v) => uu * st + v * ct;
      // tronco (desenho de lado, achatado de frente; luz sempre de cima)
      const cw = (ct >= 0 ? 1 : -1) * Math.max(Math.abs(ct), 0.42), fr = 1 - Math.min(Math.abs(ct), 0.42) / 0.42;
      const ma = cw * cb * fl, mc = cw * sb * (1 - fr), mb = (KZ * st * cb - sb) * (1 - fr) * fl, md = KZ * st * sb + cb;
      tr(el.trM, `matrix(${n3(ma)},${n3(mb)},${n3(mc)},${n3(md)},${n1(X + sacX)},${n1(YB + KZ * Z - hc - saltoH)})`);
      tr(el.trR, `scale(${n3(1 + 0.004 * br)},${n3(1 + 0.02 * br)})`);
      partes.tronco.z = 0; partes.tronco.gz = Z;
      // peito e garupa vistos de frente/de trás
      const pp = P(peitoP[0], 0, peitoP[1]), sxp = passo(0.3, 0.95, st);
      const deit = clamp(-V.alt / 92, 0, 1) * V.fixF;
      tr(el.ptM, `translate(${n1(pp[0])},${n1(pp[1] - 20 * deit)}) scale(${n3(Math.pow(sxp, 0.85))},${n3((1 + 0.022 * br + Math.max(0, V.incl) * 0.35) * (1 - 0.45 * deit))})`);
      opa(el.ptM, passo(0, 0.08, sxp));
      if (el.ptC._so !== n3(passo(0.5, 0.85, st))) { el.ptC._so = n3(passo(0.5, 0.85, st)); el.ptC.setAttribute('stroke-opacity', el.ptC._so); }
      partes.peito.z = zz(peitoP[0], 0) + 1; partes.peito.gz = Z + zz(peitoP[0], 0);
      const pg = P(garP[0], 0, garP[1]), sxg = passo(0.2, 0.95, -st);
      opa(el.gaM, passo(0, 0.08, sxg));
      tr(el.gaM, `translate(${n1(pg[0])},${n1(pg[1])}) scale(${n3(Math.pow(sxg, 0.85))},1)`);
      if (el.gaC._so !== n3(passo(0.5, 0.85, -st))) { el.gaC._so = n3(passo(0.5, 0.85, -st)); el.gaC.setAttribute('stroke-opacity', el.gaC._so); }
      partes.garupa.z = zz(garP[0], 0) + 1; partes.garupa.gz = Z + zz(garP[0], 0);
      // pescoço (coberto de juba) e cabeça
      mola(cabBob, -bob * 1.2, 16, dt);
      const hu = pesc[0] + V.cabU, hh = pesc[1] + V.cabH + br * 1.6 + cabBob.x;
      const pn = P(pesc[0], 0, pesc[1]), ph = P(hu, 0, hh);
      segmento([el.pcM], pn, ph, 100);
      partes.pescoco.z = zz(pesc[0], 0) - 1; partes.pescoco.gz = Z + zz(pesc[0], 0);
      const roll = V.cabRoll;
      tr(el.cab, `translate(${n1(ph[0])},${n1(ph[1])}) rotate(${n1(roll * GRAU)})`);
      partes.cabeca.z = zz(hu, 0) + 50; partes.cabeca.gz = Z + zz(hu, 0);
      if (ultCab) {
        const k = 1 - Math.exp(-dt * 12);
        cabVel = lerp(cabVel, (ph[0] - ultCab[0]) / Math.max(dt, 1e-3), k); cabVelY = lerp(cabVelY, (ph[1] - ultCab[1]) / Math.max(dt, 1e-3), k);
      }
      ultCab = ph; cabPos = ph;
      for (let i = 0; i < 2; i++) molaElastica(orD[i], clamp(-cabVel * 0.05, -24, 24), 150, 7, dt);
      // juba: mola com balanço que fica para trás quando a cabeça se mexe (a «onda»)
      molaElastica(jub.x, clamp(-cabVel * 0.05, -26, 26), 70, 5, dt); molaElastica(jub.y, clamp(-cabVelY * 0.05, -22, 22), 70, 5, dt);
      jubaFase += dt * TAU * (0.35 + 0.08 * V.jAmp);
      // cabeça (feições)
      mola(olhos.x, olhoAlvo[0], 30, dt); mola(olhos.y, olhoAlvo[1], 30, dt);
      const fecho = Math.max(V.fecho, piscarV);
      const E = estadoCabeca({ phi: TH + V.cabYaw, nu: V.cabNod, boca: Math.max(V.boca, Dboca), lingua: V.lingua, lambe: V.lambe, feliz: V.feliz, fecho, esc: V.esc, dilata: V.dilata, vesgo: V.vesgo, orelhas: V.orelhas, achatar: V.achatar, orDin: [orD[0].x, orD[1].x], olhoX: olhos.x.x, olhoY: olhos.y.x, nariz: V.nariz * Math.sin(tempo * TAU * 7), juba: { lx: jub.x.x, ly: jub.y.x, fase: jubaFase, amp: V.jAmp, fofo: V.fofo } });
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
        opa(els.al, clamp(-st * 1.6 - 0.6, 0, 1) * clamp(fh / 5, 0, 1) * (pn2.frente ? 0 : 1) + (esp.i === i ? esp.w * 0.9 : 0) + (pn2.frente ? 0 : clamp((fh - 30) / 20, 0, 0.9)));
        opa(els.sb, clamp(-(pn2.v * ct) / 30, 0, 1) * 0.32);
        partes['perna' + i].z = zz(Math.max(at[0], pn2.frente ? fu + 10 : at[0]), pn2.v) + (pn2.frente && V.cruz > 0.5 ? (i === 0 ? 2 : -2) : 0);
        partes['perna' + i].gz = Z + zz(pn2.frente ? Math.max(at[0], fu) : at[0], pn2.v);
      }
      // cauda (onda: a ponta atrasa-se em relação à base; pode enrolar-se para o lado da câmara)
      let tu = cauR[0], tv = 0, th = cauR[1], ant = P(tu, tv, th), ang = 0, zMax = zz(tu, tv);
      const N = CW.length;
      for (let k = 0; k < N; k++) {
        const fase = cauFase - k * 0.5;
        const wv = ladoCauda * V.cauLado * Math.pow((k + 1) / N, 0.6) + V.cauAmp * Math.sin(fase) * (0.35 + 0.65 * k / (N - 1));
        const e = V.cauElev + V.incl * (1 - k / N) + k * V.cauCurl + 0.22 * V.cauAmp * Math.sin(fase + 1.2);
        tu += -Math.cos(e) * Math.cos(wv) * LC; tv += Math.cos(e) * Math.sin(wv) * LC; th = Math.max(CW[k] + 4, th + Math.sin(e) * LC);
        const cur = P(tu, tv, th);
        ang = segmento(caudaEl[k], ant, cur, LC);
        ant = cur; zMax = Math.max(zMax, zz(tu, tv));
      }
      for (const e of caudaEl[9]) tr(e, `translate(${n1(ant[0])},${n1(ant[1])}) rotate(${n1(ang)})`);
      partes.cauda.z = zMax + 2; partes.cauda.gz = Z + zz(cauR[0], 0);
      // sombra no chão
      const sh = P(0, 0, -saltoH);
      tr(el.sombra, `translate(${n1(sh[0])},${n1(YB + KZ * Z)}) scale(${n1((140 * Math.abs(ct) + 84 * Math.abs(st) + 30 + (V.alt < -60 ? 18 : 0)) * (1 - saltoH / 260))},${n1((16 + 10 * Math.abs(st)) * (1 - saltoH / 260))})`);
      opa(el.sombra, 1 - saltoH / 220);
      partes.sombra.z = -1e4; partes.sombra.gz = Z;
      partes.sombraCav.z = 6; partes.sombraCav.gz = -1;   // sombra da caverna: por cima das peças lá de dentro, por baixo da cabeça e das patas da frente
      ordenarERecortar();
    }
    const recorte = `url(#${u}recorte)`;
    let ordemAtual = '';
    function ordenarERecortar() {
      const lista = Object.keys(partes).sort((a, b) => partes[a].z - partes[b].z);
      const chave = lista.join();
      if (chave !== ordemAtual) { ordemAtual = chave; for (const k of lista) leaoG.appendChild(partes[k].el); }
      for (const k of lista) {
        const p = partes[k], r = cavModo && p.gz < 0;
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
      atualizarCena(dt); atualizarEventos(dt); atualizarPoeira(dt); atualizarSeixos(dt); saccades(dt); espasmoOrelha(dt);
      const A = Object.assign({}, EM_PE), D = { alt: 0, incl: 0, cabU: 0, cabH: 0, cabNod: 0, boca: 0 };
      if (modo === 'fora') comportamentoFora(dt, A);
      else if (modo === 'indo') correrIda(dt, A, D);
      else if (modo === 'dentro') comportamentoDentro(dt, A);
      else if (modo === 'voltando') correrVolta(dt, A, D);
      camadaEvento(A, D); camadaReacao(dt, A, D); camadaSom(dt, A, D);
      piscarV = piscar(dt);
      for (const k of CHAVES) { mola(S[k], A[k], OMEGA[k] || 9, dt); V[k] = S[k].x; }
      V.alt += D.alt; V.incl += D.incl; V.cabU += D.cabU; V.cabH += D.cabH; V.cabNod += D.cabNod; Dboca = D.boca;
      respFase += dt * TAU * V.respVel; cauFase += dt * TAU * V.cauVel;
      const kv = 1 - Math.exp(-dt * 14);
      velX = lerp(velX, (X - antX) / dt, kv); velZ = lerp(velZ, (Z - antZ) / dt, kv); velTh = lerp(velTh, angDif(antTh, TH) / dt, kv);
      antX = X; antZ = Z; antTh = TH;
      opa(cavFrente, modo === 'dentro' ? 1 : modo === 'indo' && seq ? passo(2.1, 2.7, seq.T) : modo === 'voltando' && seq ? 1 - passo(0.3, 0.75, seq.T) : 0);
      desenhar(dt);
    }
    quadro(16);
    const desligar = relogio ? relogio.aCada(quadro) : () => {};

    return {
      animal: leaoG,
      habitat,
      reagir() {
        if (destruido || modo === 'indo' || modo === 'voltando') return;
        reacao.ativa = true; reacao.t = 0;
        orD[0].v -= 160; orD[1].v += 160;
        if (modo === 'fora') {
          fora.acao = null; fora.prox = rnd(2.5, 4.5); esp.i = -1;
          if (!salto.ativo && !reduzido) { salto.ativo = true; salto.t = 0; salto.aterrou = false; }
        } else dentro.acao = null;
      },
      fazerSom(ms, silabas) {         // silabas = [[início s, duração s], …] medidas no som da app (ferramentas/limpar-voz.js)
        if (destruido) return;
        ms = Number(ms) || 1500;
        let lat;
        if (Array.isArray(silabas) && silabas.length) lat = silabas.map(([a, d]) => ({ a: +a || 0, d: Math.min(0.6, Math.max(0.1, +d || 0.25)), k: false }));
        else { const s = ms / 1000, n = clamp(Math.round(s / 0.7), 1, 4); lat = []; for (let i = 0; i < n; i++) lat.push({ a: 0.05 + i * s / n, d: Math.min(0.5, s / n * 0.6), k: false }); }
        som = { ativo: true, t: 0, lat, fim: lat[lat.length - 1].a + lat[lat.length - 1].d };
        if (modo === 'fora') { fora.acao = null; esp.i = -1; fora.prox = Math.max(fora.prox, 2.5); }
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
        estado: () => ({ modo, X, Z, TH, acao: fora.nome, pes: pes.map(p => p.sw), estica: estica.map(n3), pesG: pes.map(p => [n1(p.gx), n1(p.gz), p.sw ? 1 : 0]), nariz: narizPos.map(n1), cab: cabPos.map(n1), evento: ev.ativo && ev.ativo.tipo })
      },
      destruir() { destruido = true; try { desligar(); } catch (e) { /* nada */ } }
    };
  }

  return { icone: gerarIcone(), montar };
})();
