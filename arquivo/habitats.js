/* Habitats: o «sítio» de cada animal, desenhado na cena. Ao tocar nele, o animal vai lá e volta.
   HABITATS[id] = { nome: 'casota', svg: '<g>…</g>' }
   - svg: só o interior (a app põe o <svg viewBox="0 0 220 220"> à volta), estilo kawaii, cores lisas, sem texto
   - nome: em pt-PT, minúsculas, sem artigo; é dito em voz alta quando a criança toca
   - os desenhos de cada grupo estão em habitats/<grupo>.js e acrescentam-se com Object.assign(HABITATS, {...}) */
'use strict';
const HABITATS = {};
