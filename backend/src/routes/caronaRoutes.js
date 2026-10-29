import { Router } from 'express';
import {
  criarCarona,
  listarCaronas,
  detalharCarona,
  minhasCaronas,
  cancelarCarona,
  tetoRateio,
} from '../controllers/caronaController.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.get('/', listarCaronas);
router.get('/teto', tetoRateio);
router.get('/minhas', autenticar, minhasCaronas);
router.get('/:id', detalharCarona);
router.post('/', autenticar, criarCarona);
router.patch('/:id/cancelar', autenticar, cancelarCarona);

export default router;
