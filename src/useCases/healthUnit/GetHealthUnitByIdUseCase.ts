import { injectable, inject } from "inversify";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { HealthUnit } from "@prisma/client";
import { ProfileType } from "../../constants/profilesTypes";

@injectable()
export class GetHealthUnitByIdUseCase {
  private healthUnitRepository: HealthUnitRepository;
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository,
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.healthUnitRepository = healthUnitRepository;
    this.professionalRepository = professionalRepository;
  }
  
  async execute(healthUnitId: number, adminId: number, userProfile: string): Promise<HealthUnit | null> {

    if (userProfile !== ProfileType.GENERAL_ADMINISTRATOR && userProfile !== ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
      throw new Error("Only administrators can access this health unit");
    }

    if (userProfile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
      const professionalGeneralLocal = await this.professionalRepository.getProfessionalById(adminId);
      if (!professionalGeneralLocal) {
        throw new Error("General local administrator not found");
      }
      // Verificar se a unidade de saúde pertence ao admin
      const healthUnit = await this.healthUnitRepository.getHealthUnitById(healthUnitId);
      if (!healthUnit) {
        throw new Error("Health unit not found");
      }
      if (healthUnit.cityId !== professionalGeneralLocal.cityId) {
        throw new Error("Health unit does not belong to the admin");
      }
      
    }

    return this.healthUnitRepository.getHealthUnitById(healthUnitId);
  }
}