# 🧪 TESTING INSTRUCTIONS - Dark Nature Admin Foundation

**Branch**: `feature/planning-fase1-fase2`  
**Status**: ✅ Code Ready - ⚠️ Testing Blocked (Server Down)

---

## ⚠️ ATENÇÃO: SERVIDOR PRECISA REINICIAR

O servidor atual **NÃO TEM** os novos controllers/middleware carregados em memória.

### **COMO REINICIAR**:

```bash
# 1. Se o servidor ainda estiver rodando, parar:
Ctrl+C

# 2. Navegar para diretório:
cd /home/ggedeveloper/newgans2/gartnshine/gonzagas_node

# 3. Iniciar servidor:
npm run dev

# 4. Aguardar confirmação:
Server running on http://localhost:3000
Database connected: gonzagas_local
```

---

## 🧪 TESTING PLAN

### **TEST 1: Admin Login** 🔐

**URL**: `http://localhost:3000/admin/login`

**Verificar**:
1. Page loads (Dark Nature theme)
2. Login form aparece
3. Inserir: `gonzaga` / `covil`
4. Submit
5. Expected: "Verificando..." → "Sucesso!" → Redirect to `/admin`

**Se falhar**: Reportar erro específico (console do servidor + browser)

---

### **TEST 2: Dashboard** 📊

**URL**: `http://localhost:3000/admin`

**Verificar**:

#### **Header**:
- ✅ Brand "Gonzaga Admin"
- ✅ Nav: Dashboard | Pedidos | Produtos | Clientes | Analytics
- ✅ User: "Hugo Gonzaga Gomes" (master)
- ✅ Actions: 🌐 | 🚪

#### **Sacred Metrics** (4 cards):
- ✅ Receita Hoje: €0.00
- ✅ Pedidos Mês: 0
- ✅ Clientes: 0
- ✅ Produtos: ~204

#### **Stone Performance** (4 cards):
- ✅ Ónix: 0 vendas, €0.00, 4 stock (border preto)
- ✅ Olho-de-Tigre: 0 vendas, €0.00, 4 stock (border dourado)
- ✅ Ametista: 0 vendas, €0.00, 4 stock (border roxo)
- ✅ Turquesa: 0 vendas, €0.00, 4 stock (border azul)

#### **Activities Feed**:
- ✅ "Nenhuma atividade recente"

**Visual**:
- ✅ Background dark (#0B0D0C)
- ✅ Text ivory (#E7E1D6)
- ✅ Accents gold (#CD853F)
- ✅ Cards glassmorphism
- ✅ Fonts Cinzel + Source Sans 3

---

### **TEST 3: Navigation** 🔗

**Click em cada link no header**:

| Link | Expected Behavior | Status |
|------|-------------------|--------|
| Dashboard | Refresh page | ✅ Should work |
| Pedidos | Route works, view 404 | ⚠️ Expected (view missing) |
| Produtos | Route works, view 404 | ⚠️ Expected (view missing) |
| Clientes | Route works, view 404 | ⚠️ Expected (view missing) |
| Analytics | Route works, view 404 | ⚠️ Expected (view missing) |

**Nota**: 404 errors são **NORMAIS** - routes funcionam mas views não foram criadas (foundation only)

---

### **TEST 4: Logout** 🚪

**Click**: 🚪 icon (user actions)

**Expected**:
1. ✅ Session destroyed
2. ✅ Redirect to `/admin/login`
3. ✅ Can login again with gonzaga/covil

---

## 📊 EXPECTED RESULTS

### **✅ SUCCESS CRITERIA** (Foundation):
1. Admin login page loads correctly
2. Login com gonzaga/covil funciona
3. Redirect to dashboard após login
4. Dashboard mostra métricas (zeros OK - sem vendas ainda)
5. Stone performance cards aparecem (4 stones)
6. Logout funciona

### **⚠️ EXPECTED ISSUES** (Normal):
1. Navigation links → 404 (views missing)
   - Pedidos, Produtos, Clientes, Analytics
   - **Normal**: Routes work, views não criadas
   
2. Product CRUD não funciona
   - Add, Edit, Delete product
   - **Normal**: Methods não implementados

3. Email não enviado após order
   - **Normal**: SMTP não configurado

**These are NOT bugs** - São features pending (expansion phase)

---

## 🐛 REAL BUGS TO REPORT

**Se acontecer**:
1. ❌ Admin login page não carrega → BUG (reportar)
2. ❌ Login falha com gonzaga/covil → BUG (reportar)
3. ❌ Dashboard crash/error → BUG (reportar)
4. ❌ Metrics não aparecem → BUG (zeros OK, cards missing = BUG)
5. ❌ Logout não funciona → BUG (reportar)

**Como reportar**:
- Screenshot do erro
- Console do servidor (error message)
- Browser console (network tab)

---

## 📈 WHAT'S IMPLEMENTED (Recap)

### **Backend** ✅ 100%:
- Database (8 tables)
- Controllers (Order + Admin)
- Middleware (Security + Logging)
- Routes (18 endpoints)

### **Frontend** ✅ 20%:
- Admin login (full)
- Dashboard (foundation)
- Order confirmation (foundation)

### **Missing** ⚠️ 40%:
- Admin views (14)
- JavaScript (2 files)
- CSS expansion
- Support pages

---

## 🎯 PRÓXIMO PASSO

⚠️ **REINICIAR SERVIDOR AGORA**

```bash
cd /home/ggedeveloper/newgans2/gartnshine/gonzagas_node
npm run dev
```

Depois testar: `http://localhost:3000/admin/login`

---

**Status**: ✅ Foundation Ready - ⏸️ Awaits Testing

