export const TYPES = {
    ProfessionalRepository: Symbol.for("ProfessionalRepository"),
    PatientRepository: Symbol.for("PatientRepository"),
    AttendanceRepository: Symbol.for("AttendanceRepository"),
    
    CreateProfessionalUseCase: Symbol.for("CreateProfessionalUseCase"),
    GetProfessionalsUseCase: Symbol.for("GetProfessionalsUseCase"),
    GetProfessionalByIdUseCase: Symbol.for("GetProfessionalByIdUseCase"),
    DeleteProfessionalUseCase: Symbol.for("DeleteProfessionalUseCase"),
    UpdateProfessionalUseCase: Symbol.for("UpdateProfessionalUseCase"),
    InitializeAdminUseCase: Symbol.for("InitializeAdminUseCase"),
    
    
    CreatePatientUseCase: Symbol.for("CreatePatientUseCase"),
    GetPatientsUseCase: Symbol.for("GetPatientsUseCase"),
    GetPatientByIdUseCase: Symbol.for("GetPatientByIdUseCase"),
    DeletePatientUseCase: Symbol.for("DeletePatientUseCase"),
    UpdatePatientUseCase: Symbol.for("UpdatePatientUseCase"),
    
    
    CreateAttendanceUseCase: Symbol.for("CreateAttendanceUseCase"),
    GetAttendancesUseCase: Symbol.for("GetAttendancesUseCase"),
    CallPatientUseCase: Symbol.for("CallPatientUseCase"),
    FinishAttendanceUseCase: Symbol.for("FinishAttendanceUseCase"),
    
    LoginProfessionalUseCase: Symbol.for("LoginProfessionalUseCase"),
    SetOfficeUseCase: Symbol.for("SetOfficeUseCase"),
    
    GetAttendanceReportUseCase: Symbol.for("GetAttendanceReportUseCase"),
  };
  