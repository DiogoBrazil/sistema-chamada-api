import { injectable, inject } from "inversify";
import { AttendanceRepository } from "../../repositories/AttendanceRepository";
import { ProfessionalRepository } from "../../repositories/ProfessionalRepository";
import { HealthUnitRepository } from "../../repositories/HealthUnitRepository";
import { PatientRepository } from "../../repositories/PatientRepository";
import { TYPES } from "../../types";
import { ICreateAttendanceDTO } from "../../interfaces/attendance/ICreateAttendanceDTO";
import { Attendance, AttendanceStage } from "@prisma/client";


@injectable()
export class CreateAttendanceUseCase {
  private attendanceRepository: AttendanceRepository;
  private professionalRepository: ProfessionalRepository;
  private patientRepository: PatientRepository;
  private healthUnitRepository: HealthUnitRepository;
  
  constructor(
    @inject(TYPES.AttendanceRepository) attendanceRepository: AttendanceRepository,
    @inject(TYPES.ProfessionalRepository) professionalRepository: ProfessionalRepository,
    @inject(TYPES.PatientRepository) patientRepository: PatientRepository,
    @inject(TYPES.HealthUnitRepository) healthUnitRepository: HealthUnitRepository
  ) {
    this.attendanceRepository = attendanceRepository;
    this.professionalRepository = professionalRepository;
    this.patientRepository = patientRepository;
    this.healthUnitRepository = healthUnitRepository;
  }
  
  async execute(data: ICreateAttendanceDTO): Promise<Attendance> {
    const { patientId, attendanceStage, professionalId, healthUnitId } = data;
    
    // Valida o estágio de atendimento
    const allowedStages = [String(AttendanceStage.TRIAGE), String(AttendanceStage.DENTAL_CONSULTATION), String(AttendanceStage.VACCINE)];
    if (!allowedStages.includes(attendanceStage)) {
      throw new Error("Invalid attendance stage");
    }
    
    // Verifica se o paciente existe
    const patient = await this.patientRepository.getPatientById(patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }
    
    // Verifica se o profissional existe
    const professional = await this.professionalRepository.getProfessionalById(professionalId);
    if (!professional) {
      throw new Error("Professional not found");
    }
    
    let targetHealthUnitId: number;
    
    if (healthUnitId) {
      // Se uma unidade de saúde foi especificada, verificar se ela existe
      const healthUnit = await this.healthUnitRepository.getHealthUnitById(healthUnitId);
      if (!healthUnit) {
        throw new Error("Health unit not found");
      }
      
      // Verifica se o profissional tem acesso à unidade especificada
      const hasAccess = await this.professionalRepository.checkProfessionalInHealthUnit(professionalId, healthUnitId);
      if (!hasAccess) {
        throw new Error("Professional does not have access to this health unite");
      }
      
      targetHealthUnitId = healthUnitId;
    } else {
      // Se nenhuma unidade foi especificada, usar a unidade do profissional
      const professionalWithUnits = await this.professionalRepository.getProfessionalWithHealthUnits(professionalId);
      
      if (!professionalWithUnits || !professionalWithUnits.healthUnit || professionalWithUnits.healthUnit.length === 0) {
        throw new Error("The professional is not linked to any health unit");
      }
      
      // Usa a primeira unidade do profissional
      // TODO: Implementar lógica para escolher a unidade correta
      targetHealthUnitId = professionalWithUnits.healthUnit[0].id;
    }
    
    return this.attendanceRepository.createAttendance(patientId, attendanceStage, targetHealthUnitId);
  }
}