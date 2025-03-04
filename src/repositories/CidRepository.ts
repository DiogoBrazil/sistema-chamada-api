import { injectable } from "inversify";
import { PrismaClient, Cid } from "@prisma/client";
import { IPaginatedResult } from "../interfaces/patient/IPaginatedResult";

@injectable()
export class CidRepository {
  private prisma: PrismaClient;
  private readonly itemsPerPage = 10;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async createCid(data: {
    code: string;
    description: string;
  }): Promise<Cid> {
    return this.prisma.cid.create({ data });
  }
  
  async getCids(page: number): Promise<IPaginatedResult<Cid>> {
    const skip = (page - 1) * this.itemsPerPage;
    
    const [cids, totalItems] = await Promise.all([
      this.prisma.cid.findMany({
        skip,
        take: this.itemsPerPage,
        orderBy: {
          code: 'asc'
        }
      }),
      this.prisma.cid.count()
    ]);

    const totalPages = Math.ceil(totalItems / this.itemsPerPage);

    return {
      data: cids,
      totalPages,
      currentPage: page,
      totalItems
    };
  }
  
  async getCidById(id: number): Promise<Cid | null> {
    return this.prisma.cid.findUnique({
      where: { id }
    });
  }
  
  async getCidByCode(code: string): Promise<Cid | null> {
    return this.prisma.cid.findUnique({
      where: { code }
    });
  }

  async searchCidByCodeOrDescription(searchTerm: string): Promise<Cid[]> {
    return this.prisma.cid.findMany({
      where: {
        OR: [
          { code: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      take: 20,
      orderBy: {
        code: 'asc'
      }
    });
  }
  
  async updateCid(id: number, data: {
    code?: string;
    description?: string;
  }): Promise<Cid> {
    return this.prisma.cid.update({
      where: { id },
      data
    });
  }
  
  async deleteCid(id: number): Promise<void> {
    // Verificar se o CID está sendo usado em algum atendimento
    const usedInAttendance = await this.prisma.attendanceHistory.findFirst({
      where: { cidid: id }
    });
    
    if (usedInAttendance) {
      throw new Error("Cannot delete a CID that is being used in attendances");
    }
    
    await this.prisma.cid.delete({
      where: { id }
    });
  }
}