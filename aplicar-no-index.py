"""Injeta a atualização de autoria no index.html ATUAL já existente.
Execute dentro da pasta raiz do repositório, com Python 3.
Não altera os demais arquivos do PDV.
"""
from pathlib import Path
import sys

index = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('index.html')
if not index.is_file():
    raise SystemExit(f'Arquivo não encontrado: {index}')
content = index.read_text(encoding='utf-8')
needle = '<script defer src="js/app.js"></script>'
addition = '<script defer src="js/auditoria-vendas.js"></script>'
if addition in content:
    print('O script já está instalado neste index.html.')
elif needle not in content:
    raise SystemExit('Não encontrei a linha de js/app.js. Não alterei o arquivo.')
else:
    content = content.replace(needle, needle + '\n  ' + addition, 1)
    index.write_text(content, encoding='utf-8')
    print('index.html atualizado sem modificar os scripts anteriores.')
