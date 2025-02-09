import { Request, Response, NextFunction } from "express";
import { container } from "../container";
import { TYPES } from "../types";
import { GetAttendanceReportUseCase } from "../useCases/attendance/GetAttendanceReportUseCase";
import { IGetAttendanceReportDTO } from "../interfaces/attendance/IGetAttendanceReportDTO";

export class ReportController {
  async getAttendanceReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: IGetAttendanceReportDTO = {
        professionalId: req.params.professionalId,
        startDate: req.params.startDate,
        startTime: req.params.startTime,
        endDate: req.params.endDate,
        endTime: req.params.endTime,
      };

      const useCase = container.get<GetAttendanceReportUseCase>(TYPES.GetAttendanceReportUseCase);
      const result = await useCase.execute(data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
