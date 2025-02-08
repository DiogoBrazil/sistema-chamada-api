import { Router } from 'express';
import { createAtendimento, getAtendimentos, callPatient, finishAtendimento } from '../controllers/atendimentoController';

const router = Router();

router.post('/', createAtendimento);
router.get('/', getAtendimentos);
router.post('/:id/chamar', callPatient);
router.post('/:id/encerrar', finishAtendimento);

export default router;
