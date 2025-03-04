import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { Professional } from "@prisma/client";
import { ISetAttendanceModeDTO } from "../../interfaces/professional/ISetAttendanceModeDTO";

@injectable()
export class SetAttendanceModeUseCase {
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.professionalRepository = professionalRepository;
  }
  
  async execute(data: ISetAttendanceModeDTO): Promise<Omit<Professional, "password">> {
    const { professionalId, attendanceMode } = data;

    const professionalExists = await this.professionalRepository.getProfessionalById(professionalId);
    if (!professionalExists) {
      throw new Error("Professional not found.");
    }

    if (professionalExists.profile == "NURSE") {
      if (!["TRIAGE", "CONSULTATION", "VACCINE"].includes(attendanceMode)) {
        throw new Error("Invalid attendance mode. Only 'TRIAGE' or 'CONSULTATION' or 'VACCINE' are allowed.");
      }
    } else if (professionalExists.profile == "NURSING_TECHNICIAN") {
      if (!["TRIAGE", "VACCINE"].includes(attendanceMode)) {
        throw new Error("Invalid attendance mode. Only 'TRIAGE' or 'CONSULTATION' or 'VACCINE' are allowed.");
      }
    }

    const professional = await this.professionalRepository.updateAttendanceMode(professionalId, attendanceMode);
    const { password, ...result } = professional;
    return result;
  }
}