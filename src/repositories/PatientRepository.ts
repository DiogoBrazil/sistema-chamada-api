import { injectable } from "inversify";
import { PrismaClient, Patient } from "@prisma/client";

@injectable()
export class PatientRepository {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async createPatient(data: {
    fullName: string;
    cpf: string;
    birthDate: string;
  }): Promise<Patient> {
    return this.prisma.patient.create({ data });
  }
  
  async getPatients(): Promise<Patient[]> {
    return this.prisma.patient.findMany();
  }
  
  async getPatientById(id: number): Promise<Patient | null> {
    return this.prisma.patient.findUnique({
      where: { id },
      include: { attendances: true },
    });
  }
}
