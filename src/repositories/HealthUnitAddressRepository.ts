import { injectable } from "inversify";
import { PrismaClient, HealthUnitAddress } from "@prisma/client";
import { IAddressDTO } from "../interfaces/address/IAddressDTO";

@injectable()
export class HealthUnitAddressRepository {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async createAddress(healthUnitId: number, addressData: IAddressDTO): Promise<HealthUnitAddress> {
    // Se for marcado como principal, garantir que os outros não são
    if (addressData.isMain) {
      await this.prisma.healthUnitAddress.updateMany({
        where: { healthUnitId },
        data: { isMain: false }
      });
    }
    
    return this.prisma.healthUnitAddress.create({
      data: {
        healthUnit: { connect: { id: healthUnitId } },
        street: addressData.street,
        number: addressData.number,
        complement: addressData.complement,
        neighborhood: addressData.neighborhood,
        zipCode: addressData.zipCode,
        isMain: addressData.isMain !== undefined ? addressData.isMain : true,
      }
    });
  }
  
  async getAddressesByHealthUnitId(healthUnitId: number): Promise<HealthUnitAddress[]> {
    return this.prisma.healthUnitAddress.findMany({
      where: { healthUnitId },
      orderBy: [
        { isMain: 'desc' },
        { id: 'asc' }
      ]
    });
  }
  
  async getMainAddressByHealthUnitId(healthUnitId: number): Promise<HealthUnitAddress | null> {
    return this.prisma.healthUnitAddress.findFirst({
      where: { 
        healthUnitId,
        isMain: true
      }
    });
  }
  
  async updateAddress(id: number, addressData: Partial<IAddressDTO>): Promise<HealthUnitAddress> {
    const address = await this.prisma.healthUnitAddress.findUnique({ where: { id } });
    
    if (!address) {
      throw new Error("Address not found");
    }
    
    // Se for marcado como principal, garantir que os outros não são
    if (addressData.isMain) {
      await this.prisma.healthUnitAddress.updateMany({
        where: { 
          healthUnitId: address.healthUnitId,
          id: { not: id }
        },
        data: { isMain: false }
      });
    }
    
    return this.prisma.healthUnitAddress.update({
      where: { id },
      data: addressData
    });
  }
  
  async deleteAddress(id: number): Promise<void> {
    const address = await this.prisma.healthUnitAddress.findUnique({ 
      where: { id }
    });
    
    if (!address) {
      throw new Error("Address not found");
    }
    
    // Verificar se é o único endereço da unidade
    const addressCount = await this.prisma.healthUnitAddress.count({
      where: { healthUnitId: address.healthUnitId }
    });
    
    // Se for o único endereço e for principal, não permitir exclusão
    if (addressCount === 1 && address.isMain) {
      throw new Error("Cannot delete the only main address of a health unit");
    }
    
    // Se for o endereço principal e existirem outros, definir outro como principal
    if (address.isMain && addressCount > 1) {
      const anotherAddress = await this.prisma.healthUnitAddress.findFirst({
        where: { 
          healthUnitId: address.healthUnitId,
          id: { not: id }
        }
      });
      
      if (anotherAddress) {
        await this.prisma.healthUnitAddress.update({
          where: { id: anotherAddress.id },
          data: { isMain: true }
        });
      }
    }
    
    await this.prisma.healthUnitAddress.delete({ where: { id } });
  }
}