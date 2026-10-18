/* Flor — «Os Meus Animais», grupo «Elementos». Contrato e regras: REGRAS-ANIMAIS.md (§2 e §11).
   Cena: um jardim português numa manhã de primavera (sol de cima à esquerda). Céu azul com nuvens que passam devagar e
   duas andorinhas, um muro caiado com capeamento e barra amarela (e um painel de azulejos), por trás do muro uma tília,
   uma laranjeira com laranjas e dois ciprestes; à esquerda uma pérgula de pilares caiados coberta de glicínia (cachos
   lilases que baloiçam) com um banco de ripas por baixo; uma sebe de buxo aparada ao longo do muro, um caminho de
   gravilha com um regador verde e, à frente, um canteiro de terra com rebordo de telhas e flores pequenas (malmequeres,
   tulipas, papoilas e alfazema) que se dobram com a brisa. Um gato malhado está deitado em cima do muro.
   A flor é a personagem (sem cara): uma flor grande no meio do canteiro (≈ 515 de altura com o caule), com dez pétalas
   cor-de-rosa em duas coroas (as de trás mais escuras), cada uma com veios, ponta recortada mais clara e sombra junto ao
   miolo; miolo amarelo em cúpula com os grãos de pólen em espiral (filotaxia); sépalas verdes que só se veem quando ela
   se fecha; caule verde que dobra com mola (a corola vem atrasada), três folhas com nervuras e gotas de orvalho.
   A corola é um disco em 2,5D: uma matriz (rumo, inclinação, rotação no ecrã) e a cúpula do miolo desloca-se ao longo
   da normal, por isso quando ela se vira para o sol vê-se o volume.
   Variações ociosas (4–9 s): uma abelha pousa no miolo, uma borboleta pousa numa pétala, uma gota de orvalho escorre e
   cai, a flor vira-se para o sol, uma pétala solta-se e cai a planar (e volta a crescer devagar), uma joaninha sobe pelo
   caule e voa. Toque (alternado): fecha-se e abre-se toda a brilhar com pólen dourado; baloiça com força e solta pétalas;
   saem três borboletas de trás das pétalas. Raros (15–40 s): um melro pousa no caminho e bica o chão, um caracol passa no
   rebordo do canteiro, um chuvisco com arco-íris. O gato segue tudo com os olhos.
   Organização:
     1) utilidades (matemática, curvas)
     2) geometria da flor (pétala, folha, caule)
     3) ícone do menu
     4) cenário (céu, árvores, muro, gato, sebe, caminho, pérgula, banco, regador, canteiro, tufos de flores)
     5) bichos (abelha, borboletas, joaninha, melro, caracol, andorinhas)
     6) montar(): estado, mola do caule, desenho por quadro, tarefas, variações, reações, acontecimentos, relógio único */
'use strict';
MODULOS.flor = (() => {
  const NS = 'http://www.w3.org/2000/svg';

  /* ================= 1) Utilidades ================= */
  const PI = Math.PI, TAU = 2 * PI, GRAU = 180 / PI;
  const lerp = (a, b, t) => a + (b - a) * t;
  const limita = (v, a, b) => v < a ? a : v > b ? b : v;
  const n = v => Math.round(v * 10) / 10;
  const n3 = v => Math.round(v * 1000) / 1000;
  const suave = t => t * t * (3 - 2 * t);
  const passoS = (a, b, x) => suave(limita((x - a) / (b - a), 0, 1));
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
  // elipse e círculo como subcaminhos (para juntar muitas peças num só path)
  const elip = (cx, cy, rx, ry) => `M${n(cx - rx)},${n(cy)}a${n(rx)},${n(ry)} 0 1,0 ${n(2 * rx)},0a${n(rx)},${n(ry)} 0 1,0 ${n(-2 * rx)},0Z`;
  const circ = (cx, cy, r) => elip(cx, cy, r, r);
  // linha suave por pontos (curvas pelos meios)
  function linhaPor(pts) {
    const m = pts.length;
    let d = `M${n(pts[0][0])},${n(pts[0][1])}`;
    for (let i = 1; i < m - 1; i++) d += `Q${n(pts[i][0])},${n(pts[i][1])} ${n((pts[i][0] + pts[i + 1][0]) / 2)},${n((pts[i][1] + pts[i + 1][1]) / 2)}`;
    return d + `L${n(pts[m - 1][0])},${n(pts[m - 1][1])}`;
  }
  // contorno fechado à volta de uma linha central com larguras: pts = [[x, y, largura], …]
  function contornoFita(pts) {
    const m = pts.length, a1 = [], a2 = [];
    for (let i = 0; i < m; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(m - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1];
      const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
      const w = pts[i][2] * .5;
      a1.push([pts[i][0] - ty * w, pts[i][1] + tx * w]);
      a2.push([pts[i][0] + ty * w, pts[i][1] - tx * w]);
    }
    return linhaPor(a1) + linhaPor(a2.reverse()).replace(/^M/, 'L') + 'Z';
  }
  // Bézier cúbica: ponto e direção
  function bez(P, u) {
    const v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u;
    return [a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]];
  }
  function bezDir(P, u) {
    const v = 1 - u;
    const x = 3 * v * v * (P[1][0] - P[0][0]) + 6 * v * u * (P[2][0] - P[1][0]) + 3 * u * u * (P[3][0] - P[2][0]);
    const y = 3 * v * v * (P[1][1] - P[0][1]) + 6 * v * u * (P[2][1] - P[1][1]) + 3 * u * u * (P[3][1] - P[2][1]);
    return Math.atan2(y, x);
  }

  /* ================= 2) Geometria da flor ================= */
  const BASE = [800, 792];            // onde o caule sai da terra (y ≤ 795: no telemóvel só se vê até ~810)
  const LC = 400;                     // corda do caule: a corola fica a y ≈ 392 e a ponta das pétalas de cima a ≈ 280
  const PET = { n: 10, r0: 20, L: 92, W: 25 };
  const LUZ = -135 / GRAU;            // direção da luz no ecrã (de cima à esquerda)
  // pétala deitada ao longo de +x (base na origem): bojo largo, ponta com três dentes suaves
  function petalaD(L, W) {
    const P = (x, y) => `${n(x * L)},${n(y * W)}`;
    return `M0,0 C${P(.12, -.38)} ${P(.3, -.96)} ${P(.58, -1)} C${P(.8, -1.03)} ${P(.94, -.78)} ${P(.985, -.42)}` +
      ` Q${P(1.012, -.29)} ${P(.972, -.16)} Q${P(1.018, 0)} ${P(.972, .16)} Q${P(1.012, .29)} ${P(.985, .42)}` +
      ` C${P(.94, .78)} ${P(.8, 1.03)} ${P(.58, 1)} C${P(.3, .96)} ${P(.12, .38)} 0,0Z`;
  }
  function veiosD(L, W) {
    const P = (x, y) => `${n(x * L)},${n(y * W)}`;
    return `M${P(.05, 0)} L${P(.9, 0)} M${P(.06, -.05)} Q${P(.45, -.3)} ${P(.86, -.56)} M${P(.06, .05)} Q${P(.45, .3)} ${P(.86, .56)}` +
      ` M${P(.22, -.3)} Q${P(.5, -.66)} ${P(.72, -.82)} M${P(.22, .3)} Q${P(.5, .66)} ${P(.72, .82)} M${P(.5, -.12)} L${P(.78, -.2)} M${P(.5, .12)} L${P(.78, .2)}`;
  }
  // folha ao longo de +x, a arquear para cima e com a ponta a descair; metade de cima (ao sol) e de baixo em separado
  function folhaGeo(L, W) {
    const N = 14, cima = [], baixo = [], meio = [];
    const q = s => { const u = 1 - s; return [2 * u * s * L * .55 + s * s * L, 2 * u * s * (-L * .17) + s * s * (-L * .04)]; };
    for (let i = 0; i <= N; i++) {
      const s = i / N, [x, y] = q(s), [x2, y2] = q(Math.min(1, s + .01)), [x1, y1] = q(Math.max(0, s - .01));
      let tx = x2 - x1, ty = y2 - y1; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
      const w = W * Math.pow(Math.sin(PI * Math.pow(s, .78)), .85);
      meio.push([x, y]); cima.push([x + ty * w, y - tx * w]); baixo.push([x - ty * w * .9, y + tx * w * .9]);
    }
    const volta = meio.slice().reverse();
    const sup = linhaPor(cima) + linhaPor(volta).replace(/^M/, 'L') + 'Z';
    const inf = linhaPor(baixo) + linhaPor(volta).replace(/^M/, 'L') + 'Z';
    const contorno = linhaPor(cima) + linhaPor(baixo.slice().reverse()).replace(/^M/, 'L') + 'Z';
    let veios = '';
    for (const s of [.16, .3, .44, .58, .72]) {
      const i = Math.round(s * N), j = Math.min(N, i + 2);
      const m = meio[i], c = cima[j], b = baixo[j], mm = meio[Math.min(N, i + 1)];
      veios += `M${n(m[0])},${n(m[1])} Q${n(mm[0])},${n(lerp(mm[1], c[1], .45))} ${n(lerp(m[0], c[0], .85))},${n(lerp(m[1], c[1], .85))}`;
      veios += `M${n(m[0])},${n(m[1])} Q${n(mm[0])},${n(lerp(mm[1], b[1], .45))} ${n(lerp(m[0], b[0], .85))},${n(lerp(m[1], b[1], .85))}`;
    }
    return { sup, inf, contorno, nervura: linhaPor(meio), veios, q };
  }
  function folhaSVG(cls, L, W, gota) {
    const f = folhaGeo(L, W);
    return `<g class="${cls}"><g class="fl-fIn">
      <path d="M-12,0 L4,0" stroke="#4E8A2E" stroke-width="6" stroke-linecap="round"/>
      <path d="${f.inf}" fill="#4A8A2C"/><path d="${f.sup}" fill="#80C04C"/>
      <path d="${f.veios}" stroke="#3A6E22" stroke-width="1.3" fill="none" opacity=".55" stroke-linecap="round"/>
      <path d="${f.nervura}" stroke="#C6E68E" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".85"/>
      <path d="${f.contorno}" fill="none" stroke="#2E5A1E" stroke-width="1.6" stroke-linejoin="round"/>
      ${gota ? `<g transform="translate(${n(L * .5)},${n(f.q(.5)[1] - 3)}) scale(1.15)">${gotaSVG()}</g>` : ''}
    </g></g>`;
  }
  // gota de orvalho (centrada na origem, raio ≈ 5)
  function gotaSVG() {
    return `<ellipse cx="1.4" cy="3.2" rx="7" ry="4.4" fill="#5A1030" opacity=".2"/>
      <circle r="6.6" fill="url(#flor-gota)" stroke="#FFFFFF" stroke-width="1" stroke-opacity=".8"/>
      <path d="M-4.6,2.6 A5.4,5.4 0 0,0 4.6,2.6" stroke="#5A7A9A" stroke-width="1.2" fill="none" opacity=".45"/>
      <circle cx="-2.4" cy="-2.5" r="2" fill="#FFFFFF"/><circle cx="2.4" cy="2.6" r=".9" fill="#FFFFFF" opacity=".8"/>`;
  }

  /* ================= 3) Ícone do menu (sem gradientes com id) ================= */
  function iconeSVG() {
    const cx = 110, cy = 84, L = 40, W = 11.5, r0 = 9;
    const pd = petalaD(L, W);
    let tras = '', frente = '', pontas = '';
    for (let i = 0; i < 10; i++) {
      const a = i * 36 + 4, g = `<g transform="translate(${cx},${cy}) rotate(${a}) translate(${r0},0)">`;
      if (i % 2 === 0) tras += `${g}<path d="${pd}" fill="#D23C6C" stroke="#8E1E46" stroke-width="1.2"/></g>`;
      else frente += `${g}<path d="${pd}" fill="#F06A96" stroke="#9A2450" stroke-width="1.2"/><path d="M${L * .55},${-W * .7} Q${L * .98},${-W * .5} ${L * .97},0 Q${L * .98},${W * .5} ${L * .55},${W * .7} Q${L * .8},0 ${L * .55},${-W * .7}Z" fill="#FFB8D0" opacity=".8"/></g>`;
      pontas += `M${n(cx + Math.cos(a / GRAU) * (r0 + 4))},${n(cy + Math.sin(a / GRAU) * (r0 + 4))} L${n(cx + Math.cos(a / GRAU) * (r0 + L * .7))},${n(cy + Math.sin(a / GRAU) * (r0 + L * .7))}`;
    }
    let graos = '';
    for (let i = 1; i < 34; i++) { const r = 11 * Math.sqrt(i / 34), a = i * 2.39996; graos += circ(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.1); }
    const tulipa = (x, y, h, c) => `<path d="M${x},${y} Q${x - 2},${y - h / 2} ${x},${y - h}" stroke="#4E8A2E" stroke-width="2.4" fill="none"/>
      <path d="M${x - 6},${y - h} C${x - 7},${y - h - 8} ${x - 5},${y - h - 14} ${x - 3},${y - h - 15} L${x},${y - h - 10} L${x + 3},${y - h - 15} C${x + 5},${y - h - 14} ${x + 7},${y - h - 8} ${x + 6},${y - h} Q${x},${y - h + 4} ${x - 6},${y - h}Z" fill="${c}" stroke="#7A2A1A" stroke-width=".8"/>`;
    const malmequer = (x, y) => { let d = ''; for (let a = 0; a < 360; a += 30) d += elip(x + Math.cos(a / GRAU) * 5, y + Math.sin(a / GRAU) * 3, 3.6, 1.8); return `<path d="${d}" fill="#FFFFFF" stroke="#C8C2D0" stroke-width=".5"/><circle cx="${x}" cy="${y}" r="2.4" fill="#F6C624"/>`; };
    return `<circle cx="110" cy="110" r="106" fill="#BFE5F6"/>
      <circle cx="46" cy="44" r="26" fill="#FFF8DC" opacity=".6"/><circle cx="46" cy="44" r="15" fill="#FFF3B8"/>
      <path d="M150,40 C156,32 168,32 172,38 C180,36 186,42 184,48 L146,48 C142,46 144,40 150,40Z" fill="#FFFFFF"/>
      <path d="M5.5,128 L214.5,128 A106,106 0 0,1 5.5,128 Z" fill="#F6F2EA"/>
      <path d="M8.7,142 L211.3,142 A106,106 0 0,1 8.7,142 Z" fill="#5E9A3A"/>
      <path d="M17.6,166 C60,160 160,160 202.4,166 A106,106 0 0,1 17.6,166 Z" fill="#7A5232"/>
      <path d="M17.6,166 C60,160 160,160 202.4,166" stroke="#C8643E" stroke-width="4" fill="none"/>
      ${tulipa(52, 196, 30, '#E8402E')}${tulipa(168, 194, 28, '#FFC83A')}${tulipa(146, 202, 22, '#F06A96')}${malmequer(72, 176)}${malmequer(38, 168)}${malmequer(186, 170)}
      <path d="M110,196 C106,172 114,140 110,${cy}" stroke="#3E7A28" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M108,190 C105,170 111,146 108,${cy + 30}" stroke="#A6D86A" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M110,164 C122,150 142,146 156,150 C144,160 126,166 110,164Z" fill="#6EB040" stroke="#2E5A1E" stroke-width="1.4"/>
      <path d="M110,164 C126,156 140,152 154,150" stroke="#C6E68E" stroke-width="1.2" fill="none"/>
      <path d="M109,148 C96,134 78,132 66,136 C78,146 94,150 109,148Z" fill="#5E9E38" stroke="#2E5A1E" stroke-width="1.4"/>
      <path d="M109,148 C96,140 82,136 68,136" stroke="#C6E68E" stroke-width="1.2" fill="none"/>
      ${tras}${frente}
      <path d="${pontas}" stroke="#A82A58" stroke-width="1" opacity=".45"/>
      <circle cx="${cx}" cy="${cy}" r="16" fill="#C47A10"/><circle cx="${cx}" cy="${cy - 1}" r="13.5" fill="#FFCC2A"/>
      <path d="${graos}" fill="#D8901A"/><ellipse cx="${cx - 5}" cy="${cy - 6}" rx="5" ry="3" fill="#FFF6C0" opacity=".85"/>
      <circle cx="143" cy="70" r="3.6" fill="#EAF6FF" stroke="#FFFFFF" stroke-width=".8"/><circle cx="142" cy="69" r="1.2" fill="#FFFFFF"/>
      <circle cx="110" cy="110" r="106" fill="none" stroke="#8CC4E2" stroke-width="3"/>`;
  }

  /* ================= 4) Cenário ================= */
  function defs() {
    return `
    <linearGradient id="flor-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5FAEE6"/><stop offset=".45" stop-color="#93CBF0"/><stop offset=".8" stop-color="#CDE9F6"/><stop offset="1" stop-color="#EEF6EE"/></linearGradient>
    <radialGradient id="flor-solBrilho"><stop offset="0" stop-color="#FFFBE6" stop-opacity=".95"/><stop offset=".22" stop-color="#FFF4C8" stop-opacity=".45"/><stop offset=".6" stop-color="#FFF0B8" stop-opacity=".1"/><stop offset="1" stop-color="#FFF0B8" stop-opacity="0"/></radialGradient>
    <radialGradient id="flor-sol" cx=".42" cy=".4" r=".62"><stop offset="0" stop-color="#FFFFF4"/><stop offset=".7" stop-color="#FFF4C4"/><stop offset="1" stop-color="#FFE596"/></radialGradient>
    <radialGradient id="flor-copa" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#8CC456"/><stop offset=".55" stop-color="#5A9634"/><stop offset="1" stop-color="#386C22"/></radialGradient>
    <radialGradient id="flor-copaL" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#6EA846"/><stop offset=".55" stop-color="#3E7A2A"/><stop offset="1" stop-color="#24521A"/></radialGradient>
    <linearGradient id="flor-cipreste" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4E7E3E"/><stop offset=".45" stop-color="#2E5A2E"/><stop offset="1" stop-color="#1A3A20"/></linearGradient>
    <linearGradient id="flor-muro" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#F7F4EE"/><stop offset="1" stop-color="#E4DED2"/></linearGradient>
    <linearGradient id="flor-muroV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B8AE9E" stop-opacity=".45"/><stop offset=".12" stop-color="#B8AE9E" stop-opacity="0"/><stop offset=".85" stop-color="#B8AE9E" stop-opacity="0"/><stop offset="1" stop-color="#9A9080" stop-opacity=".25"/></linearGradient>
    <linearGradient id="flor-pilar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#EFEAE0"/><stop offset="1" stop-color="#C2B9AA"/></linearGradient>
    <linearGradient id="flor-madeira" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B88A5A"/><stop offset=".5" stop-color="#8E643C"/><stop offset="1" stop-color="#5E4026"/></linearGradient>
    <linearGradient id="flor-sebe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4E8A30"/><stop offset=".55" stop-color="#3A7026"/><stop offset="1" stop-color="#24501A"/></linearGradient>
    <linearGradient id="flor-gravilha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8CBAE"/><stop offset=".4" stop-color="#E6DAC0"/><stop offset="1" stop-color="#D6C6A4"/></linearGradient>
    <linearGradient id="flor-terra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6A4428"/><stop offset=".4" stop-color="#7E5432"/><stop offset="1" stop-color="#5E3C22"/></linearGradient>
    <linearGradient id="flor-glicinia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4D6F8"/><stop offset=".45" stop-color="#B494E2"/><stop offset="1" stop-color="#7C56BC"/></linearGradient>
    <linearGradient id="flor-petala" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A21E4C"/><stop offset=".2" stop-color="#D23C6C"/><stop offset=".58" stop-color="#EE6A96"/><stop offset=".88" stop-color="#FAA2C0"/><stop offset="1" stop-color="#FFC6DA"/></linearGradient>
    <linearGradient id="flor-petalaT" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#861640"/><stop offset=".25" stop-color="#BC2E5E"/><stop offset=".65" stop-color="#DC5584"/><stop offset="1" stop-color="#F390B2"/></linearGradient>
    <radialGradient id="flor-miolo" cx=".38" cy=".34" r=".7"><stop offset="0" stop-color="#FFF6A8"/><stop offset=".45" stop-color="#FFD42E"/><stop offset=".85" stop-color="#EBA412"/><stop offset="1" stop-color="#C87E0C"/></radialGradient>
    <radialGradient id="flor-sombraMiolo"><stop offset=".45" stop-color="#5A0824" stop-opacity=".5"/><stop offset=".75" stop-color="#7A1034" stop-opacity=".18"/><stop offset="1" stop-color="#7A1034" stop-opacity="0"/></radialGradient>
    <radialGradient id="flor-brilho"><stop offset="0" stop-color="#FFF8C8" stop-opacity="1"/><stop offset=".35" stop-color="#FFE266" stop-opacity=".75"/><stop offset=".7" stop-color="#FFD03A" stop-opacity=".25"/><stop offset="1" stop-color="#FFD03A" stop-opacity="0"/></radialGradient>
    <radialGradient id="flor-gota" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".45" stop-color="#EAF6FF" stop-opacity=".35"/><stop offset=".85" stop-color="#9CC4E4" stop-opacity=".55"/><stop offset="1" stop-color="#7AA8D0" stop-opacity=".8"/></radialGradient>
    <radialGradient id="flor-sombra"><stop offset="0" stop-color="#2A2416" stop-opacity=".42"/><stop offset=".7" stop-color="#2A2416" stop-opacity=".14"/><stop offset="1" stop-color="#2A2416" stop-opacity="0"/></radialGradient>
    <radialGradient id="flor-gato" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FAC07A"/><stop offset=".55" stop-color="#E8964A"/><stop offset="1" stop-color="#C06A2C"/></radialGradient>
    <linearGradient id="flor-regador" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9ED0B4"/><stop offset=".4" stop-color="#5E9E7E"/><stop offset="1" stop-color="#2E5E4A"/></linearGradient>
    <radialGradient id="flor-concha" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#F2C88A"/><stop offset=".55" stop-color="#C08240"/><stop offset="1" stop-color="#7A4A20"/></radialGradient>
    <radialGradient id="flor-luzQuente" gradientUnits="userSpaceOnUse" cx="190" cy="120" r="1300"><stop offset="0" stop-color="#FFF4C8" stop-opacity=".22"/><stop offset=".5" stop-color="#FFF0C0" stop-opacity=".05"/><stop offset="1" stop-color="#FFF0C0" stop-opacity="0"/></radialGradient>
    <radialGradient id="flor-vinheta" cx=".5" cy=".46" r=".8"><stop offset=".64" stop-color="#1A3A2A" stop-opacity="0"/><stop offset="1" stop-color="#1A3A2A" stop-opacity=".22"/></radialGradient>`;
  }

  /* --- céu: sol, nuvens, arco-íris, nuvem do chuvisco e andorinhas --- */
  function nuvemSVG(cls, k, cinza) {
    const c = cinza ? ['#9AA6B4', '#B8C2CE', '#C8D0DA', '#AEB8C4', '#A4AEBA', '#D4DAE2'] : ['#C6DDEE', '#F2F8FC', '#FFFFFF', '#F6FAFD', '#ECF4FA', '#FFFFFF'];
    return `<g class="${cls}"><g transform="scale(${k})">
      <ellipse cx="0" cy="14" rx="100" ry="13" fill="${c[0]}" opacity=".8"/>
      <ellipse cx="-50" cy="0" rx="38" ry="19" fill="${c[1]}"/><ellipse cx="-8" cy="-12" rx="44" ry="26" fill="${c[2]}"/><ellipse cx="38" cy="-2" rx="38" ry="19" fill="${c[3]}"/><ellipse cx="78" cy="7" rx="24" ry="11" fill="${c[4]}"/>
      <ellipse cx="0" cy="9" rx="96" ry="10" fill="${c[1]}"/><ellipse cx="-26" cy="-24" rx="24" ry="7" fill="${c[5]}"/></g></g>`;
  }
  function ceuSVG() {
    const cores = ['#E84A3A', '#F49A2E', '#F6DA3A', '#6CC04A', '#3E9AE0', '#5A62C8', '#9A5AC0'];
    const arco = cores.map((c, i) => `<path d="M${1180 - 470 + i * 9},700 A${470 - i * 9},${470 - i * 9} 0 0,1 ${1180 + 470 - i * 9},700" stroke="${c}" stroke-width="10" fill="none"/>`).join('');
    const andorinha = i => `<g class="fl-and${i}"><g class="fl-andAsas"><path d="M2,0 C-2,-9 -10,-16 -20,-20 C-12,-12 -8,-6 -6,2 Z M2,0 C-2,9 -10,16 -20,20 C-12,12 -8,6 -6,2 Z" fill="#2A2E44"/></g>
      <path d="M12,0 C10,-4 4,-4 0,-3 L-14,-6 L-8,0 L-14,6 L0,3 C4,4 10,4 12,0 Z" fill="#22263A"/><path d="M11,0.5 C8,2.6 4,3 1,2.4" stroke="#F4F2EA" stroke-width="1.6" fill="none"/></g>`;
    return `<rect width="1600" height="640" fill="url(#flor-ceu)"/>
      <circle cx="190" cy="120" r="430" fill="url(#flor-solBrilho)"/>
      <circle cx="190" cy="120" r="50" fill="url(#flor-sol)"/>
      <g class="fl-nuvens">${nuvemSVG('fl-nuvem0', 1)}${nuvemSVG('fl-nuvem1', .7)}${nuvemSVG('fl-nuvem2', .85)}</g>
      <g class="fl-arco" opacity="0">${arco}</g>
      <g class="fl-nuvemChuva" display="none">${nuvemSVG('fl-nc', 1.5, true)}</g>
      ${andorinha(0)}${andorinha(1)}`;
  }

  /* --- por trás do muro: tília, laranjeira com laranjas, ciprestes e uma árvore ao longe --- */
  function copaSVG(cls, cx, cy, rx, ry, sem, grad, laranjas) {
    const r = semente(sem);
    let base = '', luz = '', esc = '', fr = '', frL = '';
    for (let k = 0; k < 16; k++) {
      const a = r() * TAU, d = Math.sqrt(r()) * .62, x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d, rr = (.3 + r() * .2) * rx;
      base += elip(x, y, rr, rr * .62);
      if (Math.cos(a) < .3 && Math.sin(a) < .2) luz += elip(x - rr * .22, y - rr * .2, rr * .5, rr * .24);
      else esc += elip(x + rr * .1, y + rr * .24, rr * .6, rr * .22);
    }
    if (laranjas) for (const [x, y] of laranjas) { fr += circ(x, y, 7); frL += circ(x - 2.2, y - 2.4, 2.2); }
    return `<g class="${cls}"><path d="${base}" fill="#24461A" transform="translate(0,6)"/><path d="${base}" fill="url(#${grad})"/>
      <path d="${esc}" fill="#2E5E1E" opacity=".5"/><path d="${luz}" fill="#A8D872" opacity=".55"/>
      ${laranjas ? `<path d="${fr}" fill="#F2921A" stroke="#B8600E" stroke-width="1"/><path d="${frL}" fill="#FFD27A"/>` : ''}</g>`;
  }
  function arvoresSVG() {
    const cipreste = (x, topo, w) => `<path d="M${x - w},436 C${x - w * 1.05},380 ${x - w * .7},${topo + 80} ${x},${topo} C${x + w * .7},${topo + 80} ${x + w * 1.05},380 ${x + w},436 Z" fill="url(#flor-cipreste)" stroke="#1A3A20" stroke-width="1.5"/>
      <path d="M${x - w * .5},420 C${x - w * .55},360 ${x - w * .4},${topo + 100} ${x - w * .08},${topo + 26} M${x - w * .2},430 C${x - w * .1},370 ${x - w * .2},${topo + 140} ${x + w * .1},${topo + 60}" stroke="#6E9E52" stroke-width="2.4" fill="none" opacity=".6"/>`;
    return `${copaSVG('fl-copa0', 120, 400, 150, 64, 7, 'flor-copaL')}
      <path d="M1450,436 C1460,380 1500,330 1560,322 C1590,320 1610,330 1620,340 L1620,436Z" fill="#3E7428"/>
      ${cipreste(1262, 188, 30)}${cipreste(1336, 236, 24)}
      ${copaSVG('fl-copa1', 760, 372, 250, 84, 21, 'flor-copa')}
      ${copaSVG('fl-copa2', 1092, 384, 112, 64, 33, 'flor-copa', [[1004, 372], [1026, 344], [1058, 330], [1120, 334], [1152, 350], [1178, 372], [1014, 404], [1166, 400], [1136, 362]])}`;
  }

  /* --- muro caiado: capeamento, barra amarela, manchas, rachas e um painel de azulejos --- */
  function muroSVG() {
    let az = '', azFundo = '';
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      const x = 572 + i * 24, y = 468 + j * 24, cx = x + 12, cy = y + 12;
      azFundo += `M${x},${y} h24 v24 h-24Z`;
      az += circ(cx, cy, 4) + `M${cx},${y + 1} Q${cx + 4},${cy - 4} ${cx},${cy - 5} Q${cx - 4},${cy - 4} ${cx},${y + 1}Z M${cx},${y + 23} Q${cx + 4},${cy + 4} ${cx},${cy + 5} Q${cx - 4},${cy + 4} ${cx},${y + 23}Z`;
      az += `M${x + 1},${cy} Q${cx - 4},${cy - 4} ${cx - 5},${cy} Q${cx - 4},${cy + 4} ${x + 1},${cy}Z M${x + 23},${cy} Q${cx + 4},${cy - 4} ${cx + 5},${cy} Q${cx + 4},${cy + 4} ${x + 23},${cy}Z`;
      az += `M${x + 1},${y + 4} q3,0 3,-3 M${x + 23},${y + 4} q-3,0 -3,-3 M${x + 1},${y + 20} q3,0 3,3 M${x + 23},${y + 20} q-3,0 -3,3`;
    }
    return `<rect x="-10" y="440" width="1620" height="174" fill="url(#flor-muro)"/>
      <rect x="-10" y="440" width="1620" height="174" fill="url(#flor-muroV)"/>
      <path d="M-10,584 L1610,584 L1610,614 L-10,614Z" fill="#E6B44C"/><path d="M-10,584 L1610,584" stroke="#C08A2A" stroke-width="2.4"/>
      <path d="M-10,612 L1610,612" stroke="#B07A22" stroke-width="2" opacity=".6"/>
      <path d="M40,560 C70,540 120,552 150,566 M900,556 C940,546 980,560 1010,572 M1380,566 C1410,552 1460,556 1490,570" stroke="#D2CABC" stroke-width="10" fill="none" opacity=".45" stroke-linecap="round"/>
      <path d="M1180,470 l8,14 l-4,10 l9,16 M330,500 l-6,12 l5,9" stroke="#B8AE9E" stroke-width="1.4" fill="none" opacity=".7"/>
      <path d="M-14,426 L1614,426 L1614,442 L-14,442Z" fill="#FBF8F2" stroke="#B4AA9A" stroke-width="1.6"/>
      <path d="M-14,428 L1614,428" stroke="#FFFFFF" stroke-width="2.4"/><path d="M-14,442 L1614,442 L1614,449 L-14,449Z" fill="#B4AA98" opacity=".45"/>
      <g><path d="${azFundo}" fill="#F4F8FC" stroke="#2A5AA8" stroke-width="1.4"/><path d="${az}" fill="#3A6AC0" stroke="#2A5AA8" stroke-width="1" opacity=".9"/>
        <path d="M570,466 h76 v52 h-76Z" fill="none" stroke="#C8BEA8" stroke-width="2.4"/><path d="M574,470 l66,0" stroke="#FFFFFF" stroke-width="2" opacity=".6"/></g>`;
  }

  /* --- gato malhado deitado em cima do muro (vira a cabeça e os olhos para o que acontece) --- */
  const GATO = { x: 1108, y: 428 };
  function gatoSVG() {
    const olho = (i, x) => `<ellipse cx="${x}" cy="-55" rx="5.4" ry="6" fill="#C9DE66" stroke="#4A2A10" stroke-width="1.3"/>
      <ellipse class="fl-gPup${i}" rx="2" ry="4.4" fill="#1A1208"/>
      <circle cx="${x - 1.6}" cy="-57.4" r="1.4" fill="#FFFFFF"/>
      <ellipse class="fl-gPalp${i}" cx="${x}" cy="-55" rx="6.4" ry="6.8" fill="#EC9E50"/>`;
    return `<g class="fl-gato" transform="translate(${GATO.x},${GATO.y})">
      <ellipse cx="6" cy="1" rx="56" ry="5" fill="#5A5040" opacity=".22"/>
      <path class="fl-gCauda" d="" stroke="#E08A3A" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path class="fl-gCaudaR" d="" stroke="#A85A26" stroke-width="10" fill="none" stroke-dasharray="5 9"/>
      <g class="fl-gCorpo">
        <path d="M-30,0 C-36,-16 -24,-40 4,-42 C30,-44 47,-28 47,-11 C47,-3 42,0 36,0 Z" fill="url(#flor-gato)" stroke="#7A3E1A" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M10,-41 C15,-31 13,-22 8,-15 M22,-39 C27,-29 27,-20 22,-13 M34,-32 C39,-23 39,-14 35,-7" stroke="#B8642A" stroke-width="3.4" fill="none" stroke-linecap="round"/>
        <path d="M-6,-38 C8,-42 22,-40 30,-34" stroke="#FFD6A0" stroke-width="2.6" fill="none" opacity=".7" stroke-linecap="round"/>
        <ellipse cx="-23" cy="-2" rx="9.5" ry="4.6" fill="#FBE2BC" stroke="#7A3E1A" stroke-width="1.2"/><ellipse cx="-8" cy="-1.5" rx="8.5" ry="4.2" fill="#FBE2BC" stroke="#7A3E1A" stroke-width="1.2"/>
        <path d="M-27,-1 l0,-2.5 M-23,-0.6 l0,-2.6 M-11,0 l0,-2.4 M-7,0.4 l0,-2.4" stroke="#C8A27A" stroke-width="1"/>
      </g>
      <g class="fl-gCabeca">
        <g class="fl-gOrelhas"><path d="M-40,-60 L-39,-82 L-24,-69 Z M-16,-69 L-1,-82 L0,-60 Z" fill="#E8964A" stroke="#7A3E1A" stroke-width="1.6" stroke-linejoin="round"/>
          <path d="M-37,-64 L-36.5,-76 L-28,-68.5 Z M-12,-68.5 L-3.5,-76 L-3,-64 Z" fill="#F4A8A8"/></g>
        <ellipse cx="-20" cy="-52" rx="23" ry="19.5" fill="url(#flor-gato)" stroke="#7A3E1A" stroke-width="1.8"/>
        <path d="M-27,-70 l2,8 M-20,-71.5 l0,9 M-13,-70 l-2,8" stroke="#B8642A" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M-43,-50 l7,1 M-43,-45 l7,-1 M3,-50 l-7,1 M3,-45 l-7,-1" stroke="#B8642A" stroke-width="2.2" stroke-linecap="round"/>
        <ellipse cx="-20" cy="-42.5" rx="11" ry="7.5" fill="#FBE2BC"/>
        ${olho(0, -29)}${olho(1, -11)}
        <path d="M-23.5,-47.5 L-16.5,-47.5 L-20,-44 Z" fill="#E8707E" stroke="#9A3A40" stroke-width=".8" stroke-linejoin="round"/>
        <path d="M-20,-44 q-2.5,4 -6,2.4 M-20,-44 q2.5,4 6,2.4" stroke="#7A3E1A" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <path d="M-31,-44 l-17,-3 M-31,-41 l-16,3 M-9,-44 l17,-3 M-9,-41 l16,3" stroke="#FFF8EC" stroke-width="1.1" opacity=".95"/>
      </g>
    </g>`;
  }

  /* --- sebe de buxo aparada (topo visto um pouco de cima e frente na sombra) --- */
  function sebeSVG() {
    const r = semente(53);
    let luz = '', esc = '', topo = 'M-20,580';
    for (let x = -20; x <= 1620; x += 40) topo += `Q${x + 20},${n(570 + r() * 4)} ${x + 40},${n(578 + r() * 4)}`;
    for (let i = 0; i < 300; i++) {
      const x = r() * 1640 - 20, y = 572 + Math.pow(r(), 1.3) * 80;
      if (y < 586 || r() < .25) luz += elip(x, y, 3 + r() * 2.5, 1.8 + r() * 1.2); else esc += elip(x, y, 3 + r() * 3, 2 + r() * 1.4);
    }
    return `<path d="${topo} L1620,654 L-20,654Z" fill="url(#flor-sebe)"/>
      <path d="${topo} L1620,592 L-20,592Z" fill="#6EA444" opacity=".7"/>
      <path d="${esc}" fill="#24501A" opacity=".55"/><path d="${luz}" fill="#9ACC66" opacity=".7"/>
      <path d="M-20,592 L1620,592" stroke="#2E5E1E" stroke-width="2" opacity=".4"/>`;
  }

  /* --- caminho de gravilha --- */
  function caminhoSVG() {
    const r = semente(61);
    let cl = '', es = '', pe = '';
    for (let i = 0; i < 420; i++) {
      const x = r() * 1620 - 10, y = 652 + r() * 104, k = .7 + (y - 652) / 104 * .6;
      if (r() < .5) cl += elip(x, y, 2 * k, 1.2 * k); else es += elip(x, y, 1.8 * k, 1.1 * k);
    }
    for (let i = 0; i < 26; i++) { const x = r() * 1600, y = 662 + r() * 86; pe += elip(x, y, 4 + r() * 3, 2.4 + r() * 1.4); }
    return `<rect x="-10" y="648" width="1620" height="116" fill="url(#flor-gravilha)"/>
      <path d="M-10,652 L1610,652 L1610,662 L-10,662Z" fill="#8A7A5E" opacity=".25"/>
      <path d="${es}" fill="#A8977A" opacity=".7"/><path d="${cl}" fill="#F8F0DE"/><path d="${pe}" fill="#C8B898" stroke="#9A8A6E" stroke-width="1"/>`;
  }

  /* --- pérgula de pilares caiados com glicínia; banco de ripas por baixo --- */
  const CACHOS = [[184, 70], [222, 54], [262, 82], [300, 62], [338, 76], [376, 58], [414, 84], [452, 66], [500, 60], [536, 74], [158, 50]];
  function cachoSVG(i, x, h) {
    const r = semente(200 + i);
    let d = '', luz = '';
    const filas = Math.round(h / 6);
    for (let j = 0; j < filas; j++) {
      const v = j / filas, w = 13 * Math.pow(1 - v, .8) + 2.5, y = j * 6;
      const k = Math.max(1, Math.round(w / 5));
      for (let m = 0; m < k; m++) {
        const xx = (k === 1 ? 0 : (m / (k - 1) - .5) * w * 1.4) + (r() - .5) * 3, rr = 4.6 - v * 2;
        d += circ(xx, y, rr);
        if (r() < .4) luz += circ(xx - 1.2, y - 1.3, rr * .45);
      }
    }
    return `<g class="fl-cacho${i}" transform="translate(${x},318)"><path d="M0,-4 L0,4" stroke="#6A8A3A" stroke-width="2"/>
      <path d="${d}" fill="url(#flor-glicinia)" stroke="#6A4AA0" stroke-width=".7"/><path d="${luz}" fill="#F4ECFC" opacity=".8"/></g>`;
  }
  function pergolaSVG() {
    const r = semente(71);
    const pilar = x => `<path d="M${x - 14},708 L${x - 12},322 L${x + 12},322 L${x + 14},708 Z" fill="url(#flor-pilar)" stroke="#9A9284" stroke-width="1.8"/>
      <path d="M${x - 18},712 L${x + 18},712 L${x + 17},694 L${x - 17},694Z" fill="#DCD4C6" stroke="#9A9284" stroke-width="1.5"/>
      <path d="M${x - 17},330 L${x + 17},330 L${x + 16},318 L${x - 16},318Z" fill="#E6DED0" stroke="#9A9284" stroke-width="1.5"/>
      <path d="M${x - 8},690 L${x - 7},336" stroke="#FFFFFF" stroke-width="4" opacity=".8"/>`;
    let ripas = '';
    for (const x of [176, 236, 296, 356, 416, 476, 536]) ripas += `M${x - 6},292 h12 v32 h-12Z`;
    let fol = '', folL = '', folE = '';
    for (let i = 0; i < 46; i++) {
      const x = 140 + r() * 440, y = 296 + (r() - .5) * 30, rr = 12 + r() * 12;
      fol += elip(x, y, rr, rr * .6);
      if (r() < .5) folL += elip(x - 3, y - 4, rr * .5, rr * .26); else folE += elip(x + 2, y + 5, rr * .55, rr * .24);
    }
    return `<ellipse cx="236" cy="714" rx="40" ry="6" fill="url(#flor-sombra)"/><ellipse cx="490" cy="714" rx="40" ry="6" fill="url(#flor-sombra)"/>
      ${pilar(222)}${pilar(478)}
      <path d="M206,708 C192,640 220,600 204,540 C188,480 218,440 206,380 C200,350 214,330 224,312" stroke="#5E4430" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M204,700 C190,640 216,600 200,540 M202,500 C190,470 214,430 204,390" stroke="#9A7A5A" stroke-width="2" fill="none" opacity=".7"/>
      <path d="M150,302 L572,302 L572,320 L150,320Z" fill="url(#flor-madeira)" stroke="#4E3420" stroke-width="1.8"/>
      <path d="${ripas}" fill="#7A5432" stroke="#4E3420" stroke-width="1.5"/>
      <path d="${fol}" fill="#3E7428"/><path d="${folE}" fill="#2A5A1C" opacity=".6"/><path d="${folL}" fill="#8CC456" opacity=".75"/>
      ${CACHOS.map(([x, h], i) => cachoSVG(i, x, h)).join('')}`;
  }
  function bancoSVG() {
    const x0 = 262, x1 = 446;
    const lado = x => `<path d="M${x},706 L${x + 2},648 M${x + 10},704 L${x + 12},584 M${x + 12},600 C${x + 2},610 ${x - 6},626 ${x - 2},640 C${x},646 ${x + 6},644 ${x + 4},638" stroke="#2E4A3A" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    let ripas = '';
    for (const y of [580, 596, 612]) ripas += `M${x0 - 4},${y} L${x1 + 12},${y} L${x1 + 12},${y + 11} L${x0 - 4},${y + 11}Z`;
    return `<ellipse cx="358" cy="708" rx="118" ry="10" fill="url(#flor-sombra)"/>
      ${lado(x0)}${lado(x1)}
      <path d="${ripas}" fill="url(#flor-madeira)" stroke="#4E3420" stroke-width="1.5"/>
      <path d="M${x0 - 4},582 L${x1 + 12},582 M${x0 - 4},598 L${x1 + 12},598 M${x0 - 4},614 L${x1 + 12},614" stroke="#D8AE80" stroke-width="1.6" opacity=".8"/>
      <path d="M${x0 - 12},640 L${x1 + 20},640 L${x1 + 14},650 L${x0 - 6},650Z M${x0 - 6},652 L${x1 + 14},652 L${x1 + 10},660 L${x0 - 2},660Z" fill="url(#flor-madeira)" stroke="#4E3420" stroke-width="1.5"/>
      <path d="M${x0 - 8},641.5 L${x1 + 18},641.5" stroke="#E2BA8C" stroke-width="1.6"/>`;
  }

  /* --- regador verde pousado no caminho --- */
  const REGADOR = { x: 1150, y: 746 };
  function regadorSVG() {
    let furos = '';
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; furos += circ(Math.cos(a) * 3.6, Math.sin(a) * 5.4, .9); }
    return `<g transform="translate(${REGADOR.x},${REGADOR.y})">
      <ellipse cx="8" cy="2" rx="46" ry="7" fill="url(#flor-sombra)"/>
      <path d="M-22,-12 L-60,-58 L-54,-62 L-18,-24 Z" fill="#4E8E6E" stroke="#24483A" stroke-width="1.5" stroke-linejoin="round"/>
      <g transform="translate(-58,-61) rotate(-40)"><ellipse rx="7.5" ry="10" fill="#6EAA8A" stroke="#24483A" stroke-width="1.5"/><path d="${furos}" fill="#24483A"/></g>
      <path d="M22,-42 C40,-38 42,-14 24,-10" stroke="#2E5E4A" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M-26,0 L-22,-46 Q0,-50 22,-46 L26,0 Q0,4 -26,0Z" fill="url(#flor-regador)" stroke="#24483A" stroke-width="1.6"/>
      <ellipse cx="0" cy="-46" rx="22" ry="4.5" fill="#2E5E4A" stroke="#24483A" stroke-width="1.2"/>
      <path d="M14,-47 C30,-72 -8,-76 -14,-48" stroke="#2E5E4A" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M-25,-16 Q0,-12 25,-16 M-24.5,-30 Q0,-26 24,-30" stroke="#24483A" stroke-width="1.6" fill="none" opacity=".5"/>
      <path d="M-17,-5 L-14,-40" stroke="#D6F0E2" stroke-width="4" opacity=".6" stroke-linecap="round"/></g>`;
  }

  /* --- canteiro: rebordo de telhas e terra --- */
  function canteiroSVG() {
    const r = semente(81);
    let telhas = '', luz = '', torroes = '';
    for (let x = -14; x < 1620; x += 26) { telhas += `M${x},762 a13,12 0 0,1 26,0Z`; luz += `M${x + 4},756 a9,8 0 0,1 12,-5`; }
    for (let i = 0; i < 160; i++) { const x = r() * 1620, y = 768 + Math.pow(r(), .8) * 132; torroes += elip(x, y, 2 + r() * 3, 1.2 + r() * 1.6); }
    return `<rect x="-10" y="758" width="1620" height="150" fill="url(#flor-terra)"/>
      <path d="${torroes}" fill="#4A2E18" opacity=".5"/>
      <path d="M-10,762 L1610,762 L1610,770 L-10,770Z" fill="#3A2414" opacity=".35"/>
      <path d="${telhas}" fill="#C8643E" stroke="#8A3A1E" stroke-width="1.3"/><path d="${luz}" stroke="#F0A276" stroke-width="2" fill="none" opacity=".8" stroke-linecap="round"/>`;
  }

  /* --- tufos de flores pequenas (malmequeres, tulipas, papoilas, alfazema): cada tufo dobra-se à volta da base --- */
  const COR_TULIPA = { vermelha: ['#E2342A', '#FF7A5E'], amarela: ['#F6BE1E', '#FFE27A'], rosa: ['#E85A8E', '#FFA6C4'] };
  function tufoSVG(cls, esp, k, sem, cor) {
    const r = semente(sem);
    let hastes = '', folhas = '', p1 = '', p2 = '', centros = '';
    const nF = esp === 'alfazema' ? 7 : esp === 'malmequer' ? 4 : 3;
    for (let i = 0; i < nF; i++) {
      const dx = (i - (nF - 1) / 2) * (esp === 'alfazema' ? 6 : 12) * k + (r() - .5) * 8 * k;
      const h = (esp === 'alfazema' ? 64 : esp === 'tulipa' ? 70 : esp === 'papoila' ? 78 : 60) * k * (.75 + r() * .4);
      const tx = dx * 1.6 + (r() - .5) * 10 * k, ty = -h, s = k;
      hastes += `M${n(dx * .3)},0 Q${n(dx * 1.1)},${n(-h * .55)} ${n(tx)},${n(ty)}`;
      if (esp === 'tulipa') {
        p1 += `M${n(tx - 8 * s)},${n(ty)} C${n(tx - 10 * s)},${n(ty - 10 * s)} ${n(tx - 8 * s)},${n(ty - 19 * s)} ${n(tx - 4 * s)},${n(ty - 21 * s)} L${n(tx)},${n(ty - 15 * s)} L${n(tx + 4 * s)},${n(ty - 21 * s)} C${n(tx + 8 * s)},${n(ty - 19 * s)} ${n(tx + 10 * s)},${n(ty - 10 * s)} ${n(tx + 8 * s)},${n(ty)} Q${n(tx)},${n(ty + 5 * s)} ${n(tx - 8 * s)},${n(ty)}Z`;
        p2 += `M${n(tx - 4 * s)},${n(ty + 1.5 * s)} C${n(tx - 5.5 * s)},${n(ty - 8 * s)} ${n(tx - 2 * s)},${n(ty - 16 * s)} ${n(tx)},${n(ty - 18 * s)} C${n(tx + 2 * s)},${n(ty - 16 * s)} ${n(tx + 5.5 * s)},${n(ty - 8 * s)} ${n(tx + 4 * s)},${n(ty + 1.5 * s)}Z`;
        const sg = i % 2 ? 1 : -1;
        folhas += `M${n(dx * .3)},0 C${n(dx * .3 + sg * 6 * s)},${n(-18 * s)} ${n(dx * .3 + sg * 14 * s)},${n(-34 * s)} ${n(dx * .3 + sg * 22 * s)},${n(-44 * s)} C${n(dx * .3 + sg * 10 * s)},${n(-34 * s)} ${n(dx * .3 + sg * 1 * s)},${n(-18 * s)} ${n(dx * .3 - sg * 4 * s)},0Z`;
      } else if (esp === 'malmequer') {
        for (let a = 0; a < 12; a++) {
          const an = a / 12 * TAU + i, ex = tx + Math.cos(an) * 9.5 * s, ey = ty + Math.sin(an) * 6.5 * s, px = -Math.sin(an) * 2.4 * s, py = Math.cos(an) * 1.6 * s;
          p1 += `M${n(tx)},${n(ty)} Q${n((tx + ex) / 2 + px)},${n((ty + ey) / 2 + py)} ${n(ex)},${n(ey)} Q${n((tx + ex) / 2 - px)},${n((ty + ey) / 2 - py)} ${n(tx)},${n(ty)}Z`;
        }
        centros += circ(tx, ty, 3.2 * s);
        p2 += circ(tx - .8 * s, ty - .9 * s, 1.3 * s);
        if (i % 2) folhas += `M${n(dx * .4)},${n(-h * .25)} q${n(-10 * s)},${n(-4 * s)} ${n(-16 * s)},${n(-12 * s)} q${n(8 * s)},${n(2 * s)} ${n(16 * s)},${n(10 * s)}Z`;
      } else if (esp === 'papoila') {
        p1 += elip(tx - 6 * s, ty - 3 * s, 9 * s, 7 * s) + elip(tx + 6 * s, ty - 3 * s, 9 * s, 7 * s);
        p2 += `M${n(tx - 11 * s)},${n(ty - 3 * s)} C${n(tx - 11 * s)},${n(ty + 6 * s)} ${n(tx - 4 * s)},${n(ty + 9 * s)} ${n(tx)},${n(ty + 9 * s)} C${n(tx + 4 * s)},${n(ty + 9 * s)} ${n(tx + 11 * s)},${n(ty + 6 * s)} ${n(tx + 11 * s)},${n(ty - 3 * s)} C${n(tx + 6 * s)},${n(ty + 1 * s)} ${n(tx - 6 * s)},${n(ty + 1 * s)} ${n(tx - 11 * s)},${n(ty - 3 * s)}Z`;
        centros += elip(tx, ty - 3 * s, 3.4 * s, 2.2 * s);
        if (i === 1) folhas += `M${n(dx * .3)},${n(-4 * s)} C${n(-10 * s)},${n(-12 * s)} ${n(-18 * s)},${n(-10 * s)} ${n(-26 * s)},${n(-4 * s)} C${n(-18 * s)},${n(-6 * s)} ${n(-12 * s)},${n(-2 * s)} ${n(dx * .3)},0Z M${n(dx * .3)},${n(-8 * s)} C${n(10 * s)},${n(-16 * s)} ${n(18 * s)},${n(-14 * s)} ${n(24 * s)},${n(-8 * s)} C${n(16 * s)},${n(-9 * s)} ${n(10 * s)},${n(-5 * s)} ${n(dx * .3)},${n(-4 * s)}Z`;
      } else {                                                   // alfazema: espigas de contas roxas
        for (let g = 0; g < 6; g++) {
          const yy = ty + 3 * s - g * 4.4 * s, rr = (3.2 - g * .25) * s;
          p1 += elip(tx + (g % 2 ? 1.6 : -1.6) * s, yy, rr * .9, rr * 1.15);
          if (g % 2 === 0) p2 += circ(tx - 2 * s, yy - 1.2 * s, rr * .45);
        }
      }
    }
    if (esp === 'alfazema') for (let i = 0; i < 9; i++) { const fx = (r() - .5) * 26 * k; folhas += `M${n(fx)},0 l${n((r() - .5) * 16 * k)},${n(-18 * k - r() * 10 * k)} l${n(2 * k)},0Z`; }
    const c = esp === 'tulipa' ? COR_TULIPA[cor] : esp === 'papoila' ? ['#C41C14', '#F0402E'] : esp === 'malmequer' ? ['#FFFFFF', '#FFF6C0'] : ['#7A52B8', '#C6A6EC'];
    const caule = esp === 'alfazema' ? '#7E9A6A' : '#4E8A30', folha = esp === 'alfazema' ? '#8AA676' : '#5E9E38';
    return `<g class="${cls}">
      <path d="${folhas}" fill="${folha}" stroke="#2E5A1E" stroke-width=".8"/>
      <path d="${hastes}" stroke="${caule}" stroke-width="${n(2.4 * k)}" fill="none" stroke-linecap="round"/>
      <path d="${p1}" fill="${c[0]}" stroke="${esp === 'malmequer' ? '#C8C2D0' : esp === 'alfazema' ? '#4A2A7A' : '#7A1A12'}" stroke-width="${esp === 'malmequer' ? .6 : .8}"/>
      ${p2 ? `<path d="${p2}" fill="${c[1]}" ${esp === 'papoila' ? 'stroke="#8A1210" stroke-width=".8"' : 'opacity=".9"'}/>` : ''}
      ${centros ? `<path d="${centros}" fill="${esp === 'papoila' ? '#2A1A20' : '#F6C624'}" stroke="${esp === 'papoila' ? '#100810' : '#C88A10'}" stroke-width=".8"/>` : ''}
    </g>`;
  }
  // [x, y da base, espécie, escala, cor] — atrás (baixas), no meio e à frente (mais altas)
  const TUFOS = [
    [180, 780, 'alfazema', .8], [300, 776, 'malmequer', .8], [420, 780, 'tulipa', .8, 'vermelha'], [540, 774, 'alfazema', .8], [660, 782, 'papoila', .75],
    [930, 778, 'malmequer', .75], [1030, 780, 'alfazema', .62], [1230, 776, 'tulipa', .8, 'amarela'], [1340, 782, 'papoila', .8], [1460, 778, 'malmequer', .8],
    [90, 820, 'papoila', 1], [230, 826, 'tulipa', 1, 'rosa'], [380, 818, 'papoila', 1], [520, 828, 'malmequer', 1], [650, 822, 'tulipa', 1, 'amarela'],
    [960, 826, 'tulipa', 1, 'vermelha'], [1090, 818, 'malmequer', 1], [1210, 828, 'alfazema', 1], [1330, 822, 'tulipa', 1, 'rosa'], [1500, 824, 'tulipa', 1, 'vermelha'],
    [140, 890, 'alfazema', 1.3], [330, 880, 'malmequer', 1.25], [500, 892, 'papoila', 1.3], [700, 886, 'tulipa', 1.2, 'vermelha'], [905, 892, 'malmequer', 1.3],
    [1100, 886, 'papoila', 1.25], [1280, 894, 'tulipa', 1.3, 'amarela'], [1460, 884, 'alfazema', 1.3]
  ];
  const TUFOS_TRAS = 10;

  /* ================= 5) Bichos ================= */
  function abelhaSVG() {
    const faixa = (x1, x2) => { const y = x => 10 * Math.sqrt(Math.max(0, 1 - Math.pow((x + 6) / 13, 2))); return `M${x1},${n(-y(x1))} Q${x1 - 2},0 ${x1},${n(y(x1))} L${x2},${n(y(x2))} Q${x2 - 2},0 ${x2},${n(-y(x2))}Z`; };
    const asas = (cls, r1, r2) => `<g class="${cls}" opacity=".5"><ellipse cx="3" cy="-14" rx="7" ry="13" transform="rotate(${r1},6,-3)" fill="#F4FAFF" stroke="#8AA0BC" stroke-width="1"/>
      <ellipse cx="9" cy="-12" rx="5" ry="10" transform="rotate(${r2},8,-3)" fill="#F4FAFF" stroke="#8AA0BC" stroke-width="1"/></g>`;
    return `<g class="fl-abelha" display="none"><g class="fl-abIn">
      <path class="fl-abPatas" d="M0,7 l-3,7 M5,8 l0,7 M10,6 l3,7" stroke="#3A2A1A" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="-6" cy="1" rx="13" ry="10" fill="#FFC83A" stroke="#6A4A1A" stroke-width="1.4"/>
      <path d="${faixa(-15, -11.5)}${faixa(-8, -4.5)}" fill="#4A3018"/>
      <path d="M-18.6,0 l-5,1.2 l5,1.6Z" fill="#4A3018"/>
      <ellipse cx="-9" cy="-5" rx="5" ry="2.4" fill="#FFF0A0" opacity=".8"/>
      <circle cx="8" cy="-1" r="7.5" fill="#7A5230" stroke="#4A3018" stroke-width="1.3"/>
      <path d="M4,-6 l-1,-2 M8,-7.5 l0,-2 M12,-6 l1,-2" stroke="#C89A5A" stroke-width="1.4" stroke-linecap="round"/>
      <circle cx="17" cy="1" r="6" fill="#3A2A1A"/><circle cx="19" cy="-.6" r="2" fill="#FFFFFF"/><circle cx="19.4" cy="-.4" r="1" fill="#1A1208"/>
      <path d="M17,-4 q2,-8 8,-9 M14.5,-4 q-1,-8 2,-11" stroke="#3A2A1A" stroke-width="1.3" fill="none"/><path d="${circ(25, -13, 1.6)}${circ(16.5, -15, 1.6)}" fill="#3A2A1A"/>
      <path class="fl-abPolen" d="${circ(-1, 13, 2.6)}${circ(6, 14, 2.4)}" fill="#FFAA1E" opacity="0"/>
      ${asas('fl-abAsaA', -22, 16)}${asas('fl-abAsaB', 30, 60)}
    </g></g>`;
  }
  const CORES_BORB = [['#FFE45A', '#E8962A', '#FF9A2E'], ['#FF9A3A', '#3A2A1A', '#FFFFFF'], ['#9ACCF6', '#3A5A9A', '#E8F4FF'], ['#FFFFFF', '#3A3A3A', '#2A2A2A']];
  function borboletaSVG(i) {
    const [c, b, m] = CORES_BORB[i];
    const asa = `<path d="M-1,-3 C-10,-26 -32,-31 -34,-16 C-35,-6 -20,-1 -1,0 Z M-1,1 C-18,2 -28,12 -22,22 C-16,28 -6,18 -1,4 Z" fill="${c}" stroke="${b}" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M-24,-27 C-31,-25 -35,-19 -34,-14 C-30,-17 -27,-21 -24,-27Z M-21,20 C-19,23 -15,23 -13,20 C-15,18 -18,18 -21,20Z ${circ(-18, -14, 3)}${circ(-14, 10, 2.4)}" fill="${m}" opacity=".9"/>`;
    return `<g class="fl-bb${i}" display="none"><g class="fl-bbIn">
      <g class="fl-bbE">${asa}</g><g class="fl-bbD">${asa}</g>
      <ellipse cx="0" cy="3" rx="2.4" ry="10" fill="#3A3026"/><circle cx="0" cy="-8.4" r="3" fill="#3A3026"/>
      <path d="M-1,-10 C-4,-17 -6,-19 -9,-20 M1,-10 C4,-17 6,-19 9,-20" stroke="#3A3026" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    </g></g>`;
  }
  function joaninhaSVG() {
    return `<g class="fl-joaninha" display="none"><g class="fl-jIn">
      <path class="fl-jPatas" d="" stroke="#1A1A1A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <g class="fl-jAsas" display="none"><path class="fl-jAsasIn" d="M-2,-3 C-10,-20 -24,-19 -22,-7 Z M-2,3 C-10,20 -24,19 -22,7Z" fill="#E8EEF4" stroke="#8A9AA8" stroke-width=".8" opacity=".75"/></g>
      <ellipse cx="9" cy="0" rx="5" ry="6" fill="#1A1A1A"/><path d="${circ(10.5, -3, 1.4)}${circ(10.5, 3, 1.4)}" fill="#FFFFFF"/>
      <g class="fl-jElE"><path d="M8,0 A10,8.5 0 0,0 -12,0 Z" fill="#D8241E" stroke="#6A0A0A" stroke-width="1.1"/><path d="${circ(-6, -3.6, 1.8)}${circ(1.5, -4.4, 1.6)}${circ(-1.5, -1.6, 1.2)}" fill="#1A1A1A"/><ellipse cx="2" cy="-5.6" rx="3" ry="1.3" fill="#FFFFFF" opacity=".55"/></g>
      <g class="fl-jElD"><path d="M8,0 A10,8.5 0 0,1 -12,0 Z" fill="#C81C18" stroke="#6A0A0A" stroke-width="1.1"/><path d="${circ(-6, 3.6, 1.8)}${circ(1.5, 4.4, 1.6)}${circ(-1.5, 1.6, 1.2)}" fill="#1A1A1A"/></g>
    </g></g>`;
  }
  function melroSVG() {
    return `<g class="fl-melro" display="none">
      <ellipse class="fl-meSombra" cx="2" cy="1" rx="24" ry="4" fill="#3A3020" opacity=".3"/>
      <g class="fl-meIn">
        <path class="fl-mePatas" d="M-3,-14 L-5,0 l-5,1 M-5,0 l3,2 M4,-14 L5,0 l-5,1 M5,0 l4,1" stroke="#5A4A3A" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14,-24 L44,-17 L42,-9 L12,-16 Z" fill="#1E1A18" stroke="#0E0C0A" stroke-width="1.2" stroke-linejoin="round"/>
        <ellipse cx="3" cy="-25" rx="20" ry="12.5" fill="#2A2420" stroke="#120E0C" stroke-width="1.4"/>
        <path d="M-4,-31 C8,-35 22,-29 27,-21 C16,-19 4,-19 -4,-25Z" fill="#3A322C"/><path d="M-6,-33 C2,-37 12,-36 20,-31" stroke="#7A7A8A" stroke-width="1.8" fill="none" opacity=".5"/>
        <g class="fl-meAsas" display="none"><path class="fl-meAsasIn" d="M-2,-28 C6,-58 22,-62 34,-56 C24,-48 14,-36 10,-26 Z" fill="#2E2824" stroke="#120E0C" stroke-width="1.2"/></g>
        <g class="fl-meCab"><circle cx="-14" cy="-34" r="9.5" fill="#2A2420" stroke="#120E0C" stroke-width="1.3"/>
          <path d="M-22,-36 L-34,-33 L-22,-30 Z" fill="#F2A818" stroke="#B8740A" stroke-width=".8" stroke-linejoin="round"/>
          <circle cx="-17" cy="-36" r="2.8" fill="#F2B830"/><circle cx="-17.4" cy="-36" r="1.5" fill="#000"/><circle cx="-18" cy="-36.8" r=".6" fill="#FFFFFF"/>
          <path class="fl-meMinhoca" d="" stroke="#E8908A" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>
      </g></g>`;
  }
  function caracolSVG() {
    let esp = '';
    for (let i = 0; i <= 24; i++) { const a = i / 24 * 2.6 * TAU, r = 12 * (1 - i / 28); esp += (i ? 'L' : 'M') + n(-4 + Math.cos(a) * r) + ',' + n(-15 + Math.sin(a) * r * .95); }
    return `<path class="fl-rasto" d="" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>
      <g class="fl-caracol" display="none"><g class="fl-caIn">
        <path class="fl-caOlhos" d="" stroke="#B8A890" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path class="fl-caBolas" d="" fill="#5A4A3A"/>
        <path d="M-20,0 C-22,-5 -12,-6 0,-6 C8,-6 12,-9 15,-15 C19,-17 23,-13 22,-8 C22,-3 18,0 12,0 Z" fill="#CDBCA2" stroke="#8A7A62" stroke-width="1.2"/>
        <path d="M-16,-2 L14,-2" stroke="#EADCC6" stroke-width="1.6" opacity=".8"/>
        <circle cx="-4" cy="-15" r="12.5" fill="url(#flor-concha)" stroke="#6A3A18" stroke-width="1.4"/>
        <path d="${esp}" stroke="#7A4A20" stroke-width="1.4" fill="none"/><path d="M-12,-22 C-8,-26 -2,-26 2,-24" stroke="#FFE2B0" stroke-width="2" fill="none" opacity=".7" stroke-linecap="round"/>
      </g></g>`;
  }

  /* --- a flor (o «animal»: zona de toque grande) --- */
  const ORDEM_PETALAS = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];      // coroa de trás (pares) e depois a da frente (ímpares)
  const GOTAS = [[1, .52, -.18], [5, .6, .22], [7, .5, -.12], [3, .62, .2], [9, .55, -.2]];   // [pétala, s, y]: as duas últimas só aparecem com a chuva
  const FOLHAS = [{ u: .2, lado: 1, L: 134, W: 30, ang: 52 }, { u: .36, lado: -1, L: 120, W: 27, ang: 50 }, { u: .56, lado: 1, L: 90, W: 21, ang: 46 }];
  function florSVG() {
    const pd = petalaD(PET.L, PET.W), vd = veiosD(PET.L, PET.W);
    let petalas = '';
    for (const i of ORDEM_PETALAS) {
      const tras = i % 2 === 0;
      petalas += `<g class="fl-p${i}"><path d="${pd}" fill="url(#flor-${tras ? 'petalaT' : 'petala'})" stroke="${tras ? '#7A1438' : '#9A2450'}" stroke-width="1.3" stroke-linejoin="round"/>
        <path class="fl-pl" d="${pd}" fill="#FFFFFF" opacity="0"/>
        <path d="${vd}" stroke="${tras ? '#8A1A44' : '#B0346A'}" stroke-width="1.15" fill="none" opacity=".5" stroke-linecap="round"/></g>`;
    }
    let sepalas = '';
    for (let k = 0; k < 5; k++) { const a = (18 + k * 72) / GRAU, c = Math.cos(a), s = Math.sin(a); const P = (x, y) => `${n(x * c - y * s)},${n(x * s + y * c)}`; sepalas += `M${P(0, -7)} C${P(34, -14)} ${P(66, -9)} ${P(88, 0)} C${P(66, 9)} ${P(34, 14)} ${P(0, 7)}Z`; }
    let estames = '';
    for (let k = 0; k < 26; k++) { const a = k / 26 * TAU; estames += circ(Math.cos(a) * 34, Math.sin(a) * 34, 2.2); }
    let graosE = '', graosC = '';
    for (let i = 1; i < 120; i++) {
      const r = 29 * Math.sqrt(i / 120), a = i * 2.39996, x = Math.cos(a) * r, y = Math.sin(a) * r, rr = 1.3 + r / 29 * 1.1;
      graosE += circ(x + .4, y + .5, rr);
      if (x + y < 8) graosC += circ(x - .5, y - .6, rr * .55);
    }
    const fBase = folhaGeo(70, 17);
    return `<g class="fl-flor">
      <rect x="610" y="262" width="380" height="540" fill="#FFFFFF" opacity="0"/>
      <ellipse cx="812" cy="796" rx="76" ry="13" fill="url(#flor-sombra)"/>
      <g transform="translate(796,794) scale(-1,1) rotate(-10)"><path d="${fBase.inf}" fill="#4A8A2C"/><path d="${fBase.sup}" fill="#78B846"/><path d="${fBase.nervura}" stroke="#C6E68E" stroke-width="1.6" fill="none" opacity=".8"/><path d="${fBase.contorno}" fill="none" stroke="#2E5A1E" stroke-width="1.4"/></g>
      <g transform="translate(804,794) rotate(-14) scale(.9)"><path d="${fBase.inf}" fill="#4A8A2C"/><path d="${fBase.sup}" fill="#80C04C"/><path d="${fBase.nervura}" stroke="#C6E68E" stroke-width="1.6" fill="none" opacity=".8"/><path d="${fBase.contorno}" fill="none" stroke="#2E5A1E" stroke-width="1.4"/></g>
      <path class="fl-caule" d="" fill="#5E9E36" stroke="#2E5A1E" stroke-width="1.6" stroke-linejoin="round"/>
      <path class="fl-cauleS" d="" stroke="#3A6E22" stroke-width="2.6" fill="none" opacity=".6" stroke-linecap="round"/>
      <path class="fl-cauleL" d="" stroke="#B8E27E" stroke-width="2.8" fill="none" opacity=".8" stroke-linecap="round"/>
      ${FOLHAS.map((f, i) => folhaSVG('fl-folha' + i, f.L, f.W, i === 0)).join('')}
      ${joaninhaSVG()}
      <g class="fl-tras"></g>
      <g class="fl-corola">
        <circle class="fl-brilho" r="190" fill="url(#flor-brilho)" opacity="0"/>
        <path d="${sepalas}" fill="#5E9A34" stroke="#2E5A1E" stroke-width="1.4"/>
        ${petalas}
        ${GOTAS.map((g, i) => `<g class="fl-gota${i}">${gotaSVG()}</g>`).join('')}
        <circle r="66" fill="url(#flor-sombraMiolo)"/>
        <circle r="37" fill="#B8680E" stroke="#7A420A" stroke-width="1.5"/><path d="${estames}" fill="#F2B42A" stroke="#A8620C" stroke-width=".7"/>
      </g>
      <g class="fl-miolo">
        <circle r="31" fill="url(#flor-miolo)" stroke="#B8740C" stroke-width="1.2"/>
        <path d="${graosE}" fill="#D08A12" opacity=".85"/><path d="${graosC}" fill="#FFF4B0" opacity=".9"/>
        <ellipse cx="-10" cy="-12" rx="10" ry="5" transform="rotate(-30,-10,-12)" fill="#FFFFFF" opacity=".45"/>
      </g>
      <g class="fl-frente"></g>
      ${abelhaSVG()}
    </g>`;
  }

  /* ================= 6) montar() ================= */
  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .45 : 1;
    const N_CLONES = 8;
    const petalaClone = petalaD(PET.L, PET.W), veiosClone = veiosD(PET.L, PET.W);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    const tufo = (t, i) => `<g class="fl-tufo${i}" transform="translate(${t[0]},${t[1]})">${tufoSVG('fl-tIn', t[2], t[3], 300 + i * 7, t[4])}</g>`;
    svg.innerHTML = `<defs>${defs()}</defs>
      ${ceuSVG()}${arvoresSVG()}${muroSVG()}${gatoSVG()}${sebeSVG()}${caminhoSVG()}${pergolaSVG()}${bancoSVG()}${regadorSVG()}
      ${melroSVG()}
      ${canteiroSVG()}
      ${caracolSVG()}
      ${TUFOS.slice(0, TUFOS_TRAS).map(tufo).join('')}
      ${florSVG()}
      ${TUFOS.slice(TUFOS_TRAS).map((t, i) => tufo(t, i + TUFOS_TRAS)).join('')}
      <g class="fl-borbs">${[0, 1, 2, 3].map(borboletaSVG).join('')}</g>
      <g pointer-events="none">
        <path class="fl-chuva" d="" stroke="#E8F2FA" stroke-width="2" stroke-linecap="round" opacity=".8"/>
        <path class="fl-salpicos" d="" stroke="#F4FAFF" stroke-width="1.4" fill="none" opacity=".8"/>
        <g class="fl-clones">${Array.from({ length: N_CLONES }, (_, i) => `<g class="fl-c${i}" display="none"><path d="${petalaClone}" fill="url(#flor-petala)" stroke="#9A2450" stroke-width="1.3"/><path d="${veiosClone}" stroke="#B0346A" stroke-width="1.1" fill="none" opacity=".5"/></g>`).join('')}</g>
        <g class="fl-gotaCai" display="none">${gotaSVG()}</g>
        <path class="fl-poeira" d="" fill="#FFF8D8" opacity=".65"/>
        <path class="fl-polen0" d="" fill="#F2B21E"/><path class="fl-polen1" d="" fill="#FFF2A0"/>
        <path class="fl-estrelas" d="" fill="#FFFBE0"/>
      </g>
      <rect width="1600" height="900" fill="url(#flor-luzQuente)" pointer-events="none"/>
      <rect width="1600" height="900" fill="url(#flor-vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s);
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; el.setAttribute(nome, v); } }

    const R = {
      flor: q('.fl-flor'), caule: q('.fl-caule'), cauleS: q('.fl-cauleS'), cauleL: q('.fl-cauleL'),
      folhas: FOLHAS.map((_, i) => q('.fl-folha' + i)), folhasIn: FOLHAS.map((_, i) => q('.fl-folha' + i + ' .fl-fIn')),
      corola: q('.fl-corola'), miolo: q('.fl-miolo'), brilho: q('.fl-brilho'), tras: q('.fl-tras'), frente: q('.fl-frente'),
      petalas: Array.from({ length: PET.n }, (_, i) => q('.fl-p' + i)), luzes: Array.from({ length: PET.n }, (_, i) => q('.fl-p' + i + ' .fl-pl')),
      gotas: GOTAS.map((_, i) => q('.fl-gota' + i)), gotaCai: q('.fl-gotaCai'),
      clones: Array.from({ length: N_CLONES }, (_, i) => q('.fl-c' + i)),
      polen: [q('.fl-polen0'), q('.fl-polen1')], estrelas: q('.fl-estrelas'), poeira: q('.fl-poeira'), chuva: q('.fl-chuva'), salpicos: q('.fl-salpicos'),
      abelha: q('.fl-abelha'), abIn: q('.fl-abIn'), abAsas: [q('.fl-abAsaA'), q('.fl-abAsaB')], abPolen: q('.fl-abPolen'), abPatas: q('.fl-abPatas'),
      borbs: [0, 1, 2, 3].map(i => q('.fl-bb' + i)), borbsG: q('.fl-borbs'),
      joan: q('.fl-joaninha'), jIn: q('.fl-jIn'), jPatas: q('.fl-jPatas'), jAsas: q('.fl-jAsas'), jAsasIn: q('.fl-jAsasIn'), jElE: q('.fl-jElE'), jElD: q('.fl-jElD'),
      melro: q('.fl-melro'), meIn: q('.fl-meIn'), meAsas: q('.fl-meAsas'), meAsasIn: q('.fl-meAsasIn'), meCab: q('.fl-meCab'), mePatas: q('.fl-mePatas'), meSombra: q('.fl-meSombra'), meMinhoca: q('.fl-meMinhoca'),
      caracol: q('.fl-caracol'), caIn: q('.fl-caIn'), caOlhos: q('.fl-caOlhos'), caBolas: q('.fl-caBolas'), rasto: q('.fl-rasto'),
      gato: q('.fl-gato'), gCorpo: q('.fl-gCorpo'), gCabeca: q('.fl-gCabeca'), gOrelhas: q('.fl-gOrelhas'), gCauda: q('.fl-gCauda'), gCaudaR: q('.fl-gCaudaR'),
      gPup: [q('.fl-gPup0'), q('.fl-gPup1')], gPalp: [q('.fl-gPalp0'), q('.fl-gPalp1')],
      nuvens: [0, 1, 2].map(i => q('.fl-nuvem' + i)), nuvemChuva: q('.fl-nuvemChuva'), arco: q('.fl-arco'),
      and: [0, 1].map(i => q('.fl-and' + i)), andAsas: [0, 1].map(i => q('.fl-and' + i + ' .fl-andAsas')),
      copas: [0, 1, 2].map(i => q('.fl-copa' + i)), cachos: CACHOS.map((_, i) => q('.fl-cacho' + i)), tufos: TUFOS.map((_, i) => q('.fl-tufo' + i))
    };
    const borbs = R.borbs.map((el, i) => ({ el, i, In: el.querySelector('.fl-bbIn'), E: el.querySelector('.fl-bbE'), D: el.querySelector('.fl-bbD'), ativo: false, modo: '', x: 0, y: 0, vx: 0, vy: 0, rot: 0, fase: aleat(0, TAU), freq: 7, esc: .9, idade: 0, cam: '', ph: aleat(0, TAU), abre: 1 }));

    /* --- estado --- */
    let tempo = 0, vivo = true, semEventos = false;
    const F = { sx: 0, vx: 0, inc: 0, vinc: 0 };            // mola do caule (desvio da ponta) e rotação atrasada da corola
    const G = { P: null, C: [800, 392], M: [1, 0, 0, 1, 800, 392], Mm: null, abre: 1, esc: 1, r0: PET.r0, pet: [] };
    const petalas = Array.from({ length: PET.n }, (_, i) => ({ a: i * 36 + 4, ph: aleat(0, TAU), presente: 1, ef: 0 }));
    const gotas = GOTAS.map((g, i) => ({ p: g[0], s: g[1], y: g[2], op: i < 3 ? 1 : 0, estica: 0 }));
    let foco = null;                                         // o que o gato está a ver (x, y) ou null

    /* --- envelopes: efeitos que se somam e se apagam sozinhos (interromper nunca deixa nada partido) --- */
    const envs = [];
    const E = { vento: 0, abre: 0, esc: 0, brilho: 0, yaw: 0, pitch: 0, empurra: 0, tremor: 0, inc: 0 };
    function impulso(chave, amp, dur, tipo) { envs.push({ chave, amp, dur, t: 0, tipo: tipo || 'sino' }); }
    function forma(e) {
      const u = limita(e.t / e.dur, 0, 1);
      if (e.tipo === 'sino') return sino(u);
      if (e.tipo === 'plato') return passoS(0, .25, u) * (1 - passoS(.75, 1, u));
      if (e.tipo === 'ataque') { const a = Math.min(.3, 90 / e.dur); return u < a ? esai(u / a) : 1 - eseno((u - a) / (1 - a)); }
      if (e.tipo === 'mola') { const a = Math.min(.3, 110 / e.dur); if (u < a) return esai(u / a); const w = (u - a) / (1 - a); return Math.cos(w * PI * 2.5) * Math.pow(1 - w, 1.6); }
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
      E.abre = limita(E.abre, -.38, .2); E.esc = limita(E.esc, -.05, .16); E.brilho = limita(E.brilho, 0, 1.2); E.tremor = limita(E.tremor, 0, 1.5);
      E.yaw = limita(E.yaw, -.45, .45); E.pitch = limita(E.pitch, -.2, .4); E.empurra = limita(E.empurra, -60, 60); E.vento = limita(E.vento, 0, 1.5); E.inc = limita(E.inc, -.4, .4);
    }
    // brisa: varia devagar e corre da esquerda para a direita
    function ventoEm(x) {
      const t = tempo / 1000;
      return (.5 + .24 * Math.sin(t * .31) + .14 * Math.sin(t * .77 + 1.3) + .07 * Math.sin(t * 1.9) + .1 * Math.sin(t * 1.3 - x * .006) + E.vento) * calma;
    }

    /* --- a flor: mola do caule, orientação da corola (disco 2,5D) e posição de cada pétala --- */
    function fisica(dt) {
      const s = dt / 1000, t = tempo / 1000;
      const V = ventoEm(BASE[0]);
      const alvo = ((V - .5 * calma) * 34 + 5 * Math.sin(t * 1.21) * calma) + E.empurra;
      // mola subamortecida (~0,85 Hz): a ponta do caule passa do sítio e volta
      F.vx += (29 * (alvo - F.sx) - 2.1 * F.vx) * s;
      F.vx = limita(F.vx, -1500, 1500);
      F.sx += F.vx * s;
      if (Math.abs(F.sx) > 140) { F.sx = Math.sign(F.sx) * 140; F.vx *= .3; }
      const tipX = BASE[0] + F.sx, tipY = BASE[1] - Math.sqrt(LC * LC - F.sx * F.sx);
      const ang = Math.atan2(F.sx, LC) * 1.3;
      // a corola vem atrasada: mola mais lenta que segue a inclinação da ponta
      F.vinc += (24 * (ang * .9 + E.inc - F.inc) - 3.4 * F.vinc) * s;
      F.inc = limita(F.inc + F.vinc * s, -.9, .9);
      G.P = [[BASE[0], BASE[1]], [BASE[0] + F.sx * .04, BASE[1] - LC * .34], [tipX - Math.sin(ang) * LC * .34, tipY + Math.cos(ang) * LC * .34], [tipX, tipY]];
      G.C = [tipX, tipY];
      const yaw = .05 * Math.sin(t * .29) + F.sx * .0016 + E.yaw;
      const pitch = .17 + .04 * Math.sin(t * .47 + 1) + E.pitch;
      const esc = 1 + E.esc + .012 * Math.sin(t * 1.6);
      const inc = F.inc;
      const a0 = Math.cos(yaw), c0 = Math.sin(pitch) * Math.sin(yaw), d0 = Math.cos(pitch);
      const ci = Math.cos(inc), si = Math.sin(inc);
      const a = ci * a0 * esc, b = si * a0 * esc, c = (ci * c0 - si * d0) * esc, d = (si * c0 + ci * d0) * esc;
      G.M = [a, b, c, d, tipX, tipY];
      // a cúpula do miolo sobe ao longo da normal do disco
      const h = 8 * esc, nx = Math.sin(yaw) * Math.cos(pitch) * h, ny = -Math.sin(pitch) * h;
      const km = 1 + .04 * E.brilho + .015 * Math.sin(t * 1.7);
      G.Mm = [a * km, b * km, c * km, d * km, tipX + ci * nx - si * ny, tipY + si * nx + ci * ny];
      G.esc = esc;
      G.abre = limita(1 + E.abre, .55, 1.25);
      G.r0 = PET.r0 * (.7 + .3 * G.abre);
      G.yaw = yaw; G.pitch = pitch;
      for (let i = 0; i < PET.n; i++) {
        const p = petalas[i];
        const resp = 1 + .025 * Math.sin(t * 1.6 + p.ph);                      // as pétalas «respiram»
        const tremor = E.tremor * 7 * Math.sin(t * 23 + p.ph * 3) + p.ef * Math.sin(t * 30 + p.ph);
        const pres = p.presente;
        G.pet[i] = {
          a: p.a + 1.3 * Math.sin(t * .9 + p.ph) + tremor,
          sl: G.abre * resp * (.15 + .85 * pres),
          sw: (.8 + .2 * G.abre) * (1 + .02 * Math.sin(t * 1.3 + p.ph)) * (.3 + .7 * pres),
          op: Math.min(1, pres * 3)
        };
      }
    }
    const mundo = (Mx, x, y) => [Mx[0] * x + Mx[2] * y + Mx[4], Mx[1] * x + Mx[3] * y + Mx[5]];
    // ponto numa pétala (s ao longo, y de −1 a 1 na largura) em coordenadas da corola
    function pontoPetalaLocal(i, s, y) {
      const g = G.pet[i], a = g.a / GRAU, ca = Math.cos(a), sa = Math.sin(a);
      const lx = G.r0 + s * PET.L * g.sl, ly = y * PET.W * g.sw;
      return [lx * ca - ly * sa, lx * sa + ly * ca];
    }
    const pontoPetala = (i, s, y) => { const [x, yy] = pontoPetalaLocal(i, s, y); return mundo(G.M, x, yy); };
    function angPetalaMundo(i) { const a = G.pet[i].a / GRAU, ca = Math.cos(a), sa = Math.sin(a); return Math.atan2(G.M[1] * ca + G.M[3] * sa, G.M[0] * ca + G.M[2] * sa); }
    const centroMiolo = () => [G.Mm[4], G.Mm[5]];

    /* --- desenho da flor --- */
    function desenharFlor() {
      const t = tempo / 1000;
      // caule: contorno com largura que afina e linhas de luz (esquerda) e sombra (direita)
      const pts = [], luz = [], sombra = [];
      for (let k = 0; k <= 16; k++) {
        const u = k / 16, [x, y] = bez(G.P, u), dir = bezDir(G.P, u), tx = Math.cos(dir), ty = Math.sin(dir);
        const w = lerp(13, 8.6, u) + 2.2 * Math.exp(-Math.pow((u - .2) / .03, 2)) + 2 * Math.exp(-Math.pow((u - .36) / .03, 2)) + 1.6 * Math.exp(-Math.pow((u - .56) / .03, 2));
        pts.push([x, y, w]);
        luz.push([x + ty * w * .26, y - tx * w * .26]);
        sombra.push([x - ty * w * .3, y + tx * w * .3]);
      }
      atr(R.caule, 'd', contornoFita(pts));
      atr(R.cauleL, 'd', linhaPor(luz.slice(1, 15)));
      atr(R.cauleS, 'd', linhaPor(sombra.slice(1, 16)));
      // folhas presas ao caule (a da esquerda é a da direita espelhada); abanam com a brisa e com o toque
      FOLHAS.forEach((f, i) => {
        const [x, y] = bez(G.P, f.u), tau = bezDir(G.P, f.u) * GRAU;
        const V = ventoEm(x);
        const abana = (2 + 4 * V) * Math.sin(t * 2.1 + i * 1.7) + E.tremor * 9 * Math.sin(t * 17 + i) + F.vx * .012 * (i + 1) * f.lado;
        const rot = f.lado > 0 ? tau + f.ang + abana : (180 - tau) + f.ang - abana;
        poe(R.folhas[i], `translate(${n(x)},${n(y)})${f.lado < 0 ? ' scale(-1,1)' : ''} rotate(${n(rot)})`);
        poe(R.folhasIn[i], `scale(1,${n3(1 + .07 * Math.sin(t * 1.5 + i * 2))})`);
      });
      // corola
      const [a, b, c, d, e, f] = G.M;
      poe(R.corola, `matrix(${n3(a)},${n3(b)},${n3(c)},${n3(d)},${n(e)},${n(f)})`);
      const Mm = G.Mm;
      poe(R.miolo, `matrix(${n3(Mm[0])},${n3(Mm[1])},${n3(Mm[2])},${n3(Mm[3])},${n(Mm[4])},${n(Mm[5])})`);
      for (let i = 0; i < PET.n; i++) {
        const g = G.pet[i];
        poe(R.petalas[i], `rotate(${n(g.a)}) translate(${n(G.r0)},0) scale(${n3(g.sl)},${n3(g.sw)})`);
        atr(R.petalas[i], 'opacity', n3(g.op));
        // luz de cima à esquerda: as pétalas viradas para o sol ficam mais claras, as do lado de lá mais escuras
        const l = Math.cos(angPetalaMundo(i) - LUZ);
        atr(R.luzes[i], 'fill', l > 0 ? '#FFFFFF' : '#5A0A28');
        atr(R.luzes[i], 'opacity', n3(l > 0 ? .3 * l + .12 * E.brilho : -.2 * l));
      }
      atr(R.brilho, 'opacity', n3(limita(E.brilho * .85, 0, 1)));
      poe(R.brilho, `scale(${n3(.8 + .35 * E.brilho)})`);
      // gotas de orvalho presas às pétalas
      gotas.forEach((g, i) => {
        const el = R.gotas[i];
        if (g.op <= .01 || G.pet[g.p].op < .5) { atr(el, 'display', 'none'); return; }
        atr(el, 'display', 'inline');
        const [x, y] = pontoPetalaLocal(g.p, g.s, g.y);
        const an = G.pet[g.p].a;
        poe(el, `translate(${n(x)},${n(y)}) rotate(${n(an)}) scale(${n3((1 + g.estica * .6) * .95)},${n3((1 - g.estica * .2) * .95)})`);
        atr(el, 'opacity', n3(g.op));
      });
    }

    /* --- partículas: pólen dourado, estrelinhas e pétalas soltas --- */
    const polen = [];
    function soltarPolen(x, y, k, forca, estrelas) {
      for (let i = 0; i < k; i++) {
        if (polen.length > 220) polen.shift();
        const a = aleat(0, TAU), v = aleat(.35, 1) * forca;
        polen.push({ x: x + Math.cos(a) * 14, y: y + Math.sin(a) * 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v - forca * .35, idade: 0, dur: aleat(1200, 2400), tam: aleat(2.2, 4.4), tipo: estrelas && i % 4 === 0 ? 2 : i % 3 ? 0 : 1, ph: aleat(0, TAU) });
      }
    }
    function atualizarPolen(dt) {
      const s = dt / 1000, d = ['', '', ''];
      for (let i = polen.length - 1; i >= 0; i--) {
        const p = polen[i];
        p.idade += dt;
        if (p.idade >= p.dur) { polen.splice(i, 1); continue; }
        const k = Math.exp(-s * 2.2);
        p.vx = p.vx * k + (ventoEm(p.x) * 40 + 14 * Math.sin(p.idade * .004 + p.ph)) * s * 2;
        p.vy = p.vy * k + 36 * s;
        p.x += p.vx * s; p.y += p.vy * s;
        const u = p.idade / p.dur, r = p.tam * (u < .1 ? u / .1 : 1 - Math.pow(u, 3));
        if (r <= .1) continue;
        if (p.tipo === 2) { const e = r * 2.2 * (.7 + .3 * Math.sin(p.idade * .02 + p.ph)); d[2] += `M${n(p.x)},${n(p.y - e)}Q${n(p.x)},${n(p.y)} ${n(p.x + e)},${n(p.y)}Q${n(p.x)},${n(p.y)} ${n(p.x)},${n(p.y + e)}Q${n(p.x)},${n(p.y)} ${n(p.x - e)},${n(p.y)}Q${n(p.x)},${n(p.y)} ${n(p.x)},${n(p.y - e)}Z`; }
        else d[p.tipo] += circ(p.x, p.y, r);
      }
      atr(R.polen[0], 'd', d[0]); atr(R.polen[1], 'd', d[1]); atr(R.estrelas, 'd', d[2]);
    }
    const clones = R.clones.map(el => ({ el, ativo: false, x: 0, y: 0, vx: 0, vy: 0, rot: 0, base: 0, fase: 0, w: 1, k: 1, idade: 0, chao: 840, pousada: 0, op: 1 }));
    function soltarClone(i, k, vx, vy) {
      let c = clones.find(v => !v.ativo);
      if (!c) c = clones.reduce((a, b) => a.idade > b.idade ? a : b);
      const [x, y] = pontoPetala(i, .45, 0);
      const base = angPetalaMundo(i) * GRAU, deitada = Math.cos(base / GRAU) >= 0 ? 12 : 168;
      Object.assign(c, { ativo: true, x, y, vx, vy, base, deitada, rot: 0, fase: aleat(0, TAU), w: aleat(2.2, 3.2), k: k * G.esc, idade: 0, chao: aleat(800, 880), pousada: 0, op: 1 });
      atr(c.el, 'display', 'inline');
      return c;
    }
    function atualizarClones(dt) {
      const s = dt / 1000;
      for (const c of clones) {
        if (!c.ativo) continue;
        c.idade += dt;
        if (c.pousada > 0) {
          c.pousada += dt;
          c.op = 1 - passoS(2200, 3200, c.pousada);
          if (c.pousada > 3200) { c.ativo = false; atr(c.el, 'display', 'none'); continue; }
        } else {
          // cai a planar como uma folha: pêndulo para os lados, devagar, a rodar e a virar
          c.fase += s * c.w;
          const amort = Math.exp(-s * 2.5);
          c.vx = c.vx * amort + (Math.cos(c.fase) * 70 + ventoEm(c.x) * 30) * s * 2.5;
          c.vy = c.vy * amort + (60 + 30 * Math.abs(Math.sin(c.fase))) * s * 2.5;
          c.x += c.vx * s; c.y += c.vy * s;
          // plana quase deitada e baloiça de um lado para o outro
          c.base += (c.deitada + 38 * Math.sin(c.fase) - c.base) * Math.min(1, s * 1.5);
          if (c.y >= c.chao) { c.y = c.chao; c.pousada = 1; c.base = c.deitada; }
        }
        const vira = c.pousada > 0 ? .55 : Math.cos(c.fase * .7) * .8;
        const sy = (vira < 0 ? -1 : 1) * Math.max(.4, Math.abs(vira));
        poe(c.el, `translate(${n(c.x)},${n(c.y)}) rotate(${n(c.base)}) scale(${n3(c.k * (c.pousada > 0 ? .9 : 1))},${n3(c.k * sy)}) translate(${n(-PET.L * .45)},0)`);
        atr(c.el, 'opacity', n3(c.op));
      }
    }

    /* --- borboletas (para as reações voam livres; nas variações são guiadas) --- */
    function camadaBorb(b, nova) {
      if (b.cam === nova) return;
      (nova === 'tras' ? R.tras : nova === 'frente' ? R.frente : R.borbsG).appendChild(b.el);
      b.cam = nova;
    }
    function desenharBorb(b, dt) {
      b.fase += dt / 1000 * b.freq * TAU;
      const f = b.modo === 'pousada' ? .12 + .88 * Math.pow(Math.abs(Math.cos(b.fase)), 1.5) * b.abre : .15 + .85 * Math.abs(Math.cos(b.fase));
      poe(b.E, `scale(${n3(f)},1)`); poe(b.D, `scale(${n3(-f)},1)`);
      poe(b.el, `translate(${n(b.x)},${n(b.y)})`);
      poe(b.In, `rotate(${n(b.rot)}) scale(${n3(b.esc)})`);
    }
    function atualizarBorbs(dt) {
      const s = dt / 1000;
      for (const b of borbs) {
        if (!b.ativo) continue;
        if (b.modo === 'livre') {
          b.idade += dt;
          const sai = b.idade > 1300;                 // primeiro esvoaçam perto da flor, depois vão-se embora
          const avx = sai ? b.alvoVx : b.alvoVx * .3, avy = sai ? b.alvoVy : -25;
          b.vx += (avx - b.vx) * Math.min(1, s * 1.6) + Math.sin(b.idade * .006 + b.ph) * 300 * s;
          b.vy += (avy - b.vy) * Math.min(1, s * 1.4) + Math.cos(b.idade * .009 + b.ph) * 240 * s;
          b.x += b.vx * s; b.y += b.vy * s;
          b.rot = limita(b.vx * .05, -28, 28);
          const dist = Math.hypot(b.x - G.C[0], b.y - G.C[1]);
          if (dist > 105 || b.idade > 600) camadaBorb(b, 'fora');
          if (b.x < -80 || b.x > 1680 || b.y < -80 || b.idade > 7000) { b.ativo = false; atr(b.el, 'display', 'none'); camadaBorb(b, 'fora'); continue; }
        }
        desenharBorb(b, dt);
      }
    }

    /* --- cenário vivo --- */
    const poeira = Array.from({ length: 16 }, (_, i) => ({ x: aleat(150, 760), y: aleat(150, 620), r: aleat(1.3, 2.6), ph: aleat(0, TAU), f: aleat(.2, .5) }));
    function animarCena(dt) {
      const t = tempo / 1000, s = dt / 1000;
      // nuvens a passar devagar
      R.nuvens.forEach((g, i) => {
        const y = [96, 168, 62][i], x0 = [420, 1040, 1420][i], v = [9, 6, 11][i];
        poe(g, `translate(${n(-260 + ((x0 + 260 + t * v * calma) % 2120))},${y})`);
      });
      // andorinhas em voltas largas
      R.and.forEach((g, i) => {
        const a = t * (.42 + i * .07) * calma + i * 2.6;
        const x = [360, 1080][i] + Math.cos(a) * [170, 140][i], y = [190, 150][i] + Math.sin(a * 2) * 40;
        const vx = -Math.sin(a), vy = Math.cos(a * 2) * .47;
        const bate = Math.sin(t * .9 + i * 2) > .2 ? Math.sin(t * 16 + i) : .3;
        poe(g, `translate(${n(x)},${n(y)}) rotate(${n(Math.atan2(vy, vx) * GRAU)}) scale(.9)`);
        poe(R.andAsas[i], `scale(1,${n3(.35 + .65 * bate)})`);
      });
      // copas das árvores: um embalo muito lento
      R.copas.forEach((g, i) => {
        const cx = [120, 760, 1092][i], cy = [430, 430, 440][i], V = ventoEm(cx);
        poe(g, `translate(${cx},${cy}) skewX(${n3((.8 * Math.sin(t * .7 + i * 2) + 1.2 * V) * calma)}) translate(${-cx},${-cy})`);
      });
      // cachos de glicínia a baloiçar
      R.cachos.forEach((g, i) => {
        const x = CACHOS[i][0], V = ventoEm(x);
        poe(g, `translate(${x},318) rotate(${n((-2 - 5 * V - 3 * Math.sin(t * 1.4 + i * .9) * (.4 + V)) * calma)})`);
      });
      // tufos de flores pequenas: dobram-se à volta da base com a brisa (e com a rajada do toque)
      R.tufos.forEach((g, i) => {
        const [x, y] = TUFOS[i], V = ventoEm(x), rig = TUFOS[i][3] > 1.1 ? .7 : 1;
        poe(g, `translate(${x},${y}) rotate(${n3((1.5 + 4 * V + 2 * Math.sin(t * 1.9 - x * .012 + i)) * rig * calma)})`);
      });
      // poeira de luz a flutuar no raio de sol
      let d = '';
      for (const p of poeira) {
        p.x += (ventoEm(p.x) * 10 + 4 * Math.sin(t * p.f + p.ph)) * s * calma; p.y += 6 * Math.sin(t * p.f * 1.3 + p.ph) * s;
        if (p.x > 820) p.x = 140;
        const o = .5 + .5 * Math.sin(t * 1.2 + p.ph);
        d += circ(p.x, p.y, p.r * (.5 + .5 * o));
      }
      atr(R.poeira, 'd', d);
    }

    /* --- gato: cauda a balançar, piscar, cabeça e olhos que seguem o que acontece --- */
    const gato = { olhaX: 800, olhaY: 392, alvoX: 800, alvoY: 392, prox: 2000, pisca: -1, proxPisca: 2500, susto: 0, atento: 0, agacha: 0 };
    function atualizarGato(dt) {
      const t = tempo / 1000, g = gato;
      g.prox -= dt;
      if (foco) { g.alvoX = foco[0]; g.alvoY = foco[1]; }
      else if (g.prox <= 0) { g.prox = aleat(1800, 4500); [g.alvoX, g.alvoY] = escolhe([[G.C[0], G.C[1]], [G.C[0], G.C[1]], [300, 360], [1150, 720], [700, 200], [GATO.x - 200, 700]]); }
      const k = 1 - Math.exp(-dt / (foco ? 90 : 260));
      g.olhaX += (g.alvoX - g.olhaX) * k; g.olhaY += (g.alvoY - g.olhaY) * k;
      g.atento += ((foco ? 1 : 0) - g.atento) * (1 - Math.exp(-dt / 400));
      g.susto = Math.max(0, g.susto - dt / 900);
      const hx = GATO.x - 20, hy = GATO.y - 52;
      const dx = limita((g.olhaX - hx) / 160, -1, 1), dy = limita((g.olhaY - hy) / 160, -1, 1);
      poe(R.gCabeca, `translate(${n(dx * 2 + g.agacha * -1)},${n(g.agacha * 3 - 2 * g.susto)}) rotate(${n(limita((g.olhaY - hy) / 40, -8, 10) * -dx * .8 + Math.sin(t * .6) * 1.5)},-20,-36)`);
      poe(R.gOrelhas, `translate(0,${n(-2.5 * g.susto - 1.2 * g.atento)}) scale(1,${n3(1 + .08 * g.susto)})`);
      poe(R.gCorpo, `translate(0,${n(g.agacha * 2)}) scale(1,${n3(1 - g.agacha * .06 + .015 * Math.sin(t * 1.4))})`);
      const dil = 1 + .35 * g.susto + .25 * g.atento;
      [-29, -11].forEach((x, i) => poe(R.gPup[i], `translate(${n(x + dx * 2.4)},${n(-55 + dy * 2)}) scale(${n3(dil)},${n3(1 - .1 * g.atento)})`));
      g.proxPisca -= dt;
      if (g.proxPisca <= 0 && g.pisca < 0) { g.pisca = 0; g.proxPisca = aleat(2200, 6000); if (Math.random() < .25) g.proxPisca = 320; }
      let fecha = .02;
      if (g.pisca >= 0) { g.pisca += dt; fecha = Math.max(.02, sino(g.pisca / 200)); if (g.pisca >= 200) g.pisca = -1; }
      if (g.susto > .3) fecha = .02;
      R.gPalp.forEach((el, i) => { const x = [-29, -11][i]; poe(el, `translate(0,-61.8) scale(1,${n3(fecha)}) translate(0,61.8)`); });
      // cauda pendurada no muro: balança devagar (e depressa quando está atento)
      const bal = (8 * Math.sin(t * 1.1) + 4 * Math.sin(t * 2.3)) * (1 - .5 * g.atento) + g.atento * 6 * Math.sin(t * 7) + g.susto * 10 * Math.sin(t * 12);
      const cauda = `M40,-6 C56,-4 60,8 58,24 C${n(56 + bal * .3)},40 ${n(60 + bal * .8)},54 ${n(66 + bal * 1.6)},${n(66 - Math.abs(bal) * .3)}`;
      atr(R.gCauda, 'd', cauda); atr(R.gCaudaR, 'd', cauda);
    }

    /* --- tarefas: geradores que avançam com o dt do relógio (uma por faixa) --- */
    const faixas = new Map();
    function lancar(nome, gen, fim) {
      if (!vivo) return;
      const ant = faixas.get(nome);
      if (ant && ant.g.limpar) ant.g.limpar();
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
    function* durante(ms, f) { let t = 0; for (;;) { const u = ms > 0 ? Math.min(1, t / ms) : 1; if (f(u, t) === true || u >= 1) return; t += yield; } }   // f devolve true para acabar antes
    let assustar = 0;                                     // o toque assusta os bichos pousados na flor

    /* --- variações ociosas (a cada 4–9 s, sem repetir a mesma seguida) --- */
    const abelha = { x: 1700, y: 300, rot: 0, dir: -1, voa: true };
    function poeAbelha(dt) {
      const voa = abelha.voa;
      const quadro = Math.floor(tempo / 16.7) % 2;
      atr(R.abAsas[0], 'opacity', voa ? (quadro ? .55 : .25) : .7);
      atr(R.abAsas[1], 'opacity', voa ? (quadro ? .25 : .55) : 0);
      poe(R.abelha, `translate(${n(abelha.x)},${n(abelha.y)})`);
      poe(R.abIn, `scale(${abelha.dir > 0 ? 1.45 : -1.45},1.45) rotate(${n(abelha.rot)})`);
    }
    function* varAbelha() {                    // uma abelha vem, pousa no miolo, anda um bocadinho e vai-se
      atr(R.abelha, 'display', 'inline'); atr(R.abPolen, 'opacity', 0);
      abelha.voa = true;
      const de = escolhe([[1700, 260], [-100, 300]]);
      abelha.dir = de[0] < 800 ? 1 : -1;
      let px = de[0];
      yield* durante(2400, (u, tt) => {
        const [mx, my] = centroMiolo();
        const e = eseno(u);
        abelha.x = lerp(de[0], mx, e) + 30 * Math.sin(tt * .006) * (1 - u);
        abelha.y = lerp(de[1], my - 16, e) - 70 * sino(u) + 8 * Math.sin(tt * .011) * (1 - u);
        abelha.dir = abelha.x > px + .5 ? 1 : abelha.x < px - .5 ? -1 : abelha.dir; px = abelha.x;
        abelha.rot = 6 * Math.sin(tt * .008);
        foco = [abelha.x, abelha.y]; poeAbelha();
      });
      abelha.voa = false;
      let ang = 0, sai = false;
      yield* durante(3600, (u, tt) => {
        if (assustar > 0) sai = true;
        const [mx, my] = centroMiolo();
        ang = tt * .0012;
        abelha.x = mx + 9 * Math.cos(ang * 2.2) + 2 * Math.sin(tt * .03); abelha.y = my - 16 + 4 * Math.sin(ang * 2.2) - 1.5 * Math.abs(Math.sin(tt * .02));
        abelha.dir = Math.sin(ang * 2.2) < 0 ? 1 : -1; abelha.rot = 4 * Math.sin(tt * .02);
        atr(R.abPolen, 'opacity', n3(passoS(.2, .6, u)));
        if (Math.random() < .03) soltarPolen(mx, my, 1, 40);
        foco = [abelha.x, abelha.y]; poeAbelha();
        if (sai) return true;
      });
      abelha.voa = true;
      const x0 = abelha.x, y0 = abelha.y, para = abelha.x < 800 ? [1720, 180] : [-120, 200];
      abelha.dir = para[0] > x0 ? 1 : -1;
      yield* durante(2200, (u, tt) => {
        const e = u * u * (3 - 2 * u);
        abelha.x = lerp(x0, para[0], e) + 20 * Math.sin(tt * .008); abelha.y = lerp(y0, para[1], e) - 60 * sino(u);
        abelha.rot = -10 * sino(u) * abelha.dir;
        foco = u < .6 ? [abelha.x, abelha.y] : null; poeAbelha();
      });
      foco = null;
      atr(R.abelha, 'display', 'none');
    }
    varAbelha.limpar = () => { atr(R.abelha, 'display', 'none'); foco = null; };
    function* varBorboleta() {                 // uma borboleta pousa numa pétala, abre e fecha as asas, e vai-se
      const b = borbs.find(v => !v.ativo);
      if (!b) return;
      b.ativo = true; b.modo = 'guiada'; b.freq = 7; b.esc = 1.35; atr(b.el, 'display', 'inline'); camadaBorb(b, 'frente');
      const pet = escolhe([3, 1, 9]);
      const de = escolhe([[-80, 260], [1700, 200]]);
      b.x = de[0]; b.y = de[1];
      yield* durante(3200, (u, tt) => {
        const [tx, ty] = pontoPetala(pet, .78, 0);
        const e = eseno(u);
        b.x = lerp(de[0], tx, e) + 50 * Math.sin(tt * .004) * (1 - u); b.y = lerp(de[1], ty - 6, e) - 80 * sino(u) + 16 * Math.sin(tt * .009) * (1 - u);
        b.rot = limita((tx - de[0]) * .02, -20, 20) * (1 - u);
        foco = [b.x, b.y];
      });
      b.modo = 'pousada'; b.freq = .7; b.abre = 1;
      yield* durante(3200, (u, tt) => {
        if (assustar > 0) return true;
        const [tx, ty] = pontoPetala(pet, .78, 0);
        b.x = tx; b.y = ty - 6; b.rot = (angPetalaMundo(pet) * GRAU + 90) * .25;
        foco = [b.x, b.y];
      });
      b.modo = 'guiada'; b.freq = 8;
      const x0 = b.x, y0 = b.y, para = x0 < 800 ? [-100, 120] : [1720, 140];
      yield* durante(2600, (u, tt) => {
        const e = u * u * (3 - 2 * u);
        b.x = lerp(x0, para[0], e) + 30 * Math.sin(tt * .006); b.y = lerp(y0, para[1], e) - 50 * sino(u) + 12 * Math.sin(tt * .01);
        b.rot = (para[0] > x0 ? 1 : -1) * 15 * sino(u);
        foco = u < .5 ? [b.x, b.y] : null;
      });
      foco = null;
      b.ativo = false; atr(b.el, 'display', 'none'); camadaBorb(b, 'fora');
    }
    function* varGota() {                      // uma gota de orvalho escorre por uma pétala, cai e salpica
      const gi = escolhe([0, 1, 2]), g = gotas[gi];
      if (g.op < .9) return;
      const s0 = g.s;
      yield* durante(1800, u => { g.s = lerp(s0, .97, u * u); g.estica = .6 * passoS(.2, 1, u); foco = pontoPetala(g.p, g.s, g.y); });
      // solta-se da ponta
      const [x0, y0] = pontoPetala(g.p, 1.02, g.y * .3);
      g.op = 0; g.estica = 0; g.s = s0;
      atr(R.gotaCai, 'display', 'inline');
      const x = x0, chao = 800;
      yield* durante(1400, (u, tt) => {
        const ts = tt / 1000, y = Math.min(chao, y0 + 750 * ts * ts), vy = 1500 * ts;
        poe(R.gotaCai, `translate(${n(x)},${n(y)}) scale(.9,${n3(1 + Math.min(.5, vy / 1400))})`);
        foco = [x, y];
        return y >= chao;
      });
      atr(R.gotaCai, 'display', 'none');
      salpico(x, chao);
      yield* espera(600);
      foco = null;
      // o orvalho volta a juntar-se devagar
      yield* durante(2500, u => { g.op = u; });
    }
    varGota.limpar = () => { atr(R.gotaCai, 'display', 'none'); gotas.forEach((g, i) => { g.estica = 0; g.s = GOTAS[i][1]; if (i < 3) g.op = 1; }); foco = null; };
    function* varSol() {                       // a flor vira-se devagar para o sol (cima à esquerda) e volta
      impulso('yaw', -.45, 5600, 'plato'); impulso('pitch', .3, 5600, 'plato'); impulso('empurra', -30, 5600, 'plato'); impulso('inc', -.1, 5600, 'plato'); impulso('abre', .06, 5600, 'plato'); impulso('brilho', .22, 5600, 'plato');
      foco = [190, 120];
      yield* espera(2400);
      foco = null;
      yield* espera(3400);
    }
    function* varPetala() {                    // uma pétala solta-se, cai a planar e outra cresce devagar no sítio
      const i = escolhe([1, 3, 5, 7, 9].filter(j => petalas[j].presente > .99 && !gotas.some(g => g.p === j && g.op > .1)));
      if (i == null) return;
      yield* durante(500, u => { petalas[i].ef = 6 * sino(u); });
      petalas[i].ef = 0;
      const c = soltarClone(i, 1, aleat(-40, 40), -20);
      petalas[i].presente = 0;
      yield* durante(3200, () => { foco = [c.x, c.y]; });
      foco = null;
      yield* durante(4500, u => { petalas[i].presente = eseno(u); });
    }
    varPetala.limpar = () => { petalas.forEach(p => { p.ef = 0; }); };
    const joan = { u: 0, voa: false, x: 0, y: 0, rot: 0, abre: 0, passo: 0 };
    function poeJoaninha() {
      poe(R.joan, `translate(${n(joan.x)},${n(joan.y)})`);
      poe(R.jIn, `rotate(${n(joan.rot)}) scale(1.55)`);
      const a = joan.abre;
      poe(R.jElE, `rotate(${n(-38 * a)},7,0)`); poe(R.jElD, `rotate(${n(38 * a)},7,0)`);
      atr(R.jAsas, 'display', a > .3 ? 'inline' : 'none');
      if (a > .3) poe(R.jAsasIn, `scale(1,${n3(.35 + .65 * Math.abs(Math.sin(tempo * .09)))})`);
      const p = Math.sin(joan.passo), q = Math.cos(joan.passo);
      let pt = '';
      for (const [x, lado] of [[4, 1], [-1, 1], [-6, 1], [4, -1], [-1, -1], [-6, -1]]) {
        const fase = (x === -1 ? q : p) * (lado > 0 ? 1 : -1);
        pt += `M${x},${lado * 5} l${n(2 + fase * 3)},${lado * 6}`;
      }
      atr(R.jPatas, 'd', pt);
    }
    function* varJoaninha() {                  // uma joaninha sobe pelo caule, abre as asas e voa
      atr(R.joan, 'display', 'inline');
      joan.voa = false; joan.abre = 0;
      let sai = false;
      yield* durante(6500, (u, tt) => {
        if (assustar > 0) { sai = true; return true; }
        joan.u = lerp(.02, .44, u);
        const [x, y] = bez(G.P, joan.u), tau = bezDir(G.P, joan.u);
        joan.x = x + Math.sin(tau) * 1.5; joan.y = y; joan.rot = tau * GRAU; joan.passo = tt * .02;
        foco = [x, y]; poeJoaninha();
      });
      if (!sai) yield* durante(900, (u, tt) => { const [x, y] = bez(G.P, joan.u), tau = bezDir(G.P, joan.u); joan.x = x; joan.y = y; joan.rot = tau * GRAU + 8 * Math.sin(tt * .01); joan.abre = passoS(.4, 1, u); poeJoaninha(); });
      joan.abre = 1;
      const x0 = joan.x, y0 = joan.y;
      yield* durante(2400, (u, tt) => {
        const e = u * u;
        joan.x = x0 - 600 * e + 20 * Math.sin(tt * .012); joan.y = y0 - 520 * Math.pow(u, .8) + 10 * Math.sin(tt * .02);
        joan.rot = -110 + 15 * Math.sin(tt * .01);
        foco = u < .5 ? [joan.x, joan.y] : null; poeJoaninha();
      });
      foco = null;
      atr(R.joan, 'display', 'none');
    }
    varJoaninha.limpar = () => { atr(R.joan, 'display', 'none'); foco = null; };
    const VARIACOES = { abelha: varAbelha, borboleta: varBorboleta, gota: varGota, sol: varSol, petala: varPetala, joaninha: varJoaninha };
    const vari = { prox: aleat(3000, 5000), ultima: null };
    function iniciarVariacao(nome) {
      const g = VARIACOES[nome]();
      g.limpar = VARIACOES[nome].limpar || (() => { foco = null; });
      vari.ultima = nome;
      if (vari.prox < 1e11) vari.prox = 0;
      lancar('variacao', g, () => { if (vari.prox < 1e11) vari.prox = aleat(4000, 9000); foco = null; });
    }
    function atualizarVariacoes(dt) {
      if (faixas.has('variacao')) return;
      vari.prox -= dt;
      if (vari.prox > 0) return;
      iniciarVariacao(escolhe(Object.keys(VARIACOES).filter(v => v !== vari.ultima)));
    }

    /* --- reações ao toque (visíveis em 100 ms, 1–2 s, sem repetir a mesma seguida) --- */
    function* reBrilho() {                     // fecha-se um pouco e abre-se toda, maior, a brilhar e a soltar pólen dourado
      impulso('abre', -.3, 420, 'sino'); impulso('brilho', 1, 1700, 'ataque'); impulso('esc', -.03, 300, 'sino');
      yield* espera(200);
      impulso('abre', .16, 1500, 'ataque'); impulso('esc', .13, 1500, 'ataque'); impulso('pitch', .06, 1200, 'sino');
      const [mx, my] = centroMiolo();
      soltarPolen(mx, my, 70, 330, true);
      yield* espera(500);
      soltarPolen(mx, my, 20, 160, true);
      yield* espera(900);
    }
    let ladoBaloico = 1;
    function* reBaloico() {                    // baloiça com força (com mola) e solta pétalas
      ladoBaloico = -ladoBaloico;
      F.vx += ladoBaloico * 760;
      impulso('tremor', 1, 1300, 'ataque'); impulso('vento', .5, 1500, 'ataque'); impulso('inc', ladoBaloico * .12, 900, 'mola');
      yield* espera(140);
      for (let k = 0; k < 4; k++) soltarClone(escolhe([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), aleat(.5, .75), ladoBaloico * aleat(120, 320), -aleat(80, 220));
      const [mx, my] = centroMiolo();
      soltarPolen(mx, my, 24, 200);
      yield* espera(1300);
    }
    function* reBorboletas() {                 // saem três borboletas de trás das pétalas
      impulso('esc', .08, 900, 'mola'); impulso('abre', .12, 900, 'ataque'); impulso('brilho', .3, 900, 'ataque');
      const livres = borbs.filter(b => !b.ativo || b.modo === 'livre').slice(0, 3);
      const dirs = [-2.4, -1.57, -.7];
      livres.forEach((b, k) => {
        const a = dirs[k] + aleat(-.25, .25), v = aleat(260, 330);
        Object.assign(b, { ativo: true, modo: 'livre', x: G.C[0] + Math.cos(a) * 18, y: G.C[1] + Math.sin(a) * 14, vx: Math.cos(a) * v, vy: Math.sin(a) * v, alvoVx: Math.cos(a) * 170, alvoVy: -110, idade: 0, freq: 8, esc: aleat(1.3, 1.5), ph: aleat(0, TAU) });
        atr(b.el, 'display', 'inline'); camadaBorb(b, 'tras');
        desenharBorb(b, 0);
      });
      yield* espera(1400);
    }
    const REACOES = { brilho: reBrilho, baloico: reBaloico, borboletas: reBorboletas };
    let ultimaReacao = null;
    function reagir(nome) {
      if (!vivo) return;
      nome = nome || escolhe(Object.keys(REACOES).filter(r => r !== ultimaReacao));
      ultimaReacao = nome;
      while (envs.length > 40) envs.shift();
      assustar = 1;
      gato.susto = 1;
      lancar('reacao', REACOES[nome]());
    }

    /* --- acontecimentos raros (15–40 s): melro no caminho, caracol no rebordo, chuvisco com arco-íris --- */
    const melro = { x: 0, y: 0, voa: false, asa: 0, bica: 0, rot: 0, dir: -1, salto: 0 };
    function poeMelro() {
      poe(R.melro, `translate(${n(melro.x)},${n(melro.y)}) scale(${melro.dir < 0 ? 1.4 : -1.4},1.4)`);
      poe(R.meIn, `rotate(${n(melro.rot - 28 * melro.bica)},0,-12)`);
      atr(R.meAsas, 'display', melro.voa ? 'inline' : 'none');
      if (melro.voa) poe(R.meAsasIn, `scale(1,${n3(Math.sin(melro.asa))})`);
      atr(R.mePatas, 'display', melro.voa ? 'none' : 'inline');
      atr(R.meSombra, 'opacity', melro.voa ? 0 : .3);
    }
    function* evMelro() {
      atr(R.melro, 'display', 'inline');
      melro.voa = true; melro.dir = -1; melro.bica = 0;
      const ida = [[1720, 300], [1480, 420], [1220, 620], [1040, 736]];
      yield* durante(1800, (u, tt) => {
        const [x, y] = catmull(ida, eseno(u)); melro.x = x; melro.y = y; melro.asa = tt * .028; melro.rot = 12 * (1 - u);
        foco = [x, y - 30]; poeMelro();
      });
      melro.voa = false; melro.rot = 0;
      yield* durante(260, u => { melro.y = 736; poeMelro(); });
      for (let k = 0; k < 2; k++) {
        const x0 = melro.x;
        yield* durante(300, u => { melro.x = x0 - 28 * u; melro.y = 736 - 16 * sino(u); foco = [melro.x, melro.y - 30]; poeMelro(); });
        yield* espera(360);
      }
      for (let k = 0; k < 3; k++) {
        yield* durante(320, u => { melro.bica = sino(u); poeMelro(); });
        yield* espera(k === 2 ? 600 : 220);
      }
      // apanha uma minhoca e vai-se embora
      atr(R.meMinhoca, 'd', 'M-33,-32 q-3,6 2,10 q4,4 0,9');
      yield* durante(600, u => { melro.rot = -6 * sino(u); poeMelro(); });
      melro.voa = true; melro.dir = 1;
      const x0 = melro.x, y0 = melro.y;
      const sai = [[x0, y0], [x0 + 80, y0 - 120], [1320, 330], [1760, 200]];
      yield* durante(1900, (u, tt) => {
        const [x, y] = catmull(sai, eseno(u)); melro.x = x; melro.y = y; melro.asa = tt * .03; melro.rot = -14 * sino(u);
        foco = u < .6 ? [x, y - 30] : null; poeMelro();
      });
      evMelro.limpar();
    }
    evMelro.limpar = () => { atr(R.melro, 'display', 'none'); atr(R.meMinhoca, 'd', ''); foco = null; };
    function* evCaracol() {
      atr(R.caracol, 'display', 'inline');
      const x0 = 880, x1 = 1210, y = 752;
      let rasto = [];
      yield* durante(17000, (u, tt) => {
        const x = lerp(x0, x1, u);
        const estica = 1 + .05 * Math.sin(tt * .004);
        poe(R.caracol, `translate(${n(x)},${y})`);
        poe(R.caIn, `scale(${n3(1.6 * estica)},${n3(1.6 / estica)})`);
        const o1 = 3 * Math.sin(tt * .003), o2 = 3 * Math.sin(tt * .0037 + 1);
        atr(R.caOlhos, 'd', `M16,-13 Q18,-22 ${n(18 + o1)},-29 M19,-12 Q23,-20 ${n(26 + o2)},-26`);
        atr(R.caBolas, 'd', circ(18 + o1, -29, 2.2) + circ(26 + o2, -26, 2.2));
        atr(R.rasto, 'd', `M${x0 - 20},${y + 1} L${n(x - 18)},${y + 1}`);
        atr(R.rasto, 'opacity', n3(.45 * (1 - passoS(.85, 1, u))));
        atr(R.caracol, 'opacity', n3(1 - passoS(.9, 1, u)));
        foco = [x + 10, y - 16];
      });
      evCaracol.limpar();
    }
    evCaracol.limpar = () => { atr(R.caracol, 'display', 'none'); atr(R.rasto, 'd', ''); foco = null; };
    const chuva = { gotas: [], salpicos: [], ativa: false };
    function salpico(x, y) { chuva.salpicos.push({ x, y, idade: 0 }); if (chuva.salpicos.length > 40) chuva.salpicos.shift(); }
    function atualizarChuva(dt) {
      const s = dt / 1000;
      let d = '', ds = '';
      for (let i = chuva.gotas.length - 1; i >= 0; i--) {
        const g = chuva.gotas[i];
        g.y += 900 * s; g.x += 120 * s;
        if (g.y >= g.chao) { if (Math.random() < .4) salpico(g.x, g.chao); chuva.gotas.splice(i, 1); continue; }
        d += `M${n(g.x)},${n(g.y)}l-3.6,-18`;
      }
      for (let i = chuva.salpicos.length - 1; i >= 0; i--) {
        const p = chuva.salpicos[i];
        p.idade += dt;
        if (p.idade > 380) { chuva.salpicos.splice(i, 1); continue; }
        const u = p.idade / 380, r = 4 + 10 * u, h = 8 * sino(u);
        ds += `M${n(p.x - r)},${n(p.y)}a${n(r)},${n(r * .3)} 0 0,1 ${n(2 * r)},0 M${n(p.x - 3)},${n(p.y - h)}l-2,-3 M${n(p.x + 3)},${n(p.y - h)}l2,-3`;
      }
      atr(R.chuva, 'd', d); atr(R.salpicos, 'd', ds);
    }
    function* evChuvisco() {
      atr(R.nuvemChuva, 'display', 'inline');
      let pingo = 0;
      yield* durante(13000, (u, tt) => {
        const x = lerp(-300, 1900, u);
        poe(R.nuvemChuva, `translate(${n(x)},150)`);
        const chove = passoS(.18, .26, u) * (1 - passoS(.62, .7, u));
        pingo += chove * 16.7 * .16 * calma;
        while (pingo >= 1) { pingo--; chuva.gotas.push({ x: x + aleat(-150, 150), y: 180, chao: aleat(650, 880) }); }
        if (chove > .5 && Math.random() < .06) { impulso('pitch', -.05, 300, 'sino'); impulso('tremor', .25, 300, 'sino'); }
        if (chove > .5) { gotas[3].op = Math.max(gotas[3].op, passoS(.3, .4, u)); gotas[4].op = Math.max(gotas[4].op, passoS(.38, .48, u)); }
        gato.agacha = .6 * chove;
        foco = chove > .1 ? [x, 220] : null;
      });
      gato.agacha = 0;
      atr(R.nuvemChuva, 'display', 'none');
      // arco-íris depois do chuvisco
      yield* durante(7000, u => { atr(R.arco, 'opacity', n3(.5 * passoS(0, .2, u) * (1 - passoS(.7, 1, u)))); foco = u < .6 ? [1180, 300] : null; });
      foco = null;
      yield* durante(8000, u => { gotas[3].op = 1 - u; gotas[4].op = 1 - u; });
    }
    evChuvisco.limpar = () => { atr(R.nuvemChuva, 'display', 'none'); atr(R.arco, 'opacity', 0); gato.agacha = 0; gotas[3].op = 0; gotas[4].op = 0; foco = null; };
    const EVENTOS = { melro: evMelro, caracol: evCaracol, chuvisco: evChuvisco };
    const eventos = { prox: aleat(15000, 25000), ultimo: null };
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
      iniciarEvento(escolhe(Object.keys(EVENTOS).filter(e => e !== eventos.ultimo)));
    }

    /* --- relógio único --- */
    let erroMostrado = false;
    function passo(dt) {
      if (!vivo) return;
      try {
        dt = Math.min(dt, 50);
        tempo += dt;
        atualizarEnvs(dt);
        fisica(dt);
        for (const nome of Array.from(faixas.keys())) avancar(nome, dt);
        assustar = Math.max(0, assustar - dt / 300);
        atualizarVariacoes(dt);
        atualizarEventos(dt);
        desenharFlor();
        atualizarBorbs(dt);
        atualizarClones(dt);
        atualizarPolen(dt);
        atualizarChuva(dt);
        animarCena(dt);
        atualizarGato(dt);
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    passo(16);

    return {
      animal: R.flor,
      habitat: null,
      reagir() { reagir(); },
      fazerSom() {},                                 // os elementos não têm som (só a gravação do nome)
      irAoHabitat: () => Promise.resolve(),
      voltar: () => Promise.resolve(),
      destruir() {
        vivo = false;
        faixas.clear();
        envs.length = 0; polen.length = 0; chuva.gotas.length = 0;
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola (modo de desenvolvimento)
      _teste: {
        F, G, E, reagir, variacao: iniciarVariacao, evento: iniciarEvento, semEventos: (v = true) => { semEventos = v; },
        semVariacoes: () => { vari.prox = 1e12; },
        estado: () => ({ faixas: [...faixas.keys()], envs: envs.length, polen: polen.length, clones: clones.filter(c => c.ativo).length, borbs: borbs.filter(b => b.ativo).length, elementos: svg.querySelectorAll('*').length })
      }
    };
  }

  return { icone: iconeSVG(), montar };
})();
