import bcrypt from 'bcryptjs';
import pool, { query } from '../config/database.js';
import { gerarToken } from '../utils/token.js';
import { ehEmailInstitucional } from '../utils/validarEmail.js';
import { validarCPF, somenteDigitos } from '../utils/validacoes.js';
import {
  validarDadosMotorista,
  validarVeiculo,
  usuarioPublico,
  mensagemDuplicidade,
  VERSAO_TERMOS,
} from '../services/motoristaService.js';

const buscarUsuario = async (id) => {
  const r = await query('SELECT * FROM usuarios WHERE id = $1', [id]);
  return r.rows[0] || null;
};

// POST /auth/cadastro
export const cadastrar = async (req, res) => {
  const {
    nome, email, senha, cpf, telefone, aceiteTermos,
    eMotorista, dataNascimento, cnhNumero, cnhCategoria, cnhValidade, veiculo,
  } = req.body;

  if (!nome || !email || !senha || !cpf) {
    return res.status(400).json({ erro: 'Nome, e-mail, CPF e senha sao obrigatorios.' });
  }

  // LGPD (art. 7, I e art. 8): consentimento livre, informado e registrado.
  if (aceiteTermos !== true) {
    return res.status(400).json({ erro: 'E preciso aceitar os Termos de Uso e a Politica de Privacidade.' });
  }

  if (!ehEmailInstitucional(email)) {
    return res.status(400).json({ erro: 'Use um e-mail institucional valido (ex: @universidade.edu.br).' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter ao menos 6 caracteres.' });
  }

  if (!validarCPF(cpf)) {
    return res.status(400).json({ erro: 'CPF invalido.' });
  }

  let motorista = null;
  let carro = null;
  if (eMotorista) {
    const m = validarDadosMotorista({ dataNascimento, cnhNumero, cnhCategoria, cnhValidade });
    if (m.erro) return res.status(400).json({ erro: m.erro });
    const v = validarVeiculo(veiculo);
    if (v.erro) return res.status(400).json({ erro: v.erro });
    motorista = m.dados;
    carro = v.dados;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const senhaHash = await bcrypt.hash(senha, 10);
    const resultado = await client.query(
      `INSERT INTO usuarios
        (nome, email, senha, cpf, telefone, e_motorista, data_nascimento,
         cnh_numero, cnh_categoria, cnh_validade, aceite_termos_em, versao_termos)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),$11)
       RETURNING *`,
      [
        nome.trim(),
        email.trim().toLowerCase(),
        senhaHash,
        somenteDigitos(cpf),
        telefone || null,
        !!motorista,
        motorista?.dataNascimento || null,
        motorista?.cnhNumero || null,
        motorista?.cnhCategoria || null,
        motorista?.cnhValidade || null,
        VERSAO_TERMOS,
      ]
    );
    const usuario = resultado.rows[0];

    if (carro) {
      await client.query(
        `INSERT INTO veiculos (usuario_id, placa, modelo, cor, ano, capacidade)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [usuario.id, carro.placa, carro.modelo, carro.cor, carro.ano, carro.capacidade]
      );
    }

    await client.query('COMMIT');

    const token = gerarToken({ id: usuario.id, email: usuario.email });
    return res.status(201).json({ usuario: usuarioPublico(usuario), token });
  } catch (err) {
    await client.query('ROLLBACK');
    const dup = mensagemDuplicidade(err);
    if (dup) return res.status(409).json({ erro: dup });
    console.error('Erro no cadastro:', err);
    return res.status(500).json({ erro: 'Erro interno ao cadastrar.' });
  } finally {
    client.release();
  }
};

// POST /auth/login
export const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha sao obrigatorios.' });
  }

  try {
    const resultado = await query('SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    const usuario = resultado.rows[0];
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ erro: 'Credenciais invalidas.' });
    }

    const token = gerarToken({ id: usuario.id, email: usuario.email });
    return res.json({ usuario: usuarioPublico(usuario), token });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ erro: 'Erro interno ao fazer login.' });
  }
};

// GET /auth/me  (protegida) - dados do usuario logado, com documentos mascarados
export const meusDados = async (req, res) => {
  try {
    const usuario = await buscarUsuario(req.usuarioId);
    if (!usuario) return res.status(404).json({ erro: 'Usuario nao encontrado.' });
    return res.json(usuarioPublico(usuario));
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao buscar dados.' });
  }
};

// PATCH /auth/motorista  (protegida) - passageiro vira motorista ou renova a CNH
export const tornarMotorista = async (req, res) => {
  const { cpf, dataNascimento, cnhNumero, cnhCategoria, cnhValidade, veiculo } = req.body;

  try {
    const atual = await buscarUsuario(req.usuarioId);
    if (!atual) return res.status(404).json({ erro: 'Usuario nao encontrado.' });

    // Contas antigas (antes do CPF obrigatorio) informam o CPF aqui.
    let cpfFinal = atual.cpf;
    if (!cpfFinal) {
      if (!validarCPF(cpf)) return res.status(400).json({ erro: 'CPF invalido.' });
      cpfFinal = somenteDigitos(cpf);
    }

    const m = validarDadosMotorista({ dataNascimento, cnhNumero, cnhCategoria, cnhValidade });
    if (m.erro) return res.status(400).json({ erro: m.erro });

    // Veiculo e obrigatorio so se o usuario ainda nao tem nenhum ativo.
    const veics = await query('SELECT id FROM veiculos WHERE usuario_id = $1 AND ativo', [req.usuarioId]);
    let carro = null;
    if (veics.rows.length === 0 || veiculo) {
      const v = validarVeiculo(veiculo);
      if (v.erro) return res.status(400).json({ erro: v.erro });
      carro = v.dados;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const r = await client.query(
        `UPDATE usuarios SET cpf = $1, e_motorista = TRUE, data_nascimento = $2,
           cnh_numero = $3, cnh_categoria = $4, cnh_validade = $5,
           aceite_termos_em = COALESCE(aceite_termos_em, NOW()),
           versao_termos = COALESCE(versao_termos, $6)
         WHERE id = $7 RETURNING *`,
        [cpfFinal, m.dados.dataNascimento, m.dados.cnhNumero, m.dados.cnhCategoria,
          m.dados.cnhValidade, VERSAO_TERMOS, req.usuarioId]
      );
      if (carro) {
        await client.query(
          `INSERT INTO veiculos (usuario_id, placa, modelo, cor, ano, capacidade)
           VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (usuario_id, placa)
           DO UPDATE SET modelo = EXCLUDED.modelo, cor = EXCLUDED.cor, ano = EXCLUDED.ano,
                         capacidade = EXCLUDED.capacidade, ativo = TRUE`,
          [req.usuarioId, carro.placa, carro.modelo, carro.cor, carro.ano, carro.capacidade]
        );
      }
      await client.query('COMMIT');
      return res.json({ usuario: usuarioPublico(r.rows[0]) });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    const dup = mensagemDuplicidade(err);
    if (dup) return res.status(409).json({ erro: dup });
    console.error('Erro ao tornar motorista:', err);
    return res.status(500).json({ erro: 'Erro ao salvar dados de motorista.' });
  }
};

// DELETE /auth/conta  (protegida) - LGPD art. 18, VI: eliminacao dos dados
export const excluirConta = async (req, res) => {
  const { senha } = req.body || {};
  if (!senha) return res.status(400).json({ erro: 'Confirme sua senha para excluir a conta.' });

  try {
    const usuario = await buscarUsuario(req.usuarioId);
    if (!usuario) return res.status(404).json({ erro: 'Usuario nao encontrado.' });
    if (!(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ erro: 'Senha incorreta.' });
    }
    await query('DELETE FROM usuarios WHERE id = $1', [req.usuarioId]);
    return res.json({ mensagem: 'Conta e dados pessoais excluidos.' });
  } catch (err) {
    console.error('Erro ao excluir conta:', err);
    return res.status(500).json({ erro: 'Erro ao excluir conta.' });
  }
};

