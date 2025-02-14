import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";
import argon2 from "argon2";

interface UpdateProfessionalDTO {
  fullName?: string;
  cpf?: string;
  profile?: 'ADMINISTRATOR' | 'DOCTOR' | 'RECEPTIONIST';
  password?: string;
  currentOffice?: number | null;
}

@injectable()
export class UpdateProfessionalUseCase {
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.professionalRepository = professionalRepository;
  }
  
  async execute(id: number, data: UpdateProfessionalDTO): Promise<Omit<Professional, 'password'>> {
    // Verifica se o profissional existe
    const professionalExists = await this.professionalRepository.getProfessionalById(id);
    if (!professionalExists) {
      throw new Error("Professional not found");
    }

    // Valida perfil se fornecido
    if (data.profile && !['ADMINISTRATOR', 'DOCTOR', 'RECEPTIONIST'].includes(data.profile)) {
      throw new Error("Invalid profile. Only 'ADMINISTRATOR', 'DOCTOR' or 'RECEPTIONIST' are allowed");
    }

    // Se o CPF foi fornecido, verifica se já existe em outro profissional
    if (data.cpf) {
      const professionalWithCpf = await this.professionalRepository.getProfessionalByCpf(data.cpf);
      if (professionalWithCpf && professionalWithCpf.id !== id) {
        throw new Error("CPF already in use");
      }
    }

    // Se a senha foi fornecida, faz o hash
    let updateData = { ...data };
    if (data.password) {
      updateData.password = await argon2.hash(data.password);
    }

    const professional = await this.professionalRepository.updateProfessional(id, updateData);
    const { password, ...result } = professional;
    return result;
  }
}