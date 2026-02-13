# Deploy na Vercel - Guia Rápido

## Opção 1: Script Automatizado (Recomendado)

Execute o script interativo:

```bash
./deploy-vercel.sh
```

O script vai guiá-lo através de:
1. Link do projeto
2. Configuração de variáveis de ambiente
3. Deploy

## Opção 2: Manual

### 1. Fazer link do projeto

```bash
npx vercel link
```

Quando solicitado:
- Escolha o scope: `millers-projects-3a3ff11d`
- Crie um novo projeto ou selecione um existente

### 2. Adicionar variáveis de ambiente

```bash
# Production
echo "https://rjheexmcomsqgvmtgzly.supabase.co" | npx vercel env add REACT_APP_SUPABASE_URL production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | npx vercel env add REACT_APP_SUPABASE_ANON_KEY production
echo "AIzaSyCGvTTOludq13GeXLdw-43CirPY-rPntao" | npx vercel env add GEMINI_API_KEY production

# Preview (opcional)
echo "https://rjheexmcomsqgvmtgzly.supabase.co" | npx vercel env add REACT_APP_SUPABASE_URL preview
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | npx vercel env add REACT_APP_SUPABASE_ANON_KEY preview
echo "AIzaSyCGvTTOludq13GeXLdw-43CirPY-rPntao" | npx vercel env add GEMINI_API_KEY preview

# Development (opcional)
echo "https://rjheexmcomsqgvmtgzly.supabase.co" | npx vercel env add REACT_APP_SUPABASE_URL development
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | npx vercel env add REACT_APP_SUPABASE_ANON_KEY development
echo "AIzaSyCGvTTOludq13GeXLdw-43CirPY-rPntao" | npx vercel env add GEMINI_API_KEY development
```

**Nota:** Substitua `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` pelo valor completo da chave do seu arquivo `.env`.

### 3. Fazer deploy

```bash
# Preview
npx vercel

# Production
npx vercel --prod
```

## Opção 3: Via Dashboard

1. Acesse https://vercel.com/dashboard
2. Crie um novo projeto ou selecione existente
3. Configure o Root Directory como `packages/institution`
4. Vá em Settings → Environment Variables e adicione:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
5. Faça o deploy

