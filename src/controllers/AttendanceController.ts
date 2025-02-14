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
      res.status(201).json({
        message: "Attendance created successfully",
        data: result,
        status_code: 201
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verifica se o usuário é admin
      const userProfile = req.user?.profile;
      if (userProfile !== 'ADMINISTRATOR' && userProfile !== 'DOCTOR') {
        res.status(403).json({
          message: "Only administrators or Doctors can get attendances",
          data: null,
          status_code: 403
        });
        return;
      }


      const useCase = container.get<GetAttendancesUseCase>(TYPES.GetAttendancesUseCase);
      const result = await useCase.execute();
      res.status(200).json({
        message: "Attendances retrieved successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      next(error);
    }
  }
  
  async call(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

       // Verifica se o usuário é admin
       const userProfile = req.user?.profile;
       if (userProfile !== 'ADMINISTRATOR' && userProfile !== 'DOCTOR') {
         res.status(403).json({
           message: "Only administrators or Doctors can call attendances",
           data: null,
           status_code: 403
         });
         return;
       }
 
      const userId = Number(req.params.id);
      const officeNumber = Number(req.body.officeNumber);
      const useCase = container.get<CallPatientUseCase>(TYPES.CallPatientUseCase);
      const result = await useCase.execute(userId, officeNumber);
      res.status(200).json({
        message: "Patient called successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      next(error);
    }
  }
  
  async finish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
       // Verifica se o usuário é admin
       const userProfile = req.user?.profile;
       if (userProfile !== 'ADMINISTRATOR' && userProfile !== 'DOCTOR') {
         res.status(403).json({
           message: "Only administrators or Doctors can finish attendances",
           data: null,
           status_code: 403
         });
         return;
       }
 
      const id = Number(req.params.id);
      const { professionalId } = req.body;
      const useCase = container.get<FinishAttendanceUseCase>(TYPES.FinishAttendanceUseCase);
      const result = await useCase.execute(id, professionalId);
      res.status(200).json({
        message: "Attendance finished successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      next(error);
    }
  }
}