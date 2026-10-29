-- ============================================
-- UniCarona - Migracao v2: cadastro de motoristas, CPF, CNH e LGPD
-- ============================================
-- COMO USAR: Supabase > SQL Editor > New query > cole TUDO > Run.
-- Pode rodar mais de uma vez sem problema (nao apaga dados).
-- ============================================

-- Novos dados do usuario
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cnh_numero VARCHAR(11);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cnh_categoria VARCHAR(3);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cnh_validade DATE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS aceite_termos_em TIMESTAMP;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS versao_termos VARCHAR(10);

-- CPF e CNH unicos (cada pessoa so pode ter uma conta)
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_cpf_unico
  ON usuarios (cpf) WHERE cpf IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_cnh_unica
  ON usuarios (cnh_numero) WHERE cnh_numero IS NOT NULL;

-- Veiculos: mesmo motorista nao cadastra a mesma placa duas vezes
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS veiculos_placa_por_usuario
  ON veiculos (usuario_id, placa);

-- Fim da migracao.
