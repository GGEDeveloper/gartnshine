# 🔐 CREDENCIAIS DE ADMINISTRADOR

## 🎯 Acesso Principal (Recomendado)

### **Gonzaga - Acesso Principal**
- **URL**: `http://localhost:3000/admin/login`
- **Email**: `gonzaga@artnshine.pt`
- **Senha**: `covil`
- **Nome**: Gonzaga
- **Role**: admin
- **Status**: ✅ Ativo

---

## 👥 Outros Acessos Disponíveis

### 1. **Admin Original**
- **Email**: `admin@gonzagas.com`
- **Senha**: `admin123` (padrão do sistema)
- **Nome**: Administrador
- **Role**: admin

### 2. **Gonzaga (Gmail)**
- **Email**: `g.art.shine@gmail.com`
- **Senha**: `covil`
- **Nome**: Gonzaga
- **Role**: admin

### 3. **Mike**
- **Email**: `miguelmelo70@gmail.com`
- **Senha**: `admin123` (padrão do sistema)
- **Nome**: mike
- **Role**: admin

---

## 🛠️ Como Acessar

1. **Inicie o servidor** (se não estiver rodando):
   ```bash
   cd /home/pixie/final-boss/GGE/gartnshine/gonzagas_node
   npm start
   ```

2. **Acesse a URL**:
   ```
   http://localhost:3000/admin/login
   ```

3. **Use as credenciais principais**:
   - Email: `gonzaga@artnshine.pt`
   - Senha: `covil`

---

## 🔧 Funcionalidades Disponíveis

Após o login, você terá acesso a:

- 📊 **Dashboard** - Visão geral do sistema
- 📦 **Produtos** - Gestão completa de produtos
- 🏷️ **Famílias** - Categorias de produtos
- 📋 **Inventário** - Controle de estoque
- ⚙️ **Configurações** - Incluindo a nova função de ocultar preços
- 💾 **Checkpoints** - Sistema de backup/restore

---

## 🎨 Nova Funcionalidade: Preços "Sob Consulta"

Em **Configurações** (`/admin/settings`), você pode:
- Ativar/desativar a exibição de preços no catálogo
- Quando ativado: todos os produtos mostram "Preço sob consulta"
- Aplicação instantânea, sem necessidade de reiniciar

---

## 🚨 Problemas de Login?

Se não conseguir fazer login:

1. **Verifique o servidor**:
   ```bash
   curl http://localhost:3000
   ```

2. **Reset da senha**:
   ```bash
   node scripts/create-gonzaga-admin.js
   ```

3. **Verifique o banco**:
   ```bash
   mysql -u root -proot gonzagas_local -e "SELECT id, name, email, role FROM users WHERE role='admin';"
   ``` 