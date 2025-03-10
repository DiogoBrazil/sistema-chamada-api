import { injectable, inject } from "inversify";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { HealthUnitAddressRepository } from "../../repositories/HealthUnitAddressRepository";
import { CityRepository } from "../../repositories/CityRepository";
import { TYPES } from "../../types";
import { HealthUnit } from "@prisma/client";
import { ICreateHealthUnitDTO } from "../../interfaces/healthUnit/ICreateHealthUnitDTO";

@injectable()
export class CreateHealthUnitUseCase {
  private healthUnitRepository: HealthUnitRepository;
  private healthUnitAddressRepository: HealthUnitAddressRepository;
  private cityRepository: CityRepository;
  
  constructor(
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository,
    @inject(TYPES.HealthUnitAddressRepository) healthUnitAddressRepository: HealthUnitAddressRepository,
    @inject(TYPES.CityRepository) cityRepository: CityRepository
  ) {
    this.healthUnitRepository = healthUnitRepository;
    this.healthUnitAddressRepository = healthUnitAddressRepository;
    this.cityRepository = cityRepository
  }
  
  async execute(data: ICreateHealthUnitDTO): Promise<HealthUnit> {
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