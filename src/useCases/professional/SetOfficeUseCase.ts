import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { ProfileType } from "../../constants/profilesTypes";
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

    if (professionalId === undefined || professionalId === null || 
      office === undefined || office === null) {
      throw new Error("professionalId and office are required.");
  }

    const professionalExists = await this.professionalRepository.getProfessionalById(professionalId);
    if (!professionalExists) {
      throw new Error("Professional not found.");
    }
  
    if (professionalExists.profile !== ProfileType.DOCTOR && professionalExists.profile !== ProfileType.NURSE) {
      throw new Error("Only doctors and nurses can set an office.");
    }
    const professional = await this.professionalRepository.updateOffice(professionalId, office);
    const { password, ...result } = professional;
    return result;
  }
}
