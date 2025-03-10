export interface IHealthUnitAttendanceReportDTO {
    healthUnitId: number;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    professionalId?: number;
  }