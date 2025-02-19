import { injectable, inject } from "inversify";
import { PatientRepository } from "../../repositories/PatientRepository";
import { TYPES } from "../../types";
import { Patient } from "@prisma/client";


@injectable()
export class GetPatientsByNameUseCase {
  private patientRepository: PatientRepository;
  
  constructor(
    @inject(TYPES.PatientRepository) patientRepository: PatientRepository
  ) {
    this.patientRepository = patientRepository;
  }
  
  async execute(name: string): Promise<Patient[]> {
    return this.patientRepository.getPatientsByName(name);
  }
}