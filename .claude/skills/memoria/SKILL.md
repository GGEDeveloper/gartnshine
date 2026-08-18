---
name: memoria
description: Consultar, escrever e auditar a biblioteca de memória do projeto (docs/memoria/). Use quando a pergunta for sobre história do projeto, decisões tomadas, estado de uma frente de trabalho, ou "isto já foi discutido?"; e quando houver algo para memorizar. Sem argumentos, mostra o estado da biblioteca e o que está por capturar.
---

# Biblioteca de memória

A memória do projeto vive em `docs/memoria/`, versionada em git. Os ficheiros
markdown em `notas/` são a **fonte de verdade**; o SQLite em `estado/` é índice
derivado e descartável.

Usa sempre o Python do ambiente próprio (o do sistema recusa pacotes):

```
V=docs/memoria/.venv/bin/python
```

## Consultar

```
$V docs/memoria/bin/mem.py buscar "porque a prata fica acastanhada"
$V docs/memoria/bin/mem.py buscar "..." --as-of 2025-11-15      # o que era verdade nessa data
$V docs/memoria/bin/mem.py buscar "..." --dominio design --tipo decisao
$V docs/memoria/bin/mem.py buscar "..." --incluir-expirado
$V docs/memoria/bin/mem.py grafo "PPU0080" --saltos 2
```

Na saída, `[LS]` = os dois canais (BM25 lexical + vetor semântico) encontraram
o resultado, o que é sinal forte; `[·S]` = só semântico, mais fraco.

Se uma nota tiver um bloco `> Verificado a <data>`, **é esse o valor actual** —
o texto acima pode ser histórico.

## Estado e manutenção

```
$V docs/memoria/bin/mem.py estado          # números do índice
$V docs/memoria/bin/mem.py indexar         # depois de escrever notas
$V docs/memoria/bin/mem.py reconstruir     # do zero (--completo inclui transcripts/docs/commits)
$V docs/memoria/bin/mem.py auditar         # contradições, órfãos, duplicados
$V docs/memoria/bin/monitor.py             # estado real do projeto (só-leitura)
$V docs/memoria/bin/cronograma.py          # linha temporal por fases
$V docs/memoria/bin/capturar.py estado     # confiança por categoria
```

## Escrever

Delega no subagente **`bibliotecario`** (via a ferramenta Agent) quando houver
trabalho de curadoria a sério — escrever várias notas, resolver entidades,
auditar contradições. Ele conhece a ontologia e as regras de correcção.

Para uma nota rápida, o essencial:

- **7 tipos:** `decisao`, `facto`, `estado`, `procedimento`, `entidade`,
  `preferencia`, `referencia`.
- **12 domínios:** `memoria`, `loja`, `catalogo`, `fotografia`, `marca`,
  `design`, `infra`, `bd`, `seo`, `admin`, `negocio`, `geral`.
- Corpo em **português europeu**; termos ingleses no campo `keywords`, que
  entra no índice (a expansão bilingue foi medida e bate traduzir).
- **O título diz a conclusão**, não o tema — é o que a busca mostra.
- Bi-temporal: `valid_from` / `valid_to` / `superseded_by`. Nunca apagar uma
  nota para a substituir: fecha-se e liga-se à sucessora.
- Se a nota tiver de ser **reescrita** quando o mundo mudar, é `estado`; se só
  puder ser **acrescentada**, é `facto`.

Depois de escrever, correr `mem.py indexar`.

## Capturar no fim de uma sessão

O sistema aprende quanto deve perguntar:

```
$V docs/memoria/bin/capturar.py decidir facto catalogo    # 0=grava, 2=pergunta
$V docs/memoria/bin/capturar.py registar facto catalogo aprovada --slug <nota>
```

Regista sempre a decisão do programador — é isso que faz o limiar descer.
Cinco decisões por categoria com 85% de aprovação e deixa de perguntar; uma
rejeição nas últimas três volta a perguntar.

## Regras

- Nunca escrever conhecimento só na base de dados.
- Nunca inventar números: medir com `monitor.py` ou uma query, e datar.
- O `monitor.py` é **só-leitura** — correcções de dados são decisão do
  programador.
- Não commitar sem pedido explícito.
