import { query } from '../config/database.js';
import { validarVeiculo, veiculoPublico, mensagemDuplicidade } from '../services/motoristaService.js';

// GET /veiculos  (protegida) - veiculos ativos do motorista logado
export const meusVeiculos = async (req, res) => {
  try {
    const r = await query(
      'SELECT * FROM veiculos WHERE usuario_id = $1 AND ativo ORDER BY criado_em',
      [req.usuarioId]
    );
    return res.json(r.rows.map(veiculoPublico));
  } catch (err) {
    console.error('Erro ao listar veiculos:', err);
    return res.status(500).json({ erro: 'Erro ao listar veiculos.' });
  }
};

// POST /veiculos  (protegida) - cadastra outro veiculo
export const cadastrarVeiculo = async (req, res) => {
  try {
    const u = await query('SELECT e_motorista FROM usuarios WHERE id = $1', [req.usuarioId]);
    if (!u.rows[0]?.e_motorista) {
      return res.status(403).json({ erro: 'Cadastre sua CNH antes de adicionar veiculos.' });
    }

    const v = validarVeiculo(req.body);
    if (v.erro) return res.status(400).json({ erro: v.erro });
    const d = v.dados;

    const r = await query(
      `INSERT INTO veiculos (usuario_id, placa, modelo, cor, ano, capacidade)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (usuario_id, placa)
       DO UPDATE SET modelo = EXCLUDED.modelo, cor = EXCLUDED.cor, ano = EXCLUDED.ano,
                     capacidade = EXCLUDED.capacidade, ativo = TRUE
       RETURNING *`,
      [req.usuarioId, d.placa, d.modelo, d.cor, d.ano, d.capacidade]
    );
    return res.status(201).json(veiculoPublico(r.rows[0]));
  } catch (err) {
    const dup = mensagemDuplicidade(err);
    if (dup) return res.status(409).json({ erro: dup });
    console.error('Erro ao cadastrar veiculo:', err);
    return res.status(500).json({ erro: 'Erro ao cadastrar veiculo.' });
  }
};

// DELETE /veiculos/:id  (protegida) - desativa (mantem historico das caronas)
export const removerVeiculo = async (req, res) => {
  try {
    const r = await query(
      'UPDATE veiculos SET ativo = FALSE WHERE id = $1 AND usuario_id = $2 RETURNING id',
      [req.params.id, req.usuarioId]
    );
    if (r.rows.length === 0) return res.status(404).json({ erro: 'Veiculo nao encontrado.' });
    return res.json({ mensagem: 'Veiculo removido.' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao remover veiculo.' });
  }
};
