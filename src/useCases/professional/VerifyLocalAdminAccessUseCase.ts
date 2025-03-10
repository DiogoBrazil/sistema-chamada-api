import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { ProfileType } from "../../constants/profilesTypes";


@injectable()
export class VerifyLocalAdminAccessUseCase {
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.professionalRepository = professionalRepository;
  }
  
  async execute(adminId: number, healthUnitId: number): Promise<boolean> {
    // Obter o profissional com suas unidades de saúde
    const professional = await this.professionalRepository.getProfessionalWithHealthUnits(adminId);
    
    if (!professional) {
      return false;
    }
    
    // Verificar se o profissional é um administrador local
    if (professional.profile !== ProfileType.LOCAL_ADMINISTRATOR) {
      return false;
    }
    
    // Verificar se o profissional está vinculado à unidade
    const hasAccess = professional.healthUnit.some(unit => unit.id === healthUnitId);
    
    return !!hasAccess;
  }
}