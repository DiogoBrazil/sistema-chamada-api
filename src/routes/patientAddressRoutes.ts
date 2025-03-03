import { Router, Request, Response, NextFunction } from "express";
import { PatientAddressController } from "../controllers/PatientAddressController";

const router = Router();
const patientAddressController = new PatientAddressController();

router.post("/:patientId/addresses", 
  (req: Request, res: Response, next: NextFunction) => 
    patientAddressController.create(req, res, next)
);

router.get("/:patientId/addresses", 
  (req: Request, res: Response, next: NextFunction) => 
    patientAddressController.getAll(req, res, next)
);

router.put("/addresses/:addressId", 
  (req: Request, res: Response, next: NextFunction) => 
    patientAddressController.update(req, res, next)
);

router.delete("/addresses/:addressId", 
  (req: Request, res: Response, next: NextFunction) => 
    patientAddressController.delete(req, res, next)
);

export default router;