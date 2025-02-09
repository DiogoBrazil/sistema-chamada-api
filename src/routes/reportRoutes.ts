import { Router } from "express";
import { ReportController } from "../controllers/ReportController";

const router = Router();
const reportController = new ReportController();

router.get(
  "/attendances/:professionalId/:startDate/:startTime/:endDate/:endTime",
  (req, res, next) => reportController.getAttendanceReport(req, res, next)
);

export default router;
