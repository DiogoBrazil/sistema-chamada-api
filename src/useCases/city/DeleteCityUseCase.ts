import { injectable, inject } from "inversify";
import { CityRepository } from "../../repositories/CityRepository";
import { TYPES } from "../../types";

@injectable()
export class DeleteCityUseCase {
  private cityRepository: CityRepository;
  
  constructor(
    @inject(TYPES.CityRepository) cityRepository: CityRepository
  ) {
    this.cityRepository = cityRepository;
  }
  
  async execute(id: number): Promise<void> {
    // Validar o ID
    if (isNaN(id) || id <= 0) {
      throw new Error("ID de cidade inválido");
    }
    
    // Verificar se a cidade existe
    const city = await this.cityRepository.getCityById(id);
    if (!city) {
      throw new Error("Cidade não encontrada");
    }
    
    // Verificar dependências (unidades de saúde e profissionais)
    if (city.healthUnits && city.healthUnits.length > 0) {
      throw new Error("Não é possível excluir uma cidade que possui unidades de saúde associadas");
    }
    
    const professionalCount = await this.cityRepository.getProfessionalCountByCity(id);
    if (professionalCount > 0) {
      throw new Error("Não é possível excluir uma cidade que possui profissionais associados");
    }
    
    // Excluir a cidade
    await this.cityRepository.deleteCity(id);
  }
}