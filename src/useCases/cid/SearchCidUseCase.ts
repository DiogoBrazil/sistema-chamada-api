import { injectable, inject } from "inversify";
import { CidRepository } from "../../repositories/CidRepository";
import { TYPES } from "../../types";
import { Cid } from "@prisma/client";

@injectable()
export class SearchCidUseCase {
  private cidRepository: CidRepository;
  
  constructor(
    @inject(TYPES.CidRepository) cidRepository: CidRepository
  ) {
    this.cidRepository = cidRepository;
  }
  
  async execute(searchTerm: string): Promise<Cid[]> {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error("Search term must be at least 2 characters long");
    }
    
    return this.cidRepository.searchCidByCodeOrDescription(searchTerm.trim());
  }
}