/* Dados dos animais que estão na app. A lista completa antiga (200 animais) está em arquivo/animais.js;
   os animais voltam um a um, cada um com o seu módulo em animais/<id>.js (regras em REGRAS-ANIMAIS.md).
   id      → nome do ficheiro animais/<id>.js e sons/<id>.mp3 (só letras minúsculas sem acentos, números e hífen)
   nome    → como aparece escrito e como é dito (minúsculas, sem artigo: «cão», não «o cão»)
   grupo   → ordem «por grupos» e menu (ver GRUPOS)
   som     → true se o animal tem um som característico (toca se existir sons/<id>.mp3 ou um som carregado pelos pais)
   O nome do animal é dito com a gravação vozes/<id>.mp3 (se existir) ou com a voz sintética. */
'use strict';

const GRUPOS = {
  casa: 'Estimação',
  quinta: 'Quinta',
  floresta: 'Floresta',
  selva: 'Selva e savana',
  gelo: 'Gelo',
  mar: 'Mar e rio',
  aves: 'Aves',
  insetos: 'Insetos e pequenos'
};

const ANIMAIS = [
  { id: 'cao',  nome: 'cão',  grupo: 'casa', som: true },
  { id: 'gato', nome: 'gato', grupo: 'casa', som: true },
  { id: 'coelho', nome: 'coelho', grupo: 'casa', som: true },
  { id: 'sapo', nome: 'sapo', grupo: 'floresta', som: true },
  { id: 'raposa', nome: 'raposa', grupo: 'floresta', som: true },
  { id: 'girafa', nome: 'girafa', grupo: 'selva', som: true },
  { id: 'peixe', nome: 'peixe', grupo: 'mar', som: true },
  { id: 'coala', nome: 'coala', grupo: 'floresta', som: true },
  { id: 'macaco', nome: 'macaco', grupo: 'selva', som: true },
  { id: 'elefante', nome: 'elefante', grupo: 'selva', som: true },
  { id: 'pato', nome: 'pato', grupo: 'quinta', som: true },
  { id: 'porco', nome: 'porco', grupo: 'quinta', som: true },
  { id: 'galo', nome: 'galo', grupo: 'quinta', som: true },
  { id: 'cavalo', nome: 'cavalo', grupo: 'quinta', som: true },
  { id: 'vaca', nome: 'vaca', grupo: 'quinta', som: true },
  { id: 'ovelha', nome: 'ovelha', grupo: 'quinta', som: true },
  { id: 'passarinho', nome: 'passarinho', grupo: 'aves', som: true }
];

/* Cada animais/<id>.js acrescenta aqui o seu módulo: MODULOS.<id> = { icone, montar } */
const MODULOS = {};
