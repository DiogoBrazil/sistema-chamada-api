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

router.get("/triage", 
  (req: Request, res: Response, next: NextFunction) => 
    attendanceController.getTriage(req, res, next)
);

router.get("/medical", 
  (req: Request, res: Response, next: NextFunction) => 
    attendanceController.getMedicalConsultation(req, res, next)
);

router.get("/nursing", 
  (req: Request, res: Response, next: NextFunction) => 
    attendanceController.getNursingConsultation(req, res, next)
);

router.get("/dental", 
  (req: Request, res: Response, next: NextFunction) => 
    attendanceController.getDentalConsultation(req, res, next)
);

router.get("/vaccine", 
  (req: Request, res: Response, next: NextFunction) => 
    attendanceController.getVaccine(req, res, next)
);

router.post("/:id/call", 
  (req: Request, res: Response, next: NextFunction) => 
    attendanceController.call(req, res, next)
);

router.post("/:id/finish", 
  (req: Request, res: Response, next: NextFunction) => 
    attendanceController.finish(req, res, next)
);

router.post("/:id/forward", 
  (req: Request, res: Response, next: NextFunction) => 
    attendanceController.forward(req, res, next)
);

export default router;