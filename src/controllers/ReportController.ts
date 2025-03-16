import { Request, Response, NextFunction } from "express";
import { container } from "../container";
import { TYPES } from "../types";
import { GetAttendanceReportUseCase } from "../useCases/attendance/GetAttendanceReportUseCase";
import { GetCityAttendanceReportUseCase } from "../useCases/resports/GetCityAttendanceReportUseCase";
import { GetHealthUnitAttendanceReportUseCase } from "../useCases/resports/GetHealthUnitAttendanceReportUseCase";
import { IGetAttendanceReportDTO } from "../interfaces/attendance/IGetAttendanceReportDTO";
import { ProfileType, ADMIN_PROFILES } from "../constants/profilesTypes";

export class ReportController {
  // Relatório individual de profissional
  async getAttendanceReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: IGetAttendanceReportDTO = {
        professionalId: req.params.professionalId,
        startDate: req.params.startDate,
        startTime: req.params.startTime,
        endDate: req.params.endDate,
        endTime: req.params.endTime,
        healthUnitId: Number(req.params.healthUnitId),
        cityId: Number(req.params.cityId),
      };

      // Verificar permissão - apenas pode ver relatórios do próprio profissional 
      // ou administradores podem ver de qualquer um
      const userProfile = req.user?.profile as ProfileType;
      const userId = req.user?.id;
      
      if (userId !== Number(data.professionalId) && !ADMIN_PROFILES.includes(userProfile)) {
        res.status(403).json({
          message: "You can only see reports for your own attendance",
          data: null,
          status_code: 403
        });
        return;
      }

      const useCase = container.get<GetAttendanceReportUseCase>(TYPES.GetAttendanceReportUseCase);
      const result = await useCase.execute(data);
      
      res.status(200).json({
        message: "Relatório gerado com sucesso",
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
  
  // Relatório por cidade
  async getCityAttendanceReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cityId = Number(req.params.cityId);
      const data = {
        cityId,
        startDate: req.params.startDate,
        startTime: req.params.startTime,
        endDate: req.params.endDate,
        endTime: req.params.endTime,
        professionalId: req.query.professionalId ? Number(req.query.professionalId) : undefined
      };
      
      // Verificar permissões básicas
      const userProfile = req.user?.profile as ProfileType;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          message: "Unauthenticated user",
          data: null,
          status_code: 401
        });
        return;
      }
      
      const useCase = container.get<GetCityAttendanceReportUseCase>(TYPES.GetCityAttendanceReportUseCase);
      const result = await useCase.execute(data, userId);
      
      res.status(200).json({
        message: "City report generated successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "City not found": 404,
          "You do not have permission to access reports for this city": 403,
          "Invalid date and/or time": 400
        };
        
        const statusCode = errorMessages[error.message] || 400;
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
  
  // Relatório por unidade de saúde
  async getHealthUnitAttendanceReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const healthUnitId = Number(req.params.healthUnitId);
      const data = {
        healthUnitId,
        startDate: req.params.startDate,
        startTime: req.params.startTime,
        endDate: req.params.endDate,
        endTime: req.params.endTime,
        professionalId: req.query.professionalId ? Number(req.query.professionalId) : undefined
      };
      
      // Verificar permissões básicas
      const userProfile = req.user?.profile as ProfileType;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          message: "Unauthenticated user",
          data: null,
          status_code: 401
        });
        return;
      }
      
      const useCase = container.get<GetHealthUnitAttendanceReportUseCase>(TYPES.GetHealthUnitAttendanceReportUseCase);
      const result = await useCase.execute(data, userId);
      
      res.status(200).json({
        message: "Healthcare unit report generated successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Health facility not found": 404,
          "You do not have permission to access reports for this facility": 403,
          "Invalid date and/or time": 400
        };
        
        const statusCode = errorMessages[error.message] || 400;
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
