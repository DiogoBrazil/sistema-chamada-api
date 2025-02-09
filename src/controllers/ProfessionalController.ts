import { Request, Response, NextFunction } from "express";
import { container } from "../container";
import { TYPES } from "../types";
import { CreateProfessionalUseCase } from "../useCases/professional/CreateProfessionalUseCase";
import { GetProfessionalsUseCase } from "../useCases/professional/GetProfessionalsUseCase";
import { GetProfessionalByIdUseCase } from "../useCases/professional/GetProfessionalByIdUseCase";

export class ProfessionalController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = container.get<CreateProfessionalUseCase>(TYPES.CreateProfessionalUseCase);
      const result = await useCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
  
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = container.get<GetProfessionalsUseCase>(TYPES.GetProfessionalsUseCase);
      const result = await useCase.execute();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const useCase = container.get<GetProfessionalByIdUseCase>(TYPES.GetProfessionalByIdUseCase);
      const result = await useCase.execute(id);
      if (!result) {
        res.status(404).json({ error: "Professional not found" });
        return;
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
