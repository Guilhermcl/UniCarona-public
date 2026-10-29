import { Router } from 'express';
import {
  cadastrar, login, meusDados, tornarMotorista, excluirConta,
} from '../controllers/authController.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.post('/cadastro', cadastrar);
router.post('/login', login);
router.get('/me', autenticar, meusDados);
router.patch('/motorista', autenticar, tornarMotorista);
router.delete('/conta', autenticar, excluirConta);

export default router;
