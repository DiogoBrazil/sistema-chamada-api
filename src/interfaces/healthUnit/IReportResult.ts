import { AttendanceHistory } from "@prisma/client";

export interface IReportResult {
    healthUnitInfo: {
      id: number;
      name: string;
      cityName: string;
      cityState: string;
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