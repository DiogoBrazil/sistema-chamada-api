import { injectable, inject } from "inversify";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";
import { ICreateProfessionalDTO } from "../../interfaces/professional/ICreateProfessionalDTO";
import { CreateProfessionalUseCase } from "./CreateProfessionalUseCase";
import { ProfileType } from "../../constants/profilesTypes";


@injectable()
export class CreateProfessionalByGeneralAdminUseCase {
  private createProfessionalUseCase: CreateProfessionalUseCase;
  private healthUnitRepository: HealthUnitRepository;
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.CreateProfessionalUseCase) createProfessionalUseCase: CreateProfessionalUseCase,
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository,
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.createProfessionalUseCase = createProfessionalUseCase;
    this.healthUnitRepository = healthUnitRepository;
    this.professionalRepository = professionalRepository;
  }
  
  async execute(userProfile: string, userId: number, data: ICreateProfessionalDTO): Promise<Omit<Professional, "password">> {

    // Verificar se o perfil do usuário que esta criando é superior ao perfil do profissional que será criado
    if (userProfile === ProfileType.GENERAL_ADMINISTRATOR && data.profile === ProfileType.GENERAL_ADMINISTRATOR) {
      throw new Error("General administrators cannot create other general administrators");
    }

    if (userProfile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR && data.profile === ProfileType.GENERAL_ADMINISTRATOR) {
      throw new Error("General local administrators cannot create general administrators");
    }

    if (userProfile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR && data.profile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
      throw new Error("General local administrators cannot create other general local administrators");
    }


     // Verificar se a cidade foi especificada quando necessário
     const needsCity = data.profile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR;

     if (needsCity && !data.cityId) {
       throw new Error("City is required for general local administrator profiles");
     }

    // Verificar se a unidade de saúde foi especificada quando necessário
    const needsHealthUnit = data.profile !== ProfileType.GENERAL_ADMINISTRATOR && data.profile !== ProfileType.GENERAL_LOCAL_ADMINISTRATOR;
    
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

    // Verificar se a cidade existe

    if (data.cityId) {
      const city = await this.healthUnitRepository.getCityById(data.cityId);
      if (!city) {
        throw new Error("City not found");
      }
    }

    // Caso o usuário que esta criando seja um GENERAL_ADMINISTRATOR e o perfil que esta sendo criado seja GENERAL_LOCAL_ADMINISTRATOR, verificar se já existe um GENERAL_LOCAL_ADMINISTRATOR para a cidade
    
    if (userProfile === ProfileType.GENERAL_ADMINISTRATOR && data.profile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
      const hasGeneralLocalAdministrator = await this.professionalRepository.hasGeneralLocalAdministratorInCity(data.cityId, data.profile);
      if (hasGeneralLocalAdministrator.length > 0) {
        throw new Error("There is already a general local administrator for this city");
      }
    }

    // Caso o usuário que esta sendo criado seja um LOCAL_ADMINISTRATOR, verificar se já existe um LOCAL_ADMINISTRATOR para unidade de saúde especificada

    if (data.profile === ProfileType.LOCAL_ADMINISTRATOR && data.healthUnitId) {
      const hasLocalAdministrator = await this.professionalRepository.hasLocalAdministratorInHealthUnit(data.healthUnitId, data.profile);
      if (hasLocalAdministrator.length > 0) {
        throw new Error("There is already a local administrator for this health unit");
      }
    }

    // Se o perfil que esta criando for GENERAL_LOCAL_ADMINISTRATOR, verificar se a cidade que esta sendo passada é a mesma do usuário

    if (userProfile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR && data.cityId) {
      const hasAccess = await this.professionalRepository.isProfessionalLinkedToCity(userId, data.cityId);
      if (hasAccess.length === 0) {
        throw new Error("You do not have access to the city you are trying to link the professional to");
      }
    }

    // Se o perfil que esta criando for GENERAL_LOCAL_ADMINISTRATOR, verificar se a unidade de saúde que esta sendo passada pertence a cidade do usuário

    if (userProfile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR && data.healthUnitId) {
      const professional = await this.professionalRepository.getProfessionalById(userId);
      if (!professional?.cityId) {
        throw new Error("City not found");
      }
      const hasAccess = await this.healthUnitRepository.hasAccessToHealthUnit(professional.cityId, data.healthUnitId);
      console.log(hasAccess);

      if (hasAccess.length === 0) {
        throw new Error("You do not have access to the health unit you are trying to link the professional to");
      }
    }


    // Caso o professional que esta criando seja um GENERAL_LOCAL_ADMINISTRATOR e não tem o cityId no data, acrescenta-lo no data com o cityId do usuário que esta criando

    if (userProfile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR && !data.cityId) {
      const professional = await this.professionalRepository.getProfessionalById(userId);

      if (!professional?.cityId) {
        throw new Error("City not found");
      }

      data.cityId = Number(professional.cityId);
    }


    
    // Remover a propriedade healthUnitId do objeto de dados antes de criar o profissional
    const { healthUnitId, ...professionalData } = data;
    
    // Criar o profissional
    const professional = await this.createProfessionalUseCase.execute(professionalData);
    
    // Se for um administrador geral ou administrador geral local, não vincula a uma unidade
    if (professional.profile === ProfileType.GENERAL_ADMINISTRATOR || professional.profile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
      return professional;
    }
    
    // Para outros perfis, vincular à unidade de saúde
    if (healthUnitId) {
      await this.healthUnitRepository.addProfessionalToHealthUnit(healthUnitId, professional.id);
    }
    
    return professional;
  }
}