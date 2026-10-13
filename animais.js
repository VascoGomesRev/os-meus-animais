/* Dados dos animais.
   id    → nome dos ficheiros fotos/<id>.webp e sons/<id>.mp3 (só letras minúsculas sem acentos, números e hífen)
   nome  → como aparece escrito e como é dito (minúsculas, sem artigo: «cão», não «o cão»)
   grupo → ordem «por grupos» e organização dos créditos (ver GRUPOS)
   cena  → fundo desenhado quando não há foto: casa, quinta, agua, floresta, savana, gelo, ceu, relva
   som   → true se o animal tem um som característico (toca se existir sons/<id>.mp3 ou um som carregado pelos pais) */
'use strict';

const GRUPOS = {
  casa: 'Casa',
  quinta: 'Quinta',
  floresta: 'Floresta',
  selva: 'Selva e savana',
  gelo: 'Gelo',
  mar: 'Mar e rio',
  aves: 'Aves',
  insetos: 'Insetos e pequenos'
};

const ANIMAIS = [
  { id: 'cao',   nome: 'cão',   grupo: 'casa',   cena: 'casa',   som: true },
  { id: 'gato',  nome: 'gato',  grupo: 'casa',   cena: 'casa',   som: true },
  { id: 'vaca',  nome: 'vaca',  grupo: 'quinta', cena: 'quinta', som: true },
  { id: 'pato',  nome: 'pato',  grupo: 'quinta', cena: 'quinta', som: true },
  { id: 'peixe', nome: 'peixe', grupo: 'mar',    cena: 'agua',   som: false }
];
