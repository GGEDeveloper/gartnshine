# 🧪 GUIA DE TESTING - FASE 1 & 2
**Gonzaga's Art & Shine - Testing Guide**

**Data:** 2025-10-07  
**Fases:** Phase 1 (Core Optimization) + Phase 2 (Search + WhatsApp)  
**Status:** ✅ Prontas para testing

---

## 🚀 PREPARAÇÃO

### **1. Iniciar Servidor**
```bash
cd /home/ggedeveloper/gartnshine/gonzagas_node
npm run dev
```

**Verificar:**
- ✅ Servidor inicia sem erros
- ✅ Console mostra "[DB] New connection established"
- ✅ Não há erros de dependências

---

## 🗄️ FASE 1 - TESTING

### **1.1 Database Optimization**

#### **A. Connection Pool**
```bash
# Verificar logs do servidor
# Deve mostrar:
# - "[DB] New connection established: X"
# - "[DB Health Check] OK" a cada 5 minutos
```

#### **B. Health Check**
```bash
npm run db:test
# Deve retornar: [DB] Connection test successful
```

#### **C. Índices**
```bash
mysql -u gonzagas_dev -pgonzagas123! gonzagas_local -e "
SELECT TABLE_NAME, INDEX_NAME 
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'gonzagas_local' 
AND INDEX_NAME LIKE 'idx_%';
"
# Deve mostrar ~12 índices criados
```

#### **D. View Otimizada**
```bash
mysql -u gonzagas_dev -pgonzagas123! gonzagas_local -e "
SELECT * FROM catalog_products_optimized LIMIT 5;
"
# Deve retornar produtos com family_name e main_image
```

---

### **1.2 Security & Rate Limiting**

#### **A. Compression**
```bash
curl -I http://localhost:3000/ | grep -i "content-encoding"
# Deve retornar: Content-Encoding: gzip
```

#### **B. Security Headers**
```bash
curl -I http://localhost:3000/ | grep -i "x-"
# Deve mostrar headers helmet (X-Content-Type-Options, etc)
```

#### **C. Rate Limiting**
```bash
# Fazer 10 requests rápidos
for i in {1..10}; do 
  curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/search?q=test"
done
# Primeiros devem ser 200, não deve bloquear imediatamente
```

#### **D. Cache Headers**
```bash
curl -I http://localhost:3000/css/main.css | grep -i "cache-control"
# Deve retornar: Cache-Control: public, max-age=604800, immutable
```

---

### **1.3 Image Lazy Loading**

#### **Browser Testing:**
1. Abrir http://localhost:3000/collections
2. Abrir DevTools (F12) → Console
3. **Verificar:**
   - ✅ Classe "webp-supported" ou "webp-not-supported" no `<html>`
   - ✅ Imagens têm classe "lazy" inicialmente
   - ✅ Ao scroll, imagens mudam para "image-loaded"
   - ✅ Efeito de fade-in visível
   - ✅ Sem erros no console

#### **Network Tab:**
1. Abrir DevTools → Network
2. Reload página
3. **Verificar:**
   - ✅ Imagens fora do viewport NÃO carregam imediatamente
   - ✅ Ao scroll, novas imagens carregam
   - ✅ Lazy loading funciona

---

### **1.4 Backup System**

#### **A. Criar Backup**
```bash
cd /home/ggedeveloper/gartnshine/gonzagas_node
npm run backup
```

**Verificar:**
- ✅ Mensagem "Starting full backup"
- ✅ "Database backup created: X bytes"
- ✅ "Full backup completed"
- ✅ Ficheiros criados em `backups/`:
  - backup_YYYY-MM-DDTHH-MM-SS_database.sql
  - backup_YYYY-MM-DDTHH-MM-SS_files.tar.gz
  - backup_YYYY-MM-DDTHH-MM-SS_manifest.json

#### **B. Listar Backups**
```bash
npm run backup:list
```

**Verificar:**
- ✅ Mostra lista de backups
- ✅ Mostra tamanhos (DB em KB, Files em MB)

#### **C. Verificar Manifest**
```bash
cat backups/*_manifest.json | head -20
```

**Verificar:**
- ✅ JSON válido
- ✅ Tem metadata (version, timestamp, sizes)

---

### **1.5 SEO**

#### **A. Sitemap**
```bash
curl http://localhost:3000/sitemap.xml
```

**Verificar:**
- ✅ XML válido
- ✅ Tem homepage, static pages
- ✅ Tem produtos dinâmicos
- ✅ Tem families
- ✅ Priorities corretas (1.0 para home, 0.8 para produtos)

#### **B. Robots.txt**
```bash
curl http://localhost:3000/robots.txt
```

**Verificar:**
- ✅ TXT válido
- ✅ Allow: / , /catalog, etc
- ✅ Disallow: /admin/, /api/
- ✅ Sitemap reference no final

#### **C. Headers**
```bash
curl -I http://localhost:3000/sitemap.xml | grep -i "cache-control"
# Deve: Cache-Control: public, max-age=3600

curl -I http://localhost:3000/robots.txt | grep -i "cache-control"
# Deve: Cache-Control: public, max-age=86400
```

---

## 🔍 FASE 2 - TESTING

### **2.1 Search API**

#### **A. Search Endpoint**
```bash
curl "http://localhost:3000/api/search?q=anel"
```

**Verificar:**
- ✅ Retorna JSON array
- ✅ Cada item tem: id, name, reference, price_formatted, url, image_url
- ✅ Resultados ordenados por relevância

#### **B. Suggestions Endpoint**
```bash
curl "http://localhost:3000/api/search/suggestions?q=an"
```

**Verificar:**
- ✅ Retorna JSON array de strings
- ✅ Máximo 5 sugestões
- ✅ Ordenadas alfabeticamente

#### **C. Empty Query**
```bash
curl "http://localhost:3000/api/search?q=x"
# Deve retornar: []
```

#### **D. Family Filter**
```bash
curl "http://localhost:3000/api/search?q=anel&family_id=1"
# Deve retornar apenas produtos da família 1
```

---

### **2.2 Search Frontend**

#### **Browser Testing:**
1. Abrir http://localhost:3000
2. Localizar search box no header
3. **Testar:**
   - ✅ Search box visível
   - ✅ Placeholder: "Pesquisar produtos..."
   - ✅ Digitar "an" (2 caracteres)
   - ✅ Dropdown aparece com resultados
   - ✅ Imagens carregam nos resultados
   - ✅ Highlight do texto pesquisado (mark tag)
   - ✅ Hover effect nos resultados
   - ✅ Click leva para produto

#### **Edge Cases:**
- ✅ Digitar 1 caractere → nada acontece
- ✅ Digitar "xyz123" → "Nenhum resultado para..."
- ✅ Click fora do dropdown → fecha
- ✅ Focus no input → reabre se tinha resultados

#### **Performance:**
- ✅ Debounce funciona (não pesquisa a cada tecla)
- ✅ Resultados aparecem < 500ms
- ✅ Cache funciona (segunda pesquisa é instant)

---

### **2.3 WhatsApp Integration**

#### **A. Product Detail Page**
```bash
# Browser: Ir para
http://localhost:3000/catalog/product/1
```

**Verificar:**
- ✅ Página carrega
- ✅ Breadcrumbs: Início > Catálogo > Nome do Produto
- ✅ Imagem principal visível
- ✅ Informações do produto:
  - Nome
  - Referência
  - Categoria
  - Preço formatado (€XX.XX)
  - Stock status
  - Descrição

#### **B. WhatsApp Button**
**Verificar:**
- ✅ Botão verde (#25D366)
- ✅ Texto: "📱 Pedir Informações via WhatsApp"
- ✅ Hover muda para #20BA5A
- ✅ Click abre WhatsApp em nova tab

#### **C. WhatsApp Message**
**Ao clicar no botão, verificar que abre:**
```
https://wa.me/351XXXXXXXXX?text=Ol%C3%A1!%20Gostaria...
```

**Mensagem deve conter:**
- ✅ "Olá! Gostaria de informações sobre:"
- ✅ Nome do produto em *bold*
- ✅ Referência
- ✅ Preço (ou "Preço sob consulta")
- ✅ Link do produto

#### **D. Copy Button**
**Testar:**
- ✅ Click em "📋 Copiar Informações"
- ✅ Alert aparece: "Informações copiadas!"
- ✅ Clipboard tem texto correto

#### **E. Mobile Testing**
**No DevTools → Toggle Device Toolbar (Ctrl+Shift+M):**
- ✅ Layout responsivo
- ✅ Botão WhatsApp maior (padding: 20px)
- ✅ Fácil de clicar em mobile

---

## 🔧 TESTING AVANÇADO

### **Performance Testing**

#### **A. Page Load Time**
```bash
curl -o /dev/null -s -w "Time: %{time_total}s\n" http://localhost:3000/
# Deve ser < 1s
```

#### **B. Compression Ratio**
```bash
# Sem compression
curl -H "Accept-Encoding: identity" http://localhost:3000/ -o /tmp/uncompressed.html
ls -lh /tmp/uncompressed.html

# Com compression
curl -H "Accept-Encoding: gzip" http://localhost:3000/ -o /tmp/compressed.html
ls -lh /tmp/compressed.html

# Comparar tamanhos (compressed deve ser ~70% menor)
```

#### **C. Database Query Performance**
```bash
mysql -u gonzagas_dev -pgonzagas123! gonzagas_local -e "
EXPLAIN SELECT * FROM catalog_products_optimized LIMIT 10;
"
# Verificar uso de índices
```

---

### **Security Testing**

#### **A. Rate Limiting**
```bash
# Fazer 150 requests em 1 minuto
for i in {1..150}; do 
  curl -s -o /dev/null -w "%{http_code} " "http://localhost:3000/api/search?q=test"
done
echo ""
# Deve começar a retornar 429 após 100 requests
```

#### **B. SQL Injection Test**
```bash
curl "http://localhost:3000/api/search?q='; DROP TABLE products; --"
# Deve retornar [] (vazio), não deve causar erro
```

#### **C. XSS Test**
```bash
curl "http://localhost:3000/api/search?q=<script>alert('xss')</script>"
# Deve retornar resultados normais, script não executado
```

---

### **SEO Testing**

#### **A. Sitemap Validation**
```bash
# Download sitemap
curl http://localhost:3000/sitemap.xml > /tmp/sitemap.xml

# Validar XML
xmllint --noout /tmp/sitemap.xml && echo "✅ Valid XML"

# Contar URLs
grep -c "<url>" /tmp/sitemap.xml
# Deve ser: 1 (home) + 5 (static) + N (produtos) + M (families)
```

#### **B. Google Search Console**
- ✅ Submeter sitemap.xml
- ✅ Verificar robots.txt reconhecido

---

## 📊 CHECKLIST DE TESTING

### **Básico (Obrigatório):**
- [ ] Servidor inicia sem erros
- [ ] Database conecta (health check OK)
- [ ] Search box visível no header
- [ ] Search retorna resultados
- [ ] Product detail page carrega
- [ ] WhatsApp button funciona
- [ ] Sitemap.xml acessível
- [ ] Robots.txt acessível

### **Intermédio:**
- [ ] Compression headers presentes
- [ ] Cache headers corretos
- [ ] Rate limiting funciona
- [ ] Image lazy loading visível
- [ ] Backup cria ficheiros
- [ ] No console errors

### **Avançado:**
- [ ] Performance < 1s page load
- [ ] Compression ratio ~70%
- [ ] Rate limiting bloqueia após limit
- [ ] SQL injection protegido
- [ ] XSS protegido
- [ ] Índices usados nas queries

---

## 🐛 TROUBLESHOOTING

### **Problema: Servidor não inicia**
```bash
# Verificar porta
lsof -i :3000

# Verificar .env
cat .env | grep DB_

# Test database
npm run db:test
```

### **Problema: Search não funciona**
```bash
# Ver console do browser (F12)
# Verificar Network tab
# Testar API diretamente:
curl "http://localhost:3000/api/search?q=test"
```

### **Problema: Imagens não lazy load**
```bash
# Verificar console do browser
# Deve mostrar: window.ImageOptimizer
console.log(window.ImageOptimizer)

# Verificar HTML
# <img> deve ter data-src ou data-lazy
```

### **Problema: Backup falha**
```bash
# Verificar mysqldump disponível
which mysqldump

# Verificar permissões
ls -la backups/

# Testar manualmente
cd gonzagas_node
node scripts/backup-system.js backup
```

---

## ✅ CRITÉRIOS DE SUCESSO

### **Performance:**
- ✅ Page load < 1s
- ✅ Search results < 500ms
- ✅ Compression activo
- ✅ Static caching funciona

### **Functionality:**
- ✅ Search retorna resultados corretos
- ✅ WhatsApp abre com mensagem
- ✅ Lazy loading visível
- ✅ Backup cria ficheiros
- ✅ Sitemap lista produtos

### **Security:**
- ✅ Rate limiting bloqueia
- ✅ CSP headers presentes
- ✅ SQL injection não funciona
- ✅ XSS não funciona

### **Reliability:**
- ✅ Health check logs a cada 5min
- ✅ Graceful shutdown sem erros
- ✅ Retry mechanisms funcionam
- ✅ Fallbacks activam quando necessário

---

## 📝 REPORT TEMPLATE

Após testing, preencher:

```markdown
# Testing Report - Phase 1 & 2

**Data:** 2025-10-07
**Tester:** [Nome]
**Ambiente:** Development

## Fase 1:
- [ ] Database Optimization: PASS/FAIL
- [ ] Security & Rate Limiting: PASS/FAIL
- [ ] Image Lazy Loading: PASS/FAIL
- [ ] Backup System: PASS/FAIL
- [ ] SEO: PASS/FAIL

## Fase 2:
- [ ] Search API: PASS/FAIL
- [ ] Search Frontend: PASS/FAIL
- [ ] WhatsApp Integration: PASS/FAIL

## Issues Encontrados:
1. [Descrever issue]
2. [Descrever issue]

## Recomendações:
- [Recomendação 1]
- [Recomendação 2]

## Status Final:
- [ ] APPROVED - Ready for production
- [ ] NEEDS FIXES - Lista acima
- [ ] BLOCKED - Razão
```

---

## 🎯 NEXT STEPS

**Se PASS:**
- ✅ Merge para main
- ✅ Deploy para staging
- ✅ Começar Fase 3 (Mobile Camera)

**Se FAIL:**
- ❌ Fix issues encontrados
- ❌ Re-test
- ❌ Update documentação

---

**Criado:** 2025-10-07  
**Status:** ✅ Ready for Testing  
**Fases:** Phase 1 (100%) + Phase 2 (100%)  

🧪 **HAPPY TESTING!**

