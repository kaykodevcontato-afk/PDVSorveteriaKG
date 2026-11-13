# Sorveteria Manager 1.0.1 — Dev Kayko

Sistema de caixa e gestão para sorveteria, feito em **HTML + CSS + JavaScript**, com hospedagem gratuita via **GitHub Pages**. É uma adaptação do Papelaria Manager, mas com **armazenamento separado** (`devkayko_sorveteria_v1`), evitando misturar vendas dos dois estabelecimentos.

## Vendas no PDV

- **Por peso:** digite os gramas informados pela balança. O PDV calcula `peso em gramas ÷ 1000 × preço por quilo` e mostra o total, arredondado a centavos.
- **Por valor:** informe quantos reais o cliente quer gastar; o sistema calcula o **peso aproximado**, e mantém o valor informado no total do item. Exemplo: R$ 20,00 com preço de R$ 69,90/kg equivale a aproximadamente 286,1 g.
- **Por bolas:** informe a quantidade de bolas; o sistema calcula `quantidade × preço por bola`.
- **Sabores:** escolha um ou mais sabores. Pode cadastrar novos sabores, editar nomes ou excluir os antigos, no painel do dono.
- **Casquinhas, cascões, copos e potes:** adicione pelos botões do catálogo do PDV, cada um com preço e estoque próprios. É possível combinar várias bolas com uma casquinha na mesma venda.
- **Adicionais:** coberturas, granulado, milk-shake e outros itens editáveis.
- **Pagamento:** dinheiro (com troco), Pix, débito, crédito; desconto em reais ou porcentagem.

**Atenção:** os preços iniciais de R$ 69,90/kg e R$ 6,00/bola, assim como os preços de casquinhas e potes, são **EXEMPLOS**, não refletem o seu comércio. Configure antes de vender. Os produtos de embalagem iniciam com estoque zero para não representar quantidade fictícia; informe as quantidades reais em **Casquinhas e embalagens**.

### Exemplo de venda

1. No PDV, selecione *Chocolate* e *Morango*.
2. Em **Por peso → Peso da balança**, digite `350` (gramas). Com preço de R$ 69,90/kg, o total será **R$ 24,47**.
3. Clique em **Adicionar**.
4. Se o cliente também levar um pote de 500 ml, toque no botão **Pote 500 ml** do catálogo (depois de configurar seu estoque).
5. Confira o **TOTAL PARA O CLIENTE** à direita, selecione pagamento e conclua a venda.
6. Imprima a via do cliente e/ou da loja ou reimprima pelo histórico.

Ao digitar **Valor informado (R$)**, o total desse sorvete será o valor inserido, e o peso exibido será aproximado. A impressão térmica depende de o navegador/sistema operacional reconhecer a impressora Bluetooth 58 mm; não há comunicação direta com a balança nem com a impressora no projeto estático.

## Área do dono e funcionário

O dono cria uma senha no primeiro uso e configura uma **senha operacional do caixa** diferente. O funcionário acessa o PDV sem senha de login, mas informa a senha operacional para abrir ou fechar o caixa. Relatórios, estoque, sabores, custos, metas, salários, backup e configurações ficam no menu do dono.

**Atenção à segurança:** a proteção de perfis funciona na interface. Como tudo fica no navegador, um usuário técnico com acesso ao mesmo computador pode consultar os dados. Para proteção real, é necessário um sistema com servidor e autenticação.

## Relatórios e backup

- Histórico das vendas detalhando **gramas**, preço/kg, bolas, sabores, casquinhas e embalagem.
- Resumos de entradas, saídas, resultado positivo/negativo do dia ou mês, metas e fechamento do caixa.
- Impressão de relatório A4/PDF com margens; impressão de vias **não fiscais** do cliente/loja em papel **58 mm**.
- Exportação **Excel (.xlsx)** por dia, mês ou histórico completo, com abas Resumo, Vendas, Itens vendidos, Entradas, Saídas, Fechamentos, Estoque e Sabores.
- Backup **JSON** e restauração local.

**Os arquivos Excel não são atualizados automaticamente**: gere um novo relatório depois de realizar novas vendas. Faça backup JSON ao final de cada expediente. O saldo operacional não equivale necessariamente a lucro contábil.

## Portfólio do desenvolvedor (novo)

O crédito **Dev Kayko** no menu lateral, no rodapé e na tela de acesso é clicável. Ele abre uma nova aba com o **index.html do portfólio fornecido**, incluído na pasta `dev-kayko/`.

O link é **relativo** (`dev-kayko/index.html`): funciona tanto no GitHub Pages quanto ao abrir o sistema localmente, desde que a pasta seja enviada junto com o restante do projeto. Não substitua o `index.html` principal do PDV pelo arquivo do portfólio.

## Publicar no GitHub Pages

1. Crie um novo repositório no GitHub (exemplo: `sorveteria-manager`).
2. Envie os arquivos `index.html`, `README.md` e as pastas `css`, `js` e `dev-kayko` **preservando a estrutura**.
3. Em **Settings → Pages**, selecione **Deploy from a branch** → branch **main** → pasta **/(root)** → **Save**.
4. Abra `https://SEU-USUARIO.github.io/sorveteria-manager/` (substitua pelo usuário e nome real do repositório).
5. No primeiro acesso, crie a senha do dono, entre em **Sabores e preços** e ajuste os valores; depois configure a senha do caixa e as quantidades em estoque.

**Evite usar o mesmo repositório da papelaria:** a sorveteria é outro projeto e usa outra base local. O sistema não sincroniza dispositivos; os registros permanecem no navegador/dispositivo em uso. Ao mudar de computador, use o backup JSON.

## Estrutura dos arquivos

```text
sorveteria-manager/
├── index.html       # Interface, páginas e formulários
├── dev-kayko/
│   └── index.html   # Portfólio Dev Kayko (fornecido pelo usuário)
├── css/
│   └── style.css    # Cores, temas, layouts, impressão
├── js/
│   ├── data.js      # Dados, preços de exemplo, armazenamento e backup
│   ├── icecream.js  # Regra de cálculo por peso/valor/bola e sabores
│   ├── app.js       # Caixa, venda, estoque, histórico, relatórios
│   ├── excel.js     # Geração de Excel .xlsx no navegador
│   ├── access.js    # Acesso de dono e funcionário
│   └── security.js  # Senhas locais (PBKDF2)
└── README.md
```

**Desenvolvido por Dev Kayko.**
