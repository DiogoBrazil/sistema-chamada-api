import { injectable, inject } from "inversify";
import { CidRepository } from "../../repositories/CidRepository";
import { TYPES } from "../../types";
import { Cid } from "@prisma/client";
import { ICreateCidDTO } from "../../interfaces/cid/ICreateCidDTO";

@injectable()
export class CreateCidUseCase {
  private cidRepository: CidRepository;
  
  constructor(
    @inject(TYPES.CidRepository) cidRepository: CidRepository
  ) {
    this.cidRepository = cidRepository;
  }
  
  async execute(data: ICreateCidDTO): Promise<Cid> {
    // Verificar se já existe um CID com o mesmo código
    const existingCid = await this.cidRepository.getCidByCode(data.code);
    if (existingCid) {
      throw new Error("CID code already exists");
    }
    
    return this.cidRepository.createCid(data);
  }
}