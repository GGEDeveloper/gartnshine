# Gonzaga's Art & Shine — artnshine.pt

Catálogo e loja de joalharia em prata. A aplicação é `gonzagas_node/`
(Node + Express + MySQL); a produção é Docker Compose auto-alojado no servidor
**waphix** — não é cPanel, que foi descontinuado. Ver `gonzagas_node/DEPLOYMENT.md`.

## Este projeto tem memória — usa-a

`docs/memoria/` guarda decisões datadas, armadilhas já pagas e o estado de cada
frente de trabalho. Não é documentação de arquitectura: é o registo do **porquê**,
e do que já correu mal.

    V=docs/memoria/.venv/bin/python          # o Python do sistema recusa os pacotes

    $V docs/memoria/bin/mem.py buscar "..."               # procurar
    $V docs/memoria/bin/mem.py buscar "..." --as-of 2026-07-30   # o que era verdade nessa data
    $V docs/memoria/bin/mem.py servir                     # abrir no browser
    $V docs/memoria/projeto/monitor.py                    # estado real do catálogo (só-leitura)

**Consulta antes de decidir**, sempre que a tarefa toque em: por que motivo
algo está como está, uma escolha que já foi feita, o estado de uma frente, ou
"isto já foi discutido?". A busca cobre notas, documentos, conversas antigas e
commits — alcança o que ainda não virou nota.

Para trabalho a sério sobre a memória — seguir vários fios, escrever ou
corrigir notas, auditar contradições — delega no agente **`bibliotecario`**.
Escrever notas é sempre dele ou de quem revê; não escrevas em
`docs/memoria/notas/` de passagem.

### Os factos são datados

Cada nota tem `valid_from` / `valid_to` / `superseded_by`. **Nada se apaga**:
um facto que deixou de ser verdade fecha-se com `valid_to` e aponta para o
sucessor. É isso que permite perguntar o que era verdade numa data — não
apagues nem reescrevas por cima para "corrigir".

### O que a memória já sabe, e te poupa tempo

Estes são os enganos que este projeto já pagou. Antes de mexer nestas áreas,
lê a nota:

- **Base de dados** — o schema local de dev **difere** do de produção no
  waphix. Já causou um erro em produção. `[[db-dev-vs-production]]`
- **Fotografias de peças** — `public/media/products` está incompleto em local;
  a produção serve por HTTP o que falta. `[[media-local-vs-producao]]`
- **Design** — `design-system.css` é a fonte única das escalas. Não inventes
  literais. `[[design-system-2026-08-01]]`
- **Categoria ≠ coleção ≠ galeria** — três conceitos distintos, com endereços
  próprios e 301. `[[conceitos-categoria-colecao-galeria]]`

## Convenções

- Português de Portugal na escrita — comentários, mensagens de commit,
  documentação e conteúdo do site.
- **Nunca escrever na base de dados MySQL de produção.** O `monitor.py` e os
  painéis `/admin/clientes` e `/admin/carrinhos` são só-leitura de propósito.
- Não inventar números. Medi-los com o `monitor.py` ou uma query, e datá-los.
