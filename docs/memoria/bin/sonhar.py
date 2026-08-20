#!/usr/bin/env python3
"""Sonhar: consolidação da memória, no intervalo em que ninguém a usa.

A ideia é do understory, e o que nela vale não é o agente — é o **gatilho
determinístico**: sinais medidos decidem se há alguma coisa a fazer, e uma
memória saudável não custa nada porque nem chega a acordar ninguém.

Duas diferenças face ao original, e são de fundo:

1. **Não escreve.** Produz uma ordem de trabalho. Quem escreve notas neste
   sistema é sempre um humano ou o bibliotecário a rever — o código mede e
   aponta, nunca inventa conteúdo por sua conta.

2. **Não apaga.** O dreaming do understory funde duplicados e apaga o
   perdedor. Aqui um facto não se apaga: fecha-se com `valid_to` e aponta-se
   `superseded_by` para o sucessor. É o que permite continuar a responder "o
   que era verdade a 30 de julho" depois de a consolidação passar.

  sonhar.py            mostra a ordem de trabalho
  sonhar.py --json     a mesma coisa, para a página
  sonhar.py --silencio só o código de saída: 0 nada a fazer, 1 há trabalho
"""
from __future__ import annotations

import json
import math
import re
import subprocess
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from mem import NOTAS, RAIZ, conectar, embed  # noqa: E402

# Uma nota que cresceu muito por acumulação costuma ter deixado de ser um
# facto para passar a ser vários. O limiar é generoso: só aponta o que já é
# nitidamente um aglomerado.
GRANDE = 9000

# Acima disto, dois corpos dizem provavelmente a mesma coisa. Medido sobre o
# corpo inteiro e não sobre título e descrição, que é o que o understory
# compara — daí apanhar-se aqui o que lá passaria em claro.
SEMELHANTE = 0.88

# Um facto sobre o mundo não avisa quando deixa de ser verdade. Passado este
# tempo sem ninguém o confrontar com a realidade, deixa de ser conhecimento e
# passa a ser suposição — mesmo que ninguém lhe tenha tocado.
MESES_SEM_VERIFICAR = 4

# Bloco de verificação: `> Verificado a 2026-08-18: ...`. É a convenção que
# distingue "isto foi medido nesta data" de "isto foi escrito nesta data".
_VERIFICADO = re.compile(r"Verificado a (\d{4}-\d{2}-\d{2})")


def verificado_em(corpo: str) -> str | None:
    """A data de verificação mais recente declarada no corpo da nota."""
    datas = _VERIFICADO.findall(corpo or "")
    return max(datas) if datas else None


def _datado_pelo_git(caminhos: list[str]) -> dict[str, str | None]:
    """Última data em que o git viu cada ficheiro mudar.

    Um `git log` por ficheiro citado — dezenas de milissegundos, porque escala
    com a proveniência e não com o repositório. Uma passagem única sobre o
    histórico inteiro custava quatro vezes mais.
    """
    datas: dict[str, str | None] = {}
    for c in caminhos:
        try:
            r = subprocess.run(["git", "log", "-1", "--format=%cs", "--", c],
                               cwd=RAIZ, capture_output=True, text=True, timeout=10)
            datas[c] = r.stdout.strip() or None
        except (OSError, subprocess.SubprocessError):
            datas[c] = None
    return datas


def confianca_nos_factos(db) -> dict:
    """Sinais de que uma nota pode ter deixado de bater certo com o mundo.

    Isto é o eixo que falta a qualquer lint de grafo: o grafo pode estar
    perfeitamente costurado e as notas todas mentira. Aqui não se mede a
    biblioteca contra si própria — mede-se contra o repositório.
    """
    hoje = date.today()
    limite_idade = (hoje - timedelta(days=MESES_SEM_VERIFICAR * 30)).isoformat()

    notas = {r["slug"]: dict(r) for r in db.execute(
        "SELECT slug, titulo, tipo, corpo, valid_from FROM notes"
        " WHERE valid_to IS NULL")}
    fontes: dict[str, list[str]] = {}
    for r in db.execute("SELECT slug, ref FROM sources WHERE kind='ficheiro'"):
        if r["slug"] in notas:
            fontes.setdefault(r["slug"], []).append(r["ref"])

    todos = sorted({c for v in fontes.values() for c in v})
    datas = _datado_pelo_git(todos)

    morta, desactualizadas = [], []
    for slug, caminhos in sorted(fontes.items()):
        n = notas[slug]
        # A data a partir da qual a nota se dá por conferida: a verificação
        # explícita, se houver; senão a data em que passou a valer.
        conferida = verificado_em(n["corpo"]) or n["valid_from"] or "0000-00-00"
        mexidos = []
        for c in caminhos:
            if not (RAIZ / c).exists():
                morta.append({"slug": slug, "ref": c})
                continue
            d = datas.get(c)
            if d and d > conferida:
                mexidos.append({"ref": c, "mudou": d})
        if mexidos:
            desactualizadas.append({"slug": slug, "titulo": n["titulo"],
                                    "conferida": conferida, "ficheiros": mexidos})

    # Só se cobra verificação ao `estado`, e a ontologia desta biblioteca é
    # que decide: um `estado` tem de ser REESCRITO quando o mundo muda, e é
    # por isso que caduca; um `facto` só pode ser ACRESCENTADO, portanto é
    # invariante por construção — «que em Fevereiro de 2026 se trocou o azul
    # por prata é verdade para sempre». Cobrar verificação a um `facto`
    # assinalava as notas de fase, que descrevem períodos fechados, e a
    # correcção seria fechá-las com valid_to — exactamente o erro que a
    # biblioteca já tinha cometido e corrigido a 2026-08-17. Ver
    # `memoria-como-funciona`, secção «Retrospectiva é facto, não estado».
    #
    # O sinal `desactualizadas` continua a cobrir todos os tipos: aí a
    # instrução é ir ver, e num `facto` a resposta certa é acrescentar um
    # bloco de verificação novo, não fechar a nota.
    por_verificar = []
    for slug, n in sorted(notas.items()):
        if n["tipo"] != "estado":
            continue
        v = verificado_em(n["corpo"])
        base = v or n["valid_from"]
        if base and base < limite_idade:
            por_verificar.append({"slug": slug, "titulo": n["titulo"],
                                  "desde": base, "alguma_vez": bool(v)})

    # Ordenar pela data de conferência, da mais recente para a mais antiga:
    # uma nota conferida a semana passada cujo ficheiro mudou ontem é risco
    # vivo; uma de 2025 que ninguém tocou é quase sempre história por fechar.
    desactualizadas.sort(key=lambda x: x["conferida"], reverse=True)
    por_verificar.sort(key=lambda x: x["desde"], reverse=True)

    return {"proveniencia_morta": morta,
            "desactualizadas": desactualizadas,
            "por_verificar": por_verificar}


def sinais(db) -> dict:
    """Tudo o que se mede sem perguntar nada a um modelo generativo."""
    hoje = date.today().isoformat()

    partidas = [dict(r) for r in db.execute(
        "SELECT src, dst FROM note_links WHERE resolve=0 ORDER BY src")]

    orfas = []
    for r in db.execute(
            "SELECT slug, titulo, dominio FROM notes WHERE valid_to IS NULL"
            " AND slug NOT IN (SELECT dst FROM note_links WHERE resolve=1)"
            " ORDER BY slug"):
        saidas = db.execute(
            "SELECT count(*) FROM note_links WHERE src=? AND resolve=1",
            (r["slug"],)).fetchone()[0]
        orfas.append({**dict(r), "ilha": not saidas})

    grandes = [dict(r) for r in db.execute(
        "SELECT slug, titulo, length(corpo) AS tamanho FROM notes"
        " WHERE length(corpo) > ? ORDER BY tamanho DESC", (GRANDE,))]

    vencidas = [dict(r) for r in db.execute(
        "SELECT slug, titulo, valid_from FROM notes WHERE tipo='estado'"
        " AND valid_to IS NULL AND superseded_by IS NULL AND valid_from < ?"
        " ORDER BY valid_from", (hoje[:8] + "01",))]

    por_fechar = [dict(r) for r in db.execute(
        "SELECT slug, superseded_by FROM notes"
        " WHERE superseded_by IS NOT NULL AND valid_to IS NULL")]

    # Um resumo que repete o título não acrescenta nada — e custa caro, porque
    # é ele que vai no contexto injectado em cada pergunta e no `description`
    # do OKF. As 19 que havia vieram todas da migração da auto-memória, onde
    # um único campo alimentou o título e o resumo.
    resumo_redundante = [dict(r) for r in db.execute(
        "SELECT slug, titulo FROM notes WHERE valid_to IS NULL AND resumo IS NOT NULL"
        " AND (resumo = titulo OR resumo LIKE titulo || '%') ORDER BY slug")]

    sem_prov = [r["slug"] for r in db.execute(
        "SELECT n.slug FROM notes n LEFT JOIN sources s ON s.slug=n.slug"
        " WHERE s.slug IS NULL ORDER BY n.slug")]

    return {
        "ligacoes_partidas": partidas,
        "orfas": orfas,
        "grandes": grandes,
        "estados_vencidos": vencidas,
        "por_fechar": por_fechar,
        "sem_proveniencia": sem_prov,
        "resumo_redundante": resumo_redundante,
        "duplicados": [],          # caro: só se calcula quando é pedido
        **confianca_nos_factos(db),
    }


def duplicados(db) -> list[dict]:
    """Pares muito semelhantes. Custa uma passagem de embeddings, por isso
    fica fora do `sinais` e só corre quando alguém quer mesmo saber."""
    notas = list(db.execute("SELECT slug, titulo, corpo FROM notes"
                            " WHERE valid_to IS NULL"))
    if len(notas) < 2:
        return []
    vecs = embed([n["corpo"][:1500] for n in notas], "doc",
                 [n["titulo"] for n in notas])
    pares = []
    for i in range(len(notas)):
        for j in range(i + 1, len(notas)):
            a, b = vecs[i], vecs[j]
            na = math.sqrt(sum(x * x for x in a))
            nb = math.sqrt(sum(x * x for x in b))
            if not na or not nb:
                continue
            sim = sum(x * y for x, y in zip(a, b)) / (na * nb)
            if sim > SEMELHANTE:
                pares.append({"a": notas[i]["slug"], "b": notas[j]["slug"],
                              "semelhanca": round(sim, 4)})
    return sorted(pares, key=lambda p: -p["semelhanca"])


# Cada sinal traz consigo o que fazer com ele. É aqui que o nosso modelo
# diverge do original: em nenhum caso a instrução é apagar.
INSTRUCOES = {
    "ligacoes_partidas":
        "Corrigir o alvo se a nota mudou de nome, ou tirar a ligação se o "
        "assunto deixou de existir. Se o alvo era um exemplo de sintaxe, "
        "envolvê-lo em crase para o extractor o ignorar.",
    "orfas":
        "Ler e costurar: citar a nota a partir de outra que genuinamente lhe "
        "toque. Se não toca em nada, deixar como está — uma nota isolada não "
        "é um defeito, é só um assunto que ainda não tem vizinhos.",
    "grandes":
        "Se o corpo já são vários assuntos separáveis, extrair cada um para "
        "nota própria e deixar a original como entrada, a citar as novas. "
        "Nunca apagar o que se extraiu.",
    "estados_vencidos":
        "Um 'estado' antigo ainda em vigor é quase sempre mentira. Verificar "
        "contra a realidade e, se mudou, escrever a sucessora, fechar esta "
        "com valid_to e apontar-lhe superseded_by.",
    "por_fechar":
        "Tem sucessora mas continua em vigor: falta fechar o valid_to. É a "
        "cadeia de supersessão a meio.",
    "sem_proveniencia":
        "Sem sources não se pode auditar a afirmação depois. Acrescentar de "
        "onde veio: conversa, commit, ficheiro ou url.",
    "resumo_redundante":
        "O resumo repete o título e não acrescenta nada. Não é cosmética: é "
        "o resumo que vai no contexto injectado em cada pergunta e no campo "
        "`description` do OKF, portanto o desperdício paga-se sempre. "
        "Reescrever para dizer o que o título não diz — a consequência, o "
        "número, a armadilha.",
    "duplicados":
        "Ler o par. Se dizem a mesma coisa, a melhor situada absorve a outra "
        "e a outra fecha-se com valid_to + superseded_by a apontar-lhe — "
        "NUNCA se apaga. Se são distintas, citam-se uma à outra.",
    "proveniencia_morta":
        "A nota diz que veio de um ficheiro que já não existe. Se o ficheiro "
        "mudou de sítio, corrigir o caminho; se desapareceu, dizer no corpo o "
        "que lhe aconteceu — a proveniência é o que permite auditar depois.",
    "desactualizadas":
        "O ficheiro de onde a nota veio mudou depois de ela ter sido "
        "conferida. NÃO é prova de que a nota está errada — é motivo para a "
        "ler contra o ficheiro. Se continua verdadeira, acrescentar um bloco "
        "'> Verificado a <hoje>'. Se mudou, escrever a sucessora e fechar "
        "esta com valid_to. Caso à parte, e frequente no fim desta lista: se "
        "a nota descreve um PERÍODO JÁ FECHADO (uma fase, um lote, um mês), "
        "ela não está desactualizada — está por fechar. O certo é pôr-lhe "
        "valid_to na data em que o período acabou, e não re-verificá-la "
        "contra o mundo de hoje.",
    "por_verificar":
        "Um `estado` descreve como as coisas estão, e há meses que ninguém o "
        "confronta com a realidade. Medir com o monitor.py ou uma query. Se "
        "continua a bater certo, acrescentar '> Verificado a <hoje>' com os "
        "números novos; se mudou, escrever a sucessora e fechar este com "
        "valid_to. Só o `estado` entra aqui: um `facto` é invariante por "
        "construção e não caduca.",
}

TITULOS = {
    "ligacoes_partidas": "ligações para notas que não existem",
    "orfas": "notas que ninguém cita",
    "grandes": "notas que cresceram demais",
    "estados_vencidos": "estados antigos ainda dados como em vigor",
    "por_fechar": "substituídas mas ainda em vigor",
    "sem_proveniencia": "notas sem proveniência",
    "resumo_redundante": "o resumo repete o título",
    "duplicados": "pares que talvez digam o mesmo",
    "proveniencia_morta": "proveniência a apontar para ficheiro que já não existe",
    "desactualizadas": "o ficheiro mudou depois de a nota ter sido conferida",
    "por_verificar": "estados que há muito ninguém confronta com a realidade",
}

# O que é mesmo um erro, e o que é só arrumação por fazer.
GRAVE = {"ligacoes_partidas", "por_fechar", "estados_vencidos",
         "proveniencia_morta", "desactualizadas"}


def relatorio(s: dict) -> str:
    activos = {k: v for k, v in s.items() if v}
    if not activos:
        return "Memória sã: nada a consolidar.\n"

    graves = sum(len(v) for k, v in activos.items() if k in GRAVE)
    linhas = [f"# Sonho de {date.today().isoformat()}", ""]
    total = sum(len(v) for v in activos.values())
    linhas.append(f"{total} ponto{'s' if total != 1 else ''} em {len(activos)} "
                  f"frente{'s' if len(activos) != 1 else ''}, "
                  f"{graves} a precisar de decisão.")
    linhas.append("")
    linhas.append("**Regra desta biblioteca: nada se apaga.** Um facto que deixou "
                  "de ser verdade fecha-se com `valid_to` e aponta `superseded_by` "
                  "para quem o substituiu.")
    linhas.append("")

    for chave in ("desactualizadas", "proveniencia_morta", "ligacoes_partidas",
                  "por_fechar", "estados_vencidos", "por_verificar",
                  "duplicados", "grandes", "orfas", "resumo_redundante",
                  "sem_proveniencia"):
        itens = activos.get(chave)
        if not itens:
            continue
        marca = "!" if chave in GRAVE else "·"
        linhas.append(f"## [{marca}] {TITULOS[chave]} ({len(itens)})")
        linhas.append(f"_{INSTRUCOES[chave]}_")
        linhas.append("")
        for it in itens:
            if chave == "ligacoes_partidas":
                linhas.append(f"- `{it['src']}` → `[[{it['dst']}]]`")
            elif chave == "orfas":
                linhas.append(f"- `{it['slug']}` ({it['dominio']})"
                              + ("  — ilha: também não cita ninguém" if it["ilha"] else ""))
            elif chave == "grandes":
                linhas.append(f"- `{it['slug']}` — {it['tamanho']} caracteres")
            elif chave == "estados_vencidos":
                linhas.append(f"- `{it['slug']}` — em vigor desde {it['valid_from']}")
            elif chave == "por_fechar":
                linhas.append(f"- `{it['slug']}` → `{it['superseded_by']}`")
            elif chave == "duplicados":
                linhas.append(f"- `{it['a']}` ~ `{it['b']}` ({it['semelhanca']})")
            elif chave == "proveniencia_morta":
                linhas.append(f"- `{it['slug']}` cita `{it['ref']}`, que não existe")
            elif chave == "desactualizadas":
                fich = ", ".join(f"`{f['ref']}` ({f['mudou']})" for f in it["ficheiros"][:3])
                mais = f" +{len(it['ficheiros']) - 3}" if len(it["ficheiros"]) > 3 else ""
                linhas.append(f"- `{it['slug']}` — conferida a {it['conferida']};"
                              f" mudaram desde então: {fich}{mais}")
            elif chave == "resumo_redundante":
                linhas.append(f"- `{it['slug']}`")
            elif chave == "por_verificar":
                como = "verificada" if it["alguma_vez"] else "escrita, e nunca verificada"
                linhas.append(f"- `{it['slug']}` — {como} a {it['desde']}")
            else:
                linhas.append(f"- `{it}`")
        linhas.append("")

    linhas.append("Para agir: `/memoria` ou o agente `bibliotecario`. "
                  f"As notas estão em `{NOTAS.relative_to(NOTAS.parents[2])}/`.")
    return "\n".join(linhas) + "\n"


def sonhar(db, com_duplicados: bool = True) -> dict:
    s = sinais(db)
    if com_duplicados:
        s["duplicados"] = duplicados(db)
    return s


def main() -> int:
    import argparse
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--json", action="store_true", help="saída para máquinas")
    ap.add_argument("--silencio", action="store_true",
                    help="não escreve nada; só o código de saída")
    ap.add_argument("--rapido", action="store_true",
                    help="salta os duplicados, que custam uma passagem de embeddings")
    a = ap.parse_args()

    db = conectar()
    s = sonhar(db, com_duplicados=not a.rapido)
    ha_trabalho = any(s.values())

    if a.silencio:
        pass
    elif a.json:
        print(json.dumps(s, ensure_ascii=False, indent=2))
    else:
        print(relatorio(s), end="")
    return 1 if ha_trabalho else 0


if __name__ == "__main__":
    sys.exit(main())
