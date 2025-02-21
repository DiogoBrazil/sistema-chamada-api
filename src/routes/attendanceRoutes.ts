import { Router, Request, Response, NextFunction } from "express";
import { AttendanceController } from "../controllers/AttendanceController";

const router = Router();
const attendanceController = new AttendanceController();

router.post("/", 
  (req: Request, res: Response, next: NextFunction) => 
    attendanceController.create(req, res, next)
);

router.get("/", 
  (req: Request, res: Response, next: NextFunction) => 
    attendanceController.getAll(req, res, next)
);

router.post("/:id/call", 
  (req: Request, res: Response, next: NextFunction) => 
    attendanceController.call(req, res, next)
);

router.post("/:id/finish", 
  (req: Request, res: Response, next: NextFunction) => 
    attendanceController.finish(req, res, next)
);

export default router;