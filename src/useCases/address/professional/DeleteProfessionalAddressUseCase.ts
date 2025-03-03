import { injectable, inject } from "inversify";
import { ProfessionalAddressRepository } from "../../../repositories/ProfessionalAddressRepository";
import { TYPES } from "../../../types";

@injectable()
export class DeleteProfessionalAddressUseCase {
  private professionalAddressRepository: ProfessionalAddressRepository;
  
  constructor(
    @inject(TYPES.ProfessionalAddressRepository) professionalAddressRepository: ProfessionalAddressRepository
  ) {
    this.professionalAddressRepository = professionalAddressRepository;
  }
  
  async execute(addressId: number): Promise<void> {
    await this.professionalAddressRepository.deleteAddress(addressId);
  }
}