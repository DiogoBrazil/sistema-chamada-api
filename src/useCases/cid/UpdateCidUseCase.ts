import { injectable, inject } from "inversify";
import { CidRepository } from "../../repositories/CidRepository";
import { TYPES } from "../../types";
import { Cid } from "@prisma/client";

interface UpdateCidDTO {
  code?: string;
  description?: string;
}

@injectable()
export class UpdateCidUseCase {
  private cidRepository: CidRepository;
  
  constructor(
    @inject(TYPES.CidRepository) cidRepository: CidRepository
  ) {
    this.cidRepository = cidRepository;
  }
  
  async execute(id: number, data: UpdateCidDTO): Promise<Cid> {
    // Verificar se o CID existe
    const cid = await this.cidRepository.getCidById(id);
    if (!cid) {
      throw new Error("CID not found");
    }

    // Se o código for atualizado, verificar se já existe outro CID com o mesmo código
    if (data.code && data.code !== cid.code) {
      const existingCid = await this.cidRepository.getCidByCode(data.code);
      if (existingCid && existingCid.id !== id) {
        throw new Error("CID code already exists");
      }
    }

    return this.cidRepository.updateCid(id, data);
  }
}