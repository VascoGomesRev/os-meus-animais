/* Água — «Os Meus Animais», grupo «Elementos». Contrato e regras: REGRAS-ANIMAIS.md (§2 e §11).
   Cena: uma cascata num vale de montanha do Gerês, num dia de sol (sol de cima à esquerda). Céu azul com nuvens que
   passam devagar e raios de sol muito leves, serras de granito azuladas ao longe, encostas com carvalhos e pinheiros em
   dois planos, um carvalho grande à esquerda e um pinheiro-silvestre à direita a fazer de moldura. No meio, penedos de
   granito com musgo, líquenes e fetos; entre eles um canal de onde a água cai.
   A água é a personagem (sem cara): a cascata é um véu branco-azulado com fios de água que descem (traços com
   `stroke-dasharray` cujo deslocamento anda a cada quadro), espuma que ferve em baixo, névoa que sobe, gotículas e um
   arco-íris ténue na névoa. A poça é transparente: vê-se o fundo de areia e seixos, a luz do sol a dançar no fundo
   (cáusticas), uma tinta de água mais funda junto à cascata, ondulação na superfície, círculos de ondas, reflexos que
   tremem, brilhos do sol e flocos de espuma a boiar. A poça escoa num ribeiro à direita (correntes que andam).
   Variações ociosas (4–9 s): jorro da cascata, peixinho (truta) que passa no fundo, gota grande que cai de um feto,
   libelinha-azul que toca na água, folha de carvalho que cai e é levada pela corrente. Reações ao toque (alternadas):
   grande «chape» com coroa de água e gotas, uma truta salta da água e volta a cair, a cascata dá um jorro e a espuma
   cresce. Acontecimentos raros (15–40 s): o melro-d'água mergulha e volta à pedra, uma rã salta para a água, passa uma
   chuvada rápida com o sol (e o arco-íris fica forte). O melro-d'água, pousado numa pedra, nota tudo e balança-se.
   Organização:
     1) utilidades (matemática, curvas)
     2) medidas da cascata e da poça
     3) ícone do menu
     4) cenário (céu, serras, encostas, penedos, fetos, árvores, poça, ribeiro, bichos)
     5) montar(): estado, envelopes, partículas, desenho por quadro, tarefas (variações, reações, acontecimentos) */
'use strict';
MODULOS.agua = (() => {
  const NS = 'http://www.w3.org/2000/svg';

  /* ================= 1) Utilidades ================= */
  const PI = Math.PI, TAU = 2 * PI, RAD = PI / 180, GRAU = 180 / PI;
  const lerp = (a, b, t) => a + (b - a) * t;
  const limita = (v, a, b) => v < a ? a : v > b ? b : v;
  const n = v => Math.round(v * 10) / 10;
  const n3 = v => Math.round(v * 1000) / 1000;
  const suave = t => t * t * (3 - 2 * t);
  const passoS = (a, b, x) => suave(limita((x - a) / (b - a), 0, 1));
  const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const esai = t => 1 - Math.pow(1 - t, 3);
  const eseno = t => -(Math.cos(PI * t) - 1) / 2;
  const sino = t => Math.sin(PI * limita(t, 0, 1));
  const aleat = (a, b) => a + Math.random() * (b - a);
  const escolhe = v => v[Math.random() * v.length | 0];
  function semente(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  // curva suave fechada por pontos (Catmull-Rom → Bézier)
  function curvaFechada(p) {
    const m = p.length;
    let d = 'M' + n(p[0][0]) + ',' + n(p[0][1]);
    for (let i = 0; i < m; i++) {
      const a = p[(i + m - 1) % m], b = p[i], c = p[(i + 1) % m], e = p[(i + 2) % m];
      d += 'C' + n(b[0] + (c[0] - a[0]) / 6) + ',' + n(b[1] + (c[1] - a[1]) / 6) + ' ' +
        n(c[0] - (e[0] - b[0]) / 6) + ',' + n(c[1] - (e[1] - b[1]) / 6) + ' ' + n(c[0]) + ',' + n(c[1]);
    }
    return d + 'Z';
  }
  // mancha irregular (copas, musgo, seixos)
  function blobD(cx, cy, rx, ry, r, k = 9, irr = .18) {
    const p = [];
    for (let i = 0; i < k; i++) { const a = i / k * TAU, f = 1 + (r() - .5) * 2 * irr; p.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]); }
    return curvaFechada(p);
  }
  // linha suave por pontos (curvas pelos meios)
  function linhaPor(pts) {
    const m = pts.length;
    let d = `M${n(pts[0][0])},${n(pts[0][1])}`;
    for (let i = 1; i < m - 1; i++) d += `Q${n(pts[i][0])},${n(pts[i][1])} ${n((pts[i][0] + pts[i + 1][0]) / 2)},${n((pts[i][1] + pts[i + 1][1]) / 2)}`;
    return d + `L${n(pts[m - 1][0])},${n(pts[m - 1][1])}`;
  }
  function catmull(pts, u) {
    const ns = pts.length - 1, s = Math.min(ns - 1e-6, Math.max(0, u) * ns), i = Math.floor(s), t = s - i;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(ns, i + 2)];
    const f = (a, b, c, d) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
    return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
  }
  // elipse como subcaminho (para juntar muitas num só path)
  const elip = (cx, cy, rx, ry) => `M${n(cx - rx)},${n(cy)}a${n(rx)},${n(ry)} 0 1,0 ${n(2 * rx)},0a${n(rx)},${n(ry)} 0 1,0 ${n(-2 * rx)},0Z`;
  // estrela de quatro pontas (brilho do sol na água)
  const ESTRELA = 'M0,-9 Q1,-1 9,0 Q1,1 0,9 Q-1,1 -9,0 Q-1,-1 0,-9 Z';

  /* ================= 2) Medidas da cascata e da poça ================= */
  const CXQ = 800, LABIO = 322, FUNDO = 612;          // centro da queda, beira de onde cai, onde bate na poça
  const meiaLargura = s => 86 + 28 * Math.pow(s, 1.3); // meia largura da queda ao longo da altura (0 = beira, 1 = poça)
  // contorno da superfície da poça (a parte da direita abre para o ribeiro)
  const POCA = [[402, 706], [448, 654], [536, 614], [656, 596], [800, 592], [944, 596], [1062, 610], [1150, 642], [1216, 686], [1254, 742],
    [1204, 778], [1080, 798], [900, 806], [720, 804], [560, 792], [450, 766]];
  const POCA_D = curvaFechada(POCA);
  // dentro da poça (elipse aproximada; f < 1 afasta das bordas)
  const naPoca = (x, y, f = 1) => Math.pow((x - 828) / (420 * f), 2) + Math.pow((y - 700) / (104 * f), 2) < 1;
  const MELRO_POS = [1042, 576];                       // pés do melro na pedra
  const RA_POS = [478, 728];                           // rã na pedra da frente
  const FETO_GOTA = { x: 586, y: 514 };                // base do feto que pinga
  const CARVALHO = { x: 140, y: 330 };                 // topo do tronco do carvalho (a folha cai daqui)

  /* ================= 3) Ícone do menu (sem gradientes com id) ================= */
  function iconeSVG() {
    const r = semente(7);
    let fios = '';
    for (let i = 0; i < 7; i++) { const f = i / 6; fios += `M${n(96 + f * 28)},64 L${n(92 + f * 36)},146 `; }
    let seixos = '';
    for (let i = 0; i < 16; i++) { const a = r() * TAU, d = Math.sqrt(r()); seixos += elip(110 + Math.cos(a) * 66 * d, 176 + Math.sin(a) * 16 * d, 3 + r() * 4, 2 + r() * 2); }
    return `<circle cx="110" cy="110" r="106" fill="#8ED0F4"/>
      <circle cx="54" cy="44" r="16" fill="#FFF6C8"/><circle cx="54" cy="44" r="24" fill="#FFF6C8" opacity=".35"/>
      <path d="M58,30 C66,22 80,22 86,30 C94,28 102,34 100,40 L52,40 C48,36 52,30 58,30 Z" fill="#FFFFFF" opacity=".9"/>
      <path d="M6.4,90 L34,64 L58,80 L88,52 L118,74 L146,50 L178,72 L213.6,90 A106,106 0 0 1 6.4,90 Z" fill="#9DB6CC"/>
      <path d="M86,54 L94,62 M146,52 L138,62" stroke="#E2EAF0" stroke-width="3" stroke-linecap="round"/>
      <path d="M5.2,100 C40,88 70,96 110,92 C150,88 180,94 214.8,100 A106,106 0 0 1 5.2,100 Z" fill="#5E9448"/>
      <g fill="#3E7034"><circle cx="30" cy="96" r="10"/><circle cx="46" cy="92" r="9"/><circle cx="176" cy="92" r="10"/><circle cx="192" cy="96" r="9"/></g>
      <path d="M40,160 C34,120 44,84 70,62 C82,54 92,56 96,64 L92,160 Z" fill="#B8B2A6" stroke="#5E5A52" stroke-width="2.4"/>
      <path d="M180,160 C186,120 176,86 150,64 C138,56 128,58 124,66 L128,160 Z" fill="#9E988C" stroke="#5E5A52" stroke-width="2.4"/>
      <path d="M52,92 C60,74 74,64 88,62 M168,96 C162,80 150,70 136,66" stroke="#E8E2D4" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M58,70 C66,60 80,56 92,60 C86,66 70,70 58,70 Z M132,62 C144,60 156,66 162,74 C150,72 140,70 132,62 Z" fill="#6E9A3A"/>
      <path d="M94,62 L126,62 L132,150 L88,150 Z" fill="#E8F6FC"/>
      <path d="${fios}" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="14 8"/>
      <path d="M100,62 L96,150 M120,62 L126,150" stroke="#9CCADC" stroke-width="2.4"/>
      <path d="M8.4,170 C40,150 80,150 110,152 C140,150 180,150 211.6,170 A106,106 0 0 1 8.4,170 Z" fill="#4AAAB8"/>
      <path d="${seixos}" fill="#3A8C98"/>
      <ellipse cx="110" cy="164" rx="54" ry="10" fill="none" stroke="#E8FAFC" stroke-width="2.6" opacity=".8"/>
      <ellipse cx="110" cy="172" rx="78" ry="15" fill="none" stroke="#E8FAFC" stroke-width="2" opacity=".55"/>
      <g fill="#FFFFFF"><circle cx="92" cy="152" r="9"/><circle cx="108" cy="148" r="11"/><circle cx="126" cy="152" r="9"/><circle cx="80" cy="156" r="6"/><circle cx="140" cy="156" r="6"/></g>
      <g fill="#FFFFFF"><circle cx="70" cy="136" r="3"/><circle cx="150" cy="132" r="3.4"/><circle cx="62" cy="146" r="2.2"/><circle cx="160" cy="144" r="2.4"/></g>
      <path d="M150,180 Q154,170 160,180 Q164,186 156,190 Q148,190 150,180 Z" fill="#FFFFFF" opacity=".9"/>
      <path d="M150,124 a12,12 0 0 1 22,6" stroke="#FF8A5A" stroke-width="2.4" fill="none" opacity=".7"/><path d="M152,128 a10,10 0 0 1 17,4" stroke="#FFE04A" stroke-width="2.4" fill="none" opacity=".7"/>
      <path d="M22,196 C28,176 34,166 48,158 M30,178 l-10,-4 M34,170 l-8,-6 M38,166 l2,-9 M44,162 l5,-7 M32,176 l7,2" stroke="#4E8A2E" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <circle cx="110" cy="110" r="106" fill="none" stroke="#5AA0C8" stroke-width="3"/>`;
  }

  /* ================= 4) Cenário ================= */
  function defs() {
    return `
    <linearGradient id="agua-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E92DC"/><stop offset=".45" stop-color="#76BAEA"/><stop offset=".8" stop-color="#B8E0F4"/><stop offset="1" stop-color="#DAF0F2"/></linearGradient>
    <radialGradient id="agua-solBrilho"><stop offset="0" stop-color="#FFFBE6" stop-opacity=".95"/><stop offset=".22" stop-color="#FFF4C8" stop-opacity=".45"/><stop offset=".6" stop-color="#FFF0B8" stop-opacity=".1"/><stop offset="1" stop-color="#FFF0B8" stop-opacity="0"/></radialGradient>
    <radialGradient id="agua-sol" cx=".42" cy=".4" r=".62"><stop offset="0" stop-color="#FFFFF4"/><stop offset=".7" stop-color="#FFF4C4"/><stop offset="1" stop-color="#FFE596"/></radialGradient>
    <linearGradient id="agua-raio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF8DC" stop-opacity=".5"/><stop offset=".6" stop-color="#FFF8DC" stop-opacity=".18"/><stop offset="1" stop-color="#FFF8DC" stop-opacity="0"/></linearGradient>
    <linearGradient id="agua-serraLonge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9EB8D0"/><stop offset="1" stop-color="#C6D8E4"/></linearGradient>
    <linearGradient id="agua-serraPerto" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7C9CB0"/><stop offset="1" stop-color="#9AB8B8"/></linearGradient>
    <linearGradient id="agua-encostaLonge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E9A6A"/><stop offset="1" stop-color="#557E52"/></linearGradient>
    <linearGradient id="agua-encosta" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E9446"/><stop offset="1" stop-color="#3E6E32"/></linearGradient>
    <radialGradient id="agua-granito" cx=".32" cy=".26" r=".9"><stop offset="0" stop-color="#ECE6D8"/><stop offset=".4" stop-color="#C4BDAE"/><stop offset=".75" stop-color="#928C80"/><stop offset="1" stop-color="#6A665E"/></radialGradient>
    <radialGradient id="agua-granitoM" cx=".32" cy=".24" r=".9"><stop offset="0" stop-color="#B8B4A8"/><stop offset=".45" stop-color="#848278"/><stop offset="1" stop-color="#4C4C46"/></radialGradient>
    <linearGradient id="agua-falesia" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3C4446"/><stop offset=".5" stop-color="#58646A"/><stop offset="1" stop-color="#363E40"/></linearGradient>
    <linearGradient id="agua-canal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E8EA8"/><stop offset=".6" stop-color="#8ED0E2"/><stop offset="1" stop-color="#E6F8FC"/></linearGradient>
    <linearGradient id="agua-veu" gradientUnits="userSpaceOnUse" x1="680" y1="0" x2="930" y2="0"><stop offset="0" stop-color="#F4FBFE" stop-opacity=".96"/><stop offset=".3" stop-color="#D6EEF6" stop-opacity=".9"/><stop offset=".72" stop-color="#AED6E6" stop-opacity=".86"/><stop offset="1" stop-color="#86B8CE" stop-opacity=".92"/></linearGradient>
    <linearGradient id="agua-veuSombra" gradientUnits="userSpaceOnUse" x1="0" y1="322" x2="0" y2="660"><stop offset="0" stop-color="#5E9CB4" stop-opacity=".45"/><stop offset=".25" stop-color="#5E9CB4" stop-opacity="0"/><stop offset=".8" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".7"/></linearGradient>
    <linearGradient id="agua-areia" gradientUnits="userSpaceOnUse" x1="0" y1="590" x2="0" y2="805"><stop offset="0" stop-color="#7E7656"/><stop offset=".45" stop-color="#B8A87C"/><stop offset="1" stop-color="#D8CAA0"/></linearGradient>
    <radialGradient id="agua-tinta" gradientUnits="userSpaceOnUse" cx="800" cy="606" r="480" gradientTransform="translate(800 606) scale(1 .42) translate(-800 -606)"><stop offset="0" stop-color="#10566A" stop-opacity=".92"/><stop offset=".3" stop-color="#1E7488" stop-opacity=".78"/><stop offset=".62" stop-color="#3C9CAA" stop-opacity=".5"/><stop offset="1" stop-color="#86D4D2" stop-opacity=".26"/></radialGradient>
    <radialGradient id="agua-solAgua" gradientUnits="userSpaceOnUse" cx="560" cy="720" r="260" gradientTransform="translate(560 720) scale(1 .35) translate(-560 -720)"><stop offset="0" stop-color="#FFF6C8" stop-opacity=".5"/><stop offset="1" stop-color="#FFF6C8" stop-opacity="0"/></radialGradient>
    <linearGradient id="agua-reflexoQ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".6"/><stop offset=".5" stop-color="#E8F6FA" stop-opacity=".25"/><stop offset="1" stop-color="#E8F6FA" stop-opacity="0"/></linearGradient>
    <linearGradient id="agua-ribeiro" gradientUnits="userSpaceOnUse" x1="1150" y1="0" x2="1600" y2="0"><stop offset="0" stop-color="#3E9AA8" stop-opacity="0"/><stop offset=".18" stop-color="#3E9AA8" stop-opacity=".75"/><stop offset="1" stop-color="#5AB0BA" stop-opacity=".8"/></linearGradient>
    <linearGradient id="agua-ribeiroFundo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8E8462"/><stop offset="1" stop-color="#C8B88A"/></linearGradient>
    <radialGradient id="agua-nevoa"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".75"/><stop offset=".5" stop-color="#F4FBFF" stop-opacity=".32"/><stop offset="1" stop-color="#F4FBFF" stop-opacity="0"/></radialGradient>
    <radialGradient id="agua-sombra"><stop offset="0" stop-color="#1E2A1A" stop-opacity=".4"/><stop offset=".7" stop-color="#1E2A1A" stop-opacity=".14"/><stop offset="1" stop-color="#1E2A1A" stop-opacity="0"/></radialGradient>
    <radialGradient id="agua-gota" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".45" stop-color="#D8F2F8"/><stop offset="1" stop-color="#6FB4C8"/></radialGradient>
    <linearGradient id="agua-melro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6A5244"/><stop offset=".6" stop-color="#3E2E26"/><stop offset="1" stop-color="#2A201A"/></linearGradient>
    <radialGradient id="agua-ra" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#A8D060"/><stop offset=".55" stop-color="#74A23C"/><stop offset="1" stop-color="#4A7428"/></radialGradient>
    <linearGradient id="agua-peixe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4E5630"/><stop offset=".4" stop-color="#8A864E"/><stop offset=".72" stop-color="#E0D2A0"/><stop offset="1" stop-color="#F4ECD2"/></linearGradient>
    <linearGradient id="agua-tronco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9A7A5A"/><stop offset=".45" stop-color="#6E5038"/><stop offset="1" stop-color="#3E2C1E"/></linearGradient>
    <linearGradient id="agua-pinho" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D8844A"/><stop offset=".45" stop-color="#A85A30"/><stop offset="1" stop-color="#5E3420"/></linearGradient>
    <radialGradient id="agua-copa" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#8CC456"/><stop offset=".55" stop-color="#5A9434"/><stop offset="1" stop-color="#3A6A22"/></radialGradient>
    <radialGradient id="agua-copaPinho" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#5E9A58"/><stop offset=".6" stop-color="#3A6E40"/><stop offset="1" stop-color="#244A2C"/></radialGradient>
    <radialGradient id="agua-luz" gradientUnits="userSpaceOnUse" cx="420" cy="100" r="1300"><stop offset="0" stop-color="#FFF4C8" stop-opacity=".22"/><stop offset=".5" stop-color="#FFF0C0" stop-opacity=".06"/><stop offset="1" stop-color="#FFF0C0" stop-opacity="0"/></radialGradient>
    <radialGradient id="agua-vinheta" cx=".5" cy=".46" r=".8"><stop offset=".62" stop-color="#12302A" stop-opacity="0"/><stop offset="1" stop-color="#12302A" stop-opacity=".26"/></radialGradient>
    <linearGradient id="agua-arcoFade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".3" stop-color="#FFF"/><stop offset=".7" stop-color="#FFF"/><stop offset="1" stop-color="#000"/></linearGradient>
    <mask id="agua-mArco"><rect x="700" y="470" width="360" height="220" fill="url(#agua-arcoFade)"/></mask>
    <linearGradient id="agua-chao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7AAE48"/><stop offset=".4" stop-color="#5E9238"/><stop offset="1" stop-color="#46752C"/></linearGradient>
    <clipPath id="agua-clipPoca"><path d="${POCA_D}"/></clipPath>`;
  }

  /* --- céu: sol, raios, nuvens --- */
  function nuvemSVG(i, k) {
    return `<g class="ag-nuvem${i}"><g transform="scale(${k})">
      <ellipse cx="0" cy="14" rx="100" ry="13" fill="#C2DCEE" opacity=".75"/>
      <ellipse cx="-50" cy="0" rx="38" ry="19" fill="#F2F8FC"/><ellipse cx="-8" cy="-12" rx="44" ry="26" fill="#FFFFFF"/><ellipse cx="38" cy="-2" rx="38" ry="19" fill="#F6FAFD"/><ellipse cx="78" cy="7" rx="24" ry="11" fill="#ECF4FA"/>
      <ellipse cx="0" cy="9" rx="96" ry="10" fill="#E6F0F8"/><ellipse cx="-26" cy="-24" rx="24" ry="7" fill="#FFFFFF"/></g></g>`;
  }
  function ceuSVG() {
    return `<rect width="1600" height="640" fill="url(#agua-ceu)"/>
      <circle cx="420" cy="100" r="420" fill="url(#agua-solBrilho)"/>
      <circle cx="420" cy="100" r="46" fill="url(#agua-sol)"/>
      <g class="ag-nuvens">${nuvemSVG(0, 1)}${nuvemSVG(1, .7)}${nuvemSVG(2, .85)}${nuvemSVG(3, .55)}</g>`;
  }

  /* --- serras de granito ao longe e encostas com carvalhos e pinheiros --- */
  function pinheiroD(x, base, h, r) {           // pinheiro em silhueta: tronco e copa em andares
    const lw = h * .03 + 1;
    let d = `M${n(x - lw)},${n(base)} L${n(x - lw * .4)},${n(base - h * .9)} L${n(x + lw * .4)},${n(base - h * .9)} L${n(x + lw)},${n(base)} Z`;
    for (let i = 0; i < 3; i++) {
      const y = base - h * (.42 + i * .2), w = h * (.26 - i * .06);
      d += `M${n(x - w)},${n(y + h * .1)} Q${n(x - w * .3)},${n(y - h * .06)} ${n(x)},${n(y - h * .16)} Q${n(x + w * .3)},${n(y - h * .06)} ${n(x + w)},${n(y + h * .1)} Q${n(x)},${n(y + h * .04 + r() * 3)} ${n(x - w)},${n(y + h * .1)} Z`;
    }
    return d;
  }
  function longeSVG() {
    const r = semente(5);
    // serra ao longe: cumes redondos de granito com manchas claras de rocha
    const serraL = 'M0,372 C60,340 110,300 170,296 C230,292 270,330 330,318 C400,304 430,256 500,250 C570,244 600,300 660,296 C720,292 760,250 830,246 C900,242 930,290 990,288 C1060,286 1100,240 1170,236 C1240,232 1280,286 1340,282 C1410,278 1450,246 1520,250 C1560,252 1590,268 1600,272 L1600,480 L0,480 Z';
    let rochas = '';
    for (const [px, py] of [[170, 296], [500, 250], [830, 246], [1170, 236], [1520, 250]]) for (let i = 0; i < 4; i++) {
      const x = px - 40 + r() * 70, y = py + 22 + r() * 40;
      rochas += `M${n(x)},${n(y)} q${n(6 + r() * 8)},${n(-2 - r() * 3)} ${n(14 + r() * 16)},${n(1 + r() * 3)}`;
    }
    const serraP = 'M0,420 C80,392 160,372 250,376 C340,380 380,350 470,344 C560,338 620,380 700,378 C780,376 830,350 910,350 C1000,350 1050,384 1130,380 C1220,376 1270,340 1360,338 C1450,336 1520,370 1600,366 L1600,520 L0,520 Z';
    let pinhal = '';
    for (let x = 10; x < 1600; x += 12 + r() * 22) {
      const y = 438 + 10 * Math.sin(x / 120) + r() * 8;
      pinhal += r() < .5 ? pinheiroD(x, y + 10, 18 + r() * 14, r) : blobD(x, y, 9 + r() * 6, 7 + r() * 4, r, 7, .2);
    }
    return `<path d="${serraL}" fill="url(#agua-serraLonge)"/>
      <path d="${rochas}" stroke="#AEC2D4" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="${elip(186, 322, 22, 6)}${elip(512, 280, 24, 6)}${elip(842, 276, 22, 6)}${elip(1180, 266, 24, 6)}${elip(1530, 280, 20, 5)}" fill="#B4C8D8" opacity=".7"/>
      <path d="${serraP}" fill="url(#agua-serraPerto)"/>
      <path d="M0,440 C200,424 400,436 600,430 C800,424 1000,438 1200,428 C1400,420 1500,432 1600,426 L1600,560 L0,560 Z" fill="url(#agua-encostaLonge)"/>
      <path d="${pinhal}" fill="#46704A"/>`;
  }
  function encostasSVG() {
    const r = semente(13);
    const encE = 'M0,452 C140,456 280,480 400,512 C490,536 560,570 640,616 L640,760 L0,760 Z';
    const encD = 'M1600,436 C1460,444 1320,470 1200,506 C1110,534 1040,572 970,616 L970,760 L1600,760 Z';
    const yE = x => 452 + (x / 640) * 164 * Math.pow(x / 640, .4), yD = x => 436 + ((1600 - x) / 630) * 180 * Math.pow((1600 - x) / 630, .4);
    let esc = '', med = '', luz = '', pinhos = '';
    const copa = (x, y, s) => {
      for (let k = 0; k < 4; k++) {
        const cx = x + (r() - .5) * 30 * s, cy = y - 16 * s - r() * 20 * s, rr = (14 + r() * 10) * s;
        esc += blobD(cx + 3, cy + 5, rr, rr * .8, r, 8, .2);
        med += blobD(cx, cy, rr * .92, rr * .74, r, 8, .2);
        luz += blobD(cx - rr * .3, cy - rr * .3, rr * .45, rr * .32, r, 7, .2);
      }
    };
    for (let x = -10; x < 660; x += 26 + r() * 22) { const y = yE(Math.max(0, x)) + 8 + r() * 30, s = .8 + (y - 450) / 260; if (r() < .3) pinhos += pinheiroD(x, y, 60 * s + r() * 30, r); else copa(x, y, s); }
    for (let x = 1610; x > 950; x -= 26 + r() * 22) { const y = yD(Math.min(1600, x)) + 8 + r() * 30, s = .8 + (y - 440) / 260; if (r() < .3) pinhos += pinheiroD(x, y, 60 * s + r() * 30, r); else copa(x, y, s); }
    return `<path d="${encE}" fill="url(#agua-encosta)"/><path d="${encD}" fill="url(#agua-encosta)"/>
      <path d="${pinhos}" fill="#2E5A34"/>
      <path d="${esc}" fill="#2E5A26"/><path d="${med}" fill="#4E8A38"/><path d="${luz}" fill="#86BC58" opacity=".8"/>`;
  }

  /* --- chão do vale: erva, terra à volta da poça, flores pequeninas --- */
  function chaoSVG() {
    const r = semente(17);
    // margem de terra à volta da poça: o contorno da poça alargado, com bordas irregulares
    const margem = (kx, ky, irr, sem) => {
      const rr = semente(sem), p = [];
      POCA.forEach(([x, y], i) => {
        p.push([828 + (x - 828) * kx + (rr() - .5) * irr, 700 + (y - 700) * ky + (rr() - .5) * irr]);
        const [x2, y2] = POCA[(i + 1) % POCA.length];
        p.push([828 + ((x + x2) / 2 - 828) * kx * (1 + (rr() - .3) * .03), 700 + ((y + y2) / 2 - 700) * ky * (1 + (rr() - .3) * .06)]);
      });
      return curvaFechada(p);
    };
    let seixosMargem = '';
    for (let i = 0; i < 46; i++) {
      const [x, y] = POCA[i % POCA.length], [x2, y2] = POCA[(i + 1) % POCA.length], u = r();
      const px = lerp(x, x2, u), py = lerp(y, y2, u), k = .6 + (py - 590) / 220 * .7;
      if (px > 1180 && py > 660) continue;
      seixosMargem += elip(828 + (px - 828) * 1.03, 700 + (py - 700) * (py > 700 ? 1.07 : 1.04), (4 + r() * 7) * k, (2.6 + r() * 3) * k);
    }
    let erva = '', flores = '', amarelas = '';
    for (let i = 0; i < 260; i++) {
      const x = r() * 1640 - 20, y = 610 + Math.pow(r(), .7) * 290, h = 6 + (y - 600) / 300 * 16 + r() * 6, inc = (r() - .5) * 8;
      if (naPoca(x, y, 1.12)) continue;
      erva += `M${n(x - 2)},${n(y)} Q${n(x + inc * .4)},${n(y - h * .6)} ${n(x + inc)},${n(y - h)} Q${n(x + inc * .4 + 1)},${n(y - h * .5)} ${n(x + 2)},${n(y)} Z`;
      if (r() < .1) { if (r() < .5) flores += elip(x + inc, y - h, 3, 3); else amarelas += elip(x + inc, y - h, 3, 3); }
    }
    return `<path d="M0,628 C300,612 560,630 800,620 C1040,610 1300,628 1600,616 L1600,900 L0,900 Z" fill="url(#agua-chao)"/>
      <path d="${margem(1.05, 1.13, 18, 3)}" fill="#7E7050"/>
      <path d="${margem(1.025, 1.06, 10, 5)}" fill="#A8946A"/>
      <path d="${seixosMargem}" fill="#B4AEA0" stroke="#6E6A60" stroke-width="1.2"/>
      <path d="${erva}" fill="#4E8430"/><path d="${flores}" fill="#FFFFFF"/><path d="${amarelas}" fill="#FFD23A"/>`;
  }

  /* --- rochas de granito: base com gradiente; fendas, líquenes e musgo juntos num path por estilo (por grupo) --- */
  function rochas(lista, sem) {
    const r = semente(sem);
    let base = '', fendas = '', liq1 = '', liq2 = '', musgo = '', musgoLuz = '', musgoEsc = '', brilho = '';
    for (const o of lista) {
      const p = o.pts, xs = p.map(q => q[0]), ys = p.map(q => q[1]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), w = x1 - x0, h = y1 - y0;
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      base += `<path d="${curvaFechada(p)}" fill="url(#agua-${o.molhada ? 'granitoM' : 'granito'})" stroke="#4E4A44" stroke-width="2.4" stroke-linejoin="round"/>`;
      // brilho do lado do sol (cima, à esquerda)
      brilho += `M${n(x0 + w * .26)},${n(y0 + h * .38)} Q${n(x0 + w * .3)},${n(y0 + h * .18)} ${n(x0 + w * .5)},${n(y0 + h * .12)}`;
      for (let k = 0; k < (o.fendas || 2); k++) {
        let x = cx + (r() - .5) * w * .5, y = cy + (r() - .5) * h * .4;
        fendas += `M${n(x)},${n(y)}`;
        for (let j = 0; j < 3; j++) { x += (r() - .5) * w * .12; y += h * (.06 + r() * .08); fendas += `L${n(x)},${n(y)}`; }
      }
      for (let k = 0; k < (o.liq || 6); k++) {
        const x = cx + (r() - .5) * w * .6, y = cy + (r() - .5) * h * .5, rr = 2 + r() * 5;
        if (r() < .5) liq1 += elip(x, y, rr, rr * .7); else liq2 += elip(x, y, rr * .8, rr * .6);
      }
      if (o.musgo) {
        const [mx, my, mw, mh] = o.musgo;
        musgoEsc += blobD(mx + 2, my + mh * .45, mw * 1.02, mh * .7, r, 11, .25);
        musgo += blobD(mx, my, mw, mh, r, 11, .25);
        for (let k = 0; k < 6; k++) musgoLuz += elip(mx - mw * .5 + r() * mw * .8, my - mh * .4 + r() * mh * .4, 3 + r() * 5, 2 + r() * 2);
      }
    }
    return `${base}
      <path d="${brilho}" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round" opacity=".45"/>
      <path d="${fendas}" stroke="#4A4640" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
      <path d="${liq1}" fill="#E8E2B8" opacity=".75"/><path d="${liq2}" fill="#B4BC86" opacity=".7"/>
      <path d="${musgoEsc}" fill="#3E6A24"/><path d="${musgo}" fill="#6E9E36"/><path d="${musgoLuz}" fill="#A8D058" opacity=".85"/>`;
  }
  const PENEDOS = [
    { pts: [[470, 662], [462, 600], [480, 500], [520, 420], [580, 360], [650, 326], [714, 320], [724, 344], [710, 420], [702, 520], [690, 620], [676, 662]], musgo: [560, 392, 70, 18], fendas: 4, liq: 12 },
    { pts: [[888, 322], [960, 314], [1040, 330], [1100, 380], [1136, 450], [1150, 540], [1140, 620], [1120, 662], [920, 662], [910, 600], [900, 500], [890, 420]], musgo: [1010, 344, 66, 16], fendas: 4, liq: 12 },
    { pts: [[602, 334], [612, 298], [652, 274], [700, 266], [740, 274], [758, 298], [748, 320], [700, 330], [640, 336]], musgo: [690, 278, 44, 12], liq: 6 },
    { pts: [[846, 300], [862, 276], [904, 264], [950, 268], [990, 288], [1000, 318], [960, 328], [900, 326], [856, 318]], musgo: [926, 274, 46, 12], liq: 6 }
  ];
  function falesiaSVG() {                         // a parede molhada atrás da queda, e o canal de onde a água vem
    const r = semente(29);
    let musgo = '';
    for (let i = 0; i < 9; i++) { const x = 690 + r() * 220, y = 360 + r() * 230; musgo += `M${n(x)},${n(y)} q${n((r() - .5) * 6)},${n(16 + r() * 20)} ${n((r() - .5) * 4)},${n(34 + r() * 30)}`; }
    return `<path d="M700,316 L902,316 L922,662 L680,662 Z" fill="url(#agua-falesia)"/>
      <path d="${musgo}" stroke="#4E7A34" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="M722,270 C760,262 840,262 880,270 L870,310 L730,310 Z" fill="#4E5A58"/>
      <path d="M730,276 C770,268 830,268 870,276" stroke="#6E9A3A" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  }
  function canalSVG() {                           // a água lisa que chega à beira e se dobra para cair
    return `<path d="M744,294 C780,288 822,288 858,294 L890,324 L710,324 Z" fill="url(#agua-canal)"/>
      <path class="ag-canalF0" d="M770,294 C766,304 758,314 748,322" stroke="#FFFFFF" stroke-width="2.4" fill="none" stroke-dasharray="10 14" opacity=".8"/>
      <path class="ag-canalF1" d="M802,292 C802,304 801,314 800,322" stroke="#FFFFFF" stroke-width="2.4" fill="none" stroke-dasharray="8 16" opacity=".8"/>
      <path class="ag-canalF2" d="M832,294 C838,304 846,314 854,322" stroke="#FFFFFF" stroke-width="2.4" fill="none" stroke-dasharray="12 12" opacity=".8"/>`;
  }

  /* --- fetos: cada folha (fronde) é um eixo curvo com folíolos dos dois lados; uma touça num path por cor --- */
  function frondeD(x0, y0, ang, len, curv, folha) {
    let x = x0, y = y0, eixo = `M${n(x0)},${n(y0)}`, f = '';
    const N = 16;
    for (let i = 1; i <= N; i++) {
      const u = i / N, a = (ang + curv * u) * RAD, passo = len / N;
      x += Math.cos(a) * passo; y += Math.sin(a) * passo;
      eixo += `L${n(x)},${n(y)}`;
      if (i < N) {
        const L = len * .2 * Math.pow(1 - u, .8) * Math.min(1, u * 5 + .25) * folha;
        for (const lado of [-1, 1]) {
          const b = a + lado * 62 * RAD, tx = x + Math.cos(b) * L, ty = y + Math.sin(b) * L;
          const mx = (x + tx) / 2, my = (y + ty) / 2, px = -Math.sin(b) * L * .2, py = Math.cos(b) * L * .2;
          f += `M${n(x)},${n(y)}Q${n(mx + px)},${n(my + py)} ${n(tx)},${n(ty)}Q${n(mx - px)},${n(my - py)} ${n(x)},${n(y)}Z`;
        }
      }
    }
    return { eixo, f };
  }
  function tocaSVG(cls, x, y, k, angs, sem) {     // touça de fetos com base em (x, y)
    const r = semente(sem);
    let claro = '', escuro = '', eixos = '';
    angs.forEach((a, i) => {
      const curv = (a + 90) * .7 + (r() - .5) * 10, len = (120 + r() * 60) * k;
      const fr = frondeD(x + (r() - .5) * 16 * k, y, a, len, curv, 1);
      if (i % 2) claro += fr.f; else escuro += fr.f;
      eixos += fr.eixo;
    });
    return `<g class="${cls}"><path d="${escuro}" fill="#3E7A2A"/><path d="${claro}" fill="#6AA63A"/><path d="${eixos}" stroke="#3A5E1E" stroke-width="${n(2 * k)}" fill="none" stroke-linecap="round"/></g>`;
  }

  /* --- árvores grandes da frente: carvalho à esquerda, pinheiro-silvestre à direita --- */
  function carvalhoSVG() {
    const r = semente(41);
    let copa = '', luz = '', esc = '';
    const nucleos = [[130, 120, 150, 110], [10, 160, 90, 70], [250, 170, 90, 66], [60, 40, 100, 70], [210, 50, 100, 70], [140, 230, 110, 60]];
    for (const [x, y, rx, ry] of nucleos) for (let k = 0; k < 7; k++) {
      const a = r() * TAU, d = r() * .65, cx = x + Math.cos(a) * rx * d, cy = y + Math.sin(a) * ry * d, rr = (.32 + r() * .22) * rx;
      copa += blobD(cx, cy, rr, rr * .7, r, 9, .22);
      if (Math.cos(a) < .3 && Math.sin(a) < .3) luz += blobD(cx - rr * .25, cy - rr * .25, rr * .5, rr * .28, r, 7, .2);
      else esc += blobD(cx + rr * .1, cy + rr * .3, rr * .6, rr * .26, r, 7, .2);
    }
    let casca = '';
    for (let i = 0; i < 14; i++) { const x = 92 + r() * 70, y = 330 + r() * 540; casca += `M${n(x)},${n(y)} c${n(-3 + r() * 6)},${n(16 + r() * 18)} ${n(-3 + r() * 6)},${n(30 + r() * 26)} ${n(-2 + r() * 4)},${n(46 + r() * 30)}`; }
    return `<ellipse cx="130" cy="904" rx="170" ry="20" fill="url(#agua-sombra)"/>
      <path d="M58,910 C72,760 90,560 112,330 L170,330 C172,560 186,760 210,910 Z" fill="url(#agua-tronco)" stroke="#2E2018" stroke-width="2.4"/>
      <path d="${casca}" stroke="#3A2A1C" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".55"/>
      <path d="M100,860 C104,700 114,520 126,340" stroke="#C8A27A" stroke-width="4" fill="none" opacity=".45" stroke-linecap="round"/>
      <path d="M150,380 C190,340 230,280 262,206 M120,400 C80,350 50,280 30,210" stroke="#4E3826" stroke-width="12" fill="none" stroke-linecap="round"/>
      <g class="ag-carvalho"><path d="${copa}" fill="#2E5A1A" transform="translate(0,8)"/><path d="${copa}" fill="url(#agua-copa)"/>
        <path d="${esc}" fill="#3A6A22" opacity=".55"/><path d="${luz}" fill="#A8D872" opacity=".6"/></g>`;
  }
  function pinheiroSVG() {
    const r = semente(43);
    let copa = '', luz = '';
    const tufos = [[1500, 40, 110, 46], [1420, 120, 90, 36], [1580, 140, 100, 40], [1440, 220, 80, 30], [1590, 250, 70, 30], [1500, 160, 70, 30]];
    for (const [x, y, rx, ry] of tufos) for (let k = 0; k < 4; k++) {
      const cx = x + (r() - .5) * rx * .8, cy = y + (r() - .5) * ry * .6, rr = rx * (.4 + r() * .25);
      copa += blobD(cx, cy, rr, rr * .42, r, 11, .28);
      luz += blobD(cx - rr * .2, cy - rr * .18, rr * .55, rr * .16, r, 9, .25);
    }
    return `<ellipse cx="1520" cy="904" rx="150" ry="18" fill="url(#agua-sombra)"/>
      <path d="M1462,910 C1474,600 1488,360 1500,40 L1522,40 C1528,360 1544,600 1566,910 Z" fill="url(#agua-pinho)" stroke="#3A2214" stroke-width="2.4"/>
      <path d="M1470,880 C1478,700 1484,500 1494,300 M1500,860 C1506,640 1510,420 1512,200 M1530,860 C1530,640 1526,420 1518,160" stroke="#5E2E16" stroke-width="2.4" fill="none" opacity=".5"/>
      <path d="M1478,820 C1484,640 1490,460 1500,240" stroke="#F0A870" stroke-width="3.5" fill="none" opacity=".45" stroke-linecap="round"/>
      <path d="M1506,250 C1470,236 1440,226 1420,214 M1516,190 C1550,170 1580,156 1600,150" stroke="#6E3A20" stroke-width="8" fill="none" stroke-linecap="round"/>
      <g class="ag-pinheiro"><path d="${copa}" fill="#1E3E22" transform="translate(0,6)"/><path d="${copa}" fill="url(#agua-copaPinho)"/><path d="${luz}" fill="#7AB070" opacity=".55"/></g>`;
  }

  /* --- fundo da poça: areia, seixos e a luz que dança no fundo (cáusticas) --- */
  function fundoSVG() {
    const r = semente(53), cores = ['', '', '', ''];
    let luzes = '';
    for (let i = 0; i < 190; i++) {
      const x = 400 + r() * 860, y = 588 + Math.pow(r(), .85) * 216;
      if (!naPoca(x, y, 1.08)) continue;
      const k = .45 + (y - 590) / 210 * .75, rx = (6 + r() * 13) * k, ry = rx * (.5 + r() * .15);
      const c = r() < .35 ? 0 : r() < .5 ? 1 : r() < .6 ? 2 : 3;
      cores[c] += elip(x, y, rx, ry);
      luzes += `M${n(x - rx * .6)},${n(y - ry * .2)}q${n(rx * .3)},${n(-ry * .6)} ${n(rx * .8)},${n(-ry * .5)}`;
    }
    const caust = sem => {
      const rr = semente(sem);
      let d = '';
      for (let y = 600; y < 810; y += 16 + (y - 600) * .05) for (let x = 400; x < 1260; x += 40 + (y - 600) * .12) {
        const k = .55 + (y - 590) / 210 * .6;
        d += blobD(x + (rr() - .5) * 24, y + (rr() - .5) * 8, (14 + rr() * 8) * k, (5 + rr() * 3) * k, rr, 6, .35);
      }
      return d;
    };
    return `<path d="${POCA_D}" fill="url(#agua-areia)"/>
      <path d="${cores[0]}" fill="#9C988E"/><path d="${cores[1]}" fill="#C8BEA8"/><path d="${cores[2]}" fill="#8A7052"/><path d="${cores[3]}" fill="#E4DED0"/>
      <path d="${luzes}" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round" opacity=".45"/>
      <ellipse cx="560" cy="720" rx="260" ry="90" fill="url(#agua-solAgua)"/>
      <g class="ag-caust0"><path d="${caust(61)}" stroke="#FFF8CC" stroke-width="2.6" fill="none" opacity=".55"/></g>
      <g class="ag-caust1"><path d="${caust(67)}" stroke="#FFFFFF" stroke-width="1.8" fill="none" opacity=".4"/></g>
      <ellipse class="ag-peixeSombra" rx="34" ry="7" fill="#1E3A32" opacity="0"/>`;
  }

  /* --- bichos: melro-d'água, rã, truta, libelinha-azul, folha de carvalho --- */
  function melroSVG() {
    return `<g class="ag-melro" transform="translate(${MELRO_POS[0]},${MELRO_POS[1]})"><g class="ag-melroIn">
      <path class="ag-melroPernas" d="" stroke="#D6C0B2" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g class="ag-melroCorpo">
        <path d="M9,-17 L27,-31 Q32,-29 30,-24 L14,-11 Z" fill="#33261F" stroke="#1E1612" stroke-width="1.2" stroke-linejoin="round"/>
        <ellipse cx="0" cy="-17" rx="17" ry="12.5" transform="rotate(-12 0 -17)" fill="url(#agua-melro)" stroke="#1E1612" stroke-width="1.4"/>
        <path d="M-11,-10 C-4,-4 6,-5 13,-10 C8,-15 -4,-15 -11,-10 Z" fill="#7A3E24"/>
        <g class="ag-melroAsa"><path d="M-4,-25 C6,-28 18,-24 22,-14 C14,-11 4,-13 -4,-19 Z" fill="#3A2C24" stroke="#1E1612" stroke-width="1"/><path d="M4,-22 L16,-16 M2,-19 L12,-15" stroke="#6A5446" stroke-width="1.1"/></g>
        <g class="ag-melroVoo" display="none"><path d="M-2,-24 C-8,-42 4,-56 22,-54 C16,-46 20,-38 12,-32 C16,-30 14,-26 8,-22 Z" fill="#3A2C24" stroke="#1E1612" stroke-width="1.2" stroke-linejoin="round"/>
          <path d="M2,-28 L14,-48 M5,-26 L18,-40" stroke="#6A5446" stroke-width="1.1"/></g>
        <path d="M-15,-28 C-22,-20 -19,-10 -9,-8 C-6,-14 -7,-22 -11,-30 Z" fill="#FFFFFF" stroke="#C9C6BC" stroke-width="1"/>
        <g class="ag-melroCab">
          <circle cx="-13" cy="-31" r="9.5" fill="#4E3C32" stroke="#1E1612" stroke-width="1.3"/>
          <path d="M-18,-38 Q-12,-41 -7,-38" stroke="#7E6A5A" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <path d="M-21,-33.5 L-29.5,-31.5 L-21,-28.5 Z" fill="#2A221E"/>
          <circle cx="-16.5" cy="-33" r="2.5" fill="#120C0A"/><circle cx="-17.3" cy="-33.8" r=".9" fill="#FFFFFF"/>
          <ellipse class="ag-melroPalp" cx="-16.5" cy="-33" rx="2.9" ry="2.9" fill="#F4F2EC" transform="translate(0,-35.9) scale(1,.001) translate(0,35.9)"/>
        </g>
      </g></g></g>`;
  }
  function raSVG() {
    return `<g class="ag-ra" display="none"><g class="ag-raIn">
      <g class="ag-raSent"><path d="M-20,-6 C-28,-18 -8,-26 2,-13 C4,-6 -6,0 -20,-6 Z" fill="#5E8A30" stroke="#2E4A18" stroke-width="1.5"/>
        <path d="M-18,-1 L4,-1 L9,1 L-18,1.5 Z M4,-1 l5,-2 M4,1 l6,1" fill="#5E8A30" stroke="#2E4A18" stroke-width="1.4" stroke-linejoin="round"/></g>
      <g class="ag-raSalto" display="none"><path d="M-12,-15 L-34,-10 L-52,-5 L-50,-1 L-32,-4 L-10,-8 Z" fill="#5E8A30" stroke="#2E4A18" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M-52,-5 l-8,-5 M-52,-4 l-9,0 M-51,-2 l-8,4" stroke="#2E4A18" stroke-width="1.8" stroke-linecap="round"/></g>
      <ellipse cx="-2" cy="-14" rx="19" ry="12" fill="url(#agua-ra)" stroke="#2E4A18" stroke-width="1.6"/>
      <path d="${elip(-10, -18, 3.4, 2.4)}${elip(-2, -21, 3, 2)}${elip(-14, -12, 2.6, 2)}${elip(4, -16, 2.4, 1.8)}" fill="#3E5E1E" opacity=".8"/>
      <ellipse cx="3" cy="-6.5" rx="12" ry="4.6" fill="#E6E0A6"/>
      <path d="M8,-22 C16,-28 26,-23 29,-15 C29,-10 21,-7 10,-8 Z" fill="url(#agua-ra)" stroke="#2E4A18" stroke-width="1.6"/>
      <ellipse class="ag-raPapo" cx="18" cy="-8.4" rx="7" ry="3.4" fill="#F2EEC4"/>
      <path d="M28,-14 Q20,-11 12,-12" stroke="#2E4A18" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <path d="M10,-22 L22,-18" stroke="#3E5A1E" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      <circle cx="17" cy="-25" r="5.6" fill="#74A23C" stroke="#2E4A18" stroke-width="1.4"/><circle cx="17.6" cy="-25.4" r="3.8" fill="#E8B830"/>
      <ellipse cx="17.8" cy="-25.4" rx="2.5" ry="1.2" fill="#120C08"/><circle cx="16.4" cy="-26.6" r="1" fill="#FFFFFF"/>
      <path d="M10,-8 L12,0 L17,0" stroke="#4E7A28" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g></g>`;
  }
  function peixeSVG() {
    let manchas = '', pretas = '';
    [[4, -5], [12, -7], [-4, -2], [18, -4], [8, 2]].forEach(([x, y]) => { manchas += elip(x, y, 1.8, 1.6); });
    [[0, -7], [14, -1], [-8, -4], [22, -8], [6, -9], [-2, 1]].forEach(([x, y]) => { pretas += elip(x, y, 1.4, 1.2); });
    return `<g class="ag-peixe" display="none"><g class="ag-peixeIn">
      <g class="ag-peixeCauda"><path d="M-14,0 C-20,-3 -28,-10 -35,-12 C-31,-4 -31,4 -35,12 C-28,10 -20,3 -14,0 Z" fill="#6E6A40" stroke="#3A3A22" stroke-width="1.2" stroke-linejoin="round"/></g>
      <path d="M0,-10 C4,-18 12,-18 15,-9 Z M-10,-6 C-12,-10 -16,-10 -17,-6 Z" fill="#6E6A40" stroke="#3A3A22" stroke-width="1"/>
      <path d="M36,0 C30,-12 8,-14 -10,-8 C-18,-5 -19,5 -10,8 C8,14 30,12 36,0 Z" fill="url(#agua-peixe)" stroke="#3A3A22" stroke-width="1.4"/>
      <path d="M-6,2 C6,5 22,4 32,1" stroke="#E8B4A0" stroke-width="2.2" fill="none" opacity=".7"/>
      <path d="${pretas}" fill="#2E2A1A"/><path d="${manchas}" fill="#D8442E"/>
      <path d="M6,8 L0,15 L12,9 Z" fill="#C8A060" stroke="#3A3A22" stroke-width=".9"/>
      <path d="M20,-6 Q17,0 20,6" stroke="#3A3A22" fill="none" stroke-width="1.1"/>
      <circle cx="27" cy="-3" r="2.9" fill="#F2E6C0"/><circle cx="27.6" cy="-3" r="1.7" fill="#120C08"/>
    </g></g>`;
  }
  function libelinhaSVG() {
    const asas = (a1, a2, a3, a4) => `<ellipse cx="0" cy="-15" rx="5" ry="17" transform="rotate(${a1} -6 0)" /><ellipse cx="0" cy="-15" rx="4.4" ry="15" transform="rotate(${a2} -4 0)"/>
      <ellipse cx="0" cy="-15" rx="5" ry="17" transform="rotate(${a3} -6 0)" opacity=".7"/><ellipse cx="0" cy="-15" rx="4.4" ry="15" transform="rotate(${a4} -4 0)" opacity=".7"/>`;
    return `<g class="ag-lib" display="none"><g class="ag-libIn">
      <g class="ag-libAsas0" fill="#24306A" fill-opacity=".55" stroke="#141C44" stroke-width="1" opacity=".5">${asas(-12, 18, -30, 34)}</g>
      <g class="ag-libAsas1" fill="#24306A" fill-opacity=".55" stroke="#141C44" stroke-width="1" opacity=".5">${asas(-62, 70, -76, 84)}</g>
      <path d="M-4,-1.6 L40,-1.4 L45,0 L40,1.4 L-4,1.6 Z" fill="#2A66E8" stroke="#183A90" stroke-width="1"/>
      <path d="M4,-1.6 v3.2 M11,-1.6 v3.2 M18,-1.5 v3 M25,-1.5 v3 M32,-1.4 v2.8" stroke="#183A90" stroke-width=".9"/>
      <path d="M0,-1 L38,-1" stroke="#9CC4FF" stroke-width="1" opacity=".8"/>
      <ellipse cx="-9" cy="0" rx="7" ry="4.2" fill="#1E5AC8" stroke="#183A90" stroke-width="1"/>
      <circle cx="-18" cy="0" r="4.4" fill="#1A3E9A" stroke="#10245A" stroke-width="1"/><circle cx="-19.4" cy="-1.6" r="2.2" fill="#0E1A40"/><circle cx="-20" cy="-2.2" r=".8" fill="#FFFFFF"/>
      <path d="M-12,3 l-3,6 M-8,3 l-1,6 M-5,3 l2,6" stroke="#10245A" stroke-width="1" stroke-linecap="round"/>
    </g></g>`;
  }
  const FOLHA = `<path d="M-15,0 C-13,-4 -10,-7 -7,-5 C-6,-9 -2,-10 -1,-7 C1,-10 5,-9 5,-5 C8,-7 12,-4 14,0 C12,4 8,7 5,5 C5,9 1,10 -1,7 C-2,10 -6,9 -7,5 C-10,7 -13,4 -15,0 Z" fill="#D89A2E" stroke="#8A5A1A" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M-18,0 L13,0 M-6,0 l-3,-4 M-6,0 l-3,4 M2,0 l-2,-5 M2,0 l-2,5" stroke="#8A5A1A" stroke-width="1" fill="none"/>`;

  /* ================= 5) montar() ================= */
  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .5 : 1;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    // fios da cascata: três camadas (sombra azulada, fios brancos largos, fios finos brilhantes)
    const rf = semente(71);
    const CAM_FIOS = [
      { k: 9, cor: '#7EB2C8', w: 8, op: .5, vel: 420, dash: () => `${n(80 + rf() * 80)} ${n(30 + rf() * 30)} ${n(50 + rf() * 50)} ${n(20 + rf() * 30)}` },
      { k: 13, cor: '#FFFFFF', w: 7, op: .9, vel: 560, dash: () => `${n(90 + rf() * 110)} ${n(10 + rf() * 16)} ${n(40 + rf() * 60)} ${n(8 + rf() * 14)}` },
      { k: 10, cor: '#FFFFFF', w: 2.6, op: 1, vel: 720, dash: () => `${n(30 + rf() * 40)} ${n(16 + rf() * 24)} ${n(14 + rf() * 20)} ${n(20 + rf() * 20)}` }
    ];
    const fiosDef = [];
    CAM_FIOS.forEach((c, ci) => { for (let i = 0; i < c.k; i++) fiosDef.push({ ci, f: (i + .5 + (rf() - .5) * .5) / c.k, dash: c.dash(), of: rf() * 200, fase: rf() * TAU }); });
    const fiosSVG = fiosDef.map(o => { const c = CAM_FIOS[o.ci]; return `<path class="ag-fio" stroke="${c.cor}" stroke-width="${c.w}" opacity="${c.op}" fill="none" stroke-linecap="round" stroke-dasharray="${o.dash}"/>`; }).join('');

    const N_ANEIS = 16, N_NEVOA = 12, N_BRILHOS = 12;
    svg.innerHTML = `<defs>${defs()}</defs>
      ${ceuSVG()}
      <g class="ag-raios" opacity=".7"><polygon points="400,90 446,96 1010,900 820,900" fill="url(#agua-raio)"/><polygon points="392,110 420,120 640,900 520,900" fill="url(#agua-raio)"/><polygon points="430,96 470,92 1360,900 1190,900" fill="url(#agua-raio)"/></g>
      ${longeSVG()}
      ${encostasSVG()}
      ${chaoSVG()}
      ${falesiaSVG()}
      ${rochas(PENEDOS, 31)}
      ${tocaSVG('ag-fetoD', 1124, 468, .7, [-160, -130, -110, -150], 3)}
      ${tocaSVG('ag-fetoE', 524, 420, .55, [-40, -70, -20, -55], 4)}
      <g class="ag-fetoGota">${(() => { const fr = frondeD(FETO_GOTA.x, FETO_GOTA.y, -40, 120, 95, 1); const fr2 = frondeD(FETO_GOTA.x, FETO_GOTA.y + 4, -10, 90, 70, .9); return `<path d="${fr2.f}" fill="#3E7A2A"/><path d="${fr.f}" fill="#6AA63A"/><path d="${fr.eixo}${fr2.eixo}" stroke="#3A5E1E" stroke-width="2" fill="none" stroke-linecap="round"/>`; })()}</g>
      ${canalSVG()}
      <g class="ag-agua">
        <rect x="430" y="290" width="760" height="550" fill="#FFFFFF" opacity="0"/>
        <path class="ag-veuFora" fill="#E4F4FA" opacity=".35"/>
        <path class="ag-veu" fill="url(#agua-veu)"/>
        <g class="ag-fios">${fiosSVG}</g>
        <path class="ag-veuS" fill="url(#agua-veuSombra)"/>
        <path class="ag-bordaE" stroke="#FFFFFF" stroke-width="3.2" fill="none" stroke-linecap="round"/>
        <path class="ag-bordaD" stroke="#78A8BE" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>
        <path class="ag-labio" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round" opacity=".95"/>
        <g clip-path="url(#agua-clipPoca)">
          ${fundoSVG()}
          <g class="ag-debaixo"><path class="ag-bolhas" fill="none" stroke="#E8F8FC" stroke-width="1.6" opacity=".8"/></g>
          <path d="${POCA_D}" fill="url(#agua-tinta)"/>
          <g class="ag-reflexos" opacity=".32"><ellipse cx="590" cy="628" rx="120" ry="24" fill="#3A4A4C"/><ellipse cx="1020" cy="636" rx="120" ry="26" fill="#3A4A4C"/><ellipse cx="1048" cy="652" rx="60" ry="12" fill="#2E3A3C"/><ellipse cx="530" cy="738" rx="40" ry="8" fill="#2E3A3C"/></g>
          <path class="ag-reflexoQ" fill="url(#agua-reflexoQ)" opacity=".75"/>
          <path class="ag-supEsc" stroke="#16525E" stroke-width="2" fill="none" stroke-linecap="round" opacity=".16" stroke-dasharray="18 70 30 54"/>
          <path class="ag-supLuz" stroke="#FFFFFF" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".4" stroke-dasharray="16 62 28 44"/>
          <g class="ag-aneis">${Array.from({ length: N_ANEIS }, () => '<ellipse rx="1" ry="1" fill="none" stroke="#F2FFFF" stroke-width="3" opacity="0"/>').join('')}</g>
          <path class="ag-aneisPeq0" fill="none" stroke="#F2FFFF" stroke-width="1.6" opacity=".8"/>
          <path class="ag-aneisPeq1" fill="none" stroke="#F2FFFF" stroke-width="1.2" opacity=".4"/>
          <path class="ag-flocos" fill="#FFFFFF" opacity=".75"/>
          <g class="ag-brilhos">${Array.from({ length: N_BRILHOS }, () => `<path d="${ESTRELA}" fill="#FFFFFF" opacity="0"/>`).join('')}</g>
        </g>
        <path d="${POCA_D}" fill="none" stroke="#3E5A50" stroke-width="5" opacity=".35"/>
        <g class="ag-ribeiro">
          <path d="M1170,672 C1300,684 1420,712 1610,726 L1610,900 L1240,900 C1240,830 1220,790 1180,764 Z" fill="url(#agua-ribeiroFundo)"/>
          <path d="${(() => { const r = semente(83); let d = ''; for (let i = 0; i < 40; i++) { const x = 1200 + r() * 410, y = 700 + (x - 1200) * .07 + r() * 120; d += elip(x, y, 5 + r() * 9, 3 + r() * 4); } return d; })()}" fill="#9A9488"/>
          <path d="M1170,672 C1300,684 1420,712 1610,726 L1610,900 L1240,900 C1240,830 1220,790 1180,764 Z" fill="url(#agua-ribeiro)"/>
          ${[[-34, '#FFFFFF', 2.4, .55], [-12, '#DFF6FA', 2, .6], [10, '#FFFFFF', 2.6, .5], [32, '#DFF6FA', 2, .55], [54, '#FFFFFF', 2.2, .45]].map(([o, c, w, op], i) =>
            `<path class="ag-corrente" d="M${1190},${718 + o} C${1300},${732 + o * 1.1} ${1420},${760 + o * 1.3} ${1610},${782 + o * 1.4}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" opacity="${op}" stroke-dasharray="${18 + i * 6} ${36 + i * 8}"/>`).join('')}
          <path class="ag-riffle0" d="M1290,746 q10,-6 20,0 M1360,774 q12,-6 24,0 M1440,760 q10,-5 20,0 M1520,806 q12,-6 24,0 M1330,810 q10,-5 20,0" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path class="ag-riffle1" d="M1310,760 q10,-6 20,0 M1400,790 q12,-6 24,0 M1480,780 q10,-5 20,0 M1560,820 q12,-6 24,0 M1260,782 q10,-5 20,0" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>
        </g>
        <ellipse class="ag-leito" cx="${CXQ}" cy="${FUNDO + 8}" rx="190" ry="40" fill="url(#agua-nevoa)"/>
        <ellipse class="ag-leito2" cx="${CXQ}" cy="${FUNDO + 6}" rx="118" ry="14" fill="#EEF8FC" opacity=".6"/>
        <path class="ag-espuma0" fill="#9EC6D6"/><path class="ag-espuma1" fill="#F2FAFD"/><path class="ag-espuma2" fill="#FFFFFF"/>
        <path class="ag-coroasAnel" fill="#F6FCFE" fill-rule="evenodd" stroke="#6AAEC8" stroke-width="2.2"/>
        <path class="ag-coroas" fill="#F6FCFE" stroke="#6AAEC8" stroke-width="2.2" stroke-linejoin="round"/>
        <g class="ag-nevoas">${Array.from({ length: N_NEVOA }, () => '<circle r="1" fill="url(#agua-nevoa)" opacity="0"/>').join('')}</g>
        <g class="ag-arco" mask="url(#agua-mArco)" opacity=".3">${['#FF4A3A', '#FF9A2A', '#FFE23A', '#5ED46A', '#3AA8F0', '#5A6AE0', '#9A5AD8'].map((c, i) => {
            const rr = 150 - i * 3.6, cx = 872, cy = 700, a0 = 22 * RAD, a1 = 150 * RAD;
            return `<path d="M${n(cx + rr * Math.cos(a0))},${n(cy - rr * Math.sin(a0))} A${n(rr)},${n(rr)} 0 0 0 ${n(cx + rr * Math.cos(a1))},${n(cy - rr * Math.sin(a1))}" stroke="${c}" stroke-width="3.8" fill="none"/>`; }).join('')}</g>
        <path class="ag-gotasC" stroke="#6FAECA" stroke-width="7.5" fill="none" stroke-linecap="round" opacity=".8"/>
        <path class="ag-gotasG" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path class="ag-gotasP" stroke="#FFFFFF" stroke-width="2.8" fill="none" stroke-linecap="round" opacity=".9"/>
      </g>
      ${rochas([{ pts: [[984, 642], [982, 612], [1000, 586], [1040, 572], [1086, 580], [1110, 606], [1114, 642]], molhada: true, musgo: [1066, 582, 26, 7], liq: 4 },
        { pts: [[492, 728], [500, 712], [530, 704], [558, 712], [566, 728]], molhada: true, liq: 2, fendas: 1 },
        { pts: [[1086, 768], [1092, 754], [1116, 748], [1138, 756], [1142, 768]], molhada: true, liq: 2, fendas: 1 }], 37)}
      <path class="ag-linhaPedras" d="M984,642 Q1050,650 1114,642 M492,728 Q530,733 566,728 M1086,768 Q1114,772 1142,768" stroke="#E8FAFC" stroke-width="2.4" fill="none" opacity=".8" stroke-linecap="round"/>
      <ellipse cx="1046" cy="578" rx="20" ry="4" fill="#1E2A1A" opacity=".3"/>
      ${melroSVG()}
      <g class="ag-acima">${peixeSVG()}</g>
      ${rochas([
        { pts: [[250, 910], [266, 818], [326, 770], [420, 752], [500, 758], [560, 784], [596, 840], [606, 910]], musgo: [380, 766, 60, 12], fendas: 3, liq: 10 },
        { pts: [[990, 910], [1006, 844], [1070, 812], [1160, 806], [1222, 826], [1250, 910]], musgo: [1120, 816, 44, 9], liq: 8 },
        { pts: [[1160, 672], [1168, 630], [1220, 600], [1300, 594], [1372, 612], [1420, 650], [1436, 702], [1360, 712], [1270, 700], [1200, 688]], musgo: [1300, 606, 60, 12], fendas: 3, liq: 10 },
        { pts: [[1420, 720], [1436, 672], [1494, 640], [1580, 638], [1620, 660], [1620, 732]], musgo: [1530, 646, 50, 10], liq: 8 },
        { pts: [[1236, 910], [1258, 850], [1336, 832], [1430, 842], [1520, 856], [1620, 860], [1620, 910]], liq: 6, fendas: 2 }], 47)}
      <g class="ag-raG">${raSVG()}</g>
      ${tocaSVG('ag-fetoF0', 170, 900, 1.15, [-170, -145, -125, -100, -80, -60, -35, -15], 11)}
      ${tocaSVG('ag-fetoF1', 1500, 905, 1, [-165, -140, -115, -95, -70, -45, -20], 12)}
      ${tocaSVG('ag-fetoF2', 1250, 600, .55, [-150, -120, -90, -60, -30], 13)}
      ${carvalhoSVG()}
      ${pinheiroSVG()}
      <g class="ag-folha" display="none"><g class="ag-folhaIn" transform="scale(1.7)">${FOLHA}</g></g>
      <g class="ag-gotaFeto" display="none"><ellipse cx="0" cy="0" rx="6" ry="7.4" fill="url(#agua-gota)" stroke="#5E9EB4" stroke-width="1"/><circle cx="-2" cy="-2.6" r="1.6" fill="#FFFFFF"/></g>
      ${libelinhaSVG()}
      <path class="ag-chuva" stroke="#E6F4FC" stroke-width="2" fill="none" stroke-linecap="round" opacity="0"/>
      <rect class="ag-escuro" width="1600" height="900" fill="#4A6A80" opacity="0" pointer-events="none"/>
      <rect width="1600" height="900" fill="url(#agua-luz)" pointer-events="none"/>
      <rect width="1600" height="900" fill="url(#agua-vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s), qa = s => Array.from(svg.querySelectorAll(s));
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; el.setAttribute(nome, v); } }

    const R = {
      agua: q('.ag-agua'), veu: q('.ag-veu'), veuFora: q('.ag-veuFora'), veuS: q('.ag-veuS'), bordaE: q('.ag-bordaE'), bordaD: q('.ag-bordaD'), labio: q('.ag-labio'),
      fios: qa('.ag-fio'), canal: [0, 1, 2].map(i => q('.ag-canalF' + i)),
      caust: [q('.ag-caust0'), q('.ag-caust1')], debaixo: q('.ag-debaixo'), acima: q('.ag-acima'), bolhas: q('.ag-bolhas'),
      reflexos: q('.ag-reflexos'), reflexoQ: q('.ag-reflexoQ'), supEsc: q('.ag-supEsc'), supLuz: q('.ag-supLuz'),
      aneis: Array.from(q('.ag-aneis').children), aneisPeq: [q('.ag-aneisPeq0'), q('.ag-aneisPeq1')], flocos: q('.ag-flocos'),
      brilhos: Array.from(q('.ag-brilhos').children), correntes: qa('.ag-corrente'), riffle: [q('.ag-riffle0'), q('.ag-riffle1')],
      espuma: [0, 1, 2].map(i => q('.ag-espuma' + i)), leito: [q('.ag-leito'), q('.ag-leito2')], coroas: q('.ag-coroas'), coroasAnel: q('.ag-coroasAnel'), nevoas: Array.from(q('.ag-nevoas').children), arco: q('.ag-arco'),
      gotasC: q('.ag-gotasC'), gotasG: q('.ag-gotasG'), gotasP: q('.ag-gotasP'), linhaPedras: q('.ag-linhaPedras'),
      nuvens: [0, 1, 2, 3].map(i => q('.ag-nuvem' + i)), raios: q('.ag-raios'), carvalho: q('.ag-carvalho'), pinheiro: q('.ag-pinheiro'),
      fetos: ['.ag-fetoD', '.ag-fetoE', '.ag-fetoF0', '.ag-fetoF1', '.ag-fetoF2'].map(s => q(s)), fetoGota: q('.ag-fetoGota'), gotaFeto: q('.ag-gotaFeto'),
      melro: q('.ag-melro'), melroIn: q('.ag-melroIn'), melroCorpo: q('.ag-melroCorpo'), melroCab: q('.ag-melroCab'), melroPalp: q('.ag-melroPalp'),
      melroPernas: q('.ag-melroPernas'), melroAsa: q('.ag-melroAsa'), melroVoo: q('.ag-melroVoo'),
      ra: q('.ag-ra'), raIn: q('.ag-raIn'), raSent: q('.ag-raSent'), raSalto: q('.ag-raSalto'), raPapo: q('.ag-raPapo'), raG: q('.ag-raG'),
      peixe: q('.ag-peixe'), peixeIn: q('.ag-peixeIn'), peixeCauda: q('.ag-peixeCauda'), peixeSombra: q('.ag-peixeSombra'),
      lib: q('.ag-lib'), libIn: q('.ag-libIn'), libAsas: [q('.ag-libAsas0'), q('.ag-libAsas1')],
      folha: q('.ag-folha'), folhaIn: q('.ag-folhaIn'), chuva: q('.ag-chuva'), escuro: q('.ag-escuro')
    };
    const SUPERIOR = R.folha.parentNode;           // a raiz do SVG (folha no ar, por cima das árvores)

    /* --- estado --- */
    let tempo = 0, vivo = true, semEventos = false;
    const S = { jorro: 0, agita: 0, sol: 1, chuva: 0, arco: 0, nuvem: 0 };   // valores suavizados

    /* --- envelopes: efeitos que se somam e se apagam sozinhos (toques seguidos nunca deixam nada partido) --- */
    const envs = [];
    const E = { jorro: 0, agita: 0, chuva: 0, arco: 0, escuro: 0 };
    function impulso(chave, amp, dur, tipo) { envs.push({ chave, amp, dur, t: 0, tipo: tipo || 'sino' }); }
    function forma(e) {
      const u = limita(e.t / e.dur, 0, 1);
      if (e.tipo === 'sino') return sino(u);
      if (e.tipo === 'plato') return passoS(0, .15, u) * (1 - passoS(.8, 1, u));
      if (e.tipo === 'ataque') { const a = Math.min(.3, 90 / e.dur); return u < a ? esai(u / a) : 1 - eseno((u - a) / (1 - a)); }
      return 0;
    }
    function atualizarEnvs(dt) {
      for (const k in E) E[k] = 0;
      for (let i = envs.length - 1; i >= 0; i--) {
        const e = envs[i]; e.t += dt;
        if (e.t >= e.dur) { envs.splice(i, 1); continue; }
        E[e.chave] += e.amp * forma(e);
      }
      E.jorro = limita(E.jorro, 0, 1.3); E.agita = limita(E.agita, 0, 1.6); E.chuva = limita(E.chuva, 0, 1); E.arco = limita(E.arco, 0, 1); E.escuro = limita(E.escuro, 0, 1);
    }

    /* --- partículas: gotas, anéis de onda, coroas de «chape», espuma, névoa, flocos, brilhos, bolhas --- */
    const gotas = [];        // { x, y, vx, vy, yA, g (grande) }
    function gota(x, y, vx, vy, yA, grande) { if (gotas.length > 220) gotas.shift(); gotas.push({ x, y, vx, vy, yA, g: grande }); }
    function salpicar(x, y, quantas, forca, larg) {
      for (let i = 0; i < quantas; i++) {
        const a = aleat(-1, 1);
        gota(x + a * larg, y - aleat(0, 10), a * aleat(60, 300) * forca, -aleat(300, 760) * forca, y + aleat(-6, 40), Math.random() < .45);
      }
    }
    const aneis = R.aneis.map(el => ({ el, t: 1, dur: 1, vis: false }));
    function onda(x, y, r0, r1, dur, f, atraso) {
      const o = aneis.find(o => o.t >= o.dur) || aneis.reduce((a, b) => a.t / a.dur > b.t / b.dur ? a : b);
      Object.assign(o, { x, y, r0, r1, dur, f, t: -(atraso || 0) });
    }
    const aneisPeq = [];     // { x, y, t, dur, r1 }
    function ondinha(x, y, r1, dur) { if (aneisPeq.length > 90) aneisPeq.shift(); aneisPeq.push({ x, y, t: 0, dur: dur || 700, r1: r1 || 14 }); }
    const coroas = [];       // { x, y, r, h, t, dur, pontas: [...] }
    function coroa(x, y, r, h, dur) {
      if (coroas.length > 5) coroas.shift();
      coroas.push({ x, y, r, h, t: 0, dur, pontas: Array.from({ length: 11 }, () => aleat(.6, 1)) });
    }
    const espuma = Array.from({ length: 40 }, () => novaBolha({}, true));
    function novaBolha(b, inicio) {
      const a = aleat(-1, 1);
      b.a = a; b.x = CXQ + a * aleat(.15, 1) * 128; b.y = FUNDO + aleat(-12, 14); b.rm = aleat(9, 24) * (1 - .3 * Math.abs(a));
      b.dur = aleat(600, 1300); b.t = inicio ? aleat(0, b.dur) : 0; b.vx = a * aleat(10, 40);
      return b;
    }
    const nevoas = R.nevoas.map(el => ({ el, vivo: false, x: 0, y: 0, r0: 0, r1: 0, t: 0, dur: 1, op: 0, vy: 0 }));
    function nevoa(x, y, r0, r1, dur, op, vy) {
      const f = nevoas.find(p => !p.vivo) || nevoas.reduce((a, b) => a.t / a.dur > b.t / b.dur ? a : b);
      Object.assign(f, { vivo: true, x, y, r0, r1, dur, op, vy, t: 0 });
    }
    const flocos = Array.from({ length: 26 }, () => novoFloco({}, true));
    function novoFloco(f, inicio) {
      const a = aleat(-1, 1);
      f.x = CXQ + a * 110; f.y = FUNDO + aleat(4, 18); f.vx = a * aleat(14, 40) + 8; f.vy = aleat(8, 22);
      f.r = aleat(2.5, 7); f.dur = aleat(4000, 7500); f.t = inicio ? aleat(0, f.dur) : 0;
      return f;
    }
    const brilhos = R.brilhos.map(el => ({ el, t: 1, dur: 1, x: 0, y: 0, k: 1 }));
    const bolhas = [];       // bolhas de ar debaixo de água (melro, rã)
    let emitirGota = 0, emitirNevoa = 0, emitirOnda = 0, emitirBrilho = 0;

    function atualizarParticulas(dt) {
      const s = dt / 1000, J = S.jorro;
      // gotas
      emitirGota += s * (16 + 50 * J);
      while (emitirGota >= 1) {
        emitirGota--;
        const a = aleat(-1, 1);
        gota(CXQ + a * 120 * (1 + .3 * J), FUNDO - aleat(0, 10), a * aleat(40, 160), -aleat(180, 420) * (1 + .4 * J), FUNDO + aleat(4, 30), Math.random() < .2);
      }
      let dG = '', dP = '';
      for (let i = gotas.length - 1; i >= 0; i--) {
        const g = gotas[i];
        g.vy += 1400 * s; g.x += g.vx * s; g.y += g.vy * s;
        if (g.vy > 0 && g.y > g.yA) { gotas.splice(i, 1); if (naPoca(g.x, g.yA, .97) && Math.random() < .5) ondinha(g.x, g.yA, g.g ? 16 : 10, 600); continue; }
        const k = .016, lx = limita(g.vx * k, -10, 10), ly = limita(g.vy * k, -12, 12);
        const seg = `M${n(g.x)},${n(g.y)}l${n(-lx)},${n(-ly + .1)}`;
        if (g.g) dG += seg; else dP += seg;
      }
      atr(R.gotasC, 'd', dG || 'M0,0'); atr(R.gotasG, 'd', dG || 'M0,0'); atr(R.gotasP, 'd', dP || 'M0,0');
      // anéis grandes
      emitirOnda -= dt;
      if (emitirOnda <= 0) { emitirOnda = aleat(420, 680) / (1 + J); onda(CXQ + aleat(-40, 40), FUNDO + 10, 80 * (1 + .25 * J), 300 + 60 * J, 2600, .32 + .25 * J); }
      for (const o of aneis) {
        if (o.t >= o.dur) { if (o.vis) { atr(o.el, 'opacity', '0'); o.vis = false; } continue; }
        o.t += dt;
        if (o.t < 0) continue;
        const u = Math.min(1, o.t / o.dur), r = lerp(o.r0, o.r1, esai(u));
        atr(o.el, 'cx', n(o.x)); atr(o.el, 'cy', n(o.y + r * .04)); atr(o.el, 'rx', n(r)); atr(o.el, 'ry', n(r * .27));
        atr(o.el, 'opacity', n3(o.f * Math.pow(1 - u, 1.2))); atr(o.el, 'stroke-width', n(1.2 + 3 * (1 - u)));
        o.vis = true;
      }
      // anéis pequenos (gotas e chuva)
      let a0 = '', a1 = '';
      for (let i = aneisPeq.length - 1; i >= 0; i--) {
        const o = aneisPeq[i]; o.t += dt;
        if (o.t >= o.dur) { aneisPeq.splice(i, 1); continue; }
        const u = o.t / o.dur, r = 2 + o.r1 * esai(u), d = elip(o.x, o.y, r, r * .3);
        if (u < .5) a0 += d; else a1 += d;
      }
      atr(R.aneisPeq[0], 'd', a0 || 'M0,0'); atr(R.aneisPeq[1], 'd', a1 || 'M0,0');
      // coroas de «chape» (com jato no meio)
      let dc = '', da = '';
      for (let i = coroas.length - 1; i >= 0; i--) {
        const c = coroas[i]; c.t += dt;
        const u = c.t / c.dur;
        if (u >= 1) { coroas.splice(i, 1); continue; }
        const H = c.h * Math.pow(sino(Math.min(1, u * 1.6)), .7), rr = c.r * (1 + .5 * esai(u)), N = c.pontas.length;
        if (H > 2) {
          // pétalas de água à volta de um anel; as de trás primeiro, as da frente por cima
          const ordem = c.pontas.map((p, k) => k).sort((i, j) => Math.sin(i / N * TAU) - Math.sin(j / N * TAU));
          for (const k of ordem) {
            const a = k / N * TAU + .13, ca = Math.cos(a), sa = Math.sin(a);
            const bx = c.x + ca * rr, by = c.y + sa * rr * .3, h = H * c.pontas[k] * (sa > 0 ? 1 : .75);
            const tx = bx + ca * h * .45, ty = by - h, w = rr * .32;
            const px = -sa * w, py = ca * w * .3;
            dc += `M${n(bx - px)},${n(by - py)}Q${n(bx + ca * h * .1 - px * .5)},${n(by - h * .55)} ${n(tx)},${n(ty)}Q${n(bx + ca * h * .3 + px * .5)},${n(by - h * .5)} ${n(bx + px)},${n(by + py)}Z`;
            if (u < .55) dc += elip(tx + ca * 4, ty - 6, 4.5 * (1 - u), 5 * (1 - u));
          }
          da += `M${n(c.x - rr * 1.05)},${n(c.y)}A${n(rr * 1.05)},${n(rr * .34)} 0 1,0 ${n(c.x + rr * 1.05)},${n(c.y)}A${n(rr * 1.05)},${n(rr * .34)} 0 1,0 ${n(c.x - rr * 1.05)},${n(c.y)}Z`;
          da += `M${n(c.x - rr * .8)},${n(c.y)}A${n(rr * .8)},${n(rr * .24)} 0 1,1 ${n(c.x + rr * .8)},${n(c.y)}A${n(rr * .8)},${n(rr * .24)} 0 1,1 ${n(c.x - rr * .8)},${n(c.y)}Z`;
          // gotas soltam-se das pontas no começo
          if (u < .35 && Math.random() < dt / 40) { const k = Math.random() * N | 0, a = k / N * TAU; gota(c.x + Math.cos(a) * rr, c.y - H * c.pontas[k], Math.cos(a) * aleat(80, 200), -aleat(200, 400), c.y + aleat(0, 30), true); }
        }
        const uj = (u - .3) / .6;
        if (uj > 0 && uj < 1) {
          const Hj = c.h * .9 * sino(uj), w = c.r * .16;
          dc += `M${n(c.x - w)},${n(c.y)} C${n(c.x - w * .6)},${n(c.y - Hj * .6)} ${n(c.x - w * .9)},${n(c.y - Hj)} ${n(c.x)},${n(c.y - Hj - w)} C${n(c.x + w * .9)},${n(c.y - Hj)} ${n(c.x + w * .6)},${n(c.y - Hj * .6)} ${n(c.x + w)},${n(c.y)} Z`;
          dc += elip(c.x, c.y - Hj - w * 2.6, w * .9, w);
        }
      }
      atr(R.coroas, 'd', dc || 'M0,0'); atr(R.coroasAnel, 'd', da || 'M0,0');
      // espuma que ferve em baixo da queda
      const d3 = ['', '', ''];
      const larg = 1 + .32 * J;
      for (const b of espuma) {
        b.t += dt * (1 + .6 * J);
        if (b.t >= b.dur) novaBolha(b, false);
        const u = b.t / b.dur, r = b.rm * Math.pow(sino(u), .6) * (1 + .55 * J);
        if (r < .8) continue;
        const x = CXQ + (b.x - CXQ) * larg + b.vx * u, y = b.y - 10 * u - 6 * J;
        d3[0] += elip(x + 1.5, y + 5, r * 1.06, r * .8); d3[1] += elip(x, y, r, r * .78); d3[2] += elip(x - r * .3, y - r * .32, r * .42, r * .28);
      }
      for (let i = 0; i < 3; i++) atr(R.espuma[i], 'd', d3[i]);
      R.leito.forEach((el, i) => poe(el, `translate(${CXQ},${FUNDO}) scale(${n3(larg * (1 + .03 * Math.sin(tempo / 230 + i)))},${n3(1 + .4 * J + .06 * Math.sin(tempo / 170 + i * 2))}) translate(${-CXQ},${-FUNDO})`));
      // flocos de espuma a boiar, que se afastam da queda
      let df = '';
      for (const f of flocos) {
        f.t += dt;
        if (f.t >= f.dur) novoFloco(f, false);
        const u = f.t / f.dur, tt = f.t / 1000;
        const x = f.x + f.vx * tt + 30 * tt * passoS(.3, 1, u), y = f.y + f.vy * tt + 2 * Math.sin(tt * 2 + f.r);
        const r = f.r * (1 - u * .6) * Math.min(1, u * 8);
        if (r > .6) df += elip(x, y, r, r * .4);
      }
      atr(R.flocos, 'd', df || 'M0,0');
      // névoa que sobe da espuma
      emitirNevoa -= dt * (1 + 1.5 * J);
      if (emitirNevoa <= 0) { emitirNevoa = aleat(220, 380); nevoa(CXQ + aleat(-130, 130), FUNDO - aleat(0, 20), aleat(26, 40), aleat(90, 130), aleat(2200, 3200), .55, -aleat(30, 60)); }
      for (const f of nevoas) {
        if (!f.vivo) { atr(f.el, 'opacity', '0'); continue; }
        f.t += dt;
        const u = f.t / f.dur;
        if (u >= 1) { f.vivo = false; atr(f.el, 'opacity', '0'); continue; }
        f.x += (14 + 6 * Math.sin(tempo / 1400 + f.r0)) * s; f.y += f.vy * s;
        poe(f.el, `translate(${n(f.x)},${n(f.y)}) scale(${n(lerp(f.r0, f.r1, esai(u)))},${n(lerp(f.r0, f.r1, esai(u)) * .7)})`);
        atr(f.el, 'opacity', n3(f.op * Math.min(1, u / .15) * Math.pow(1 - u, 1.2)));
      }
      // brilhos do sol na água
      emitirBrilho -= dt * S.sol * (1 + J * .5);
      if (emitirBrilho <= 0) {
        emitirBrilho = aleat(70, 160);
        const b = brilhos.find(o => o.t >= o.dur);
        if (b) {
          let x, y, k = 0;
          do { x = Math.random() < .6 ? aleat(440, 800) : aleat(800, 1180); y = aleat(628, 790); k++; } while (!naPoca(x, y, .9) && k < 8);
          Object.assign(b, { t: 0, dur: aleat(260, 520), x, y, k: aleat(.7, 1.5) * (.6 + (y - 610) / 300) });
        }
      }
      for (const b of brilhos) {
        if (b.t >= b.dur) { atr(b.el, 'opacity', '0'); continue; }
        b.t += dt;
        const u = Math.min(1, b.t / b.dur);
        poe(b.el, `translate(${n(b.x)},${n(b.y)}) scale(${n3(b.k * sino(u))},${n3(b.k * sino(u) * .8)})`);
        atr(b.el, 'opacity', n3(.95 * sino(u)));
      }
      // bolhas
      let db = '';
      for (let i = bolhas.length - 1; i >= 0; i--) {
        const b = bolhas[i]; b.t += dt;
        if (b.t >= b.dur) { bolhas.splice(i, 1); continue; }
        b.y -= 40 * s; b.x += 6 * Math.sin(b.t / 120) * s;
        db += elip(b.x, b.y, b.r, b.r);
      }
      atr(R.bolhas, 'd', db || 'M0,0');
    }

    /* --- desenho da cascata e da superfície da poça --- */
    function desenharQueda(t, dt) {
      const J = S.jorro, W = 1 + .32 * J, dx = 3 * Math.sin(t * .7);
      const xEsq = (s, f) => CXQ + dx * s - meiaLargura(s) * W * f, xDir = (s, f) => CXQ + dx * s + meiaLargura(s) * W * f;
      const esq = [], dir = [], esqF = [], dirF = [];
      for (let i = 0; i <= 10; i++) {
        const s = i / 10, y = lerp(LABIO, FUNDO + 6, s);
        esq.push([xEsq(s, 1) - 2 + 3 * Math.sin(t * 3.1 + s * 7), y]);
        dir.push([xDir(s, 1) + 2 + 3 * Math.sin(t * 2.7 + s * 6 + 1), y]);
        esqF.push([xEsq(s, 1) - 8 - 10 * s - 3 * Math.sin(t * 1.7 + s * 5), y]);
        dirF.push([xDir(s, 1) + 8 + 12 * s + 3 * Math.sin(t * 1.9 + s * 4), y]);
      }
      const contorno = (a, b) => linhaPor(a) + linhaPor(b.slice().reverse()).replace(/^M/, 'L') + 'Z';
      const dVeu = contorno(esq, dir);
      atr(R.veu, 'd', dVeu); atr(R.veuS, 'd', dVeu); atr(R.veuFora, 'd', contorno(esqF, dirF));
      atr(R.bordaE, 'd', linhaPor(esq.slice(0, 10))); atr(R.bordaD, 'd', linhaPor(dir.slice(0, 10)));
      atr(R.labio, 'd', `M${n(xEsq(0, 1) + 4)},${LABIO} Q${CXQ},${n(LABIO - 7 - 6 * J)} ${n(xDir(0, 1) - 4)},${LABIO}`);
      atr(R.labio, 'stroke-width', n(5 + 3 * J));
      // fios: cada um com o seu deslocamento do tracejado (a água desce)
      const vel = (1 + .9 * J) * calma;
      fiosDef.forEach((o, i) => {
        const el = R.fios[i], c = CAM_FIOS[o.ci];
        let d = '';
        for (let k = 0; k <= 8; k++) {
          const s = k / 8, y = LABIO - 2 + (FUNDO + 6 - LABIO) * s;
          const f = o.f * 2 - 1, x = CXQ + dx * s + f * meiaLargura(s) * W * (1 + .05 * s * Math.abs(f)) + 2.2 * Math.sin(t * 2.3 + o.fase + s * 5) * s;
          d += (k ? 'L' : 'M') + n(x) + ',' + n(y);
        }
        atr(el, 'd', d);
        o.of -= c.vel * vel * dt / 1000;
        if (o.of < -100000) o.of += 100000;
        atr(el, 'stroke-dashoffset', n(o.of));
      });
      R.canal.forEach((el, i) => atr(el, 'stroke-dashoffset', n(-(t * (70 + 40 * J) + i * 9) % 1000)));
      // reflexo da queda na poça, a tremer
      const re = [], rd = [];
      for (let k = 0; k <= 8; k++) {
        const s = k / 8, y = FUNDO + 14 + s * 110, w = meiaLargura(1) * W * (1 - .25 * s);
        re.push([CXQ - w + 7 * Math.sin(t * 3.3 + s * 9), y]); rd.push([CXQ + w + 7 * Math.sin(t * 3 + s * 8 + 2), y]);
      }
      atr(R.reflexoQ, 'd', contorno(re, rd));
    }
    function desenharSuperficie(t) {
      const A = 1 + 2.2 * S.agita + .6 * S.jorro;
      let dl = '', de = '';
      for (let k = 0; k < 11; k++) {
        const u = k / 10, y0 = 610 + 190 * Math.pow(u, 1.2), amp = (1.2 + 2.6 * u) * A, ph = k * 1.7, x0 = 330 + (k * 37) % 70;
        let dL = '', dE = '';
        for (let x = x0; x <= 1290; x += 30) {
          const y = y0 + amp * Math.sin(x * .021 + t * 1.7 + ph) + amp * .5 * Math.sin(x * .053 - t * 2.6 + ph * 2);
          dL += (x === x0 ? 'M' : 'L') + x + ',' + n(y);
          dE += (x === x0 ? 'M' : 'L') + (x + 11) + ',' + n(y + 4 + 2 * u);
        }
        dl += dL; de += dE;
      }
      atr(R.supLuz, 'd', dl); atr(R.supEsc, 'd', de);
      atr(R.supLuz, 'stroke-dashoffset', n(-t * 14 % 1000)); atr(R.supEsc, 'stroke-dashoffset', n(t * 10 % 1000));
      atr(R.supLuz, 'opacity', n3(limita(.3 * S.sol + .3 * S.agita, 0, .8)));
      // cáusticas: a luz do sol no fundo dança
      poe(R.caust[0], `translate(${n(8 * Math.sin(t * .8))},${n(3 * Math.cos(t * 1.1))})`);
      poe(R.caust[1], `translate(${n(-9 * Math.sin(t * .7 + 1))},${n(-3 * Math.cos(t * .9 + 2))})`);
      atr(R.caust[0], 'opacity', n3((.6 + .4 * Math.sin(t * 1.9)) * S.sol));
      atr(R.caust[1], 'opacity', n3((.6 + .4 * Math.sin(t * 1.5 + 2)) * S.sol));
      poe(R.reflexos, `translate(800,630) skewX(${n3(1.6 * Math.sin(t * 1.3) * A)}) scale(1,${n3(1 + .04 * Math.sin(t * 2.1))}) translate(-800,-630)`);
      atr(R.linhaPedras, 'opacity', n3(.5 + .3 * Math.sin(t * 2.4)));
      // ribeiro: as correntes andam para a direita
      R.correntes.forEach((el, i) => atr(el, 'stroke-dashoffset', n(-(t * (90 + i * 14) * (1 + .4 * S.jorro)) % 10000)));
      const fr = Math.sin(t * 5.5) > 0;
      atr(R.riffle[0], 'opacity', fr ? '.8' : '.25'); atr(R.riffle[1], 'opacity', fr ? '.25' : '.8');
      // arco-íris na névoa (quando o sol bate)
      atr(R.arco, 'opacity', n3(limita((.15 + .05 * Math.sin(t * .4)) * S.sol + .35 * S.jorro + .6 * S.arco, 0, .85)));
    }

    /* --- cenário vivo: nuvens, raios de sol, árvores e fetos ao vento --- */
    function animarCena(dt, t) {
      S.nuvem += dt / 1000 * 9 * calma;
      R.nuvens.forEach((g, i) => {
        const y = [120, 196, 70, 236][i], x0 = [260, 900, 1300, 620][i], v = [1, .75, 1.15, .6][i];
        poe(g, `translate(${n(-280 + ((x0 + 280 + S.nuvem * v) % 2160))},${y})`);
      });
      atr(R.raios, 'opacity', n3((.55 + .25 * Math.sin(t * .35) + .15 * Math.sin(t * .9)) * S.sol));
      poe(R.carvalho, `rotate(${n3((.7 * Math.sin(t * .5) + .3 * Math.sin(t * 1.3)) * calma)},140,330)`);
      poe(R.pinheiro, `rotate(${n3((.5 * Math.sin(t * .45 + 1) + .2 * Math.sin(t * 1.1)) * calma)},1510,300)`);
      const bases = [[1124, 468], [524, 420], [170, 900], [1500, 905], [1250, 600]];
      R.fetos.forEach((g, i) => { const [x, y] = bases[i]; poe(g, `rotate(${n3((1.4 * Math.sin(t * (.8 + i * .13) + i * 1.7) + .6 * Math.sin(t * 2.1 + i)) * calma)},${x},${y})`); });
    }

    /* --- melro-d'água: balança-se (sobe e desce), pisca a pálpebra branca, segue com os olhos o que mexe --- */
    const melro = { x: MELRO_POS[0], y: MELRO_POS[1], dip: 0, rot: 0, cab: 0, cabAlvo: 0, lado: 1, ladoAlvo: 1, esc: 1.3, alvo: null, ocupado: false,
      proxDip: aleat(1500, 3500), tDip: -1, nDip: 0, proxOlhar: 2000, pisca: 0, proxPisca: 2500, tPisca: -1, susto: 0, voo: false, asa: 0, sub: false, salto: 0 };
    function olharPara(f) { melro.alvo = f; }
    function atualizarMelro(dt) {
      const m = melro;
      if (!m.ocupado) {
        m.proxDip -= dt;
        if (m.proxDip <= 0 && m.tDip < 0) { m.tDip = 0; m.nDip = 2 + (Math.random() * 3 | 0); m.proxDip = aleat(2200, 5200); }
      }
      if (m.tDip >= 0) {
        m.tDip += dt;
        const k = m.tDip / 260;
        m.dip = 4.5 * Math.abs(Math.sin(PI * k));
        if (k >= m.nDip) { m.tDip = -1; m.dip = 0; }
      }
      // para onde olha
      m.proxOlhar -= dt;
      if (m.alvo) {
        const [ax, ay] = m.alvo();
        const dx = ax - m.x, dy = ay - (m.y - 40);
        if (!m.ocupado) m.ladoAlvo = dx > 50 ? -1 : dx < -20 ? 1 : m.ladoAlvo;
        m.cabAlvo = limita(-Math.atan2(dy, Math.abs(dx)) * GRAU * .8, -40, 45);
      } else if (m.proxOlhar <= 0) { m.proxOlhar = aleat(1600, 4000); m.cabAlvo = escolhe([-25, -12, 0, 8, 20]); if (!m.ocupado) m.ladoAlvo = Math.random() < .85 ? 1 : -1; }
      m.cab += (m.cabAlvo - m.cab) * (1 - Math.exp(-dt / 90));
      m.lado += limita(m.ladoAlvo - m.lado, -dt / 90, dt / 90);
      // piscar (a pálpebra do melro-d'água é branca)
      m.proxPisca -= dt;
      if (m.proxPisca <= 0) { m.proxPisca = aleat(1800, 5000); m.tPisca = 0; if (Math.random() < .3) m.proxPisca = 280; }
      if (m.tPisca >= 0) { m.tPisca += dt; m.pisca = sino(m.tPisca / 190); if (m.tPisca >= 190) { m.tPisca = -1; m.pisca = 0; } }
      m.susto = Math.max(0, m.susto - dt / 600);
      const virar = Math.abs(m.lado) < .98 ? 5 * sino((1 - Math.abs(m.lado))) : 0;
      const sx = Math.abs(m.lado) < .12 ? (m.lado < 0 ? -.12 : .12) : m.lado;
      poe(R.melro, `translate(${n(m.x)},${n(m.y - virar - m.salto)}) rotate(${n(m.rot)})`);
      poe(R.melroIn, `scale(${n3(sx * m.esc)},${n3(m.esc)})`);
      const dip = m.voo ? 0 : m.dip + 2 * m.susto;
      poe(R.melroCorpo, `translate(0,${n(dip)}) rotate(${n(m.susto * 6)},0,-10)`);
      poe(R.melroCab, `rotate(${n(m.cab)},-10,-26)`);
      atr(R.melroPernas, 'd', m.voo ? 'M-2,-6 L4,-1 M3,-6 L9,-2' : `M-3,${n(-6 + dip)} L-4,0 l-4,1 M-4,0 l3,1 M3,${n(-6 + dip)} L3,0 l-4,1 M3,0 l3,1`);
      const fecha = m.susto > .5 ? 1 : m.pisca;
      poe(R.melroPalp, `translate(0,-35.9) scale(1,${n3(Math.max(.001, fecha))}) translate(0,35.9)`);
      atr(R.melroVoo, 'display', m.voo ? 'inline' : 'none'); atr(R.melroAsa, 'display', m.voo ? 'none' : 'inline');
      if (m.voo) poe(R.melroVoo, `rotate(${n(40 * m.asa)},0,-24)`);
    }
    function moverMelro(sub) {                   // debaixo de água o melro passa para a camada por baixo da tinta da poça
      if (sub && R.melro.parentNode !== R.debaixo) R.debaixo.appendChild(R.melro);
      if (!sub && R.melro.parentNode === R.debaixo) R.acima.parentNode.insertBefore(R.melro, R.acima);
      melro.sub = sub;
    }

    /* --- tarefas: geradores que avançam com o dt do relógio (uma por faixa; lançar outra na mesma faixa substitui) --- */
    const faixas = new Map();
    function lancar(nome, gen, fim) {
      if (!vivo) return;
      parar(nome);
      faixas.set(nome, { g: gen, fim, limpar: gen.limpar });
      avancar(nome, 0);
    }
    function parar(nome) { const f = faixas.get(nome); if (f) { faixas.delete(nome); if (f.limpar) f.limpar(); } }
    function avancar(nome, dt) {
      const f = faixas.get(nome); if (!f) return;
      let r;
      try { r = f.g.next(dt); } catch (e) { if (faixas.get(nome) === f) { faixas.delete(nome); if (f.limpar) f.limpar(); } console.error(e); return; }
      if (r.done && faixas.get(nome) === f) { faixas.delete(nome); if (f.limpar) f.limpar(); if (f.fim) f.fim(); }
    }
    function* espera(ms) { let t = 0; while (t < ms) t += yield; }
    function* durante(ms, f) { let t = 0; for (;;) { const u = ms > 0 ? Math.min(1, t / ms) : 1; f(u, t); if (u >= 1) return; t += yield; } }
    const comLimpar = (g, f) => { g.limpar = f; return g; };

    /* --- peixe (truta): nada no fundo ou salta --- */
    const peixe = { x: 0, y: 0, ang: 0, cauda: 0, op: 0, esc: 1.25, sub: true };
    function poePeixe() {
      const c = Math.cos(peixe.ang * RAD) < 0;   // a nadar para a esquerda: espelha em y para não ficar de barriga para o ar
      poe(R.peixe, `translate(${n(peixe.x)},${n(peixe.y)}) rotate(${n(peixe.ang)}) scale(${n3(peixe.esc)},${n3(peixe.esc * (c ? -1 : 1))})`);
      poe(R.peixeCauda, `rotate(${n(peixe.cauda)},-14,0)`);
      atr(R.peixe, 'opacity', n3(peixe.op));
      if (peixe.sub) {
        poe(R.peixeSombra, `translate(${n(peixe.x + 14)},${n(peixe.y + 30)}) scale(${n3(peixe.esc * Math.abs(Math.cos(peixe.ang * RAD)) + .3)},1)`);
        atr(R.peixeSombra, 'opacity', n3(.35 * peixe.op));
      } else atr(R.peixeSombra, 'opacity', '0');
    }
    function peixeSub(sub) { (sub ? R.debaixo : R.acima).appendChild(R.peixe); peixe.sub = sub; }
    function esconderPeixe() { atr(R.peixe, 'display', 'none'); atr(R.peixeSombra, 'opacity', '0'); peixeSub(true); if (melro.alvo === alvoPeixe) olharPara(null); }
    const alvoPeixe = () => [peixe.x, peixe.y];

    /* --- variações ociosas (a cada 4–9 s, sem repetir a mesma seguida) --- */
    function* varJorro() {                       // a cascata dá um jorro: mais água, mais espuma e névoa
      impulso('jorro', .5, 2600, 'sino'); impulso('arco', .3, 2800, 'sino'); impulso('agita', .3, 2600, 'sino');
      yield* espera(2600);
    }
    function* varPeixinho() {                    // uma truta passa devagar no fundo da poça
      const dir = escolhe([-1, 1]);
      const cam = dir > 0 ? [[440, 750], [600, 720], [780, 750], [960, 720], [1150, 740]] : [[1180, 750], [1000, 720], [820, 752], [640, 728], [440, 760]];
      peixeSub(true); atr(R.peixe, 'display', 'inline'); peixe.esc = 1.05;
      olharPara(alvoPeixe);
      let px = cam[0][0], py = cam[0][1];
      yield* durante(6000, (u, tt) => {
        const [x, y] = catmull(cam, eseno(u));
        const vx = x - px, vy = y - py; px = x; py = y;
        if (Math.abs(vx) + Math.abs(vy) > .01) peixe.ang = Math.atan2(vy, vx) * GRAU;
        peixe.x = x; peixe.y = y; peixe.cauda = 22 * Math.sin(tt * .012);
        peixe.op = .85 * passoS(0, .1, u) * (1 - passoS(.88, 1, u));
        poePeixe();
      });
    }
    varPeixinho.limpar = esconderPeixe;
    let gotaPosAtual = [0, 0];
    const gotaPos = () => gotaPosAtual.slice();
    const fetoGota = { ang: 0, v: 0, alvo: 0 };
    function atualizarFetoGota(dt, t) {
      const s = dt / 1000, ns = Math.max(1, Math.ceil(s / .008)), h = s / ns;
      for (let i = 0; i < ns; i++) { fetoGota.v += (-90 * (fetoGota.ang - fetoGota.alvo) - 5 * fetoGota.v) * h; fetoGota.ang += fetoGota.v * h; }
      const balanco = 1.2 * Math.sin(t * 1.1) * calma;
      poe(R.fetoGota, `rotate(${n3(fetoGota.ang + balanco)},${FETO_GOTA.x},${FETO_GOTA.y})`);
      // posição da ponta (para a gota)
      let x = FETO_GOTA.x, y = FETO_GOTA.y;
      for (let i = 1; i <= 16; i++) { const aa = (-40 + 95 * i / 16) * RAD; x += Math.cos(aa) * 120 / 16; y += Math.sin(aa) * 120 / 16; }
      const r = (fetoGota.ang + balanco) * RAD, dx = x - FETO_GOTA.x, dy = y - FETO_GOTA.y;
      gotaPosAtual = [FETO_GOTA.x + dx * Math.cos(r) - dy * Math.sin(r), FETO_GOTA.y + dx * Math.sin(r) + dy * Math.cos(r) + 7];
    }
    function* varGotaFeto() {
      atr(R.gotaFeto, 'display', 'inline');
      olharPara(() => gotaPos());
      yield* durante(1700, u => { fetoGota.alvo = 8 * esai(u); const [x, y] = gotaPos(); poe(R.gotaFeto, `translate(${n(x)},${n(y + 3 * u)}) scale(${n3(.15 + .85 * u)},${n3(.15 + .95 * u)})`); });
      let [x, y] = gotaPos(); y += 3;
      fetoGota.alvo = 0; fetoGota.v -= 140;               // sem o peso, o feto salta para cima e baloiça
      let vy = 0;
      const yA = 650;
      olharPara(() => [x, y]);
      while (y < yA) {
        const dt = yield; const s = dt / 1000;
        vy += 1500 * s; y += vy * s;
        poe(R.gotaFeto, `translate(${n(x)},${n(Math.min(y, yA))}) scale(.9,${n3(1 + Math.min(.6, vy / 900))})`);
      }
      atr(R.gotaFeto, 'display', 'none');
      onda(x, yA, 3, 80, 1500, .95); onda(x, yA, 2, 50, 1200, .75, 220); onda(x, yA, 2, 26, 900, .55, 460);
      coroa(x, yA, 9, 26, 520);
      for (let i = 0; i < 7; i++) gota(x + aleat(-4, 4), yA - 4, aleat(-100, 100), -aleat(180, 340), yA + aleat(0, 10), false);
      yield* espera(1300);
      olharPara(null);
    }
    varGotaFeto.limpar = () => { atr(R.gotaFeto, 'display', 'none'); fetoGota.alvo = 0; if (vivo) olharPara(null); };

    const lib = { x: 0, y: 0, rot: 0, quadro: 0 };
    function poeLib() { poe(R.lib, `translate(${n(lib.x)},${n(lib.y)}) rotate(${n(lib.rot)}) scale(1.35)`); }
    function* varLibelinha() {                   // uma libelinha-azul chega, paira e toca duas vezes na água
      atr(R.lib, 'display', 'inline');
      olharPara(() => [lib.x, lib.y]);
      const ida = [[1320, 430], [1200, 520], [1060, 600], [960, 636]];
      yield* durante(1600, (u, tt) => { const [x, y] = catmull(ida, eseno(u)); lib.x = x; lib.y = y + 4 * Math.sin(tt * .02); lib.rot = -6 * Math.sin(u * PI); poeLib(); });
      for (const [x0, x1] of [[960, 900], [760, 700]]) {
        const y0 = lib.y, xs = lib.x;
        yield* durante(700, (u, tt) => { lib.x = lerp(xs, x0, eseno(u)); lib.y = lerp(y0, 640, eseno(u)) + 3 * Math.sin(tt * .03); lib.rot = 0; poeLib(); });
        // desce, toca na água e sobe
        let tocou = false;
        yield* durante(520, u => {
          lib.x = lerp(x0, x1, u); lib.y = 640 + 34 * sino(u) - 6; lib.rot = 18 * Math.sin(u * PI * 2);
          if (!tocou && u > .5) { tocou = true; const yy = 674, xx = lib.x - 28; onda(xx, yy, 2, 40, 1100, .8); onda(xx, yy, 1, 22, 800, .6, 160); for (let i = 0; i < 4; i++) gota(xx, yy - 2, aleat(-60, 60), -aleat(120, 220), yy + 6, false); }
          poeLib();
        });
        yield* durante(600, (u, tt) => { lib.y = 640 - 30 * eseno(u) + 3 * Math.sin(tt * .03); poeLib(); });
      }
      const sai = [[lib.x, lib.y], [600, 520], [420, 420], [180, 340], [-80, 290]];
      yield* durante(1800, (u, tt) => { const [x, y] = catmull(sai, eio(u)); lib.x = x; lib.y = y + 4 * Math.sin(tt * .02); lib.rot = 8 * Math.sin(u * PI); poeLib(); });
    }
    varLibelinha.limpar = () => { atr(R.lib, 'display', 'none'); if (vivo) olharPara(null); };

    const folha = { x: 0, y: 0, rot: 0, sx: 1, naAgua: false };
    function poeFolha() { poe(R.folha, `translate(${n(folha.x)},${n(folha.y)}) rotate(${n(folha.rot)})`); poe(R.folhaIn, `scale(${n3(1.7 * folha.sx)},1.7)`); }
    function* varFolha() {                       // uma folha cai do carvalho a baloiçar e pousa na água
      if (R.folha.parentNode !== SUPERIOR) SUPERIOR.insertBefore(R.folha, R.gotaFeto);
      atr(R.folha, 'display', 'inline'); folha.naAgua = false;
      olharPara(() => [folha.x, folha.y]);
      const x0 = 250, y0 = 230, x1 = 610, y1 = 676;
      yield* durante(3600, (u, tt) => {
        const e = eseno(u);
        folha.x = lerp(x0, x1, e) + 46 * Math.sin(u * PI * 3.5) * (1 - u * .7);
        folha.y = lerp(y0, y1, Math.pow(u, .95)) - 14 * Math.abs(Math.sin(u * PI * 3.5)) * (1 - u);
        folha.rot = 30 * Math.sin(u * PI * 3.5 + .4) * (1 - u * .5) + 20 * u;
        folha.sx = lerp(Math.cos(tt * .006), 1, passoS(.7, 1, u));
        poeFolha();
      });
      // pousa: um anel e vai com a corrente (numa faixa própria, para a próxima variação não esperar)
      onda(x1, y1 + 2, 4, 50, 1300, .8); onda(x1, y1 + 2, 2, 28, 900, .55, 200);
      R.acima.appendChild(R.folha); folha.naAgua = true;
      olharPara(null);
      lancar('folhaRio', comLimpar(folhaRio(), () => { atr(R.folha, 'display', 'none'); }));
    }
    varFolha.limpar = () => { if (!faixas.has('folhaRio')) atr(R.folha, 'display', 'none'); if (vivo && melro.alvo) olharPara(null); };
    function* folhaRio() {
      const cam = [[610, 678], [720, 712], [880, 738], [1040, 744], [1170, 728], [1300, 756], [1450, 784], [1660, 810]];
      const r0 = folha.rot;
      yield* durante(11000, (u, tt) => {
        const e = Math.pow(u, 1.25);
        const [x, y] = catmull(cam, e);
        folha.x = x; folha.y = y + 1.5 * Math.sin(tt * .004);
        folha.rot = r0 + 80 * e + 8 * Math.sin(tt * .002); folha.sx = 1;
        poeFolha();
      });
    }

    const VARIACOES = { jorro: varJorro, peixinho: varPeixinho, gota: varGotaFeto, libelinha: varLibelinha, folha: varFolha };
    const vari = { prox: aleat(3000, 5000), ultima: null, atual: null };
    function iniciarVariacao(nome) {
      const g = VARIACOES[nome]();
      g.limpar = VARIACOES[nome].limpar;
      vari.ultima = nome; vari.atual = nome;
      lancar('variacao', g, () => { vari.prox = aleat(4000, 9000); vari.atual = null; });
    }
    function atualizarVariacoes(dt) {
      if (faixas.has('variacao')) return;
      vari.prox -= dt;
      if (vari.prox > 0) return;
      vari.prox = aleat(4000, 9000);
      let lista = Object.keys(VARIACOES).filter(v => v !== vari.ultima);
      if (faixas.has('folhaRio')) lista = lista.filter(v => v !== 'folha');
      if (faixas.has('reacao') && reacaoAtual === 'peixe') lista = lista.filter(v => v !== 'peixinho');
      if (melro.ocupado) lista = lista.filter(v => v !== 'gota');
      iniciarVariacao(escolhe(lista));
    }

    /* --- reações ao toque (visíveis em 100 ms, 1–2 s, sem repetir a mesma seguida) --- */
    function sustoMelro() { if (!melro.ocupado) { melro.susto = 1; melro.tDip = 0; melro.nDip = 2; } }
    function* reChape() {                        // um grande «chape»: coroa de água, gotas a saltar e ondas em círculo
      const x = aleat(600, 960), y = aleat(700, 740);
      coroa(x, y, 46, 120, 950);
      salpicar(x, y, 34, 1.1, 34);
      onda(x, y, 14, 240, 1700, .95); onda(x, y, 8, 160, 1400, .75, 160); onda(x, y, 4, 90, 1100, .6, 340);
      impulso('agita', 1, 1700, 'ataque');
      olharPara(() => [x, y]);
      yield* espera(1700);
      olharPara(null);
    }
    function* rePeixe() {                        // uma truta salta da água em arco e volta a cair
      if (vari.atual === 'peixinho') { parar('variacao'); vari.prox = aleat(4000, 9000); vari.atual = null; }
      const dir = escolhe([-1, 1]);
      const x0 = dir > 0 ? aleat(600, 700) : aleat(900, 1000), y0 = aleat(684, 712);
      const x1 = x0 + dir * aleat(190, 230), y1 = y0 + aleat(0, 14), alt = aleat(170, 200);
      peixeSub(false); atr(R.peixe, 'display', 'inline'); peixe.op = 1; peixe.esc = 1.3;
      coroa(x0, y0, 20, 58, 650); salpicar(x0, y0, 14, .8, 16);
      onda(x0, y0, 6, 120, 1300, .85); onda(x0, y0, 4, 70, 1000, .6, 180);
      impulso('agita', .5, 1500, 'ataque');
      olharPara(alvoPeixe);
      let px = x0, py = y0 + 4;
      yield* durante(1050, (u, tt) => {
        const x = lerp(x0, x1, u), y = lerp(y0, y1, u) - alt * 4 * u * (1 - u);
        const vx = x - px, vy = y - py; px = x; py = y;
        peixe.ang = Math.atan2(vy, vx) * GRAU; peixe.x = x; peixe.y = y;
        peixe.cauda = 30 * Math.sin(tt * .03) * (1 - .6 * sino(u));
        if (Math.random() < .25) gota(x - vx * 3, y, aleat(-40, 40), aleat(-60, 40), y1 + aleat(0, 20), false);
        poePeixe();
      });
      coroa(x1, y1, 22, 64, 650); salpicar(x1, y1, 16, .85, 16);
      onda(x1, y1, 6, 130, 1400, .9); onda(x1, y1, 4, 80, 1100, .65, 180);
      peixeSub(true);
      const a0 = peixe.ang;
      yield* durante(500, (u, tt) => { peixe.x = x1 + dir * 40 * u; peixe.y = y1 + 26 * u; peixe.ang = lerp(a0, dir > 0 ? 10 : 170, u); peixe.op = 1 - u; peixe.cauda = 24 * Math.sin(tt * .03); poePeixe(); });
      esconderPeixe();
      yield* espera(300);
    }
    rePeixe.limpar = esconderPeixe;
    function* reJorro() {                        // a cascata dá um grande jorro: a espuma cresce e salta névoa e gotas
      impulso('jorro', 1.1, 1900, 'ataque'); impulso('agita', .7, 1900, 'sino'); impulso('arco', .6, 2200, 'sino');
      for (let i = 0; i < 40; i++) { const a = aleat(-1, 1); gota(CXQ + a * 150, FUNDO - aleat(0, 20), a * aleat(120, 380), -aleat(420, 820), FUNDO + aleat(10, 70), Math.random() < .5); }
      for (let i = 0; i < 6; i++) nevoa(CXQ + aleat(-150, 150), FUNDO - aleat(0, 40), aleat(40, 60), aleat(140, 190), aleat(2400, 3200), .7, -aleat(50, 90));
      onda(CXQ, FUNDO + 10, 100, 380, 2000, .8); onda(CXQ, FUNDO + 10, 90, 300, 1600, .6, 250);
      yield* espera(1900);
    }
    const REACOES = { chape: reChape, peixe: rePeixe, jorro: reJorro };
    let ultimaReacao = null, reacaoAtual = null;
    function reagir(nome) {
      if (!vivo) return;
      nome = nome || escolhe(Object.keys(REACOES).filter(r => r !== ultimaReacao));
      ultimaReacao = nome; reacaoAtual = nome;
      while (envs.length > 40) envs.shift();
      const g = REACOES[nome]();
      g.limpar = REACOES[nome].limpar;
      sustoMelro();
      lancar('reacao', g, () => { reacaoAtual = null; });
    }

    /* --- acontecimentos raros (15–40 s): o melro mergulha, a rã salta, chuvada com sol --- */
    function* evMelro() {                        // o melro-d'água mergulha, anda debaixo de água e volta à pedra
      const m = melro;
      m.ocupado = true; m.ladoAlvo = 1; olharPara(() => [960, 660]);
      yield* espera(500);
      m.tDip = 0; m.nDip = 3;
      yield* espera(900);
      olharPara(null); m.cabAlvo = -30;
      const x0 = m.x, y0 = m.y, xe = 968, ye = 662;
      yield* durante(150, u => { m.salto = -3 * sino(u); });
      yield* durante(460, u => { m.x = lerp(x0, xe, u); m.y = lerp(y0, ye, u) - 50 * 4 * u * (1 - u); m.rot = lerp(0, -35, u); m.salto = 0; });
      coroa(xe, ye, 14, 40, 600); salpicar(xe, ye, 10, .6, 12); onda(xe, ye, 4, 90, 1300, .8); onda(xe, ye, 3, 50, 1000, .6, 200);
      moverMelro(true);
      const cam = [[xe, ye + 8], [930, 690], [880, 702], [860, 696], [900, 680], [950, 668]];
      yield* durante(2400, (u, tt) => {
        const [x, y] = catmull(cam, eseno(u)); m.x = x; m.y = y + 14; m.rot = 20 * Math.sin(u * PI * 2) - 10;
        m.voo = true; m.asa = Math.sin(tt * .02) * .5;
        atr(R.melro, 'opacity', n3(.75));
        if (Math.random() < dt0 / 120) bolhas.push({ x: x - 10, y: y - 10, r: aleat(1.5, 3.4), t: 0, dur: aleat(500, 900) });
      });
      atr(R.melro, 'opacity', '1');
      const xs = m.x, ys = m.y;
      coroa(xs, 672, 12, 36, 560); salpicar(xs, 672, 10, .6, 10); onda(xs, 672, 4, 80, 1200, .75);
      moverMelro(false);
      yield* durante(700, (u, tt) => {
        m.x = lerp(xs, MELRO_POS[0], eseno(u)); m.y = lerp(ys - 10, MELRO_POS[1], eseno(u)) - 46 * sino(u);
        m.rot = lerp(-10, 0, u); m.voo = u < .9; m.asa = Math.sin(tt * .05);
      });
      m.x = MELRO_POS[0]; m.y = MELRO_POS[1]; m.rot = 0; m.voo = false;
      // sacode a água das penas
      yield* durante(600, (u, tt) => {
        m.rot = 9 * Math.sin(tt * .06) * (1 - u);
        if (Math.random() < .35) gota(m.x + aleat(-14, 14), m.y - 24, aleat(-160, 160), -aleat(80, 220), m.y + aleat(4, 20), false);
      });
      m.rot = 0;
      yield* espera(400);
      m.ocupado = false;
    }
    evMelro.limpar = () => { const m = melro; moverMelro(false); Object.assign(m, { x: MELRO_POS[0], y: MELRO_POS[1], rot: 0, voo: false, ocupado: false, salto: 0 }); atr(R.melro, 'opacity', '1'); };
    let dt0 = 16.7;
    const ra = { x: 0, y: 0, rot: 0, esc: 1.35, papo: 0 };
    function poeRa(salto) {
      poe(R.ra, `translate(${n(ra.x)},${n(ra.y)}) rotate(${n(ra.rot)})`);
      poe(R.raIn, `scale(${n3(ra.esc)})`);
      atr(R.raSent, 'display', salto ? 'none' : 'inline'); atr(R.raSalto, 'display', salto ? 'inline' : 'none');
      poe(R.raPapo, `translate(18,-8.4) scale(${n3(1 + .5 * ra.papo)}) translate(-18,8.4)`);
    }
    function* evRa() {                           // uma rã sai de trás do feto, senta-se na pedra e salta para a água
      if (R.ra.parentNode !== R.raG) R.raG.appendChild(R.ra);
      atr(R.ra, 'display', 'inline'); atr(R.ra, 'opacity', '1');
      olharPara(() => [ra.x, ra.y - 20]);
      const [xr, yr] = RA_POS;
      ra.x = 380; ra.y = 760; ra.rot = 0;
      yield* durante(500, u => { ra.x = lerp(380, xr, u); ra.y = lerp(760, yr, u) - 40 * sino(u); ra.rot = -20 * Math.sin(u * PI * 2) * .4; poeRa(u > .1 && u < .85); });
      ra.rot = 0;
      yield* durante(1500, (u, tt) => { ra.papo = Math.max(0, Math.sin(tt * .012)); poeRa(false); });
      ra.papo = 0;
      yield* durante(160, u => { ra.y = yr + 3 * u; poeRa(false); });
      const xe = 616, ye = 708;
      yield* durante(520, u => { ra.x = lerp(xr, xe, u); ra.y = lerp(yr + 3, ye, u) - 70 * 4 * u * (1 - u); ra.rot = lerp(-25, 40, u); poeRa(true); });
      coroa(xe + 10, ye, 18, 50, 620); salpicar(xe + 10, ye, 14, .7, 14); onda(xe + 10, ye, 4, 120, 1500, .9); onda(xe + 10, ye, 3, 70, 1100, .65, 200);
      R.debaixo.appendChild(R.ra);
      yield* durante(2200, (u, tt) => {
        ra.x = xe + 170 * eseno(u); ra.y = ye + 18 + 40 * u; ra.rot = 10;
        atr(R.ra, 'opacity', n3(.8 * (1 - passoS(.4, 1, u))));
        poeRa(Math.sin(tt * .012) > 0);
        if (Math.random() < .05) bolhas.push({ x: ra.x + 20, y: ra.y - 20, r: aleat(1.5, 3), t: 0, dur: aleat(400, 800) });
      });
      atr(R.ra, 'display', 'none');
      olharPara(null);
    }
    evRa.limpar = () => { atr(R.ra, 'display', 'none'); if (R.ra.parentNode !== R.raG) R.raG.appendChild(R.ra); if (vivo) olharPara(null); };
    const chuva = Array.from({ length: 110 }, () => ({ x: aleat(-100, 1700), y: aleat(-100, 900), v: aleat(1300, 1700) }));
    function* evChuva() {                        // passa uma chuvada rápida com sol: gotas na poça e depois um arco-íris forte
      impulso('chuva', 1, 6500, 'plato'); impulso('escuro', 1, 6500, 'plato');
      melro.cabAlvo = 30;
      olharPara(() => [melro.x - 60, 200]);
      yield* espera(3000);
      olharPara(() => [800, 700]);
      yield* espera(3400);
      impulso('arco', 1, 4500, 'sino');
      olharPara(() => [830, 590]);
      yield* espera(3500);
      olharPara(null);
    }
    evChuva.limpar = () => { if (vivo) olharPara(null); };
    function atualizarChuva(dt) {
      const k = S.chuva;
      if (k < .01) { atr(R.chuva, 'opacity', '0'); return; }
      const s = dt / 1000;
      let d = '';
      const quantas = Math.round(chuva.length * k);
      for (let i = 0; i < chuva.length; i++) {
        const c = chuva[i];
        c.x += 180 * s; c.y += c.v * s;
        if (c.y > 900) { c.y = aleat(-120, -10); c.x = aleat(-200, 1600); }
        if (i < quantas) d += `M${n(c.x)},${n(c.y)}l-7,-46`;
      }
      atr(R.chuva, 'd', d || 'M0,0'); atr(R.chuva, 'opacity', n3(.55 * k));
      // pingos na poça
      const pingos = 70 * k * s;
      for (let i = 0; i < Math.floor(pingos) + (Math.random() < pingos % 1 ? 1 : 0); i++) {
        const x = aleat(420, 1220), y = aleat(610, 796);
        if (naPoca(x, y, .97)) ondinha(x, y, aleat(8, 16), aleat(500, 800));
      }
    }
    const EVENTOS = { melro: evMelro, ra: evRa, chuva: evChuva };
    const eventos = { prox: aleat(15000, 24000), ultimo: null };
    function iniciarEvento(tipo) {
      const g = EVENTOS[tipo]();
      g.limpar = EVENTOS[tipo].limpar;
      eventos.ultimo = tipo;
      lancar('evento', g);
    }
    function atualizarEventos(dt) {
      if (faixas.has('evento') || semEventos) return;
      eventos.prox -= dt;
      if (eventos.prox > 0) return;
      eventos.prox = aleat(15000, 40000);
      let tipo; do tipo = escolhe(Object.keys(EVENTOS)); while (tipo === eventos.ultimo);
      iniciarEvento(tipo);
    }

    /* --- relógio único --- */
    let erroMostrado = false;
    function passo(dt) {
      if (!vivo) return;
      try {
        dt = Math.min(dt, 50); dt0 = dt;
        tempo += dt;
        const t = tempo / 1000;
        atualizarEnvs(dt);
        const k = 1 - Math.exp(-dt / 60), kl = 1 - Math.exp(-dt / 400);
        S.jorro += (E.jorro - S.jorro) * k;
        S.agita += (E.agita - S.agita) * k;
        S.chuva += (E.chuva - S.chuva) * kl;
        S.arco += (E.arco - S.arco) * kl;
        S.sol += (1 - .45 * E.escuro - S.sol) * kl;
        for (const nome of Array.from(faixas.keys())) avancar(nome, dt);
        atualizarVariacoes(dt);
        atualizarEventos(dt);
        animarCena(dt, t);
        atualizarFetoGota(dt, t);
        desenharQueda(t, dt);
        desenharSuperficie(t);
        atualizarParticulas(dt);
        atualizarChuva(dt);
        atualizarMelro(dt);
        if (!faixas.has('variacao') || vari.atual !== 'libelinha') { if (R.lib.__display !== 'none') atr(R.lib, 'display', 'none'); }
        else { lib.quadro++; atr(R.libAsas[0], 'opacity', lib.quadro % 2 ? '.55' : '.25'); atr(R.libAsas[1], 'opacity', lib.quadro % 2 ? '.25' : '.55'); }
        atr(R.escuro, 'opacity', n3(.16 * (1 - S.sol) / .45));
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    passo(16.7);

    return {
      animal: R.agua,
      habitat: null,
      reagir() { reagir(); },
      fazerSom() {},                                 // os elementos não têm som (só a gravação do nome)
      irAoHabitat: () => Promise.resolve(),
      voltar: () => Promise.resolve(),
      destruir() {
        vivo = false;
        faixas.clear();
        envs.length = 0; gotas.length = 0; coroas.length = 0; aneisPeq.length = 0; bolhas.length = 0;
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola (modo de desenvolvimento)
      _teste: {
        S, E, melro,
        reacao: nome => reagir(nome),
        variacao: nome => iniciarVariacao(nome),
        evento: nome => iniciarEvento(nome),
        semEventos: (v = true) => { semEventos = v; },
        semVariacoes: () => { vari.prox = 1e12; },
        estado: () => ({ faixas: [...faixas.keys()], envs: envs.length, gotas: gotas.length, coroas: coroas.length, aneisPeq: aneisPeq.length, elementos: svg.querySelectorAll('*').length })
      }
    };
  }

  return { icone: iconeSVG(), montar };
})();
