import { injectable, inject } from "inversify";
import { AttendanceRepository } from "../../repositories/AttendanceRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { TYPES } from "../../types";
import { AttendanceHistory } from "@prisma/client";
import { IGetAttendanceReportDTO } from "../../interfaces/attendance/IGetAttendanceReportDTO";

@injectable()
export class GetAttendanceReportUseCase {
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
  
  async execute(data: IGetAttendanceReportDTO, requestUserId?: number): Promise<{ count: number, attendances: AttendanceHistory[] }> {
    const { professionalId, startDate, startTime, endDate, endTime, healthUnitId, cityId } = data;
    
    // Converter IDs para números
    const professionalIdNumber = Number(professionalId);
    const healthUnitIdNumber = healthUnitId ? Number(healthUnitId) : undefined;
    const cityIdNumber = cityId ? Number(cityId) : undefined;
    
    // Validar o ID do profissional
    if (isNaN(professionalIdNumber)) {
      throw new Error("ID do profissional inválido");
    }
    
    // Verificar permissões se houver um usuário solicitante
    if (requestUserId) {
      const requestUser = await this.professionalRepository.getProfessionalById(requestUserId);
      if (!requestUser) {
        throw new Error("Requesting user not found");
      }
      
      // Se o usuário solicitante não for administrador e estiver pedindo relatório de outro profissional
      const isAdmin = ['GENERAL_ADMINISTRATOR', 'GENERAL_LOCAL_ADMINISTRATOR', 'LOCAL_ADMINISTRATOR'].includes(requestUser.profile);
      if (!isAdmin && requestUserId !== professionalIdNumber) {
        throw new Error("You can only view reports for your own appointments.");
      }
      
      // Se for admin local, verificar se o profissional solicitado está na mesma unidade
      if (requestUser.profile === 'LOCAL_ADMINISTRATOR') {
        const targetProfessional = await this.professionalRepository.getProfessionalById(professionalIdNumber);
        if (!targetProfessional) {
          throw new Error("Target professional not found");
        }
        
        const adminProfWithUnits = await this.professionalRepository.getProfessionalWithHealthUnits(requestUserId);
        const targetProfWithUnits = await this.professionalRepository.getProfessionalWithHealthUnits(professionalIdNumber);
        
        if (!adminProfWithUnits || !targetProfWithUnits) {
          throw new Error("Professional information not found");
        }
        
        const adminUnits = adminProfWithUnits.healthUnit || [];
        const targetUnits = targetProfWithUnits.healthUnit || [];
        
        // Verificar se há alguma unidade em comum
        const hasCommonUnit = adminUnits.some(adminUnit => 
          targetUnits.some(targetUnit => adminUnit.id === targetUnit.id)
        );
        
        if (!hasCommonUnit) {
          throw new Error("You do not have permission to view reports for this professional");
        }
      }
      
      // Se for admin municipal, verificar se o profissional está na mesma cidade
      if (requestUser.profile === 'GENERAL_LOCAL_ADMINISTRATOR' && requestUser.cityId) {
        const targetProfessional = await this.professionalRepository.getProfessionalById(professionalIdNumber);
        if (!targetProfessional) {
          throw new Error("Target professional not found");
        }
        
        // Verificar se o profissional está na mesma cidade que o admin
        const isInSameCity = targetProfessional.cityId === requestUser.cityId ||
                            await this.professionalRepository.isProfessionalLinkedToCity(
                              professionalIdNumber, 
                              requestUser.cityId
                            );
        
        if (!isInSameCity) {
          throw new Error("You are not allowed to view reports from professionals in other cities");
        }
      }
    }
    
    // Validar as datas e horários
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid date and/or time");
    }
    
    if (start > end) {
      throw new Error("Start date/time must be before end date/time");
    }
    
    // Buscar os atendimentos
    const attendances = await this.attendanceRepository.getAttendanceHistory({
      professionalId: professionalIdNumber,
      startDate: start,
      endDate: end,
      healthUnitId: healthUnitIdNumber,
      cityId: cityIdNumber
    });
    
    return { count: attendances.length, attendances };
  }
}
