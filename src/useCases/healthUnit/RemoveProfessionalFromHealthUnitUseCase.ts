import { injectable, inject } from "inversify";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { HealthUnit } from "@prisma/client";

@injectable()
export class RemoveProfessionalFromHealthUnitUseCase {
  private healthUnitRepository: HealthUnitRepository;
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository,
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.healthUnitRepository = healthUnitRepository;
    this.professionalRepository = professionalRepository;
  }
  
  async execute(healthUnitId: number, professionalId: number): Promise<HealthUnit> {
    // Verificar se a unidade de saúde existe
    const healthUnit = await this.healthUnitRepository.getHealthUnitById(healthUnitId);
    if (!healthUnit) {
      throw new Error("Health unit not found");
    }
    
    // Verificar se o profissional existe
    const professional = await this.professionalRepository.getProfessionalById(professionalId);
    if (!professional) {
      throw new Error("Professional not found");
    }
    
    // Verificar se o profissional está associado à unidade
    const isProfessionalInUnit = healthUnit.professionals.some(p => p.id === professionalId);
    if (!isProfessionalInUnit) {
      throw new Error("Professional is not linked to this health unit");
    }
    
    return this.healthUnitRepository.removeProfessionalFromHealthUnit(healthUnitId, professionalId);
  }
}