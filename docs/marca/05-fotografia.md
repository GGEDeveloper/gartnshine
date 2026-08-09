# 05 · Fotografia

**É aqui que a marca está a perder mais valor.** A identidade está desenhada,
a paleta está escolhida, o CSS pode arrumar-se num par de dias — mas 220
fichas de produto com fotografias inconsistentes dizem "mid-range" quando o
posicionamento é "mid-range com acabamento premium". Nenhum trabalho de
design compensa isso.

E é o mais barato de corrigir: não precisa de estúdio, precisa de uma regra
e de repetição.

---

## O que se vê hoje

Numa só página do catálogo, oito produtos, contam-se **cinco fundos
diferentes**: papel-toalha branco com fibras visíveis, cartolina cinzenta,
tecido cinzento-esverdeado, ganga azul, e um fundo claro sobreexposto. A
iluminação muda de peça para peça. Algumas imagens não são quadradas e
aparecem com **barras brancas** em cima e em baixo dentro do cartão.

A ganga azul é ainda um problema de regra: **azul é cor proibida.**

---

## Duas fotografias, dois trabalhos

| | **Catálogo** | **Ambiente** |
|---|---|---|
| Serve para | Comparar e decidir | Desejar e perceber a marca |
| Onde | Ficha de produto, grelha, feed do Merchant | Hero, capas de categoria, "sobre", redes |
| Estilo | Neutro, repetível, honesto | Natural, escuro, com contexto |
| Regra que manda | **Consistência absoluta** | Coerência de atmosfera |

**Não se misturam.** Uma foto de ambiente não serve de imagem principal de
uma ficha; uma foto de catálogo não abre uma página.

---

## Catálogo — o protocolo

A parte que só precisa de ser cumprida sempre da mesma maneira.

### Fundo

**Um só, para todo o catálogo.** Papel ou cartolina lisa, mate, em cinzento
neutro claro. Nunca tecido com trama, nunca papel-toalha, nunca ganga,
nunca superfície com brilho.

Porquê cinzento neutro e não branco: a prata sobre branco perde o contorno e
obriga a sobreexpor; o cinzento dá-lhe borda sem escurecer a peça. E porquê
claro, se o site é escuro: a peça tem de se ler no feed do Merchant, no
Instagram e num telemóvel ao sol. O fundo do **site** é escuro; o da
**fotografia de produto** não tem de ser.

### Luz

Luz difusa, indirecta, sempre do mesmo lado. **Nunca flash da máquina** — é
o que faz o reflexo branco duro na prata e apaga o relevo.

O mesmo enquadramento, a mesma distância e a mesma altura para todas as peças
da mesma categoria. Um anel a seguir a outro anel tem de parecer a mesma
sessão.

### Enquadramento

| Regra | Valor |
|---|---|
| Proporção | **1:1**, cortada no ficheiro |
| Peça no enquadramento | 70–80 % da altura ou da largura, o que for maior |
| Margem mínima | 10 % de cada lado |
| Ângulo obrigatório 1 | Frente |
| Ângulo obrigatório 2 | Peça inteira, à escala |

**A proporção corta-se no ficheiro, não no CSS.** As barras brancas que hoje
aparecem nos cartões são imagens não quadradas dentro de um contentor
quadrado. Corrigir no CSS com `object-fit: cover` esconde o sintoma e corta a
peça ao acaso; corrigir na origem resolve os dois.

### Ângulos adicionais, quando existirem

Pela mesma ordem em todos os produtos: frente → peça inteira → detalhe do
fecho ou da pedra → em uso. **A ordem é a mesma sempre**, para que passar de
uma ficha para outra não reponha o olho a zero.

### Pós-produção

Corrigir o **balanço de brancos** e nada mais. Sem filtro, sem viragem de
cor, sem recorte a caneta com halo. A prata é acinzentada e o latão é
amarelado — é o que são, e a marca proíbe réplicas exactamente porque a
matéria verdadeira é o argumento.

---

## Ambiente — a direcção

Aqui há liberdade, dentro de uma atmosfera.

**Cenários:** madeira, pedra, flora, água, mãos e pessoas. Natureza real,
não cenário montado.

**Luz:** natural, de fim de dia. Sombra funda é bem-vinda — o fundo do site é
escuro e a foto tem de assentar nele.

**Modelos:** perfil alternativo e tribal, como o questionário define. As
peças aparecem em contexto real **e** isoladas — as duas coisas, não uma.

**Vídeo de hero:** atmosférico, movimento lento. Sem corte rápido, sem texto
queimado na imagem.

**Cores no enquadramento:** dentro da [paleta TERRA](03-cor.md) — preto,
castanho, verde escuro, areia. **Rosa, amarelo, azul e vermelho ficam fora do
enquadramento**, incluindo roupa do modelo e objectos de cena.

---

## Hierarquia — o que abre

Segue a [hierarquia comercial](01-plataforma.md#5-hierarquia-comercial--decisão):

- **Hero e capas de categoria: prata.** Pulseiras e fios primeiro.
- Latão e macramé aparecem no catálogo e nunca abrem uma página.

---

## Armadilha conhecida

**Um rosto atrás de texto centrado.** O hero da página "sobre" põe
"GONZAGA JEWELLERY" por cima da cara do Gonzaga. A marca diz que a ligação
pessoal é o centro da credibilidade — tapar a cara com o nome faz o contrário
do que a página existe para fazer.

Regra: quando há uma pessoa no enquadramento, o texto vai para o terço vazio.
Se não houver terço vazio, corta-se a fotografia até haver.

---

## Prioridade realista

Não é preciso refotografar 220 peças para ver diferença.

1. **As que abrem alguma coisa** — hero, capas das cinco categorias,
   destaques da homepage. São ~15 imagens.
2. **Pulseiras e fios de prata** — o núcleo comercial.
3. **As de fundo proibido** (ganga azul) e as que geram barras brancas.
4. O resto, por lotes.
