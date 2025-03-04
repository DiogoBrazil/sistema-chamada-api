import { injectable, inject } from "inversify";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { TYPES } from "../../types";

@injectable()
export class DeleteHealthUnitUseCase {
  private healthUnitRepository: HealthUnitRepository;
  
  constructor(
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository
  ) {
    this.healthUnitRepository = healthUnitRepository;
  }
  
  async execute(id: number): Promise<void> {
    const healthUnit = await this.healthUnitRepository.getHealthUnitById(id);

    if (!healthUnit) {
      throw new Error("Health unit not found");
    }

    await this.healthUnitRepository.deleteHealthUnit(id);
  }
}