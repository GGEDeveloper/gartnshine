#!/bin/bash

# Carrega as variáveis de ambiente do arquivo .env
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "$ROOT_DIR/.env" ]; then
    source "$ROOT_DIR/.env"
fi

# Verifica se as variáveis necessárias estão definidas
if [ -z "$DB_ROOT_USER" ] || [ -z "$DB_ROOT_PASSWORD" ]; then
    echo "Erro: DB_ROOT_USER ou DB_ROOT_PASSWORD não definidos no arquivo .env"
    exit 1
fi

# Arquivo SQL a ser executado
SQL_FILE="$ROOT_DIR/sql/setup_database.sql"

# Verifica se o arquivo SQL existe
if [ ! -f "$SQL_FILE" ]; then
    echo "Erro: Arquivo SQL não encontrado em $SQL_FILE"
    exit 1
fi

# Comando para executar o SQL no MySQL/MariaDB
echo "Executando script SQL..."
if ! mysql -u"$DB_ROOT_USER" -p"$DB_ROOT_PASSWORD" < "$SQL_FILE"; then
    echo "Erro ao executar o script SQL"
    exit 1
fi

echo "✅ Banco de dados configurado com sucesso!"
