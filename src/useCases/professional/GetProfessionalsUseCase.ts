import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { CityRepository } from "../../repositories/CityRepository";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { TYPES } from "../../types";
import { IPaginatedProfessionalResult } from "../../interfaces/professional/IPaginatedProfessionalResult";
import { IGetProfessionalsDTO } from "../../interfaces/professional/IGetProfessionalsDTO";
import { ProfileType } from "../../constants/profilesTypes";



@injectable()
export class GetProfessionalsUseCase {
  private professionalRepository: ProfessionalRepository;
  private cityRepository: CityRepository;
  private healthUnitRepository: HealthUnitRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository,
    @inject(TYPES.CityRepository) cityRepository: CityRepository,
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository
  ) {
    this.professionalRepository = professionalRepository;
    this.cityRepository = cityRepository;
    this.healthUnitRepository = healthUnitRepository;
  }
  
  async execute(professionalId: number, data: IGetProfessionalsDTO, page: number): Promise<IPaginatedProfessionalResult> {
    const pageNumber = Math.max(1, page);

    // Verificar se a cidade existe
    const city = await this.cityRepository.getCityById(data.cityId);
    if (!city) {
      throw new Error("City not found");
    }

    // Verificar se a unidade de saúde existe
    const healthUnit = await this.healthUnitRepository.getHealthUnitById(data.healthUnitId);
    if (!healthUnit) {
      throw new Error("Health unit not found");
    }

    const professional = await this.professionalRepository.getProfessionalById(professionalId);
    if (!professional) {
      throw new Error("Professional not found");
    }

    // Verificar se o profissional tem permissão para acessar os dados da cidade e unidades de saúde
    if (professional.profile == ProfileType.GENERAL_LOCAL_ADMINISTRATOR) {
      if (professional.cityId !== data.cityId) {
        throw new Error("Professional does not have permission to access this city");
      }
      const healthUnits = await this.healthUnitRepository.getHealthUnitsByCityId(professional.cityId);
      if (!healthUnits.some(unit => unit.id == data.healthUnitId)) {
        throw new Error("Professional does not have permission to access this health unit");
      }
    } else if (professional.profile == ProfileType.LOCAL_ADMINISTRATOR) {
      const healthUnits = await this.healthUnitRepository.getHealthUnitsByCityId(professional.cityId);
      if (!healthUnits.some(unit => unit.id == data.healthUnitId)) {
        throw new Error("Professional does not have permission to access this health unit");
      }
    }
    
    const professionals = this.professionalRepository.getProfessionals(data, pageNumber);

    if ((await professionals).data.length == 0) {
      throw new Error("No professionals found");
    } else {
      return professionals;
    }
  }
}