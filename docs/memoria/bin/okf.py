#!/usr/bin/env python3
"""Exporta a biblioteca como um bundle Open Knowledge Format (OKF) v0.2.

Porquê exportar em vez de adoptar o formato: as nossas notas continuam a ser
a fonte de verdade, em português e com o modelo bi-temporal inteiro. O bundle
OKF é **derivado e descartável**, como o índice SQLite — regenera-se, e nunca
se edita à mão. Assim ganha-se interoperabilidade sem duplicar campos dentro
das notas, que era o caminho garantido para os dois lados divergirem.

O que o OKF v0.2 nos dá de graça, e que não esperávamos:

    verified     a convenção "> Verificado a <data>" passa a campo estruturado
    status       valid_to fechado vira `deprecated`
    stale_after  a política dos quatro meses fica declarada, e não implícita

E o que ele não tem — `valid_from`, `superseded_by`, a cadeia de supersessão —
sobrevive como chave de produtor: o §4.1 diz que "Producers MAY include any
additional keys" e que os consumidores devem preservá-las.

  okf.py <destino>              escreve o bundle
  okf.py <destino> --verificar  só valida o que lá está
"""
from __future__ import annotations

import re
import shutil
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from mem import BASE, conectar  # noqa: E402
from sonhar import MESES_SEM_VERIFICAR, verificado_em  # noqa: E402

VERSAO_OKF = "0.2"

# §3.1: estes nomes não podem ser documentos de conceito.
RESERVADOS = {"index.md", "log.md"}

# Quem escreveu estas notas. O §4.1 pede `generated` para conteúdo produzido
# por agente, e é o caso: são escritas em sessão e revistas por uma pessoa.
# Declarar isto é mais honesto do que omitir e deixar parecer autoria humana.
AUTOR = "agent:claude+revisão-humana"


# ------------------------------------------------------------------ YAML
def _yaml_valor(v) -> str:
    """Escalar YAML seguro. Sem dependências: o motor não tem pyyaml, e não
    vale a pena arranjar uma por causa de escrever meia dúzia de campos."""
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    s = str(v)
    # Aspas quando o conteúdo pode confundir o parser: dois pontos, aspas,
    # início ambíguo, ou vazio.
    if (not s or s[0] in "&*!|>%@`[]{}#-?" or ": " in s or s.endswith(":")
            or '"' in s or "\n" in s):
        return '"' + s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ") + '"'
    return s


def _yaml(campos: list[tuple[str, object]], indent: int = 0) -> list[str]:
    pre = " " * indent
    linhas = []
    for chave, valor in campos:
        if valor is None or valor == [] or valor == "":
            continue
        if isinstance(valor, dict):
            corpo = ", ".join(f"{k}: {_yaml_valor(v)}" for k, v in valor.items() if v)
            linhas.append(f"{pre}{chave}: {{ {corpo} }}")
        elif isinstance(valor, list):
            linhas.append(f"{pre}{chave}:")
            for item in valor:
                if isinstance(item, dict):
                    corpo = ", ".join(f"{k}: {_yaml_valor(v)}"
                                      for k, v in item.items() if v)
                    linhas.append(f"{pre}  - {{ {corpo} }}")
                else:
                    linhas.append(f"{pre}  - {_yaml_valor(item)}")
        else:
            linhas.append(f"{pre}{chave}: {_yaml_valor(valor)}")
    return linhas


# ------------------------------------------------------------- conversão
def _fonte_okf(kind: str, ref: str) -> dict:
    """Uma `sources` nossa (`kind:ref`) na forma do §7.

    `resource` é obrigatório dentro de cada entrada, e o spec aceita lá tanto
    um artefacto que se pode seguir como um descritor de âmbito que não se
    pode — que é o caso de `conversa:2026-08-18`.
    """
    return {"id": kind, "resource": ref, "title": f"{kind}: {ref}"}


def _ligacoes(corpo: str, destino_de: dict[str, str]) -> str:
    """`[[slug]]` vira a forma absoluta do §6.1, que o spec recomenda.

    É esta reescrita que faz o grafo de qualquer leitor OKF coincidir com o
    nosso: sem ela, o bundle sai sem uma única aresta.
    """
    def troca(m):
        alvo = m.group(1).strip()
        caminho = destino_de.get(alvo)
        return f"[{alvo}]({caminho})" if caminho else f"`{alvo}`"

    # Não tocar no que está dentro de código: uma nota que explique a sintaxe
    # escreve `[[assim]]` como exemplo, e já nos mordeu uma vez.
    partes = re.split(r"(```.*?```|`[^`\n]+`)", corpo, flags=re.S)
    for i in range(0, len(partes), 2):
        partes[i] = re.sub(r"\[\[([^\]|#]+?)(?:[|#][^\]]*)?\]\]", troca, partes[i])
    return "".join(partes)


def conceito(n: dict, fontes: list[dict], destino_de: dict[str, str]) -> str:
    verificada = verificado_em(n["corpo"])
    base = verificada or n["valid_from"]

    campos: list[tuple[str, object]] = [
        # §4.1 — o único obrigatório.
        ("type", n["tipo"]),
        ("title", n["titulo"]),
        ("description", n["resumo"]),
        ("tags", [n["dominio"]] + ([n["tipo"]] if n["tipo"] != n["dominio"] else [])),
        # §9 — ciclo de vida. Uma nota fechada com valid_to fica `deprecated`:
        # "kept for links and history; no longer current" descreve-a exactamente.
        ("status", "deprecated" if n["valid_to"] else "stable"),
    ]

    # A política dos quatro meses deixa de ser implícita no nosso `sonhar` e
    # passa a estar declarada no ficheiro, onde qualquer leitor a vê.
    if base and n["tipo"] in ("estado", "facto"):
        try:
            d = datetime.strptime(base, "%Y-%m-%d").date()
            campos.append(("stale_after",
                           (d + timedelta(days=MESES_SEM_VERIFICAR * 30)).isoformat()))
        except ValueError:
            pass

    campos.append(("generated", {"by": AUTOR, "at": n["ingested_at"]}))
    if verificada:
        campos.append(("verified", [{"by": "human:revisão", "at": f"{verificada}T00:00:00Z"}]))
    if fontes:
        campos.append(("sources", fontes))

    # Chaves de produtor: o que o OKF não modela e nós não abdicamos.
    campos += [
        ("x_slug", n["slug"]),
        ("x_dominio", n["dominio"]),
        ("x_valid_from", n["valid_from"]),
        ("x_valid_to", n["valid_to"]),
        ("x_superseded_by", n["superseded_by"]),
        ("x_confianca", n["confianca"]),
        ("x_keywords", n["keywords"]),
    ]

    corpo = _ligacoes(n["corpo"], destino_de)
    return "---\n" + "\n".join(_yaml(campos)) + "\n---\n\n" + corpo.strip() + "\n"


def indice(titulo: str, entradas: list[tuple[str, str, str]], raiz: bool) -> str:
    """§8: sem frontmatter, salvo o `okf_version` no índice da raiz."""
    linhas = []
    if raiz:
        linhas += ["---", f"okf_version: {VERSAO_OKF}", "---", ""]
    linhas += [f"# {titulo}", ""]
    for nome, caminho, desc in entradas:
        linhas.append(f"- [{nome}]({caminho})" + (f" — {desc}" if desc else ""))
    return "\n".join(linhas) + "\n"


def registo(notas: list[dict]) -> str:
    """§9: lista plana agrupada por data, da mais recente para a mais antiga."""
    por_data: dict[str, list[str]] = {}
    for n in notas:
        d = n["valid_from"] or (n["ingested_at"] or "")[:10]
        if not d:
            continue
        por_data.setdefault(d, []).append(
            f"- **{'Update' if n['valid_to'] else 'Creation'}** "
            f"[{n['titulo']}](/{n['dominio']}/{n['slug']}.md)")
    linhas = ["# Log", ""]
    for d in sorted(por_data, reverse=True):
        linhas += [f"## {d}", ""] + sorted(por_data[d]) + [""]
    return "\n".join(linhas)


# ----------------------------------------------------------------- escrita
def exportar(destino: Path) -> dict:
    db = conectar()
    notas = [dict(r) for r in db.execute(
        "SELECT slug, tipo, dominio, titulo, resumo, corpo, keywords, valid_from,"
        " valid_to, ingested_at, superseded_by, confianca FROM notes ORDER BY slug")]
    fontes: dict[str, list[dict]] = {}
    for r in db.execute("SELECT slug, kind, ref FROM sources"):
        fontes.setdefault(r["slug"], []).append(_fonte_okf(r["kind"], r["ref"]))

    # O caminho absoluto de cada nota, para as ligações do §6.1.
    destino_de = {n["slug"]: f"/{n['dominio']}/{n['slug']}.md" for n in notas}

    # O bundle é derivado: se existe, refaz-se do zero em vez de se remendar.
    if destino.exists():
        shutil.rmtree(destino)
    destino.mkdir(parents=True)

    por_dominio: dict[str, list[dict]] = {}
    for n in notas:
        if f"{n['slug']}.md" in RESERVADOS:
            print(f"  aviso: {n['slug']} colide com nome reservado, saltada",
                  file=sys.stderr)
            continue
        por_dominio.setdefault(n["dominio"], []).append(n)
        pasta = destino / n["dominio"]
        pasta.mkdir(exist_ok=True)
        (pasta / f"{n['slug']}.md").write_text(
            conceito(n, fontes.get(n["slug"], []), destino_de), encoding="utf-8")

    for dom, ns in por_dominio.items():
        (destino / dom / "index.md").write_text(
            indice(dom, [(n["titulo"], f"/{dom}/{n['slug']}.md", n["resumo"] or "")
                         for n in sorted(ns, key=lambda x: x["slug"])], raiz=False),
            encoding="utf-8")

    (destino / "index.md").write_text(
        indice("Memória do projeto",
               [(dom, f"/{dom}/index.md", f"{len(ns)} conceitos")
                for dom, ns in sorted(por_dominio.items())], raiz=True),
        encoding="utf-8")
    (destino / "log.md").write_text(registo(notas), encoding="utf-8")

    return {"conceitos": sum(len(v) for v in por_dominio.values()),
            "directorios": len(por_dominio)}


# -------------------------------------------------------------- validação
def verificar(destino: Path) -> list[str]:
    """Conformidade com o que o spec exige, não com o que seria simpático."""
    problemas = []
    if not destino.is_dir():
        return [f"{destino} não é uma directoria"]

    conceitos = [p for p in destino.rglob("*.md") if p.name not in RESERVADOS]
    if not conceitos:
        problemas.append("bundle sem um único conceito")

    caminhos = {"/" + str(p.relative_to(destino)) for p in conceitos}
    for p in conceitos:
        t = p.read_text(encoding="utf-8")
        rel = p.relative_to(destino)
        if not t.startswith("---\n"):
            problemas.append(f"{rel}: sem frontmatter (§4.1 exige `type`)")
            continue
        fm = t.split("---\n", 2)[1]
        if not re.search(r"^type:\s*\S", fm, re.M):
            problemas.append(f"{rel}: falta o campo obrigatório `type` (§4.1)")
        st = re.search(r"^status:\s*(\S+)", fm, re.M)
        if st and st.group(1) not in ("draft", "stable", "deprecated"):
            problemas.append(f"{rel}: status '{st.group(1)}' fora de draft|stable|deprecated")
        for d in re.findall(r"^stale_after:\s*(\S+)", fm, re.M):
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", d):
                problemas.append(f"{rel}: stale_after '{d}' não é YYYY-MM-DD (§9)")

    # §8: o index.md não leva frontmatter, salvo o okf_version na raiz.
    for p in destino.rglob("index.md"):
        t = p.read_text(encoding="utf-8")
        if t.startswith("---\n"):
            if p.parent != destino:
                problemas.append(f"{p.relative_to(destino)}: só o índice da raiz "
                                 f"pode ter frontmatter (§8)")
            elif "okf_version" not in t.split("---\n", 2)[1]:
                problemas.append("index.md da raiz: frontmatter sem okf_version (§8)")

    # §9: datas ISO, da mais recente para a mais antiga.
    log = destino / "log.md"
    if log.exists():
        datas = re.findall(r"^## (\S+)", log.read_text(encoding="utf-8"), re.M)
        for d in datas:
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", d):
                problemas.append(f"log.md: '{d}' não é uma data ISO (§9)")
        if datas != sorted(datas, reverse=True):
            problemas.append("log.md: as datas não estão da mais recente para a mais antiga (§9)")

    # §6.1 tolera ligações partidas — não é erro, mas convém saber quantas.
    partidas = 0
    for p in conceitos:
        for alvo in re.findall(r"\]\((/[^)#?\s]+\.md)\)", p.read_text(encoding="utf-8")):
            if alvo not in caminhos:
                partidas += 1
    if partidas:
        problemas.append(f"nota: {partidas} ligações sem alvo "
                         f"(o §6.1 tolera-as, não são malformadas)")
    return problemas


def main() -> int:
    import argparse
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("destino", nargs="?",
                    default=str(BASE / "estado" / "okf"),
                    help="onde escrever o bundle (por omissão, estado/okf — descartável)")
    ap.add_argument("--verificar", action="store_true",
                    help="não exporta; só valida o que já lá está")
    a = ap.parse_args()
    destino = Path(a.destino)

    if not a.verificar:
        r = exportar(destino)
        print(f"{r['conceitos']} conceitos em {r['directorios']} directorias -> {destino}")

    problemas = verificar(destino)
    if problemas:
        print(f"\n{len(problemas)} pontos:")
        for p in problemas:
            print(f"  {p}")
        return 1 if any("nota:" not in p for p in problemas) else 0
    print(f"Conforme com o OKF v{VERSAO_OKF}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
