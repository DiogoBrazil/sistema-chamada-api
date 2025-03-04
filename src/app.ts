import express from "express";
import cors from "cors";
import professionalRoutes from "./routes/professionalRoutes";
import patientRoutes from "./routes/patientRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import authRoutes from "./routes/authRoutes";
import reportRoutes from "./routes/reportRoutes";
import patientAddressRoutes from "./routes/patientAddressRoutes";
import professionalAddressRoutes from "./routes/professionalAddressRoutes";
import healthUnitRoutes from "./routes/healthUnitRoutes";
import cidRoutes from "./routes/cidRoutes";
import { apiLeyMiddleware } from "./middleware/apiLeyMiddleware";
import { authMiddleware } from "./middleware/authMiddleware";
import { roleMiddleware } from "./middleware/roleMiddleware";

const app = express();

app.use(cors());
app.use(express.json());

// Rotas públicas - apenas precisa da api key
app.use("/api/auth", apiLeyMiddleware, authRoutes);

// Middleware global para verificar api key e autenticação em todas as rotas
app.use("/api", apiLeyMiddleware);
app.use("/api", (req, res, next) => { authMiddleware(req, res, next); });

// Rotas protegidas - precisa de autenticação
app.use("/api/professionals", professionalRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/patients", patientAddressRoutes);
app.use("/api/professionals", professionalAddressRoutes);
app.use("/api/health-units", healthUnitRoutes);
app.use("/api/cid", cidRoutes);

// Rota que exige perfil específico (apenas médicos e admins)
app.use("/api/reports", roleMiddleware(['ADMINISTRATOR', 'DOCTOR']), reportRoutes);

// Middleware global de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err); 
  res.status(500).json({ error: err.message });
});

export default app;
