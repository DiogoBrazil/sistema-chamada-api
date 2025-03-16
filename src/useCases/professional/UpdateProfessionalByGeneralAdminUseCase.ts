import { injectable, inject } from "inversify";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";
import { IUpdateProfessionalDTO } from "../../interfaces/professional/IUpdateProfessionalDTO";
import { UpdateProfessionalUseCase } from "./UpdateProfessionalByIdUseCase";
import { ProfileType } from "../../constants/profilesTypes";

@injectable()
export class UpdateProfessionalByGeneralAdminUseCase {
  private updateProfessionalUseCase: UpdateProfessionalUseCase;
  private healthUnitRepository: HealthUnitRepository;
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.UpdateProfessionalUseCase) updateProfessionalUseCase: UpdateProfessionalUseCase,
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository,
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.updateProfessionalUseCase = updateProfessionalUseCase;
    this.healthUnitRepository = healthUnitRepository;
    this.professionalRepository = professionalRepository;
  }
  
  async execute(userProfile: string, adminId: number, professionalId: number, data: IUpdateProfessionalDTO): Promise<Omit<Professional, "password">> {
    // Verificar se o profissional a ser atualizado existe
    const professional = await this.professionalRepository.getProfessionalById(professionalId);
    if (!professional) {
      throw new Error("Professional not found");
    }

    // Verificar permissões baseadas no perfil do administrador
    if (userProfile === ProfileType.GENERAL_ADMINISTRATOR) {
      // Admin geral não pode atualizar outro admin geral (exceto a si mesmo)
      if (professional.profile === ProfileType.GENERAL_ADMINISTRATOR && adminId !== professionalId) {
        throw new Error("General administrators cannot update other general administrators");
      }
      
      // Não pode mudar um perfil para GENERAL_ADMINISTRATOR
      if (data.profile === ProfileType.GENERAL_ADMINISTRATOR && professional.profile !== ProfileType.GENERAL_ADMINISTRATOR) {
        throw new Error("Cannot update a professional to general administrator profile");
      }
    } else if (userProfile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
      // Admin geral local não pode atualizar admin geral
      if (professional.profile === ProfileType.GENERAL_ADMINISTRATOR) {
        throw new Error("General local administrators cannot update general administrators");
      }
      
      // Admin geral local não pode atualizar outro admin geral local (exceto a si mesmo)
      if (professional.profile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR && adminId !== professionalId) {
        throw new Error("General local administrators cannot update other general local administrators");
      }
      
      // Não pode mudar um perfil para GENERAL_ADMINISTRATOR ou GENERAL_LOCAL_ADMINISTRATOR
      if ((data.profile === ProfileType.GENERAL_ADMINISTRATOR) || 
          (data.profile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR && professional.profile !== ProfileType.GENERAL_LOCAL_ADMINISTRATOR)) {
        throw new Error("General local administrators cannot update to general administrator profiles");
      }
      
      // Verificar se o admin tem acesso à cidade do profissional
      const admin = await this.professionalRepository.getProfessionalById(adminId);
      if (!admin?.cityId) {
        throw new Error("Admin not linked to any city");
      }
      
      if (professional.cityId !== admin.cityId) {
        throw new Error("You can only update professionals from your city");
      }
      
      // Se informou cityId na atualização, verificar se é a mesma do admin
      if (data.cityId !== admin.cityId) {
        throw new Error("You can only update professionals to your city");
      }
    }
    
    // Verificar alterações de unidade de saúde e cidade
    if (data.healthUnitId) {
      // Verificar se a unidade existe
      const healthUnit = await this.healthUnitRepository.getHealthUnitById(data.healthUnitId);
      if (!healthUnit) {
        throw new Error("Health unit not found");
      }
      
      // Se for admin geral local, verificar se a unidade pertence à sua cidade
      if (userProfile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
        const admin = await this.professionalRepository.getProfessionalById(adminId);
        if (!admin?.cityId) {
          throw new Error("Admin not linked to any city");
        }
        
        const hasAccess = await this.healthUnitRepository.hasAccessToHealthUnit(admin.cityId, data.healthUnitId);
        if (hasAccess.length === 0) {
          throw new Error("You do not have access to the health unit you are trying to link the professional to");
        }
      }
      
      // Para perfis que precisam estar vinculados a uma unidade
      const needsHealthUnit = data.profile !== ProfileType.GENERAL_ADMINISTRATOR && data.profile !== ProfileType.GENERAL_LOCAL_ADMINISTRATOR;
      
      if (needsHealthUnit) {
        // Obter unidades atuais do profissional
        const professionalUnits = await this.professionalRepository.getAdminHealthUnits(professionalId);
        
        // Remover profissional das unidades atuais
        for (const unit of professionalUnits) {
          await this.healthUnitRepository.removeProfessionalFromHealthUnit(unit.id, professionalId);
        }
        
        // Vincular à nova unidade de saúde
        await this.healthUnitRepository.addProfessionalToHealthUnit(data.healthUnitId, professionalId);
      }
    }
    
    // Verificar alteração de cidade
    if (data.cityId) {
      // Verificar se a cidade existe
      const city = await this.healthUnitRepository.getCityById(data.cityId);
      if (!city) {
        throw new Error("City not found");
      }
      
      // Se for admin geral local, verificar se é a sua cidade
      if (userProfile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
        const admin = await this.professionalRepository.getProfessionalById(adminId);
        if (!admin?.cityId || admin.cityId !== data.cityId) {
          throw new Error("You can only update professionals to your city");
        }
      }
      
      // Verificar caso especial para GENERAL_LOCAL_ADMINISTRATOR
      if (data.profile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR || professional.profile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
        // Verificar se já existe um admin local geral para esta cidade
        const hasGeneralLocalAdmin = await this.professionalRepository.hasGeneralLocalAdministratorInCity(
          data.cityId, 
          ProfileType.GENERAL_LOCAL_ADMINISTRATOR
        );
        
        // Se não for o próprio profissional sendo atualizado
        const existingAdmins = hasGeneralLocalAdmin.filter(admin => admin.id !== professionalId);
        if (existingAdmins.length > 0) {
          throw new Error("There is already a general local administrator for this city");
        }
      }
    }
    
    // Verificar caso especial para LOCAL_ADMINISTRATOR
    if (data.profile === ProfileType.LOCAL_ADMINISTRATOR && data.healthUnitId) {
      // Verificar se já existe um admin local para esta unidade
      const hasLocalAdmin = await this.professionalRepository.hasLocalAdministratorInHealthUnit(
        data.healthUnitId, 
        ProfileType.LOCAL_ADMINISTRATOR
      );
      
      // Se não for o próprio profissional sendo atualizado
      const existingAdmins = hasLocalAdmin.filter(admin => admin.id !== professionalId);
      if (existingAdmins.length > 0) {
        throw new Error("There is already a local administrator for this health unit");
      }
    }
    
    // Remover propriedades que serão tratadas separadamente
    const { healthUnitId, ...updateData } = data;
    
    // Atualizar o profissional com os dados restantes
    return await this.updateProfessionalUseCase.execute(
      professionalId, 
      updateData, 
      adminId, 
      userProfile
    );
  }
}