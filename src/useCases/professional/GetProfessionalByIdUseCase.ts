import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";
import { ProfileType } from "../../constants/profilesTypes";


@injectable()
export class GetProfessionalByIdUseCase {
  private professionalRepository: ProfessionalRepository;
  private healthUnitRepository: HealthUnitRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository,
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository
  ) {
    this.professionalRepository = professionalRepository;
    this.healthUnitRepository = healthUnitRepository;
  }
  
  async execute(id: number, requestingProfessionalId: number): Promise<Omit<Professional, "password"> | null> {
    // Verificar se o profissional solicitante existe
    const requestingProfessional = await this.professionalRepository.getProfessionalById(requestingProfessionalId);
    if (!requestingProfessional) {
      throw new Error("Requesting professional not found");
    }

    // Buscar o profissional alvo
    const targetProfessional = await this.professionalRepository.getProfessionalById(id);
    if (!targetProfessional) return null;
    // Verificar se o profissional tem permissão para acessar os dados
    if (requestingProfessional.profile == ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
      if (requestingProfessional.cityId !== targetProfessional.cityId) {
        throw new Error("Professional does not have permission to access this professional data");
      }
    } else if (requestingProfessional.profile == ProfileType.LOCAL_ADMINISTRATOR) {
      // Verificar se o profissional alvo pertence a mesma unidade de saúde
      const healthUnits = await this.healthUnitRepository.getHealthUnitsByProfessionalId(requestingProfessional.id);
      const targetHealthUnits = await this.healthUnitRepository.getHealthUnitsByProfessionalId(targetProfessional.id);
      
      if (!healthUnits.some(unit => targetHealthUnits.some(targetUnit => targetUnit.id === unit.id))) {
        throw new Error("Professional does not have permission to access this professional data");
      }
    }
    
    const { password, ...result } = targetProfessional;
    return result;
  }
}
