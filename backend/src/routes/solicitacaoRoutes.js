import { Router } from 'express';
import {
  solicitarVaga,
  solicitacoesRecebidas,
  responderSolicitacao,
  minhasSolicitacoes,
} from '../controllers/solicitacaoController.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.post('/', autenticar, solicitarVaga);
router.get('/recebidas', autenticar, solicitacoesRecebidas);
router.get('/minhas', autenticar, minhasSolicitacoes);
router.patch('/:id', autenticar, responderSolicitacao);

export default router;
