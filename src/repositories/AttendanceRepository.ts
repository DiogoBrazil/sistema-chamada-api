import { injectable } from "inversify";
import { PrismaClient, Attendance, AttendanceStatus } from "@prisma/client";

@injectable()
export class AttendanceRepository {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async createAttendance(patientId: number): Promise<Attendance> {
    return this.prisma.attendance.create({
      data: {
        patient: { connect: { id: patientId } },
        status: AttendanceStatus.PENDING,
      },
    });
  }
  
  async getAttendances(): Promise<Attendance[]> {
    return this.prisma.attendance.findMany({
      where: {
        status: { in: [AttendanceStatus.PENDING, AttendanceStatus.IN_PROGRESS] },
      },
      include: { patient: true },
    });
  }
  
  async callPatient(id: number, officeNumber: number): Promise<Attendance> {
    return this.prisma.attendance.update({
      where: { id },
      data: { 
        status: AttendanceStatus.IN_PROGRESS,
        officeNumber,
       },
      include: { patient: true },
    });
  }
  
  async finishAttendance(id: number, professionalId: number, office: number): Promise<Attendance> {
    return this.prisma.attendance.update({
      where: { id },
      data: {
        status: AttendanceStatus.FINISHED,
        professional: { connect: { id: professionalId } },
        officeNumber: office,
        finishedAt: new Date(),
      },
    });
  }
  
  async getAttendanceReport(professionalId: number, start: Date, end: Date): Promise<Attendance[]> {
    return this.prisma.attendance.findMany({
      where: {
        professionalId,
        finishedAt: { gte: start, lte: end },
        status: AttendanceStatus.FINISHED,
      },
    });
  }
}
