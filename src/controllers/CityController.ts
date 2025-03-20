import { Request, Response, NextFunction } from "express";
import { container } from "../container";
import { TYPES } from "../types";
import { CreateCityUseCase } from "../useCases/city/CreateCityUseCase";
import { GetCitiesUseCase } from "../useCases/city/GetCitiesUseCase";
import { GetCityByIdUseCase } from "../useCases/city/GetCityByIdUseCase";
import { UpdateCityUseCase } from "../useCases/city/UpdateCityUseCase";
import { DeleteCityUseCase } from "../useCases/city/DeleteCityUseCase";
import { SearchCitiesUseCase } from "../useCases/city/SearchCitiesUseCase";
import { ProfileType } from "../constants/profilesTypes";

export class CityController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verificar se o usuário é administrador geral
      const userProfile = req.user?.profile;
      if (userProfile !== ProfileType.GENERAL_ADMINISTRATOR) {
        res.status(403).json({
          message: "Only general administrators can create cities",
          data: null,
          status_code: 403
        });
        return;
      }

      const useCase = container.get<CreateCityUseCase>(TYPES.CreateCityUseCase);
      const result = await useCase.execute(req.body);
      res.status(201).json({
        message: "Successfully created city",
        data: result,
        status_code: 201
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "A city with this name and state already exists") {
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
      // Verificar se o usuário é administrador geral
      const userProfile = req.user?.profile;
      if (userProfile !== ProfileType.GENERAL_ADMINISTRATOR) {
        res.status(403).json({
          message: "Only general administrators can get cities",
          data: null,
          status_code: 403
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const useCase = container.get<GetCitiesUseCase>(TYPES.GetCitiesUseCase);
      const result = await useCase.execute(page);
      
      res.status(200).json({
        message: "Cities successfully recovered",
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
      // Verificar se o usuário é administrador geral
      const userProfile = req.user?.profile;
      if (userProfile !== ProfileType.GENERAL_ADMINISTRATOR) {
        res.status(403).json({
          message: "Only general administrators can get city by ID",
          data: null,
          status_code: 403
        });
        return;
      }

      const id = Number(req.params.id);
      const useCase = container.get<GetCityByIdUseCase>(TYPES.GetCityByIdUseCase);
      const result = await useCase.execute(id);
      
      if (!result) {
        res.status(404).json({
          message: "City not found",
          data: null,
          status_code: 404
        });
        return;
      }

      res.status(200).json({
        message: "City successfully recovered",
        data: result,
        status_code: 200
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verificar se o usuário é administrador geral
      const userProfile = req.user?.profile;
      if (userProfile !== ProfileType.GENERAL_ADMINISTRATOR) {
        res.status(403).json({
          message: "Only general administrators can update cities",
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

      const useCase = container.get<UpdateCityUseCase>(TYPES.UpdateCityUseCase);
      const result = await useCase.execute(id, req.body);
      
      res.status(200).json({
        message: "City updated successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "City not found": 404,
          "A city with this name and state already exists": 400
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
      // Verificar se o usuário é administrador geral
      const userProfile = req.user?.profile;
      if (userProfile !== ProfileType.GENERAL_ADMINISTRATOR) {
        res.status(403).json({
          message: "Only general administrators can delete cities",
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

      const useCase = container.get<DeleteCityUseCase>(TYPES.DeleteCityUseCase);
      await useCase.execute(id);
      
      res.status(200).json({
        message: "City successfully deleted",
        data: { deleted: true },
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "City not found": 404,
          "Cannot delete a city that has associated health units or professionals": 400
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

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verificar se o usuário é administrador geral
      const userProfile = req.user?.profile;
      if (userProfile !== ProfileType.GENERAL_ADMINISTRATOR) {
        res.status(403).json({
          message: "Only general administrators can search cities",
          data: null,
          status_code: 403
        });
        return;
      }

      const term = req.params.term;
      
      if (!term || term.trim().length < 2) {
        res.status(400).json({
          message: "Search term must be at least 2 characters long",
          data: null,
          status_code: 400
        });
        return;
      }
      
      const useCase = container.get<SearchCitiesUseCase>(TYPES.SearchCitiesUseCase);
      const result = await useCase.execute(term.trim());
      
      res.status(200).json({
        message: "City search results",
        data: result,
        status_code: 200
      });
    } catch (error) {
      next(error);
    }
  }
}