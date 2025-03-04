import { injectable, inject } from "inversify";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";
import { ICreateProfessionalDTO } from "../../interfaces/professional/ICreateProfessionalDTO";
import { CreateProfessionalUseCase } from "./CreateProfessionalUseCase";

@injectable()
export class CreateProfessionalByGeneralAdminUseCase {
  private createProfessionalUseCase: CreateProfessionalUseCase;
  private healthUnitRepository: HealthUnitRepository;
  
  constructor(
    @inject(TYPES.CreateProfessionalUseCase) createProfessionalUseCase: CreateProfessionalUseCase,
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository
  ) {
    this.createProfessionalUseCase = createProfessionalUseCase;
    this.healthUnitRepository = healthUnitRepository;
  }
  
  async execute(data: ICreateProfessionalDTO): Promise<Omit<Professional, "password">> {
    // Verificar se a unidade de saúde foi especificada quando necessário
    const needsHealthUnit = data.profile !== 'GENERAL_ADMINISTRATOR';
    
    if (needsHealthUnit && !data.healthUnitId) {
      throw new Error("Health unit is required for non-general administrator profiles");
    }
    
    // Verificar se a unidade existe
    if (data.healthUnitId) {
      const healthUnit = await this.healthUnitRepository.getHealthUnitById(data.healthUnitId);
      if (!healthUnit) {
        throw new Error("Health unit not found");
      }
    }
    
    // Remover a propriedade healthUnitId do objeto de dados antes de criar o profissional
    const { healthUnitId, ...professionalData } = data;
    
    // Criar o profissional
    const professional = await this.createProfessionalUseCase.execute(professionalData);
    
    // Se for um administrador geral, não vincula a uma unidade
    if (professional.profile === 'GENERAL_ADMINISTRATOR') {
      return professional;
    }
    
    // Para outros perfis, vincular à unidade de saúde
    if (healthUnitId) {
      await this.healthUnitRepository.addProfessionalToHealthUnit(healthUnitId, professional.id);
    }
    
    return professional;
  }
}