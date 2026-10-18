/* Dados dos animais que estão na app. A lista completa antiga (200 animais) está em arquivo/animais.js;
   os animais voltam um a um, cada um com o seu módulo em animais/<id>.js (regras em REGRAS-ANIMAIS.md).
   id      → nome do ficheiro animais/<id>.js e sons/<id>.mp3 (só letras minúsculas sem acentos, números e hífen)
   nome    → como aparece escrito e como é dito (minúsculas, sem artigo: «cão», não «o cão»)
   grupo   → cartão do menu (ver GRUPOS); por agora só há «animais»
   som     → true se o animal tem um som característico (toca se existir sons/<id>.mp3 ou um som carregado pelos pais)
   O nome do animal é dito com a gravação vozes/<id>.mp3 (se existir) ou com a voz sintética. */
'use strict';

/* Grupos do menu inicial. Por agora só «Animais»; mais tarde: coisas, elementos, números… */
const GRUPOS = {
  animais: 'Animais'
};

const ANIMAIS = [
  { id: 'cao',  nome: 'cão',  grupo: 'animais', som: true },
  { id: 'gato', nome: 'gato', grupo: 'animais', som: true },
  { id: 'coelho', nome: 'coelho', grupo: 'animais', som: true },
  { id: 'sapo', nome: 'sapo', grupo: 'animais', som: true },
  { id: 'raposa', nome: 'raposa', grupo: 'animais', som: true },
  { id: 'girafa', nome: 'girafa', grupo: 'animais', som: true },
  { id: 'peixe', nome: 'peixe', grupo: 'animais', som: true },
  { id: 'coala', nome: 'coala', grupo: 'animais', som: true },
  { id: 'macaco', nome: 'macaco', grupo: 'animais', som: true },
  { id: 'elefante', nome: 'elefante', grupo: 'animais', som: true },
  { id: 'pato', nome: 'pato', grupo: 'animais', som: true },
  { id: 'porco', nome: 'porco', grupo: 'animais', som: true },
  { id: 'galo', nome: 'galo', grupo: 'animais', som: true },
  { id: 'cavalo', nome: 'cavalo', grupo: 'animais', som: true },
  { id: 'vaca', nome: 'vaca', grupo: 'animais', som: true },
  { id: 'ovelha', nome: 'ovelha', grupo: 'animais', som: true },
  { id: 'passarinho', nome: 'passarinho', grupo: 'animais', som: true },
  { id: 'leao', nome: 'leão', grupo: 'animais', som: true },
  { id: 'zebra', nome: 'zebra', grupo: 'animais', som: true },
  { id: 'abelha', nome: 'abelha', grupo: 'animais', som: true }
];

/* Cada animais/<id>.js acrescenta aqui o seu módulo: MODULOS.<id> = { icone, montar } */
const MODULOS = {};
