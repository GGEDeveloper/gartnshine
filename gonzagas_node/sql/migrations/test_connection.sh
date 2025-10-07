#!/bin/bash

echo "🔌 Testing database connection..."
echo ""
echo "Trying different credentials:"
echo ""

# Try 1: root with password 'root'
echo "1. root/root..."
mysql -u root -proot gonzagas_local -e "SELECT 1" &>/dev/null && echo "✅ SUCCESS: root/root" && exit 0

# Try 2: root with no password
echo "2. root/(no password)..."
mysql -u root gonzagas_local -e "SELECT 1" &>/dev/null && echo "✅ SUCCESS: root/(no password)" && exit 0

# Try 3: Check .env file
echo "3. Checking environment variables..."
if [ -f "../.env" ]; then
    source ../.env 2>/dev/null
    mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT 1" &>/dev/null && echo "✅ SUCCESS: Using .env credentials" && exit 0
fi

echo "❌ Could not connect to database"
echo ""
echo "Please run migrations manually when database is available:"
echo "  mysql -u [user] -p [database] < 002_create_media_tables.sql"
echo "  mysql -u [user] -p [database] < 003_extend_product_images.sql"
exit 1

