import { Request, Response, NextFunction } from "express";
import { container } from "../container";
import { TYPES } from "../types";
import { CreatePatientUseCase } from "../useCases/patient/CreatePatientUseCase";
import { GetPatientsUseCase } from "../useCases/patient/GetPatientsUseCase";
import { GetPatientByIdUseCase } from "../useCases/patient/GetPatientByIdUseCase";
import { DeletePatientUseCase } from "../useCases/patient/DeletePatientUseCase";
import { UpdatePatientUseCase } from "../useCases/patient/UpdatePatientUseCase";
import { GetPatientByCpfUseCase } from "../useCases/patient/GetPatientByCpfUseCase";
import { GetPatientsByNameUseCase } from "../useCases/patient/GetPatientsByNameUseCase";

export class PatientController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = container.get<CreatePatientUseCase>(TYPES.CreatePatientUseCase);
      const result = await useCase.execute(req.body);
      res.status(201).json({
        message: "Patient created successfully",
        data: result,
        status_code: 201
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.params.page) || 1;
      const useCase = container.get<GetPatientsUseCase>(TYPES.GetPatientsUseCase);
      const result = await useCase.execute(page);
      
      res.status(200).json({
        message: "Patients retrieved successfully",
        data: result.data,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalItems: result.totalItems
        },
        status_code: 200
      });
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
        res.status(404).json({
          message: "Patient not found",
          data: null,
          status_code: 404
        });
        return;
      }

      res.status(200).json({
        message: "Patient retrieved successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      next(error);
    }
  }


  async getByCpf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cpf = req.params.cpf;
      const useCase = container.get<GetPatientByCpfUseCase>(TYPES.GetPatientByCpfUseCase);
      const result = await useCase.execute(cpf);
      
      if (!result) {
        res.status(404).json({ error: "Patient not found" });
        return;
      }
      
      res.status(200).json({
        message: "Patient retrieved successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      next(error);
    }
  }

  async getByName(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const name = req.params.name;
      const useCase = container.get<GetPatientsByNameUseCase>(TYPES.GetPatientByNamesUseCase);
      const result = await useCase.execute(name);
      res.status(200).json({
        message: "Patients retrieved successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      next(error);
    }
  }


  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          message: "Invalid ID",
          data: null,
          status_code: 400
        });
        return;
      }

      const useCase = container.get<DeletePatientUseCase>(TYPES.DeletePatientUseCase);
      await useCase.execute(id);
      
      res.status(200).json({
        message: "Patient deleted successfully",
        data: { deleted: true },
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Patient not found": 404,
          "Cannot delete a patient with pending or in progress attendances": 400,
          "Cannot delete a patient with attendance history": 400
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

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          message: "Invalid ID",
          data: null,
          status_code: 400
        });
        return;
      }

      const useCase = container.get<UpdatePatientUseCase>(TYPES.UpdatePatientUseCase);
      const result = await useCase.execute(id, req.body);
      
      res.status(200).json({
        message: "Patient updated successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Patient not found": 404,
          "CPF already in use": 400
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
}