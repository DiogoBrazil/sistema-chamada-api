import { injectable, inject } from "inversify";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { HealthUnitAddressRepository } from "../../repositories/HealthUnitAddressRepository";
import { CityRepository } from "../../repositories/CityRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { HealthUnit } from "@prisma/client";
import { IAddressDTO } from "../../interfaces/address/IAddressDTO";
import { IUpdateHealthUnitDTO } from "../../interfaces/healthUnit/IUpdateHealthUnitDTO";
import { ProfileType } from "../../constants/profilesTypes";

@injectable()
export class UpdateHealthUnitUseCase {
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
  
  async execute(requestingProfessionalId: number, userProfile: string, id: number, data: IUpdateHealthUnitDTO): Promise<HealthUnit> {
    // Verificar se a unidade existe
    const healthUnitExists = await this.healthUnitRepository.getHealthUnitById(id);
    if (!healthUnitExists) {
      throw new Error("Health unit not found");
    }

    if (userProfile == ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
      // Verificar se o profissional solicitante existe
      const requestingProfessional = await this.professionalRepository.getProfessionalById(requestingProfessionalId);
      if (!requestingProfessional) {
        throw new Error("Requesting professional not found");
      }
      
      // Verificar se o profissional tem permissão para acessar os dados
      if (requestingProfessional.cityId !== data.cityId) {
        throw new Error("Professional does not have permission to update a health unit in this city");
      }
    }

    // Se o CNPJ foi fornecido, verificar se já existe em outra unidade
    if (data.cnpj) {
      const healthUnitWithCnpj = await this.healthUnitRepository.getHealthUnitByCnpj(data.cnpj);
      if (healthUnitWithCnpj && healthUnitWithCnpj.id !== id) {
        throw new Error("CNPJ already in use");
      }
    }

    // Verificar se a cidade existe
    const cityExists = await this.cityRepository.getCityById(data.cityId);
    if (!cityExists) {
      throw new Error("City not found");
    }

    // Separar os dados do endereço
    const { address, ...healthUnitData } = data;

    // Atualizar o endereço principal, se fornecido
    if (address) {
      if (!address.street || !address.neighborhood || !address.zipCode) {
        throw new Error("Street, neighborhood and zipCode are required for address");
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