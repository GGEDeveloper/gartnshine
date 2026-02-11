# 📁 Dev Info - Gonzaga's Art & Shine

Pasta para acumular informação, backups e documentação do desenvolvimento.

## Estrutura

```
_dev-info/
├── README.md                      # Este ficheiro
├── db-backups/                    # Dumps SQL da base de dados
├── schema/                        # Schema extraído para análise
├── docs/                          # Documentação de desenvolvimento
│   ├── ARQUITETURA_TECNICA.md     # Arquitetura, middleware, layouts
│   ├── ADMIN_FRONTEND_INTERLIGACAO.md  # Como admin liga ao frontend
│   ├── ROTAS_COMPLETAS.md         # Mapa completo de rotas
│   ├── FUNCIONALIDADES.md         # Lista de funcionalidades
│   ├── MODELOS_E_DADOS.md        # Modelos, métodos, relações
│   ├── SCHEMA_ATUAL.md            # Tabelas da BD (resumo)
│   ├── CONTEXTO_PROJETO.md        # Ambiente, stack
│   └── ISSUES_CONHECIDOS.md       # Bugs e pontos de atenção
├── deploy/                        # Info sobre deploy
└── scripts/
    └── backup-db.js               # Script de backup
```

## Informação do Projeto

- **Ambiente:** WSL em Windows 10
- **Deploy:** dominios.pt
- **CI/CD:** GitHub
- **DB:** MariaDB/MySQL (configuração em gonzagas_node/.env)

## Como fazer backup

```bash
# A partir da raiz do projeto (usa .env na raiz ou gonzagas_node)
node _dev-info/scripts/backup-db.js
```

**Nota:** O script usa as credenciais do `.env` (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).  
O backup actual foi da DB em **artnshine.pt** (artnshin_gonzagas_db).

## Conteúdo

- **db-backups/** - Dumps completos (estrutura + dados)
- **schema/** - Apenas estrutura (CREATE TABLE) para análise
- **docs/** - Documentação de desenvolvimento
- **deploy/** - Info sobre deploy dominios.pt / GitHub
