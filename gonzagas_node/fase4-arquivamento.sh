#!/bin/bash

# ============================================
# FASE 4 - ARQUIVAMENTO COMPLETO
# ============================================
# Data: 2026-02-18
# Filosofia: Preservar tudo, organizar melhor
# Total: 29 ficheiros a mover
# ============================================

set -e  # Exit on error

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  🗂️  FASE 4 - ARQUIVAMENTO COMPLETO  ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "📋 Movendo 29 ficheiros para arquivo..."
echo "🔒 Filosofia: Zero eliminações, tudo preservado"
echo ""

# Verificar se estamos na pasta correta
if [ ! -d "_archive" ]; then
    echo "❌ ERRO: Pasta _archive não encontrada!"
    echo "Execute este script a partir de: ~/gartnshine-3/gonzagas_node/"
    exit 1
fi

echo "✅ Pasta _archive encontrada"
echo ""

# Contador de ficheiros movidos
moved_count=0
skip_count=0

# ============================================
# GRUPO 1: TESTES (13 ficheiros)
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 [1/5] Movendo ficheiros de teste..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Admin testing
for file in test-admin-layout.js test-admin-margin-fix.js test-admin-mobile-solution.js; do
    if [ -f "$file" ]; then
        git mv "$file" _archive/tests-archived/admin-testing/
        echo "  ✓ $file → admin-testing/"
        ((moved_count++))
    else
        echo "  ⊘ $file (já movido ou não existe)"
        ((skip_count++))
    fi
done

# Catalog testing
for file in test-catalog-enhanced.js test-catalog-full-validation.js test-catalog-images-e2e.js; do
    if [ -f "$file" ]; then
        git mv "$file" _archive/tests-archived/catalog-testing/
        echo "  ✓ $file → catalog-testing/"
        ((moved_count++))
    else
        echo "  ⊘ $file (já movido ou não existe)"
        ((skip_count++))
    fi
done

# Navigation testing
for file in test-definitive-fix.js test-final-navigation-fix.js test-navigation-fix.js test-mobile-and-catalog.js; do
    if [ -f "$file" ]; then
        git mv "$file" _archive/tests-archived/navigation-testing/
        echo "  ✓ $file → navigation-testing/"
        ((moved_count++))
    else
        echo "  ⊘ $file (já movido ou não existe)"
        ((skip_count++))
    fi
done

# Misc testing
for file in test-frontend-styles.js test-local.js test_port.js; do
    if [ -f "$file" ]; then
        git mv "$file" _archive/tests-archived/misc-testing/
        echo "  ✓ $file → misc-testing/"
        ((moved_count++))
    else
        echo "  ⊘ $file (já movido ou não existe)"
        ((skip_count++))
    fi
done

echo ""

# ============================================
# GRUPO 2: SQL DUMPS (7 ficheiros)
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 [2/5] Movendo SQL dumps..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backup antigo
if [ -f "gonzagas_db_backup_20250601_160053.sql" ]; then
    git mv gonzagas_db_backup_20250601_160053.sql _archive/sql-dumps-archived/2025-06-01-backup/
    echo "  ✓ gonzagas_db_backup_20250601_160053.sql → 2025-06-01-backup/"
    ((moved_count++))
else
    echo "  ⊘ gonzagas_db_backup_20250601_160053.sql (já movido ou não existe)"
    ((skip_count++))
fi

# Production dumps
for file in gonzagas_essential_production_dump.sql gonzagas_local_complete_dump.sql gonzagas_local_complete_optimized.sql gonzagas_production_dump.sql gonzagas_production_dump_fixed.sql gonzagas_production_ready_dump.sql; do
    if [ -f "$file" ]; then
        git mv "$file" _archive/sql-dumps-archived/production-dumps/
        echo "  ✓ $file → production-dumps/"
        ((moved_count++))
    else
        echo "  ⊘ $file (já movido ou não existe)"
        ((skip_count++))
    fi
done

echo ""

# ============================================
# GRUPO 3: JAVASCRIPT DEPRECATED (3 ficheiros)
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📜 [3/5] Movendo JavaScript deprecated..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd public/js

if [ -f "admin.old.js" ]; then
    git mv admin.old.js ../../_archive/js-deprecated/admin-versions/
    echo "  ✓ admin.old.js → admin-versions/"
    ((moved_count++))
else
    echo "  ⊘ admin.old.js (já movido ou não existe)"
    ((skip_count++))
fi

if [ -f "debug-navigation.js" ]; then
    git mv debug-navigation.js ../../_archive/js-deprecated/debug-tools/
    echo "  ✓ debug-navigation.js → debug-tools/"
    ((moved_count++))
else
    echo "  ⊘ debug-navigation.js (já movido ou não existe)"
    ((skip_count++))
fi

if [ -f "admin-mobile-fix.js" ]; then
    git mv admin-mobile-fix.js ../../_archive/js-deprecated/mobile-fixes-old/
    echo "  ✓ admin-mobile-fix.js → mobile-fixes-old/"
    ((moved_count++))
else
    echo "  ⊘ admin-mobile-fix.js (já movido ou não existe)"
    ((skip_count++))
fi

cd ../..

echo ""

# ============================================
# GRUPO 4: SCRIPTS ONE-OFF (2 ficheiros)
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  [4/5] Movendo scripts one-off..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for file in create_essential_production_dump.js create_production_ready_dump.js; do
    if [ -f "$file" ]; then
        git mv "$file" _archive/scripts-archived/database-generation/
        echo "  ✓ $file → database-generation/"
        ((moved_count++))
    else
        echo "  ⊘ $file (já movido ou não existe)"
        ((skip_count++))
    fi
done

echo ""

# ============================================
# GRUPO 5: REORGANIZAR DOCS (4 ficheiros)
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 [5/5] Reorganizando documentação..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Mover para docs/
if [ -f "README_hide_catalog_prices.md" ]; then
    git mv README_hide_catalog_prices.md docs/features/hide-catalog-prices.md
    echo "  ✓ README_hide_catalog_prices.md → docs/features/hide-catalog-prices.md"
    ((moved_count++))
else
    echo "  ⊘ README_hide_catalog_prices.md (já movido ou não existe)"
    ((skip_count++))
fi

if [ -f "validate-catalog-manual.md" ]; then
    git mv validate-catalog-manual.md docs/procedures/catalog-validation.md
    echo "  ✓ validate-catalog-manual.md → docs/procedures/catalog-validation.md"
    ((moved_count++))
else
    echo "  ⊘ validate-catalog-manual.md (já movido ou não existe)"
    ((skip_count++))
fi

if [ -f "deploy-files.md" ]; then
    git mv deploy-files.md docs/deployment/files-checklist.md
    echo "  ✓ deploy-files.md → docs/deployment/files-checklist.md"
    ((moved_count++))
else
    echo "  ⊘ deploy-files.md (já movido ou não existe)"
    ((skip_count++))
fi

# Arquivar HTML de teste
if [ -f "TESTE_NOTIFICACOES.html" ]; then
    git mv TESTE_NOTIFICACOES.html _archive/docs-archived/testing/
    echo "  ✓ TESTE_NOTIFICACOES.html → docs-archived/testing/"
    ((moved_count++))
else
    echo "  ⊘ TESTE_NOTIFICACOES.html (já movido ou não existe)"
    ((skip_count++))
fi

echo ""

# ============================================
# RESUMO FINAL
# ============================================
echo "╔════════════════════════════════════════╗"
echo "║     ✅ ARQUIVAMENTO CONCLUÍDO         ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "📊 ESTATÍSTICAS:"
echo "  ✓ Ficheiros movidos: $moved_count"
echo "  ⊘ Ficheiros já movidos/não existem: $skip_count"
echo "  📁 Total esperado: 29"
echo ""
echo "🗂️  ESTRUTURA CRIADA:"
echo "  • _archive/tests-archived/ (13 ficheiros)"
echo "  • _archive/sql-dumps-archived/ (7 ficheiros)"
echo "  • _archive/js-deprecated/ (3 ficheiros)"
echo "  • _archive/scripts-archived/ (2 ficheiros)"
echo "  • _archive/docs-archived/ (1 ficheiro)"
echo "  • docs/ reorganizados (3 ficheiros)"
echo ""
echo "🔒 Zero eliminações - tudo preservado!"
echo "📜 Git history mantido com 'git mv'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 PRÓXIMOS PASSOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Verificar status:"
echo "    git status"
echo ""
echo "2️⃣  Commit das alterações:"
echo "    git commit -m '🗂️ Fase 4 - Ficheiros movidos para arquivo (29 ficheiros)'"
echo ""
echo "3️⃣  Push para o repo:"
echo "    git push origin feature/planning-fase1-fase2"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Status final
if [ $moved_count -gt 0 ]; then
    echo "✨ Sucesso! $moved_count ficheiros prontos para commit."
    exit 0
else
    echo "ℹ️  Nenhum ficheiro movido. Todos já estavam arquivados."
    exit 0
fi
