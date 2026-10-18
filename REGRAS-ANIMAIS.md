# Regras para criar um animal

Versão 4 — revista depois de cada lote: cão e gato; coelho, sapo e girafa (16-10-2026); coala, macaco, elefante e pato; porco, galo e cavalo; vaca, ovelha e passarinho (17-10-2026); leão, zebra e abelha, e revisão dos 17 anteriores (18-10-2026). Cada animal novo segue estas regras.
Os 200 animais antigos (desenhos, habitats e sons) estão guardados em `arquivo/` e voltam um a um.

**Referências de qualidade** (ler pelo menos uma por inteiro antes de começar):

| Ficheiro | Cenário → habitat | Bom exemplo de |
|---|---|---|
| `animais/cao.js` | rua de Lisboa → casota | esqueleto 2,5D, andar com patas presas ao chão, entrar por uma porta |
| `animais/gato.js` | sala → cesto | salto para dentro de um recipiente, enrolar-se, cauda expressiva |
| `animais/coelho.js` | prado e horta → toca | salto de coelho, orelhas em «fita», mergulhar num buraco e espreitar |
| `animais/sapo.js` | charco → nenúfar | corpo de elipsoides, língua elástica, água que reage (ondas, gotas) |
| `animais/girafa.js` | savana → acácia | animal alto, pescoço segmentado com padrão contínuo, andar a passo travado, comer da árvore |
| `animais/raposa.js` | bosque de outono → toca no carvalho | cabeça de elipsoides, orelhas que rodam, cauda enorme, salto de caça ao rato |
| `animais/peixe.js` | recife de coral → anémona | nadar com onda do corpo, barbatanas 3D, tentáculos que envolvem o animal |
| `animais/coala.js` | eucaliptal → forquilha | trepar um tronco com patas presas, ficar abraçado entre camadas |
| `animais/macaco.js` | selva → ramo alto | balançar numa liana, mãos presas ao mundo, pendurar pela cauda |
| `animais/elefante.js` | savana de manhã → poço | tromba de 12 segmentos, orelhas que abanam, banho com esguicho |
| `animais/pato.js` | quinta com lago → lago | andar bamboleante, boiar com véu de água, «rabo para o ar» |
| `animais/porco.js` | pátio de quinta → poça de lama | rebolar um elipsoide, manchas de lama que secam |
| `animais/galo.js` | quintal minhoto ao amanhecer → poleiro | passo de galo com a cabeça parada no mundo, esvoaçar, poleiro com mola |
| `animais/cavalo.js` | Alentejo → cavalariça | trote diagonal, entrar de frente por uma porta, cabeça por cima da meia-porta |
| `animais/vaca.js` | lameiro de montanha → curral de granito | malhas recortadas, chocalho e úbere com mola, deitar-se em dois tempos |
| `animais/ovelha.js` | serra da Estrela → redil de pedra | lã em bolas com pouco peso, cancela com chocalho, balido trémulo |
| `animais/passarinho.js` | jardim com cerejeira → ninho | voo com bater de asas, bico que toca na semente, banho de pássaros |
| `animais/leao.js` | savana ao fim da tarde → abrigo nas rochas | juba de madeixas em anéis 3D com mola, borboleta no nariz (vesgo e espirro) |
| `animais/zebra.js` | planície com o Kilimanjaro → pó debaixo da Kigelia | riscas presas ao perfil 2,5D, rebolar de patas no ar, búfago no dorso |
| `animais/abelha.js` | encosta alentejana em flor → cortiço | animal que paira, asas rápidas sem filtros, pólen nas patas, entrar de costas num buraco de frente |

Custo de referência: 40–65 minutos de um agente Opus por animal; ficheiros de 105–135 KB. O peixe tem ~920 elementos SVG e 37 tentáculos atualizados a cada quadro: é o mais pesado; confirmar no telemóvel.

---

## 1. O que é um animal na app

Cada animal é **um ficheiro só**: `animais/<id>.js`. Esse ficheiro desenha e anima tudo o que se vê:

| Parte | O que é | Exemplo (cão) |
|---|---|---|
| Cenário | Fundo completo, a ecrã inteiro, com vida própria | Rua: passeio, casas, candeeiro, árvore, nuvens |
| Animal | Personagem articulado (cabeça, orelhas, patas, cauda… mexem-se em separado) | Cão |
| Habitat | O sítio do animal, **parte do cenário** (não é um autocolante por cima) | Casota no jardim |

O resto da app (nome escrito, voz, som, setas, menu, favoritos, área dos pais) é do motor, `app.js`. **Um módulo nunca mexe em `app.js`, `index.html`, `animais.js` nem nos módulos dos outros animais.**

Para pôr um animal novo na app:
1. Acrescentar a linha em `animais.js` → `ANIMAIS` (`id`, `nome`, `grupo: 'animais'`, `som`). Por agora só há o grupo «Animais»; mais tarde virão coisas, elementos, números…
2. Criar `animais/<id>.js` seguindo estas regras.
3. Acrescentar `<script src="animais/<id>.js"></script>` no `index.html`, antes de `app.js`.
4. Voz e som: gravados pela família (ver §10). O habitat **não tem nome** escrito nem dito.
5. `node ferramentas/gerar-sw.js` e depois `node ferramentas/verificar.js` → tem de dar 0 erros.

---

## 2. Contrato do módulo (o que o motor espera)

```js
'use strict';
MODULOS.cao = {
  icone: `…`,              // interior de um SVG 220×220 (sem a tag <svg>), parado: é o cartão do menu
  montar(raiz, ajudas) {   // raiz = <div> vazio a ecrã inteiro; ajudas = { relogio, reduzido }
    // cria o <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"> e põe-no em raiz
    return {
      animal,              // elemento SVG do animal (zona de toque)
      habitat,             // elemento SVG do habitat (zona de toque)
      reagir() {},         // a criança tocou no animal: reação alegre (o motor diz o nome ao mesmo tempo)
      fazerSom(ms, silabas) {}, // o som começou agora e dura ms; silabas = [[início s, duração s], …] (null se o som veio dos pais)
      irAoHabitat() {},    // devolve Promise: resolve quando o animal está instalado no habitat
      voltar() {},         // devolve Promise: resolve quando o animal voltou ao sítio e à animação normal
      destruir() {}        // desliga o relógio e tudo o que o módulo criou
    };
  }
};
```

O que o motor faz com isto:

| A criança… | Estado | O motor chama |
|---|---|---|
| toca no animal (ou no cenário) | fora | `reagir()`, diz o nome (`vozes/<id>.mp3`), pausa de 0,2 s, toca o som e chama `fazerSom(ms, silabas)` |
| toca no habitat | fora | `await irAoHabitat()` (sem nome escrito nem dito) |
| toca no animal | dentro do habitat | `reagir()` e `fazerSom(ms)` **com o animal dentro do habitat** (tem de reagir lá dentro, sem sair) |
| toca no habitat, ou passam 7 s | dentro do habitat | `await voltar()` |
| carrega numa seta | qualquer | monta o animal seguinte noutro palco, faz a transição e chama `destruir()` no antigo |

Regras do contrato:
- `reagir()` e `fazerSom()` podem ser chamados várias vezes seguidas e a meio de outra reação: nunca podem deixar o animal num estado partido (pose a meio, peça fora do sítio).
- Enquanto vai ou volta do habitat o motor não chama `reagir()`; mas `destruir()` pode chegar a qualquer momento.
- Durante a transição entre animais há **dois módulos montados ao mesmo tempo**: todos os `id` no SVG (gradientes, máscaras, clipPaths) começam por `<id>-` (ex.: `cao-pelo`, `gato-sombra`).
- No topo do ficheiro só se define `MODULOS.<id>`. Nada de mexer no `document` fora de `montar()` (as ferramentas carregam o ficheiro em Node, sem browser).

---

## 3. Animação: relógio único

- **Tudo** se anima a partir de `ajudas.relogio.aCada(dt => …)` (dt em milissegundos). `aCada` devolve a função que o desliga; `destruir()` chama-a.
- Proibido: `setTimeout`/`setInterval`, animações CSS, `element.animate()`, SMIL (`<animate>`). Pausas e esperas contam-se com o `dt` do relógio. Assim tudo pára quando a app está escondida e os testes podem avançar o tempo à mão.
- Os movimentos têm de depender do tempo (`dt`), não do número de quadros: um telemóvel lento a 30 fps faz o mesmo movimento, só com menos quadros.
- Cada peça mexe-se com `setAttribute('transform', …)` em grupos `<g>` (rodar à volta da articulação, deslocar, escalar). Mudar o `d` de um `path` só para coisas pequenas (boca, pálpebra, língua).

### Técnicas que resultaram (cão e gato)

| Problema | Solução |
|---|---|
| Virar-se de verdade, sem espelhar | **Esqueleto 2,5D** (cão): pontos 3D simples projetados no ecrã; a pose é um ângulo e vira de lado → frente → costas. Alternativa (gato): cabeça sempre de frente, feições deslizam em camadas, e o perfil do corpo estreita enquanto alarga um corpo de frente |
| Pés a deslizar | **Andar por distância**: cada pata planta-se num ponto fixo do mundo e só se levanta quando chega a vez dela (pares diagonais); passo de emergência quando a pata já não chega. Patas com IK de 2–3 segmentos. Medir: o x de uma pata apoiada não pode mudar |
| Pose nova com um pé noutro sítio | O pé levanta-se e pousa; nunca interpolar a posição de um pé que está no chão. Poses vizinhas (agachar, aterrar) têm os pés no mesmo x |
| Costuras nas articulações | Desenhar em dois passes: primeiro os contornos de todas as peças, depois os enchimentos por cima |
| Animal dentro do habitat | Habitat em camadas (trás → animal → frente). Duas formas: o animal passa para dentro do grupo do habitat entre as camadas (gato), ou recortar com `clip-path` (evenodd: ecrã − parede + abertura) as peças que ficam para lá da porta (cão). Em ambas `animal` continua a ser um único `<g>` e o toque funciona |
| Entrar por uma porta | O animal tem de caber agachado no momento em que a atravessa: ver de 50 em 50 ms |
| Cauda que roda para o lado errado | Interpolar ângulos num intervalo contínuo (ex. −270…90), não entre 178 e −96 |
| Olhos meio fechados parecem zangados | Inclinar a pálpebra ao contrário da inclinação do olho |
| Boca em sincronia com o som | Usar o `silabas` que o motor passa ao `fazerSom` (medido pelo `limpar-voz.js`); nunca pôr tempos fixos no módulo |
| Testar comportamentos | Deixar `controlo._teste` (forçar comportamento ou acontecimento, ver o estado); o motor ignora-o |
| Feições de uma cabeça que roda | Prender olhos, nariz e boca a uma esfera: x = R·sen(ângulo + rumo da cabeça). O olho do lado de lá encolhe e desaparece atrás da cabeça; nunca o deixar meio transparente («olho fantasma») |
| Animal redondo (sapo, pássaro, peixe) | Peças como elipsoides 3D projetados em elipses (círculo de raio 1 com `transform`), ordenados por profundidade; brilho sempre do lado da luz |
| Perfil que estreita ao virar | Abaixo de 0,4 de escala horizontal, esbater o perfil com `opacity`, senão as patas parecem paus |
| Membros com IK | Verificar em todas as poses que o membro chega ao alvo: um braço curto parece pousado mas a mão flutua quando o corpo sobe |
| Andar por distância | O último passo acaba quando o corpo pára; senão os pés ficam no ar e o assentar soma quase 1 s |
| Padrão num corpo segmentado (girafa, cobra) | Um só padrão «desenrolado»; cada segmento mostra a sua fatia (recorte fixo); juntas tapadas com uma tampa redonda sem contorno |
| Entrar num buraco de lado (toca) | Recorte = (lado de lá do plano do buraco) ∪ boca da toca; a cabeça com recorte separado do corpo, para as orelhas poderem sair por cima; sombra própria para a cabeça lá dentro |
| Comportamentos que se encadeiam | Cada comportamento começa por repor orelhas e cara à pose neutra |
| Elipsoide projetado | Usar a raiz quadrada simétrica da matriz 2×2 projetada (o brilho do gradiente não roda); ordenar por profundidade, mas fixar à mão a boca e a língua logo a seguir ao maxilar |
| Silhueta de vários elipsoides com «cinturas» | Desenhar o invólucro convexo dos elipsoides rígidos |
| Riscas e manchas num corpo que roda | Quadriláteros desenhados na superfície, só os virados para nós; sem clip-path nem ids |
| Círculo de raio 1 escalado | O `stroke-width` também escala: dividir o traço pela escala |
| Orelhas planas em matriz afim | Largura mínima ~0,34 (senão ficam um risco); a do lado de cá passa à frente do crânio de perfil |
| Pé preso que muda de sítio | Juntar um arco de levantar `sin(π·w)` |
| Cauda que se enrola | Distribuir a curva com expoente < 1 (0,6), senão só enrola junto ao corpo |
| Comportamento interrompido | Limpar os efeitos que criou (bolhas, folhas, partículas) |
| Promessa de `irAoHabitat` que nunca resolve | Guardar o estado (`modo`) e não deixar outro comportamento substituir a tarefa da ida a meio |
| Animal entre camadas do habitat com patas por cima (coala no ramo) | Repetir a peça da frente do habitat dentro do grupo do animal: o toque continua a dar `reagir()` |
| Costuras onde ramos inclinados nascem de um tronco | Gradientes `userSpaceOnUse` com `skewX`, presos a um y comum |
| Braços com as mãos acima da cabeça (liana, trepar) | Trocar a ordem: braços atrás da cabeça, senão tapam a cara |
| Mãos presas a um ponto do mundo (liana, ramo) | Peso numa mola que mistura o alvo do mundo com o do corpo: interromper nunca parte o braço |
| Animal que boia ou entra na água | Véu: cópia da água (mesma cor) recortada abaixo da linha de água; anéis de onda em duas metades (trás atrás do animal, frente por cima do véu) |
| Tromba/pescoço que nasce da cara | Gradiente com transparência na base; contorno só opaco depois do enchimento |
| Animal branco com peças sobrepostas | Enchimento liso nas peças que se sobrepõem (o gradiente radial mostra as costuras) |
| Animal sem cauda visível (coala) | A «onda» passa para as orelhas (mola de acompanhamento e tiques) |
| Acontecimento que usa uma parte do corpo (ave pousa nas costas) | Só quando essa parte está à vista e o animal está fora do habitat |
| Partículas | Nunca o mesmo nome de campo para um elemento e para um número |
| Erva e folhagem paradas | Juntar num só `path` por cor: menos elementos |
| Elipsoide que rebola (porco na lama) | A barriga é a parte abaixo de um plano: arco visível do corte prolongado até ao contorno, recortado pela elipse do tronco |
| Orelha plana que aponta para a câmara | Encurtar e cair para fora e para baixo; esticar na direção que sobra parece um corno |
| Crista, barbelas, bico de perfil quando a cabeça vira de frente | Largura mínima ~0,55 (com 0,3 desaparecem) |
| Pousar num poleiro | Pau que baixa e baloiça com mola; pés e corpo leem a altura do pau a cada quadro; dedos desenhados por cima do pau |
| Pose de cantar/relinchar | Somada à parte (`canto` 0–1, faixa própria) para não lutar com os comportamentos; não inclinar a cabeça demasiado para cima (de frente esconde a cara) |
| Entrar de frente por uma porta (cavalo) | Recortar só pela abertura, alargada até aos cascos; sombra do interior por cima do corpo, mais escura quanto mais fundo |
| Som de cascos («pocotó»: cavalo, zebra) | Sem boca: cada batida (início da sílaba) é um casco a pousar; trote no sítio aos pares diagonais na faixa do corpo (recompor os pés primeiro; o casco sobe depressa e bate no chão), corpo assenta um pouco a cada batida; o aceno da cabeça vai noutra faixa para não ficar a meio se o corpo for interrompido. No habitat (deitado, atrás de uma porta) só acena a cabeça |
| Cabeça de fora por cima de uma meia-porta | Cópia da meia-porta no grupo do animal, entre corpo e pescoço |
| Cara que se esconde de costas | Só quando sen(rumo) < −0,35; antes disso aparece o «olho fantasma» |
| Perfil do tronco quando o animal está de frente | Esbater com `opacity` abaixo de \|cos\| 0,38 e esconder a cauda, senão nasce um «pau» por cima |
| Olhar para uma direção absoluta A | O rumo positivo de `roda()` vira ao contrário de `h`: `hY = P.h − A` (no galo o sinal está trocado) |
| Riscas e colares numa cabeça redonda | Linhas sobre a superfície da esfera (só os troços virados para nós), não manchas soltas |
| Bico que tem de tocar num ponto (semente, água) | Procurar a altura da cabeça por bissecção numa cópia da pose |
| `andarPara` seguido de `virar()` | Não acertar os pés no fim do andar (o `virar()` já pisa): poupa ~0,6 s |
| Pé no ar quando começa um `virar()` | Começar o passo da altura em que está (não cair de repente) |
| Cancela que abre para fora | Abrir antes de o animal chegar, do lado oposto ao caminho |
| Animal de cara escura | Boca aberta desenhada por cima do focinho, com língua |
| Partículas (fiapos, pó) | Nunca nascem em cima da cara |
| Animal que se deita dentro do habitat | A cópia da parte da frente só aparece quando o animal já passou esse plano |
| Testes | `_teste.semEventos()` para desligar os acontecimentos raros durante as fotos |
| Caminho até ao habitat perto de uma seta (cavalo, vaca, revisão de 18-10) | Andar até ao meio (x≈830), virar-se e dar passos de lado até à porta; a porta/cancela só abre depois. Na volta, o mesmo ao contrário |
| Juba ou coroa de pelo numa cabeça que roda (leão) | Madeixas presas a 2–3 anéis 3D atrás da cara; atraso com mola da velocidade da cabeça e uma onda que dá a volta ao anel; um anel pequeno na nuca dá volume de perfil |
| `vector-effect` num `<g>` | Não se herda: pôr `vector-effect="non-scaling-stroke"` em cada path dentro de elipsoides escalados |
| Sombra do interior por cima de um animal com a cabeça de fora | Sombra como peça do animal, com z entre o tronco e a cabeça/patas da frente |
| Pálpebra fechada que parece um disco pálido | Pintar a pálpebra com o gradiente da cabeça |
| Riscas num perfil 2,5D (zebra, tigre) | Riscas no espaço local do perfil, recortadas por um `clipPath` com o próprio perfil: andam com a peça e não «nadam»; no pescoço segmentado, o intervalo branco fica em cima da junta |
| Pó que fica no pelo | Manchas com gradiente radial transparente; elipses lisas parecem doença |
| Ave pousada no dorso | Voa embora quando o animal reage ou sai, senão fica «montada» na ida ao habitat |
| Riscas em anel num abdómen (abelha) | Faixa preenchida entre dois anéis, não um traço grosso |
| Asas muito rápidas sem filtros | Duas poses fantasma que trocam de lado a cada quadro, opacidade 0,5 cada |
| Olhos contentes | Só a pálpebra de baixo sobe; com a de cima descida parecem sonolentos ou zangados |
| Animal que paira (abelha) | A flutuação substitui a respiração; a inclinação sai da velocidade suavizada |
| Ícone com gradientes com id (cão, gato) | Cada leitura de `icone` devolve uma cópia com ids próprios (`<id>-iconeN-…`) |
| Demasiados elementos SVG | Juntar num só `path` por estilo as peças paradas que não se sobrepõem (ervas, tábuas, pedras, folíolos): o aspeto fica igual |
| `fotografar.js` partilhado | Cada agente arranca o seu numa porta livre e confirma que o PNG apareceu |

---

## 4. Ecrã: medidas e zonas livres

O SVG tem sempre `viewBox="0 0 1600 900"` e `preserveAspectRatio="xMidYMid slice"`.

| Zona (coordenadas do SVG) | Regra |
|---|---|
| Todo o 0–1600 × 0–900 | O cenário cobre tudo, sem buracos (as bordas veem-se em ecrãs largos ou quadrados) |
| x 200–1400, y 90–810 | **Área sempre visível** em qualquer telemóvel ou tablet deitado: o animal, o habitat e o percurso entre eles ficam aqui dentro |
| x < 420 e x > 1180, com y 280–620 | Setas da app por cima: não pôr aqui o animal nem o habitat |
| x 560–1040, y < 270 | Nome escrito do animal aparece aqui (pode haver céu/parede, mas nada importante) |
| Cantos de cima (120 × 120) | Botões da casa, do coração e da roda dentada |

Tamanhos: o animal parado ocupa cerca de **300–420 de altura** (ao toque de um dedo pequeno, e bem visível); o habitat tem de ser grande o bastante para o animal caber lá dentro **à mesma escala** (o animal não encolhe ao entrar). Zona de toque do habitat: pelo menos 260 × 260.
Animais altos (girafa, elefante, avestruz) podem ir até ~650 de altura, com os pés a y ≤ 795 (no telemóvel só se vê até ~810) e a cabeça fora da zona do nome e das setas. Testar o animal **dentro do habitat** também em 4:3: no sapo a seta tapava-lhe os olhos.

Para testar as medidas, ver o cenário em **915 × 412** (telemóvel) e em **1024 × 768** (tablet).

---

## 5. Nível de detalhe (o mínimo aceitável)

Estilo: **boneco** (cartoon, ternurento, para uma criança de 2–4 anos), mas **muito trabalhado**. Nada de formas soltas e cores lisas sem volume.

**Desenho**
- Luz de um só lado em todo o cenário (ex.: sol vindo de cima à esquerda): sombras e brilhos coerentes.
- Volume com gradientes suaves (2–3 tons por peça), sombra de contacto no chão por baixo do animal e dos objetos, contorno escuro quente e fino (não preto puro).
- Pelo/pele com textura sugerida: madeixas, manchas, focinho de outra cor, almofadinhas das patas, unhas, bigodes, sobrancelhas.
- Olhos expressivos: íris, pupila, dois brilhos, pálpebra que pisca (desce, não achata o olho).
- Cenário com profundidade: pelo menos 3 planos (fundo distante, plano médio, chão em primeiro plano) e pormenores (texturas de tijolo, madeira, tecido, folhas, ervas).

**Animal parado (nunca está estático)**
- Respiração contínua (peito/barriga sobe e desce, ombros acompanham).
- Piscar de olhos em intervalos aleatórios (2–6 s), às vezes duplo.
- Cauda sempre com movimento (com «onda»: a ponta atrasa-se em relação à base).
- Pelo menos **5 comportamentos ociosos** escolhidos ao acaso a cada 4–9 s, sem repetir o mesmo seguido. Ex. (cão): coçar a orelha com a pata, cheirar o chão, olhar para um pássaro, sentar e levantar, bocejar, inclinar a cabeça. Ex. (gato): lamber a pata e lavar a cara, espreguiçar, olhar para uma mosca, rodar as orelhas, sentar com a cauda à volta das patas.
- Os olhos e a cabeça seguem de vez em quando algo que se mexe no cenário.

**Cenário vivo**
- Pelo menos 4 coisas em movimento lento no fundo (ex.: nuvens, folhas, cortinado, pássaro, luz/poeira, relógio). Calmas: não podem roubar a atenção ao animal.
- Pelo menos 1 acontecimento raro (a cada 15–40 s) que o animal nota e segue com o olhar.

**Movimento (princípios da animação)**
- Antecipação antes de cada ação (agacha antes de saltar), acompanhamento depois (orelhas e cauda continuam a mexer depois de o corpo parar), arcos (nada se move em linha reta), abrandar no início e no fim (easing), compressão e estiramento suaves no salto e na aterragem.
- Andar com **ciclo de passo verdadeiro**: patas alternadas (diagonal), corpo a subir e descer em cada passo, cabeça a balançar, cauda a acompanhar. Os pés não deslizam no chão.
- Virar-se: o animal vira-se de verdade (vira a cabeça primeiro, depois o corpo), não espelha de repente.

**Reação ao toque (`reagir`)**
- Alegria visível em 100 ms: orelhas para cima, olhos maiores ou fechados de contente, cauda rápida, pequeno salto ou abanão.
- `fazerSom(ms, silabas)`: a boca abre uma vez por sílaba, no início e com a duração de cada uma; a cabeça acompanha (ex.: «ão ão» = duas aberturas com um impulso da cabeça). Sem `silabas` (som carregado pelos pais), distribuir aberturas pelos `ms`. Exceção: se a onomatopeia é um som de patas («pocotó»), a boca não abre — mexem as patas (ver tabela de técnicas em §3).

**Ida ao habitat (`irAoHabitat` / `voltar`)**
- Duração: ida entre 2 e 4 s; volta entre 1,5 e 3 s. Movimento fluido do princípio ao fim, com o andar/salto completo.
- O animal **entra de verdade**: o habitat tem camadas (parte de trás → animal → parte da frente) e o animal fica parcialmente tapado pelas partes da frente (ombreira da porta, borda do cesto). Nunca um desenho por cima do outro.
- Pose final no habitat desenhada a propósito (ex.: cão deitado com a cabeça de fora da porta e as patas da frente cruzadas; gato enrolado no cesto com a cauda à volta), com respiração, piscar e pequenos movimentos lá dentro.
- O habitat reage à chegada (a almofada afunda, a casota abana um pouco, sai pó ou uma folha).
- `voltar()` sai do habitat com um movimento próprio (espreguiçar, sacudir-se) e regressa à posição inicial.

---

## 6. Desempenho e segurança

- Tem de correr a 60 fps num telemóvel Android médio. Gradientes sim; **filtros SVG animados não** (desfoque, sombra com filtro em peças que se mexem). Sombras = elipses com gradiente.
- Um único `<svg>` por módulo. Ficheiro com menos de 250 KB. **No máximo ~1200 elementos SVG** (o macaco e o pato passaram dos 1800: confirmar no telemóvel).
- Sem imagens externas, sem internet, sem `<script>`, `<image>` ou `<foreignObject>`. Tudo desenhado em SVG no próprio ficheiro.
- Comentários e nomes no código em português de Portugal.
- Ícone do menu: no máximo 220 de altura (senão tapa o nome do grupo) e, de preferência, **sem gradientes com id**: o mesmo ícone pode aparecer em dois cartões e, se o primeiro estiver escondido, o segundo fica sem cor.

---

## 7. Como testar

1. Servidor: `node ferramentas/servir.js 3000` (no Claude Code: `preview_start` com `name: "app"`).
2. Abrir `http://localhost:3000/?animal=<id>`: abre logo esse animal, sem ecrã inicial e sem service worker. Na consola ficam `window.controlo` (o objeto devolvido por `montar`) e `window.relogio`.
3. Se o painel do browser estiver escondido o tempo não avança e as capturas de ecrã falham. Para ver imagens: `node ferramentas/fotografar.js` (em segundo plano) e, na consola, enviar o SVG do palco (instruções no topo do ficheiro): grava PNG em `originais/fotos/`. Para ver ao perto, mudar o `viewBox` do SVG pela consola antes de fotografar.
   O tempo não avança sozinho. Para fotografar uma animação a meio: `controlo.irAoHabitat(); relogio.avancar(800)` → screenshot → `relogio.avancar(800)` → screenshot… No fim, `relogio.automatico()`. `avancar` corre quadros de 16,7 ms e arredonda para cima (`avancar(20)` = 2 quadros); para ver quadro a quadro usar `avancar(16)`.
   Com o painel escondido a transição entre animais (setas) também fica parada a meio: é normal, no telemóvel não acontece.
   Se dois agentes usam o browser ao mesmo tempo, cada um abre o seu separador (`tabs_create`) e passa sempre o `tabId`.
4. Ver sempre em 915 × 412 e em 1024 × 768.
5. Antes de entregar: `node ferramentas/verificar.js` (0 erros no animal). Os agentes **não** correm `gerar-sw.js`: o erro «sw.js / gerado.js desatualizados» é esperado e quem coordena corre o gerador no fim.
6. Com o tempo manual, nunca `await controlo.irAoHabitat()` nem esperar por `requestAnimationFrame` na consola: fica pendurado. Guardar a promessa, avançar o tempo e ver depois.
7. Recortes para o `fotografar.js` (sempre 16:9, senão a grelha corta): telemóvel `0 90 1600 720`; tablet: ver x 200–1400. Ajuda desenhar as zonas das setas e do nome por cima. O `fotografar.js` é partilhado: não o fechar se outro agente o usa.

---

## 8. Lista de verificação antes de dar um animal por pronto

- [ ] O animal reconhece-se à primeira (uma criança de 2 anos dizia o nome)
- [ ] Respira, pisca, mexe a cauda e tem ≥ 5 comportamentos ociosos diferentes
- [ ] Cenário com 3 planos, ≥ 4 coisas a mexer e 1 acontecimento raro
- [ ] Ciclo de andar/salto com patas alternadas, sem pés a deslizar
- [ ] Entra no habitat com camadas (frente tapa o animal) e tem pose final própria
- [ ] Reage ao toque também dentro do habitat
- [ ] Boca em sincronia com o som
- [ ] Nada importante fora da área visível nem por baixo das setas/nome/botões
- [ ] `reagir()` repetido 10 vezes depressa não estraga a pose
- [ ] `destruir()` a meio da ida ao habitat não deixa erros na consola
- [ ] 0 erros no `verificar.js`

---

## 9. Como pedir um animal novo a um agente

Um agente Opus por animal. O pedido tem de dizer:
1. O animal, o `id`, o `nome`, o nome do habitat e o cenário (ex.: «ovelha, `ovelha`, curral, pasto com colinas»).
2. «Lê `REGRAS-ANIMAIS.md` e um dos exemplos (`animais/cao.js` ou `animais/gato.js`) antes de começar.»
3. Só pode escrever `animais/<id>.js`; não mexe em `app.js`, `index.html`, `animais.js` nem nos outros animais (a linha em `animais.js` e o `<script>` no `index.html` acrescento-os eu antes de lançar o agente).
4. Testar com o separador próprio do browser, em 915 × 412 e 1024 × 768, com pelo menos 3 voltas de correções vistas em imagens.
5. Relatório final: o que fez, o que verificou, o que não conseguiu verificar e o que mudaria nestas regras.

---

## 10. Vozes e sons (gravados pela família)

Os nomes e as onomatopeias são gravados pela família: para uma criança pequena, «miau» dito por uma voz conhecida é melhor do que um miado real ou uma voz sintética.

| Passo | Quem | O quê |
|---|---|---|
| 1. Gravar | Vasco, no telemóvel | Um ficheiro por som: o nome («gato») e a onomatopeia («miau»). Dentro de casa, numa divisão pequena, telemóvel a 15–20 cm, 1 s de silêncio antes de falar |
| 2. Enviar | Vasco | Carrega os ficheiros na conversa com o Claude e diz a ordem (ex.: «cão, som, gato, som») |
| 3. Pôr por tratar | Claude | Copia para `gravacoes/por-tratar/<id>-nome.<ext>` e `gravacoes/por-tratar/<id>-som.<ext>` |
| 4. Limpar | Claude | `node ferramentas/limpar-voz.js`: corta graves e ruído (RNNoise), corta os silêncios do início e do fim, iguala o volume pelo que se ouve (−14 LUFS, com limitador e porta de ruído nas pausas), grava `vozes/<id>.mp3` e `sons/<id>.mp3`, mede as sílabas para `sons/silabas.json` e passa o original para `gravacoes/tratadas/` |
| 5. Publicar | Claude | `gerar-creditos.js`, `gerar-sw.js`, `verificar.js`, commit e push |

O que está em `gravacoes/por-tratar/` falta tratar (`node ferramentas/limpar-voz.js --ver`). Se o tratamento mudar, `node ferramentas/limpar-voz.js --refazer` volta a tratar todos os originais de `gravacoes/tratadas/`. Os sons antigos do Wikimedia Commons estão em `arquivo/sons/`.

---

## 11. Elementos (água, fogo, terra, ar, árvore, flor)

O grupo «Elementos» usa o mesmo motor, o mesmo contrato (§2), as mesmas medidas de ecrã (§4) e as mesmas regras de desempenho (§6). Cada elemento é um ficheiro `animais/<id>.js` com `grupo: 'elementos'` e `som: false` (só tem a gravação do nome). O que muda:

| Tema | Animais | Elementos |
|---|---|---|
| Personagem | O animal, articulado | O elemento, desenhado como é de verdade (estilo boneco): **sem cara, sem olhos, sem boca**. A criança tem de o reconhecer como na vida real |
| Habitat | Obrigatório | **Não há.** `habitat: null`; `irAoHabitat()` e `voltar()` devolvem `Promise.resolve()` |
| `animal` | O animal | O grupo SVG do elemento (zona de toque grande, ≥ 300 × 300), no centro da área visível |
| `fazerSom` | Boca por sílaba | Nunca é chamado (`som: false`); deixar uma função vazia |
| Parado | Respira, pisca, ≥ 5 comportamentos ociosos | **Nunca estático**: movimento contínuo próprio do elemento (chama a tremeluzir, água a correr, folhas a mexer) e ≥ 3 variações ociosas ao acaso a cada 4–9 s |
| `reagir()` | Alegria visível em 100 ms | Reação visível em 100 ms, forte e curta (1–2 s), com acompanhamento no cenário (ex.: o fogo cresce e solta faúlhas; uma rajada de vento dobra a erva). Variar entre 2–3 reações para não ser sempre igual |
| Cenário | 3 planos, ≥ 4 coisas a mexer, 1 acontecimento raro | Igual. O cenário mostra **onde** o elemento se encontra (fogueira num acampamento, ribeiro num vale…) e tem de ajudar a perceber o elemento, não competir com ele |
| Tamanho | 300–420 de altura | O elemento ocupa a parte principal da área visível (≈ 400–600 de altura ou de largura) |

Lista de verificação: reconhece-se à primeira; nunca está parado; ≥ 3 variações ociosas; ≥ 2 reações ao toque; cenário com 3 planos, ≥ 4 coisas a mexer e 1 acontecimento raro; `reagir()` 10 vezes depressa não estraga nada; `destruir()` a qualquer momento sem erros; 0 erros no `verificar.js`.

Aprendido com o fogo e o ar:

| Problema | Solução |
|---|---|
| Chamas, água, fitas de vento com muitas formas | Um `path` por camada com vários subcaminhos, refeito a cada quadro; partículas pequenas num `path` por cor. O fogo ficou com < 500 elementos |
| Brilho à volta de uma forma | Cópias do mesmo `path`, um pouco maiores, só com preenchimento e opacidade baixa. Um contorno largo semitransparente num `path` com subcaminhos desenha também as linhas de dentro («tubos») |
| Elemento sem forma própria (ar) | Mostrar o que ele faz: uma intensidade global que varia devagar + rajadas que viajam em x; cada coisa do cenário lê `vento(x)` |
| Toques seguidos | Efeitos de toque como envelopes que se somam, com limites; apagam-se sozinhos, por isso nunca deixam nada partido |
| Volume com coisas à volta (redemoinho) | Separar em pedaço da frente e de trás; as partículas mudam de grupo quando passam para trás |
| Quem «nota» o acontecimento raro | Um bicho do cenário (o mocho no fogo) que segue o acontecimento com os olhos e reage ao toque |
| Zona do nome | Na reação, o elemento pode entrar por instantes (≈ 1 s) na zona do nome, por trás do texto |
| Zona de toque | Qualquer toque no cenário já chama `reagir()`; um retângulo invisível ≥ 300 × 300 no grupo do elemento chega |
| Bordas em 4:3 | Nada importante a x > 1340 ou x < 260 (fica cortado ou por baixo das setas no tablet) |
| Agentes em paralelo | Cada agente usa a sua porta e uma subpasta própria (com o nome do elemento) no diretório temporário |
