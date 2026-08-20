#!/usr/bin/env python3
"""Servidor local da biblioteca de memória.

Só-leitura e determinístico: nenhum endpoint escreve, nenhum chama um LLM
para responder — a busca semântica usa os embeddings locais, e mais nada.
Serve a página de `web/` e uma API JSON por cima do mesmo índice que o CLI.

Liga a 127.0.0.1 de propósito. Isto não vai a produção; vive em dev.
"""
from __future__ import annotations

import json
import mimetypes
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

sys.path.insert(0, str(Path(__file__).parent))
from mem import BASE, DB, DOMINIOS, TIPOS, buscar, conectar  # noqa: E402
from percursos import gravar_leitura, listar, ler  # noqa: E402

WEB = BASE / "web"


# --------------------------------------------------------------- consultas
def estado(db) -> dict:
    q = lambda s, *a: db.execute(s, a).fetchone()[0]  # noqa: E731
    return {
        "notas": q("SELECT count(*) FROM notes"),
        "em_vigor": q("SELECT count(*) FROM notes WHERE valid_to IS NULL"),
        "por_tipo": {r["tipo"]: r["c"] for r in db.execute(
            "SELECT tipo, count(*) c FROM notes GROUP BY tipo ORDER BY c DESC")},
        "por_dominio": {r["dominio"]: r["c"] for r in db.execute(
            "SELECT dominio, count(*) c FROM notes GROUP BY dominio ORDER BY c DESC")},
        "fragmentos": q("SELECT count(*) FROM chunks"),
        "por_fonte": {r["fonte"]: r["c"] for r in db.execute(
            "SELECT fonte, count(*) c FROM chunks GROUP BY fonte ORDER BY c DESC")},
        "ligacoes": q("SELECT count(*) FROM note_links WHERE resolve=1"),
        "ligacoes_partidas": q("SELECT count(*) FROM note_links WHERE resolve=0"),
        "entidades": q("SELECT count(*) FROM entities"),
        "tamanho_mb": round(DB.stat().st_size / 1e6, 1) if DB.exists() else 0,
        "tipos": list(TIPOS),
        "dominios": list(DOMINIOS),
    }


def notas(db) -> list[dict]:
    graus = {r["slug"]: r["g"] for r in db.execute(
        "SELECT dst slug, count(*) g FROM note_links WHERE resolve=1 GROUP BY dst")}
    saida = []
    for r in db.execute(
            "SELECT slug, tipo, dominio, titulo, resumo, valid_from, valid_to,"
            " superseded_by, confianca FROM notes ORDER BY dominio, slug"):
        d = dict(r)
        d["citada_por"] = graus.get(r["slug"], 0)
        saida.append(d)
    return saida


def nota(db, slug: str) -> dict | None:
    r = db.execute("SELECT * FROM notes WHERE slug=?", (slug,)).fetchone()
    if not r:
        return None
    d = dict(r)
    d.pop("content_hash", None)
    d["sources"] = [dict(x) for x in db.execute(
        "SELECT kind, ref, detalhe FROM sources WHERE slug=?", (slug,))]
    d["entidades"] = [x["entidade"] for x in db.execute(
        "SELECT entidade FROM mentions WHERE slug=? ORDER BY entidade", (slug,))]
    d["liga_a"] = [dict(x) for x in db.execute(
        "SELECT dst slug, resolve FROM note_links WHERE src=? ORDER BY dst", (slug,))]
    # O título do alvo torna a lista legível sem uma segunda ida ao servidor.
    d["citada_por"] = [dict(x) for x in db.execute(
        "SELECT l.src slug, n.titulo FROM note_links l JOIN notes n ON n.slug=l.src"
        " WHERE l.dst=? AND l.resolve=1 ORDER BY l.src", (slug,))]
    d["fragmentos"] = db.execute(
        "SELECT count(*) FROM chunks WHERE fonte='nota' AND ref=?", (slug,)).fetchone()[0]
    return d


def grafo(db) -> dict:
    graus: dict[str, int] = {}
    arestas = []
    for r in db.execute("SELECT src, dst FROM note_links WHERE resolve=1"):
        arestas.append({"de": r["src"], "para": r["dst"]})
        graus[r["src"]] = graus.get(r["src"], 0) + 1
        graus[r["dst"]] = graus.get(r["dst"], 0) + 1
    nos = []
    for r in db.execute("SELECT slug, tipo, dominio, titulo, valid_to FROM notes"):
        nos.append({**dict(r), "grau": graus.get(r["slug"], 0)})
    return {"nos": nos, "arestas": arestas}


def auditar(db) -> dict:
    """A metade determinística: o que se mede sem pedir nada a um modelo."""
    partidas = [dict(r) for r in db.execute(
        "SELECT src, dst FROM note_links WHERE resolve=0 ORDER BY src")]
    sem_citacao = []
    for r in db.execute(
            "SELECT slug, titulo FROM notes WHERE valid_to IS NULL AND slug NOT IN"
            " (SELECT dst FROM note_links WHERE resolve=1) ORDER BY slug"):
        saidas = db.execute("SELECT count(*) FROM note_links WHERE src=? AND resolve=1",
                            (r["slug"],)).fetchone()[0]
        sem_citacao.append({**dict(r), "ilha": not saidas})
    return {
        "ligacoes_partidas": partidas,
        "sem_citacao": sem_citacao,
        "sem_proveniencia": [r["slug"] for r in db.execute(
            "SELECT n.slug FROM notes n LEFT JOIN sources s ON s.slug=n.slug"
            " WHERE s.slug IS NULL ORDER BY n.slug")],
        "substituidas_em_vigor": [dict(r) for r in db.execute(
            "SELECT slug, superseded_by FROM notes"
            " WHERE superseded_by IS NOT NULL AND valid_to IS NULL")],
    }


# --------------------------------------------------------------- servidor
class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, formato, *args):  # noqa: A002
        if self.server.verboso:  # type: ignore[attr-defined]
            sys.stderr.write(f"  {self.address_string()} {formato % args}\n")

    def responder(self, corpo: bytes, tipo: str, codigo: int = 200):
        self.send_response(codigo)
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(corpo)))
        # Só-leitura e local, mas não há razão para deixar embeber isto.
        self.send_header("X-Frame-Options", "DENY")
        self.end_headers()
        self.wfile.write(corpo)

    def json(self, dados, codigo: int = 200):
        self.responder(json.dumps(dados, ensure_ascii=False).encode(),
                       "application/json; charset=utf-8", codigo)

    def do_GET(self):  # noqa: N802
        url = urlparse(self.path)
        p = url.path
        args = {k: v[0] for k, v in parse_qs(url.query).items()}
        try:
            if p.startswith("/api/"):
                return self.api(p[5:], args)
            return self.estatico(p)
        except BrokenPipeError:
            pass
        except Exception as e:  # noqa: BLE001  um erro não deve derrubar o servidor
            self.json({"erro": f"{type(e).__name__}: {e}"}, 500)

    def do_POST(self):  # noqa: N802
        """MCP por HTTP: o mesmo servidor que o stdio, noutro transporte.

        A resposta é JSON simples e não SSE — chega para `tools/call`, e
        poupa a máquina de estados do streamable completo.
        """
        if urlparse(self.path).path != "/mcp":
            return self.json({"erro": "rota desconhecida"}, 404)
        try:
            n = int(self.headers.get("Content-Length", 0))
            pedido = json.loads(self.rfile.read(n) or b"{}")
        except (ValueError, json.JSONDecodeError):
            return self.json({"jsonrpc": "2.0", "id": None,
                              "error": {"code": -32700, "message": "JSON inválido"}}, 400)
        db = conectar()
        try:
            from mcp import responder  # noqa: PLC0415

            resposta = responder(pedido, db)
        finally:
            db.close()
        # Uma notificação não leva corpo: 202 e mais nada.
        if resposta is None:
            self.send_response(202)
            self.send_header("Content-Length", "0")
            self.end_headers()
            return None
        return self.json(resposta)

    def api(self, rota: str, args: dict):
        db = conectar()
        try:
            if rota == "estado":
                return self.json(estado(db))
            if rota == "notas":
                return self.json(notas(db))
            if rota == "grafo":
                return self.json(grafo(db))
            if rota == "auditar":
                return self.json(auditar(db))
            if rota == "sonhar":
                from sonhar import sonhar as _sonhar  # noqa: PLC0415

                # Desde que os duplicados passaram a ler os vectores do
                # índice em vez de os recalcular, custam décimas — vêm de
                # origem, e `?duplicados=0` é que os desliga.
                return self.json(_sonhar(db, com_duplicados=args.get("duplicados") != "0"))
            if rota == "nota":
                d = nota(db, args.get("slug", ""))
                if not d:
                    return self.json({"erro": "não existe"}, 404)
                # A leitura pendura-se na busca que a precedeu, se houver.
                gravar_leitura(db, d["slug"], "web")
                return self.json(d)
            if rota == "percursos":
                return self.json(listar(db, int(args.get("limite", 40))))
            if rota == "percurso":
                t = ler(db, int(args.get("id", 0)))
                return self.json(t) if t else self.json({"erro": "não existe"}, 404)
            if rota == "buscar":
                pergunta = args.get("q", "").strip()
                if not pergunta:
                    return self.json([])
                return self.json(buscar(
                    db, pergunta,
                    int(args.get("limite", 12)),
                    args.get("as_of") or None,
                    args.get("tipo") or None,
                    args.get("incluir_expirado") == "1",
                    args.get("dominio") or None,
                    origem="web"))
            return self.json({"erro": "rota desconhecida"}, 404)
        finally:
            db.close()

    def estatico(self, p: str):
        nome = "index.html" if p in ("/", "") else p.lstrip("/")
        # Sandbox: o caminho resolvido tem de continuar dentro de web/.
        alvo = (WEB / nome).resolve()
        if not str(alvo).startswith(str(WEB.resolve())) or not alvo.is_file():
            return self.responder(b"nao encontrado", "text/plain; charset=utf-8", 404)
        tipo = mimetypes.guess_type(alvo.name)[0] or "application/octet-stream"
        if tipo.startswith("text/") or tipo.endswith(("javascript", "json")):
            tipo += "; charset=utf-8"
        self.responder(alvo.read_bytes(), tipo)


def servir(porta: int = 7373, host: str = "127.0.0.1", verboso: bool = False):
    if not DB.exists():
        print("índice inexistente — correr `mem.py reconstruir` primeiro", file=sys.stderr)
        return 1
    srv = ThreadingHTTPServer((host, porta), Handler)
    srv.verboso = verboso  # type: ignore[attr-defined]
    with conectar() as db:
        e = estado(db)
    print(f"MCP em http://{host}:{porta}/mcp")
    print(f"Memória em http://{host}:{porta}"
          f"   ({e['notas']} notas, {e['ligacoes']} ligações, {e['fragmentos']} fragmentos)")
    print("Ctrl-C para parar.")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nparado")
    return 0


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--porta", type=int, default=7373)
    ap.add_argument("--host", default="127.0.0.1",
                    help="127.0.0.1 por omissão; não expor sem pensar duas vezes")
    ap.add_argument("-v", "--verboso", action="store_true")
    a = ap.parse_args()
    sys.exit(servir(a.porta, a.host, a.verboso))
