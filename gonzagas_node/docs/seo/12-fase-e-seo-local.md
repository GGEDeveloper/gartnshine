# FASE E — SEO Local

**Objetivo:** Presença local no Google Maps e pesquisas geo-localizadas  
**Branch:** `dev/seo-local` _(a criar, se aplicável)_  
**Prioridade:** 🟢 Média — depende de existir presença física

---

## Contexto

SEO Local é relevante se a Art & Shine tiver:
- Atelier ou loja física
- Participação em feiras e mercados regulares
- Zona geográfica de actuação definida (ex: Lisboa, Cadaval, Oeste)

Mesmo sem loja física, um Google Business Profile posiciona a marca nas pesquisas locais e dá credibilidade.

---

## Task E1 — Google Business Profile

### Criar perfil

1. Aceder a https://business.google.com
2. **Adicionar negócio** → Nome: `Art & Shine`
3. Categoria: `Joalharia` / `Loja de joias artesanais`
4. Definir área de serviço (se sem loja física → "Presto serviços na área de...")
5. Adicionar:
   - Telefone de contacto
   - Website: `https://artnshine.pt`
   - Horário (se aplicável)
   - Descrição (160 chars, com keywords)
6. **Verificar** o negócio (por carta, telefone ou email)

### Otimização do perfil

- **Fotos:** Mínimo 10 fotos de alta qualidade (produtos, atelier, processo de criação)
- **Posts regulares:** Publicar novidades/promoções (aparecem no painel de Knowledge Graph)
- **Reviews:** Pedir aos clientes que deixem avaliações — impacto direto no ranking local
- **Q&A:** Responder a perguntas frequentes

### Descrição recomendada

```
Art & Shine cria joias artesanais em prata 925 e pedras naturais.
Elegância que nasce da terra — cada peça é única, trabalhada à mão
em Portugal. Anéis, colares, brincos e pulseiras.
```

---

## Task E2 — LocalBusiness Schema

Adicionar ao `@graph` da homepage (`views/pages/index.ejs`):

```json
{
  "@type": "LocalBusiness",
  "@id": "https://artnshine.pt/#localbusiness",
  "name": "Art & Shine",
  "description": "Joias artesanais em prata 925 e pedras naturais — Portugal",
  "url": "https://artnshine.pt",
  "telephone": "+351XXXXXXXXX",
  "email": "CONFIRMAR@artnshine.pt",
  "image": "https://artnshine.pt/images/og-artnshine.jpg",
  "logo": "https://artnshine.pt/images/logo-artnshine.png",
  "priceRange": "€€",
  "currenciesAccepted": "EUR",
  "paymentAccepted": "Cash, Credit Card, Bank Transfer",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "CONFIRMAR",
    "addressLocality": "CONFIRMAR",
    "postalCode": "CONFIRMAR",
    "addressCountry": "PT"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "CONFIRMAR",
    "longitude": "CONFIRMAR"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "10:00",
      "closes": "18:00"
    }
  ],
  "sameAs": [
    "https://www.instagram.com/CONFIRMAR/",
    "https://www.facebook.com/CONFIRMAR/",
    "https://business.google.com/CONFIRMAR"
  ]
}
```

> ⚠️ Preencher todos os campos `"CONFIRMAR"` com dados reais antes de implementar.

---

## Task E3 — NAP Consistente

**NAP = Name, Address, Phone** (Nome, Morada, Telefone)

O Google usa a consistência do NAP como sinal de confiança para SEO local. O mesmo Nome, Morada e Telefone deve aparecer **exactamente igual** em:

| Local | Estado |
|-------|--------|
| Footer do site | 🔲 Verificar |
| Página `/about` | 🔲 Verificar |
| Google Business Profile | 🔲 A criar |
| Instagram (bio) | 🔲 Verificar |
| Facebook (about) | 🔲 Verificar |
| Merchant Center | 🔲 A criar |

### Footer

Garantir que o footer tem:
```html
<address>
  <strong>Art &amp; Shine</strong><br>
  <!-- Morada se aplicável -->
  <a href="tel:+351XXXXXXXXX">+351 XXX XXX XXX</a><br>
  <a href="mailto:CONFIRMAR@artnshine.pt">CONFIRMAR@artnshine.pt</a>
</address>
```

---

## Checklist de Implementação

- [ ] Dados reais confirmados (telefone, email, morada se aplicável)
- [ ] Google Business Profile criado
- [ ] Negócio verificado (carta/email do Google)
- [ ] Mínimo 10 fotos adicionadas ao perfil
- [ ] Descrição preenchida
- [ ] `LocalBusiness` schema implementado na homepage
- [ ] Campos `CONFIRMAR` todos preenchidos
- [ ] Schema validado em https://validator.schema.org/
- [ ] NAP consistente em footer, /about, redes sociais
- [ ] Pedir reviews aos primeiros clientes

---

**Doc anterior:** `11-fase-d-merchant-center.md`  
**Doc seguinte:** `13-fase-f-conteudo-blog.md`
