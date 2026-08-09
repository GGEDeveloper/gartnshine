# 04 · Tipografia

---

## A regra que resolve 90 % das dúvidas

> **O nome da marca nunca é tipografia. É sempre o ficheiro.**

"GONZAGA" escrito numa fonte — por muito bem escolhida que seja — não é o
logótipo. É texto que por acaso diz o nome. Se a palavra aparece como marca,
vem de `public/brand/wordmark.svg`.

**O site viola isto em todo o lado hoje**: cabeçalho, hero da homepage, hero
do "sobre" e rodapé desenham o nome em Cinzel. Ver [auditoria](06-auditoria-site.md).

Onde o nome aparece dentro de uma frase corrida ("as peças da Gonzaga são
feitas por encomenda"), é texto normal e usa a fonte de corpo. A distinção é
entre **assinar** e **mencionar**.

---

## Porque é preciso uma tipografia de acompanhamento

O lettering é **só de maiúsculas** e assim fica — a caixa baixa foi
arquivada de propósito na especificação de origem: *"se um dia for preciso
texto de marca, resolve-se com uma tipografia de acompanhamento e não com um
alfabeto novo."*

Desenhar minúsculas para este alfabeto seria meses de trabalho para resolver
um problema que uma boa escolha resolve numa tarde. E seria contraproducente:
o lettering vale por ser um **acontecimento**. Se a marca inteira estiver
escrita nele, deixa de o ser.

---

## As três vozes

| Voz | Quem é | Faz |
|---|---|---|
| **Marca** | O lettering, em SVG | Assinar. Nada mais |
| **Título** | **Spectral** | Títulos de página e de secção, nomes de produto, texto editorial |
| **Corpo** | **Fira Sans** | Texto, interface, rótulos, preços, especificações, botões |

Ambas são livres (OFL), estão no Google Fonts e podem ser alojadas no
servidor.

Isto substitui **Cinzel** e **Source Sans 3**. Para trocar, mudam-se
`--font-display` e `--font-body` em `design-system.css` e o `<link>` em
`views/layouts/main.ejs` — não se acrescenta `font-family` em folha nenhuma
de componente.

---

## Como se chegou aqui

Foram testados sete candidatos, compostos em contexto real — ficha de
produto, sobre fundo `--terra-preto`, com acentos portugueses, preço e
referência.

### Critérios

1. **Não competir com o lettering.** A marca já tem uma voz alta e só precisa
   de uma.
2. **Rimar no traço.** O lettering é **monolinear** — traço de espessura
   constante. Uma fonte de contraste alto (grosso/fino acentuado) contradi-lo
   directamente.
3. **Aguentar fundo escuro a tamanho pequeno.** Texto claro sobre escuro
   perde peso óptico. Precisa de altura-x generosa.
4. **Português europeu completo**, incluindo ã õ ç á ê à.
5. **Algarismos alinhados**, para preços, pesos e referências.

### Medições

| Fonte | Altura-x / maiúscula | Algarismos | Glifos |
|---|---|---|---|
| **Fira Sans** | **0,76** | Alinhados | 1840 |
| Source Sans 3 | 0,74 | Alinhados | 1801 |
| Alegreya Sans | 0,72 | **Antigos** | 1393 |
| Barlow | 0,72 | Alinhados | 571 |
| **Spectral** | 0,68 | Alinhados | 1019 |
| Cormorant Garamond | — | Alinhados | 1308 |
| Cinzel | **0,86** | Alinhados | **368** |

---

## Corpo — porquê Fira Sans

**A maior altura-x do grupo (0,76).** É o critério que mais pesa num site de
fundo escuro: é o que faz o texto de 14 px continuar a ler-se. Humanista,
morna, sem tiques — não disputa atenção com o lettering. Contraste baixo, o
que rima com o traço único. Desenhada de raiz para ecrã a tamanhos pequenos.

**Os que ficaram pelo caminho, e porquê:**

- **Alegreya Sans** foi o mais tentador. É o mais quente e o mais artesanal
  dos quatro, e a origem — desenhada para texto longo, com raiz caligráfica —
  encaixa na marca. Reprovou por uma razão prática: **usa algarismos antigos
  por omissão**. Numa loja isso estraga preços, pesos e sobretudo referências
  como `PPU0023`, onde os zeros ficam à altura da minúscula. Corrige-se com
  `font-feature-settings: 'lnum'`, mas é contrariar a intenção da fonte. Soma
  a isso a menor altura-x do grupo, num site escuro.
- **Barlow** tem um argumento genuíno: é ligeiramente estreita, e essa
  proporção rima com a do lettering, que é alto e apertado. Mas é uma
  grotesca neutra — dá modernidade e não dá calor, e a marca define-se como
  quente e artesanal. **É a escolha certa se um dia se quiser um registo mais
  gráfico e menos artesanal.**
- **Source Sans 3**, a actual, funciona. Não tem defeito — tem ausência de
  ponto de vista. Se se vai mexer, vale a pena ganhar alguma coisa.

---

## Título — porquê Spectral, e porque o Cinzel sai

O Cinzel tem um **defeito funcional, não de gosto**:

> **O Cinzel não tem minúsculas.** Tem 368 glifos e a sua "caixa baixa" são
> **versaletes** — a altura-x medida é 0,86 da maiúscula, que é a assinatura
> de um versalete e não de uma minúscula.

Consequências, todas visíveis no site hoje:

- **Nenhum texto em Cinzel consegue estar em caixa de frase.** Um nome de
  produto sai sempre como parede de capitais.
- **Ocupa muito mais espaço.** "Pulseira Trança de Prata com Ónix e Fecho
  Trabalhado" leva **duas linhas** em Cinzel e **uma** em Spectral ou Fira.
  É a causa dos nomes de produto a duas linhas com entrelinha apertada que a
  [auditoria](06-auditoria-site.md) registou.
- Nomes longos ficam ilegíveis ao correr da vista.

E o argumento de desenho: o Cinzel é uma capital romana de **contraste alto**
— grosso e fino muito marcados. O lettering é **monolinear**. Postos lado a
lado não parecem da mesma casa; parecem duas marcas.

**Spectral** resolve as duas coisas. Contraste baixo, o que rima com o traço
único do lettering. Serifas em cunha, ligeiramente cortadas — alguma
afinidade com os vértices vivos do alfabeto, sem os imitar. Desenhada para
ecrã, aguenta fundo escuro. E tem minúsculas a sério.

**Cormorant Garamond** foi testada e reprovou pelo mesmo motivo do Cinzel:
contraste altíssimo. É bonita e, sobre escuro, os traços finos ficam
frágeis já a 40 px.

---

## A alternativa mais enxuta, se se quiser

**Uma família só: Fira Sans para tudo**, com a hierarquia feita por tamanho,
peso, caixa alta e espacejamento — sem serifa nenhuma.

**Ganha-se:** uma voz a menos a competir com o lettering, menos um ficheiro
a carregar, e um sistema mais difícil de estragar.
**Perde-se:** o sinal editorial que uma serifa dá a uma loja de joalharia, e
que ajuda a sustentar a faixa de preço.

A recomendação é a de duas famílias. Esta fica registada para o caso de se
querer simplificar mais tarde — e para não voltar a discutir-se do zero.

---

## Escala

Vem toda do [`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md) — nove degraus fluidos,
base 16 px, piso de 12 px. Não se inventa um tamanho numa folha de
componente.

Regras de composição próprias da marca:

| Onde | Regra |
|---|---|
| Títulos (Spectral) | **Caixa de frase**, não maiúsculas. A caixa alta era imposta pelo Cinzel, e deixou de ser preciso |
| Rótulos e eyebrows | Fira Sans, maiúsculas, `--text-2xs`/`--text-xs`, espacejadas |
| Corpo | Fira Sans, caixa normal, medida limitada a 68ch (`.u-measure`) |
| Preços | **Fira Sans**, não Spectral. Um preço é informação, não título |
| Botões e interface | Fira Sans Medium |

---

## Formato de números — regra fechada

O site tem hoje **dois formatos de preço em páginas consecutivas**: `25,00 €`
no cartão do catálogo e `€25.00` na ficha de produto.

> **O formato é português: `25,00 €`.** Vírgula decimal, espaço, símbolo
> depois.

Implementação: usar sempre o valor já formatado
(`product.formatted_sale_price`), como faz o cartão de catálogo. Nunca
`'€' + parseFloat(x).toFixed(2)` — é o que produz o formato americano.

O mesmo vale para o peso: `12,4 g`, não `0.000`. E um campo vazio **não se
mostra** — ver [auditoria](06-auditoria-site.md).
