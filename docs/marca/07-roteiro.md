# 07 · Roteiro

O que falta, por ordem de retorno. Cada bloco é publicável sozinho.

Notação de esforço: **P** pequeno (horas) · **M** médio (dias) · **G** grande
(semanas, ou depende de terceiros).

---

## Bloco 1 — Pôr a marca nova no site

O lettering está desenhado e extraído. Não está aplicado. Este bloco é o que
faz o site passar a parecer a marca.

| # | Tarefa | Esforço | Notas |
|---|---|---|---|
| 1.1 | Cabeçalho e rodapé passam a usar `brand/wordmark.svg` | P | Substitui `.logo-text`. Abaixo de 20 px de altura de maiúscula usa-se `wordmark-reduzido.svg` |
| 1.2 | Hero da homepage com o lettering em vez de Cinzel | P | É o momento de marca mais visível do site |
| 1.3 | **Imagem de partilha nova** (1200×630) | P | Substitui `og-artnshine.jpg`, que ainda diz "Art & Shine" e "artnshine.pt". Renomear o ficheiro e actualizar as referências |
| 1.4 | **`logo.svg` novo** a partir do lettering | P | O actual é um PNG dentro de um SVG. Serve o schema.org e o admin |
| 1.5 | **Favicons e ícones** a partir de `selo.svg` ou `monograma-g.svg` | P | 16, 32, 180 (apple-touch), 192, 512. O actual é ilegível |
| 1.6 | `site.webmanifest` com o nome novo | P | |

**Verificação do bloco:** partilhar uma página no WhatsApp e no Instagram e
confirmar que aparece a marca nova.

---

## Bloco 2 — Fechar a cor

Detalhe em [03](03-cor.md). O `DESIGN_SYSTEM.md` fixou tudo menos a cor; isto
fecha a lacuna.

| # | Tarefa | Esforço | Notas |
|---|---|---|---|
| 2.1 | Acrescentar os seis tokens TERRA e a camada de papéis a `variables.css` | P | Sem remover nada. Zero mudança visível |
| 2.2 | Reapontar `--igp-*` e `--color-*` para os novos, como aliases | P | Uma linha resolve 85 ocorrências de `#c9a84c` |
| 2.3 | Substituir literais por tokens, ficheiro a ficheiro | M | Começar por `homepage.css` (36) e `brand-showcase.css` (34) |
| 2.4 | Remover os aliases quando os literais chegarem a zero | P | |
| 2.5 | Botão WhatsApp passa à cor da marca, com o ícone a marcar a plataforma | P | Deixa de competir com "adicionar ao carrinho" |

**Verificação:** contraste ≥ 4.5:1 (3:1 texto grande), sem transbordo a
390 px e 1440 px, CLS < 0.1 — a mesma bateria do `DESIGN_SYSTEM.md`.

---

## Bloco 3 — Acabamento

Defeitos pequenos, muito visíveis, quase todos de uma linha. **Melhor
relação esforço/percepção de todo o roteiro.**

| # | Tarefa | Esforço | Onde |
|---|---|---|---|
| 3.1 | Corrigir **"Gonzaga's Gonzaga"** | P | `views/about.ejs:30,35` |
| 3.2 | Rodapé: `"All rights reserved."` → português, e ler `config/brand.js` em vez de `siteTitle` | P | `views/partials/footer.ejs:62` |
| 3.3 | Página de erro: traduzir botões e tirar o pt-BR ("você") | P | `views/error.ejs:129-130`, `views/error/404.ejs:100` |
| 3.4 | **Reparar o layout da página de erro** | P | Está partido: rodapé a flutuar, cabeçalho a meio |
| 3.5 | Formato de preço único `25,00 €` na ficha de produto | P | `views/catalog/product-detail.ejs:574,675` |
| 3.6 | Esconder campos vazios ou internos (`Peso: 0.000`, `Estilo: PAN`) | P | mesma vista, ~linha 601 |
| 3.7 | Marca no **admin** a ler `config/brand.js` | P | 6 ficheiros em `views/admin/` |
| 3.8 | Confirmar e corrigir o **transbordo horizontal em `/loja` a 390 px** | P | Confirmar com `scrollWidth` antes de mexer |

---

## Bloco 4 — Fotografia

O maior custo à marca e o que mais depende de trabalho fora do código.
Detalhe e protocolo em [05](05-fotografia.md).

| # | Tarefa | Esforço | Notas |
|---|---|---|---|
| 4.1 | Montar o **cenário fixo de catálogo** — fundo cinzento neutro, luz difusa, marcas de distância e altura | P | Feito uma vez, serve para sempre |
| 4.2 | Refotografar as **~15 imagens que abrem alguma coisa** — hero, cinco capas de categoria, destaques | M | Maior retorno visual do bloco |
| 4.3 | Refotografar **pulseiras e fios de prata** | M | O núcleo comercial |
| 4.4 | Substituir as de **fundo proibido** (ganga azul) e as que geram barras brancas | P | |
| 4.5 | Cortar tudo a **1:1 na origem** | P | Resolve as barras brancas sem `object-fit` |
| 4.6 | Recortar o hero do "sobre" para o nome não tapar a cara | P | |
| 4.7 | Restante catálogo, por lotes | G | |

---

## Bloco 5 — Fechar o desenho

O que a especificação do lettering deixou explicitamente em aberto.
Ver [02 §8](02-identidade.md#8-por-fechar).

| # | Tarefa | Esforço | Notas |
|---|---|---|---|
| 5.1 | **Lockup empilhado** — decidir a razão entre as duas palavras e a compensação de traço | P | Não foi gerado ficheiro, de propósito |
| 5.2 | **Vectorização para corte** — contornos fechados derivados do fio único | M | Para gravação, cunho e bordado |
| 5.3 | **Avaliar o Cinzel** contra o lettering aplicado | P | Só é possível depois do bloco 1. Ver [04](04-tipografia.md) |
| 5.4 | **Ligadura GJ** | M | Depende de como o losango se comporta em peça pequena |
| 5.5 | **Aplicações** — embalagem, etiqueta, cartão, gravação em peça | G | Nada desenhado até hoje |

---

## Bloco 6 — Superfícies externas

Não é código. Fora do repositório mas dentro da marca.
Ver [`docs/rebranding/PLANO.md`](../rebranding/PLANO.md), fase 4.

| # | Tarefa | Esforço | Notas |
|---|---|---|---|
| 6.1 | Nome da loja no feed do **Merchant Center** | P | |
| 6.2 | Reenviar o **sitemap** na Search Console | P | Acelera o reconhecimento do nome |
| 6.3 | **Instagram** e **Facebook** — foto de perfil e bio com a marca nova | P | Mudar o *handle* `@gonzagaartnshine` **parte todos os links existentes**. Ponderar |
| 6.4 | **Email** — `g.art.shine@gmail.com` ainda carrega a marca antiga | P | Decisão de negócio |
| 6.5 | **Domínio** `artnshine.pt` | G | **Não fazer ao mesmo tempo que o resto.** Ver `PLANO.md` fase 5 |
| 6.6 | Retirar `alternateName` do schema.org | P | **Não antes de ~Fevereiro 2027** (6 meses sobre a mudança) |

---

## Ordem sugerida

**Bloco 3 e Bloco 1 primeiro, juntos.** O 3 são correcções de uma linha com
retorno imediato; o 1 põe a identidade no site. Os dois cabem numa
publicação.

**Bloco 2 a seguir**, sozinho — mexe em muitos ficheiros e convém que
qualquer regressão de cor seja atribuível.

**Bloco 4 em paralelo**, porque não depende de código: o cenário pode estar
montado antes de o bloco 1 ser publicado.

**Blocos 5 e 6 sem pressa.** O 5.3 (avaliar o Cinzel) só faz sentido depois
do 1, e o 6.5 (domínio) deliberadamente longe de tudo o resto.

---

## Fora de âmbito, deliberadamente

- **Multi-vendedor.** A regra mínima está escrita em
  [01 §9](01-plataforma.md#9-multi-vendedor--regra-mínima); a implementação é
  fase 2 e não deve condicionar nenhuma decisão de agora.
- **Inglês.** Meia tradução custa mais do que nenhuma.
- **Redesenhar o hero ou a homepage.** Funcionam. O que lhes falta é a
  identidade aplicada e fotografia melhor — não estrutura nova.
