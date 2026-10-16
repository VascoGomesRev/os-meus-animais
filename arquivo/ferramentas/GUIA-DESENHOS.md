# Guia para desenhar animais e habitats (estilo kawaii da app)

Lê isto antes de desenhar. Os 5 desenhos de referência (cão, gato, vaca, pato, peixe) estão em `desenhos.js`; copia o estilo.

## Onde escrever

- Animais do grupo X: `desenhos/X.js` com, exatamente, este formato:
  ```js
  'use strict';
  Object.assign(DESENHOS, {
  nome_do_id: `<g class="corpo">
   …
  </g>`,
  outro_id: `…`
  });
  ```
  Os ids com hífen escrevem-se entre aspas: `'porquinho-da-india': \`…\``.
- Habitats do grupo X: `habitats/X.js`:
  ```js
  'use strict';
  Object.assign(HABITATS, {
  cao: { nome: 'casota', svg: `<g> … </g>` },
  'porquinho-da-india': { nome: 'gaiola', svg: `…` }
  });
  ```
- Os ajudantes `olhos(xEsq, xDir, y, rx=11, ry=13)`, `bochechas(xEsq, xDir, y)` e `sorriso(x, y, cor)` estão definidos em `desenhos.js` e podem ser usados dentro dos template strings: `${olhos(88,132,88)}`.
- **Nunca** edites `desenhos.js`, `animais.js`, `habitats.js`, `index.html` nem ficheiros de outros grupos.

## Regras do desenho do animal

1. `viewBox 0 0 220 220`; o animal ocupa quase toda a área (cabeça grande, entre y≈20 e y≈205), centrado em x=110, de frente ou a três quartos.
2. Tudo dentro de um único `<g class="corpo">` (é o que salta ao tocar). Sem tag `<svg>`, sem `<style>`, sem `<script>`, sem texto, sem imagens externas, sem ids (ids repetem-se entre desenhos).
3. Cabeça grande e redonda (≈55 % da altura), corpo pequeno por baixo, olhos grandes com `olhos()`, bochechas com `bochechas()`, boca com `sorriso()`. Cores lisas e alegres, 3–6 cores por animal, sem gradientes nem filtros. Contorno branco e sombra são feitos pelo CSS da app: não os desenhes.
4. Classes de animação (a app anima-as com CSS): `class="olhos"` (já vem de `olhos()`), `class="cauda"` (abana, origem no canto inferior esquerdo do elemento), `class="cauda-peixe"` (origem à esquerda), `class="orelha"` (origem em cima ao centro), `class="asa"` (bate, origem canto superior esquerdo), `class="bolha"` (só animais aquáticos; círculos sem preenchimento). Usa pelo menos uma destas além dos olhos.
5. Ordem de desenho: cauda e partes de trás primeiro, depois corpo, depois cabeça, depois cara. Patas/pés em baixo, a tocar y≈200.
6. Pares parecidos têm de se distinguir à primeira vista: usa cor e uma característica exagerada (burro: cinzento, orelhas enormes; cavalo: castanho, crina; raposa: laranja, cauda grossa com ponta branca; lobo: cinzento, orelhas pontiagudas; cão: castanho claro, orelhas caídas; leopardo: pintas; tigre: riscas; leão: juba; lince: tufos nas orelhas; coelho: orelhas muito compridas; hamster: bochechas enormes; rato: orelhas redondas e cauda fina).
7. Tamanho: 15–40 elementos SVG por animal. Usa `ellipse`, `circle`, `path` e `rect` com `rx`. Coordenadas inteiras ou com uma casa decimal.

## Regras do habitat

1. `viewBox 0 0 220 220`, a ocupar ~70 % da área, assente em baixo (chão em y≈205). Só o interior, dentro de um `<g>`.
2. É um sítio reconhecível e simpático: casota (cão), cesto/almofada (gato), aquário/castelo (peixe), estábulo (vaca), lago (pato), gaiola (periquito), toca (coelho, raposa), árvore oca (esquilo, coruja), colmeia (abelha), teia (aranha), ninho (aves), gruta (urso), iglu/bloco de gelo (pinguim), rocha (foca), lama (porco), galinheiro (galinha), coral/rocha (peixes), etc. Escolhe o mais clássico para cada animal.
3. `nome` em pt-PT, minúsculas, sem artigo, uma ou duas palavras: `casota`, `cesto`, `aquário`, `estábulo`, `lago`, `gaiola`, `toca`, `árvore`, `colmeia`, `teia`, `ninho`, `gruta`, `iglu`, `rocha`, `lama`, `galinheiro`, `pedra`, `folha`, `flor`, `coral`.
4. Mesmo estilo (cores lisas, formas redondas, 8–25 elementos). Pode ter uma classe `class="balanca"` num elemento pequeno (bandeira, fumo, folha) que a app anima a balançar.

## Como verificar o teu trabalho (obrigatório antes de terminar)

1. Sintaxe: `node --check desenhos/X.js` e `node --check habitats/X.js`.
2. Coerência: `node ferramentas/verificar.js` tem de mostrar 0 erros (avisos de sons em falta são normais).
3. Ver o resultado: `node ferramentas/render.js X` escreve PNGs em `originais/render/<id>.png` e `<id>-habitat.png`. **Abre cada PNG com a ferramenta Read e olha para ele.** Se o animal não se reconhece, está cortado, descentrado, ou as partes estão fora de sítio, corrige e volta a renderizar. Repete até todos ficarem bem. Não termines com desenhos que não viste.
4. No relatório final, lista os ids feitos, o nome do habitat de cada um e o que não ficou bom (se algo ficou).
