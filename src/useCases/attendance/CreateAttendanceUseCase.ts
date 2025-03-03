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
  
  async execute(patientId: number, attendanceStage: string): Promise<Attendance> {
    const allowedStages = ["TRIAGE", "DENTAL_CONSULTATION", "VACCINE"];
    if (!allowedStages.includes(attendanceStage)) {
      throw new Error("Invalid attendance stage");
    }
    return this.attendanceRepository.createAttendance(patientId, attendanceStage);
  }
}
