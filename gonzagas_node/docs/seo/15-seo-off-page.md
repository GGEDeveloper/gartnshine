# SEO Off-Page — Autoridade e Visibilidade Externa

**Objetivo:** Ganhar autoridade de domínio e tráfego externo através de presença fora do site  
**Prioridade:** 🟡 Média — resultados em 3-12 meses  
**Esforço:** Contínuo, não é um sprint pontual

---

## Avaliação Honesta para este Projeto

Antes de entrar em tácticas, é importante ser realista:

**O que FAZ sentido para artnshine.pt:**
- Pinterest SEO — joias são a categoria #1 do Pinterest, tráfego rápido e gratuito
- `sameAs` com URLs reais (ainda têm placeholders nos docs)
- 5-10 links de qualidade em sites PT relevantes (vale mais que 100 links genéricos)
- Press/menções em blogs de artesanato e joias portuguesas

**O que NÃO faz sentido para uma marca artesanal pequena:**
- Guest posting em massa
- Compra de links (Google penaliza e é caro)
- Troca de links com sites não relacionados
- Tácticas de black-hat SEO

O foco deve ser **presença autêntica** em sitios onde o público-alvo já está.

---

## Task OF1 — sameAs com URLs Reais (⚠️ PENDENTE)

### Estado actual

Todos os documentos SEO ainda têm URLs placeholder:
```json
"sameAs": [
  "https://www.instagram.com/CONFIRMAR_USERNAME/",
  "https://www.facebook.com/CONFIRMAR_USERNAME/"
]
```

### Acção imediata

Substituir em todos os ficheiros relevantes com os URLs reais:
1. `09-fase-b-schema-avancado.md` — schema do @graph
2. `12-fase-e-seo-local.md` — LocalBusiness schema
3. Quando implementado no código: `routes/seo.js` e templates EJS

**Confirmar:**
- URL completo do Instagram (ex: `https://www.instagram.com/artnshine.pt/`)
- URL completo do Facebook
- Outros perfis se existirem (Pinterest, TikTok)

---

## Task OF2 — Pinterest SEO (Prioridade Alta para Joias)

### Porquê Pinterest é crítico para joias

- Pinterest é o **3º motor de pesquisa de imagens** do mundo
- Joias, moda e artesanato são as categorias com mais tráfego
- Os pins do Pinterest **aparecem nos resultados do Google Images**
- Um pin partilhado por outros utilizadores = backlink natural
- Pinterest é especialmente forte entre o público feminino 25-45 anos (público-alvo das joias)

### Setup da conta

1. Criar conta **Business** em pinterest.com/business
2. Verificar o site `artnshine.pt` (adiciona backlink real do Pinterest)
3. Ativar **Rich Pins para produtos** (mostra preço + disponibilidade directamente no Pinterest)

### Rich Pins para produtos

Os Rich Pins leem o schema `Product` que já existe (Fase B). Activar em:
https://developers.pinterest.com/tools/url-debugger/

Testar com URL de produto: `https://artnshine.pt/catalog/product/47`

Se o schema estiver correcto, o Pinterest mostra automaticamente:
- Nome do produto
- Preço
- Disponibilidade
- Link directo para compra

### Estratégia de conteúdo

**Boards recomendados:**

| Board | Descrição | Keywords |
|-------|-----------|----------|
| `Joias Prata 925` | Anéis, colares, brincos, pulseiras | prata 925, joias artesanais |
| `Pedras Naturais` | Pins sobre ónix, turquesa, ametista | pedras naturais, cristais |
| `Artesanato Português` | Processo de criação, atelier | joalharia artesanal portugal |
| `Inspiração Joia` | Moodboard estilo Art & Shine | joias elegantes, estilo natural |

**Ritmo de publicação:** 5-10 pins por semana (pode reciclar conteúdo do Instagram)

**Optimização de cada pin:**
- Título com keyword: `Anel Prata 925 com Ónix Negro — Art & Shine`
- Descrição 2-3 frases com keywords naturais
- Link para página do produto (gera tráfego directo)
- Imagem vertical 2:3 (1000x1500px) — performa melhor no Pinterest

---

## Task OF3 — 5 Links de Qualidade em Portugal

Para uma marca artesanal portuguesa, 5-10 links de sitios relevantes valem mais que centenas de links genéricos.

### Alvos prioritários

| Tipo | Site / Direcório | Como obter | Dificuldade |
|------|-----------------|-----------|-------------|
| **Direcório artesanato PT** | artesanatoportugal.com.pt | Submeter listagem gratuita | 🟢 Fácil |
| **Etsy Portugal** | etsy.com | Criar loja paralela com link para site | 🟢 Fácil |
| **Compras.pt** | compras.pt | Submeter loja | 🟢 Fácil |
| **Blog lifestyle PT** | blogs de moda/artesanato PT | Oferecer peça para review | 🟡 Médio |
| **Revista online PT** | (Notake, Timeout PT, Observador Lifestyle) | Press release ou produto para editorial | 🔴 Difícil |
| **Mercados e feiras** | Sites de feiras artesanais onde participas | Pedir link no site do evento | 🟢 Fácil |

### Template de press release simples

Para enviar a bloggers/jornalistas:

```
Objecto: Joias artesanais em prata 925 — Art & Shine (artnshine.pt)

Olá [Nome],

Art & Shine é uma marca portuguesa de joias artesanais em prata 925 
e pedras naturais, criada sob o mote "Elegância que nasce da terra".

Cada peça é feita à mão em Portugal, combinando técnicas tradicionais 
com estética contemporânea. Utilizamos ónix, turquesa, ametista 
e outras pedras naturais em prata 925 certificada.

Disponível em: artnshine.pt

Estarei disponível para enviar uma peça para avaliação.

Com os melhores cumprimentos,
[Nome]
```

---

## Task OF4 — Instagram como Fonte de SEO

O Google indexa posts públicos do Instagram. Keywords no nome do perfil, bio e legendas contribuem para o sinal `sameAs`.

### Optimização do perfil Instagram

- **Nome do perfil:** `Art & Shine | Joias Prata 925 Portugal`
- **Bio:** Incluir keywords: `joias artesanais`, `prata 925`, `pedras naturais`, `feito em Portugal`
- **Link na bio:** `https://artnshine.pt` (link directo — backlink real)
- **Hashtags nos posts:** Misturar alto volume + nicho PT:

```
Alto volume: #joia #prata #prata925 #joias #silver
Nicho PT: #joiasportugesas #artesanatoportugal #prataartesanal
Nicho produto: #aneldeprata #colarpedranatura #brincosprata
Marca: #artnshine #eleganciadaterra
```

### Conteúdo que gera tráfego para o site

- **Stories com link** para página de produto específico
- **Reels** do processo de criação (alto engagement = mais alcance)
- **Carrossei** com detalhes da peça (pedra, material, medidas)

---

## Task OF5 — Reviews e Testemunhos

Reviews de clientes são **conteúdo único gerado por utilizadores** — melhoram SEO on-page e credibilidade.

### Onde obter reviews

1. **Google Business Profile** — quando criado (Fase E), pedir aos primeiros clientes
2. **Página de produto** — sistema de reviews nativo (feature futura) → activa `aggregateRating` no schema
3. **Facebook** — reviews públicas na página

### Como pedir reviews (template WhatsApp)

Já existe integração WhatsApp no site. Após venda:

```
Olá [Nome],

Esperamos que esté a gostar da sua joia Art & Shine! ✨

Seria uma ajuda enorme se pudesse deixar uma avaliação no Google:
[Link Google Business]

Obrigado pela sua confiança,
Art & Shine
```

---

## Checklist de Implementação

### Imediato (esta semana)
- [ ] Confirmar URLs reais das redes sociais e substituir todos os `CONFIRMAR_USERNAME`
- [ ] Adicionar URL real do Instagram como `sameAs` no schema Organization

### Curto prazo (próximo mês)
- [ ] Conta Pinterest Business criada e verificada
- [ ] Rich Pins activados e testados
- [ ] 3 boards criados com conteúdo inicial (10+ pins)
- [ ] Perfil Instagram optimizado (nome, bio, keywords)
- [ ] Submeter em 2-3 direcórios PT fáceis (artesanato, compras.pt)

### Médio prazo (3 meses)
- [ ] 5 links de qualidade obtidos
- [ ] Etsy Portugal criado (com link para artnshine.pt)
- [ ] 1 menção em blog/site PT

---

**Doc anterior:** `14-seo-tecnico-avancado.md`  
**Doc seguinte:** `16-seo-monitorizacao.md`
