import { injectable, inject } from "inversify";
import { PatientRepository } from "../../repositories/PatientRepository";
import { PatientAddressRepository } from "../../repositories/PatientAddressRepository";
import { TYPES } from "../../types";
import { IAddressDTO } from "../../interfaces/address/IAddressDTO"
import { Patient } from "@prisma/client";

interface UpdatePatientDTO {
  fullName?: string;
  socialName?: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
  race?: string;
  address?: IAddressDTO;
}

@injectable()
export class UpdatePatientUseCase {
  private patientRepository: PatientRepository;
  private patientAddressRepository: PatientAddressRepository;
  
  constructor(
    @inject(TYPES.PatientRepository) patientRepository: PatientRepository,
    @inject(TYPES.PatientAddressRepository) patientAddressRepository: PatientAddressRepository
  ) {
    this.patientRepository = patientRepository;
    this.patientAddressRepository = patientAddressRepository
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

    // Verifica se o nome social foi fornecido (obrigatório)
    if (!data.socialName) {
      throw new Error("Social name is required");
    }

    // Separa os dados do endereço do paciente
    const { address, ...patientData } = data;

    if (address) {
      if (!address.street || !address.city || !address.state || !address.zipCode) {
        throw new Error("Street, city, state and zipCode are required for address");
      }
      const patientAddress = await this.patientAddressRepository.getMainAddressByPatientId(id);
      const currentAddressId = patientAddress?.id;
      if (!currentAddressId) {
        // Se não houver endereço principal, cria um novo
        await this.patientAddressRepository.createAddress(id, address);
      } else {
        // Se houver, atualiza
        await this.patientAddressRepository.updateAddress(currentAddressId, address);
      }
    }

    // Atualiza o paciente
    return this.patientRepository.updatePatient(id, patientData);

    
  }
}