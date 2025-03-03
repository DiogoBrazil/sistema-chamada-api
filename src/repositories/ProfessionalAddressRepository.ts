import { injectable } from "inversify";
import { PrismaClient, ProfessionalAddress } from "@prisma/client";
import { IAddressDTO } from "../interfaces/address/IAddressDTO";

@injectable()
export class ProfessionalAddressRepository {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async createAddress(professionalId: number, addressData: IAddressDTO): Promise<ProfessionalAddress> {
    // Se for marcado como principal, garantir que os outros não são
    if (addressData.isMain) {
      await this.prisma.professionalAddress.updateMany({
        where: { professionalId },
        data: { isMain: false }
      });
    }
    
    return this.prisma.professionalAddress.create({
      data: {
        professional: { connect: { id: professionalId } },
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
  
  async getAddressesByProfessionalId(professionalId: number): Promise<ProfessionalAddress[]> {
    return this.prisma.professionalAddress.findMany({
      where: { professionalId },
      orderBy: [
        { isMain: 'desc' },
        { id: 'asc' }
      ]
    });
  }
  
  async getMainAddressByProfessionalId(professionalId: number): Promise<ProfessionalAddress | null> {
    return this.prisma.professionalAddress.findFirst({
      where: { 
        professionalId,
        isMain: true
      }
    });
  }
  
  async updateAddress(id: number, addressData: Partial<IAddressDTO>): Promise<ProfessionalAddress> {
    const address = await this.prisma.professionalAddress.findUnique({ where: { id } });
    
    if (!address) {
      throw new Error("Address not found");
    }
    
    // Se for marcado como principal, garantir que os outros não são
    if (addressData.isMain) {
      await this.prisma.professionalAddress.updateMany({
        where: { 
          professionalId: address.professionalId,
          id: { not: id }
        },
        data: { isMain: false }
      });
    }
    
    return this.prisma.professionalAddress.update({
      where: { id },
      data: addressData
    });
  }
  
  async deleteAddress(id: number): Promise<void> {
    const address = await this.prisma.professionalAddress.findUnique({ 
      where: { id },
      include: { professional: true }
    });
    
    if (!address) {
      throw new Error("Address not found");
    }
    
    // Verifica se é o único endereço do profissional
    const addressCount = await this.prisma.professionalAddress.count({
      where: { professionalId: address.professionalId }
    });
    
    // Se for o único endereço e for principal, não permitir exclusão
    if (addressCount === 1 && address.isMain) {
      throw new Error("Cannot delete the only main address of a professional");
    }
    
    // Se for o endereço principal e existirem outros, definir outro como principal
    if (address.isMain && addressCount > 1) {
      const anotherAddress = await this.prisma.professionalAddress.findFirst({
        where: { 
          professionalId: address.professionalId,
          id: { not: id }
        }
      });
      
      if (anotherAddress) {
        await this.prisma.professionalAddress.update({
          where: { id: anotherAddress.id },
          data: { isMain: true }
        });
      }
    }
    
    await this.prisma.professionalAddress.delete({ where: { id } });
  }
}