import { AttendanceStage } from "@prisma/client";

export interface IGetAttendancesDTO {
    professionalId: number;
    healthUnitId?: number;
    cityId?: number;
    stage?: AttendanceStage;
  }