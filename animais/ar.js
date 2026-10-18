/* Ar — «Os Meus Animais» (grupo Elementos). Contrato e regras: REGRAS-ANIMAIS.md (§11 Elementos).
   Cena: um monte ventoso numa tarde de primavera em Portugal (sol de cima à esquerda): céu azul com nuvens que correm
   e linhas de vento muito leves, uma serra azulada ao longe, colinas verdes em vários planos com choupos que se dobram,
   uma casinha caiada com barra azul e fumo da chaminé deitado pelo vento, um estendal com roupa a esvoaçar, um moinho de
   vento português (torre branca e redonda, telhado cónico, oito varas com velas de pano triangulares e os búzios de barro
   presos nas cordas) num outeiro à direita, uma árvore grande que se verga, uma vedação de madeira com um papagaio de papel
   preso a um poste e um chapéu de palha pendurado noutro, e no primeiro plano erva alta, dentes-de-leão amarelos e bolas
   de sementes. Aves planam no vento.
   O elemento (sem cara): o ar não se vê, por isso vê-se o que ele faz — um grande redemoinho no meio do prado, feito de
   fitas translúcidas brancas e azuladas que se enrolam em hélice à volta de um funil, se desenrolam, sobem e se apagam,
   e de caracóis de vento que se desenrolam à volta dele; lá dentro rodopiam folhas, pétalas e sementes de dente-de-leão.
   O vento tem uma intensidade que varia devagar (e rajadas que atravessam o ecrã da esquerda para a direita): tudo no
   cenário lê o vento no seu x (erva, flores, roupa, papagaio, moinho, árvores, fumo, nuvens, brilhos na erva).
   Variações ociosas (4–9 s): rajada forte, sementes do dente-de-leão que voam para o redemoinho, acalmia, folha que rodopia
   e cai. Toque: o redemoinho cresce e gira; um grande sopro da esquerda para a direita; os búzios do moinho «cantam»
   (as velas giram depressa e saem notas). Raros: balão de ar quente ao longe, o chapéu voa da vedação, bando de aves.
   Organização: 1) utilidades  2) redemoinho (medidas e geometria das fitas)  3) cenário  4) partículas e bichos
                5) ícone  6) montar(): estado, vento, desenho por quadro, tarefas, variações, reações, acontecimentos */
'use strict';
MODULOS.ar = (() => {
  const NS = 'http://www.w3.org/2000/svg';

  /* ================= 1) Utilidades ================= */
  const PI = Math.PI, TAU = 2 * PI, GRAU = 180 / PI;
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
  function catmull(pts, u) {
    const ns = pts.length - 1, s = Math.min(ns - 1e-6, Math.max(0, u) * ns), i = Math.floor(s), t = s - i;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(ns, i + 2)];
    const f = (a, b, c, d) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
    return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
  }
  // elipse como subcaminho (para juntar muitas num só path)
  const elip = (cx, cy, rx, ry) => `M${n(cx - rx)},${n(cy)}a${n(rx)},${n(ry)} 0 1,0 ${n(2 * rx)},0a${n(rx)},${n(ry)} 0 1,0 ${n(-2 * rx)},0Z`;
  // linha suave por pontos (curvas pelos meios)
  function linhaPor(pts) {
    const m = pts.length;
    let d = `M${n(pts[0][0])},${n(pts[0][1])}`;
    for (let i = 1; i < m - 1; i++) d += `Q${n(pts[i][0])},${n(pts[i][1])} ${n((pts[i][0] + pts[i + 1][0]) / 2)},${n((pts[i][1] + pts[i + 1][1]) / 2)}`;
    return d + `L${n(pts[m - 1][0])},${n(pts[m - 1][1])}`;
  }
  /* Fita: contorno fechado à volta de uma linha central com larguras.
     pts = [[x, y, largura], …]; vert (0–1) puxa a espessura para a vertical (fita enrolada num cilindro: nas bordas
     do funil vê-se de lado e fica fina, como uma fita que torce). */
  function contornoFita(pts, fator, vert) {
    const m = pts.length;
    if (m < 2) return '';
    const cima = [], baixo = [];
    for (let i = 0; i < m; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(m - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1];
      const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
      let nx = -ty, ny = tx;
      if (vert > 0 && ny > 0) { nx = -nx; ny = -ny; }
      let ox = nx * (1 - vert), oy = ny * (1 - vert) - vert;
      const lo = Math.hypot(ox, oy) || 1; ox /= lo; oy /= lo;
      const w = pts[i][2] * fator * .5;
      cima.push([pts[i][0] + ox * w, pts[i][1] + oy * w]);
      baixo.push([pts[i][0] - ox * w, pts[i][1] - oy * w]);
    }
    let d = `M${n(cima[0][0])},${n(cima[0][1])}`;
    for (let i = 1; i < m - 1; i++) d += `Q${n(cima[i][0])},${n(cima[i][1])} ${n((cima[i][0] + cima[i + 1][0]) / 2)},${n((cima[i][1] + cima[i + 1][1]) / 2)}`;
    d += `L${n(cima[m - 1][0])},${n(cima[m - 1][1])}L${n(baixo[m - 1][0])},${n(baixo[m - 1][1])}`;
    for (let i = m - 2; i > 0; i--) d += `Q${n(baixo[i][0])},${n(baixo[i][1])} ${n((baixo[i][0] + baixo[i - 1][0]) / 2)},${n((baixo[i][1] + baixo[i - 1][1]) / 2)}`;
    return d + `L${n(baixo[0][0])},${n(baixo[0][1])}Z`;
  }

  /* ================= 2) Redemoinho: medidas e geometria ================= */
  const BASE_X = 800, BASE_Y = 778;     // onde o redemoinho toca no chão
  const ALTURA = 446;                    // altura do funil (tam = 1): o topo fica a y ≈ 332, abaixo da zona do nome
  const R_BAIXO = 44, R_CIMA = 206;      // raio do funil em baixo e em cima
  const ELI = .25;                       // achatamento dos anéis (vista ligeiramente de cima)
  // G = { tam, inc, ond, t }: tamanho, inclinação do topo (px), ondulação do eixo, tempo (s)
  function funil(h, G) {
    const H = ALTURA * (1 + .38 * (G.tam - 1));
    const y = BASE_Y - H * h;
    const x = BASE_X + G.inc * Math.pow(Math.max(0, h), 1.5) + G.ond * Math.sin(G.t * 1.15 - h * 3.4) * (.25 + h);
    const r = (R_BAIXO + (R_CIMA - R_BAIXO) * Math.pow(Math.max(0, h), 1.2)) * G.tam * (1 + .035 * Math.sin(G.t * 2.1 + h * 6));
    return [x, y, r];
  }

  /* ================= 3) Cenário ================= */
  function defsCena(p) {
    return `
    <linearGradient id="${p}ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3F93DA"/><stop offset=".45" stop-color="#78BAEA"/><stop offset=".8" stop-color="#BFE2F5"/><stop offset="1" stop-color="#E4F3F2"/></linearGradient>
    <radialGradient id="${p}solBrilho"><stop offset="0" stop-color="#FFFBE6" stop-opacity=".95"/><stop offset=".22" stop-color="#FFF4C8" stop-opacity=".45"/><stop offset=".6" stop-color="#FFF0B8" stop-opacity=".1"/><stop offset="1" stop-color="#FFF0B8" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}sol" cx=".42" cy=".4" r=".62"><stop offset="0" stop-color="#FFFFF4"/><stop offset=".7" stop-color="#FFF4C4"/><stop offset="1" stop-color="#FFE596"/></radialGradient>
    <linearGradient id="${p}serra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8EAAC4"/><stop offset="1" stop-color="#B4CBD6"/></linearGradient>
    <linearGradient id="${p}colLonge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9DC088"/><stop offset="1" stop-color="#B1CD96"/></linearGradient>
    <linearGradient id="${p}colMeio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8CC25E"/><stop offset="1" stop-color="#76AE48"/></linearGradient>
    <linearGradient id="${p}colMoinho" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9ACB66"/><stop offset=".6" stop-color="#7FB44E"/><stop offset="1" stop-color="#6A9E3E"/></linearGradient>
    <linearGradient id="${p}prado" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A2D062"/><stop offset=".3" stop-color="#88BE4E"/><stop offset="1" stop-color="#5C9430"/></linearGradient>
    <radialGradient id="${p}brilho"><stop offset="0" stop-color="#E8F7A8" stop-opacity=".55"/><stop offset=".6" stop-color="#DDF09A" stop-opacity=".2"/><stop offset="1" stop-color="#DDF09A" stop-opacity="0"/></radialGradient>
    <linearGradient id="${p}parede" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".45" stop-color="#F6F4EE"/><stop offset="1" stop-color="#CFCAC0"/></linearGradient>
    <linearGradient id="${p}telhado" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A65A34"/><stop offset=".5" stop-color="#8A4626"/><stop offset="1" stop-color="#5E2C16"/></linearGradient>
    <linearGradient id="${p}vela" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF9EC"/><stop offset=".6" stop-color="#F2E8D2"/><stop offset="1" stop-color="#DCCDAE"/></linearGradient>
    <radialGradient id="${p}copa" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#8CC456"/><stop offset=".55" stop-color="#5E9A34"/><stop offset="1" stop-color="#3E7222"/></radialGradient>
    <linearGradient id="${p}tronco" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9A7454"/><stop offset=".45" stop-color="#76563A"/><stop offset="1" stop-color="#4E3824"/></linearGradient>
    <linearGradient id="${p}madeira" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B08458"/><stop offset=".5" stop-color="#94683E"/><stop offset="1" stop-color="#6E4A2A"/></linearGradient>
    <linearGradient id="${p}nucleo" gradientUnits="userSpaceOnUse" x1="0" y1="250" x2="0" y2="800"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".5"/><stop offset=".22" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".75" stop-color="#F4FBFF" stop-opacity=".9"/><stop offset=".93" stop-color="#EAF6FF" stop-opacity=".5"/><stop offset="1" stop-color="#EAF6FF" stop-opacity=".12"/></linearGradient>
    <linearGradient id="${p}halo" gradientUnits="userSpaceOnUse" x1="0" y1="250" x2="0" y2="800"><stop offset="0" stop-color="#B9E0FF" stop-opacity=".22"/><stop offset=".5" stop-color="#A6D6FA" stop-opacity=".4"/><stop offset=".92" stop-color="#C2E6FF" stop-opacity=".25"/><stop offset="1" stop-color="#C2E6FF" stop-opacity=".05"/></linearGradient>
    <linearGradient id="${p}corpo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D8F0FF" stop-opacity=".5"/><stop offset=".2" stop-color="#E6F5FF" stop-opacity=".16"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity=".04"/><stop offset=".8" stop-color="#E6F5FF" stop-opacity=".16"/><stop offset="1" stop-color="#C8E8FF" stop-opacity=".45"/></linearGradient>
    <linearGradient id="${p}caracol" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".25"/><stop offset=".35" stop-color="#FFFFFF" stop-opacity=".92"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".95"/></linearGradient>
    <linearGradient id="${p}linhaCeu" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".4" stop-color="#FFFFFF" stop-opacity=".55"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".7"/></linearGradient>
    <radialGradient id="${p}sombraVento"><stop offset="0" stop-color="#3A6A2A" stop-opacity=".32"/><stop offset=".6" stop-color="#3A6A2A" stop-opacity=".14"/><stop offset="1" stop-color="#3A6A2A" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}sombra"><stop offset="0" stop-color="#2E4A1A" stop-opacity=".36"/><stop offset=".7" stop-color="#2E4A1A" stop-opacity=".14"/><stop offset="1" stop-color="#2E4A1A" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}fumo"><stop offset="0" stop-color="#F4F6F8" stop-opacity=".85"/><stop offset=".6" stop-color="#E4E8EC" stop-opacity=".45"/><stop offset="1" stop-color="#E4E8EC" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}bola" cx=".4" cy=".38" r=".6"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".7" stop-color="#F2F4F0" stop-opacity=".55"/><stop offset="1" stop-color="#E4E8E0" stop-opacity=".15"/></radialGradient>
    <radialGradient id="${p}luzQuente" gradientUnits="userSpaceOnUse" cx="230" cy="150" r="1200"><stop offset="0" stop-color="#FFF4C8" stop-opacity=".2"/><stop offset=".5" stop-color="#FFF0C0" stop-opacity=".05"/><stop offset="1" stop-color="#FFF0C0" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}vinheta" cx=".5" cy=".46" r=".8"><stop offset=".64" stop-color="#1A3A2A" stop-opacity="0"/><stop offset="1" stop-color="#1A3A2A" stop-opacity=".24"/></radialGradient>`;
  }
  function nuvemSVG(i, k) {
    return `<g class="ar-nuvem${i}"><g transform="scale(${k})">
      <ellipse cx="0" cy="14" rx="100" ry="13" fill="#C6DDEE" opacity=".75"/>
      <ellipse cx="-50" cy="0" rx="38" ry="19" fill="#F2F8FC"/><ellipse cx="-8" cy="-12" rx="44" ry="26" fill="#FFFFFF"/><ellipse cx="38" cy="-2" rx="38" ry="19" fill="#F6FAFD"/><ellipse cx="78" cy="7" rx="24" ry="11" fill="#ECF4FA"/>
      <ellipse cx="0" cy="9" rx="96" ry="10" fill="#E6F0F8"/>
      <ellipse cx="-26" cy="-24" rx="24" ry="7" fill="#FFFFFF"/></g></g>`;
  }
  function longeSVG(p) {
    // serra azulada e colinas ao longe, com uma aldeia branca
    const rnd = semente(5);
    let s = `<path d="M0,470 C80,440 150,452 230,430 C320,406 390,440 470,428 C560,414 620,446 700,440 C800,432 880,452 960,438 C1060,420 1120,444 1200,430 C1300,412 1380,436 1460,424 C1530,414 1580,430 1600,428 L1600,560 L0,560 Z" fill="url(#${p}serra)"/>
      <path d="M180,436 C220,428 250,426 300,416 M1240,428 C1290,418 1330,416 1380,426" stroke="#C8D8E2" stroke-width="3" fill="none" opacity=".7"/>`;
    s += `<path d="M0,500 C130,480 260,496 400,484 C540,472 680,494 820,486 C960,478 1100,498 1240,486 C1380,474 1500,490 1600,484 L1600,600 L0,600 Z" fill="url(#${p}colLonge)"/>`;
    // sebes ao longe (pontinhos verde-escuros em filas) num só caminho
    let se = '';
    for (let i = 0; i < 60; i++) { const x = rnd() * 1600, y = 494 + rnd() * 30, r = 3 + rnd() * 3; se += elip(x, y, r, r * .7); }
    s += `<path d="${se}" fill="#7EA466" opacity=".85"/>`;
    // aldeia: casinhas brancas com telhado de telha
    let par = '', tel = '', jan = '';
    const casas = [[408, 492, 1], [428, 488, .8], [446, 494, 1.1], [466, 490, .9], [484, 495, .8], [1040, 484, .9], [1058, 488, 1]];
    for (const [x, y, k] of casas) {
      par += `M${n(x - 8 * k)},${y} l0,${n(-10 * k)} l${n(16 * k)},0 l0,${n(10 * k)} Z`;
      tel += `M${n(x - 9.5 * k)},${n(y - 10 * k)} l${n(9.5 * k)},${n(-6 * k)} l${n(9.5 * k)},${n(6 * k)} Z`;
      jan += `M${n(x - 3 * k)},${n(y - 6 * k)} h${n(2.4 * k)} v${n(3 * k)} h${n(-2.4 * k)} Z`;
    }
    s += `<path d="${par}" fill="#F6F2EA"/><path d="${tel}" fill="#C8643E"/><path d="${jan}" fill="#6A7488"/>`;
    return s;
  }
  // choupo (álamo) alto e estreito: dobra-se com skewX à volta da base
  function choupoSVG(i, x, y, k) {
    return `<g class="ar-choupo${i}" transform="translate(${x},${y})"><g class="ar-choupoIn">
      <ellipse cx="2" cy="1" rx="${n(16 * k)}" ry="${n(4 * k)}" fill="#3E6A24" opacity=".3"/>
      <path d="M-1.5,0 L-1,${n(-18 * k)} L1,${n(-18 * k)} L1.5,0 Z" fill="#5E4630"/>
      <path d="M0,${n(-96 * k)} C${n(12 * k)},${n(-80 * k)} ${n(14 * k)},${n(-40 * k)} ${n(9 * k)},${n(-16 * k)} C${n(4 * k)},${n(-10 * k)} ${n(-4 * k)},${n(-10 * k)} ${n(-9 * k)},${n(-16 * k)} C${n(-14 * k)},${n(-40 * k)} ${n(-12 * k)},${n(-80 * k)} 0,${n(-96 * k)} Z" fill="#4E8A2E" stroke="#36621E" stroke-width="1.2"/>
      <path d="M${n(-2 * k)},${n(-90 * k)} C${n(-9 * k)},${n(-70 * k)} ${n(-10 * k)},${n(-40 * k)} ${n(-6 * k)},${n(-20 * k)}" stroke="#86BE56" stroke-width="${n(4 * k)}" fill="none" opacity=".6" stroke-linecap="round"/></g></g>`;
  }
  function meioSVG(p) {
    // colinas do meio, com campos às faixas
    const rnd = semente(11);
    let s = `<path d="M0,556 C120,530 240,540 380,548 C520,556 640,560 800,556 C960,552 1060,540 1160,548 L1160,700 L0,700 Z" fill="url(#${p}colMeio)"/>
      <path d="M0,556 C120,530 240,540 380,548 C520,556 640,560 800,556 C960,552 1060,540 1160,548" stroke="#B4DC82" stroke-width="3" fill="none" opacity=".6"/>`;
    let su = '';
    for (let i = 0; i < 10; i++) { const y = 566 + i * 7; su += `M${n(rnd() * 200)},${y} C${n(300 + rnd() * 200)},${y - 4} ${n(700 + rnd() * 200)},${y + 4} ${n(1000 + rnd() * 160)},${y - 2} `; }
    s += `<path d="${su}" stroke="#6E9E40" stroke-width="1.6" fill="none" opacity=".45"/>`;
    // sebe escura entre campos
    let sb = '';
    for (let i = 0; i < 40; i++) { const x = 20 + i * 28 + rnd() * 10, y = 600 + Math.sin(i * .5) * 6 + rnd() * 4; sb += elip(x, y, 12 + rnd() * 6, 7 + rnd() * 3); }
    s += `<path d="${sb}" fill="#5A8E34" opacity=".75"/>`;
    return s;
  }
  // outeiro do moinho (à direita)
  function outeiroSVG(p) {
    return `<path d="M960,660 C1040,600 1100,470 1190,414 C1250,380 1340,382 1410,396 C1480,410 1550,424 1600,430 L1600,720 L960,720 Z" fill="url(#${p}colMoinho)"/>
      <path d="M1100,480 C1140,436 1180,404 1240,392 C1300,382 1360,386 1430,402" stroke="#B8E08A" stroke-width="3" fill="none" opacity=".6"/>
      <path d="M1180,470 q20,-6 40,-2 M1290,440 q24,-4 44,4 M1380,470 q20,-2 36,6 M1150,540 q24,-6 46,0 M1300,520 q20,-4 40,2 M1440,500 q20,-4 36,4" stroke="#5E9236" stroke-width="2" fill="none" opacity=".5"/>
      <path d="M1236,394 C1250,420 1262,460 1270,520" stroke="#C9B27A" stroke-width="5" fill="none" opacity=".55" stroke-linecap="round"/>`;
  }
  /* --- Moinho de vento português: torre redonda caiada, telhado cónico de madeira, mastro com oito varas, velas
         triangulares de pano e búzios de barro nas cordas (as velas rodam num grupo próprio) --- */
  const MOINHO = { x: 1300, base: 392, topo: 270, hx: 1282, hy: 264, R: 124 };
  function moinhoSVG(p) {
    const { x, base, topo } = MOINHO;
    const wb = 50, wt = 42;
    // torre (luz da esquerda): contorno, parede, barra, porta e janelinha
    const torre = `M${x - wb},${base} C${x - wb + 2},${base - 60} ${x - wt - 2},${topo + 40} ${x - wt},${topo} L${x + wt},${topo} C${x + wt + 2},${topo + 40} ${x + wb - 2},${base - 60} ${x + wb},${base} Z`;
    let pedras = '';
    for (let i = 0; i < 6; i++) { const yy = base - 12 - i * 22; pedras += `M${x - 30 + (i % 2) * 10},${yy} q8,-2 16,0 M${x + 8 - (i % 2) * 8},${yy - 10} q8,-2 14,0 `; }
    // telhado cónico
    const tel = `M${x - wt - 6},${topo + 2} C${x - 30},${topo - 30} ${x - 10},${topo - 56} ${x},${topo - 60} C${x + 10},${topo - 56} ${x + 30},${topo - 30} ${x + wt + 6},${topo + 2} Q${x},${topo + 10} ${x - wt - 6},${topo + 2} Z`;
    let tabuas = '';
    for (let i = -3; i <= 3; i++) tabuas += `M${x},${topo - 58} Q${x + i * 9},${topo - 26} ${x + i * 14},${topo + 4} `;
    return `<g class="ar-moinho">
      <ellipse cx="${x + 14}" cy="${base + 2}" rx="78" ry="9" fill="url(#${p}sombra)"/>
      <path d="${torre}" fill="url(#${p}parede)" stroke="#8A8070" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M${x - wb + 1},${base - 14} L${x + wb - 1},${base - 14} L${x + wb},${base} L${x - wb},${base} Z" fill="#E2C86A" opacity=".9"/>
      <path d="${pedras}" stroke="#D8D2C4" stroke-width="1.6" fill="none"/>
      <path d="M${x - 34},${base - 4} C${x - 34},${base - 70} ${x - 36},${topo + 50} ${x - 32},${topo + 8}" stroke="#FFFFFF" stroke-width="6" fill="none" opacity=".8" stroke-linecap="round"/>
      <path d="M${x - 2},${base} L${x - 2},${base - 38} Q${x + 12},${base - 52} ${x + 26},${base - 38} L${x + 26},${base} Z" fill="#3D6E8E" stroke="#2A4A60" stroke-width="2"/>
      <path d="M${x + 12},${base - 44} L${x + 12},${base}" stroke="#2A4A60" stroke-width="1.4"/><circle cx="${x + 20}" cy="${base - 18}" r="1.8" fill="#E2C86A"/>
      <path d="M${x - 22},${topo + 46} q6,-8 12,0 v12 h-12 Z" fill="#3A4A5A" stroke="#7A7262" stroke-width="1.5"/>
      <path d="${tel}" fill="url(#${p}telhado)" stroke="#4A2412" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="${tabuas}" stroke="#5A2C16" stroke-width="1.2" fill="none" opacity=".6"/>
      <path d="M${x - 30},${topo - 6} C${x - 22},${topo - 30} ${x - 10},${topo - 48} ${x - 2},${topo - 54}" stroke="#C47A4C" stroke-width="4" fill="none" opacity=".55" stroke-linecap="round"/>
      <circle cx="${x}" cy="${topo - 62}" r="4" fill="#6A3A1E"/>
      <path d="M${x - 8},${topo - 8} L${MOINHO.hx + 2},${MOINHO.hy - 2} L${MOINHO.hx - 2},${MOINHO.hy + 6} L${x - 6},${topo + 4} Z" fill="#6A4426" stroke="#3E2614" stroke-width="1.5"/>
    </g>`;
  }
  // velas: desenhadas à volta da origem (o grupo exterior faz translate + achatamento + rotação)
  function velasSVG(p) {
    const R = MOINHO.R;
    let varas = '', velas = '', cordas = '', buzios = '', bocas = '';
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU, c = Math.cos(a), s = Math.sin(a);
      const px = -s, py = c;                        // perpendicular (lado de trás da vara, no sentido da rotação)
      varas += `M${n(c * 10)},${n(s * 10)} L${n(c * R)},${n(s * R)} `;
      const r0 = 26, r1 = R - 6, lw = 46;
      velas += `M${n(c * r0)},${n(s * r0)} L${n(c * r1)},${n(s * r1)} Q${n(c * (r1 - 20) + px * lw * .7)},${n(s * (r1 - 20) + py * lw * .7)} ${n(c * (r1 - 30) + px * lw)},${n(s * (r1 - 30) + py * lw)} Q${n(c * (r0 + 40) + px * 18)},${n(s * (r0 + 40) + py * 18)} ${n(c * r0)},${n(s * r0)} Z `;
      // corda do mastro à ponta (o mastro sai para a frente: ponto fixo um pouco à esquerda do cubo)
      cordas += `M-6,2 L${n(c * R)},${n(s * R)} `;
      const bx = -6 + (c * R + 6) * .62, by = 2 + (s * R - 2) * .62;
      buzios += elip(bx, by, 5.2, 6.4);
      bocas += elip(bx, by - 4.6, 2.6, 1.3);
    }
    return `<path d="${velas}" fill="url(#${p}vela)" stroke="#A89270" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="${varas}" stroke="#5E3E22" stroke-width="5" stroke-linecap="round"/>
      <path d="${varas}" stroke="#9A7048" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
      <path d="${cordas}" stroke="#7A6448" stroke-width="1.1" opacity=".85"/>
      <path d="${buzios}" fill="#C8693A" stroke="#7A3A1A" stroke-width="1.2"/><path d="${bocas}" fill="#4A2010"/>
      <circle r="11" fill="#6A4426" stroke="#3E2614" stroke-width="2"/><circle r="4" fill="#3E2614"/>`;
  }
  // casinha caiada com barra azul e chaminé
  function casaSVG(p) {
    return `<g>
      <ellipse cx="236" cy="616" rx="96" ry="8" fill="url(#${p}sombra)"/>
      <path d="M160,614 L160,560 L300,560 L300,614 Z" fill="url(#${p}parede)" stroke="#8A8070" stroke-width="2"/>
      <path d="M152,562 L192,530 L268,530 L308,562 Z" fill="#C8643E" stroke="#7A3218" stroke-width="2" stroke-linejoin="round"/>
      <path d="M160,548 L300,548 M170,538 L290,538" stroke="#A04A26" stroke-width="1.4" opacity=".6"/>
      <path d="M252,536 L252,512 L270,512 L270,544 Z" fill="#F6F2EA" stroke="#8A8070" stroke-width="1.6"/><path d="M249,512 L273,512" stroke="#8A8070" stroke-width="3"/>
      <rect x="160" y="604" width="140" height="10" fill="#2E6CB5"/>
      <path d="M216,614 L216,580 Q226,572 236,580 L236,614 Z" fill="#3D6E8E" stroke="#2A4A60" stroke-width="1.6"/>
      <rect x="180" y="574" width="16" height="16" fill="#4A5A70"/><rect x="178" y="572" width="20" height="20" fill="none" stroke="#2E6CB5" stroke-width="2.4"/>
      <rect x="258" y="574" width="16" height="16" fill="#4A5A70"/><rect x="256" y="572" width="20" height="20" fill="none" stroke="#2E6CB5" stroke-width="2.4"/>
      <path d="M163,610 L163,562" stroke="#FFFFFF" stroke-width="3" opacity=".8"/></g>`;
  }
  // estendal: dois postes em T e a corda (refeita a cada quadro); a roupa em grupos próprios
  const ESTENDAL = { x0: 352, x1: 590, y: 584, base: 690 };
  function estendalSVG(p) {
    const { x0, x1, y, base } = ESTENDAL;
    const poste = x => `<path d="M${x - 3},${base} L${x - 2.5},${y - 6} L${x + 2.5},${y - 6} L${x + 3},${base} Z" fill="url(#${p}madeira)" stroke="#4E3420" stroke-width="1.5"/>
      <path d="M${x - 16},${y - 4} L${x + 16},${y - 4}" stroke="#5E3E22" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="${x + 4}" cy="${base}" rx="14" ry="3.5" fill="#2E4A1A" opacity=".25"/>`;
    return `${poste(x0)}${poste(x1)}<path class="ar-corda" d="" stroke="#6A5A48" stroke-width="1.6" fill="none"/>`;
  }
  // peças de roupa (penduradas na origem, a cair para +y)
  const ROUPA = [
    { x: 384, svg: `<path d="M-26,2 L-14,-1 L14,-1 L26,2 L34,20 L22,26 L18,18 L18,62 L-18,62 L-18,18 L-22,26 L-34,20 Z" fill="#4A8ED8" stroke="#2A5A94" stroke-width="2" stroke-linejoin="round"/>
        <path d="M-8,-1 Q0,8 8,-1" stroke="#2A5A94" stroke-width="2" fill="none"/><path d="M-12,30 L-12,58" stroke="#8ABCF0" stroke-width="4" opacity=".6" stroke-linecap="round"/>
        <path d="M-14,-1 l0,-4 M14,-1 l0,-4" stroke="#C89A5A" stroke-width="3"/>` },
    { x: 446, svg: `<path d="M-18,0 L18,0 L19,70 L-19,70 Z" fill="#FFD25A" stroke="#C49A2A" stroke-width="2"/>
        <path d="M-18,14 L18,14 M-19,56 L19,56" stroke="#E8604A" stroke-width="5"/><path d="M-12,4 L-12,66" stroke="#FFF0B0" stroke-width="3" opacity=".7"/>
        <path d="M-12,0 l0,-4 M12,0 l0,-4" stroke="#C89A5A" stroke-width="3"/>` },
    { x: 498, svg: `<path d="M-7,0 L7,0 L7,28 Q8,36 16,38 Q20,44 12,46 L-2,46 Q-8,46 -7,38 Z" fill="#E8457A" stroke="#A82A52" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M-7,6 L7,6" stroke="#FFFFFF" stroke-width="3"/><path d="M0,0 l0,-4" stroke="#C89A5A" stroke-width="3"/>` },
    { x: 548, svg: `<path d="M-14,0 L14,0 L22,52 Q0,58 -22,52 Z" fill="#FFFFFF" stroke="#A0A8B4" stroke-width="2" stroke-linejoin="round"/>
        <path d="M-17,24 Q0,28 17,24 M-20,40 Q0,45 20,40" stroke="#8EC4E8" stroke-width="3" fill="none"/><circle cx="-6" cy="12" r="2.4" fill="#8EC4E8"/><circle cx="6" cy="14" r="2.4" fill="#8EC4E8"/>
        <path d="M-10,0 l0,-4 M10,0 l0,-4" stroke="#C89A5A" stroke-width="3"/>` }
  ];
  // fumo da chaminé: puffs que o vento deita
  function fumoSVG(p) { return Array.from({ length: 7 }, (_, i) => `<circle class="ar-fumo${i}" r="12" fill="url(#${p}fumo)"/>`).join(''); }
  // árvore grande à direita: tronco curvo (refeito a cada quadro) e copa num grupo que se verga
  const ARVORE = { x: 1530, base: 820, alt: 290 };
  function arvoreSVG(p) {
    const rnd = semente(61);
    let copa = '', luz = '', esc = '';
    const cl = [[0, 0, 108, 70], [-80, 30, 64, 44], [76, 26, 70, 46], [-40, -50, 66, 42], [44, -52, 62, 40], [0, 50, 80, 40]];
    for (const [x, y, rx, ry] of cl) {
      for (let k = 0; k < 6; k++) {
        const a = rnd() * TAU, d = rnd() * .6, cx = x + Math.cos(a) * rx * d, cy = y + Math.sin(a) * ry * d, r = (.38 + rnd() * .25) * rx;
        copa += elip(cx, cy, r, r * .66);
        if (Math.cos(a) < .2 && Math.sin(a) < .3) luz += elip(cx - r * .2, cy - r * .2, r * .5, r * .25);
        else esc += elip(cx + r * .1, cy + r * .25, r * .6, r * .25);
      }
    }
    return `<g>
      <ellipse cx="${ARVORE.x - 10}" cy="${ARVORE.base + 4}" rx="150" ry="16" fill="url(#${p}sombra)"/>
      <path class="ar-tronco" d="" fill="url(#${p}tronco)" stroke="#3A2A1A" stroke-width="2.4" stroke-linejoin="round"/>
      <path class="ar-ramo" d="" stroke="#5E4430" stroke-width="7" fill="none" stroke-linecap="round"/>
      <g class="ar-copa"><g class="ar-copaIn"><path d="${copa}" fill="#2E5A1A" transform="translate(0,7)"/><path d="${copa}" fill="url(#${p}copa)"/>
        <path d="${esc}" fill="#3A6A22" opacity=".5"/><path d="${luz}" fill="#A8D872" opacity=".55"/></g></g></g>`;
  }
  // vedação de madeira (postes e duas travessas) num só caminho por estilo
  function vedacaoSVG(p, x0, x1, yb, passo) {
    let postes = '', luz = '';
    for (let x = x0; x <= x1; x += passo) {
      postes += `M${n(x - 7)},${yb} L${n(x - 6)},${n(yb - 70)} L${n(x)},${n(yb - 76)} L${n(x + 6)},${n(yb - 70)} L${n(x + 7)},${yb} Z`;
      luz += `M${n(x - 3)},${n(yb - 4)} L${n(x - 2.5)},${n(yb - 66)}`;
    }
    const tab = `M${x0 - 10},${yb - 58} L${x1 + 10},${yb - 60} L${x1 + 10},${yb - 50} L${x0 - 10},${yb - 48} Z M${x0 - 10},${yb - 32} L${x1 + 10},${yb - 34} L${x1 + 10},${yb - 24} L${x0 - 10},${yb - 22} Z`;
    return `<path d="M${x0},${yb + 3} L${x1},${yb + 3}" stroke="#2E4A1A" stroke-width="7" opacity=".22"/>
      <path d="${tab}" fill="#A07A50" stroke="#5E4428" stroke-width="2"/><path d="M${x0 - 10},${yb - 57} L${x1 + 10},${yb - 59} M${x0 - 10},${yb - 31} L${x1 + 10},${yb - 33}" stroke="#D2B084" stroke-width="2" opacity=".7"/>
      <path d="${postes}" fill="url(#${p}madeira)" stroke="#4E3420" stroke-width="2"/><path d="${luz}" stroke="#C8A274" stroke-width="2" opacity=".8"/>`;
  }
  // papagaio de papel (losango de 4 cores), cauda com laços e fio até ao poste
  const PAPAGAIO = { x: 330, y: 236, poste: [92, 752] };
  function papagaioSVG() {
    return `<path class="ar-fio" d="" stroke="#F4F4F0" stroke-width="1.6" fill="none" opacity=".9"/>
      <path class="ar-caudaP" d="" stroke="#8A6A4A" stroke-width="1.6" fill="none"/>
      <path class="ar-lacos" d="" fill="#E8457A" stroke="#A82A52" stroke-width="1"/>
      <g class="ar-papagaio">
        <path d="M0,-50 L34,-8 L0,0 Z" fill="#E8403A"/><path d="M34,-8 L0,64 L0,0 Z" fill="#2E7AD0"/><path d="M0,64 L-34,-8 L0,0 Z" fill="#FFC83A"/><path d="M-34,-8 L0,-50 L0,0 Z" fill="#3EAA5A"/>
        <path d="M0,-50 L34,-8 L0,64 L-34,-8 Z" fill="none" stroke="#5A3A20" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M0,-50 L0,64 M-34,-8 L34,-8" stroke="#7A5A34" stroke-width="2"/>
        <path d="M-6,-38 L-26,-10" stroke="#FFFFFF" stroke-width="3" opacity=".45" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="3" fill="#5A3A20"/></g>`;
  }
  // chapéu de palha com fita vermelha (centrado na copa)
  function chapeuSVG() {
    return `<g class="ar-chapeu"><g class="ar-chapeuIn">
      <ellipse cx="0" cy="0" rx="34" ry="9" fill="#E6C36A" stroke="#9A7630" stroke-width="2"/>
      <path d="M-18,-1 C-18,-22 18,-22 18,-1 Z" fill="#EDCF7E" stroke="#9A7630" stroke-width="2"/>
      <path d="M-18,-5 C-8,-2 8,-2 18,-5 L18,-1 C8,2 -8,2 -18,-1 Z" fill="#D8402E"/>
      <path d="M-10,-14 C-6,-18 2,-19 6,-17" stroke="#FFF2C0" stroke-width="2.4" fill="none" opacity=".8" stroke-linecap="round"/>
      <path d="M-28,2 Q0,9 28,2" stroke="#B8923E" stroke-width="1.4" fill="none"/></g></g>`;
  }
  // aves a planar (silhuetas com corpo)
  function aveSVG(cls) {
    return `<g class="${cls}"><g class="ar-aveAsas"><path d="M0,0 C-8,-8 -20,-10 -30,-4 C-20,-5 -10,-2 -2,4 Z M0,0 C8,-8 20,-10 30,-4 C20,-5 10,-2 2,4 Z" fill="#3A3A4A"/></g>
      <ellipse cx="0" cy="1" rx="4" ry="6" fill="#2E2E3C"/></g>`;
  }
  // balão de ar quente (gomos às riscas: o mesmo gomo escalado)
  function balaoSVG() {
    const env = 'M0,-44 C28,-44 36,-20 32,0 C28,15 15,24 8,32 L-8,32 C-15,24 -28,15 -32,0 C-36,-20 -28,-44 0,-44 Z';
    return `<g class="ar-balao" display="none">
      <path d="${env}" fill="#E8403A" stroke="#8A2A1A" stroke-width="1.6"/>
      <path d="${env}" fill="#FFC83A" transform="scale(.66,1)"/><path d="${env}" fill="#2E7AD0" transform="scale(.34,1)"/>
      <path d="M-20,-34 C-28,-22 -28,-6 -22,6" stroke="#FFFFFF" stroke-width="4" fill="none" opacity=".4" stroke-linecap="round"/>
      <path d="M-8,32 L-6,44 M8,32 L6,44" stroke="#6A5A48" stroke-width="1.2"/>
      <path d="M-7,44 L7,44 L6,54 L-6,54 Z" fill="#9A6A3A" stroke="#5A3A20" stroke-width="1.4"/></g>`;
  }
  // erva alta, flores e bolas de sementes do primeiro plano (as hastes são refeitas a cada quadro)
  function primeiroPlanoSVG(p) {
    const flores = [[120, 904, 104], [420, 906, 96], [960, 908, 92], [1062, 902, 110], [1290, 906, 100], [1452, 902, 112], [690, 912, 70]];
    const bolas = [[606, 906, 150], [304, 904, 132], [1186, 906, 124]];
    let s = `<path class="ar-erva0" d="" fill="#5E9A2E"/><path class="ar-erva1" d="" fill="#7CB840"/><path class="ar-hastes" d="" stroke="#4E8A2A" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    flores.forEach((_, i) => {
      s += `<g class="ar-flor${i}"><g transform="scale(${i === 6 ? .8 : 1})">
        <path d="M-4,10 Q0,4 4,10" stroke="#4E8A2A" stroke-width="3" fill="none"/>
        ${Array.from({ length: 12 }, (_, k) => `<path d="M0,0 L-3,-15 Q0,-19 3,-15 Z" fill="#FFD22E" stroke="#D9A010" stroke-width=".8" transform="rotate(${k * 30})"/>`).join('')}
        <circle r="7" fill="#F2B414" stroke="#D08A0A" stroke-width="1"/><circle cx="-2" cy="-2" r="3" fill="#FFE68A"/></g></g>`;
    });
    bolas.forEach((_, i) => {
      s += `<g class="ar-bola${i}"><circle r="4" fill="#8AA25A"/><circle class="ar-bolaFofa" r="27" fill="url(#${p}bola)" stroke="#D8DED4" stroke-width="1"/>
        ${i === 0 ? '' : `<path d="${raiosBola(18)}" stroke="#C8D0C4" stroke-width="1.6"/><path d="${raiosBola(18)}" stroke="#FFFFFF" stroke-width=".9"/>`}</g>`;
    });
    return { s, flores, bolas };
  }
  function raiosBola(k) {
    let d = '';
    for (let i = 0; i < k; i++) { const a = i / k * TAU; d += `M${n(Math.cos(a) * 4)},${n(Math.sin(a) * 4)} L${n(Math.cos(a) * 22)},${n(Math.sin(a) * 22)} `; }
    return d;
  }

  /* ================= 4) Partículas (folhas, pétalas, sementes) e notas ================= */
  const COR_FOLHA = ['#7CB342', '#9CCC50', '#5E9A2E', '#B8C84A', '#86C04A'];
  function folhaSVG(cor) {
    return `<path d="M-14,0 C-8,-8 6,-9 14,0 C6,9 -8,8 -14,0 Z" fill="${cor}" stroke="#3E6A1E" stroke-width="1.2"/><path d="M-16,0 L12,0 M-2,0 l5,-4 M4,0 l5,-3 M-2,0 l5,4" stroke="#3E6A1E" stroke-width="1" opacity=".8"/>`;
  }
  function petalaSVG(cor) {
    return `<path d="M0,-7 C6,-7 8,1 0,7 C-8,1 -6,-7 0,-7 Z" fill="${cor}" stroke="#D07A98" stroke-width=".9"/><path d="M0,-4 L0,3" stroke="#FFFFFF" stroke-width="1.2" opacity=".6"/>`;
  }
  // semente de dente-de-leão: o penacho na origem, o grão em baixo (0,15)
  const SEMENTE = `<path d="M0,14 L0,0 M0,0 l-7,-4 M0,0 l-4,-7 M0,0 l0,-8 M0,0 l4,-7 M0,0 l7,-4" stroke="#AEB8C0" stroke-width="2" stroke-linecap="round"/>
    <path d="M0,14 L0,0 M0,0 l-7,-4 M0,0 l-4,-7 M0,0 l0,-8 M0,0 l4,-7 M0,0 l7,-4" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round"/><ellipse cx="0" cy="15.5" rx="1.4" ry="2.6" fill="#8A6A3A"/>`;
  const NOTA = `<path d="M4.5,-1 L4.5,-24 C10,-20 14,-17 12,-9" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="6" ry="4.4" transform="rotate(-20)" fill="#FFFFFF"/>
    <path d="M4.5,-1 L4.5,-24 C10,-20 14,-17 12,-9" stroke="#2E5A9A" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="5" ry="3.6" transform="rotate(-20)" fill="#2E5A9A"/>`;

  /* ================= 5) Ícone do menu (sem gradientes com id): espirais de vento, folhas e um cata-vento ================= */
  function iconeSVG() {
    const fita = (d, w) => `<path d="${d}" stroke="#7FB6E2" stroke-width="${w + 4}" fill="none" stroke-linecap="round" opacity=".55"/><path d="${d}" stroke="#FFFFFF" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
    const folha = (x, y, a, c) => `<g transform="translate(${x},${y}) rotate(${a}) scale(1.3)">${folhaSVG(c)}</g>`;
    return `<circle cx="110" cy="110" r="106" fill="#8CCBF0"/>
      <path d="M5.5,128 C40,112 90,120 130,114 C170,108 196,116 214.5,128 A106,106 0 0,1 5.5,128 Z" fill="#A8D46A"/>
      <path d="M8.4,140 C50,128 150,132 211.6,140 A106,106 0 0,1 8.4,140 Z" fill="#92C656"/>
      <path d="M13.4,154 C60,142 140,146 206.6,154 A106,106 0 0,1 13.4,154 Z" fill="#7CB442"/>
      <circle cx="110" cy="110" r="106" fill="none" stroke="#5A9ACB" stroke-width="3"/>
      ${fita('M22,72 C60,64 96,68 118,60 C140,52 146,34 132,28 C118,22 108,36 118,44', 8)}
      ${fita('M14,112 C56,106 104,112 140,100 C170,90 178,66 160,60 C144,54 136,72 150,78', 9)}
      ${fita('M34,150 C70,146 104,152 128,144 C146,138 150,124 140,120', 6)}
      ${folha(58, 92, -20, '#7CB342')}${folha(96, 132, 30, '#9CCC50')}${folha(160, 36, 60, '#5E9A2E')}
      <g transform="translate(66,52) rotate(15) scale(1.1)">${petalaSVG('#F8C8D8')}</g>
      <path d="M170,196 L168,122" stroke="#7A5A34" stroke-width="5" stroke-linecap="round"/>
      <g transform="translate(168,120) rotate(18) scale(.9)">
        <path d="M0,0 L0,-30 Q16,-26 0,0 Z" fill="#E8403A"/><path d="M0,0 L30,0 Q26,16 0,0 Z" fill="#2E7AD0"/>
        <path d="M0,0 L0,30 Q-16,26 0,0 Z" fill="#FFC83A"/><path d="M0,0 L-30,0 Q-26,-16 0,0 Z" fill="#3EAA5A"/>
        <path d="M0,0 L0,-30 Q16,-26 0,0 Z M0,0 L30,0 Q26,16 0,0 Z M0,0 L0,30 Q-16,26 0,0 Z M0,0 L-30,0 Q-26,-16 0,0 Z" fill="none" stroke="#5A3A20" stroke-width="1.6" stroke-linejoin="round"/>
        <circle r="4" fill="#5A3A20"/></g>`;
  }

  /* ================= 6) montar() ================= */
  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .4 : 1;
    const p = 'ar-';
    const PP = primeiroPlanoSVG(p);
    const N_PART = 24, N_SEM = 14, N_NOTAS = 6, N_FUMO = 7;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    const tiposPart = Array.from({ length: N_PART }, (_, i) => i < 13 ? 'folha' : i < 21 ? 'petala' : 'semente');
    const partSVG = tiposPart.map((t, i) => `<g class="ar-p${i}">${t === 'folha' ? folhaSVG(COR_FOLHA[i % COR_FOLHA.length]) : t === 'petala' ? petalaSVG(i % 2 ? '#F8C8D8' : '#FFF2F6') : SEMENTE}</g>`).join('');
    svg.innerHTML = `<defs>${defsCena(p)}</defs>
      <rect width="1600" height="660" fill="url(#${p}ceu)"/>
      <circle cx="230" cy="150" r="400" fill="url(#${p}solBrilho)"/>
      <circle cx="230" cy="150" r="46" fill="url(#${p}sol)"/>
      <path class="ar-linhasCeu" d="" fill="url(#${p}linhaCeu)"/>
      <g class="ar-nuvens">${nuvemSVG(0, 1)}${nuvemSVG(1, .7)}${nuvemSVG(2, .9)}${nuvemSVG(3, .55)}${nuvemSVG(4, .75)}</g>
      ${balaoSVG()}
      <g class="ar-aves">${aveSVG('ar-ave0')}${aveSVG('ar-ave1')}${aveSVG('ar-ave2')}</g>
      <g class="ar-bando" display="none">${Array.from({ length: 7 }, (_, i) => aveSVG('ar-bd' + i)).join('')}</g>
      ${longeSVG(p)}
      ${outeiroSVG(p)}
      ${choupoSVG(4, 1076, 560, .8)}${choupoSVG(5, 1106, 530, .9)}${choupoSVG(6, 1440, 418, .7)}
      ${moinhoSVG(p)}
      <g class="ar-velas">${velasSVG(p)}</g>
      <g class="ar-borrao" opacity="0"><circle cx="${MOINHO.hx}" cy="${MOINHO.hy}" r="${MOINHO.R * .72}" fill="none" stroke="#FFF6E2" stroke-width="${MOINHO.R * .62}" transform="translate(${MOINHO.hx},${MOINHO.hy}) scale(.86,1) translate(${-MOINHO.hx},${-MOINHO.hy})"/>
        <circle cx="${MOINHO.hx}" cy="${MOINHO.hy}" r="${MOINHO.R * .98}" fill="none" stroke="#8A6A48" stroke-width="3" stroke-dasharray="14 22" transform="translate(${MOINHO.hx},${MOINHO.hy}) scale(.86,1) translate(${-MOINHO.hx},${-MOINHO.hy})"/></g>
      <g class="ar-notas">${Array.from({ length: N_NOTAS }, (_, i) => `<g class="ar-nota${i}" display="none">${NOTA}</g>`).join('')}</g>
      ${meioSVG(p)}
      ${choupoSVG(0, 34, 560, 1)}${choupoSVG(1, 72, 552, 1.15)}${choupoSVG(2, 112, 560, .95)}${choupoSVG(3, 640, 566, .7)}
      ${casaSVG(p)}
      <g class="ar-fumos">${fumoSVG(p)}</g>
      <path d="M0,668 C200,652 420,664 640,658 C860,652 1080,664 1300,656 C1440,650 1540,656 1600,654 L1600,900 L0,900 Z" fill="url(#${p}prado)"/>
      <path d="M0,668 C200,652 420,664 640,658 C860,652 1080,664 1300,656 C1440,650 1540,656 1600,654" stroke="#C8E890" stroke-width="3" fill="none" opacity=".55"/>
      <g class="ar-brilhos">${Array.from({ length: 6 }, (_, i) => `<ellipse class="ar-brilho${i}" rx="170" ry="12" fill="url(#${p}brilho)"/>`).join('')}</g>
      <g class="ar-ervaMeio"></g>
      <g class="ar-estendal">${estendalSVG(p)}${ROUPA.map((r, i) => `<g class="ar-roupa${i}"><g class="ar-roupaIn">${r.svg}</g></g>`).join('')}</g>
      ${arvoreSVG(p)}
      ${vedacaoSVG(p, -10, 500, 826, 102)}${vedacaoSVG(p, 1120, 1620, 834, 100)}
      ${chapeuSVG()}
      ${papagaioSVG()}
      <g class="ar-ar">
        <rect class="ar-toque" x="500" y="300" width="600" height="500" fill="#FFFFFF" opacity="0"/>
        <ellipse class="ar-sombraV" cx="${BASE_X}" cy="${BASE_Y + 4}" rx="150" ry="22" fill="url(#${p}sombraVento)"/>
        <path class="ar-haloT" d="" fill="url(#${p}halo)"/>
        <path class="ar-nucleoT" d="" fill="url(#${p}nucleo)" opacity=".5"/>
        <g class="ar-partTras"></g>
        <path class="ar-corpo" d="" fill="url(#${p}corpo)"/>
        <g class="ar-partFrente">${partSVG}</g>
        <path class="ar-haloF" d="" fill="url(#${p}halo)"/>
        <path class="ar-nucleoF" d="" fill="url(#${p}nucleo)" stroke="#8CC2EA" stroke-width="1.1" stroke-opacity=".55"/>
        <path class="ar-caracoisH" d="" fill="#B4DCFA" opacity=".35"/>
        <path class="ar-caracois" d="" fill="url(#${p}caracol)" stroke="#8CC2EA" stroke-width="1" stroke-opacity=".5"/>
        <g class="ar-folhaG" display="none"><g transform="scale(2.8)">${folhaSVG('#8CC440')}</g></g>
      </g>
      ${PP.s}
      <g class="ar-sementes">${Array.from({ length: N_SEM }, (_, i) => `<g class="ar-s${i}">${SEMENTE}</g>`).join('')}</g>
      <rect width="1600" height="900" fill="url(#${p}luzQuente)" pointer-events="none"/>
      <rect width="1600" height="900" fill="url(#${p}vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s);
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; if (v == null) el.removeAttribute(nome); else el.setAttribute(nome, v); } }

    /* --- erva do meio: três faixas paradas que ondulam com skewX (um caminho por faixa) --- */
    (() => {
      const rnd = semente(31);
      const faixas = [[668, 700, .6, '#6EA63C'], [694, 734, .8, '#5E9A32'], [726, 776, 1, '#6AA436']];
      let s = '';
      faixas.forEach(([y0, y1, k, cor], i) => {
        let d = '', d2 = '';
        for (let j = 0; j < 150; j++) {
          const x = rnd() * 1660 - 30, y = y0 + rnd() * (y1 - y0), h = (9 + rnd() * 10) * k, inc = (rnd() - .3) * 5 * k;
          d += `M${n(x - 1.6 * k)},${n(y)} Q${n(x + inc * .4)},${n(y - h * .6)} ${n(x + inc)},${n(y - h)} Q${n(x + inc * .4 + 1)},${n(y - h * .5)} ${n(x + 1.6 * k)},${n(y)} Z`;
          if (rnd() < .2) d2 += elip(x + inc, y - h, 2.4 * k, 2.4 * k);
        }
        s += `<g class="ar-faixa${i}"><path d="${d}" fill="${cor}" opacity=".9"/><path d="${d2}" fill="${i === 1 ? '#FFFFFF' : '#FFE04A'}" opacity=".85"/></g>`;
      });
      q('.ar-ervaMeio').innerHTML = s;
    })();

    /* --- referências --- */
    const R = {
      ar: q('.ar-ar'), sombraV: q('.ar-sombraV'), haloT: q('.ar-haloT'), nucleoT: q('.ar-nucleoT'), corpo: q('.ar-corpo'),
      haloF: q('.ar-haloF'), nucleoF: q('.ar-nucleoF'), carH: q('.ar-caracoisH'), car: q('.ar-caracois'), linhasCeu: q('.ar-linhasCeu'),
      partTras: q('.ar-partTras'), partFrente: q('.ar-partFrente'), sementesG: q('.ar-sementes'), folhaG: q('.ar-folhaG'),
      nuvens: [0, 1, 2, 3, 4].map(i => q('.ar-nuvem' + i)), aves: [0, 1, 2].map(i => q('.ar-ave' + i)),
      avesAsas: [0, 1, 2].map(i => q('.ar-ave' + i + ' .ar-aveAsas')),
      bando: q('.ar-bando'), bd: Array.from({ length: 7 }, (_, i) => q('.ar-bd' + i)), bdAsas: Array.from({ length: 7 }, (_, i) => q('.ar-bd' + i + ' .ar-aveAsas')),
      balao: q('.ar-balao'), velas: q('.ar-velas'), borrao: q('.ar-borrao'), notas: Array.from({ length: N_NOTAS }, (_, i) => q('.ar-nota' + i)),
      choupos: Array.from({ length: 7 }, (_, i) => q('.ar-choupo' + i + ' .ar-choupoIn')),
      fumos: Array.from({ length: N_FUMO }, (_, i) => q('.ar-fumo' + i)),
      brilhos: Array.from({ length: 6 }, (_, i) => q('.ar-brilho' + i)), faixas: [0, 1, 2].map(i => q('.ar-faixa' + i)),
      corda: q('.ar-corda'), roupa: ROUPA.map((_, i) => q('.ar-roupa' + i)), roupaIn: ROUPA.map((_, i) => q('.ar-roupa' + i + ' .ar-roupaIn')),
      tronco: q('.ar-tronco'), ramo: q('.ar-ramo'), copa: q('.ar-copa'), copaIn: q('.ar-copaIn'),
      chapeu: q('.ar-chapeu'), chapeuIn: q('.ar-chapeuIn'),
      fio: q('.ar-fio'), caudaP: q('.ar-caudaP'), lacos: q('.ar-lacos'), papagaio: q('.ar-papagaio'),
      erva: [q('.ar-erva0'), q('.ar-erva1')], hastes: q('.ar-hastes'),
      flores: PP.flores.map((_, i) => q('.ar-flor' + i)), bolas: PP.bolas.map((_, i) => q('.ar-bola' + i)), bolaFofa: q('.ar-bola0 .ar-bolaFofa')
    };

    /* --- estado --- */
    let tempo = 0, vivo = true, semEventos = false;
    const G = { tam: 1, inc: 30, ond: 14, t: 0 };   // geometria do redemoinho neste quadro
    const S = { V: .8, Vs: .8, fase: 0, giro: 2, moinho: 0, nuvem: 0, papX: PAPAGAIO.x, papY: PAPAGAIO.y };

    /* --- envelopes: efeitos que se somam e se apagam sozinhos (interromper nunca deixa nada partido) --- */
    const envs = [];
    const E = { vento: 0, calma: 0, tam: 0, giro: 0, inclina: 0, sobe: 0, alarga: 0, moinho: 0 };
    function impulso(chave, amp, dur, tipo) { envs.push({ chave, amp, dur, t: 0, tipo: tipo || 'sino' }); }
    function forma(e) {
      const u = limita(e.t / e.dur, 0, 1);
      if (e.tipo === 'sino') return sino(u);
      if (e.tipo === 'plato') return passoS(0, .2, u) * (1 - passoS(.8, 1, u));
      if (e.tipo === 'ataque') { const a = Math.min(.3, 90 / e.dur); return u < a ? esai(u / a) : 1 - eseno((u - a) / (1 - a)); }
      if (e.tipo === 'mola') { const a = Math.min(.3, 110 / e.dur); if (u < a) return esai(u / a); const w = (u - a) / (1 - a); return Math.cos(w * PI * 1.6) * Math.pow(1 - w, 1.6); }
      return 0;
    }
    function atualizarEnvs(dt) {
      for (const k in E) E[k] = 0;
      for (let i = envs.length - 1; i >= 0; i--) {
        const e = envs[i]; e.t += dt;
        if (e.t >= e.dur) { envs.splice(i, 1); continue; }
        E[e.chave] += e.amp * forma(e);
      }
      // toques seguidos somam efeitos: limitar para nada sair do sítio
      E.tam = limita(E.tam, -.2, .3); E.giro = limita(E.giro, 0, 7); E.inclina = limita(E.inclina, -110, 190);
      E.vento = limita(E.vento, 0, 1.2); E.moinho = limita(E.moinho, 0, 13); E.sobe = limita(E.sobe, -.3, .4); E.alarga = limita(E.alarga, 0, .45);
    }

    /* --- vento: intensidade lenta + rajadas que atravessam o ecrã da esquerda para a direita --- */
    const rajadas = [];   // { x, vel, amp, larg }
    function rajadaEm(x) { let s = 0; for (const r of rajadas) { const d = (x - r.x) / r.larg; s += r.amp * Math.exp(-d * d); } return s; }
    function ventoEm(x) { const t = tempo / 1000; return Math.min(2.6, S.Vs + Math.min(1.8, rajadaEm(x)) + .1 * Math.sin(t * 2.3 - x * .006) * S.Vs); }
    function atualizarVento(dt) {
      const t = tempo / 1000;
      const base = .82 + .16 * Math.sin(t * .23) + .1 * Math.sin(t * .61 + 1.7) + .05 * Math.sin(t * 1.7);
      S.V = limita((base + E.vento) * (1 + E.calma), .12, 2.6);
      S.Vs += (S.V - S.Vs) * Math.min(1, dt / 220);
      for (let i = rajadas.length - 1; i >= 0; i--) { const r = rajadas[i]; r.x += r.vel * dt / 1000 * calma; if (r.x - r.larg * 2 > 1700) rajadas.splice(i, 1); }
    }

    /* --- fitas do redemoinho: hélices que sobem à volta do funil, se desenrolam e se apagam --- */
    const fitas = [];
    function novaFita(f, inicio) {
      f.h0 = aleat(-.03, .72); f.dh = aleat(.16, .36); f.voltas = aleat(.75, 1.3); f.fase0 = aleat(0, TAU);
      f.larg = aleat(10, 22); f.dur = aleat(2600, 4400); f.idade = inicio ? aleat(0, f.dur) : 0; f.vel = aleat(.85, 1.15);
      return f;
    }
    for (let i = 0; i < 14; i++) fitas.push(novaFita({ fixa: false }, true));
    // duas fitas que nunca se apagam: o anel do chão (erva e pó a rodar) e o anel largo de cima
    fitas.push({ fixa: true, h0: .0, dh: .07, voltas: 1.15, fase0: 0, larg: 13, vel: 1.25 });
    fitas.push({ fixa: true, h0: .84, dh: .12, voltas: 1.08, fase0: 2, larg: 16, vel: .95 });
    function pontosFita(f) {
      // janela visível [sa, sb] da fita (desenrola-se pela cabeça e apaga-se pela cauda)
      let sa = 0, sb = 1;
      if (!f.fixa) { const u = f.idade / f.dur; sb = esai(limita(u / .55, 0, 1)); sa = eseno(limita((u - .45) / .55, 0, 1)); }
      if (sb - sa < .02) return [];
      const N = Math.max(3, Math.ceil((sb - sa) * f.voltas * 34));
      const pts = [];
      for (let k = 0; k <= N; k++) {
        const s = lerp(sa, sb, k / N);
        const h = limita(f.h0 + f.dh * s, -.02, 1.04);
        const th = f.fase0 - S.fase * f.vel - f.voltas * TAU * s;
        const [cx, cy, r] = funil(h, G);
        const rr = r * (1 + E.alarga * .25);
        const fim = Math.min(1, (s - sa) / .07, (sb - s) / .07);
        const w = f.larg * Math.pow(Math.max(0, Math.sin(PI * s)), .45) * (f.fixa ? 1 : Math.max(0, fim)) * (.75 + .25 * G.tam) * (.8 + .4 * h);
        pts.push([cx + rr * Math.cos(th), cy + rr * ELI * Math.sin(th), w, Math.sin(th)]);
      }
      return pts;
    }
    // separa a linha em pedaços da frente (sin > 0) e de trás, com o ponto de fronteira nos dois
    function separar(pts, frente, tras) {
      if (!pts.length) return;
      let cur = [pts[0]], lado = pts[0][3] >= 0;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], lb = b[3] >= 0;
        if (lb !== lado) {
          const u = a[3] / (a[3] - b[3]);
          const m = [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u), 0];
          cur.push(m); (lado ? frente : tras).push(cur);
          cur = [m]; lado = lb;
        }
        cur.push(b);
      }
      (lado ? frente : tras).push(cur);
    }
    function desenharRedemoinho() {
      const frente = [], tras = [];
      for (const f of fitas) separar(pontosFita(f), frente, tras);
      let dHT = '', dNT = '', dHF = '', dNF = '';
      for (const pc of tras) { dHT += contornoFita(pc, 2.3, .55); dNT += contornoFita(pc, 1, .7); }
      for (const pc of frente) { dHF += contornoFita(pc, 2.3, .55); dNF += contornoFita(pc, 1, .7); }
      atr(R.haloT, 'd', dHT); atr(R.nucleoT, 'd', dNT); atr(R.haloF, 'd', dHF); atr(R.nucleoF, 'd', dNF);
      // corpo do funil: um véu muito leve, mais opaco nas bordas
      const esq = [], dir = [];
      for (let k = 0; k <= 10; k++) {
        const h = k / 10 * .98, [cx, cy, r] = funil(h, G), rr = r * (1 + E.alarga * .25);
        esq.push([cx - rr, cy]); dir.push([cx + rr, cy]);
      }
      const [tx, ty, tr] = funil(.98, G), trr = tr * (1 + E.alarga * .25);
      let d = linhaPor(esq);
      d += `A${n(trr)},${n(trr * ELI)} 0 0,1 ${n(tx + trr)},${n(ty)}`;
      d += linhaPor(dir.slice().reverse()).replace(/^M/, 'L');
      const [bx, by, br] = funil(0, G);
      d += `A${n(br)},${n(br * ELI)} 0 0,1 ${n(bx - br)},${n(by)}Z`;
      atr(R.corpo, 'd', d);
      poe(R.sombraV, `translate(${n(bx - BASE_X)},0) scale(${n3(G.tam * (1 + .1 * Math.sin(S.fase * 2)))},1)`);
    }

    /* --- caracóis de vento: linha que se desenrola e acaba em espiral (à volta do redemoinho e no céu) --- */
    const caracois = [], linhasCeu = [];
    function novoCaracol(lista, o) {
      const x0 = o.x, y0 = o.y, L = o.L, Rr = o.R, voltas = o.voltas || 1.25, A = o.A != null ? o.A : 14;
      const pts = [];
      const N1 = 18, N2 = Math.ceil(voltas * 22);
      const ondaF = aleat(.6, 1.2), fase0 = aleat(0, TAU);
      for (let i = 0; i <= N1; i++) { const u = i / N1; pts.push([x0 + L * u, y0 + A * Math.sin(u * PI * ondaF + fase0) - A * Math.sin(fase0)]); }
      const e = pts[N1], a = pts[N1 - 1];
      const ang = Math.atan2(e[1] - a[1], e[0] - a[0]);
      const sgn = o.baixo ? -1 : 1;                   // enrola para cima (1) ou para baixo (−1)
      const cx = e[0] + Rr * Math.sin(ang) * sgn, cy = e[1] - Rr * Math.cos(ang) * sgn;
      const phi0 = Math.atan2(e[1] - cy, e[0] - cx);
      for (let i = 1; i <= N2; i++) {
        const b = i / N2 * voltas * TAU, rho = Rr * (1 - .8 * i / N2);
        pts.push([cx + rho * Math.cos(phi0 - b * sgn), cy + rho * Math.sin(phi0 - b * sgn)]);
      }
      lista.push({ pts, w: o.w, idade: 0, dur: o.dur, vx: o.vx, vy: o.vy || 0 });
    }
    function contornoCaracol(c, fator) {
      const u = c.idade / c.dur;
      const sb = esai(limita(u / .5, 0, 1)), sa = eseno(limita((u - .42) / .58, 0, 1));
      const m = c.pts.length - 1;
      const i0 = sa * m, i1 = sb * m;
      if (i1 - i0 < 1.2) return '';
      const dx = c.vx * c.idade / 1000, dy = c.vy * c.idade / 1000;
      const pts = [];
      const passo = Math.max(1, (i1 - i0) / 40);
      for (let f = i0; f <= i1 + 1e-6; f += passo) {
        const k = Math.min(m - 1, Math.floor(f)), t = f - k;
        const a = c.pts[k], b = c.pts[k + 1];
        const s = f / m;
        const w = c.w * Math.pow(Math.sin(PI * Math.min(.999, Math.max(.001, s * .92 + .04))), .6) * Math.min(1, (f - i0) / 4 + .15, (i1 - f) / 3 + .1);
        pts.push([lerp(a[0], b[0], t) + dx, lerp(a[1], b[1], t) + dy, w]);
      }
      return contornoFita(pts, fator, 0);
    }
    function atualizarCaracois(dt) {
      for (const lista of [caracois, linhasCeu]) for (let i = lista.length - 1; i >= 0; i--) { lista[i].idade += dt * calma * (.7 + .4 * S.Vs); if (lista[i].idade >= lista[i].dur) lista.splice(i, 1); }
      // à volta do redemoinho há sempre alguns caracóis a nascer
      prox.caracol -= dt * (.6 + .5 * S.Vs);
      if (prox.caracol <= 0 && caracois.length < 6) {
        prox.caracol = aleat(500, 1000);
        const lado = Math.random();
        if (lado < .55) novoCaracol(caracois, { x: aleat(470, 600), y: aleat(380, 720), L: aleat(110, 200), R: aleat(26, 46), w: aleat(9, 14), dur: aleat(2200, 3000), vx: 60 * S.Vs, baixo: Math.random() < .3 });
        else novoCaracol(caracois, { x: aleat(860, 960), y: aleat(360, 700), L: aleat(100, 170), R: aleat(24, 40), w: aleat(8, 12), dur: aleat(2000, 2800), vx: 70 * S.Vs, baixo: Math.random() < .5 });
      }
      prox.linha -= dt * (.6 + .5 * S.Vs);
      if (prox.linha <= 0 && linhasCeu.length < 3) {
        prox.linha = aleat(1600, 3200);
        novoCaracol(linhasCeu, { x: aleat(-150, 1100), y: aleat(110, 440), L: aleat(280, 460), R: aleat(18, 30), w: aleat(4, 6), dur: aleat(3600, 5000), vx: 90 * S.Vs, A: 10, baixo: Math.random() < .4 });
      }
      let dH = '', dC = '';
      for (const c of caracois) { dH += contornoCaracol(c, 2.4); dC += contornoCaracol(c, 1); }
      atr(R.carH, 'd', dH); atr(R.car, 'd', dC);
      let dL = '';
      for (const c of linhasCeu) dL += contornoCaracol(c, 1);
      atr(R.linhasCeu, 'd', dL);
    }
    const prox = { caracol: 300, linha: 800 };

    /* --- partículas: folhas, pétalas e sementes a rodopiar (órbita) ou soltas (levadas pelo vento) --- */
    const parts = tiposPart.map((tipo, i) => ({
      tipo, el: q('.ar-p' + i), cam: 'frente',
      h: aleat(.05, .95), hAlvo: aleat(.05, .95), th: aleat(0, TAU), wf: aleat(.55, .9), rf: aleat(.62, 1.05),
      rot: aleat(0, 360), rotV: aleat(-200, 200), spin: aleat(0, TAU), spinV: aleat(2, 6) * (Math.random() < .5 ? -1 : 1),
      k: tipo === 'folha' ? aleat(1.5, 2) : tipo === 'petala' ? aleat(1.4, 1.9) : aleat(1.3, 1.6),
      m: 1, solto: 0, fx: 0, fy: 0, vx: 0, vy: 0, ox: 0, oy: 0, troca: aleat(1500, 4000), x: 0, y: 0, preso: false, op: 1
    }));
    // sementes da bola de dente-de-leão do primeiro plano (presas até uma variação as soltar)
    const sementes = Array.from({ length: N_SEM }, (_, i) => ({
      tipo: 'semente', el: q('.ar-s' + i), cam: 'primeiro', ang: i / N_SEM * TAU + .2,
      h: .1, hAlvo: aleat(.2, .8), th: 0, wf: aleat(.6, .9), rf: aleat(.7, 1.05), rot: 0, rotV: 0, spin: 0, spinV: 0, k: 1.05,
      m: 0, solto: 0, fx: 0, fy: 0, vx: 0, vy: 0, ox: 0, oy: 0, troca: 3000, x: 0, y: 0, preso: true, op: 1, vida: 0, cresce: 1
    }));
    const grupos = { tras: R.partTras, frente: R.partFrente, primeiro: R.sementesG };
    function camada(pt, nova) { if (pt.cam !== nova) { grupos[nova].appendChild(pt.el); pt.cam = nova; } }
    function soltar(pt, vx, vy, ms) { pt.fx = pt.x; pt.fy = pt.y; pt.vx = vx; pt.vy = vy; pt.solto = ms; pt.m = 0; }
    function orbita(pt, dt) {
      pt.troca -= dt;
      if (pt.troca <= 0) { pt.troca = aleat(1800, 4500); pt.hAlvo = aleat(.04, .96); }
      const alvo = limita(pt.hAlvo + E.sobe, .02, 1.02);
      pt.h += (alvo - pt.h) * Math.min(1, dt / 1400);
      pt.th -= S.giro * pt.wf * dt / 1000;
      const [cx, cy, r] = funil(pt.h, G);
      const rr = r * pt.rf * (1 + E.alarga * .45);
      const nx = cx + rr * Math.cos(pt.th), ny = cy + rr * ELI * Math.sin(pt.th) + 6 * Math.sin(tempo * .003 + pt.wf * 9);
      const vox = (nx - pt.ox) / Math.max(1, dt) * 1000, voy = (ny - pt.oy) / Math.max(1, dt) * 1000;
      pt.ox = nx; pt.oy = ny;
      return [vox, voy];
    }
    function livre(pt, dt) {
      const s = dt / 1000;
      const W = ventoEm(pt.fx);
      const alvoVx = (110 + 160 * W) * calma, alvoVy = -20 + 40 * Math.sin(tempo * .002 + pt.wf * 7) + (pt.tipo === 'semente' ? -10 : 30);
      pt.vx += (alvoVx - pt.vx) * Math.min(1, s * 1.6);
      pt.vy += (alvoVy - pt.vy) * Math.min(1, s * 1.2);
      pt.fx += pt.vx * s; pt.fy += pt.vy * s;
    }
    function atualizarParticula(pt, dt) {
      const [vox, voy] = orbita(pt, dt);
      if (pt.solto > 0) {
        pt.solto -= dt; pt.m = Math.max(0, pt.m - dt / 160);
        livre(pt, dt);
      } else if (pt.m < 1) {
        livre(pt, dt);
        pt.m = Math.min(1, pt.m + dt / 1100);
      } else { pt.fx = pt.ox; pt.fy = pt.oy; pt.vx = vox; pt.vy = voy; }
      const e = eseno(pt.m);
      pt.x = lerp(pt.fx, pt.ox, e); pt.y = lerp(pt.fy, pt.oy, e);
      const prof = Math.sin(pt.th);
      pt.spin += pt.spinV * dt / 1000 * (.5 + .6 * S.Vs);
      pt.rot += pt.rotV * dt / 1000 * (.5 + .6 * S.Vs);
      const esc = pt.k * (1 + .2 * prof * e);
      let sx = Math.cos(pt.spin); sx = (sx < 0 ? -1 : 1) * Math.max(.18, Math.abs(sx));
      const rot = pt.tipo === 'semente' ? 25 * Math.sin(pt.spin * .5) + (pt.vx - 100) * .03 : pt.rot;
      if (pt.tipo === 'semente') sx = 1;
      poe(pt.el, `translate(${n(pt.x)},${n(pt.y)}) rotate(${n(rot)}) scale(${n3(esc * sx)},${n3(esc)})`);
      return e > .5 ? (prof < 0 ? 'tras' : 'frente') : 'frente';
    }
    function atualizarParticulas(dt) {
      for (const pt of parts) camada(pt, atualizarParticula(pt, dt));
      // sementes da bola
      const bola = bolaPos[0];
      let presas = 0;
      for (const sm of sementes) {
        if (sm.preso) {
          presas++;
          sm.cresce = Math.min(1, sm.cresce + dt / 1500);
          const a = sm.ang + bola.inc;
          sm.x = bola.x + Math.cos(a) * 15; sm.y = bola.y + Math.sin(a) * 15;
          camada(sm, 'primeiro');
          poe(sm.el, `translate(${n(bola.x)},${n(bola.y)}) rotate(${n(a * GRAU + 90)}) translate(0,-15) scale(${n3(sm.cresce)})`);
          atr(sm.el, 'opacity', n3(sm.cresce));
          continue;
        }
        sm.vida += dt;
        if (sm.vida > sm.fimOrbita && sm.solto <= 0 && sm.m >= 1) soltar(sm, aleat(200, 320), aleat(-160, -90), 1e9);   // sai pelo topo e vai-se embora
        const cam = atualizarParticula(sm, dt);
        camada(sm, sm.m > .5 ? cam : 'frente');
        const fora = sm.x > 1700 || sm.y < -40 || sm.vida > sm.fimOrbita + 6000;
        if (fora) { sm.preso = true; sm.cresce = 0; sm.solto = 0; sm.m = 0; }
        atr(sm.el, 'opacity', '1');
      }
      atr(R.bolaFofa, 'opacity', n3(.25 + .75 * presas / N_SEM));
      atr(R.bolaFofa, 'r', n(12 + 15 * presas / N_SEM));
    }
    function soltarSementes() {
      if (sementes.some(s => !s.preso)) return false;
      sementes.forEach((sm, i) => {
        sm.preso = false; sm.vida = -i * 70; sm.fimOrbita = aleat(7000, 10000);
        sm.h = aleat(.1, .4); sm.hAlvo = aleat(.2, .85); sm.th = aleat(0, TAU); sm.ox = sm.x; sm.oy = sm.y;
        sm.spin = aleat(0, TAU); sm.spinV = aleat(1.5, 3);
        soltar(sm, aleat(90, 170), aleat(-170, -90), aleat(350, 750) + i * 60);
      });
      return true;
    }

    /* --- primeiro plano: erva alta, flores e bolas de sementes que se dobram com o vento local --- */
    const laminas = (() => {
      const rnd = semente(81), v = [];
      for (let i = 0; i < 170; i++) {
        const y = 800 + rnd() * 112, x = rnd() * 1660 - 30, k = .55 + (y - 800) / 112 * .7;
        v.push({ x, y, h: (40 + rnd() * 70) * k, w: (3.4 + rnd() * 2) * k, c: rnd() < .5 ? 0 : 1, f: rnd() * TAU, inc: (rnd() - .5) * .25 });
      }
      return v;
    })();
    const bolaPos = PP.bolas.map(() => ({ x: 0, y: 0, inc: 0 }));
    function dobra(x, rigidez, f) {
      const t = tempo / 1000;
      const W = ventoEm(x);
      const giro = .28 * Math.sin(S.fase * 1.3 + x * .05) * Math.exp(-Math.pow((x - G.cx0) / 130, 2));   // a erva roda ao pé do redemoinho
      return limita((.1 + .36 * W + .1 * Math.sin(t * 2.8 - x * .012 + f) * (.5 + S.Vs) + giro) * rigidez * calma, -.5, 1.3);
    }
    function desenharPrimeiroPlano() {
      const d = ['', ''];
      for (const l of laminas) {
        const a = dobra(l.x, 1, l.f) + l.inc;
        const tx = l.x + Math.sin(a) * l.h, ty = l.y - Math.cos(a) * l.h;
        const mx = l.x + Math.sin(a * .45) * l.h * .55, my = l.y - Math.cos(a * .45) * l.h * .55;
        d[l.c] += `M${n(l.x - l.w)},${n(l.y)}Q${n(mx - l.w * .4)},${n(my)} ${n(tx)},${n(ty)}Q${n(mx + l.w * .5)},${n(my)} ${n(l.x + l.w)},${n(l.y)}Z`;
      }
      atr(R.erva[0], 'd', d[0]); atr(R.erva[1], 'd', d[1]);
      let hs = '';
      const haste = (x, y, h, rig, f) => {
        const a = dobra(x, rig, f);
        const tx = x + Math.sin(a) * h, ty = y - Math.cos(a) * h;
        const mx = x + Math.sin(a * .4) * h * .55, my = y - Math.cos(a * .4) * h * .55;
        hs += `M${n(x)},${n(y)}Q${n(mx)},${n(my)} ${n(tx)},${n(ty)}`;
        return [tx, ty, a];
      };
      PP.flores.forEach(([x, y, h], i) => { const [tx, ty, a] = haste(x, y, h, .55, i); poe(R.flores[i], `translate(${n(tx)},${n(ty)}) rotate(${n(a * GRAU * .7)})`); });
      PP.bolas.forEach(([x, y, h], i) => {
        const [tx, ty, a] = haste(x, y, h, .5, i + 3);
        bolaPos[i].x = tx; bolaPos[i].y = ty; bolaPos[i].inc = a * .6;
        poe(R.bolas[i], `translate(${n(tx)},${n(ty)}) rotate(${n(a * GRAU * .6)})`);
      });
      atr(R.hastes, 'd', hs);
    }

    /* --- cenário vivo: nuvens, aves, moinho, roupa, papagaio, árvores, fumo, brilhos na erva --- */
    const fumos = Array.from({ length: N_FUMO }, (_, i) => ({ idade: i / N_FUMO * 3200, x: 0, y: 0, vx: 0, vy: 0 }));
    const notas = Array.from({ length: N_NOTAS }, () => ({ vivo: false, idade: 0, x: 0, y: 0, vx: 0, vy: 0, f: 0 }));
    function soltarNota() {
      const nt = notas.find(v => !v.vivo); if (!nt) return;
      const a = aleat(0, TAU);
      nt.vivo = true; nt.idade = 0; nt.x = MOINHO.hx + Math.cos(a) * MOINHO.R * .7; nt.y = MOINHO.hy + 30 + Math.abs(Math.sin(a)) * MOINHO.R * .5;
      nt.vx = aleat(-20, 60); nt.vy = aleat(-70, -40); nt.f = aleat(0, TAU);
    }
    function animarCena(dt) {
      const t = tempo / 1000, s = dt / 1000;
      // nuvens: correm para a direita ao ritmo do vento
      S.nuvem += s * (10 + 26 * S.Vs) * calma;
      R.nuvens.forEach((g, i) => {
        const y = [120, 196, 92, 250, 160][i], x0 = [160, 760, 1260, 480, 1500][i], v = [1, .75, 1.15, .6, .9][i];
        const x = -280 + ((x0 + 280 + S.nuvem * v) % 2160);
        poe(g, `translate(${n(x)},${y})`);
      });
      // aves a planar: voltas largas, quase sem bater as asas
      R.aves.forEach((g, i) => {
        const a = t * (.16 + i * .04) * calma + i * 2.2;
        const c = [[420, 230], [1180, 170], [1380, 300]][i], rx = [130, 160, 110][i];
        const x = c[0] + Math.cos(a) * rx + 20 * S.Vs, y = c[1] + Math.sin(a * 1.4) * 26;
        const bate = Math.sin(t * .7 + i * 3) > .82 ? Math.sin(t * 14) : 0;
        poe(g, `translate(${n(x)},${n(y)}) rotate(${n(8 * Math.cos(a))}) scale(${n3(.75 + .1 * i)})`);
        poe(R.avesAsas[i], `scale(1,${n3(.8 + .25 * Math.sin(t * 1.3 + i) + .7 * bate)})`);
      });
      // moinho: as velas rodam com o vento do sítio dele (e muito depressa quando os búzios cantam)
      const Wm = ventoEm(MOINHO.hx);
      const wMoinho = (.5 + .9 * Wm + E.moinho) * calma;
      S.moinho += s * wMoinho;
      atr(R.borrao, 'opacity', n3(.55 * passoS(3, 8, wMoinho)));   // muito depressa, as velas fazem um disco desfocado
      poe(R.velas, `translate(${MOINHO.hx},${MOINHO.hy}) scale(.86,1) rotate(${n(S.moinho * GRAU)})`);
      // choupos: dobram-se com skewX à volta da base
      R.choupos.forEach((g, i) => {
        const x = [34, 72, 112, 640, 1076, 1106, 1440][i], W = ventoEm(x);
        poe(g, `skewX(${n3((-4 - 9 * W - 2.5 * Math.sin(t * 2.1 + i * 1.3) * W) * calma)})`);
      });
      // erva do meio
      R.faixas.forEach((g, i) => {
        const yb = [700, 734, 776][i], W = ventoEm(400 + 400 * i);
        poe(g, `translate(0,${yb}) skewX(${n3((-6 * W - 3 * Math.sin(t * 1.6 - i * .8) * W) * calma)}) translate(0,${-yb})`);
      });
      // brilhos na erva: o vento a pentear o prado
      R.brilhos.forEach((g, i) => {
        const y = [690, 740, 780, 710, 760, 676][i], v = [1, .8, 1.2, .9, 1.1, .7][i];
        const x = -260 + ((i * 377 + S.nuvem * 9 * v) % 2120);
        poe(g, `translate(${n(x)},${y}) scale(${n3(.7 + .3 * Math.sin(t * .5 + i))},1)`);
        atr(g, 'opacity', n3(.4 + .5 * limita(S.Vs - .3, 0, 1.2)));
      });
      // estendal: a corda baloiça e a roupa esvoaça para a direita
      const { x0, x1, y } = ESTENDAL;
      const Wc = ventoEm((x0 + x1) / 2);
      const sag = 18 + 4 * Math.sin(t * 3.1) * Wc - 4 * Wc, lado = 6 * Wc;
      const cordaY = x => { const u = (x - x0) / (x1 - x0); return y + sag * 4 * u * (1 - u); };
      atr(R.corda, 'd', `M${x0},${y} Q${n((x0 + x1) / 2 + lado)},${n(y + sag * 2)} ${x1},${y}`);
      ROUPA.forEach((r, i) => {
        const W = ventoEm(r.x);
        const ang = -(10 + 30 * W + 9 * Math.sin(t * (5 + i * .7) + i * 2) * W) * calma;
        const sk = 10 * Math.sin(t * 7.3 + i * 1.7) * W * calma;
        poe(R.roupa[i], `translate(${r.x},${n(cordaY(r.x))})`);
        poe(R.roupaIn[i], `rotate(${n(limita(ang, -85, 10))}) skewX(${n(sk)}) scale(${n3(1 - .08 * Math.sin(t * 9 + i) * W)},1)`);
      });
      // árvore grande: o tronco curva-se e a copa verga
      const Wa = ventoEm(ARVORE.x - 100);
      const b = (14 + 22 * Wa + 6 * Math.sin(t * 1.7) * Wa) * calma;
      const { x: ax, base: ab, alt } = ARVORE;
      const topo = [ax - 10 + b, ab - alt + Math.abs(b) * .1];
      atr(R.tronco, 'd', `M${ax - 26},${ab} C${ax - 18},${ab - 90} ${n(ax - 18 + b * .3)},${ab - 180} ${n(topo[0] - 12)},${n(topo[1])} L${n(topo[0] + 12)},${n(topo[1])} C${n(ax + 14 + b * .3)},${ab - 180} ${ax + 14},${ab - 90} ${ax + 26},${ab} Z`);
      atr(R.ramo, 'd', `M${n(ax - 6 + b * .4)},${ab - 170} Q${n(ax - 50 + b * .6)},${ab - 210} ${n(ax - 86 + b * .9)},${ab - 236}`);
      poe(R.copa, `translate(${n(topo[0] - 20)},${n(topo[1] - 20)}) rotate(${n(b * .35)})`);
      poe(R.copaIn, `skewX(${n3(b * .2 + 1.5 * Math.sin(t * 4.3) * Wa)}) scale(${n3(1 + .015 * Math.sin(t * 5.1))})`);
      // fumo da chaminé: deitado pelo vento
      const Wf = ventoEm(260);
      fumos.forEach((f, i) => {
        f.idade += dt;
        if (f.idade > 3200) { f.idade -= 3200; f.x = 261; f.y = 508; f.vx = 10; f.vy = -30; }
        if (f.idade < dt + 1 && f.x === 0) { f.x = 261; f.y = 508; }
        f.vx += ((30 + 120 * Wf) - f.vx) * Math.min(1, s * 2); f.vy += (-26 + 14 * Wf - f.vy) * Math.min(1, s);
        f.x += f.vx * s * calma; f.y += f.vy * s * calma;
        const u = f.idade / 3200;
        poe(R.fumos[i], `translate(${n(f.x)},${n(f.y)}) scale(${n3(.5 + 1.6 * u)},${n3(.45 + 1.1 * u)})`);
        atr(R.fumos[i], 'opacity', n3(sino(Math.min(1, u * 1.6)) * .9 * (1 - u)));
      });
      // papagaio de papel: sobe com o vento, oito no ar, cauda e fio
      const Wp = ventoEm(PAPAGAIO.x);
      const alvoX = PAPAGAIO.x + 40 * Math.sin(t * .55) + 30 * (Wp - .8), alvoY = PAPAGAIO.y - 50 * (Wp - .8) + 22 * Math.sin(t * 1.1);
      S.papX += (alvoX - S.papX) * Math.min(1, s * 1.4); S.papY += (alvoY - S.papY) * Math.min(1, s * 1.4);
      const kRot = 12 * Math.sin(t * .9) + 10 * (Wp - .8) + 4 * Math.sin(t * 3.7) * Wp;
      poe(R.papagaio, `translate(${n(S.papX)},${n(S.papY)}) rotate(${n(kRot)})`);
      const cr = Math.cos(kRot / GRAU), sr = Math.sin(kRot / GRAU);
      const rodaP = (x, y) => [S.papX + x * cr - y * sr, S.papY + x * sr + y * cr];
      const [bx, by] = rodaP(0, 64), [fx, fy] = rodaP(0, 10);
      const [px, py] = PAPAGAIO.poste;
      atr(R.fio, 'd', `M${n(fx)},${n(fy)} Q${n((fx + px) / 2 + 60 - 20 * Wp)},${n((fy + py) / 2 + 40)} ${px},${py}`);
      const cauda = [[bx, by]];
      let la = '';
      for (let i = 1; i <= 8; i++) {
        // a cauda cai e é levada pelo vento (para baixo e para a direita), com uma onda que corre até à ponta
        const ang = PI / 2 - .35 - .4 * Wp + .4 * Math.sin(t * 4.2 - i * .7) * (.4 + .6 * Wp);
        const pr = cauda[i - 1];
        cauda.push([pr[0] + Math.cos(ang) * 17, pr[1] + Math.sin(ang) * 17]);
      }
      for (let i = 2; i < cauda.length; i += 2) {
        const [cx, cy] = cauda[i];
        la += `M${n(cx)},${n(cy)} l-8,-5 l0,10 Z M${n(cx)},${n(cy)} l8,-5 l0,10 Z`;
      }
      atr(R.caudaP, 'd', linhaPor(cauda)); atr(R.lacos, 'd', la);
      // notas dos búzios
      notas.forEach((nt, i) => {
        if (!nt.vivo) { atr(R.notas[i], 'display', 'none'); return; }
        nt.idade += dt;
        if (nt.idade > 1800) { nt.vivo = false; atr(R.notas[i], 'display', 'none'); return; }
        nt.x += (nt.vx + 30 * S.Vs) * s; nt.y += nt.vy * s;
        const u = nt.idade / 1800;
        atr(R.notas[i], 'display', 'inline');
        atr(R.notas[i], 'opacity', n3(Math.min(1, u * 6) * (1 - passoS(.65, 1, u))));
        poe(R.notas[i], `translate(${n(nt.x + 8 * Math.sin(nt.idade * .008 + nt.f))},${n(nt.y)}) rotate(${n(12 * Math.sin(nt.idade * .006 + nt.f))}) scale(${n3(.8 + .5 * esai(Math.min(1, u * 3)))})`);
      });
      // chapéu pousado no poste (quando não está a voar)
      if (!chapeu.voa) {
        const Wh = ventoEm(296);
        poe(R.chapeu, `translate(296,${n(748)})`);
        poe(R.chapeuIn, `rotate(${n(2 * Math.sin(t * 6) * Wh)},28,0)`);
        atr(R.chapeu, 'opacity', n3(chapeu.op));
        chapeu.op = Math.min(1, chapeu.op + dt / 900);
      }
    }
    const chapeu = { voa: false, op: 1 };

    /* --- tarefas: geradores que avançam com o dt do relógio (uma por faixa) --- */
    const faixas = new Map();
    function lancar(nome, gen, fim) {
      if (!vivo) return;
      const ant = faixas.get(nome);
      if (ant && ant.limpar) ant.limpar();
      faixas.set(nome, { g: gen, fim, limpar: gen.limpar });
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

    /* --- variações ociosas (a cada 4–9 s, sem repetir a mesma seguida) --- */
    function* varRajada() {                     // uma rajada forte atravessa o ecrã: a erva dobra-se em onda, o moinho acelera
      rajadas.push({ x: -350, vel: 820, amp: .95, larg: 280 });
      impulso('vento', .35, 3000, 'sino'); impulso('moinho', 2.2, 3200, 'sino'); impulso('inclina', 60, 2600, 'sino'); impulso('giro', 1.2, 2600, 'sino');
      yield* espera(900);
      for (let i = 0; i < 3; i++) { novoCaracol(caracois, { x: aleat(420, 560), y: aleat(420, 700), L: aleat(220, 320), R: aleat(30, 46), w: 13, dur: 2200, vx: 180 }); yield* espera(180); }
      yield* espera(1500);
    }
    function* varSementes() {                   // as sementes da bola de dente-de-leão soltam-se e voam para o redemoinho
      impulso('vento', .2, 1800, 'sino');
      rajadas.push({ x: 300, vel: 600, amp: .5, larg: 200 });
      soltarSementes();
      yield* espera(3200);
    }
    function* varAcalmia() {                    // o vento acalma: as fitas abrandam, o redemoinho encolhe um pouco, a erva endireita
      impulso('calma', -.6, 4200, 'plato'); impulso('tam', -.1, 4200, 'plato'); impulso('sobe', -.15, 4200, 'plato');
      yield* espera(4200);
    }
    const folhaG = { x: 0, y: 0, rot: 0, sx: 1, op: 1, cam: 'frente', el: R.folhaG };
    function poeFolhaG() { poe(R.folhaG, `translate(${n(folhaG.x)},${n(folhaG.y)}) rotate(${n(folhaG.rot)}) scale(${n3(folhaG.sx)},1)`); atr(R.folhaG, 'opacity', n3(folhaG.op)); }
    function* varFolha() {                      // uma folha grande chega a rodopiar, dá voltas no redemoinho e cai a baloiçar
      atr(R.folhaG, 'display', 'inline'); folhaG.op = 1;
      const ida = [[300, 400], [420, 360], [540, 420], [610, 500]];
      yield* durante(1300, (u, tt) => { const [x, y] = catmull(ida, eseno(u)); folhaG.x = x; folhaG.y = y; folhaG.rot = tt * .4; folhaG.sx = Math.cos(tt * .008); poeFolhaG(); });
      let th = PI, h = .5;
      const x0 = folhaG.x, y0 = folhaG.y;
      yield* durante(2400, (u, tt) => {
        th -= (S.giro * .8) * 16.7 / 1000 * 1.2; h = .5 - .2 * u;
        const [cx, cy, r] = funil(h, G), rr = r * .95;
        const ox = cx + rr * Math.cos(th), oy = cy + rr * ELI * Math.sin(th);
        const b = passoS(0, .25, u);
        folhaG.x = lerp(x0, ox, b); folhaG.y = lerp(y0, oy, b); folhaG.rot = 200 + tt * .5; folhaG.sx = Math.cos(tt * .01);
        const cam = Math.sin(th) < 0 && b > .5 ? 'tras' : 'frente';
        if (folhaG.cam !== cam) { (cam === 'tras' ? R.partTras : R.ar).appendChild(R.folhaG); folhaG.cam = cam; }
        poeFolhaG();
      });
      if (folhaG.cam !== 'frente') { R.ar.appendChild(R.folhaG); folhaG.cam = 'frente'; }
      // o redemoinho atira-a para fora, para a direita e para cima
      const ex = folhaG.x, ey = folhaG.y, er = folhaG.rot;
      const sai = [[ex, ey], [ex + 120, ey - 90], [1060, 420], [1110, 430]];
      yield* durante(1000, (u, tt) => { const [x, y] = catmull(sai, esai(u)); folhaG.x = x; folhaG.y = y; folhaG.rot = er + tt * .5 * (1 - u); folhaG.sx = Math.cos(tt * .01); poeFolhaG(); });
      const sx0 = folhaG.x, sy0 = folhaG.y, r0 = folhaG.rot % 360;
      const chao = 800, xc = 1130;
      yield* durante(2600, (u, tt) => {           // cai como um pêndulo
        const e = eseno(u);
        folhaG.x = lerp(sx0, xc, e) + 40 * Math.sin(u * PI * 3) * (1 - u * .6);
        folhaG.y = lerp(sy0, chao, Math.pow(u, .9)) - 16 * Math.abs(Math.sin(u * PI * 3)) * (1 - u);
        folhaG.rot = lerp(r0, 360, Math.min(1, u * 2)) + 32 * Math.sin(u * PI * 3 + .4) * (1 - u);
        folhaG.sx = lerp(Math.cos(tt * .01), 1, Math.min(1, u * 1.5));
        poeFolhaG();
      });
      yield* espera(700);
      const lx = folhaG.x, ly = folhaG.y;
      yield* durante(1400, (u, tt) => {           // um sopro leva-a para a direita
        folhaG.x = lx + 900 * eseno(u) * (.6 + .4 * u); folhaG.y = ly - 120 * sino(u * .8); folhaG.rot = 360 + tt * .6; folhaG.sx = Math.cos(tt * .012);
        folhaG.op = 1 - passoS(.6, 1, u);
        poeFolhaG();
      });
      atr(R.folhaG, 'display', 'none');
    }
    varFolha.limpar = null;
    const VARIACOES = { rajada: varRajada, sementes: varSementes, acalmia: varAcalmia, folha: varFolha };
    const vari = { prox: aleat(3000, 5000), ultima: null };
    function iniciarVariacao(nome) {
      const g = VARIACOES[nome]();
      if (nome === 'folha') g.limpar = () => { atr(R.folhaG, 'display', 'none'); if (folhaG.cam !== 'frente') { R.ar.appendChild(R.folhaG); folhaG.cam = 'frente'; } };
      vari.ultima = nome;
      lancar('variacao', g, () => { vari.prox = aleat(4000, 9000); });
    }
    function atualizarVariacoes(dt) {
      if (faixas.has('variacao')) return;
      vari.prox -= dt;
      if (vari.prox > 0) return;
      let lista = Object.keys(VARIACOES).filter(v => v !== vari.ultima);
      if (sementes.some(s => !s.preso)) lista = lista.filter(v => v !== 'sementes');
      iniciarVariacao(escolhe(lista));
    }

    /* --- reações ao toque (visíveis em 100 ms, 1–2 s, sem repetir a mesma seguida) --- */
    function cortarAcalmia() { for (const e of envs) if (e.chave === 'calma' || (e.chave === 'tam' && e.amp < 0) || (e.chave === 'sobe' && e.amp < 0)) e.t = Math.max(e.t, e.dur * .82); }
    function* reGira() {                        // o redemoinho gira mais depressa e cresce, a levantar folhas e pétalas
      impulso('tam', .22, 1700, 'ataque'); impulso('giro', 5, 1900, 'ataque'); impulso('vento', .45, 1700, 'ataque');
      impulso('sobe', .3, 1800, 'sino'); impulso('alarga', .35, 1700, 'ataque'); impulso('moinho', 1.2, 1600, 'sino');
      for (let i = 0; i < 4; i++) {
        const a = i / 4 * TAU + aleat(-.4, .4), [cx, cy, r] = funil(aleat(.3, .7), G);
        novoCaracol(caracois, { x: cx + Math.cos(a) * r * .6 - 80, y: cy + Math.sin(a) * 60, L: aleat(120, 180), R: aleat(34, 50), w: 15, dur: 1500, vx: 160, baixo: i % 2 === 1 });
        yield* espera(90);
      }
      yield* espera(1300);
    }
    function* reSopro() {                       // uma grande rajada sopra da esquerda para a direita e tudo se dobra
      rajadas.push({ x: 380, vel: 1300, amp: 1.5, larg: 340 });
      rajadas.push({ x: -500, vel: 1300, amp: 1.1, larg: 300 });
      impulso('inclina', 170, 1900, 'mola'); impulso('vento', .8, 1700, 'ataque'); impulso('giro', 2.2, 1300, 'ataque'); impulso('moinho', 3, 2200, 'ataque');
      impulso('tam', .08, 600, 'ataque');
      for (const pt of parts) if (Math.random() < .75) soltar(pt, pt.vx * .3 + aleat(450, 750), aleat(-220, 40), aleat(500, 900));
      for (let i = 0; i < 5; i++) {
        novoCaracol(caracois, { x: aleat(300, 520), y: aleat(380, 720), L: aleat(380, 560), R: aleat(30, 48), w: 15, dur: 1500, vx: 380, A: 18, baixo: i % 2 === 1 });
        yield* espera(70);
      }
      yield* espera(1500);
    }
    function* reBuzios() {                      // os búzios do moinho «cantam»: as velas giram depressa e saem notas
      impulso('moinho', 10, 2000, 'ataque'); impulso('tam', .14, 800, 'ataque'); impulso('giro', 3.2, 1500, 'ataque'); impulso('vento', .3, 1400, 'sino');
      impulso('alarga', .15, 900, 'ataque');
      // um sopro sai do redemoinho e vai até ao moinho
      novoCaracol(caracois, { x: 900, y: 480, L: 270, R: 40, w: 16, dur: 1500, vx: 40, vy: -70, A: -30, voltas: 1.1 });
      novoCaracol(caracois, { x: 880, y: 560, L: 230, R: 30, w: 11, dur: 1400, vx: 50, vy: -90, A: -20, baixo: true });
      for (let i = 0; i < 6; i++) { yield* espera(i === 0 ? 120 : 200); soltarNota(); }
      yield* espera(600);
    }
    const REACOES = { gira: reGira, sopro: reSopro, buzios: reBuzios };
    let ultimaReacao = null;
    function reagir(nome) {
      if (!vivo) return;
      cortarAcalmia();
      nome = nome || escolhe(Object.keys(REACOES).filter(r => r !== ultimaReacao));
      ultimaReacao = nome;
      // limita os efeitos acumulados quando se toca muitas vezes seguidas
      while (envs.length > 40) envs.shift();
      while (rajadas.length > 6) rajadas.shift();
      while (caracois.length > 14) caracois.shift();
      lancar('reacao', REACOES[nome]());
    }

    /* --- acontecimentos raros (15–40 s): balão ao longe, o chapéu voa, bando de aves --- */
    function* evBalao() {
      atr(R.balao, 'display', 'inline');
      yield* durante(22000, (u, tt) => {
        const x = lerp(-80, 1700, u), y = 214 + 26 * Math.sin(u * PI * 2.2) + 4 * Math.sin(tt * .002);
        poe(R.balao, `translate(${n(x)},${n(y)}) rotate(${n(3 * Math.sin(tt * .0015))}) scale(.85)`);
      });
      atr(R.balao, 'display', 'none');
    }
    function* evChapeu() {                      // o chapéu levanta-se do poste, rodopia no redemoinho e vai-se embora
      chapeu.voa = true;
      const Wh = () => ventoEm(296);
      yield* durante(600, (u, tt) => { poe(R.chapeu, `translate(296,${n(748 - 6 * sino(u * 2))})`); poe(R.chapeuIn, `rotate(${n(14 * Math.sin(tt * .03) * u * Wh())},28,0)`); });
      rajadas.push({ x: -200, vel: 900, amp: .6, larg: 260 });
      const ida = [[296, 748], [350, 650], [440, 570], [520, 520], [600, 540]];
      yield* durante(1600, (u, tt) => {
        const [x, y] = catmull(ida, eseno(u));
        poe(R.chapeu, `translate(${n(x)},${n(y)})`); poe(R.chapeuIn, `rotate(${n(tt * .35)}) scale(${n3(Math.cos(tt * .006))},1)`);
      });
      const ev = { x: 600, y: 540 };
      let th = PI;
      yield* durante(2600, (u, tt) => {
        th -= S.giro * .9 * 16.7 / 1000 * 1.1;
        const [cx, cy, r] = funil(.5 + .2 * u, G), rr = r * .9;
        const b = passoS(0, .25, u);
        ev.x = lerp(600, cx + rr * Math.cos(th), b); ev.y = lerp(540, cy + rr * ELI * Math.sin(th), b);
        const tras = Math.sin(th) < 0 && b > .5;
        const pai = tras ? R.partTras : R.ar;
        if (R.chapeu.parentNode !== pai) pai.appendChild(R.chapeu);
        poe(R.chapeu, `translate(${n(ev.x)},${n(ev.y)}) scale(${n3(1 + .15 * Math.sin(th) * b)})`); poe(R.chapeuIn, `rotate(${n(560 + tt * .3)}) scale(${n3(Math.cos(tt * .005))},1)`);
      });
      if (R.chapeu.parentNode !== R.ar) R.ar.appendChild(R.chapeu);
      const sai = [[ev.x, ev.y], [ev.x + 200, ev.y - 90], [1450, 300], [1760, 240]];
      yield* durante(2200, (u, tt) => {
        const [x, y] = catmull(sai, eseno(u));
        poe(R.chapeu, `translate(${n(x)},${n(y)})`); poe(R.chapeuIn, `rotate(${n(tt * .4)}) scale(${n3(Math.cos(tt * .007))},1)`);
      });
      yield* espera(2500);
      evChapeu.limpar();
    }
    evChapeu.limpar = () => {                   // o chapéu volta (aparece devagar) ao poste e à sua camada
      const cerca = R.ar.parentNode;
      if (R.chapeu.parentNode !== cerca) cerca.insertBefore(R.chapeu, R.fio);
      chapeu.voa = false; chapeu.op = 0;
    };
    function* evBando() {                       // um bando de aves passa a planar em V
      atr(R.bando, 'display', 'inline');
      const lugar = [[0, 0], [-40, -20], [-40, 22], [-80, -38], [-80, 42], [-120, -56], [-120, 62]];
      yield* durante(15000, (u, tt) => {
        const x = lerp(-200, 1800, u), y = 180 + 30 * Math.sin(u * PI * 1.6);
        R.bd.forEach((g, i) => {
          const [dx, dy] = lugar[i];
          poe(g, `translate(${n(x + dx + 4 * Math.sin(tt * .002 + i))},${n(y + dy + 3 * Math.sin(tt * .0027 + i * 2))}) scale(.62)`);
          const bate = Math.sin(tt * .0011 + i * .4) > .7 ? Math.sin(tt * .016 + i) : 0;
          poe(R.bdAsas[i], `scale(1,${n3(.85 + .65 * bate)})`);
        });
      });
      atr(R.bando, 'display', 'none');
    }
    const EVENTOS = { balao: evBalao, chapeu: evChapeu, bando: evBando };
    const eventos = { prox: aleat(15000, 25000), ultimo: null };
    function iniciarEvento(tipo) {
      const g = EVENTOS[tipo]();
      if (tipo === 'chapeu') g.limpar = evChapeu.limpar;
      if (tipo === 'balao') g.limpar = () => atr(R.balao, 'display', 'none');
      if (tipo === 'bando') g.limpar = () => atr(R.bando, 'display', 'none');
      eventos.ultimo = tipo;
      lancar('evento', g);
    }
    function atualizarEventos(dt) {
      if (faixas.has('evento') || semEventos) return;
      eventos.prox -= dt;
      if (eventos.prox > 0) return;
      eventos.prox = aleat(15000, 40000);
      let tipo; do tipo = escolhe(Object.keys(EVENTOS)); while (tipo === eventos.ultimo && Math.random() < .75);
      iniciarEvento(tipo);
    }

    /* --- relógio único --- */
    let erroMostrado = false;
    function passo(dt) {
      if (!vivo) return;
      try {
        dt = Math.min(dt, 50);
        tempo += dt;
        const t = tempo / 1000;
        atualizarEnvs(dt);
        atualizarVento(dt);
        for (const nome of Array.from(faixas.keys())) avancar(nome, dt);
        // geometria do redemoinho neste quadro (lê o vento)
        G.t = t;
        G.tam = limita(1 + E.tam + .07 * (S.Vs - .8), .75, 1.45);
        G.inc = limita(24 + 36 * (S.Vs - .8) + 70 * Math.min(1.5, rajadaEm(BASE_X)) + E.inclina, -90, 200) * calma;
        G.ond = (12 + 10 * S.Vs) * calma;
        G.cx0 = funil(0, G)[0];
        S.giro = (1.3 + 1.2 * S.Vs + E.giro) * calma;
        S.fase += S.giro * dt / 1000;
        for (const f of fitas) {
          if (f.fixa) continue;
          f.idade += dt * (.75 + .3 * S.Vs);
          f.h0 += dt / 1000 * .035 * S.Vs;
          if (f.idade >= f.dur) novaFita(f, false);
        }
        atualizarVariacoes(dt);
        atualizarEventos(dt);
        animarCena(dt);
        desenharPrimeiroPlano();
        atualizarParticulas(dt);
        atualizarCaracois(dt);
        desenharRedemoinho();
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    // posições iniciais das partículas na órbita
    passo(0);
    for (const pt of parts) { pt.fx = pt.ox; pt.fy = pt.oy; }
    passo(16);

    return {
      animal: R.ar,
      habitat: null,
      reagir() { reagir(); },
      fazerSom() {},
      irAoHabitat: () => Promise.resolve(),
      voltar: () => Promise.resolve(),
      destruir() {
        vivo = false;
        faixas.clear();
        envs.length = 0;
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola (modo de desenvolvimento)
      _teste: {
        S, G, E, reagir, variacao: iniciarVariacao, evento: iniciarEvento, semEventos: (v = true) => { semEventos = v; },
        semVariacoes: () => { vari.prox = 1e12; }, estado: () => ({ faixas: [...faixas.keys()], envs: envs.length, rajadas: rajadas.length, caracois: caracois.length, sementesSoltas: sementes.filter(s => !s.preso).length })
      }
    };
  }

  return { icone: iconeSVG(), montar };
})();
