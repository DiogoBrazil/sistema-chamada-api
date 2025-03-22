import { Request, Response, NextFunction } from "express";
import { container } from "../container";
import { TYPES } from "../types";
import { GetProfessionalsUseCase } from "../useCases/professional/GetProfessionalsUseCase";
import { GetProfessionalByIdUseCase } from "../useCases/professional/GetProfessionalByIdUseCase";
import { UpdateProfessionalUseCase } from "../useCases/professional/UpdateProfessionalByIdUseCase";
import { DeleteProfessionalUseCase } from "../useCases/professional/DeleteProfessionalByIdUseCase";
import { GetProfessionalByCpfUseCase } from "../useCases/professional/GetProfessionalByCpfUseCase";
import { GetProfessionalsByNameUseCase } from "../useCases/professional/GetProfessionalByNameUseCase";
import { CreateProfessionalByLocalAdminUseCase } from "../useCases/professional/CreateProfessionalByLocalAdminUseCase";
import { CreateProfessionalByGeneralAdminUseCase } from "../useCases/professional/CreateProfessionalByGeneralAdminUseCase";
import { UpdateProfessionalByLocalAdminUseCase } from "../useCases/professional/UpdateProfessionalByLocalAdminUseCase";
import { UpdateProfessionalByGeneralAdminUseCase } from "../useCases/professional/UpdateProfessionalByGeneralAdminUseCase";
import { ProfileType } from "../constants/profilesTypes";
import { createSuccessResponse, successMessages } from "../utils/response";
import { createErrorResponse, errorMessages } from "../utils/errors";


export class ProfessionalController {
  
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check admin type
      const userProfile = req.user?.profile;
      const userId = req.user?.id;
      
      if (userProfile !== ProfileType.GENERAL_ADMINISTRATOR && userProfile !== ProfileType.GENERAL_LOCAL_ADMINISTRATOR && userProfile !== ProfileType.LOCAL_ADMINISTRATOR) {
        const errorResponse = createErrorResponse("Only administrators can create professionals", 403);
        res.status(errorResponse.status_code).json(errorResponse);
        return;
      }

      // Different routes depending on admin type
      if (userProfile === ProfileType.LOCAL_ADMINISTRATOR && userId) {
        try {
          const useCase = container.get<CreateProfessionalByLocalAdminUseCase>(TYPES.CreateProfessionalByLocalAdminUseCase);
          const result = await useCase.execute(userId, req.body);
          
          const successResponse = createSuccessResponse(
            "Professional created and linked to health unit successfully", 
            result, 
            201
          );
          res.status(successResponse.status_code).json(successResponse);
        } catch (error) {
          if (error instanceof Error) {
            const errorCodeMap: { [key: string]: number } = {
              "Local administrators cannot create administrator profiles": 403,
              "Local administrator is not linked to any health unit": 400,
              "Local administrator does not have access to the specified health unit": 403,
              "Email already in use.": 409,
              "CPF already in use": 409,
              "Invalid email.": 400,
              "Password is required.": 400,
              "Street, city, state and number are required for address": 400
            };
            
            const statusCode = errorCodeMap[error.message] || 500;
            const errorResponse = createErrorResponse(error.message, statusCode);
            res.status(errorResponse.status_code).json(errorResponse);
            return;
          }
          throw error;
        }
      } else {
        // General admin uses dedicated use case to create professionals
        try {
          if (!userId) {
            const errorResponse = createErrorResponse(errorMessages.UNAUTHORIZED, 401);
            res.status(errorResponse.status_code).json(errorResponse);
            return;
          }

          const useCase = container.get<CreateProfessionalByGeneralAdminUseCase>(TYPES.CreateProfessionalByGeneralAdminUseCase);
          const result = await useCase.execute(userProfile, userId, req.body);
          
          const successResponse = createSuccessResponse(
            successMessages.CREATED, 
            result, 
            201
          );
          res.status(successResponse.status_code).json(successResponse);
        } catch (error) {
          if (error instanceof Error) {
            const errorCodeMap: { [key: string]: number } = {
              "Health unit is required for non-general administrator profiles": 400,
              "Health unit not found": 404,
              "City not found": 404,
              "City is required for general local administrator profiles": 400,
              "There is already a general local administrator for this city": 409,
              "There is already a local administrator for this health unit": 409,
              "Email already in use.": 409,
              "CPF already in use": 409,
              "Invalid email.": 400,
              "Password is required.": 400,
              "Street, city, state and number are required for address": 400,
              "General administrators cannot create other general administrators": 403,
              "General local administrators cannot create general administrators": 403,
              "General local administrators cannot create other general local administrators": 403
            };
            
            const statusCode = errorCodeMap[error.message] || 500;
            const errorResponse = createErrorResponse(error.message, statusCode);
            res.status(errorResponse.status_code).json(errorResponse);
            return;
          }
          throw error;
        }
      }
    } catch (error) {
      next(error);
    }
  }
  
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.params.page) || 1;

      const professionalId = req.user?.id;
      if (!professionalId) {
        const errorResponse = createErrorResponse(errorMessages.UNAUTHORIZED, 401);
        res.status(errorResponse.status_code).json(errorResponse);
        return;
      }
      
      const useCase = container.get<GetProfessionalsUseCase>(TYPES.GetProfessionalsUseCase);
      const data = req.body;
      const result = await useCase.execute(professionalId, data, page);
      
      // Special case with pagination
      const response = {
        message: successMessages.FETCHED,
        data: result.data,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalItems: result.totalItems
        },
        status_code: 200
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getByCpf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cpf = req.params.cpf;
      const professionalId = req.user?.id;
      
      if (!professionalId) {
        const errorResponse = createErrorResponse(errorMessages.UNAUTHORIZED, 401);
        res.status(errorResponse.status_code).json(errorResponse);
        return;
      }
      
      const useCase = container.get<GetProfessionalByCpfUseCase>(TYPES.GetProfessionalByCpfUseCase);
      const result = await useCase.execute(cpf, professionalId);
      
      if (!result) {
        const errorResponse = createErrorResponse(errorMessages.NOT_FOUND, 404);
        res.status(errorResponse.status_code).json(errorResponse);
        return;
      }
      
      const successResponse = createSuccessResponse(successMessages.FETCHED, result);
      res.status(successResponse.status_code).json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorCodeMap: { [key: string]: number } = {
          "Requesting professional not found": 404,
          "Professional does not have permission to access this professional data": 403
        };
        
        const statusCode = errorCodeMap[error.message] || 500;
        const errorResponse = createErrorResponse(error.message, statusCode);
        res.status(errorResponse.status_code).json(errorResponse);
        return;
      }
      next(error);
    }
  }

  async getByName(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const name = req.params.name;
      const professionalId = req.user?.id;
      
      if (!professionalId) {
        const errorResponse = createErrorResponse(errorMessages.UNAUTHORIZED, 401);
        res.status(errorResponse.status_code).json(errorResponse);
        return;
      }
      
      const useCase = container.get<GetProfessionalsByNameUseCase>(TYPES.GetProfessionalByNameUseCase);
      const result = await useCase.execute(name, professionalId);
      
      const successResponse = createSuccessResponse(successMessages.FETCHED, result);
      res.status(successResponse.status_code).json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorCodeMap: { [key: string]: number } = {
          "Requesting professional not found": 404,
          "Professional does not have permission to access this professional data": 403
        };
        
        const statusCode = errorCodeMap[error.message] || 500;
        const errorResponse = createErrorResponse(error.message, statusCode);
        res.status(errorResponse.status_code).json(errorResponse);
        return;
      }
      next(error);
    }
  }
  
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const professionalId = req.user?.id;
      
      if (!professionalId) {
        const errorResponse = createErrorResponse(errorMessages.UNAUTHORIZED, 401);
        res.status(errorResponse.status_code).json(errorResponse);
        return;
      }
      
      const useCase = container.get<GetProfessionalByIdUseCase>(TYPES.GetProfessionalByIdUseCase);
      const result = await useCase.execute(id, professionalId);
      
      if (!result) {
        const errorResponse = createErrorResponse(errorMessages.NOT_FOUND, 404);
        res.status(errorResponse.status_code).json(errorResponse);
        return;
      }

      const successResponse = createSuccessResponse(successMessages.FETCHED, result);
      res.status(successResponse.status_code).json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorCodeMap: { [key: string]: number } = {
          "Requesting professional not found": 404,
          "Professional does not have permission to access this professional data": 403
        };
        
        const statusCode = errorCodeMap[error.message] || 500;
        const errorResponse = createErrorResponse(error.message, statusCode);
        res.status(errorResponse.status_code).json(errorResponse);
        return;
      }
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check admin type
      const userProfile = req.user?.profile;
      const adminId = req.user?.id;
      
      if (userProfile !== ProfileType.GENERAL_ADMINISTRATOR && userProfile !== ProfileType.GENERAL_LOCAL_ADMINISTRATOR && userProfile !== ProfileType.LOCAL_ADMINISTRATOR) {
        const errorResponse = createErrorResponse("Only administrators can update professionals", 403);
        res.status(errorResponse.status_code).json(errorResponse);
        return;
      }

      if (!adminId) {
        const errorResponse = createErrorResponse(errorMessages.UNAUTHORIZED, 401);
        res.status(errorResponse.status_code).json(errorResponse);
        return;
      }

      const id = Number(req.params.id);
      if (isNaN(id)) {
        const errorResponse = createErrorResponse(errorMessages.INVALID_DATA, 400);
        res.status(errorResponse.status_code).json(errorResponse);
        return;
      }

      // Different routes depending on admin type
      if (userProfile === ProfileType.LOCAL_ADMINISTRATOR) {
        try {
          const useCase = container.get<UpdateProfessionalByLocalAdminUseCase>(TYPES.UpdateProfessionalByLocalAdminUseCase);
          const result = await useCase.execute(adminId, id, req.body);
          
          const successResponse = createSuccessResponse(successMessages.UPDATED, result);
          res.status(successResponse.status_code).json(successResponse);
        } catch (error) {
          if (error instanceof Error) {
            const errorCodeMap: { [key: string]: number } = {
              "Professional not found": 404,
              "Admin not found": 404,
              "Local administrator is not linked to any health unit": 400,
              "You can only update professionals from your health unit": 403,
              "Local administrators cannot update administrator profiles": 403,
              "Local administrators cannot update to administrator profiles": 403,
              "Local administrator does not have access to the specified health unit": 403,
              "CPF already in use": 409,
              "Email already in use.": 409,
              "Invalid email.": 400
            };
            
            const statusCode = errorCodeMap[error.message] || 500;
            const errorResponse = createErrorResponse(error.message, statusCode);
            res.status(errorResponse.status_code).json(errorResponse);
            return;
          }
          throw error;
        }
      } else {
        // General and general local admins use dedicated use case
        try {
          const useCase = container.get<UpdateProfessionalByGeneralAdminUseCase>(TYPES.UpdateProfessionalByGeneralAdminUseCase);
          const result = await useCase.execute(userProfile, adminId, id, req.body);
          
          const successResponse = createSuccessResponse(successMessages.UPDATED, result);
          res.status(successResponse.status_code).json(successResponse);
        } catch (error) {
          if (error instanceof Error) {
            const errorCodeMap: { [key: string]: number } = {
              "Professional not found": 404,
              "Admin not found": 404,
              "General administrators cannot update other general administrators": 403,
              "Cannot update a professional to general administrator profile": 403,
              "General local administrators cannot update general administrators": 403,
              "General local administrators cannot update other general local administrators": 403,
              "General local administrators cannot update to general administrator profiles": 403,
              "You can only update professionals from your city": 403,
              "You can only update professionals to your city": 403,
              "Admin not linked to any city": 400,
              "Health unit not found": 404,
              "City not found": 404,
              "You do not have access to the health unit you are trying to link the professional to": 403,
              "There is already a general local administrator for this city": 409,
              "There is already a local administrator for this health unit": 409,
              "CPF already in use": 409,
              "Email already in use.": 409,
              "Invalid email.": 400
            };
            
            const statusCode = errorCodeMap[error.message] || 500;
            const errorResponse = createErrorResponse(error.message, statusCode);
            res.status(errorResponse.status_code).json(errorResponse);
            return;
          }
          throw error;
        }
      }
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if user is admin
      const userProfile = req.user?.profile;
      if (userProfile !== ProfileType.GENERAL_ADMINISTRATOR && userProfile !== ProfileType.GENERAL_LOCAL_ADMINISTRATOR && userProfile !== ProfileType.LOCAL_ADMINISTRATOR) {
        const errorResponse = createErrorResponse("Only administrators can delete professionals", 403);
        res.status(errorResponse.status_code).json(errorResponse);
        return;
      }

      const id = Number(req.params.id);
      if (isNaN(id)) {
        const errorResponse = createErrorResponse(errorMessages.INVALID_DATA, 400);
        res.status(errorResponse.status_code).json(errorResponse);
        return;
      }

      const adminId = req.user?.id;

      if (!adminId) {
        const errorResponse = createErrorResponse(errorMessages.UNAUTHORIZED, 401);
        res.status(errorResponse.status_code).json(errorResponse);
        return;
      }

      const useCase = container.get<DeleteProfessionalUseCase>(TYPES.DeleteProfessionalUseCase);
      await useCase.execute(id, adminId, userProfile);
      
      const successResponse = createSuccessResponse(successMessages.DELETED, { deleted: true });
      res.status(successResponse.status_code).json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorCodeMap: { [key: string]: number } = {
          "Professional not found": 404,
          "Cannot delete a professional with active attendances": 409,
          "Admin not found": 404,
          "You can only delete professionals from your health unit": 403,
          "Local administrators cannot delete administrator profiles": 403,
          "General local administrators cannot delete general administrators": 403,
          "General local administrators cannot delete other general local administrators": 403,
          "You can only delete professionals from your city": 403,
          "You cannot delete yourself": 400
        };

        const statusCode = errorCodeMap[error.message] || 500;
        const errorResponse = createErrorResponse(error.message, statusCode, { deleted: false });
        res.status(errorResponse.status_code).json(errorResponse);
        return;
      }
      next(error);
    }
  }
}