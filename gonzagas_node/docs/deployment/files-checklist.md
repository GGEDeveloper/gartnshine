# 🚀 Arquivos para Deploy - Gonzaga's Art & Shine

## 📋 **Arquivos que Faltam em Produção**

### 📱 **CSS Mobile e Componentes (NOVOS)**
```
public/css/admin-mobile.css          ← CRÍTICO: CSS mobile para admin
public/css/admin-tables-mobile.css   ← CRÍTICO: CSS tabelas mobile  
public/css/components.css            ← CRÍTICO: CSS componentizado
public/css/notifications.css         ← CRÍTICO: CSS notificações
```

### 🔧 **JavaScript Modular (NOVOS)**
```
public/js/config.js                  ← CRÍTICO: Configuração global
public/js/main.js                    ← CRÍTICO: Module manager
public/js/notifications.js           ← CRÍTICO: Sistema notificações
public/js/modules/utils.js           ← CRÍTICO: Módulo utilitários
public/js/modules/navigation.js      ← CRÍTICO: Módulo navegação
public/js/modules/ui.js              ← CRÍTICO: Módulo UI
public/js/modules/carousel.js        ← CRÍTICO: Módulo carrossel
```

### 📄 **Templates Atualizados**
```
views/collections.ejs                ← ATUALIZADO: Galeria limpa
views/admin/layouts/*.ejs            ← ATUALIZADO: Inclui CSS mobile
```

## 🔧 **Comandos para Upload via cPanel/FTP**

### **1. Via cPanel File Manager:**
1. Navegar para `public_html/`
2. Criar pasta `css/` se não existir
3. Upload dos arquivos CSS:
   - `admin-mobile.css`
   - `admin-tables-mobile.css` 
   - `components.css`
   - `notifications.css`
4. Criar pasta `js/modules/` se não existir
5. Upload dos arquivos JS:
   - `config.js`
   - `main.js` 
   - `notifications.js`
   - `modules/utils.js`
   - `modules/navigation.js`
   - `modules/ui.js`
   - `modules/carousel.js`

### **2. Via FTP/SFTP:**
```bash
# Conectar ao servidor
sftp user@artnshine.pt

# Navegar para diretório público
cd public_html/

# Upload CSS
cd css/
put admin-mobile.css
put admin-tables-mobile.css
put components.css
put notifications.css

# Upload JS
cd ../js/
put config.js
put main.js
put notifications.js

# Upload módulos JS
cd modules/
put utils.js
put navigation.js
put ui.js
put carousel.js
```

### **3. Verificar Permissões:**
```bash
# Garantir que arquivos têm permissões corretas
chmod 644 *.css
chmod 644 *.js
```

## ✅ **Checklist Pós-Deploy**

### **Testar URLs Manualmente:**
- ✅ https://artnshine.pt/css/admin-mobile.css
- ✅ https://artnshine.pt/css/admin-tables-mobile.css  
- ✅ https://artnshine.pt/css/components.css
- ✅ https://artnshine.pt/css/notifications.css
- ✅ https://artnshine.pt/js/config.js
- ✅ https://artnshine.pt/js/main.js
- ✅ https://artnshine.pt/js/notifications.js
- ✅ https://artnshine.pt/js/modules/utils.js
- ✅ https://artnshine.pt/js/modules/navigation.js
- ✅ https://artnshine.pt/js/modules/ui.js
- ✅ https://artnshine.pt/js/modules/carousel.js

### **Testar Funcionalidades:**
- ✅ Admin área mobile responsiva
- ✅ Tabelas mobile funcionando
- ✅ Sistema modular carregando
- ✅ Notificações funcionando
- ✅ Galeria limpa funcionando

## 🚨 **Troubleshooting**

### **Se arquivos ainda retornam 404:**
1. Verificar estrutura de pastas no servidor
2. Verificar permissões dos arquivos (644)
3. Verificar se o `.htaccess` não está bloqueando
4. Clear cache do servidor se houver
5. Verificar logs do servidor para erros

### **Se MIME type ainda incorreto:**
Adicionar ao `.htaccess`:
```apache
AddType text/css .css
AddType application/javascript .js
```

---

**🎯 Prioridade: ALTA** - Estes arquivos são essenciais para o funcionamento da arquitetura modular implementada. 