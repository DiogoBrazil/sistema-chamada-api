import { Router, Request, Response, NextFunction } from "express";
import { AuthController } from "../controllers/AuthController";

const router = Router();
const authController = new AuthController();

router.post("/login", 
  (req: Request, res: Response, next: NextFunction) => 
    authController.login(req, res, next)
);

router.post("/set-office", 
  (req: Request, res: Response, next: NextFunction) => 
    authController.setOffice(req, res, next)
);

export default router;