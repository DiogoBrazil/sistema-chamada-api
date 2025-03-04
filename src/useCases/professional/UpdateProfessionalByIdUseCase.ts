import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { ProfessionalAddressRepository } from "../../repositories/ProfessionalAddressRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";
import argon2 from "argon2";
import { IAddressDTO } from "../../interfaces/address/IAddressDTO";

interface UpdateProfessionalDTO {
  fullName?: string;
  cpf?: string;
  profile?: 'ADMINISTRATOR' | 'DOCTOR' | 'RECEPTIONIST' | 'NURSE' | 'NURSING_TECHNICIAN' | 'ACS' | 'ODONTOLOGIST';
  password?: string;
  currentOffice?: number | null;
  phone?: string;
  sex?: string;
  address?: IAddressDTO;
}

@injectable()
export class UpdateProfessionalUseCase {
  private professionalRepository: ProfessionalRepository;
  private professionalAddressRepository: ProfessionalAddressRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository,
    @inject(TYPES.ProfessionalAddressRepository) professionalAddressRepository: ProfessionalAddressRepository
  ) {
    this.professionalRepository = professionalRepository;
    this.professionalAddressRepository = professionalAddressRepository;
  }
  
  async execute(id: number, data: UpdateProfessionalDTO): Promise<Omit<Professional, 'password'>> {
    
    const professionalExists = await this.professionalRepository.getProfessionalById(id);
    if (!professionalExists) {
      throw new Error("Professional not found");
    }

    const allowedProfiles = [
      "GENERAL_ADMINISTRATOR",
      "LOCAL_ADMINISTRATOR", 
      "DOCTOR", 
      "RECEPTIONIST", 
      "NURSE", 
      "NURSING_TECHNICIAN",
      "ODONTOLOGIST",  
      "ACS"            
    ];

    if (data.profile && !allowedProfiles.includes(data.profile)) {
      throw new Error("Invalid profile. Only 'GENERAL_ADMINISTRATOR', 'LOCAL_ADMINISTRATOR', 'DOCTOR', 'RECEPTIONIST', 'NURSE', 'NURSING_TECHNICIAN', 'ODONTOLOGIST', or 'ACS' are allowed.");
    }

    // Se o CPF foi fornecido, verifica se já existe em outro profissional
    if (data.cpf) {
      const professionalWithCpf = await this.professionalRepository.getProfessionalByCpf(data.cpf);
      if (professionalWithCpf && professionalWithCpf.id !== id) {
        throw new Error("CPF already in use");
      }
    }

    // Separa os dados do endereço do profissional
    const { address, ...professionalData } = data;

    let updateProfessionalData = { ...professionalData };
    if (professionalData.password) {
      updateProfessionalData.password = await argon2.hash(professionalData.password);
    }
    const professional = await this.professionalRepository.updateProfessional(id, updateProfessionalData);

    const currentAddress = await this.professionalAddressRepository.getMainAddressByProfessionalId(id);
    const currentAddressId = currentAddress?.id;

    if (address) {
      if (!address.street || !address.city || !address.state || !address.zipCode) {
        throw new Error("Street, city, state and zipCode are required for address");
      }
      
      if (!currentAddressId) {
        // Se não houver endereço, cria um novo
        await this.professionalAddressRepository.createAddress(id, address);
      } else {
        // Se houver endereço, atualiza
        await this.professionalAddressRepository.updateAddress(currentAddressId, address);
      }
    }

    
    const { password, ...result } = professional;
    return result;
  }
}