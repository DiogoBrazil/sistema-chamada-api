import { injectable, inject } from "inversify";
import { AttendanceRepository } from "../../repositories/AttendanceRepository";
import { TYPES } from "../../types";
import { Attendance } from "@prisma/client";
import { getIO } from "../../sockets";

@injectable()
export class CallPatientUseCase {
  private attendanceRepository: AttendanceRepository;
  
  constructor(
    @inject(TYPES.AttendanceRepository) attendanceRepository: AttendanceRepository
  ) {
    this.attendanceRepository = attendanceRepository;
  }
  
  async execute(userId: number, officeNumber: number): Promise<Attendance> {
    // Atualiza o atendimento (por exemplo, alterando o status para IN_PROGRESS)
    const updatedAttendance = await this.attendanceRepository.callPatient(userId, officeNumber);

    // Emite o evento para chamar o paciente via Socket.IO
    const io = getIO();
    io.emit("callPatient", updatedAttendance);

    return updatedAttendance;
  }
}
