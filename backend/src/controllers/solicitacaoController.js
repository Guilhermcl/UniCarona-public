import { query } from '../config/database.js';

// POST /solicitacoes  - passageiro solicita vaga em uma carona
export const solicitarVaga = async (req, res) => {
  const { caronaId } = req.body;

  if (!caronaId) {
    return res.status(400).json({ erro: 'caronaId é obrigatório.' });
  }

  try {
    // Verifica disponibilidade
    const carona = await query(
      `SELECT motorista_id, vagas_disponiveis, status FROM caronas WHERE id = $1`,
      [caronaId]
    );
    if (carona.rows.length === 0) {
      return res.status(404).json({ erro: 'Carona não encontrada.' });
    }
    if (carona.rows[0].motorista_id === req.usuarioId) {
      return res.status(400).json({ erro: 'Você não pode solicitar sua própria carona.' });
    }
    if (carona.rows[0].status !== 'ativa' || carona.rows[0].vagas_disponiveis < 1) {
      return res.status(400).json({ erro: 'Carona indisponível.' });
    }

    const resultado = await query(
      `INSERT INTO solicitacoes (carona_id, passageiro_id)
       VALUES ($1, $2) RETURNING *`,
      [caronaId, req.usuarioId]
    );
    return res.status(201).json(resultado.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'Você já solicitou esta carona.' });
    }
    console.error('Erro ao solicitar vaga:', err);
    return res.status(500).json({ erro: 'Erro ao solicitar vaga.' });
  }
};

// GET /solicitacoes/recebidas - motorista vê pedidos nas suas caronas
export const solicitacoesRecebidas = async (req, res) => {
  try {
    const resultado = await query(
      `SELECT s.*, u.nome AS passageiro_nome, u.avaliacao_media AS passageiro_avaliacao,
              c.origem, c.destino, c.data_hora
       FROM solicitacoes s
       JOIN caronas c ON c.id = s.carona_id
       JOIN usuarios u ON u.id = s.passageiro_id
       WHERE c.motorista_id = $1
       ORDER BY s.criado_em DESC`,
      [req.usuarioId]
    );
    return res.json(resultado.rows);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao buscar solicitações.' });
  }
};

// PATCH /solicitacoes/:id  - motorista aceita ou recusa (body: { status })
export const responderSolicitacao = async (req, res) => {
  const { status } = req.body; // 'aceita' ou 'recusada'

  if (!['aceita', 'recusada'].includes(status)) {
    return res.status(400).json({ erro: 'Status inválido.' });
  }

  try {
    // Garante que a solicitação pertence a uma carona do motorista logado
    const verifica = await query(
      `SELECT s.id, s.carona_id, s.status AS status_atual
       FROM solicitacoes s
       JOIN caronas c ON c.id = s.carona_id
       WHERE s.id = $1 AND c.motorista_id = $2`,
      [req.params.id, req.usuarioId]
    );
    if (verifica.rows.length === 0) {
      return res.status(404).json({ erro: 'Solicitação não encontrada ou sem permissão.' });
    }

    const solicitacao = verifica.rows[0];

    await query(`UPDATE solicitacoes SET status = $1 WHERE id = $2`, [
      status,
      req.params.id,
    ]);

    // Se aceitou, diminui uma vaga disponível
    if (status === 'aceita' && solicitacao.status_atual !== 'aceita') {
      await query(
        `UPDATE caronas SET vagas_disponiveis = vagas_disponiveis - 1
         WHERE id = $1 AND vagas_disponiveis > 0`,
        [solicitacao.carona_id]
      );
    }

    return res.json({ mensagem: `Solicitação ${status}.` });
  } catch (err) {
    console.error('Erro ao responder solicitação:', err);
    return res.status(500).json({ erro: 'Erro ao responder solicitação.' });
  }
};

// GET /solicitacoes/minhas - passageiro vê suas solicitações
export const minhasSolicitacoes = async (req, res) => {
  try {
    const resultado = await query(
      `SELECT s.*, c.origem, c.destino, c.data_hora, c.valor,
              u.nome AS motorista_nome
       FROM solicitacoes s
       JOIN caronas c ON c.id = s.carona_id
       JOIN usuarios u ON u.id = c.motorista_id
       WHERE s.passageiro_id = $1
       ORDER BY s.criado_em DESC`,
      [req.usuarioId]
    );
    return res.json(resultado.rows);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao buscar solicitações.' });
  }
};
