export interface IForwardAttendanceDTO {
  attendanceId: number;
  targetStage: 'MEDICAL_CONSULTATION' | 'NURSING_CONSULTATION' | 'DENTAL_CONSULTATION' | 'VACCINE';
}