import { Router } from 'express';
import { getAtendimentosReport } from '../controllers/reportController';

const router = Router();

router.get(
    '/atendimentos/:professionalId/:startDate/:startTime/:endDate/:endTime',
    getAtendimentosReport
  );
  
export default router;
