/* Cão — «Os Meus Animais». Contrato e regras: REGRAS-ANIMAIS.md.
   Cena: uma rua de bairro português (calçada, casas com azulejos, árvore, roupa a secar) com a casota num canteiro.
   O cão é um boneco «2,5D»: um esqueleto simples em 3D (tronco, pescoço, cabeça, 4 patas de 3 segmentos e cauda
   de 4 segmentos) projetado no ecrã em cada quadro. Por isso vira-se de verdade (de lado → de frente → de costas),
   os pés ficam presos ao chão enquanto anda (passos procedimentais) e entra na casota por camadas: as peças que
   estão para lá da porta são recortadas pela parede da frente. */
'use strict';
MODULOS.cao = (() => {
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
  function molaElastica(s, alvo, k, c, dt) {  // mola com balanço (orelhas, medalha, casota)
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

  /* =====================================================================================
     2. Medidas e poses do cão
     ===================================================================================== */
  const YB = 750;            // y do chão na linha da porta da casota (profundidade 0)
  const KZ = 0.18;           // quanto a profundidade (z) mexe no y do ecrã: vista ligeiramente de cima
  const HC = 150;            // altura do centro do tronco quando está em pé
  const R = 82;              // raio da cabeça
  const REP = { x: 610, z: 120, th: 0.35 };     // sítio de descanso na rua (virado a 3/4 para a direita)
  const PORTA = { x: 960 };                      // centro da porta da casota
  const CO = '#5E3315';                          // contorno castanho-escuro quente
  const NSS = 'vector-effect="non-scaling-stroke"';
  // Patas: frente/trás, lado (v > 0 = lado virado para nós quando olha para a direita), segmentos e par diagonal
  const PERNAS = [
    { frente: true, v: 34, L: [50, 52, 26], par: 0 },
    { frente: true, v: -34, L: [50, 52, 26], par: 1 },
    { frente: false, v: 40, L: [50, 50, 40], par: 1 },
    { frente: false, v: -40, L: [50, 50, 40], par: 0 },
  ];
  // Pose base (em pé). Todas as outras só dizem o que muda.
  const EM_PE = {
    alt: 0, incl: 0, cabU: 30, cabH: 110, cabYaw: 0.6, cabNod: 0, cabRoll: 0,
    dobraF: 0.84, dobraT: 0.7, fixF: 0, fixT: 0, pFU: 8, pTU: 30, pTV: 0, cruz: 0,
    cauElev: 0.85, cauCurl: 0.2, cauAmp: 0.32, cauVel: 1.5, cauLado: 0,
    orelhas: 0, fecho: 0, feliz: 0, esc: 1, sobr: 0, inclina: 0,
    boca: 0, lingua: 0, sorriso: 0.45, lambe: 0, nariz: 0, resp: 1, respVel: 0.3, enrolar: 0
  };
  const SENTADO = { alt: -40, incl: 0.55, cabU: 20, cabH: 122, dobraF: 0.86, dobraT: 0.4, fixT: 1, pTU: 40, pTV: 6, cauElev: -0.5, cauCurl: 0.1 };
  const DEITADO = { alt: -88, incl: 0, cabU: 25, cabH: 32, cabNod: 0.18, dobraF: 0.85, dobraT: 0.38, fixF: 1, fixT: 1, pFU: 40, pTU: 36, pTV: 22, cruz: 1, cauElev: -0.95, cauCurl: 0.08, cauAmp: 0.1, cauVel: 0.8, cauLado: 2.25, respVel: 0.22 };
  const AGACHADO = { alt: -72, incl: -0.04, cabU: 42, cabH: 14, cabNod: 0.25, dobraF: 0.6, dobraT: 0.5, cauElev: -0.15, cauCurl: 0.05, cauAmp: 0.22 };
  const VENIA = { alt: -22, incl: -0.42, cabU: 48, cabH: 40, cabNod: -0.1, dobraF: 0.85, fixF: 1, pFU: 62, cauElev: 1.05, cauCurl: 0.25, cauAmp: 0.6, cauVel: 3.6, feliz: 0.6, boca: 0.35, lingua: 0.45, sorriso: 1 };
  const CHAVES = Object.keys(EM_PE);
  const OMEGA = { fecho: 40, boca: 24, orelhas: 14, feliz: 14, cabYaw: 7, cauVel: 4, cauAmp: 6, resp: 4, respVel: 3, lingua: 12, esc: 12, sobr: 11, nariz: 14, lambe: 18, fixF: 12, fixT: 12, cruz: 6, cabU: 10, cabH: 10, incl: 8 };
  const misturar = (A, pose, w) => { if (w > 0) for (const k in pose) A[k] = lerp(A[k], pose[k], w); };

  /* =====================================================================================
     3. Desenho do cão — gradientes, patas, cauda, tronco, cabeça
     ===================================================================================== */
  function defsCao(u) {
    return `<linearGradient id="${u}pelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8CC8A"/><stop offset=".5" stop-color="#EAB06A"/><stop offset="1" stop-color="#C98444"/></linearGradient>
<linearGradient id="${u}perna" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F5C782"/><stop offset=".55" stop-color="#E2A55F"/><stop offset="1" stop-color="#C28041"/></linearGradient>
<radialGradient id="${u}coxa" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#F9D093"/><stop offset=".6" stop-color="#E5A962"/><stop offset="1" stop-color="#C38142"/></radialGradient>
<linearGradient id="${u}pata" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF2DA"/><stop offset="1" stop-color="#EAC48E"/></linearGradient>
<radialGradient id="${u}cabeca" cx=".38" cy=".3" r=".78"><stop offset="0" stop-color="#FCD89F"/><stop offset=".55" stop-color="#EDB46F"/><stop offset="1" stop-color="#CC8946"/></radialGradient>
<radialGradient id="${u}focinho" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#FFFCF4"/><stop offset=".65" stop-color="#FBE8C9"/><stop offset="1" stop-color="#E8C595"/></radialGradient>
<radialGradient id="${u}peito" cx=".45" cy=".25" r=".85"><stop offset="0" stop-color="#FFF8E8"/><stop offset=".7" stop-color="#F9E1B8"/><stop offset="1" stop-color="#E8C089"/></radialGradient>
<linearGradient id="${u}orelha" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#B36C34"/><stop offset=".6" stop-color="#8E4F24"/><stop offset="1" stop-color="#683416"/></linearGradient>
<radialGradient id="${u}iris" cx=".5" cy=".64" r=".62"><stop offset="0" stop-color="#B98243"/><stop offset=".55" stop-color="#6E3F18"/><stop offset="1" stop-color="#321807"/></radialGradient>
<radialGradient id="${u}nariz" cx=".35" cy=".28" r=".8"><stop offset="0" stop-color="#7C5E54"/><stop offset=".45" stop-color="#33211A"/><stop offset="1" stop-color="#130905"/></radialGradient>
<linearGradient id="${u}coleira" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2656E"/><stop offset=".5" stop-color="#D7343D"/><stop offset="1" stop-color="#9A1D29"/></linearGradient>
<radialGradient id="${u}ouro" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFF6C8"/><stop offset=".45" stop-color="#F6C850"/><stop offset="1" stop-color="#AE7B20"/></radialGradient>
<linearGradient id="${u}lingua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5919D"/><stop offset="1" stop-color="#DC5A76"/></linearGradient>
<radialGradient id="${u}almofada" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#8E655E"/><stop offset="1" stop-color="#4A2B27"/></radialGradient>
<radialGradient id="${u}sombra"><stop offset="0" stop-color="#3A2614" stop-opacity=".5"/><stop offset=".6" stop-color="#3A2614" stop-opacity=".24"/><stop offset="1" stop-color="#3A2614" stop-opacity="0"/></radialGradient>
<clipPath id="${u}olho"><ellipse rx="16" ry="19"/></clipPath>`;
  }

  // Uma pata: 3 camadas (contorno por baixo de tudo → as articulações não mostram costuras; pelo; sombra do lado longe)
  function svgPerna(u, frente) {
    const segs = frente ? [[44, 50], [34, 52], [30, 26]] : [[0, 50], [34, 50], [28, 40]];
    const forma = (i, e) => (!frente && i === 0)
      ? `<ellipse cy="20" rx="${35 + e}" ry="${45 + e}"/>`
      : `<rect x="${-(segs[i][0] / 2 + e)}" y="${-(segs[i][0] / 2 + e)}" width="${segs[i][0] + 2 * e}" height="${segs[i][1] + segs[i][0] + 2 * e}" rx="${segs[i][0] / 2 + e}"/>`;
    const detalhe = i => {
      if (i === 0 && !frente) return `<path d="M-24,40 C-14,54 2,60 18,56" fill="none" stroke="#C07C3E" stroke-width="3" stroke-linecap="round" opacity=".55"/><path d="M-20,-8 C-10,-20 8,-22 20,-14" fill="none" stroke="#FFE4B4" stroke-width="3" stroke-linecap="round" opacity=".6"/><path d="M26,30 C30,40 28,52 22,60" fill="none" stroke="#C07C3E" stroke-width="2.5" stroke-linecap="round" opacity=".45"/>`;
      if (i === 0) return `<path d="M-14,36 C-24,44 -24,56 -16,64" fill="none" stroke="#C07C3E" stroke-width="3" stroke-linecap="round" opacity=".5"/><path d="M8,-6 C12,10 12,30 8,46" fill="none" stroke="#FFE4B4" stroke-width="3" stroke-linecap="round" opacity=".5"/>`;
      return `<path d="M${segs[i][0] * 0.18},${4} L${segs[i][0] * 0.18},${segs[i][1] - 6}" stroke="#FAD9A6" stroke-width="4" stroke-linecap="round" opacity=".45"/>`;
    };
    let c = '', f = '', s = '';
    for (let i = 0; i < 3; i++) {
      c += `<g class="g${i}">${forma(i, 3.5)}</g>`;
      f += `<g class="g${i}" fill="url(#${u}${!frente && i === 0 ? 'coxa' : 'perna'})">${forma(i, 0)}${detalhe(i)}</g>`;
      s += `<g class="g${i}">${forma(i, 0)}</g>`;
    }
    c += `<g class="g3"><g class="pe"><ellipse rx="29.5" ry="18.5"/></g></g>`;
    f += `<g class="g3"><g class="pe"><ellipse rx="26" ry="15" fill="url(#${u}pata)"/><ellipse cx="-7" cy="-6" rx="12" ry="4.5" fill="#fff" opacity=".5"/>
<g class="dl" fill="none" stroke="${CO}" stroke-width="2.6" stroke-linecap="round"><path d="M6,-10 C9,-3 9,4 7,11"/><path d="M15,-8 C18,-2 18,5 16,10"/><ellipse cx="23.5" cy="7" rx="2.8" ry="1.8" fill="#D8B98C" stroke="none"/><ellipse cx="13" cy="12.5" rx="2.6" ry="1.6" fill="#D8B98C" stroke="none"/></g>
<g class="df" fill="none" stroke="${CO}" stroke-width="2.6" stroke-linecap="round"><path d="M-8,-4 C-9,2 -9,7 -8,13"/><path d="M8,-4 C9,2 9,7 8,13"/><ellipse cx="-15" cy="11" rx="2.6" ry="1.7" fill="#D8B98C" stroke="none"/><ellipse cx="0" cy="13.5" rx="2.6" ry="1.7" fill="#D8B98C" stroke="none"/><ellipse cx="15" cy="11" rx="2.6" ry="1.7" fill="#D8B98C" stroke="none"/></g>
<g class="al" opacity="0" fill="url(#${u}almofada)"><path d="M-11,6 C-13,-3 13,-3 11,6 C9,12 -9,12 -11,6Z"/><circle cx="-14" cy="-6" r="4"/><circle cx="-5" cy="-10" r="4"/><circle cx="5" cy="-10" r="4"/><circle cx="14" cy="-6" r="4"/></g></g></g>`;
    s += `<g class="g3"><g class="pe"><ellipse rx="26" ry="15"/></g></g>`;
    return `<g fill="${CO}">${c}</g><g>${f}</g><g class="sb" fill="#4A2408" opacity="0">${s}</g>`;
  }

  function svgCauda(u) {
    const ws = [28, 25, 21, 17];
    let c = '', f = '';
    ws.forEach((w, i) => {
      c += `<g class="k${i}"><rect x="${-w / 2 - 3.5}" y="${-w / 2 - 3.5}" width="${w + 7}" height="${26 + w + 7}" rx="${w / 2 + 3.5}"/></g>`;
      f += `<g class="k${i}"><rect x="${-w / 2}" y="${-w / 2}" width="${w}" height="${26 + w}" rx="${w / 2}"/>${i === 1 ? '<path d="M-3,4 L-3,24" stroke="#FFE4B4" stroke-width="3" stroke-linecap="round" opacity=".5"/>' : ''}</g>`;
    });
    const tufo = 'M-11,-4 C-16,10 -12,24 -2,36 C0,29 5,27 10,31 C12,20 15,8 9,-4Z';
    c += `<g class="k4"><path d="${tufo}" stroke="${CO}" stroke-width="7" stroke-linejoin="round"/></g>`;
    f += `<g class="k4"><path d="${tufo}" fill="#F7D6A2"/><path d="M-2,4 C-4,14 -2,22 1,28" fill="none" stroke="#E2A55F" stroke-width="2.5" stroke-linecap="round"/></g>`;
    return `<g fill="${CO}">${c}</g><g fill="url(#${u}perna)">${f}</g>`;
  }

  const TRONCO_D = 'M-130,-4 C-133,-42 -104,-62 -64,-60 C-24,-58 22,-63 62,-62 C104,-61 134,-38 136,-4 C138,28 120,54 90,61 C60,68 30,58 2,57 C-34,56 -70,66 -100,54 C-124,44 -128,24 -130,-4Z';
  function svgTronco(u) {
    const tufo = x => `<path d="M${x},56 C${x + 2},68 ${x + 8},72 ${x + 12},59" fill="#F7DCAE" stroke="${CO}" stroke-width="3" stroke-linejoin="round" ${NSS}/>`;
    return `<g class="trM"><g class="trR">
<path d="${TRONCO_D}" fill="url(#${u}pelo)" stroke="${CO}" stroke-width="5" stroke-linejoin="round" ${NSS}/>
<path d="M-98,34 C-72,50 -26,46 6,48 C46,50 86,42 112,30 C106,52 86,62 60,65 C30,67 2,59 -30,59 C-62,59 -88,56 -98,34Z" fill="#F7DCAE"/>
<path d="M98,-24 C120,-16 133,8 128,32 C121,50 100,60 80,58 C94,40 98,10 98,-24Z" fill="#F8DDB0"/>
<path d="M-114,-34 C-92,-58 -42,-56 0,-56 C42,-58 84,-60 108,-46 C84,-46 42,-43 0,-43 C-42,-41 -84,-40 -114,-34Z" fill="#CF8C48" opacity=".5"/>
<ellipse cx="-6" cy="-42" rx="74" ry="10" fill="#FFE9C2" opacity=".5"/>
<g fill="none" stroke-linecap="round" ${NSS}>
<path d="M120,18 C128,30 126,42 118,50" stroke="#C07C3E" stroke-width="3" opacity=".7"/>
<path d="M58,-30 C72,-14 74,6 66,22" stroke="#D29350" stroke-width="3" opacity=".6"/>
<path d="M-70,-34 C-90,-14 -92,10 -80,28" stroke="#C07C3E" stroke-width="3" opacity=".55"/>
<path d="M-30,-30 C-18,-36 -4,-36 8,-32" stroke="#FFE1B0" stroke-width="2.5" opacity=".8"/>
<path d="M20,-22 C32,-27 44,-26 54,-20" stroke="#FFE1B0" stroke-width="2.5" opacity=".8"/>
<path d="M-40,8 C-30,16 -16,18 -4,16" stroke="#D29350" stroke-width="2.5" opacity=".45"/>
</g>${tufo(10)}${tufo(32)}${tufo(54)}${tufo(-60)}
</g></g>`;
  }
  function svgPeito(u) {
    return `<g class="ptM"><path class="ptC" d="M0,-60 C40,-60 66,-34 66,0 C66,36 42,62 0,64 C-42,62 -66,36 -66,0 C-66,-34 -40,-60 0,-60Z" fill="url(#${u}pelo)" stroke="${CO}" stroke-width="5" ${NSS}/>
<path d="M-40,-44 C-24,-56 24,-56 40,-44 C56,-14 52,26 32,50 L22,42 L14,58 L4,46 L-6,58 L-14,44 L-24,54 C-50,30 -56,-14 -40,-44Z" fill="url(#${u}peito)"/>
<g fill="none" stroke="#E2B97E" stroke-width="2.5" stroke-linecap="round" ${NSS}><path d="M-16,-22 C-12,-8 -14,6 -20,18"/><path d="M14,-20 C10,-6 12,8 18,20"/><path d="M0,-6 C2,6 0,18 -3,28"/></g></g>`;
  }
  function svgGarupa(u) {
    return `<g class="gaM"><path class="gaC" d="M0,-52 C40,-58 68,-30 66,6 C64,40 38,60 0,54 C-38,60 -64,40 -66,6 C-68,-30 -40,-58 0,-52Z" fill="url(#${u}pelo)" stroke="${CO}" stroke-width="5" ${NSS}/>
<path d="M0,8 C1,24 2,38 0,52" fill="none" stroke="${CO}" stroke-width="3" opacity=".45" ${NSS}/>
<path d="M-48,20 C-40,42 -22,52 -6,50" fill="none" stroke="#F7DCAE" stroke-width="7" stroke-linecap="round" opacity=".85" ${NSS}/><path d="M48,20 C40,42 22,52 6,50" fill="none" stroke="#F7DCAE" stroke-width="7" stroke-linecap="round" opacity=".85" ${NSS}/>
<ellipse cx="-14" cy="-34" rx="30" ry="8" fill="#FFE9C2" opacity=".45"/></g>`;
  }
  function svgPescoco(u) {
    return `<g class="pcM"><rect x="-46" y="-22" width="92" height="132" rx="40" fill="url(#${u}perna)" stroke="${CO}" stroke-width="5" ${NSS}/>
<path d="M-26,10 C-30,30 -28,50 -22,70" fill="none" stroke="#FFE1B0" stroke-width="3" stroke-linecap="round" opacity=".5" ${NSS}/></g>
<g class="col"><path d="M-50,-9 Q0,8 50,-9 L50,8 Q0,25 -50,8Z" fill="url(#${u}coleira)" stroke="#7A1520" stroke-width="2.6" stroke-linejoin="round"/>
<path d="M-44,-1 Q0,15 44,-1" fill="none" stroke="#FFC2C6" stroke-width="1.5" stroke-dasharray="4 4" opacity=".9"/>
<path d="M-46,-5 Q0,10 46,-5" fill="none" stroke="#fff" stroke-width="2" opacity=".35"/></g>`;
  }
  function svgMedalha(u) {
    return `<g class="md"><circle r="5" fill="none" stroke="#C9952E" stroke-width="3"/><g class="mdP">
<circle cy="16" r="11.5" fill="url(#${u}ouro)" stroke="#83600F" stroke-width="2.2"/>
<path d="M-5,16 L5,16" stroke="#B8862A" stroke-width="3" stroke-linecap="round"/><circle cx="-6" cy="14" r="2" fill="#B8862A"/><circle cx="-6" cy="18" r="2" fill="#B8862A"/><circle cx="6" cy="14" r="2" fill="#B8862A"/><circle cx="6" cy="18" r="2" fill="#B8862A"/>
<ellipse cx="-4" cy="11" rx="3.6" ry="2" fill="#fff" opacity=".85"/></g></g>`;
  }

  /* ---------- Cabeça: cada feição está «colada» a uma esfera e é projetada com a direção da cabeça ---------- */
  function estadoCabeca(p) {
    const cf = Math.cos(p.phi), sf = Math.sin(p.phi), cn = Math.cos(p.nu), sn = Math.sin(p.nu);
    const pr = (f, l, w) => { const ff = f * cn + w * sn, uu = -f * sn + w * cn, x = ff * cf - l * sf, z = ff * sf + l * cf; return [x, -uu + KZ * z, z]; };
    const dir = (lam, el, r) => [r * Math.cos(el) * Math.cos(lam), r * Math.cos(el) * Math.sin(lam), r * Math.sin(el)];
    const t = {}, op = {}, d = {};
    const fz = pr(1, 0, 0)[2];
    op.rosto = passo(-0.55, -0.15, fz);
    const ladoV = sf >= 0 ? 1 : -1;
    for (let i = 0; i < 2; i++) {
      const s = i ? -1 : 1;
      // olhos
      const q = pr(...dir(0.5 * s, 0.3, 0.84 * R));
      const zn = q[2] / (0.84 * R), fs = zn > 0.03 ? Math.pow(zn, 0.55) : 0;
      t['olho' + i] = `translate(${n1(q[0])},${n1(q[1])}) scale(${n3(fs * p.esc)},${n3(p.esc)})`;
      t['iris' + i] = `translate(${n1(p.olhoX)},${n1(p.olhoY)})`;
      t['psup' + i] = `translate(0,${n1(lerp(-21, 17, clamp(p.fecho, 0, 1)))})`;
      t['pinf' + i] = `translate(0,${n1(lerp(25, 3, clamp(p.feliz, 0, 1)))})`;
      // sobrancelhas
      const qb = pr(...dir(0.47 * s, 0.64, 0.93 * R)), zb = clamp(qb[2] / (0.93 * R), 0, 1), lado = -s * ladoV;
      t['sobr' + i] = `translate(${n1(qb[0])},${n1(qb[1] - p.sobr * 5)}) rotate(${n1(lado * (p.inclina * 16 - p.sobr * 4))}) scale(${n3(lado * (zb > 0.03 ? Math.pow(zb, 0.6) : 0))},1)`;
      // orelhas (caídas; a de longe vai para trás do crânio quando o cão está de perfil)
      const qe = pr(...dir(1.75 * s, 0.54, R)), zl = s * cf, longe = zl < 0 ? -zl : 0;
      const sg = clamp((-s * sf - 0.5 * cf) * 2.5, -1, 1);
      const ang = -sg * (9 + p.perk * 36) + p.orDin[i] - p.rollDeg * 0.85;
      t['orelha' + i] = `translate(${n1(qe[0] + sg * longe * 30)},${n1(qe[1] - p.perk * 6)}) rotate(${n1(ang)}) scale(${n3(1 - longe * 0.3)},${n3(1 - p.perk * 0.14)})`;
      op['orelhaF' + i] = 1 - passo(0.12, 0.4, longe);   // a cópia da frente desvanece e fica a de trás do crânio
    }
    const qt = pr(0.3 * R, 0, 0.96 * R);
    t.topete = `translate(${n1(qt[0])},${n1(qt[1])})`;
    const qm = pr(0.66 * R, 0, -0.3 * R);
    t.focinho = `translate(${n1(qm[0])},${n1(qm[1])})`;
    const qn = pr(0.66 * R + 36, 0, -0.1 * R), fzp = clamp(fz, 0, 1);
    t.nariz = `translate(${n1(qn[0])},${n1(qn[1] - p.nariz * 1.5)}) scale(${n3((0.55 + 0.45 * fzp) * (1 + p.nariz * 0.07))},${n3(1 + p.nariz * 0.05)})`;
    // boca: duas metades, cada uma num plano dobrado à volta do focinho
    const qo = pr(0.66 * R + 38, 0, -0.34 * R), e2 = pr(0, 0, -1);
    for (const [k, sg] of [['bE', -1], ['bD', 1]]) {
      const e1 = pr(-0.42, -sg, 0);
      t[k] = `matrix(${n3(e1[0])},${n3(e1[1])},${n3(e2[0])},${n3(e2[1])},${n1(qo[0])},${n1(qo[1])})`;
      op[k] = passo(-0.12, 0.2, pr(0.5, -sg * 0.86, 0)[2]);
    }
    const et = pr(0, -1, 0), etx = Math.abs(et[0]) < 0.6 ? ladoV * 0.6 : et[0];
    t.lingua = `matrix(${n3(etx)},${n3(et[1])},${n3(e2[0])},${n3(e2[1])},${n1(qo[0])},${n1(qo[1])})`;
    const J = clamp(p.boca, 0, 1.2) * 40, sor = p.sorriso, cy = 2 - sor * 9, c2 = 13 - 3 * sor;
    d.labio = `M0,-13L0,0C5,12 22,${n1(c2)} 34,${n1(cy)}`;
    if (J > 1.2) {
      d.interior = `M0,0C5,12 22,${n1(c2)} 34,${n1(cy)}C26,${n1(10 + J * 0.45)} 8,${n1(J + 4)} 0,${n1(J + 4)}Z`;
      d.labioInf = `M0,${n1(J + 4)}C8,${n1(J + 4)} 26,${n1(10 + J * 0.45)} 34,${n1(cy)}`;
    } else { d.interior = 'M0,0Z'; d.labioInf = 'M0,0Z'; }
    d.queixo = `M0,${n1(J + 2)}C12,${n1(J + 2)} 27,${n1(8 + J * 0.45)} 33,${n1(cy + 3)}C33,${n1(J * 0.4 + 18)} 16,${n1(J + 19)} 0,${n1(J + 19)}Z`;
    d.queixoC = `M33,${n1(cy + 3)}C33,${n1(J * 0.4 + 18)} 16,${n1(J + 19)} 0,${n1(J + 19)}`;
    d.dentes = `M21.5,${n1(11.6 - 2.5 * sor)}l3.4,6.6l3.2,-7.4Z`;
    op.dentes = passo(0.22, 0.45, p.boca);
    op.lingua = (p.boca > 0.25 || p.lingua > 0.03 || p.lambe > 0.03) ? 1 : 0;
    const yt = J * 0.5 + 3 - p.lambe * 30, Lg = p.lingua * 36 + 4;
    d.lingua = `M-15,${n1(yt)}C-15,${n1(yt - 9)} 15,${n1(yt - 9)} 15,${n1(yt)}L15,${n1(yt + Lg)}C15,${n1(yt + Lg + 13)} -15,${n1(yt + Lg + 13)} -15,${n1(yt + Lg)}Z`;
    d.linguaS = `M0,${n1(yt - 3)}L0,${n1(yt + Lg + 5)}`;
    return { t, op, d };
  }

  const CRANIO_D = 'M0,-80 C47,-80 84,-50 85,-8 C86,30 66,64 34,75 C18,81 -18,81 -34,75 C-66,64 -86,30 -85,-8 C-84,-50 -47,-80 0,-80Z';
  function svgCabeca(u, E) {
    const T = k => (E.t[k] ? ` transform="${E.t[k]}"` : '');
    const O = k => (E.op[k] !== undefined ? ` opacity="${n3(E.op[k])}"` : '');
    const orelha = (i, f) => `<g class="orelha o${i}${f ? ' f' : ''}"${T('orelha' + i)}${f ? O('orelhaF' + i) : ''}>
<path d="M-17,-10 C-33,4 -38,50 -29,82 C-25,96 -18,104 -10,99 C-5,108 6,108 9,99 C16,104 25,98 27,86 C37,58 33,8 19,-10 C9,-18 -7,-18 -17,-10Z" fill="url(#${u}orelha)" stroke="${CO}" stroke-width="4.5" stroke-linejoin="round"/>
<path d="M-6,6 C-15,32 -14,64 -5,88" fill="none" stroke="#4E250C" stroke-width="3" stroke-linecap="round" opacity=".45"/>
<path d="M11,2 C19,26 21,56 15,80" fill="none" stroke="#C9874A" stroke-width="4" stroke-linecap="round" opacity=".55"/>
<path d="M2,-6 C6,-12 12,-12 15,-6" fill="none" stroke="#E2A55F" stroke-width="3" stroke-linecap="round" opacity=".7"/></g>`;
    const olho = i => `<g class="olho l${i}"${T('olho' + i)}><ellipse rx="22.5" ry="25.5" fill="#B5732F" opacity=".26"/><g clip-path="url(#${u}olho)">
<ellipse rx="16" ry="19" fill="#FFFDF7"/>
<g class="iris"${T('iris' + i)}><circle r="13.6" fill="url(#${u}iris)"/><circle r="13.6" fill="none" stroke="#2A1406" stroke-width="1.6"/><circle r="7.6" fill="#130904"/><circle cx="-4.6" cy="-6.2" r="4.9" fill="#fff"/><circle cx="5.2" cy="4.8" r="2.3" fill="#fff" opacity=".92"/></g>
<ellipse cy="-14" rx="17" ry="8" fill="#4A2A14" opacity=".2"/>
<ellipse rx="16" ry="19" fill="none" stroke="#2E1708" stroke-width="5"/>
<g class="psup"${T('psup' + i)}><path d="M-26,-72 L26,-72 L26,-2 C14,6 -14,6 -26,-2Z" fill="#E6AC66"/><path d="M-19,0 C-9,6 9,6 19,0" fill="none" stroke="#2E1708" stroke-width="3.4" stroke-linecap="round"/></g>
<g class="pinf"${T('pinf' + i)}><path d="M-26,72 L26,72 L26,2 C14,-9 -14,-9 -26,2Z" fill="#EDB673"/><path d="M-17,-1 C-8,-7 8,-7 17,-1" fill="none" stroke="#A86A34" stroke-width="2.2" opacity=".85"/></g>
</g></g>`;
    const sobr = i => `<g class="sobr s${i}"${T('sobr' + i)}><path d="M-13,4 C-7,-4 7,-5 13,0" fill="none" stroke="#A4612C" stroke-width="6.5" stroke-linecap="round"/><path d="M-10,1 C-5,-3 5,-4 10,-1" fill="none" stroke="#D99A55" stroke-width="2.2" stroke-linecap="round" opacity=".7"/></g>`;
    const metade1 = k => `<g class="${k}1"${T(k)}${O(k)}><path class="queixo" d="${E.d.queixo}" fill="#FBE6C4"/><path class="queixoC" d="${E.d.queixoC}" fill="none" stroke="${CO}" stroke-width="3" stroke-linecap="round"/><path class="interior" d="${E.d.interior}" fill="#5E1B22" stroke="${CO}" stroke-width="2" stroke-linejoin="round"/></g>`;
    const metade2 = k => `<g class="${k}2"${T(k)}${O(k)}><path class="dentes" d="${E.d.dentes}" fill="#FFFDF5" opacity="${n3(E.op.dentes)}"/>
<path class="labio" d="${E.d.labio}" fill="none" stroke="#3E1E0E" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
<path class="labioInf" d="${E.d.labioInf}" fill="none" stroke="#3E1E0E" stroke-width="2.6" stroke-linecap="round"/>
<g fill="#A8744A"><circle cx="12" cy="-7" r="1.9"/><circle cx="20" cy="-5" r="1.9"/><circle cx="16" cy="-1" r="1.7"/></g>
<g fill="none" stroke="#8A5A35" stroke-width="1.4" stroke-linecap="round" opacity=".55"><path d="M22,-6 C34,-11 46,-11 60,-7"/><path d="M22,-2 C34,-2 46,1 58,5"/></g></g>`;
    return `<g class="slotTras">${orelha(0, false)}${orelha(1, false)}</g>
<path d="${CRANIO_D}" fill="url(#${u}cabeca)" stroke="${CO}" stroke-width="5" stroke-linejoin="round"/>
<path d="M-79,24 C-92,30 -95,38 -86,42 C-95,48 -90,58 -79,55 C-77,62 -68,64 -62,58" fill="#E4A762" stroke="${CO}" stroke-width="4" stroke-linejoin="round"/>
<path d="M79,24 C92,30 95,38 86,42 C95,48 90,58 79,55 C77,62 68,64 62,58" fill="#DA9C58" stroke="${CO}" stroke-width="4" stroke-linejoin="round"/>
<ellipse cx="-26" cy="-50" rx="26" ry="12" fill="#FFF1D2" opacity=".45" transform="rotate(-20 -26 -50)"/>
<g class="topete"${T('topete')}><path d="M-14,8 C-14,0 -10,-8 -4,-13 C-4,-7 0,-6 3,-12 C5,-6 9,-6 12,-10 C13,-2 12,4 9,8" fill="#EFB873" stroke="${CO}" stroke-width="3.2" stroke-linejoin="round"/></g>
<g class="rosto"${O('rosto')}>${olho(0)}${olho(1)}${sobr(0)}${sobr(1)}
<g class="focinho"${T('focinho')}><ellipse rx="49" ry="37" fill="url(#${u}focinho)" stroke="${CO}" stroke-width="4.5"/><ellipse cx="-15" cy="-17" rx="18" ry="7" fill="#fff" opacity=".6"/></g>
${metade1('bE')}${metade1('bD')}
<g class="lingua"${T('lingua')}${O('lingua')}><path class="lg" d="${E.d.lingua}" fill="url(#${u}lingua)" stroke="#A8384F" stroke-width="2.4"/><path class="lgS" d="${E.d.linguaS}" fill="none" stroke="#C24763" stroke-width="2.2" stroke-linecap="round"/></g>
${metade2('bE')}${metade2('bD')}
<g class="nariz"${T('nariz')}><path d="M-21,-5 C-21,-17 21,-17 21,-5 C21,7 9,15 0,16 C-9,15 -21,7 -21,-5Z" fill="url(#${u}nariz)" stroke="#120804" stroke-width="2"/>
<path d="M-12,1 C-9,5 -5,6 -3,4" fill="none" stroke="#000" stroke-width="2.6" stroke-linecap="round" opacity=".75"/><path d="M12,1 C9,5 5,6 3,4" fill="none" stroke="#000" stroke-width="2.6" stroke-linecap="round" opacity=".75"/>
<ellipse cx="-8" cy="-9" rx="7" ry="3.6" fill="#fff" opacity=".8"/><ellipse cx="7" cy="-10" rx="2.5" ry="1.5" fill="#fff" opacity=".6"/></g>
</g>
<g class="slotFrente">${orelha(0, true)}${orelha(1, true)}</g>`;
  }

  // Ordem inicial das peças (depois é reordenada em cada quadro pela profundidade)
  function svgCao(u, E) {
    const pt = (nome, c) => `<g class="pt" data-p="${nome}">${c}</g>`;
    return `<g class="cao">${pt('sombra', `<ellipse class="sombra" rx="1" ry="1" fill="url(#${u}sombra)"/>`)}
${PERNAS.map((p, i) => pt('perna' + i, svgPerna(u, p.frente))).join('')}
${pt('cauda', svgCauda(u))}${pt('pescoco', svgPescoco(u))}${pt('tronco', svgTronco(u))}${pt('garupa', svgGarupa(u))}${pt('peito', svgPeito(u))}${pt('medalha', svgMedalha(u))}
${pt('cabeca', `<g class="cab">${svgCabeca(u, E)}</g>`)}</g>`;
  }

  const CAB0 = { phi: 0.95, nu: 0, boca: 0, lingua: 0, sorriso: 0.45, feliz: 0, fecho: 0, esc: 1, sobr: 0, inclina: 0, perk: 0, orDin: [0, 0], olhoX: 0, olhoY: 0, nariz: 0, lambe: 0, rollDeg: 0 };

  /* ---------- Ícone do menu (parado): retrato da cabeça com o peito e a coleira ---------- */
  function gerarIcone() {
    const u = 'cao-icone-';
    const E = estadoCabeca(Object.assign({}, CAB0, { phi: 1.22, nu: 0.04, boca: 0.32, lingua: 0.55, sorriso: 1, feliz: 0.12, esc: 1.05, sobr: 0.25, inclina: 0.25, perk: 0.12, olhoX: 1.2, olhoY: 1.4, rollDeg: -6 }));
    return `<defs>${defsCao(u)}<radialGradient id="${u}fundo" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#E4F4FC"/><stop offset="1" stop-color="#B9E0F4"/></radialGradient><clipPath id="${u}disco"><circle cx="110" cy="112" r="100"/></clipPath></defs>
<circle cx="110" cy="112" r="100" fill="url(#${u}fundo)"/>
<g clip-path="url(#${u}disco)"><path d="M10,186 Q110,170 210,186 V230 H10Z" fill="#EDE7DA"/><path d="M10,198 Q60,190 110,198 T210,198 V208 Q160,200 110,208 T10,208Z" fill="#3B3B40" opacity=".85"/>
<g transform="translate(110,214) scale(.86,.8)">${svgPeito(u)}</g>
<g transform="translate(110,160) scale(.86)"><path d="M-50,-9 Q0,8 50,-9 L50,8 Q0,25 -50,8Z" fill="url(#${u}coleira)" stroke="#7A1520" stroke-width="2.6" stroke-linejoin="round"/><path d="M-44,-1 Q0,15 44,-1" fill="none" stroke="#FFC2C6" stroke-width="1.5" stroke-dasharray="4 4"/></g>
<g transform="translate(110,172)">${svgMedalha(u)}</g></g>
<g transform="translate(110,92) rotate(-6) scale(.8)">${svgCabeca(u, E)}</g>`;
  }

  /* =====================================================================================
     4. Cenário — rua de bairro, casa da casota, objetos dos acontecimentos
     ===================================================================================== */
  const PORTA_D = 'M860,750L860,630A100,100 0 0 1 1060,630L1060,750Z';
  const PAREDE_D = 'M800,750L800,548L960,418L1120,548L1120,750Z';
  const SILHUETA_D = 'M800,750L800,578L764,584L764,506L960,342L1156,506L1156,584L1120,578L1120,750Z';
  const CANTEIRO_D = 'M728,704 C752,664 860,652 1000,654 C1150,652 1296,662 1338,700 C1354,740 1342,780 1300,790 C1150,806 860,808 760,794 C724,788 714,742 728,704Z';

  function ladrilhos(w, h, cols, rows, cores, rng, brilho) {   // pedras da calçada (um mosaico que se repete)
    const cw = w / cols, ch = h / rows; let s = '';
    for (let j = 0; j < rows; j++) for (let i = -1; i <= cols; i++) {
      const ox = (j % 2) * cw / 2, x0 = i * cw + ox, y0 = j * ch, g = 1.7, jj = () => (rng() - 0.5) * 2.4;
      const p = [[x0 + g + jj(), y0 + g + jj()], [x0 + cw - g + jj(), y0 + g + jj()], [x0 + cw - g + jj(), y0 + ch - g + jj()], [x0 + g + jj(), y0 + ch - g + jj()]];
      const cor = cores[Math.floor(rng() * cores.length)];
      s += `<path d="M${p.map(q => n1(q[0]) + ',' + n1(q[1])).join('L')}Z" fill="${cor}" stroke="${cor}" stroke-width="2.6" stroke-linejoin="round"/>`;
      s += `<path d="M${n1(p[0][0])},${n1(p[0][1] + 1)}L${n1(p[1][0])},${n1(p[1][1] + 1)}" stroke="${brilho}" stroke-width="1.4" opacity=".55" stroke-linecap="round"/>`;
    }
    return s;
  }

  function defsCena(u) {
    const rng = semente(11);
    const az = (id, fundo, cor, cor2) => `<pattern id="${u}${id}" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="${fundo}"/>
<path d="M14,5 C17.5,9.5 17.5,11 14,14 C10.5,11 10.5,9.5 14,5Z M23,14 C18.5,17.5 17,17.5 14,14 C17,10.5 18.5,10.5 23,14Z M14,23 C10.5,18.5 10.5,17 14,14 C17.5,17 17.5,18.5 14,23Z M5,14 C9.5,10.5 11,10.5 14,14 C11,17.5 9.5,17.5 5,14Z" fill="${cor}"/>
<circle cx="14" cy="14" r="2.2" fill="${cor2}"/><path d="M0,6 A6,6 0 0 0 6,0 M22,0 A6,6 0 0 0 28,6 M28,22 A6,6 0 0 0 22,28 M6,28 A6,6 0 0 0 0,22" fill="none" stroke="${cor}" stroke-width="2.2"/>
<path d="M0,.5H28M.5,0V28" stroke="#C9D0DC" stroke-width="1"/></pattern>`;
    return `<linearGradient id="${u}ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7CC2EE"/><stop offset=".45" stop-color="#B6DFF5"/><stop offset="1" stop-color="#F4EAD3"/></linearGradient>
<radialGradient id="${u}sol"><stop offset="0" stop-color="#FFF8D4" stop-opacity="1"/><stop offset=".22" stop-color="#FFEBA0" stop-opacity=".6"/><stop offset="1" stop-color="#FFE9A0" stop-opacity="0"/></radialGradient>
<linearGradient id="${u}nuvem" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".65" stop-color="#F4F8FC"/><stop offset="1" stop-color="#D3E3F0"/></linearGradient>
<linearGradient id="${u}colina" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#AFC6CB"/><stop offset="1" stop-color="#CBD8D6"/></linearGradient>
<linearGradient id="${u}fachada" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".16"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="1" stop-color="#3A2A1A" stop-opacity=".1"/></linearGradient>
<linearGradient id="${u}beiral" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1A0C" stop-opacity=".28"/><stop offset="1" stop-color="#2A1A0C" stop-opacity="0"/></linearGradient>
${az('azul', '#F4F6FA', '#2F64B5', '#F2C14E')}${az('azVerde', '#F6F3E6', '#3E8C66', '#E5B33A')}
<pattern id="${u}calB" width="96" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(1.35,.9)"><rect width="96" height="48" fill="#B4AC9E"/>${ladrilhos(96, 48, 6, 3, ['#F5F1E7', '#EEE8DB', '#F8F5EE', '#E8E1D2'], rng, '#FFFFFF')}</pattern>
<pattern id="${u}calP" width="96" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(1.35,.9)"><rect width="96" height="48" fill="#1F1F22"/>${ladrilhos(96, 48, 6, 3, ['#3B3B40', '#303135', '#46454B', '#35363B'], rng, '#77777F')}</pattern>
<pattern id="${u}telha" width="18" height="12" patternUnits="userSpaceOnUse"><rect width="18" height="12" fill="#B9502F"/><path d="M0,12 A9,7 0 0 1 18,12" fill="#D9714B" stroke="#8E3A21" stroke-width="1.4"/><path d="M4,8 A5,3 0 0 1 10,6" fill="none" stroke="#F3A07C" stroke-width="1.4" opacity=".7"/></pattern>
<pattern id="${u}xadrez" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="#C9443F"/><rect y="9" width="26" height="8" fill="#F1E3C8" opacity=".85"/><rect x="9" width="8" height="26" fill="#F1E3C8" opacity=".6"/><rect x="9" y="9" width="8" height="8" fill="#FFF6E2"/><path d="M0,4H26M4,0V26" stroke="#8E2A27" stroke-width="1.2" opacity=".6"/></pattern>
<linearGradient id="${u}vidro" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#7DB0C8"/><stop offset=".5" stop-color="#43728A"/><stop offset="1" stop-color="#2A4C5E"/></linearGradient>
<linearGradient id="${u}madeira" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E7B474"/><stop offset=".55" stop-color="#CC9153"/><stop offset="1" stop-color="#A66E3A"/></linearGradient>
<radialGradient id="${u}interior" cx=".5" cy=".95" r=".85"><stop offset="0" stop-color="#6A4528"/><stop offset=".55" stop-color="#2F1C0E"/><stop offset="1" stop-color="#170C05"/></radialGradient>
<linearGradient id="${u}sombraPorta" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1A0E06" stop-opacity=".55"/><stop offset=".45" stop-color="#1A0E06" stop-opacity=".22"/><stop offset=".8" stop-color="#1A0E06" stop-opacity="0"/></linearGradient>
<linearGradient id="${u}chaoCasa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#170C05" stop-opacity=".7"/><stop offset="1" stop-color="#170C05" stop-opacity="0"/></linearGradient>
<linearGradient id="${u}relva" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9AC963"/><stop offset="1" stop-color="#6CA444"/></linearGradient>
<linearGradient id="${u}tronco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A2734A"/><stop offset=".5" stop-color="#7A5233"/><stop offset="1" stop-color="#553722"/></linearGradient>
<linearGradient id="${u}chao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6E2" stop-opacity=".55"/><stop offset=".3" stop-color="#FFF6E2" stop-opacity="0"/><stop offset="1" stop-color="#5B4A36" stop-opacity=".16"/></linearGradient>
<linearGradient id="${u}sombraCasa" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2E2010" stop-opacity=".38"/><stop offset="1" stop-color="#2E2010" stop-opacity="0"/></linearGradient>
<linearGradient id="${u}tigela" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E9BE0"/><stop offset="1" stop-color="#2C5793"/></linearGradient>
<linearGradient id="${u}hidrante" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F57A68"/><stop offset=".45" stop-color="#D2352F"/><stop offset="1" stop-color="#8A1B1B"/></linearGradient>
<linearGradient id="${u}vaso" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E08A5E"/><stop offset=".6" stop-color="#C0603A"/><stop offset="1" stop-color="#94442A"/></linearGradient>
<radialGradient id="${u}copa" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#9ED16A"/><stop offset=".6" stop-color="#5E9E3E"/><stop offset="1" stop-color="#3C7A2E"/></radialGradient>
<radialGradient id="${u}poeira"><stop offset="0" stop-color="#E6D3AE" stop-opacity=".95"/><stop offset="1" stop-color="#E6D3AE" stop-opacity="0"/></radialGradient>
<linearGradient id="${u}pombo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B2BAC7"/><stop offset="1" stop-color="#7C8494"/></linearGradient>
<clipPath id="${u}parede"><path clip-rule="evenodd" d="${PAREDE_D} ${PORTA_D}"/></clipPath>
<clipPath id="${u}portaIn"><path d="${PORTA_D}"/></clipPath>
<clipPath id="${u}telhE"><path d="M960,400L766,562L766,506L960,344Z"/></clipPath>
<clipPath id="${u}telhD"><path d="M960,400L1154,562L1154,506L960,344Z"/></clipPath>
<clipPath id="${u}canteiro"><path d="${CANTEIRO_D}"/></clipPath>
<clipPath id="${u}recorte"><path class="clipCasota" clip-rule="evenodd" d="M-400,-400H2000V1300H-400Z ${SILHUETA_D} ${PORTA_D}"/></clipPath>`;
  }

  // ---- peças do cenário ----
  function floreira(x, y, w, meta) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="17" rx="3" fill="#B65A3A" stroke="#6E2E1A" stroke-width="2"/><rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="4" fill="#E08A62" opacity=".6"/>`;
    for (let fx = x + 12; fx < x + w - 6; fx += 21) {
      const cores = ['#E2394B', '#F05A7E', '#E2394B'];
      const c = cores[Math.floor((fx * 7) % 3)];
      s += `<g class="cn-flor" data-x="${fx}" data-y="${y}"><path d="M${fx - 9},${y} C${fx - 12},${y - 14} ${fx - 4},${y - 18} ${fx},${y - 8} C${fx + 4},${y - 18} ${fx + 12},${y - 14} ${fx + 9},${y}Z" fill="#4E8F3A" stroke="#2E5E24" stroke-width="1.5"/>
<circle cx="${fx - 4}" cy="${y - 22}" r="5.5" fill="${c}"/><circle cx="${fx + 4}" cy="${y - 21}" r="5.5" fill="${c}"/><circle cx="${fx}" cy="${y - 28}" r="5.5" fill="${c}"/><circle cx="${fx}" cy="${y - 23}" r="2.6" fill="#FFD8DE"/></g>`;
      meta.flores.push({ x: fx, y, f: rnd(0, 6) });
    }
    return s;
  }
  function varanda(x, y, w) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="9" fill="#E9E0CF" stroke="#8C7B66" stroke-width="2"/>`;
    s += `<g stroke="#2B2B31" fill="none" stroke-width="3"><path d="M${x + 4},${y - 46}H${x + w - 4}"/><path d="M${x + 4},${y - 6}H${x + w - 4}"/>`;
    for (let bx = x + 10; bx < x + w - 6; bx += 12) s += `<path d="M${bx},${y - 44}V${y - 6}"/>`;
    for (let bx = x + 22; bx < x + w - 14; bx += 36) s += `<path d="M${bx},${y - 26} c6,-8 14,-8 12,0 c-2,6 -8,4 -6,0" stroke-width="2.4"/>`;
    return s + '</g>';
  }
  function janelaCasa(u, x, y, w, h, o, meta) {
    const m = 8, mol = o.moldura || '#F4ECDD', li = '#8B7A64';
    let s = `<rect x="${x - m + 5}" y="${y - m + 6}" width="${w + 2 * m}" height="${h + 2 * m}" fill="#3A2A1A" opacity=".1"/>`;
    if (o.persiana) {
      const pw = w / 2 + 4;
      for (const px of [x - m - pw - 3, x + w + m + 3]) {
        s += `<rect x="${px}" y="${y - m}" width="${pw}" height="${h + 2 * m}" rx="2" fill="${o.persiana}" stroke="#1F3A2A" stroke-width="2"/>`;
        for (let yy = y - m + 8; yy < y + h + m - 4; yy += 8) s += `<path d="M${px + 4},${yy}H${px + pw - 4}" stroke="#163024" stroke-width="2" opacity=".45"/>`;
        s += `<path d="M${px + 3},${y - m + 3}V${y + h + m - 3}" stroke="#fff" stroke-width="2" opacity=".22"/>`;
      }
    }
    s += `<rect x="${x - m}" y="${y - m}" width="${w + 2 * m}" height="${h + 2 * m}" rx="2" fill="${mol}" stroke="${li}" stroke-width="2"/>`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${u}vidro)"/>`;
    if (o.cortina) {
      s += `<g class="cn-cortina" data-x="${x}" data-y="${y}"><path d="M${x + 2},${y + 2}H${x + w * 0.44}C${x + w * 0.36},${y + h * 0.45} ${x + w * 0.46},${y + h * 0.75} ${x + w * 0.3},${y + h - 2}H${x + 2}Z" fill="#FBF6EC" opacity=".9"/><path d="M${x + w - 2},${y + 2}H${x + w * 0.56}C${x + w * 0.64},${y + h * 0.45} ${x + w * 0.54},${y + h * 0.75} ${x + w * 0.7},${y + h - 2}H${x + w - 2}Z" fill="#FBF6EC" opacity=".9"/>
<path d="M${x + w * 0.15},${y + 6}V${y + h - 6}M${x + w * 0.85},${y + 6}V${y + h - 6}" stroke="#E2D8C6" stroke-width="2"/></g>`;
      meta.cortinas.push({ x: x + w / 2, y, f: rnd(0, 6) });
    }
    s += `<path d="M${x + w * 0.12},${y + h}L${x + w * 0.5},${y}L${x + w * 0.66},${y}L${x + w * 0.28},${y + h}Z" fill="#fff" opacity=".16"/>`;
    s += `<path d="M${x + w / 2},${y}V${y + h}M${x},${y + h * 0.4}H${x + w}" stroke="#F6F1E6" stroke-width="5"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#F6F1E6" stroke-width="4"/>`;
    s += `<rect x="${x - m - 6}" y="${y + h + m - 3}" width="${w + 2 * m + 12}" height="9" rx="2" fill="#EDE4D3" stroke="${li}" stroke-width="2"/>`;
    if (o.vaso) s += floreira(x - m - 2, y + h + m + 6, w + 2 * m + 4, meta);
    if (o.varanda) s += varanda(x - m - 14, y + h + m + 6, w + 2 * m + 28);
    return s;
  }
  function porta(x, y, w, h, cor) {
    const m = 10, li = '#8B7A64';
    return `<rect x="${x - m}" y="${y - m - w / 2}" width="${w + 2 * m}" height="${h + m + w / 2}" fill="#F1E8D8" stroke="${li}" stroke-width="2"/>
<path d="M${x},${y + h}V${y}A${w / 2},${w / 2} 0 0 1 ${x + w},${y}V${y + h}Z" fill="${cor}" stroke="#2A2A22" stroke-width="2.5"/>
<path d="M${x + 4},${y}A${w / 2 - 4},${w / 2 - 4} 0 0 1 ${x + w - 4},${y}Z" fill="url(#cao-VIDRO)"/>
<rect x="${x + 8}" y="${y + 12}" width="${w / 2 - 12}" height="${h * 0.38}" rx="3" fill="none" stroke="#000" stroke-width="2" opacity=".25"/><rect x="${x + w / 2 + 4}" y="${y + 12}" width="${w / 2 - 12}" height="${h * 0.38}" rx="3" fill="none" stroke="#000" stroke-width="2" opacity=".25"/>
<rect x="${x + 8}" y="${y + 20 + h * 0.4}" width="${w / 2 - 12}" height="${h * 0.42}" rx="3" fill="none" stroke="#000" stroke-width="2" opacity=".25"/><rect x="${x + w / 2 + 4}" y="${y + 20 + h * 0.4}" width="${w / 2 - 12}" height="${h * 0.42}" rx="3" fill="none" stroke="#000" stroke-width="2" opacity=".25"/>
<path d="M${x + w / 2},${y}V${y + h}" stroke="#000" stroke-width="2" opacity=".3"/><circle cx="${x + w / 2 + 7}" cy="${y + h * 0.52}" r="3.5" fill="#E8C35A" stroke="#7A5A14" stroke-width="1.2"/>
<rect x="${x - m - 6}" y="${y + h - 2}" width="${w + 2 * m + 12}" height="9" fill="#DCD3C2" stroke="${li}" stroke-width="2"/>`;
  }
  function soco(x, w) {   // base de pedra das casas
    let s = `<rect x="${x}" y="558" width="${w}" height="44" fill="#CFC8BC" stroke="#8E877B" stroke-width="2"/>`;
    for (let bx = x + 40; bx < x + w; bx += 64) s += `<path d="M${bx},560V600" stroke="#9D958A" stroke-width="2" opacity=".7"/>`;
    return s + `<path d="M${x},580H${x + w}" stroke="#9D958A" stroke-width="2" opacity=".5"/><rect x="${x}" y="558" width="${w}" height="5" fill="#fff" opacity=".35"/>`;
  }
  function nuvem(x, y, e) {
    return `<g class="cn-nuvem" transform="translate(${x},${y}) scale(${e})"><ellipse cx="6" cy="40" rx="118" ry="16" fill="#C7DBEA" opacity=".55"/>
<g fill="url(#cao-NUVEM)"><circle cx="-70" cy="16" r="34"/><circle cx="-26" cy="-6" r="48"/><circle cx="28" cy="-14" r="54"/><circle cx="78" cy="10" r="38"/><rect x="-100" y="10" width="210" height="36" rx="18"/></g>
<circle cx="-34" cy="-22" r="20" fill="#fff" opacity=".8"/><circle cx="18" cy="-34" r="22" fill="#fff" opacity=".8"/></g>`;
  }

  function cenaFundo(u, rng, meta) {
    let s = `<rect width="1600" height="900" fill="url(#${u}ceu)"/>`;
    // sol e raios (luz de cima à esquerda)
    s += `<circle cx="470" cy="92" r="240" fill="url(#${u}sol)"/><g class="cn-raios" opacity=".22">`;
    for (let i = 0; i < 12; i++) { const a = i * 30; s += `<path d="M470,92 L${n1(470 + 260 * Math.cos((a - 4) / GRAU))},${n1(92 + 260 * Math.sin((a - 4) / GRAU))} L${n1(470 + 260 * Math.cos((a + 4) / GRAU))},${n1(92 + 260 * Math.sin((a + 4) / GRAU))}Z" fill="#FFF3B8"/>`; }
    s += `</g><circle cx="470" cy="92" r="46" fill="#FFF3BE"/><circle cx="470" cy="92" r="38" fill="#FFF9DC"/>`;
    // nuvens
    for (const [x, y, e, v] of [[180, 70, 0.9, 7], [760, 130, 0.62, 5], [1180, 62, 1.0, 9], [1480, 170, 0.55, 6]]) { s += nuvem(x, y, e).replace('cao-NUVEM', u + 'nuvem'); meta.nuvens.push({ x, y, e, v }); }
    // gaivotas ao longe
    for (let i = 0; i < 2; i++) { s += `<g class="cn-gaivota"><path d="M-26,0 Q-13,-13 0,0 Q13,-13 26,0" fill="none" stroke="#7D8896" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M-26,0 Q-13,-13 0,0 Q13,-13 26,0" fill="none" stroke="#FFFFFF" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M-26,0 L-21,-4 M26,0 L21,-4" stroke="#3E4652" stroke-width="3" stroke-linecap="round"/></g>`; meta.gaivotas.push({ x: 300 + i * 500, y: 150 + i * 40, f: i * 2, v: 22 + i * 8 }); }
    // plano de fundo: colina com casario e castelo, enevoada
    s += `<path d="M300,250 C380,190 470,160 560,150 C620,120 700,104 760,112 C840,100 930,128 1000,150 C1090,160 1190,190 1300,250Z" fill="url(#${u}colina)"/>`;
    s += `<g opacity=".75"><path d="M690,112V92H700V100H712V88H724V100H736V90H748V112Z" fill="#C3CDCB" stroke="#9EAEAE" stroke-width="1.5"/>`;
    for (let i = 0; i < 46; i++) {
      const x = 360 + rng() * 880, base = 250 - 105 * Math.exp(-Math.pow((x - 760) / 330, 2)) + rng() * 30, w = 14 + rng() * 16, h = 12 + rng() * 12;
      const cor = ['#EEF0EC', '#F2E6D2', '#E9D7C8', '#F4EEE2', '#E3E8EA'][Math.floor(rng() * 5)];
      s += `<rect x="${n1(x)}" y="${n1(base - h)}" width="${n1(w)}" height="${n1(h)}" fill="${cor}"/><path d="M${n1(x - 1)},${n1(base - h)}L${n1(x + w / 2)},${n1(base - h - 6)}L${n1(x + w + 1)},${n1(base - h)}Z" fill="#D5A68E"/>`;
      if (rng() < 0.6) s += `<rect x="${n1(x + w * 0.3)}" y="${n1(base - h * 0.6)}" width="3" height="4" fill="#9FB0B8"/>`;
    }
    s += `<path d="M300,250 C500,236 1100,236 1300,250Z" fill="#C9D6D3"/></g>`;
    // ---- casas (plano médio) ----
    // Casa A — azulejos azuis
    s += `<rect x="-30" y="104" width="402" height="456" fill="url(#${u}azul)"/><rect x="-30" y="104" width="402" height="456" fill="url(#${u}fachada)"/>`;
    s += `<path d="M-40,98 L-30,66 L382,66 L392,98Z" fill="url(#${u}telha)" stroke="#7E321C" stroke-width="2"/><rect x="70" y="30" width="34" height="40" fill="#ECE3D3" stroke="#8C7B66" stroke-width="2"/><rect x="64" y="24" width="46" height="10" fill="#D9CDB9" stroke="#8C7B66" stroke-width="2"/>`;
    s += `<rect x="-40" y="96" width="432" height="16" fill="#F1E8D8" stroke="#9A8A74" stroke-width="2"/><rect x="352" y="104" width="20" height="456" fill="#EFE6D6" stroke="#9A8A74" stroke-width="2"/>`;
    s += janelaCasa(u, 60, 156, 66, 96, { persiana: '#2F6E8E' }, meta) + janelaCasa(u, 230, 156, 66, 96, { varanda: true }, meta) + janelaCasa(u, 60, 318, 66, 96, { vaso: true }, meta) + janelaCasa(u, 230, 318, 66, 96, { cortina: true }, meta);
    s += porta(250, 470, 66, 122, '#2E6B4F').replace('cao-VIDRO', u + 'vidro') + soco(-30, 402);
    // Casa B — amarela, persianas verdes, varanda e roupa a secar
    s += `<rect x="372" y="206" width="420" height="354" fill="#F2C46E"/><rect x="372" y="206" width="420" height="354" fill="url(#${u}fachada)"/>`;
    s += `<path d="M362,200 L372,170 L792,170 L802,200Z" fill="url(#${u}telha)" stroke="#7E321C" stroke-width="2"/><rect x="362" y="198" width="440" height="15" fill="#F6EEDF" stroke="#9A8A74" stroke-width="2"/>`;
    s += `<rect x="372" y="206" width="16" height="354" fill="#F6EEDF" stroke="#9A8A74" stroke-width="1.5"/><rect x="776" y="206" width="16" height="354" fill="#F6EEDF" stroke="#9A8A74" stroke-width="1.5"/>`;
    s += janelaCasa(u, 420, 250, 60, 90, { persiana: '#3F7D4E', vaso: true }, meta) + janelaCasa(u, 560, 238, 64, 104, { varanda: true, cortina: true }, meta) + janelaCasa(u, 702, 250, 52, 90, { persiana: '#3F7D4E', vaso: true }, meta);
    s += porta(398, 470, 58, 122, '#2D5E9E').replace('cao-VIDRO', u + 'vidro');
    s += `<g><rect x="478" y="436" width="96" height="30" rx="3" fill="#F7F8FB" stroke="#2F64B5" stroke-width="2.5"/><rect x="482" y="440" width="88" height="22" fill="none" stroke="#2F64B5" stroke-width="1" opacity=".6"/><text x="526" y="456" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="700" fill="#2F64B5">R. DAS FLORES</text></g>`;
    // estendal: corda e roupa
    s += `<path d="M396,384 C480,396 580,396 668,382" fill="none" stroke="#6E655A" stroke-width="2"/><circle cx="396" cy="384" r="3" fill="#6E655A"/><circle cx="668" cy="382" r="3" fill="#6E655A"/>`;
    const roupa = [
      [430, 390, `<path d="M-22,0 L-34,12 L-26,22 L-18,16 L-18,52 L18,52 L18,16 L26,22 L34,12 L22,0 L10,0 C8,6 -8,6 -10,0Z" fill="#E4574F" stroke="#8E2C26" stroke-width="2"/><path d="M-18,26H18" stroke="#fff" stroke-width="4" opacity=".7"/>`],
      [486, 393, `<path d="M-8,0 L-8,30 C-8,38 -2,40 6,38 L8,30 L4,26 L4,0Z" fill="#4F86D8" stroke="#244E8E" stroke-width="2"/><path d="M-8,6H4" stroke="#fff" stroke-width="3"/>`],
      [508, 394, `<path d="M-6,0 L-6,30 C-6,38 0,40 8,38 L10,30 L6,26 L6,0Z" fill="#4F86D8" stroke="#244E8E" stroke-width="2"/><path d="M-6,6H6" stroke="#fff" stroke-width="3"/>`],
      [556, 396, `<rect x="-24" y="0" width="48" height="58" rx="3" fill="#F6D04E" stroke="#9E7D16" stroke-width="2"/><path d="M-24,40H24M-24,47H24" stroke="#E2574C" stroke-width="3"/>`],
      [626, 390, `<path d="M-20,0 H20 L22,34 L4,34 L0,18 L-4,34 L-22,34Z" fill="#5BAE6B" stroke="#2E6E3A" stroke-width="2"/><path d="M-20,5H20" stroke="#2E6E3A" stroke-width="2"/>`]
    ];
    for (const [x, y, d] of roupa) { s += `<g class="cn-roupa" transform="translate(${x},${y})">${d}<rect x="-14" y="-4" width="5" height="9" rx="1.5" fill="#C9A67A"/><rect x="9" y="-4" width="5" height="9" rx="1.5" fill="#C9A67A"/></g>`; meta.roupas.push({ x, y, f: rnd(0, 6) }); }
    s += soco(372, 420);
    // Casa C — rosa, faixa de azulejos verdes (a casota fica à frente dela)
    s += `<rect x="792" y="242" width="398" height="318" fill="#EFAA93"/><rect x="792" y="242" width="398" height="318" fill="url(#${u}fachada)"/>`;
    s += `<path d="M782,236 L792,212 L1190,212 L1200,236Z" fill="url(#${u}telha)" stroke="#7E321C" stroke-width="2"/><rect x="782" y="234" width="428" height="14" fill="#F6EEDF" stroke="#9A8A74" stroke-width="2"/>`;
    s += `<rect x="792" y="250" width="398" height="22" fill="url(#${u}azVerde)"/><path d="M792,250H1190M792,272H1190" stroke="#9A8A74" stroke-width="2"/>`;
    s += janelaCasa(u, 836, 300, 60, 86, { vaso: true }, meta) + janelaCasa(u, 1086, 300, 60, 86, { cortina: true }, meta) + soco(792, 398);
    // Casa D — branca, painel de azulejos azuis em baixo, candeeiro de ferro
    s += `<rect x="1190" y="132" width="430" height="428" fill="#F4F1EA"/><rect x="1190" y="430" width="430" height="128" fill="url(#${u}azul)"/><rect x="1190" y="132" width="430" height="428" fill="url(#${u}fachada)"/>`;
    s += `<path d="M1180,126 L1190,96 L1630,96 L1640,126Z" fill="url(#${u}telha)" stroke="#7E321C" stroke-width="2"/><rect x="1180" y="124" width="460" height="14" fill="#E9E0CF" stroke="#9A8A74" stroke-width="2"/><rect x="1500" y="54" width="34" height="44" fill="#ECE3D3" stroke="#8C7B66" stroke-width="2"/>`;
    s += `<rect x="1190" y="426" width="430" height="8" fill="#E2D8C6" stroke="#9A8A74" stroke-width="1.5"/><rect x="1190" y="138" width="14" height="420" fill="#E9E0CF" stroke="#9A8A74" stroke-width="1.5"/>`;
    s += janelaCasa(u, 1316, 176, 62, 92, { persiana: '#2F64B5', vaso: true }, meta) + janelaCasa(u, 1486, 176, 62, 92, { persiana: '#2F64B5' }, meta) + janelaCasa(u, 1316, 316, 62, 80, {}, meta) + janelaCasa(u, 1486, 316, 62, 80, { varanda: true }, meta);
    s += porta(1400, 470, 64, 122, '#7A3B2A').replace('cao-VIDRO', u + 'vidro') + soco(1190, 430);
    // candeeiro de ferro (braço na parede)
    s += `<g stroke="#26262B" fill="none" stroke-width="5" stroke-linecap="round"><path d="M1206,300 C1226,300 1240,292 1246,280"/><path d="M1206,318 C1222,312 1230,302 1232,292" stroke-width="3"/></g><rect x="1200" y="292" width="10" height="34" rx="2" fill="#26262B"/>
<path d="M1232,284 H1262 L1256,276 H1238Z" fill="#26262B"/><path d="M1236,290 H1258 L1262,334 H1232Z" fill="#F9E7A6" stroke="#26262B" stroke-width="3"/><path d="M1247,290V334" stroke="#26262B" stroke-width="2"/><path d="M1238,296 L1243,296 L1242,326 L1236,326Z" fill="#fff" opacity=".55"/><path d="M1228,334H1266L1258,344H1236Z" fill="#26262B"/><circle cx="1247" cy="270" r="5" fill="#26262B"/>`;
    // sombra das casas no passeio
    s += `<rect x="-20" y="600" width="1640" height="22" fill="url(#${u}beiral)"/>`;
    return s;
  }

  function cenaChao(u, rng, meta) {
    // calçada portuguesa: pedra branca com ondas de pedra preta («mar largo»)
    let s = `<rect x="-20" y="600" width="1640" height="320" fill="url(#${u}calB)"/>`;
    for (const [yc, A, e, L] of [[640, 8, 12, 250], [700, 15, 24, 320], [850, 24, 40, 420]]) {
      let topo = '', base = [];
      for (let x = -40; x <= 1640; x += 20) { const y = yc + A * Math.sin(x / L * TAU + yc); topo += (topo ? 'L' : 'M') + x + ',' + n1(y - e / 2); base.push(x + ',' + n1(y + e / 2)); }
      s += `<path d="${topo}L${base.reverse().join('L')}Z" fill="url(#${u}calP)"/>`;
    }
    s += `<rect x="-20" y="600" width="1640" height="320" fill="url(#${u}chao)"/><rect x="-20" y="600" width="1640" height="14" fill="#2A1A0C" opacity=".14"/>`;
    // árvore no passeio (caldeira de terra)
    s += `<path d="M110,642 L238,642 L246,664 L102,664Z" fill="#6B5038" stroke="#4A3524" stroke-width="2.5"/><path d="M116,646 L232,646 L238,660 L108,660Z" fill="#8A6A4A"/>`;
    s += `<path d="M150,652 C156,600 160,520 162,440 C150,400 128,370 104,350 L114,342 C138,362 156,386 168,410 C172,380 168,340 160,300 L172,298 C180,340 184,380 182,420 C196,392 222,370 250,358 L254,368 C228,382 204,404 192,440 C190,520 194,600 204,652Z" fill="url(#${u}tronco)" stroke="#3E2816" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<g fill="none" stroke="#4A301C" stroke-width="2.2" stroke-linecap="round" opacity=".7"><path d="M166,620 C164,590 168,570 166,540"/><path d="M182,600 C180,570 184,540 182,500"/><path d="M172,480 C170,460 172,440 170,420"/></g><path d="M156,640 C160,580 162,520 164,460" stroke="#C9996A" stroke-width="3" fill="none" opacity=".45"/>`;
    const copas = [[70, 230, 92], [180, 168, 104], [300, 220, 88], [120, 330, 86], [262, 318, 92], [190, 262, 96], [30, 320, 66], [350, 300, 60]];
    copas.sort((a, b) => a[1] - b[1]);
    for (const [cx, cy, r] of copas) {
      let c = `<g class="cn-copa" data-x="${cx}" data-y="${cy + r}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${u}copa)" stroke="#2F5E24" stroke-width="3"/>`;
      for (let k = 0; k < 9; k++) { const a = rng() * TAU, rr = r * (0.3 + rng() * 0.55); c += `<ellipse cx="${n1(cx + Math.cos(a) * rr)}" cy="${n1(cy + Math.sin(a) * rr)}" rx="${n1(7 + rng() * 6)}" ry="${n1(4 + rng() * 3)}" transform="rotate(${n1(rng() * 180)} ${n1(cx + Math.cos(a) * rr)} ${n1(cy + Math.sin(a) * rr)})" fill="${rng() < 0.55 ? '#B4DE7E' : '#3F7E30'}" opacity=".7"/>`; }
      c += `<circle cx="${n1(cx - r * 0.35)}" cy="${n1(cy - r * 0.4)}" r="${n1(r * 0.28)}" fill="#C6E895" opacity=".45"/></g>`;
      s += c; meta.copas.push({ x: cx, y: cy + r, f: rng() * 6 });
    }
    // marco de água vermelho (Lisboa)
    s += `<g transform="translate(262,772)"><ellipse cx="10" cy="3" rx="38" ry="8" fill="#2E2010" opacity=".25"/><rect x="-26" y="-12" width="52" height="12" rx="4" fill="#8A1B1B"/>
<rect x="-20" y="-76" width="40" height="66" rx="6" fill="url(#${u}hidrante)" stroke="#5A1212" stroke-width="3"/><rect x="-33" y="-54" width="14" height="16" rx="4" fill="url(#${u}hidrante)" stroke="#5A1212" stroke-width="2.5"/><rect x="19" y="-54" width="14" height="16" rx="4" fill="url(#${u}hidrante)" stroke="#5A1212" stroke-width="2.5"/>
<path d="M-24,-76 C-24,-100 24,-100 24,-76Z" fill="url(#${u}hidrante)" stroke="#5A1212" stroke-width="3"/><rect x="-27" y="-80" width="54" height="9" rx="3" fill="#B92A26" stroke="#5A1212" stroke-width="2.5"/><circle cy="-100" r="6" fill="#B92A26" stroke="#5A1212" stroke-width="2.5"/>
<rect x="-12" y="-72" width="6" height="58" rx="3" fill="#fff" opacity=".35"/><path d="M-10,-94 C-6,-98 2,-98 6,-96" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".45"/></g>`;
    // laranjeira num vaso (à direita, fora da zona do cão)
    s += `<g><ellipse cx="1490" cy="772" rx="62" ry="10" fill="#2E2010" opacity=".22"/><path d="M1440,690 H1540 L1528,770 H1452Z" fill="url(#${u}vaso)" stroke="#6A2C16" stroke-width="3"/><rect x="1434" y="682" width="112" height="16" rx="4" fill="#D67A50" stroke="#6A2C16" stroke-width="3"/>
<path d="M1488,684 C1486,650 1490,620 1488,590" stroke="#6E4A2C" stroke-width="10" fill="none" stroke-linecap="round"/>
<g class="cn-laranjeira"><circle cx="1490" cy="560" r="62" fill="url(#${u}copa)" stroke="#2F5E24" stroke-width="3"/><circle cx="1462" cy="540" r="7" fill="#F59A2A" stroke="#B4600E" stroke-width="1.5"/><circle cx="1512" cy="532" r="7" fill="#F59A2A" stroke="#B4600E" stroke-width="1.5"/><circle cx="1500" cy="580" r="7" fill="#F59A2A" stroke="#B4600E" stroke-width="1.5"/><circle cx="1470" cy="584" r="6" fill="#F59A2A" stroke="#B4600E" stroke-width="1.5"/><circle cx="1528" cy="562" r="6" fill="#F59A2A" stroke="#B4600E" stroke-width="1.5"/><circle cx="1470" cy="530" r="18" fill="#C6E895" opacity=".4"/></g></g>`;
    return s;
  }

  // Canteiro, casota (habitat), tigela e osso
  function cenaCasota(u, rng, meta) {
    let s = '';
    // canteiro com relva
    s += `<path d="${CANTEIRO_D}" fill="url(#${u}relva)" stroke="#5C7E3A" stroke-width="3"/><g clip-path="url(#${u}canteiro)">`;
    for (let i = 0; i < 190; i++) {
      const x = 720 + rng() * 640, y = 656 + rng() * 150, h = 6 + rng() * 9, cor = rng() < 0.5 ? '#5E9A3C' : '#B2DB7A';
      s += `<path d="M${n1(x)},${n1(y)}q${n1(rng() * 4 - 2)},${n1(-h * 0.6)} ${n1(rng() * 6 - 3)},${n1(-h)}" stroke="${cor}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>`;
    }
    s += `<ellipse cx="962" cy="764" rx="118" ry="17" fill="#B8956A" opacity=".55"/><ellipse cx="962" cy="762" rx="80" ry="10" fill="#C9A77A" opacity=".5"/></g>`;
    // lancil de pedra na frente do canteiro
    for (let i = 0; i <= 15; i++) {
      const t = i / 15, x = lerp(736, 1336, t), y = 792 + 14 * Math.sin(t * PI) - (t < 0.06 || t > 0.94 ? 10 : 0);
      s += `<rect x="${n1(x - 20)}" y="${n1(y - 6)}" width="40" height="14" rx="6" fill="#D7D2C8" stroke="#8D877C" stroke-width="2"/><rect x="${n1(x - 16)}" y="${n1(y - 4)}" width="30" height="3" rx="1.5" fill="#fff" opacity=".6"/>`;
    }
    // flores do canteiro
    for (const [fx, fy, c] of [[770, 732, '#FFFFFF'], [812, 700, '#F7D33A'], [1196, 694, '#FFFFFF'], [1270, 720, '#F06A8C'], [1316, 742, '#FFFFFF'], [756, 768, '#F7D33A']]) {
      let p = `<g class="cn-flor2" data-x="${fx}" data-y="${fy + 18}"><path d="M${fx},${fy + 18}C${fx - 2},${fy + 10} ${fx + 2},${fy + 6} ${fx},${fy}" stroke="#3F7E30" stroke-width="2.5" fill="none"/><ellipse cx="${fx + 5}" cy="${fy + 12}" rx="5" ry="2.5" fill="#4E9A3C" transform="rotate(-30 ${fx + 5} ${fy + 12})"/>`;
      for (let k = 0; k < 6; k++) { const a = k * 60 / GRAU; p += `<ellipse cx="${n1(fx + Math.cos(a) * 6)}" cy="${n1(fy + Math.sin(a) * 6)}" rx="5" ry="3" transform="rotate(${k * 60} ${n1(fx + Math.cos(a) * 6)} ${n1(fy + Math.sin(a) * 6)})" fill="${c}" stroke="#B8AA90" stroke-width=".8"/>`; }
      s += p + `<circle cx="${fx}" cy="${fy}" r="3.8" fill="#F2A81E"/></g>`;
      meta.flores2.push({ x: fx, y: fy + 18, f: rnd(0, 6) });
    }
    // sombra projetada da casota (luz da esquerda → sombra para a direita)
    s += `<path d="M1112,752 L1244,746 C1272,734 1270,708 1240,700 L1120,694Z" fill="url(#${u}sombraCasa)"/><ellipse cx="962" cy="752" rx="186" ry="12" fill="#2E2010" opacity=".3"/>`;
    // ---- casota (vai abanar inteira) ----
    s += `<g class="casotaG">`;
    // interior escuro visto pela porta: parede do fundo, chão e manta aos quadrados
    s += `<path d="${PORTA_D}" fill="url(#${u}interior)"/><g clip-path="url(#${u}portaIn)">`;
    for (let y = 560; y < 700; y += 22) s += `<path d="M850,${y}H1070" stroke="#4A2E18" stroke-width="2" opacity=".55"/>`;
    s += `<path d="M872,750 L1048,750 L1032,702 L888,702Z" fill="url(#${u}xadrez)"/><path d="M872,750 L1048,750 L1032,702 L888,702Z" fill="url(#${u}chaoCasa)"/>`;
    s += `<path d="M888,702 C920,694 1000,694 1032,702" fill="none" stroke="#F1E3C8" stroke-width="3" opacity=".4"/>`;
    for (let i = 0; i < 14; i++) { const x = 880 + rng() * 160, y = 704 + rng() * 42; s += `<path d="M${n1(x)},${n1(y)}l${n1(8 + rng() * 8)},${n1(rng() * 4 - 2)}" stroke="#E7C66C" stroke-width="2" stroke-linecap="round" opacity=".75"/>`; }
    s += `<path d="${PORTA_D}" fill="none" stroke="#120904" stroke-width="10" opacity=".5"/></g>`;
    // parede da frente em tábuas de madeira
    s += `<g clip-path="url(#${u}parede)"><rect x="790" y="410" width="340" height="350" fill="url(#${u}madeira)"/>`;
    for (let y = 418 + 18; y < 750; y += 26) {
      s += `<path d="M790,${y}H1130" stroke="#7E4E24" stroke-width="2.6"/><path d="M790,${y + 2.5}H1130" stroke="#F7CD92" stroke-width="1.6" opacity=".45"/>`;
      for (let k = 0; k < 3; k++) { const x = 800 + rng() * 300, w = 40 + rng() * 60, yy = y - 8 - rng() * 12; s += `<path d="M${n1(x)},${n1(yy)}c${n1(w * 0.3)},${n1(-2 + rng() * 2)} ${n1(w * 0.6)},${n1(2 - rng() * 2)} ${n1(w)},${n1(rng() * 2 - 1)}" fill="none" stroke="#A86C36" stroke-width="1.4" opacity=".55"/>`; }
      if (y > 560) s += `<circle cx="811" cy="${y - 12}" r="2.2" fill="#6A4A2A"/><circle cx="1109" cy="${y - 12}" r="2.2" fill="#6A4A2A"/>`;
    }
    s += `<ellipse cx="1088" cy="676" rx="7" ry="4" fill="#8A5428" opacity=".6"/><ellipse cx="830" cy="612" rx="6" ry="3.5" fill="#8A5428" opacity=".6"/>`;
    s += `<path d="M960,424 L1120,554 L1120,750 L1060,750 L1060,420Z" fill="#3A2210" opacity=".1"/>`;
    s += `<path d="M800,560 L960,430 L1120,560 L1120,590 L960,460 L800,590Z" fill="#2A1A0C" opacity=".22"/></g>`;
    s += `<path d="${PAREDE_D}" fill="none" stroke="${CO}" stroke-width="4" stroke-linejoin="round"/>`;
    // tábuas de canto e rodapé
    s += `<rect x="800" y="556" width="15" height="194" fill="#F2E3C8" stroke="${CO}" stroke-width="2.5"/><rect x="1105" y="556" width="15" height="194" fill="#E1CDAA" stroke="${CO}" stroke-width="2.5"/>`;
    s += `<path d="M815,736H860M1060,736H1105" stroke="#7A4A22" stroke-width="5"/>`;
    // moldura da porta em arco + pegada pintada
    s += `<path d="M846,750V630A114,114 0 0 1 1074,630V750H1060V630A100,100 0 0 0 860,630V750Z" fill="#F4E7D0" stroke="${CO}" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<path d="M852,744V630A108,108 0 0 1 960,522" fill="none" stroke="#fff" stroke-width="2.5" opacity=".6"/><rect x="948" y="510" width="24" height="20" rx="3" fill="#EADBC0" stroke="${CO}" stroke-width="2.5"/>`;
    s += `<g transform="translate(1090,612)" fill="#F7EEDC" opacity=".9"><ellipse cy="6" rx="8" ry="7"/><circle cx="-8" cy="-6" r="3.6"/><circle cx="-2.5" cy="-10" r="3.6"/><circle cx="3.5" cy="-10" r="3.6"/><circle cx="9" cy="-6" r="3.6"/></g>`;
    // tabuleta pendurada com um osso pintado
    s += `<path d="M926,454 L946,436 M994,454 L974,436" stroke="#6E5536" stroke-width="2"/><circle cx="946" cy="436" r="3" fill="#8A6A3A"/><circle cx="974" cy="436" r="3" fill="#8A6A3A"/>`;
    s += `<rect x="908" y="452" width="104" height="44" rx="8" fill="#B87A40" stroke="${CO}" stroke-width="3"/><rect x="913" y="457" width="94" height="34" rx="6" fill="#C88C4E"/><path d="M916,462H1004" stroke="#E0A86A" stroke-width="2" opacity=".6"/>`;
    s += `<g transform="translate(960,474)"><path d="M-26,-6 C-34,-12 -38,-2 -32,0 C-38,2 -34,12 -26,6 L26,6 C34,12 38,2 32,0 C38,-2 34,-12 26,-6Z" fill="#FFF8EA" stroke="${CO}" stroke-width="2.5" stroke-linejoin="round"/><path d="M-20,-2H20" stroke="#E8DCC4" stroke-width="2"/></g>`;
    s += `<path d="M1000,486 c-3,-3 -6,0 -3,3 l3,3 l3,-3 c3,-3 0,-6 -3,-3Z" fill="#E2574C"/>`;
    // telhado: duas águas com telhas, cumeeira e beirados pintados
    const telhas = (lado, cor, clip) => {
      let t = `<g clip-path="url(#${u}${clip})"><path d="${lado > 0 ? 'M960,400L1154,562L1154,506L960,344Z' : 'M960,400L766,562L766,506L960,344Z'}" fill="${cor[0]}"/>`;
      const ang = Math.atan2(160, 192 * lado) * GRAU;
      for (let j = 0; j < 8; j++) for (let k = 0; k < 10; k++) {
        const f = (k + (j % 2) * 0.5) / 9, x = 960 + lado * 194 * f, y = 400 + 162 * f - j * 8.2;
        t += `<rect x="-12" y="-5" width="24" height="10" rx="4.5" transform="translate(${n1(x)},${n1(y)}) rotate(${n1(ang)})" fill="${cor[1 + ((j * 3 + k) % 3)]}" stroke="${cor[4]}" stroke-width="1.4"/>`;
      }
      return t + '</g>';
    };
    s += telhas(-1, ['#D25C3E', '#E06A48', '#D45C3C', '#E87A56', '#8E3A22'], 'telhE') + telhas(1, ['#A9452D', '#B64D33', '#A7432C', '#BE5638', '#6E2A18'], 'telhD');
    s += `<path d="M766,506 L960,344 L1154,506" fill="none" stroke="#6E2A18" stroke-width="3" stroke-linejoin="round"/><path d="M766,562L766,506M1154,562L1154,506" stroke="#6E2A18" stroke-width="3"/>`;
    s += `<rect x="951" y="340" width="18" height="64" rx="7" fill="#B84A32" stroke="#6E2A18" stroke-width="2.5"/><path d="M955,346V398" stroke="#E8846A" stroke-width="2" opacity=".7"/>`;
    s += `<path d="M960,398 L764,562 L764,586 L960,422Z" fill="#F4E7D0" stroke="${CO}" stroke-width="3" stroke-linejoin="round"/><path d="M960,398 L1156,562 L1156,586 L960,422Z" fill="#E6D5B6" stroke="${CO}" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<path d="M954,404 L772,556" stroke="#fff" stroke-width="2.5" opacity=".6"/><circle cx="960" cy="404" r="8" fill="#D25C3E" stroke="${CO}" stroke-width="2.5"/>`;
    // tufos de erva junto à base
    for (const [bx, by] of [[806, 752], [838, 754], [1086, 754], [1116, 752]]) { s += `<g class="cn-erva" data-x="${bx}" data-y="${by}"><path d="M${bx - 10},${by} q2,-14 -4,-22 q8,8 8,20 q2,-16 8,-24 q-2,14 0,26 q4,-12 12,-16 q-6,8 -6,16Z" fill="#6FA845" stroke="#3E6E28" stroke-width="1.5"/></g>`; meta.ervas.push({ x: bx, y: by, f: rnd(0, 6) }); }
    s += `</g>`;
    // tigela da comida e osso
    s += `<g><ellipse cx="1226" cy="760" rx="50" ry="9" fill="#2E2010" opacity=".25"/><path d="M1180,738 C1184,766 1268,766 1272,738Z" fill="url(#${u}tigela)" stroke="#1E3E6A" stroke-width="3"/><ellipse cx="1226" cy="738" rx="46" ry="10" fill="#7DB3EE" stroke="#1E3E6A" stroke-width="3"/><ellipse cx="1226" cy="738" rx="37" ry="6.5" fill="#2C4E7E"/>`;
    for (let i = 0; i < 12; i++) s += `<circle cx="${n1(1196 + rng() * 60)}" cy="${n1(734 + rng() * 5)}" r="${n1(3 + rng() * 1.5)}" fill="${rng() < 0.5 ? '#9A5A2A' : '#B87436'}" stroke="#5E3315" stroke-width="1"/>`;
    s += `<g transform="translate(1226,752) scale(.55)"><path d="M-26,-6 C-34,-12 -38,-2 -32,0 C-38,2 -34,12 -26,6 L26,6 C34,12 38,2 32,0 C38,-2 34,-12 26,-6Z" fill="#fff" stroke="#1E3E6A" stroke-width="3"/></g><path d="M1192,744 C1200,754 1220,756 1240,755" stroke="#fff" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/></g>`;
    s += `<g transform="translate(1300,776) rotate(-14)"><ellipse cx="4" cy="10" rx="40" ry="6" fill="#2E2010" opacity=".2"/><path d="M-26,-6 C-34,-12 -38,-2 -32,0 C-38,2 -34,12 -26,6 L26,6 C34,12 38,2 32,0 C38,-2 34,-12 26,-6Z" fill="#FBF4E4" stroke="${CO}" stroke-width="3" stroke-linejoin="round"/><path d="M-20,-1H20" stroke="#fff" stroke-width="2.5"/></g>`;
    return s;
  }

  // Objetos dos acontecimentos raros e outras coisas vivas
  function svgPombo(u) {
    return `<g class="ev-pombo" pointer-events="none" transform="translate(-300,-300)"><ellipse class="pb-sombra" cy="2" rx="26" ry="5" fill="#2E2010" opacity=".25"/><g class="pb-corpo">
<g class="pb-asaL" transform="translate(-2,-34)"><path d="M0,0 C-14,-8 -40,-6 -52,4 C-38,6 -22,10 0,8Z" fill="#8E96A6" stroke="#4A5060" stroke-width="2"/></g>
<g stroke="#D2575A" stroke-width="3" stroke-linecap="round" fill="none"><path class="pb-p1" d="M-4,-14 L-6,0 M-6,0 L-12,1 M-6,0 L0,1"/><path class="pb-p2" d="M6,-14 L6,0 M6,0 L0,1 M6,0 L12,1"/></g>
<path d="M-22,-28 L-46,-22 L-44,-12 L-20,-18Z" fill="#6E7686" stroke="#3E4352" stroke-width="2"/><path d="M-44,-20 L-45,-14" stroke="#2E3240" stroke-width="3"/>
<ellipse cx="-2" cy="-26" rx="25" ry="16" fill="url(#${u}pombo)" stroke="#3E4352" stroke-width="2.5"/><path d="M-14,-14 C-2,-10 10,-12 18,-20" fill="none" stroke="#C9CFDA" stroke-width="3" opacity=".7"/>
<g class="pb-cab"><path d="M8,-34 C12,-46 18,-50 22,-48 L24,-30 C18,-24 10,-26 8,-34Z" fill="#6F8E7C" stroke="#3E4352" stroke-width="2"/><path d="M12,-38 C16,-42 20,-42 22,-38" fill="none" stroke="#B678C9" stroke-width="3" opacity=".8"/>
<circle cx="22" cy="-52" r="9" fill="#9AA2B2" stroke="#3E4352" stroke-width="2"/><circle cx="25" cy="-54" r="2.6" fill="#E8742A"/><circle cx="25.4" cy="-54.4" r="1.3" fill="#111"/><path d="M30,-52 L38,-49 L30,-47Z" fill="#3A3A3A"/><circle cx="30" cy="-52" r="1.8" fill="#F1F1F1"/></g>
<g class="pb-asa" transform="translate(-4,-30)"><path d="M0,0 C-12,-8 -34,-4 -40,6 C-28,12 -10,12 4,6Z" fill="#9EA6B5" stroke="#4A5060" stroke-width="2"/><path d="M-30,2 L-12,4 M-28,7 L-10,8" stroke="#3E4352" stroke-width="2.6" stroke-linecap="round"/></g></g></g>`;
  }
  function svgBorboleta() {
    const asa = c => `<path d="M0,0 C8,-26 34,-30 30,-8 C28,2 14,4 0,0Z" fill="${c}" stroke="#5A2A0A" stroke-width="2"/><path d="M0,0 C10,6 24,10 18,22 C10,28 2,14 0,0Z" fill="${c}" stroke="#5A2A0A" stroke-width="2"/><circle cx="20" cy="-14" r="4" fill="#fff" opacity=".85"/><circle cx="12" cy="12" r="3" fill="#5A2A0A" opacity=".6"/>`;
    return `<g class="ev-borb" pointer-events="none" transform="translate(-300,-300)"><g class="bb-d">${asa('#F7A531')}</g><g class="bb-e" transform="scale(-1,1)">${asa('#F59A1E')}</g><ellipse rx="3.6" ry="14" fill="#4A2810"/><path d="M-1,-13 C-4,-22 -8,-24 -10,-26 M1,-13 C4,-22 8,-24 10,-26" stroke="#4A2810" stroke-width="1.6" fill="none"/></g>`;
  }
  function svgBola() {
    return `<g class="ev-bola" pointer-events="none" transform="translate(-300,-300)"><ellipse class="bl-s" cy="20" rx="20" ry="4.5" fill="#2E2010" opacity=".25"/><g class="bl-r"><circle r="19" fill="#FFFFFF"/><path d="M0,-19 A19,19 0 0 1 16.5,-9.5 L0,0Z" fill="#E2453C"/><path d="M16.5,9.5 A19,19 0 0 1 0,19 L0,0Z" fill="#2F7DD6"/><path d="M-16.5,9.5 A19,19 0 0 1 -16.5,-9.5 L0,0Z" fill="#F4C22E"/><circle r="4" fill="#fff"/></g><circle r="19" fill="none" stroke="#5A3A2A" stroke-width="2.6"/><ellipse cx="-7" cy="-9" rx="6" ry="3.5" fill="#fff" opacity=".7"/></g>`;
  }
  function svgPardal() {
    return `<g class="ev-pardal" pointer-events="none" transform="translate(960,404)"><g class="pd-c"><path d="M-10,-8 L-24,-4 L-22,0 L-8,-2Z" fill="#7A5232" stroke="#3E2816" stroke-width="1.5"/><ellipse cx="0" cy="-8" rx="13" ry="9" fill="#B58A5E" stroke="#3E2816" stroke-width="2"/><ellipse cx="2" cy="-4" rx="8" ry="4" fill="#EBDCC4"/>
<g class="pd-asa"><path d="M-6,-12 C-2,-14 8,-12 10,-6 C2,-4 -6,-6 -6,-12Z" fill="#8A5E38" stroke="#3E2816" stroke-width="1.5"/></g><g class="pd-cab"><circle cx="10" cy="-16" r="6.5" fill="#9A6A40" stroke="#3E2816" stroke-width="1.6"/><circle cx="12" cy="-17" r="1.4" fill="#111"/><path d="M16,-16 L20,-15 L16,-13Z" fill="#E2B04A"/></g>
<path d="M-2,0 L-3,4 M3,0 L3,4" stroke="#7A5A3A" stroke-width="1.6"/></g></g>`;
  }

  /* =====================================================================================
     5. Montagem e animação
     ===================================================================================== */
  let contagem = 0;
  function montar(raiz, ajudas) {
    const relogio = ajudas && ajudas.relogio;
    const reduzido = !!(ajudas && ajudas.reduzido);
    const AMB = reduzido ? 0.3 : 1;
    const u = 'cao-' + (++contagem) + '-';
    const rng = semente(20261016);
    const meta = { nuvens: [], gaivotas: [], copas: [], roupas: [], cortinas: [], flores: [], flores2: [], ervas: [] };
    const E0 = estadoCabeca(CAB0);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('aria-hidden', 'true');
    let poeiraSvg = '';
    for (let i = 0; i < 12; i++) poeiraSvg += `<circle class="poeira" pointer-events="none" r="10" fill="url(#${u}poeira)" opacity="0"/>`;
    svg.innerHTML = `<defs>${defsCena(u)}${defsCao(u)}</defs>${cenaFundo(u, rng, meta)}${cenaChao(u, rng, meta)}${svgBola()}
<g class="habitat">${cenaCasota(u, rng, meta)}</g>${svgPardal()}${svgCao(u, E0)}<g class="sombraPorta" pointer-events="none"><path d="${PORTA_D}" fill="url(#${u}sombraPorta)"/></g>${svgPombo(u)}${svgBorboleta()}
<g class="folhas" pointer-events="none"><path class="folha" d="M0,-7 C6,-6 9,0 0,8 C-9,0 -6,-6 0,-7Z" fill="#6FAE45" stroke="#3E6E28" stroke-width="1.4" transform="translate(-100,-100)"/><path class="folha" d="M0,-7 C6,-6 9,0 0,8 C-9,0 -6,-6 0,-7Z" fill="#9CCB5E" stroke="#3E6E28" stroke-width="1.4" transform="translate(-100,-100)"/></g>${poeiraSvg}`;
    raiz.appendChild(svg);
    const q = s => svg.querySelector(s), qq = s => Array.from(svg.querySelectorAll(s));

    /* ---------- referências do cão ---------- */
    const caoG = q('.cao'), habitat = q('.habitat'), casotaG = q('.casotaG'), clipCasota = q('.clipCasota'), sombraPorta = q('.sombraPorta');
    const partes = {};
    for (const g of caoG.children) partes[g.getAttribute('data-p')] = { el: g, z: 0, gz: 0, recorte: false };
    const pernasEl = PERNAS.map((p, i) => {
      const camadas = Array.from(partes['perna' + i].el.children);
      return {
        seg: [0, 1, 2, 3].map(k => camadas.map(c => c.querySelector('.g' + k))),
        pe: camadas.map(c => c.querySelector('.pe')),
        dl: camadas[1].querySelector('.dl'), df: camadas[1].querySelector('.df'), al: camadas[1].querySelector('.al'), sb: camadas[2], cache: {}
      };
    });
    const caudaEl = [0, 1, 2, 3, 4].map(k => Array.from(partes.cauda.el.querySelectorAll('.k' + k)));
    const el = {
      sombra: q('.sombra'), trM: q('.trM'), trR: q('.trR'), ptM: q('.ptM'), ptC: q('.ptC'), gaM: q('.gaM'), gaC: q('.gaC'),
      pcM: q('.pcM'), col: partes.pescoco.el.querySelector('.col'), md: q('.md'), mdP: q('.mdP'), cab: q('.cab')
    };
    const cabT = {
      olho0: [q('.olho.l0')], olho1: [q('.olho.l1')], iris0: [q('.l0 .iris')], iris1: [q('.l1 .iris')], psup0: [q('.l0 .psup')], psup1: [q('.l1 .psup')],
      pinf0: [q('.l0 .pinf')], pinf1: [q('.l1 .pinf')], sobr0: [q('.sobr.s0')], sobr1: [q('.sobr.s1')], orelha0: qq('.orelha.o0'), orelha1: qq('.orelha.o1'),
      topete: [q('.topete')], focinho: [q('.focinho')], nariz: [q('.nariz')], bE: [q('.bE1'), q('.bE2')], bD: [q('.bD1'), q('.bD2')], lingua: [q('.lingua')]
    };
    const cabO = { rosto: [q('.rosto')], orelhaF0: [q('.orelha.o0.f')], orelhaF1: [q('.orelha.o1.f')], bE: cabT.bE, bD: cabT.bD, dentes: qq('.cab .dentes'), lingua: cabT.lingua };
    const cabD = { labio: qq('.cab .labio'), interior: qq('.cab .interior'), labioInf: qq('.cab .labioInf'), queixo: qq('.cab .queixo'), queixoC: qq('.cab .queixoC'), dentes: qq('.cab .dentes'), lingua: [q('.cab .lg')], linguaS: [q('.cab .lgS')] };
    const cacheCab = {};
    function aplicarCabeca(E) {
      for (const k in E.t) if (cacheCab['t' + k] !== E.t[k]) { cacheCab['t' + k] = E.t[k]; for (const e of cabT[k]) e.setAttribute('transform', E.t[k]); }
      for (const k in E.op) { const v = n3(E.op[k]); if (cacheCab['o' + k] !== v) { cacheCab['o' + k] = v; for (const e of cabO[k]) e.setAttribute('opacity', v); } }
      for (const k in E.d) if (cacheCab['d' + k] !== E.d[k]) { cacheCab['d' + k] = E.d[k]; for (const e of cabD[k]) e.setAttribute('d', E.d[k]); }
    }
    const tr = (e, v) => { if (e._t !== v) { e._t = v; e.setAttribute('transform', v); } };
    const opa = (e, v) => { v = n3(v); if (e._o !== v) { e._o = v; e.setAttribute('opacity', v); } };

    /* ---------- referências do cenário ---------- */
    const cn = {
      nuvens: qq('.cn-nuvem'), gaivotas: qq('.cn-gaivota'), copas: qq('.cn-copa'), roupas: qq('.cn-roupa'), cortinas: qq('.cn-cortina'),
      flores: qq('.cn-flor'), flores2: qq('.cn-flor2'), ervas: qq('.cn-erva'), raios: q('.cn-raios'), laranjeira: q('.cn-laranjeira'),
      pombo: q('.ev-pombo'), pbAsa: q('.pb-asa'), pbAsaL: q('.pb-asaL'), pbCab: q('.pb-cab'), pbCorpo: q('.pb-corpo'), pbSombra: q('.pb-sombra'), pbP1: q('.pb-p1'), pbP2: q('.pb-p2'),
      borb: q('.ev-borb'), bbD: q('.bb-d'), bbE: q('.bb-e'), bola: q('.ev-bola'), blR: q('.bl-r'), blS: q('.bl-s'),
      pardal: q('.ev-pardal'), pdC: q('.pd-c'), pdAsa: q('.pd-asa'), pdCab: q('.pd-cab'),
      folhas: qq('.folha'), poeira: qq('.poeira')
    };

    /* ---------- estado ---------- */
    const S = {}, V = {};
    for (const k of CHAVES) { S[k] = { x: EM_PE[k], v: 0 }; V[k] = EM_PE[k]; }
    S.th = { x: REP.th, v: 0 };
    let X = REP.x, Z = REP.z, TH = REP.th, ct = Math.cos(TH), st = Math.sin(TH);
    let tempo = 0, modo = 'fora', casotaModo = false, destruido = false;
    let saltoH = 0, sacX = 0, bob = 0, cabBob = { x: 0, v: 0 }, respFase = 0, cauFase = 0;
    let cabPos = [X + 120, YB + KZ * Z - 290], cabVel = 0, corpoVel = 0, ultCab = null;
    const orD = [{ x: 0, v: 0 }, { x: 0, v: 0 }], medalha = { x: 0, v: 0 }, olhos = { x: { x: 0, v: 0 }, y: { x: 0, v: 0 } }, abano = { x: 0, v: 0 };
    let olhoAlvo = [0, 0];
    const pes = PERNAS.map(p => { const gx = X + (p.frente ? 81 : -77) * ct - p.v * st, gz = Z + (p.frente ? 81 : -77) * st + p.v * ct; return { gx, gz, h: 0, sw: false, t: 0, dur: 0.22, fx: gx, fz: gz, lift: 8 }; });
    let quieto = 0, velX = 0, velZ = 0, velTh = 0, antX = X, antZ = Z, antTh = TH;
    const esp = { i: -1, w: 0, u: 0, v: 0, h: 0 };   // pata «especial» (coçar a orelha)

    /* ---------- piscar ---------- */
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
    let tremor = rnd(3, 8);                     // espasmo de orelha ocasional
    function espasmoOrelha(dt) { tremor -= dt; if (tremor <= 0) { tremor = rnd(3, 9); orD[Math.random() < 0.5 ? 0 : 1].v += (Math.random() < 0.5 ? -1 : 1) * rnd(160, 260); } }

    /* ---------- olhar ---------- */
    const sac = { t: 1, x: 0, y: 0, alvo: null };
    function olharPara(A, alvo, lim) {
      let phd, ox, oy;
      if (alvo) {
        const dx = alvo.x - cabPos[0], dy = alvo.y - cabPos[1];
        phd = PI / 2 - clamp(dx / 330, -1, 1) * 1.25;
        A.cabNod += clamp(dy / 520, -0.3, 0.35);
        ox = clamp(dx / 140, -1, 1) * 4.5; oy = clamp(dy / 160, -1, 1) * 4;
      } else { phd = lerp(TH, PI / 2, 0.55); ox = sac.x; oy = sac.y; }
      A.cabYaw = clamp(angDif(TH, phd), -lim, lim);
      olhoAlvo = [ox, oy];
    }
    function saccades(dt) {
      sac.t -= dt;
      if (sac.t <= 0) {
        sac.t = rnd(0.8, 3);
        if (Math.random() < 0.65) { sac.x = rnd(-1.2, 1.2); sac.y = rnd(-1, 1); sac.alvo = null; }
        else { sac.alvo = Math.random() < 0.5 ? { x: rnd(300, 1300), y: rnd(140, 420) } : { x: rnd(350, 1300), y: rnd(600, 760) }; }
      }
    }

    /* ---------- comportamentos ociosos (na rua) ---------- */
    const ladoPerto = () => (ct >= 0 ? 2 : 3);   // pata de trás do lado da câmara
    const ACOES = {
      cocar: { dur: 3.5, aplicar(A, t) {
        misturar(A, SENTADO, janela(t, 0, 0.45, 3.0, 3.45));
        const wl = janela(t, 0.5, 0.8, 2.35, 2.7), i = ladoPerto(), f = Math.sin(t * TAU * 7.5) * passo(0.75, 0.9, t) * (1 - passo(2.2, 2.35, t));
        esp.i = i; esp.w = wl; esp.u = 30 + f * 9; esp.v = PERNAS[i].v * 1.2; esp.h = 132 + f * 10;
        A.cabRoll += -0.36 * wl * Math.sign(ct || 1); A.cabH -= 34 * wl; A.cabU -= 22 * wl; A.cabYaw += 0.15 * wl;
        A.fecho = Math.max(A.fecho, 0.7 * wl); A.boca = 0.22 * wl; A.lingua = 0.3 * wl; A.feliz = 0.45 * wl; A.cauAmp = 0.15;
        if (wl > 0.5 && Math.abs(f) > 0.95) orD[0].v += 30 * Math.sign(f);
      } },
      cheirar: { dur: 3.4, olhar: false, aplicar(A, t) {
        const w = janela(t, 0, 0.45, 2.9, 3.4);
        A.cabU = lerp(A.cabU, 70, w); A.cabH = lerp(A.cabH, -88, w); A.cabNod += 0.95 * w; A.incl -= 0.12 * w; A.alt -= 8 * w;
        A.cabYaw = lerp(0.6, 0.15 + 0.4 * Math.sin(t * 1.7), w); A.nariz = w; A.cauElev = lerp(A.cauElev, 1.05, w); A.cauVel = lerp(A.cauVel, 2.6, w); A.sobr = 0.3 * w;
        olhoAlvo = [2 * w, 4 * w];
      } },
      inclinar: { dur: 2.6, aplicar(A, t) {
        const w = janela(t, 0, 0.25, 2.2, 2.6);
        A.cabRoll += 0.36 * janela(t, 0, 0.28, 1.0, 1.3) - 0.3 * janela(t, 1.1, 1.4, 2.1, 2.5);
        A.sobr = 0.7 * w; A.inclina = 0.55 * w; A.esc = 1 + 0.1 * w; A.orelhas = 0.45 * w; A.cabYaw += 0.3 * w;
        if (Math.abs(t - 1.15) < 0.02) orD[1].v -= 120;
      } },
      sentar: { dur: 5.2, aplicar(A, t) {
        misturar(A, SENTADO, janela(t, 0, 0.6, 4.5, 5.2));
        A.cabYaw += 0.45 * Math.sin(t * 1.3) * janela(t, 0.8, 1.2, 4, 4.5); A.cauAmp = 0.5; A.cauVel = 1.3;
        A.boca = Math.max(A.boca, 0.3 * janela(t, 1.5, 1.8, 3.4, 3.8)); A.lingua = Math.max(A.lingua, 0.55 * janela(t, 1.5, 1.8, 3.4, 3.8)); A.feliz = 0.3 * janela(t, 1.5, 1.8, 3.4, 3.8);
      } },
      bocejar: { dur: 3.0, olhar: false, aplicar(A, t) {
        const w = janela(t, 0, 0.3, 1.6, 2.0);
        A.cabYaw = lerp(0.6, 1.0, janela(t, 0, 0.3, 2.4, 3.0)); olhoAlvo = [0, 0];
        A.cabNod -= 0.32 * w; A.cabH += 12 * w; A.cabU -= 6 * w;
        A.boca = 1.12 * janela(t, 0.2, 0.95, 1.45, 1.85); A.fecho = Math.max(A.fecho, 0.95 * janela(t, 0.3, 0.7, 1.45, 1.8)); A.lingua = 0.12 * w;
        A.sobr = 0.6 * w; A.inclina = 0.3 * w; orD[0].x += 0; A.orelhas = -0.2 * w;
        A.cabRoll += 0.13 * Math.sin((t - 1.9) * TAU * 5) * janela(t, 1.9, 2.0, 2.3, 2.5);
        A.lambe = janela(t, 2.35, 2.5, 2.7, 2.9); A.boca = Math.max(A.boca, 0.12 * A.lambe);
      } },
      ofegar: { dur: 3.4, aplicar(A, t) {
        const w = janela(t, 0, 0.3, 3.0, 3.4);
        A.boca = (0.42 + 0.07 * Math.sin(t * TAU * 3)) * w; A.lingua = 0.85 * w; A.feliz = 0.35 * w; A.sorriso = lerp(A.sorriso, 1, w);
        A.resp = lerp(A.resp, 2.2, w); A.respVel = lerp(A.respVel, 3, w); A.cauVel = lerp(A.cauVel, 2.5, w); A.cauAmp = lerp(A.cauAmp, 0.5, w);
      } },
      abanar: { dur: 2.6, aplicar(A, t) {
        const w = janela(t, 0, 0.25, 2.2, 2.6);
        A.cauVel = lerp(A.cauVel, 5.5, w); A.cauAmp = lerp(A.cauAmp, 0.72, w); A.cauElev = lerp(A.cauElev, 1.05, w);
        A.feliz = 0.55 * w; A.boca = 0.28 * w; A.lingua = 0.35 * w; A.sorriso = lerp(A.sorriso, 1, w); A.orelhas = 0.35 * w;
        abanoAlvo = 0.13 * Math.sin(t * TAU * 2.6) * w; A.alt += 4 * Math.abs(Math.sin(t * TAU * 2.6)) * w;
      } },
      olharVolta: { dur: 3.6, aplicar(A, t) {
        const w = janela(t, 0, 0.3, 3.2, 3.6);
        A.cabYaw += (-0.7 * janela(t, 0, 0.35, 1.2, 1.6) + 0.95 * janela(t, 1.4, 1.8, 2.7, 3.1)) * w;
        olhoAlvo = [4 * (-janela(t, 0, 0.2, 1.2, 1.5) + janela(t, 1.4, 1.6, 2.8, 3.0)), -1.5 * w];
        A.orelhas = 0.3 * w; A.sobr = 0.3 * w;
      } },
      venia: { dur: 2.8, aplicar(A, t) {
        const w = janela(t, 0, 0.35, 2.3, 2.8);
        misturar(A, VENIA, w); A.alt += 6 * Math.sin(t * TAU * 2.2) * passo(0.5, 0.7, t) * w;
      } }
    };
    let abanoAlvo = 0;
    const fora = { acao: null, nome: '', t: 0, prox: 2.5, ultima: '' };
    function escolherAcao() {
      const nomes = Object.keys(ACOES).filter(n => n !== fora.ultima);
      const n = nomes[Math.floor(Math.random() * nomes.length)];
      fora.acao = ACOES[n]; fora.nome = n; fora.ultima = n; fora.t = 0;
    }
    function comportamentoFora(dt, A) {
      const ev = interesse();
      if (ev && fora.acao) { fora.acao = null; fora.prox = 3; }
      esp.i = -1; esp.w = 0; abanoAlvo = 0;
      if (!ev && !reacao.ativa) {
        if (fora.acao) { fora.t += dt; fora.acao.aplicar(A, fora.t); if (fora.t >= fora.acao.dur) { fora.acao = null; fora.prox = rnd(1.8, 4.5); } }
        else { fora.prox -= dt; if (fora.prox <= 0) escolherAcao(); }
      }
      A.alt += Math.sin(tempo * 0.9) * 1.2;
      let thAlvo = REP.th;
      if (ev) {
        if (ev.x < cabPos[0] - 160) thAlvo = 1.3; else if (ev.x > cabPos[0] + 420) thAlvo = 0.05;
        A.orelhas = Math.max(A.orelhas, 0.55); A.cauVel = Math.max(A.cauVel, 2.6); A.cauAmp = Math.max(A.cauAmp, 0.45); A.sobr = Math.max(A.sobr, 0.4); A.esc = Math.max(A.esc, 1.05);
      }
      mola(S.th, thAlvo, 2.6, dt);
      mola(abano, abanoAlvo, 18, dt);
      TH = S.th.x + abano.x; X = REP.x; Z = REP.z;
      if (!(fora.acao && fora.acao.olhar === false)) {
        const yawAcao = A.cabYaw - EM_PE.cabYaw, olhoAcao = olhoAlvo.slice();
        olharPara(A, ev || sac.alvo, 1.3);
        A.cabYaw += fora.acao ? yawAcao : 0;
        if (fora.acao && fora.nome === 'olharVolta') olhoAlvo = olhoAcao;
      }
    }

    /* ---------- dentro da casota ---------- */
    const ACOES_DENTRO = {
      suspiro: { dur: 2.4, aplicar(A, t) { const w = janela(t, 0, 0.8, 1.2, 2.2); A.resp = lerp(A.resp, 3.2, janela(t, 0, 0.6, 0.8, 1.6)); A.fecho = Math.max(A.fecho, 0.65 * w); A.cabH -= 6 * janela(t, 0.8, 1.2, 1.8, 2.4); A.sobr = 0.4 * w; A.inclina = 0.3 * w; } },
      levantar: { dur: 2.6, aplicar(A, t) { const w = janela(t, 0, 0.35, 2.1, 2.6); A.cabH += 34 * w; A.cabNod -= 0.2 * w; A.cabYaw += 0.5 * Math.sin(t * 2.2) * w; A.orelhas = 0.4 * w; A.cruz = lerp(A.cruz, 0.6, w); } },
      cauda: { dur: 1.6, aplicar(A, t) { const w = janela(t, 0, 0.1, 1.3, 1.6); A.cauElev += 0.45 * Math.abs(Math.sin(t * TAU * 2)) * w; if (Math.abs(Math.sin(t * TAU * 2)) < 0.08 && t > 0.2 && w > 0.5 && !this.p) { this.p = 1; soltarPoeira(900, 735, 2, 0.5); } if (Math.abs(Math.sin(t * TAU * 2)) > 0.5) this.p = 0; A.cauAmp = 0.35 * w; A.cauVel = 2.5; A.feliz = 0.3 * w; } },
      lamber: { dur: 1.2, aplicar(A, t) { A.lambe = janela(t, 0.1, 0.25, 0.45, 0.6) + janela(t, 0.6, 0.72, 0.85, 1.0); A.boca = 0.1 * A.lambe; A.cabH += 6 * janela(t, 0, 0.2, 0.9, 1.2); } },
      patas: { dur: 1.6, aplicar(A, t) { const w = janela(t, 0, 0.4, 1.0, 1.6); A.cruz = lerp(A.cruz, 0, w); A.pFU = lerp(A.pFU, 30, w); A.cabH += 10 * w; } }
    };
    const dentro = { acao: null, t: 0, prox: 2, ultima: '' };
    function comportamentoDentro(dt, A) {
      misturar(A, DEITADO, 1);
      const ev = interesse();
      if (!reacao.ativa && !som.ativo) {
        if (dentro.acao) { dentro.t += dt; dentro.acao.aplicar(A, dentro.t); if (dentro.t >= dentro.acao.dur) { dentro.acao = null; dentro.prox = rnd(2, 4.5); } }
        else { dentro.prox -= dt; if (dentro.prox <= 0) { const ns = Object.keys(ACOES_DENTRO).filter(n => n !== dentro.ultima); const n = ns[Math.floor(Math.random() * ns.length)]; dentro.acao = ACOES_DENTRO[n]; dentro.ultima = n; dentro.t = 0; } }
      }
      if (ev) { A.cabH += 22; A.orelhas = Math.max(A.orelhas, 0.4); A.cauAmp = 0.3; A.cauVel = 2.2; }
      X = PORTA.x; Z = -95; TH = PI / 2;
      const y0 = A.cabYaw;
      olharPara(A, ev || sac.alvo, 0.8);
      if (dentro.acao) A.cabYaw += y0 - EM_PE.cabYaw;
    }

    /* ---------- reagir (toque) e latir ---------- */
    const reacao = { ativa: false, t: 0 };
    const salto = { ativo: false, t: 0 };
    function camadaReacao(dt, A, D) {
      if (salto.ativo) {
        salto.t += dt; const t = salto.t;
        D.alt -= 16 * janela(t, 0, 0.05, 0.08, 0.13) + 11 * janela(t, 0.43, 0.47, 0.5, 0.64);
        D.incl += 0.09 * janela(t, 0.1, 0.18, 0.3, 0.44);
        saltoH = (t > 0.1 && t < 0.44) ? 36 * Math.sin(PI * (t - 0.1) / 0.34) : 0;
        if (t > 0.44 && !salto.aterrou) { salto.aterrou = true; orD[0].v -= 140; orD[1].v += 140; }
        if (t > 0.7) { salto.ativo = false; saltoH = 0; }
      }
      if (!reacao.ativa) return;
      reacao.t += dt; const t = reacao.t, w = janela(t, 0, 0.05, 1.0, 1.45);
      A.orelhas = lerp(A.orelhas, 1, w); A.feliz = lerp(A.feliz, 0.85, w); A.sorriso = lerp(A.sorriso, 1, w); A.sobr = lerp(A.sobr, 0.6, w); A.esc = lerp(A.esc, 1.08, w);
      A.boca = Math.max(A.boca, 0.32 * w); A.lingua = Math.max(A.lingua, 0.38 * w);
      A.cauVel = lerp(A.cauVel, 5.5, w); A.cauAmp = lerp(A.cauAmp, modo === 'dentro' ? 0.5 : 0.65, w);
      if (modo === 'dentro') { A.cabH += 36 * w; A.cabNod -= 0.2 * w; A.cabRoll += 0.12 * Math.sin(t * TAU * 2.5) * w; A.cruz = lerp(A.cruz, 0.5, w); A.cauElev += 0.4 * Math.abs(Math.sin(t * TAU * 2.5)) * w; }
      else { A.cauElev = lerp(A.cauElev, 1.05, w); A.cabRoll += 0.08 * Math.sin(t * TAU * 3) * w; }
      if (t > 1.45) reacao.ativa = false;
    }
    let som = { ativo: false, t: 0, lat: [], fim: 0 };
    function camadaSom(dt, A, D) {
      if (!som.ativo) return;
      som.t += dt;
      let env = 0, pre = 0;
      som.lat.forEach((l, i) => {
        const tb = som.t - l.a;
        if (tb > -0.16 && tb < 0) pre = Math.max(pre, passo(-0.16, -0.03, tb));
        if (tb >= 0 && tb < l.d + 0.12) {
          const e = tb < 0.035 ? tb / 0.035 : tb < l.d * 0.7 ? 1 : 1 - (tb - l.d * 0.7) / (l.d * 0.3 + 0.12);
          env = Math.max(env, clamp(e, 0, 1));
          if (!l.k) { l.k = true; orD[0].v += 170; orD[1].v -= 170; medalha.v += 90; }
        }
      });
      const wSom = janela(som.t, 0, 0.15, som.fim - 0.1, som.fim + 0.25);
      D.boca = Math.max(D.boca, env * 0.95);
      D.cabU += env * 11 - pre * 6; D.cabH += env * 8 + pre * 4; D.cabNod += -env * 0.24 + pre * 0.1; D.alt -= env * 3;
      A.sobr = Math.max(A.sobr, 0.3 + env * 0.6); A.orelhas = Math.max(A.orelhas, 0.35 * wSom); A.lingua = Math.max(A.lingua, env * 0.12);
      A.cauVel = Math.max(A.cauVel, 3); A.cauAmp = Math.max(A.cauAmp, 0.45 * wSom);
      if (modo === 'dentro') { A.cabH += 26 * wSom; A.cabNod -= 0.1 * wSom; }
      if (som.t > som.fim + 0.3) som.ativo = false;
    }

    /* ---------- ida para a casota e volta ---------- */
    let seq = null;
    function correrIda(dt, A, D) {
      seq.T += dt; const T = seq.T;
      A.cauVel = 2.4; A.cauAmp = 0.42; A.sorriso = 0.7;
      A.orelhas = 0.55 * janela(T, 0, 0.2, 1.3, 1.7);
      D.alt -= 10 * janela(T, 0.02, 0.15, 0.22, 0.4);
      if (T < 0.25) { TH = seq.th0; }
      if (T < 1.5) {
        const s = sinoide((T - 0.25) / 1.2), p = seq.cam.pos(s), rumo = seq.cam.rumo(Math.max(0.02, Math.min(0.98, s)));
        X = p[0]; Z = p[1];
        TH = seq.th0 + angDif(seq.th0, rumo) * passo(0.2, 0.6, T);
        seq.thFim = TH;
        A.cabYaw = 0.75 - 0.35 * passo(1.0, 1.4, T); olhoAlvo = [4, 1.5];
      } else {
        const k = sinoide((T - 1.5) / 0.45);
        TH = lerp(seq.thFim, -PI / 2, k); X = lerp(870, PORTA.x, k); Z = 140;
        A.cabYaw = -0.55 * janela(T, 1.45, 1.58, 1.75, 1.95); olhoAlvo = [0, 2];
      }
      const cheira = janela(T, 1.2, 1.35, 1.5, 1.7);
      A.cabNod += 0.3 * cheira; A.cabH -= 30 * cheira; A.cabU += 12 * cheira; A.nariz = cheira;
      misturar(A, AGACHADO, passo(1.3, 1.7, T) * (1 - passo(3.2, 3.55, T)));
      A.cabH -= 14 * janela(T, 1.5, 1.8, 2.3, 2.6);
      if (T > 1.9) Z = lerp(140, -150, sinoide((T - 1.9) / 1.0));
      casotaModo = T >= 1.85;
      if (T > 2.8) TH = lerp(-PI / 2, PI / 2, sinoide((T - 2.8) / 0.5));
      A.enrolar = janela(T, 2.6, 2.8, 3.3, 3.5); A.cabU -= 30 * A.enrolar; A.cauElev -= 0.5 * A.enrolar;
      if (T > 3.2) Z = lerp(-150, -95, sinoide((T - 3.2) / 0.5));
      misturar(A, DEITADO, passo(3.25, 3.7, T));
      if (T > 2.95) olhoAlvo = [0, 0];
      if (!seq.e1 && T > 2.45) { seq.e1 = true; casota.v += 22; }
      if (!seq.e2 && T > 3.6) { seq.e2 = true; casota.v -= 34; soltarPoeira(PORTA.x, 748, 7, 1); }
      if (!seq.pardal && T > 1.0) { seq.pardal = true; espantarPardal(); }
      A.resp = lerp(A.resp, 2.8, janela(T, 3.55, 3.7, 3.8, 3.95)); A.fecho = Math.max(A.fecho, 0.5 * janela(T, 3.6, 3.75, 3.85, 4));
      if (T >= 3.9) {
        modo = 'dentro'; seq = null; casotaModo = true; dentro.acao = null; dentro.prox = rnd(1.5, 3);
        const r = resolverIda; resolverIda = null; if (r) r();
        if (pendenteVolta) { pendenteVolta = false; iniciarVolta(); }
      }
    }
    function correrVolta(dt, A, D) {
      seq.T += dt; const T = seq.T;
      misturar(A, AGACHADO, passo(0.05, 0.4, T) * (1 - passo(1.0, 1.3, T)));
      misturar(A, DEITADO, 1 - passo(0.05, 0.4, T));
      A.orelhas = 0.7 * janela(T, 0, 0.15, 0.9, 1.2); A.feliz = 0.35 * janela(T, 0, 0.2, 0.8, 1.1); A.cauVel = 2.6; A.cauAmp = 0.42;
      if (T < 1.8) {
        X = PORTA.x; TH = PI / 2;
        Z = lerp(-95, 190, sinoide((T - 0.42) / 0.7));
        olhoAlvo = [0, 0]; A.cabYaw = 0;
      }
      casotaModo = T < 1.15;
      // sacudir-se
      const ab = janela(T, 1.22, 1.3, 1.62, 1.8), osc = Math.sin((T - 1.22) * TAU * 7);
      A.cabRoll += osc * 0.5 * ab; sacX = osc * 9 * ab; A.fecho = Math.max(A.fecho, 0.85 * ab); A.cauAmp = lerp(A.cauAmp, 0.9, ab); A.cauVel = lerp(A.cauVel, 7, ab);
      if (ab > 0.3) { orD[0].v += osc * 1500 * dt; orD[1].v += osc * 1500 * dt; medalha.v += osc * 400 * dt; }
      if (!seq.p1 && T > 1.32) { seq.p1 = true; soltarPoeira(PORTA.x, 640, 8, 1.6); }
      if (!seq.e1 && T > 0.5) { seq.e1 = true; casota.v += 18; }
      if (T >= 1.8) {
        if (T < 1.95 || !seq.thV) { const k = sinoide((T - 1.8) / 0.3); TH = lerp(PI / 2, PI, k); A.cabYaw = 0.5 * janela(T, 1.75, 1.85, 1.95, 2.1); }
        if (T >= 1.95) {
          const s = sinoide((T - 1.95) / 0.8), p = seq.cam.pos(s), rumo = seq.cam.rumo(Math.max(0.02, Math.min(0.98, s)));
          X = p[0]; Z = p[1];
          const alvoTh = TH + angDif(TH, rumo);
          TH = T < 2.75 ? lerp(TH, alvoTh, passo(1.95, 2.15, T)) : TH;
          seq.thV = true;
          if (T < 2.75) { seq.thFim = TH; A.cabYaw = -0.75 * passo(1.95, 2.2, T); olhoAlvo = [-4, 1]; }
          else { const k = sinoide((T - 2.72) / 0.28); TH = seq.thFim + angDif(seq.thFim, REP.th) * k; olharPara(A, null, 1.2); }
        }
      }
      if (T >= 3.0) {
        modo = 'fora'; seq = null; casotaModo = false; sacX = 0;
        TH = Math.atan2(Math.sin(TH), Math.cos(TH)); S.th.x = TH; S.th.v = 0; fora.acao = null; fora.prox = rnd(2, 4);
        const r = resolverVolta; resolverVolta = null; if (r) r();
        if (pendenteIda) { pendenteIda = false; iniciarIda(); }
      }
    }
    let resolverIda = null, resolverVolta = null, pendenteIda = false, pendenteVolta = false;
    function iniciarIda() {
      fora.acao = null; reacao.ativa = false; salto.ativo = false; saltoH = 0; esp.i = -1;
      seq = { T: 0, th0: TH, thFim: TH, cam: caminho([[X, Z], [X + 90, Z + 30], [770, 150], [870, 140]]) };
      modo = 'indo';
    }
    function iniciarVolta() {
      reacao.ativa = false; dentro.acao = null;
      seq = { T: 0, cam: caminho([[PORTA.x, 190], [860, 200], [REP.x + 110, REP.z + 30], [REP.x, REP.z]]) };
      modo = 'voltando';
    }

    /* ---------- casota, poeira ---------- */
    const casota = { x: 0, v: 0 };
    const particulas = cn.poeira.map(e => ({ e, vida: 1, dur: 1, x: 0, y: 0, vx: 0, vy: 0, r: 10 }));
    function soltarPoeira(x, y, n, forca) {
      let k = 0;
      for (const p of particulas) {
        if (p.vida < p.dur) continue;
        const a = rnd(PI * 1.05, PI * 1.95);
        p.x = x + rnd(-60, 60); p.y = y + rnd(-6, 6); p.vx = Math.cos(a) * rnd(30, 90) * forca; p.vy = Math.sin(a) * rnd(20, 50) * forca; p.vida = 0; p.dur = rnd(0.8, 1.4); p.r = rnd(8, 15);
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

    /* ---------- acontecimentos raros: pombo, borboleta, bola ---------- */
    const ev = { ativo: null, prox: rnd(10, 16), ordem: [] };
    function interesse() { return ev.ativo && ev.ativo.alvo; }
    const EVENTOS = {
      pombo(e) {
        const t = e.t; let x, y, voa = false, dirX = 1, picar = 0, rodar = 0;
        if (t < 1.8) { const s = sinoide(t / 1.8); [x, y] = bezier([[-80, 300], [140, 240], [330, 560], [392, 768]], s); voa = true; rodar = -14 * (1 - s); }
        else if (t < 7.6) {
          const tt = t - 1.8; x = 392 - 34 * sinoide((tt - 1.2) / 1.2) + 30 * sinoide((tt - 3.4) / 1.0); y = 768;
          dirX = (tt > 1.2 && tt < 2.4) ? -1 : 1;
          picar = janela(tt, 0.4, 0.55, 0.7, 0.85) + janela(tt, 2.7, 2.85, 3.0, 3.15) + janela(tt, 3.25, 3.4, 3.55, 3.7) + janela(tt, 4.7, 4.85, 5.0, 5.2);
          e.passo = (tt > 1.2 && tt < 2.4) || (tt > 3.4 && tt < 4.4) ? Math.sin(tt * TAU * 3) : 0;
        } else if (t < 9.6) { const s = passo(0, 1, (t - 7.6) / 2); [x, y] = bezier([[392, 768], [420, 640], [200, 300], [-140, 160]], s); voa = true; dirX = -1; rodar = 10; }
        else { e.fim = true; return; }
        const bat = voa ? Math.sin(t * TAU * 7) : 0;
        tr(cn.pombo, `translate(${n1(x)},${n1(y)}) scale(${dirX},1)`);
        tr(cn.pbCorpo, `rotate(${n1(rodar)})`);
        tr(cn.pbAsa, `translate(-4,-30) rotate(${n1(voa ? -50 + bat * 55 : 0)})`); tr(cn.pbAsaL, `translate(-2,-34) rotate(${n1(voa ? -40 + bat * 50 : 0)})`); opa(cn.pbAsaL, voa ? 1 : 0);
        const bobCab = e.passo ? Math.abs(e.passo) * 5 : 0;
        tr(cn.pbCab, `rotate(${n1(picar * 58)} 12 -30) translate(${n1(bobCab)},0)`);
        tr(cn.pbP1, `rotate(${n1((e.passo || 0) * 18)} -4 -14)`); tr(cn.pbP2, `rotate(${n1(-(e.passo || 0) * 18)} 6 -14)`);
        opa(cn.pbSombra, voa ? clamp(1 - (768 - y) / 200, 0, 1) * 0.25 : 0.25);
        tr(cn.pbSombra, `translate(0,${n1(768 - y)})`);
        e.alvo = { x, y: y - 30 };
      },
      borboleta(e) {
        const t = e.t; let x, y, pousada = false;
        if (t < 4) { const s = sinoide(t / 4); [x, y] = bezier([[1700, 300], [1400, 200], [1150, 560], [1012, 432]], s); x += 30 * Math.sin(t * 3.1); y += 24 * Math.sin(t * 4.3); if (t > 3.4) { const k = passo(3.4, 4, t); x = lerp(x, 1012, k); y = lerp(y, 432, k); } }
        else if (t < 6.4) { x = 1012; y = 432; pousada = true; }
        else if (t < 10) { const s = (t - 6.4) / 3.6; x = lerp(1012, 760, sinoide(s)) + 70 * Math.sin(s * TAU); y = lerp(432, 360, sinoide(s)) + 50 * Math.cos(s * TAU * 1.3); }
        else if (t < 13) { const s = sinoide((t - 10) / 3); x = lerp(760, -120, s) + 30 * Math.sin(t * 3); y = lerp(360, 200, s) + 30 * Math.sin(t * 4); }
        else { e.fim = true; return; }
        const bat = pousada ? 0.55 + 0.45 * Math.cos(t * TAU * 0.8) : Math.abs(Math.cos(t * TAU * 6));
        tr(cn.borb, `translate(${n1(x)},${n1(y)}) rotate(${pousada ? 0 : n1(12 * Math.sin(t * 5))})`);
        tr(cn.bbD, `scale(${n3(0.15 + 0.85 * bat)},1)`); tr(cn.bbE, `scale(${n3(-(0.15 + 0.85 * bat))},1)`);
        e.alvo = { x, y };
      },
      bola(e) {
        const t = e.t, x = 1700 - 1880 * (1 - Math.exp(-t * 0.32)) / (1 - Math.exp(-8 * 0.32)), salt = Math.abs(Math.sin(t * 4.2)) * 34 * Math.exp(-t * 0.9);
        if (t > 8 || x < -60) { e.fim = true; return; }
        const y = 652 - salt;
        tr(cn.bola, `translate(${n1(x)},${n1(y)})`); tr(cn.blR, `rotate(${n1((x - 1700) / 19 * GRAU)})`); tr(cn.blS, `translate(0,${n1(salt)}) scale(${n3(1 - salt / 80)})`);
        e.alvo = { x, y };
      }
    };
    function esconderEvento(tipo) { const g = tipo === 'pombo' ? cn.pombo : tipo === 'borboleta' ? cn.borb : cn.bola; tr(g, 'translate(-300,-300)'); }
    function atualizarEventos(dt) {
      if (!ev.ativo) {
        ev.prox -= dt;
        if (ev.prox <= 0 && modo !== 'indo' && modo !== 'voltando') {
          if (!ev.ordem.length) ev.ordem = ['pombo', 'borboleta', 'bola'].sort(() => Math.random() - 0.5);
          ev.ativo = { tipo: ev.ordem.pop(), t: 0, alvo: null, fim: false };
        }
        return;
      }
      const e = ev.ativo; e.t += dt; EVENTOS[e.tipo](e);
      if (e.fim) { esconderEvento(e.tipo); ev.ativo = null; ev.prox = rnd(15, 32) * (reduzido ? 1.6 : 1); }
    }

    /* ---------- pardal no telhado da casota ---------- */
    const pardal = { estado: 'pousado', t: 0, x: 960, y: 404, prox: rnd(2, 5), salto: 0 };
    function espantarPardal() { if (pardal.estado === 'pousado') { pardal.estado = 'foge'; pardal.t = 0; } }
    function atualizarPardal(dt) {
      const p = pardal; p.t += dt;
      let bat = 0, rot = 0, cab = 0;
      if (p.estado === 'pousado') {
        p.prox -= dt;
        if (p.prox <= 0) { p.prox = rnd(1.5, 4); p.salto = 0.3; p.dx = (p.x > 960 ? -1 : 1) * rnd(8, 16); }
        if (p.salto > 0) { p.salto -= dt; const k = 1 - p.salto / 0.3; p.x += p.dx * dt / 0.3; p.y = 404 - 6 * Math.sin(PI * k) + (Math.abs(p.x - 960) * 0.83); }
        else p.y = 404 + Math.abs(p.x - 960) * 0.83;
        cab = Math.sin(p.t * 2) > 0.85 ? 35 : 0;
        if (modo === 'indo' || reacao.ativa || som.ativo) espantarPardal();
      } else if (p.estado === 'foge') {
        const k = p.t / 1.6; p.x += 260 * dt; p.y -= 220 * dt * (1 - k * 0.3); bat = Math.sin(p.t * TAU * 9); rot = -20;
        if (p.t > 1.8) { p.estado = 'longe'; p.t = 0; p.espera = rnd(10, 18); }
      } else if (p.estado === 'longe') {
        p.x = -100; p.y = -100;
        if (p.t > p.espera && modo !== 'indo' && modo !== 'voltando' && !reacao.ativa && !som.ativo) { p.estado = 'volta'; p.t = 0; }
      } else if (p.estado === 'volta') {
        const k = sinoide(p.t / 2.2); const pos = bezier([[1700, 120], [1300, 80], [1050, 300], [960, 404]], k); p.x = pos[0]; p.y = pos[1]; bat = k < 0.97 ? Math.sin(p.t * TAU * 8) : 0; rot = 8 * (1 - k);
        if (p.t > 2.2) { p.estado = 'pousado'; p.t = 0; p.x = 960; p.y = 404; }
      }
      const vira = (p.estado === 'volta') ? -1 : 1;
      tr(cn.pardal, `translate(${n1(p.x)},${n1(p.y)}) rotate(${n1(rot)}) scale(${vira},1)`);
      tr(cn.pdAsa, `rotate(${n1(bat ? -40 + bat * 50 : 0)} -6 -12)`); tr(cn.pdCab, `rotate(${n1(cab)} 8 -12)`);
    }

    /* ---------- cenário vivo ---------- */
    const folhasCaem = cn.folhas.map(e => ({ e, t: rnd(2, 9), ativa: false }));
    function atualizarCena(dt) {
      const a = AMB;
      cn.nuvens.forEach((e, i) => { const m = meta.nuvens[i]; m.x += m.v * dt * (reduzido ? 0.4 : 1); if (m.x > 1800) m.x = -260; tr(e, `translate(${n1(m.x)},${m.y}) scale(${m.e})`); });
      tr(cn.raios, `rotate(${n1(tempo * 2.2 * a)} 470 92)`);
      cn.gaivotas.forEach((e, i) => { const m = meta.gaivotas[i]; m.x += m.v * dt; if (m.x > 1750) m.x = -150; const asa = 0.35 + 0.65 * Math.abs(Math.sin(tempo * (Math.sin(tempo * 0.3 + i) > 0.6 ? 6 : 1.2) + i)); tr(e, `translate(${n1(m.x)},${n1(m.y + 14 * Math.sin(tempo * 0.4 + m.f))}) scale(1,${n3(asa)})`); });
      cn.copas.forEach((e, i) => { const m = meta.copas[i]; tr(e, `rotate(${n1(1.6 * a * Math.sin(tempo * 0.7 + m.f) + 0.6 * a * Math.sin(tempo * 1.9 + m.f))} ${m.x} ${m.y})`); });
      cn.roupas.forEach((e, i) => { const m = meta.roupas[i]; tr(e, `translate(${m.x},${m.y}) rotate(${n1(5 * a * Math.sin(tempo * 1.1 + m.f) + 2 * a * Math.sin(tempo * 2.7 + m.f))})`); });
      cn.cortinas.forEach((e, i) => { const m = meta.cortinas[i]; tr(e, `translate(${m.x},${m.y}) skewX(${n1(4 * a * Math.sin(tempo * 0.9 + m.f))}) translate(${-m.x},${-m.y})`); });
      cn.flores.forEach((e, i) => { const m = meta.flores[i]; tr(e, `rotate(${n1(4 * a * Math.sin(tempo * 1.3 + m.f))} ${m.x} ${m.y})`); });
      cn.flores2.forEach((e, i) => { const m = meta.flores2[i]; tr(e, `rotate(${n1(6 * a * Math.sin(tempo * 1.6 + m.f))} ${m.x} ${m.y})`); });
      cn.ervas.forEach((e, i) => { const m = meta.ervas[i]; tr(e, `rotate(${n1(5 * a * Math.sin(tempo * 1.4 + m.f))} ${m.x} ${m.y})`); });
      tr(cn.laranjeira, `rotate(${n1(1.4 * a * Math.sin(tempo * 0.8))} 1490 620)`);
      for (const f of folhasCaem) {
        f.t -= dt;
        if (!f.ativa && f.t <= 0) { f.ativa = true; f.vida = 0; f.x0 = rnd(60, 340); f.y0 = rnd(220, 360); f.fim = rnd(640, 700); }
        if (f.ativa) {
          f.vida += dt; const y = f.y0 + f.vida * 46, x = f.x0 + 26 * Math.sin(f.vida * 2.2) + f.vida * 12;
          if (y > f.fim) { f.ativa = false; f.t = rnd(6, 14); tr(f.e, 'translate(-100,-100)'); }
          else tr(f.e, `translate(${n1(x)},${n1(y)}) rotate(${n1(40 * Math.sin(f.vida * 2.2))})`);
        }
      }
      atualizarPardal(dt);
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
      const dur = clamp(0.26 - vel * 0.0003, 0.15, 0.26), lift = andar ? 9 + vel * 0.025 : 7;
      const algum = pes.some(p => p.sw);
      quieto = andar ? 0 : quieto + dt;
      if (!algum && saltoH === 0) {
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
        if (p.sw || !livre(i) || saltoH > 0) continue;
        const dx = p.gx - X, dz = p.gz - Z, fu = dx * ct + dz * st;
        if (Math.hypot(fu - at[0], 14 - at[1]) > 0.95 * (pn.L[0] + pn.L[1] + pn.L[2]) || Math.abs(fu - at[0]) > 70) { p.sw = true; p.t = 0; p.fx = p.gx; p.fz = p.gz; p.dur = Math.min(dur, 0.18); p.lift = lift; }
      }
      bob = 0;
      for (let i = 0; i < 4; i++) {
        const p = pes[i];
        if (!p.sw) continue;
        p.t += dt / p.dur;
        const k = Math.min(1, p.t), alvo = predizer(pref[i][0], pref[i][1], p.dur * (1 - k) + p.dur * 0.5), e = sinoide(k);
        p.gx = lerp(p.fx, alvo[0], e); p.gz = lerp(p.fz, alvo[1], e); p.h = p.lift * Math.sin(PI * k);
        bob = Math.max(bob, Math.sin(PI * k) * clamp(vel / 250, 0, 1) * 5);
        if (p.t >= 1) { p.sw = false; p.h = 0; p.gx = alvo[0]; p.gz = alvo[1]; }
      }
    }

    /* ---------- geometria: projetar e desenhar o cão ---------- */
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
      const cb = Math.cos(V.incl), sb = Math.sin(V.incl), hc = HC + V.alt + bob, fl = 0.9 * (1 - 0.3 * V.enrolar);   // enrolar: encolhe o corpo para se virar na casota
      const loc = (pu, ph) => [pu * fl * cb - ph * sb, hc + pu * fl * sb + ph * cb];
      const ombro = loc(75, -20), anca = loc(-75, -24), pesc = loc(98, 32), cauR = loc(-120, 18), peitoP = loc(112, -5), garP = loc(-118, 0);
      const br = Math.sin(respFase) * V.resp;
      atualizarPassos(dt, ombro, anca);
      const zz = (uu, v) => uu * st + v * ct;
      // tronco (desenho de lado, achatado de frente; luz sempre de cima)
      const cw = (ct >= 0 ? 1 : -1) * Math.max(Math.abs(ct), 0.42), fr = 1 - Math.min(Math.abs(ct), 0.42) / 0.42;
      const ma = cw * cb * fl, mc = cw * sb * (1 - fr), mb = (KZ * st * cb - sb) * (1 - fr) * fl, md = KZ * st * sb + cb;
      tr(el.trM, `matrix(${n3(ma)},${n3(mb)},${n3(mc)},${n3(md)},${n1(X + sacX)},${n1(YB + KZ * Z - hc - saltoH)})`);
      tr(el.trR, `scale(${n3(1 + 0.004 * br)},${n3(1 + 0.018 * br)})`);
      partes.tronco.z = 0; partes.tronco.gz = Z;
      // peito e garupa vistos de frente/de trás
      const pp = P(peitoP[0], 0, peitoP[1]), sxp = passo(0.3, 0.95, st);
      const deit = clamp(-V.alt / 88, 0, 1) * V.fixF;
      tr(el.ptM, `translate(${n1(pp[0])},${n1(pp[1] - 22 * deit)}) scale(${n3(Math.pow(sxp, 0.85))},${n3((1 + 0.022 * br + Math.max(0, V.incl) * 0.35) * (1 - 0.45 * deit))})`);
      opa(el.ptM, passo(0, 0.08, sxp));
      if (el.ptC._so !== n3(passo(0.5, 0.85, st))) { el.ptC._so = n3(passo(0.5, 0.85, st)); el.ptC.setAttribute('stroke-opacity', el.ptC._so); }
      partes.peito.z = zz(peitoP[0], 0) + 1; partes.peito.gz = Z + zz(peitoP[0], 0);
      const pg = P(garP[0], 0, garP[1]), sxg = passo(0.2, 0.95, -st);
      opa(el.gaM, passo(0, 0.08, sxg));
      tr(el.gaM, `translate(${n1(pg[0])},${n1(pg[1])}) scale(${n3(Math.pow(sxg, 0.85))},1)`);
      if (el.gaC._so !== n3(passo(0.5, 0.85, -st))) { el.gaC._so = n3(passo(0.5, 0.85, -st)); el.gaC.setAttribute('stroke-opacity', el.gaC._so); }
      partes.garupa.z = zz(garP[0], 0) + 1; partes.garupa.gz = Z + zz(garP[0], 0);
      // pescoço, coleira e cabeça
      mola(cabBob, -bob * 1.2, 16, dt);
      const hu = pesc[0] + V.cabU, hh = pesc[1] + V.cabH + br * 1.6 + cabBob.x;
      const pn = P(pesc[0], 0, pesc[1]), ph = P(hu, 0, hh);
      const angP = segmento([el.pcM], pn, ph, 100);
      const ccU = lerp(pesc[0], hu, 0.17), ccH = lerp(pesc[1], hh, 0.17), pc = P(ccU, 0, ccH);
      tr(el.col, `translate(${n1(pc[0])},${n1(pc[1])}) rotate(${n1(angP + 180)})`);
      partes.pescoco.z = zz(pesc[0], 0) - 1; partes.pescoco.gz = Z + zz(pesc[0], 0);
      const roll = V.cabRoll;
      tr(el.cab, `translate(${n1(ph[0])},${n1(ph[1])}) rotate(${n1(roll * GRAU)})`);
      partes.cabeca.z = zz(hu, 0) + 45; partes.cabeca.gz = Z + zz(hu, 0);
      // velocidades para as orelhas e a medalha
      if (ultCab) { const vx = (ph[0] - ultCab[0]) / Math.max(dt, 1e-3); cabVel = lerp(cabVel, vx, 1 - Math.exp(-dt * 12)); }
      ultCab = ph; cabPos = ph;
      for (let i = 0; i < 2; i++) molaElastica(orD[i], clamp(-cabVel * 0.05, -24, 24), 150, 7, dt);
      const pm = P(ccU + 44, 0, ccH - 8);
      molaElastica(medalha, clamp(-cabVel * 0.08, -35, 35), 120, 6, dt);
      tr(el.md, `translate(${n1(pm[0])},${n1(pm[1])})`); tr(el.mdP, `rotate(${n1(medalha.x)})`);
      opa(el.md, passo(-0.3, 0, st));
      partes.medalha.z = partes.cabeca.z - 0.5; partes.medalha.gz = Z + zz(ccU + 44, 0);
      // cabeça (feições)
      mola(olhos.x, olhoAlvo[0], 30, dt); mola(olhos.y, olhoAlvo[1], 30, dt);
      const fecho = Math.max(V.fecho, piscarV);
      aplicarCabeca(estadoCabeca({ phi: TH + V.cabYaw, nu: V.cabNod, boca: Math.max(V.boca, Dboca), lingua: V.lingua, sorriso: V.sorriso, feliz: V.feliz, fecho, esc: V.esc, sobr: V.sobr, inclina: V.inclina, perk: V.orelhas, orDin: [orD[0].x, orD[1].x], olhoX: olhos.x.x, olhoY: olhos.y.x, nariz: V.nariz * Math.sin(tempo * TAU * 7.5), lambe: V.lambe, rollDeg: roll * GRAU }));
      // patas
      for (let i = 0; i < 4; i++) {
        const pn2 = PERNAS[i], pe = pes[i], at = pn2.frente ? ombro : anca, L = pn2.L, els = pernasEl[i];
        let w = pn2.frente ? V.fixF : V.fixT, fx = pe.gx, fz = pe.gz, fh = pe.h;
        if (esp.i === i) w = Math.max(w, esp.w);
        if (w > 0.001) {
          let tu, tv, th;
          if (pn2.frente) { tu = ombro[0] + V.pFU; tv = pn2.v * (1 - 0.85 * V.cruz) - Math.sign(pn2.v) * V.cruz * 12; th = 0; }
          else { tu = anca[0] + V.pTU; tv = pn2.v + Math.sign(pn2.v) * V.pTV; th = 0; }
          if (esp.i === i) { const k = esp.w; tu = lerp(tu, esp.u, k); tv = lerp(tv, esp.v, k); th = lerp(th, esp.h, k); }
          const wx = X + tu * ct - tv * st, wz = Z + tu * st + tv * ct;
          fx = lerp(fx, wx, w); fz = lerp(fz, wz, w); fh = lerp(fh, th, w);
          if (w > 0.98) { pe.gx = fx; pe.gz = fz; pe.h = 0; pe.sw = false; }
        }
        const dx = fx - X, dz = fz - Z, fu = dx * ct + dz * st, fv = -dx * st + dz * ct, fhh = fh + 14 + saltoH * 0.25;
        // IK em dois tempos: 1.º ombro/anca → pé com o osso de cima e um «osso virtual» (parte de baixo dobrada q×),
        // 2.º cotovelo/joelho → pé com os dois ossos de baixo. q vem da pose (em pé quase esticada, sentado bem dobrada).
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
        opa(els.sb, clamp(-(pn2.v * ct) / 40, 0, 1) * 0.3);
        partes['perna' + i].z = zz(Math.max(at[0], pn2.frente ? fu + 10 : at[0]), pn2.v) + (pn2.frente && V.cruz > 0.5 ? (i === 0 ? 2 : -2) : 0);
        partes['perna' + i].gz = Z + zz(at[0], pn2.v);
      }
      // cauda (onda: a ponta atrasa-se em relação à base)
      let tu = cauR[0], tv = 0, th = cauR[1], ant = P(tu, tv, th), ang = 0;
      for (let k = 0; k < 4; k++) {
        const fase = cauFase - k * 0.6;
        const wv = V.cauAmp * Math.sin(fase) + V.cauLado * (1 - k * 0.12);
        const e = V.cauElev + V.incl + k * V.cauCurl + 0.22 * V.cauAmp * Math.sin(fase + 1.2);
        tu += -Math.cos(e) * Math.cos(wv) * 26; tv += Math.cos(e) * Math.sin(wv) * 26; th = Math.max(8, th + Math.sin(e) * 26);
        const cur = P(tu, tv, th);
        ang = segmento(caudaEl[k], ant, cur, 26);
        ant = cur;
      }
      for (const e of caudaEl[4]) tr(e, `translate(${n1(ant[0])},${n1(ant[1])}) rotate(${n1(ang)})`);
      partes.cauda.z = Math.max(zz(cauR[0], 0), zz(tu, tv)) + 2; partes.cauda.gz = Z + zz(cauR[0], 0);
      // sombra no chão
      const sh = P(0, 0, -saltoH);
      tr(el.sombra, `translate(${n1(sh[0])},${n1(YB + KZ * Z)}) scale(${n1((128 * Math.abs(ct) + 78 * Math.abs(st) + 26 + (V.alt < -60 ? 16 : 0)) * (1 - saltoH / 160))},${n1((15 + 9 * Math.abs(st)) * (1 - saltoH / 160))})`);
      opa(el.sombra, 1 - saltoH / 90);
      partes.sombra.z = -1e4; partes.sombra.gz = Z;
      ordenarERecortar();
    }
    const recorte = `url(#${u}recorte)`;
    let ordemAtual = '';
    function ordenarERecortar() {
      const lista = Object.keys(partes).sort((a, b) => partes[a].z - partes[b].z);
      const chave = lista.join();
      if (chave !== ordemAtual) { ordemAtual = chave; for (const k of lista) caoG.appendChild(partes[k].el); }
      for (const k of lista) {
        const p = partes[k], r = casotaModo && p.gz < 0;
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
      atualizarCena(dt); atualizarEventos(dt); atualizarPoeira(dt); saccades(dt); espasmoOrelha(dt);
      const A = Object.assign({}, EM_PE), D = { alt: 0, incl: 0, cabU: 0, cabH: 0, cabNod: 0, boca: 0 };
      if (modo === 'fora') comportamentoFora(dt, A);
      else if (modo === 'indo') correrIda(dt, A, D);
      else if (modo === 'dentro') comportamentoDentro(dt, A);
      else if (modo === 'voltando') correrVolta(dt, A, D);
      camadaReacao(dt, A, D); camadaSom(dt, A, D);
      piscarV = piscar(dt);
      for (const k of CHAVES) { mola(S[k], A[k], OMEGA[k] || 9, dt); V[k] = S[k].x; }
      V.alt += D.alt; V.incl += D.incl; V.cabU += D.cabU; V.cabH += D.cabH; V.cabNod += D.cabNod; Dboca = D.boca;
      respFase += dt * TAU * V.respVel; cauFase += dt * TAU * V.cauVel;
      // velocidades do corpo (para prever os passos)
      const kv = 1 - Math.exp(-dt * 14);
      velX = lerp(velX, (X - antX) / dt, kv); velZ = lerp(velZ, (Z - antZ) / dt, kv); velTh = lerp(velTh, angDif(antTh, TH) / dt, kv);
      antX = X; antZ = Z; antTh = TH;
      molaElastica(casota, 0, 260, 9, dt);
      if (Math.abs(casota.x) > 0.01 || Math.abs(casota.v) > 0.01 || casotaG._t) {
        const t = Math.abs(casota.x) < 0.01 && Math.abs(casota.v) < 0.01 ? '' : `rotate(${n3(casota.x * 0.06)} 960 750)`;
        if (t) { tr(casotaG, t); tr(clipCasota, t); tr(sombraPorta, t); } else if (casotaG._t) { for (const e of [casotaG, clipCasota, sombraPorta]) { e._t = ''; e.removeAttribute('transform'); } }
      }
      // sombra da porta por cima do cão só enquanto ele está lá dentro
      opa(sombraPorta, modo === 'dentro' ? 1 : modo === 'indo' && seq ? passo(2.0, 2.6, seq.T) : modo === 'voltando' && seq ? 1 - passo(0.35, 0.8, seq.T) : 0);
      desenhar(dt);
    }
    quadro(16);
    const desligar = relogio ? relogio.aCada(quadro) : () => {};

    return {
      animal: caoG,
      habitat,
      reagir() {
        if (destruido || modo === 'indo' || modo === 'voltando') return;
        reacao.ativa = true; reacao.t = 0;
        orD[0].v -= 120; orD[1].v += 120;
        if (modo === 'fora') {
          fora.acao = null; fora.prox = rnd(2.5, 4.5); esp.i = -1;
          if (!salto.ativo && !reduzido) { salto.ativo = true; salto.t = 0; salto.aterrou = false; }
        } else dentro.acao = null;
      },
      fazerSom(ms, silabas) {         // silabas = [[início s, duração s], …] medidas no som da app (ferramentas/limpar-voz.js)
        if (destruido) return;
        ms = Number(ms) || 1500;
        let lat;
        if (Array.isArray(silabas) && silabas.length) lat = silabas.map(([a, d]) => ({ a, d: Math.min(0.3, d), k: false }));
        else { const s = ms / 1000, n = clamp(Math.round(s / 0.6), 1, 5); lat = []; for (let i = 0; i < n; i++) lat.push({ a: 0.05 + i * s / n, d: Math.min(0.2, s / n * 0.5), k: false }); }
        som = { ativo: true, t: 0, lat, fim: lat[lat.length - 1].a + lat[lat.length - 1].d };
        if (modo === 'fora') { fora.acao = null; fora.prox = Math.max(fora.prox, 2.5); }
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
      _teste: { acao(n) { if (ACOES[n] && modo === 'fora') { fora.acao = ACOES[n]; fora.nome = n; fora.t = 0; } else if (ACOES_DENTRO[n] && modo === 'dentro') { dentro.acao = ACOES_DENTRO[n]; dentro.t = 0; } }, evento(n) { if (!ev.ativo && EVENTOS[n]) ev.ativo = { tipo: n, t: 0, alvo: null, fim: false }; }, estado: () => ({ modo, X, Z, TH, acao: fora.nome, pes: pes.map(p => p.sw), estica: estica.map(n3) }) },
      destruir() { destruido = true; try { desligar(); } catch (e) { /* nada */ } }
    };
  }

  return { icone: gerarIcone(), montar };
})();
