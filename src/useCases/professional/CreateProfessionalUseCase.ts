import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { ProfessionalAddressRepository } from "../../repositories/ProfessionalAddressRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";
import { ICreateProfessionalDTO } from "../../interfaces/professional/ICreateProfessionalDTO";
import { emailValidator } from "../../utils/emailValidator";
import { PasswordEncryptor } from "../../adapters/PasswordEncryptor";

@injectable()
export class CreateProfessionalUseCase {
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
  
  async execute(data: ICreateProfessionalDTO): Promise<Omit<Professional, "password">> {
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
    
    if (!allowedProfiles.includes(data.profile)) {
      throw new Error("Invalid profile. Only 'GENERAL_ADMINISTRATOR', 'LOCAL_ADMINISTRATOR', 'DOCTOR', 'RECEPTIONIST', 'NURSE', 'NURSING_TECHNICIAN', 'ODONTOLOGIST' or 'ACS' are allowed.");
    }
    
    if (!data.password) {
      throw new Error("Password is required.");
    }

    if (data.email) {
      if (!emailValidator(data.email)) {
        throw new Error("Invalid email.");
      }
      
      const professionalByEmail = await this.professionalRepository.getProfessionalByEmail(data.email);
      if (professionalByEmail) {
        throw new Error("Email already in use.");
      }
    }
    
    // Separa os dados do endereço do profissional
    const { address, ...professionalData } = data;
    
    const hashedPassword = await this.passwordEncryptor.encrypt(data.password);

    const professionalDataWithHashedPassword = {
      ...professionalData,
      password: hashedPassword
    };
    
       
    if (address) {
      if (!address.street || !address.city || !address.state || !address.number) {
        throw new Error("Street, city, state and number are required for address");
      }
      
      const professional = await this.professionalRepository.createProfessional(address, professionalDataWithHashedPassword);

      // Remove a senha antes de retornar
      const { password, ...result } = professional;
      return result;
    }

    const professional = await this.professionalRepository.createProfessional(null, professionalDataWithHashedPassword);

    
    // Remove a senha antes de retornar
    const { password, ...result } = professional;
    return result;
  }
}