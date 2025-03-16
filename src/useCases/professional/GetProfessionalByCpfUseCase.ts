import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";
import { ProfileType } from "../../constants/profilesTypes";

@injectable()
export class GetProfessionalByCpfUseCase {
  private professionalRepository: ProfessionalRepository;
  private healthUnitRepository: HealthUnitRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository,
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository
  ) {
    this.professionalRepository = professionalRepository;
    this.healthUnitRepository = healthUnitRepository;
  }
  
  async execute(cpf: string, requestingProfessionalId: number): Promise<Omit<Professional, "password"> | null> {
    // Verificar se o profissional solicitante existe
    const requestingProfessional = await this.professionalRepository.getProfessionalById(requestingProfessionalId);
    if (!requestingProfessional) {
      throw new Error("Requesting professional not found");
    }

    // Buscar o profissional alvo pelo CPF
    const targetProfessional = await this.professionalRepository.getProfessionalByCpf(cpf);
    if (!targetProfessional) return null;
    
    // Verificar se o profissional tem permissão para acessar os dados
    // Admin geral tem acesso a todos os dados
    if (requestingProfessional.profile !== ProfileType.GENERAL_ADMINISTRATOR) {
      if (requestingProfessional.profile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
        // Admin geral local só pode acessar profissionais da mesma cidade
        if (requestingProfessional.cityId !== targetProfessional.cityId) {
          throw new Error("Professional does not have permission to access this professional data");
        }
      } else if (requestingProfessional.profile === ProfileType.LOCAL_ADMINISTRATOR) {
        // Admin local só pode acessar profissionais da mesma unidade de saúde
        const healthUnits = await this.healthUnitRepository.getHealthUnitsByProfessionalId(requestingProfessional.id);
        const targetHealthUnits = await this.healthUnitRepository.getHealthUnitsByProfessionalId(targetProfessional.id);
        
        if (!healthUnits.some(unit => targetHealthUnits.some(targetUnit => targetUnit.id === unit.id))) {
          throw new Error("Professional does not have permission to access this professional data");
        }
      } else {
        // Outros profissionais só podem acessar próprios dados
        if (requestingProfessional.id !== targetProfessional.id) {
          throw new Error("Professional does not have permission to access this professional data");
        }
      }
    }
    
    const { password, ...result } = targetProfessional;
    return result;
  }
}
