import { injectable, inject } from "inversify";
import { AttendanceRepository } from "../../repositories/AttendanceRepository";
import { TYPES } from "../../types";
import { Attendance, AttendanceStage } from "@prisma/client";
import { IForwardAttendanceDTO } from "../../interfaces/attendance/IForwardAttendanceDTO";

@injectable()
export class ForwardAttendanceUseCase {
  private attendanceRepository: AttendanceRepository;
  
  constructor(
    @inject(TYPES.AttendanceRepository) attendanceRepository: AttendanceRepository
  ) {
    this.attendanceRepository = attendanceRepository;
  }
  
  async execute(data: IForwardAttendanceDTO, professionalId: number): Promise<Attendance> {
    const { attendanceId, targetStage } = data;
    
    // Mapeia o destino para a enumeração correta
    let stage: AttendanceStage;
    
    if (targetStage === 'MEDICAL_CONSULTATION') {
      stage = AttendanceStage.MEDICAL_CONSULTATION;
    } else if (targetStage === 'NURSING_CONSULTATION') {
      stage = AttendanceStage.NURSING_CONSULTATION;
    } else if (targetStage === 'DENTAL_CONSULTATION') {
      stage = AttendanceStage.DENTAL_CONSULTATION;
    } else if (targetStage === 'VACCINE') {
      stage = AttendanceStage.VACCINE;
    } else {
      throw new Error("Invalid target stage");
    }
    
    return this.attendanceRepository.forwardAttendance(attendanceId, stage, professionalId);
  }
}