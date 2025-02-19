import { Router } from "express";
import { PatientController } from "../controllers/PatientController";

const router = Router();
const patientController = new PatientController();

router.post("/", (req, res, next) => patientController.create(req, res, next));
router.get("/page/:page", (req, res, next) => patientController.getAll(req, res, next));
router.get("/:id", (req, res, next) => patientController.getById(req, res, next));
router.get("/cpf/:cpf", (req, res, next) => patientController.getByCpf(req, res, next));
router.get("/name/:name", (req, res, next) => patientController.getByName(req, res, next));
router.delete("/:id", (req, res, next) => patientController.delete(req, res, next));
router.put("/:id", (req, res, next) => patientController.update(req, res, next));

export default router;
