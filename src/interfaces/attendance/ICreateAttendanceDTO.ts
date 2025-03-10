export interface ICreateAttendanceDTO {
    patientId: number;
    attendanceStage: string;
    professionalId: number;
    healthUnitId?: number; 
  }