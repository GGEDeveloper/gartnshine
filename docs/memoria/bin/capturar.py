#!/usr/bin/env python3
"""Captura com confiança progressiva.

No início, tudo passa por confirmação. À medida que um par (tipo, domínio)
acumula aprovações sem rejeições, deixa de perguntar e passa a gravar
directamente. Uma rejeição faz recuar a confiança desse par — o sistema
volta a perguntar onde já errou.

  capturar.py estado                    mostra a confiança por categoria
  capturar.py decidir <tipo> <dominio>  diz se deve perguntar ou gravar
  capturar.py registar <tipo> <dominio> <decisao> [--slug S] [--nota N]

`decisao` é uma de: aprovada, rejeitada, editada, auto.
'editada' conta como meia aprovação: o conteúdo servia, a forma não.
"""
from __future__ import annotations

import argparse
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from mem import DOMINIOS, TIPOS, conectar, criar_esquema  # noqa: E402

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
