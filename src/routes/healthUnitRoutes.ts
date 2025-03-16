import { Router, Request, Response, NextFunction } from "express";
import { HealthUnitController } from "../controllers/HealthUnitController";
import { authorizeRoles, authorizeHealthUnit, canManageProfessional } from "../middleware/authorizationMiddleware";
import { ProfileType } from "../constants/profilesTypes";

const router = Router();
const healthUnitController = new HealthUnitController();

router.post("/", 
  authorizeRoles([ProfileType.GENERAL_ADMINISTRATOR, ProfileType.GENERAL_LOCAL_ADMINISTRATOR]),
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
  authorizeRoles([ProfileType.GENERAL_ADMINISTRATOR, ProfileType.GENERAL_LOCAL_ADMINISTRATOR]),
  authorizeHealthUnit(req => Number(req.params.id)),
  (req: Request, res: Response, next: NextFunction) => 
    healthUnitController.update(req, res, next)
);

router.delete("/:id", 
  authorizeRoles([ProfileType.GENERAL_ADMINISTRATOR, ProfileType.GENERAL_LOCAL_ADMINISTRATOR]),
  authorizeHealthUnit(req => Number(req.params.id)),
  (req: Request, res: Response, next: NextFunction) => 
    healthUnitController.delete(req, res, next)
);

router.post("/:id/professionals", 
  authorizeRoles([ProfileType.GENERAL_ADMINISTRATOR, ProfileType.GENERAL_LOCAL_ADMINISTRATOR, ProfileType.LOCAL_ADMINISTRATOR]),
  authorizeHealthUnit(req => Number(req.params.id)),
  (req: Request, res: Response, next: NextFunction) => 
    healthUnitController.addProfessional(req, res, next)
);

router.delete("/:id/professionals/:professionalId", 
  authorizeRoles([ProfileType.GENERAL_ADMINISTRATOR, ProfileType.GENERAL_LOCAL_ADMINISTRATOR, ProfileType.LOCAL_ADMINISTRATOR]),
  authorizeHealthUnit(req => Number(req.params.id)),
  canManageProfessional(req => Number(req.params.professionalId)),
  (req: Request, res: Response, next: NextFunction) => 
    healthUnitController.removeProfessional(req, res, next)
);

export default router;