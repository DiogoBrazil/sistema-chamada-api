import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";

@injectable()
export class GetProfessionalByCpfUseCase {
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.professionalRepository = professionalRepository;
  }
  
  async execute(cpf: string): Promise<Omit<Professional, "password"> | null> {
    const professional = await this.professionalRepository.getProfessionalByCpf(cpf);
    if (!professional) return null;
    const { password, ...result } = professional;
    return result;
  }
}
