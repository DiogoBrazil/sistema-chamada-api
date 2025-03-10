import { injectable, inject } from "inversify";
import { PatientRepository } from "../../repositories/PatientRepository";
import { PatientAddressRepository } from "../../repositories/PatientAddressRepository";
import { TYPES } from "../../types";
import { Patient } from "@prisma/client";
import { ICreatePatientDTO } from "../../interfaces/patient/ICreatePatientDTO";

@injectable()
export class CreatePatientUseCase {
  private patientRepository: PatientRepository;
  private patientAddressRepository: PatientAddressRepository;
  
  constructor(
    @inject(TYPES.PatientRepository) patientRepository: PatientRepository,
    @inject(TYPES.PatientAddressRepository) patientAddressRepository: PatientAddressRepository
  ) {
    this.patientRepository = patientRepository;
    this.patientAddressRepository = patientAddressRepository;
  }
  
  async execute(data: ICreatePatientDTO): Promise<Patient> {
    if (!data.socialName) {
      throw new Error("Social name is required");
    }

    // Separa os dados do endereço do paciente
    const { address, ...patientData } = data;

    if (address) {
      if (!address.street || !address.city || !address.state || !address.number) {
        throw new Error("Street, city, state and number are required for address");
      }
      
      return await this.patientRepository.createPatient(address, patientData);
    }
    
    return await this.patientRepository.createPatient(null,patientData);
    
  }
}