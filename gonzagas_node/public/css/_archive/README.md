# 🗂️ ARQUIVO CSS - GONZAGA ART & SHINE

## Objetivo

Este diretório contém ficheiros CSS que foram **substituídos** ou **depreciados** no sistema Dark Nature.

**IMPORTANTE:** Os ficheiros aqui NÃO são carregados no site. Estão preservados apenas para referência histórica e possível recuperação.

---

## 🔒 Política de Arquivo

### ❌ NÃO DELETAMOS, ARQUIVAMOS!

- Ficheiros NUNCA são eliminados permanentemente
- Sempre preservamos histórico para referência
- Possível restaurar se necessário (raro)

### ✅ Quando Arquivar:

1. **Redundância Confirmada**
   - Ficheiro substituído por nova versão
   - Não referenciado em nenhum template
   - Lógica integrada em sistema modular

2. **Versões Antigas**
   - Ficheiros `-v1`, `-v2`, etc obsoletos
   - Substituídos por versão `-dark-nature`
   - Catch-all gigantes descontinuados

3. **Duplicação**
   - Múltiplas versões do mesmo ficheiro
   - Apenas a versão ativa permanece em `/css/`

---

## 📁 Estrutura

```
/css/_archive/
├── README.md ← Este ficheiro
├── 2026-02-17-cleanup/ ← Limpeza inicial
│   ├── _manifest.json ← Metadata
│   ├── main.css
│   ├── dashboard.css
│   ├── components.css
│   ├── catalog.css
│   ├── catalog-v2.css
│   └── homepage-v2.css
└── admin-legacy/ ← Admin antigo (se confirmado)
    ├── admin.css
    ├── admin-v2.css
    └── admin-layout-fix.css
```

---

## 📊 Estatísticas

### Ficheiros Arquivados: 6-10 ficheiros
### Espaço Liberado: ~120KB (-26%)
### Data Início: 2026-02-17

---

## 📖 Histórico de Arquivamento

### 2026-02-17: Limpeza Inicial Dark Nature

**Motivo:** Migração para sistema modular Dark Nature completa

**Ficheiros Arquivados:**
1. `main.css` (35KB) - Catch-all gigante não usado
2. `dashboard.css` (40KB) - Substituído por admin-dark-nature.css
3. `components.css` (9KB) - Substituído por components-dark-nature.css
4. `catalog.css` (12KB) - Sistema modular substitui
5. `catalog-v2.css` (3KB) - Versão intermediária obsoleta
6. `homepage-v2.css` (19KB) - Não carregado (index.ejs standalone)

**Verificações Realizadas:**
- ✅ layout.ejs carrega apenas: tokens → base → components (dark-nature)
- ✅ main-layout.ejs carrega admin.css (verificar qual versão)
- ✅ index.ejs standalone não carrega homepage-v2.css
- ✅ dashboard-dark-nature.ejs usa stack Dark Nature completo
- ✅ login-dark-nature.ejs usa tokens + base + admin-login-dark-nature

**Sistema Ativo Pós-Limpeza:**
```
CAMADA 1 - PRIMITIVOS:
✅ tokens-dark-nature.css (9KB)

CAMADA 2 - BASE:
✅ variables.css (6.7KB) - Aliases
✅ base-dark-nature.css (15KB)

CAMADA 3 - COMPONENTES:
✅ components-dark-nature.css (30KB)

CAMADA 4 - PÁGINAS:
✅ pdp-dark-nature.css
✅ cart-dark-nature.css
✅ checkout-premium-dark-nature.css
✅ galeria-dark-nature.css
✅ manifesto-dark-nature.css
✅ admin-dark-nature.css
✅ admin-login-dark-nature.css

CAMADA 5 - UTILITIES:
✅ loading-states.css
✅ notifications.css
✅ mobile-navigation.css
✅ enhanced-navigation.css
```

---

## ⚠️ Como Restaurar um Ficheiro

### Se precisar restaurar (raro):

1. **Identificar ficheiro** no manifest.json
2. **Copiar de _archive/** para `/css/`
3. **Adicionar referência** no template apropriado
4. **Testar** localmente
5. **Documentar** motivo da restauração

### Comando:
```bash
cp /css/_archive/2026-02-17-cleanup/[FICHEIRO].css /css/
```

---

## 📝 Notas

- Ficheiros arquivados NÃO afetam performance do site
- Apenas ficheiros em `/css/` (root) são servidos
- `_archive/` pode ser excluído do build de produção
- Git mantém histórico completo independentemente

---

**Última Atualização:** 2026-02-17  
**Mantido por:** Sistema de Desenvolvimento Gonzaga Art & Shine
