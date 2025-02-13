import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { Professional } from "@prisma/client";

interface ILoginDTO {
  cpf: string;
  password: string;
}

@injectable()
export class LoginProfessionalUseCase {
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.professionalRepository = professionalRepository;
  }
  
  async execute(data: ILoginDTO): Promise<{ token: string; user: Omit<Professional, "password"> }> {
    if (!data.cpf || !data.password) {
      throw new Error("CPF and password are required.");
    }
    
    const professional = await this.professionalRepository.getProfessionalByCpf(data.cpf);
    if (!professional) {
      throw new Error("Professional not found.");
    }
    
    const valid = await argon2.verify(professional.password, data.password);
    if (!valid) {
      throw new Error("Invalid credentials.");
    }
    
    const { password, ...userData } = professional;
    
    
    const secret = process.env.JWT_SECRET || "defaultsecret";
    const expiresIn = "1h";
    
    const token = jwt.sign(
      {
        fullName: professional.fullName,
        cpf: professional.cpf,
        profile: professional.profile,
      },
      secret,
      { expiresIn }
    );
    
    return { token, user: userData };
  }
}
