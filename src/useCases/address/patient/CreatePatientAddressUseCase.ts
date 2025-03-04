import { injectable, inject } from "inversify";
import { PatientAddressRepository } from "../../../repositories/PatientAddressRepository";
import { PatientRepository } from "../../../repositories/PatientRepository";
import { TYPES } from "../../../types";
import { PatientAddress } from "@prisma/client";
import { IAddressDTO } from "../../../interfaces/address/IAddressDTO";

@injectable()
export class CreatePatientAddressUseCase {
  private patientAddressRepository: PatientAddressRepository;
  private patientRepository: PatientRepository;
  
  constructor(
    @inject(TYPES.PatientAddressRepository) patientAddressRepository: PatientAddressRepository,
    @inject(TYPES.PatientRepository) patientRepository: PatientRepository
  ) {
    this.patientAddressRepository = patientAddressRepository;
    this.patientRepository = patientRepository;
  }
  
  async execute(patientId: number, data: IAddressDTO): Promise<PatientAddress> {
    // Verifica se o paciente existe
    const patient = await this.patientRepository.getPatientById(patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }
    
    // Validação básica de endereço
    if (!data.street || !data.city || !data.state || !data.number) {
      throw new Error("Street, city, state and number are required for address");
    }
    
    return this.patientAddressRepository.createAddress(patientId, data);
  }
}