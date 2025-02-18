import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import argon2 from "argon2";
import { Professional } from "@prisma/client";

@injectable()
export class InitializeAdminUseCase {
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.professionalRepository = professionalRepository;
  }
  
  async execute(): Promise<void> {
    // Verifica se já existe um administrador
    const professionals = await this.professionalRepository.getProfessionals();
    const hasAdmin = professionals.some(prof => prof.profile === "ADMINISTRATOR");
    
    if (!hasAdmin) {
      // Cria o administrador padrão
      const password = process.env.PASSWORD_ADMIN;
      if (!password) {
        throw new Error("Missing ADMIN_PASSWORD environment variable");
      }

      const fullName = process.env.FULLNAME_ADMIN;
      const cpf = process.env.CPF_ADMIN;
      const profile = process.env.PROFILE_ADMIN;
      const hashedPassword = await argon2.hash(password);
      
      if (!fullName || !cpf || !profile) {
        throw new Error("Missing ADMIN credentials environment variables");
      }

      const adminData = {
        fullName,
        cpf,
        profile,
        password: hashedPassword,
      };
      
      await this.professionalRepository.createProfessional(adminData);
      console.log("Administrator account created successfully");
    }
  }
}