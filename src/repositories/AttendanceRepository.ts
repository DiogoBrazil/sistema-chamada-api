import { injectable } from "inversify";
import { PrismaClient, Attendance, AttendanceStatus, AttendanceStage, AttendanceHistory } from "@prisma/client";

@injectable()
export class AttendanceRepository {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async createAttendance(patientId: number, attendanceStage: string, healthUnitId: number): Promise<Attendance> {
    return this.prisma.attendance.create({
      data: {
        patient: { connect: { id: patientId } },
        healthUnit: { connect: { id: healthUnitId } },
        status: AttendanceStatus.PENDING,
        stage: attendanceStage as AttendanceStage,
      },
      include: { 
        patient: true,
        healthUnit: true 
      },
    });
  }
  
  async getAttendances(filters: {
    stage?: AttendanceStage, 
    healthUnitId?: number,
    cityId?: number,
    status?: AttendanceStatus[]
  } = {}): Promise<Attendance[]> {
    // Filtros base
    const filter: any = {
      status: filters.status || { in: [AttendanceStatus.PENDING, AttendanceStatus.IN_PROGRESS] },
    };
    
    // Adicionar filtro de estágio se fornecido
    if (filters.stage) {
      filter.stage = filters.stage;
    }
    
    // Adicionar filtro de unidade de saúde se fornecido
    if (filters.healthUnitId) {
      filter.healthUnitId = filters.healthUnitId;
    }
    
    // Adicionar filtro de cidade se fornecido
    if (filters.cityId) {
      filter.healthUnit = {
        cityId: filters.cityId
      };
    }
    
    return this.prisma.attendance.findMany({
      where: filter,
      include: { 
        patient: true,
        healthUnit: true 
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }
  
  async callPatient(id: number, officeNumber: number): Promise<Attendance> {
    return this.prisma.attendance.update({
      where: { id },
      data: { 
        status: AttendanceStatus.IN_PROGRESS,
        officeNumber,
      },
      include: { 
        patient: true,
        healthUnit: true 
      },
    });
  }

  async getAttendanceById(id: number): Promise<Attendance | null> {
    return this.prisma.attendance.findUnique({
      where: { id },
      include: { 
        patient: true,
        healthUnit: true 
      }
    });
  }
  
  async finishAttendance(attendanceData: {
    id: number,
    professionalId: number, 
    office: number, 
    cidId?: number, 
    note?: string
  }): Promise<Attendance> {
    const { id, professionalId, office, cidId, note } = attendanceData;
    
    // Buscar o atendimento para obter dados de referência
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: { 
        patient: true,
        healthUnit: true 
      }
    });
    
    if (!attendance) {
      throw new Error("Atendimento não encontrado");
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
        include: { 
          patient: true,
          healthUnit: true 
        },
      });
      
      // Preparar os dados para o histórico
      const historyData: any = {
        attendance: { connect: { id } },
        professional: { connect: { id: professionalId } },
        fromStage: attendance.stage,
        toStage: attendance.stage,   // Mesmo estágio, apenas mudando status
        status: AttendanceStatus.FINISHED,
        officeNumber: office,
        note: note || `Atendimento finalizado no estágio ${attendance.stage}`
      };
      
      // Adicionar o CID ao histórico, se fornecido
      if (cidId) {
        historyData.cid = { connect: { id: cidId } };
      }
      
      // Criar um registro no histórico
      await tx.attendanceHistory.create({
        data: historyData
      });
      
      // Registrar fluxo no histórico da unidade de saúde
      await tx.healthUnitFlowAudit.create({
        data: {
          healthUnit: { connect: { id: attendance.healthUnitId } },
          professional: { connect: { id: professionalId } },
          patient: { connect: { id: attendance.patientId } },
          flowAction: 'ATTENDANCE_FINALIZED',
          ofTheAttendanceStage: attendance.stage,
        }
      });
      
      return updatedAttendance;
    });
  }

  async forwardAttendance(id: number, targetStage: AttendanceStage, professionalId: number): Promise<Attendance> {
    // Buscar o atendimento atual para referência
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: { 
        patient: true,
        healthUnit: true 
      }
    });

    if (!attendance) {
      throw new Error("Atendimento não encontrado");
    }

    // Atualizar para o novo estágio
    const updatedAttendance = await this.prisma.attendance.update({
      where: { id },
      data: {
        stage: targetStage,
        status: AttendanceStatus.PENDING, // Volta para pendente na nova etapa
      },
      include: { 
        patient: true,
        healthUnit: true 
      },
    });

    // Registrar o encaminhamento no histórico da unidade
    await this.prisma.healthUnitFlowAudit.create({
      data: {
        healthUnit: { connect: { id: attendance.healthUnitId } },
        professional: { connect: { id: professionalId } },
        patient: { connect: { id: attendance.patientId } },
        flowAction: 'PATIENT_REFERRED',
        ofTheAttendanceStage: attendance.stage,
        toTheAttendanceStage: targetStage,
      }
    });

    return updatedAttendance;
  }
  
  async getAttendanceHistory(filters: {
    professionalId?: number,
    startDate: Date,
    endDate: Date,
    healthUnitId?: number,
    cityId?: number
  }): Promise<AttendanceHistory[]> {
    const { professionalId, startDate, endDate, healthUnitId, cityId } = filters;
    
    // Construir o filtro base
    const filter: any = {
      finishedAt: { gte: startDate, lte: endDate },
      status: AttendanceStatus.FINISHED,
    };
    
    // Adicionar filtro de profissional se fornecido
    if (professionalId) {
      filter.professionalId = professionalId;
    }
    
    // Relação a ser incluída
    const include: any = { 
      attendance: { 
        include: { 
          patient: true,
          healthUnit: true
        } 
      },
      professional: true,
      cid: true
    };
    
    // Se uma unidade específica for fornecida
    if (healthUnitId) {
      filter.attendance = {
        healthUnitId: healthUnitId
      };
    } 
    // Se uma cidade específica for fornecida
    else if (cityId) {
      filter.attendance = {
        healthUnit: {
          cityId: cityId
        }
      };
    }
    
    return this.prisma.attendanceHistory.findMany({
      where: filter,
      include: include,
      orderBy: {
        finishedAt: 'desc'
      }
    });
  }
  
  async countAttendancesByHealthUnit(healthUnitId: number): Promise<number> {
    return this.prisma.attendance.count({
      where: {
        healthUnitId
      }
    });
  }
  
  async countActiveAttendancesByHealthUnit(healthUnitId: number): Promise<number> {
    return this.prisma.attendance.count({
      where: {
        healthUnitId,
        status: {
          in: [AttendanceStatus.PENDING, AttendanceStatus.IN_PROGRESS]
        }
      }
    });
  }
}