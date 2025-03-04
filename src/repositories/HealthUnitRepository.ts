import { injectable } from "inversify";
import { PrismaClient, HealthUnit, HealthUnitFlowAudit, FlowAction, AttendanceStage, Professional } from "@prisma/client";
import { IPaginatedResult } from "../interfaces/patient/IPaginatedResult";


@injectable()
export class HealthUnitRepository {
  private prisma: PrismaClient;
  private readonly itemsPerPage = 5;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async createHealthUnit(data: {
    name: string;
    cnpj: string;
    phone?: string;
  }): Promise<HealthUnit> {
    return this.prisma.healthUnit.create({ data });
  }
  
  async getHealthUnits(page: number): Promise<IPaginatedResult<HealthUnit>> {
    const skip = (page - 1) * this.itemsPerPage;
    
    // Busca dados paginados e total de registros em paralelo
    const [healthUnits, totalItems] = await Promise.all([
      this.prisma.healthUnit.findMany({
        skip,
        take: this.itemsPerPage,
        orderBy: {
          name: 'asc'
        },
        include: {
          addresses: {
            where: { isMain: true },
            take: 1
          }
        }
      }),
      this.prisma.healthUnit.count()
    ]);

    const totalPages = Math.ceil(totalItems / this.itemsPerPage);

    return {
      data: healthUnits,
      totalPages,
      currentPage: page,
      totalItems
    };
  }
  
  async getHealthUnitById(id: number): Promise<HealthUnit & { professionals: Professional[] } | null> {
    return this.prisma.healthUnit.findUnique({
      where: { id },
      include: { 
        addresses: true,
        professionals: true
      },
    });
  }

  async getHealthUnitByCnpj(cnpj: string): Promise<HealthUnit | null> {
    return this.prisma.healthUnit.findUnique({
      where: { cnpj },
      include: {
        addresses: {
          where: { isMain: true },
          take: 1
        }
      }
    });
  }

  async deleteHealthUnit(id: number): Promise<HealthUnit | null> {
    // Verificar se a unidade tem profissionais associados
    const healthUnit = await this.prisma.healthUnit.findUnique({
      where: { id },
      include: { professionals: true }
    });
    
    if (healthUnit && healthUnit.professionals.length > 0) {
      throw new Error("Cannot delete a health unit with associated professionals");
    }

    return this.prisma.healthUnit.delete({
      where: { id }
    });
  }

  async updateHealthUnit(id: number, data: {
    name?: string;
    cnpj?: string;
    phone?: string;
  }): Promise<HealthUnit> {
    return this.prisma.healthUnit.update({
      where: { id },
      data,
      include: {
        addresses: {
          where: { isMain: true },
          take: 1
        }
      }
    });
  }

  async addProfessionalToHealthUnit(healthUnitId: number, professionalId: number): Promise<HealthUnit & { professionals: Professional[] }> {
    return this.prisma.healthUnit.update({
      where: { id: healthUnitId },
      data: {
        professionals: {
          connect: { id: professionalId }
        }
      },
      include: { professionals: true }
    });
  }

  async removeProfessionalFromHealthUnit(healthUnitId: number, professionalId: number): Promise<HealthUnit & { professionals: Professional[] }> {
    return this.prisma.healthUnit.update({
      where: { id: healthUnitId },
      data: {
        professionals: {
          disconnect: { id: professionalId }
        }
      },
      include: { professionals: true }
    });
  }

  async createFlowAudit(data: {
    healthUnitId: number;
    flowAction: FlowAction;
    ofTheAttendanceStage?: AttendanceStage;
    toTheAttendanceStage?: AttendanceStage;
    professionalId?: number;
    patientId?: number;
  }): Promise<HealthUnitFlowAudit> {
    return this.prisma.healthUnitFlowAudit.create({ data });
  }

  async getFlowAuditByHealthUnit(healthUnitId: number, page: number): Promise<IPaginatedResult<HealthUnitFlowAudit>> {
    const skip = (page - 1) * this.itemsPerPage;
    
    const [flowAudits, totalItems] = await Promise.all([
      this.prisma.healthUnitFlowAudit.findMany({
        where: { healthUnitId },
        skip,
        take: this.itemsPerPage,
        orderBy: { createdAt: 'desc' },
        include: {
          professional: true,
          patient: true
        }
      }),
      this.prisma.healthUnitFlowAudit.count({ where: { healthUnitId } })
    ]);

    const totalPages = Math.ceil(totalItems / this.itemsPerPage);

    return {
      data: flowAudits,
      totalPages,
      currentPage: page,
      totalItems
    };
  }
}