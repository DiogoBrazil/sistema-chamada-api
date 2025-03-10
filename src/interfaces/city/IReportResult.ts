import { AttendanceHistory } from "@prisma/client";

export interface IReportResult {
    cityInfo: {
      id: number;
      name: string;
      state: string;
      healthUnitCount: number;
      professionalCount: number;
    };
    summary: {
      totalAttendances: number;
      finishedAttendances: number;
      averageDuration: number;  // Em minutos
      byStage: {
        triage: number;
        medicalConsultation: number;
        nursingConsultation: number;
        dentalConsultation: number;
        vaccine: number;
      };
    };
    attendances: AttendanceHistory[];
  }