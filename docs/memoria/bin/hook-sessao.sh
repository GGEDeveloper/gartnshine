#!/usr/bin/env bash
# Hooks da biblioteca de memória.
#
#   hook-sessao.sh inicio      SessionStart      — como usar a memória, e o estado de hoje
#   hook-sessao.sh relevante   UserPromptSubmit  — as notas que tocam nesta pergunta
#   hook-sessao.sh fim         SessionEnd        — deixa por escrito o que falta capturar
#   hook-sessao.sh reindexar   PostToolUse       — reindexa a nota que foi tocada
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
        # Serializado: gravar várias notas seguidas dispara vários hooks em
        # async, e escritores concorrentes no SQLite fazem-se desistir uns aos
        # outros. Com flock, quem chega depois espera pela vez em vez de falhar
        # em silêncio. O -w é generoso porque gerar embeddings demora.
        LOCK="$ESTADO/.indexar.lock"
        if command -v flock >/dev/null 2>&1; then
          flock -w 180 "$LOCK" \
            "$V" "$RAIZ/docs/memoria/bin/mem.py" indexar >/dev/null 2>&1 || true
        else
          "$V" "$RAIZ/docs/memoria/bin/mem.py" indexar >/dev/null 2>&1 || true
        fi
        ;;
    esac
    echo '{}'
    ;;

  relevante)
    # A busca é local e determinística — ~240 ms e zero tokens de API — o que
    # permite consultá-la em TODAS as perguntas em vez de esperar que o agente
    # se lembre de o fazer. É o que a nossa arquitectura permite e a do
    # understory não: lá, cada consulta é uma corrida de agente LLM.
    pergunta="$(printf '%s' "$STDIN" | "$V" -c \
      'import json,sys
try:
    print((json.load(sys.stdin).get("prompt") or "").strip())
except Exception:
    print("")' 2>/dev/null)"

    # Um prompt vazio ou um comando de barra não têm nada que procurar.
    case "$pergunta" in
      ""|/*) echo '{}'; exit 0 ;;
    esac

    ctx="$("$V" "$RAIZ/docs/memoria/bin/mem.py" contexto "$pergunta" 2>/dev/null)"
    if [ -n "$ctx" ]; then
      printf '%s' "$ctx" | json_escape | {
        read -r c
        printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":%s}}\n' "$c"
      }
    else
      echo '{}'
    fi
    ;;

  inicio)
    {
      # Contagens não ensinam ninguém a usar nada. Primeiro o que fazer com
      # a memória; só depois o retrato de como ela está hoje.
      cat <<'FIM'
## Memória do projeto

Este projeto tem memória em `docs/memoria/`: decisões datadas, armadilhas já
pagas e o estado de cada frente. **Consulta-a antes de decidir** qualquer coisa
sobre história do projeto, escolhas passadas, ou "isto já foi discutido?".

  docs/memoria/.venv/bin/python docs/memoria/bin/mem.py buscar "..."

Os factos são datados: `--as-of AAAA-MM-DD` responde o que era verdade nessa
data, e não o que é verdade hoje. Para trabalho a sério sobre a memória — ler
vários fios, escrever ou corrigir notas — usa o agente `bibliotecario`.

FIM
      "$V" "$RAIZ/docs/memoria/bin/mem.py" estado 2>/dev/null \
        | grep -E "notas|em vigor|fragmentos|ligações|entidades" | head -6
      echo
      # Só o que está mau ou em aviso — o resto é ruído no arranque.
      probs="$("$V" "$RAIZ/docs/memoria/projeto/monitor.py" --breve 2>/dev/null \
               | grep -E "MAU|aviso" | head -8)"
      if [ -n "$probs" ]; then
        echo "Monitorização (docs/memoria/projeto/monitor.py):"
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
    # `grep -c` devolve 0 no stdout MAS exit 1 quando não há linhas; um
    # `|| echo 0` a seguir acrescentava um segundo zero e partia o JSON.
    # Contar com awk evita o problema — sai sempre 0 com exit 0.
    tocadas="$(cd "$RAIZ" && git status --porcelain --untracked-files=all \
      docs/memoria/notas/ 2>/dev/null \
      | awk '$NF ~ /\.md$/ {n++} END {print n+0}')"
    tocadas="${tocadas:-0}"

    if [ "${tocadas:-0}" -gt 0 ]; then
      hoje="$(date +%Y-%m-%d)"
      linha="- $hoje — $tocadas notas por rever/commitar"
      # UMA linha por dia, substituída. Antes deduplicava-se a linha inteira,
      # contagem incluída: várias sessões no mesmo dia com contagens
      # diferentes deixavam seis entradas da mesma data no arranque seguinte.
      # O `--` não é opcional: o grep desta máquina é o ugrep, e a linha
      # começa por "-", que sem ele é lido como opção.
      grep -v -- "^- $hoje — " "$PENDENTES" > "$PENDENTES.tmp" 2>/dev/null || true
      echo "$linha" >> "$PENDENTES.tmp" 2>/dev/null || true
      mv "$PENDENTES.tmp" "$PENDENTES" 2>/dev/null || true
      # Nunca deixar crescer sem limite.
      tail -20 "$PENDENTES" > "$PENDENTES.tmp" 2>/dev/null \
        && mv "$PENDENTES.tmp" "$PENDENTES" 2>/dev/null || true
    fi

    # Confiança de captura por categoria, para o próximo arranque.
    "$V" "$RAIZ/docs/memoria/bin/capturar.py" estado >/dev/null 2>&1 || true

    printf '{"systemMessage":"Memória: %s notas por rever. `capturar.py propor` diz o que ficou por memorizar."}\n' \
      "${tocadas:-0}"
    ;;
esac

exit 0
