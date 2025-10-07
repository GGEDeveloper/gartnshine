# 🚀 QUICK START GUIDE
**Gonzaga's Art & Shine - Mobile Camera & Media Management**

---

## ⚡ COMEÇAR AGORA (Copy & Paste)

### 1️⃣ Preparar Ambiente
```bash
cd /home/ggedeveloper/gartnshine/gonzagas_node

# Criar estrutura de pastas
mkdir -p public/js/modules/camera \
         public/css/admin/camera \
         views/admin/media-gallery/partials \
         sql/migrations \
         docs/api \
         docs/user-guides \
         docs/technical \
         utils/image-processing

# Backup database
npm run db:backup
# ou manualmente:
# mysqldump -u [user] -p gonzagas_db > backup_$(date +%Y%m%d).sql

echo "✅ Ambiente preparado!"
```

### 2️⃣ Primeira Tarefa - Database Schema
```bash
# Navegar para taskmaster
cd /home/ggedeveloper/gartnshine

# Marcar tarefa como in-progress
tm status 15 in-progress

# Ver detalhes da tarefa
tm get 15

# Começar primeira subtarefa
tm status 15.1 in-progress
```

---

## 📋 TAREFAS OVERVIEW

### SPRINT 1: Mobile Camera (Semana 1-2)
```
┌─────────────────────────────────────┐
│ CRITICAL PATH                       │
├─────────────────────────────────────┤
│ [15] Database Schema         ⏰ 2d  │
│   └─ FAZER PRIMEIRO!               │
│                                     │
│ [1] Camera Capture          ⏰ 5d  │
│   ├─ 8 subtarefas detalhadas       │
│   └─ getUserMedia + Canvas         │
│                                     │
│ [2] Multi-Camera Switch     ⏰ 1d  │
│ [3] Image Compression       ⏰ 2d  │
│ [4] Quick Product Creation  ⏰ 2d  │
└─────────────────────────────────────┘
```

### SPRINT 2: Media Management (Semana 3-4)
```
┌─────────────────────────────────────┐
│ FEATURES                            │
├─────────────────────────────────────┤
│ [5] Drag & Drop Gallery     ⏰ 6d  │
│   ├─ 10 subtarefas detalhadas      │
│   └─ HTML5 Drag API + AJAX         │
│                                     │
│ [6] Image Variants          ⏰ 2d  │
│ [7] WebP Conversion         ⏰ 2d  │
│ [8] Media Library Modal     ⏰ 1d  │
│ [9] Usage Tracking          ⏰ 3d  │
└─────────────────────────────────────┘
```

### SPRINT 3: UX & Polish (Semana 5-6)
```
┌─────────────────────────────────────┐
│ ENHANCEMENTS                        │
├─────────────────────────────────────┤
│ [10] Progressive Loading    ⏰ 2d  │
│ [11] Masonry Grid          ⏰ 2d  │
│ [12] Bulk Operations       ⏰ 1d  │
│ [13] Performance Optimize  ⏰ 2d  │
│ [14] Security & Validation ⏰ 2d  │
│ [16] Design Polish         ⏰ 2d  │
│ [17] Dev Documentation     ⏰ 2d  │
│ [18] User Documentation    ⏰ 1d  │
└─────────────────────────────────────┘
```

---

## 🎯 WORKFLOW DIÁRIO

### Manhã (09:00-13:00)
```bash
# 1. Ver próxima tarefa
tm next

# 2. Marcar como in-progress
tm status [ID] in-progress

# 3. Se tem subtarefas, começar pela primeira
tm status [ID].1 in-progress

# 4. Implementar!
# ... code code code ...

# 5. Quando terminar subtarefa
tm status [ID].1 done
tm update-subtask [ID].1 --prompt "Implementado com sucesso. Testado em Chrome e Safari."
```

### Tarde (14:00-18:00)
```bash
# Continuar próximas subtarefas
tm status [ID].2 in-progress
# ... implementar ...
tm status [ID].2 done

# Quando tarefa completa
tm status [ID] done

# Ver progresso geral
tm list --status done
tm list --status in-progress
```

---

## 📊 PROGRESSO TRACKING

### Ver Status Atual
```bash
# Dashboard geral
tm list

# Por status
tm list --status pending      # Tarefas pendentes
tm list --status in-progress  # Em progresso
tm list --status done         # Completas

# Próxima recomendada
tm next
```

### Estatísticas
```bash
# Ver ficheiro tasks.json
cat .taskmaster/tasks/tasks.json | grep status | sort | uniq -c

# Ou no código
# Total: 18 tarefas
# Pending: 18
# Done: 0
# Progress: 0%
```

---

## 🛠️ COMANDOS ESSENCIAIS

### Navegação
```bash
tm next                    # Próxima tarefa recomendada
tm get [ID]                # Ver tarefa específica
tm list                    # Listar todas
tm list --status pending   # Filtrar por status
```

### Status Management
```bash
tm status [ID] in-progress    # Começar tarefa
tm status [ID] done           # Completar tarefa
tm status [ID].1 done         # Completar subtarefa
```

### Updates & Notes
```bash
# Adicionar notas/progresso
tm update-subtask [ID].1 --prompt "Nota sobre implementação"

# Atualizar descrição completa
tm update [ID] --prompt "Nova direção da tarefa"
```

### Research & Help
```bash
# Pesquisa para ajudar na implementação
tm research --query "getUserMedia iOS Safari best practices" --save-to 1.1

# Ver relatório de complexidade
tm analyze-complexity
tm complexity-report
```

---

## 📁 ESTRUTURA DE FICHEIROS

### Onde Estão as Tarefas?
```
/home/ggedeveloper/gartnshine/.taskmaster/
├── docs/
│   └── prd.txt                    # PRD completo
├── tasks/
│   ├── tasks.json                 # Todas as tarefas (JSON)
│   ├── TASK-001.md                # Tarefa 1 individual
│   ├── TASK-002.md                # Tarefa 2 individual
│   └── ...
├── PLANO_EXECUCAO.md              # Este ficheiro - overview completo
└── QUICK_START.md                 # Guia rápido (este ficheiro)
```

### Implementação
```
/home/ggedeveloper/gartnshine/gonzagas_node/
├── public/
│   ├── js/
│   │   ├── camera-capture.js          # Criar (Tarefa 1)
│   │   ├── media-gallery.js           # Criar (Tarefa 5)
│   │   └── ...
│   └── css/
│       ├── admin-camera.css           # Criar (Tarefa 1)
│       └── media-gallery.css          # Criar (Tarefa 5)
├── controllers/
│   └── MediaGalleryController.js      # Criar (Tarefa 5)
├── models/
│   ├── MediaFile.js                   # Criar (Tarefa 5)
│   └── MediaUsage.js                  # Criar (Tarefa 9)
└── sql/migrations/
    ├── 001_create_media_files.sql     # Criar (Tarefa 15)
    └── 002_create_media_usage.sql     # Criar (Tarefa 15)
```

---

## ⚠️ COISAS IMPORTANTES

### ANTES DE COMEÇAR
- ✅ Fazer backup da database
- ✅ Commit do código atual
- ✅ Testar que sistema atual funciona
- ✅ Ter acesso a dispositivos mobile para testar

### DURANTE IMPLEMENTAÇÃO
- ✅ Testar cada feature isoladamente
- ✅ Atualizar status das tarefas regularmente
- ✅ Fazer commits frequentes com mensagens claras
- ✅ Documentar problemas encontrados nas subtarefas

### DEPOIS DE CADA TAREFA
- ✅ Testar integração com resto do sistema
- ✅ Verificar que não quebrou nada existente
- ✅ Atualizar documentação
- ✅ Marcar tarefa como done

---

## 🐛 TROUBLESHOOTING

### TaskMaster não reconhece comandos
```bash
# Verificar se está no diretório correto
pwd  # Deve ser /home/ggedeveloper/gartnshine

# Verificar se projeto foi inicializado
ls -la .taskmaster/

# Se não, reinicializar
tm init
```

### Tarefas não aparecem
```bash
# Verificar tasks.json
cat .taskmaster/tasks/tasks.json

# Regenerar ficheiros individuais
tm generate
```

### Erro ao marcar status
```bash
# Verificar ID correto
tm list

# Usar ID numérico exato
tm status 1 in-progress   # ✅ Correto
tm status "1" in-progress # ❌ Errado
```

---

## 📞 RECURSOS & AJUDA

### Documentação
- **PRD Completo:** `.taskmaster/docs/prd.txt`
- **Plano Execução:** `.taskmaster/PLANO_EXECUCAO.md`
- **Este Guia:** `.taskmaster/QUICK_START.md`

### APIs Referência
- getUserMedia: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- Drag & Drop: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API

### Testing
- Can I Use (compatibility): https://caniuse.com
- BrowserStack (testing): https://www.browserstack.com
- Chrome DevTools: F12 → Device Mode

---

## ✅ CHECKLIST PRIMEIRA TAREFA

### Tarefa 15: Database Schema
- [ ] Subtarefa 15.1: Analisar schema atual
- [ ] Subtarefa 15.2: Desenhar plano de migração
- [ ] Subtarefa 15.3: Escrever SQL scripts
- [ ] Subtarefa 15.4: Criar data migration scripts
- [ ] Subtarefa 15.5: Testar em staging
- [ ] Subtarefa 15.6: Deploy em produção

### Comandos
```bash
# Começar
tm status 15 in-progress
tm status 15.1 in-progress

# À medida que completas
tm status 15.1 done
tm update-subtask 15.1 --prompt "Schema analisado. Identificadas 2 tabelas novas."

# Próxima
tm status 15.2 in-progress
# ... etc
```

---

## 🎉 QUANDO TERMINAR

### Depois de Cada Sprint
```bash
# Checkpoint
git add .
git commit -m "feat: Sprint 1 completo - Mobile Camera Implementation"
git push

# Backup database
npm run db:backup

# Ver progresso
tm list --status done
```

### Projeto Completo
```bash
# Todas as tarefas done
tm list --status done  # Deve mostrar 18/18

# Criar tag de release
git tag -a v2.0.0 -m "Mobile Camera & Media Management Complete"
git push origin v2.0.0

# Celebrar! 🎉
```

---

**🚀 PRONTO PARA COMEÇAR!**

```bash
# Comando único para começar AGORA:
cd /home/ggedeveloper/gartnshine && \
tm status 15 in-progress && \
tm get 15
```

**Boa sorte! 💪**

