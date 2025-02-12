import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import argon2 from "argon2";
import { Professional } from "@prisma/client";
import { ICreateProfessionalDTO } from "../../interfaces/professional/ICreateProfessionalDTO";

@injectable()
export class CreateProfessionalUseCase {
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.professionalRepository = professionalRepository;
  }
  
  async execute(data: ICreateProfessionalDTO): Promise<Omit<Professional, "password">> {
    const allowedProfiles = ["ADMINISTRATOR","DOCTOR", "RECEPTIONIST"];
    if (!allowedProfiles.includes(data.profile)) {
      throw new Error("Invalid profile. Only 'ADMINISTRATOR' or 'DOCTOR' or 'RECEPTIONIST' are allowed.");
    }
    if (!data.password) {
      throw new Error("Password is required.");
    }
    const hashedPassword = await argon2.hash(data.password);
    const professional = await this.professionalRepository.createProfessional({
      fullName: data.fullName,
      cpf: data.cpf,
      profile: data.profile,
      password: hashedPassword,
    });
    const { password, ...result } = professional;
    return result;
  }
}
