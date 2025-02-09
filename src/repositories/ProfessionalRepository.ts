import { injectable } from "inversify";
import { PrismaClient, Professional } from "@prisma/client";

@injectable()
export class ProfessionalRepository {
  private prisma: PrismaClient;
  
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
  
  async getProfessionals(): Promise<Professional[]> {
    return this.prisma.professional.findMany();
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
}
