import { injectable, inject } from "inversify";
import { CidRepository } from "../../repositories/CidRepository";
import { TYPES } from "../../types";

@injectable()
export class DeleteCidUseCase {
  private cidRepository: CidRepository;
  
  constructor(
    @inject(TYPES.CidRepository) cidRepository: CidRepository
  ) {
    this.cidRepository = cidRepository;
  }
  
  async execute(id: number): Promise<void> {
    // Verificar se o CID existe
    const cid = await this.cidRepository.getCidById(id);
    if (!cid) {
      throw new Error("CID not found");
    }

    await this.cidRepository.deleteCid(id);
  }
}