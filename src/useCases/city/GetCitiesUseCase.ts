import { injectable, inject } from "inversify";
import { CityRepository } from "../../repositories/CityRepository";
import { TYPES } from "../../types";
import { City } from "@prisma/client";
import { IPaginatedResult } from "../../interfaces/city/IPaginateResultDTO";

@injectable()
export class GetCitiesUseCase {
  private cityRepository: CityRepository;
  
  constructor(
    @inject(TYPES.CityRepository) cityRepository: CityRepository
  ) {
    this.cityRepository = cityRepository;
  }
  
  async execute(page: number): Promise<IPaginatedResult<City>> {
    // Validar a página
    if (isNaN(page) || page < 1) {
      page = 1; // Valor padrão em caso de entrada inválida
    }
    
    // Buscar as cidades paginadas
    return this.cityRepository.getCities(page);
  }
}