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
$V docs/memoria/projeto/monitor.py             # estado real do projeto (só-leitura)
$V docs/memoria/bin/mem.py servir          # abre a memória no browser (grafo, fichas, percursos, sonho)
$V docs/memoria/bin/mem.py sonhar          # o que há a consolidar (mede, aponta, não escreve)
$V docs/memoria/bin/mem.py percursos       # como se chegou às últimas respostas
$V docs/memoria/bin/capturar.py propor     # o que esta sessão deixou por memorizar
$V docs/memoria/bin/okf.py                # exporta um bundle Open Knowledge Format v0.2
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

**Começa sempre pelo dossiê**, que responde à pergunta que ninguém consegue
responder de cabeça — *quem já é dono do que mexeste*:

```
$V docs/memoria/bin/capturar.py propor
```

Dele sai a decisão entre três, e a ordem importa:

1. **Enriquecer** — o assunto já tem nota dona e o que ela diz continua
   verdade. Acrescenta-se ao corpo; se se mediu alguma coisa, deixa-se um
   bloco `> Verificado a <hoje>`.
2. **Suceder** — tem dona, mas o que ela diz deixou de ser verdade. Escreve-se
   a sucessora, fecha-se a antiga com `valid_to` e aponta-se `superseded_by`.
   **Nunca reescrever por cima.**
3. **Criar** — assunto novo. Declarar `sources: ficheiro:<caminho>` e citar
   pelo menos uma nota vizinha com `[[slug]]`, senão nasce órfã.

Criar uma segunda nota sobre um ficheiro que já tem dona é como a biblioteca
começa a contradizer-se.

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
