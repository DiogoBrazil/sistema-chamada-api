import { Request, Response, NextFunction } from "express";
import { container } from "../container";
import { TYPES } from "../types";
import { CreateAttendanceUseCase } from "../useCases/attendance/CreateAttendanceUseCase";
import { GetAttendancesUseCase } from "../useCases/attendance/GetAttendancesUseCase";
import { CallPatientUseCase } from "../useCases/attendance/CallPatientUseCase";
import { FinishAttendanceUseCase } from "../useCases/attendance/FinishAttendanceUseCase";
import { GetTriageAttendancesUseCase } from "../useCases/attendance/GetTriageAttendancesUseCase";
import { GetMedicalConsultationAttendancesUseCase } from "../useCases/attendance/GetMedicalConsultationAttendancesUseCase";
import { GetNursingConsultationAttendancesUseCase } from "../useCases/attendance/GetNursingConsultationAttendancesUseCase";
import { ForwardAttendanceUseCase } from "../useCases/attendance/ForwardAttendanceUseCase";
import { GetDentalConsultationAttendancesUseCase } from "../useCases/attendance/GetDentalConsultationAttendancesUseCase";
import { GetVaccineAttendancesUseCase } from "../useCases/attendance/GetVaccineAttendancesUseCase";

export class AttendanceController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;
      const useCase = container.get<CreateAttendanceUseCase>(TYPES.CreateAttendanceUseCase);
      const result = await useCase.execute(data);
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
      // Verifica se o usuário tem um perfil permitido
      const userProfile = req.user?.profile;
      if (!['GENERAL_ADMINISTRATOR', 'GENERAL_LOCAL_ADMINISTRATOR', 'LOCAL_ADMINISTRATOR', 'DOCTOR', 'NURSE'].includes(userProfile || '')) {
        res.status(403).json({
          message: "Only administrators, doctors or nurses can get all attendances",
          data: null,
          status_code: 403
        });
        return;
      }
      const data = req.body;
      const useCase = container.get<GetAttendancesUseCase>(TYPES.GetAttendancesUseCase);
      const result = await useCase.execute(data);
      res.status(200).json({
        message: "Attendances retrieved successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      next(error);
    }
  }

  async getTriage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const healthUnitId = Number(req.params.healthUnitId);

      // Verifica se o usuário tem um perfil permitido
      const professionalId = req.user?.id;
      const userProfile = req.user?.profile;

      if (!['GENERAL_ADMINISTRATOR', 'GENERAL_LOCAL_ADMINISTRATOR', 'LOCAL_ADMINISTRATOR', 'DOCTOR','NURSING_TECHNICIAN', 'NURSE'].includes(userProfile || '')) {
        res.status(403).json({
          message: "Only administrators, doctors, nursing technicians or nurses can get triage attendances",
          data: null,
          status_code: 403
        });
        return;
      }

      if (!professionalId || !userProfile) {
        res.status(400).json({
          message: "Unauthecated user",
          data: null,
          status_code: 400
        });
        return;
      }

      const useCase = container.get<GetTriageAttendancesUseCase>(TYPES.GetTriageAttendancesUseCase);
      const result = await useCase.execute(healthUnitId, professionalId);
      res.status(200).json({
        message: "Triage attendances retrieved successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      next(error);
    }
  }

  async getMedicalConsultation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const healthUnitId = Number(req.params.healthUnitId);

      // Verifica se o usuário tem um perfil permitido
      const professionalId = req.user?.id;
      const userProfile = req.user?.profile;

      if (!['GENERAL_ADMINISTRATOR', 'GENERAL_LOCAL_ADMINISTRATOR', 'LOCAL_ADMINISTRATOR', 'DOCTOR'].includes(userProfile || '')) {
        res.status(403).json({
          message: "Only administrators or doctors can get medical attendances",
          data: null,
          status_code: 403
        });
        return;
      }

      if (!professionalId || !userProfile) {
        res.status(400).json({
          message: "Unauthecated user",
          data: null,
          status_code: 400
        });
        return;
      }

      const useCase = container.get<GetMedicalConsultationAttendancesUseCase>(TYPES.GetMedicalConsultationAttendancesUseCase);
      const result = await useCase.execute(healthUnitId, professionalId);
      res.status(200).json({
        message: "Medical consultation attendances retrieved successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      next(error);
    }
  }

  async getNursingConsultation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const healthUnitId = Number(req.params.healthUnitId);

      // Verifica se o usuário tem um perfil permitido
      const professionalId = req.user?.id;
      const userProfile = req.user?.profile;

      if (!['GENERAL_ADMINISTRATOR', 'GENERAL_LOCAL_ADMINISTRATOR', 'LOCAL_ADMINISTRATOR', 'DOCTOR', 'NURSE'].includes(userProfile || '')) {
        res.status(403).json({
          message: "Only administrators, doctors or nurses can get nursing attendances",
          data: null,
          status_code: 403
        });
        return;
      }

      if (!professionalId || !userProfile) {
        res.status(400).json({
          message: "Unauthecated user",
          data: null,
          status_code: 400
        });
        return;
      }

      const useCase = container.get<GetNursingConsultationAttendancesUseCase>(TYPES.GetNursingConsultationAttendancesUseCase);
      const result = await useCase.execute(healthUnitId, professionalId);
      res.status(200).json({
        message: "Nursing consultation attendances retrieved successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      next(error);
    }
  }

  async getDentalConsultation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const healthUnitId = Number(req.params.healthUnitId);

      // Verifica se o usuário tem um perfil permitido
      const professionalId = req.user?.id;
      const userProfile = req.user?.profile;

      if (!['GENERAL_ADMINISTRATOR', 'GENERAL_LOCAL_ADMINISTRATOR', 'LOCAL_ADMINISTRATOR', 'ODONTOLOGIST'].includes(userProfile || '')) {
        res.status(403).json({
          message: "Only administrators or odondologist can get dental attendances",
          data: null,
          status_code: 403
        });
        return;
      }

      if (!professionalId || !userProfile) {
        res.status(400).json({
          message: "Unauthecated user",
          data: null,
          status_code: 400
        });
        return;
      }
  
      const useCase = container.get<GetDentalConsultationAttendancesUseCase>(TYPES.GetDentalConsultationAttendancesUseCase);
      const result = await useCase.execute(healthUnitId, professionalId);
      res.status(200).json({
        message: "Dental consultation attendances retrieved successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      next(error);
    }
  }


  async getVaccine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const healthUnitId = Number(req.params.healthUnitId);

      // Verifica se o usuário tem um perfil permitido
      const professionalId = req.user?.id;
      const userProfile = req.user?.profile;

      if (!['GENERAL_ADMINISTRATOR', 'GENERAL_LOCAL_ADMINISTRATOR', 'LOCAL_ADMINISTRATOR', 'DOCTOR', 'NURSE', 'NURSING_TECHNICIAN'].includes(userProfile || '')) {
        res.status(403).json({
          message: "Only administrators, doctor, nurse or nursing technician can get vaccine attendances",
          data: null,
          status_code: 403
        });
        return;
      }

      if (!professionalId || !userProfile) {
        res.status(400).json({
          message: "Unauthecated user",
          data: null,
          status_code: 400
        });
        return;
      }
  
      const useCase = container.get<GetVaccineAttendancesUseCase>(TYPES.GetVaccineAttendancesUseCase);
      const result = await useCase.execute(healthUnitId, professionalId);
      res.status(200).json({
        message: "Vaccine attendances retrieved successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      next(error);
    }
  }
  
  async call(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verifica se o usuário tem um perfil permitido (ACS não pode chamar pacientes)
      const userProfile = req.user?.profile;
      if (!['DOCTOR', 'NURSE', 'NURSING_TECHNICIAN', 'ODONTOLOGIST'].includes(userProfile || '')) {
        res.status(403).json({
          message: "Only general administrator, doctors, nurses, nursing technicians or odontologists can call patients",
          data: null,
          status_code: 403
        });
        return;
      }
      
   
      const attendanceId = Number(req.params.id);
      const professionalId = req.user?.id;

      if (!professionalId) {
        res.status(400).json({
          message: "Unauthenticated user",
          data: null,
          status_code: 400
        });
        return;
      }
      
      // officeNumber é opcional e será determinado com base no perfil e estágio
      const officeNumber = req.body.officeNumber ? Number(req.body.officeNumber) : undefined;
      
      const useCase = container.get<CallPatientUseCase>(TYPES.CallPatientUseCase);
      const result = await useCase.execute({
        attendanceId,
        professionalId,
        officeNumber
      });
      
      res.status(200).json({
        message: "Patient called successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        // Lista de mensagens de erro possíveis e seus códigos HTTP
        const errorMessages: { [key: string]: number } = {
          "Professional not found": 404,
          "Attendance not found": 404,
          "Community health agents cannot call patients": 403,
          "Professional not authorized for triage": 403,
          "Professional not authorized for medical consultation": 403,
          "Professional not authorized for nursing consultation": 403,
          "Professional not authorized for dental consultation": 403,
          "Professional not authorized for vaccination": 403,
          "Office number is required for medical consultation": 400,
          "Office number is required for nursing consultation": 400,
          "Invalid attendance stage": 400
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
  
  async finish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verifica se o usuário tem um perfil permitido (ACS não pode finalizar atendimentos)
      const userProfile = req.user?.profile;
      if (!['ADMINISTRATOR', 'DOCTOR', 'NURSE', 'NURSING_TECHNICIAN', 'ODONTOLOGIST'].includes(userProfile || '')) {
        res.status(403).json({
          message: "Only administrators, doctors, nurses, nursing technicians or odontologists can finish attendances",
          data: null,
          status_code: 403
        });
        return;
      }
      
      // Verificação específica para bloquear ACS
      if (userProfile === 'ACS') {
        res.status(403).json({
          message: "Community health agents cannot finish attendances",
          data: null,
          status_code: 403
        });
        return;
      }
   
      const attendanceId = Number(req.params.id);
      const professionalId = req.user?.id;
      const { cidId, note } = req.body;
      
      if (!professionalId) {
        res.status(400).json({
          message: "Professional ID not found in token",
          data: null,
          status_code: 400
        });
        return;
      }
      
      // Validar cidId - Apenas médicos podem incluir CID
      if (cidId) {
        if (userProfile !== 'DOCTOR' && userProfile !== 'ADMINISTRATOR') {
          res.status(403).json({
            message: "Only doctors can include CID in attendance records",
            data: null,
            status_code: 403
          });
          return;
        }
        
        if (isNaN(Number(cidId))) {
          res.status(400).json({
            message: "Invalid CID ID",
            data: null,
            status_code: 400
          });
          return;
        }
      }
      
      const useCase = container.get<FinishAttendanceUseCase>(TYPES.FinishAttendanceUseCase);
      const result = await useCase.execute({
        attendanceId,
        professionalId,
        cidId: cidId ? Number(cidId) : undefined,
        note
      });
      
      res.status(200).json({
        message: "Attendance finished successfully",
        data: result,
        status_code: 200
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: { [key: string]: number } = {
          "Professional not found": 404,
          "Attendance not found": 404,
          "Community health agents cannot finish attendances": 403,
          "Office not set for the professional": 400,
          "CID not found": 404
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

  async forward(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verifica se o usuário tem um perfil permitido para encaminhar
      const userProfile = req.user?.profile;
      if (!['ADMINISTRATOR', 'NURSING_TECHNICIAN', 'NURSE'].includes(userProfile || '')) {
        res.status(403).json({
          message: "Only administrators, nursing technicians or nurses can forward attendances",
          data: null,
          status_code: 403
        });
        return;
      }

      const professionalId = req.user?.id;
      
      if (!professionalId) {
        res.status(403).json({
          message: "User not authenticated",
          data: null,
          status_code: 403
        });
        return;
      }
   
      const id = Number(req.params.id);
      const { targetStage } = req.body;
      
      if (!['MEDICAL_CONSULTATION', 'NURSING_CONSULTATION', 'DENTAL_CONSULTATION', 'VACCINE'].includes(targetStage)) {
        res.status(400).json({
          message: "Invalid target stage. Must be 'MEDICAL_CONSULTATION', 'NURSING_CONSULTATION', 'DENTAL_CONSULTATION', or 'VACCINE'",
          data: null,
          status_code: 400
        });
        return;
      }
  
      const useCase = container.get<ForwardAttendanceUseCase>(TYPES.ForwardAttendanceUseCase);
      const result = await useCase.execute({ attendanceId: id, targetStage }, professionalId);
      
      // Formato personalizado para mensagem de resposta
      const formattedStage = targetStage === 'VACCINE' 
        ? 'vaccination' 
        : targetStage.replace('_', ' ').toLowerCase();
      
      res.status(200).json({
        message: `Attendance forwarded to ${formattedStage} successfully`,
        data: result,
        status_code: 200
      });
    } catch (error) {
      next(error);
    }
  }
}