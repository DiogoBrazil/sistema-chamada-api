import { injectable, inject } from "inversify";
import { CityRepository } from "../../repositories/CityRepository";
import { TYPES } from "../../types";
import { City } from "@prisma/client";

interface UpdateCityDTO {
  name?: string;
  state?: string;
}

@injectable()
export class UpdateCityUseCase {
  private cityRepository: CityRepository;
  
  constructor(
    @inject(TYPES.CityRepository) cityRepository: CityRepository
  ) {
    this.cityRepository = cityRepository;
  }
  
  async execute(id: number, data: UpdateCityDTO): Promise<City> {
    // Validar o ID
    if (isNaN(id) || id <= 0) {
      throw new Error("Invalid city ID");
    }
    
    // Verificar se a cidade existe
    const city = await this.cityRepository.getCityById(id);
    if (!city) {
      throw new Error("City not found");
    }
    
    // Validar os dados atualizados
    if (data.name && data.name.trim().length < 2) {
      throw new Error("City name must be at least 2 characters long");
    }
    
    if (data.state && data.state.trim().length !== 2) {
      throw new Error("The state must be entered in 2-letter format (UF)");
    }
    
    // Se estiver atualizando o nome e estado, verificar duplicidade
    if (data.name && data.state) {
      const existingCity = await this.cityRepository.getCityByName(
        data.name, 
        data.state
      );
      
      if (existingCity && existingCity.id !== id) {
        throw new Error("A city with this name and state already exists");
      }
    } 
    // Se estiver atualizando apenas o nome
    else if (data.name) {
      const existingCity = await this.cityRepository.getCityByName(
        data.name, 
        city.state
      );
      
      if (existingCity && existingCity.id !== id) {
        throw new Error("A city with this name and state already exists");
      }
    }
    // Se estiver atualizando apenas o estado
    else if (data.state) {
      const existingCity = await this.cityRepository.getCityByName(
        city.name, 
        data.state
      );
      
      if (existingCity && existingCity.id !== id) {
        throw new Error("A city with this name and state already exists");
      }
    }
    
    // Preparar os dados para atualização
    const updateData: UpdateCityDTO = {};
    
    if (data.name) {
      updateData.name = data.name.trim();
    }
    
    if (data.state) {
      updateData.state = data.state.trim().toUpperCase();
    }
    
    // Atualizar a cidade
    return this.cityRepository.updateCity(id, updateData);
  }
}