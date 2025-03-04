import { injectable, inject } from "inversify";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { HealthUnitAddressRepository } from "../../repositories/HealthUnitAddressRepository";
import { TYPES } from "../../types";
import { HealthUnit } from "@prisma/client";
import { IAddressDTO } from "../../interfaces/address/IAddressDTO";

interface UpdateHealthUnitDTO {
  name?: string;
  cnpj?: string;
  phone?: string;
  address?: IAddressDTO;
}

@injectable()
export class UpdateHealthUnitUseCase {
  private healthUnitRepository: HealthUnitRepository;
  private healthUnitAddressRepository: HealthUnitAddressRepository;
  
  constructor(
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository,
    @inject(TYPES.HealthUnitAddressRepository) healthUnitAddressRepository: HealthUnitAddressRepository
  ) {
    this.healthUnitRepository = healthUnitRepository;
    this.healthUnitAddressRepository = healthUnitAddressRepository;
  }
  
  async execute(id: number, data: UpdateHealthUnitDTO): Promise<HealthUnit> {
    // Verificar se a unidade existe
    const healthUnitExists = await this.healthUnitRepository.getHealthUnitById(id);
    if (!healthUnitExists) {
      throw new Error("Health unit not found");
    }

    // Se o CNPJ foi fornecido, verificar se já existe em outra unidade
    if (data.cnpj) {
      const healthUnitWithCnpj = await this.healthUnitRepository.getHealthUnitByCnpj(data.cnpj);
      if (healthUnitWithCnpj && healthUnitWithCnpj.id !== id) {
        throw new Error("CNPJ already in use");
      }
    }

    // Separar os dados do endereço
    const { address, ...healthUnitData } = data;

    // Atualizar o endereço principal, se fornecido
    if (address) {
      if (!address.street || !address.city || !address.state || !address.zipCode) {
        throw new Error("Street, city, state and zipCode are required for address");
      }
      
      const healthUnitAddress = await this.healthUnitAddressRepository.getMainAddressByHealthUnitId(id);
      if (!healthUnitAddress) {
        // Se não houver endereço principal, criar um novo
        await this.healthUnitAddressRepository.createAddress(id, address);
      } else {
        // Se houver, atualizar
        await this.healthUnitAddressRepository.updateAddress(healthUnitAddress.id, address);
      }
    }

    // Atualizar a unidade de saúde
    return this.healthUnitRepository.updateHealthUnit(id, healthUnitData);
  }
}