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
    
    if (!["TRIAGE", "CONSULTATION"].includes(attendanceMode)) {
      throw new Error("Invalid attendance mode. Only 'TRIAGE' or 'CONSULTATION' are allowed.");
    }
    
    const professional = await this.professionalRepository.updateAttendanceMode(professionalId, attendanceMode);
    const { password, ...result } = professional;
    return result;
  }
}