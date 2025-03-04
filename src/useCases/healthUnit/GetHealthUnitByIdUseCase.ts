import { injectable, inject } from "inversify";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { TYPES } from "../../types";
import { HealthUnit } from "@prisma/client";

@injectable()
export class GetHealthUnitByIdUseCase {
  private healthUnitRepository: HealthUnitRepository;
  
  constructor(
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository
  ) {
    this.healthUnitRepository = healthUnitRepository;
  }
  
  async execute(id: number): Promise<HealthUnit | null> {
    return this.healthUnitRepository.getHealthUnitById(id);
  }
}