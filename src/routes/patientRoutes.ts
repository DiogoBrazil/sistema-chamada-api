import { Router } from 'express';
import { createPatient, getPatients, getPatientById } from '../controllers/patientController';

const router = Router();

router.post('/', createPatient);
router.get('/', getPatients);
router.get('/:id', getPatientById);

export default router;
