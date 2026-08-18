#!/usr/bin/env python3
"""Biblioteca de memória do projeto Gonzaga's Art & Shine.

A fonte de verdade são os ficheiros markdown em docs/memoria/notas/.
Esta ferramenta mantém um índice derivado (SQLite) que combina BM25,
similaridade vetorial e um grafo de entidades datado.

  mem.py reconstruir        apaga e reindexa tudo a partir dos ficheiros
  mem.py indexar            reindexa apenas o que mudou
  mem.py buscar "..."       busca híbrida
  mem.py auditar            contradições, obsolescência e órfãos
  mem.py estado             números do índice

O índice é descartável: se corromper, `reconstruir` regenera-o.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sqlite3
import struct
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import date, datetime, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[3]
BASE = RAIZ / "docs" / "memoria"
NOTAS = BASE / "notas"
DB = BASE / "estado" / "indice.db"
ESQUEMA = Path(__file__).parent / "esquema.sql"

OLLAMA = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
MODELO = os.environ.get("MEM_EMBED_MODEL", "embeddinggemma")
DIMS = 768

TIPOS = ("decisao", "facto", "estado", "procedimento",
         "entidade", "preferencia", "referencia")

# Eixo ortogonal ao tipo. 'memoria' é o segmento meta: lições e
# procedimentos sobre o próprio funcionamento desta biblioteca.
DOMINIOS = ("memoria", "loja", "catalogo", "fotografia", "marca", "design",
            "infra", "bd", "seo", "admin", "negocio", "geral")


# --------------------------------------------------------------- utilidades
def agora() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def sha(texto: str) -> str:
    return hashlib.sha256(texto.encode("utf-8")).hexdigest()[:16]


def conectar() -> sqlite3.Connection:
    import sqlite_vec

    DB.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DB)
    db.row_factory = sqlite3.Row
    db.enable_load_extension(True)
    sqlite_vec.load(db)
    db.enable_load_extension(False)
    return db


def criar_esquema(db: sqlite3.Connection) -> None:
    db.executescript(ESQUEMA.read_text(encoding="utf-8"))
    # A tabela vec0 vive fora do esquema.sql porque depende da extensão
    # estar carregada nesta ligação.
    db.execute(
        f"CREATE VIRTUAL TABLE IF NOT EXISTS chunks_vec "
        f"USING vec0(chunk_id INTEGER PRIMARY KEY, embedding float[{DIMS}])"
    )
    db.execute(
        "INSERT OR REPLACE INTO meta(chave, valor) VALUES ('modelo_embed', ?)",
        (MODELO,),
    )
    db.commit()


# --------------------------------------------------------------- embeddings
# O EmbeddingGemma espera prefixos próprios; medimos ~0,50 -> ~0,73 de
# similaridade no alvo ao aplicá-los, por isso não são opcionais.
def _prefixar(textos: list[str], tipo: str, titulos: list[str] | None = None) -> list[str]:
    if tipo == "query":
        return [f"task: search result | query: {t}" for t in textos]
    tits = titulos or ["none"] * len(textos)
    return [f"title: {ti or 'none'} | text: {t}" for ti, t in zip(tits, textos)]


def embed(textos: list[str], tipo: str = "doc",
          titulos: list[str] | None = None, lote: int = 16) -> list[list[float]]:
    if not textos:
        return []
    saida: list[list[float]] = []
    entradas = _prefixar(textos, tipo, titulos)
    for i in range(0, len(entradas), lote):
        parte = entradas[i : i + lote]
        req = urllib.request.Request(
            f"{OLLAMA}/api/embed",
            json.dumps({"model": MODELO, "input": parte}).encode(),
            {"Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                saida.extend(json.load(r)["embeddings"])
        except urllib.error.URLError as e:
            sys.exit(
                f"erro: nao consegui falar com o Ollama em {OLLAMA} ({e}).\n"
                f"       arranca-o com `ollama serve` e confirma `ollama pull {MODELO}`."
            )
    return saida


def empacotar(v: list[float]) -> bytes:
    return struct.pack(f"{len(v)}f", *v)


# --------------------------------------------------------------- front-matter
def ler_nota(caminho: Path) -> dict | None:
    """Lê uma nota markdown com front-matter YAML simples."""
    texto = caminho.read_text(encoding="utf-8")
    if not texto.startswith("---"):
        return None
    _, _, resto = texto.partition("---\n")
    fm_txt, _, corpo = resto.partition("\n---")
    corpo = corpo.lstrip("\n")

    meta: dict = {}
    chave_lista = None
    for linha in fm_txt.splitlines():
        if not linha.strip() or linha.lstrip().startswith("#"):
            continue
        if re.match(r"^\s+-\s", linha) and chave_lista:
            meta[chave_lista].append(linha.split("-", 1)[1].strip().strip("\"'"))
            continue
        if ":" not in linha:
            continue
        k, _, v = linha.partition(":")
        k, v = k.strip(), v.strip().strip("\"'")
        if not v:
            chave_lista = k
            meta[k] = []
        else:
            chave_lista = None
            meta[k] = v

    # `chave:` sem valor abre uma lista; se nada se lhe seguir, é campo vazio.
    LISTAS = ("entities", "sources", "relations", "tags")
    for k, v in list(meta.items()):
        if isinstance(v, list) and not v and k not in LISTAS:
            meta[k] = None
    for k in LISTAS:
        if not isinstance(meta.get(k), list):
            meta[k] = [meta[k]] if meta.get(k) else []

    meta["corpo"] = corpo.strip()
    meta.setdefault("slug", caminho.stem)
    meta.setdefault("path", str(caminho.relative_to(RAIZ)))
    return meta


# Uma entidade é algo que se pode referir por nome. Sufixos de ficheiro,
# fragmentos de caminho e literais de cor entraram por extracção ingénua
# e só sujam o grafo.
_ENTIDADE_LIXO = re.compile(
    r"^-"                       # sufixos: -medium.jpg, -hero-1920.jpg
    r"|^[/.]"                   # caminhos soltos: /dados.js
    r"|^#[0-9A-Fa-f]{3,8}$"     # cores
    r"|^\d+$"                   # números soltos
)


def entidade_valida(nome: str) -> bool:
    nome = (nome or "").strip()
    if len(nome) < 3 or len(nome) > 80:
        return False
    return not _ENTIDADE_LIXO.search(nome)


def normalizar_entidade(nome: str) -> str:
    """Caminhos longos reduzem-se ao nome do ficheiro; o resto fica como está."""
    nome = (nome or "").strip().strip("`\"'")
    if "/" in nome and nome.count("/") > 1:
        nome = nome.rsplit("/", 1)[-1]
    return nome


def fragmentar(texto: str, alvo: int = 1200, sobrep: int = 150) -> list[str]:
    """Corta por parágrafos, respeitando o limite de contexto do modelo."""
    paras = [p.strip() for p in re.split(r"\n\s*\n", texto) if p.strip()]
    blocos, atual = [], ""
    for p in paras:
        if len(atual) + len(p) + 2 <= alvo:
            atual = f"{atual}\n\n{p}" if atual else p
        else:
            if atual:
                blocos.append(atual)
            atual = (atual[-sobrep:] + "\n\n" + p) if atual and sobrep else p
    if atual:
        blocos.append(atual)
    return blocos or [texto[:alvo]]


# --------------------------------------------------------------- indexação
def _guardar_chunks(db, fonte, ref, itens, data=None, keywords=None):
    """itens: lista de (ord, titulo, texto). Substitui os anteriores do ref."""
    antigos = [r[0] for r in db.execute(
        "SELECT id FROM chunks WHERE fonte=? AND ref=?", (fonte, ref))]
    if antigos:
        db.executemany("DELETE FROM chunks_vec WHERE chunk_id=?",
                       [(i,) for i in antigos])
        db.execute("DELETE FROM chunks WHERE fonte=? AND ref=?", (fonte, ref))

    ids, textos, titulos = [], [], []
    for ordem, titulo, texto in itens:
        cur = db.execute(
            "INSERT INTO chunks(fonte, ref, ord, titulo, texto, keywords, data, hash)"
            " VALUES (?,?,?,?,?,?,?,?)",
            (fonte, ref, ordem, titulo, texto, keywords, data, sha(texto)),
        )
        ids.append(cur.lastrowid)
        textos.append(f"{texto}\n{keywords}" if keywords else texto)
        titulos.append(titulo)

    for cid, vec in zip(ids, embed(textos, "doc", titulos)):
        db.execute("INSERT INTO chunks_vec(chunk_id, embedding) VALUES (?,?)",
                   (cid, empacotar(vec)))
    return len(ids)


def indexar_notas(db, forcar=False) -> int:
    NOTAS.mkdir(parents=True, exist_ok=True)
    vistos, n = set(), 0
    for f in sorted(NOTAS.rglob("*.md")):
        meta = ler_nota(f)
        if not meta:
            print(f"  aviso: {f.name} sem front-matter, ignorada")
            continue
        slug = meta["slug"]
        vistos.add(slug)
        h = sha(meta["corpo"] + json.dumps(sorted(meta.items()), default=str))

        anterior = db.execute("SELECT content_hash FROM notes WHERE slug=?",
                              (slug,)).fetchone()
        if anterior and anterior["content_hash"] == h and not forcar:
            continue

        tipo = meta.get("tipo", "facto")
        if tipo not in TIPOS:
            print(f"  aviso: {slug} tem tipo '{tipo}' desconhecido, tratada como facto")
            tipo = "facto"

        dominio = meta.get("dominio", "geral")
        if dominio not in DOMINIOS:
            print(f"  aviso: {slug} tem dominio '{dominio}' desconhecido")

        db.execute(
            "INSERT OR REPLACE INTO notes(slug, path, tipo, dominio, titulo, resumo,"
            " corpo, keywords, valid_from, valid_to, ingested_at, superseded_by,"
            " confianca, content_hash, mtime) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (slug, meta["path"], tipo, dominio, meta.get("titulo", slug),
             meta.get("resumo"), meta["corpo"], meta.get("keywords"),
             meta.get("valid_from"), meta.get("valid_to"),
             meta.get("ingested_at", agora()), meta.get("superseded_by"),
             float(meta.get("confianca", 1.0)), h, f.stat().st_mtime),
        )

        db.execute("DELETE FROM sources WHERE slug=?", (slug,))
        for s in meta.get("sources", []) or []:
            kind, _, ref = str(s).partition(":")
            db.execute("INSERT INTO sources(slug, kind, ref) VALUES (?,?,?)",
                       (slug, kind.strip() or "inferido", ref.strip()))

        db.execute("DELETE FROM mentions WHERE slug=?", (slug,))
        entidades_nota = []
        for e in meta.get("entities", []) or []:
            e = normalizar_entidade(e)
            if not entidade_valida(e):
                continue
            entidades_nota.append(e)
            db.execute("INSERT OR IGNORE INTO entities(nome) VALUES (?)", (e,))
            db.execute("INSERT INTO mentions(entidade, slug) VALUES (?,?)", (e, slug))

        db.execute("DELETE FROM relations WHERE slug=?", (slug,))
        for r in meta.get("relations", []) or []:
            partes = [normalizar_entidade(p) for p in str(r).split("|")]
            if len(partes) >= 3 and partes[0] and partes[2]:
                db.execute(
                    "INSERT INTO relations(src, rel, dst, slug, valid_from,"
                    " valid_to, ingested_at) VALUES (?,?,?,?,?,?,?)",
                    (partes[0], partes[1], partes[2], slug,
                     meta.get("valid_from"), meta.get("valid_to"), agora()),
                )

        # Co-menção: entidades citadas pela mesma nota estão relacionadas, mesmo
        # que ninguém tenha escrito a relação à mão. Dá ao grafo o que lhe
        # faltava — sem isto, 91% das entidades ficavam sem qualquer ligação.
        for i, a in enumerate(entidades_nota):
            for b in entidades_nota[i + 1:]:
                db.execute(
                    "INSERT INTO relations(src, rel, dst, slug, valid_from,"
                    " valid_to, ingested_at) VALUES (?,?,?,?,?,?,?)",
                    (a, "co_ocorre_em", b, slug,
                     meta.get("valid_from"), meta.get("valid_to"), agora()),
                )

        itens = [(i, meta.get("titulo", slug), b)
                 for i, b in enumerate(fragmentar(meta["corpo"]))]
        _guardar_chunks(db, "nota", slug, itens,
                        data=meta.get("valid_from"), keywords=meta.get("keywords"))
        n += 1

    orfas = [r["slug"] for r in db.execute("SELECT slug FROM notes")
             if r["slug"] not in vistos]
    for slug in orfas:
        db.execute("DELETE FROM notes WHERE slug=?", (slug,))
        db.execute("DELETE FROM chunks WHERE fonte='nota' AND ref=?", (slug,))
    db.commit()
    return n


# --------------------------------------------------------------- busca
def _rrf(listas: list[list[int]], k: int = 60) -> dict[int, float]:
    """Reciprocal Rank Fusion: funde rankings sem calibrar escalas."""
    pontos: dict[int, float] = {}
    for lista in listas:
        for pos, cid in enumerate(lista):
            pontos[cid] = pontos.get(cid, 0.0) + 1.0 / (k + pos + 1)
    return pontos


def _fts_query(pergunta: str) -> str:
    termos = re.findall(r"[\wÀ-ÿ][\wÀ-ÿ\-_]{1,}", pergunta.lower())
    stop = {"que", "para", "com", "uma", "dos", "das", "por", "nao", "não",
            "como", "onde", "quando", "porque", "qual", "quais", "the", "and"}
    uteis = [t for t in termos if t not in stop]
    return " OR ".join(f'"{t}"' for t in uteis) if uteis else '""'


def buscar(db, pergunta: str, limite: int = 8, as_of: str | None = None,
           tipo: str | None = None, incluir_expirado: bool = False,
           dominio: str | None = None) -> list[dict]:
    # via lexical (BM25) — ganha em identificadores exactos: PPU0080, migração 014
    lex: list[int] = []
    try:
        lex = [r["rowid"] for r in db.execute(
            "SELECT rowid FROM chunks_fts WHERE chunks_fts MATCH ?"
            " ORDER BY rank LIMIT 60", (_fts_query(pergunta),))]
    except sqlite3.OperationalError:
        pass

    # via semântica — ganha na flexão e no sinónimo ("acastanhada" -> "castanha")
    sem: list[int] = []
    qv = embed([pergunta], "query")
    if qv:
        sem = [r["chunk_id"] for r in db.execute(
            "SELECT chunk_id FROM chunks_vec WHERE embedding MATCH ?"
            " AND k = 60 ORDER BY distance", (empacotar(qv[0]),))]

    pontos = _rrf([lex, sem])
    if not pontos:
        return []

    ordenados = sorted(pontos.items(), key=lambda x: -x[1])
    saida: list[dict] = []
    ja_vistos: set[tuple[str, str]] = set()   # uma entrada por nota/documento
    for cid, ponto in ordenados:
        linha = db.execute(
            "SELECT c.*, n.tipo, n.dominio, n.titulo AS n_titulo, n.valid_from,"
            " n.valid_to, n.superseded_by, n.confianca FROM chunks c"
            " LEFT JOIN notes n ON n.slug = c.ref AND c.fonte='nota'"
            " WHERE c.id=?", (cid,)).fetchone()
        if not linha:
            continue
        if tipo and linha["tipo"] != tipo:
            continue
        if dominio and linha["dominio"] != dominio:
            continue
        # Filtro bi-temporal: o que era verdade numa data.
        if as_of:
            vf, vt = linha["valid_from"], linha["valid_to"]
            if vf and vf > as_of:
                continue
            if vt and vt <= as_of:
                continue
        elif not incluir_expirado and linha["valid_to"]:
            continue

        chave = (linha["fonte"], linha["ref"])
        if chave in ja_vistos:
            continue
        ja_vistos.add(chave)

        saida.append({
            "id": cid, "fonte": linha["fonte"], "ref": linha["ref"],
            "tipo": linha["tipo"], "dominio": linha["dominio"],
            "titulo": linha["n_titulo"] or linha["titulo"],
            "texto": linha["texto"], "ponto": ponto,
            "valid_from": linha["valid_from"], "valid_to": linha["valid_to"],
            "superseded_by": linha["superseded_by"],
            "lex": cid in lex, "sem": cid in sem,
        })
        if len(saida) >= limite:
            break
    return saida


def vizinhos(db, entidade: str, saltos: int = 1) -> list[tuple]:
    """Travessia do grafo a partir de uma entidade."""
    vistos, fronteira, arestas = {entidade}, [entidade], []
    for _ in range(saltos):
        seguinte = []
        for e in fronteira:
            for r in db.execute(
                "SELECT src, rel, dst, slug FROM relations WHERE src=? OR dst=?",
                (e, e)):
                arestas.append((r["src"], r["rel"], r["dst"], r["slug"]))
                for outro in (r["src"], r["dst"]):
                    if outro not in vistos:
                        vistos.add(outro)
                        seguinte.append(outro)
        fronteira = seguinte
    return arestas


# --------------------------------------------------------------- comandos
def cmd_reconstruir(args):
    if DB.exists():
        DB.unlink()
        for sufixo in ("-wal", "-shm"):
            p = DB.with_name(DB.name + sufixo)
            if p.exists():
                p.unlink()
    db = conectar()
    criar_esquema(db)
    print("A indexar notas…")
    n = indexar_notas(db, forcar=True)
    print(f"  {n} notas")
    if args.completo:
        from ingerir import ingerir_tudo  # noqa: PLC0415

        ingerir_tudo(db, _guardar_chunks)
    cmd_estado(args, db)


def cmd_indexar(args):
    db = conectar()
    criar_esquema(db)
    n = indexar_notas(db)
    print(f"{n} notas atualizadas")


def cmd_buscar(args):
    db = conectar()
    res = buscar(db, args.pergunta, args.limite, args.as_of, args.tipo,
                 args.incluir_expirado, args.dominio)
    if not res:
        print("nada encontrado")
        return
    for r in res:
        marca = ("L" if r["lex"] else "·") + ("S" if r["sem"] else "·")
        vig = ""
        if r["valid_to"]:
            vig = f"  [expirada em {r['valid_to']}"
            vig += f", ver {r['superseded_by']}]" if r["superseded_by"] else "]"
        etiq = r["tipo"] or r["fonte"]
        if r.get("dominio") and r["dominio"] != "geral":
            etiq += f"/{r['dominio']}"
        # Um UUID de sessão não diz nada a ninguém; o título traz a data.
        ref = r["ref"]
        if r["fonte"] == "transcript":
            ref = r["titulo"] or ref[:8]
        print(f"\n[{marca}] {r['ponto']:.4f}  {etiq}  {ref}{vig}")
        print(f"    {r['titulo']}")
        corpo = " ".join(r["texto"].split())
        print(f"    {corpo[:280]}{'…' if len(corpo) > 280 else ''}")
    print(f"\n(L=lexical BM25, S=semântico vetorial; fundidos por RRF)")


def cmd_auditar(args):
    db = conectar()
    hoje = date.today().isoformat()
    problemas = 0

    print("== Estados vencidos sem sucessor ==")
    for r in db.execute(
        "SELECT slug, titulo, valid_from FROM notes WHERE tipo='estado'"
        " AND valid_to IS NULL AND superseded_by IS NULL ORDER BY valid_from"):
        if r["valid_from"] and r["valid_from"] < hoje[:8] + "01":
            print(f"  {r['slug']}  (desde {r['valid_from']}) — ainda em vigor?")
            problemas += 1

    print("\n== Notas substituídas mas ainda em vigor ==")
    for r in db.execute(
        "SELECT slug, superseded_by FROM notes"
        " WHERE superseded_by IS NOT NULL AND valid_to IS NULL"):
        print(f"  {r['slug']} -> {r['superseded_by']}: falta fechar valid_to")
        problemas += 1

    print("\n== Notas sem proveniência ==")
    for r in db.execute(
        "SELECT n.slug FROM notes n LEFT JOIN sources s ON s.slug=n.slug"
        " WHERE s.slug IS NULL"):
        print(f"  {r['slug']}")
        problemas += 1

    print("\n== Pares muito semelhantes (possível duplicação) ==")
    notas = list(db.execute("SELECT slug, titulo, corpo FROM notes"))
    if len(notas) > 1:
        vecs = embed([n["corpo"][:1500] for n in notas], "doc",
                     [n["titulo"] for n in notas])
        import math
        for i in range(len(notas)):
            for j in range(i + 1, len(notas)):
                a, b = vecs[i], vecs[j]
                s = sum(x * y for x, y in zip(a, b)) / (
                    math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b)))
                if s > 0.88:
                    print(f"  {s:.3f}  {notas[i]['slug']}  ~  {notas[j]['slug']}")
                    problemas += 1

    print(f"\n{problemas} pontos a rever")


def cmd_estado(args, db=None):
    db = db or conectar()
    q = lambda s: db.execute(s).fetchone()[0]  # noqa: E731
    print("\n== Índice ==")
    print(f"  notas          {q('SELECT count(*) FROM notes')}")
    for t in TIPOS:
        c = db.execute("SELECT count(*) FROM notes WHERE tipo=?", (t,)).fetchone()[0]
        if c:
            print(f"    {t:<12} {c}")
    print(f"  em vigor       {q('SELECT count(*) FROM notes WHERE valid_to IS NULL')}")
    print("  por domínio")
    for r in db.execute("SELECT dominio, count(*) c FROM notes"
                        " GROUP BY dominio ORDER BY c DESC"):
        print(f"    {r['dominio']:<12} {r['c']}")
    print(f"  fragmentos     {q('SELECT count(*) FROM chunks')}")
    for f in ("nota", "transcript", "doc", "commit"):
        c = db.execute("SELECT count(*) FROM chunks WHERE fonte=?", (f,)).fetchone()[0]
        if c:
            print(f"    {f:<12} {c}")
    print(f"  vetores        {q('SELECT count(*) FROM chunks_vec')}")
    print(f"  entidades      {q('SELECT count(*) FROM entities')}")
    print(f"  relações       {q('SELECT count(*) FROM relations')}")
    if DB.exists():
        print(f"  tamanho        {DB.stat().st_size / 1e6:.1f} MB")


def cmd_grafo(args):
    db = conectar()
    arestas = list(dict.fromkeys(vizinhos(db, args.entidade, args.saltos)))
    if not arestas:
        print(f"sem relações para '{args.entidade}'")
        return

    explicitas = [a for a in arestas if a[1] != "co_ocorre_em"]
    coocorre = [a for a in arestas if a[1] == "co_ocorre_em"]

    if explicitas:
        print("Relações declaradas:")
        for src, rel, dst, slug in explicitas:
            print(f"  {src}  --{rel}-->  {dst}    ({slug})")

    if coocorre and not args.so_explicitas:
        # Co-ocorrência é sinal fraco: agrupa-se por nota em vez de listar par a par.
        por_nota: dict[str, set] = {}
        for src, _, dst, slug in coocorre:
            por_nota.setdefault(slug, set()).update(
                x for x in (src, dst) if x != args.entidade)
        print(f"\nAparece com (co-ocorrência em {len(por_nota)} notas):")
        for slug, outras in sorted(por_nota.items()):
            lista = ", ".join(sorted(outras)[:8])
            print(f"  {slug}: {lista}")


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("reconstruir", help="apaga e reindexa tudo")
    s.add_argument("--completo", action="store_true",
                   help="inclui transcripts, docs e commits")
    s.set_defaults(fn=cmd_reconstruir)

    s = sub.add_parser("indexar", help="reindexa só o que mudou")
    s.set_defaults(fn=cmd_indexar)

    s = sub.add_parser("buscar", help="busca híbrida")
    s.add_argument("pergunta")
    s.add_argument("-n", "--limite", type=int, default=8)
    s.add_argument("--as-of", help="o que era verdade nesta data (AAAA-MM-DD)")
    s.add_argument("--tipo", choices=TIPOS)
    s.add_argument("--dominio", choices=DOMINIOS)
    s.add_argument("--incluir-expirado", action="store_true")
    s.set_defaults(fn=cmd_buscar)

    s = sub.add_parser("grafo", help="relações de uma entidade")
    s.add_argument("entidade")
    s.add_argument("--saltos", type=int, default=1)
    s.add_argument("--so-explicitas", action="store_true",
                   help="esconde as co-ocorrências")
    s.set_defaults(fn=cmd_grafo)

    s = sub.add_parser("auditar", help="contradições e obsolescência")
    s.set_defaults(fn=cmd_auditar)

    s = sub.add_parser("estado", help="números do índice")
    s.set_defaults(fn=cmd_estado)

    args = p.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()
