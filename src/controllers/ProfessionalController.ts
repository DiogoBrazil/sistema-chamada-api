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
      res.status(201).json({
        message: "Professional created successfully",
        data: result,
        status_code: 201
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = container.get<GetProfessionalsUseCase>(TYPES.GetProfessionalsUseCase);
      const result = await useCase.execute();
      res.status(200).json({
        message: "Professionals retrieved successfully",
        data: result,
        status_code: 200
      });
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
        res.status(404).json({
          message: "Professional not found",
          data: null,
          status_code: 404
        });
        return;
      }

      res.status(200).json({
        message: "Professional retrieved successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      next(error);
    }
  }
}