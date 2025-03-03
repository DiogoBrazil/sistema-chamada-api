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
    // Verifica se o nome social foi fornecido (obrigatório)
    if (!data.socialName) {
      throw new Error("Social name is required");
    }

    // Separa os dados do endereço do paciente
    const { address, ...patientData } = data;
    
    // Cria o paciente
    const patient = await this.patientRepository.createPatient(patientData);
    
    // Se um endereço foi fornecido, adiciona-o
    if (address) {
      // Validação básica de endereço
      if (!address.street || !address.city || !address.state || !address.zipCode) {
        throw new Error("Street, city, state and zipCode are required for address");
      }
      
      await this.patientAddressRepository.createAddress(patient.id, address);
    }
    
    return patient;
  }
}