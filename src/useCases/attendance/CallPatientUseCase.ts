import { injectable, inject } from "inversify";
import { AttendanceRepository } from "../../repositories/AttendanceRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { Attendance, AttendanceStage } from "@prisma/client";
import { emitCallPatient } from "../../sockets";

interface CallPatientParams {
  attendanceId: number;
  professionalId: number;
  officeNumber?: number;
}

// Constantes para números de consultório padronizados
const OFFICE_NUMBERS = {
  TRIAGE: 1000,
  VACCINE: 1001,
  DENTAL: 1002
};

@injectable()
export class CallPatientUseCase {
  private attendanceRepository: AttendanceRepository;
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.AttendanceRepository) attendanceRepository: AttendanceRepository,
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.attendanceRepository = attendanceRepository;
    this.professionalRepository = professionalRepository;
  }
  
  async execute(params: CallPatientParams): Promise<Attendance> {
    const { attendanceId, professionalId, officeNumber } = params;
    
    // Busca o profissional e o atendimento para verificações
    const professional = await this.professionalRepository.getProfessionalById(professionalId);
    const attendance = await this.attendanceRepository.getAttendanceById(attendanceId);
    if (!professional) {
      throw new Error("Professional not found");
    }
    
    if (!attendance) {
      throw new Error("Attendance not found");
    }
    
    // Verificar se é ACS - ACS não participa do fluxo de chamada
    if (professional.profile === "ACS") {
      throw new Error("Community health agents cannot call patients");
    }
    
    // Determina o número do consultório com base no perfil do profissional e estágio do atendimento
    let finalOfficeNumber: number;
    
    // Primeiro verifica se o estágio do atendimento é compatível com o perfil do profissional
    if (attendance.stage === AttendanceStage.TRIAGE && 
        !['ADMINISTRATOR', 'NURSE', 'NURSING_TECHNICIAN'].includes(professional.profile)) {
      throw new Error("Professional not authorized for triage");
    }
    
    if (attendance.stage === AttendanceStage.MEDICAL_CONSULTATION && 
        !['ADMINISTRATOR', 'DOCTOR'].includes(professional.profile)) {
      throw new Error("Professional not authorized for medical consultation");
    }
    
    if (attendance.stage === AttendanceStage.NURSING_CONSULTATION && 
        !['ADMINISTRATOR', 'NURSE'].includes(professional.profile)) {
      throw new Error("Professional not authorized for nursing consultation");
    }
    
    if (attendance.stage === AttendanceStage.DENTAL_CONSULTATION && 
        !['ADMINISTRATOR', 'ODONTOLOGIST'].includes(professional.profile)) {
      throw new Error("Professional not authorized for dental consultation");
    }
    
    if (attendance.stage === AttendanceStage.VACCINE && 
        !['ADMINISTRATOR', 'NURSE', 'NURSING_TECHNICIAN'].includes(professional.profile)) {
      throw new Error("Professional not authorized for vaccination");
    }
    
    // Determina o número do consultório baseado no perfil e estágio
    switch (attendance.stage) {
      case AttendanceStage.TRIAGE:
        finalOfficeNumber = OFFICE_NUMBERS.TRIAGE;
        break;
        
      case AttendanceStage.VACCINE:
        finalOfficeNumber = OFFICE_NUMBERS.VACCINE;
        break;
        
      case AttendanceStage.DENTAL_CONSULTATION:
        finalOfficeNumber = OFFICE_NUMBERS.DENTAL;
        break;
        
      case AttendanceStage.MEDICAL_CONSULTATION:
        // Médicos sempre precisam de um consultório específico
        if (officeNumber) {
          finalOfficeNumber = officeNumber;
        } else if (professional.currentOffice !== null) {
          finalOfficeNumber = professional.currentOffice;
        } else {
          throw new Error("Office number is required for medical consultation");
        }
        break;
        
      case AttendanceStage.NURSING_CONSULTATION:
        // Enfermeiros também precisam de um consultório específico para consulta
        if (officeNumber) {
          finalOfficeNumber = officeNumber;
        } else if (professional.currentOffice !== null) {
          finalOfficeNumber = professional.currentOffice;
        } else {
          throw new Error("Office number is required for nursing consultation");
        }
        break;
        
      default:
        throw new Error("Invalid attendance stage");
    }
    
    // Atualiza o atendimento com o número de consultório determinado
    const updatedAttendance = await this.attendanceRepository.callPatient(
      attendanceId, 
      finalOfficeNumber
    );

    // Emite o evento de chamada de paciente
    emitCallPatient(updatedAttendance);

    return updatedAttendance;
  }
}