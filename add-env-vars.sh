#!/bin/bash
# Script para adicionar variáveis de ambiente após o link

set -e

cd "$(dirname "$0")"

if [ ! -f ".vercel/project.json" ]; then
    echo "❌ Erro: Projeto não está linkado!"
    echo "Execute primeiro: npx vercel link"
    exit 1
fi

echo "🔐 Adicionando variáveis de ambiente na Vercel..."
echo ""

# Ler valores do .env
if [ ! -f ".env" ]; then
    echo "❌ Arquivo .env não encontrado!"
    exit 1
fi

SUPABASE_URL=$(grep "^REACT_APP_SUPABASE_URL=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
SUPABASE_ANON_KEY=$(grep "^REACT_APP_SUPABASE_ANON_KEY=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
GEMINI_API_KEY=$(grep "^GEMINI_API_KEY=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ] || [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ Erro: Algumas variáveis não foram encontradas no .env"
    exit 1
fi

echo "✅ Valores encontrados no .env"
echo ""

# Função para adicionar variável
add_env_var() {
    local var_name=$1
    local var_value=$2
    local environment=$3
    
    echo "Adicionando $var_name para $environment..."
    echo "$var_value" | npx vercel env add "$var_name" "$environment" 2>&1 | grep -v "password" || true
}

# Adicionar para todos os ambientes
for env in production preview development; do
    echo "📦 Configurando ambiente: $env"
    add_env_var "REACT_APP_SUPABASE_URL" "$SUPABASE_URL" "$env"
    add_env_var "REACT_APP_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY" "$env"
    add_env_var "GEMINI_API_KEY" "$GEMINI_API_KEY" "$env"
    echo ""
done

echo "✅ Todas as variáveis de ambiente foram configuradas!"
echo ""
echo "Agora você pode fazer o deploy:"
echo "  npx vercel        # preview"
echo "  npx vercel --prod # production"
