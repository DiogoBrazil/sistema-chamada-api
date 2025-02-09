import { injectable, inject } from "inversify";
import { AttendanceRepository } from "../../repositories/AttendanceRepository";
import { TYPES } from "../../types";
import { Attendance } from "@prisma/client";
import { IGetAttendanceReportDTO } from "../../interfaces/attendance/IGetAttendanceReportDTO";

@injectable()
export class GetAttendanceReportUseCase {
  private attendanceRepository: AttendanceRepository;
  
  constructor(
    @inject(TYPES.AttendanceRepository) attendanceRepository: AttendanceRepository
  ) {
    this.attendanceRepository = attendanceRepository;
  }
  
  async execute(data: IGetAttendanceReportDTO): Promise<{ count: number, attendances: Attendance[] }> {
    const { professionalId, startDate, startTime, endDate, endTime } = data;
    const professionalIdNum = Number(professionalId);
    if (isNaN(professionalIdNum)) {
      throw new Error("Invalid professionalId.");
    }
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid date and/or time.");
    }
    const attendances = await this.attendanceRepository.getAttendanceReport(professionalIdNum, start, end);
    return { count: attendances.length, attendances };
  }
}
