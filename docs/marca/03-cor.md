# 03 · Cor

Este documento fecha a peça que faltava ao [`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md).
Esse fixou espaçamento, tipo, raios e camadas — **a cor ficou de fora**, e é
onde a divergência está hoje concentrada.

---

## O problema, em números

Estado do CSS do frontend a 2026-08-04:

| Métrica | Valor |
|---|---|
| Literais hexadecimais em `public/css/` | **363** |
| Valores distintos | **84** |
| Variantes de dourado em circulação | **7** |

Os sete dourados: `#c9a84c` (85 ocorrências), `#b08d57`, `#dcbb63`,
`#d4b85c`, `#c19963`, `#d4a76f`, `#b87333`. Nenhum é errado sozinho; juntos
são a razão pela qual as páginas não parecem a mesma marca.

E há **três paletas em simultâneo**:

| Paleta | Onde | Temperatura |
|---|---|---|
| `--color-*` em `variables.css` | Nome antigo, herdada | **Fria** — pretos azulados (`#05070a`), prata `#C0C0C0`, bronze `#B87333` |
| `--igp-*` em `variables.css` | Tema showcase | Quente — `#0a0a0a`, ouro `#c9a84c`, creme `#f0ece4` |
| **TERRA** | Documento do lettering | Quente, terra — a única desenhada com a marca nova |

---

## A decisão

> **A paleta é a TERRA.** As outras duas passam a aliases e desaparecem.

Porquê a TERRA e não a que já está no código:

1. É a **única** que nasceu com a identidade nova — foi com ela que o
   lettering foi desenhado e provado.
2. A `--color-*` contradiz o questionário. O questionário pede preto, prata,
   dourado, **verde escuro e castanho** — terra. O `#05070a` tem o canal azul
   acima do vermelho: é um preto frio, e frio é exactamente o que a marca diz
   não ser ("nunca fria, nunca artificial").
3. A `--igp-*` está perto, mas é um tema de uma secção e não uma paleta de
   marca — não tem verde nem castanho, que são metade da narrativa.

---

## A paleta

| Token | Valor | Nome | Papel |
|---|---|---|---|
| `--terra-preto` | `#12100E` | Preto terra | **Fundo base.** Preto quente, não neutro |
| `--terra-verde` | `#3A4038` | Verde fundo | Superfície elevada, cartão, faixa |
| `--terra-castanho` | `#6B5844` | Castanho | Bordas, separadores, superfície morna |
| `--terra-ouro` | `#B9A06A` | Ouro velho | **Acento único.** Preço, estado activo, sublinhado |
| `--terra-prata` | `#C8C6C1` | Prata | Texto secundário. É a cor do produto |
| `--terra-areia` | `#F2EDE4` | Areia | **Texto principal.** É a cor do lettering |

### Contraste — medido, não estimado

Sobre `--terra-preto` (`#12100E`):

| Cor | Rácio | Veredicto |
|---|---|---|
| Areia `#F2EDE4` | **16.28:1** | Texto principal. Folgado |
| Prata `#C8C6C1` | **11.12:1** | Texto secundário. Passa AAA |
| Ouro `#B9A06A` | **7.50:1** | Passa AA para todo o texto |
| Castanho `#6B5844` | **2.81:1** | ❌ **Nunca texto.** Superfície e borda |
| Verde `#3A4038` | **1.78:1** | ❌ **Nunca texto.** Superfície |

### Três armadilhas de contraste

1. **O ouro só funciona sobre escuro.** `#B9A06A` sobre areia dá **2.17:1** —
   reprova com folga. Em qualquer superfície clara, o acento é o preto terra
   (16.28:1), não o ouro.

2. **Ouro sobre verde dá 4.21:1** — abaixo dos 4.5 exigidos para texto
   normal. Passa para texto grande (≥ 24 px, ou ≥ 19 px a bold). Preço em
   ouro sobre um cartão verde só é legal se for grande.

3. **Castanho e verde não são cores de texto.** São o chão. Quem quiser
   escrever por cima usa areia (9.14:1 sobre o verde) ou prata.

---

## Papéis — a regra que evita a próxima divergência

Um token de paleta **nunca é usado directamente num componente.** Usa-se o
token de papel:

```css
:root {
  /* Paleta — os seis valores. Só aqui. */
  --terra-preto:    #12100E;
  --terra-verde:    #3A4038;
  --terra-castanho: #6B5844;
  --terra-ouro:     #B9A06A;
  --terra-prata:    #C8C6C1;
  --terra-areia:    #F2EDE4;

  /* Papéis — o que os componentes usam. */
  --surface-base:      var(--terra-preto);
  --surface-raised:    var(--terra-verde);
  --surface-sunken:    color-mix(in srgb, var(--terra-preto) 92%, black);
  --border-quiet:      color-mix(in srgb, var(--terra-castanho) 45%, transparent);
  --border-loud:       var(--terra-castanho);
  --text-primary:      var(--terra-areia);
  --text-secondary:    var(--terra-prata);
  --text-quiet:        color-mix(in srgb, var(--terra-prata) 65%, transparent);
  --accent:            var(--terra-ouro);
  --accent-on:         var(--terra-preto);  /* texto sobre o acento: 7.50:1 */
}
```

Porquê a camada extra: quando o acento mudar — e um dia muda — muda-se
`--accent`. Sem ela, muda-se em 85 sítios, que foi como chegámos aos sete
dourados.

---

## Cores proibidas

**Rosa, amarelo, azul, vermelho.** Vem do questionário e vale para assets,
banners, fotografia e fundos.

Três excepções, todas funcionais e todas contidas:

| Uso | Porquê é excepção |
|---|---|
| Erro / destrutivo | Acessibilidade. Vermelho contido, nunca decorativo |
| Estados de formulário | Idem |
| Logótipos de terceiros | Instagram, Facebook. Dentro do seu ícone e mais nada |

**O verde do WhatsApp não é excepção.** O `#25D366` da plataforma é hoje o
elemento mais berrante da ficha de produto — mais forte do que "adicionar ao
carrinho". O botão fica; a cor passa a ser da marca, com o ícone a marcar a
plataforma. Ver [auditoria](06-auditoria-site.md).

---

## Migração

Não se troca `variables.css` de uma vez. A ordem que não parte nada:

1. **Acrescentar** os seis tokens TERRA e os papéis. Não remover nada.
2. **Reapontar** os tokens antigos para os novos, como aliases
   (`--igp-gold: var(--terra-ouro)`). Uma linha muda 85 ocorrências.
3. **Substituir literais**, ficheiro a ficheiro, começando pelos 36 de
   `homepage.css` e pelos 34 de `brand-showcase.css`.
4. **Remover os aliases** quando os literais forem zero.

Verificação a repetir em cada passo, a mesma do `DESIGN_SYSTEM.md`: nenhum
texto abaixo de 4.5:1 (3:1 para texto grande), sem transbordo horizontal a
390 px e 1440 px, CLS abaixo de 0.1.
