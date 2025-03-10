import { injectable, inject } from "inversify";
import { CityRepository } from "../../repositories/CityRepository";
import { TYPES } from "../../types";
import { City } from "@prisma/client";

@injectable()
export class SearchCitiesUseCase {
  private cityRepository: CityRepository;
  
  constructor(
    @inject(TYPES.CityRepository) cityRepository: CityRepository
  ) {
    this.cityRepository = cityRepository;
  }
  
  async execute(term: string): Promise<City[]> {
    // Validar o termo de busca
    if (!term || term.trim().length < 2) {
      throw new Error("O termo de busca deve ter pelo menos 2 caracteres");
    }
    
    // Buscar cidades que correspondam ao termo (nome ou estado)
    return this.cityRepository.searchCities(term.trim());
  }
}