-- Migração: permitir reutilização de e-mail quando o usuário (aluno) foi excluído (soft delete).
-- - E-mail permanece único entre usuários ativos (deleted = false ou null).
-- - Quando um aluno é excluído, app_users.deleted = true; o mesmo e-mail pode ser usado em novo cadastro.
--
-- Executar no Supabase SQL Editor ou no cliente PostgreSQL.

-- 1. Garantir coluna deleted em app_users (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'app_users' AND column_name = 'deleted'
  ) THEN
    ALTER TABLE app_users ADD COLUMN deleted boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- 2. Remover constraint única antiga em email (nome pode variar; tenta os mais comuns)
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_email_key;
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_email_unique;
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS unique_app_users_email;

-- 3. Índice único parcial: só considera linhas onde deleted não é true
-- Assim, apenas um registro ativo pode ter determinado e-mail; deletados não entram no índice.
CREATE UNIQUE INDEX IF NOT EXISTS unique_app_users_email_active
  ON app_users (email)
  WHERE (deleted IS NOT TRUE);
