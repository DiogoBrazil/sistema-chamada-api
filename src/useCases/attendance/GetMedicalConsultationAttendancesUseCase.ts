import { injectable, inject } from "inversify";
import { AttendanceRepository } from "../../repositories/AttendanceRepository";
import { TYPES } from "../../types";
import { Attendance, AttendanceStage } from "@prisma/client";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";

@injectable()
export class GetMedicalConsultationAttendancesUseCase {
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
  
  async execute(healthUnitId: number, professionalId: number): Promise<Attendance[]> {

    // Verificar se o profissional existe
    const professional = await this.professionalRepository.getProfessionalById(professionalId);
    if (!professional) {
      throw new Error("Professional not found");
    }

    // Verificar se a unidade de saúde existe
    const healthUnit = await this.healthUnitRepository.getHealthUnitById(healthUnitId);
    if (!healthUnit) {
      throw new Error("Health unit not found");
    }

    // Verificar se o profissional tem acesso à unidade de saúde
    if (!professional.healthUnit.find(hu => hu.id === healthUnitId)) {
      throw new Error("Professional does not have access to this health unit");
    }

    return this.attendanceRepository.getAttendances({stage: AttendanceStage.MEDICAL_CONSULTATION, healthUnitId});
  }
}