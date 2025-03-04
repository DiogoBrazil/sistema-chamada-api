import { Router, Request, Response, NextFunction } from "express";
import { CidController } from "../controllers/CidController";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = Router();
const cidController = new CidController();

router.post("/", 
  roleMiddleware(['ADMINISTRATOR', 'DOCTOR']),
  (req: Request, res: Response, next: NextFunction) => 
    cidController.create(req, res, next)
);

router.get("/page/:page", 
  (req: Request, res: Response, next: NextFunction) => 
    cidController.getAll(req, res, next)
);

router.get("/search/:term", 
  (req: Request, res: Response, next: NextFunction) => 
    cidController.search(req, res, next)
);

router.put("/:id", 
  roleMiddleware(['ADMINISTRATOR', 'DOCTOR']),
  (req: Request, res: Response, next: NextFunction) => 
    cidController.update(req, res, next)
);

router.delete("/:id", 
  roleMiddleware(['ADMINISTRATOR']),
  (req: Request, res: Response, next: NextFunction) => 
    cidController.delete(req, res, next)
);

export default router;