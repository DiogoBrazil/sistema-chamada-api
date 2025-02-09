import { injectable, inject } from "inversify";
import { AttendanceRepository } from "../../repositories/AttendanceRepository";
import { TYPES } from "../../types";
import { Attendance } from "@prisma/client";

@injectable()
export class CallPatientUseCase {
  private attendanceRepository: AttendanceRepository;
  
  constructor(
    @inject(TYPES.AttendanceRepository) attendanceRepository: AttendanceRepository
  ) {
    this.attendanceRepository = attendanceRepository;
  }
  
  async execute(id: number): Promise<Attendance> {
    return this.attendanceRepository.callPatient(id);
  }
}
