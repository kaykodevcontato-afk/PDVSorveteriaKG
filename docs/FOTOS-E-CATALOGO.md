# Como adicionar e substituir fotos — Dev Kayko

## Pelo painel (mais fácil)
1. Entre como **Dono**.
2. Em **Produtos e Estoque**, clique em **Editar** no produto.
3. Escolha **Foto do computador** (JPG, PNG ou WebP). Salve.
4. Para sabores por quilo e milk-shakes, use **Sabores e preços**.
5. Faça **Backup completo ZIP** depois de salvar fotos importantes.

As fotos importadas pelo painel ficam no **IndexedDB do navegador**. Não são publicadas automaticamente no GitHub e não são compartilhadas entre computadores.

## Pelo VS Code / GitHub
1. Copie a imagem para a pasta apropriada.
   - `assets/picoles/` — picolés tradicionais
   - `assets/sabores/` — sabores de sorvete por quilo
   - `assets/milkshakes/` — milk-shakes
   - `assets/paletas/` — paletas
   - `assets/produtos/` — outros produtos
2. Use nomes simples, por exemplo `morango.webp`, `ninho-com-nutella.webp`, sem espaços ou acentos.
3. Na tela **Dono → Produtos e Estoque → Editar**, defina o caminho relativo (exemplo `assets/produtos/morango.webp`).
4. Publique os arquivos e confira a imagem no PDV.

**Importante:** o navegador pode manter um caminho anterior salvo no armazenamento local. Editar `js/data.js` **não altera cadastros já salvos**. Use o formulário do dono para alterar o registro existente.

## Onde editar produtos e preços iniciais (antes do primeiro uso)
- `js/data.js`: `INITIAL_SERVICES`, `PREMIUM_PALETAS`, `NEW_CATALOG_PRODUCTS`, `INITIAL_PRODUCTS`.
- `js/icecream.js` e `js/milkshake.js`: comportamentos dos seletores; os sabores e preços também podem ser editados pelo painel.
- `css/style.css`: cores, cards de fotos e impressão.
- `index.html`: estrutura das telas e formulários.

## Conferir se os arquivos de foto existem
No terminal, execute `python tools/verificar_fotos.py`. O script faz uma checagem de referências relativas encontradas no HTML e JavaScript; imagens locais escolhidas no painel não são acessíveis durante essa checagem.
