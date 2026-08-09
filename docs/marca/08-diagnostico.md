# 08 · Diagnóstico completo — marca e design

Levantamento de **todas as camadas** de um sistema de marca, não só do site.
O [06](06-auditoria-site.md) avalia o website; este documento avalia a marca
inteira e é onde se vê o que ainda nem sequer começou.

**Data:** 2026-08-04

Legenda: **●** feito · **◐** parcial · **○** ausente

---

## Leitura em 60 segundos

| Camada | Estado | Nota |
|---|---|---|
| 1 · Estratégia | ◐ | Bem respondida no questionário, nunca traduzida em ferramentas de trabalho |
| 2 · Verbal | ◐ | Nome, mote e tom fechados. Mensagens e léxico por escrever. Três línguas no site |
| 3 · Identidade visual | ◐ | **O lettering é excelente e está fechado.** Cor escolhida e não implementada. Sem iconografia nem textura |
| 4 · Direcção de arte | ○ | Regras escritas hoje, zero execução |
| 5 · Digital | ◐ | Site com boa estrutura e marca antiga. **Cliente não recebe email nenhum** |
| 6 · Físico | ○ | **Nada. Zero.** E é onde a marca vende |
| 7 · Social e comercial | ○ | Perfis com a marca antiga, sem sistema |
| 8 · Governação | ● | Resolvida hoje: fonte, regras e assets separados |

**A conclusão que importa:** o problema deixou de ser *desenhar a marca* — o
lettering está feito e é bom. O problema é que **a marca existe em ficheiros e
não existe em lado nenhum onde alguém a possa ver.**

---

## Camada 1 · Estratégia

| Componente | Estado | O que falta |
|---|---|---|
| Propósito, missão, visão, valores | ● | — |
| Posicionamento e faixa de preço | ● | — |
| Público-alvo | ◐ | Descrito, mas sem personas operacionais. Não dá para decidir com ele |
| Arquitectura de nome | ● | Fechada no [01](01-plataforma.md) |
| Hierarquia de produto | ● | Prata primeiro. **Definida e não aplicada** — ver [06](06-auditoria-site.md) |
| **Proposta de valor** | ○ | Nunca escrita. "Porquê comprar aqui e não noutro sítio" existe na cabeça do Gonzaga e em mais lado nenhum |
| **Razões para crer** | ○ | A objecção principal é o preço e não há resposta escrita. Prata 925 certificada? Feito à mão por quem? Onde? Quanto tempo leva? |
| **Benchmark competitivo** | ○ | Uma referência solta (Lula Maiz). Sem análise de quem mais vende ao mesmo público |
| Regras de marketplace | ◐ | Princípio definido no [01 §9](01-plataforma.md#9-multi-vendedor--regra-mínima), sem operacionalização |

**O buraco desta camada:** *razões para crer*. A marca posiciona-se acima da
bijuteria e o cliente trava no preço. Sem argumentos concretos e repetíveis —
material, feitura, tempo, origem — cada venda tem de ser ganha à conversa. É
isso que impede o site de vender sozinho.

---

## Camada 2 · Verbal

| Componente | Estado | O que falta |
|---|---|---|
| Nome e assinatura | ● | — |
| Mote | ● | "Elegância que nasce da terra" |
| Tom de voz | ● | Fechado no [01 §6](01-plataforma.md#6-tom-de-voz) |
| Nomenclatura de produto | ● | 327/328 nomeados por imagem (Jul 2026) |
| **Mensagens-chave** | ○ | Não há 3–5 frases que a marca repita sempre, em todo o lado |
| **Léxico** | ○ | Como se chama uma "coleção"? E uma "categoria"? Já houve confusão suficiente para justificar um glossário |
| **Copy de sistema** | ○ | Botões, erros, confirmações, vazios. Hoje há PT, EN e pt-BR na mesma sessão |
| **Nomes de coleção** | ○ | Sem sistema. As coleções existem tecnicamente e não têm identidade verbal |
| Narrativa longa | ◐ | O `/about` tem texto, mas é genérico e tem o erro "Gonzaga's Gonzaga" |
| Inglês | ○ | Inexistente. Decidido: **não começar até poder ser feito inteiro** |

---

## Camada 3 · Identidade visual

| Componente | Estado | O que falta |
|---|---|---|
| **Lettering** | ● | Original, sistemático, cotado. Espacejamento fechado hoje (ver [02 §1b](02-identidade.md)) |
| Variantes do logótipo | ● | 8 ficheiros em `public/brand/` |
| Monograma e selo | ● | `monograma-g.svg`, `losango.svg`, `selo.svg` |
| Zona de protecção | ● | Uma altura de maiúscula. Fixada no [02](02-identidade.md) |
| Tamanho mínimo | ● | 20 px de altura de maiúscula para o completo |
| Acentos portugueses | ● | Ã Á É Ç e o C |
| **Lockup empilhado** | ○ | Por especificar. Faz falta para formatos quadrados |
| **Cor** | ◐ | Paleta TERRA escolhida e medida ([03](03-cor.md)). **Zero implementação** — 363 literais e 7 dourados no CSS |
| Tipografia | ● | **Decidida**: Spectral (título) + Fira Sans (corpo). Cinzel sai — não tem minúsculas. Ver [04](04-tipografia.md) |
| **Iconografia** | ○ | Font Awesome genérico. Ícones de prateleira num site que tem lettering próprio |
| **Textura e padrão** | ○ | O questionário exige madeira, pedra, metal e flora como texturas obrigatórias. **Não existe uma única** |
| **Sistema gráfico** | ○ | O losango é a forma-mãe da marca e não é usado como elemento — separador, marca de água, padrão, bullet, moldura |
| Grelha e layout | ● | `design-system.css` |
| Movimento | ◐ | Existe (`motion.js`, view transitions) sem regra de marca escrita |

**Duas oportunidades desperdiçadas, ambas baratas:**

1. **O losango.** É a forma que o G e o O partilham, sai da própria
   construção do alfabeto, e já está em ficheiro. Podia ser o separador de
   secções, o bullet das listas, a moldura das capas de categoria, a marca de
   água do fundo e o padrão da embalagem — sem desenhar nada de novo.
2. **A textura.** O site é liso. A marca define-se como "orgânica, artesanal,
   nunca plástica" e não tem uma única superfície com matéria.

---

## Camada 4 · Direcção de arte

| Componente | Estado | O que falta |
|---|---|---|
| Regras de fotografia | ● | Escritas hoje no [05](05-fotografia.md) |
| **Foto de catálogo** | ○ | 5 fundos diferentes numa página. Um deles é azul — cor proibida |
| **Foto de ambiente** | ◐ | Existem algumas boas (o hero, o `/about`), sem sistema |
| **Vídeo** | ○ | O questionário pede hero atmosférico. Não existe |
| Cenário de fotografia | ○ | Por montar. É uma tarde de trabalho e resolve o problema para sempre |
| Banco de imagens organizado | ○ | Sem estrutura nem convenção |

---

## Camada 5 · Digital

| Componente | Estado | O que falta |
|---|---|---|
| Estrutura e navegação do site | ● | Boa |
| Fundações de CSS | ● | Feitas em Agosto |
| Identidade aplicada no site | ○ | O lettering não está em lado nenhum |
| `logo.svg` | ○ | Marca antiga, e é um PNG dentro de um SVG |
| Imagem de partilha | ○ | Diz "Gonzaga's Art & Shine" e "artnshine.pt" |
| Favicons | ○ | Mancha verde ilegível a 32 px |
| **Email ao cliente** | ○ | **Não existe nenhum.** Ver abaixo |
| Admin | ○ | Marca antiga em 6 ficheiros; desenho divergente do site |
| Checkout | ◐ | Funciona, conta obrigatória. Sem tratamento de marca |
| Acessibilidade | ◐ | Contraste medido; falta confirmar transbordo a 390 px |

### O email é o buraco silencioso

`modules/ecommerce/notifications/services/orderEmails.js` envia **um** email —
para o administrador, em **texto simples**, com o total em `€25.00`. O evento
`order.shipped` só escreve na consola.

**O cliente não recebe nada.** Nem confirmação de encomenda, nem aviso de
envio, nem recuperação de conta. Numa loja onde a conta é obrigatória para
finalizar a compra, isto é ao mesmo tempo um problema comercial e o
desaparecimento de um dos poucos momentos em que a marca fala com o cliente
já convertido.

---

## Camada 6 · Físico — a lacuna maior

**Nada foi desenhado. Nenhuma peça.**

E o questionário é explícito sobre onde o público está: feiras, festivais,
raves, feiras medievais, feiras de artesanato. **É aí que a marca vende.** Um
site impecável não é visto por quem compra numa banca.

| Componente | Estado | Porquê importa |
|---|---|---|
| **Banca de feira** | ○ | O ponto de venda real. Toalha, expositor, tabuleta, iluminação, preçário |
| **Embalagem** | ○ | Saco ou caixa. É o que o cliente leva e mostra |
| **Etiqueta de produto** | ○ | Preço, referência, material. Hoje presumivelmente manuscrita |
| **Cartão de cuidados** | ○ | Como cuidar da prata 925. Justifica preço e reduce devoluções |
| **Cartão de visita** | ○ | O diferencial declarado da marca é a relação. Não há como continuá-la |
| **Punção / marca em peça** | ○ | Ver abaixo — a oportunidade mais forte |
| Bordado / têxtil | ○ | `wordmark-gravacao.svg` já serve |

### O punção — a peça que liga tudo

O questionário diz que vai haver **"fechos personalizados e elementos
assinatura da marca"**. O `wordmark-gravacao.svg` e o `selo.svg` existem
exactamente para isto e ainda não foram usados.

O **losango cunhado na peça** — no fecho, na anilha, na chapa — faz três
coisas ao mesmo tempo: assina o trabalho, distingue de qualquer réplica, e dá
uma razão concreta para crer que responde à objecção do preço. É o único
elemento desta lista que é simultaneamente marca, produto e argumento de
venda.

Falta o passo técnico que o [02 §8](02-identidade.md#8-por-fechar) já
identifica: **vectorização em contorno fechado** a partir do fio único.

---

## Camada 7 · Social e comercial

| Componente | Estado | O que falta |
|---|---|---|
| Instagram — perfil e bio | ○ | Marca antiga. É o canal principal de contacto |
| Instagram — destaques | ○ | Sem capas |
| Templates de publicação e story | ○ | Nenhum |
| Grelha / plano de conteúdo | ○ | Sem sistema |
| Handle `@gonzagaartnshine` | ◐ | Decisão pendente — mudar **parte todos os links existentes** |
| Feed do Merchant Center | ◐ | Nome antigo da loja |
| Lookbook / catálogo | ○ | Nenhum. Serviria feiras e revenda |
| Anúncios | ○ | Sem formatos nem regras |

---

## Camada 8 · Governação

| Componente | Estado |
|---|---|
| Onde vive a fonte | ● `branding-desing/` |
| Onde vivem as regras | ● `docs/marca/` |
| Onde vivem os assets | ● `gonzagas_node/public/brand/` |
| Regra de não-redesenho a jusante | ● [02](02-identidade.md) |
| Nome centralizado em código | ◐ `config/brand.js` — o admin ainda o contorna |
| Versionamento dos assets | ◐ Em git, sem convenção de versão |

Esta camada estava toda por fazer esta manhã e é a que impede o trabalho de
se perder. É também a mais barata e a mais ignorada.

---

## O que eu faria a seguir

Por ordem, e com a razão:

**1 · Pôr a marca no site** — bloco 1 do [roteiro](07-roteiro.md).
O lettering está feito, pago e invisível. Enquanto não estiver aplicado, todo
o resto do trabalho de marca é teórico.

**2 · Acabamento** — bloco 3 do roteiro.
"Gonzaga's Gonzaga", `Peso: 0.000`, `€25.00`, a página de erro partida. São
correcções de uma linha e é o que faz um cliente decidir se confia.

**3 · O cenário de fotografia.** Não depende de código nem de decisões. Uma
tarde a montar fundo e luz resolve a fotografia de catálogo para sempre. É o
maior salto de qualidade percebida por euro gasto.

**4 · Emails ao cliente.** Confirmação e envio. É comercial antes de ser
marca, e hoje simplesmente não existe.

**5 · O punção.** Vectorizar o losango em contorno fechado e pô-lo na peça.
Transforma a identidade em produto e dá resposta à objecção do preço.

**6 · A banca de feira.** É onde a marca vende e não tem nada. Depois de
existirem embalagem e etiqueta, é o passo natural.

**7 · Cor** — bloco 2 do roteiro. Importante, mas invisível para o cliente
comparado com os anteriores. Faz-se quando houver folga, e sozinho.

---

## O que não fazer agora

- **Multi-vendedor.** Não condiciona nenhuma decisão actual.
- **Inglês.** Meia tradução custa mais do que nenhuma.
- **Mudar o domínio.** Longe de tudo o resto, e nunca ao mesmo tempo que a
  mudança de nome — ver [`docs/rebranding/PLANO.md`](../rebranding/PLANO.md).
- **Redesenhar o site.** A estrutura funciona. Falta-lhe identidade e
  fotografia, não arquitectura.
- **Trocar o Cinzel.** Só se avalia depois do passo 1.
