import { injectable, inject } from "inversify";
import { AttendanceRepository } from "../../repositories/AttendanceRepository";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { CityRepository } from "../../repositories/CityRepository";
import { ProfileType } from "../../constants/profilesTypes";
import { IHealthUnitAttendanceReportDTO } from "../../interfaces/healthUnit/IHealthUnitAttendanceReportDTO";
import { IReportResult } from "../../interfaces/healthUnit/IReportResult";
import { TYPES } from "../../types";

@injectable()
export class GetHealthUnitAttendanceReportUseCase {
  private attendanceRepository: AttendanceRepository;
  private healthUnitRepository: HealthUnitRepository;
  private professionalRepository: ProfessionalRepository;
  private cityRepository: CityRepository;
  
  constructor(
    @inject(TYPES.AttendanceRepository) attendanceRepository: AttendanceRepository,
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository,
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository,
    @inject(TYPES.CityRepository) cityRepository: CityRepository
  ) {
    this.attendanceRepository = attendanceRepository;
    this.healthUnitRepository = healthUnitRepository;
    this.professionalRepository = professionalRepository;
    this.cityRepository = cityRepository;
  }
  
  async execute(data: IHealthUnitAttendanceReportDTO, requestingUserId: number): Promise<IReportResult> {
    const { healthUnitId, startDate, startTime, endDate, endTime, professionalId } = data;
    
    // Validar o ID da unidade de saúde
    if (isNaN(healthUnitId) || healthUnitId <= 0) {
      throw new Error("ID de unidade de saúde inválido");
    }
    
    // Buscar informações da unidade de saúde
    const healthUnit = await this.healthUnitRepository.getHealthUnitById(healthUnitId);
    if (!healthUnit) {
      throw new Error("Unidade de saúde não encontrada");
    }
    
    // Validar acesso - verificar se o usuário pertence à unidade ou tem acesso administrativo
    const requestingUser = await this.professionalRepository.getProfessionalById(requestingUserId);
    if (!requestingUser) {
      throw new Error("Usuário não encontrado");
    }
    
    // Determinar se o usuário tem acesso à unidade
    let hasAccess = false;
    
    if (requestingUser.profile === ProfileType.GENERAL_ADMINISTRATOR) {
      // Admin geral tem acesso a todas as unidades
      hasAccess = true;
    } 
    else if (requestingUser.profile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
      // Admin municipal tem acesso às unidades de sua cidade
      hasAccess = healthUnit.cityId === requestingUser.cityId;
    }
    else if (requestingUser.profile === ProfileType.LOCAL_ADMINISTRATOR) {
      // Admin local tem acesso apenas às unidades que administra
      hasAccess = await this.professionalRepository.checkProfessionalInHealthUnit(requestingUserId, healthUnitId);
    }
    else {
      // Outros perfis precisam trabalhar na unidade
      hasAccess = await this.professionalRepository.checkProfessionalInHealthUnit(requestingUserId, healthUnitId);
    }
    
    if (!hasAccess) {
      throw new Error("Você não tem permissão para acessar relatórios desta unidade de saúde");
    }
    
    // Converter as datas para o formato correto
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Data e/ou hora inválidas");
    }
    
    if (start > end) {
      throw new Error("A data/hora de início deve ser anterior à data/hora de término");
    }
    
    // Filtros para a busca de atendimentos
    const filters: any = {
      startDate: start,
      endDate: end,
      healthUnitId
    };
    
    // Se um profissional específico foi solicitado
    if (professionalId) {
      // Verificar se o profissional existe
      const professional = await this.professionalRepository.getProfessionalById(professionalId);
      if (!professional) {
        throw new Error("Profissional não encontrado");
      }
      
      // Verificar se o profissional está vinculado à unidade
      const isProfessionalInUnit = await this.professionalRepository.checkProfessionalInHealthUnit(
        professionalId, 
        healthUnitId
      );
                                   
      if (!isProfessionalInUnit) {
        throw new Error("Este profissional não está vinculado à unidade de saúde solicitada");
      }
      
      filters.professionalId = professionalId;
    }
    
    // Buscar atendimentos
    const attendances = await this.attendanceRepository.getAttendanceHistory(filters);
    
    // Coletar informações complementares
    const professionalCount = healthUnit.professionals ? healthUnit.professionals.length : 0;
    
    // Buscar dados da cidade da unidade usando o cityId
    let cityName = "Não informado";
    let cityState = "??";
    
    if (healthUnit.cityId) {
      const city = await this.cityRepository.getCityById(healthUnit.cityId);
      if (city) {
        cityName = city.name;
        cityState = city.state;
      }
    }
    
    // Calcular estatísticas
    const totalAttendances = attendances.length;
    const finishedAttendances = attendances.filter(a => a.status === 'FINISHED').length;
    
    // Contagem por estágio
    const byStage = {
      triage: 0,
      medicalConsultation: 0,
      nursingConsultation: 0,
      dentalConsultation: 0,
      vaccine: 0
    };
    
    attendances.forEach(att => {
      // Contar por estágio
      const stage = att.toStage;
      if (stage === 'TRIAGE') byStage.triage++;
      else if (stage === 'MEDICAL_CONSULTATION') byStage.medicalConsultation++;
      else if (stage === 'NURSING_CONSULTATION') byStage.nursingConsultation++;
      else if (stage === 'DENTAL_CONSULTATION') byStage.dentalConsultation++;
      else if (stage === 'VACCINE') byStage.vaccine++;
    });
    
    // Definir duração média como 0 por enquanto
    // Remover temporariamente o cálculo de duração média
    const averageDuration = 0;
    
    // Construir resultado
    return {
      healthUnitInfo: {
        id: healthUnit.id,
        name: healthUnit.name,
        cityName: cityName,
        cityState: cityState,
        professionalCount
      },
      summary: {
        totalAttendances,
        finishedAttendances,
        averageDuration,
        byStage
      },
      attendances
    };
  }
}