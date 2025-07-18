# 🎨 Gonzaga's Art & Shine - Sistema de Catálogo Online

> **Catálogo digital profissional para joalharia em prata 925 com inspiração Bali e tendências boho**

## 🌟 **Visão Geral**

Sistema web completo desenvolvido especificamente para **Gonzaga's Art & Shine**, permitindo gestão completa de inventário e apresentação elegante de produtos de joalharia. O sistema combina um catálogo público protegido por password com uma área administrativa completa para gestão de produtos, stock e preços.

### 🔗 **Links Oficiais**
- **Instagram:** [https://www.instagram.com/gonzagaartnshine/](https://www.instagram.com/gonzagaartnshine/)
- **Facebook:** [https://www.facebook.com/profile.php?id=61573519807731](https://www.facebook.com/profile.php?id=61573519807731)

## ✨ **Características Principais**

### 🛍️ **Catálogo Público**
- **Protecção por password** (password: `0009`)
- **Design responsivo** adaptado para mobile e desktop
- **Filtros avançados** por categoria, preço, disponibilidade
- **Galeria de imagens** com zoom e navegação suave
- **Sistema "Preços sob consulta"** - toggle para ocultar/mostrar preços
- **Tema escuro** com nuances psicadélicas e geométricas

### 🔐 **Área Administrativa**
- **Gestão completa de produtos** (CRUD com upload de imagens)
- **Controlo de stock** com histórico de movimentos
- **Sistema de preços** com histórico de alterações
- **Gestão de famílias** de produtos (categorias)
- **Sistema de checkpoints** para backup/restore da base de dados
- **Dashboard com estatísticas** em tempo real
- **Sistema de auditoria** completo

### 🎯 **Funcionalidades Especiais**
- **Sistema de notificações popup** elegante (4 tipos: success, error, warning, info)
- **Gestão automática de media** com redimensionamento
- **Filtros dinâmicos** em tempo real
- **Paginação inteligente**
- **Sistema de pesquisa** avançado
- **Responsive design** para todos os dispositivos

## 🏗️ **Arquitectura Técnica**

### **Stack Tecnológico**
- **Backend:** Node.js + Express.js
- **Frontend:** EJS (templating) + Bootstrap 5 + CSS3 custom
- **Base de Dados:** MariaDB/MySQL
- **Gestão de Sessões:** express-session + connect-flash
- **Segurança:** Helmet.js + bcrypt + CSRF protection
- **Media:** Multer para upload de ficheiros
- **Processo:** PM2 para gestão em produção

### 🔧 **Arquitetura Modular (Nova!)**

#### **Sistema de Configuração Global**
```javascript
// public/js/config.js
- Detecção automática de ambiente
- Debug flags configuráveis
- Feature toggles
- Controle de timeouts
```

#### **Módulos JavaScript Organizados**
```
public/js/modules/
├── utils.js        - Utilitários (debounce, throttle, DOM)
├── navigation.js   - Sistema de navegação e scroll
├── ui.js          - Componentes UI (loading, lightbox)
└── carousel.js    - Sistema de carrosséis
```

#### **Module Manager**
```javascript
// public/js/main.js
- Inicialização sequencial segura
- Controle de dependências
- Tratamento de erros
- Sistema de logs debug
```

#### **CSS Componentizado**
```css
/* public/css/components.css */
- Loading overlays reutilizáveis
- Botões padronizados
- Cards de produtos
- Sistema grid responsivo
```

### 📱 **Interface Mobile Otimizada**

#### **Admin Mobile-First**
```css
/* public/css/admin-mobile.css */
- Sidebar responsiva com toggle
- Menu hamburger funcional
- Navegação touch otimizada
- Layout adaptativo
```

#### **Tabelas Responsivas**
```css
/* public/css/admin-tables-mobile.css */
- Scroll horizontal inteligente
- Cards responsivos para dados
- Botões touch-friendly
```

### **Estrutura do Projecto**
```
gonzagas_node/
├── config/              # Configurações (DB, app settings)
├── controllers/         # Lógica de negócio
├── models/             # Modelos de dados
├── views/              # Templates EJS
│   ├── admin/          # Área administrativa
│   ├── layouts/        # Layouts base
│   └── partials/       # Componentes reutilizáveis
├── public/             # Assets estáticos
│   ├── css/            # Estilos personalizados
│   ├── js/             # JavaScript frontend
│   ├── media/          # Imagens de produtos
│   └── images/         # Assets do site
├── routes/             # Definição de rotas
├── middleware/         # Middleware personalizado
├── scripts/            # Scripts de manutenção
└── sql/                # Migrações e esquemas
```

## 📊 **Base de Dados**

### **Tabelas Principais**
- **`products`** - Produtos com todas as informações
- **`product_families`** - Categorias de produtos
- **`product_price_history`** - Histórico de alterações de preços
- **`inventory_movements`** - Movimentos de stock
- **`users`** - Utilizadores administrativos
- **`site_settings`** - Configurações do sistema
- **`audit_logs`** - Log de auditoria

### **Schema Highlights**
```sql
-- Produtos com referências, preços, stock e metadata
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reference VARCHAR(50) UNIQUE,
    name VARCHAR(255),
    purchase_price DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    current_stock INT DEFAULT 0,
    family_id INT,
    style VARCHAR(50),
    material VARCHAR(100),
    is_catalog_visible BOOLEAN DEFAULT 1,
    -- ... mais campos
);

-- Sistema de preços sob consulta
CREATE TABLE site_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hide_catalog_prices BOOLEAN DEFAULT 0,
    -- ... outras configurações
);
```

## 🚀 **Instalação e Configuração**

### **Desenvolvimento Local**
    ```bash
# Clonar repositório
git clone <repository-url>
cd gonzagas_node

# Instalar dependências
    npm install

# Configurar base de dados (ver PRODUCTION_SETUP.md)
mysql -u root -p < sql/schema.sql

# Configurar ambiente (copiar de .env.example)
cp .env.example .env

# Iniciar servidor de desenvolvimento
npm start
```

### **Produção**
Ver o ficheiro detalhado **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)** para instruções completas de instalação em ambiente de produção.

## 🎯 **Credenciais de Acesso**

### **Administração**
- **URL:** `/admin`
- **Email:** gonzaga@artnshine.pt
- **Password:** covil

### **Catálogo Público**
- **URL:** `/catalog`
- **Password:** 0009

Ver **[CREDENCIAIS_ADMIN.md](./CREDENCIAIS_ADMIN.md)** para lista completa de utilizadores.

## 🔧 **Scripts Disponíveis**

    ```bash
# Desenvolvimento
npm start                    # Iniciar servidor
npm run dev                  # Servidor com nodemon

# Produção
npm run start:prod           # Iniciar com PM2

# Base de Dados
node scripts/create_production_dump.js     # Criar dump SQL
node scripts/create-gonzaga-admin.js       # Criar utilizador admin

# Manutenção
npm run backup               # Backup automático
npm run logs                 # Ver logs do sistema
```

## 📖 **Documentação Adicional**

- **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)** - Guia completo de instalação em produção
- **[SISTEMA_NOTIFICACOES.md](./SISTEMA_NOTIFICACOES.md)** - Documentação do sistema de notificações
- **[README_hide_catalog_prices.md](./README_hide_catalog_prices.md)** - Sistema de preços sob consulta
- **[CREDENCIAIS_ADMIN.md](./CREDENCIAIS_ADMIN.md)** - Lista de utilizadores e credenciais

## 🛠️ **Desenvolvido Para**

### **Especificações do Cliente**
- **Marca:** Gonzaga's Art & Shine
- **Operações:** Venda de joalharia, principalmente prata 925
- **Estilo:** Tendências Bali e boho
- **Hosting:** cPanel hosting
- **Tema:** Escuro, baseado na natureza/floresta, com nuances psicadélicas e geométricas

### **Requisitos Técnicos Implementados**
- ✅ Sistema modular e escalável
- ✅ Base de dados MariaDB optimizada
- ✅ Sistema de checkpoints para backup/restore
- ✅ Integração com media files existentes
- ✅ Painel admin com controlo total
- ✅ Catalogo dinâmico separado da gestão
- ✅ Design responsivo e moderno
- ✅ Sistema de segurança robusto

## 📱 **Funcionalidades Visuais**

### **Design System**
- **Paleta de cores:** Tons escuros com dourado para acentos
- **Tipografia:** Poppins (headings) + Inter (body)
- **Ícones:** FontAwesome 6
- **Animações:** Transições suaves CSS3
- **Layout:** CSS Grid + Flexbox
- **Responsividade:** Mobile-first approach

### **Componentes Especiais**
- Cards de produto com hover effects
- Sistema de notificações popup animado
- Filtros dinâmicos com feedback visual
- Sidebar administrativa com navegação intuitiva
- Upload de imagens com preview e progresso
- Tabelas responsivas com paginação

## 🔐 **Segurança Implementada**

- **Autenticação:** bcrypt para passwords
- **Autorização:** Sistema de roles (admin)
- **CSRF Protection:** Tokens em formulários
- **Headers de Segurança:** Helmet.js configurado
- **Sanitização:** Validação e escape de inputs
- **Rate Limiting:** Protecção contra spam
- **Session Security:** Configurações seguras

## 📊 **Performance**

- **Optimizações de imagem** automáticas
- **Cache de assets** estáticos
- **Lazy loading** de imagens
- **Minificação** de CSS/JS
- **Database indexing** optimizado
- **Memory management** com PM2

## 🤝 **Contribuição e Manutenção**

### **Estrutura de Commits**
```
feat: nova funcionalidade
fix: correção de bug  
docs: documentação
style: formatação
refactor: refactoring
test: testes
chore: manutenção
```

### **Workflow de Desenvolvimento**
1. **Desenvolvimento local** com live reload
2. **Testing** em ambiente de staging
3. **Deploy** via PM2 em produção
4. **Monitoring** contínuo via logs

## 📞 **Suporte e Contacto**

Para questões técnicas, melhorias ou suporte:
- **Issues:** [GitHub Issues](link-to-issues)
- **Documentação:** Ver pasta `/docs`
- **Email:** [contacto técnico]

---

## 🏆 **Status do Projecto**

**✅ COMPLETO E FUNCIONAL**

- ✅ Sistema de catálogo público com protecção
- ✅ Área administrativa completa  
- ✅ Gestão de produtos, stock e preços
- ✅ Sistema de notificações elegante
- ✅ Funcionalidade "preços sob consulta"
- ✅ Design responsivo e moderno
- ✅ Segurança e performance optimizados
- ✅ Documentação completa
- ✅ Pronto para produção

---

**🎨 Gonzaga's Art & Shine** - *Catálogo Digital Profissional*  
*Sistema desenvolvido especificamente para joalharia em prata 925 com inspiração Bali/Boho*

**Tech Stack:** Node.js + Express + MariaDB + Bootstrap 5 + EJS  
**Deploy Ready:** ✅ cPanel + PM2 + Nginx/Apache
