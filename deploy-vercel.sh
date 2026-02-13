#!/bin/bash
# Script interativo para fazer deploy na Vercel

set -e

cd "$(dirname "$0")"

echo "🚀 Configurando deploy na Vercel"
echo ""
echo "Este script vai:"
echo "1. Fazer o link do projeto"
echo "2. Adicionar variáveis de ambiente"
echo "3. Fazer o deploy"
echo ""

# Verificar se já está linkado
if [ -f ".vercel/project.json" ]; then
    echo "✅ Projeto já está linkado!"
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId": "[^"]*"' | cut -d'"' -f4)
    if [ -n "$PROJECT_ID" ]; then
        echo "   Project ID: $PROJECT_ID"
        echo ""
        read -p "Deseja continuar com a configuração de variáveis? (s/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            exit 0
        fi
    else
        echo "⚠️  Arquivo .vercel existe mas está incompleto. Removendo..."
        rm -rf .vercel
    fi
fi

# Passo 1: Link do projeto
if [ ! -f ".vercel/project.json" ]; then
    echo ""
    echo "📎 Passo 1: Fazendo link do projeto..."
    echo "   Quando solicitado, escolha:"
    echo "   - Scope: millers-projects-3a3ff11d"
    echo "   - Projeto: Crie um novo ou selecione existente"
    echo ""
    read -p "Pressione Enter para continuar..."
    npx vercel link
fi

# Passo 2: Adicionar variáveis de ambiente
echo ""
echo "🔐 Passo 2: Adicionando variáveis de ambiente..."
echo ""

# Ler valores do .env se existir
if [ -f ".env" ]; then
    SUPABASE_URL=$(grep "REACT_APP_SUPABASE_URL=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    SUPABASE_ANON_KEY=$(grep "REACT_APP_SUPABASE_ANON_KEY=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    GEMINI_API_KEY=$(grep "GEMINI_API_KEY=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    
    echo "Valores encontrados no .env:"
    [ -n "$SUPABASE_URL" ] && echo "  ✅ REACT_APP_SUPABASE_URL"
    [ -n "$SUPABASE_ANON_KEY" ] && echo "  ✅ REACT_APP_SUPABASE_ANON_KEY"
    [ -n "$GEMINI_API_KEY" ] && echo "  ✅ GEMINI_API_KEY"
    echo ""
else
    echo "⚠️  Arquivo .env não encontrado. Você precisará inserir os valores manualmente."
    read -p "REACT_APP_SUPABASE_URL: " SUPABASE_URL
    read -p "REACT_APP_SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
    read -p "GEMINI_API_KEY: " GEMINI_API_KEY
fi

# Adicionar variáveis para production
echo "Adicionando variáveis para PRODUCTION..."
[ -n "$SUPABASE_URL" ] && echo "$SUPABASE_URL" | npx vercel env add REACT_APP_SUPABASE_URL production
[ -n "$SUPABASE_ANON_KEY" ] && echo "$SUPABASE_ANON_KEY" | npx vercel env add REACT_APP_SUPABASE_ANON_KEY production
[ -n "$GEMINI_API_KEY" ] && echo "$GEMINI_API_KEY" | npx vercel env add GEMINI_API_KEY production

echo ""
echo "Adicionando variáveis para PREVIEW..."
[ -n "$SUPABASE_URL" ] && echo "$SUPABASE_URL" | npx vercel env add REACT_APP_SUPABASE_URL preview
[ -n "$SUPABASE_ANON_KEY" ] && echo "$SUPABASE_ANON_KEY" | npx vercel env add REACT_APP_SUPABASE_ANON_KEY preview
[ -n "$GEMINI_API_KEY" ] && echo "$GEMINI_API_KEY" | npx vercel env add GEMINI_API_KEY preview

echo ""
echo "Adicionando variáveis para DEVELOPMENT..."
[ -n "$SUPABASE_URL" ] && echo "$SUPABASE_URL" | npx vercel env add REACT_APP_SUPABASE_URL development
[ -n "$SUPABASE_ANON_KEY" ] && echo "$SUPABASE_ANON_KEY" | npx vercel env add REACT_APP_SUPABASE_ANON_KEY development
[ -n "$GEMINI_API_KEY" ] && echo "$GEMINI_API_KEY" | npx vercel env add GEMINI_API_KEY development

echo ""
echo "✅ Variáveis de ambiente configuradas!"
echo ""

# Passo 3: Deploy
echo "🚀 Passo 3: Fazendo deploy..."
echo ""
read -p "Deseja fazer o deploy agora? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo "Fazendo deploy de produção..."
    npx vercel --prod
else
    echo ""
    echo "Para fazer o deploy depois, execute:"
    echo "  npx vercel        # preview"
    echo "  npx vercel --prod # production"
fi

echo ""
echo "✅ Configuração concluída!"
