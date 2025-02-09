import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";

@injectable()
export class SetOfficeUseCase {
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.professionalRepository = professionalRepository;
  }
  
  async execute(professionalId: number, office: number): Promise<Omit<Professional, "password">> {
    if (!professionalId || !office) {
      throw new Error("professionalId and office are required.");
    }
    const professional = await this.professionalRepository.updateOffice(professionalId, office);
    const { password, ...result } = professional;
    return result;
  }
}
