import { Request, Response, NextFunction } from "express";
import { container } from "../container";
import { TYPES } from "../types";
import { CreateCidUseCase } from "../useCases/cid/CreateCidUseCase";
import { GetCidsUseCase } from "../useCases/cid/GetCidsUseCase";
import { SearchCidUseCase } from "../useCases/cid/SearchCidUseCase";
import { UpdateCidUseCase } from "../useCases/cid/UpdateCidUseCase";
import { DeleteCidUseCase } from "../useCases/cid/DeleteCidUseCase";
import { ProfileType } from "../constants/profilesTypes";

export class CidController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verificar se o usuário é admin
      const userProfile = req.user?.profile;
      if (![ProfileType.GENERAL_ADMINISTRATOR].includes(userProfile as ProfileType)) {
        res.status(403).json({
          message: "Only general administrators can create CID records",
          data: null,
          status_code: 403
        });
        return;
      }

      const useCase = container.get<CreateCidUseCase>(TYPES.CreateCidUseCase);
      const result = await useCase.execute(req.body);
      res.status(201).json({
        message: "CID created successfully",
        data: result,
        status_code: 201
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "CID code already exists") {
          res.status(400).json({
            message: error.message,
            data: null,
            status_code: 400
          });
          return;
        }
      }
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
       // Verificar se o usuário é admin ou médico
       const userProfile = req.user?.profile;
       if (![ProfileType.GENERAL_ADMINISTRATOR, ProfileType.GENERAL_LOCAL_ADMINISTRATOR, ProfileType.LOCAL_ADMINISTRATOR, ProfileType.DOCTOR].includes(userProfile as ProfileType)) {
         res.status(403).json({
           message: "Only administrators or doctors can get CIDs",
           data: null,
           status_code: 403
         });
         return;
       }

      const page = parseInt(req.params.page) || 1;
      const useCase = container.get<GetCidsUseCase>(TYPES.GetCidsUseCase);
      const result = await useCase.execute(page);
      
      res.status(200).json({
        message: "CID records retrieved successfully",
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

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
       // Verificar se o usuário é admin ou médico
       const userProfile = req.user?.profile;
       if (![ProfileType.GENERAL_ADMINISTRATOR, ProfileType.GENERAL_LOCAL_ADMINISTRATOR, ProfileType.LOCAL_ADMINISTRATOR, ProfileType.DOCTOR].includes(userProfile as ProfileType)) {
         res.status(403).json({
           message: "Only administrators or doctors can search CIDs",
           data: null,
           status_code: 403
         });
         return;
       }

      const searchTerm = req.params.term;
      
      if (!searchTerm || searchTerm.trim().length < 2) {
        res.status(400).json({
          message: "Search term must be at least 2 characters long",
          data: null,
          status_code: 400
        });
        return;
      }
      
      const useCase = container.get<SearchCidUseCase>(TYPES.SearchCidUseCase);
      const result = await useCase.execute(searchTerm);
      
      res.status(200).json({
        message: "CID search results",
        data: result,
        status_code: 200
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verificar se o usuário é admin
      const userProfile = req.user?.profile;
      if (![ProfileType.GENERAL_ADMINISTRATOR].includes(userProfile as ProfileType)) {
        res.status(403).json({
          message: "Only general administrators can update CID records",
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

      const useCase = container.get<UpdateCidUseCase>(TYPES.UpdateCidUseCase);
      const result = await useCase.execute(id, req.body);
      
      res.status(200).json({
        message: "CID updated successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "CID not found": 404,
          "CID code already exists": 400
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
      if (![ProfileType.GENERAL_ADMINISTRATOR].includes(userProfile as ProfileType)) {
        res.status(403).json({
          message: "Only general administrators can delete CID records",
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

      const useCase = container.get<DeleteCidUseCase>(TYPES.DeleteCidUseCase);
      await useCase.execute(id);
      
      res.status(200).json({
        message: "CID deleted successfully",
        data: { deleted: true },
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "CID not found": 404,
          "Cannot delete a CID that is being used in attendances": 400
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