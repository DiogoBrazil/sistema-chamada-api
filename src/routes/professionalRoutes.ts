import { Router, Request, Response, NextFunction } from "express";
import { ProfessionalController } from "../controllers/ProfessionalController";

const router = Router();
const professionalController = new ProfessionalController();

router.post("/", 
  (req: Request, res: Response, next: NextFunction) => 
    professionalController.create(req, res, next)
);

router.get("/page/:page", 
  (req: Request, res: Response, next: NextFunction) => 
    professionalController.getAll(req, res, next)
);

router.get("/:id", 
  (req: Request, res: Response, next: NextFunction) => 
    professionalController.getById(req, res, next)
);

router.get("/cpf/:cpf", 
  (req: Request, res: Response, next: NextFunction) => 
    professionalController.getByCpf(req, res, next)
);

router.get("/name/:name", 
  (req: Request, res: Response, next: NextFunction) => 
    professionalController.getByName(req, res, next)
);

router.delete("/:id", 
  (req: Request, res: Response, next: NextFunction) => 
    professionalController.delete(req, res, next)
);

router.put("/:id", 
  (req: Request, res: Response, next: NextFunction) => 
    professionalController.update(req, res, next)
);

export default router;