import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";

@injectable()
export class DeleteProfessionalUseCase {
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.professionalRepository = professionalRepository;
  }
  
  async execute(id: number): Promise<void> {
    const professional = await this.professionalRepository.getProfessionalById(id);

    if (!professional) {
      throw new Error("Professional not found");
    }

    // Verifica se tem atendimentos ativos
    const hasActiveAttendances = await this.professionalRepository.hasActiveAttendances(id);
    if (hasActiveAttendances) {
      throw new Error("Cannot delete a professional with active attendances");
    }

    await this.professionalRepository.deleteProfessional(id);
  }
}