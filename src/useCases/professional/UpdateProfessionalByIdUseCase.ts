import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { ProfessionalAddressRepository } from "../../repositories/ProfessionalAddressRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";
import argon2 from "argon2";
import { IUpdateProfessionalDTO } from "../../interfaces/professional/IUpdateProfessionalDTO";


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
  
  async execute(id: number, data: IUpdateProfessionalDTO, adminId: number, userProfile: string): Promise<Omit<Professional, 'password'>> {
    
    const professionalExists = await this.professionalRepository.getProfessionalById(id);
    if (!professionalExists) {
      throw new Error("Professional not found");
    }

    // Validação de permissão baseada no perfil
    if (userProfile === 'GENERAL_LOCAL_ADMINISTRATOR') {
      const admin = await this.professionalRepository.getProfessionalById(adminId);
      if (!admin) {
        throw new Error("Admin not found");
      }
      if (admin.cityId !== professionalExists.cityId) {
        throw new Error("You can only update professionals from your city");
      }
    } else if (userProfile === 'LOCAL_ADMINISTRATOR') {
      const adminHealthUnits = await this.professionalRepository.getAdminHealthUnits(adminId);
      const professionalHealthUnits = await this.professionalRepository.getAdminHealthUnits(id);
      
      const hasSharedUnit = professionalHealthUnits.some(unit => 
        adminHealthUnits.some(adminUnit => adminUnit.id === unit.id)
      );
      
      if (!hasSharedUnit) {
        throw new Error("You can only update professionals from your health unit");
      }
    }

    const allowedProfiles = [
      "GENERAL_ADMINISTRATOR",
      "GENERAL_LOCAL_ADMINISTRATOR",
      "LOCAL_ADMINISTRATOR", 
      "DOCTOR", 
      "RECEPTIONIST", 
      "NURSE", 
      "NURSING_TECHNICIAN",
      "ODONTOLOGIST",  
      "ACS"            
    ];

    if (data.profile && !allowedProfiles.includes(data.profile)) {
      throw new Error("Invalid profile. Only 'GENERAL_ADMINISTRATOR', 'GENERAL_LOCAL_ADMINISTRATOR', 'LOCAL_ADMINISTRATOR', 'DOCTOR', 'RECEPTIONIST', 'NURSE', 'NURSING_TECHNICIAN', 'ODONTOLOGIST', or 'ACS' are allowed.");
    }

    if (data.cpf) {
      const professionalWithCpf = await this.professionalRepository.getProfessionalByCpf(data.cpf);
      if (professionalWithCpf && professionalWithCpf.id !== id) {
        throw new Error("CPF already in use");
      }
    }

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
        await this.professionalAddressRepository.createAddress(id, address);
      } else {
        await this.professionalAddressRepository.updateAddress(currentAddressId, address);
      }
    }

    const { password, ...result } = professional;
    return result;
  }
}