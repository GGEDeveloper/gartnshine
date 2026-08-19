#!/usr/bin/env python3
"""Percursos: o registo de como se chegou a uma resposta.

Uma busca abre um percurso e escreve o que encontrou. As leituras que se lhe
seguem penduram-se no percurso aberto mais recente — é o que permite depois
desenhar, por cima do grafo, o caminho que a pergunta percorreu.

Isto **não é memória**: é telemetria sobre o uso da memória. Vive só no índice
descartável, e apagá-lo não perde nenhum facto.
"""
from __future__ import annotations

import json
import os
from datetime import datetime, timedelta, timezone

# Uma leitura muito depois da busca já não pertence àquela pergunta. Meia hora
# é generoso para uma sessão de trabalho e curto para não colar percursos
# distintos um ao outro.
JANELA = timedelta(minutes=30)

# Telemetria não pode crescer sem fim dentro do índice.
LIMITE = 400


def sessao() -> str:
    """Identificador da sessão, quando o hook o souber dizer."""
    return os.environ.get("MEM_SESSAO") or "avulso"


def _agora() -> datetime:
    return datetime.now(timezone.utc)


def notacao(pergunta: str, achados: list[dict], aberturas: list[str]) -> str:
    """Uma linha que se lê de relance, no espírito da do understory.

    ?"prata castanha" → capas-fundo-frio[LS] recorte-prata[.S] ⇢ abriu:capas-fundo-frio
    """
    p = pergunta if len(pergunta) <= 42 else pergunta[:41] + "…"
    achou = " ".join(
        f"{a['ref'].split('/')[-1]}[{'L' if a['lex'] else '.'}{'S' if a['sem'] else '.'}]"
        for a in achados[:5])
    linha = f'?"{p}" → {achou or "nada"}'
    if len(achados) > 5:
        linha += f" +{len(achados) - 5}"
    if aberturas:
        linha += " ⇢ " + " ".join(f"abriu:{a.split('/')[-1]}" for a in aberturas)
    return linha


def gravar_busca(db, pergunta: str, resultados: list[dict], filtros: dict,
                 duracao_ms: int, origem: str = "cli") -> int:
    """Abre um percurso com o que a busca devolveu. Devolve o id."""
    cur = db.execute(
        "INSERT INTO traces(ts, sessao, origem, pergunta, filtros, duracao_ms,"
        " achados, notacao) VALUES (?,?,?,?,?,?,?,?)",
        (_agora().isoformat(timespec="seconds"), sessao(), origem, pergunta,
         json.dumps({k: v for k, v in filtros.items() if v}, ensure_ascii=False),
         duracao_ms, len(resultados), notacao(pergunta, resultados, [])))
    tid = cur.lastrowid
    db.executemany(
        "INSERT INTO trace_passos(trace, ord, acao, fonte, ref, posicao, ponto, canal)"
        " VALUES (?,?,'achou',?,?,?,?,?)",
        [(tid, i, r["fonte"], r["ref"], i + 1, r["ponto"],
          ("L" if r["lex"] else ".") + ("S" if r["sem"] else "."))
         for i, r in enumerate(resultados)])
    _podar(db)
    db.commit()
    return tid


def gravar_leitura(db, slug: str, origem: str = "web") -> int | None:
    """Pendura uma leitura no percurso aberto mais recente desta sessão.

    Sem busca recente não há percurso: uma leitura solta não inventa um, senão
    o registo enchia-se de percursos de um passo só que nada explicam.
    """
    limite = (_agora() - JANELA).isoformat(timespec="seconds")
    r = db.execute(
        "SELECT id FROM traces WHERE sessao=? AND ts>=? ORDER BY id DESC LIMIT 1",
        (sessao(), limite)).fetchone()
    if not r:
        return None
    tid = r["id"]

    # Reabrir a mesma nota em seguida não é um passo novo.
    ultimo = db.execute(
        "SELECT ref, acao FROM trace_passos WHERE trace=? ORDER BY ord DESC LIMIT 1",
        (tid,)).fetchone()
    if ultimo and ultimo["acao"] == "abriu" and ultimo["ref"] == slug:
        return tid

    ord_ = db.execute("SELECT count(*) FROM trace_passos WHERE trace=?",
                      (tid,)).fetchone()[0]
    db.execute("INSERT INTO trace_passos(trace, ord, acao, fonte, ref)"
               " VALUES (?,?,'abriu','nota',?)", (tid, ord_, slug))

    t = db.execute("SELECT pergunta FROM traces WHERE id=?", (tid,)).fetchone()
    achados = [dict(x) for x in db.execute(
        "SELECT ref, canal FROM trace_passos WHERE trace=? AND acao='achou'"
        " ORDER BY ord", (tid,))]
    aberturas = [x["ref"] for x in db.execute(
        "SELECT ref FROM trace_passos WHERE trace=? AND acao='abriu' ORDER BY ord",
        (tid,))]
    db.execute("UPDATE traces SET notacao=? WHERE id=?", (notacao(
        t["pergunta"],
        [{"ref": a["ref"], "lex": "L" in a["canal"], "sem": "S" in a["canal"]}
         for a in achados],
        aberturas), tid))
    db.commit()
    return tid


def _podar(db) -> None:
    db.execute("DELETE FROM traces WHERE id NOT IN"
               " (SELECT id FROM traces ORDER BY id DESC LIMIT ?)", (LIMITE,))
    db.execute("DELETE FROM trace_passos WHERE trace NOT IN (SELECT id FROM traces)")


def listar(db, limite: int = 40) -> list[dict]:
    return [dict(r) for r in db.execute(
        "SELECT id, ts, sessao, origem, pergunta, filtros, duracao_ms, achados,"
        " notacao FROM traces ORDER BY id DESC LIMIT ?", (limite,))]


def ler(db, tid: int) -> dict | None:
    t = db.execute("SELECT * FROM traces WHERE id=?", (tid,)).fetchone()
    if not t:
        return None
    return {**dict(t), "passos": [dict(r) for r in db.execute(
        "SELECT ord, acao, fonte, ref, posicao, ponto, canal FROM trace_passos"
        " WHERE trace=? ORDER BY ord", (tid,))]}
