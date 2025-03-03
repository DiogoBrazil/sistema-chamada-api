import { injectable, inject } from "inversify";
import { PatientRepository } from "../../repositories/PatientRepository";
import { TYPES } from "../../types";
import { Patient } from "@prisma/client";
import { IPaginatedResult } from "../../interfaces/patient/IPaginatedResult";

@injectable()
export class GetPatientsUseCase {
  private patientRepository: PatientRepository;
  
  constructor(
    @inject(TYPES.PatientRepository) patientRepository: PatientRepository
  ) {
    this.patientRepository = patientRepository;
  }
  
  async execute(page: number): Promise<IPaginatedResult<Patient>> {
    const pageNumber = Math.max(1, page); 
    return this.patientRepository.getPatients(pageNumber);
  }
}
