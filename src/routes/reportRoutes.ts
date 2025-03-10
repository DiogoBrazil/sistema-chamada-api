// src/routes/reportRoutes.ts
import { Router, Request, Response, NextFunction } from "express";
import { ReportController } from "../controllers/ReportController";
import { authorizeRoles, authorizeCity, authorizeHealthUnit } from "../middleware/authorizationMiddleware";
import { ProfileType, ADMIN_PROFILES } from "../constants/profilesTypes";

const router = Router();
const reportController = new ReportController();

// Rota para relatório de atendimentos por profissional
router.get(
  "/attendances/:professionalId/:startDate/:startTime/:endDate/:endTime",
  (req: Request, res: Response, next: NextFunction) => 
    reportController.getAttendanceReport(req, res, next)
);

// Rota para relatório de atendimentos por cidade
router.get(
  "/city/:cityId/:startDate/:startTime/:endDate/:endTime",
  authorizeRoles([...ADMIN_PROFILES, ProfileType.DOCTOR, ProfileType.NURSE]),
  authorizeCity((req) => Number(req.params.cityId)),
  (req: Request, res: Response, next: NextFunction) => 
    reportController.getCityAttendanceReport(req, res, next)
);

// Rota para relatório de atendimentos por unidade de saúde
router.get(
  "/health-unit/:healthUnitId/:startDate/:startTime/:endDate/:endTime",
  authorizeRoles([...ADMIN_PROFILES, ProfileType.DOCTOR, ProfileType.NURSE]),
  authorizeHealthUnit((req) => Number(req.params.healthUnitId)),
  (req: Request, res: Response, next: NextFunction) => 
    reportController.getHealthUnitAttendanceReport(req, res, next)
);

export default router;


// import { Router, Request, Response, NextFunction } from "express";
// import { ReportController } from "../controllers/ReportController";

// const router = Router();
// const reportController = new ReportController();

// router.get(
//   "/attendances/:professionalId/:startDate/:startTime/:endDate/:endTime",
//   (req: Request, res: Response, next: NextFunction) => 
//     reportController.getAttendanceReport(req, res, next)
// );

// export default router;