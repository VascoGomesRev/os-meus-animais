# Guia: publicar a app e instalá-la no telemóvel

Repositório: https://github.com/VascoGomesRev/os-meus-animais
Endereço da app (depois de ativar o GitHub Pages): **https://vascogomesrev.github.io/os-meus-animais/**

## 1. Ativar o GitHub Pages (uma vez)

1. Abre o repositório no GitHub e vai a **Settings** (separador no topo) → no menu da esquerda, **Pages**.
2. Em «Build and deployment» → **Source**: escolhe **Deploy from a branch**.
3. Em **Branch**: escolhe `main` e a pasta `/ (root)`. Carrega em **Save**.
4. Espera 1 a 10 minutos. Recarrega a página Settings → Pages: aparece «Your site is live at https://vascogomesrev.github.io/os-meus-animais/».

**Verificar:** abre esse endereço no PC. Tem de aparecer o ecrã «Os Meus Animais» com o botão Começar.

Fonte: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site · HTTPS é automático em sites `github.io`: https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https

## 2. Instalar no telemóvel Android

1. No Chrome do telemóvel, abre https://vascogomesrev.github.io/os-meus-animais/ (liga o Wi-Fi: a primeira abertura descarrega tudo para a app funcionar depois sem internet).
2. Carrega no menu ⋮ (canto superior direito) → **Instalar aplicação** (em alguns telemóveis diz «Adicionar ao ecrã principal») → confirma.
3. Fecha o Chrome e abre a app **Animais** a partir do ecrã principal.
4. Carrega em **Começar**. A app passa a ecrã inteiro, em horizontal.

**Verificar:**
- Mantém a roda dentada (canto superior direito) premida 3 segundos → abre a área dos pais. Em «Aplicação» tem de dizer **«Pronta para funcionar sem internet ✓»**. Se disser «A guardar os ficheiros…», espera uns segundos e volta a abrir.
- Põe o telemóvel em **modo avião**, fecha a app e volta a abri-la: tem de funcionar na mesma.
- Roda o telemóvel para vertical: aparece «Roda o telemóvel».

Fonte: https://support.google.com/chrome/answer/9658361 (instalar apps web no Chrome Android)

## 3. Como chegam as atualizações

Sempre que eu publicar uma versão nova (um `git push`), o telemóvel descarrega-a sozinho da próxima vez que a app for aberta com internet. Só os ficheiros que mudaram são descarregados.

- **Verificar a versão:** área dos pais → «Aplicação» → «Versão 2026-10-13-…». O número tem de ser igual ao que eu te disser.
- Se a versão não mudou: fecha a app por completo (menu de apps recentes → deslizar para fora) e abre-a outra vez. Na primeira abertura descarrega; na segunda já usa a versão nova. Se a app estiver no ecrã inicial quando a versão nova chegar, ela recarrega sozinha.

Fonte: https://web.dev/articles/service-worker-lifecycle

## 4. Voz em português de Portugal

A app diz o nome com a voz do telemóvel. Se na área dos pais aparecer um aviso amarelo sobre a voz:

1. Definições do Android → **Acessibilidade** → **Saída de texto para voz** (em alguns telemóveis está em Definições → Sistema → Idiomas e introdução).
2. Motor preferido: **Motor de conversão de texto em voz do Google** → roda dentada → **Instalar dados de voz** → **Português (Portugal)** → descarregar.
3. Volta à app, abre a área dos pais: tem de dizer «Voz de Portugal encontrada».

Alternativa melhor para a bebé: gravar a tua própria voz na área dos pais («Gravar todos os nomes», a partir da Fase 3). A gravação tem sempre prioridade sobre a voz sintética.

Fonte: https://support.google.com/accessibility/android/answer/6006983

## 5. Evitar que toques acidentais saiam da app («Afixação de ecrã»)

O Android consegue «prender» uma app no ecrã: os gestos de voltar e de ir para o início deixam de funcionar até se desprender com o PIN.

1. Definições → **Segurança** (ou «Segurança e privacidade») → **Mais definições de segurança** → **Afixar aplicações** (nome varia: «Afixação de ecrã», «Fixar aplicações») → ativar, e ativar «Pedir PIN antes de desafixar».
2. Abre a app Animais, carrega no botão de **apps recentes**, toca no ícone da app no topo do cartão → **Afixar**.
3. Para desafixar: mantém premidos ao mesmo tempo os botões **Voltar** e **Recentes** (ou desliza para cima e mantém) e introduz o PIN.

Fonte: https://support.google.com/android/answer/9455138

## 6. Problemas comuns

| Sintoma | O que fazer |
|---|---|
| O endereço dá «404» | O Pages ainda não está ativo ou ainda está a publicar: confirma o passo 1 e espera uns minutos |
| «Instalar aplicação» não aparece no menu do Chrome | Confirma que o endereço começa por `https://`; recarrega a página; espera uns segundos |
| Em modo avião a app não abre | Abre-a uma vez com internet até a área dos pais dizer «Pronta para funcionar sem internet ✓» |
| A app abre em vertical | Carrega em Começar (o bloqueio em horizontal só é possível em ecrã inteiro) |
| Não se ouve nada | Sobe o volume de media; verifica a secção 4 |
| Apaguei «dados do site» no Chrome | As fotos, sons e vozes carregadas na área dos pais ficam guardadas no telemóvel; limpar os dados do site apaga-as (os embutidos na app voltam a descarregar) |
