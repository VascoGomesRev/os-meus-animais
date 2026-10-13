# Guia para arranjar os sons dos animais (Wikimedia Commons)

Objetivo: para cada animal com `som: true` em `animais.js`, um ficheiro `sons/<id>.mp3` (mono, 1–3 s, volume normalizado) com o **som característico do animal** (ladrar, miar, mugir…), e o respetivo crédito. Só do Wikimedia Commons (licenças CC0, domínio público, CC BY ou CC BY-SA). Nada do Freesound nem de outros sites.

## Passos por animal

1. **Procurar** (só consulta, não descarrega): `node ferramentas/procurar-commons.js <id> "<termo em inglês>"`. Tenta vários termos: nome comum + verbo (`dog barking`, `cat meowing`), nome científico (`Canis familiaris`, `Felis catus`), `<animal> sound`, `<animal> call`. A lista completa de cada pesquisa fica em `originais/sons/candidatos.json` (é reescrita a cada chamada; copia o que precisares).
2. **Escolher** o melhor candidato. Critérios, por ordem: (a) é mesmo o som do animal — lê o título e a descrição; rejeita pronúncias de palavras («LL-Q1860 … .wav», «En-us-…»), músicas, discursos, ficheiros de outros animais; (b) licença: CC0/domínio público > CC BY > CC BY-SA; (c) duração 1–10 s é ideal (mais longos servem se se cortar um troço); (d) ficheiro pequeno.
3. **Descarregar** o original para `originais/sons/<id>.<extensão original>` com `curl -sS -L -A "OsMeusAnimais/1.0 (https://github.com/VascoGomesRev/os-meus-animais)" -o originais/sons/<id>.ogg "<url do campo url>"`. Confirma com `ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 originais/sons/<id>.ogg`.
4. **Escolher o troço** (não consegues ouvir, por isso usa o ffmpeg): `ffmpeg -i originais/sons/<id>.ogg -af "silencedetect=noise=-30dB:d=0.3" -f null - 2>&1 | grep silence` mostra onde há silêncio; escolhe um início logo a seguir a um silêncio (ou 0 se o som começa logo) e uma duração de 1 a 3 s que apanhe o som. Com ficheiros longos, evita o início se lá houver vozes/ruído: `ffmpeg -i x -af volumedetect -f null -` dá o volume médio e máximo.
5. **Converter**: `node ferramentas/converter-som.js <id> originais/sons/<id>.ogg <inicio> <duracao>` → escreve `sons/<id>.mp3` e mostra a duração final.
6. **Registar o crédito** no ficheiro do teu grupo `originais/sons/creditos-<grupo>.json` (array JSON; cria-o se não existir; **não** mexas em `creditos.json` da raiz):
   ```json
   { "ficheiro": "sons/cao.mp3", "animal": "cao", "tipo": "som", "titulo": "Barking of a dog.ogg",
     "autor": "Amada44", "licenca": "CC BY-SA 3.0", "licencaUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
     "origem": "https://commons.wikimedia.org/wiki/File:Barking_of_a_dog.ogg", "alteracoes": "cortado a 2,0 s, volume normalizado, mono" }
   ```
   Autor, licença e links vêm dos campos `autor`, `licenca`, `licencaUrl` e `pagina` de `candidatos.json`. Se a licença for CC0 ou domínio público, regista na mesma.

## Regras

- Nunca edites ficheiros fora de `sons/` e `originais/sons/`. Não faças commits.
- Se para um animal não houver nenhum candidato aceitável no Commons depois de 3 pesquisas diferentes, não inventes: deixa-o sem ficheiro e põe-no na lista de falhas do teu relatório, com os termos que tentaste.
- Pausa de ~1 s entre pedidos à API (o script já faz); nunca mais de um pedido em paralelo.
- No fim corre `node ferramentas/verificar.js`: tem de dar 0 erros (os avisos «ainda sem desenho/habitat» são normais).
- Relatório final: tabela com animal → ficheiro escolhido, licença, duração final; e a lista de falhas.
