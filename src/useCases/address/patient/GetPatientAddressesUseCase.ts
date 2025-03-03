import { injectable, inject } from "inversify";
import { PatientAddressRepository } from "../../../repositories/PatientAddressRepository";
import { PatientRepository } from "../../../repositories/PatientRepository";
import { TYPES } from "../../../types";
import { PatientAddress } from "@prisma/client";

@injectable()
export class GetPatientAddressesUseCase {
  private patientAddressRepository: PatientAddressRepository;
  private patientRepository: PatientRepository;
  
  constructor(
    @inject(TYPES.PatientAddressRepository) patientAddressRepository: PatientAddressRepository,
    @inject(TYPES.PatientRepository) patientRepository: PatientRepository
  ) {
    this.patientAddressRepository = patientAddressRepository;
    this.patientRepository = patientRepository;
  }
  
  async execute(patientId: number): Promise<PatientAddress[]> {
    // Verifica se o paciente existe
    const patient = await this.patientRepository.getPatientById(patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }
    
    return this.patientAddressRepository.getAddressesByPatientId(patientId);
  }
}