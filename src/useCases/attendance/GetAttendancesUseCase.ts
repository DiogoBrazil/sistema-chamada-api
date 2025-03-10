import { injectable, inject } from "inversify";
import { AttendanceRepository } from "../../repositories/AttendanceRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { CityRepository } from "../../repositories/CityRepository";
import { TYPES } from "../../types";
import { IGetAttendancesDTO } from "../../interfaces/attendance/IGetAttendancesDTO";
import { Attendance, AttendanceStage, Professional } from "@prisma/client";


@injectable()
export class GetAttendancesUseCase {
  private attendanceRepository: AttendanceRepository;
  private professionalRepository: ProfessionalRepository;
  private cityRepository: CityRepository;
  private healthUnitRepository: HealthUnitRepository;
  
  constructor(
    @inject(TYPES.AttendanceRepository) attendanceRepository: AttendanceRepository,
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository,
    @inject(TYPES.CityRepository) cityRepository: CityRepository,
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository
  ) {
    this.attendanceRepository = attendanceRepository;
    this.professionalRepository = professionalRepository;
    this.cityRepository = cityRepository;
    this.healthUnitRepository = healthUnitRepository;
  }
  
  async execute(data: IGetAttendancesDTO): Promise<Attendance[]> {
    const { professionalId, healthUnitId, cityId, stage } = data;
    
    // Verificar se o profissional existe
    const professional = await this.professionalRepository.getProfessionalById(professionalId);
    if (!professional) {
      throw new Error("Profissional não encontrado");
    }
    
    // Determinar os filtros com base no perfil do profissional e parâmetros fornecidos
    const filters: any = {};
    
    if (stage) {
      filters.stage = stage;
    }
    
    // Aplicar filtros com base no perfil e acessos do profissional
    if (professional.profile === "GENERAL_ADMINISTRATOR") {
      // Admin geral pode ver todos ou filtrar por cidade/unidade específica
      if (healthUnitId) {
        // Verificar se a unidade existe
        const healthUnit = await this.healthUnitRepository.getHealthUnitById(healthUnitId);
        if (!healthUnit) {
          throw new Error("Health unit not found");
        }
        
        filters.healthUnitId = healthUnitId;
      } else if (cityId) {
        // Verificar se a cidade existe
        const city = await this.cityRepository.getCityById(cityId);
        if (!city) {
          throw new Error("City not found");
        }
        
        filters.cityId = cityId;
      }
      // Se não houver filtros específicos, retorna todos
    } 
    else if (professional.profile === "GENERAL_LOCAL_ADMINISTRATOR") {
      // Admin municipal pode ver apenas de sua cidade
      if (!professional.cityId) {
        throw new Error("General local administrator is not linked to any city");
      }
      
      if (healthUnitId) {
        // Verificar se a unidade pertence à cidade do admin
        const healthUnit = await this.healthUnitRepository.getHealthUnitById(healthUnitId);
        if (!healthUnit || healthUnit.cityId !== professional.cityId) {
          throw new Error("Health unit not found or does not belong to your city");
        }
        
        filters.healthUnitId = healthUnitId;
      } else {
        // Se não houver unidade específica, filtra por cidade
        filters.cityId = professional.cityId;
      }
    } 
    else {
      // Demais perfis podem ver apenas de suas unidades
      if (healthUnitId) {
        // Verificar se o profissional tem acesso à unidade
        const hasAccess = await this.professionalRepository.checkProfessionalInHealthUnit(professionalId, healthUnitId);
        if (!hasAccess) {
          throw new Error("Professional does not have access to this health unit");
        }
        
        filters.healthUnitId = healthUnitId;
      } else {
        // Buscar as unidades do profissional
        const professionalWithUnits = await this.professionalRepository.getProfessionalWithHealthUnits(professionalId);
        
        if (!professionalWithUnits || !professionalWithUnits.healthUnit || professionalWithUnits.healthUnit.length === 0) {
          throw new Error("Professional is not linked to any health unit");
        }
        
        // Se o profissional estiver em mais de uma unidade, filtrar por todas elas
        if (professionalWithUnits.healthUnit.length === 1) {
          filters.healthUnitId = professionalWithUnits.healthUnit[0].id;
        } else {
          // Caso o profissional trabalhe em múltiplas unidades, o repositório precisa suportar filtro por múltiplas unidades
          // Esse caso pode requerer ajustes no repositório ou uma abordagem diferente
          // Por simplicidade, por enquanto pegar apenas a primeira unidade
          //TODO: Implementar lógica para escolher a unidade correta
          filters.healthUnitId = professionalWithUnits.healthUnit[0].id;
        }
      }
    }
    
    // Buscar atendimentos com os filtros determinados
    return this.attendanceRepository.getAttendances(filters);
  }
}


// import { injectable, inject } from "inversify";
// import { AttendanceRepository } from "../../repositories/AttendanceRepository";
// import { TYPES } from "../../types";
// import { Attendance } from "@prisma/client";

// @injectable()
// export class GetAttendancesUseCase {
//   private attendanceRepository: AttendanceRepository;
  
//   constructor(
//     @inject(TYPES.AttendanceRepository) attendanceRepository: AttendanceRepository
//   ) {
//     this.attendanceRepository = attendanceRepository;
//   }
  
//   async execute(): Promise<Attendance[]> {
//     return this.attendanceRepository.getAttendances();
//   }
// }
