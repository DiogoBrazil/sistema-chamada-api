import { injectable, inject } from "inversify";
import { ProfessionalAddressRepository } from "../../../repositories/ProfessionalAddressRepository";
import { ProfessionalRepository } from "../../../repositories/ProfessionalRepository";
import { TYPES } from "../../../types";
import { ProfessionalAddress } from "@prisma/client";
import { IAddressDTO } from "../../../interfaces/address/IAddressDTO";

@injectable()
export class CreateProfessionalAddressUseCase {
  private professionalAddressRepository: ProfessionalAddressRepository;
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.ProfessionalAddressRepository) professionalAddressRepository: ProfessionalAddressRepository,
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.professionalAddressRepository = professionalAddressRepository;
    this.professionalRepository = professionalRepository;
  }
  
  async execute(professionalId: number, data: IAddressDTO): Promise<ProfessionalAddress> {
    // Verifica se o profissional existe
    const professional = await this.professionalRepository.getProfessionalById(professionalId);
    if (!professional) {
      throw new Error("Professional not found");
    }
    
    // Validação básica de endereço
    if (!data.street || !data.city || !data.state || !data.zipCode) {
      throw new Error("Street, city, state and zipCode are required for address");
    }
    
    return this.professionalAddressRepository.createAddress(professionalId, data);
  }
}
