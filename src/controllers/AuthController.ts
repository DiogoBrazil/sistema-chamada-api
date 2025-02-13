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
      res.status(200).json({
        message: "Login successful",
        data: result,
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          message: error.message,
          data: null,
          status_code: 401
        });
        return;
      }
      next(error);
    }
  }
  
  async setOffice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { professionalId, office } = req.body;
      const useCase = container.get<SetOfficeUseCase>(TYPES.SetOfficeUseCase);
      const result = await useCase.execute(professionalId, office);
      res.status(200).json({
        message: "Office set successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          message: error.message,
          data: null,
          status_code: 400
        });
        return;
      }
      next(error);
    }
  }
}