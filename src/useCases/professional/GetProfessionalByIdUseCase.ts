import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";

@injectable()
export class GetProfessionalByIdUseCase {
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.professionalRepository = professionalRepository;
  }
  
  async execute(id: number): Promise<Omit<Professional, "password"> | null> {
    const professional = await this.professionalRepository.getProfessionalById(id);
    if (!professional) return null;
    const { password, ...result } = professional;
    return result;
  }
}
