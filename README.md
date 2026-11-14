# Sorveteria Manager 1.2.4 — Código organizado para VS Code e GitHub

**Dev Kayko** | Versão de primeiro acesso com catálogo e estoque inicial zerado.

## Organização dos arquivos

```text
index.html                 Interface do PDV (HTML indentado)
css/style.css              Layout, cores, imagens, calendário e impressão
js/data.js                 Produtos e configurações iniciais, localStorage
js/app.js                  PDV, carrinho, vendas, impressão e relatórios
js/access.js               Entrada do dono e funcionários
js/security.js             Segurança local
js/hr.js                   Funcionários, salários, pagamentos
js/backup.js               Backup/restauração e fotos locais
js/excel.js                Relatórios Excel
js/icecream.js             Sorvete por quilo
js/milkshake.js            Milk-shakes
assets/                    Fotos padrão, divididas por categoria
dev-kayko/index.html       Portfólio do desenvolvedor
docs/FOTOS-E-CATALOGO.md   Como incluir imagens e editar o catálogo
tools/verificar_fotos.py  Verifica referências de fotos estáticas
referencias/               Dados adicionais enviados para consulta
.editorconfig              Indentação: 2 espaços, UTF-8
.vscode/settings.json      Padrão do editor
```

## Editar fotos e produtos

Leia [docs/FOTOS-E-CATALOGO.md](docs/FOTOS-E-CATALOGO.md). O painel do dono aceita fotos do computador, mas elas ficam **no navegador**, e não no servidor GitHub.

## Publicar no GitHub Pages

1. Faça backup JSON/ZIP antes de substituir uma instalação em uso.
2. Envie o **conteúdo** desta pasta para a raiz do repositório; `index.html` deve ficar na raiz.
3. Em Settings > Pages, selecione branch `main` e `/(root)`.
4. Abra o site; em navegador novo, configure a senha do dono, cadastre dados da sorveteria e confira preços/estoque.
5. Para ver alterações de arquivos, atualize com `Ctrl + F5`.

**Sem dados de demonstração no primeiro acesso:** vendas, financeiro, caixa, pagamentos e funcionários começam vazios; estoque padrão começa em zero. O catálogo inicial e imagens padrão permanecem. Publicar código **não apaga** dados já existentes no navegador.

**Segurança:** o controle de senhas é local; para dados compartilhados entre dispositivos e autenticação robusta é necessário backend. Faça backups frequentes.

## Alterações nesta organização

- HTML com indentação e alinhamento de tags.
- JavaScript formatado em 2 espaços, sem mudar a lógica.
- Preservados IDs, ordem dos scripts e caminhos do projeto.
- Criados padrões para VS Code, guia de fotos e verificador simples.
- Arquivo JSON adicional recebido preservado em `referencias/`, sem alterar os produtos existentes no PDV.
