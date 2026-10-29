import { Router } from 'express';
import { autenticar } from '../middlewares/auth.js';
import { responderChat } from '../services/geminiService.js';

const router = Router();

// POST /chat  { historico: [{ autor: 'user'|'bot', texto }] }
router.post('/', autenticar, async (req, res) => {
  const { historico } = req.body || {};
  if (!Array.isArray(historico)) {
    return res.status(400).json({ erro: 'Envie o historico da conversa.' });
  }
  try {
    const resposta = await responderChat(historico);
    return res.json({ resposta });
  } catch (err) {
    console.log('Erro no chat:', err.message);
    const status = err.status || 500;
    const msg =
      status === 429
        ? 'O assistente atingiu o limite de uso agora. Tente de novo em alguns minutos.'
        : status === 503
          ? 'O assistente ainda nao foi configurado no servidor.'
          : 'Desculpe, tive um problema para responder. Tente novamente.';
    return res.status(status).json({ erro: msg });
  }
});

export default router;
