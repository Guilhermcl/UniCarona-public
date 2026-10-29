import pool from './database.js';

// Cria todas as tabelas no Supabase. Rode com: npm run migrate
// (Alternativa mais simples: colar o arquivo supabase_setup.sql no SQL Editor do Supabase.)
const createTables = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(120) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      senha VARCHAR(255) NOT NULL,
      cpf VARCHAR(14),
      telefone VARCHAR(20),
      e_motorista BOOLEAN DEFAULT FALSE,
      avaliacao_media NUMERIC(3,2) DEFAULT 0,
      total_avaliacoes INTEGER DEFAULT 0,
      criado_em TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS veiculos (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      placa VARCHAR(10) NOT NULL,
      modelo VARCHAR(80) NOT NULL,
      cor VARCHAR(40),
      ano INTEGER,
      capacidade INTEGER DEFAULT 4,
      criado_em TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS caronas (
      id SERIAL PRIMARY KEY,
      motorista_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      veiculo_id INTEGER REFERENCES veiculos(id) ON DELETE SET NULL,
      origem VARCHAR(200) NOT NULL,
      destino VARCHAR(200) NOT NULL,
      origem_lat NUMERIC(10,7),
      origem_lng NUMERIC(10,7),
      destino_lat NUMERIC(10,7),
      destino_lng NUMERIC(10,7),
      data_hora TIMESTAMP NOT NULL,
      vagas_total INTEGER NOT NULL,
      vagas_disponiveis INTEGER NOT NULL,
      valor NUMERIC(8,2) DEFAULT 0,
      observacoes TEXT,
      status VARCHAR(20) DEFAULT 'ativa',
      criado_em TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS solicitacoes (
      id SERIAL PRIMARY KEY,
      carona_id INTEGER NOT NULL REFERENCES caronas(id) ON DELETE CASCADE,
      passageiro_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      status VARCHAR(20) DEFAULT 'pendente',
      criado_em TIMESTAMP DEFAULT NOW(),
      UNIQUE (carona_id, passageiro_id)
    );

    CREATE TABLE IF NOT EXISTS avaliacoes (
      id SERIAL PRIMARY KEY,
      carona_id INTEGER NOT NULL REFERENCES caronas(id) ON DELETE CASCADE,
      avaliador_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      avaliado_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
      comentario TEXT,
      criado_em TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS mensagens (
      id SERIAL PRIMARY KEY,
      carona_id INTEGER NOT NULL REFERENCES caronas(id) ON DELETE CASCADE,
      remetente_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      destinatario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      conteudo TEXT NOT NULL,
      lida BOOLEAN DEFAULT FALSE,
      criado_em TIMESTAMP DEFAULT NOW()
    );

    -- v2: motoristas, CPF, CNH e LGPD

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

  `;

  try {
    await pool.query(sql);
    console.log('✅ Tabelas criadas/verificadas com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao criar tabelas:', err);
  } finally {
    await pool.end();
  }
};

createTables();
