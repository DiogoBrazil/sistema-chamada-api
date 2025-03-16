import { injectable, inject } from "inversify";
import { AttendanceRepository } from "../../repositories/AttendanceRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { CidRepository } from "../../repositories/CidRepository";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { TYPES } from "../../types";
import { Attendance, AttendanceStage, Professional } from "@prisma/client";

interface FinishAttendanceDTO {
  attendanceId: number;
  professionalId: number;
  cidId?: number;
  note?: string;
}

// Mapeamento de estágios de atendimento por perfil profissional
const PROFILE_STAGES_MAP: Record<string, string[]> = {
  'DOCTOR': ['MEDICAL_CONSULTATION'],
  'NURSE': ['TRIAGE', 'NURSING_CONSULTATION', 'VACCINE'],
  'NURSING_TECHNICIAN': ['TRIAGE', 'VACCINE'],
  'ODONTOLOGIST': ['DENTAL_CONSULTATION'],
  'GENERAL_ADMINISTRATOR': ['TRIAGE', 'MEDICAL_CONSULTATION', 'NURSING_CONSULTATION', 'DENTAL_CONSULTATION', 'VACCINE'],
  'GENERAL_LOCAL_ADMINISTRATOR': ['TRIAGE', 'MEDICAL_CONSULTATION', 'NURSING_CONSULTATION', 'DENTAL_CONSULTATION', 'VACCINE'],
  'LOCAL_ADMINISTRATOR': ['TRIAGE', 'MEDICAL_CONSULTATION', 'NURSING_CONSULTATION', 'DENTAL_CONSULTATION', 'VACCINE']
};

// Constantes para números de consultório padronizados
const OFFICE_NUMBERS = {
  TRIAGE: 1000,
  VACCINE: 1001,
  DENTAL: 1002
};

@injectable()
export class FinishAttendanceUseCase {
  private attendanceRepository: AttendanceRepository;
  private professionalRepository: ProfessionalRepository;
  private cidRepository: CidRepository;
  private healthUnitRepository: HealthUnitRepository;
  
  constructor(
    @inject(TYPES.AttendanceRepository) attendanceRepository: AttendanceRepository,
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository,
    @inject(TYPES.CidRepository) cidRepository: CidRepository,
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository
  ) {
    this.attendanceRepository = attendanceRepository;
    this.professionalRepository = professionalRepository;
    this.cidRepository = cidRepository;
    this.healthUnitRepository = healthUnitRepository;
  }
  
  async execute(data: FinishAttendanceDTO): Promise<Attendance> {
    const { attendanceId, professionalId, cidId, note } = data;
    
    // Buscar o profissional para verificações
    const professional = await this.professionalRepository.getProfessionalById(professionalId);
    if (!professional) {
      throw new Error("Professional not found");
    }
    
    // Buscar o atendimento para verificações
    const attendance = await this.attendanceRepository.getAttendanceById(attendanceId);
    if (!attendance) {
      throw new Error("Attendance not found");
    }
    
    // Verificar se é ACS ou RECEPTIONIST - eles não podem finalizar atendimentos
    if (['ACS', 'RECEPTIONIST'].includes(professional.profile)) {
      throw new Error("ACS and receptionists cannot finish attendances");
    }
    
    // Verificar se o profissional tem acesso à unidade de saúde do atendimento
    const hasAccessToUnit = await this.professionalRepository.checkProfessionalInHealthUnit(
      professionalId, 
      attendance.healthUnitId
    );
    
    // Para admins gerais, verificar separadamente
    const isGeneralAdmin = professional.profile === 'GENERAL_ADMINISTRATOR';
    
    // Para admins municipais, verificar acesso à cidade
    const isGeneralLocalAdmin = professional.profile === 'GENERAL_LOCAL_ADMINISTRATOR';
    let hasAccessToCity = false;
    
    if (isGeneralLocalAdmin && professional.cityId) {
      const healthUnit = await this.healthUnitRepository.getHealthUnitById(attendance.healthUnitId);
      hasAccessToCity = healthUnit?.cityId === professional.cityId;
    }
    
    if (!isGeneralAdmin && !hasAccessToUnit && !hasAccessToCity) {
      throw new Error("Professional does not have access to the health unit of the attendance");
    }
    
    // Verificar se o estágio do atendimento é compatível com o perfil do profissional
    const allowedStages = PROFILE_STAGES_MAP[professional.profile] || [];
    
    if (!allowedStages.includes(attendance.stage)) {
      throw new Error(`Professional not authorized for ${this.formatStage(attendance.stage)}`);
    }
    
    // Validar cidId - Apenas médicos podem incluir CID
    if (cidId) {
      if (professional.profile !== 'DOCTOR' && !['GENERAL_ADMINISTRATOR', 'GENERAL_LOCAL_ADMINISTRATOR', 'LOCAL_ADMINISTRATOR'].includes(professional.profile)) {
        throw new Error("Only doctors can include CID in attendance records");
      }
      
      // Verificar se o CID existe
      const cid = await this.cidRepository.getCidById(cidId);
      if (!cid) {
        throw new Error("CID não encontrado");
      }
    }
    
    // Determinar o número de consultório com base no estágio de atendimento
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
    
    // Finalizar o atendimento
    return this.attendanceRepository.finishAttendance({
      id: attendanceId,
      professionalId,
      office,
      cidId,
      note
    });
  }
  
  private formatStage(stage: string): string {
    const stageMap: Record<string, string> = {
      'TRIAGE': 'triagem',
      'VACCINE': 'vacinação',
      'MEDICAL_CONSULTATION': 'consulta médica',
      'NURSING_CONSULTATION': 'consulta de enfermagem',
      'DENTAL_CONSULTATION': 'consulta odontológica'
    };
    
    return stageMap[stage] || stage.toLowerCase();
  }
}