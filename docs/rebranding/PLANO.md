# Plano de mudança de nome — "Gonzaga's Art & Shine" → "Gonzaga"

**Estado:** plano, por aprovar. Nada foi executado.
**Data da análise:** 31/07/2026

---

## O que a análise encontrou

Três conclusões que mudam o esforço esperado, todas verificadas no código e
na base de dados:

### 1. O logótipo do site é **texto**, não uma imagem

`views/partials/header.ejs` já define duas variáveis e desenha-as como texto:

```js
const brandFull  = typeof siteTitle !== 'undefined' ? siteTitle : "Gonzaga's Art & Shine";
const brandShort = 'Art&Shine';
```

Não há imagem de logótipo no cabeçalho para redesenhar. Mudar o nome no
cabeçalho é mudar uma string.

**Mas** existe `public/logo.svg`, que é um desenho a sério (vectorial, 304×406)
e é usado no schema.org como logótipo da organização. Esse **precisa de
trabalho de design**, tal como a imagem de partilha `og-artnshine.jpg`.

### 2. A base de dados está praticamente limpa

| Verificação | Ocorrências |
|---|---|
| Nomes de produto com a marca | **0** |
| Descrições de produto com a marca | **0** |
| Coleções com a marca | **0** |
| Categorias com a marca | **1** — família 26, "Pulseiras pequenas para pé. Gonzaga's Art& Shine" |

Isto é a melhor notícia do levantamento: **não há migração de dados**. Um
`UPDATE` numa linha resolve o lado da base de dados.

### 3. A marca no código está concentrada, e um terço é irrelevante

| Área | Ocorrências | Ficheiros | Natureza |
|---|---|---|---|
| `views/` | 54 | 19 | **Texto visível** — títulos, rodapé, schema.org |
| `routes/` | 17 | 3 | Metadados, descrições geradas, mensagens |
| `controllers/` | 7 | 2 | Metadados |
| `modules/` | 3 | 3 | Comentários e mensagens |
| `models/` | 1 | 1 | Comentário |
| `public/css` + `public/js` | 34 | 34 | **Comentários de cabeçalho de ficheiro** — risco zero |

Ou seja: **~82 ocorrências em código vivo, das quais 34 são comentários.**
O trabalho real são ~48 pontos em 25 ficheiros.

### 4. O domínio é caso à parte

`artnshine.pt` aparece **71 vezes** em código, mas já existe a variável de
ambiente `BASE_URL` como sobreposição (`process.env.BASE_URL || 'https://artnshine.pt'`).

O nome da marca está **dentro do domínio** — é essa a decisão que ainda falta
e que este plano trata como fase separada e opcional.

---

## Recomendação de arquitectura

**Centralizar a marca num único sítio configurável, antes de lhe tocar.**

Hoje o nome está escrito à mão em 25 ficheiros, em pelo menos quatro formas
diferentes: `Gonzaga's Art & Shine`, `Gonzaga's Art &amp; Shine`, `Art&Shine`,
`Art & Shine`. Substituir tudo de uma vez é possível, mas deixa o problema
igual para a próxima vez.

A proposta é um módulo `config/brand.js`:

```js
module.exports = {
  nome: 'Gonzaga',              // como aparece a quem visita
  nomeCurto: 'Gonzaga',         // cabeçalho estreito, telemóvel
  nomeSeo: 'Gonzaga',           // <title>, schema.org — pode levar descritor
  nomeAlternativo: null,        // schema.org alternateName, na transição
  email: 'g.art.shine@gmail.com',
  dominio: process.env.BASE_URL || 'https://artnshine.pt'
};
```

Isto responde directamente ao que ficou por decidir: **a forma exacta do nome
deixa de ser uma decisão a tomar antes de começar.** Centraliza-se primeiro
com o nome actual (sem mudança visível nenhuma, e portanto sem risco), e
depois muda-se um ficheiro.

---

## Fases

### Fase 0 — Decisões (bloqueia a Fase 2)

| Decisão | Estado |
|---|---|
| Forma exacta do nome (`Gonzaga` sozinho ou com descritor no SEO) | **Por decidir** — a Fase 1 torna isto barato |
| O domínio muda? | **Por decidir** — ver Fase 5 |
| Email novo? `g.art.shine@gmail.com` contém a marca antiga | Por decidir |
| Handle do Instagram `@gonzagaartnshine` muda? | Por decidir |

**Nota sobre "Gonzaga" sozinho:** é apelido comum, universidade nos EUA e
cidade no Brasil. Como termo de pesquisa é muito mais disputado do que
"Art & Shine", que era praticamente único. Se o nome visível for só
"Gonzaga", vale a pena que o `<title>` e o schema.org levem um descritor
("Gonzaga · Joias") — é invisível no site e faz diferença real na pesquisa.

### Fase 1 — Centralizar (sem mudança visível)

Criar `config/brand.js` com os valores **actuais** e fazer os ~48 pontos
passarem a lê-lo. Zero alteração para quem visita — o site continua a dizer
"Gonzaga's Art & Shine".

Porque é uma fase à parte: pode ser revista, testada e publicada sozinha, e
qualquer erro aparece imediatamente como texto errado no sítio errado, não
misturado com a mudança de nome.

**Verificação:** `npm test`, auditoria de SEO, e comparar o HTML de todas as
páginas antes e depois — tem de ser **idêntico**.

### Fase 2 — Mudar o nome

Alterar `config/brand.js`. Mais:

- `UPDATE` na descrição da família 26;
- rever os 34 comentários de cabeçalho (cosmético, pode ir junto);
- `alternateName` no schema.org com o nome antigo durante ~6 meses, para o
  Google ligar as duas identidades.

### Fase 3 — Elementos gráficos

| Ficheiro | O que é | Precisa de |
|---|---|---|
| `public/logo.svg` | Desenho vectorial, usado no schema.org | **Design** |
| `public/images/og-artnshine.jpg` | Imagem de partilha 1200×630 | **Design** |
| `favicon.ico`, `favicon-16/32`, `apple-touch-icon`, `android-chrome-192/512` | Ícones | **Design** |
| `site.webmanifest` | Nome da aplicação | Texto |

Já existem provas em `docs/rebranding/logo-teste1-*.PNG`.

### Fase 4 — Superfícies externas (não é código)

- **Search Console** — o nome da marca não exige acção técnica; o Google
  reaprende. Reenviar o sitemap acelera.
- **Merchant Center** — nome da loja no feed `/feed/products.xml`.
- **Instagram** `@gonzagaartnshine` e **Facebook** — mudar o handle do
  Instagram **quebra todos os links existentes** para o perfil; ponderar.
- **Email** — se mudar, actualizar em código, no schema.org e onde estiver
  publicado.
- **Google Business Profile**, se existir.

### Fase 5 — Domínio (opcional, decidir depois)

**A recomendação é não fazer isto ao mesmo tempo que a mudança de nome.**

Mudar o nome e o domínio juntos torna impossível saber a que se deve qualquer
queda de tráfego. Um de cada vez, com semanas de intervalo, deixa ler o
efeito de cada um.

Se o domínio mudar, é uma migração a sério:

1. Comprar o domínio e apontar DNS;
2. Servir o site nos dois;
3. **301 de todas as 441 URLs**, uma a uma — não um redirect global para a
   raiz, que o Google trata como soft-404;
4. Actualizar `BASE_URL`, canonical, sitemap, robots, feed do Merchant;
5. **Search Console → Change of Address**;
6. Manter o domínio antigo a redireccionar **pelo menos 1 ano** — idealmente
   para sempre;
7. Contar com uma queda temporária de tráfego, de semanas a meses.

---

## Riscos

| Risco | Gravidade | Mitigação |
|---|---|---|
| "Gonzaga" é termo de pesquisa disputado | **Alta** | Descritor no `<title>` e schema; `alternateName` com o nome antigo |
| Perder o reconhecimento de quem já conhece a marca | Média | Transição visível ("Art & Shine é agora Gonzaga") durante uns meses |
| Ficar texto por mudar em cantos do site | Baixa | A Fase 1 elimina este risco quase por completo |
| Handle do Instagram partir links existentes | Média | Ponderar manter o handle |
| Domínio a não bater certo com o nome | Baixa | Comum e sem consequências práticas |

---

## Esforço estimado

| Fase | Esforço | Risco |
|---|---|---|
| 1 — Centralizar | Médio (25 ficheiros, mecânico e verificável) | **Muito baixo** |
| 2 — Mudar o nome | Baixo (um ficheiro + um UPDATE) | Baixo |
| 3 — Gráficos | Depende do design, não da programação | Baixo |
| 4 — Externas | Manual, fora do código | Médio (Instagram) |
| 5 — Domínio | Alto | **Alto** |

---

## O que sugiro

Avançar já com a **Fase 1**, que não tem decisões pendentes nem mudança
visível, e que torna tudo o resto barato. As Fases 2 a 4 ficam à espera das
decisões da Fase 0, e a Fase 5 decide-se com calma, semanas depois de o nome
ter mudado.
