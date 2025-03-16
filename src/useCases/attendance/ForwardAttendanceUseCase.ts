import { injectable, inject } from "inversify";
import { AttendanceRepository } from "../../repositories/AttendanceRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { TYPES } from "../../types";
import { Attendance, AttendanceStage } from "@prisma/client";
import { IForwardAttendanceDTO } from "../../interfaces/attendance/IForwardAttendanceDTO";

// Perfis que podem encaminhar atendimentos
const FORWARD_ALLOWED_PROFILES = [
  'GENERAL_ADMINISTRATOR',
  'GENERAL_LOCAL_ADMINISTRATOR',
  'LOCAL_ADMINISTRATOR',
  'NURSING_TECHNICIAN',
  'NURSE'
];

@injectable()
export class ForwardAttendanceUseCase {
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
  
  async execute(data: IForwardAttendanceDTO, professionalId: number): Promise<Attendance> {
    const { attendanceId, targetStage } = data;
    
    // Validar o estágio de destino
    if (!['MEDICAL_CONSULTATION', 'NURSING_CONSULTATION', 'DENTAL_CONSULTATION', 'VACCINE'].includes(targetStage)) {
      throw new Error("Estágio de destino inválido. Deve ser 'MEDICAL_CONSULTATION', 'NURSING_CONSULTATION', 'DENTAL_CONSULTATION', ou 'VACCINE'");
    }
    
    // Verificar se o profissional existe e tem permissão para encaminhar
    const professional = await this.professionalRepository.getProfessionalById(professionalId);
    if (!professional) {
      throw new Error("Profissional não encontrado");
    }
    
    if (!FORWARD_ALLOWED_PROFILES.includes(professional.profile)) {
      throw new Error("Seu perfil não permite encaminhar atendimentos");
    }
    
    // Verificar se o atendimento existe
    const attendance = await this.attendanceRepository.getAttendanceById(attendanceId);
    if (!attendance) {
      throw new Error("Atendimento não encontrado");
    }
    
    // Verificar se o atendimento está na fase de triagem (só pode encaminhar da triagem)
    if (attendance.stage !== AttendanceStage.TRIAGE) {
      throw new Error("Somente atendimentos na fase de triagem podem ser encaminhados");
    }
    
    // Verificar se o atendimento já está em andamento
    if (attendance.status !== 'PENDING' && attendance.status !== 'IN_PROGRESS') {
      throw new Error("Somente atendimentos pendentes ou em andamento podem ser encaminhados");
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
      throw new Error("Você não tem acesso a este atendimento");
    }
    
    // Se o atendimento não estiver com número de consultório definido, não pode ser encaminhado
    if (attendance.officeNumber === null) {
      throw new Error("O atendimento precisa estar em andamento para ser encaminhado");
    }
    
    // Mapear o destino para a enumeração correta
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
      throw new Error("Estágio de destino inválido");
    }
    
    // Primeiro finalizar o atendimento atual e depois criar o novo encaminhamento
    return this.attendanceRepository.forwardAttendance(attendanceId, stage, professionalId);
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
