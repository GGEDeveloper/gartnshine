#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔄 SINCRONIZAÇÃO: Ativando versões V2"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. BACKUP dos arquivos antigos
echo "📦 1/3 - Fazendo backup dos arquivos antigos..."

# Views antigas
if [ -f "views/index.ejs" ]; then
    cp views/index.ejs ../backup/views_old/index.ejs.bak
    echo "  ✅ Backup: index.ejs"
fi

if [ -f "views/catalog/product-detail.ejs" ]; then
    cp views/catalog/product-detail.ejs ../backup/views_old/product-detail.ejs.bak
    echo "  ✅ Backup: product-detail.ejs"
fi

if [ -f "views/admin/dashboard.ejs" ]; then
    cp views/admin/dashboard.ejs ../backup/views_old/dashboard.ejs.bak
    echo "  ✅ Backup: admin/dashboard.ejs"
fi

if [ -f "views/admin/products.ejs" ]; then
    cp views/admin/products.ejs ../backup/views_old/products.ejs.bak
    echo "  ✅ Backup: admin/products.ejs"
fi

echo ""
echo "🔄 2/3 - Ativando versões V2 (renomeando)..."

# Substituir antigas pelas novas (renomear v2 → principal)
# Homepage
if [ -f "views/index-v2.ejs" ]; then
    mv views/index.ejs views/index.old 2>/dev/null
    cp views/index-v2.ejs views/index.ejs
    echo "  ✅ Homepage V2 → index.ejs (ativa)"
fi

# Product Detail
if [ -f "views/catalog/product-detail-v2.ejs" ]; then
    mv views/catalog/product-detail.ejs views/catalog/product-detail.old 2>/dev/null
    cp views/catalog/product-detail-v2.ejs views/catalog/product-detail.ejs
    echo "  ✅ Product Detail V2 → product-detail.ejs (ativa)"
fi

# Admin Dashboard
if [ -f "views/admin/dashboard-v2.ejs" ]; then
    mv views/admin/dashboard.ejs views/admin/dashboard.old 2>/dev/null
    cp views/admin/dashboard-v2.ejs views/admin/dashboard.ejs
    echo "  ✅ Admin Dashboard V2 → dashboard.ejs (ativa)"
fi

# Admin Products
if [ -f "views/admin/products-v2.ejs" ]; then
    mv views/admin/products.ejs views/admin/products.old 2>/dev/null
    cp views/admin/products-v2.ejs views/admin/products.ejs
    echo "  ✅ Admin Products V2 → products.ejs (ativa)"
fi

# Header
if [ -f "views/partials/header-v2.ejs" ]; then
    mv views/partials/header.ejs views/partials/header.old 2>/dev/null
    cp views/partials/header-v2.ejs views/partials/header.ejs
    echo "  ✅ Header V2 → header.ejs (ativa)"
fi

echo ""
echo "📝 3/3 - Arquivos .old movidos para backup..."

# Mover .old files para backup
mv views/*.old ../backup/views_old/ 2>/dev/null
mv views/catalog/*.old ../backup/views_old/ 2>/dev/null
mv views/admin/*.old ../backup/views_old/ 2>/dev/null
mv views/partials/*.old ../backup/views_old/ 2>/dev/null

echo "  ✅ Arquivos antigos em ../backup/views_old/"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ SINCRONIZAÇÃO COMPLETA!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Todas as rotas agora usam versões V2 (modernas)"
echo "Arquivos antigos salvos em: ../backup/views_old/"
