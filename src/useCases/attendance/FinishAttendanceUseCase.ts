import { injectable, inject } from "inversify";
import { AttendanceRepository } from "../../repositories/AttendanceRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { TYPES } from "../../types";
import { Attendance } from "@prisma/client";

@injectable()
export class FinishAttendanceUseCase {
  private attendanceRepository: AttendanceRepository;
  private professionalRepository: ProfessionalRepository;
  
  constructor(
    @inject(TYPES.AttendanceRepository) attendanceRepository: AttendanceRepository,
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository
  ) {
    this.attendanceRepository = attendanceRepository;
    this.professionalRepository = professionalRepository;
  }
  
  async execute(id: number, professionalId: number): Promise<Attendance> {
    const professional = await this.professionalRepository.getProfessionalById(professionalId);
    if (!professional) {
      throw new Error("Professional not found.");
    }
    const office = professional.currentOffice;
    if (office === null || office === undefined) {
      throw new Error("Office not set for the professional.");
    }
    return this.attendanceRepository.finishAttendance(id, professionalId, office);
  }
}
