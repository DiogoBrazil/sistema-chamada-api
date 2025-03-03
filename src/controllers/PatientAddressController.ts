import { Request, Response, NextFunction } from "express";
import { container } from "../container";
import { TYPES } from "../types";
import { CreatePatientAddressUseCase } from "../useCases/address/patient/CreatePatientAddressUseCase";
import { GetPatientAddressesUseCase } from "../useCases/address/patient/GetPatientAddressesUseCase";
import { UpdatePatientAddressUseCase } from "../useCases/address/patient/UpdatePatientAddressUseCase";
import { DeletePatientAddressUseCase } from "../useCases/address/patient/DeletePatientAddressUseCase";

export class PatientAddressController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const patientId = Number(req.params.patientId);
      if (isNaN(patientId)) {
        res.status(400).json({
          message: "Invalid patient ID",
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

      const useCase = container.get<CreatePatientAddressUseCase>(TYPES.CreatePatientAddressUseCase);
      const result = await useCase.execute(patientId, req.body);
      
      res.status(201).json({
        message: "Address created successfully",
        data: result,
        status_code: 201
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Patient not found": 404,
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
      const patientId = Number(req.params.patientId);
      if (isNaN(patientId)) {
        res.status(400).json({
          message: "Invalid patient ID",
          data: null,
          status_code: 400
        });
        return;
      }

      const useCase = container.get<GetPatientAddressesUseCase>(TYPES.GetPatientAddressesUseCase);
      const result = await useCase.execute(patientId);

      if (result.length === 0) {
        res.status(404).json({
          message: "No addresses found for this patient",
          data: null,
          status_code: 404
        });
        return;
      }
      
      res.status(200).json({
        message: "Addresses retrieved successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Patient not found": 404
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
      const addressId = Number(req.params.addressId);
      if (isNaN(addressId)) {
        res.status(400).json({
          message: "Invalid address ID",
          data: null,
          status_code: 400
        });
        return;
      }

      const useCase = container.get<UpdatePatientAddressUseCase>(TYPES.UpdatePatientAddressUseCase);
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
      const addressId = Number(req.params.addressId);
      if (isNaN(addressId)) {
        res.status(400).json({
          message: "Invalid address ID",
          data: null,
          status_code: 400
        });
        return;
      }

      const useCase = container.get<DeletePatientAddressUseCase>(TYPES.DeletePatientAddressUseCase);
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
          "Cannot delete the only main address of a patient": 400
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