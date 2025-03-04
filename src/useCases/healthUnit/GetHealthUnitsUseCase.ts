import { injectable, inject } from "inversify";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { TYPES } from "../../types";
import { HealthUnit } from "@prisma/client";
import { IPaginatedResult } from "../../interfaces/patient/IPaginatedResult";

@injectable()
export class GetHealthUnitsUseCase {
  private healthUnitRepository: HealthUnitRepository;
  
  constructor(
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository
  ) {
    this.healthUnitRepository = healthUnitRepository;
  }
  
  async execute(page: number): Promise<IPaginatedResult<HealthUnit>> {
    const pageNumber = Math.max(1, page);
    return this.healthUnitRepository.getHealthUnits(pageNumber);
  }
}