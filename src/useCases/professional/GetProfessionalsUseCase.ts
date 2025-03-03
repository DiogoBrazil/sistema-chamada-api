import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { IPaginatedProfessionalResult } from "../../interfaces/professional/IPaginatedProfessionalResult";

@injectable()
export class GetProfessionalsUseCase {
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.professionalRepository = professionalRepository;
  }
  
  async execute(page: number): Promise<IPaginatedProfessionalResult> {
    const pageNumber = Math.max(1, page);
    return this.professionalRepository.getProfessionals(pageNumber);
  }
}