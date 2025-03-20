import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";
import { PasswordEncryptor } from "../../adapters/PasswordEncryptor";
import { TokenGenerator } from "../../adapters/TokenGenerator";

interface ILoginDTO {
  cpf: string;
  password: string;
}

@injectable()
export class LoginProfessionalUseCase {
  private professionalRepository: ProfessionalRepository;
  private passwordEncryptor: PasswordEncryptor;
  private tokenGenerator: TokenGenerator;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository,
    @inject(TYPES.PasswordEncryptor) passwordEncryptor: PasswordEncryptor,
    @inject(TYPES.TokenGenerator) tokenGenerator: TokenGenerator
  ) {
    this.professionalRepository = professionalRepository;
    this.passwordEncryptor = passwordEncryptor;
    this.tokenGenerator = tokenGenerator;
  }
  
  async execute(data: ILoginDTO): Promise<{ token: string; user: Omit<Professional, "password"> }> {
    if (!data.cpf || !data.password) {
      throw new Error("CPF and password are required.");
    }
    
    const professional = await this.professionalRepository.getProfessionalByCpf(data.cpf);
    if (!professional) {
      throw new Error("Professional not found.");
    }
    
    const valid = await this.passwordEncryptor.verify(professional.password, data.password);
    if (!valid) {
      throw new Error("Invalid credentials.");
    }
    
    const { password, ...userData } = professional;
    
    const token = this.tokenGenerator.generate({
      id: professional.id,
      fullName: professional.fullName,
      cpf: professional.cpf,
      profile: professional.profile,
      attendanceMode: professional.attendanceMode,
    });
    
    return { token, user: userData };
  }
}
