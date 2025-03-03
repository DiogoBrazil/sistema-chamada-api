import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { ProfessionalAddressRepository } from "../../repositories/ProfessionalAddressRepository";
import { TYPES } from "../../types";
import argon2 from "argon2";
import { Professional } from "@prisma/client";
import { ICreateProfessionalDTO } from "../../interfaces/professional/ICreateProfessionalDTO";

@injectable()
export class CreateProfessionalUseCase {
  private professionalRepository: ProfessionalRepository;
  private professionalAddressRepository: ProfessionalAddressRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository,
    @inject(TYPES.ProfessionalAddressRepository) professionalAddressRepository: ProfessionalAddressRepository
  ) {
    this.professionalRepository = professionalRepository;
    this.professionalAddressRepository = professionalAddressRepository;
  }
  
  async execute(data: ICreateProfessionalDTO): Promise<Omit<Professional, "password">> {
    const allowedProfiles = [
      "ADMINISTRATOR", 
      "DOCTOR", 
      "RECEPTIONIST", 
      "NURSE", 
      "NURSING_TECHNICIAN",
      "ODONTOLOGIST",  
      "ACS"            
    ];
    
    if (!allowedProfiles.includes(data.profile)) {
      throw new Error("Invalid profile. Only 'ADMINISTRATOR', 'DOCTOR', 'RECEPTIONIST', 'NURSE', 'NURSING_TECHNICIAN', 'ODONTOLOGIST', or 'ACS' are allowed.");
    }
    
    if (!data.password) {
      throw new Error("Password is required.");
    }
    
    // Separa os dados do endereço do profissional
    const { address, ...professionalData } = data;
    
    // Faz o hash da senha
    const hashedPassword = await argon2.hash(data.password);
    
    // Cria o profissional com a senha criptografada
    const professional = await this.professionalRepository.createProfessional({
      ...professionalData,
      password: hashedPassword
    });
    
    // Se um endereço foi fornecido, adiciona-o
    if (address) {
      // Validação básica de endereço
      if (!address.street || !address.city || !address.state || !address.zipCode) {
        throw new Error("Street, city, state and zipCode are required for address");
      }
      
      await this.professionalAddressRepository.createAddress(professional.id, address);
    }
    
    // Remove a senha antes de retornar
    const { password, ...result } = professional;
    return result;
  }
}