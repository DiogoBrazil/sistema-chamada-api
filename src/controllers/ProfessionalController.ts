import { Request, Response, NextFunction } from "express";
import { container } from "../container";
import { TYPES } from "../types";
import { CreateProfessionalUseCase } from "../useCases/professional/CreateProfessionalUseCase";
import { GetProfessionalsUseCase } from "../useCases/professional/GetProfessionalsUseCase";
import { GetProfessionalByIdUseCase } from "../useCases/professional/GetProfessionalByIdUseCase";
import { UpdateProfessionalUseCase } from "../useCases/professional/UpdateProfessionalByIdUseCase";
import { DeleteProfessionalUseCase } from "../useCases/professional/DeleteProfessionalByIdUseCase";

export class ProfessionalController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verifica se o usuário é admin
      const userProfile = req.user?.profile;
      if (userProfile !== 'ADMINISTRATOR') {
        res.status(403).json({
          message: "Only administrators can create professionals",
          data: null,
          status_code: 403
        });
        return;
      }

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

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verifica se o usuário é admin
      const userProfile = req.user?.profile;
      if (userProfile !== 'ADMINISTRATOR') {
        res.status(403).json({
          message: "Only administrators can update professionals",
          data: null,
          status_code: 403
        });
        return;
      }

      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          message: "Invalid ID",
          data: null,
          status_code: 400
        });
        return;
      }

      const useCase = container.get<UpdateProfessionalUseCase>(TYPES.UpdateProfessionalUseCase);
      const result = await useCase.execute(id, req.body);
      
      res.status(200).json({
        message: "Professional updated successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Professional not found": 404,
          "CPF already in use": 400,
          "Invalid profile. Only 'ADMINISTRATOR', 'DOCTOR' or 'RECEPTIONIST' are allowed": 400
        };

        const statusCode = errorMessages[error.message] || 500;
        res.status(statusCode).json({
          message: error.message,
          data: null,
          status_code: statusCode
        });
        return;
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verifica se o usuário é admin
      const userProfile = req.user?.profile;
      if (userProfile !== 'ADMINISTRATOR') {
        res.status(403).json({
          message: "Only administrators can delete professionals",
          data: null,
          status_code: 403
        });
        return;
      }

      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          message: "Invalid ID",
          data: null,
          status_code: 400
        });
        return;
      }

      const useCase = container.get<DeleteProfessionalUseCase>(TYPES.DeleteProfessionalUseCase);
      await useCase.execute(id);
      
      res.status(200).json({
        message: "Professional deleted successfully",
        data: { deleted: true },
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Professional not found": 404,
          "Cannot delete a professional with active attendances": 400
        };

        const statusCode = errorMessages[error.message] || 500;
        res.status(statusCode).json({
          message: error.message,
          data: { deleted: false },
          status_code: statusCode
        });
        return;
      }
      next(error);
    }
  }
}