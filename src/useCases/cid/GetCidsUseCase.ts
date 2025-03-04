import { injectable, inject } from "inversify";
import { CidRepository } from "../../repositories/CidRepository";
import { TYPES } from "../../types";
import { Cid } from "@prisma/client";
import { IPaginatedResult } from "../../interfaces/patient/IPaginatedResult";

@injectable()
export class GetCidsUseCase {
  private cidRepository: CidRepository;
  
  constructor(
    @inject(TYPES.CidRepository) cidRepository: CidRepository
  ) {
    this.cidRepository = cidRepository;
  }
  
  async execute(page: number): Promise<IPaginatedResult<Cid>> {
    const pageNumber = Math.max(1, page);
    return this.cidRepository.getCids(pageNumber);
  }
}