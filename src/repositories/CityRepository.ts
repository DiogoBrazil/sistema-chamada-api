import { injectable } from "inversify";
import { PrismaClient, City } from "@prisma/client";
import { IPaginatedResult } from "../interfaces/city/IPaginateResultDTO";
import { ICityWithRelations } from "../interfaces/city/ICity";


@injectable()
export class CityRepository {
  private prisma: PrismaClient;
  private readonly itemsPerPage = 10;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async createCity(data: {
    name: string;
    state: string;
  }): Promise<City> {
    return this.prisma.city.create({ data });
  }
  
  async getCities(page: number): Promise<IPaginatedResult<City>> {
    const skip = (page - 1) * this.itemsPerPage;
    
    const [cities, totalItems] = await Promise.all([
      this.prisma.city.findMany({
        skip,
        take: this.itemsPerPage,
        orderBy: [
          { state: 'asc' },
          { name: 'asc' }
        ],
        include: {
          healthUnits: true,
          professionals: {
            where: {
              profile: 'GENERAL_LOCAL_ADMINISTRATOR'
            }
          }
        }
      }),
      this.prisma.city.count()
    ]);

    const totalPages = Math.ceil(totalItems / this.itemsPerPage);

    return {
      data: cities,
      totalPages,
      currentPage: page,
      totalItems
    };
  }
  
  async getCityById(id: number): Promise<ICityWithRelations | null> {
    return this.prisma.city.findUnique({
      where: { id },
      include: {
        healthUnits: true,
        professionals: {
          where: {
            profile: 'GENERAL_LOCAL_ADMINISTRATOR'
          }
        }
      }
    });
  }
  
  async updateCity(id: number, data: {
    name?: string;
    state?: string;
  }): Promise<City> {
    return this.prisma.city.update({
      where: { id },
      data,
      include: {
        healthUnits: true,
        professionals: {
          where: {
            profile: 'GENERAL_LOCAL_ADMINISTRATOR'
          }
        }
      }
    });
  }
  
  async deleteCity(id: number): Promise<void> {
    // Verificar se a cidade tem unidades associadas
    const city = await this.prisma.city.findUnique({
      where: { id },
      include: { 
        healthUnits: true,
        professionals: true
      }
    });
    
    if (city && (city.healthUnits.length > 0 || city.professionals.length > 0)) {
      throw new Error("Não é possível excluir uma cidade que possui unidades de saúde ou profissionais associados");
    }
    
    await this.prisma.city.delete({
      where: { id }
    });
  }
  
  async getCityByName(name: string, state: string): Promise<City | null> {
    return this.prisma.city.findFirst({
      where: {
        name: {
          contains: name,
          mode: 'insensitive'
        },
        state: {
          contains: state,
          mode: 'insensitive'
        }
      }
    });
  }
  
  async searchCities(term: string): Promise<City[]> {
    return this.prisma.city.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { state: { contains: term, mode: 'insensitive' } }
        ]
      },
      take: 15,
      orderBy: [
        { state: 'asc' },
        { name: 'asc' }
      ]
    });
  }
  
  async getHealthUnitsByCity(cityId: number): Promise<{ id: number, name: string }[]> {
    const city = await this.prisma.city.findUnique({
      where: { id: cityId },
      include: {
        healthUnits: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    return city ? city.healthUnits : [];
  }
  
  async getProfessionalCountByCity(cityId: number): Promise<number> {
    return this.prisma.professional.count({
      where: {
        OR: [
          { cityId },
          {
            healthUnit: {
              some: {
                cityId
              }
            }
          }
        ]
      }
    });
  }
  
  async getAttendanceCountByCity(cityId: number): Promise<number> {
    return this.prisma.attendance.count({
      where: {
        healthUnit: {
          cityId
        }
      }
    });
  }
}