import express from 'express';
import cors from 'cors';
import patientRoutes from './routes/patientRoutes';
import professionalRoutes from './routes/professionalRoutes';
import atendimentoRoutes from './routes/atendimentoRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/patients', patientRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/atendimentos', atendimentoRoutes);

export default app;
