import { injectable, inject } from "inversify";
import { AttendanceRepository } from "../../repositories/AttendanceRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { CidRepository } from "../../repositories/CidRepository";
import { TYPES } from "../../types";
import { Attendance, AttendanceStage } from "@prisma/client";


const OFFICE_NUMBERS = {
  TRIAGE: 1000,
  VACCINE: 1001,
  DENTAL: 1002
};

interface FinishAttendanceDTO {
  attendanceId: number;
  professionalId: number;
  cidId?: number;
  note?: string;
}

@injectable()
export class FinishAttendanceUseCase {
  private attendanceRepository: AttendanceRepository;
  private professionalRepository: ProfessionalRepository;
  private cidRepository: CidRepository;
  
  constructor(
    @inject(TYPES.AttendanceRepository) attendanceRepository: AttendanceRepository,
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository,
    @inject(TYPES.CidRepository) cidRepository: CidRepository
  ) {
    this.attendanceRepository = attendanceRepository;
    this.professionalRepository = professionalRepository;
    this.cidRepository = cidRepository;
  }
  
  async execute(data: FinishAttendanceDTO): Promise<Attendance> {
    const { attendanceId, professionalId, cidId, note } = data;
    
    const professional = await this.professionalRepository.getProfessionalById(professionalId);
    if (!professional) {
      throw new Error("Professional not found");
    }
    
    // Verificar se é ACS - ACS não participa do fluxo de atendimento
    if (professional.profile === "ACS") {
      throw new Error("Community health agents cannot finish attendances");
    }
    
    const attendance = await this.attendanceRepository.getAttendanceById(attendanceId);
    if (!attendance) {
      throw new Error("Attendance not found");
    }
    
    // Verificar se o CID existe (se fornecido)
    if (cidId !== undefined) {
      // Verificar se o profissional é médico
      if (professional.profile !== "DOCTOR" && professional.profile !== "ADMINISTRATOR") {
        throw new Error("Only doctors can include CID in attendance records");
      }
      
      const cid = await this.cidRepository.getCidById(cidId);
      if (!cid) {
        throw new Error("CID not found");
      }
    }
    
    // Determina o número de consultório com base no estágio de atendimento
    let office: number;
    
    switch (attendance.stage) {
      case AttendanceStage.TRIAGE:
        office = OFFICE_NUMBERS.TRIAGE;
        break;
        
      case AttendanceStage.VACCINE:
        office = OFFICE_NUMBERS.VACCINE;
        break;
        
      case AttendanceStage.DENTAL_CONSULTATION:
        office = OFFICE_NUMBERS.DENTAL;
        break;
        
      case AttendanceStage.MEDICAL_CONSULTATION:
      case AttendanceStage.NURSING_CONSULTATION:
        // Para consultas médicas e de enfermagem, usamos o consultório atual do profissional
        if (professional.currentOffice === null || professional.currentOffice === undefined) {
          throw new Error("Office not set for the professional");
        }
        office = professional.currentOffice;
        break;
        
      default:
        throw new Error("Invalid attendance stage");
    }
    
    return this.attendanceRepository.finishAttendance(attendanceId, professionalId, office, cidId, note);
  }
}