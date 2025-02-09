import { Router } from "express";
import { AttendanceController } from "../controllers/AttendanceController";

const router = Router();
const attendanceController = new AttendanceController();

router.post("/", (req, res, next) => attendanceController.create(req, res, next));
router.get("/", (req, res, next) => attendanceController.getAll(req, res, next));
router.post("/:id/call", (req, res, next) => attendanceController.call(req, res, next));
router.post("/:id/finish", (req, res, next) => attendanceController.finish(req, res, next));

export default router;
