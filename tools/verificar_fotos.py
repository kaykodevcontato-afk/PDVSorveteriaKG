"""Verifica caminhos estáticos de fotos referenciados no código."""
from pathlib import Path
import re

BASE = Path(__file__).resolve().parents[1]
ARQUIVOS = [BASE / "index.html", *(BASE / "js").glob("*.js")]
padroes = re.compile(r"assets/(?:picoles|sabores|milkshakes|paletas|produtos)/[A-Za-z0-9_.\-]+\.(?:png|jpg|jpeg|webp)", re.I)
referencias = set()
for arquivo in ARQUIVOS:
    referencias.update(p for p in padroes.findall(arquivo.read_text(encoding="utf-8")) if p not in {"assets/milkshakes/arquivo.webp", "assets/milkshakes/morango.webp"})

if not referencias:
    print("Nenhuma referência fixa foi encontrada. Fotos locais podem ser cadastradas no painel.")
else:
    faltando = []
    for caminho in sorted(referencias):
        existe = (BASE / caminho).is_file()
        print(("OK: " if existe else "FALTA: ") + caminho)
        if not existe:
            faltando.append(caminho)
    print(f"\nTotal: {len(referencias)} referências | Ausentes: {len(faltando)}")
