import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";
import { ICreateProfessionalDTO } from "../../interfaces/professional/ICreateProfessionalDTO";
import { CreateProfessionalUseCase } from "./CreateProfessionalUseCase";

@injectable()
export class CreateProfessionalByLocalAdminUseCase {
  private professionalRepository: ProfessionalRepository;
  private createProfessionalUseCase: CreateProfessionalUseCase;
  private healthUnitRepository: HealthUnitRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository,
    @inject(TYPES.CreateProfessionalUseCase) createProfessionalUseCase: CreateProfessionalUseCase,
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository
  ) {
    this.professionalRepository = professionalRepository;
    this.createProfessionalUseCase = createProfessionalUseCase;
    this.healthUnitRepository = healthUnitRepository;
  }
  
  async execute(adminId: number, data: ICreateProfessionalDTO): Promise<Omit<Professional, "password">> {
    // Verificar se o perfil não é de administrador
    const restrictedProfiles = ['GENERAL_ADMINISTRATOR', 'GENERAL_LOCAL_ADMINISTRATOR', 'LOCAL_ADMINISTRATOR'];
    if (restrictedProfiles.includes(data.profile)) {
      throw new Error("Local administrators cannot create administrator profiles");
    }
    
    // Obter unidades do administrador local
    const adminUnits = await this.professionalRepository.getAdminHealthUnits(adminId);
    if (!adminUnits || adminUnits.length === 0) {
      throw new Error("Local administrator is not linked to any health unit");
    }
    
    let healthUnitId: number;
    
    if (data.healthUnitId) {
      // Verificar se o admin tem acesso à unidade solicitada
      const hasAccess = adminUnits.some(unit => unit.id === data.healthUnitId);
      if (!hasAccess) {
        throw new Error("Local administrator does not have access to the specified health unit");
      }
      healthUnitId = data.healthUnitId;
    } else {
      // Se nenhuma unidade for especificada, usar a primeira unidade do admin
      // TODO: Caso o admin tenha mais de uma unidade, deve ser possível escolher
      healthUnitId = adminUnits[0].id;
    }
    
    // Remover a propriedade healthUnitId do objeto de dados antes de criar o profissional
    const { healthUnitId: _, ...professionalData } = data;
    
    // Criar o profissional
    const professional = await this.createProfessionalUseCase.execute(professionalData);
    
    // Vincular à unidade de saúde
    await this.healthUnitRepository.addProfessionalToHealthUnit(healthUnitId, professional.id);
    
    return professional;
  }
}