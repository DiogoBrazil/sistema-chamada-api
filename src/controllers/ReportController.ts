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
      res.status(200).json({
        message: "Report generated successfully",
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
}