import { injectable, inject } from "inversify";
import { ProfessionalAddressRepository } from "../../../repositories/ProfessionalAddressRepository";
import { ProfessionalRepository } from "../../../repositories/ProfessionalRepository";
import { TYPES } from "../../../types";
import { ProfessionalAddress } from "@prisma/client";

@injectable()
export class GetProfessionalAddressesUseCase {
  private professionalAddressRepository: ProfessionalAddressRepository;
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.ProfessionalAddressRepository) professionalAddressRepository: ProfessionalAddressRepository,
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.professionalAddressRepository = professionalAddressRepository;
    this.professionalRepository = professionalRepository;
  }
  
  async execute(professionalId: number): Promise<ProfessionalAddress[]> {
    // Verifica se o profissional existe
    const professional = await this.professionalRepository.getProfessionalById(professionalId);
    if (!professional) {
      throw new Error("Professional not found");
    }
    
    return this.professionalAddressRepository.getAddressesByProfessionalId(professionalId);
  }
}