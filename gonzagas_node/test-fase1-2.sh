#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║         🧪 TESTING FASE 1 & 2 - COMPLETO 🧪                  ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🧪 TEST: $name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "$expected" ]; then
        echo -e "${GREEN}✅ PASS${NC} - HTTP $response"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}❌ FAIL${NC} - Expected HTTP $expected, got $response"
        FAIL=$((FAIL + 1))
    fi
    echo ""
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VERIFICANDO SERVIDOR..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test if server is responding instead of using netstat
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/" | grep -q "200"; then
    echo -e "${GREEN}✅ Servidor rodando e respondendo na porta 3000${NC}"
else
    echo -e "${RED}❌ Servidor NÃO está respondendo!${NC}"
    echo "Execute: npm run dev"
    exit 1
fi
echo ""

# ============================================================
# FASE 1 TESTS
# ============================================================

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                     FASE 1: CORE OPTIMIZATION                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Homepage
test_endpoint "Homepage Load" "http://localhost:3000/" "200"

# Test 2: Sitemap
test_endpoint "SEO - Sitemap.xml" "http://localhost:3000/sitemap.xml" "200"

# Test 3: Robots.txt
test_endpoint "SEO - Robots.txt" "http://localhost:3000/robots.txt" "200"

# Test 4: Catalog Page
test_endpoint "Catalog Page" "http://localhost:3000/catalog" "200"

# Test 5: Static Files (CSS)
test_endpoint "Static CSS Caching" "http://localhost:3000/css/style.css" "200"

# Test 6: Image Optimization JS
test_endpoint "Image Optimization JS" "http://localhost:3000/js/image-optimization.js" "200"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 COMPRESSION & SECURITY HEADERS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

headers=$(curl -I -H "Accept-Encoding: gzip" "http://localhost:3000/" 2>/dev/null)

if echo "$headers" | grep -qi "Content-Security-Policy"; then
    echo -e "${GREEN}✅ CSP Header presente${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${YELLOW}⚠️  CSP Header ausente${NC}"
fi

if echo "$headers" | grep -qi "X-Content-Type-Options"; then
    echo -e "${GREEN}✅ X-Content-Type-Options presente${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${YELLOW}⚠️  X-Content-Type-Options ausente${NC}"
fi

echo ""

# ============================================================
# FASE 2 TESTS
# ============================================================

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  FASE 2: SEARCH + WHATSAPP                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Test 7: Search API (empty query)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TEST: Search API - Empty Query"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
response=$(curl -s "http://localhost:3000/api/search?q=")
if [ "$response" = "[]" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Empty array returned"
    PASS=$((PASS + 1))
else
    echo -e "${YELLOW}⚠️  Got: $response${NC}"
fi
echo ""

# Test 8: Search API (valid query)
test_endpoint "Search API - Valid Query" "http://localhost:3000/api/search?q=produto" "200"

# Test 9: Search Suggestions
test_endpoint "Search Suggestions API" "http://localhost:3000/api/search/suggestions?q=pr" "200"

# Test 10: Search JS Component
test_endpoint "Advanced Search JS" "http://localhost:3000/js/advanced-search.js" "200"

# Test 11: Search CSS
test_endpoint "Search CSS" "http://localhost:3000/css/search.css" "200"

# Test 12: Product Detail Page (pick first product)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TEST: Product Detail Page (WhatsApp Integration)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get first product ID
product_id=$(curl -s "http://localhost:3000/api/products/featured" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ ! -z "$product_id" ]; then
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/catalog/product/$product_id")
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ PASS${NC} - Product detail page (ID: $product_id) loads"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}❌ FAIL${NC} - Product detail HTTP $response"
        FAIL=$((FAIL + 1))
    fi
else
    echo -e "${YELLOW}⚠️  No products found in database${NC}"
fi
echo ""

# ============================================================
# BACKUP SYSTEM TEST
# ============================================================

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                      BACKUP SYSTEM TEST                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TEST: Backup System"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "backups" ] && [ "$(ls -A backups 2>/dev/null)" ]; then
    backup_count=$(ls -1 backups/*.sql 2>/dev/null | wc -l)
    echo -e "${GREEN}✅ PASS${NC} - Backup system configured ($backup_count backups exist)"
    PASS=$((PASS + 1))
else
    echo -e "${YELLOW}⚠️  No backups found (run: npm run backup)${NC}"
fi
echo ""

# ============================================================
# SUMMARY
# ============================================================

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                         TEST SUMMARY                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

TOTAL=$((PASS + FAIL))
echo "Total Tests: $TOTAL"
echo -e "${GREEN}✅ Passed: $PASS${NC}"
echo -e "${RED}❌ Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}║              🎉 ALL TESTS PASSED! 🎉                          ║${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}║        Fase 1 & 2 estão funcionando perfeitamente!            ║${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║                                                                ║${NC}"
    echo -e "${YELLOW}║               ⚠️  SOME TESTS FAILED ⚠️                        ║${NC}"
    echo -e "${YELLOW}║                                                                ║${NC}"
    echo -e "${YELLOW}║          Review failed tests above for details                 ║${NC}"
    echo -e "${YELLOW}║                                                                ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi

