import { injectable } from "inversify";
import { PrismaClient, Patient, AttendanceStatus } from "@prisma/client";
import { IPaginatedResult } from "../interfaces/patient/IPaginatedResult";
import { ICreatePatientDTO } from "../interfaces/patient/ICreatePatientDTO";
import { IAddressDTO } from "../interfaces/address/IAddressDTO";

@injectable()
export class PatientRepository {
  private prisma: PrismaClient;
  private readonly itemsPerPage = 5;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async createPatient(address: any, patientData: ICreatePatientDTO): Promise<Patient> {
    return this.prisma.$transaction(async (tx) => {
      const patient = await tx.patient.create({ data: patientData });
      if (address) {
        await tx.patientAddress.create({ data: { ...address, patientId: patient.id } });
      }
      return patient;
    });
  }
  
  async getPatients(page: number): Promise<IPaginatedResult<Patient>> {
    const skip = (page - 1) * this.itemsPerPage;
    
    // Busca dados paginados e total de registros em paralelo
    const [patients, totalItems] = await Promise.all([
      this.prisma.patient.findMany({
        skip,
        take: this.itemsPerPage,
        orderBy: {
          fullName: 'asc'
        },
        include: {
          addresses: {
            where: { isMain: true },
            take: 1
          }
        }
      }),
      this.prisma.patient.count()
    ]);

    const totalPages = Math.ceil(totalItems / this.itemsPerPage);

    return {
      data: patients,
      totalPages,
      currentPage: page,
      totalItems
    };
  }
  
  async getPatientById(id: number): Promise<Patient | null> {
    return this.prisma.patient.findUnique({
      where: { id },
      include: { 
        attendances: true,
        addresses: true
      },
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

  async getPatientsByName(name: string): Promise<Patient[]> {
    return this.prisma.patient.findMany({
      where: {
        fullName: {
          contains: name,
          mode: 'insensitive'
        }
      },
      include: {
        addresses: {
          where: { isMain: true },
          take: 1
        }
      }
    });
  }

  async updatePatient(id: number, data: {
    fullName?: string;
    socialName?: string;
    cpf?: string;
    birthDate?: string;
    phone?: string;
    sex?: string;
    race?: string;
  }): Promise<Patient> {
    return this.prisma.patient.update({
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

  async getPatientByCpf(cpf: string): Promise<Patient | null> {
    return this.prisma.patient.findUnique({
      where: { cpf },
      include: {
        addresses: {
          where: { isMain: true },
          take: 1
        }
      }
    });
  }
}