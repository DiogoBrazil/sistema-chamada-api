import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { TYPES } from "../../types";

@injectable()
export class DeleteProfessionalUseCase {
  private professionalRepository: ProfessionalRepository;
  private healthUnitRepository: HealthUnitRepository;
  
  constructor(
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository,
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository
  ) {
    this.professionalRepository = professionalRepository;
    this.healthUnitRepository = healthUnitRepository;
  }
  
  async execute(id: number, adminId: number, userProfile: string): Promise<void> {

    const professional = await this.professionalRepository.getProfessionalById(id);

    if (!professional) {
      throw new Error("Professional not found");
    }

    if (userProfile == 'GENERAL_LOCAL_ADMINISTRATOR') {
      //Verificar se o profissional pertence a mesma cidade do administrador
      const admin = await this.professionalRepository.getProfessionalById(adminId);
      if (!admin) {
        throw new Error("Admin not found");
      }
      if (admin.cityId !== professional.cityId) {
        throw new Error("You can only delete professionals from your city");
      }
    } else if (userProfile === 'LOCAL_ADMINISTRATOR') {
      const adminHealthUnits = await this.professionalRepository.getAdminHealthUnits(adminId);
      const professionalHealthUnits = await this.professionalRepository.getAdminHealthUnits(id);
      
      const hasSharedUnit = professionalHealthUnits.some(unit => 
        adminHealthUnits.some(adminUnit => adminUnit.id === unit.id)
      );
      
      if (!hasSharedUnit) {
        throw new Error("You can only delete professionals from your health unit");
      }
    }

    // Verifica se tem atendimentos ativos
    const hasActiveAttendances = await this.professionalRepository.hasActiveAttendances(id);
    if (hasActiveAttendances) {
      throw new Error("Cannot delete a professional with active attendances");
    }

    await this.professionalRepository.deleteProfessional(id);
  }
}