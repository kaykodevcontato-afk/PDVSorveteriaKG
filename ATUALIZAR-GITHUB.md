# Sorveteria Manager — Atualização 1.0.5: quem realizou cada venda

Esta é uma **atualização incremental**, compatível com seu projeto Sorveteria Manager já publicado. **Não é um projeto completo**: é necessário manter os arquivos atuais (`js/app.js`, `js/data.js`, `js/access.js`, `js/excel.js`, `js/icecream.js`, `js/security.js`, CSS e demais pastas) no repositório.

## Instalar no GitHub

1. **Faça um backup JSON** no sistema atual antes da atualização.
2. Extraia o ZIP.
3. Envie o novo arquivo **`js/auditoria-vendas.js`** à pasta `js` do seu projeto no GitHub.
4. Abra o **`index.html` que já está no seu repositório** (não substitua por uma versão antiga).
5. Localize a linha `<script defer src="js/app.js"></script>` no `<head>`.
6. **Logo depois dela**, acrescente:

   ```html
   <script defer src="js/auditoria-vendas.js"></script>
   ```

7. Salve/commit no GitHub. Depois atualize a página com `Ctrl + F5`.

O arquivo `aplicar-no-index.py` automatiza a inserção dessa linha se você preferir executar Python na pasta do projeto local. Ele **não apaga o restante** do seu código.

## Como funciona

- **Dono:** entre como Dono e acesse **Configurações → Nome do dono (aparece nas vendas e comprovantes)**. Defina o nome do proprietário e salve. Se ficar em branco, as vendas serão identificadas como **Dono**.
- **Funcionário:** o dono precisa cadastrar previamente o nome do funcionário em **Funcionários**. Quando alguém escolher o perfil **Funcionário**, surgirá uma janela para selecionar seu nome antes de abrir o PDV. Não foi criada senha de login para o funcionário.
- **Vendas:** ao concluir, são salvos o nome e o perfil do atendente no registro da venda. Se o funcionário for renomeado depois, o registro de uma venda anterior permanece com o nome que tinha no momento da venda.
- **Comprovantes:** as duas vias de 58 mm, inclusive reimpressões, mostrarão **Comprovante de venda** e **Atendido por: [nome]**.
- **Relatórios do dia/mês e impressão A4/PDF:** a tabela de vendas ganha uma coluna **Atendente**.
- **Excel (.xlsx):** a aba **Vendas** ganha **Atendente** e **Perfil do atendente**.
- **Backup JSON:** a identificação do atendente acompanha o registro, pois já é gravada dentro de cada venda.
- **Vendas antigas:** quando a venda não tem identificação, aparecerá **Não identificado**. Não é possível saber retroativamente quem vendeu sem esse registro.

## Exemplo de comprovante

```text
SORVETERIA MANAGER
Comprovante de venda
VIA DO CLIENTE
Atendido por: Ana Silva
Venda: 12345678
... itens ...
TOTAL: R$ 24,47
```

O nome do funcionário é **selecionado, não autenticado**. Como o funcionário entra sem senha, alguém pode escolher o nome de outra pessoa. Para auditoria confiável, seriam necessários logins individuais e banco de dados no servidor.

**Aviso fiscal:** alterar o título para `Comprovante de venda` não transforma o recibo em documento fiscal nem substitui NFC-e/nota fiscal quando exigida.

## Testes de compatibilidade

A atualização foi testada em navegador Chromium com simuladores das funções do PDV: escolha de nome, gravação da venda, comprovante, relatório e exportação. A integração com **sua cópia exata publicada** ainda deve ser conferida após instalar, pois os arquivos JavaScript da versão mais recente não estavam anexados nesta conversa.

**Dev Kayko** · Sorveteria Manager
