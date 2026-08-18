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
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from mem import (BASE, DB, NOTAS, buscar, conectar, criar_esquema,  # noqa: E402
                 embed, entidade_valida, fragmentar, ler_nota,
                 normalizar_entidade, _fts_query)

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
    ("branches por integrar e worktrees a mais",
     {"trabalho-em-curso-2026-08"}),
    ("a produção corre em docker num servidor próprio",
     {"waphix-production-infra"}),
]


def t_retrieval(db) -> None:
    print("\n== Retrieval (alvo no top-3) ==")
    acertos_1 = acertos_3 = 0
    lentos = []
    for pergunta, esperados in CASOS:
        t0 = time.time()
        res = buscar(db, pergunta, limite=3)
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
        res = buscar(db, q, limite=3)
        tem_lex = any(r["lex"] for r in res)
        ok(tem_lex, f"«{q}» usa o canal lexical")

    for q in so_semantico:
        res = buscar(db, q, limite=3)
        tem_sem = any(r["sem"] for r in res)
        ok(tem_sem, f"«{q[:38]}» usa o canal semântico")

    # O sinal forte [LS] deve aparecer nas perguntas bem formadas.
    res = buscar(db, "porque é que a prata fica acastanhada", limite=3)
    ok(any(r["lex"] and r["sem"] for r in res),
       "pergunta natural aciona os dois canais")


def t_temporal(db) -> None:
    print("\n== Bi-temporalidade ==")
    # A nota fechada não deve sair na busca normal.
    normal = [r["ref"] for r in buscar(db, "estado do rebranding homepage", limite=8)]
    ok("estado-2026-07-30" not in normal, "nota expirada fora da busca normal")

    com_exp = [r["ref"] for r in buscar(db, "estado do rebranding homepage",
                                        limite=8, incluir_expirado=True)]
    ok("estado-2026-07-30" in com_exp, "--incluir-expirado devolve a expirada",
       str(com_exp[:3]))

    # as-of anterior à criação de uma nota não a devolve.
    antigo = [r["ref"] for r in buscar(db, "chaves da stripe em texto simples",
                                       limite=8, as_of="2026-01-01")]
    ok("seguranca-chaves-stripe" not in antigo,
       "--as-of 2026-01-01 esconde nota de Agosto", str(antigo[:3]))

    # Filtros de tipo e domínio.
    so_proc = buscar(db, "memória", limite=6, tipo="procedimento")
    ok(all(r["tipo"] == "procedimento" for r in so_proc) and so_proc,
       "--tipo filtra")
    so_dom = buscar(db, "prata", limite=6, dominio="fotografia")
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
            buscar(db, q, limite=3)
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
    for nome, args in [("monitor.py", ["--json"]), ("cronograma.py", []),
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


def main() -> None:
    global VERBOSE
    p = argparse.ArgumentParser()
    p.add_argument("-v", "--verbose", action="store_true")
    p.add_argument("--so", choices=["retrieval", "hibrido", "temporal",
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
