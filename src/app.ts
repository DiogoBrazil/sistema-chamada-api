import express from "express";
import cors from "cors";
import professionalRoutes from "./routes/professionalRoutes";
import patientRoutes from "./routes/patientRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import authRoutes from "./routes/authRoutes";
import reportRoutes from "./routes/reportRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/professionals", professionalRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);

// Middleware global de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err); 
  res.status(500).json({ error: err.message });
});

export default app;
