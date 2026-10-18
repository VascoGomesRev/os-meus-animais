/* Fogo — «Os Meus Animais», grupo «Elementos». Contrato e regras: REGRAS-ANIMAIS.md (§2 e §11).
   Cena: uma fogueira de acampamento numa noite de verão, numa clareira de um pinhal português. Céu noturno com
   estrelas, a Via Láctea e a lua cheia (uma nuvem fina passa devagar), cumeada ao longe com pinheiros pequeninos,
   pinheiros-bravos e pinheiros-mansos em silhueta no plano do meio, e dois pinheiros grandes nas bordas (o da
   direita tem um ramo com um mocho-galego). Na clareira: uma tenda de lona com a porta aberta (saco-cama lá dentro),
   lenha empilhada, um cepo com uma caneca de esmalte a fumegar, um tronco para sentar, pinhas e caruma no chão,
   ervas à frente e pirilampos.
   A única luz forte é a da fogueira: os objetos estão iluminados do lado virado para ela, as sombras fogem dela e a
   luz no chão e nas coisas tremeluz com as chamas (gradientes radiais com opacidade; sem filtros).
   O fogo é a personagem (sem cara): roda de pedras (as de trás mostram a face acesa, as da frente só o rebordo),
   cama de brasas e cinza, lenha cruzada com fendas incandescentes, e chamas em quatro camadas (vermelha → laranja →
   amarela → quase branca). Cada camada é um só path refeito a cada quadro com várias «línguas» de fogo: uma onda
   sobe por cada língua, a altura tremeluz, e de vez em quando a ponta solta-se e sobe a apagar-se. Línguas pequenas
   lambem os troncos da frente. Faúlhas em três paths (um por brilho), fumo em círculos com gradiente, brasas que pulsam.
   Variações ociosas (4–9 s): estalo com jorro de faúlhas, aragem que deita as chamas, tronco que assenta e aviva as
   brasas, rolo de fumo maior, labareda que salta. Reações ao toque (alternadas): crescer com chuva de faúlhas,
   «puf» de faúlhas em espiral, dança das chamas com dois repuxos. Acontecimentos raros (15–40 s): estrela cadente,
   o mocho dá uma volta a voar (passa à frente da lua), uma rajada abana a tenda.
   Organização:
     1) utilidades (matemática, curvas)
     2) chamas: línguas de fogo e camadas
     3) ícone do menu
     4) cenário (céu, pinhal, chão, tenda, lenha, roda de pedras, cepo, banco, pinheiros da frente, mocho, ervas)
     5) montar(): estado, tarefas (variações, reações, acontecimentos), partículas, luz, relógio único */
'use strict';
MODULOS.fogo = (() => {
  const NS = 'http://www.w3.org/2000/svg';

  /* ================= 1) Utilidades ================= */
  const PI = Math.PI, RAD = PI / 180;
  const lerp = (a, b, t) => a + (b - a) * t;
  const limita = (v, a, b) => v < a ? a : v > b ? b : v;
  const n = v => Math.round(v * 10) / 10;
  const n3 = v => Math.round(v * 1000) / 1000;
  const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const esai = t => 1 - Math.pow(1 - t, 3);
  const sino = t => Math.sin(PI * limita(t, 0, 1));
  const aleat = (a, b) => a + Math.random() * (b - a);
  const escolhe = v => v[Math.random() * v.length | 0];
  function semente(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  // sobe depressa até a (fração 0–1) e desce devagar até ao fim
  const envelope = (u, a) => u < a ? esai(u / a) : 1 - eio((u - a) / (1 - a));
  // curva suave fechada por pontos (Catmull-Rom → Bézier); o ponto «canto» fica em bico (ponta da chama)
  function curvaFechada(p, canto) {
    const m = p.length;
    let d = 'M' + n(p[0][0]) + ',' + n(p[0][1]);
    for (let i = 0; i < m; i++) {
      const a = p[(i + m - 1) % m], b = p[i], c = p[(i + 1) % m], e = p[(i + 2) % m];
      const k1 = i === canto ? 0 : 1 / 6, k2 = (i + 1) % m === canto ? 0 : 1 / 6;
      d += 'C' + n(b[0] + (c[0] - a[0]) * k1) + ',' + n(b[1] + (c[1] - a[1]) * k1) + ' ' +
        n(c[0] - (e[0] - b[0]) * k2) + ',' + n(c[1] - (e[1] - b[1]) * k2) + ' ' + n(c[0]) + ',' + n(c[1]);
    }
    return d + 'Z';
  }
  // mancha irregular (pedras, copas, brasas); os pontos rodam no sentido dos ponteiros do relógio (silhuetas juntas num path)
  function blobD(cx, cy, rx, ry, r, k = 9, irr = .18) {
    const p = [];
    for (let i = 0; i < k; i++) { const a = i / k * 2 * PI, f = 1 + (r() - .5) * 2 * irr; p.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]); }
    return curvaFechada(p, -1);
  }
  function catmull(pts, u) {
    const ns = pts.length - 1, s = Math.min(ns - 1e-6, Math.max(0, u) * ns), i = Math.floor(s), t = s - i;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(ns, i + 2)];
    const f = (a, b, c, d) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
    return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
  }

  /* ================= 2) Chamas ================= */
  const CX = 800, BY = 712;                    // centro da fogueira e base das chamas
  const NL = 6;                                // pontos de cada lado de uma língua de fogo
  // largura da língua ao longo da altura s (0 = base, 1 = ponta): bojo em baixo, afina até ao bico
  const perfil = s => Math.pow(1 - s, 1.15) * (.82 + .3 * Math.sin(PI * Math.min(1, s * 2.4)));
  // desvio lateral do eixo: uma onda que sobe (fase diminui com s) e a inclinação do vento, maior lá em cima
  function desvio(s, h, onda, ph, T, inc) {
    return Math.pow(s, 1.25) * h * (onda * (.11 * Math.sin(T * 5.1 + ph - s * 3.4) + .05 * Math.sin(T * 8.7 + ph * 1.7 - s * 7)) + inc * .55 * s);
  }
  // uma língua de fogo com base em (cx, by), meia-largura w e altura h → subcaminho fechado
  function lingua(cx, by, w, h, onda, ph, T, inc) {
    const esq = [], dir = [];
    for (let i = 0; i < NL; i++) {
      const s = i / NL, x = cx + desvio(s, h, onda, ph, T, inc), r = w * perfil(s), y = by - s * h;
      esq.push([x - r, y]); dir.push([x + r, y]);
    }
    const pts = esq.concat([[cx + desvio(1, h, onda, ph, T, inc), by - h]], dir.reverse(), [[cx + desvio(0, h, onda, ph, T, inc), by + w * .42]]);
    return curvaFechada(pts, NL);
  }
  // camadas, de trás para a frente: [deslocamento x da base, meia-largura, altura]
  const CAMADAS = [
    { y: 0, linguas: [[-130, 44, 150], [-84, 60, 262], [-32, 70, 372], [26, 66, 328], [82, 58, 248], [128, 42, 158], [-2, 96, 205]] },
    { y: 4, linguas: [[-102, 40, 178], [-52, 52, 292], [4, 58, 335], [56, 50, 262], [102, 36, 168], [0, 84, 188]] },
    { y: 8, linguas: [[-64, 34, 165], [-16, 42, 246], [36, 38, 206], [0, 64, 138]] },
    { y: 12, linguas: [[-18, 28, 104], [20, 24, 90], [0, 44, 72]] }
  ];
  // línguas pequenas que lambem os troncos da frente (laranja e amarela)
  const FRENTE = [
    [[-60, 15, 46], [-24, 19, 64], [22, 18, 58], [60, 14, 42]],
    [[-24, 10, 36], [22, 9, 32]]
  ];
  const topoLenha = dx => 708 - Math.abs(dx) * .28;   // altura do topo dos troncos da frente junto ao cruzamento

  /* ================= 3) Ícone do menu (sem gradientes com id) ================= */
  function iconeSVG() {
    const k = .37, cx = 110, by = 160;
    const camada = (c, ci, cor) => `<path d="${c.linguas.map(([bx, w, h], i) => lingua(cx + bx * k, by - c.y * k, w * k, h * k, 1, i * 1.9 + ci, .55, 0)).join('')}" fill="${cor}"/>`;
    const r = semente(5);
    let estrelas = '';
    for (let i = 0; i < 18; i++) { const a = r() * 2 * PI, d = 30 + r() * 70, x = 110 + Math.cos(a) * d, y = 20 + r() * 90; if (Math.hypot(x - 110, y - 110) < 100) estrelas += `M${n(x)},${n(y)}h.01`; }
    const pedra = (x, y, rx, ry, frente) => frente
      ? `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#4A4048"/><path d="M${x - rx * .85},${y - ry * .35} Q${x},${y - ry * 1.25} ${x + rx * .85},${y - ry * .35}" stroke="#F0A064" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#C88A64"/><ellipse cx="${x}" cy="${y - ry * .3}" rx="${rx * .6}" ry="${ry * .45}" fill="#EDB88A"/>`;
    const tronco = (rot, cortX) => `<g transform="translate(110,166) rotate(${rot})"><rect x="-64" y="-10" width="128" height="20" rx="10" fill="#5A3622"/>
      <rect x="-64" y="-10" width="128" height="8" rx="4" fill="#8A5A36" opacity=".7"/><ellipse cx="0" cy="0" rx="20" ry="8" fill="#E8641E" opacity=".9"/>
      <path d="M-14,-2 l6,4 l6,-3 M6,3 l6,-4 l5,3" stroke="#FFD27A" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="${cortX}" cy="0" rx="5" ry="10" fill="#D9A46A" stroke="#5A3622" stroke-width="1.6"/><ellipse cx="${cortX}" cy="0" rx="2.2" ry="5" fill="none" stroke="#9A6A3E" stroke-width="1.2"/></g>`;
    return `<circle cx="110" cy="110" r="106" fill="#1B2352"/>
      <path d="${estrelas}" stroke="#FFF4D0" stroke-width="3" stroke-linecap="round"/>
      <circle cx="166" cy="50" r="15" fill="#FFF6DA"/><circle cx="160" cy="46" r="3" fill="#E6DAB4"/><circle cx="170" cy="56" r="2.4" fill="#E6DAB4"/>
      <path d="M11.8,150 Q110,136 208.2,150 A106,106 0 0 1 11.8,150 Z" fill="#2E2226"/>
      
      <ellipse cx="110" cy="172" rx="82" ry="24" fill="#C8642A" opacity=".5"/><ellipse cx="110" cy="168" rx="64" ry="16" fill="#E8843A" opacity=".55"/>
      ${pedra(60, 158, 13, 8, false)}${pedra(86, 150, 13, 7, false)}${pedra(112, 148, 13, 7, false)}${pedra(138, 150, 13, 7, false)}${pedra(162, 158, 13, 8, false)}
      <ellipse cx="110" cy="166" rx="56" ry="13" fill="#FF8A30"/>
      ${camada(CAMADAS[0], 0, '#E8361C')}${camada(CAMADAS[1], 1, '#FF8A1E')}${camada(CAMADAS[2], 2, '#FFD440')}${camada(CAMADAS[3], 3, '#FFF7D2')}
      ${tronco(-15, -60)}${tronco(15, 60)}
      ${pedra(50, 176, 14, 9, true)}${pedra(76, 186, 15, 9, true)}${pedra(110, 190, 16, 9, true)}${pedra(144, 186, 15, 9, true)}${pedra(170, 176, 14, 9, true)}
      <g fill="#FFD76A"><circle cx="78" cy="58" r="2.6"/><circle cx="140" cy="40" r="2.2"/><circle cx="96" cy="30" r="1.8"/><circle cx="128" cy="70" r="2"/></g>`;
  }

  /* ================= 4) Cenário ================= */
  const LUA = { x: 1172, y: 132, r: 48 };
  const ESTRELAS = (() => {
    const r = semente(19), v = [];
    for (let i = 0; i < 190; i++) {
      const x = r() * 1600, y = Math.pow(r(), 1.5) * 560, g = i % 4;
      if (Math.hypot(x - LUA.x, y - LUA.y) < 80) continue;
      v.push([n(x), n(y), g]);
    }
    return v;
  })();
  const BRILHANTES = [[268, 104, 9], [452, 214, 7], [700, 62, 8], [968, 170, 7], [1352, 70, 8], [140, 300, 6], [1470, 330, 6]];
  const PIRILAMPOS = [[170, 470], [262, 590], [318, 392], [560, 540], [1236, 462], [1318, 580], [1452, 418], [1086, 520], [1196, 372]];

  function defs() {
    return `
    <linearGradient id="fogo-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060A24"/><stop offset=".45" stop-color="#101A44"/><stop offset=".8" stop-color="#232858"/><stop offset="1" stop-color="#3A3062"/></linearGradient>
    <radialGradient id="fogo-via"><stop offset="0" stop-color="#A4ACE6" stop-opacity=".2"/><stop offset=".5" stop-color="#7E88C8" stop-opacity=".08"/><stop offset="1" stop-color="#7E88C8" stop-opacity="0"/></radialGradient>
    <radialGradient id="fogo-luaHalo"><stop offset="0" stop-color="#E8ECFF" stop-opacity=".4"/><stop offset=".35" stop-color="#B8C4F0" stop-opacity=".14"/><stop offset="1" stop-color="#B8C4F0" stop-opacity="0"/></radialGradient>
    <radialGradient id="fogo-lua" cx=".4" cy=".38" r=".7"><stop offset="0" stop-color="#FFFDF2"/><stop offset=".6" stop-color="#F3EBCD"/><stop offset="1" stop-color="#D6CAA2"/></radialGradient>
    <linearGradient id="fogo-pinhoE" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0E0A10"/><stop offset=".5" stop-color="#2A1A1C"/><stop offset=".82" stop-color="#7A3E24"/><stop offset="1" stop-color="#C46A32"/></linearGradient>
    <linearGradient id="fogo-pinhoD" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C46A32"/><stop offset=".18" stop-color="#7A3E24"/><stop offset=".5" stop-color="#2A1A1C"/><stop offset="1" stop-color="#0E0A10"/></linearGradient>
    <linearGradient id="fogo-chao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141528"/><stop offset=".2" stop-color="#1D1926"/><stop offset=".6" stop-color="#2A1F24"/><stop offset="1" stop-color="#36241F"/></linearGradient>
    <radialGradient id="fogo-luzChao"><stop offset="0" stop-color="#FFA54A" stop-opacity=".62"/><stop offset=".3" stop-color="#F07A30" stop-opacity=".34"/><stop offset=".65" stop-color="#C04A20" stop-opacity=".12"/><stop offset="1" stop-color="#C04A20" stop-opacity="0"/></radialGradient>
    <radialGradient id="fogo-halo"><stop offset="0" stop-color="#FFC664" stop-opacity=".7"/><stop offset=".3" stop-color="#FF8C32" stop-opacity=".32"/><stop offset=".65" stop-color="#FF6A22" stop-opacity=".08"/><stop offset="1" stop-color="#FF6A22" stop-opacity="0"/></radialGradient>
    <radialGradient id="fogo-clarao" gradientUnits="userSpaceOnUse" cx="800" cy="600" r="900"><stop offset="0" stop-color="#FFB050" stop-opacity=".75"/><stop offset=".5" stop-color="#FF8A3A" stop-opacity=".3"/><stop offset="1" stop-color="#FF8A3A" stop-opacity="0"/></radialGradient>
    <radialGradient id="fogo-vinheta" gradientUnits="userSpaceOnUse" cx="800" cy="640" r="980"><stop offset=".42" stop-color="#04050E" stop-opacity="0"/><stop offset="1" stop-color="#04050E" stop-opacity=".8"/></radialGradient>
    <linearGradient id="fogo-chamaV" gradientUnits="userSpaceOnUse" x1="0" y1="740" x2="0" y2="270"><stop offset="0" stop-color="#FF6A22"/><stop offset=".35" stop-color="#F2421C"/><stop offset=".7" stop-color="#D8281A"/><stop offset="1" stop-color="#B0141C"/></linearGradient>
    <linearGradient id="fogo-chamaL" gradientUnits="userSpaceOnUse" x1="0" y1="730" x2="0" y2="330"><stop offset="0" stop-color="#FFB83C"/><stop offset=".4" stop-color="#FF9022"/><stop offset="1" stop-color="#F55F1A"/></linearGradient>
    <linearGradient id="fogo-chamaA" gradientUnits="userSpaceOnUse" x1="0" y1="720" x2="0" y2="440"><stop offset="0" stop-color="#FFF6B0"/><stop offset=".35" stop-color="#FFE26A"/><stop offset="1" stop-color="#FFB52A"/></linearGradient>
    <linearGradient id="fogo-chamaB" gradientUnits="userSpaceOnUse" x1="0" y1="715" x2="0" y2="590"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#FFFBE2"/><stop offset="1" stop-color="#FFF1AA"/></linearGradient>
    <radialGradient id="fogo-cinza" cx=".5" cy=".45" r=".55"><stop offset="0" stop-color="#FF9A3A"/><stop offset=".35" stop-color="#C2441C"/><stop offset=".7" stop-color="#4A2A20"/><stop offset="1" stop-color="#5E5652"/></radialGradient>
    <radialGradient id="fogo-brasaLuz"><stop offset="0" stop-color="#FFD474" stop-opacity="1"/><stop offset=".45" stop-color="#FF7A20" stop-opacity=".6"/><stop offset="1" stop-color="#FF5A10" stop-opacity="0"/></radialGradient>
    <radialGradient id="fogo-pedraLuz" cx=".5" cy=".3" r=".75"><stop offset="0" stop-color="#F6C494"/><stop offset=".5" stop-color="#BC7C5C"/><stop offset="1" stop-color="#5E4038"/></radialGradient>
    <radialGradient id="fogo-pedraEsc" cx=".5" cy=".15" r=".9"><stop offset="0" stop-color="#7E6668"/><stop offset=".5" stop-color="#463A42"/><stop offset="1" stop-color="#1E1A22"/></radialGradient>
    <linearGradient id="fogo-lenhaMeio" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7A5030"/><stop offset=".18" stop-color="#4A2C1C"/><stop offset=".33" stop-color="#24140E"/><stop offset=".44" stop-color="#C0441A"/><stop offset=".5" stop-color="#FF8A30"/><stop offset=".56" stop-color="#C0441A"/><stop offset=".67" stop-color="#24140E"/><stop offset=".82" stop-color="#4A2C1C"/><stop offset="1" stop-color="#7A5030"/></linearGradient>
    <linearGradient id="fogo-lenhaPonta" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#80553A"/><stop offset=".45" stop-color="#4E301E"/><stop offset=".72" stop-color="#22140E"/><stop offset=".9" stop-color="#D04E1C"/><stop offset="1" stop-color="#FF9A3A"/></linearGradient>
    <linearGradient id="fogo-lenhaVol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB070" stop-opacity=".5"/><stop offset=".38" stop-color="#FFB070" stop-opacity="0"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>
    <radialGradient id="fogo-anel"><stop offset="0" stop-color="#C8945C"/><stop offset=".55" stop-color="#A0703E"/><stop offset=".85" stop-color="#6E4628"/><stop offset="1" stop-color="#3A2416"/></radialGradient>
    <radialGradient id="fogo-anelLuz" cx=".4" cy=".4" r=".65"><stop offset="0" stop-color="#F6CC92"/><stop offset=".5" stop-color="#DCA466"/><stop offset=".85" stop-color="#A06A3A"/><stop offset="1" stop-color="#4A2C18"/></radialGradient>
    <radialGradient id="fogo-sombra"><stop offset="0" stop-color="#05030A" stop-opacity=".6"/><stop offset="1" stop-color="#05030A" stop-opacity="0"/></radialGradient>
    <radialGradient id="fogo-fumo"><stop offset="0" stop-color="#A8A4B6" stop-opacity=".6"/><stop offset=".55" stop-color="#7E7A92" stop-opacity=".26"/><stop offset="1" stop-color="#7E7A92" stop-opacity="0"/></radialGradient>
    <radialGradient id="fogo-faisca"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".3" stop-color="#FFE48A" stop-opacity=".7"/><stop offset="1" stop-color="#FFB040" stop-opacity="0"/></radialGradient>
    <radialGradient id="fogo-pirilampo"><stop offset="0" stop-color="#F8FFC0"/><stop offset=".22" stop-color="#DCF26A" stop-opacity=".6"/><stop offset="1" stop-color="#B8E040" stop-opacity="0"/></radialGradient>
    <linearGradient id="fogo-tendaFrente" x1="0" y1="0" x2="1" y2=".35"><stop offset="0" stop-color="#3C5A4C"/><stop offset=".55" stop-color="#78784C"/><stop offset="1" stop-color="#B49458"/></linearGradient>
    <linearGradient id="fogo-tendaLado" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#12222A"/><stop offset="1" stop-color="#22403C"/></linearGradient>
    <radialGradient id="fogo-tendaLuz" cx="1" cy="1" r="1.1"><stop offset="0" stop-color="#FFA050" stop-opacity=".7"/><stop offset="1" stop-color="#FFA050" stop-opacity="0"/></radialGradient>
    <radialGradient id="fogo-tendaDentro" cx=".6" cy="1" r="1"><stop offset="0" stop-color="#6A2E18"/><stop offset=".5" stop-color="#2A140E"/><stop offset="1" stop-color="#120A08"/></radialGradient>
    <linearGradient id="fogo-banco" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C47E46"/><stop offset=".35" stop-color="#7E4C2A"/><stop offset=".75" stop-color="#3E2618"/><stop offset="1" stop-color="#1E140E"/></linearGradient>
    <linearGradient id="fogo-cepo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1A120E"/><stop offset=".5" stop-color="#4A2E1C"/><stop offset=".85" stop-color="#9A5E34"/><stop offset="1" stop-color="#C47A40"/></linearGradient>
    <linearGradient id="fogo-caneca" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#16325E"/><stop offset=".55" stop-color="#2C64A8"/><stop offset=".85" stop-color="#7AA4D4"/><stop offset="1" stop-color="#E0A070"/></linearGradient>
    <linearGradient id="fogo-cadente" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".8" stop-color="#E8F0FF" stop-opacity=".7"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient>
    <linearGradient id="fogo-mocho" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A5A3E"/><stop offset="1" stop-color="#4A3424"/></linearGradient>
    <linearGradient id="fogo-pilha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A5832"/><stop offset=".5" stop-color="#4A2E1C"/><stop offset="1" stop-color="#22160E"/></linearGradient>`;
  }

  /* --- céu --- */
  function ceuSVG() {
    const grupo = g => ESTRELAS.filter(s => s[2] === g).map(([x, y]) => `M${x},${y}h.01`).join('');
    const brilho = ([x, y, r], i) => `<g class="fg-brilha${i}" transform="translate(${x},${y})"><path d="M0,${-r * 2}Q0,0 ${r * 2},0Q0,0 0,${r * 2}Q0,0 ${-r * 2},0Q0,0 0,${-r * 2}Z" fill="#FFF8E2"/><circle r="${n(r * .45)}" fill="#FFFFFF"/></g>`;
    return `<rect width="1600" height="640" fill="url(#fogo-ceu)"/>
      <ellipse cx="760" cy="230" rx="980" ry="120" transform="rotate(-16 760 230)" fill="url(#fogo-via)"/>
      <ellipse cx="700" cy="250" rx="620" ry="50" transform="rotate(-16 700 250)" fill="url(#fogo-via)"/>
      <path d="${grupo(0)}" stroke="#C8D0F0" stroke-width="2" stroke-linecap="round" opacity=".55"/>
      <path class="fg-estrelas1" d="${grupo(1)}" stroke="#FFF6DC" stroke-width="2.8" stroke-linecap="round"/>
      <path class="fg-estrelas2" d="${grupo(2)}" stroke="#FFFFFF" stroke-width="3.4" stroke-linecap="round"/>
      <path class="fg-estrelas3" d="${grupo(3)}" stroke="#DCE6FF" stroke-width="2.3" stroke-linecap="round"/>
      ${BRILHANTES.map(brilho).join('')}
      <g class="fg-cadente" opacity="0"><path d="M0,-2.4 L0,2.4 L-190,0 Z" fill="url(#fogo-cadente)"/><circle r="3.4" fill="#FFFFFF"/><circle r="9" fill="#E8F0FF" opacity=".3"/></g>
      <circle cx="${LUA.x}" cy="${LUA.y}" r="190" fill="url(#fogo-luaHalo)"/>
      <circle cx="${LUA.x}" cy="${LUA.y}" r="${LUA.r}" fill="url(#fogo-lua)"/>
      <g fill="#D8CCA4" opacity=".75"><ellipse cx="${LUA.x - 16}" cy="${LUA.y - 12}" rx="11" ry="9"/><ellipse cx="${LUA.x + 14}" cy="${LUA.y + 8}" rx="14" ry="11"/><ellipse cx="${LUA.x - 8}" cy="${LUA.y + 22}" rx="7" ry="6"/><ellipse cx="${LUA.x + 20}" cy="${LUA.y - 22}" rx="5" ry="4"/><ellipse cx="${LUA.x - 28}" cy="${LUA.y + 6}" rx="4.5" ry="4"/></g>
      <path d="M${LUA.x - 36},${LUA.y - 26} A${LUA.r - 4},${LUA.r - 4} 0 0 1 ${LUA.x + 6},${LUA.y - 44}" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>
      <g class="fg-nuvem"><path d="M0,0 C30,-18 80,-22 120,-12 C150,-26 210,-24 240,-8 C280,-14 330,-6 350,6 C300,14 220,10 170,14 C110,18 40,14 0,0 Z" fill="#323C68" opacity=".72"/>
        <path d="M24,-6 C60,-20 100,-18 122,-12 M150,-20 C190,-26 222,-18 240,-9" stroke="#8C98C8" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/></g>`;
  }

  /* --- pinhal em silhueta (três planos) --- */
  function bravoD(x, base, h, r) {             // pinheiro-bravo: tronco alto e copa irregular lá em cima
    const lw = h * .02 + 1.5, top = base - h, inc = (r() - .5) * h * .08;
    let d = `M${n(x - lw)},${n(base)} L${n(x + inc - lw * .5)},${n(top + h * .2)} L${n(x + inc + lw * .5)},${n(top + h * .2)} L${n(x + lw)},${n(base)} Z`;
    const k = 4 + (r() * 3 | 0);
    for (let i = 0; i < k; i++) {
      const cy = top + h * (.05 + r() * .3), cx = x + inc + (r() - .5) * h * .32, rx = h * (.08 + r() * .07);
      d += blobD(cx, cy, rx, rx * (.5 + r() * .25), r, 9, .24);
    }
    return d;
  }
  function mansoD(x, base, h, r) {             // pinheiro-manso: copa larga em guarda-chuva
    const lw = h * .035 + 2, inc = (r() - .5) * h * .2, cy = base - h * .8;
    let d = `M${n(x - lw)},${n(base)} L${n(x + inc - lw * .6)},${n(cy + 6)} L${n(x + inc + lw * .6)},${n(cy + 6)} L${n(x + lw)},${n(base)} Z`;
    d += blobD(x + inc, cy, h * .5, h * .13, r, 12, .12);
    for (let i = 0; i < 4; i++) d += blobD(x + inc + (i - 1.5) * h * .24, cy - h * .07, h * .17, h * .11, r, 9, .2);
    return d;
  }
  const cume = x => 500 - 24 * Math.sin(x / 260 + 1) - 12 * Math.sin(x / 97 + .4);
  function pinhalSVG() {
    const r = semente(23);
    let longe = 'M0,' + n(cume(0));
    for (let x = 40; x <= 1600; x += 40) longe += 'L' + x + ',' + n(cume(x));
    longe += 'L1600,640L0,640Z';
    for (let x = 10; x < 1600; x += 14 + r() * 26) longe += r() < .7 ? bravoD(x, cume(x) + 4, 34 + r() * 30, r) : mansoD(x, cume(x) + 4, 30 + r() * 20, r);
    let meio = 'M0,586 C300,578 600,590 900,582 C1150,576 1400,588 1600,580 L1600,640 L0,640 Z';
    for (let x = -30; x < 1650; x += 70 + r() * 90) {
      const h = 150 + r() * 150;
      meio += r() < .62 ? bravoD(x, 592, h, r) : mansoD(x, 592, h * .8, r);
    }
    let mato = '';
    for (let x = -20; x < 1640; x += 40 + r() * 50) mato += blobD(x, 592 + r() * 8, 26 + r() * 30, 12 + r() * 10, r, 9, .25);
    return `<path d="${longe}" fill="#1C2452"/>
      <path d="${meio}" fill="#121838"/>
      <path d="${mato}" fill="#16152A"/>`;
  }

  /* --- chão da clareira: caruma, pinhas e a luz da fogueira --- */
  function chaoSVG() {
    const r = semente(41), cores = ['', '', ''];
    for (let i = 0; i < 700; i++) {
      const x = r() * 1600, y = 600 + Math.pow(r(), .8) * 300;
      const dn = Math.hypot((x - CX) / 700, (y - 735) / 220);
      const a = (r() - .5) * 1.2 + (r() < .5 ? 0 : PI), l = 5 + r() * 9;
      cores[dn < .55 ? 0 : dn < 1.1 ? 1 : 2] += `M${n(x)},${n(y)}l${n(Math.cos(a) * l)},${n(Math.sin(a) * l * .5)}`;
    }
    const pinha = (x, y, k, rot) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${k})"><ellipse cx="0" cy="0" rx="16" ry="10" fill="#4A2C1C"/>
      <path d="M-12,-4 l6,4 l-6,4 M-4,-8 l6,8 l-6,8 M4,-8 l6,8 l-6,8" stroke="#2A1810" stroke-width="2" fill="none"/>
      <path d="M-10,-6 C-2,-11 8,-10 14,-4" stroke="#C47A44" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/></g>`;
    return `<rect y="585" width="1600" height="315" fill="url(#fogo-chao)"/>
      <path d="${cores[2]}" stroke="#2E2428" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="${cores[1]}" stroke="#5E3E2E" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="${cores[0]}" stroke="#A86C40" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse class="fg-luz" data-b=".95" cx="${CX}" cy="738" rx="840" ry="250" fill="url(#fogo-luzChao)"/>
      ${pinha(640, 836, 1, -12)}${pinha(1012, 826, .9, 20)}${pinha(250, 812, .8, 8)}${pinha(1190, 850, 1.05, -30)}${pinha(560, 868, .9, 40)}`;
  }

  /* --- tenda de lona (à esquerda, atrás): a frente está virada para a fogueira e acesa; o lado está na sombra --- */
  function tendaSVG() {
    const F = [470, 432], B = [352, 446], FL = [372, 662], FR = [604, 650], BL = [250, 640];
    const p = v => v.map(q => q.join(',')).join(' ');
    const costuras = [.25, .5, .75].map(t => `M${n(lerp(B[0], F[0], t))},${n(lerp(B[1], F[1], t))} L${n(lerp(BL[0], FL[0], t))},${n(lerp(BL[1], FL[1], t))}`).join('');
    return `<ellipse class="fg-sombra" data-x="380" data-y="656" cx="300" cy="660" rx="230" ry="26" fill="url(#fogo-sombra)"/>
      <path d="M352,446 L190,616" stroke="#6A6A5A" stroke-width="1.6" opacity=".6"/><path d="M186,612 l8,8" stroke="#3A2A20" stroke-width="4"/>
      <polygon points="${p([B, F, FL, BL])}" fill="url(#fogo-tendaLado)" stroke="#0C1418" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="${costuras}" stroke="#0E1A1E" stroke-width="2" opacity=".7"/>
      <path d="M296,520 C310,540 318,560 322,600 M410,470 C400,520 396,560 392,610" stroke="#2E5050" stroke-width="2" fill="none" opacity=".5"/>
      <path d="M${B.join(',')} L${F.join(',')}" stroke="#A07A4A" stroke-width="3" opacity=".55" stroke-linecap="round"/>
      <g class="fg-tendaPano">
        <polygon points="${p([F, FR, FL])}" fill="url(#fogo-tendaFrente)"/>
        <polygon class="fg-luz" data-b=".75" points="${p([F, FR, FL])}" fill="url(#fogo-tendaLuz)"/>
        <path d="M470,470 L540,652 Q486,660 424,658 Z" fill="url(#fogo-tendaDentro)"/>
        <path d="M434,658 Q446,628 482,628 Q516,628 532,652 Z" fill="#8A2A22"/><path d="M446,640 Q470,628 506,632" stroke="#C8524A" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M480,628 Q474,610 492,606 Q512,606 510,626" fill="#C8B89A" opacity=".8"/>
        <g class="fg-abaE"><path d="M470,468 L424,658 Q402,606 414,562 Q434,516 470,468 Z" fill="#5E6E4C" stroke="#1A2422" stroke-width="2" stroke-linejoin="round"/>
          <path d="M466,486 Q434,530 420,590" stroke="#86906A" stroke-width="2" fill="none" opacity=".7"/></g>
        <g class="fg-abaD"><path d="M470,468 Q512,520 542,566 Q556,610 540,652 Z" fill="#A8905C" stroke="#1A2422" stroke-width="2" stroke-linejoin="round"/>
          <path d="M478,482 Q516,530 534,600" stroke="#E0B878" stroke-width="2" fill="none" opacity=".7"/></g>
        <path d="M412,574 q6,4 10,-2 M541,568 q-6,5 -11,-1" stroke="#E2C89A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <polygon points="${p([F, FR, FL])}" fill="none" stroke="#1A2422" stroke-width="2.8" stroke-linejoin="round"/>
        <path d="M374,660 L602,648" stroke="#D2A868" stroke-width="2" opacity=".55"/>
      </g>
      <path d="M470,432 L474,412" stroke="#5A3A22" stroke-width="4.5" stroke-linecap="round"/><circle cx="474" cy="411" r="3.5" fill="#C88A50"/>
      <path d="M472,430 L672,664" stroke="#E0C890" stroke-width="1.6" opacity=".55"/><path d="M668,660 l8,10" stroke="#3A2A20" stroke-width="4"/>
      <path d="M368,664 l-8,8 M606,650 l8,8 M248,640 l-8,8" stroke="#2A1E18" stroke-width="4" stroke-linecap="round"/>`;
  }

  /* --- lenha empilhada (atrás, à direita): topos cortados virados para nós, acesos do lado da fogueira --- */
  function pilhaSVG() {
    const topos = [[1062, 638], [1096, 640], [1130, 638], [1164, 640], [1078, 609], [1112, 610], [1146, 609], [1094, 580], [1128, 581]];
    const r = semente(61);
    let aneis = '', fendas = '', corpos = '';
    for (const [x, y] of topos) {
      corpos += `M${x},${y - 16} L${x + 40},${y - 36} L${x + 40},${y - 4} L${x},${y + 16} Z`;
      aneis += `M${x - 9},${y} a9,9 0 1,0 18,0 a9,9 0 1,0 -18,0 M${x - 4},${y} a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0`;
      fendas += `M${x},${y} l${n((r() - .5) * 14)},${n(-6 - r() * 6)}`;
    }
    return `<ellipse class="fg-sombra" data-x="1110" data-y="656" cx="1190" cy="656" rx="130" ry="18" fill="url(#fogo-sombra)"/>
      <path d="${corpos}" fill="url(#fogo-pilha)" stroke="#120A08" stroke-width="2" stroke-linejoin="round"/>
      ${topos.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="url(#fogo-anelLuz)" stroke="#2A180E" stroke-width="2.5"/>`).join('')}
      <path d="${aneis}" stroke="#8A5A32" stroke-width="1.4" fill="none" opacity=".75"/>
      <path d="${fendas}" stroke="#4A2C18" stroke-width="1.6" fill="none"/>`;
  }

  /* --- troncos da fogueira --- */
  function lenhaSVG(x1, y1, x2, y2, r, grad, f0, f1, corte, sem) {
    const L = Math.hypot(x2 - x1, y2 - y1), a = Math.atan2(y2 - y1, x2 - x1) / RAD, rr = semente(sem);
    let casca = '', fendas = '';
    for (let i = 0; i < 8; i++) { const y = (rr() - .5) * r * 1.5, x0 = rr() * L * .85, l = 18 + rr() * 46; casca += `M${n(x0)},${n(y)}q${n(l / 2)},${n((rr() - .5) * 4)} ${n(l)},${n((rr() - .5) * 3)}`; }
    for (let i = 0; i < 6; i++) { const x0 = L * (f0 + rr() * (f1 - f0)), y0 = (rr() - .5) * r * 1.3; fendas += `M${n(x0)},${n(y0)}l${n(4 + rr() * 6)},${n((rr() - .5) * 7)}l${n(4 + rr() * 6)},${n((rr() - .5) * 7)}`; }
    const rx = r * .42;
    return `<g transform="translate(${n(x1)},${n(y1)}) rotate(${n(a)})">
      <rect x="0" y="${-r}" width="${n(L)}" height="${2 * r}" rx="${n(r * .6)}" fill="url(#${grad})" stroke="#140A06" stroke-width="2"/>
      <rect x="0" y="${-r}" width="${n(L)}" height="${2 * r}" rx="${n(r * .6)}" fill="url(#fogo-lenhaVol)"/>
      <path d="${casca}" stroke="#1A0E08" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/>
      <path class="fg-fenda" d="${fendas}" stroke="#FFB648" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${corte ? `<ellipse cx="0" cy="0" rx="${n(rx)}" ry="${r}" fill="url(#fogo-anel)" stroke="#2A1810" stroke-width="2"/>
        <path d="M${n(-rx * .6)},0a${n(rx * .6)},${n(r * .6)} 0 1,0 ${n(rx * 1.2)},0a${n(rx * .6)},${n(r * .6)} 0 1,0 ${n(-rx * 1.2)},0M${n(-rx * .25)},0a${n(rx * .25)},${n(r * .25)} 0 1,0 ${n(rx * .5)},0a${n(rx * .25)},${n(r * .25)} 0 1,0 ${n(-rx * .5)},0" stroke="#6A4426" stroke-width="1.3" fill="none"/>
        <path d="M${n(rx * .2)},${n(-r * .92)} A${n(rx)},${r} 0 0 1 ${n(rx * .96)},${n(-r * .1)}" stroke="#F0A060" stroke-width="2.4" fill="none" opacity=".7" stroke-linecap="round"/>` : ''}
    </g>`;
  }

  /* --- roda de pedras: as de trás mostram a face virada para o fogo (acesa); as da frente estão de costas para ele --- */
  const RODA = { cx: CX, cy: 734, rx: 208, ry: 54 };
  const PEDRAS = (() => {
    const r = semente(83), v = [], k = 18;
    for (let i = 0; i < k; i++) {
      const a = (i + .5) / k * 2 * PI, x = RODA.cx + Math.cos(a) * RODA.rx, y = RODA.cy + Math.sin(a) * RODA.ry;
      const f = .75 + .25 * Math.sin(a);                 // as da frente parecem maiores (mais perto)
      v.push({ x, y, rx: (24 + r() * 8) * f, ry: (16 + r() * 6) * f, tras: Math.sin(a) < -.2, sem: 100 + i, a });
    }
    return v;
  })();
  function pedrasSVG(tras) {
    let s = '', rebordo = '', sombras = '';
    for (const p of PEDRAS.filter(q => q.tras === tras)) {
      const r = semente(p.sem);
      sombras += `M${n(p.x - p.rx * 1.1)},${n(p.y + p.ry * .6)}a${n(p.rx * 1.1)},${n(p.ry * .45)} 0 1,0 ${n(p.rx * 2.2)},0a${n(p.rx * 1.1)},${n(p.ry * .45)} 0 1,0 ${n(-p.rx * 2.2)},0`;
      s += `<path d="${blobD(p.x, p.y, p.rx, p.ry, r, 8, .12)}" fill="url(#fogo-${tras ? 'pedraLuz' : 'pedraEsc'})" stroke="#1A1216" stroke-width="2"/>`;
      if (!tras) {                                       // rebordo de cima apanha a luz do fogo (do lado de dentro)
        const lado = Math.cos(p.a) * .35;
        rebordo += `M${n(p.x - p.rx * (.8 - lado))},${n(p.y - p.ry * .5)}Q${n(p.x + p.rx * lado * .5)},${n(p.y - p.ry * 1.18)} ${n(p.x + p.rx * (.8 + lado))},${n(p.y - p.ry * .5)}`;
      } else rebordo += `M${n(p.x - p.rx * .5)},${n(p.y - p.ry * .45)}q${n(p.rx * .4)},${n(-p.ry * .3)} ${n(p.rx * .9)},${n(-p.ry * .1)}`;
    }
    return `<path d="${sombras}" fill="#08050A" opacity=".45"/>${s}
      <path class="${tras ? '' : 'fg-luz'}" data-b=".95" d="${rebordo}" stroke="${tras ? '#FFE2B4' : '#FFAA62'}" stroke-width="${tras ? 3 : 3.4}" fill="none" stroke-linecap="round" opacity=".85"/>`;
  }
  function brasasSVG() {
    const r = semente(97), g = ['', '', ''];
    for (let i = 0; i < 46; i++) {
      const a = r() * 2 * PI, d = Math.sqrt(r()), x = CX + Math.cos(a) * 150 * d, y = 730 + Math.sin(a) * 34 * d;
      g[i % 3] += blobD(x, y, 4 + r() * 7, 2.5 + r() * 3.5, r, 6, .3);
    }
    let cinza = '';
    for (let i = 0; i < 40; i++) { const a = r() * 2 * PI, d = .6 + r() * .4; cinza += `M${n(CX + Math.cos(a) * 165 * d)},${n(730 + Math.sin(a) * 38 * d)}h.01`; }
    return `<ellipse cx="${CX}" cy="730" rx="172" ry="42" fill="url(#fogo-cinza)"/>
      <ellipse class="fg-brasaLuz" cx="${CX}" cy="726" rx="150" ry="34" fill="url(#fogo-brasaLuz)"/>
      <path class="fg-brasa0" d="${g[0]}" fill="#FFD266"/><path class="fg-brasa1" d="${g[1]}" fill="#FF8A2A"/><path class="fg-brasa2" d="${g[2]}" fill="#E24A1C"/>
      <path d="${cinza}" stroke="#8A827C" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
  }

  /* --- cepo com caneca de esmalte (à esquerda, à frente) --- */
  function cepoSVG() {
    return `<ellipse class="fg-sombra" data-x="420" data-y="792" cx="350" cy="796" rx="120" ry="16" fill="url(#fogo-sombra)"/>
      <path d="M362,722 C362,750 360,770 346,796 Q420,808 496,796 C482,772 478,750 478,722 Z" fill="url(#fogo-cepo)" stroke="#120A08" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M378,730 C376,760 374,780 370,798 M402,734 C402,764 400,784 398,802 M440,734 C442,764 444,784 446,802 M462,730 C464,760 468,780 474,798" stroke="#140C08" stroke-width="2" fill="none" opacity=".6"/>
      <path class="fg-luz" data-b=".6" d="M456,726 C458,752 462,772 478,796 L496,796 C482,772 478,750 478,722 Z" fill="#FF9A4E"/>
      <ellipse cx="420" cy="722" rx="58" ry="17" fill="url(#fogo-anelLuz)" stroke="#2A180E" stroke-width="2.4"/>
      <path d="M380,722a40,11 0 1,0 80,0a40,11 0 1,0 -80,0M396,722a24,6.5 0 1,0 48,0a24,6.5 0 1,0 -48,0M410,722a10,2.8 0 1,0 20,0a10,2.8 0 1,0 -20,0" stroke="#9A6A3E" stroke-width="1.4" fill="none"/>
      <path d="M420,722 l-30,-6" stroke="#5A3A22" stroke-width="1.8"/>
      <ellipse cx="438" cy="716" rx="20" ry="6" fill="#0A0606" opacity=".4"/>
      <path d="M424,688 Q406,688 406,700 Q406,712 426,710" stroke="#1E4A86" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M424,686 L426,712 Q440,718 454,712 L456,686 Z" fill="url(#fogo-caneca)" stroke="#0E1E3A" stroke-width="1.8"/>
      <g fill="#E8EEF4" opacity=".75"><circle cx="432" cy="696" r="1.6"/><circle cx="444" cy="702" r="1.3"/><circle cx="438" cy="707" r="1.1"/><circle cx="450" cy="694" r="1.2"/></g>
      <ellipse cx="440" cy="686" rx="16" ry="4.5" fill="#E8EEF4" stroke="#0E1E3A" stroke-width="1.4"/><ellipse cx="440" cy="686.6" rx="12.5" ry="3" fill="#5A3420"/>
      <path class="fg-vapor0" d="M436,682 C430,670 442,662 436,650 C430,640 440,632 436,622" stroke="#C8C4D4" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0"/>
      <path class="fg-vapor1" d="M445,682 C451,672 441,664 447,654 C452,644 444,636 448,628" stroke="#C8C4D4" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0"/>`;
  }

  /* --- tronco para sentar (à direita, à frente): o topo cortado está virado para a fogueira --- */
  function bancoSVG() {
    const x1 = 1066, y1 = 760, x2 = 1372, y2 = 744, r = 34, L = Math.hypot(x2 - x1, y2 - y1), a = Math.atan2(y2 - y1, x2 - x1) / RAD, rr = semente(71);
    let casca = '';
    for (let i = 0; i < 12; i++) { const y = (rr() - .5) * r * 1.6, x0 = 10 + rr() * (L - 60), l = 24 + rr() * 60; casca += `M${n(x0)},${n(y)}q${n(l / 2)},${n((rr() - .5) * 5)} ${n(l)},${n((rr() - .5) * 4)}`; }
    return `<ellipse class="fg-sombra" data-x="1220" data-y="784" cx="1290" cy="792" rx="200" ry="22" fill="url(#fogo-sombra)"/>
      <g transform="translate(${x1},${y1}) rotate(${n(a)})">
        <ellipse cx="${n(L)}" cy="0" rx="14" ry="${r}" fill="#1E140E" stroke="#120A08" stroke-width="2.4"/>
        <rect x="0" y="${-r}" width="${n(L)}" height="${2 * r}" fill="url(#fogo-banco)"/>
        <path d="M0,${-r}H${n(L)}M0,${r}H${n(L)}" stroke="#120A08" stroke-width="2.4"/>
        <path d="${casca}" stroke="#1A0E08" stroke-width="2.2" fill="none" opacity=".6" stroke-linecap="round"/>
        <path class="fg-luz" data-b=".55" d="M0,${-r + 2}C${n(L * .3)},${-r - 1} ${n(L * .6)},${-r + 1} ${n(L)},${-r + 3}L${n(L)},${-r + 12}C${n(L * .5)},${-r + 10} ${n(L * .2)},${-r + 12} 0,${-r + 16}Z" fill="#FFA65A"/>
        <ellipse cx="130" cy="-6" rx="9" ry="6" fill="#2A180E"/><path d="M122,-9 a8,5 0 0,1 15,-1" stroke="#C47E46" stroke-width="2" fill="none"/>
        <ellipse cx="0" cy="0" rx="15" ry="${r}" fill="url(#fogo-anelLuz)" stroke="#2A180E" stroke-width="2.4"/>
        <path d="M-9,0a9,22 0 1,0 18,0a9,22 0 1,0 -18,0M-4,0a4,10 0 1,0 8,0a4,10 0 1,0 -8,0" stroke="#9A6A3E" stroke-width="1.4" fill="none"/>
        <path d="M0,0 l-6,-26" stroke="#6A4426" stroke-width="1.6"/>
      </g>`;
  }

  /* --- pinheiros grandes das bordas, acesos do lado da fogueira; o da direita tem o ramo do mocho --- */
  function pinheirosPertoSVG() {
    const r = semente(13);
    const casca = (x0, x1, lado) => {
      let d = '', luz = '';
      for (let y = -10; y < 900; y += 26 + r() * 24) {
        const t = (y + 20) / 920, xa = lerp(x0[0], x0[1], t), xb = lerp(x1[0], x1[1], t);
        d += `M${n(xa + 4)},${n(y)}L${n(xb - 4)},${n(y + (r() - .5) * 8)}`;
        const xl = lado > 0 ? xb - 6 - r() * 10 : xa + 6 + r() * 10;
        luz += `M${n(xl)},${n(y + 4)}l${n(lado * 2)},${n(14 + r() * 8)}`;
      }
      for (let i = 0; i < 4; i++) { const xm = lerp(.25, .75, i / 3); d += `M${n(lerp(x0[1], x1[1], xm))},900 C${n(lerp(x0[0], x1[0], xm) + 6)},500 ${n(lerp(x0[0], x1[0], xm) - 4)},200 ${n(lerp(x0[0], x1[0], xm))},-20`; }
      return { d, luz };
    };
    const cE = casca([52, 18], [104, 128], 1), cD = casca([1526, 1500], [1578, 1610], -1);
    let copaE = '', copaD = '';
    for (let i = 0; i < 9; i++) copaE += blobD(-60 + i * 40 + r() * 20, 20 + r() * 110 - (i > 6 ? 0 : 0), 60 + r() * 40, 34 + r() * 20, r, 10, .22);
    for (let i = 0; i < 9; i++) copaD += blobD(1380 + i * 36 + r() * 20, 10 + r() * 120, 56 + r() * 40, 32 + r() * 20, r, 10, .22);
    let tufos = '';
    for (let i = 0; i < 6; i++) tufos += blobD(1238 + r() * 20 + (i % 3) * 14, 288 + (r() - .5) * 18, 22 + r() * 10, 12 + r() * 6, r, 9, .3);
    return `<ellipse class="fg-sombra" data-x="80" data-y="900" cx="30" cy="900" rx="140" ry="22" fill="url(#fogo-sombra)"/>
      <path d="M18,900 C34,600 46,300 52,-20 L104,-20 C100,300 108,600 128,900 Z" fill="url(#fogo-pinhoE)"/>
      <path d="${cE.d}" stroke="#0A0608" stroke-width="2.2" fill="none" opacity=".7"/>
      <path class="fg-luz" data-b=".7" d="${cE.luz}" stroke="#F09050" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <g class="fg-copaE"><path d="${copaE}" fill="#0A0C1A"/><path d="M80,150 C140,170 220,160 280,128" stroke="#3A2224" stroke-width="10" fill="none" opacity=".6" stroke-linecap="round"/></g>
      <ellipse class="fg-sombra" data-x="1550" data-y="900" cx="1610" cy="900" rx="140" ry="22" fill="url(#fogo-sombra)"/>
      <path d="M1500,900 C1512,600 1520,300 1526,-20 L1578,-20 C1586,300 1596,600 1610,900 Z" fill="url(#fogo-pinhoD)"/>
      <path d="${cD.d}" stroke="#0A0608" stroke-width="2.2" fill="none" opacity=".7"/>
      <path class="fg-luz" data-b=".7" d="${cD.luz}" stroke="#F09050" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M1530,312 C1470,300 1390,292 1266,290 C1261,293 1262,298 1268,300 C1390,304 1474,316 1530,338 Z" fill="#1E1416" stroke="#0A0608" stroke-width="2"/>
      <path class="fg-luz" data-b=".6" d="M1270,299 C1390,303 1474,315 1528,336" stroke="#E08848" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M1300,296 l-16,-22 M1420,300 l14,-24" stroke="#1E1416" stroke-width="4" stroke-linecap="round"/>
      <g class="fg-copaD"><path d="${copaD}" fill="#0A0C1A"/><path d="${tufos}" fill="#0E1222"/><path d="M1268,300 C1280,306 1300,306 1314,300" stroke="#C07040" stroke-width="2.4" fill="none" opacity=".5" stroke-linecap="round"/></g>`;
  }

  /* --- mocho-galego (pousado no ramo; dá uma volta a voar de vez em quando) --- */
  function mochoSVG() {
    const asa = s => `<path class="fg-asa${s < 0 ? 'E' : 'D'}" d="M${s * 12},-42 C${s * 34},-64 ${s * 62},-64 ${s * 84},-48 C${s * 72},-44 ${s * 70},-36 ${s * 62},-30 C${s * 54},-34 ${s * 50},-28 ${s * 44},-24 C${s * 36},-28 ${s * 26},-26 ${s * 14},-22 Z" fill="#5E432E" stroke="#2A1A10" stroke-width="2" stroke-linejoin="round"/>`;
    const olho = x => `<circle cx="${x}" cy="-57" r="7.4" fill="#2A1A10"/><circle cx="${x}" cy="-57" r="6.4" fill="#F6C21E"/><circle cx="${x + .6}" cy="-56.6" r="3.6" fill="#120A06"/>
      <circle cx="${x - 1.6}" cy="-59.2" r="1.5" fill="#FFFFFF"/><circle cx="${x - 2.6}" cy="-54" r="1" fill="#FFB060"/>`;
    return `<g class="fg-mocho" transform="translate(1322,290)">
      <g class="fg-mochoAsas" opacity="0">${asa(-1)}${asa(1)}</g>
      <path d="M-8,-8 L0,6 L8,-8 Z" fill="#3E2A1E"/>
      <ellipse cx="0" cy="-26" rx="23" ry="28" fill="url(#fogo-mocho)" stroke="#2A1A10" stroke-width="2"/>
      <ellipse cx="2" cy="-20" rx="14" ry="19" fill="#B89A74"/>
      <path d="M-4,-30 l2,6 M4,-26 l2,6 M-2,-16 l2,6 M8,-16 l1,6 M-8,-22 l1,6" stroke="#6A4A30" stroke-width="2.2" stroke-linecap="round"/>
      <g class="fg-mochoDobrada"><path d="M-22,-34 C-26,-20 -22,-8 -12,-2 C-14,-14 -14,-26 -10,-40 Z" fill="#4E3626"/><path d="M22,-34 C26,-20 22,-8 12,-2 C14,-14 14,-26 10,-40 Z" fill="#4E3626"/>
        <g fill="#E8DCC4"><circle cx="-18" cy="-28" r="1.6"/><circle cx="-16" cy="-18" r="1.4"/><circle cx="18" cy="-28" r="1.6"/><circle cx="16" cy="-18" r="1.4"/></g></g>
      <path d="M-22,-24 C-21,-14 -16,-7 -9,-3" stroke="#FF9A50" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".5"/>
      <path d="M-8,0 l-3,5 M-4,0 l0,6 M4,0 l0,6 M8,0 l3,5" stroke="#C8B070" stroke-width="2.2" stroke-linecap="round"/>
      <g class="fg-mochoCab">
        <ellipse cx="0" cy="-58" rx="22" ry="19" fill="#6A4E36" stroke="#2A1A10" stroke-width="2"/>
        <g fill="#E8DCC4"><circle cx="-10" cy="-72" r="1.6"/><circle cx="0" cy="-74" r="1.6"/><circle cx="10" cy="-72" r="1.6"/><circle cx="-16" cy="-66" r="1.3"/><circle cx="16" cy="-66" r="1.3"/><circle cx="-5" cy="-70" r="1.2"/><circle cx="5" cy="-70" r="1.2"/></g>
        <ellipse cx="-8.5" cy="-56" rx="10" ry="9" fill="#CDB894"/><ellipse cx="8.5" cy="-56" rx="10" ry="9" fill="#CDB894"/>
        <path d="M-18,-63 Q-10,-69 -2,-62 M2,-62 Q10,-69 18,-63" stroke="#F4ECDA" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <g class="fg-mochoOlhos">${olho(-8.5)}${olho(8.5)}</g>
        <ellipse class="fg-palp0" cx="-8.5" cy="-57" rx="7.8" ry="7.8" fill="#6A4E36" transform="translate(0,-64.8) scale(1,.001) translate(0,64.8)"/>
        <ellipse class="fg-palp1" cx="8.5" cy="-57" rx="7.8" ry="7.8" fill="#6A4E36" transform="translate(0,-64.8) scale(1,.001) translate(0,64.8)"/>
        <path d="M-3,-52 L3,-52 L0,-45 Z" fill="#C8C070" stroke="#4A4020" stroke-width="1"/>
      </g>
    </g>`;
  }

  /* --- ervas em primeiro plano (abanam com o vento) --- */
  function ervasSVG() {
    const tufos = (x0, x1, sem) => {
      const r = semente(sem);
      let d = '', luz = '';
      for (let x = x0; x < x1; x += 6 + r() * 10) {
        const h = 26 + r() * 50, b = 900 - r() * 14, inc = (r() - .5) * 26;
        d += `M${n(x - 3)},${n(b)}Q${n(x + inc * .4)},${n(b - h * .6)} ${n(x + inc)},${n(b - h)}Q${n(x + inc * .4 + 3)},${n(b - h * .5)} ${n(x + 3)},${n(b)}Z`;
        if (r() < .5) luz += `M${n(x + inc * .5)},${n(b - h * .55)}Q${n(x + inc * .8)},${n(b - h * .8)} ${n(x + inc)},${n(b - h)}`;
      }
      return { d, luz };
    };
    const e = tufos(-10, 330, 3), d = tufos(1280, 1610, 9);
    return `<g class="fg-ervaE"><path d="${e.d}" fill="#100E14"/><path d="${e.luz}" stroke="#8A5A30" stroke-width="1.6" fill="none" opacity=".7"/></g>
      <g class="fg-ervaD"><path d="${d.d}" fill="#100E14"/><path d="${d.luz}" stroke="#8A5A30" stroke-width="1.6" fill="none" opacity=".7"/></g>`;
  }

  /* --- a fogueira completa (o «animal»: zona de toque grande) --- */
  function fogueiraSVG() {
    return `<g class="fg-fogo">
      <rect x="560" y="250" width="480" height="560" fill="#000" fill-opacity="0"/>
      <ellipse cx="${CX}" cy="740" rx="250" ry="70" fill="#0E0808" opacity=".5"/>
      ${pedrasSVG(true)}
      <g class="fg-lenhaTras">
        ${brasasSVG()}
        ${lenhaSVG(636, 694, 826, 716, 20, 'fogo-lenhaPonta', .8, 1, false, 3)}
        ${lenhaSVG(968, 692, 776, 716, 20, 'fogo-lenhaPonta', .8, 1, false, 7)}
      </g>
      <path class="fg-aura" fill="#FF7A2A" opacity=".13"/><path class="fg-aura" fill="#FF6424" opacity=".22"/>
      <path class="fg-chama0" fill="url(#fogo-chamaV)"/>
      <path class="fg-chama1" fill="url(#fogo-chamaL)"/>
      <path class="fg-chama2" fill="url(#fogo-chamaA)"/>
      <path class="fg-chama3" fill="url(#fogo-chamaB)"/>
      ${pedrasSVG(false)}
      <g class="fg-lenhaFrente">
        ${lenhaSVG(610, 778, 918, 698, 24, 'fogo-lenhaMeio', .36, .64, true, 11)}
        ${lenhaSVG(990, 778, 682, 698, 24, 'fogo-lenhaMeio', .36, .64, false, 17)}
        <ellipse cx="${CX}" cy="716" rx="70" ry="20" fill="url(#fogo-brasaLuz)" class="fg-brasaLuz2"/>
      </g>
      <path class="fg-frente0" fill="url(#fogo-chamaL)"/>
      <path class="fg-frente1" fill="url(#fogo-chamaA)"/>
      <circle class="fg-estalo" r="1" fill="url(#fogo-faisca)" opacity="0"/>
    </g>`;
  }

  /* ================= 5) montar() ================= */
  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .45 : 1;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.innerHTML = `<defs>${defs()}</defs>
      ${ceuSVG()}${pinhalSVG()}${chaoSVG()}${tendaSVG()}${pilhaSVG()}
      <circle class="fg-halo" r="470" fill="url(#fogo-halo)"/>
      ${fogueiraSVG()}
      ${cepoSVG()}${bancoSVG()}${pinheirosPertoSVG()}${mochoSVG()}
      <g class="fg-fumos">${Array.from({ length: 16 }, () => '<circle r="1" fill="url(#fogo-fumo)" opacity="0"/>').join('')}</g>
      ${ervasSVG()}
      <rect class="fg-clarao" width="1600" height="900" fill="url(#fogo-clarao)" opacity="0" pointer-events="none"/>
      <rect class="fg-vinheta" width="1600" height="900" fill="url(#fogo-vinheta)" pointer-events="none"/>
      <g class="fg-faulhas" pointer-events="none">
        <path class="fg-faulha2" stroke="#E2562A" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".75"/>
        <path class="fg-faulha1" stroke="#FFB040" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path class="fg-faulha0" stroke="#FFF2B8" stroke-width="3.6" fill="none" stroke-linecap="round"/>
      </g>
      <g pointer-events="none">${PIRILAMPOS.map(() => '<circle r="13" fill="url(#fogo-pirilampo)" opacity="0"/>').join('')}</g>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s), qa = s => Array.from(svg.querySelectorAll(s));
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; el.setAttribute(nome, v); } }

    const R = {
      fogo: q('.fg-fogo'), chama: [0, 1, 2, 3].map(i => q('.fg-chama' + i)), aura: qa('.fg-aura'), frente: [q('.fg-frente0'), q('.fg-frente1')],
      lenhaTras: q('.fg-lenhaTras'), lenhaFrente: q('.fg-lenhaFrente'), estalo: q('.fg-estalo'),
      brasas: [0, 1, 2].map(i => q('.fg-brasa' + i)), brasaLuz: q('.fg-brasaLuz'), brasaLuz2: q('.fg-brasaLuz2'), fendas: qa('.fg-fenda'),
      halo: q('.fg-halo'), clarao: q('.fg-clarao'), vinheta: q('.fg-vinheta'),
      luzes: qa('.fg-luz').map(el => ({ el, b: +el.getAttribute('data-b') || .6 })),
      sombras: qa('.fg-sombra').map(el => ({ el, x: +el.getAttribute('data-x'), y: +el.getAttribute('data-y') })),
      faulha: [0, 1, 2].map(i => q('.fg-faulha' + i)), fumos: Array.from(q('.fg-fumos').children),
      pirilampos: Array.from(svg.lastElementChild.children),
      estrelas: [1, 2, 3].map(i => q('.fg-estrelas' + i)), brilhantes: BRILHANTES.map((b, i) => q('.fg-brilha' + i)),
      cadente: q('.fg-cadente'), nuvem: q('.fg-nuvem'), copaE: q('.fg-copaE'), copaD: q('.fg-copaD'),
      ervaE: q('.fg-ervaE'), ervaD: q('.fg-ervaD'), vapor: [q('.fg-vapor0'), q('.fg-vapor1')],
      pano: q('.fg-tendaPano'), abaE: q('.fg-abaE'), abaD: q('.fg-abaD'),
      mocho: q('.fg-mocho'), mochoCab: q('.fg-mochoCab'), mochoOlhos: q('.fg-mochoOlhos'), palp: [q('.fg-palp0'), q('.fg-palp1')],
      mochoAsas: q('.fg-mochoAsas'), asaE: q('.fg-asaE'), asaD: q('.fg-asaD'), mochoDobrada: q('.fg-mochoDobrada')
    };

    /* --- estado --- */
    let tempo = 0, vivo = true;
    const S = { alt: 1, larg: 1, vento: 0, luz: 0, brasas: 0, onda: 1, assenta: 0, pico: 0, picoX: 0 };   // valores suavizados
    const linguas = CAMADAS.map(c => c.linguas.map(([bx, w, h]) => ({ bx, w, h, ph: aleat(0, 2 * PI), f: aleat(.85, 1.2), k: 1, prox: aleat(200, 1600) })));
    const frente = FRENTE.map(c => c.map(([bx, w, h]) => ({ bx, w, h, ph: aleat(0, 2 * PI), f: aleat(.9, 1.3) })));
    const soltas = [];        // pedaços de chama que se soltam: { c (camada), x, y, w0, h0, vy, t, dur, ph }
    const faulhas = [];       // { x, y, vx, vy, t, dur, ph, esp (espiral ou null) }
    const fumos = R.fumos.map(el => ({ el, vivo: false, x: 0, y: 0, r0: 0, r1: 0, vy: 0, t: 0, dur: 1, op: 0, ph: 0 }));
    const tarefas = [];       // { tipo: 'ocioso' | 'reacao' | 'raro', nome, t, dur, f(u, A, dt), fim }
    const mocho = { x: 1322, y: 290, voo: false, inc: 0, asa: 0, olhar: -.6, olharAlvo: -.6, proxOlhar: 2500, pisca: 0, proxPisca: 1800, tPisca: -1, susto: 0, salto: 0 };
    const pirilampos = PIRILAMPOS.map(([x, y], i) => ({ x, y, rx: aleat(20, 50), ry: aleat(10, 30), f1: aleat(.2, .45), f2: aleat(.25, .5), fb: aleat(.5, 1.1), ph: i * 2.1 }));
    let emitir = 0, emitirFumo = 0;

    /* --- tarefas: cada uma soma a sua parte aos alvos A em cada quadro (nunca deixa nada partido se for cortada) --- */
    function tarefa(tipo, nome, dur, f, fim) { const k = { tipo, nome, t: 0, dur, f, fim }; tarefas.push(k); return k; }
    function correrTarefas(dt, A) {
      for (let i = 0; i < tarefas.length; i++) {
        const k = tarefas[i];
        k.t += dt;
        const u = Math.min(1, k.t / k.dur);
        k.f(u, A, dt);
        if (u >= 1) { tarefas.splice(i--, 1); if (k.fim) k.fim(); }
      }
    }
    const ha = tipo => tarefas.some(k => k.tipo === tipo);

    /* --- partículas --- */
    function faulha(x, y, vx, vy, dur, esp) {
      if (faulhas.length > 240) faulhas.shift();
      faulhas.push({ x, y, vx, vy, t: 0, dur, ph: aleat(0, 2 * PI), esp: esp || null });
    }
    function jorro(x, y, k, abre, forca, dur) {      // jorro de faúlhas a partir de um ponto
      for (let i = 0; i < k; i++) faulha(x + aleat(-8, 8), y + aleat(-6, 6), aleat(-abre, abre), -aleat(forca * .5, forca), aleat(dur * .6, dur));
    }
    function fumo(x, y, r0, r1, dur, op, vy) {
      const f = fumos.find(p => !p.vivo) || fumos.reduce((a, b) => a.t / a.dur > b.t / b.dur ? a : b);
      Object.assign(f, { vivo: true, x, y, r0, r1, dur, op, vy, t: 0, ph: aleat(0, 6.3) });
    }
    function soltar(ci, g) {                          // a ponta da língua solta-se e sobe a apagar-se
      if (soltas.length > 40 || !g._h || g._h < 100) return;
      const s = .8, h = g._h;
      const x = g._cx + desvio(s, h, S.onda, g.ph, g._T, S.vento), y = g._by - h * s, vy = -aleat(150, 230), dur = aleat(340, 560), ph = aleat(0, 6.3);
      soltas.push({ c: ci, x, y, w0: g._w * .28, h0: h * .28, vy, t: 0, dur, ph });
      // por dentro, um pedaço da camada seguinte (mais clara): o pedaço solto tem as cores de uma chama, não é uma gota
      if (ci < 2) soltas.push({ c: ci + 1, x, y: y - 3, w0: g._w * .15, h0: h * .17, vy, t: 0, dur: dur * .85, ph });
      g.k = .72;
    }

    /* --- variações ociosas --- */
    const ESTALOS = [[742, 706], [858, 706], [800, 716], [700, 730], [902, 728]];
    const VARIACOES = {
      estalo() {                                     // um tronco estala e solta um jorro de faúlhas
        const [x, y] = escolhe(ESTALOS);
        jorro(x, y, 28, 170, 640, 1700);
        tarefa('ocioso', 'estalo', 1100, (u, A) => {
          A.alt += .1 * sino(u / .35); A.luz += .3 * Math.max(0, 1 - u / .3); A.brasas += .3 * sino(u / .4);
          poe(R.estalo, `translate(${x},${y}) scale(${n(10 + 40 * esai(Math.min(1, u / .12)))})`);
          atr(R.estalo, 'opacity', n3(Math.max(0, 1 - u / .35)));
        }, () => atr(R.estalo, 'opacity', 0));
      },
      aragem() {                                     // uma aragem deita as chamas para um lado
        const d = escolhe([-1, 1]);
        tarefa('ocioso', 'aragem', 3400, (u, A) => { const e = Math.pow(sino(u), 1.4); A.vento += d * .5 * e * calma; A.onda += .35 * e; A.alt -= .05 * e; });
      },
      assentar() {                                   // um tronco assenta: as brasas avivam e sobe um jorro baixo
        let feito = false;
        tarefa('ocioso', 'assentar', 2200, (u, A) => {
          const queda = u < .1 ? Math.pow(u / .1, 2) : u < .2 ? 1 - .3 * sino((u - .1) / .1) : 1 - eio((u - .2) / .8);
          A.assenta += 5 * queda;
          A.alt += u < .25 ? -.1 * sino(u / .25) : .14 * sino((u - .25) / .75);
          A.brasas += .9 * envelope(u, .15); A.luz += .25 * envelope(u, .15);
          if (!feito && u > .1) {
            feito = true;
            jorro(CX + aleat(-60, 60), 722, 20, 120, 420, 1300);
            for (let i = 0; i < 3; i++) fumo(CX + aleat(-90, 90), 724, 12, 40, 1600, .35, -30);
          }
        });
      },
      fumo() {                                       // um rolo de fumo maior sobe (um pau ainda húmido)
        let k = 0;
        tarefa('ocioso', 'fumo', 3000, (u, A) => {
          A.alt -= .06 * sino(u); A.onda -= .1 * sino(u);
          if (k < 5 && u > k * .14) { k++; fumo(CX + aleat(-30, 30) + S.vento * 120, BY - 300 * S.alt + aleat(-10, 30), aleat(36, 50), aleat(150, 190), aleat(6500, 8000), .62, -aleat(48, 62)); }
        });
      },
      labareda() {                                   // uma labareda salta mais alto e solta pedaços
        const px = escolhe([-32, 26, -84, 82]);
        let soltou = false;
        tarefa('ocioso', 'labareda', 1800, (u, A) => {
          A.pico += .6 * envelope(u, .3); A.picoX = px; A.luz += .15 * sino(u);
          if (!soltou && u > .45) {
            soltou = true;
            linguas.forEach((c, ci) => ci < 2 && c.forEach(g => { if (Math.abs(g.bx - px) < 50) soltar(ci, g); }));
            jorro(CX + px, BY - 330, 10, 90, 380, 1500);
          }
        });
      }
    };
    const NOMES_V = Object.keys(VARIACOES);
    const ocioso = { prox: aleat(2500, 4500), ultimo: null, ligado: true };
    function agendarOcioso(dt) {
      if (!ocioso.ligado) return;
      ocioso.prox -= dt;
      if (ocioso.prox > 0 || ha('ocioso')) return;
      ocioso.prox = aleat(4000, 9000);
      let nome; do nome = escolhe(NOMES_V); while (nome === ocioso.ultimo);
      ocioso.ultimo = nome;
      VARIACOES[nome]();
    }

    /* --- reações ao toque (alternadas) --- */
    const REACOES = {
      crescer() {                                    // as chamas crescem e solta-se uma chuva de faúlhas; a luz aumenta
        for (let i = 0; i < 70; i++) faulha(CX + aleat(-120, 120), BY - aleat(60, 300), aleat(-280, 280), -aleat(480, 1000), aleat(1200, 2300));
        linguas.forEach(c => c.forEach(g => { g.prox = Math.min(g.prox, aleat(150, 600)); }));
        tarefa('reacao', 'crescer', 1700, (u, A, dt) => {
          const e = envelope(u, .09);
          A.alt += .34 * e + .05 * Math.sin(u * PI * 7) * e; A.larg += .16 * e; A.luz += .8 * e; A.brasas += .7 * e; A.onda += .5 * e;
          if (u < .5) emitir += dt / 1000 * 50;
        });
      },
      espiral() {                                    // «puf»: as chamas encolhem e esticam e sobe uma espiral de faúlhas
        const sentido = escolhe([-1, 1]);
        for (let i = 0; i < 64; i++) {
          faulha(CX, BY - 120, 0, 0, aleat(1300, 2200), { cx: CX, cy: BY - 110 - aleat(0, 40), a0: i * 2.4, r0: aleat(8, 30), vr: aleat(70, 130), w: sentido * aleat(4.5, 7.5), vs: aleat(260, 430), t0: i * 6 });
        }
        fumo(CX, BY - 320, 30, 130, 3500, .5, -80);
        tarefa('reacao', 'espiral', 1500, (u, A) => {
          const a = u < .1 ? lerp(0, -.16, esai(u / .1)) : u < .25 ? lerp(-.16, .4, eio((u - .1) / .15)) : .4 * (1 - eio((u - .25) / .75));
          const l = u < .1 ? .2 * esai(u / .1) : u < .25 ? lerp(.2, -.04, eio((u - .1) / .15)) : -.04 * (1 - eio((u - .25) / .75));
          const e = envelope(u, .12);
          A.alt += a; A.larg += l; A.luz += .65 * e; A.brasas += .5 * e; A.onda += .3 * e;
        });
      },
      danca() {                                      // as chamas dançam de um lado para o outro e saem dois repuxos
        const d = escolhe([-1, 1]);
        for (const lado of [-1, 1]) for (let i = 0; i < 30; i++) faulha(CX + lado * aleat(20, 70), BY - aleat(100, 220), lado * aleat(180, 420), -aleat(450, 820), aleat(1100, 2000));
        linguas.forEach(c => c.forEach(g => { g.prox = aleat(0, 200); }));
        tarefa('reacao', 'danca', 1600, (u, A) => {
          const e = envelope(u, .08);
          A.vento += d * .55 * Math.sin(u * PI * 4) * (1 - u) * calma; A.alt += .26 * e; A.larg += .1 * e; A.luz += .62 * e; A.onda += .9 * e; A.brasas += .5 * e;
        });
      }
    };
    const NOMES_R = Object.keys(REACOES);
    let ultimaReacao = null;
    function reagir(nome) {
      for (let i = tarefas.length - 1; i >= 0; i--) if (tarefas[i].tipo === 'reacao') tarefas.splice(i, 1);
      if (!nome) { do nome = escolhe(NOMES_R); while (nome === ultimaReacao); }
      ultimaReacao = nome;
      REACOES[nome]();
      mocho.susto = 1;
    }

    /* --- acontecimentos raros --- */
    const VOO = [[1322, 290], [1300, 234], [1236, 168], [1160, 126], [1066, 150], [1040, 226], [1120, 292], [1250, 314], [1322, 290]];
    const EVENTOS = {
      estrela() {                                    // estrela cadente (o mocho segue-a com os olhos)
        const [a, b] = escolhe([[[230, 120], [560, 250]], [[1080, 40], [1420, 200]], [[300, 60], [540, 200]]]);
        const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) / RAD;
        mocho.olharAlvo = a[0] < 1300 ? -1 : 1;
        tarefa('raro', 'estrela', 1400, u => {
          const e = esai(u), x = lerp(a[0], b[0], e), y = lerp(a[1], b[1], e);
          poe(R.cadente, `translate(${n(x)},${n(y)}) rotate(${n(ang)}) scale(${n3(.4 + .6 * sino(u * .9))},1)`);
          atr(R.cadente, 'opacity', n3(sino(u)));
        }, () => atr(R.cadente, 'opacity', 0));
      },
      coruja() {                                     // o mocho levanta voo, dá uma volta (à frente da lua) e volta ao ramo
        let px = mocho.x;
        tarefa('raro', 'coruja', 6200, (u, A, dt) => {
          if (u < .07) { mocho.salto = sino(u / .07 * .5) * -6; mocho.voo = false; }
          else if (u < .93) {
            const w = (u - .07) / .86, [x, y] = catmull(VOO, eio(w));
            mocho.voo = true; mocho.x = x; mocho.y = y - 26 * sino(w) * 0; mocho.salto = 0;
            const vx = (x - px) / Math.max(1, dt) * 1000; px = x;
            mocho.inc += (limita(vx * .03, -16, 16) - mocho.inc) * .1;
            mocho.asa = Math.sin(tempo / 1000 * 15);
          } else { mocho.voo = false; mocho.x = 1322; mocho.y = 290; mocho.inc *= .8; mocho.salto = -4 * sino((u - .93) / .07); }
        }, () => { Object.assign(mocho, { voo: false, x: 1322, y: 290, inc: 0, salto: 0 }); });
      },
      tenda() {                                      // uma rajada abana a tenda e deita o fogo
        const d = 1;
        tarefa('raro', 'tenda', 3800, (u, A) => {
          const e = Math.pow(sino(u), 1.2);
          A.vento += d * .5 * e * calma; A.onda += .4 * e;
          A.aba += 14 * Math.sin(u * PI * 7) * e; A.pano += e;
          if (Math.random() < .08 * e) faulha(CX + aleat(-40, 40), BY - aleat(150, 300), 240, -aleat(200, 400), 1400);
        });
      }
    };
    const NOMES_E = Object.keys(EVENTOS);
    const raro = { prox: aleat(15000, 22000), ultimo: null, ligado: true };
    function agendarRaro(dt) {
      if (!raro.ligado || ha('raro')) return;
      raro.prox -= dt;
      if (raro.prox > 0) return;
      raro.prox = aleat(15000, 40000);
      let nome; do nome = escolhe(NOMES_E); while (nome === raro.ultimo);
      raro.ultimo = nome;
      EVENTOS[nome]();
    }

    /* --- desenhar as chamas --- */
    function desenharChamas(t) {
      const vento = S.vento, dtS = 1;
      CAMADAS.forEach((c, ci) => {
        let d = '';
        for (const g of linguas[ci]) {
          const T = t * g.f;
          const tremor = .9 + .1 * Math.sin(T * 3.1 + g.ph) + .06 * Math.sin(T * 7.3 + g.ph * 2.3);
          const pico = S.pico * Math.exp(-Math.pow((g.bx - S.picoX) / 55, 2));
          const h = g.h * g.k * tremor * S.alt * (1 + pico);
          const w = g.w * S.larg * (1 + .05 * Math.sin(T * 4.3 + g.ph));
          const cx = CX + g.bx * S.larg + vento * 14, by = BY - c.y + S.assenta;
          g._h = h; g._w = w; g._cx = cx; g._by = by; g._T = T;
          d += lingua(cx, by, w, h, S.onda, g.ph, T, vento);
        }
        for (const p of soltas) if (p.c === ci) {
          const u = p.t / p.dur;
          d += lingua(p.x, p.y, p.w0 * Math.pow(1 - u, .7), p.h0 * (1 - .5 * u), .6, p.ph, t, vento * .5);
        }
        atr(R.chama[ci], 'd', d);
        if (ci === 0) R.aura.forEach(el => atr(el, 'd', d));
      });
      FRENTE.forEach((c, ci) => {
        let d = '';
        frente[ci].forEach(g => {
          const T = t * g.f, h = g.h * (.85 + .15 * Math.sin(T * 4 + g.ph) + .08 * Math.sin(T * 9.1 + g.ph)) * (.6 + .4 * S.alt);
          d += lingua(CX + g.bx + vento * 6, topoLenha(g.bx) + S.assenta, g.w * S.larg, h, S.onda * 1.2, g.ph, T, vento * .8);
        });
        atr(R.frente[ci], 'd', d);
      });
    }
    function atualizarLinguas(dt) {
      const k = 1 - Math.exp(-dt / 320);
      linguas.forEach((c, ci) => c.forEach(g => {
        g.k += (1 - g.k) * k;
        g.prox -= dt;
        if (g.prox <= 0) { g.prox = aleat(1100, 2600); if (ci < 2) soltar(ci, g); }
      }));
      const s = dt / 1000;
      for (let i = soltas.length - 1; i >= 0; i--) {
        const p = soltas[i];
        p.t += dt;
        if (p.t >= p.dur) { soltas.splice(i, 1); continue; }
        p.y += p.vy * s; p.x += (S.vento * 140 + 40 * Math.sin(tempo / 160 + p.ph)) * s;
      }
    }

    /* --- faúlhas e fumo --- */
    function atualizarFaulhas(dt, t) {
      const s = dt / 1000;
      emitir += s * 5 * S.alt * (1 + S.brasas);
      while (emitir >= 1) { emitir--; faulha(CX + aleat(-90, 90) + S.vento * 60, BY - aleat(40, 220) * S.alt, aleat(-30, 30), -aleat(120, 260), aleat(1400, 2600)); }
      const d = ['', '', ''];
      for (let i = faulhas.length - 1; i >= 0; i--) {
        const p = faulhas[i];
        p.t += dt;
        if (p.t >= p.dur) { faulhas.splice(i, 1); continue; }
        let vx, vy;
        if (p.esp) {                                 // espiral: roda à volta de um centro que sobe
          const e = p.esp, tt = Math.max(0, p.t - e.t0) / 1000, r = e.r0 + e.vr * tt, a = e.a0 + e.w * tt;
          const x = e.cx + r * Math.cos(a) + S.vento * 80 * tt, y = e.cy - e.vs * tt + r * Math.sin(a) * .35 - 40 * tt * tt;
          vx = (x - p.x) / s; vy = (y - p.y) / s; p.x = x; p.y = y;
          if (p.t < 40) { vx = 0; vy = -10; }
        } else {
          p.vy = p.vy * Math.exp(-s * .9) - 40 * s;
          p.vx += (Math.sin(t * 3 + p.ph) * 90 + S.vento * 320 - p.vx * .9) * s;
          p.x += p.vx * s; p.y += p.vy * s; vx = p.vx; vy = p.vy;
        }
        const u = p.t / p.dur;
        let b = u < .3 ? 0 : u < .66 ? 1 : 2;
        if (Math.sin(t * 27 + p.ph * 5) > .8) b = Math.min(2, b + 1);   // cintila
        const k = .02 * (1 - u * .5);
        d[b] += `M${n(p.x)},${n(p.y)}l${n(-limita(vx * k, -18, 18))},${n(-limita(vy * k, -18, 18) + .1)}`;
      }
      for (let b = 0; b < 3; b++) atr(R.faulha[b], 'd', d[b] || 'M0,0');
    }
    function atualizarFumo(dt) {
      const s = dt / 1000;
      emitirFumo -= dt;
      if (emitirFumo <= 0) { emitirFumo = aleat(420, 640); fumo(CX + aleat(-50, 50) + S.vento * 100, BY - 310 * S.alt - aleat(0, 40), aleat(20, 34), aleat(90, 130), aleat(5200, 7200), .46, -aleat(40, 60)); }
      for (const f of fumos) {
        if (!f.vivo) { atr(f.el, 'opacity', 0); continue; }
        f.t += dt;
        const u = f.t / f.dur;
        if (u >= 1) { f.vivo = false; atr(f.el, 'opacity', 0); continue; }
        f.x += (S.vento * 100 + 12 + 8 * Math.sin(tempo / 2000 + f.ph)) * s;
        f.y += f.vy * s * (1 - u * .4);
        poe(f.el, `translate(${n(f.x)},${n(f.y)}) scale(${n(lerp(f.r0, f.r1, esai(u)))})`);
        atr(f.el, 'opacity', n3(f.op * Math.min(1, u / .12) * Math.pow(1 - u, 1.3)));
      }
    }

    /* --- a luz da fogueira no cenário --- */
    function atualizarLuz(t) {
      const tremor = .5 * Math.sin(t * 13.1) + .3 * Math.sin(t * 7.7 + 1.3) + .2 * Math.sin(t * 23.3 + .4);
      const L = (.84 + .1 * tremor) * (.72 + .28 * S.alt) + S.luz * .8;
      for (const o of R.luzes) atr(o.el, 'opacity', n3(limita(o.b * L, 0, 1)));
      poe(R.halo, `translate(${CX},560) scale(${n3(S.larg * (1 + .03 * tremor))},${n3((.82 + .18 * S.alt) * (1 + .03 * tremor))})`);
      atr(R.halo, 'opacity', n3(limita(.85 + .08 * tremor + S.luz * .3, 0, 1)));
      atr(R.clarao, 'opacity', n3(limita(S.luz * .7, 0, .7)));
      atr(R.vinheta, 'opacity', n3(limita(1 - .4 * S.luz, .5, 1)));
      R.brasas.forEach((el, i) => atr(el, 'opacity', n3(limita(.55 + .3 * Math.sin(t * (1.3 + i * .7) + i * 2) + .1 * tremor + S.brasas * .6, .12, 1))));
      atr(R.brasaLuz, 'opacity', n3(limita(.6 + .2 * tremor + S.brasas * .4, 0, 1)));
      atr(R.brasaLuz2, 'opacity', n3(limita(.55 + .25 * tremor + S.brasas * .4, 0, 1)));
      const fo = n3(limita(.5 + .35 * Math.sin(t * 2.1) + .1 * tremor + S.brasas * .5, .1, 1));
      for (const el of R.fendas) atr(el, 'opacity', fo);
      for (const sb of R.sombras) poe(sb.el, `translate(${sb.x},${sb.y}) scale(${n3(1 + .04 * tremor - .08 * S.luz)},1) translate(${-sb.x},${-sb.y})`);
    }

    /* --- cenário vivo --- */
    function animarCena(dt, t, A) {
      R.estrelas.forEach((el, i) => atr(el, 'opacity', n3(.55 + .45 * Math.sin(t * (.9 + i * .37) + i * 2.1))));
      R.brilhantes.forEach((el, i) => { const [x, y] = BRILHANTES[i]; poe(el, `translate(${x},${y}) scale(${n3(.75 + .3 * Math.sin(t * (1.1 + i * .23) + i))})`); });
      poe(R.nuvem, `translate(${n(((t * 7 + 1050) % 2300) - 400)},${n(150 + 6 * Math.sin(t * .05))})`);
      poe(R.copaE, `rotate(${n3((.5 * Math.sin(t * .4) + S.vento * 2) * calma)},70,200)`);
      poe(R.copaD, `rotate(${n3((.5 * Math.sin(t * .37 + 1) + S.vento * 2) * calma)},1540,200)`);
      const sk = n3((1.2 * Math.sin(t * .9) + S.vento * 10) * calma);
      poe(R.ervaE, `translate(0,900) skewX(${sk}) translate(0,-900)`);
      poe(R.ervaD, `translate(0,900) skewX(${n3(sk * .8 + .5 * Math.sin(t * 1.3))}) translate(0,-900)`);
      R.vapor.forEach((el, i) => {
        const u = ((t + i * 1.7) / 3.4) % 1;
        poe(el, `translate(${n(4 * Math.sin(t * 1.4 + i) + S.vento * 30 * u)},${n(-26 * u)}) translate(440,682) scale(${n3(1 + .4 * u)}) translate(-440,-682)`);
        atr(el, 'opacity', n3(.42 * sino(u)));
      });
      poe(R.abaE, `rotate(${n3((A.aba + S.vento * 5) * .6)},470,468)`);
      poe(R.abaD, `rotate(${n3(A.aba + S.vento * 6 + .8 * Math.sin(t * .8))},470,468)`);
      poe(R.pano, `translate(470,656) skewX(${n3(A.pano * 2.5 * Math.sin(t * 9) + S.vento * 1.5)}) translate(-470,-656)`);
      pirilampos.forEach((p, i) => {
        const x = p.x + p.rx * Math.sin(t * p.f1 + p.ph), y = p.y + p.ry * Math.sin(t * p.f2 + p.ph * 1.3);
        const o = Math.pow(Math.max(0, Math.sin(t * p.fb + p.ph)), 2);
        poe(R.pirilampos[i], `translate(${n(x)},${n(y)}) scale(${n3(.7 + .4 * o)})`);
        atr(R.pirilampos[i], 'opacity', n3(o * .95));
      });
    }
    function atualizarMocho(dt) {
      const m = mocho;
      m.proxOlhar -= dt;
      if (m.proxOlhar <= 0 && !ha('raro')) { m.proxOlhar = aleat(1800, 4800); m.olharAlvo = escolhe([-1, -.7, -.5, 0, .4]); }
      m.olhar += (m.olharAlvo - m.olhar) * (1 - Math.exp(-dt / 140));
      m.proxPisca -= dt;
      if (m.proxPisca <= 0) { m.proxPisca = aleat(2000, 6000); m.tPisca = 0; if (Math.random() < .25) m.proxPisca = 260; }
      if (m.tPisca >= 0) { m.tPisca += dt; m.pisca = sino(m.tPisca / 170); if (m.tPisca >= 170) { m.tPisca = -1; m.pisca = 0; } }
      m.susto = Math.max(0, m.susto - dt / 700);
      const fecha = m.susto > .3 ? 0 : m.pisca;
      poe(R.mocho, `translate(${n(m.x)},${n(m.y + m.salto)}) rotate(${n(m.inc)})`);
      poe(R.mochoCab, `rotate(${n(m.olhar * 9)},0,-44)`);
      poe(R.mochoOlhos, `translate(${n(m.olhar * 2.4)},-57) scale(${n3(1 + .18 * m.susto)}) translate(0,57)`);
      R.palp.forEach(el => poe(el, `translate(0,-64.8) scale(1,${n3(Math.max(.001, fecha))}) translate(0,64.8)`));
      atr(R.mochoAsas, 'opacity', m.voo ? 1 : 0);
      atr(R.mochoDobrada, 'opacity', m.voo ? 0 : 1);
      if (m.voo) { const a = n(32 * m.asa); poe(R.asaE, `rotate(${a},-12,-40)`); poe(R.asaD, `rotate(${-a},12,-40)`); }
    }

    /* --- relógio único --- */
    let erroMostrado = false;
    function passo(dt) {
      if (!vivo) return;
      try {
        dt = Math.min(dt, 50);
        tempo += dt;
        const t = tempo / 1000;
        const A = { alt: 0, larg: 0, vento: 0, luz: 0, brasas: 0, onda: 0, assenta: 0, pico: 0, picoX: S.picoX, aba: 0, pano: 0 };
        correrTarefas(dt, A);
        agendarOcioso(dt);
        agendarRaro(dt);
        const brisa = (.07 * Math.sin(t * .31) + .04 * Math.sin(t * .77 + 1)) * calma;
        const k = 1 - Math.exp(-dt / 45), kv = 1 - Math.exp(-dt / 110), kl = 1 - Math.exp(-dt / 160);
        S.alt += (1 + A.alt - S.alt) * k;
        S.larg += (1 + A.larg - S.larg) * k;
        S.onda += ((1 + A.onda) * (calma < 1 ? .7 : 1) - S.onda) * k;
        S.luz += (A.luz - S.luz) * k;
        S.brasas += (A.brasas - S.brasas) * kl;
        S.vento += (brisa + A.vento - S.vento) * kv;
        S.assenta += (A.assenta - S.assenta) * (1 - Math.exp(-dt / 30));
        S.pico += (A.pico - S.pico) * k; S.picoX = A.picoX;
        atualizarLinguas(dt);
        desenharChamas(t);
        R.aura.forEach((el, i) => { const k = 1.07 + i * -.035 + .02 * Math.sin(t * 9 + i); poe(el, `translate(${CX},${BY + 20}) scale(${n3(k + .04)},${n3(k)}) translate(${-CX},${-BY - 20})`); });
        poe(R.lenhaTras, `translate(0,${n(S.assenta * .5)})`);
        poe(R.lenhaFrente, `translate(0,${n(S.assenta)}) rotate(${n3(S.assenta * .2)},${CX},740)`);
        atualizarFaulhas(dt, t);
        atualizarFumo(dt);
        atualizarLuz(t);
        animarCena(dt, t, A);
        atualizarMocho(dt);
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    passo(16.7);

    return {
      animal: R.fogo,
      habitat: null,
      reagir() { if (vivo) reagir(); },
      fazerSom() {},                                 // os elementos não têm som (só a gravação do nome)
      irAoHabitat: () => Promise.resolve(),
      voltar: () => Promise.resolve(),
      destruir() {
        vivo = false;
        tarefas.length = 0; faulhas.length = 0; soltas.length = 0;
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola (modo de desenvolvimento)
      _teste: {
        S, mocho,
        variacao: nome => VARIACOES[nome](),
        reacao: nome => reagir(nome),
        evento: nome => EVENTOS[nome](),
        semEventos() { raro.ligado = false; },
        semVariacoes() { ocioso.ligado = false; },
        estado: () => ({ faulhas: faulhas.length, soltas: soltas.length, tarefas: tarefas.map(k => k.nome), elementos: svg.querySelectorAll('*').length })
      }
    };
  }

  return { icone: iconeSVG(), montar };
})();
