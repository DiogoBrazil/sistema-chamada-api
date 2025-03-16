import { injectable } from "inversify";
import { PrismaClient, Professional, AttendanceStatus } from "@prisma/client";
import { IPaginatedProfessionalResult } from "../interfaces/professional/IPaginatedProfessionalResult";
import { ICreateProfessionalDTO } from "../interfaces/professional/ICreateProfessionalDTO";
import { IUpdateProfessionalDTO } from "../interfaces/professional/IUpdateProfessionalDTO";
import { ProfessionalWithRelations } from "../interfaces/professional/IProfessionalWithRelations";
import { IGetProfessionalsDTO } from "../interfaces/professional/IGetProfessionalsDTO";

@injectable()
export class ProfessionalRepository {
  private prisma: PrismaClient;
  private readonly itemsPerPage = 5;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  
  async createProfessional(address: any, professionalData: ICreateProfessionalDTO): Promise<Professional> {
      return this.prisma.$transaction(async (tx) => {
        const professional = await tx.professional.create({ data: professionalData });
        if (address) {
          await tx.professionalAddress.create({ data: { ...address, professionalId: professional.id } });
        }
        return professional;
      });
    }

  // Método para buscar todos os profissionais sem paginação
  async getAllProfessionals(): Promise<Professional[]> {
    return this.prisma.professional.findMany({
      orderBy: {
        fullName: 'asc'
      }
    });
  }
  
  async getProfessionals(data: IGetProfessionalsDTO, page: number): Promise<IPaginatedProfessionalResult> {
    const skip = (page - 1) * this.itemsPerPage;
    
    // Construir a condição de where com base nos filtros
    const whereCondition: any = {};
    
    if (data) {
      if (data.cityId) {
        whereCondition.cityId = data.cityId;
      }
      
      if (data.healthUnitId) {
        whereCondition.healthUnit = {
          some: {
            id: data.healthUnitId
          }
        };
      }
    }
    
    // Busca dados paginados e total de registros em paralelo
    const [professionals, totalItems] = await Promise.all([
      this.prisma.professional.findMany({
        where: whereCondition,
        skip,
        take: this.itemsPerPage,
        orderBy: {
          fullName: 'asc'
        },
        include: {
          addresses: {
            where: { isMain: true },
            take: 1
          },
          healthUnit: true
        }
      }),
      this.prisma.professional.count({
        where: whereCondition
      })
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

  async getProfessionalsByCityId(cityId: number, page: number): Promise<IPaginatedProfessionalResult> {
    const skip = (page - 1) * this.itemsPerPage;
    
    // Busca dados paginados e total de registros em paralelo
    const [professionals, totalItems] = await Promise.all([
      this.prisma.professional.findMany({
        where: {
          cityId
        },
        skip,
        take: this.itemsPerPage,
        orderBy: {
          fullName: 'asc'
        },
        include: {
          addresses: {
            where: { isMain: true },
            take: 1
          },
          healthUnit: true
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

  async getProfessionalsByHealthUnitId(healthUnitId: number, page: number): Promise<IPaginatedProfessionalResult> {
    const skip = (page - 1) * this.itemsPerPage;
    
    // Busca dados paginados e total de registros em paralelo
    const [professionals, totalItems] = await Promise.all([
      this.prisma.professional.findMany({
        where: {
          healthUnit: {
            some: {
              id: healthUnitId
            }
          }
        },
        skip,
        take: this.itemsPerPage,
        orderBy: {
          fullName: 'asc'
        },
        include: {
          addresses: {
            where: { isMain: true },
            take: 1
          },
          healthUnit: true
        }
      }),
      this.prisma.professional.count({
        where: {
          healthUnit: {
            some: {
              id: healthUnitId
            }
          }
        }
      })
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
        },
      },
      include: {
        addresses: {
          where: { isMain: true },
          take: 1
        }
      }
    });

    return professionals.map(({ password, ...rest }) => rest);
  }
  
  async getProfessionalById(id: number): Promise<ProfessionalWithRelations | null> {
    return this.prisma.professional.findUnique({ 
      where: { id },
      include: {
        addresses: true,
        healthUnit: true
      } 
    });
  }

  async isProfessionalLinkedToCity(professionalId: number, cityId: number): Promise<Professional[]> {
    return this.prisma.professional.findMany({
      where: {
        id: professionalId,
        cityId
      }
    });
  }

  async getProfessionalByEmail(email: string): Promise<Professional | null> {
    return this.prisma.professional.findFirst({ 
      where: { email },
      include: {
        addresses: {
          where: { isMain: true },
          take: 1
        }
      } 
    });
  }
  
  async updateOffice(professionalId: number, office: number): Promise<Professional> {
    return this.prisma.professional.update({
      where: { id: professionalId },
      data: { currentOffice: office },
    });
  }
  
  async updateAttendanceMode(professionalId: number, attendanceMode: string): Promise<Professional> {
    return this.prisma.professional.update({
      where: { id: professionalId },
      data: { attendanceMode },
    });
  }
  
  async getProfessionalByCpf(cpf: string): Promise<Professional | null> {
    return this.prisma.professional.findUnique({ 
      where: { cpf },
      include: {
        addresses: {
          where: { isMain: true },
          take: 1
        }
      } 
    });
  }

  async deleteProfessional(id: number): Promise<void> {
    await this.prisma.professional.delete({
      where: { id }
    });
  }

  async updateProfessional(id: number, data: IUpdateProfessionalDTO): Promise<Professional> {
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

  async getProfessionalWithHealthUnits(id: number): Promise<(Professional & { healthUnit: { id: number }[] }) | null> {
    return this.prisma.professional.findUnique({
      where: { id },
      include: { 
        healthUnit: true,
        addresses: true
      }
    });
  }
  
  async checkProfessionalInHealthUnit(professionalId: number, healthUnitId: number): Promise<boolean> {
    const professional = await this.prisma.professional.findUnique({
      where: { id: professionalId },
      include: { healthUnit: true }
    }) as (Professional & { healthUnit: { id: number }[] }) | null;
    
    if (!professional || !professional.healthUnit) {
      return false;
    }
    
    return professional.healthUnit.some(unit => unit.id === healthUnitId);
  }
  
  async getAdminHealthUnits(adminId: number): Promise<{ id: number }[]> {
    const professional = await this.prisma.professional.findUnique({
      where: { id: adminId },
      include: { 
        healthUnit: {
          select: { id: true }
        }
      }
    }) as (Professional & { healthUnit: { id: number }[] }) | null;
    
    return professional?.healthUnit || [];
  }

  async hasGeneralLocalAdministratorInCity(cityId: number, profile: string): Promise<Professional[]> {
    return this.prisma.professional.findMany({
      where: {
        cityId,  
        profile
      }
    });
  }

  async hasLocalAdministratorInHealthUnit(healthUnitId: number, profile: string): Promise<Professional[]> {
    return this.prisma.professional.findMany({
      where: {
        healthUnit: {
          some: {
            id: healthUnitId
          }
        },
        profile
      }
    });
  }
}