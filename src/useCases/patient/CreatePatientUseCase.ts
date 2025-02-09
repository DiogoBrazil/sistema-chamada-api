import { injectable, inject } from "inversify";
import { PatientRepository } from "../../repositories/PatientRepository";
import { TYPES } from "../../types";
import { Patient } from "@prisma/client";
import { ICreatePatientDTO } from "../../interfaces/patient/ICreatePatientDTO";

@injectable()
export class CreatePatientUseCase {
  private patientRepository: PatientRepository;
  
  constructor(
    @inject(TYPES.PatientRepository) patientRepository: PatientRepository
  ) {
    this.patientRepository = patientRepository;
  }
  
  async execute(data: ICreatePatientDTO): Promise<Patient> {
    return this.patientRepository.createPatient(data);
  }
}
