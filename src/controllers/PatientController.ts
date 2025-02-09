import { Request, Response, NextFunction } from "express";
import { container } from "../container";
import { TYPES } from "../types";
import { CreatePatientUseCase } from "../useCases/patient/CreatePatientUseCase";
import { GetPatientsUseCase } from "../useCases/patient/GetPatientsUseCase";
import { GetPatientByIdUseCase } from "../useCases/patient/GetPatientByIdUseCase";

export class PatientController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = container.get<CreatePatientUseCase>(TYPES.CreatePatientUseCase);
      const result = await useCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
  
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = container.get<GetPatientsUseCase>(TYPES.GetPatientsUseCase);
      const result = await useCase.execute();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const useCase = container.get<GetPatientByIdUseCase>(TYPES.GetPatientByIdUseCase);
      const result = await useCase.execute(id);
      if (!result) {
        res.status(404).json({ error: "Patient not found" });
        return;
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
