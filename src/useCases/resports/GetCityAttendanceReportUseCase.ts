import { injectable, inject } from "inversify";
import { AttendanceRepository } from "../../repositories/AttendanceRepository";
import { CityRepository } from "../../repositories/CityRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { ProfileType } from "../../constants/profilesTypes";
import  { ICityAttendanceReportDTO } from "../../interfaces/city/ICityAttendanceReportDTO";
import { IReportResult } from "../../interfaces/city/IReportResult";


@injectable()
export class GetCityAttendanceReportUseCase {
  private attendanceRepository: AttendanceRepository;
  private cityRepository: CityRepository;
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.AttendanceRepository) attendanceRepository: AttendanceRepository,
    @inject(TYPES.CityRepository) cityRepository: CityRepository,
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.attendanceRepository = attendanceRepository;
    this.cityRepository = cityRepository;
    this.professionalRepository = professionalRepository;
  }
  
  async execute(data: ICityAttendanceReportDTO, requestingUserId: number): Promise<IReportResult> {
    const { cityId, startDate, startTime, endDate, endTime, professionalId } = data;
    
    // Validar acesso - verificar se o usuário pertence à cidade ou é um administrador geral
    const requestingUser = await this.professionalRepository.getProfessionalById(requestingUserId);
    if (!requestingUser) {
      throw new Error("User not found");
    }
    
    const hasAccess = 
      requestingUser.profile === ProfileType.GENERAL_ADMINISTRATOR || 
      (requestingUser.profile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR && requestingUser.cityId === cityId) ||
      (await this.professionalRepository.isProfessionalLinkedToCity(requestingUserId, cityId));
    
    if (!hasAccess) {
      throw new Error("You do not have permission to access reports from this city");
    }
    
    // Buscar informações da cidade
    const city = await this.cityRepository.getCityById(cityId);
    if (!city) {
      throw new Error("City not found");
    }
    
    // Converter as datas para o formato correto
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid date");
    }
    
    // Buscar atendimentos
    const attendances = await this.attendanceRepository.getAttendanceHistory({
      professionalId, 
      startDate: start,
      endDate: end,
      cityId      // filtrar por cidade
    });
    
    // Coletar informações para o relatório
    const healthUnitCount = city.healthUnits?.length || 0;
    const professionalCount = await this.cityRepository.getProfessionalCountByCity(cityId);
    
    // Calcular estatísticas
    const totalAttendances = attendances.length;
    const finishedAttendances = attendances.filter(a => a.status === 'FINISHED').length;
    
    // Calcular duração média (se disponível nos dados)
    let totalDuration = 0;
    let attendancesWithDuration = 0;
    
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
    
    // Calcular média em minutos
    const averageDuration = attendancesWithDuration > 0 
      ? Math.round(totalDuration / attendancesWithDuration / (1000 * 60)) 
      : 0;
    
    // Construir resultado
    return {
      cityInfo: {
        id: city.id,
        name: city.name,
        state: city.state,
        healthUnitCount,
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