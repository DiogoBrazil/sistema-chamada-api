import { Router, Request, Response, NextFunction } from "express";
import { CityController } from "../controllers/CityController";
import { authorizeRoles, authorizeCity } from "../middleware/authorizationMiddleware";
import { ProfileType } from "../constants/profilesTypes";

const router = Router();
const cityController = new CityController();

// Criação de cidade - apenas administrador geral
router.post("/", 
  authorizeRoles([ProfileType.GENERAL_ADMINISTRATOR]),
  (req: Request, res: Response, next: NextFunction) => 
    cityController.create(req, res, next)
);

// Listagem de cidades - administradores gerais e municipais
router.get("/page/:page", 
  authorizeRoles([
    ProfileType.GENERAL_ADMINISTRATOR,
    ProfileType.GENERAL_LOCAL_ADMINISTRATOR
  ]),
  (req: Request, res: Response, next: NextFunction) => 
    cityController.getAll(req, res, next)
);

// Busca por ID - todos os administradores
router.get("/:id", 
  authorizeRoles([
    ProfileType.GENERAL_ADMINISTRATOR,
    ProfileType.GENERAL_LOCAL_ADMINISTRATOR,
    ProfileType.LOCAL_ADMINISTRATOR
  ]),
  (req: Request, res: Response, next: NextFunction) => 
    cityController.getById(req, res, next)
);

// Busca por termo - todos os administradores
router.get("/search/:term", 
  authorizeRoles([
    ProfileType.GENERAL_ADMINISTRATOR,
    ProfileType.GENERAL_LOCAL_ADMINISTRATOR,
    ProfileType.LOCAL_ADMINISTRATOR
  ]),
  (req: Request, res: Response, next: NextFunction) => 
    cityController.search(req, res, next)
);

// Atualização - apenas administrador geral
router.put("/:id", 
  authorizeRoles([ProfileType.GENERAL_ADMINISTRATOR]),
  authorizeCity(req => Number(req.params.id)),
  (req: Request, res: Response, next: NextFunction) => 
    cityController.update(req, res, next)
);

// Exclusão - apenas administrador geral
router.delete("/:id", 
  authorizeRoles([ProfileType.GENERAL_ADMINISTRATOR]),
  authorizeCity(req => Number(req.params.id)),
  (req: Request, res: Response, next: NextFunction) => 
    cityController.delete(req, res, next)
);

export default router;