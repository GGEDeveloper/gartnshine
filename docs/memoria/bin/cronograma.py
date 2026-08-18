#!/usr/bin/env python3
"""Passagem 1: constrói a linha temporal do projeto, sem escrever notas.

Funde todas as fontes datáveis numa tabela única e ordenada, para depois
se percorrer do mais antigo ao mais recente. A data de um documento vem
do primeiro commit que o introduziu, não do mtime — o mtime mente sempre
que um ficheiro é tocado.

  cronograma.py            resumo por fase
  cronograma.py --detalhe  todos os eventos
  cronograma.py --fase 3   só uma fase
  cronograma.py --json     para consumo do bibliotecário
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[3]
TRANSCRIPTS = Path.home() / ".claude" / "projects" / "-home-ggedeveloper-gartnshine-3"

EXCLUIR = re.compile(
    r"(^|/)(node_modules|venv|\.venv|dist|build)/"
    r"|(^|/)\.claude/worktrees/"
    r"|(^|/)docs/memoria/"
)

# Fases naturais, derivadas da densidade de commits e da atividade.
# O limite superior é exclusivo.
FASES = [
    ("1", "Arranque",                "2025-05-01", "2025-08-01"),
    ("2", "Planeamento por fases",   "2025-09-01", "2025-11-01"),
    ("3", "Catálogo e correções",    "2025-11-01", "2026-01-01"),
    ("4", "Pico de fevereiro",       "2026-01-01", "2026-04-01"),
    ("5", "Retoma",                  "2026-04-01", "2026-07-01"),
    ("6", "SEO, checkout e loja",    "2026-07-01", "2026-08-01"),
    ("7", "Capas, prata e marca",    "2026-08-01", "2099-01-01"),
]


def _git(*args: str) -> str:
    return subprocess.run(["git", *args], cwd=RAIZ, capture_output=True,
                          text=True, timeout=120).stdout


def eventos_commits() -> list[dict]:
    saida = _git("log", "--date=short", "--pretty=format:%ad%x1f%h%x1f%s%x1f%b%x1e")
    out = []
    for reg in saida.split("\x1e"):
        c = reg.strip().split("\x1f")
        if len(c) < 3 or not c[0]:
            continue
        out.append({"data": c[0], "genero": "commit", "ref": c[1],
                    "titulo": c[2], "corpo": (c[3] if len(c) > 3 else "").strip()})
    return out


def eventos_docs() -> list[dict]:
    """Data = primeiro commit que introduziu o ficheiro (mtime não é fiável)."""
    out = []
    for rel in _git("ls-files", "*.md").splitlines():
        if not rel or EXCLUIR.search(rel):
            continue
        d = _git("log", "--diff-filter=A", "--format=%ad", "--date=short",
                 "-1", "--", rel).strip().splitlines()
        if not d:
            continue
        p = RAIZ / rel
        tam = p.stat().st_size if p.exists() else 0
        out.append({"data": d[0], "genero": "doc", "ref": rel,
                    "titulo": Path(rel).stem, "bytes": tam})
    return out


def eventos_untracked() -> list[dict]:
    """Trabalho em curso: fora do git, portanto sem data de commit."""
    # O formato de --porcelain é XY<espaço>caminho, com XY de largura fixa.
    agregado: dict[tuple[str, str], int] = defaultdict(int)
    for linha in _git("status", "--porcelain").splitlines():
        if len(linha) < 4:
            continue
        estado, caminho = linha[:2], linha[3:].strip().strip('"')
        if not caminho or EXCLUIR.search(caminho):
            continue
        genero = "em-curso" if estado == "??" else "modificado"
        # Ficheiros soltos sob a mesma pasta contam como um único item:
        # 45 fotografias de galeria são um trabalho, não 45 eventos.
        partes = Path(caminho).parts
        chave = "/".join(partes[:2]) + "/" if len(partes) > 2 else caminho
        agregado[(genero, chave)] += 1

    out = []
    for (genero, ref), n in sorted(agregado.items()):
        titulo = f"{ref} ({n} ficheiros)" if n > 1 else ref
        out.append({"data": "9999-99-99", "genero": genero,
                    "ref": ref, "titulo": titulo, "ficheiros": n})
    return out


def eventos_sessoes() -> list[dict]:
    out = []
    if not TRANSCRIPTS.exists():
        return out
    for f in sorted(TRANSCRIPTS.glob("*.jsonl")):
        datas, turnos, primeira = [], 0, ""
        for linha in f.open(errors="ignore"):
            try:
                d = json.loads(linha)
            except json.JSONDecodeError:
                continue
            if d.get("timestamp"):
                datas.append(d["timestamp"][:10])
            m = d.get("message") or {}
            if m.get("role") == "user":
                c = m.get("content")
                t = (" ".join(x.get("text", "") for x in c
                              if isinstance(x, dict) and x.get("type") == "text")
                     if isinstance(c, list) else c if isinstance(c, str) else "")
                if t and not t.startswith("<"):
                    turnos += 1
                    if not primeira:
                        primeira = " ".join(t.split())[:110]
        if datas:
            out.append({"data": min(datas), "genero": "sessao", "ref": f.stem[:8],
                        "titulo": primeira or "(sem texto)", "turnos": turnos,
                        "fim": max(datas)})
    return out


def eventos_branches() -> list[dict]:
    out = []
    for linha in _git("for-each-ref", "--sort=committerdate",
                      "--format=%(committerdate:short)%09%(refname:short)",
                      "refs/heads/").splitlines():
        if "\t" not in linha:
            continue
        data, ref = linha.split("\t", 1)
        if ref == "main":
            continue
        pendentes = _git("rev-list", "--count", f"main..{ref}").strip()
        if pendentes and pendentes != "0":
            out.append({"data": data, "genero": "branch-pendente", "ref": ref,
                        "titulo": f"{pendentes} commits por integrar"})
    return out


def fase_de(data: str) -> tuple[str, str]:
    if data == "9999-99-99":
        return ("*", "Trabalho em curso (sem data)")
    for num, nome, ini, fim in FASES:
        if ini <= data < fim:
            return (num, nome)
    return ("?", "Fora das fases")


def construir() -> list[dict]:
    ev = (eventos_commits() + eventos_docs() + eventos_sessoes()
          + eventos_branches() + eventos_untracked())
    for e in ev:
        e["fase"], e["fase_nome"] = fase_de(e["data"])
    ev.sort(key=lambda e: (e["data"], e["genero"]))
    return ev


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--detalhe", action="store_true")
    p.add_argument("--fase")
    p.add_argument("--json", action="store_true")
    a = p.parse_args()

    ev = construir()
    if a.fase:
        ev = [e for e in ev if e["fase"] == a.fase]

    if a.json:
        print(json.dumps(ev, ensure_ascii=False, indent=1))
        return

    if a.detalhe:
        for e in ev:
            extra = ""
            if e["genero"] == "sessao":
                extra = f"  [{e['turnos']} turnos, até {e['fim']}]"
            data = "em curso" if e["data"] == "9999-99-99" else e["data"]
            print(f"{data}  {e['genero']:<15} {e['titulo'][:95]}{extra}")
        print(f"\n{len(ev)} eventos")
        return

    # Resumo por fase
    porfase: dict[str, list] = defaultdict(list)
    for e in ev:
        porfase[e["fase"]].append(e)

    print(f"{'fase':<5}{'período':<26}{'commits':>8}{'docs':>6}"
          f"{'sessões':>9}{'turnos':>8}  nome")
    print("-" * 96)
    for num, nome, ini, fim in FASES:
        g = porfase.get(num, [])
        if not g:
            continue
        c = Counter(e["genero"] for e in g)
        turnos = sum(e.get("turnos", 0) for e in g)
        datas = [e["data"] for e in g if e["data"] != "9999-99-99"]
        periodo = f"{min(datas)} → {max(datas)}" if datas else ""
        print(f"{num:<5}{periodo:<26}{c['commit']:>8}{c['doc']:>6}"
              f"{c['sessao']:>9}{turnos:>8}  {nome}")

    curso = porfase.get("*", [])
    if curso:
        print(f"\n{'*':<5}{'sem data':<26}{'':>8}{'':>6}{'':>9}{'':>8}"
              f"  Trabalho em curso: {len(curso)} itens")
    pend = [e for e in ev if e["genero"] == "branch-pendente"]
    for e in pend:
        print(f"      pendente desde {e['data']}: {e['ref']} — {e['titulo']}")
    print(f"\ntotal: {len(ev)} eventos datados")


if __name__ == "__main__":
    main()
