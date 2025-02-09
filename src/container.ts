import { Container } from "inversify";
import "reflect-metadata";
import { TYPES } from "./types";

// Repositories
import { ProfessionalRepository } from "./repositories/ProfessionalRepository";
import { PatientRepository } from "./repositories/PatientRepository";
import { AttendanceRepository } from "./repositories/AttendanceRepository";

// Use cases (professional)
import { CreateProfessionalUseCase } from "./useCases/professional/CreateProfessionalUseCase";
import { GetProfessionalsUseCase } from "./useCases/professional/GetProfessionalsUseCase";
import { GetProfessionalByIdUseCase } from "./useCases/professional/GetProfessionalByIdUseCase";

// Use cases (patient)
import { CreatePatientUseCase } from "./useCases/patient/CreatePatientUseCase";
import { GetPatientsUseCase } from "./useCases/patient/GetPatientsUseCase";
import { GetPatientByIdUseCase } from "./useCases/patient/GetPatientByIdUseCase";

// Use cases (attendance)
import { CreateAttendanceUseCase } from "./useCases/attendance/CreateAttendanceUseCase";
import { GetAttendancesUseCase } from "./useCases/attendance/GetAttendancesUseCase";
import { CallPatientUseCase } from "./useCases/attendance/CallPatientUseCase";
import { FinishAttendanceUseCase } from "./useCases/attendance/FinishAttendanceUseCase";
import { GetAttendanceReportUseCase } from "./useCases/attendance/GetAttendanceReportUseCase";

// Use cases (auth)
import { LoginProfessionalUseCase } from "./useCases/professional/LoginProfessionalUseCase";
import { SetOfficeUseCase } from "./useCases/professional/SetOfficeUseCase";

const container = new Container();

// Repository bindings
container.bind(TYPES.ProfessionalRepository).to(ProfessionalRepository).inSingletonScope();
container.bind(TYPES.PatientRepository).to(PatientRepository).inSingletonScope();
container.bind(TYPES.AttendanceRepository).to(AttendanceRepository).inSingletonScope();

// Use case bindings (professional)
container.bind(TYPES.CreateProfessionalUseCase).to(CreateProfessionalUseCase);
container.bind(TYPES.GetProfessionalsUseCase).to(GetProfessionalsUseCase);
container.bind(TYPES.GetProfessionalByIdUseCase).to(GetProfessionalByIdUseCase);
container.bind(TYPES.LoginProfessionalUseCase).to(LoginProfessionalUseCase);
container.bind(TYPES.SetOfficeUseCase).to(SetOfficeUseCase);

// Use case bindings (patient)
container.bind(TYPES.CreatePatientUseCase).to(CreatePatientUseCase);
container.bind(TYPES.GetPatientsUseCase).to(GetPatientsUseCase);
container.bind(TYPES.GetPatientByIdUseCase).to(GetPatientByIdUseCase);

// Use case bindings (attendance)
container.bind(TYPES.CreateAttendanceUseCase).to(CreateAttendanceUseCase);
container.bind(TYPES.GetAttendancesUseCase).to(GetAttendancesUseCase);
container.bind(TYPES.CallPatientUseCase).to(CallPatientUseCase);
container.bind(TYPES.FinishAttendanceUseCase).to(FinishAttendanceUseCase);
container.bind(TYPES.GetAttendanceReportUseCase).to(GetAttendanceReportUseCase);

export { container };
