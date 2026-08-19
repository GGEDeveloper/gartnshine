#!/usr/bin/env python3
"""Captura com confiança progressiva.

No início, tudo passa por confirmação. À medida que um par (tipo, domínio)
acumula aprovações sem rejeições, deixa de perguntar e passa a gravar
directamente. Uma rejeição faz recuar a confiança desse par — o sistema
volta a perguntar onde já errou.

  capturar.py propor                    o que esta sessão deixou por memorizar
  capturar.py estado                    mostra a confiança por categoria
  capturar.py decidir <tipo> <dominio>  diz se deve perguntar ou gravar
  capturar.py registar <tipo> <dominio> <decisao> [--slug S] [--nota N]

`decisao` é uma de: aprovada, rejeitada, editada, auto.
'editada' conta como meia aprovação: o conteúdo servia, a forma não.
"""
from __future__ import annotations

import argparse
import subprocess
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from mem import DOMINIOS, RAIZ, TIPOS, buscar, conectar, criar_esquema  # noqa: E402

# Quantas decisões são precisas antes de sequer considerar automatizar.
MIN_AMOSTRA = 5
# Taxa de aprovação a partir da qual se automatiza.
LIMIAR_AUTO = 0.85
# Uma rejeição nas últimas N decisões trava a automatização, mesmo com
# histórico bom — é o sinal mais recente que conta.
JANELA_TRAVAO = 3


def agora() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _peso(decisao: str) -> float:
    return {"aprovada": 1.0, "auto": 1.0, "editada": 0.5, "rejeitada": 0.0}[decisao]


def confianca(db: sqlite3.Connection, tipo: str, dominio: str) -> dict:
    linhas = list(db.execute(
        "SELECT decisao FROM capture_log WHERE tipo=? AND padrao=?"
        " ORDER BY id DESC", (tipo, dominio)))
    n = len(linhas)
    if n == 0:
        return {"n": 0, "taxa": 0.0, "auto": False,
                "porque": "sem histórico — pergunta sempre"}

    taxa = sum(_peso(r["decisao"]) for r in linhas) / n
    recentes = [r["decisao"] for r in linhas[:JANELA_TRAVAO]]

    if "rejeitada" in recentes:
        return {"n": n, "taxa": taxa, "auto": False,
                "porque": f"rejeição nas últimas {JANELA_TRAVAO} — volta a perguntar"}
    if n < MIN_AMOSTRA:
        return {"n": n, "taxa": taxa, "auto": False,
                "porque": f"só {n} de {MIN_AMOSTRA} decisões necessárias"}
    if taxa < LIMIAR_AUTO:
        return {"n": n, "taxa": taxa, "auto": False,
                "porque": f"taxa {taxa:.0%} abaixo do limiar {LIMIAR_AUTO:.0%}"}
    return {"n": n, "taxa": taxa, "auto": True,
            "porque": f"{n} decisões, {taxa:.0%} de aprovação"}


# ---------------------------------------------------------------- propor
# Pastas e ficheiros que mudam a toda a hora e nunca são conhecimento.
_RUIDO = (".venv/", "node_modules/", "docs/memoria/estado/", "package-lock",
          "pnpm-lock", "__pycache__/", "temporario", "aa-temporary",
          "_arquivo", "_descartadas", ".thumbnail",
          # Artefacto do WSL: o Windows deixa um fluxo alternativo por cada
          # ficheiro descarregado, e o git vê-o como ficheiro novo.
          ":Zone.Identifier")

# O conhecimento vive em código, configuração e texto. Uma fotografia mudar
# não é uma decisão sobre o projeto — e havia 1082 delas a afogar o dossiê.
_EXT_CONHECIMENTO = {".py", ".js", ".mjs", ".cjs", ".ts", ".json", ".sql",
                     ".md", ".css", ".html", ".ejs", ".sh", ".yml", ".yaml",
                     ".toml", ".env", ".conf", ".txt"}


def _git(*args) -> str:
    try:
        r = subprocess.run(["git", *args], cwd=RAIZ, capture_output=True,
                           text=True, timeout=20)
        return r.stdout
    except (OSError, subprocess.SubprocessError):
        return ""


def _interessa(caminho: str) -> bool:
    if not caminho or any(r in caminho for r in _RUIDO):
        return False
    ext = Path(caminho).suffix.lower()
    # Sem extensão costuma ser executável ou pasta; com extensão, tem de ser
    # das que carregam conhecimento.
    return not ext or ext in _EXT_CONHECIMENTO


def mudancas(desde: str | None) -> dict:
    """O que o trabalho deixou no repositório: por commitar, e commitado.

    Lê a saída do git em modo `-z`. Sem isso, um caminho com espaços ou
    acentos vem entre aspas e escapado, e a partição por linhas parte-o ao
    meio — este repositório tem pastas de fotografia cheias dos dois.
    """
    porcommitar = set()
    bruto = _git("status", "--porcelain", "-z", "--untracked-files=all")
    for campo in bruto.split("\0"):
        if len(campo) > 3:
            c = campo[3:]
            if _interessa(c):
                porcommitar.add(c)

    commits, ficheiros_commitados = [], set()
    if desde:
        for l in _git("log", "--format=%h|%cs|%s", f"{desde}..HEAD").splitlines():
            if l.count("|") >= 2:
                sha, data, assunto = l.split("|", 2)
                commits.append({"sha": sha, "data": data, "assunto": assunto})
        ficheiros_commitados = {
            f for f in _git("diff", "--name-only", "-z", f"{desde}..HEAD").split("\0")
            if _interessa(f)}

    return {"porcommitar": sorted(porcommitar), "commits": commits,
            "commitados": sorted(ficheiros_commitados)}


def _area(caminho: str) -> str:
    """Agrupamento grosseiro, só para o dossiê não ser uma lista de 200 linhas.

    Um ficheiro na raiz é a sua própria área; sem isto, o `CLAUDE.md` aparecia
    como uma «área» de um elemento ao lado de pastas com dezenas.
    """
    partes = Path(caminho).parts
    if len(partes) == 1:
        return "(raiz)"
    if partes[0] == "gonzagas_node" and len(partes) > 2 \
            and partes[1] in ("modules", "public", "scripts"):
        return "/".join(partes[:3])
    return "/".join(partes[:2])


def territorio(db, caminhos: list[str]) -> dict:
    """Que notas já reclamam cada ficheiro mexido.

    É esta a pergunta que quem escreve não consegue responder de cabeça, e é
    dela que sai a decisão entre criar, enriquecer e suceder. Sem isto, a
    biblioteca enche-se de notas quase iguais sobre o mesmo assunto.
    """
    donas: dict[str, list[str]] = {}
    for r in db.execute("SELECT slug, ref FROM sources WHERE kind='ficheiro'"):
        for c in caminhos:
            # Uma nota que cita uma pasta é dona do que está lá dentro.
            if c == r["ref"] or c.startswith(r["ref"].rstrip("/") + "/"):
                donas.setdefault(c, []).append(r["slug"])
    return donas


def cmd_propor(args) -> int:
    db = conectar()
    criar_esquema(db)

    desde = args.desde or _git("log", "-1", "--format=%H", "--",
                               "docs/memoria/notas/").strip() or None
    m = mudancas(desde)
    tocados = sorted(set(m["porcommitar"]) | set(m["commitados"]))

    print("# Dossiê de captura —", datetime.now().strftime("%Y-%m-%d %H:%M"))
    print()
    if not tocados and not m["commits"]:
        print("Nada mudou no repositório desde a última nota. Se houve decisões")
        print("só na conversa, escreve-as à mão — o git não as viu.")
        return 0

    if desde:
        print(f"Desde `{desde[:8]}`, o último commit a tocar em `notas/`.")
        print()

    if m["commits"]:
        print(f"## Commits ({len(m['commits'])})")
        for c in m["commits"]:
            print(f"- `{c['sha']}` {c['data']} — {c['assunto']}")
        print()

    por_area: dict[str, list[str]] = {}
    for c in tocados:
        por_area.setdefault(_area(c), []).append(c)
    print(f"## Ficheiros mexidos ({len(tocados)}) por área")
    for area, fs in sorted(por_area.items(), key=lambda x: -len(x[1]))[:15]:
        amostra = ", ".join(f"`{Path(f).name}`" for f in fs[:4])
        mais = f" +{len(fs) - 4}" if len(fs) > 4 else ""
        print(f"- **{area}** ({len(fs)}): {amostra}{mais}")
    print()

    donas = territorio(db, tocados)
    if donas:
        print("## Território já reclamado")
        print()
        print("Estas notas dizem vir destes ficheiros. **Enriquecer ou suceder,")
        print("não criar ao lado** — criar uma segunda nota sobre o mesmo ficheiro")
        print("é como a biblioteca começa a contradizer-se.")
        print()
        por_nota: dict[str, list[str]] = {}
        for caminho, slugs in donas.items():
            for sl in slugs:
                por_nota.setdefault(sl, []).append(caminho)
        for sl, cs in sorted(por_nota.items()):
            n = db.execute("SELECT titulo, tipo, valid_from FROM notes WHERE slug=?",
                           (sl,)).fetchone()
            if not n:
                continue
            print(f"- `{sl}` ({n['tipo']}, desde {n['valid_from']}) — {n['titulo']}")
            for c in sorted(cs)[:4]:
                print(f"    mexeste em `{c}`")
        print()

    # Busca pelas áreas mexidas: apanha a nota que fala do assunto mesmo quando
    # não declara proveniência nenhuma sobre o ficheiro.
    consulta = " ".join(sorted(por_area)[:6]) + " " + \
        " ".join(c["assunto"] for c in m["commits"][:4])
    vizinhas = [r for r in buscar(db, consulta.strip() or "projeto", 8, gravar=False)
                if r["fonte"] == "nota" and r["ref"] not in donas]
    if vizinhas:
        print("## Notas próximas do que mexeste")
        print()
        print("Não reclamam estes ficheiros, mas falam do assunto. Se a coisa nova")
        print("pertence a uma delas, é lá que vai — e se for nota nova, cita-as.")
        print()
        for r in vizinhas[:6]:
            print(f"- `{r['ref']}` ({r['tipo']}/{r['dominio']}) — {r['titulo']}")
        print()

    print("## Como decidir")
    print()
    print("1. **Enriquecer** — o assunto já tem dona e o que ela diz continua")
    print("   verdadeiro. Acrescenta ao corpo; se mediste alguma coisa, deixa um")
    print("   bloco `> Verificado a <hoje>`.")
    print("2. **Suceder** — o assunto já tem dona mas o que ela diz deixou de ser")
    print("   verdade. Escreve a sucessora, fecha a antiga com `valid_to` e")
    print("   aponta-lhe `superseded_by`. **Não reescrevas por cima**: é isso que")
    print("   permite continuar a perguntar o que era verdade antes.")
    print("3. **Criar** — assunto novo. Declara `sources: ficheiro:<caminho>` e")
    print("   cita pelo menos uma nota vizinha com `[[slug]]`, senão nasce órfã.")
    print()
    print("Nada disto se escreve de passagem: delega no agente `bibliotecario`.")
    print("Depois de escrever, `mem.py indexar` e regista a decisão com")
    print("`capturar.py registar <tipo> <dominio> aprovada --slug <nota>`.")
    return 0


def cmd_estado(args) -> None:
    db = conectar()
    criar_esquema(db)
    pares = list(db.execute(
        "SELECT tipo, padrao, COUNT(*) n FROM capture_log"
        " GROUP BY tipo, padrao ORDER BY n DESC"))
    if not pares:
        print("Ainda sem histórico de capturas.")
        print(f"Tudo passa por confirmação até {MIN_AMOSTRA} decisões por categoria.")
        return

    print(f"{'tipo':<14}{'domínio':<12}{'n':>4}{'taxa':>7}  modo")
    print("-" * 62)
    for p in pares:
        c = confianca(db, p["tipo"], p["padrao"])
        modo = "AUTOMÁTICO" if c["auto"] else "pergunta"
        print(f"{p['tipo']:<14}{p['padrao']:<12}{c['n']:>4}"
              f"{c['taxa']:>7.0%}  {modo} — {c['porque']}")

    total = db.execute("SELECT COUNT(*) FROM capture_log").fetchone()[0]
    autos = db.execute(
        "SELECT COUNT(*) FROM capture_log WHERE decisao='auto'").fetchone()[0]
    print(f"\n{total} decisões registadas, {autos} gravadas sem perguntar")


def cmd_decidir(args) -> None:
    db = conectar()
    criar_esquema(db)
    c = confianca(db, args.tipo, args.dominio)
    print("auto" if c["auto"] else "perguntar")
    print(f"  {c['porque']}", file=sys.stderr)
    sys.exit(0 if c["auto"] else 2)


def cmd_registar(args) -> None:
    db = conectar()
    criar_esquema(db)
    db.execute(
        "INSERT INTO capture_log(ts, tipo, padrao, decisao, slug, nota)"
        " VALUES (?,?,?,?,?,?)",
        (agora(), args.tipo, args.dominio, args.decisao, args.slug, args.nota))
    db.commit()
    c = confianca(db, args.tipo, args.dominio)
    print(f"registado: {args.tipo}/{args.dominio} -> {args.decisao}")
    print(f"  {args.tipo}/{args.dominio}: {c['n']} decisões, {c['taxa']:.0%}, "
          f"{'AUTOMÁTICO' if c['auto'] else 'ainda pergunta'} ({c['porque']})")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("propor", help="o que esta sessão deixou por memorizar")
    s.add_argument("--desde", help="ref do git (por omissão: o último commit a tocar em notas/)")
    s.set_defaults(fn=cmd_propor)

    s = sub.add_parser("estado", help="confiança por categoria")
    s.set_defaults(fn=cmd_estado)

    s = sub.add_parser("decidir", help="perguntar ou gravar? (código 0=auto, 2=perguntar)")
    s.add_argument("tipo", choices=TIPOS)
    s.add_argument("dominio", choices=DOMINIOS)
    s.set_defaults(fn=cmd_decidir)

    s = sub.add_parser("registar", help="regista uma decisão do programador")
    s.add_argument("tipo", choices=TIPOS)
    s.add_argument("dominio", choices=DOMINIOS)
    s.add_argument("decisao", choices=["aprovada", "rejeitada", "editada", "auto"])
    s.add_argument("--slug")
    s.add_argument("--nota")
    s.set_defaults(fn=cmd_registar)

    args = p.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()
