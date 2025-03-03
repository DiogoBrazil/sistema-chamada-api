import { injectable, inject } from "inversify";
import { PatientAddressRepository } from "../../../repositories/PatientAddressRepository";
import { TYPES } from "../../../types";

@injectable()
export class DeletePatientAddressUseCase {
  private patientAddressRepository: PatientAddressRepository;
  
  constructor(
    @inject(TYPES.PatientAddressRepository) patientAddressRepository: PatientAddressRepository
  ) {
    this.patientAddressRepository = patientAddressRepository;
  }
  
  async execute(addressId: number): Promise<void> {
    await this.patientAddressRepository.deleteAddress(addressId);
  }
}