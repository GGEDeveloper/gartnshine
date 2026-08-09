# 01 · Plataforma de marca

Consolidação do questionário (`branding-desing/brand_bible_profissional.md`)
em decisões operáveis. Onde o questionário deixou uma ambiguidade, este
documento fecha-a e diz porquê.

---

## 1. A marca em uma frase

> **Gonzaga** faz joalharia artesanal em prata 925 e pedras naturais, para
> quem quer uma peça com origem e presença — não um produto de catálogo.

Mote: **Elegância que nasce da terra.**

---

## 2. Arquitectura de nome — regra fechada

Havia quatro formas do nome em circulação. Ficam duas, com uso definido:

| Forma | Onde se usa | Onde **não** se usa |
|---|---|---|
| **Gonzaga** | Cabeçalho, rodapé, texto corrido, embalagem, redes | — |
| **Gonzaga Jewellery** | `<title>`, schema.org, feeds, contexto internacional, lockup | Cabeçalho do site (é redundante com o logótipo) |

**Porque o descritor existe só no SEO:** "Gonzaga" sozinho é apelido comum,
uma universidade nos EUA e uma cidade no Brasil. Como termo de pesquisa é
muito mais disputado do que "Art & Shine" era. O descritor desambigua onde
importa e é invisível no site.

Isto está implementado em [`config/brand.js`](../../gonzagas_node/config/brand.js).
**Nenhum ficheiro fora daí escreve o nome da marca.** A regra vale também
para o admin — que hoje ainda a viola (ver [auditoria](06-auditoria-site.md)).

`Gonzaga's Art & Shine` sobrevive apenas como `alternateName` no schema.org,
para o Google ligar as duas identidades. Sai daqui a ~6 meses da mudança —
ver [`docs/rebranding/PLANO.md`](../rebranding/PLANO.md), fase 6.

---

## 3. Posicionamento

| Eixo | Posição |
|---|---|
| Segmento | Mid-range com acabamento premium |
| Preço | 10 € – 500 € |
| Produção | Por encomenda |
| Mercado | Portugal primeiro; internacional sem pressa |
| Modelo | E-commerce, com marketplace como fase 2 |

**O diferencial não é o produto, é a relação.** O Gonzaga como pessoa,
vendedor e criador de laços. Tudo o que o site faz deve deixar essa porta
aberta — daí o WhatsApp na ficha de produto fazer sentido como conceito
(mesmo estando mal desenhado hoje).

**Objecção principal: o preço.** A resposta não é descontar, é justificar —
material, origem, feitura. É isso que a ficha de produto tem de dizer e hoje
não diz.

---

## 4. Público

**Perfil:** 25–45 anos, misto, alternativo e artístico. Feiras, festivais,
raves, artesanato, feiras medievais. Compra para si e para oferecer.

**Motiva:** estética, materiais, design, moda.
**Trava:** preço.

A marca quer alargar para além deste núcleo — mas o alargamento faz-se por
qualidade de apresentação, não por diluição da estética.

---

## 5. Hierarquia comercial — decisão

O questionário é explícito e o site não o reflecte:

| Prioridade | Categoria | Papel |
|---|---|---|
| 1 | **Pulseiras de prata** | Mais forte comercialmente **e** mais representativa |
| 2 | **Fios de prata** | Idem |
| 3 | Anéis, brincos, pendentes, gargantilhas | Volume |
| 4 | Latão, macramé | Existem, **não devem dominar a imagem** |

**Consequência prática:** destaques da homepage, capas de categoria e imagem
de partilha começam por prata. Latão e macramé nunca abrem uma página.

---

## 6. Tom de voz

**Próximo e elegante.** Descontraído e formal ao mesmo tempo — a mistura é
intencional e é o que soa a pessoa e não a loja.

| Faz | Não faz |
|---|---|
| Frase curta, afirmativa | Superlativos ("o melhor", "exclusivo", "único no mundo") |
| Fala do material e da origem | Linguagem de campanha ("não perca", "última oportunidade") |
| Trata por tu quando o contexto é directo | Formalidade de contrato em página de produto |
| Português europeu | Português do Brasil |

**Expressões da casa:** "Até já.", "Bem-vindos."

**Português europeu, sem excepção.** O site tem hoje pelo menos uma frase em
pt-BR ("a página que **você** está procurando") e vários botões em inglês.
Ver [auditoria](06-auditoria-site.md).

**Idiomas:** português agora, inglês depois. O inglês não é prioridade e não
deve ser meia-feito — uma página traduzida a meio custa mais do que nenhuma.

---

## 7. O que a marca é e não é

| É | Não é |
|---|---|
| Arte | Fria |
| Natureza | Genérica |
| Personalidade | Mainstream |
| Matéria com alma | Artificial |

**Deve transmitir:** conforto, confiança, presença, desejo.
**Nunca:** insegurança, conformismo, medo.

---

## 8. Materiais

**Permitidos:** prata 925, latão, macramé, pedras naturais.
**Proibidos:** falsificações e réplicas. Sem excepção, incluindo em fase de
marketplace.

Referência estética: boho, com raiz em Tailândia, Bali e Índia. É referência,
não decalque — o lettering existe precisamente para a marca ter forma própria
em vez de pedir emprestado.

---

## 9. Multi-vendedor — regra mínima

Ainda não está implementado, e a decisão que importa tomar cedo é esta:
**os parceiros entram dentro da armação visual da Gonzaga.** Podem adaptar
fundos, logótipo próprio e destaques; não podem trazer a sua própria grelha,
tipografia ou paleta.

Curadoria editorial fica para a fase 2. O selo de aprovação também.

O risco identificado na auditoria de coerência original mantém-se e é o
principal: **deixar a flexibilidade visual crescer sem regras suficientes.**
Estas páginas existem para isso não acontecer.
