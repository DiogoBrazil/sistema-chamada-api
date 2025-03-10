import { injectable, inject } from "inversify";
import { CityRepository } from "../../repositories/CityRepository";
import { TYPES } from "../../types";
import { City } from "@prisma/client";

@injectable()
export class GetCityByIdUseCase {
  private cityRepository: CityRepository;
  
  constructor(
    @inject(TYPES.CityRepository) cityRepository: CityRepository
  ) {
    this.cityRepository = cityRepository;
  }
  
  async execute(id: number): Promise<City | null> {
    // Validar o ID
    if (isNaN(id) || id <= 0) {
      throw new Error("ID de cidade inválido");
    }
    
    // Buscar a cidade
    const city = await this.cityRepository.getCityById(id);
    return city;
  }
}