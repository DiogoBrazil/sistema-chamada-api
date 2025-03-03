import { Container } from "inversify";
import "reflect-metadata";
import { TYPES } from "./types";

// Repositories
import { ProfessionalRepository } from "./repositories/ProfessionalRepository";
import { PatientRepository } from "./repositories/PatientRepository";
import { AttendanceRepository } from "./repositories/AttendanceRepository";
import { PatientAddressRepository } from "./repositories/PatientAddressRepository";
import { ProfessionalAddressRepository } from "./repositories/ProfessionalAddressRepository";

// Use cases (professional)
import { CreateProfessionalUseCase } from "./useCases/professional/CreateProfessionalUseCase";
import { GetProfessionalsUseCase } from "./useCases/professional/GetProfessionalsUseCase";
import { GetProfessionalByIdUseCase } from "./useCases/professional/GetProfessionalByIdUseCase";
import { DeleteProfessionalUseCase } from "./useCases/professional/DeleteProfessionalByIdUseCase";
import { UpdateProfessionalUseCase } from "./useCases/professional/UpdateProfessionalByIdUseCase";
import { InitializeAdminUseCase } from "./useCases/professional/InitializeAdminUseCase";
import { GetProfessionalByCpfUseCase } from "./useCases/professional/GetProfessionalByCpfUseCase";
import { GetProfessionalsByNameUseCase } from "./useCases/professional/GetProfessionalByNameUseCase";
import { SetAttendanceModeUseCase } from "./useCases/professional/SetAttendanceModeUseCase";

// Use cases (patient)
import { CreatePatientUseCase } from "./useCases/patient/CreatePatientUseCase";
import { GetPatientsUseCase } from "./useCases/patient/GetPatientsUseCase";
import { GetPatientByIdUseCase } from "./useCases/patient/GetPatientByIdUseCase";
import { DeletePatientUseCase } from "./useCases/patient/DeletePatientUseCase";
import { UpdatePatientUseCase } from "./useCases/patient/UpdatePatientUseCase";
import { GetPatientByCpfUseCase } from "./useCases/patient/GetPatientByCpfUseCase";
import { GetPatientsByNameUseCase } from "./useCases/patient/GetPatientsByNameUseCase";

// Use cases (attendance)
import { CreateAttendanceUseCase } from "./useCases/attendance/CreateAttendanceUseCase";
import { GetAttendancesUseCase } from "./useCases/attendance/GetAttendancesUseCase";
import { CallPatientUseCase } from "./useCases/attendance/CallPatientUseCase";
import { FinishAttendanceUseCase } from "./useCases/attendance/FinishAttendanceUseCase";
import { GetAttendanceReportUseCase } from "./useCases/attendance/GetAttendanceReportUseCase";
import { GetTriageAttendancesUseCase } from "./useCases/attendance/GetTriageAttendancesUseCase";
import { GetMedicalConsultationAttendancesUseCase } from "./useCases/attendance/GetMedicalConsultationAttendancesUseCase";
import { GetNursingConsultationAttendancesUseCase } from "./useCases/attendance/GetNursingConsultationAttendancesUseCase";
import { GetDentalConsultationAttendancesUseCase } from "./useCases/attendance/GetDentalConsultationAttendancesUseCase";
import { GetVaccineAttendancesUseCase } from "./useCases/attendance/GetVaccineAttendancesUseCase";
import { ForwardAttendanceUseCase } from "./useCases/attendance/ForwardAttendanceUseCase";

// Use cases (auth)
import { LoginProfessionalUseCase } from "./useCases/professional/LoginProfessionalUseCase";
import { SetOfficeUseCase } from "./useCases/professional/SetOfficeUseCase";

// Use cases (address - patient)
import { CreatePatientAddressUseCase } from "./useCases/address/patient/CreatePatientAddressUseCase";
import { GetPatientAddressesUseCase } from "./useCases/address/patient/GetPatientAddressesUseCase";
import { UpdatePatientAddressUseCase } from "./useCases/address/patient/UpdatePatientAddressUseCase";
import { DeletePatientAddressUseCase } from "./useCases/address/patient/DeletePatientAddressUseCase";

// Use cases (address - professional)
import { CreateProfessionalAddressUseCase } from "./useCases/address/professional/CreateProfessionalAddressUseCase";
import { GetProfessionalAddressesUseCase } from "./useCases/address/professional/GetProfessionalAddressesUseCase";
import { UpdateProfessionalAddressUseCase } from "./useCases/address/professional/UpdateProfessionalAddressUseCase";
import { DeleteProfessionalAddressUseCase } from "./useCases/address/professional/DeleteProfessionalAddressUseCase";

const container = new Container();

// Repository bindings
container.bind(TYPES.ProfessionalRepository).to(ProfessionalRepository).inSingletonScope();
container.bind(TYPES.PatientRepository).to(PatientRepository).inSingletonScope();
container.bind(TYPES.AttendanceRepository).to(AttendanceRepository).inSingletonScope();
container.bind(TYPES.PatientAddressRepository).to(PatientAddressRepository).inSingletonScope();
container.bind(TYPES.ProfessionalAddressRepository).to(ProfessionalAddressRepository).inSingletonScope();

// Use case bindings (professional)
container.bind(TYPES.CreateProfessionalUseCase).to(CreateProfessionalUseCase);
container.bind(TYPES.GetProfessionalsUseCase).to(GetProfessionalsUseCase);
container.bind(TYPES.GetProfessionalByIdUseCase).to(GetProfessionalByIdUseCase);
container.bind(TYPES.LoginProfessionalUseCase).to(LoginProfessionalUseCase);
container.bind(TYPES.SetOfficeUseCase).to(SetOfficeUseCase);
container.bind(TYPES.DeleteProfessionalUseCase).to(DeleteProfessionalUseCase);
container.bind(TYPES.UpdateProfessionalUseCase).to(UpdateProfessionalUseCase);
container.bind(TYPES.InitializeAdminUseCase).to(InitializeAdminUseCase);
container.bind(TYPES.GetProfessionalByCpfUseCase).to(GetProfessionalByCpfUseCase);
container.bind(TYPES.GetProfessionalByNameUseCase).to(GetProfessionalsByNameUseCase);
container.bind(TYPES.SetAttendanceModeUseCase).to(SetAttendanceModeUseCase);

// Use case bindings (patient)
container.bind(TYPES.CreatePatientUseCase).to(CreatePatientUseCase);
container.bind(TYPES.GetPatientsUseCase).to(GetPatientsUseCase);
container.bind(TYPES.GetPatientByIdUseCase).to(GetPatientByIdUseCase);
container.bind(TYPES.DeletePatientUseCase).to(DeletePatientUseCase);
container.bind(TYPES.UpdatePatientUseCase).to(UpdatePatientUseCase);
container.bind(TYPES.GetPatientByCpfUseCase).to(GetPatientByCpfUseCase);
container.bind(TYPES.GetPatientByNamesUseCase).to(GetPatientsByNameUseCase);

// Use case bindings (attendance)
container.bind(TYPES.CreateAttendanceUseCase).to(CreateAttendanceUseCase);
container.bind(TYPES.GetAttendancesUseCase).to(GetAttendancesUseCase);
container.bind(TYPES.CallPatientUseCase).to(CallPatientUseCase);
container.bind(TYPES.FinishAttendanceUseCase).to(FinishAttendanceUseCase);
container.bind(TYPES.GetAttendanceReportUseCase).to(GetAttendanceReportUseCase);
container.bind(TYPES.GetTriageAttendancesUseCase).to(GetTriageAttendancesUseCase);
container.bind(TYPES.GetMedicalConsultationAttendancesUseCase).to(GetMedicalConsultationAttendancesUseCase);
container.bind(TYPES.GetNursingConsultationAttendancesUseCase).to(GetNursingConsultationAttendancesUseCase);
container.bind(TYPES.GetDentalConsultationAttendancesUseCase).to(GetDentalConsultationAttendancesUseCase);
container.bind(TYPES.GetVaccineAttendancesUseCase).to(GetVaccineAttendancesUseCase);
container.bind(TYPES.ForwardAttendanceUseCase).to(ForwardAttendanceUseCase);

// Use case bindings (address - patient)
container.bind(TYPES.CreatePatientAddressUseCase).to(CreatePatientAddressUseCase);
container.bind(TYPES.GetPatientAddressesUseCase).to(GetPatientAddressesUseCase);
container.bind(TYPES.UpdatePatientAddressUseCase).to(UpdatePatientAddressUseCase);
container.bind(TYPES.DeletePatientAddressUseCase).to(DeletePatientAddressUseCase);

// Use case bindings (address - professional)
container.bind(TYPES.CreateProfessionalAddressUseCase).to(CreateProfessionalAddressUseCase);
container.bind(TYPES.GetProfessionalAddressesUseCase).to(GetProfessionalAddressesUseCase);
container.bind(TYPES.UpdateProfessionalAddressUseCase).to(UpdateProfessionalAddressUseCase);
container.bind(TYPES.DeleteProfessionalAddressUseCase).to(DeleteProfessionalAddressUseCase);

export { container };