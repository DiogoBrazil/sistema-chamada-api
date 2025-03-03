import { Router, Request, Response, NextFunction } from "express";
import { ProfessionalAddressController } from "../controllers/ProfessionalAddressController";

const router = Router();
const professionalAddressController = new ProfessionalAddressController();

router.post("/:professionalId/addresses", 
  (req: Request, res: Response, next: NextFunction) => 
    professionalAddressController.create(req, res, next)
);

router.get("/:professionalId/addresses", 
  (req: Request, res: Response, next: NextFunction) => 
    professionalAddressController.getAll(req, res, next)
);

router.put("/addresses/:addressId", 
  (req: Request, res: Response, next: NextFunction) => 
    professionalAddressController.update(req, res, next)
);

router.delete("/addresses/:addressId", 
  (req: Request, res: Response, next: NextFunction) => 
    professionalAddressController.delete(req, res, next)
);

export default router;