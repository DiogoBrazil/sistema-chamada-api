import { injectable } from "inversify";
import { PrismaClient, Patient, AttendanceStatus } from "@prisma/client";

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

  async deletePatientById(id: number): Promise<Patient | null> {
    // Check for pending or in progress attendances
    const activeAttendance = await this.prisma.attendance.findFirst({
      where: { 
        patientId: id,
        status: {
          in: [AttendanceStatus.PENDING, AttendanceStatus.IN_PROGRESS]
        }
      }
    });

    if (activeAttendance) {
      throw new Error("Cannot delete a patient with pending or in progress attendances");
    }

    // Check for attendance history
    const hasAttendances = await this.prisma.attendance.findFirst({
      where: { patientId: id }
    });

    if (hasAttendances) {
      throw new Error("Cannot delete a patient with attendance history");
    }

    return this.prisma.patient.delete({
      where: { id }
    });
  }

  async updatePatient(id: number, data: {
    fullName?: string;
    cpf?: string;
    birthDate?: string;
  }): Promise<Patient> {
    return this.prisma.patient.update({
      where: { id },
      data
    });
  }

  async getPatientByCpf(cpf: string): Promise<Patient | null> {
    return this.prisma.patient.findUnique({
      where: { cpf }
    });
  }
}
