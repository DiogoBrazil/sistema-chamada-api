import { injectable, inject } from "inversify";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { HealthUnit } from "@prisma/client";
import { IPaginatedResult } from "../../interfaces/patient/IPaginatedResult";
import { ProfileType } from "../../constants/profilesTypes";

@injectable()
export class GetHealthUnitsUseCase {
  private healthUnitRepository: HealthUnitRepository;
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository,
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.healthUnitRepository = healthUnitRepository;
    this.professionalRepository = professionalRepository;
  }
  
  async execute(page: number, adminId: number, userProfile: string): Promise<IPaginatedResult<HealthUnit>> {

    const pageNumber = Math.max(1, page);

    if (userProfile == ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
      const professionalGeneralLocal = await this.professionalRepository.getProfessionalById(adminId);
      if (!professionalGeneralLocal) {
        throw new Error("Admin not found");
      }
      return this.healthUnitRepository.getHealthUnitsByCity(pageNumber, professionalGeneralLocal.cityId);
    }
    
    return this.healthUnitRepository.getAllHealthUnits(pageNumber);
  }
}