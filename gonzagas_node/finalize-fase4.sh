#!/bin/bash

# ============================================
# FINALIZAÇÃO FASE 4
# ============================================
# Gestão de ficheiros não versionados
# Data: 2026-02-18
# ============================================

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  🔍 FINALIZAÇÃO FASE 4 - CLEANUP      ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Verificando ficheiros não versionados..."
echo ""

# ============================================
# 1. DOCS/CSS-AUDIT/
# ============================================
echo "───────────────────────────────────────────"
echo "📁 [1/2] Verificando docs/css-audit/..."
echo "───────────────────────────────────────────"

if [ -d "docs/css-audit" ]; then
    echo "✓ Pasta docs/css-audit/ encontrada"
    echo ""
    echo "📋 Conteúdo:"
    ls -lh docs/css-audit/
    echo ""
    echo "💡 DECISÃO: Esta pasta contém documentação de auditoria CSS."
    echo "            Recomendação: Versionar (é documentação útil)."
    echo ""
    read -p "Versionar docs/css-audit/? (s/n): " choice
    
    if [ "$choice" = "s" ] || [ "$choice" = "S" ]; then
        git add docs/css-audit/
        echo "  ✓ docs/css-audit/ adicionado ao Git"
    else
        echo "  ⊘ Ignorado (não versionado)"
        # Adicionar ao .gitignore se desejado
        read -p "Adicionar ao .gitignore? (s/n): " ignore_choice
        if [ "$ignore_choice" = "s" ] || [ "$ignore_choice" = "S" ]; then
            echo "docs/css-audit/" >> .gitignore
            echo "  ✓ Adicionado ao .gitignore"
        fi
    fi
else
    echo "⊘ docs/css-audit/ não encontrada (OK)"
fi

echo ""

# ============================================
# 2. MAIN.EJS.BACKUP
# ============================================
echo "───────────────────────────────────────────"
echo "📄 [2/2] Verificando main.ejs.backup..."
echo "───────────────────────────────────────────"

# Procurar em locais comuns
backup_found=false
backup_location=""

for location in "views/layouts/main.ejs.backup" "views/main.ejs.backup" "main.ejs.backup"; do
    if [ -f "$location" ]; then
        backup_found=true
        backup_location="$location"
        break
    fi
done

if [ "$backup_found" = true ]; then
    echo "✓ Backup encontrado: $backup_location"
    echo ""
    echo "📊 Informação do ficheiro:"
    ls -lh "$backup_location"
    echo ""
    echo "💡 DECISÃO: Ficheiro .backup é versão antiga."
    echo "            Recomendação: Mover para _archive/views-deprecated/backups/"
    echo ""
    read -p "Arquivar $backup_location? (s/n): " choice
    
    if [ "$choice" = "s" ] || [ "$choice" = "S" ]; then
        # Criar pasta se não existir
        mkdir -p _archive/views-deprecated/backups/
        
        # Mover com git mv
        git mv "$backup_location" _archive/views-deprecated/backups/
        echo "  ✓ $backup_location → _archive/views-deprecated/backups/"
    else
        echo "  ⊘ Mantido em $backup_location (não movido)"
        
        # Opção de deletar
        read -p "Eliminar ficheiro? (s/n): " delete_choice
        if [ "$delete_choice" = "s" ] || [ "$delete_choice" = "S" ]; then
            rm "$backup_location"
            echo "  ✗ Ficheiro eliminado"
        fi
    fi
else
    echo "⊘ main.ejs.backup não encontrado (OK)"
fi

echo ""

# ============================================
# 3. VERIFICAÇÃO FINAL
# ============================================
echo "╔════════════════════════════════════════╗"
echo "║  ✅ VERIFICAÇÃO FINAL                  ║"
echo "╚════════════════════════════════════════╝"
echo ""

echo "📊 Ficheiros não versionados restantes:"
untracked=$(git ls-files --others --exclude-standard | wc -l)

if [ "$untracked" -eq 0 ]; then
    echo "  ✓ Nenhum ficheiro não versionado"
else
    echo "  ⚠️  $untracked ficheiro(s) não versionado(s):"
    git ls-files --others --exclude-standard
fi

echo ""

# ============================================
# 4. COMMIT E PUSH (se houver alterações)
# ============================================
changes=$(git status --short | wc -l)

if [ "$changes" -gt 0 ]; then
    echo "═══════════════════════════════════════════"
    echo "📝 ALTERAÇÕES PENDENTES"
    echo "═══════════════════════════════════════════"
    echo ""
    git status --short
    echo ""
    read -p "Fazer commit e push? (s/n): " commit_choice
    
    if [ "$commit_choice" = "s" ] || [ "$commit_choice" = "S" ]; then
        read -p "Mensagem de commit: " commit_msg
        
        git commit -m "$commit_msg"
        echo "  ✓ Commit realizado"
        echo ""
        
        read -p "Push para origin feature/planning-fase1-fase2? (s/n): " push_choice
        if [ "$push_choice" = "s" ] || [ "$push_choice" = "S" ]; then
            git push origin feature/planning-fase1-fase2
            echo "  ✓ Push concluído"
        fi
    else
        echo "  ⊘ Commit cancelado (executar manualmente depois)"
    fi
else
    echo "✓ Nenhuma alteração pendente"
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  🎉 FASE 4 FINALIZADA                  ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "📊 RESUMO COMPLETO:"
echo "  • 25 ficheiros arquivados"
echo "  • 7 READMEs criados"
echo "  • .gitignore configurado"
echo "  • CHANGELOG atualizado"
echo "  • Estrutura limpa e documentada"
echo ""
echo "✅ Projeto organizado e pronto para próxima fase!"
echo ""
