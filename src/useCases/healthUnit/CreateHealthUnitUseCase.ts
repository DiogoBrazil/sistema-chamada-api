import { injectable, inject } from "inversify";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { HealthUnitAddressRepository } from "../../repositories/HealthUnitAddressRepository";
import { TYPES } from "../../types";
import { HealthUnit } from "@prisma/client";
import { ICreateHealthUnitDTO } from "../../interfaces/healthUnit/ICreateHealthUnitDTO";

@injectable()
export class CreateHealthUnitUseCase {
  private healthUnitRepository: HealthUnitRepository;
  private healthUnitAddressRepository: HealthUnitAddressRepository;
  
  constructor(
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository,
    @inject(TYPES.HealthUnitAddressRepository) healthUnitAddressRepository: HealthUnitAddressRepository
  ) {
    this.healthUnitRepository = healthUnitRepository;
    this.healthUnitAddressRepository = healthUnitAddressRepository;
  }
  
  async execute(data: ICreateHealthUnitDTO): Promise<HealthUnit> {
    // Verificar se já existe uma unidade com o mesmo CNPJ
    const existingUnit = await this.healthUnitRepository.getHealthUnitByCnpj(data.cnpj);
    if (existingUnit) {
      throw new Error("CNPJ already in use");
    }
    
    // Separa os dados do endereço da unidade
    const { address, ...healthUnitData } = data;
    
    // Cria a unidade de saúde
    const healthUnit = await this.healthUnitRepository.createHealthUnit(healthUnitData);
    
    // Se um endereço foi fornecido, adiciona-o
    if (address) {
      // Validação básica de endereço
      if (!address.street || !address.city || !address.state || !address.zipCode) {
        throw new Error("Street, city, state and zipCode are required for address");
      }
      
      await this.healthUnitAddressRepository.createAddress(healthUnit.id, address);
    }
    
    return healthUnit;
  }
}