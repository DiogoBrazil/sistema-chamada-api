import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";

@injectable()
export class GetProfessionalsUseCase {
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.professionalRepository = professionalRepository;
  }
  
  async execute(): Promise<Omit<Professional, "password">[]> {
    const professionals = await this.professionalRepository.getProfessionals();
    return professionals.map(({ password, ...rest }) => rest);
  }
}
