import { injectable, inject } from "inversify";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { CityRepository } from "../../repositories/CityRepository";
import { TYPES } from "../../types";
import argon2 from "argon2";

@injectable()
export class InitializeAdminUseCase {
  constructor(
    @inject(TYPES.ProfessionalRepository) 
    private professionalRepository: ProfessionalRepository,
    @inject(TYPES.CityRepository) 
    private cityRepository: CityRepository
  ) {}

  async execute(): Promise<void> {
    if (await this.shouldCreateAdmin()) {
      await this.createAdmin();
    }
  }

  private async shouldCreateAdmin(): Promise<boolean> {
    const existingAdmins = await this.professionalRepository.getAllProfessionals();
    return !existingAdmins.some(p => p.profile === "GENERAL_ADMINISTRATOR");
  }

  private async createAdmin(): Promise<void> {
    const { PASSWORD_ADMIN, FULLNAME_ADMIN, CPF_ADMIN, PROFILE_ADMIN } = process.env;
    
    this.validateEnvVariables(PASSWORD_ADMIN, FULLNAME_ADMIN, CPF_ADMIN, PROFILE_ADMIN);
    
    const city = await this.getOrCreateCity("ARIQUEMES", "RO");
    const hashedPassword = await argon2.hash(PASSWORD_ADMIN!);

    await this.professionalRepository.createProfessional(null, {
      fullName: FULLNAME_ADMIN!,
      cpf: CPF_ADMIN!,
      profile: PROFILE_ADMIN!,
      password: hashedPassword,
      active: true,
      cityId: city.id
    });

    console.log("Administrator account created successfully");
}

  private validateEnvVariables(...vars: (string | undefined)[]): void {
    if (vars.some(v => !v)) {
      throw new Error("Missing ADMIN credentials environment variables");
    }
  }

  private async getOrCreateCity(name: string, state: string) {
    let city = await this.cityRepository.getCityByName(name, state);
    if (!city) {
      city = await this.cityRepository.createCity({ name, state });
      console.log("City created successfully");
    }
    return city;
  }
}