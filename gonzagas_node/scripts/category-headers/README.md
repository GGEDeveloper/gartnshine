# Capas e cartões das categorias

O cabeçalho de uma categoria tem de mostrar o que a categoria vende. Antes
desta pasta, 22 das 25 categorias não tinham imagem nenhuma e caíam na
primeira fotografia de produto da família — uma foto quadrada de catálogo
esticada por uma faixa de 4:1, o que dava um pedaço de cartolina cinzenta com
um bocado de peça lá ao fundo. As três que tinham imagem apontavam para fotos
de galeria com relva ao sol e céu azul, cores que a
[paleta da marca proíbe](../../../docs/marca/03-cor.md).

Agora cada capa é montada a partir de **peças reais dessa categoria**,
recortadas do fundo e pousadas sobre a paleta TERRA. O mesmo vale para os
cartões dos materiais na homepage e na loja, e para o cartão "Ver todos", que
era uma macro de relva verde ao sol.

## Como se refaz

```bash
node scripts/category-headers/build.js
```

Sem argumentos faz as 25; com argumentos faz só essas
(`node scripts/category-headers/build.js aneis-prata cuffs-latao`).

Escreve duas coisas em `public/media/categories/`:

| Ficheiro | Onde aparece | Quantos |
|---|---|---|
| `cat-<id>-hero-1920.jpg` | cabeçalho da página da categoria | 25 |
| `cat-<id>-card-1200.jpg` | cartão na homepage e na loja | 4 |
| `todos-card-1200.jpg` | cartão "Ver todos" da loja | 1 |

Só os **materiais de topo** têm cartão: `getMaterialsForHome` filtra
`parent_id IS NULL`, e as subcategorias na loja são texto, sem imagem. O
cartão "Ver todos" não é uma categoria — vive em
`site_settings.shop_all_card_image`.

Quem aponta a base de dados para estes ficheiros é a migração
`sql/migrations/015_category_headers.sql`.

## As duas metades

**1. Recorte** (uma vez por peça, fora do repositório)

Os recortes vivem em `cutouts/<REF>.webp` — a peça com alfa, sem a cartolina
(WebP e não PNG: os mesmos 92 recortes passam de 21 MB para 4 MB, e depois do
véu e do grão não se nota).
Foram feitos com [rembg](https://github.com/danielgatis/rembg), modelo
`isnet-general-use`:

```bash
python3 -m venv venv && ./venv/bin/pip install "rembg[cli,cpu]"
./venv/bin/rembg p -m isnet-general-use <pasta-com-jpgs> cutouts
```

Depois há um passo de limpeza: o modelo devolve o **vazio interior** das peças
(o buraco de uma argola, o meio de uma pulseira de contas) como se fosse peça,
e esse vazio é cartolina clara — sobre fundo escuro fica um disco branco a
brilhar. A limpeza apaga as regiões lisas, fechadas e da cor do fundo, e come
a orla queimada que fica entre as contas.

Duas armadilhas que custaram a encontrar:

- `blur()` sobre um buffer *raw* de 1 canal devolve **3 canais**. Ler
  `soft[p]` em vez de `soft[p * canais]` dá um alfa feito de lixo e a peça sai
  preta.
- Numa prata polida a peça tem exactamente a cor da cartolina. A erosão da
  orla comia-lhe metade. Por isso há um tecto: se ela crescer acima de ~1 %
  da imagem, desfaz-se e fica o recorte original.

**2. Composição** (`build.js`)

- **Onde vive a composição.** O cabeçalho é cortado com `background-size:
  cover` numa caixa que vai de 4.35:1 no desktop a 1.76:1 no telemóvel. Com a
  tela a 2.77:1, os dois cortes deixam ver a mesma fatia central — 63 % da
  largura e 63 % da altura. É lá que as peças têm de estar; o resto é sangria
  para os ecrãs largos.
- **O corredor do título.** O `<h1>` é centrado, por isso o meio da tela é o
  pior sítio para pôr uma peça. Os arranjos abrem os dois lugares grandes para
  fora e deixam ao centro uma peça pequena e alta.
- **Tamanho pela tinta, não pela caixa.** Um fio enrolado e um anel maciço com
  a mesma altura não pesam o mesmo — o fio é quase todo vazio. O tamanho é
  corrigido pela fracção de pixéis opacos da peça.
- **Exposição igualada.** As fotografias vêm de sessões diferentes e uma prata
  polida chega com o dobro do brilho de um latão escurecido. Cada peça é
  reexposta para o mesmo topo de luz, senão o cabeçalho tem uma peça a gritar
  e as outras mudas.

**3. O cartão** é outra tela e outra regra. Mede 269×280 na homepage, 261×196
na loja e 558×280 no lugar largo — de 0.96 a 1.99 de proporção; a 1.38 os
cortes extremos ainda deixam ver 70 %. O nome fica em baixo à esquerda nas
duas superfícies e as duas já têm véu forte a subir do fundo, por isso aqui há
**uma só peça** (duas no "Ver todos") e ela vive na metade de cima. A 177 px de
largura no telemóvel, cinco peças seriam uma mancha.

## Contraste

O título é `#f0ece4` sobre a imagem. Medido a 1440 px e a 390 px, contra o
percentil 98 da luminância por trás do `<h1>`, as 25 categorias ficam acima de
4.5:1 nos dois tamanhos. Três coisas o garantem, por ordem de importância: o
corredor central sem peças grandes, o véu do próprio ficheiro, e a
`text-shadow` em `brand-showcase.css`.

Se mexer nos arranjos, volte a medir — um lugar movido 5 % chega para pôr um
reflexo por trás de uma letra.

## Uma armadilha do CSS que isto destapou

O cartão "Ver todos" tinha
`.catalog-category-card.is-all .catalog-category-media { background: <degradê> }`.
O **atalho** `background` repõe também o `background-size`, que voltava a
`auto` depois do `cover` da regra de cima. A imagem escolhida nas definições
aparecia ao tamanho natural e via-se só o seu canto superior esquerdo. Nunca
se notou porque a imagem antiga era textura de ponta a ponta — com uma peça
sobre fundo liso, o cartão ficava preto. Passou a `background-image` e só
quando não há imagem.

## O que fica de fora

- As **colecções** (`collections.hero_image`, "Serpentes" e afins) são outra
  tabela e outra superfície; continuam com as fotografias que tinham.
- `Colares - Latão` e `Pendentes - Prata` não têm produtos nenhuns (nem em
  produção). As capas usam peças do mesmo material e da mesma zona do corpo.
- As fotos de `Gargantilhas - Latão` e de `Pulseiras Pé - Prata` só existem em
  produção; foram buscadas a `https://artnshine.pt` para o recorte.

---

## Fotografia em vez de montagem (proposta, 11 de Agosto de 2026)

As capas acima são montagens porque, quando foram feitas, não havia fotografia
de ambiente nenhuma — e é fotografia de ambiente que
[`docs/marca/05-fotografia.md`](../../../docs/marca/05-fotografia.md) manda pôr
numa capa de categoria. Depois do inventário de `temporario-nova-media/`
existem 124 candidatas, e **quinze das vinte e cinco categorias podem trocar**.

```bash
node scripts/category-headers/capas-foto.js            # título ao centro
MODO=terco node scripts/category-headers/capas-foto.js # título no terço escuro
```

As escolhas estão em [`capas-foto.json`](capas-foto.json), uma por família, com
o ponto da fotografia que fica ao centro e a fatia de altura que a tela apanha.
A saída vai para `propostas/` — **não** para `public/media/categories/`, porque
a troca ainda não está decidida.

**A medição que interessa não é a do ficheiro.** Medir só o JPEG dizia que
nenhuma fotografia chegava a 4.5:1 no título. Faltava uma camada: o
`::before` de `brand-showcase.css` desenha um véu por cima da imagem antes de o
texto entrar. Medida a montagem completa, as quinze passam — 4.95:1 a 6.74:1 no
computador. Ou seja, **a via mais barata é só trocar ficheiros**; o título à
esquerda é opção de composição, não de acessibilidade.

As dez que ficam montagem não têm uma única fotografia da peça sozinha em
cenário natural. A pior é `Pulseiras · Pedras Naturais`: 55 fotografias no
inventário, todas ao pulso ou em tabuleiro.
