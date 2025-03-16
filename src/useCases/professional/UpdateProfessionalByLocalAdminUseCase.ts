import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";
import { IUpdateProfessionalDTO } from "../../interfaces/professional/IUpdateProfessionalDTO";
import { UpdateProfessionalUseCase } from "./UpdateProfessionalByIdUseCase";
import { ProfileType } from "../../constants/profilesTypes";

@injectable()
export class UpdateProfessionalByLocalAdminUseCase {
  private professionalRepository: ProfessionalRepository;
  private updateProfessionalUseCase: UpdateProfessionalUseCase;
  private healthUnitRepository: HealthUnitRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository,
    @inject(TYPES.UpdateProfessionalUseCase) updateProfessionalUseCase: UpdateProfessionalUseCase,
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository
  ) {
    this.professionalRepository = professionalRepository;
    this.updateProfessionalUseCase = updateProfessionalUseCase;
    this.healthUnitRepository = healthUnitRepository;
  }
  
  async execute(adminId: number, professionalId: number, data: IUpdateProfessionalDTO): Promise<Omit<Professional, "password">> {
    // Verificar se o administrador local existe
    const admin = await this.professionalRepository.getProfessionalById(adminId);
    if (!admin) {
      throw new Error("Admin not found");
    }
    
    // Verificar se o perfil não é de administrador
    const restrictedProfiles = [
      String(ProfileType.GENERAL_ADMINISTRATOR), 
      String(ProfileType.GENERAL_LOCAL_ADMINISTRATOR), 
      String(ProfileType.LOCAL_ADMINISTRATOR)
    ];
    
    if (data.profile && restrictedProfiles.includes(data.profile)) {
      throw new Error("Local administrators cannot update to administrator profiles");
    }
    
    // Verificar se o profissional a ser atualizado existe
    const professional = await this.professionalRepository.getProfessionalById(professionalId);
    if (!professional) {
      throw new Error("Professional not found");
    }
    
    // Verificar se o perfil atual é de administrador
    if (restrictedProfiles.includes(professional.profile)) {
      throw new Error("Local administrators cannot update administrator profiles");
    }
    
    // Obter unidades do administrador local
    const adminUnits = await this.professionalRepository.getAdminHealthUnits(adminId);
    if (!adminUnits || adminUnits.length === 0) {
      throw new Error("Local administrator is not linked to any health unit");
    }
    
    // Obter unidades do profissional
    const professionalUnits = await this.professionalRepository.getAdminHealthUnits(professionalId);
    
    // Verificar se o profissional pertence a alguma unidade do administrador local
    const hasSharedUnit = professionalUnits.some(unit => 
      adminUnits.some(adminUnit => adminUnit.id === unit.id)
    );
    
    if (!hasSharedUnit) {
      throw new Error("You can only update professionals from your health unit");
    }
    
    // Verificar se precisa atualizar a unidade de saúde
    if (data.healthUnitId) {
      // Verificar se o admin tem acesso à unidade solicitada
      const hasAccess = adminUnits.some(unit => unit.id === data.healthUnitId);
      if (!hasAccess) {
        throw new Error("Local administrator does not have access to the specified health unit");
      }
      
      // Remover profissional das unidades atuais
      for (const unit of professionalUnits) {
        await this.healthUnitRepository.removeProfessionalFromHealthUnit(unit.id, professionalId);
      }
      
      // Vincular à nova unidade de saúde
      await this.healthUnitRepository.addProfessionalToHealthUnit(data.healthUnitId, professionalId);
      
      // Remover a propriedade healthUnitId do objeto de dados antes de atualizar o profissional
      const { healthUnitId: _, ...professionalData } = data;
      
      // Atualizar o profissional
      return await this.updateProfessionalUseCase.execute(
        professionalId, 
        professionalData, 
        adminId, 
        ProfileType.LOCAL_ADMINISTRATOR
      );
    }
    
    // Se não houver alteração de unidade de saúde, apenas atualizar os dados do profissional
    return await this.updateProfessionalUseCase.execute(
      professionalId, 
      data, 
      adminId, 
      ProfileType.LOCAL_ADMINISTRATOR
    );
  }
}