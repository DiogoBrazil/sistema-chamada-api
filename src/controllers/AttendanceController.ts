import { Request, Response, NextFunction } from "express";
import { container } from "../container";
import { TYPES } from "../types";
import { CreateAttendanceUseCase } from "../useCases/attendance/CreateAttendanceUseCase";
import { GetAttendancesUseCase } from "../useCases/attendance/GetAttendancesUseCase";
import { CallPatientUseCase } from "../useCases/attendance/CallPatientUseCase";
import { FinishAttendanceUseCase } from "../useCases/attendance/FinishAttendanceUseCase";

export class AttendanceController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { patientId } = req.body;
      const useCase = container.get<CreateAttendanceUseCase>(TYPES.CreateAttendanceUseCase);
      const result = await useCase.execute(patientId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
  
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = container.get<GetAttendancesUseCase>(TYPES.GetAttendancesUseCase);
      const result = await useCase.execute();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  
  async call(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = Number(req.params.id);
      const officeNumber = Number(req.body.officeNumber);
      const useCase = container.get<CallPatientUseCase>(TYPES.CallPatientUseCase);
      const result = await useCase.execute(userId, officeNumber);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  
  async finish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { professionalId } = req.body;
      const useCase = container.get<FinishAttendanceUseCase>(TYPES.FinishAttendanceUseCase);
      const result = await useCase.execute(id, professionalId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
