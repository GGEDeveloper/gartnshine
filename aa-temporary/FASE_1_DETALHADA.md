# 📱 FASE 1 DETALHADA - Mobile Camera Admin
**Gonzaga's Art & Shine - Sprint 1 (Semanas 1-2)**

---

## 🎯 OBJETIVO DA FASE 1

Permitir que o admin tire fotos diretamente no telemóvel e crie produtos instantaneamente, reduzindo o tempo de 5 minutos para 1 minuto.

---

## 📋 TAREFAS DA FASE 1

### **[15] Database Schema** ✅ **COMPLETA**

#### Status: ✅ 100% Completa
#### Tempo: 2 horas
#### Complexidade: Média

#### O Que Foi Feito:
```
✅ Análise do schema atual (6 tabelas existentes)
✅ Design de 2 novas tabelas (media_files, media_usage)
✅ Plano de migração em 5 fases
✅ Scripts SQL criados (4 ficheiros)
✅ Backup strategy documentada
✅ Rollback procedures completos
✅ Migrations executadas com sucesso
✅ Verificação: ZERO data loss
```

#### Resultado:
```sql
TABELAS CRIADAS:
├── media_files (14 campos)
│   ├── id, filename, original_filename
│   ├── file_size, mime_type, width, height
│   ├── has_thumbnail, has_medium, has_large, has_webp
│   └── uploaded_by, created_at, updated_at
│
└── media_usage (5 campos)
    ├── id, media_id (FK)
    ├── used_in_table, used_in_id
    └── created_at

TABELA MODIFICADA:
└── product_images
    └── + media_id INT NULL (novo campo)
```

#### Ficheiros Criados:
```
sql/migrations/
├── 00_SCHEMA_ANALYSIS.md (14 KB)
├── 01_MIGRATION_PLAN.md (16 KB)
├── 002_create_media_tables.sql ✅ EXECUTADO
├── 003_extend_product_images.sql ✅ EXECUTADO
├── 004_migrate_existing_data.sql
├── 999_rollback.sql
├── README.md
└── run_migrations.sh
```

---

### **[1] Camera Capture Component** ⏳ **EM PROGRESSO**

#### Status: 🔄 12.5% (1/8 subtarefas)
#### Tempo Estimado: 3-5 dias
#### Complexidade: Alta
#### Prioridade: 🔥 CRÍTICA

#### Subtarefas (8 total):

##### **1.1 Camera Access Module** 🔄 **EM PROGRESSO**
```
Objetivo: Implementar getUserMedia API para acesso à câmara
Ficheiro: public/js/camera-capture.js
Status: ✅ CRIADO (precisa integração)
```

**Micro-tasks:**
- [x] Criar classe CameraCapture
- [x] Implementar checkSupport()
- [x] Implementar detectCameras()
- [x] Implementar startCamera()
- [x] Implementar stopCamera()
- [x] Feature detection
- [x] Error handling básico
- [ ] **Testar em Chrome mobile**
- [ ] **Testar em iOS Safari**
- [ ] **Testar em Firefox mobile**
- [ ] **Integrar com product form**

##### **1.2 Camera Preview UI** ⏳ PENDENTE
```
Objetivo: Mostrar preview da câmara em overlay
Ficheiros: public/css/admin-camera.css, public/js/camera-capture.js
Status: Parcialmente criado (falta CSS)
```

**Micro-tasks:**
- [x] Criar createUI() method
- [x] Overlay HTML structure
- [x] Video element setup
- [ ] **Criar admin-camera.css**
- [ ] **Estilizar overlay (tema escuro)**
- [ ] **Responsive para mobile**
- [ ] **Testar orientação portrait/landscape**
- [ ] **Preview smooth transitions**

##### **1.3 Capture Button & Events** ⏳ PENDENTE
```
Objetivo: Botão para tirar foto e eventos
Ficheiro: public/js/camera-capture.js (já parcialmente implementado)
Status: Lógica criada, precisa refinamento
```

**Micro-tasks:**
- [x] Criar capturePhoto() method
- [x] Canvas frame capture
- [x] Flash effect
- [ ] **Testar qualidade da captura**
- [ ] **Validar dimensões**
- [ ] **Testar em diferentes resoluções**
- [ ] **Feedback visual melhorado**

##### **1.4 File Upload Fallback** ⏳ PENDENTE
```
Objetivo: Input tradicional para desktop/unsupported browsers
Ficheiro: views/admin/products/form.ejs
Status: Não iniciado
```

**Micro-tasks:**
- [ ] **Modificar product form.ejs**
- [ ] **Adicionar botão camera (mobile only)**
- [ ] **Manter input file (sempre visível)**
- [ ] **Feature detection UI toggle**
- [ ] **Testar em desktop**
- [ ] **Testar fallback automático**

##### **1.5 Style Camera UI** ⏳ PENDENTE
```
Objetivo: CSS para tema escuro Bali/Boho
Ficheiro: public/css/admin-camera.css
Status: Não criado
```

**Micro-tasks:**
- [ ] **Criar admin-camera.css**
- [ ] **Overlay dark theme (#1a1a1a)**
- [ ] **Botões dourados (#c0a080)**
- [ ] **Responsive breakpoints**
- [ ] **Touch-friendly buttons (44x44px)**
- [ ] **Animations & transitions**
- [ ] **Flash effect styling**

##### **1.6 Multer Integration** ⏳ PENDENTE
```
Objetivo: Integrar com sistema de upload existente
Ficheiros: controllers/ProductController.js
Status: Não iniciado
```

**Micro-tasks:**
- [ ] **Analisar upload atual (multer)**
- [ ] **Converter blob para File object**
- [ ] **Testar upload de foto capturada**
- [ ] **Testar upload de file input**
- [ ] **Validar ambos os métodos**
- [ ] **Error handling**

##### **1.7 Permissions & Error Handling** ⏳ PENDENTE
```
Objetivo: Tratamento robusto de erros
Ficheiro: public/js/camera-capture.js (parcialmente implementado)
Status: Básico criado, precisa melhorias
```

**Micro-tasks:**
- [x] Error types handling
- [ ] **Testar permission denied**
- [ ] **Testar camera busy**
- [ ] **Testar no camera found**
- [ ] **User-friendly messages em PT**
- [ ] **Recovery options**
- [ ] **Fallback automático**

##### **1.8 Cross-Browser Testing** ⏳ PENDENTE
```
Objetivo: Garantir funcionamento em todos os browsers
Status: Não iniciado
```

**Micro-tasks:**
- [ ] **Testar iOS Safari 14+**
- [ ] **Testar Chrome Android 90+**
- [ ] **Testar Firefox mobile**
- [ ] **Testar desktop (fallback)**
- [ ] **Documentar quirks/issues**
- [ ] **Fix compatibility issues**
- [ ] **Performance profiling**

---

### **[2] Multi-Camera Switch** ⏳ PENDENTE

#### Status: 0% (aguarda Tarefa 1)
#### Tempo Estimado: 1 dia
#### Complexidade: Média
#### Dependência: Tarefa 1

**Micro-tasks:**
- [ ] Implementar switchCamera() (já parcialmente criado)
- [ ] UI toggle button
- [ ] Smooth camera transition
- [ ] Save camera preference
- [ ] Testing em devices com múltiplas câmaras

---

### **[3] Image Compression** ⏳ PENDENTE

#### Status: 0% (aguarda Tarefa 1)
#### Tempo Estimado: 2 dias
#### Complexidade: Média
#### Dependência: Tarefa 1

**Micro-tasks:**
- [ ] Criar módulo image-compression.js
- [ ] Canvas resize algorithm
- [ ] Quality optimization (85% JPEG)
- [ ] Max dimensions (1600px)
- [ ] File size validation
- [ ] Before/after comparison
- [ ] Integration com camera capture

---

### **[4] Quick Product Creation** ⏳ PENDENTE

#### Status: 0% (aguarda Tarefas 1, 3)
#### Tempo Estimado: 2 dias
#### Complexidade: Média
#### Dependências: Tarefas 1, 3

**Micro-tasks:**
- [ ] Nova rota /admin/products/quick-add
- [ ] Formulário simplificado (4 campos)
- [ ] Camera integration
- [ ] Auto-generate reference
- [ ] Save & redirect to edit
- [ ] Mobile-optimized form
- [ ] Testing workflow completo

---

## 📊 MÉTRICAS DE SUCESSO - FASE 1

### Performance
- [ ] Camera activation < 500ms
- [ ] Image compression: 80-90% reduction
- [ ] Upload < 2 segundos

### UX
- [ ] Add product: 5min → 1min
- [ ] Mobile workflow funcional
- [ ] Error handling claro

### Técnico
- [ ] iOS Safari: ✅ funciona
- [ ] Chrome Android: ✅ funciona
- [ ] Fallback desktop: ✅ funciona
- [ ] Zero breaking changes

---

## 🗂️ ESTRUTURA DE FICHEIROS A CRIAR/MODIFICAR

### Criar (Novos):
```
public/js/
├── camera-capture.js ✅ CRIADO
└── image-compression.js

public/css/
└── admin-camera.css

views/admin/products/
└── quick-add.ejs

routes/admin/
└── (modificar routes existentes)

controllers/
└── (modificar ProductController)
```

### Modificar (Existentes):
```
views/admin/products/
└── form.ejs (adicionar botão camera)

views/admin/layouts/
└── main.ejs (incluir CSS/JS)
```

---

## ⏱️ TIMELINE ESTIMADA - FASE 1

### Semana 1:
```
Dia 1: ✅ Database Schema (COMPLETO)
Dia 2: Camera Access + Preview UI
Dia 3: Capture + Fallback
Dia 4: Styling + Integration
Dia 5: Testing inicial
```

### Semana 2:
```
Dia 1: Multi-Camera Switch
Dia 2: Image Compression
Dia 3-4: Quick Product Creation
Dia 5: Testing completo + fixes
```

---

## ✅ CHECKLIST GLOBAL FASE 1

### Preparação (COMPLETO)
- [x] Task Master inicializado
- [x] PRD criado
- [x] Tarefas estruturadas
- [x] Database backup
- [x] Migrations executadas
- [x] Tabelas criadas e verificadas

### Implementação (EM PROGRESSO)
- [x] Camera module criado (básico)
- [ ] CSS styling
- [ ] Form integration
- [ ] Compression module
- [ ] Quick add form
- [ ] Testing completo

### Validação (PENDENTE)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Mobile device testing
- [ ] Performance profiling
- [ ] Security audit

### Deploy (PENDENTE)
- [ ] Code review
- [ ] Staging deployment
- [ ] User acceptance testing
- [ ] Production deployment
- [ ] Monitoring

---

## 🚨 RISCOS & MITIGAÇÕES

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| getUserMedia não funciona iOS | Alto | Fallback para file input ✅ |
| Performance issues | Médio | Compression + optimization |
| Browser compatibility | Médio | Extensive testing + fallbacks |
| User não permite câmara | Alto | Clear messaging + fallback ✅ |

---

## 📞 PRÓXIMO CHECKPOINT

**Tarefa 1 Completa:**
- Camera capture funcionando em mobile
- Preview e capture testados
- Fallback funciona em desktop
- Integrado com product form

**Quando Completa:**
- Marcar Tarefa 1 como done
- Começar Tarefa 2 (Multi-Camera)

---

**Última Atualização:** 2025-10-07 20:30  
**Progresso Fase 1:** 20% (1/5 tarefas)  
**Status:** 🟢 ON TRACK

