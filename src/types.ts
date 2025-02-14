export const TYPES = {
    ProfessionalRepository: Symbol.for("ProfessionalRepository"),
    PatientRepository: Symbol.for("PatientRepository"),
    AttendanceRepository: Symbol.for("AttendanceRepository"),
    
    CreateProfessionalUseCase: Symbol.for("CreateProfessionalUseCase"),
    GetProfessionalsUseCase: Symbol.for("GetProfessionalsUseCase"),
    GetProfessionalByIdUseCase: Symbol.for("GetProfessionalByIdUseCase"),
    DeletePatientUseCase: Symbol.for("DeletePatientUseCase"),
    UpdatePatientUseCase: Symbol.for("UpdatePatientUseCase"),
    
    CreatePatientUseCase: Symbol.for("CreatePatientUseCase"),
    GetPatientsUseCase: Symbol.for("GetPatientsUseCase"),
    GetPatientByIdUseCase: Symbol.for("GetPatientByIdUseCase"),
    DeleteProfessionalUseCase: Symbol.for("DeleteProfessionalUseCase"),
    UpdateProfessionalUseCase: Symbol.for("UpdateProfessionalUseCase"),
    
    CreateAttendanceUseCase: Symbol.for("CreateAttendanceUseCase"),
    GetAttendancesUseCase: Symbol.for("GetAttendancesUseCase"),
    CallPatientUseCase: Symbol.for("CallPatientUseCase"),
    FinishAttendanceUseCase: Symbol.for("FinishAttendanceUseCase"),
    
    LoginProfessionalUseCase: Symbol.for("LoginProfessionalUseCase"),
    SetOfficeUseCase: Symbol.for("SetOfficeUseCase"),
    
    GetAttendanceReportUseCase: Symbol.for("GetAttendanceReportUseCase"),
  };
  