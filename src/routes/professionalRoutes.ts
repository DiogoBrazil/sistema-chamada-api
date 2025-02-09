import { Router } from "express";
import { ProfessionalController } from "../controllers/ProfessionalController";

const router = Router();
const professionalController = new ProfessionalController();

router.post("/", (req, res, next) => professionalController.create(req, res, next));
router.get("/", (req, res, next) => professionalController.getAll(req, res, next));
router.get("/:id", (req, res, next) => professionalController.getById(req, res, next));

export default router;
