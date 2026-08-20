#!/usr/bin/env python3
"""Biblioteca de memória do projeto Gonzaga's Art & Shine.

A fonte de verdade são os ficheiros markdown em docs/memoria/notas/.
Esta ferramenta mantém um índice derivado (SQLite) que combina BM25,
similaridade vetorial e um grafo de entidades datado.

  mem.py reconstruir        apaga e reindexa tudo a partir dos ficheiros
  mem.py indexar            reindexa apenas o que mudou
  mem.py buscar "..."       busca híbrida
  mem.py auditar            contradições, obsolescência e órfãos
  mem.py servir             abre a memória no browser (só-leitura, local)
  mem.py percursos          como se chegou às últimas respostas
  mem.py sonhar             o que há a consolidar (mede, aponta, não escreve)
  mem.py contexto "..."     notas relevantes a uma pergunta, para injectar
  mem.py exportar           bundle Open Knowledge Format, derivado e descartável
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

# Duas raízes, e não uma — a distinção que torna possível haver mais do que
# um centro de memória:
#
#   BIBLIOTECA  onde a memória vive (notas + índice). Anda com as notas.
#   PROJETO     o repositório que ela documenta — o que o `ingerir` varre à
#               procura de docs e commits, e de onde vêm as transcrições.
#
# Coincidem neste repo. Deixam de coincidir assim que a mesma biblioteca
# servir outro projeto, ou o mesmo motor outra biblioteca. Por omissão a
# biblioteca é a pasta que contém o `bin/`, e o projeto é o repo que a contém.
BASE = Path(os.environ.get("MEM_BIBLIOTECA")
            or Path(__file__).resolve().parents[1]).resolve()
# Se a biblioteca for mudada de sítio sem se dizer qual é o projeto, o
# projeto passa a ser a própria biblioteca — nunca o pai do pai, que daria
# "/" e poria o `ingerir` a varrer o sistema de ficheiros inteiro.
RAIZ = Path(os.environ.get("MEM_PROJETO")
            or (BASE if "MEM_BIBLIOTECA" in os.environ else BASE.parents[1])).resolve()
NOTAS = BASE / "notas"
DB = BASE / "estado" / "indice.db"
ESQUEMA = Path(__file__).parent / "esquema.sql"

# As transcrições do Claude Code vivem fora do repo, numa pasta cujo nome é o
# caminho do projeto com as barras trocadas por hífenes.
TRANSCRIPTS = Path(os.environ.get("MEM_TRANSCRIPTS") or
                   Path.home() / ".claude" / "projects" /
                   str(RAIZ).replace("/", "-"))


def relativo(p: Path) -> str:
    """Caminho face ao projeto — absoluto se a biblioteca viver fora dele."""
    try:
        return str(Path(p).resolve().relative_to(RAIZ))
    except ValueError:
        return str(p)

OLLAMA = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
MODELO = os.environ.get("MEM_EMBED_MODEL", "embeddinggemma")
DIMS = 768
KEEP_ALIVE = os.environ.get("MEM_KEEP_ALIVE", "60m")

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
    # O hook PostToolUse corre `indexar` em async a cada nota escrita: gravar
    # três notas seguidas põe três processos a escrever ao mesmo tempo, e cada
    # um demora o que demorar a gerar embeddings. Com o timeout por omissão
    # (5 s) os perdedores desistem em silêncio — foi assim que três notas
    # ficaram fora do índice enquanto o comando dizia "0 notas atualizadas".
    db = sqlite3.connect(DB, timeout=120)
    db.row_factory = sqlite3.Row
    db.enable_load_extension(True)
    sqlite_vec.load(db)
    db.enable_load_extension(False)
    # O índice é derivado: quando o esquema cresce, ele põe-se em dia sozinho
    # em vez de rebentar num comando que não sabia da tabela nova. Uma leitura
    # de `meta` por ligação; só escreve quando o ficheiro do esquema mudou.
    try:
        actual = db.execute(
            "SELECT valor FROM meta WHERE chave='esquema_hash'").fetchone()
    except sqlite3.OperationalError:
        actual = None
    if not actual or actual[0] != _hash_esquema():
        criar_esquema(db)
    return db


def _hash_esquema() -> str:
    return sha(ESQUEMA.read_text(encoding="utf-8"))


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
    db.execute(
        "INSERT OR REPLACE INTO meta(chave, valor) VALUES ('esquema_hash', ?)",
        (_hash_esquema(),),
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
          titulos: list[str] | None = None, lote: int = 16,
          obrigatorio: bool = True) -> list[list[float]]:
    """Vectores para os textos dados.

    `obrigatorio=False` devolve [] em vez de abortar quando o ollama não
    responde. Serve **só para ler**: a indexação tem de continuar a abortar,
    porque escrever fragmentos sem vector deixaria o índice em silêncio meio
    cego — a busca lexical acharia coisas que a vectorial nunca mais veria.
    """
    if not textos:
        return []
    saida: list[list[float]] = []
    entradas = _prefixar(textos, tipo, titulos)
    for i in range(0, len(entradas), lote):
        parte = entradas[i : i + lote]
        req = urllib.request.Request(
            f"{OLLAMA}/api/embed",
            json.dumps({"model": MODELO, "input": parte,
                        # Sem isto o ollama descarrega o modelo ao fim de uns
                        # minutos, e a busca seguinte paga ~1,7 s a recarregá-lo.
                        # Com a injecção automática em cada pergunta, esse
                        # arranque a frio seria a experiência normal.
                        "keep_alive": KEEP_ALIVE}).encode(),
            {"Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                saida.extend(json.load(r)["embeddings"])
        except urllib.error.URLError as e:
            if not obrigatorio:
                return []
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
    meta.setdefault("path", relativo(caminho))
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


# Ligações escritas à mão entre notas: [[slug-da-outra-nota]].
_WIKILINK = re.compile(r"\[\[([^\]|#]+?)(?:[|#][^\]]*)?\]\]")


def wikilinks(corpo: str) -> list[str]:
    """Alvos distintos citados pelo corpo, pela ordem em que aparecem.

    Blocos e trechos de código saem primeiro: uma nota que *explica* a sintaxe
    escreve `[[assim]]` como exemplo, e sem isto o exemplo virava uma ligação
    partida a apontar para uma nota que nunca existiu.
    """
    limpo = re.sub(r"```.*?```", " ", corpo, flags=re.S)
    limpo = re.sub(r"`[^`\n]+`", " ", limpo)
    return list(dict.fromkeys(m.strip() for m in _WIKILINK.findall(limpo) if m.strip()))


# Tipos que o motor sabe reconhecer sozinho, porque valem em qualquer
# projecto. Tudo o que for específico de um negócio — o que é um «produto»,
# o que é uma «categoria» — vem das regras da biblioteca, não daqui: essa é
# a fronteira que permite levar este motor para outro centro de memória.
_EXT_FICHEIRO = {".py", ".js", ".mjs", ".cjs", ".ts", ".json", ".sql", ".md",
                 ".css", ".html", ".ejs", ".sh", ".yml", ".yaml", ".toml",
                 ".txt", ".svg", ".webp", ".jpg", ".png", ".env"}
_SIMBOLO = re.compile(r"^[A-Z][A-Z0-9]*(_[A-Z0-9]+)+$"          # PESO_FONTE
                      r"|^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)+$")  # app.locals.brand

# `artnshine.pt` casa com o padrão de `app.locals.brand` e vinha tipado como
# símbolo. Um domínio não é um identificador de código, e um tipo errado
# afirmado com confiança mente mais do que a ausência de tipo.
_TLD = re.compile(r"\.(pt|com|org|net|io|dev|eu|es|br|co|app|ai|me)$", re.I)

_regras_projeto: list[tuple[str, re.Pattern]] | None = None


def _regras_da_biblioteca() -> list[tuple[str, re.Pattern]]:
    """Padrões de tipagem próprios desta biblioteca, se os houver.

    `projeto/entidades.json` mapeia tipo -> lista de expressões regulares.
    É opcional: sem ele, o motor tipa só o que é universal.
    """
    global _regras_projeto
    if _regras_projeto is None:
        _regras_projeto = []
        f = BASE / "projeto" / "entidades.json"
        if f.exists():
            try:
                for tipo, padroes in json.loads(f.read_text(encoding="utf-8")).items():
                    # Uma chave a começar por "_" é comentário. E o valor tem
                    # de ser uma lista: se for uma string, o `for` itera-a
                    # caractere a caractere e cada letra vira um padrão que
                    # casa com tudo — foi assim que 166 entidades ficaram
                    # todas com o tipo "_comentario".
                    if tipo.startswith("_") or not isinstance(padroes, list):
                        continue
                    for pad in padroes:
                        _regras_projeto.append((tipo, re.compile(pad)))
            except (json.JSONDecodeError, re.error) as e:
                print(f"  aviso: {f.name} ignorado ({e})", file=sys.stderr)
    return _regras_projeto


def tipar_entidade(nome: str) -> str | None:
    """O tipo de uma entidade, ou None quando não se consegue provar.

    Adivinhar mal é pior do que não tipar: um grafo colorido por tipos
    errados mente com confiança. As regras da biblioteca vêm primeiro,
    porque são mais específicas do que as universais.
    """
    for tipo, padrao in _regras_da_biblioteca():
        if padrao.search(nome):
            return tipo
    if "/" in nome or Path(nome).suffix.lower() in _EXT_FICHEIRO:
        return "ficheiro"
    if _SIMBOLO.match(nome) and not _TLD.search(nome):
        return "simbolo"
    return None


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
            # Re-tipa sempre: as regras da biblioteca podem ter mudado desde
            # a última indexação, e o tipo é derivado como tudo no índice.
            db.execute("UPDATE entities SET tipo=? WHERE nome=?",
                       (tipar_entidade(e), e))
            db.execute("INSERT INTO mentions(entidade, slug) VALUES (?,?)", (e, slug))

        # Wikilinks: nós são as notas, não as entidades. Uma ligação escrita
        # à mão vale muito mais do que a co-ocorrência, por isso vive num eixo
        # próprio. `resolve` fica a 1 e é recalculado no fim, quando já se
        # conhecem todos os slugs — uma nota pode citar outra ainda por indexar.
        db.execute("DELETE FROM note_links WHERE src=?", (slug,))
        for alvo in wikilinks(meta["corpo"]):
            if alvo != slug:
                db.execute("INSERT INTO note_links(src, dst) VALUES (?,?)",
                           (slug, alvo))

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
        # `chunks_vec` é tabela virtual: não há cascata nem chave estrangeira
        # que a limpe. Sem esta linha, apagar ou mudar o nome a uma nota
        # deixava os vectores para trás — e um vector órfão não é só lixo:
        # ocupa lugar no k=60 da busca vectorial e é depois descartado em
        # silêncio, portanto rouba recall de cada vez que se procura.
        db.executemany("DELETE FROM chunks_vec WHERE chunk_id=?",
                       [(r[0],) for r in db.execute(
                           "SELECT id FROM chunks WHERE fonte='nota' AND ref=?",
                           (slug,))])
        db.execute("DELETE FROM chunks WHERE fonte='nota' AND ref=?", (slug,))

    # Alvos partidos não se apagam: ficam com resolve=0 para o lint os apontar.
    db.execute("UPDATE note_links SET resolve ="
               " (dst IN (SELECT slug FROM notes))")
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


# Uma nota é conhecimento destilado, com o porquê e já verificado; um doc ou
# um transcript é matéria-prima. Sem esta precedência, o documento original
# ganha sempre por repetir mais vezes o termo procurado — medido: a precisão@3
# caiu de 100% para 77% quando os docs entraram no índice.
PESO_FONTE = {"nota": 1.6, "doc": 1.0, "transcript": 0.9, "commit": 0.8}

# O domínio 'memoria' documenta o próprio sistema e cita termos dos outros
# domínios como exemplos ("«rembg» devolvia o README…"). Sem desconto, essas
# notas ocupam o topo de perguntas que nada têm a ver com elas. Não se
# excluem — descontam-se, e voltam a peso inteiro com `--dominio memoria`.
DESCONTO_META = 0.7

# Quantos candidatos se olham para decidir se a pergunta é sobre a memória, e
# a partir de que fracção deles ser meta se conclui que sim. Medido em quatro
# perguntas, já com o peso por fonte aplicado:
#
#                                          top3   top5   top8
#   «rembg» (cita a meta por exemplo)        67%    60%    50%
#   «como funciona a busca desta memória»   100%   100%   100%
#   «prata acastanhada»                       0%    20%    12%
#   «peças a zero euros»                      0%     0%     0%
#
# A top8 a margem é a mais larga — 50% contra 100% — e uma janela maior é
# menos sensível a uma nota mudar de lugar.
AMOSTRA_META = 8
FRACAO_META = 0.8


def _fts_query(pergunta: str) -> str:
    termos = re.findall(r"[\wÀ-ÿ][\wÀ-ÿ\-_]{1,}", pergunta.lower())
    stop = {"que", "para", "com", "uma", "dos", "das", "por", "nao", "não",
            "como", "onde", "quando", "porque", "qual", "quais", "the", "and"}
    uteis = [t for t in termos if t not in stop]
    return " OR ".join(f'"{t}"' for t in uteis) if uteis else '""'


def buscar(db, pergunta: str, limite: int = 8, as_of: str | None = None,
           tipo: str | None = None, incluir_expirado: bool = False,
           dominio: str | None = None, gravar: bool = True,
           origem: str = "cli") -> list[dict]:
    # O percurso mede-se de ponta a ponta, embedding incluído: é isso que se
    # sente ao usar. `gravar=False` serve a bateria de testes, que faria
    # centenas de buscas e encheria o registo de ruído.
    _t0 = datetime.now(timezone.utc)
    # via lexical (BM25) — ganha em identificadores exactos: PPU0080, migração 014
    lex: list[int] = []
    try:
        lex = [r["rowid"] for r in db.execute(
            "SELECT rowid FROM chunks_fts WHERE chunks_fts MATCH ?"
            " ORDER BY rank LIMIT 60", (_fts_query(pergunta),))]
    except sqlite3.OperationalError:
        pass

    # via semântica — ganha na flexão e no sinónimo ("acastanhada" -> "castanha")
    #
    # Se o ollama não responder, esta via desaparece e a busca continua só com
    # o BM25, que não depende de nada. Meia memória a responder vale muito
    # mais do que uma memória calada: quem procura «PPU0080» ou «migração 016»
    # é servido na mesma, e só se perde a flexão e o sinónimo.
    sem: list[int] = []
    qv = embed([pergunta], "query", obrigatorio=False)
    if qv:
        sem = [r["chunk_id"] for r in db.execute(
            "SELECT chunk_id FROM chunks_vec WHERE embedding MATCH ?"
            " AND k = 60 ORDER BY distance", (empacotar(qv[0]),))]

    pontos = _rrf([lex, sem])
    if not pontos:
        return []

    # Aplica a precedência por fonte e o desconto meta antes de ordenar.
    if pontos:
        marcas = ",".join("?" * len(pontos))
        info = {r["id"]: (r["fonte"], r["dominio"]) for r in db.execute(
            f"SELECT c.id, c.fonte, n.dominio FROM chunks c"
            f" LEFT JOIN notes n ON n.slug = c.ref AND c.fonte='nota'"
            f" WHERE c.id IN ({marcas})", tuple(pontos))}
        # Quando a pergunta é mesmo sobre o sistema de memória, as notas meta
        # ocupam o resultado inteiro; quando entram por um exemplo que citam
        # («o rembg devolvia o README»), são minoria entre resultados de
        # outros domínios. Medido: 5 em 5 no primeiro caso, 2 em 5 no segundo.
        # Descontar sempre trocava um erro pelo outro — «rembg» acertava e
        # «como funciona a busca desta memória» passava a devolver uma nota
        # sobre ramos de git.
        # Primeira passagem: o peso por fonte, que é incondicional.
        for cid in pontos:
            pontos[cid] *= PESO_FONTE.get(info.get(cid, ("", None))[0], 1.0)

        # Só depois se mede a mistura — antes de a fonte contar, docs e
        # transcrições ainda cá estão em força e falseiam a proporção.
        candidatos = sorted(pontos, key=lambda c: -pontos[c])[:AMOSTRA_META]
        metas = sum(1 for c in candidatos if info.get(c, ("", None))[1] == "memoria")
        pergunta_meta = bool(candidatos) and metas / len(candidatos) >= FRACAO_META

        if not pergunta_meta and dominio != "memoria":
            for cid in pontos:
                if info.get(cid, ("", None))[1] == "memoria":
                    pontos[cid] *= DESCONTO_META

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

    if gravar:
        from percursos import gravar_busca  # noqa: PLC0415

        ms = int((datetime.now(timezone.utc) - _t0).total_seconds() * 1000)
        gravar_busca(db, pergunta, saida,
                     {"dominio": dominio, "tipo": tipo, "as_of": as_of,
                      "incluir_expirado": incluir_expirado},
                     ms, origem)
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

    print("\n== Ligações para notas que não existem ==")
    for r in db.execute("SELECT src, dst FROM note_links WHERE resolve=0"
                        " ORDER BY src, dst"):
        print(f"  {r['src']} --> [[{r['dst']}]]")
        problemas += 1

    # Uma nota que ninguém cita não é necessariamente má — mas é invisível a
    # quem navega pelo grafo, e costuma ser sinal de que ficou por costurar.
    print("\n== Notas que ninguém cita ==")
    for r in db.execute(
        "SELECT slug, titulo FROM notes WHERE valid_to IS NULL AND slug NOT IN"
        " (SELECT dst FROM note_links WHERE resolve=1) ORDER BY slug"):
        saidas = db.execute("SELECT count(*) FROM note_links WHERE src=? AND resolve=1",
                            (r["slug"],)).fetchone()[0]
        ilha = "  (ilha: também não cita ninguém)" if not saidas else ""
        print(f"  {r['slug']}{ilha}")
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
    print(f"  ligações       {q('SELECT count(*) FROM note_links WHERE resolve=1')}"
          f" entre notas")
    partidas = q("SELECT count(*) FROM note_links WHERE resolve=0")
    if partidas:
        print(f"    partidas     {partidas}")
    print(f"    sem citação  {q('SELECT count(*) FROM notes WHERE slug NOT IN'
                                ' (SELECT dst FROM note_links WHERE resolve=1)')}")
    print(f"  percursos      {q('SELECT count(*) FROM traces')}")
    print(f"  entidades      {q('SELECT count(*) FROM entities')}")
    print(f"  relações       {q('SELECT count(*) FROM relations')}")
    if DB.exists():
        print(f"  tamanho        {DB.stat().st_size / 1e6:.1f} MB")


# Quantas notas se injectam automaticamente em cada pergunta. Três é o que
# cabe sem afogar o contexto: título e resumo, nunca o corpo — quem quiser o
# corpo abre a nota, e assim a injecção custa dezenas de tokens e não milhares.
CONTEXTO_N = 3


def cmd_exportar(args):
    from okf import main as okf_main  # noqa: PLC0415

    sys.argv = ["okf.py"] + ([args.destino] if args.destino else []) \
        + (["--verificar"] if args.verificar else [])
    return okf_main()


def cmd_contexto(args):
    """Bloco compacto para um hook injectar antes de o agente pensar.

    Não grava percurso: isto dispara em cada pergunta, e encheria o registo
    de consultas que ninguém pediu, expulsando as deliberadas.
    """
    db = conectar()
    res = [r for r in buscar(db, args.pergunta, CONTEXTO_N * 3, gravar=False)
           if r["fonte"] == "nota"][:CONTEXTO_N]
    if not res:
        return 0
    print("Da memória do projeto (docs/memoria/notas/), possivelmente relevante:")
    for r in res:
        vig = f" — EXPIRADA em {r['valid_to']}" if r["valid_to"] else ""
        print(f"- [[{r['ref']}]] ({r['tipo']}/{r['dominio']}{vig})")
        # O resumo é a melhor linha que há — excepto quando só repete o
        # título, que é o caso em quase metade das notas herdadas da migração.
        # Aí vale mais um pedaço do corpo: o título já foi mostrado acima, e
        # repeti-lo gasta contexto em todas as perguntas sem dizer nada.
        linha_db = db.execute("SELECT resumo, titulo FROM notes WHERE slug=?",
                              (r["ref"],)).fetchone()
        resumo = linha_db["resumo"] if linha_db else None
        titulo = (linha_db["titulo"] if linha_db else "") or ""
        if not resumo or resumo == titulo or resumo.startswith(titulo[:60]):
            resumo = " ".join(r["texto"].split())[:190] + "…"
        print(f"  {resumo}")
    print("Isto é um palpite da busca, não uma resposta: confirma antes de usar,"
          " lendo a nota com `mem.py buscar` ou o agente bibliotecario.")
    return 0


def cmd_sonhar(args):
    from sonhar import relatorio, sonhar  # noqa: PLC0415

    db = conectar()
    s = sonhar(db, com_duplicados=not args.rapido)
    print(relatorio(s), end="")
    return 1 if any(s.values()) else 0


def cmd_percursos(args):
    from percursos import listar, ler  # noqa: PLC0415

    db = conectar()
    if args.id:
        t = ler(db, args.id)
        if not t:
            print("percurso inexistente")
            return 1
        print(f'#{t["id"]}  {t["ts"]}  {t["origem"]}  {t["duracao_ms"]}ms')
        print(f'  pergunta: {t["pergunta"]}')
        if t["filtros"] and t["filtros"] != "{}":
            print(f'  filtros:  {t["filtros"]}')
        for x in t["passos"]:
            if x["acao"] == "achou":
                print(f'  {x["posicao"]:>3}. [{x["canal"]}] {x["ponto"]:.4f}'
                      f'  {x["fonte"]:<10} {x["ref"]}')
            else:
                print(f'   ->  abriu {x["ref"]}')
        return 0
    for t in listar(db, args.limite):
        print(f'#{t["id"]:<4} {t["ts"][:16].replace("T", " ")}  {t["origem"]:<4}'
              f' {t["duracao_ms"]:>5}ms  {t["notacao"]}')
    return 0


def cmd_servir(args):
    from servir import servir  # noqa: PLC0415  só carrega quando é preciso

    return servir(args.porta, args.host, args.verboso)


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

    s = sub.add_parser("servir", help="abre a memória no browser")
    s.add_argument("--porta", type=int, default=7373)
    s.add_argument("--host", default="127.0.0.1")
    s.add_argument("-v", "--verboso", action="store_true")
    s.set_defaults(fn=cmd_servir)

    s = sub.add_parser("percursos", help="como se chegou às últimas respostas")
    s.add_argument("--id", type=int, help="detalhe de um percurso")
    s.add_argument("--limite", type=int, default=20)
    s.set_defaults(fn=cmd_percursos)

    s = sub.add_parser("exportar", help="bundle OKF (derivado, descartável)")
    s.add_argument("destino", nargs="?")
    s.add_argument("--verificar", action="store_true")
    s.set_defaults(fn=cmd_exportar)

    s = sub.add_parser("contexto", help="notas relevantes a uma pergunta")
    s.add_argument("pergunta")
    s.set_defaults(fn=cmd_contexto)

    s = sub.add_parser("sonhar", help="o que há a consolidar")
    s.add_argument("--rapido", action="store_true",
                   help="salta os duplicados (poupa uma passagem de embeddings)")
    s.set_defaults(fn=cmd_sonhar)

    s = sub.add_parser("estado", help="números do índice")
    s.set_defaults(fn=cmd_estado)

    args = p.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()
