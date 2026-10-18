# Os Meus Animais

App web instalável (PWA) para Android, para uma criança pequena aprender os nomes dos animais em português de Portugal.

Toca no animal: aparece o nome escrito, a app diz o nome e toca o som do animal. Setas grandes mudam de animal. Depois de instalada funciona sem internet.

**Estado:** recomeço com animações detalhadas, um animal de cada vez (primeiro o cão e o gato). Guia para publicar e instalar no telemóvel: `GUIA-PUBLICACAO.md`.

## Pastas

- `index.html`, `app.js` — a app e o motor (toques, voz, sons, setas, menu, área dos pais)
- `animais.js` — lista dos animais que estão na app
- `animais/<id>.js` — um ficheiro por animal: cenário, animal, habitat e todas as animações
- `REGRAS-ANIMAIS.md` — regras a cumprir para criar cada animal
- `sons/`, `fontes/`, `icones/` — media embutida na app
- `arquivo/` — os 200 animais antigos (lista, desenhos, habitats e sons), à espera de voltarem um a um; não entra na app
- `ferramentas/` — scripts de apoio (servidor local, service worker, verificação, sons, créditos)
- `CREDITOS.md` — autores e licenças dos sons
