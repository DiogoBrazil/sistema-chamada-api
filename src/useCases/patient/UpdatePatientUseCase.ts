import { injectable, inject } from "inversify";
import { PatientRepository } from "../../repositories/PatientRepository";
import { TYPES } from "../../types";
import { Patient } from "@prisma/client";

interface UpdatePatientDTO {
  fullName?: string;
  cpf?: string;
  birthDate?: string;
}

@injectable()
export class UpdatePatientUseCase {
  private patientRepository: PatientRepository;
  
  constructor(
    @inject(TYPES.PatientRepository) patientRepository: PatientRepository
  ) {
    this.patientRepository = patientRepository;
  }
  
  async execute(id: number, data: UpdatePatientDTO): Promise<Patient> {
    // Verifica se o paciente existe
    const patientExists = await this.patientRepository.getPatientById(id);
    if (!patientExists) {
      throw new Error("Patient not found");
    }

    // Se o CPF foi fornecido, verifica se já existe em outro paciente
    if (data.cpf) {
      const patientWithCpf = await this.patientRepository.getPatientByCpf(data.cpf);
      if (patientWithCpf && patientWithCpf.id !== id) {
        throw new Error("CPF already in use");
      }
    }

    return this.patientRepository.updatePatient(id, data);
  }
}