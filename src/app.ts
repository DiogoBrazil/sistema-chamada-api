import express from 'express';
import cors from 'cors';
import patientRoutes from './routes/patientRoutes';
import professionalRoutes from './routes/professionalRoutes';
import atendimentoRoutes from './routes/atendimentoRoutes';
import authRoutes from './routes/authRoutes';
import reportRoutes from './routes/reportRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/patients', patientRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/atendimentos', atendimentoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

export default app;
