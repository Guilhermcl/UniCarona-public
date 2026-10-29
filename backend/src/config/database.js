import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Colunas DATE voltam como texto 'AAAA-MM-DD' (evita erro de fuso horario).
pg.types.setTypeParser(1082, (valor) => valor);

// Conexão com o Supabase via connection string (DATABASE_URL).
// O Supabase exige SSL. A opção rejectUnauthorized:false evita
// erro de certificado em ambiente de desenvolvimento.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
});

pool.on('connect', () => {
  console.log('🐘 Conectado ao Supabase (PostgreSQL)');
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do PostgreSQL:', err);
});

// Helper para rodar queries: query('SELECT ...', [params])
export const query = (text, params) => pool.query(text, params);

export default pool;
