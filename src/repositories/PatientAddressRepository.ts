import { injectable } from "inversify";
import { PrismaClient, PatientAddress } from "@prisma/client";
import { IAddressDTO } from "../interfaces/address/IAddressDTO";

@injectable()
export class PatientAddressRepository {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async createAddress(patientId: number, addressData: IAddressDTO): Promise<PatientAddress> {
    // Se for marcado como principal, garantir que os outros não são
    if (addressData.isMain) {
      await this.prisma.patientAddress.updateMany({
        where: { patientId },
        data: { isMain: false }
      });
    }
    
    return this.prisma.patientAddress.create({
      data: {
        patient: { connect: { id: patientId } },
        street: addressData.street,
        number: addressData.number,
        complement: addressData.complement,
        neighborhood: addressData.neighborhood,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode,
        isMain: addressData.isMain !== undefined ? addressData.isMain : true,
      }
    });
  }
  
  async getAddressesByPatientId(patientId: number): Promise<PatientAddress[]> {
    return this.prisma.patientAddress.findMany({
      where: { patientId },
      orderBy: [
        { isMain: 'desc' },
        { id: 'asc' }
      ]
    });
  }
  
  async getMainAddressByPatientId(patientId: number): Promise<PatientAddress | null> {
    return this.prisma.patientAddress.findFirst({
      where: { 
        patientId,
        isMain: true
      }
    });
  }
  
  async updateAddress(id: number, addressData: Partial<IAddressDTO>): Promise<PatientAddress> {
    const address = await this.prisma.patientAddress.findUnique({ where: { id } });
    
    if (!address) {
      throw new Error("Address not found");
    }
    
    // Se for marcado como principal, garantir que os outros não são
    if (addressData.isMain) {
      await this.prisma.patientAddress.updateMany({
        where: { 
          patientId: address.patientId,
          id: { not: id }
        },
        data: { isMain: false }
      });
    }
    
    return this.prisma.patientAddress.update({
      where: { id },
      data: addressData
    });
  }
  
  async deleteAddress(id: number): Promise<void> {
    const address = await this.prisma.patientAddress.findUnique({ 
      where: { id },
      include: { patient: true }
    });
    
    if (!address) {
      throw new Error("Address not found");
    }
    
    // Verificar se é o único endereço do paciente
    const addressCount = await this.prisma.patientAddress.count({
      where: { patientId: address.patientId }
    });
    
    // Se for o único endereço e for principal, não permitir exclusão
    if (addressCount === 1 && address.isMain) {
      throw new Error("Cannot delete the only main address of a patient");
    }
    
    // Se for o endereço principal e existirem outros, definir outro como principal
    if (address.isMain && addressCount > 1) {
      const anotherAddress = await this.prisma.patientAddress.findFirst({
        where: { 
          patientId: address.patientId,
          id: { not: id }
        }
      });
      
      if (anotherAddress) {
        await this.prisma.patientAddress.update({
          where: { id: anotherAddress.id },
          data: { isMain: true }
        });
      }
    }
    
    await this.prisma.patientAddress.delete({ where: { id } });
  }
}