import { Request, Response, NextFunction } from "express";
import { container } from "../container";
import { TYPES } from "../types";
import { CreateHealthUnitUseCase } from "../useCases/healthUnit/CreateHealthUnitUseCase";
import { GetHealthUnitsUseCase } from "../useCases/healthUnit/GetHealthUnitsUseCase";
import { GetHealthUnitByIdUseCase } from "../useCases/healthUnit/GetHealthUnitByIdUseCase";
import { UpdateHealthUnitUseCase } from "../useCases/healthUnit/UpdateHealthUnitUseCase";
import { DeleteHealthUnitUseCase } from "../useCases/healthUnit/DeleteHealthUnitUseCase";
import { AddProfessionalToHealthUnitUseCase } from "../useCases/healthUnit/AddProfessionalToHealthUnitUseCase";
import { RemoveProfessionalFromHealthUnitUseCase } from "../useCases/healthUnit/RemoveProfessionalFromHealthUnitUseCase";
import { VerifyLocalAdminAccessUseCase } from "../useCases/professional/VerifyLocalAdminAccessUseCase";

export class HealthUnitController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verificar se o usuário é admin
      const userProfile = req.user?.profile;
      if (userProfile !== 'GENERAL_ADMINISTRATOR') {
        res.status(403).json({
          message: "Only general administrators can create health units",
          data: null,
          status_code: 403
        });
        return;
      }

      const useCase = container.get<CreateHealthUnitUseCase>(TYPES.CreateHealthUnitUseCase);
      const result = await useCase.execute(req.body);
      res.status(201).json({
        message: "Health unit created successfully",
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
      const useCase = container.get<GetHealthUnitsUseCase>(TYPES.GetHealthUnitsUseCase);
      const result = await useCase.execute(page);
      
      res.status(200).json({
        message: "Health units retrieved successfully",
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
      const useCase = container.get<GetHealthUnitByIdUseCase>(TYPES.GetHealthUnitByIdUseCase);
      const result = await useCase.execute(id);
      
      if (!result) {
        res.status(404).json({
          message: "Health unit not found",
          data: null,
          status_code: 404
        });
        return;
      }

      res.status(200).json({
        message: "Health unit retrieved successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verificar permissões de administrador
      const userProfile = req.user?.profile;
      if (!['GENERAL_ADMINISTRATOR', 'LOCAL_ADMINISTRATOR'].includes(userProfile || '')) {
        res.status(403).json({
          message: "Only administrators can update health units",
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

      // Se for admin local, verificar se tem acesso a esta unidade
      if (userProfile === 'LOCAL_ADMINISTRATOR' && req.user?.id) {
        const verifyUseCase = container.get<VerifyLocalAdminAccessUseCase>(TYPES.VerifyLocalAdminAccessUseCase);
        const hasAccess = await verifyUseCase.execute(req.user.id, id);
        
        if (!hasAccess) {
          res.status(403).json({
            message: "As a local administrator, you can only manage your own health unit",
            data: null,
            status_code: 403
          });
          return;
        }
      }

      const useCase = container.get<UpdateHealthUnitUseCase>(TYPES.UpdateHealthUnitUseCase);
      const result = await useCase.execute(id, req.body);
      
      res.status(200).json({
        message: "Health unit updated successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Health unit not found": 404,
          "CNPJ already in use": 400
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
      // Verificar se o usuário é admin
      const userProfile = req.user?.profile;
      if (userProfile !== 'ADMINISTRATOR') {
        res.status(403).json({
          message: "Only administrators can delete health units",
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

      const useCase = container.get<DeleteHealthUnitUseCase>(TYPES.DeleteHealthUnitUseCase);
      await useCase.execute(id);
      
      res.status(200).json({
        message: "Health unit deleted successfully",
        data: { deleted: true },
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Health unit not found": 404,
          "Cannot delete a health unit with associated professionals": 400
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

  async addProfessional(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verificar permissões de administrador
      const userProfile = req.user?.profile;
      if (!['GENERAL_ADMINISTRATOR', 'LOCAL_ADMINISTRATOR'].includes(userProfile || '')) {
        res.status(403).json({
          message: "Only administrators can add professionals to health units",
          data: null,
          status_code: 403
        });
        return;
      }

      const healthUnitId = Number(req.params.id);
      const { professionalId } = req.body;
      
      if (isNaN(healthUnitId) || isNaN(professionalId)) {
        res.status(400).json({
          message: "Invalid health unit ID or professional ID",
          data: null,
          status_code: 400
        });
        return;
      }

      // Se for admin local, verificar se tem acesso a esta unidade
      if (userProfile === 'LOCAL_ADMINISTRATOR' && req.user?.id) {
        const verifyUseCase = container.get<VerifyLocalAdminAccessUseCase>(TYPES.VerifyLocalAdminAccessUseCase);
        const hasAccess = await verifyUseCase.execute(req.user.id, healthUnitId);
        
        if (!hasAccess) {
          res.status(403).json({
            message: "As a local administrator, you can only manage your own health unit",
            data: null,
            status_code: 403
          });
          return;
        }
      }

      const useCase = container.get<AddProfessionalToHealthUnitUseCase>(TYPES.AddProfessionalToHealthUnitUseCase);
      const result = await useCase.execute(healthUnitId, professionalId);
      
      res.status(200).json({
        message: "Professional added to health unit successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Health unit not found": 404,
          "Professional not found": 404,
          "Professional is already linked to this health unit": 400
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

  async removeProfessional(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verificar permissões de administrador
      const userProfile = req.user?.profile;
      if (!['GENERAL_ADMINISTRATOR', 'LOCAL_ADMINISTRATOR'].includes(userProfile || '')) {
        res.status(403).json({
          message: "Only administrators can remove professionals from health units",
          data: null,
          status_code: 403
        });
        return;
      }

      const healthUnitId = Number(req.params.id);
      const professionalId = Number(req.params.professionalId);
      
      if (isNaN(healthUnitId) || isNaN(professionalId)) {
        res.status(400).json({
          message: "Invalid health unit ID or professional ID",
          data: null,
          status_code: 400
        });
        return;
      }

      // Se for admin local, verificar se tem acesso a esta unidade
      if (userProfile === 'LOCAL_ADMINISTRATOR' && req.user?.id) {
        const verifyUseCase = container.get<VerifyLocalAdminAccessUseCase>(TYPES.VerifyLocalAdminAccessUseCase);
        const hasAccess = await verifyUseCase.execute(req.user.id, healthUnitId);
        
        if (!hasAccess) {
          res.status(403).json({
            message: "As a local administrator, you can only manage your own health unit",
            data: null,
            status_code: 403
          });
          return;
        }
      }

      const useCase = container.get<RemoveProfessionalFromHealthUnitUseCase>(TYPES.RemoveProfessionalFromHealthUnitUseCase);
      const result = await useCase.execute(healthUnitId, professionalId);
      
      res.status(200).json({
        message: "Professional removed from health unit successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Health unit not found": 404,
          "Professional not found": 404,
          "Professional is not linked to this health unit": 400
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