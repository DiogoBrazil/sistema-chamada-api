import { Router, Request, Response, NextFunction } from "express";
import { PatientController } from "../controllers/PatientController";

const router = Router();
const patientController = new PatientController();

router.post("/", 
  (req: Request, res: Response, next: NextFunction) => 
    patientController.create(req, res, next)
);

router.get("/page/:page", 
  (req: Request, res: Response, next: NextFunction) => 
    patientController.getAll(req, res, next)
);

router.get("/:id", 
  (req: Request, res: Response, next: NextFunction) => 
    patientController.getById(req, res, next)
);

router.get("/cpf/:cpf", 
  (req: Request, res: Response, next: NextFunction) => 
    patientController.getByCpf(req, res, next)
);

router.get("/name/:name", 
  (req: Request, res: Response, next: NextFunction) => 
    patientController.getByName(req, res, next)
);

router.delete("/:id", 
  (req: Request, res: Response, next: NextFunction) => 
    patientController.delete(req, res, next)
);

router.put("/:id", 
  (req: Request, res: Response, next: NextFunction) => 
    patientController.update(req, res, next)
);

export default router;