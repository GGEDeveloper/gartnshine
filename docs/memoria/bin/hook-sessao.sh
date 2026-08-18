#!/usr/bin/env bash
# Hooks da biblioteca de memória.
#
#   hook-sessao.sh inicio   SessionStart — injecta o estado da memória no contexto
#   hook-sessao.sh fim      SessionEnd   — deixa por escrito o que falta capturar
#
# Ambos falham em silêncio: um hook que rebenta é pior do que um hook que não
# corre. Lê stdin (JSON do hook) mas não depende dele.

set -uo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
V="$RAIZ/docs/memoria/.venv/bin/python"
ESTADO="$RAIZ/docs/memoria/estado"
PENDENTES="$ESTADO/por-capturar.md"

# Guarda o JSON do hook — o modo `reindexar` precisa dele para saber que
# ficheiro foi tocado. Os outros modos ignoram-no, mas o stdin tem de ser
# consumido de qualquer forma.
STDIN="$(timeout 5 cat 2>/dev/null || true)"

[ -x "$V" ] || { echo '{}'; exit 0; }
mkdir -p "$ESTADO" 2>/dev/null || true

json_escape() { "$V" -c 'import json,sys; print(json.dumps(sys.stdin.read()))'; }

case "${1:-inicio}" in
  reindexar)
    # Só reindexa se o ficheiro tocado for uma nota — o hook dispara em
    # cada Write/Edit do projeto inteiro. Corre em async, sem bloquear.
    caminho="$(printf '%s' "$STDIN" | "$V" -c \
      'import json,sys
try:
    d = json.load(sys.stdin)
    ti = d.get("tool_input") or {}
    tr = d.get("tool_response") or {}
    print(tr.get("filePath") or ti.get("file_path") or "")
except Exception:
    print("")' 2>/dev/null)"
    case "$caminho" in
      *docs/memoria/notas/*.md)
        "$V" "$RAIZ/docs/memoria/bin/mem.py" indexar >/dev/null 2>&1 || true
        ;;
    esac
    echo '{}'
    ;;

  inicio)
    {
      echo "Biblioteca de memória do projeto (docs/memoria/), a consultar com o agente bibliotecario:"
      echo
      "$V" "$RAIZ/docs/memoria/bin/mem.py" estado 2>/dev/null \
        | grep -E "notas|em vigor|fragmentos|entidades" | head -5
      echo
      # Só o que está mau ou em aviso — o resto é ruído no arranque.
      probs="$("$V" "$RAIZ/docs/memoria/bin/monitor.py" --breve 2>/dev/null \
               | grep -E "MAU|aviso" | head -8)"
      if [ -n "$probs" ]; then
        echo "Monitorização (docs/memoria/bin/monitor.py):"
        echo "$probs"
      fi
      if [ -s "$PENDENTES" ]; then
        echo
        echo "Por capturar de sessões anteriores:"
        tail -6 "$PENDENTES"
      fi
    } 2>/dev/null | json_escape | {
      read -r ctx
      printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":%s}}\n' "$ctx"
    }
    ;;

  fim)
    # Conta ficheiros .md, não entradas de `git status` — uma pasta inteira
    # por versionar aparece como UMA linha e dava sempre "1 nota".
    tocadas="$(cd "$RAIZ" && {
      git status --porcelain --untracked-files=all docs/memoria/notas/ 2>/dev/null \
        | awk '{print $NF}' | grep -c '\.md$'
    } 2>/dev/null || echo 0)"

    if [ "${tocadas:-0}" -gt 0 ]; then
      linha="- $(date +%Y-%m-%d) — $tocadas notas por rever/commitar"
      # Uma linha por dia e por contagem: sem isto o ficheiro enche-se de
      # entradas idênticas a cada arranque de sessão.
      # O `--` não é opcional: o grep desta máquina é o ugrep, e a linha
      # começa por "-", que sem ele é lido como opção.
      if ! grep -qxF -- "$linha" "$PENDENTES" 2>/dev/null; then
        echo "$linha" >> "$PENDENTES" 2>/dev/null || true
      fi
      # Nunca deixar crescer sem limite.
      tail -20 "$PENDENTES" > "$PENDENTES.tmp" 2>/dev/null \
        && mv "$PENDENTES.tmp" "$PENDENTES" 2>/dev/null || true
    fi

    # Confiança de captura por categoria, para o próximo arranque.
    "$V" "$RAIZ/docs/memoria/bin/capturar.py" estado >/dev/null 2>&1 || true

    printf '{"systemMessage":"Memória: %s notas por rever. Correr /memoria para capturar."}\n' \
      "${tocadas:-0}"
    ;;
esac

exit 0
