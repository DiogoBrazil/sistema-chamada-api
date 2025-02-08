import { Router } from 'express';
import { createProfessional, getProfessionals, getProfessionalById } from '../controllers/professionalController';

const router = Router();

router.post('/', createProfessional);
router.get('/', getProfessionals);
router.get('/:id', getProfessionalById);

export default router;
