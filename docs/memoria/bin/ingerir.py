#!/usr/bin/env python3
"""Ingestão multi-fonte para a biblioteca de memória.

Além das notas curadas, o índice alcança material em bruto que ainda não
virou nota: as conversas, os documentos do repositório e o histórico git.
Serve para o bibliotecário conseguir responder "isto já foi discutido?"
antes de existir uma nota sobre o assunto.

Dos 391 MB de transcripts em disco, apenas ~1,0 MB é texto conversacional;
o resto é saída de ferramentas (base64, dumps). Filtramos à entrada.
"""
from __future__ import annotations

import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[3]
TRANSCRIPTS = Path.home() / ".claude" / "projects" / "-home-ggedeveloper-gartnshine-3"

# Ficheiros e pastas cujo conteúdo não é conhecimento do projeto.
EXCLUIR = re.compile(
    r"(^|/)(node_modules|venv|\.venv|\.git|dist|build|coverage)/"
    r"|(^|/)\.claude/worktrees/"          # cópias de worktree
    r"|(^|/)(temporario|aa-temporary|_arquivo)"
    r"|(^|/)docs/memoria/"                 # não indexar a si próprio
)

MIN_TEXTO = 120        # abaixo disto não vale a pena indexar
MAX_TURNO = 4000       # corta monólogos longos


def _limpo(t: str) -> str:
    """Remove ruído que não é conversa: blocos de ferramenta, base64, dumps."""
    if not t:
        return ""
    t = re.sub(r"<(system-reminder|command-name|local-command[^>]*)>.*?</\1>", " ",
               t, flags=re.S)
    t = re.sub(r"data:[^;]+;base64,[A-Za-z0-9+/=]+", " ", t)
    t = re.sub(r"\b[A-Za-z0-9+/]{200,}={0,2}\b", " ", t)   # base64 solto
    t = re.sub(r"\n\s*\n\s*\n+", "\n\n", t)
    return t.strip()


def ingerir_transcripts(db, guardar) -> int:
    """Indexa as trocas com o programador, emparelhando pergunta e resposta."""
    if not TRANSCRIPTS.exists():
        print("  (sem transcripts)")
        return 0
    total = 0
    for f in sorted(TRANSCRIPTS.glob("*.jsonl")):
        turnos: list[tuple[str, str, str]] = []
        for linha in f.open(errors="ignore"):
            try:
                d = json.loads(linha)
            except json.JSONDecodeError:
                continue
            m = d.get("message") or {}
            papel = m.get("role")
            if papel not in ("user", "assistant"):
                continue
            c = m.get("content")
            if isinstance(c, list):
                txt = " ".join(x.get("text", "") for x in c
                               if isinstance(x, dict) and x.get("type") == "text")
            elif isinstance(c, str):
                txt = c
            else:
                continue
            txt = _limpo(txt)
            if not txt or txt.startswith("<"):
                continue
            turnos.append((papel, txt[:MAX_TURNO], (d.get("timestamp") or "")[:10]))

        # Emparelha cada pergunta do dev com a resposta seguinte: é o par
        # que carrega a intenção e a justificação.
        itens, ordem = [], 0
        for i, (papel, txt, ts) in enumerate(turnos):
            if papel != "user" or len(txt) < 40:
                continue
            resposta = ""
            for papel2, txt2, _ in turnos[i + 1 : i + 3]:
                if papel2 == "assistant":
                    resposta = txt2
                    break
            bloco = f"DEV: {txt}"
            if resposta:
                bloco += f"\n\nCLAUDE: {resposta[:1800]}"
            if len(bloco) >= MIN_TEXTO:
                itens.append((ordem, f"conversa {ts or f.stem[:8]}", bloco))
                ordem += 1

        if itens:
            data = itens[0][1].split()[-1] if itens else None
            total += guardar(db, "transcript", f.stem, itens, data=data)
    db.commit()
    return total


def ingerir_docs(db, guardar) -> int:
    """Indexa a documentação do repositório."""
    total = 0
    for f in sorted(RAIZ.rglob("*.md")):
        rel = str(f.relative_to(RAIZ))
        if EXCLUIR.search(rel):
            continue
        try:
            texto = f.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        if len(texto) < MIN_TEXTO:
            continue
        titulo = next((l.lstrip("# ").strip() for l in texto.splitlines()
                       if l.startswith("#")), f.stem)
        blocos = _por_seccao(texto)
        itens = [(i, titulo, b) for i, b in enumerate(blocos)]
        data = datetime.fromtimestamp(f.stat().st_mtime, timezone.utc).date().isoformat()
        total += guardar(db, "doc", rel, itens, data=data)
    db.commit()
    return total


def _por_seccao(texto: str, alvo: int = 1500) -> list[str]:
    """Corta por cabeçalhos markdown, juntando secções curtas."""
    partes = re.split(r"\n(?=#{1,3} )", texto)
    blocos, atual = [], ""
    for p in partes:
        p = p.strip()
        if not p:
            continue
        if len(atual) + len(p) <= alvo:
            atual = f"{atual}\n\n{p}" if atual else p
        else:
            if atual:
                blocos.append(atual)
            atual = p if len(p) <= alvo else ""
            if not atual:
                for i in range(0, len(p), alvo):
                    blocos.append(p[i : i + alvo])
    if atual:
        blocos.append(atual)
    return blocos


def ingerir_commits(db, guardar, limite: int = 500) -> int:
    """Indexa mensagens de commit — o registo mais fiável do que mudou."""
    try:
        saida = subprocess.run(
            ["git", "log", f"-{limite}", "--date=short",
             "--pretty=format:%H%x1f%ad%x1f%s%x1f%b%x1e"],
            cwd=RAIZ, capture_output=True, text=True, timeout=60).stdout
    except (subprocess.SubprocessError, OSError):
        return 0
    itens, ordem = [], 0
    for reg in saida.split("\x1e"):
        campos = reg.strip().split("\x1f")
        if len(campos) < 3:
            continue
        sha, data, assunto = campos[0][:12], campos[1], campos[2]
        corpo = campos[3] if len(campos) > 3 else ""
        texto = f"[{data}] {assunto}\n{corpo}".strip()
        if len(texto) < 40:
            continue
        itens.append((ordem, f"commit {sha}", texto))
        ordem += 1
    if not itens:
        return 0
    return guardar(db, "commit", "git-log", itens)


def ingerir_tudo(db, guardar) -> None:
    print("A indexar conversas com o programador…")
    n = ingerir_transcripts(db, guardar)
    print(f"  {n} fragmentos")
    print("A indexar documentação do repositório…")
    n = ingerir_docs(db, guardar)
    print(f"  {n} fragmentos")
    print("A indexar histórico git…")
    n = ingerir_commits(db, guardar)
    print(f"  {n} commits")
    db.commit()
