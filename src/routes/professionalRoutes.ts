import { Router, Request, Response, NextFunction } from "express";
import { ProfessionalController } from "../controllers/ProfessionalController";
import { authorizeRoles, authorizeProfessionalManagement, canManageProfessional } from "../middleware/authorizationMiddleware";
import { ProfileType, ADMIN_PROFILES } from "../constants/profilesTypes";

const router = Router();
const professionalController = new ProfessionalController();

router.post("/", 
  authorizeProfessionalManagement(),
  (req: Request, res: Response, next: NextFunction) => 
    professionalController.create(req, res, next)
);

router.get("/page/:page", 
  authorizeRoles(ADMIN_PROFILES),
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
  authorizeProfessionalManagement(),
  canManageProfessional(req => Number(req.params.id)),
  (req: Request, res: Response, next: NextFunction) => 
    professionalController.delete(req, res, next)
);

router.put("/:id", 
  canManageProfessional(req => Number(req.params.id)),
  (req: Request, res: Response, next: NextFunction) => 
    professionalController.update(req, res, next)
);

export default router;