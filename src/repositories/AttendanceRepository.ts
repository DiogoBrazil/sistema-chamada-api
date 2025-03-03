import { injectable } from "inversify";
import { PrismaClient, Attendance, AttendanceStatus, AttendanceStage, AttendanceHistory } from "@prisma/client";

@injectable()
export class AttendanceRepository {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async createAttendance(patientId: number, attendanceStage: string): Promise<Attendance> {
    return this.prisma.attendance.create({
      data: {
        patient: { connect: { id: patientId } },
        status: AttendanceStatus.PENDING,
        stage: attendanceStage as AttendanceStage,
      },
      include: { patient: true },
    });
  }
  
  async getAttendances(stage?: AttendanceStage): Promise<Attendance[]> {
    // Se não especificar o estágio, retorna todos pendentes ou em progresso
    if (!stage) {
      return this.prisma.attendance.findMany({
        where: {
          status: { in: [AttendanceStatus.PENDING, AttendanceStatus.IN_PROGRESS] },
        },
        include: { patient: true },
      });
    }
    
    // Se especificar o estágio, filtra por ele
    return this.prisma.attendance.findMany({
      where: {
        status: { in: [AttendanceStatus.PENDING, AttendanceStatus.IN_PROGRESS] },
        stage: stage,
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

  async getAttendanceById(id: number): Promise<Attendance | null> {
    return this.prisma.attendance.findUnique({
      where: { id },
      include: { patient: true }
    });
  }
  
  async finishAttendance(id: number, professionalId: number, office: number): Promise<Attendance> {
    // Primeiro, buscar o atendimento atual para obter o estágio atual
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: { patient: true }
    });
    
    if (!attendance) {
      throw new Error("Attendance not found");
    }
    
    return this.prisma.$transaction(async (tx) => {
      // Atualizar o atendimento para status FINISHED
      const updatedAttendance = await tx.attendance.update({
        where: { id },
        data: {
          status: AttendanceStatus.FINISHED,
          professional: { connect: { id: professionalId } },
          officeNumber: office,
          finishedAt: new Date(),
        },
        include: { patient: true },
      });
      
      // Criar um registro no histórico
      await tx.attendanceHistory.create({
        data: {
          attendance: { connect: { id } },
          professional: { connect: { id: professionalId } },
          fromStage: attendance.stage,
          toStage: attendance.stage,   // Mesmo estágio, apenas mudando status
          status: AttendanceStatus.FINISHED,
          officeNumber: office,
          note: `Atendimento finalizado no estágio ${attendance.stage}`
        }
      });
      
      return updatedAttendance;
    });
  }

  async forwardAttendance(id: number, targetStage: AttendanceStage, professionalId: number): Promise<Attendance> {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: { patient: true }
    });

    if (!attendance || attendance.officeNumber === null) {
      throw new Error("Attendance missing officeNumber");
    }

    await this.finishAttendance(id, professionalId, attendance.officeNumber);

    const forwardAttendance = this.prisma.attendance.update({
      where: { id },
      data: {
        stage: targetStage,
        status: AttendanceStatus.PENDING, // Volta para pendente na nova etapa
      },
      include: { patient: true },
    });

    return forwardAttendance
  }
  
  async getAttendanceReport(professionalId: number, start: Date, end: Date): Promise<AttendanceHistory[]> {
    return this.prisma.attendanceHistory.findMany({
      where: {
        professionalId,
        timestamp: { gte: start, lte: end },
        status: AttendanceStatus.FINISHED,
      },
      include: { attendance: { include: { patient: true } } },
    });
  }
}