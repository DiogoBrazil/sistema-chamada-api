import { injectable, inject } from "inversify";
import { ProfessionalAddressRepository } from "../../../repositories/ProfessionalAddressRepository";
import { TYPES } from "../../../types";
import { ProfessionalAddress } from "@prisma/client";
import { IAddressDTO } from "../../../interfaces/address/IAddressDTO";

@injectable()
export class UpdateProfessionalAddressUseCase {
  private professionalAddressRepository: ProfessionalAddressRepository;
  
  constructor(
    @inject(TYPES.ProfessionalAddressRepository) professionalAddressRepository: ProfessionalAddressRepository
  ) {
    this.professionalAddressRepository = professionalAddressRepository;
  }
  
  async execute(addressId: number, data: Partial<IAddressDTO>): Promise<ProfessionalAddress> {
    // Validação: Se estiver atualizando campos obrigatórios, garantir que não estejam vazios
    if ((data.street !== undefined && !data.street) || 
        (data.city !== undefined && !data.city) || 
        (data.state !== undefined && !data.state) || 
        (data.zipCode !== undefined && !data.zipCode)) {
      throw new Error("Street, city, state and zipCode cannot be empty");
    }
    
    return this.professionalAddressRepository.updateAddress(addressId, data);
  }
}