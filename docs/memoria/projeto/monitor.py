#!/usr/bin/env python3
"""Monitorização das frentes que ainda estão a decorrer.

Mede o estado real (base de dados, ficheiros, git) e compara-o com o que
se espera. O que distingue um problema de uma opção deliberada está
codificado em cada verificação — as 102 peças do lote de Agosto não têm
preço de propósito, e o monitor sabe disso; a 103.ª é que é anomalia.

  monitor.py              relatório legível
  monitor.py --json       para alimentar notas de estado
  monitor.py --breve      só o que está mau

Requer as credenciais em gonzagas_node/.env. Só faz leituras.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from datetime import date, datetime
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "bin"))
from mem import RAIZ  # noqa: E402  a raiz do projeto é do motor
ENV = RAIZ / "gonzagas_node" / ".env"

# Ramos que vivem para sempre ao lado da main e não se integram nela.
RAMOS_PERMANENTES = ("memoria", "feat/sistema-memoria")

OK, AVISO, MAU = "ok", "aviso", "mau"
SIMBOLO = {OK: "  ok  ", AVISO: " aviso", MAU: "  MAU "}


def credenciais() -> dict[str, str]:
    d = {}
    if ENV.exists():
        for linha in ENV.read_text(errors="ignore").splitlines():
            m = re.match(r"^\s*(DB_\w+)\s*=\s*(.*?)\s*(?:#.*)?$", linha)
            if m:
                d[m.group(1)] = m.group(2).strip().strip("\"'")
    return d


def consultar(sql: str) -> list[dict]:
    """Executa SQL de leitura e devolve linhas como dicionários."""
    c = credenciais()
    if not c.get("DB_NAME"):
        return []
    cmd = ["mysql", "-u", c.get("DB_USER", "root"), "-h", c.get("DB_HOST", "localhost"),
           c["DB_NAME"], "--batch", "--raw", "-e", sql]
    amb = dict(os.environ)
    senha = c.get("DB_PASSWORD") or c.get("DB_PASS")
    if senha:
        amb["MYSQL_PWD"] = senha                 # não passa pela linha de comandos
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=60, env=amb)
    except (subprocess.SubprocessError, OSError):
        return []
    linhas = [l for l in r.stdout.splitlines() if l.strip()]
    if len(linhas) < 2:
        return []
    cab = linhas[0].split("\t")
    return [dict(zip(cab, l.split("\t"))) for l in linhas[1:]]


def _n(v) -> int:
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return 0


# ------------------------------------------------------------ verificações
def ver_catalogo() -> list[dict]:
    r = consultar("""
        SELECT COUNT(*) total,
          SUM(sale_price IS NULL OR sale_price=0) sem_preco,
          SUM(sale_price IS NULL OR sale_price=0) - SUM(
            (sale_price IS NULL OR sale_price=0) AND created_at >= '2026-08-01') anomalia_preco,
          SUM(current_stock<=0) sem_stock,
          SUM(purchase_price IS NULL OR purchase_price=0) sem_custo,
          SUM(description IS NULL OR description='') sem_descricao,
          SUM(slug IS NULL OR slug='') sem_slug
        FROM products WHERE deleted_at IS NULL AND is_active=1""")
    if not r:
        return [{"chave": "catalogo", "estado": AVISO,
                 "msg": "sem acesso à base de dados local"}]
    d, out = r[0], []
    total = _n(d["total"])

    out.append({"chave": "produtos.total", "estado": OK, "valor": total,
                "msg": f"{total} produtos activos"})

    # As 102 peças do lote de Agosto estão sem preço de propósito ("sob
    # consulta"); qualquer outra sem preço é erro.
    anom = _n(d["anomalia_preco"])
    out.append({"chave": "produtos.sem_preco_anomalo", "valor": anom,
                "estado": OK if anom == 0 else MAU,
                "msg": (f"{_n(d['sem_preco'])} sem preço, dos quais {anom} fora do "
                        f"lote de Agosto" if anom else
                        f"{_n(d['sem_preco'])} sem preço, todos do lote de Agosto (deliberado)")})

    semimg = consultar("""
        SELECT COUNT(DISTINCT p.id) n FROM products p
        LEFT JOIN product_images pi ON pi.product_id=p.id
        WHERE p.deleted_at IS NULL AND p.is_active=1 AND pi.id IS NULL""")
    n = _n(semimg[0]["n"]) if semimg else 0
    out.append({"chave": "produtos.sem_imagem", "valor": n,
                "estado": OK if n == 0 else MAU,
                "msg": f"{n} produtos activos sem imagem associada"})

    sc = _n(d["sem_custo"])
    out.append({"chave": "produtos.sem_custo", "valor": sc,
                "estado": OK if sc == 0 else AVISO,
                "msg": f"{sc}/{total} sem preço de custo — sem isto não há margem"})

    # O peso é mostrado ao cliente em views/catalog/product-detail.ejs. Uma
    # peça de joalharia acima de 500 g é erro de introdução, e fica à vista.
    peso = consultar("""
        SELECT COUNT(*) n, GROUP_CONCAT(reference ORDER BY weight DESC
               SEPARATOR ', ') refs
        FROM products WHERE deleted_at IS NULL AND is_active=1 AND weight > 500""")
    if peso:
        n = _n(peso[0]["n"])
        refs = (peso[0].get("refs") or "")[:60]
        out.append({"chave": "produtos.peso_implausivel", "valor": n,
                    "estado": OK if n == 0 else MAU,
                    "msg": (f"{n} com peso acima de 500 g — visível na ficha: {refs}"
                            if n else "nenhum peso implausível")})

    ss = _n(d["sem_stock"])
    out.append({"chave": "produtos.sem_stock", "valor": ss,
                "estado": OK if ss < total * 0.25 else AVISO,
                "msg": f"{ss}/{total} com stock a zero"})

    for campo, rotulo in (("sem_descricao", "descrição"), ("sem_slug", "slug")):
        v = _n(d[campo])
        out.append({"chave": f"produtos.{campo}", "valor": v,
                    "estado": OK if v == 0 else MAU,
                    "msg": f"{v} sem {rotulo}"})
    return out


def ver_seo() -> list[dict]:
    out = []
    plano = RAIZ / "docs" / "SEO" / "seo.md"
    if plano.exists():
        txt = plano.read_text(errors="ignore")
        feitas = len(re.findall(r"✅", txt))
        m = re.search(r"FALTA \((\d+) tarefas\)", txt)
        faltam = int(m.group(1)) if m else 0
        out.append({"chave": "seo.plano", "valor": faltam,
                    "estado": OK if faltam == 0 else AVISO,
                    "msg": f"plano-mestre: {feitas} marcas de feito, {faltam} tarefas por fazer"})

    nomes = RAIZ / "docs" / "SEO" / "nomes-produtos.md"
    if nomes.exists() and nomes.stat().st_size == 0:
        out.append({"chave": "seo.nomes_produtos", "valor": 0, "estado": AVISO,
                    "msg": "docs/SEO/nomes-produtos.md está vazio desde que foi criado"})
    return out


PROD = "https://artnshine.pt"


def ver_producao() -> list[dict]:
    """Lê o feed publicado. É a única via de consulta a produção a partir daqui.

    O waphix só encaminha 80/443 no router, por isso não há SSH nem MySQL
    directo; o site está ainda atrás da Cloudflare. O feed, o sitemap e o
    robots são públicos e sem autenticação — e é por aí que se vê o estado
    real, que **não** é o da base local.
    """
    import urllib.error  # noqa: PLC0415
    import urllib.request  # noqa: PLC0415

    out = []
    try:
        req = urllib.request.Request(
            f"{PROD}/feed/products.xml",
            headers={"User-Agent": "memoria-monitor/1.0 (leitura)"})
        with urllib.request.urlopen(req, timeout=45) as r:
            xml = r.read().decode("utf-8", "ignore")
    except (urllib.error.URLError, OSError, TimeoutError) as e:
        out.append({"chave": "producao.feed", "estado": AVISO,
                    "msg": f"não consegui ler o feed de produção ({e})"})
        return out

    itens = re.findall(r"<item>.*?</item>", xml, re.S)
    precos = [re.search(r"<g:price>([\d.]+)", i) for i in itens]
    zero = sum(1 for p in precos if p and float(p.group(1)) == 0)
    stock = len(re.findall(r"<g:availability>in_stock", xml))

    out.append({"chave": "producao.feed_itens", "valor": len(itens), "estado": OK,
                "msg": f"{len(itens)} itens no feed publicado em {PROD}"})
    out.append({"chave": "producao.preco_zero", "valor": zero,
                "estado": OK if zero == 0 else MAU,
                "msg": (f"{zero} itens publicados com <g:price>0.00 EUR</g:price>"
                        if zero else "nenhum item publicado com preço zero")})
    out.append({"chave": "producao.em_stock", "valor": stock, "estado": OK,
                "msg": f"{stock}/{len(itens)} publicados como in_stock"})

    # A diferença entre as duas bases é informação, não erro: a local costuma
    # estar atrasada. Vale a pena vê-la em número.
    loc = consultar("SELECT SUM(sale_price IS NULL OR sale_price=0) z"
                    " FROM products WHERE is_active=1")
    if loc:
        zl = _n(loc[0]["z"])
        dif = zl - zero
        out.append({"chave": "producao.divergencia_precos", "valor": dif,
                    "estado": OK if dif == 0 else AVISO,
                    "msg": (f"local tem {zl} sem preço, produção {zero} — "
                            f"a base local está {dif} atrás"
                            if dif > 0 else
                            f"local {zl}, produção {zero} — local à frente")})
    return out


def ver_feed() -> list[dict]:
    """O que a base LOCAL produziria no feed. Não é o que está publicado.

    `getAllForMerchantFeed()` filtra apenas por `is_active = 1`, sem olhar ao
    preço — e o feed escreve `0.00 EUR` quando não há preço. É a mesma
    armadilha do €0,00 que foi corrigida em quatro vistas mas não aqui.
    """
    out = []
    r = consultar("""
        SELECT COUNT(*) total,
          SUM(sale_price IS NULL OR sale_price=0) preco_zero,
          SUM(deleted_at IS NOT NULL) apagados,
          SUM(current_stock > 0) em_stock
        FROM products WHERE is_active = 1""")
    if not r:
        return out
    d = r[0]
    total, zero = _n(d["total"]), _n(d["preco_zero"])

    out.append({"chave": "feed.itens", "valor": total, "estado": OK,
                "msg": f"{total} produtos entrariam no feed a partir da BD local"})

    # Preço 0,00 faz o Merchant Center recusar o item — ou, pior, publicá-lo.
    out.append({"chave": "feed.preco_zero", "valor": zero,
                "estado": OK if zero == 0 else MAU,
                "msg": (f"{zero} itens da BD local dariam <g:price>0.00 EUR</g:price>"
                        if zero else "nenhum item com preço zero no feed")})

    apag = _n(d["apagados"])
    out.append({"chave": "feed.apagados", "valor": apag,
                "estado": OK if apag == 0 else MAU,
                "msg": (f"{apag} produtos com deleted_at entram no feed — falta"
                        " o filtro" if apag else
                        "nenhum produto apagado no feed")})

    # Sem imagem principal o item cai no og-artnshine.jpg genérico.
    sem_img = consultar("""
        SELECT COUNT(*) n FROM products p WHERE p.is_active = 1
          AND NOT EXISTS (SELECT 1 FROM product_images pi
                          WHERE pi.product_id = p.id AND pi.is_primary = 1)""")
    if sem_img:
        n = _n(sem_img[0]["n"])
        out.append({"chave": "feed.sem_imagem_principal", "valor": n,
                    "estado": OK if n == 0 else AVISO,
                    "msg": f"{n} itens sem imagem principal — o feed serve a genérica"})

    out.append({"chave": "feed.em_stock", "valor": _n(d["em_stock"]),
                "estado": OK,
                "msg": f"{_n(d['em_stock'])}/{total} anunciados como in_stock"})
    return out


def ver_git() -> list[dict]:
    def g(*a):
        return subprocess.run(["git", *a], cwd=RAIZ, capture_output=True,
                              text=True, timeout=60).stdout.strip()

    out = []
    pend = []
    for linha in g("for-each-ref", "--format=%(refname:short)", "refs/heads/").splitlines():
        # `memoria` é um ramo permanente que por desenho NUNCA vai à main —
        # acusá-lo de estar por integrar é um alarme que só cresce e nunca se
        # resolve. O `feat/sistema-memoria` é o nome antigo do mesmo trabalho.
        # Ver a nota `fork-memoria-permanente`.
        if linha in ("main", *RAMOS_PERMANENTES):
            continue
        n = g("rev-list", "--count", f"main..{linha}")
        if n and n != "0":
            pend.append(f"{linha} ({n})")
    out.append({"chave": "git.branches_pendentes", "valor": len(pend),
                "estado": OK if not pend else AVISO,
                "msg": ("nada por integrar" if not pend
                        else "por integrar em main: " + ", ".join(pend))})

    # Agregado por pasta de topo: 45 fotografias soltas são uma frente de
    # trabalho, não 45 problemas.
    frentes: set[str] = set()
    for l in g("status", "--porcelain").splitlines():
        if len(l) < 4 or "docs/memoria/" in l:
            continue
        partes = Path(l[3:].strip().strip('"')).parts
        frentes.add("/".join(partes[:2]) if len(partes) > 2 else partes[0])
    out.append({"chave": "git.nao_commitado", "valor": len(frentes),
                "estado": OK if len(frentes) < 8 else AVISO,
                "msg": f"{len(frentes)} frentes por commitar: "
                       + ", ".join(sorted(frentes)[:6])
                       + ("…" if len(frentes) > 6 else "")})

    # Worktrees cujo trabalho já está em main só ocupam espaço.
    obsoletas = []
    for linha in g("worktree", "list").splitlines():
        m = re.search(r"\[(.+?)\]", linha)
        if m and m.group(1) != "main":
            n = g("rev-list", "--count", f"main..{m.group(1)}")
            if n == "0":
                obsoletas.append(m.group(1))
    if obsoletas:
        out.append({"chave": "git.worktrees_obsoletas", "valor": len(obsoletas),
                    "estado": AVISO,
                    "msg": f"{len(obsoletas)} worktrees já integradas: "
                           + ", ".join(w.replace("claude/", "") for w in obsoletas)})
    return out


def ver_media() -> list[dict]:
    out = []
    gal = RAIZ / "gonzagas_node" / "public" / "media" / "gallery"
    if not gal.exists():
        return out

    # A pasta mistura .jpg e .jpeg; contar só uma extensão subestima.
    imagens = [p for p in gal.iterdir()
               if p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")]
    out.append({"chave": "media.galeria", "valor": len(imagens), "estado": OK,
                "msg": f"{len(imagens)} imagens na galeria"})

    # Registos sem ficheiro dão imagem partida no site.
    regs = consultar("SELECT filename FROM gallery_items WHERE is_active=1")
    if regs:
        nomes = {p.name for p in gal.iterdir()}
        orfaos = [r["filename"] for r in regs
                  if Path(r["filename"] or "").name not in nomes]
        out.append({"chave": "media.galeria_orfaos", "valor": len(orfaos),
                    "estado": OK if not orfaos else MAU,
                    "msg": (f"{len(orfaos)} registos de galeria sem ficheiro: "
                            + ", ".join(Path(o).name for o in orfaos[:3])
                            if orfaos else
                            f"{len(regs)} registos de galeria, todos com ficheiro")})

        # Ficheiros na pasta que ninguém mostra.
        usados = {Path(r["filename"] or "").name for r in regs}
        soltos = [p.name for p in imagens if p.name not in usados]
        if soltos:
            out.append({"chave": "media.galeria_soltos", "valor": len(soltos),
                        "estado": AVISO,
                        "msg": f"{len(soltos)} imagens na pasta sem registo "
                               f"(não aparecem no site)"})
    return out


SECCOES = [("Catálogo", ver_catalogo), ("SEO", ver_seo),
           ("Feed local (o que a BD local daria)", ver_feed),
           ("Produção publicada", ver_producao),
           ("Git e integração", ver_git), ("Media", ver_media)]


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--json", action="store_true")
    p.add_argument("--breve", action="store_true", help="só avisos e problemas")
    a = p.parse_args()

    tudo = []
    for nome, fn in SECCOES:
        for r in fn():
            r["seccao"] = nome
            tudo.append(r)

    if a.json:
        print(json.dumps({"data": date.today().isoformat(), "itens": tudo},
                         ensure_ascii=False, indent=1))
        return

    print(f"Monitorização — {date.today().isoformat()}\n")
    seccao_atual = None
    for r in tudo:
        if a.breve and r["estado"] == OK:
            continue
        if r["seccao"] != seccao_atual:
            seccao_atual = r["seccao"]
            print(f"\n== {seccao_atual} ==")
        print(f"  [{SIMBOLO[r['estado']]}] {r['msg']}")

    maus = sum(1 for r in tudo if r["estado"] == MAU)
    avisos = sum(1 for r in tudo if r["estado"] == AVISO)
    print(f"\n{maus} problemas, {avisos} avisos, {len(tudo)} verificações")
    sys.exit(1 if maus else 0)


if __name__ == "__main__":
    main()
