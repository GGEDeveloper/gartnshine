#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🗄️  EXECUTANDO SQL SCRIPTS - FASES 5 & 6"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📦 FASE 5: Media Management Schema..."
mysql -u root gartnshine < sql/media_management_enhanced.sql 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Media Management schema criado com sucesso!"
else
    echo "❌ Erro ao criar Media Management schema"
    echo "💡 Tenta executar manualmente: mysql -u root -p gartnshine < sql/media_management_enhanced.sql"
fi

echo ""
echo "📊 FASE 6: Analytics Schema..."
mysql -u root gartnshine < sql/analytics_schema.sql 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Analytics schema criado com sucesso!"
else
    echo "❌ Erro ao criar Analytics schema"
    echo "💡 Tenta executar manualmente: mysql -u root -p gartnshine < sql/analytics_schema.sql"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ SQL SCRIPTS EXECUTADOS!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Próximo passo: Testar no browser!"
echo "URL: http://localhost:3000/admin/media/library"
