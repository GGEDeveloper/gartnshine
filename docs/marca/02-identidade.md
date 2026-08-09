# 02 · Identidade

O logótipo da Gonzaga é um **lettering proprietário** — um alfabeto desenhado
de raiz, não uma fonte licenciada. Nasceu de um desenho à mão do N e do Z
(`branding-desing/nome-e-lettering/uploads/20260803_235635.jpg`) e foi
regularizado num sistema fechado.

A especificação completa, ao nível da cota, está em
`branding-desing/nome-e-lettering/Gonzaga Lettering.dc.html`. Este documento
não a repete — diz **como se usa**.

---

## 1. O princípio que segura tudo

> **Tudo o que está fora do eixo é côncavo. Tudo o que está sobre o eixo é
> recto.**

É essa regra que justifica a haste do Y e a barra do G serem rectas enquanto
as hastes do E, do R e do J são côncavas. Se um dia se desenhar uma letra
nova, é esta a regra a que tem de obedecer.

O segundo princípio, o do alfabeto: **cada linha pequena é o arranque literal
de uma linha da letra vizinha** — mesma curvatura, mesmo ângulo de entrada, só
o bocado visível. As do N são os primeiros 27 % da barra do Z; as do Z são os
primeiros 15 % da haste do N. Não são ornamento: são citação.

Grelha: **200 × 300 u**, altura de maiúscula **284 u**.

---

## 1b. Espacejamento — desvio deliberado à fonte

**A palavra não usa o espacejamento do documento de origem.** É a única
alteração que os ficheiros de produção introduzem, e fica registada aqui.

| Par | Fonte | **Em produção** |
|---|---|---|
| GO · ON · NZ · ZA | 22 u | 22 u — inalterado |
| **AG · GA** | **44 u** | **10 u** |

Medidas de linha média a linha média, entre o extremo de tinteiro de cada
letra. Largura da palavra: 1465 u → **1397 u**.

**Porque mudou.** A fonte duplicava a margem no AG e no GA com a justificação
de que o pé aberto do A e o vértice do losango "liam-se como uma letra só".
Medida a distância real em 2D entre os dois contornos — e não a diferença
entre caixas — **o A e o G nunca se aproximam a menos de 66 u**, mesmo aos
10 u de margem. Estão a alturas diferentes: o que os separa na vertical é
muito maior do que o que os separa na horizontal. **O encosto que motivou a
regra não existe**, e o dobro de margem deixava a palavra aberta à direita
e fechada ao meio.

**O princípio, generalizado:** a margem métrica não pode ser igual para
extremos diferentes. Um **vértice** (G, O) precisa de menos distância do que
uma **haste recta** de altura inteira (N, Z), porque a mesma medida deixa
passar muito mais ar. Se um dia se espacejar uma palavra nova, é isto que
manda — não um número único.

O mesmo ajuste está aplicado a `wordmark-reduzido.svg`,
`wordmark-gravacao.svg` e à parte GONZAGA do `lockup.svg`. No lockup, o
JEWELLERY foi deslocado em bloco, para o espaço entre palavras se manter nos
130 u.

**A figura "Antes · caixa fixa de 200 u" da fonte não é utilizável** — tem as
mesmas posições de letra que a figura "Depois". A comparação antes/depois do
documento de origem mostra a mesma imagem duas vezes.

---

## 2. Ficheiros

Vivem em `gonzagas_node/public/brand/`. Todos usam `currentColor` — a cor
vem do CSS, nunca do ficheiro.

| Ficheiro | O que é | Usar quando |
|---|---|---|
| `wordmark.svg` | GONZAGA, fio único 9 u | **Uso por omissão.** Cabeçalho, rodapé, assinaturas |
| `wordmark-reduzido.svg` | GONZAGA sem linhas pequenas, traço 9 u | Abaixo de 20 px de altura de maiúscula |
| `wordmark-gravacao.svg` | GONZAGA haste sólida 20 u | Ourivesaria: gravação, corte, cunho, bordado |
| `lockup.svg` | GONZAGA JEWELLERY numa linha | Contextos largos e internacionais; assinatura de documento |
| `jewellery.svg` | Só a segunda palavra | Compor lockups; raramente sozinho |
| `monograma-g.svg` | G isolado | Avatar, ícone, marcação pequena |
| `losango.svg` | Só o losango, sem letra | Marca de água, separador, padrão |
| `selo.svg` | Losango com a barra do G no eixo | Selo, etiqueta, lacre |

**Extracção:** foram gerados a partir do documento de origem. Se a fonte
mudar, voltam a extrair-se — não se editam à mão.

### Os dois pesos, e só dois

| Peso | Traço | Para |
|---|---|---|
| **Fio único** | 7–9 u | O logótipo e todo o uso impresso |
| **Haste sólida** | 20 u | Ourivesaria, onde o fio único desaparece no metal |

**Não há intermédios.** Um peso a meio caminho não é uma variante da marca, é
um erro.

Nota de construção: no peso de gravação a travessa do A desce para y=214
(menos 12 u) porque a contraforma é a mais apertada da palavra e é a primeira
a encher. No fio único fica em y=202. Não é inconsistência — é compensação
óptica, e é por isso que os dois ficheiros existem separados.

---

## 3. Tamanho mínimo

Medido em **altura de maiúscula**, não em altura de ficheiro:

| Tamanho | Versão |
|---|---|
| ≥ 34 px | `wordmark.svg` — completo, confortável |
| 20–34 px | `wordmark.svg` — completo, no limite |
| **< 20 px** | `wordmark-reduzido.svg` — obrigatório |

Abaixo de 20 px (≈ 7 mm impresso) as linhas pequenas deixam de se ler e
passam a **sujar os vértices**. A versão reduzida mantém o losango, a cintura
do N e do Z e a cúpula do A — o que identifica a palavra.

Para favicon e ícones de aplicação, nenhuma das duas: usa-se
`monograma-g.svg` ou `selo.svg`.

---

## 4. Zona de protecção

**Uma altura de maiúscula em volta**, medida a partir do tinteiro real das
letras e não de uma caixa de desenho.

Para o `wordmark.svg` (viewBox 1397 × 300, cap 284 u) isso são 284 u de
folga de cada lado. Em CSS, o mais simples é reservar `padding` equivalente a
`1em` da altura visual do logótipo.

> Esta medida era a única coisa que a especificação deixava por fixar
> ("proposta de uma altura de maiúscula"). Fica fixada aqui.

---

## 5. Proibições

Não se faz, em nenhum contexto:

- **Redesenhar** uma letra, encurtar uma linha pequena ou mudar um ângulo.
- **Esticar ou comprimir** — a escala é sempre proporcional.
- Aplicar **sombra, relevo, contorno ou gradiente** sobre o lettering.
- Usar um **peso intermédio** entre o fio único e a haste sólida.
- Usar o completo **abaixo de 20 px** de altura de maiúscula.
- Colocar o lettering sobre uma fotografia **sem véu suficiente** — o fio
  único desaparece em qualquer fundo com detalhe.
- Escrever "GONZAGA" numa fonte qualquer e chamar-lhe logótipo. **É o que o
  site faz hoje** (usa Cinzel) — ver [auditoria](06-auditoria-site.md).
- Misturar o lettering com o logótipo antigo do nó celta
  (`docs/rebranding/logo-teste1-*.PNG`). Ver ponto 7.

---

## 6. Acentos

O alfabeto já resolve o português: **Ã Á É Ç**, mais o **C** (que é o G sem a
barra e apareceu de graça ao resolver o Ç).

Regra: **a altura do acento nunca muda de letra para letra.** O agudo é recto
a 60° — o ângulo da diagonal do N e do Z. O til é a cúpula do A encadeada com
a sua imagem espelhada.

---

## 7. O que morre

O logótipo de teste com o **nó celta sobre lua crescente** e GONZAGA em serifa
(`docs/rebranding/logo-teste1-full.PNG`, `-small.PNG`) **não é a direcção da
marca.** Fica arquivado.

Porquê, sem rodeios: é ornamento emprestado — nó celta não tem relação com
prata 925, Bali ou pedra natural — e a serifa por baixo é uma fonte de
prateleira. O lettering novo faz o oposto: é original, tem uma regra interna,
e a sua forma-mãe (o losango) sai da própria construção em vez de vir de um
repositório de vectores. Manter os dois em circulação é ter duas marcas.

---

## 8. Por fechar

| Item | Estado |
|---|---|
| **Lockup empilhado** (GONZAGA sobre JEWELLERY) | **Por especificar.** A fonte mostra as duas palavras em coluna, mas com escalas e traços independentes — é uma figura de documento, não um lockup desenhado. Falta decidir a razão de altura de maiúscula entre as duas palavras e a compensação óptica do traço. Não foi gerado ficheiro, de propósito. |
| **Ligadura GJ** | Em aberto. Depende de como o losango se comporta em peça pequena. |
| **Caixa baixa** | Arquivada, e resolvida: a tipografia de acompanhamento está escolhida — Spectral e Fira Sans. Ver [04](04-tipografia.md). |
| **Vectorização para corte** | Contornos fechados derivados do fio único. Por fazer. |
| **Aplicações** | Embalagem, etiqueta, cartão, gravação em peça. **Nada desenhado.** |
