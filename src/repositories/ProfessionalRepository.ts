import { injectable } from "inversify";
import { PrismaClient, Professional, AttendanceStatus } from "@prisma/client";
import { IPaginatedProfessionalResult } from "../interfaces/professional/IPaginatedProfessionalResult";

@injectable()
export class ProfessionalRepository {
  private prisma: PrismaClient;
  private readonly itemsPerPage = 5;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async createProfessional(data: {
    fullName: string;
    cpf: string;
    profile: string;
    password: string;
  }): Promise<Professional> {
    return this.prisma.professional.create({ data });
  }

  // Método para buscar todos os profissionais sem paginação
  async getAllProfessionals(): Promise<Professional[]> {
    return this.prisma.professional.findMany({
      orderBy: {
        fullName: 'asc'
      }
    });
  }
  
  async getProfessionals(page: number): Promise<IPaginatedProfessionalResult> {
    const skip = (page - 1) * this.itemsPerPage;
    
    // Busca dados paginados e total de registros em paralelo
    const [professionals, totalItems] = await Promise.all([
      this.prisma.professional.findMany({
        skip,
        take: this.itemsPerPage,
        orderBy: {
          fullName: 'asc'
        }
      }),
      this.prisma.professional.count()
    ]);

    const totalPages = Math.ceil(totalItems / this.itemsPerPage);

    // Remove password field from professionals
    const sanitizedProfessionals = professionals.map(({ password, ...rest }) => rest);

    return {
      data: sanitizedProfessionals,
      totalPages,
      currentPage: page,
      totalItems
    };
  }

  async getProfessionalsByName(name: string): Promise<Omit<Professional, "password">[]> {
    const professionals = await this.prisma.professional.findMany({
      where: {
        fullName: {
          contains: name,
          mode: 'insensitive'
        }
      }
    });

    return professionals.map(({ password, ...rest }) => rest);
  }
  
  async getProfessionalById(id: number): Promise<Professional | null> {
    return this.prisma.professional.findUnique({ where: { id } });
  }
  
  async updateOffice(professionalId: number, office: number): Promise<Professional> {
    return this.prisma.professional.update({
      where: { id: professionalId },
      data: { currentOffice: office },
    });
  }
  
  async getProfessionalByCpf(cpf: string): Promise<Professional | null> {
    return this.prisma.professional.findUnique({ where: { cpf } });
  }

  async deleteProfessional(id: number): Promise<void> {
    await this.prisma.professional.delete({
      where: { id }
    });
  }

  async updateProfessional(id: number, data: {
    fullName?: string;
    cpf?: string;
    profile?: string;
    password?: string;
    currentOffice?: number | null;
  }): Promise<Professional> {
    return this.prisma.professional.update({
      where: { id },
      data
    });
  }

  async hasActiveAttendances(id: number): Promise<boolean> {
    const attendance = await this.prisma.attendance.findFirst({
      where: {
        professionalId: id,
        status: {
          in: [AttendanceStatus.PENDING, AttendanceStatus.IN_PROGRESS]
        }
      }
    });
    return !!attendance;
  }
}
