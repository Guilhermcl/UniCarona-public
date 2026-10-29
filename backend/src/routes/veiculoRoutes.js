import { Router } from 'express';
import { meusVeiculos, cadastrarVeiculo, removerVeiculo } from '../controllers/veiculoController.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.get('/', autenticar, meusVeiculos);
router.post('/', autenticar, cadastrarVeiculo);
router.delete('/:id', autenticar, removerVeiculo);

export default router;
