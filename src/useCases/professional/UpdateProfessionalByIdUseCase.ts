import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { ProfessionalAddressRepository } from "../../repositories/ProfessionalAddressRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";
import { IUpdateProfessionalDTO } from "../../interfaces/professional/IUpdateProfessionalDTO";
import { emailValidator } from "../../utils/emailValidator";
import { ProfileType } from "../../constants/profilesTypes";
import { PasswordEncryptor } from "../../adapters/PasswordEncryptor";

@injectable()
export class UpdateProfessionalUseCase {
  private professionalRepository: ProfessionalRepository;
  private professionalAddressRepository: ProfessionalAddressRepository;
  private passwordEncryptor: PasswordEncryptor;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository,
    @inject(TYPES.ProfessionalAddressRepository) professionalAddressRepository: ProfessionalAddressRepository,
    @inject(TYPES.PasswordEncryptor) passwordEncryptor: PasswordEncryptor
  ) {
    this.professionalRepository = professionalRepository;
    this.professionalAddressRepository = professionalAddressRepository;
    this.passwordEncryptor = passwordEncryptor;
  }
  
  async execute(id: number, data: IUpdateProfessionalDTO, adminId: number, userProfile: string): Promise<Omit<Professional, 'password'>> {
    
    const professionalExists = await this.professionalRepository.getProfessionalById(id);
    if (!professionalExists) {
      throw new Error("Professional not found");
    }

    // Verificar se o admin está tentando atualizar um perfil que não tem permissão
    if (userProfile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
      const admin = await this.professionalRepository.getProfessionalById(adminId);
      if (!admin) {
        throw new Error("Admin not found");
      }
      
      // Não pode atualizar um admin geral
      if (professionalExists.profile === ProfileType.GENERAL_ADMINISTRATOR) {
        throw new Error("General local administrators cannot update general administrators");
      }
      
      // Verificar se pertence à mesma cidade
      if (admin.cityId !== professionalExists.cityId) {
        throw new Error("You can only update professionals from your city");
      }
      
      // Não pode transformar em admin geral ou outro admin geral local
      if (data.profile === ProfileType.GENERAL_ADMINISTRATOR || 
          (data.profile === ProfileType.GENERAL_LOCAL_ADMINISTRATOR && professionalExists.profile !== ProfileType.GENERAL_LOCAL_ADMINISTRATOR)) {
        throw new Error("General local administrators cannot create or update to general administrator profiles");
      }
    } else if (userProfile === ProfileType.LOCAL_ADMINISTRATOR) {
      // Admin local só pode atualizar profissionais da sua unidade
      const adminHealthUnits = await this.professionalRepository.getAdminHealthUnits(adminId);
      const professionalHealthUnits = await this.professionalRepository.getAdminHealthUnits(id);
      
      if (!adminHealthUnits || adminHealthUnits.length === 0) {
        throw new Error("Local administrator is not linked to any health unit");
      }
      
      const hasSharedUnit = professionalHealthUnits.some(unit => 
        adminHealthUnits.some(adminUnit => adminUnit.id === unit.id)
      );
      
      if (!hasSharedUnit) {
        throw new Error("You can only update professionals from your health unit");
      }
      
      // Admin local não pode atualizar perfis de administradores
      const restrictedProfiles = [
        String(ProfileType.GENERAL_ADMINISTRATOR), 
        String(ProfileType.GENERAL_LOCAL_ADMINISTRATOR), 
        String(ProfileType.LOCAL_ADMINISTRATOR)
      ];
      
      if (restrictedProfiles.includes(professionalExists.profile) || 
          (data.profile && restrictedProfiles.includes(data.profile))) {
        throw new Error("Local administrators cannot update administrator profiles");
      }
    } else if (userProfile === ProfileType.GENERAL_ADMINISTRATOR) {
      // Admin geral não pode atualizar outro admin geral
      if (professionalExists.profile === ProfileType.GENERAL_ADMINISTRATOR && adminId !== id) {
        throw new Error("General administrators cannot update other general administrators");
      }
      
      // Não pode transformar em admin geral
      if (data.profile === ProfileType.GENERAL_ADMINISTRATOR && professionalExists.profile !== ProfileType.GENERAL_ADMINISTRATOR) {
        throw new Error("Cannot update a professional to general administrator profile");
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

    // Validar email
    if (data.email) {
      if (!emailValidator(data.email)) {
        throw new Error("Invalid email.");
      }
      
      const professionalByEmail = await this.professionalRepository.getProfessionalByEmail(data.email);
      if (professionalByEmail && professionalByEmail.id !== id) {
        throw new Error("Email already in use.");
      }
    }

    // Validar CPF
    if (data.cpf) {
      const professionalWithCpf = await this.professionalRepository.getProfessionalByCpf(data.cpf);
      if (professionalWithCpf && professionalWithCpf.id !== id) {
        throw new Error("CPF already in use");
      }
    }

    const { address, ...professionalData } = data;

    let updateProfessionalData = { ...professionalData };
    if (professionalData.password) {
      updateProfessionalData.password = await this.passwordEncryptor.encrypt(professionalData.password);
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