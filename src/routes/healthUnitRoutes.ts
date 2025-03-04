import { Router, Request, Response, NextFunction } from "express";
import { HealthUnitController } from "../controllers/HealthUnitController";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = Router();
const healthUnitController = new HealthUnitController();

router.post("/", 
  roleMiddleware(['GENERAL_ADMINISTRATOR']),
  (req: Request, res: Response, next: NextFunction) => 
    healthUnitController.create(req, res, next)
);

router.get("/page/:page", 
  (req: Request, res: Response, next: NextFunction) => 
    healthUnitController.getAll(req, res, next)
);

router.get("/:id", 
  (req: Request, res: Response, next: NextFunction) => 
    healthUnitController.getById(req, res, next)
);

router.put("/:id", 
  roleMiddleware(['GENERAL_ADMINISTRATOR']),
  (req: Request, res: Response, next: NextFunction) => 
    healthUnitController.update(req, res, next)
);

router.delete("/:id", 
  roleMiddleware(['GENERAL_ADMINISTRATOR']),
  (req: Request, res: Response, next: NextFunction) => 
    healthUnitController.delete(req, res, next)
);

router.post("/:id/professionals", 
  roleMiddleware(['ADMINISTRATOR']),
  (req: Request, res: Response, next: NextFunction) => 
    healthUnitController.addProfessional(req, res, next)
);

router.delete("/:id/professionals/:professionalId", 
  roleMiddleware(['ADMINISTRATOR']),
  (req: Request, res: Response, next: NextFunction) => 
    healthUnitController.removeProfessional(req, res, next)
);

export default router;