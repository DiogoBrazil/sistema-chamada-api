export const TYPES = {
  // Repositories
  ProfessionalRepository: Symbol.for("ProfessionalRepository"),
  PatientRepository: Symbol.for("PatientRepository"),
  AttendanceRepository: Symbol.for("AttendanceRepository"),
  PatientAddressRepository: Symbol.for("PatientAddressRepository"),
  ProfessionalAddressRepository: Symbol.for("ProfessionalAddressRepository"),
  
  // Use cases (professional)
  CreateProfessionalUseCase: Symbol.for("CreateProfessionalUseCase"),
  GetProfessionalsUseCase: Symbol.for("GetProfessionalsUseCase"),
  GetProfessionalByIdUseCase: Symbol.for("GetProfessionalByIdUseCase"),
  DeleteProfessionalUseCase: Symbol.for("DeleteProfessionalUseCase"),
  UpdateProfessionalUseCase: Symbol.for("UpdateProfessionalUseCase"),
  InitializeAdminUseCase: Symbol.for("InitializeAdminUseCase"),
  GetProfessionalByCpfUseCase: Symbol.for("GetProfessionalByCpfUseCase"),
  GetProfessionalByNameUseCase: Symbol.for("GetProfessionalByNameUseCase"),
  
  // Use cases (patient)
  CreatePatientUseCase: Symbol.for("CreatePatientUseCase"),
  GetPatientsUseCase: Symbol.for("GetPatientsUseCase"),
  GetPatientByIdUseCase: Symbol.for("GetPatientByIdUseCase"),
  GetPatientByCpfUseCase: Symbol.for("GetPatientByCpfUseCase"),
  GetPatientByNamesUseCase: Symbol.for("GetPatientByNamesUseCase"),
  DeletePatientUseCase: Symbol.for("DeletePatientUseCase"),
  UpdatePatientUseCase: Symbol.for("UpdatePatientUseCase"),
  
  // Use cases (attendance)
  CreateAttendanceUseCase: Symbol.for("CreateAttendanceUseCase"),
  GetAttendancesUseCase: Symbol.for("GetAttendancesUseCase"),
  CallPatientUseCase: Symbol.for("CallPatientUseCase"),
  FinishAttendanceUseCase: Symbol.for("FinishAttendanceUseCase"),
  
  GetTriageAttendancesUseCase: Symbol.for("GetTriageAttendancesUseCase"),
  GetMedicalConsultationAttendancesUseCase: Symbol.for("GetMedicalConsultationAttendancesUseCase"),
  GetNursingConsultationAttendancesUseCase: Symbol.for("GetNursingConsultationAttendancesUseCase"),
  GetDentalConsultationAttendancesUseCase: Symbol.for("GetDentalConsultationAttendancesUseCase"),
  GetVaccineAttendancesUseCase: Symbol.for("GetVaccineAttendancesUseCase"),
  ForwardAttendanceUseCase: Symbol.for("ForwardAttendanceUseCase"),
  SetAttendanceModeUseCase: Symbol.for("SetAttendanceModeUseCase"),
  
  // Use cases (address - patient)
  CreatePatientAddressUseCase: Symbol.for("CreatePatientAddressUseCase"),
  GetPatientAddressesUseCase: Symbol.for("GetPatientAddressesUseCase"),
  UpdatePatientAddressUseCase: Symbol.for("UpdatePatientAddressUseCase"),
  DeletePatientAddressUseCase: Symbol.for("DeletePatientAddressUseCase"),
  
  // Use cases (address - professional)
  CreateProfessionalAddressUseCase: Symbol.for("CreateProfessionalAddressUseCase"),
  GetProfessionalAddressesUseCase: Symbol.for("GetProfessionalAddressesUseCase"),
  UpdateProfessionalAddressUseCase: Symbol.for("UpdateProfessionalAddressUseCase"),
  DeleteProfessionalAddressUseCase: Symbol.for("DeleteProfessionalAddressUseCase"),
  
  // Use cases (auth)
  LoginProfessionalUseCase: Symbol.for("LoginProfessionalUseCase"),
  SetOfficeUseCase: Symbol.for("SetOfficeUseCase"),
  
  GetAttendanceReportUseCase: Symbol.for("GetAttendanceReportUseCase"),
};