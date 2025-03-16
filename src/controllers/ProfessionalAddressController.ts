import { Request, Response, NextFunction } from "express";
import { container } from "../container";
import { TYPES } from "../types";
import { CreateProfessionalAddressUseCase } from "../useCases/address/professional/CreateProfessionalAddressUseCase";
import { GetProfessionalAddressesUseCase } from "../useCases/address/professional/GetProfessionalAddressesUseCase";
import { UpdateProfessionalAddressUseCase } from "../useCases/address/professional/UpdateProfessionalAddressUseCase";
import { DeleteProfessionalAddressUseCase } from "../useCases/address/professional/DeleteProfessionalAddressUseCase";

export class ProfessionalAddressController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verifica se o usuário é admin
      const userProfile = req.user?.profile;
      if (userProfile !== 'GENERAL_ADMINISTRATOR' && userProfile !== 'GENERAL_LOCAL_ADMINISTRATOR'  && userProfile !== 'LOCAL_ADMINISTRATOR') {
        res.status(403).json({
          message: "Only administrators can manage professional addresses",
          data: null,
          status_code: 403
        });
        return;
      }

      const professionalId = Number(req.params.professionalId);
      if (isNaN(professionalId)) {
        res.status(400).json({
          message: "Invalid professional ID",
          data: null,
          status_code: 400
        });
        return;
      }

      // Validação básica do endereço
      const { street, city, state, zipCode } = req.body;
      if (!street || !city || !state || !zipCode) {
        res.status(400).json({
          message: "Street, city, state and zipCode are required",
          data: null,
          status_code: 400
        });
        return;
      }

      const useCase = container.get<CreateProfessionalAddressUseCase>(TYPES.CreateProfessionalAddressUseCase);
      const result = await useCase.execute(professionalId, req.body);
      
      res.status(201).json({
        message: "Address created successfully",
        data: result,
        status_code: 201
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Professional not found": 404,
          "Street, city, state and zipCode are required for address": 400
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

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const professionalId = Number(req.params.professionalId);
      if (isNaN(professionalId)) {
        res.status(400).json({
          message: "Invalid professional ID",
          data: null,
          status_code: 400
        });
        return;
      }

      const useCase = container.get<GetProfessionalAddressesUseCase>(TYPES.GetProfessionalAddressesUseCase);
      const result = await useCase.execute(professionalId);
      
      res.status(200).json({
        message: "Addresses retrieved successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Professional not found": 404
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

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verifica se o usuário é admin
      const userProfile = req.user?.profile;
      if (userProfile !== 'GENERAL_ADMINISTRATOR' && userProfile !== 'GENERAL_LOCAL_ADMINISTRATOR'  && userProfile !== 'LOCAL_ADMINISTRATOR') {
        res.status(403).json({
          message: "Only administrators can manage professional addresses",
          data: null,
          status_code: 403
        });
        return;
      }

      const addressId = Number(req.params.addressId);
      if (isNaN(addressId)) {
        res.status(400).json({
          message: "Invalid address ID",
          data: null,
          status_code: 400
        });
        return;
      }

      const useCase = container.get<UpdateProfessionalAddressUseCase>(TYPES.UpdateProfessionalAddressUseCase);
      const result = await useCase.execute(addressId, req.body);
      
      res.status(200).json({
        message: "Address updated successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Address not found": 404,
          "Street, city, state and zipCode cannot be empty": 400
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
      if (userProfile !== 'GENERAL_ADMINISTRATOR' && userProfile !== 'GENERAL_LOCAL_ADMINISTRATOR'  && userProfile !== 'LOCAL_ADMINISTRATOR') {
        res.status(403).json({
          message: "Only administrators can manage professional addresses",
          data: null,
          status_code: 403
        });
        return;
      }

      const addressId = Number(req.params.addressId);
      if (isNaN(addressId)) {
        res.status(400).json({
          message: "Invalid address ID",
          data: null,
          status_code: 400
        });
        return;
      }

      const useCase = container.get<DeleteProfessionalAddressUseCase>(TYPES.DeleteProfessionalAddressUseCase);
      await useCase.execute(addressId);
      
      res.status(200).json({
        message: "Address deleted successfully",
        data: { deleted: true },
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Address not found": 404,
          "Cannot delete the only main address of a professional": 400
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