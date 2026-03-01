-- Garantir que app_users tenha a coluna birthdate (para data de nascimento do aluno).
-- Executar no Supabase SQL Editor se a coluna ainda não existir.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'app_users' AND column_name = 'birthdate'
  ) THEN
    ALTER TABLE app_users ADD COLUMN birthdate date;
  END IF;
END $$;
