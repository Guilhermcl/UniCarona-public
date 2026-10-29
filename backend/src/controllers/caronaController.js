import { query } from '../config/database.js';
import { calcularTetoRateio, cnhVencida, formatarPlaca } from '../utils/validacoes.js';

const formatarCarona = (c) => ({
  ...c,
  veiculo_placa: c.veiculo_placa ? formatarPlaca(c.veiculo_placa) : null,
});

// GET /caronas/teto?origemLat=&origemLng=&destinoLat=&destinoLng=&vagas=
// Valor maximo de rateio por passageiro (carona solidaria, sem lucro).
export const tetoRateio = (req, res) => {
  const vagas = Number(req.query.vagas) || 1;
  return res.json(calcularTetoRateio({ ...req.query, vagas }));
};

// POST /caronas  (protegida) - motorista habilitado cria uma carona
export const criarCarona = async (req, res) => {
  const {
    veiculoId, origem, destino, origemLat, origemLng, destinoLat, destinoLng,
    dataHora, vagas, valor, observacoes,
  } = req.body;

  if (!origem || !destino || !dataHora || !vagas) {
    return res.status(400).json({ erro: 'Origem, destino, data/hora e vagas sao obrigatorios.' });
  }

  try {
    // 1) So motorista com CNH valida pode oferecer carona (CTB art. 159 e 162).
    const u = await query(
      'SELECT e_motorista, cnh_numero, cnh_validade FROM usuarios WHERE id = $1',
      [req.usuarioId]
    );
    const motorista = u.rows[0];
    if (!motorista?.e_motorista || !motorista.cnh_numero) {
      return res.status(403).json({
        erro: 'Para oferecer caronas, cadastre sua CNH e seu veiculo no Perfil.',
        codigo: 'NAO_MOTORISTA',
      });
    }
    if (!motorista.cnh_validade || cnhVencida(motorista.cnh_validade)) {
      return res.status(403).json({
        erro: 'Sua CNH esta vencida. Atualize a validade no Perfil.',
        codigo: 'CNH_VENCIDA',
      });
    }

    // 2) Veiculo do proprio motorista, com placa (obrigatorio).
    if (!veiculoId) return res.status(400).json({ erro: 'Selecione o veiculo da carona.' });
    const v = await query(
      'SELECT * FROM veiculos WHERE id = $1 AND usuario_id = $2 AND ativo',
      [veiculoId, req.usuarioId]
    );
    const veiculo = v.rows[0];
    if (!veiculo) return res.status(400).json({ erro: 'Veiculo nao encontrado.' });

    // 3) Vagas: nao pode passar da lotacao do carro (CTB art. 231, VI).
    const vagasNum = Number(vagas);
    const maxVagas = veiculo.capacidade - 1;
    if (!Number.isInteger(vagasNum) || vagasNum < 1 || vagasNum > maxVagas) {
      return res.status(400).json({ erro: `Esse veiculo comporta no maximo ${maxVagas} passageiro(s).` });
    }

    // 4) Data no futuro.
    const quando = new Date(dataHora);
    if (Number.isNaN(quando.getTime())) return res.status(400).json({ erro: 'Data/hora invalida.' });
    if (quando < new Date()) return res.status(400).json({ erro: 'A carona precisa ser em uma data futura.' });

    // 5) Carona solidaria: rateio limitado ao custo da viagem.
    const valorNum = Number(valor || 0);
    if (Number.isNaN(valorNum) || valorNum < 0) return res.status(400).json({ erro: 'Valor invalido.' });
    const { teto } = calcularTetoRateio({ origemLat, origemLng, destinoLat, destinoLng, vagas: vagasNum });
    if (valorNum > teto) {
      return res.status(400).json({
        erro: `Valor acima do permitido para carona solidaria. Maximo para esta rota: R$ ${teto
          .toFixed(2)
          .replace('.', ',')} por passageiro.`,
        teto,
      });
    }

    const resultado = await query(
      `INSERT INTO caronas
        (motorista_id, veiculo_id, origem, destino, origem_lat, origem_lng,
         destino_lat, destino_lng, data_hora, vagas_total, vagas_disponiveis, valor, observacoes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10,$11,$12)
       RETURNING *`,
      [
        req.usuarioId, veiculo.id, origem, destino,
        origemLat || null, origemLng || null, destinoLat || null, destinoLng || null,
        dataHora, vagasNum, valorNum, observacoes || null,
      ]
    );
    return res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error('Erro ao criar carona:', err);
    return res.status(500).json({ erro: 'Erro ao criar carona.' });
  }
};

// GET /caronas  - lista caronas ativas com filtro opcional por destino/origem
export const listarCaronas = async (req, res) => {
  const { origem, destino } = req.query;

  try {
    let sql = `
      SELECT c.*, u.nome AS motorista_nome, u.avaliacao_media AS motorista_avaliacao,
             v.modelo AS veiculo_modelo, v.cor AS veiculo_cor, v.placa AS veiculo_placa
      FROM caronas c
      JOIN usuarios u ON u.id = c.motorista_id
      LEFT JOIN veiculos v ON v.id = c.veiculo_id
      WHERE c.status = 'ativa' AND c.vagas_disponiveis > 0
        AND c.data_hora > NOW()
    `;
    const params = [];

    if (origem) {
      params.push(`%${origem}%`);
      sql += ` AND c.origem ILIKE $${params.length}`;
    }
    if (destino) {
      params.push(`%${destino}%`);
      sql += ` AND c.destino ILIKE $${params.length}`;
    }

    sql += ' ORDER BY c.data_hora ASC';

    const resultado = await query(sql, params);
    return res.json(resultado.rows.map(formatarCarona));
  } catch (err) {
    console.error('Erro ao listar caronas:', err);
    return res.status(500).json({ erro: 'Erro ao listar caronas.' });
  }
};

// GET /caronas/:id - detalhes de uma carona (inclui placa para conferencia)
export const detalharCarona = async (req, res) => {
  try {
    const resultado = await query(
      `SELECT c.*, u.nome AS motorista_nome, u.telefone AS motorista_telefone,
              u.avaliacao_media AS motorista_avaliacao, u.cnh_categoria AS motorista_cnh_categoria,
              v.modelo AS veiculo_modelo, v.cor AS veiculo_cor, v.placa AS veiculo_placa,
              v.ano AS veiculo_ano
       FROM caronas c
       JOIN usuarios u ON u.id = c.motorista_id
       LEFT JOIN veiculos v ON v.id = c.veiculo_id
       WHERE c.id = $1`,
      [req.params.id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Carona nao encontrada.' });
    }
    return res.json(formatarCarona(resultado.rows[0]));
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao buscar carona.' });
  }
};

// GET /caronas/minhas - caronas que o usuario logado oferece
export const minhasCaronas = async (req, res) => {
  try {
    const resultado = await query(
      'SELECT * FROM caronas WHERE motorista_id = $1 ORDER BY data_hora DESC',
      [req.usuarioId]
    );
    return res.json(resultado.rows);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao buscar suas caronas.' });
  }
};

// PATCH /caronas/:id/cancelar - motorista cancela a propria carona
export const cancelarCarona = async (req, res) => {
  try {
    const resultado = await query(
      `UPDATE caronas SET status = 'cancelada'
       WHERE id = $1 AND motorista_id = $2
       RETURNING *`,
      [req.params.id, req.usuarioId]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Carona nao encontrada ou sem permissao.' });
    }
    return res.json(resultado.rows[0]);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao cancelar carona.' });
  }
};
