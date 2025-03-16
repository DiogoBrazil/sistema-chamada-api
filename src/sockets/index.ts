import { Server } from 'socket.io';
import { Attendance, AttendanceStage } from '@prisma/client';

let ioInstance: Server;

export default function socketHandler(io: Server) {
  ioInstance = io;
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    // Cliente se identifica com sua unidade de saúde
    socket.on('identifyHealthUnit', (healthUnitId) => {
      // Juntar à sala da unidade de saúde
      socket.join(`healthUnit_${healthUnitId}`);
      console.log(`Socket ${socket.id} identified with health unit ${healthUnitId}`);
    });
    
    // Cliente se identifica com um estágio específico em uma unidade
    socket.on('identifyStage', (data: {healthUnitId: number, stage: string}) => {
      const { healthUnitId, stage } = data;
      
      // Juntar à sala da unidade + estágio
      socket.join(`healthUnit_${healthUnitId}_${stage}`);
      console.log(`Socket ${socket.id} identified with stage ${stage} in health unit ${healthUnitId}`);
    });
    
    // Para compatibilidade com código existente - salas de estágio global
    socket.on('joinTriageRoom', () => {
      socket.join('triage');
      console.log(`Socket ${socket.id} joined global triage room`);
    });
    
    socket.on('joinMedicalRoom', () => {
      socket.join('medical');
      console.log(`Socket ${socket.id} joined global medical room`);
    });
    
    socket.on('joinNursingRoom', () => {
      socket.join('nursing');
      console.log(`Socket ${socket.id} joined global nursing room`);
    });
    
    socket.on('joinDentalRoom', () => {
      socket.join('dental');
      console.log(`Socket ${socket.id} joined global dental room`);
    });
    
    socket.on('joinVaccineRoom', () => {
      socket.join('vaccine');
      console.log(`Socket ${socket.id} joined global vaccine room`);
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

// Interface para tipagem do payload enriquecido
interface AttendanceWithExtras extends Attendance {
  patient?: {
    id: number;
    fullName: string;
    socialName: string;
    cpf: string;
    [key: string]: any;
  };
  healthUnit?: {
    id: number;
    name: string;
    city?: {
      id: number;
      name: string;
      state: string;
    };
    [key: string]: any;
  };
  cityInfo?: {
    id: number;
    name: string;
    state: string;
  };
}

// Função para emitir um evento de chamada de paciente com informações do estágio
export function emitCallPatient(attendance: AttendanceWithExtras) {
  if (!ioInstance) {
    throw new Error("Socket.IO não foi inicializado");
  }
  
  // Emite evento apenas para a unidade de saúde específica
  if (attendance.healthUnitId) {
    // Emite para a sala da unidade de saúde
    ioInstance.to(`healthUnit_${attendance.healthUnitId}`).emit("healthUnitCallPatient", attendance);
    
    // Emite para a sala específica da unidade + estágio
    const roomPrefix = `healthUnit_${attendance.healthUnitId}`;
    
    switch (attendance.stage) {
      case AttendanceStage.TRIAGE:
        ioInstance.to(`${roomPrefix}_triage`).emit("triageCallPatient", attendance);
        break;
      case AttendanceStage.MEDICAL_CONSULTATION:
        ioInstance.to(`${roomPrefix}_medical`).emit("medicalCallPatient", attendance);
        break;
      case AttendanceStage.NURSING_CONSULTATION:
        ioInstance.to(`${roomPrefix}_nursing`).emit("nursingCallPatient", attendance);
        break;
      case AttendanceStage.DENTAL_CONSULTATION:
        ioInstance.to(`${roomPrefix}_dental`).emit("dentalCallPatient", attendance);
        break;
      case AttendanceStage.VACCINE:
        ioInstance.to(`${roomPrefix}_vaccine`).emit("vaccineCallPatient", attendance);
        break;
    }
  }
  
  // Log detalhado
  console.log(`Patient call emitted: ID ${attendance.patientId} - Stage: ${attendance.stage} - HealthUnit: ${attendance.healthUnitId}`);
  
  // Log da cidade, se disponível
  if (attendance.cityInfo) {
    console.log(`City: ${attendance.cityInfo.name}/${attendance.cityInfo.state}`);
  } else if (attendance.healthUnit?.city) {
    console.log(`City: ${attendance.healthUnit.city.name}/${attendance.healthUnit.city.state}`);
  }
  
  // Log do nome do paciente, se disponível
  if (attendance.patient) {
    console.log(`Patient: ${attendance.patient.fullName}`);
  }
}

// Função para emitir atualizações de fila de atendimento
export function emitQueueUpdate(healthUnitId: number, stage: string, count: number) {
  if (!ioInstance) {
    throw new Error("Socket.IO não foi inicializado");
  }
  
  // Emite atualização para a unidade específica
  ioInstance.to(`healthUnit_${healthUnitId}`).emit("queueUpdate", { 
    healthUnitId, 
    stage, 
    count 
  });
  
  // Emite atualização para a unidade específica + estágio
  ioInstance.to(`healthUnit_${healthUnitId}_${stage}`).emit("stageQueueUpdate", { 
    healthUnitId, 
    stage, 
    count 
  });
  
  // Para compatibilidade com salas globais
  switch (stage) {
    case 'TRIAGE':
      ioInstance.to('triage').emit("triageQueueUpdate", { healthUnitId, count });
      break;
    case 'MEDICAL_CONSULTATION':
      ioInstance.to('medical').emit("medicalQueueUpdate", { healthUnitId, count });
      break;
    case 'NURSING_CONSULTATION':
      ioInstance.to('nursing').emit("nursingQueueUpdate", { healthUnitId, count });
      break;
    case 'DENTAL_CONSULTATION':
      ioInstance.to('dental').emit("dentalQueueUpdate", { healthUnitId, count });
      break;
    case 'VACCINE':
      ioInstance.to('vaccine').emit("vaccineQueueUpdate", { healthUnitId, count });
      break;
  }
  
  console.log(`Queue update emitted: HealthUnit ${healthUnitId} - Stage ${stage} - Count: ${count}`);
}

// Função para emitir atualização de status do atendimento
export function emitAttendanceStatusUpdate(attendance: AttendanceWithExtras) {
  if (!ioInstance) {
    throw new Error("Socket.IO not initialized");
  }
  
  // Emite para todos os clientes
  ioInstance.emit("attendanceStatusUpdate", attendance);
  
  // Emite para a unidade específica
  if (attendance.healthUnitId) {
    ioInstance.to(`healthUnit_${attendance.healthUnitId}`).emit("healthUnitAttendanceStatusUpdate", attendance);
  }
  
  console.log(`Attendance status update emitted: ID ${attendance.id} - Status: ${attendance.status}`);
}



