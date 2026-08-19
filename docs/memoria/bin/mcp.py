#!/usr/bin/env python3
"""Servidor MCP da biblioteca de memória — o que a tira deste repositório.

JSON-RPC 2.0 sobre stdio, escrito à mão: são cerca de duzentas linhas e zero
dependências, o que mantém a promessa de o motor viajar sozinho para outro
projeto sem arrastar uma cadeia de pacotes atrás.

  claude mcp add memoria -- /caminho/docs/memoria/.venv/bin/python \\
      /caminho/docs/memoria/bin/mcp.py

Com `MEM_BIBLIOTECA` e `MEM_PROJETO` no ambiente, o mesmo binário serve
qualquer biblioteca — é assim que se chega a ter mais do que um centro de
memória.

**A semente.** Um cliente que só veja quatro nomes de ferramenta nunca ganha
o instinto de consultar a memória. Por isso o `initialize` devolve, no campo
`instructions`, um retrato do que a biblioteca contém — e a descrição da
ferramenta de procura repete-o, que é o canal que todos os clientes carregam.
A ideia é do understory e é das melhores que lá estão.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from mem import BASE, DOMINIOS, TIPOS, buscar, conectar  # noqa: E402

VERSAO_PROTOCOLO = "2025-06-18"


# ------------------------------------------------------------------ semente
def semente(db) -> str:
    """Retrato curto da biblioteca, para o modelo saber que ela existe."""
    n = db.execute("SELECT count(*) FROM notes WHERE valid_to IS NULL").fetchone()[0]
    frag = db.execute("SELECT count(*) FROM chunks").fetchone()[0]
    dom = ", ".join(f"{r['dominio']} ({r['c']})" for r in db.execute(
        "SELECT dominio, count(*) c FROM notes WHERE valid_to IS NULL"
        " GROUP BY dominio ORDER BY c DESC"))
    recentes = [f"- {r['titulo']}" for r in db.execute(
        "SELECT titulo FROM notes WHERE valid_to IS NULL"
        " ORDER BY valid_from DESC LIMIT 8")]
    return (
        f"Memória do projeto em {BASE}: {n} notas em vigor e {frag} fragmentos "
        f"indexados (notas, documentos, conversas e commits).\n\n"
        f"Domínios: {dom}.\n\n"
        f"Notas mais recentes:\n" + "\n".join(recentes) + "\n\n"
        "Consulta esta memória ANTES de responder a perguntas sobre a história "
        "do projeto, decisões tomadas, o estado de uma frente de trabalho, ou "
        "'isto já foi discutido?'. Os factos são datados: usa `as_of` para "
        "saber o que era verdade numa data, em vez do que é verdade hoje."
    )


# ---------------------------------------------------------------- ferramentas
def _ferramentas(semente_txt: str) -> list[dict]:
    return [
        {
            "name": "memoria_procurar",
            "description":
                "Procura na memória do projeto (BM25 + vectorial, fundidos por "
                "RRF). Cobre notas curadas, documentos, transcrições de "
                "conversas e commits.\n\n" + semente_txt,
            "inputSchema": {
                "type": "object",
                "properties": {
                    "pergunta": {"type": "string",
                                 "description": "em linguagem natural, PT ou EN"},
                    "limite": {"type": "integer", "default": 8},
                    "dominio": {"type": "string", "enum": list(DOMINIOS)},
                    "tipo": {"type": "string", "enum": list(TIPOS)},
                    "as_of": {"type": "string",
                              "description": "AAAA-MM-DD: o que era verdade nessa data"},
                    "incluir_expirado": {"type": "boolean", "default": False},
                },
                "required": ["pergunta"],
            },
        },
        {
            "name": "memoria_ler",
            "description": "Lê uma nota inteira pelo slug, com a vigência, a "
                           "proveniência e as ligações de entrada e saída.",
            "inputSchema": {
                "type": "object",
                "properties": {"slug": {"type": "string"}},
                "required": ["slug"],
            },
        },
        {
            "name": "memoria_estado",
            "description": "Números da biblioteca: notas por tipo e domínio, "
                           "fragmentos por fonte, ligações, entidades.",
            "inputSchema": {"type": "object", "properties": {}},
        },
        {
            "name": "memoria_vizinhanca",
            "description": "Que notas citam esta e quais ela cita — a "
                           "vizinhança no grafo, para seguir um fio.",
            "inputSchema": {
                "type": "object",
                "properties": {"slug": {"type": "string"}},
                "required": ["slug"],
            },
        },
        {
            "name": "memoria_consolidar",
            "description":
                "Sinais determinísticos do que há a consolidar: ligações "
                "partidas, órfãs, duplicados prováveis, notas grandes demais, "
                "estados vencidos. Mede e aponta; não escreve. Nesta "
                "biblioteca nada se apaga — o que deixou de ser verdade "
                "fecha-se com valid_to e aponta superseded_by.",
            "inputSchema": {
                "type": "object",
                "properties": {"duplicados": {
                    "type": "boolean", "default": False,
                    "description": "custa uma passagem de embeddings"}},
            },
        },
    ]


def executar(db, nome: str, args: dict) -> str:
    if nome == "memoria_procurar":
        res = buscar(db, args["pergunta"], int(args.get("limite", 8)),
                     args.get("as_of"), args.get("tipo"),
                     bool(args.get("incluir_expirado", False)),
                     args.get("dominio"), origem="mcp")
        if not res:
            return "Nada encontrado."
        partes = []
        for r in res:
            cab = (f"[{'L' if r['lex'] else '.'}{'S' if r['sem'] else '.'}] "
                   f"{r['ponto']:.4f}  {r['tipo'] or r['fonte']}"
                   f"{'/' + r['dominio'] if r['dominio'] else ''}  {r['ref']}")
            if r["valid_to"]:
                cab += f"  [EXPIRADA em {r['valid_to']}"
                cab += f", ver {r['superseded_by']}]" if r["superseded_by"] else "]"
            partes.append(f"{cab}\n{r['titulo']}\n{' '.join(r['texto'].split())[:600]}")
        return ("L=achado por termo exacto, S=por semelhança; ambos é sinal forte.\n\n"
                + "\n\n---\n\n".join(partes))

    if nome == "memoria_ler":
        r = db.execute("SELECT * FROM notes WHERE slug=?", (args["slug"],)).fetchone()
        if not r:
            return f"Não existe nota com o slug '{args['slug']}'."
        vig = (f"em vigor desde {r['valid_from']}" if not r["valid_to"]
               else f"EXPIRADA em {r['valid_to']}"
                    + (f", substituída por {r['superseded_by']}" if r["superseded_by"] else ""))
        fontes = ", ".join(f"{x['kind']}:{x['ref']}" for x in db.execute(
            "SELECT kind, ref FROM sources WHERE slug=?", (args["slug"],))) or "—"
        return (f"# {r['titulo']}\n"
                f"{r['tipo']}/{r['dominio']} · {vig} · proveniência: {fontes}\n\n"
                f"{r['corpo']}")

    if nome == "memoria_estado":
        q = lambda s: db.execute(s).fetchone()[0]  # noqa: E731
        dom = "\n".join(f"  {r['dominio']:<12} {r['c']}" for r in db.execute(
            "SELECT dominio, count(*) c FROM notes GROUP BY dominio ORDER BY c DESC"))
        fon = "\n".join(f"  {r['fonte']:<12} {r['c']}" for r in db.execute(
            "SELECT fonte, count(*) c FROM chunks GROUP BY fonte ORDER BY c DESC"))
        return (f"notas {q('SELECT count(*) FROM notes')} "
                f"({q('SELECT count(*) FROM notes WHERE valid_to IS NULL')} em vigor)\n"
                f"{dom}\nfragmentos {q('SELECT count(*) FROM chunks')}\n{fon}\n"
                f"ligações {q('SELECT count(*) FROM note_links WHERE resolve=1')} · "
                f"entidades {q('SELECT count(*) FROM entities')}")

    if nome == "memoria_vizinhanca":
        slug = args["slug"]
        sai = [f"  {x['dst']}" + ("" if x["resolve"] else "   (não existe)")
               for x in db.execute(
                   "SELECT dst, resolve FROM note_links WHERE src=? ORDER BY dst", (slug,))]
        entra = [f"  {x['src']} — {x['titulo']}" for x in db.execute(
            "SELECT l.src, n.titulo FROM note_links l JOIN notes n ON n.slug=l.src"
            " WHERE l.dst=? AND l.resolve=1 ORDER BY l.src", (slug,))]
        return (f"{slug}\ncita:\n" + ("\n".join(sai) or "  —")
                + "\ncitada por:\n" + ("\n".join(entra) or "  ninguém"))

    if nome == "memoria_consolidar":
        from sonhar import relatorio, sonhar  # noqa: PLC0415

        return relatorio(sonhar(db, com_duplicados=bool(args.get("duplicados"))))

    raise ValueError(f"ferramenta desconhecida: {nome}")


# ------------------------------------------------------------------ JSON-RPC
def responder(pedido: dict, db) -> dict | None:
    metodo = pedido.get("method", "")
    pid = pedido.get("id")

    # Notificações não levam resposta — e responder a uma parte o cliente.
    if pid is None:
        return None

    def ok(resultado):
        return {"jsonrpc": "2.0", "id": pid, "result": resultado}

    def erro(codigo, msg):
        return {"jsonrpc": "2.0", "id": pid, "error": {"code": codigo, "message": msg}}

    if metodo == "initialize":
        return ok({
            "protocolVersion": VERSAO_PROTOCOLO,
            "capabilities": {"tools": {}},
            "serverInfo": {"name": "memoria", "version": "1.0.0"},
            "instructions": semente(db),
        })

    if metodo == "tools/list":
        return ok({"tools": _ferramentas(semente(db))})

    if metodo == "tools/call":
        p = pedido.get("params") or {}
        try:
            texto = executar(db, p.get("name", ""), p.get("arguments") or {})
            return ok({"content": [{"type": "text", "text": texto}]})
        except Exception as e:  # noqa: BLE001  o erro vai ao modelo, não mata o servidor
            return ok({"content": [{"type": "text", "text": f"Erro: {e}"}],
                       "isError": True})

    if metodo == "ping":
        return ok({})

    return erro(-32601, f"método não suportado: {metodo}")


def stdio() -> int:
    db = conectar()
    for linha in sys.stdin:
        linha = linha.strip()
        if not linha:
            continue
        try:
            pedido = json.loads(linha)
        except json.JSONDecodeError:
            continue
        resposta = responder(pedido, db)
        if resposta is not None:
            sys.stdout.write(json.dumps(resposta, ensure_ascii=False) + "\n")
            sys.stdout.flush()
    return 0


if __name__ == "__main__":
    sys.exit(stdio())
