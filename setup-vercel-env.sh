#!/bin/bash
# Script para configurar variáveis de ambiente na Vercel
# Execute este script após fazer o link do projeto com: npx vercel link

echo "Configurando variáveis de ambiente na Vercel..."
echo ""

# Valores do .env
SUPABASE_URL="https://rjheexmcomsqgvmtgzly.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaGVleG1jb21zcWd2bXRnemx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjU4NDMsImV4cCI6MjA4MDkwMTg0M30.n0Y4KnLYkqdTo5W9anBuenxzbPCx4CwQxSYOfvSJ2WQ"
GEMINI_API_KEY="AIzaSyCGvTTOludq13GeXLdw-43CirPY-rPntao"

echo "Adicionando REACT_APP_SUPABASE_URL..."
echo "$SUPABASE_URL" | npx vercel env add REACT_APP_SUPABASE_URL production

echo ""
echo "Adicionando REACT_APP_SUPABASE_ANON_KEY..."
echo "$SUPABASE_ANON_KEY" | npx vercel env add REACT_APP_SUPABASE_ANON_KEY production

echo ""
echo "Adicionando GEMINI_API_KEY..."
echo "$GEMINI_API_KEY" | npx vercel env add GEMINI_API_KEY production

echo ""
echo "✅ Variáveis de ambiente configuradas!"
echo ""
echo "Para adicionar também em preview e development, execute:"
echo "  npx vercel env add REACT_APP_SUPABASE_URL preview"
echo "  npx vercel env add REACT_APP_SUPABASE_ANON_KEY preview"
echo "  npx vercel env add GEMINI_API_KEY preview"
echo ""
echo "  npx vercel env add REACT_APP_SUPABASE_URL development"
echo "  npx vercel env add REACT_APP_SUPABASE_ANON_KEY development"
echo "  npx vercel env add GEMINI_API_KEY development"
