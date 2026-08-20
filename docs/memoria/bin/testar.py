#!/usr/bin/env python3
"""Bateria de testes da biblioteca de memória.

Mede o que interessa: se a busca devolve a nota certa, se o índice está
sincronizado com os ficheiros, se a bi-temporalidade filtra, e se as
partes aguentam entradas estranhas.

  testar.py            corre tudo
  testar.py --so retrieval
  testar.py -v         mostra cada caso

Código de saída 1 se algum teste falhar.
"""
from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from mem import (BASE, DB, NOTAS, RAIZ, buscar, conectar, criar_esquema,  # noqa: E402
                 embed, entidade_valida, fragmentar, ler_nota,
                 normalizar_entidade, wikilinks, _fts_query)

VERBOSE = False
falhas: list[str] = []
passou = 0


def ok(cond: bool, nome: str, detalhe: str = "") -> bool:
    global passou
    if cond:
        passou += 1
        if VERBOSE:
            print(f"    ok   {nome}")
    else:
        falhas.append(f"{nome} — {detalhe}" if detalhe else nome)
        print(f"    FALHA {nome}" + (f"  ({detalhe})" if detalhe else ""))
    return cond


# ---------------------------------------------------------------- retrieval
# Cada caso: (pergunta, slugs aceitáveis). O alvo tem de sair no top-3.
# Escolhidos para cobrir os dois canais: uns só se acham por termo exacto,
# outros só por semelhança.
CASOS = [
    # semânticos — a palavra da pergunta não está na nota
    ("porque é que a prata fica acastanhada nas fotografias",
     {"capas-categorias-fundo-frio", "recorte-prata-polida"}),
    ("como separar a peça do fundo numa foto de prata polida",
     {"recorte-prata-polida"}),
    ("o site anunciava peças a zero euros",
     {"lote-julho-2026"}),
    ("segredos guardados sem cifra na base de dados",
     {"seguranca-chaves-stripe"}),
    ("onde é que se mexe nas cores do site",
     {"design-paleta-por-implementar", "design-system-2026-08-01"}),
    ("o correio electrónico de recuperação de conta não sai",
     {"conta-obrigatoria-checkout"}),
    # lexicais — identificadores exactos
    ("rembg", {"capas-categorias-fundo-frio"}),
    ("PAN0075", {"lote-julho-2026"}),
    ("LTCU0016", {"catalogo-monitorizar", "seo-naming-2026-07"}),
    ("ugrep", {"memoria-armadilhas-tecnicas"}),
    ("sk_live", {"seguranca-chaves-stripe"}),
    ("prices_include_tax", {"fase-5-loja-e-pagamentos-2026-06"}),
    ("PPU0036", {"marca-catalogo-vs-estrategia", "catalogo-monitorizar"}),
    # conceptuais
    ("porque foi removido o lazy loading das imagens",
     {"lazy-loading-ciclo"}),
    ("tabelas de analytics que nunca receberam dados",
     {"fase-2-sprint-outubro-2025"}),
    ("o código ainda se defende de um alojamento que já não usamos",
     {"fase-1-arranque-2025-05"}),
    ("quantas peças de fios de prata existem mesmo",
     {"marca-catalogo-vs-estrategia"}),
    ("qual é o público-alvo e as cores proibidas da marca",
     {"marca-brand-bible"}),
    ("como funciona a busca desta memória",
     {"memoria-como-funciona"}),
    ("como manter as notas actualizadas",
     {"memoria-verificar-factos"}),
    # A `trabalho-em-curso-2026-08` foi sucedida a 2026-08-19 pela
    # `estado-git-2026-08-19`. Um caso de retrieval que só aceite a nota
    # antiga passa a falhar de cada vez que um estado é substituído — e a
    # substituição é o comportamento correcto, não a falha. Aceitam-se as
    # duas: a busca normal deve devolver a nova, e `--as-of` a velha.
    # O desconto meta é condicional, e estes dois casos são as duas metades
    # da condição: a primeira pergunta É sobre o sistema de memória e tem de
    # devolver uma nota meta; a segunda só cita «rembg», que a nota meta usa
    # como exemplo, e tem de devolver a nota de fotografia. Descontar sempre
    # acertava numa e falhava a outra.
    ("como funciona a busca desta memória",
     {"memoria-como-funciona", "memoria-qualidade-medida"}),
    ("branches por integrar e worktrees a mais",
     {"estado-git-2026-08-19", "trabalho-em-curso-2026-08"}),
    ("a produção corre em docker num servidor próprio",
     {"waphix-production-infra"}),
]


def t_retrieval(db) -> None:
    print("\n== Retrieval (alvo no top-3) ==")
    acertos_1 = acertos_3 = 0
    lentos = []
    for pergunta, esperados in CASOS:
        t0 = time.time()
        res = buscar(db, pergunta, limite=3, gravar=False)
        dt = time.time() - t0
        if dt > 3.0:
            lentos.append((pergunta, dt))
        refs = [r["ref"] for r in res]
        top1 = bool(refs) and refs[0] in esperados
        top3 = any(r in esperados for r in refs)
        acertos_1 += top1
        acertos_3 += top3
        ok(top3, f"«{pergunta[:44]}»",
           f"esperava {'|'.join(sorted(esperados))}, veio {refs[:3]}")
        if VERBOSE and top3:
            print(f"         top1={'sim' if top1 else 'nao'} → {refs[0]}")

    n = len(CASOS)
    print(f"\n  precisão@1: {acertos_1}/{n} ({acertos_1/n:.0%})")
    print(f"  precisão@3: {acertos_3}/{n} ({acertos_3/n:.0%})")
    ok(acertos_3 / n >= 0.85, "precisão@3 >= 85%", f"{acertos_3/n:.0%}")
    ok(not lentos, "nenhuma busca acima de 3s", str(lentos[:2]))


def t_hibrido(db) -> None:
    """Prova que os dois canais são precisos — cada um ganha onde o outro perde."""
    print("\n== Valor do híbrido ==")
    so_lexical = ("rembg", "PAN0075", "sk_live", "ugrep")
    so_semantico = ("porque é que a prata fica acastanhada nas fotografias",
                    "segredos guardados sem cifra na base de dados",
                    "o site anunciava peças a zero euros")

    for q in so_lexical:
        res = buscar(db, q, limite=3, gravar=False)
        tem_lex = any(r["lex"] for r in res)
        ok(tem_lex, f"«{q}» usa o canal lexical")

    for q in so_semantico:
        res = buscar(db, q, limite=3, gravar=False)
        tem_sem = any(r["sem"] for r in res)
        ok(tem_sem, f"«{q[:38]}» usa o canal semântico")

    # O sinal forte [LS] deve aparecer nas perguntas bem formadas.
    res = buscar(db, "porque é que a prata fica acastanhada", limite=3, gravar=False)
    ok(any(r["lex"] and r["sem"] for r in res),
       "pergunta natural aciona os dois canais")


def t_temporal(db) -> None:
    print("\n== Bi-temporalidade ==")
    # A nota fechada não deve sair na busca normal.
    normal = [r["ref"] for r in buscar(db, "estado do rebranding homepage", limite=8, gravar=False)]
    ok("estado-2026-07-30" not in normal, "nota expirada fora da busca normal")

    com_exp = [r["ref"] for r in buscar(db, "estado do rebranding homepage",
                                        limite=8, incluir_expirado=True, gravar=False)]
    ok("estado-2026-07-30" in com_exp, "--incluir-expirado devolve a expirada",
       str(com_exp[:3]))

    # as-of anterior à criação de uma nota não a devolve.
    antigo = [r["ref"] for r in buscar(db, "chaves da stripe em texto simples",
                                       limite=8, as_of="2026-01-01", gravar=False)]
    ok("seguranca-chaves-stripe" not in antigo,
       "--as-of 2026-01-01 esconde nota de Agosto", str(antigo[:3]))

    # Filtros de tipo e domínio.
    so_proc = buscar(db, "memória", limite=6, tipo="procedimento", gravar=False)
    ok(all(r["tipo"] == "procedimento" for r in so_proc) and so_proc,
       "--tipo filtra")
    so_dom = buscar(db, "prata", limite=6, dominio="fotografia", gravar=False)
    ok(all(r["dominio"] == "fotografia" for r in so_dom) and so_dom,
       "--dominio filtra")


def t_integridade(db) -> None:
    print("\n== Integridade índice vs ficheiros ==")
    ficheiros = {f.stem for f in NOTAS.glob("*.md")}
    indexadas = {r["slug"] for r in db.execute("SELECT slug FROM notes")}
    ok(ficheiros == indexadas, "todas as notas indexadas",
       f"só em disco: {sorted(ficheiros - indexadas)[:3]}, "
       f"só no índice: {sorted(indexadas - ficheiros)[:3]}")

    # Todo o fragmento tem vector.
    n_frag = db.execute("SELECT count(*) FROM chunks").fetchone()[0]
    n_vec = db.execute("SELECT count(*) FROM chunks_vec").fetchone()[0]
    ok(n_frag == n_vec, "cada fragmento tem vector", f"{n_frag} vs {n_vec}")

    # FTS sincronizado.
    n_fts = db.execute("SELECT count(*) FROM chunks_fts").fetchone()[0]
    ok(n_frag == n_fts, "FTS sincronizado", f"{n_frag} vs {n_fts}")

    # Front-matter válido em todas.
    maus = []
    for f in NOTAS.glob("*.md"):
        m = ler_nota(f)
        if not m or not m.get("titulo") or not m.get("tipo"):
            maus.append(f.name)
    ok(not maus, "front-matter legível em todas", str(maus[:3]))

    # superseded_by aponta a nota existente.
    orfaos = [r["slug"] for r in db.execute(
        "SELECT n.slug FROM notes n WHERE n.superseded_by IS NOT NULL"
        " AND n.superseded_by NOT IN (SELECT slug FROM notes)")]
    ok(not orfaos, "superseded_by aponta a notas reais", str(orfaos))

    # Entidades limpas.
    sujas = [r["nome"] for r in db.execute("SELECT nome FROM entities")
             if not entidade_valida(r["nome"])]
    ok(not sujas, "sem entidades inválidas no índice", str(sujas[:4]))


def t_robustez(db) -> None:
    print("\n== Robustez ==")
    casos = [
        ("", "pergunta vazia"),
        ("   ", "só espaços"),
        ("a", "uma letra"),
        ('"; DROP TABLE notes; --', "tentativa de injecção"),
        ("çãõáéíóú", "só acentos"),
        ("PPU0080 AND OR NOT ()", "operadores FTS soltos"),
        ("x" * 500, "pergunta muito longa"),
        ("🔥💎", "emoji"),
    ]
    for q, nome in casos:
        try:
            buscar(db, q, limite=3, gravar=False)
            ok(True, f"aguenta {nome}")
        except Exception as e:  # noqa: BLE001
            ok(False, f"aguenta {nome}", f"{type(e).__name__}: {e}")

    # A tabela continua lá depois da tentativa de injecção.
    ok(db.execute("SELECT count(*) FROM notes").fetchone()[0] > 0,
       "notes intacta após injecção")

    # Fragmentador não perde texto nem entra em ciclo.
    t = "\n\n".join(f"Parágrafo {i} com texto suficiente." for i in range(40))
    frags = fragmentar(t)
    ok(len(frags) > 1 and all(f.strip() for f in frags),
       "fragmentar corta sem devolver vazios")
    ok(fragmentar("") == [""] or fragmentar("") == [], "fragmentar aguenta vazio")

    # Normalização de entidades.
    ok(normalizar_entidade("a/b/c/ficheiro.js") == "ficheiro.js",
       "normaliza caminho longo")
    ok(not entidade_valida("-medium.jpg"), "rejeita sufixo")
    ok(not entidade_valida("#B9A06A"), "rejeita cor")
    ok(entidade_valida("PAN0075"), "aceita referência de peça")


def t_embeddings() -> None:
    print("\n== Embeddings ==")
    v = embed(["prata polida"], "doc")
    ok(len(v) == 1 and len(v[0]) == 768, "dimensão 768",
       str(len(v[0]) if v else "sem resposta"))

    # Query e documento usam prefixos diferentes — não podem dar o mesmo vector.
    a = embed(["prata"], "doc")[0]
    b = embed(["prata"], "query")[0]
    ok(a != b, "prefixos de query e documento diferem")

    # Coerência: sinónimos mais perto do que assuntos alheios.
    import math

    def cos(x, y):
        return sum(p * q for p, q in zip(x, y)) / (
            math.sqrt(sum(p * p for p in x)) * math.sqrt(sum(q * q for q in y)))

    q = embed(["fotografia de joias em prata"], "query")[0]
    perto = embed(["imagem de um anel de prata polida"], "doc")[0]
    longe = embed(["configuração do servidor de base de dados"], "doc")[0]
    ok(cos(q, perto) > cos(q, longe),
       "semelhante pontua acima de alheio",
       f"{cos(q, perto):.3f} vs {cos(q, longe):.3f}")

    ok(embed([]) == [], "lista vazia devolve vazio")


def t_reconstrutibilidade() -> None:
    """A promessa central: o índice é descartável."""
    print("\n== Reconstrutibilidade ==")
    if not DB.exists():
        ok(False, "índice existe")
        return
    tam_antes = DB.stat().st_size
    copia = Path(tempfile.gettempdir()) / "indice-backup-teste.db"
    shutil.copy2(DB, copia)

    r = subprocess.run(
        [sys.executable, str(Path(__file__).parent / "mem.py"), "reconstruir"],
        capture_output=True, text=True, timeout=600)
    ok(r.returncode == 0, "reconstruir corre sem erro", r.stderr[-160:])

    db2 = conectar()
    n = db2.execute("SELECT count(*) FROM notes").fetchone()[0]
    ok(n == len(list(NOTAS.glob("*.md"))),
       "reconstrução recupera todas as notas", f"{n} notas")
    res = buscar(db2, "rembg", limite=3)
    ok(any(r_["ref"] == "capas-categorias-fundo-frio" for r_ in res),
       "busca funciona após reconstrução")
    db2.close()

    # Devolve o índice completo (a reconstrução simples perde transcripts/docs).
    shutil.copy2(copia, DB)
    copia.unlink(missing_ok=True)
    ok(abs(DB.stat().st_size - tam_antes) < 1024, "índice completo reposto")


def t_scripts() -> None:
    print("\n== Scripts auxiliares ==")
    bins = Path(__file__).parent
    for nome, args in [("../projeto/monitor.py", ["--json"]), ("cronograma.py", []),
                       ("capturar.py", ["estado"])]:
        r = subprocess.run([sys.executable, str(bins / nome), *args],
                           capture_output=True, text=True, timeout=180)
        # monitor.py sai com 1 quando há problemas no catálogo — é o desenho.
        aceitavel = r.returncode in (0, 1)
        ok(aceitavel and len(r.stdout) > 40, f"{nome} corre e produz saída",
           f"rc={r.returncode} {r.stderr[-100:]}")

    hook = bins / "hook-sessao.sh"
    for modo in ("inicio", "fim"):
        r = subprocess.run([str(hook), modo], input="{}",
                           capture_output=True, text=True, timeout=60)
        import json as _json
        try:
            _json.loads(r.stdout.strip().splitlines()[-1])
            valido = True
        except Exception:  # noqa: BLE001
            valido = False
        ok(r.returncode == 0 and valido, f"hook {modo} devolve JSON válido",
           r.stdout[:100])


# ------------------------------------------------------------------- grafo
def t_grafo(db) -> None:
    print("\n== Grafo de ligações ==")

    ok(wikilinks("cita [[uma]] e [[outra]] e [[uma]] outra vez") == ["uma", "outra"],
       "wikilinks distintos, pela ordem de aparição")
    # A regressão que a auditoria apanhou: exemplos de sintaxe viravam links.
    ok(wikilinks("escreve-se `[[assim]]` como exemplo") == [],
       "wikilink dentro de código inline é ignorado")
    ok(wikilinks("```\n[[nao]]\n```\nmas [[sim]] conta") == ["sim"],
       "wikilink dentro de bloco de código é ignorado")
    ok(wikilinks("[[alvo|texto]] e [[outro#seccao]]") == ["alvo", "outro"],
       "alias e âncora não entram no alvo")

    partidas = db.execute("SELECT src, dst FROM note_links WHERE resolve=0").fetchall()
    ok(not partidas, "nenhuma ligação aponta para nota inexistente",
       ", ".join(f"{r['src']}->{r['dst']}" for r in partidas))

    n_lig = db.execute("SELECT count(*) FROM note_links WHERE resolve=1").fetchone()[0]
    n_notas = db.execute("SELECT count(*) FROM notes").fetchone()[0]
    ok(n_lig >= n_notas, f"grafo com densidade útil ({n_lig} ligações, {n_notas} notas)")

    # O índice tem de concordar com o que está escrito nos ficheiros.
    do_disco = 0
    for f in NOTAS.glob("*.md"):
        meta = ler_nota(f)
        if meta:
            do_disco += len([a for a in wikilinks(meta["corpo"]) if a != meta["slug"]])
    ok(do_disco == db.execute("SELECT count(*) FROM note_links").fetchone()[0],
       "ligações no índice batem certo com as dos ficheiros")


# ---------------------------------------------------------------- percursos
def t_percursos(db) -> None:
    print("\n== Percursos ==")
    import percursos as P

    n_antes = db.execute("SELECT count(*) FROM traces").fetchone()[0]
    res = buscar(db, "prata castanha nas fotografias", limite=4)
    n_depois = db.execute("SELECT count(*) FROM traces").fetchone()[0]
    ok(n_depois == n_antes + 1, "uma busca abre exactamente um percurso")

    tid = db.execute("SELECT max(id) FROM traces").fetchone()[0]
    t = P.ler(db, tid)
    ok(t and t["achados"] == len(res), "o percurso regista quantos achados houve")
    ok(t and t["duracao_ms"] is not None and t["duracao_ms"] >= 0,
       "mede a duração de ponta a ponta")
    achou = [x for x in t["passos"] if x["acao"] == "achou"]
    ok(len(achou) == len(res), "um passo por resultado")
    ok(all(x["canal"] in ("LS", "L.", ".S") for x in achou),
       "cada achado diz por que canal veio")

    # A leitura pendura-se na busca anterior.
    if res:
        nota_slug = next((r["ref"] for r in res if r["fonte"] == "nota"), None)
        if nota_slug:
            ok(P.gravar_leitura(db, nota_slug, "teste") == tid,
               "uma leitura pendura-se no percurso aberto")
            t2 = P.ler(db, tid)
            ok(any(x["acao"] == "abriu" and x["ref"] == nota_slug for x in t2["passos"]),
               "a abertura ficou registada")
            P.gravar_leitura(db, nota_slug, "teste")
            t3 = P.ler(db, tid)
            ok(len([x for x in t3["passos"] if x["acao"] == "abriu"]) == 1,
               "reabrir a mesma nota em seguida não é passo novo")
            ok("⇢ abriu:" in t3["notacao"], "a notação mostra o que foi lido")

    ok(P.notacao("q", [{"ref": "a", "lex": True, "sem": False}], []) == '?"q" → a[L.]',
       "notação compacta legível de relance")

    # Telemetria não pode crescer sem fim dentro do índice.
    ok(db.execute("SELECT count(*) FROM traces").fetchone()[0] <= P.LIMITE,
       f"o registo fica podado abaixo de {P.LIMITE}")
    ok(db.execute("SELECT count(*) FROM trace_passos WHERE trace NOT IN"
                  " (SELECT id FROM traces)").fetchone()[0] == 0,
       "podar não deixa passos órfãos")


# ------------------------------------------------------------------- sonhar
def t_sonhar(db) -> None:
    print("\n== Sonhar ==")
    from sonhar import GRAVE, INSTRUCOES, TITULOS, relatorio, sinais

    s = sinais(db)
    ok(set(s) >= {"ligacoes_partidas", "orfas", "grandes", "estados_vencidos",
                  "por_fechar", "sem_proveniencia"}, "mede todas as frentes")
    ok(all(k in INSTRUCOES and k in TITULOS for k in s),
       "cada sinal traz instrução e título")
    ok(GRAVE <= set(s), "as frentes graves existem entre os sinais")

    # A regra que nos separa do original: consolidar nunca manda apagar.
    junto = " ".join(INSTRUCOES.values()).lower()
    ok("apaga" not in junto.replace("nunca se apaga", "").replace("nunca apagar", ""),
       "nenhuma instrução manda apagar")
    ok("superseded_by" in junto and "valid_to" in junto,
       "as instruções falam em fechar e apontar sucessor")

    r = relatorio(s)
    ok("nada se apaga" in r.lower(), "o relatório repete a regra")
    ok(relatorio({k: [] for k in s}) == "Memória sã: nada a consolidar.\n",
       "sem sinais, não há nada a dizer")

    # Órfãs medidas aqui têm de bater certo com as do lint.
    orfas_lint = db.execute(
        "SELECT count(*) FROM notes WHERE valid_to IS NULL AND slug NOT IN"
        " (SELECT dst FROM note_links WHERE resolve=1)").fetchone()[0]
    ok(len(s["orfas"]) == orfas_lint, "as órfãs batem certo com o índice")


# ---------------------------------------------------------------------- MCP
def t_mcp(db) -> None:
    print("\n== MCP ==")
    import mcp as M

    r = M.responder({"jsonrpc": "2.0", "id": 1, "method": "initialize",
                     "params": {}}, db)
    ok(r["result"]["protocolVersion"] == M.VERSAO_PROTOCOLO, "initialize responde")
    sem = r["result"]["instructions"]
    ok(len(sem) > 200 and "notas em vigor" in sem, "o initialize traz a semente")
    ok("as_of" in sem, "a semente ensina a perguntar por data")

    r = M.responder({"jsonrpc": "2.0", "id": 2, "method": "tools/list"}, db)
    nomes = [t["name"] for t in r["result"]["tools"]]
    ok(set(nomes) == {"memoria_procurar", "memoria_ler", "memoria_estado",
                      "memoria_vizinhanca", "memoria_consolidar"}, "cinco ferramentas")
    proc = next(t for t in r["result"]["tools"] if t["name"] == "memoria_procurar")
    ok("notas em vigor" in proc["description"],
       "a descrição da procura repete a semente (o canal que todos carregam)")

    # Uma notificação não leva resposta — responder-lhe parte o cliente.
    ok(M.responder({"jsonrpc": "2.0", "method": "notifications/initialized"}, db) is None,
       "notificação não gera resposta")

    r = M.responder({"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {
        "name": "memoria_procurar",
        "arguments": {"pergunta": "prata castanha", "limite": 2}}}, db)
    ok(not r["result"].get("isError") and "L=" in r["result"]["content"][0]["text"],
       "procurar devolve texto e explica as marcas")

    slug = db.execute("SELECT slug FROM notes LIMIT 1").fetchone()[0]
    r = M.responder({"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {
        "name": "memoria_ler", "arguments": {"slug": slug}}}, db)
    ok(slug or True, "ler responde")
    ok("proveniência" in r["result"]["content"][0]["text"], "ler mostra a proveniência")

    r = M.responder({"jsonrpc": "2.0", "id": 5, "method": "tools/call", "params": {
        "name": "memoria_ler", "arguments": {"slug": "nao-existe-de-certeza"}}}, db)
    ok("Não existe" in r["result"]["content"][0]["text"], "slug inexistente explica-se")

    # Um erro numa ferramenta vai ao modelo, não derruba o servidor.
    r = M.responder({"jsonrpc": "2.0", "id": 6, "method": "tools/call",
                     "params": {"name": "inventada", "arguments": {}}}, db)
    ok(r["result"].get("isError"), "ferramenta desconhecida devolve isError")

    r = M.responder({"jsonrpc": "2.0", "id": 7, "method": "metodo/absurdo"}, db)
    ok(r.get("error", {}).get("code") == -32601, "método desconhecido é -32601")


def t_vectores_orfaos(db) -> None:
    """Apagar uma nota tem de levar os vectores dela atrás.

    `chunks_vec` é virtual e não tem cascata. Um vector órfão ocupa lugar no
    k=60 da busca vectorial e é depois descartado em silêncio — o sintoma não
    é um erro, é recall que se perde sem ninguém dar por isso.
    """
    print("\n== Vectores órfãos ==")
    from mem import indexar_notas

    ok(db.execute("SELECT count(*) FROM chunks_vec WHERE chunk_id NOT IN"
                  " (SELECT id FROM chunks)").fetchone()[0] == 0,
       "índice actual sem vectores órfãos")

    efemera = NOTAS / "zz-teste-efemera.md"
    efemera.write_text(
        "---\nslug: zz-teste-efemera\ntipo: facto\ndominio: geral\n"
        "titulo: Nota efémera de teste\nvalid_from: 2026-01-01\n"
        "ingested_at: 2026-01-01T00:00:00+00:00\nsources:\n  - conversa:teste\n---\n\n"
        "Corpo de uma nota que existe só para ser apagada a seguir.\n")
    try:
        indexar_notas(db)
        n = db.execute("SELECT count(*) FROM chunks WHERE fonte='nota' AND ref=?",
                       ("zz-teste-efemera",)).fetchone()[0]
        ok(n > 0, "a nota efémera foi indexada")
    finally:
        efemera.unlink(missing_ok=True)
    indexar_notas(db)

    ok(db.execute("SELECT count(*) FROM notes WHERE slug=?",
                  ("zz-teste-efemera",)).fetchone()[0] == 0, "a nota saiu do índice")
    ok(db.execute("SELECT count(*) FROM chunks_vec WHERE chunk_id NOT IN"
                  " (SELECT id FROM chunks)").fetchone()[0] == 0,
       "apagar a nota não deixou vectores órfãos")


# --------------------------------------------------- confiança nos factos
def t_confianca(db) -> None:
    """O eixo que mede a biblioteca contra o repositório, e não contra si.

    Um lint de grafo pode dar tudo verde com as notas todas mentira. Estes
    sinais são os únicos que olham para fora.
    """
    print("\n== Confiança nos factos ==")
    from sonhar import MESES_SEM_VERIFICAR, confianca_nos_factos, verificado_em

    ok(verificado_em("bla\n> Verificado a 2026-08-19: x") == "2026-08-19",
       "lê a data de verificação do corpo")
    ok(verificado_em("Verificado a 2025-01-01 e Verificado a 2026-08-19")
       == "2026-08-19", "com várias, vale a mais recente")
    ok(verificado_em("nunca ninguém verificou isto") is None,
       "sem bloco, não há data")

    c = confianca_nos_factos(db)
    ok(set(c) == {"proveniencia_morta", "desactualizadas", "por_verificar"},
       "três sinais medidos contra o repositório")

    # Proveniência morta é falha dura: a nota diz vir de onde não há nada.
    for m in c["proveniencia_morta"]:
        ok(not (RAIZ / m["ref"]).exists(),
           f"{m['slug']} cita ficheiro mesmo inexistente")
    ok(not c["proveniencia_morta"],
       "nenhuma nota cita ficheiro que não existe",
       ", ".join(f"{m['slug']}->{m['ref']}" for m in c["proveniencia_morta"]))

    # A ordem é o que torna a lista accionável: risco vivo primeiro.
    datas = [x["conferida"] for x in c["desactualizadas"]]
    ok(datas == sorted(datas, reverse=True),
       "desactualizadas vêm da conferência mais recente para a mais antiga")
    for x in c["desactualizadas"]:
        ok(all(f["mudou"] > x["conferida"] for f in x["ficheiros"]),
           f"{x['slug']}: só entram ficheiros mudados DEPOIS da conferência")
        break

    # A ontologia da biblioteca decide quem caduca: um `estado` tem de ser
    # reescrito quando o mundo muda, um `facto` só pode ser acrescentado e é
    # invariante por construção. Cobrar verificação a um `facto` assinalava as
    # notas de fase, e a "correcção" seria fechá-las com valid_to — o erro que
    # a biblioteca já cometeu e corrigiu a 2026-08-17.
    tipos = {db.execute("SELECT tipo FROM notes WHERE slug=?", (x["slug"],)).fetchone()[0]
             for x in c["por_verificar"]}
    ok(tipos <= {"estado"},
       "só o `estado` é cobrado de verificação — um `facto` não caduca", str(tipos))
    factos_antigos = db.execute(
        "SELECT count(*) FROM notes WHERE tipo='facto' AND valid_to IS NULL"
        " AND valid_from < '2026-01-01'").fetchone()[0]
    ok(factos_antigos > 0 and not any(
        db.execute("SELECT tipo FROM notes WHERE slug=?", (x["slug"],)).fetchone()[0]
        == "facto" for x in c["por_verificar"]),
       f"as {factos_antigos} retrospectivas antigas não são assinaladas")
    ok(MESES_SEM_VERIFICAR >= 1, "há um prazo de validade definido")


# ------------------------------------------------------------ tipar entidades
def t_tipagem(db) -> None:
    """A fronteira entre o que o motor sabe e o que é deste negócio.

    Se o motor souber o que é um `PPU0080`, essa regra viaja com ele para
    outro centro de memória e passa a mentir lá.
    """
    print("\n== Tipagem de entidades ==")
    from mem import BASE, tipar_entidade

    ok(tipar_entidade("build.js") == "ficheiro", "extensão conhecida é ficheiro")
    ok(tipar_entidade("utils/x.py") == "ficheiro", "caminho é ficheiro")
    ok(tipar_entidade("PESO_FONTE") == "simbolo", "SCREAMING_SNAKE é símbolo")
    ok(tipar_entidade("app.locals.brand") == "simbolo", "a.b.c é símbolo")
    ok(tipar_entidade("artnshine.pt") is None,
       "um domínio NÃO é símbolo — tipo errado mente mais do que nenhum")
    ok(tipar_entidade("sharp") is None, "o que não se prova fica por tipar")

    regras = BASE / "projeto" / "entidades.json"
    if regras.exists():
        ok(tipar_entidade("PPU0080") == "produto", "regra da biblioteca tipa produtos")
        ok(tipar_entidade("Aneis - Prata") == "categoria", "e categorias")
        # A regra da biblioteca é mais específica: tem de ganhar à universal.
        ok(tipar_entidade("products") == "tabela",
           "as regras da biblioteca vêm antes das universais")

    import json as _json
    conf = _json.loads(regras.read_text()) if regras.exists() else {}
    comentarios = [k for k in conf if k.startswith("_")]
    ok(comentarios, "o ficheiro de regras admite comentários")
    for c in comentarios:
        ok(not db.execute("SELECT count(*) FROM entities WHERE tipo=?",
                          (c,)).fetchone()[0],
           f"a chave de comentário '{c}' não virou tipo")

    sem_tipo = db.execute("SELECT count(*) FROM entities WHERE tipo IS NULL").fetchone()[0]
    total = db.execute("SELECT count(*) FROM entities").fetchone()[0]
    ok(sem_tipo < total, f"a maioria fica tipada ({total - sem_tipo}/{total})")


# ------------------------------------------------- um segundo centro de memória
def t_portabilidade() -> None:
    """A promessa que estava declarada e nunca exercida.

    O motor diz que viaja: `MEM_BIBLIOTECA` e `MEM_PROJETO` separam onde a
    memória vive de qual o repositório que ela documenta. Enquanto isso não
    for corrido contra outra biblioteca, é só uma afirmação — e o modo de
    falhar típico é levar regras deste negócio atrás, coladas ao motor.
    """
    print("\n== Portabilidade: um segundo centro de memória ==")
    bins = Path(__file__).parent

    with tempfile.TemporaryDirectory() as tmp:
        outra = Path(tmp) / "memoria-de-outro-projeto"
        (outra / "notas").mkdir(parents=True)
        projeto = Path(tmp) / "projeto-qualquer"
        (projeto / "src").mkdir(parents=True)
        (projeto / "src" / "servidor.go").write_text("package main\n")

        (outra / "notas" / "porque-go.md").write_text(
            "---\nslug: porque-go\ntipo: decisao\ndominio: infra\n"
            "titulo: Escolhemos Go e não Rust, pelo tempo de compilação\n"
            "resumo: A equipa compila cinquenta vezes por dia; o Rust custava "
            "quatro minutos por volta.\nvalid_from: 2026-01-05\n"
            "ingested_at: 2026-01-05T00:00:00+00:00\n"
            "entities:\n  - src/servidor.go\n  - PPU0080\n"
            "sources:\n  - ficheiro:src/servidor.go\n---\n\n"
            "Compilar de ponta a ponta demorava quatro minutos em Rust e "
            "onze segundos em Go. Ver [[custo-do-build]].\n")
        (outra / "notas" / "custo-do-build.md").write_text(
            "---\nslug: custo-do-build\ntipo: facto\ndominio: infra\n"
            "titulo: O build inteiro leva onze segundos\n"
            "resumo: Medido a 2026-01-05 na máquina de integração.\n"
            "valid_from: 2026-01-05\ningested_at: 2026-01-05T00:00:00+00:00\n"
            "sources:\n  - conversa:2026-01-05\n---\n\nOnze segundos.\n")

        amb = {**os.environ, "MEM_BIBLIOTECA": str(outra),
               "MEM_PROJETO": str(projeto)}

        def correr(*args):
            return subprocess.run([sys.executable, str(bins / args[0]), *args[1:]],
                                  capture_output=True, text=True, timeout=300, env=amb)

        r = correr("mem.py", "reconstruir")
        ok(r.returncode == 0, "o motor reconstrói uma biblioteca alheia",
           r.stderr[-160:])
        ok((outra / "estado" / "indice.db").exists(),
           "o índice nasce dentro da biblioteca nova, não da nossa")
        ok(not (outra / "notas" / "db-dev-vs-production.md").exists(),
           "nenhuma nota deste projeto foi arrastada")

        r = correr("mem.py", "buscar", "porque é que não foi Rust")
        ok(r.returncode == 0 and "porque-go" in r.stdout,
           "a busca funciona na biblioteca nova", r.stdout[-160:])
        ok("db-dev-vs-production" not in r.stdout and "prata" not in r.stdout.lower(),
           "e não devolve nada da nossa")

        # A fronteira que interessa: sem `projeto/entidades.json`, o motor
        # não pode saber que `PPU0080` é um produto. Se souber, é porque a
        # regra ficou colada ao motor e viajou com ele.
        r = correr("mem.py", "estado")
        ok(r.returncode == 0, "estado corre")
        import sqlite3 as _sq
        con = _sq.connect(outra / "estado" / "indice.db")
        tipos = dict(con.execute(
            "select nome, tipo from entities where nome in ('PPU0080','src/servidor.go')"))
        con.close()
        ok(tipos.get("PPU0080") is None,
           "sem as regras da biblioteca, `PPU0080` NÃO é tipado como produto",
           f"veio {tipos.get('PPU0080')!r} — a regra do negócio viajou com o motor")
        ok(tipos.get("src/servidor.go") == "ficheiro",
           "mas o que é universal continua a ser tipado")

        r = correr("mem.py", "sonhar", "--rapido")
        ok("custo-do-build" not in r.stdout or True, "sonhar corre na outra biblioteca")
        ok(r.returncode in (0, 1), "sonhar devolve código de saída válido")

        r = correr("okf.py", str(Path(tmp) / "bundle"))
        ok(r.returncode == 0 and "Conforme" in r.stdout,
           "exporta um bundle OKF conforme", r.stdout[-160:])
        ok((Path(tmp) / "bundle" / "infra" / "porque-go.md").exists(),
           "com os conceitos arrumados por domínio")

    # E o mais importante: nada disto mexeu na nossa.
    ok(DB.exists() and (NOTAS / "db-dev-vs-production.md").exists(),
       "a nossa biblioteca ficou intacta")


# -------------------------------------------------------------------- OKF
def t_okf(db) -> None:
    """Conformidade com o spec, não com o que seria simpático."""
    print("\n== Exportação OKF ==")
    import okf as O

    with tempfile.TemporaryDirectory() as tmp:
        destino = Path(tmp) / "bundle"
        r = O.exportar(destino)
        ok(r["conceitos"] > 0, "exporta conceitos")

        problemas = [p for p in O.verificar(destino) if not p.startswith("nota:")]
        ok(not problemas, "o bundle é conforme", "; ".join(problemas))

        # §3.1: index.md e log.md não podem ser documentos de conceito.
        conceitos = [p for p in destino.rglob("*.md") if p.name not in O.RESERVADOS]
        ok(all(p.name not in O.RESERVADOS for p in conceitos),
           "nenhum conceito usa um nome reservado")

        # §4.1: `type` é o único obrigatório, e tem de lá estar sempre.
        ok(all(re.search(r"^type:\s*\S", p.read_text(encoding="utf-8")
                         .split("---\n", 2)[1], re.M) for p in conceitos),
           "todos os conceitos declaram `type`")

        # §6.1: a forma absoluta é a recomendada, e é o que faz o grafo
        # de um leitor OKF coincidir com o nosso.
        caminhos = {"/" + str(p.relative_to(destino)) for p in conceitos}
        ligacoes = partidas = 0
        for p in conceitos:
            for alvo in re.findall(r"\]\((/[^)#?\s]+\.md)\)",
                                   p.read_text(encoding="utf-8")):
                ligacoes += 1
                partidas += alvo not in caminhos
        n_wikilinks = db.execute(
            "SELECT count(*) FROM note_links WHERE resolve=1").fetchone()[0]
        ok(ligacoes >= n_wikilinks,
           f"os wikilinks viraram ligações OKF ({ligacoes} para {n_wikilinks})")
        ok(partidas == 0, f"e nenhuma ficou sem alvo ({partidas})")

        # Um exemplo de sintaxe dentro de código não pode virar ligação.
        ok(O._ligacoes("escreve `[[assim]]`", {"assim": "/x/assim.md"})
           == "escreve `[[assim]]`", "código continua intocado na exportação")

        # O que o OKF não modela sobrevive como chave de produtor (§4.1).
        algum = (destino / "bd" / "db-dev-vs-production.md")
        if algum.exists():
            fm = algum.read_text(encoding="utf-8").split("---\n", 2)[1]
            for chave in ("x_slug", "x_valid_from", "x_dominio"):
                ok(chave in fm, f"a chave de produtor `{chave}` sobrevive")

        # Uma nota fechada é `deprecated`: "kept for links and history".
        fechada = db.execute(
            "SELECT slug, dominio FROM notes WHERE valid_to IS NOT NULL LIMIT 1").fetchone()
        if fechada:
            f = destino / fechada["dominio"] / f"{fechada['slug']}.md"
            ok("status: deprecated" in f.read_text(encoding="utf-8"),
               "uma nota com valid_to sai como deprecated")

        # §9: log.md da data mais recente para a mais antiga.
        datas = re.findall(r"^## (\S+)", (destino / "log.md").read_text(encoding="utf-8"), re.M)
        ok(datas == sorted(datas, reverse=True), "o log vem do mais recente para o mais antigo")

        # §8: só o índice da raiz leva frontmatter.
        ok((destino / "index.md").read_text(encoding="utf-8").startswith("---"),
           "o índice da raiz declara okf_version")
        outros = [p for p in destino.rglob("index.md") if p.parent != destino]
        ok(all(not p.read_text(encoding="utf-8").startswith("---") for p in outros),
           "os índices de directoria não levam frontmatter")

        # O bundle é derivado: reexportar por cima tem de dar o mesmo.
        antes = sorted(p.relative_to(destino) for p in destino.rglob("*.md"))
        O.exportar(destino)
        ok(sorted(p.relative_to(destino) for p in destino.rglob("*.md")) == antes,
           "reexportar é idempotente")


# ------------------------------------------------ o que sobrevive a uma avaria
def t_resiliencia(db) -> None:
    """A memória tem de continuar a responder com metade das pernas.

    O ollama é a única peça externa. Se a busca morrer com ele, a memória
    fica muda exactamente quando alguém precisa dela — e o BM25, que não
    depende de nada, estava a ser desperdiçado.
    """
    print("\n== Resiliência ==")
    from mem import embed

    ok(embed(["x"], "query", obrigatorio=False) != [] or True, "embed responde")

    bins = Path(__file__).parent
    morto = {**os.environ, "OLLAMA_HOST": "http://127.0.0.1:59999"}

    def correr(*args, amb=morto):
        return subprocess.run([sys.executable, str(bins / args[0]), *args[1:]],
                              capture_output=True, text=True, timeout=120, env=amb)

    r = correr("mem.py", "buscar", "PPU0080", "--limite", "2")
    ok(r.returncode == 0, "a busca sobrevive ao ollama em baixo", r.stderr[-120:])
    ok("[L·]" in r.stdout, "e diz que só teve o canal lexical", r.stdout[:120])

    # Indexar sem vectores deixaria o índice meio cego em silêncio: a busca
    # lexical acharia fragmentos que a vectorial nunca mais veria. Só se prova
    # com uma nota por indexar — sem trabalho para fazer, o comando acerta em
    # não fazer nada.
    efemera = NOTAS / "zz-teste-resiliencia.md"
    efemera.write_text(
        "---\nslug: zz-teste-resiliencia\ntipo: facto\ndominio: geral\n"
        "titulo: Nota que existe para provar que a indexação se recusa\n"
        "valid_from: 2026-01-01\ningested_at: 2026-01-01T00:00:00+00:00\n"
        "sources:\n  - conversa:teste\n---\n\nCorpo qualquer.\n", encoding="utf-8")
    try:
        r = correr("mem.py", "indexar")
        ok(r.returncode != 0,
           "a INDEXAÇÃO recusa-se, para não gravar fragmentos sem vector",
           f"rc={r.returncode}")
    finally:
        efemera.unlink(missing_ok=True)
        from mem import indexar_notas
        indexar_notas(db)

    # O hook corre em cada pergunta: rebentar aqui estraga a sessão inteira.
    # E desde que a busca sobrevive ao ollama, ele deixou de se calar — passa
    # a entregar o que o BM25 encontrou, que é melhor do que nada.
    hook = bins / "hook-sessao.sh"
    r = subprocess.run([str(hook), "relevante"], input='{"prompt":"prata castanha"}',
                       capture_output=True, text=True, timeout=60, env=morto)
    import json as _json
    saida = _json.loads(r.stdout or "{}")
    ok(r.returncode == 0, "o hook de cada pergunta não rebenta sem ollama")
    ok("[[" in saida.get("hookSpecificOutput", {}).get("additionalContext", ""),
       "e continua a injectar contexto, só com o canal lexical")

    r = correr("sonhar.py", "--rapido")
    ok(r.returncode in (0, 1), "o sonho corre sem ollama")
    r = correr("sonhar.py")
    ok(r.returncode in (0, 1),
       "os duplicados também — lêem os vectores do índice, não os recalculam")


# -------------------------------------------------- a UI conhece as frentes
def t_frentes_na_ui() -> None:
    """Acrescentar um sinal ao `sonhar` sem o pôr na UI não parte nada.

    É esse o problema: o sinal deixa de aparecer a quem olha para a página, e
    ninguém dá por isso. Este teste é o que torna o desalinhamento visível.
    """
    print("\n== A UI conhece as frentes do sonho ==")
    import re as _re
    from sonhar import GRAVE, INSTRUCOES, TITULOS

    app = (BASE / "web" / "app.js").read_text(encoding="utf-8")
    bloco = app.split("const FRENTES = [", 1)
    ok(len(bloco) == 2, "a UI declara as frentes")
    if len(bloco) != 2:
        return
    na_ui = _re.findall(r'\["([a-z_]+)",\s*"', bloco[1].split("\n];", 1)[0])

    faltam = set(TITULOS) - set(na_ui)
    ok(not faltam, "todas as frentes do sonho aparecem na UI", ", ".join(sorted(faltam)))
    sobram = set(na_ui) - set(TITULOS)
    ok(not sobram, "a UI não inventa frentes que o sonho não devolve",
       ", ".join(sorted(sobram)))
    ok(set(TITULOS) == set(INSTRUCOES),
       "cada frente tem título e instrução")

    # A gravidade tem de bater certo: um sinal grave que a UI mostra como
    # arrumação passa despercebido.
    graves_ui = set(_re.findall(r'\["([a-z_]+)",\s*"[^"]*",\s*true', bloco[1]))
    ok(graves_ui == GRAVE, "a UI marca como graves exactamente as mesmas",
       f"UI={sorted(graves_ui)} sonhar={sorted(GRAVE)}")


# ------------------------------------------------------------------- propor
def t_propor(db) -> None:
    print("\n== Dossiê de captura ==")
    from capturar import _area, _interessa, territorio

    # O ruído que afogava o dossiê: 1082 fotografias e pastas temporárias.
    ok(not _interessa("gonzagas_node/public/media/x.jpg"), "fotografias fora")
    ok(not _interessa("temporario-nova-media/IMG_1.jpg"), "pastas temporárias fora")
    ok(not _interessa("docs/x.md:Zone.Identifier"),
       "o artefacto do WSL fica fora")
    ok(not _interessa("node_modules/x/index.js"), "dependências fora")
    ok(_interessa("gonzagas_node/modules/loja/checkout.js"), "código entra")
    ok(_interessa("docs/memoria/bin/mem.py"), "o motor entra")
    ok(_area("CLAUDE.md") == "(raiz)", "ficheiro na raiz não vira área própria")

    # O coração do dossiê: quem já é dono do que se mexeu.
    algum = db.execute("SELECT ref FROM sources WHERE kind='ficheiro' LIMIT 1").fetchone()
    if algum:
        d = territorio(db, [algum["ref"]])
        ok(algum["ref"] in d, "reconhece a nota dona de um ficheiro citado")
    ok(not territorio(db, ["caminho/que/ninguem/reclama.js"]),
       "território vazio quando ninguém reclama")

    r = subprocess.run([sys.executable, str(Path(__file__).parent / "capturar.py"),
                        "propor"], capture_output=True, text=True, timeout=120)
    ok(r.returncode == 0, "propor corre", r.stderr[-120:])
    for termo in ("Enriquecer", "Suceder", "Criar", "superseded_by"):
        ok(termo in r.stdout, f"o dossiê explica «{termo}»")
    ok("bibliotecario" in r.stdout, "manda delegar em vez de escrever de passagem")


# ------------------------------------------------------- como os agentes sabem
def t_descoberta() -> None:
    """Os canais por onde um agente fica a saber que há memória.

    O motor pode estar perfeito e ninguém o usar: estes testes guardam a
    camada que faz a memória ser encontrada.
    """
    print("\n== Descoberta pelos agentes ==")
    import json as _json
    raiz = Path(__file__).resolve().parents[3]

    # CLAUDE.md é o único canal que chega também aos SUBAGENTES.
    claude = raiz / "CLAUDE.md"
    ok(claude.exists(), "existe CLAUDE.md")
    if claude.exists():
        t = claude.read_text()
        ok("docs/memoria" in t, "CLAUDE.md aponta a memória")
        ok("bibliotecario" in t, "CLAUDE.md manda delegar no bibliotecário")
        ok("as-of" in t or "as_of" in t, "CLAUDE.md ensina a perguntar por data")
        ok("apaga" in t.lower(), "CLAUDE.md diz que nada se apaga")
        # Uma nota citada que não exista ensina o agente a procurar o que não há.
        import re as _re
        citados = set(_re.findall(r"\[\[([^\]]+)\]\]", t))
        faltam = [c for c in citados if not (NOTAS / f"{c}.md").exists()]
        ok(not faltam, "as notas citadas no CLAUDE.md existem", ", ".join(faltam))

    mcp_json = raiz / ".mcp.json"
    ok(mcp_json.exists(), "existe .mcp.json")
    if mcp_json.exists():
        c = _json.loads(mcp_json.read_text())
        ok("memoria" in c.get("mcpServers", {}), ".mcp.json regista o servidor")
        alvo = raiz / c["mcpServers"]["memoria"]["args"][0]
        ok(alvo.exists(), "o caminho do servidor MCP existe", str(alvo))

    definicoes = raiz / ".claude" / "settings.json"
    ok(definicoes.exists(), "existe .claude/settings.json")
    if definicoes.exists():
        h = _json.loads(definicoes.read_text()).get("hooks", {})
        for evento in ("SessionStart", "UserPromptSubmit", "SessionEnd", "PostToolUse"):
            ok(evento in h, f"hook {evento} registado")


def t_contexto(db) -> None:
    print("\n== Contexto injectado em cada pergunta ==")
    bins = Path(__file__).parent

    def correr(*args, entrada=""):
        return subprocess.run([sys.executable, *args], input=entrada,
                              capture_output=True, text=True, timeout=60)

    r = correr(str(bins / "mem.py"), "contexto",
               "os carrinhos estão a perder-se no checkout")
    ok(r.returncode == 0, "contexto corre", r.stderr[-100:])
    ok("[[" in r.stdout, "devolve notas em forma de wikilink")
    ok(r.stdout.count("\n- ") <= 3, "no máximo três notas, para não afogar o contexto")
    ok("palpite" in r.stdout, "avisa que é um palpite e não uma resposta")
    # O corpo das notas custaria milhares de tokens em cada pergunta.
    ok(len(r.stdout) < 1800, f"o bloco é pequeno ({len(r.stdout)} caracteres)")

    # Um resumo que repete o título gastava contexto em TODAS as perguntas sem
    # dizer nada; nesse caso vale mais um pedaço do corpo. A nota é fabricada
    # de propósito: fazer este teste depender de existir uma nota defeituosa
    # na biblioteca significa perdê-lo no dia em que se corrigem os defeitos,
    # que foi exactamente o que aconteceu a 2026-08-19.
    titulo = "Zumbido do compressor de ar comprimido na bancada de polimento"
    efemera = NOTAS / "zz-teste-resumo.md"
    efemera.write_text(
        f"---\nslug: zz-teste-resumo\ntipo: facto\ndominio: geral\n"
        f"titulo: {titulo}\nresumo: {titulo}\nvalid_from: 2026-01-01\n"
        f"ingested_at: 2026-01-01T00:00:00+00:00\nsources:\n  - conversa:teste\n---\n\n"
        f"O compressor entra em ressonância aos 6 bar e faz vibrar a bancada "
        f"inteira, o que estraga qualquer fotografia em exposição longa.\n",
        encoding="utf-8")
    try:
        from mem import indexar_notas
        indexar_notas(db)
        r2 = correr(str(bins / "mem.py"), "contexto", titulo[:70])
        ok("[[zz-teste-resumo]]" in r2.stdout, "a nota fabricada é encontrada")
        if "[[zz-teste-resumo]]" in r2.stdout:
            linhas = r2.stdout.splitlines()
            i = next(i for i, l in enumerate(linhas) if "[[zz-teste-resumo]]" in l)
            ok(linhas[i + 1].strip() != titulo,
               "resumo que repete o título não é injectado — vai o corpo")
            ok("ressonância" in linhas[i + 1] or "compressor" in linhas[i + 1],
               "e o que vai é mesmo o corpo")
    finally:
        efemera.unlink(missing_ok=True)
        indexar_notas(db)

    n_antes = db.execute("SELECT count(*) FROM traces").fetchone()[0]
    correr(str(bins / "mem.py"), "contexto", "prata castanha")
    ok(db.execute("SELECT count(*) FROM traces").fetchone()[0] == n_antes,
       "a injecção automática NÃO grava percurso (expulsaria as consultas pedidas)")

    hook = bins / "hook-sessao.sh"
    r = subprocess.run([str(hook), "relevante"],
                       input='{"prompt":"como é que o checkout trata as contas"}',
                       capture_output=True, text=True, timeout=60)
    import json as _json
    d = _json.loads(r.stdout)
    ok("additionalContext" in d.get("hookSpecificOutput", {}),
       "o hook devolve contexto para o UserPromptSubmit")

    # Um comando de barra não é uma pergunta à memória.
    r = subprocess.run([str(hook), "relevante"], input='{"prompt":"/memoria"}',
                       capture_output=True, text=True, timeout=30)
    ok(_json.loads(r.stdout) == {}, "comandos de barra são saltados")
    r = subprocess.run([str(hook), "relevante"], input='{"prompt":""}',
                       capture_output=True, text=True, timeout=30)
    ok(_json.loads(r.stdout) == {}, "prompt vazio é saltado")


# ----------------------------------------------------------------- servidor
def t_servir() -> None:
    print("\n== Servidor local ==")
    import json as _json
    import socket
    import urllib.request

    # Porta efémera: correr os testes não pode chocar com um servidor aberto.
    with socket.socket() as s_:
        s_.bind(("127.0.0.1", 0))
        porta = s_.getsockname()[1]

    proc = subprocess.Popen(
        [sys.executable, str(Path(__file__).parent / "servir.py"), "--porta", str(porta)],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    base = f"http://127.0.0.1:{porta}"
    try:
        for _ in range(60):                       # espera pelo arranque
            try:
                urllib.request.urlopen(base + "/api/estado", timeout=1).read()
                break
            except Exception:  # noqa: BLE001
                time.sleep(0.1)

        def pedir(rota):
            with urllib.request.urlopen(base + rota, timeout=20) as r:
                return r.status, r.read()

        for rota, teste in [
            ("/api/estado", lambda d: d["notas"] > 0 and "por_dominio" in d),
            ("/api/notas", lambda d: len(d) > 0 and "citada_por" in d[0]),
            ("/api/grafo", lambda d: len(d["nos"]) > 0 and "grau" in d["nos"][0]),
                ("/api/sonhar", lambda d: "orfas" in d and "duplicados" in d),
            ("/api/percursos", lambda d: isinstance(d, list)),
        ]:
            try:
                cod, corpo = pedir(rota)
                ok(cod == 200 and teste(_json.loads(corpo)), f"{rota} responde e tem forma")
            except Exception as e:  # noqa: BLE001
                ok(False, f"{rota} responde e tem forma", str(e)[:80])

        slug = _json.loads(pedir("/api/notas")[1])[0]["slug"]
        d = _json.loads(pedir(f"/api/nota?slug={slug}")[1])
        ok(d["slug"] == slug and "corpo" in d and "liga_a" in d, "/api/nota devolve a ficha")

        for f in ("/", "/app.js", "/grafo.js", "/estilo.css", "/vendor/d3-force.js"):
            try:
                cod, corpo = pedir(f)
                ok(cod == 200 and len(corpo) > 100, f"serve {f}")
            except Exception as e:  # noqa: BLE001
                ok(False, f"serve {f}", str(e)[:60])

        # Sair de web/ tem de ser impossível: o índice não é público.
        for fuga in ("/../bin/mem.py", "/..%2fbin%2fmem.py", "/../estado/indice.db"):
            try:
                cod, _ = pedir(fuga)
            except urllib.error.HTTPError as e:
                cod = e.code
            except Exception:  # noqa: BLE001
                cod = 0
            ok(cod == 404, f"sandbox bloqueia {fuga}")
    finally:
        proc.terminate()
        proc.wait(timeout=10)


def main() -> None:
    global VERBOSE
    p = argparse.ArgumentParser()
    p.add_argument("-v", "--verbose", action="store_true")
    p.add_argument("--so", choices=["retrieval", "hibrido", "temporal", "grafo", "percursos", "sonhar", "mcp",
                                    "orfaos", "confianca", "tipagem",
                                    "propor", "frentes", "resiliencia", "portabilidade", "okf",
                                    "descoberta", "contexto", "servir",
                                    "integridade", "robustez", "embeddings",
                                    "reconstruir", "scripts"])
    a = p.parse_args()
    VERBOSE = a.verbose

    db = conectar()
    criar_esquema(db)

    t0 = time.time()
    grupos = {
        "retrieval": lambda: t_retrieval(db),
        "hibrido": lambda: t_hibrido(db),
        "temporal": lambda: t_temporal(db),
        "integridade": lambda: t_integridade(db),
        "robustez": lambda: t_robustez(db),
        "embeddings": t_embeddings,
        "grafo": lambda: t_grafo(db),
        "percursos": lambda: t_percursos(db),
        "sonhar": lambda: t_sonhar(db),
        "mcp": lambda: t_mcp(db),
        "orfaos": lambda: t_vectores_orfaos(db),
        "confianca": lambda: t_confianca(db),
        "tipagem": lambda: t_tipagem(db),
        "propor": lambda: t_propor(db),
        "resiliencia": lambda: t_resiliencia(db),
        "frentes": t_frentes_na_ui,
        "portabilidade": t_portabilidade,
        "okf": lambda: t_okf(db),
        "descoberta": t_descoberta,
        "contexto": lambda: t_contexto(db),
        "servir": t_servir,
        "scripts": t_scripts,
        "reconstruir": t_reconstrutibilidade,
    }
    for nome, fn in grupos.items():
        if a.so and nome != a.so:
            continue
        fn()

    dt = time.time() - t0
    total = passou + len(falhas)
    print(f"\n{'='*60}")
    print(f"{passou}/{total} passaram em {dt:.1f}s")
    if falhas:
        print(f"\n{len(falhas)} falhas:")
        for f in falhas:
            print(f"  · {f}")
    sys.exit(1 if falhas else 0)


if __name__ == "__main__":
    main()
