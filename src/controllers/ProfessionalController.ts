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


export class ProfessionalController {
  
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verifica o tipo de admin
      const userProfile = req.user?.profile;
      const userId = req.user?.id;
      
      if (userProfile !== 'GENERAL_ADMINISTRATOR' && userProfile !== 'GENERAL_LOCAL_ADMINISTRATOR' && userProfile !== 'LOCAL_ADMINISTRATOR') {
        res.status(403).json({
          message: "Only administrators can create professionals",
          data: null,
          status_code: 403
        });
        return;
      }

      // Rotas diferentes dependendo do tipo de administrador
      if (userProfile === 'LOCAL_ADMINISTRATOR' && userId) {
        try {
          const useCase = container.get<CreateProfessionalByLocalAdminUseCase>(TYPES.CreateProfessionalByLocalAdminUseCase);
          const result = await useCase.execute(userId, req.body);
          
          res.status(201).json({
            message: "Professional created and linked to health unit successfully",
            data: result,
            status_code: 201
          });
        } catch (error) {
          if (error instanceof Error) {
            const errorMessages: { [key: string]: number } = {
              "Local administrators cannot create administrator profiles": 403,
              "Local administrator is not linked to any health unit": 400,
              "Local administrator does not have access to the specified health unit": 403
            };
            
            const statusCode = errorMessages[error.message] || 500;
            res.status(statusCode).json({
              message: error.message,
              data: null,
              status_code: statusCode
            });
            return;
          }
          throw error;
        }
      } else {
        // Admin geral usa o caso de uso dedicado para criar profissionais
        try {
          if (!userId) {
            res.status(403).json({
              message: "Unauthenticated user",
              data: null,
              status_code: 403
            });
            return;
          }

          const useCase = container.get<CreateProfessionalByGeneralAdminUseCase>(TYPES.CreateProfessionalByGeneralAdminUseCase);
          const result = await useCase.execute(userProfile, userId, req.body);
          
          res.status(201).json({
            message: "Professional created successfully",
            data: result,
            status_code: 201
          });
        } catch (error) {
          if (error instanceof Error) {
            const errorMessages: { [key: string]: number } = {
              "Health unit is required for non-general administrator profiles": 400,
              "Health unit not found": 404
            };
            
            const statusCode = errorMessages[error.message] || 500;
            res.status(statusCode).json({
              message: error.message,
              data: null,
              status_code: statusCode
            });
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
        res.status(403).json({
          message: "Unauthenticated user",
          data: null,
          status_code: 403
        });
      } else { 
        const useCase = container.get<GetProfessionalsUseCase>(TYPES.GetProfessionalsUseCase);
        const data = req.body
        const result = await useCase.execute(professionalId, data, page);
        
        res.status(200).json({
          message: "Professionals retrieved successfully",
          data: result.data,
          pagination: {
            currentPage: result.currentPage,
            totalPages: result.totalPages,
            totalItems: result.totalItems
          },
          status_code: 200
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async getByCpf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cpf = req.params.cpf;
      const professionalId = req.user?.id;
      
      if (!professionalId) {
        res.status(403).json({
          message: "Unauthenticated user",
          data: null,
          status_code: 403
        });
        return;
      }
      
      const useCase = container.get<GetProfessionalByCpfUseCase>(TYPES.GetProfessionalByCpfUseCase);
      const result = await useCase.execute(cpf, professionalId);
      
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
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Requesting professional not found": 404,
          "Professional does not have permission to access this professional data": 403
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

  async getByName(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const name = req.params.name;
      const professionalId = req.user?.id;
      
      if (!professionalId) {
        res.status(403).json({
          message: "Unauthenticated user",
          data: null,
          status_code: 403
        });
        return;
      }
      
      const useCase = container.get<GetProfessionalsByNameUseCase>(TYPES.GetProfessionalByNameUseCase);
      const result = await useCase.execute(name, professionalId);
      
      res.status(200).json({
        message: "Professionals retrieved successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Requesting professional not found": 404,
          "Professional does not have permission to access this professional data": 403
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
  
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const professionalId = req.user?.id;
      
      if (!professionalId) {
        res.status(403).json({
          message: "Unauthenticated user",
          data: null,
          status_code: 403
        });
        return;
      }
      
      const useCase = container.get<GetProfessionalByIdUseCase>(TYPES.GetProfessionalByIdUseCase);
      const result = await useCase.execute(id, professionalId);
      
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
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Requesting professional not found": 404,
          "Professional does not have permission to access this professional data": 403
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
      // Verifica o tipo de admin
      const userProfile = req.user?.profile;
      const adminId = req.user?.id;
      
      if (userProfile !== 'GENERAL_ADMINISTRATOR' && userProfile !== 'GENERAL_LOCAL_ADMINISTRATOR' && userProfile !== 'LOCAL_ADMINISTRATOR') {
        res.status(403).json({
          message: "Only administrators can update professionals",
          data: null,
          status_code: 403
        });
        return;
      }

      if (!adminId) {
        res.status(403).json({
          message: "Unauthenticated user",
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

      // Rotas diferentes dependendo do tipo de administrador
      if (userProfile === 'LOCAL_ADMINISTRATOR') {
        try {
          const useCase = container.get<UpdateProfessionalByLocalAdminUseCase>(TYPES.UpdateProfessionalByLocalAdminUseCase);
          const result = await useCase.execute(adminId, id, req.body);
          
          res.status(200).json({
            message: "Professional updated successfully",
            data: result,
            status_code: 200
          });
        } catch (error) {
          if (error instanceof Error) {
            const errorMessages: { [key: string]: number } = {
              "Professional not found": 404,
              "Admin not found": 404,
              "Local administrator is not linked to any health unit": 400,
              "You can only update professionals from your health unit": 403,
              "Local administrators cannot update administrator profiles": 403,
              "Local administrators cannot update to administrator profiles": 403,
              "Local administrator does not have access to the specified health unit": 403,
              "CPF already in use": 400,
              "Email already in use.": 400,
              "Invalid email.": 400
            };
            
            const statusCode = errorMessages[error.message] || 500;
            res.status(statusCode).json({
              message: error.message,
              data: null,
              status_code: statusCode
            });
            return;
          }
          throw error;
        }
      } else {
        // Admin geral e geral local usam caso de uso dedicado
        try {
          const useCase = container.get<UpdateProfessionalByGeneralAdminUseCase>(TYPES.UpdateProfessionalByGeneralAdminUseCase);
          const result = await useCase.execute(userProfile, adminId, id, req.body);
          
          res.status(200).json({
            message: "Professional updated successfully",
            data: result,
            status_code: 200
          });
        } catch (error) {
          if (error instanceof Error) {
            const errorMessages: { [key: string]: number } = {
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
              "There is already a general local administrator for this city": 400,
              "There is already a local administrator for this health unit": 400,
              "CPF already in use": 400,
              "Email already in use.": 400,
              "Invalid email.": 400
            };
            
            const statusCode = errorMessages[error.message] || 500;
            res.status(statusCode).json({
              message: error.message,
              data: null,
              status_code: statusCode
            });
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
      // Verifica se o usuário é admin
      const userProfile = req.user?.profile;
      if (userProfile !== 'GENERAL_ADMINISTRATOR' && userProfile !== 'GENERAL_LOCAL_ADMINISTRATOR' && userProfile !== 'LOCAL_ADMINISTRATOR') {
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

      const adminId = req.user?.id;

      if (!adminId) {
        res.status(403).json({
          message: "Unauthecated user",
          data: null,
          status_code: 403
        });
        return;
      }

      const useCase = container.get<DeleteProfessionalUseCase>(TYPES.DeleteProfessionalUseCase);
      await useCase.execute(id, adminId, userProfile);
      
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