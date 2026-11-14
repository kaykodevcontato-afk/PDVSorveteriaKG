# Sorveteria · Catálogo ilustrado — Dev Kayko

## O que há neste pacote

Atualização **complementar** ao PDV existente, pronta para publicar no GitHub Pages.

- `catalogo.html`: nova página com cardápio organizado em **18 categorias e 81 opções de produto**; fotos ilustrativas, pesquisa, filtro por categoria, tema claro/escuro, ampliar foto, imprimir/salvar PDF e exportar dados JSON.
- `css/catalogo.css` e `js/catalogo.js`: estilos e comportamento separados, para facilitar edição no VS Code.
- `js/cardapio-dados.js`: fonte de dados que o catálogo exibe. Edite os nomes, preços e tamanhos aqui. O arquivo `catalogo-produtos.json` contém uma cópia de referência para importação futura.
- `assets/produtos/`: imagens individuais de sabores, preparadas para os cards, mais a foto enviada como referência na capa do catálogo.
- `index.html`: **seu HTML anexado**, com um botão/atalho para o novo cardápio e outro para aplicar o preço de R$ 44,99/kg usando o formulário **já existente** de preços.
- `js/cardapio-integracao.js`: liga o botão de aplicar preço ao formulário original do PDV, sem modificar as tabelas ou o armazenamento diretamente.

## Como atualizar o GitHub Pages

1. **Antes de tudo**, abra a sorveteria atual e faça **Backup JSON** (e relatório Excel, se desejar).
2. Trabalhe primeiro em um repositório/cópia de teste.
3. **Não apague** as pastas atuais nem substitua os arquivos de aplicação `js/app.js`, `js/data.js`, `js/access.js`, `js/icecream.js`, `js/security.js`, `js/excel.js`, `js/calendar.js` ou o CSS original `css/style.css`. Esses arquivos **não foram anexados**, portanto não estão neste pacote.
4. Copie para a **raiz do repositório** os arquivos `catalogo.html`, `catalogo-produtos.json` e o `index.html` atualizado. Envie as pastas complementares, **mesclando-as** com as existentes: `assets`, `css` e `js`. Não substitua pastas inteiras por pastas menores.
5. O atalho **Cardápio com fotos ↗** aparece no menu lateral e em **Sabores e preços**, abrindo uma nova aba. Também é possível acessar `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/catalogo.html` (substitua seu endereço real).
6. Entre como **Dono → Sabores e preços** e clique em **Aplicar R$ 44,99/kg**. Confirme e verifique se o formulário original salvou esse valor. O botão preserva o preço por bola; não foi informado o valor de uma bola.
7. Recarregue com `Ctrl + F5`. Teste o PDV, impressão e relatórios antes de atender clientes.

## Importante: catálogo e PDV são diferentes

O catálogo **é uma vitrine de consulta**. Mostrar os 81 produtos e seus preços na página ilustrada **não os cadastra automaticamente no banco local do PDV**, nem cria controle de estoque para eles. Para integrar em massa os produtos ao caixa, preciso dos arquivos **originais e atuais** `js/app.js`, `js/data.js` e `js/icecream.js` (além dos demais scripts usados por eles). Sem esses códigos, inserir dados diretamente no armazenamento poderia corromper vendas e backups existentes.

O botão "Aplicar R$ 44,99/kg" altera apenas o campo do preço do quilo e envia o formulário do **próprio PDV**, sem mexer manualmente no `localStorage`. Se a versão publicada do PDV tiver uma estrutura de formulário diferente, use o campo **Preço por quilo** manualmente, digitando `44,99`, e salve. **O catálogo em si não processa compras nem pagamentos.**

## Conferência de preços

- Picolés tradicionais: 10 sabores • **R$ 2,00** cada
- Sorvete por quilo: 12 sabores • **R$ 44,99/kg**
- Milk-shakes tradicionais: 7 sabores • **300/400/500 ml = R$ 12,00 / 14,00 / 16,00**
- Milk-shakes especiais: 7 sabores • **300/400/500 ml = R$ 15,00 / 17,00 / 19,00**
- Mini Paleta Premium: 6 sabores • **R$ 10,00** cada
- Sorvete 1,5 L: 5 sabores • **R$ 30,00**
- Açaí 900 ml: **R$ 27,00**
- Super Cremosos: 3 sabores • **R$ 13,00**
- Sorvete 1 L Açaí com Leitinho: **R$ 35,00**
- Sorvete 1 L: 6 sabores • **R$ 30,00**
- Zero Açúcar: 2 sabores • **R$ 30,00** (volume não informado)
- Salada de frutas: **300 ml R$ 10,00; 400 ml R$ 14,00** • segunda a sábado
- Coberturas: Chocolate **R$ 15,00**; Morango **R$ 12,00**; Caramelo **R$ 12,00** (volume não informado)
- Picolé Pistache: **R$ 6,00**
- Picolés especiais: 3 sabores • **R$ 7,00**
- Batidinha de Açaí: **R$ 14,00** (volume não informado)
- Cremosinn: 10 sabores • **R$ 2,00**
- Água mineral: 500 ml **R$ 2,00**; 1,5 L **R$ 4,00**

## Edição das fotos

As imagens são **ilustrativas geradas com IA**. A foto de morango enviada originalmente foi mantida na capa; as demais são interpretações visuais e não fotos dos produtos efetivamente vendidos. Você pode substituir qualquer arquivo de `assets/produtos/` por uma foto real, conservando o mesmo nome de arquivo, ou alterar o campo `image` no `js/cardapio-dados.js`.

## Organização do código

```text
index.html                     ← HTML atualizado do PDV (precisa dos JS originais)
catalogo.html                  ← cardápio independente
catalogo-produtos.json        ← dados para referência
css/catalogo.css              ← CSS da nova página
js/catalogo.js                ← filtros, impressão, visualização
js/cardapio-dados.js          ← cadastro de 81 produtos e preços
js/cardapio-integracao.js     ← botão opcional para 44,99/kg
assets/morango-referencia.jpg ← imagem de referência do usuário
assets/produtos/              ← fotos ilustrativas individuais
```

Desenvolvido por **Dev Kayko**.
