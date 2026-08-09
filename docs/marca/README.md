# Marca Gonzaga — base documental

O que esta pasta é: **as regras**. O que decidimos, porquê, e o que ainda está
por decidir. Não é um relatório — é o sítio onde se vai buscar a resposta
antes de desenhar seja o que for.

---

## Os documentos

| # | Documento | Responde a |
|---|---|---|
| 01 | [Plataforma de marca](01-plataforma.md) | Quem somos, para quem, com que voz |
| 02 | [Identidade](02-identidade.md) | O lettering: ficheiros, versões, tamanhos, proibições |
| 03 | [Cor](03-cor.md) | A paleta TERRA, os papéis de cada cor, contrastes reais |
| 04 | [Tipografia](04-tipografia.md) | O que o lettering faz e o que a tipografia de acompanhamento faz |
| 05 | [Fotografia](05-fotografia.md) | Regras de foto de produto e de ambiente |
| 06 | [Auditoria do site](06-auditoria-site.md) | O que o site faz hoje contra estas regras |
| 07 | [Roteiro](07-roteiro.md) | O que falta no produto digital, por ordem |
| 08 | [Diagnóstico completo](08-diagnostico.md) | **As oito camadas da marca**, não só o site — e onde estão os buracos |

Para o lado técnico do CSS — escalas de espaçamento, tipo, raios, z-index —
a referência continua a ser [`../DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md).
Esta pasta manda na **marca**; esse documento manda na **implementação**.
A cor é a peça que faltava aos dois e que o [03](03-cor.md) fecha.

---

## Fonte e derivado

Distinção que evita trabalho perdido:

| Camada | Onde | Quem manda |
|---|---|---|
| **Fonte primária** | `branding-desing/nome-e-lettering/` | O desenho do lettering. Não se edita a partir do site. |
| **Fonte primária** | `branding-desing/brand_bible_profissional.md` | O questionário respondido pelo Gonzaga. |
| **Regras** | `docs/marca/` (esta pasta) | Derivadas das duas fontes acima + decisões tomadas. |
| **Assets** | `gonzagas_node/public/brand/` | Gerados a partir da fonte. Ver [02](02-identidade.md). |
| **Implementação** | `gonzagas_node/public/css/` | Tem de obedecer a esta pasta. |

**O lettering nunca é redesenhado a jusante.** Se um asset precisa de mudar,
muda-se no documento de origem e volta a extrair-se. O contorno fechado para
gravação deriva do fio único; nunca o contrário.

---

## Estado, em três linhas

- **A identidade está feita e é boa.** O lettering é original, sistemático e
  está documentado ao nível da cota, com o espacejamento fechado. É o activo
  mais forte do projecto.
- **E não está aplicada em lado nenhum.** O problema deixou de ser desenhar a
  marca; é que ela só existe em ficheiros.
- **A camada física não existe.** Zero embalagem, etiqueta, punção ou banca —
  e é em feiras e festivais que a marca vende. Ver [08](08-diagnostico.md).

Data desta versão: **2026-08-04**.
