import { Router, Request, Response, NextFunction } from "express";
import { ReportController } from "../controllers/ReportController";

const router = Router();
const reportController = new ReportController();

router.get(
  "/attendances/:professionalId/:startDate/:startTime/:endDate/:endTime",
  (req: Request, res: Response, next: NextFunction) => 
    reportController.getAttendanceReport(req, res, next)
);

export default router;