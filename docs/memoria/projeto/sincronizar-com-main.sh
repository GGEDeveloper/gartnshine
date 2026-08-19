#!/usr/bin/env bash
# Traz para o ramo `memoria` o que se desenvolveu na `main`.
#
# O fluxo é de sentido único e é deliberado:
#
#     main  ──────>  memoria          sim, sempre que a main andar
#     memoria  ──X──>  main           nunca
#
# O `memoria` é um ramo permanente, não uma feature branch à espera de ser
# integrada. Vive para sempre ao lado da main, actualizado a partir dela.
#
#   sincronizar-com-main.sh            mostra o que falta e integra
#   sincronizar-com-main.sh --ver      só mostra, não mexe em nada
#
# Usa `merge` e não `rebase`: o ramo está publicado, e reescrever-lhe o
# histórico obrigaria a um push forçado que estraga qualquer cópia já clonada.

set -uo pipefail

RAMO_MEMORIA="memoria"
RAMO_FONTE="origin/main"

vermelho() { printf '\033[31m%s\033[0m\n' "$*"; }
verde()    { printf '\033[32m%s\033[0m\n' "$*"; }

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || {
  vermelho "não estou dentro de um repositório git"; exit 1; }

actual="$(git rev-parse --abbrev-ref HEAD)"
if [ "$actual" != "$RAMO_MEMORIA" ]; then
  vermelho "estás em '$actual' e não em '$RAMO_MEMORIA'."
  echo "     Este script só corre no ramo da memória:  git checkout $RAMO_MEMORIA"
  exit 1
fi

echo "A buscar do remoto…"
git fetch origin --quiet || { vermelho "falhou o fetch"; exit 1; }

atras="$(git rev-list --count "HEAD..$RAMO_FONTE")"
frente="$(git rev-list --count "$RAMO_FONTE..HEAD")"

echo
echo "  $RAMO_FONTE tem $atras commits que o $RAMO_MEMORIA não tem"
echo "  $RAMO_MEMORIA tem $frente commits que a main não tem — e assim fica"
echo

if [ "$atras" -eq 0 ]; then
  verde "Nada a trazer: o ramo já tem tudo o que está na main."
  exit 0
fi

echo "Por integrar:"
git log --oneline --no-decorate "HEAD..$RAMO_FONTE" | sed 's/^/  /'
echo

if [ "${1:-}" = "--ver" ]; then
  echo "(--ver: não foi feita nenhuma alteração)"
  exit 0
fi

# Uma árvore suja mistura trabalho por guardar com o que vem da main, e
# depois não se sabe de quem é cada linha do conflito.
if [ -n "$(git status --porcelain)" ]; then
  vermelho "há trabalho por commitar. Guarda-o antes de integrar:"
  git status --short | head -10
  exit 1
fi

echo "A integrar $RAMO_FONTE em $RAMO_MEMORIA…"
if git merge --no-edit "$RAMO_FONTE"; then
  verde "Integrado. O ramo da memória está em dia com a main."
  echo
  echo "Convém reindexar, que a main pode ter trazido documentos e commits novos:"
  echo "  docs/memoria/.venv/bin/python docs/memoria/bin/mem.py indexar"
  echo "  git push"
else
  echo
  vermelho "Conflitos. Resolve-os à mão e termina com:"
  echo "     git add <ficheiros>  &&  git commit"
  echo
  echo "  Regra ao resolver: o que vem da main ganha no código da aplicação;"
  echo "  o que está no ramo ganha em docs/memoria/, que a main não conhece."
  exit 1
fi
