#!/bin/bash

# =========================================================
# SCRIPT DE ARQUIVAMENTO CSS - GONZAGA ART & SHINE
# =========================================================
# 
# Este script move ficheiros CSS redundantes para o arquivo
# de forma segura, preservando histórico no Git
#
# Data: 2026-02-17
# Branch: feature/planning-fase1-fase2
# =========================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "=========================================================="
    echo "  $1"
    echo "=========================================================="
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "tokens-dark-nature.css" ]; then
    print_error "Este script deve ser executado na pasta gonzagas_node/public/css/"
    print_info "Navegue até a pasta correta e tente novamente:"
    echo "    cd gonzagas_node/public/css"
    echo "    bash _archive_css_cleanup.sh"
    exit 1
fi

print_header "GONZAGA ART & SHINE - ARQUIVAMENTO CSS"

print_info "Branch atual: $(git branch --show-current)"
print_info "Verificando pré-requisitos..."

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git não está instalado"
    exit 1
fi

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "feature/planning-fase1-fase2" ]; then
    print_warning "Você está no branch: $CURRENT_BRANCH"
    print_warning "Recomendado: feature/planning-fase1-fase2"
    read -p "Deseja continuar mesmo assim? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        print_info "Operação cancelada"
        exit 0
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "Há alterações não commitadas"
    print_info "Recomenda-se commit ou stash antes de continuar"
    read -p "Deseja continuar mesmo assim? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        print_info "Operação cancelada"
        exit 0
    fi
fi

print_header "FICHEIROS A ARQUIVAR"

# Array of files to archive
FILES_TO_ARCHIVE=(
    "main.css"
    "dashboard.css"
    "components.css"
    "catalog.css"
    "catalog-v2.css"
    "homepage-v2.css"
)

# Check which files exist
MISSING_FILES=()
for file in "${FILES_TO_ARCHIVE[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(du -h "$file" | cut -f1)
        print_success "$file ($SIZE)"
    else
        print_warning "$file - NÃO ENCONTRADO (já arquivado?)"
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq ${#FILES_TO_ARCHIVE[@]} ]; then
    print_info "Todos os ficheiros já foram arquivados!"
    print_info "Verifique a pasta _archive/2026-02-17-cleanup/"
    exit 0
fi

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    print_warning "${#MISSING_FILES[@]} ficheiro(s) não encontrado(s)"
fi

echo ""
read -p "Deseja prosseguir com o arquivamento? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    print_info "Operação cancelada pelo utilizador"
    exit 0
fi

print_header "CRIANDO ESTRUTURA DE ARQUIVO"

# Create archive directory if it doesn't exist
ARCHIVE_DIR="_archive/2026-02-17-cleanup"
if [ ! -d "$ARCHIVE_DIR" ]; then
    mkdir -p "$ARCHIVE_DIR"
    print_success "Pasta criada: $ARCHIVE_DIR"
else
    print_info "Pasta já existe: $ARCHIVE_DIR"
fi

print_header "MOVENDO FICHEIROS"

# Move files using git mv (preserves history)
MOVED_COUNT=0
for file in "${FILES_TO_ARCHIVE[@]}"; do
    if [ -f "$file" ]; then
        print_info "Movendo: $file"
        if git mv "$file" "$ARCHIVE_DIR/$file" 2>/dev/null; then
            print_success "Movido: $file → $ARCHIVE_DIR/"
            ((MOVED_COUNT++))
        else
            print_warning "Tentando mover sem git mv..."
            mv "$file" "$ARCHIVE_DIR/$file"
            git add "$ARCHIVE_DIR/$file"
            print_success "Movido: $file → $ARCHIVE_DIR/"
            ((MOVED_COUNT++))
        fi
    fi
done

print_header "RESUMO"

print_success "$MOVED_COUNT ficheiro(s) movido(s) para o arquivo"
print_info "Localização: $ARCHIVE_DIR/"

echo ""
print_info "Ficheiros no arquivo:"
ls -lh "$ARCHIVE_DIR/" | grep -E '\.css$' | awk '{print "  - " $9 " (" $5 ")"}'

print_header "PRÓXIMOS PASSOS"

echo "1. 🔍 Verificar o estado do Git:"
echo "   git status"
echo ""
echo "2. ✅ Fazer commit das alterações:"
echo "   git commit -m 'chore: arquivar CSS redundante (6 ficheiros)'"
echo ""
echo "3. 🚀 Push para o remote:"
echo "   git push origin feature/planning-fase1-fase2"
echo ""
echo "4. 📦 TESTAR o site localmente:"
echo "   npm start"
echo "   - Verificar homepage"
echo "   - Verificar catálogo"
echo "   - Verificar admin/login"
echo "   - Verificar admin/dashboard"
echo ""

print_warning "IMPORTANTE: Testar tudo ANTES de fazer merge para main!"

print_header "ROLLBACK (se necessário)"

echo "Se precisar reverter:"
echo ""
echo "git reset --soft HEAD~1"
echo "git restore --staged ."
echo ""
for file in "${FILES_TO_ARCHIVE[@]}"; do
    echo "git mv $ARCHIVE_DIR/$file $file"
done

echo ""
print_success "Script concluído com sucesso! 🎉"
print_info "Documentação: _ARCHIVE_PLAN.md"
