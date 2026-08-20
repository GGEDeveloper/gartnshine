---
slug: memoria-capacidades-e-limites
tipo: procedimento
dominio: memoria
titulo: O que este sistema de memória faz, o que não faz, e por onde um agente lhe chega
resumo: Quatro canais de acesso, com o CLAUDE.md a ser o único que alcança subagentes. Seis limites por desenho, e o maior é que a memória não se escreve sozinha.
keywords: agent memory capabilities, limitations, discovery channels, MCP, hooks, subagent context, retrieval, bi-temporal, deterministic maintenance
valid_from: 2026-08-20
valid_to:
ingested_at: 2026-08-20T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - CLAUDE.md
  - UserPromptSubmit
  - bibliotecario
  - MEM_BIBLIOTECA
sources:
  - conversa:2026-08-20
  - ficheiro:CLAUDE.md
  - ficheiro:.mcp.json
relations:
  - CLAUDE.md | alcança | subagentes
---

## Por onde um agente chega à memória

Quatro canais, e a diferença entre eles é **quem alcançam**:

| canal | alcança | o que entrega |
|---|---|---|
| `CLAUDE.md` | **todos os agentes, incluindo subagentes** | as regras, o comando, as armadilhas já pagas |
| hook `UserPromptSubmit` | cada pergunta da sessão principal | 3 notas relevantes, ~240 ms, zero tokens de API |
| hook `SessionStart` | sessão principal | instrução primeiro, estado depois |
| MCP (`.mcp.json`) | qualquer cliente, e outros projectos | 5 ferramentas + a semente no `initialize` |

**O `CLAUDE.md` é o único que chega aos subagentes.** Um `Explore` ou um
`general-purpose` lançado pelo agente principal arranca sem o contexto do
`SessionStart` — se a instrução não estiver no `CLAUDE.md`, ele não sabe que
existe memória. Foi esse o buraco que manteve o sistema invisível enquanto o
motor já estava bom.

Para curadoria a sério — seguir vários fios, escrever, corrigir, auditar —
delega-se no agente `bibliotecario`.

## O que faz

- **Consultar.** Busca híbrida (BM25 + vectorial, fundidos por RRF) sobre
  notas, documentos, conversas e commits. `--as-of` responde o que era verdade
  numa data. Determinístico, local, sem custo de API.
- **Escrever com disciplina.** `capturar.py propor` diz que notas já são donas
  dos ficheiros que mudaram, e daí sai **enriquecer, suceder ou criar**.
- **Manter-se.** `sonhar` mede onze frentes sem chamar modelo nenhum; três
  delas medem a biblioteca **contra o repositório** e não contra si própria.
- **Ver-se.** `mem.py servir` abre ficha, grafo, percursos e sonho em
  `127.0.0.1`.
- **Viajar.** `MEM_BIBLIOTECA`/`MEM_PROJETO` separam motor de negócio, e
  `okf.py` exporta um bundle Open Knowledge Format v0.2.

## O que NÃO faz — e é bom saber antes de contar com isso

1. **Não sabe nada que não esteja no repositório ou nas conversas.** Não lê a
   base de dados de produção nem vê o site. Para isso há o `monitor.py`, que é
   outra coisa e vive em `projeto/`.
2. **Não escreve notas sozinho, e é por desenho.** O código mede e aponta; a
   escrita passa por quem revê. Ver [[memoria-understory-e-ui]], onde se
   explica porque é que o *dreaming* aqui não escreve nem apaga.
3. **Não valida o que uma nota afirma contra o que o código faz.** Compara
   datas e existência de ficheiros, não comportamento. É o buraco que deixou
   viver três dias uma contradição escrita — ver [[memoria-qualidade-medida]].
4. **A injecção automática é um palpite**, e diz-lo em cada bloco. Três notas
   por pergunta, sem limiar de qualidade: pode trazer ruído.
5. **Vive numa máquina.** O índice é SQLite local e descartável; entre máquinas
   sincroniza-se o git e reindexa-se.
6. **O `servir` não tem autenticação.** Liga a `127.0.0.1`, e é aí que tem de
   ficar enquanto assim for.

O que destes limites está em vias de se resolver, e o que fica por resolver
com nome e ordem, está em [[memoria-por-fazer-2026-08-20]].

## Regras que não se quebram

- A fonte de verdade são os markdown em `notas/`. O SQLite reconstrói-se.
- **Nada se apaga.** O que deixou de ser verdade fecha-se com `valid_to` e
  aponta `superseded_by`. Ver [[memoria-como-funciona]].
- Um `estado` caduca e há-de ser sucedido; um `facto` só pode ser acrescentado.
- Verificar é deixar um bloco `> Verificado a <data>`. Escrevê-lo sem ter ido
  ver anula todo o mecanismo.
