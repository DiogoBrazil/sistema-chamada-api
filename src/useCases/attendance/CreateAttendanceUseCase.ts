import { injectable, inject } from "inversify";
import { AttendanceRepository } from "../../repositories/AttendanceRepository";
import { TYPES } from "../../types";
import { Attendance } from "@prisma/client";

@injectable()
export class CreateAttendanceUseCase {
  private attendanceRepository: AttendanceRepository;
  
  constructor(
    @inject(TYPES.AttendanceRepository) attendanceRepository: AttendanceRepository
  ) {
    this.attendanceRepository = attendanceRepository;
  }
  
  async execute(patientId: number): Promise<Attendance> {
    return this.attendanceRepository.createAttendance(patientId);
  }
}
