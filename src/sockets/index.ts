import { Server } from 'socket.io';
import { Attendance, AttendanceStage } from '@prisma/client';

let ioInstance: Server;

export default function socketHandler(io: Server) {
  ioInstance = io;
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    // Sala para triagem
    socket.on('joinTriageRoom', () => {
      socket.join('triage');
      console.log(`Socket ${socket.id} joined triage room`);
    });
    
    // Sala para consulta médica
    socket.on('joinMedicalRoom', () => {
      socket.join('medical');
      console.log(`Socket ${socket.id} joined medical room`);
    });
    
    // Sala para consulta de enfermagem
    socket.on('joinNursingRoom', () => {
      socket.join('nursing');
      console.log(`Socket ${socket.id} joined nursing room`);
    });
    
    // Sala para consulta odontológica
    socket.on('joinDentalRoom', () => {
      socket.join('dental');
      console.log(`Socket ${socket.id} joined dental room`);
    });
    
    // Sala para vacinação
    socket.on('joinVaccineRoom', () => {
      socket.join('vaccine');
      console.log(`Socket ${socket.id} joined vaccine room`);
    });
    
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

export function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.IO não foi inicializado");
  }
  return ioInstance;
}

// Função para emitir um evento de chamada de paciente com informações do estágio
export function emitCallPatient(attendance: Attendance & { patient?: any }) {
  if (!ioInstance) {
    throw new Error("Socket.IO não foi inicializado");
  }
  
  // Emite o evento para todos os clientes (painel sempre receberá)
  ioInstance.emit("callPatient", attendance);
  
  // Também emite eventos específicos por tipo de atendimento
  // para permitir que o frontend reaja de acordo com o estágio
  switch (attendance.stage) {
    case AttendanceStage.TRIAGE:
      ioInstance.to('triage').emit("triageCallPatient", attendance);
      break;
    case AttendanceStage.MEDICAL_CONSULTATION:
      ioInstance.to('medical').emit("medicalCallPatient", attendance);
      break;
    case AttendanceStage.NURSING_CONSULTATION:
      ioInstance.to('nursing').emit("nursingCallPatient", attendance);
      break;
    case AttendanceStage.DENTAL_CONSULTATION:
      ioInstance.to('dental').emit("dentalCallPatient", attendance);
      break;
    case AttendanceStage.VACCINE:
      ioInstance.to('vaccine').emit("vaccineCallPatient", attendance);
      break;
  }
  
  console.log(`Patient call emitted: ID ${attendance.patientId} - Stage: ${attendance.stage}`);
  if (attendance.patient) {
    console.log(`Patient details: ${JSON.stringify(attendance.patient)}`);
  }
}