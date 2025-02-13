import { injectable, inject } from "inversify";
import { PatientRepository } from "../../repositories/PatientRepository";
import { TYPES } from "../../types";
import { Patient } from "@prisma/client";

@injectable()
export class DeletePatientUseCase {
  private patientRepository: PatientRepository;
  
  constructor(
    @inject(TYPES.PatientRepository) patientRepository: PatientRepository
  ) {
    this.patientRepository = patientRepository;
  }
  
  async execute(id: number): Promise<void> {
    const patient = await this.patientRepository.getPatientById(id);

    if (!patient) {
      throw new Error("Patient not found");
    }

    const resulDelete = await this.patientRepository.deletePatientById(id);
  }
}