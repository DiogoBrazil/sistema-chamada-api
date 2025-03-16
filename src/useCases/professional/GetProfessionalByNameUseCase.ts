import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";
import { ProfileType } from "../../constants/profilesTypes";

@injectable()
export class GetProfessionalsByNameUseCase {
  private professionalRepository: ProfessionalRepository;
  private healthUnitRepository: HealthUnitRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository,
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository
  ) {
    this.professionalRepository = professionalRepository;
    this.healthUnitRepository = healthUnitRepository;
  }
  
  async execute(name: string, requestingProfessionalId: number): Promise<Omit<Professional, "password">[]> {
    // Verificar se o profissional solicitante existe
    const requestingProfessional = await this.professionalRepository.getProfessionalById(requestingProfessionalId);
    if (!requestingProfessional) {
      throw new Error("Requesting professional not found");
    }

    // Buscar todos os profissionais correspondentes ao nome
    // O método já retorna os objetos sem a propriedade password
    const professionals = await this.professionalRepository.getProfessionalsByName(name);
    
    // Filtrar a lista com base nas permissões de acesso
    const filteredProfessionals: Omit<Professional, "password">[] = [];
    
    for (const professional of professionals) {
      // Admin geral pode acessar todos os profissionais
      if (requestingProfessional.profile === ProfileType.GENERAL_ADMINISTRATOR) {
        filteredProfessionals.push(professional);
        continue;
      }
      
      // Admin geral local só pode acessar profissionais da mesma cidade
      if (requestingProfessional.profile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
        if (requestingProfessional.cityId === professional.cityId) {
          filteredProfessionals.push(professional);
        }
        continue;
      }
      
      // Admin local só pode acessar profissionais da mesma unidade de saúde
      if (requestingProfessional.profile === ProfileType.LOCAL_ADMINISTRATOR) {
        const requestingHealthUnits = await this.healthUnitRepository.getHealthUnitsByProfessionalId(requestingProfessional.id);
        const professionalHealthUnits = await this.healthUnitRepository.getHealthUnitsByProfessionalId(professional.id);
        
        // Verificar se há unidades de saúde em comum
        const hasSharedUnit = requestingHealthUnits.some(unit => 
          professionalHealthUnits.some(targetUnit => targetUnit.id === unit.id)
        );
        
        if (hasSharedUnit) {
          filteredProfessionals.push(professional);
        }
        continue;
      }
      
      // Outros profissionais só podem acessar próprios dados
      if (requestingProfessional.id === professional.id) {
        filteredProfessionals.push(professional);
      }
    }
    
    return filteredProfessionals;
  }
}