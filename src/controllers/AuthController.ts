import { Request, Response, NextFunction } from "express";
import { container } from "../container";
import { TYPES } from "../types";
import { LoginProfessionalUseCase } from "../useCases/professional/LoginProfessionalUseCase";
import { SetOfficeUseCase } from "../useCases/professional/SetOfficeUseCase";

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = container.get<LoginProfessionalUseCase>(TYPES.LoginProfessionalUseCase);
      const result = await useCase.execute(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  
  async setOffice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { professionalId, office } = req.body;
      const useCase = container.get<SetOfficeUseCase>(TYPES.SetOfficeUseCase);
      const result = await useCase.execute(professionalId, office);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
