import { Router } from "express";
import { ProfessionalController } from "../controllers/ProfessionalController";

const router = Router();
const professionalController = new ProfessionalController();

router.post("/", (req, res, next) => professionalController.create(req, res, next));
router.get("/page/:page", (req, res, next) => professionalController.getAll(req, res, next));
router.get("/:id", (req, res, next) => professionalController.getById(req, res, next));
router.get("/cpf/:cpf", (req, res, next) => professionalController.getByCpf(req, res, next));
router.get("/name/:name", (req, res, next) => professionalController.getByName(req, res, next));
router.delete("/:id", (req, res, next) => professionalController.delete(req, res, next));
router.put("/:id", (req, res, next) => professionalController.update(req, res, next));

export default router;
