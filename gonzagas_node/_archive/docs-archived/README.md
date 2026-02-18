# Docs Archive

Documentação e ficheiros de teste arquivados.
**Arquivados em:** 2026-02-18

## 📁 Estrutura

### testing/
Ficheiros HTML de teste e validação.

- **`TESTE_NOTIFICACOES.html`** (8.3KB)
  - **Propósito:** Teste manual de sistema de notificações
  - **Tipo:** HTML standalone com JavaScript inline
  - **Uso:** Validação visual de notificações antes de integração
  - **Status:** ✅ Sistema implementado e testado

---

## 🔍 Detalhes: TESTE_NOTIFICACOES.html

### Contexto

**Período:** 2025 Q3-Q4
**Fase:** Desenvolvimento do sistema de notificações

**Propósito original:**
- Testar diferentes tipos de notificações (success, error, warning, info)
- Validar posicionamento e animações
- Verificar responsividade mobile
- Testar empilhamento de múltiplas notificações

### Por que arquivado?

✅ **Sistema implementado:**
- `public/js/notifications.js` - Sistema final
- `public/css/notifications.css` - Estilos finais
- `SISTEMA_NOTIFICACOES.md` - Documentação completa

✅ **Testes integrados:**
- Sistema testado em ambiente real
- Validações E2E implementadas
- Funcionando em produção

✅ **Substituído por:**
- Testes automatizados
- Documentação em `SISTEMA_NOTIFICACOES.md`
- Exemplos de uso no código real

---

## 📊 Conteúdo do Ficheiro

### Funcionalidades testadas

```html
- Notificação tipo success
- Notificação tipo error  
- Notificação tipo warning
- Notificação tipo info
- Auto-dismiss (3 segundos)
- Botão de fechar manual
- Empilhamento vertical
- Animações de entrada/saída
- Responsividade mobile
```

### Estrutura

```
TESTE_NOTIFICACOES.html
├── HTML estrutura
├── CSS inline (estilos de teste)
├── JavaScript inline (lógica de teste)
└── Botões de teste para cada tipo
```

---

## 🔄 Se Necessário Consultar

### Ver sistema atual

```bash
# JavaScript
cat public/js/notifications.js

# CSS
cat public/css/notifications.css

# Documentação
cat SISTEMA_NOTIFICACOES.md
```

### Restaurar ficheiro de teste

```bash
# Copiar para raiz ou pasta de testes
cp _archive/docs-archived/testing/TESTE_NOTIFICACOES.html ./

# Abrir em browser
open TESTE_NOTIFICACOES.html
```

### Usar sistema atual

```javascript
// Em qualquer página com notifications.js carregado
if (typeof NotificationSystem !== 'undefined') {
  const notifications = new NotificationSystem();
  notifications.show('Teste de notificação', 'success');
}
```

---

## 📝 Histórico

### Linha do tempo

**2025 Q3** - Criação do ficheiro de teste
- Desenvolvimento inicial do sistema
- Testes manuais de UX/UI
- Iterações de design

**2025 Q4** - Sistema finalizado
- `notifications.js` implementado
- Integrado em toda aplicação
- Documentação completa

**2026 Q1** - Ficheiro obsoleto
- Sistema estável
- Testes automatizados
- Ficheiro não mais necessário

**2026-02-18** - Arquivado
- Movido para `_archive/docs-archived/testing/`
- Mantido para referência histórica
- Documentado este README

---

## ✨ Valor Histórico

Este ficheiro representa:
- 🎨 Processo de desenvolvimento iterativo
- 🧪 Abordagem de prototipagem rápida
- 📱 Preocupação com testes manuais antes de integração
- 📚 Documentação através de exemplos práticos

Mantido como exemplo de **boas práticas de desenvolvimento**:
1. Testar isoladamente antes de integrar
2. Validar UX/UI com protótipos
3. Documentar através de exemplos

---

**Preservado com:** 🔍 atenção aos detalhes e contexto histórico
