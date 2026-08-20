---
slug: memoria-por-fazer-2026-08-20
tipo: estado
dominio: memoria
titulo: O que falta ao sistema de memória a 2026-08-20 — seis problemas em aberto, por ordem de valor
resumo: A memória lê bem e não se escreve sozinha; nada compara o que uma nota afirma com o que o código faz. Seis frentes, e as três primeiras são as que importam.
keywords: open problems, technical debt, backlog, capture automation, claim verification, retrieval precision, authentication, entity typing
valid_from: 2026-08-20
valid_to:
ingested_at: 2026-08-20T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - capturar.py
  - sonhar.py
  - servir.py
  - PESO_FONTE
sources:
  - conversa:2026-08-20
  - ficheiro:docs/memoria/bin/sonhar.py
  - ficheiro:docs/memoria/bin/capturar.py
---

Estado a **2026-08-20**, com 44 notas, 121 ligações, 2084 fragmentos e 248
testes. O sonho está em 1 ponto e nenhum a precisar de decisão — a biblioteca
está sã. O que falta é ao **sistema**, não ao conteúdo. Ver
[[memoria-capacidades-e-limites]].

## 1. A memória não se escreve sozinha

É o buraco de fundo, e o único que degrada sozinho com o tempo. Tudo o que se
construiu serve para **ler**; escrever depende de alguém se lembrar de correr
`capturar.py propor` e de o rever. O `SessionEnd` sabe quantas notas mudaram
mas não propõe nenhuma.

Sem isto, o retrato do projecto fica cada vez mais atrasado, e o sistema
parece saudável enquanto o faz — porque todos os sinais medem a coerência
interna, não a cobertura.

**Falta:** captura assistida a partir do que a sessão fez, para revisão.

## 2. Nada compara o que uma nota afirma com o que o código faz

O `sonhar` mede datas e existência de ficheiros. Não mede **comportamento**.

Foi assim que uma contradição escrita viveu três dias sem ninguém dar por ela:
a `memoria-como-funciona` dizia «os documentos são datados pelo primeiro commit,
não pelo mtime» e o `ingerir_docs` usava o `mtime` — 133 de 167 documentos com
data errada, e o `--as-of` a mentir em 60% do índice.

**Falta:** um sinal determinístico para isto. Não sei ainda como se faz sem cair
em heurísticas frágeis, e prefiro dizê-lo a inventar.

## 3. Dois falsos positivos que nenhum metadado resolve

- **Ficheiro importado para o git parece ter mudado hoje.** Um ficheiro com um
  único commit — o que o acrescentou — não tem idade conhecida, e o `mtime`
  também foi tocado nessa altura. Obriga a verificar à mão.
- **Mexer no motor assinala todas as notas meta**, porque elas descrevem o
  motor. São verdadeiros positivos, mas cansativos em desenvolvimento activo.
  A disciplina é verificar no fim do trabalho, não durante. Um prazo de
  tolerância esconderia obsolescência real, e por isso não foi posto.

## 4. A precisão@1 do retrieval anda nos 83% e desce com o crescimento

O @3 mantém-se em 100% com 23 casos, que é o que a bateria afere. O que perde o
primeiro lugar são **identificadores exactos** — `PPU0036`, «prata acastanhada»
— em que um documento que repete muitas vezes o termo bate a nota, apesar do
`PESO_FONTE` de 1,6 a favor das notas. Ver [[memoria-qualidade-medida]].

## 5. Coisas menores, mas reais

- **`servir` sem autenticação.** Só importa se sair de `127.0.0.1`.
- **60 entidades por tipar** — `sharp`, `rembg`, `waphix` são ferramentas.
  Ficaram por tipar de propósito: um tipo errado afirmado com confiança mente
  mais do que a ausência de tipo.
- **`sonhar --duplicados` é O(n²)** — 0,14 s hoje, começa a doer perto das mil
  notas. Medir outra vez nessa altura, e não antes.
- **`memoria-como-funciona` está 11% acima do limiar de tamanho.** Deixada
  assim de propósito: é o sítio único onde se percebe o sistema, e parti-la
  para satisfazer um número arbitrário tornava-a pior.

## 6. A portabilidade tem teste mas nunca foi exercida a sério

Há um teste que constrói uma segunda biblioteca noutro projecto e verifica que
nada deste negócio viaja com o motor. **Nunca foi apontado a um projecto real.**
Ver [[fork-memoria-permanente]] para o modelo de ramo, que também se aplica lá.

## Uma armadilha de método, que já mordeu duas vezes

Um teste que **depende de existir um defeito** — ou de haver trabalho por
fazer — desaparece no dia em que isso se resolve, e sai em silêncio: uma
contagem de testes que desce parece ruído e não perda de cobertura.

Aconteceu **três vezes numa só sessão**: ao guarda do resumo redundante, ao das
notas desactualizadas, e ao do dossiê de captura (que, com a árvore limpa, saía
pela porta do «nada mudou» e deixava de verificar as instruções). Os três
passam agora a **fabricar** a condição de que precisam.

Ao escrever um teste novo, perguntar sempre: *isto ainda corre depois de a
biblioteca estar limpa e tudo commitado?* Se a resposta for não, o teste mede o
estado do momento e não o comportamento do código.
