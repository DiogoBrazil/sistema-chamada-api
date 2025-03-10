import { injectable, inject } from "inversify";
import { CityRepository } from "../../repositories/CityRepository";
import { TYPES } from "../../types";
import { ICreateCityDTO } from "../../interfaces/city/ICreateCityDTO";
import { City } from "@prisma/client";



@injectable()
export class CreateCityUseCase {
  private cityRepository: CityRepository;
  
  constructor(
    @inject(TYPES.CityRepository) cityRepository: CityRepository
  ) {
    this.cityRepository = cityRepository;
  }
  
  async execute(data: ICreateCityDTO): Promise<City> {
    const { name, state } = data;
    
    // Validações básicas
    if (!name || !state) {
      throw new Error("Nome e estado são obrigatórios");
    }
    
    if (name.trim().length < 2) {
      throw new Error("O nome da cidade deve ter pelo menos 2 caracteres");
    }
    
    if (state.trim().length !== 2) {
      throw new Error("O estado deve ser informado no formato de 2 letras (UF)");
    }
    
    // Verificar se já existe uma cidade com o mesmo nome e estado
    const existingCity = await this.cityRepository.getCityByName(name, state);
    if (existingCity) {
      throw new Error("Uma cidade com este nome e estado já existe");
    }
    
    // Criar a cidade
    return this.cityRepository.createCity({
      name: name.trim(),
      state: state.trim().toUpperCase()
    });
  }
}