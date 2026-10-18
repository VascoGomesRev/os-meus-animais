/* Árvore — «Os Meus Animais», grupo «Elementos». Contrato e regras: REGRAS-ANIMAIS.md (§2 e §11).
   Cena: um prado verde numa tarde de fim de verão (sol de cima à esquerda, luz quente e dourada). Céu com nuvens que
   passam devagar e dois pássaros ao longe, uma colina azulada ao fundo, uma colina dourada com árvores pequeninas, fardos
   de palha e ovelhas minúsculas a pastar, um muro de pedra solta com uma passagem, um caminho de terra que vem do muro até
   cá à frente, flores silvestres na erva (papoilas, margaridas, centáureas azuis e botões-de-ouro), ciscos de luz a flutuar
   e um coelho sentado na erva à esquerda, que nota tudo o que acontece.
   A árvore é a personagem (sem cara): uma macieira grande e frondosa no meio do prado. Tronco grosso com casca às fendas,
   um nó, musgo do lado da sombra e raízes que entram no chão; ramos que se abrem; a copa é feita de 22 tufos de folhas em
   três camadas (os de trás mais escuros, os da frente mais claros), cada um com luz do lado do sol, sombra por baixo e
   folhinhas desenhadas; maçãs vermelhas presas aos tufos; sombra redonda na erva com manchas de luz; um baloiço de corda num
   ramo baixo; um ninho com três passarinhos e os pais (um no ninho, outro no ramo do baloiço).
   A brisa tem uma intensidade que varia devagar e rajadas que atravessam o ecrã da esquerda para a direita (como no ar):
   cada tufo lê o vento no seu x e ondula à volta de um ponto por baixo dele (o topo mexe mais do que a base); duas molas
   (uma lenta para a copa toda, outra rápida para o tremer das folhas) somam os abanões. Caem folhas soltas de vez em quando.
   Variações ociosas (4–9 s): uma folha solta-se e cai a baloiçar, um esquilo sobe o tronco e desaparece na copa (e mais
   tarde desce e vai-se embora), os passarinhos espreitam do ninho a piar, uma brisa mais forte agita a copa e o baloiço,
   uma maçã abana. Reações ao toque (alternadas): a árvore abana toda e cai uma maçã que rola na erva; os pássaros saem a
   voar e voltam; o baloiço dá um grande impulso. Acontecimentos raros (15–40 s): um pica-pau bate no tronco, uma borboleta
   pousa numa maçã, um bando de pardais pousa na copa.
   Organização:
     1) utilidades (matemática, curvas, formas)
     2) a árvore: tufos, maçãs, ramos, tronco, baloiço, ninho
     3) bichos (coelho, pássaros, esquilo, pica-pau, borboleta)
     4) ícone do menu
     5) cenário (céu, colinas, muro, prado, caminho, flores, erva)
     6) montar(): estado, vento, molas, tarefas (variações, reações, acontecimentos), partículas, relógio único */
'use strict';
MODULOS.arvore = (() => {
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
  // círculo e elipse como subcaminhos (todos no mesmo sentido: juntam-se num só path sem buracos)
  const circ = (cx, cy, r) => `M${n(cx - r)},${n(cy)}a${n(r)},${n(r)} 0 1,0 ${n(2 * r)},0a${n(r)},${n(r)} 0 1,0 ${n(-2 * r)},0Z`;
  const elip = (cx, cy, rx, ry) => `M${n(cx - rx)},${n(cy)}a${n(rx)},${n(ry)} 0 1,0 ${n(2 * rx)},0a${n(rx)},${n(ry)} 0 1,0 ${n(-2 * rx)},0Z`;
  // folha pontiaguda com base em (x, y), virada para o ângulo a (radianos)
  function folhaD(x, y, a, L, w) {
    const c = Math.cos(a), s = Math.sin(a);
    const p = (u, v) => `${n(x + u * c - v * s)},${n(y + u * s + v * c)}`;
    return `M${p(0, 0)}Q${p(L * .45, -w)} ${p(L, 0)}Q${p(L * .45, w)} ${p(0, 0)}Z`;
  }
  // rodar um ponto como o rotate(a, cx, cy) do SVG (a em graus, sentido dos ponteiros do relógio no ecrã)
  function roda(x, y, a, cx, cy) {
    const c = Math.cos(a * RAD), s = Math.sin(a * RAD), dx = x - cx, dy = y - cy;
    return [cx + dx * c - dy * s, cy + dx * s + dy * c];
  }
  // linha suave por pontos (curvas pelos meios)
  function caminhoSuave(p, inicio) {
    let d = (inicio ? 'M' : 'L') + n(p[0][0]) + ',' + n(p[0][1]);
    for (let i = 1; i < p.length - 1; i++) d += `Q${n(p[i][0])},${n(p[i][1])} ${n((p[i][0] + p[i + 1][0]) / 2)},${n((p[i][1] + p[i + 1][1]) / 2)}`;
    return d + `L${n(p[p.length - 1][0])},${n(p[p.length - 1][1])}`;
  }
  // ramo: contorno fechado à volta de uma curva (largura w0 na base → w1 na ponta, ponta redonda); devolve também a linha
  // de luz (do lado do sol, em cima à esquerda) e as fendas da casca
  function ramo(pts, w0, w1) {
    const N = 12, c = [];
    for (let i = 0; i <= N; i++) c.push(catmull(pts, i / N));
    const a = [], b = [], luz = [], fenda = [];
    for (let i = 0; i <= N; i++) {
      const p0 = c[Math.max(0, i - 1)], p1 = c[Math.min(N, i + 1)];
      let tx = p1[0] - p0[0], ty = p1[1] - p0[1];
      const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
      const w = lerp(w0, w1, Math.pow(i / N, .85)) / 2;
      a.push([c[i][0] - ty * w, c[i][1] + tx * w]); b.push([c[i][0] + ty * w, c[i][1] - tx * w]);
      const s = (-ty - tx) < (ty + tx) ? 1 : -1;    // lado virado para cima/esquerda
      luz.push([c[i][0] + ty * w * .55 * s, c[i][1] - tx * w * .55 * s]);
      fenda.push([c[i][0] - ty * w * .2 * s, c[i][1] + tx * w * .2 * s]);
    }
    const t = [c[N][0] - c[N - 1][0], c[N][1] - c[N - 1][1]], lt = Math.hypot(t[0], t[1]) || 1;
    const ponta = [c[N][0] + t[0] / lt * w1 * .7, c[N][1] + t[1] / lt * w1 * .7];
    const d = caminhoSuave(a, true) + `Q${n(ponta[0])},${n(ponta[1])} ${n(b[N][0])},${n(b[N][1])}` + caminhoSuave(b.slice().reverse(), false) + 'Z';
    return { d, luz: caminhoSuave(luz.slice(1, N - 1), true), fenda: caminhoSuave(fenda.slice(2, N - 2), true) };
  }

  /* ================= 2) A árvore ================= */
  const AX = 800, BASE = 790;                 // eixo do tronco e chão por baixo dele
  const FORQ = [800, 600];                    // ponto à volta do qual a copa toda baloiça
  // tufos: [x, y, raio, camada] — camada 0 = atrás (escura), 1 = meio, 2 = frente (clara)
  const TUFOS = [
    [800, 226, 112, 0], [645, 262, 106, 0], [955, 262, 106, 0], [532, 352, 94, 0], [1068, 352, 94, 0], [690, 362, 118, 0], [910, 362, 118, 0], [800, 330, 120, 0],
    [712, 206, 86, 1], [888, 206, 86, 1], [577, 272, 90, 1], [1023, 272, 90, 1], [482, 386, 80, 1], [1118, 386, 80, 1], [632, 404, 94, 1], [968, 404, 94, 1], [800, 282, 94, 1],
    [532, 456, 78, 2], [1068, 456, 78, 2], [676, 480, 86, 2], [924, 480, 86, 2], [800, 396, 76, 2]
  ].map(([x, y, r, cam], i) => ({ x, y, r, cam, i, px: lerp(x, AX, .3), py: y + r * 1.15, h: limita((BASE - y) / 640, 0, 1) }));
  // maçãs: [x, y, tufo] (coordenadas do mundo com a copa parada)
  const MACAS = [
    [562, 330, 10], [1002, 322, 11], [472, 420, 12], [1132, 418, 13], [598, 368, 14], [906, 362, 15], [748, 304, 16],
    [506, 482, 17], [560, 506, 17], [1094, 486, 18], [1040, 508, 18], [648, 524, 19], [716, 500, 19], [880, 522, 20], [954, 462, 20], [792, 432, 21]
  ];
  const CORES_TUFO = [
    { luz: '#7FA640', escura: '#2E5418', claras: '#9CC254', escuras: '#24461A', sombra: '#1E3E14', brilho: '#A8C860' },
    { luz: '#94BE48', escura: '#3A6420', claras: '#B4D862', escuras: '#2E5418', sombra: '#2A4E18', brilho: '#C8E474' },
    { luz: '#A8D054', escura: '#467628', claras: '#C8E676', escuras: '#355E1E', sombra: '#2E5418', brilho: '#DCF088' }
  ];
  // um tufo de folhas: massa recortada (círculos juntos) com contorno, sombra em baixo à direita, luz em cima à esquerda e folhinhas
  function tufoSVG(t) {
    const r = semente(300 + t.i * 13), { x, y } = t, R = t.r, C = CORES_TUFO[t.cam];
    let massa = elip(x, y + R * .04, R * .7, R * .62), sombra = '', luz = '', fClaras = '', fEscuras = '', fBorda = '';
    const k = 10;
    for (let j = 0; j < k; j++) {
      const a = j / k * TAU + r() * .4, rr = R * (.38 + r() * .14), d = R - rr - R * .03;
      massa += circ(x + Math.cos(a) * d, y + Math.sin(a) * d * .86, rr);
    }
    for (let j = 0; j < 5; j++) {                 // sombra: lado de baixo e da direita (longe do sol)
      const a = .1 + j / 4 * 1.9 + (r() - .5) * .3, rr = R * (.26 + r() * .1), d = R * .9 - rr - R * .04;
      sombra += circ(x + Math.cos(a) * d, y + Math.sin(a) * d * .86 + R * .04, rr);
    }
    for (let j = 0; j < 4; j++) {                 // luz: lado de cima e da esquerda
      const a = PI * 1.25 + (j - 1.5) * .42 + (r() - .5) * .2, rr = R * (.2 + r() * .08), d = R * .86 - rr - R * .06;
      luz += circ(x + Math.cos(a) * d, y + Math.sin(a) * d * .86, rr);
    }
    const NF = Math.round(R * .2);
    for (let j = 0; j < NF; j++) {                // folhinhas por cima da massa
      const a = r() * TAU, d = Math.sqrt(r()) * R * .78, fx = x + Math.cos(a) * d, fy = y + Math.sin(a) * d * .86;
      const lado = (-(fx - x) - (fy - y)) / R;    // > 0 do lado do sol
      const ang = Math.atan2(fy - y + R * .6, fx - x) + (r() - .5) * 1.2, L = R * (.15 + r() * .06);
      const f = folhaD(fx, fy, ang, L, L * .5);
      if (lado > .18) fClaras += f; else if (lado < -.22) fEscuras += f; else if (r() < .5) fClaras += f; else fEscuras += f;
    }
    for (let j = 0; j < 12; j++) {                // folhas da borda: quebram o contorno redondo
      const a = j / 12 * TAU + r() * .3, ex = x + Math.cos(a) * R * .93, ey = y + Math.sin(a) * R * .8;
      const lado = -Math.cos(a) - Math.sin(a);
      const f = folhaD(ex - Math.cos(a) * 6, ey - Math.sin(a) * 6, a + (r() - .5) * .6, R * .2, R * .1);
      if (lado > .5) fClaras += f; else fBorda += f;
    }
    return `<path d="${massa}" fill="url(#arvore-copa${t.cam})" stroke="#2A4414" stroke-width="5" paint-order="stroke" stroke-linejoin="round"/>
      <path d="${fBorda}" fill="${C.escura}" stroke="#2A4414" stroke-width="1.2"/>
      <path d="${sombra}" fill="${C.sombra}" opacity=".42"/>
      <path d="${luz}" fill="${C.brilho}" opacity=".5"/>
      <path d="${fEscuras}" fill="${C.escuras}" opacity=".85"/>
      <path d="${fClaras}" fill="${C.claras}" stroke="${C.escura}" stroke-width=".8"/>`;
  }
  // interior escuro da copa: o que se vê entre os tufos (nunca se vê o céu através da copa)
  function interiorD() {
    let d = '';
    for (const t of TUFOS) if (t.cam < 2) d += elip(t.x, t.y + 6, t.r * .82, t.r * .72);
    d += elip(800, 470, 250, 70);
    return d;
  }
  // maçã com o centro na origem; o pé (pivô para abanar) fica em (3, -21)
  function macaSVG(i) {
    const g = i % 3 === 1 ? 'arvore-maca2' : 'arvore-maca';
    return `<path d="M0,-12 C7,-18 17,-13 17,-1 C17,10 9,16 0,14.5 C-9,16 -17,10 -17,-1 C-17,-13 -7,-18 0,-12 Z" fill="url(#${g})" stroke="#6A1410" stroke-width="1.6"/>
      <path d="M-11,-6 C-10,-10 -6,-12 -3,-11 C-5,-9 -8,-6 -9,-3 Z M8,8 C10,6 12,3 12,0" fill="#FFFFFF" stroke="#FFE0D0" stroke-width="1.2" opacity=".7" stroke-linecap="round"/>
      <path d="M0,-12 Q1,-17 3,-21 M2,-18 C6,-24 12,-24 15,-20 C10,-17 6,-17 2,-18 Z" fill="#6AA03A" stroke="#4A3018" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  // ramos principais (desenhados por trás dos tufos do meio; baloiçam com a copa)
  const RAMOS = [
    [[[788, 612], [764, 540], [700, 500], [640, 432], [592, 392]], 50, 14],
    [[[812, 612], [838, 540], [904, 498], [962, 440], [1030, 398]], 50, 14],
    [[[800, 590], [804, 480], [800, 330]], 36, 10],
    [[[712, 492], [694, 390], [706, 276]], 22, 7],
    [[[892, 494], [910, 388], [890, 280]], 22, 7],
    [[[612, 404], [560, 430], [520, 446]], 12, 5],
    [[[1006, 410], [1060, 434], [1104, 448]], 12, 5],
    [[[760, 520], [726, 470], [742, 420]], 14, 5],
    [[[842, 520], [880, 470], [866, 420]], 14, 5]
  ];
  function ramosSVG() {
    let d = '', luz = '', fenda = '';
    for (const [p, w0, w1] of RAMOS) { const r = ramo(p, w0, w1); d += r.d; luz += r.luz; fenda += r.fenda; }
    return `<path d="${d}" fill="url(#arvore-troncoU)" stroke="#3A2414" stroke-width="5" paint-order="stroke" stroke-linejoin="round"/>
      <path d="M758,642 L760,618 C778,606 822,606 840,618 L842,642 Z" fill="url(#arvore-troncoU)"/>
      <path d="${fenda}" stroke="#3A2414" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/>
      <path d="${luz}" stroke="#C8A27A" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>
      <ellipse cx="800" cy="606" rx="66" ry="54" fill="url(#arvore-sombraTopo)"/>`;
  }
  // tronco grosso com raízes: margens esquerda e direita (x) a cada altura, para a casca
  const TRONCO_E = [[580, 768], [620, 758], [660, 751], [700, 748], [740, 740], [770, 726]];
  const TRONCO_D = [[580, 832], [620, 842], [660, 849], [700, 851], [740, 858], [770, 872]];
  const margem = (tab, y) => {
    if (y <= tab[0][0]) return tab[0][1];
    for (let i = 1; i < tab.length; i++) if (y <= tab[i][0]) return lerp(tab[i - 1][1], tab[i][1], (y - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0]));
    return tab[tab.length - 1][1];
  };
  function troncoSVG() {
    const r = semente(41);
    const contorno = `M640,797 C690,792 722,778 737,752 C746,726 747,692 749,660 C751,628 756,600 768,572 Q800,548 832,572
      C844,600 849,628 851,660 C853,694 853,726 863,752 C878,780 916,792 964,798 C924,806 884,800 856,795 C832,791 816,803 792,801
      C770,799 760,792 738,795 C708,800 676,802 640,797 Z`;
    let fendas = '', cristas = '', sombras = '';
    for (let j = 0; j < 11; j++) {                 // fendas da casca: linhas onduladas ao alto
      const u = (j + .5) / 11 + (r() - .5) * .04;
      let pts = [];
      const y0 = 648 + r() * 50, y1 = 770 + r() * 16;
      for (let y = y0; y <= y1; y += 18) pts.push([lerp(margem(TRONCO_E, y), margem(TRONCO_D, y), u) + (r() - .5) * 6, y]);
      const dd = caminhoSuave(pts, true);
      if (u < .45) { fendas += dd; cristas += caminhoSuave(pts.map(([x, y]) => [x + 5, y]), true); } else if (u < .8) fendas += dd; else sombras += dd;
    }
    for (let j = 0; j < 14; j++) {                 // placas da casca (traços curtos de través)
      const y = 650 + r() * 120, u = r(), x = lerp(margem(TRONCO_E, y), margem(TRONCO_D, y), u);
      fendas += `M${n(x)},${n(y)}q${n(6 + r() * 6)},${n(2 + r() * 3)} ${n(10 + r() * 8)},${n((r() - .5) * 4)}`;
    }
    let musgo = '';
    for (let j = 0; j < 16; j++) { const y = 700 + r() * 90, x = margem(TRONCO_D, y) - 4 - r() * 18; musgo += elip(x, y, 2 + r() * 3, 3 + r() * 4); }
    // raízes: lóbulos marcados que entram no chão (com erva por cima das pontas)
    const raizes = 'M752,748 C744,772 724,788 694,796 M846,746 C856,774 884,790 924,798 M776,760 C774,780 768,792 756,800 M824,758 C828,780 836,792 850,798 M800,770 C800,786 798,796 796,802';
    return `<path d="${contorno}" fill="url(#arvore-troncoU)" stroke="#3A2414" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="${sombras}" stroke="#2A180C" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>
      <path d="${fendas}" stroke="#3A2414" stroke-width="2.2" fill="none" opacity=".7" stroke-linecap="round"/>
      <path d="${cristas}" stroke="#D2AE84" stroke-width="2.4" fill="none" opacity=".55" stroke-linecap="round"/>
      <path d="${raizes}" stroke="#3A2414" stroke-width="2.4" fill="none" opacity=".75" stroke-linecap="round"/>
      <path d="M700,792 C720,786 736,774 746,758 M760,780 C764,790 770,796 778,798" stroke="#D2AE84" stroke-width="2.6" fill="none" opacity=".6" stroke-linecap="round"/>
      <path d="${musgo}" fill="#6E8A34" opacity=".5"/>
      <ellipse cx="814" cy="668" rx="11" ry="15" fill="#5A3A20" stroke="#3A2414" stroke-width="2"/>
      <ellipse cx="815" cy="670" rx="6.5" ry="10" fill="#1E120A"/>
      <path d="M804,660 C806,652 814,650 820,654" stroke="#C8A27A" stroke-width="2.4" fill="none" opacity=".7" stroke-linecap="round"/>
      <path d="M752,600 C748,640 746,700 744,740" stroke="#E6C8A0" stroke-width="5" fill="none" opacity=".35" stroke-linecap="round"/>
      <path d="M764,604 C768,582 782,564 800,556 C818,564 832,582 836,604 Z" fill="url(#arvore-troncoU)"/>`;
  }
  // ramo baixo do baloiço (fixo: é grosso e está perto da base)
  const RAMO_BALOICO = [[[770, 640], [700, 606], [616, 586], [516, 568]], 30, 9];
  const BALOICO = { x: 592, y: 578, L: 168 };   // pivô (meio das duas cordas) e comprimento das cordas
  function ramoBaloicoSVG() {
    const r = ramo(...RAMO_BALOICO);
    return `<path d="${r.d}" fill="url(#arvore-troncoU)" stroke="#3A2414" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="${r.fenda}" stroke="#3A2414" stroke-width="1.8" fill="none" opacity=".5"/>
      <path d="${r.luz}" stroke="#C8A27A" stroke-width="2.6" fill="none" opacity=".6" stroke-linecap="round"/>
      <path d="M548,566 l-10,-12 M538,554 q-4,-6 2,-10 M540,556 q6,-6 12,-2" stroke="#4A3018" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M536,546 q-8,-6 -4,-12 q8,2 4,12 Z M548,546 q6,-8 12,-6 q-2,8 -12,6 Z" fill="#7CB044" stroke="#3E6A1E" stroke-width="1"/>`;
  }
  // baloiço: cordas e assento, desenhados à volta do pivô (0,0); o grupo roda como um pêndulo
  function baloicoSVG() {
    const L = BALOICO.L;
    const corda = (x0, y0, x1) => `M${x0},${y0} L${x1},${L}`;
    return `<g class="arvore-baloico" transform="translate(${BALOICO.x},${BALOICO.y})">
      <path d="${corda(-32, -3, -36)}${corda(33, 4, 36)}" stroke="#6A4A28" stroke-width="5" stroke-linecap="round"/>
      <path d="${corda(-32, -3, -36)}${corda(33, 4, 36)}" stroke="#D8BC88" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="5 3"/>
      <path d="M-46,${L - 2} L46,${L - 2} L44,${L + 9} L-44,${L + 9} Z" fill="url(#arvore-madeira)" stroke="#4A2E18" stroke-width="2" stroke-linejoin="round"/>
      <path d="M-44,${L + 9} L44,${L + 9} L43,${L + 13} L-43,${L + 13} Z" fill="#6A4424" stroke="#4A2E18" stroke-width="1.6"/>
      <path d="M-40,${L + 2} L-8,${L + 2} M4,${L + 4} L38,${L + 4}" stroke="#E6C894" stroke-width="1.8" opacity=".7" stroke-linecap="round"/>
      <path d="M-36,${L - 6} l0,8 M36,${L - 6} l0,8" stroke="#6A4A28" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="-32" cy="-3" rx="6" ry="4" fill="#C8A878" stroke="#6A4A28" stroke-width="1.6"/><ellipse cx="33" cy="4" rx="6" ry="4" fill="#C8A878" stroke="#6A4A28" stroke-width="1.6"/></g>`;
  }
  // ninho: ramo por baixo, cova escura, passarinhos (entre as camadas) e a borda da frente de raminhos entrelaçados
  const NINHO = { x: 1000, y: 400, k: 1.45 };
  function ninhoSVG() {
    const r = semente(77), rm = ramo([[934, 444], [990, 412], [1068, 384]], 13, 6);
    let pal = '', pal2 = '';
    for (let i = 0; i < 26; i++) {
      const u = i / 25, x = -33 + u * 66, y = -2 + Math.sin(u * PI) * 9;
      const a = (r() - .5) * .9, l = 8 + r() * 10;
      const tr = `M${n(x - Math.cos(a) * l / 2)},${n(y - Math.sin(a) * l / 2 - 1)}l${n(Math.cos(a) * l)},${n(Math.sin(a) * l)}`;
      if (i % 2) pal += tr; else pal2 += tr;
    }
    const pinto = i => `<g class="arvore-pinto${i}"><g class="pi-in">
        <ellipse cx="0" cy="0" rx="7" ry="6.5" fill="#A8987E" stroke="#5A4A34" stroke-width="1.3"/>
        <path d="M-3,-6 l-1,-4 M0,-6.5 l0,-4.5 M3,-6 l1.5,-4" stroke="#C8BAA0" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M-1,-1 L1,-1 L1,1 Z" fill="#E8452A"/>
        <g class="pi-bicoB"><path d="M-6,1 L0,9 L6,1 Z" fill="#F8C030" stroke="#C88A10" stroke-width="1"/></g>
        <path d="M-6.5,0.5 L0,-4 L6.5,0.5 L0,2.5 Z" fill="#FFD84A" stroke="#C88A10" stroke-width="1" stroke-linejoin="round"/>
        <circle cx="-3.6" cy="-2.6" r="1.3" fill="#1A1008"/><circle cx="3.6" cy="-2.6" r="1.3" fill="#1A1008"/></g></g>`;
    return `<g class="arvore-ninho">
      <path d="${rm.d}" fill="url(#arvore-troncoU)" stroke="#3A2414" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="${rm.luz}" stroke="#C8A27A" stroke-width="2.2" fill="none" opacity=".6" stroke-linecap="round"/>
      <g transform="translate(${NINHO.x},${NINHO.y}) scale(${NINHO.k})">
        <ellipse cx="0" cy="-2" rx="31" ry="9" fill="#6A4A28" stroke="#3A2414" stroke-width="1.6"/>
        <ellipse cx="0" cy="-1" rx="25" ry="6" fill="#2E1C0E"/>
        <g class="arvore-pintos">${pinto(0)}${pinto(1)}${pinto(2)}</g>
        <path d="M-33,-3 C-32,12 32,12 33,-3 C24,3 -24,3 -33,-3 Z" fill="#8A6236" stroke="#3A2414" stroke-width="1.6"/>
        <path d="${pal}" stroke="#C8A06A" stroke-width="1.6" stroke-linecap="round"/><path d="${pal2}" stroke="#5A3A1E" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M-30,-2 l-8,-5 M28,0 l9,-6 M-10,8 l-4,7 M14,7 l5,6" stroke="#B08A54" stroke-width="1.4" stroke-linecap="round"/>
      </g></g>`;
  }

  /* ================= 3) Bichos ================= */
  // pássaro de lado, virado para a direita, pés em (0,0)
  function aveSVG(cls, c) {
    return `<g class="${cls}" display="none"><g class="av-in">
      <path class="av-asaL" d="M-4,-14 C-12,-30 -24,-34 -30,-30 C-24,-26 -18,-20 -8,-11 Z" fill="${c.asa}" stroke="${c.cont}" stroke-width="1.2" opacity="0"/>
      <path d="M-8,-11 L-25,-6 L-23,-2 L-7,-6 Z" fill="${c.costas}" stroke="${c.cont}" stroke-width="1.2" stroke-linejoin="round"/>
      <path class="av-pernas" d="M-2,-4 L-3,0 M3,-4 L4,0" stroke="#6A5040" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="0" cy="-11" rx="12.5" ry="9" fill="${c.costas}" stroke="${c.cont}" stroke-width="1.4"/>
      <path d="M3,-18 C13,-17 14,-6 6,-3 C1,-4 0,-12 3,-18 Z" fill="${c.peito}"/>
      <path d="M-6,-3 C0,-1 6,-2 8,-4" stroke="${c.barriga}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <g class="av-asa"><path d="M-10,-14 C-3,-19 6,-15 6,-11 C2,-7 -6,-7 -13,-9 Z" fill="${c.asa}" stroke="${c.cont}" stroke-width="1.2"/>
        <path d="M-8,-11 C-4,-12 0,-12 3,-11" stroke="${c.risca}" stroke-width="1.2" fill="none"/></g>
      <g class="av-cab"><circle cx="8" cy="-19" r="6.6" fill="${c.cabeca}" stroke="${c.cont}" stroke-width="1.3"/>
        <path d="M8.5,-18 C12,-22 15.5,-19.5 14.6,-15 C11.5,-13 8,-14.5 8.5,-18 Z" fill="${c.cara}"/>
        <circle cx="10.6" cy="-20.6" r="1.6" fill="#120A06"/><circle cx="10.1" cy="-21.1" r=".55" fill="#FFFFFF"/>
        <g class="av-bico"><path d="M13.8,-20.4 L19.6,-18.8 L13.8,-17.4 Z" fill="${c.bico}"/></g></g>
    </g></g>`;
  }
  const PISCO = { costas: '#7A6248', asa: '#6A5238', cont: '#3A2A1C', peito: '#E8742A', barriga: '#F2E8D8', cabeca: '#7A6248', cara: '#E8742A', risca: '#A8906C', bico: '#3A2A1E' };
  const PARDAL = { costas: '#9A7450', asa: '#7A5634', cont: '#3E2A18', peito: '#D8CCB6', barriga: '#EEE6D6', cabeca: '#8A8478', cara: '#E2D8C6', risca: '#E8D8B8', bico: '#4A3A2A' };
  // coelho sentado, virado para a direita, pés em (0,0)
  function coelhoSVG() {
    const orelha = (cls, dx, cor, rot) => `<g class="${cls}"><g transform="translate(${dx},0) rotate(${rot},15,-62)">
        <path d="M10,-62 C3,-76 1,-93 7,-101 C13,-106 21,-94 21,-79 C21,-70 19,-64 19,-62 Z" fill="${cor}" stroke="#5A4230" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M12,-67 C8,-79 8,-91 10.5,-97 C14,-97 16.5,-87 16.5,-77 C16.5,-71 15.5,-68 14.5,-66 Z" fill="#E8A8A0" opacity=".9"/></g></g>`;
    return `<g class="arvore-coelho" transform="translate(392,778) scale(1.12)">
      <ellipse cx="-2" cy="1" rx="42" ry="7" fill="url(#arvore-sombra)"/>
      <g class="cb-corpo">
        <circle cx="-32" cy="-20" r="9" fill="#F6F0E6" stroke="#8A7460" stroke-width="1.5"/>
        <path d="M-30,-4 C-40,-24 -30,-48 -6,-50 C14,-52 25,-38 23,-22 C21,-8 14,0 0,0 L-22,0 C-28,0 -30,-2 -30,-4 Z" fill="url(#arvore-pelo)" stroke="#5A4230" stroke-width="2"/>
        <path d="M-27,-8 C-30,-24 -18,-33 -6,-29 C4,-25 4,-11 -1,-3" stroke="#6E523A" stroke-width="1.8" fill="#9A7A5C" fill-opacity=".45"/>
        <path d="M-20,-40 C-12,-46 -2,-46 4,-44" stroke="#D8C0A0" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>
        <path d="M9,-34 C19,-30 21,-14 13,-2 L3,-2 C9,-12 9,-24 9,-34 Z" fill="#EADCC6" opacity=".9"/>
        <ellipse cx="-12" cy="-2.5" rx="16" ry="4.5" fill="#B49478" stroke="#5A4230" stroke-width="1.6"/>
        <ellipse cx="12" cy="-2.5" rx="5.2" ry="3.6" fill="#C8AC90" stroke="#5A4230" stroke-width="1.4"/><ellipse cx="19" cy="-2.5" rx="5.2" ry="3.6" fill="#C8AC90" stroke="#5A4230" stroke-width="1.4"/>
      </g>
      <g class="cb-cabeca">
        ${orelha('cb-orelha1', -7, '#8E6E52', -14)}
        <ellipse cx="18" cy="-52" rx="17" ry="14.5" fill="url(#arvore-pelo)" stroke="#5A4230" stroke-width="2"/>
        <ellipse cx="25" cy="-45.5" rx="9.5" ry="6.4" fill="#EADCC6" opacity=".85"/>
        ${orelha('cb-orelha0', 0, '#A8876A', 0)}
        <ellipse cx="25" cy="-55" rx="4.4" ry="4.8" fill="#2A1A10"/>
        <g class="cb-olho"><circle cx="25.6" cy="-55" r="2.8" fill="#6A4426"/><circle cx="26" cy="-55" r="1.6" fill="#100806"/>
          <circle cx="24.3" cy="-56.9" r="1.2" fill="#FFFFFF"/><circle cx="26.8" cy="-53.4" r=".6" fill="#FFFFFF"/></g>
        <ellipse class="cb-palp" cx="25" cy="-55" rx="5.2" ry="5.4" fill="#9A7A5C" transform="translate(0,-60.4) scale(1,.001) translate(0,60.4)"/>
        <path d="M21,-61 Q25,-63 29,-60" stroke="#5A4230" stroke-width="1.2" fill="none" opacity=".7"/>
        <g class="cb-nariz"><path d="M32.6,-50.6 L36,-52 L35.2,-48.8 Z" fill="#E88A90" stroke="#A85A60" stroke-width=".8"/>
          <path d="M35,-48.8 q-1.5,3 -4.2,3 M35,-48.8 q.5,3 3,3.2" stroke="#5A4230" stroke-width="1" fill="none"/></g>
        <path d="M32,-49 l13,-4 M32,-48 l13,1 M31,-47 l11,5" stroke="#FFFFFF" stroke-width=".9" opacity=".85"/>
      </g></g>`;
  }
  // esquilo vermelho, virado para a direita, pés em (0,0)
  function esquiloSVG() {
    return `<g class="arvore-esquilo" display="none"><g class="eq-in">
      <path class="eq-cauda" d="M-14,-10 C-30,-8 -42,-24 -38,-42 C-34,-56 -18,-60 -12,-51 C-6,-43 -15,-37 -22,-39 C-21,-30 -16,-22 -7,-16 Z" fill="url(#arvore-esquilo)" stroke="#6A2E10" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M-30,-22 C-34,-34 -30,-46 -22,-50" stroke="#F0A060" stroke-width="2.4" fill="none" opacity=".7" stroke-linecap="round"/>
      <path class="eq-pataT" d="M-8,-8 L-14,0" stroke="#8A3A16" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="-9" cy="-9" rx="9" ry="6.5" fill="#B4501E" stroke="#6A2E10" stroke-width="1.4"/>
      <ellipse cx="1" cy="-12" rx="16" ry="9" fill="url(#arvore-esquilo)" stroke="#6A2E10" stroke-width="1.6"/>
      <path d="M-4,-4.5 Q6,-2.5 13,-8" stroke="#F2DCB8" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path class="eq-pataF" d="M12,-8 L15,0" stroke="#8A3A16" stroke-width="4" stroke-linecap="round"/>
      <path d="M13,-26 L12,-36 L19,-28 Z" fill="#B4501E" stroke="#6A2E10" stroke-width="1.2" stroke-linejoin="round"/>
      <circle cx="18" cy="-19" r="8.4" fill="url(#arvore-esquilo)" stroke="#6A2E10" stroke-width="1.5"/>
      <path d="M19,-15 C23,-14 26,-16 26.5,-18" stroke="#F2DCB8" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="21" cy="-21" r="1.9" fill="#120A06"/><circle cx="20.4" cy="-21.6" r=".6" fill="#FFFFFF"/><circle cx="26.4" cy="-18.6" r="1.2" fill="#3A1A0A"/>
    </g></g>`;
  }
  // pica-pau-malhado agarrado ao tronco (bico para +x), pés em (0,0)
  function picaPauSVG() {
    return `<g class="arvore-picapau" display="none"><g class="pp-in">
      <g class="pp-asas" opacity="0"><path d="M-8,-10 C-20,-30 -36,-34 -42,-26 C-34,-22 -24,-14 -10,-4 Z" fill="#1E1E24" stroke="#0A0A0E" stroke-width="1.2"/>
        <path d="M-16,-18 l-3,-2 M-24,-22 l-3,-2 M-32,-24 l-3,-1" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/></g>
      <path d="M-7,6 L-12,30 L-3,26 L1,8 Z" fill="#1A1A1E" stroke="#0A0A0E" stroke-width="1"/>
      <ellipse cx="-6" cy="-6" rx="10" ry="17" transform="rotate(10 -6 -6)" fill="#22222A" stroke="#0A0A0E" stroke-width="1.4"/>
      <path d="M-1,-20 C5,-12 5,4 -1,10 C-4,4 -4,-10 -1,-20 Z" fill="#F0ECE2"/>
      <path d="M-12,-14 q-3,10 1,18" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M-14,0 l3,1 M-14,6 l3,1 M-12,11 l3,1" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/>
      <ellipse cx="-2" cy="10" rx="4" ry="5" fill="#D8282A"/>
      <path d="M0,-3 l6,-2 M0,4 l6,1" stroke="#5A5A5A" stroke-width="2" stroke-linecap="round"/>
      <g class="pp-cab">
        <circle cx="-3" cy="-28" r="8.6" fill="#F6F2EA" stroke="#0A0A0E" stroke-width="1.4"/>
        <path d="M-11,-30 C-10,-38 2,-40 5,-33 C0,-35 -6,-34 -11,-30 Z" fill="#1A1A1E"/>
        <ellipse cx="-10" cy="-27" rx="3.4" ry="4" fill="#D8282A"/>
        <path d="M-9,-22 C-4,-24 1,-23 4,-25" stroke="#1A1A1E" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        <circle cx="0" cy="-29" r="1.7" fill="#120A06"/><circle cx="-.5" cy="-29.6" r=".55" fill="#FFFFFF"/>
        <path d="M4.5,-30.5 L17,-28 L4.5,-25.5 Z" fill="#5A5A62" stroke="#2A2A2E" stroke-width=".8"/>
      </g></g></g>`;
  }
  // borboleta (vista de cima): cada asa num grupo que encolhe em x para bater
  function borboletaSVG() {
    const asa = s => `<g class="bb-asa${s < 0 ? 'E' : 'D'}"><g transform="scale(${s},1)">
        <path d="M0,-2 C-6,-16 -24,-22 -27,-9 C-28,-1 -15,2 0,0 Z" fill="#F4A21E" stroke="#4A2008" stroke-width="1.3" stroke-linejoin="round"/>
        <path d="M-27,-9 C-26,-15 -20,-19 -14,-17 C-18,-12 -22,-8 -27,-7 Z" fill="#2A1A10"/>
        <path d="M0,1 C-12,2 -21,10 -16,18 C-10,22 -4,14 0,4 Z" fill="#E8841A" stroke="#4A2008" stroke-width="1.3" stroke-linejoin="round"/>
        <circle cx="-21" cy="-12" r="1.6" fill="#FFFFFF"/><circle cx="-17" cy="-15" r="1.2" fill="#FFFFFF"/><circle cx="-12" cy="12" r="2" fill="#5A2A0A"/></g></g>`;
    return `<g class="arvore-borboleta" display="none">${asa(-1)}${asa(1)}
      <ellipse cx="0" cy="1" rx="2.2" ry="9" fill="#3A2414"/><path d="M-1,-7 C-3,-13 -6,-15 -8,-16 M1,-7 C3,-13 6,-15 8,-16" stroke="#3A2414" stroke-width="1.1" fill="none"/>
      <circle cx="-8" cy="-16" r="1.2" fill="#3A2414"/><circle cx="8" cy="-16" r="1.2" fill="#3A2414"/></g>`;
  }
  // folha solta (partícula) e maçã no chão
  const COR_FOLHA = [['#8CC040', '#4E7A22'], ['#A8C848', '#5E7E24'], ['#6EA834', '#3E6A1E'], ['#D8C450', '#8A7A24'], ['#9CC444', '#4E7A22']];
  function folhaSoltaSVG(i) {
    const [c, v] = COR_FOLHA[i % COR_FOLHA.length];
    return `<g class="arvore-folha${i}" display="none"><path d="M-12,0 C-7,-7 6,-8 12,0 C6,8 -7,7 -12,0 Z" fill="${c}" stroke="${v}" stroke-width="1.2"/>
      <path d="M-14,0 L10,0 M-3,0 l5,-4 M3,0 l5,-3 M-3,0 l5,4" stroke="${v}" stroke-width="1" fill="none"/></g>`;
  }

  /* ================= 4) Ícone do menu (sem gradientes com id) ================= */
  function iconeSVG() {
    const corda = y => Math.sqrt(106 * 106 - (y - 110) * (y - 110));
    const chao = (y, cor, curva) => { const w = corda(y); return `<path d="M${n(110 - w)},${y} Q110,${y - curva} ${n(110 + w)},${y} A106,106 0 0,1 ${n(110 - w)},${y} Z" fill="${cor}"/>`; };
    const r = semente(9);
    let copa = '', luz = '', fol = '';
    const tufos = [[110, 62, 34], [80, 74, 28], [140, 74, 28], [64, 98, 24], [156, 98, 24], [92, 100, 30], [128, 100, 30], [110, 88, 30]];
    for (const [x, y, rr] of tufos) {
      for (let j = 0; j < 7; j++) { const a = j / 7 * TAU, rc = rr * .5; copa += circ(x + Math.cos(a) * rr * .5, y + Math.sin(a) * rr * .42, rc); }
      luz += circ(x - rr * .3, y - rr * .3, rr * .32);
      for (let j = 0; j < 3; j++) fol += folhaD(x + (r() - .5) * rr, y + (r() - .3) * rr * .8, r() * TAU, 7, 3.5);
    }
    const maca = (x, y) => `<circle cx="${x}" cy="${y}" r="5.6" fill="#E0302A" stroke="#7A1A14" stroke-width="1.2"/><circle cx="${x - 2}" cy="${y - 2}" r="1.5" fill="#FFFFFF" opacity=".8"/><path d="M${x},${y - 5} l1,-3" stroke="#4A3018" stroke-width="1.4"/>`;
    return `<circle cx="110" cy="110" r="106" fill="#9CD2F2"/>
      <circle cx="44" cy="44" r="26" fill="#FFF8D8" opacity=".55"/><circle cx="44" cy="44" r="13" fill="#FFF2B4"/>
      <path d="M40,40 C50,32 64,34 70,40 C78,38 86,42 86,46 L40,46 Z" fill="#FFFFFF" opacity=".9" transform="translate(84,-4)"/>
      ${chao(150, '#B4C870', 10)}${chao(162, '#8CC04A', 6)}
      <ellipse cx="124" cy="182" rx="64" ry="10" fill="#4E7A2A" opacity=".55"/>
      <path d="M92,186 C100,182 104,170 104,152 C104,138 102,128 100,118 L120,118 C118,128 116,138 116,152 C116,170 120,182 130,186 Z" fill="#7A5232" stroke="#3A2414" stroke-width="2"/>
      <path d="M106,180 C107,160 106,140 105,124" stroke="#A88058" stroke-width="2.4" fill="none"/>
      <path d="M100,124 L76,104 M118,124 L144,104 M110,120 L110,90" stroke="#5A3A20" stroke-width="5" stroke-linecap="round"/>
      <path d="${copa}" fill="#5E9A2E" stroke="#2A4414" stroke-width="4" paint-order="stroke"/>
      <path d="${luz}" fill="#9CCC50" opacity=".85"/>
      <path d="${fol}" fill="#B8DC68"/>
      ${maca(78, 104)}${maca(140, 96)}${maca(108, 112)}${maca(160, 112)}${maca(94, 80)}${maca(126, 70)}
      <path d="M74,128 L72,170 M92,130 L94,170" stroke="#C8A878" stroke-width="2"/><path d="M66,170 L100,170 L99,175 L67,175 Z" fill="#B07A44" stroke="#4A2E18" stroke-width="1.4"/>
      <path d="M68,128 C80,126 92,128 104,132" stroke="#6A4424" stroke-width="5" stroke-linecap="round"/>
      <g fill="#E8322A"><circle cx="40" cy="168" r="3.4"/><circle cx="172" cy="172" r="3.4"/><circle cx="58" cy="186" r="3"/></g>
      <g fill="#FFFFFF"><circle cx="150" cy="190" r="3"/><circle cx="30" cy="150" r="2.4"/><circle cx="190" cy="156" r="2.4"/></g>
      <circle cx="110" cy="110" r="106" fill="none" stroke="#5A9ACB" stroke-width="3"/>`;
  }

  /* ================= 5) Cenário ================= */
  function defs() {
    return `
    <linearGradient id="arvore-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A92D6"/><stop offset=".38" stop-color="#84BCE6"/><stop offset=".7" stop-color="#C8E2EC"/><stop offset="1" stop-color="#F6E4B4"/></linearGradient>
    <radialGradient id="arvore-solBrilho"><stop offset="0" stop-color="#FFF8DC" stop-opacity=".95"/><stop offset=".2" stop-color="#FFF0C0" stop-opacity=".5"/><stop offset=".55" stop-color="#FFE8B0" stop-opacity=".14"/><stop offset="1" stop-color="#FFE8B0" stop-opacity="0"/></radialGradient>
    <radialGradient id="arvore-sol" cx=".42" cy=".4" r=".62"><stop offset="0" stop-color="#FFFFF4"/><stop offset=".7" stop-color="#FFF2BE"/><stop offset="1" stop-color="#FFE08A"/></radialGradient>
    <linearGradient id="arvore-colLonge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CB8A8"/><stop offset="1" stop-color="#B6C8A4"/></linearGradient>
    <linearGradient id="arvore-colMeio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BACA6C"/><stop offset=".6" stop-color="#A2BA58"/><stop offset="1" stop-color="#8EAE4C"/></linearGradient>
    <linearGradient id="arvore-prado" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8C85A"/><stop offset=".25" stop-color="#90BC4C"/><stop offset=".65" stop-color="#76A63C"/><stop offset="1" stop-color="#5E9030"/></linearGradient>
    <linearGradient id="arvore-caminho" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2C894"/><stop offset=".5" stop-color="#D2B07A"/><stop offset="1" stop-color="#BE9662"/></linearGradient>
    <radialGradient id="arvore-sombra"><stop offset="0" stop-color="#2A3A12" stop-opacity=".5"/><stop offset=".65" stop-color="#2A3A12" stop-opacity=".2"/><stop offset="1" stop-color="#2A3A12" stop-opacity="0"/></radialGradient>
    <radialGradient id="arvore-sombraArv"><stop offset="0" stop-color="#22401A" stop-opacity=".62"/><stop offset=".75" stop-color="#22401A" stop-opacity=".5"/><stop offset="1" stop-color="#28461A" stop-opacity="0"/></radialGradient>
    <radialGradient id="arvore-mancha"><stop offset="0" stop-color="#F8F0A8" stop-opacity=".5"/><stop offset="1" stop-color="#F8F0A8" stop-opacity="0"/></radialGradient>
    <radialGradient id="arvore-terra"><stop offset="0" stop-color="#B89458" stop-opacity=".85"/><stop offset=".7" stop-color="#B89458" stop-opacity=".5"/><stop offset="1" stop-color="#B89458" stop-opacity="0"/></radialGradient>
    <radialGradient id="arvore-copa0" cx=".36" cy=".3" r=".78"><stop offset="0" stop-color="${CORES_TUFO[0].luz}"/><stop offset=".55" stop-color="#4E7A28"/><stop offset="1" stop-color="${CORES_TUFO[0].escura}"/></radialGradient>
    <radialGradient id="arvore-copa1" cx=".36" cy=".3" r=".78"><stop offset="0" stop-color="${CORES_TUFO[1].luz}"/><stop offset=".55" stop-color="#5E9030"/><stop offset="1" stop-color="${CORES_TUFO[1].escura}"/></radialGradient>
    <radialGradient id="arvore-copa2" cx=".36" cy=".3" r=".78"><stop offset="0" stop-color="${CORES_TUFO[2].luz}"/><stop offset=".55" stop-color="#6EA238"/><stop offset="1" stop-color="${CORES_TUFO[2].escura}"/></radialGradient>
    <linearGradient id="arvore-troncoU" gradientUnits="userSpaceOnUse" x1="738" y1="0" x2="866" y2="0"><stop offset="0" stop-color="#B08A60"/><stop offset=".3" stop-color="#8E6A44"/><stop offset=".7" stop-color="#6A4A2C"/><stop offset="1" stop-color="#4A321C"/></linearGradient>
    <radialGradient id="arvore-sombraTopo"><stop offset="0" stop-color="#2A1A0A" stop-opacity=".6"/><stop offset=".6" stop-color="#2A1A0A" stop-opacity=".3"/><stop offset="1" stop-color="#2A1A0A" stop-opacity="0"/></radialGradient>
    <radialGradient id="arvore-maca" cx=".34" cy=".32" r=".75"><stop offset="0" stop-color="#FF8A66"/><stop offset=".35" stop-color="#F0402E"/><stop offset=".8" stop-color="#C41E1C"/><stop offset="1" stop-color="#8E1214"/></radialGradient>
    <radialGradient id="arvore-maca2" cx=".34" cy=".3" r=".78"><stop offset="0" stop-color="#FFC060"/><stop offset=".3" stop-color="#F06A30"/><stop offset=".7" stop-color="#D42A20"/><stop offset="1" stop-color="#961618"/></radialGradient>
    <linearGradient id="arvore-madeira" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8A46A"/><stop offset=".6" stop-color="#B07A44"/><stop offset="1" stop-color="#8A5A30"/></linearGradient>
    <radialGradient id="arvore-pelo" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#C8A888"/><stop offset=".55" stop-color="#A2805E"/><stop offset="1" stop-color="#76563A"/></radialGradient>
    <radialGradient id="arvore-esquilo" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#E88A48"/><stop offset=".6" stop-color="#C45A22"/><stop offset="1" stop-color="#8E3A14"/></radialGradient>
    <radialGradient id="arvore-cisco"><stop offset="0" stop-color="#FFFCE0" stop-opacity=".95"/><stop offset=".35" stop-color="#FFF4B8" stop-opacity=".45"/><stop offset="1" stop-color="#FFF4B8" stop-opacity="0"/></radialGradient>
    <radialGradient id="arvore-luzQuente" gradientUnits="userSpaceOnUse" cx="240" cy="140" r="1300"><stop offset="0" stop-color="#FFE8A8" stop-opacity=".26"/><stop offset=".45" stop-color="#FFE0A0" stop-opacity=".08"/><stop offset="1" stop-color="#FFE0A0" stop-opacity="0"/></radialGradient>
    <radialGradient id="arvore-vinheta" cx=".5" cy=".46" r=".8"><stop offset=".62" stop-color="#2A3A1A" stop-opacity="0"/><stop offset="1" stop-color="#2A3A1A" stop-opacity=".26"/></radialGradient>`;
  }
  // nuvem de verão: sombra lilás em baixo, corpo branco, luz quente em cima à esquerda
  function nuvemSVG(i, k) {
    const r = semente(50 + i * 7);
    let corpo = '', sombra = '', luz = '';
    for (let j = 0; j < 6; j++) {
      const x = -90 + j * 36 + (r() - .5) * 12, rr = 26 + r() * 22 + (j > 1 && j < 4 ? 14 : 0), y = -rr * .45;
      corpo += elip(x, y, rr, rr * .78);
      luz += elip(x - rr * .25, y - rr * .3, rr * .55, rr * .36);
    }
    corpo += elip(0, 4, 118, 16);
    sombra = elip(4, 10, 112, 13);
    return `<g class="arvore-nuvem${i}"><g transform="scale(${k})"><path d="${sombra}" fill="#C8C6DA" opacity=".9"/><path d="${corpo}" fill="#FFFFFF"/>
      <path d="${luz}" fill="#FFF6DC" opacity=".9"/><path d="${elip(6, 8, 104, 8)}" fill="#E4E2EE"/></g></g>`;
  }
  // árvore pequenina ao longe (copa redonda com luz da esquerda)
  function arvorePequena(x, y, k, r) {
    let c = '', l = '';
    for (let j = 0; j < 4; j++) { const a = j / 4 * TAU + r(), rr = 9 * k; c += circ(x + Math.cos(a) * 6 * k, y - 22 * k + Math.sin(a) * 5 * k, rr); }
    l += circ(x - 5 * k, y - 27 * k, 6 * k);
    return { tronco: `M${n(x - 1.6 * k)},${n(y)}L${n(x - 1 * k)},${n(y - 16 * k)}L${n(x + 1 * k)},${n(y - 16 * k)}L${n(x + 1.6 * k)},${n(y)}Z`, c, l };
  }
  function longeSVG() {
    const r = semente(11);
    let s = `<path d="M0,468 C160,438 300,450 440,444 C600,436 700,456 860,448 C1020,440 1140,428 1280,442 C1420,456 1520,438 1600,444 L1600,620 L0,620 Z" fill="url(#arvore-colLonge)"/>
      <path d="M120,452 C200,440 260,442 330,446 M1180,436 C1240,430 1300,434 1360,444" stroke="#D4E0C8" stroke-width="3" fill="none" opacity=".6"/>`;
    let pontos = '';
    for (let i = 0; i < 70; i++) { const x = r() * 1600, y = 462 + r() * 26; pontos += elip(x, y, 4 + r() * 4, 3 + r() * 2); }
    s += `<path d="${pontos}" fill="#8EAA88" opacity=".8"/>`;
    s += `<path d="M0,518 C140,490 280,498 420,510 C560,522 700,518 860,512 C1020,506 1180,492 1320,498 C1460,504 1540,496 1600,498 L1600,640 L0,640 Z" fill="url(#arvore-colMeio)"/>
      <path d="M0,518 C140,490 280,498 420,510 C560,522 700,518 860,512 C1020,506 1180,492 1320,498 C1460,504 1540,496 1600,498" stroke="#E2E49A" stroke-width="3" fill="none" opacity=".55"/>`;
    // campo de restolho dourado às riscas e sebes
    s += `<path d="M20,540 C120,524 260,528 400,540 L420,560 C280,552 140,550 10,560 Z" fill="#D8CC7A" opacity=".75"/>
      <path d="M40,544 L30,558 M80,538 L74,556 M120,535 L118,554 M160,534 L162,553 M200,534 L206,553 M240,535 L250,554 M280,537 L294,555 M320,539 L336,557 M360,541 L378,559" stroke="#C2B060" stroke-width="2" opacity=".7"/>`;
    let sebe = '';
    for (let i = 0; i < 28; i++) { const x = 440 + i * 26 + r() * 8; sebe += elip(x, 530 + Math.sin(i * .4) * 3, 12 + r() * 5, 7 + r() * 2); }
    for (let i = 0; i < 14; i++) { const x = 1200 + i * 28 + r() * 8; sebe += elip(x, 520 + Math.sin(i * .5) * 3, 12 + r() * 5, 7 + r() * 2); }
    s += `<path d="${sebe}" fill="#7E9A44" opacity=".8"/>`;
    // árvores pequeninas
    let tr = '', cp = '', lz = '';
    for (const [x, y, k] of [[118, 516, 1], [168, 512, .85], [212, 514, .7], [1238, 500, 1], [1290, 498, .8], [1474, 502, 1.1], [1540, 500, .8], [474, 524, .7], [1120, 512, .75]]) {
      const a = arvorePequena(x, y, k, r); tr += a.tronco; cp += a.c; lz += a.l;
    }
    s += `<path d="${tr}" fill="#5E4630"/><path d="${cp}" fill="#5E8A34" stroke="#3E6020" stroke-width="1.4" paint-order="stroke"/><path d="${lz}" fill="#8CB848" opacity=".8"/>`;
    // fardos de palha redondos (com sombra à direita)
    let fardos = '';
    for (const [x, y] of [[1340, 528], [1390, 534], [1430, 524]]) {
      fardos += `<ellipse cx="${x + 4}" cy="${y + 7}" rx="14" ry="3" fill="#6E7A30" opacity=".45"/><rect x="${x - 11}" y="${y - 9}" width="22" height="16" rx="3" fill="#E2C25E" stroke="#9A7A2A" stroke-width="1.2"/>
        <ellipse cx="${x - 11}" cy="${y - 1}" rx="4.5" ry="8" fill="#F0D886" stroke="#9A7A2A" stroke-width="1.2"/>`;
    }
    return s + fardos;
  }
  // ovelhas minúsculas a pastar (o corpo é um tufo de lã, a cabeça baixa e sobe)
  const OVELHAS = [[250, 528, 1], [296, 536, -1], [338, 524, 1], [1190, 520, -1], [1300, 512, 1], [1252, 524, 1]];
  function ovelhasSVG() {
    return OVELHAS.map(([x, y, s], i) => `<g class="arvore-ovelha${i}" transform="translate(${x},${y}) scale(${s},1)">
      <ellipse cx="0" cy="1" rx="11" ry="2.2" fill="#5E7A2A" opacity=".4"/>
      <path d="M-5,0 L-5,-5 M4,0 L4,-5" stroke="#3A3430" stroke-width="2" stroke-linecap="round"/>
      <path d="${circ(-5, -8, 4.4)}${circ(0, -10, 5)}${circ(5, -8, 4.4)}${circ(0, -6, 5.4)}" fill="#F8F6EE" stroke="#A8A294" stroke-width="1.6" paint-order="stroke"/>
      <g class="ov-cab"><ellipse cx="9" cy="-8" rx="3" ry="2.4" fill="#3A3430"/></g></g>`).join('');
  }
  // muro de pedra solta a atravessar o prado, com uma passagem para o caminho
  const muroY = x => 590 + 4 * Math.sin(x / 260 + .6);
  function muroSVG() {
    const r = semente(29);
    let pA = '', pB = '', topo = '', luz = '', musgo = '';
    const pedra = (x, y, w, h) => { const q = Math.min(4, h / 2); return `M${n(x + q)},${n(y)}h${n(w - 2 * q)}q${q},0 ${q},${q}v${n(h - 2 * q)}q0,${q} ${-q},${q}h${n(-(w - 2 * q))}q${-q},0 ${-q},${-q}v${n(-(h - 2 * q))}q0,${-q} ${q},${-q}Z`; };
    for (let fila = 0; fila < 3; fila++) {
      let x = -20 + fila * 9 - r() * 10;
      while (x < 1620) {
        const w = 16 + r() * 16;
        const base = muroY(x + w / 2);
        if (!(x + w > 1138 && x < 1206)) {
          const y = base - 9 * (fila + 1) - 2 * fila, d = pedra(x, y, w - 2, 9.5);
          if (r() < .5) pA += d; else pB += d;
          if (r() < .25) musgo += elip(x + w * .3, y + 2, 4, 1.8);
        }
        x += w;
      }
    }
    let x = -10;
    while (x < 1620) {
      const w = 20 + r() * 14, base = muroY(x + w / 2), y = base - 36;
      if (!(x + w > 1138 && x < 1206)) { topo += elip(x + w / 2, y + 3, w / 2, 5.6); luz += `M${n(x + 4)},${n(y)}q${n(w / 2 - 4)},-3 ${n(w - 8)},0`; }
      x += w - 1;
    }
    // pilares da passagem
    const pil = `M1128,${n(muroY(1128) + 2)} L1128,${n(muroY(1128) - 46)} Q1138,${n(muroY(1128) - 52)} 1146,${n(muroY(1128) - 46)} L1146,${n(muroY(1128) + 2)} Z
      M1198,${n(muroY(1198) + 2)} L1198,${n(muroY(1198) - 46)} Q1208,${n(muroY(1198) - 52)} 1216,${n(muroY(1198) - 46)} L1216,${n(muroY(1198) + 2)} Z`;
    return `<path d="M-20,${n(muroY(0) + 2)} C400,${n(muroY(400) + 6)} 800,${n(muroY(800) + 6)} 1620,${n(muroY(1600) + 4)} L1620,${n(muroY(1600) + 12)} L-20,${n(muroY(0) + 12)} Z" fill="#3E5A20" opacity=".3"/>
      <path d="${pA}" fill="#BEB6A2" stroke="#6E665A" stroke-width="1.4"/><path d="${pB}" fill="#A69E8A" stroke="#6E665A" stroke-width="1.4"/>
      <path d="${topo}" fill="#C8C0AC" stroke="#6E665A" stroke-width="1.4" paint-order="stroke"/>
      <path d="${luz}" stroke="#F0EADA" stroke-width="2" fill="none" opacity=".8" stroke-linecap="round"/>
      <path d="${musgo}" fill="#7E9A3A" opacity=".8"/>
      <path d="${pil}" fill="#B6AE9A" stroke="#6E665A" stroke-width="1.6"/>`;
  }
  // caminho de terra: da passagem no muro até cá à frente (bordas para medir onde não há erva)
  const CAM_E = [[590, 1146], [640, 1110], [690, 1060], [760, 1016], [820, 986], [900, 940]];
  const CAM_D = [[590, 1198], [640, 1206], [720, 1214], [780, 1222], [840, 1252], [900, 1294]];
  const noCaminho = (x, y) => y > 585 && x > margem(CAM_E, y) - 6 && x < margem(CAM_D, y) + 6;
  function caminhoSVG() {
    const r = semente(19);
    let seixos = '', sulcos = '';
    for (let i = 0; i < 60; i++) {
      const y = 600 + Math.pow(r(), .8) * 300, xl = margem(CAM_E, y), xr = margem(CAM_D, y), x = lerp(xl, xr, .08 + r() * .84), k = .4 + (y - 590) / 300;
      seixos += elip(x, y, (2 + r() * 3) * k, (1.2 + r() * 1.6) * k);
    }
    for (const u of [.34, .66]) {
      const p = [];
      for (let y = 596; y <= 900; y += 30) p.push([lerp(margem(CAM_E, y), margem(CAM_D, y), u), y]);
      sulcos += caminhoSuave(p, true);
    }
    return `<path d="M1146,590 C1120,632 1064,684 1030,730 C1000,772 960,840 936,904 L1300,904 C1262,850 1226,792 1216,720 C1210,660 1206,620 1198,590 Z" fill="url(#arvore-caminho)" stroke="#9A7A48" stroke-width="2"/>
      <path d="${sulcos}" stroke="#B08A58" stroke-width="5" fill="none" opacity=".55" stroke-linecap="round"/>
      <path d="${seixos}" fill="#F0E2C0" stroke="#A88A5C" stroke-width="1"/>
      <path d="M1146,592 C1124,630 1070,680 1034,726 M1200,594 C1208,640 1212,690 1218,730" stroke="#F4E6C4" stroke-width="2.5" fill="none" opacity=".6"/>`;
  }
  // prado: três faixas de erva com flores silvestres (cada faixa ondula com skewX); não cresce erva no caminho
  function pradoSVG() {
    const r = semente(31);
    const faixas = [[598, 650, .5], [640, 720, .75], [712, 806, 1]];
    let s = `<path d="M0,592 C300,582 600,594 900,588 C1200,582 1400,592 1600,586 L1600,900 L0,900 Z" fill="url(#arvore-prado)"/>
      <path d="M0,592 C300,582 600,594 900,588 C1200,582 1400,592 1600,586" stroke="#D2E48A" stroke-width="3" fill="none" opacity=".5"/>
      <path d="M-20,640 C300,630 700,646 1000,638 C1300,630 1500,640 1640,636 L1640,668 C1300,664 1000,676 700,672 C400,668 200,660 -20,670 Z M-20,740 C300,730 600,744 900,738 L900,770 C600,778 300,766 -20,774 Z" fill="#C2D46A" opacity=".3"/>`;
    faixas.forEach(([y0, y1, k], i) => {
      let erva = '', luz = '', pap = '', mio = '', marg = '', amar = '', azul = '';
      for (let j = 0; j < 150; j++) {
        const x = r() * 1660 - 30, y = y0 + r() * (y1 - y0);
        if (noCaminho(x, y)) continue;
        const kk = k * (.8 + (y - y0) / (y1 - y0) * .4), h = (8 + r() * 12) * kk, inc = (r() - .3) * 6 * kk;
        erva += `M${n(x - 1.7 * kk)},${n(y)}Q${n(x + inc * .4)},${n(y - h * .6)} ${n(x + inc)},${n(y - h)}Q${n(x + inc * .4 + 1)},${n(y - h * .5)} ${n(x + 1.7 * kk)},${n(y)}Z`;
        if (r() < .3) luz += `M${n(x + inc * .3)},${n(y - h * .4)}L${n(x + inc)},${n(y - h)}`;
      }
      const NF = [40, 46, 40][i];
      for (let j = 0; j < NF; j++) {
        const x = r() * 1640 - 20, y = y0 + 4 + r() * (y1 - y0 - 4);
        if (noCaminho(x, y) || (x > 700 && x < 900 && y > 740)) continue;
        const kk = k * (.85 + r() * .4), tipo = r();
        if (tipo < .34) { pap += circ(x, y - 4 * kk, 4.2 * kk); mio += circ(x, y - 4 * kk, 1.3 * kk); }
        else if (tipo < .64) { for (let a = 0; a < 6; a++) marg += elip(x + Math.cos(a * PI / 3) * 3.2 * kk, y - 4 * kk + Math.sin(a * PI / 3) * 2.2 * kk, 2.2 * kk, 1.4 * kk); amar += circ(x, y - 4 * kk, 1.4 * kk); }
        else if (tipo < .84) { for (let a = 0; a < 5; a++) azul += elip(x + Math.cos(a * 1.26) * 2.6 * kk, y - 4 * kk + Math.sin(a * 1.26) * 2 * kk, 2 * kk, 1.5 * kk); }
        else amar += circ(x, y - 4 * kk, 2.6 * kk);
      }
      s += `<g class="arvore-faixa${i}"><path d="${erva}" fill="${['#8AB648', '#76A83C', '#6AA036'][i]}"/>
        <path d="${luz}" stroke="#C4E07A" stroke-width="${n(1.2 * k)}" fill="none" opacity=".7"/>
        <path d="${pap}" fill="#E8322A" stroke="#9A1A14" stroke-width=".6"/><path d="${mio}" fill="#2A1A14"/>
        <path d="${marg}" fill="#FFFFFF" stroke="#D8D4CC" stroke-width=".5"/><path d="${azul}" fill="#4E7EE0" stroke="#2E4E9A" stroke-width=".5"/>
        <path d="${amar}" fill="#FFD228" stroke="#C89A10" stroke-width=".5"/></g>`;
    });
    return s;
  }
  // flores grandes em primeiro plano (baloiçam com o vento; a haste roda à volta da base)
  const FLORES = [[96, 900, 118, 'p'], [214, 906, 92, 'm'], [520, 904, 84, 'p'], [1088, 906, 96, 'm'], [1372, 900, 110, 'p'], [1500, 904, 90, 'm'], [1270, 908, 70, 'a']];
  function floresSVG() {
    return FLORES.map(([x, y, h, tipo], i) => {
      let cab;
      if (tipo === 'p') cab = `<path d="${circ(-6, -1, 8)}${circ(6, -1, 8)}${circ(0, -6, 8)}${circ(0, 4, 7)}" fill="#E8322A" stroke="#9A1A14" stroke-width="1.4" paint-order="stroke"/>
          <path d="M-9,-5 C-6,-9 -2,-10 1,-9" stroke="#FF8A70" stroke-width="2" fill="none" stroke-linecap="round"/><circle r="3.6" fill="#2A1A14"/><path d="M-3,-3 L3,3 M3,-3 L-3,3" stroke="#6A5A3A" stroke-width="1"/>`;
      else if (tipo === 'm') cab = `<path d="${Array.from({ length: 12 }, (_, k) => { const a = k / 12 * TAU; return elip(Math.cos(a) * 8, Math.sin(a) * 8, 5.5, 2.4).replace(/^M[^a]*/, `M${n(Math.cos(a) * 8 - 5.5)},${n(Math.sin(a) * 8)}`); }).join('')}" fill="#FFFFFF" stroke="#C8C4BC" stroke-width=".8"/><circle r="5" fill="#F6C424" stroke="#C8901A" stroke-width="1"/>`;
      else cab = `<path d="${Array.from({ length: 5 }, (_, k) => { const a = k / 5 * TAU - PI / 2; return circ(Math.cos(a) * 5, Math.sin(a) * 5, 4.6); }).join('')}" fill="#FFD228" stroke="#C89A10" stroke-width="1"/><circle r="2.6" fill="#E8A010"/>`;
      return `<g class="arvore-flor${i}" transform="translate(${x},${y})"><g class="fl-in">
        <path d="M0,0 Q${n(h * .1)},${n(-h * .5)} 0,${-h}" stroke="#4E8A2A" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="${folhaD(0, -h * .3, -PI * .8, 22, 8)}${folhaD(0, -h * .5, -PI * .2, 18, 7)}" fill="#5E9A32" stroke="#3E6A1E" stroke-width="1"/>
        <g transform="translate(0,${-h})">${cab}</g></g></g>`;
    }).join('');
  }
  // erva alta do primeiro plano (três grupos que dobram com o vento)
  function ervaFrenteSVG() {
    const grupo = (x0, x1, sem, cls) => {
      const r = semente(sem);
      let d = '', d2 = '', luz = '';
      for (let x = x0; x < x1; x += 5 + r() * 9) {
        if (cls === 'arvore-ervaM' && x > 930 && x < 1290 && r() < .7) continue;
        const h = 22 + r() * 46, b = 906 - r() * 18, inc = (r() - .4) * 26;
        const lam = `M${n(x - 3)},${n(b)}Q${n(x + inc * .4)},${n(b - h * .6)} ${n(x + inc)},${n(b - h)}Q${n(x + inc * .4 + 3)},${n(b - h * .5)} ${n(x + 3)},${n(b)}Z`;
        if (r() < .5) d += lam; else d2 += lam;
        if (r() < .4) luz += `M${n(x + inc * .5)},${n(b - h * .55)}Q${n(x + inc * .8)},${n(b - h * .8)} ${n(x + inc)},${n(b - h)}`;
      }
      return `<g class="${cls}"><path d="${d}" fill="#5A9030"/><path d="${d2}" fill="#78AE40"/><path d="${luz}" stroke="#C4E07A" stroke-width="1.6" fill="none" opacity=".75"/></g>`;
    };
    return grupo(-10, 520, 3, 'arvore-ervaE') + grupo(520, 1080, 5, 'arvore-ervaM') + grupo(1080, 1620, 9, 'arvore-ervaD');
  }
  // erva por cima das pontas das raízes e à volta da base (parada)
  function ervaBaseSVG() {
    const r = semente(57);
    let d = '', d2 = '';
    for (let i = 0; i < 70; i++) {
      const x = 640 + r() * 330, b = 796 + r() * 10, h = 8 + r() * 16, inc = (r() - .4) * 8;
      const lam = `M${n(x - 2)},${n(b)}Q${n(x + inc * .4)},${n(b - h * .6)} ${n(x + inc)},${n(b - h)}Q${n(x + inc * .4 + 2)},${n(b - h * .5)} ${n(x + 2)},${n(b)}Z`;
      if (r() < .5) d += lam; else d2 += lam;
    }
    return `<path d="${d}" fill="#5E9632"/><path d="${d2}" fill="#82B444"/>`;
  }

  /* ================= 6) montar() ================= */
  function montar(raiz, ajudas) {
    const relogio = ajudas.relogio;
    const calma = ajudas.reduzido ? .45 : 1;
    const N_FOLHAS = 16, N_CHAO = 4, N_BANDO = 5, N_CISCOS = 10;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1600 900');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    const tufosPorCamada = c => TUFOS.filter(t => t.cam === c).map(t => `<g class="arvore-tufo${t.i}">${tufoSVG(t)}
        ${MACAS.map((m, j) => m[2] === t.i ? `<g class="arvore-maca${j}" transform="translate(${m[0]},${m[1]})"><g class="mc-in">${macaSVG(j)}</g></g>` : '').join('')}</g>`).join('');
    svg.innerHTML = `<defs>${defs()}</defs>
      <rect width="1600" height="640" fill="url(#arvore-ceu)"/>
      <circle cx="240" cy="140" r="430" fill="url(#arvore-solBrilho)"/>
      <circle cx="240" cy="140" r="50" fill="url(#arvore-sol)"/>
      <g class="arvore-nuvens">${nuvemSVG(0, 1)}${nuvemSVG(1, .7)}${nuvemSVG(2, .85)}${nuvemSVG(3, .55)}</g>
      <g class="arvore-avesLonge"><path class="arvore-aveL0" d="M-9,0 Q-4,-5 0,0 Q4,-5 9,0" stroke="#4A5A6A" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path class="arvore-aveL1" d="M-9,0 Q-4,-5 0,0 Q4,-5 9,0" stroke="#4A5A6A" stroke-width="2" fill="none" stroke-linecap="round"/></g>
      ${longeSVG()}
      <g class="arvore-ovelhas">${ovelhasSVG()}</g>
      ${muroSVG()}
      ${pradoSVG()}
      ${caminhoSVG()}
      <g class="arvore-sombraArv"><ellipse cx="884" cy="798" rx="380" ry="58" fill="url(#arvore-sombraArv)"/></g>
      <g class="arvore-manchas">${Array.from({ length: 7 }, (_, i) => `<ellipse class="arvore-mancha${i}" rx="26" ry="6" fill="url(#arvore-mancha)"/>`).join('')}</g>
      <ellipse cx="594" cy="772" rx="74" ry="13" fill="url(#arvore-terra)"/>
      <ellipse class="arvore-sombraBal" cx="0" cy="0" rx="46" ry="6" fill="url(#arvore-sombra)"/>
      <ellipse cx="800" cy="796" rx="190" ry="20" fill="url(#arvore-sombra)"/>
      <g class="arvore-arvore">
        <rect x="430" y="110" width="740" height="700" fill="#FFFFFF" opacity="0"/>
        <g class="arvore-copaG"><path d="${interiorD()}" fill="#1E3A14"/></g>
        <g class="arvore-camada0">${tufosPorCamada(0)}</g>
        ${ramoBaloicoSVG()}
        ${troncoSVG()}
        <g class="arvore-ramos">${ramosSVG()}</g>
        ${esquiloSVG()}
        <g class="arvore-camada1">${tufosPorCamada(1)}</g>
        ${ninhoSVG()}
        <g class="arvore-camada2">${tufosPorCamada(2)}</g>
        ${baloicoSVG()}
        ${aveSVG('arvore-mae', PISCO)}${aveSVG('arvore-pai', PISCO)}
        ${picaPauSVG()}
        <path class="arvore-lascas" d="" stroke="#C8A070" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        ${borboletaSVG()}
        <g class="arvore-bando">${Array.from({ length: N_BANDO }, (_, i) => aveSVG('arvore-bd' + i, PARDAL)).join('')}</g>
        ${ervaBaseSVG()}
      </g>
      <g class="arvore-chao">${Array.from({ length: N_CHAO }, (_, i) => `<g class="arvore-caida${i}" display="none"><ellipse class="cd-sombra" cx="0" cy="0" rx="17" ry="4" fill="url(#arvore-sombra)"/><g class="cd-maca">${macaSVG(i)}</g></g>`).join('')}</g>
      ${coelhoSVG()}
      <g class="arvore-folhas">${Array.from({ length: N_FOLHAS }, (_, i) => folhaSoltaSVG(i)).join('')}</g>
      ${floresSVG()}
      ${ervaFrenteSVG()}
      <g class="arvore-ciscos" pointer-events="none">${Array.from({ length: N_CISCOS }, () => '<circle r="7" fill="url(#arvore-cisco)"/>').join('')}</g>
      <rect width="1600" height="900" fill="url(#arvore-luzQuente)" pointer-events="none"/>
      <rect width="1600" height="900" fill="url(#arvore-vinheta)" pointer-events="none"/>`;
    raiz.appendChild(svg);

    const q = s => svg.querySelector(s);
    function poe(el, v) { if (el.__t !== v) { el.__t = v; el.setAttribute('transform', v); } }
    function atr(el, nome, v) { const k = '__' + nome; if (el[k] !== v) { el[k] = v; el.setAttribute(nome, v); } }

    const ave = cls => { const g = q('.' + cls); return { g, in: g.firstElementChild, asa: g.querySelector('.av-asa'), asaL: g.querySelector('.av-asaL'), cab: g.querySelector('.av-cab'), bico: g.querySelector('.av-bico'), pernas: g.querySelector('.av-pernas') }; };
    const R = {
      arvore: q('.arvore-arvore'), copaG: q('.arvore-copaG'), ramos: q('.arvore-ramos'), ninho: q('.arvore-ninho'),
      tufos: TUFOS.map(t => q('.arvore-tufo' + t.i)),
      macas: MACAS.map((m, j) => { const g = q('.arvore-maca' + j); return { g, in: g.firstElementChild }; }),
      baloico: q('.arvore-baloico'), sombraBal: q('.arvore-sombraBal'), sombraArv: q('.arvore-sombraArv'),
      manchas: Array.from({ length: 7 }, (_, i) => q('.arvore-mancha' + i)),
      nuvens: [0, 1, 2, 3].map(i => q('.arvore-nuvem' + i)), avesLonge: [q('.arvore-aveL0'), q('.arvore-aveL1')],
      ovelhas: OVELHAS.map((_, i) => { const g = q('.arvore-ovelha' + i); return { g, cab: g.querySelector('.ov-cab') }; }),
      faixas: [0, 1, 2].map(i => q('.arvore-faixa' + i)), ervas: ['E', 'M', 'D'].map(s => q('.arvore-erva' + s)),
      flores: FLORES.map((_, i) => q('.arvore-flor' + i + ' .fl-in')),
      folhas: Array.from({ length: N_FOLHAS }, (_, i) => q('.arvore-folha' + i)),
      caidas: Array.from({ length: N_CHAO }, (_, i) => { const g = q('.arvore-caida' + i); return { g, sombra: g.querySelector('.cd-sombra'), maca: g.querySelector('.cd-maca') }; }),
      ciscos: Array.from(q('.arvore-ciscos').children),
      coelho: q('.arvore-coelho'), cbCorpo: q('.cb-corpo'), cbCabeca: q('.cb-cabeca'), cbOrelhas: [q('.cb-orelha0'), q('.cb-orelha1')],
      cbOlho: q('.cb-olho'), cbPalp: q('.cb-palp'), cbNariz: q('.cb-nariz'),
      mae: ave('arvore-mae'), pai: ave('arvore-pai'), bando: Array.from({ length: N_BANDO }, (_, i) => ave('arvore-bd' + i)),
      pintos: [0, 1, 2].map(i => { const g = q('.arvore-pinto' + i); return { g, bico: g.querySelector('.pi-bicoB') }; }),
      esquilo: q('.arvore-esquilo'), eqIn: q('.eq-in'), eqCauda: q('.eq-cauda'), eqPatas: [q('.eq-pataF'), q('.eq-pataT')],
      picapau: q('.arvore-picapau'), ppCab: q('.pp-cab'), ppAsas: q('.pp-asas'), lascas: q('.arvore-lascas'),
      borboleta: q('.arvore-borboleta'), bbAsas: [q('.bb-asaE'), q('.bb-asaD')]
    };

    /* --- estado --- */
    let tempo = 0, vivo = true, semEventos = false;
    const S = { V: .6, Vs: .6, nuvem: 0, gA: 0 };
    const molaA = { x: 0, v: 0, w: TAU * 1.1, z: .13 };    // a copa toda (lenta)
    const molaB = { x: 0, v: 0, w: TAU * 3.4, z: .12 };    // o tremer dos tufos (rápida)
    const tufos = TUFOS.map(t => ({ ...t, ph: aleat(0, TAU), ph2: aleat(0, TAU), sA: aleat(.75, 1.2), sB: (Math.random() < .5 ? -1 : 1) * aleat(.6, 1.2), a: 0, dy: 0 }));
    const macas = MACAS.map(([x, y, ti], j) => ({ x, y, ti, j, estado: 'copa', t: 0, ab: 0, abV: 0, ab2: 0 }));
    const baloico = { th: 0, w: 0 };
    const coelho = { olhar: 0, olharAlvo: 0, alvo: null, prox: 2000, pisca: -1, proxPisca: 2500, orelha: 0, orelhaV: 0, salto: 0, nariz: 0, susto: 0 };
    let olharPara = null;                          // ponto [x, y] que o coelho segue (acontecimento ou partícula)

    /* --- envelopes (como no ar): efeitos que se somam e se apagam sozinhos --- */
    const envs = [];
    const E = { vento: 0 };
    function impulso(chave, amp, dur) { envs.push({ chave, amp, dur, t: 0 }); }
    function atualizarEnvs(dt) {
      for (const k in E) E[k] = 0;
      for (let i = envs.length - 1; i >= 0; i--) { const e = envs[i]; e.t += dt; if (e.t >= e.dur) { envs.splice(i, 1); continue; } E[e.chave] += e.amp * sino(e.t / e.dur); }
      E.vento = limita(E.vento, 0, 1.4);
    }
    /* --- brisa: intensidade lenta + rajadas que atravessam o ecrã da esquerda para a direita --- */
    const rajadas = [];
    let proxRajada = aleat(3000, 6000);
    function rajadaEm(x) { let s = 0; for (const r of rajadas) { const d = (x - r.x) / r.larg; s += r.amp * Math.exp(-d * d); } return s; }
    function ventoEm(x) { return S.Vs + Math.min(1.6, rajadaEm(x)); }
    function atualizarVento(dt) {
      const t = tempo / 1000;
      S.V = limita(.55 + .14 * Math.sin(t * .21) + .08 * Math.sin(t * .57 + 1.7) + E.vento, .2, 2.2);
      S.Vs += (S.V - S.Vs) * Math.min(1, dt / 400);
      for (let i = rajadas.length - 1; i >= 0; i--) { const r = rajadas[i]; r.x += r.vel * dt / 1000; if (r.x - r.larg * 2 > 1700) rajadas.splice(i, 1); }
      proxRajada -= dt;
      if (proxRajada <= 0) { proxRajada = aleat(5000, 11000); rajadas.push({ x: -300, vel: aleat(380, 520), amp: aleat(.25, .45), larg: aleat(200, 300) }); }
    }
    /* --- molas (integradas em passos pequenos: o mesmo movimento a 30 ou 60 fps) --- */
    function atualizarMola(m, dt) {
      const k = Math.max(1, Math.ceil(dt / 8)), h = dt / 1000 / k;
      for (let i = 0; i < k; i++) { m.v += (-m.w * m.w * m.x - 2 * m.z * m.w * m.v) * h; m.x += m.v * h; }
      m.x = limita(m.x, -10, 10); m.v = limita(m.v, -140, 140);
    }
    function abanao(a, b) { molaA.v += a * calma; molaB.v += b * calma; }

    /* --- a copa: transformação de cada tufo e posição no mundo de um ponto preso a um tufo --- */
    function atualizarCopa(t) {
      const W0 = ventoEm(AX);
      S.gA = calma * ((W0 - .55) * 1.2 + .5 * Math.sin(t * .9) * (.5 + W0)) + molaA.x * .4;
      for (const f of tufos) {
        const W = ventoEm(f.x);
        const osc = Math.sin(t * 1.25 + f.ph) * .75 + Math.sin(t * 2.9 + f.ph2) * .3 + .25 * Math.sin(t * 5.3 + f.ph * 2);
        f.a = calma * (W * (.7 + 2.2 * f.h) + osc * (.6 + 2.4 * f.h) * (.4 + .7 * W)) + molaA.x * (.3 + f.h) * f.sA + molaB.x * f.sB * (.4 + f.h);
        f.dy = 1.4 * Math.sin(t * 1.7 + f.ph) * f.h * calma;
        poe(R.tufos[f.i], `rotate(${n3(S.gA)},${FORQ[0]},${FORQ[1]}) translate(0,${n(f.dy)}) rotate(${n3(f.a)},${n(f.px)},${n(f.py)})`);
      }
      const gr = `rotate(${n3(S.gA)},${FORQ[0]},${FORQ[1]})`;
      poe(R.copaG, gr); poe(R.ramos, gr); poe(R.ninho, gr);
    }
    function noMundo(ti, x, y) {
      const f = tufos[ti];
      const [x1, y1] = roda(x, y, f.a, f.px, f.py);
      return roda(x1, y1 + f.dy, S.gA, FORQ[0], FORQ[1]);
    }
    const ninhoNoMundo = (dx, dy) => roda(NINHO.x + dx, NINHO.y + dy, S.gA, FORQ[0], FORQ[1]);

    /* --- maçãs na copa: abanar (mola no pé), cair e voltar a crescer --- */
    function atualizarMacas(dt) {
      const s = dt / 1000;
      for (const m of macas) {
        const el = R.macas[m.j];
        if (m.estado === 'caiu') {
          m.t += dt;
          if (m.t > 5000) { m.estado = 'cresce'; m.t = 0; }
          atr(el.g, 'opacity', 0);
          continue;
        }
        if (m.estado === 'cresce') {                 // volta a aparecer devagar, a crescer no pé
          m.t += dt;
          const u = Math.min(1, m.t / 3500);
          atr(el.g, 'opacity', n3(u));
          poe(el.in, `rotate(${n(m.ab)},3,-21) translate(3,-21) scale(${n3(.4 + .6 * suave(u))}) translate(-3,21)`);
          if (u >= 1) m.estado = 'copa';
          continue;
        }
        // abanar: mola no pé da maçã, empurrada pelo tremer da copa
        m.abV += (-60 * m.ab - 5 * m.abV + molaB.v * .6) * s;
        m.ab += m.abV * s;
        m.ab = limita(m.ab, -35, 35);
        atr(el.g, 'opacity', 1);
        const ab = m.ab + m.ab2;
        poe(el.in, Math.abs(ab) < .05 ? '' : `rotate(${n(ab)},3,-21)`);
      }
    }
    // maçãs que podem cair (as da frente e dos lados, que se veem bem)
    const QUEDA = macas.filter(m => m.ti >= 12 && m.ti !== 14 && m.ti !== 15 && m.ti !== 16);
    const caidas = R.caidas.map(el => ({ el, uso: false, x: 0, y: 0, vx: 0, vy: 0, chao: 800, rot: 0, fase: 'cai', idade: 0, sai: 0 }));
    let ultimaQueda = -1e9;
    function deixarCair(m) {
      m = m || escolhe(QUEDA.filter(q => q.estado === 'copa'));
      if (!m || m.estado !== 'copa' || tempo - ultimaQueda < 350) return null;
      let livre = caidas.find(c => !c.uso);
      const noChao = caidas.filter(c => c.uso && c.sai === 0);
      if (noChao.length >= 3) noChao.sort((a, b) => a.idade - b.idade).reverse()[0].sai = 1e-3;   // a mais antiga desaparece
      if (!livre) return null;
      const [x, y] = noMundo(m.ti, m.x, m.y);
      m.estado = 'caiu'; m.t = 0; ultimaQueda = tempo;
      const lado = x < AX ? -1 : 1;
      Object.assign(livre, { uso: true, x, y, vx: lado * aleat(30, 90), vy: -aleat(40, 90), chao: aleat(770, 794), rot: m.ab, fase: 'cai', idade: 0, sai: 0, quiques: 0, mi: m.j % 3 });
      atr(livre.el.g, 'display', 'inline'); atr(livre.el.g, 'opacity', 1);
      olharPara = livre;
      return livre;
    }
    function atualizarCaidas(dt) {
      const s = dt / 1000;
      for (const c of caidas) {
        if (!c.uso) continue;
        c.idade += dt;
        if (c.fase === 'cai') {
          c.vy += 1500 * s; c.x += c.vx * s; c.y += c.vy * s; c.rot += c.vx * s * 2;
          if (c.y >= c.chao) {
            c.y = c.chao; c.quiques++;
            if (Math.abs(c.vy) > 160 && c.quiques < 3) { c.vy = -Math.abs(c.vy) * .32; c.vx *= .9; abanaErva(c.x); }
            else { c.vy = 0; c.fase = 'rola'; c.vx = c.vx * 1.4 + (c.vx < 0 ? -50 : 50); }
          }
        } else if (c.fase === 'rola') {
          c.vx *= Math.exp(-s * 1.8);
          c.x += c.vx * s; c.rot += c.vx * s / 16 / RAD;
          if (c.x < 470 || c.x > 1150) c.vx *= -.4;
          c.x = limita(c.x, 470, 1150);
          if (Math.abs(c.vx) < 4) { c.fase = 'parada'; if (olharPara === c) olharPara = null; }
        }
        if (c.sai > 0) {
          c.sai += dt / 700;
          atr(c.el.g, 'opacity', n3(Math.max(0, 1 - c.sai)));
          if (c.sai >= 1) { c.uso = false; atr(c.el.g, 'display', 'none'); if (olharPara === c) olharPara = null; continue; }
        }
        const alt = c.chao - c.y;
        poe(c.el.sombra, `translate(0,${n(alt + 14)}) scale(${n3(Math.max(.3, 1 - alt / 300))})`);
        poe(c.el.maca, `rotate(${n(c.rot)})`);
        poe(c.el.g, `translate(${n(c.x)},${n(c.y - 14)})`);
      }
    }

    /* --- folhas soltas: caem a baloiçar (pêndulo), pousam na erva e apagam-se --- */
    const folhas = R.folhas.map(el => ({ el, uso: false }));
    function soltarFolha(x, y, grande) {
      let f = folhas.find(v => !v.uso);
      if (!f) { f = folhas.reduce((a, b) => a.t > b.t ? a : b); }
      Object.assign(f, { uso: true, x0: x, x, y, t: 0, vy: grande ? aleat(48, 60) : aleat(70, 110), A: grande ? aleat(46, 60) : aleat(18, 36), w: grande ? aleat(1.6, 2) : aleat(2.4, 3.6),
        ph: aleat(0, TAU), deriva: 0, chao: aleat(785, 830), pousada: 0, k: grande ? 2.3 : aleat(1.25, 1.65), rot0: aleat(-30, 30), espera: 0 });
      atr(f.el, 'display', 'inline'); atr(f.el, 'opacity', 1);
      return f;
    }
    function soltarDaCopa(k, grande) {
      for (let i = 0; i < k; i++) {
        const t = escolhe(tufos.filter(v => v.cam > 0 && v.y > 300));
        const a = aleat(.2, PI - .2), [x, y] = noMundo(t.i, t.x + Math.cos(a) * t.r * .7, t.y + Math.sin(a) * t.r * .5);
        const f = soltarFolha(x, y, grande);
        f.espera = grande ? 0 : i * aleat(20, 80);
      }
    }
    function atualizarFolhas(dt) {
      const s = dt / 1000;
      for (const f of folhas) {
        if (!f.uso || f.pausa) continue;
        if (f.espera > 0) { f.espera -= dt; atr(f.el, 'opacity', 0); continue; }
        f.t += dt;
        const T = f.t / 1000;
        let rot, sx;
        if (!f.pousada) {
          f.deriva += (ventoEm(f.x) * 34 + 6) * s * calma;
          const osc = Math.sin(f.w * T + f.ph);
          f.x = f.x0 + f.deriva + f.A * osc;
          f.y += f.vy * s * (.65 + .55 * Math.abs(Math.cos(f.w * T + f.ph)));     // no fundo do arco cai mais depressa
          rot = f.rot0 + 38 * Math.cos(f.w * T + f.ph);
          sx = Math.cos(f.w * T * .5 + f.ph);
          sx = (sx < 0 ? -1 : 1) * Math.max(.3, Math.abs(sx));
          if (f.y >= f.chao) { f.pousada = 1; f.rotP = rot * .3; f.sxP = sx; }
          atr(f.el, 'opacity', n3(Math.min(1, f.t / 150)));
        } else {
          f.pousada += dt;
          rot = f.rotP; sx = f.sxP;
          const u = (f.pousada - 1800) / 700;
          atr(f.el, 'opacity', n3(limita(1 - u, 0, 1)));
          if (u >= 1) { f.uso = false; atr(f.el, 'display', 'none'); if (olharPara === f) olharPara = null; continue; }
        }
        poe(f.el, `translate(${n(f.x)},${n(f.y)}) rotate(${n(rot)}) scale(${n3(f.k * sx)},${n3(f.k * (f.pousada ? .55 : 1))})`);
      }
    }

    /* --- baloiço: pêndulo com atrito, empurrado pela brisa (ressonância) e pelos toques --- */
    function atualizarBaloico(dt) {
      const k = Math.max(1, Math.ceil(dt / 8)), h = dt / 1000 / k, w0 = 2.55;
      const W = ventoEm(BALOICO.x), t = tempo / 1000;
      for (let i = 0; i < k; i++) {
        const forca = calma * (.018 + .03 * W) * Math.sin(w0 * t) + .06 * Math.min(1.5, rajadaEm(BALOICO.x)) * calma;
        baloico.w += (-w0 * w0 * Math.sin(baloico.th) - .22 * baloico.w + forca) * h;
        baloico.th += baloico.w * h;
      }
      baloico.th = limita(baloico.th, -.75, .75);
      poe(R.baloico, `translate(${BALOICO.x},${BALOICO.y}) rotate(${n3(-baloico.th / RAD)})`);
      const sx = BALOICO.x - Math.sin(-baloico.th) * BALOICO.L * 1.0;
      poe(R.sombraBal, `translate(${n(BALOICO.x + Math.sin(baloico.th) * BALOICO.L)},774) scale(${n3(1 - .25 * Math.abs(Math.sin(baloico.th)))},1)`);
      return sx;
    }

    /* --- pássaros: pose (pousado, a voar), bater de asas e cabeça --- */
    function poseAve(a, o) {   // o = { x, y, sx, voo (0–1), asa (fase), inc, cab, bico }
      atr(a.g, 'display', o.vis === false ? 'none' : 'inline');
      if (o.vis === false) return;
      poe(a.g, `translate(${n(o.x)},${n(o.y)}) rotate(${n(o.inc || 0)}) scale(${n3(o.sx * (o.k || 1))},${n3(o.k || 1)})`);
      const v = o.voo || 0;
      if (v > .05) {
        const b = Math.sin(o.asa || 0);
        atr(a.asaL, 'opacity', n3(Math.min(1, v * 1.5)));
        poe(a.asaL, `rotate(${n(-10 + 55 * b)},-4,-13)`);
        poe(a.asa, `rotate(${n(-30 * b * v)},-2,-13)`);
        atr(a.pernas, 'opacity', n3(1 - v));
      } else { atr(a.asaL, 'opacity', 0); poe(a.asa, ''); atr(a.pernas, 'opacity', 1); }
      poe(a.cab, `rotate(${n(o.cab || 0)},6,-14)`);
      poe(a.bico, o.bico ? `rotate(${n(o.bico)},14,-19)` : '');
    }
    const POUSO_MAE = [24, -6], POUSO_PAI = [528, 566];
    const mae = { voa: false, x: 0, y: 0, sx: -1, cab: 0, bico: 0, inc: 0, voo: 0, asa: 0 };
    const pai = { voa: false, x: POUSO_PAI[0], y: POUSO_PAI[1], sx: 1, cab: 0, bico: 0, inc: 0, voo: 0, asa: 0 };
    const pintos = [0, 1, 2].map(i => ({ alt: 0, alvo: 0, bico: 0, x: (i - 1) * 13 }));
    let piar = 0;                                  // pintos a piar (0–1)
    function atualizarAves(dt, t) {
      // mãe pousada na borda do ninho (segue a copa) a olhar à volta
      if (!mae.voa) {
        const [x, y] = ninhoNoMundo(POUSO_MAE[0] * NINHO.k, POUSO_MAE[1] * NINHO.k);
        mae.x = x; mae.y = y; mae.voo = Math.max(0, mae.voo - dt / 200);
        mae.cab = 8 * Math.sin(t * .7) + (Math.sin(t * .33) > .85 ? -18 : 0);
      }
      if (!pai.voa) { pai.voo = Math.max(0, pai.voo - dt / 200); pai.cab = 10 * Math.sin(t * .5 + 1) + (Math.sin(t * 1.9) > .97 ? 20 : 0); }
      poseAve(R.mae, { ...mae, k: 1.5 });
      poseAve(R.pai, { ...pai, k: 1.5 });
      // pintos: sobem para espreitar e abrem os bicos quando piam
      pintos.forEach((p, i) => {
        p.alt += (p.alvo - p.alt) * (1 - Math.exp(-dt / 120));
        const ab = piar > 0 ? Math.max(0, Math.sin(t * 16 + i * 2.1)) * piar : 0;
        poe(R.pintos[i].g, `translate(${p.x},${n(6 - 12 * p.alt + (piar > 0 ? -1.5 * ab : 0))}) rotate(${n(6 * Math.sin(t * 2 + i * 2) * p.alt)})`);
        poe(R.pintos[i].bico, `translate(0,1) rotate(${n(ab * 30 * (i % 2 ? 1 : -1) * 0)}) scale(1,${n3(.35 + .9 * ab)}) translate(0,-1)`);
      });
    }

    /* --- coelho: respira, pisca, mexe o nariz e as orelhas, segue com os olhos o que acontece --- */
    function atualizarCoelho(dt, t) {
      const c = coelho, s = dt / 1000;
      let alvoX = null, alvoY = null;
      if (olharPara) { alvoX = olharPara.x; alvoY = olharPara.y; }
      if (alvoX == null) {
        c.prox -= dt;
        if (c.prox <= 0) { c.prox = aleat(2200, 5000); c.olharAlvo = escolhe([[800, 420], [592, 700], [1000, 400], [300, 300], [600, 760], [900, 260]]); }
        if (Array.isArray(c.olharAlvo)) { alvoX = c.olharAlvo[0]; alvoY = c.olharAlvo[1]; }
      }
      const cx = 412, cy = 720;
      let ang = alvoX == null ? 0 : Math.atan2(alvoY - cy, Math.max(30, alvoX - cx)) / RAD;   // para cima = negativo
      ang = limita(ang, -40, 18);
      c.olhar += (ang - c.olhar) * (1 - Math.exp(-dt / 180));
      c.susto = Math.max(0, c.susto - dt / 900);
      // orelhas: mola que se endireita quando o coelho se assusta e treme de vez em quando
      c.orelhaV += (-90 * c.orelha - 7 * c.orelhaV) * s;
      c.orelha += c.orelhaV * s;
      if (Math.random() < dt / 3500) c.orelhaV += aleat(-60, 60);
      c.proxPisca -= dt;
      if (c.proxPisca <= 0) { c.proxPisca = aleat(2000, 6000); c.pisca = 0; if (Math.random() < .25) c.proxPisca = 300; }
      let fecha = 0;
      if (c.pisca >= 0) { c.pisca += dt; fecha = sino(c.pisca / 180); if (c.pisca >= 180) c.pisca = -1; }
      if (c.susto > .4) fecha = 0;
      c.salto = Math.max(0, c.salto - dt / 450);
      const salto = -16 * sino(1 - c.salto) * (c.salto > 0 ? 1 : 0);
      const resp = 1 + .025 * Math.sin(t * 3.4);
      poe(R.coelho, `translate(392,${n(778 + salto * 1.12)}) scale(1.12)`);
      poe(R.cbCorpo, `translate(0,0) scale(${n3(1 + (resp - 1) * .5)},${n3(resp)})`);
      poe(R.cbCabeca, `translate(0,${n(-1.2 * Math.sin(t * 3.4))}) rotate(${n(c.olhar * .45)},12,-44)`);
      const olx = limita(c.olhar * .02, -.8, .6) + .6, oly = limita(c.olhar * .05, -1.4, 1);
      poe(R.cbOlho, `translate(${n(olx)},${n(oly)}) translate(25.6,-55) scale(${n3(1 + .2 * c.susto)}) translate(-25.6,55)`);
      poe(R.cbPalp, `translate(0,-60.4) scale(1,${n3(Math.max(.001, fecha))}) translate(0,60.4)`);
      const er = -14 * c.susto;
      poe(R.cbOrelhas[0], `rotate(${n(c.orelha + er + 3 * Math.sin(t * 1.1))},15,-62)`);
      poe(R.cbOrelhas[1], `rotate(${n(c.orelha * .7 + er * .8 + 3 * Math.sin(t * 1.3 + 1))},8,-62)`);
      c.nariz = Math.sin(t * 18) * (Math.sin(t * .8) > .3 ? 1 : 0);
      poe(R.cbNariz, `translate(0,${n(.6 * c.nariz)})`);
    }
    function coelhoNota(forte) { coelho.susto = forte ? 1 : .7; coelho.orelhaV -= forte ? 140 : 80; if (forte) coelho.salto = 1; }

    /* --- cenário vivo: nuvens, aves ao longe, ovelhas, erva, flores, manchas de luz, ciscos --- */
    const ciscos = R.ciscos.map((el, i) => ({ el, x: aleat(200, 1400), y: aleat(150, 700), ph: aleat(0, TAU), v: aleat(6, 14) }));
    const erva = { faixas: [0, 0, 0], ervas: [0, 0, 0] };
    function abanaErva(x) { /* a maçã a bater na erva: um pequeno sopro local */ rajadas.push({ x: x - 40, vel: 120, amp: .12, larg: 60 }); }
    function animarCena(dt, t) {
      const s = dt / 1000;
      S.nuvem += s * (6 + 8 * S.Vs) * calma;
      R.nuvens.forEach((g, i) => {
        const y = [110, 190, 74, 250][i], x0 = [260, 880, 1340, 560][i], v = [1, .7, 1.2, .55][i];
        poe(g, `translate(${n(-280 + ((x0 + 280 + S.nuvem * v) % 2160))},${y})`);
      });
      R.avesLonge.forEach((el, i) => {
        const a = t * (.09 + i * .03) * calma + i * 2.4;
        const x = [380, 1260][i] + Math.cos(a) * [140, 120][i], y = [250, 200][i] + Math.sin(a * 1.6) * 24;
        poe(el, `translate(${n(x)},${n(y)}) scale(${n3(.8 + .1 * i)},${n3(.7 + .35 * Math.sin(t * (Math.sin(t * .6 + i) > .7 ? 12 : 1.2) + i))})`);
      });
      R.ovelhas.forEach((o, i) => {
        const [x, y, sx] = OVELHAS[i];
        const anda = i === 2 || i === 4 ? 14 * Math.sin(t * .06 + i) : 0;
        const pasta = Math.sin(t * (.4 + i * .07) + i * 1.7) > -.3;
        poe(o.g, `translate(${n(x + anda)},${y}) scale(${sx},1)`);
        poe(o.cab, `translate(0,${pasta ? n(3 + .6 * Math.sin(t * 6 + i)) : 0})`);
      });
      R.faixas.forEach((g, i) => {
        const yb = [650, 720, 806][i], W = ventoEm(300 + 500 * i);
        poe(g, `translate(0,${yb}) skewX(${n3((-3 * W - 2 * Math.sin(t * 1.4 - i * .8) * W) * calma)}) translate(0,${-yb})`);
      });
      R.ervas.forEach((g, i) => {
        const W = ventoEm([260, 800, 1340][i]);
        poe(g, `translate(0,906) skewX(${n3((-5 * W - 3.5 * Math.sin(t * 1.7 - i * 1.1) * W) * calma)}) translate(0,-906)`);
      });
      R.flores.forEach((g, i) => {
        const W = ventoEm(FLORES[i][0]);
        poe(g, `rotate(${n3((5 * W + 4 * Math.sin(t * 1.6 + i * 1.3) * (.4 + W)) * calma)})`);
      });
      // sombra da copa e manchas de luz acompanham o baloiçar
      const desl = S.gA * 4;
      poe(R.sombraArv, `translate(${n(desl)},0)`);
      R.manchas.forEach((el, i) => {
        const bx = 600 + i * 78 + (i % 2) * 20, by = 784 + (i % 3) * 9;
        const tf = tufos[17 + (i % 5)];
        poe(el, `translate(${n(bx + desl * 1.4 + tf.a * 3)},${n(by)}) scale(${n3(.8 + .25 * Math.sin(t * 1.3 + i))},1)`);
        atr(el, 'opacity', n3(.55 + .4 * Math.sin(t * .9 + i * 2 + tf.a * .3)));
      });
      // ciscos de luz a flutuar no ar quente
      ciscos.forEach((c, i) => {
        c.y -= c.v * s * calma; c.x += (ventoEm(c.x) * 14) * s * calma;
        if (c.y < 120 || c.x > 1500) { c.y = aleat(560, 760); c.x = aleat(150, 1300); }
        const b = .5 + .5 * Math.sin(t * 1.6 + c.ph);
        poe(c.el, `translate(${n(c.x + 12 * Math.sin(t * .7 + c.ph))},${n(c.y)}) scale(${n3(.5 + .5 * b)})`);
        atr(c.el, 'opacity', n3(.25 + .6 * b));
      });
    }

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

    /* --- variações ociosas --- */
    let folhaPresa = null;
    function* varFolha() {                         // uma folha grande solta-se de um tufo da frente e cai a baloiçar
      const t = escolhe(tufos.filter(v => v.cam === 2 || v.i === 12 || v.i === 13));
      const lx = t.x + aleat(-.4, .4) * t.r, ly = t.y + t.r * .55;
      const f = soltarFolha(0, 0, true);
      f.pausa = true; folhaPresa = f;
      // treme presa ao tufo antes de se soltar
      yield* durante(700, (u, tt) => {
        const [x, y] = noMundo(t.i, lx, ly);
        f.x0 = x; f.x = x; f.y = y; f.t = 0; f.deriva = 0;
        poe(f.el, `translate(${n(x)},${n(y)}) rotate(${n(20 + 14 * Math.sin(tt * .04) * u)}) scale(${f.k})`);
      });
      f.ph = -PI / 2; f.pausa = false; folhaPresa = null;
      olharPara = f;
      yield* espera(4500);
      if (olharPara === f) olharPara = null;
    }
    const esq = { naCopa: false, x: 0, y: 0, ang: 180, flip: true, dist: 0 };
    const CAMINHO_ESQ = [[1680, 790], [1300, 788], [1000, 786], [870, 782], [838, 760], [826, 700], [812, 640], [796, 590], [760, 540], [722, 498], [704, 470]];
    function poseEsquilo(x, y, ang, corre, op) {
      const c = Math.cos(ang * RAD);
      if (c < -.3) esq.flip = true; else if (c > .3) esq.flip = false;
      const p = esq.dist / 46;                        // fase do salto (um salto a cada 46 px)
      const b = Math.sin(p * TAU);
      poe(R.esquilo, `translate(${n(x)},${n(y)}) rotate(${n(ang)}) scale(1.3,${esq.flip ? -1.3 : 1.3})`);
      poe(R.eqIn, `translate(0,${n(-3 * Math.abs(Math.sin(p * PI)) * corre)}) scale(${n3(1 + .1 * b * corre)},${n3(1 - .07 * b * corre)})`);
      poe(R.eqPatas[0], `rotate(${n(30 * b * corre)},12,-8)`);
      poe(R.eqPatas[1], `rotate(${n(-30 * b * corre)},-8,-8)`);
      poe(R.eqCauda, `rotate(${n(8 * Math.sin(p * TAU + 1) * corre + 4 * Math.sin(tempo * .004))},-14,-10)`);
      atr(R.esquilo, 'opacity', n3(op));
    }
    function* percorrer(pts, vel) {               // o esquilo vai por um caminho com saltos (distância → fase das patas)
      let L = 0; const seg = [];
      for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
      const dur = L / vel * 1000;
      let px = pts[0][0], py = pts[0][1], ang = esq.ang;
      yield* durante(dur, u => {
        const [x, y] = catmull(pts, u);
        const vx = x - px, vy = y - py;
        if (Math.hypot(vx, vy) > .3) {
          let alvo = Math.atan2(vy, vx) / RAD;
          while (alvo - ang > 180) alvo -= 360; while (alvo - ang < -180) alvo += 360;
          ang += (alvo - ang) * .35;
        }
        esq.dist += Math.hypot(vx, vy); px = x; py = y; esq.ang = ang; esq.x = x; esq.y = y;
        olharPara = esq;
        poseEsquilo(x, y, ang, 1, 1);
      });
    }
    function* varEsquilo() {                       // o esquilo vem a correr pela erva, sobe o tronco e some-se na copa (ou o contrário)
      atr(R.esquilo, 'display', 'inline');
      if (!esq.naCopa) {
        esq.ang = 180; esq.flip = true;
        yield* percorrer(CAMINHO_ESQ.slice(0, 4), 380);
        yield* durante(420, () => poseEsquilo(esq.x, esq.y, esq.ang, 0, 1));          // pára ao pé do tronco
        yield* percorrer(CAMINHO_ESQ.slice(3), 240);
        esq.naCopa = true;
      } else {
        esq.ang = 60;
        yield* percorrer(CAMINHO_ESQ.slice(3).reverse(), 240);
        yield* durante(380, () => poseEsquilo(esq.x, esq.y, esq.ang, 0, 1));
        yield* percorrer(CAMINHO_ESQ.slice(0, 4).reverse(), 420);
        esq.naCopa = false;
      }
      atr(R.esquilo, 'display', 'none');
      if (olharPara === esq) olharPara = null;
    }
    function limparEsquilo() { atr(R.esquilo, 'display', 'none'); if (olharPara === esq) olharPara = null; }
    function* varNinho() {                         // os passarinhos espreitam do ninho e piam; a mãe baixa a cabeça para eles
      if (mae.voa) return;
      pintos.forEach((p, i) => { p.alvo = .6 + .4 * Math.random(); });
      olharPara = { x: NINHO.x, y: NINHO.y };
      yield* espera(350);
      piar = 1;
      yield* durante(1600, u => { mae.sx = -1; mae.bico = 0; });
      piar = 0;
      yield* durante(700, u => { mae.cab = -40 * sino(u); });
      pintos.forEach(p => { p.alvo = 0; });
      olharPara = null;
      yield* espera(500);
    }
    function* varBrisa() {                         // uma brisa mais forte agita a copa e o baloiço
      rajadas.push({ x: -350, vel: 560, amp: .9, larg: 300 });
      impulso('vento', .45, 3600);
      yield* espera(1300);
      soltarDaCopa(3, false);
      yield* espera(1200);
      soltarDaCopa(2, false);
      yield* espera(1500);
    }
    function* varMaca() {                          // uma maçã abana no pé
      const m = escolhe(macas.filter(v => v.estado === 'copa' && v.ti >= 12));
      if (!m) return;
      olharPara = { x: m.x, y: m.y };
      yield* durante(1800, (u, tt) => { m.ab2 = 16 * Math.sin(tt * .011) * Math.pow(1 - u, 1.3) * Math.min(1, tt / 150); });
      m.ab2 = 0;
      olharPara = null;
      yield* espera(400);
    }
    const VARIACOES = { folha: varFolha, esquilo: varEsquilo, ninho: varNinho, brisa: varBrisa, maca: varMaca };
    const vari = { prox: aleat(2500, 4000), ultima: null, ligado: true };
    function iniciarVariacao(nome) {
      const g = VARIACOES[nome]();
      if (nome === 'esquilo') g.limpar = limparEsquilo;
      if (nome === 'ninho') g.limpar = () => { piar = 0; pintos.forEach(p => { p.alvo = 0; }); };
      if (nome === 'maca') g.limpar = () => { macas.forEach(m => { m.ab2 = 0; }); };
      if (nome === 'folha') g.limpar = () => { if (folhaPresa) { folhaPresa.pausa = false; folhaPresa = null; } };
      vari.ultima = nome;
      lancar('variacao', g, () => { vari.prox = aleat(4000, 9000); });
    }
    function atualizarVariacoes(dt) {
      if (!vari.ligado || faixas.has('variacao')) return;
      vari.prox -= dt;
      if (vari.prox > 0) return;
      let lista = Object.keys(VARIACOES).filter(v => v !== vari.ultima);
      if (faixas.has('aves')) lista = lista.filter(v => v !== 'ninho');
      if (faixas.has('evento')) lista = lista.filter(v => v !== 'esquilo');
      iniciarVariacao(escolhe(lista));
    }

    /* --- reações ao toque (visíveis em 100 ms, 1–2 s, alternadas) --- */
    function* reAbanar() {                         // a árvore abana toda, caem folhas e uma maçã cai e rola na erva
      abanao(escolhe([-1, 1]) * 62, 120);
      baloico.w += .25 * (baloico.w >= 0 ? 1 : -1);
      soltarDaCopa(7, false);
      coelhoNota(false);
      yield* espera(220);
      deixarCair();
      yield* espera(1300);
    }
    function* reBaloico() {                        // o baloiço dá um grande impulso
      const s = baloico.w >= 0 ? 1 : -1;
      baloico.w = limita(baloico.w + s * 1.5, -2.2, 2.2);
      abanao(s * 12, 36);
      soltarDaCopa(2, false);
      olharPara = { x: BALOICO.x, y: BALOICO.y + BALOICO.L };
      coelhoNota(false);
      yield* espera(1600);
      if (olharPara && olharPara.x === BALOICO.x) olharPara = null;
    }
    // voo de ida e volta de um pássaro por um caminho (pontos no mundo); fim = função que devolve o pouso
    function* voar(o, pts, dur, fimPouso) {
      o.voa = true;
      let px = pts[0][0];
      yield* durante(dur, (u, tt) => {
        const w = eseno(u);
        const ps = pts.slice(); ps[ps.length - 1] = fimPouso();
        const [x, y] = catmull(ps, w);
        const vx = x - px; px = x;
        if (Math.abs(vx) > .4) o.sx += ((vx > 0 ? 1 : -1) - o.sx) * .25;
        o.x = x; o.y = y; o.voo = Math.min(1, u * 8, (1 - u) * 6); o.asa = tt * .045; o.inc = limita(vx * 1.2, -14, 14);
        o.cab = 0;
      });
      o.voa = false; o.inc = 0;
    }
    function* voarAves() {                         // os pais saem a voar do ninho e do ramo, dão uma volta e voltam
      pintos.forEach(p => { p.alvo = 0; });
      const [mx, my] = ninhoNoMundo(POUSO_MAE[0] * NINHO.k, POUSO_MAE[1] * NINHO.k);
      const pts = [[mx, my], [1080, 330], [1170, 262], [1160, 180], [1090, 196], [1050, 300], [mx, my]];
      const ptsPai = [[pai.x, pai.y], [470, 500], [462, 380], [530, 300], [600, 360], [570, 470], [pai.x, pai.y]];
      const gM = voar(mae, pts, 2600, () => ninhoNoMundo(POUSO_MAE[0] * NINHO.k, POUSO_MAE[1] * NINHO.k));
      const gP = voar(pai, ptsPai, 2400, () => POUSO_PAI);
      let a = false, b = false;
      while (!a || !b) {
        const dt = yield;
        if (!a) a = gM.next(dt).done;
        if (!b) b = gP.next(dt).done;
        olharPara = mae;
      }
      olharPara = null;
      mae.sx = -1; pai.sx = 1;
      pintos.forEach(p => { p.alvo = .8; });
      piar = 1;
      yield* espera(1200);
      piar = 0;
      pintos.forEach(p => { p.alvo = 0; });
    }
    function limparAves() {
      mae.voa = false; pai.voa = false; mae.sx = -1; pai.sx = 1; pai.x = POUSO_PAI[0]; pai.y = POUSO_PAI[1]; mae.inc = pai.inc = 0;
      piar = 0; pintos.forEach(p => { p.alvo = 0; });
    }
    function* rePassaros() {                       // os pássaros saem a voar e voltam (a copa estremece)
      abanao(escolhe([-1, 1]) * 14, 55);
      soltarDaCopa(4, false);
      coelhoNota(true);
      if (!faixas.has('aves')) { const g = voarAves(); g.limpar = limparAves; lancar('aves', g); }
      yield* espera(1200);
    }
    const REACOES = { abanar: reAbanar, baloico: reBaloico, passaros: rePassaros };
    let ultimaReacao = null;
    function reagir(nome) {
      if (!vivo) return;
      if (!nome) {
        let lista = Object.keys(REACOES).filter(r => r !== ultimaReacao);
        if (faixas.has('aves')) lista = lista.filter(r => r !== 'passaros');
        if (!lista.length) lista = ['abanar'];
        nome = escolhe(lista);
      }
      ultimaReacao = nome;
      while (envs.length > 20) envs.shift();
      while (rajadas.length > 6) rajadas.shift();
      lancar('reacao', REACOES[nome]());
    }

    /* --- acontecimentos raros (15–40 s) --- */
    const pp = { x: 0, y: 0 };
    let lascas = [];
    function* evPicaPau() {                        // um pica-pau chega a voar, agarra-se ao tronco e bate com o bico
      atr(R.picapau, 'display', 'inline');
      const P = [736, 676];
      const ida = [[-60, 420], [200, 470], [420, 520], [600, 600], [P[0] - 30, P[1] - 10], P];
      yield* durante(2400, (u, tt) => {
        const [x, y] = catmull(ida, eseno(u));
        pp.x = x; pp.y = y + 8 * Math.sin(u * PI * 6) * (1 - u);
        atr(R.ppAsas, 'opacity', u < .92 ? 1 : 0);
        poe(R.ppAsas, `rotate(${n(40 * Math.sin(tt * .05))},-8,-10)`);
        poe(R.picapau, `translate(${n(pp.x)},${n(pp.y)}) rotate(${n(-20 * (1 - u))})`);
        olharPara = pp;
      });
      for (let r = 0; r < 3; r++) {
        yield* durante(r === 0 ? 500 : 700, u => poe(R.ppCab, `rotate(${n(-8 * sino(u))},-4,-22)`));
        for (let k = 0; k < 6; k++) {
          yield* durante(90, u => poe(R.ppCab, `rotate(${n(16 * sino(u))},-4,-22)`));
          lascas.push({ x: P[0] + 16, y: P[1] - 28, vx: -aleat(60, 160), vy: -aleat(40, 140), t: 0 });
          if (k === 0) coelhoNota(false);
        }
      }
      yield* espera(500);
      const sai = [P, [P[0] - 60, P[1] - 60], [500, 450], [200, 330], [-80, 300]];
      yield* durante(2200, (u, tt) => {
        const [x, y] = catmull(sai, eseno(u));
        atr(R.ppAsas, 'opacity', 1); poe(R.ppAsas, `rotate(${n(40 * Math.sin(tt * .05))},-8,-10)`);
        poe(R.picapau, `translate(${n(x)},${n(y)}) rotate(${n(-25 * Math.min(1, u * 4))}) scale(-1,1)`);
        pp.x = x; pp.y = y;
      });
      evPicaPau.limpar();
    }
    evPicaPau.limpar = () => { atr(R.picapau, 'display', 'none'); poe(R.ppCab, ''); if (olharPara === pp) olharPara = null; };
    const bb = { x: 0, y: 0 };
    function* evBorboleta() {                      // uma borboleta chega aos ziguezagues e pousa numa maçã
      const m = macas.find(v => v.j === 13 && v.estado === 'copa') || macas.find(v => v.estado === 'copa' && v.ti >= 17);
      if (!m) return;
      atr(R.borboleta, 'display', 'inline');
      const pouso = () => { const [x, y] = noMundo(m.ti, m.x, m.y); return [x, y - 16]; };
      const ida = [[1500, 640], [1300, 560], [1180, 620], [1060, 520], [960, 560], pouso()];
      let ang = 0;
      const asas = k => { R.bbAsas.forEach(g => poe(g, `scale(${n3(k)},1)`)); };
      yield* durante(3600, (u, tt) => {
        ida[ida.length - 1] = pouso();
        const [x, y] = catmull(ida, eseno(u));
        bb.x = x + 10 * Math.sin(tt * .012) * (1 - u); bb.y = y + 8 * Math.sin(tt * .02) * (1 - u);
        ang = -20 + 10 * Math.sin(tt * .01);
        asas(.15 + .85 * Math.abs(Math.cos(tt * .03)));
        poe(R.borboleta, `translate(${n(bb.x)},${n(bb.y)}) rotate(${n(ang * (1 - u))}) scale(.95)`);
        olharPara = bb;
      });
      coelhoNota(false);
      yield* durante(4200, (u, tt) => {                // pousada: abre e fecha as asas devagar
        const [x, y] = pouso(); bb.x = x; bb.y = y;
        asas(.2 + .8 * (.5 + .5 * Math.cos(tt * .004)));
        poe(R.borboleta, `translate(${n(x)},${n(y)}) scale(.95)`);
      });
      const [x0, y0] = pouso();
      const sai = [[x0, y0], [x0 - 80, y0 - 90], [700, 330], [520, 300], [300, 160], [-80, 120]];
      yield* durante(3000, (u, tt) => {
        const [x, y] = catmull(sai, eseno(u));
        bb.x = x + 8 * Math.sin(tt * .014); bb.y = y + 6 * Math.sin(tt * .022);
        asas(.15 + .85 * Math.abs(Math.cos(tt * .03)));
        poe(R.borboleta, `translate(${n(bb.x)},${n(bb.y)}) rotate(${n(-20)}) scale(.95)`);
      });
      evBorboleta.limpar();
    }
    evBorboleta.limpar = () => { atr(R.borboleta, 'display', 'none'); if (olharPara === bb) olharPara = null; };
    // bando de pardais: pousam no alto dos tufos dos lados (fora da zona do nome) e vão-se embora juntos
    const POUSOS = [[12, 482, 318], [10, 520, 196], [17, 520, 390], [13, 1118, 318], [11, 1080, 196]];
    const bando = Array.from({ length: N_BANDO }, () => ({ x: 0, y: 0, sx: -1, voo: 1, asa: 0, inc: 0, cab: 0, bico: 0, vis: false }));
    function* evBando() {
      const ordem = bando.map((b, i) => ({ b, i, p: POUSOS[i], atraso: i * 220 }));
      const chegar = (u, tt, o) => {
        const w = limita((tt - o.atraso) / 2600, 0, 1), e = eseno(w);
        const [px, py] = noMundo(o.p[0], o.p[1], o.p[2] + 2);
        const x0 = 1700 + o.i * 40, y0 = 120 + o.i * 30;
        o.b.x = lerp(x0, px, e); o.b.y = lerp(y0, py, e) - 80 * sino(w) * (1 - w);
        o.b.vis = true; o.b.voo = w < 1 ? Math.min(1, (1 - w) * 6) : 0; o.b.asa = tt * .05 + o.i; o.b.sx = -1; o.b.inc = w < 1 ? -6 : 0;
      };
      yield* durante(2600 + N_BANDO * 220, (u, tt) => { ordem.forEach(o => chegar(u, tt, o)); olharPara = bando[0]; });
      coelhoNota(false);
      yield* durante(5200, (u, tt) => ordem.forEach(o => {      // pousados: saltinhos, viram-se e debicam
        const [px, py] = noMundo(o.p[0], o.p[1], o.p[2] + 2);
        const fase = tt * .001 + o.i * 1.7;
        o.b.x = px; o.b.y = py - 6 * Math.max(0, Math.sin(fase * 3)) * (Math.sin(fase * .9) > .6 ? 1 : 0);
        o.b.sx = Math.sin(fase * .7) > .2 ? 1 : -1; o.b.voo = 0; o.b.cab = Math.sin(fase * 2.3) > .7 ? 30 : 5 * Math.sin(fase * 4);
      }));
      olharPara = bando[0];
      yield* durante(2400, (u, tt) => ordem.forEach(o => {
        const w = limita(u * 1.2 - o.i * .04, 0, 1), e = eseno(w);
        const [px, py] = noMundo(o.p[0], o.p[1], o.p[2] + 2);
        o.b.x = lerp(px, -120 - o.i * 30, e); o.b.y = lerp(py, 90 + o.i * 26, e) - 60 * sino(w);
        o.b.voo = Math.min(1, w * 8); o.b.asa = tt * .05 + o.i; o.b.sx = -1; o.b.cab = 0;
      }));
      evBando.limpar();
    }
    evBando.limpar = () => { bando.forEach(b => { b.vis = false; }); if (bando.includes(olharPara)) olharPara = null; };
    const EVENTOS = { picapau: evPicaPau, borboleta: evBorboleta, bando: evBando };
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
      let lista = Object.keys(EVENTOS).filter(e => e !== eventos.ultimo);
      if (faixas.has('variacao') && vari.ultima === 'esquilo') lista = lista.filter(e => e !== 'picapau');
      iniciarEvento(escolhe(lista));
    }
    function atualizarLascas(dt) {
      const s = dt / 1000;
      let d = '';
      lascas = lascas.filter(l => (l.t += dt) < 700);
      for (const l of lascas) { l.vy += 600 * s; l.x += l.vx * s; l.y += l.vy * s; d += `M${n(l.x)},${n(l.y)}l${n(-l.vx * .02)},${n(-l.vy * .02 + .5)}`; }
      atr(R.lascas, 'd', d || 'M0,0');
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
        atualizarMola(molaA, dt); atualizarMola(molaB, dt);
        for (const nome of Array.from(faixas.keys())) avancar(nome, dt);
        atualizarVariacoes(dt);
        atualizarEventos(dt);
        atualizarCopa(t);
        atualizarMacas(dt);
        atualizarCaidas(dt);
        // folhas soltas de vez em quando (mais com mais vento)
        if (Math.random() < dt / 1000 * (.18 + .5 * Math.max(0, S.Vs - .5)) * calma) soltarDaCopa(1, false);
        atualizarFolhas(dt);
        atualizarBaloico(dt);
        atualizarAves(dt, t);
        bando.forEach((b, i) => poseAve(R.bando[i], { ...b, k: 1.2 }));
        atualizarLascas(dt);
        atualizarCoelho(dt, t);
        animarCena(dt, t);
      } catch (e) { if (!erroMostrado) { erroMostrado = true; console.error(e); } }
    }
    const desligar = relogio.aCada(passo);
    passo(16.7);

    return {
      animal: R.arvore,
      habitat: null,
      reagir() { reagir(); },
      fazerSom() {},                               // os elementos não têm som (só a gravação do nome)
      irAoHabitat: () => Promise.resolve(),
      voltar: () => Promise.resolve(),
      destruir() {
        vivo = false;
        faixas.clear();
        envs.length = 0; rajadas.length = 0;
        try { desligar(); } catch (e) {}
      },
      // só para testes na consola (modo de desenvolvimento)
      _teste: {
        S, molaA, molaB, baloico, macas, esq, tufos,
        variacao: iniciarVariacao, reacao: nome => reagir(nome), evento: iniciarEvento,
        semEventos: (v = true) => { semEventos = v; }, semVariacoes: () => { vari.ligado = false; },
        estado: () => ({ faixas: [...faixas.keys()], folhas: folhas.filter(f => f.uso).length, caidas: caidas.filter(c => c.uso).length,
          macasNaCopa: macas.filter(m => m.estado === 'copa').length, elementos: svg.querySelectorAll('*').length })
      }
    };
  }

  return { icone: iconeSVG(), montar };
})();
