import { injectable, inject } from "inversify";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { HealthUnitAddressRepository } from "../../repositories/HealthUnitAddressRepository";
import { CityRepository } from "../../repositories/CityRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { HealthUnit } from "@prisma/client";
import { ICreateHealthUnitDTO } from "../../interfaces/healthUnit/ICreateHealthUnitDTO";
import { ProfileType } from "../../constants/profilesTypes";

@injectable()
export class CreateHealthUnitUseCase {
  private healthUnitRepository: HealthUnitRepository;
  private healthUnitAddressRepository: HealthUnitAddressRepository;
  private cityRepository: CityRepository;
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository,
    @inject(TYPES.HealthUnitAddressRepository) healthUnitAddressRepository: HealthUnitAddressRepository,
    @inject(TYPES.CityRepository) cityRepository: CityRepository,
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.healthUnitRepository = healthUnitRepository;
    this.healthUnitAddressRepository = healthUnitAddressRepository;
    this.cityRepository = cityRepository;
    this.professionalRepository = professionalRepository;
  }
  
  async execute(requestingProfessionalId: number, userProfile: string, data: ICreateHealthUnitDTO): Promise<HealthUnit> {

    if (userProfile == ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
      // Verificar se o profissional solicitante existe
      const requestingProfessional = await this.professionalRepository.getProfessionalById(requestingProfessionalId);
      if (!requestingProfessional) {
        throw new Error("Requesting professional not found");
      }
      
      // Verificar se o profissional tem permissão para acessar os dados
      if (requestingProfessional.cityId !== data.cityId) {
        throw new Error("Professional does not have permission to create a health unit in this city");
      }
    }

    // Verificar se já existe uma unidade com o mesmo CNPJ
    const existingUnit = await this.healthUnitRepository.getHealthUnitByCnpj(data.cnpj);
    if (existingUnit) {
      throw new Error("CNPJ already in use");
    }
    
    // Verificar se o ID da cidade informada existe
    const cityExists = await this.cityRepository.getCityById(data.cityId);

    if (!cityExists) {
      throw new Error("City not found");
    }

    // Separa os dados do endereço da unidade
    const { address, ...healthUnitData } = data;
    
    if (address) {
      // Validação básica de endereço
      if (!address.street || !address.neighborhood || !address.zipCode) {
        throw new Error("Street, neighborhood and zipCode are required for address");
      }
      return await this.healthUnitRepository.createHealthUnit(address, healthUnitData);
    }
    
    return await this.healthUnitRepository.createHealthUnit(null, healthUnitData);
  }
}