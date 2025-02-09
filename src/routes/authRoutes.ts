import { Router } from 'express';
import { loginProfessional, setConsultorio } from '../controllers/authConttoller';

const router = Router();

router.post('/login', loginProfessional);
router.post('/set-consultorio', setConsultorio);

export default router;
