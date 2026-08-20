#!/usr/bin/env python3
"""Converte as memórias antigas (~/.claude/.../memory/) para a nova ontologia.

CUMPRIDO E ARRUMADO. Correu uma vez, a 2026-08-17, e produziu as 19 notas que
ainda hoje se distinguem pela proveniência `migracao:`. Fica para o registo,
mas em `projeto/` e não em `bin/`: soletra o caminho da pasta pessoal deste
utilizador, e `bin/` é motor que viaja para outros centros de memória.

Deixou uma marca que só se viu três dias depois: as 19 notas nasceram com o
resumo igual ao título, porque a auto-memória tinha um único campo a alimentar
os dois. Ver `memoria-qualidade-medida`.


A conversão preserva o texto integral e infere o que é inferível:
data de validade a partir do nome do ficheiro, tipo a partir do conteúdo,
entidades a partir das referências do domínio. O que não é inferível fica
marcado com REVER para o bibliotecário completar.
"""
from __future__ import annotations

import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ANTIGO = Path.home() / ".claude" / "projects" / "-home-ggedeveloper-gartnshine-3" / "memory"
NOVO = Path(__file__).resolve().parents[1] / "notas"

# Referências do domínio que valem como entidade de grafo.
PADROES_ENTIDADE = [
    (r"\b(P[A-Z]{2}\d{4}|LTCU\d{4}|PAN\d{4})\b", "produto"),
    (r"\b(migra[çc][ãa]o \d{3})\b", "migracao"),
    (r"([\w\-/]+\.(?:js|css|ejs|sql|json|md|jpg|webp|png))", "ficheiro"),
    (r"\b(waphix|cPanel|Docker Compose|MySQL|sharp|rembg|Ollama)\b", "sistema"),
]

# Sinal de tipo, por ordem de prioridade.
def inferir_tipo(nome: str, texto: str) -> str:
    t = texto.lower()
    if re.search(r"\bestado\b|ponto de situa|em curso|pendente", nome + " " + t[:400]):
        return "estado"
    if re.search(r"reprova|decidi|optou|escolh|não repropor|nao repropor|"
                 r"adiad|preferi|em vez de", t):
        return "decisao"
    if re.search(r"prefer[êe]ncia|gosta|quer que|não quer|nao quer", t[:300]):
        return "preferencia"
    return "facto"


def inferir_data(nome: str, texto: str) -> str | None:
    m = re.search(r"(20\d{2})[_\-](\d{2})[_\-](\d{2})", nome)
    if m:
        return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    m = re.search(r"(20\d{2})[_\-](\d{2})\b", nome)
    if m:
        return f"{m.group(1)}-{m.group(2)}-01"
    m = re.search(r"\b(20\d{2})-(\d{2})-(\d{2})\b", texto)
    return m.group(0) if m else None


def extrair_entidades(texto: str) -> list[str]:
    achados: list[str] = []
    for padrao, _ in PADROES_ENTIDADE:
        for m in re.finditer(padrao, texto, re.I):
            v = m.group(1)
            if v not in achados:
                achados.append(v)
    return achados[:12]


def ler_antiga(f: Path) -> dict:
    texto = f.read_text(encoding="utf-8")
    meta, corpo = {}, texto
    if texto.startswith("---"):
        _, _, resto = texto.partition("---\n")
        fm, _, corpo = resto.partition("\n---")
        for linha in fm.splitlines():
            if ":" in linha and not linha.strip().startswith("-"):
                k, _, v = linha.partition(":")
                meta[k.strip()] = v.strip()
        corpo = corpo.strip()
    meta["corpo"] = corpo.strip()
    return meta


def escrever(destino: Path, dados: dict) -> None:
    fm = ["---", f"slug: {dados['slug']}", f"tipo: {dados['tipo']}",
          f"titulo: {dados['titulo']}"]
    if dados.get("resumo"):
        fm.append(f"resumo: {dados['resumo']}")
    if dados.get("keywords"):
        fm.append(f"keywords: {dados['keywords']}")
    fm.append(f"valid_from: {dados.get('valid_from') or ''}")
    fm.append(f"valid_to: {dados.get('valid_to') or ''}")
    fm.append(f"ingested_at: {dados['ingested_at']}")
    fm.append(f"superseded_by: {dados.get('superseded_by') or ''}")
    fm.append(f"confianca: {dados.get('confianca', 1.0)}")
    if dados.get("entities"):
        fm.append("entities:")
        fm += [f"  - {e}" for e in dados["entities"]]
    if dados.get("sources"):
        fm.append("sources:")
        fm += [f"  - {s}" for s in dados["sources"]]
    if dados.get("relations"):
        fm.append("relations:")
        fm += [f"  - {r}" for r in dados["relations"]]
    fm.append("---")
    destino.write_text("\n".join(fm) + "\n\n" + dados["corpo"] + "\n",
                       encoding="utf-8")


def main() -> None:
    if not ANTIGO.exists():
        sys.exit(f"não encontrei {ANTIGO}")
    NOVO.mkdir(parents=True, exist_ok=True)
    agora = datetime.now(timezone.utc).isoformat(timespec="seconds")
    n = 0
    for f in sorted(ANTIGO.glob("*.md")):
        if f.name == "MEMORY.md":
            continue
        antiga = ler_antiga(f)
        corpo = antiga["corpo"]
        slug = re.sub(r"^project[_-]", "", f.stem).replace("_", "-")
        titulo = antiga.get("description") or slug.replace("-", " ").capitalize()
        tipo = inferir_tipo(f.stem, corpo)
        data = inferir_data(f.stem, corpo)

        escrever(NOVO / f"{slug}.md", {
            "slug": slug,
            "tipo": tipo,
            "titulo": titulo[:120],
            "resumo": (antiga.get("description") or "")[:200],
            "valid_from": data,
            "valid_to": None,
            "ingested_at": agora,
            "confianca": 1.0,
            "entities": extrair_entidades(corpo),
            "sources": [f"migracao:{f.name}"],
            "corpo": corpo,
        })
        print(f"  {tipo:<12} {slug}" + (f"  ({data})" if data else ""))
        n += 1
    print(f"\n{n} notas migradas para {NOVO.relative_to(Path.cwd()) if NOVO.is_relative_to(Path.cwd()) else NOVO}")
    print("As keywords EN e as relações ficam por preencher — trabalho do bibliotecário.")


if __name__ == "__main__":
    main()
