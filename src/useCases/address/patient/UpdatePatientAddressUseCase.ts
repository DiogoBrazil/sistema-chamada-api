import { injectable, inject } from "inversify";
import { PatientAddressRepository } from "../../../repositories/PatientAddressRepository";
import { TYPES } from "../../../types";
import { PatientAddress } from "@prisma/client";
import { IAddressDTO } from "../../../interfaces/address/IAddressDTO";

@injectable()
export class UpdatePatientAddressUseCase {
  private patientAddressRepository: PatientAddressRepository;
  
  constructor(
    @inject(TYPES.PatientAddressRepository) patientAddressRepository: PatientAddressRepository
  ) {
    this.patientAddressRepository = patientAddressRepository;
  }
  
  async execute(addressId: number, data: Partial<IAddressDTO>): Promise<PatientAddress> {
    // Validação: Se estiver atualizando campos obrigatórios, garantir que não estejam vazios
    if ((data.street !== undefined && !data.street) || 
        (data.city !== undefined && !data.city) || 
        (data.state !== undefined && !data.state) || 
        (data.zipCode !== undefined && !data.zipCode)) {
      throw new Error("Street, city, state and zipCode cannot be empty");
    }
    
    return this.patientAddressRepository.updateAddress(addressId, data);
  }
}
