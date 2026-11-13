# Sorveteria Manager 1.0.5 — Dev Kayko

**Pacote completo** do sistema para publicar no GitHub Pages, não apenas um complemento. Inclui `index.html`, `css/style.css`, todos os arquivos `js/`, o portfólio `dev-kayko/index.html` e este README.

> **Antes de atualizar:** exporte um **backup JSON** e o relatório Excel do site atual. Esta edição completa foi reconstruída a partir dos arquivos HTML disponíveis e das funcionalidades descritas nas versões anteriores — **não é uma cópia byte a byte do código JavaScript da sua versão 1.0.4 publicada**. A chave de armazenamento antiga (`devkayko_sorveteria_v1`) foi mantida e os dados básicos são normalizados, mas teste uma cópia antes de substituir sua loja em produção. Evite apagar cache ou os dados do site.

## Novidade — Quem fez cada venda

- **Proprietário:** entra com a senha do dono, acessa **Configurações → Nome do dono** e define como aparecerá nos comprovantes.
- **Funcionário:** continua **sem senha de login**; precisa escolher seu nome entre os funcionários previamente cadastrados antes de entrar no PDV.
- **Venda:** salva um campo `seller` com `name`, `role` e `id` dentro do registro. Mesmo que depois altere o nome do funcionário, os registros anteriores mantêm o nome de quando a venda ocorreu.
- **Comprovante:** título **Comprovante de venda**, com nome do atendente nas vias **Cliente** e **Loja**. É um recibo não fiscal; não substitui NFC-e ou nota fiscal exigida pela legislação.
- **Relatórios A4/PDF:** coluna **Atendente** na tabela de vendas.
- **Excel XLSX:** colunas **Atendente** e **Perfil do atendente** na aba **Vendas**; atendente na aba **Itens vendidos**.
- **Backup JSON:** inclui a identificação em cada venda.
- **Vendas anteriores sem autor:** mostram **Não identificado** em vez de atribuir a venda a alguém arbitrariamente.

## Funcionalidades do sistema

- Sorvetes por **gramas**, **valor digitado em R$** e **quantidade de bolas**, com cálculo de total.
- Escolha de um ou mais sabores; controle editável de preço por quilo e por bola.
- Catálogo de casquinhas, potes, copos, complementos e estoque.
- Carrinho, descontos, dinheiro com troco, Pix, débito e crédito.
- Caixa com senha operacional distinta da senha do dono; funcionário acessa somente PDV.
- Gerenciamento de produtos, sabores, funcionários, salários, entradas e saídas, metas, fechamento e cancelamentos.
- Relatórios do dia ou mês, PDF, Excel e backup/restauração JSON.
- Impressão por navegador em **58 mm**, com margens internas, duas vias e reimpressão pelo histórico.
- Modo claro/escuro, layout responsivo e rolagem vertical para facilitar o atendimento.
- Crédito Dev Kayko clicável com portfólio em `dev-kayko/index.html`.
- Código de recuperação para senha do dono, gerado no primeiro acesso (guarde fora do dispositivo).

## Atualizar GitHub Pages

1. No projeto atual, entre como dono e faça **Backup JSON**, além de uma exportação Excel por segurança.
2. De preferência teste a nova versão em **um repositório separado ou clone** antes de substituir o sistema usado diariamente. A mesma chave de armazenamento no **mesmo endereço** reutiliza os dados; uma URL de teste separada não herdará dados automaticamente, então restaure uma cópia de backup para testar.
3. Extraia o ZIP e envie **todos os arquivos da raiz**, mantendo as pastas `css`, `js`, `dev-kayko`.
4. Em **Settings → Pages**, configure `main` / `/(root)`.
5. Atualize com `Ctrl + F5`, confira os preços, o estoque, o histórico, a senha do dono, a senha operacional do caixa, a impressão e o Excel.
6. Configure **nome do dono** em Configurações e cadastre os **nomes dos funcionários** antes de permitir atendimento.

## Organização

```text
index.html
README.md
css/style.css
js/data.js
js/security.js
js/excel.js
js/access.js
js/icecream.js
js/app.js
dev-kayko/index.html
```

## Privacidade e limitações

- O funcionário escolhe um nome **sem autenticação pessoal**; a identificação não prova quem realmente realizou a venda. Para auditoria confiável seriam necessários logins individuais e controle de acesso no servidor.
- Os dados ficam no `localStorage` do navegador, e vários computadores não sincronizam entre si. Perfis e senhas locais não protegem dados contra usuários com acesso às ferramentas de desenvolvedor do dispositivo.
- A impressora Bluetooth deve ser reconhecida pelo navegador/sistema operacional; não existe conexão ESC/POS automática.
- O Excel é uma cópia exportada; não é sincronizado com um arquivo Excel já existente.
- O backup JSON contém verificadores criptográficos das senhas, portanto mantenha-o protegido.

**Testes realizados:** execução simulada no Chromium com criação de dono, código de recuperação, cadastro de funcionário, senha do caixa, vendas por peso e bola, impressão das duas vias, histórico e Excel. A impressão física e a publicação no seu repositório ainda não foram verificadas.
