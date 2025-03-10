import { injectable, inject } from "inversify";
import { AttendanceRepository } from "../../repositories/AttendanceRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { TYPES } from "../../types";
import { Attendance, AttendanceStage, AttendanceStatus, Professional } from "@prisma/client";
import { emitCallPatient } from "../../sockets";
import { ProfileType } from "../../constants/profilesTypes";

// Interface para o atendimento enriquecido com informações adicionais
interface EnhancedAttendance {
  // Campos base do atendimento
  id: number;
  patientId: number;
  status: AttendanceStatus;
  stage: AttendanceStage;
  createdAt: Date;
  finishedAt: Date | null;
  professionalId: number | null;
  officeNumber: number | null;
  healthUnitId: number;
  
  // Campos adicionais que serão incluídos
  patient?: any;
  healthUnit?: any;
  cityInfo?: {
    id: number;
    name: string;
    state: string;
  };
}

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

@injectable()
export class CallPatientUseCase {
  private attendanceRepository: AttendanceRepository;
  private professionalRepository: ProfessionalRepository;
  private healthUnitRepository: HealthUnitRepository;
  
  constructor(
    @inject(TYPES.AttendanceRepository) attendanceRepository: AttendanceRepository,
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository,
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository
  ) {
    this.attendanceRepository = attendanceRepository;
    this.professionalRepository = professionalRepository;
    this.healthUnitRepository = healthUnitRepository;
  }
  
  async execute(params: CallPatientParams): Promise<Attendance> {
    const { attendanceId, professionalId, officeNumber } = params;
    
    // Buscar o profissional para verificações
    const professional = await this.professionalRepository.getProfessionalById(professionalId);
    if (!professional) {
      throw new Error("Profissional não encontrado");
    }
    
    // Buscar o atendimento para verificações
    const attendance = await this.attendanceRepository.getAttendanceById(attendanceId);
    if (!attendance) {
      throw new Error("Atendimento não encontrado");
    }
    
    // Verificar se o profissional tem acesso à unidade de saúde do atendimento
    const hasAccessToUnit = await this.professionalRepository.checkProfessionalInHealthUnit(
      professionalId, 
      attendance.healthUnitId
    );
    
    // Para admins gerais, verificar separadamente
    const isGeneralAdmin = professional.profile === ProfileType.GENERAL_ADMINISTRATOR;
    
    // Para admins municipais, verificar acesso à cidade
    const isGeneralLocalAdmin = professional.profile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR;
    let hasAccessToCity = false;
    
    if (isGeneralLocalAdmin && professional.cityId) {
      const healthUnit = await this.healthUnitRepository.getHealthUnitById(attendance.healthUnitId);
      hasAccessToCity = healthUnit?.cityId === professional.cityId;
    }
    
    if (!isGeneralAdmin && !hasAccessToUnit && !hasAccessToCity) {
      throw new Error("Você não tem acesso a este atendimento");
    }
    
    // Verificar se é ACS ou RECEPTIONIST - eles não podem chamar pacientes
    if (['ACS', 'RECEPTIONIST'].includes(professional.profile)) {
      throw new Error("Agentes comunitários e recepcionistas não podem chamar pacientes");
    }
    
    // Verificar se o estágio do atendimento é compatível com o perfil do profissional
    const allowedStages = PROFILE_STAGES_MAP[professional.profile] || [];
    
    if (!allowedStages.includes(attendance.stage)) {
      throw new Error(`Profissional não autorizado para ${this.formatStage(attendance.stage)}`);
    }
    
    // Determinar o número do consultório
    let finalOfficeNumber: number;
    
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
      case AttendanceStage.NURSING_CONSULTATION:
        // Para consultas médicas e de enfermagem, verificar número de consultório
        if (officeNumber) {
          finalOfficeNumber = officeNumber;
        } else if (professional.currentOffice !== null) {
          finalOfficeNumber = professional.currentOffice;
        } else {
          const stageText = attendance.stage === AttendanceStage.MEDICAL_CONSULTATION
            ? 'consulta médica'
            : 'consulta de enfermagem';
            
          throw new Error(`Número do consultório obrigatório para ${stageText}`);
        }
        break;
        
      default:
        throw new Error("Estágio de atendimento inválido");
    }
    
    // Atualizar o atendimento com o número de consultório
    const updatedAttendance = await this.attendanceRepository.callPatient(
      attendanceId, 
      finalOfficeNumber
    );

    // Criar um objeto enriquecido usando a interface definida
    const enhancedAttendance: EnhancedAttendance = { 
      ...updatedAttendance 
    };
    
    try {
      // Buscar detalhes da unidade incluindo a cidade
      if (updatedAttendance.healthUnitId) {
        const healthUnitDetails = await this.healthUnitRepository.getHealthUnitWithCity(
          updatedAttendance.healthUnitId
        );
        
        if (healthUnitDetails && healthUnitDetails.city) {
          // Adicionar informações da cidade ao objeto do atendimento
          enhancedAttendance.cityInfo = {
            id: healthUnitDetails.city.id,
            name: healthUnitDetails.city.name,
            state: healthUnitDetails.city.state
          };
        }
      }
    } catch (error) {
      // Se houver erro ao buscar informações adicionais, apenas log o erro e continue
      console.error("Erro ao buscar detalhes da unidade/cidade:", error);
    }

    // Emitir o evento de chamada de paciente com informações enriquecidas
    emitCallPatient(enhancedAttendance);

    return updatedAttendance;
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